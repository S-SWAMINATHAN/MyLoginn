"use client";

import React from "react";
import { RasiHoroscopeResult, RasiHoroscopeKeyTransit } from "@/lib/types";
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";

interface RasiHoroscopeCardProps {
  result: RasiHoroscopeResult;
  lang: "ta" | "en";
}

export const RasiHoroscopeCard: React.FC<RasiHoroscopeCardProps> = ({ result, lang }) => {
  const isFavorable = result.benefic_transits > result.challenging_transits;
  const isMixed = result.benefic_transits === result.challenging_transits;

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)] space-y-6 animate-fade-in">
      {/* Verdict banner */}
      <div
        className={`rounded-2xl p-5 border text-center ${
          isFavorable
            ? "bg-[rgba(46,125,50,0.08)] border-[#2e7d32]"
            : isMixed
            ? "bg-[rgba(120,96,58,0.06)] border-[rgba(43,33,23,0.25)]"
            : "bg-[rgba(176,55,38,0.08)] border-[var(--red)]"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{isFavorable ? "✨" : isMixed ? "⚖️" : "🔶"}</span>
          <h3 className="text-xl sm:text-2xl font-bold font-tamil text-[var(--red-deep)]">
            {lang === "ta" ? result.rasi_ta : result.rasi}
          </h3>
        </div>
        <p className="text-sm font-caveat text-lg text-[var(--ink)]">
          {lang === "ta" ? result.overall_assessment_ta : result.overall_assessment}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 text-xs">
          <span className="px-2.5 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#2e7d32]" />
            {result.benefic_transits} {lang === "ta" ? "சுபம்" : "favorable"}
          </span>
          <span className="px-2.5 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-full flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[var(--red)]" />
            {result.challenging_transits} {lang === "ta" ? "சவாலானது" : "challenging"}
          </span>
          {result.vedha_cancellations > 0 && (
            <span className="px-2.5 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
              {result.vedha_cancellations} {lang === "ta" ? "வேதை" : "vedha"}
            </span>
          )}
        </div>
      </div>

      {/* Narration */}
      <p className="text-sm leading-relaxed font-tamil text-[var(--ink)]">
        {lang === "ta" ? result.narration_ta : result.narration}
      </p>

      {/* Key slow-planet transits */}
      {result.key_transits.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[var(--ink)] font-cinzel mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--red)]" />
            {lang === "ta" ? "முக்கிய கிரக சஞ்சாரங்கள்" : "Key Planetary Transits"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.key_transits.map((kt: RasiHoroscopeKeyTransit, idx: number) => (
              <div
                key={idx}
                className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-3 text-xs"
              >
                <div className="font-bold text-[var(--red-deep)] font-tamil mb-1">
                  {lang === "ta" ? kt.planet_ta : kt.planet} —{" "}
                  {lang === "ta" ? kt.transit_rasi_ta : kt.transit_rasi || kt.transit_rasi_ta} (
                  {kt.house_from_moon}
                  {lang === "ta" ? "-ஆம் இடம்" : "th house"})
                </div>
                <div className="text-[var(--ink-soft)] font-tamil">
                  {lang === "ta" ? kt.net_effect_ta : kt.net_effect}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-[var(--ink-soft)] font-mono text-center pt-2 border-t border-[rgba(43,33,23,0.1)]">
        {result.classical_source} · {result.reference_date}
      </p>
    </div>
  );
};