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
 * sync. Charts are the one deliberate exception: they use the fixed artwork of
 * lib/chartArt.ts (colours and face), so a chart looks and aligns the same in
 * every palette and typeface; the theme restyles the page around it.
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
  tone?: "dark" | "light" | "kongu";
}

/**
 * Traditional Tamil Jathagam ink conventions: a red/maroon "pen" for headings
 * with a darker body ink, on aged-palm paper. Black is deliberately not
 * offered as an accent — it is not used in traditional horoscope writing.
 */
export const JATHAGAM_PALETTES: JathagamPalette[] = [
  // THREE colours per palette, as astrologers write a jathagam (bug 13):
  //   heading  → titles, headings, table headers   (accent / accentDeep)
  //   body     → all body text (never black)         (ink; inkSoft is a lighter tint)
  //   highlight→ highlights, rules, borders, totals  (accentSoft / gold / goldDeep)
  // Papers are light, warm tints.
  {
    id: "classic-maroon",
    labelTa: "குங்குமம் & மஞ்சள்",
    labelEn: "Kumkum & Turmeric",
    ink: "#4a2c17",
    inkSoft: "#9b8a7f",
    accent: "#b3261e",
    accentDeep: "#b3261e",
    accentSoft: "#d99a00",
    gold: "#d99a00",
    goldDeep: "#d99a00",
    paper: "#fffaf0",
    paperCard: "#fffaf0",
    tone: "dark",
  },
  {
    id: "sandal-copper",
    labelTa: "சந்தனம் & செம்பு",
    labelEn: "Sandal & Copper",
    ink: "#5a3a22",
    inkSoft: "#a49285",
    accent: "#8e3b1e",
    accentDeep: "#8e3b1e",
    accentSoft: "#c8873a",
    gold: "#c8873a",
    goldDeep: "#c8873a",
    paper: "#fff8ee",
    paperCard: "#fff8ee",
    tone: "dark",
  },
  {
    id: "arakku-gold",
    labelTa: "அரக்கு & தங்கம்",
    labelEn: "Lac Red & Gold",
    ink: "#4a2a22",
    inkSoft: "#9b8985",
    accent: "#7a1f2b",
    accentDeep: "#7a1f2b",
    accentSoft: "#b8860b",
    gold: "#b8860b",
    goldDeep: "#b8860b",
    paper: "#fffaf2",
    paperCard: "#fffaf2",
    tone: "dark",
  },
  {
    id: "mayil-blue",
    labelTa: "மயில் நீலம்",
    labelEn: "Peacock Blue",
    ink: "#23395b",
    inkSoft: "#8692a4",
    accent: "#0f5f7a",
    accentDeep: "#0f5f7a",
    accentSoft: "#c9932b",
    gold: "#c9932b",
    goldDeep: "#c9932b",
    paper: "#f6fbfc",
    paperCard: "#f6fbfc",
    tone: "dark",
  },
  {
    id: "emerald-green",
    labelTa: "மரகதப் பச்சை",
    labelEn: "Emerald Green",
    ink: "#2f4a2c",
    inkSoft: "#8c9b8a",
    accent: "#1f6b3a",
    accentDeep: "#1f6b3a",
    accentSoft: "#c9a227",
    gold: "#c9a227",
    goldDeep: "#c9a227",
    paper: "#f7fbf3",
    paperCard: "#f7fbf3",
    tone: "dark",
  },
  {
    id: "kaavi",
    labelTa: "காவி",
    labelEn: "Saffron (Kaavi)",
    ink: "#5a3418",
    inkSoft: "#a48f7f",
    accent: "#c25a10",
    accentDeep: "#c25a10",
    accentSoft: "#2e7d6b",
    gold: "#2e7d6b",
    goldDeep: "#2e7d6b",
    paper: "#fffaf3",
    paperCard: "#fffaf3",
    tone: "light",
  },
  {
    id: "lotus-pink",
    labelTa: "தாமரை இளஞ்சிவப்பு",
    labelEn: "Lotus Pink",
    ink: "#4b2a3a",
    inkSoft: "#9c8992",
    accent: "#b0306a",
    accentDeep: "#b0306a",
    accentSoft: "#e08a2c",
    gold: "#e08a2c",
    goldDeep: "#e08a2c",
    paper: "#fff7fa",
    paperCard: "#fff7fa",
    tone: "light",
  },
  {
    id: "neelamani",
    labelTa: "நீலமணி",
    labelEn: "Sapphire",
    ink: "#2c3a5a",
    inkSoft: "#8a92a4",
    accent: "#283593",
    accentDeep: "#283593",
    accentSoft: "#d4a017",
    gold: "#d4a017",
    goldDeep: "#d4a017",
    paper: "#f7f8ff",
    paperCard: "#f7f8ff",
    tone: "light",
  },
  {
    id: "manjal-pattu",
    labelTa: "மஞ்சள் பட்டு",
    labelEn: "Turmeric Silk",
    ink: "#4f3a12",
    inkSoft: "#9e927c",
    accent: "#a35d00",
    accentDeep: "#a35d00",
    accentSoft: "#b3261e",
    gold: "#b3261e",
    goldDeep: "#b3261e",
    paper: "#fffbea",
    paperCard: "#fffbea",
    tone: "light",
  },
  {
    id: "kathali-violet",
    labelTa: "காதலி ஊதா",
    labelEn: "Temple Violet",
    ink: "#3d3456",
    inkSoft: "#948fa2",
    accent: "#5e35b1",
    accentDeep: "#5e35b1",
    accentSoft: "#c08a2e",
    gold: "#c08a2e",
    goldDeep: "#c08a2e",
    paper: "#faf8ff",
    paperCard: "#faf8ff",
    tone: "light",
  },
  // Kongu-region favourites (Coimbatore, Erode, Tiruppur, Salem) used by local astrologers.
  {
    id: "kongu-kili",
    labelTa: "கிளிப்பச்சை & அரக்கு",
    labelEn: "Parrot Green & Lac",
    ink: "#33402a",
    inkSoft: "#8e9589",
    accent: "#2e7d32",
    accentDeep: "#2e7d32",
    accentSoft: "#9c1b2e",
    gold: "#9c1b2e",
    goldDeep: "#9c1b2e",
    paper: "#f8fcf3",
    paperCard: "#f8fcf3",
    tone: "kongu",
  },
  {
    id: "kongu-manjal",
    labelTa: "கொங்கு மஞ்சள் & குங்குமம்",
    labelEn: "Kongu Turmeric & Kumkum",
    ink: "#5b3a10",
    inkSoft: "#a4927b",
    accent: "#c62828",
    accentDeep: "#c62828",
    accentSoft: "#e0a400",
    gold: "#e0a400",
    goldDeep: "#e0a400",
    paper: "#fffbe6",
    paperCard: "#fffbe6",
    tone: "kongu",
  },
  {
    id: "kongu-mambazham",
    labelTa: "மாம்பழ மஞ்சள்",
    labelEn: "Mango Yellow",
    ink: "#4f3510",
    inkSoft: "#9e8f7b",
    accent: "#c46f00",
    accentDeep: "#c46f00",
    accentSoft: "#8e1b1b",
    gold: "#8e1b1b",
    goldDeep: "#8e1b1b",
    paper: "#fffaf0",
    paperCard: "#fffaf0",
    tone: "kongu",
  },
  {
    id: "kongu-pavalam",
    labelTa: "பவளம்",
    labelEn: "Coral",
    ink: "#4d2a26",
    inkSoft: "#9d8987",
    accent: "#cc4436",
    accentDeep: "#cc4436",
    accentSoft: "#2f7d74",
    gold: "#2f7d74",
    goldDeep: "#2f7d74",
    paper: "#fff6f3",
    paperCard: "#fff6f3",
    tone: "kongu",
  },
  {
    id: "kongu-kathiri",
    labelTa: "கத்தரிப்பூ",
    labelEn: "Brinjal Violet",
    ink: "#3b2d4f",
    inkSoft: "#938b9e",
    accent: "#6a3d9a",
    accentDeep: "#6a3d9a",
    accentSoft: "#c98f1a",
    gold: "#c98f1a",
    goldDeep: "#c98f1a",
    paper: "#faf7ff",
    paperCard: "#faf7ff",
    tone: "kongu",
  },
  {
    id: "kongu-ramar",
    labelTa: "ராமர் பச்சை",
    labelEn: "Ramar Green",
    ink: "#24443a",
    inkSoft: "#869892",
    accent: "#1b7f5a",
    accentDeep: "#1b7f5a",
    accentSoft: "#c24d2c",
    gold: "#c24d2c",
    goldDeep: "#c24d2c",
    paper: "#f4fbf8",
    paperCard: "#f4fbf8",
    tone: "kongu",
  },
  {
    id: "kongu-arali",
    labelTa: "அரளிப் பூ",
    labelEn: "Arali Pink",
    ink: "#4a2338",
    inkSoft: "#9b8691",
    accent: "#c2185b",
    accentDeep: "#c2185b",
    accentSoft: "#2e7d32",
    gold: "#2e7d32",
    goldDeep: "#2e7d32",
    paper: "#fff5f9",
    paperCard: "#fff5f9",
    tone: "kongu",
  },
  {
    id: "kongu-semman",
    labelTa: "செம்மண்",
    labelEn: "Red Earth",
    ink: "#4d2c1d",
    inkSoft: "#9d8a82",
    accent: "#a0401a",
    accentDeep: "#a0401a",
    accentSoft: "#2b6c8f",
    gold: "#2b6c8f",
    goldDeep: "#2b6c8f",
    paper: "#fdf6f0",
    paperCard: "#fdf6f0",
    tone: "kongu",
  },
  {
    id: "kongu-kaveri",
    labelTa: "காவேரி நீலம்",
    labelEn: "Kaveri Blue",
    ink: "#23364d",
    inkSoft: "#86909d",
    accent: "#1565c0",
    accentDeep: "#1565c0",
    accentSoft: "#d9921a",
    gold: "#d9921a",
    goldDeep: "#d9921a",
    paper: "#f5f9ff",
    paperCard: "#f5f9ff",
    tone: "kongu",
  },
  {
    id: "kongu-thamiram",
    labelTa: "தாமிரம்",
    labelEn: "Copper",
    ink: "#4a3022",
    inkSoft: "#9b8d85",
    accent: "#b45f2a",
    accentDeep: "#b45f2a",
    accentSoft: "#6a8d2f",
    gold: "#6a8d2f",
    goldDeep: "#6a8d2f",
    paper: "#fff8f2",
    paperCard: "#fff8f2",
    tone: "kongu",
  },
];

