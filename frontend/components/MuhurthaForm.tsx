"use client";

import React, { useState } from "react";
import { MuhurthaRequest } from "@/lib/types";
import { CalendarSearch, Heart, Compass } from "lucide-react";

interface MuhurthaFormProps {
  onSubmit: (data: MuhurthaRequest) => void;
  isLoading: boolean;
  lang: "ta" | "en";
}

export const MuhurthaForm: React.FC<MuhurthaFormProps> = ({ onSubmit, isLoading, lang }) => {
  const [eventType, setEventType] = useState<"marriage" | "travel">("marriage");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [place, setPlace] = useState("Coimbatore, Tamil Nadu, India");

  const [personADob, setPersonADob] = useState("");
  const [personATob, setPersonATob] = useState("07:00:00");
  const [personAPlace, setPersonAPlace] = useState("");

  const [personBDob, setPersonBDob] = useState("");
  const [personBTob, setPersonBTob] = useState("07:00:00");
  const [personBPlace, setPersonBPlace] = useState("");

  const [travelDirection, setTravelDirection] = useState<"N" | "S" | "E" | "W">("N");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MuhurthaRequest = {
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      place,
      person_a_dob: personADob || undefined,
      person_a_tob: personADob ? personATob : undefined,
      person_a_place: personADob ? personAPlace : undefined,
    };
    if (eventType === "marriage") {
      payload.person_b_dob = personBDob || undefined;
      payload.person_b_tob = personBDob ? personBTob : undefined;
      payload.person_b_place = personBDob ? personBPlace : undefined;
    }
    if (eventType === "travel") {
      payload.travel_direction = travelDirection;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="palm-leaf-dark p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(10,37,64,0.08)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: "var(--ink)" }}>
            <CalendarSearch className="w-6 h-6" style={{ color: "var(--red)" }} />
            {lang === "ta" ? "முகூர்த்த தேடல்" : "Muhurtha Search"}
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            {lang === "ta"
              ? "நிகழ்வு வகையையும் தேதி வரம்பையும் தேர்ந்தெடுத்து சுப நாட்களைக் கண்டறியவும்"
              : "Pick an event type and date range to find auspicious days"}
          </p>
        </div>

        <div className="flex items-center bg-white border rounded-xl p-1 text-xs" style={{ borderColor: "rgba(10,37,64,0.15)" }}>
          <button
            type="button"
            onClick={() => setEventType("marriage")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              eventType === "marriage" ? "text-white" : ""
            }`}
            style={eventType === "marriage" ? { background: "var(--red-deep)" } : { color: "var(--ink-soft)" }}
          >
            <Heart className="w-3.5 h-3.5" />
            {lang === "ta" ? "திருமணம்" : "Marriage"}
          </button>
          <button
            type="button"
            onClick={() => setEventType("travel")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              eventType === "travel" ? "text-white" : ""
            }`}
            style={eventType === "travel" ? { background: "var(--red-deep)" } : { color: "var(--ink-soft)" }}
          >
            <Compass className="w-3.5 h-3.5" />
            {lang === "ta" ? "பயணம்" : "Travel"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--ink-soft)" }}>
            {lang === "ta" ? "தொடக்க தேதி" : "Start Date"} *
          </label>
          <input
            type="date" required value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border rounded-xl text-sm"
            style={{ borderColor: "rgba(10,37,64,0.15)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--ink-soft)" }}>
            {lang === "ta" ? "முடிவு தேதி" : "End Date"} *
          </label>
          <input
            type="date" required value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border rounded-xl text-sm"
            style={{ borderColor: "rgba(10,37,64,0.15)", color: "var(--ink)" }}
          />
          <p className="text-[10px] mt-1" style={{ color: "var(--ink-faint)" }}>
            {lang === "ta" ? "அதிகபட்சம் 60 நாட்கள்" : "Max 60 days per search"}
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--ink-soft)" }}>
            {lang === "ta" ? "நிகழ்வு இடம்" : "Event Location"} *
          </label>
          <input
            type="text" required value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. Coimbatore, Tamil Nadu"
            className="w-full px-3 py-2.5 bg-white border rounded-xl text-sm"
            style={{ borderColor: "rgba(10,37,64,0.15)", color: "var(--ink)" }}
          />
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 mb-4" style={{ borderColor: "rgba(10,37,64,0.10)" }}>
        <h4 className="text-sm font-bold mb-3" style={{ color: "var(--red-deep)" }}>
          {eventType === "marriage"
            ? (lang === "ta" ? "நபர் A (மணமகன்/மணமகள்) — விருப்பம்" : "Person A (Partner 1) — Optional")
            : (lang === "ta" ? "பயணி விவரங்கள் — விருப்பம்" : "Traveler's Birth Details — Optional")}
        </h4>
        <p className="text-[11px] mb-3" style={{ color: "var(--ink-faint)" }}>
          {lang === "ta"
            ? "இதை நிரப்பினால் தாரா பலம் & சந்திர பலம் தனிப்பட்ட முறையில் சரிபார்க்கப்படும்."
            : "Filling this in adds personalized Tara Bala & Chandra Bala checks to the results."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Date of Birth</label>
            <input type="date" value={personADob} onChange={(e) => setPersonADob(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Time of Birth</label>
            <input type="text" value={personATob} onChange={(e) => setPersonATob(e.target.value)}
              placeholder="07:00:00"
              className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Place of Birth</label>
            <input type="text" value={personAPlace} onChange={(e) => setPersonAPlace(e.target.value)}
              placeholder="e.g. Coimbatore, Tamil Nadu"
              className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
          </div>
        </div>
      </div>

      {eventType === "marriage" && (
        <div className="bg-white border rounded-2xl p-5 mb-4" style={{ borderColor: "rgba(10,37,64,0.10)" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--red-deep)" }}>
            {lang === "ta" ? "நபர் B (துணை) — விருப்பம்" : "Person B (Partner 2) — Optional"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Date of Birth</label>
              <input type="date" value={personBDob} onChange={(e) => setPersonBDob(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Time of Birth</label>
              <input type="text" value={personBTob} onChange={(e) => setPersonBTob(e.target.value)}
                placeholder="07:00:00"
                className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--ink-soft)" }}>Place of Birth</label>
              <input type="text" value={personBPlace} onChange={(e) => setPersonBPlace(e.target.value)}
                placeholder="e.g. Chennai, Tamil Nadu"
                className="w-full px-3 py-2 bg-[var(--paper)] border rounded-lg text-xs" style={{ borderColor: "rgba(10,37,64,0.12)" }} />
            </div>
          </div>
        </div>
      )}

      {eventType === "travel" && (
        <div className="bg-white border rounded-2xl p-5 mb-4" style={{ borderColor: "rgba(10,37,64,0.10)" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--red-deep)" }}>
            {lang === "ta" ? "பயண திசை (திசைசூல் சோதனை)" : "Direction of Travel (Dishashool check)"}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(["N", "S", "E", "W"] as const).map((d) => (
              <button
                key={d} type="button" onClick={() => setTravelDirection(d)}
                className={`py-2 rounded-xl text-xs font-bold border ${travelDirection === d ? "text-white" : ""}`}
                style={travelDirection === d
                  ? { background: "var(--red-deep)", borderColor: "var(--red-deep)" }
                  : { borderColor: "rgba(10,37,64,0.15)", color: "var(--ink-soft)" }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button type="submit" disabled={isLoading} className="btn-hand-red">
          {isLoading
            ? (lang === "ta" ? "தேடுகிறது..." : "Searching...")
            : (lang === "ta" ? "சுப நாட்களைத் தேடு" : "Find Auspicious Days")}
        </button>
      </div>
    </form>
  );
};
