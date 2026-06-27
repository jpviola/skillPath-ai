"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { generatePlan } from "@/lib/api";
import { levelLabels, prefLabels } from "@/lib/labels";
import type { Level, ResourcePreference } from "@/lib/types";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PREFS: ResourcePreference[] = ["Free only", "Free + Low cost", "Any"];

export default function SettingsPage() {
  const { state, dispatch } = usePlan();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goal, setGoal] = useState(state.userProfile?.goal || "");
  const [level, setLevel] = useState<Level>(state.userProfile?.current_level || "A1");
  const [pref, setPref] = useState<ResourcePreference>(
    state.userProfile?.resource_preference || "Free + Low cost"
  );

  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">Cargando…</div>;
  if (!state.plan || !state.userProfile)
    return (
      <div className="p-8">
        <p className="text-ink-soft">Aún no hay plan.</p>
        <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">
          Crea tu ruta de aprendizaje →
        </Link>
      </div>
    );

  async function regenerate() {
    if (!state.userProfile) return;
    if (!confirm("Regenerar reconstruirá tu plan y reiniciará el progreso. Esto llama a la IA (tiene costo). ¿Continuar?"))
      return;
    setError(null);
    setBusy(true);
    const profile = { ...state.userProfile, goal, current_level: level, resource_preference: pref };
    dispatch({ type: "SET_PROFILE", payload: profile });
    try {
      const plan = await generatePlan(profile);
      dispatch({ type: "SET_PLAN", payload: { ...plan, profile } });
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló.");
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state.plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillpath-${state.plan?.skill || "plan"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function deletePlan() {
    if (!confirm("¿Eliminar tu plan de forma permanente?")) return;
    dispatch({ type: "RESET_PLAN" });
    router.push("/onboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">Ajustes</h1>

      <section className="card p-6">
        <h2 className="text-sm font-semibold text-ink">Preferencias</h2>
        <p className="mb-4 text-xs text-ink-soft">Editar esto regenera tu plan.</p>

        <label className="block text-sm font-medium text-ink">Objetivo</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <label className="mt-4 block text-sm font-medium text-ink">Nivel</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                level === l ? "border-primary bg-primary-light text-primary" : "border-line"
              }`}
            >
              {levelLabels[l]}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-ink">Preferencia de recursos</label>
        <div className="mt-1 flex gap-2">
          {PREFS.map((p) => (
            <button
              key={p}
              onClick={() => setPref(p)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                pref === p ? "border-primary bg-primary-light text-primary" : "border-line"
              }`}
            >
              {prefLabels[p]}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          onClick={regenerate}
          disabled={busy}
          className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Regenerar plan
        </button>
      </section>

      <section className="mt-6 card border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-600">Zona de peligro</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:border-primary/40"
          >
            <Download size={15} /> Exportar plan (JSON)
          </button>
          <button
            onClick={deletePlan}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> Eliminar plan
          </button>
        </div>
      </section>
    </div>
  );
}
