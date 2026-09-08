"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Compass, Baby, Sun, CalendarSearch, Menu, X } from "lucide-react";

interface HeaderProps {
  lang: "ta" | "en";
  setLang: (l: "ta" | "en") => void;
}

// Centralised nav model so the desktop bar and the mobile sheet render the
// exact same set of links from one place instead of two hand-kept copies.
const NAV_ITEMS = [
  { href: "/", icon: Compass, ta: "ஜாதகக் கணிப்பு", en: "Generate Chart" },
  { href: "/porutham", icon: Heart, ta: "திருமணப் பொருத்தம்", en: "Marriage Match" },
  { href: "/horoscope", icon: Sun, ta: "ராசி பலன்", en: "Horoscope" },
  { href: "/muhurtha", icon: CalendarSearch, ta: "முகூர்த்தம்", en: "Muhurtha" },
  { href: "/baby-names", icon: Baby, ta: "குழந்தை பெயர்", en: "Baby Name" },
] as const;

export const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#eaf1fb]/92 border-b border-[#8b93b5]/35 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md ring-1 ring-[#2454c7]/20 group-hover:scale-105 group-hover:ring-[#d4af37]/50 transition-all shrink-0 bg-[#11162e]">
            <Image
              src="/logo.png"
              alt="MyLoginn Astrology"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-cinzel text-[#161b33] group-hover:text-[#2454c7] transition-colors">
                MyLoginn Astrology
              </h1>
              <span className="hidden sm:inline text-xs bg-[#2454c7] text-white px-2 py-0.5 rounded-full font-tamil font-medium">
                ஜாதகம்
              </span>
            </div>
            <p className="text-xs text-[#4a5578] font-tamil">
              {lang === "ta" ? "துல்லியமான கையெழுத்து வேத ஜோதிட ஜாதகம்" : "Traditional Handwritten Vedic Horoscope"}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_ITEMS.map(({ href, icon: Icon, ta, en }) => (
            <Link
              key={href}
              href={href}
              className="group/nav relative flex items-center gap-1.5 text-xs xl:text-sm text-[#161b33] hover:text-[#2454c7] px-3 py-2 rounded-lg hover:bg-[#dbe6f9]/60 transition-colors font-tamil"
            >
              <Icon className="w-4 h-4 text-[#2454c7]" />
              <span>{lang === "ta" ? ta : en}</span>
              <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#d4af37] scale-x-0 group-hover/nav:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}

          {/* Language Toggle */}
          <div className="flex items-center bg-[#e7eefb] border border-[#8b93b5]/50 rounded-lg p-1 ml-2">
            <button
              onClick={() => setLang("ta")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all font-tamil ${
                lang === "ta"
                  ? "bg-[#2454c7] text-white shadow-xs"
                  : "text-[#4a5578] hover:text-[#161b33]"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all font-tamil ${
                lang === "en"
                  ? "bg-[#2454c7] text-white shadow-xs"
                  : "text-[#4a5578] hover:text-[#161b33]"
              }`}
            >
              English
            </button>
          </div>
        </nav>

        {/* Mobile: language toggle (compact) + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex items-center bg-[#e7eefb] border border-[#8b93b5]/50 rounded-lg p-1">
            <button
              onClick={() => setLang("ta")}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all font-tamil ${
                lang === "ta" ? "bg-[#2454c7] text-white" : "text-[#4a5578]"
              }`}
            >
              த
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all font-tamil ${
                lang === "en" ? "bg-[#2454c7] text-white" : "text-[#4a5578]"
              }`}
            >
              EN
            </button>
          </div>
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#8b93b5]/40 bg-white/70 text-[#2454c7] active:scale-95 transition-transform"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav sheet — slides open below the header, swipe-friendly tap targets */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-1 bg-[#eaf1fb]/97 border-t border-[#8b93b5]/25">
          {NAV_ITEMS.map(({ href, icon: Icon, ta, en }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 text-sm text-[#161b33] hover:text-[#2454c7] px-3 py-3 rounded-lg hover:bg-[#dbe6f9]/60 active:bg-[#dbe6f9] transition-colors font-tamil"
            >
              <Icon className="w-4 h-4 text-[#2454c7]" />
              <span>{lang === "ta" ? ta : en}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};