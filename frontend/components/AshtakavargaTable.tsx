"use client";

import React from "react";
import { AshtakavargaResult } from "@/lib/types";
import { Grid, Sparkles } from "lucide-react";

interface AshtakavargaTableProps {
  ashtakavarga: AshtakavargaResult;
  lang: "ta" | "en";
}

const SIGN_NAMES_TA = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
  "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
];

const SIGN_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const PLANET_NAMES_TA: Record<string, string> = {
  Sun: "சூரியன்",
  Moon: "சந்திரன்",
  Mars: "செவ்வாய்",
  Mercury: "புதன்",
  Jupiter: "குரு",
  Venus: "சுக்கிரன்",
  Saturn: "சனி"
};

export const AshtakavargaTable: React.FC<AshtakavargaTableProps> = ({
  ashtakavarga,
  lang,
}) => {
  const signs = lang === "ta" ? SIGN_NAMES_TA : SIGN_NAMES_EN;

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#ffd700] flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "அஷ்டகவர்க்கம் (Ashtakavarga Point Table)" : "Ashtakavarga Points Matrix"}
          </h3>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "பராசர முனிவர் அருளிய 8 கிரக பின்ன அஷ்டகவர்க்கம் & சர்வ அஷ்டகவர்க்கம் (மொத்தம்: 337 புள்ளிகள்)"
              : "BPHS Sarvashtakavarga bindu distribution across 12 signs (Total: 337 points)"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#d4af37]/30 bg-[#160f12]/90">
        <table className="w-full text-center text-xs">
          <thead className="bg-[#201215] text-[#d4af37] border-b border-[#d4af37]/30 font-tamil font-bold">
            <tr>
              <th className="py-3 px-3 text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th>
              {signs.map((s, idx) => (
                <th key={idx} className="py-3 px-2 border-l border-white/5">
                  {s}
                </th>
              ))}
              <th className="py-3 px-3 bg-[#6b1426]/60 text-[#ffd700] border-l border-[#d4af37]/40 font-mono">
                {lang === "ta" ? "மொத்தம்" : "Total"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-white/90">
            {Object.entries(ashtakavarga.bhinnashtakavarga).map(([planet, row], pIdx) => {
              const rowSum = row.reduce((a, b) => a + b, 0);

              return (
                <tr key={pIdx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-left font-tamil font-semibold text-[#ffd700]">
                    {lang === "ta" ? PLANET_NAMES_TA[planet] || planet : planet}
                  </td>
                  {row.map((val, rIdx) => (
                    <td key={rIdx} className="py-2.5 px-2 border-l border-white/5 font-mono text-white/80">
                      {val}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 bg-[#6b1426]/30 text-[#ffd700] font-mono font-bold border-l border-[#d4af37]/30">
                    {rowSum}
                  </td>
                </tr>
              );
            })}

            {/* Sarvashtakavarga Total Row */}
            <tr className="bg-[#2a171d] font-bold text-white border-t-2 border-[#d4af37]/50">
              <td className="py-3 px-3 text-left font-cinzel text-[#ffd700]">
                {lang === "ta" ? "சர்வ அஷ்டகவர்க்கம்" : "Sarvashtakavarga"}
              </td>
              {ashtakavarga.sarvashtakavarga.map((total, tIdx) => {
                const isHigh = total >= 30;
                const isGood = total >= 28;
                const isLow = total < 25;

                return (
                  <td
                    key={tIdx}
                    className={`py-3 px-2 border-l border-white/10 font-mono text-sm ${
                      isHigh
                        ? "text-emerald-400 font-extrabold bg-emerald-950/40"
                        : isGood
                        ? "text-[#ffd700] font-bold"
                        : isLow
                        ? "text-rose-400"
                        : "text-white"
                    }`}
                  >
                    {total}
                  </td>
                );
              })}
              <td className="py-3 px-3 bg-[#6b1426] text-[#ffd700] font-mono text-sm font-extrabold border-l border-[#ffd700]">
                {ashtakavarga.total_points}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
