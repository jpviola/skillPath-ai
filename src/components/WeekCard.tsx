"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Clock, ExternalLink, CheckCircle2, Circle, Sparkles } from "lucide-react";
import type { Week } from "@/lib/types";
import { usePlan, topicKey, weekStatus, weekDoneCount } from "@/context/PlanContext";
import { topicTypeStyles, costStyles, formatMinutes } from "@/lib/ui";
import { useI18n } from "@/lib/i18n";
import CelebrationToast from "./CelebrationToast";

export default function WeekCard({ week }: { week: Week }) {
  const { state, dispatch } = usePlan();
  const { t, L } = useI18n();
  const tp = state.topicProgress;
  const status = weekStatus(week, tp);
  const done = weekDoneCount(week, tp);
  const total = week.topics.length;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const expanded = state.expandedWeek === week.week_number;
  const changed = state.changedWeeks.includes(week.week_number);

  // Tracks the index of the topic that the user just marked as done — used
  // to trigger the "¡PIEZA ENCAJADA!" toast and the piece-snap animation.
  const [celebrating, setCelebrating] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const topicTypes = Array.from(new Set(week.topics.map((t) => t.type))).slice(0, 5);
  const allResources = week.topics.flatMap((t) => t.resources);
  const shownResources = allResources.slice(0, 3);
  const extra = allResources.length - shownResources.length;

  function toggleWeek() {
    dispatch({ type: "SET_WEEK_DONE", payload: { week, done: status !== "completed" } });
  }

  function toggleTopic(weekNumber: number, topicIndex: number) {
    const key = topicKey(weekNumber, topicIndex);
    // Only celebrate when transitioning from unchecked → checked.
    if (!tp[key]) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCelebrating(topicIndex);
      timerRef.current = setTimeout(() => setCelebrating(null), 1800);
    }
    dispatch({ type: "TOGGLE_TOPIC", payload: { weekNumber, topicIndex } });
  }

  return (
    <div
      className={`relative rounded-[18px] border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_0_#1a1a1a] ${
        status === "completed" ? "border-l-[6px] border-l-emerald-500" : "border-l-[6px] border-l-pop-yellow"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border-[2px] border-ink bg-pop-yellow px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-ink">
              {t("common.week")} {week.week_number}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
              <Clock size={12} /> {formatMinutes(week.total_time_minutes)}
            </span>
            {changed && (
              <span className="inline-flex items-center gap-1 rounded-md border-[2px] border-ink bg-pop-cyan px-2 py-0.5 text-[10px] font-black uppercase text-ink shadow-[1px_1px_0_0_#1a1a1a]">
                <Sparkles size={10} /> {t("wk.adjusted")}
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-black text-ink">{week.title}</h3>
        </div>
        <button
          onClick={toggleWeek}
          className={`shrink-0 rounded-md border-[3px] border-ink p-1 transition ${
            status === "completed"
              ? "bg-emerald-400 text-ink shadow-[2px_2px_0_0_#1a1a1a]"
              : "bg-white text-ink hover:bg-pop-yellow"
          }`}
          title={status === "completed" ? t("wk.markUndone") : t("wk.markDone")}
        >
          {status === "completed" ? (
            <CheckCircle2 size={20} strokeWidth={3} />
          ) : (
            <Circle size={20} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* progress bar — chunky Memphis */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full border-[2px] border-ink bg-slate-100">
          <div
            className={`h-full transition-all ${
              status === "completed" ? "bg-emerald-500" : "bg-pop-yellow"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="rounded-md border-[2px] border-ink bg-pop-magenta px-2 py-0.5 text-[11px] font-black text-white">
          {done}/{total}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topicTypes.map((tt) => (
          <span
            key={tt}
            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${topicTypeStyles[tt]}`}
          >
            {L.topicType[tt]}
          </span>
        ))}
        {extra > 0 && (
          <span className="rounded-md border border-line bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
            +{extra} {t("wk.more")}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: "TOGGLE_WEEK_EXPAND", payload: week.week_number })}
          className="flex items-center gap-1 text-xs font-bold text-ink hover:text-pop-magenta"
        >
          {expanded ? t("wk.hide") : t("wk.expand")}
          <ChevronDown size={14} className={expanded ? "rotate-180 transition" : "transition"} />
        </button>
        <Link
          href={`/plan/${week.week_number}`}
          className="rounded-md border-[2px] border-ink bg-pop-yellow px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0_0_#1a1a1a] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#1a1a1a]"
        >
          {t("wk.viewFull")}
        </Link>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t-[3px] border-dashed border-ink/30 pt-4">
          <p className="text-xs text-ink-soft">
            <span className="font-bold text-ink">{t("wk.objective")}</span> {week.objective}
          </p>
          {week.topics.map((topic, i) => {
            const key = topicKey(week.week_number, i);
            const checked = !!tp[key];
            const justCompleted = celebrating === i && checked;
            return (
              <div key={i} className="relative">
                {justCompleted && <CelebrationToast />}
                <div
                  className={`rounded-lg border-[2px] p-3 transition ${
                    checked ? "border-ink bg-emerald-50" : "border-ink/30 bg-white hover:border-ink/60"
                  } ${justCompleted ? "piece-snap" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleTopic(week.week_number, i)}
                      className="flex items-center gap-2 text-left"
                    >
                      {checked ? (
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border-[2px] border-ink bg-pop-yellow">
                          <CheckCircle2 size={16} strokeWidth={3} className="text-ink" />
                        </span>
                      ) : (
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border-[2px] border-ink bg-white">
                          <Circle size={16} strokeWidth={3} className="text-ink-soft" />
                        </span>
                      )}
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${topicTypeStyles[topic.type]}`}
                      >
                        {L.topicType[topic.type]}
                      </span>
                    </button>
                    <span className="text-xs font-bold text-ink-soft">{topic.estimated_minutes} min</span>
                  </div>
                  <p
                    className={`mt-1.5 text-sm font-bold ${
                      checked ? "text-ink-soft line-through" : "text-ink"
                    }`}
                  >
                    {topic.name}
                  </p>
                  <div className="mt-2 space-y-1">
                    {topic.resources.map((r, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-ink hover:text-pop-magenta"
                          >
                            {r.title} <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-ink-soft">{r.title}</span>
                        )}
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${costStyles[r.cost]}`}>
                          {L.cost[r.cost]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <p className="rounded-md border-[3px] border-ink bg-pop-mint px-3 py-2 text-xs font-bold text-ink shadow-[2px_2px_0_0_#1a1a1a]">
            🏁 {week.milestone}
          </p>
        </div>
      )}
    </div>
  );
}
