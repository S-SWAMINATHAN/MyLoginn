"use client";

import React, { useState } from "react";
import { TamilNameInput } from "./TamilNameInput";
import { toTamil } from "@/lib/astrology/tamilTransliterate";
import { BabyNameRequest } from "@/lib/astrology/types";
import { Baby, Calendar, User, Sparkles } from "lucide-react";
import { TimeInput12h } from "./TimeInput12h";
import { LocationPicker } from "./LocationPicker";
import { DateInput } from "@/components/astrology/ui/DateInput";

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
  // Bug 2: the optional parent/child name is held as BOTH spellings so the
  // field can follow the site language. Neither is prefilled.
  const [nameEn, setNameEn] = useState("");
  const [nameTa, setNameTa] = useState("");
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
      // Ask for a large batch. The API returns min(limit, matching rows).
      limit: 150,
      // Send the spelling that matches the language being viewed.
      name: (lang === "ta" ? nameTa : nameEn) || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 shadow-sm text-foreground">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-soft">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <Baby className="w-6 h-6 text-brand-fg" />
            {lang === "ta" ? "குழந்தையின் பிறப்பு விவரங்கள்" : "Baby's Birth Details"}
          </h2>
          <p className="text-xs text-muted mt-1">
            {lang === "ta"
              ? "நட்சத்திரம் & பாதம் அடிப்படையிலான துல்லியமான பெயர் எழுத்துக்களுக்கு பிறந்த நேரம், இடம் உள்ளிடவும்"
              : "Enter exact birth time and place for accurate Nakshatra-Pada based naming syllables"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Optional display name */}
        <div>
          <label className="field-label">
            {lang === "ta" ? "குழந்தை / பெற்றோர் பெயர் (விருப்பம்)" : "Child / Parent Name (Optional)"}
          </label>
          {/* Bug 2: this field now follows the site language.
              Both spellings are kept as you type — the Latin one and the
              Tamil one — and the box shows whichever matches the language.
              Switching language therefore switches the parents' names too,
              instead of leaving the same text sitting in the other script.
              Typing in Tamil directly is kept exactly as typed. */}
          <TamilNameInput
            value={lang === "ta" ? nameTa : nameEn}
            lang={lang}
            onChange={(v, latin) => {
              if (lang === "ta") {
                setNameTa(v);
                // `latin` arrives when a Tamil suggestion was accepted.
                if (latin) setNameEn(latin);
              } else {
                setNameEn(v);
                // Keep a Tamil spelling ready for the Tamil view.
                setNameTa(v ? toTamil(v) || v : "");
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-foreground placeholder:text-muted outline-none text-sm focus:border-brand-500 transition-all"
            placeholder={lang === "ta" ? "எ.கா. ராமநாதன் & மரகதம்" : "e.g. Ramanathan & Maragatham"}
          />
        </div>

        {/* Gender — nothing preselected */}
        <div>
          <label className="field-label">
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
                    ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                    : "bg-surface-2 border-line text-foreground hover:border-brand-500"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-1">
            {lang === "ta"
              ? "தேர்வு செய்யவில்லை எனில் இரு பாலினப் பெயர்களும் காட்டப்படும்."
              : "Leave unselected to see names for both."}
          </p>
        </div>

        {/* Religion selector removed: the Nakshatra syllable is a Hindu
            naming convention, so for most syllables there is no established
            Christian or Muslim name that begins with that sound. The filter
            therefore returned empty lists far more often than useful ones.
            The column still exists in the database, so the filter can come
            back the day the data supports it. */}

        {/* Date of birth */}
        <div>
          <label className="field-label">
            {lang === "ta" ? "பிறந்த தேதி (Date of Birth)" : "Date of Birth"}{" "}
            <span className="text-brand-fg">*</span>
          </label>
          <div className="flex items-center gap-2 w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl focus-within:border-brand-500 transition-all">
            <Calendar className="w-4 h-4 shrink-0 text-muted" />
            <DateInput
              
              required
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="flex-1 min-w-0 bg-transparent text-foreground outline-none text-sm"
            />
          </div>
        </div>

        {/* Time of birth */}
        <div>
          <label className="field-label">
            {lang === "ta" ? "பிறந்த நேரம் (Time of Birth)" : "Time of Birth"}{" "}
            <span className="text-brand-fg">*</span>
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
            <p className="text-[10px] mt-1 font-mono text-muted">
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
          className="btn-secondary px-8 sm:px-12 py-3 rounded-2xl brand-gradient-bg text-white font-bold text-sm sm:text-base shadow-md hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center gap-2"
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
          <p className="text-[11px] text-muted">
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