"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2, FlaskConical, ClipboardCheck } from "lucide-react";
import { usePlan } from "@/context/PlanContext";
import { generatePlan } from "@/lib/api";
import { samplePlan, sampleProfile } from "@/lib/samplePlan";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PlacementTest from "@/components/PlacementTest";
import TutorMascot from "@/components/TutorMascot";
import type {
  UserProfile,
  Level,
  LearningStyle,
  ResourcePreference,
  FocusArea,
} from "@/lib/types";

const SKILLS = [
  "Spanish",
  "English",
  "Chinese",
  "French",
  "Italian",
  "German",
  "Portuguese",
  "Ancient Greek",
  "Latin",
];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const STYLES: LearningStyle[] = ["Conversation", "Listening", "Reading", "Apps & games"];
const PREFS: ResourcePreference[] = ["Free only", "Free + Low cost", "Any"];
const FOCUS_AREAS: FocusArea[] = [
  "Advanced grammar",
  "Culture",
  "Language history",
  "Literature",
  "Vocabulary",
  "Morphology",
  "Professional writing",
  "Creative writing",
];

const BROWSER_LANG_MAP: Record<string, string> = {
  es: "Spanish",
  en: "English",
  fr: "French",
  it: "Italian",
  de: "German",
  pt: "Portuguese",
  la: "Latin",
  gr: "Ancient Greek",
};

