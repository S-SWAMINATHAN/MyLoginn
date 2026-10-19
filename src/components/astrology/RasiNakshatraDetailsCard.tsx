"use client";

import React from "react";
import { RasiNakshatraPredictionResult } from "@/lib/astrology/types";
import {
  Moon,
  Star,
  Compass,
  Sparkles,
  Briefcase,
  Heart,
  CheckCircle,
  MapPin,
  Baby
} from "lucide-react";

interface RasiNakshatraDetailsCardProps {
  predictions: RasiNakshatraPredictionResult;
  namaAksharas?: string[];
  lang: "ta" | "en";
}

export const RasiNakshatraDetailsCard: React.FC<RasiNakshatraDetailsCardProps> = ({
  predictions,
  namaAksharas,
  lang,
}) => {
  if (!predictions) return null;

  return (
    <div className="hand-card p-6 sm:p-8 space-y-6 text-[var(--ink)]">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(43,33,23,0.2)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center text-[var(--red)]">
            <Star className="w-5 h-5 text-[var(--red)]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
              {lang === "ta"
                ? "ராசி & நட்சத்திர விரிவான பலன்கள்"
                : "Detailed Rasi, Nakshatra & Pada Predictions"}
            </h3>
            <p className="text-xs text-[var(--ink-soft)] font-tamil mt-0.5">
              {lang === "ta"
                ? "ஜென்ம ராசி, ஜென்ம நட்சத்திரம், பாதம், லக்னம் மற்றும் தொழில், உடல்நல பலன்கள்"
                : "In-depth behavioral, career, health, and pada predictions"}
            </p>
          </div>
        </div>

        {/* Quick Identity Pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-tamil font-bold shadow-sm">
            {lang === "ta" ? predictions.rasi_name_ta : predictions.rasi_name}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-tamil font-bold shadow-sm">
            {lang === "ta" ? predictions.nakshatra_name_ta : predictions.nakshatra_name} - {predictions.pada}{" "}
            {lang === "ta" ? "ஆம் பாதம்" : "Pada"}
          </span>
        </div>
      </div>

      {/* 1. Janma Rasi Detailed Card */}
      <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(43,33,23,0.1)] pb-3">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--ink)] font-tamil">
            <Moon className="w-5 h-5 text-[var(--red)]" />
            <span>
              {lang === "ta"
                ? `ஜென்ம ராசி: ${predictions.rasi_name_ta}`
                : `Moon Sign: ${predictions.rasi_name}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-tamil">
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "அதிபதி: " : "Lord: "}
              <strong className="text-[var(--red-deep)]">{predictions.rasi_ruling_planet_ta}</strong>
            </span>
            <span className="text-[var(--ink-faint)]">•</span>
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "பூதம்: " : "Element: "}
              <strong className="text-[var(--red-deep)]">{predictions.rasi_element_ta}</strong>
            </span>
            <span className="text-[var(--ink-faint)]">•</span>
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "இயல்பு: " : "Mobility: "}
              <strong className="text-[var(--red-deep)]">{predictions.rasi_mobility_ta}</strong>
            </span>
          </div>
        </div>

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tamil">
          <div className="bg-[var(--paper)] p-3.5 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
            <span className="text-[var(--red-deep)] font-bold block mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#2e7d32]" />
              {lang === "ta" ? "சிறந்த பலங்கள் & குணங்கள்" : "Strengths"}
            </span>
            <p className="text-[var(--ink)] leading-relaxed">{predictions.rasi_strengths_ta}</p>
          </div>

          <div className="bg-[var(--paper)] p-3.5 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
            <span className="text-[#e65100] font-bold block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e65100]" />
              {lang === "ta" ? "கவனம் கொள்ள வேண்டியவை" : "Challenges"}
            </span>
            <p className="text-[var(--ink)] leading-relaxed">{predictions.rasi_challenges_ta}</p>
          </div>
        </div>

        {/* General Rasi Prediction */}
        <div className="text-xs text-[var(--ink)] font-tamil leading-relaxed bg-[var(--paper)] p-4 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
          <span className="font-bold text-[var(--red-deep)] block mb-1">
            {lang === "ta"
              ? "ராசியின் பொதுவான பலன்கள் & குணாதிசயங்கள்:"
              : "General Disposition & Personality:"}
          </span>
          {lang === "ta" ? predictions.rasi_prediction_ta : predictions.rasi_prediction}
        </div>

        {/* Career & Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tamil">
          <div className="bg-[var(--paper)] p-4 rounded-xl border border-[rgba(43,33,23,0.2)] space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[var(--red-deep)]">
              <Briefcase className="w-4 h-4 text-[var(--red)]" />
              <span>{lang === "ta" ? "தொழில் & உத்தியோக வழிகாட்டல்" : "Career Guidance"}</span>
            </div>
            <p className="text-[var(--ink)] leading-relaxed">{predictions.rasi_career_ta}</p>
          </div>

          <div className="bg-[var(--paper)] p-4 rounded-xl border border-[rgba(43,33,23,0.2)] space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[var(--red-deep)]">
              <Heart className="w-4 h-4 text-[var(--red)]" />
              <span>{lang === "ta" ? "உடல்நலம் & உணவு ஆலோசனை" : "Health Guidance"}</span>
            </div>
            <p className="text-[var(--ink)] leading-relaxed">{predictions.rasi_health_ta}</p>
          </div>
        </div>
      </div>

      {/* 2. Janma Nakshatra & Pada Detailed Card */}
      <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(43,33,23,0.1)] pb-3">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--ink)] font-tamil">
            <Sparkles className="w-5 h-5 text-[var(--red)]" />
            <span>
              {lang === "ta"
                ? `ஜென்ம நட்சத்திரம்: ${predictions.nakshatra_name_ta} (${predictions.pada}-ஆம் பாதம்)`
                : `Birth Star: ${predictions.nakshatra_name} (Pada ${predictions.pada})`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-tamil">
            <span className="text-[var(--ink-soft)]">
              {lang === "ta" ? "அதிதேவதை: " : "Deity: "}
              <strong className="text-[var(--red-deep)]">{predictions.nakshatra_deity_ta}</strong>
            </span>
          </div>
        </div>

        {/* General Nakshatra Traits */}
        <div className="bg-[var(--paper)] p-4 rounded-xl border border-[rgba(43,33,23,0.2)] text-xs font-tamil leading-relaxed shadow-sm">
          <span className="font-bold text-[var(--red-deep)] block mb-1">
            {lang === "ta" ? "நட்சத்திர சுபாவம் & நற்குணங்கள்:" : "Nakshatra Nature:"}
          </span>
          <p className="text-[var(--ink)]">{predictions.nakshatra_traits_ta}</p>
        </div>

        {/* Specific Pada Prediction (பாத பலன்) */}
        <div className="bg-[rgba(176,55,38,0.05)] border-2 border-[var(--red)] rounded-xl p-4 text-xs font-tamil space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--red-deep)] text-sm flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta"
                ? `${predictions.pada}-ஆம் பாத பலன் (Pada ${predictions.pada} Specific Prediction)`
                : `Pada ${predictions.pada} Classical Reading`}
            </span>
          </div>
          <p className="text-[var(--ink)] leading-relaxed">{predictions.pada_prediction_ta}</p>
        </div>

        {/* Child Naming Syllables if provided */}
        {namaAksharas && namaAksharas.length > 0 && (
          <div className="bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgba(43,33,23,0.1)] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink)] font-tamil">
                <Baby className="w-4 h-4 text-[var(--red)]" />
                {lang === "ta"
                  ? "குழந்தை பெயர் சூட்ட வேண்டிய நாமகரணம் எழுத்துக்கள் (4 பாதங்கள்)"
                  : "Child Naming Syllables (4 Padas)"}
              </div>
              <span className="text-[11px] text-[var(--ink-soft)] font-tamil">
                {lang === "ta"
                  ? `பிறந்த பாதம்: ${predictions.pada}`
                  : `Birth Pada: ${predictions.pada}`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-tamil">
              {namaAksharas.map((syl, idx) => {
                const isCurrentPada = idx + 1 === predictions.pada;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrentPada
                        ? "bg-[rgba(176,55,38,0.1)] border-[var(--red)] text-[var(--red-deep)] shadow-sm scale-[1.02]"
                        : "bg-[var(--paper)] border-[rgba(43,33,23,0.2)] text-[var(--ink-soft)]"
                    }`}
                  >
                    <div className="text-[10px] text-[var(--ink-soft)] mb-0.5">
                      {lang === "ta" ? `${idx + 1}-ஆம் பாதம்` : `Pada ${idx + 1}`}
                    </div>
                    <div className="text-base font-extrabold">{syl}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sacred Temples & Nakshatra Career */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tamil">
          <div className="bg-[var(--paper)] p-3 rounded-xl border border-[rgba(43,33,23,0.2)] space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[var(--red-deep)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--red)]" />
              <span>{lang === "ta" ? "வழிபட வேண்டிய திருத்தலங்கள்" : "Sacred Temples"}</span>
            </div>
            <p className="text-[var(--ink)]">{predictions.nakshatra_temple_ta}</p>
          </div>

          <div className="bg-[var(--paper)] p-3 rounded-xl border border-[rgba(43,33,23,0.2)] space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-[var(--red-deep)]">
              <Briefcase className="w-3.5 h-3.5 text-[var(--red)]" />
              <span>{lang === "ta" ? "நட்சத்திரத்திற்குரிய தொழில்கள்" : "Favorable Sectors"}</span>
            </div>
            <p className="text-[var(--ink)]">{predictions.nakshatra_career_ta}</p>
          </div>
        </div>
      </div>

      {/* 3. Janma Lagna (Ascendant) Orientation */}
      <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-[rgba(43,33,23,0.1)] pb-2.5">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--ink)] font-tamil">
            <Compass className="w-5 h-5 text-[var(--red)]" />
            <span>
              {lang === "ta"
                ? `ஜென்ம லக்னம்: ${predictions.lagna_name_ta}`
                : `Janma Lagna: ${predictions.lagna_name}`}
            </span>
          </div>
        </div>

        <div className="text-xs text-[var(--ink)] font-tamil leading-relaxed bg-[var(--paper)] p-3.5 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
          <span className="font-bold text-[var(--red-deep)] block mb-1">
            {lang === "ta" ? "லக்ன வாழ்க்கை நோக்கு & இயல்பு:" : "Life Path & Disposition:"}
          </span>
          {predictions.lagna_prediction_ta}
        </div>
      </div>
    </div>
  );
};
