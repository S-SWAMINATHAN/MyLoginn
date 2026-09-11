"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

// Classical Dasha Tamil verses
const DASHA_POEMS: Record<string, { poem: string; devata: string; temple: string; grain: string; cloth: string; remedy: string }> = {
  Sun: {
    poem: "கூறப்பா கதிருக்கு வருஷம் ஆறு குணமுள்ள புத்தி நாள் நூற்றெட்டாகும்\nபாரப்பா அக்கினியால் பீடையுண்டு பாங்கான அபமிருத்துப் பொருளுஞ் சேதம்\nஆரப்பா அறிவாளர்கள் பிதாமிருத்தியு அரிதான வாணிபஞ் செல்லாகாது நஷ்டம்\nகேளப்பா கண்ணோவால் கனலே கூறினோமே.",
    devata: "சிவபெருமான், காயத்ரி தேவி",
    temple: "சூரியனார் கோவில் (தஞ்சாவூர்)",
    grain: "கோதுமை",
    cloth: "சிவப்பு வஸ்திரம்",
    remedy: "ஞாயிறுதோறும் ஆதித்ய ஹிருதயம் பாராயணம் செய்து சூரிய நமஸ்காரம் செய்தல்.",
  },
  Moon: {
    poem: "சொல்லவே சந்திர திசை வருஷம் பத்தில் சுகமுடைய சந்திர புத்தி மாதம் பத்து\nநில்லவே யதனுடைய பலனைச் சொல்வோம் நிகரில்லா மன்னருடன் மகிழ்ச்சியாகும்\nசொல்லவே சுயவரங்கள் நாட்டி வைத்து சுகமான கல்யாணம் ஆகும் பாரு\nவெல்லவே சத்துருவை ஜெயிக்கலாகும் வேண்டியபடி நிதி சேரும் விவரந்தானே.",
    devata: "பார்வதி தேவி, ராஜராஜேஸ்வரி",
    temple: "திங்களூர் சந்திர பகவான் கோவில்",
    grain: "நெல் (பச்சரிசி)",
    cloth: "வெண்பட்டு",
    remedy: "திங்கட்கிழமை அம்மன் வழிபாடு மற்றும் பௌர்ணமி கிரிவலம் நலம் தரும்.",
  },
  Mars: {
    poem: "ஆமென்ற சேய்திசை வருஷம் ஏழில் அங்காரகன் புத்திநாள் நூற்று நாற்பது ஏழு\nபோமென்ற அதன் பலனைப் புகலக் கேளு புகழான அரசர் பகை ஆயுதத்தால் பீடை\nதாமென்ற சத்துருவால் வியாதியது காணும் தனச்சேதம் உடற் சேதம் தானே உண்டாம்\nநாமென்ற நகரத்தில் சூனியங்களுண்டாம் நாளெல்லாம் தீதாகும் நன்மையில்லாப் பகையே.",
    devata: "சுப்பிரமணியர் (முருகப்பெருமான்)",
    temple: "வைத்தீஸ்வரன் கோவில் / பழனி",
    grain: "துவரை",
    cloth: "சிவப்பு நிற பட்டு",
    remedy: "செவ்வாய்க்கிழமைகளில் கந்த சஷ்டி கவசம் ஓதி முருகனுக்கு நெய் தீபம் ஏற்றுதல்.",
  },
  Mercury: {
    poem: "பார்க்கப்பா புதன்திசை வருஷம்பதினேழு பாரிலுள்ள நற்புத்தி நாட்கள்தானும்\nஏற்கவே முன்னூற்று முப்பதுநாற் கழித்தே இன்பமுடன் புதன்திசை நடக்கும்போது\nசீர்க்கவே வித்தையுண்டு கல்விஞானம் சிறப்புடனே தனலாபம் அரசுமன்னர்\nநேர்க்கவே பூமிமுதல் வாகனமுஞ் சேரும் நித்தியமும் மங்களங்கள் நேருந்தானே.",
    devata: "ஸ்ரீ மகாவிஷ்ணு",
    temple: "திருவெண்காடு சுவேதாரண்யேஸ்வரர்",
    grain: "பச்சைப்பயறு",
    cloth: "பச்சை நிற ஆடை",
    remedy: "புதன்கிழமைகளில் விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்து துளசி மாலை சாத்துதல்.",
  },
  Jupiter: {
    poem: "காணவே குரு திசை வியாழபுத்தி கணமான மாதமது பதினொன்றாகும்\nதோணவே நாள்துவும் ஆறதாகும் தொகையான தனங்களும் புத்திரனாலுண்டாம்\nபூணவே மூவுடையாள் நிர்த்தனம் செய்வாள் பூமிதனில் வெகுலாபம் பொருந்திக் காணும்\nநாணவே ராஜாங்க யோகம் பெற்று நன்றாக சுகம் விளையும் யோகந்தானே.",
    devata: "ஸ்ரீ தட்சிணாமூர்த்தி, பிரம்மா",
    temple: "ஆலங்குடி ஆபத்சகாயேஸ்வரர்",
    grain: "கொண்டைக்கடலை",
    cloth: "மஞ்சள் பட்டு",
    remedy: "வியாழன்தோறும் தட்சிணாமூர்த்திக்கு கொண்டைக்கடலை மாலை சாற்றி நெய் தீபம் ஏற்றுதல்.",
  },
  Venus: {
    poem: "காணவே சுக்கிர திசை வருஷம் நாலைந்து கனமான சுக்கிரனில் சுக்கிரன் புத்தி\nபூணவே மாதமது நாற்பதாகும் பூலோக மன்னரைப் போல் புவியிலரசாள்வான்\nபேணவே சவுக்கியங்களுண்டாகும் பாரு பெரிதான லெட்சுமியும் பொற்கொடிபோல் வருவாள்\nதொணவே சோபனமும் சுபயோகமுண்டாம் தோகையர்கள் வந்தவுடன் தொகுதியுடன் வாழ்வான்.",
    devata: "ஸ்ரீ மகாலட்சுமி தேவி",
    temple: "கஞ்சனூர் அக்னீஸ்வரர் கோவில்",
    grain: "மொச்சை",
    cloth: "வெண்பட்டு",
    remedy: "வெள்ளிக்கிழமைகளில் ஸ்ரீ சூக்தம் ஜபித்து மகாலட்சுமியை வழிபட சகல சவுபாக்கியங்களும் கிட்டும்.",
  },
  Saturn: {
    poem: "வேறு எந்த கிரகமும் பெறாத ஈஸ்வரன் என்ற அடைமொழி சனி பகவானுக்கே உண்டு\nதானென்ற சனிதீர்க்காயுள் காரகன் கருமை நிறம் கொண்டவர்\nஆயுள் காரகன் கருமை நிறமுடையவர் சுபாவத்தில் அசுபராக இருப்பினும் தர்ம நியாயஸ்தர்\nதிருநள்ளாறு சனீஸ்வரனுக்கு உரிய பரிகார ஸ்தலமாகும் எள் தீபம் நலம் பயக்கும்.",
    devata: "சனீஸ்வர பகவான், எமதர்மன், ஐயப்பன்",
    temple: "திருநள்ளாறு தர்ப்பாரண்யேஸ்வரர்",
    grain: "எள்",
    cloth: "கருநீலம் / கருப்பு",
    remedy: "சனிக்கிழமை தோறும் காகத்திற்கு எள்ளன்னம் இட்டு நல்லெண்ணெய் தீபம் ஏற்றுதல்.",
  },
  Rahu: {
    poem: "காணவே ராகு திசை வருஷம் பதினெட்டு கனதையுள்ள ராகுவினில் ராகு புத்தி\nதோணவே மாதமது முப்பத்திரண்டு தொகையான நாள்துவும் பன்னிரண்டாகும்\nயேனவே சத்துருவால் நிவந்தனையோடும் எண்ணமுள்ள மனைவியரும் இருந்த இடம் பாழ்\nபோனவே பழம் பொருளும் சேதமாகும் பலமான நோயதுவும் கூடிக் கொள்ளும்.",
    devata: "துர்க்கை அம்மன், நாகராஜர்",
    temple: "திருநாகேஸ்வரம் / திருக்காளஹஸ்தி",
    grain: "உளுந்து",
    cloth: "நீல / பலவண்ண ஆடை",
    remedy: "செவ்வாய், வெள்ளிக்கிழமைகளில் ராகு கால துர்க்கை பூஜை மற்றும் எலுமிச்சை விளக்கு.",
  },
  Ketu: {
    poem: "உண்டான கேதுதிசை ராகுபுத்தி உண்மையிலா நாள்துவும் வருடம் ஒன்று\nநன்றாகும் நாள்துவும் மூவாறாகும் நலமில்லா அதன் பலனை நவிலக்கேளு\nவிண்டாகுஞ் சத்துருவால் சோரபயமாகும் வினையான மனைவி தன்னால் வீண் கலகமாகும்\nஒன்றாகும் உன் உடம்பில் பிணியுண்டாகும் உறுதியில்லா உன் தெய்வம் ஒடிந்ததானே.",
    devata: "ஸ்ரீ விநாயகப் பெருமான், சித்திரகுப்தர்",
    temple: "கீழப்பெரும்பள்ளம் நாகநாதர் கோவில்",
    grain: "கொள்ளு",
    cloth: "சிவப்பு / பலவண்ண கம்பளி",
    remedy: "சங்கடஹர சதுர்த்தி தோறும் விநாயகருக்கு அருகம்புல் மாலை சாத்தி மோதகம் படைத்தல்.",
  },
};

