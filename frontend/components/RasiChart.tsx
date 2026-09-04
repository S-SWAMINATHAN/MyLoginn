"use client";

import React, { useState } from "react";
import { KattamPlanet } from "@/lib/types";
import { HandwrittenChartCanvas } from "./HandwrittenChartCanvas";
import { NorthIndianDiamondChart } from "./NorthIndianDiamondChart";
import { SOUTH_INDIAN_BOX_ORDER, CHART_STYLE_THEMES, ChartStyle } from "@/lib/chartLayouts";
import { Eye, Palette } from "lucide-react";

interface RasiChartProps {
  kattamData: Record<number, KattamPlanet[]>;
  chartStyle: ChartStyle;
  lang: "ta" | "en";
}

export const RasiChart: React.FC<RasiChartProps> = ({
  kattamData,
  chartStyle,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<"handwritten" | "digital">("handwritten");
  const [selectedPlanet, setSelectedPlanet] = useState<KattamPlanet | null>(null);
  const theme = CHART_STYLE_THEMES[chartStyle] || CHART_STYLE_THEMES.tamil;

  return (
    <div className="flex flex-col items-center w-full">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#ffd700] font-cinzel">
            {lang === "ta" ? "ராசி கட்டம் (D1)" : "Rasi Chart (D1)"}
          </span>
        </div>

        <div className="flex items-center bg-[#1e1518] p-1 rounded-lg border border-[#d4af37]/30 text-xs">
          <button
            onClick={() => setViewMode("handwritten")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewMode === "handwritten"
                ? "bg-[#6b1426] text-[#ffd700] font-semibold"
                : "text-[#d4af37]/70 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "ஓலைச்சுவடி பாணி" : "Manuscript"}</span>
          </button>

          <button
            onClick={() => setViewMode("digital")}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              viewMode === "digital"
                ? "bg-[#6b1426] text-[#ffd700] font-semibold"
                : "text-[#d4af37]/70 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "டிஜிட்டல்" : "Digital"}</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {viewMode === "handwritten" ? (
        <HandwrittenChartCanvas
          title="Rasi Chart (D1)"
          titleTa="ராசி கட்டம்"
          kattamData={kattamData}
          chartStyle={chartStyle}
          lang={lang}
          width={450}
          height={450}
        />
      ) : chartStyle === "north_indian" ? (
        <NorthIndianDiamondChart
          kattamData={kattamData}
          lang={lang}
          title="Rasi Chart (D1)"
          titleTa="ராசி கட்டம்"
        />
      ) : (
        /* Digital South Indian / Kerala Grid */
        <div
          className="relative w-full max-w-[450px] aspect-square rounded-2xl p-2 shadow-2xl border-2"
          style={{
            background: "linear-gradient(135deg, #1b1215, #120a0d)",
            borderColor: `${theme.inkSoft}66`,
          }}
        >
          <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1.5">
            {SOUTH_INDIAN_BOX_ORDER.map((cell) => {
              const planets = kattamData[cell.signNum] || [];
              const hasLagna = planets.some((p) => p.is_lagna);

              return (
                <div
                  key={cell.signNum}
                  style={{
                    gridRow: cell.row + 1,
                    gridColumn: cell.col + 1,
                    background: hasLagna ? theme.lagnaBg : theme.cellBg,
                    borderColor: hasLagna ? theme.lagnaBorder : theme.cellBorder,
                  }}
                  className="relative p-1.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02]"
                >
                  {/* Sign watermark */}
                  <span className="text-[10px] text-[#d4af37]/50 font-tamil font-medium text-right self-end">
                    {lang === "ta" ? cell.nameTa : cell.name}
                  </span>

                  {/* Planets List */}
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {planets.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPlanet(p)}
                        className={`text-xs px-1 py-0.5 rounded cursor-pointer flex items-center justify-between transition-colors ${
                          p.is_lagna
                            ? "bg-[#ffd700]/20 text-[#ffd700] font-bold border border-[#ffd700]/40"
                            : "text-[#f5eedb] hover:bg-white/10"
                        }`}
                      >
                        <span className="font-tamil font-semibold">
                          {lang === "ta" ? p.symbol : p.name}
                        </span>
                        <span className="text-[10px] opacity-75 font-mono">
                          {p.degree ? `${Math.floor(p.degree)}°` : ""}
                          {p.is_retrograde ? "(R)" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Central Box */}
            <div
              className="col-start-2 col-span-2 row-start-2 row-span-2 rounded-2xl border flex flex-col items-center justify-center p-3 text-center shadow-inner"
              style={{ background: "#140b0e90", borderColor: `${theme.inkSoft}55` }}
            >
              <span className="text-3xl mb-1 font-bold" style={{ color: theme.inkSoft }}>ௐ</span>
              <span className="text-sm font-bold text-white font-cinzel tracking-wider">
                {lang === "ta" ? "ராசி கட்டம்" : "RASI KATTAM"}
              </span>
              <span className="text-[10px] font-tamil mt-0.5" style={{ color: `${theme.inkSoft}b0` }}>
                D1 Chart
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Planet Detail Modal / Info Pill */}
      {selectedPlanet && (
        <div className="mt-3 w-full bg-[#201518] border border-[#d4af37]/40 rounded-xl p-2.5 flex items-center justify-between text-xs animate-fade-in">
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