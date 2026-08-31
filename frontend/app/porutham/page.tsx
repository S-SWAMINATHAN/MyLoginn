"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { PoruthamForm } from "@/components/PoruthamForm";
import { PoruthamResult } from "@/components/PoruthamResult";
import { matchPoruthamApi } from "@/lib/api";
import { PoruthamMatchResult } from "@/lib/types";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";
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

      // Trigger celebratory confetti if auspicious match
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
    <div className="min-h-screen flex flex-col bg-[#0d0a0b] text-[#f5eedb]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b1426]/50 border border-[#ffd700]/40 text-xs font-semibold text-[#ffd700]">
            <Heart className="w-4 h-4 text-[#e65c00]" />
            <span>
              {lang === "ta" ? "தென்னிந்திய & வட இந்திய திருமண பொருத்தம்" : "Comprehensive Vedic Matrimony Matching"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-tight gold-gradient-text">
            {lang === "ta" ? "திருமணப் பொருத்தம் கணிப்பு" : "Horoscope Matching (Porutham)"}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#e0b87f] font-tamil">
            {lang === "ta"
              ? "தின, கண, மகேந்திர, யோனி, ராசி, ரஜ்ஜு (மாங்கல்ய பலம்), வேதை உள்ளிட்ட 10 பொருத்தங்கள் மற்றும் அஷ்டகூட 36-புள்ளிகள்"
              : "Dual verification covering Ashta Koota (36-pt) and South Indian Tamil 10-Porutham with Rajju Dosha safety evaluation"}
          </p>
        </section>

        {/* Input Form */}
        <section>
          <PoruthamForm onSubmit={handleMatch} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold text-center">
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
      </main>

      <footer className="border-t border-[#d4af37]/20 py-8 bg-[#0a0708] text-center text-xs text-[#d4af37]/60">
        <div className="max-w-7xl mx-auto px-4 font-tamil">
          AI Jathagam Generator — திருமணப் பொருத்த வழிகாட்டி
        </div>
      </footer>
    </div>
  );
}
