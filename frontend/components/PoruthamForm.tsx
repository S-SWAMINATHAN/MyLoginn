"use client";

import React, { useState } from "react";
import { Heart, Sparkles, UserCheck } from "lucide-react";
import { LocationPicker } from "./LocationPicker";

interface PoruthamFormProps {
  onSubmit: (params: any) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

const NAKSHATRAS = [
  { en: "Ashwini", ta: "அசுவினி" }, { en: "Bharani", ta: "பரணி" }, { en: "Krittika", ta: "கார்த்திகை" },
  { en: "Rohini", ta: "ரோகிணி" }, { en: "Mrigashirsha", ta: "மிருகசீரிஷம்" }, { en: "Ardra", ta: "திருவாதிரை" },
  { en: "Punarvasu", ta: "புனர்பூசம்" }, { en: "Pushya", ta: "பூசம்" }, { en: "Ashlesha", ta: "ஆயில்யம்" },
  { en: "Magha", ta: "மகம்" }, { en: "Purva Phalguni", ta: "பூரம்" }, { en: "Uttara Phalguni", ta: "உத்திரம்" },
  { en: "Hasta", ta: "அஸ்தம்" }, { en: "Chitra", ta: "சித்திரை" }, { en: "Swati", ta: "சுவாதி" },
  { en: "Vishakha", ta: "விசாகம்" }, { en: "Anuradha", ta: "அனுஷம்" }, { en: "Jyeshtha", ta: "கேட்டை" },
  { en: "Moola", ta: "மூலம்" }, { en: "Purva Ashadha", ta: "பூராடம்" }, { en: "Uttara Ashadha", ta: "உத்திராடம்" },
  { en: "Shravana", ta: "திருவோணம்" }, { en: "Dhanishta", ta: "அவிட்டம்" }, { en: "Shatabhisha", ta: "சதயம்" },
  { en: "Purva Bhadrapada", ta: "பூரட்டாதி" }, { en: "Uttara Bhadrapada", ta: "உத்திரட்டாதி" }, { en: "Revati", ta: "ரேவதி" }
];

export const PoruthamForm: React.FC<PoruthamFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [mode, setMode] = useState<"nakshatra" | "birthDetails">("nakshatra");

  // State for direct star matching
  const [boyNak, setBoyNak] = useState("Pushya");
  const [boyPada, setBoyPada] = useState(2);
  const [girlNak, setGirlNak] = useState("Ashwini");
  const [girlPada, setGirlPada] = useState(1);

  // State for birth details matching
  const [boyDob, setBoyDob] = useState("1996-08-15");
  const [boyTob, setBoyTob] = useState("07:00:00");
  const [boyPlace, setBoyPlace] = useState("Coimbatore, Tamil Nadu");

  const [girlDob, setGirlDob] = useState("1998-11-20");
  const [girlTob, setGirlTob] = useState("10:30:00");
  const [girlPlace, setGirlPlace] = useState("Chennai, Tamil Nadu");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "nakshatra") {
      onSubmit({
        boy_nakshatra: boyNak,
        boy_pada: boyPada,
        girl_nakshatra: girlNak,
        girl_pada: girlPada
      });
    } else {
      onSubmit({
        boy_dob: boyDob,
        boy_tob: boyTob,
        boy_place: boyPlace,
        girl_dob: girlDob,
        girl_tob: girlTob,
        girl_place: girlPlace
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
            <Heart className="w-6 h-6 text-[var(--red)]" />
            {lang === "ta" ? "திருமணப் பொருத்தம் கணிப்பு" : "Marriage Compatibility Matching"}
          </h2>
          <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
            {lang === "ta"
              ? "வட இந்திய அஷ்டகூட 36-புள்ளிகள் மற்றும் தென்னிந்திய 10 பொருத்தங்கள் (ரஜ்ஜு தோஷ ஆய்வு)"
              : "Dual engine: North Indian Ashta Koota (36-pt) and South Indian Tamil 10-Porutham"}
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("nakshatra")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "nakshatra"
                ? "bg-[var(--red)] text-white"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "ta" ? "நட்சத்திர ரீதியாக" : "By Nakshatra"}
          </button>
          <button
            type="button"
            onClick={() => setMode("birthDetails")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "birthDetails"
                ? "bg-[var(--red)] text-white"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "ta" ? "பிறந்த தேதி/நேரம்" : "By Birth Details"}
          </button>
        </div>
      </div>

      {mode === "nakshatra" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy's Star */}
          <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--red-deep)] font-tamil border-b border-[rgba(43,33,23,0.1)] pb-2">
              <UserCheck className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta" ? "மணமகன் (Boy's Star & Pada)" : "Boy's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={boyNak}
                onChange={(e) => setBoyNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] font-tamil text-sm focus:outline-none focus:border-[var(--red)]"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
                {lang === "ta" ? "பாதம் (Pada - 1 to 4)" : "Pada (1 to 4)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBoyPada(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      boyPada === p
                        ? "bg-[var(--red)] border-[var(--red)] text-white shadow-sm"
                        : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Girl's Star */}
          <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--red-deep)] font-tamil border-b border-[rgba(43,33,23,0.1)] pb-2">
              <UserCheck className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta" ? "மணமகள் (Girl's Star & Pada)" : "Girl's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={girlNak}
                onChange={(e) => setGirlNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] font-tamil text-sm focus:outline-none focus:border-[var(--red)]"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
                {lang === "ta" ? "பாதம் (Pada - 1 to 4)" : "Pada (1 to 4)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setGirlPada(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      girlPada === p
                        ? "bg-[var(--red)] border-[var(--red)] text-white shadow-sm"
                        : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Birth Details Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy */}
          <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[var(--red-deep)] font-tamil mb-2">
              {lang === "ta" ? "மணமகன் பிறந்த விவரங்கள்" : "Boy's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Date of Birth</label>
              <input
                type="date"
                value={boyDob}
                onChange={(e) => setBoyDob(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs focus:outline-none focus:border-[var(--red)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Time of Birth</label>
              <input
                type="text"
                value={boyTob}
                onChange={(e) => setBoyTob(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs focus:outline-none focus:border-[var(--red)]"
              />
            </div>
            <div>
              <LocationPicker
                value={boyPlace}
                onChange={(placeName) => setBoyPlace(placeName)}
                lang={lang}
                label={lang === "ta" ? "பிறந்த இடம் (Boy's Place)" : "Place of Birth"}
                required
                placeholder={lang === "ta" ? "எ.கா. கோயம்புத்தூர்" : "e.g. Coimbatore"}
              />
            </div>
          </div>

          {/* Girl */}
          <div className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[var(--red-deep)] font-tamil mb-2">
              {lang === "ta" ? "மணமகள் பிறந்த விவரங்கள்" : "Girl's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Date of Birth</label>
              <input
                type="date"
                value={girlDob}
                onChange={(e) => setGirlDob(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs focus:outline-none focus:border-[var(--red)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--ink-soft)] mb-1">Time of Birth</label>
              <input
                type="text"
                value={girlTob}
                onChange={(e) => setGirlTob(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs focus:outline-none focus:border-[var(--red)]"
              />
            </div>
            <div>
              <LocationPicker
                value={girlPlace}
                onChange={(placeName) => setGirlPlace(placeName)}
                lang={lang}
                label={lang === "ta" ? "பிறந்த இடம் (Girl's Place)" : "Place of Birth"}
                required
                placeholder={lang === "ta" ? "எ.கா. சென்னை" : "e.g. Chennai"}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-hand px-8 sm:px-12 py-3 rounded-2xl bg-[var(--red)] text-white font-bold text-sm sm:text-base shadow-md hover:bg-[var(--red-deep)] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart className="w-5 h-5 text-white" />
          )}
          <span>{lang === "ta" ? "பொருத்தம் பார்க்க (Check Compatibility)" : "Calculate Matching Score"}</span>
        </button>
      </div>
    </form>
  );
};
