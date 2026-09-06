"use client";

import React from "react";
import { RasiLoveHoroscopeResult } from "@/lib/types";
import { Heart, CheckCircle2, XCircle } from "lucide-react";

interface RasiLoveHoroscopeCardProps {
  result: RasiLoveHoroscopeResult;
  lang: "ta" | "en";
}

export const RasiLoveHoroscopeCard: React.FC<RasiLoveHoroscopeCardProps> = ({
  result,
  lang,
}) => {
  const isGood = result.compatibility_score === 2;
  const isMixed = result.compatibility_score === 1;

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)] space-y-6 animate-fade-in">
      <div
        className={`rounded-2xl p-5 border text-center ${
          isGood
            ? "bg-[rgba(46,125,50,0.08)] border-[#2e7d32]"
            : isMixed
            ? "bg-[rgba(120,96,58,0.06)] border-[rgba(43,33,23,0.25)]"
            : "bg-[rgba(176,55,38,0.08)] border-[var(--red)]"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{isGood ? "💞" : isMixed ? "🤔" : "⚠️"}</span>
          <h3 className="text-lg sm:text-xl font-bold font-tamil text-[var(--red-deep)]">
            {lang === "ta" ? result.rasi1_ta : result.rasi1} +{" "}
            {lang === "ta" ? result.rasi2_ta : result.rasi2}
          </h3>
        </div>
        <p className="text-sm font-caveat text-lg text-[var(--ink)]">
          {lang === "ta" ? result.compatibility_label_ta : result.compatibility_label}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2 ${
            result.rasi_porutham
              ? "bg-[rgba(46,125,50,0.06)] border-[#2e7d32]"
              : "bg-[rgba(176,55,38,0.05)] border-[rgba(176,55,38,0.3)]"
          }`}
        >
          {result.rasi_porutham ? (
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-tamil font-bold text-sm text-[var(--ink)]">
              {lang === "ta" ? "ராசிப் பொருத்தம்" : "Rasi Porutham"}
            </div>
            <p className="text-xs text-[var(--ink-soft)] font-tamil mt-0.5">
              {lang === "ta" ? result.rasi_porutham_desc_ta : result.rasi_porutham_desc}
            </p>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2 ${
            result.rasiyadhipathi_porutham
              ? "bg-[rgba(46,125,50,0.06)] border-[#2e7d32]"
              : "bg-[rgba(176,55,38,0.05)] border-[rgba(176,55,38,0.3)]"
          }`}
        >
          {result.rasiyadhipathi_porutham ? (
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-tamil font-bold text-sm text-[var(--ink)]">
              {lang === "ta" ? "ராசி அதிபதிப் பொருத்தம்" : "Rasiyadhipathi Porutham"}
            </div>
            <p className="text-xs text-[var(--ink-soft)] font-tamil mt-0.5">
              {lang === "ta" ? result.rasiyadhipathi_relation_ta : result.rasiyadhipathi_relation}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed font-tamil text-[var(--ink)]">
        {lang === "ta" ? result.narration_ta : result.narration}
      </p>

      <div className="p-4 rounded-2xl bg-[rgba(176,55,38,0.06)] border border-[var(--red)]/40 flex items-start gap-2">
        <Heart className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--ink-soft)] font-tamil leading-relaxed">
          {lang === "ta" ? result.note_ta : result.note}
        </p>
      </div>

      <p className="text-[10px] text-[var(--ink-soft)] font-mono text-center pt-2 border-t border-[rgba(43,33,23,0.1)]">
        {result.classical_source}
      </p>
    </div>
  );
};