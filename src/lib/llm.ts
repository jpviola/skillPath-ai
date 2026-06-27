// Layer 1 / Layer 3 — LLM service. Uses the AI SDK with the Vercel AI Gateway
// ("provider/model" string), so only AI_GATEWAY_API_KEY is required.
import { generateText, streamObject, tool, type LanguageModel } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import {
  planSchema,
  adaptationResponseSchema,
  placementResponseSchema,
  type PlanSchema,
  type AdaptationResponse,
  type PlacementResponse,
} from "./schema";
import { buildPromptWithFeedback } from "./prompt";
import type { UserProfile, Feedback } from "./types";

export interface WeekSummary {
  week_number: number;
  title: string;
  milestone: string;
}

/**
 * Resolve the LLM to use:
 *  - If MINIMAX_API_KEY is set → call MiniMax directly via its OpenAI-compatible
 *    endpoint. MiniMax doesn't document JSON-schema response_format, but it
 *    supports tool calling; the openai-compatible provider defaults to
 *    tool-mode object generation, which is what we rely on.
 *  - Otherwise → use the Vercel AI Gateway with a "provider/model" string.
 */
function resolveModel(): LanguageModel {
  if (process.env.MINIMAX_API_KEY) {
    const minimax = createOpenAICompatible({
      name: "minimax",
      baseURL: process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1",
      apiKey: process.env.MINIMAX_API_KEY,
      // MiniMax M3 is a reasoning model that otherwise emits <think> blocks into
      // the content, which breaks JSON parsing. Disable thinking and give the
      // generation enough room for a full multi-week plan.
      fetch: async (url, options) => {
        if (options && typeof options.body === "string") {
          try {
            const body = JSON.parse(options.body);
            body.thinking = { type: "disabled" };
            if (!body.max_completion_tokens) {
              body.max_completion_tokens = Number(process.env.LLM_MAX_TOKENS || 24000);
            }
            options = { ...options, body: JSON.stringify(body) };
          } catch {
            /* leave body untouched if it isn't JSON */
          }
        }
        return fetch(url, options);
      },
    });
    return minimax(process.env.LLM_MODEL || "MiniMax-M3");
  }
  return process.env.LLM_MODEL || "anthropic/claude-sonnet-4-6";
}

const MODEL = resolveModel();

/** Strip control chars and cap length to keep user text safe inside the prompt. */
function sanitize(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001F]/g, " ").slice(0, 600).trim();
}

function sanitizeProfile(p: UserProfile): UserProfile {
  return {
    ...p,
    skill: sanitize(p.skill),
    goal: sanitize(p.goal),
    time_available: sanitize(p.time_available),
  };
}

/**
 * Structured generation via forced tool calling. More reliable than JSON-mode
 * across providers — MiniMax M3 in particular ignores response_format:json_object
 * but honors tool calls. The SDK validates the tool input against the schema.
 */
async function generateStructured<T>(
  schema: z.ZodType<T>,
  system: string,
  prompt: string
): Promise<T> {
  const result = await generateText({
    model: MODEL,
    system,
    prompt,
    temperature: 0.3,
    tools: {
      submit_plan: tool({
        description: "Submit the final structured result. Always call this exactly once.",
        inputSchema: schema,
      }),
    },
    toolChoice: { type: "tool", toolName: "submit_plan" },
  });

  const call = result.toolCalls?.[0];
  if (!call) throw new Error("Model did not return a structured tool call.");
  return call.input as T;
}

const MIN_WEEKS = 8;
const RETRY_INSTRUCTION = `

REMINDER: Your previous attempt was incomplete. You MUST output a full plan of at least ${MIN_WEEKS} weeks, each with 3-5 topics that all have at least one resource. Do not stop early.`;

/**
 * Generate, then retry ONCE if the model under-delivered (too few weeks, or a
 * week with no topics). M3 occasionally returns a sparse plan; a single nudged
 * retry recovers it without doubling latency in the common case.
 */
async function generateWithRetry(system: string, prompt: string): Promise<PlanSchema> {
  const isComplete = (p: PlanSchema) =>
    p.weeks.length >= MIN_WEEKS && p.weeks.every((w) => w.topics.length >= 1);

  let plan = await generateStructured(planSchema, system, prompt);
  if (!isComplete(plan)) {
    plan = await generateStructured(planSchema, system + RETRY_INSTRUCTION, prompt);
  }
  return plan;
}

