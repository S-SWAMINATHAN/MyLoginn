"use client";

// Report options shared by கணித ஜாதகம் and கே.பி ஜாதகம்:
//   • PaperPicker   — A4 / A5 sheet for the full (and custom) jathagam, used by BOTH
//                     the normal PDF (website capture) and the designed PDF.
//   • SectionPicker — "Custom / தனிப்பயன்": tick the contents to include; the
//                     website report, the normal PDF and the designed PDF all
//                     follow the ticks (cover, contents, prayers and the closing
//                     page always stay).
import React from "react";
import { FileText, ListChecks } from "lucide-react";
import type { PaperSize } from "@/lib/pdfExport";

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

export function SectionPicker({ sections, value, onChange, lang }: {
  sections: SectionDef[]; value: string[]; onChange: (keys: string[]) => void; lang: Lang;
}) {
  const all = value.length === sections.length;
  const toggle = (k: string) =>
    onChange(value.includes(k) ? value.filter((x) => x !== k) : sections.map((s) => s.key).filter((x) => x === k || value.includes(x)));
  return (
    <div className="jat-chrome story-panel space-y-3 rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <ListChecks className="h-5 w-5" style={{ color: "#2F6FED" }} aria-hidden />
          {lang === "ta" ? "தனிப்பயன் — தேவையான பொருளடக்கங்களைத் தேர்வு செய்யவும்" : "Custom — choose the contents to include"}
        </h3>
        <div className="flex gap-2">
          <button type="button" className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
            onClick={() => onChange(sections.map((s) => s.key))} disabled={all}>
            {lang === "ta" ? "அனைத்தும்" : "Select all"}
          </button>
          <button type="button" className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
            onClick={() => onChange([])} disabled={!value.length}>
            {lang === "ta" ? "எதுவும் இல்லை" : "Clear"}
          </button>
        </div>
      </div>
      <p className="text-xs text-muted">
        {lang === "ta"
          ? "முகப்பு, பொருளடக்கம், வாழ்த்துப் பக்கங்கள், நிறைவுப் பக்கம் எப்போதும் இருக்கும். தேர்வு செய்த பகுதிகள் மட்டும் அறிக்கை, சாதாரண PDF, வடிவமைத்த PDF மூன்றிலும் வரும்."
          : "The cover, contents, prayer pages and closing page always stay. Only the ticked sections appear in the report, the normal PDF and the designed PDF."}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s, i) => (
          <label key={s.key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[#2F6FED]" checked={value.includes(s.key)} onChange={() => toggle(s.key)} />
            <span>{i + 1}. {lang === "ta" ? s.ta : s.en}</span>
          </label>
        ))}
      </div>
      {!value.length && (
        <p className="text-center text-xs text-red-500">{lang === "ta" ? "குறைந்தது ஒரு பகுதியைத் தேர்வு செய்யவும்." : "Choose at least one section."}</p>
      )}
    </div>
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
