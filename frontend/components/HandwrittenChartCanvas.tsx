"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";
import { KattamPlanet } from "@/lib/types";

interface HandwrittenChartCanvasProps {
  title: string;
  titleTa: string;
  kattamData: Record<number, KattamPlanet[]>;
  lang: "ta" | "en";
  width?: number;
  height?: number;
}

// 12 South Indian box layout matrix (4x4 perimeter)
// Index: [row, col, signNumber, tamilName, engName]
const BOX_POSITIONS: Array<[number, number, number, string, string]> = [
  [0, 0, 12, "மீனம்", "Meena"],
  [0, 1, 1, "மேஷம்", "Mesha"],
  [0, 2, 2, "ரிஷபம்", "Vrishabha"],
  [0, 3, 3, "மிதுனம்", "Mithuna"],
  [1, 3, 4, "கடகம்", "Karka"],
  [2, 3, 5, "சிம்மம்", "Simha"],
  [3, 3, 6, "கன்னி", "Kanya"],
  [3, 2, 7, "துலாம்", "Tula"],
  [3, 1, 8, "விருச்சிகம்", "Vrischika"],
  [3, 0, 9, "தனுசு", "Dhanus"],
  [2, 0, 10, "மகரம்", "Makara"],
  [1, 0, 11, "கும்பம்", "Kumbha"],
];

export const HandwrittenChartCanvas: React.FC<HandwrittenChartCanvasProps> = ({
  title,
  titleTa,
  kattamData,
  lang,
  width = 460,
  height = 460,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, width, height);

    const rc = rough.canvas(canvas);

    // 1. Draw Organic Aged Paper Background
    ctx.fillStyle = "#f6ebd6";
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grain lines
    ctx.strokeStyle = "rgba(120, 75, 30, 0.08)";
    ctx.lineWidth = 1;
    for (let y = 10; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }

    const padding = 16;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const cellW = chartW / 4;
    const cellH = chartH / 4;

    // 2. Draw Outer Border with Rough.js (Hand-drawn Ink Stroke Effect)
    rc.rectangle(padding, padding, chartW, chartH, {
      stroke: "#542410",
      strokeWidth: 2.5,
      roughness: 1.6,
      bowing: 1.2,
    });

    // Outer gold double line
    rc.rectangle(padding - 4, padding - 4, chartW + 8, chartH + 8, {
      stroke: "#aa820a",
      strokeWidth: 1.2,
      roughness: 1.0,
    });

    // 3. Draw Inner Grid Lines
    // Vertical lines
    for (let c = 1; c <= 3; c++) {
      const x = padding + c * cellW;
      rc.line(x, padding, x, padding + chartH, {
        stroke: "#542410",
        strokeWidth: 1.8,
        roughness: 1.4,
      });
    }

    // Horizontal lines
    for (let r = 1; r <= 3; r++) {
      const y = padding + r * cellH;
      rc.line(padding, y, padding + chartW, y, {
        stroke: "#542410",
        strokeWidth: 1.8,
        roughness: 1.4,
      });
    }

    // 4. Center Area (Draw decorative temple floral / title box)
    const centerX = padding + cellW;
    const centerY = padding + cellH;
    const centerW = cellW * 2;
    const centerH = cellH * 2;

    rc.rectangle(centerX + 6, centerY + 6, centerW - 12, centerH - 12, {
      fill: "rgba(107, 20, 38, 0.06)",
      fillStyle: "dots",
      stroke: "#8c2a38",
      strokeWidth: 1.5,
      roughness: 1.2,
    });

    // Draw Title in Center Box
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Sacred Om symbol
    ctx.font = "bold 24px 'Noto Sans Tamil', serif";
    ctx.fillStyle = "#8c2a38";
    ctx.fillText("ௐ", centerX + centerW / 2, centerY + centerH / 2 - 28);

    // Chart Name
    ctx.font = "bold 16px 'Kavivanar', 'Noto Sans Tamil', cursive";
    ctx.fillStyle = "#450a16";
    ctx.fillText(lang === "ta" ? titleTa : title, centerX + centerW / 2, centerY + centerH / 2 + 2);

    ctx.font = "12px 'Cinzel', serif";
    ctx.fillStyle = "#aa820a";
    ctx.fillText("Vedic Birth Chart", centerX + centerW / 2, centerY + centerH / 2 + 24);

    // 5. Populate Planets into the 12 Boxes with Traditional Calligraphy
    BOX_POSITIONS.forEach(([row, col, signNum, taName, engName]) => {
      const boxX = padding + col * cellW;
      const boxY = padding + row * cellH;

      // Draw Sign Name watermark in top-right of cell
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.font = "10px 'Noto Sans Tamil', sans-serif";
      ctx.fillStyle = "rgba(100, 60, 25, 0.55)";
      ctx.fillText(lang === "ta" ? taName : engName, boxX + cellW - 5, boxY + 5);

      // Get Planets in this sign
      const planets = kattamData[signNum] || [];

      // Render Planets list
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      let textY = boxY + 8;
      planets.forEach((p) => {
        const isLagna = p.is_lagna;
        const isRetro = p.is_retrograde;

        // Label format (e.g. லக் 14° or சூ 28°)
        const label = lang === "ta" ? p.symbol : p.name.substring(0, 2);
        const degStr = p.degree ? `${Math.floor(p.degree)}°` : "";

        if (isLagna) {
          // Highlight Lagna in Deep Maroon
          ctx.font = "bold 13px 'Kavivanar', 'Noto Sans Tamil', cursive";
          ctx.fillStyle = "#8c2a38";
          ctx.fillText(`★ ${label} ${degStr}`, boxX + 6, textY);
        } else {
          ctx.font = "bold 12px 'Kavivanar', 'Noto Sans Tamil', cursive";
          ctx.fillStyle = "#1e140d";
          const retroMark = isRetro ? "(வ)" : "";
          ctx.fillText(`${label} ${degStr}${retroMark}`, boxX + 6, textY);
        }

        textY += 16;
      });
    });
  }, [kattamData, lang, title, titleTa, width, height]);

  return (
    <div className="relative rounded-2xl overflow-hidden palm-leaf-texture p-4 flex flex-col items-center border border-[#d4af37]/40 shadow-2xl">
      {/* Decorative corner motifs */}
      <div className="absolute top-2 left-2 text-xs text-[#aa820a] font-serif font-bold">⚜</div>
      <div className="absolute top-2 right-2 text-xs text-[#aa820a] font-serif font-bold">⚜</div>
      <div className="absolute bottom-2 left-2 text-xs text-[#aa820a] font-serif font-bold">⚜</div>
      <div className="absolute bottom-2 right-2 text-xs text-[#aa820a] font-serif font-bold">⚜</div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full h-auto rounded-xl"
      />
      <div className="mt-2 text-center text-xs text-[#6e4620] font-script">
        {lang === "ta" ? "பாரம்பரிய ஓலைச்சுவடி பாணி கட்டம் (Rough.js)" : "Traditional Palm-Leaf Manuscript Style"}
      </div>
    </div>
  );
};
