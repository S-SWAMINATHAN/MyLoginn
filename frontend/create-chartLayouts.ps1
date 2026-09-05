# Run this from D:\Main project\Tamil-Jathagam\frontend
# It creates lib\chartLayouts.ts directly, with correct UTF-8 encoding
# (avoids Tamil-character corruption from manual copy/paste).

New-Item -ItemType Directory -Force -Path ".\lib" | Out-Null

$content = @'
// frontend/lib/chartLayouts.ts
//
// Chart-style RENDERING layer (Tamil / South Indian, Kerala, North Indian).
// AGENTS.md §1: this module never alters which planet is in which
// sign/house — it only changes how that same data is laid out visually.
// Mirrors the geometry already defined server-side in
// backend/app/services/chart_style.py so both layers agree.
//
// Cited sources for the layout conventions themselves (chart-drawing
// rules, not astrological facts):
// - Kerala uses the SAME fixed-sign South Indian box grid as Tamil Nadu,
//   not a different box order -- "Kerala and Tamil Nadu astrologers use
//   the South Indian chart format, a fixed-sign grid in which every box
//   always represents the same rashi" (Paramarsh, "Kerala vs North
//   Indian Jyotish"; GoodStars Jyotish, "How to Read Vedic Astrology
//   Charts"). The Kerala/Tamil visual distinction is therefore in
//   colour & calligraphy, not grid geometry -- matches
//   jathagam-architecture.md §3.7 (Kerala gets its own Kathakali-inspired
//   palette) and §8 ("authentic Kerala visual style" on the standard
//   fixed-sign layout, calculation-wise treated as standard Vedic).
// - North Indian chart: houses are fixed, signs rotate, Lagna is always
//   in the top diamond, houses numbered clockwise 1→12 (matches
//   backend/app/services/chart_style.py's north_indian branch, and the
//   standard "diagonals + inner diamond" construction used in every
//   North Indian Kundli template).

import { KattamPlanet } from "./types";

export type ChartStyle = "tamil" | "kerala" | "north_indian";

// ---------------------------------------------------------------------
// Tamil / South Indian / Kerala — fixed-sign box grid
// ---------------------------------------------------------------------
export interface SouthIndianBox {
  signNum: number;
  row: number; // 0-indexed
  col: number; // 0-indexed
  name: string;
  nameTa: string;
}

export const SOUTH_INDIAN_BOX_ORDER: SouthIndianBox[] = [
  { signNum: 12, row: 0, col: 0, name: "Meena", nameTa: "மீனம்" },
  { signNum: 1, row: 0, col: 1, name: "Mesha", nameTa: "மேஷம்" },
  { signNum: 2, row: 0, col: 2, name: "Vrishabha", nameTa: "ரிஷபம்" },
  { signNum: 3, row: 0, col: 3, name: "Mithuna", nameTa: "மிதுனம்" },
  { signNum: 4, row: 1, col: 3, name: "Karkataka", nameTa: "கடகம்" },
  { signNum: 5, row: 2, col: 3, name: "Simha", nameTa: "சிம்மம்" },
  { signNum: 6, row: 3, col: 3, name: "Kanya", nameTa: "கன்னி" },
  { signNum: 7, row: 3, col: 2, name: "Tula", nameTa: "துலாம்" },
  { signNum: 8, row: 3, col: 1, name: "Vrischika", nameTa: "விருச்சிகம்" },
  { signNum: 9, row: 3, col: 0, name: "Dhanus", nameTa: "தனுசு" },
  { signNum: 10, row: 2, col: 0, name: "Makara", nameTa: "மகரம்" },
  { signNum: 11, row: 1, col: 0, name: "Kumbha", nameTa: "கும்பம்" },
];

// ---------------------------------------------------------------------
// North Indian — fixed-house diamond grid
// ---------------------------------------------------------------------
// Classic construction: outer square + both diagonals + inner diamond
// connecting the four side-midpoints. Yields 4 kite-shaped "kendra"
// houses at the diamond points (1, 4, 7, 10) and 8 triangular houses
// filling the four corners (2/3, 5/6, 8/9, 11/12), read clockwise from
// the top, House 1 (Lagna) always at the top point. All coordinates are
// in a fixed 0-400 x 0-400 box.
export interface NorthIndianHouse {
  house: number; // 1-12
  points: string; // SVG polygon "x,y x,y ..." string
  labelX: number;
  labelY: number;
}

function pt(x: number, y: number) {
  return `${x},${y}`;
}

