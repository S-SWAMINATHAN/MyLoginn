"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter11BhavaPredictions: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const bhavas = chart.bhava_predictions || [];

  const getBhavaData = (num: number) => {
    return bhavas.find((b) => b.house_number === num) || {
      house_number: num,
      rasi_ta: `ராசி ${num}`,
      lord_ta: "அதிபதி",
      occupants: [],
      significations_ta: ["முக்கிய காரகங்கள்"],
      prediction_ta: `${num}-ஆம் பாவகம் சுப கிரக பார்வைகளுடன் நற்பலன்களை அளிக்கும் அமைப்பில் உள்ளது.`,
    };
  };

  const renderBhavaBlock = (num: number, titleTa: string, subtitleTa: string) => {
    const b = getBhavaData(num);
    return (
      <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
        <div className="flex justify-between items-center border-b border-[#aa820a]/30 pb-0.5">
          <div className="font-bold text-[#8e2b1c] text-[12px]">
            ✦ {num}-ஆம் பாவம்: {titleTa}
          </div>
          <span className="text-[9px] bg-[#8e2b1c] text-[#ffd700] px-1.5 py-0.5 rounded font-bold">
            {b.rasi_ta} ({b.lord_ta})
          </span>
        </div>
        <div className="text-[9px] text-[#6f6049] italic">{subtitleTa}</div>
        <div className="text-[10px] space-y-0.5">
          <div>
            <span className="font-semibold text-[#6b1426]">அமர்ந்த கிரகங்கள்: </span>
            <span className="text-[#2b2117] font-bold">
              {b.occupants && b.occupants.length > 0 ? b.occupants.join(", ") : "வெற்றிடம் (சுபம்)"}
            </span>
          </div>
          <p className="text-[#3a1a0f] leading-relaxed text-[10px] pt-0.5">
            {b.prediction_ta}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 43: பாவகங்கள் 1, 2, 3 விரிவான சாஸ்திரப் பலன்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={43}
        chapterTitleTa="பகுதி 11: 12 பாவக சாஸ்திர பலன்கள்"
        chapterTitleEn="Part 11: 12 Houses Shastric Readings"
        pageTitleTa="பாவகங்கள் 1, 2, 3 விரிவான சாஸ்திரப் பலன்கள்"
        pageTitleEn="Houses 1, 2, 3 In-Depth Astrological Determinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {renderBhavaBlock(1, "தனு பாவம் (உடல், தோற்றம், ஆளுமை, ஆயுள்)", "லக்ன ஸ்தானம் — மனிதனின் குணம், ஆரோக்கியம், கம்பீர தோற்றம், சமூக மதிப்பு")}
          {renderBhavaBlock(2, "தன பாவம் (செல்வம், வாக்கு, குடும்பம்)", "தன ஸ்தானம் — அசையும் சொத்துக்கள், வாக்கு வன்மை, நேத்திரம், குடும்ப ஒற்றுமை")}
          {renderBhavaBlock(3, "ப்ராத்ரு பாவம் (சகோதரம், தைரியம், முயற்சிகள்)", "சகோதர ஸ்தானம் — உடன்பிறப்புகள், துணிச்சல், தகவல் தொடர்பு, குறுகிய பயணங்கள்")}
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 44: பாவகங்கள் 4, 5, 6 விரிவான சாஸ்திரப் பலன்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={44}
        chapterTitleTa="பகுதி 11: 12 பாவக சாஸ்திர பலன்கள்"
        chapterTitleEn="Part 11: 12 Houses Shastric Readings"
        pageTitleTa="பாவகங்கள் 4, 5, 6 விரிவான சாஸ்திரப் பலன்கள்"
        pageTitleEn="Houses 4, 5, 6 In-Depth Astrological Determinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {renderBhavaBlock(4, "மாத்ரு & சுக பாவம் (தாய், பூமி, வீடு, வாகனம்)", "சுக ஸ்தானம் — தாய் வழி உறவு, வீடு மனை சொத்துக்கள், உயர்கல்வி சுகம், மன அமைதி")}
          {renderBhavaBlock(5, "புத்ர பாவம் (பூர்வ புண்ணியம், குழந்தைகள், அறிவு)", "பூர்வ புண்ணிய ஸ்தானம் — புத்திர பாக்கியம், ஆழ்ந்த அறிவு, தெய்வ பக்தி, மந்திர சித்தி")}
          {renderBhavaBlock(6, "சத்ரு & ரோக பாவம் (கடன், நோய், எதிரிகள்)", "ரோக ஸ்தானம் — உடல் ஆரோக்கியம், கடன் தீர்த்தல், போட்டித் தேர்வுகளில் வெற்றி, வழக்குகளில் ஜெயித்தல்")}
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 45: பாவகங்கள் 7, 8, 9 விரிவான சாஸ்திரப் பலன்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={45}
        chapterTitleTa="பகுதி 11: 12 பாவக சாஸ்திர பலன்கள்"
        chapterTitleEn="Part 11: 12 Houses Shastric Readings"
        pageTitleTa="பாவகங்கள் 7, 8, 9 விரிவான சாஸ்திரப் பலன்கள்"
        pageTitleEn="Houses 7, 8, 9 In-Depth Astrological Determinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {renderBhavaBlock(7, "களத்திர பாவம் (திருமணம், வாழ்க்கைத் துணை, கூட்டாண்மை)", "களத்திர ஸ்தானம் — தாம்பத்திய சுகம், கணவன்/மனைவி குணம், தொழில் கூட்டாளிகள்")}
          {renderBhavaBlock(8, "ஆயுள் & அஷ்டம பாவம் (ஆயுள், எதிர்பாராத ஆதாயங்கள்)", "ஆயுள் ஸ்தானம் — நீண்ட ஆயுள், காப்பீடு லாபங்கள், ஆன்மீக ஞானம், ரகசிய வெற்றிகள்")}
          {renderBhavaBlock(9, "பாக்கிய பாவம் (தந்தை, தர்மம், பூர்வீகம், குரு அருள்)", "பாக்கிய ஸ்தானம் — தந்தை நலம், முன்னோர்கள் ஆசி, திருத்தல யாத்திரைகள், உயரிய தர்ம வாழ்க்கை")}
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 46: பாவகங்கள் 10, 11, 12 விரிவான சாஸ்திரப் பலன்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={46}
        chapterTitleTa="பகுதி 11: 12 பாவக சாஸ்திர பலன்கள்"
        chapterTitleEn="Part 11: 12 Houses Shastric Readings"
        pageTitleTa="பாவகங்கள் 10, 11, 12 விரிவான சாஸ்திரப் பலன்கள்"
        pageTitleEn="Houses 10, 11, 12 In-Depth Astrological Determinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {renderBhavaBlock(10, "கர்ம பாவம் (தொழில், ஜீவனம், அதிகாரம், கீர்த்தி)", "கர்ம ஸ்தானம் — உத்தியோகம், அரசு கெளரவம், வியாபாரம், சமுதாயத்தில் தலைமைப் பதவி")}
          {renderBhavaBlock(11, "லாப பாவம் (செல்வ லாபம், ஆசைகள் நிறைவேறுதல்)", "லாப ஸ்தானம் — சகல காரிய வெற்றி, அபரிமிதமான பண வரவு, மூத்த சகோதரர் நலம்")}
          {renderBhavaBlock(12, "விரய & மோக்ஷ பாவம் (சுப விரயம், அயல்நாடு, முக்தி)", "மோக்ஷ ஸ்தானம் — சுப செலவுகள், சுகமான நித்திரை, வெளிநாட்டு பிரயாணம், ஆன்மீக விடுதலை")}
        </div>
      </PageWrapper>
    </>
  );
};
