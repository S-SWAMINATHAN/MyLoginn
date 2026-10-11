"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Printer, Baby, Search, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import { ASTRO_API } from "@/lib/astrology/routes";
import { captureNode, addCanvasToPdf, safeFileName } from "@/lib/astrology/pdfExport";

/**
 * General Baby Name Generator — browse every real name by starting letter.
 *
 * Separate from the Baby Birth Details feature above it: that one selects
 * names from the baby's Nakshatra-Pada syllable, this is a plain A-Z browse
 * for parents who just want to look. They share the same database rows, so
 * a name never appears in one and not the other, and never twice here.
 *
 * Nothing is generated client-side. If a letter has no names, the UI says so
 * rather than showing placeholders.
 */

const API_BASE = ASTRO_API;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Gender = "" | "boy" | "girl";

interface NameRow {
  id: number;
  name_en: string;
  name_ta: string;
  meaning_en: string;
  meaning_ta: string;
  gender: string;
  starting_letter: string;
}

interface RelOption {
  value: string;
  label_en: string;
  label_ta: string;
  count: number;
}

interface RasiItem {
  rasi: number;
  rasi_en: string;
  rasi_ta: string;
  rasi_sa?: string;
  syllables: { nakshatra: string; pada: number; syllable: string; syllable_ta: string }[];
}

interface Props {
  /** Site language, used as the initial state of the local toggle. */
  lang: "ta" | "en";
}

