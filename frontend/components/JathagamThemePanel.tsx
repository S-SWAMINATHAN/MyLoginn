"use client";

import React, { useState } from "react";
import { Palette, Type, RotateCcw, ChevronDown, ChevronUp, Check } from "lucide-react";
import {
  useJathagamTheme,
  JATHAGAM_PALETTES,
  TAMIL_FONTS,
} from "@/lib/jathagamTheme";

interface Props {
  lang: "ta" | "en";
}

/**
 * The one panel that restyles the ENTIRE Jathagam — every section on the page,
 * the 50-page manuscript, the single-page sheet, the Rasi/Navamsa charts, and
 * therefore both PDFs, because the exporter rasterises this same themed DOM.
 *
 * Bug 2: restyled with the website's own card / button classes so it matches
 * every other page. Behaviour is unchanged — the same palette and typeface
 * handlers drive the same theme context.
 * Bug 4: the text-size slider was removed.
 * Bug 3: pages are always white now, so palettes are previewed by their ink,
 * heading and rule colours only (a white "paper" dot would be invisible).
 */
export const JathagamThemePanel: React.FC<Props> = ({ lang }) => {
  const { palette, font, setPaletteId, setFontId, reset } = useJathagamTheme();
  const [open, setOpen] = useState(true);

  return (
    <div className="no-print card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-surface-2 text-left border-b border-border-soft"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 shrink-0 rounded-xl brand-gradient-bg flex items-center justify-center shadow-soft">
            <Palette className="w-4 h-4 text-white" />
          </span>
          <span className="text-sm font-bold text-foreground truncate">
            {lang === "ta"
              ? "ஜாதக மை வண்ணம் & தமிழ் எழுத்துரு (முழு ஜாதகத்திற்கும் பொருந்தும்)"
              : "Jathagam Ink Colour & Tamil Typeface (applies to the whole horoscope)"}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: palette.accent }} aria-hidden />
          <span className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: palette.ink }} aria-hidden />
          {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-5">
          {/* Palettes */}
          <div>
            <div className="field-label flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-brand-fg" />
              {lang === "ta" ? "மை வண்ணத் தொகுப்பு" : "Ink palette"}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {JATHAGAM_PALETTES.map((p) => {
                const active = p.id === palette.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaletteId(p.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      active
                        ? "border-brand-500 ring-2 ring-brand-500/25 bg-brand-500/5"
                        : "border-line bg-surface hover:border-brand-400"
                    }`}
                  >
                    <span className="flex items-center gap-1 mb-1.5">
                      {[p.accent, p.ink, p.gold].map((c, i) => (
                        <span key={i} className="w-4 h-4 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                      ))}
                      {active && <Check className="w-3.5 h-3.5 text-brand-fg ml-auto" />}
                    </span>
                    <span className="block text-[11px] font-semibold text-foreground leading-tight">
                      {lang === "ta" ? p.labelTa : p.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fonts */}
          <div>
            <div className="field-label flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-brand-fg" />
              {lang === "ta" ? "தமிழ் எழுத்துரு பாணி" : "Tamil typeface"}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {TAMIL_FONTS.map((f) => {
                const active = f.id === font.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontId(f.id)}
                    className={`allow-own-font rounded-xl border p-2.5 text-left transition-all ${
                      active
                        ? "border-brand-500 ring-2 ring-brand-500/25 bg-brand-500/5"
                        : "border-line bg-surface hover:border-brand-400"
                    }`}
                    style={{ fontFamily: f.stack }}
                    title={f.noteTa}
                  >
                    <span className="block text-[15px] text-foreground leading-snug">ஜாதகம் 123</span>
                    <span className="block text-[10px] text-muted mt-0.5 leading-tight">
                      {lang === "ta" ? f.labelTa : f.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset colour + typeface */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-border-soft">
            <p className="text-[11px] text-muted leading-relaxed flex-1">
              {lang === "ta"
                ? "தேர்வு செய்த வண்ணமும் எழுத்துருவும் திரையில் தெரியும் முழு ஜாதகத்திற்கும் — 50-பக்க ஜாதகம், ராசி/நவாம்ச கட்டங்கள், சுருக்க ஜாதகம் உட்பட — உடனே பொருந்தும். அதே தோற்றமே PDF-லும் அச்சிலும் வரும்."
                : "The colour and typeface you pick apply immediately to the whole horoscope — the 50-page manuscript, the Rasi/Navamsa charts and the single-page sheet. The PDF and print match what you see."}
            </p>
            <button type="button" onClick={reset} className="btn-secondary shrink-0 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              {lang === "ta" ? "இயல்பு நிலைக்கு" : "Reset to default"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JathagamThemePanel;
