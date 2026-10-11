"use client";

import React from "react";
import { YogaResult, DoshaResult } from "@/lib/astrology/types";
import { Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, Bookmark } from "lucide-react";

interface YogaDoshaListProps {
  yogas: YogaResult[];
  doshas: DoshaResult[];
  lang: "ta" | "en";
}

export const YogaDoshaList: React.FC<YogaDoshaListProps> = ({
  yogas,
  doshas,
  lang,
}) => {
  const activeYogas = yogas.filter((y) => y.present);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[var(--ink)]">
      {/* 1. Auspicious Yogas Panel */}
      <div className="hand-card p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
            <h3 className="text-xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--red)]" />
              {lang === "ta" ? "சுப யோகங்கள் (Auspicious Yogas)" : "Auspicious Yogas in Horoscope"}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(176,55,38,0.08)] text-[var(--red-deep)] font-semibold border border-[var(--red)]">
              {activeYogas.length} {lang === "ta" ? "யோகங்கள்" : "Active"}
            </span>
          </div>

          <div className="space-y-4">
            {activeYogas.length > 0 ? (
              activeYogas.map((yoga, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-4 hover:border-[var(--red)] transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-[var(--ink)] font-tamil flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
                      {lang === "ta" ? yoga.name_ta : yoga.name}
                    </h4>
                    <span className="text-[10px] bg-[rgba(176,55,38,0.06)] text-[var(--red-deep)] border border-[rgba(176,55,38,0.2)] px-2 py-0.5 rounded-md font-semibold">
                      {yoga.category}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--ink)] leading-relaxed font-tamil">
                    {lang === "ta" ? yoga.description_ta : yoga.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[rgba(43,33,23,0.1)] flex items-center justify-between text-[10px] text-[var(--ink-soft)]">
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-[var(--red)]" />
                      {yoga.classical_source}
                    </span>
                    <span>
                      {lang === "ta" ? "கிரகங்கள்: " : "Planets: "}
                      {yoga.planets_involved.join(", ")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-[rgba(120,96,58,0.04)] rounded-2xl text-center text-xs text-[var(--ink-soft)] border border-[rgba(43,33,23,0.15)]">
                {lang === "ta"
                  ? "கேந்திர திரிகோண கிரக அமைப்புகள் சீரான நற்பலன்களைத் தரும்."
                  : "Balanced planetary distribution in standard houses."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Doshas & Pariharams Panel */}
      <div className="hand-card p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
            <h3 className="text-xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--red)]" />
              {lang === "ta" ? "தோஷங்கள் & பரிகாரங்கள்" : "Doshas & Pariharams (Remedies)"}
            </h3>
            <span className="text-xs text-[var(--ink-soft)] font-tamil">
              {lang === "ta" ? "சாஸ்திர விதிகள்" : "Classical Rules"}
            </span>
          </div>

          <div className="space-y-4">
            {doshas.map((dosha, idx) => {
              const isPresent = dosha.present;
              const isCancelled = dosha.severity.includes("Cancelled");

              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 transition-all shadow-sm ${
                    isPresent
                      ? "bg-[rgba(176,55,38,0.06)] border-[var(--red)]"
                      : isCancelled
                      ? "bg-[rgba(230,81,0,0.06)] border-[#e65100]"
                      : "bg-[var(--paper)] border-[rgba(43,33,23,0.2)] opacity-85"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-[var(--ink)] font-tamil flex items-center gap-1.5">
                      {isPresent ? (
                        <AlertTriangle className="w-4 h-4 text-[var(--red)] shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-[#2e7d32] shrink-0" />
                      )}
                      {lang === "ta" ? dosha.name_ta : dosha.name}
                    </h4>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        isPresent
                          ? "bg-[rgba(176,55,38,0.12)] border-[var(--red)] text-[var(--red-deep)]"
                          : isCancelled
                          ? "bg-[rgba(230,81,0,0.1)] border-[#e65100] text-[#b23c00]"
                          : "bg-[rgba(46,125,50,0.1)] border-[#2e7d32] text-[#1b5e20]"
                      }`}
                    >
                      {dosha.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--ink)] leading-relaxed font-tamil">
                    {lang === "ta" ? dosha.description_ta : dosha.description}
                  </p>

                  {/* Remedies list */}
                  {dosha.remedies && dosha.remedies.length > 0 && isPresent && (
                    <div className="mt-3 pt-2.5 border-t border-[rgba(43,33,23,0.1)]">
                      <span className="text-[11px] font-semibold text-[var(--red-deep)] block mb-1 font-tamil">
                        {lang === "ta" ? "பரிந்துரைக்கப்படும் பரிகாரங்கள்:" : "Recommended Pariharams (Remedies):"}
                      </span>
                      <ul className="space-y-1 text-xs text-[var(--ink)] font-tamil list-disc list-inside">
                        {(lang === "ta" ? dosha.remedies_ta : dosha.remedies).map((rem, rIdx) => (
                          <li key={rIdx}>{rem}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
