"use client";

import React, { useState } from "react";
import { BabyNameResult } from "@/lib/types";
import { Sparkles, Heart, Baby, Star } from "lucide-react";

interface BabyNameSuggestionsProps {
  babyNames: BabyNameResult;
  lang: "ta" | "en";
}

export const BabyNameSuggestions: React.FC<BabyNameSuggestionsProps> = ({
  babyNames,
  lang,
}) => {
  const [filterGender, setFilterGender] = useState<"all" | "boy" | "girl">("all");

  const filtered = babyNames.suggestions.filter((s) => {
    if (filterGender === "all") return true;
    return s.gender === filterGender;
  });

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
            <Baby className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
          </h3>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? `நட்சத்திரம்: ${babyNames.nakshatra_ta}, பாதம்: ${babyNames.pada} — தொடக்க எழுத்து அட்சரங்கள்`
              : `Star: ${babyNames.nakshatra}, Pada: ${babyNames.pada} — Starting Syllables`}
          </p>
        </div>

        {/* Starting Syllable Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#e0b87f] font-tamil font-semibold">
            {lang === "ta" ? "சிறந்த எழுத்துக்கள்:" : "Auspicious Syllables:"}
          </span>
          <div className="flex items-center gap-1.5">
            {babyNames.starting_syllables.map((syl, sIdx) => (
              <span
                key={sIdx}
                className={`px-3 py-1 rounded-xl text-sm font-bold border transition-all ${
                  syl === babyNames.target_syllable
                    ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700] shadow-md shadow-[#ffd700]/10 scale-105"
                    : "bg-[#1f1418] border-[#d4af37]/30 text-white/80"
                }`}
              >
                {syl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Filter Buttons */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilterGender("all")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "all"
              ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
              : "bg-[#140b0e] border-[#d4af37]/20 text-white/70"
          }`}
        >
          {lang === "ta" ? "அனைத்தும்" : "All Names"}
        </button>
        <button
          onClick={() => setFilterGender("boy")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "boy"
              ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
              : "bg-[#140b0e] border-[#d4af37]/20 text-white/70"
          }`}
        >
          {lang === "ta" ? "ஆண் குழந்தை" : "Baby Boy"}
        </button>
        <button
          onClick={() => setFilterGender("girl")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "girl"
              ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
              : "bg-[#140b0e] border-[#d4af37]/20 text-white/70"
          }`}
        >
          {lang === "ta" ? "பெண் குழந்தை" : "Baby Girl"}
        </button>
      </div>

      {/* Name Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#201418] border border-[#d4af37]/30 rounded-2xl p-4 hover:border-[#ffd700] transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-tamil font-bold text-base text-[#ffd700]">
                  {lang === "ta" ? item.name_ta : item.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    item.gender === "boy"
                      ? "bg-blue-950/80 border-blue-500/40 text-blue-300"
                      : "bg-pink-950/80 border-pink-500/40 text-pink-300"
                  }`}
                >
                  {item.gender === "boy"
                    ? lang === "ta"
                      ? "ஆண்"
                      : "Boy"
                    : lang === "ta"
                    ? "பெண்"
                    : "Girl"}
                </span>
              </div>
              <span className="text-xs text-white/50 block font-mono mb-2">
                ({item.name})
              </span>
              <p className="text-xs text-[#e0b87f] font-tamil">
                {lang === "ta" ? item.meaning_ta : item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
