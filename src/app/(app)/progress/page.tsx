"use client";
import Link from "next/link";
import { usePlan, computeOverallPercent, countByStatus, weekStatus } from "@/context/PlanContext";
import ProgressRing from "@/components/ProgressRing";
import { useI18n } from "@/lib/i18n";

export default function ProgressPage() {
  const { state } = usePlan();
  const { t, L } = useI18n();
  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">{t("dash.loading")}</div>;
  if (!state.plan) return <Empty />;

  const { weeks, topicProgress, feedbackHistory } = state;
  const overall = computeOverallPercent(weeks, topicProgress);
  const counts = countByStatus(weeks, topicProgress);

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">{t("prog.title")}</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card flex items-center gap-6 p-6">
          <ProgressRing percent={overall} size={140} />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">
              {t("prog.weeksDone", { done: counts.completed, total: weeks.length })}
            </p>
            <p className="text-ink-soft">{t("prog.inProgress", { n: counts.inProgress })}</p>
            <p className="text-ink-soft">{t("prog.notStarted", { n: counts.notStarted })}</p>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">{t("prog.weekly")}</h2>
          <div className="flex h-32 items-end gap-1.5">
            {weeks.map((w) => {
              const s = weekStatus(w, topicProgress);
              const h = s === "completed" ? 100 : s === "in_progress" ? 45 : 8;
              const color =
                s === "completed" ? "bg-emerald-500" : s === "in_progress" ? "bg-amber-500" : "bg-slate-200";
              return (
                <div key={w.week_number} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${color}`} style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-ink-soft">{w.week_number}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 card p-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t("prog.history")}</h2>
        {feedbackHistory.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("prog.noFeedback")}</p>
        ) : (
          <ul className="space-y-2">
            {feedbackHistory.map((f, i) => (
              <li key={i} className="rounded-lg border border-line p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-ink">{t("common.week")} {f.week_number}</span>
                  <span className="text-primary">{L.feedback[f.difficulty]}</span>
                </div>
                {f.comment && <p className="mt-1 text-ink-soft">{f.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 card p-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t("prog.timeline")}</h2>
        <ol className="space-y-2">
          {weeks.map((w) => {
            const s = weekStatus(w, topicProgress);
            return (
              <li key={w.week_number} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    s === "completed" ? "bg-emerald-500" : s === "in_progress" ? "bg-amber-500" : "bg-slate-300"
                  }`}
                />
                <span className="w-16 text-ink-soft">{t("common.week")} {w.week_number}</span>
                <span className="flex-1 truncate text-ink">{w.title}</span>
                <span className="text-xs text-ink-soft">{L.status[s]}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-pop-cyan px-6 py-3 text-sm font-black uppercase tracking-wide text-ink shadow-[4px_4px_0_0_#1a1a1a] transition hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_#1a1a1a]"
        >
          ↩ {t("cta.review")}
        </Link>
      </div>
    </div>
  );
}

function Empty() {
  const { t } = useI18n();
  return (
    <div className="p-8">
      <p className="text-ink-soft">{t("empty.noPlan")}</p>
      <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">
        {t("empty.createPath")}
      </Link>
    </div>
  );
}
