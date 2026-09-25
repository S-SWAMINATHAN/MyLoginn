"use client";

/* ===========================================================================
 * frontend/lib/jathagamTheme.tsx
 *
 * ONE global ink-colour + Tamil-typeface theme for the whole Jathagam.
 *
 * WHY THIS EXISTS
 * ---------------
 * There were already two customiser panels — one inside
 * ThirukanithamCompleteCard and one inside VakhyamCompleteCard — but each only
 * restyled its own card, which is exactly the "it changes some contents and
 * still shows the rest in the old style" problem. Neither touched the 50-page
 * manuscript, the charts, or the PDF.
 *
 * HOW IT WORKS (and why it reaches every chapter without editing them)
 * --------------------------------------------------------------------
 * The 14 manuscript chapters hard-code their palette as Tailwind arbitrary
 * values in `className` — `text-[#8e2b1c]`, `border-[#aa820a]/40`,
 * `bg-[#fffaf0]` and so on. There are 787 such occurrences and exactly ZERO
 * inline hex styles, which means one CSS attribute-selector rule per
 * hex × prefix reaches all of them:
 *
 *     #jathagam-theme-scope [class*="text-[#8e2b1c]"] { color: … !important }
 *
 * The `[class*=…]` match also catches every opacity variant
 * (`text-[#8e2b1c]/90`) for free, and `!important` in a stylesheet outranks a
 * plain inline style, so components that do set colours inline are covered too.
 *
 * Because the PDF exporter rasterises the very same themed DOM, whatever is on
 * screen is what lands in the PDF — there is no second styling path to keep in
 * sync. Canvas-drawn charts can't be reached by CSS, so HandwrittenChartCanvas
 * reads this theme through the React context instead.
 *
 * AGENTS.md §1: colours and typefaces are presentation. Nothing here changes a
 * planet, a sign, a house, a date or any computed number.
 * ========================================================================= */

import React, { createContext, useContext, useMemo, useState } from "react";

export const THEME_SCOPE_ID = "jathagam-theme-scope";
/** Class form of the scope — put it on every handwritten "document island". */
export const THEME_SCOPE_CLASS = "jathagam-theme-scope";
/** Mark website-style controls inside an island so the handwriting font and
 *  ink remap leave them alone (they use the site's normal UI styles). */
export const CHROME_CLASS = "jat-chrome";

/* ------------------------------- palettes ------------------------------- */

export interface JathagamPalette {
  id: string;
  labelTa: string;
  labelEn: string;
  /** Body text ink. */
  ink: string;
  /** Secondary / caption ink. */
  inkSoft: string;
  /** Section headings, the dominant "pen" colour. */
  accent: string;
  /** Darker accent used for emphasis and chapter titles. */
  accentDeep: string;
  /** Brighter accent used for icons and highlights. */
  accentSoft: string;
  /** Rules, borders and ornaments (the "gold" of the palm-leaf look). */
  gold: string;
  /** Darker border / frame colour. */
  goldDeep: string;
  /** Page background. */
  paper: string;
  /** Inner card / panel background. */
  paperCard: string;
  /** Panel grouping only: "dark" = deep inks, "light" = brighter accents.
   *  Body ink stays readable on white in both (checked to WCAG AA). */
  tone?: "dark" | "light";
}

/**
 * Traditional Tamil Jathagam ink conventions: a red/maroon "pen" for headings
 * with a darker body ink, on aged-palm paper. Black is deliberately not
 * offered as an accent — it is not used in traditional horoscope writing.
 */
