/**
 * Rasi-chart artwork shared by every chart on the site (canvas charts, the
 * numeric Ashtakavarga grids and the KP grid) — the owner's sample chart:
 * pale-yellow houses with a soft radial glow, thick charcoal lines, and every
 * planet in its own fixed colour. Since 4.29.0 the centre box is a premium
 * ornamental panel (ivory-gold glow, gold / maroon triple frame with side
 * gems, lotus corner flourishes and a faint lotus mandala behind the name).
 *
 * These colours and the chart face are FIXED on purpose: the colour /
 * Tamil-style panel restyles the page around a chart, never the chart, so the
 * chart looks (and aligns) the same in every palette and typeface. The printed
 * PDFs use the same values (backend/app/services/pdf/chart_art.py).
 */

import type { CSSProperties } from "react";

export const CHART = {
  line: "#262626",
  frame: "#141414",
  cellIn: "#FFFFF4",
  cellMid: "#FFFAD6",
  cellOut: "#F4E98F",
  centreIn: "#FFFFFF",
  centreMid: "#FFFCF0",
  centreOut: "#F3DE9C",
  key: "#7A231C",
  gold: "#B8860B",
  goldSoft: "#EFD58A",
  title: "#1C3FD8",
  other: "#1B2140",
  signNo: "#6B6B6B",
  /** The chart's own face — always loaded by globals.css, never the panel typeface. */
  font: "'Noto Sans Tamil', 'Inter', sans-serif",
} as const;

export const PLANET_INK: Record<string, string> = {
  Lagna: "#E8590C", Sun: "#C92A2A", Moon: "#2B8A3E", Mars: "#E03131", Mercury: "#0B7285",
  Jupiter: "#AD6800", Venus: "#C2255C", Saturn: "#1C3FD8", Rahu: "#5F3DC4", Ketu: "#087F5B",
  Mandi: "#E67700", Uranus: "#495057", Neptune: "#495057", Fortuna: "#495057",
};

const ALIASES: Record<string, string[]> = {
  Lagna: ["லக்", "லக்னம்", "ல", "Asc", "As", "Lagna", "Lg"],
  Sun: ["சூரி", "சூரியன்", "சூ", "Su", "Sun"], Moon: ["சந்", "சந்திரன்", "Mo", "Moon"],
  Mars: ["செவ்", "செவ்வாய்", "செ", "Ma", "Mars"], Mercury: ["புத", "புதன்", "பு", "Me", "Mercury"],
  Jupiter: ["குரு", "கு", "Ju", "Jupiter"], Venus: ["சுக்", "சுக்கிரன்", "சு", "Ve", "Venus"],
  Saturn: ["சனி", "Sa", "Saturn"], Rahu: ["ராகு", "ரா", "Ra", "Rahu"], Ketu: ["கேது", "கே", "Ke", "Ketu"],
  Mandi: ["மாந்", "மாந்தி", "மா", "Md", "Mandi"], Uranus: ["யுரே", "Ur", "Uranus"],
  Neptune: ["நெப்", "Ne", "Neptune"], Fortuna: ["அ.பா", "அ. பா", "Fo", "Fortuna"],
};
const LABEL_PLANET: Record<string, string> = Object.fromEntries(
  Object.entries(ALIASES).flatMap(([p, xs]) => xs.map((a) => [a, p])),
);

/** "சனி (வ)" / "Saturn" / "Sa 12°" → "Saturn"; numbers and cusp labels → undefined. */
export function planetOf(label: string): string | undefined {
  const s = String(label ?? "").replace("(வ)", "").replace("(R)", "").trim();
  return LABEL_PLANET[s] ?? LABEL_PLANET[s.split(" ")[0]];
}

export function inkOf(label: string): string {
  const p = planetOf(label);
  return (p && PLANET_INK[p]) || CHART.other;
}

/** House background (CSS) — the soft yellow glow. */
export const CELL_BG = `radial-gradient(ellipse farthest-corner at center, ${CHART.cellIn} 0%, #FFFDE6 18%, ${CHART.cellMid} 40%, #F9F0B4 72%, ${CHART.cellOut} 100%)`;

/* ------------------------------------------------------------------ */
/* Centre box — premium ornamental design (4.29.0)                     */
/* ------------------------------------------------------------------ */
//
// Ivory-to-gold glow; a gold / maroon / gold triple frame with a small gem on
// the middle of each side; lotus-leaf corner flourishes (gem, two leaves along
// the frame, one petal pointing in); a faint 16 + 8 petal lotus mandala behind
// the chart name. The same geometry is drawn on canvas (Path2D), as layered CSS
// backgrounds (DOM charts) and in the printed PDFs
// (backend/app/services/pdf/chart_art.py builds the identical paths).

type Shape = { d: string; fill?: string; fo?: number; stroke?: string; so?: number; w?: number; evenodd?: boolean };

const GOLD = CHART.gold;
const GOLD_SOFT = CHART.goldSoft;
const MAROON = CHART.key;

