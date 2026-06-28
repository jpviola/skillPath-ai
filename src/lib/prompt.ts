import type { UserProfile, Feedback } from "./types";
import {
  BASE_SYSTEM_PROMPT,
  buildFeedbackBlock,
  buildLanguageBlocks,
  buildNativeMasteryBlock,
  buildOutputLanguageBlock,
} from "./promptBlocks";

/**
 * Layer 1.2 — Builds the system prompt, appending adaptation instructions
 * derived from the most recent feedback entry.
 */
export function buildPromptWithFeedback(
  userProfile: UserProfile,
  previousWeeksFeedback: Feedback[] = [],
  outputLanguage = "Spanish"
): { systemPrompt: string } {
  let systemPrompt = BASE_SYSTEM_PROMPT;
  systemPrompt += buildLanguageBlocks(userProfile);
  if (userProfile.track === "native_mastery") {
    systemPrompt += buildNativeMasteryBlock(userProfile.focus_areas);
  }
  systemPrompt += buildOutputLanguageBlock(outputLanguage);
  systemPrompt += buildFeedbackBlock(previousWeeksFeedback);

  return { systemPrompt };
}
