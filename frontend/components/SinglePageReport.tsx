"use client";

import React from "react";
import { ChartResponse, KattamPlanet } from "@/lib/types";
import {
  findLagnaSignNum,
  NORTH_INDIAN_HOUSES,
  signForNorthIndianHouse,
  CHART_STYLE_THEMES,
  ChartStyle,
} from "@/lib/chartLayouts";
import { Sparkles } from "lucide-react";
import { formatTime12h } from "@/lib/timeFormat";
import { SinglePagePdfButton } from "./SinglePagePdfButton";
import { useJathagamTheme, JathagamPalette } from "@/lib/jathagamTheme";

interface SinglePageReportProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

/* ===========================================================================
 * LAYOUT CONTRACT FOR THIS SHEET — read before restyling
 * ===========================================================================
 * This sheet is rasterised into a PDF. Three rules keep screen and PDF
 * identical, and breaking any one of them reintroduces the overlap bug:
 *
 *  1. NO CSS GRID, NO FLEXBOX anywhere inside #single-page-report.
 *     html2canvas (the fallback rasteriser) has no CSS Grid implementation
 *     at all — it lays grid children out as ordinary static blocks, which is
 *     what made the identity cards, mini-facts, chart row and scorecard pile
 *     on top of each other in the download. All multi-column layout here is
 *     done with <table>, which every rasteriser handles correctly.
 *     (lib/pdfExport.ts' primary foreignObject path would survive grid, but
 *     this sheet stays grid-free as a second line of defence.)
 *
 *  2. EXPLICIT PIXEL LINE-HEIGHTS on everything. The Tamil handwriting face
 *     (Kavivanar) has tall ascenders/descenders; with `leading-none` or
 *     unitless line-heights the rasteriser's own line boxes land a few px off
 *     per line and the error accumulates down the page. Never use
 *     `leading-none` here.
 *
 *  3. INLINE STYLES, not Tailwind classes, for colour and type. Tailwind v4
 *     emits oklch() colours which the fallback rasteriser cannot parse.
 *
 * The sheet is 794 px wide (A4 @96dpi) with a 1123 px minimum height, and the
 * exporter fits it to A4 preserving aspect ratio. `minHeight` rather than a
 * fixed `height` on purpose: a fixed height silently CLIPS a long chart
 * (11 planets + a long place name), which was the on-screen "content outside
 * the box" complaint. Growing slightly past A4 just means the exporter scales
 * the sheet down a few percent, which is harmless.
 *
 * Nothing here recomputes astrology — every value comes from `chart`. Layout
 * only, per AGENTS.md §1.
 * ========================================================================= */

const SHEET_W = 794;
const SHEET_MIN_H = 1123;

const INK = "var(--jat-ink, #2b2117)";
const INK_SOFT = "var(--jat-ink-soft, #6f6049)";
const RED = "var(--jat-accent, #8e2b1c)";
const GOLD = "var(--jat-gold, #aa820a)";
const PAPER = "var(--jat-paper, #ffffff)"; // Bug 3: white sheet
const PAPER_CARD = "var(--jat-paper-card, #ffffff)";

const FONT_STACK = "var(--jat-font, 'Kavivanar', 'Noto Sans Tamil', sans-serif)";

function toPlanetsBySign(
  kattam: Record<number, KattamPlanet[]>
): Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>> {
  const out: Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>> = {};
  Object.keys(kattam || {}).forEach((k) => {
    const signNum = Number(k);
    out[signNum] = (kattam[signNum] || []).map((p) => ({
      name: p.name,
      symbol: p.is_lagna ? "லக்" : p.symbol || p.name?.slice(0, 2),
      is_lagna: p.is_lagna,
    }));
  });
  return out;
}

function themeFor(style: string) {
  const key = (style === "kerala" || style === "north_indian" ? style : "tamil") as ChartStyle;
  return CHART_STYLE_THEMES[key];
}

