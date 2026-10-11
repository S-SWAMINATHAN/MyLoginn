"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

// 27 Nakshatras 4 Pada Nama Aksharas
const NAKSHATRA_NAMA_AKSHARAS_TA: Record<string, string[]> = {
  // Same letters as Kalai Magal prints (see backend kalai_baby_names.STAR_LETTERS).
  Ashwini: ["சு", "சே", "சோ", "லா"],
  Bharani: ["லி", "லு", "லே", "லோ"],
  Krittika: ["அ", "இ", "உ", "ஏ"],
  Rohini: ["ஒ", "வ", "வி", "வு"],
  Mrigashirsha: ["வே", "வோ", "கா", "கி"],
  Ardra: ["கு", "க", "ங", "ச"],
  Punarvasu: ["கே", "கோ", "ஹ", "ஹி"],
  Pushya: ["ஹு", "ஹே", "ஹோ", "ட"],
  Ashlesha: ["டி", "டு", "டே", "டோ"],
  Magha: ["ம", "மி", "மு", "மெ"],
  "Purva Phalguni": ["மோ", "ட", "டி", "டு"],
  "Uttara Phalguni": ["டே", "டோ", "ப", "பி"],
  Hasta: ["பு", "ஷ", "ந", "ட"],
  Chitra: ["பே", "போ", "ர", "ரி"],
  Swati: ["ரு", "ரே", "ரோ", "தா"],
  Vishakha: ["தி", "து", "தே", "தோ"],
  Anuradha: ["ந", "நி", "நு", "நெ"],
  Jyeshtha: ["நோ", "ய", "யி", "யு"],
  Moola: ["யே", "யோ", "ப", "பி"],
  "Purva Ashadha": ["பு", "த", "ப", "ட"],
  "Uttara Ashadha": ["பே", "போ", "ஜ", "ஜி"],
  Shravana: ["ஜு", "ஜே", "ஜோ", "க"],
  Dhanishta: ["க", "கி", "கு", "கெ"],
  Shatabhisha: ["கோ", "ஸ", "ஸி", "ஸு"],
  "Purva Bhadrapada": ["ஸே", "ஸோ", "த", "தி"],
  "Uttara Bhadrapada": ["து", "ஞ", "ச", "ஸ்ரீ"],
  Revati: ["தே", "தோ", "ச", "சி"],
};

