"use client";

import React, { useState } from "react";
import { KattamPlanet } from "@/lib/types";
import {
  NORTH_INDIAN_HOUSES,
  signForNorthIndianHouse,
  findLagnaSignNum,
  CHART_STYLE_THEMES,
} from "@/lib/chartLayouts";

interface NorthIndianDiamondChartProps {
  kattamData: Record<number, KattamPlanet[]>;
  lang: "ta" | "en";
  title: string;
  titleTa: string;
}

const SIGN_LABEL: Record<number, { en: string; ta: string }> = {
  1: { en: "Ar", ta: "மே" },
  2: { en: "Ta", ta: "ரி" },
  3: { en: "Ge", ta: "மி" },
  4: { en: "Cn", ta: "க" },
  5: { en: "Le", ta: "சி" },
  6: { en: "Vi", ta: "க" },
  7: { en: "Li", ta: "து" },
  8: { en: "Sc", ta: "விரு" },
  9: { en: "Sg", ta: "த" },
  10: { en: "Cp", ta: "ம" },
  11: { en: "Aq", ta: "கும்" },
  12: { en: "Pi", ta: "மீ" },
};

// Digital/SVG rendering of the fixed-house North Indian diamond chart.
// Geometry & citation: see frontend/lib/chartLayouts.ts.
export const NorthIndianDiamondChart: React.FC<NorthIndianDiamondChartProps> = ({
  kattamData,
  lang,
  title,
  titleTa,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<KattamPlanet | null>(null);
  const theme = CHART_STYLE_THEMES.north_indian;
  const lagnaSignNum = findLagnaSignNum(kattamData);

  return (
    <div className="w-full max-w-[450px]">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto rounded-2xl border-2 shadow-2xl"
        style={{ borderColor: `${theme.inkSoft}66`, background: "linear-gradient(135deg, #1b1215, #120a0d)" }}
      >
        <rect x="2" y="2" width="396" height="396" fill="none" stroke={theme.inkSoft} strokeWidth="2" />

        {NORTH_INDIAN_HOUSES.map((h) => {
          const signNum = signForNorthIndianHouse(lagnaSignNum, h.house);
          const planets = kattamData[signNum] || [];
          const hasLagna = planets.some((p) => p.is_lagna);
          const label = SIGN_LABEL[signNum];

          return (
            <g key={h.house}>
              <polygon
                points={h.points}
                fill={hasLagna ? theme.lagnaBg : "rgba(37,24,28,0.55)"}
                stroke={hasLagna ? theme.lagnaBorder : theme.cellBorder}
                strokeWidth={hasLagna ? 1.8 : 1}
              />
              <text
                x={h.labelX}
                y={h.labelY - 16}
                textAnchor="middle"
                fontSize="8"
                fill={theme.inkSoft}
                opacity={0.75}
              >
                {lang === "ta" ? label.ta : label.en} · {signNum}
              </text>
              {planets.map((p, idx) => (
                <text
                  key={idx}
                  x={h.labelX}
                  y={h.labelY - 2 + idx * 12}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={p.is_lagna ? 700 : 600}
                  fill={p.is_lagna ? "#ffd700" : "#f5eedb"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedPlanet(p)}
                >
                  {lang === "ta" ? p.symbol : p.name.substring(0, 2)}
                  {p.degree ? ` ${Math.floor(p.degree)}°` : ""}
                  {p.is_retrograde ? "(R)" : ""}
                </text>
              ))}
            </g>
          );
        })}

        <text x="200" y="192" textAnchor="middle" fontSize="20" fill={theme.accent}>
          ௐ
        </text>
        <text x="200" y="214" textAnchor="middle" fontSize="9.5" fill="#f5eedb" fontWeight={700}>
          {lang === "ta" ? titleTa : title}
        </text>
      </svg>

      {selectedPlanet && (
        <div className="mt-3 w-full bg-[#201518] border border-[#d4af37]/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#ffd700] mr-2">
              {lang === "ta" ? selectedPlanet.name_ta : selectedPlanet.name}
            </span>
            <span className="text-[#e0b87f]">
              {selectedPlanet.degree}° | {selectedPlanet.status || "Direct"}
              {selectedPlanet.is_retrograde ? " (வக்ரம்)" : ""}
            </span>
          </div>
          <button
            onClick={() => setSelectedPlanet(null)}
            className="text-white/50 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};