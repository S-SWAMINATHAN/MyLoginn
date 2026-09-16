"use client";

import React, { useEffect, useState } from "react";
import { checkNumerologyApi, getNumerologyReferenceApi } from "@/lib/api";
import { NumerologyProfile, NumerologyReference } from "@/lib/types";
import {
  Hash, Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles,
  Star, Palette, CalendarDays, Table2, ChevronDown,
} from "lucide-react";

interface NumerologyPanelProps {
  lang: "ta" | "en";
  /** Prefilled from the baby-name form so the parent doesn't retype the DOB. */
  defaultDob?: string;
  defaultName?: string;
}

/**
 * Chaldean Name Numerology panel.
 *
 * This is deliberately rendered as its OWN visually distinct card, separate
 * from the Nakshatra-Pada suggestions above it, because the two are different
 * traditions (Vedic astrology vs. Chaldean numerology). They must never look
 * like one blended verdict. See backend/app/services/numerology.py.
 */
export const NumerologyPanel: React.FC<NumerologyPanelProps> = ({
  lang,
  defaultDob,
  defaultName,
}) => {
  const [name, setName] = useState(defaultName || "");
  const [dob, setDob] = useState(defaultDob || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NumerologyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Static reference tables (Meaning of Numbers 1-9, letter chart, master
  // numbers). Fetched once on mount; pure lookup data, no user input.
  const [reference, setReference] = useState<NumerologyReference | null>(null);
  const [showReference, setShowReference] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNumerologyReferenceApi()
      .then((r) => {
        if (!cancelled) setReference(r);
      })
      .catch(() => {
        /* reference tables are supplementary — failing to load must not
           break the calculator itself, so this is intentionally silent. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the DOB in sync when the parent form's value arrives/changes.
  useEffect(() => {
    if (defaultDob) setDob(defaultDob);
  }, [defaultDob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await checkNumerologyApi({ name: name.trim(), date_of_birth: dob });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to check numerology.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusTone = (status?: string) => {
    if (status === "Favourable")
      return {
        wrap: "bg-[rgba(46,125,50,0.07)] border-[#2e7d32]",
        text: "text-[#2e7d32]",
        Icon: CheckCircle2,
      };
    if (status === "Partially Aligned")
      return {
        wrap: "bg-[rgba(230,145,0,0.08)] border-[#e69100]",
        text: "text-[#b36b00]",
        Icon: AlertTriangle,
      };
    return {
      wrap: "bg-[rgba(176,55,38,0.07)] border-[var(--red)]",
      text: "text-[var(--red-deep)]",
      Icon: XCircle,
    };
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--red)] transition-all";

  return (
    <div className="hand-card p-6 sm:p-8 shadow-sm text-[var(--ink)] space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[rgba(43,33,23,0.2)]">
        <h3 className="text-xl sm:text-2xl font-bold font-cinzel flex items-center gap-2">
          <Hash className="w-5 h-5 text-[var(--red)]" />
          {lang === "ta" ? "பெயர் எண் கணிதம்" : "Name Numerology"}
        </h3>
        <p className="text-xs text-[var(--ink-soft)] font-tamil mt-1">
          {lang === "ta"
            ? "கால்டியன் எண் கணித முறை — இது மேலே உள்ள நட்சத்திர-பாத முறையிலிருந்து வேறுபட்ட ஒரு தனி முறை. இரண்டும் தனித்தனியாகக் காட்டப்படுகின்றன."
            : "Chaldean numerology — a separate tradition from the Nakshatra-Pada system above. Both are shown independently, never merged."}
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "பெயர் (ஆங்கில எழுத்தில்)" : "Full Name (English spelling)"} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "ta" ? "எ.கா. Aadhira" : "e.g. Aadhira"}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--ink-soft)] mb-1.5 font-tamil">
            {lang === "ta" ? "பிறந்த தேதி" : "Date of Birth"} *
          </label>
          <input
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-3">
          <p className="text-[11px] text-[var(--ink-soft)] font-tamil mb-3">
            {lang === "ta"
              ? "குறிப்பு: அன்றாட வாழ்வில் நீங்கள் உண்மையில் பயன்படுத்தும் பெயரைப் பயன்படுத்தவும் (ஆவணங்கள் / வங்கி / அடையாள அட்டை)."
              : "Tip: use the name actually used in daily life (documents / bank / ID card)."}
          </p>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-hand px-8 py-2.5 rounded-2xl bg-[var(--red)] text-white font-bold text-sm shadow-md hover:bg-[var(--red-deep)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{lang === "ta" ? "பெயர் எண்ணைக் கணக்கிடு" : "Calculate Name Number"}</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)] text-[var(--red-deep)] text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5 pt-2">
          {/* Personality — three distinct layers.
              Chaldean practice separates inner nature (birth day), life
              direction (full DOB) and outer projection (the NAME's spelling).
              Rendering them separately is what makes it visible which input
              drives which paragraph — and the third section changes whenever
              the candidate name changes. */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-[var(--red-deep)] font-cinzel">
                {lang === "ta" ? "உங்கள் ஆளுமை & இயல்பான பலங்கள்" : "Personality & Natural Strengths"}
              </h4>
              <p className="text-xs text-[var(--ink-soft)] font-tamil mt-0.5">
                {lang === "ta" ? "அன்புள்ள" : "Dear"}{" "}
                <strong className="text-[var(--ink)]">{result.name}</strong>,
              </p>
            </div>

            {result.personality_sections?.map((sec) => (
              <div
                key={sec.key}
                className={`rounded-2xl p-4 border ${
                  sec.key === "expression"
                    ? "bg-[rgba(176,55,38,0.05)] border-[rgba(176,55,38,0.35)]"
                    : "bg-[rgba(120,96,58,0.05)] border-[rgba(43,33,23,0.2)]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <h5 className="text-xs font-bold text-[var(--ink)] font-cinzel">
                    {lang === "ta" ? sec.title_ta : sec.title}
                  </h5>
                  <span className="text-[10px] text-[var(--ink-soft)] font-tamil italic">
                    {lang === "ta" ? sec.source_label_ta : sec.source_label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-tamil text-[var(--ink)]">
                  {lang === "ta" ? sec.text_ta : sec.text}
                </p>
              </div>
            ))}
          </div>

          {/* The three numbers */}
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)] font-cinzel mb-3">
              {lang === "ta" ? "உங்கள் எண்கள்" : "Your Numbers"}
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--paper)] border border-[rgba(43,33,23,0.2)]">
                <p className="text-[10px] text-[var(--ink-soft)] uppercase font-tamil tracking-wide">
                  {lang === "ta" ? "பிறப்பு எண் (மூலாங்கம்)" : "Birth No. (Moolank)"}
                </p>
                <p className="text-3xl font-bold text-[var(--ink)]">{result.birth_number}</p>
                <p className="text-[10px] text-[var(--ink-soft)] font-tamil">
                  {lang === "ta" ? result.birth_number_planet_ta : result.birth_number_planet}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--paper)] border border-[rgba(43,33,23,0.2)]">
                <p className="text-[10px] text-[var(--ink-soft)] uppercase font-tamil tracking-wide">
                  {lang === "ta" ? "ஊழ் எண் (பாக்யாங்கம்)" : "Destiny No. (Bhagyank)"}
                </p>
                <p className="text-3xl font-bold text-[var(--ink)]">{result.destiny_number}</p>
              </div>
              <div className="p-3 rounded-xl bg-[rgba(176,55,38,0.08)] border border-[var(--red)]">
                <p className="text-[10px] text-[var(--red-deep)] uppercase font-tamil tracking-wide">
                  {lang === "ta" ? "பெயர் எண் (நாமாங்கம்)" : "Name No. (Namank)"}
                </p>
                <p className="text-3xl font-bold text-[var(--red-deep)]">{result.name_number}</p>
                <p className="text-[10px] text-[var(--ink-soft)] font-mono">
                  total {result.name_compound_total}
                </p>
              </div>
            </div>
          </div>

          {/* Alignment verdict */}
          {(() => {
            const tone = statusTone(result.alignment_status);
            const Icon = tone.Icon;
            return (
              <div className={`rounded-2xl p-4 border ${tone.wrap}`}>
                <div className={`flex items-center gap-2 font-bold text-sm mb-3 ${tone.text}`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-tamil">
                    {lang === "ta" ? result.headline_ta : result.headline}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] text-[11px] font-tamil">
                    {lang === "ta" ? "நாமாங்கம்" : "Namank"} {result.name_number} ↔{" "}
                    {lang === "ta" ? "மூலாங்கம்" : "Moolank"} {result.birth_number}
                    <strong className="ml-1.5 text-[var(--red-deep)]">
                      {lang === "ta"
                        ? result.relation_with_birth_number_ta
                        : result.relation_with_birth_number}
                    </strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] text-[11px] font-tamil">
                    {lang === "ta" ? "நாமாங்கம்" : "Namank"} {result.name_number} ↔{" "}
                    {lang === "ta" ? "பாக்யாங்கம்" : "Bhagyank"} {result.destiny_number}
                    <strong className="ml-1.5 text-[var(--red-deep)]">
                      {lang === "ta"
                        ? result.relation_with_destiny_number_ta
                        : result.relation_with_destiny_number}
                    </strong>
                  </span>
                </div>

                <p className="text-sm leading-relaxed font-tamil text-[var(--ink)]">
                  {lang === "ta" ? result.analysis_ta : result.analysis}
                </p>
              </div>
            );
          })()}

          {/* Letter-by-letter breakdown */}
          <div>
            <p className="text-[11px] font-semibold text-[var(--ink-soft)] mb-2 font-tamil">
              {lang === "ta"
                ? `எழுத்து மதிப்புகள் (கால்டியன்) — மொத்தம் ${result.name_compound_total}`
                : `Letter values (Chaldean) — total ${result.name_compound_total}`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.name_number_breakdown.map((b, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] text-[11px] font-mono"
                >
                  {b.letter}={b.value}
                </span>
              ))}
            </div>
          </div>

          {/* Lucky attributes for the Name Number — mirrors what comparable
              calculators publish. Lucky numbers use the verified series
              n, n+9, n+18, n+27. */}
          {result.name_number_attributes && (
            <div className="rounded-2xl p-4 border border-[rgba(43,33,23,0.2)] bg-[rgba(120,96,58,0.05)]">
              <h4 className="text-xs font-bold text-[var(--ink)] font-cinzel mb-3">
                {lang === "ta"
                  ? `பெயர் எண் ${result.name_number} — அதிர்ஷ்ட அம்சங்கள்`
                  : `Name Number ${result.name_number} — Lucky Attributes`}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase text-[var(--ink-soft)] font-tamil">
                      {lang === "ta" ? "ஆளும் கிரகம்" : "Ruling Planet"}
                    </p>
                    <p className="font-semibold text-[var(--ink)] font-tamil">
                      {lang === "ta"
                        ? result.name_number_attributes.planet_ta
                        : result.name_number_attributes.planet}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-[var(--red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase text-[var(--ink-soft)] font-tamil">
                      {lang === "ta" ? "அதிர்ஷ்ட எண்கள்" : "Lucky Numbers"}
                    </p>
                    <p className="font-semibold text-[var(--ink)] font-mono">
                      {result.name_number_attributes.lucky_numbers.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Palette className="w-3.5 h-3.5 text-[var(--red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase text-[var(--ink-soft)] font-tamil">
                      {lang === "ta" ? "அதிர்ஷ்ட நிறங்கள்" : "Lucky Colours"}
                    </p>
                    <p className="font-semibold text-[var(--ink)] font-tamil">
                      {(lang === "ta"
                        ? result.name_number_attributes.lucky_colors_ta
                        : result.name_number_attributes.lucky_colors
                      ).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--red)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase text-[var(--ink-soft)] font-tamil">
                      {lang === "ta" ? "நல்ல நாட்கள்" : "Lucky Days"}
                    </p>
                    <p className="font-semibold text-[var(--ink)] font-tamil">
                      {(lang === "ta"
                        ? result.name_number_attributes.lucky_days_ta
                        : result.name_number_attributes.lucky_days
                      ).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[var(--ink-soft)] font-tamil mt-3 pt-2 border-t border-[rgba(43,33,23,0.12)]">
                <strong>{lang === "ta" ? "குணங்கள்: " : "Traits: "}</strong>
                {lang === "ta"
                  ? result.name_number_attributes.traits_ta
                  : result.name_number_attributes.traits}
              </p>
            </div>
          )}

          {/* Master numbers actually detected for THIS name/DOB. Informational
              only — the headline numbers stay fully reduced (1-9). */}
          {result.master_numbers_present && result.master_numbers_present.length > 0 && (
            <div className="rounded-2xl p-4 border border-[rgba(176,55,38,0.35)] bg-[rgba(176,55,38,0.05)]">
              <h4 className="text-xs font-bold text-[var(--red-deep)] font-cinzel mb-2">
                {lang === "ta" ? "மாஸ்டர் எண் காணப்பட்டது" : "Master Number Detected"}
              </h4>
              {result.master_numbers_present.map((m) => (
                <div key={m.number} className="mb-2 last:mb-0">
                  <p className="text-sm font-bold text-[var(--ink)] font-tamil">
                    {m.number} — {lang === "ta" ? m.title_ta : m.title}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)] font-tamil leading-relaxed">
                    {lang === "ta" ? m.text_ta : m.text}
                  </p>
                </div>
              ))}
              <p className="text-[10px] text-[var(--ink-soft)] font-tamil mt-2 pt-2 border-t border-[rgba(43,33,23,0.12)]">
                {lang === "ta"
                  ? "குறிப்பு: இக்கணிப்பான் அடிப்படை எண்களை 1-9 ஆகக் குறைக்கிறது (நியம கால்டியன் மரபு). மாஸ்டர் எண் தகவலுக்காக மட்டும்."
                  : "Note: this calculator reduces core numbers fully to 1-9 (standard Chaldean convention). The master number is shown for information only."}
              </p>
            </div>
          )}

          {/* Honest scope disclaimer */}
          <div className="p-3.5 rounded-xl bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--ink-soft)] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[var(--ink-soft)] font-tamil leading-relaxed">
              {lang === "ta" ? result.disclaimer_ta : result.disclaimer}
            </p>
          </div>

          <p className="text-[10px] text-[var(--ink-soft)] font-mono text-center pt-2 border-t border-[rgba(43,33,23,0.1)]">
            {result.classical_source}
          </p>
        </div>
      )}

      {/* Reference tables — collapsed by default so they don't bury the
          actual result. Meaning of Numbers 1-9, the Chaldean letter chart,
          and the master numbers. */}
      {reference && (
        <div className="pt-2 border-t border-[rgba(43,33,23,0.15)]">
          <button
            type="button"
            onClick={() => setShowReference((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] text-xs font-semibold text-[var(--ink)] hover:border-[var(--red)] transition-all font-tamil"
          >
            <span className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-[var(--red)]" />
              {lang === "ta"
                ? "எண்களின் பொருள், எழுத்து அட்டவணை & மாஸ்டர் எண்கள்"
                : "Meaning of Numbers, Letter Chart & Master Numbers"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showReference ? "rotate-180" : ""}`}
            />
          </button>

          {showReference && (
            <div className="mt-4 space-y-6">
              {/* Meaning of Numbers 1-9 */}
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)] font-cinzel mb-2">
                  {lang === "ta" ? "1 முதல் 9 வரை எண்களின் பொருள்" : "Meaning of Numbers 1–9"}
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[rgba(43,33,23,0.2)]">
                  <table className="w-full text-[11px] font-tamil">
                    <thead className="bg-[rgba(120,96,58,0.08)] text-[var(--ink-soft)]">
                      <tr>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "எண்" : "No."}</th>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "கிரகம்" : "Planet"}</th>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "குணங்கள்" : "Traits"}</th>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "அதிர்ஷ்ட எண்" : "Lucky No."}</th>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "நிறங்கள்" : "Colours"}</th>
                        <th className="px-2 py-1.5 text-left">{lang === "ta" ? "நாட்கள்" : "Days"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reference.numbers.map((r) => (
                        <tr
                          key={r.number}
                          className={`border-t border-[rgba(43,33,23,0.12)] ${
                            result && r.number === result.name_number
                              ? "bg-[rgba(176,55,38,0.07)] font-semibold"
                              : ""
                          }`}
                        >
                          <td className="px-2 py-1.5 font-bold text-[var(--red-deep)]">{r.number}</td>
                          <td className="px-2 py-1.5">{lang === "ta" ? r.planet_ta : r.planet}</td>
                          <td className="px-2 py-1.5">{lang === "ta" ? r.traits_ta : r.traits}</td>
                          <td className="px-2 py-1.5 font-mono">{r.lucky_numbers.join(", ")}</td>
                          <td className="px-2 py-1.5">
                            {(lang === "ta" ? r.lucky_colors_ta : r.lucky_colors).join(", ")}
                          </td>
                          <td className="px-2 py-1.5">
                            {(lang === "ta" ? r.lucky_days_ta : r.lucky_days).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chaldean letter chart */}
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)] font-cinzel mb-2">
                  {lang === "ta"
                    ? "கால்டியன் எழுத்து-எண் அட்டவணை"
                    : "Chaldean Letter–Number Chart"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {reference.letter_chart.map((row) => (
                    <div
                      key={row.value}
                      className="rounded-xl border border-[rgba(43,33,23,0.2)] bg-[var(--paper)] p-2.5 text-center"
                    >
                      <p className="text-lg font-bold text-[var(--red-deep)]">{row.value}</p>
                      <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                        {row.letters.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--ink-soft)] font-tamil mt-2">
                  {lang === "ta"
                    ? "குறிப்பு: கால்டியன் முறையில் எந்த எழுத்துக்கும் 9 ஒதுக்கப்படுவதில்லை — இது இம்முறையின் நியம அமைப்பே."
                    : "Note: in the Chaldean system no letter is assigned 9 — that exclusion is part of the standard chart."}
                </p>
              </div>

              {/* Master numbers */}
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)] font-cinzel mb-2">
                  {lang === "ta" ? "மாஸ்டர் எண்கள் 11, 22, 33" : "Master Numbers 11, 22, 33"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {reference.master_numbers.map((m) => (
                    <div
                      key={m.number}
                      className="rounded-xl border border-[rgba(43,33,23,0.2)] bg-[var(--paper)] p-3"
                    >
                      <p className="text-xl font-bold text-[var(--red-deep)] text-center">
                        {m.number}
                      </p>
                      <p className="text-[11px] font-bold text-[var(--ink)] text-center font-tamil mb-1">
                        {lang === "ta" ? m.title_ta : m.title}
                      </p>
                      <p className="text-[10px] text-[var(--ink-soft)] font-tamil leading-relaxed">
                        {lang === "ta" ? m.text_ta : m.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-[var(--ink-soft)] font-tamil italic">
                {lang === "ta" ? reference.note_ta : reference.note}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};