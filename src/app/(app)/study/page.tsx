"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Play, Square, RotateCcw, Circle, CheckCircle2 } from "lucide-react";
import { usePlan, todayKey, computeStreak, getTodayLog, getTotalMinutes, topicKey, weekStatus } from "@/context/PlanContext";
import { useI18n } from "@/lib/i18n";
import TutorMascot from "@/components/TutorMascot";
import type { Week } from "@/lib/types";

export default function StudyPage() {
  const { state, dispatch } = usePlan();
  const { t } = useI18n();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [notes, setNotes] = useState("");
  // BUGFIX: Set is not JSON-serializable; we only need .has() and toggling,
  // so a sorted string[] is cleaner and survives any future persistence.
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const streak = computeStreak(state.dailyLogs);
  const todayLog = getTodayLog(state.dailyLogs);
  const totalMinutes = getTotalMinutes(state.dailyLogs);

  // BUGFIX: was `state.weeks[0]` — always returned Week 1 even after weeks
  // were completed or the plan was adapted. Now derives the actual current
  // week (first non-completed) using the same selector the dashboard uses.
  const currentWeek = useMemo<Week | undefined>(() => {
    return (
      state.weeks.find((w) => weekStatus(w, state.topicProgress) !== "completed") ??
      state.weeks[state.weeks.length - 1]
    );
  }, [state.weeks, state.topicProgress]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s === 59) {
          setMinutes((m) => {
            if (m === 0) {
              setIsRunning(false);
              setMode((prev) => (prev === "focus" ? "break" : "focus"));
              return 0;
            }
            return m - 1;
          });
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function resetTimer() {
    setIsRunning(false);
    setMinutes(0);
    setSeconds(0);
    setMode("focus");
  }

  function toggleTopic(key: string) {
    setSelectedTopics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function saveLog() {
    const today = todayKey();
    // BUGFIX: was `minutes * 60 + seconds` — that stored TOTAL SECONDS into a
    // field named `minutesStudied` (a 24:30 Pomodoro would have stored 1470).
    // Now stores actual minutes, rounded up so a 30-second session still counts.
    const totalMinutesStudied = Math.max(1, minutes + (seconds > 30 ? 1 : 0));
    dispatch({
      type: "ADD_DAILY_LOG",
      payload: {
        date: today,
        minutesStudied: totalMinutesStudied,
        notes,
        topicKeys: selectedTopics,
      },
    });
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
    resetTimer();
    setNotes("");
    setSelectedTopics([]);
  }

  const fmt = (m: number, s: number) =>
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  if (!state.hydrated || !state.plan) {
    return (
      <div className="p-8">
        <p className="text-ink-soft">{t("empty.noPlan")}</p>
        <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">{t("empty.createPath")}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <TutorMascot variant="calm" size={84} bubble bubbleKey="tutorCalm" />
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink text-shadow-yellow">
            {t("study.title")}
          </h1>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
            {t("study.days", { n: streak.longest })}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="card bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center">
          <div className="text-2xl">🔥</div>
          <p className="text-2xl font-bold text-ink">{streak.current}</p>
          <p className="text-xs text-ink-soft">{t("study.days", { n: streak.longest })}</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
          <div className="text-2xl">⏱️</div>
          <p className="text-2xl font-bold text-ink">{totalMinutes}</p>
          <p className="text-xs text-ink-soft">min totales</p>
        </div>
        <div className="card bg-gradient-to-br from-violet-50 to-indigo-50 p-4 text-center">
          <div className="text-2xl">📚</div>
          <p className="text-2xl font-bold text-ink">{todayLog?.minutesStudied || 0}</p>
          <p className="text-xs text-ink-soft">min hoy</p>
        </div>
      </div>

      {streak.current === 0 && streak.longest > 0 && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-800">😔 {t("study.streakLost")}</p>
        </div>
      )}

      <div className="mb-6 card bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
        <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {mode === "focus" ? "🎯" : "☕"} {mode === "focus" ? t("study.focus") : t("study.break")}
        </span>
        <div className="font-mono text-7xl font-bold tracking-tighter text-ink">{fmt(minutes, seconds)}</div>
        <p className="mt-2 text-sm text-ink-soft">{mode === "focus" ? t("study.pomodoroFocus") : t("study.pomodoroBreak")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => setIsRunning((v) => !v)} className="btn btn-primary px-6 py-3 text-sm">
            {isRunning ? <><Square size={16} /> {t("study.stopTimer")}</> : <><Play size={16} /> {t("study.startTimer")}</>}
          </button>
          <button onClick={resetTimer} className="btn btn-secondary px-6 py-3 text-sm"><RotateCcw size={16} /> {t("study.resetTimer")}</button>
        </div>
      </div>

      <div className="mb-6 card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">{t("study.logStudy")}</h2>
        <label className="mb-2 block text-sm font-medium text-ink">{t("study.minutesLabel")}</label>
        <input type="number" min="1" max="480" value={minutes} onChange={(e) => { setMinutes(parseInt(e.target.value) || 0); setSeconds(0); }} className="mb-4 w-32 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary" />
        <label className="mb-2 block text-sm font-medium text-ink">{t("study.notesLabel")}</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t("study.notesPlaceholder")} className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary" />

        {currentWeek && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-ink">{t("study.topicsToday")}</p>
            <div className="space-y-2">
              {currentWeek.topics.map((topic, i) => {
                const key = topicKey(currentWeek.week_number, i);
                const checked = selectedTopics.includes(key);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleTopic(key)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                      checked ? "border-primary bg-primary-light" : "border-line hover:border-primary/40"
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 size={18} className="shrink-0 text-primary" />
                    ) : (
                      <Circle size={18} className="shrink-0 text-ink-soft" />
                    )}
                    <span className="flex-1 font-medium text-ink">{topic.name}</span>
                    <span className="text-xs text-ink-soft">{topic.estimated_minutes} min</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showSaveSuccess && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            ✅ {t("study.logSaved")}
          </div>
        )}

        <button
          onClick={saveLog}
          disabled={minutes === 0 && !todayLog}
          className="btn btn-accent w-full py-3 text-sm"
        >
          {t("study.saveLog")}
        </button>
      </div>

      <Link href="/plan" className="text-sm font-medium text-primary hover:underline">
        ← {t("detail.back")}
      </Link>
    </div>
  );
}

