"use client";

// Rasi chart canvas used by every chart on the site (Kanitha — Thirukanitham /
// Vakkiyam, KP, 12 Porutham, single page, full jathagam) and therefore by the
// on-screen PDF export too. It draws the owner's sample chart (lib/chartArt):
// pale-yellow glowing houses, thick charcoal lines, a premium ornamental centre
// (ivory-gold glow, gold / maroon triple frame, lotus corners, faint lotus
// mandala), every planet in its own colour.
//
// No black lines: the grid lines, the chart name and the planet text take the
// colour / Tamil-style panel's accent, ink and typeface; the yellow houses and
// the framed centre stay the same. The canvas is always square and painted at
// 2× resolution so it stays sharp in the PDF. Geometry for Tamil / Kerala (fixed signs) and North Indian (fixed
// houses) comes from lib/chartLayouts.ts.
import React, { useEffect, useRef } from "react";
import { KattamPlanet } from "@/lib/astrology/types";
import {
  SOUTH_INDIAN_BOX_ORDER,
  NORTH_INDIAN_HOUSES,
  signForNorthIndianHouse,
  findLagnaSignNum,
  ChartStyle,
} from "@/lib/astrology/chartLayouts";
import { drawCentre, drawLagnaMark, fillGlow } from "@/lib/astrology/chartArt";
import { useJathagamTheme } from "@/lib/astrology/jathagamTheme";

/** What a chart takes from the colour / Tamil-style panel: lines, text, accent, typeface. */
interface Look { line: string; text: string; accent: string; font: string }

interface HandwrittenChartCanvasProps {
  title: string;
  titleTa: string;
  kattamData: Record<number, KattamPlanet[]>;
  chartStyle: ChartStyle;
  lang: "ta" | "en";
  width?: number;
  height?: number;
}

const SCALE = 2; // device pixels per CSS pixel — sharp on screen and in the PDF

function labelOf(p: KattamPlanet, lang: "ta" | "en"): string {
  if (lang === "ta") return p.symbol || p.name_ta || p.name;
  return p.symbol && /^[A-Za-z]/.test(p.symbol) ? p.symbol : String(p.name ?? "").substring(0, 2);
}

function colourOf(p: KattamPlanet, look: Look): string {
  return p.is_lagna ? look.accent : look.text;
}

