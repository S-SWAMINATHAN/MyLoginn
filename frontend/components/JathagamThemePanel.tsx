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
 * It replaces the two per-card customisers that used to sit inside
 * ThirukanithamCompleteCard and VakhyamCompleteCard and only restyled
 * themselves. Those cards now follow this panel instead.
 *
 * Deliberately placed ABOVE the download buttons in the page flow: pick the
 * ink and the typeface first, confirm it on screen, then download.
 */
export const JathagamThemePanel: React.FC<Props> = ({ lang }) => {
  const { palette, font, fontScale, setPaletteId, setFontId, setFontScale, reset } =
    useJathagamTheme();
  const [open, setOpen] = useState(true);

  return (
    <div className="no-print rounded-3xl border-2 border-[#8b5a2b]/35 bg-[#fffdfa] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#f7efdc] text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Palette className="w-4 h-4 shrink-0 text-[#b03726]" />
          <span className="text-sm font-bold text-[#6b1426] truncate">
            {lang === "ta"
              ? "ஜாதக மை வண்ணம் & தமிழ் எழுத்துரு (முழு ஜாதகத்திற்கும் பொருந்தும்)"
              : "Jathagam Ink Colour & Tamil Typeface (applies to the whole horoscope)"}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span
            className="w-4 h-4 rounded-full border border-black/15"
            style={{ background: palette.accent }}
            aria-hidden
          />
          <span
            className="w-4 h-4 rounded-full border border-black/15"
            style={{ background: palette.ink }}
            aria-hidden
          />
          {open ? (
            <ChevronUp className="w-4 h-4 text-[#6f6049]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6f6049]" />
          )}
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-5">
          {/* Palettes */}
          <div>
            <div className="text-xs font-bold text-[#6b1426] mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#b03726]" />
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
                    className={`rounded-xl border p-2 text-left transition-all ${
                      active
                        ? "border-[#b03726] ring-2 ring-[#b03726]/25 bg-white"
                        : "border-[#8b5a2b]/30 bg-white hover:border-[#b03726]/60"
                    }`}
                  >
                    <span className="flex items-center gap-1 mb-1.5">
                      {[p.accent, p.ink, p.gold, p.paper].map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ background: c }}
                        />
                      ))}
                      {active && <Check className="w-3.5 h-3.5 text-[#b03726] ml-auto" />}
                    </span>
                    <span className="block text-[11px] font-bold text-[#2b2117] leading-tight">
                      {lang === "ta" ? p.labelTa : p.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fonts */}
          <div>
            <div className="text-xs font-bold text-[#6b1426] mb-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#b03726]" />
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
                    className={`allow-own-font rounded-xl border p-2 text-left transition-all ${
                      active
                        ? "border-[#b03726] ring-2 ring-[#b03726]/25 bg-white"
                        : "border-[#8b5a2b]/30 bg-white hover:border-[#b03726]/60"
                    }`}
                    style={{ fontFamily: f.stack }}
                    title={f.noteTa}
                  >
                    <span className="block text-[15px] text-[#2b2117] leading-snug">
                      ஜாதகம் 123
                    </span>
                    <span className="block text-[10px] text-[#6f6049] mt-0.5 leading-tight">
                      {lang === "ta" ? f.labelTa : f.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size + reset */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-[#8b5a2b]/20">
            <label className="flex items-center gap-2 text-xs font-bold text-[#6b1426]">
              {lang === "ta" ? "எழுத்து அளவு" : "Text size"}
              <input
                type="range"
                min={0.9}
                max={1.2}
                step={0.02}
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="w-40 accent-[#b03726]"
              />
              <span className="font-mono text-[11px] text-[#6f6049]">
                {Math.round(fontScale * 100)}%
              </span>
            </label>

            <button
              type="button"
              onClick={reset}
              className="sm:ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8b5a2b]/35 bg-white text-xs font-bold text-[#6b1426] hover:bg-[#fffaf0]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#b03726]" />
              {lang === "ta" ? "இயல்பு நிலைக்கு" : "Reset to default"}
            </button>
          </div>

          <p className="text-[11px] text-[#6f6049] leading-relaxed">
            {lang === "ta"
              ? "தேர்வு செய்த வண்ணமும் எழுத்துருவும் திரையில் தெரியும் முழு ஜாதகத்திற்கும் — 50-பக்க ஓலைச்சுவடி, ராசி/நவாம்ச கட்டங்கள், சுருக்க ஜாதகம் உட்பட — உடனே பொருந்தும். அதே தோற்றமே PDF-ல் பதிவிறக்கப்படும், எனவே பதிவிறக்கும் முன் இங்கே மாற்றிக் கொள்ளவும்."
              : "The colour and typeface you pick apply immediately to the entire horoscope on screen — the 50-page manuscript, the Rasi/Navamsa charts and the single-page sheet included. The PDF captures exactly what you see, so set this before downloading."}
          </p>
        </div>
      )}
    </div>
  );
};

export default JathagamThemePanel;