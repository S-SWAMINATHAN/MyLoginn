"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BabyNameForm } from "@/components/BabyNameForm";
import { BabyNameSuggestions } from "@/components/BabyNameSuggestions";
import { generateBabyNamesApi } from "@/lib/api";
import { BabyNameRequest, BabyNameResult } from "@/lib/types";
import { Baby } from "lucide-react";

export default function BabyNamesPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BabyNameResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (formData: BabyNameRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateBabyNamesApi(formData);
      setResult(res);

      setTimeout(() => {
        const el = document.getElementById("baby-name-results-view");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to generate baby name suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Masthead — matches Porutham/Home's sri/over pattern */}
        <section className="text-center space-y-2">
          <p className="sri text-2xl">ஸ்ரீ</p>
          <p className="over">AI Jathagam · Nakshatra-Pada Naming</p>
          <h1 className="text-3xl sm:text-5xl font-normal text-[var(--ink)]">
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரை" : "Baby Name Suggestions"}
          </h1>
          <p className="font-caveat text-lg text-[var(--ink-soft)]">
            — classical Nakshatra-Pada naming, no numerology —
          </p>
          <p className="max-w-2xl mx-auto text-sm text-[var(--ink-soft)] font-tamil pt-2">
            {lang === "ta"
              ? "பிறந்த நேரம் மற்றும் இடத்தின் அடிப்படையில் சந்திரனின் துல்லியமான நட்சத்திரம் மற்றும் பாதத்தை கணக்கிட்டு, அதற்கேற்ற தொடக்க எழுத்துக்களில் பாரம்பரிய தமிழ் பெயர்களை பரிந்துரைக்கிறோம்."
              : "We compute the Moon's exact Nakshatra and Pada from birth time and place, then suggest authentic Tamil names starting with the classically correct syllable — no numerology, no random guesses."}
          </p>
        </section>

        {/* Input Form */}
        <section>
          <BabyNameForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Results View */}
        {result && (
          <section id="baby-name-results-view">
            <BabyNameSuggestions babyNames={result} lang={lang} />
          </section>
        )}
      </main>

      <footer className="border-t border-[rgba(43,33,23,0.15)] py-8 text-center text-xs text-[var(--ink-soft)] font-tamil">
        <p>MyLoginn Astrology — நட்சத்திர அடிப்படையிலான குழந்தை பெயர் வழிகாட்டி</p>
        <p className="font-caveat text-sm mt-1 text-[var(--red)]">drawn stroke by stroke · for reference only</p>
      </footer>
    </div>
  );
}