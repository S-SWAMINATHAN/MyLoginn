"use client";

import React, { useState } from "react";
import { ChartResponse } from "@/lib/types";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  ShieldCheck,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers
} from "lucide-react";

interface VakhyamCompleteCardProps {
  chart: ChartResponse;
  lang: "ta" | "en";
}

export const VakhyamCompleteCard: React.FC<VakhyamCompleteCardProps> = ({ chart, lang }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const samp = chart.sampoorana || {};
  const vd = chart.vakhyam_details || samp.vakhyam_details || {};
  const d = chart.basic_details || {};

  // Eras
  const salivahana = vd.salivahana_year || samp.salivahana_year || 1918;
  const kaliyuga = vd.kaliyuga_year || samp.kaliyuga_year || 5125;
  const kollam = vd.kollam_year || samp.kollam_year || 1172;
  const fasli = vd.fasli_year || samp.fasli_year || 1406;
  const hijri = vd.hijri_year || samp.hijri_year || 1417;
  const vikrama = vd.vikrama_year || samp.vikrama_year || 2053;

  // Auspicious Prose
  const prose = vd.jenana_vakhyam_prose || (
    `ஸ்வஸ்திஸ்ரீ விஜயாப்யுதய சாலிவாகன சகாப்தம் ${salivahana}-ல் நிகழும் மங்களகரமான ${samp.tamil_year || "தாது"} வருடம் ` +
    `${samp.ayana_ta || "தட்சிணாயனம்"} ${samp.ritu_ta || "வர்ஷ ருது"} ${samp.tamil_month || "ஆவணி"} மாதம் ` +
    `${samp.tamil_date || 1}-ஆம் தேதி ${d.vaaram_ta || "வியாழன்"} அன்று, சூரிய உதயாதி நாழிகை ${d.udhayadhi_nazhigai || "14 நாழிகை"} அளவில், ` +
    `${d.thithi_ta || "வளர்பிறை பஞ்சமி"} திதியும், ${d.lagnam_ta || "சிம்ம"} லக்னமும், ` +
    `${d.nakshatram_ta || "மகம்"} நட்சத்திரம் ${d.pada || 1}-ஆம் பாதம் க்ஷேத்திர ${d.rasi_ta || "சிம்ம"} ராசியும், ` +
    `${d.yogam_ta || "சுப யோகம்"} யோகமும், ${d.karanam_ta || "பாலவ"} கரணமும் கூடிய சுபயோக சுபதினத்தில் சுபஜெனனம்.`
  );

  // Nazhigai Breakdown
  const nakSentra = vd.nakshatra_sentra_nazhigai || samp.sentra_nazhigai || "43 நாழிகை 28 விநா";
  const nakNindra = vd.nakshatra_nindra_nazhigai || samp.nindra_nazhigai || "16 நாழிகை 32 விநா";
  const tithiSentra = vd.tithi_sentra_nazhigai || "30 நாழிகை 00 விநா";
  const tithiNindra = vd.tithi_nindra_nazhigai || "30 நாழிகை 00 விநா";
  const paramanazhigai = vd.paramanazhigai || samp.paramanazhigai || "60 நாழிகை 00 விநா";
  const udhayadhi = vd.udhayadhi_nazhigai || d.udhayadhi_nazhigai || "14 நாழிகை 15 விநாழிகை";

  // Micro Metrics
  const nethiram = vd.nethiram || samp.nethiram || "2";
  const jeevan = vd.jeevan || samp.jeevan || "1";
  const vaaraSoolai = vd.vaara_soolai || samp.vaara_soolai_ta || "தெற்கு";
  const soolaiPariharam = vd.soolai_pariharam || samp.soolai_pariharam_ta || "தைலம்";
  const yoginiDir = vd.yogini_direction || samp.yogini_ta || "தென்கிழக்கு";
  const soonyaRasis = vd.soonya_rasis || samp.soonya_rasis_ta || "மிதுனம், கன்னி";
  const panchaPakshi = vd.pancha_pakshi || samp.pancha_pakshi_ta || "வல்லூறு";
  const vainasikaStar = samp.vainasika_star_ta || "22-ஆம் நட்சத்திரம்";

  return (
    <div className="hand-card p-6 sm:p-8 relative overflow-hidden bg-[#fffdf5] border-2 border-[#8b5a2b]/35 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#b03726]/30 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-script text-[#b03726]">ஸ்ரீ</span>
            <h2 className="text-xl sm:text-2xl font-bold font-script text-[#2b2117]">
              {lang === "ta"
                ? "பாரம்பரிய வாக்கிய பஞ்சாங்கம் & ஜெனன வாக்கிய உரை"
                : "Traditional Vakhyam Panchangam & Jenana Vakhyam Complete Page"}
            </h2>
          </div>
          <p className="text-xs text-[#6f6049] font-tamil mt-1">
            {lang === "ta"
              ? "— பாம்பு பஞ்சாங்கம், இராமலிங்கம் பிள்ளை மற்றும் சூரிய சித்தாந்த மரபு முறை கணிதப் பக்கம் —"
              : "— Classical Surya Siddhanta & Traditional Tamil Vakhyam Panchangam System —"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#8b5a2b]/10 text-[#6b1426] border border-[#8b5a2b]/20 font-tamil flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#b03726]" />
            <span>{chart.panchangam_system === "vakhyam" ? "வாக்கிய முறை முதன்மை" : "வாக்கிய சாஸ்திர விவரம்"}</span>
          </span>
        </div>
      </div>

      {/* Sanskrit Mangala Sloka Banner */}
      <div className="bg-[#fff8e6] border border-[#8b5a2b]/30 rounded-2xl p-3.5 text-center shadow-xs mb-6 space-y-1">
        <div className="text-[11px] font-bold text-[#6b1426] font-cinzel tracking-widest">
          ॥ ஸ்ரீ ராமஜெயம் — ஸ்ரீ மகா கணபதயே நம: — சுபமஸ்து ॥
        </div>
        <p className="handwritten-tamil text-xs sm:text-sm text-[#3a1a0f] italic leading-relaxed">
          “ஜெனனீ ஜென்ம சௌக்யானாம் வர்த்தனீ குலசம்பதாம்<br />
          பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா.”
        </p>
        <div className="text-[10px] text-[#8b5a2b] font-tamil font-semibold">
          {lang === "ta"
            ? "மாதா, பிதா, ஜாதகர் சர்வ மங்களங்களையும் தீர்க்காயுளையும் பெற்று சுபயோகமாக வாழ்வார்களாக."
            : "May mother, father, and native live in good health, auspicious fortune, and longevity."}
        </div>
      </div>

      {/* Auspicious Tamil Birth Sentence (ஜெனன வாக்கிய உரை) */}
      <div className="bg-[#fffdfa] border-2 border-[#8b5a2b]/30 rounded-2xl p-4 sm:p-5 shadow-inner mb-6 relative">
        <div className="flex items-center justify-between border-b border-[#8b5a2b]/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#b03726]" />
            <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
              {lang === "ta" ? "ஜெனன வாக்கிய உரை (Auspicious Birth Inscription)" : "Auspicious Birth Sentence"}
            </h3>
          </div>
          <span className="text-[10px] text-[#8b5a2b] font-mono">Surya Udhayadhi Siddhanta</span>
        </div>

        <p className="handwritten-tamil text-xs sm:text-sm text-[#2b170c] leading-loose font-medium">
          {prose}
        </p>
      </div>

      {/* 6 Traditional Astronomical Eras (சாஸ்திர வரலாற்று ஆண்டுகள்) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#b03726]" />
          <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
            {lang === "ta" ? "சாஸ்திர வரலாற்று சகாப்தங்கள் (Traditional Astronomical Eras)" : "Traditional Historical Eras"}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center handwritten-tamil">
          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">சாலிவாகன சகாப்தம்</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{salivahana}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Saka Era</div>
          </div>

          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">கலியுகாதி ஆண்டு</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{kaliyuga}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Kaliyuga</div>
          </div>

          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">கொல்லம் ஆண்டு</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{kollam}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Kollam Era</div>
          </div>

          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">பசலி ஆண்டு</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{fasli}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Fasli Era</div>
          </div>

          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">ஹிஜ்ரி ஆண்டு</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{hijri}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Hijri Era</div>
          </div>

          <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-[#6f6049] font-medium font-cinzel">விக்ரம ஆண்டு</div>
            <div className="text-base font-bold text-[#6b1426] font-mono mt-1">{vikrama}</div>
            <div className="text-[9px] text-[#8b5a2b] mt-0.5">Vikrama Samvat</div>
          </div>
        </div>
      </div>

      {/* 5 Angas & Nazhigai Metrics Table */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#b03726]" />
          <h3 className="text-xs font-bold text-[#6b1426] tracking-wider uppercase font-tamil">
            {lang === "ta" ? "வாக்கிய பஞ்சாங்க 5 அங்கங்கள் & நாழிகை விபரம்" : "Vakhyam 5-Angas with Nazhigai Breakdown"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs handwritten-tamil">
          <div className="bg-[#fff8ee] border border-[#8b5a2b]/25 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">1. திதி (Tithi)</div>
            <div className="text-sm font-bold text-[#6b1426] my-1">{d.thithi_ta || d.thithi}</div>
            <div className="text-[10px] text-[#3a1a0f] space-y-0.5 border-t border-black/5 pt-1 mt-1">
              <div>சென்றது: <span className="font-mono font-semibold">{tithiSentra}</span></div>
              <div>நின்றது: <span className="font-mono font-semibold">{tithiNindra}</span></div>
            </div>
          </div>

          <div className="bg-[#fff8ee] border border-[#8b5a2b]/25 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">2. வாரம் (Vaaram)</div>
            <div className="text-sm font-bold text-[#6b1426] my-1">{d.vaaram_ta}</div>
            <div className="text-[10px] text-[#3a1a0f] space-y-0.5 border-t border-black/5 pt-1 mt-1">
              <div>அதிபதி: <span className="font-semibold">{d.vaaram_lord_ta || "அதிபதி"}</span></div>
              <div>உதய நாழிகை: <span className="font-mono font-semibold">{udhayadhi}</span></div>
            </div>
          </div>

          <div className="bg-[#fff8ee] border border-[#8b5a2b]/25 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">3. நட்சத்திரம் (Nakshatra)</div>
            <div className="text-sm font-bold text-[#6b1426] my-1">{d.nakshatram_ta}</div>
            <div className="text-[10px] text-[#3a1a0f] space-y-0.5 border-t border-black/5 pt-1 mt-1">
              <div>சென்றது: <span className="font-mono font-semibold">{nakSentra}</span></div>
              <div>நின்றது: <span className="font-mono font-semibold">{nakNindra}</span></div>
            </div>
          </div>

          <div className="bg-[#fff8ee] border border-[#8b5a2b]/25 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">4. யோகம் (Yogam)</div>
            <div className="text-sm font-bold text-[#6b1426] my-1">{d.yogam_ta}</div>
            <div className="text-[10px] text-emerald-800 font-bold border-t border-black/5 pt-1 mt-1">
              {d.subha_yogam_ta || "சுப யோகம்"}
              <div className="text-[9px] text-[#6f6049] font-normal">பஞ்சாங்க யோகம்</div>
            </div>
          </div>

          <div className="bg-[#fff8ee] border border-[#8b5a2b]/25 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between">
            <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">5. கரணம் (Karanam)</div>
            <div className="text-sm font-bold text-[#6b1426] my-1">{d.karanam_ta}</div>
            <div className="text-[10px] text-[#3a1a0f] border-t border-black/5 pt-1 mt-1">
              <div>சுப கரணம்</div>
              <div className="text-[9px] text-[#8b5a2b] font-mono">1/2 திதி அளவு</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dasha Nazhigai Math & Micro Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Box A: Dasha Balance Nazhigai Math */}
        <div className="bg-[#fffaf0] border border-[#8b5a2b]/25 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#8b5a2b]/15">
            <Flame className="w-4 h-4 text-[#b03726]" />
            <h4 className="text-xs font-bold text-[#6b1426] font-tamil">
              வாக்கிய முறை தசா இருப்பு கணிதம் (Dasha Balance Nazhigai Math)
            </h4>
          </div>

          <div className="space-y-2 text-xs handwritten-tamil">
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">நட்சத்திர பரம நாழிகை (Total Star Span):</span>
              <span className="font-bold text-[#2b2117] font-mono">{paramanazhigai}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">சென்ற நாழிகை (Elapsed Nazhigai):</span>
              <span className="font-semibold text-[#2b2117] font-mono">{nakSentra}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6f6049]">நின்ற நாழிகை (Balance Nazhigai):</span>
              <span className="font-semibold text-[#2b2117] font-mono">{nakNindra}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#8e2b1c] font-bold">பிறப்பில் தசா இருப்பு:</span>
              <span className="font-bold text-[#8e2b1c]">{d.dasha_balance_ta || "—"}</span>
            </div>
          </div>
        </div>

        {/* Box B: Micro Metrics (நேத்திரம், ஜீவன், வாரசூலை, யோகினி) */}
        <div className="bg-[#fffaf0] border border-[#8b5a2b]/25 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#8b5a2b]/15">
            <Compass className="w-4 h-4 text-[#b03726]" />
            <h4 className="text-xs font-bold text-[#6b1426] font-tamil">
              பஞ்சாங்க சூட்சுமக் கூறுகள் (Panchanga Micro-Metrics)
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs handwritten-tamil">
            <div className="bg-white/70 p-2 rounded-xl border border-black/5">
              <span className="text-[10px] text-[#6f6049] block">நேத்திரம் & ஜீவன்</span>
              <span className="font-bold text-[#6b1426]">நேத்திரம் {nethiram} · ஜீவன் {jeevan}</span>
            </div>
            <div className="bg-white/70 p-2 rounded-xl border border-black/5">
              <span className="text-[10px] text-[#6f6049] block">வாரசூலை & பரிகாரம்</span>
              <span className="font-bold text-[#6b1426]">{vaaraSoolai} · {soolaiPariharam}</span>
            </div>
            <div className="bg-white/70 p-2 rounded-xl border border-black/5">
              <span className="text-[10px] text-[#6f6049] block">யோகினி வாசம்</span>
              <span className="font-bold text-[#6b1426]">{yoginiDir}</span>
            </div>
            <div className="bg-white/70 p-2 rounded-xl border border-black/5">
              <span className="text-[10px] text-[#6f6049] block">சூன்ய ராசிகள்</span>
              <span className="font-bold text-[#6b1426]">{soonyaRasis}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Shastric Insights on Thirukanitham vs Vakhyam */}
      <div className="border-t border-[#8b5a2b]/20 pt-4">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-[#8e2b1c] hover:underline font-tamil"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#b03726]" />
            {lang === "ta"
              ? "வாக்கிய பஞ்சாங்கம் vs திருக்கணிதம் — சாஸ்திர மரபு மற்றும் கோவில் வழிபாட்டு வேறுபாடு விளக்கம்"
              : "Vakhyam vs Thirukanitham — Traditional Shastric & Temple Differences"}
          </span>
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExplanation && (
          <div className="mt-3 p-4 bg-[#fffaf0] rounded-xl border border-[#8b5a2b]/20 text-xs text-[#3a1a0f] space-y-2.5 handwritten-tamil leading-relaxed animate-fade-in">
            <p>
              <strong>1. வாக்கிய பஞ்சாங்க முறை:</strong> சூரிய சித்தாந்தத்தை அடிப்படையாகக் கொண்டு, வரருசி முனிவர் அருளிய நினைவுக் குறியீட்டு வாக்கியங்களை (Mnemonic Verses) பின்பற்றி கணிக்கப்படுகிறது. தமிழ்நாடு பிரசித்தி பெற்ற சிவாலயங்கள் (சிதம்பரம், மதுரை, திருவானைக்காவல்), வைணவ திருத்தலங்கள் (ஸ்ரீரங்கம்) மற்றும் கோவில் திருவிழாக்கள், உற்சவங்கள் பாரம்பரியமாக வாக்கிய பஞ்சாங்க முறைப்படியே நடத்தப்படுகின்றன.
            </p>
            <p>
              <strong>2. திருக்கணித பஞ்சாங்க முறை:</strong> நவீன வானியல் தொலைநோக்கிக் கணித முறை (Drik-Ganita) மற்றும் சித்ரபக்ஷ லஹரி அயனாம்சத்தை அடிப்படையாகக் கொண்டது. கிரகங்களின் தோற்ற நிலையைத் துல்லியமாக பிரதிபலிக்கிறது.
            </p>
            <p>
              <strong>3. வேறுபாட்டு அளவு:</strong> வாக்கிய முறைக்கும் திருக்கணித முறைக்கும் கிரக ஸ்புடங்களில் சுமார் 2° முதல் 3° வரை (சுமார் 4 முதல் 6 மணி நேரம் / 10 முதல் 15 நாழிகைகள்) வேறுபாடு ஏற்படும். இதனால் நட்சத்திர மற்றும் திதி முடிவுகளில் சில நாழிகைகள் மாற்றங்கள் காணப்படலாம். இரண்டும் அவரவர் குல ஆசாரப்படி போற்றத்தக்க பாரம்பரிய முறைகளாகும்.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
