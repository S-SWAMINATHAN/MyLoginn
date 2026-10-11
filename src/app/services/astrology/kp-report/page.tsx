"use client";

// கே.பி ஜாதகம் — the birth-details form's own buttons:
//   ஜனன ஜாதகம் (in place of திருக்கணிதம்) / பிரசன்னம் (in place of வாக்கியம்),
//   கே.பி முழு ஜாதகம் (full) / கே.பி Type A (in place of single page).
// For Horary, the form's date, time and place are the moment and place of the
// question; the horary number and system are extra fields inside the form.
// The colour / Tamil-style panel and print-PDF preview appear after generating.
import { usePersistentLang } from "@/lib/astrology/useLang";
import React, { useState } from "react";
import { Orbit } from "lucide-react";
import { Header } from "@/components/astrology/Header";
import { Footer } from "@/components/astrology/Footer";
import { PageHero } from "@/components/astrology/ui/PageHero";
import { BirthDetailsForm } from "@/components/astrology/BirthDetailsForm";
import { KpReport } from "@/components/astrology/kalai/KpReport";
import { PrintPdfControls } from "@/components/astrology/kalai/PrintPdfControls";
import { KP_SECTIONS, SectionPicker } from "@/components/astrology/kalai/ReportOptions";
import type { PaperSize } from "@/lib/astrology/pdfExport";
import { JathagamThemeProvider, THEME_SCOPE_CLASS } from "@/lib/astrology/jathagamTheme";
import { generateKpHoraryApi, generateKpReportApi, type KpHoraryReport, type KpReport as KpData } from "@/lib/astrology/kalaiApi";
import { generateChartApi } from "@/lib/astrology/api";
import type { ChartResponse, GenerateChartRequest } from "@/lib/astrology/types";
import { placeForLang } from "@/lib/astrology/placeLabel";
import { ReportWatermark } from "@/components/astrology/ReportWatermark";
import { ReportViewer } from "@/components/astrology/kalai/ReportViewer";
import { birthKey, formKey } from "@/lib/astrology/access";

type Lang = "ta" | "en";
const DOC = `${THEME_SCOPE_CLASS} jathagam-legacy`;
const field = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-foreground focus:border-brand-400 focus:outline-none";

