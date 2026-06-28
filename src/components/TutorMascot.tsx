
"use client";
import { useI18n } from "@/lib/i18n";

/**
 * TutorMascot — "Ziggy", the LIANGO tutor.
 *
 * Memphis-style blob character: round yellow body, chunky black outlines,
 * big expressive eyes, a small zigzag tail (a play on the "Lian" / 连
 * character and the product tagline "De Pekín a Madrid en un solo zigzag").
 */
type Variant = "calm" | "thinking" | "celebrate" | "wave";
type Mood = "auto" | Variant;

interface Props {
  variant?: Mood;
  size?: number;
  bubble?: boolean;
  bubbleKey?: "tutorCalm" | "tutorThinking" | "patternUnlocked" | "pieceSnapped";
  className?: string;
}

export default function TutorMascot({
  variant = "auto",
  size = 96,
  bubble = false,
  bubbleKey = "tutorCalm",
  className = "",
}: Props) {
  const { t, locale } = useI18n();
  const resolved: Variant = useAutoVariant(variant);
  const bubbleText = bubble ? t(`game.${bubbleKey}`) : null;

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      style={{ width: size * 1.6, minHeight: size * (bubble ? 1.9 : 1.1) }}
    >
      {bubbleText && (
        <div
          className="relative mb-2 max-w-[240px] rounded-2xl border-[3px] border-ink bg-white px-3 py-2 text-center text-[11px] font-black uppercase leading-snug text-ink shadow-[3px_3px_0_0_#1a1a1a]"
          role="status"
        >
          {bubbleText}
          <span
            className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-ink bg-white"
            aria-hidden="true"
          />
        </div>
      )}
      <MascotSvg size={size} variant={resolved} locale={locale} />
    </div>
  );
}

function MascotSvg({
  size,
  variant,
  locale,
}: {
  size: number;
  variant: Variant;
  locale: string;
}) {
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      aria-label="Ziggy, LIANGO tutor"
      role="img"
      className="drop-shadow-[2px_2px_0_0_#1a1a1a]"
    >
      {/* Zigzag tail (signature) */}
      <path
        d="M 78 70 L 88 60 L 84 50 L 92 42 L 86 32"
        fill="none"
        stroke="#ff3d8a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body — yellow Memphis circle with chunky border */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="#ffd23f"
        stroke="#1a1a1a"
        strokeWidth="4"
      />
      {/* Cheek dots (Memphis style) */}
      <circle cx="32" cy="58" r="3" fill="#ff6b6b" />
      <circle cx="68" cy="58" r="3" fill="#ff6b6b" />
      {/* Eyes + mouth — switch by variant */}
      {variant === "thinking" ? (
        <g>
          <path d="M 36 44 Q 42 38 48 44" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 52 44 Q 58 38 64 44" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="38" cy="64" r="1.8" fill="#1a1a1a" />
          <circle cx="50" cy="64" r="1.8" fill="#1a1a1a" />
          <circle cx="62" cy="64" r="1.8" fill="#1a1a1a" />
        </g>
      ) : variant === "celebrate" ? (
        <g>
          <path d="M 36 44 Q 42 36 48 44" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 52 44 Q 58 36 64 44" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 36 60 Q 50 76 64 60" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="40" cy="46" r="3.5" fill="#1a1a1a" />
          <circle cx="60" cy="46" r="3.5" fill="#1a1a1a" />
          <path
            d="M 40 60 Q 50 66 60 60"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {/* Wave arm — only on "wave" */}
      {variant === "wave" && (
        <g>
          <path
            d="M 78 50 Q 88 40 82 30"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="82" cy="30" r="4" fill="#ffd23f" stroke="#1a1a1a" strokeWidth="2" />
        </g>
      )}
      {/* Name plate — only on non-English locales (Ziggy is universal, the name writes itself) */}
      {locale !== "en" && (
        <text
          x="50"
          y="105"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill="#1a1a1a"
          letterSpacing="2"
        >
          ZIGGY
        </text>
      )}
    </svg>
  );
}

/**
 * useAutoVariant — when `variant` is "auto", we rotate through calm → thinking
 * → wave → celebrate over a 16s cycle. This makes Ziggy feel alive on long
 * pages (study mode) without being noisy.
 */
import { useState, useEffect } from "react";
function useAutoVariant(mode: Mood): Variant {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (mode !== "auto") return;
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, [mode]);
  if (mode !== "auto") return mode;
  const seq: Variant[] = ["calm", "thinking", "wave", "celebrate"];
  return seq[tick % seq.length];
}
