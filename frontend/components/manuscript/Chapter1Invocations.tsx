"use client";

import React from "react";
import { ManuscriptPageProps } from "./types";
import { PageWrapper } from "./shared";

export const Chapter1Invocations: React.FC<ManuscriptPageProps> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const bio = chart.bio_data || {};
  const isVakhyam = chart.panchangam_system === "vakhyam";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PAGE 1: அட்டைப் படம் & மங்கல ஆரம்பம் (GRAND TITLE COVER)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={1}
        chapterTitleTa="பகுதி 1: மங்கலாரம்பம் & முகவுரை"
        chapterTitleEn="Part 1: Invocations & Preamble"
        pageTitleTa="ஸ்ரீ வேத மகா சம்பூர்ண ஜாதக பிரபந்தம்"
        pageTitleEn="Sri Veda Maha Sampoorana Jathaga Grand Volume"
        lang={lang}
      >
        <div className="flex flex-col items-center justify-between h-full py-1 text-center space-y-2">
          {/* Sacred Symbol & Title */}
          <div className="space-y-1">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-[0.25em] font-cinzel">
              ॥ ஸ்ரீ கணபதயே நம: ॥ — ॥ ஸ்ரீ குருப்யோ நம: ॥ — ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <div
              className="text-5xl font-bold text-[#b03726] pt-1"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              ௐ
            </div>
            <div className="text-[11px] text-[#aa820a] font-cinzel font-semibold tracking-widest">
              ஹரி: ஓம் • சுபமஸ்து • சித்திரமேவ ஜயதே
            </div>
          </div>

          {/* Golden Plaque */}
          <div className="bg-[#fffaf0] border-2 border-[#aa820a] rounded-2xl p-4 shadow-md max-w-[620px] mx-auto w-full space-y-2 text-[#3a1a0f]">
            <div className="text-[11px] tracking-widest font-cinzel text-[#8e2b1c] font-bold uppercase">
              {isVakhyam
                ? "— பாரம்பர்ய சூரிய சித்தாந்த வாக்கிய பஞ்சாங்க கணித முறை —"
                : "— திருக்கணித சித்ரபக்ஷ லஹரி நவீன துல்லிய வானியல் முறை —"}
            </div>
            <h1
              className="text-[26px] font-bold text-[#8e2b1c] leading-tight"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              {chart.name}
            </h1>
            <div className="text-[13px] font-bold text-[#6b1426]">
              ஜெனன மகா ஜாதக நூல் (50-பக்க சம்பூர்ண பிரபந்தம்)
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-[11px] border-t border-b border-[#aa820a]/30 py-2 my-1">
              <div>
                <span className="font-semibold text-[#6f6049]">பிறந்த தேதி: </span>
                <span className="font-bold text-[#2b2117]">{chart.date_of_birth}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6f6049]">பிறந்த நேரம்: </span>
                <span className="font-bold text-[#2b2117]">{chart.time_of_birth}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6f6049]">பிறந்த ஊர்: </span>
                <span className="font-bold text-[#2b2117]">{chart.place}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6f6049]">லக்னம்: </span>
                <span className="font-bold text-[#8e2b1c]">{d.lagnam_ta} ({d.lagnam})</span>
              </div>
              <div>
                <span className="font-semibold text-[#6f6049]">ஜென்ம ராசி: </span>
                <span className="font-bold text-[#8e2b1c]">{d.rasi_ta} ({d.rasi})</span>
              </div>
              <div>
                <span className="font-semibold text-[#6f6049]">ஜென்ம நட்சத்திரம்: </span>
                <span className="font-bold text-[#8e2b1c]">{d.nakshatram_ta} {d.pada}-ஆம் பாதம்</span>
              </div>
            </div>

            <div className="text-[10px] text-[#6f6049] italic leading-relaxed">
              பராசர முனிவர், வராகமிஹிரர், கல்யாணவர்மர் மற்றும் பழந்தமிழ் ஜோதிட சாஸ்திர விதிகளின்படி
              துல்லியமாக கணிக்கப்பட்டு தொகுக்கப்பட்ட 50 பக்க முழுமையான ஜெனன ஜாதக நூல்.
            </div>
          </div>

          {/* Mangala Shloka Box */}
          <div className="border border-[#aa820a]/40 bg-[#fff8ee] rounded-xl p-3 max-w-[560px] mx-auto w-full text-xs text-center space-y-1">
            <div className="font-bold text-[#6b1426] text-[11px]">✦ ஜெனன மங்கல ஆசிர்வாதம் ✦</div>
            <div className="text-[11px] text-[#3a1a0f] italic leading-relaxed">
              “ஆயுராரோக்ய ஐஸ்வர்யம் தனதான்ய சமிருத்திதம்<br />
              சர்வ மங்கள சௌபாக்யம் ததாஸ்து ஸ்ரீ ஹரிப்ரியா...”
            </div>
            <div className="text-[10px] text-[#6f6049]">
              ஜாதகர் ஆயுள், ஆரோக்கியம், கல்வி, தனம், தானியம், நற்புகழ் மற்றும் சர்வ மங்களங்களுடன் வாழ்க!
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2: தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து (INVOCATIONS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={2}
        chapterTitleTa="பகுதி 1: மங்கலாரம்பம் & முகவுரை"
        chapterTitleEn="Part 1: Invocations & Preamble"
        pageTitleTa="தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து"
        pageTitleEn="Tamil Anthem & Sacred Vedic Invocations"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* தமிழ் தாய் வாழ்த்து */}
          <div className="bg-[#fffaf0] border-2 border-[#b03726] rounded-xl p-3 shadow-sm space-y-1 text-center">
            <div className="font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-0.5 flex items-center justify-center gap-2">
              <span>❧</span>
              <span>தமிழ் தாய் வாழ்த்து</span>
              <span>❧</span>
            </div>
            <div
              className="text-[11.5px] text-[#2b2117] leading-relaxed font-semibold"
              style={{ fontFamily: "'Kavivanar', cursive" }}
            >
              நீராருங் கடலுடுத்த நிலமடந்தைக் கெழிலொழுகும்<br />
              சீராரும் வதனமெனத் திகழ்பரதக் கண்டமிதில்<br />
              தெக்கணமும் அதிற்சிறந்த திராவிடநல் திருநாடும்<br />
              தக்கசிறு பிறைநுதலும் தரித்தநறுந் திலகமுமே!<br />
              அத்திலக வாசனைபோல் அனைத்துலகும் இன்பமுற<br />
              எத்திசையும் புகழ்மணக்க இருந்தபெருந் தமிழணங்கே!<br />
              தமிழணங்கே!<br />
              உன் சீரிளமைத் திறம்வியந்து செயல்மறந்து<br />
              வாழ்த்துதுமே! வாழ்த்துதுமே! வாழ்த்துதுமே!
            </div>
            <div className="text-[9px] text-[#6f6049] italic">
              — மனோன்மணீயம் பா. சுந்தரனார்
            </div>
          </div>

          {/* கடவுள் வாழ்த்து Stutis Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* விநாயகர் */}
            <div className="bg-[#fff8ee] border border-[#8b5a2b]/40 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[11px] border-b border-[#aa820a]/30 pb-0.5">
                ✦ ஸ்ரீ விநாயகர் துதி ✦
              </div>
              <div className="text-[10.5px] text-[#3a1a0f] text-center italic leading-relaxed">
                “ஐந்து கரத்தனை யானை முகத்தினை<br />
                இந்தின் இளம்பிறை போலும் எயிற்றனை<br />
                நந்தி மகன்தனை ஞானக் கொழுந்தினை<br />
                புந்தியில் வைத்தடி போற்றுகின்றேனே...”
              </div>
              <div className="text-[8.5px] text-[#6f6049] text-center">— திருமந்திரம் (திருமூலர்)</div>
            </div>

            {/* முருகன் */}
            <div className="bg-[#fff8ee] border border-[#8b5a2b]/40 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[11px] border-b border-[#aa820a]/30 pb-0.5">
                ✦ ஸ்ரீ சுப்பிரமணியர் துதி ✦
              </div>
              <div className="text-[10.5px] text-[#3a1a0f] text-center italic leading-relaxed">
                “வாக்குண்டாம் நல்ல மனமுண்டாம் மாமலராள்<br />
                நோக்குண்டாம் மேனி நுடங்காது — பூக்கொண்டு<br />
                துப்பார் திருமேனித் தும்பிக்கையான் பாதம்<br />
                தப்பாமல் சார்வார் தமக்கு...”
              </div>
              <div className="text-[8.5px] text-[#6f6049] text-center">— ஔவையார் நல்வழி</div>
            </div>

            {/* சரஸ்வதி */}
            <div className="bg-[#fff8ee] border border-[#8b5a2b]/40 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[11px] border-b border-[#aa820a]/30 pb-0.5">
                ✦ ஸ்ரீ சரஸ்வதி தேவி வந்தனம் ✦
              </div>
              <div className="text-[10.5px] text-[#3a1a0f] text-center italic leading-relaxed">
                “சரஸ்வதி நமஸ்துப்யம் வரதே காமரூபிணி<br />
                வித்யாரம்பம் கரிஷ்யாமி சித்திர்பவது மே ஸதா...”<br />
                வெள்ளைத் தாமரைப் பூவிலிருப்பாள்<br />
                வீணை செய்யும் ஒலியில் இருப்பாள்!
              </div>
              <div className="text-[8.5px] text-[#6f6049] text-center">— மகாபாரதி</div>
            </div>

            {/* தட்சிணாமூர்த்தி */}
            <div className="bg-[#fff8ee] border border-[#8b5a2b]/40 rounded-xl p-2.5 space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[11px] border-b border-[#aa820a]/30 pb-0.5">
                ✦ ஸ்ரீ தட்சிணாமூர்த்தி ஸ்தோத்திரம் ✦
              </div>
              <div className="text-[10.5px] text-[#3a1a0f] text-center italic leading-relaxed">
                “குருவே சர்வ லோகானாம் பிஷஜே பவரோகிணாம்<br />
                நிதயே சர்வ வித்யானாம் ஸ்ரீ தட்சிணாமூர்த்தயே நம:...”<br />
                ஞானம், வித்தை அருளும் ஞானாசிரியன் சரணம்!
              </div>
              <div className="text-[8.5px] text-[#6f6049] text-center">— ஆதிசங்கரர் ஸ்தோத்திரம்</div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 3: நவக்கிரக தியான ஸ்தோத்திரம் & காயத்ரி (NAVAGRAHAS)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={3}
        chapterTitleTa="பகுதி 1: மங்கலாரம்பம் & முகவுரை"
        chapterTitleEn="Part 1: Invocations & Preamble"
        pageTitleTa="நவக்கிரக தியான ஸ்தோத்திரங்கள் & காயத்ரி மந்திரங்கள்"
        pageTitleEn="Navagraha Dhyana Slokas & Sacred Gayatris"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="bg-[#fffaf0] border border-[#8b5a2b]/30 rounded-xl p-2 text-center text-[10.5px] text-[#3a1a0f] italic">
            “நம: சூர்யாய சந்திராய மங்களாய புதாய ச | குரு சுக்ர சனிப்யஸ்ச ராகவே கேதவே நம: ||”
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1">
            {[
              {
                graha: "சூரியன் (Sun)",
                color: "#b03726",
                sloka: "ஜபாகுஸும ஸங்காசம் காஷ்யபேயம் மஹாத்யுதிம் | தமோரிம் ஸர்வபாபக்னம் ப்ரணதோஸ்மி திவாகரம் ||",
                gayatri: "ஓம் அஸ்வத்வஜாய வித்மஹே பாசஹஸ்தாய தீமஹி தன்னோ சூர்ய: ப்ரசோதயாத்."
              },
              {
                graha: "சந்திரன் (Moon)",
                color: "#1d4ed8",
                sloka: "ததிஸங்க துஷாராபம் க்ஷீரோதார்ணவ ஸம்பவம் | நமாமி சசினம் சோமம் சம்போர் மகுட பூஷணம் ||",
                gayatri: "ஓம் பத்மத்வஜாய வித்மஹே ஹேமரூபாய தீமஹி தன்னோ சோம: ப்ரசோதயாத்."
              },
              {
                graha: "செவ்வாய் (Mars)",
                color: "#b91c1c",
                sloka: "தரaணீகர்ப்ப ஸம்பூதம் வித்யுத்காந்தி ஸமப்ரபம் | குமாரம் சக்திஹஸ்தம் தம் மங்களம் ப்ரணமாம்யஹம் ||",
                gayatri: "ஓம் வீரத்வஜாய வித்மஹே விக்னஹஸ்தாய தீமஹி தன்னோ பௌம: ப்ரசோதயாத்."
              },
              {
                graha: "புதன் (Mercury)",
                color: "#15803d",
                sloka: "ப்ரியங்கு கலிகாச்யாமம் ரூபேணாப்ரதிமம் புதம் | ஸௌம்யம் ஸௌம்யகுணோபேதம் தம் புதம் ப்ரணமாம்யஹம் ||",
                gayatri: "ஓம் கஜத்வஜாய வித்மஹே சுகஹஸ்தாய தீமஹி தன்னோ புத: ப்ரசோதயாத்."
              },
              {
                graha: "குரு (Jupiter)",
                color: "#a16207",
                sloka: "தேவானாஞ்ச ரிஷீணாஞ்ச குரும் காஞ்சனஸந்நிபம் | புத்திபூதம் த்ரிலோகேசம் தம் நமாமி பிருஹஸ்பதிம் ||",
                gayatri: "ஓம் வ்ருஷபத்வஜாய வித்மஹே க்ருணிஹஸ்தாய தீமஹி தன்னோ குரு: ப்ரசோதயாத்."
              },
              {
                graha: "சுக்கிரன் (Venus)",
                color: "#c026d3",
                sloka: "ஹிமகுந்த ம்ருணாலாபம் தைத்யானாம் பரமம் குரும் | ஸர்வசாஸ்த்ர ப்ரவக்தாரம் பார்கவம் ப்ரணமாம்யஹம் ||",
                gayatri: "ஓம் அஸ்வத்வஜாய வித்மஹே தனுர்ஹஸ்தாய தீமஹி தன்னோ சுக்ர: ப்ரசோதயாத்."
              },
              {
                graha: "சனி (Saturn)",
                color: "#334155",
                sloka: "நீலாஞ்ஜன ஸமாபாஸம் ரவிபுத்ரம் யமாக்ரஜம் | சாயாமார்த்தாண்ட ஸம்பூதம் தம் நமாமி சனைச்சரம் ||",
                gayatri: "ஓம் காகத்வஜாய வித்மஹே கட்கஹஸ்தாய தீமஹி தன்னோ மந்த: ப்ரசோதயாத்."
              },
              {
                graha: "ராகு (Rahu)",
                color: "#475569",
                sloka: "அர்த்தகாயம் மஹாவீர்யம் சந்த்ராதித்ய விமர்தனம் | ஸிம்ஹிகாகர்ப்ப ஸம்பூதம் தம் ராகும் ப்ரணமாம்யஹம் ||",
                gayatri: "ஓம் நாகத்வஜாய வித்மஹே பத்மஹஸ்தாய தீமஹி தன்னோ ராகு: ப்ரசோதயாத்."
              },
              {
                graha: "கேது (Ketu)",
                color: "#78350f",
                sloka: "பலாசபுஷ்ப ஸங்காசம் தாரகாக்ரஹ மஸ்தகம் | ரௌத்ரம் ரௌத்ராத்மகம் கோரம் தம் கேதும் ப்ரணமாம்யஹம் ||",
                gayatri: "ஓம் அஸ்வத்வஜாய வித்மஹே சூலஹஸ்தாய தீமஹி தன்னோ கேது: ப்ரசோதயாத்."
              },
            ].map((g, idx) => (
              <div key={idx} className="bg-[#fff8ee] border border-[#8b5a2b]/30 rounded-lg p-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[11px] text-center border-b pb-0.5 mb-1" style={{ color: g.color }}>
                    {g.graha}
                  </div>
                  <div className="text-[9px] text-[#3a1a0f] italic leading-tight mb-1">
                    {g.sloka}
                  </div>
                </div>
                <div className="text-[8.5px] bg-[#fffaf0] border border-[#aa820a]/20 p-1 rounded text-[#6b1426] leading-tight">
                  <span className="font-semibold">காயத்ரி: </span>{g.gayatri}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>

      {/* ══════════════════════════════════════════════════════════
          PAGE 4: பெற்றோர் & ஜாதகர் பயோடேட்டா (DETAILED BIO-DATA)
      ══════════════════════════════════════════════════════════ */}
      <PageWrapper
        pageNumber={4}
        chapterTitleTa="பகுதி 1: மங்கலாரம்பம் & முகவுரை"
        chapterTitleEn="Part 1: Invocations & Preamble"
        pageTitleTa="பெற்றோர், குடும்பம் & ஜாதகர் பயோடேட்டா"
        pageTitleEn="Comprehensive Parents & Candidate Bio-Data"
        lang={lang}
      >
        <div className="flex flex-col justify-between h-full space-y-2 text-xs">
          {/* Candidate Card */}
          <div className="bg-[#fffaf0] border-2 border-[#8b5a2b] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#8e2b1c] text-[13px] border-b border-[#aa820a]/30 pb-1">
              ✦ ஜாதகர் சுய விபரக் குறிப்பு (Candidate Particulars) ✦
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div><span className="font-semibold text-[#6f6049]">பெயர்:</span> <span className="font-bold text-[#2b2117]">{chart.name}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பாலினம்:</span> <span className="font-bold text-[#2b2117]">{chart.gender === "female" ? "பெண் (Female)" : "ஆண் (Male)"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பிறந்த தேதி:</span> <span className="font-bold text-[#2b2117]">{chart.date_of_birth}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பிறந்த நேரம்:</span> <span className="font-bold text-[#2b2117]">{chart.time_of_birth}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பிறந்த ஊர்:</span> <span className="font-bold text-[#2b2117]">{chart.place}</span></div>
              <div><span className="font-semibold text-[#6f6049]">உயரம்:</span> <span className="font-bold text-[#2b2117]">{bio.height || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">கல்வித் தகுதி:</span> <span className="font-bold text-[#2b2117]">{bio.education || "பட்டப்படிப்பு"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தொழில் / பணி:</span> <span className="font-bold text-[#2b2117]">{bio.occupation || "பணிபுரிகிறார்"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">வருமானம்:</span> <span className="font-bold text-[#2b2117]">{bio.annual_income || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தொலைபேசி:</span> <span className="font-bold text-[#2b2117]">{bio.phone || chart.phone || "—"}</span></div>
            </div>
          </div>

          {/* Family & Lineage Card */}
          <div className="bg-[#fff8ee] border border-[#aa820a] rounded-xl p-3 shadow-sm space-y-2">
            <div className="text-center font-bold text-[#6b1426] text-[12px] border-b border-[#aa820a]/30 pb-1">
              ✦ பெற்றோர், குலம் & பூர்வீக விபரம் (Lineage & Heritage) ✦
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div><span className="font-semibold text-[#6f6049]">தந்தை பெயர்:</span> <span className="font-bold text-[#2b2117]">{bio.father_name || chart.parent_name || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தந்தை பணி:</span> <span className="font-bold text-[#2b2117]">{bio.father_occupation || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தாயார் பெயர்:</span> <span className="font-bold text-[#2b2117]">{bio.mother_name || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">தாயார் பணி:</span> <span className="font-bold text-[#2b2117]">{bio.mother_occupation || "இல்லத்தரசி"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">கோத்திரம்:</span> <span className="font-bold text-[#8e2b1c]">{bio.gothram || "சிவ கோத்திரம்"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">ஜாதி / உட்பிரிவு:</span> <span className="font-bold text-[#2b2117]">{bio.caste_subcaste || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">குலதெய்வம்:</span> <span className="font-bold text-[#8e2b1c]">{bio.kula_deivam || chart.family_details || "ஸ்ரீ குலதெய்வம்"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">குலதெய்வ தலம்:</span> <span className="font-bold text-[#2b2117]">{bio.kula_deivam_place || "—"}</span></div>
              <div><span className="font-semibold text-[#6f6049]">பூர்வீகம்:</span> <span className="font-bold text-[#2b2117]">{bio.native_place || chart.place}</span></div>
              <div><span className="font-semibold text-[#6f6049]">உடன்பிறப்புகள்:</span> <span className="font-bold text-[#2b2117]">{bio.siblings || "—"}</span></div>
            </div>
            {bio.residence_address && (
              <div className="border-t border-[#aa820a]/20 pt-1 text-[10.5px]">
                <span className="font-semibold text-[#6f6049]">இருப்பிட முகவரி:</span> <span className="text-[#2b2117]">{bio.residence_address}</span>
              </div>
            )}
          </div>

          <div className="border border-[#aa820a]/30 bg-[#fffaf0] rounded-xl p-2 text-center text-[10px] text-[#6f6049] italic">
            மேற்கண்ட விபரங்கள் யாவும் வரன் பார்த்தல், சுபகாரிய பொருத்தம் மற்றும் வம்சாவளி ஆவணப்படுத்தலுக்கு உரிய உண்மைத் தகவல்களாகும்.
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
