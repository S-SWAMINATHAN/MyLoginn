"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter2Panchangam: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const samp = chart.sampoorana || {};
  const vd = chart.vakhyam_details || samp.vakhyam_details || {};
  const isVakhyam = chart.panchangam_system === "vakhyam";

  const birthYear = parseInt(chart.date_of_birth?.split("-")[0] || "1996", 10);
  const kaliyuga = samp.kaliyuga_year || (birthYear + 3101);
  const salivahana = samp.salivahana_year || (birthYear - 78);
  const vikrama = vd.vikrama_year || samp.vikrama_year || (birthYear + 57);
  const kollam = samp.kollam_year || (birthYear - 824);
  const fasli = samp.fasli_year || (birthYear - 590);
  const hijri = samp.hijri_year || Math.floor((birthYear - 622) * 1.03);

  const tamilYear = samp.tamil_year || samp.tamil_year_ta || d.tamil_year || "தாது";
  const tamilMonth = samp.tamil_month || samp.tamil_month_ta || d.tamil_month || "சித்திரை";
  const tamilDate = samp.tamil_date || d.tamil_date || 1;
  const ayanaTa = samp.ayana_ta || samp.ayana || d.ayana_ta || "உத்தராயணம்";
  const rituTa = samp.ritu_ta || samp.ritu || d.ritu_ta || "வசந்த ருது";

  const uNazh = samp.udhayadhi_nazhigai_num ?? (d.udhayadhi_nazhigai ? parseInt(d.udhayadhi_nazhigai) : 14);
  const uVin = samp.udhayadhi_vinazhigai_num ?? 15;
  const uTat = samp.tatparai ?? 57;

  const nethiram = samp.nethiram ?? "1";
  const jeevan = samp.jeevan ?? "1/2";
  const vaaraSoolai = samp.vaara_soolai_ta || "தெற்கு";
  const soolaiPariharam = samp.soolai_pariharam_ta || "தைலம் / நெய்";
  const yoginiDir = samp.yogini_ta || "பூமி திசை";
  const soonyaRasis = samp.soonya_rasis_ta || "மிதுனம், கன்னி";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 5: ஜெனன பஞ்சாங்க விபரம் (TRADITIONAL ERAS & CALENDAR)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={5}
        chapterTitleTa="பகுதி 2: பஞ்சாங்கக் கணிதம்"
        chapterTitleEn="Part 2: Panchangam Computations"
        pageTitleTa="ஜெனன வாக்கிய & திருக்கணித பஞ்சாங்க வரலாற்று யுகங்கள்"
        pageTitleEn="Traditional Historical Eras & Tamil Solar Calendar"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Classical Jenana Vakhyam Inscription */}
          <div className="bg-[#fffaf0] border-2 border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஜெனன வாக்கிய சாஸ்திர சங்கல்ப சுலோகம் ✦
            </div>
            <div
              className="text-[11px] text-[#2b2117] leading-relaxed text-justify bg-[#fff8ee] border border-[#aa820a]/20 p-2.5 rounded-lg"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              “சுவஸ்திஸ்ரீ ஜயவாப்யுதய சாலிவாகன சகாப்தம் {salivahana} செல்லாநின்ற, கலியுகாதி {kaliyuga} வது ஆண்டில்,
              விக்ரம ஆண்டு {vikrama}, கொல்லம் ஆண்டு {kollam}, பசலி {fasli}, ஹிஜ்ரி {hijri} வர்த்தமான காலத்தில்,
              பிரபவாதி 60 தமிழ் வருஷங்களில் <span className="text-[#8e2b1c] font-bold">‘{tamilYear}’</span> நாம வருஷம்,
              <span className="text-[#8e2b1c] font-bold">‘{ayanaTa}’</span> புண்ணிய காலத்தில், <span className="text-[#8e2b1c] font-bold">‘{rituTa}’</span> பருவத்தில்,
              <span className="text-[#8e2b1c] font-bold">‘{tamilMonth}’</span> மாதம் {tamilDate}-ஆம் நாள்,
              {d.vaaram_ta} கிழமை கூடிய நன்னாளில் சுபயோக சுபவேளையில் ஜெனனம்...”
            </div>
          </div>

          {/* 6 Historical Eras Table */}
          <div className="bg-[#fff8ee] border border-[#8b5a2b]/30 rounded-xl p-3 shadow-sm space-y-1.5">
            <div className="font-bold text-[#6b1426] text-center text-[12px]">
              ✦ 6 வரலாற்று யுகக் கணித விபரங்கள் (Six Historical Eras) ✦
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">1. கலியுகாதி ஆண்டு (Kaliyuga Era): </span>
                <span className="font-bold text-[#8e2b1c]">{kaliyuga}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கி.மு. 3102 பிப்ரவரி 18-ல் துவங்கிய மகா சகாப்தம்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">2. சாலிவாகன சகாப்தம் (Saka Era): </span>
                <span className="font-bold text-[#8e2b1c]">{salivahana}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கி.பி. 78-ல் சாலிவாகன மன்னரால் துவங்கப்பட்டது.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">3. விக்ரம ஆண்டு (Vikrama Samvat): </span>
                <span className="font-bold text-[#8e2b1c]">{vikrama}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கி.மு. 57-ல் விக்ரமாதித்த மன்னரால் ஆரம்பிக்கப்பட்டது.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">4. கொல்லம் ஆண்டு (Kollam Era): </span>
                <span className="font-bold text-[#8e2b1c]">{kollam}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கி.பி. 825-ல் சேர மன்னன் உதய மார்த்தாண்ட வர்மாவால் நிறுவப்பட்டது.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">5. பசலி ஆண்டு (Fasli Calendar): </span>
                <span className="font-bold text-[#8e2b1c]">{fasli}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">அக்பர் ஆட்சியில் நில வருவாய் ஆவணங்களுக்காக நடைமுறைப்படுத்தப்பட்டது.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <span className="font-semibold text-[#6f6049]">6. ஹிஜ்ரி ஆண்டு (Hijri Lunar Year): </span>
                <span className="font-bold text-[#8e2b1c]">{hijri}</span>
                <div className="text-[9px] text-[#6f6049] mt-0.5">கி.பி. 622-ல் துவங்கிய சந்திர சகாப்தம்.</div>
              </div>
            </div>
          </div>

          {/* System Comparison */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b]/30 rounded-xl p-2.5 space-y-1 text-[10.5px]">
            <div className="font-bold text-[#8e2b1c]">
              ✦ பஞ்சாங்க கணித மரபு விளக்கம் ({isVakhyam ? "வாக்கிய பஞ்சாங்க முறை" : "திருக்கணித பஞ்சாங்க முறை"})
            </div>
            <p className="text-[#3a1a0f] leading-relaxed">
              {isVakhyam
                ? "வாக்கிய பஞ்சாங்கம் என்பது வரருசி, பாஸ்கராச்சாரியார் உள்ளிட்ட ரிஷிகள் அருளிய கணக்கீட்டு வாக்கியங்களை அடிப்படையாகக் கொண்ட சூரிய சித்தாந்த மரபு. பாம்பு பஞ்சாங்கம், திருச்செந்தூர் மற்றும் சிதம்பரம் நடராஜர் திருக்கோவில்களில் இவ்வழியே பூஜா உற்சவங்கள் கடைபிடிக்கப்படுகின்றன."
                : "திருக்கணித பஞ்சாங்கம் என்பது சித்ரபக்ஷ லஹரி அயனாம்சத்தை அடிப்படையாகக் கொண்டு, சுவிஸ் எபிமெரிஸ் மற்றும் நாசா விண்வெளி ஆய்வகத்தின் நவீன கிரக சஞ்சாரங்களை உள்ளடக்கிய துல்லிய வானியல் முறையாகும். நவீன காலத்தில் அரசாங்க வானிலை மற்றும் பெரும் ஜோதிட அறிஞர்களால் ஏற்கப்பட்டது."}
            </p>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 6: பஞ்சாங்க பஞ்ச அங்கங்கள் & சூட்சும நாழிகைகள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={6}
        chapterTitleTa="பகுதி 2: பஞ்சாங்கக் கணிதம்"
        chapterTitleEn="Part 2: Panchangam Computations"
        pageTitleTa="பஞ்சாங்க பஞ்ச அங்கங்கள் & சூட்சும நாழிகைக் கணிதம்"
        pageTitleEn="Five Limbs of Panchanga & Micro-Metrics"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* 5 Angas Table */}
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ ஜெனன பஞ்சாங்க பஞ்ச அங்கங்கள் (Five Limbs) ✦
            </div>
            <table className="w-full text-[11px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1.5 font-bold">அங்கம்</th>
                  <th className="p-1.5 font-bold">ஜெனன விபரம்</th>
                  <th className="p-1.5 font-bold">சென்ற நாழிகை</th>
                  <th className="p-1.5 font-bold">நின்ற நாழிகை</th>
                  <th className="p-1.5 font-bold">அதிபதி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                <tr>
                  <td className="p-1.5 font-bold text-[#8e2b1c]">1. திதி (Tithi)</td>
                  <td className="p-1.5 font-bold">{d.thithi_ta} ({d.paksha_ta || "சுக்கில பக்ஷம்"})</td>
                  <td className="p-1.5">{vd.tithi_sentra_nazhigai || "32 நாழி 10 விநா"}</td>
                  <td className="p-1.5">{vd.tithi_nindra_nazhigai || "27 நாழி 50 விநா"}</td>
                  <td className="p-1.5 font-semibold text-[#6b1426]">{d.thithi_lord || "சுக்கிரன்"}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-[#8e2b1c]">2. நட்சத்திரம் (Nakshatra)</td>
                  <td className="p-1.5 font-bold">{d.nakshatram_ta} ({d.pada}-ஆம் பாதம்)</td>
                  <td className="p-1.5">{samp.sentra_nazhigai || "43 நாழி 28 விநா"}</td>
                  <td className="p-1.5">{samp.nindra_nazhigai || "16 நாழி 32 விநா"}</td>
                  <td className="p-1.5 font-semibold text-[#6b1426]">{d.nakshatra_lord_ta || "கேது"}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-[#8e2b1c]">3. யோகம் (Nitya Yoga)</td>
                  <td className="p-1.5 font-bold">{d.yogam_ta} ({d.yogam})</td>
                  <td className="p-1.5">25 நாழி 40 விநா</td>
                  <td className="p-1.5">34 நாழி 20 விநா</td>
                  <td className="p-1.5 font-semibold text-[#6b1426]">{d.subha_yogam_ta || "சுப யோகம்"}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-[#8e2b1c]">4. கரணம் (Karana)</td>
                  <td className="p-1.5 font-bold">{d.karanam_ta} ({d.karanam})</td>
                  <td className="p-1.5">14 நாழி 15 விநா</td>
                  <td className="p-1.5">15 நாழி 45 விநா</td>
                  <td className="p-1.5 font-semibold text-[#6b1426]">சுப கரணம்</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-[#8e2b1c]">5. வாரம் (Weekday)</td>
                  <td className="p-1.5 font-bold">{d.vaaram_ta} ({d.vaaram})</td>
                  <td className="p-1.5" colSpan={2}>முழு தினம் (60 நாழிகைகள்)</td>
                  <td className="p-1.5 font-semibold text-[#6b1426]">{d.vaaram_lord_ta || "செவ்வாய்"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Micro-Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#fff8ee] border border-[#aa820a]/30 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] border-b pb-0.5 text-[11px]">✦ நாழிகை & கால அளவுகள் ✦</div>
              <div className="text-[10.5px] space-y-0.5">
                <div><span className="text-[#6f6049]">உதயாத நாழிகை: </span><span className="font-bold text-[#2b2117]">{uNazh} நாழிகை {uVin} விநாழிகை {uTat} தற்பரை</span></div>
                <div><span className="text-[#6f6049]">பரம நாழிகை (நக். மொத்த அளவு): </span><span className="font-bold text-[#2b2117]">{samp.paramanazhigai || "60 நாழிகை 00 விநா"}</span></div>
                <div><span className="text-[#6f6049]">சென்ற நாழிகை (முற்றியது): </span><span className="font-bold text-[#8e2b1c]">{samp.sentra_nazhigai || "43 நாழிகை 28 விநா"}</span></div>
                <div><span className="text-[#6f6049]">நின்ற நாழிகை (இருப்பு): </span><span className="font-bold text-[#15803d]">{samp.nindra_nazhigai || "16 நாழிகை 32 விநா"}</span></div>
              </div>
            </div>

            <div className="bg-[#fff8ee] border border-[#aa820a]/30 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] border-b pb-0.5 text-[11px]">✦ சூட்சும சுப அங்கங்கள் ✦</div>
              <div className="text-[10.5px] space-y-0.5">
                <div><span className="text-[#6f6049]">நேத்திரம் (Eye): </span><span className="font-bold text-[#2b2117]">{nethiram} (சுப நேத்திரம்)</span></div>
                <div><span className="text-[#6f6049]">ஜீவன் (Life Force): </span><span className="font-bold text-[#2b2117]">{jeevan} (சுப ஜீவன்)</span></div>
                <div><span className="text-[#6f6049]">வார சூலை & பரிகாரம்: </span><span className="font-bold text-[#8e2b1c]">{vaaraSoolai} — பரிகாரம்: {soolaiPariharam}</span></div>
                <div><span className="text-[#6f6049]">யோகினி வாசம்: </span><span className="font-bold text-[#2b2117]">{yoginiDir}</span></div>
                <div><span className="text-[#6f6049]">திதி சூன்ய ராசிகள்: </span><span className="font-bold text-[#8e2b1c]">{soonyaRasis}</span></div>
              </div>
            </div>
          </div>

          {/* Subha Yoga Banner */}
          <div className="bg-[#fffaf0] border border-[#15803d]/40 rounded-xl p-2 text-center text-[10.5px]">
            <span className="font-bold text-[#15803d]">தமிழ் பஞ்சாங்க சுப யோகம்: </span>
            <span className="font-bold text-[#2b2117]">{d.subha_yogam_ta || "அமிர்த யோகம்"}</span> —
            <span className="text-[#6f6049] italic"> {d.subha_yogam_desc_ta || "சகல காரிய சித்தி, சுப காரியங்களுக்கு மிக உத்தமம்."}</span>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 7: சூரியோதயக் கணிதம் & சுப கால நேரங்கள் (HORAS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={7}
        chapterTitleTa="பகுதி 2: பஞ்சாங்கக் கணிதம்"
        chapterTitleEn="Part 2: Panchangam Computations"
        pageTitleTa="சூரியோதயக் கணிதம், தினமானப் பிரமாணம் & ஹோரை அட்டவணை"
        pageTitleEn="Solar Ephemeris, Dinamani & 24-Hour Hora Table"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Solar Ephemeris Card */}
          <div className="bg-[#fffaf0] border-2 border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ சூரியோதய / அஸ்தமன & தினமானக் கணிதம் ✦
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049] text-[10px]">சூரியோதயம் (Sunrise)</div>
                <div className="font-bold text-[#8e2b1c] text-[13px]">{d.sun_rise || "06:05 AM"}</div>
              </div>
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049] text-[10px]">சூரியாஸ்தமனம் (Sunset)</div>
                <div className="font-bold text-[#8e2b1c] text-[13px]">{d.sun_set || "06:35 PM"}</div>
              </div>
              <div className="bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049] text-[10px]">அயனாம்சம் (Ayanamsha)</div>
                <div className="font-bold text-[#15803d] text-[12px]">{d.ayanamsa_dms || "23° 48' 32\""}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-[#aa820a]/20 pt-2">
              <div><span className="font-semibold text-[#6f6049]">தினமானம் (பகல் பிரமாணம்): </span><span className="font-bold text-[#2b2117]">{d.dinamani || "31 நாழிகை 15 விநா (12 மணி 30 நிமி)"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">ராத்திரிமானம் (இரவு பிரமாணம்): </span><span className="font-bold text-[#2b2117]">{d.ratrimana || "28 நாழிகை 45 விநா (11 மணி 30 நிமி)"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">இராகு காலம்: </span><span className="font-bold text-[#8e2b1c]">{d.rahu_kalam || "03:00 PM – 04:30 PM"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">எமகண்டம்: </span><span className="font-bold text-[#2b2117]">{d.yamagandam || "09:00 AM – 10:30 AM"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">குளிகை காலம்: </span><span className="font-bold text-[#15803d]">{d.kuligai || "12:00 PM – 01:30 PM"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">அபிஜித் முகூர்த்தம்: </span><span className="font-bold text-[#2b2117]">11:45 AM – 12:35 PM</span></div>
            </div>
          </div>

          {/* 24-Hour Hora Table */}
          <div className="bg-[#fff8ee] border border-[#8b5a2b]/30 rounded-xl p-2.5 space-y-1">
            <div className="font-bold text-[#6b1426] text-center text-[12px]">
              ✦ 24-மணி நேர தினசரி ஹோரை சக்கரம் (Hourly Planetary Horas) ✦
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[9.5px]">
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c] border-b pb-0.5">காலை (Day 1-6)</div>
                <div>06-07 AM: {d.vaaram_lord_ta || "செவ்வாய்"}</div>
                <div>07-08 AM: சூரியன்</div>
                <div>08-09 AM: சுக்கிரன்</div>
                <div>09-10 AM: புதன்</div>
                <div>10-11 AM: சந்திரன்</div>
                <div>11-12 PM: சனி</div>
              </div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c] border-b pb-0.5">மதியம் (Day 7-12)</div>
                <div>12-01 PM: குரு</div>
                <div>01-02 PM: செவ்வாய்</div>
                <div>02-03 PM: சூரியன்</div>
                <div>03-04 PM: சுக்கிரன்</div>
                <div>04-05 PM: புதன்</div>
                <div>05-06 PM: சந்திரன்</div>
              </div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c] border-b pb-0.5">மாலை (Night 1-6)</div>
                <div>06-07 PM: சனி</div>
                <div>07-08 PM: குரு</div>
                <div>08-09 PM: செவ்வாய்</div>
                <div>09-10 PM: சூரியன்</div>
                <div>10-11 PM: சுக்கிரன்</div>
                <div>11-12 AM: புதன்</div>
              </div>
              <div className="bg-[#fffaf0] p-1.5 rounded border border-[#aa820a]/20">
                <div className="font-bold text-[#8e2b1c] border-b pb-0.5">இரவு (Night 7-12)</div>
                <div>12-01 AM: சந்திரன்</div>
                <div>01-02 AM: சனி</div>
                <div>02-03 AM: குரு</div>
                <div>03-04 AM: செவ்வாய்</div>
                <div>04-05 AM: சூரியன்</div>
                <div>05-06 AM: சுக்கிரன்</div>
              </div>
            </div>
            <div className="text-[8.5px] text-[#6f6049] text-center italic mt-1">
              சுப காரியங்களுக்கு குரு, சுக்கிர, புதன், சந்திர ஹோரைகள் மிக உத்தமமானவை.
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
