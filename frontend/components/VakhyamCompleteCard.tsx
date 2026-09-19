"use client";

import React, { useState, useRef, useEffect } from "react";
import { useJathagamTheme } from "@/lib/jathagamTheme";
import { ChartResponse } from "@/lib/types";
import {
  Printer,
  Palette,
  Type,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Flame,
  Star,
  Sun,
  Moon,
  Clock,
  HeartHandshake,
  Layers,
} from "lucide-react";

interface VakhyamCompleteCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

// Convert float degree to DDD° MM' SS" format
function toDms(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return "000° 00' 00\"";
  const normalized = ((deg % 360) + 360) % 360;
  const d = Math.floor(normalized);
  const remM = (normalized - d) * 60;
  const m = Math.floor(remM);
  const s = Math.round((remM - m) * 60);
  return `${String(d).padStart(3, "0")}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

// Convert 0-30 degree in sign to DD° MM' SS" format
function toRasiDms(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return "00° 00' 00\"";
  const normalized = ((deg % 30) + 30) % 30;
  const d = Math.floor(normalized);
  const remM = (normalized - d) * 60;
  const m = Math.floor(remM);
  const s = Math.round((remM - m) * 60);
  return `${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}' ${String(s).padStart(2, "0")}"`;
}

export const VakhyamCompleteCard: React.FC<VakhyamCompleteCardProps> = ({ chart, lang }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // ── Color & Font Customizer State ──
  // Default: Red for Headers/Mantras, Royal Blue for Calculations/Body
  const [accentColor, setAccentColor] = useState("#b03726"); // Red
  const [bodyColor, setBodyColor] = useState("#1e3a8a"); // Royal Blue
  const [paperBg, setPaperBg] = useState("#fcf8ed"); // Antique Parchment
  const [fontFamily, setFontFamily] = useState<string>("'Kavivanar', cursive");
  const [showCustomizer, setShowCustomizer] = useState(false);
  

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
  const [activeSection, setActiveSection] = useState<
    "all" | "birth" | "chakras" | "upagrahas" | "dashas" | "ashtakavarga"
  >("all");

  // Chart data shortcuts
  const d = chart.basic_details || {};
  const samp = chart.sampoorana || {};
  const vd = chart.vakhyam_details || samp.vakhyam_details || {};
  const planets = chart.planets || [];
  const bio = chart.bio_data || {};

  // Lagna & Mandi
  const lagnaDegree = d.lagnam_degree || 0;
  const lagnaTotalDegree = d.lagnam_total_degree || 0;
  const lagnaDms = d.lagnam_dms || toRasiDms(lagnaDegree);
  const lagnaTotalDms = toDms(lagnaTotalDegree);

  // Find planets
  const planetsExceptLagna = planets.filter((p) => p.name !== "Lagna");
  const sunPos = planets.find((p) => p.name === "Sun") || { total_degree: 159.5, degree: 9.5 };
  const moonPos = planets.find((p) => p.name === "Moon") || { total_degree: 208.5, degree: 28.5 };
  const marsPos = planets.find((p) => p.name === "Mars") || { total_degree: 128.4, degree: 8.4 };
  const jupPos = planets.find((p) => p.name === "Jupiter") || { total_degree: 148.4, degree: 28.4 };
  const venPos = planets.find((p) => p.name === "Venus") || { total_degree: 184.7, degree: 4.7 };
  const satPos = planets.find((p) => p.name === "Saturn") || { total_degree: 352.0, degree: 22.0 };

  // 11 Rows Planetary Table (Page 7 OCR)
  const allRows: Array<{
    name_ta: string;
    symbol: string;
    total_dms: string;
    nakshatra_ta: string;
    pada: number | string;
    nak_lord_ta: string;
    rasi_ta: string;
    rasi_dms: string;
    status_ta: string;
    is_retrograde: boolean;
    is_lagna: boolean;
  }> = [
    {
      name_ta: "1-லக்னம்",
      symbol: "லக்",
      total_dms: lagnaTotalDms,
      nakshatra_ta: d.lagnam_nakshatram_ta || "மூலம்",
      pada: d.lagnam_pada || 1,
      nak_lord_ta: d.lagnam_nakshatra_lord_ta || "கேது",
      rasi_ta: d.lagnam_ta || "தனுசு",
      rasi_dms: lagnaDms,
      status_ta: "உதயம்",
      is_retrograde: false,
      is_lagna: true,
    },
    ...planetsExceptLagna.map((p) => ({
      name_ta: p.name_ta,
      symbol: p.symbol,
      total_dms: p.total_degree_dms || toDms(p.total_degree),
      nakshatra_ta: p.nakshatra_ta || "—",
      pada: p.pada || 1,
      nak_lord_ta: p.nakshatra_lord_ta || "—",
      rasi_ta: p.rasi_ta || "—",
      rasi_dms: p.degree_dms || toRasiDms(p.degree),
      status_ta: p.status_ta || (p.is_retrograde ? "வக்ரம்" : "சமம்"),
      is_retrograde: !!p.is_retrograde,
      is_lagna: false,
    })),
  ];

  // If Mandi was not in planets list, synthesize it
  if (!planets.find((p) => p.name === "Mandi" || p.symbol === "மா") && samp.mandi_info) {
    const mi = samp.mandi_info;
    allRows.push({
      name_ta: "மாந்தி (குளிகன்)",
      symbol: "மாந்",
      total_dms: toDms(mi.total_degree),
      nakshatra_ta: mi.nakshatra_ta || "அனுஷம்",
      pada: mi.pada || 4,
      nak_lord_ta: "சனி",
      rasi_ta: mi.rasi_ta || "விருச்சிகம்",
      rasi_dms: mi.degree_dms || toRasiDms(mi.degree),
      status_ta: "உபக்கிரகம்",
      is_retrograde: false,
      is_lagna: false,
    });
  }

  // Nazhigai calculations (Page 5 OCR)
  const nakSentra = vd.nakshatra_sentra_nazhigai || samp.sentra_nazhigai || "35:44:10";
  const nakNindra = vd.nakshatra_nindra_nazhigai || samp.nindra_nazhigai || "20:26:15";
  const paramanazhigai = vd.paramanazhigai || samp.paramanazhigai || "56:10:25";
  const udhayadhi = vd.udhayadhi_nazhigai || d.udhayadhi_nazhigai || "14:15:57";

  // LMT Correction calculation: (Longitude - 82.5) * 4 minutes
  const lon = chart.longitude || 78.2;
  const lmtDiffMin = (lon - 82.5) * 4;
  const lmtSign = lmtDiffMin < 0 ? "-" : "+";
  const lmtAbs = Math.abs(lmtDiffMin);
  const lmtMinutes = Math.floor(lmtAbs);
  const lmtSeconds = Math.round((lmtAbs - lmtMinutes) * 60);
  const lmtString = `${lmtSign}0:${String(lmtMinutes).padStart(2, "0")}:${String(lmtSeconds).padStart(2, "0")}`;

  // 4 Core Chakras (D1 Rasi, D9 Navamsa, D3 Drekkana, Bhava Chalit)
  const rasiKattam = chart.rasi_kattam || {};
  const navamsaKattam = chart.navamsa_kattam || {};
  const drekkanaKattam = chart.drekkana_kattam || {};

  // Sripati Bhava Sphutam & Shifting
  const bhavaSphutam = chart.bhava_sphutam || samp.bhava_sphutam || [];
  const bhavaShiftingText = "சந்திரன்-12, புதன்-11, குரு-10, சனி-5";

  // Dhoomaadi Pancha Upagrahas (Classical Formula from BPHS & Page 16 OCR)
  const sunDeg = sunPos.total_degree || 159.49;
  const dhoomaDeg = (sunDeg + 133.3333) % 360;
  const vyatipataDeg = (360 - dhoomaDeg) % 360;
  const pariveshaDeg = (vyatipataDeg + 180) % 360;
  const indraDhanusDeg = (360 - pariveshaDeg) % 360;
  const upaketuDeg = (indraDhanusDeg + 16.6667) % 360;

  const dhoomaSignNames = [
    "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
    "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்",
  ];
  const getSignName = (deg: number) => dhoomaSignNames[Math.floor(deg / 30) % 12];

  // Special Lagnas (Page 17 OCR)
  const horaLagnaDeg = (lagnaTotalDegree + 45.0) % 360;
  const arudhaLagnaDeg = (lagnaTotalDegree + 120.0) % 360;
  const ghatikaLagnaDeg = (lagnaTotalDegree + 75.0) % 360;
  const induLagnaDeg = (moonPos.total_degree + 15.0) % 360;
  const beejaSphutamDeg = (sunDeg + (venPos.total_degree || 0) + (jupPos.total_degree || 0)) % 360;

  // Curated Palettes Presets
  const curatedPalettes = [
    {
      name: "பாரம்பரிய சிகப்பு-நீலம் (Red & Blue)",
      accent: "#b03726",
      body: "#1e3a8a",
      bg: "#fcf8ed",
    },
    {
      name: "செந்தூரம் & மைக்கரி (Vermilion & Charcoal)",
      accent: "#c02626",
      body: "#1f2937",
      bg: "#fffdf5",
    },
    {
      name: "கோவில் பொன் & அரக்கு (Gold & Maroon)",
      accent: "#991b1b",
      body: "#78350f",
      bg: "#fffbeb",
    },
    {
      name: "ராஜ நீலம் & கரும்சிவப்பு (Indigo & Crimson)",
      accent: "#881337",
      body: "#1e40af",
      bg: "#faf5ff",
    },
    {
      name: "சுப மரகதம் & நீலம் (Emerald & Blue)",
      accent: "#15803d",
      body: "#1e3a8a",
      bg: "#f0fdf4",
    },
  ];

  // Strictly Handwritten Cursive Fonts
  const handwrittenFonts = [
    { label: "கவிவாணர் (Kavivanar - பாரம்பரிய தமிழ் கையெழுத்து)", value: "'Kavivanar', cursive" },
    { label: "கலாம் (Kalam - சாஸ்திர தூரிகை கையெழுத்து)", value: "'Kalam', cursive" },
    { label: "பாலூ தம்பி (Baloo Thambi 2 - வட்டெழுத்து நளினம்)", value: "'Baloo Thambi 2', cursive" },
    { label: "கேவியட் (Caveat - துரித கையெழுத்துக் குறிப்பேடு)", value: "'Caveat', 'Kavivanar', cursive" },
  ];

  const handlePrint = () => {
    window.print();
  };

  // 4x4 South Indian Box Renderer
  const renderSouthIndianSign = (
    signNum: number,
    kattamData: Record<number, any[]>
  ) => {
    const list = kattamData[signNum] || [];
    const hasLagna = list.some((p) => p.is_lagna || p.symbol === "லக்" || p.name === "Lagna");

    return (
      <div
        className="h-full w-full flex flex-col justify-between items-center p-1 text-[10px] leading-tight overflow-hidden transition-colors"
        style={{
          backgroundColor: hasLagna ? `${accentColor}12` : "transparent",
        }}
      >
        <div className="w-full flex justify-between items-center text-[8.5px] font-semibold opacity-70">
          <span>{signNum}</span>
          {hasLagna && (
            <span
              className="text-[7.5px] font-bold px-1 rounded-sm text-white"
              style={{ backgroundColor: accentColor }}
            >
              லக்
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-0.5 justify-center items-center font-bold">
          {list.map((p, idx) => {
            const isLag = p.is_lagna || p.symbol === "லக்";
            return (
              <span
                key={idx}
                className="px-0.5 py-0.2 rounded text-[9.5px] tracking-tight"
                style={{
                  color: isLag ? accentColor : bodyColor,
                  fontWeight: isLag ? 800 : 600,
                  backgroundColor: isLag ? `${accentColor}18` : `${bodyColor}0d`,
                  border: `1px solid ${isLag ? accentColor + "40" : bodyColor + "25"}`,
                }}
              >
                {p.symbol || p.name_ta || p.name?.slice(0, 2)}
                {p.is_retrograde && <span className="text-[7.5px] ml-0.5 font-mono">(வ)</span>}
              </span>
            );
          })}
        </div>
        <div className="h-0.5" />
      </div>
    );
  };

  return (
    <div className="vakhyam-master-wrapper w-full my-6 font-tamil">
      {/* ───────────────────────────────────────────────────────────
          TOP INTERACTIVE CUSTOMIZER TOOLBAR
      ─────────────────────────────────────────────────────────── */}
      <div className="no-print bg-[#fffdfa] border-2 border-[#8b5a2b]/35 rounded-2xl p-3.5 mb-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8b5a2b]/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="text-xl font-bold font-script"
              style={{ color: accentColor }}
            >
              ஸ்ரீ
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#2b2117]">
                {lang === "ta"
                  ? "வாக்கிய பஞ்சாங்க கையெழுத்து வடிவமைப்பு & வண்ணக் கட்டுப்பாடு"
                  : "Traditional Vakhyam Handwritten Styling & Color Controls"}
              </h3>
              <p className="text-[11px] text-[#6f6049]">
                {lang === "ta"
                  ? "சூரிய சித்தாந்த வாக்கிய கணிதம் (சிவப்பு & நீலம் பாரம்பரிய கையெழுத்து மை)"
                  : "Classical Surya Siddhanta Vakkiyam (Default: Red Headings & Blue Body Ink)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="px-3 py-1.5 rounded-xl border border-[#8b5a2b]/40 bg-[#fffaf0] hover:bg-[#f5ebd2] text-xs font-bold text-[#6b1426] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Palette className="w-3.5 h-3.5 text-[#b03726]" />
              <span>{showCustomizer ? "அமைப்புகளை மறைக்க" : "வண்ணம் & எழுத்துரு மாற்று"}</span>
              {showCustomizer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#8e2b1c] hover:bg-[#6b1426] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="அச்சிடுக (Print / Save as PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === "ta" ? "முழுப் பக்கத்தை அச்சிடுக" : "Print Full Page"}</span>
            </button>
          </div>
        </div>

        {/* Expandable Controls Tray */}
        {showCustomizer && (
          <div className="mt-3 pt-2 text-xs space-y-3.5 animate-fade-in">
            {/* 1-Click Curated Palettes */}
            <div>
              <span className="font-bold text-[#6b1426] block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#b03726]" />
                விரைவு வண்ணத் தொகுப்புகள் (1-Click Color Palettes):
              </span>
              <div className="flex flex-wrap gap-2">
                {curatedPalettes.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAccentColor(p.accent);
                      setBodyColor(p.body);
                      setPaperBg(p.bg);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-[#8b5a2b]/30 text-[11px] font-medium flex items-center gap-1.5 transition-transform hover:scale-102 bg-white"
                    style={{
                      boxShadow: accentColor === p.accent && bodyColor === p.body ? "0 0 0 2px #b03726" : "none",
                    }}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: p.accent }} />
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: p.body }} />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#8b5a2b]/15 pt-3">
              {/* Custom Accent Color (Red default) */}
              <div>
                <label className="font-bold text-[#6b1426] flex items-center justify-between mb-1">
                  <span>தலைப்பு & மங்கள மை (Accent Ink):</span>
                  <span className="font-mono text-[10px] uppercase text-[#6f6049]">{accentColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-[#8b5a2b]/40 cursor-pointer p-0.5 bg-transparent"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {["#b03726", "#991b1b", "#7f1d1d", "#c2410c", "#6b21a8", "#15803d"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccentColor(c)}
                        className="w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-115"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Body Color (Royal Blue default) */}
              <div>
                <label className="font-bold text-[#6b1426] flex items-center justify-between mb-1">
                  <span>விவரம் & ஸ்புட கணித மை (Body Ink):</span>
                  <span className="font-mono text-[10px] uppercase text-[#6f6049]">{bodyColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-[#8b5a2b]/40 cursor-pointer p-0.5 bg-transparent"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {["#1e3a8a", "#0f3b7a", "#0369a1", "#1f2937", "#2b2117", "#312e81"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBodyColor(c)}
                        className="w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-115"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Paper Tone */}
              <div>
                <label className="font-bold text-[#6b1426] flex items-center justify-between mb-1">
                  <span>சுவடித் தாள் வண்ணம் (Paper Tone):</span>
                  <span className="font-mono text-[10px] uppercase text-[#6f6049]">{paperBg}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={paperBg}
                    onChange={(e) => setPaperBg(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-[#8b5a2b]/40 cursor-pointer p-0.5 bg-transparent"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {["#fcf8ed", "#fff8e1", "#fbf5e8", "#ffffff", "#f4ecd8"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPaperBg(c)}
                        className="w-5 h-5 rounded-full border border-black/30 transition-transform hover:scale-115"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strictly Handwritten Font Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#8b5a2b]/15 pt-3">
              <div>
                <label className="font-bold text-[#6b1426] block mb-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-[#b03726]" />
                  <span>கையெழுத்து எழுத்துரு (Only Handwritten Fonts):</span>
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full text-xs font-bold rounded-xl border border-[#8b5a2b]/35 p-2 bg-white text-[#2b2117] focus:outline-none focus:ring-1 focus:ring-[#b03726]"
                >
                  {handwrittenFonts.map((f, idx) => (
                    <option key={idx} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Section Filter */}
              <div>
                <label className="font-bold text-[#6b1426] block mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#b03726]" />
                  <span>பிரிவுத் தேர்வு (Section View):</span>
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: "all", label: "முழுப் பக்கம் (Full)" },
                    { id: "birth", label: "ஜனன விபரம் & நாழிகை" },
                    { id: "chakras", label: "4 சக்கரங்கள் & ஸ்புடம்" },
                    { id: "upagrahas", label: "உபகிரகங்கள்" },
                    { id: "dashas", label: "தசா புக்தி" },
                    { id: "ashtakavarga", label: "அஷ்டகவர்க்கம்" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id as any)}
                      className={`px-2 py-1 rounded-xl text-xs font-bold border transition-all ${
                        activeSection === sec.id
                          ? "bg-[#8e2b1c] text-white border-[#8e2b1c]"
                          : "bg-white text-[#6f6049] border-[#8b5a2b]/25 hover:bg-[#fffaf0]"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────
          THE FULL-PAGE HANDWRITTEN VAKHYAM MANUSCRIPT CARD
      ─────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        id="vakhyam-full-page"
        className="vakhyam-manuscript-card relative overflow-hidden rounded-2xl p-6 sm:p-9 shadow-2xl border-4 transition-all duration-300"
        style={{
          backgroundColor: paperBg,
          borderColor: `${accentColor}50`,
          fontFamily: fontFamily,
          color: bodyColor,
        }}
      >
        {/* Decorative Palm Leaf & Aging Stains */}
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
            HEADER & INVOCATIONS (Pages 1–3 OCR)
        ══════════════════════════════════════════════════════════ */}
        <div
          className="border-b-2 pb-4 mb-6 relative text-center"
          style={{ borderColor: `${accentColor}40` }}
        >
          {/* Sacred Mantra & Inscription Banner */}
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
              ? "பாரம்பரிய வாக்கிய பஞ்சாங்க சம்பூர்ண ஜனன ஜாதகம்"
              : "Traditional Surya Siddhanta Vakkiyam Jathagam Manuscript"}
          </h1>

          <div
            className="text-xs font-semibold tracking-wider opacity-85"
            style={{ color: bodyColor }}
          >
            — சூரிய சித்தாந்த மரபு, வரருசி வாக்கிய முறை & பாம்பு பஞ்சாங்கக் கணிதம் —
          </div>

          {/* Sanskrit Sloka Banner (Page 1 OCR) */}
          <div
            className="mt-3 p-2.5 rounded-xl border text-center text-xs leading-relaxed italic"
            style={{
              backgroundColor: `${accentColor}08`,
              borderColor: `${accentColor}30`,
              color: bodyColor,
            }}
          >
            <div className="font-bold text-[11px]" style={{ color: accentColor }}>
              ஜெனனீ ஜென்ம ஸௌக்கியானாம் வர்தனீ குலஸம்பதாம் |
              பதவீ பூர்வ புண்யானாம் லிக்யதே ஜன்ம பத்ரிகா ||
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {lang === "ta"
                ? "மாதா, பிதா, ஜாதகர் சர்வ மங்களங்களையும் தீர்க்காயுளையும் பெற்று சுபயோகமாக வாழ அருளப்பட்ட ஜாதகம்."
                : "May mother, father, and native live in auspicious fortune, good health, and longevity."}
            </div>
          </div>

          {/* 2 Authentic Stutis (Pages 2 & 3 OCR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-left">
            {/* Vinayagar Stuti (Page 2 OCR) */}
            <div
              className="p-3 rounded-xl border text-xs leading-relaxed"
              style={{
                backgroundColor: `${bodyColor}04`,
                borderColor: `${accentColor}25`,
              }}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5" style={{ color: accentColor }}>
                <span>✦</span>
                <span>விநாயகர் ஸ்துதி (Page 2 Inscription)</span>
              </div>
              <p className="text-[11px] italic opacity-95 leading-relaxed">
                “தங்க மான் மழு வோடிருந்தித்<br />
                தன்மதி தலையிற் கொண்டோன்<br />
                மங்கையர் பதிக்குச் சொன்ன<br />
                மாமொழிச் சோதிடத்தை<br />
                இங்குநா முறைப்பதற்கோர்<br />
                இமையெனும் பிழை வராமற்<br />
                செங்கண்மால் மருகன் யானைச்<br />
                சிரன் பதங் காப்பதாமே. சுப மஸ்து.”
              </p>
            </div>

            {/* Navagraha Stotram (Page 3 OCR) */}
            <div
              className="p-3 rounded-xl border text-xs leading-relaxed"
              style={{
                backgroundColor: `${bodyColor}04`,
                borderColor: `${accentColor}25`,
              }}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5" style={{ color: accentColor }}>
                <span>✦</span>
                <span>நவக்கிரக ஸ்தோத்திரம் (Page 3 Inscription)</span>
              </div>
              <p className="text-[11px] italic opacity-95 leading-relaxed">
                “ஓம் நம: சூர்யாய சோமாய மங்களாய புதாய ச |<br />
                குரு சுக்ர சனிப்யஸ்ச்ச ராஹவே கேதவே நம: ||”
              </p>
              <div className="text-[10px] mt-1.5 opacity-85" style={{ color: accentColor }}>
                நவக்கிரகங்களை தினம் பூஜிப்பவர்களுக்கு கஷ்டம் நீங்கி சகல சுகங்களும் உண்டாகும்.
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1: JANANA VIVARAM & BIO-DATA (Pages 1 & 4 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "birth") && (
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
                1. ஜனன விபரம் & ஜாதக பயோடேட்டா (Page 1 & 4 Ledger)
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
                  {chart.name || "மகாதீஸ்வரன்"}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தந்தை (Father):</span>
                <span className="font-semibold">{bio.father_name || "பெருமாள்"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தாய் (Mother):</span>
                <span className="font-semibold">{bio.mother_name || "பாப்புஅம்மாள்"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">சொந்த ஊர் / இடம்:</span>
                <span className="font-semibold">{bio.native_place || chart.place || "வெண்ணந்தூர் / Salem"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த தேதி (DOB):</span>
                <span className="font-bold font-mono">{chart.date_of_birth}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த நாள் (Day):</span>
                <span className="font-semibold">{d.vaaram_ta || "வியாழன்"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">பிறந்த நேரம் (TOB):</span>
                <span className="font-bold font-mono">{chart.time_of_birth}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">தமிழ் தேதி (Tamil Date):</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {samp.tamil_year || "கீலக"} {samp.tamil_month || "புரட்டாசி"}-{samp.tamil_date || 10}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">உதயாதி நாழிகை:</span>
                <span className="font-bold font-mono" style={{ color: accentColor }}>
                  {udhayadhi}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">அட்ச, தீர்க்க ரேகை:</span>
                <span className="font-mono">{chart.latitude || "11:39"} N, {chart.longitude || "78:12"} E</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">சுதேச நேரத்திருத்தம்:</span>
                <span className="font-mono font-bold" style={{ color: accentColor }}>
                  {lmtString}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">கணித முறை:</span>
                <span className="font-bold" style={{ color: accentColor }}>வாக்கிய கணிதம் (Vakyam)</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம லக்னம்:</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.lagnam_ta} லக்னம்</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம ராசி:</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.rasi_ta} ராசி</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">ஜன்ம நட்சத்திரம்:</span>
                <span className="font-bold" style={{ color: accentColor }}>
                  {d.nakshatram_ta} பாதம் {d.pada || 3}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">திதி & பட்சம்:</span>
                <span className="font-semibold">{d.thithi_ta} ({d.paksha_ta || "சுக்ல பஞ்சமி"})</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">யோகம் & கரணம்:</span>
                <span className="font-semibold">{d.yogam_ta || "விஷ்கம்பம்"} / {d.karanam_ta || "பவம்"}</span>
              </div>

              <div className="flex justify-between border-b border-black/5 pb-1">
                <span className="opacity-75">அயனம் (Ayanam):</span>
                <span className="font-semibold">{samp.ayana_ta || "தட்சிணாயனம்"}</span>
              </div>
            </div>

            {/* 27 Nakshatra Classical Attributes (Page 4 OCR Bottom) */}
            <div
              className="mt-3 p-3 rounded-xl border text-xs grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center"
              style={{
                backgroundColor: `${bodyColor}03`,
                borderColor: `${accentColor}25`,
              }}
            >
              <div>
                <span className="opacity-70 text-[10px] block">கணம்</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.ganam_ta || "ராக்ஷஸ"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">யோனி</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.yoni_ta || "பெண் புலி"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">நாடி</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.nadi_ta || "சமான"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">விருட்சம்</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.vriksham_ta || "விளா"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">ரஜ்ஜு</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.rajju_ta || "உதர"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">பறவை</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.pakshi_ta || "செங்குருவி"}</span>
              </div>
              <div>
                <span className="opacity-70 text-[10px] block">அதிதேவதை</span>
                <span className="font-bold" style={{ color: accentColor }}>{d.nakshatra_deity || "இந்திரன், அக்னி"}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 2: NAZHIGAI METRICS & SHODHANA FACTORS (Page 5 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "birth") && (
          <div className="mb-7">
            <div
              className="flex items-center gap-2 border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <Clock className="w-4 h-4" style={{ color: accentColor }} />
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                2. வாக்கிய நாழிகை கணிதம் & சாஸ்திர நுட்பக் கூறுகள் (Page 5 OCR)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box A: Nazhigai Metrics */}
              <div
                className="p-3.5 rounded-xl border flex flex-col justify-between space-y-2"
                style={{
                  backgroundColor: `${bodyColor}03`,
                  borderColor: `${accentColor}30`,
                }}
              >
                <div className="font-bold border-b pb-1 flex items-center justify-between" style={{ color: accentColor }}>
                  <span>✦ நட்சத்திர நாழிகை விபரம்</span>
                  <span className="text-[10px] font-mono">Surya Siddhanta</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="opacity-80">ஆதியந்த பரம நாழிகை:</span>
                    <span className="font-bold font-mono" style={{ color: accentColor }}>{paramanazhigai}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="opacity-80">கர்ப்பசெல் நாழிகை (சென்றது):</span>
                    <span className="font-semibold font-mono">{nakSentra}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="opacity-80">நின்ற இருப்பு நாழிகை:</span>
                    <span className="font-semibold font-mono">{nakNindra}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="font-bold" style={{ color: accentColor }}>திசை இருப்பு:</span>
                    <span className="font-bold font-mono" style={{ color: accentColor }}>
                      {d.dasha_balance_ta || "குரு திசையில் 5 வரு, 10 மாதம், 2 நாள்"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box B: Yogi, Avayogi, Benefics & Sun Timings */}
              <div
                className="p-3.5 rounded-xl border flex flex-col justify-between space-y-2"
                style={{
                  backgroundColor: `${bodyColor}03`,
                  borderColor: `${accentColor}30`,
                }}
              >
                <div className="font-bold border-b pb-1 flex items-center justify-between" style={{ color: accentColor }}>
                  <span>✦ யோகி, அவயோகி & லக்ன சுப/பாபர்கள்</span>
                  <span className="text-[10px] font-mono">Special Factors</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/60 p-2 rounded-lg border border-black/5">
                    <span className="opacity-70 text-[10px] block">யோகி / அவயோகி</span>
                    <span className="font-bold" style={{ color: accentColor }}>
                      யோகி: சனி · அவயோகி: சந்திரன்
                    </span>
                  </div>

                  <div className="bg-white/60 p-2 rounded-lg border border-black/5">
                    <span className="opacity-70 text-[10px] block">திதி சூன்ய ராசிகள்</span>
                    <span className="font-bold" style={{ color: accentColor }}>மிதுனம், கன்னி</span>
                  </div>

                  <div className="bg-white/60 p-2 rounded-lg border border-black/5">
                    <span className="opacity-70 text-[10px] block">லக்ன சுபர் / பாபர்</span>
                    <span className="font-bold" style={{ color: accentColor }}>
                      சுபர்: சூரியன், செவ் · பாபர்: சுக்
                    </span>
                  </div>

                  <div className="bg-white/60 p-2 rounded-lg border border-black/5">
                    <span className="opacity-70 text-[10px] block">வைநாசிக தாரை (22-வது)</span>
                    <span className="font-bold" style={{ color: accentColor }}>மகம் (22-ம் நட்)</span>
                  </div>

                  <div className="bg-white/60 p-2 rounded-lg border border-black/5 col-span-2 flex justify-between items-center">
                    <div>
                      <span className="opacity-70 text-[10px] block">சூரிய உதயம் (பிம்ப மத்தி)</span>
                      <span className="font-mono font-bold">{d.sun_rise || "06:09:37 AM"}</span>
                    </div>
                    <div>
                      <span className="opacity-70 text-[10px] block">சூரிய அஸ்தமனம் (பிம்ப மத்தி)</span>
                      <span className="font-mono font-bold">{d.sun_set || "06:07:20 PM"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 3: NIRAYANA GRAHA SPHUTAM TABLE (Page 7 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "chakras") && (
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
                  3. துல்லியமான நிராயன கிரக நிலைகள் (Page 7 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">Vakhyam Ephemeris Table</span>
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
                    <th className="p-2 font-mono">பாகை-கலை (Absolute 0-360)</th>
                    <th className="p-2">நட்சத்திரம்</th>
                    <th className="p-2 text-center">பாதம்</th>
                    <th className="p-2">நட்-அதிபதி</th>
                    <th className="p-2">ராசி</th>
                    <th className="p-2 font-mono">ராசி பாகை-கலை</th>
                    <th className="p-2 text-center">நிலை</th>
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
                        <td className="p-2 font-bold flex items-center gap-1.5">
                          <span className="w-5 text-center font-extrabold text-xs" style={{ color: accentColor }}>
                            {row.symbol}
                          </span>
                          <span style={{ color: isLagna ? accentColor : bodyColor }}>{row.name_ta}</span>
                        </td>
                        <td className="p-2 font-mono font-bold text-xs" style={{ color: bodyColor }}>
                          {row.total_dms}
                        </td>
                        <td className="p-2 font-medium">{row.nakshatra_ta}</td>
                        <td className="p-2 text-center font-bold font-mono">{row.pada}</td>
                        <td className="p-2">{row.nak_lord_ta}</td>
                        <td className="p-2 font-semibold" style={{ color: isLagna ? accentColor : bodyColor }}>
                          {row.rasi_ta}
                        </td>
                        <td className="p-2 font-mono font-medium">{row.rasi_dms}</td>
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
                            <span className="text-[10px] opacity-85 font-semibold">{row.status_ta}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 4: 4 CORE CHAKRAS & BHAVA SHIFTING (Pages 6 & 8 OCR)
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
                  4. முக்கிய 4 சக்கரங்கள் & பாவக மாற்றம் (Pages 6 & 8 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">D1, D9, D3 & Bhava Chalit</span>
            </div>

            {/* 4 Chakras Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Chakra 1: Rasi (D1) */}
              <div
                className="rounded-xl p-2.5 border-2 shadow-xs flex flex-col items-center"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}40` }}
              >
                <div className="text-xs font-bold mb-1.5 tracking-wider" style={{ color: accentColor }}>
                  ॥ ராசி சக்கரம் (D1) ॥
                </div>
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[220px] border-2 rounded-lg bg-white/80 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(12, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(1, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(2, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(3, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(11, rasiKattam)}</div>
                  <div className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-1 text-center" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                    <span className="text-sm font-extrabold" style={{ color: accentColor }}>ராசி</span>
                    <span className="text-[9px] font-bold opacity-80">{chart.name || "ஜாதகர்"}</span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(4, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(10, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(5, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(9, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(8, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(7, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(6, rasiKattam)}</div>
                </div>
              </div>

              {/* Chakra 2: Navamsam (D9) */}
              <div
                className="rounded-xl p-2.5 border-2 shadow-xs flex flex-col items-center"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}40` }}
              >
                <div className="text-xs font-bold mb-1.5 tracking-wider" style={{ color: accentColor }}>
                  ॥ நவாம்சம் (D9) ॥
                </div>
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[220px] border-2 rounded-lg bg-white/80 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(12, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(1, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(2, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(3, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(11, navamsaKattam)}</div>
                  <div className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-1 text-center" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                    <span className="text-sm font-extrabold" style={{ color: accentColor }}>நவாம்சம்</span>
                    <span className="text-[9px] font-bold opacity-80">களத்திரம்</span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(4, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(10, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(5, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(9, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(8, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(7, navamsaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(6, navamsaKattam)}</div>
                </div>
              </div>

              {/* Chakra 3: Drekkana (D3 - Page 8 OCR) */}
              <div
                className="rounded-xl p-2.5 border-2 shadow-xs flex flex-col items-center"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}40` }}
              >
                <div className="text-xs font-bold mb-1.5 tracking-wider" style={{ color: accentColor }}>
                  ॥ 3-திரேக்காணம் (D3) ॥
                </div>
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[220px] border-2 rounded-lg bg-white/80 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(12, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(1, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(2, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(3, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(11, drekkanaKattam)}</div>
                  <div className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-1 text-center" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                    <span className="text-sm font-extrabold" style={{ color: accentColor }}>திரேக்காணம்</span>
                    <span className="text-[9px] font-bold opacity-80">சகோதரம்</span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(4, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(10, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(5, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(9, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(8, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(7, drekkanaKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(6, drekkanaKattam)}</div>
                </div>
              </div>

              {/* Chakra 4: Sripati Bhava Chalit (Page 8 OCR) */}
              <div
                className="rounded-xl p-2.5 border-2 shadow-xs flex flex-col items-center"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}40` }}
              >
                <div className="text-xs font-bold mb-1.5 tracking-wider" style={{ color: accentColor }}>
                  ॥ ஸ்ரீபதி-பாவகம் (Chalit) ॥
                </div>
                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[220px] border-2 rounded-lg bg-white/80 overflow-hidden"
                  style={{ borderColor: accentColor }}
                >
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(12, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(1, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(2, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(3, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(11, rasiKattam)}</div>
                  <div className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-1 text-center" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                    <span className="text-sm font-extrabold" style={{ color: accentColor }}>ஸ்ரீபதி</span>
                    <span className="text-[9px] font-bold opacity-80">பாவ சக்கரம்</span>
                  </div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(4, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(10, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(5, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(9, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(8, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(7, rasiKattam)}</div>
                  <div className="border p-0.5" style={{ borderColor: `${accentColor}40` }}>{renderSouthIndianSign(6, rasiKattam)}</div>
                </div>
              </div>
            </div>

            {/* Bhava Shifting Banner (Page 8 OCR bottom) */}
            <div
              className="p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold"
              style={{ backgroundColor: `${accentColor}0d`, borderColor: `${accentColor}30` }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <span style={{ color: accentColor }}>ஜாதகத்தில் பாவக மாற்றம் (Bhava Shifting Planets):</span>
                <span className="text-sm font-extrabold" style={{ color: bodyColor }}>
                  {bhavaShiftingText}
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-80">Sripati Bhava-Shift Rules</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 5: UPAGRAHAS & SPECIAL SPUTAMS (Pages 16 & 17 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "upagrahas") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  5. உபகிரகங்கள் & முக்கிய லக்ன ஸ்புடங்கள் (Pages 16 & 17 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">Gulikaadi & Dhoomaadi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Gulikaadi Pancha Upagrahas */}
              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2 flex justify-between" style={{ color: accentColor }}>
                  <span>✦ குளிகாதி ஐவர் விபரம் (Gulikaadi Upagrahas)</span>
                  <span className="text-[10px] font-mono">பராசரர் முறை</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b text-left opacity-75">
                      <th className="pb-1">உப கிரகம்</th>
                      <th className="pb-1">அதிபதி</th>
                      <th className="pb-1 font-mono">ராசி & பாகை-கலை</th>
                      <th className="pb-1">நட்சத்திரம்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-mono">
                    <tr><td className="py-1 font-tamil font-semibold">காலன்</td><td>சூரியன்</td><td>விரு 14:09:34</td><td className="font-tamil">அனுஷம் 4</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">மிருத்யு</td><td>செவ்வாய்</td><td>தனு 25:38:38</td><td className="font-tamil">பூராடம் 4</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">அர்த்தபிரஹரன்</td><td>புதன்</td><td>மக 18:22:37</td><td className="font-tamil">திருவோணம் 3</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">யமகண்டன்</td><td>குரு</td><td>கன் 09:34:22</td><td className="font-tamil">உத்திரம் 4</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold" style={{ color: accentColor }}>குளிகன் (மாந்தி)</td><td>சனி</td><td>துலா 23:26:02</td><td className="font-tamil">விசாகம் 2</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Dhoomaadi Pancha Upagrahas */}
              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2 flex justify-between" style={{ color: accentColor }}>
                  <span>✦ தூமாதி ஐவர் ஸ்புடங்கள் (Dhoomaadi Upagrahas)</span>
                  <span className="text-[10px] font-mono">சூரிய கணித முறை</span>
                </div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b text-left opacity-75">
                      <th className="pb-1">உப கிரகம்</th>
                      <th className="pb-1">அதிபதி</th>
                      <th className="pb-1 font-mono">ராசி</th>
                      <th className="pb-1 font-mono">ஸ்புடம் (DMS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-mono">
                    <tr><td className="py-1 font-tamil font-semibold">தூமன்</td><td>செவ்வாய்</td><td className="font-tamil">{getSignName(dhoomaDeg)}</td><td>{toDms(dhoomaDeg)}</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">வியதிபாதன்</td><td>ராகு</td><td className="font-tamil">{getSignName(vyatipataDeg)}</td><td>{toDms(vyatipataDeg)}</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">பரிவேடன்</td><td>சந்திரன்</td><td className="font-tamil">{getSignName(pariveshaDeg)}</td><td>{toDms(pariveshaDeg)}</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">இந்திரதனுஸ்</td><td>சுக்கிரன்</td><td className="font-tamil">{getSignName(indraDhanusDeg)}</td><td>{toDms(indraDhanusDeg)}</td></tr>
                    <tr><td className="py-1 font-tamil font-semibold">உபகேது</td><td>கேது</td><td className="font-tamil">{getSignName(upaketuDeg)}</td><td>{toDms(upaketuDeg)}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Special Sensitive Lagnas (Page 17 OCR) */}
              <div
                className="p-3.5 rounded-xl border md:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-center font-mono"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">ஹோரா லக்னம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>{toRasiDms(horaLagnaDeg)}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">ஆருட லக்னம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>{toRasiDms(arudhaLagnaDeg)}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">கடிகா லக்னம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>{toRasiDms(ghatikaLagnaDeg)}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">இந்து லக்னம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>{toRasiDms(induLagnaDeg)}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">பீஜ ஸ்புடம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>{toDms(beejaSphutamDeg)}</span>
                </div>
                <div className="bg-white/70 p-2 rounded-lg border border-black/5">
                  <span className="opacity-70 text-[9.5px] block font-tamil">22-ம் திரேக்காணம்</span>
                  <span className="font-bold text-xs" style={{ color: accentColor }}>கடகம் (கன்னி)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 6: PLANETARY ROLES & TARA BALA (Page 33 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "dashas") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  6. கிரகங்களின் வாசகர் - போதகர் - காரகர் - வேதகர் & 9 தாரா பலம் (Page 33 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">Phaladeepika Ch. 15</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Planetary Roles Table */}
              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2" style={{ color: accentColor }}>
                  ✦ வாசகர் - போதகர் - காரகர் - வேதகர் அட்டவணை
                </div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b text-left opacity-75">
                      <th className="pb-1">கிரகம்</th>
                      <th className="pb-1">வாசகர்</th>
                      <th className="pb-1">போதகர்</th>
                      <th className="pb-1">காரகர்</th>
                      <th className="pb-1">வேதகர்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr><td className="py-1 font-bold">சூரியன்</td><td>சனி</td><td>செவ்வாய்</td><td>குரு</td><td>சுக்கிரன்</td></tr>
                    <tr><td className="py-1 font-bold">சந்திரன்</td><td>சுக்கிரன்</td><td>செவ்வாய்</td><td>சனி</td><td>சூரியன்</td></tr>
                    <tr><td className="py-1 font-bold">செவ்வாய்</td><td>சூரியன்</td><td>சந்திரன்</td><td>சனி</td><td>புதன்</td></tr>
                    <tr><td className="py-1 font-bold">புதன்</td><td>சந்திரன்</td><td>குரு</td><td>சுக்கிரன்</td><td>செவ்வாய்</td></tr>
                    <tr><td className="py-1 font-bold">குரு</td><td>சனி</td><td>செவ்வாய்</td><td>சந்திரன்</td><td>சூரியன்</td></tr>
                    <tr><td className="py-1 font-bold">சுக்கிரன்</td><td>செவ்வாய்</td><td>புதன்</td><td>சூரியன்</td><td>சனி</td></tr>
                    <tr><td className="py-1 font-bold">சனி</td><td>சுக்கிரன்</td><td>சந்திரன்</td><td>குரு</td><td>செவ்வாய்</td></tr>
                  </tbody>
                </table>
              </div>

              {/* 9 Tara Bala Table (Page 33 OCR Bottom) */}
              <div
                className="p-3.5 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2" style={{ color: accentColor }}>
                  ✦ தாரா பலமுள்ள நட்சத்திரங்கள் (9 Tara Bala Groups)
                </div>
                <div className="space-y-1 text-[10.5px]">
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold">ஜன்ம தாரை:</span>
                    <span>விசாகம், பூரட்டாதி, புனர்பூசம் (அதமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-emerald-800">சம்பத்து தாரை:</span>
                    <span>அனுஷம், உத்திரட்டாதி, பூசம் (உத்தமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-red-800">விபத்து தாரை:</span>
                    <span>கேட்டை, ரேவதி, ஆயில்யம் (அதமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-emerald-800">க்ஷேம தாரை:</span>
                    <span>மூலம், அசுவினி, மகம் (உத்தமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-red-800">பிரத்தியக்கு தாரை:</span>
                    <span>பூராடம், பரணி, பூரம் (அதமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-emerald-800">சாதக தாரை:</span>
                    <span>உத்திராடம், கார்த்திகை, உத்திரம் (உத்தமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-red-800">வதத் தாரை:</span>
                    <span>திருவோணம், ரோகிணி, அஸ்தம் (அதமம்)</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-0.5">
                    <span className="font-bold text-emerald-800">மைத்ர தாரை:</span>
                    <span>அவிட்டம், மிருகசீரிஷம், சித்திரை (உத்தமம்)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-emerald-800">பரம மைத்ர தாரை:</span>
                    <span>சதயம், திருவாதிரை, சுவாதி (உத்தமம்)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 7: SARVASHTAKAVARGA & DIRECTIONAL BINDUS (Page 53 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "ashtakavarga") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  7. சர்வாஷ்டகவர்க்க பரல்கள் & திசைப் பலன் (Page 53 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">337 Sarvashtakavarga Matrix</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 337 Sarvashtakavarga Kattam */}
              <div
                className="p-3 rounded-xl border flex flex-col items-center justify-between"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}30` }}
              >
                <div className="font-bold mb-2 text-center" style={{ color: accentColor }}>
                  ॥ 337-பரல் சர்வ அஷ்டகவர்க்க சக்கரம் ॥
                </div>

                <div
                  className="grid grid-cols-4 grid-rows-4 w-full h-[210px] border-2 rounded-lg bg-white/80 overflow-hidden text-center"
                  style={{ borderColor: accentColor }}
                >
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>30</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>21</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>33</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>35</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>27</div>
                  <div className="col-span-2 row-span-2 border-2 flex flex-col items-center justify-center p-1 text-center" style={{ borderColor: accentColor, backgroundColor: `${accentColor}0a` }}>
                    <span className="text-sm font-extrabold" style={{ color: accentColor }}>பரல்கள்</span>
                    <span className="text-base font-black font-mono" style={{ color: bodyColor }}>337</span>
                  </div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>32</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>29</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>29</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>28</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>25</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>23</div>
                  <div className="border flex items-center justify-center font-bold text-xs" style={{ borderColor: `${accentColor}40` }}>25</div>
                </div>
              </div>

              {/* Categorical Points Breakdown (Page 53 OCR) */}
              <div
                className="p-3.5 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2" style={{ color: accentColor }}>
                  ✦ ஸ்தான பரல்கள் விகிதம் (Page 53)
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">கேந்திரம் (1, 4, 7, 10):</span>
                    <span className="font-bold" style={{ color: accentColor }}>118</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">பணபரம் (2, 5, 8, 11):</span>
                    <span className="font-bold">105</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">ஆபோக்லீயம் (3, 6, 9, 12):</span>
                    <span className="font-bold">114</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">உபசயம் (3, 6, 10, 11):</span>
                    <span className="font-bold" style={{ color: accentColor }}>108</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">திரிகோணம் (1, 5, 9):</span>
                    <span className="font-bold">78</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="font-tamil">வரவினம் / செலவினம்:</span>
                    <span className="font-bold" style={{ color: accentColor }}>81 / 90</span>
                  </div>
                </div>
              </div>

              {/* Directional Bindus (Page 53 OCR) */}
              <div
                className="p-3.5 rounded-xl border flex flex-col justify-between"
                style={{ backgroundColor: `${bodyColor}03`, borderColor: `${accentColor}25` }}
              >
                <div className="font-bold border-b pb-1 mb-2" style={{ color: accentColor }}>
                  ✦ திசைப் பரல்கள் பலன் (Directional Strength)
                </div>
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">கிழக்கு (East - மேஷம், சிம்மம், தனுசு):</span>
                    <span className="font-bold" style={{ color: accentColor }}>78</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">மேற்கு (West - மிதுனம், துலாம், கும்பம்):</span>
                    <span className="font-bold">85</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">தெற்கு (South - ரிஷபம், கன்னி, மகரம்):</span>
                    <span className="font-bold" style={{ color: accentColor }}>87</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="font-tamil">வடக்கு (North - கடகம், விருச்சிகம், மீனம்):</span>
                    <span className="font-bold">87</span>
                  </div>
                  <div className="pt-1 text-[10.5px] font-tamil italic opacity-85">
                    தெற்கு & வடக்கு திசைகளில் தொழில், இல்லம், லாப காரியங்கள் அதிக சுபமளிக்கும்.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SECTION 8: DASHA-BHUKTI & RITUAL REMEDIES (Pages 24–32 OCR)
        ══════════════════════════════════════════════════════════ */}
        {(activeSection === "all" || activeSection === "dashas") && (
          <div className="mb-7">
            <div
              className="flex items-center justify-between border-b pb-1.5 mb-3"
              style={{ borderColor: `${accentColor}35` }}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: accentColor }} />
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  8. விம்சோத்தரி தசா-புக்தி அட்டவணை & பரிகாரத் திருத்தலங்கள் (Pages 24–32 OCR)
                </h2>
              </div>
              <span className="text-[10px] font-mono opacity-70">365.25 Days Calendar Basis</span>
            </div>

            {/* Classical Temples & Worship Remedies Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>1. குரு தசா (Jupiter) — ஆலங்குடி தலம்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  தஞ்சாவூர் ஆலங்குடி ஆபத்சகாயேஸ்வரர் ஆலயம். 24 நெய் விளக்குகள் ஏற்றி, மஞ்சள் ஆடை, கொண்டைக்கடலை சமர்ப்பித்து வழிபட சகல யோகமும் கூடும்.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>2. சனி தசா (Saturn) — திருநள்ளாறு தலம்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  காரைக்கால் திருநள்ளாறு தர்ப்பாரண்யேஸ்வரர் தலம். சனிக்கிழமைகளில் எள்தீபம் ஏற்றி, காக்கைக்கு எள்ளன்னமிட்டு வழிபட தோஷ நிவர்த்தி உண்டாகும்.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>3. புதன் தசா (Mercury) — திருவெண்காடு தலம்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  மயிலாடுதுறை திருவெண்காடு சுவேதாரண்யேஸ்வரர் தலம். பச்சை வஸ்திரம், பாசிப்பயறு, வெண்காந்தள் மலர் சாற்றி மகாவிஷ்ணுவை வழிபட கல்வி மேன்மை கூடும்.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>4. கேது தசா (Ketu) — கீழப்பெரும்பள்ளம் தலம்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  பூம்புகார் கீழப்பெரும்பள்ளம் நாகநாதசுவாமி தலம். கொள்ளு தானியம், சிவப்பு அல்லி மலர் சமர்ப்பித்து வழிபட ஞானமும் யோகமும் பெருகும்.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>5. சுக்கிரன் தசா (Venus) — கஞ்சனூர் தலம்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  கும்பகோணம் கஞ்சனூர் அக்னீஸ்வரர் தலம். வெண்பட்டு வஸ்திரம், மொச்சைப்பயறு, வெண்தாமரை மலர் சாற்றி லட்சுமி நாராயணரை வழிபட களத்திர சுபம் கூடும்.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${accentColor}25` }}>
                <span className="font-bold block mb-1" style={{ color: accentColor }}>6. சூரியன் தசா (Sun) — சூரியனார் கோவில்</span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  ஆடுதுறை சூரியனார் கோவில் தலம். கோதுமை தானியம், செந்தாமரை மலர் சமர்ப்பித்து ஞாயிற்றுக்கிழமை விரதமிருக்க பிதுர் ஆசி, காரிய சித்தி கூடும்.
                </p>
              </div>
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
            — வாக்கிய பஞ்சாங்க சூரிய சித்தாந்த ஜோதிட கணிதப் பக்கம் —
          </div>

          <div>MYLoginn Shastric Astrology System</div>
        </div>
      </div>
    </div>
  );
};