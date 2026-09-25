"use client";

import React from "react";

interface RasiPickerGridProps {
  selected: number | null;
  onSelect: (rasiNumber: number) => void;
  lang: "ta" | "en";
  label?: string;
}

// Bug 5: each Rasi now shows its zodiac symbol instead of a Tamil letter.
// (The old `r.ta.charAt(0)` also split Tamil grapheme clusters — ரிஷபம்
// rendered as a bare ர with its vowel sign chopped off.)
// Sidereal Rasis use the same twelve signs in the same order as the
// tropical zodiac: Mesha = Aries ♈ ... Meena = Pisces ♓.
// U+FE0E (text presentation selector) makes the symbol render as a text
// glyph in the button's colour, not as a colourful emoji tile on Windows.
const TEXT = "\uFE0E";
const RASI_LIST = [
  { num: 1, sa: "Mesha", ta: "மேஷம்", symbol: "♈" + TEXT, en: "Aries" },
  { num: 2, sa: "Vrishabha", ta: "ரிஷபம்", symbol: "♉" + TEXT, en: "Taurus" },
  { num: 3, sa: "Mithuna", ta: "மிதுனம்", symbol: "♊" + TEXT, en: "Gemini" },
  { num: 4, sa: "Karkataka", ta: "கடகம்", symbol: "♋" + TEXT, en: "Cancer" },
  { num: 5, sa: "Simha", ta: "சிம்மம்", symbol: "♌" + TEXT, en: "Leo" },
  { num: 6, sa: "Kanya", ta: "கன்னி", symbol: "♍" + TEXT, en: "Virgo" },
  { num: 7, sa: "Tula", ta: "துலாம்", symbol: "♎" + TEXT, en: "Libra" },
  { num: 8, sa: "Vrischika", ta: "விருச்சிகம்", symbol: "♏" + TEXT, en: "Scorpio" },
  { num: 9, sa: "Dhanus", ta: "தனுசு", symbol: "♐" + TEXT, en: "Sagittarius" },
  { num: 10, sa: "Makara", ta: "மகரம்", symbol: "♑" + TEXT, en: "Capricorn" },
  { num: 11, sa: "Kumbha", ta: "கும்பம்", symbol: "♒" + TEXT, en: "Aquarius" },
  { num: 12, sa: "Meena", ta: "மீனம்", symbol: "♓" + TEXT, en: "Pisces" },
];

export const RasiPickerGrid: React.FC<RasiPickerGridProps> = ({
  selected,
  onSelect,
  lang,
  label,
}) => {
  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-muted mb-2">
          {label}
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {RASI_LIST.map((r) => {
          const isSelected = selected === r.num;
          return (
            <button
              key={r.num}
              type="button"
              onClick={() => onSelect(r.num)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-brand-600 border-brand-500 text-white shadow-md scale-[1.03]"
                  : "bg-surface-2 border-border-soft text-foreground hover:border-brand-500 hover:scale-[1.02]"
              }`}
            >
              <span
                className="text-2xl leading-none"
                style={{ fontFamily: "'Segoe UI Symbol', 'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Apple Symbols', sans-serif" }}
                aria-hidden="true"
                title={`${r.sa} (${r.en})`}
              >
                {r.symbol}
              </span>
              <span className="text-[11px] font-semibold text-center leading-tight">
                {lang === "ta" ? r.ta : r.en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};