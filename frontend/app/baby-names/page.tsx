"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { BabyNameForm } from "@/components/BabyNameForm";
import { BabyNameResults } from "@/components/BabyNameResults";
import { NumerologyPanel } from "@/components/NumerologyPanel";
import { GeneralNameGenerator } from "@/components/GeneralNameGenerator";
import { generateBabyNamesApi } from "@/lib/api";
import { BabyNameRequest, BabyNameResult } from "@/lib/types";
import { Baby } from "lucide-react";

export default function BabyNamesPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BabyNameResult | null>(null);
  // NEW: remember what was submitted so the Numerology panel below can
  // prefill the same date of birth without the parent retyping it.
  const [submitted, setSubmitted] = useState<BabyNameRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (formData: BabyNameRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await generateBabyNamesApi(formData);
      setSubmitted(formData);
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
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHero
          icon={<Baby className="h-7 w-7" />}
          eyebrow="AI Jathagam · Nakshatra-Pada Naming"
          title={lang === "ta" ? "குழந்தை பெயர்" : "Baby Name"}
          highlight={lang === "ta" ? "பரிந்துரை" : "Suggestions"}
          tagline="— classical Nakshatra-Pada naming + Chaldean numerology check —"
          description={
            lang === "ta"
              ? "பிறந்த நேரம் மற்றும் இடத்தின் அடிப்படையில் சந்திரனின் துல்லியமான நட்சத்திரம் மற்றும் பாதத்தை கணக்கிட்டு, அதற்கேற்ற தொடக்க எழுத்துக்களில் பாரம்பரிய தமிழ் பெயர்களை பரிந்துரைக்கிறோம்."
              : "We compute the Moon's exact Nakshatra and Pada from birth time and place, then suggest authentic Tamil names starting with the classically correct syllable, then show a separate Chaldean numerology alignment check for each name."
          }
        />

        {/* Input Form */}
        <section>
          <BabyNameForm onSubmit={handleGenerate} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
              {errorMessage}
            </div>
          )}
        </section>

        {/* Results View */}
        {result && (
          <section id="baby-name-results-view">
            <BabyNameResults babyNames={result} lang={lang} />
          </section>
        )}

        {/* General A-Z name generator. A separate section from the birth-detail
            feature above: same database rows, browsed by starting letter
            instead of by the baby's Nakshatra-Pada syllable. */}
        <section id="general-name-generator">
          <GeneralNameGenerator lang={lang} />
        </section>

        {/* NEW: Chaldean numerology panel. Rendered as its own separate
            card below the Nakshatra-Pada results, never merged into them.
            Always available — a parent can also test a name that is not in
            the suggestion list above. */}
        <section id="numerology-view">
          <NumerologyPanel
            lang={lang}
            defaultDob={submitted?.date_of_birth}
            defaultName={submitted?.name || ""}
          />
        </section>
      </main>

      <Footer lang={lang} note={lang === "ta" ? "நட்சத்திர அடிப்படையிலான குழந்தை பெயர் வழிகாட்டி" : "Nakshatra-based baby name guide"} />
    </div>
  );
}