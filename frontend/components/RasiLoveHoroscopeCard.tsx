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
    <div className="card p-6 sm:p-8 shadow-sm text-foreground space-y-6 animate-fade-in">
      <div
        className={`rounded-2xl p-5 border text-center ${
          isGood
            ? "bg-success/10 border-success"
            : isMixed
            ? "bg-brand-500/5 border-line"
            : "bg-brand-500/10 border-brand-500"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{isGood ? "💞" : isMixed ? "🤔" : "⚠️"}</span>
          <h3 className="text-lg sm:text-xl font-bold text-brand-fg-strong">
            {lang === "ta" ? result.rasi1_ta : result.rasi1} +{" "}
            {lang === "ta" ? result.rasi2_ta : result.rasi2}
          </h3>
        </div>
        <p className="text-sm text-lg text-foreground">
          {lang === "ta" ? result.compatibility_label_ta : result.compatibility_label}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2 ${
            result.rasi_porutham
              ? "bg-success/10 border-success"
              : "bg-brand-500/10 border-brand-500/30"
          }`}
        >
          {result.rasi_porutham ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm text-foreground">
              {lang === "ta" ? "ராசிப் பொருத்தம்" : "Rasi Porutham"}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {lang === "ta" ? result.rasi_porutham_desc_ta : result.rasi_porutham_desc}
            </p>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2 ${
            result.rasiyadhipathi_porutham
              ? "bg-success/10 border-success"
              : "bg-brand-500/10 border-brand-500/30"
          }`}
        >
          {result.rasiyadhipathi_porutham ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm text-foreground">
              {lang === "ta" ? "ராசி அதிபதிப் பொருத்தம்" : "Rasiyadhipathi Porutham"}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {lang === "ta" ? result.rasiyadhipathi_relation_ta : result.rasiyadhipathi_relation}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        {lang === "ta" ? result.narration_ta : result.narration}
      </p>

      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/40 flex items-start gap-2">
        <Heart className="w-4 h-4 text-brand-fg shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          {lang === "ta" ? result.note_ta : result.note}
        </p>
      </div>

      <p className="text-[10px] text-muted font-mono text-center pt-2 border-t border-border-soft">
        {result.classical_source}
      </p>
    </div>
  );
};