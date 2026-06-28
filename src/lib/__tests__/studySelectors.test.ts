import { describe, it, expect } from "vitest";
import { computeStreak, getTodayLog, getTotalMinutes, todayKey } from "@/context/PlanContext";
import type { DailyLog } from "@/lib/types";

function log(date: string, minutes: number, keys: string[] = []): DailyLog {
  return { date, minutesStudied: minutes, notes: "", topicKeys: keys };
}

describe("todayKey", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getTodayLog", () => {
  it("returns undefined when no log exists for today", () => {
    expect(getTodayLog([])).toBeUndefined();
  });

  it("returns the log entry whose date matches today", () => {
    const today = todayKey();
    const logs: DailyLog[] = [log("2024-01-01", 30), log(today, 45)];
    expect(getTodayLog(logs)?.minutesStudied).toBe(45);
  });
});

describe("getTotalMinutes", () => {
  it("returns 0 for an empty array", () => {
    expect(getTotalMinutes([])).toBe(0);
  });

  it("sums minutesStudied across logs", () => {
    const logs: DailyLog[] = [log("2024-01-01", 30), log("2024-01-02", 15), log("2024-01-03", 60)];
    expect(getTotalMinutes(logs)).toBe(105);
  });
});

describe("computeStreak", () => {
  it("returns zeroed state when there are no logs", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0, lastDate: null });
  });

  it("records a single-day streak as both current and longest", () => {
    const today = todayKey();
    expect(computeStreak([log(today, 10)])).toEqual({
      current: 1,
      longest: 1,
      lastDate: today,
    });
  });

  it("counts consecutive days correctly", () => {
    const today = new Date(todayKey());
    const d = (offset: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() - offset);
      return x.toISOString().slice(0, 10);
    };
    const logs: DailyLog[] = [log(d(2), 10), log(d(1), 10), log(d(0), 10)];
    expect(computeStreak(logs)).toEqual({ current: 3, longest: 3, lastDate: d(0) });
  });

  it("breaks streak on a missed day", () => {
    const today = new Date(todayKey());
    const d = (offset: number) => {
      const x = new Date(today);
      x.setDate(x.getDate() - offset);
      return x.toISOString().slice(0, 10);
    };
    const logs: DailyLog[] = [log(d(5), 10), log(d(4), 10), log(d(3), 10), log(d(1), 10), log(d(0), 10)];
    expect(computeStreak(logs).current).toBe(2);
    expect(computeStreak(logs).longest).toBe(3);
  });

  it("returns current=0 when the streak expired (no log yesterday or today)", () => {
    const logs: DailyLog[] = [log("2020-01-01", 10)];
    expect(computeStreak(logs).current).toBe(0);
    expect(computeStreak(logs).longest).toBe(1);
  });
});