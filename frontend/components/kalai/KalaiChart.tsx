"use client";

// Chart used by every Kalai-parity page. It draws with the site's own
// HandwrittenChartCanvas (கையெழுத்துப் பாணி) — the same canvas the Generate
// Chart feature and the 50-page manuscript use — so:
//   • there is no Kaiyezhuthu/Digital toggle and no second title to overlap,
//   • Tamil (South) / Kerala / North-Indian styles all work,
//   • the ink colour and Tamil typeface from the Jathagam theme panel apply,
//   • the PDF shows exactly the handwritten chart that is on screen.
import React from "react";
import { HandwrittenChartCanvas } from "@/components/HandwrittenChartCanvas";
import type { ChartStyle } from "@/lib/chartLayouts";
import type { KattamPlanet } from "@/lib/types";

const PT: Record<string, [string, string]> = {
  Sun: ["சூரி", "Su"], Moon: ["சந்", "Mo"], Mars: ["செவ்", "Ma"], Mercury: ["புத", "Me"], Jupiter: ["குரு", "Ju"],
  Venus: ["சுக்", "Ve"], Saturn: ["சனி", "Sa"], Rahu: ["ராகு", "Ra"], Ketu: ["கேது", "Ke"], Lagna: ["லக்", "As"],
  Mandi: ["மாந்", "Md"], Uranus: ["யுரே", "Ur"], Neptune: ["நெப்", "Ne"], Fortuna: ["அ.பா", "Fo"],
};

export const CHART_STYLE_LABELS: Record<ChartStyle, { ta: string; en: string }> = {
  tamil: { ta: "தமிழ்", en: "Tamil (South)" },
  kerala: { ta: "கேரளா", en: "Kerala" },
  north_indian: { ta: "வட இந்திய", en: "North Indian" },
};

export function toKattam(cells: Record<string, string[]>, lang: "ta" | "en" = "ta"): Record<number, KattamPlanet[]> {
  const out: Record<number, KattamPlanet[]> = {};
  for (let s = 1; s <= 12; s++) {
    out[s] = (cells[String(s)] || []).map((p) => ({
      name: p, name_ta: PT[p]?.[0] ?? p,
      // the canvas prints `symbol` on Tamil pages, so it must be the Tamil short name there
      symbol: lang === "ta" ? (PT[p]?.[0] ?? p) : (PT[p]?.[1] ?? p.slice(0, 2)), is_lagna: p === "Lagna",
    }));
  }
  return out;
}

/** "D9 நவாம்சம்" → "நவாம்சம்": varga codes are not printed inside the chart. */
const clean = (s: string) => s.replace(/\bD\d{1,2}\b\s*[-–·:]?\s*/g, "").replace(/\(\s*\)/g, "").trim() || s;

export function KalaiChart({ cells, style, lang, title, titleEn }: {
  cells: Record<string, string[]>; style: ChartStyle; lang: "ta" | "en"; title: string; titleEn?: string;
}) {
  title = clean(title);
  titleEn = titleEn ? clean(titleEn) : undefined;
  return (
    <div className="kalai-chart mx-auto w-full max-w-[460px] [&_canvas]:!h-auto [&_canvas]:!w-full [&_canvas]:max-w-full">
      <HandwrittenChartCanvas title={titleEn ?? title} titleTa={title} kattamData={toKattam(cells, lang)} chartStyle={style} lang={lang} width={460} height={460} />
    </div>
  );
}

export function ChartStyleSwitch({ value, onChange, lang }: { value: ChartStyle; onChange: (s: ChartStyle) => void; lang: "ta" | "en" }) {
  return (
    <div className="jat-chrome flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Chart style">
      {(Object.keys(CHART_STYLE_LABELS) as ChartStyle[]).map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} aria-pressed={value === s}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${value === s ? "brand-gradient-bg text-white shadow-soft" : "border border-line bg-surface text-foreground hover:border-brand-400"}`}>
          {lang === "ta" ? CHART_STYLE_LABELS[s].ta : CHART_STYLE_LABELS[s].en}
        </button>
      ))}
    </div>
  );
}