export const GeneralNameGenerator: React.FC<Props> = ({ lang }) => {
  const [mode, setMode] = useState<"letter" | "rasi">("letter");
  const [letter, setLetter] = useState<string | null>(null);
  const [rasi, setRasi] = useState<number | null>(null);
  const [rasiList, setRasiList] = useState<RasiItem[]>([]);
  const [religion, setReligion] = useState("");
  const [religions, setReligions] = useState<RelOption[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activeSyllables, setActiveSyllables] = useState<string>("");
  const [rasiLabel, setRasiLabel] = useState<string>("");
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [gender, setGender] = useState<Gender>("");
  // Language follows the site-wide toggle in the header. A second toggle
  // inside this card was redundant and let the two disagree.
  const view = lang;
  const [rows, setRows] = useState<NameRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<number>(0);


  // Per-letter counts, so letters with nothing behind them are disabled
  // rather than offered as dead buttons.
  useEffect(() => {
    const q = gender ? `?gender=${gender}` : "";
    fetch(`${API_BASE}/general-names/letters${q}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setCounts(d.counts || {}))
      .catch(() => setCounts({}));
  }, [gender]);

  useEffect(() => {
    fetch(`${API_BASE}/general-names/religions`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setReligions(d.options || []))
      .catch(() => setReligions([]));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/general-names/rasi-list`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setRasiList(d.rasis || []))
      .catch(() => setRasiList([]));
  }, []);

  const loadRasi = useCallback(
    async (n: number, g: Gender, r: string) => {
      setLoading(true);
      setError(null);
      try {
        const p = new URLSearchParams({ rasi: String(n), limit: "60" });
        if (g) p.set("gender", g);
        if (r) p.set("religion", r);
        const res = await fetch(`${API_BASE}/general-names/by-rasi?${p.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setRows(data.names || []);
        setAvailable(data.available_count ?? 0);
        setRasiLabel(data.rasi_en || "");
        setActiveSyllables(
          (data.syllables || [])
            .map((x: any) => (lang === "ta" ? x.syllable_ta : x.syllable))
            .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
            .join(" · ")
        );
      } catch (e: any) {
        setRows([]);
        setError(lang === "ta" ? "பெயர்களைப் பெற முடியவில்லை." : `Could not load names. ${e?.message || ""}`.trim());
      } finally {
        setLoading(false);
      }
    },
    [lang]
  );

  const load = useCallback(
    async (l: string, g: Gender) => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ letter: l, limit: "60" });
        if (g) q.set("gender", g);
        if (religion) q.set("religion", religion);
        const res = await fetch(`${API_BASE}/general-names?${q.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setRows(data.names || []);
        setAvailable(data.available_count ?? 0);
      } catch (e: any) {
        setRows([]);
        setError(
          view === "ta"
            ? "பெயர்களைப் பெற முடியவில்லை. சேவையகம் இயங்குகிறதா எனப் பார்க்கவும்."
            : `Could not load names. ${e?.message || ""}`.trim()
        );
      } finally {
        setLoading(false);
      }
    },
    [view, religion]
  );

  /**
   * Switching browse mode starts that mode from scratch.
   *
   * Both modes write into one result list, so without this the letter's names
   * stayed on screen under the zodiac picker and read as that sign's names.
   * The selection, syllable line and any error are cleared too, so nothing
   * from the previous mode survives the switch.
   */
  const switchMode = (m: "letter" | "rasi") => {
    if (m === mode) return;
    setMode(m);
    setRows([]);
    setAvailable(0);
    setError(null);
    setLetter(null);
    setRasi(null);
    setActiveSyllables("");
    setRasiLabel("");
  };

  const pickLetter = (l: string) => {
    setMode("letter");
    setLetter(l);
    setRasi(null);
    setActiveSyllables("");
    load(l, gender);
  };

  const pickRasi = (n: number) => {
    setMode("rasi");
    setRasi(n);
    setLetter(null);
    loadRasi(n, gender, religion);
  };

  const pickGender = (g: Gender) => {
    setGender(g);
    if (mode === "rasi" && rasi) loadRasi(rasi, g, religion);
    else if (letter) load(letter, g);
  };

  const pickReligion = (r: string) => {
    setReligion(r);
    if (mode === "rasi" && rasi) loadRasi(rasi, gender, r);
    else if (letter) load(letter, gender);
  };

  /**
   * Both the Nakshatra results panel and this one define print rules, and CSS
   * cannot tell which button was pressed — so pressing either printed both.
   * Tagging the body for the duration of the print makes the choice explicit.
   */
  const printThisSection = () => {
    document.body.dataset.printTarget = "general-names";
    const clear = () => {
      delete document.body.dataset.printTarget;
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
    // Safari fires afterprint unreliably; clear on the next tick as well.
    setTimeout(clear, 1000);
  };

  const handlePdf = async () => {
    const el = sheetRef.current;
    if (!el) return;
    try {
      setGenerating(true);
      const canvas = await captureNode(el, { scale: 2, background: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      addCanvasToPdf(pdf, canvas, { background: "#ffffff" });
      pdf.save(`${safeFileName(letter || rasiLabel || "Baby")}_Names.pdf`);
    } catch (e) {
      console.error(e);
      alert(view === "ta" ? "PDF உருவாக்குவதில் பிழை." : "Could not generate the PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const t = useMemo(
    () => ({
      title: view === "ta" ? "பொதுக் குழந்தை பெயர் தேர்வு" : "General Baby Name Generator",
      sub:
        view === "ta"
          ? "எழுத்தைத் தேர்ந்தெடுத்து, அந்த எழுத்தில் தொடங்கும் அனைத்து உண்மையான பெயர்களையும் பாருங்கள்"
          : "Pick a letter to browse every real name that starts with it",
      choose: view === "ta" ? "எழுத்தைத் தேர்ந்தெடுக்கவும்" : "Choose a starting letter",
      all: view === "ta" ? "அனைத்தும்" : "All",
      boy: view === "ta" ? "ஆண் குழந்தை" : "Baby Boy",
      girl: view === "ta" ? "பெண் குழந்தை" : "Baby Girl",
      print: view === "ta" ? "பட்டியலை அச்சிடுக" : "Print Names List",
      meaning: view === "ta" ? "பொருள்" : "Meaning",
      empty:
        view === "ta"
          ? "இந்த எழுத்தில் தொடங்கும் பெயர்கள் தரவுத்தளத்தில் இல்லை."
          : "No names in the database start with this letter.",
      prompt:
        view === "ta"
          ? "மேலே ஒரு எழுத்தையோ ராசியையோ தேர்ந்தெடுக்கவும்."
          : "Pick a letter or a zodiac sign above to begin.",
      byLetter: view === "ta" ? "எழுத்து வாரியாக" : "By letter",
      byRasi: view === "ta" ? "ராசி வாரியாக" : "By zodiac sign",
      religionLbl: view === "ta" ? "மதம்" : "Religion",
      syl: view === "ta" ? "நாம அக்ஷரங்கள்" : "Naming syllables",
    }),
    [view]
  );

  const genderLabel = (g: string) =>
    view === "ta" ? (g === "girl" ? "பெண்" : "ஆண்") : g === "girl" ? "Girl" : "Boy";

  return (
    <section className="card p-6 sm:p-8 text-foreground print:border-0 print:shadow-none print:p-0">
      {/* ── Header (hidden when printing) ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-soft pb-4 mb-5 print:hidden">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Baby className="w-5 h-5 text-brand-fg" />
            {t.title}
          </h2>
          <p className="text-xs text-muted mt-1">{t.sub}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePdf}
            disabled={generating || rows.length === 0}
            className="btn-secondary text-xs disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {view === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={printThisSection}
            disabled={rows.length === 0}
            className="btn-primary text-xs disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            {t.print}
          </button>
        </div>
      </div>

      {/* ── A-Z grid (hidden when printing) ───────────────────────────── */}
      <div className="print:hidden">
        {/* Browse mode */}
        <div className="inline-flex rounded-xl border border-line overflow-hidden mb-4">
          {([["letter", t.byLetter], ["rasi", t.byRasi]] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m as "letter" | "rasi")}
              className={`px-4 py-2 text-xs font-semibold transition-all ${
                mode === m ? "bg-brand-600 text-white" : "bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "rasi" ? (
          <>
            <div className="field-label">{t.byRasi}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {rasiList.map((r) => (
                <button
                  key={r.rasi}
                  type="button"
                  onClick={() => pickRasi(r.rasi)}
                  className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                    rasi === r.rasi
                      ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                      : "bg-surface-2 border-line text-foreground hover:border-brand-500"
                  }`}
                >
                  {/* One script per language, same rule as the name cards.
                      The second line used to show `rasi_sa || rasi_ta`, so on
                      any backend that does not send the Sanskrit name it fell
                      back to Tamil — putting மிதுனம் under "Gemini". Showing
                      only the selected language cannot fall back at all. */}
                  <div className="text-sm font-bold">
                    {view === "ta" ? r.rasi_ta : r.rasi_en}
                  </div>
                </button>
              ))}
            </div>
            {activeSyllables && (
              <p className="text-[11px] text-muted mt-2">
                {t.syl}: <span className="font-semibold text-brand-fg">{activeSyllables}</span>
              </p>
            )}
          </>
        ) : (
        <>
        <div className="field-label">{t.choose}</div>
        <div
          className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 md:[grid-template-columns:repeat(13,minmax(0,1fr))]"
        >
          {ALPHABET.map((l) => {
            const n = counts[l] || 0;
            const disabled = n === 0;
            const active = letter === l;
            return (
              <button
                key={l}
                type="button"
                disabled={disabled}
                onClick={() => pickLetter(l)}
                title={
                  disabled
                    ? view === "ta"
                      ? "இந்த எழுத்தில் பெயர்கள் இல்லை"
                      : "No names for this letter"
                    : `${n}`
                }
                className={`relative aspect-square min-h-[40px] rounded-xl text-sm font-bold transition-all border ${
                  active
                    ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                    : disabled
                    ? "bg-surface-2 border-line text-muted/40 cursor-not-allowed"
                    : "bg-surface-2 border-line text-foreground hover:border-brand-500 hover:bg-brand-500/10"
                }`}
              >
                {l}
                {!disabled && (
                  <span
                    className={`absolute -top-1 -right-1 rounded-full px-1 text-[9px] font-semibold ${
                      active ? "bg-white text-brand-fg" : "bg-brand-500/15 text-brand-fg"
                    }`}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        </>
        )}

        {/* Religion dropdown. Counts are shown on purpose — coverage is very
            uneven (Nakshatra-syllable naming is a Hindu convention), so a bare
            list of options would let someone pick one and land on an empty
            page with no explanation. */}
        <div className="flex items-center gap-2 mt-4">
          <label className="text-xs font-semibold text-muted">{t.religionLbl}:</label>
          <select
            value={religion}
            onChange={(e) => pickReligion(e.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {religions.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {(view === "ta" ? o.label_ta : o.label_en) + ` (${o.count})`}
              </option>
            ))}
          </select>
        </div>

        {/* Gender filter */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {([["", t.all], ["boy", t.boy], ["girl", t.girl]] as Array<[Gender, string]>).map(
            ([g, label]) => (
              <button
                key={g || "all"}
                type="button"
                onClick={() => pickGender(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  gender === g
                    ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                    : "bg-surface-2 border-line text-foreground hover:border-brand-500"
                }`}
              >
                {label}
              </button>
            )
          )}

          {(letter || rasi) && !loading && (
            <span className="chip-brand ml-auto">
              {view === "ta"
                ? `${rows.length} / ${available} பெயர்கள்`
                : `${rows.length} of ${available} names`}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger print:hidden">
          {error}
        </div>
      )}

      {/* ── Print-only header ─────────────────────────────────────────── */}
      {rows.length > 0 && (
        <div className="hidden text-center mb-4 pb-2 border-b-2 border-black">
          <div className="text-lg font-bold">{t.title}</div>
          <div className="text-xs">
            {view === "ta"
              ? `எழுத்து: ${letter} · ${rows.length} பெயர்கள்`
              : `Letter: ${letter} · ${rows.length} names`}
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      <div className="mt-5 print:mt-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted print:hidden">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{view === "ta" ? "ஏற்றுகிறது..." : "Loading..."}</span>
          </div>
        ) : !letter && !rasi ? (
          <div className="well p-8 text-center text-sm text-muted print:hidden">
            <Search className="w-5 h-5 mx-auto mb-2 opacity-60" />
            {t.prompt}
          </div>
        ) : rows.length === 0 ? (
          <div className="well p-8 text-center text-sm text-muted print:hidden">{t.empty}</div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:hidden"
          >
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="well p-4 card-hover
                           print:border-0 print:border-b print:border-gray-300 print:rounded-none
                           print:p-0 print:py-1 print:break-inside-avoid print:shadow-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-base font-bold print:text-[10.5pt]">
                      <span className="hidden print:inline">{i + 1}. </span>
                      {view === "ta" ? r.name_ta || r.name_en : r.name_en}
                    </div>
                    {/* Bug 1: one script per language. English mode used to
                        print the Tamil spelling under every English name —
                        that is the "Tamil words in English" problem. Each
                        language now shows only its own script. */}
                  </div>
                  <span className="chip text-[10px] shrink-0 print:border-0 print:px-0">
                    {genderLabel(r.gender)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 mt-2 print:mt-0 print:text-[8.5pt]">
                  {view === "ta" ? r.meaning_ta || r.meaning_en : r.meaning_en}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* A4 sheet — captured for the PDF, and the ONLY thing that prints.
          Bug 2: this sheet sits inside the printed section, so with the card
          grid also printing, every Print produced the list twice — once as
          cards, once as this table. The grid is now print:hidden and this
          sheet is revealed for print, so Print and Download PDF produce the
          same page. */}
      <div className="fixed left-[-10000px] top-0 pointer-events-none print:static print:left-0 print:block" aria-hidden>
        <div
          ref={sheetRef}
          data-pdf-host
          style={{
            width: "794px",
            background: "#ffffff",
            padding: "40px 44px",
            color: "#111827",
            fontFamily: "'Noto Sans Tamil', 'Inter', sans-serif",
          }}
        >
          <div style={{ textAlign: "center", borderBottom: "2px solid #1f56d6", paddingBottom: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#16337e" }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#576179", marginTop: 4 }}>
              {letter
                ? (view === "ta" ? `எழுத்து: ${letter}` : `Letter: ${letter}`)
                : activeSyllables}
              {" · "}
              {view === "ta" ? `${rows.length} பெயர்கள்` : `${rows.length} names`}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#576179" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", width: "6%" }}>#</th>
                <th style={{ textAlign: "left", padding: "4px 8px", width: "30%" }}>
                  {view === "ta" ? "பெயர்" : "Name"}
                </th>
                <th style={{ textAlign: "left", padding: "4px 8px", width: "12%" }}>
                  {view === "ta" ? "பாலினம்" : "Gender"}
                </th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>
                  {view === "ta" ? "பொருள்" : "Meaning"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`pdf-${r.id}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", color: "#6b7280" }}>{i + 1}</td>
                  <td style={{ padding: "4px 8px", fontWeight: 700 }}>
                    {view === "ta" ? r.name_ta || r.name_en : r.name_en}
                  </td>
                  <td style={{ padding: "4px 8px" }}>{genderLabel(r.gender)}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {view === "ta" ? r.meaning_ta || r.meaning_en : r.meaning_en}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, paddingTop: 8, borderTop: "1px solid #e5e7eb", fontSize: 9, color: "#6b7280", textAlign: "center" }}>
            MyLoginn Astrology — {view === "ta" ? "குழந்தை பெயர் பட்டியல்" : "Baby name list"}
          </div>
        </div>
      </div>

    </section>
  );
};

export default GeneralNameGenerator;
