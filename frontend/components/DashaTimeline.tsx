"use client";

import React, { useState } from "react";
import { VimshottariDashaPeriod } from "@/lib/types";
import { Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from "lucide-react";

interface DashaTimelineProps {
  dashas: VimshottariDashaPeriod[];
  lang: "ta" | "en";
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({ dashas, lang }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    dashas.findIndex((d) => d.is_current) !== -1
      ? dashas.findIndex((d) => d.is_current)
      : 0
  );

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "விம்சோத்தரி தசா - புக்தி காலவரிசை" : "Vimshottari Dasha-Bhukti Timeline"}
          </h3>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "பிறந்த நட்சத்திர அடிப்படையில் கணிக்கப்பட்ட 120 வருட மகா திசை மற்றும் அந்தர புக்திகள்"
              : "120-year astronomical cycle calculated from exact birth Moon longitude"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {dashas.map((dasha, idx) => {
          const isExpanded = expandedIndex === idx;
          const isCurrent = dasha.is_current;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-gradient-to-r from-[#6b1426]/50 via-[#3a1a1f] to-[#6b1426]/50 border-[#ffd700] shadow-lg shadow-[#ffd700]/10"
                  : isExpanded
                  ? "bg-[#25181b] border-[#d4af37]/50"
                  : "bg-[#160f12]/80 border-[#d4af37]/20 hover:border-[#d4af37]/40"
              }`}
            >
              {/* Main Dasha Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                      isCurrent
                        ? "bg-[#ffd700] text-[#450a16] border-[#ffd700] shadow-md shadow-[#ffd700]/30 animate-pulse"
                        : "bg-[#28191d] text-[#ffd700] border-[#d4af37]/30"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-tamil">
                        {lang === "ta" ? `${dasha.planet_ta} மகா திசை` : `${dasha.planet} Mahadasha`}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffd700] text-[#450a16] text-[10px] font-bold tracking-wide uppercase">
                          {lang === "ta" ? "தற்போதைய திசை" : "Current Active"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#e0b87f] font-mono mt-0.5">
                      {dasha.start_date} → {dasha.end_date} ({dasha.duration_years}{" "}
                      {lang === "ta" ? "வருடங்கள்" : "Years"})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#ffd700] font-tamil hidden sm:inline">
                    {lang === "ta" ? "புக்தி விவரங்கள்" : "View Bhuktis"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#ffd700]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#ffd700]" />
                  )}
                </div>
              </div>

              {/* Bhukti Sub-periods Grid */}
              {isExpanded && dasha.bhuktis && dasha.bhuktis.length > 0 && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-fade-in">
                  <span className="text-[11px] font-semibold text-[#ffd700] uppercase tracking-wider block mb-2 font-cinzel">
                    {lang === "ta" ? "அந்தர புக்திகள் (Sub-Periods)" : "Bhukti Sub-Periods"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dasha.bhuktis.map((bhukti, bIdx) => (
                      <div
                        key={bIdx}
                        className="bg-[#12080a] border border-[#d4af37]/20 rounded-xl p-2.5 flex items-center justify-between hover:border-[#ffd700]/40 transition-colors"
                      >
                        <div>
                          <span className="font-tamil font-bold text-xs text-white block">
                            {lang === "ta" ? bhukti.planet_ta : bhukti.planet}
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">
                            {bhukti.start_date} → {bhukti.end_date}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#ffd700] font-mono font-semibold bg-[#25181c] px-2 py-0.5 rounded border border-[#d4af37]/20">
                          {bhukti.duration_years}y
                        </span>
                      </div>
                    ))}
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
