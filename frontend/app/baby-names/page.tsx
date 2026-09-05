"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BabyNameForm } from "@/components/BabyNameForm";
import { BabyNameSuggestions } from "@/components/BabyNameSuggestions";
import { generateBabyNamesApi } from "@/lib/api";
import { BabyNameRequest, BabyNameResult } from "@/lib/types";
import { Baby, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-[#0d0a0b] text-[#f5eedb]">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b1426]/50 border border-[#ffd700]/40 text-xs font-semibold text-[#ffd700]">
            <Baby className="w-4 h-4 text-[#ffd700]" />
            <span>
              {lang === "ta"
                ? "நட்சத்திர-பாத அடிப்படையிலான பாரம்பரிய வேத பெயர் வழிகாட்டி"
                : "Classical Vedic Nakshatra-Pada Naming System"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-tight gold-gradient-text">
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரை" : "Baby Name Suggestions"}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#e0b87f] font-tamil">
            {lang === "ta"
              ? "பிறந்த நேரம் மற்றும் இடத்தின் அடிப்படையில் சந்திரனின் துல்லியமான நட்சத்திரம் மற்றும் பாதத்தை கணக்கிட்டு, அதற்கேற்ற தொடக்க எழுத்துக்களில் பாரம்பரிய தமிழ் பெயர்களை பரிந்துரைக்கிறோம்."
              : "We compute the Moon's exact Nakshatra and Pada from birth time and place, then suggest authentic Tamil names starting with the classically correct syllable — no numerology, no random guesses."}
          </p>
        </section>

        {/* Input Form */}
        <section>
          <BabyNameForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold text-center">
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

      <footer className="border-t border-[#d4af37]/20 py-8 bg-[#0a0708] text-center text-xs text-[#d4af37]/60">
        <div className="max-w-7xl mx-auto px-4 font-tamil">
          MyLoginn Astrology — நட்சத்திர அடிப்படையிலான குழந்தை பெயர் வழிகாட்டி
        </div>
      </footer>
    </div>
  );
}