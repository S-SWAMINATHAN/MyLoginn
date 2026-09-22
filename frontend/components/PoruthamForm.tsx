"use client";

import React, { useState } from "react";
import { Heart, Sparkles, UserCheck } from "lucide-react";
import { LocationPicker } from "./LocationPicker";
import { TimeInput12h } from "./TimeInput12h";

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

  // State for direct star matching (dropdown-based, so a default selection
  // here is fine — there's no meaningful "empty" nakshatra/pada to show).
  const [boyNak, setBoyNak] = useState("Pushya");
  const [boyPada, setBoyPada] = useState(2);
  const [girlNak, setGirlNak] = useState("Ashwini");
  const [girlPada, setGirlPada] = useState(1);

  // State for birth-details matching. These are the ONLY inputs for this
  // mode, so — unlike a personalization add-on — they must not be
  // pre-seeded with sample data; a fresh visit should show empty fields.
  // Time of Birth keeps a placeholder value only because <TimeInput12h>
  // needs something to render; it's meaningless until a DOB is entered too.
  const [boyDob, setBoyDob] = useState("");
  const [boyTob, setBoyTob] = useState("07:00:00");
  const [boyPlace, setBoyPlace] = useState("");

  const [girlDob, setGirlDob] = useState("");
  const [girlTob, setGirlTob] = useState("07:00:00");
  const [girlPlace, setGirlPlace] = useState("");

  const canSubmitBirthDetails =
    !!boyDob && !!boyPlace.trim() && !!girlDob && !!girlPlace.trim();

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
      if (!canSubmitBirthDetails) return;
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
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 shadow-sm text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-fg" />
            {lang === "ta" ? "திருமணப் பொருத்தம் கணிப்பு" : "Marriage Compatibility Matching"}
          </h2>
          <p className="text-xs text-muted mt-1">
            {lang === "ta"
              ? "வட இந்திய அஷ்டகூட 36-புள்ளிகள் மற்றும் தென்னிந்திய 10 பொருத்தங்கள் (ரஜ்ஜு தோஷ ஆய்வு)"
              : "Dual engine: North Indian Ashta Koota (36-pt) and South Indian Tamil 10-Porutham"}
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-surface-2 border border-line rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("nakshatra")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "nakshatra"
                ? "brand-gradient-bg text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {lang === "ta" ? "நட்சத்திர ரீதியாக" : "By Nakshatra"}
          </button>
          <button
            type="button"
            onClick={() => setMode("birthDetails")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "birthDetails"
                ? "brand-gradient-bg text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {lang === "ta" ? "பிறந்த தேதி/நேரம்" : "By Birth Details"}
          </button>
        </div>
      </div>

      {mode === "nakshatra" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy's Star */}
          <div className="bg-brand-500/5 border border-border-soft rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-fg-strong border-b border-border-soft pb-2">
              <UserCheck className="w-4 h-4 text-brand-fg" />
              {lang === "ta" ? "மணமகன் (Boy's Star & Pada)" : "Boy's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={boyNak}
                onChange={(e) => setBoyNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-foreground text-sm focus:outline-none focus:border-brand-500"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
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
                        ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                        : "bg-surface-2 border-line text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Girl's Star */}
          <div className="bg-brand-500/5 border border-border-soft rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-fg-strong border-b border-border-soft pb-2">
              <UserCheck className="w-4 h-4 text-brand-fg" />
              {lang === "ta" ? "மணமகள் (Girl's Star & Pada)" : "Girl's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={girlNak}
                onChange={(e) => setGirlNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-foreground text-sm focus:outline-none focus:border-brand-500"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
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
                        ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                        : "bg-surface-2 border-line text-foreground"
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
          <div className="bg-brand-500/5 border border-border-soft rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-brand-fg-strong mb-2">
              {lang === "ta" ? "மணமகன் பிறந்த விவரங்கள்" : "Boy's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-muted mb-1">Date of Birth</label>
              <input
                type="date"
                value={boyDob}
                onChange={(e) => setBoyDob(e.target.value)}
                className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-foreground text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Time of Birth</label>
              <TimeInput12h value={boyTob} onChange={setBoyTob} />
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
          <div className="bg-brand-500/5 border border-border-soft rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-brand-fg-strong mb-2">
              {lang === "ta" ? "மணமகள் பிறந்த விவரங்கள்" : "Girl's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-muted mb-1">Date of Birth</label>
              <input
                type="date"
                value={girlDob}
                onChange={(e) => setGirlDob(e.target.value)}
                className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-foreground text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Time of Birth</label>
              <TimeInput12h value={girlTob} onChange={setGirlTob} />
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
          disabled={isLoading || (mode === "birthDetails" && !canSubmitBirthDetails)}
          className="btn-secondary px-8 sm:px-12 py-3 rounded-2xl brand-gradient-bg text-white font-bold text-sm sm:text-base shadow-md hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart className="w-5 h-5 text-white" />
          )}
          <span>{lang === "ta" ? "பொருத்தம் பார்க்க (Check Compatibility)" : "Calculate Matching Score"}</span>
        </button>
      </div>
      {mode === "birthDetails" && !canSubmitBirthDetails && !isLoading && (
        <p className="text-[11px] text-center mt-2 text-muted">
          {lang === "ta"
            ? "இரு நபர்களின் பிறந்த தேதி மற்றும் இடத்தை நிரப்பவும்."
            : "Fill in both people's date of birth and place to continue."}
        </p>
      )}
    </form>
  );
};