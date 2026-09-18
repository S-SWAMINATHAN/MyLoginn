"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { MuhurthaForm } from "@/components/MuhurthaForm";
import { MuhurthaResults } from "@/components/MuhurthaResults";
import { searchMuhurthaApi } from "@/lib/api";
import { MuhurthaRequest, MuhurthaSearchResponse } from "@/lib/types";
import { CalendarSearch } from "lucide-react";

export default function MuhurthaPage() {
  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MuhurthaSearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <Header lang={lang} setLang={setLang} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <section className="text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(8,145,178,0.08)",
              border: "1px solid rgba(8,145,178,0.25)",
              color: "var(--red-deep)",
            }}
          >
            <CalendarSearch className="w-4 h-4" />
            <span>
              {lang === "ta"
                ? "வேத முகூர்த்த தேடல் — கணித அடிப்படையிலானது"
                : "Vedic Muhurtha Finder — calculation-based, not guesswork"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gold-gradient-text">
            {lang === "ta" ? "முகூர்த்தம்" : "Muhurtha"}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: "var(--ink-soft)" }}>
            {lang === "ta"
              ? "திருமணம் மற்றும் பயணத்திற்கான சுப நாட்களை, ரிக்தை திதி, பத்திரை கரணம், தாரா பலம், சந்திர பலம் மற்றும் திசைசூல் ஆகிய பாரம்பரிய விதிகளின் அடிப்படையில் கண்டறியவும்."
              : "Find auspicious dates for Marriage and Travel using classical rules: Rikta Tithi, Bhadra Karana, Tara Bala, Chandra Bala, and Dishashool — every result cites its source."}
          </p>
        </section>

        <section>
          <MuhurthaForm onSubmit={handleSearch} isLoading={isLoading} lang={lang} />
          {errorMessage && (
            <div
              className="mt-4 p-4 rounded-2xl text-xs font-semibold text-center"
              style={{ background: "#fdecec", border: "1px solid #d93025", color: "#a31515" }}
            >
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

      <footer
        className="border-t py-8 text-center text-xs"
        style={{ borderColor: "rgba(10,37,64,0.08)", background: "#f3f7fa", color: "var(--ink-soft)" }}
      >
        <div className="max-w-7xl mx-auto px-4">MyLoginn Astrology — முகூர்த்த வழிகாட்டி</div>
      </footer>
    </div>
  );
}