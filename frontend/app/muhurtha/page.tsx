"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { MuhurthaForm } from "@/components/MuhurthaForm";
import { MuhurthaResults } from "@/components/MuhurthaResults";
import { searchMuhurthaApi } from "@/lib/api";
import { MuhurthaRequest, MuhurthaSearchResponse } from "@/lib/types";
import { CalendarSearch } from "lucide-react";

export default function MuhurthaPage() {
  const [lang, setLangState] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MuhurthaSearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Bug 4: one place to drop a stale result.
   * A Muhurtha result belongs to the exact event type and date range that
   * produced it, so it must not survive a change of event type (General /
   * Marriage / Travel). Previously it did, so the General search's days
   * stayed on screen under the Marriage and Travel tabs — all three tabs
   * appearing to show the same details.
   *
   * It is also cleared on a LANGUAGE switch. The response does carry both
   * Tamil and English fields, so technically it could just re-render — that
   * was the earlier behaviour. But a result left on screen through a
   * language switch still reads as the previous search's output sitting
   * under the current form, so it is dropped here too, as asked.
   */
  const clearResult = () => {
    setResult(null);
    setErrorMessage(null);
  };

  const setLang = (l: "ta" | "en") => {
    if (l === lang) return;
    setLangState(l);
    clearResult();
  };

  const handleSearch = async (data: MuhurthaRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await searchMuhurthaApi(data);
      setResult(res);
      setTimeout(() => {
        const el = document.getElementById("muhurtha-results-view");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Failed to search Muhurtha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHero
          icon={<CalendarSearch className="h-7 w-7" />}
          eyebrow={lang === "ta" ? "வேத முகூர்த்த தேடல் — கணித அடிப்படையிலானது" : "Vedic Muhurtha Finder — calculation-based, not guesswork"}
          title={lang === "ta" ? "முகூர்த்தம்" : "Muhurtha"}
          description={
            lang === "ta"
              ? "திருமணம் மற்றும் பயணத்திற்கான சுப நாட்களை, ரிக்தை திதி, பத்திரை கரணம், தாரா பலம், சந்திர பலம் மற்றும் திசைசூல் ஆகிய பாரம்பரிய விதிகளின் அடிப்படையில் கண்டறியவும்."
              : "Find auspicious dates for Marriage and Travel using classical rules: Rikta Tithi, Bhadra Karana, Tara Bala, Chandra Bala, and Dishashool — every result cites its source."
          }
        />

        <section>
          <MuhurthaForm onSubmit={handleSearch} isLoading={isLoading} lang={lang} onEventTypeChange={clearResult} />
          {errorMessage && (
            <div role="alert" className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-center text-sm font-semibold text-danger">
              {errorMessage}
            </div>
          )}
        </section>

        {result && (
          <section id="muhurtha-results-view">
            <MuhurthaResults result={result} lang={lang} />
          </section>
        )}
      </main>

      <Footer lang={lang} note={lang === "ta" ? "முகூர்த்த வழிகாட்டி" : "Muhurtha guide"} />
    </div>
  );
}
