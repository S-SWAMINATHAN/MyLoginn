"use client";

import React, { useState } from "react";
import { BabyNameRequest } from "@/lib/types";
import { Baby, Calendar, User, Sparkles } from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";
import { LocationPicker } from "./LocationPicker";

interface BabyNameFormProps {
  onSubmit: (data: BabyNameRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

/**
 * WHAT CHANGED
 * ------------
 * 1. The place field is now the same <LocationPicker> the Jathagam and
 *    Muhurtha forms use — quick Tamil Nadu / India / Global lists, live
 *    keyword geocoding, and custom lat/lon — instead of this form's own
 *    one-off suggestion dropdown, which had no quick lists, no custom
 *    coordinates, and re-implemented the debounce/fetch logic a third time.
 *    Because it hands back latitude/longitude/timezone, the backend no
 *    longer has to re-geocode a bare string.
 *
 * 2. No icon is absolutely positioned any more. The old layout put
 *    `<MapPin className="absolute left-3.5 top-3.5">` inside a wrapper that
 *    also held the <label>, so the pin was measured from the top of the whole
 *    field group and landed on the label text. Icons are now ordinary flex
 *    children that cannot escape their input.
 *
 * 3. Nothing is pre-filled. Name, gender, date and place all start empty on a
 *    fresh load; gender is genuinely unselected rather than silently defaulting
 *    to "Baby Boy", which was quietly filtering the suggestions. The only
 *    seeded control is the time picker, which needs a value to render (07:00 AM).
 */
export const BabyNameForm: React.FC<BabyNameFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [formData, setFormData] = useState<BabyNameRequest>({
    name: "",
    gender: "",
    date_of_birth: "",
    time_of_birth: "07:00:00",
    place: "",
    latitude: null,
    longitude: null,
    timezone: null,
  });

  const canSubmit = !!formData.date_of_birth && !!formData.place.trim() && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      ...formData,
      // Send gender only if the parent actually picked one.
      gender: formData.gender || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)] flex items-center gap-2">
            <Baby className="w-6 h-6 text-[var(--red)]" />
            {lang === "ta" ? "குழந்தையின் பிறப்பு விவரங்கள்" : "Baby's Birth Details"}
          </h2>
          <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
            {lang === "ta"
              ? "நட்சத்திரம் & பாதம் அடிப்படையிலான துல்லியமான பெயர் எழுத்துக்களுக்கு பிறந்த நேரம், இடம் உள்ளிடவும்"
              : "Enter exact birth time and place for accurate Nakshatra-Pada based naming syllables"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Optional display name */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "குழந்தை / பெற்றோர் பெயர் (விருப்பம்)" : "Child / Parent Name (Optional)"}
          </label>
          <div className="flex items-center gap-2 w-full px-3 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl focus-within:border-[var(--red)] transition-all">
            <User className="w-4 h-4 shrink-0 text-[var(--ink-soft)]" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 min-w-0 bg-transparent text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none text-sm"
              placeholder={lang === "ta" ? "எ.கா. ராமநாதன் & மரகதம்" : "e.g. Ramanathan & Maragatham"}
            />
          </div>
        </div>

        {/* Gender — nothing preselected */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "பாலினம் (Gender)" : "Gender"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["male", lang === "ta" ? "ஆண் குழந்தை" : "Baby Boy"],
                ["female", lang === "ta" ? "பெண் குழந்தை" : "Baby Girl"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, gender: formData.gender === key ? "" : key })
                }
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  formData.gender === key
                    ? "bg-[var(--red)] border-[var(--red)] text-white shadow-sm"
                    : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink)] hover:border-[var(--red)]"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--ink-soft)] mt-1 font-tamil">
            {lang === "ta"
              ? "தேர்வு செய்யவில்லை எனில் இரு பாலினப் பெயர்களும் காட்டப்படும்."
              : "Leave unselected to see names for both."}
          </p>
        </div>

        {/* Date of birth */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த தேதி (Date of Birth)" : "Date of Birth"}{" "}
            <span className="text-[var(--red)]">*</span>
          </label>
          <div className="flex items-center gap-2 w-full px-3 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl focus-within:border-[var(--red)] transition-all">
            <Calendar className="w-4 h-4 shrink-0 text-[var(--ink-soft)]" />
            <input
              type="date"
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="flex-1 min-w-0 bg-transparent text-[var(--ink)] outline-none text-sm"
            />
          </div>
        </div>

        {/* Time of birth */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Time of Birth"}{" "}
            <span className="text-[var(--red)]">*</span>
          </label>
          <TimeInput12h
            value={formData.time_of_birth}
            onChange={(time24h) => setFormData({ ...formData, time_of_birth: time24h })}
          />
        </div>

        {/* Place of birth — same picker as every other feature */}
        <div className="md:col-span-2">
          <LocationPicker
            lang={lang}
            label={lang === "ta" ? "பிறந்த இடம் (Place of Birth)" : "Place of Birth"}
            required
            value={formData.place}
            placeholder={
              lang === "ta" ? "ஊரைத் தேடி தேர்ந்தெடுக்கவும்" : "Search and pick a city / town"
            }
            onChange={(place, lat, lon, tz) =>
              setFormData({
                ...formData,
                place,
                latitude: lat ?? null,
                longitude: lon ?? null,
                timezone: tz ?? null,
              })
            }
          />
          {formData.latitude != null && formData.longitude != null && (
            <p className="text-[10px] mt-1 font-mono text-[var(--ink-soft)]">
              {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}° ·{" "}
              {formData.timezone || "Asia/Kolkata"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-hand px-8 sm:px-12 py-3 rounded-2xl bg-[var(--red)] text-white font-bold text-sm sm:text-base shadow-md hover:bg-[var(--red-deep)] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{lang === "ta" ? "கணிக்கப்படுகிறது..." : "Computing Nakshatra..."}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-white" />
              <span>{lang === "ta" ? "பெயர் பரிந்துரை பெறுக" : "Get Name Suggestions"}</span>
            </>
          )}
        </button>
        {!canSubmit && !isLoading && (
          <p className="text-[11px] text-[var(--ink-soft)] font-tamil">
            {lang === "ta"
              ? "பிறந்த தேதி மற்றும் பிறந்த இடத்தை நிரப்பவும்."
              : "Enter the date of birth and the place of birth to continue."}
          </p>
        )}
      </div>
    </form>
  );
};

export default BabyNameForm;