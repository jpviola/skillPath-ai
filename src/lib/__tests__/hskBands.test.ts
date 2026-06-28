import { describe, expect, it } from "vitest";
import { getHskBand, describeHskBand } from "../hskBands";
import { buildPromptWithFeedback } from "../prompt";
import type { Level, UserProfile } from "../types";

function chineseProfile(level: Level): UserProfile {
  return {
    skill: "Chinese",
    current_level: level,
    goal: "Pass an HSK exam",
    time_available: "6-7 hours/week",
    learning_style: ["Reading", "Listening"],
    resource_preference: "Free + Low cost",
  };
}

describe("getHskBand", () => {
  it("maps each CEFR level to the expected HSK band", () => {
    const expected: Record<Level, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    for (const [level, hsk] of Object.entries(expected) as [Level, number][]) {
      expect(getHskBand(level).hsk).toBe(hsk);
    }
  });

  it("carries concrete cumulative vocab targets that grow with the band", () => {
    expect(getHskBand("A1").cumulativeVocab).toBe(150);
    expect(getHskBand("C2").cumulativeVocab).toBe(5000);
    const order: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const vocab = order.map((l) => getHskBand(l).cumulativeVocab);
    expect([...vocab].sort((a, b) => a - b)).toEqual(vocab);
  });
});

describe("describeHskBand", () => {
  it("names the target band and a vocab target", () => {
    const b3 = describeHskBand("B1");
    expect(b3).toMatch(/HSK 3/);
    expect(b3).toMatch(/600 words/);
  });

  it("ramps from the band below for non-entry levels", () => {
    expect(describeHskBand("B2")).toMatch(/Ramp UP from roughly HSK 3/);
  });

  it("treats A1 as the entry band (no prior characters)", () => {
    expect(describeHskBand("A1")).toMatch(/entry band/);
  });
});

describe("buildPromptWithFeedback — HSK band sub-block", () => {
  it("injects the band matched to the learner's level", () => {
    expect(buildPromptWithFeedback(chineseProfile("A1")).systemPrompt).toMatch(
      /TARGET HSK BAND — HSK 1/
    );
    expect(buildPromptWithFeedback(chineseProfile("C1")).systemPrompt).toMatch(
      /TARGET HSK BAND — HSK 5/
    );
  });

  it("does not inject an HSK band for non-Chinese learners", () => {
    const p: UserProfile = { ...chineseProfile("B1"), skill: "Spanish" };
    expect(buildPromptWithFeedback(p).systemPrompt).not.toMatch(/TARGET HSK BAND/);
  });
});