export const JATHAGAM_PALETTES: JathagamPalette[] = [
  {
    id: "classic-maroon",
    labelTa: "பாரம்பரிய செம்மை",
    labelEn: "Classic Maroon & Gold",
    ink: "#2b2117",
    inkSoft: "#6f6049",
    accent: "#8e2b1c",
    accentDeep: "#6b1426",
    accentSoft: "#b03726",
    gold: "#aa820a",
    goldDeep: "#8b5a2b",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "temple-red-blue",
    labelTa: "கோயில் சிவப்பு & நீலம்",
    labelEn: "Temple Red & Royal Blue",
    ink: "#1e3a8a",
    inkSoft: "#40548f",
    accent: "#b91c1c",
    accentDeep: "#7f1d1d",
    accentSoft: "#dc2626",
    gold: "#b7791f",
    goldDeep: "#8a5a1f",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "kumkumam",
    labelTa: "குங்குமச் சிவப்பு",
    labelEn: "Kumkumam Crimson",
    ink: "#3a1a0f",
    inkSoft: "#7a5a46",
    accent: "#a01b3c",
    accentDeep: "#6d0f28",
    accentSoft: "#c62a4f",
    gold: "#c08a15",
    goldDeep: "#8e5f16",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "marudhani",
    labelTa: "மருதாணி பச்சை",
    labelEn: "Marudhani Green & Gold",
    ink: "#1f3d2b",
    inkSoft: "#5b6e5f",
    accent: "#1f6b43",
    accentDeep: "#14452b",
    accentSoft: "#2f8f5b",
    gold: "#b08a1e",
    goldDeep: "#7f6416",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "neela-indigo",
    labelTa: "நீல அவிர் மை",
    labelEn: "Indigo Ink",
    ink: "#1b2a54",
    inkSoft: "#4a577c",
    accent: "#243c86",
    accentDeep: "#152452",
    accentSoft: "#3b57b5",
    gold: "#9c7b26",
    goldDeep: "#6f5a1c",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "manjal",
    labelTa: "மஞ்சள் & செம்பு",
    labelEn: "Turmeric & Copper",
    ink: "#4a2c10",
    inkSoft: "#7e6135",
    accent: "#b25c12",
    accentDeep: "#7d3d08",
    accentSoft: "#d2791f",
    gold: "#a8871b",
    goldDeep: "#7d6413",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "olai-sepia",
    labelTa: "ஓலைச்சுவடி பழுப்பு",
    labelEn: "Palm-Leaf Sepia",
    ink: "#4b3621",
    inkSoft: "#6e5238",
    accent: "#7a4a1d",
    accentDeep: "#553213",
    accentSoft: "#9c6428",
    gold: "#9d8028",
    goldDeep: "#75601d",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "night-royal",
    labelTa: "இரவு ஊதா & பொன்",
    labelEn: "Royal Purple & Gold",
    ink: "#2e2140",
    inkSoft: "#635479",
    accent: "#6b2a8a",
    accentDeep: "#471a5e",
    accentSoft: "#8c45ab",
    gold: "#b08d1c",
    goldDeep: "#836816",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "deep-navy",
    labelTa: "ஆழ் நீலம் & பொன்",
    labelEn: "Deep Navy & Gold",
    tone: "dark",
    ink: "#14213d",
    inkSoft: "#3d4a66",
    accent: "#1d3c78",
    accentDeep: "#102652",
    accentSoft: "#2f5aa8",
    gold: "#b08d1c",
    goldDeep: "#7d6414",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "forest-emerald",
    labelTa: "காட்டு மரகதம்",
    labelEn: "Forest Emerald",
    tone: "dark",
    ink: "#123524",
    inkSoft: "#3b5a48",
    accent: "#0f5a3a",
    accentDeep: "#0a3d27",
    accentSoft: "#1d7a52",
    gold: "#a8862a",
    goldDeep: "#7a6120",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "burgundy-wine",
    labelTa: "செம்பழுப்பு மது",
    labelEn: "Burgundy Wine",
    tone: "dark",
    ink: "#3a0f1a",
    inkSoft: "#6b3a45",
    accent: "#7b1830",
    accentDeep: "#540f20",
    accentSoft: "#9c2a47",
    gold: "#b38b2e",
    goldDeep: "#82651f",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "midnight-teal",
    labelTa: "நள்ளிரவு நீலப்பச்சை",
    labelEn: "Midnight Teal",
    tone: "dark",
    ink: "#0f2f33",
    inkSoft: "#3a5c60",
    accent: "#0e5e66",
    accentDeep: "#093f45",
    accentSoft: "#16808a",
    gold: "#a88b3a",
    goldDeep: "#7a6528",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "chocolate-copper",
    labelTa: "சாக்லேட் & செம்பு",
    labelEn: "Chocolate & Copper",
    tone: "dark",
    ink: "#3b2314",
    inkSoft: "#6b4f3d",
    accent: "#8a4a1c",
    accentDeep: "#5e3010",
    accentSoft: "#a8612b",
    gold: "#b5892c",
    goldDeep: "#85641f",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "deep-plum",
    labelTa: "ஆழ் நாவல்",
    labelEn: "Deep Plum",
    tone: "dark",
    ink: "#2d1233",
    inkSoft: "#5e4466",
    accent: "#5b1f6b",
    accentDeep: "#3d1449",
    accentSoft: "#7a3490",
    gold: "#b08d1c",
    goldDeep: "#836816",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "rose-blush",
    labelTa: "ரோஜா இளஞ்சிவப்பு",
    labelEn: "Rose Blush",
    tone: "light",
    ink: "#4a1d32",
    inkSoft: "#7a4a60",
    accent: "#b0305f",
    accentDeep: "#8a2049",
    accentSoft: "#d0487a",
    gold: "#d4a24c",
    goldDeep: "#a67c30",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "sky-blue",
    labelTa: "வான் நீலம்",
    labelEn: "Sky Blue",
    tone: "light",
    ink: "#12324d",
    inkSoft: "#466680",
    accent: "#1f6fb2",
    accentDeep: "#15548a",
    accentSoft: "#3a8fd6",
    gold: "#c9a44a",
    goldDeep: "#9a7b33",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "mint-green",
    labelTa: "புதினா பச்சை",
    labelEn: "Mint Green",
    tone: "light",
    ink: "#16392c",
    inkSoft: "#45695a",
    accent: "#197a51",
    accentDeep: "#156b46",
    accentSoft: "#33a874",
    gold: "#c2a44a",
    goldDeep: "#94793a",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "lavender",
    labelTa: "லாவெண்டர்",
    labelEn: "Lavender",
    tone: "light",
    ink: "#33264d",
    inkSoft: "#62557d",
    accent: "#6a4fb0",
    accentDeep: "#503a8a",
    accentSoft: "#8a6fd0",
    gold: "#c9a44a",
    goldDeep: "#9a7b33",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "coral-saffron",
    labelTa: "பவளம் & காவி",
    labelEn: "Coral Saffron",
    tone: "light",
    ink: "#4a2310",
    inkSoft: "#7a5240",
    accent: "#c2521f",
    accentDeep: "#9a3d14",
    accentSoft: "#e0703a",
    gold: "#d4a02c",
    goldDeep: "#a67a1c",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
  {
    id: "peacock-teal",
    labelTa: "மயில் நீலம்",
    labelEn: "Peacock Teal",
    tone: "light",
    ink: "#0f3a3f",
    inkSoft: "#3f6a6e",
    accent: "#0b777b",
    accentDeep: "#0a6a6e",
    accentSoft: "#12959a",
    gold: "#c9a44a",
    goldDeep: "#9a7b33",
    paper: "#ffffff",
    paperCard: "#ffffff",
  },
];

/* ------------------------------- typefaces ------------------------------ */

export interface TamilFontOption {
  id: string;
  labelTa: string;
  labelEn: string;
  /** Full CSS font-family stack; always ends in a Tamil-capable fallback. */
  stack: string;
  /** Short note on the feel of the face. */
  noteTa: string;
  /** Default body weight. Headings that set their own weight keep it. */
  weight?: number;
}

/**
 * Every face below covers the full Tamil block. The stacks always end with
 * 'Noto Sans Tamil' so that a glyph missing from a display face still renders
 * as Tamil rather than as a tofu box — that is a real risk with the more
 * decorative faces.
 */
export const TAMIL_FONTS: TamilFontOption[] = [
  {
    id: "kavivanar",
    labelTa: "கவிவாணர் (கையெழுத்து)",
    labelEn: "Kavivanar — handwriting",
    stack: "'Kavivanar', 'Noto Sans Tamil', cursive",
    noteTa: "பாரம்பரிய கையெழுத்துப் பாணி",
  },
  {
    id: "baloo",
    labelTa: "பலூ தம்பி (தடித்த வட்டம்)",
    labelEn: "Baloo Thambi 2 — rounded bold",
    stack: "'Baloo Thambi 2', 'Noto Sans Tamil', sans-serif",
    noteTa: "தடிமனான, வாசிக்க எளிதான எழுத்து",
  },
  {
    id: "catamaran",
    labelTa: "கட்டமரன் (நவீனம்)",
    labelEn: "Catamaran — modern sans",
    stack: "'Catamaran', 'Noto Sans Tamil', sans-serif",
    noteTa: "சுத்தமான நவீன எழுத்து",
  },
  {
    id: "mukta-malar",
    labelTa: "முக்த மலர்",
    labelEn: "Mukta Malar — humanist",
    stack: "'Mukta Malar', 'Noto Sans Tamil', sans-serif",
    noteTa: "மென்மையான வடிவம், நீண்ட உரைக்கு ஏற்றது",
  },
  {
    id: "hind-madurai",
    labelTa: "ஹிந்த் மதுரை",
    labelEn: "Hind Madurai",
    stack: "'Hind Madurai', 'Noto Sans Tamil', sans-serif",
    noteTa: "அச்சு புத்தகப் பாணி",
  },
  {
    id: "anek",
    labelTa: "அனேக் தமிழ்",
    labelEn: "Anek Tamil",
    stack: "'Anek Tamil', 'Noto Sans Tamil', sans-serif",
    noteTa: "சமகால, கூர்மையான எழுத்து",
  },
  {
    id: "arima",
    labelTa: "அரிமா (அலங்காரம்)",
    labelEn: "Arima — display",
    stack: "'Arima', 'Noto Sans Tamil', cursive",
    noteTa: "அலங்கார தலைப்பு எழுத்து",
  },
  {
    id: "pavanam",
    labelTa: "பவனம்",
    labelEn: "Pavanam",
    stack: "'Pavanam', 'Noto Sans Tamil', sans-serif",
    noteTa: "மெல்லிய, நேர்த்தியான எழுத்து",
  },
  {
    id: "meera",
    labelTa: "மீரா இனிமை",
    labelEn: "Meera Inimai",
    stack: "'Meera Inimai', 'Noto Sans Tamil', sans-serif",
    noteTa: "வட்ட வடிவ, இனிய எழுத்து",
  },
  {
    id: "noto-serif",
    labelTa: "நோட்டோ தமிழ் (செரிஃப்)",
    labelEn: "Noto Serif Tamil",
    stack: "'Noto Serif Tamil', 'Noto Sans Tamil', serif",
    noteTa: "பாரம்பரிய அச்சுத் தோற்றம்",
  },
  {
    id: "noto-sans",
    labelTa: "நோட்டோ தமிழ்",
    labelEn: "Noto Sans Tamil — clean",
    stack: "'Noto Sans Tamil', sans-serif",
    noteTa: "தெளிவான நவீன எழுத்து",
  },
  {
    id: "tiro",
    labelTa: "டைரோ தமிழ் (நூல்)",
    labelEn: "Tiro Tamil — classical book",
    stack: "'Tiro Tamil', 'Noto Serif Tamil', serif",
    noteTa: "பழைய நூல் அச்சு போன்றது",
  },
  {
    id: "coiny",
    labelTa: "காய்னி (வட்ட எழுத்து)",
    labelEn: "Coiny — playful rounded",
    stack: "'Coiny', 'Baloo Thambi 2', 'Noto Sans Tamil', sans-serif",
    noteTa: "மகிழ்ச்சியான வட்ட வடிவம்",
  },
  {
    id: "catamaran-heavy",
    labelTa: "கட்டமரன் (தடித்த)",
    labelEn: "Catamaran — extra bold",
    stack: "'Catamaran', 'Noto Sans Tamil', sans-serif",
    noteTa: "வலுவான தடித்த எழுத்து",
    weight: 800,
  },
  {
    id: "noto-sans-light",
    labelTa: "நோட்டோ (மெல்லிய)",
    labelEn: "Noto Sans Tamil — light",
    stack: "'Noto Sans Tamil', sans-serif",
    noteTa: "மெல்லிய நேர்த்தியான எழுத்து",
    weight: 300,
  },
  {
    id: "noto-serif-bold",
    labelTa: "நோட்டோ செரிஃப் (தடித்த)",
    labelEn: "Noto Serif Tamil — bold",
    stack: "'Noto Serif Tamil', 'Noto Sans Tamil', serif",
    noteTa: "தடித்த அச்சு எழுத்து",
    weight: 700,
  },
];

/* ------------------------------- context -------------------------------- */

export interface JathagamThemeValue {
  palette: JathagamPalette;
  font: TamilFontOption;
  // Bug 4: the text-size option was removed from the panel and from the
  // theme entirely, so nothing can leave the Jathagam scaled.
  setPaletteId: (id: string) => void;
  setFontId: (id: string) => void;
  reset: () => void;
}

const DEFAULT_PALETTE = JATHAGAM_PALETTES[0];
const DEFAULT_FONT = TAMIL_FONTS[0];

const JathagamThemeContext = createContext<JathagamThemeValue>({
  palette: DEFAULT_PALETTE,
  font: DEFAULT_FONT,
  setPaletteId: () => {},
  setFontId: () => {},
  reset: () => {},
});

export const useJathagamTheme = () => useContext(JathagamThemeContext);

export const JathagamThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE.id);
  const [fontId, setFontId] = useState(DEFAULT_FONT.id);

  const value = useMemo<JathagamThemeValue>(() => {
    const palette = JATHAGAM_PALETTES.find((p) => p.id === paletteId) || DEFAULT_PALETTE;
    const font = TAMIL_FONTS.find((f) => f.id === fontId) || DEFAULT_FONT;
    return {
      palette,
      font,
      setPaletteId,
      setFontId,
      reset: () => {
        setPaletteId(DEFAULT_PALETTE.id);
        setFontId(DEFAULT_FONT.id);
      },
    };
  }, [paletteId, fontId]);

  return (
    <JathagamThemeContext.Provider value={value}>
      {children}
      <JathagamThemeStyle />
    </JathagamThemeContext.Provider>
  );
};

