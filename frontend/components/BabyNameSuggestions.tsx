"use client";

import React, { useState } from "react";
import { BabyNameResult } from "@/lib/types";
import { Baby, Hash, CheckCircle2, AlertTriangle } from "lucide-react";

interface BabyNameSuggestionsProps {
  babyNames: BabyNameResult;
  lang: "ta" | "en";
}

export const BabyNameSuggestions: React.FC<BabyNameSuggestionsProps> = ({
  babyNames,
  lang,
}) => {
  const [filterGender, setFilterGender] = useState<"all" | "boy" | "girl">("all");
  // NEW: optional filter to show only names whose Chaldean numerology is
  // favourable. Default OFF — numerology must never silently hide a
  // classically-correct Nakshatra-Pada name unless the user asks.
  const [onlyNumFavorable, setOnlyNumFavorable] = useState(false);

  const hasNumerology =
    babyNames.numerology_birth_number !== undefined &&
    babyNames.numerology_destiny_number !== undefined;

  const filtered = babyNames.suggestions.filter((s) => {
    if (filterGender !== "all" && s.gender !== filterGender) return false;
    if (onlyNumFavorable && !s.numerology_is_favorable) return false;
    return true;
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

      {/* NEW: numerology summary banner — deliberately its own visually
          distinct block, because Chaldean numerology is a different system
          from the Nakshatra-Pada syllables shown above it. */}
      {hasNumerology && (
        <div className="mb-6 p-4 rounded-2xl bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.25)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-cinzel">
            <Hash className="w-4 h-4 text-[var(--red)]" />
            {lang === "ta" ? "எண் கணிதம் (தனி முறை)" : "Numerology (separate system)"}
          </div>
          <div className="flex items-center gap-4 text-xs font-tamil">
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "பிறப்பு எண்" : "Birth No."}:{" "}
              <strong className="text-[var(--ink)]">{babyNames.numerology_birth_number}</strong>
            </span>
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "ஊழ் எண்" : "Destiny No."}:{" "}
              <strong className="text-[var(--ink)]">{babyNames.numerology_destiny_number}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyNumFavorable((v) => !v)}
            className={`sm:ml-auto px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all font-tamil ${
              onlyNumFavorable
                ? "bg-[var(--red)] text-white border-[var(--red)]"
                : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "ta" ? "எண் பொருத்தம் உள்ளவை மட்டும்" : "Numerology-favourable only"}
          </button>
        </div>
      )}

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

            {/* NEW: per-name numerology badge. Only rendered when the backend
                supplied it, so the card degrades cleanly if enrichment failed. */}
            {item.numerology_name_number !== undefined && (
              <div className="mt-3 pt-2.5 border-t border-[rgba(43,33,23,0.12)] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-tamil">
                  <span className="flex items-center gap-1 text-[var(--ink-soft)]">
                    <Hash className="w-3 h-3" />
                    {lang === "ta" ? "பெயர் எண்" : "Name No."}{" "}
                    <strong className="text-[var(--ink)]">{item.numerology_name_number}</strong>
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      item.numerology_is_favorable ? "text-[#2e7d32]" : "text-[#b36b00]"
                    }`}
                  >
                    {item.numerology_is_favorable ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {lang === "ta"
                      ? item.numerology_alignment_status_ta
                      : item.numerology_alignment_status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px] text-[var(--ink-soft)] font-tamil">
                  <span className="px-1.5 py-0.5 rounded bg-[rgba(120,96,58,0.07)]">
                    {lang === "ta" ? "பிறப்பு" : "Birth"}:{" "}
                    {lang === "ta"
                      ? item.numerology_relation_birth_ta
                      : item.numerology_relation_birth}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[rgba(120,96,58,0.07)]">
                    {lang === "ta" ? "ஊழ்" : "Destiny"}:{" "}
                    {lang === "ta"
                      ? item.numerology_relation_destiny_ta
                      : item.numerology_relation_destiny}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};