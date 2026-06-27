"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { submitFeedback } from "@/lib/api";
import { feedbackLabels } from "@/lib/labels";
import type { Difficulty, Feedback, Week } from "@/lib/types";

const OPTIONS: Difficulty[] = ["Just Right", "Too Easy", "Too Hard"];

export default function FeedbackCard({ week }: { week: Week }) {
  const { state, dispatch } = usePlan();
  const weekNumber = week.week_number;
  const [difficulty, setDifficulty] = useState<Difficulty>("Just Right");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!state.userProfile || state.isAdapting) return;
    setError(null);

    const entry: Feedback = { week_number: weekNumber, difficulty, comment, completed: true };
    // Weeks up to and including the current one provide continuity context.
    const completedWeeks = state.weeks
      .filter((w) => w.week_number <= weekNumber)
      .map((w) => ({ week_number: w.week_number, title: w.title, milestone: w.milestone }));
    const totalWeeks = state.plan?.total_weeks ?? state.weeks.length;
    dispatch({ type: "SET_ADAPTING", payload: true });

    try {
      const res = await submitFeedback(
        state.userProfile,
        [...state.feedbackHistory, entry],
        weekNumber,
        totalWeeks,
        completedWeeks
      );
      // Commit only after the adaptation succeeds — keeps state consistent.
      dispatch({ type: "SET_WEEK_DONE", payload: { week, done: true } });
      dispatch({ type: "ADD_FEEDBACK", payload: entry });
      dispatch({
        type: "ADAPT_PLAN",
        payload: {
          updatedWeeks: res.updated_weeks,
          adaptationNote: res.adaptation_note,
          fromWeek: weekNumber,
        },
      });
      setComment("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "La adaptación falló. No se cambió nada.");
    } finally {
      dispatch({ type: "SET_ADAPTING", payload: false });
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-ink">Califica esta semana (Semana {weekNumber})</h3>
      <p className="mt-0.5 text-xs text-ink-soft">Tu feedback reajusta las próximas semanas.</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o}
            onClick={() => setDifficulty(o)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              difficulty === o
                ? "border-primary bg-primary-light text-primary"
                : "border-line bg-white text-ink hover:border-primary/40"
            }`}
          >
            {feedbackLabels[o]}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Sugiere mejoras…"
        className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={state.isAdapting}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {state.isAdapting ? (
          <>
            <Loader2 className="animate-spin" size={16} /> Adaptando tu plan…
          </>
        ) : (
          "Enviar feedback"
        )}
      </button>
    </div>
  );
}
