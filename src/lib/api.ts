// Layer 4 — Frontend API client (Fetch, 30s timeout, anonymous cookie bootstrap).
import type { UserProfile, Feedback, Plan, Week, Locale, Resource } from "./types";
import type { PlacementResponse } from "./schema";

const OUTPUT_LANGUAGE: Record<Locale, string> = {
  es: "Spanish",
  en: "English",
  zh: "Chinese (Simplified)",
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Plan generation / adaptation calls the LLM, which can take 1-2 minutes on slower
// models (e.g. MiniMax M3). Keep this above the server route's maxDuration (120s).
const REQUEST_TIMEOUT_MS = 240_000;

async function request<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `La solicitud falló (${res.status})`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("La solicitud tardó demasiado. Inténtalo de nuevo.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function generatePlan(profile: UserProfile, locale: Locale = "es"): Promise<Plan> {
  return request<Plan>("/api/v1/plan", { ...profile, output_language: OUTPUT_LANGUAGE[locale] });
}

export function getPlacementTest(language: string): Promise<PlacementResponse> {
  return request<PlacementResponse>("/api/v1/placement", { language });
}

export interface IngestResponse {
  resource: Resource;
  markdown: string;
  json: unknown;
}

/**
 * Upload a document to the OCR bridge (PDF2LLM) and get it back as a plan
 * Resource with inline Markdown. Multipart, so it doesn't use the JSON helper.
 */
export async function ingestDocument(
  file: File,
  opts: { title?: string; targetLang?: string } = {}
): Promise<IngestResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const form = new FormData();
  form.append("file", file);
  if (opts.title) form.append("title", opts.title);
  if (opts.targetLang) form.append("target_lang", opts.targetLang);
  try {
    const res = await fetch(`${BASE}/api/v1/ingest`, {
      method: "POST",
      credentials: "include",
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `La conversión falló (${res.status})`);
    }
    return (await res.json()) as IngestResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("La conversión tardó demasiado. Inténtalo de nuevo.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export interface AdaptResponse {
  adapted: boolean;
  updated_weeks: Week[];
  adaptation_note: string;
}

export interface WeekSummary {
  week_number: number;
  title: string;
  milestone: string;
}

export function submitFeedback(
  profile: UserProfile,
  feedbackHistory: Feedback[],
  currentWeekNumber: number,
  totalWeeks: number,
  completedWeeks: WeekSummary[],
  locale: Locale = "es"
): Promise<AdaptResponse> {
  return request<AdaptResponse>("/api/v1/plan/feedback", {
    profile,
    feedback_history: feedbackHistory,
    current_week_number: currentWeekNumber,
    total_weeks: totalWeeks,
    completed_weeks: completedWeeks,
    output_language: OUTPUT_LANGUAGE[locale],
  });
}
