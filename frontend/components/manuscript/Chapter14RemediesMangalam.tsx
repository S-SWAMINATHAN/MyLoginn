"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter14RemediesMangalam: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 50: மகா பரிகாரக் காண்டம் & மங்கள நிறைவு (MANGALAM)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={50}
        chapterTitleTa="பகுதி 14: மகா பரிகாரங்கள் & மங்கலம்"
        chapterTitleEn="Part 14: Sacred Remedies & Auspicious Conclusion"
        pageTitleTa="மகா பரிகாரக் காண்டம், நவக்கிரக திருத்தலங்கள் & மங்கள வாழ்த்துரை"
        pageTitleEn="Master Remedial Treatise, Navagraha Pilgrimage Guide & Mangalam"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Daily Rituals Card */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ வாழ்நாள் முழுவதும் கடைபிடிக்க வேண்டிய தினசரி சுப வழிபாடுகள் ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>• <span className="font-bold">காலை விடியற்காலை:</span> சூரிய நமஸ்காரம் மற்றும் குலதெய்வ தியானம்.</div>
              <div>• <span className="font-bold">விளக்கேற்றுதல்:</span> காலை, மாலை இருவேளையும் நெய் தீபம் ஏற்றி இஷ்ட தெய்வ வழிபாடு.</div>
              <div>• <span className="font-bold">அன்னதானம்:</span> ஜீவராசிகளுக்கு (காகம், எறும்பு, பசு, ஆதரவற்றோர்) உணவளித்தல்.</div>
              <div>• <span className="font-bold">வார்த்தை சுத்தி:</span> உண்மை பேசுதல், பெரியோர்களை வணங்குதல், தர்ம நெறி தவறாமை.</div>
            </div>
          </div>

          {/* Navagraha Pilgrimage Guide */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1">
            <div className="font-bold text-[#6b1426] text-[11.5px] border-b border-[#aa820a]/30 pb-0.5 text-center">
              ✦ தமிழ்நாட்டு நவக்கிரக திருத்தல வழிகாட்டி (Navagraha Temples) ✦
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[9px]">
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">1. சூரியன்: சூரியனார் கோவில்</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">2. சந்திரன்: திங்களூர்</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">3. செவ்வாய்: வைத்தீஸ்வரன் கோவில்</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">4. புதன்: திருவெண்காடு</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">5. குரு: ஆலங்குடி</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">6. சுக்கிரன்: கஞ்சனூர்</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">7. சனி: திருநள்ளாறு</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">8. ராகு: திருநாகேஸ்வரம்</div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">9. கேது: கீழப்பெரும்பள்ளம்</div>
            </div>
          </div>

          {/* Auspicious Mangala Sloka Box */}
          <div className="bg-[#fffaf0] border-2 border-[#15803d] rounded-2xl p-4 shadow-md text-center space-y-2">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-[0.2em] font-cinzel">
              ॥ மங்கள வாழ்த்துரை & சுப நிறைவு ॥
            </div>
            <div
              className="text-[13px] text-[#2b2117] leading-relaxed italic font-semibold"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              “ஸர்வே பவந்து ஸுகின: ஸர்வே ஸந்து நிராமயா: |<br />
              ஸர்வே பத்ராணி பஷ்யந்து மா கஸ்சித் துக்கபாக்பவேத் ||<br />
              ஓம் சாந்தி: சாந்தி: சாந்தி: ||”
            </div>
            <div className="text-[11px] text-[#8e2b1c] font-bold">
              எல்லா உயிர்களும் இன்புற்று வாழ்க • வையகம் நலம் பெறுக • வாழ்க வளமுடன்!
            </div>
            <div className="border-t border-[#aa820a]/30 pt-2 flex justify-between items-center text-[10px] text-[#6f6049]">
              <div>ஸ்ரீ வேத கணித ஆசான் சான்றொப்பம்</div>
              <div className="font-bold text-[#8e2b1c] text-[12px]">॥ சுபமஸ்து — மங்களம் உண்டாகுக ॥</div>
              <div>50-பக்க மகா சம்பூர்ண நிறைவு</div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
