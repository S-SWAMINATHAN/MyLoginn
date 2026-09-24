"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Printer, Baby, Search } from "lucide-react";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
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

interface RasiItem {
  rasi: number;
  rasi_en: string;
  rasi_ta: string;
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
  const [search, setSearch] = useState("");
  const [activeSyllables, setActiveSyllables] = useState<string>("");
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
    fetch(`${API_BASE}/general-names/rasi-list`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => setRasiList(d.rasis || []))
      .catch(() => setRasiList([]));
  }, []);

  const loadRasi = useCallback(
    async (n: number, g: Gender, q: string) => {
      setLoading(true);
      setError(null);
      try {
        const p = new URLSearchParams({ rasi: String(n), limit: "60" });
        if (g) p.set("gender", g);
        if (q.trim()) p.set("search", q.trim());
        const res = await fetch(`${API_BASE}/general-names/by-rasi?${p.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setRows(data.names || []);
        setAvailable(data.available_count ?? 0);
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
        if (search.trim()) q.set("search", search.trim());
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
    [view, search]
  );

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
    loadRasi(n, gender, search);
  };

  const pickGender = (g: Gender) => {
    setGender(g);
    if (mode === "rasi" && rasi) loadRasi(rasi, g, search);
    else if (letter) load(letter, g);
  };

  const runSearch = () => {
    if (mode === "rasi" && rasi) loadRasi(rasi, gender, search);
    else if (letter) load(letter, gender);
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
      searchPh: view === "ta" ? "பெயரில் தேடுக..." : "Search within these names...",
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
            onClick={() => window.print()}
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
              onClick={() => setMode(m as "letter" | "rasi")}
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
                  <div className="text-sm font-bold">
                    {view === "ta" ? r.rasi_ta : r.rasi_en}
                  </div>
                  <div className={`text-[10px] ${rasi === r.rasi ? "text-white/80" : "text-muted"}`}>
                    {view === "ta" ? r.rasi_en : r.rasi_ta}
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

        {/* Search within the current selection */}
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder={t.searchPh}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-sm outline-none focus:border-brand-500"
            />
          </div>
          <button type="button" onClick={runSearch} className="btn-secondary text-xs">
            {view === "ta" ? "தேடு" : "Search"}
          </button>
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
        <div className="hidden print:block text-center mb-4 pb-2 border-b-2 border-black">
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3
                       print:block print:columns-2 print:gap-0"
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
                    <div className="text-[11px] text-muted print:text-[8pt]">
                      {view === "ta" ? r.name_en : r.name_ta}
                    </div>
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
    </section>
  );
};

export default GeneralNameGenerator;
