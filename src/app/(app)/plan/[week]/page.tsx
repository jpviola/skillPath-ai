"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2, Circle, Clock } from "lucide-react";
import { usePlan, topicKey, weekStatus, weekDoneCount } from "@/context/PlanContext";
import { topicTypeStyles, costStyles, formatMinutes } from "@/lib/ui";
import { topicTypeLabels, resourceTypeLabels, costLabels, difficultyLabels } from "@/lib/labels";

export default function WeekDetailPage({ params }: { params: Promise<{ week: string }> }) {
  const { week: weekParam } = use(params);
  const { state, dispatch } = usePlan();

  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">Cargando…</div>;

  const weekNumber = Number(weekParam);
  const week = state.weeks.find((w) => w.week_number === weekNumber);

  if (!week) {
    return (
      <div className="p-8">
        <Link href="/plan" className="text-sm text-primary hover:underline">
          ← Volver a la ruta
        </Link>
        <p className="mt-4 text-ink-soft">Semana no encontrada.</p>
      </div>
    );
  }

  const tp = state.topicProgress;
  const status = weekStatus(week, tp);
  const done = weekDoneCount(week, tp);

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
      <Link
        href="/plan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={15} /> Volver a la ruta
      </Link>

      <header className="mt-4 card p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Semana {week.week_number}
          <span className="rounded-md bg-slate-100 px-2 py-0.5 normal-case text-ink">
            {difficultyLabels[week.difficulty]}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">{week.title}</h1>
        <p className="mt-1 text-ink-soft">{week.objective}</p>
        <p className="mt-3 inline-flex items-center gap-3 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} /> Total {formatMinutes(week.total_time_minutes)}
          </span>
          <span className="font-medium text-ink">
            {done}/{week.topics.length} temas hechos
          </span>
        </p>
      </header>

      <div className="mt-5 space-y-3">
        {week.topics.map((t, i) => {
          const checked = !!tp[topicKey(weekNumber, i)];
          return (
          <div key={i} className={`card p-4 ${checked ? "opacity-70" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => dispatch({ type: "TOGGLE_TOPIC", payload: { weekNumber, topicIndex: i } })}
                className="flex items-center gap-2"
              >
                {checked ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-ink-soft" />
                )}
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium ${topicTypeStyles[t.type]}`}
                >
                  {topicTypeLabels[t.type]}
                </span>
              </button>
              <span className="text-xs text-ink-soft">{t.estimated_minutes} min</span>
            </div>
            <h3 className={`mt-2 font-semibold ${checked ? "text-ink-soft line-through" : "text-ink"}`}>
              {t.name}
            </h3>
            <div className="mt-2 space-y-1.5">
              {t.resources.map((r, j) => (
                <div key={j} className="flex items-center gap-2 text-sm">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {r.title} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-ink">{r.title}</span>
                  )}
                  <span className="text-[10px] text-ink-soft">({resourceTypeLabels[r.type]})</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${costStyles[r.cost]}`}>
                    {costLabels[r.cost]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-card bg-primary-light p-5">
        <p className="text-sm font-medium text-primary">
          🏁 Al final de esta semana: {week.milestone}
        </p>
      </div>

      <button
        onClick={() =>
          dispatch({ type: "SET_WEEK_DONE", payload: { week, done: status !== "completed" } })
        }
        className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
      >
        {status === "completed" ? (
          <>
            <CheckCircle2 size={16} /> Completada — marcar como no hecha
          </>
        ) : (
          <>
            <Circle size={16} /> Marcar todos los temas
          </>
        )}
      </button>
    </div>
  );
}
