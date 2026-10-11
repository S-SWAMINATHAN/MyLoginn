"use client";

// கணித ஜாதகம் (Kalai Magal-parity computation report).
// The birth-details form's own buttons drive the report (no duplicate buttons):
//   பஞ்சாங்க முறை: திருக்கணிதம் / வாக்கியம் · கட்ட அமைப்பு: தமிழ் / கேரளா / வட இந்தியா ·
//   அறிக்கை வடிவம்: முழு ஜாதகம் / ஒரு பக்க ஜாதகம்.
// After "Generate", the colour / Tamil-style panel and the print-PDF preview
// appear ABOVE the report.
import { usePersistentLang } from "@/lib/astrology/useLang";
import React, { useState } from "react";
import { ScrollText } from "lucide-react";
import { Header } from "@/components/astrology/Header";
import { Footer } from "@/components/astrology/Footer";
import { PageHero } from "@/components/astrology/ui/PageHero";
import { BirthDetailsForm } from "@/components/astrology/BirthDetailsForm";
import { KalaiReport } from "@/components/astrology/kalai/KalaiReport";
import { PrintPdfControls } from "@/components/astrology/kalai/PrintPdfControls";
import { KANITHA_SECTIONS, SectionPicker } from "@/components/astrology/kalai/ReportOptions";
import type { PaperSize } from "@/lib/astrology/pdfExport";
import { JathagamThemeProvider, THEME_SCOPE_CLASS } from "@/lib/astrology/jathagamTheme";
import { generateKalaiReportApi, type KalaiReport as KalaiReportData } from "@/lib/astrology/kalaiApi";
import { generateChartApi } from "@/lib/astrology/api";
import type { ChartResponse, GenerateChartRequest } from "@/lib/astrology/types";
import type { ChartStyle } from "@/lib/astrology/chartLayouts";
import { placeForLang } from "@/lib/astrology/placeLabel";
import { ReportWatermark } from "@/components/astrology/ReportWatermark";
import { ReportViewer } from "@/components/astrology/kalai/ReportViewer";
import { birthKey } from "@/lib/astrology/access";

type Lang = "ta" | "en";
const DOC = `${THEME_SCOPE_CLASS} jathagam-legacy`;

