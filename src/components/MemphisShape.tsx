"use client";
import { type HTMLAttributes } from "react";

/**
 * MemphisShape — decorative geometric primitives for the LIANGO brand.
 *
 * Memphis design language: thick black borders, saturated pop colors,
 * geometric shapes placed at jaunty angles. Pass `variant` to pick the
 * primitive and arbitrary className for position/size/rotation.
 */
type Variant = "polyhedron" | "fractal" | "curve" | "blob" | "ribbon";

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export default function MemphisShape({
  variant = "polyhedron",
  className = "",
  style,
  ...rest
}: Props) {
  const base = "pointer-events-none absolute z-0";

  if (variant === "fractal") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${base} ${className}`}
        style={style}
        aria-hidden="true"
        {...rest}
      >
        <g fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 70 L24 18 L38 70 L50 18 L62 70 L76 18 L88 70" />
          <path d="M22 58 L34 36 L46 58 L58 36 L70 58 L82 36" />
          <path d="M18 82 L82 82" />
        </g>
        <circle cx="28" cy="22" r="5" fill="#ffd23f" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="54" cy="18" r="5" fill="#ff3d8a" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="74" cy="24" r="5" fill="#00d4d8" stroke="#1a1a1a" strokeWidth="3" />
      </svg>
    );
  }

  if (variant === "curve") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${base} ${className}`}
        style={style}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M18 66 C18 36, 42 22, 58 22 C76 22, 84 36, 84 50 C84 70, 66 82, 48 82 C36 82, 24 78, 18 66 Z"
          fill="#ff3d8a"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        <path
          d="M30 63 C30 45, 45 34, 58 34 C70 34, 76 43, 76 52 C76 66, 63 74, 49 74 C40 74, 33 70, 30 63 Z"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        <path
          d="M42 59 C42 50, 49 44, 56 44 C64 44, 68 49, 68 55 C68 64, 60 68, 52 68 C46 68, 43 64, 42 59 Z"
          fill="#00d4d8"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if (variant === "ribbon") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${base} ${className}`}
        style={style}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M14 62 C25 16, 56 16, 67 50 C74 69, 88 72, 90 48"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M14 62 C25 16, 56 16, 67 50 C74 69, 88 72, 90 48"
          fill="none"
          stroke="#ff3d8a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M31 52 C39 33, 56 28, 64 42 C69 51, 76 54, 83 45"
          fill="none"
          stroke="#ffd23f"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "blob") {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${base} ${className}`}
        style={style}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M23 25 C36 10, 60 12, 74 26 C88 40, 90 63, 75 77 C60 91, 36 90, 22 76 C8 61, 10 39, 23 25 Z"
          fill="#c5a3ff"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        <path
          d="M34 38 C43 28, 56 29, 65 38 C74 48, 75 60, 66 69 C56 79, 43 78, 34 68 C24 59, 25 47, 34 38 Z"
          fill="#ffd23f"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${base} ${className}`}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      <polygon
        points="50,10 84,28 90,62 50,90 10,62 16,28"
        fill="#00d4d8"
        stroke="#1a1a1a"
        strokeWidth="4"
      />
      <polygon
        points="50,22 74,34 78,58 50,72 22,58 26,34"
        fill="#ff3d8a"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      <polygon
        points="50,34 64,40 66,54 50,62 34,54 36,40"
        fill="#ffd23f"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
    </svg>
  );
}
