"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { PoruthamForm } from "@/components/PoruthamForm";
import { PoruthamResult } from "@/components/PoruthamResult";
import { matchPoruthamApi } from "@/lib/api";
import { PoruthamMatchResult } from "@/lib/types";
import { Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function PoruthamPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
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

        {/* Input Form */}
        <section>
          <PoruthamForm onSubmit={handleMatch} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Link to new MATCH Finder */}
        <section className="hand-card p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(176,55,38,0.1)] border border-[var(--red)] flex items-center justify-center text-[var(--red)]">
              <Sparkles className="w-5 h-5 text-[var(--red)]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--ink)] font-tamil">
                {lang === "ta" ? "புதிய அம்சம்: MATCH Finder" : "New Feature: MATCH Finder"}
              </div>
              <div className="text-xs text-[var(--ink-soft)] font-tamil">
                {lang === "ta"
                  ? "ஒரு ஆண் நட்சத்திரத்திற்கு — எந்த பெண் ராசி/நட்சத்திரம் எவ்வளவு LIKE-RATE? 108 பொருத்தங்களும் உடனே!"
                  : "For a Boy Nakshatra — see LIKE-RATE for every Girl Rasi/Nakshatra across 108 pada combos instantly!"}
              </div>
            </div>
          </div>
          <Link
            href="/match-finder"
            className="btn-hand px-5 py-2 text-xs font-bold text-[var(--red-deep)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {lang === "ta" ? "MATCH Finder திறக்க" : "Open MATCH Finder"}
          </Link>
        </section>

        {/* Results View */}
        {matchResult && (
          <section id="porutham-results-view">
            <PoruthamResult result={matchResult} lang={lang} />
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
