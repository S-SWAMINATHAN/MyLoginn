"use client";

import React, { useState } from "react";
import { GenerateChartRequest } from "@/lib/types";
import { Calendar, User, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";
import { LocationPicker } from "./LocationPicker";

interface BirthDetailsFormProps {
  onSubmit: (data: GenerateChartRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="hand-card p-6 sm:p-8 backdrop-blur-md shadow-lg transition-all"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#8b93b5]/30">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-script text-[#161b33] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2454c7]" />
            {lang === "ta" ? "பிறப்பு விவரங்கள் (Birth Details)" : "Birth Details Intake"}
          </h2>
          <p className="text-xs text-[#4a5578] font-tamil mt-1">
            {lang === "ta"
              ? "துல்லியமான ஜாதகக் கணிப்பிற்கு பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்"
              : "Enter accurate birth date, time and location for deterministic calculation"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "பெயர் (Name)" : "Full Name"} <span className="text-[#2454c7]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#2454c7]/80" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#fbfdff] border-2 border-[#8b93b5]/60 rounded-xl text-[#161b33] placeholder-[#8b93b5] focus:border-[#2454c7] focus:ring-1 focus:ring-[#2454c7]/30 transition-all text-sm outline-none"
              placeholder={lang === "ta" ? "உங்கள் பெயர்" : "e.g. Anand"}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "பாலினம் (Gender)" : "Gender"} <span className="text-[#2454c7]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "male" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "male"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              {lang === "ta" ? "ஆண் (Male)" : "Male"}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: "female" })}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                formData.gender === "female"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              {lang === "ta" ? "பெண் (Female)" : "Female"}
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த தேதி (Date of Birth)" : "Date of Birth"} <span className="text-[#2454c7]">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-[#2454c7]/80" />
            <input
              type="date"
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-[#fbfdff] border-2 border-[#8b93b5]/60 rounded-xl text-[#161b33] focus:border-[#2454c7] focus:ring-1 focus:ring-[#2454c7]/30 transition-all text-sm outline-none"
            />
          </div>
        </div>

        {/* Time of Birth */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Exact Time of Birth"} <span className="text-[#2454c7]">*</span>
          </label>
          <TimeInput12h
            value={formData.time_of_birth}
            onChange={(time24h) => setFormData({ ...formData, time_of_birth: time24h })}
          />
        </div>

        {/* Place of Birth */}
        <div className="relative md:col-span-2">
          <LocationPicker
            value={formData.place}
            onChange={(placeName, lat, lon, timezone) => {
              setFormData((prev) => ({
                ...prev,
                place: placeName,
                latitude: lat ?? null,
                longitude: lon ?? null,
                timezone: timezone ?? null,
              }));
            }}
            lang={lang}
            label={lang === "ta" ? "பிறந்த இடம் (Place of Birth)" : "Place of Birth (City / Town)"}
            required
            placeholder={lang === "ta" ? "எ.கா. கோயம்புத்தூர் / மதுரை" : "e.g. Coimbatore, Tamil Nadu"}
          />
        </div>
      </div>

      {/* Selectors: Panchangam System, Chart Style, Output Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-[#8b93b5]/30">
        {/* Panchangam System */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "பஞ்சாங்க கணிப்பு முறை" : "Panchangam Convention"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "thirukkanitham" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "thirukkanitham"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "திருக்கணிதம்" : "Thirukanitham"}</div>
              <span className="text-[9px] opacity-85 block">Drik-Siddha</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, panchangam_system: "vakhyam" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.panchangam_system === "vakhyam"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "வாக்கியம்" : "Vakhyam"}</div>
              <span className="text-[9px] opacity-85 block">Traditional</span>
            </button>
          </div>
        </div>

        {/* Regional Chart Style */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
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
                    ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                    : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
                }`}
              >
                {lang === "ta" ? st.labelTa : st.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Output Mode */}
        <div>
          <label className="block text-xs font-semibold text-[#4a5578] mb-1.5 font-tamil">
            {lang === "ta" ? "அறிக்கை வடிவம்" : "Report Format"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "full" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "full"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "முழு ஜாதகம்" : "Full Report"}</div>
              <span className="text-[9px] opacity-85 block">All 12 Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, output_mode: "single_page" })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                formData.output_mode === "single_page"
                  ? "bg-[#2454c7] border-[#17348f] text-white shadow-xs"
                  : "bg-[#eaf1fb]/70 border-[#8b93b5]/60 text-[#161b33] hover:bg-[#d7e3f7]"
              }`}
            >
              <div className="font-semibold">{lang === "ta" ? "சுருக்க ஜாதகம்" : "Quick Summary"}</div>
              <span className="text-[9px] opacity-85 block">Single Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Profile Details Accordion */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-[#17348f] hover:underline font-semibold font-tamil"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>
            {lang === "ta"
              ? "கூடுதல் சுய விவரங்கள் (பெற்றோர் பெயர், தொடர்பு எண் - விருப்பத்திற்குரியது)"
              : "Optional Profile & Contact Details"}
          </span>
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-[#eaf1fb]/60 border border-[#8b93b5]/40 rounded-2xl animate-fade-in">
            <div>
              <label className="block text-xs text-[#4a5578] mb-1 font-tamil">
                {lang === "ta" ? "பெற்றோர் பெயர்" : "Parent / Guardian Name"}
              </label>
              <input
                type="text"
                value={formData.parent_name || ""}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfdff] border border-[#8b93b5]/60 rounded-lg text-[#161b33] text-xs outline-none focus:border-[#2454c7]"
                placeholder={lang === "ta" ? "தந்தை / தாய் பெயர்" : "e.g. Ramanathan"}
              />
            </div>

            <div>
              <label className="block text-xs text-[#4a5578] mb-1 font-tamil">
                {lang === "ta" ? "கைபேசி எண் (Phone)" : "Phone Number"}
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfdff] border border-[#8b93b5]/60 rounded-lg text-[#161b33] text-xs outline-none focus:border-[#2454c7]"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs text-[#4a5578] mb-1 font-tamil">
                {lang === "ta" ? "மின்னஞ்சல் (Email)" : "Email Address"}
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfdff] border border-[#8b93b5]/60 rounded-lg text-[#161b33] text-xs outline-none focus:border-[#2454c7]"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-[#4a5578] mb-1 font-tamil">
                {lang === "ta" ? "குடும்ப விவரங்கள் / குலதெய்வம்" : "Family Background / Kula Deivam"}
              </label>
              <input
                type="text"
                value={formData.family_details || ""}
                onChange={(e) => setFormData({ ...formData, family_details: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfdff] border border-[#8b93b5]/60 rounded-lg text-[#161b33] text-xs outline-none focus:border-[#2454c7]"
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
          className="btn-hand-red text-base sm:text-lg px-8 sm:px-12 py-3.5 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3 font-semibold"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing Astronomical Chart..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-white" />
              <span>{lang === "ta" ? "ஜாதகத்தை உருவாக்கு (Generate Jathagam)" : "Generate Full Birth Chart"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};