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

// NEW: Exalted (Utcham) → green, Debilitated (Neecham) → red, per the
// user's "Design Note" requirement. Reads the `status` field the backend
// already attaches to each kattam entry in chart_builder.py — no new data
// needed, purely a rendering-layer classification.
function dignityChipClasses(status?: string): string {
  if (!status) return "";
  if (status.includes("Exalted")) {
    return "!bg-emerald-900/40 !border-emerald-400/70 !text-emerald-300";
  }
  if (status.includes("Debilitated")) {
    return "!bg-rose-900/40 !border-rose-400/70 !text-rose-300";
  }
  return "";
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
          <span className="text-base font-bold text-[#161b33] font-script">
            {lang === "ta" ? "ராசி கட்டம் (Rasi D1)" : "Rasi Chart (D1)"}
          </span>
        </div>

        <div className="flex items-center bg-[#e7eefb] p-1 rounded-lg border border-[#8b93b5]/50 text-xs">
          <button
            onClick={() => setViewMode("handwritten")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all font-tamil ${
              viewMode === "handwritten"
                ? "bg-[#2454c7] text-white font-semibold shadow-xs"
                : "text-[#4a5578] hover:text-[#161b33]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "கையெழுத்து பாணி" : "Manuscript"}</span>
          </button>

          <button
            onClick={() => setViewMode("digital")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all font-tamil ${
              viewMode === "digital"
                ? "bg-[#2454c7] text-white font-semibold shadow-xs"
                : "text-[#4a5578] hover:text-[#161b33]"
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
        <div className="relative w-full max-w-[450px] aspect-square rounded-2xl bg-[#ffffff] border-2 border-[#8b93b5]/60 p-2 shadow-lg">
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
                  className={`relative p-1.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                    hasLagna
                      ? "bg-[#e7eefb] border-[#2454c7] shadow-xs"
                      : "bg-[#fbfdff] border-[#8b93b5]/30 hover:border-[#8b93b5]/70"
                  }`}
                >
                  {/* Sign watermark */}
                  <span className="text-[10px] text-[#4a5578] font-tamil font-medium text-right self-end">
                    {lang === "ta" ? cell.nameTa : cell.name}
                  </span>

                  {/* Planets List */}
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {planets.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPlanet(p)}
                        className={`text-xs px-1 py-0.5 rounded cursor-pointer flex items-center justify-between transition-colors border border-transparent ${
                          p.is_lagna
                            ? "bg-[#2454c7]/15 text-[#17348f] font-bold border border-[#2454c7]/40"
                            : "text-[#161b33] hover:bg-[#e7eefb]/60"
                        }`}
                        title={p.status || undefined}
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
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#e7eefb] rounded-2xl border border-[#8b93b5]/40 flex flex-col items-center justify-center p-3 text-center shadow-inner">
              <span className="text-3xl text-[#2454c7] mb-1 font-bold font-script">ஸ்ரீ</span>
              <span className="text-sm font-bold text-[#161b33] font-script tracking-wider">
                {lang === "ta" ? "ராசி கட்டம்" : "RASI KATTAM"}
              </span>
              <span className="text-[10px] text-[#4a5578] font-tamil mt-0.5">
                D1 Chart
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend for dignity colours — only shown in digital view */}
      {viewMode === "digital" && chartStyle !== "north_indian" && (
        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/50">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            {lang === "ta" ? "உச்சம்" : "Exalted"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            {lang === "ta" ? "நீசம்" : "Debilitated"}
          </span>
        </div>
      )}

      {/* Selected Planet Detail Modal / Info Pill */}
      {selectedPlanet && (
        <div className="mt-3 w-full bg-[#11162e] border border-[#d4af37]/40 rounded-xl p-2.5 flex items-center justify-between text-xs animate-fade-in">
          <div>
            <span className="font-bold text-[#ffd700] mr-2">
              {lang === "ta" ? selectedPlanet.name_ta : selectedPlanet.name}
            </span>
            <span className="text-[#c3d6f5]">
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