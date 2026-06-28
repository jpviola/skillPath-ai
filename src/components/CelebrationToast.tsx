"use client";
import { PartyPopper } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * CelebrationToast — appears when a topic is completed.
 * Matches the brand reference: chunky yellow box with "¡PIEZA ENCAJADA!" text,
 * pink offset shadow, 3D Memphis shapes (cube, cone, cylinder) flying around,
 * small star and dot decorations.
 */
export default function CelebrationToast() {
  const { t } = useI18n();
  return (
    <div className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2">
      {/* Flying Memphis shapes (absolute, behind the toast) */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Cyan cube top-left */}
        <span className="absolute -left-12 -top-3 h-5 w-5 rotate-12 border-[2px] border-ink bg-pop-cyan" />
        {/* Magenta triangle top-right */}
        <span
          className="absolute -right-8 -top-2 h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-pop-magenta"
          style={{ transform: "rotate(20deg)" }}
        />
        {/* Yellow circle right */}
        <span className="absolute -right-6 top-3 h-4 w-4 rounded-full border-[2px] border-ink bg-pop-yellow" />
        {/* Coral cone left */}
        <span
          className="absolute -left-10 top-3 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-pop-coral"
          style={{ transform: "rotate(-15deg)" }}
        />
        {/* Star top */}
        <span
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-pop-magenta"
          style={{ fontSize: "20px" }}
        >
          ★
        </span>
        {/* Tiny dot bottom-right */}
        <span className="absolute -bottom-2 -right-3 h-2 w-2 rounded-full bg-pop-cyan" />
        {/* Tiny dot bottom-left */}
        <span className="absolute -bottom-1 -left-6 h-1.5 w-1.5 rounded-full bg-pop-magenta" />
        {/* Squiggle line bottom */}
        <svg
          viewBox="0 0 24 8"
          className="absolute -bottom-3 left-1/2 h-2 w-8 -translate-x-1/2"
          aria-hidden="true"
        >
          <path
            d="M2 4 Q 6 0, 12 4 T 22 4"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* The toast itself — chunky yellow with pink offset shadow */}
      <div
        role="status"
        aria-live="polite"
        className="piece-snap flex items-center gap-2 whitespace-nowrap rounded-md border-[3px] border-ink bg-pop-yellow px-4 py-1.5 text-xs font-black uppercase tracking-wide text-ink shadow-pink-sm"
      >
        <PartyPopper size={14} />
        {t("game.pieceSnapped")}
      </div>
    </div>
  );
}