"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter8YogasDoshas: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const yogas = chart.yogas || [];
  const doshas = chart.doshas || [];

  const rajaYogas = yogas.filter((y) =>
    ["Raja Yoga", "Maha Shubha Yoga", "Dhana Yoga", "Maha Purusha Yoga"].some((c) =>
      y.category?.includes(c)
    )
  );
  const otherYogas = yogas.filter((y) => !rajaYogas.includes(y));

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 31: மகா ராஜ யோகங்கள் & தன யோகங்கள் (RAJA YOGAS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={31}
        chapterTitleTa="பகுதி 8: சுப யோகங்கள் & தோஷங்கள்"
        chapterTitleEn="Part 8: Auspicious Yogas & Doshas"
        pageTitleTa="மகா ராஜ யோகங்கள் & தன யோகங்கள் (Maha Raja Yogas)"
        pageTitleEn="Major Raja Yogas, Dhana Yogas & Royal Combinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ பராசர & பலதீபிகை பிரமாண மகா யோகங்கள் ✦
            </div>

            <div className="space-y-1.5 overflow-hidden">
              {(rajaYogas.length > 0 ? rajaYogas : yogas.slice(0, 4)).map((y, idx) => (
                <div key={idx} className="bg-[#fff8ee] border border-[#aa820a]/30 rounded-lg p-2 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#8e2b1c] text-[11px]">
                      {y.name_ta} ({y.name})
                    </span>
                    <span className="text-[8.5px] bg-[#8e2b1c] text-[#ffd700] px-1.5 py-0.5 rounded font-bold">
                      {y.category}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-[#3a1a0f] leading-tight">{y.description_ta}</p>
                  <div className="text-[8px] text-[#6f6049] flex justify-between border-t border-[#aa820a]/20 pt-0.5 mt-0.5">
                    <span>ஆதாரம்: {y.classical_source}</span>
                    <span>பங்கேற்ற கிரகங்கள்: {y.planets_involved?.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#fff8ee] p-1.5 rounded border border-[#aa820a]/30 text-[9px] text-[#6f6049] text-center italic">
              * ராஜ யோகங்கள் அமைந்த ஜாதகருக்கு உரிய தசா-புக்திகள் நடக்கும் காலத்தில் அபரிமிதமான செல்வம், புகழ் மற்றும் உயர் அந்தஸ்து கூடிவரும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 32: சூரிய, சந்திர & நாபஸ சுப யோகங்கள் (SOLAR/LUNAR)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={32}
        chapterTitleTa="பகுதி 8: சுப யோகங்கள் & தோஷங்கள்"
        chapterTitleEn="Part 8: Auspicious Yogas & Doshas"
        pageTitleTa="சூரிய, சந்திர & நாபஸ சுப யோகங்கள்"
        pageTitleEn="Solar, Lunar & Special Classical Subha Yogas"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ சூர்ய யோகங்கள் (வேசி, வோசி, உபயசாரி) & சந்திர யோகங்கள் ✦
            </div>

            <div className="space-y-1.5">
              {(otherYogas.length > 0 ? otherYogas : yogas.slice(3, 7)).map((y, idx) => (
                <div key={idx} className="bg-[#fff8ee] border border-[#aa820a]/30 rounded-lg p-2 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#6b1426] text-[11px]">
                      {y.name_ta} ({y.name})
                    </span>
                    <span className="text-[8.5px] bg-[#aa820a]/20 text-[#6b1426] px-1.5 py-0.5 rounded font-bold">
                      {y.category || "சுப யோகம்"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-[#3a1a0f] leading-tight">{y.description_ta}</p>
                  <div className="text-[8px] text-[#6f6049] border-t border-[#aa820a]/20 pt-0.5 mt-0.5">
                    ஆதாரம்: {y.classical_source}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-[#3a1a0f] leading-relaxed">
              <span className="font-bold text-[#8e2b1c]">சாஸ்திர குறிப்பு: </span>
              சூரியன் மற்றும் சந்திரனுக்கு இருபுறமும் சுப கிரகங்கள் அமைவது ஜாதகருக்கு கவசத்தைப் போல் நின்று எவ்வித இக்கட்டான சூழ்நிலையிலும் நல்வழிகாட்டும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 33: கால சர்ப்ப தோஷம் & பித்ரு தோஷ ஆய்வு
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={33}
        chapterTitleTa="பகுதி 8: சுப யோகங்கள் & தோஷங்கள்"
        chapterTitleEn="Part 8: Auspicious Yogas & Doshas"
        pageTitleTa="கால சர்ப்ப தோஷம் & பித்ரு தோஷ ஆழமான ஆய்வு"
        pageTitleEn="Kala Sarpa Dosha & Pitru Dosha Karmic Determinations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Kala Sarpa Card */}
          <div className="bg-[#fffaf0] border-2 border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ கால சர்ப்ப தோஷ / யோக ஆய்வு ✦</span>
              <span className="text-[10px] text-[#6f6049]">12 வகையான அமைப்புகள்</span>
            </div>
            <p className="text-[10.5px] text-[#3a1a0f] leading-relaxed">
              அனைத்து 7 கிரகங்களும் ராகு மற்றும் கேதுவின் அச்சிற்குள் ஒரு பக்கமாக அடைபட்டிருப்பது கால சர்ப்ப தோஷமாகும். இது ஆரம்ப காலத்தில் சில போராட்டங்களைத் தந்தாலும் 33 வயதிற்குப் பின் விஸ்வரூப வெற்றியைத் தரும்.
            </p>
            <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20 text-[10px] text-[#6b1426] space-y-0.5">
              <div><span className="font-semibold">பரிகார ஸ்தலம்: </span>திருக்காளஹஸ்தி அல்லது திருநாகேஸ்வரம் சென்று ராகு கால பூஜை செய்தல்.</div>
              <div><span className="font-semibold">மந்திரம்: </span>மகா மிருத்யுஞ்சய மந்திரம் அல்லது சர்ப்ப காயத்ரி பாராயணம்.</div>
            </div>
          </div>

          {/* Pitru Dosha Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ பித்ரு தோஷ ஆய்வு & முன்னோர்கள் ஆசி ✦
            </div>
            <p className="text-[10.5px] text-[#3a1a0f] leading-relaxed">
              சூரியன் பித்ருகாரகன் ஆவார். 9-ஆம் பாவம் தந்தை மற்றும் பூர்வீக புண்ணியத்தைக் குறிக்கும். சூரியனுடன் ராகு/கேது இணைவது அல்லது 9-ஆம் அதிபதி மறைவது பித்ரு தோஷத்தை சுட்டிக்காட்டும்.
            </p>
            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20 text-[10px] space-y-1">
              <div className="font-bold text-[#8e2b1c]">முக்கிய பரிகாரங்கள்:</div>
              <div>• அமாவாசை தோறும் முன்னோர்களை நினைத்து எள் தர்ப்பணம் மற்றும் காக்கைக்கு உணவிடுதல்.</div>
              <div>• ராமேஸ்வரம் அக்னி தீர்த்தம் அல்லது திலதர்ப்பணபுரி சென்று பித்ரு பூஜை செய்தல்.</div>
              <div>• பசு மாட்டிற்கு அகத்திகீரை மற்றும் அன்னதானம் வழங்குவது சர்வ தோஷ நிவர்த்தி தரும்.</div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 34: இதர தோஷங்கள்: குரு சண்டாளம், கண்ட மூலம், கிரகணம்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={34}
        chapterTitleTa="பகுதி 8: சுப யோகங்கள் & தோஷங்கள்"
        chapterTitleEn="Part 8: Auspicious Yogas & Doshas"
        pageTitleTa="இதர தோஷங்கள்: குரு சண்டாளம், கண்ட மூலம் & கிரகண தோஷம்"
        pageTitleEn="Minor Classical Doshas: Guru Chandala, Ganda Moola & Remedies"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 flex-1">
            {/* Guru Chandala */}
            <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
              <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b pb-0.5">
                ✦ குரு சண்டாள தோஷம்
              </div>
              <p className="text-[9.5px] text-[#3a1a0f] leading-tight">
                குருவும் ராகுவும் ஒரே வீட்டில் இணைந்திருப்பது. ஆன்மீகத்தில் விசேஷ சிந்தனையும், பெரியோர்களை மதித்து நடக்கும் போது உன்னத வெற்றியும் தரும்.
              </p>
              <div className="text-[8.5px] bg-[#fff8ee] p-1.5 rounded text-[#6b1426]">
                பரிகாரம்: தட்சிணாமூர்த்திக்கு வியாழக்கிழமை கொண்டைக்கடலை மாலை அணிவித்தல்.
              </div>
            </div>

            {/* Ganda Moola */}
            <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
              <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b pb-0.5">
                ✦ கண்ட மூல நட்சத்திர தோஷம்
              </div>
              <p className="text-[9.5px] text-[#3a1a0f] leading-tight">
                அசுவினி, ஆயில்யம், மகம், கேட்டை, மூலம், ரேவதி ஆகிய ராசி சந்திப்பு நட்சத்திரங்களில் பிறத்தல்.
              </p>
              <div className="text-[8.5px] bg-[#fff8ee] p-1.5 rounded text-[#6b1426]">
                பரிகாரம்: ஜென்ம நட்சத்திரத்தன்று கணபதி ஹோமம் மற்றும் நட்சத்திர சாந்தி செய்தல்.
              </div>
            </div>

            {/* Grahan Dosha */}
            <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
              <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b pb-0.5">
                ✦ கிரகண தோஷம்
              </div>
              <p className="text-[9.5px] text-[#3a1a0f] leading-tight">
                சூரியன் அல்லது சந்திரன் ராகு-கேதுவுடன் ஒரே ராசியில் நெருங்கி நிற்பது. மன அமைதி மற்றும் உடல் ஆரோக்கியத்தில் கவனம் தேவை.
              </p>
              <div className="text-[8.5px] bg-[#fff8ee] p-1.5 rounded text-[#6b1426]">
                பரிகாரம்: சிவபெருமானுக்கு திங்கட்கிழமை பால் அபிஷேகம் மற்றும் ஆதித்ய ஹிருதயம்.
              </div>
            </div>

            {/* Punarphoo */}
            <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
              <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b pb-0.5">
                ✦ புனர்பூ தோஷம் (சனி-சந்திரன்)
              </div>
              <p className="text-[9.5px] text-[#3a1a0f] leading-tight">
                சனி மற்றும் சந்திரன் சேர்க்கை அல்லது பரஸ்பர பார்வை. திருமண பேச்சுவார்த்தைகளில் தாமதத்தை தந்தாலும் நீடித்த உறுதி தரும்.
              </p>
              <div className="text-[8.5px] bg-[#fff8ee] p-1.5 rounded text-[#6b1426]">
                பரிகாரம்: அம்மன் வழிபாடு மற்றும் சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றுதல்.
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
