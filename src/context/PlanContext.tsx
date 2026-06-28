"use client";
// Layer 4 — Global state via Context + useReducer, persisted via the
// idbStorage module (IndexedDB → localStorage → in-memory fallback).
// Progress is tracked at the TOPIC level (the real unit of work); week status
// is derived from it so the UI never shows fake progress.
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import type { UserProfile, Plan, Week, Feedback, WeekStatus, Locale, DailyLog, Resource } from "@/lib/types";
import { storageGetItem, storageSetItem } from "@/lib/idbStorage";

interface State {
  locale: Locale;
  isGenerating: boolean;
  isAdapting: boolean;
  userProfile: UserProfile | null;
  plan: Plan | null;
  weeks: Week[];
  topicProgress: Record<string, boolean>; // key: topicKey(weekNumber, topicIndex)
  feedbackHistory: Feedback[];
  expandedWeek: number | null;
  adaptationNote: string | null;
  changedWeeks: number[]; // weeks rewritten by the last adaptation
  showAdaptationBanner: boolean;
  hydrated: boolean;
  dailyLogs: DailyLog[];
  // Documents the learner ingested via the OCR bridge (PDF2LLM). Kept separate
  // from the generated plan so they survive plan regeneration.
  library: Resource[];
}

const initialState: State = {
  locale: "es",
  isGenerating: false,
  isAdapting: false,
  userProfile: null,
  plan: null,
  weeks: [],
  topicProgress: {},
  feedbackHistory: [],
  expandedWeek: null,
  adaptationNote: null,
  changedWeeks: [],
  showAdaptationBanner: false,
  hydrated: false,
  dailyLogs: [],
  library: [],
};

type Action =
  | { type: "HYDRATE"; payload: Partial<State> }
  | { type: "SET_LOCALE"; payload: Locale }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "SET_ADAPTING"; payload: boolean }
  | { type: "SET_PROFILE"; payload: UserProfile }
  | { type: "SET_PLAN"; payload: Plan }
  | { type: "TOGGLE_TOPIC"; payload: { weekNumber: number; topicIndex: number } }
  | { type: "SET_WEEK_DONE"; payload: { week: Week; done: boolean } }
  | { type: "ADD_FEEDBACK"; payload: Feedback }
  | { type: "TOGGLE_WEEK_EXPAND"; payload: number }
  | {
      type: "ADAPT_PLAN";
      payload: { updatedWeeks: Week[]; adaptationNote: string; fromWeek: number };
    }
  | { type: "HIDE_ADAPTATION_BANNER" }
  | { type: "RESET_PLAN" }
  | { type: "ADD_DAILY_LOG"; payload: DailyLog }
  | { type: "ADD_LIBRARY_RESOURCE"; payload: Resource }
  | { type: "REMOVE_LIBRARY_RESOURCE"; payload: number };

export function topicKey(weekNumber: number, topicIndex: number): string {
  return `w${weekNumber}t${topicIndex}`;
}

