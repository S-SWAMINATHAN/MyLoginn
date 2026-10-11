"use client";

import React from "react";
import { BasicBirthDetails } from "@/lib/astrology/types";
import {
  Compass,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  ShieldCheck,
  Star,
  Activity,
  TreePine,
  Feather
} from "lucide-react";

interface PanchangamDetailsCardProps {
  details: BasicBirthDetails;
  lang: "ta" | "en";
}

export const PanchangamDetailsCard: React.FC<PanchangamDetailsCardProps> = ({ details, lang }) => {
  const isAmrita = details.subha_yogam === "Amrita Yoga";
  const isSiddha = details.subha_yogam === "Siddha Yoga";
  const isMarana = details.subha_yogam === "Marana Yoga";

  return (
    <div className="hand-card p-6 sm:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#a3917a]/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-script text-[#2b2117] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#b03726]" />
              {lang === "ta"
                ? "பஞ்சாங்க சுப யோக விவரங்கள்"
                : "Panchangam Elements & Subha Yoga"}
            </h3>
            <p className="text-xs text-[#6f6049] font-tamil">
              {lang === "ta"
                ? "லக்னம், ராசி, 5 பஞ்சாங்க அங்கங்கள், சுப யோகம் மற்றும் நட்சத்திரக் கூறுகள்"
                : "Lagna, Moon sign, 5 Panchangam limbs, Dina Subha Yoga & Nakshatra attributes"}
            </p>
          </div>
        </div>

        {/* Subha Yoga Status Badge */}
        {details.subha_yogam && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold font-tamil shadow-xs ${
              isAmrita
                ? "bg-emerald-50 border-emerald-600/40 text-emerald-900"
                : isSiddha
                ? "bg-amber-50 border-amber-600/40 text-amber-950"
                : isMarana
                ? "bg-rose-50 border-rose-600/40 text-rose-950"
                : "bg-blue-50 border-blue-600/40 text-blue-950"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#6f6049] font-mono">
                {lang === "ta" ? "பஞ்சாங்க சுப யோகம்" : "Dina Subha Yoga"}
              </span>
              <span className="text-sm font-extrabold text-[#2b2117]">
                {lang === "ta" ? details.subha_yogam_ta : details.subha_yogam}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Core Pillars: Lagna, Rasi & Janma Star, Subha Yoga */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Lagnam (Ascendant) Spotlight */}
        <div className="bg-[#fffcf5] border border-[#a3917a]/50 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-[#b03726]/60 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8e2b1c] uppercase font-script flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#b03726]" />
              {lang === "ta" ? "லக்னம் (Ascendant)" : "Lagna (Ascendant)"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f0e5cc] border border-[#a3917a]/40 text-[#8e2b1c] font-mono font-bold">
              1st House
            </span>
          </div>

          <div className="my-1">
            <h4 className="text-xl font-bold text-[#2b2117] font-script flex items-baseline gap-2">
              <span>{lang === "ta" ? details.lagnam_ta : details.lagnam}</span>
              <span className="text-xs text-[#b03726] font-mono">
                {details.lagnam_dms || `${Math.floor(details.lagnam_degree)}°`}
              </span>
            </h4>
          </div>

          <div className="space-y-1 text-xs text-[#2b2117] font-tamil mt-2 pt-2 border-t border-[#a3917a]/30">
            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "லக்னாதிபதி:" : "Lagna Lord:"}</span>
              <span className="font-bold text-[#2b2117]">
                {lang === "ta" ? details.lagnam_lord_ta : details.lagnam_lord}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "நட்சத்திரம்:" : "Lagna Star:"}</span>
              <span className="font-semibold text-[#8e2b1c]">
                {lang === "ta" ? details.lagnam_nakshatram_ta : details.lagnam_nakshatram}{" "}
                ({lang === "ta" ? "பாதம்" : "Pada"} {details.lagnam_pada})
              </span>
            </div>
            {details.lagnam_navamsa_ta && (
              <div className="flex justify-between">
                <span className="text-[#6f6049]">{lang === "ta" ? "நவாம்ச லக்னம்:" : "Navamsa Lagna:"}</span>
                <span className="font-medium text-[#2b2117]">
                  {lang === "ta" ? details.lagnam_navamsa_ta : details.lagnam_navamsa}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Rasi (Moon Sign) & Janma Nakshatra */}
        <div className="bg-[#fffcf5] border border-[#a3917a]/50 rounded-2xl p-4 flex flex-col justify-between hover:border-[#b03726]/60 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8e2b1c] uppercase font-script flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-[#b03726]" />
              {lang === "ta" ? "ராசி & நட்சத்திரம்" : "Rasi & Janma Star"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f0e5cc] border border-[#a3917a]/40 text-[#2b2117] font-mono">
              Janma Rasi
            </span>
          </div>

          <div className="my-1">
            <h4 className="text-xl font-bold text-[#2b2117] font-script flex items-baseline gap-2">
              <span>{lang === "ta" ? details.rasi_ta : details.rasi}</span>
              <span className="text-xs text-[#6f6049] font-tamil font-normal">
                ({lang === "ta" ? "அதிபதி:" : "Lord:"} {lang === "ta" ? details.rasi_lord_ta : details.rasi_lord})
              </span>
            </h4>
          </div>

          <div className="space-y-1 text-xs text-[#2b2117] font-tamil mt-2 pt-2 border-t border-[#a3917a]/30">
            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "ஜென்ம நட்சத்திரம்:" : "Nakshatra:"}</span>
              <span className="font-bold text-[#8e2b1c]">
                {lang === "ta" ? details.nakshatram_ta : details.nakshatram} - {lang === "ta" ? "பாதம்" : "Pada"} {details.pada}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "நட்சத்திராதிபதி:" : "Star Lord:"}</span>
              <span className="font-semibold text-[#2b2117]">
                {lang === "ta" ? details.nakshatra_lord_ta : details.nakshatra_lord}
              </span>
            </div>
            {details.nakshatra_deity && (
              <div className="flex justify-between">
                <span className="text-[#6f6049]">{lang === "ta" ? "அதிதேவதை:" : "Deity:"}</span>
                <span className="font-medium text-[#2b2117]">{details.nakshatra_deity}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Subha Yoga Significance */}
        <div className="bg-[#fffcf5] border border-[#a3917a]/50 rounded-2xl p-4 flex flex-col justify-between hover:border-[#b03726]/60 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#8e2b1c] uppercase font-script flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#b03726]" />
              {lang === "ta" ? "சுப யோக பலன்" : "Subha Yoga Verdict"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#f0e5cc] border border-[#a3917a]/40 text-[#8e2b1c] font-mono">
              Dina Phala
            </span>
          </div>

          <div className="my-1">
            <h4 className="text-lg font-bold text-[#8e2b1c] font-script">
              {lang === "ta" ? details.subha_yogam_ta : details.subha_yogam}
            </h4>
            <p className="text-xs text-[#6f6049] font-tamil mt-1 line-clamp-2">
              {lang === "ta" ? details.subha_yogam_desc_ta : details.subha_yogam_desc}
            </p>
          </div>

          <div className="text-xs text-[#2b2117] font-tamil mt-2 pt-2 border-t border-[#a3917a]/30 flex justify-between">
            <span className="text-[#6f6049]">{lang === "ta" ? "அயனாம்சம்:" : "Ayanamsa:"}</span>
            <span className="font-mono font-bold text-[#2b2117]">
              {details.ayanamsa_dms || `${details.ayanamsa_value}°`} (Lahiri)
            </span>
          </div>
        </div>
      </div>

      {/* Five Panchangam Angas (5 பஞ்சாங்க உறுப்புகள்) */}
      <div>
        <h4 className="text-xs font-bold text-[#8e2b1c] uppercase font-script tracking-wider mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#b03726]" />
          {lang === "ta" ? "பஞ்சாங்க ஐந்தங்க விவரங்கள் (Five Limbs of Panchangam)" : "Five Limbs of Panchangam"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Thithi */}
          <div className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-[#8e2b1c] font-semibold font-tamil uppercase">
              {lang === "ta" ? "1. திதி (Tithi)" : "1. Tithi"}
            </span>
            <span className="text-sm font-bold text-[#2b2117] font-tamil my-1 truncate">
              {lang === "ta" ? details.thithi_ta : details.thithi}
            </span>
            <span className="text-[10px] text-[#6f6049] font-tamil">
              {lang === "ta" ? details.paksha_ta : details.paksha_en}
            </span>
          </div>

          {/* 2. Vaaram */}
          <div className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-[#8e2b1c] font-semibold font-tamil uppercase">
              {lang === "ta" ? "2. வாரம் (Vaaram)" : "2. Vaaram"}
            </span>
            <span className="text-sm font-bold text-[#2b2117] font-tamil my-1 truncate">
              {lang === "ta" ? details.vaaram_ta : details.vaaram}
            </span>
            <span className="text-[10px] text-[#6f6049] font-tamil">
              {lang === "ta" ? `அதிபதி: ${details.vaaram_lord_ta}` : `Lord: ${details.vaaram_lord}`}
            </span>
          </div>

          {/* 3. Nakshatra */}
          <div className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-[#8e2b1c] font-semibold font-tamil uppercase">
              {lang === "ta" ? "3. நட்சத்திரம் (Star)" : "3. Nakshatra"}
            </span>
            <span className="text-sm font-bold text-[#2b2117] font-tamil my-1 truncate">
              {lang === "ta" ? details.nakshatram_ta : details.nakshatram}
            </span>
            <span className="text-[10px] text-[#8e2b1c] font-tamil font-semibold">
              {lang === "ta" ? `பாதம் ${details.pada}` : `Pada ${details.pada}`}
            </span>
          </div>

          {/* 4. Nithya Yoga */}
          <div className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-[#8e2b1c] font-semibold font-tamil uppercase">
              {lang === "ta" ? "4. நித்திய யோகம்" : "4. Nithya Yoga"}
            </span>
            <span className="text-sm font-bold text-[#2b2117] font-tamil my-1 truncate">
              {lang === "ta" ? details.yogam_ta : details.yogam}
            </span>
            <span className="text-[10px] text-[#6f6049] font-tamil">
              {lang === "ta" ? "27 யோகங்களில் ஒன்று" : "Vedic Nithya Yoga"}
            </span>
          </div>

          {/* 5. Karana */}
          <div className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-[#8e2b1c] font-semibold font-tamil uppercase">
              {lang === "ta" ? "5. கரணம் (Karana)" : "5. Karana"}
            </span>
            <span className="text-sm font-bold text-[#2b2117] font-tamil my-1 truncate">
              {lang === "ta" ? details.karanam_ta : details.karanam}
            </span>
            <span className="text-[10px] text-[#6f6049] font-tamil">
              {lang === "ta" ? "அரைத் திதி அளவு" : "Half-Tithi Limb"}
            </span>
          </div>
        </div>
      </div>

      {/* Nakshatra Characteristics Grid (நட்சத்திர குணங்கள் & பொருத்த கூறுகள்) */}
      <div>
        <h4 className="text-xs font-bold text-[#8e2b1c] uppercase font-script tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#b03726]" />
          {lang === "ta" ? "நட்சத்திரப் பொருத்தக் கூறுகள் (Nakshatra Compatibility Traits)" : "Nakshatra Attributes"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { labelTa: "கணம்", labelEn: "Ganam", valTa: details.ganam_ta, valEn: details.ganam },
            { labelTa: "யோனி", labelEn: "Yoni", valTa: details.yoni_ta, valEn: details.yoni },
            { labelTa: "ரஜ்ஜு", labelEn: "Rajju", valTa: details.rajju_ta, valEn: details.rajju },
            { labelTa: "பூதம்", labelEn: "Element", valTa: details.bootham_ta, valEn: details.bootham },
            { labelTa: "நாடி", labelEn: "Nadi", valTa: details.nadi_ta, valEn: details.nadi },
            { labelTa: "விருட்சம்", labelEn: "Tree", valTa: details.vriksham_ta, valEn: details.vriksham_ta },
            { labelTa: "பறவை", labelEn: "Bird", valTa: details.pakshi_ta, valEn: details.pakshi_ta },
            { labelTa: "மிருகம்", labelEn: "Animal", valTa: details.mirugam_ta, valEn: details.mirugam_ta }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] text-[#6f6049] font-tamil uppercase font-medium">
                {lang === "ta" ? item.labelTa : item.labelEn}
              </span>
              <span className="text-xs font-bold text-[#2b2117] font-tamil my-1 truncate">
                {lang === "ta" ? item.valTa || "—" : item.valEn || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High-Precision Ephemeris Astronomical Timings */}
      {details.sun_rise && (
        <div className="pt-2 border-t border-[#a3917a]/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#8e2b1c] uppercase font-script tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#b03726]" />
              {lang === "ta" ? "சூரிய உதயம், அஸ்தமனம் & நாழிகை விவரங்கள்" : "Astronomical Timings & Nazhigai"}
            </h4>
            <span className="text-[10px] text-[#6f6049] font-mono">
              Swiss Ephemeris JPL DE431/441
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { labelTa: "சூரியோதயம்", labelEn: "Sunrise", val: details.sun_rise },
              { labelTa: "சூரிய அஸ்தமனம்", labelEn: "Sunset", val: details.sun_set },
              { labelTa: "பகல் அளவு", labelEn: "Day Length", val: lang === "ta" ? details.dinamani : details.dinamani_en },
              { labelTa: "இரவு அளவு", labelEn: "Night Length", val: lang === "ta" ? details.ratrimana : details.ratrimana_en },
              { labelTa: "உதயாதி நாழிகை", labelEn: "Udhayadhi Nazhigai", val: lang === "ta" ? details.udhayadhi_nazhigai : details.udhayadhi_nazhigai_en },
              { labelTa: "ராகு காலம்", labelEn: "Rahu Kalam", val: details.rahu_kalam },
              { labelTa: "எமகண்டம்", labelEn: "Yamagandam", val: details.yamagandam }
            ].map((timing, idx) => (
              <div key={idx} className="bg-[#fffcf5] border border-[#a3917a]/40 rounded-xl p-2.5 text-center flex flex-col justify-between shadow-2xs">
                <span className="text-[10px] text-[#6f6049] font-tamil uppercase font-semibold">
                  {lang === "ta" ? timing.labelTa : timing.labelEn}
                </span>
                <span className="text-xs font-bold text-[#8e2b1c] font-mono my-1 truncate">
                  {timing.val || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};