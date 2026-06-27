"use client";
import { useEffect } from "react";
import { Brain } from "lucide-react";
import { usePlan } from "@/context/PlanContext";

// Layer 2.5 #6 — thin bottom bar shown for 5s after feedback adaptation.
export default function AdaptationBanner() {
  const { state, dispatch } = usePlan();

  useEffect(() => {
    if (state.showAdaptationBanner) {
      const t = setTimeout(() => dispatch({ type: "HIDE_ADAPTATION_BANNER" }), 5000);
      return () => clearTimeout(t);
    }
  }, [state.showAdaptationBanner, dispatch]);

  if (!state.showAdaptationBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-primary px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
      <Brain size={16} className="shrink-0" />
      <span>
        {state.adaptationNote
          ? state.adaptationNote
          : "SkillPath AI ha ajustado tus próximas semanas según tu feedback."}
      </span>
    </div>
  );
}