/* ---------------------- the scoped override stylesheet ------------------- */

/** Source hex (as hard-coded across the manuscript) → palette slot. */
const HEX_MAP: Array<[string, keyof JathagamPalette]> = [
  ["#2b2117", "ink"],
  ["#3a1a0f", "ink"],
  ["#1f2937", "ink"],
  ["#6f6049", "inkSoft"],
  ["#6e4620", "inkSoft"],
  ["#2b170c", "ink"],
  ["#1e0f08", "ink"],
  ["#334155", "ink"],
  ["#475569", "inkSoft"],
  ["#8e2b1c", "accent"],
  ["#6b1426", "accentDeep"],
  ["#991b1b", "accentDeep"],
  ["#b03726", "accentSoft"],
  ["#b91c1c", "accentSoft"],
  ["#aa820a", "gold"],
  ["#d4af37", "gold"],
  ["#ffd700", "gold"],
  ["#8b5a2b", "goldDeep"],
  ["#78350f", "goldDeep"],
  ["#fffaf0", "paperCard"],
  ["#fff8ee", "paperCard"],
  ["#fcf8ed", "paperCard"],
  ["#fcf8ec", "paperCard"],
  ["#fffdfa", "paperCard"],
  ["#fffdf5", "paperCard"],
  ["#f5ebd2", "paper"],
  ["#f0e5cc", "paper"],
  ["#fdf6e3", "paper"],
];

