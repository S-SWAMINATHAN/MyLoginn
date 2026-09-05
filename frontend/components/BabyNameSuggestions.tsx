"use client";

import React, { useState } from "react";
import { BabyNameResult } from "@/lib/types";
import { Baby } from "lucide-react";

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
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
            <Baby className="w-5 h-5 text-[var(--red)]" />
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
            {lang === "ta"
              ? `நட்சத்திரம்: ${babyNames.nakshatra_ta}, பாதம்: ${babyNames.pada} — தொடக்க எழுத்து அட்சரங்கள்`
              : `Star: ${babyNames.nakshatra}, Pada: ${babyNames.pada} — Starting Syllables`}
          </p>
        </div>

        {/* Starting Syllable Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--ink-soft)] font-tamil font-semibold">
            {lang === "ta" ? "சிறந்த எழுத்துக்கள்:" : "Auspicious Syllables:"}
          </span>
          <div className="flex items-center gap-1.5">
            {babyNames.starting_syllables.map((syl, sIdx) => (
              <span
                key={sIdx}
                className={`px-3 py-1 rounded-xl text-sm font-bold border transition-all ${
                  syl === babyNames.target_syllable
                    ? "bg-[rgba(176,55,38,0.12)] border-[var(--red)] text-[var(--red-deep)] shadow-sm scale-105"
                    : "bg-[var(--paper)] border-[rgba(43,33,23,0.2)] text-[var(--ink-soft)]"
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
              ? "bg-[var(--red)] text-white border-[var(--red)]"
              : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          {lang === "ta" ? "அனைத்தும்" : "All Names"}
        </button>
        <button
          onClick={() => setFilterGender("boy")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "boy"
              ? "bg-[var(--red)] text-white border-[var(--red)]"
              : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          {lang === "ta" ? "ஆண் குழந்தை" : "Baby Boy"}
        </button>
        <button
          onClick={() => setFilterGender("girl")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "girl"
              ? "bg-[var(--red)] text-white border-[var(--red)]"
              : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
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
            className="bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-4 hover:border-[var(--red)] transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-tamil font-bold text-base text-[var(--ink)]">
                  {lang === "ta" ? item.name_ta : item.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    item.gender === "boy"
                      ? "bg-[rgba(30,136,229,0.1)] border-[#1e88e5] text-[#1565c0]"
                      : "bg-[rgba(233,30,99,0.1)] border-[#e91e63] text-[#c2185b]"
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
              <span className="text-xs text-[var(--ink-soft)] block font-caveat text-sm mb-1.5">
                ({item.name})
              </span>
              <p className="text-xs text-[var(--ink-soft)] font-tamil">
                {lang === "ta" ? item.meaning_ta : item.meaning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
