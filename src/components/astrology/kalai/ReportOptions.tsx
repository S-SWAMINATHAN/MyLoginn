"use client";

// Report options shared by கணித ஜாதகம் and கே.பி ஜாதகம்:
//   • PaperPicker   — A4 / A5 sheet for the full (and custom) jathagam, used by BOTH
//                     the normal PDF (website capture) and the designed PDF.
//   • SectionPicker — "Custom / தனிப்பயன்": tick the contents to include; the
//                     website report, the normal PDF and the designed PDF all
//                     follow the ticks (cover, contents, prayers and the closing
//                     page always stay).
import React, { useEffect, useState } from "react";
import { Check, FileText, ListChecks, SlidersHorizontal, X } from "lucide-react";
import type { PaperSize } from "@/lib/astrology/pdfExport";

type Lang = "ta" | "en";
export type SectionDef = { key: string; ta: string; en: string };

export function PaperPicker({ value, onChange, lang }: { value: PaperSize; onChange: (p: PaperSize) => void; lang: Lang }) {
  const opts: { v: PaperSize; ta: string; en: string; sub: string }[] = [
    { v: "A4", ta: "A4 தாள்", en: "A4 sheet", sub: "210 × 297 mm" },
    { v: "A5", ta: "A5 தாள்", en: "A5 sheet", sub: "148 × 210 mm" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="radiogroup" aria-label={lang === "ta" ? "தாள் அளவு" : "Paper size"}>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <FileText className="h-4 w-4" style={{ color: "#2F6FED" }} aria-hidden />
        {lang === "ta" ? "தாள் அளவு" : "Paper size"}
      </span>
      {opts.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={`rounded-xl border px-4 py-1.5 text-center text-xs font-medium transition-all ${value === o.v ? "choice-active" : "choice"}`}>
          <div className="flex items-center gap-1.5 font-semibold"><FileText className="h-3.5 w-3.5" aria-hidden />{lang === "ta" ? o.ta : o.en}</div>
          <span className="block text-[9px] opacity-80">{o.sub}</span>
        </button>
      ))}
    </div>
  );
}

const BLUE = "#2F6FED";
const GRAD = `linear-gradient(135deg, ${BLUE}, #7C5CFF)`;

/**
 * "Custom / தனிப்பயன்": a summary card plus a popup to tick the contents.
 * The popup opens by itself the moment Custom is chosen (this component mounts),
 * and can be reopened from the card.
 */
