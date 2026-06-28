import { describe, it, expect } from "vitest";
import {
  topicKey,
  weekDoneCount,
  weekStatus,
  computeOverallPercent,
  countByStatus,
  nextTopicIndex,
} from "@/context/PlanContext";
import type { Week } from "@/lib/types";

function makeWeek(week_number: number, topicCount: number): Week {
  return {
    week_number,
    title: `Week ${week_number}`,
    objective: "Test",
    topics: Array.from({ length: topicCount }, (_, i) => ({
      name: `Topic ${i + 1}`,
      type: "Vocabulary" as const,
      estimated_minutes: 30,
      resources: [],
    })),
    total_time_minutes: topicCount * 30,
    difficulty: "Beginner" as const,
    milestone: "Test milestone",
  };
}

const weeks: Week[] = [
  makeWeek(1, 3),
  makeWeek(2, 4),
  makeWeek(3, 2),
];

// All topics completed for week 1, partial for week 2, none for week 3
const tp: Record<string, boolean> = {
  "w1t0": true,
  "w1t1": true,
  "w1t2": true,
  "w2t0": true,
  "w2t1": false,
  "w2t2": false,
  "w2t3": false,
};

describe("topicKey", () => {
  it("generates a consistent key from week number and topic index", () => {
    expect(topicKey(1, 0)).toBe("w1t0");
    expect(topicKey(2, 3)).toBe("w2t3");
    expect(topicKey(10, 5)).toBe("w10t5");
  });
});

describe("weekDoneCount", () => {
  it("returns the number of completed topics in a week", () => {
    expect(weekDoneCount(weeks[0], tp)).toBe(3);
    expect(weekDoneCount(weeks[1], tp)).toBe(1);
    expect(weekDoneCount(weeks[2], tp)).toBe(0);
  });
});

describe("weekStatus", () => {
  it("returns 'completed' when all topics are done", () => {
    expect(weekStatus(weeks[0], tp)).toBe("completed");
  });

  it("returns 'in_progress' when some topics are done", () => {
    expect(weekStatus(weeks[1], tp)).toBe("in_progress");
  });

  it("returns 'not_started' when no topics are done", () => {
    expect(weekStatus(weeks[2], tp)).toBe("not_started");
  });

  it("returns 'not_started' for a week with 0 topics", () => {
    const emptyWeek = makeWeek(4, 0);
    expect(weekStatus(emptyWeek, tp)).toBe("not_started");
  });
});

describe("computeOverallPercent", () => {
  it("computes the correct overall percentage", () => {
    // Total topics: 3+4+2 = 9. Completed: 3+1+0 = 4. Percent: 44%
    expect(computeOverallPercent(weeks, tp)).toBe(44);
  });

  it("returns 0 for empty weeks array", () => {
    expect(computeOverallPercent([], tp)).toBe(0);
  });

  it("returns 100 when all topics are completed", () => {
    const allDone: Record<string, boolean> = {
      "w1t0": true, "w1t1": true, "w1t2": true,
      "w2t0": true, "w2t1": true, "w2t2": true, "w2t3": true,
      "w3t0": true, "w3t1": true,
    };
    expect(computeOverallPercent(weeks, allDone)).toBe(100);
  });
});

describe("countByStatus", () => {
  it("counts weeks by their status", () => {
    const counts = countByStatus(weeks, tp);
    expect(counts.completed).toBe(1);   // week 1
    expect(counts.inProgress).toBe(1);  // week 2
    expect(counts.notStarted).toBe(1);  // week 3
  });
});

describe("nextTopicIndex", () => {
  it("returns the index of the first incomplete topic", () => {
    expect(nextTopicIndex(weeks[0], tp)).toBeNull(); // all done
    expect(nextTopicIndex(weeks[1], tp)).toBe(1);    // first incomplete at index 1
    expect(nextTopicIndex(weeks[2], tp)).toBe(0);    // none done
  });

  it("returns null for a fully completed week", () => {
    expect(nextTopicIndex(weeks[0], tp)).toBeNull();
  });

  it("returns null for an empty week", () => {
    const emptyWeek = makeWeek(5, 0);
    expect(nextTopicIndex(emptyWeek, tp)).toBeNull();
  });
});
