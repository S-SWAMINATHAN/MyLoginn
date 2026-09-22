"use client";

import React, { useState } from "react";
import { BabyNameResult } from "@/lib/types";
import { Baby, Hash, CheckCircle2, AlertTriangle } from "lucide-react";

interface BabyNameResultsProps {
  babyNames: BabyNameResult;
  lang: "ta" | "en";
}

export const BabyNameResults: React.FC<BabyNameResultsProps> = ({
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
    <div className="card p-6 sm:p-8 shadow-sm text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-soft">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Baby className="w-5 h-5 text-brand-fg" />
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
          </h3>
          <p className="text-xs text-muted mt-1">
            {lang === "ta"
              ? `நட்சத்திரம்: ${babyNames.nakshatra_ta}, பாதம்: ${babyNames.pada} — தொடக்க எழுத்து அட்சரங்கள்`
              : `Star: ${babyNames.nakshatra}, Pada: ${babyNames.pada} — Starting Syllables`}
          </p>
        </div>

        {/* Starting Syllable Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-semibold">
            {lang === "ta" ? "சிறந்த எழுத்துக்கள்:" : "Auspicious Syllables:"}
          </span>
          <div className="flex items-center gap-1.5">
            {babyNames.starting_syllables.map((syl, sIdx) => (
              <span
                key={sIdx}
                className={`px-3 py-1 rounded-xl text-sm font-bold border transition-all ${
                  syl === babyNames.target_syllable
                    ? "bg-brand-500/10 border-brand-500 text-brand-fg-strong shadow-sm scale-105"
                    : "bg-surface-2 border-border-soft text-muted"
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
        <div className="mb-6 p-4 rounded-2xl bg-brand-500/5 border border-line flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground font-display">
            <Hash className="w-4 h-4 text-brand-fg" />
            {lang === "ta" ? "எண் கணிதம் (தனி முறை)" : "Numerology (separate system)"}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted">
              {lang === "ta" ? "பிறப்பு எண்" : "Birth No."}:{" "}
              <strong className="text-foreground">{babyNames.numerology_birth_number}</strong>
            </span>
            <span className="text-muted">
              {lang === "ta" ? "ஊழ் எண்" : "Destiny No."}:{" "}
              <strong className="text-foreground">{babyNames.numerology_destiny_number}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyNumFavorable((v) => !v)}
            className={`sm:ml-auto px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
              onlyNumFavorable
                ? "brand-gradient-bg text-white border-brand-500"
                : "bg-surface-2 border-line text-muted hover:text-foreground"
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
              ? "brand-gradient-bg text-white border-brand-500"
              : "bg-surface-2 border-line text-muted hover:text-foreground"
          }`}
        >
          {lang === "ta" ? "அனைத்தும்" : "All Names"}
        </button>
        <button
          onClick={() => setFilterGender("boy")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "boy"
              ? "brand-gradient-bg text-white border-brand-500"
              : "bg-surface-2 border-line text-muted hover:text-foreground"
          }`}
        >
          {lang === "ta" ? "ஆண் குழந்தை" : "Baby Boy"}
        </button>
        <button
          onClick={() => setFilterGender("girl")}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterGender === "girl"
              ? "brand-gradient-bg text-white border-brand-500"
              : "bg-surface-2 border-line text-muted hover:text-foreground"
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
            className="bg-surface-2 border border-border-soft rounded-2xl p-4 hover:border-brand-500 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base text-foreground">
                  {lang === "ta" ? item.name_ta : item.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    item.gender === "boy"
                      ? "bg-brand-500/10 border-brand-400 text-brand-fg"
                      : "bg-danger/10 border-danger text-danger"
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
              <span className="text-xs text-muted block text-sm mb-1.5">
                ({item.name})
              </span>
              <p className="text-xs text-muted">
                {lang === "ta" ? item.meaning_ta : item.meaning}
              </p>
            </div>

            {/* NEW: per-name numerology badge. Only rendered when the backend
                supplied it, so the card degrades cleanly if enrichment failed. */}
            {item.numerology_name_number !== undefined && (
              <div className="mt-3 pt-2.5 border-t border-border-soft space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-muted">
                    <Hash className="w-3 h-3" />
                    {lang === "ta" ? "பெயர் எண்" : "Name No."}{" "}
                    <strong className="text-foreground">{item.numerology_name_number}</strong>
                  </span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      item.numerology_is_favorable ? "text-success" : "text-warning"
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
                <div className="flex flex-wrap gap-1 text-[10px] text-muted">
                  <span className="px-1.5 py-0.5 rounded bg-brand-500/5">
                    {lang === "ta" ? "பிறப்பு" : "Birth"}:{" "}
                    {lang === "ta"
                      ? item.numerology_relation_birth_ta
                      : item.numerology_relation_birth}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-brand-500/5">
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