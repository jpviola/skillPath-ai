"use client";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { getPlacementTest } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import TutorMascot from "./TutorMascot";
import type { Level } from "@/lib/types";
import type { PlacementQuestion } from "@/lib/schema";

const ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Estimate the CEFR level: highest level the learner got right before the first miss. */
function estimateLevel(questions: PlacementQuestion[], answers: number[]): Level {
  const sorted = questions
    .map((q, i) => ({ q, picked: answers[i] }))
    .sort((a, b) => ORDER.indexOf(a.q.level) - ORDER.indexOf(b.q.level));
  let est: Level | null = null;
  for (const { q, picked } of sorted) {
    if (picked === q.answer_index) est = q.level;
    else break;
  }
  return est ?? "A1";
}

export default function PlacementTest({
  language,
  onComplete,
  onCancel,
}: {
  language: string;
  onComplete: (level: Level) => void;
  onCancel: () => void;
}) {
  const { t, L } = useI18n();
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<Level | null>(null);

  async function load() {
    setError(null);
    setQuestions(null);
    setAnswers([]);
    setCurrent(0);
    setResult(null);
    try {
      const res = await getPlacementTest(language);
      if (!res.questions || res.questions.length === 0) throw new Error(t("place.noQuestions"));
      setQuestions(res.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("place.failed"));
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(optionIndex: number) {
    if (!questions) return;
    const next = [...answers];
    next[current] = optionIndex;
    setAnswers(next);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setResult(estimateLevel(questions, next));
    }
  }

  // Loading
  if (!questions && !error) {
    return (
      <div className="py-8 text-center">
        <TutorMascot variant="thinking" size={88} bubble bubbleKey="tutorThinking" className="mb-2" />
        <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={32} />
        <h3 className="text-base font-bold text-ink">{t("place.loading.title", { skill: language })}</h3>
        <p className="mt-1 text-sm text-ink-soft">{t("place.loading.sub")}</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink"
          >
            {t("place.back")}
          </button>
          <button
            onClick={load}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            <RotateCcw size={15} /> {t("place.retry")}
          </button>
        </div>
      </div>
    );
  }

  // Result
  if (result) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={36} />
        <p className="text-sm text-ink-soft">{t("place.resultPre")}</p>
        <p className="mt-1 text-2xl font-bold text-primary">{L.level[result]}</p>
        <p className="mx-auto mt-2 max-w-sm text-xs text-ink-soft">{t("place.resultNote")}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink"
          >
            <RotateCcw size={15} /> {t("place.repeat")}
          </button>
          <button
            onClick={() => onComplete(result)}
            className="btn btn-accent px-5 py-2 text-sm"
          >
            {t("place.use")}
          </button>
        </div>
      </div>
    );
  }

  // Question
  const q = questions![current];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-primary"
        >
          <ArrowLeft size={14} /> {t("place.cancel")}
        </button>
        <span className="text-xs font-medium text-ink-soft">
          {t("place.q", { n: current + 1, total: questions!.length })}
        </span>
      </div>

      {/* progress */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(current / questions!.length) * 100}%` }}
        />
      </div>

      <p className="text-base font-semibold text-ink">{q.question}</p>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-left text-sm text-ink transition hover:border-primary hover:bg-primary-light"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-ink-soft">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
