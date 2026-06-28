"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Library,
  Settings,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import LiangoLogo from "./LiangoLogo";

const NAV = [
  { href: "/plan", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/resources", key: "nav.resources", icon: Library },
  { href: "/progress", key: "nav.progress", icon: LineChart },
  { href: "/settings", key: "nav.settings", icon: Settings },
  { href: "/study", key: "nav.study", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-text">
      <div className="flex items-center gap-3 px-5 py-5 text-white">
        <LiangoLogo size={44} />
        <LiangoLogo variant="wordmark" className="text-xl text-white" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={i}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                active
                  ? "border-2 border-ink bg-accent-yellow text-ink"
                  : "border-2 border-transparent text-sidebar-text hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <LanguageSwitcher tone="dark" />
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
          {t("sidebar.learner").slice(0, 2)}
        </div>
        <div className="text-xs">
          <p className="font-medium text-white">{t("sidebar.learner")}</p>
          <p className="text-sidebar-text">{t("sidebar.freePlan")}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sidebar px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded border-[2px] border-pop-yellow bg-pop-yellow text-ink">
            <span className="font-display text-sm font-black text-ink">L</span>
          </span>
          <span className="font-display font-black">LIANGO<span className="text-pop-yellow">.</span></span>
        </div>
        <button onClick={() => setOpen(true)} aria-label={t("a11y.openMenu")}>
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden w-60 shrink-0 border-r-[3px] border-ink md:block">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 text-white"
              aria-label={t("a11y.closeMenu")}
            >
              <X size={22} />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
