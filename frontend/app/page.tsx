"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { JathagamThemeProvider, THEME_SCOPE_CLASS } from "@/lib/jathagamTheme";

// Bug 2: class for every handwritten "document island" — themed by the ink /
// typeface panel and rendered with the legacy handwriting styles, while the
// controls around it use the website's normal UI.
const DOC = `${THEME_SCOPE_CLASS} jathagam-legacy`;
import { MANUSCRIPT_CHAPTERS, MANUSCRIPT_PAGES } from "@/lib/manuscriptIndex";
import { Sparkles, Printer, Share2, Heart, Download, Compass, ShieldCheck, PenLine, ChevronLeft, ChevronRight, BookOpen, Layers, Loader2 } from "lucide-react";


export default function HomePage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [chartResult, setChartResult] = useState<ChartResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [showIndex, setShowIndex] = useState<boolean>(false);
  const [panchangamTab, setPanchangamTab] = useState<"thirukanitham" | "vakhyam" | "both">("thirukanitham");
  const [printPreparing, setPrintPreparing] = useState(false);

  /**
   * The name to show above the report.
   *
   * A name typed in Thanglish and confirmed as a Tamil suggestion is stored
   * in Tamil, which is right for the Tamil view and for the handwritten
   * manuscript — but it left the English view showing a Tamil name with no
   * way back. The backend now echoes the Latin spelling as `name_en`, so
   * English readers get that when it exists, and the Tamil stays everywhere
   * else. A name typed directly is shown exactly as typed, in both.
   */
  const displayName =
    lang === "en" && chartResult?.name_en ? chartResult.name_en : chartResult?.name;

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

  /**
   * PRINT — cover, then contents, then the rest of the manuscript, matching
   * the PDF's page order, with no overlapping or duplicated sheets.
   *
   * `window.print()` just rasterises whatever is currently in normal
   * document flow, in DOM order — it has no idea the PDF exporter
   * (HandwrittenPdfButton.tsx / lib/pdfExport.ts) reorders and paginates
   * these same hidden `#handwritten-manuscript` / `#manuscript-toc-page`
   * hosts in JS before rasterising them. Left alone, that mismatch produced
   * three symptoms:
   *
   *   1. PAGE 1 OVERLAPPING PAGE 2 — `.manuscript-page` had no
   *      `break-inside: avoid` for print (see globals.css), so a page whose
   *      real height landed even slightly past the A4 box got sliced
   *      mid-way across two physical sheets instead of starting a clean new
   *      one, which read as the cover's content bleeding into the next page.
   *   2. THE TABLE OF CONTENTS PRINTING AS PAGE 53 INSTEAD OF PAGE 2 — the
   *      TOC host sits *after* the 50-page manuscript host in the JSX below,
   *      so a native print, which only follows DOM order, always put it
   *      last. The PDF avoids this by reordering nodes in JS before it
   *      rasterises them; print needed the same trick.
   *   3. 53 SHEETS INSTEAD OF 51 — a trailing `page-break-after` left on the
   *      very last manuscript page forced one extra blank sheet, and the
   *      real TOC host printing a second time (once naturally at the end,
   *      once more from the fix for #2 if not handled carefully) added
   *      another.
   *
   * Fix: clone — never move — the TOC node into place right after the cover
   * page for this print only. The clone drops its id, so the PDF button's
   * `document.getElementById("manuscript-toc-page")` still finds only the
   * untouched original. The original TOC host is hidden for the duration of
   * the print (so it doesn't also print a second time at the end), and the
   * page that really is last has its trailing page-break cleared. Both are
   * undone the moment the print dialog closes.
   */
  const handlePrint = async () => {
    setPrintPreparing(true);

    const container = document.getElementById("handwritten-manuscript");
    const tocOriginal = document.getElementById("manuscript-toc-page");

    let tocClone: HTMLElement | null = null;
    let originalTocDisplay = "";
    let lastPage: HTMLElement | null = null;

    if (container && tocOriginal) {
      // Same lookup HandwrittenPdfButton.tsx already uses to find the real,
      // laid-out pages inside this off-screen host — filtering out anything
      // with no box (a stray hidden-preview clone) that would otherwise be
      // mistaken for a real page.
      const pages = Array.from(
        container.querySelectorAll<HTMLElement>(".manuscript-page")
      ).filter((el) => el.offsetWidth > 0 && el.offsetHeight > 0);
      const cover = pages[0];
      lastPage = pages[pages.length - 1] || null;

      if (cover && cover.parentNode) {
        tocClone = tocOriginal.cloneNode(true) as HTMLElement;
        tocClone.removeAttribute("id");
        tocClone.setAttribute("data-print-toc-clone", "true");
        cover.parentNode.insertBefore(tocClone, cover.nextSibling);

        originalTocDisplay = tocOriginal.style.display;
        tocOriginal.style.display = "none";
      }

      if (lastPage) lastPage.setAttribute("data-print-last-page", "true");
    }

    const cleanup = () => {
      if (tocClone && tocClone.parentNode) {
        tocClone.parentNode.removeChild(tocClone);
      }
      if (tocOriginal) {
        tocOriginal.style.display = originalTocDisplay;
      }
      if (lastPage) lastPage.removeAttribute("data-print-last-page");
      window.removeEventListener("afterprint", cleanup);
      setPrintPreparing(false);
    };
    window.addEventListener("afterprint", cleanup);

    // Wait for the manuscript's webfonts to finish loading before printing —
    // the same guarantee lib/pdfExport.ts already gives the (correctly
    // paginated) PDF path via waitForRenderReady — so native print measures
    // Tamil text with the real cursive face instead of a taller fallback
    // font that would throw pagination off.
    try {
      // @ts-ignore — Font Loading API may be missing from older TS DOM libs
      if (document.fonts && document.fonts.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
    } catch {
      /* Font Loading API unavailable — print anyway */
    }
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));

    window.print();

    // Safety net: some browsers / "print to PDF" flows don't reliably fire
    // `afterprint`, so make sure the clone and the hidden-TOC override never
    // linger in the live DOM (or the button stays stuck "preparing").
    setTimeout(cleanup, 5000);
  };

  return (
    <JathagamThemeProvider>
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Hero — MyLoginn blue system */}
        <section className="no-print relative pt-4 pb-2 text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-3xl bg-brand-900 shadow-lift ring-1 ring-brand-400/30 animate-scale-in sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-512.png" alt="MyLoginn Astrology" width={112} height={112} className="h-full w-full object-cover" />
          </div>
          <p className="story-eyebrow mt-5 justify-center">AI JATHAGAM · HANDWRITTEN EDITION</p>
