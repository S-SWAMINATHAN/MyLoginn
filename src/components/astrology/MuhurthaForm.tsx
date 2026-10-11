"use client";

import React, { useMemo, useState } from "react";
import { MuhurthaRequest, MuhurthaEventType } from "@/lib/astrology/types";
import { CalendarSearch, Heart, Compass, Sparkles, AlertTriangle, ChevronDown } from "lucide-react";
import { LocationPicker } from "./LocationPicker";
import { TimeInput12h } from "./TimeInput12h";
import { DateInput } from "@/components/astrology/ui/DateInput";

interface MuhurthaFormProps {
  onSubmit: (data: MuhurthaRequest) => void;
  /**
   * Bug 4: the event type (General / Marriage / Travel) lives in THIS
   * component while the results live in the page, so switching tabs left the
   * previous search's day-by-day results on screen under the new tab — all
   * three tabs appearing to show the same details. The page clears its
   * result on this.
   */
  onEventTypeChange?: (eventType: MuhurthaEventType) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

/**
 * Muhurtha search form.
 *
 * TWO THINGS FIXED HERE
 * ---------------------
 * 1. LOCATION + TIME PARITY WITH THE JATHAGAM FORM. This form used plain
 *    <input type="text"> boxes for the event place and both birth places and
 *    a free-text "07:00:00" time, so there was no keyword geocoding, no quick
 *    lists, no custom lat/lon, and — worse — no latitude/longitude/timezone was
 *    ever sent, leaving the backend to re-geocode a raw string. It now uses the
 *    same <LocationPicker> and <TimeInput12h> as the Jathagam intake form and
 *    sends the resolved coordinates for every place.
 *
 * 2. NO PRE-FILLED VALUES. Every field starts empty on a fresh load — no
 *    default city, no default date range. The earlier version seeded
 *    "Coimbatore, Tamil Nadu, India" plus today→+30 days, which made a fresh
 *    visit look like a half-finished form and, worse, would silently search
 *    the wrong city if the person only changed the dates. The one exception is
 *    the time-of-birth control, which needs a value to render at all; it shows
 *    07:00 AM and is ignored entirely unless a date of birth is also entered.
 */

interface PlaceState {
  place: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

const EMPTY_PLACE: PlaceState = { place: "" };

export const MuhurthaForm: React.FC<MuhurthaFormProps> = ({
  onSubmit,
  isLoading,
  lang,
  onEventTypeChange,
}) => {
  const [eventType, setEventTypeState] = useState<MuhurthaEventType>("general");

  /**
   * Switching tab starts that tab's search from scratch.
   *
   * The three tabs share only the date range and the event location. The
   * optional blocks below them are per-tab — the SAME state was being shown
   * under three different headings ("தனிநபர் விவரங்கள்" / "நபர் A" /
   * "பயணி விவரங்கள்"), so details typed for one event type reappeared,
   * pre-filled, under the next one. They are reset here, together with the
   * previous result (cleared by the page through onEventTypeChange).
   */
  const setEventType = (next: MuhurthaEventType) => {
    if (next === eventType) return;
    setEventTypeState(next);

    setPersonADob("");
    setPersonATob("07:00:00");
    setPersonAPlace(EMPTY_PLACE);
    setPersonBDob("");
    setPersonBTob("07:00:00");
    setPersonBPlace(EMPTY_PLACE);
    setTravelDirection(null);

    onEventTypeChange?.(next);
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [eventPlace, setEventPlace] = useState<PlaceState>(EMPTY_PLACE);

  const [personADob, setPersonADob] = useState("");
  const [personATob, setPersonATob] = useState("07:00:00");
  const [personAPlace, setPersonAPlace] = useState<PlaceState>(EMPTY_PLACE);

  const [personBDob, setPersonBDob] = useState("");
  const [personBTob, setPersonBTob] = useState("07:00:00");
  const [personBPlace, setPersonBPlace] = useState<PlaceState>(EMPTY_PLACE);

  const [travelDirection, setTravelDirection] = useState<"N" | "S" | "E" | "W" | null>(null);

  const validationError = useMemo(() => {
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e)) {
        if (e < s) {
          return lang === "ta"
            ? "முடிவு தேதி தொடக்க தேதிக்குப் பிறகு இருக்க வேண்டும்."
            : "End date must be on or after the start date.";
        }
        const days = Math.round((e - s) / 86400000) + 1;
        if (days > 60) {
          return lang === "ta"
            ? `தேர்ந்தெடுத்த வரம்பு ${days} நாட்கள் — அதிகபட்சம் 60 நாட்கள்.`
            : `Selected range is ${days} days — the maximum is 60 days per search.`;
        }
      }
    }
    return null;
  }, [startDate, endDate, lang]);

  /**
   * The travel direction is REQUIRED on the Travel tab.
   *
   * Dishashool is the only rule the Travel tab adds over the General
   * screening, and it needs a direction. With no direction chosen, the
   * backend applied no event-specific rule at all, so a Travel search
   * returned exactly the same days as a General one — which is why the tabs
   * looked like they were showing each other's output. Asking for the
   * direction makes the Travel tab actually do something different.
   */
  const needsTravelDirection = eventType === "travel" && !travelDirection;

