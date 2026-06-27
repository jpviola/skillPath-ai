"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Library,
  Settings,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/plan", label: "Panel", icon: LayoutDashboard },
  { href: "/resources", label: "Recursos", icon: Library },
  { href: "/progress", label: "Progreso y feedback", icon: LineChart },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-text">
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
          <GraduationCap size={18} />
        </div>
        <span className="text-base font-bold">SkillPath AI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={i}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-sidebar-text hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
          Tú
        </div>
        <div className="text-xs">
          <p className="font-medium text-white">Estudiante</p>
          <p className="text-sidebar-text">Plan gratis</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sidebar px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} />
          <span className="font-bold">SkillPath AI</span>
        </div>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 text-white"
              aria-label="Cerrar menú"
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