export async function generateLearningPlan(
  rawProfile: UserProfile,
  feedbackHistory: Feedback[] = []
): Promise<PlanSchema> {
  const userProfile = sanitizeProfile(rawProfile);
  const { systemPrompt } = buildPromptWithFeedback(userProfile, feedbackHistory);

  const object = await generateWithRetry(
    systemPrompt,
    JSON.stringify({
      ...userProfile,
      feedback_history: feedbackHistory.length > 0 ? feedbackHistory : undefined,
    })
  );

  // Ensure a stable plan_id even if the model omits/duplicates it.
  if (!object.plan_id || object.plan_id.length < 8) {
    object.plan_id = randomUUID();
  }
  // Reconcile total_weeks with what was actually generated (models sometimes
  // claim more weeks than they emit, or exceed the 8-16 range).
  object.weeks.sort((a, b) => a.week_number - b.week_number);
  object.total_weeks = object.weeks.length;
  return object;
}

/**
 * Token-efficient adaptation: regenerates ONLY weeks (currentWeek+1 .. totalWeeks)
 * instead of the whole plan, using the completed weeks as continuity context.
 */
export async function adaptRemainingPlan(
  rawProfile: UserProfile,
  feedbackHistory: Feedback[],
  currentWeekNumber: number,
  totalWeeks: number,
  completedWeeks: WeekSummary[]
): Promise<AdaptationResponse> {
  const userProfile = sanitizeProfile(rawProfile);
  const { systemPrompt } = buildPromptWithFeedback(userProfile, feedbackHistory);

  const firstWeek = currentWeekNumber + 1;
  const instruction = `
ADAPTATION TASK: The learner has completed weeks 1..${currentWeekNumber}. Generate ONLY the
remaining weeks numbered ${firstWeek} through ${totalWeeks} (inclusive). Do NOT regenerate the
completed weeks. Keep continuity with what they've already mastered (listed below). Apply the
feedback-driven adaptation rules. Number weeks correctly starting at ${firstWeek}.

ALREADY COMPLETED (for continuity, do not repeat):
${completedWeeks.map((w) => `- Week ${w.week_number}: ${w.title} — ${w.milestone}`).join("\n")}`;

  const adaptPrompt = JSON.stringify({ ...userProfile, feedback_history: feedbackHistory });
  let object = await generateStructured(
    adaptationResponseSchema,
    systemPrompt + instruction,
    adaptPrompt
  );

  // Keep only weeks strictly after the current one, in order.
  const clean = (o: AdaptationResponse) =>
    o.weeks.filter((w) => w.week_number > currentWeekNumber).sort((a, b) => a.week_number - b.week_number);

  // Retry once if the model returned no usable remaining weeks.
  if (clean(object).length === 0) {
    object = await generateStructured(
      adaptationResponseSchema,
      systemPrompt + instruction + "\n\nREMINDER: You MUST output the remaining weeks in full. Do not return an empty plan.",
      adaptPrompt
    );
  }
  object.weeks = clean(object);
  return object;
}

/**
 * Generate a short CEFR placement test for the target language: one increasing-
 * difficulty multiple-choice question per level (A1 → C2). Answers are returned
 * so the client can score locally (no second LLM call).
 */
export async function generatePlacementTest(rawLanguage: string): Promise<PlacementResponse> {
  const language = sanitize(rawLanguage);
  const system = `You are a CEFR language-placement test designer. Create a short multiple-choice test to estimate a learner's level in ${language}.

REQUIREMENTS:
- Output EXACTLY 6 questions, one for each CEFR level in this order: A1, A2, B1, B2, C1, C2 (increasing difficulty).
- Each question tests realistic comprehension/usage at that level (grammar, vocabulary, or reading) and is written in ${language}.
- Provide exactly 4 options and answer_index (0-3) pointing to the single correct option.
- Make distractors plausible. Keep each question concise (one sentence or a short gap-fill).
- Set each question's "level" field to the CEFR level it targets.`;

  const object = await generateStructured(
    placementResponseSchema,
    system,
    `Create the 6-question CEFR placement test for: ${language}`
  );
  // Defensive: cap to a sensible number and keep order by CEFR level.
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  object.questions = object.questions
    .slice(0, 12)
    .sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  return object;
}

/**
 * Streaming variant — emits partial objects so the UI can render weeks as they
 * arrive. Returns the streamObject result; the caller turns it into a Response.
 */
export function streamLearningPlan(rawProfile: UserProfile, feedbackHistory: Feedback[] = []) {
  const userProfile = sanitizeProfile(rawProfile);
  const { systemPrompt } = buildPromptWithFeedback(userProfile, feedbackHistory);

  return streamObject({
    model: MODEL,
    schema: planSchema,
    system: systemPrompt,
    temperature: 0.3,
    prompt: JSON.stringify({
      ...userProfile,
      feedback_history: feedbackHistory.length > 0 ? feedbackHistory : undefined,
    }),
  });
}
