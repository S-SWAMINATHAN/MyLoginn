"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter12GocharaMatching: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const gochara = chart.gochara?.transits || [];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 47: கோசாரக் கணிதம் & ஏழரை / அஷ்டமச் சனி ஆய்வு
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={47}
        chapterTitleTa="பகுதி 12: கோசாரம் & பொருத்தம்"
        chapterTitleEn="Part 12: Transit & Compatibility"
        pageTitleTa="கோசாரக் கணிதம், ஏழரைச் சனி & அஷ்டமச் சனி ஆய்வு"
        pageTitleEn="Current Planetary Transits, Sade Sati & Ashtama Shani"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Sade Sati Card */}
          <div className="bg-[#fffaf0] border-2 border-[#334155] rounded-xl p-3 shadow-sm space-y-2">
            <div className="font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ சனி பகவானின் கோசார சுழற்சிகள் (சனிப் பெயர்ச்சி ஆய்வு) ✦</span>
              <span className="text-[10px] text-[#6f6049]">ஜென்ம ராசி: {d.rasi_ta}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c]">1. விரயச் சனி (12-ல்)</div>
                <div className="text-[9px] text-[#6f6049] mt-0.5">தொழில் முதலீடுகள், இடமாற்றம், சுப விரயங்கள் உண்டாகும்.</div>
              </div>
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c]">2. ஜென்மச் சனி (1-ல்)</div>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கடின உழைப்பு, பொறுமை, தன்னம்பிக்கையை வளர்க்கும் காலம்.</div>
              </div>
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c]">3. பாதச் சனி (2-ல்)</div>
                <div className="text-[9px] text-[#6f6049] mt-0.5">பொருளாதார மேன்மை, குடும்பப் பொறுப்புகள் நிறைவேறுதல்.</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-[#aa820a]/20 pt-1">
              <div><span className="font-semibold text-[#6f6049]">அஷ்டமச் சனி (8-ல் சனி): </span><span className="font-bold text-[#2b2117]">ஆரோக்கியம், பயணங்களில் விழிப்புணர்வு தேவை.</span></div>
              <div><span className="font-semibold text-[#6f6049]">அர்த்தாஷ்டமச் சனி (4-ல்): </span><span className="font-bold text-[#2b2117]">வீடு, வாகன பராமரிப்பில் செலவுகள் வரும்.</span></div>
            </div>
          </div>

          {/* Gochara Transit Table */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[11.5px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ நடப்பு முக்கிய கிரகங்களின் கோசார சஞ்சார அட்டவணை ✦
            </div>

            <table className="w-full text-[9px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426]">
                  <th className="p-1 font-bold">கிரகம்</th>
                  <th className="p-1 font-bold">சஞ்சார ராசி</th>
                  <th className="p-1 font-bold">சந்திரனுக்கு இடம்</th>
                  <th className="p-1 font-bold">சாஸ்திர பலன்</th>
                  <th className="p-1 font-bold">சுபாசுபம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {gochara.length > 0 ? (
                  gochara.slice(0, 5).map((g: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/50" : "bg-[#fffaf0]"}>
                      <td className="p-1 font-bold text-[#2b2117]">{g.planet_ta}</td>
                      <td className="p-1 font-semibold">{g.transit_rasi_ta}</td>
                      <td className="p-1 font-bold text-[#8e2b1c]">{g.house_from_moon}-ஆம் இடம்</td>
                      <td className="p-1 text-[#3a1a0f]">{g.classical_effect_ta}</td>
                      <td className="p-1">
                        {g.net_benefic ? (
                          <span className="text-emerald-700 font-bold">சுபம் ★</span>
                        ) : (
                          <span className="text-amber-700 font-bold">மத்திமம்</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td className="p-1 font-bold">குரு பகவான்</td>
                      <td className="p-1 font-semibold">ரிஷப ராசி</td>
                      <td className="p-1 font-bold text-[#8e2b1c]">சுப ஸ்தானம்</td>
                      <td className="p-1">தன லாபம், குடும்பத்தில் சுப காரியங்கள்</td>
                      <td className="p-1 text-emerald-700 font-bold">அதி உத்தமம்</td>
                    </tr>
                    <tr className="bg-[#fffaf0]">
                      <td className="p-1 font-bold">சனி பகவான்</td>
                      <td className="p-1 font-semibold">கும்ப ராசி</td>
                      <td className="p-1 font-bold text-[#8e2b1c]">ஆட்சி ஸ்தானம்</td>
                      <td className="p-1">தொழில் உயர்வு, புதிய வாய்ப்புகள்</td>
                      <td className="p-1 text-emerald-700 font-bold">சுபம்</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-bold">ராகு / கேது</td>
                      <td className="p-1 font-semibold">மீனம் / கன்னி</td>
                      <td className="p-1 font-bold text-[#8e2b1c]">உபசய ஸ்தானம்</td>
                      <td className="p-1">எதிர்பாராத பொருள் வரவு, ஆன்மீக பக்தி</td>
                      <td className="p-1 text-emerald-700 font-bold">சுபம்</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] italic border-t border-[#aa820a]/20 pt-1">
              * கோசார பலன்கள் என்பது தசா-புக்தி பலன்களோடு இணைந்து செயல்படும் காலநிலையாகும்; தசா பலமே முதன்மையானது.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 48: 10 திருமணப் பொருத்தங்கள் & அஷ்டகூட வழிகாட்டி
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={48}
        chapterTitleTa="பகுதி 12: கோசாரம் & பொருத்தம்"
        chapterTitleEn="Part 12: Transit & Compatibility"
        pageTitleTa="பாரம்பரிய 10 திருமணப் பொருத்தங்கள் & அஷ்டகூட சாஸ்திர வழிகாட்டி"
        pageTitleEn="Traditional 10 Tamil Poruthams & 36-Point Ashta Koota Guide"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ தமிழ் பாரம்பரிய 10 பொருத்தங்களின் இலக்கணம் ✦
            </div>

            <table className="w-full text-[9px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">பொருத்தம்</th>
                  <th className="p-1 font-bold">நோக்கம் / சாஸ்திர பலன்</th>
                  <th className="p-1 font-bold">முக்கியத்துவம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">1. தினப் பொருத்தம் (Dina)</td>
                  <td className="p-1">ஆயுள் விருத்தி, நோயற்ற வாழ்வு, அன்றாட மகிழ்ச்சி</td>
                  <td className="p-1 font-bold text-emerald-700">மிக முக்கியம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">2. கணப் பொருத்தம் (Gana)</td>
                  <td className="p-1">குண ஒற்றுமை, விட்டுக்கொடுத்து வாழும் மனப்பக்குவம்</td>
                  <td className="p-1 font-bold text-emerald-700">முக்கியம்</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">3. மாகேந்திரப் பொருத்தம் (Mahendra)</td>
                  <td className="p-1">புத்திர பாக்கியம், வம்ச விருத்தி, செல்வ மேன்மை</td>
                  <td className="p-1 font-bold text-emerald-700">மிக முக்கியம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">4. ஸ்திரீ தீர்க்கப் பொருத்தம் (Stree Deergha)</td>
                  <td className="p-1">மனைவியின் தீர்க்க சுமங்கலி யோகம், குடும்ப அமைதி</td>
                  <td className="p-1">நன்று</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">5. யோனிப் பொருத்தம் (Yoni)</td>
                  <td className="p-1">தாம்பத்திய சுகம், உடல் மற்றும் உளவியல் இணக்கம்</td>
                  <td className="p-1 font-bold text-emerald-700">மிக முக்கியம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">6. ராசிப் பொருத்தம் (Rasi)</td>
                  <td className="p-1">வம்ச விருத்தி, மனஸ்தாபங்கள் இல்லாமை</td>
                  <td className="p-1 font-bold text-emerald-700">முக்கியம்</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">7. ராசியாதிபதிப் பொருத்தம் (Rasiyathipathi)</td>
                  <td className="p-1">இரு குடும்பங்களின் நல்லுறவு, சுமுகமான நட்புறவு</td>
                  <td className="p-1 font-bold text-emerald-700">முக்கியம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">8. வசியப் பொருத்தம் (Vasiya)</td>
                  <td className="p-1">தம்பதிகளிடையே நீடித்த அன்பு, பரஸ்பர ஈர்ப்பு</td>
                  <td className="p-1">நன்று</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="p-1 font-bold text-[#b91c1c]">9. ரஜ்ஜுப் பொருத்தம் (Rajju)</td>
                  <td className="p-1 font-bold text-[#b91c1c]">மாங்கல்ய பலம், கணவனின் தீர்க்காயுள் (ஒரே ரஜ்ஜு கூடவே கூடாது)</td>
                  <td className="p-1 font-bold text-red-700">இன்றிமையாதது ★</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">10. வேதைப் பொருத்தம் (Vedha)</td>
                  <td className="p-1">துன்பங்கள் மற்றும் விரோதங்கள் இல்லாத அமைதியான வாழ்வு</td>
                  <td className="p-1 font-bold text-emerald-700">முக்கியம்</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-[#3a1a0f] space-y-0.5">
              <div className="font-bold text-[#8e2b1c]">அஷ்டகூட 36 புள்ளிகள் முறை:</div>
              <div>வர்ணம் (1), வசியம் (2), தாரா (3), யோனி (4), கிரக மைத்திரி (5), கணம் (6), பக்கூட் (7), நாடி (8) என மொத்தம் 36 புள்ளிகளில் 18 புள்ளிகளுக்கு மேல் அமைவது உத்தமம்.</div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
