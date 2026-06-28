"use client";
import { useEffect } from "react";
import { usePlan } from "@/context/PlanContext";
import { useI18n } from "@/lib/i18n";
import TutorMascot from "./TutorMascot";

// Layer 2.5 #6 — thin bottom bar shown for 5s after feedback adaptation.
// The bar carries a small Ziggy avatar on the left so the personality
// of the brand (and the "¡Nuevo patrón desbloqueado!" message) lands
// with one quick glance, not just a generic brain icon.
export default function AdaptationBanner() {
  const { state, dispatch } = usePlan();
  const { t } = useI18n();

  useEffect(() => {
    if (state.showAdaptationBanner) {
      const t = setTimeout(() => dispatch({ type: "HIDE_ADAPTATION_BANNER" }), 5000);
      return () => clearTimeout(t);
    }
  }, [state.showAdaptationBanner, dispatch]);

  if (!state.showAdaptationBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t-[3px] border-ink bg-pop-magenta px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-white shadow-[0_-4px_0_0_#1a1a1a] sm:text-sm">
      <TutorMascot variant="celebrate" size={36} />
      <span>
        {state.adaptationNote ? state.adaptationNote : t("banner.default")}
      </span>
    </div>
  );
}