/**
 * The mini charts paint their own borders and chips with explicit colours, so
 * the theme stylesheet (which remaps Tailwind classes) cannot reach them. The
 * regional style still decides the GEOMETRY and stays the base palette; the
 * user's chosen ink overrides its ink/accent/paper so the charts match the
 * sheet around them, on screen and in the PDF alike.
 */
function themedChartTheme(style: string, palette: JathagamPalette) {
  return {
    ...themeFor(style),
    ink: palette.ink,
    inkSoft: palette.gold,
    accent: palette.accent,
    paper: palette.paperCard,
  };
}
type Theme = ReturnType<typeof themeFor>;

type SignPlanets = Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>>;

/* --------------------------------------------------------------------------
 * South Indian fixed-sign grid — rendered as a <table>, not a CSS grid.
 * Same geometry for Tamil & Kerala (lib/chartLayouts.ts: identical fixed-sign
 * grid, only ink/accent colour differs).
 * ------------------------------------------------------------------------ */
const CHART_BOX_H = 178;
const CELL_H = 36;

const SouthIndianMiniChart: React.FC<{
  title: string;
  planetsBySign: SignPlanets;
  theme: Theme;
}> = ({ title, planetsBySign, theme }) => {
  const cellStyle: React.CSSProperties = {
    border: `1px solid ${theme.ink}55`,
    height: `${CELL_H}px`,
    width: "25%",
    padding: "2px",
    textAlign: "center",
    verticalAlign: "top",
    overflow: "hidden",
  };

  const chip = (p: { symbol: string; name: string; is_lagna?: boolean }, idx: number) => (
    <span
      key={idx}
      style={{
        display: "inline-block",
        margin: "0 1px",
        padding: "0 3px",
        borderRadius: "3px",
        fontSize: "9px",
        lineHeight: "13px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: p.is_lagna ? theme.accent : "#fffaf0",
        color: p.is_lagna ? "#ffffff" : theme.ink,
        border: `1px solid ${p.is_lagna ? theme.accent : `${theme.ink}33`}`,
      }}
    >
      {p.symbol || p.name.slice(0, 2)}
    </span>
  );

  const cell = (signNum: number) => (
    <td style={cellStyle}>{(planetsBySign[signNum] || []).map(chip)}</td>
  );

  return (
    <div
      style={{
        border: `2px solid ${theme.ink}`,
        borderRadius: "8px",
        background: theme.paper,
        padding: "6px",
        height: `${CHART_BOX_H}px`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: theme.accent,
          fontSize: "11px",
          lineHeight: "17px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          border: `1px solid ${theme.ink}`,
        }}
      >
        <tbody>
          <tr>
            {cell(12)}
            {cell(1)}
            {cell(2)}
            {cell(3)}
          </tr>
          <tr>
            {cell(11)}
            <td
              colSpan={2}
              rowSpan={2}
              style={{
                border: `1px solid ${theme.ink}`,
                background: theme.paper,
                textAlign: "center",
                verticalAlign: "middle",
                color: theme.accent,
                fontSize: "10px",
                lineHeight: "15px",
                fontWeight: 700,
              }}
            >
              {title}
            </td>
            {cell(4)}
          </tr>
          <tr>
            {cell(10)}
            {cell(5)}
          </tr>
          <tr>
            {cell(9)}
            {cell(8)}
            {cell(7)}
            {cell(6)}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * North Indian fixed-house diamond — same geometry as the main chart canvas.
 * Plain SVG, which rasterises reliably.
 * ------------------------------------------------------------------------ */
const NorthIndianMiniChart: React.FC<{
  title: string;
  planetsBySign: SignPlanets;
  lagnaSignNum: number;
  theme: Theme;
}> = ({ title, planetsBySign, lagnaSignNum, theme }) => {
  const svgSize = CHART_BOX_H - 40;
  return (
    <div
      style={{
        border: `2px solid ${theme.ink}`,
        borderRadius: "8px",
        background: theme.paper,
        padding: "6px",
        height: `${CHART_BOX_H}px`,
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: theme.accent,
          fontSize: "11px",
          lineHeight: "17px",
          fontWeight: 700,
          marginBottom: "2px",
        }}
      >
        {title}
      </div>
      <svg viewBox="0 0 400 400" width={svgSize} height={svgSize} style={{ display: "inline-block" }}>
        <rect x={2} y={2} width={396} height={396} fill="none" stroke={theme.ink} strokeWidth={3} />
        {NORTH_INDIAN_HOUSES.map((h) => {
          const signNum = signForNorthIndianHouse(lagnaSignNum, h.house);
          const planets = planetsBySign[signNum] || [];
          const label = planets.map((p) => p.symbol || p.name.slice(0, 2)).join(" ");
          return (
            <g key={h.house}>
              <polygon
                points={h.points}
                fill={h.house === 1 ? `${theme.accent}22` : "transparent"}
                stroke={theme.ink}
                strokeWidth={h.house === 1 ? 2.5 : 1.5}
              />
              <text x={h.labelX} y={h.labelY - 14} textAnchor="middle" fontSize={13} fill={`${theme.ink}90`}>
                {signNum}
              </text>
              {label && (
                <text
                  x={h.labelX}
                  y={h.labelY + 6}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill={h.house === 1 ? theme.accent : theme.ink}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const MiniChart: React.FC<{
  title: string;
  chartStyle: string;
  planetsBySign: SignPlanets;
  lagnaSignNum: number;
  palette: JathagamPalette;
}> = ({ title, chartStyle, planetsBySign, lagnaSignNum, palette }) => {
  const theme = themedChartTheme(chartStyle, palette);
  if (chartStyle === "north_indian") {
    return (
      <NorthIndianMiniChart
        title={title}
        planetsBySign={planetsBySign}
        lagnaSignNum={lagnaSignNum}
        theme={theme}
      />
    );
  }
  return <SouthIndianMiniChart title={title} planetsBySign={planetsBySign} theme={theme} />;
};

/* ------------------------------ primitives ------------------------------ */

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      color: RED,
      fontSize: "12px",
      lineHeight: "20px",
      fontWeight: 700,
      marginBottom: "4px",
    }}
  >
    {children}
  </div>
);

const Line: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ fontSize: "10.5px", lineHeight: "17px", color: INK }}>
    <strong style={{ fontWeight: 700 }}>{label}:</strong> {value}
  </div>
);

const cardStyle: React.CSSProperties = {
  border: `1px solid var(--jat-gold-40, rgba(170,130,10,0.4))`,
  borderRadius: "8px",
  padding: "7px 9px",
  background: PAPER_CARD,
  boxSizing: "border-box",
  verticalAlign: "top",
};

/* ------------------------------ main sheet ------------------------------ */

export const SinglePageReport: React.FC<SinglePageReportProps> = ({ chart, lang }) => {
  const { palette } = useJathagamTheme();
  const bd = chart.basic_details;
  const sps = chart.single_page_summary;
  const st = sps?.saturn_transit;

  const lagnaSignNum = findLagnaSignNum(chart.rasi_kattam as any);
  // A North Indian chart is laid out FROM its own Lagna. The Navamsa was being
  // drawn from the Rasi Lagna, which rotates every house wrongly whenever the
  // two differ. It now uses the Navamsa's own.
  const navamsaLagnaSignNum = findLagnaSignNum(chart.navamsa_kattam as any);
  const rasiPlanetsBySign = toPlanetsBySign(chart.rasi_kattam as any);
  const navamsaPlanetsBySign = toPlanetsBySign(chart.navamsa_kattam as any);

  const tableRows = chart.planets || [];

  const doshaChips = (chart.doshas || []).map((d) => ({
    name: lang === "ta" ? d.name_ta : d.name,
    present: d.present,
  }));

  const th: React.CSSProperties = {
    border: `1px solid var(--jat-gold-40, rgba(170,130,10,0.4))`,
    padding: "2px 3px",
    fontSize: "9.5px",
    lineHeight: "15px",
    fontWeight: 700,
    color: RED,
    background: "var(--jat-accent-10, rgba(142,43,28,0.10))",
    textAlign: "center",
  };
  const td: React.CSSProperties = {
    border: `1px solid var(--jat-gold-25, rgba(170,130,10,0.25))`,
    padding: "1px 3px",
    fontSize: "9.5px",
    lineHeight: "15px",
    textAlign: "center",
    color: INK,
  };
  const factCell: React.CSSProperties = {
    width: "25%",
    padding: "0 4px 0 0",
    verticalAlign: "top",
  };

  const miniFact = (label: string, value: string) => (
    <div
      style={{
        background: PAPER_CARD,
        border: `1px solid var(--jat-gold-33, rgba(170,130,10,0.33))`,
        borderRadius: "6px",
        padding: "4px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "8.5px", lineHeight: "14px", color: RED }}>{label}</div>
      <div style={{ fontSize: "10px", lineHeight: "16px", fontWeight: 700, color: INK }}>{value}</div>
    </div>
  );

  const chip = (text: string, tone: "bad" | "warn" | "ok", key: React.Key) => {
    const palette =
      tone === "bad"
        ? { bg: "#ffe4e6", border: "#e11d48", fg: "#9f1239", mark: "!" }
        : tone === "warn"
        ? { bg: "#fef3c7", border: "#d97706", fg: "#92400e", mark: "•" }
        : { bg: "#d1fae5", border: "#059669", fg: "#065f46", mark: "✓" };
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          margin: "0 5px 5px 0",
          padding: "1px 9px",
          borderRadius: "999px",
          fontSize: "9.5px",
          lineHeight: "16px",
          whiteSpace: "nowrap",
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          color: palette.fg,
        }}
      >
        {palette.mark} {text}
      </span>
    );
  };

  const scorecard = sps?.life_scorecard || [];
  const scorecardRows: any[][] = [];
  for (let i = 0; i < scorecard.length; i += 2) scorecardRows.push(scorecard.slice(i, i + 2));

  return (
    <div className="space-y-3">
      {/* Toolbar — outside #single-page-report, so it is never captured */}
      {/* Bug 2: website-style toolbar (jat-chrome = not themed / not handwritten) */}
      <div className="jat-chrome card no-print flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
          <span className="w-8 h-8 rounded-xl brand-gradient-bg flex items-center justify-center shadow-soft">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          {lang === "ta" ? "சுருக்க ஜாதகம் (ஒரு பக்கம்)" : "Single-Page Jathagam"}
        </h2>
        <SinglePagePdfButton chart={chart} lang={lang} />
      </div>

      <div className="flex justify-center">
        <div
          id="single-page-report"
          className="manuscript-page-single"
          style={{
            position: "relative",
            width: `${SHEET_W}px`,
            minHeight: `${SHEET_MIN_H}px`,
            background: PAPER,
            border: `2px solid var(--jat-gold-40, rgba(170,130,10,0.4))`,
            borderRadius: "6px",
            padding: "24px 30px 20px",
            boxSizing: "border-box",
            color: INK,
            fontFamily: FONT_STACK,
            fontSize: "11px",
            lineHeight: "17px",
          }}
        >
          {/* aged-paper corner marks */}
          <div style={{ position: "absolute", top: "6px", left: "9px", color: GOLD, fontSize: "12px", lineHeight: "14px" }}>⚜</div>
          <div style={{ position: "absolute", top: "6px", right: "9px", color: GOLD, fontSize: "12px", lineHeight: "14px" }}>⚜</div>
          <div style={{ position: "absolute", bottom: "6px", left: "9px", color: GOLD, fontSize: "12px", lineHeight: "14px" }}>⚜</div>
          <div style={{ position: "absolute", bottom: "6px", right: "9px", color: GOLD, fontSize: "12px", lineHeight: "14px" }}>⚜</div>

          {/* Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: `2px solid var(--jat-gold-40, rgba(170,130,10,0.4))`,
              paddingBottom: "8px",
              marginBottom: "10px",
            }}
          >
            <div style={{ color: RED, fontSize: "15px", lineHeight: "24px", fontWeight: 700 }}>
              ௐ ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <div style={{ color: RED, fontSize: "24px", lineHeight: "36px", fontWeight: 700 }}>
              {lang === "ta" ? "சுருக்க ஜாதகம்" : "Single-Page Jathagam"}
            </div>
            <div style={{ color: INK_SOFT, fontSize: "9px", lineHeight: "15px", letterSpacing: "1.2px" }}>
              {chart.panchangam_system === "vakhyam"
                ? "வாக்கிய பஞ்சாங்கம் (VAKHYAM)"
                : "திருக்கணித பஞ்சாங்கம் (THIRUKANITHAM) — DRIK-SIDDHA"}
            </div>
          </div>

          {/* Identity + birth details — table, not grid */}
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0", tableLayout: "fixed", marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: "5px", verticalAlign: "top" }}>
                  <div style={cardStyle}>
                    <Line label={lang === "ta" ? "பெயர்" : "Name"} value={chart.name} />
                    <Line label={lang === "ta" ? "பிறந்த தேதி" : "DOB"} value={chart.date_of_birth} />
                    <Line
                      label={lang === "ta" ? "பிறந்த நேரம்" : "TOB"}
                      value={formatTime12h(chart.time_of_birth)}
                    />
                    <Line label={lang === "ta" ? "இடம்" : "Place"} value={chart.place} />
                  </div>
                </td>
                <td style={{ width: "50%", paddingLeft: "5px", verticalAlign: "top" }}>
                  <div style={cardStyle}>
                    <Line
                      label={lang === "ta" ? "லக்னம்" : "Lagnam"}
                      value={lang === "ta" ? bd.lagnam_ta : bd.lagnam}
                    />
                    <Line label={lang === "ta" ? "ராசி" : "Rasi"} value={lang === "ta" ? bd.rasi_ta : bd.rasi} />
                    <Line
                      label={lang === "ta" ? "நட்சத்திரம்" : "Nakshatram"}
                      value={`${lang === "ta" ? bd.nakshatram_ta : bd.nakshatram} (${
                        lang === "ta" ? "பாதம்" : "Pada"
                      } ${bd.pada})`}
                    />
                    <Line
                      label={lang === "ta" ? "திதி / யோகம் / கரணம்" : "Thithi / Yogam / Karanam"}
                      value={`${lang === "ta" ? bd.thithi_ta : bd.thithi} / ${
                        lang === "ta" ? bd.yogam_ta : bd.yogam
                      } / ${lang === "ta" ? bd.karanam_ta : bd.karanam}`}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Sunrise / Sunset / Ayanamsa / Dasa balance */}
          <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td style={factCell}>
                  {miniFact(lang === "ta" ? "சூரிய உதயம்" : "Sunrise", formatTime12h(bd.sun_rise))}
                </td>
                <td style={factCell}>
                  {miniFact(lang === "ta" ? "சூரிய அஸ்தமனம்" : "Sunset", formatTime12h(bd.sun_set))}
                </td>
                <td style={factCell}>
                  {miniFact(
                    lang === "ta" ? "அயனாம்சம்" : "Ayanamsa",
                    bd.ayanamsa_dms || bd.ayanamsa_value?.toFixed(2) || "—"
                  )}
                </td>
                <td style={{ ...factCell, paddingRight: 0 }}>
                  {miniFact(
                    lang === "ta" ? "இருப்பு தசை" : "Dasa Balance",
                    (lang === "ta" ? bd.dasha_balance_ta : bd.dasha_balance_en) || "—"
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Rasi + Navamsa */}
          <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginBottom: "10px" }}>
            <tbody>
              <tr>
                <td style={{ width: "50%", paddingRight: "5px", verticalAlign: "top" }}>
                  <MiniChart
                    title={lang === "ta" ? "ராசி கட்டம் (D1)" : "Rasi (D1)"}
                    chartStyle={chart.chart_style}
                    planetsBySign={rasiPlanetsBySign}
                    lagnaSignNum={lagnaSignNum}
                    palette={palette}
                  />
                </td>
                <td style={{ width: "50%", paddingLeft: "5px", verticalAlign: "top" }}>
                  <MiniChart
                    title={lang === "ta" ? "நவாம்சம் (D9)" : "Navamsa (D9)"}
                    chartStyle={chart.chart_style}
                    planetsBySign={navamsaPlanetsBySign}
                    lagnaSignNum={navamsaLagnaSignNum}
                    palette={palette}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Graha Sphutam */}
          <div style={{ marginBottom: "10px" }}>
            <SectionTitle>
              {lang === "ta" ? "கிரக ஸ்புடம் (Planetary Positions)" : "Graha Sphutam (Planetary Positions)"}
            </SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={th}>{lang === "ta" ? "கிரகம்" : "Planet"}</th>
                  <th style={th}>{lang === "ta" ? "ராசி" : "Sign"}</th>
                  <th style={th}>{lang === "ta" ? "பாகை" : "Degree"}</th>
                  <th style={th}>{lang === "ta" ? "நட்சத்திரம்" : "Nakshatra"}</th>
                  <th style={th}>{lang === "ta" ? "பாதம்" : "Pada"}</th>
                  <th style={th}>{lang === "ta" ? "இல்லம்" : "House"}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((p: any, idx: number) => (
                  <tr
                    key={idx}
                    style={{
                      background: p.is_lagna
                        ? "var(--jat-accent-18, rgba(212,175,55,0.18))"
                        : idx % 2 === 0
                        ? "rgba(255,255,255,0.45)"
                        : "transparent",
                      fontWeight: p.is_lagna ? 700 : 400,
                    }}
                  >
                    <td style={td}>{lang === "ta" ? p.name_ta : p.name}</td>
                    <td style={td}>{lang === "ta" ? p.rasi_ta : p.rasi}</td>
                    <td style={td}>
                      {typeof p.degree === "number" ? `${p.degree.toFixed(2)}°` : p.degree_dms || "—"}
                      {p.is_retrograde ? " (வ)" : ""}
                    </td>
                    <td style={td}>{lang === "ta" ? p.nakshatra_ta : p.nakshatra}</td>
                    <td style={td}>{p.pada ?? "—"}</td>
                    <td style={td}>{p.house ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Current Dasa / Bhukti */}
          {sps?.current_period && (
            <div style={{ ...cardStyle, marginBottom: "10px" }}>
              <SectionTitle>
                {lang === "ta" ? "தற்போதைய திசை - புக்தி" : "Current Dasa / Bhukti"}
              </SectionTitle>
              <div style={{ fontSize: "10.5px", lineHeight: "17px" }}>
                <strong>
                  {lang === "ta" ? sps.current_period.mahadasha_lord_ta : sps.current_period.mahadasha_lord}
                </strong>{" "}
                {lang === "ta" ? "மகா திசை" : "Mahadasha"} ({sps.current_period.mahadasha_start} →{" "}
                {sps.current_period.mahadasha_end}) —{" "}
                <strong>
                  {lang === "ta" ? sps.current_period.bhukti_lord_ta : sps.current_period.bhukti_lord}
                </strong>{" "}
                {lang === "ta" ? "புக்தி" : "Bhukti"} ({sps.current_period.bhukti_start} →{" "}
                {sps.current_period.bhukti_end})
              </div>
              <div style={{ fontSize: "9.5px", lineHeight: "16px", color: INK_SOFT, marginTop: "3px" }}>
                {lang === "ta"
                  ? sps.current_period.micro_prediction_ta
                  : sps.current_period.micro_prediction}
              </div>
            </div>
          )}

          {/* Dosha chips + Saturn transit */}
          <div style={{ marginBottom: "8px" }}>
            <SectionTitle>{lang === "ta" ? "தோஷ பரிசோதனை" : "Dosha Checklist"}</SectionTitle>
            <div>
              {doshaChips.map((d, i) => chip(d.name, d.present ? "bad" : "ok", `d${i}`))}
              {st &&
                chip(
                  lang === "ta" ? st.name_ta : st.name,
                  st.present ? "bad" : st.is_upcoming ? "warn" : "ok",
                  "saturn"
                )}
            </div>
          </div>

          {/* Life Scorecard — table rows, not a 2-column grid */}
          {scorecard.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <SectionTitle>{lang === "ta" ? "வாழ்க்கை மதிப்பீடு" : "Life Scorecard"}</SectionTitle>
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                <tbody>
                  {scorecardRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {[0, 1].map((cIdx) => {
                        const cat = row[cIdx];
                        return (
                          <td
                            key={cIdx}
                            style={{
                              width: "50%",
                              padding: cIdx === 0 ? "0 8px 7px 0" : "0 0 7px 8px",
                              verticalAlign: "top",
                            }}
                          >
                            {cat && (
                              <>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                  <tbody>
                                    <tr>
                                      <td
                                        style={{
                                          fontSize: "9.5px",
                                          lineHeight: "16px",
                                          fontWeight: 700,
                                          color: INK,
                                          textAlign: "left",
                                        }}
                                      >
                                        {lang === "ta" ? cat.category_ta : cat.category}
                                      </td>
                                      <td
                                        style={{
                                          fontSize: "9.5px",
                                          lineHeight: "16px",
                                          color: INK_SOFT,
                                          textAlign: "right",
                                        }}
                                      >
                                        {lang === "ta" ? cat.rating_ta : cat.rating}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "6px",
                                    borderRadius: "999px",
                                    background: "#e5e7eb", // score-bar track: neutral grey on the white sheet
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "6px",
                                      background: "#b03726",
                                      width: `${Math.max(4, Math.min(100, cat.score_percentage))}%`,
                                    }}
                                  />
                                </div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Remedies */}
          {sps?.remedies && (
            <div style={{ borderTop: `2px solid var(--jat-gold-40, rgba(170,130,10,0.4))`, paddingTop: "7px" }}>
              <SectionTitle>{lang === "ta" ? "பரிகாரங்கள்" : "Remedies (Pariharam)"}</SectionTitle>
              <div style={{ fontSize: "10px", lineHeight: "17px" }}>
                <strong>{lang === "ta" ? "தேவதை" : "Deity"}:</strong>{" "}
                {lang === "ta" ? sps.remedies.presiding_deity_ta : sps.remedies.presiding_deity}
                {"  |  "}
                <strong>{lang === "ta" ? "நல்ல நாள்" : "Day"}:</strong>{" "}
                {lang === "ta" ? sps.remedies.favorable_day_ta : sps.remedies.favorable_day}
                {"  |  "}
                <strong>{lang === "ta" ? "நிறம் / எண்" : "Color / No."}:</strong>{" "}
                {lang === "ta" ? sps.remedies.lucky_color_ta : sps.remedies.lucky_color} /{" "}
                {sps.remedies.lucky_number}
              </div>
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              fontSize: "8px",
              lineHeight: "14px",
              color: INK_SOFT,
              borderTop: `1px solid var(--jat-gold-25, rgba(170,130,10,0.25))`,
              paddingTop: "6px",
              marginTop: "10px",
            }}
          >
            MYLoginn Astrology — Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePageReport;