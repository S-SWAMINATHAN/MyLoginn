"use client";

import React, { useRef, useState } from "react";
import { BabyNameRequest, PlaceSuggestion } from "@/lib/types";
import { suggestPlacesApi } from "@/lib/api";
import { Baby, Calendar, MapPin, User, Sparkles } from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";

interface BabyNameFormProps {
  onSubmit: (data: BabyNameRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

const PLACE_DEBOUNCE_MS = 300;

export const BabyNameForm: React.FC<BabyNameFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [formData, setFormData] = useState<BabyNameRequest>({
    name: "",
    gender: "male",
    date_of_birth: "",
    time_of_birth: "07:00:00",
    place: "",
    latitude: null,
    longitude: null,
    timezone: null,
  });

  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlaceChange = (val: string) => {
    setFormData((prev) => ({ ...prev, place: val, latitude: null, longitude: null, timezone: null }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setPlaceSuggestions([]);
      setPlaceLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const results = await suggestPlacesApi(val);
        setPlaceSuggestions(results);
      } catch {
        setPlaceSuggestions([]);
      } finally {
        setPlaceLoading(false);
      }
    }, PLACE_DEBOUNCE_MS);
  };

  const handleSelectPlace = (s: PlaceSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      place: s.display_name,
      latitude: s.lat,
      longitude: s.lon,
      timezone: s.timezone,
    }));
    setPlaceSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="palm-leaf-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d4af37]/30"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white flex items-center gap-2">
            <Baby className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "குழந்தையின் பிறப்பு விவரங்கள்" : "Baby's Birth Details"}
          </h2>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "நட்சத்திரம் & பாதம் அடிப்படையிலான துல்லியமான பெயர் எழுத்துக்களுக்கு பிறந்த நேரம், இடம் உள்ளிடவும்"
              : "Enter exact birth time and place for accurate Nakshatra-Pada based naming syllables"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Optional Name (for display only, not used in calculation) */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "குழந்தை / பெற்றோர் பெயர் (விருப்பம்)" : "Child / Parent Name (Optional)"}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]/70" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white placeholder-white/30 focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all text-sm"
              placeholder={lang === "ta" ? "எ.கா. ராமநாதன் & மரகதம்" : "e.g. Ramanathan & Maragatham"}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பாலினம் (Gender)" : "Gender"} *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "male" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "male"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70 hover:bg-white/5"
              }`}
            >
              {lang === "ta" ? "ஆண் குழந்தை" : "Baby Boy"}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "female" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "female"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70 hover:bg-white/5"
              }`}
            >
              {lang === "ta" ? "பெண் குழந்தை" : "Baby Girl"}
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த தேதி (Date of Birth)" : "Date of Birth"} *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]/70" />
            <input
              type="date"
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all text-sm"
            />
          </div>
        </div>

        {/* Time of Birth */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Time of Birth"} *
          </label>
          <TimeInput12h
            value={formData.time_of_birth}
            onChange={(time24h) => setFormData({ ...formData, time_of_birth: time24h })}
          />
        </div>

        {/* Place of Birth */}
        <div className="relative md:col-span-2">
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த இடம் (Place of Birth)" : "Place of Birth (City / Town)"} *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]/70" />
            <input
              type="text"
              required
              value={formData.place}
              onChange={(e) => handlePlaceChange(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white placeholder-white/30 focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all text-sm"
              placeholder="e.g. Coimbatore, Tamil Nadu"
            />
            {placeLoading && (
              <span className="absolute right-3.5 top-3.5 text-[10px] text-[#d4af37]/70">…</span>
            )}
          </div>

          {placeSuggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1a1114] border border-[#d4af37]/40 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
              {placeSuggestions.map((item, idx) => (
                <div
                  key={`${item.lat}-${item.lon}-${idx}`}
                  onClick={() => handleSelectPlace(item)}
                  className="px-4 py-2.5 text-xs text-white/90 hover:bg-[#6b1426]/50 cursor-pointer border-b border-white/5 last:border-0"
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="relative group overflow-hidden px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-[#6b1426] via-[#aa820a] to-[#6b1426] text-[#ffd700] font-bold text-base sm:text-lg shadow-xl shadow-[#ffd700]/10 border border-[#ffd700]/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
              <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing Nakshatra..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#ffd700] animate-pulse" />
              <span>{lang === "ta" ? "பெயர் பரிந்துரை பெறுக" : "Get Name Suggestions"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};