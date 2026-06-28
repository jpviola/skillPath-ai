import { describe, it, expect } from "vitest";
import { formatMinutes, topicTypeStyles, costStyles, statusBorder, statusLabel } from "../ui";

describe("formatMinutes", () => {
  it("formats 0 minutes", () => {
    expect(formatMinutes(0)).toBe("0 min");
  });

  it("formats minutes only (< 60)", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(1)).toBe("1 min");
    expect(formatMinutes(59)).toBe("59 min");
  });

  it("formats exact hours", () => {
    expect(formatMinutes(60)).toBe("~1 hr");
    expect(formatMinutes(120)).toBe("~2 hr");
    expect(formatMinutes(300)).toBe("~5 hr");
  });

  it("formats hours and minutes", () => {
    expect(formatMinutes(90)).toBe("~1 hr 30 min");
    expect(formatMinutes(150)).toBe("~2 hr 30 min");
    expect(formatMinutes(75)).toBe("~1 hr 15 min");
    // When minutes are 0, the function returns just "~X hr" (no "0 min")
    expect(formatMinutes(420)).toBe("~7 hr");
  });
});

describe("topicTypeStyles", () => {
  it("has style entries for every topic type", () => {
    const types = [
      "Vocabulary", "Grammar", "Listening", "Speaking",
      "Reading", "Writing", "Pronunciation", "Culture",
      "Review", "Assessment",
    ] as const;
    for (const t of types) {
      expect(topicTypeStyles[t]).toBeDefined();
      expect(topicTypeStyles[t]).toContain("bg-");
      expect(topicTypeStyles[t]).toContain("text-");
      expect(topicTypeStyles[t]).toContain("border-");
    }
  });
});

describe("costStyles", () => {
  it("has style entries for every cost tier", () => {
    const costs = ["Free", "Low", "Premium"] as const;
    for (const c of costs) {
      expect(costStyles[c]).toBeDefined();
      expect(costStyles[c]).toContain("bg-");
      expect(costStyles[c]).toContain("text-");
    }
  });
});

describe("statusBorder", () => {
  it("has border entries for every week status", () => {
    expect(statusBorder.completed).toBe("border-l-emerald-500");
    expect(statusBorder.in_progress).toBe("border-l-amber-500");
    expect(statusBorder.not_started).toBe("border-l-indigo-500");
  });
});

describe("statusLabel", () => {
  it("has label entries for every week status", () => {
    expect(statusLabel.completed).toBe("Completed");
    expect(statusLabel.in_progress).toBe("In Progress");
    expect(statusLabel.not_started).toBe("Not Started");
  });
});
