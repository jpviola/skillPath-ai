/**
 * LiangoLogo — Brand mark for LIANGO.
 *
 * Three visual styles:
 *   - "default": chunky "LO" with embedded "a" inside the O. The L is cyan/blue,
 *     the O is pink/magenta, both on a yellow box, with thick black outlines.
 *     This is the primary mark seen in the brand reference.
 *   - "wordmark": just the text "LIANGO" with a magenta period, no box.
 *   - "minimal": black-and-white outline version for compact contexts.
 *
 * The conceptual reference is the Chinese character "连" (lián, "to
 * connect / to link") reinterpreted as a Memphis LO with a zigzag accent.
 */
type Variant = "default" | "wordmark" | "minimal";

interface Props {
  variant?: Variant;
  size?: number;
  className?: string;
}

export default function LiangoLogo({
  variant = "default",
  size = 56,
  className = "",
}: Props) {
  if (variant === "wordmark") {
    return (
      <span className={`relative inline-flex items-end font-display font-black uppercase tracking-tight ${className}`}>
        <span
          className="absolute left-[4px] top-[4px] text-pop-cyan"
          aria-hidden="true"
          style={{ transform: "skewX(-8deg)" }}
        >
          LIANGO.
        </span>
        <span
          className="absolute left-[8px] top-[2px] text-pop-magenta"
          aria-hidden="true"
          style={{ transform: "skewX(-8deg)" }}
        >
          LIANGO.
        </span>
        <span className="relative z-10 text-current" style={{ transform: "skewX(-8deg)" }}>
          <span className="text-pop-yellow drop-shadow-[2px_2px_0_#1a1a1a]">L</span>
          <span className="drop-shadow-[2px_2px_0_#1a1a1a]">I</span>
          <span className="text-pop-cyan drop-shadow-[2px_2px_0_#1a1a1a]">A</span>
          <span className="drop-shadow-[2px_2px_0_#1a1a1a]">N</span>
          <span className="drop-shadow-[2px_2px_0_#1a1a1a]">G</span>
          <span className="text-pop-magenta drop-shadow-[2px_2px_0_#1a1a1a]">O</span>
          <span className="text-pop-magenta drop-shadow-[2px_2px_0_#1a1a1a]">.</span>
        </span>
      </span>
    );
  }

  const isMinimal = variant === "minimal";

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-label="LIANGO"
    >
      {/* Yellow background square, slightly rotated, chunky black border + shadow */}
      <span
        className="absolute inset-0 rounded-md border-[3px] border-ink bg-pop-yellow shadow-[3px_3px_0_0_#1a1a1a]"
        style={{ transform: "rotate(-4deg)" }}
      />

      {/* The "LO" */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        style={{ transform: "rotate(-4deg)" }}
        aria-hidden="true"
      >
        {/* L shape — cyan/blue, drawn with thick stroke */}
        <g transform="translate(8 12)">
          <path
            d="M 4 4 L 4 64 L 44 64"
            fill="none"
            stroke={isMinimal ? "#1a1a1a" : "#00b3ff"}
            strokeWidth="11"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </g>

        {/* O shape — pink/magenta ring */}
        <g transform="translate(48 14)">
          <ellipse
            cx="22"
            cy="32"
            rx="22"
            ry="32"
            fill={isMinimal ? "none" : "#ff3d8a"}
            stroke="#1a1a1a"
            strokeWidth="4"
          />
          {/* Inner cutout */}
          <ellipse
            cx="22"
            cy="32"
            rx="10"
            ry="18"
            fill={isMinimal ? "#fff" : "#fff8ec"}
            stroke="#1a1a1a"
            strokeWidth="3"
          />
          {/* Lowercase "a" inside the O */}
          {!isMinimal && (
            <text
              x="22"
              y="44"
              textAnchor="middle"
              fontSize="24"
              fontWeight="900"
              fill="#1a1a1a"
              fontFamily="inherit"
            >
              a
            </text>
          )}
        </g>
      </svg>

      {/* Memphis zigzag accent — top-right corner */}
      <svg
        viewBox="0 0 24 24"
        className="absolute -right-1 -top-1 h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M2 8 L6 4 L10 8 L14 4 L18 8 L22 4"
          fill="none"
          stroke="#ff3d8a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
