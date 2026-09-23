"use client";

import React, { useEffect, useRef } from "react";
import rough from "roughjs";
import { KattamPlanet } from "@/lib/types";
import {
  SOUTH_INDIAN_BOX_ORDER,
  NORTH_INDIAN_HOUSES,
  signForNorthIndianHouse,
  findLagnaSignNum,
  CHART_STYLE_THEMES,
  ChartStyle,
  ChartStyleTheme,
} from "@/lib/chartLayouts";
import { useJathagamTheme } from "@/lib/jathagamTheme";

interface HandwrittenChartCanvasProps {
  title: string;
  titleTa: string;
  kattamData: Record<number, KattamPlanet[]>;
  // NEW: was previously not accepted/used at all, so every style rendered
  // as the same South Indian box grid regardless of selection.
  chartStyle: ChartStyle;
  lang: "ta" | "en";
  width?: number;
  height?: number;
}

export const HandwrittenChartCanvas: React.FC<HandwrittenChartCanvasProps> = ({
  title,
  titleTa,
  kattamData,
  chartStyle,
  lang,
  width = 460,
  height = 460,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jatTheme = useJathagamTheme();
  // The chosen Tamil face, minus its quotes, for canvas ctx.font strings.
  const fontStack = jatTheme.font.stack;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The chart is painted onto a <canvas>, so the theme stylesheet cannot
    // reach it the way it reaches the rest of the Jathagam. The regional style
    // (Tamil / Kerala / North Indian) still decides the GEOMETRY and remains
    // the base palette; the user's chosen ink simply overrides its ink/accent
    // so the charts match the pages around them — on screen and in the PDF.
    const base = CHART_STYLE_THEMES[chartStyle] || CHART_STYLE_THEMES.tamil;
    const theme: ChartStyleTheme = {
      ...base,
      ink: jatTheme.palette.ink,
      inkSoft: jatTheme.palette.gold,
      accent: jatTheme.palette.accent,
      paper: jatTheme.palette.paperCard,
    };

    ctx.clearRect(0, 0, width, height);
    const rc = rough.canvas(canvas);

    // 1. Plain white background (Bug 3: the tinted paper and the faint
    //    ruled lines drawn across the chart were removed).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const padding = 16;

    if (chartStyle === "north_indian") {
      drawNorthIndian(ctx, rc, kattamData, lang, theme, title, titleTa, width, height, padding, fontStack);
    } else {
      // "tamil" and "kerala" share the same fixed-sign box geometry
      // (see lib/chartLayouts.ts citation) — only the theme differs.
      drawSouthIndianOrKerala(ctx, rc, kattamData, lang, theme, title, titleTa, width, height, padding, fontStack);
    }
  }, [kattamData, chartStyle, lang, title, titleTa, width, height, jatTheme]);

  return (
    <div className="relative rounded-2xl overflow-hidden palm-leaf-texture p-4 flex flex-col items-center border border-[#d4af37]/40 shadow-2xl">
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
        {chartStyle === "north_indian"
          ? lang === "ta"
            ? "பாரம்பரிய வட இந்திய ஓலைச்சுவடி பாணி கட்டம் (Rough.js)"
            : "Traditional North Indian Manuscript Style"
          : chartStyle === "kerala"
          ? lang === "ta"
            ? "பாரம்பரிய கேரள ஓலைச்சுவடி பாணி கட்டம் (Rough.js)"
            : "Traditional Kerala Manuscript Style"
          : lang === "ta"
          ? "பாரம்பரிய ஓலைச்சுவடி பாணி கட்டம் (Rough.js)"
          : "Traditional Palm-Leaf Manuscript Style"}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// South Indian / Kerala — fixed-sign box grid (identical geometry,
// themed colour per style — see lib/chartLayouts.ts citation)
// ---------------------------------------------------------------------
function drawSouthIndianOrKerala(
  ctx: CanvasRenderingContext2D,
  rc: any,
  kattamData: Record<number, KattamPlanet[]>,
  lang: "ta" | "en",
  theme: ChartStyleTheme,
  title: string,
  titleTa: string,
  width: number,
  height: number,
  padding: number,
  fontStack: string
) {
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const cellW = chartW / 4;
  const cellH = chartH / 4;

  rc.rectangle(padding, padding, chartW, chartH, {
    stroke: theme.ink,
    strokeWidth: 2.5,
    roughness: 1.6,
    bowing: 1.2,
  });
  rc.rectangle(padding - 4, padding - 4, chartW + 8, chartH + 8, {
    stroke: theme.inkSoft,
    strokeWidth: 1.2,
    roughness: 1.0,
  });

  for (let c = 1; c <= 3; c++) {
    const x = padding + c * cellW;
    rc.line(x, padding, x, padding + chartH, { stroke: theme.ink, strokeWidth: 1.8, roughness: 1.4 });
  }
  for (let r = 1; r <= 3; r++) {
    const y = padding + r * cellH;
    rc.line(padding, y, padding + chartW, y, { stroke: theme.ink, strokeWidth: 1.8, roughness: 1.4 });
  }

  const centerX = padding + cellW;
  const centerY = padding + cellH;
  const centerW = cellW * 2;
  const centerH = cellH * 2;

  rc.rectangle(centerX + 6, centerY + 6, centerW - 12, centerH - 12, {
    fill: `${theme.accent}18`,
    fillStyle: "dots",
    stroke: theme.accent,
    strokeWidth: 1.5,
    roughness: 1.2,
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold 26px ${fontStack}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText("ௐ", centerX + centerW / 2, centerY + centerH / 2 - 28);

  ctx.font = `bold 17px ${fontStack}`;
  ctx.fillStyle = theme.ink;
  ctx.fillText(lang === "ta" ? titleTa : title, centerX + centerW / 2, centerY + centerH / 2 + 2);

  ctx.font = `bold 15px ${fontStack}`;
  ctx.fillStyle = theme.inkSoft;
  ctx.fillText("Vedic Birth Chart", centerX + centerW / 2, centerY + centerH / 2 + 24);

  SOUTH_INDIAN_BOX_ORDER.forEach((cell) => {
    const boxX = padding + cell.col * cellW;
    const boxY = padding + cell.row * cellH;

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = `12px ${fontStack}`;
    ctx.fillStyle = `${theme.ink}8c`;
    ctx.fillText(lang === "ta" ? cell.nameTa : cell.name, boxX + cellW - 5, boxY + 5);

    const planets = kattamData[cell.signNum] || [];
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let textY = boxY + 8;
    planets.forEach((p) => {
      const label = lang === "ta" ? p.symbol : p.name.substring(0, 2);
      const degStr = p.degree ? `${Math.floor(p.degree)}°` : "";

      if (p.is_lagna) {
        ctx.font = `bold 14px ${fontStack}`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(`★ ${label} ${degStr}`, boxX + 6, textY);
      } else {
        ctx.font = `bold 13px ${fontStack}`;
        ctx.fillStyle = theme.ink;
        const retroMark = p.is_retrograde ? "(வ)" : "";
        ctx.fillText(`${label} ${degStr}${retroMark}`, boxX + 6, textY);
      }
      textY += 16;
    });
  });
}

// ---------------------------------------------------------------------
// North Indian — fixed-house diamond grid.
// Geometry & citation: see lib/chartLayouts.ts.
// ---------------------------------------------------------------------
function drawNorthIndian(
  ctx: CanvasRenderingContext2D,
  rc: any,
  kattamData: Record<number, KattamPlanet[]>,
  lang: "ta" | "en",
  theme: ChartStyleTheme,
  title: string,
  titleTa: string,
  width: number,
  height: number,
  padding: number,
  fontStack: string
) {
  const size = Math.min(width, height) - padding * 2;
  const originX = (width - size) / 2;
  const originY = (height - size) / 2;
  const scale = size / 400;
  const S = (v: number) => v * scale;

  const scalePoints = (pointsStr: string): [number, number][] =>
    pointsStr.split(" ").map((p) => {
      const [x, y] = p.split(",").map(Number);
      return [originX + S(x), originY + S(y)] as [number, number];
    });

  rc.rectangle(originX, originY, size, size, {
    stroke: theme.inkSoft,
    strokeWidth: 2,
    roughness: 1.2,
  });

  const lagnaSignNum = findLagnaSignNum(kattamData);

  NORTH_INDIAN_HOUSES.forEach((h) => {
    const polyPoints = scalePoints(h.points);
    const isLagnaHouse = h.house === 1;

    rc.polygon(polyPoints, {
      stroke: theme.ink,
      strokeWidth: isLagnaHouse ? 2 : 1.4,
      roughness: 1.3,
      fill: isLagnaHouse ? `${theme.accent}22` : "transparent",
      fillStyle: "solid",
    });

    const signNum = signForNorthIndianHouse(lagnaSignNum, h.house);
    const planets = kattamData[signNum] || [];
    const labelX = originX + S(h.labelX);
    const labelY = originY + S(h.labelY);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `bold ${Math.max(11, S(13))}px ${fontStack}`;
    ctx.fillStyle = `${theme.ink}90`;
    ctx.fillText(String(signNum), labelX, labelY - S(20));

    let ty = labelY - S(4);
    planets.forEach((p) => {
      const label = lang === "ta" ? p.symbol : p.name.substring(0, 2);
      if (p.is_lagna) {
        ctx.font = `bold ${Math.max(12, S(14))}px ${fontStack}`;
        ctx.fillStyle = theme.accent;
        ctx.fillText(`★${label}`, labelX, ty);
      } else {
        ctx.font = `bold ${Math.max(11, S(13))}px ${fontStack}`;
        ctx.fillStyle = theme.ink;
        ctx.fillText(`${label}${p.is_retrograde ? "(வ)" : ""}`, labelX, ty);
      }
      ty += S(13);
    });
  });

  const cx = originX + S(200);
  const cy = originY + S(200);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.max(16, S(18))}px ${fontStack}`;
  ctx.fillStyle = theme.ink;
  ctx.fillText(lang === "ta" ? titleTa : title, cx, cy);
}