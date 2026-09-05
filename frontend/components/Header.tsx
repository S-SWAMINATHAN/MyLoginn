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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f0e5cc]/92 border-b border-[#a3917a]/35 no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#b03726] to-[#6f6049] p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#fdfaf2] rounded-[10px] flex items-center justify-center">
              <span className="text-2xl text-[#b03726] font-bold font-script">ஸ்ரீ</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-cinzel text-[#2b2117] group-hover:text-[#b03726] transition-colors">
                AI JATHAGAM
              </h1>
              <span className="text-xs bg-[#b03726] text-white px-2 py-0.5 rounded-full font-tamil font-medium">
                ஜாதகம்
              </span>
            </div>
            <p className="text-xs text-[#6f6049] font-tamil">
              {lang === "ta" ? "துல்லியமான கையெழுத்து வேத ஜோதிட ஜாதகம்" : "Traditional Handwritten Vedic Horoscope"}
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#2b2117] hover:text-[#b03726] px-3 py-2 rounded-lg hover:bg-[#e8d7bb]/60 transition-colors font-tamil"
          >
            <Compass className="w-4 h-4 text-[#b03726]" />
            <span>{lang === "ta" ? "ஜாதகக் கணிப்பு" : "Generate Chart"}</span>
          </Link>

          <Link
            href="/porutham"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#2b2117] hover:text-[#b03726] px-3 py-2 rounded-lg hover:bg-[#e8d7bb]/60 transition-colors font-tamil"
          >
            <Heart className="w-4 h-4 text-[#b03726]" />
            <span>{lang === "ta" ? "திருமணப் பொருத்தம்" : "Marriage Match"}</span>
          </Link>

          <Link
            href="/match-finder"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[#8e2b1c] hover:text-white px-3 py-2 rounded-lg bg-[#b03726]/10 border border-[#b03726]/30 hover:bg-[#b03726] transition-colors font-tamil"
          >
            <Sparkles className="w-4 h-4 text-[#b03726] group-hover:text-white" />
            <span>{lang === "ta" ? "MATCH Finder" : "MATCH Finder"}</span>
          </Link>

          {/* Language Toggle */}
          <div className="flex items-center bg-[#eae0c6] border border-[#a3917a]/50 rounded-lg p-1">
            <button
              onClick={() => setLang("ta")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all font-tamil ${
                lang === "ta"
                  ? "bg-[#b03726] text-white shadow-xs"
                  : "text-[#6f6049] hover:text-[#2b2117]"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all font-tamil ${
                lang === "en"
                  ? "bg-[#b03726] text-white shadow-xs"
                  : "text-[#6f6049] hover:text-[#2b2117]"
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
