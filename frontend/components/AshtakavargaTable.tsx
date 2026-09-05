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
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)]">
      {/* Head */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
            <Grid className="w-5 h-5 text-[var(--red)]" />
            {lang === "ta" ? "அஷ்டகவர்க்கம் (Ashtakavarga Point Table)" : "Ashtakavarga Points Matrix"}
          </h3>
          <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
            {lang === "ta"
              ? "பராசர முனிவர் அருளிய 7 கிரக பின்ன அஷ்டகவர்க்கம் & சர்வ அஷ்டகவர்க்கம் (மொத்தம்: 337 புள்ளிகள்)"
              : "BPHS Sarvashtakavarga bindu distribution across 12 signs (Total: 337 points)"}
          </p>
        </div>
      </div>

      {/* Table & Hand-ruled Grid */}
      <div className="overflow-x-auto rounded-2xl border border-[rgba(43,33,23,0.3)] bg-[rgba(120,96,58,0.03)]">
        <table className="w-full text-center text-xs border-collapse">
          <thead className="bg-[rgba(120,96,58,0.08)] text-[var(--ink)] border-b border-[rgba(43,33,23,0.25)] font-tamil font-bold">
            <tr>
              <th className="py-3 px-3 text-left">
                {lang === "ta" ? "கிரகம்" : "Planet"}
                <i className="block not-italic font-caveat text-[12px] text-[var(--red)] font-normal uppercase tracking-wider">
                  Planet
                </i>
              </th>
              {signs.map((s, idx) => (
                <th key={idx} className="py-3 px-2 border-l border-[rgba(43,33,23,0.15)]">
                  {s}
                  <i className="block not-italic font-caveat text-[11px] text-[var(--ink-soft)] font-normal">
                    {idx + 1}
                  </i>
                </th>
              ))}
              <th className="py-3 px-3 bg-[rgba(176,55,38,0.08)] text-[var(--red-deep)] border-l border-[var(--red)] font-caveat text-sm">
                {lang === "ta" ? "மொத்தம்" : "Total"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[rgba(43,33,23,0.12)] text-[var(--ink)]">
            {Object.entries(ashtakavarga.bhinnashtakavarga).map(([planet, row], pIdx) => {
              const rowSum = row.reduce((a, b) => a + b, 0);

              return (
                <tr key={pIdx} className="hover:bg-[rgba(43,33,23,0.04)] transition-colors">
                  <td className="py-2.5 px-3 text-left font-tamil font-semibold text-[var(--ink)]">
                    {lang === "ta" ? PLANET_NAMES_TA[planet] || planet : planet}
                  </td>
                  {row.map((val, rIdx) => (
                    <td key={rIdx} className="py-2.5 px-2 border-l border-[rgba(43,33,23,0.1)] font-caveat text-base text-[var(--ink)]">
                      {val}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 bg-[rgba(176,55,38,0.04)] text-[var(--red-deep)] font-caveat font-bold text-base border-l border-[rgba(43,33,23,0.2)]">
                    {rowSum}
                  </td>
                </tr>
              );
            })}

            {/* Sarvashtakavarga Total Row */}
            <tr className="bg-[rgba(176,55,38,0.08)] font-bold text-[var(--ink)] border-t-2 border-[var(--red)]">
              <td className="py-3 px-3 text-left font-cinzel text-[var(--red-deep)]">
                {lang === "ta" ? "சர்வ அஷ்டகவர்க்கம்" : "Sarvashtakavarga"}
              </td>
              {ashtakavarga.sarvashtakavarga.map((total, tIdx) => {
                const isHigh = total >= 30;
                const isGood = total >= 28;
                const isLow = total < 25;

                return (
                  <td
                    key={tIdx}
                    className={`py-3 px-2 border-l border-[rgba(43,33,23,0.15)] font-caveat text-lg ${
                      isHigh
                        ? "text-[#1b5e20] font-extrabold bg-[rgba(46,125,50,0.1)]"
                        : isGood
                        ? "text-[var(--red-deep)] font-bold"
                        : isLow
                        ? "text-[var(--ink-faint)]"
                        : "text-[var(--ink)]"
                    }`}
                  >
                    {total}
                  </td>
                );
              })}
              <td className="py-3 px-3 bg-[var(--red)] text-white font-caveat text-lg font-bold border-l border-[var(--red)]">
                {ashtakavarga.total_points}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Margin Note */}
      <div className="mt-4 p-3 rounded-xl bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.15)] text-xs text-[var(--ink-soft)] font-tamil flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--red)] shrink-0" />
        <span>
          {lang === "ta"
            ? "28-க்கு மேல் புள்ளி உள்ள ராசிகள் பலமானவை — கோச்சார சனி, குரு இந்த ராசிகளில் சஞ்சரிக்கும் போது சுப பலன்கள் மிகுதியாகும்."
            : "Signs with 28+ points are auspicious. Saturn and Jupiter transits through these signs yield highly favorable results."}
        </span>
      </div>
    </div>
  );
};
