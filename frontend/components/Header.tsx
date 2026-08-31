"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart, FileText, Compass, Moon, Sun } from "lucide-react";

interface HeaderProps {
  lang: "ta" | "en";
  setLang: (l: "ta" | "en") => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0d0a0b]/85 border-b border-[#d4af37]/20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6b1426] to-[#aa820a] p-0.5 shadow-lg shadow-[#d4af37]/10 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#160f12] rounded-[10px] flex items-center justify-center">
              <span className="text-2xl text-[#d4af37] font-bold">ௐ</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-cinzel text-white group-hover:text-[#ffd700] transition-colors">
                AI JATHAGAM
              </h1>
              <span className="text-xs bg-[#6b1426] text-[#ffd700] px-2 py-0.5 rounded-full border border-[#d4af37]/30 font-tamil font-medium">
                ஜாதகம்
              </span>
            </div>
            <p className="text-xs text-[#d4af37]/80 font-tamil">
              {lang === "ta" ? "துல்லியமான வேத ஜோதிட வழிகாட்டி" : "Deterministic Vedic Astrology"}
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#e0b87f] hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Compass className="w-4 h-4 text-[#d4af37]" />
            <span>{lang === "ta" ? "ஜாதகக் கணிப்பு" : "Generate Chart"}</span>
          </Link>

          <Link
            href="/porutham"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#e0b87f] hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Heart className="w-4 h-4 text-[#e65c00]" />
            <span>{lang === "ta" ? "திருமணப் பொருத்தம்" : "Marriage Match"}</span>
          </Link>

          {/* Language Toggle */}
          <div className="flex items-center bg-[#25181b] border border-[#d4af37]/30 rounded-lg p-1">
            <button
              onClick={() => setLang("ta")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === "ta"
                  ? "bg-[#6b1426] text-[#ffd700] shadow"
                  : "text-[#d4af37]/70 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === "en"
                  ? "bg-[#6b1426] text-[#ffd700] shadow"
                  : "text-[#d4af37]/70 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
