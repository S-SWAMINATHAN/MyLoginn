"use client";

import React from "react";
import { AyurdayaResult } from "@/lib/types";
import {
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Flame,
  Award,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface AyurdayaCardProps {
  ayurdaya: AyurdayaResult;
  lang: "ta" | "en";
}

export const AyurdayaCard: React.FC<AyurdayaCardProps> = ({ ayurdaya, lang }) => {
  if (!ayurdaya) return null;

  const isLongLife =
    ayurdaya.ayush_category?.includes("Deergha") ||
    ayurdaya.ayush_category_ta?.includes("தீர்க்க") ||
    ayurdaya.ayush_category_ta?.includes("பூர்ண");

  const isMediumLife =
    ayurdaya.ayush_category?.includes("Madhya") ||
    ayurdaya.ayush_category_ta?.includes("மத்திய");

  return (
    <div className="hand-card p-6 sm:p-8 space-y-6 text-[var(--ink)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(43,33,23,0.2)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(176,55,38,0.1)] border border-[var(--red)] flex items-center justify-center text-[var(--red)] shadow-sm">
            <HeartPulse className="w-5 h-5 text-[var(--red)]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
              {lang === "ta" ? "ஆயுள் கணிதம் (Ayurdaya)" : "Longevity Computation (Ayurdaya)"}
            </h3>
            <p className="text-xs text-[var(--ink-soft)] font-tamil mt-0.5">
              {lang === "ta"
                ? "பராசர & ஜைமினி சாஸ்திர முறைப்படி ஆயுள் வகைப்பாடு, 8-ஆம் பாவகம் & சனி பலம்"
                : "Parashara & Jaimini classical 3-pairs method, 8th house analysis & Saturn strength"}
            </p>
          </div>
        </div>

        {/* Longevity Category Badge */}
        <div
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold font-tamil shadow-sm ${
            isLongLife
              ? "bg-[rgba(46,125,50,0.1)] border-[#2e7d32] text-[#1b5e20]"
              : isMediumLife
              ? "bg-[rgba(230,81,0,0.1)] border-[#e65100] text-[#b23c00]"
              : "bg-[rgba(176,55,38,0.1)] border-[var(--red)] text-[var(--red-deep)]"
          }`}
        >
          {isLongLife ? (
            <ShieldCheck className="w-5 h-5 text-[#2e7d32]" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[#e65100]" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-mono">
              {lang === "ta" ? "ஆயுள் வகைப்பாடு" : "Longevity Span"}
            </span>
            <span className="text-sm font-extrabold text-[var(--ink)]">
              {lang === "ta" ? ayurdaya.ayush_category_ta : ayurdaya.ayush_category_label}
            </span>
          </div>
        </div>
      </div>

      {/* Classical Reference Banner */}
      <div className="flex items-center gap-2 bg-[rgba(120,96,58,0.06)] border border-[rgba(43,33,23,0.2)] px-4 py-2.5 rounded-xl text-xs text-[var(--ink-soft)] font-tamil">
        <BookOpen className="w-4 h-4 text-[var(--red)] shrink-0" />
        <span>
          <strong className="text-[var(--red-deep)]">
            {lang === "ta" ? "சாஸ்திர ஆதாரம்: " : "Classical Authority: "}
          </strong>
          {ayurdaya.classical_source}
        </span>
      </div>

      {/* Three Pairs (Parashara / Jaimini) Breakdown */}
      {ayurdaya.three_pairs && (
        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[rgba(43,33,23,0.1)] pb-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-tamil">
              <Award className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta"
                ? "மூன்று ஜோடிகள் கணித முறை (Three Pairs Rule)"
                : "Parashara Three Pairs Evaluation"}
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] font-tamil font-semibold">
              {ayurdaya.ayush_years_range}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {Object.entries(ayurdaya.three_pairs).map(([k, rule], idx) => (
              <div
                key={k}
                className="bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-xl p-3 text-xs font-tamil text-[var(--ink)] flex items-start gap-2 shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-[rgba(176,55,38,0.12)] text-[var(--red)] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-caveat">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-[var(--ink-soft)] text-[11px] block">
                    {k === "pair1_lagna_8th_lord"
                      ? lang === "ta" ? "லக்னாதிபதி + 8ம் அதிபதி" : "Lagna lord + 8th lord"
                      : k === "pair2_moon_saturn"
                      ? lang === "ta" ? "சந்திரன் + சனி பகவான்" : "Moon + Saturn"
                      : lang === "ta" ? "லக்னம் + ஹோரா லக்னம்" : "Lagna + Hora Lagna"}
                  </span>
                  <span className="font-bold text-[var(--red-deep)]">{rule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Grid: 8th House & Ayushkaraka Saturn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 8th House (ஆயுள் ஸ்தானம்) */}
        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-tamil border-b border-[rgba(43,33,23,0.1)] pb-2.5">
            <Sparkles className="w-4 h-4 text-[var(--red)]" />
            {lang === "ta" ? "8-ஆம் பாவகம் (ஆயுள் ஸ்தானம்)" : "8th House Analysis (House of Longevity)"}
          </div>

          <div className="space-y-2 text-xs font-tamil">
            <div className="flex justify-between py-1 border-b border-[rgba(43,33,23,0.1)]">
              <span className="text-[var(--ink-soft)]">
                {lang === "ta" ? "8-ஆம் அதிபதி (8th Lord)" : "8th House Lord"}
              </span>
              <span className="text-[var(--ink)] font-bold">
                {lang === "ta" ? ayurdaya.eighth_house_lord_ta : ayurdaya.eighth_house_lord}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[rgba(43,33,23,0.1)]">
              <span className="text-[var(--ink-soft)]">
                {lang === "ta" ? "8-ஆம் ராசி (8th Sign)" : "8th House Sign"}
              </span>
              <span className="text-[var(--ink)] font-bold">
                {lang === "ta" ? ayurdaya.eighth_house_sign_ta : ayurdaya.eighth_house_sign}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[rgba(43,33,23,0.1)]">
              <span className="text-[var(--ink-soft)]">
                {lang === "ta" ? "8-ஆம் வீட்டில் உள்ள கிரகங்கள்" : "Planets Occupying 8th"}
              </span>
              <span className="text-[var(--ink)] font-bold">
                {ayurdaya.eighth_house_occupants && ayurdaya.eighth_house_occupants.length > 0
                  ? ayurdaya.eighth_house_occupants.join(", ")
                  : lang === "ta"
                  ? "கிரகங்கள் இல்லை (சுபம்)"
                  : "None (Auspicious)"}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-soft)]">
                {lang === "ta" ? "அஷ்டகவர்க்க 8-ஆம் பாவக பரல்கள்" : "8th House Ashtakavarga Bindus"}
              </span>
              <span className="text-[var(--red-deep)] font-bold px-2 py-0.5 rounded bg-[rgba(176,55,38,0.08)] border border-[var(--red)] font-caveat text-sm">
                {ayurdaya.ashtakavarga_ayush_points} / 56
              </span>
            </div>
          </div>
        </div>

        {/* Ayushkaraka Saturn (ஆயுஷ்காரகன் சனி) */}
        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[rgba(43,33,23,0.1)] pb-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-tamil">
              <ShieldCheck className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta" ? "ஆயுஷ்காரகன் சனி பலம்" : "Ayushkaraka Saturn Status"}
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[rgba(176,55,38,0.08)] text-[var(--red-deep)] font-semibold border border-[var(--red)]">
              {ayurdaya.ayushkaraka_saturn_dignity}
            </span>
          </div>

          <div className="space-y-2 text-xs font-tamil">
            <div className="flex justify-between py-1 border-b border-[rgba(43,33,23,0.1)]">
              <span className="text-[var(--ink-soft)]">
                {lang === "ta" ? "அமர்ந்த வீடு (House)" : "Saturn House"}
              </span>
              <span className="text-[var(--ink)] font-bold">
                {ayurdaya.ayushkaraka_saturn_house}-ஆம் வீடு
              </span>
            </div>

            <p className="text-xs text-[var(--ink)] font-tamil leading-relaxed pt-1">
              {lang === "ta"
                ? ayurdaya.ayushkaraka_saturn_analysis_ta
                : ayurdaya.ayushkaraka_saturn_analysis}
            </p>
          </div>
        </div>
      </div>

      {/* Maraka & Badhaka Analysis */}
      <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-tamil border-b border-[rgba(43,33,23,0.1)] pb-2.5">
          <AlertCircle className="w-4 h-4 text-[#e65100]" />
          {lang === "ta"
            ? "மாரக & பாதக ஸ்தான ஆய்வு (Maraka & Badhaka Houses)"
            : "Maraka & Badhaka Analysis"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tamil">
          <div className="bg-[var(--paper)] p-3 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
            <span className="text-[var(--red-deep)] font-semibold block mb-1">
              {lang === "ta" ? "மாரக ஸ்தானங்கள் (2 & 7)" : "Maraka Houses (2 & 7)"}
            </span>
            <div className="text-[var(--ink)]">
              {lang === "ta" ? "அதிபதிகள்: " : "Lords: "}
              <span className="font-bold text-[var(--red)]">
                {(lang === "ta" ? ayurdaya.maraka_lords_ta : ayurdaya.maraka_lords)?.join(", ") || "—"}
              </span>
            </div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-1 leading-relaxed">
              {lang === "ta" ? ayurdaya.maraka_analysis_ta : ayurdaya.maraka_analysis}
            </div>
          </div>

          <div className="bg-[var(--paper)] p-3 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm">
            <span className="text-[var(--red-deep)] font-semibold block mb-1">
              {lang === "ta"
                ? `பாதக ஸ்தானம் (${ayurdaya.badhaka_house}-ஆம் வீடு)`
                : `Badhaka House (${ayurdaya.badhaka_house}th)`}
            </span>
            <div className="text-[var(--ink)]">
              {lang === "ta" ? "பாதகாதிபதி: " : "Badhaka Lord: "}
              <span className="font-bold text-[var(--red)]">
                {lang === "ta" ? ayurdaya.badhaka_lord_ta : ayurdaya.badhaka_lord}
              </span>
            </div>
            <div className="text-[11px] text-[var(--ink-soft)] mt-1 leading-relaxed">
              {lang === "ta" ? ayurdaya.badhaka_analysis_ta : ayurdaya.badhaka_analysis}
            </div>
          </div>
        </div>
      </div>

      {/* Classical Remedies */}
      {ayurdaya.remedies_ta && ayurdaya.remedies_ta.length > 0 && (
        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] font-tamil border-b border-[rgba(43,33,23,0.1)] pb-2.5">
            <Flame className="w-4 h-4 text-[var(--red)]" />
            {lang === "ta" ? "ஆயுள் விருத்தி சாஸ்திர பரிகாரங்கள்" : "Vedic Remedies for Longevity & Vitality"}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(lang === "ta" ? ayurdaya.remedies_ta : ayurdaya.remedies).map((rem, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs font-tamil text-[var(--ink)] bg-[var(--paper)] p-2.5 rounded-xl border border-[rgba(43,33,23,0.2)] shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--red)] shrink-0" />
                <span>{rem}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traditional Astrological Disclaimer */}
      <div className="bg-[rgba(120,96,58,0.04)] border border-[rgba(43,33,23,0.15)] rounded-xl p-3.5 flex items-start gap-2.5 text-[11px] text-[var(--ink-soft)] font-tamil leading-relaxed">
        <HelpCircle className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
        <span>
          {lang === "ta" ? ayurdaya.description_ta : ayurdaya.description}
        </span>
      </div>
    </div>
  );
};
