"use client";

import React from "react";
import { MuhurthaSearchResponse, MuhurthaDayResult } from "@/lib/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface MuhurthaResultsProps {
  result: MuhurthaSearchResponse;
  lang: "ta" | "en";
}

function ratingStyle(rating: string) {
  if (rating === "Excellent") return { bg: "#e6f7ed", border: "#34a853", text: "#1e7e42", Icon: CheckCircle2 };
  if (rating === "Good") return { bg: "#eef6f8", border: "#0891b2", text: "#0a5568", Icon: CheckCircle2 };
  return { bg: "#fdecec", border: "#d93025", text: "#a31515", Icon: XCircle };
}

export const MuhurthaResults: React.FC<MuhurthaResultsProps> = ({ result, lang }) => {
  return (
    <div className="palm-leaf-dark p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-[rgba(10,37,64,0.08)]">
        <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          {lang === "ta" ? "தேடல் முடிவுகள்" : "Search Results"}{" "}
          <span className="text-sm font-normal" style={{ color: "var(--ink-soft)" }}>
            ({result.start_date} → {result.end_date})
          </span>
        </h3>
        <span className="text-xs font-semibold" style={{ color: "var(--red)" }}>
          {result.best_days.length} {lang === "ta" ? "நல்ல நாட்கள் கிடைத்தன" : "good day(s) found"}
        </span>
      </div>

      <div className="space-y-3">
        {result.days.map((day: MuhurthaDayResult) => {
          const s = ratingStyle(day.overall_rating);
          const Icon = s.Icon;
          const allFlags = [...day.universal_flags, ...day.event_specific_flags];
          const allFlagsTa = [...day.universal_flags_ta, ...day.event_specific_flags_ta];

          return (
            <div
              key={day.date}
              className="rounded-xl border p-4"
              style={{ background: s.bg, borderColor: s.border + "55" }}
            >
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
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: s.border, color: "#fff" }}
                >
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

              <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-5 gap-y-1 text-[11px]" style={{ borderColor: s.border + "33", color: "var(--ink-faint)" }}>
                <span>{lang === "ta" ? "ராகு காலம்" : "Rahu Kalam"}: {day.rahu_kalam}</span>
                <span>{lang === "ta" ? "எமகண்டம்" : "Yamagandam"}: {day.yamagandam}</span>
                <span>{lang === "ta" ? "குளிகை" : "Kuligai"}: {day.kuligai}</span>
                {day.dishashool_direction && (
                  <span>{lang === "ta" ? "திசைசூல்" : "Dishashool"}: {day.dishashool_direction}</span>
                )}
                {day.tara_bala_a && (
                  <span>Tara (A): {lang === "ta" ? day.tara_bala_a_ta : day.tara_bala_a}</span>
                )}
                {day.tara_bala_b && (
                  <span>Tara (B): {lang === "ta" ? day.tara_bala_b_ta : day.tara_bala_b}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] mt-5 pt-4 border-t" style={{ borderColor: "rgba(10,37,64,0.08)", color: "var(--ink-faint)" }}>
        {lang === "ta" ? "ஆதாரம்" : "Sources"}: {result.classical_sources.join(" · ")}
      </p>
    </div>
  );
};
