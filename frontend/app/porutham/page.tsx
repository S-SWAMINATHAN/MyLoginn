"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
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
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Masthead */}
        <section className="text-center space-y-2">
          <p className="sri text-2xl">ஸ்ரீ</p>
          <p className="over">AI Jathagam · Matrimony Compatibility</p>
          <h1 className="text-3xl sm:text-5xl font-normal text-[var(--ink)]">
            {lang === "ta" ? "திருமணப் பொருத்தம் கணிப்பு" : "Horoscope Matching (Porutham)"}
          </h1>
          <p className="font-caveat text-lg text-[var(--ink-soft)]">
            — comprehensive Vedic matrimony evaluation —
          </p>
          <p className="max-w-2xl mx-auto text-sm text-[var(--ink-soft)] font-tamil pt-2">
            {lang === "ta"
              ? "தின, கண, மகேந்திர, யோனி, ராசி, ரஜ்ஜு (மாங்கல்ய பலம்), வேதை உள்ளிட்ட 10 பொருத்தங்கள் மற்றும் அஷ்டகூட 36-புள்ளிகள்"
              : "Dual verification covering Ashta Koota (36-pt) and South Indian Tamil 10-Porutham with Rajju Dosha safety evaluation"}
          </p>
        </section>

        {/* Tab Switcher — Pair Match vs. MATCH Finder.
            MATCH Finder used to be a separate page linked from here; it now
            lives ONLY inside this Porutham page as a tab, rendering the
            same StarMatchFinder component inline (no navigation away). */}
        <section className="flex justify-center">
          <div className="hand-card inline-flex items-center bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-2xl p-1.5 gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("pair")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-tamil transition-all ${
                activeTab === "pair"
                  ? "bg-[var(--red)] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{lang === "ta" ? "ஜோடி பொருத்தம் (Pair Match)" : "Pair Match"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("finder")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-tamil transition-all ${
                activeTab === "finder"
                  ? "bg-[var(--red)] text-white shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === "ta" ? "MATCH Finder (108 பொருத்தம்)" : "MATCH Finder (108 combos)"}</span>
            </button>
          </div>
        </section>

        {activeTab === "pair" ? (
          <>
            {/* Input Form */}
            <section>
              <PoruthamForm onSubmit={handleMatch} isLoading={isLoading} lang={lang} />
              {errorMessage && (
                <div className="mt-4 p-4 rounded-2xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-semibold text-center">
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

      <footer className="border-t border-[rgba(43,33,23,0.15)] py-8 text-center text-xs text-[var(--ink-soft)] font-tamil">
        <p>AI Jathagam Generator — திருமணப் பொருத்த வழிகாட்டி</p>
        <p className="font-caveat text-sm mt-1 text-[var(--red)]">drawn stroke by stroke · for reference only</p>
      </footer>
    </div>
  );
}