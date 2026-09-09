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
import { AyurdayaCard } from "@/components/AyurdayaCard";
import { RasiNakshatraDetailsCard } from "@/components/RasiNakshatraDetailsCard";
import { HandwrittenManuscript } from "@/components/HandwrittenManuscript";
import { HandwrittenPdfButton } from "@/components/HandwrittenPdfButton";
import { GenerateChartRequest, ChartResponse } from "@/lib/types";
import { generateChartApi } from "@/lib/api";
import { Sparkles, Printer, Share2, Heart, Download, Compass, ShieldCheck, PenLine, ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";

const MANUSCRIPT_CHAPTERS = [
  { ch: 1, startPage: 1, endPage: 4, titleTa: "வாழ்த்து & பயோடேட்டா", titleEn: "Invocations & Bio-Data" },
  { ch: 2, startPage: 5, endPage: 7, titleTa: "பஞ்சாங்க கணிதம்", titleEn: "Panchangam Computations" },
  { ch: 3, startPage: 8, endPage: 10, titleTa: "கிரக ஸ்புடம் & திருஷ்டி", titleEn: "Longitudes & Aspects" },
  { ch: 4, startPage: 11, endPage: 17, titleTa: "16 வர்க்க சக்கரங்கள்", titleEn: "16 Varga Chakras" },
  { ch: 5, startPage: 18, endPage: 20, titleTa: "ஷட்பலம் & பாவக பலம்", titleEn: "Shadbala & Strengths" },
  { ch: 6, startPage: 21, endPage: 27, titleTa: "அஷ்டகவர்க்க மகா காண்டம்", titleEn: "Ashtakavarga Master" },
  { ch: 7, startPage: 28, endPage: 30, titleTa: "குஜ தோஷம் & 14 விதிகள்", titleEn: "Kuja Dosha & 14 Rules" },
  { ch: 8, startPage: 31, endPage: 34, titleTa: "யோகங்கள் & தோஷங்கள்", titleEn: "Yogas & Doshas" },
  { ch: 9, startPage: 35, endPage: 37, titleTa: "ஆயுள் கணிதம் & மாரகம்", titleEn: "Ayurdaya & Longevity" },
  { ch: 10, startPage: 38, endPage: 42, titleTa: "120-ஆண்டு தசா புக்தி", titleEn: "Vimshottari Dasha" },
  { ch: 11, startPage: 43, endPage: 46, titleTa: "12 பாவக பலன்கள்", titleEn: "12 Bhava Predictions" },
  { ch: 12, startPage: 47, endPage: 48, titleTa: "கோச்சாரம் & பொருத்தம்", titleEn: "Transits & Porutham" },
  { ch: 13, startPage: 49, endPage: 49, titleTa: "பஞ்ச பட்சி & நாமகரணம்", titleEn: "Pancha Pakshi & Names" },
  { ch: 14, startPage: 50, endPage: 50, titleTa: "பரிகாரம் & மங்கள வாழ்த்து", titleEn: "Remedies & Mangalam" },
];

const MANUSCRIPT_PAGES = [
  { page: 1, titleTa: "முகப்பு அட்டை & மங்கள சுலோகம்", titleEn: "Cover Page & Mangala Sloka" },
  { page: 2, titleTa: "தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து", titleEn: "Tamil Thai & Kadavul Vazhthu" },
  { page: 3, titleTa: "நவக்கிரக தியானம் & காயத்ரி மந்திரங்கள்", titleEn: "Navagraha Dhyanam & Gayatri" },
  { page: 4, titleTa: "ஜாதகர் & பெற்றோர் முழு விபரம் (Bio-Data)", titleEn: "Candidate & Parents Bio-Data" },
  { page: 5, titleTa: "காலக் கணிதம் & 6 யுகாப்தங்கள் (Vakhyam vs Thirukanitham)", titleEn: "6 Historical Eras & Systems" },
  { page: 6, titleTa: "பஞ்சாங்க அங்கங்கள் & நாழிகை கணிதம்", titleEn: "5 Panchanga Angas & Nazhigai" },
  { page: 7, titleTa: "உதயாதி கணிதம் & 24 மணி நேர தின ஹோரை", titleEn: "Sunrise/Sunset & 24 Horas" },
  { page: 8, titleTa: "நவகிரக ஸ்புட அட்டவணை (DMS & பாதங்கள்)", titleEn: "11-Position Planetary Longitudes" },
  { page: 9, titleTa: "கிரக திருஷ்டி & நவதாரா சக்கரம்", titleEn: "Graha Drishti & Navatara Chakra" },
  { page: 10, titleTa: "பாலாதி அவஸ்தைகள் & ஜைமினி காரகங்கள்", titleEn: "Planetary Avasthas & Chara Karakas" },
  { page: 11, titleTa: "லக்ன ராசி சக்கரம் (D1) & நவாம்சம் (D9)", titleEn: "Rasi & Navamsa Chakras" },
  { page: 12, titleTa: "ஸ்ரீபதி பாவக சலிதம் (D13) & ஆரம்ப-மத்திய-அந்த ஸ்புடம்", titleEn: "Bhava Chalit & Cusp Longitudes" },
  { page: 13, titleTa: "ஹோரா (D2), திரேக்காணம் (D3), சதுர்த்தாம்சம் (D4), சப்தாம்சம் (D7)", titleEn: "D2, D3, D4, D7 Divisional Charts" },
  { page: 14, titleTa: "தசாம்சம் (D10), துவாதசாம்சம் (D12), சோடசாம்சம் (D16), விம்சாம்சம் (D20)", titleEn: "D10, D12, D16, D20 Varga Charts" },
  { page: 15, titleTa: "சதுர்விம்சாம்சம் (D24), சப்தவிம்சாம்சம் (D27), திரிம்சாம்சம் (D30), சஷ்டியாம்சம் (D60)", titleEn: "D24, D27, D30, D60 Charts" },
  { page: 16, titleTa: "வர்க்கோத்தம சக்கரம் & வைசேஷிகாம்ச பலம்", titleEn: "Vargottama & Vaisheshikamsa" },
  { page: 17, titleTa: "16 வர்க்க சுருக்க அட்டவணை", titleEn: "16 Shodashavarga Summary Matrix" },
  { page: 18, titleTa: "ஷட்பல ஆறு வகை பலங்கள் (Virupas)", titleEn: "Shadbala 6-Fold Virupas" },
  { page: 19, titleTa: "ஷட்பல ரூபங்கள் & கிரக தரவரிசை பலம்", titleEn: "Shadbala Rupas & Planet Rankings" },
  { page: 20, titleTa: "12 பாவக பல கணிதம் & பல வரிசை", titleEn: "12 Bhava Strengths & Rankings" },
  { page: 21, titleTa: "சர்வ அஷ்டகவர்க்க 337 பிந்து மகா சக்கரம்", titleEn: "Sarvashtakavarga 337 Chakra" },
  { page: 22, titleTa: "சூரியன் & சந்திரன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Sun & Moon Bhinnashtakavarga" },
  { page: 23, titleTa: "செவ்வாய் & புதன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Mars & Mercury Bhinnashtakavarga" },
  { page: 24, titleTa: "குரு & சுக்கிரன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Jupiter & Venus Bhinnashtakavarga" },
  { page: 25, titleTa: "சனி & லக்னம் பின்ன அஷ்டகவர்க்கம்", titleEn: "Saturn & Lagna Bhinnashtakavarga" },
  { page: 26, titleTa: "திரிகோண & ஏகாதிபத்திய சோதனைகள்", titleEn: "Trikona & Ekadhipatya Shodhana" },
  { page: 27, titleTa: "ராசி/கிரக/சோத்ய பிண்ட கணிதம் & கோச்சாரம்", titleEn: "Shodhya Pindas & Transits" },
  { page: 28, titleTa: "குஜ (செவ்வாய்) தோஷ தத்துவம் & நிலைகள்", titleEn: "Kuja Dosha Placements" },
  { page: 29, titleTa: "குஜ தோஷ 14 சாஸ்திர விதிவிலக்குகள் ஆய்வு", titleEn: "14 Classical Cancellation Rules Audit" },
  { page: 30, titleTa: "திருமணப் பொருத்தம், பரிகாரம் & திருத்தலங்கள்", titleEn: "Kuja Dosha Matching & Remedies" },
  { page: 31, titleTa: "மகா ராஜ யோகங்கள் & தன யோகங்கள்", titleEn: "Maha Raja & Dhana Yogas" },
  { page: 32, titleTa: "சந்திர யோகங்கள் & சூரிய யோகங்கள்", titleEn: "Lunar & Solar Yogas" },
  { page: 33, titleTa: "கால சர்ப்ப தோஷம் & பித்ரு தோஷ ஆய்வு", titleEn: "Kala Sarpa & Pitru Doshas" },
  { page: 34, titleTa: "செவ்வாய், மாந்தி, குரு சண்டாள & புனர்பூ தோஷங்கள்", titleEn: "Minor Doshas Analysis" },
  { page: 35, titleTa: "பராசர/ஜைமினி ஆயுள் கணிதம் (Three Pairs)", titleEn: "Parashara Three Pairs Longevity" },
  { page: 36, titleTa: "அஷ்டம ஸ்தான & ஆயுஷ்காரக சனி பலம்", titleEn: "8th House & Saturn Dignity" },
  { page: 37, titleTa: "மாரக, பாதக ஸ்தான ஆய்வு & ஆயுள் பரிகாரங்கள்", titleEn: "Maraka, Badhaka & Life Remedies" },
  { page: 38, titleTa: "ஜெனன தசா இருப்பு நாழிகை & விநாழிகை", titleEn: "Birth Dasha Balance Calculation" },
  { page: 39, titleTa: "120-ஆண்டு விம்சோத்தரி மகா தசா வரிசை", titleEn: "120-Year Vimshottari Timeline" },
  { page: 40, titleTa: "தற்போதைய & அடுத்தடுத்த புக்தி அட்டவணை", titleEn: "Current & Upcoming Bhuktis" },
  { page: 41, titleTa: "அந்தர தசா விபர கணிதம்", titleEn: "Antardasha Sub-Periods" },
  { page: 42, titleTa: "தசா நாதர்கள் வெண்பா பாடல் & பரிகாரங்கள்", titleEn: "Dasha Lord Classical Verses & Rituals" },
  { page: 43, titleTa: "1, 2, 3-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 1, 2, 3 Readings" },
  { page: 44, titleTa: "4, 5, 6-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 4, 5, 6 Readings" },
  { page: 45, titleTa: "7, 8, 9-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 7, 8, 9 Readings" },
  { page: 46, titleTa: "10, 11, 12-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 10, 11, 12 Readings" },
  { page: 47, titleTa: "கோச்சார கிரக நிலைகள் & ஏழரை சனி பலன்கள்", titleEn: "Transits & Sade Sati" },
  { page: 48, titleTa: "10 திருமணப் பொருத்தங்கள் & அஷ்டகூட வழிகாட்டி", titleEn: "10 Poruthams & Kuta Guide" },
  { page: 49, titleTa: "அகஸ்தியர் பஞ்ச பட்சி, எண் கணிதம் & 108 நாம அக்ஷரம்", titleEn: "Pancha Pakshi, Numerology & Names" },
  { page: 50, titleTa: "சர்வ தோஷ சாந்தி, பரிகாரங்கள் & மங்கள வாழ்த்து", titleEn: "Master Remedies & Mangalam" },
];

export default function HomePage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [chartResult, setChartResult] = useState<ChartResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [showIndex, setShowIndex] = useState<boolean>(false);

  const handleGenerate = async (formData: GenerateChartRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateChartApi(formData);
      setChartResult(res);

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
          <section id="chart-results-section" className="space-y-10 pt-4 animate-fade-in">
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

            {/* 2. Traditional Vakhyam Complete System Full Card */}
            <VakhyamCompleteCard chart={chartResult} lang={lang} />

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

            {/* 7. 12 Bhava Predictions (Shown in Full mode or on drilldown) */}
            {chartResult.output_mode === "full" && (
              <BhavaPredictions bhavas={chartResult.bhava_predictions} lang={lang} />
            )}

            {/* 7. Yogas & Doshas */}
            <YogaDoshaList yogas={chartResult.yogas} doshas={chartResult.doshas} lang={lang} />

            {/* 8. Ashtakavarga Matrix */}
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
            <div id="handwritten-manuscript" className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden>
              <HandwrittenManuscript chart={chartResult} lang={lang} />
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
  );
}