/** Tailwind colour prefix → the CSS property it sets. */
// Bug 3: every remaining warm "paper" tone that components use as a
// BACKGROUND. These are remapped for background prefixes ONLY (never text or
// border), so a beige border or text colour can never turn invisible — only
// fills become the palette's (now white) paper.
const BG_PAPER_HEXES = [
  "#e8d7ba", "#eae0c6", "#ebdcb9", "#ebdcc2", "#ecdcc2", "#ede2c8", "#eee4cb",
  "#f0e5cc", "#f4ebd0", "#f5e8d5", "#f5ebd2", "#f7efdc", "#fcf8ec", "#fdf6e3",
  "#fdfaf2", "#fff8ee", "#fffaf0", "#fffcf5", "#fffdf8", "#fffdfa", "#f6ebd6",
  "#fcf8ed", "#fffdf5",
];
// Bug (round 4): two more families of "old parchment" fills that the hex
// remap above could never reach, because they are not hex values.
//
//  1. `bg-[var(--paper)]` / `bg-[var(--paper-card)]` — these read the LEGACY
//     cream variables straight off :root (#f0e5cc / #fffaf0), so seven of the
//     report cards kept painting themselves cream no matter what the palette
//     said. Fixed by re-declaring those two variables inside the theme scope.
//  2. `bg-[rgba(120,96,58,0.0X)]` — a warm brown at low alpha, used as the
//     subtle panel tint inside the Ashtakavarga / Dasha / Yoga / Bhava /
//     Ayurdaya / Baby-name cards. Over white paper it reads as beige.
//     Remapped to the site's own panel tone so those panels still read as
//     panels, but in the website's colour instead of parchment.
const LEGACY_PAPER_VARS = ["var(--paper)", "var(--paper-card)"];
const BG_TINT_RGBA = [
  "rgba(120,96,58,0.03)", "rgba(120,96,58,0.04)", "rgba(120,96,58,0.05)",
  "rgba(120,96,58,0.06)", "rgba(120,96,58,0.07)", "rgba(120,96,58,0.08)",
  "rgba(43,33,23,0.04)",
];

