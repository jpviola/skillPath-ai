"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  MessageCircle,
  RefreshCw,
  ArrowRight,
  FlaskConical,
  Puzzle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MemphisShape from "@/components/MemphisShape";
import MemphisWaves from "@/components/MemphisWaves";
import LiangoLogo from "@/components/LiangoLogo";

const STEPS = [
  { icon: Puzzle, key: "step1", color: "bg-pop-yellow" },
  { icon: MessageCircle, key: "step2", color: "bg-pop-cyan" },
  { icon: RefreshCw, key: "step3", color: "bg-pop-magenta" },
];

export default function Landing() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* Memphis geometric decorations — bold shapes, vivid colors */}
      <MemphisShape variant="polyhedron" className="-left-10 top-24 h-32 w-32 rotate-12" />
      <MemphisShape variant="fractal" className="right-4 top-28 h-24 w-28 rotate-6" />
      <div className="memphis-dot-grid absolute right-0 top-0 h-72 w-72 opacity-30" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <LiangoLogo size={56} />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/onboard"
            className="rounded-md border-[3px] border-ink bg-pop-yellow px-4 py-2 text-sm font-black text-ink shadow-[3px_3px_0_0_#171717] transition hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#171717]"
          >
            {t("landing.getStarted")}
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:py-16 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <LiangoLogo
            variant="wordmark"
            className="text-[clamp(2.75rem,9vw,6rem)] text-ink leading-none"
          />
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border-[3px] border-ink bg-pop-cyan px-4 py-1.5 text-xs font-black uppercase tracking-wide text-ink shadow-[2px_2px_0_0_#171717]">
            <Sparkles size={13} /> {t("landing.badge")}
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-[0.94] text-ink text-shadow-yellow sm:text-6xl">
            {t("landing.heroPre")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-pop-magenta">{t("landing.heroEm")}</span>
              <span className="absolute -bottom-1 left-0 z-0 h-4 w-full -rotate-2 bg-pop-yellow" />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium text-ink lg:mx-0 sm:text-lg">
            {t("landing.sub")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-pop-cyan px-7 py-3.5 text-base font-black uppercase tracking-wide text-ink shadow-pink transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--color-pop-magenta)]"
            >
              {t("landing.ctaBuild")} <ArrowRight size={18} />
            </Link>
            <Link
              href="/onboard?demo=1"
              className="inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-pop-yellow px-7 py-3.5 text-base font-black uppercase tracking-wide text-ink shadow-[3px_3px_0_0_#1a1a1a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-pop-magenta)]"
            >
              <FlaskConical size={18} /> {t("landing.ctaDemo")}
            </Link>
          </div>
        </div>

        {/* Hero image — vintage globe, framed Memphis-style */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -right-3 -top-3 h-full w-full rounded-2xl border-[3px] border-ink bg-pop-magenta" aria-hidden="true" />
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-elevated">
            <Image
              src="/img2.jpg"
              alt="Globo terráqueo con idiomas del mundo"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
            />
          </div>
          <MemphisShape variant="ribbon" className="-bottom-8 -left-8 h-20 w-28 -rotate-6" />
        </div>
      </section>

      {/* ── Journey band: Pekín → Madrid, over the wavy "strings" ──── */}
      <section className="relative z-10 mt-6 overflow-hidden border-y-[3px] border-ink bg-pop-yellow py-14">
        <MemphisWaves
          className="absolute inset-0 h-full w-full"
          stroke="var(--color-pop-magenta)"
          strokeOpacity={0.55}
          strokeWidth={2}
        />
        <div className="relative mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-2xl font-black uppercase tracking-tight text-ink sm:text-4xl">
            {t("landing.journey")}
          </h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
            <JourneyCard src="/img3.png" label="北京" caption="Beijing" tone="bg-pop-coral" />
            <div className="text-4xl font-black text-ink sm:rotate-0 rotate-90">⟿</div>
            <JourneyCard src="/img4.jpg" label="Madrid" caption="España" tone="bg-pop-cyan" />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-10 text-center font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
          {t("landing.howItWorks")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl border-[3px] border-ink bg-white p-6 shadow-[5px_5px_0_0_#171717] ${
                i === 1 ? "sm:translate-y-2" : ""
              }`}
            >
              <div
                className={`grid h-14 w-14 place-items-center rounded-md border-[3px] border-ink text-ink ${s.color}`}
              >
                <s.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-black uppercase text-ink">
                {t(`${s.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{t(`${s.key}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Languages strip: Roma (clásicos) + AI translation ─────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureImage src="/img5.jpg" className="sm:col-span-2 aspect-video" caption="Roma · italiano · latín" />
          <FeatureImage src="/img1.png" className="aspect-video sm:aspect-auto" caption="AI · 中文 ↔ español" cover={false} />
        </div>
      </section>

      {/* ── Footer with a thin wave strip ─────────────────────────── */}
      <footer className="relative z-10 overflow-hidden border-t-[3px] border-ink bg-ink">
        <MemphisWaves
          className="absolute inset-0 h-full w-full"
          stroke="var(--color-pop-yellow)"
          strokeOpacity={0.25}
          strokeWidth={2}
          lines={16}
        />
        <p className="relative mx-auto max-w-6xl px-6 py-8 text-center text-xs text-white/80">
          <span className="font-display font-black text-pop-yellow">LIANGO</span> ·{" "}
          {t("landing.journey")}
        </p>
      </footer>
    </div>
  );
}

function JourneyCard({
  src,
  label,
  caption,
  tone,
}: {
  src: string;
  label: string;
  caption: string;
  tone: string;
}) {
  return (
    <div className="relative w-full max-w-60">
      <div className="relative aspect-square overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-[5px_5px_0_0_#1a1a1a]">
        <Image src={src} alt={caption} fill sizes="240px" className="object-cover" />
      </div>
      <span
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-[3px] border-ink ${tone} px-3 py-1 text-sm font-black text-ink shadow-[2px_2px_0_0_#1a1a1a]`}
      >
        {label}
      </span>
    </div>
  );
}

function FeatureImage({
  src,
  caption,
  className = "",
  cover = true,
}: {
  src: string;
  caption: string;
  className?: string;
  cover?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-elevated ${className}`}>
      <Image src={src} alt={caption} fill sizes="(max-width: 640px) 90vw, 33vw" className={cover ? "object-cover" : "object-contain p-4"} />
      <span className="absolute bottom-3 left-3 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-black text-ink">
        {caption}
      </span>
    </div>
  );
}
