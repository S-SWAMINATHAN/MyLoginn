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
            n <= count ? "fill-brand-500 text-brand-fg" : "text-muted/30"
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
    <div className="space-y-6 text-foreground">
      <form onSubmit={handleFind} className="card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-brand-fg" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
            {lang === "ta" ? "நட்சத்திர பொருத்த தேடல் (MATCH Finder)" : "Star Match Finder — MATCH"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs text-muted mb-1">
              {lang === "ta" ? "யாருடைய நட்சத்திரம்?" : "Input belongs to"}
            </label>
            <div className="flex bg-surface-2 border border-line rounded-xl p-1">
              <button
                type="button"
                onClick={() => setGender("boy")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gender === "boy" ? "brand-gradient-bg text-white shadow-sm" : "text-muted"
                }`}
              >
                {lang === "ta" ? "மணமகன் (Boy)" : "Boy"}
              </button>
              <button
                type="button"
                onClick={() => setGender("girl")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  gender === "girl" ? "brand-gradient-bg text-white shadow-sm" : "text-muted"
                }`}
              >
                {lang === "ta" ? "மணமகள் (Girl)" : "Girl"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs text-muted mb-1">
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
              className="w-full px-3 py-2.5 bg-surface-2 border border-line rounded-xl text-foreground text-sm focus:outline-none focus:border-brand-500"
            >
              {NAKSHATRAS.map((n, idx) => (
                <option key={idx} value={n.en}>
                  {idx + 1}. {lang === "ta" ? n.ta : n.en} ({n.en})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs text-muted mb-1">
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
                      ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                      : "bg-surface-2 border-line text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-soft">
          <div>
            <label className="block text-xs text-muted mb-1">
              {lang === "ta" ? "குறிப்பிட்ட ராசி மட்டும் (விருப்பத்திற்கு)" : "Filter by Target Rasi"}
            </label>
            <select
              value={filterRasi}
              onChange={(e) => setFilterRasi(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-foreground text-xs focus:outline-none focus:border-brand-500"
            >
              {RASI_OPTIONS.map((r) => (
                <option key={r.num} value={r.num}>
                  {r.num === 0 ? (lang === "ta" ? r.ta : r.sa) : `${r.num}. ${lang === "ta" ? r.ta : r.sa}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              {lang === "ta" ? "வரிசைப்படுத்துக" : "Sort By"}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-line rounded-xl text-foreground text-xs focus:outline-none focus:border-brand-500"
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
              className="btn-secondary w-full py-2.5 rounded-xl brand-gradient-bg text-white font-bold text-xs sm:text-sm shadow-md hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="p-4 bg-brand-500/10 border border-brand-500 rounded-2xl text-brand-fg-strong text-xs">
          {error}
        </div>
      )}

      {data && (
        <div id="match-results" className="space-y-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted">
                {lang === "ta" ? "உள்ளீடு விவரங்கள்:" : "Input Star:"}
              </div>
              <div className="text-base font-bold text-foreground">
                {gender === "boy" ? (lang === "ta" ? "மணமகன்: " : "Boy: ") : lang === "ta" ? "மணமகள்: " : "Girl: "}
                <span className="text-brand-fg-strong">
                  {lang === "ta" ? data.input_details.nakshatra_ta : data.input_details.nakshatra}
                </span>
                <span className="text-muted">
                  {" "}
                  ({lang === "ta" ? data.input_details.rasi_ta : data.input_details.rasi}, பாதம்{" "}
                  {data.input_details.pada})
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2.5 py-1 bg-brand-500/10 text-brand-fg-strong rounded-full font-bold border border-brand-500">
                {data.summary.total_combinations} {lang === "ta" ? "ஆய்வு செய்யப்பட்டது" : "Evaluated"}
              </span>
              <span className="px-2.5 py-1 bg-surface-2 border border-border-soft rounded-full text-muted">
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
          <div className="card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-brand-fg" />{" "}
              {lang === "ta" ? "ராசி வாரியாக LIKE-RATE சுருக்கம்" : "Rasi-wise LIKE-RATE Summary"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.rasi_summary.map((r) => (
                <div
                  key={r.rasi_number}
                  className="bg-brand-500/5 border border-border-soft rounded-2xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {lang === "ta" ? r.rasi_ta : r.rasi}{" "}
                      <span className="text-[10px] text-muted">({r.rasi_lord})</span>
                    </span>
                    <span className="text-xs font-bold text-base text-brand-fg-strong">
                      {r.avg_score}% avg
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    Best: {lang === "ta" ? r.best_nakshatra_ta : r.best_nakshatra} P{r.best_pada} — {r.best_score}%
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 bg-success/10 text-success rounded-full border border-success">
                      Uthama {r.uthama_count}
                    </span>
                    <span className="px-1.5 py-0.5 bg-surface-2 text-muted rounded-full border border-border-soft">
                      Safe {r.rajju_safe_count}/{r.total_combinations}
                    </span>
                  </div>
                  <button
                    onClick={() => setFilterRasi(r.rasi_number)}
                    className="text-[10px] text-brand-fg-strong underline mt-1 block"
                  >
                    {lang === "ta" ? "இந்த ராசியை வடிகட்டு" : "Filter to this Rasi"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="card p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted font-bold self-center mr-1">
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
                      ? "bg-brand-600 border-brand-500 text-white shadow-sm"
                      : "bg-surface-2 border-border-soft text-muted hover:text-foreground"
                  }`}
                >
                  {lang === "ta" ? tab.labelTa : tab.labelEn}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-border-soft">
              <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-line rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "ta" ? "நட்சத்திரம் / ராசி தேடுக..." : "Search nakshatra / rasi..."}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div className="flex gap-2 items-center text-xs">
                <label className="flex items-center gap-1.5 text-foreground">
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
                  className="bg-surface-2 border border-line rounded-xl px-2 py-1.5 text-foreground"
                >
                  <option value={0}>{lang === "ta" ? "அனைத்து நட்சத்திரம்" : "All stars"}</option>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4+)</option>
                  <option value={3}>★★★☆☆ (3+)</option>
                </select>
              </div>
              <div className="text-xs text-muted">
                {filteredMatches.length} / {data.matches.length} {lang === "ta" ? "பொருத்தங்கள்" : "matches"}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="card shadow-sm overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-500/5 text-foreground border-b border-line sticky top-0 font-bold">
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
                      <ShieldCheck className="w-3.5 h-3.5 inline text-brand-fg" />
                    </th>
                    <th className="py-3 px-3">{lang === "ta" ? "தீர்ப்பு" : "Verdict"}</th>
                    <th className="py-3 px-2 text-center">{lang === "ta" ? "விவரம்" : "Details"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft text-foreground">
                  {filteredMatches.map((m, idx) => {
                    const rowKey = `${m.target_nakshatra_number}-${m.target_pada}`;
                    const isExpanded = expandedKey === rowKey;
                    return (
                      <React.Fragment key={rowKey}>
                        <tr
                          onClick={() => setExpandedKey(isExpanded ? null : rowKey)}
                          className={`hover:bg-brand-500/5 cursor-pointer transition-colors ${
                            m.rajju_dosha ? "bg-brand-500/10" : ""
                          } ${isExpanded ? "bg-brand-500/10 border-l-4 border-brand-500" : ""}`}
                        >
                          <td className="py-2.5 px-3 text-muted text-sm">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-foreground">
                              {lang === "ta" ? m.target_nakshatra_ta : m.target_nakshatra}{" "}
                              <span className="text-brand-fg-strong">P{m.target_pada}</span>
                            </div>
                            <div className="text-[11px] text-muted">
                              {lang === "ta" ? m.target_rasi_ta : m.target_rasi} ({m.target_rasi_lord}) •{" "}
                              {m.target_rasi_element}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-base text-foreground">
                            {m.ashta_koota_total}/36
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-base text-success">
                            {m.tamil_compatible_count}/10
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-sm border ${
                                m.score_percentage >= 70 && !m.rajju_dosha
                                  ? "bg-success/10 text-success border-success"
                                  : m.score_percentage >= 50 && !m.rajju_dosha
                                  ? "bg-warning/10 text-warning border-warning"
                                  : "bg-brand-500/10 text-brand-fg-strong border-brand-500"
                              }`}
                            >
                              {m.score_percentage}%
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <Stars count={m.like_rate} />
                              <span className="text-[10px] text-muted leading-none">
                                {lang === "ta" ? m.like_rate_label_ta : m.like_rate_label}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  m.rajju_dosha ? "bg-brand-600" : "bg-success"
                                }`}
                                title={m.rajju_dosha ? "Rajju Dosha" : "Rajju Safe"}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-xs text-foreground leading-tight">
                              {lang === "ta" ? m.verdict_ta : m.verdict}
                            </div>
                            {m.rajju_dosha && (
                              <div className="text-[10px] text-brand-fg-strong flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> Rajju:{" "}
                                {lang === "ta" ? m.rajju_type_ta : m.rajju_type}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              className="p-1 rounded-lg bg-surface-2 border border-line text-foreground hover:bg-brand-500/10"
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
                          <tr className="bg-surface-2 border-b-2 border-brand-500 animate-fade-in">
                            <td colSpan={9} className="p-4 sm:p-6 space-y-4">
                              <div className="border-b border-border-soft pb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-brand-fg-strong flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-brand-fg" />
                                  {lang === "ta"
                                    ? `தமிழ் 10 பொருத்தங்கள் & அஷ்டகூட விரிவான அட்டவணை (${m.target_nakshatra_ta} - பாதம் ${m.target_pada})`
                                    : `Tamil 10-Porutham & Ashta Koota Breakdown (${m.target_nakshatra} - Pada ${m.target_pada})`}
                                </span>
                                <span className="text-[11px] text-muted">
                                  {m.tamil_compatible_count}/10{" "}
                                  {lang === "ta" ? "பொருத்தங்கள் கூடின" : "Matched"}
                                </span>
                              </div>

                              {/*
                                FIX (10-Porutham grid): this used to read `Object.entries(m.tamil_10_porutham)`
                                and check `p.compatible`. `tamil_10_porutham` is an ARRAY of items — see
                                backend/app/services/porutham.py's `calculate_tamil_10_porutham()`, which
                                returns a list of dicts shaped
                                  { key, name, name_ta, is_compatible, description, description_ta }
                                — there is no `compatible` field, only `is_compatible`. Because the check
                                read the wrong key, `p.compatible` was always `undefined` (falsy), so EVERY
                                item rendered the red ✕ / "Not Matched" state regardless of its real value —
                                exactly the "6/10 says matched but everything below shows wrong" symptom.
                                The 6/10 (or 8/10) count itself was always correct, because that count comes
                                from a different, correctly-named field: `m.tamil_compatible_count`, computed
                                server-side in backend/app/api/porutham.py's `_build_star_matches()`. Now maps
                                the array directly and reads `p.is_compatible`.
                              */}
                              {m.tamil_10_porutham && (
                                <div>
                                  <div className="text-[11px] font-bold text-muted mb-2">
                                    {lang === "ta"
                                      ? "தென்னிந்திய 10 பொருத்த விவரங்கள்:"
                                      : "South Indian 10 Poruthams:"}
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                    {m.tamil_10_porutham.map((p: any, pIdx: number) => (
                                      <div
                                        key={p.key || pIdx}
                                        className={`p-2 rounded-xl border flex flex-col justify-between ${
                                          p.is_compatible
                                            ? "bg-success/10 border-success text-success"
                                            : "bg-brand-500/10 border-brand-500/30 text-brand-fg-strong"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-bold text-[11px] truncate">
                                            {lang === "ta" ? p.name_ta : p.name}
                                          </span>
                                          {p.is_compatible ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                          ) : (
                                            <XCircle className="w-3.5 h-3.5 text-brand-fg shrink-0" />
                                          )}
                                        </div>
                                        <div className="text-[10px] text-muted line-clamp-2">
                                          {lang === "ta" ? p.description_ta : p.description}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/*
                                FIX (Ashta Koota grid): this used to read
                                `Object.entries(m.ashta_koota)` and treat every VALUE as a kuta object with
                                `.name_ta` / `.obtained` / `.max_points`. But `m.ashta_koota` is the dict
                                returned by `calculate_ashta_koota()`:
                                  { total_points: number, max_points: 36.0, kutas: [ {..8 kutas..} ] }
                                so `Object.entries()` produced exactly THREE entries — "total_points" (a
                                number), "max_points" (a number) and "kutas" (an array) — and `.name_ta` /
                                `.obtained` do not exist on any of those, so every box rendered blank with
                                just the literal " / " left over from `{ak.obtained} / {ak.max_points}`.
                                That is precisely the "36 pulli shows no numbers" symptom, and it's why there
                                were only 3 empty boxes instead of the 8 named kutas (Varna, Vashya, Tara,
                                Yoni, Graha Maitri, Gana, Bhakoot, Nadi). Now iterates `m.ashta_koota.kutas`
                                and reads each kuta's real fields (`obtained_points`, `max_points`, `status`).
                              */}
                              {m.ashta_koota && (
                                <div className="pt-2 border-t border-border-soft">
                                  <div className="text-[11px] font-bold text-muted mb-2 flex items-center justify-between">
                                    <span>
                                      {lang === "ta"
                                        ? "அஷ்டகூட 36-புள்ளி விவரங்கள்:"
                                        : "Ashta Koota 36-Point Breakdown:"}
                                    </span>
                                    <span className="text-brand-fg-strong font-bold text-xs">
                                      {m.ashta_koota.total_points} / {m.ashta_koota.max_points ?? 36}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                                    {(m.ashta_koota.kutas || []).map((ak: any, akIdx: number) => (
                                      <div
                                        key={ak.name || akIdx}
                                        className="bg-brand-500/5 p-2 rounded-xl border border-border-soft text-center"
                                      >
                                        <div className="text-[10px] text-muted mb-0.5 truncate">
                                          {lang === "ta" ? ak.name_ta : ak.name}
                                        </div>
                                        <div className="font-bold text-brand-fg-strong text-base">
                                          {ak.obtained_points} / {ak.max_points}
                                        </div>
                                        {ak.status && (
                                          <div className="text-[9px] text-muted mt-0.5 truncate">
                                            {ak.status}
                                          </div>
                                        )}
                                      </div>
                                    ))}
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
              <div className="p-8 text-center text-muted text-sm">
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

export default StarMatchFinder;