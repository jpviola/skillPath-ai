import { describe, it, expect } from "vitest";
import { reducer, initialState, topicKey } from "@/context/PlanContext";
import type { Plan, Week } from "@/lib/types";

function makeWeek(week_number: number, topicCount = 3): Week {
  return {
    week_number,
    title: `Week ${week_number}`,
    objective: "Learn stuff",
    topics: Array.from({ length: topicCount }, (_, i) => ({
      name: `Topic ${i}`,
      type: "Vocabulary" as const,
      estimated_minutes: 30,
      resources: [],
    })),
    total_time_minutes: 30 * topicCount,
    difficulty: "Beginner" as const,
    milestone: "M",
  };
}

const basePlan: Plan = {
  plan_id: "test",
  skill: "Spanish",
  total_weeks: 8,
  weekly_time_hours: 5,
  weeks: Array.from({ length: 8 }, (_, i) => makeWeek(i + 1)),
  estimated_total_cost: "$0",
  adaptation_note: "",
};

describe("plan reducer — bug fixes", () => {
  describe("SET_PLAN", () => {
    it("wipes topicProgress, feedbackHistory AND dailyLogs to avoid orphan references", () => {
      const withPlan = reducer(
        { ...initialState, plan: basePlan, weeks: basePlan.weeks },
        { type: "SET_PROFILE", payload: basePlan.profile ?? { skill: "Spanish", current_level: "A1", goal: "g", time_available: "5h", learning_style: ["Conversation"], resource_preference: "Free + Low cost" } }
      );
      const withProgress = reducer(withPlan, { type: "TOGGLE_TOPIC", payload: { weekNumber: 1, topicIndex: 0 } });
      const withLog = reducer(
        withProgress,
        {
          type: "ADD_DAILY_LOG",
          payload: {
            date: "2026-01-01",
            minutesStudied: 30,
            notes: "good",
            topicKeys: [topicKey(1, 0)],
          },
        }
      );

      const after = reducer(withLog, { type: "SET_PLAN", payload: basePlan });

      expect(after.topicProgress).toEqual({});
      expect(after.feedbackHistory).toEqual([]);
      expect(after.dailyLogs).toEqual([]);
      expect(after.plan).toBe(basePlan);
    });

    it("seeds adaptationNote from the incoming plan", () => {
      const incoming: Plan = { ...basePlan, adaptation_note: "Made easier after feedback" };
      const after = reducer(initialState, { type: "SET_PLAN", payload: incoming });
      expect(after.adaptationNote).toBe("Made easier after feedback");
    });
  });

  describe("ADAPT_PLAN", () => {
    it("prunes orphan topicKeys from dailyLogs when weeks are re-numbered (longer plan)", () => {
      // weeks 1-3 are kept, the LLM regenerates weeks 4-10 (2 extra weeks)
      // → old topicKeys pointing at weeks 9-10 are orphan (those numbers no longer exist)
      // → topicKeys for week 4-8 stay valid because the new plan also has them
      const base: typeof initialState = {
        ...initialState,
        plan: basePlan,
        weeks: basePlan.weeks,
        dailyLogs: [
          {
            date: "2026-01-01",
            minutesStudied: 30,
            notes: "mix",
            topicKeys: [
              topicKey(1, 0), // kept (week 1)
              topicKey(2, 1), // kept (week 2)
              topicKey(5, 0), // kept (week 5 still exists in new plan)
              topicKey(11, 0), // orphan: 11 doesn't exist in new plan
              topicKey(12, 1), // orphan: 12 doesn't exist in new plan
            ],
          },
        ],
      };

      const updatedWeeks = [
        makeWeek(4),
        makeWeek(5),
        makeWeek(6),
        makeWeek(7),
        makeWeek(8),
        makeWeek(9),
        makeWeek(10),
      ];

      const after = reducer(base, {
        type: "ADAPT_PLAN",
        payload: { fromWeek: 3, updatedWeeks, adaptationNote: "Expanded" },
      });

      const surviving = after.dailyLogs[0].topicKeys;
      expect(surviving).toContain(topicKey(1, 0));
      expect(surviving).toContain(topicKey(2, 1));
      expect(surviving).toContain(topicKey(5, 0));
      expect(surviving).not.toContain(topicKey(11, 0));
      expect(surviving).not.toContain(topicKey(12, 1));
    });

    it("prunes orphan topicKeys when weeks are renumbered to fewer (shorter plan)", () => {
      // Original had 8 weeks, the LLM trims it to 6 weeks (so weeks 7-8 disappear)
      const base: typeof initialState = {
        ...initialState,
        plan: basePlan,
        weeks: basePlan.weeks,
        dailyLogs: [
          {
            date: "2026-01-01",
            minutesStudied: 30,
            notes: "old topics",
            topicKeys: [topicKey(7, 0), topicKey(8, 1)],
          },
        ],
      };

      const updatedWeeks = [makeWeek(4), makeWeek(5), makeWeek(6)];

      const after = reducer(base, {
        type: "ADAPT_PLAN",
        payload: { fromWeek: 3, updatedWeeks, adaptationNote: "Shortened" },
      });

      // Both week 7 and 8 are gone → topicKeys are orphan
      expect(after.dailyLogs[0].topicKeys).toEqual([]);
    });

    it("preserves dailyLogs entirely when no topicKeys reference missing weeks", () => {
      const base: typeof initialState = {
        ...initialState,
        plan: basePlan,
        weeks: basePlan.weeks,
        dailyLogs: [
          { date: "2026-01-01", minutesStudied: 30, notes: "", topicKeys: [topicKey(1, 0)] },
        ],
      };

      const after = reducer(base, {
        type: "ADAPT_PLAN",
        payload: { fromWeek: 3, updatedWeeks: [makeWeek(5)], adaptationNote: "x" },
      });

      expect(after.dailyLogs[0]).toBe(base.dailyLogs[0]); // same reference (no copy needed)
    });
  });
});

describe("plan reducer — invariants", () => {
  it("TOGGLE_TOPIC flips the bit on the same key", () => {
    const after1 = reducer(initialState, { type: "TOGGLE_TOPIC", payload: { weekNumber: 1, topicIndex: 0 } });
    expect(after1.topicProgress[topicKey(1, 0)]).toBe(true);
    const after2 = reducer(after1, { type: "TOGGLE_TOPIC", payload: { weekNumber: 1, topicIndex: 0 } });
    expect(after2.topicProgress[topicKey(1, 0)]).toBe(false);
  });

  it("ADD_DAILY_LOG replaces existing entry with the same date", () => {
    const after1 = reducer(initialState, {
      type: "ADD_DAILY_LOG",
      payload: { date: "2026-01-01", minutesStudied: 30, notes: "first", topicKeys: [] },
    });
    const after2 = reducer(after1, {
      type: "ADD_DAILY_LOG",
      payload: { date: "2026-01-01", minutesStudied: 60, notes: "second", topicKeys: [] },
    });
    expect(after2.dailyLogs).toHaveLength(1);
    expect(after2.dailyLogs[0].minutesStudied).toBe(60);
    expect(after2.dailyLogs[0].notes).toBe("second");
  });
});