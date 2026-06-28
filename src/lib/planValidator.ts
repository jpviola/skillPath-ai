import { getLanguageProfile } from "./languageProfiles";
import type { Plan, TopicType, UserProfile, Week } from "./types";

export interface PlanValidationIssue {
  severity: "error" | "warning";
  message: string;
}

export interface PlanValidationResult {
  valid: boolean;
  score: number;
  issues: PlanValidationIssue[];
}

const ACTIVE_TYPES = new Set<TopicType>(["Listening", "Speaking", "Reading", "Writing"]);

function countActiveTopics(weeks: Week[]): number {
  return weeks.reduce(
    (sum, week) => sum + week.topics.filter((topic) => ACTIVE_TYPES.has(topic.type)).length,
    0
  );
}

function totalTopics(weeks: Week[]): number {
  return weeks.reduce((sum, week) => sum + week.topics.length, 0);
}

export function validatePlanQuality(plan: Plan, profile: UserProfile): PlanValidationResult {
  const issues: PlanValidationIssue[] = [];
  const languageProfile = getLanguageProfile(profile.skill, profile.track);

  if (plan.weeks.length < 8 || plan.weeks.length > 16) {
    issues.push({
      severity: "error",
      message: `The plan must have between 8 and 16 weeks. Got ${plan.weeks.length}.`,
    });
  }

  if (plan.weeks.some((week) => week.topics.length < 3 || week.topics.length > 5)) {
    issues.push({
      severity: "error",
      message: "Every week must contain between 3 and 5 topics.",
    });
  }

  if (plan.weeks.some((week) => week.topics.some((topic) => topic.resources.length === 0))) {
    issues.push({
      severity: "error",
      message: "Every topic must include at least one resource.",
    });
  }

  const topicTotal = totalTopics(plan.weeks);
  const activeTotal = countActiveTopics(plan.weeks);
  const activeRatio = topicTotal === 0 ? 0 : activeTotal / topicTotal;

  if (activeRatio < 0.5) {
    issues.push({
      severity: "warning",
      message: `Only ${Math.round(activeRatio * 100)}% of topics are active practice; aim for at least 50%.`,
    });
  }

  if (languageProfile.family === "classical") {
    const speakingListening = plan.weeks.reduce(
      (sum, week) =>
        sum +
        week.topics.filter((topic) => topic.type === "Speaking" || topic.type === "Listening").length,
      0
    );
    if (topicTotal > 0 && speakingListening / topicTotal > 0.25) {
      issues.push({
        severity: "warning",
        message: "Classical languages should lean much more heavily on reading, writing and grammar.",
      });
    }
  }

  if (languageProfile.family === "living") {
    const hasCommunicativeFocus = plan.weeks.some((week) =>
      week.topics.some((topic) => topic.type === "Listening" || topic.type === "Speaking")
    );
    if (!hasCommunicativeFocus) {
      issues.push({
        severity: "warning",
        message: "Living languages should include listening or speaking somewhere in the plan.",
      });
    }
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    score: Math.max(0, 100 - issues.length * 15 - issues.filter((issue) => issue.severity === "error").length * 20),
    issues,
  };
}

export function formatPlanValidationFeedback(result: PlanValidationResult): string {
  if (result.issues.length === 0) return "Plan validation passed cleanly.";
  return [
    `Plan validation score: ${result.score}/100`,
    ...result.issues.map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.message}`),
  ].join("\n");
}
