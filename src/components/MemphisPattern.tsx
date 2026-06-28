/**
 * MemphisPattern — A reusable decorative backdrop made of Memphis primitives
 * (zigzag, dots, triangles, circles) with subtle opacity. Use it as a
 * positioned-background on hero sections, dashboard cards, etc.
 *
 * Pass `intensity="low" | "med" | "high"` to control visual density.
 */
type Intensity = "low" | "med" | "high";
type Variant = "hero" | "card" | "sidebar";

interface Props {
  intensity?: Intensity;
  variant?: Variant;
  className?: string;
}

export default function MemphisPattern({
  intensity = "low",
  variant = "hero",
  className = "",
}: Props) {
  const opacityMap = { low: "opacity-[0.12]", med: "opacity-20", high: "opacity-30" };
  const o = opacityMap[intensity];

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${o} ${className}`}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <path
          id="liango-wave"
          d="M 0 10 C 10 0, 20 0, 30 10 S 50 20, 60 10 S 80 0, 90 10 S 110 20, 120 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <pattern
          id="liango-spark"
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path d="M14 2 L18 10 L26 14 L18 18 L14 26 L10 18 L2 14 L10 10 Z" fill="currentColor" />
        </pattern>
      </defs>

      <rect width="400" height="400" fill="none" />

      {/* Hero: scattered shapes */}
      {variant === "hero" && (
        <>
          <polygon
            points="48,32 63,18 79,24 86,40 74,55 56,50"
            fill="#ff3d8a"
            stroke="#1a1a1a"
            strokeWidth="3"
          />
          <path
            d="M 24 90 C 40 70, 56 70, 72 90 S 104 110, 120 90"
            fill="none"
            stroke="#00d4d8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 270 38 C 286 8, 318 8, 336 36 C 350 58, 342 80, 320 90"
            fill="#ffd23f"
            stroke="#1a1a1a"
            strokeWidth="3"
          />
          <use href="#liango-wave" x="180" y="274" className="text-ink" />
          <use href="#liango-wave" x="30" y="204" className="text-ink" transform="scale(-1 1) translate(-120 0)" />
          <rect x="336" y="208" width="22" height="22" fill="url(#liango-spark)" className="text-pop-magenta" />
        </>
      )}

      {/* Card: subtle corner decorations only */}
      {variant === "card" && (
        <>
          <polygon points="14,18 26,10 38,18 30,31 18,31" fill="#ffd23f" stroke="#1a1a1a" strokeWidth="2.5" />
          <path
            d="M 360 374 C 368 358, 384 356, 392 370"
            fill="none"
            stroke="#ff3d8a"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Sidebar: vertical accent */}
      {variant === "sidebar" && (
        <>
          <use href="#liango-wave" x="0" y="378" className="text-white" />
          <polygon points="344,36 364,22 386,30 382,54 360,60 342,48" fill="#ffd23f" stroke="#1a1a1a" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
