import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TutorMascot from "../TutorMascot";

// Mock the i18n hook so we don't need a PlanProvider
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "es",
    t: (key: string, vars?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        "game.tutorCalm": "Tranquilo, el español tiene sus curvas.",
        "game.tutorThinking": "Alineando piezas…",
        "game.pieceSnapped": "¡PIEZA ENCAJADA!",
        "game.patternUnlocked": "¡Nuevo patrón desbloqueado!",
      };
      const v = map[key] ?? key;
      if (!vars) return v;
      return Object.entries(vars).reduce(
        (acc, [k, val]) => acc.replace(`{${k}}`, String(val)),
        v
      );
    },
  }),
}));

describe("TutorMascot", () => {
  it("renders without crashing", () => {
    const { container } = render(<TutorMascot />);
    // The mascot is an inline SVG with a default viewBox
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders the role=img with an aria-label", () => {
    const { container } = render(<TutorMascot />);
    const svg = container.querySelector('[role="img"]');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("aria-label")).toBe("Ziggy, LIANGO tutor");
  });

  it("respects the size prop on the SVG", () => {
    const { container } = render(<TutorMascot size={120} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("120");
  });

  it("renders the speech bubble when bubble=true", () => {
    render(<TutorMascot bubble bubbleKey="tutorCalm" />);
    expect(screen.getByText(/Tranquilo, el español/)).toBeInTheDocument();
  });

  it("does NOT render the speech bubble when bubble=false", () => {
    render(<TutorMascot bubble={false} bubbleKey="tutorCalm" />);
    expect(screen.queryByText(/Tranquilo, el español/)).not.toBeInTheDocument();
  });

  it("renders different bubble text for different keys", () => {
    const { rerender } = render(<TutorMascot bubble bubbleKey="tutorThinking" />);
    expect(screen.getByText(/Alineando piezas/)).toBeInTheDocument();
    rerender(<TutorMascot bubble bubbleKey="pieceSnapped" />);
    expect(screen.getByText(/PIEZA ENCAJADA/)).toBeInTheDocument();
  });

  it("includes a status role on the bubble for accessibility", () => {
    render(<TutorMascot bubble bubbleKey="tutorCalm" />);
    const bubble = screen.getByRole("status");
    expect(bubble).toBeInTheDocument();
  });
});
