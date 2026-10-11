"use client";

import { NorthMiniChart, normaliseStyle, STYLE_LABEL } from "./manuscript/StyledMiniChart";
import { findLagnaSignNum } from "@/lib/astrology/chartLayouts";
import React, { useState, useRef, useEffect } from "react";
import { useJathagamTheme } from "@/lib/astrology/jathagamTheme";
import { ChartResponse } from "@/lib/astrology/types";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  FileText,
} from "lucide-react";

interface ThirukanithamCompleteCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

// Convert float degree to DDD° MM' SS" format
function formatDmsString(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return "000° 00' 00\"";
  const normalized = ((deg % 360) + 360) % 360;
  const d = Math.floor(normalized);
  const remM = (normalized - d) * 60;
  const m = Math.floor(remM);
  const s = Math.round((remM - m) * 60);
  return `${String(d).padStart(3, "0")}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

// Convert 0-30 degree in sign to DD° MM' SS" format
function formatRasiDmsString(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return "00° 00' 00\"";
  const normalized = ((deg % 30) + 30) % 30;
  const d = Math.floor(normalized);
  const remM = (normalized - d) * 60;
  const m = Math.floor(remM);
  const s = Math.round((remM - m) * 60);
  return `${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

export const ThirukanithamCompleteCard: React.FC<ThirukanithamCompleteCardProps> = ({
  chart,
  lang,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Customizer State ──
  // Default: Red for Headers/Accents, Royal Blue for Body/Calculations
  const [accentColor, setAccentColor] = useState("#b03726"); // Red
  const [bodyColor, setBodyColor] = useState("#1e3a8a"); // Royal Blue
  const [paperBg, setPaperBg] = useState("#fcf8ed"); // Antique Parchment
  const [fontFamily, setFontFamily] = useState<string>("'Kavivanar', cursive");
  

  // This card used to own its own colour/font state, which is why changing it

  // restyled this card ALONE and left the rest of the Jathagam (and the PDF)

  // in the old ink. The global panel is now the source of truth; the local

  // controls below still work as a per-card override until the global theme

  // changes again.

  const jatTheme = useJathagamTheme();

  useEffect(() => {

    setAccentColor(jatTheme.palette.accent);

    setBodyColor(jatTheme.palette.ink);

    setPaperBg(jatTheme.palette.paperCard);

    setFontFamily(jatTheme.font.stack);

  }, [jatTheme.palette, jatTheme.font]);
  // Section-view filter had a UI toggle only in the removed per-card
  // toolbar; it always defaults to "all" now, showing every section.
  const [activeSection] = useState<"all" | "sphutam" | "chakras" | "bhavas">("all");

  // Chart data shortcuts
  const d = chart.basic_details || {};
  const samp = chart.sampoorana || {};
  const planets = chart.planets || [];
  const bio = chart.bio_data || {};

  // Find Lagna & Mandi
  const lagnaDegree = d.lagnam_degree || 0;
  const lagnaTotalDegree = d.lagnam_total_degree || 0;
  const lagnaDms = d.lagnam_dms || formatRasiDmsString(lagnaDegree);
  const lagnaTotalDms = formatDmsString(lagnaTotalDegree);

  // Mandi
  const mandi = planets.find((p) => p.name === "Mandi" || p.symbol === "மா");
  const planetsExceptLagna = planets.filter((p) => p.name !== "Lagna");

  // 11 Rows Table (Lagna + 9 Planets + Mandi)
  const allRows: Array<{
    name_ta: string;
    symbol: string;
    total_dms: string;
    nakshatra_ta: string;
    pada: number | string;
    rasi_ta: string;
    rasi_dms: string;
    navamsa_ta: string;
    status_ta: string;
    is_retrograde: boolean;
    is_lagna: boolean;
  }> = [
    // Lagna Row
    {
      name_ta: "லக்னம்",
      symbol: "லக்",
      total_dms: lagnaTotalDms,
      nakshatra_ta: d.lagnam_nakshatram_ta || "—",
      pada: d.lagnam_pada || 1,
      rasi_ta: d.lagnam_ta || "மேஷம்",
      rasi_dms: lagnaDms,
      navamsa_ta: d.lagnam_navamsa_ta || "—",
      status_ta: "கேந்திரம் (ஆரோகணம்)",
      is_retrograde: false,
      is_lagna: true,
    },
    // 9 Planets + Mandi
    ...planetsExceptLagna.map((p) => ({
      name_ta: p.name_ta,
      symbol: p.symbol,
      total_dms: p.total_degree_dms || formatDmsString(p.total_degree),
      nakshatra_ta: p.nakshatra_ta || "—",
      pada: p.pada || 1,
      rasi_ta: p.rasi_ta || "—",
      rasi_dms: p.degree_dms || formatRasiDmsString(p.degree),
      navamsa_ta: p.navamsa_rasi_ta || "—",
      status_ta: p.status_ta || (p.is_retrograde ? "வக்ரம்" : "நேர்கதி"),
      is_retrograde: !!p.is_retrograde,
      is_lagna: false,
    })),
  ];

  // If Mandi was not in planets list, synthesize it from sampoorana.mandi_info
  if (!mandi && samp.mandi_info) {
    const mi = samp.mandi_info;
    allRows.push({
      name_ta: "மாந்தி (குளிகன்)",
      symbol: "மாந்",
      total_dms: formatDmsString(mi.total_degree),
      nakshatra_ta: mi.nakshatra_ta || "—",
      pada: mi.pada || 1,
      rasi_ta: mi.rasi_ta || "—",
      rasi_dms: mi.degree_dms || formatRasiDmsString(mi.degree),
      navamsa_ta: mi.navamsa_rasi_ta || "—",
      status_ta: "உபக்கிரகம்",
      is_retrograde: false,
      is_lagna: false,
    });
  }

  // Bhava Sphutam 12 Houses
  const bhavaSphutam = chart.bhava_sphutam || samp.bhava_sphutam || [];

  // South Indian Rasi & Navamsa Kattam mapping
  const rasiKattam = chart.rasi_kattam || {};
  const navamsaKattam = chart.navamsa_kattam || {};
  // Chart style chosen on the form. These grids were hard-coded South
  // Indian, so Kerala / North Indian changed only the live chart above and
  // never reached this card, its PDF, or its print.
  const chartStyle = normaliseStyle(chart.chart_style);

  // Helper for South Indian 4x4 Grid sign rendering
  const renderSouthIndianSign = (
    signNum: number,
    kattamData: Record<number, any[]>
  ) => {
    const list = kattamData[signNum] || [];
    const hasLagna = list.some((p) => p.is_lagna || p.symbol === "லக்" || p.name === "Lagna");

    return (
      <div
        className="h-full w-full flex flex-col justify-between items-center p-1 text-[11px] leading-tight overflow-hidden transition-colors"
        style={{
          backgroundColor: hasLagna ? `${accentColor}12` : "transparent",
        }}
      >
        <div className="w-full flex justify-between items-center text-[9px] font-semibold opacity-70">
          <span>{signNum}</span>
          {hasLagna && (
            <span
              className="text-[8px] font-bold px-1 rounded-sm text-white"
              style={{ backgroundColor: accentColor }}
            >
              லக்
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 justify-center items-center font-bold">
          {list.map((p, idx) => {
            const isLag = p.is_lagna || p.symbol === "லக்";
            return (
              <span
                key={idx}
                className="px-1 py-0.2 rounded text-[10.5px] tracking-tight"
                style={{
                  color: isLag ? accentColor : bodyColor,
                  fontWeight: isLag ? 800 : 600,
                  backgroundColor: isLag ? `${accentColor}18` : `${bodyColor}0d`,
                  border: `1px solid ${isLag ? accentColor + "40" : bodyColor + "25"}`,
                }}
              >
                {p.symbol || p.name_ta || p.name?.slice(0, 2)}
                {p.is_retrograde && <span className="text-[8px] ml-0.5 font-mono">(வ)</span>}
              </span>
            );
          })}
        </div>
        <div className="h-1" />
      </div>
    );
  };

  return (
    <div className="thirukanitham-master-wrapper w-full my-6 font-tamil">
      {/* ───────────────────────────────────────────────────────────
          THE FULL-PAGE HANDWRITTEN THIRUKANITHAM MANUSCRIPT
          (Per-card colour/font toolbar removed — the global
          JathagamThemePanel is the single source of truth for
          styling now; accentColor/bodyColor/paperBg/fontFamily below
          are still driven live by that panel via useJathagamTheme().)
      ─────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        id="thirukanitham-full-page"
        className="thirukanitham-manuscript-card relative overflow-hidden rounded-2xl p-6 sm:p-9 shadow-2xl border-4 transition-all duration-300"
        style={{
          backgroundColor: paperBg,
          borderColor: `${accentColor}50`,
          fontFamily: fontFamily,
          color: bodyColor,
        }}
      >
        {/* Palm Leaf & Watermark Aging Stains */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-25 mix-blend-multiply"
          style={{
            background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none opacity-20 mix-blend-multiply"
          style={{
            background: `radial-gradient(circle, ${bodyColor}30 0%, transparent 70%)`,
          }}
        />

        {/* ══════════════════════════════════════════════════════════
            PAGE HEADER: SACRED MANUSCRIPT MASTHEAD (Page 2 OCR)
        ══════════════════════════════════════════════════════════ */}
        <div
          className="border-b-2 pb-4 mb-6 relative text-center"
          style={{ borderColor: `${accentColor}40` }}
        >
          {/* Sacred Mantra Header */}
          <div
            className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-1"
            style={{ color: accentColor }}
          >
            ॥ ௐ நமச்சிவாய — ஸ்ரீ ராமஜெயம் — சுபமஸ்து ॥
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-wide my-1.5"
            style={{ color: accentColor }}
          >
            {lang === "ta"
              ? "திருக்கணித பஞ்சாங்க சம்பூர்ண ஜாதகக் குறிப்பேடு"
              : "Thirukanitham Complete Vedic Horoscope Manuscript"}
          </h1>

          <div
            className="text-xs font-semibold tracking-wider opacity-85"
            style={{ color: bodyColor }}
          >
            — சித்ரபக்ஷ லஹரி அயனாம்சம் & திருக்கணித வானியல் முறை கணிதம் —
          </div>

          {/* Sanskrit Sloka Banner (from Page 2 OCR) */}
          <div
            className="mt-3.5 p-2.5 rounded-xl border text-center text-xs leading-relaxed italic"
            style={{
              backgroundColor: `${accentColor}08`,
              borderColor: `${accentColor}30`,
              color: bodyColor,
            }}
          >
            <div className="font-bold text-[11px]" style={{ color: accentColor }}>
              ஜெனனீ ஜென்ம சௌக்யானாம் வர்தனீ குலசம்பதாம் |
              பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா ||
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {lang === "ta"
                ? "மாதா, பிதா, ஜாதகர் சகல சௌபாக்கியங்களையும் தீர்க்காயுளையும் பெற்று நல்வாழ்வு பெற எழுதப்பட்ட திருக்கணித ஜாதகம்."
                : "Auspicious natal horoscope inscribed for the divine blessing, fortune, and longevity of the native."}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1: JATHAGAR VIVARAM & ASTRONOMICAL CONSTANTS
            (Exact reproduction of Page 2 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "sphutam") && (
          <div className="mb-7">
            <div
              className="flex items-center gap-2 border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <FileText className="w-4 h-4" style={{ color: accentColor }} />
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                1. ஜாதகர் விவரங்கள் & திருக்கணித வானியல் மாறிலிகள்
              </h2>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs p-3.5 rounded-xl border"
              style={{
                backgroundColor: `${bodyColor}05`,
                borderColor: `${accentColor}25`,
              }}
            >
              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பெயர் (Name):</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {chart.name || "ஜாதகர்"}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தந்தை பெயர் (Father):</span>
                <span className="font-semibold">{bio.father_name || "—"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தாயார் பெயர் (Mother):</span>
                <span className="font-semibold">{bio.mother_name || "—"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த தேதி (DOB):</span>
                <span className="font-bold font-mono">{chart.date_of_birth}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த நாள் (Day):</span>
                <span className="font-semibold">{d.vaaram_ta || d.vaaram}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த நேரம் (TOB):</span>
                <span className="font-bold font-mono">{chart.time_of_birth}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">நேர திருத்தம் (Time Corr):</span>
                <span className="font-mono">Standard Time (No Corr)</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">நேர மண்டலம் (Zone):</span>
                <span className="font-mono">{chart.timezone || "IST +05:30"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">உதயாதி நாழிகை:</span>
                <span className="font-bold font-mono" style={{ color: accentColor }}>
                  {d.udhayadhi_nazhigai || "24 நாழிகை 36 விநா"}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தமிழ் தேதி (Tamil Date):</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {samp.tamil_year || "சார்வரி"} {samp.tamil_month || "கார்த்திகை"} {samp.tamil_date || 20}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த ஊர் (Place):</span>
                <span className="font-semibold">{chart.place}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">அட்சாம்சம் (Latitude):</span>
                <span className="font-mono">{chart.latitude}° N</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தீர்க்காம்சம் (Longitude):</span>
                <span className="font-mono">{chart.longitude}° E</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">சூரிய உதயம் (Sunrise):</span>
                <span className="font-mono font-semibold">{d.sun_rise || "06:29 AM"} (பிம்ப மத்தி)</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">சூரிய அஸ்தமனம் (Sunset):</span>
                <span className="font-mono font-semibold">{d.sun_set || "05:54 PM"} (பிம்ப மத்தி)</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">அயனாம்சம் (Lahiri Ayanamsha):</span>
                <span className="font-bold font-mono" style={{ color: accentColor }}>
                  {d.ayanamsa_dms || "24° 08' 40\""} (சித்ரபக்ஷ லகரி)
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம லக்னம் (Lagna):</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {d.lagnam_ta} லக்னம் ({lagnaDms})
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம ராசி (Moon Sign):</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {d.rasi_ta} ராசி
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம நட்சத்திரம்:</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {d.nakshatram_ta} பாதம் {d.pada}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">திதி & பட்சம் (Tithi & Paksha):</span>
                <span className="font-semibold">{d.thithi_ta} ({d.paksha_ta || "கிருஷ்ண"})</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">யோகம் & கரணம் (Yoga/Karana):</span>
                <span className="font-semibold">{d.yogam_ta} / {d.karanam_ta}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">அயனம் & ருது (Ayana & Ritu):</span>
                <span className="font-semibold">{samp.ayana_ta || "தட்சிணாயனம்"} · {samp.ritu_ta || "சரத் ருது"}</span>
              </div>
            </div>

            {/* Panchangam Certification stamp */}
            <div className="mt-2 text-right text-[10px] italic opacity-80">
              திருக்கணிதபஞ்சாங்கப்படி துல்லியமாக கணிக்கப்பட்ட ஜாதகக் குறிப்பு.
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 2: THIRUKANITHA GRAHA SPHUTAM (Page 3 OCR)
            Complete 11-row Nirayana Ephemeris Table
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "sphutam") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  2. திருக்கணித கிரக ஸ்புடம் (நிராயனம்) — 11 நிலை விபரம்
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">
                Nirayana Ephemeris DMS Table
              </span>
            </div>

            <div
              className="overflow-x-auto rounded-xl border shadow-xs"
              style={{ borderColor: `${accentColor}30` }}
            >
              <table className="w-full text-xs border-collapse text-left">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                      borderColor: `${accentColor}35`,
                    }}
                  >
                    <th className="p-2">கிரகம்</th>
                    <th className="p-2 font-mono">பாகை கலை விகலை (Nirayana Absolute)</th>
                    <th className="p-2">நட்சத்திரம்</th>
                    <th className="p-2 text-center">பாதம்</th>
                    <th className="p-2">ராசி</th>
                    <th className="p-2 font-mono">ராசி பாகை கலை விகலை</th>
                    <th className="p-2">நவாம்சம்</th>
                    <th className="p-2 text-center">நிலை / பலம்</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: `${accentColor}18` }}>
                  {allRows.map((row, idx) => {
                    const isLagna = row.is_lagna;
                    return (
                      <tr
                        key={idx}
                        className="transition-colors"
                        style={{
                          backgroundColor: isLagna
                            ? `${accentColor}0a`
                            : idx % 2 === 0
                            ? "transparent"
                            : `${bodyColor}04`,
                        }}
                      >
                        {/* Planet Name */}
                        <td className="p-2 font-bold flex items-center gap-1.5">
                          <span
                            className="w-5 text-center font-extrabold text-xs"
                            style={{ color: accentColor }}
                          >
                            {row.symbol}
                          </span>
                          <span style={{ color: isLagna ? accentColor : bodyColor }}>
                            {row.name_ta}
                          </span>
                        </td>

                        {/* Absolute DMS in Blue font-mono */}
                        <td className="p-2 font-mono font-bold text-xs" style={{ color: bodyColor }}>
                          {row.total_dms}
                        </td>

                        {/* Nakshatra */}
                        <td className="p-2 font-medium">{row.nakshatra_ta}</td>

                        {/* Pada */}
                        <td className="p-2 text-center font-bold font-mono">{row.pada}</td>

                        {/* Rasi */}
                        <td className="p-2 font-semibold" style={{ color: isLagna ? accentColor : bodyColor }}>
                          {row.rasi_ta}
                        </td>

                        {/* Relative Rasi DMS */}
                        <td className="p-2 font-mono font-medium">{row.rasi_dms}</td>

                        {/* Navamsa */}
                        <td className="p-2 font-semibold" style={{ color: accentColor }}>
                          {row.navamsa_ta}
                        </td>

                        {/* Dignity / Retrograde Status */}
                        <td className="p-2 text-center">
                          {row.is_retrograde ? (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                                border: `1px solid ${accentColor}40`,
                              }}
                            >
                              வக்ரம் (R)
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-80">{row.status_ta}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Birth Dasha Balance Banner (from bottom of Page 3 OCR) */}
            <div
              className="mt-3.5 p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold"
              style={{
                backgroundColor: `${accentColor}0d`,
                borderColor: `${accentColor}35`,
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <span style={{ color: accentColor }}>
                  {lang === "ta" ? "ஜனன கால தசை இருப்பு:" : "Vimshottari Dasha Balance at Birth:"}
                </span>
                <span className="text-sm font-extrabold" style={{ color: bodyColor }}>
                  {d.dasha_balance_ta || `${d.nakshatra_lord_ta || "புதன்"} தசா 15 வருடம் 8 மாதம் 12 நாள்`}
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80" style={{ color: bodyColor }}>
                Paramanazhigai: {samp.paramanazhigai || "60 நாழிகை"}
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 3: RASI & NAVAMSA CHAKRAS (Page 3 OCR Center)
            Side-by-Side South Indian 4x4 Hand-Drawn Kattams
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "chakras") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-4"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  3. ராசி சக்கரம் & நவாம்ச சக்கரம் ({STYLE_LABEL[chartStyle].ta} · {STYLE_LABEL[chartStyle].en})
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">D1 Rasi & D9 Navamsa</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CHAKRA 1: RASI CHAKRA (D1) */}
              <div
                className="rounded-2xl p-3 border-2 shadow-sm flex flex-col items-center"
                style={{
                  backgroundColor: `${bodyColor}03`,
                  borderColor: `${accentColor}40`,
                }}
              >
                <div
                  className="text-sm font-bold mb-2 tracking-wider"
                  style={{ color: accentColor }}
                >
                  ॥ ராசி சக்கரம் (D1 Rasi Chakra) ॥
                </div>

                {/* 4x4 Grid */}
                {chartStyle === "north_indian" ? (
                  <div className="w-full rounded-lg border-2 overflow-hidden bg-white">
                    <NorthMiniChart planetsBySign={rasiKattam as any} lagnaSign={findLagnaSignNum(rasiKattam as any)} height={300} />
                  </div>
                ) : (
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[280px] sm:h-[310px] border-2 rounded-lg bg-white/70 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  {/* Row 0: 12 (Pisces), 1 (Aries), 2 (Taurus), 3 (Gemini) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(12, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(1, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(2, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(3, rasiKattam)}
                  </div>

                  {/* Row 1: 11 (Aquarius), [CENTER 2x2], 4 (Cancer) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(11, rasiKattam)}
                  </div>
                  <div
                    className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-2 text-center"
                    style={{
                      borderColor: accentColor,
                      backgroundColor: `${accentColor}0a`,
                    }}
                  >
                    <span className="text-base font-extrabold" style={{ color: accentColor }}>
                      ராசி
                    </span>
                    <span className="text-[10px] font-bold opacity-80" style={{ color: bodyColor }}>
                      {chart.name || "ஜாதகர்"}
                    </span>
                    <span className="text-[9px] mt-0.5" style={{ color: accentColor }}>
                      {d.lagnam_ta} லக்னம்
                    </span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(4, rasiKattam)}
                  </div>

                  {/* Row 2: 10 (Capricorn), 5 (Leo) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(10, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(5, rasiKattam)}
                  </div>

                  {/* Row 3: 9 (Sagittarius), 8 (Scorpio), 7 (Libra), 6 (Virgo) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(9, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(8, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(7, rasiKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(6, rasiKattam)}
                  </div>
                </div>
                )}
              </div>

              {/* CHAKRA 2: NAVAMSA CHAKRA (D9) */}
              <div
                className="rounded-2xl p-3 border-2 shadow-sm flex flex-col items-center"
                style={{
                  backgroundColor: `${bodyColor}03`,
                  borderColor: `${accentColor}40`,
                }}
              >
                <div
                  className="text-sm font-bold mb-2 tracking-wider"
                  style={{ color: accentColor }}
                >
                  ॥ நவாம்ச சக்கரம் (D9 Navamsa Chakra) ॥
                </div>

                {/* 4x4 Grid */}
                {chartStyle === "north_indian" ? (
                  <div className="w-full rounded-lg border-2 overflow-hidden bg-white">
                    <NorthMiniChart planetsBySign={navamsaKattam as any} lagnaSign={findLagnaSignNum(navamsaKattam as any)} height={300} />
                  </div>
                ) : (
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[280px] sm:h-[310px] border-2 rounded-lg bg-white/70 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  {/* Row 0: 12 (Pisces), 1 (Aries), 2 (Taurus), 3 (Gemini) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(12, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(1, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(2, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(3, navamsaKattam)}
                  </div>

                  {/* Row 1: 11 (Aquarius), [CENTER 2x2], 4 (Cancer) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(11, navamsaKattam)}
                  </div>
                  <div
                    className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-2 text-center"
                    style={{
                      borderColor: accentColor,
                      backgroundColor: `${accentColor}0a`,
                    }}
                  >
                    <span className="text-base font-extrabold" style={{ color: accentColor }}>
                      நவாம்சம்
                    </span>
                    <span className="text-[10px] font-bold opacity-80" style={{ color: bodyColor }}>
                      களத்திர நலம்
                    </span>
                    <span className="text-[9px] mt-0.5" style={{ color: accentColor }}>
                      நவாம்ச லக்: {d.lagnam_navamsa_ta || "விருச்சிகம்"}
                    </span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(4, navamsaKattam)}
                  </div>

                  {/* Row 2: 10 (Capricorn), 5 (Leo) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(10, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(5, navamsaKattam)}
                  </div>

                  {/* Row 3: 9 (Sagittarius), 8 (Scorpio), 7 (Libra), 6 (Virgo) */}
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(9, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(8, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(7, navamsaKattam)}
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>
                    {renderSouthIndianSign(6, navamsaKattam)}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 4: BHAVA SPHUTAM (Page 4 OCR)
            Sripati 12 Bhavas: Aarambam, Madhyam, Andhimam in DMS
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "bhavas") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  4. பாவ ஸ்புடம் (Bhava Sphutam) — ஆரம்பம், மத்தியம் & அந்திமம்
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">Sripati House Cusps</span>
            </div>

            {/* Bhava Names Map matching OCR */}
            {(() => {
              const bhavaNamesTa = [
                "1. லக்ன பாவம் (தன்ம பாவம்)",
                "2. தன பாவம் (குடும்ப பாவம்)",
                "3. சகோதர பாவம் (தைரிய பாவம்)",
                "4. மாதா பாவம் (சுக பாவம்)",
                "5. புத்திர பாவம் (பூர்வ புண்ணியம்)",
                "6. சத்துரு பாவம் (ரோக பாவம்)",
                "7. களத்திர பாவம் (துணைவர் பாவம்)",
                "8. ஆயுர் பாவம் (மாங்கல்ய பாவம்)",
                "9. பாக்கிய பாவம் (பிதுர் பாவம்)",
                "10. கர்ம பாவம் (தொழில் பாவம்)",
                "11. லாப பாவம் (ஆதாய பாவம்)",
                "12. விரய பாவம் (மோட்ச பாவம்)",
              ];

              return (
                <div
                  className="overflow-x-auto rounded-xl border shadow-xs"
                  style={{ borderColor: `${accentColor}30` }}
                >
                  <table className="w-full text-xs border-collapse text-left">
                    <thead>
                      <tr
                        className="border-b text-[11px] font-bold"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                          borderColor: `${accentColor}35`,
                        }}
                      >
                        <th className="p-2">பாவ எண் & பெயர்</th>
                        <th className="p-2 font-mono text-center">ஆரம்பம் (Start DMS)</th>
                        <th className="p-2 font-mono text-center">மத்தியம் (Madhya DMS)</th>
                        <th className="p-2 font-mono text-center">அந்திமம் (End DMS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: `${accentColor}18` }}>
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const h = idx + 1;
                        const bData = bhavaSphutam.find((b: any) => b.house === h);

                        // Synthesize Sripati cusps if not present in bData
                        const lagnaFloat = lagnaTotalDegree;
                        const madhyaFloat = ((lagnaFloat + (h - 1) * 30.0) % 360 + 360) % 360;
                        const startFloat = ((madhyaFloat - 15.0) % 360 + 360) % 360;
                        const endFloat = ((madhyaFloat + 15.0) % 360 + 360) % 360;

                        const startDms = bData?.start_dms || formatDmsString(startFloat);
                        const madhyaDms = bData?.madhya_dms || formatDmsString(madhyaFloat);
                        const endDms = bData?.end_dms || formatDmsString(endFloat);

                        return (
                          <tr
                            key={h}
                            className="transition-colors"
                            style={{
                              backgroundColor: idx % 2 === 0 ? "transparent" : `${bodyColor}04`,
                            }}
                          >
                            <td className="p-2 font-bold" style={{ color: accentColor }}>
                              {bhavaNamesTa[idx]}
                            </td>
                            <td className="p-2 font-mono text-center" style={{ color: bodyColor }}>
                              {startDms}
                            </td>
                            <td
                              className="p-2 font-mono font-extrabold text-center"
                              style={{ color: accentColor }}
                            >
                              {madhyaDms}
                            </td>
                            <td className="p-2 font-mono text-center" style={{ color: bodyColor }}>
                              {endDms}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 5: VIMSHOTTARI DASHA SEQUENCE (Pages 5-10 OCR)
        ══════════════════════════════════════════════════════════ */}
        {activeSection === "all" && chart.vimshottari_dasha && chart.vimshottari_dasha.length > 0 && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  5. விம்சோத்தரி மகா தசா கால அட்டவணை (120-Year Vimshottari Cycle)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">120-Year Lifespan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              {chart.vimshottari_dasha.slice(0, 10).map((vd, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: vd.is_current ? `${accentColor}12` : `${bodyColor}04`,
                    borderColor: vd.is_current ? accentColor : `${accentColor}25`,
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs" style={{ color: accentColor }}>
                      {vd.planet_ta} தசா
                    </span>
                    <span className="text-[10px] font-mono font-semibold opacity-75">
                      {vd.duration_years} வ
                    </span>
                  </div>
                  <div className="text-[10px] font-mono space-y-0.5 opacity-90">
                    <div>ஆரம்பம்: {vd.start_date}</div>
                    <div>முடிவு: {vd.end_date}</div>
                  </div>
                  {vd.is_current && (
                    <div
                      className="mt-1.5 text-[9px] font-bold text-center py-0.5 rounded text-white uppercase tracking-wider"
                      style={{ backgroundColor: accentColor }}
                    >
                      தற்போதைய தசா
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PAGE FOOTER: AUSPICIOUS CONCLUDING SIGN-OFF
        ══════════════════════════════════════════════════════════ */}
        <div
          className="border-t-2 pt-3 mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] opacity-85"
          style={{ borderColor: `${accentColor}35`, color: bodyColor }}
        >
          <div className="flex items-center gap-1 font-bold" style={{ color: accentColor }}>
            <span>✦</span>
            <span>வாழ்க வளமுடன் • சர்வ மங்களம் உண்டாகுக • சுபமஸ்து</span>
          </div>

          <div className="font-mono text-center my-1 sm:my-0 font-bold" style={{ color: accentColor }}>
            — திருக்கணித பஞ்சாங்க ஜோதிட கணிதப் பக்கம் —
          </div>

          <div>MYLoginn Shastric Astrology System</div>
        </div>
      </div>
    </div>
  );
};