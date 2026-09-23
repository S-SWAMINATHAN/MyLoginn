"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { RasiPickerGrid } from "@/components/RasiPickerGrid";
import { RasiHoroscopeCard } from "@/components/RasiHoroscopeCard";
import { RasiLoveHoroscopeCard } from "@/components/RasiLoveHoroscopeCard";
import { getRasiHoroscopeApi, getRasiLoveHoroscopeApi } from "@/lib/api";
import { RasiHoroscopeResult, RasiLoveHoroscopeResult } from "@/lib/types";
import { Sun, CalendarDays, CalendarRange, CalendarClock, Heart } from "lucide-react";

type HoroscopeTab = "daily" | "weekly" | "monthly" | "yearly" | "love";

const TABS: { id: HoroscopeTab; ta: string; en: string; icon: React.ReactNode }[] = [
  { id: "daily", ta: "தினசரி", en: "Daily", icon: <Sun className="w-4 h-4" /> },
  { id: "weekly", ta: "வாராந்திர", en: "Weekly", icon: <CalendarDays className="w-4 h-4" /> },
  { id: "monthly", ta: "மாதாந்திர", en: "Monthly", icon: <CalendarRange className="w-4 h-4" /> },
  { id: "yearly", ta: "வருடாந்திர", en: "Yearly", icon: <CalendarClock className="w-4 h-4" /> },
  { id: "love", ta: "காதல் பலன்", en: "Love", icon: <Heart className="w-4 h-4" /> },
];

export default function HoroscopePage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [activeTab, setActiveTab] = useState<HoroscopeTab>("daily");

  // Daily/Weekly/Monthly/Yearly state
  const [selectedRasi, setSelectedRasi] = useState<number | null>(null);
  const [horoscopeResult, setHoroscopeResult] = useState<RasiHoroscopeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Love tab state
  const [loveRasi1, setLoveRasi1] = useState<number | null>(null);
  const [loveRasi2, setLoveRasi2] = useState<number | null>(null);
  const [loveResult, setLoveResult] = useState<RasiLoveHoroscopeResult | null>(null);
  const [loveLoading, setLoveLoading] = useState(false);
  const [loveError, setLoveError] = useState<string | null>(null);

  const handleTabChange = (tab: HoroscopeTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setHoroscopeResult(null);
    setSelectedRasi(null);
    setErrorMessage(null);
    // The Love tab kept its own result across tab changes, so leaving Love
    // and coming back showed the previous pair's verdict. Same stale-result
    // class as Bugs 3 and 4 — cleared here too.
    setLoveResult(null);
    setLoveError(null);
    setLoveRasi1(null);
    setLoveRasi2(null);
  };

  const handleSelectRasi = async (rasiNumber: number) => {
    setSelectedRasi(rasiNumber);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const period = activeTab as "daily" | "weekly" | "monthly" | "yearly";
      const res = await getRasiHoroscopeApi(period, rasiNumber);
      setHoroscopeResult(res);
      setTimeout(() => {
        document.getElementById("horoscope-result-view")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to fetch horoscope.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckLove = async () => {
    if (!loveRasi1 || !loveRasi2) return;
    setLoveLoading(true);
    setLoveError(null);
    try {
      const res = await getRasiLoveHoroscopeApi(loveRasi1, loveRasi2);
      setLoveResult(res);
      setTimeout(() => {
        document.getElementById("love-result-view")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setLoveError(err.message || "Failed to fetch love horoscope.");
    } finally {
      setLoveLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHero
          icon={<Sun className="h-7 w-7" />}
          eyebrow="AI Jathagam · Gochara Rasi Horoscope"
          title={lang === "ta" ? "ராசி" : "Rasi"}
          highlight={lang === "ta" ? "பலன்கள்" : "Horoscope"}
          tagline="— grounded in real transit positions, not guesswork —"
          description={
            lang === "ta"
              ? "உங்கள் ராசியைத் தேர்ந்தெடுக்கவும் — சூரிய, சந்திர, செவ்வாய் உள்ளிட்ட கிரகங்களின் தற்போதைய நிலைகளின் அடிப்படையில், கோச்சார பலன்கள் கணிக்கப்படுகிறது."
              : "Select your Rasi to see Gochara (transit) predictions computed from the actual current positions of the planets — not a generic template."
          }
        />

        {/* Tab Switcher */}
        <section className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-soft" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                  activeTab === tab.id ? "brand-gradient-bg text-white shadow-soft" : "text-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span>{lang === "ta" ? tab.ta : tab.en}</span>
              </button>
            ))}
          </div>
        </section>

        {activeTab !== "love" ? (
          <>
            {/* Daily/Weekly/Monthly/Yearly: Rasi picker */}
            <section className="card p-6 sm:p-8">
              <RasiPickerGrid
                selected={selectedRasi}
                onSelect={handleSelectRasi}
                lang={lang}
                label={lang === "ta" ? "உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்" : "Select your Rasi"}
              />
              {isLoading && (
                <div className="mt-4 text-center text-sm text-muted">
                  {lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing…"}
                </div>
              )}
              {errorMessage && (
                <div role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
                  {errorMessage}
                </div>
              )}
            </section>

            {horoscopeResult && (
              <section id="horoscope-result-view">
                <RasiHoroscopeCard result={horoscopeResult} lang={lang} />
              </section>
            )}
          </>
        ) : (
          <>
            {/* Love tab: two Rasi pickers */}
            <section className="card p-6 sm:p-8 space-y-6">
              <RasiPickerGrid
                selected={loveRasi1}
                onSelect={setLoveRasi1}
                lang={lang}
                label={lang === "ta" ? "உங்கள் ராசி" : "Your Rasi"}
              />
              <div className="border-t border-border-soft pt-6">
                <RasiPickerGrid
                  selected={loveRasi2}
                  onSelect={setLoveRasi2}
                  lang={lang}
                  label={lang === "ta" ? "துணையின் ராசி" : "Partner's Rasi"}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleCheckLove}
                  disabled={!loveRasi1 || !loveRasi2 || loveLoading}
                  className="btn-primary px-8 py-3"
                >
                  {loveLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  <span>{lang === "ta" ? "பொருத்தம் பார்க்க" : "Check Compatibility"}</span>
                </button>
              </div>

              {loveError && (
                <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
                  {loveError}
                </div>
              )}
            </section>

            {loveResult && (
              <section id="love-result-view">
                <RasiLoveHoroscopeCard result={loveResult} lang={lang} />
              </section>
            )}
          </>
        )}
      </main>

      <Footer lang={lang} note={lang === "ta" ? "கோச்சார ராசி பலன்கள்" : "Gochara transit horoscope"} />
    </div>
  );
}