"use client";

import React, { useMemo, useRef, useState } from "react";
import { BabyNameResult, BabyNameSuggestionItem } from "@/lib/astrology/types";
import { Baby, Hash, Loader2, FileDown, Printer } from "lucide-react";
import jsPDF from "jspdf";
import { captureNode, addCanvasToPdf, safeFileName } from "@/lib/astrology/pdfExport";
import { requireUnlock } from "@/lib/astrology/paywall";

interface BabyNameSuggestionsProps {
  babyNames: BabyNameResult;
  lang: "ta" | "en";
}

/**
 * Baby-name results.
 *
 * WHAT CHANGED
 * ------------
 * 1. LANGUAGE. Every name and meaning follows the selected language — Tamil
 *    script in Tamil, Latin in English. Previously the Latin spelling was
 *    always the headline, so Tamil readers got English names.
 * 2. VOLUME. The backend now returns names for all four pada syllables of
 *    the Nakshatra (birth pada first and marked), so this shows tens of
 *    names instead of three. They are grouped by syllable to stay readable,
 *    and the real count is stated rather than implied.
 * 3. FILTERS. Gender and religion can be narrowed here without re-running
 *    the search, on top of whatever was chosen when generating.
 * 4. PDF. The list downloads as an A4 sheet through the same capture
 *    pipeline as the single-page Jathagam PDF, so Tamil glyph clusters
 *    shape correctly (see lib/pdfExport.ts for why that matters).
 */
