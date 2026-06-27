"use client";
import Link from "next/link";
import { usePlan, computeOverallPercent, countByStatus, weekStatus } from "@/context/PlanContext";
import ProgressRing from "@/components/ProgressRing";
import { statusLabelsEs, feedbackLabels } from "@/lib/labels";

export default function ProgressPage() {
  const { state } = usePlan();
  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">Cargando…</div>;
  if (!state.plan)
    return (
      <Empty />
    );

  const { weeks, topicProgress, feedbackHistory } = state;
  const overall = computeOverallPercent(weeks, topicProgress);
  const counts = countByStatus(weeks, topicProgress);

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">Progreso y feedback</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card flex items-center gap-6 p-6">
          <ProgressRing percent={overall} size={140} />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">{counts.completed} de {weeks.length} semanas hechas</p>
            <p className="text-ink-soft">En curso: {counts.inProgress}</p>
            <p className="text-ink-soft">Sin empezar: {counts.notStarted}</p>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Avance semanal</h2>
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
        <h2 className="mb-3 text-sm font-semibold text-ink">Historial de feedback</h2>
        {feedbackHistory.length === 0 ? (
          <p className="text-sm text-ink-soft">Aún no has enviado feedback.</p>
        ) : (
          <ul className="space-y-2">
            {feedbackHistory.map((f, i) => (
              <li key={i} className="rounded-lg border border-line p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-ink">Semana {f.week_number}</span>
                  <span className="text-primary">{feedbackLabels[f.difficulty]}</span>
                </div>
                {f.comment && <p className="mt-1 text-ink-soft">{f.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 card p-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">Cronología del idioma</h2>
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
                <span className="w-16 text-ink-soft">Semana {w.week_number}</span>
                <span className="flex-1 truncate text-ink">{w.title}</span>
                <span className="text-xs text-ink-soft">{statusLabelsEs[s]}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="p-8">
      <p className="text-ink-soft">Aún no hay plan.</p>
      <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">
        Crea tu ruta de aprendizaje →
      </Link>
    </div>
  );
}