export const Chapter10DashaTimeline: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const dashaList = chart.vimshottari_dasha || [];
  const currentDasha = dashaList.find((v) => v.is_current) || dashaList[0];
  const nextDasha = dashaList[dashaList.indexOf(currentDasha) + 1] || dashaList[1];
  const currentBhukti = currentDasha?.bhuktis?.find((b) => b.is_current) || currentDasha?.bhuktis?.[0];
  const antardashas = currentBhukti?.antardashas || [];

  const lordKey = currentDasha?.planet || "Jupiter";
  const poemData = DASHA_POEMS[lordKey] || DASHA_POEMS["Jupiter"];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 38: விம்சோத்தரி தசா இருப்பு & கணித சூட்சுமங்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={38}
        chapterTitleTa="பகுதி 10: விம்சோத்தரி தசா காலச் சக்கரம்"
        chapterTitleEn="Part 10: Vimshottari Dasha Master Timeline"
        pageTitleTa="விம்சோத்தரி தசா இருப்பு & கணித சூட்சுமங்கள்"
        pageTitleEn="Vimshottari Dasha Balance at Birth & Mathematical Formulae"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Dasha Balance Master Card */}
          <div className="bg-[#fffaf0] border-2 border-[#8e2b1c] rounded-xl p-3 shadow-sm space-y-2 text-center">
            <div className="text-[11px] font-bold text-[#6f6049] uppercase tracking-wider">
              ✦ ஜெனன கால தசா இருப்பு (Dasha Balance at Birth) ✦
            </div>
            <div className="text-xl font-bold text-[#8e2b1c]" style={{ fontFamily: "'Kavivanar', cursive" }}>
              {d.dasha_balance_ta || `${d.nakshatra_lord_ta} மகா திசை இருப்பு`}
            </div>
            <div className="text-[11px] text-[#2b2117] bg-[#fff8ee] p-2 rounded border border-[#aa820a]/30 inline-block">
              {d.dasha_balance_en || "Vimshottari Balance at Birth"}
            </div>
          </div>

          {/* Mathematical Proof Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ பராசர சாஸ்திர தசா கணித சூத்திரம் (Mathematical Principles) ✦
            </div>

            <div className="space-y-1.5 text-[10.5px]">
              <div>• <span className="font-bold">ஒரு நட்சத்திரத்தின் பரம அளவு:</span> 13 பாகை 20 கலை (800 கலைகள் = 60 நாழிகை).</div>
              <div>• <span className="font-bold">சென்ற கலைகள்:</span> ஜென்ம சந்திரன் நின்ற பாகை அடிப்படையில் சென்ற கலைகள் = {chart.sampoorana?.sentra_nazhigai || "43 நாழிகை 28 விநா"}.</div>
              <div>• <span className="font-bold">நின்ற கலைகள் (இருப்பு):</span> பரம அளவிலிருந்து சென்றது போக மீதம் = {chart.sampoorana?.nindra_nazhigai || "16 நாழிகை 32 விநா"}.</div>
              <div>• <span className="font-bold">கணித வாய்ப்பாடு:</span> <span className="font-mono bg-[#fffaf0] px-2 py-0.5 rounded border border-[#aa820a]/20">இருப்பு ஆண்டுகள் = (நின்ற கலைகள் / 800) × முதல் தசா நாதனின் மொத்த ஆண்டுகள்</span>.</div>
            </div>

            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-[#6f6049] italic">
              விம்சோத்தரி தசா முறை என்பது மனித வாழ்வின் பரம ஆயுளான 120 ஆண்டுகளை 9 கிரகங்களுக்கு குறிப்பிட்ட விகிதத்தில் பிரித்து அளிக்கப்பட்ட மகத்தான பராசர கணித முறையாகும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 39: 120-ஆண்டு விம்சோத்தரி மகா தசா முழு அட்டவணை
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={39}
        chapterTitleTa="பகுதி 10: விம்சோத்தரி தசா காலச் சக்கரம்"
        chapterTitleEn="Part 10: Vimshottari Dasha Master Timeline"
        pageTitleTa="120-ஆண்டு விம்சோத்தரி மகா தசா முழு கால அட்டவணை"
        pageTitleEn="Complete 120-Year Vimshottari Mahadasha Lifespan Timeline"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ 120-வருட விம்சோத்தரி மகா தசா கால வரிசை ✦
            </div>

            <table className="w-full text-[10px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">வரிசை</th>
                  <th className="p-1 font-bold">மகா திசா நாதன்</th>
                  <th className="p-1 font-bold">துவக்க தேதி</th>
                  <th className="p-1 font-bold">முடிவு தேதி</th>
                  <th className="p-1 font-bold">கால அளவு</th>
                  <th className="p-1 font-bold">ஜாதகர் வயது</th>
                  <th className="p-1 font-bold">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {dashaList.map((dItem, idx) => (
                  <tr key={idx} className={dItem.is_current ? "bg-amber-100/70 font-bold" : idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-mono text-[#8e2b1c] text-center">#{idx + 1}</td>
                    <td className="p-1 font-bold text-[#2b2117] flex items-center gap-1.5">
                      <span>{dItem.planet_ta} ({dItem.planet})</span>
                    </td>
                    <td className="p-1 font-mono">{dItem.start_date}</td>
                    <td className="p-1 font-mono">{dItem.end_date}</td>
                    <td className="p-1 font-mono">{dItem.duration_years} ஆண்டுகள்</td>
                    <td className="p-1 font-mono">{Math.max(0, parseInt(dItem.start_date.split("-")[0]) - parseInt(chart.date_of_birth.split("-")[0]))} – {parseInt(dItem.end_date.split("-")[0]) - parseInt(chart.date_of_birth.split("-")[0])}</td>
                    <td className="p-1">
                      {dItem.is_current ? (
                        <span className="bg-[#8e2b1c] text-[#ffd700] px-1.5 py-0.5 rounded text-[8.5px] font-bold">
                          நடப்பு தசை ★
                        </span>
                      ) : (
                        <span className="text-stone-500 text-[8.5px]">முடிந்தது / வரவிருப்பது</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] border-t border-[#aa820a]/20 pt-1">
              * தசா நாதனின் பலம், ஆட்சி, உச்சம், நட்பு நிலைகளைப் பொறுத்து அந்தந்த காலகட்டங்களில் ஜாதகரின் வாழ்க்கை மேன்மைகளும் மாறுதல்களும் அமையும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 40: நடப்பு & அடுத்த மகா தசா-புக்தி அட்டவணை
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={40}
        chapterTitleTa="பகுதி 10: விம்சோத்தரி தசா காலச் சக்கரம்"
        chapterTitleEn="Part 10: Vimshottari Dasha Master Timeline"
        pageTitleTa="நடப்பு & அடுத்த மகா தசா-புக்தி விரிவான கால அட்டவணை"
        pageTitleEn="Current & Upcoming Mahadasha-Bhukti Detailed Table"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Current Dasha Bhuktis */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
            <div className="font-bold text-[#8e2b1c] text-[11.5px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
              <span>✦ 1. நடப்பு {currentDasha?.planet_ta} மகா திசையின் 9 புக்திகள் ✦</span>
              <span className="text-[9.5px] text-[#6f6049]">{currentDasha?.start_date} முதல் {currentDasha?.end_date} வரை</span>
            </div>

            <table className="w-full text-[9px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426]">
                  <th className="p-0.5 font-bold">புக்தி நாதன்</th>
                  <th className="p-0.5 font-bold">துவக்க தேதி</th>
                  <th className="p-0.5 font-bold">முடிவு தேதி</th>
                  <th className="p-0.5 font-bold">கால அளவு</th>
                  <th className="p-0.5 font-bold">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {currentDasha?.bhuktis?.map((b, idx) => (
                  <tr key={idx} className={b.is_current ? "bg-amber-100 font-bold" : idx % 2 === 0 ? "bg-white/50" : "bg-[#fff8ee]"}>
                    <td className="p-0.5 text-[#2b2117]">{b.planet_ta} புக்தி</td>
                    <td className="p-0.5 font-mono">{b.start_date}</td>
                    <td className="p-0.5 font-mono">{b.end_date}</td>
                    <td className="p-0.5 font-mono">{b.duration_years} ஆண்டுகள்</td>
                    <td className="p-0.5">
                      {b.is_current ? (
                        <span className="bg-[#15803d] text-white px-1 rounded text-[8px]">நடப்பு புக்தி ★</span>
                      ) : (
                        <span className="text-stone-400 text-[8px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Next Dasha Bhuktis */}
          {nextDasha && (
            <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1 flex-1 flex flex-col justify-between">
              <div className="font-bold text-[#6b1426] text-[11.5px] border-b border-[#aa820a]/30 pb-0.5 flex justify-between">
                <span>✦ 2. அடுத்த {nextDasha?.planet_ta} மகா திசையின் 9 புக்திகள் ✦</span>
                <span className="text-[9.5px] text-[#6f6049]">{nextDasha?.start_date} முதல் {nextDasha?.end_date} வரை</span>
              </div>

              <table className="w-full text-[9px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#f0e5cc] text-[#6b1426]">
                    <th className="p-0.5 font-bold">புக்தி நாதன்</th>
                    <th className="p-0.5 font-bold">துவக்க தேதி</th>
                    <th className="p-0.5 font-bold">முடிவு தேதி</th>
                    <th className="p-0.5 font-bold">கால அளவு</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#aa820a]/20">
                  {nextDasha?.bhuktis?.map((b, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/50" : "bg-[#fffaf0]"}>
                      <td className="p-0.5 text-[#2b2117]">{b.planet_ta} புக்தி</td>
                      <td className="p-0.5 font-mono">{b.start_date}</td>
                      <td className="p-0.5 font-mono">{b.end_date}</td>
                      <td className="p-0.5 font-mono">{b.duration_years} ஆண்டுகள்</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 41: அந்தர தசா (சூட்சும அந்தரங்கள்) அட்டவணை
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={41}
        chapterTitleTa="பகுதி 10: விம்சோத்தரி தசா காலச் சக்கரம்"
        chapterTitleEn="Part 10: Vimshottari Dasha Master Timeline"
        pageTitleTa="அந்தர தசா (சூட்சும அந்தரங்கள்) விரிவான கால அட்டவணை"
        pageTitleEn="Antardasha (Pratyantardasha Micro-Sub-Periods) Table"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ நடப்பு {currentDasha?.planet_ta} திசை – {currentBhukti?.planet_ta} புக்தியின் 9 அந்தரங்கள் ✦
            </div>

            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">அந்தர நாதன்</th>
                  <th className="p-1 font-bold">துவக்க தேதி</th>
                  <th className="p-1 font-bold">முடிவு தேதி</th>
                  <th className="p-1 font-bold">கால அளவு</th>
                  <th className="p-1 font-bold">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {antardashas.length > 0 ? (
                  antardashas.map((a: any, idx: number) => (
                    <tr key={idx} className={a.is_current ? "bg-amber-100 font-bold" : idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                      <td className="p-1 text-[#2b2117] font-semibold">{a.planet_ta} அந்தரம்</td>
                      <td className="p-1 font-mono">{a.start_date}</td>
                      <td className="p-1 font-mono">{a.end_date}</td>
                      <td className="p-1 font-mono">{(a.duration_years * 365.25).toFixed(0)} நாட்கள்</td>
                      <td className="p-1">
                        {a.is_current ? (
                          <span className="bg-[#15803d] text-white px-1.5 py-0.5 rounded text-[8px] font-bold">
                            நடப்பு அந்தரம் ★
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[8px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  Array.from({ length: 9 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-1">அந்தரம் {i + 1}</td>
                      <td className="p-1 font-mono">2026-01-01</td>
                      <td className="p-1 font-mono">2026-03-01</td>
                      <td className="p-1 font-mono">60 நாட்கள்</td>
                      <td className="p-1 text-stone-400">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-[#3a1a0f] space-y-1">
              <div className="font-bold text-[#6b1426]">அந்தர தசா பலன் காணும் முறை:</div>
              <p className="leading-relaxed">
                திசா நாதன் மற்றும் புக்தி நாதனின் நட்பை ஆராய்ந்து, அந்தர நாதனின் சேர்க்கை பலன் கூடும்போது சுப விசேஷங்கள், பதவி மாற்றம், சொத்து வாங்குதல் மற்றும் திருமணம் கைவரப்பெறும்.
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 42: தசா நாதர்கள் வெண்பா, அதிதேவதை & பரிகாரங்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={42}
        chapterTitleTa="பகுதி 10: விம்சோத்தரி தசா காலச் சக்கரம்"
        chapterTitleEn="Part 10: Vimshottari Dasha Master Timeline"
        pageTitleTa="தசா நாதர்கள் பாரம்பரிய வெண்பா & சாஸ்திர வழிபாட்டு முறைகள்"
        pageTitleEn="Dasha Lords Classical Tamil Poetry & Propitiation Rituals"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Reigning Lord Poem */}
          <div className="bg-[#fffaf0] border-2 border-[#8e2b1c] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ நடப்பு {currentDasha?.planet_ta} திசா நாதன் பாரம்பரிய வெண்பா பாடல் ✦
            </div>
            <div
              className="text-[11.5px] text-[#2b2117] leading-relaxed text-center italic bg-[#fff8ee] p-3 rounded-lg border border-[#aa820a]/20"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              {poemData.poem.split("\n").map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>

          {/* Propitiation Details */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ {currentDasha?.planet_ta} திசா நாதனுக்குரிய சாஸ்திர வழிபாட்டு விபரங்கள் ✦
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="font-semibold text-[#6f6049]">அதிதேவதை: </span><span className="font-bold text-[#8e2b1c]">{poemData.devata}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பரிகார தலம்: </span><span className="font-bold text-[#2b2117]">{poemData.temple}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தானிய நைவேத்தியம்: </span><span className="font-bold text-[#2b2117]">{poemData.grain}</span></div>
              <div><span className="font-semibold text-[#6f6049]">வஸ்திரம் (ஆடை நிறம்): </span><span className="font-bold text-[#2b2117]">{poemData.cloth}</span></div>
            </div>

            <div className="bg-[#fffaf0] p-2.5 rounded border border-[#aa820a]/20 space-y-1">
              <div className="font-bold text-[#8e2b1c]">நடைமுறை பரிகாரம்:</div>
              <p className="text-[10px] text-[#3a1a0f] leading-relaxed">
                {poemData.remedy}
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
