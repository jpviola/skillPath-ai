import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { titleFromFilename, ocrResultToResource } from "../ingestResource";
import type { OcrResult } from "../pdf2llm";

describe("titleFromFilename", () => {
  it("strips extension and tidies separators", () => {
    expect(titleFromFilename("griego_clasico-01.pdf")).toBe("griego clasico 01");
    expect(titleFromFilename("Athenaze.PDF")).toBe("Athenaze");
  });
  it("falls back to a default for empty names", () => {
    expect(titleFromFilename(".pdf")).toBe("Documento");
  });
});

describe("ocrResultToResource", () => {
  const result: OcrResult = { filename: "athenaze_ch1.pdf", markdown: "# Κεφάλαιον α\n…", json: {} };

  it("builds a content-bearing, learner-curated Resource", () => {
    const r = ocrResultToResource(result);
    expect(r).toMatchObject({ title: "athenaze ch1", url: "", type: "Article", cost: "Free", preferred: true });
    expect(r.content).toContain("Κεφάλαιον");
  });

  it("honours an explicit title", () => {
    expect(ocrResultToResource(result, "Athenaze — Cap. 1").title).toBe("Athenaze — Cap. 1");
  });
});

// ── Pipeline with mocked fetch ───────────────────────────────────────────────
describe("ingestDocument (mocked PDF2LLM)", () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    process.env.PDF2LLM_TOKEN = "test-token"; // skip the login path
  });
  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
    delete process.env.PDF2LLM_TOKEN;
    vi.resetModules();
  });

  function mockSequence(handlers: Array<(url: string) => Response>) {
    let i = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const handler = handlers[Math.min(i, handlers.length - 1)];
      i += 1;
      return handler(url);
    }) as unknown as typeof fetch;
  }

  it("submits, sees a done status, and returns markdown + json", async () => {
    mockSequence([
      // submit
      () => new Response(JSON.stringify({ job_id: "abc123", state: "submitted", filename: "f.pdf" }), { status: 200 }),
      // status → done
      () => new Response(JSON.stringify({ job_id: "abc123", state: "done" }), { status: 200 }),
      // result depends on the query string
      (url) =>
        url.includes("format=markdown")
          ? new Response("# Hello", { status: 200 })
          : new Response(JSON.stringify({ pages: [] }), { status: 200 }),
    ]);

    const { ingestDocument } = await import("../pdf2llm");
    const out = await ingestDocument(new Blob(["%PDF-1.4"]), { filename: "f.pdf" });
    expect(out.markdown).toBe("# Hello");
    expect(out.json).toEqual({ pages: [] });
  });

  it("throws when the job fails", async () => {
    mockSequence([
      () => new Response(JSON.stringify({ job_id: "x", state: "submitted" }), { status: 200 }),
      () => new Response(JSON.stringify({ job_id: "x", state: "failed", error: "OCR boom" }), { status: 200 }),
    ]);

    const { ingestDocument } = await import("../pdf2llm");
    await expect(ingestDocument(new Blob(["x"]), { filename: "f.pdf" })).rejects.toThrow(/OCR boom/);
  });
});
