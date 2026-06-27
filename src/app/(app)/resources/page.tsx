"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Star } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { costStyles } from "@/lib/ui";
import { resourceTypeLabels, costLabels } from "@/lib/labels";
import type { ResourceType } from "@/lib/types";

const TYPES: ResourceType[] = ["Video", "Podcast", "Article", "App", "Interactive", "Flashcards"];

export default function ResourcesPage() {
  const { state } = usePlan();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResourceType | "All">("All");

  const all = useMemo(() => {
    if (!state.plan) return [];
    const seen = new Set<string>();
    return state.weeks
      .flatMap((w) => w.topics.flatMap((t) => t.resources.map((r) => ({ ...r, week: w.week_number }))))
      .filter((r) => {
        const key = r.title + r.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [state.plan, state.weeks]);

  const filtered = all.filter(
    (r) =>
      (filter === "All" || r.type === filter) &&
      r.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">Cargando…</div>;
  if (!state.plan)
    return (
      <div className="p-8">
        <p className="text-ink-soft">Aún no hay plan.</p>
        <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">
          Crea tu ruta de aprendizaje →
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
      <h1 className="mb-1 text-2xl font-bold text-ink">Biblioteca de recursos</h1>
      <p className="mb-5 text-sm text-ink-soft">Todos los enlaces de tu plan de {state.plan.skill}.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recursos…"
          className="w-full rounded-lg border border-line py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", ...TYPES] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === t
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-ink hover:border-primary/40"
            }`}
          >
            {t === "All" ? "Todos" : resourceTypeLabels[t]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-medium text-ink-soft">{resourceTypeLabels[r.type]}</span>
              {r.preferred && <Star size={14} className="fill-amber-400 text-amber-400" />}
            </div>
            <p className="mt-1 text-sm font-medium text-ink">{r.title}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${costStyles[r.cost]}`}>
                {costLabels[r.cost]}
              </span>
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Abrir <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-[10px] text-ink-soft">Semana {r.week}</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-ink-soft">No hay recursos que coincidan.</p>
        )}
      </div>
    </div>
  );
}
