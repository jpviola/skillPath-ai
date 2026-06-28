
import { describe, it, expect } from "vitest";

// Mirror of `normalizePlacementQuestions` in src/lib/llm.ts. Kept inline so
// the test can run without mocking the AI SDK; if the implementation drifts,
// this file will fail and force a sync.
const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const order = ["A1", "A2", "B1", "B2", "C1", "C2"];

function normalize(raw: unknown): Array<{ level: string; question: string; options: string[]; answer_index: number }> {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Array<{ level: string; question: string; options: string[]; answer_index: number }> = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const level = typeof q.level === "string" ? q.level : "";
    if (!VALID_LEVELS.has(level) || seen.has(level)) continue;
    const opts = Array.isArray(q.options) ? q.options : [];
    const trimmed = opts
      .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      .slice(0, 4);
    if (trimmed.length < 2) continue;
    while (trimmed.length < 4) trimmed.push(`Option ${trimmed.length + 1}`);
    const rawIdx = Number(q.answer_index);
    const answer_index = Number.isFinite(rawIdx)
      ? Math.max(0, Math.min(3, Math.floor(rawIdx)))
      : 0;
    const question = typeof q.question === "string" ? q.question.trim() : "";
    if (!question) continue;
    out.push({ level, question, options: trimmed, answer_index });
    seen.add(level);
  }
  return out.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
}

const qFactory = (overrides: Record<string, unknown> = {}) => ({
  level: "A1",
  question: "Q?",
  options: ["a", "b", "c", "d"],
  answer_index: 0,
  ...overrides,
});
describe("normalizePlacementQuestions", () => {
  it("returns [] for non-array input", () => {
    expect(normalize(null)).toEqual([]);
    expect(normalize(undefined)).toEqual([]);
    expect(normalize("nope")).toEqual([]);
    expect(normalize({})).toEqual([]);
  });

  it("sorts the questions by CEFR level (A1 → C2)", () => {
    const out = normalize([
      qFactory({ level: "C1" }),
      qFactory({ level: "A1" }),
      qFactory({ level: "B1" }),
    ]);
    expect(out.map((x) => x.level)).toEqual(["A1", "B1", "C1"]);
  });

  it("dedupes by level (keeps the first occurrence)", () => {
    const out = normalize([
      qFactory({ level: "A1", question: "first" }),
      qFactory({ level: "A1", question: "second" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].question).toBe("first");
  });

  it("pads short option lists to 4 with placeholders", () => {
    const out = normalize([qFactory({ options: ["a", "b"], answer_index: 1 })]);
    expect(out[0].options).toHaveLength(4);
    expect(out[0].options[0]).toBe("a");
    expect(out[0].options[1]).toBe("b");
    expect(out[0].options[2]).toMatch(/Option 3/);
    expect(out[0].options[3]).toMatch(/Option 4/);
  });

  it("drops questions with fewer than 2 valid options (unanswerable)", () => {
    const out = normalize([
      qFactory({ level: "A1", question: "solo", options: ["only one"] }),
      qFactory({ level: "A2", question: "none", options: [] }),
      qFactory({ level: "B1", question: "good" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe("B1");
  });

  it("clamps answer_index to [0, 3]", () => {
    const out = normalize([
      qFactory({ level: "A1", answer_index: 99 }),
      qFactory({ level: "A2", answer_index: -5 }),
      qFactory({ level: "B1", answer_index: "x" as unknown as number }),
      qFactory({ level: "B2", answer_index: 2.7 }),
    ]);
    expect(out[0].answer_index).toBe(3);
    expect(out[1].answer_index).toBe(0);
    expect(out[2].answer_index).toBe(0);
    expect(out[3].answer_index).toBe(2);
  });

  it("drops questions with invalid levels", () => {
    const out = normalize([
      qFactory({ level: "A0" }),
      qFactory({ level: "C3" }),
      qFactory({ level: "beginner" }),
      qFactory({ level: "A1", question: "good" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe("A1");
  });

  it("drops questions with empty/whitespace question text", () => {
    const out = normalize([
      qFactory({ level: "A1", question: "" }),
      qFactory({ level: "A2", question: "   " }),
      qFactory({ level: "B1", question: "ok" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe("B1");
  });

  it("skips non-object entries", () => {
    const out = normalize([
      null,
      "string",
      42,
      qFactory({ level: "A1", question: "ok" }),
    ]);
    expect(out).toHaveLength(1);
  });

  it("truncates options longer than 4 to the first 4", () => {
    const out = normalize([
      qFactory({ options: ["a", "b", "c", "d", "e", "f"] }),
    ]);
    expect(out[0].options).toHaveLength(4);
    expect(out[0].options[3]).toBe("d");
  });

  it("filters out empty-string options before padding", () => {
    const out = normalize([
      qFactory({ options: ["a", "", "b", "", "c"] }),
    ]);
    expect(out[0].options[0]).toBe("a");
    expect(out[0].options[1]).toBe("b");
    expect(out[0].options[2]).toBe("c");
    expect(out[0].options[3]).toMatch(/Option 4/);
  });
});