export default function OnboardPage() {
  const router = useRouter();
  const { dispatch } = usePlan();
  const { t, L, locale } = useI18n();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [testedLevel, setTestedLevel] = useState(false);

  const [skill, setSkill] = useState("Spanish");
  const [customSkill, setCustomSkill] = useState("");
  const [native, setNative] = useState(false); // native-mastery track (Spanish for natives)
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(["Advanced grammar", "Professional writing"]);
  const [level, setLevel] = useState<Level>("A1");
  const [goal, setGoal] = useState("Mantener una conversación básica en 3 meses");
  const [hours, setHours] = useState(6);
  const [styles, setStyles] = useState<LearningStyle[]>(["Conversation", "Listening"]);
  const [pref, setPref] = useState<ResourcePreference>("Free + Low cost");

  // BUGFIX: previously this was `typeof window !== "undefined" ? navigator.language : ""`
  // computed at render time. On the server render `window` is undefined so
  // nativeSkill was null and the FULL skills list was rendered; on the client
  // `navigator.language` was read and the list could be shorter. The two
  // rendered trees disagreed and React logged a hydration mismatch warning
  // (and in strict mode could throw away the client tree entirely).
  // Fix: detect the browser language inside useEffect so both renders show
  // the same list, then update after hydration.
  const [nativeSkill, setNativeSkill] = useState<string | null>(null);
  useEffect(() => {
    const browserLang = navigator.language || "";
    const detected =
      BROWSER_LANG_MAP[browserLang.slice(0, 2).toLowerCase()] ??
      BROWSER_LANG_MAP[browserLang.split("-")[0].toLowerCase()] ??
      null;
    queueMicrotask(() => setNativeSkill(detected));
  }, []);

  const skillsToShow = SKILLS.filter((s) => {
    if (!nativeSkill) return true;
    if (nativeSkill === "Spanish") return true; // always allow Spanish (native mastery tile handles it)
    return s !== nativeSkill;
  });

  const finalSkill = native ? "Español" : customSkill.trim() || skill;

  function toggleStyle(s: LearningStyle) {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function toggleFocus(f: FocusArea) {
    setFocusAreas((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function selectNative() {
    setNative(true);
    setCustomSkill("");
    setGoal("Alcanzar un dominio profesional del español: gramática, estilo y escritura");
  }

  function selectSkill(s: string) {
    setNative(false);
    setSkill(s);
    setCustomSkill("");
  }

  function canAdvance(): boolean {
    if (step === 1) return finalSkill.length > 0;
    if (step === 2) return native ? focusAreas.length > 0 && goal.trim().length > 0 : goal.trim().length > 0;
    if (step === 3) return styles.length > 0 && hours > 0;
    return true;
  }

  async function handleGenerate() {
    setError(null);
    const unit = locale === "es" ? "horas/semana" : "hours/week";
    const profile: UserProfile = {
      skill: finalSkill,
      current_level: native ? "C1" : level,
      goal: goal.trim(),
      time_available: `${hours}-${hours + 1} ${unit}`,
      learning_style: styles,
      resource_preference: pref,
      ...(native ? { track: "native_mastery" as const, focus_areas: focusAreas } : {}),
    };
    dispatch({ type: "SET_PROFILE", payload: profile });
    setIsLoading(true);
    try {
      // Native-mastery content is always written in Spanish regardless of UI locale.
      const plan = await generatePlan(profile, native ? "es" : locale);
      dispatch({ type: "SET_PLAN", payload: { ...plan, profile } });
      router.push("/plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("onb.error"));
      setIsLoading(false);
    }
  }

  function handleDemo() {
    dispatch({ type: "SET_PROFILE", payload: sampleProfile });
    dispatch({ type: "SET_PLAN", payload: samplePlan });
    router.push("/plan");
  }

  // Auto-load the sample plan when arriving via /onboard?demo=1
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo")) {
      handleDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = isLoading;

  return (
    <div className="min-h-screen bg-page">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-black text-ink">
          <span className="grid h-11 w-11 place-items-center rounded-md border-[3px] border-ink bg-pop-yellow text-ink shadow-[4px_4px_0_0_#1a1a1a] -rotate-6">
            <span className="font-display text-2xl font-black text-ink">L</span>
          </span>
          LIANGO<span className="text-pop-magenta">.</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="mx-auto max-w-2xl px-6 pb-16">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`h-2.5 rounded-full border-2 border-ink transition-all ${
                n === step ? "w-8 bg-primary" : n < step ? "w-2.5 bg-accent-teal" : "w-2.5 bg-white"
              }`}
            />
          ))}
        </div>

        <div className="card p-8">
          {loading ? (
          <GeneratingSkeleton />
          ) : (
            <>
              {step === 1 && (
                <Section title={t("onb.s1.title")} subtitle={t("onb.s1.sub")}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {skillsToShow.map((s) => (
                      <button
                        key={s}
                        onClick={() => selectSkill(s)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                          !native && skill === s && !customSkill
                            ? "border-primary bg-primary-light text-primary"
                            : "border-line bg-white text-ink hover:border-primary/40"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    value={customSkill}
                    onChange={(e) => {
                      setNative(false);
                      setCustomSkill(e.target.value);
                    }}
                    placeholder={t("onb.s1.placeholder")}
                    className="mt-4 w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />

                  {/* Native-mastery track — Spanish for native speakers */}
                  <button
                    onClick={selectNative}
                    className={`mt-4 flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                      native
                        ? "border-primary bg-primary-light"
                        : "border-dashed border-line bg-white hover:border-primary/50"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white">
                      <Sparkles size={18} />
                    </span>
                    <span>
                      <span className={`block text-sm font-bold ${native ? "text-primary" : "text-ink"}`}>
                        {t("onb.native.tile")}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{t("onb.native.hint")}</span>
                    </span>
                  </button>
                </Section>
              )}

              {step === 2 && native && (
                <Section title={t("onb.s2n.title")} subtitle={t("onb.s2n.sub")}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {FOCUS_AREAS.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggleFocus(f)}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
                          focusAreas.includes(f)
                            ? "border-primary bg-primary-light text-primary"
                            : "border-line bg-white text-ink hover:border-primary/40"
                        }`}
                      >
                        {L.focus[f]}
                      </button>
                    ))}
                  </div>
                  <label className="mt-5 block text-sm font-medium text-ink">{t("onb.goal")}</label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    placeholder={t("onb.goal.placeholder")}
                    className="mt-1 w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </Section>
              )}

              {step === 2 &&
                !native &&
                (showTest ? (
                  <PlacementTest
                    language={finalSkill}
                    onComplete={(lvl) => {
                      setLevel(lvl);
                      setTestedLevel(true);
                      setShowTest(false);
                    }}
                    onCancel={() => setShowTest(false)}
                  />
                ) : (
                  <Section title={t("onb.s2.title")} subtitle={t("onb.s2.sub")}>
                    <div className="grid grid-cols-2 gap-2">
                      {LEVELS.map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLevel(l);
                            setTestedLevel(false);
                          }}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                            level === l
                              ? "border-primary bg-primary-light text-primary"
                              : "border-line bg-white text-ink hover:border-primary/40"
                          }`}
                        >
                          {L.level[l]}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowTest(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <ClipboardCheck size={14} /> {t("onb.takeTest")}
                    </button>
                    {testedLevel && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 size={13} /> {t("onb.tested", { level: L.level[level] })}
                      </p>
                    )}

                    <label className="mt-5 block text-sm font-medium text-ink">{t("onb.goal")}</label>
                    <textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      rows={3}
                      placeholder={t("onb.goal.placeholder")}
                      className="mt-1 w-full rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </Section>
                ))}

              {step === 3 && (
                <Section title={t("onb.s3.title")} subtitle={t("onb.s3.sub")}>
                  <label className="block text-sm font-medium text-ink">
                    {t("onb.weeklyTime", { h: hours, h2: hours + 1 })}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <p className="mt-6 text-sm font-medium text-ink">{t("onb.style")}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                          styles.includes(s)
                            ? "border-primary bg-primary-light text-primary"
                            : "border-line bg-white text-ink hover:border-primary/40"
                        }`}
                      >
                        {L.style[s]}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {step === 4 && (
                <Section title={t("onb.s4.title")} subtitle={t("onb.s4.sub")}>
                  <div className="space-y-2">
                    {PREFS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPref(p)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                          pref === p
                            ? "border-primary bg-primary-light text-primary"
                            : "border-line bg-white text-ink hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 place-items-center rounded-full border ${
                            pref === p ? "border-primary" : "border-line"
                          }`}
                        >
                          {pref === p && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </span>
                        {L.pref[p]}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {step === 5 && (
                <Section title={t("onb.s5.title")} subtitle={t("onb.s5.sub")}>
                  <ul className="space-y-2 text-sm">
                    <Review label={t("review.language")} value={native ? t("onb.native.tile") : finalSkill} />
                    {native ? (
                      <Review label={t("review.focus")} value={focusAreas.map((f) => L.focus[f]).join(", ")} />
                    ) : (
                      <Review label={t("review.level")} value={L.level[level]} />
                    )}
                    <Review label={t("review.goal")} value={goal} />
                    <Review label={t("review.time")} value={t("onb.timeShort", { h: hours, h2: hours + 1 })} />
                    <Review label={t("review.style")} value={styles.map((s) => L.style[s]).join(" + ")} />
                    <Review label={t("review.resources")} value={L.pref[pref]} />
                  </ul>
                  {error && (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleDemo}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-primary"
                  >
                    <FlaskConical size={13} /> {t("onb.demoLink")}
                  </button>
                </Section>
              )}

              <div className={`mt-8 flex items-center justify-between ${showTest ? "hidden" : ""}`}>
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-soft disabled:opacity-30"
                >
                  <ArrowLeft size={16} /> {t("onb.back")}
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="btn btn-primary px-5 py-2.5 text-sm"
                  >
                    {t("onb.next")} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleGenerate} className="btn btn-accent px-6 py-2.5 text-sm">
                    <Sparkles size={16} /> {t("onb.build")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-ink-soft">{subtitle}</p>
      {children}
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-4 border-b border-line py-2">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </li>
  );
}

type PartialWeek = { week_number?: number; title?: string; topics?: unknown[] } | undefined;

function GeneratingSkeleton({
  weeks,
  total,
}: {
  weeks?: PartialWeek[];
  total?: number;
}) {
  const { t } = useI18n();
  const ready = (weeks ?? []).filter((w): w is NonNullable<PartialWeek> => !!w?.title);
  const target = total && total > 0 ? total : 8;

  return (
    <div className="py-6 text-center">
      <TutorMascot variant="thinking" size={104} bubble bubbleKey="tutorThinking" className="mb-2" />
      {/* Animated Memphis-themed loader: bouncing shapes */}
      <div className="relative mx-auto mb-5 h-16 w-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-pop-yellow opacity-60" />
        <Loader2 className="absolute inset-0 m-auto animate-spin text-ink" size={36} strokeWidth={3} />
      </div>
      <h2 className="font-display text-2xl font-black uppercase tracking-tight text-ink">
        {t("onb.loading.title")}
      </h2>
      <p className="mt-2 text-sm font-medium text-ink-soft">{t("onb.loading.sub")}</p>
      <p className="mt-1 text-xs italic text-ink-soft/70">{t("game.tutorCalm")}</p>
      <div className="mt-6 space-y-2 text-left">
        {ready.map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border-[3px] border-ink bg-white px-4 py-3 text-sm shadow-[3px_3px_0_0_#1a1a1a] piece-snap"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border-[2px] border-ink bg-pop-yellow">
              <CheckCircle2 size={14} className="text-ink" strokeWidth={3} />
            </span>
            <span className="font-bold uppercase text-ink-soft">{t("common.week")} {w.week_number ?? i + 1}</span>
            <span className="truncate font-medium text-ink">{w.title}</span>
          </div>
        ))}
        {Array.from({ length: Math.max(0, Math.min(target - ready.length, 4)) }).map((_, i) => (
          <div
            key={`s${i}`}
            className="h-12 animate-pulse rounded-lg border-[3px] border-ink/30 bg-pop-yellow/30"
          />
        ))}
      </div>
    </div>
  );
}
