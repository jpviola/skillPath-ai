// Layer 4 — Frontend API client (Fetch, 30s timeout, device id header).
import type { UserProfile, Feedback, Plan, Week } from "./types";
import type { PlacementResponse } from "./schema";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("skillpath_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("skillpath_device_id", id);
  }
  return id;
}

// Plan generation / adaptation calls the LLM, which can take 1-2 minutes on slower
// models (e.g. MiniMax M3). Keep this above the server route's maxDuration (120s).
const REQUEST_TIMEOUT_MS = 240_000;

async function request<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": getDeviceId(),
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

export function generatePlan(profile: UserProfile): Promise<Plan> {
  return request<Plan>("/api/v1/plan", profile);
}

export function getPlacementTest(language: string): Promise<PlacementResponse> {
  return request<PlacementResponse>("/api/v1/placement", { language });
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
  completedWeeks: WeekSummary[]
): Promise<AdaptResponse> {
  return request<AdaptResponse>("/api/v1/plan/feedback", {
    profile,
    feedback_history: feedbackHistory,
    current_week_number: currentWeekNumber,
    total_weeks: totalWeeks,
    completed_weeks: completedWeeks,
  });
}