/** Largest font (px) ≤ `start` at which `text` fits in `maxW`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, start: number, maxW: number, font: string, min = 7): number {
  let fs = start;
  for (; fs > min; fs -= 0.5) {
    ctx.font = `700 ${fs}px ${font}`;
    if (ctx.measureText(text).width <= maxW) break;
  }
  return fs;
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
  // lines, chart name and planet text follow the panel; the yellow artwork stays
  const { palette, font } = useJathagamTheme();
  const look: Look = { line: palette.accent, text: palette.ink, accent: palette.accent, font: font.stack };

  useEffect(() => {
    let alive = true;
    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !alive) return;
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const name = lang === "ta" ? titleTa : title;
      if (chartStyle === "north_indian") drawNorthIndian(ctx, kattamData, lang, name, width, height, look);
      else drawSouthIndianOrKerala(ctx, kattamData, lang, name, width, height, look); // Tamil & Kerala share the fixed-sign grid
    };
    draw();
    // redraw once the chart face has loaded, so the first paint never uses a fallback font
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.load(`700 16px ${look.font}`).then(draw).catch(() => undefined);
    }
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kattamData, chartStyle, lang, title, titleTa, width, height, look.line, look.text, look.accent, look.font]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width * SCALE}
        height={height * SCALE}
        style={{ width, height }}
        className="max-w-full h-auto"
        role="img"
        aria-label={lang === "ta" ? titleTa : title}
      />
    </div>
  );
};

// ---------------------------------------------------------------------
// South Indian / Kerala — fixed-sign 4 × 4 grid with a 2 × 2 centre
// ---------------------------------------------------------------------
function drawSouthIndianOrKerala(
  ctx: CanvasRenderingContext2D,
  kattamData: Record<number, KattamPlanet[]>,
  lang: "ta" | "en",
  name: string,
  width: number,
  height: number,
  look: Look,
) {
  const pad = 6;
  const size = Math.min(width, height) - pad * 2;
  const x0 = (width - size) / 2;
  const y0 = (height - size) / 2;
  const cell = size / 4;
  const lagnaSign = findLagnaSignNum(kattamData);

  // houses: soft yellow glow
  SOUTH_INDIAN_BOX_ORDER.forEach((c) => fillGlow(ctx, x0 + c.col * cell, y0 + c.row * cell, cell, cell));
  // centre box: premium ornament (ivory-gold glow, triple frame, lotus corners, mandala)
  drawCentre(ctx, x0 + cell, y0 + cell, cell * 2, cell * 2);

  // grid lines (the centre is one box — no lines through it)
  ctx.strokeStyle = look.line;
  ctx.lineWidth = Math.max(1.2, size * 0.0042);
  SOUTH_INDIAN_BOX_ORDER.forEach((c) => ctx.strokeRect(x0 + c.col * cell, y0 + c.row * cell, cell, cell));
  ctx.strokeRect(x0 + cell, y0 + cell, cell * 2, cell * 2);
  ctx.strokeStyle = look.line;
  ctx.lineWidth = Math.max(2, size * 0.0085);
  ctx.strokeRect(x0, y0, size, size);

  // centre title
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tfs = fitFont(ctx, name, cell * 0.21, cell * 1.25, look.font, 9);
  ctx.font = `700 ${tfs}px ${look.font}`;
  // soft white halo keeps the name crisp over the mandala
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(2, tfs * 0.28);
  ctx.lineJoin = "round";
  ctx.strokeText(name, x0 + cell * 2, y0 + cell * 2);
  ctx.restore();
  ctx.fillStyle = look.accent;
  ctx.fillText(name, x0 + cell * 2, y0 + cell * 2);

  // planets: centred in their house, one per line, each in its own colour
  SOUTH_INDIAN_BOX_ORDER.forEach((c) => {
    const bx = x0 + c.col * cell;
    const by = y0 + c.row * cell;
    const planets = kattamData[c.signNum] || [];
    if (c.signNum === lagnaSign && planets.some((p) => p.is_lagna)) drawLagnaMark(ctx, bx + 2, by + 2, cell * 0.3, look.accent);
    if (!planets.length) return;
    const n = planets.length;
    const base = cell * (n <= 3 ? 0.165 : n <= 5 ? 0.135 : 0.112);
    const labels = planets.map((p) => `${labelOf(p, lang)}${p.is_retrograde ? (lang === "ta" ? "(வ)" : "(R)") : ""}`);
    const fs = Math.min(...labels.map((l) => fitFont(ctx, l, base, cell * 0.9, look.font)));
    const lh = fs * 1.18;
    let y = by + cell / 2 - (lh * (n - 1)) / 2;
    planets.forEach((p, i) => {
      ctx.font = `700 ${fs}px ${look.font}`;
      ctx.fillStyle = colourOf(p, look);
      ctx.fillText(labels[i], bx + cell / 2, y);
      y += lh;
    });
  });
}

// ---------------------------------------------------------------------
// North Indian — fixed-house diamond grid, house 1 (Lagna) at the top.
// ---------------------------------------------------------------------
function drawNorthIndian(
  ctx: CanvasRenderingContext2D,
  kattamData: Record<number, KattamPlanet[]>,
  lang: "ta" | "en",
  name: string,
  width: number,
  height: number,
  look: Look,
) {
  const pad = 6;
  const titleH = 20;
  const size = Math.min(width, height - titleH) - pad * 2;
  const originX = (width - size) / 2;
  const originY = pad + titleH;
  const S = (v: number) => (v * size) / 400;
  const lagnaSignNum = findLagnaSignNum(kattamData);

  // title above the chart
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.min(15, fitFont(ctx, name, 15, size, look.font))}px ${look.font}`;
  ctx.fillStyle = look.accent;
  ctx.fillText(name, width / 2, pad + titleH / 2 - 2);

  // houses: glow fill per polygon, then charcoal lines
  NORTH_INDIAN_HOUSES.forEach((h) => {
    const pts = h.points.split(" ").map((q) => q.split(",").map(Number)).map(([x, y]) => [originX + S(x), originY + S(y)]);
    ctx.save();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    fillGlow(ctx, minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY);
    ctx.restore();
  });
  ctx.strokeStyle = look.line;
  ctx.lineWidth = Math.max(1.2, size * 0.0042);
  ctx.lineJoin = "round";
  NORTH_INDIAN_HOUSES.forEach((h) => {
    const pts = h.points.split(" ").map((q) => q.split(",").map(Number));
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(originX + S(x), originY + S(y)) : ctx.moveTo(originX + S(x), originY + S(y))));
    ctx.closePath();
    ctx.stroke();
  });
  ctx.strokeStyle = look.line;
  ctx.lineWidth = Math.max(2, size * 0.0085);
  ctx.strokeRect(originX, originY, size, size);

  NORTH_INDIAN_HOUSES.forEach((h) => {
    const signNum = signForNorthIndianHouse(lagnaSignNum, h.house);
    const planets = kattamData[signNum] || [];
    const labelX = originX + S(h.labelX);
    const labelY = originY + S(h.labelY);
    // short rows centred on the house's label point, smaller text when crowded
    const wide = [1, 4, 7, 10].includes(h.house);
    const n = planets.length;
    const perRow = wide ? 3 : 2;
    const rows = Math.max(1, Math.ceil(n / perRow));
    const fs = S(n <= 2 ? 15 : n <= 4 ? 13 : 11.5);
    const lineH = fs * 1.2;
    const colW = S(wide ? 34 : 27);
    const blockTop = labelY - (rows * lineH) / 2 + S(7);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `600 ${Math.max(8, S(10))}px ${look.font}`;
    ctx.fillStyle = look.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText(String(signNum), labelX, blockTop - S(13));
    ctx.globalAlpha = 1;

    planets.forEach((p, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, n - row * perRow);
      const col = i % perRow;
      const label = `${labelOf(p, lang)}${p.is_retrograde ? (lang === "ta" ? "(வ)" : "(R)") : ""}`;
      ctx.font = `700 ${Math.max(8, fitFont(ctx, label, fs, colW, look.font))}px ${look.font}`;
      ctx.fillStyle = colourOf(p, look);
      ctx.fillText(label, labelX + (col - (inRow - 1) / 2) * colW, blockTop + row * lineH);
    });
  });
}

export default HandwrittenChartCanvas;
