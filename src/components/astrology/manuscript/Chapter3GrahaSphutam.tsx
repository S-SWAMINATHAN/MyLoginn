"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter3GrahaSphutam: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const planets = chart.planets || [];

  // Sort planets by degrees descending for Chara Karakas
  const nonRahuKetu = planets.filter((p) => !["Rahu", "Ketu"].includes(p.name));
  const sortedByDeg = [...nonRahuKetu].sort((a, b) => (b.degree || 0) - (a.degree || 0));
  const charaKarakaTitles = [
    { title: "ஆத்மகாரகன் (Atmakaraka)", desc: "ஆன்மாவின் தலைவன், முக்கிய வாழ்வியல் நோக்கம்" },
    { title: "அமாத்யகாரகன் (Amatyakaraka)", desc: "தொழில், அந்தஸ்து, நிர்வாகத் திறன்" },
    { title: "ப்ராத்ருகாரகன் (Bhratrukaraka)", desc: "உடன்பிறப்புகள், உற்றார் தோழமை" },
    { title: "மாத்ருகாரகன் (Matrukaraka)", desc: "தாய், சுகம், கல்வி, மன அமைதி" },
    { title: "பித்ருகாரகன் (Pitrukaraka)", desc: "தந்தை, தர்மம், பூர்வீக ஆசி" },
    { title: "புத்ரகாரகன் (Putrakaraka)", desc: "புத்திர பாக்கியம், கல்வி, புத்திசாலித்தனம்" },
    { title: "ஞானாதிகாரகன் (Gnatikaraka)", desc: "போட்டிகள், எதிர்ப்புகளை வெல்லும் ஆற்றல்" },
    { title: "தாரகாரகன் (Darakaraka)", desc: "வாழ்க்கைத் துணை, களத்திர சுபம்" },
  ];

  // Helper for Baaladi Avastha
  const getBaaladiAvastha = (deg: number, isOdd: boolean) => {
    const d = deg % 30;
    if (isOdd) {
      if (d < 6) return "பால அவஸ்தை (1/4 பலம்)";
      if (d < 12) return "குமார அவஸ்தை (1/2 பலம்)";
      if (d < 18) return "யுவ அவஸ்தை (முழு பலம்)";
      if (d < 24) return "விருத்த அவஸ்தை (அற்ப பலம்)";
      return "மிருத அவஸ்தை (பலனில்லை)";
    } else {
      if (d < 6) return "மிருத அவஸ்தை (பலனில்லை)";
      if (d < 12) return "விருத்த அவஸ்தை (அற்ப பலம்)";
      if (d < 18) return "யுவ அவஸ்தை (முழு பலம்)";
      if (d < 24) return "குமார அவஸ்தை (1/2 பலம்)";
      return "பால அவஸ்தை (1/4 பலம்)";
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 8: 11-நிலை கிரக ஸ்புட அட்டவணை (GRAHA SPHUTAM)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={8}
        chapterTitleTa="பகுதி 3: கிரக ஸ்புடக் கணிதம்"
        chapterTitleEn="Part 3: Planetary Longitudes"
        pageTitleTa="11-நிலை துல்லிய கிரக ஸ்புட அட்டவணை (Graha Sphutam)"
        pageTitleEn="11-Position Precision Planetary Ephemeris Table"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ ஜெனன கால நவகிரக & லக்ன பாதசாரம் ✦
            </div>

            <table className="w-full text-[10px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">கிரகம்</th>
                  <th className="p-1 font-bold">ராசி</th>
                  <th className="p-1 font-bold">ஸ்புடம் (DMS)</th>
                  <th className="p-1 font-bold">நட்சத்திரம்</th>
                  <th className="p-1 font-bold">பாதம்</th>
                  <th className="p-1 font-bold">நட்சத்திர நாதன்</th>
                  <th className="p-1 font-bold">நவாம்சம்</th>
                  <th className="p-1 font-bold">நிலை / பலம்</th>
                  <th className="p-1 font-bold">கதி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {/* Lagna Row */}
                <tr className="bg-[#fff8ee] font-bold text-[#8e2b1c]">
                  <td className="p-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#8e2b1c] inline-block" />
                    லக்னம் (Lagna)
                  </td>
                  <td className="p-1">{d.lagnam_ta}</td>
                  <td className="p-1">{d.lagnam_dms || `${(d.lagnam_degree || 0).toFixed(2)}°`}</td>
                  <td className="p-1">{d.lagnam_nakshatram_ta || "—"}</td>
                  <td className="p-1 text-center">{d.lagnam_pada || 1}</td>
                  <td className="p-1">{d.lagnam_nakshatra_lord_ta || "—"}</td>
                  <td className="p-1">{d.lagnam_navamsa_ta || "—"}</td>
                  <td className="p-1">கேந்திராதிபதி</td>
                  <td className="p-1 text-[#15803d]">உதயம்</td>
                </tr>

                {/* 9 Planets Rows */}
                {planets.map((p, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-bold text-[#2b2117] flex items-center gap-1">
                      <span className="w-4 text-center font-bold text-[#6b1426]">{p.symbol}</span>
                      <span>{p.name_ta}</span>
                    </td>
                    <td className="p-1 font-semibold">{p.rasi_ta}</td>
                    <td className="p-1 font-mono text-[#8e2b1c]">{p.degree_dms || `${p.degree.toFixed(2)}°`}</td>
                    <td className="p-1">{p.nakshatra_ta}</td>
                    <td className="p-1 text-center font-bold">{p.pada}</td>
                    <td className="p-1">{p.nakshatra_lord_ta || "—"}</td>
                    <td className="p-1">{p.navamsa_rasi_ta || "—"}</td>
                    <td className="p-1">
                      <span
                        className={`px-1 py-0.5 rounded text-[8.5px] font-bold ${
                          p.status === "Exalted"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : p.status === "Own House"
                            ? "bg-green-100 text-green-900 border border-green-300"
                            : p.status === "Debilitated"
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {p.status_ta || p.status || "சமம்"}
                      </span>
                    </td>
                    <td className="p-1 font-semibold">
                      {p.is_retrograde ? (
                        <span className="text-red-700 font-bold bg-red-50 px-1 rounded border border-red-200">
                          வக்ரம் (R)
                        </span>
                      ) : (
                        <span className="text-emerald-700">நேர்கதி</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] border-t border-[#aa820a]/20 pt-1 flex justify-between">
              <span>* அஸ்தங்கம்: சூரியனுடன் குறிப்பிட்ட பாகைக்குள் நெருங்கி இணைந்த கிரகங்கள் பலவீனமடைகின்றன.</span>
              <span>* வக்ரம்: பூமியிலிருந்து பார்க்கும்போது பின்நோக்கி நகர்வது போல் தோன்றும் விசேஷ பலம் வாய்ந்த நிலை.</span>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 9: கிரகப் பார்வைகள் & தார பலன் அட்டவணை (DRISHTI)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={9}
        chapterTitleTa="பகுதி 3: கிரக ஸ்புடக் கணிதம்"
        chapterTitleEn="Part 3: Planetary Longitudes"
        pageTitleTa="கிரகப் பார்வைகள் (Drishti) & நவதார பலன் அட்டவணை"
        pageTitleEn="Planetary Aspects (Drishti) & 9-Tara Balam Table"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Drishti Rules Card */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1.5">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ சாஸ்திர கிரக பார்வைக் கணிதம் (Graha Drishti Matrix) ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20 space-y-1">
                <div className="font-bold text-[#6b1426]">1. சர்வ கிரக சமசப்தம பார்வை (7th Aspect):</div>
                <p className="text-[#3a1a0f] text-[9.5px] leading-tight">
                  அனைத்து 9 கிரகங்களும் தான் நின்ற ராசியிலிருந்து நேர் எதிரே உள்ள 7-ஆம் பாவத்தை முழு பார்வையாக (100% திருஷ்டி) பார்க்கின்றன.
                </p>
              </div>
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20 space-y-1">
                <div className="font-bold text-[#8e2b1c]">2. விசேஷ பார்வைகள் (Special Aspects):</div>
                <ul className="text-[#3a1a0f] text-[9.5px] space-y-0.5">
                  <li>• <span className="font-bold">செவ்வாய்:</span> 4, 7, 8-ஆம் இடங்களை முழு பார்வை பார்க்கிறார்.</li>
                  <li>• <span className="font-bold">குரு:</span> 5, 7, 9-ஆம் இடங்களை (திரிகோண சுப பார்வை) பார்க்கிறார்.</li>
                  <li>• <span className="font-bold">சனி:</span> 3, 7, 10-ஆம் இடங்களை பூரண பார்வை பார்க்கிறார்.</li>
                  <li>• <span className="font-bold">ராகு / கேது:</span> 5, 7, 9-ஆம் இடங்களை நோக்குகின்றனர்.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navatara Table */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஜென்ம நட்சத்திர நவதார சக்கரம் (Navatara Balam) ✦
            </div>
            <p className="text-[9.5px] text-[#6f6049] text-center italic">
              ஜென்ம நட்சத்திரம் முதல் 27 நட்சத்திரங்களின் தார பலன்கள் (சுப/அசுப தினங்கள் கணிக்க உத்தமம்)
            </p>

            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#aa820a]">
                  <th className="p-1 font-bold">எண்</th>
                  <th className="p-1 font-bold">தாரா பெயர்</th>
                  <th className="p-1 font-bold">பலன்</th>
                  <th className="p-1 font-bold">சுபாசுப நிலை</th>
                  <th className="p-1 font-bold">நடைமுறை வழிகாட்டல்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold">1, 10, 19</td>
                  <td className="p-1 font-bold text-[#8e2b1c]">ஜென்ம தாரை (Janma)</td>
                  <td className="p-1">உடற்பயிற்சி, ஓய்வு</td>
                  <td className="p-1 font-bold text-amber-700">மிதமான சுபம்</td>
                  <td className="p-1">முக்கிய ஒப்பந்தங்கள் தவிர்க்கவும்</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold">2, 11, 20</td>
                  <td className="p-1 font-bold text-[#15803d]">சம்பத் தாரை (Sampat)</td>
                  <td className="p-1">தன லாபம், செல்வம்</td>
                  <td className="p-1 font-bold text-emerald-700">மிக உத்தமம்</td>
                  <td className="p-1">பொருளாதார முயற்சிகளுக்கு உகந்தது</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold">3, 12, 21</td>
                  <td className="p-1 font-bold text-[#b91c1c]">விபத்து தாரை (Vipat)</td>
                  <td className="p-1">தடைகள், அலைச்சல்</td>
                  <td className="p-1 font-bold text-red-700">அசுபம்</td>
                  <td className="p-1">பயணங்கள் தவிர்க்க நலம்</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold">4, 13, 22</td>
                  <td className="p-1 font-bold text-[#15803d]">க்ஷேம தாரை (Kshema)</td>
                  <td className="p-1">சௌக்கியம், வெற்றி</td>
                  <td className="p-1 font-bold text-emerald-700">மிக உத்தமம்</td>
                  <td className="p-1">சகல நற்காரியங்கள் துவங்கலாம்</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold">5, 14, 23</td>
                  <td className="p-1 font-bold text-[#b91c1c]">பிரத்யக் தாரை (Pratyak)</td>
                  <td className="p-1">எதிர்ப்புகள், நஷ்டம்</td>
                  <td className="p-1 font-bold text-red-700">அசுபம்</td>
                  <td className="p-1">விவாதங்கள் தவிர்க்கவும்</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold">6, 15, 24</td>
                  <td className="p-1 font-bold text-[#15803d]">சாதக தாரை (Sadhana)</td>
                  <td className="p-1">காரிய சித்தி, அனுகூலம்</td>
                  <td className="p-1 font-bold text-emerald-700">மிக உத்தமம்</td>
                  <td className="p-1">கல்வி, வேலைவாய்ப்பிற்கு உகந்தது</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold">7, 16, 25</td>
                  <td className="p-1 font-bold text-[#b91c1c]">வத தாரை (Naidhana)</td>
                  <td className="p-1">கடன், விரயம்</td>
                  <td className="p-1 font-bold text-red-700">தீவிர அசுபம்</td>
                  <td className="p-1">சுப காரியங்களுக்கு முற்றிலும் விலக்கு</td>
                </tr>
                <tr>
                  <td className="p-1 font-bold">8, 17, 26</td>
                  <td className="p-1 font-bold text-[#15803d]">மித்ர தாரை (Mitra)</td>
                  <td className="p-1">நட்பு, நன்மைகள்</td>
                  <td className="p-1 font-bold text-emerald-700">சுபம்</td>
                  <td className="p-1">சுப விசேஷங்களுக்கு சிறந்தது</td>
                </tr>
                <tr className="bg-[#fffaf0]">
                  <td className="p-1 font-bold">9, 18, 27</td>
                  <td className="p-1 font-bold text-[#15803d]">பரம மித்ர தாரை (Parama Mitra)</td>
                  <td className="p-1">பேரின்பம், பெருவெற்றி</td>
                  <td className="p-1 font-bold text-emerald-700">அதி உத்தமம்</td>
                  <td className="p-1">அனைத்து சுப வினைகளுக்கும் முதன்மை</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 10: கிரக அவஸ்தைகள் & காரகத்துவங்கள் (AVASTHAS & KARAKAS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={10}
        chapterTitleTa="பகுதி 3: கிரக ஸ்புடக் கணிதம்"
        chapterTitleEn="Part 3: Planetary Longitudes"
        pageTitleTa="கிரக அவஸ்தைகள் (Avasthas) & சப்த சர காரகத்துவங்கள்"
        pageTitleEn="Planetary States (Avasthas) & Parashari Chara Karakas"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Baaladi Avasthas Table */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b] rounded-xl p-2.5 shadow-sm space-y-1">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ பால-குமார-யுவ-விருத்த-மிருத அவஸ்தைக் கணிதம் ✦
            </div>
            <table className="w-full text-[9.5px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#aa820a]">
                  <th className="p-1 font-bold">கிரகம்</th>
                  <th className="p-1 font-bold">ராசி</th>
                  <th className="p-1 font-bold">பாகை</th>
                  <th className="p-1 font-bold">ராசி வகை</th>
                  <th className="p-1 font-bold">பாலாதி அவஸ்தை</th>
                  <th className="p-1 font-bold">பலன் வீரியம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {planets.map((p, idx) => {
                  const isOdd = p.rasi_number % 2 !== 0;
                  const avastha = getBaaladiAvastha(p.degree, isOdd);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                      <td className="p-1 font-bold text-[#2b2117]">{p.name_ta}</td>
                      <td className="p-1">{p.rasi_ta}</td>
                      <td className="p-1 font-mono text-[#8e2b1c]">{p.degree.toFixed(2)}°</td>
                      <td className="p-1">{isOdd ? "ஒற்றை (ஆண்)" : "இரட்டை (பெண்)"}</td>
                      <td className="p-1 font-semibold text-[#6b1426]">{avastha}</td>
                      <td className="p-1">
                        {avastha.includes("முழு") ? (
                          <span className="text-emerald-700 font-bold">முழு பலம் (100%)</span>
                        ) : avastha.includes("1/2") ? (
                          <span className="text-blue-700">அரை பலம் (50%)</span>
                        ) : avastha.includes("1/4") ? (
                          <span className="text-amber-700">கால் பலம் (25%)</span>
                        ) : (
                          <span className="text-stone-500">குறைந்த பலம்</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chara Karakas Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-2.5 shadow-sm space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஜெய்மினி & பராசர சப்த சர காரகத்துவங்கள் (Chara Karakas) ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {sortedByDeg.slice(0, 8).map((p, idx) => (
                <div key={idx} className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/25 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#8e2b1c] text-[#ffd700] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-[#8e2b1c]">
                      {charaKarakaTitles[idx]?.title}: <span className="text-[#15803d]">{p.name_ta}</span> ({p.degree.toFixed(2)}°)
                    </div>
                    <div className="text-[9px] text-[#6f6049] leading-tight">
                      {charaKarakaTitles[idx]?.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
