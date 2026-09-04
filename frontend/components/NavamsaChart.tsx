"use client";

import React, { useState } from "react";
import { KattamPlanet } from "@/lib/types";
import { HandwrittenChartCanvas } from "./HandwrittenChartCanvas";
import { NorthIndianDiamondChart } from "./NorthIndianDiamondChart";
import { SOUTH_INDIAN_BOX_ORDER, CHART_STYLE_THEMES, ChartStyle } from "@/lib/chartLayouts";
import { Eye, Palette } from "lucide-react";

interface NavamsaChartProps {
  kattamData: Record<number, KattamPlanet[]>;
  chartStyle: ChartStyle;
  lang: "ta" | "en";
}

// NEW: same dignity-colour classification as RasiChart.tsx — see that
// file's comment for what this reads and why.
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

export const NavamsaChart: React.FC<NavamsaChartProps> = ({
  kattamData,
  chartStyle,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<"handwritten" | "digital">("handwritten");
  const theme = CHART_STYLE_THEMES[chartStyle] || CHART_STYLE_THEMES.tamil;

  return (
    <div className="flex flex-col items-center w-full">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <span className="text-sm font-bold text-[#ffd700] font-cinzel">
          {lang === "ta" ? "நவாம்சம் கட்டம் (D9)" : "Navamsa Chart (D9)"}
        </span>

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
            <span>{lang === "ta" ? "ஓலைச்சுவடி" : "Manuscript"}</span>
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

      {viewMode === "handwritten" ? (
        <HandwrittenChartCanvas
          title="Navamsa Chart (D9)"
          titleTa="நவாம்ச கட்டம்"
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
          title="Navamsa Chart (D9)"
          titleTa="நவாம்ச கட்டம்"
        />
      ) : (
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
                  <span className="text-[10px] text-[#d4af37]/50 font-tamil font-medium text-right self-end">
                    {lang === "ta" ? cell.nameTa : cell.name}
                  </span>

                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {planets.map((p, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded flex items-center justify-between border border-transparent ${
                          p.is_lagna
                            ? "bg-[#ffd700]/20 text-[#ffd700] font-bold border-[#ffd700]/40"
                            : "text-[#f5eedb]"
                        } ${dignityChipClasses(p.status)}`}
                        title={p.status || undefined}
                      >
                        <span className="font-tamil font-semibold">
                          {lang === "ta" ? p.symbol : p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div
              className="col-start-2 col-span-2 row-start-2 row-span-2 rounded-2xl border flex flex-col items-center justify-center p-3 text-center shadow-inner"
              style={{ background: "#140b0e90", borderColor: `${theme.inkSoft}55` }}
            >
              <span className="text-3xl mb-1 font-bold" style={{ color: theme.inkSoft }}>ௐ</span>
              <span className="text-sm font-bold text-white font-cinzel tracking-wider">
                {lang === "ta" ? "நவாம்சம்" : "NAVAMSA"}
              </span>
              <span className="text-[10px] font-tamil mt-0.5" style={{ color: `${theme.inkSoft}b0` }}>
                D9 Chart
              </span>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};