const BG_PREFIXES: Array<[string, string]> = [
  ["bg", "background-color"],
  ["from", "--tw-gradient-from"],
  ["via", "--tw-gradient-via"],
  ["to", "--tw-gradient-to"],
];

const PREFIX_MAP: Array<[string, string]> = [
  ["text", "color"],
  ["bg", "background-color"],
  ["border", "border-color"],
  ["divide", "border-color"],
  ["fill", "fill"],
  ["stroke", "stroke"],
  ["ring", "--tw-ring-color"],
  ["outline", "outline-color"],
  ["decoration", "text-decoration-color"],
  ["shadow", "--tw-shadow-color"],
  ["from", "--tw-gradient-from"],
  ["to", "--tw-gradient-to"],
  ["via", "--tw-gradient-via"],
];

function buildThemeCss(palette: JathagamPalette, font: TamilFontOption): string {
  // Bug 2: the theme now applies to every "document island" (class
  // THEME_SCOPE_CLASS) as well as the original id, so the Jathagam content can
  // sit inside normal website chrome. `:is()` takes the specificity of its most
  // specific argument, so every rule still carries ID-level weight — exactly
  // as before — and keeps beating globals.css' `!important` font rules.
  const scope = `:is(#${THEME_SCOPE_ID}, .${THEME_SCOPE_CLASS})`;
  const lines: string[] = [];

  // Palette as CSS variables, so components can also read them directly.
  // The *-NN variants are pre-mixed alpha values: inline styles elsewhere used
  // to build these by string-concatenating a hex suffix (`${GOLD}66`), which
  // cannot be done with a CSS variable, so they are provided ready-made here.
  const rgba = (hex: string, a: number) => {
    const h = hex.replace("#", "");
    const n = parseInt(
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
      16
    );
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };

  lines.push(
    `${scope}{--jat-gold-40:${rgba(palette.gold, 0.4)};--jat-gold-33:${rgba(palette.gold, 0.33)};` +
      `--jat-gold-25:${rgba(palette.gold, 0.25)};--jat-accent-80:${rgba(palette.accent, 0.8)};` +
      `--jat-accent-10:${rgba(palette.accent, 0.1)};--jat-accent-18:${rgba(palette.accent, 0.18)};` +
      `--jat-ink-33:${rgba(palette.ink, 0.33)};--jat-paper-70:${rgba(palette.paperCard, 0.7)};}`
  );

  lines.push(
    `${scope}{--jat-ink:${palette.ink};--jat-ink-soft:${palette.inkSoft};` +
      `--jat-accent:${palette.accent};--jat-accent-deep:${palette.accentDeep};` +
      `--jat-accent-soft:${palette.accentSoft};--jat-gold:${palette.gold};` +
      `--jat-gold-deep:${palette.goldDeep};--jat-paper:${palette.paper};` +
      `--jat-paper-card:${palette.paperCard};--jat-font:${font.stack};}`
  );

  // Typeface: one broad rule beats every per-component font-family, including
  // globals.css' `.font-tamil { … !important }` (ID + class outranks class).
  lines.push(`${scope}, ${scope} *:not(.allow-own-font):not(.${CHROME_CLASS}):not(.${CHROME_CLASS} *){font-family:var(--jat-font) !important;}`);

  // Colour remap. `[class*=…]` also matches opacity variants such as
  // `text-[#8e2b1c]/90`, and !important outranks plain inline styles.
  for (const [hex, slot] of HEX_MAP) {
    const value = palette[slot] as string;
    for (const [prefix, prop] of PREFIX_MAP) {
      for (const h of [hex, hex.toUpperCase()]) {
        lines.push(`${scope} [class*="${prefix}-[${h}]"]{${prop}:${value} !important;}`);
      }
    }
  }

  // The legacy cream variables, re-declared inside the scope (see note above).
  lines.push(`${scope}{--paper:${palette.paper};--paper-card:${palette.paperCard};}`);

  // "Colours change but some content stays black" — the root cause.
  // Text with no colour class of its own inherits `color: var(--ink)` from the
  // legacy stylesheet, and --ink is a fixed near-black (#2b2117) that the
  // theme never redeclared. So every plain paragraph, table cell and label
  // ignored the palette. Pointing the legacy variables at the palette, and
  // setting the ink on the scope root, makes inherited text follow it too.
  lines.push(
    `${scope}{--ink:${palette.ink};--ink-soft:${palette.inkSoft};` +
      `--ink-faint:${rgba(palette.inkSoft, 0.75)};--red:${palette.accentSoft};` +
      `--red-deep:${palette.accentDeep};color:${palette.ink};` +
      (font.weight ? `font-weight:${font.weight};` : "") +
      `}`
  );

  // Tailwind's own dark text classes aren't hex, so the hex remap below never
  // saw them.
  const TW_TEXT: Array<[string, keyof JathagamPalette]> = [
    ["text-stone-800", "ink"], ["text-stone-700", "ink"], ["text-stone-900", "ink"],
    ["text-stone-600", "inkSoft"], ["text-stone-500", "inkSoft"],
    ["text-gray-800", "ink"], ["text-gray-900", "ink"], ["text-black", "ink"],
    ["text-gray-600", "inkSoft"], ["text-gray-500", "inkSoft"],
    ["text-slate-800", "ink"], ["text-slate-700", "ink"],
    ["text-slate-600", "inkSoft"], ["text-slate-500", "inkSoft"],
  ];
  for (const [cls, slot] of TW_TEXT) {
    lines.push(`${scope} .${cls}{color:${palette[slot]} !important;}`);
  }

  for (const value of LEGACY_PAPER_VARS) {
    for (const [prefix, prop] of BG_PREFIXES) {
      lines.push(`${scope} [class*="${prefix}-[${value}]"]{${prop}:${palette.paperCard} !important;}`);
    }
  }

  for (const value of BG_TINT_RGBA) {
    lines.push(`${scope} [class*="bg-[${value}]"]{background-color:var(--surface-2) !important;}`);
  }

  for (const hex of BG_PAPER_HEXES) {
    for (const [prefix, prop] of BG_PREFIXES) {
      for (const h of [hex, hex.toUpperCase()]) {
        lines.push(`${scope} [class*="${prefix}-[${h}]"]{${prop}:${palette.paperCard} !important;}`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Injects the override stylesheet. Rendered once by the provider; everything
 * that should be themed must live inside an element with
 * id={THEME_SCOPE_ID}.
 */
export const JathagamThemeStyle: React.FC = () => {
  const { palette, font } = useJathagamTheme();
  const css = useMemo(() => buildThemeCss(palette, font), [palette, font]);
  return <style id="jathagam-theme-style" dangerouslySetInnerHTML={{ __html: css }} />;
};

export default JathagamThemeProvider;