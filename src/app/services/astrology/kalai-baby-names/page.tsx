"use client";

// பெயர் (கலைமகள்) — Kalai Magal's 7 baby-name report types.
// Layout and theme follow the site's Baby Name feature. Each report type
// applies exactly its own filter (bug 16):
//   Single Star Letter Only ........ one chosen letter of the star
//   Single Numerology No Only ...... one chosen name total
//   Star Letters Only .............. all letters of the star
//   Numerology Numbers Only ........ all allowed name totals for the birth date
//   Single Star Letter + Numerology  chosen letter AND allowed totals
//   Single Numerology No + Star .... star letters AND one chosen total
//   Star + Numerology Details ...... star letters AND allowed totals
// Initials: father, grandfather, mother, and the place (taken from the place
// search, like the other features). Every name is listed once.
import { usePersistentLang } from "@/lib/astrology/useLang";
import React, { useEffect, useRef, useState } from "react";
import { Baby } from "lucide-react";
import { Header } from "@/components/astrology/Header";
import { Footer } from "@/components/astrology/Footer";
import { JathagamThemePanel } from "@/components/astrology/JathagamThemePanel";
import { JathagamThemeProvider, THEME_SCOPE_CLASS } from "@/lib/astrology/jathagamTheme";

import { PageHero } from "@/components/astrology/ui/PageHero";
import { getStarLettersApi, kalaiBabyNamesApi, type KalaiBabyReportType, type KalaiBabyResult } from "@/lib/astrology/kalaiApi";
import { exportNodesToPdf, waitForRenderReady } from "@/lib/astrology/pdfExport";
import { PrintPdfControls } from "@/components/astrology/kalai/PrintPdfControls";
import { DateInput } from "@/components/astrology/ui/DateInput";
import { ReportWatermark } from "@/components/astrology/ReportWatermark";
import { formKey } from "@/lib/astrology/access";

const DOC = `${THEME_SCOPE_CLASS} jathagam-legacy`;
type Lang = "ta" | "en";

const TA_INITIAL: [string, string][] = [
  ["ஸ்ரீ", "S"], ["க்ஷ", "K"], ["அ", "A"], ["ஆ", "A"], ["இ", "I"], ["ஈ", "E"], ["உ", "U"], ["ஊ", "U"], ["எ", "E"], ["ஏ", "E"],
  ["ஐ", "A"], ["ஒ", "O"], ["ஓ", "O"], ["ஔ", "A"], ["க", "K"], ["ங", "N"], ["ச", "S"], ["ஞ", "N"], ["ட", "D"], ["ண", "N"],
  ["த", "T"], ["ந", "N"], ["ப", "P"], ["ம", "M"], ["ய", "Y"], ["ர", "R"], ["ல", "L"], ["வ", "V"], ["ழ", "L"], ["ள", "L"],
  ["ற", "R"], ["ன", "N"], ["ஜ", "J"], ["ஷ", "S"], ["ஸ", "S"], ["ஹ", "H"],
];
/** First letter of a person's name as the English initial used in numerology. */
function initialOf(name: string): string {
  const s = (name || "").trim();
  if (!s) return "";
  const latin = s.match(/^[^A-Za-z\u0B80-\u0BFF]*([A-Za-z])/);
  if (latin) return latin[1].toUpperCase();
  const hit = TA_INITIAL.find(([ta]) => s.startsWith(ta));
  return hit ? hit[1] : "";
}
const field = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-foreground focus:border-brand-400 focus:outline-none disabled:opacity-50";
const STARS = ["அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்",
  "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்",
  "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"];
