// Layer 3 — POST /api/v1/ingest : OCR a document via PDF2LLM and return it as a
// plan Resource (server-side bridge; the PDF2LLM token never reaches the browser).
import { NextRequest, NextResponse } from "next/server";
import { ingestDocument, type TargetLang } from "@/lib/pdf2llm";
import { ocrResultToResource } from "@/lib/ingestResource";
import { rateLimit } from "@/lib/rateLimit";
import { buildDeviceCookie, getClientFingerprint } from "@/lib/requestIdentity";

// OCR (submit → poll → fetch) can run a few minutes on large PDFs.
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB safety ceiling on this side
const ALLOWED = new Set([
  "pdf", "png", "jpg", "jpeg", "bmp", "tiff", "tif", "webp", "docx", "epub",
]);
const LANGS = new Set(["", "en", "es", "it", "de", "fr", "pt"]);

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  const { cookieId, fingerprint, setCookie } = getClientFingerprint(req);

  const limited = await rateLimit(fingerprint);
  if (!limited.ok) {
    const response = NextResponse.json(
      { error: "Demasiadas solicitudes. Ve un poco más despacio." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Se esperaba multipart/form-data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob) || typeof (file as File).name !== "string") {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }
  const upload = file as File;

  if (!ALLOWED.has(ext(upload.name))) {
    return NextResponse.json(
      { error: `Formato no soportado: .${ext(upload.name)}` },
      { status: 415 }
    );
  }
  if (upload.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Archivo demasiado grande (máx ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` },
      { status: 413 }
    );
  }

  const title = (form.get("title") as string | null)?.trim() || undefined;
  const rawLang = (form.get("target_lang") as string | null) ?? "";
  if (!LANGS.has(rawLang)) {
    return NextResponse.json({ error: "Idioma de traducción inválido." }, { status: 400 });
  }
  const targetLang = rawLang as TargetLang;

  try {
    const result = await ingestDocument(upload, { filename: upload.name, targetLang });
    const resource = ocrResultToResource(result, title);
    const response = NextResponse.json(
      { resource, markdown: result.markdown, json: result.json },
      { status: 200 }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  } catch (err) {
    console.error("[ingest] OCR failed:", err);
    const message = err instanceof Error ? err.message : "Falló el OCR.";
    // Surface a configuration hint distinctly from a transient failure.
    const status = /not configured/i.test(message) ? 503 : 502;
    const response = NextResponse.json(
      { error: "No se pudo procesar el documento. Inténtalo de nuevo más tarde." },
      { status }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }
}
