"use client";

import React, { useRef, useState } from "react";
import { GenerateChartRequest, PlaceSuggestion } from "@/lib/types";
import { suggestPlacesApi } from "@/lib/api";
import { Calendar, MapPin, User, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";

interface BirthDetailsFormProps {
  onSubmit: (data: GenerateChartRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

// NOTE: the old hardcoded COMMON_CITIES list + client-side substring filter
// has been removed. Suggestions now come live from GET /api/geocode/suggest,
// which reads the much larger KNOWN_LOCATIONS table already in
// backend/app/services/geocode.py (~70 entries vs. the old 16).

const PLACE_DEBOUNCE_MS = 300;

export const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
  onSubmit,
  isLoading,
  lang,
}) => {
  const [formData, setFormData] = useState<GenerateChartRequest>({
    name: "மனோசக்தி",
    gender: "male",
    date_of_birth: "1996-08-15",
    time_of_birth: "07:00:00",
    place: "Coimbatore, Tamil Nadu, India",
    latitude: null,
    longitude: null,
    timezone: null,
    panchangam_system: "thirukkanitham",
    chart_style: "tamil",
    output_mode: "full",
    parent_name: "",
    phone: "",
    email: "",
    personal_details: "",
    family_details: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlaceChange = (val: string) => {
    // Typing manually invalidates any previously-selected exact coordinates,
    // so chart generation falls back to text-based resolution (unchanged
    // backend behavior) unless the user picks a fresh suggestion below.
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
        // Fail soft: autocomplete is a UX aid, not required to submit the form.
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
      className="palm-leaf-dark rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d4af37]/20">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#ffd700]" />
            {lang === "ta" ? "பிறப்பு விவரங்கள்" : "Birth Details Intake"}
          </h2>
          <p className="text-xs text-[#e0b87f] font-tamil mt-1">
            {lang === "ta"
              ? "துல்லியமான ஜாதகக் கணிப்பிற்கு நேரத்தையும் இடத்தையும் உள்ளிடவும்"
              : "Enter accurate birth date, time and location for deterministic calculation"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பெயர் (Name)" : "Full Name"} *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#d4af37]/70" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#140b0e] border border-[#d4af37]/30 rounded-xl text-white placeholder-white/30 focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all text-sm"
              placeholder={lang === "ta" ? "உங்கள் பெயர்" : "e.g. Anand"}
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
              {lang === "ta" ? "ஆண் (Male)" : "Male"}
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
              {lang === "ta" ? "பெண் (Female)" : "Female"}
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

        {/* Time of Birth — now a 12-hour AM/PM picker; formData.time_of_birth
            stays "HH:MM:SS" 24-hour under the hood, so the API payload is
            unchanged. */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Exact Time of Birth"} *
          </label>
          <TimeInput12h
            value={formData.time_of_birth}
            onChange={(time24h) => setFormData({ ...formData, time_of_birth: time24h })}
          />
        </div>

        {/* Place of Birth — now backed by live GET /api/geocode/suggest */}
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

          {/* Autocomplete Dropdown */}
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

      {/* Selectors: Panchangam System, Chart Style, Output Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-[#d4af37]/20">
        {/* Panchangam System */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "பஞ்சாங்க கணிப்பு முறை" : "Panchangam Convention"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "thirukkanitham" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "thirukkanitham"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70"
              }`}
            >
              <div>{lang === "ta" ? "திருக்கணிதம்" : "Thirukanitham"}</div>
              <span className="text-[9px] opacity-70 block">Drik-Siddha</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "vakhyam" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "vakhyam"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70"
              }`}
            >
              <div>{lang === "ta" ? "வாக்கியம்" : "Vakhyam"}</div>
              <span className="text-[9px] opacity-70 block">Traditional</span>
            </button>
          </div>
        </div>

        {/* Regional Chart Style */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "கட்ட அமைப்பு பாணி" : "Regional Layout"}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "tamil", labelTa: "தமிழ்", labelEn: "Tamil" },
              { id: "kerala", labelTa: "கேரளா", labelEn: "Kerala" },
              { id: "north_indian", labelTa: "வட இந்தியா", labelEn: "North" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFormData({ ...formData, chart_style: st.id })}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.chart_style === st.id
                    ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                    : "bg-[#140b0e] border-[#d4af37]/30 text-white/70"
                }`}
              >
                {lang === "ta" ? st.labelTa : st.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Output Mode */}
        <div>
          <label className="block text-xs font-semibold text-[#e0b87f] mb-1.5 font-tamil">
            {lang === "ta" ? "அறிக்கை வடிவம்" : "Report Format"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "full" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "full"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70"
              }`}
            >
              <div>{lang === "ta" ? "முழு ஜாதகம்" : "Full Report"}</div>
              <span className="text-[9px] opacity-70 block">All 12 Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "single_page" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "single_page"
                  ? "bg-[#6b1426] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#140b0e] border-[#d4af37]/30 text-white/70"
              }`}
            >
              <div>{lang === "ta" ? "சுருக்க ஜாதகம்" : "Quick Summary"}</div>
              <span className="text-[9px] opacity-70 block">Single Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Profile Details Accordion */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-[#ffd700] hover:underline font-semibold font-tamil"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>
            {lang === "ta"
              ? "கூடுதல் சுய விவரங்கள் (பெற்றோர் பெயர், தொடர்பு எண் - விருப்பத்திற்குரியது)"
              : "Optional Profile & Contact Details"}
          </span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-[#140b0e]/70 border border-[#d4af37]/20 rounded-2xl animate-fade-in">
            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "பெற்றோர் பெயர்" : "Parent / Guardian Name"}
              </label>
              <input
                type="text"
                value={formData.parent_name || ""}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1115] border border-[#d4af37]/20 rounded-lg text-white text-xs"
                placeholder={lang === "ta" ? "தந்தை / தாய் பெயர்" : "e.g. Ramanathan"}
              />
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "கைபேசி எண் (Phone)" : "Phone Number"}
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1115] border border-[#d4af37]/20 rounded-lg text-white text-xs"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "மின்னஞ்சல் (Email)" : "Email Address"}
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1115] border border-[#d4af37]/20 rounded-lg text-white text-xs"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-[#e0b87f] mb-1 font-tamil">
                {lang === "ta" ? "குடும்ப விவரங்கள் / குலதெய்வம்" : "Family Background / Kula Deivam"}
              </label>
              <input
                type="text"
                value={formData.family_details || ""}
                onChange={(e) => setFormData({ ...formData, family_details: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1115] border border-[#d4af37]/20 rounded-lg text-white text-xs"
                placeholder={lang === "ta" ? "குலதெய்வம், ஊர்" : "e.g. Kula Deivam temple"}
              />
            </div>
          </div>
        )}
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
              <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing Astronomical Chart..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#ffd700] animate-pulse" />
              <span>{lang === "ta" ? "ஜாதகத்தை உருவாக்கு (Generate Jathagam)" : "Generate Full Birth Chart"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};