export default function KpReportPage() {
  const [lang, setLang] = usePersistentLang();
  const [horaryMode, setHoraryMode] = useState(false);
  const [model, setModel] = useState<"type_a" | "all" | "custom">("all");
  const [formMode, setFormMode] = useState("full");                 // the form's format button (before generating)
  const [sections, setSections] = useState<string[]>(KP_SECTIONS.map((s) => s.key));
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [hSys, setHSys] = useState<"249" | "2193">("249");
  const [hNum, setHNum] = useState(1);
  const [report, setReport] = useState<KpData | null>(null);
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [birth, setBirth] = useState<GenerateChartRequest | null>(null);
  const [horaryForm, setHoraryForm] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (raw: GenerateChartRequest) => {
    const data = { ...raw, place: placeForLang(raw.place, lang) } as GenerateChartRequest;
    const d = data as GenerateChartRequest & { output_mode?: string };
    setModel(d.output_mode === "single_page" ? "type_a" : d.output_mode === "custom" ? "custom" : "all");
    setIsLoading(true); setError(null); setReport(null); setChart(null);
    try {
      if (data.panchangam_system === "vakhyam") {
        const tm = data.time_of_birth.split(":").length === 3 ? data.time_of_birth : `${data.time_of_birth}:00`;
        setReport(await generateKpHoraryApi({ number: hNum, system: hSys, name: data.name, date: data.date_of_birth, time: tm,
          latitude: data.latitude ?? 11, longitude: data.longitude ?? 77, timezone: data.timezone || "Asia/Kolkata" }));
        setBirth(null);
        setHoraryForm({ number: hNum, system: hSys, name: data.name, date: data.date_of_birth, time: tm, latitude: data.latitude ?? 11,
          longitude: data.longitude ?? 77, timezone: data.timezone || "Asia/Kolkata", place: data.place });
      } else {
        setHoraryForm(null);
        const [k, c] = await Promise.all([generateKpReportApi(data), generateChartApi(data).catch(() => null)]);
        setReport(k); setChart(c); setBirth(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const horary = report && "horary" in report ? (report as KpHoraryReport).horary : null;

  return (
    <JathagamThemeProvider>
      <div className="app-shell min-h-screen flex flex-col">
        <Header lang={lang} setLang={setLang} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <PageHero icon={<Orbit className="h-7 w-7" />} eyebrow="KALAI MAGAL PARITY · KP SYSTEM"
            title={lang === "ta" ? "கே.பி" : "KP"} highlight={lang === "ta" ? "ஜாதகம்" : "Horoscope"}
            tagline={lang === "ta" ? "— கிருஷ்ணமூர்த்தி பத்ததி —" : "— Krishnamurti Paddhati —"}
            description={lang === "ta" ? "கிரக, பாவ அட்டவணைகள், உப அதிபதிகள், காரக கிரகங்கள், பார்வைகள், தசா புக்தி மற்றும் பிரசன்னம்." : "Planet and cusp tables with sub-lords, significators, aspects, dasa and horary."} />

          <section className="no-print">
            <BirthDetailsForm onSubmit={handleSubmit} isLoading={isLoading} lang={lang}
              onModeChange={(m) => { setHoraryMode(m.panchangam_system === "vakhyam"); setFormMode(m.output_mode); }}
              systemLabels={{
                heading: { ta: "கே.பி வகை", en: "KP type" },
                thirukkanitham: { ta: "ஜனன ஜாதகம்", en: "Birth chart", sub: "Natal KP" },
                vakhyam: { ta: "பிரசன்னம் (ஹோரரி)", en: "Horary", sub: "1–249 / 1–2193" },
              }}
              outputLabels={{
                heading: { ta: "அறிக்கை வடிவம்", en: "Report format" },
                full: { ta: "கே.பி முழு ஜாதகம்", en: "KP All", sub: "Full report" },
                single_page: { ta: "கே.பி சுருக்கம்", en: "KP Type A", sub: "Summary" },
                custom: { ta: "தனிப்பயன்", en: "Custom", sub: lang === "ta" ? "தேவையான பகுதிகள்" : "Choose sections" },
              }}>
              {horaryMode && (
                <div className="mt-4 grid gap-4 rounded-2xl border border-brand-500/30 p-4 sm:grid-cols-2">
                  <p className="text-xs text-muted sm:col-span-2">
                    {lang === "ta" ? "பிரசன்னம்: மேலே உள்ள தேதி, நேரம், இடம் = கேள்வி கேட்கப்பட்ட நேரமும் இடமும்." : "Horary: the date, time and place above are the moment and place of the question."}
                  </p>
                  <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "முறை" : "System"}
                    <select className={field} value={hSys} onChange={(e) => setHSys(e.target.value as "249" | "2193")}>
                      <option value="249">1 – 249</option><option value="2193">1 – 2193</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "பிரசன்ன எண்" : "Horary number"}
                    <input type="number" min={1} max={hSys === "249" ? 249 : 2193} className={field} value={hNum} onChange={(e) => setHNum(Number(e.target.value))} />
                  </label>
                </div>
              )}
            </BirthDetailsForm>
          </section>

          {(formMode === "custom" || model === "custom") && !horaryMode && (
            <section className="no-print">
              <SectionPicker sections={KP_SECTIONS} value={sections} onChange={setSections} lang={lang} />
            </section>
          )}

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {report && (
            <section className="space-y-6">
              {horaryForm ? (
                <PrintPdfControls path="kp-horary" lang={lang} ready
                  filename={`kp-horary-${String(horaryForm.number)}.pdf`} body={{ form: horaryForm }} />
              ) : (
                <PrintPdfControls path="kp" lang={lang} ready={!!birth && (model !== "custom" || sections.length > 0)}
                  filename={`kp-jathagam-${birth?.name || "report"}-${paper}.pdf`}
                  paper={model === "type_a" ? undefined : paper} onPaper={setPaper}
                  body={{ birth: birth ?? {}, mode: model, ...(model === "custom" ? { sections } : {}) }} />
              )}
              {horary && (
                <p className="text-center text-sm font-semibold text-foreground">
                  {lang === "ta" ? "பிரசன்ன எண்" : "Horary number"} {horary.number} · {lang === "ta" ? "லக்னம்" : "Ascendant"} {horary.sub_start_dms} ({horary.star_lord} / {horary.sub_lord}{horary.subsub_lord ? ` / ${horary.subsub_lord}` : ""})
                </p>
              )}
              <ReportViewer lang={lang} freePages={horaryForm || model === "type_a" ? undefined : 5}>
              <ReportWatermark access={horaryForm
                ? { product: "SINGLE_PAGE", reportKey: formKey("horary", horaryForm) }
                : { product: "FULL", reportKey: `kp|${birthKey(birth ?? {})}` }}>
                <div className={DOC}>
                  <KpReport report={report} lang={lang} model={horaryForm ? "all" : model} chart={chart}
                    sections={model === "custom" ? sections : undefined} paper={horaryForm || model === "type_a" ? "A4" : paper} />
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