export const Chapter13PanchaPakshiNama: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const samp = chart.sampoorana || {};

  const panchaPakshi = samp.pancha_pakshi_ta || d.pakshi_ta || "காகம்";
  const pakshiFriendly = samp.friendly_birds_ta || "கோழி, மயில்";
  const pakshiEnemy = samp.enemy_birds_ta || "வல்லூறு, ஆந்தை";
  const padupakshiDays = samp.padupakshi_days_ta || "வியாழன்";

  const birthNum = samp.birth_number ?? 6;
  const destinyNum = samp.destiny_number ?? 8;
  const luckyNumbers = (samp.lucky_numbers || [1, 5, 6]).join(", ");
  const luckyColors = samp.lucky_colors_ta || "மஞ்சள், வெண்மை, நீலம்";
  const luckyStones = samp.lucky_stones_ta || "வைரம், மரகதம், நீலக்கல்";
  const bestDeity = samp.lucky_deity_ta || "ஸ்ரீ மகாலட்சுமி, முருகப்பெருமான்";

  const nativeAksharas = NAKSHATRA_NAMA_AKSHARAS_TA[d.nakshatram] || ["சு", "சே", "சோ", "ல"];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 49: பஞ்ச பட்சி சாஸ்திரம் & எண் கணிதம் & நாமகரணம்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={49}
        chapterTitleTa="பகுதி 13: பட்சி, எண் & நாமகரணம்"
        chapterTitleEn="Part 13: Bird Sastra & Numerology"
        pageTitleTa="அகத்தியர் பஞ்ச பட்சி சாஸ்திரம், எண் கணிதம் & 108 நாமகரண எழுத்துக்கள்"
        pageTitleEn="Agathiyar Pancha Pakshi Sastra, Numerology & 108 Nama Aksharas"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Pancha Pakshi Card */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1.5">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ அகத்தியர் பஞ்ச பட்சி சாஸ்திரம் ✦</span>
              <span className="text-[#15803d] font-bold">ஜென்மப் பட்சி: {panchaPakshi}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="font-semibold text-[#6f6049]">நட்பு பட்சிகள்: </span><span className="font-bold text-[#2b2117]">{pakshiFriendly}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பகை பட்சிகள்: </span><span className="font-bold text-[#b91c1c]">{pakshiEnemy}</span></div>
              <div><span className="font-semibold text-[#6f6049]">படுபட்சி நாட்கள் (தவிர்க்கவும்): </span><span className="font-bold text-[#b91c1c]">{padupakshiDays}</span></div>
              <div><span className="font-semibold text-[#6f6049]">உத்தம தொழில் நேரம்: </span><span className="font-bold text-[#15803d]">அரசு & ஊண் காலங்கள்</span></div>
            </div>
          </div>

          {/* Numerology Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1.5">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ சாஸ்திர எண் கணிதம் (Chaldean Numerology) ✦</span>
              <span className="text-[#8e2b1c] font-bold">உடல் எண்: {birthNum} | உயிர் எண்: {destinyNum}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="font-semibold text-[#6f6049]">அதிர்ஷ்ட எண்கள்: </span><span className="font-bold text-[#15803d]">{luckyNumbers}</span></div>
              <div><span className="font-semibold text-[#6f6049]">அதிர்ஷ்ட வண்ணங்கள்: </span><span className="font-bold text-[#2b2117]">{luckyColors}</span></div>
              <div><span className="font-semibold text-[#6f6049]">அதிர்ஷ்ட ரத்தினங்கள்: </span><span className="font-bold text-[#2b2117]">{luckyStones}</span></div>
              <div><span className="font-semibold text-[#6f6049]">வழிபாட்டு தெய்வம்: </span><span className="font-bold text-[#8e2b1c]">{bestDeity}</span></div>
            </div>
          </div>

          {/* Nama Aksharas Table */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between items-center">
              <span>✦ குழந்தை பெயர் சூட்டும் 108 நட்சத்திர பாத எழுத்துக்கள் ✦</span>
              <span className="text-[9.5px] bg-[#8e2b1c] text-[#ffd700] px-1.5 py-0.5 rounded font-bold">
                {d.nakshatram_ta}: {nativeAksharas.join(" • ")}
              </span>
            </div>

            <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20 text-[10px] space-y-1">
              <div className="font-bold text-[#6b1426]">ஜாதகரின் நட்சத்திர பாத அக்ஷரம்:</div>
              <div className="text-[#8e2b1c] font-bold text-[13px]">
                {d.nakshatram_ta} {d.pada}-ஆம் பாதம் துவக்க எழுத்து: ‘{nativeAksharas[d.pada - 1] || nativeAksharas[0]}’
              </div>
              <p className="text-[9.5px] text-[#3a1a0f] leading-relaxed">
                குழந்தைக்கு இந்த ஒலி அமைப்பில் பெயர் வைப்பது ஆயுள், ஆரோக்கியம், கல்வி மற்றும் புகழைப் பெருக்கும் என நாரத சம்ஹிதை கூறுகிறது.
              </p>
            </div>

            <div className="text-[9px] text-[#6f6049] italic border-t border-[#aa820a]/20 pt-1 text-center">
              அசுவினி (சு,சே,சோ,ல) • பரணி (லீ,லூ,லே,லோ) • கார்த்திகை (அ,இ,உ,ஏ) • ரோகிணி (ஓ,வ,வி,வு) • மிருகசீரிஷம் (வே,வோ,கா,கீ)...
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