export { initialState, type State, type Action };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "SET_LOCALE":
      return { ...state, locale: action.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload };
    case "SET_ADAPTING":
      return { ...state, isAdapting: action.payload };
    case "SET_PROFILE":
      return { ...state, userProfile: action.payload };
    case "SET_PLAN":
      // BUGFIX: resetting topicProgress + feedbackHistory would leave
      // `dailyLogs.topicKeys` pointing at topics that no longer exist.
      // Wipe the study logs too — they were recorded against the old plan.
      return {
        ...state,
        plan: action.payload,
        weeks: action.payload.weeks,
        topicProgress: {},
        feedbackHistory: [],
        dailyLogs: [],
        adaptationNote: action.payload.adaptation_note || null,
        changedWeeks: [],
        showAdaptationBanner: false,
      };
    case "TOGGLE_TOPIC": {
      const key = topicKey(action.payload.weekNumber, action.payload.topicIndex);
      return { ...state, topicProgress: { ...state.topicProgress, [key]: !state.topicProgress[key] } };
    }
    case "SET_WEEK_DONE": {
      const next = { ...state.topicProgress };
      action.payload.week.topics.forEach((_, i) => {
        next[topicKey(action.payload.week.week_number, i)] = action.payload.done;
      });
      return { ...state, topicProgress: next };
    }
    case "ADD_FEEDBACK":
      return { ...state, feedbackHistory: [...state.feedbackHistory, action.payload] };
    case "TOGGLE_WEEK_EXPAND":
      return {
        ...state,
        expandedWeek: state.expandedWeek === action.payload ? null : action.payload,
      };
    case "ADAPT_PLAN": {
      const { fromWeek, updatedWeeks, adaptationNote } = action.payload;
      // Keep everything the user has already seen (<= fromWeek) and replace the
      // future with the freshly generated weeks. Correct even if total_weeks changed.
      const kept = state.weeks.filter((w) => w.week_number <= fromWeek);
      const future = updatedWeeks.filter((w) => w.week_number > fromWeek);
      const merged = [...kept, ...future].sort((a, b) => a.week_number - b.week_number);

      // Drop topic-progress keys for any week beyond the threshold (rewritten weeks).
      const nextProgress: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(state.topicProgress)) {
        const wn = Number(k.slice(1, k.indexOf("t")));
        if (wn <= fromWeek) nextProgress[k] = v;
      }

      // BUGFIX: rewriting weeks > fromWeek invalidates any dailyLog.topicKey
      // that references one of those weeks. Drop the stale keys in-place
      // instead of silently leaving them pointing at non-existent topics.
      const futureWeekNumbers = new Set(future.map((w) => w.week_number));
      const nextDailyLogs = state.dailyLogs.map((log) => {
        const liveKeys = log.topicKeys.filter((k) => {
          const wn = Number(k.slice(1, k.indexOf("t")));
          return wn <= fromWeek || futureWeekNumbers.has(wn);
        });
        return liveKeys.length === log.topicKeys.length ? log : { ...log, topicKeys: liveKeys };
      });

      const nextPlan: Plan | null = state.plan
        ? { ...state.plan, total_weeks: merged.length, adaptation_note: adaptationNote, weeks: merged }
        : state.plan;

      return {
        ...state,
        plan: nextPlan,
        weeks: merged,
        topicProgress: nextProgress,
        dailyLogs: nextDailyLogs,
        adaptationNote,
        changedWeeks: future.map((w) => w.week_number),
        showAdaptationBanner: true,
      };
    }
    case "HIDE_ADAPTATION_BANNER":
      return { ...state, showAdaptationBanner: false, changedWeeks: [] };
    case "RESET_PLAN":
      // Keep the locale and the ingested library — those aren't part of the plan.
      return { ...initialState, hydrated: true, locale: state.locale, library: state.library };
    case "ADD_LIBRARY_RESOURCE":
      return { ...state, library: [action.payload, ...state.library] };
    case "REMOVE_LIBRARY_RESOURCE":
      return { ...state, library: state.library.filter((_, i) => i !== action.payload) };
    case "ADD_DAILY_LOG": {
      const existing = state.dailyLogs.find((l) => l.date === action.payload.date);
      if (existing) {
        return {
          ...state,
          dailyLogs: state.dailyLogs.map((l) =>
            l.date === action.payload.date ? action.payload : l
          ),
        };
      }
      return { ...state, dailyLogs: [...state.dailyLogs, action.payload] };
    }
    default:
      return state;
  }
}

const STORAGE_KEY = "liango_state_v2";

const PlanContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // BUGFIX: use the idbStorage module (IndexedDB → localStorage → in-memory
  // fallback) instead of raw localStorage. Migrates old installations
  // automatically: storageGetItem checks IDB first then localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await storageGetItem(STORAGE_KEY);
      if (cancelled) return;
      let payload: Partial<State> = {};
      if (raw) {
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = {};
        }
      }
      dispatch({ type: "HYDRATE", payload });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { locale, userProfile, plan, weeks, topicProgress, feedbackHistory, adaptationNote, dailyLogs, library } = state;
    // Fire-and-forget: the in-memory map inside idbStorage is updated
    // synchronously, and the IDB write happens off the main thread.
    void storageSetItem(
      STORAGE_KEY,
      JSON.stringify({ locale, userProfile, plan, weeks, topicProgress, feedbackHistory, adaptationNote, dailyLogs, library })
    );
  }, [state]);

  return <PlanContext.Provider value={{ state, dispatch }}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}

// ---- Selectors (derive week status from topic progress) ----
export function weekDoneCount(week: Week, tp: Record<string, boolean>): number {
  return week.topics.reduce(
    (n, _, i) => n + (tp[topicKey(week.week_number, i)] ? 1 : 0),
    0
  );
}

export function weekStatus(week: Week, tp: Record<string, boolean>): WeekStatus {
  const done = weekDoneCount(week, tp);
  if (week.topics.length > 0 && done === week.topics.length) return "completed";
  if (done > 0) return "in_progress";
  return "not_started";
}

export function computeOverallPercent(weeks: Week[], tp: Record<string, boolean>): number {
  const total = weeks.reduce((n, w) => n + w.topics.length, 0);
  if (total === 0) return 0;
  const done = weeks.reduce((n, w) => n + weekDoneCount(w, tp), 0);
  return Math.round((done / total) * 100);
}

export function countByStatus(weeks: Week[], tp: Record<string, boolean>) {
  let completed = 0,
    inProgress = 0,
    notStarted = 0;
  for (const w of weeks) {
    const s = weekStatus(w, tp);
    if (s === "completed") completed++;
    else if (s === "in_progress") inProgress++;
    else notStarted++;
  }
  return { completed, inProgress, notStarted };
}

/** First incomplete topic of a week, or null if the week is fully done. */
export function nextTopicIndex(week: Week, tp: Record<string, boolean>): number | null {
  for (let i = 0; i < week.topics.length; i++) {
    if (!tp[topicKey(week.week_number, i)]) return i;
  }
  return null;
}

// ---- Study mode selectors ----
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeStreak(dailyLogs: DailyLog[]): {
  current: number;
  longest: number;
  lastDate: string | null;
} {
  if (dailyLogs.length === 0) return { current: 0, longest: 0, lastDate: null };

  // De-duplicate (one log per day) and sort ascending.
  const sorted = Array.from(new Set(dailyLogs.map((l) => l.date))).sort();
  const lastDate = sorted[sorted.length - 1];

  // ---- longest streak (anywhere in the history) ----
  let longest = 1;
  let runLen = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000;
    if (Math.abs(diff - 1) < 0.01) {
      runLen++;
      if (runLen > longest) longest = runLen;
    } else {
      runLen = 1;
    }
  }

  // ---- current streak (walks BACKWARD from the last date) ----
  // The last date must be today or yesterday for the streak to be alive.
  const today = new Date(todayKey());
  const last = new Date(lastDate);
  const daysSinceLast = (today.getTime() - last.getTime()) / 86_400_000;
  let current = 0;
  if (daysSinceLast <= 1) {
    const cursor = new Date(lastDate);
    for (let i = sorted.length - 1; i >= 0; i--) {
      const diff = (cursor.getTime() - new Date(sorted[i]).getTime()) / 86_400_000;
      if (Math.abs(diff) < 0.5) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { current, longest, lastDate };
}

export function getTodayLog(dailyLogs: DailyLog[]): DailyLog | undefined {
  return dailyLogs.find((l) => l.date === todayKey());
}

export function getTotalMinutes(dailyLogs: DailyLog[]): number {
  return dailyLogs.reduce((sum, l) => sum + l.minutesStudied, 0);
}
