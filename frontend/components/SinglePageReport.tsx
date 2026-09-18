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
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CalendarClock,
  Gem,
  Briefcase,
  Heart,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import { SinglePagePdfButton } from "./SinglePagePdfButton";

interface SinglePageReportProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  heart: Heart,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
};

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

// ---------------------------------------------------------------------
// South Indian fixed-sign box grid — same geometry for Tamil & Kerala
// (see lib/chartLayouts.ts citation: both use the identical fixed-sign
// grid, only the ink/accent colour differs). Colours come from
// CHART_STYLE_THEMES so this actually responds to the selected style,
// unlike the earlier hardcoded-colour version.
// ---------------------------------------------------------------------
const SouthIndianMiniChart: React.FC<{
  titleTa: string;
  planetsBySign: Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>>;
  theme: ReturnType<typeof themeFor>;
}> = ({ titleTa, planetsBySign, theme }) => {
  const cell = (signNum: number) => {
    const list = planetsBySign[signNum] || [];
    return (
      <div
        style={{ borderColor: `${theme.ink}55` }}
        className="border p-0.5 h-full flex flex-col justify-start items-center text-[9px] leading-tight overflow-hidden"
      >
        <div className="flex flex-wrap gap-0.5 justify-center items-center font-bold">
          {list.map((p, idx) => (
            <span
              key={idx}
              style={
                p.is_lagna
                  ? { background: theme.accent, color: "#fff" }
                  : { background: "#fffaf0", border: `1px solid ${theme.ink}33`, color: theme.ink }
              }
              className="px-0.5 rounded"
            >
              {p.symbol || p.name.slice(0, 2)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ borderColor: theme.ink, background: `${theme.paper}f2` }}
      className="border-2 rounded-lg p-1.5 shadow-sm"
    >
      <div style={{ color: theme.accent }} className="text-center font-bold text-[11px] mb-1 leading-none">
        {titleTa}
      </div>
      <div style={{ borderColor: theme.ink }} className="grid grid-cols-4 grid-rows-4 border w-full h-[155px] text-center">
        {cell(12)}
        {cell(1)}
        {cell(2)}
        {cell(3)}
        {cell(11)}
        <div
          style={{ borderColor: theme.ink, background: theme.paper }}
          className="col-span-2 row-span-2 border flex flex-col items-center justify-center p-1"
        >
          <span style={{ color: theme.accent }} className="text-[10px] font-bold leading-tight">{titleTa}</span>
        </div>
        {cell(4)}
        {cell(10)}
        {cell(5)}
        {cell(9)}
        {cell(8)}
        {cell(7)}
        {cell(6)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// North Indian fixed-house diamond grid — reuses the exact same
// geometry (NORTH_INDIAN_HOUSES / signForNorthIndianHouse) as the main
// chart canvas, so the single-page report finally matches what the
// full-mode Rasi/Navamsa charts draw for "north_indian".
// ---------------------------------------------------------------------
const NorthIndianMiniChart: React.FC<{
  titleTa: string;
  planetsBySign: Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>>;
  lagnaSignNum: number;
  theme: ReturnType<typeof themeFor>;
}> = ({ titleTa, planetsBySign, lagnaSignNum, theme }) => {
  return (
    <div
      style={{ borderColor: theme.ink, background: `${theme.paper}f2` }}
      className="border-2 rounded-lg p-1.5 shadow-sm"
    >
      <div style={{ color: theme.accent }} className="text-center font-bold text-[11px] mb-1 leading-none">
        {titleTa}
      </div>
      <div className="w-full h-[155px] flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full">
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
                <text
                  x={h.labelX}
                  y={h.labelY - 14}
                  textAnchor="middle"
                  fontSize={13}
                  fill={`${theme.ink}90`}
                >
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
    </div>
  );
};

function themeFor(style: string) {
  const key = (style === "kerala" || style === "north_indian" ? style : "tamil") as ChartStyle;
  return CHART_STYLE_THEMES[key];
}

const MiniChart: React.FC<{
  titleTa: string;
  chartStyle: string;
  planetsBySign: Record<number, Array<{ name: string; symbol: string; is_lagna?: boolean }>>;
  lagnaSignNum: number;
}> = ({ titleTa, chartStyle, planetsBySign, lagnaSignNum }) => {
  const theme = themeFor(chartStyle);
  if (chartStyle === "north_indian") {
    return (
      <NorthIndianMiniChart
        titleTa={titleTa}
        planetsBySign={planetsBySign}
        lagnaSignNum={lagnaSignNum}
        theme={theme}
      />
    );
  }
  return <SouthIndianMiniChart titleTa={titleTa} planetsBySign={planetsBySign} theme={theme} />;
};

/**
 * Single-Page Jathagam — one printable A4 sheet, styled to match the
 * palm-leaf manuscript theme, reusing the SAME chart geometry
 * (South Indian fixed-sign grid for Tamil/Kerala, North Indian diamond
 * for north_indian — from lib/chartLayouts.ts) that the full 12-section
 * report already uses, so switching chart style on the intake form now
 * actually changes what's drawn here too.
 *
 * Nothing here recomputes astrology — every field comes from `chart`
 * (basic_details, planets, rasi_kattam/navamsa_kattam, vimshottari_dasha,
 * doshas, single_page_summary). This is layout only.
 */
export const SinglePageReport: React.FC<SinglePageReportProps> = ({ chart, lang }) => {
  const bd = chart.basic_details;
  const sps = chart.single_page_summary;
  const st = sps?.saturn_transit;

  const lagnaSignNum = findLagnaSignNum(chart.rasi_kattam as any);
  const rasiPlanetsBySign = toPlanetsBySign(chart.rasi_kattam as any);
  const navamsaPlanetsBySign = toPlanetsBySign(chart.navamsa_kattam as any);

  const tableRows = chart.planets;

  const doshaChips = chart.doshas.map((d) => ({
    name: lang === "ta" ? d.name_ta : d.name,
    present: d.present,
  }));

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg sm:text-xl font-bold font-script text-[#2b2117] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#b03726]" />
          {lang === "ta" ? "சுருக்க ஜாதகம் (ஒரு பக்கம்)" : "Single-Page Jathagam"}
        </h2>
        <SinglePagePdfButton chart={chart} lang={lang} />
      </div>

      {/* The single printable/exportable sheet */}
      <div className="flex justify-center">
        <div
          id="single-page-report"
          className="manuscript-page-single relative"
          style={{
            width: "794px",
            background: "#fdf6e3",
            border: "2px solid rgba(170,130,10,0.4)",
            borderRadius: "6px",
            padding: "28px 34px 40px",
            boxSizing: "border-box",
            color: "#2b2117",
            fontFamily: "'Kavivanar', 'Noto Sans Tamil', sans-serif",
          }}
        >
          {/* aged paper corner marks */}
          <div className="absolute top-2 left-2 text-[#aa820a]">⚜</div>
          <div className="absolute top-2 right-2 text-[#aa820a]">⚜</div>
          <div className="absolute bottom-2 left-2 text-[#aa820a]">⚜</div>
          <div className="absolute bottom-2 right-2 text-[#aa820a]">⚜</div>

          {/* Header */}
          <div className="text-center border-b-2 border-[#aa820a]/40 pb-2 mb-3">
            <div className="text-[#8e2b1c] text-lg font-bold">ௐ ॥ ஸ்ரீ ராமஜெயம் ॥</div>
            <h1 className="text-2xl font-bold text-[#8e2b1c] mt-1">
              {lang === "ta" ? "சுருக்க ஜாதகம்" : "Single-Page Jathagam"}
            </h1>
            <p className="text-[10px] text-[#6f6049] uppercase tracking-widest mt-0.5">
              {chart.panchangam_system === "vakhyam"
                ? "வாக்கிய பஞ்சாங்கம் (VAKHYAM)"
                : "திருக்கணித பஞ்சாங்கம் (THIRUKANITHAM) — DRIK-SIDDHA"}
            </p>
          </div>

          {/* Identity + Birth Details */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="border border-[#aa820a]/30 rounded-lg p-2 bg-[#fffaf0]/70">
              <p><strong>{lang === "ta" ? "பெயர்" : "Name"}:</strong> {chart.name}</p>
              <p><strong>{lang === "ta" ? "பிறந்த தேதி" : "DOB"}:</strong> {chart.date_of_birth}</p>
              <p><strong>{lang === "ta" ? "பிறந்த நேரம்" : "TOB"}:</strong> {chart.time_of_birth}</p>
              <p><strong>{lang === "ta" ? "இடம்" : "Place"}:</strong> {chart.place}</p>
            </div>
            <div className="border border-[#aa820a]/30 rounded-lg p-2 bg-[#fffaf0]/70">
              <p><strong>{lang === "ta" ? "லக்னம்" : "Lagnam"}:</strong> {lang === "ta" ? bd.lagnam_ta : bd.lagnam}</p>
              <p><strong>{lang === "ta" ? "ராசி" : "Rasi"}:</strong> {lang === "ta" ? bd.rasi_ta : bd.rasi}</p>
              <p><strong>{lang === "ta" ? "நட்சத்திரம்" : "Nakshatram"}:</strong> {lang === "ta" ? bd.nakshatram_ta : bd.nakshatram} ({lang === "ta" ? "பாதம்" : "Pada"} {bd.pada})</p>
              <p><strong>{lang === "ta" ? "திதி / யோகம் / கரணம்" : "Thithi/Yogam/Karanam"}:</strong> {lang === "ta" ? bd.thithi_ta : bd.thithi} / {lang === "ta" ? bd.yogam_ta : bd.yogam} / {lang === "ta" ? bd.karanam_ta : bd.karanam}</p>
            </div>
          </div>

          {/* Sunrise/Sunset/Ayanamsa/Dasa Balance strip */}
          <div className="grid grid-cols-4 gap-2 text-[10px] mb-3">
            <MiniFact label={lang === "ta" ? "சூரிய உதயம்" : "Sunrise"} value={bd.sun_rise || "—"} />
            <MiniFact label={lang === "ta" ? "சூரிய அஸ்தமனம்" : "Sunset"} value={bd.sun_set || "—"} />
            <MiniFact label={lang === "ta" ? "அயனாம்சம்" : "Ayanamsa"} value={bd.ayanamsa_dms || bd.ayanamsa_value?.toFixed(2) || "—"} />
            <MiniFact
              label={lang === "ta" ? "இருப்பு தசை" : "Dasa Balance"}
              value={(lang === "ta" ? bd.dasha_balance_ta : bd.dasha_balance_en) || "—"}
            />
          </div>

          {/* Charts row: Rasi + Navamsa — now responds to chart.chart_style */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <MiniChart
              titleTa={`${lang === "ta" ? "ராசி கட்டம் (D1)" : "Rasi (D1)"}`}
              chartStyle={chart.chart_style}
              planetsBySign={rasiPlanetsBySign}
              lagnaSignNum={lagnaSignNum}
            />
            <MiniChart
              titleTa={`${lang === "ta" ? "நவாம்சம் (D9)" : "Navamsa (D9)"}`}
              chartStyle={chart.chart_style}
              planetsBySign={navamsaPlanetsBySign}
              lagnaSignNum={lagnaSignNum}
            />
          </div>

          {/* Graha Sphutam — compact 11-row planetary table */}
          <div className="mb-3">
            <p className="text-xs font-bold text-[#8e2b1c] mb-1">
              {lang === "ta" ? "கிரக ஸ்புடம் (Planetary Positions)" : "Graha Sphutam (Planetary Positions)"}
            </p>
            <table className="w-full text-[9.5px] border-collapse">
              <thead>
                <tr className="bg-[#8e2b1c]/10 text-[#8e2b1c] font-bold">
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "கிரகம்" : "Planet"}</th>
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "ராசி" : "Sign"}</th>
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "பாகை" : "Deg"}</th>
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "நட்சத்திரம்" : "Nakshatra"}</th>
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "பாதம்" : "Pada"}</th>
                  <th className="border border-[#aa820a]/30 py-0.5">{lang === "ta" ? "இல்லம்" : "House"}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((p: any, idx: number) => (
                  <tr key={idx} className={p.is_lagna ? "bg-[#d4af37]/15 font-bold" : idx % 2 === 0 ? "bg-white/40" : ""}>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center">
                      {lang === "ta" ? p.name_ta : p.name}
                    </td>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center">
                      {lang === "ta" ? p.rasi_ta : p.rasi}
                    </td>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center font-mono">
                      {typeof p.degree === "number" ? p.degree.toFixed(2) + "°" : p.degree_dms || "—"}
                      {p.is_retrograde ? " (வ)" : ""}
                    </td>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center">
                      {lang === "ta" ? p.nakshatra_ta : p.nakshatra}
                    </td>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center">{p.pada ?? "—"}</td>
                    <td className="border border-[#aa820a]/20 py-0.5 text-center">{p.house ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Current Dasa/Bhukti micro-prediction */}
          {sps?.current_period && (
            <div className="mb-3 border border-[#aa820a]/30 rounded-lg p-2 bg-[#fffaf0]/70">
              <p className="text-xs font-bold text-[#8e2b1c] flex items-center gap-1 mb-1">
                <CalendarClock className="w-3.5 h-3.5" />
                {lang === "ta" ? "தற்போதைய திசை - புக்தி" : "Current Dasa / Bhukti"}
              </p>
              <p className="text-[10.5px]">
                <strong>
                  {lang === "ta" ? sps.current_period.mahadasha_lord_ta : sps.current_period.mahadasha_lord}
                </strong>{" "}
                {lang === "ta" ? "மகா திசை" : "Mahadasha"} ({sps.current_period.mahadasha_start} → {sps.current_period.mahadasha_end}) —{" "}
                <strong>
                  {lang === "ta" ? sps.current_period.bhukti_lord_ta : sps.current_period.bhukti_lord}
                </strong>{" "}
                {lang === "ta" ? "புக்தி" : "Bhukti"} ({sps.current_period.bhukti_start} → {sps.current_period.bhukti_end})
              </p>
              <p className="text-[10px] text-[#6f6049] mt-1">
                {lang === "ta" ? sps.current_period.micro_prediction_ta : sps.current_period.micro_prediction}
              </p>
            </div>
          )}

          {/* Dosha chips + Saturn transit */}
          <div className="mb-3">
            <p className="text-xs font-bold text-[#8e2b1c] mb-1">
              {lang === "ta" ? "தோஷ பரிசோதனை" : "Dosha Checklist"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {doshaChips.map((d, i) => (
                <span
                  key={i}
                  className={`text-[9.5px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    d.present ? "bg-rose-100 border-rose-400 text-rose-800" : "bg-emerald-100 border-emerald-400 text-emerald-800"
                  }`}
                >
                  {d.present ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {d.name}
                </span>
              ))}
              {st && (
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    st.present
                      ? "bg-rose-100 border-rose-400 text-rose-800"
                      : st.is_upcoming
                      ? "bg-amber-100 border-amber-400 text-amber-800"
                      : "bg-emerald-100 border-emerald-400 text-emerald-800"
                  }`}
                >
                  {st.present ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {lang === "ta" ? st.name_ta : st.name}
                </span>
              )}
            </div>
          </div>

          {/* Life Scorecard — compact bars */}
          {sps?.life_scorecard && sps.life_scorecard.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-[#8e2b1c] mb-1">
                {lang === "ta" ? "வாழ்க்கை மதிப்பீடு" : "Life Scorecard"}
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {sps.life_scorecard.map((cat: any, idx: number) => {
                  const Icon = CATEGORY_ICONS[cat.icon] || Sparkles;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="flex items-center gap-1 font-semibold">
                          <Icon className="w-3 h-3 text-[#8e2b1c]" />
                          {lang === "ta" ? cat.category_ta : cat.category}
                        </span>
                        <span className="text-[#6f6049]">{lang === "ta" ? cat.rating_ta : cat.rating}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#e5d9b8] overflow-hidden">
                        <div
                          className="h-full bg-[#b03726]"
                          style={{ width: `${Math.max(4, cat.score_percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remedies */}
          {sps?.remedies && (
            <div className="border-t-2 border-[#aa820a]/30 pt-2">
              <p className="text-xs font-bold text-[#8e2b1c] mb-1 flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" />
                {lang === "ta" ? "பரிகாரங்கள்" : "Remedies (Pariharam)"}
              </p>
              <p className="text-[10px] leading-snug">
                <strong>{lang === "ta" ? "தேவதை" : "Deity"}:</strong>{" "}
                {lang === "ta" ? sps.remedies.presiding_deity_ta : sps.remedies.presiding_deity} &nbsp;|&nbsp;
                <strong>{lang === "ta" ? "நல்ல நாள்" : "Day"}:</strong>{" "}
                {lang === "ta" ? sps.remedies.favorable_day_ta : sps.remedies.favorable_day} &nbsp;|&nbsp;
                <strong>{lang === "ta" ? "நிறம்/எண்" : "Color/No."}:</strong>{" "}
                {lang === "ta" ? sps.remedies.lucky_color_ta : sps.remedies.lucky_color} / {sps.remedies.lucky_number}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[8px] text-[#6f6049] mt-3 pt-2 border-t border-[#aa820a]/20">
            MYLoginn Astrology — Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniFact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md bg-[#fffaf0]/70 border border-[#aa820a]/25 p-1.5 text-center">
    <p className="text-[8.5px] text-[#8e2b1c]/80 uppercase tracking-wide">{label}</p>
    <p className="text-[10px] font-bold">{value}</p>
  </div>
);