  const canSubmit =
    !!startDate &&
    !!endDate &&
    !!eventPlace.place.trim() &&
    !needsTravelDirection &&
    !validationError &&
    !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload: MuhurthaRequest = {
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      place: eventPlace.place,
      latitude: eventPlace.latitude ?? null,
      longitude: eventPlace.longitude ?? null,
      timezone: eventPlace.timezone ?? null,
    };

    if (personADob) {
      payload.person_a_dob = personADob;
      payload.person_a_tob = personATob;
      payload.person_a_place = personAPlace.place || eventPlace.place;
      payload.person_a_latitude = personAPlace.latitude ?? null;
      payload.person_a_longitude = personAPlace.longitude ?? null;
      payload.person_a_timezone = personAPlace.timezone ?? null;
    }

    if (eventType === "marriage" && personBDob) {
      payload.person_b_dob = personBDob;
      payload.person_b_tob = personBTob;
      payload.person_b_place = personBPlace.place || eventPlace.place;
      payload.person_b_latitude = personBPlace.latitude ?? null;
      payload.person_b_longitude = personBPlace.longitude ?? null;
      payload.person_b_timezone = personBPlace.timezone ?? null;
    }

    if (eventType === "travel" && travelDirection) {
      payload.travel_direction = travelDirection;
    }

