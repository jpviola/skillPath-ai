// Layer 1 — Strict zod schema mirroring the OUTPUT JSON SCHEMA.
// Used by generateObject to force structured, valid output from the LLM.
import { z } from "zod";

export const resourceSchema = z.object({
  title: z.string(),
  url: z.string().describe("empty string if unknown"),
  type: z.enum(["Video", "Podcast", "Article", "App", "Interactive", "Flashcards"]),
  cost: z.enum(["Free", "Low", "Premium"]),
  preferred: z.boolean().describe("true if best match for the user's preferences"),
  // Populated only for OCR-ingested documents (PDF2LLM); the LLM leaves it out.
  // Kept on the schema so stored plans carrying ingested resources still validate.
  content: z.string().optional(),
});

export const topicSchema = z.object({
  name: z.string(),
  type: z.enum([
    "Vocabulary",
    "Grammar",
    "Listening",
    "Speaking",
    "Reading",
    "Writing",
    "Pronunciation",
    "Culture",
    "Review",
    "Assessment",
  ]),
  estimated_minutes: z.number().int(),
  resources: z.array(resourceSchema),
});

export const weekSchema = z.object({
  week_number: z.number().int(),
  title: z.string(),
  objective: z.string().describe("one sentence, what the user will achieve"),
  topics: z.array(topicSchema),
  total_time_minutes: z.number().int(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  milestone: z.string().describe("competency gained this week"),
});

export const planSchema = z.object({
  plan_id: z.string().describe("uuid"),
  skill: z.string(),
  total_weeks: z.number().int().describe("8-16 depending on goal"),
  weekly_time_hours: z.number(),
  weeks: z.array(weekSchema),
  estimated_total_cost: z.string().describe('e.g. "$0 (all free resources)"'),
  adaptation_note: z.string().describe("only if feedback was provided: what changed and why"),
});

export type PlanSchema = z.infer<typeof planSchema>;

// ---- Input validation (Layer 3) ----
export const profileInputSchema = z.object({
  skill: z.string().min(1).max(120), // target language
  current_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  goal: z.string().min(1).max(600),
  time_available: z.string().min(1).max(60),
  learning_style: z
    .array(z.enum(["Conversation", "Listening", "Reading", "Apps & games"]))
    .min(1),
  resource_preference: z.enum(["Free only", "Free + Low cost", "Any"]),
  // Native-mastery track (optional).
  track: z.enum(["acquisition", "native_mastery"]).optional(),
  focus_areas: z
    .array(
      z.enum([
        "Advanced grammar",
        "Culture",
        "Language history",
        "Literature",
        "Vocabulary",
        "Morphology",
        "Professional writing",
        "Creative writing",
      ])
    )
    .optional(),
});

export const feedbackInputSchema = z.object({
  week_number: z.number().int().min(1),
  difficulty: z.enum(["Too Easy", "Just Right", "Too Hard"]),
  comment: z.string().max(600).default(""),
  completed: z.boolean().default(false),
});

// Summary of an already-completed week — given to the model as context so the
// regenerated weeks keep continuity without re-sending full topic data.
export const weekSummarySchema = z.object({
  week_number: z.number().int(),
  title: z.string(),
  milestone: z.string(),
});

export const feedbackRequestSchema = z.object({
  profile: profileInputSchema,
  feedback_history: z.array(feedbackInputSchema).min(1),
  current_week_number: z.number().int().min(1),
  total_weeks: z.number().int().min(1),
  completed_weeks: z.array(weekSummarySchema).default([]),
});

// The model returns ONLY the regenerated remaining weeks (token-efficient).
export const adaptationResponseSchema = z.object({
  weeks: z.array(weekSchema),
  adaptation_note: z.string().describe("what changed for the upcoming weeks and why"),
});

export type AdaptationResponse = z.infer<typeof adaptationResponseSchema>;

// ---- Placement test ----
export const placementQuestionSchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  question: z.string().describe("the question stem, in the target language"),
  options: z.array(z.string()).length(4),
  answer_index: z.number().int().min(0).max(3).describe("index of the correct option"),
});

export const placementResponseSchema = z.object({
  questions: z.array(placementQuestionSchema),
});

export const placementRequestSchema = z.object({
  language: z.string().min(1).max(120),
});

export type PlacementQuestion = z.infer<typeof placementQuestionSchema>;
export type PlacementResponse = z.infer<typeof placementResponseSchema>;
