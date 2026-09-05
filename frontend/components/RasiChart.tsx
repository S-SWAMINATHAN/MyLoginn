"use client";

import React, { useState } from "react";
import { KattamPlanet } from "@/lib/types";
import { HandwrittenChartCanvas } from "./HandwrittenChartCanvas";
import { Eye, Palette, Sparkles } from "lucide-react";

interface RasiChartProps {
  kattamData: Record<number, KattamPlanet[]>;
  chartStyle: "tamil" | "kerala" | "north_indian";
  lang: "ta" | "en";
}

const BOX_CELLS = [
  { signNum: 12, row: 1, col: 1, name: "Meena", nameTa: "மீனம்", lord: "Guru" },
  { signNum: 1,  row: 1, col: 2, name: "Mesha", nameTa: "மேஷம்", lord: "Sevvai" },
  { signNum: 2,  row: 1, col: 3, name: "Vrishabha", nameTa: "ரிஷபம்", lord: "Sukra" },
  { signNum: 3,  row: 1, col: 4, name: "Mithuna", nameTa: "மிதுனம்", lord: "Budha" },
  { signNum: 4,  row: 2, col: 4, name: "Karkataka", nameTa: "கடகம்", lord: "Chandra" },
  { signNum: 5,  row: 3, col: 4, name: "Simha", nameTa: "சிம்மம்", lord: "Surya" },
  { signNum: 6,  row: 4, col: 4, name: "Kanya", nameTa: "கன்னி", lord: "Budha" },
  { signNum: 7,  row: 4, col: 3, name: "Tula", nameTa: "துலாம்", lord: "Sukra" },
  { signNum: 8,  row: 4, col: 2, name: "Vrischika", nameTa: "விருச்சிகம்", lord: "Sevvai" },
  { signNum: 9,  row: 4, col: 1, name: "Dhanus", nameTa: "தனுசு", lord: "Guru" },
  { signNum: 10, row: 3, col: 1, name: "Makara", nameTa: "மகரம்", lord: "Sani" },
  { signNum: 11, row: 2, col: 1, name: "Kumbha", nameTa: "கும்பம்", lord: "Sani" },
];

export const RasiChart: React.FC<RasiChartProps> = ({
  kattamData,
  chartStyle,
  lang,
}) => {
  const [viewMode, setViewMode] = useState<"handwritten" | "digital">("handwritten");
  const [selectedPlanet, setSelectedPlanet] = useState<KattamPlanet | null>(null);

  return (
    <div className="flex flex-col items-center w-full">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#2b2117] font-script">
            {lang === "ta" ? "ராசி கட்டம் (Rasi D1)" : "Rasi Chart (D1)"}
          </span>
        </div>

        <div className="flex items-center bg-[#eae0c6] p-1 rounded-lg border border-[#a3917a]/50 text-xs">
          <button
            onClick={() => setViewMode("handwritten")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all font-tamil ${
              viewMode === "handwritten"
                ? "bg-[#b03726] text-white font-semibold shadow-xs"
                : "text-[#6f6049] hover:text-[#2b2117]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{lang === "ta" ? "கையெழுத்து பாணி" : "Manuscript"}</span>
          </button>

          <button
            onClick={() => setViewMode("digital")}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all font-tamil ${
              viewMode === "digital"
                ? "bg-[#b03726] text-white font-semibold shadow-xs"
                : "text-[#6f6049] hover:text-[#2b2117]"
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
          lang={lang}
          width={450}
          height={450}
        />
      ) : (
        /* Digital South Indian / Kerala Grid */
        <div className="relative w-full max-w-[450px] aspect-square rounded-2xl bg-[#fdfaf2] border-2 border-[#a3917a]/60 p-2 shadow-lg">
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
                      ? "bg-[#f5e8d5] border-[#b03726] shadow-xs"
                      : "bg-[#fffdf8] border-[#a3917a]/30 hover:border-[#a3917a]/70"
                  }`}
                >
                  {/* Sign watermark */}
                  <span className="text-[10px] text-[#6f6049] font-tamil font-medium text-right self-end">
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
                            ? "bg-[#b03726]/15 text-[#8e2b1c] font-bold border border-[#b03726]/40"
                            : "text-[#2b2117] hover:bg-[#ebdcc2]/60"
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
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#f7efdc] rounded-2xl border border-[#a3917a]/40 flex flex-col items-center justify-center p-3 text-center shadow-inner">
              <span className="text-3xl text-[#b03726] mb-1 font-bold font-script">ஸ்ரீ</span>
              <span className="text-sm font-bold text-[#2b2117] font-script tracking-wider">
                {lang === "ta" ? "ராசி கட்டம்" : "RASI KATTAM"}
              </span>
              <span className="text-[10px] text-[#6f6049] font-tamil mt-0.5">
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
