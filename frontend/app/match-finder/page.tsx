"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { StarMatchFinder } from "@/components/StarMatchFinder";
import { Sparkles, Heart, Compass } from "lucide-react";
import Link from "next/link";

export default function MatchFinderPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHero
          icon={<Sparkles className="h-7 w-7" />}
          eyebrow="MyLoginn Astrology · Star Match Explorer"
          title={lang === "ta" ? "ராசி & நட்சத்திர" : "Rasi & Nakshatra"}
          highlight={lang === "ta" ? "பொருத்த தேடல்" : "Match Finder"}
          tagline="— find like-rate across all 108 pada combinations —"
          description={
            lang === "ta"
              ? "ஒரு ஆண் அல்லது பெண் நட்சத்திரத்தைத் தேர்ந்தெடுத்து — எந்த எதிர் ராசி / நட்சத்திரம் எவ்வளவு பொருத்தம், LIKE-RATE என்ன என்பதை 108 பாத பொருத்தங்களில் உடனே காண்க."
              : "Select a Boy or Girl Nakshatra — instantly see LIKE-RATE for every target Rasi & Nakshatra across all 108 pada combinations."
          }
        >
          <div className="no-print flex items-center justify-center gap-3 pt-4 text-xs">
            <Link href="/porutham" className="btn-secondary px-3 py-1.5 text-xs">
              <Heart className="h-3.5 w-3.5 text-brand-500" /> {lang === "ta" ? "ஜோடி பொருத்தம் (Pair Match)" : "Pair Match"}
            </Link>
            <Link href="/" className="btn-secondary px-3 py-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-brand-500" /> {lang === "ta" ? "ஜாதகம்" : "Jathagam"}
            </Link>
          </div>
        </PageHero>

        <StarMatchFinder lang={lang} />
      </main>

      <Footer lang={lang} note="MATCH Finder — Star Compatibility Explorer" />
    </div>
  );
}
