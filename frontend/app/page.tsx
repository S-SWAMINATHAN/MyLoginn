"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BirthDetailsForm } from "@/components/BirthDetailsForm";
import { RasiChart } from "@/components/RasiChart";
import { NavamsaChart } from "@/components/NavamsaChart";
import { PlanetaryTable } from "@/components/PlanetaryTable";
import { BhavaPredictions } from "@/components/BhavaPredictions";
import { DashaTimeline } from "@/components/DashaTimeline";
import { YogaDoshaList } from "@/components/YogaDoshaList";
import { AshtakavargaTable } from "@/components/AshtakavargaTable";
import { BabyNameSuggestions } from "@/components/BabyNameSuggestions";
import { NarrationPanel } from "@/components/NarrationPanel";
import { ShareCard } from "@/components/ShareCard";
import { PanchangamDetailsCard } from "@/components/PanchangamDetailsCard";
import { BioDataCard } from "@/components/BioDataCard";
import { VakhyamCompleteCard } from "@/components/VakhyamCompleteCard";
import { ThirukanithamCompleteCard } from "@/components/ThirukanithamCompleteCard";
import { AyurdayaCard } from "@/components/AyurdayaCard";
import { RasiNakshatraDetailsCard } from "@/components/RasiNakshatraDetailsCard";
import { HandwrittenManuscript } from "@/components/HandwrittenManuscript";
import { HandwrittenPdfButton } from "@/components/HandwrittenPdfButton";
import { GenerateChartRequest, ChartResponse } from "@/lib/types";
import { generateChartApi } from "@/lib/api";
import { SinglePageReport } from "@/components/SinglePageReport";
import { JathagamThemePanel } from "@/components/JathagamThemePanel";
import { ManuscriptTocPage } from "@/components/manuscript/ManuscriptTocPage";
import { JathagamThemeProvider, THEME_SCOPE_ID } from "@/lib/jathagamTheme";
import { MANUSCRIPT_CHAPTERS, MANUSCRIPT_PAGES } from "@/lib/manuscriptIndex";
import { Sparkles, Printer, Share2, Heart, Download, Compass, ShieldCheck, PenLine, ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";


export default function HomePage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [chartResult, setChartResult] = useState<ChartResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [showIndex, setShowIndex] = useState<boolean>(false);
  const [panchangamTab, setPanchangamTab] = useState<"thirukanitham" | "vakhyam" | "both">("thirukanitham");

  const handleGenerate = async (formData: GenerateChartRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateChartApi(formData);
      setChartResult(res);
      setPanchangamTab(res.panchangam_system === "vakhyam" ? "vakhyam" : "thirukanitham");

      // Smooth scroll to chart
      setTimeout(() => {
        const el = document.getElementById("chart-results-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to generate chart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <JathagamThemeProvider>
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Masthead / Hero Section (design-1.html style) */}
        <section className="text-center pt-4 pb-2 no-print space-y-2">
          <p className="sri font-script text-2xl text-[#b03726]">ஸ்ரீ</p>
          <p className="over-title text-xs tracking-widest text-[#b03726]">AI JATHAGAM · HANDWRITTEN EDITION</p>
          <h1 className="text-3xl sm:text-5xl font-normal font-script text-[#2b2117] tracking-tight">
            {lang === "ta" ? "AI ஜாதகம்" : "AI Jathagam"}
          </h1>
          <p className="text-sm sm:text-base text-[#6f6049] font-script">
            {lang === "ta"
              ? "— பாரம்பரிய முறைப்படி எழுதப்படும் உயர் துல்லிய கணிதக் கையெழுத்து ஜாதகம் —"
              : "— a birth chart, penned the old way —"}
          </p>
        </section>

        {/* Form Intake Card */}
        <section className="no-print">
          <BirthDetailsForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-100 border border-rose-400 text-rose-800 text-xs font-semibold text-center font-tamil">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Computed Jathagam Output Display */}
        {chartResult && (
          <section id="chart-results-section" className="space-y-6 pt-4 animate-fade-in">
            {/* Global ink-colour + Tamil-typeface panel. Sits OUTSIDE the theme
                scope on purpose, so the controls keep their own fixed colours
                while everything below them restyles live. */}
            <JathagamThemePanel lang={lang} />

            {/* Everything inside this element is themed by JathagamThemePanel —
                and because both PDF exporters rasterise this same DOM, the
                download always matches what is on screen. */}
            <div id={THEME_SCOPE_ID} className="space-y-10">
            {chartResult.output_mode === "single_page" ? (
              /* =====================================================
                 SINGLE PAGE MODE
                 Only the one-page manuscript-styled report renders.
                 It carries its own header, its own PDF/download button,
                 and its own facts — none of the full-mode sections,
                 tabs, or the 50-page manuscript viewer are mounted here.
                 ===================================================== */
              <SinglePageReport chart={chartResult} lang={lang} />
            ) : (
              /* =====================================================
                 FULL MODE — everything exactly as before, unchanged.
                 ===================================================== */
              <>
                {/* Facts Summary Box (design-1.html style) */}
                <div className="facts text-center">
                  <p>
                    <span className="fl">{lang === "ta" ? "பிறப்பு" : "Birth"}</span>{" "}
                    {chartResult.date_of_birth} · {chartResult.time_of_birth} · {chartResult.place}
                  </p>
                  <p>
                    <span className="fl">{lang === "ta" ? "ராசி" : "Rasi"}</span> {chartResult.basic_details.moon_sign_ta} ({chartResult.basic_details.moon_sign_en}) ·{" "}
                    <span className="fl">{lang === "ta" ? "நட்சத்திரம்" : "Star"}</span> {chartResult.basic_details.nakshatra_ta} — {chartResult.basic_details.pada}ம் பாதம் ·{" "}
                    <span className="fl">{lang === "ta" ? "லக்னம்" : "Lagna"}</span> {chartResult.basic_details.ascendant_sign_ta} ({chartResult.basic_details.ascendant_sign_en})
                  </p>
                  {chartResult.basic_details.dasha_balance_ta && (
                    <p>
                      <span className="fl">{lang === "ta" ? "இருப்பு தசை" : "Dasha Balance"}</span> {chartResult.basic_details.dasha_balance_ta}
                    </p>
                  )}
                </div>

                {/* Header Banner */}
                <div className="hand-card p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#a3917a]/30 pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-[#b03726] font-bold font-script">ஸ்ரீ</span>
                        <h2 className="text-2xl sm:text-3xl font-bold font-script text-[#2b2117]">
                          {chartResult.name} {lang === "ta" ? "அவர்களின் ஜாதகம்" : "Horoscope"}
                        </h2>
                      </div>
                      <p className="text-xs text-[#6f6049] font-tamil mt-1">
                        {chartResult.date_of_birth} | {chartResult.time_of_birth} | {chartResult.place} ({chartResult.timezone})
                      </p>
                    </div>

                    {/* Print and Export Buttons */}
                    <div className="flex items-center gap-2 no-print flex-wrap">
                      <button
                        onClick={handlePrint}
                        className="btn-hand text-xs font-semibold py-2 px-3.5"
                      >
                        <Printer className="w-4 h-4 text-[#b03726]" />
                        <span>{lang === "ta" ? "அச்சிடுக (Print)" : "Print"}</span>
                      </button>

                      <HandwrittenPdfButton chart={chartResult} lang={lang} />

                      <a
                        href="/porutham"
                        className="btn-hand text-xs font-semibold py-2 px-3.5"
                      >
                        <Heart className="w-4 h-4 text-[#b03726]" />
                        <span>{lang === "ta" ? "பொருத்தம்" : "Match"}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 1. Parents & Candidate Bio-Data Card */}
                <BioDataCard chart={chartResult} lang={lang} />

                {/* 2. Traditional Panchangam Master Full-Page Cards (Thirukanitham & Vakhyam) */}
                <div className="no-print flex items-center justify-between flex-wrap gap-2 bg-[#fffdfa] border-2 border-[#8b5a2b]/30 p-3 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#b03726]" />
                    <span className="text-xs font-bold text-[#6b1426]">
                      {lang === "ta"
                        ? "பாரம்பரிய பஞ்சாங்க முறைத் தெரிவு (முழுப் பக்க கையெழுத்துப் பார்வை):"
                        : "Traditional Panchangam System View:"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPanchangamTab("thirukanitham")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        panchangamTab === "thirukanitham"
                          ? "bg-[#8e2b1c] text-white shadow-xs"
                          : "bg-white text-[#6f6049] border border-[#8b5a2b]/25 hover:bg-[#fffaf0]"
                      }`}
                    >
                      <span>திருக்கணித பஞ்சாங்கம் (Thirukanitham)</span>
                      {chartResult.panchangam_system !== "vakhyam" && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 text-white font-mono">முதன்மை</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanchangamTab("vakhyam")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        panchangamTab === "vakhyam"
                          ? "bg-[#8e2b1c] text-white shadow-xs"
                          : "bg-white text-[#6f6049] border border-[#8b5a2b]/25 hover:bg-[#fffaf0]"
                      }`}
                    >
                      <span>வாக்கிய பஞ்சாங்கம் (Vakhyam)</span>
                      {chartResult.panchangam_system === "vakhyam" && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 text-white font-mono">முதன்மை</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanchangamTab("both")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        panchangamTab === "both"
                          ? "bg-[#8e2b1c] text-white shadow-xs"
                          : "bg-white text-[#6f6049] border border-[#8b5a2b]/25 hover:bg-[#fffaf0]"
                      }`}
                    >
                      <span>இரண்டும் (Both Systems)</span>
                    </button>
                  </div>
                </div>

                {/* Thirukanitham Complete Full Page Card (Red & Blue Default Ink) */}
                {(panchangamTab === "thirukanitham" || panchangamTab === "both") && (
                  <ThirukanithamCompleteCard chart={chartResult} lang={lang} />
                )}

                {/* Traditional Vakhyam Complete System Full Card */}
                {(panchangamTab === "vakhyam" || panchangamTab === "both") && (
                  <VakhyamCompleteCard chart={chartResult} lang={lang} />
                )}

                {/* 3. Section 2: Complete Panchangam & Subha Yoga Elements */}
                <PanchangamDetailsCard
                  details={chartResult.basic_details}
                  lang={lang}
                />

                {/* 3. Core Charts Side-by-Side: Rasi (D1) and Navamsa (D9) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RasiChart
                    kattamData={chartResult.rasi_kattam}
                    chartStyle={chartResult.chart_style as any}
                    lang={lang}
                  />
                  <NavamsaChart
                    kattamData={chartResult.navamsa_kattam}
                    chartStyle={chartResult.chart_style as any}
                    lang={lang}
                  />
                </div>

                {/* 3. Detailed Rasi, Nakshatra & Pada Predictions */}
                {(chartResult.rasi_nakshatra_predictions || chartResult.detailed_predictions) && (
                  <RasiNakshatraDetailsCard
                    predictions={(chartResult.rasi_nakshatra_predictions || chartResult.detailed_predictions)!}
                    namaAksharas={chartResult.baby_names?.starting_syllables}
                    lang={lang}
                  />
                )}

                {/* 4. Planetary Table */}
                <PlanetaryTable planets={chartResult.planets} lang={lang} />

                {/* 5. Vimshottari Dasha-Bhukti Timeline */}
                <DashaTimeline
                  dashas={chartResult.vimshottari_dasha}
                  lang={lang}
                  dashaBalanceTa={chartResult.basic_details.dasha_balance_ta || undefined}
                  dashaBalanceEn={chartResult.basic_details.dasha_balance_en || undefined}
                />

                {/* 6. Ayurdaya (Longevity Analysis) */}
                {chartResult.ayurdaya && (
                  <AyurdayaCard ayurdaya={chartResult.ayurdaya} lang={lang} />
                )}

                {/* 7. 12 Bhava Predictions (Full mode only) */}
                {chartResult.output_mode === "full" && (
                  <BhavaPredictions bhavas={chartResult.bhava_predictions} lang={lang} />
                )}

                {/* 7. Yogas & Doshas */}
                <YogaDoshaList yogas={chartResult.yogas} doshas={chartResult.doshas} lang={lang} />

                {/* 8. Ashtakavarga Matrix (Full mode only) */}
                {chartResult.output_mode === "full" && (
                  <AshtakavargaTable ashtakavarga={chartResult.ashtakavarga} lang={lang} />
                )}

                {/* 9. Baby Name Suggestions */}
                {chartResult.baby_names && (
                  <BabyNameSuggestions babyNames={chartResult.baby_names} lang={lang} />
                )}

                {/* 10. AI Narration Panel */}
                <NarrationPanel narration={chartResult.narration || undefined} lang={lang} />

                {/* 11. Share Card Preview */}
                <div className="no-print">
                  <ShareCard chart={chartResult} lang={lang} />
                </div>

                {/* 12. Handwritten Manuscript 50-Page Viewer & PDF */}
                <div className="no-print bg-[#fcf8ec] border-2 border-[#b03726]/40 rounded-3xl p-4 md:p-6 shadow-2xl space-y-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#a3917a]/30 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#b03726]/10 flex items-center justify-center text-[#b03726]">
                          <BookOpen className="w-4 h-4" />
                        </span>
                        <h3 className="text-lg md:text-xl font-bold font-script text-[#2b2117]">
                          {lang === "ta"
                            ? "50-பக்க சம்பூர்ண ஜாதக மகா காண்டம் (50-Page Grand Volume)"
                            : "50-Page Vedic Jathaga Grand Volume & Manuscript"}
                        </h3>
                      </div>
                      <p className="text-xs text-[#6f6049] font-tamil">
                        {lang === "ta"
                          ? "தமிழ் தாய் வாழ்த்து • கடவுள் வாழ்த்து • குஜ தோஷ 14 சாஸ்திர விதிகள் • 337 அஷ்டகவர்க்கம் • 16 வர்க்கங்கள் • தசா புக்தி"
                          : "Tamil Thai Vazhthu • Invocations • Kuja Dosha 14 Rules • 337 Sarvashtakavarga • 16 Divisional Charts"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37] rounded-full text-xs font-bold text-[#8e2b1c] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {chartResult.panchangam_system === "vakhyam"
                          ? (lang === "ta" ? "வாக்கிய பஞ்சாங்கம் (சூரிய சித்தாந்தம்)" : "Vakhyam Panchangam")
                          : (lang === "ta" ? "திருக்கணித பஞ்சாங்கம் (சித்திரை பக்ஷம்)" : "Thirukanitham Panchangam")}
                      </span>
                      <HandwrittenPdfButton chart={chartResult} lang={lang} />
                    </div>
                  </div>

                  {/* 14-Chapter Quick Navigation Bar */}
                  <div>
                    <div className="text-[11px] font-bold text-[#8e2b1c] mb-1 flex items-center gap-1 uppercase tracking-wider">
                      <PenLine className="w-3 h-3" />
                      {lang === "ta" ? "அத்தியாயங்கள் வழிசெலுத்தல் (Chapter Quick Jump):" : "Chapter Quick Jump:"}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                      {MANUSCRIPT_CHAPTERS.map((ch) => {
                        const isActive = previewPage >= ch.startPage && previewPage <= ch.endPage;
                        return (
                          <button
                            key={ch.ch}
                            type="button"
                            onClick={() => setPreviewPage(ch.startPage)}
                            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-tamil transition-all border ${
                              isActive
                                ? "bg-[#b03726] text-white border-[#8e2b1c] shadow-sm font-bold"
                                : "bg-[#f4ebd0] text-[#2b2117] border-[#a3917a]/40 hover:bg-[#ebdcb9]"
                            }`}
                            title={`${ch.titleTa} (${ch.startPage}-${ch.endPage})`}
                          >
                            Ch.{ch.ch}: {lang === "ta" ? ch.titleTa : ch.titleEn} (பக்.{ch.startPage})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Page Controls Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ede2c8] p-3 rounded-2xl border border-[#a3917a]/40">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        disabled={previewPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fdf6e3] text-[#2b2117] border border-[#a3917a]/50 text-xs font-bold hover:bg-[#fff] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {lang === "ta" ? "முந்தைய பக்கம்" : "Previous"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewPage((p) => Math.min(50, p + 1))}
                        disabled={previewPage === 50}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fdf6e3] text-[#2b2117] border border-[#a3917a]/50 text-xs font-bold hover:bg-[#fff] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                      >
                        {lang === "ta" ? "அடுத்த பக்கம்" : "Next"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dropdown Selector */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-bold text-[#8e2b1c] whitespace-nowrap">
                        {lang === "ta" ? "பக்கம்:" : "Page:"}
                      </span>
                      <select
                        value={previewPage}
                        onChange={(e) => setPreviewPage(Number(e.target.value))}
                        aria-label={lang === "ta" ? "ஜாதகப் பக்கம் தேர்வு செய்க" : "Select manuscript page"}
                        className="w-full sm:w-[320px] px-2.5 py-1.5 text-xs bg-[#fdf6e3] border border-[#a3917a]/60 rounded-lg text-[#2b2117] font-tamil font-medium shadow-inner focus:outline-none focus:ring-1 focus:ring-[#b03726]"
                      >
                        {MANUSCRIPT_PAGES.map((p) => (
                          <option key={p.page} value={p.page}>
                            {p.page}. {lang === "ta" ? p.titleTa : p.titleEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowIndex(!showIndex)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37] text-xs font-bold text-[#8e2b1c] hover:bg-[#d4af37]/30 transition shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {lang === "ta" ? (showIndex ? "பொருளடக்கம் மூடு" : "பொருளடக்கம் (Index)") : (showIndex ? "Close Index" : "Index of Contents")}
                      </button>
                      <div className="text-xs font-mono font-bold text-[#8e2b1c] bg-[#fdf6e3] px-3 py-1 rounded-full border border-[#a3917a]/40 whitespace-nowrap">
                        {lang === "ta" ? `பக்கம் ${previewPage} / 50` : `Page ${previewPage} of 50`}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Index of Contents */}
                  {showIndex && (
                    <div className="bg-[#fff8ee] border-2 border-[#aa820a] rounded-2xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-[#aa820a]/30 pb-2">
                        <div className="font-bold text-[#8e2b1c] text-sm flex items-center gap-2 font-script">
                          <BookOpen className="w-4 h-4 text-[#b03726]" />
                          {lang === "ta" ? "50-பக்க சம்பூர்ண ஜாதக மகா காண்ட பொருளடக்கம் (Table of Contents)" : "Master Table of Contents (Pages 1 to 50)"}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowIndex(false)}
                          className="text-xs text-[#6f6049] hover:text-[#8e2b1c] font-bold px-2 py-0.5 rounded bg-[#f4ebd0]"
                        >
                          ✕ {lang === "ta" ? "மூடுக" : "Close"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                        {MANUSCRIPT_CHAPTERS.map((ch) => {
                          const chapterPages = MANUSCRIPT_PAGES.filter(
                            (p) => p.page >= ch.startPage && p.page <= ch.endPage
                          );
                          return (
                            <div key={ch.ch} className="bg-[#fcf8ec] border border-[#a3917a]/40 rounded-xl p-2.5 space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold text-[#8e2b1c] border-b border-[#aa820a]/20 pb-1">
                                <span>Ch.{ch.ch}: {lang === "ta" ? ch.titleTa : ch.titleEn}</span>
                                <span className="text-[10px] font-mono bg-[#8e2b1c]/10 text-[#8e2b1c] px-1.5 py-0.5 rounded font-bold">
                                  பக். {ch.startPage}–{ch.endPage}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                {chapterPages.map((pg) => {
                                  const isCurrent = previewPage === pg.page;
                                  return (
                                    <button
                                      key={pg.page}
                                      type="button"
                                      onClick={() => {
                                        setPreviewPage(pg.page);
                                        setShowIndex(false);
                                      }}
                                      className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition ${
                                        isCurrent
                                          ? "bg-[#b03726] text-white font-bold shadow-sm"
                                          : "hover:bg-[#f4ebd0] text-[#2b2117]"
                                      }`}
                                    >
                                      <span className="truncate pr-2">
                                        <span className="font-mono font-bold mr-1.5">#{pg.page}</span>
                                        {lang === "ta" ? pg.titleTa : pg.titleEn}
                                      </span>
                                      <span className="text-[9px] font-mono opacity-80 shrink-0">
                                        {isCurrent ? "தற்போது" : "செல் →"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manuscript Page Viewport (Centered, Crisp A4 Preview) */}
                  <div className="flex justify-center p-2 md:p-6 bg-[#eee4cb] rounded-2xl border-2 border-[#a3917a]/40 shadow-inner overflow-x-auto">
                    <div className="w-[794px] min-w-[794px] bg-[#fcf8ec] rounded-lg shadow-2xl p-2 border border-[#d4af37]/40 flex justify-center">
                      <HandwrittenManuscript chart={chartResult} lang={lang} activePage={previewPage} />
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      disabled={previewPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f4ebd0] text-[#2b2117] border border-[#a3917a]/50 text-xs font-bold hover:bg-[#ebdcb9] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {lang === "ta" ? "முந்தைய பக்கம்" : "Previous"}
                    </button>

                    <div className="text-xs text-[#6f6049] text-center font-tamil">
                      {lang === "ta"
                        ? `தற்போது பார்ப்பது: பக்கம் ${previewPage} — ${MANUSCRIPT_PAGES[previewPage - 1]?.titleTa}`
                        : `Viewing: Page ${previewPage} — ${MANUSCRIPT_PAGES[previewPage - 1]?.titleEn}`}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewPage((p) => Math.min(50, p + 1))}
                      disabled={previewPage === 50}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f4ebd0] text-[#2b2117] border border-[#a3917a]/50 text-xs font-bold hover:bg-[#ebdcb9] disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      {lang === "ta" ? "அடுத்த பக்கம்" : "Next"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* PDF Info Footer Banner */}
                  <div className="bg-[#ebdcb9]/60 border border-[#a3917a]/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-xs text-[#6f6049] font-tamil">
                      {lang === "ta"
                        ? "முழுமையான 50 பக்கங்களும் அடங்கிய சம்பூர்ண ஓலைச்சுவடி ஜாதக நூலை உயர்தர A4 PDF வடிவில் பதிவிறக்கம் செய்ய மேலே உள்ள ‘கையெழுத்து PDF’ பொத்தானை அழுத்தவும்."
                        : "To download the complete 50-page traditional handwritten manuscript as a high-resolution A4 PDF, click the ‘Handwritten PDF’ button."}
                    </p>
                    <div className="shrink-0">
                      <HandwrittenPdfButton chart={chartResult} lang={lang} />
                    </div>
                  </div>
                </div>

                {/* Hidden full-size manuscript for PDF generation (off-screen, renders all 50 pages) */}
                {/* Off-screen full-size manuscript used only for PDF capture.
                    `data-pdf-host` tells lib/pdfExport.ts to move this host back
                    to the origin inside its clone, otherwise html2canvas
                    captures blank paper from the -10000px offset. */}
                <div
                  id="handwritten-manuscript"
                  data-pdf-host
                  className="fixed left-[-10000px] top-0 pointer-events-none"
                  aria-hidden
                >
                  <HandwrittenManuscript chart={chartResult} lang={lang} />
                </div>

                {/* Printed Table of Contents — inserted by HandwrittenPdfButton
                    as page 2 of the PDF, between the cover and the manuscript. */}
                <div
                  data-pdf-host
                  className="fixed left-[-10000px] top-0 pointer-events-none"
                  aria-hidden
                >
                  <ManuscriptTocPage lang={lang} />
                </div>
              </>
            )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#a3917a]/30 py-8 bg-[#ece1c5] text-center text-xs text-[#6f6049] no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2 font-tamil">
          <p>
            MYLoginn Astrology — துல்லியமான கணித விதிகளுடன் அமைக்கப்பட்ட வேத ஜோதிட தளம்
          </p>
          <p className="text-[10px] text-[#8e2b1c] font-mono">
            drawn stroke by stroke • Swiss Ephemeris • Lahiri Ayanamsha • BPHS & Phaladeepika Classical Rules
          </p>
        </div>
      </footer>
    </div>
    </JathagamThemeProvider>
  );
}