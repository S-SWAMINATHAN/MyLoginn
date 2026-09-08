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
import { AyurdayaCard } from "@/components/AyurdayaCard";
import { RasiNakshatraDetailsCard } from "@/components/RasiNakshatraDetailsCard";
import { HandwrittenManuscript } from "@/components/HandwrittenManuscript";
import { HandwrittenPdfButton } from "@/components/HandwrittenPdfButton";
import { GenerateChartRequest, ChartResponse } from "@/lib/types";
import { generateChartApi } from "@/lib/api";
import { Sparkles, Printer, Share2, Heart, Download, Compass, ShieldCheck, PenLine } from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [chartResult, setChartResult] = useState<ChartResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        <section className="relative text-center pt-4 pb-2 no-print space-y-2 overflow-hidden">
          <div className="star-field" aria-hidden="true">
            <span style={{ top: "10%", left: "8%", animationDelay: "0s" }} />
            <span style={{ top: "25%", left: "88%", animationDelay: "0.6s" }} />
            <span style={{ top: "60%", left: "15%", animationDelay: "1.2s" }} />
            <span style={{ top: "70%", left: "92%", animationDelay: "1.8s" }} />
            <span style={{ top: "5%", left: "50%", animationDelay: "2.4s" }} />
          </div>
          <p className="sri font-script text-2xl text-[#2454c7] animate-fade-in-up">ஸ்ரீ</p>
          <p
            className="over-title text-xs tracking-widest text-[#2454c7] animate-fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            AI JATHAGAM · HANDWRITTEN EDITION
          </p>
          <h1
            className="text-3xl sm:text-5xl font-normal font-script text-[#161b33] tracking-tight animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {lang === "ta" ? "AI ஜாதகம்" : "AI Jathagam"}
          </h1>
          <p
            className="text-sm sm:text-base text-[#4a5578] font-script animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            {lang === "ta"
              ? "— பாரம்பரிய முறைப்படி எழுதப்படும் உயர் துல்லிய கணிதக் கையெழுத்து ஜாதகம் —"
              : "— a birth chart, penned the old way —"}
          </p>
        </section>

        {/* Form Intake Card */}
        <section className="no-print animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8b93b5]/30 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-[#2454c7] font-bold font-script">ஸ்ரீ</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-script text-[#161b33]">
                      {chartResult.name} {lang === "ta" ? "அவர்களின் ஜாதகம்" : "Horoscope"}
                    </h2>
                  </div>
                  <p className="text-xs text-[#4a5578] font-tamil mt-1">
                    {chartResult.date_of_birth} | {chartResult.time_of_birth} | {chartResult.place} ({chartResult.timezone})
                  </p>
                </div>

                {/* Print and Export Buttons */}
                <div className="flex items-center gap-2 no-print flex-wrap">
                  <button
                    onClick={handlePrint}
                    className="btn-hand text-xs font-semibold py-2 px-3.5"
                  >
                    <Printer className="w-4 h-4 text-[#2454c7]" />
                    <span>{lang === "ta" ? "அச்சிடுக (Print)" : "Print"}</span>
                  </button>

                  <HandwrittenPdfButton chart={chartResult} lang={lang} />

                  <a
                    href="/porutham"
                    className="btn-hand text-xs font-semibold py-2 px-3.5"
                  >
                    <Heart className="w-4 h-4 text-[#2454c7]" />
                    <span>{lang === "ta" ? "பொருத்தம்" : "Match"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Section 2: Complete Panchangam & Subha Yoga Elements */}
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

            {/* 12. Handwritten Manuscript Preview (for PDF) */}
            <div className="no-print">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold font-script text-[#161b33] flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-[#2454c7]" />
                  {lang === "ta" ? "கையெழுத்து ஓலைச்சுவடி முன்னோட்டம் (Handwritten Manuscript Preview)" : "Handwritten Manuscript Preview (Tamil Kaiyezhuthu)"}
                </h3>
                <span className="text-[11px] text-[#4a5578] font-mono">Kavivanar • Turmeric Paper • Traditional Kattams</span>
              </div>
              <div className="border-2 border-[#a3917a]/40 rounded-2xl overflow-hidden bg-[#fdf6e3] max-h-[560px] overflow-y-auto shadow-xl">
                <div className="scale-[0.62] origin-top-left w-[794px]" style={{ transformOrigin: "top left" }}>
                  <HandwrittenManuscript chart={chartResult} lang={lang} />
                </div>
              </div>
              <p className="text-xs text-[#4a5578] text-center mt-2 font-tamil">
                {lang === "ta" ? "மேலே உள்ள ‘கையெழுத்து PDF’ பொத்தானை அழுத்தி உண்மையான கையெழுத்து மஞ்சள் பனை ஓலை PDF-ஐ பதிவிறக்கவும்." : "Click ‘Handwritten PDF’ above to download true Tamil handwritten palm-leaf PDF."}
              </p>
            </div>

            {/* Hidden full-size manuscript for PDF generation (off-screen) */}
            <div id="handwritten-manuscript" className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden>
              <HandwrittenManuscript chart={chartResult} lang={lang} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#8b93b5]/30 py-8 bg-[#e7eefb] text-center text-xs text-[#4a5578] no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2 font-tamil">
          <p>
            MYLoginn Astrology — துல்லியமான கணித விதிகளுடன் அமைக்கப்பட்ட வேத ஜோதிட தளம்
          </p>
          <p className="text-[10px] text-[#17348f] font-mono">
            drawn stroke by stroke • Swiss Ephemeris • Lahiri Ayanamsha • BPHS & Phaladeepika Classical Rules
          </p>
        </div>
      </footer>
    </div>
  );
}