<h1 className="story-heading mt-3">
  <span
    className="brand-gradient-text"
    style={{ paddingTop: "0.1em", paddingBottom: "0.3em" }}
  >
    {lang === "ta" ? (
      <>
        <span className="mr-3">AI</span>
        <span>ஜாதகம்</span>
      </>
    ) : (
      "AI Jathagam"
    )}
  </span>
</h1>





          <p className="mx-auto mt-4 max-w-3xl text-base text-muted sm:text-lg">
            {lang === "ta"
              ? "பாரம்பரிய முறைப்படி எழுதப்படும் உயர் துல்லிய கணிதக் கையெழுத்து ஜாதகம்"
              : "A birth chart, penned the old way — with modern astronomical precision"}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="chip-brand">Swiss Ephemeris</span>
            <span className="chip-brand">{lang === "ta" ? "திருக்கணிதம் & வாக்கியம்" : "Thirukanitham & Vakhyam"}</span>
            <span className="chip-brand">{lang === "ta" ? "50-பக்க கையெழுத்து ஜாதகம்" : "50-page handwritten manuscript"}</span>
            <span className="chip-brand">{lang === "ta" ? "தமிழ் · கேரளா · வட இந்தியா" : "Tamil · Kerala · North Indian charts"}</span>
          </div>
        </section>

        {/* Form Intake Card */}
        <section className="no-print">
          <BirthDetailsForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Computed Jathagam Output Display
            Bug 2: the results now sit directly on the website (no parchment
            "desk"). Everything that is a CONTROL — summary card, tabs, the
            50-page viewer toolbar, buttons — uses the website's own classes.
            Everything that is the handwritten DOCUMENT sits in a "document
            island" (DOC below) that the ink-colour / typeface panel themes,
            and that both PDF exporters and Print rasterise. */}
        {chartResult && (
          <section id="chart-results-section" className="space-y-6">
            <JathagamThemePanel lang={lang} />

            {chartResult.output_mode === "single_page" ? (
              /* SINGLE PAGE MODE — only the one-page sheet (with its own
                 website-style toolbar + PDF button). */
              <div className={DOC}>
                <SinglePageReport chart={chartResult} lang={lang} />
              </div>
            ) : (
              /* FULL MODE */
              <>
              {/* no-print: Print outputs the hidden manuscript hosts below,
                  exactly like the 50-page PDF (see globals.css @media print). */}
              <div className="no-print space-y-8">
                {/* Summary + actions — website card (Bug 2). The facts line
                    also reads the REAL schema fields now: it used
                    moon_sign_ta / nakshatra_ta / ascendant_sign_ta, which do
                    not exist, so it printed "Rasi () · Lagna ()". */}
                <div className="card p-5 sm:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="min-w-0">
                      <p className="story-eyebrow">{lang === "ta" ? "உங்கள் ஜாதகம்" : "Your Jathagam"}</p>
                      <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">
                        {displayName} {lang === "ta" ? "அவர்களின் ஜாதகம்" : "— Horoscope"}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {chartResult.date_of_birth} · {chartResult.time_of_birth} · {chartResult.place} ({chartResult.timezone})
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip-brand">
                          {lang === "ta" ? "லக்னம்" : "Lagna"}: {lang === "ta" ? chartResult.basic_details.lagnam_ta : chartResult.basic_details.lagnam}
                        </span>
                        <span className="chip-brand">
                          {lang === "ta" ? "ராசி" : "Rasi"}: {lang === "ta" ? chartResult.basic_details.rasi_ta : chartResult.basic_details.rasi}
                        </span>
                        <span className="chip-brand">
                          {lang === "ta" ? "நட்சத்திரம்" : "Star"}: {lang === "ta" ? chartResult.basic_details.nakshatram_ta : chartResult.basic_details.nakshatram}
                          {" — "}
                          {lang === "ta" ? `${chartResult.basic_details.pada}-ம் பாதம்` : `Pada ${chartResult.basic_details.pada}`}
                        </span>
                        {(lang === "ta" ? chartResult.basic_details.dasha_balance_ta : chartResult.basic_details.dasha_balance_en) && (
                          <span className="chip">
                            {lang === "ta" ? "இருப்பு தசை" : "Dasha balance"}:{" "}
                            {lang === "ta" ? chartResult.basic_details.dasha_balance_ta : chartResult.basic_details.dasha_balance_en}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button onClick={handlePrint} disabled={printPreparing} className="btn-secondary text-xs">
                        {printPreparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                        <span>
                          {printPreparing
                            ? (lang === "ta" ? "தயாராகிறது..." : "Preparing...")
                            : (lang === "ta" ? "அச்சிடுக" : "Print")}
                        </span>
                      </button>
                      <HandwrittenPdfButton chart={chartResult} lang={lang} />
                      <a href="/porutham" className="btn-secondary text-xs">
                        <Heart className="w-4 h-4" />
                        <span>{lang === "ta" ? "பொருத்தம்" : "Match"}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 1. Parents & Candidate Bio-Data */}
                <div className={DOC}>
                  <BioDataCard chart={chartResult} lang={lang} />
                </div>

                {/* 2. Panchangam system selector — website segmented control */}
                <div className="card p-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-1">
                    <BookOpen className="w-4 h-4 text-brand-fg" />
                    <span className="text-xs font-semibold text-foreground">
                      {lang === "ta" ? "பஞ்சாங்க முறை (முழுப் பக்க பார்வை):" : "Panchangam system view:"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(
                      [
                        ["thirukanitham", lang === "ta" ? "திருக்கணிதம்" : "Thirukanitham", chartResult.panchangam_system !== "vakhyam"],
                        ["vakhyam", lang === "ta" ? "வாக்கியம்" : "Vakhyam", chartResult.panchangam_system === "vakhyam"],
                        ["both", lang === "ta" ? "இரண்டும்" : "Both systems", false],
                      ] as const
                    ).map(([key, text, primary]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPanchangamTab(key)}
                        className={`${panchangamTab === key ? "choice choice-active" : "choice"} inline-flex items-center gap-1.5 py-2`}
                      >
                        <span>{text}</span>
                        {primary && (
                          <span className={`text-[9px] px-1.5 rounded-full ${panchangamTab === key ? "bg-white/25" : "bg-brand-500/10 text-brand-fg"}`}>
                            {lang === "ta" ? "முதன்மை" : "primary"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3+. The handwritten report sections */}
                <div className={`${DOC} space-y-10`}>
                  {(panchangamTab === "thirukanitham" || panchangamTab === "both") && (
                    <ThirukanithamCompleteCard chart={chartResult} lang={lang} />
                  )}
                  {(panchangamTab === "vakhyam" || panchangamTab === "both") && (
                    <VakhyamCompleteCard chart={chartResult} lang={lang} />
                  )}

                  <PanchangamDetailsCard details={chartResult.basic_details} lang={lang} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RasiChart kattamData={chartResult.rasi_kattam} chartStyle={chartResult.chart_style as any} lang={lang} />
                    <NavamsaChart kattamData={chartResult.navamsa_kattam} chartStyle={chartResult.chart_style as any} lang={lang} />
                  </div>

                  {(chartResult.rasi_nakshatra_predictions || chartResult.detailed_predictions) && (
                    <RasiNakshatraDetailsCard
                      predictions={(chartResult.rasi_nakshatra_predictions || chartResult.detailed_predictions)!}
                      namaAksharas={chartResult.baby_names?.starting_syllables}
                      lang={lang}
                    />
                  )}

                  <PlanetaryTable planets={chartResult.planets} lang={lang} />

                  <DashaTimeline
                    dashas={chartResult.vimshottari_dasha}
                    lang={lang}
                    dashaBalanceTa={chartResult.basic_details.dasha_balance_ta || undefined}
                    dashaBalanceEn={chartResult.basic_details.dasha_balance_en || undefined}
                  />

                  {chartResult.ayurdaya && <AyurdayaCard ayurdaya={chartResult.ayurdaya} lang={lang} />}

                  {chartResult.output_mode === "full" && (
                    <BhavaPredictions bhavas={chartResult.bhava_predictions} lang={lang} />
                  )}

                  <YogaDoshaList yogas={chartResult.yogas} doshas={chartResult.doshas} lang={lang} />

                  {chartResult.output_mode === "full" && (
                    <AshtakavargaTable ashtakavarga={chartResult.ashtakavarga} lang={lang} />
                  )}

                  {chartResult.baby_names && <BabyNameSuggestions babyNames={chartResult.baby_names} lang={lang} />}

                  <NarrationPanel narration={chartResult.narration || undefined} lang={lang} />

                  <ShareCard chart={chartResult} lang={lang} />
                </div>

                {/* 12. 50-page manuscript viewer — website card chrome around a
                    document island that holds only the page preview. */}
                <div className="card p-4 md:p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-soft pb-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 shrink-0 rounded-xl brand-gradient-bg flex items-center justify-center shadow-soft">
                          <BookOpen className="w-4 h-4 text-white" />
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-foreground">
                          {lang === "ta" ? "50-பக்க சம்பூர்ண ஜாதகம்" : "50-Page Complete Jathagam"}
                        </h3>
                      </div>
                      <p className="text-xs text-muted">
                        {lang === "ta"
                          ? "தமிழ் தாய் வாழ்த்து • கடவுள் வாழ்த்து • குஜ தோஷ 14 சாஸ்திர விதிகள் • 337 அஷ்டகவர்க்கம் • 16 வர்க்கங்கள் • தசா புக்தி"
                          : "Invocations • Kuja Dosha 14 rules • 337 Sarvashtakavarga • 16 divisional charts • Dasha-Bhukti"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="chip-brand">
                        <Layers className="w-3.5 h-3.5" />
                        {chartResult.panchangam_system === "vakhyam"
                          ? (lang === "ta" ? "வாக்கிய பஞ்சாங்கம்" : "Vakhyam Panchangam")
                          : (lang === "ta" ? "திருக்கணித பஞ்சாங்கம்" : "Thirukanitham Panchangam")}
                      </span>
                      <HandwrittenPdfButton chart={chartResult} lang={lang} />
                    </div>
                  </div>

                  {/* Chapter quick jump */}
                  <div>
                    <div className="field-label flex items-center gap-1">
                      <PenLine className="w-3 h-3" />
                      {lang === "ta" ? "அத்தியாயங்கள்" : "Chapters"}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                      {MANUSCRIPT_CHAPTERS.map((ch) => {
                        const isActive = previewPage >= ch.startPage && previewPage <= ch.endPage;
                        return (
                          <button
                            key={ch.ch}
                            type="button"
                            onClick={() => setPreviewPage(ch.startPage)}
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs border transition-all ${
                              isActive
                                ? "border-brand-600 text-white font-semibold brand-gradient-bg shadow-soft"
                                : "border-line bg-surface-2 text-foreground hover:border-brand-400"
                            }`}
                            title={`${ch.titleTa} (${ch.startPage}-${ch.endPage})`}
                          >
                            {ch.ch}. {lang === "ta" ? ch.titleTa : ch.titleEn}
                            <span className="ml-1 opacity-70">({lang === "ta" ? "பக்." : "p."}{ch.startPage})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Page controls */}
                  <div className="well p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setPreviewPage((p) => Math.max(1, p - 1))} disabled={previewPage === 1} className="btn-secondary text-xs py-1.5">
                        <ChevronLeft className="w-4 h-4" />
                        {lang === "ta" ? "முந்தைய" : "Previous"}
                      </button>
                      <button type="button" onClick={() => setPreviewPage((p) => Math.min(50, p + 1))} disabled={previewPage === 50} className="btn-secondary text-xs py-1.5">
                        {lang === "ta" ? "அடுத்த" : "Next"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-semibold text-muted whitespace-nowrap">{lang === "ta" ? "பக்கம்:" : "Page:"}</span>
                      <select
                        value={previewPage}
                        onChange={(e) => setPreviewPage(Number(e.target.value))}
                        aria-label={lang === "ta" ? "ஜாதகப் பக்கம் தேர்வு செய்க" : "Select manuscript page"}
                        className="field w-full sm:w-[320px] py-1.5 text-xs"
                      >
                        {MANUSCRIPT_PAGES.map((p) => (
                          <option key={p.page} value={p.page}>
                            {p.page}. {lang === "ta" ? p.titleTa : p.titleEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setShowIndex(!showIndex)} className="btn-secondary text-xs py-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {lang === "ta" ? (showIndex ? "பொருளடக்கம் மூடு" : "பொருளடக்கம்") : (showIndex ? "Close index" : "Contents")}
                      </button>
                      <span className="chip-brand whitespace-nowrap">
                        {lang === "ta" ? `பக்கம் ${previewPage} / 50` : `Page ${previewPage} of 50`}
                      </span>
                    </div>
                  </div>

                  {/* Contents */}
                  {showIndex && (
                    <div className="card p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border-soft pb-2">
                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-brand-fg" />
                          {lang === "ta" ? "50-பக்க ஜாதக பொருளடக்கம்" : "Table of contents (pages 1–50)"}
                        </div>
                        <button type="button" onClick={() => setShowIndex(false)} className="btn-ghost text-xs py-1">
                          ✕ {lang === "ta" ? "மூடுக" : "Close"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                        {MANUSCRIPT_CHAPTERS.map((ch) => {
                          const chapterPages = MANUSCRIPT_PAGES.filter((p) => p.page >= ch.startPage && p.page <= ch.endPage);
                          return (
                            <div key={ch.ch} className="well p-2.5 space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border-soft pb-1">
                                <span>{ch.ch}. {lang === "ta" ? ch.titleTa : ch.titleEn}</span>
                                <span className="chip-brand text-[10px] py-0">
                                  {lang === "ta" ? "பக்." : "p."} {ch.startPage}–{ch.endPage}
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
                                      className={`w-full text-left px-2 py-1 rounded-lg text-[11px] flex items-center justify-between transition ${
                                        isCurrent ? "brand-gradient-bg text-white font-semibold" : "hover:bg-brand-500/10 text-foreground"
                                      }`}
                                    >
                                      <span className="truncate pr-2">
                                        <span className="font-semibold mr-1.5">#{pg.page}</span>
                                        {lang === "ta" ? pg.titleTa : pg.titleEn}
                                      </span>
                                      <span className="text-[9px] opacity-80 shrink-0">
                                        {isCurrent ? (lang === "ta" ? "தற்போது" : "current") : "→"}
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

                  {/* Page preview — the only document island in this card */}
                  <div className="well flex justify-center p-2 md:p-6 overflow-x-auto">
                    <div className={`${DOC} w-[794px] min-w-[794px] flex justify-center`}>
                      <HandwrittenManuscript chart={chartResult} lang={lang} activePage={previewPage} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button type="button" onClick={() => setPreviewPage((p) => Math.max(1, p - 1))} disabled={previewPage === 1} className="btn-secondary text-xs py-1.5">
                      <ChevronLeft className="w-4 h-4" />
                      {lang === "ta" ? "முந்தைய" : "Previous"}
                    </button>
                    <div className="text-xs text-muted text-center">
                      {lang === "ta"
                        ? `பக்கம் ${previewPage} — ${MANUSCRIPT_PAGES[previewPage - 1]?.titleTa}`
                        : `Page ${previewPage} — ${MANUSCRIPT_PAGES[previewPage - 1]?.titleEn}`}
                    </div>
                    <button type="button" onClick={() => setPreviewPage((p) => Math.min(50, p + 1))} disabled={previewPage === 50} className="btn-secondary text-xs py-1.5">
                      {lang === "ta" ? "அடுத்த" : "Next"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden full-size hosts used ONLY by the PDF exporter and Print.
                  They live inside a document island so the chosen ink/typeface
                  is applied to them too — the download always matches the screen.
                  `data-pdf-host` tells lib/pdfExport.ts / the print CSS to bring
                  them back into place when capturing. */}
              <div className={DOC}>
                <div id="handwritten-manuscript" data-pdf-host className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden>
                  <HandwrittenManuscript chart={chartResult} lang={lang} />
                </div>
                {/* Printed contents page — inserted as page 2 of the PDF / print. */}
                <div data-pdf-host className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden>
                  <ManuscriptTocPage lang={lang} />
                </div>
              </div>
              </>
            )}
          </section>
        )}
      </main>

      <Footer lang={lang} />
    </div>
    </JathagamThemeProvider>
  );
}