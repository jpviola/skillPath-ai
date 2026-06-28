// Layer 3 (server only) — Bridge to the PDF2LLM OCR service.
//
// PDF2LLM is a separate FastAPI app (PaddleOCR REST) that turns PDF/image/DOCX/
// EPUB into Markdown/JSON. It is NOT bundled with LIANGO — it runs as its own
// process. This module is the thin server-side client LIANGO uses to drive it:
// authenticate → submit → poll → fetch the result. Keep it server-only so the
// PDF2LLM token never reaches the browser (the FastAPI app has no CORS anyway).
//
// Config (all via env):
//   PDF2LLM_BASE_URL   default http://localhost:8000
//   PDF2LLM_TOKEN      a pre-issued JWT (preferred), OR
//   PDF2LLM_EMAIL + PDF2LLM_PASSWORD  to log in and cache a token

const BASE_URL = (process.env.PDF2LLM_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 280_000; // stay under the route's maxDuration

export type TargetLang = "" | "en" | "es" | "it" | "de" | "fr" | "pt";

export interface OcrResult {
  filename: string;
  markdown: string;
  json: unknown;
}

interface SubmitResponse {
  job_id: string;
  state: string;
  filename: string;
}

interface StatusResponse {
  job_id: string;
  state: string;
  filename?: string;
  progress?: { extracted?: number; total?: number };
  error?: string;
}

// Terminal job states from PDF2LLM's job store.
const DONE = "done";
const TERMINAL_FAIL = new Set(["failed", "cancelled"]);

// ── Auth (token cached in-process; re-login on 401) ─────────────────────────
let cachedToken: string | null = null;

async function login(): Promise<string> {
  const email = process.env.PDF2LLM_EMAIL;
  const password = process.env.PDF2LLM_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "PDF2LLM is not configured: set PDF2LLM_TOKEN, or PDF2LLM_EMAIL and PDF2LLM_PASSWORD."
    );
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`PDF2LLM login failed (${res.status}).`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("PDF2LLM login returned no token.");
  return data.token;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (process.env.PDF2LLM_TOKEN) return process.env.PDF2LLM_TOKEN;
  if (!cachedToken || forceRefresh) cachedToken = await login();
  return cachedToken;
}

/** Fetch against PDF2LLM with a bearer token, retrying once on 401 after re-login. */
async function authed(path: string, init: RequestInit): Promise<Response> {
  const token = await getToken();
  const withAuth = (t: string): RequestInit => ({
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${t}` },
  });
  let res = await fetch(`${BASE_URL}${path}`, withAuth(token));
  if (res.status === 401 && !process.env.PDF2LLM_TOKEN) {
    res = await fetch(`${BASE_URL}${path}`, withAuth(await getToken(true)));
  }
  return res;
}

// ── Pipeline ────────────────────────────────────────────────────────────────
async function submit(file: Blob, filename: string, targetLang: TargetLang): Promise<string> {
  const form = new FormData();
  form.append("file", file, filename);
  if (targetLang) form.append("target_lang", targetLang);
  const res = await authed("/ocr/submit", { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PDF2LLM submit failed (${res.status}). ${detail}`.trim());
  }
  const data = (await res.json()) as SubmitResponse;
  return data.job_id;
}

async function pollUntilDone(jobId: string): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const res = await authed(`/ocr/status/${jobId}`, { method: "GET" });
    if (!res.ok) throw new Error(`PDF2LLM status failed (${res.status}).`);
    const status = (await res.json()) as StatusResponse;
    if (status.state === DONE) return;
    if (TERMINAL_FAIL.has(status.state)) {
      throw new Error(status.error || `PDF2LLM job ${status.state}.`);
    }
    if (Date.now() > deadline) throw new Error("PDF2LLM OCR timed out.");
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

async function fetchResult(jobId: string, format: "markdown" | "json"): Promise<string> {
  const res = await authed(`/ocr/result/${jobId}?format=${format}`, { method: "GET" });
  if (!res.ok) throw new Error(`PDF2LLM result (${format}) failed (${res.status}).`);
  return res.text();
}

/**
 * Run a document through PDF2LLM end-to-end: submit → poll → fetch Markdown + JSON.
 * `targetLang` is empty for OCR-only; a language code requests OCR + translation
 * (Plus plan on PDF2LLM's side).
 */
export async function ingestDocument(
  file: Blob,
  opts: { filename: string; targetLang?: TargetLang } = { filename: "document.pdf" }
): Promise<OcrResult> {
  const filename = opts.filename || "document.pdf";
  const jobId = await submit(file, filename, opts.targetLang ?? "");
  await pollUntilDone(jobId);
  const [markdown, jsonText] = await Promise.all([
    fetchResult(jobId, "markdown"),
    fetchResult(jobId, "json"),
  ]);
  let json: unknown = null;
  try {
    json = JSON.parse(jsonText);
  } catch {
    json = null;
  }
  return { filename, markdown, json };
}
