"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Compass, Baby, Sun, CalendarSearch, ScrollText, Wrench, Orbit, HeartHandshake, Menu, X, ChevronDown, Sparkles } from "lucide-react";
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
// The Kalai Magal-parity features replace the old Generate Chart, Baby Name,
// Muhurtha and Marriage Match pages (those routes now redirect here).
// ஜாதகம் menu (first): கணித ஜாதகம் and கே.பி ஜாதகம். The other features follow.
const NAV = [
  { href: "/kalai-matching", icon: HeartHandshake, ta: "12 பொருத்தம்", en: "12 Porutham" },
  { href: "/kalai-baby-names", icon: Baby, ta: "பெயர் & நியுமராலஜி", en: "Names & Numerology" },
  { href: "/horoscope", icon: Sun, ta: "ராசி பலன்", en: "Horoscope" },
  { href: "/kalai-utilities", icon: Wrench, ta: "கருவிகள்", en: "Utilities" },
];

const KALAI_NAV: typeof NAV = [
  { href: "/kalai-report", icon: ScrollText, ta: "கணித ஜாதகம்", en: "Kanitha Jathagam" },
  { href: "/kp-report", icon: Orbit, ta: "கே.பி ஜாதகம்", en: "KP Jathagam" },
];

export const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [kalaiOpen, setKalaiOpen] = useState(false);

  // close the mobile menu and the Kalai menu whenever the route changes
  useEffect(() => {
    setOpen(false);
    setKalaiOpen(false);
  }, [pathname]);

  // close the Kalai menu on any click outside it
  useEffect(() => {
    if (!kalaiOpen) return;
    const close = () => setKalaiOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [kalaiOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const LangToggle = (
    <div className="flex items-center rounded-xl border border-line bg-surface-2 p-0.5" role="group" aria-label="Language">
      {(["ta", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === "ta" ? "தமிழ்" : "English"}
          className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-all sm:px-2.5 ${
            lang === l ? "brand-gradient-bg text-white shadow-soft" : "text-muted hover:text-foreground"
          }`}
        >
          {/* phones: short labels so the brand name never sits under the toggle */}
          <span className="sm:hidden">{l === "ta" ? "த" : "EN"}</span>
          <span className="hidden sm:inline">{l === "ta" ? "தமிழ்" : "English"}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-border-soft no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[4.5rem] sm:gap-3 sm:px-6 lg:px-8">
        {/* Brand */}
        {/* Bug 2: `min-w-0` + `shrink` let the brand give up width first, so the
            nav keeps its natural width instead of wrapping. */}
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <span className="relative flex h-9 w-9 shrink-0 sm:h-11 sm:w-11 items-center justify-center transition-transform group-hover:scale-105">
            {/* transparent 512 px emblem shown at 44 px, no box — sharp on high-DPI screens and when zooming */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark-144.png" alt="MyLoginn Astrology" width={144} height={144} decoding="async"
              className="h-full w-full object-contain [image-rendering:auto]" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="flex items-center gap-2">
              {/* The brand name must never be cut — it is the product name. It is
                  therefore shrink-0 + nowrap; the SUBTITLE below is the flexible
                  part that gives up width instead (it already truncates). */}
              {/* phones (< 640 px): the name is stacked on two lines so it fits next to
                  the controls without being cut; one line from sm upward */}
              <span className="font-display text-[15px] font-semibold leading-[1.1] tracking-tight brand-gradient-text sm:shrink-0 sm:whitespace-nowrap sm:text-xl sm:leading-tight">
                MyLoginn<span className="sm:hidden"><br /></span><span className="hidden sm:inline"> </span>Astrology
              </span>

            </span>
            <span className="hidden max-w-[15rem] truncate text-[11px] text-muted 2xl:block">
              {lang === "ta" ? "துல்லியமான கையெழுத்து வேத ஜோதிட ஜாதகம்" : "Traditional Handwritten Vedic Horoscope"}
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        {/* Bug 2: `shrink-0` + `whitespace-nowrap` keep every label on one line.
            Tamil labels are far wider than the English ones, so the inline bar
            starts at xl (the burger menu covers lg and below). */}
        <nav className="hidden min-w-0 items-center gap-1 xl:flex" aria-label="Primary">
          {KALAI_NAV.length > 0 && <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setKalaiOpen((v) => !v)}
              aria-expanded={kalaiOpen}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-[13px] font-medium transition-all ${
                (KALAI_NAV.some((n) => isActive(n.href)) || pathname === "/")
                  ? "bg-brand-500/10 text-brand-fg shadow-[inset_0_0_0_1px_rgba(47,111,237,0.25)]"
                  : "text-muted hover:bg-brand-500/5 hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-brand-500" />
              <span>{lang === "ta" ? "ஜாதகம்" : "Jathagam"}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${kalaiOpen ? "rotate-180" : ""}`} />
            </button>
            {kalaiOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
                {KALAI_NAV.map(({ href, icon: Icon, ta, en }) => {
                  const active = isActive(href);
                  return (
                    <Link key={href} href={href} aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active ? "bg-brand-500/10 text-brand-fg" : "text-foreground hover:bg-brand-500/5"
                      }`}>
                      <Icon className="h-4 w-4 shrink-0 text-brand-500" />
                      <span>{lang === "ta" ? ta : en}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>}
          {NAV.map(({ href, icon: Icon, ta, en }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] font-medium leading-none transition-all ${
                  active
                    ? "bg-brand-500/10 text-brand-fg shadow-[inset_0_0_0_1px_rgba(47,111,237,0.25)]"
                    : "text-muted hover:bg-brand-500/5 hover:text-foreground"
                }`}
              >
                <Icon className={`hidden h-4 w-4 shrink-0 2xl:block ${active ? "text-brand-fg" : "text-brand-500"}`} />
                <span>{lang === "ta" ? ta : en}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
            {[...KALAI_NAV, ...NAV].map(({ href, icon: Icon, ta, en }) => {
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
