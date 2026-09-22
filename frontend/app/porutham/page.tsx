"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { PoruthamForm } from "@/components/PoruthamForm";
import { PoruthamResult } from "@/components/PoruthamResult";
import { StarMatchFinder } from "@/components/StarMatchFinder";
import { matchPoruthamApi } from "@/lib/api";
import { PoruthamMatchResult } from "@/lib/types";
import { Heart, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

type PoruthamTab = "pair" | "finder";

export default function PoruthamPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [activeTab, setActiveTab] = useState<PoruthamTab>("pair");
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<PoruthamMatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMatch = async (params: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await matchPoruthamApi(params);
      setMatchResult(res);

      if (res.score_percentage >= 65 && !res.rajju_dosha) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }

      setTimeout(() => {
        const el = document.getElementById("porutham-results-view");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to calculate matching score.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHero
          icon={<Heart className="h-7 w-7" />}
          eyebrow="AI Jathagam · Matrimony Compatibility"
          title={lang === "ta" ? "திருமணப் பொருத்தம்" : "Horoscope Matching"}
          highlight={lang === "ta" ? "கணிப்பு" : "(Porutham)"}
          tagline="— comprehensive Vedic matrimony evaluation —"
          description={
            lang === "ta"
              ? "தின, கண, மகேந்திர, யோனி, ராசி, ரஜ்ஜு (மாங்கல்ய பலம்), வேதை உள்ளிட்ட 10 பொருத்தங்கள் மற்றும் அஷ்டகூட 36-புள்ளிகள்"
              : "Dual verification covering Ashta Koota (36-pt) and South Indian Tamil 10-Porutham with Rajju Dosha safety evaluation"
          }
        />

        {/* Tab Switcher — Pair Match vs. MATCH Finder.
            MATCH Finder used to be a separate page linked from here; it now
            lives ONLY inside this Porutham page as a tab, rendering the
            same StarMatchFinder component inline (no navigation away). */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-soft" role="tablist">
            {([
              { id: "pair" as const, icon: <Heart className="h-4 w-4" />, label: lang === "ta" ? "ஜோடி பொருத்தம் (Pair Match)" : "Pair Match" },
              { id: "finder" as const, icon: <Sparkles className="h-4 w-4" />, label: lang === "ta" ? "MATCH Finder (108 பொருத்தம்)" : "MATCH Finder (108 combos)" },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:px-6 sm:text-sm ${
                  activeTab === t.id ? "brand-gradient-bg text-white shadow-soft" : "text-muted hover:text-foreground"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {activeTab === "pair" ? (
          <>
            {/* Input Form */}
            <section>
              <PoruthamForm onSubmit={handleMatch} isLoading={isLoading} lang={lang} />
              {errorMessage && (
                <div role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
                  {errorMessage}
                </div>
              )}
            </section>

            {/* Results View */}
            {matchResult && (
              <section id="porutham-results-view">
                <PoruthamResult result={matchResult} lang={lang} />
              </section>
            )}
          </>
        ) : (
          <section>
            <StarMatchFinder lang={lang} />
          </section>
        )}
      </main>

      <Footer lang={lang} note={lang === "ta" ? "திருமணப் பொருத்த வழிகாட்டி — வழிகாட்டுதலுக்காக மட்டும்" : "Marriage matching guide — for reference only"} />
    </div>
  );
}