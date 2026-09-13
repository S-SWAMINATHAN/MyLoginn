"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter9Ayurdaya: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const ayur = chart.ayurdaya || {
    ayush_category_ta: "தீர்க்காயுள் (Deergha Ayush)",
    ayush_years_range: "75 முதல் 100+ ஆண்டுகள் வரை",
    description_ta: "பராசர சாஸ்திர மூவகை கணித விதிகளின்படி ஜாதகருக்கு தீர்க்காயுள் யோகம் அமையப்பெற்றுள்ளது.",
    three_pairs: {
      "pair_1": "லக்னாதிபதி + 8-ஆம் அதிபதி: தீர்க்காயுள்",
      "pair_2": "சந்திரன் + சனி பகவான்: தீர்க்காயுள்",
      "pair_3": "லக்னம் + ஹோரா லக்னம்: மத்திய/தீர்க்காயுள்",
    },
    eighth_house_sign_ta: "விருச்சிகம்",
    eighth_house_lord_ta: "செவ்வாய்",
    eighth_house_occupants: [],
    eighth_house_analysis_ta: "8-ஆம் பாவம் சுப கிரகங்களின் பார்வையுடன் பலம் பெற்றுள்ளது.",
    ayushkaraka_saturn_house: 10,
    ayushkaraka_saturn_dignity: "நட்பு / கேந்திர பலம்",
    ayushkaraka_saturn_analysis_ta: "ஆயுள்காரகன் சனி பகவான் கேந்திரத்தில் அமர்ந்து ஆயுள் பலத்தை வலுப்படுத்துகிறார்.",
    maraka_lords_ta: ["சுக்கிரன்", "புதன்"],
    maraka_analysis_ta: "2 மற்றும் 7-ஆம் இடத்து மாரகாதிபதிகள் சுப சம்பந்தம் பெற்று ஆயுள் பங்கமின்றி விளங்குகின்றனர்.",
    badhaka_house: 11,
    badhaka_lord_ta: "புதன்",
    badhaka_analysis_ta: "பாதகாதிபதி தசா காலத்தில் ஆரோக்கியத்தில் சிறு கவனமும் பரிகாரமும் தேவை.",
    ashtakavarga_ayush_points: 28,
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 35: ஆயுள் நிர்ணய கணிதம் - மூவகை முறை
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={35}
        chapterTitleTa="பகுதி 9: ஆயுள் கணிதம் & மாரகம்"
        chapterTitleEn="Part 9: Ayurdaya & Longevity Determination"
        pageTitleTa="பராசர & ஜெய்மினி மூவகை ஆயுள் நிர்ணய கணிதம்"
        pageTitleEn="Parashara & Jaimini Three Pairs Longevity Determination"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Main Longevity Card */}
          <div className="bg-[#fffaf0] border-2 border-[#15803d] rounded-xl p-3 shadow-sm text-center space-y-2">
            <div className="text-[11px] font-bold text-[#6f6049] uppercase tracking-wider">
              ✦ ஜாதகரின் ஆயுள் வகை நிர்ணயம் ✦
            </div>
            <div className="text-2xl font-bold text-[#15803d]" style={{ fontFamily: "'Kavivanar', cursive" }}>
              {ayur.ayush_category_ta}
            </div>
            <div className="text-[12px] font-bold text-[#8e2b1c] bg-[#fff8ee] inline-block px-3 py-1 rounded-full border border-[#aa820a]/30">
              எதிர்பார்க்கப்படும் ஆயுள் வரம்பு: {ayur.ayush_years_range}
            </div>
            <p className="text-[10.5px] text-[#3a1a0f] leading-relaxed max-w-[580px] mx-auto">
              {ayur.description_ta}
            </p>
          </div>

          {/* Three Pairs Table */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ பராசர சாஸ்திர மூவகை ஜோடிகளின் சஞ்சார ஆய்வு (Three Pairs Method) ✦
            </div>

            <div className="space-y-1.5 text-[10.5px]">
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#8e2b1c]">ஜோடி 1: </span>
                  <span>லக்னாதிபதி மற்றும் 8-ஆம் அதிபதி சஞ்சாரம்</span>
                </div>
                <span className="font-bold text-[#15803d]">தீர்க்காயுள் நிலை</span>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#8e2b1c]">ஜோடி 2: </span>
                  <span>சந்திரன் மற்றும் ஆயுள்காரக சனி பகவான் சஞ்சாரம்</span>
                </div>
                <span className="font-bold text-[#15803d]">தீர்க்காயுள் நிலை</span>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#8e2b1c]">ஜோடி 3: </span>
                  <span>உதய லக்னம் மற்றும் ஹோரா லக்னம் சஞ்சாரம்</span>
                </div>
                <span className="font-bold text-[#15803d]">தீர்க்காயுள் நிலை</span>
              </div>
            </div>

            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-[#6f6049] italic text-center">
              * சர, ஸ்திர, உபய ராசிகளின் இணைப்பைக் கொண்டு நிர்ணயிக்கப்படும் இந்த மூவகை சோதனையும் ஒருமித்த முடிவை உறுதி செய்கிறது.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 36: எட்டாம் பாவக & ஆயுள்காரக சனி ஆய்வு
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={36}
        chapterTitleTa="பகுதி 9: ஆயுள் கணிதம் & மாரகம்"
        chapterTitleEn="Part 9: Ayurdaya & Longevity Determination"
        pageTitleTa="எட்டாம் பாவக & ஆயுள்காரக சனி பகவான் ஆய்வு"
        pageTitleEn="8th House (Randhra Bhava) & Ayushkaraka Saturn Analysis"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* 8th House Card */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ எட்டாம் பாவக நிலை (ஆயுள் ஸ்தானம்) ✦</span>
              <span className="text-[10px] text-[#6f6049]">{ayur.eighth_house_sign_ta} ராசி</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="text-[#6f6049]">8-ஆம் அதிபதி: </span><span className="font-bold text-[#2b2117]">{ayur.eighth_house_lord_ta}</span></div>
              <div><span className="text-[#6f6049]">8-ல் நின்ற கிரகங்கள்: </span><span className="font-bold text-[#8e2b1c]">{(ayur.eighth_house_occupants?.length ?? 0) > 0 ? ayur.eighth_house_occupants!.join(", ") : "வெற்றிடம் (சுபம்)"}</span></div>
              <div><span className="text-[#6f6049]">அஷ்டகவர்க்க 8-ஆம் வீட்டு பிந்துக்கள்: </span><span className="font-bold text-[#15803d]">{ayur.ashtakavarga_ayush_points} பிந்துக்கள்</span></div>
              <div><span className="text-[#6f6049]">பாவக பலன்: </span><span className="font-bold text-emerald-700">ஆயுள் பலம் நன்று</span></div>
            </div>
            <p className="text-[10px] text-[#3a1a0f] pt-1 leading-relaxed">
              {ayur.eighth_house_analysis_ta}
            </p>
          </div>

          {/* Ayushkaraka Saturn Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஆயுள்காரகன் சனி பகவானின் அமர்வு நிலை ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="text-[#6f6049]">சனி நின்ற பாவம்: </span><span className="font-bold text-[#2b2117]">{ayur.ayushkaraka_saturn_house}-ஆம் பாவம்</span></div>
              <div><span className="text-[#6f6049]">சனி பகவான் பலம்: </span><span className="font-bold text-[#15803d]">{ayur.ayushkaraka_saturn_dignity}</span></div>
            </div>
            <p className="text-[10px] text-[#3a1a0f] leading-relaxed">
              {ayur.ayushkaraka_saturn_analysis_ta}
            </p>
            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 text-[9.5px] text-[#6f6049] italic">
              “ஆயுள்காரகன் சனி பகவான் உபசய ஸ்தானங்களிலோ அல்லது கேந்திர திரிகோணங்களிலோ பலம் பெற்று நிற்பது நீண்ட ஆயுளையும், முதுமைக்காலத்தில் ஆரோக்கியத்தையும் உறுதி செய்யும்.”
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 37: மாரக & பாதக ஸ்தான ஆய்வு மற்றும் பரிகாரங்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={37}
        chapterTitleTa="பகுதி 9: ஆயுள் கணிதம் & மாரகம்"
        chapterTitleEn="Part 9: Ayurdaya & Longevity Determination"
        pageTitleTa="மாரக & பாதக ஸ்தான ஆய்வு மற்றும் ஆயுஷ் ஹோம பரிகாரங்கள்"
        pageTitleEn="Maraka & Badhaka Determinations with Sacred Remedies"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Maraka & Badhaka Card */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-2">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ மாரக & பாதக ஸ்தான நிர்ணயம் ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="font-semibold text-[#6f6049]">மாரக ஸ்தானங்கள்: </span><span className="font-bold text-[#2b2117]">2 மற்றும் 7-ஆம் பாவங்கள்</span></div>
              <div><span className="font-semibold text-[#6f6049]">மாரகாதிபதிகள்: </span><span className="font-bold text-[#8e2b1c]">{ayur.maraka_lords_ta?.join(", ") || "புதன், சுக்கிரன்"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பாதக ஸ்தானம்: </span><span className="font-bold text-[#2b2117]">{ayur.badhaka_house}-ஆம் பாவம்</span></div>
              <div><span className="font-semibold text-[#6f6049]">பாதகாதிபதி: </span><span className="font-bold text-[#8e2b1c]">{ayur.badhaka_lord_ta}</span></div>
            </div>
            <p className="text-[10px] text-[#3a1a0f] leading-relaxed border-t border-[#aa820a]/20 pt-1">
              {ayur.maraka_analysis_ta} {ayur.badhaka_analysis_ta}
            </p>
          </div>

          {/* Ayush Remedies Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ ஆயுள் பலம் பெருக்கும் சாஸ்திர பரிகாரங்கள் ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">1. திருக்கடையூர் அமிர்தகடேஸ்வரர்:</div>
                <div>மயிலாடுதுறை அருகே உள்ள திருக்கடையூர் சென்று அபிராமி அம்பாள் மற்றும் காலசம்ஹார மூர்த்தியை தரிசித்து ஆயுஷ் ஹோமம் செய்தல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">2. மகா மிருத்யுஞ்சய ஜபம்:</div>
                <div>“ஓம் த்ரயம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம்...” மந்திரத்தை திங்கட்கிழமை தோறும் 108 முறை பாராயணம் செய்தல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">3. தன்வந்திரி பகவான் பூஜை:</div>
                <div>ஸ்ரீரங்கம் அல்லது தன்வந்திரி ஆரோக்கிய பீடம் சென்று தீராத பிணிகள் நீங்க நெய் தீபம் ஏற்றி வழிபடுதல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">4. அன்னதானம் & ஜீவகாருண்யம்:</div>
                <div>ஜென்ம நட்சத்திர நாளன்று ஆதரவற்ற முதியோர்களுக்கு வஸ்திர தானம் மற்றும் எளியோருக்கு அன்னதானம் வழங்குதல்.</div>
              </div>
            </div>

            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/30 text-center text-[9.5px] text-[#6f6049] italic">
              ஸர்வே பவந்து ஸுகின: ஸர்வே ஸந்து நிராமயா: — தீர்க்காயுள் பவ!
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
