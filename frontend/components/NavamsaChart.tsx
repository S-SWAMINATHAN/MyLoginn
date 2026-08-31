"use client";

import React, { useState } from "react";
import { KattamPlanet } from "@/lib/types";
import { HandwrittenChartCanvas } from "./HandwrittenChartCanvas";
import { Eye, Palette } from "lucide-react";

interface NavamsaChartProps {
  kattamData: Record<number, KattamPlanet[]>;
  chartStyle: "tamil" | "kerala" | "north_indian";
  lang: "ta" | "en";
}

const BOX_CELLS = [
  { signNum: 12, row: 1, col: 1, name: "Meena", nameTa: "மீனம்" },
  { signNum: 1,  row: 1, col: 2, name: "Mesha", nameTa: "மேஷம்" },
  { signNum: 2,  row: 1, col: 3, name: "Vrishabha", nameTa: "ரிஷபம்" },
  { signNum: 3,  row: 1, col: 4, name: "Mithuna", nameTa: "மிதுனம்" },
  { signNum: 4,  row: 2, col: 4, name: "Karkataka", nameTa: "கடகம்" },
  { signNum: 5,  row: 3, col: 4, name: "Simha", nameTa: "சிம்மம்" },
  { signNum: 6,  row: 4, col: 4, name: "Kanya", nameTa: "கன்னி" },
  { signNum: 7,  row: 4, col: 3, name: "Tula", nameTa: "துலாம்" },
  { signNum: 8,  row: 4, col: 2, name: "Vrischika", nameTa: "விருச்சிகம்" },
  { signNum: 9,  row: 4, col: 1, name: "Dhanus", nameTa: "தனுசு" },
  { signNum: 10, row: 3, col: 1, name: "Makara", nameTa: "மகரம்" },
  { signNum: 11, row: 2, col: 1, name: "Kumbha", nameTa: "கும்பம்" },
];

export const NavamsaChart: React.FC<NavamsaChartProps> = ({
  kattamData,
  chartStyle,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<"handwritten" | "digital">("handwritten");

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
          lang={lang}
          width={450}
          height={450}
        />
      ) : (
        <div className="relative w-full max-w-[450px] aspect-square rounded-2xl bg-gradient-to-br from-[#1b1215] to-[#120a0d] border-2 border-[#d4af37]/40 p-2 shadow-2xl">
          <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-1.5">
            {BOX_CELLS.map((cell) => {
              const planets = kattamData[cell.signNum] || [];
              const hasLagna = planets.some((p) => p.is_lagna);

              return (
                <div
                  key={cell.signNum}
                  style={{
                    gridRow: cell.row,
                    gridColumn: cell.col,
                  }}
                  className={`relative p-1.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                    hasLagna
                      ? "bg-[#6b1426]/30 border-[#ffd700]/60 shadow-lg shadow-[#ffd700]/5"
                      : "bg-[#25181c]/70 border-[#d4af37]/20 hover:border-[#d4af37]/60"
                  }`}
                >
                  <span className="text-[10px] text-[#d4af37]/50 font-tamil font-medium text-right self-end">
                    {lang === "ta" ? cell.nameTa : cell.name}
                  </span>

                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {planets.map((p, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded flex items-center justify-between ${
                          p.is_lagna
                            ? "bg-[#ffd700]/20 text-[#ffd700] font-bold border border-[#ffd700]/40"
                            : "text-[#f5eedb]"
                        }`}
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

            <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#140b0e]/90 rounded-2xl border border-[#d4af37]/30 flex flex-col items-center justify-center p-3 text-center shadow-inner">
              <span className="text-3xl text-[#ffd700] mb-1 font-bold">ௐ</span>
              <span className="text-sm font-bold text-white font-cinzel tracking-wider">
                {lang === "ta" ? "நவாம்சம்" : "NAVAMSA"}
              </span>
              <span className="text-[10px] text-[#d4af37]/70 font-tamil mt-0.5">
                D9 Chart
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
