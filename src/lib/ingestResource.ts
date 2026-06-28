// Layer 2 — Turn an OCR result (PDF2LLM) into a plan Resource.
import type { Resource } from "./types";
import type { OcrResult } from "./pdf2llm";

/** Derive a human title from a filename if the user didn't supply one. */
export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base.length > 0 ? base : "Documento";
}

/**
 * Build a content-bearing Resource from an OCR result. The Markdown rides inline
 * in `content` (no hosting needed); `url` stays empty because the document is
 * read in-app. Cost is Free and preferred=true since the learner curated it.
 */
export function ocrResultToResource(result: OcrResult, title?: string): Resource {
  const name = (title && title.trim()) || titleFromFilename(result.filename);
  return {
    title: name,
    url: "",
    type: "Article",
    cost: "Free",
    preferred: true,
    content: result.markdown,
  };
}
