"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { generatePlan } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Level, ResourcePreference } from "@/lib/types";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PREFS: ResourcePreference[] = ["Free only", "Free + Low cost", "Any"];

export default function SettingsPage() {
  const { state, dispatch } = usePlan();
  const { t, L, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<Level>("A1");
  const [pref, setPref] = useState<ResourcePreference>("Free + Low cost");

  // BUGFIX: `useState(initial)` only runs once on mount. Before the PlanProvider
  // finishes hydrating from localStorage, state.userProfile is null and the
  // form would have shown empty/default values forever — the user could edit
  // them and overwrite their real preferences on save. We sync local state
  // exactly once, when hydration finishes and the profile first becomes
  // available. After that the user owns the inputs.
  const didSync = useRef(false);
  useEffect(() => {
    if (didSync.current) return;
    if (!state.hydrated || !state.userProfile) return;
    didSync.current = true;
    queueMicrotask(() => {
      setGoal(state.userProfile!.goal);
      setLevel(state.userProfile!.current_level);
      setPref(state.userProfile!.resource_preference);
    });
  }, [state.hydrated, state.userProfile]);

  if (!state.hydrated) return <div className="p-8 text-sm text-ink-soft">{t("dash.loading")}</div>;
  if (!state.plan || !state.userProfile)
    return (
      <div className="p-8">
        <p className="text-ink-soft">{t("empty.noPlan")}</p>
        <Link href="/onboard" className="mt-2 inline-block text-primary hover:underline">
          {t("empty.createPath")}
        </Link>
      </div>
    );

  async function regenerate() {
    if (!state.userProfile) return;
    if (!confirm(t("set.confirmRegen"))) return;
    setError(null);
    setBusy(true);
    const profile = { ...state.userProfile, goal, current_level: level, resource_preference: pref };
    dispatch({ type: "SET_PROFILE", payload: profile });
    try {
      const plan = await generatePlan(profile, locale);
      dispatch({ type: "SET_PLAN", payload: { ...plan, profile } });
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("set.failed"));
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    // BUGFIX: used to dump only `state.plan`, losing the user profile,
    // topic progress, feedback history and study logs. The exported file
    // is now a complete snapshot of the user's state, suitable for backup.
    const snapshot = {
      exportedAt: new Date().toISOString(),
      appVersion: "skillpath-ai-1.0",
      userProfile: state.userProfile,
      plan: state.plan,
      topicProgress: state.topicProgress,
      feedbackHistory: state.feedbackHistory,
      dailyLogs: state.dailyLogs,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillpath-${state.plan?.skill || "plan"}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function deletePlan() {
    if (!confirm(t("set.confirmDelete"))) return;
    dispatch({ type: "RESET_PLAN" });
    router.push("/onboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink">{t("set.title")}</h1>

      <section className="card p-6">
        <h2 className="text-sm font-semibold text-ink">{t("set.prefs")}</h2>
        <p className="mb-4 text-xs text-ink-soft">{t("set.prefsSub")}</p>

        <label className="block text-sm font-medium text-ink">{t("set.goal")}</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <label className="mt-4 block text-sm font-medium text-ink">{t("set.level")}</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                level === l ? "border-primary bg-primary-light text-primary" : "border-line"
              }`}
            >
              {L.level[l]}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-ink">{t("set.resourcePref")}</label>
        <div className="mt-1 flex gap-2">
          {PREFS.map((p) => (
            <button
              key={p}
              onClick={() => setPref(p)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                pref === p ? "border-primary bg-primary-light text-primary" : "border-line"
              }`}
            >
              {L.pref[p]}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          onClick={regenerate}
          disabled={busy}
          className="btn btn-primary mt-5 px-5 py-2.5 text-sm"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          {t("set.regenerate")}
        </button>
      </section>

      {/* Premium CTA — Memphis vibe */}
      <section className="mt-6 relative overflow-hidden rounded-2xl border-[3px] border-ink bg-gradient-to-br from-pop-magenta to-pop-coral p-6 text-white shadow-[5px_5px_0_0_#1a1a1a]">
        <div className="relative z-10">
          <h2 className="font-display text-xl font-black uppercase tracking-tight">LIANGO+</h2>
          <p className="mt-2 max-w-md text-sm font-medium text-white/95">
            {t("cta.premium")} · {t("cta.moreLanguages")}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-pop-yellow px-5 py-2.5 text-sm font-black uppercase tracking-wide text-ink shadow-[3px_3px_0_0_#1a1a1a] transition hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#1a1a1a]"
          >
            ✨ {t("cta.premium")} →
          </button>
        </div>
        {/* Memphis decorations */}
        <div className="memphis-shape absolute -right-8 -top-8 h-24 w-24 rounded-full border-[3px] border-ink bg-pop-yellow" />
        <div className="memphis-shape absolute -bottom-6 right-12 h-12 w-12 rotate-12 rounded-md border-[3px] border-ink bg-pop-cyan" />
      </section>

      <section className="mt-6 card border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-600">{t("set.danger")}</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:border-primary/40"
          >
            <Download size={15} /> {t("set.export")}
          </button>
          <button
            onClick={deletePlan}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> {t("set.delete")}
          </button>
        </div>
      </section>
    </div>
  );
}
