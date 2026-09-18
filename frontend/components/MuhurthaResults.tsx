"use client";

import React, { useState } from "react";
import { MuhurthaSearchResponse, MuhurthaDayResult } from "@/lib/types";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, MapPin } from "lucide-react";

interface MuhurthaResultsProps {
  result: MuhurthaSearchResponse;
  lang: "ta" | "en";
}

function ratingStyle(rating: string) {
  if (rating === "Excellent") return { bg: "#e6f7ed", border: "#34a853", text: "#1e7e42", Icon: CheckCircle2 };
  if (rating === "Good") return { bg: "#eef6f8", border: "#0891b2", text: "#0a5568", Icon: CheckCircle2 };
  return { bg: "#fdecec", border: "#d93025", text: "#a31515", Icon: XCircle };
}

/**
 * "General Auspicious Days" overview — a plain Tamil-calendar-style
 * good/bad day strip for the whole searched period, shown FIRST, before
 * the event-specific (Marriage/Travel/General) day-by-day cards below.
 *
 * Derived entirely from fields every day result already carries
 * (`is_universally_clean` / `universal_flags`) regardless of event type —
 * no extra API call needed.
 */
const GeneralOverviewStrip: React.FC<{ days: MuhurthaDayResult[]; lang: "ta" | "en" }> = ({ days, lang }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cleanCount = days.filter((d) => d.is_universally_clean).length;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 mb-6"
      style={{ borderColor: "rgba(10,37,64,0.12)", background: "rgba(255,255,255,0.6)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4">
        <h4 className="text-sm sm:text-base font-bold" style={{ color: "var(--red-deep)" }}>
          {lang === "ta"
            ? "இந்த காலத்தின் பொது சுப நாட்கள் (தமிழ் காலண்டர்)"
            : "General Auspicious Days for This Period (Tamil Calendar)"}
        </h4>
        <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
          {lang === "ta"
            ? `${days.length}-ல் ${cleanCount} நாட்கள் பொதுவாக சுபம்`
            : `${cleanCount} of ${days.length} days are generally auspicious`}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {days.map((day) => {
          const clean = day.is_universally_clean;
          const isOpen = expanded === day.date;
          const dayNum = day.date.slice(-2);
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setExpanded(isOpen ? null : day.date)}
              className="rounded-xl border px-2 py-2 text-left transition-all hover:-translate-y-0.5"
              style={{
                background: clean ? "#e6f7ed" : "#fdecec",
                borderColor: clean ? "#34a85355" : "#d9302555",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: clean ? "#1e7e42" : "#a31515" }}>
                  {dayNum}
                </span>
                {clean ? (
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#34a853" }} />
                ) : (
                  <XCircle className="w-3.5 h-3.5" style={{ color: "#d93025" }} />
                )}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                {lang === "ta" ? day.vaaram_ta : day.vaaram}
              </div>
              <div className="text-[10px]" style={{ color: "var(--ink-faint)" }}>
                {lang === "ta" ? day.tithi_ta : day.tithi}
              </div>
              {!clean && (
                <div className="flex items-center gap-0.5 mt-1" style={{ color: "#a31515" }}>
                  <span className="text-[9px] font-semibold">{lang === "ta" ? "காரணம்" : "Why"}</span>
                  {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              )}
              {!clean && isOpen && (
                <ul className="mt-1.5 space-y-1 border-t pt-1.5" style={{ borderColor: "#d9302533" }}>
                  {(lang === "ta" ? day.universal_flags_ta : day.universal_flags).map((f, i) => (
                    <li key={i} className="text-[9.5px] leading-snug" style={{ color: "#a31515" }}>
                      • {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10.5px] mt-3" style={{ color: "var(--ink-faint)" }}>
        {lang === "ta"
          ? "அடிப்படை: ரிக்தை திதி, அமாவாசை, பத்திரை கரணம், மரண யோகம் — நிகழ்வு தேர்வுக்கு முன் பொதுவான பஞ்சாங்க பரிசோதனை."
          : "Based on Rikta Tithi, Amavasya, Bhadra Karana, and Marana Yoga — a plain Panchangam screening, independent of the event type below."}
      </p>
    </div>
  );
};

export const MuhurthaResults: React.FC<MuhurthaResultsProps> = ({ result, lang }) => {
  return (
    <div className="palm-leaf-dark p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-[rgba(10,37,64,0.08)]">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
            {lang === "ta" ? "தேடல் முடிவுகள்" : "Search Results"}{" "}
            <span className="text-sm font-normal" style={{ color: "var(--ink-soft)" }}>
              ({result.start_date} → {result.end_date})
            </span>
          </h3>
          {result.place && (
            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--ink-soft)" }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: "var(--red)" }} />
              {result.place}
              {result.timezone ? ` · ${result.timezone}` : ""}
              {typeof result.latitude === "number" && typeof result.longitude === "number"
                ? ` · ${result.latitude.toFixed(3)}°, ${result.longitude.toFixed(3)}°`
                : ""}
            </p>
          )}
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--red)" }}>
          {result.best_days.length} {lang === "ta" ? "நல்ல நாட்கள் கிடைத்தன" : "good day(s) found"}
        </span>
      </div>

      {/* General auspicious-days overview — always shown first, for every event type. */}
      <GeneralOverviewStrip days={result.days} lang={lang} />

      {result.event_type !== "general" && (
        <h4 className="text-sm font-bold mb-3" style={{ color: "var(--red-deep)" }}>
          {lang === "ta"
            ? result.event_type === "marriage"
              ? "திருமணத்திற்கான விரிவான நாள்வாரி பரிசோதனை"
              : "பயணத்திற்கான விரிவான நாள்வாரி பரிசோதனை"
            : result.event_type === "marriage"
            ? "Detailed Day-by-Day Marriage Screening"
            : "Detailed Day-by-Day Travel Screening"}
        </h4>
      )}

      <div className="space-y-3">
        {result.days.map((day: MuhurthaDayResult) => {
          const s = ratingStyle(day.overall_rating);
          const Icon = s.Icon;
          const allFlags = [...day.universal_flags, ...day.event_specific_flags];
          const allFlagsTa = [...day.universal_flags_ta, ...day.event_specific_flags_ta];

          return (
            <div key={day.date} className="rounded-xl border p-4" style={{ background: s.bg, borderColor: s.border + "55" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 shrink-0" style={{ color: s.border }} />
                  <div>
                    <div className="font-bold text-sm" style={{ color: s.text }}>
                      {day.date} — {lang === "ta" ? day.vaaram_ta : day.vaaram}
                    </div>
                    <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      {lang === "ta"
                        ? `${day.tithi_ta} · ${day.nakshatra_ta} · ${day.karanam_ta}`
                        : `${day.tithi} · ${day.nakshatra} · ${day.karanam}`}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: s.border, color: "#fff" }}>
                  {lang === "ta" ? day.overall_rating_ta : day.overall_rating}
                </span>
              </div>

              {allFlags.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {(lang === "ta" ? allFlagsTa : allFlags).map((f, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: s.text }}>
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div
                className="mt-3 pt-3 border-t flex flex-wrap gap-x-5 gap-y-1 text-[11px]"
                style={{ borderColor: s.border + "33", color: "var(--ink-faint)" }}
              >
                <span>
                  {lang === "ta" ? "ராகு காலம்" : "Rahu Kalam"}: {day.rahu_kalam}
                </span>
                <span>
                  {lang === "ta" ? "எமகண்டம்" : "Yamagandam"}: {day.yamagandam}
                </span>
                <span>
                  {lang === "ta" ? "குளிகை" : "Kuligai"}: {day.kuligai}
                </span>
                {day.dishashool_direction && (
                  <span>
                    {lang === "ta" ? "திசைசூல்" : "Dishashool"}: {day.dishashool_direction}
                  </span>
                )}
                {day.tara_bala_a && <span>Tara (A): {lang === "ta" ? day.tara_bala_a_ta : day.tara_bala_a}</span>}
                {day.tara_bala_b && <span>Tara (B): {lang === "ta" ? day.tara_bala_b_ta : day.tara_bala_b}</span>}
                {day.chandra_bala_a_favorable !== null && day.chandra_bala_a_favorable !== undefined && (
                  <span>
                    {lang === "ta" ? "சந்திர பலம் (A)" : "Chandra Bala (A)"}:{" "}
                    {day.chandra_bala_a_favorable ? (lang === "ta" ? "சாதகம்" : "OK") : lang === "ta" ? "சாதகமற்றது" : "Weak"}
                  </span>
                )}
                {day.chandra_bala_b_favorable !== null && day.chandra_bala_b_favorable !== undefined && (
                  <span>
                    {lang === "ta" ? "சந்திர பலம் (B)" : "Chandra Bala (B)"}:{" "}
                    {day.chandra_bala_b_favorable ? (lang === "ta" ? "சாதகம்" : "OK") : lang === "ta" ? "சாதகமற்றது" : "Weak"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="text-[11px] mt-5 pt-4 border-t"
        style={{ borderColor: "rgba(10,37,64,0.08)", color: "var(--ink-faint)" }}
      >
        {lang === "ta" ? "ஆதாரம்" : "Sources"}: {result.classical_sources.join(" · ")}
      </p>
    </div>
  );
};

export default MuhurthaResults;