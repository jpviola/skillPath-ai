"use client";
import Link from "next/link";
import { ChevronDown, Clock, ExternalLink, CheckCircle2, Circle, Sparkles } from "lucide-react";
import type { Week } from "@/lib/types";
import { usePlan, topicKey, weekStatus, weekDoneCount } from "@/context/PlanContext";
import { topicTypeStyles, costStyles, statusBorder, formatMinutes } from "@/lib/ui";
import { topicTypeLabels, costLabels } from "@/lib/labels";

export default function WeekCard({ week }: { week: Week }) {
  const { state, dispatch } = usePlan();
  const tp = state.topicProgress;
  const status = weekStatus(week, tp);
  const done = weekDoneCount(week, tp);
  const total = week.topics.length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const expanded = state.expandedWeek === week.week_number;
  const changed = state.changedWeeks.includes(week.week_number);

  const topicTypes = Array.from(new Set(week.topics.map((t) => t.type))).slice(0, 5);
  const allResources = week.topics.flatMap((t) => t.resources);
  const shownResources = allResources.slice(0, 3);
  const extra = allResources.length - shownResources.length;

  function toggleWeek() {
    dispatch({ type: "SET_WEEK_DONE", payload: { week, done: status !== "completed" } });
  }

  return (
    <div className={`card border-l-4 p-4 ${statusBorder[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Semana {week.week_number}
            </span>
            <span className="text-xs text-ink-soft">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <Clock size={12} /> {formatMinutes(week.total_time_minutes)}
            </span>
            {changed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                <Sparkles size={10} /> Ajustada
              </span>
            )}
          </div>
          <h3 className="mt-0.5 truncate text-base font-semibold text-ink">{week.title}</h3>
        </div>
        <button
          onClick={toggleWeek}
          className="shrink-0 text-ink-soft transition hover:text-emerald-500"
          title={status === "completed" ? "Marcar semana como no hecha" : "Marcar toda la semana"}
        >
          {status === "completed" ? (
            <CheckCircle2 className="text-emerald-500" size={22} />
          ) : (
            <Circle size={22} />
          )}
        </button>
      </div>

      {/* real progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              status === "completed" ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-ink-soft">
          {done}/{total}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topicTypes.map((t) => (
          <span
            key={t}
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${topicTypeStyles[t]}`}
          >
            {topicTypeLabels[t]}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {shownResources.map((r, i) => (
          <span
            key={i}
            className="inline-flex max-w-[160px] items-center gap-1 truncate rounded-md bg-slate-50 px-2 py-1 text-[11px] text-ink-soft"
          >
            {r.title}
          </span>
        ))}
        {extra > 0 && (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-ink-soft">
            +{extra} más
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: "TOGGLE_WEEK_EXPAND", payload: week.week_number })}
          className="flex items-center gap-1 text-xs font-medium text-primary"
        >
          {expanded ? "Ocultar" : "Ver más"}
          <ChevronDown size={14} className={expanded ? "rotate-180 transition" : "transition"} />
        </button>
        <Link
          href={`/plan/${week.week_number}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver semana completa →
        </Link>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <p className="text-xs text-ink-soft">
            <span className="font-medium text-ink">Objetivo:</span> {week.objective}
          </p>
          {week.topics.map((t, i) => {
            const key = topicKey(week.week_number, i);
            const checked = !!tp[key];
            return (
              <div key={i} className="rounded-lg border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      dispatch({ type: "TOGGLE_TOPIC", payload: { weekNumber: week.week_number, topicIndex: i } })
                    }
                    className="flex items-center gap-2 text-left"
                  >
                    {checked ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    ) : (
                      <Circle size={16} className="shrink-0 text-ink-soft" />
                    )}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${topicTypeStyles[t.type]}`}
                    >
                      {topicTypeLabels[t.type]}
                    </span>
                  </button>
                  <span className="text-xs text-ink-soft">{t.estimated_minutes} min</span>
                </div>
                <p className={`mt-1.5 text-sm font-medium ${checked ? "text-ink-soft line-through" : "text-ink"}`}>
                  {t.name}
                </p>
                <div className="mt-2 space-y-1">
                  {t.resources.map((r, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {r.title} <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-ink-soft">{r.title}</span>
                      )}
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${costStyles[r.cost]}`}>
                        {costLabels[r.cost]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <p className="rounded-lg bg-primary-light px-3 py-2 text-xs text-primary">
            🏁 {week.milestone}
          </p>
        </div>
      )}
    </div>
  );
}