const T = { x: 200, y: 0 };
const R = { x: 400, y: 200 };
const B = { x: 200, y: 400 };
const L = { x: 0, y: 200 };
const TL = { x: 0, y: 0 };
const TR = { x: 400, y: 0 };
const BR = { x: 400, y: 400 };
const BL = { x: 0, y: 400 };
const C = { x: 200, y: 200 };
const M_TR = { x: 300, y: 100 }; // midpoint T-R, lies on diagonal TR-BL
const M_RB = { x: 300, y: 300 }; // midpoint R-B, lies on diagonal TL-BR
const M_BL = { x: 100, y: 300 }; // midpoint B-L, lies on diagonal TR-BL
const M_LT = { x: 100, y: 100 }; // midpoint L-T, lies on diagonal TL-BR

const poly = (...p: { x: number; y: number }[]) => p.map((q) => pt(q.x, q.y)).join(" ");

export const NORTH_INDIAN_HOUSES: NorthIndianHouse[] = [
  { house: 1, points: poly(T, M_TR, C, M_LT), labelX: 200, labelY: 78 },
  { house: 2, points: poly(T, TR, M_TR), labelX: 280, labelY: 40 },
  { house: 3, points: poly(TR, R, M_TR), labelX: 340, labelY: 100 },
  { house: 4, points: poly(R, M_RB, C, M_TR), labelX: 322, labelY: 200 },
  { house: 5, points: poly(R, BR, M_RB), labelX: 340, labelY: 300 },
  { house: 6, points: poly(BR, B, M_RB), labelX: 280, labelY: 360 },
  { house: 7, points: poly(B, M_BL, C, M_RB), labelX: 200, labelY: 322 },
  { house: 8, points: poly(B, BL, M_BL), labelX: 120, labelY: 360 },
  { house: 9, points: poly(BL, L, M_BL), labelX: 60, labelY: 300 },
  { house: 10, points: poly(L, M_LT, C, M_BL), labelX: 78, labelY: 200 },
  { house: 11, points: poly(L, TL, M_LT), labelX: 60, labelY: 100 },
  { house: 12, points: poly(TL, T, M_LT), labelX: 120, labelY: 40 },
];

/** Sign occupying a given North-Indian house, given the Lagna's sign number.
 *  Mirrors backend/app/services/chart_style.py's north_indian branch exactly. */
export function signForNorthIndianHouse(lagnaSignNum: number, house: number): number {
  return ((lagnaSignNum - 1 + (house - 1)) % 12) + 1;
}

/** Finds the sign number the Lagna (is_lagna kattam entry) currently sits in. */
export function findLagnaSignNum(kattamData: Record<number, KattamPlanet[]>): number {
  for (const key of Object.keys(kattamData)) {
    const signNum = Number(key);
    if ((kattamData[signNum] || []).some((p) => p.is_lagna)) return signNum;
  }
  return 1;
}

// ---------------------------------------------------------------------
// Colour theme per regional style (jathagam-architecture.md §3.7)
// ---------------------------------------------------------------------
export interface ChartStyleTheme {
  ink: string;
  inkSoft: string;
  accent: string;
  paper: string;
  cellBg: string;
  cellBorder: string;
  lagnaBg: string;
  lagnaBorder: string;
}

export const CHART_STYLE_THEMES: Record<ChartStyle, ChartStyleTheme> = {
  tamil: {
    // Temple-gopuram tones — maroon, mustard-gold, deep green
    ink: "#542410",
    inkSoft: "#aa820a",
    accent: "#8c2a38",
    paper: "#f6ebd6",
    cellBg: "rgba(37,24,28,0.7)",
    cellBorder: "rgba(212,175,55,0.2)",
    lagnaBg: "rgba(107,20,38,0.3)",
    lagnaBorder: "rgba(255,215,0,0.6)",
  },
  kerala: {
    // Kathakali-inspired — emerald green, gold, deep red
    ink: "#1f4d3a",
    inkSoft: "#c99a1e",
    accent: "#7a1220",
    paper: "#f2ecd9",
    cellBg: "rgba(15,36,28,0.7)",
    cellBorder: "rgba(201,154,30,0.25)",
    lagnaBg: "rgba(122,18,32,0.3)",
    lagnaBorder: "rgba(201,154,30,0.7)",
  },
  north_indian: {
    // Saffron, deep red, royal blue, gold mandala borders
    ink: "#7a1f10",
    inkSoft: "#c9962e",
    accent: "#1c2f6b",
    paper: "#f7e9d0",
    cellBg: "rgba(28,26,54,0.7)",
    cellBorder: "rgba(201,150,46,0.25)",
    lagnaBg: "rgba(28,47,107,0.35)",
    lagnaBorder: "rgba(255,183,77,0.7)",
  },
};
'@

$fullPath = (Join-Path (Get-Location) "lib\chartLayouts.ts")
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)

if (Test-Path ".\lib\chartLayouts.ts") {
    Write-Host "Created lib\chartLayouts.ts successfully." -ForegroundColor Green
    Write-Host "Line count:" (Get-Content ".\lib\chartLayouts.ts").Count
} else {
    Write-Host "Something went wrong -- file was not created." -ForegroundColor Red
}