const TYPES: [KalaiBabyReportType, string, string][] = [
  ["single_star_letter", "ஒரு நட்சத்திர எழுத்து மட்டும்", "Single Star Letter Only"],
  ["single_numerology_no", "ஒரு நியுமராலஜி எண் மட்டும்", "Single Numerology No Only"],
  ["star_letters", "நட்சத்திர எழுத்துக்கள் மட்டும்", "Star Letters Only"],
  ["numerology_numbers", "நியுமராலஜி எண்கள் மட்டும்", "Numerology Numbers Only"],
  ["single_star_letter_numerology", "ஒரு நட்சத்திர எழுத்து + நியுமராலஜி", "Single Star Letter + Numerology"],
  ["single_numerology_no_star", "ஒரு நியுமராலஜி எண் + நட்சத்திரம்", "Single Numerology No + Star"],
  ["star_numerology", "நட்சத்திரம் + நியுமராலஜி விவரம்", "Star + Numerology Details"],
];
const NEEDS_STAR: KalaiBabyReportType[] = ["single_star_letter", "star_letters", "single_star_letter_numerology", "single_numerology_no_star", "star_numerology"];
const NEEDS_LETTER: KalaiBabyReportType[] = ["single_star_letter", "single_star_letter_numerology"];
const NEEDS_NO: KalaiBabyReportType[] = ["single_numerology_no", "single_numerology_no_star"];

