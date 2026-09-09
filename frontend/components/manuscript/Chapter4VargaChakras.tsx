"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper, MiniSouthIndianChart } from "./shared";

export const Chapter4VargaChakras: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const planets = chart.planets || [];
  const rasiKattam = chart.rasi_kattam || {};
  const navamsaKattam = chart.navamsa_kattam || {};
  const vargas = chart.varga_chakras || chart.sampoorana?.varga_chakras || {};
  const bhavaSphutam = chart.bhava_sphutam || chart.sampoorana?.bhava_sphutam || [];

  // Vargottama planets: same rasi_number and navamsa_sign
  const vargottamaPlanets = planets.filter((p) => {
    const rasiSign = p.rasi_number;
    const navSign = p.navamsa_sign || (Math.floor(p.total_degree / (360 / 108)) % 12) + 1;
    return rasiSign === navSign;
  });

  // Helper to convert kattam dict to array for MiniSouthIndianChart
  const getVargaChartData = (vKey: string) => {
    const raw = vargas[vKey] || {};
    const res: Record<number, Array<{ name: string; symbol: string }>> = {};
    for (let i = 1; i <= 12; i++) {
      res[i] = raw[i] || [];
    }
    return res;
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 11: ஜென்ம ராசி சக்கரம் D1 (JANMA RASI CHAKRA)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={11}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="ஜென்ம ராசி சக்கரம் (Janma Rasi Chakra - D1)"
        pageTitleEn="Janma Rasi Birth Chart (D1 Core Physical Manifestation)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Main D1 Kattam */}
          <div className="flex justify-center flex-1">
            <div className="w-full max-w-[500px]">
              <MiniSouthIndianChart
                title="D1 Birth Chart"
                titleTa="ஜென்ம ராசி சக்கரம்"
                subTitleTa="லக்னம் மற்றும் 9 கிரகங்களின் அமர்வு நிலை"
                planetsBySign={chart.rasi_kattam as any}
                highlightLagnaSign={planets.find((p) => p.name === "Sun")?.rasi_number || 1}
              />
            </div>
          </div>

          {/* Core Analysis Box */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஜென்ம ராசி சக்கர முக்கிய அம்சங்கள் ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="font-semibold text-[#6f6049]">உதய லக்னம்: </span><span className="font-bold text-[#8e2b1c]">{d.lagnam_ta} ({d.lagnam_dms || `${d.lagnam_degree.toFixed(2)}°`})</span></div>
              <div><span className="font-semibold text-[#6f6049]">லக்னாதிபதி: </span><span className="font-bold text-[#2b2117]">{d.lagnam_lord_ta || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">ஜென்ம ராசி (சந்திரன்): </span><span className="font-bold text-[#8e2b1c]">{d.rasi_ta}</span></div>
              <div><span className="font-semibold text-[#6f6049]">ராசிநாதன்: </span><span className="font-bold text-[#2b2117]">{d.rasi_lord_ta || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">ஜென்ம நட்சத்திரம்: </span><span className="font-bold text-[#8e2b1c]">{d.nakshatram_ta} ({d.pada}-ஆம் பாதம்)</span></div>
              <div><span className="font-semibold text-[#6f6049]">நட்சத்திராதிபதி: </span><span className="font-bold text-[#2b2117]">{d.nakshatra_lord_ta || "—"}</span></div>
            </div>
            <p className="text-[9.5px] text-[#6f6049] italic border-t border-[#aa820a]/20 pt-1 leading-relaxed">
              ராசி சக்கரம் என்பது மனிதனின் பருவுடல் தோற்றம், பூவுலக வாழ்க்கை நிகழ்வுகள், சுக துக்கங்கள் மற்றும் ஸ்தூல வாழ்வின் அடிப்படை வரைபடமாகும்.
            </p>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 12: நவாம்ச சக்கரம் D9 (NAVAMSA CHAKRA)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={12}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="நவாம்ச சக்கரம் (Navamsa Chakra - D9)"
        pageTitleEn="Navamsa Chart (D9 Soul Purpose & Marital Destiny)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Main D9 Kattam */}
          <div className="flex justify-center flex-1">
            <div className="w-full max-w-[500px]">
              <MiniSouthIndianChart
                title="D9 Navamsa Chart"
                titleTa="நவாம்ச சக்கரம்"
                subTitleTa="ஆன்ம நோக்கம் & களத்திர யோக நிர்ணயம்"
                planetsBySign={chart.navamsa_kattam as any}
              />
            </div>
          </div>

          {/* D9 Analysis & Vargottama */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ நவாம்ச சக்கர முக்கிய பலன்கள் ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div><span className="font-semibold text-[#6f6049]">நவாம்ச லக்னம்: </span><span className="font-bold text-[#8e2b1c]">{d.lagnam_navamsa_ta || "ரிஷபம்"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">நவாம்ச லக்னாதிபதி: </span><span className="font-bold text-[#2b2117]">{d.lagnam_navamsa_lord_ta || "சுக்கிரன்"}</span></div>
              <div className="col-span-2">
                <span className="font-semibold text-[#6f6049]">வர்க்கோத்தம கிரகங்கள் (D1 & D9 சம ராசி): </span>
                <span className="font-bold text-[#15803d]">
                  {vargottamaPlanets.length > 0
                    ? vargottamaPlanets.map((p) => `${p.name_ta} (${p.rasi_ta})`).join(", ")
                    : "வர்க்கோத்தம கிரகங்கள் அமையவில்லை"}
                </span>
              </div>
            </div>
            <p className="text-[9.5px] text-[#6f6049] italic border-t border-[#aa820a]/20 pt-1 leading-relaxed">
              “ராசி சக்கரம் மரத்தைப் போன்றது; நவாம்ச சக்கரம் அதன் கனியைப் போன்றது.” திருமண வாழ்க்கை, வாழ்க்கைத் துணையின் குணம் மற்றும் 32 வயதிற்குப் பின்னரான ஆன்ம மேன்மை நவாம்சத்தால் அறியப்படுகிறது.
            </p>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 13: பாவக சக்கரம் & பாவக ஸ்புடம் (BHAVA CHALIT)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={13}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="ஸ்ரீபதி பாவக சக்கரம் & 12 பாவக ஆரம்ப-மத்திய-முடிவு ஸ்புடம்"
        pageTitleEn="Sripati Bhava Chalit Chart & 12 Houses Cuspal Degrees"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Bhava Sphutam Table */}
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ 12 பாவக ஆரம்பம், மத்தியம் (சந்தி) & முடிவு ஸ்புடக் கணிதம் ✦
            </div>

            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">பாவகம்</th>
                  <th className="p-1 font-bold">ராசி</th>
                  <th className="p-1 font-bold">ஆரம்ப பாகை</th>
                  <th className="p-1 font-bold">பாவக மத்தியம்</th>
                  <th className="p-1 font-bold">முடிவு பாகை</th>
                  <th className="p-1 font-bold">அதிபதி</th>
                  <th className="p-1 font-bold">அமர்ந்த கிரகங்கள்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {bhavaSphutam.length > 0 ? (
                  bhavaSphutam.map((b: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                      <td className="p-1 font-bold text-[#8e2b1c]">{b.bhava_number || idx + 1}-ஆம் பாவம்</td>
                      <td className="p-1">{b.rasi_ta || b.sign_name_ta || "—"}</td>
                      <td className="p-1 font-mono">{b.start_dms || "—"}</td>
                      <td className="p-1 font-mono font-bold text-[#15803d]">{b.madhya_dms || b.cusp_dms || "—"}</td>
                      <td className="p-1 font-mono">{b.end_dms || "—"}</td>
                      <td className="p-1">{b.lord_ta || "—"}</td>
                      <td className="p-1 font-bold text-[#6b1426]">{b.occupants_ta || b.occupants?.join(", ") || "வெற்றிடம்"}</td>
                    </tr>
                  ))
                ) : (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-1 font-bold text-[#8e2b1c]">{i + 1}-ஆம் பாவம்</td>
                      <td className="p-1">ராசி {i + 1}</td>
                      <td className="p-1 font-mono">{(i * 30).toFixed(0)}° 00'</td>
                      <td className="p-1 font-mono font-bold text-[#15803d]">{(i * 30 + 15).toFixed(0)}° 00'</td>
                      <td className="p-1 font-mono">{((i + 1) * 30).toFixed(0)}° 00'</td>
                      <td className="p-1">அதிபதி</td>
                      <td className="p-1 text-stone-500">சுப பலன்</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] border-t border-[#aa820a]/20 pt-1">
              * பாவக சந்தி மற்றும் ஸ்ரீபதி கணிதத்தின்படி, ராசியில் ஒரு வீட்டில் நிற்கும் கிரகம் பாவக கணிதத்தில் முந்தைய அல்லது அடுத்த பாவத்திற்கு மாறக்கூடும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 14: வர்க்க சக்கரங்கள் தொகுதி 1 (D2, D3, D4, D7)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={14}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="ஷோடசவர்க்க சக்கரங்கள் - தொகுதி 1 (D2, D3, D4, D7)"
        pageTitleEn="Shodashavarga Charts Group 1 (Wealth, Siblings, Property, Progeny)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <MiniSouthIndianChart
              title="D2 Hora"
              titleTa="D2 ஹோரா சக்கரம்"
              subTitleTa="பொருளாதாரம், தன தான்யம், செல்வ வளம்"
              planetsBySign={getVargaChartData("D2_Hora")}
            />
            <MiniSouthIndianChart
              title="D3 Drekkana"
              titleTa="D3 திரேக்காண சக்கரம்"
              subTitleTa="சகோதர வழிகள், தைரியம், பராக்கிரமம்"
              planetsBySign={getVargaChartData("D3_Drekkana")}
            />
            <MiniSouthIndianChart
              title="D4 Chaturthamsa"
              titleTa="D4 சதுர்த்தாம்ச சக்கரம்"
              subTitleTa="நிலபுலன்கள், வீடு மனை, அசையா சொத்து"
              planetsBySign={getVargaChartData("D4_Chaturthamsa")}
            />
            <MiniSouthIndianChart
              title="D7 Saptamsa"
              titleTa="D7 சப்தாம்ச சக்கரம்"
              subTitleTa="புத்திர பாக்கியம், வம்ச விருத்தி, பேரக்குழந்தைகள்"
              planetsBySign={getVargaChartData("D7_Saptamsa")}
            />
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 15: வர்க்க சக்கரங்கள் தொகுதி 2 (D10, D12, D16, D20)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={15}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="ஷோடசவர்க்க சக்கரங்கள் - தொகுதி 2 (D10, D12, D16, D20)"
        pageTitleEn="Shodashavarga Charts Group 2 (Career, Parents, Conveyances, Spiritual Path)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <MiniSouthIndianChart
              title="D10 Dasamsa"
              titleTa="D10 தசாம்ச சக்கரம்"
              subTitleTa="தொழில் மேன்மை, அரசு பதவி, கீர்த்தி"
              planetsBySign={getVargaChartData("D10_Dasamsa")}
            />
            <MiniSouthIndianChart
              title="D12 Dvadasamsa"
              titleTa="D12 துவாதசாம்ச சக்கரம்"
              subTitleTa="தாய் தந்தை நலம், பித்ரு கடன், பூர்வீகம்"
              planetsBySign={getVargaChartData("D12_Dvadasamsa")}
            />
            <MiniSouthIndianChart
              title="D16 Shodasamsa"
              titleTa="D16 சோடசாம்ச சக்கரம்"
              subTitleTa="வாகன யோகம், சுகபோகங்கள், ஆனந்தம்"
              planetsBySign={getVargaChartData("D16_Shodadamsa")}
            />
            <MiniSouthIndianChart
              title="D20 Vimsamsa"
              titleTa="D20 விம்சாம்ச சக்கரம்"
              subTitleTa="ஆன்மீக உபாசனை, பக்தி, மந்திர சித்தி"
              planetsBySign={getVargaChartData("D20_Vimsamsa")}
            />
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 16: வர்க்க சக்கரங்கள் தொகுதி 3 (D24, D27, D30, D60)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={16}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="ஷோடசவர்க்க சக்கரங்கள் - தொகுதி 3 (D24, D27, D30, D60)"
        pageTitleEn="Shodashavarga Charts Group 3 (Education, Vitality, Arishta, Past Karma)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <MiniSouthIndianChart
              title="D24 Chaturvimsamsa"
              titleTa="D24 சதுர்விம்சாம்சம்"
              subTitleTa="உயர் கல்வி, சாஸ்திர ஞானம், நுண்ணறிவு"
              planetsBySign={getVargaChartData("D24_Chaturvimsamsa")}
            />
            <MiniSouthIndianChart
              title="D27 Saptavimsamsa"
              titleTa="D27 சப்தவிம்சாம்சம்"
              subTitleTa="உடல் பலம், மன வலிமை, பலவீனங்கள்"
              planetsBySign={getVargaChartData("D27_Saptavimsamsa")}
            />
            <MiniSouthIndianChart
              title="D30 Trimsamsa"
              titleTa="D30 திரிம்சாம்சம்"
              subTitleTa="தோஷங்கள், நோய்கள், துன்பங்கள்"
              planetsBySign={getVargaChartData("D30_Trimsamsa")}
            />
            <MiniSouthIndianChart
              title="D60 Shashtiamsa"
              titleTa="D60 ஷஷ்டியாம்சம்"
              subTitleTa="பூர்வ புண்ணியம், முற்பிறவி கர்ம வினை"
              planetsBySign={getVargaChartData("D60_Shashtiamsa")}
            />
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 17: வர்க்கோத்தம & விசேஷ வர்க்க நிலைகள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={17}
        chapterTitleTa="பகுதி 4: முக்கிய & வர்க்க சக்கரங்கள்"
        chapterTitleEn="Part 4: Core & Divisional Charts"
        pageTitleTa="வர்க்கோத்தம கிரகங்கள் & வைசேஷிகாம்ச உன்னத நிலைகள்"
        pageTitleEn="Vargottama Planets & Vaisheshikamsa Dignities"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Vargottama Highlights */}
          <div className="bg-[#fffaf0] border-2 border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-1">
              ✦ வர்க்கோத்தம உன்னத யோகம் (Vargottama Special Status) ✦
            </div>
            <p className="text-[11px] text-[#3a1a0f] leading-relaxed">
              ஒரு கிரகம் ஜென்ம ராசியிலும் (D1) நவாம்சத்திலும் (D9) ஒரே ராசியில் அமர்ந்திருப்பது <span className="text-[#8e2b1c] font-bold">‘வர்க்கோத்தமம்’</span> எனப்படும். இது ஆட்சி, உச்ச நிலைக்கு சமமான பலனைத் தரும்.
            </p>
            <div className="bg-[#fff8ee] border border-[#aa820a]/30 p-2.5 rounded-lg space-y-1">
              <div className="font-bold text-[#6b1426]">ஜாதகத்தில் வர்க்கோத்தமம் பெற்ற கிரகங்கள்:</div>
              {vargottamaPlanets.length > 0 ? (
                vargottamaPlanets.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#15803d] font-bold">✔ {p.name_ta} ({p.name})</span>
                    <span className="text-[#6f6049]">— {p.rasi_ta} ராசியில் வர்க்கோத்தமம் பெற்று அளப்பரிய யோக பலம் பெற்றுள்ளார்.</span>
                  </div>
                ))
              ) : (
                <div className="text-[#6f6049] italic">நேரடி வர்க்கோத்தமம் இல்லை; எனினும் பிற வர்க்கங்களில் சுப பலம் பெற்றுள்ளன.</div>
              )}
            </div>
          </div>

          {/* Vaisheshikamsa Table */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ பராசர வைசேஷிகாம்ச வர்க்க தகுதிகள் (Vaisheshikamsa Levels) ✦
            </div>
            <table className="w-full text-[10px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#aa820a]">
                  <th className="p-1 font-bold">அம்சம் பெயர்</th>
                  <th className="p-1 font-bold">சுப வர்க்க எண்ணிக்கை</th>
                  <th className="p-1 font-bold">சாஸ்திர பலன்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">பாரிஜாதாம்சம் (Parijata)</td>
                  <td className="p-1">2 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">மகிழ்ச்சியான வாழ்க்கை, நற்குணங்கள்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">உத்தமாம்சம் (Uttama)</td>
                  <td className="p-1">3 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">நற்புகழ், சமுதாயத்தில் உயர்வு</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">கோபுராம்சம் (Gopura)</td>
                  <td className="p-1">4 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">அறிவு, செல்வம், பூமி லாபம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">சிம்மாசனாம்பசம் (Simhasana)</td>
                  <td className="p-1">5 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">அரசு பதவி, தலைமை தாங்கும் தகுதி</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold text-[#8e2b1c]">பர்வதாம்சம் (Parvata)</td>
                  <td className="p-1">6 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">நிலையான சொத்துக்கள், மாளிகை யோகம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold text-[#8e2b1c]">தேவலோகாம்சம் (Devaloka)</td>
                  <td className="p-1">7 வர்க்கங்களில் சுப நிலை</td>
                  <td className="p-1">தெய்வ அருள், ராஜாங்க கௌரவம்</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
