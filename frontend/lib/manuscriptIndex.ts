// frontend/lib/manuscriptIndex.ts
//
// The 14-chapter / 50-page map of the Sampoorana Jathagam manuscript.
//
// Moved out of app/page.tsx so that exactly one list drives all three places
// that need it: the on-screen chapter navigation, the on-screen Index of
// Contents, and the printed Table of Contents that is now inserted as page 2
// of the downloaded PDF (components/manuscript/ManuscriptTocPage.tsx).
// Previously the index existed only inside page.tsx, which is why the
// downloaded book had no contents page at all.

export interface ManuscriptChapter {
  ch: number;
  startPage: number;
  endPage: number;
  titleTa: string;
  titleEn: string;
}

export interface ManuscriptPageEntry {
  page: number;
  titleTa: string;
  titleEn: string;
}

export const MANUSCRIPT_CHAPTERS: ManuscriptChapter[] = [
  { ch: 1, startPage: 1, endPage: 4, titleTa: "வாழ்த்து & பயோடேட்டா", titleEn: "Invocations & Bio-Data" },
  { ch: 2, startPage: 5, endPage: 7, titleTa: "பஞ்சாங்க கணிதம்", titleEn: "Panchangam Computations" },
  { ch: 3, startPage: 8, endPage: 10, titleTa: "கிரக ஸ்புடம் & திருஷ்டி", titleEn: "Longitudes & Aspects" },
  { ch: 4, startPage: 11, endPage: 17, titleTa: "16 வர்க்க சக்கரங்கள்", titleEn: "16 Varga Chakras" },
  { ch: 5, startPage: 18, endPage: 20, titleTa: "ஷட்பலம் & பாவக பலம்", titleEn: "Shadbala & Strengths" },
  { ch: 6, startPage: 21, endPage: 27, titleTa: "அஷ்டகவர்க்க மகா காண்டம்", titleEn: "Ashtakavarga Master" },
  { ch: 7, startPage: 28, endPage: 30, titleTa: "குஜ தோஷம் & 14 விதிகள்", titleEn: "Kuja Dosha & 14 Rules" },
  { ch: 8, startPage: 31, endPage: 34, titleTa: "யோகங்கள் & தோஷங்கள்", titleEn: "Yogas & Doshas" },
  { ch: 9, startPage: 35, endPage: 37, titleTa: "ஆயுள் கணிதம் & மாரகம்", titleEn: "Ayurdaya & Longevity" },
  { ch: 10, startPage: 38, endPage: 42, titleTa: "120-ஆண்டு தசா புக்தி", titleEn: "Vimshottari Dasha" },
  { ch: 11, startPage: 43, endPage: 46, titleTa: "12 பாவக பலன்கள்", titleEn: "12 Bhava Predictions" },
  { ch: 12, startPage: 47, endPage: 48, titleTa: "கோச்சாரம் & பொருத்தம்", titleEn: "Transits & Porutham" },
  { ch: 13, startPage: 49, endPage: 49, titleTa: "பஞ்ச பட்சி & நாமகரணம்", titleEn: "Pancha Pakshi & Names" },
  { ch: 14, startPage: 50, endPage: 50, titleTa: "பரிகாரம் & மங்கள வாழ்த்து", titleEn: "Remedies & Mangalam" },
];

