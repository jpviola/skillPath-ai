"use client";
import { useRef, useState } from "react";
import { Upload, Loader2, FileText, BookOpen, Trash2, X } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { useI18n } from "@/lib/i18n";
import { ingestDocument } from "@/lib/api";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp,.docx,.epub";

/**
 * My Library — upload a document to the OCR bridge (PDF2LLM) and keep the
 * resulting Markdown as a plan resource. Reading happens inline, no extra deps.
 */
export default function Library() {
  const { state, dispatch } = usePlan();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<number | null>(null);

  async function handleUpload() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { resource } = await ingestDocument(file, { title: title.trim() || undefined });
      dispatch({ type: "ADD_LIBRARY_RESOURCE", payload: resource });
      setFile(null);
      setTitle("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : t("lib.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-black uppercase tracking-tight text-ink">{t("lib.title")}</h2>
      <p className="mb-3 text-sm text-ink-soft">{t("lib.sub")}</p>

      {/* Uploader */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border-[2px] file:border-ink file:bg-pop-yellow file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-ink"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("lib.titlePlaceholder")}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary sm:max-w-xs"
        />
        <button
          onClick={handleUpload}
          disabled={!file || busy}
          className="btn btn-accent shrink-0 px-4 py-2 text-sm"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {busy ? t("lib.uploading") : t("lib.upload")}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {/* Ingested documents */}
      {state.library.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">{t("lib.empty")}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.library.map((doc, i) => (
            <div key={i} className="card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-soft">
                  <FileText size={13} /> {t("lib.docBadge")}
                </span>
                <button
                  onClick={() => dispatch({ type: "REMOVE_LIBRARY_RESOURCE", payload: i })}
                  className="text-ink-soft hover:text-red-600"
                  title={t("lib.remove")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-bold text-ink">{doc.title}</p>
              <button
                onClick={() => setReading(i)}
                className="mt-3 inline-flex items-center gap-1.5 self-start rounded-md border-[2px] border-ink bg-pop-cyan px-3 py-1 text-xs font-bold text-ink"
              >
                <BookOpen size={13} /> {t("lib.read")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reader overlay */}
      {reading !== null && state.library[reading] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-[3px] border-ink bg-white shadow-[8px_8px_0_0_#1a1a1a]">
            <div className="flex items-center justify-between border-b-[3px] border-ink px-5 py-3">
              <h3 className="truncate font-display text-base font-black text-ink">
                {state.library[reading].title}
              </h3>
              <button onClick={() => setReading(null)} className="text-ink hover:text-pop-magenta" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap px-5 py-4 font-sans text-sm leading-relaxed text-ink">
              {state.library[reading].content || ""}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