export default function KalaiBabyNamesPage() {
  const [lang, setLang] = usePersistentLang();
  const [type, setType] = useState<KalaiBabyReportType>("star_numerology");
  const [sex, setSex] = useState("boy");
  const [religion, setReligion] = useState("hindu");
  const [dob, setDob] = useState(new Date().toISOString().slice(0, 10));
  const [star, setStar] = useState<number | "">("");
  const [letters, setLetters] = useState<string[]>([]);
  const [firstLetter, setFirstLetter] = useState("");
  const [numNo, setNumNo] = useState<number | "">("");
  const [father, setFather] = useState("");
  const [grandfather, setGrandfather] = useState("");
  const [mother, setMother] = useState("");
  const [res, setRes] = useState<KalaiBabyResult | null>(null);
  const [shownForm, setShownForm] = useState<Record<string, unknown> | null>(null); // the form as generated
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFirstLetter("");
    if (star === "") { setLetters([]); return; }
    getStarLettersApi(star).then((r) => { setLetters(r.letters); setFirstLetter(r.letters[0] ?? ""); }).catch(() => setLetters([]));
  }, [star]);

  // Initial = the FIRST LETTER of the father's / grandfather's / mother's name.
  const initials = [father, grandfather, mother].map(initialOf).filter(Boolean);

  const run = async () => {
    setErr(null);
    if (NEEDS_STAR.includes(type) && star === "") { setErr(lang === "ta" ? "நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்" : "Please choose the star"); return; }
    if (NEEDS_LETTER.includes(type) && !firstLetter) { setErr(lang === "ta" ? "முதல் எழுத்தைத் தேர்ந்தெடுக்கவும்" : "Please choose the first letter"); return; }
    if (NEEDS_NO.includes(type) && numNo === "") { setErr(lang === "ta" ? "நியுமராலஜி எண்ணை உள்ளிடவும்" : "Please enter the numerology number"); return; }
    setBusy(true); setRes(null);
    try {
      setRes(await kalaiBabyNamesApi({ report_type: type, sex, birth_date: dob, star: star === "" ? null : star,
        first_letter: NEEDS_LETTER.includes(type) ? firstLetter : null, numerology_no: NEEDS_NO.includes(type) ? Number(numNo) : null,
        initials, religion }));
      setShownForm({ report_type: type, sex, birth_date: dob, star: star === "" ? null : star, first_letter: firstLetter || null,
        numerology_no: numNo === "" ? null : numNo, initials, religion });
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  const pdf = async () => {
    if (!sheet.current) return;
    await waitForRenderReady();
    await exportNodesToPdf([sheet.current], `baby-names-${dob}.pdf`);
  };

  return (
    <JathagamThemeProvider>
    <div className="app-shell min-h-screen flex flex-col">
      <Header lang={lang} setLang={setLang} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <PageHero icon={<Baby className="h-7 w-7" />} eyebrow="KALAI MAGAL PARITY · BABY NAMES"
          title={lang === "ta" ? "நட்சத்திரம் & நியுமராலஜி" : "Star & Numerology"} highlight={lang === "ta" ? "பெயர்கள்" : "Names"}
          tagline={lang === "ta" ? "— கலைமகள் 7 அறிக்கை வகைகள் —" : "— Kalai's 7 report types —"} />

        <section className="no-print story-panel mx-auto grid w-full gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{lang === "ta" ? "அறிக்கை வகை" : "Report type"}</h3>
            {TYPES.map(([k, ta, en]) => (
              <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-base ${type === k ? "bg-brand-500/10 text-brand-fg" : "text-foreground hover:bg-brand-500/5"}`}>
                <input type="radio" checked={type === k} onChange={() => { setType(k); setRes(null); }} />{lang === "ta" ? ta : en}
              </label>
            ))}
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "பாலினம்" : "Sex"}
                <select className={field} value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="boy">{lang === "ta" ? "ஆண்" : "Male"}</option><option value="girl">{lang === "ta" ? "பெண்" : "Female"}</option>
                </select></label>
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "மதம்" : "Religion"}
                <select className={field} value={religion} onChange={(e) => setReligion(e.target.value)}>
                  <option value="hindu">{lang === "ta" ? "இந்து" : "Hindu"}</option><option value="christian">{lang === "ta" ? "கிறிஸ்தவர்" : "Christian"}</option><option value="muslim">{lang === "ta" ? "முஸ்லிம்" : "Muslim"}</option>
                </select></label>
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "பிறந்த தேதி" : "Birth date"}
                <DateInput  className={field} value={dob} onChange={(e) => setDob(e.target.value)} /></label>
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "நட்சத்திரம்" : "Star"}
                <select className={field} value={star} disabled={!NEEDS_STAR.includes(type)} onChange={(e) => setStar(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">—</option>{STARS.map((s, i) => <option key={s} value={i + 1}>{s}</option>)}
                </select></label>
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "முதல் எழுத்து" : "First letter"}
                <select className={field} value={firstLetter} disabled={!NEEDS_LETTER.includes(type) || letters.length === 0} onChange={(e) => setFirstLetter(e.target.value)}>
                  <option value="">—</option>{letters.map((l) => <option key={l} value={l}>{l}</option>)}
                </select></label>
              <label className="space-y-1 text-sm font-medium">{lang === "ta" ? "நியுமராலஜி எண்" : "Numerology number"}
                <input type="number" min={1} max={99} className={field} value={numNo} disabled={!NEEDS_NO.includes(type)} onChange={(e) => setNumNo(e.target.value ? Number(e.target.value) : "")} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {([["தந்தை பெயரின் முதல் எழுத்து", "Father's first letter", father, setFather],
                 ["பாட்டனார் பெயரின் முதல் எழுத்து", "Grandfather's first letter", grandfather, setGrandfather],
                 ["தாயார் பெயரின் முதல் எழுத்து", "Mother's first letter", mother, setMother]] as [string, string, string, (v: string) => void][]).map(([ta, en, v, setV]) => (
                <label key={en} className="space-y-1 text-sm font-medium">{lang === "ta" ? ta : en}
                  <input maxLength={3} className={`${field} text-center text-lg font-semibold uppercase`} value={v}
                    onChange={(e) => setV(initialOf(e.target.value))} placeholder={lang === "ta" ? "உ-ம்: K அல்லது க" : "e.g. K"} />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={run} disabled={busy} className="rounded-xl brand-gradient-bg px-8 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
                {busy ? "…" : (lang === "ta" ? "உருவாக்கு" : "Generate")}
              </button>
              {res && <button type="button" onClick={pdf} className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground">{lang === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"}</button>}
            </div>
            {err && <p className="text-sm text-red-500">{err}</p>}

          </div>
        </section>

        {res && shownForm && (
          <PrintPdfControls path="baby-names" lang={lang} ready filename={`baby-names-${dob}.pdf`}
            body={{ form: shownForm }} />
        )}
        {res && shownForm && (
          <ReportWatermark access={{ product: "SINGLE_PAGE", reportKey: formKey("baby", shownForm) }}>
          <div ref={sheet} className={`${DOC} kalai-page story-panel mx-auto w-full space-y-6 rounded-3xl p-6 text-base sm:p-10`}>
            <h2 className="text-center text-2xl font-bold text-[#8e2b1c]">
              {lang === "ta" ? "நட்சத்திரம் மற்றும் நியுமராலஜி அடிப்படையில் பெயர் அமைத்தல்" : "Names by star and numerology"}
            </h2>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              <div>{lang === "ta" ? "ஆண் / பெண்" : "Sex"}: {res.sex === "girl" ? (lang === "ta" ? "பெண்" : "Female") : (lang === "ta" ? "ஆண்" : "Male")}</div>
              <div>{lang === "ta" ? "பிறந்த தேதி" : "Birth date"}: {res.birth_date.split("-").reverse().join("-")}</div>
              <div>{lang === "ta" ? "இனிசியல் (தந்தை / பாட்டனார் / தாயார்)" : "Initials (father / grandfather / mother)"}: {[father, grandfather, mother].map((x) => initialOf(x) || "-").join(" / ")}</div>
              <div>{lang === "ta" ? "தேதி எண்" : "Date number"}: {res.date_number} · {lang === "ta" ? "தேதியின் கூட்டு எண்" : "Destiny number"}: {res.destiny_number}</div>
              {res.star_letters && <div className="sm:col-span-2">{lang === "ta" ? "நட்சத்திரப்படி அமைக்க வேண்டிய பெயரின் முதல் எழுத்து" : "First letters by star"}: {res.star_letters.display}</div>}
              {res.first_letter && <div className="sm:col-span-2">{lang === "ta" ? "தேர்ந்தெடுத்த எழுத்து" : "Chosen letter"}: {res.first_letter}</div>}
              {res.numerology_no && <div className="sm:col-span-2">{lang === "ta" ? "தேர்ந்தெடுத்த எண்" : "Chosen number"}: {res.numerology_no}</div>}
              <div className="sm:col-span-2">{lang === "ta" ? "நியுமராலஜிப்படி அமைக்க வேண்டிய பெயரின் கூட்டு எண்" : "Allowed name numbers"}: {res.allowed_numbers.join("-")}{!res.allowed_verified && " *"}</div>
            </div>
            <div className="table-scroll"><table className="w-full table-fixed border-collapse text-center text-xs">
              <tbody>
                {[0, 13].map((s) => (
                  <React.Fragment key={s}>
                    <tr>{Object.keys(res.letter_table).slice(s, s + 13).map((k) => <td key={k} className="border border-line py-1 font-semibold">{k}</td>)}</tr>
                    <tr>{Object.values(res.letter_table).slice(s, s + 13).map((v, i) => <td key={i} className="border border-line py-1">{v}</td>)}</tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table></div>
            {res.names.length === 0 ? (
              <p className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4 text-center">{lang === "ta"
                ? "இந்த எழுத்து மற்றும் எண்ணுக்குப் பொருந்தும் பெயர்கள் பெயர் வங்கியில் இல்லை. வேறு எழுத்தைத் தேர்ந்தெடுக்கவும், அல்லது “நட்சத்திரம் + நியுமராலஜி விவரம்” வகையைப் பயன்படுத்தவும்."
                : "The name bank has no names for this letter and number. Choose another letter, or use “Star + Numerology Details”."}</p>
            ) : (
              <div className="grid gap-x-12 gap-y-1 md:grid-cols-2">
                {res.names.map((n, i) => (
                  <div key={`${n.name_en}-${i}`} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_3rem] items-baseline gap-4 border-b border-dotted border-[#aa820a]/40 py-2.5">
                    <span className="break-words font-medium">{n.name_en}</span><span>{n.name_ta}</span><span className="text-right font-mono font-semibold text-[#8e2b1c]">{n.total}</span>
                  </div>))}
              </div>
            )}
            <p className="text-xs text-muted">
              {res.count} {lang === "ta" ? "பெயர்கள் (ஒவ்வொரு பெயரும் ஒரு முறை மட்டும்)" : "names (each name listed once)"}
              {!res.allowed_verified && (lang === "ta" ? " · * இந்த தேதி எண் இணைக்கு கலைமகள் பட்டியல் இன்னும் ஒப்பிடப்படவில்லை" : " · * this date/destiny pair has not been seen in a Kalai printout yet")}
            </p>
          </div>
          </ReportWatermark>
        )}
      </main>
      <Footer lang={lang} />
    </div>
    </JathagamThemeProvider>
  );
}
