"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Baby, Sun, ScrollText, Wrench, Orbit } from "lucide-react";
import { ASTRO_BASE } from "@/lib/astrology/routes";

interface HeaderProps {
  lang: "ta" | "en";
  setLang: (l: "ta" | "en") => void;
}

const NAV = [
  { href: `${ASTRO_BASE}/kalai-report`, icon: ScrollText, ta: "கணித ஜாதகம்", en: "Kanitha Jathagam" },
  { href: `${ASTRO_BASE}/kp-report`, icon: Orbit, ta: "கே.பி ஜாதகம்", en: "KP Jathagam" },
  { href: `${ASTRO_BASE}/kalai-matching`, icon: Heart, ta: "12 பொருத்தம்", en: "12 Porutham" },
  { href: `${ASTRO_BASE}/kalai-baby-names`, icon: Baby, ta: "பெயர் & நியுமராலஜி", en: "Names & Numerology" },
  { href: `${ASTRO_BASE}/horoscope`, icon: Sun, ta: "ராசி பலன்", en: "Horoscope" },
  { href: `${ASTRO_BASE}/kalai-utilities`, icon: Wrench, ta: "கருவிகள்", en: "Utilities" },
];

/**
 * Astrology sub-navigation. It sits under the main MyLoginn navbar (which
 * provides the site brand, theme and account menu), so it only carries the
 * Astrology tools and the Tamil / English switch.
 */
export const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const pathname = usePathname() || "";
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) || (href.endsWith("/kalai-report") && pathname === ASTRO_BASE);

  return (
    <div className="no-print border-b border-border-soft bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-6 lg:px-8">
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Astrology">
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
                <Icon className="h-4 w-4 shrink-0 text-brand-500" />
                <span>{lang === "ta" ? ta : en}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center rounded-xl border border-line bg-surface-2 p-0.5" role="group" aria-label="Language">
          {(["ta", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              aria-label={l === "ta" ? "தமிழ்" : "English"}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                lang === l ? "brand-gradient-bg text-white shadow-soft" : "text-muted hover:text-foreground"
              }`}
            >
              {l === "ta" ? "தமிழ்" : "English"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
