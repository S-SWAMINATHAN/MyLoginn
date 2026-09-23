"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Compass, Baby, Sun, CalendarSearch, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  lang: "ta" | "en";
  setLang: (l: "ta" | "en") => void;
}

/**
 * NOTE: the standalone "MATCH Finder" nav link/route was removed earlier —
 * that feature lives ONLY inside the Porutham page as a tab
 * (app/porutham/page.tsx), so it has no top-level nav entry.
 */
const NAV = [
  { href: "/", icon: Compass, ta: "ஜாதகக் கணிப்பு", en: "Generate Chart" },
  { href: "/porutham", icon: Heart, ta: "திருமணப் பொருத்தம்", en: "Marriage Match" },
  { href: "/horoscope", icon: Sun, ta: "ராசி பலன்", en: "Horoscope" },
  { href: "/muhurtha", icon: CalendarSearch, ta: "முகூர்த்தம்", en: "Muhurtha" },
  { href: "/baby-names", icon: Baby, ta: "குழந்தை பெயர்", en: "Baby Name" },
];

export const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const LangToggle = (
    <div className="flex items-center rounded-xl border border-line bg-surface-2 p-0.5" role="group" aria-label="Language">
      {(["ta", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
            lang === l ? "brand-gradient-bg text-white shadow-soft" : "text-muted hover:text-foreground"
          }`}
        >
          {l === "ta" ? "தமிழ்" : "English"}
        </button>
      ))}
    </div>
  );

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-border-soft no-print">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        {/* Bug 2: `min-w-0` + `shrink` let the brand give up width first, so the
            nav keeps its natural width instead of wrapping. */}
        <Link href="/" className="group flex min-w-0 shrink items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-brand-900 shadow-soft ring-1 ring-brand-400/30 transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="MyLoginn Astrology" width={44} height={44} className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="flex items-center gap-2">
              {/* The brand name must never be cut — it is the product name. It is
                  therefore shrink-0 + nowrap; the SUBTITLE below is the flexible
                  part that gives up width instead (it already truncates). */}
              <span className="shrink-0 whitespace-nowrap font-display text-lg font-semibold tracking-tight brand-gradient-text sm:text-xl">
                MyLoginn Astrology
              </span>
              <span className="hidden shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold text-brand-fg 2xl:inline">
                ஜாதகம்
              </span>
            </span>
            <span className="hidden max-w-[15rem] truncate text-[11px] text-muted sm:block">
              {lang === "ta" ? "துல்லியமான கையெழுத்து வேத ஜோதிட ஜாதகம்" : "Traditional Handwritten Vedic Horoscope"}
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        {/* Bug 2: `shrink-0` + `whitespace-nowrap` keep every label on one line.
            Tamil labels are far wider than the English ones, so the inline bar
            starts at xl (the burger menu covers lg and below). */}
        <nav className="hidden shrink-0 items-center gap-0.5 xl:flex" aria-label="Primary">
          {NAV.map(({ href, icon: Icon, ta, en }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-brand-500/10 text-brand-fg shadow-[inset_0_0_0_1px_rgba(47,111,237,0.25)]"
                    : "text-muted hover:bg-brand-500/5 hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand-fg" : "text-brand-500"}`} />
                <span>{lang === "ta" ? ta : en}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {LangToggle}
          <ThemeToggle lang={lang} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-foreground transition-all hover:border-brand-400 xl:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav className="border-t border-border-soft bg-surface/95 px-4 pb-4 pt-2 xl:hidden" aria-label="Primary mobile">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {NAV.map(({ href, icon: Icon, ta, en }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active ? "bg-brand-500/10 text-brand-fg" : "text-foreground hover:bg-brand-500/5"
                  }`}
                >
                  <Icon className="h-4 w-4 text-brand-500" />
                  <span>{lang === "ta" ? ta : en}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
