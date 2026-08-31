"use client";

import React from "react";
import { YogaResult, DoshaResult } from "@/lib/types";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Auspicious Yogas Panel */}
      <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
            <h3 className="text-xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffd700]" />
              {lang === "ta" ? "சுப யோகங்கள் (Auspicious Yogas)" : "Auspicious Yogas in Horoscope"}
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#6b1426] text-[#ffd700] font-semibold border border-[#d4af37]/30">
              {activeYogas.length} {lang === "ta" ? "யோகங்கள்" : "Active"}
            </span>
          </div>

          <div className="space-y-4">
            {activeYogas.length > 0 ? (
              activeYogas.map((yoga, idx) => (
                <div
                  key={idx}
                  className="bg-[#201418] border border-[#d4af37]/30 rounded-2xl p-4 hover:border-[#ffd700]/60 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white font-tamil flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {lang === "ta" ? yoga.name_ta : yoga.name}
                    </h4>
                    <span className="text-[10px] bg-[#aa820a]/20 text-[#ffd700] border border-[#aa820a]/40 px-2 py-0.5 rounded-md font-semibold">
                      {yoga.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#f5eedb]/90 leading-relaxed font-tamil">
                    {lang === "ta" ? yoga.description_ta : yoga.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#e0b87f]/70">
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-[#d4af37]" />
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
              <div className="p-6 bg-[#160f12] rounded-2xl text-center text-xs text-[#e0b87f]">
                {lang === "ta"
                  ? "கேந்திர திரிகோண கிரக அமைப்புகள் சீரான நற்பலன்களைத் தரும்."
                  : "Balanced planetary distribution in standard houses."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Doshas & Pariharams Panel */}
      <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
            <h3 className="text-xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#e65c00]" />
              {lang === "ta" ? "தோஷங்கள் & பரிகாரங்கள்" : "Doshas & Pariharams (Remedies)"}
            </h3>
            <span className="text-xs text-[#e0b87f] font-tamil">
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
                  className={`border rounded-2xl p-4 transition-all shadow-md ${
                    isPresent
                      ? "bg-[#251518] border-[#e65c00]/40 hover:border-[#e65c00]"
                      : isCancelled
                      ? "bg-[#1f1712] border-[#aa820a]/40"
                      : "bg-[#140b0e]/70 border-[#d4af37]/15 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white font-tamil flex items-center gap-1.5">
                      {isPresent ? (
                        <AlertTriangle className="w-4 h-4 text-[#e65c00] shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {lang === "ta" ? dosha.name_ta : dosha.name}
                    </h4>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                        isPresent
                          ? "bg-rose-950/80 border-rose-500/50 text-rose-300"
                          : isCancelled
                          ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                          : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                      }`}
                    >
                      {dosha.severity}
                    </span>
                  </div>

                  <p className="text-xs text-[#f5eedb]/90 leading-relaxed font-tamil">
                    {lang === "ta" ? dosha.description_ta : dosha.description}
                  </p>

                  {/* Remedies list */}
                  {dosha.remedies && dosha.remedies.length > 0 && isPresent && (
                    <div className="mt-3 pt-2.5 border-t border-white/5">
                      <span className="text-[11px] font-semibold text-[#ffd700] block mb-1 font-tamil">
                        {lang === "ta" ? "பரிந்துரைக்கப்படும் பரிகாரங்கள்:" : "Recommended Pariharams (Remedies):"}
                      </span>
                      <ul className="space-y-1 text-xs text-[#e0b87f] font-tamil list-disc list-inside">
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
