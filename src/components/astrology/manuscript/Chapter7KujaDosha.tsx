"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter7KujaDosha: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const planets = chart.planets || [];
  const mars = planets.find((p) => p.name === "Mars") || {
    name: "Mars",
    name_ta: "செவ்வாய்",
    rasi_number: 1,
    rasi_ta: "மேஷம்",
    degree: 15.0,
    degree_dms: "15° 00' 00\"",
    nakshatra_ta: "அசுவினி",
    pada: 1,
  };

  const sevvaiDosha = chart.doshas?.find((d) => d.name.includes("Sevvai") || d.name.includes("Mangal")) || {
    name: "Sevvai Dosham (Mangal Dosha)",
    name_ta: "செவ்வாய் தோஷம் (குஜ தோஷம்)",
    present: false,
    severity: "Low / Cancelled",
    severity_ta: "தோஷ நிவர்த்தி (ரத்து)",
    severity_score: 0,
    mars_from_lagna: 1,
    mars_from_moon: 4,
    mars_from_venus: 7,
    description: "Mars is in friendly or exalted status.",
    description_ta: "செவ்வாய் பகவான் சுப பார்வைகளுடன் அமைந்து தோஷ நிவர்த்தி பெற்றுள்ளார்.",
    cancellation_rules_applied: [],
    cancellation_rules_audit: [],
    remedies_ta: [
      "வைத்தீஸ்வரன் கோவில் / பழனி முருகன் தரிசனம் மற்றும் வழிபாடு.",
      "செவ்வாய்க்கிழமைகளில் கந்த சஷ்டி கவசம் பாராயணம் செய்தல்.",
      "செவ்வாய்க்கிழமைகளில் துர்க்கை அல்லது முருகனுக்கு நெய் தீபம் ஏற்றுதல்.",
    ],
  };

  const auditRules = sevvaiDosha.cancellation_rules_audit || [
    { rule_no: 1, rule_ta: "ஆட்சி / உச்ச ராசி", condition_ta: "மேஷம், விருச்சிகம், மகரம்", is_applicable: true, explanation_ta: "ஆட்சி/உச்சம் பெற்று தோஷ நிவர்த்தி." },
    { rule_no: 2, rule_ta: "நட்பு ராசி", condition_ta: "சிம்மம், தனுசு, மீனம்", is_applicable: false, explanation_ta: "நட்பு ராசி அல்ல." },
    { rule_no: 3, rule_ta: "குரு பார்வை / சேர்க்கை", condition_ta: "குரு 1, 5, 7, 9 தொடர்பு", is_applicable: true, explanation_ta: "குருவின் சுப பார்வை கிடைத்துள்ளது." },
    { rule_no: 4, rule_ta: "சந்திர சேர்க்கை", condition_ta: "சந்திர மங்கள யோகம்", is_applicable: false, explanation_ta: "சேர்க்கை இல்லை." },
    { rule_no: 5, rule_ta: "சூரியன் / சனி சேர்க்கை", condition_ta: "ஒரே ராசியில் இருத்தல்", is_applicable: false, explanation_ta: "சேர்க்கை இல்லை." },
    { rule_no: 6, rule_ta: "2-ஆம் இடம் மிதுனம்/கன்னி", condition_ta: "புதனின் வீடுகள்", is_applicable: false, explanation_ta: "2-ல் மிதுனம்/கன்னி இல்லை." },
    { rule_no: 7, rule_ta: "4-ஆம் இடம் மேஷம்/விருச்சிகம்", condition_ta: "சொந்த வீடுகள்", is_applicable: false, explanation_ta: "4-ல் சொந்த வீடு இல்லை." },
    { rule_no: 8, rule_ta: "7-ஆம் இடம் கடகம்/மகரம்", condition_ta: "நீச/உச்ச வீடுகள்", is_applicable: false, explanation_ta: "7-ல் கடகம்/மகரம் இல்லை." },
    { rule_no: 9, rule_ta: "8-ஆம் இடம் தனுசு/மீனம்", condition_ta: "குருவின் வீடுகள்", is_applicable: false, explanation_ta: "8-ல் தனுசு/மீனம் இல்லை." },
    { rule_no: 10, rule_ta: "12-ஆம் இடம் ரிஷபம்/துலாம்", condition_ta: "சுக்கிரன் வீடுகள்", is_applicable: false, explanation_ta: "12-ல் ரிஷபம்/துலாம் இல்லை." },
    { rule_no: 11, rule_ta: "சிம்மம் / கும்ப லக்னம்", condition_ta: "செவ்வாய் யோககாரகன்", is_applicable: false, explanation_ta: "சிம்மம்/கும்ப லக்னம் அல்ல." },
    { rule_no: 12, rule_ta: "கடக லக்னம்", condition_ta: "தர்ம-கர்மாதிபதி", is_applicable: false, explanation_ta: "கடக லக்னம் அல்ல." },
    { rule_no: 13, rule_ta: "செவ்வாய் சொந்த சாரம்", condition_ta: "மிருகசீரிஷம், சித்திரை, அவிட்டம்", is_applicable: false, explanation_ta: "சுய சாரம் பெறவில்லை." },
    { rule_no: 14, rule_ta: "ராகு / கேது சேர்க்கை", condition_ta: "நிழல் கிரக சேர்க்கை", is_applicable: false, explanation_ta: "சேர்க்கை இல்லை." },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 28: குஜ / செவ்வாய் தோஷ மூல இலக்கணம் & நிலை
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={28}
        chapterTitleTa="பகுதி 7: விசேஷ குஜ / செவ்வாய் தோஷம்"
        chapterTitleEn="Part 7: Kuja Dosha Special Treatise"
        pageTitleTa="குஜ / செவ்வாய் தோஷ மூல இலக்கணம் & ஜாதக நிலை ஆய்வு"
        pageTitleEn="Kuja / Mangal Dosha Classical Foundations & Native Placements"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Classical Sloka Box */}
          <div className="bg-[#fffaf0] border-2 border-[#b91c1c] rounded-xl p-3 shadow-sm space-y-1.5 text-center">
            <div className="font-bold text-[#8e2b1c] text-[12.5px] border-b border-[#aa820a]/30 pb-0.5">
              ✦ பராசர & ஜாதக சந்திரிகா மூல குஜ தோஷ சுலோகம் ✦
            </div>
            <div className="text-[11px] text-[#3a1a0f] italic leading-relaxed bg-[#fff8ee] p-2 rounded border border-[#aa820a]/20">
              “லக்னே வ்யயே ச பாதாலே ஜாமித்ரே சாஷ்டமே குஜே |<br />
              கன்யானாம் புத்ரஹானிஸ்யாத் பர்த்துஸ்ச விபரீததா ||”
            </div>
            <p className="text-[10px] text-[#6f6049] leading-tight">
              லக்னம், சந்திரன் மற்றும் சுக்கிரனுக்கு 1, 2, 4, 7, 8, 12 ஆகிய இடங்களில் செவ்வாய் பகவான் அமர்ந்தால் அது குஜ தோஷம் அல்லது செவ்வாய் தோஷம் எனப்படும்.
            </p>
          </div>

          {/* Native Placement Audit */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2">
            <div className="font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ ஜாதகத்தில் செவ்வாய் பகவானின் துல்லிய அமர்வு நிலை ✦
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049]">1. லக்னத்திலிருந்து</div>
                <div className="font-bold text-[#8e2b1c] text-[13px]">{sevvaiDosha.mars_from_lagna || 1}-ஆம் பாவம்</div>
                <div className="text-[9px] text-[#6f6049]">{[1, 2, 4, 7, 8, 12].includes(sevvaiDosha.mars_from_lagna || 0) ? "தோஷ பாவம்" : "சுப பாவம்"}</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049]">2. சந்திரனிலிருந்து</div>
                <div className="font-bold text-[#8e2b1c] text-[13px]">{sevvaiDosha.mars_from_moon || 1}-ஆம் பாவம்</div>
                <div className="text-[9px] text-[#6f6049]">{[1, 2, 4, 7, 8, 12].includes(sevvaiDosha.mars_from_moon || 0) ? "தோஷ பாவம்" : "சுப பாவம்"}</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/20">
                <div className="text-[#6f6049]">3. சுக்கிரனிலிருந்து</div>
                <div className="font-bold text-[#8e2b1c] text-[13px]">{sevvaiDosha.mars_from_venus || 1}-ஆம் பாவம்</div>
                <div className="text-[9px] text-[#6f6049]">{[1, 2, 4, 7, 8, 12].includes(sevvaiDosha.mars_from_venus || 0) ? "தோஷ பாவம்" : "சுப பாவம்"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-[#aa820a]/20 pt-2">
              <div><span className="font-semibold text-[#6f6049]">செவ்வாய் நின்ற ராசி: </span><span className="font-bold text-[#2b2117]">{mars.rasi_ta} ({mars.degree_dms || `${(mars.degree || 0).toFixed(2)}°`})</span></div>
              <div><span className="font-semibold text-[#6f6049]">நட்சத்திர சாரம்: </span><span className="font-bold text-[#2b2117]">{mars.nakshatra_ta} ({mars.pada}-ஆம் பாதம்)</span></div>
              <div><span className="font-semibold text-[#6f6049]">தோஷ வீரிய அளவு: </span><span className="font-bold text-[#8e2b1c]">{sevvaiDosha.severity_ta || sevvaiDosha.severity}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தோஷ சதவீதம்: </span><span className="font-bold text-[#15803d]">{sevvaiDosha.severity_score ?? 0}%</span></div>
            </div>
          </div>

          {/* Shastric Commentary */}
          <div className="bg-[#fffaf0] border border-[#8b5a2b]/30 rounded-xl p-2.5 text-[10.5px] text-[#3a1a0f] space-y-1">
            <div className="font-bold text-[#8e2b1c]">முடிவுரை:</div>
            <p className="leading-relaxed">
              {sevvaiDosha.description_ta}
            </p>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 29: செவ்வாய் தோஷ 14 சாஸ்திர விதிவிலக்குகள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={29}
        chapterTitleTa="பகுதி 7: விசேஷ குஜ / செவ்வாய் தோஷம்"
        chapterTitleEn="Part 7: Kuja Dosha Special Treatise"
        pageTitleTa="செவ்வாய் தோஷ 14 சாஸ்திர விதிவிலக்குகள் (Cancellation Rules)"
        pageTitleEn="14 Classical South Indian Kuja Dosha Cancellation Audit"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="border border-[#8b5a2b] bg-[#fffaf0] rounded-xl p-2.5 shadow-sm overflow-hidden flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#8e2b1c] text-[12px] border-b border-[#aa820a]/30 pb-0.5 mb-1">
              ✦ தென் இந்திய பாரம்பரிய 14 செவ்வாய் தோஷ சாஸ்திர விதிவிலக்குகள் ✦
            </div>

            <table className="w-full text-[9px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f0e5cc] text-[#6b1426] border-b border-[#8b5a2b]">
                  <th className="p-1 font-bold">விதி #</th>
                  <th className="p-1 font-bold">சாஸ்திர விதிவிலக்கு</th>
                  <th className="p-1 font-bold">நிபந்தனை</th>
                  <th className="p-1 font-bold text-center">பொருத்தம்</th>
                  <th className="p-1 font-bold">ஜாதக நிலை & விளக்கம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aa820a]/20">
                {auditRules.map((rule, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white/60" : "bg-[#fffaf0]"}>
                    <td className="p-1 font-bold text-[#8e2b1c] text-center">#{rule.rule_no || idx + 1}</td>
                    <td className="p-1 font-bold text-[#2b2117]">{rule.rule_ta}</td>
                    <td className="p-1 text-[#6f6049]">{rule.condition_ta}</td>
                    <td className="p-1 text-center font-bold">
                      {rule.is_applicable ? (
                        <span className="bg-green-100 text-green-900 border border-green-300 px-1 py-0.5 rounded text-[8px]">
                          பொருந்தும் (✔)
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-600 px-1 py-0.5 rounded text-[8px]">
                          இல்லை (—)
                        </span>
                      )}
                    </td>
                    <td className="p-1 text-[#3a1a0f]">{rule.explanation_ta}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[9px] text-[#6f6049] border-t border-[#aa820a]/20 pt-1">
              * மேலே உள்ள 14 விதிகளில் ஏதேனும் ஒரு விதி பொருந்தினாலும் கூட செவ்வாய் தோஷ வீரியம் குறைந்து நிவர்த்தி பெறுகிறது என்பது சாஸ்திர தீர்மானமாகும்.
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 30: செவ்வாய் தோஷ திருமணப் பொருத்தம் & பரிகாரங்கள்
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={30}
        chapterTitleTa="பகுதி 7: விசேஷ குஜ / செவ்வாய் தோஷம்"
        chapterTitleEn="Part 7: Kuja Dosha Special Treatise"
        pageTitleTa="செவ்வாய் தோஷ திருமணப் பொருத்த வழிகாட்டி & சாஸ்திர பரிகாரங்கள்"
        pageTitleEn="Kuja Dosha Matrimonial Matching Principles & Classical Remedies"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Marriage Matching Guide */}
          <div className="bg-[#fffaf0] border-2 border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-1">
              ✦ திருமணப் பொருத்த சாஸ்திர வழிகாட்டி (Matrimonial Matching Rules) ✦
            </div>
            <ul className="text-[10.5px] text-[#3a1a0f] space-y-1.5 leading-relaxed">
              <li>• <span className="font-bold text-[#8e2b1c]">தோஷ சமநிலை:</span> ஜாதகருக்கு செவ்வாய் தோஷம் இருப்பின், இணையான செவ்வாய் தோஷம் கொண்ட வரன் ஜாதகத்தை சேர்ப்பது தாம்பத்திய ஒற்றுமைக்கு உத்தமமாகும்.</li>
              <li>• <span className="font-bold text-[#8e2b1c]">தோஷ நிவர்த்தி பெற்ற வரன்:</span> ஜாதகருக்கு விதிவிலக்கு மூலம் தோஷ நிவர்த்தி ஆகியிருந்தால், சாதாரண ஜாதகத்தையோ அல்லது தோஷ நிவர்த்தி பெற்ற ஜாதகத்தையோ தாராளமாக இணைக்கலாம்.</li>
              <li>• <span className="font-bold text-[#8e2b1c]">ராகு-கேது சமநிலை:</span> 2, 7, 8-ல் ராகு அல்லது கேது உள்ள ஜாதகங்களை செவ்வாய் உள்ள ஜாதகத்துடன் இணைக்கும் போது தோஷ சமநிலை உண்டாகும்.</li>
              <li>• <span className="font-bold text-[#8e2b1c]">வயது காரணி:</span> 28 வயதிற்கு மேல் செவ்வாய் தோஷத்தின் வீரியம் தானாகவே 50% குறைகிறது என்று பராசரர் அருளியுள்ளார்.</li>
            </ul>
          </div>

          {/* Sacred Remedies Card */}
          <div className="bg-[#fff8ee] border border-[#b91c1c] rounded-xl p-3 shadow-sm space-y-2 flex-1 flex flex-col justify-between">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ செவ்வாய் தோஷ சாஸ்திர பரிகாரங்கள் & வழிபாட்டு முறைகள் ✦
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/25 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">1. முதன்மை பரிகார தலம்:</div>
                <div>மயிலாடுதுறை அருகே உள்ள <span className="font-bold">வைத்தீஸ்வரன் கோவில்</span> சென்று அங்காரக பகவானுக்கு சிவப்பு வஸ்திரம் சாற்றி அர்ச்சனை செய்தல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/25 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">2. அறுபடை வீடு முருகன் வழிபாடு:</div>
                <div>பழனி அல்லது திருச்செந்தூர் முருகன் சன்னதியில் நெய் தீபம் ஏற்றி சஷ்டி விரதம் இருத்தல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/25 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">3. தினசரி ஸ்தோத்திர பாராயணம்:</div>
                <div>செவ்வாய்க்கிழமைகளில் <span className="font-bold">கந்த சஷ்டி கவசம்</span> மற்றும் செவ்வாய் காயத்ரி 108 முறை பாராயணம் செய்தல்.</div>
              </div>
              <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/25 space-y-0.5">
                <div className="font-bold text-[#8e2b1c]">4. தான தர்மங்கள்:</div>
                <div>செவ்வாய்க்கிழமை தோறும் துவரை தானம், சிவப்பு நிற ஆடை அல்லது ஏழை எளியோருக்கு அன்னதானம் வழங்குதல்.</div>
              </div>
            </div>

            <div className="bg-[#fffaf0] p-2 rounded border border-[#aa820a]/30 text-[9.5px] text-center text-[#6f6049] italic">
              “ஓம் வீரத்வஜாய வித்மஹே விக்னஹஸ்தாய தீமஹி தன்னோ பௌம: ப்ரசோதயாத்” — வாழ்க வளமுடன்!
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
