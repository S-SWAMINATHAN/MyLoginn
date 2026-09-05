"use client";

import React from "react";
import { PoruthamMatchResult } from "@/lib/types";
import { Sparkles, CheckCircle2, XCircle, Award } from "lucide-react";

interface PoruthamResultProps {
  result: PoruthamMatchResult;
  lang: "ta" | "en";
}

export const PoruthamResult: React.FC<PoruthamResultProps> = ({ result, lang }) => {
  const isUthama = result.score_percentage >= 70 && !result.rajju_dosha;

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)] space-y-8 animate-fade-in">
      {/* 1. Top Verdict Banner */}
      <div
        className={`rounded-2xl p-6 border text-center relative overflow-hidden ${
          result.rajju_dosha
            ? "bg-[rgba(176,55,38,0.08)] border-[var(--red)]"
            : isUthama
            ? "bg-[rgba(46,125,50,0.08)] border-[#2e7d32]"
            : "bg-[rgba(120,96,58,0.06)] border-[rgba(43,33,23,0.25)]"
        }`}
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-3xl sm:text-4xl mb-2">
            {result.rajju_dosha ? "⚠️" : isUthama ? "💍" : "✨"}
          </span>

          <h3 className="text-2xl sm:text-3xl font-bold font-tamil text-[var(--red-deep)]">
            {lang === "ta" ? result.verdict_ta : result.verdict}
          </h3>

          <p className="text-xs sm:text-sm text-[var(--ink)] max-w-2xl mt-2 font-tamil leading-relaxed">
            {lang === "ta" ? result.recommendation_ta : result.recommendation}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs font-caveat text-sm">
            <div className="px-3 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl">
              <span className="text-[var(--ink-soft)] mr-1">Ashta Koota:</span>
              <span className="text-[var(--red-deep)] font-bold text-base">
                {result.ashta_koota.total_points} / 36
              </span>
            </div>

            <div className="px-3 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl">
              <span className="text-[var(--ink-soft)] mr-1">
                {lang === "ta" ? "பத்து பொருத்தம்:" : "Tamil 10-Porutham:"}
              </span>
              <span className="text-[#1b5e20] font-bold text-base">
                {result.tamil_10_porutham.filter((p) => p.is_compatible).length} / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Boy & Girl Horoscope Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-4">
          <span className="text-xs text-[var(--red-deep)] font-bold uppercase tracking-wider font-cinzel block mb-1">
            {lang === "ta" ? "மணமகன் விவரங்கள்" : "Boy's Details"}
          </span>
          <div className="text-sm font-tamil text-[var(--ink)] space-y-1">
            <div>
              <span className="text-[var(--ink-soft)]">ராசி: </span>
              <span className="font-bold">
                {lang === "ta" ? result.boy_details.rasi_ta : result.boy_details.rasi}
              </span>
            </div>
            <div>
              <span className="text-[var(--ink-soft)]">நட்சத்திரம்: </span>
              <span className="font-bold">
                {lang === "ta" ? result.boy_details.nakshatra_ta : result.boy_details.nakshatra} (பாதம் {result.boy_details.pada})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-4">
          <span className="text-xs text-[var(--red-deep)] font-bold uppercase tracking-wider font-cinzel block mb-1">
            {lang === "ta" ? "மணமகள் விவரங்கள்" : "Girl's Details"}
          </span>
          <div className="text-sm font-tamil text-[var(--ink)] space-y-1">
            <div>
              <span className="text-[var(--ink-soft)]">ராசி: </span>
              <span className="font-bold">
                {lang === "ta" ? result.girl_details.rasi_ta : result.girl_details.rasi}
              </span>
            </div>
            <div>
              <span className="text-[var(--ink-soft)]">நட்சத்திரம்: </span>
              <span className="font-bold">
                {lang === "ta" ? result.girl_details.nakshatra_ta : result.girl_details.nakshatra} (பாதம் {result.girl_details.pada})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. South Indian Tamil 10-Porutham Table */}
      <div>
        <h4 className="text-lg font-bold text-[var(--ink)] font-cinzel mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--red)]" />
          {lang === "ta" ? "தென்னிந்திய 10 பொருத்தங்கள் விவரம்" : "South Indian Tamil 10-Porutham Breakdown"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.tamil_10_porutham.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                item.is_compatible
                  ? "bg-[rgba(46,125,50,0.06)] border-[#2e7d32]"
                  : "bg-[rgba(176,55,38,0.05)] border-[rgba(176,55,38,0.3)]"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.is_compatible ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
                  )}
                  <span className="font-tamil font-bold text-sm text-[var(--ink)]">
                    {lang === "ta" ? item.name_ta : item.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] font-tamil leading-relaxed">
                  {lang === "ta" ? item.description_ta : item.description}
                </p>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shrink-0 border ${
                  item.is_compatible
                    ? "bg-[rgba(46,125,50,0.12)] text-[#1b5e20] border-[#2e7d32]"
                    : "bg-[rgba(176,55,38,0.12)] text-[var(--red-deep)] border-[var(--red)]"
                }`}
              >
                {item.is_compatible
                  ? lang === "ta"
                    ? "பொருத்தம் உண்டு"
                    : "Matched"
                  : lang === "ta"
                  ? "பொருத்தம் இல்லை"
                  : "Not Matched"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ashta Koota 36-Point Table */}
      <div>
        <h4 className="text-lg font-bold text-[var(--ink)] font-cinzel mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--red)]" />
          {lang === "ta" ? "அஷ்டகூட 36-புள்ளி அட்டவணை (Ashta Koota)" : "Ashta Koota 36-Points Breakdown"}
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(43,33,23,0.3)] bg-[rgba(120,96,58,0.03)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[rgba(120,96,58,0.08)] text-[var(--ink)] border-b border-[rgba(43,33,23,0.25)] font-tamil font-bold">
              <tr>
                <th className="py-2.5 px-4">{lang === "ta" ? "கூடம் (Koota)" : "Kuta"}</th>
                <th className="py-2.5 px-3">{lang === "ta" ? "விளக்கம்" : "Significance"}</th>
                <th className="py-2.5 px-3 text-center">{lang === "ta" ? "அதிகபட்சம்" : "Max"}</th>
                <th className="py-2.5 px-3 text-center">{lang === "ta" ? "பெற்றது" : "Obtained"}</th>
                <th className="py-2.5 px-3 text-right">{lang === "ta" ? "நிலை" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(43,33,23,0.12)] text-[var(--ink)]">
              {result.ashta_koota.kutas.map((kuta: any, idx: number) => (
                <tr key={idx} className="hover:bg-[rgba(43,33,23,0.04)]">
                  <td className="py-2.5 px-4 font-tamil font-bold text-[var(--ink)]">
                    {lang === "ta" ? kuta.name_ta : kuta.name}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--ink-soft)] font-tamil">
                    {lang === "ta" ? kuta.description_ta : kuta.description}
                  </td>
                  <td className="py-2.5 px-3 text-center font-caveat font-bold text-base">
                    {kuta.max_points}
                  </td>
                  <td className="py-2.5 px-3 text-center font-caveat font-bold text-base text-[var(--red-deep)]">
                    {kuta.obtained_points}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        kuta.obtained_points === kuta.max_points
                          ? "bg-[rgba(46,125,50,0.1)] text-[#1b5e20] border-[#2e7d32]"
                          : kuta.obtained_points > 0
                          ? "bg-[rgba(230,81,0,0.1)] text-[#b23c00] border-[#e65100]"
                          : "bg-[rgba(176,55,38,0.1)] text-[var(--red-deep)] border-[var(--red)]"
                      }`}
                    >
                      {kuta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
