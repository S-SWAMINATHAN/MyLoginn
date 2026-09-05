"use client";

import React, { useState } from "react";
import { HouseDetail } from "@/lib/types";
import { Shield, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface BhavaPredictionsProps {
  bhavas: HouseDetail[];
  lang: "ta" | "en";
}

export const BhavaPredictions: React.FC<BhavaPredictionsProps> = ({ bhavas, lang }) => {
  const [expandedHouse, setExpandedHouse] = useState<number | null>(null);

  const toggleHouse = (houseNum: number) => {
    setExpandedHouse(expandedHouse === houseNum ? null : houseNum);
  };

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm">
      {/* Section Head */}
      <div className="text-center mb-8 pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <p className="font-caveat tracking-[0.4em] uppercase text-xs text-[var(--red)] mb-1">
          III · Twelve Houses
        </p>
        <h3 className="text-2xl sm:text-3xl font-normal text-[var(--ink)] flex items-center justify-center gap-2">
          {lang === "ta" ? "பன்னிரண்டு பாவ பலன்கள்" : "Twelve Bhava Significations & Predictions"}
        </h3>
        <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
          {lang === "ta"
            ? "ஒவ்வொரு பாவத்தின் அதிபதி, அமர்ந்த கிரகங்கள், சுப காரகத்துவங்கள் மற்றும் வாழ்வியல் பலன்கள்"
            : "House-wise significations covering character, wealth, family, health, career and longevity"}
        </p>
      </div>

      {/* Manuscript Bhava Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bhavas.map((bhava) => {
          const isExpanded = expandedHouse === bhava.house_number;
          const occCount = bhava.occupants ? bhava.occupants.length : 0;

          return (
            <article
              key={bhava.house_number}
              id={`bhava-${bhava.house_number}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isExpanded
                  ? "bg-[rgba(176,55,38,0.06)] border-[var(--red)] shadow-sm"
                  : "bg-[rgba(120,96,58,0.04)] border-[rgba(43,33,23,0.2)] hover:bg-[rgba(120,96,58,0.08)]"
              }`}
              onClick={() => toggleHouse(bhava.house_number)}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full border border-[var(--red)] text-[var(--red-deep)] flex items-center justify-center font-caveat text-xl font-bold shrink-0 mt-0.5 bg-[var(--paper)]">
                  {bhava.house_number}
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-normal text-[var(--ink)]">
                      {lang === "ta" ? `${bhava.house_number}-ஆம் பாவம்` : `House ${bhava.house_number}`}
                      <span className="block text-xs text-[var(--red)] font-tamil mt-0.5">
                        {lang === "ta" ? bhava.rasi_ta : bhava.rasi} · {lang === "ta" ? `அதிபதி: ${bhava.lord_ta}` : `Lord: ${bhava.lord}`}
                        {occCount > 0 && (
                          <span className="text-[var(--ink-soft)] ml-1.5">
                            · {bhava.occupants.join(", ")}
                          </span>
                        )}
                      </span>
                    </h4>
                    <div className="text-[var(--ink-soft)] shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--red)]" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Summary / Tamil Text */}
                  <p className="text-sm text-[var(--ink)] leading-relaxed mt-2.5 font-tamil">
                    {lang === "ta" ? bhava.prediction_ta : bhava.prediction}
                  </p>

                  {/* English sub-note in Caveat */}
                  {bhava.prediction && lang === "ta" && (
                    <p className="font-caveat text-sm text-[var(--ink-soft)] leading-snug mt-1.5">
                      {bhava.significations.slice(0, 4).join(", ")}
                    </p>
                  )}

                  {/* Expanded Signification Tags */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[rgba(43,33,23,0.15)] space-y-2 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {(lang === "ta" ? bhava.significations_ta : bhava.significations).map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-lg bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] text-[var(--ink)] text-[11px] font-tamil"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>

                      {occCount > 0 && (
                        <div className="text-[11px] text-[var(--ink-soft)] font-tamil">
                          <strong className="text-[var(--red-deep)]">
                            {lang === "ta" ? "அமர்ந்த கிரகங்கள்: " : "Occupants: "}
                          </strong>
                          {bhava.occupants.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