export const BabyNameSuggestions: React.FC<BabyNameSuggestionsProps> = ({
  babyNames,
  lang,
}) => {
  const [filterGender, setFilterGender] = useState<"all" | "boy" | "girl">("all");
  // Numerology must never silently hide a classically-correct name, so this
  // stays OFF unless the user asks for it.
  const [onlyNumFavorable, setOnlyNumFavorable] = useState(false);
  const [generating, setGenerating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const hasNumerology =
    babyNames.numerology_birth_number !== undefined &&
    babyNames.numerology_destiny_number !== undefined;

  const groups = useMemo(() => {
    const matches = (s: BabyNameSuggestionItem) => {
      if (filterGender !== "all" && s.gender !== filterGender) return false;
      if (onlyNumFavorable && !s.numerology_is_favorable) return false;
      return true;
    };

    if (babyNames.pada_groups?.length) {
      return babyNames.pada_groups
        .map((g) => ({ ...g, names: g.names.filter(matches) }))
        .filter((g) => g.names.length > 0);
    }

    // Fallback for an older response shape that had no grouping.
    const flat = (babyNames.suggestions || []).filter(matches);
    return flat.length
      ? [
          {
            pada: babyNames.pada,
            syllable: babyNames.target_syllable || "",
            syllable_ta: babyNames.target_syllable_ta || "",
            is_birth_pada: true,
            count: flat.length,
            names: flat,
          },
        ]
      : [];
  }, [babyNames, filterGender, onlyNumFavorable]);

  const shownCount = groups.reduce((n, g) => n + g.names.length, 0);
  // Stated plainly rather than implied: how many rows the table actually has
  // for these syllables, versus how many were asked for.
  const availableCount = babyNames.available_count ?? undefined;
  const requestedLimit = babyNames.requested_limit ?? undefined;
  const totalCount = babyNames.total_count ?? babyNames.suggestions?.length ?? 0;

  const nameOf = (s: BabyNameSuggestionItem) => (lang === "ta" && s.name_ta ? s.name_ta : s.name);
  const altOf = (s: BabyNameSuggestionItem) => (lang === "ta" ? s.name : s.name_ta);
  const meaningOf = (s: BabyNameSuggestionItem) =>
    lang === "ta" && s.meaning_ta ? s.meaning_ta : s.meaning;
  const genderLabel = (g: string) =>
    lang === "ta" ? (g === "boy" ? "ஆண்" : "பெண்") : g === "boy" ? "Boy" : "Girl";

  // See GeneralNameGenerator: two print sheets live on this page, so each
  // Print tags the body to say which one it wants.
  const printThisSection = () => {
    if (!requireUnlock()) return;
    document.body.dataset.printTarget = "nakshatra-names";
    const clear = () => {
      delete document.body.dataset.printTarget;
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
    setTimeout(clear, 1000);
  };

  const handleDownload = async () => {
    const el = sheetRef.current;
    if (!el || !requireUnlock()) return;
    try {
      setGenerating(true);
      const canvas = await captureNode(el, { scale: 2, background: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      addCanvasToPdf(pdf, canvas, { background: "#ffffff" });
      pdf.save(`${safeFileName(babyNames.nakshatra)}_Baby_Names_Pada${babyNames.pada}.pdf`);
    } catch (e) {
      console.error(e);
      alert(lang === "ta" ? "PDF உருவாக்குவதில் பிழை." : "Could not generate the PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
      active
        ? "bg-brand-600 border-brand-500 text-white shadow-sm"
        : "bg-surface-2 border-line text-foreground hover:border-brand-500"
    }`;

  return (
    <div className="card p-6 sm:p-8 text-foreground">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-border-soft">
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Baby className="w-5 h-5 text-brand-fg" />
            {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
          </h3>
          <p className="text-xs text-muted mt-1">
            {lang === "ta"
              ? `நட்சத்திரம் ${babyNames.nakshatra_ta} · பாதம் ${babyNames.pada} — நான்கு பாத எழுத்துகளின் பெயர்கள்`
              : `Star ${babyNames.nakshatra} · Pada ${babyNames.pada} — names for all four pada syllables`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="chip-brand">
            {lang === "ta"
              ? `${shownCount} / ${totalCount} பெயர்கள்`
              : `${shownCount} of ${totalCount} names`}
            {availableCount !== undefined &&
              requestedLimit !== undefined &&
              availableCount < requestedLimit && (
                <span className="ml-1 opacity-75">
                  {lang === "ta"
                    ? `(தரவுத்தளத்தில் உள்ளவை ${availableCount})`
                    : `(${availableCount} in database)`}
                </span>
              )}
          </span>
          <button
            type="button"
            onClick={printThisSection}
            disabled={shownCount === 0}
            className="btn-secondary text-xs disabled:opacity-50"
            title={lang === "ta" ? "A4 தாளில் அச்சிடுக" : "Print on A4"}
          >
            <Printer className="w-4 h-4" />
            {lang === "ta" ? "அச்சிடுக" : "Print"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating || shownCount === 0}
            className="btn-primary text-xs disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {generating
              ? lang === "ta"
                ? "தயாராகிறது..."
                : "Preparing..."
              : lang === "ta"
              ? "PDF பதிவிறக்கம்"
              : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Starting syllables */}
      <div className="well p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted">
          {lang === "ta" ? "நாம அக்ஷரங்கள்:" : "Starting syllables:"}
        </span>
        {babyNames.starting_syllables.map((syl, i) => {
          const isBirth = i + 1 === babyNames.pada;
          const ta = babyNames.starting_syllables_ta?.[i];
          return (
            <span key={`${syl}-${i}`} className={isBirth ? "chip-brand" : "chip"}>
              {lang === "ta" && ta ? `${ta} (${syl})` : syl}
              {isBirth && (
                <span className="ml-1 opacity-80">
                  {lang === "ta" ? "· ஜென்ம பாதம்" : "· birth pada"}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {hasNumerology && (
        <div className="well p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-brand-fg" />
              {lang === "ta" ? "எண் கணிதம் (தனி முறை)" : "Numerology (separate system)"}
            </span>
            <span className="text-muted">
              {lang === "ta" ? "பிறப்பு எண்" : "Birth No."}:{" "}
              <b>{babyNames.numerology_birth_number}</b>
            </span>
            <span className="text-muted">
              {lang === "ta" ? "விதி எண்" : "Destiny No."}:{" "}
              <b>{babyNames.numerology_destiny_number}</b>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyNumFavorable((v) => !v)}
            className={chip(onlyNumFavorable)}
          >
            {lang === "ta" ? "எண் கணிதப்படி உகந்தவை மட்டும்" : "Numerology-favourable only"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs font-semibold text-muted mr-1">
          {lang === "ta" ? "பாலினம்:" : "Gender:"}
        </span>
        {(["all", "boy", "girl"] as const).map((g) => (
          <button key={g} type="button" onClick={() => setFilterGender(g)} className={chip(filterGender === g)}>
            {g === "all"
              ? lang === "ta"
                ? "அனைத்தும்"
                : "All"
              : g === "boy"
              ? lang === "ta"
                ? "ஆண் குழந்தை"
                : "Baby Boy"
              : lang === "ta"
              ? "பெண் குழந்தை"
              : "Baby Girl"}
          </button>
        ))}

      </div>

      {shownCount === 0 ? (
        <div className="well p-6 text-center text-sm text-muted">
          {lang === "ta"
            ? "இந்த வடிகட்டலுக்குப் பெயர்கள் இல்லை. இந்த எழுத்துகளுக்கு தரவுத்தளத்தில் உள்ள உண்மையான பெயர்கள் மட்டுமே காட்டப்படுகின்றன."
            : "No names match this filter. Only the real names held for these syllables are shown — none is invented to fill a gap."}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={`${g.pada}-${g.syllable}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={g.is_birth_pada ? "chip-brand" : "chip"}>
                  {lang === "ta"
                    ? `பாதம் ${g.pada} · ${g.syllable_ta || g.syllable}`
                    : `Pada ${g.pada} · ${g.syllable}`}
                </span>
                {g.is_birth_pada && (
                  <span className="text-[11px] font-semibold text-brand-fg">
                    {lang === "ta" ? "ஜென்ம பாதம்" : "Birth pada"}
                  </span>
                )}
                <span className="text-[11px] text-muted">
                  {lang === "ta" ? `${g.names.length} பெயர்கள்` : `${g.names.length} names`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.names.map((s, i) => (
                  <div key={`${s.name}-${i}`} className="well p-4 card-hover">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-base font-bold truncate">{nameOf(s)}</div>
                        {altOf(s) && <div className="text-[11px] text-muted truncate">{altOf(s)}</div>}
                      </div>
                      <span className="chip text-[10px] shrink-0">{genderLabel(s.gender)}</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-2">{meaningOf(s)}</p>
                    {s.numerology_name_number !== undefined && (
                      <div className="mt-2 pt-2 border-t border-border-soft flex items-center justify-between text-[11px]">
                        <span className="text-muted">
                          {lang === "ta" ? "பெயர் எண்" : "Name No."}{" "}
                          <b className="text-foreground">{s.numerology_name_number}</b>
                        </span>
                        <span className={s.numerology_is_favorable ? "text-success" : "text-warning"}>
                          {lang === "ta"
                            ? s.numerology_alignment_status_ta
                            : s.numerology_alignment_status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── A4 print sheet ───────────────────────────────────────────────
          Hidden on screen, and the only thing window.print() renders (see
          the @media print block in globals.css). CSS multi-column is used
          on purpose: columns fragment across pages natively, so 26 names or
          260 flow onto as many A4 sheets as they need with no slicing here
          and no page-count assumption. */}
      <div className="names-print-sheet">
        <div className="names-print-cols">
          <div className="names-print-header">
            <div className="t1">
              {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
            </div>
            <div className="t2">
              {lang === "ta"
                ? `நட்சத்திரம்: ${babyNames.nakshatra_ta} · பாதம்: ${babyNames.pada} · ${shownCount} பெயர்கள்`
                : `Star: ${babyNames.nakshatra} · Pada: ${babyNames.pada} · ${shownCount} names`}
            </div>
          </div>

          {groups.map((g) => (
            <React.Fragment key={`print-${g.pada}-${g.syllable}`}>
              <div className="names-print-section">
                {lang === "ta"
                  ? `பாதம் ${g.pada} · ${g.syllable_ta || g.syllable}${g.is_birth_pada ? " (ஜென்ம பாதம்)" : ""} — ${g.names.length}`
                  : `Pada ${g.pada} · ${g.syllable}${g.is_birth_pada ? " (birth pada)" : ""} — ${g.names.length}`}
              </div>
              {g.names.map((s, i) => (
                <div className="names-print-entry" key={`print-row-${s.name}-${i}`}>
                  <div className="print-name">
                    {i + 1}. {nameOf(s)}
                    {altOf(s) ? <span className="print-alt"> ({altOf(s)})</span> : null}
                    <span className="print-alt"> · {genderLabel(s.gender)}</span>
                  </div>
                  <div className="print-meaning">{meaningOf(s)}</div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Off-screen A4 sheet, captured for the PDF ───────────────────── */}
      <div className="fixed left-[-10000px] top-0 pointer-events-none" aria-hidden>
        <div
          ref={sheetRef}
          data-pdf-host
          style={{
            width: "794px",
            background: "#ffffff",
            padding: "40px 44px",
            color: "#111827",
            fontFamily: "'Noto Sans Tamil', 'Inter', sans-serif",
          }}
        >
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #1f56d6",
              paddingBottom: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#16337e" }}>
              {lang === "ta" ? "குழந்தை பெயர் பரிந்துரைகள்" : "Baby Name Suggestions"}
            </div>
            <div style={{ fontSize: 12, color: "#576179", marginTop: 4 }}>
              {lang === "ta"
                ? `நட்சத்திரம்: ${babyNames.nakshatra_ta} · பாதம்: ${babyNames.pada} · மொத்தம் ${shownCount} பெயர்கள்`
                : `Star: ${babyNames.nakshatra} · Pada: ${babyNames.pada} · ${shownCount} names`}
            </div>
          </div>

          {groups.map((g) => (
            <div key={`pdf-${g.pada}-${g.syllable}`} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#16337e",
                  background: "#f3f7fd",
                  padding: "5px 10px",
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                {lang === "ta"
                  ? `பாதம் ${g.pada} · ${g.syllable_ta || g.syllable}${g.is_birth_pada ? " (ஜென்ம பாதம்)" : ""}`
                  : `Pada ${g.pada} · ${g.syllable}${g.is_birth_pada ? " (birth pada)" : ""}`}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#576179" }}>
                    <th style={{ textAlign: "left", padding: "4px 8px", width: "6%" }}>#</th>
                    <th style={{ textAlign: "left", padding: "4px 8px", width: "30%" }}>
                      {lang === "ta" ? "பெயர்" : "Name"}
                    </th>
                    <th style={{ textAlign: "left", padding: "4px 8px", width: "12%" }}>
                      {lang === "ta" ? "பாலினம்" : "Gender"}
                    </th>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>
                      {lang === "ta" ? "பொருள்" : "Meaning"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.names.map((s, i) => (
                    <tr key={`pdfrow-${s.name}-${i}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "4px 8px", color: "#6b7280" }}>{i + 1}</td>
                      <td style={{ padding: "4px 8px", fontWeight: 700 }}>
                        {nameOf(s)}
                        {altOf(s) ? (
                          <span style={{ fontWeight: 400, color: "#6b7280" }}> ({altOf(s)})</span>
                        ) : null}
                      </td>
                      <td style={{ padding: "4px 8px" }}>{genderLabel(s.gender)}</td>
                      <td style={{ padding: "4px 8px" }}>{meaningOf(s)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div
            style={{
              marginTop: 18,
              paddingTop: 8,
              borderTop: "1px solid #e5e7eb",
              fontSize: 9,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            MyLoginn Astrology — {lang === "ta" ? "நட்சத்திர பாத நாமகரணம்" : "Nakshatra-Pada naming"} ·
            Swiss Ephemeris · Lahiri Ayanamsha
          </div>
        </div>
      </div>
    </div>
  );
};