const n2 = (v: number) => String(Number(v.toFixed(2)));
const circle = (cx: number, cy: number, r: number) =>
  `M${n2(cx - r)} ${n2(cy)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(2 * r)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-2 * r)} 0Z`;
const rect = (a: number, b: number) => `M${n2(a)} ${n2(a)}H${n2(b)}V${n2(b)}H${n2(a)}Z`;
const gem = (cx: number, cy: number, r: number) =>
  `M${n2(cx)} ${n2(cy - r)}L${n2(cx + r)} ${n2(cy)}L${n2(cx)} ${n2(cy + r)}L${n2(cx - r)} ${n2(cy)}Z`;
const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
};
function petal(r0: number, r1: number, rc: number, at: number, half: number, ctrlOff: number): string {
  const [ax, ay] = polar(r0, at - half);
  const [c1x, c1y] = polar(rc, at - ctrlOff);
  const [tx, ty] = polar(r1, at);
  const [c2x, c2y] = polar(rc, at + ctrlOff);
  const [bx, by] = polar(r0, at + half);
  return `M${n2(ax)} ${n2(ay)}Q${n2(c1x)} ${n2(c1y)} ${n2(tx)} ${n2(ty)}Q${n2(c2x)} ${n2(c2y)} ${n2(bx)} ${n2(by)}Z`;
}

/** Frame, in a 100 × 100 box stretched to the centre box. */
export const CENTRE_FRAME: Shape[] = [
  // gilded band between the outer gold rule and the maroon rule
  { d: rect(4, 96) + rect(7.2, 92.8), fill: GOLD_SOFT, fo: 0.55, evenodd: true },
  { d: rect(4, 96), stroke: GOLD, w: 2.2 },
  { d: rect(7.2, 92.8), stroke: MAROON, w: 0.9 },
  { d: rect(9.6, 90.4), stroke: GOLD, w: 0.45 },
  ...([[50, 4], [96, 50], [50, 96], [4, 50]] as const).flatMap(([cx, cy]) => [
    { d: gem(cx, cy, 3.2), fill: GOLD_SOFT, stroke: MAROON, w: 0.55 },
    { d: circle(cx, cy, 0.9), fill: MAROON },
  ]),
];

/** One corner flourish, top-left orientation, in a 24 × 24 box (the frame corner is at 4.8, 4.8):
 *  a gem on the corner, two leaves along the frame and a three-petal lotus fan pointing in. */
export const CENTRE_CORNER: Shape[] = [
  { d: "M9 4.8Q15 1.4 21.5 4.8Q15 8.2 9 4.8Z", fill: GOLD_SOFT, stroke: GOLD, w: 0.5 },
  { d: "M4.8 9Q1.4 15 4.8 21.5Q8.2 15 4.8 9Z", fill: GOLD_SOFT, stroke: GOLD, w: 0.5 },
  { d: "M9.4 9.4Q13.19 13.17 17.62 11.91Q14.65 8.39 9.4 9.4Z", fill: GOLD_SOFT, stroke: GOLD, w: 0.45 },
  { d: "M9.4 9.4Q8.39 14.65 11.91 17.62Q13.17 13.19 9.4 9.4Z", fill: GOLD_SOFT, stroke: GOLD, w: 0.45 },
  { d: "M9.4 9.4Q11.21 16.3 17.32 17.32Q16.3 11.21 9.4 9.4Z", fill: GOLD_SOFT, stroke: MAROON, w: 0.5 },
  { d: "M10.25 10.25L16.05 16.05", stroke: MAROON, so: 0.7, w: 0.35 },
  { d: circle(9.4, 9.4, 1.1), fill: MAROON },
  { d: gem(4.8, 4.8, 4), fill: MAROON, stroke: GOLD, w: 0.6 },
  { d: circle(4.8, 4.8, 1.3), fill: GOLD_SOFT },
];

/** Lotus mandala, in a 100 × 100 box kept square and centred. Faint, so the chart name reads clearly. */
export const CENTRE_MANDALA: Shape[] = [
  { d: circle(50, 50, 33), stroke: GOLD, so: 0.5, w: 0.7 },
  { d: circle(50, 50, 30.6), stroke: MAROON, so: 0.3, w: 0.35 },
  ...Array.from({ length: 16 }, (_, k) => ({
    d: petal(15, 29.6, 25.5, k * 22.5 - 90, 11.25, 7.5), fill: GOLD_SOFT, fo: 0.18, stroke: GOLD, so: 0.5, w: 0.4,
  })),
  ...Array.from({ length: 8 }, (_, k) => ({
    d: petal(7.5, 16.5, 14, k * 45 - 67.5, 22.5, 14), fill: GOLD_SOFT, fo: 0.22, stroke: MAROON, so: 0.35, w: 0.35,
  })),
  { d: circle(50, 50, 7.5), fill: "#FFFFFF", fo: 0.6, stroke: GOLD, so: 0.55, w: 0.45 },
  { d: circle(50, 50, 1.8), fill: MAROON, fo: 0.35 },
];

