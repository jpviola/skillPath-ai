/**
 * LiangoSeal — Circular badge used as a decorative brand element.
 *
 * Two variants:
 *   - "default": yellow + black border, shows "EST. 2025 · DE PEKÍN A MADRID"
 *     around the rim with the "L" mark in the center.
 *   - "minimal": just the "L" mark inside a circle (for compact uses).
 */
type Variant = "default" | "minimal";

interface Props {
  variant?: Variant;
  size?: number;
  className?: string;
}

export default function LiangoSeal({
  variant = "default",
  size = 80,
  className = "",
}: Props) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-label="LIANGO brand seal"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0"
      >
        {/* Outer black border */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        {/* Inner thin ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1"
        />

        {variant === "default" && (
          <>
            {/* Curved rim text */}
            <defs>
              <path
                id="seal-top-arc"
                d="M 14 50 A 36 36 0 0 1 86 50"
                fill="none"
              />
              <path
                id="seal-bottom-arc"
                d="M 14 50 A 36 36 0 0 0 86 50"
                fill="none"
              />
            </defs>
            <text
              fontSize="9"
              fontWeight="900"
              fill="#1a1a1a"
              letterSpacing="2"
              fontFamily="inherit"
            >
              <textPath href="#seal-top-arc" startOffset="50%" textAnchor="middle">
                EST · 2025
              </textPath>
            </text>
            <text
              fontSize="9"
              fontWeight="900"
              fill="#1a1a1a"
              letterSpacing="2"
              fontFamily="inherit"
            >
              <textPath href="#seal-bottom-arc" startOffset="50%" textAnchor="middle">
                DE PEKÍN A MADRID
              </textPath>
            </text>
          </>
        )}

        {/* Center "L" mark */}
        <text
          x="50"
          y={variant === "default" ? 62 : 66}
          textAnchor="middle"
          fontSize={variant === "default" ? "32" : "40"}
          fontWeight="900"
          fill="#1a1a1a"
          fontFamily="inherit"
        >
          L
        </text>
        {/* Magenta period next to the L */}
        {variant === "default" && (
          <circle cx="68" cy="60" r="3" fill="#ff3d8a" />
        )}
      </svg>
    </div>
  );
}