export const MANUSCRIPT_PAGES: ManuscriptPageEntry[] = [
  { page: 1, titleTa: "முகப்பு அட்டை & மங்கள சுலோகம்", titleEn: "Cover Page & Mangala Sloka" },
  { page: 2, titleTa: "தமிழ் தாய் வாழ்த்து & கடவுள் வாழ்த்து", titleEn: "Tamil Thai & Kadavul Vazhthu" },
  { page: 3, titleTa: "நவக்கிரக தியானம் & காயத்ரி மந்திரங்கள்", titleEn: "Navagraha Dhyanam & Gayatri" },
  { page: 4, titleTa: "ஜாதகர் & பெற்றோர் முழு விபரம் (Bio-Data)", titleEn: "Candidate & Parents Bio-Data" },
  { page: 5, titleTa: "காலக் கணிதம் & 6 யுகாப்தங்கள் (Vakhyam vs Thirukanitham)", titleEn: "6 Historical Eras & Systems" },
  { page: 6, titleTa: "பஞ்சாங்க அங்கங்கள் & நாழிகை கணிதம்", titleEn: "5 Panchanga Angas & Nazhigai" },
  { page: 7, titleTa: "உதயாதி கணிதம் & 24 மணி நேர தின ஹோரை", titleEn: "Sunrise/Sunset & 24 Horas" },
  { page: 8, titleTa: "நவகிரக ஸ்புட அட்டவணை (DMS & பாதங்கள்)", titleEn: "11-Position Planetary Longitudes" },
  { page: 9, titleTa: "கிரக திருஷ்டி & நவதாரா சக்கரம்", titleEn: "Graha Drishti & Navatara Chakra" },
  { page: 10, titleTa: "பாலாதி அவஸ்தைகள் & ஜைமினி காரகங்கள்", titleEn: "Planetary Avasthas & Chara Karakas" },
  { page: 11, titleTa: "லக்ன ராசி சக்கரம் (D1) & நவாம்சம் (D9)", titleEn: "Rasi & Navamsa Chakras" },
  { page: 12, titleTa: "ஸ்ரீபதி பாவக சலிதம் (D13) & ஆரம்ப-மத்திய-அந்த ஸ்புடம்", titleEn: "Bhava Chalit & Cusp Longitudes" },
  { page: 13, titleTa: "ஹோரா (D2), திரேக்காணம் (D3), சதுர்த்தாம்சம் (D4), சப்தாம்சம் (D7)", titleEn: "D2, D3, D4, D7 Divisional Charts" },
  { page: 14, titleTa: "தசாம்சம் (D10), துவாதசாம்சம் (D12), சோடசாம்சம் (D16), விம்சாம்சம் (D20)", titleEn: "D10, D12, D16, D20 Varga Charts" },
  { page: 15, titleTa: "சதுர்விம்சாம்சம் (D24), சப்தவிம்சாம்சம் (D27), திரிம்சாம்சம் (D30), சஷ்டியாம்சம் (D60)", titleEn: "D24, D27, D30, D60 Charts" },
  { page: 16, titleTa: "வர்க்கோத்தம சக்கரம் & வைசேஷிகாம்ச பலம்", titleEn: "Vargottama & Vaisheshikamsa" },
  { page: 17, titleTa: "16 வர்க்க சுருக்க அட்டவணை", titleEn: "16 Shodashavarga Summary Matrix" },
  { page: 18, titleTa: "ஷட்பல ஆறு வகை பலங்கள் (Virupas)", titleEn: "Shadbala 6-Fold Virupas" },
  { page: 19, titleTa: "ஷட்பல ரூபங்கள் & கிரக தரவரிசை பலம்", titleEn: "Shadbala Rupas & Planet Rankings" },
  { page: 20, titleTa: "12 பாவக பல கணிதம் & பல வரிசை", titleEn: "12 Bhava Strengths & Rankings" },
  { page: 21, titleTa: "சர்வ அஷ்டகவர்க்க 337 பிந்து மகா சக்கரம்", titleEn: "Sarvashtakavarga 337 Chakra" },
  { page: 22, titleTa: "சூரியன் & சந்திரன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Sun & Moon Bhinnashtakavarga" },
  { page: 23, titleTa: "செவ்வாய் & புதன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Mars & Mercury Bhinnashtakavarga" },
  { page: 24, titleTa: "குரு & சுக்கிரன் பின்ன அஷ்டகவர்க்கம்", titleEn: "Jupiter & Venus Bhinnashtakavarga" },
  { page: 25, titleTa: "சனி & லக்னம் பின்ன அஷ்டகவர்க்கம்", titleEn: "Saturn & Lagna Bhinnashtakavarga" },
  { page: 26, titleTa: "திரிகோண & ஏகாதிபத்திய சோதனைகள்", titleEn: "Trikona & Ekadhipatya Shodhana" },
  { page: 27, titleTa: "ராசி/கிரக/சோத்ய பிண்ட கணிதம் & கோச்சாரம்", titleEn: "Shodhya Pindas & Transits" },
  { page: 28, titleTa: "குஜ (செவ்வாய்) தோஷ தத்துவம் & நிலைகள்", titleEn: "Kuja Dosha Placements" },
  { page: 29, titleTa: "குஜ தோஷ 14 சாஸ்திர விதிவிலக்குகள் ஆய்வு", titleEn: "14 Classical Cancellation Rules Audit" },
  { page: 30, titleTa: "திருமணப் பொருத்தம், பரிகாரம் & திருத்தலங்கள்", titleEn: "Kuja Dosha Matching & Remedies" },
  { page: 31, titleTa: "மகா ராஜ யோகங்கள் & தன யோகங்கள்", titleEn: "Maha Raja & Dhana Yogas" },
  { page: 32, titleTa: "சந்திர யோகங்கள் & சூரிய யோகங்கள்", titleEn: "Lunar & Solar Yogas" },
  { page: 33, titleTa: "கால சர்ப்ப தோஷம் & பித்ரு தோஷ ஆய்வு", titleEn: "Kala Sarpa & Pitru Doshas" },
  { page: 34, titleTa: "செவ்வாய், மாந்தி, குரு சண்டாள & புனர்பூ தோஷங்கள்", titleEn: "Minor Doshas Analysis" },
  { page: 35, titleTa: "பராசர/ஜைமினி ஆயுள் கணிதம் (Three Pairs)", titleEn: "Parashara Three Pairs Longevity" },
  { page: 36, titleTa: "அஷ்டம ஸ்தான & ஆயுஷ்காரக சனி பலம்", titleEn: "8th House & Saturn Dignity" },
  { page: 37, titleTa: "மாரக, பாதக ஸ்தான ஆய்வு & ஆயுள் பரிகாரங்கள்", titleEn: "Maraka, Badhaka & Life Remedies" },
  { page: 38, titleTa: "ஜெனன தசா இருப்பு நாழிகை & விநாழிகை", titleEn: "Birth Dasha Balance Calculation" },
  { page: 39, titleTa: "120-ஆண்டு விம்சோத்தரி மகா தசா வரிசை", titleEn: "120-Year Vimshottari Timeline" },
  { page: 40, titleTa: "தற்போதைய & அடுத்தடுத்த புக்தி அட்டவணை", titleEn: "Current & Upcoming Bhuktis" },
  { page: 41, titleTa: "அந்தர தசா விபர கணிதம்", titleEn: "Antardasha Sub-Periods" },
  { page: 42, titleTa: "தசா நாதர்கள் வெண்பா பாடல் & பரிகாரங்கள்", titleEn: "Dasha Lord Classical Verses & Rituals" },
  { page: 43, titleTa: "1, 2, 3-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 1, 2, 3 Readings" },
  { page: 44, titleTa: "4, 5, 6-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 4, 5, 6 Readings" },
  { page: 45, titleTa: "7, 8, 9-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 7, 8, 9 Readings" },
  { page: 46, titleTa: "10, 11, 12-ஆம் பாவக பலன்கள்", titleEn: "Bhavas 10, 11, 12 Readings" },
  { page: 47, titleTa: "கோச்சார கிரக நிலைகள் & ஏழரை சனி பலன்கள்", titleEn: "Transits & Sade Sati" },
  { page: 48, titleTa: "10 திருமணப் பொருத்தங்கள் & அஷ்டகூட வழிகாட்டி", titleEn: "10 Poruthams & Kuta Guide" },
  { page: 49, titleTa: "அகஸ்தியர் பஞ்ச பட்சி, எண் கணிதம் & 108 நாம அக்ஷரம்", titleEn: "Pancha Pakshi, Numerology & Names" },
  { page: 50, titleTa: "சர்வ தோஷ சாந்தி, பரிகாரங்கள் & மங்கள வாழ்த்து", titleEn: "Master Remedies & Mangalam" },
];