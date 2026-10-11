"use client";

import React, { useRef } from "react";
import { ChartResponse } from "@/lib/astrology/types";
import { Share2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { requireUnlock } from "@/lib/astrology/paywall";

interface ShareCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

export const ShareCard: React.FC<ShareCardProps> = ({ chart, lang }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (!cardRef.current || !requireUnlock()) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#f0e5cc",
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
    <div className="hand-card p-6 shadow-sm flex flex-col items-center text-[var(--ink)]">
      <div className="flex items-center justify-between w-full mb-4 pb-2 border-b border-[rgba(43,33,23,0.2)]">
        <h4 className="text-sm font-bold text-[var(--ink)] font-cinzel flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[var(--red)]" />
          {lang === "ta" ? "பகிரக்கூடிய ஜாதக அட்டை (Share Card)" : "Shareable Social Card"}
        </h4>
        <button
          onClick={handleDownload}
          className="btn-hand px-3 py-1 text-xs font-bold text-[var(--red-deep)] flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === "ta" ? "பதிவிறக்கு" : "Download PNG"}</span>
        </button>
      </div>

      {/* Actual Renderable Share Card */}
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-2xl bg-[#f0e5cc] border-2 border-[var(--red)] p-5 shadow-md relative overflow-hidden text-[var(--ink)]"
        style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
      >
        <div className="absolute top-2 right-3 text-3xl text-[rgba(176,55,38,0.15)] font-serif">ஸ்ரீ</div>

        {/* Header */}
        <div className="text-center border-b border-[rgba(43,33,23,0.2)] pb-3">
          <span className="text-xl text-[var(--red)] font-bold block">ஸ்ரீ ராமஜெயம்</span>
          <h3 className="text-xl font-normal text-[var(--ink)] font-tamil tracking-wide mt-1">
            {chart.name}
          </h3>
          <span className="text-xs text-[var(--ink-soft)] font-caveat text-sm">
            {chart.date_of_birth} · {chart.time_of_birth}
          </span>
          <span className="text-xs text-[var(--ink-soft)] block font-tamil mt-0.5">
            {chart.place}
          </span>
        </div>

        {/* Core Astrological Badges */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs font-tamil">
          <div className="bg-[rgba(120,96,58,0.06)] border border-[rgba(43,33,23,0.2)] rounded-xl p-2.5 text-center">
            <span className="text-[11px] text-[var(--ink-soft)] block">லக்னம் (Lagna)</span>
            <span className="font-bold text-[var(--ink)] text-sm">{chart.basic_details.lagnam_ta}</span>
          </div>

          <div className="bg-[rgba(120,96,58,0.06)] border border-[rgba(43,33,23,0.2)] rounded-xl p-2.5 text-center">
            <span className="text-[11px] text-[var(--ink-soft)] block">ராசி (Rasi)</span>
            <span className="font-bold text-[var(--ink)] text-sm">{chart.basic_details.rasi_ta}</span>
          </div>

          <div className="bg-[rgba(120,96,58,0.06)] border border-[rgba(43,33,23,0.2)] rounded-xl p-2.5 text-center col-span-2">
            <span className="text-[11px] text-[var(--ink-soft)] block">நட்சத்திரம் & பாதம்</span>
            <span className="font-bold text-[var(--red-deep)] text-sm">
              {chart.basic_details.nakshatram_ta} (பாதம் {chart.basic_details.pada})
            </span>
          </div>
        </div>

        {/* Highlight Quote */}
        <div className="bg-[rgba(176,55,38,0.08)] border border-[var(--red)] rounded-xl p-2.5 text-center">
          <p className="text-xs text-[var(--red-deep)] font-tamil italic leading-snug">
            {chart.yogas && chart.yogas.filter((y) => y.present).length > 0
              ? `விசேஷ யோகம்: ${chart.yogas.filter((y) => y.present)[0].name_ta}`
              : "சுப கிரக அமைப்புகள் நிறைந்த நல்ஜாதகம்"}
          </p>
        </div>

        {/* Footer Brand */}
        <div className="mt-4 pt-2 border-t border-[rgba(43,33,23,0.15)] flex items-center justify-between text-[11px] text-[var(--ink-soft)] font-caveat">
          <span>AI Jathagam · Handwritten</span>
          <span>Thirukanitham</span>
        </div>
      </div>
    </div>
  );
};