    onSubmit(payload);
  };

  /**
   * Event type as a dropdown rather than three side-by-side buttons.
   *
   * The icon has to sit inside the control while a native <select> renders the
   * options, so the select is laid over the box transparently: the icon and
   * the chosen label are drawn underneath and stay aligned, and the options
   * list is still the browser's own (correct keyboard and touch behaviour,
   * and it cannot overflow the card on a narrow screen).
   */
  const EVENT_OPTIONS: Array<{
    key: MuhurthaEventType;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "general", label: lang === "ta" ? "பொது" : "General", Icon: Sparkles },
    { key: "marriage", label: lang === "ta" ? "திருமணம்" : "Marriage", Icon: Heart },
    { key: "travel", label: lang === "ta" ? "பயணம்" : "Travel", Icon: Compass },
  ];
  const selectedEvent = EVENT_OPTIONS.find((o) => o.key === eventType) || EVENT_OPTIONS[0];
  const SelectedIcon = selectedEvent.Icon;

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-border-soft">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--foreground)" }}
          >
            <CalendarSearch className="w-6 h-6" style={{ color: "var(--brand-fg)" }} />
            {lang === "ta" ? "முகூர்த்த தேடல்" : "Muhurtha Search"}
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {lang === "ta"
              ? "நிகழ்வு வகையையும் தேதி வரம்பையும் தேர்ந்தெடுத்து சுப நாட்களைக் கண்டறியவும் — 'பொது' தமிழ் காலண்டர் பாணி நாள் நல்லது/கெட்டது சரிபார்ப்பு"
              : "Pick a date range to find auspicious days — 'General' gives a plain Tamil-calendar-style good/bad day check, or pick Marriage/Travel for event-specific rules too"}
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <label htmlFor="muhurtha-event-type" className="field-label">
            {lang === "ta" ? "நிகழ்வு வகை" : "Event type"}
          </label>
          <div className="relative w-full sm:w-56">
            {/* Visible face: icon, label, chevron — all vertically centred. */}
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm">
              <SelectedIcon className="h-4 w-4 shrink-0 text-brand-fg" />
              <span className="flex-1 truncate font-semibold text-foreground">
                {selectedEvent.label}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
            </div>
            {/* The real control, transparent on top of that face. */}
            <select
              id="muhurtha-event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as MuhurthaEventType)}
              aria-label={lang === "ta" ? "நிகழ்வு வகை" : "Event type"}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {EVENT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="field-label">
            {lang === "ta" ? "தொடக்க தேதி" : "Start Date"} <span className="text-brand-fg">*</span>
          </label>
          <DateInput
            
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label className="field-label">
            {lang === "ta" ? "முடிவு தேதி" : "End Date"} <span className="text-brand-fg">*</span>
          </label>
          <DateInput
            
            required
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="field"
          />
          <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
            {lang === "ta" ? "அதிகபட்சம் 60 நாட்கள்" : "Max 60 days per search"}
          </p>
        </div>
        <div>
          <LocationPicker
            lang={lang}
            label={lang === "ta" ? "நிகழ்வு இடம் (Event Location)" : "Event Location"}
            required
            value={eventPlace.place}
            placeholder={lang === "ta" ? "ஊரைத் தேடி தேர்ந்தெடுக்கவும்" : "Search and pick a place"}
            onChange={(place, lat, lon, tz) =>
              setEventPlace({ place, latitude: lat, longitude: lon, timezone: tz })
            }
          />
          {eventPlace.latitude != null && eventPlace.longitude != null && (
            <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--muted)" }}>
              {eventPlace.latitude.toFixed(4)}°, {eventPlace.longitude.toFixed(4)}° ·{" "}
              {eventPlace.timezone || "Asia/Kolkata"}
            </p>
          )}
        </div>
      </div>

      {validationError && (
        <div
          className="mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: "rgba(220,38,38,0.10)", border: "1px solid var(--danger)", color: "var(--danger)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Person A */}
      <div className="well p-5 mb-4">
        <h4 className="text-sm font-bold mb-3" style={{ color: "var(--brand-fg-strong)" }}>
          {eventType === "marriage"
            ? lang === "ta"
              ? "நபர் A (மணமகன்/மணமகள்) — விருப்பம்"
              : "Person A (Partner 1) — Optional"
            : eventType === "travel"
            ? lang === "ta"
              ? "பயணி விவரங்கள் — விருப்பம்"
              : "Traveler's Birth Details — Optional"
            : lang === "ta"
            ? "தனிநபர் விவரங்கள் — விருப்பம்"
            : "Personalize (Your Birth Details) — Optional"}
        </h4>
        <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>
          {lang === "ta"
            ? "இதை நிரப்பினால் தாரா பலம் & சந்திர பலம் தனிப்பட்ட முறையில் சரிபார்க்கப்படும்."
            : "Filling this in adds personalized Tara Bala & Chandra Bala checks to the results."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="field-label">
              {lang === "ta" ? "பிறந்த தேதி" : "Date of Birth"}
            </label>
            <DateInput
              
              value={personADob}
              onChange={(e) => setPersonADob(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="field-label">
              {lang === "ta" ? "பிறந்த நேரம்" : "Time of Birth"}
            </label>
            <TimeInput12h value={personATob} onChange={setPersonATob} />
          </div>
          <div>
            <LocationPicker
              lang={lang}
              label={lang === "ta" ? "பிறந்த இடம்" : "Place of Birth"}
              required={false}
              value={personAPlace.place}
              placeholder={lang === "ta" ? "ஊரைத் தேடுக" : "Search a place"}
              onChange={(place, lat, lon, tz) =>
                setPersonAPlace({ place, latitude: lat, longitude: lon, timezone: tz })
              }
            />
          </div>
        </div>
      </div>

      {/* Person B — marriage only */}
      {eventType === "marriage" && (
        <div className="well p-5 mb-4">
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--brand-fg-strong)" }}>
            {lang === "ta" ? "நபர் B (துணை) — விருப்பம்" : "Person B (Partner 2) — Optional"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">
                {lang === "ta" ? "பிறந்த தேதி" : "Date of Birth"}
              </label>
              <DateInput
                
                value={personBDob}
                onChange={(e) => setPersonBDob(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">
                {lang === "ta" ? "பிறந்த நேரம்" : "Time of Birth"}
              </label>
              <TimeInput12h value={personBTob} onChange={setPersonBTob} />
            </div>
            <div>
              <LocationPicker
                lang={lang}
                label={lang === "ta" ? "பிறந்த இடம்" : "Place of Birth"}
                required={false}
                value={personBPlace.place}
                placeholder={lang === "ta" ? "ஊரைத் தேடுக" : "Search a place"}
                onChange={(place, lat, lon, tz) =>
                  setPersonBPlace({ place, latitude: lat, longitude: lon, timezone: tz })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Travel direction — travel only, nothing preselected */}
      {eventType === "travel" && (
        <div className="well p-5 mb-4">
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--brand-fg-strong)" }}>
            {lang === "ta" ? "பயண திசை (திசைசூல் சோதனை)" : "Direction of Travel (Dishashool check)"}{" "}
            <span style={{ color: "var(--danger)" }}>*</span>
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(["N", "S", "E", "W"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setTravelDirection(travelDirection === d ? null : d)}
                className={`py-2 rounded-xl text-xs font-bold border ${
                  travelDirection === d ? "text-white" : ""
                }`}
                style={
                  travelDirection === d
                    ? { background: "var(--brand-700)", borderColor: "var(--brand-700)" }
                    : { borderColor: "var(--line)", color: "var(--muted)" }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button type="submit" disabled={!canSubmit} className="btn-primary disabled:opacity-50">
          {isLoading
            ? lang === "ta"
              ? "தேடுகிறது..."
              : "Searching..."
            : lang === "ta"
            ? "சுப நாட்களைத் தேடு"
            : "Find Auspicious Days"}
        </button>
      </div>
      {!canSubmit && !isLoading && !validationError && (
        <p className="text-[11px] text-center mt-2" style={{ color: "var(--muted)" }}>
          {needsTravelDirection && !!startDate && !!endDate && !!eventPlace.place.trim()
            ? lang === "ta"
              ? "பயணத் திசையைத் தேர்ந்தெடுக்கவும் — திசைசூல் சோதனைக்கு இது தேவை."
              : "Choose the direction of travel — the Dishashool check needs it."
            : lang === "ta"
            ? "தொடக்க தேதி, முடிவு தேதி மற்றும் நிகழ்வு இடத்தை நிரப்பவும்."
            : "Fill in the start date, end date and event location to search."}
        </p>
      )}
    </form>
  );
};

export default MuhurthaForm;