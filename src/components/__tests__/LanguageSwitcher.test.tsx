import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageSwitcher from "../LanguageSwitcher";

// Mock the PlanContext module
vi.mock("@/context/PlanContext", () => ({
  usePlan: () => ({
    state: { locale: "es" },
    dispatch: vi.fn(),
  }),
}));

// Mock the i18n module — the useI18n hook uses usePlan internally.
// We need to mock it because it calls usePlan which we already mocked above.
// But the component imports useI18n directly from "@/lib/i18n", not from context.
// So we need to mock the i18n module instead.
vi.mock("@/lib/i18n", () => ({
  LOCALES: ["es", "en", "zh"],
  localeName: { es: "Español", en: "English", zh: "中文" },
  useI18n: () => ({
    locale: "es",
    setLocale: vi.fn(),
    t: (key: string) => key,
    L: {
      level: { A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1", C2: "C2" },
      style: { Conversation: "Conversation", Listening: "Listening", Reading: "Reading", "Apps & games": "Apps & games" },
      pref: { "Free only": "Free only", "Free + Low cost": "Free + low cost", Any: "Any" },
      topicType: {} as Record<string, string>,
      resourceType: {} as Record<string, string>,
      cost: {} as Record<string, string>,
      status: {} as Record<string, string>,
      feedback: {} as Record<string, string>,
      difficulty: {} as Record<string, string>,
      focus: {} as Record<string, string>,
    },
  }),
}));

describe("LanguageSwitcher", () => {
  it("renders all locale buttons", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("es")).toBeInTheDocument();
    expect(screen.getByText("en")).toBeInTheDocument();
    expect(screen.getByText("zh")).toBeInTheDocument();
  });

  it("highlights the active locale", () => {
    render(<LanguageSwitcher />);
    const esButton = screen.getByText("es");
    expect(esButton.className).toContain("bg-primary");
  });

  it("applies dark tone classes", () => {
    const { container } = render(<LanguageSwitcher tone="dark" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("border-white");
  });
});
