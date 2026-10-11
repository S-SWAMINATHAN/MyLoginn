"use client";

import React from "react";
import { ChartResponse } from "@/lib/types";
import { nameTa, placeTa, timeTa } from "@/lib/taText";
import { to12h } from "@/lib/timeFormat";
import {
  User,
  Users,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Home,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Compass
} from "lucide-react";

interface BioDataCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
  /** Hide father / mother names when the report already prints them (no repetition). */
  omitParentNames?: boolean;
}

export const BioDataCard: React.FC<BioDataCardProps> = ({ chart, lang, omitParentNames = false }) => {
  const bio = chart.bio_data || {};
  const d = chart.basic_details || {};
  const ta = lang === "ta";
  // names and places typed in English are shown in Tamil on Tamil pages
  const N = (v: string) => (ta && v !== "—" ? nameTa(v) : v);

  // Check if at least some bio data is present
  const hasParentsData =
    bio.father_name ||
    bio.mother_name ||
    bio.gothram ||
    bio.kula_deivam ||
    bio.native_place ||
    bio.caste_subcaste ||
    bio.siblings ||
    chart.parent_name;

  const hasCandidateData =
    bio.education ||
    bio.occupation ||
    bio.annual_income ||
    bio.height;

  const hasContactData =
    bio.phone ||
    chart.phone ||
    bio.alternate_phone ||
    bio.email ||
    chart.email ||
    bio.residence_address;

  // Fallbacks
  const fatherName = N(bio.father_name || chart.parent_name || "—");
  const fatherWork = bio.father_occupation || "—";
  const motherName = N(bio.mother_name || "—");
  const motherWork = bio.mother_occupation || "—";
  const gothram = N(bio.gothram || "—");
  const nativePlace = ta && bio.native_place ? placeTa(bio.native_place) : bio.native_place || "—";
  const kulaDeivam = N(bio.kula_deivam || chart.family_details || "—");
  const caste = N(bio.caste_subcaste || "—");
  const siblings = bio.siblings || "—";

  const education = bio.education || "—";
  const occupation = bio.occupation || "—";
  const income = bio.annual_income || "—";
  const height = bio.height || "—";

  const phone = bio.phone || chart.phone || "—";
  const altPhone = bio.alternate_phone || "—";
  const email = bio.email || chart.email || "—";
  const address = bio.residence_address || "—";

  return (
    <div className="hand-card p-6 sm:p-8 relative overflow-hidden bg-[#fffdfa] border-2 border-[#a3917a]/40 shadow-lg">
      {/* Decorative Traditional Corner Sloka */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#b03726]/30 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-script text-[#b03726]">ஸ்ரீ</span>
            <h2 className="text-xl sm:text-2xl font-bold font-script text-[#2b2117]">
              {lang === "ta"
                ? "ஜாதக சுயவிவரக் குறிப்பு & பெற்றோர் விபரம்"
                : "Candidate Horoscope Bio-Data & Family Particulars"}
            </h2>
          </div>
          <p className="text-xs text-[#6f6049] font-tamil mt-1">
            {lang === "ta"
              ? "— திருமணப் பொருத்தம் மற்றும் சம்பூர்ண ஜாதகத்திற்கான குடும்ப சுயவிவரக் குறிப்பு —"
              : "— Comprehensive Family Background & Matrimonial Bio-Data Summary —"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#b03726]/10 text-[#8e2b1c] border border-[#b03726]/20 font-tamil flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-[#b03726]" />
            <span>{lang === "ta" ? "சுபயோக சுபமஸ்து" : "Subhamastu"}</span>
          </span>
        </div>
      </div>

      {/* Grid of 3 Pillars: Candidate, Parents, Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Candidate Particulars */}
        <div className="bg-[#fff8ee]/80 border border-[#8b5a2b]/25 rounded-2xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#8b5a2b]/20">
            <User className="w-4 h-4 text-[#b03726]" />
            <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
              {lang === "ta" ? "ஜாதகர் விபரங்கள்" : "Candidate Particulars"}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs handwritten-tamil flex-1">
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "பெயர்:" : "Full Name:"}</span>
              <span className="font-bold text-[#2b2117]">{lang === "en" && chart.name_en ? chart.name_en : ta ? nameTa(chart.name) : chart.name} ({chart.gender === "male" ? (lang === "ta" ? "ஆண்" : "Male") : (lang === "ta" ? "பெண்" : "Female")})</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "பிறந்த தேதி & நேரம்:" : "DOB & Time:"}</span>
              <span className="font-semibold text-[#2b2117] text-right">{chart.date_of_birth} · {ta ? timeTa(to12h(chart.time_of_birth)) : to12h(chart.time_of_birth)}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "பிறந்த ஊர்:" : "Place of Birth:"}</span>
              <span className="font-semibold text-[#2b2117] text-right truncate max-w-[150px]" title={chart.place}>{chart.place}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "ராசி & நட்சத்திரம்:" : "Rasi & Star:"}</span>
              <span className="font-bold text-[#8e2b1c] text-right">
                {lang === "ta" ? d.rasi_ta : d.rasi} · {lang === "ta" ? d.nakshatram_ta : d.nakshatram} ({ta ? `${d.pada}ம் பாதம்` : `pada ${d.pada}`})
              </span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "லக்னம்:" : "Lagna:"}</span>
              <span className="font-bold text-[#8e2b1c]">{lang === "ta" ? `${d.lagnam_ta} லக்னம்` : d.lagnam}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "கல்வித் தகுதி:" : "Education:"}</span>
              <span className="font-semibold text-[#2b2117] text-right">{education}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "தொழில் / உத்தியோகம்:" : "Profession:"}</span>
              <span className="font-semibold text-[#2b2117] text-right">{occupation}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "வருமானம்:" : "Income:"}</span>
              <span className="font-semibold text-[#2b2117]">{income}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "உயரம் / உடல்வாகு:" : "Height:"}</span>
              <span className="font-semibold text-[#2b2117]">{height}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Parents & Family Details */}
        <div className="bg-[#fff8ee]/80 border border-[#8b5a2b]/25 rounded-2xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#8b5a2b]/20">
            <Users className="w-4 h-4 text-[#b03726]" />
            <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
              {lang === "ta" ? "பெற்றோர் & குடும்பம்" : "Parents & Family Background"}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs handwritten-tamil flex-1">
            {!omitParentNames && (
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "தந்தை பெயர்:" : "Father's Name:"}</span>
              <span className="font-bold text-[#2b2117]">{fatherName}</span>
            </div>
            )}

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "தந்தை தொழில்:" : "Father's Work:"}</span>
              <span className="font-semibold text-[#2b2117]">{fatherWork}</span>
            </div>

            {!omitParentNames && (
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "தாய் பெயர்:" : "Mother's Name:"}</span>
              <span className="font-bold text-[#2b2117]">{motherName}</span>
            </div>
            )}

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "தாய் தொழில்:" : "Mother's Work:"}</span>
              <span className="font-semibold text-[#2b2117]">{motherWork}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "கோத்திரம் / குலம்:" : "Gothram / Kulam:"}</span>
              <span className="font-semibold text-[#8e2b1c]">{gothram}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "பூர்வீகம் / சொந்த ஊர்:" : "Native Town:"}</span>
              <span className="font-semibold text-[#2b2117]">{nativePlace}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "குலதெய்வம் & கோவில்:" : "Kula Deivam:"}</span>
              <span className="font-semibold text-[#8e2b1c] text-right truncate max-w-[150px]" title={kulaDeivam}>{kulaDeivam}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "சாதி / உட்பிரிவு:" : "Caste / Sub-caste:"}</span>
              <span className="font-semibold text-[#2b2117]">{caste}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6f6049]">{lang === "ta" ? "உடன் பிறந்தோர்:" : "Siblings:"}</span>
              <span className="font-semibold text-[#2b2117] text-right truncate max-w-[150px]" title={siblings}>{siblings}</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Contact & Astrological Seals */}
        <div className="bg-[#fff8ee]/80 border border-[#8b5a2b]/25 rounded-2xl p-4 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#8b5a2b]/20">
            <Phone className="w-4 h-4 text-[#b03726]" />
            <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
              {lang === "ta" ? "தொடர்பு விபரங்கள்" : "Contact & Residence"}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs handwritten-tamil flex-1">
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "முதன்மை கைபேசி:" : "Primary Phone:"}</span>
              <span className="font-bold text-[#2b2117] font-mono">{phone}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "வாட்ஸ்அப் / மாற்று எண்:" : "Alt / WhatsApp:"}</span>
              <span className="font-semibold text-[#2b2117] font-mono">{altPhone}</span>
            </div>

            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">{lang === "ta" ? "மின்னஞ்சல்:" : "Email:"}</span>
              <span className="font-semibold text-[#2b2117] truncate max-w-[150px]" title={email}>{email}</span>
            </div>

            <div className="border-b border-black/5 pb-2">
              <span className="text-[#6f6049] block mb-0.5">{lang === "ta" ? "வசிப்பிட முகவரி:" : "Residential Address:"}</span>
              <span className="font-semibold text-[#2b2117] block leading-relaxed">{address}</span>
            </div>

            {/* Traditional Vedic Bio-Data Seal */}
            <div className="mt-3 p-2.5 bg-[#fffaf0] border border-[#8b5a2b]/20 rounded-xl text-center space-y-1">
              <div className="text-[11px] font-bold text-[#8e2b1c] font-cinzel">॥ மங்களம் உண்டாகுக ॥</div>
              <p className="text-[10px] text-[#6f6049] italic leading-tight">
                {lang === "ta"
                  ? "மாதா, பிதா, குரு, தெய்வம் ஆசியுடன் சுப காரியங்கள் யாவும் தடையின்றி இனிதே நிறைவேற வாழ்த்துகள்."
                  : "May all auspicious endeavours be blessed with divine grace, longevity and prosperity."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
