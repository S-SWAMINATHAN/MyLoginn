"use client";

import React, { useState } from "react";
import { StarMatchFinderResponse } from "@/lib/types";
import { findStarMatchesApi } from "@/lib/api";
import {
  Search,
  Star,
  ShieldCheck,
  AlertTriangle,
  Award,
  Crown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";

const NAKSHATRAS = [
  { en: "Ashwini", ta: "அசுவினி" }, { en: "Bharani", ta: "பரணி" }, { en: "Krittika", ta: "கார்த்திகை" },
  { en: "Rohini", ta: "ரோகிணி" }, { en: "Mrigashirsha", ta: "மிருகசீரிஷம்" }, { en: "Ardra", ta: "திருவாதிரை" },
  { en: "Punarvasu", ta: "புனர்பூசம்" }, { en: "Pushya", ta: "பூசம்" }, { en: "Ashlesha", ta: "ஆயில்யம்" },
  { en: "Magha", ta: "மகம்" }, { en: "Purva Phalguni", ta: "பூரம்" }, { en: "Uttara Phalguni", ta: "உத்திரம்" },
  { en: "Hasta", ta: "அஸ்தம்" }, { en: "Chitra", ta: "சித்திரை" }, { en: "Swati", ta: "சுவாதி" },
  { en: "Vishakha", ta: "விசாகம்" }, { en: "Anuradha", ta: "அனுஷம்" }, { en: "Jyeshtha", ta: "கேட்டை" },
  { en: "Moola", ta: "மூலம்" }, { en: "Purva Ashadha", ta: "பூராடம்" }, { en: "Uttara Ashadha", ta: "உத்திராடம்" },
  { en: "Shravana", ta: "திருவோணம்" }, { en: "Dhanishta", ta: "அவிட்டம்" }, { en: "Shatabhisha", ta: "சதயம்" },
  { en: "Purva Bhadrapada", ta: "பூரட்டாதி" }, { en: "Uttara Bhadrapada", ta: "உத்திரட்டாதி" }, { en: "Revati", ta: "ரேவதி" }
];

const RASI_OPTIONS = [
  { num: 0, sa: "All Rasis", ta: "அனைத்து ராசிகள்" },
  { num: 1, sa: "Mesha", ta: "மேஷம்" }, { num: 2, sa: "Vrishabha", ta: "ரிஷபம்" },
  { num: 3, sa: "Mithuna", ta: "மிதுனம்" }, { num: 4, sa: "Karkataka", ta: "கடகம்" },
  { num: 5, sa: "Simha", ta: "சிம்மம்" }, { num: 6, sa: "Kanya", ta: "கன்னி" },
  { num: 7, sa: "Tula", ta: "துலாம்" }, { num: 8, sa: "Vrischika", ta: "விருச்சிகம்" },
  { num: 9, sa: "Dhanus", ta: "தனுசு" }, { num: 10, sa: "Makara", ta: "மகரம்" },
  { num: 11, sa: "Kumbha", ta: "கும்பம்" }, { num: 12, sa: "Meena", ta: "மீனம்" },
];

interface Props {
  lang: "ta" | "en";
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= count ? "fill-[var(--red)] text-[var(--red)]" : "text-[rgba(43,33,23,0.2)]"
          }`}
        />
      ))}
    </span>
  );
}

export const StarMatchFinder: React.FC<Props> = ({ lang }) => {
  const [inputNak, setInputNak] = useState("Pushya");
  const [inputPada, setInputPada] = useState(2);
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [filterRasi, setFilterRasi] = useState<number>(0);
  const [sortBy, setSortBy] = useState("score");
  const [search, setSearch] = useState("");
  const [showOnlySafe, setShowOnlySafe] = useState(false);
  const [minStars, setMinStars] = useState(0);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<"all" | "uthama" | "rajju_safe" | "eight_plus" | "five_stars">("all");

  const [data, setData] = useState<StarMatchFinderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFind = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await findStarMatchesApi({
        input_nakshatra: inputNak,
        input_pada: inputPada,
        input_gender: gender,
        filter_rasi: filterRasi || null,
        sort_by: sortBy,
      });
      setData(res);
      setTimeout(() => {
        document.getElementById("match-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches =
    data?.matches.filter((m) => {
      if (
        search &&
        !(
          m.target_nakshatra.toLowerCase().includes(search.toLowerCase()) ||
          m.target_nakshatra_ta.includes(search) ||
          m.target_rasi.toLowerCase().includes(search.toLowerCase()) ||
          m.target_rasi_ta.includes(search)
        )
      )
        return false;
      if (showOnlySafe && m.rajju_dosha) return false;
      if (minStars && m.like_rate < minStars) return false;

      if (
        quickFilter === "uthama" &&
        (m.tamil_compatible_count < 8 || m.rajju_dosha || m.score_percentage < 70)
      )
        return false;
      if (quickFilter === "rajju_safe" && m.rajju_dosha) return false;
      if (quickFilter === "eight_plus" && m.tamil_compatible_count < 8) return false;
      if (quickFilter === "five_stars" && m.like_rate < 5) return false;

      return true;
    }) || [];

  return (
    <div className="space-y-6 text-[var(--ink)]">
      <form onSubmit={handleFind} className="hand-card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-[var(--red)]" />
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[var(--ink)]">
            {lang === "ta" ? "நட்சத்திர பொருத்த தேடல் (MATCH Finder)" : "Star Match Finder — MATCH"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
              {lang === "ta" ? "யாருடைய நட்சத்திரம்?" : "Input belongs to"}
            </label>
            <div className="flex bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gender === "boy" ? "bg-[var(--red)] text-white shadow-sm" : "text-[var(--ink-soft)]"
                }`}
              >
                {lang === "ta" ? "மணமகன் (Boy)" : "Boy"}
              </button>
              <button
                type="button"
                onClick={() => setGender("girl")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gender === "girl" ? "bg-[var(--red)] text-white shadow-sm" : "text-[var(--ink-soft)]"
                }`}
              >
                {lang === "ta" ? "மணமகள் (Girl)" : "Girl"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
              {gender === "boy"
                ? lang === "ta"
                  ? "மணமகன் நட்சத்திரம்"
                  : "Boy Nakshatra"
                : lang === "ta"
                ? "மணமகள் நட்சத்திரம்"
                : "Girl Nakshatra"}
            </label>
            <select
              value={inputNak}
              onChange={(e) => setInputNak(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-sm font-tamil focus:outline-none focus:border-[var(--red)]"
            >
              {NAKSHATRAS.map((n, idx) => (
                <option key={idx} value={n.en}>
                  {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
              {lang === "ta" ? "பாதம் (1-4)" : "Pada (1-4)"}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setInputPada(p)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    inputPada === p
                      ? "bg-[var(--red)] border-[var(--red)] text-white shadow-sm"
                      : "bg-[var(--paper)] border-[rgba(43,33,23,0.25)] text-[var(--ink)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[rgba(43,33,23,0.12)]">
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
              {lang === "ta" ? "குறிப்பிட்ட ராசி மட்டும் (விருப்பத்திற்கு)" : "Filter by Target Rasi"}
            </label>
            <select
              value={filterRasi}
              onChange={(e) => setFilterRasi(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs font-tamil focus:outline-none focus:border-[var(--red)]"
            >
              {RASI_OPTIONS.map((r) => (
                <option key={r.num} value={r.num}>
                  {r.num === 0 ? (lang === "ta" ? r.ta : r.sa) : `${r.num}. ${lang === "ta" ? r.ta : r.sa}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1 font-tamil">
              {lang === "ta" ? "வரிசைப்படுத்துக" : "Sort By"}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.3)] rounded-xl text-[var(--ink)] text-xs font-tamil focus:outline-none focus:border-[var(--red)]"
            >
              <option value="score">{lang === "ta" ? "Score % (அதிகபட்சம்)" : "Score % (Highest first)"}</option>
              <option value="like_rate">{lang === "ta" ? "LIKE-RATE (நட்சத்திரங்கள்)" : "LIKE-RATE (Stars)"}</option>
              <option value="nakshatra">{lang === "ta" ? "நட்சத்திர வரிசை (1-27)" : "Nakshatra Order (1-27)"}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-hand w-full py-2.5 rounded-xl bg-[var(--red)] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[var(--red-deep)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{lang === "ta" ? "பொருத்தங்களை தேடுக" : "Find 108 Matches"}</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-[rgba(176,55,38,0.08)] border border-[var(--red)] rounded-2xl text-[var(--red-deep)] text-xs font-tamil">
          {error}
        </div>
      )}

      {data && (
        <div id="match-results" className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="hand-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-[var(--ink-soft)] font-tamil">
                {lang === "ta" ? "உள்ளீடு விவரங்கள்:" : "Input Star:"}
              </div>
              <div className="text-base font-bold text-[var(--ink)] font-tamil">
                {gender === "boy" ? (lang === "ta" ? "மணமகன்: " : "Boy: ") : lang === "ta" ? "மணமகள்: " : "Girl: "}
                <span className="text-[var(--red-deep)]">
                  {lang === "ta" ? data.input_details.nakshatra_ta : data.input_details.nakshatra}
                </span>
                <span className="text-[var(--ink-soft)]">
                  {" "}
                  ({lang === "ta" ? data.input_details.rasi_ta : data.input_details.rasi}, பாதம்{" "}
                  {data.input_details.pada})
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 bg-[rgba(176,55,38,0.08)] text-[var(--red-deep)] rounded-full font-bold border border-[var(--red)]">
                {data.summary.total_combinations} {lang === "ta" ? "ஆய்வு செய்யப்பட்டது" : "Evaluated"}
              </span>
              <span className="px-2.5 py-1 bg-[var(--paper)] border border-[rgba(43,33,23,0.2)] rounded-full text-[var(--ink-soft)]">
                Target:{" "}
                {gender === "boy"
                  ? lang === "ta"
                    ? "பெண் ஜாதகங்கள்"
                    : "Girl charts"
                  : lang === "ta"
                  ? "ஆண் ஜாதகங்கள்"
                  : "Boy charts"}
              </span>
            </div>
          </div>

          {/* Rasi-wise Summary */}
          <div className="hand-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[var(--red)]" />{" "}
              {lang === "ta" ? "ராசி வாரியாக LIKE-RATE சுருக்கம்" : "Rasi-wise LIKE-RATE Summary"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.rasi_summary.map((r) => (
                <div
                  key={r.rasi_number}
                  className="bg-[rgba(120,96,58,0.05)] border border-[rgba(43,33,23,0.2)] rounded-2xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--ink)] font-tamil">
                      {lang === "ta" ? r.rasi_ta : r.rasi}{" "}
                      <span className="text-[10px] text-[var(--ink-soft)]">({r.rasi_lord})</span>
                    </span>
                    <span className="text-xs font-caveat font-bold text-base text-[var(--red-deep)]">
                      {r.avg_score}% avg
                    </span>
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] font-tamil">
                    Best: {lang === "ta" ? r.best_nakshatra_ta : r.best_nakshatra} P{r.best_pada} — {r.best_score}%
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-[rgba(46,125,50,0.1)] text-[#1b5e20] rounded-full border border-[#2e7d32]">
                      Uthama {r.uthama_count}
                    </span>
                    <span className="px-1.5 py-0.5 bg-[var(--paper)] text-[var(--ink-soft)] rounded-full border border-[rgba(43,33,23,0.2)]">
                      Safe {r.rajju_safe_count}/{r.total_combinations}
                    </span>
                  </div>
                  <button
                    onClick={() => setFilterRasi(r.rasi_number)}
                    className="text-[10px] text-[var(--red-deep)] underline mt-1 block"
                  >
                    {lang === "ta" ? "இந்த ராசியை வடிகட்டு" : "Filter to this Rasi"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="hand-card p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-2 text-xs font-tamil">
              <span className="text-[var(--ink-soft)] font-bold self-center mr-1">
                {lang === "ta" ? "விரைவு வடிகட்டிகள்:" : "Quick Filters:"}
              </span>
              {[
                { id: "all", labelTa: "அனைத்தும்", labelEn: "All" },
                { id: "uthama", labelTa: "உத்தமப் பொருத்தம் (Uthama)", labelEn: "Uthama Match" },
                { id: "rajju_safe", labelTa: "ரஜ்ஜு பாதுகாப்பு (Rajju Safe)", labelEn: "Rajju Safe" },
                { id: "eight_plus", labelTa: "8+ பொருத்தங்கள்", labelEn: "8+ Matched" },
                { id: "five_stars", labelTa: "★★★★★ (5 Stars)", labelEn: "5 Stars" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQuickFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    quickFilter === tab.id
                      ? "bg-[var(--red)] border-[var(--red)] text-white shadow-sm"
                      : "bg-[var(--paper)] border-[rgba(43,33,23,0.2)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  {lang === "ta" ? tab.labelTa : tab.labelEn}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-[rgba(43,33,23,0.1)]">
              <div className="flex-1 flex items-center gap-2 bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-[var(--ink-soft)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "ta" ? "நட்சத்திரம் / ராசி தேடுக..." : "Search nakshatra / rasi..."}
                  className="flex-1 bg-transparent outline-none text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]"
                />
              </div>
              <div className="flex gap-2 items-center text-xs">
                <label className="flex items-center gap-1.5 text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={showOnlySafe}
                    onChange={(e) => setShowOnlySafe(e.target.checked)}
                    className="rounded"
                  />{" "}
                  {lang === "ta" ? "ரஜ்ஜு Safe மட்டும்" : "Rajju Safe only"}
                </label>
                <select
                  value={minStars}
                  onChange={(e) => setMinStars(Number(e.target.value))}
                  className="bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] rounded-xl px-2 py-1.5 text-[var(--ink)]"
                >
                  <option value={0}>{lang === "ta" ? "அனைத்து நட்சத்திரம்" : "All stars"}</option>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4+)</option>
                  <option value={3}>★★★☆☆ (3+)</option>
                </select>
              </div>
              <div className="text-xs text-[var(--ink-soft)]">
                {filteredMatches.length} / {data.matches.length} {lang === "ta" ? "பொருத்தங்கள்" : "matches"}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="hand-card shadow-sm overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[rgba(120,96,58,0.08)] text-[var(--ink)] border-b border-[rgba(43,33,23,0.25)] sticky top-0 font-tamil font-bold">
                  <tr>
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-3">
                      {lang === "ta" ? "எதிர் நட்சத்திரம் (Rasi + Pada)" : "Target Star (Rasi + Pada)"}
                    </th>
                    <th className="py-3 px-2 text-center">Ashta</th>
                    <th className="py-3 px-2 text-center">{lang === "ta" ? "தமிழ் 10" : "Tamil 10"}</th>
                    <th className="py-3 px-2 text-center">Score</th>
                    <th className="py-3 px-2 text-center">LIKE-RATE</th>
                    <th className="py-3 px-2 text-center">
                      <ShieldCheck className="w-3.5 h-3.5 inline text-[var(--red)]" />
                    </th>
                    <th className="py-3 px-3">{lang === "ta" ? "தீர்ப்பு" : "Verdict"}</th>
                    <th className="py-3 px-2 text-center">{lang === "ta" ? "விவரம்" : "Details"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(43,33,23,0.12)] text-[var(--ink)]">
                  {filteredMatches.map((m, idx) => {
                    const rowKey = `${m.target_nakshatra_number}-${m.target_pada}`;
                    const isExpanded = expandedKey === rowKey;
                    return (
                      <React.Fragment key={rowKey}>
                        <tr
                          onClick={() => setExpandedKey(isExpanded ? null : rowKey)}
                          className={`hover:bg-[rgba(43,33,23,0.04)] cursor-pointer transition-colors ${
                            m.rajju_dosha ? "bg-[rgba(176,55,38,0.03)]" : ""
                          } ${isExpanded ? "bg-[rgba(176,55,38,0.06)] border-l-4 border-[var(--red)]" : ""}`}
                        >
                          <td className="py-2.5 px-3 text-[var(--ink-soft)] font-caveat text-sm">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[var(--ink)] font-tamil">
                              {lang === "ta" ? m.target_nakshatra_ta : m.target_nakshatra}{" "}
                              <span className="text-[var(--red-deep)]">P{m.target_pada}</span>
                            </div>
                            <div className="text-[11px] text-[var(--ink-soft)] font-tamil">
                              {lang === "ta" ? m.target_rasi_ta : m.target_rasi} ({m.target_rasi_lord}) •{" "}
                              {m.target_rasi_element}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-caveat font-bold text-base text-[var(--ink)]">
                            {m.ashta_koota_total}/36
                          </td>
                          <td className="py-2.5 px-2 text-center font-caveat font-bold text-base text-[#1b5e20]">
                            {m.tamil_compatible_count}/10
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold font-caveat text-sm border ${
                                m.score_percentage >= 70 && !m.rajju_dosha
                                  ? "bg-[rgba(46,125,50,0.1)] text-[#1b5e20] border-[#2e7d32]"
                                  : m.score_percentage >= 50 && !m.rajju_dosha
                                  ? "bg-[rgba(230,81,0,0.1)] text-[#b23c00] border-[#e65100]"
                                  : "bg-[rgba(176,55,38,0.1)] text-[var(--red-deep)] border-[var(--red)]"
                              }`}
                            >
                              {m.score_percentage}%
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <Stars count={m.like_rate} />
                              <span className="text-[10px] text-[var(--ink-soft)] leading-none font-tamil">
                                {lang === "ta" ? m.like_rate_label_ta : m.like_rate_label}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  m.rajju_dosha ? "bg-[var(--red)]" : "bg-[#2e7d32]"
                                }`}
                                title={m.rajju_dosha ? "Rajju Dosha" : "Rajju Safe"}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-xs font-tamil text-[var(--ink)] leading-tight">
                              {lang === "ta" ? m.verdict_ta : m.verdict}
                            </div>
                            {m.rajju_dosha && (
                              <div className="text-[10px] text-[var(--red-deep)] flex items-center gap-1 mt-0.5 font-tamil">
                                <AlertTriangle className="w-3 h-3" /> Rajju:{" "}
                                {lang === "ta" ? m.rajju_type_ta : m.rajju_type}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              className="p-1 rounded-lg bg-[var(--paper)] border border-[rgba(43,33,23,0.25)] text-[var(--ink)] hover:bg-[rgba(176,55,38,0.08)]"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Accordion */}
                        {isExpanded && (
                          <tr className="bg-[var(--paper)] border-b-2 border-[var(--red)] animate-fade-in">
                            <td colSpan={9} className="p-4 sm:p-6 space-y-4">
                              <div className="border-b border-[rgba(43,33,23,0.15)] pb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--red-deep)] font-tamil flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[var(--red)]" />
                                  {lang === "ta"
                                    ? `தமிழ் 10 பொருத்தங்கள் & அஷ்டகூட விரிவான அட்டவணை (${m.target_nakshatra_ta} - பாதம் ${m.target_pada})`
                                    : `Tamil 10-Porutham & Ashta Koota Breakdown (${m.target_nakshatra} - Pada ${m.target_pada})`}
                                </span>
                                <span className="text-[11px] text-[var(--ink-soft)] font-tamil">
                                  {m.tamil_compatible_count}/10{" "}
                                  {lang === "ta" ? "பொருத்தங்கள் கூடின" : "Matched"}
                                </span>
                              </div>

                              {/* 10-Porutham Grid */}
                              {m.tamil_10_porutham && (
                                <div>
                                  <div className="text-[11px] font-bold text-[var(--ink-soft)] font-tamil mb-2">
                                    {lang === "ta"
                                      ? "தென்னிந்திய 10 பொருத்த விவரங்கள்:"
                                      : "South Indian 10 Poruthams:"}
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-tamil">
                                    {Object.entries(m.tamil_10_porutham).map(
                                      ([k, p]: [string, any]) => (
                                        <div
                                          key={k}
                                          className={`p-2 rounded-xl border flex flex-col justify-between ${
                                            p.compatible
                                              ? "bg-[rgba(46,125,50,0.06)] border-[#2e7d32] text-[#1b5e20]"
                                              : "bg-[rgba(176,55,38,0.05)] border-[rgba(176,55,38,0.3)] text-[var(--red-deep)]"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-[11px] truncate">
                                              {lang === "ta" ? p.name_ta : p.name}
                                            </span>
                                            {p.compatible ? (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
                                            ) : (
                                              <XCircle className="w-3.5 h-3.5 text-[var(--red)] shrink-0" />
                                            )}
                                          </div>
                                          <div className="text-[10px] text-[var(--ink-soft)] line-clamp-2">
                                            {lang === "ta" ? p.description_ta : p.description}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Ashta Koota Breakdown */}
                              {m.ashta_koota && (
                                <div className="pt-2 border-t border-[rgba(43,33,23,0.1)]">
                                  <div className="text-[11px] font-bold text-[var(--ink-soft)] font-tamil mb-2">
                                    {lang === "ta"
                                      ? "அஷ்டகூட 36-புள்ளி விவரங்கள்:"
                                      : "Ashta Koota 36-Point Breakdown:"}
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-tamil">
                                    {Object.entries(m.ashta_koota).map(
                                      ([k, ak]: [string, any]) => (
                                        <div
                                          key={k}
                                          className="bg-[rgba(120,96,58,0.05)] p-2 rounded-xl border border-[rgba(43,33,23,0.2)] text-center"
                                        >
                                          <div className="text-[10px] text-[var(--ink-soft)] mb-0.5 truncate">
                                            {lang === "ta" ? ak.name_ta : ak.name}
                                          </div>
                                          <div className="font-bold text-[var(--red-deep)] font-caveat text-base">
                                            {ak.obtained} / {ak.max_points}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredMatches.length === 0 && (
              <div className="p-8 text-center text-[var(--ink-soft)] text-sm font-tamil">
                {lang === "ta"
                  ? "பொருத்தங்கள் எதுவும் கிடைக்கவில்லை. வடிகட்டியை மாற்றவும்."
                  : "No matches found. Adjust filters."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