/* --------------------------- page background ---------------------------- */

/**
 * Plain page backgrounds of the colour panel. "palette" keeps each palette's
 * own light paper (the previous behaviour); "white" and "turmeric" put one
 * single colour behind every page — the website report, the normal PDF and the
 * designed (print) PDF — whatever ink palette is chosen.
 */
export type PageBackgroundId = "palette" | "white" | "turmeric";

export interface PageBackgroundOption {
  id: PageBackgroundId;
  labelTa: string;
  labelEn: string;
  /** null = the palette's own paper. */
  colour: string | null;
}

export const PAGE_BACKGROUNDS: PageBackgroundOption[] = [
  { id: "palette", labelTa: "வண்ணத் தொகுப்பின் இயல்பு", labelEn: "Palette default", colour: null },
  { id: "white", labelTa: "வெள்ளை", labelEn: "White", colour: "#FFFFFF" },
  // soft turmeric (மஞ்சள்) — the traditional manjal jathagam paper; dark inks stay readable on it
  { id: "turmeric", labelTa: "மஞ்சள் (மஞ்சள் பத்திரம்)", labelEn: "Turmeric (manjal)", colour: "#FCE38A" },
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
 * Tamil typefaces of the colour / Tamil-style panel.
 *
 * 1 kept face  : Kavivanar (handwriting) — the default, unchanged.
 * 13 new faces : the owner's STMZH fonts (st-089 … st_144). The originals are
 *   legacy 8-bit "symbol" fonts that cannot show Unicode Tamil, so each one was
 *   converted to a Unicode OpenType font ("MLA Tamil NNN", files in
 *   public/fonts/tamil/MLATamil-NNN.woff2 and backend/app/fonts/MLATamil-NNN.ttf):
 *   letters are mapped to Unicode, uyirmei ligatures (கு, கீ, க், ஸ்ரீ, க்ஷ …) are
 *   OpenType GSUB rules, and the size is matched to Noto Sans Tamil.
 *   Latin letters are not in those fonts, so the stack falls back to
 *   Noto Sans Tamil / sans-serif for English text.
 */
export const TAMIL_FONTS: TamilFontOption[] = [
  // Kept from the previous panel: the handwritten style (default).
  {
    id: "kavivanar",
    labelTa: "கவிவாணர் (கையெழுத்து)",
    labelEn: "Kavivanar — handwriting",
    stack: "'Kavivanar', 'Noto Sans Tamil', cursive",
    noteTa: "பாரம்பரிய கையெழுத்துப் பாணி",
  },
  {
    id: "mla-090",
    labelTa: "அச்சு தடித்த (செய்தித்தாள்)",
    labelEn: "Print Bold — newspaper",
    stack: "'MLA Tamil 090', 'Noto Sans Tamil', sans-serif",
    noteTa: "தெளிவான தடித்த அச்சு எழுத்து",
  },
  {
    id: "mla-138",
    labelTa: "தெளிவான அச்சு",
    labelEn: "Clear Print",
    stack: "'MLA Tamil 138', 'Noto Sans Tamil', sans-serif",
    noteTa: "வாசிக்க எளிய நேர் அச்சு",
  },
  {
    id: "mla-089",
    labelTa: "நளின அச்சு (மெல்லிய)",
    labelEn: "Elegant Thin Serif",
    stack: "'MLA Tamil 089', 'Noto Sans Tamil', sans-serif",
    noteTa: "மெல்லிய, நேர்த்தியான அச்சு",
  },
  {
    id: "mla-133",
    labelTa: "இலக்கிய அச்சு",
    labelEn: "Literary Serif",
    stack: "'MLA Tamil 133', 'Noto Sans Tamil', sans-serif",
    noteTa: "நூல் அச்சுப் போன்ற எழுத்து",
  },
  {
    id: "mla-108",
    labelTa: "பழைய நூல் அச்சு",
    labelEn: "Classic Book",
    stack: "'MLA Tamil 108', 'Noto Sans Tamil', sans-serif",
    noteTa: "உயரமான பாரம்பரிய அச்சு",
  },
  {
    id: "mla-111",
    labelTa: "மென் வட்ட எழுத்து",
    labelEn: "Soft Rounded",
    stack: "'MLA Tamil 111', 'Noto Sans Tamil', sans-serif",
    noteTa: "மென்மையான வட்ட வடிவம்",
  },
  {
    id: "mla-103",
    labelTa: "வட்டத் தடித்த",
    labelEn: "Rounded Bold",
    stack: "'MLA Tamil 103', 'Noto Sans Tamil', sans-serif",
    noteTa: "தடித்த வட்ட வடிவம்",
  },
  {
    id: "mla-123",
    labelTa: "தலைப்புத் தடித்த",
    labelEn: "Heading Heavy",
    stack: "'MLA Tamil 123', 'Noto Sans Tamil', sans-serif",
    noteTa: "அகலமான தலைப்பு எழுத்து",
  },
  {
    id: "mla-144",
    labelTa: "கனத்த அலங்காரம்",
    labelEn: "Extra Heavy Display",
    stack: "'MLA Tamil 144', 'Noto Sans Tamil', sans-serif",
    noteTa: "மிகத் தடித்த அலங்கார எழுத்து",
  },
  {
    id: "mla-105",
    labelTa: "அலங்கார அகல்",
    labelEn: "Decorative Wide",
    stack: "'MLA Tamil 105', 'Noto Sans Tamil', sans-serif",
    noteTa: "அகலமான அலங்கார எழுத்து",
  },
  {
    id: "mla-126",
    labelTa: "தூரிகை எழுத்து",
    labelEn: "Brush Stroke",
    stack: "'MLA Tamil 126', 'Noto Sans Tamil', sans-serif",
    noteTa: "தூரிகையால் எழுதிய தோற்றம்",
  },
  {
    id: "mla-130",
    labelTa: "அலங்காரக் கையெழுத்து",
    labelEn: "Ornamental Script",
    stack: "'MLA Tamil 130', 'Noto Sans Tamil', sans-serif",
    noteTa: "சுழிகள் கொண்ட கையெழுத்து",
  },
  {
    id: "mla-132",
    labelTa: "சாய்வுக் கையெழுத்து",
    labelEn: "Slanted Pen Script",
    stack: "'MLA Tamil 132', 'Noto Sans Tamil', sans-serif",
    noteTa: "மெல்லிய சாய்வு பேனா எழுத்து",
  },
];

/* ------------------------------- context -------------------------------- */

export interface JathagamThemeValue {
  /** The chosen palette, with paper / paperCard replaced by the page background when one is chosen. */
  palette: JathagamPalette;
  font: TamilFontOption;
  background: PageBackgroundOption;
  setBackgroundId: (id: PageBackgroundId) => void;
  // Bug 4: the text-size option was removed from the panel and from the
  // theme entirely, so nothing can leave the Jathagam scaled.
  setPaletteId: (id: string) => void;
  setFontId: (id: string) => void;
  reset: () => void;
}

const DEFAULT_PALETTE = JATHAGAM_PALETTES[0];
const DEFAULT_FONT = TAMIL_FONTS[0];
const DEFAULT_BACKGROUND = PAGE_BACKGROUNDS[0];

const JathagamThemeContext = createContext<JathagamThemeValue>({
  palette: DEFAULT_PALETTE,
  font: DEFAULT_FONT,
  background: DEFAULT_BACKGROUND,
  setBackgroundId: () => {},
  setPaletteId: () => {},
  setFontId: () => {},
  reset: () => {},
});

export const useJathagamTheme = () => useContext(JathagamThemeContext);

export const JathagamThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE.id);
  const [fontId, setFontId] = useState(DEFAULT_FONT.id);
  const [backgroundId, setBackgroundId] = useState<PageBackgroundId>(DEFAULT_BACKGROUND.id);

  const value = useMemo<JathagamThemeValue>(() => {
    const base = JATHAGAM_PALETTES.find((p) => p.id === paletteId) || DEFAULT_PALETTE;
    const font = TAMIL_FONTS.find((f) => f.id === fontId) || DEFAULT_FONT;
    const background = PAGE_BACKGROUNDS.find((b) => b.id === backgroundId) || DEFAULT_BACKGROUND;
    // One background colour for the whole document: every consumer of
    // palette.paper / paperCard (themed CSS, single-page sheet, designed-PDF
    // request) follows it without knowing about the option.
    const palette = background.colour ? { ...base, paper: background.colour, paperCard: background.colour } : base;
    return {
      palette,
      font,
      background,
      setBackgroundId,
      setPaletteId,
      setFontId,
      reset: () => {
        setPaletteId(DEFAULT_PALETTE.id);
        setFontId(DEFAULT_FONT.id);
        setBackgroundId(DEFAULT_BACKGROUND.id);
      },
    };
  }, [paletteId, fontId, backgroundId]);

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

function buildThemeCss(palette: JathagamPalette, font: TamilFontOption, background: PageBackgroundOption): string {
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

  // Page background (white / turmeric): the report pages — which otherwise use
  // the site's white panel — take the chosen colour, and --jat-page-bg tells
  // the normal-PDF exporter (lib/pdfExport.ts) which colour to fill the sheet
  // with. "Palette default" adds nothing, so the earlier look is unchanged.
  if (background.colour) {
    const bg = background.colour;
    lines.push(`${scope}{--jat-page-bg:${bg};}`);
    lines.push(
      `${scope} .kalai-page, ${scope}.kalai-page, ${scope} .single-sheet, ${scope} .manuscript-page` +
        `{background:${bg} !important;background-image:none !important;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;}`
    );
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
  const { palette, font, background } = useJathagamTheme();
  const css = useMemo(() => buildThemeCss(palette, font, background), [palette, font, background]);
  return <style id="jathagam-theme-style" dangerouslySetInnerHTML={{ __html: css }} />;
};

export default JathagamThemeProvider;