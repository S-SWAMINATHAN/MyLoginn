"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter5Shadbala: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const shadbala = chart.shadbala?.planets || {};
  const planetList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

  // Kalai Magal parity (Phase 2): values come ONLY from the backend engine
  // (kalai_shadbala.py). The previous hard-coded fallback table was removed —
  // AGENTS.md §1.2 forbids placeholder astrological data.
  const PLANET_TA: Record<string, string> = {
    Sun: "சூரியன்", Moon: "சந்திரன்", Mars: "செவ்வாய்", Mercury: "புதன்",
    Jupiter: "குரு", Venus: "சுக்கிரன்", Saturn: "சனி",
  };
  const num = (v: unknown): number => (typeof v === "number" && isFinite(v) ? v : 0);

  const rows = planetList
    .filter((pName) => !!shadbala[pName])
    .map((pName) => {
      const raw: any = shadbala[pName];
      return {
        name: pName,
        name_ta: raw.planet_ta ?? PLANET_TA[pName],
        sthana: num(raw.sthana_bala?.total),
        dig: num(raw.dig_bala),
        kaala: num(raw.kaala_bala?.total),
        cheshta: num(raw.cheshta_bala),
        naisargika: num(raw.naisargika_bala),
        drig: num(raw.drig_bala),
        total: num(raw.total_virupas),
        rupas: num(raw.total_rupas),
        req: num(raw.minimum_required_rupas),
        rank: typeof raw.rank === "number" ? raw.rank : undefined,
      };
    });

  // Kalai Magal ranks by strength percentage (total / required).
  const sortedByRank = [...rows].sort((a, b) =>
    a.rank !== undefined && b.rank !== undefined ? a.rank - b.rank : b.rupas / (b.req || 1) - a.rupas / (a.req || 1)
  );

  // Bhava bala — computed by kalai_shadbala.py (drik, dig, bhavadhipati).
  const BHAVA_LABEL: string[] = ["1-ஆம் பாவம்", "2-ஆம் பாவம்", "3-ஆம் பாவம்", "4-ஆம் பாவம்", "5-ஆம் பாவம்", "6-ஆம் பாவம்", "7-ஆம் பாவம்", "8-ஆம் பாவம்", "9-ஆம் பாவம்", "10-ஆம் பாவம்", "11-ஆம் பாவம்", "12-ஆம் பாவம்"];
  const BHAVA_KARAKA: string[] = ["உடல், உயிர், ஆளுமை", "தனம், வாக்கு, குடும்பம்", "தைரியம், இளைய சகோதரம்", "தாய், சுகம், சொத்து, வாகனம்", "பூர்வ புண்ணியம், குழந்தைகள்", "ருண, ரோக, சத்ரு வெற்றி", "திருமணம், கூட்டாண்மை", "ஆயுள், எதிர்பாராத லாபம்", "தந்தை, தர்மம், பாக்கியம்", "தொழில், உத்தியோகம், கீர்த்தி", "லாபம், மூத்த சகோதரம்", "சுப விரயம், ஆன்மீகம், மோக்ஷம்"];
  const SIGN_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"];
  const bhavaData: any[] = ((chart.shadbala as any)?.bhavas ?? []) as any[];
  const bhavaRows = bhavaData.map((b: any, i: number) => ({
    bhava: BHAVA_LABEL[i] ?? `${i + 1}`,
    rasi: SIGN_TA[(num(b.madhya_sign) || 1) - 1],
    karaka: BHAVA_KARAKA[i] ?? "",
    adh: num(b.adhipati),
    dig: num(b.dig),
    dri: num(b.drik),
    tot: num(b.total_rupas),
    st: b.rank <= 4 ? (lang === "ta" ? "வலிமை" : "Strong") : b.rank <= 8 ? (lang === "ta" ? "சராசரி" : "Average") : (lang === "ta" ? "பலவீனம்" : "Weak"),
  }));

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
                  const ratio = r.req ? ((r.rupas / r.req) * 100).toFixed(0) : "—";
                  const isStrong = r.req ? r.rupas >= r.req : false;
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
          Values computed by kalai_shadbala.py (Kalai Magal parity, Phase 2).
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
                {bhavaRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-bold text-[#8e2b1c]">{row.bhava}</td>
                    <td className="p-1 font-semibold">{row.rasi}</td>
                    <td className="p-1">{row.karaka}</td>
                    <td className="p-1 font-mono">{row.adh.toFixed(3)}</td>
                    <td className="p-1 font-mono">{row.dig.toFixed(3)}</td>
                    <td className="p-1 font-mono">{row.dri.toFixed(3)}</td>
                    <td className="p-1 font-mono font-bold text-[#15803d]">{row.tot.toFixed(3)}</td>
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