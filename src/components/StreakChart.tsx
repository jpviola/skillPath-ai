/**
 * StreakChart — A zigzag line visualization showing the user's study streak
 * over the last N days. Matches the brand reference: chunky black line,
 * colored nodes (cyan / yellow / magenta / coral) for each day, day labels.
 */
interface Props {
  days?: number; // number of days to show
  currentStreak?: number; // 0..N — highlights the current day node
  className?: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Each day has a different Memphis pop color, in order.
const NODE_COLORS = [
  "#1a1a1a", // day 0 (start)
  "#00d4d8", // cyan
  "#ffd23f", // yellow
  "#ff3d8a", // magenta
  "#ff6b6b", // coral
  "#1a1a1a", // ink
  "#1a1a1a", // end
];

export default function StreakChart({
  days = 7,
  currentStreak = 0,
  className = "",
}: Props) {
  // Zigzag points — Y alternates up/down for a Memphis "broken" feel.
  // We render from (0, h/2) to (w, h/2) and add a peak/valley in the middle.
  const w = 280;
  const h = 120;
  const padding = 16;
  const usableW = w - padding * 2;
  const stepX = usableW / (days - 1);
  const midY = h / 2;
  const amplitude = 36;

  const points = Array.from({ length: days }, (_, i) => {
    const x = padding + i * stepX;
    let y = midY;
    if (i > 0 && i < days - 1) {
      // alternate: up on even, down on odd
      y = midY + (i % 2 === 0 ? -amplitude : amplitude);
    } else if (i === days - 1) {
      y = midY; // end flat
    }
    return { x, y };
  });

  // Build the polyline path
  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <div className={`relative w-full max-w-[300px] ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Study streak: ${currentStreak} consecutive days`}
      >
        {/* The main zigzag line — chunky black stroke with slight white halo */}
        <path
          d={path}
          fill="none"
          stroke="#fff8ec"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Nodes for each day */}
        {points.map((p, i) => {
          const isToday = i === days - 1;
          const isActive = i < currentStreak;
          const color = isActive ? NODE_COLORS[i] : "#1a1a1a";
          const fill = isActive ? color : "#fff8ec";
          return (
            <g key={i}>
              {/* Black ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isToday ? 10 : 7}
                fill={fill}
                stroke="#1a1a1a"
                strokeWidth="3"
              />
              {/* Inner dot for current day */}
              {isToday && (
                <circle cx={p.x} cy={p.y} r="3" fill="#1a1a1a" />
              )}
            </g>
          );
        })}
        {/* Day labels */}
        {points.map((p, i) => {
          const labelIdx = (i + 1) % 7; // shift so "Mon" is leftmost-ish
          return (
            <text
              key={`l${i}`}
              x={p.x}
              y={h - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#1a1a1a"
              fontFamily="inherit"
            >
              {DAY_LABELS[labelIdx]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}