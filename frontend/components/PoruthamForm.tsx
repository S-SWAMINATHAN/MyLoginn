"use client";

import React, { useState } from "react";
import { Heart, Sparkles, UserCheck } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#e65c00]" />
            {lang === "ta" ? "திருமணப் பொருத்தம் கணிப்பு" : "Marriage Compatibility Matching"}
          </h2>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "வட இந்திய அஷ்டகூட 36-புள்ளிகள் மற்றும் தென்னிந்திய 10 பொருத்தங்கள் (ரஜ்ஜு தோஷ ஆய்வு)"
              : "Dual engine: North Indian Ashta Koota (36-pt) and South Indian Tamil 10-Porutham"}
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-[#180f12] border border-[#d4af37]/30 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("nakshatra")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "nakshatra"
                ? "bg-[#6b1426] text-[#ffd700]"
                : "text-[#d4af37]/70 hover:text-white"
            }`}
          >
            {lang === "ta" ? "நட்சத்திர ரீதியாக" : "By Nakshatra"}
          </button>
          <button
            type="button"
            onClick={() => setMode("birthDetails")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === "birthDetails"
                ? "bg-[#6b1426] text-[#ffd700]"
                : "text-[#d4af37]/70 hover:text-white"
            }`}
          >
            {lang === "ta" ? "பிறந்த தேதி/நேரம்" : "By Birth Details"}
          </button>
        </div>
      </div>

      {mode === "nakshatra" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy's Star */}
          <div className="bg-[#1f1418] border border-[#d4af37]/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ffd700] font-tamil border-b border-white/5 pb-2">
              <UserCheck className="w-4 h-4 text-[#ffd700]" />
              {lang === "ta" ? "மணமகன் (Boy's Star & Pada)" : "Boy's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={boyNak}
                onChange={(e) => setBoyNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white font-tamil text-sm"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "பாதம் (Pada - 1 to 4)" : "Pada (1 to 4)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBoyPada(p)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      boyPada === p
                        ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                        : "bg-[#140b0e] border-[#d4af37]/20 text-white/70"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Girl's Star */}
          <div className="bg-[#1f1418] border border-[#d4af37]/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ffd700] font-tamil border-b border-white/5 pb-2">
              <UserCheck className="w-4 h-4 text-pink-400" />
              {lang === "ta" ? "மணமகள் (Girl's Star & Pada)" : "Girl's Star & Pada"}
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "நட்சத்திரம் (Nakshatra)" : "Nakshatra"}
              </label>
              <select
                value={girlNak}
                onChange={(e) => setGirlNak(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white font-tamil text-sm"
              >
                {NAKSHATRAS.map((n, idx) => (
                  <option key={idx} value={n.en}>
                    {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "பாதம் (Pada - 1 to 4)" : "Pada (1 to 4)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setGirlPada(p)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      girlPada === p
                        ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                        : "bg-[#140b0e] border-[#d4af37]/20 text-white/70"
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
          <div className="bg-[#1f1418] border border-[#d4af37]/30 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-tamil mb-2">
              {lang === "ta" ? "மணமகன் பிறந்த விவரங்கள்" : "Boy's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Date of Birth</label>
              <input
                type="date"
                value={boyDob}
                onChange={(e) => setBoyDob(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Time of Birth</label>
              <input
                type="text"
                value={boyTob}
                onChange={(e) => setBoyTob(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Place of Birth</label>
              <input
                type="text"
                value={boyPlace}
                onChange={(e) => setBoyPlace(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          {/* Girl */}
          <div className="bg-[#1f1418] border border-[#d4af37]/30 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#ffd700] font-tamil mb-2">
              {lang === "ta" ? "மணமகள் பிறந்த விவரங்கள்" : "Girl's Birth Details"}
            </h4>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Date of Birth</label>
              <input
                type="date"
                value={girlDob}
                onChange={(e) => setGirlDob(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Time of Birth</label>
              <input
                type="text"
                value={girlTob}
                onChange={(e) => setGirlTob(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1">Place of Birth</label>
              <input
                type="text"
                value={girlPlace}
                onChange={(e) => setGirlPlace(e.target.value)}
                className="w-full px-3 py-2 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white text-xs"
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
          className="px-8 sm:px-12 py-3.5 rounded-2xl bg-gradient-to-r from-[#6b1426] via-[#aa820a] to-[#6b1426] text-[#ffd700] font-bold text-sm sm:text-base shadow-xl border border-[#ffd700]/50 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart className="w-5 h-5 text-[#ffd700]" />
          )}
          <span>{lang === "ta" ? "பொருத்தம் பார்க்க (Check Compatibility)" : "Calculate Matching Score"}</span>
        </button>
      </div>
    </form>
  );
};
