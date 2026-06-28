"use client";
import { Globe } from "lucide-react";
import { useI18n, LOCALES, localeName } from "@/lib/i18n";

/** Compact ES | EN toggle for the interface language. `tone` adapts to dark backgrounds. */
export default function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, setLocale } = useI18n();
  const dark = tone === "dark";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border-2 p-0.5 text-xs font-bold ${
        dark ? "border-white/15 bg-white/5" : "border-ink bg-white"
      }`}
      title={localeName[locale]}
    >
      <Globe size={13} className={`ml-1 ${dark ? "text-sidebar-text" : "text-ink-soft"}`} />
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-md px-2 py-1 uppercase transition ${
            locale === l
              ? "bg-primary text-white"
              : dark
                ? "text-sidebar-text hover:text-white"
                : "text-ink-soft hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
