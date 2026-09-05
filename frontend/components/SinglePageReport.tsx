"use client";

import React from "react";
import { ChartResponse } from "@/lib/types";
import { RasiChart } from "./RasiChart";
import { NavamsaChart } from "./NavamsaChart";
import {
  Printer,
  Sparkles,
  Compass,
  Star,
  Moon,
  CalendarClock,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Heart,
  GraduationCap,
  Stethoscope,
  Gem,
  Sun,
} from "lucide-react";

interface SinglePageReportProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  heart: Heart,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
};

function ratingColor(rating: string): string {
  switch (rating) {
    case "Strong":
      return "bg-emerald-500";
    case "Good":
      return "bg-teal-400";
    case "Average":
      return "bg-amber-400";
    default:
      return "bg-rose-500";
  }
}

export const SinglePageReport: React.FC<SinglePageReportProps> = ({ chart, lang }) => {
  const bd = chart.basic_details;
  const sps = chart.single_page_summary;

  const doshaCards = [
    ...chart.doshas.map((d) => ({
      name: lang === "ta" ? d.name_ta : d.name,
      present: d.present,
      severity: d.severity,
      description: lang === "ta" ? d.description_ta : d.description,
    })),
    ...(sps?.saturn_transit
      ? [
          {
            name: lang === "ta" ? sps.saturn_transit.name_ta : sps.saturn_transit.name,
            present: sps.saturn_transit.present,
            severity: sps.saturn_transit.phase
              ? (lang === "ta" ? sps.saturn_transit.phase_ta || "" : sps.saturn_transit.phase)
              : "—",
            description: lang === "ta" ? sps.saturn_transit.description_ta : sps.saturn_transit.description,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top bar: title + Download PDF */}
      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ffd700]" />
          {lang === "ta" ? "சுருக்க ஜாதகம் (ஒரு பக்கம்)" : "Single-Page Jathagam"}
        </h2>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#6b1426] border border-[#ffd700]/60 rounded-xl text-xs font-bold text-[#ffd700] flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === "ta" ? "PDF பதிவிறக்கம்" : "Download PDF"}</span>
        </button>
      </div>

      {/* 1. Core Identity Header */}
      <div className="palm-leaf-dark rounded-3xl p-6 border-2 border-[#d4af37]/40 shadow-2xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#d4af37]/20 pb-4 mb-4">
          <h3 className="text-2xl font-bold font-tamil text-white">{chart.name}</h3>
          <p className="text-xs text-[#e0b87f] font-tamil">
            {chart.date_of_birth} | {chart.time_of_birth} | {chart.place} ({chart.timezone})
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <IdentityStat
            icon={<Compass className="w-4 h-4" />}
            label={lang === "ta" ? "லக்னம்" : "Lagnam (Ascendant)"}
            value={lang === "ta" ? bd.lagnam_ta : bd.lagnam}
          />
          <IdentityStat
            icon={<Moon className="w-4 h-4" />}
            label={lang === "ta" ? "ராசி" : "Rasi (Moon Sign)"}
            value={lang === "ta" ? bd.rasi_ta : bd.rasi}
          />
          <IdentityStat
            icon={<Star className="w-4 h-4" />}
            label={lang === "ta" ? "நட்சத்திரம்" : "Nakshatram (Birth Star)"}
            value={`${lang === "ta" ? bd.nakshatram_ta : bd.nakshatram} · ${lang === "ta" ? "பாதம்" : "Pada"} ${bd.pada}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <MiniFact label={lang === "ta" ? "திதி" : "Thithi"} value={lang === "ta" ? bd.thithi_ta : bd.thithi} />
          <MiniFact label={lang === "ta" ? "யோகம்" : "Yogam"} value={lang === "ta" ? bd.yogam_ta : bd.yogam} />
          <MiniFact label={lang === "ta" ? "கரணம்" : "Karanam"} value={lang === "ta" ? bd.karanam_ta : bd.karanam} />
        </div>
      </div>

      {/* 2. Charts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RasiChart kattamData={chart.rasi_kattam} chartStyle={chart.chart_style as any} lang={lang} />
        <NavamsaChart kattamData={chart.navamsa_kattam} chartStyle={chart.chart_style as any} lang={lang} />
      </div>

      {/* 3. Current Dasa / Bhukti */}
      {sps?.current_period && (
        <div className="rounded-2xl border-2 border-[#d4af37]/30 bg-[#160f12]/95 p-5 shadow-xl">
          <h3 className="text-base font-bold text-[#ffd700] font-cinzel flex items-center gap-2 mb-3">
            <CalendarClock className="w-5 h-5" />
            {lang === "ta" ? "தற்போதைய திசை - புக்தி" : "Current Dasa / Bhukti"}
          </h3>
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-[#6b1426]/60 border border-[#ffd700]/40 font-bold text-[#ffd700]">
              {lang === "ta" ? sps.current_period.mahadasha_lord_ta : sps.current_period.mahadasha_lord}{" "}
              {lang === "ta" ? "மகா திசை" : "Mahadasha"}
              <span className="block text-[10px] text-white/60 font-normal font-mono mt-0.5">
                {sps.current_period.mahadasha_start} → {sps.current_period.mahadasha_end}
              </span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#25181c] border border-[#d4af37]/30 font-bold text-white">
              {lang === "ta" ? sps.current_period.bhukti_lord_ta : sps.current_period.bhukti_lord}{" "}
              {lang === "ta" ? "புக்தி" : "Bhukti"}
              <span className="block text-[10px] text-white/60 font-normal font-mono mt-0.5">
                {sps.current_period.bhukti_start} → {sps.current_period.bhukti_end}
              </span>
            </span>
          </div>
          <p className="text-sm text-[#e0b87f] font-tamil leading-relaxed">
            {lang === "ta" ? sps.current_period.micro_prediction_ta : sps.current_period.micro_prediction}
          </p>
        </div>
      )}

      {/* 4. Dosha Checklist */}
      <div className="rounded-2xl border-2 border-[#d4af37]/30 bg-[#160f12]/95 p-5 shadow-xl">
        <h3 className="text-base font-bold text-[#ffd700] font-cinzel flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5" />
          {lang === "ta" ? "தோஷ பரிசோதனை" : "Essential Dosha Checklist"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doshaCards.map((d, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 border flex flex-col gap-1 ${
                d.present
                  ? "bg-rose-950/40 border-rose-500/40"
                  : "bg-emerald-950/30 border-emerald-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white font-tamil">{d.name}</span>
                {d.present ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-300">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {lang === "ta" ? "கண்டறியப்பட்டது" : "Detected"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {lang === "ta" ? "இல்லை" : "Not Detected"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/60 leading-snug font-tamil">{d.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Life Scorecard */}
      {sps?.life_scorecard && sps.life_scorecard.length > 0 && (
        <div className="rounded-2xl border-2 border-[#d4af37]/30 bg-[#160f12]/95 p-5 shadow-xl">
          <h3 className="text-base font-bold text-[#ffd700] font-cinzel flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            {lang === "ta" ? "வாழ்க்கை மதிப்பீடு" : "Life Scorecard"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sps.life_scorecard.map((cat, idx) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Sparkles;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <Icon className="w-3.5 h-3.5 text-[#ffd700]" />
                      {lang === "ta" ? cat.category_ta : cat.category}
                    </span>
                    <span className="text-[#e0b87f] font-mono">
                      {lang === "ta" ? cat.rating_ta : cat.rating}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${ratingColor(cat.rating)}`}
                      style={{ width: `${Math.max(4, cat.score_percentage)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 font-tamil">
                    {lang === "ta" ? cat.summary_ta : cat.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Remedies / Pariharam */}
      {sps?.remedies && (
        <div className="rounded-2xl border-2 border-[#d4af37]/30 bg-[#160f12]/95 p-5 shadow-xl">
          <h3 className="text-base font-bold text-[#ffd700] font-cinzel flex items-center gap-2 mb-4">
            <Gem className="w-5 h-5" />
            {lang === "ta" ? "பரிகாரங்கள்" : "Remedies (Pariharam)"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
            <MiniFact
              label={lang === "ta" ? "வழிபடும் தேவதை" : "Deity to Worship"}
              value={lang === "ta" ? sps.remedies.presiding_deity_ta : sps.remedies.presiding_deity}
            />
            <MiniFact
              label={lang === "ta" ? "நல்ல நாள்" : "Favorable Day"}
              value={lang === "ta" ? sps.remedies.favorable_day_ta : sps.remedies.favorable_day}
            />
            <MiniFact
              label={lang === "ta" ? "அதிர்ஷ்ட நிறம் / எண்" : "Lucky Color / Number"}
              value={`${lang === "ta" ? sps.remedies.lucky_color_ta : sps.remedies.lucky_color} / ${sps.remedies.lucky_number}`}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#ffd700] mb-1.5">
              {lang === "ta" ? "எளிய பரிகாரங்கள்" : "Simple Rituals"}
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-white/70 font-tamil">
              {(lang === "ta" ? sps.remedies.simple_rituals_ta : sps.remedies.simple_rituals).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const IdentityStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-[#25181c] border border-[#d4af37]/30 p-3">
    <div className="flex items-center gap-1.5 text-[10px] text-[#d4af37] uppercase tracking-wide mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm font-bold text-white font-tamil">{value}</p>
  </div>
);

const MiniFact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-[#1b1013] border border-[#d4af37]/20 p-2.5">
    <p className="text-[10px] text-[#d4af37]/80 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm text-white font-tamil font-medium">{value}</p>
  </div>
);