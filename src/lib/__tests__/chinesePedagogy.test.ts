import { describe, expect, it } from "vitest";
import { isChineseSkill, getLanguageProfile } from "../languageProfiles";
import { getResourceCatalog } from "../resourceCatalog";
import { buildPromptWithFeedback } from "../prompt";
import type { UserProfile } from "../types";

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    skill: "Chinese",
    current_level: "A1",
    goal: "Hold a basic conversation",
    time_available: "6-7 hours/week",
    learning_style: ["Conversation", "Listening"],
    resource_preference: "Free + Low cost",
    ...overrides,
  };
}

describe("isChineseSkill", () => {
  it("matches common spellings and native forms", () => {
    for (const s of ["Chinese", "mandarin", "Mandarin Chinese", "中文", "汉语", "普通话", "Putonghua"]) {
      expect(isChineseSkill(s)).toBe(true);
    }
  });

  it("does not match other languages", () => {
    for (const s of ["Spanish", "Japanese", "English", "Korean", "Vietnamese"]) {
      expect(isChineseSkill(s)).toBe(false);
    }
  });
});

describe("Chinese language wiring", () => {
  it("routes Chinese to its dedicated profile (pinyin/tones first)", () => {
    const p = getLanguageProfile("Chinese");
    expect(p.priorities.join(" ")).toMatch(/pinyin|tone/i);
    expect(p.defaultTopicMix).toMatch(/Pronunciation/);
  });

  it("serves the Chinese resource catalog", () => {
    const titles = getResourceCatalog("中文", "living").map((r) => r.title).join(" ");
    expect(titles).toMatch(/Pleco/);
    expect(titles).toMatch(/Grammar Wiki/);
  });
});

describe("buildPromptWithFeedback — Chinese pedagogy block", () => {
  it("injects pinyin, tones, hanzi/strokes, radicals and HSK rules for Chinese learners", () => {
    const { systemPrompt } = buildPromptWithFeedback(profile());
    expect(systemPrompt).toMatch(/MANDARIN CHINESE/);
    expect(systemPrompt).toMatch(/PINYIN & TONES FIRST/);
    expect(systemPrompt).toMatch(/STROKE ORDER/);
    expect(systemPrompt).toMatch(/RADICALS/);
    expect(systemPrompt).toMatch(/HSK/);
  });

  it("does NOT inject the Chinese block for non-Chinese languages", () => {
    const { systemPrompt } = buildPromptWithFeedback(profile({ skill: "Spanish" }));
    expect(systemPrompt).not.toMatch(/MANDARIN CHINESE/);
  });

  it("skips the acquisition Chinese block on the native_mastery track", () => {
    const { systemPrompt } = buildPromptWithFeedback(
      profile({ skill: "Chinese", track: "native_mastery", focus_areas: ["Advanced grammar"] })
    );
    expect(systemPrompt).not.toMatch(/PINYIN & TONES FIRST/);
  });
});
