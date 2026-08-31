"use client";

import React, { useRef } from "react";
import { ChartResponse } from "@/lib/types";
import { Share2, Download, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";

interface ShareCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

export const ShareCard: React.FC<ShareCardProps> = ({ chart, lang }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#160f12",
      });
      const link = document.createElement("a");
      link.download = `${chart.name}_Jathagam_Card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Error generating card image", e);
    }
  };

  return (
    <div className="palm-leaf-dark rounded-3xl p-6 shadow-2xl border border-[#d4af37]/30 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4 pb-2 border-b border-[#d4af37]/20">
        <h4 className="text-sm font-bold text-[#ffd700] font-cinzel flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#ffd700]" />
          {lang === "ta" ? "பகிரக்கூடிய ஜாதக அட்டை (Share Card)" : "Shareable Social Card"}
        </h4>
        <button
          onClick={handleDownload}
          className="px-3 py-1 bg-[#6b1426] border border-[#ffd700] rounded-xl text-xs font-bold text-[#ffd700] flex items-center gap-1.5 hover:bg-[#aa820a] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === "ta" ? "பதிவிறக்கு" : "Download PNG"}</span>
        </button>
      </div>

      {/* Actual Renderable Share Card */}
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#28171c] via-[#1a0e12] to-[#3a1a22] border-2 border-[#d4af37]/60 p-5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 text-2xl text-[#ffd700]/10 font-serif">ௐ</div>

        {/* Header */}
        <div className="text-center border-b border-[#d4af37]/30 pb-3">
          <span className="text-xl text-[#ffd700] font-bold block">ௐ</span>
          <h3 className="text-lg font-bold text-white font-tamil tracking-wide mt-0.5">
            {chart.name}
          </h3>
          <span className="text-[11px] text-[#e0b87f] font-mono">
            {chart.date_of_birth} | {chart.time_of_birth}
          </span>
          <span className="text-[10px] text-white/50 block font-tamil">
            {chart.place}
          </span>
        </div>

        {/* Core Astrological Badges */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs font-tamil">
          <div className="bg-[#12080a] border border-[#d4af37]/20 rounded-xl p-2 text-center">
            <span className="text-[10px] text-[#d4af37] block">லக்னம் (Lagna)</span>
            <span className="font-bold text-white text-sm">{chart.basic_details.lagnam_ta}</span>
          </div>

          <div className="bg-[#12080a] border border-[#d4af37]/20 rounded-xl p-2 text-center">
            <span className="text-[10px] text-[#d4af37] block">ராசி (Rasi)</span>
            <span className="font-bold text-white text-sm">{chart.basic_details.rasi_ta}</span>
          </div>

          <div className="bg-[#12080a] border border-[#d4af37]/20 rounded-xl p-2 text-center col-span-2">
            <span className="text-[10px] text-[#d4af37] block">நட்சத்திரம் & பாதம்</span>
            <span className="font-bold text-[#ffd700] text-sm">
              {chart.basic_details.nakshatram_ta} (பாதம் {chart.basic_details.pada})
            </span>
          </div>
        </div>

        {/* Highlight Quote */}
        <div className="bg-[#6b1426]/30 border border-[#ffd700]/30 rounded-xl p-2.5 text-center">
          <p className="text-[11px] text-[#f5eedb] font-tamil italic leading-snug">
            {chart.yogas && chart.yogas.filter((y) => y.present).length > 0
              ? `விசேஷ யோகம்: ${chart.yogas.filter((y) => y.present)[0].name_ta}`
              : "சுப கிரக அமைப்புகள் நிறைந்த நல்ஜாதகம்"}
          </p>
        </div>

        {/* Footer Brand */}
        <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#d4af37]/60 font-cinzel">
          <span>AI Jathagam Generator</span>
          <span>Thirukanitham</span>
        </div>
      </div>
    </div>
  );
};
