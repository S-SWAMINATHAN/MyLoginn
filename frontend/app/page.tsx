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
import { GenerateChartRequest, ChartResponse } from "@/lib/types";
import { generateChartApi } from "@/lib/api";
import { Sparkles, Printer, Share2, Heart, Download, Compass, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-[#0d0a0b] text-[#f5eedb]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 no-print">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b1426]/50 border border-[#ffd700]/40 text-xs font-semibold text-[#ffd700] shadow-lg shadow-[#ffd700]/5">
            <Sparkles className="w-4 h-4 text-[#ffd700] animate-spin" style={{ animationDuration: "6s" }} />
            <span>
              {lang === "ta"
                ? "சுவிஸ் எபிமெரிஸ் துல்லியக் கணிதம் (Swiss Ephemeris Lahiri)"
                : "Deterministic Sub-Arcsecond Ephemeris Engine"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-tight gold-gradient-text">
            {lang === "ta" ? "முழுமையான தமிழ் வேத ஜாதகம்" : "Complete Vedic Jathagam Generator"}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#e0b87f] font-tamil">
            {lang === "ta"
              ? "ராசி, நவாம்சம், 12 பாவங்கள், விம்சோத்தரி திசா புக்தி, அஷ்டகவர்க்கம் மற்றும் பாரம்பரிய ஓலைச்சுவடி வடிவம்"
              : "Generate authentic Rasi, Navamsa, 12 Bhavas, Vimshottari Dasha, Yogas, Ashtakavarga & Manuscript Style Charts"}
          </p>
        </section>

        {/* Form Intake Card */}
        <section className="no-print">
          <BirthDetailsForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Computed Jathagam Output Display */}
        {chartResult && (
          <section id="chart-results-section" className="space-y-10 pt-4 animate-fade-in">
            {/* 1. Header Banner */}
            <div className="palm-leaf-dark rounded-3xl p-6 sm:p-8 border-2 border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d4af37]/20 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-[#ffd700] font-bold">ௐ</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-tamil text-white">
                      {chartResult.name} {lang === "ta" ? "அவர்களின் ஜாதகம்" : "Horoscope"}
                    </h2>
                  </div>
                  <p className="text-xs text-[#e0b87f] font-tamil mt-1">
                    {chartResult.date_of_birth} | {chartResult.time_of_birth} | {chartResult.place} ({chartResult.timezone})
                  </p>
                </div>

                {/* Print and Export Buttons */}
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-[#6b1426] border border-[#ffd700]/60 rounded-xl text-xs font-bold text-[#ffd700] flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{lang === "ta" ? "அச்சிடுக (Print PDF)" : "Print / PDF"}</span>
                  </button>

                  <a
                    href="/porutham"
                    className="px-4 py-2 bg-[#25181c] border border-[#d4af37]/40 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 hover:bg-white/10 transition-all"
                  >
                    <Heart className="w-4 h-4 text-[#e65c00]" />
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

            {/* 4. Planetary Table */}
            <PlanetaryTable planets={chartResult.planets} lang={lang} />

            {/* 5. Vimshottari Dasha-Bhukti Timeline */}
            <DashaTimeline
              dashas={chartResult.vimshottari_dasha}
              lang={lang}
              dashaBalanceTa={chartResult.basic_details.dasha_balance_ta}
              dashaBalanceEn={chartResult.basic_details.dasha_balance_en}
            />

            {/* 6. 12 Bhava Predictions (Shown in Full mode or on drilldown) */}
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
            <NarrationPanel narration={chartResult.narration} lang={lang} />

            {/* 11. Share Card Preview */}
            <div className="no-print">
              <ShareCard chart={chartResult} lang={lang} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 py-8 bg-[#0a0708] text-center text-xs text-[#d4af37]/60 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2 font-tamil">
          <p>
            AI Jathagam Generator — துல்லியமான கணித விதிகளுடன் அமைக்கப்பட்ட வேத ஜோதிட தளம்
          </p>
          <p className="text-[10px] text-white/40 font-mono">
            Powered by Swiss Ephemeris • Lahiri Ayanamsha • BPHS & Phaladeepika Classical Rules
          </p>
        </div>
      </footer>
    </div>
  );
}