export default function KalaiReportPage() {
  const [lang, setLang] = usePersistentLang();
  const [report, setReport] = useState<KalaiReportData | null>(null);
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [system, setSystem] = useState("thirukkanitham");
  const [mode, setMode] = useState<"full" | "single" | "custom">("full");
  const [formMode, setFormMode] = useState("full");                 // the form's format button (before generating)
  const [sections, setSections] = useState<string[]>(KANITHA_SECTIONS.map((s) => s.key));
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("tamil");
  const [birth, setBirth] = useState<GenerateChartRequest | null>(null);

  const handleSubmit = async (raw: GenerateChartRequest) => {
    // place shown in the page language (Tamil page → Tamil place) in the report and both PDFs
    const data = { ...raw, place: placeForLang(raw.place, lang) } as GenerateChartRequest;
    const d = data as GenerateChartRequest & { output_mode?: string; chart_style?: string };
    setMode(d.output_mode === "single_page" ? "single" : d.output_mode === "custom" ? "custom" : "full");
    setChartStyle(((d.chart_style as ChartStyle) || "tamil"));
    setError(null);
    // திருக்கணிதம் or வாக்கியம் — the selected system goes to the backend as-is
    // ("thirukkanitham" | "vakhyam"); the backend switches the engine.
    const panchangam_system = data.panchangam_system === "vakhyam" ? "vakhyam" : "thirukkanitham";
    setIsLoading(true); setReport(null); setChart(null);
    try {
      const [rep, ch] = await Promise.all([
        generateKalaiReportApi({ ...data, panchangam_system }),
        generateChartApi({ ...data, panchangam_system }).catch(() => null),
      ]);
      setReport(rep); setChart(ch); setBirth({ ...data, panchangam_system });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JathagamThemeProvider>
      <div className="app-shell min-h-screen flex flex-col">
        <Header lang={lang} setLang={setLang} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <PageHero
            icon={<ScrollText className="h-7 w-7" />}
            eyebrow="KALAI MAGAL PARITY · COMPUTATION REPORT"
            title={lang === "ta" ? "கணித" : "Computation"}
            highlight={lang === "ta" ? "ஜாதகம்" : "Report"}
            tagline={lang === "ta" ? "— முழு ஜாதகம் · ஒரு பக்க ஜாதகம் —" : "— full horoscope · single page —"}
            description={lang === "ta"
              ? "கலைமகள் மென்பொருளின் அதே கணித முறைகள்: கிரக ஸ்புடம், பாவம், தசா புக்தி, அஷ்டவர்க்கம், சட்பலம், சோடச வர்க்கம், காலச்சக்கிரம், பஞ்சபட்சி மற்றும் பலன்கள்."
              : "The same calculation methods as Kalai Magal: planets, bhava, dasa, ashtakavarga, shadbala, 16 vargas, Kalachakra, Panchapakshi and palan."}
          />

          <section className="no-print">
            <BirthDetailsForm onSubmit={handleSubmit} isLoading={isLoading} lang={lang}
              onModeChange={(m) => { setSystem(m.panchangam_system); setFormMode(m.output_mode); }}
              outputLabels={{ full: { ta: "முழு ஜாதகம்", en: "Full Jathagam", sub: "All 20 sections" }, single_page: { ta: "ஒரு பக்க ஜாதகம்", en: "Single-page Jathagam", sub: "Kalai single page" },
                custom: { ta: "தனிப்பயன்", en: "Custom", sub: lang === "ta" ? "தேவையான பகுதிகள்" : "Choose sections" } }} />
          </section>

          {(formMode === "custom" || mode === "custom") && (
            <section className="no-print">
              <SectionPicker sections={KANITHA_SECTIONS} value={sections} onChange={setSections} lang={lang} />
            </section>
          )}

          {system === "vakhyam" && (
            <p className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-3 text-center text-xs text-foreground">
              {lang === "ta"
                ? "வாக்கிய கணிதம் (கலைமகள் முறை): சூரியன், சந்திரன், ராகு-கேது, நட்சத்திரம், பாதம், தசா இருப்பு கலைமகளுடன் பொருந்தும். மற்ற கிரகங்கள் சில கலைகள் மாறலாம் (வக்ர காலத்தில் சுக்கிரன், செவ்வாய் ஏறக்குறைய 1° வரை)."
                : "Vakkiyam (Kalai Magal method): Sun, Moon, Rahu-Ketu, star, pada and dasa balance follow Kalai Magal; other planets may differ by a few arc-minutes (Venus and Mars up to about 1° near retrogression)."}
            </p>
          )}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {report && birth && (
            <section className="space-y-6">
              <PrintPdfControls path="kanitha" lang={lang} ready={mode !== "custom" || sections.length > 0}
                filename={`kanitha-jathagam-${birth.name || "report"}${mode === "single" ? "" : "-" + paper}.pdf`}
                paper={mode === "single" ? undefined : paper} onPaper={setPaper}
                body={{ birth, chart_style: chartStyle === "north_indian" ? "north" : "south", mode,
                  ...(mode === "custom" ? { sections } : {}) }} />
              <ReportViewer lang={lang} freePages={mode === "single" ? undefined : 5}>
              <ReportWatermark access={{ product: mode === "single" ? "SINGLE_PAGE" : "FULL", reportKey: birthKey(birth) }}>
                <div className={DOC}>
                  <KalaiReport report={report} lang={lang} mode={mode} chartStyle={chartStyle} chart={chart}
                    sections={mode === "custom" ? sections : undefined} paper={paper} />
                </div>
              </ReportWatermark>
              </ReportViewer>
            </section>
          )}
        </main>
        <Footer lang={lang} />
      </div>
    </JathagamThemeProvider>
  );
}
