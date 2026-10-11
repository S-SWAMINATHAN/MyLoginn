"use client";

import React from "react";
import { RasiHoroscopeResult, RasiHoroscopeKeyTransit, RasiHoroscopeCategorySection } from "@/lib/astrology/types";
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck, Briefcase, Heart, Stethoscope } from "lucide-react";

interface RasiHoroscopeCardProps {
  result: RasiHoroscopeResult;
  lang: "ta" | "en";
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  career: Briefcase,
  love: Heart,
  health: Stethoscope,
};

export const RasiHoroscopeCard: React.FC<RasiHoroscopeCardProps> = ({ result, lang }) => {
  const isFavorable = result.benefic_transits > result.challenging_transits;
  const isMixed = result.benefic_transits === result.challenging_transits;

  return (
    <div className="card p-6 sm:p-8 shadow-sm text-foreground space-y-6 animate-fade-in">
      {/* Verdict banner */}
      <div
        className={`rounded-2xl p-5 border text-center ${
          isFavorable
            ? "bg-success/10 border-success"
            : isMixed
            ? "bg-brand-500/5 border-line"
            : "bg-brand-500/10 border-brand-500"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{isFavorable ? "✨" : isMixed ? "⚖️" : "🔶"}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-brand-fg-strong">
            {lang === "ta" ? result.rasi_ta : result.rasi_en || result.rasi}
          </h3>
        </div>
        <p className="text-sm text-lg text-foreground">
          {lang === "ta" ? result.overall_assessment_ta : result.overall_assessment}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 text-xs">
          <span className="px-2.5 py-1 bg-surface-2 border border-border-soft rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            {result.benefic_transits} {lang === "ta" ? "சுபம்" : "favorable"}
          </span>
          <span className="px-2.5 py-1 bg-surface-2 border border-border-soft rounded-full flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-brand-fg" />
            {result.challenging_transits} {lang === "ta" ? "சவாலானது" : "challenging"}
          </span>
          {result.vedha_cancellations > 0 && (
            <span className="px-2.5 py-1 bg-surface-2 border border-border-soft rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-muted" />
              {result.vedha_cancellations} {lang === "ta" ? "வேதை" : "vedha"}
            </span>
          )}
        </div>
      </div>

      {/* Overview narration */}
      <div>
        <h4 className="text-sm font-bold text-foreground font-display mb-2">
          {lang === "ta" ? "பொது பலன்" : "Overview"}
        </h4>
        <p className="text-sm leading-relaxed text-foreground">
          {lang === "ta" ? result.narration_ta : result.narration}
        </p>
      </div>

      {/* NEW: Prokerala-style subheaded Career / Love / Health sections */}
      {result.category_sections && result.category_sections.length > 0 && (
        <div className="space-y-4">
          {result.category_sections.map((sec: RasiHoroscopeCategorySection) => {
            const Icon = CATEGORY_ICONS[sec.key] || Sparkles;
            return (
              <div
                key={sec.key}
                className="bg-brand-500/5 border border-border-soft rounded-2xl p-4"
              >
                <h4 className="text-sm font-bold text-brand-fg-strong font-display mb-1.5 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {lang === "ta" ? sec.title_ta : sec.title_en}
                </h4>
                <p className="text-sm leading-relaxed text-foreground">
                  {lang === "ta" ? sec.text_ta : sec.text_en}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Key slow-planet transits */}
      {result.key_transits.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-fg" />
            {lang === "ta" ? "முக்கிய கிரக சஞ்சாரங்கள்" : "Key Planetary Transits"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.key_transits.map((kt: RasiHoroscopeKeyTransit, idx: number) => (
              <div
                key={idx}
                className="bg-brand-500/5 border border-border-soft rounded-2xl p-3 text-xs"
              >
                <div className="font-bold text-brand-fg-strong mb-1">
                  {lang === "ta" ? kt.planet_ta : kt.planet} —{" "}
                  {lang === "ta" ? kt.transit_rasi_ta : kt.transit_rasi_en || kt.transit_rasi || kt.transit_rasi_ta} (
                  {kt.house_from_moon}
                  {lang === "ta" ? "-ஆம் இடம்" : "th house"})
                </div>
                <div className="text-muted">
                  {lang === "ta" ? kt.net_effect_ta : kt.net_effect}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted font-mono text-center pt-2 border-t border-border-soft">
        {result.classical_source} · {result.reference_date}
      </p>
    </div>
  );
};