"use client";

import React, { useState } from "react";
import { HouseDetail } from "@/lib/types";
import { Shield, Sparkles, Star, ChevronDown, ChevronUp } from "lucide-react";

interface BhavaPredictionsProps {
  bhavas: HouseDetail[];
  lang: "ta" | "en";
}

export const BhavaPredictions: React.FC<BhavaPredictionsProps> = ({ bhavas, lang }) => {
  const [expandedHouse, setExpandedHouse] = useState<number | null>(1);

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "12 பாவ பலன்கள் (12 Bhava Predictions)" : "12 Bhava Significations & Predictions"}
          </h3>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "ஒவ்வொரு பாவத்தின் அதிபதி, அமர்ந்த கிரகங்கள், சுப பார்வைகள் மற்றும் வாழ்க்கை வழிகாட்டல்"
              : "House-wise significations covering character, wealth, family, health, career and longevity"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bhavas.map((bhava) => {
          const isExpanded = expandedHouse === bhava.house_number;
          const occCount = bhava.occupants.length;

          return (
            <div
              key={bhava.house_number}
              className={`rounded-2xl border transition-all duration-300 ${
                isExpanded
                  ? "bg-[#25181b] border-[#ffd700]/60 shadow-xl shadow-[#ffd700]/5"
                  : "bg-[#160f12]/80 border-[#d4af37]/20 hover:border-[#d4af37]/50"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedHouse(isExpanded ? null : bhava.house_number)}
                className="p-4 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b1426] to-[#aa820a] flex items-center justify-center font-bold text-[#ffd700] text-sm border border-[#ffd700]/30 shadow">
                    {bhava.house_number}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white font-tamil">
                      {lang === "ta" ? `${bhava.house_number}-ஆம் பாவம் (${bhava.rasi_ta})` : `House ${bhava.house_number} (${bhava.rasi})`}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#e0b87f]">
                      <span>{lang === "ta" ? `அதிபதி: ${bhava.lord_ta}` : `Lord: ${bhava.lord}`}</span>
                      <span>•</span>
                      <span>
                        {occCount > 0
                          ? lang === "ta"
                            ? `${occCount} கிரகம்`
                            : `${occCount} Planet(s)`
                          : lang === "ta"
                          ? "சுப பார்வை"
                          : "Unoccupied"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[#ffd700]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Card Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 text-xs animate-fade-in space-y-3">
                  {/* Significations Tags */}
                  <div>
                    <span className="text-[11px] text-[#d4af37] font-semibold block mb-1 font-tamil">
                      {lang === "ta" ? "காரகத்துவங்கள்:" : "Significations:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(lang === "ta" ? bhava.significations_ta : bhava.significations).map((sig, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-[#13090c] border border-[#d4af37]/20 text-[#f5eedb] text-[11px] font-tamil"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prediction Paragraph */}
                  <div className="bg-[#12080a] p-3 rounded-xl border border-[#d4af37]/20">
                    <p className="text-[#f5eedb]/90 leading-relaxed font-tamil text-xs sm:text-sm">
                      {lang === "ta" ? bhava.prediction_ta : bhava.prediction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