const shapeSvg = (s: Shape) =>
  `<path d="${s.d}" fill="${s.fill ?? "none"}"${s.fo != null ? ` fill-opacity="${s.fo}"` : ""}${s.evenodd ? ` fill-rule="evenodd"` : ""}` +
  (s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.w ?? 1}"${s.so != null ? ` stroke-opacity="${s.so}"` : ""} stroke-linejoin="round" stroke-linecap="round"` : "") +
  `/>`;

function svgUri(shapes: Shape[], size: number, opts: { rotate?: number; stretch?: boolean } = {}): string {
  const body = shapes.map(shapeSvg).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"` +
    (opts.stretch ? ` preserveAspectRatio="none"` : "") + `>` +
    (opts.rotate ? `<g transform="rotate(${opts.rotate} ${size / 2} ${size / 2})">${body}</g>` : body) +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const CENTRE_BG = `radial-gradient(ellipse farthest-corner at center, ${CHART.centreIn} 0%, ${CHART.centreMid} 40%, #FBF1CF 75%, ${CHART.centreOut} 100%)`;

/** CSS background for the centre box of a DOM chart: corner flourishes on top,
 *  then the frame, the mandala and the glow. Corners are 20 % of the box, so
 *  they always sit on the frame corners at any size. */
export function centreBackground(): CSSProperties {
  return {
    backgroundImage: [
      svgUri(CENTRE_CORNER, 24), svgUri(CENTRE_CORNER, 24, { rotate: 90 }),
      svgUri(CENTRE_CORNER, 24, { rotate: 180 }), svgUri(CENTRE_CORNER, 24, { rotate: 270 }),
      svgUri(CENTRE_FRAME, 100, { stretch: true }), svgUri(CENTRE_MANDALA, 100), CENTRE_BG,
    ].join(", "),
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0 0, 100% 0, 100% 100%, 0 100%, 0 0, center, 0 0",
    backgroundSize: "20% auto, 20% auto, 20% auto, 20% auto, 100% 100%, contain, 100% 100%",
    // keeps the chart name crisp over the ornament
    textShadow: "0 0 3px #FFFFFF, 0 0 6px #FFFFFF",
  };
}

/* ------------------------------------------------------------------ */
/* Canvas helpers                                                      */
/* ------------------------------------------------------------------ */

export function fillGlow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, centre = false) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  if (centre) {
    g.addColorStop(0, CHART.centreIn); g.addColorStop(0.4, CHART.centreMid); g.addColorStop(0.75, "#FBF1CF"); g.addColorStop(1, CHART.centreOut);
  } else {
    g.addColorStop(0, CHART.cellIn); g.addColorStop(0.18, "#FFFDE6"); g.addColorStop(0.4, CHART.cellMid);
    g.addColorStop(0.72, "#F9F0B4"); g.addColorStop(1, CHART.cellOut);
  }
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/** Paints shapes defined in a `unit` × `unit` box into (x, y, w, h), optionally rotated about the box centre. */
function paintShapes(ctx: CanvasRenderingContext2D, shapes: Shape[], unit: number, x: number, y: number, w: number, h: number, rotate = 0) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (rotate) ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.scale(w / unit, h / unit);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const s of shapes) {
    const p = new Path2D(s.d);
    if (s.fill) {
      ctx.globalAlpha = s.fo ?? 1;
      ctx.fillStyle = s.fill;
      ctx.fill(p, s.evenodd ? "evenodd" : "nonzero");
    }
    if (s.stroke) {
      ctx.globalAlpha = s.so ?? 1;
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.w ?? 1;
      ctx.stroke(p);
    }
  }
  ctx.restore();
}

/** The centre box: glow, mandala, triple frame with side gems, lotus corner flourishes. */
export function drawCentre(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  fillGlow(ctx, x, y, w, h, true);
  const m = Math.min(w, h);
  paintShapes(ctx, CENTRE_MANDALA, 100, x + (w - m) / 2, y + (h - m) / 2, m, m);
  paintShapes(ctx, CENTRE_FRAME, 100, x, y, w, h);
  const k = w * 0.2;
  paintShapes(ctx, CENTRE_CORNER, 24, x, y, k, k, 0);
  paintShapes(ctx, CENTRE_CORNER, 24, x + w - k, y, k, k, 90);
  paintShapes(ctx, CENTRE_CORNER, 24, x + w - k, y + h - k, k, k, 180);
  paintShapes(ctx, CENTRE_CORNER, 24, x, y + h - k, k, k, 270);
}

/** The Lagna house's traditional double diagonal stroke across its top-left corner. */
export function drawLagnaMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colour: string = CHART.frame) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.2, size * 0.065);
  for (const f of [0.55, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * f);
    ctx.lineTo(x + size * f, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Lagna mark as CSS (DOM charts). */
export function lagnaMarkCss(sizePx: number, colour: string = CHART.frame): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">` +
    `<line x1="0" y1="11" x2="11" y2="0" stroke="${colour}" stroke-width="1.3"/>` +
    `<line x1="0" y1="15" x2="15" y2="0" stroke="${colour}" stroke-width="1.3"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") no-repeat 0 0 / ${sizePx}px ${sizePx}px`;
}