export function SectionPicker({ sections, value, onChange, lang }: {
  sections: SectionDef[]; value: string[]; onChange: (keys: string[]) => void; lang: Lang;
}) {
  const ta = lang === "ta";
  const [open, setOpen] = useState(true);
  const all = value.length === sections.length;
  const pct = sections.length ? (value.length / sections.length) * 100 : 0;
  // keep report order whatever order the ticks were made in
  const toggle = (k: string) =>
    onChange(value.includes(k) ? value.filter((x) => x !== k) : sections.map((s) => s.key).filter((x) => x === k || value.includes(x)));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Summary card */}
      <div className="jat-chrome story-panel flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: GRAD }}>
            <ListChecks className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground sm:text-base">
              {ta ? "தனிப்பயன் பொருளடக்கம்" : "Custom contents"}
            </h3>
            <p className="text-xs text-muted">
              {ta ? `${sections.length} பகுதிகளில் ${value.length} தேர்வு` : `${value.length} of ${sections.length} sections selected`}
            </p>
            <div className="mt-2 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: BLUE }} />
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
          style={{ background: GRAD }}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {ta ? "பகுதிகளை மாற்று" : "Edit sections"}
        </button>
        {!value.length && (
          <p className="text-xs text-red-500 sm:basis-full">{ta ? "குறைந்தது ஒரு பகுதியைத் தேர்வு செய்யவும்." : "Choose at least one section."}</p>
        )}
      </div>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true"
          aria-label={ta ? "பொருளடக்கங்களைத் தேர்வு செய்க" : "Choose contents"}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface text-foreground shadow-2xl sm:max-h-[86dvh] sm:max-w-3xl sm:rounded-3xl">
            {/* Header */}
            <div className="relative overflow-hidden px-5 pb-4 pt-5 text-white sm:px-6" style={{ background: GRAD }}>
              <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-lg font-bold leading-tight sm:text-xl">
                    <ListChecks className="h-5 w-5 shrink-0" aria-hidden />
                    {ta ? "பொருளடக்கங்களைத் தேர்வு செய்க" : "Choose what to include"}
                  </h3>
                  <p className="mt-1 text-xs text-white/85 sm:text-[13px]">
                    {ta
                      ? "முகப்பு, பொருளடக்கம், வாழ்த்துப் பக்கங்கள், நிறைவுப் பக்கம் எப்போதும் இருக்கும்."
                      : "Cover, contents, prayer pages and the closing page are always included."}
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label={ta ? "மூடு" : "Close"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center gap-3">
                <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-semibold tabular-nums">{value.length} / {sections.length}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={all} onClick={() => onChange(sections.map((s) => s.key))}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/30 disabled:opacity-50">
                    {ta ? "அனைத்தும்" : "Select all"}
                  </button>
                  <button type="button" disabled={!value.length} onClick={() => onChange([])}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/30 disabled:opacity-50">
                    {ta ? "எதுவும் இல்லை" : "Clear"}
                  </button>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {sections.map((sec, i) => {
                  const on = value.includes(sec.key);
                  return (
                    <button key={sec.key} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(sec.key)}
                      className="flex items-center gap-3 rounded-2xl border border-line px-3.5 py-3 text-left transition-all hover:-translate-y-px hover:shadow-md"
                      style={on ? { borderColor: BLUE, background: "rgba(47,111,237,0.08)" } : undefined}>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums transition-colors ${on ? "text-white" : "bg-black/5 text-muted"}`}
                        style={on ? { background: BLUE } : undefined}>
                        {on ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                        {ta ? sec.ta : sec.en}
                        {ta && <span className="block text-[11px] font-normal text-muted">{sec.en}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              <p className={`text-center text-xs sm:text-left ${value.length ? "text-muted" : "text-red-500"}`}>
                {value.length
                  ? (ta ? `${value.length} பகுதிகள் அறிக்கை, PDF-ல் வரும்` : `${value.length} sections will appear in the report and PDFs`)
                  : (ta ? "குறைந்தது ஒரு பகுதியைத் தேர்வு செய்யவும்." : "Choose at least one section.")}
              </p>
              <button type="button" disabled={!value.length} onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: GRAD }}>
                <Check className="h-4 w-4" />
                {ta ? "முடிந்தது" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Kanitha (Kalai) report sections, in report order — the keys the backend uses. */
export const KANITHA_SECTIONS: SectionDef[] = [
  { key: "general", ta: "பொது விவரங்கள்", en: "General details" },
  { key: "graha_spudam", ta: "கிரக ஸ்புடம்", en: "Planetary positions" },
  { key: "bhava_spudam", ta: "பாவ ஸ்புடம்", en: "Bhava spudam" },
  { key: "dasa_bhukti", ta: "தசா புக்தி", en: "Dasa bhukti" },
  { key: "antharam", ta: "அந்தரம்", en: "Antharam" },
  { key: "ashtakavarga", ta: "அஷ்ட வர்க்கம்", en: "Ashtakavarga" },
  { key: "sarvashtakavarga", ta: "சர்வாஷ்டக வர்க்கம்", en: "Sarvashtakavarga" },
  { key: "prasthara", ta: "பிரஸ்தார் அஷ்டவர்க்கம்", en: "Prasthara ashtakavarga" },
  { key: "shadbala", ta: "சட்பலம்", en: "Shadbala" },
  { key: "shodasa_varga", ta: "சோடச வர்க்கம்", en: "Shodasa varga" },
  { key: "planet_details", ta: "கிரகங்களின் விவர அட்டவணை", en: "Planet details" },
  { key: "numerology", ta: "நியுமராலஜி", en: "Numerology" },
  { key: "upagraha", ta: "உப கிரக ஸ்புடம்", en: "Upagraha spudam" },
  { key: "kalachakra", ta: "காலச்சக்கிர தசை", en: "Kalachakra dasa" },
  { key: "panchapakshi", ta: "பஞ்சபட்சி", en: "Panchapakshi" },
  { key: "bhava_palan", ta: "பாவக பலன்கள்", en: "Bhava palan" },
  { key: "dasa_palan", ta: "மகாதிசை பலன்கள்", en: "Mahadasa palan" },
  { key: "guru_gochara", ta: "குரு கோச்சார பலன்கள்", en: "Guru gochara palan" },
  { key: "sani_gochara", ta: "சனி கோச்சார பலன்கள்", en: "Sani gochara palan" },
  { key: "yoga", ta: "யோக அவயோகங்கள்", en: "Yogas and avayogas" },
];

/** KP report sections (KpReport MODULES order). */
export const KP_SECTIONS: SectionDef[] = [
  { key: "general", ta: "பொது விவரங்கள்", en: "General details" },
  { key: "planets", ta: "கிரக அட்டவணை", en: "Planet table" },
  { key: "cusps", ta: "பாவ அட்டவணை", en: "Cusp table" },
  { key: "chart", ta: "கே.பி சக்கரம்", en: "KP chart" },
  { key: "significators", ta: "காரக கிரகங்கள்", en: "Significators" },
  { key: "aspects", ta: "கிரக - பாவ பார்வைகள்", en: "Aspects" },
  { key: "dasa", ta: "தசா புக்தி", en: "Dasa bhukti" },
  { key: "antharam", ta: "அந்தரம்", en: "Antharam" },
];
