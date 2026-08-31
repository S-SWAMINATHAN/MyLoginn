"use client";

import React, { useState } from "react";
import { PoruthamMatchResult } from "@/lib/types";
import { Heart, Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Award } from "lucide-react";

interface PoruthamResultProps {
  result: PoruthamMatchResult;
  lang: "ta" | "en";
}

export const PoruthamResult: React.FC<PoruthamResultProps> = ({ result, lang }) => {
  const isUthama = result.score_percentage >= 70 && !result.rajju_dosha;
  const isGood = result.score_percentage >= 50 && !result.rajju_dosha;

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30 space-y-8 animate-fade-in">
      {/* 1. Top Verdict Banner */}
      <div
        className={`rounded-2xl p-6 border text-center relative overflow-hidden ${
          result.rajju_dosha
            ? "bg-rose-950/60 border-rose-500/50 shadow-xl shadow-rose-950/40"
            : isUthama
            ? "bg-gradient-to-br from-[#6b1426]/70 via-[#3a1a1f] to-[#aa820a]/40 border-[#ffd700] shadow-xl shadow-[#ffd700]/15"
            : "bg-[#25181c] border-[#d4af37]/40"
        }`}
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-3xl sm:text-4xl mb-2">
            {result.rajju_dosha ? "⚠️" : isUthama ? "💍" : "✨"}
          </span>

          <h3 className="text-2xl sm:text-3xl font-bold font-tamil text-[#ffd700]">
            {lang === "ta" ? result.verdict_ta : result.verdict}
          </h3>

          <p className="text-xs sm:text-sm text-[#f5eedb]/90 max-w-2xl mt-2 font-tamil leading-relaxed">
            {lang === "ta" ? result.recommendation_ta : result.recommendation}
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs font-mono">
            <div className="px-3 py-1 bg-[#140b0e] border border-[#d4af37]/40 rounded-xl">
              <span className="text-[#e0b87f] mr-1">Ashta Koota:</span>
              <span className="text-[#ffd700] font-bold">
                {result.ashta_koota.total_points} / 36
              </span>
            </div>

            <div className="px-3 py-1 bg-[#140b0e] border border-[#d4af37]/40 rounded-xl">
              <span className="text-[#e0b87f] mr-1">
                {lang === "ta" ? "பத்து பொருத்தம்:" : "Tamil 10-Porutham:"}
              </span>
              <span className="text-emerald-400 font-bold">
                {result.tamil_10_porutham.filter((p) => p.is_compatible).length} / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Boy & Girl Horoscope Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#201418] border border-[#d4af37]/30 rounded-2xl p-4">
          <span className="text-xs text-[#ffd700] font-bold uppercase tracking-wider font-cinzel block mb-1">
            {lang === "ta" ? "மணமகன் விவரங்கள்" : "Boy's Details"}
          </span>
          <div className="text-sm font-tamil text-white space-y-1">
            <div>
              <span className="text-[#e0b87f]">ராசி: </span>
              <span className="font-bold">
                {lang === "ta" ? result.boy_details.rasi_ta : result.boy_details.rasi}
              </span>
            </div>
            <div>
              <span className="text-[#e0b87f]">நட்சத்திரம்: </span>
              <span className="font-bold">
                {lang === "ta" ? result.boy_details.nakshatra_ta : result.boy_details.nakshatra} (பாதம் {result.boy_details.pada})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#201418] border border-[#d4af37]/30 rounded-2xl p-4">
          <span className="text-xs text-[#ffd700] font-bold uppercase tracking-wider font-cinzel block mb-1">
            {lang === "ta" ? "மணமகள் விவரங்கள்" : "Girl's Details"}
          </span>
          <div className="text-sm font-tamil text-white space-y-1">
            <div>
              <span className="text-[#e0b87f]">ராசி: </span>
              <span className="font-bold">
                {lang === "ta" ? result.girl_details.rasi_ta : result.girl_details.rasi}
              </span>
            </div>
            <div>
              <span className="text-[#e0b87f]">நட்சத்திரம்: </span>
              <span className="font-bold">
                {lang === "ta" ? result.girl_details.nakshatra_ta : result.girl_details.nakshatra} (பாதம் {result.girl_details.pada})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. South Indian Tamil 10-Porutham Table */}
      <div>
        <h4 className="text-lg font-bold text-[#ffd700] font-cinzel mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ffd700]" />
          {lang === "ta" ? "தென்னிந்திய 10 பொருத்தங்கள் விவரம்" : "South Indian Tamil 10-Porutham Breakdown"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.tamil_10_porutham.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                item.is_compatible
                  ? "bg-[#181d19]/80 border-emerald-500/40"
                  : "bg-[#251518]/80 border-rose-500/40"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {item.is_compatible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-tamil font-bold text-sm text-white">
                    {lang === "ta" ? item.name_ta : item.name}
                  </span>
                </div>
                <p className="text-xs text-[#e0b87f] font-tamil leading-relaxed">
                  {lang === "ta" ? item.description_ta : item.description}
                </p>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shrink-0 border ${
                  item.is_compatible
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                    : "bg-rose-950 text-rose-300 border-rose-500/50"
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
        <h4 className="text-lg font-bold text-[#ffd700] font-cinzel mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#ffd700]" />
          {lang === "ta" ? "அஷ்டகூட 36-புள்ளி அட்டவணை (Ashta Koota)" : "Ashta Koota 36-Points Breakdown"}
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-[#d4af37]/30 bg-[#160f12]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#201215] text-[#d4af37] border-b border-[#d4af37]/30 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">{lang === "ta" ? "கூடம் (Koota)" : "Kuta"}</th>
                <th className="py-2.5 px-3">{lang === "ta" ? "விளக்கம்" : "Significance"}</th>
                <th className="py-2.5 px-3 text-center">{lang === "ta" ? "அதிகபட்சம்" : "Max"}</th>
                <th className="py-2.5 px-3 text-center">{lang === "ta" ? "பெற்றது" : "Obtained"}</th>
                <th className="py-2.5 px-3 text-right">{lang === "ta" ? "நிலை" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {result.ashta_koota.kutas.map((kuta, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  <td className="py-2.5 px-4 font-tamil font-bold text-[#ffd700]">
                    {lang === "ta" ? kuta.name_ta : kuta.name}
                  </td>
                  <td className="py-2.5 px-3 text-[#e0b87f] font-tamil">
                    {lang === "ta" ? kuta.description_ta : kuta.description}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                    {kuta.max_points}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#ffd700]">
                    {kuta.obtained_points}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        kuta.obtained_points === kuta.max_points
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : kuta.obtained_points > 0
                          ? "bg-amber-950 text-amber-300 border-amber-500/40"
                          : "bg-rose-950 text-rose-300 border-rose-500/40"
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
