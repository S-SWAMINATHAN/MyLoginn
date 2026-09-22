"use client";

import React, { useState } from "react";
import { VimshottariDashaPeriod } from "@/lib/types";
import { Clock, ChevronDown, ChevronUp, Star } from "lucide-react";

interface DashaTimelineProps {
  dashas: VimshottariDashaPeriod[];
  lang: "ta" | "en";
  dashaBalanceTa?: string;
  dashaBalanceEn?: string;
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({
  dashas,
  lang,
  dashaBalanceTa,
  dashaBalanceEn
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    dashas.findIndex((d) => d.is_current) !== -1
      ? dashas.findIndex((d) => d.is_current)
      : 0
  );

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm space-y-5 text-[var(--ink)]">
      {/* Header with Dasha Balance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(43,33,23,0.2)] pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--red)]" />
            {lang === "ta" ? "விம்சோத்தரி தசா - புக்தி காலவரிசை" : "Vimshottari Dasha-Bhukti Timeline"}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
            {lang === "ta"
              ? "BPHS விதிகளின்படி 120 வருட மகா திசை மற்றும் அந்தர புக்திகள்"
              : "120-year astronomical Vimshottari cycle calculated from Moon longitude"}
          </p>
        </div>

        {/* Dasha Balance at Birth Badge */}
        {(dashaBalanceTa || dashaBalanceEn) && (
          <div className="bg-[rgba(176,55,38,0.08)] border border-[var(--red)] rounded-2xl px-4 py-2 text-xs font-tamil shadow-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--red)]" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] block font-mono">
                {lang === "ta" ? "பிறப்பில் தசா இருப்பு" : "Balance at Birth"}
              </span>
              <span className="font-bold text-[var(--red-deep)]">
                {lang === "ta" ? dashaBalanceTa : dashaBalanceEn}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {dashas.map((dasha, idx) => {
          const isExpanded = expandedIndex === idx;
          const isCurrent = dasha.is_current;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 ${
                isCurrent
                  ? "bg-[rgba(176,55,38,0.06)] border-2 border-[var(--red)] shadow-sm"
                  : isExpanded
                  ? "bg-[rgba(120,96,58,0.06)] border-[rgba(43,33,23,0.4)]"
                  : "bg-[rgba(120,96,58,0.04)] border-[rgba(43,33,23,0.2)] hover:border-[rgba(43,33,23,0.35)]"
              }`}
            >
              {/* Main Dasha Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border font-caveat ${
                      isCurrent
                        ? "bg-[var(--red)] text-white border-[var(--red)] shadow-sm"
                        : "bg-[var(--paper)] text-[var(--ink)] border-[rgba(43,33,23,0.25)]"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[var(--ink)] font-tamil">
                        {lang === "ta" ? `${dasha.planet_ta} மகா திசை` : `${dasha.planet} Mahadasha`}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[rgba(176,55,38,0.12)] text-[var(--red-deep)] border border-[var(--red)] text-[10px] font-bold tracking-wide uppercase">
                          {lang === "ta" ? "தற்போதைய திசை" : "Current Active"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--ink-soft)] font-caveat mt-0.5 text-[15px]">
                      {dasha.start_date} → {dasha.end_date} ({dasha.duration_years}{" "}
                      {lang === "ta" ? "வருடங்கள்" : "Years"})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--ink-soft)] font-tamil hidden sm:inline font-medium">
                    {lang === "ta" ? "புக்தி விவரங்கள்" : "View Bhuktis"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--red)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--ink-soft)]" />
                  )}
                </div>
              </div>

              {/* Bhukti Sub-periods Grid */}
              {isExpanded && dasha.bhuktis && dasha.bhuktis.length > 0 && (
                <div className="px-4 pb-4 pt-2 border-t border-[rgba(43,33,23,0.12)]">
                  <span className="text-[11px] font-semibold text-[var(--red-deep)] uppercase tracking-wider block mb-2 font-cinzel">
                    {lang === "ta" ? "அந்தர புக்திகள் (Sub-Periods)" : "Bhukti Sub-Periods"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dasha.bhuktis.map((bhukti, bIdx) => (
                      <div
                        key={bIdx}
                        className={`rounded-xl p-3 flex items-center justify-between transition-all border ${
                          bhukti.is_current
                            ? "bg-[rgba(46,125,50,0.1)] border-[#2e7d32] text-[var(--ink)] shadow-sm"
                            : "bg-[var(--paper)] border-[rgba(43,33,23,0.2)] hover:border-[rgba(43,33,23,0.35)]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-tamil font-bold text-xs text-[var(--ink)] block">
                              {lang === "ta" ? `${bhukti.planet_ta} புக்தி` : `${bhukti.planet} Bhukti`}
                            </span>
                            {bhukti.is_current && (
                              <span className="px-1.5 py-0.2 rounded bg-[#2e7d32] text-white text-[9px] font-bold uppercase">
                                {lang === "ta" ? "தற்போது" : "Active"}
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] text-[var(--ink-soft)] font-caveat block mt-0.5">
                            {bhukti.start_date} → {bhukti.end_date}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--red-deep)] font-caveat font-bold bg-[rgba(176,55,38,0.06)] px-2 py-0.5 rounded border border-[rgba(176,55,38,0.2)]">
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