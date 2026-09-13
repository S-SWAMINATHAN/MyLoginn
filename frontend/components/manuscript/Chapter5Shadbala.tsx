"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter5Shadbala: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const shadbala = chart.shadbala?.planets || {};
  const planetList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

  // Default fallback values if not computed
  const defaultBala: Record<string, any> = {
    Sun: { sthana: 165.2, dig: 52.1, kaala: 142.3, cheshta: 45.0, naisargika: 60.0, drig: -8.4, total: 456.2, rupas: 7.60, req: 6.5, ta: "சூரியன்" },
    Moon: { sthana: 148.5, dig: 48.3, kaala: 175.4, cheshta: 32.1, naisargika: 51.4, drig: 12.5, total: 468.2, rupas: 7.80, req: 6.0, ta: "சந்திரன்" },
    Mars: { sthana: 132.4, dig: 35.6, kaala: 112.8, cheshta: 48.7, naisargika: 17.1, drig: -4.2, total: 342.4, rupas: 5.71, req: 5.0, ta: "செவ்வாய்" },
    Mercury: { sthana: 185.3, dig: 58.2, kaala: 135.6, cheshta: 38.4, naisargika: 25.7, drig: 8.6, total: 451.8, rupas: 7.53, req: 7.0, ta: "புதன்" },
    Jupiter: { sthana: 195.4, dig: 55.4, kaala: 158.2, cheshta: 42.1, naisargika: 34.3, drig: 14.8, total: 500.2, rupas: 8.34, req: 6.5, ta: "குரு" },
    Venus: { sthana: 162.1, dig: 42.8, kaala: 144.5, cheshta: 29.3, naisargika: 42.9, drig: -6.1, total: 415.5, rupas: 6.93, req: 5.5, ta: "சுக்கிரன்" },
    Saturn: { sthana: 125.8, dig: 28.4, kaala: 98.6, cheshta: 52.4, naisargika: 8.6, drig: -12.4, total: 301.4, rupas: 5.02, req: 5.0, ta: "சனி" },
  };

  const rows = planetList.map((pName) => {
    const raw = shadbala[pName];
    const def = defaultBala[pName];
    if (raw) {
      return {
        name: pName,
        name_ta: raw.planet_ta || def.ta,
        sthana: raw.sthana_bala?.total || def.sthana,
        dig: raw.dig_bala || def.dig,
        kaala: raw.kaala_bala?.total || def.kaala,
        cheshta: raw.cheshta_bala || def.cheshta,
        naisargika: raw.naisargika_bala || def.naisargika,
        drig: raw.drig_bala || def.drig,
        total: raw.total_virupas || def.total,
        rupas: raw.total_rupas || def.rupas,
        req: raw.minimum_required_rupas || def.req,
      };
    }
    return {
      name: pName,
      name_ta: def.ta,
      ...def,
    };
  });

  // Sort by rupas descending for ranking
  const sortedByRank = [...rows].sort((a, b) => b.rupas - a.rupas);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 18: ஷட்பல விரிவான கணித அட்டவணை (SHADBALA VIRUPAS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={18}
        chapterTitleTa="பகுதி 5: ஷட்பல & பாவக பல கணிதம்"
        chapterTitleEn="Part 5: Shadbala & Bhava Strengths"
        pageTitleTa="ஷட்பல அறுவகை கிரக பல கணித அட்டவணை"
        pageTitleEn="Shadbala 6-Fold Planetary Strength Matrix (Virupas)"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ பராசர சாஸ்திர ஷட்பல ஆறு வகை மூல பலன்கள் (விருபைகளில்) ✦
            </div>

            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">கிரகம்</th>
                  <th className="p-1 font-bold">ஸ்தான பலம்</th>
                  <th className="p-1 font-bold">திக் பலம்</th>
                  <th className="p-1 font-bold">கால பலம்</th>
                  <th className="p-1 font-bold">சேஷ்டா பலம்</th>
                  <th className="p-1 font-bold">நைசர்கிக பலம்</th>
                  <th className="p-1 font-bold">திருக் பலம்</th>
                  <th className="p-1 font-bold">மொத்த விருபைகள்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-bold text-[#2b2117]">{r.name_ta} ({r.name})</td>
                    <td className="p-1 font-mono">{r.sthana.toFixed(1)}</td>
                    <td className="p-1 font-mono">{r.dig.toFixed(1)}</td>
                    <td className="p-1 font-mono">{r.kaala.toFixed(1)}</td>
                    <td className="p-1 font-mono">{r.cheshta.toFixed(1)}</td>
                    <td className="p-1 font-mono">{r.naisargika.toFixed(1)}</td>
                    <td className="p-1 font-mono">{r.drig.toFixed(1)}</td>
                    <td className="p-1 font-mono font-bold text-[#8e2b1c]">{r.total.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-[#fff8ee] border border-[#aa820a]/30 rounded p-2 text-[9.5px] text-[#3a1a0f] space-y-1 mt-1">
              <div className="font-bold text-[#6b1426]">அறுவகை பலன்களின் விளக்கம்:</div>
              <div>• <span className="font-bold">ஸ்தான பலம்:</span> ஆட்சி, உச்சம், நட்பு, கேந்திர திரிகோணங்களில் நிற்பதால் வரும் பலம்.</div>
              <div>• <span className="font-bold">திக் பலம்:</span> குறிப்பிட்ட திசைகளில் கிரகங்கள் பெறுவது (லக்னத்தில் குரு/புதன், 4-ல் சந்திரன்/சுக்கிரன், 7-ல் சனி, 10-ல் சூரியன்/செவ்வாய்).</div>
              <div>• <span className="font-bold">கால பலம்:</span> பிறந்த காலம் (பகல்/இரவு, பக்ஷம், வாரம், ஹோரை, அயனம்) சார்ந்தது.</div>
              <div>• <span className="font-bold">சேஷ்டா பலம்:</span> கிரகங்களின் வக்ர இயக்கம் மற்றும் விசேஷ வேகத்தால் கிட்டும் பலம்.</div>
              <div>• <span className="font-bold">நைசர்கிக பலம்:</span> இயற்கை ஒளிப் பிரகாசம் (சூரியன் முதல் சனி வரை வரிசைப்படி).</div>
              <div>• <span className="font-bold">திருக் பலம்:</span> சுப அல்லது அசுப கிரகங்களின் பார்வையால் ஏற்படும் பலன்.</div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 19: ஷட்பல ரூபங்கள் & தரவரிசை பலன்கள் (SHADBALA RANKS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={19}
        chapterTitleTa="பகுதி 5: ஷட்பல & பாவக பல கணிதம்"
        chapterTitleEn="Part 5: Shadbala & Bhava Strengths"
        pageTitleTa="ஷட்பல ரூபங்கள், தேவையான பலம் & தரவரிசை பலன்கள்"
        pageTitleEn="Shadbala Rupas, Minimum Requirement & Planetary Rankings"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஷட்பல ரூபங்கள் & பராசர சாஸ்திர தரவரிசை அட்டவணை ✦
            </div>

            <table className="w-full text-[10px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">தரம் (Rank)</th>
                  <th className="p-1 font-bold">கிரகம்</th>
                  <th className="p-1 font-bold">பெற்ற ரூபங்கள்</th>
                  <th className="p-1 font-bold">தேவைப்படும் ரூபங்கள்</th>
                  <th className="p-1 font-bold">விகிதாச்சாரம் (%)</th>
                  <th className="p-1 font-bold">பலன் தகுதி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {sortedByRank.map((r, idx) => {
                  const ratio = ((r.rupas / r.req) * 100).toFixed(0);
                  const isStrong = parseFloat(ratio) >= 100;
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                      <td className="p-1 font-bold text-[#8e2b1c]">
                        #{idx + 1} {idx === 0 && "★"}
                      </td>
                      <td className="p-1 font-bold text-[#2b2117]">{r.name_ta}</td>
                      <td className="p-1 font-mono font-bold text-[#15803d]">{r.rupas.toFixed(2)}</td>
                      <td className="p-1 font-mono">{r.req.toFixed(1)}</td>
                      <td className="p-1 font-mono font-bold">{ratio}%</td>
                      <td className="p-1">
                        <span
                          className={`px-1 py-0.5 rounded text-[8.5px] font-bold ${
                            isStrong
                              ? "bg-green-100 text-green-900 border border-green-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {isStrong ? "முழு பலம் வாய்ந்தது" : "சராசரி பலம்"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Life Impact Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="font-bold text-[#6b1426] text-[11px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஷட்பல முதன்மை கிரகத்தின் வாழ்வியல் தாக்கம் ✦
            </div>
            <p className="text-[10.5px] text-[#3a1a0f] leading-relaxed">
              ஜாதகத்தில் முதலிடம் பெற்றுள்ள <span className="font-bold text-[#8e2b1c]">'{sortedByRank[0]?.name_ta}'</span> பகவான் ஜாதகரின் சிந்தனை, குணாதிசயம் மற்றும் வெற்றி வாய்ப்புகளை வழிநடத்தும் தலைமை கிரகமாக விளங்குகிறார்.
            </p>
            <div className="text-[10px] text-[#6f6049] italic border-t border-[#aa820a]/20 pt-1 leading-relaxed">
              "ஷட்பலத்தில் பலம் பெற்ற சுப கிரகம் தசா காலத்தில் மகா யோகங்களை வாரி வழங்கும்; அசுப கிரகமாயின் போராட்டங்களை எதிர்கொள்ளும் அசாத்திய ஆற்றலையும் துணிவையும் அருளும்."
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 20: பாவக பலக் கணிதம் (BHAVABALA 12 HOUSES)

          NOTE (see chat): this table's numbers (adh/dig/dri/tot/st for
          every house) are static/hardcoded — identical for every chart,
          not computed from the person's actual planets. Only the crash
          (`d.lagnam_ta`) is fixed here; the accuracy issue is left as-is
          pending a decision on whether to build the real calculation.
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={20}
        chapterTitleTa="பகுதி 5: ஷட்பல & பாவக பல கணிதம்"
        chapterTitleEn="Part 5: Shadbala & Bhava Strengths"
        pageTitleTa="12 பாவக பலக் கணிதம் (Bhavabala 12 Houses Analysis)"
        pageTitleEn="12 Houses Bhavabala Strengths & Dimensional Ratings"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ பாவக அதிபதி பலம், திக் பலம் & திருக் பலக் கூட்டுத்தொகை ✦
            </div>

            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">பாவகம்</th>
                  <th className="p-1 font-bold">ராசி</th>
                  <th className="p-1 font-bold">பாவக காரகம்</th>
                  <th className="p-1 font-bold">அதிபதி பலம்</th>
                  <th className="p-1 font-bold">திக் பலம்</th>
                  <th className="p-1 font-bold">திருக் பலம்</th>
                  <th className="p-1 font-bold">மொத்த பாவக பலம்</th>
                  <th className="p-1 font-bold">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {[
                  { bhava: "1-ஆம் பாவம்", rasi: chart.basic_details.lagnam_ta, karaka: "உடல், உயிர், ஆளுமை", adh: 7.2, dig: 1.0, dri: 0.4, tot: 8.6, st: "மிக உத்தமம்" },
                  { bhava: "2-ஆம் பாவம்", rasi: "தன ஸ்தானம்", karaka: "தனம், வாக்கு, குடும்பம்", adh: 6.5, dig: 0.8, dri: 0.2, tot: 7.5, st: "உத்தமம்" },
                  { bhava: "3-ஆம் பாவம்", rasi: "சகோதர ஸ்தானம்", karaka: "தைரியம், இளைய சகோதரம்", adh: 5.8, dig: 0.6, dri: -0.1, tot: 6.3, st: "நன்று" },
                  { bhava: "4-ஆம் பாவம்", rasi: "சுக ஸ்தானம்", karaka: "தாய், சுகம், சொத்து, வாகனம்", adh: 7.5, dig: 1.0, dri: 0.5, tot: 9.0, st: "அதி உத்தமம்" },
                  { bhava: "5-ஆம் பாவம்", rasi: "புத்திர ஸ்தானம்", karaka: "பூர்வ புண்ணியம், குழந்தைகள்", adh: 7.8, dig: 0.7, dri: 0.6, tot: 9.1, st: "அதி உத்தமம்" },
                  { bhava: "6-ஆம் பாவம்", rasi: "ரோக ஸ்தானம்", karaka: "ருண, ரோக, சத்ரு வெற்றி", adh: 5.2, dig: 0.5, dri: -0.3, tot: 5.4, st: "சராசரி" },
                  { bhava: "7-ஆம் பாவம்", rasi: "களத்திர ஸ்தானம்", karaka: "திருமணம், கூட்டாண்மை", adh: 6.8, dig: 0.9, dri: 0.3, tot: 8.0, st: "உத்தமம்" },
                  { bhava: "8-ஆம் பாவம்", rasi: "ஆயுள் ஸ்தானம்", karaka: "ஆயுள், எதிர்பாராத லாபம்", adh: 5.5, dig: 0.4, dri: -0.2, tot: 5.7, st: "நன்று" },
                  { bhava: "9-ஆம் பாவம்", rasi: "பாக்கிய ஸ்தானம்", karaka: "தந்தை, தர்மம், பாக்கியம்", adh: 8.1, dig: 0.8, dri: 0.7, tot: 9.6, st: "அதி உத்தமம்" },
                  { bhava: "10-ஆம் பாவம்", rasi: "கர்ம ஸ்தானம்", karaka: "தொழில், உத்தியோகம், கீர்த்தி", adh: 7.6, dig: 1.0, dri: 0.5, tot: 9.1, st: "அதி உத்தமம்" },
                  { bhava: "11-ஆம் பாவம்", rasi: "லாப ஸ்தானம்", karaka: "லாபம், மூத்த சகோதரம்", adh: 7.0, dig: 0.6, dri: 0.4, tot: 8.0, st: "உத்தமம்" },
                  { bhava: "12-ஆம் பாவம்", rasi: "மோக்ஷ ஸ்தானம்", karaka: "சுப விரயம், ஆன்மீகம், மோக்ஷம்", adh: 5.0, dig: 0.5, dri: -0.1, tot: 5.4, st: "சராசரி" },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-bold text-[#8e2b1c]">{row.bhava}</td>
                    <td className="p-1 font-semibold">{row.rasi}</td>
                    <td className="p-1">{row.karaka}</td>
                    <td className="p-1 font-mono">{row.adh.toFixed(1)}</td>
                    <td className="p-1 font-mono">{row.dig.toFixed(1)}</td>
                    <td className="p-1 font-mono">{row.dri.toFixed(1)}</td>
                    <td className="p-1 font-mono font-bold text-[#15803d]">{row.tot.toFixed(1)}</td>
                    <td className="p-1 font-semibold text-[#6b1426]">{row.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] border-t border-[#aa820a]/20 pt-1">
              * பாவக பலம் என்பது அதிபதியின் பலம், பாவகத்தின் இருப்பிடம் மற்றும் பார்வை பலன்களை ஒருங்கே கூட்டி பெறப்படும் பரிபூரண சக்தி அளவாகும்.
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};