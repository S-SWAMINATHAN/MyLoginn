"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { StarMatchFinder } from "@/components/StarMatchFinder";
import { Sparkles, Heart, Compass } from "lucide-react";
import Link from "next/link";

export default function MatchFinderPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="text-center space-y-2">
          <p className="sri text-2xl">ஸ்ரீ</p>
          <p className="over">AI Jathagam · Star Match Explorer</p>
          <h1 className="text-3xl sm:text-5xl font-normal text-[var(--ink)]">
            {lang === "ta" ? "ராசி & நட்சத்திர பொருத்த தேடல்" : "Rasi & Nakshatra Match Finder"}
          </h1>
          <p className="font-caveat text-lg text-[var(--ink-soft)]">
            — find like-rate across all 108 pada combinations —
          </p>
          <p className="max-w-2xl mx-auto text-sm text-[var(--ink-soft)] font-tamil pt-2">
            {lang === "ta"
              ? "ஒரு ஆண் அல்லது பெண் நட்சத்திரத்தைத் தேர்ந்தெடுத்து — எந்த எதிர் ராசி / நட்சத்திரம் எவ்வளவு பொருத்தம், LIKE-RATE என்ன என்பதை 108 பாத பொருத்தங்களில் உடனே காண்க."
              : "Select a Boy or Girl Nakshatra — instantly see LIKE-RATE for every target Rasi & Nakshatra across all 108 pada combinations."}
          </p>
          <div className="flex items-center justify-center gap-3 text-xs no-print pt-2">
            <Link
              href="/porutham"
              className="btn-hand px-3 py-1.5 text-xs text-[var(--red-deep)] flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" /> {lang === "ta" ? "ஜோடி பொருத்தம் (Pair Match)" : "Pair Match"}
            </Link>
            <Link
              href="/"
              className="btn-hand px-3 py-1.5 text-xs text-[var(--ink)] flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" /> {lang === "ta" ? "ஜாதகம்" : "Jathagam"}
            </Link>
          </div>
        </section>

        <StarMatchFinder lang={lang} />
      </main>

      <footer className="border-t border-[rgba(43,33,23,0.15)] py-8 text-center text-xs text-[var(--ink-soft)] font-tamil">
        <p>AI Jathagam — MATCH Finder (Star Compatibility Explorer)</p>
        <p className="font-caveat text-sm mt-1 text-[var(--red)]">drawn stroke by stroke · for reference only</p>
      </footer>
    </div>
  );
}
