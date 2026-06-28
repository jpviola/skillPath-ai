import { type CSSProperties } from "react";

/**
 * MemphisWaves — the flowing "strings" line pattern (à la the Vespa footer):
 * a bundle of roughly-parallel wavy lines that braid across the band. Pure,
 * deterministic SVG (no randomness → no hydration mismatch). Stretches to fill
 * its container via preserveAspectRatio="none"; place it behind content.
 *
 * Tune with props; defaults read well as a full-width background band.
 */
interface Props {
  className?: string;
  style?: CSSProperties;
  /** Stroke color of the lines. */
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  /** How many lines in the bundle. */
  lines?: number;
  /** Peak vertical travel of the waves, in viewBox units. */
  amplitude?: number;
}

const W = 1200;
const H = 320;
const SAMPLES = 64;

/** One wavy polyline. baseline shifts it down; phase/amp/wavelength shape it. */
function wavePath(baseline: number, amp: number, wavelength: number, phase: number): string {
  let d = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (i / SAMPLES) * W;
    // Two stacked sines give the braided, non-uniform look of the reference.
    const y =
      baseline +
      amp * Math.sin((x / wavelength) * Math.PI * 2 + phase) +
      amp * 0.35 * Math.sin((x / (wavelength * 0.5)) * Math.PI * 2 + phase * 1.7);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

export default function MemphisWaves({
  className = "",
  style,
  stroke = "#1a1a1a",
  strokeOpacity = 1,
  strokeWidth = 2,
  lines = 22,
  amplitude = 26,
}: Props) {
  const gap = H / (lines + 1);
  const paths = Array.from({ length: lines }, (_, i) => {
    // Vary amplitude and phase per line so the bundle fans and crosses
    // instead of marching in lockstep.
    const t = i / (lines - 1);
    const amp = amplitude * (0.55 + 0.45 * Math.sin(t * Math.PI));
    const wavelength = 360 + 140 * Math.sin(t * Math.PI * 1.3);
    const phase = t * Math.PI * 2.2;
    return wavePath(gap * (i + 1), amp, wavelength, phase);
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={strokeWidth} strokeLinecap="round">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
