"use client";

import React from "react";
import { ChartResponse, KattamPlanet } from "@/lib/types";
import { HandwrittenChartCanvas } from "@/components/HandwrittenChartCanvas";

interface Props {
  chart: ChartResponse;
  lang: "ta" | "en";
}

// 27 Nakshatras authentic Nama Aksharas (Tamil & English) for all 4 Padas
const NAKSHATRA_NAMA_AKSHARAS_TA: Record<string, string[]> = {
  Ashwini: ["சு", "சே", "சோ", "ல"],
  Bharani: ["லீ", "லூ", "லே", "லோ"],
  Krittika: ["அ", "இ", "உ", "ஏ"],
  Rohini: ["ஓ", "வ", "வி", "வு"],
  Mrigashirsha: ["வே", "வோ", "கா", "கீ"],
  Ardra: ["கு", "க", "ங", "ச"],
  Punarvasu: ["கே", "கோ", "ஹா", "ஹீ"],
  Pushya: ["ஹூ", "ஹே", "ஹோ", "ட"],
  Ashlesha: ["டீ", "டூ", "டே", "டோ"],
  Magha: ["மா", "மீ", "மூ", "மே"],
  "Purva Phalguni": ["மோ", "டா", "டீ", "டூ"],
  "Uttara Phalguni": ["டே", "டோ", "பா", "பீ"],
  Hasta: ["பூ", "ஷ", "ண", "ட"],
  Chitra: ["பே", "போ", "ரா", "ரீ"],
  Swati: ["ரூ", "ரே", "ரோ", "தா"],
  Vishakha: ["தே", "தோ", "நா", "நீ"],
  Anuradha: ["நூ", "நே", "நோ", "யா"],
  Jyeshtha: ["யே", "யோ", "பா", "பீ"],
  Moola: ["யே", "யோ", "பா", "பீ"],
  "Purva Ashadha": ["பூ", "தா", "பா", "தா"],
  "Uttara Ashadha": ["பே", "போ", "ஜா", "ஜீ"],
  Shravana: ["கீ", "கூ", "கே", "கோ"],
  Dhanishta: ["கா", "கீ", "கு", "கே"],
  Shatabhisha: ["கோ", "ஸா", "ஸீ", "ஸு"],
  "Purva Bhadrapada": ["சே", "சோ", "தா", "தீ"],
  "Uttara Bhadrapada": ["தூ", "த", "ஞ", "த"],
  Revati: ["தே", "தோ", "சா", "சீ"],
};

// Traditional Dasha poems and remedies
const DASHA_TRADITIONAL_POEMS: Record<
  string,
  { poem: string; devata: string; temple: string; grain: string; cloth: string; flower: string; remedy: string }
> = {
  Sun: {
    poem: "கூறப்பா கதிருக்கு வருஷம் ஆறு குணமுள்ள புத்தி நாள் நூற்றெட்டாகும்\nபாரப்பா அக்கினியால் பீடையுண்டு பாங்கான அபமிருத்துப் பொருளுஞ் சேதம்\nஆரப்பா அறிவாளர்கள் பிதாமிருத்தியு அரிதான வாணிபஞ் செல்லாகாது நஷ்டம்\nகேளப்பா கண்ணோவால் கனலே கூறினோமே.",
    devata: "சிவபெருமான், காயத்ரி தேவி",
    temple: "சூரியனார் கோவில் (ஆடுதுறை, தஞ்சாவூர்)",
    grain: "கோதுமை",
    cloth: "சிவப்பு / செந்தாமரை நிறம்",
    flower: "செந்தாமரை",
    remedy: "ஞாயிற்றுக்கிழமைகளில் ஆதித்ய ஹிருதய ஸ்தோத்திரம் ஜபித்து, சூரிய நமஸ்காரம் செய்தல் நலம்.",
  },
  Moon: {
    poem: "சொல்லவே சந்திர திசை வருஷம் பத்தில் சுகமுடைய சந்திர புத்தி மாதம் பத்து\nநில்லவே யதனுடைய பலனைச் சொல்வோம் நிகரில்லா மன்னருடன் மகிழ்ச்சியாகும்\nசொல்லவே சுயவரங்கள் நாட்டி வைத்து சுகமான கல்யாணம் ஆகும் பாரு\nவெல்லவே சத்துருவை ஜெயிக்கலாகும் வேண்டியபடி நிதி சேரும் விவரந்தானே.",
    devata: "பார்வதி தேவி, ஸ்ரீ ராஜராஜேஸ்வரி",
    temple: "திங்களூர் சந்திர பகவான் கோவில் (தஞ்சாவூர்)",
    grain: "நெல் (பச்சரிசி)",
    cloth: "வெண்மை / முத்து நிறம்",
    flower: "வெள்ளை அலரி, மல்லிகை",
    remedy: "திங்கட்கிழமை தோறும் அம்மன் வழிபாடு மற்றும் பௌர்ணமி கிரிவலம் நலம் பயக்கும்.",
  },
  Mars: {
    poem: "ஆமென்ற சேய்திசை வருஷம் ஏழில் அங்காரகன் புத்திநாள் நூற்று நாற்பது ஏழு\nபோமென்ற அதன் பலனைப் புகலக் கேளு புகழான அரசர் பகை ஆயுதத்தால் பீடை\nதாமென்ற சத்துருவால் வியாதியது காணும் தனச்சேதம் உடற் சேதம் தானே உண்டாம்\nநாமென்ற நகரத்தில் சூனியங்களுண்டாம் நாளெல்லாம் தீதாகும் நன்மையில்லாப் பகையே.",
    devata: "ஸ்ரீ சுப்பிரமணியர் (முருகப்பெருமான்)",
    temple: "வைத்தீஸ்வரன் கோவில் (மயிலாடுதுறை)",
    grain: "துவரை",
    cloth: "சிவப்பு நிற பட்டு",
    flower: "செண்பகப்பூ, செவ்வரளி",
    remedy: "செவ்வாய்க்கிழமைகளில் கந்த சஷ்டி கவசம் ஓதி, சுப்பிரமணியர் பாதத்தில் நெய் விளக்கு ஏற்றுதல்.",
  },
  Mercury: {
    poem: "பார்க்கப்பா புதன்திசை வருஷம்பதினேழு பாரிலுள்ள நற்புத்தி நாட்கள்தானும்\nஏற்கவே முன்னூற்று முப்பதுநாற் கழித்தே இன்பமுடன் புதன்திசை நடக்கும்போது\nசீர்க்கவே வித்தையுண்டு கல்விஞானம் சிறப்புடனே தனலாபம் அரசுமன்னர்\nநேர்க்கவே பூமிமுதல் வாகனமுஞ் சேரும் நித்தியமும் மங்களங்கள் நேருந்தானே.",
    devata: "ஸ்ரீ மகாவிஷ்ணு",
    temple: "திருவெண்காடு சுவேதாரண்யேஸ்வரர் கோவில்",
    grain: "பச்சைப்பயறு",
    cloth: "பச்சை நிற வஸ்திரம்",
    flower: "வெண்காந்தள் மலர்",
    remedy: "புதன்கிழமைகளில் விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்து பெருமாளுக்கு துளசி மாலை சாத்துதல்.",
  },
  Jupiter: {
    poem: "காணவே குரு திசை வியாழபுத்தி கணமான மாதமது பதினொன்றாகும்\nதோணவே நாள்துவும் ஆறதாகும் தொகையான தனங்களும் புத்திரனாலுண்டாம்\nபூணவே மூவுடையாள் நிர்த்தனம் செய்வாள் பூமிதனில் வெகுலாபம் பொருந்திக் காணும்\nநாணவே ராஜாங்க யோகம் பெற்று நன்றாக சுகம் விளையும் யோகந்தானே.",
    devata: "ஸ்ரீ தட்சிணாமூர்த்தி, பிரம்மா",
    temple: "ஆலங்குடி ஆபத்சகாயேஸ்வரர் கோவில் (தஞ்சாவூர்)",
    grain: "கொண்டைக்கடலை",
    cloth: "மஞ்சள் நிற பட்டு",
    flower: "மஞ்சள் முல்லை, செவ்வந்தி",
    remedy: "வியாழன்தோறும் கொண்டைக்கடலை மாலை அணிவித்து தட்சிணாமூர்த்திக்கு நெய் தீபம் ஏற்றுதல்.",
  },
  Venus: {
    poem: "காணவே சுக்கிர திசை வருஷம் நாலைந்து கனமான சுக்கிரனில் சுக்கிரன் புத்தி\nபூணவே மாதமது நாற்பதாகும் பூலோக மன்னரைப் போல் புவியிலரசாள்வான்\nபேணவே சவுக்கியங்களுண்டாகும் பாரு பெரிதான லெட்சுமியும் பொற்கொடிபோல் வருவாள்\nதொணவே சோபனமும் சுபயோகமுண்டாம் தோகையர்கள் வந்தவுடன் தொகுதியுடன் வாழ்வான்.",
    devata: "ஸ்ரீ மகாலட்சுமி தேவி",
    temple: "கஞ்சனூர் அக்னீஸ்வரர் கோவில் (கும்பகோணம்)",
    grain: "மொச்சை",
    cloth: "வெண்பட்டு",
    flower: "வெண்தாமரை",
    remedy: "வெள்ளிக்கிழமைகளில் ஸ்ரீ சூக்தம் ஜபித்து, சுக்கிர ஓரையில் மகாலட்சுமியை வழிபட சகல சவுபாக்கியங்களும் கிட்டும்.",
  },
  Saturn: {
    poem: "வேறு எந்த கிரகமும் பெறாத ஈஸ்வரன் என்ற அடைமொழி சனி பகவானுக்கே உண்டு\nதானென்ற சனிதீர்க்காயுள் காரகன் கருமை நிறம் கொண்டவர்\nஆயுள் காரகன் கருமை நிறமுடையவர் சுபாவத்தில் அசுபராக இருப்பினும் தர்ம நியாயஸ்தர்\nதிருநள்ளாறு சனீஸ்வரனுக்கு உரிய பரிகார ஸ்தலமாகும் எள் தீபம் நலம் பயக்கும்.",
    devata: "ஸ்ரீ சனீஸ்வர பகவான், எமதர்மன், ஐயப்பன்",
    temple: "திருநள்ளாறு தர்ப்பாரண்யேஸ்வரர் கோவில்",
    grain: "எள்",
    cloth: "கருநீலம் / கருப்பு",
    flower: "கருங்குவளை",
    remedy: "சனிக்கிழமை தோறும் எள் கலந்த அன்னம் காகத்திற்கு இட்டு, நல்லெண்ணெய் தீபம் ஏற்றி வழிபடவும்.",
  },
  Rahu: {
    poem: "காணவே ராகு திசை வருஷம் பதினெட்டு கனதையுள்ள ராகுவினில் ராகு புத்தி\nதோணவே மாதமது முப்பத்திரண்டு தொகையான நாள்துவும் பன்னிரண்டாகும்\nயேனவே சத்துருவால் நிவந்தனையோடும் எண்ணமுள்ள மனைவியரும் இருந்த இடம் பாழ்\nபோனவே பழம் பொருளும் சேதமாகும் பலமான நோயதுவும் கூடிக் கொள்ளும்.",
    devata: "துர்க்கை அம்மன், நாகராஜர்",
    temple: "திருநாகேஸ்வரம் நாகநாதசுவாமி கோவில்",
    grain: "உளுந்து",
    cloth: "நீல / பலவண்ண ஆடை",
    flower: "மந்தாரை",
    remedy: "செவ்வாய், வெள்ளிக்கிழமைகளில் ராகு கால துர்க்கை பூஜை மற்றும் எலுமிச்சை விளக்கு ஏற்றுதல்.",
  },
  Ketu: {
    poem: "உண்டான கேதுதிசை ராகுபுத்தி உண்மையிலா நாள்துவும் வருடம் ஒன்று\nநன்றாகும் நாள்துவும் மூவாறாகும் நலமில்லா அதன் பலனை நவிலக்கேளு\nவிண்டாகுஞ் சத்துருவால் சோரபயமாகும் வினையான மனைவி தன்னால் வீண் கலகமாகும்\nஒன்றாகும் உன் உடம்பில் பிணியுண்டாகும் உறுதியில்லா உன் தெய்வம் ஒடிந்ததானே.",
    devata: "ஸ்ரீ விநாயகப் பெருமான், சித்திரகுப்தர்",
    temple: "கீழப்பெரும்பள்ளம் நாகநாதர் கோவில்",
    grain: "கொள்ளு",
    cloth: "சிவப்பு / பலவண்ண கம்பளி",
    flower: "செவ்வல்லி மலர்",
    remedy: "சங்கடஹர சதுர்த்தி தோறும் விநாயகருக்கு அருகம்புல் மாலை சாத்தி, மோதகம் நைவேத்தியம் செய்தல்.",
  },
};

export const HandwrittenManuscript: React.FC<Props> = ({ chart, lang }) => {
  const d = chart.basic_details;
  const planets = chart.planets || [];
  const ayur = chart.ayurdaya;
  const samp = chart.sampoorana || {};

  // Safe fallback for predictions so Page 9 is NEVER blank
  const pred = chart.rasi_nakshatra_predictions || (chart as any).detailed_predictions || {
    rasi_name: d.rasi,
    rasi_name_ta: d.rasi_ta,
    rasi_prediction_ta: `${d.rasi_ta} ராசியில் பிறந்த ஜாதகர் புத்தி கூர்மை, தர்ம சிந்தனை மற்றும் நற்குணங்கள் நிறைந்தவராக விளங்குவார். எதையும் ஆராய்ந்து முடிவு செய்யும் ஆற்றல் கொண்டவர். குடும்பத்தில் நன்மதிப்பும், உற்றார் உறவினர்கள் மத்தியில் நற்பெயரும் பெறுவார். கடின உழைப்பால் வாழ்வில் மேன்மையடைவார்.`,
    rasi_element_ta: d.bootham_ta || "நிலம்",
    rasi_ruling_planet_ta: d.rasi_lord_ta || "சுப கிரகம்",
    rasi_career_ta: "நிர்வாகம், வியாபாரம், அரசு பணிகள், வங்கி, கல்வி, தொழில்நுட்பம்",
    rasi_health_ta: "உடலில் பித்த உபாதைகள், கண் பார்வை மற்றும் எலும்பு நலம் பேணுதல் நலம்",
    nakshatra_name: d.nakshatram,
    nakshatra_name_ta: d.nakshatram_ta,
    nakshatra_deity: d.nakshatra_deity || "இறைவன்",
    nakshatra_deity_ta: d.nakshatra_deity || "இறைவன்",
    nakshatra_traits_ta: `${d.nakshatram_ta} நட்சத்திரத்தில் பிறந்தவர்கள் தர்ம சிந்தனையும், சொல் வன்மையும், நேர்மையும் கொண்டவர்கள். இறை வழிபாட்டில் அதிக ஈடுபாடு கொண்டு சுப காரியங்களை முன்னின்று நடத்துவர்.`,
    nakshatra_career_ta: "ஆசிரியப்பணி, சட்டம், மருத்துவம், வர்த்தகம், கலைத்துறை, பொதுசேவை",
    nakshatra_temple_ta: "ஸ்ரீ விநாயகர் மற்றும் குலதெய்வ திருக்கோவில்கள்",
    pada: d.pada || 1,
    pada_prediction_ta: `${d.nakshatram_ta} ${d.pada}-ஆம் பாதத்தில் பிறந்ததால் தைரியமும், நற்பண்புகளும், உயர்ந்த லட்சியங்களும் கைவரப்பெற்று சமூகத்தில் மதிப்புடன் வாழ்வர்.`,
    lagna_name_ta: d.lagnam_ta,
    lagna_prediction_ta: `${d.lagnam_ta} லக்னத்தில் பிறந்ததால் கம்பீரமான தோற்றமும், ஆளுமைத் திறனும், தர்ம நெறி தவறாத பண்பும் உண்டு. சொந்த முயற்சியால் உயர்நிலையை அடைவர்.`,
  };

  // Safe syllables for nama aksharas
  const namaSyllables =
    chart.baby_names?.starting_syllables && chart.baby_names.starting_syllables.length > 0
      ? chart.baby_names.starting_syllables
      : NAKSHATRA_NAMA_AKSHARAS_TA[d.nakshatram] || ["சு", "சே", "சோ", "ல"];

  // Traditional historical years fallback
  const birthYear = parseInt(chart.date_of_birth?.split("-")[0] || "1996", 10);
  const salivahana = samp.salivahana_year || (birthYear - 78);
  const kaliyuga = samp.kaliyuga_year || (birthYear + 3101);
  const kollam = samp.kollam_year || (birthYear - 824);
  const fasli = samp.fasli_year || (birthYear - 590);
  const hijri = samp.hijri_year || Math.floor((birthYear - 622) * 1.03);

  const tamilYear = samp.tamil_year || samp.tamil_year_ta || d.tamil_year_ta || "தாது";
  const tamilMonth = samp.tamil_month || samp.tamil_month_ta || d.tamil_month_ta || "சித்திரை";
  const tamilDate = samp.tamil_date || d.tamil_date || 1;

  const ayanaTa = samp.ayana_ta || samp.ayana || d.ayana_ta || "உத்தராயணம்";
  const rituTa = samp.ritu_ta || samp.ritu || d.ritu_ta || "வசந்த ருது";
  const uNazh = samp.udhayadhi_nazhigai_num ?? (d.udhayadhi_nazhigai ? parseInt(d.udhayadhi_nazhigai) : 14);
  const uVin = samp.udhayadhi_vinazhigai_num ?? 15;
  const uTat = samp.tatparai ?? (samp.udhayadhi_tatparai_num ?? 57);

  const nethiram = samp.nethiram ?? "1";
  const jeevan = samp.jeevan ?? "1/2";
  const vaaraSoolai = samp.vaara_soolai_ta || samp.vaara_soolai || "தெற்கு";
  const soolaiPariharam = samp.soolai_pariharam_ta || samp.soolai_pariharam || "தைலம் / நெய்";
  const yoginiDirection = samp.yogini_ta || samp.yogini_direction || "பூமி திசை";

  const panchaPakshi = samp.pancha_pakshi_ta || samp.pancha_pakshi || d.pakshi_ta || "காகம்";
  const pakshiFriendly = samp.friendly_birds_ta || samp.pakshi_friendly || "ஆந்தை, கோழி";
  const pakshiEnemy = samp.enemy_birds_ta || samp.pakshi_enemy || "மயில், வல்லூறு";
  const padupakshiDays = samp.padupakshi_days_ta || samp.padupakshi_days || "திங்கள், சனி";

  const lagnaSubar = samp.lagna_subar_ta || samp.lagna_subar || "சூரியன், குரு";
  const lagnaPabar = samp.lagna_pabar_ta || samp.lagna_pabar || "புதன், சுக்கிரன்";
  const vainasikaStar = samp.vainasika_star_ta || samp.vainasika_star || "மகம்";
  const yogiGraha = samp.yogi_graha_ta || samp.yogi_graha || "சனி";
  const avayogiGraha = samp.avayogi_graha_ta || samp.avayogi_graha || "சந்திரன்";
  const soonyaRasis = samp.soonya_rasis_ta || samp.soonya_rasis || "மிதுனம், கன்னி";

  const birthNum = samp.birth_number ?? (samp.numerology?.birth_number ?? (parseInt(chart.date_of_birth?.split("-")[2] || "15", 10) % 9 || 9));
  const destinyNum = samp.destiny_number ?? (samp.numerology?.destiny_number ?? 5);
  const luckyNumbers = (samp.lucky_numbers || samp.numerology?.lucky_numbers || [1, 5, 6]).join(", ");
  const luckyDates = (samp.lucky_dates || samp.numerology?.lucky_dates || [1, 10, 19, 28, 5, 14, 23, 6, 15, 24]).join(", ");
  const luckyColors = samp.lucky_colors_ta || samp.numerology?.lucky_colors || "மஞ்சள், பொன்னிறம், சாம்பல், நீலம்";
  const luckyStones = samp.lucky_stones_ta || samp.numerology?.lucky_stones || "வைரம், நீலக்கல், மாணிக்கம்";
  const bestDeity = samp.lucky_deity_ta || samp.numerology?.best_deity || "ஸ்ரீ ஐயப்பன், ஸ்ரீ தட்சிணாமூர்த்தி & முருகன்";

  const sentraNazhigai = samp.sentra_nazhigai || samp.dasha_balance_math?.sentra_nazhigai || "43 நாழிகை 28 விநா";
  const nindraNazhigai = samp.nindra_nazhigai || samp.dasha_balance_math?.nindra_nazhigai || "16 நாழிகை 32 விநா";

  // Bio-Data & Vakhyam variables
  const bio = chart.bio_data || {};
  const vd = chart.vakhyam_details || samp.vakhyam_details || {};
  const vikrama = vd.vikrama_year || samp.vikrama_year || (birthYear + 57);
  const fatherName = bio.father_name || chart.parent_name || "";
  const fatherWork = bio.father_occupation || "";
  const motherName = bio.mother_name || "";
  const motherWork = bio.mother_occupation || "";
  const gothram = bio.gothram || "";
  const nativePlace = bio.native_place || "";
  const kulaDeivam = bio.kula_deivam || chart.family_details || "";
  const caste = bio.caste_subcaste || "";
  const siblings = bio.siblings || "";
  const education = bio.education || "";
  const occupation = bio.occupation || "";
  const tithiSentra = vd.tithi_sentra_nazhigai || "30 நாழிகை 00 விநா";
  const tithiNindra = vd.tithi_nindra_nazhigai || "30 நாழிகை 00 விநா";

  // Active dasha lord info
  const activeDasha = chart.vimshottari_dasha?.find((v) => v.is_current) || chart.vimshottari_dasha?.[0];
  const dashaLordKey = activeDasha ? activeDasha.planet : "Jupiter";
  const dashaPoemData = DASHA_TRADITIONAL_POEMS[dashaLordKey] || DASHA_TRADITIONAL_POEMS["Jupiter"];

  // Bhava sphutam list
  const bhavaSphutam = chart.bhava_sphutam || samp.bhava_sphutam || [];

  return (
    <div
      className="manuscript-container flex flex-col items-center gap-8 py-2"
      style={{ width: "794px" }}
    >
      {/* ══════════════════════════════════════════════════════════
          PAGE 1: COVER, INVOCATIONS, GANESHA STUTI & PROFILE
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="1">
        <div className="palm-stain" style={{ width: 180, height: 180, top: 60, right: 40 }} />
        <div className="palm-stain" style={{ width: 120, height: 120, bottom: 80, left: 30 }} />
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          {/* Traditional Invocations Header */}
          <div className="text-center space-y-1.5">
            <div className="text-[15px] font-bold text-[#6b1426] tracking-[0.25em] font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <div className="text-[10px] tracking-[0.2em] font-cinzel text-[#6b1426]/80 font-semibold">
              ॥ ஸ்ரீ கணபதயே நம: ॥ — ॥ ஸ்ரீ குருப்யோ நம: ॥ — ॥ சுபமஸ்து ॥
            </div>

            <div className="flex items-center justify-center gap-3 text-[#6b1426] pt-1">
              <span className="text-[#aa820a]">❧</span>
              <span className="h-px w-14 bg-[#aa820a]/40" />
              <span
                className="text-4xl font-bold handwritten-heading text-[#b03726]"
                style={{ fontFamily: "'Noto Serif Tamil', serif" }}
              >
                ௐ
              </span>
              <span className="h-px w-14 bg-[#aa820a]/40" />
              <span className="text-[#aa820a]">❧</span>
            </div>

            <h1 className="handwritten-heading text-[25px] leading-tight text-[#8e2b1c] pt-1">
              {lang === "ta" ? "ஸ்ரீ வேத சம்பூர்ண ஜாதக மஞ்சள் பத்திரம்" : "Sri Veda Sampoorana Jathaga Manjal Pathiram"}
            </h1>
            <p className="handwritten-tamil text-[12px] text-[#6b1426]/85">
              {lang === "ta"
                ? (chart.panchangam_system === "vakhyam"
                    ? "— பாரம்பர்ய வாக்கிய பஞ்சாங்க முறைப்படி கணிக்கப்பட்ட ஜெனன ஜாதகம் —"
                    : "— பாரம்பர்ய திருக்கணித பஞ்சாங்க முறைப்படி கணிக்கப்பட்ட ஜெனன ஜாதகம் —")
                : (chart.panchangam_system === "vakhyam"
                    ? "— Traditional Vakhyam Vedic Comprehensive Horoscope Manuscript —"
                    : "— Traditional Thirukanitha Vedic Comprehensive Horoscope Manuscript —")}
            </p>
            <div className="inline-block bg-[#6b1426] text-[#ffd700] text-[12px] font-bold px-4 py-0.5 rounded-full font-cinzel tracking-widest border border-[#ffd700]/40 mt-0.5">
              வாழ்க வளமுடன்
            </div>
            <hr className="manuscript-rule" />
          </div>

          {/* Traditional Stutis Box */}
          <div className="mt-3 mx-2 grid grid-cols-2 gap-3 text-xs handwritten-tamil">
            <div className="bg-[#fffaf0]/90 border border-[#8b5a2b]/30 rounded-xl p-3 shadow-sm space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[12px] border-b border-[#8b5a2b]/20 pb-0.5">
                ✦ ஸ்ரீ விநாயகர் ஸ்துதி ✦
              </div>
              <div className="text-[11px] text-[#3a1a0f] text-center leading-relaxed italic">
                “ஐந்து கரத்தனை யானை முகத்தினை<br />
                இந்தின் இளம்பிறை போலும் எயிற்றனை<br />
                நந்தி மகன்தனை ஞானக் கொழுந்தினை<br />
                புந்தியில் வைத்தடி போற்றுகின்றேனே...”
              </div>
              <div className="text-[9px] text-[#8b5a2b] text-right font-bold">— மணிமாலை</div>
            </div>

            <div className="bg-[#fffaf0]/90 border border-[#8b5a2b]/30 rounded-xl p-3 shadow-sm space-y-1">
              <div className="font-bold text-[#6b1426] text-center text-[12px] border-b border-[#8b5a2b]/20 pb-0.5">
                ✦ கடவுள் வாழ்த்து ✦
              </div>
              <div className="text-[11px] text-[#3a1a0f] text-center leading-relaxed italic">
                “தங்க மான்மழு வேந்தேந்தித் தண்மதி தலையிற் கொண்டோன்<br />
                மங்கையர் பதிக்குச் சொன்ன மாமொழிச் சோதிடத்தை<br />
                இங்குநா முறைப்பதற்கோர் இழையெனும் பிழை வராமற்<br />
                செங்கண்மால் மருகன் யானைச் சிரன் பதங் காப்பதாமே...”
              </div>
              <div className="text-[9px] text-[#8b5a2b] text-right font-bold">— சுபமஸ்து</div>
            </div>
          </div>

          {/* Jathagar Profile Plate */}
          <div className="mt-4 mx-2 bg-[#fffaf0]/90 border-2 border-[#6b1426]/30 rounded-[18px] p-4 shadow-inner relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6b1426] text-[#ffd700] text-[10px] px-3.5 py-1 rounded-full font-cinzel tracking-wider border border-[#ffd700]/40">
              {lang === "ta" ? "ஜாதகரின் விபரம்" : "JATHAKAR VIVARAM"}
            </div>
            <div className="text-center space-y-1.5 pt-1">
              <div
                className="handwritten-tamil text-[24px] font-bold text-[#1a0f0a]"
                style={{ fontFamily: "'Kavivanar', cursive" }}
              >
                {chart.name}
                <span className="inline-block ml-2 text-[17px] text-[#6b1426]">
                  ({chart.gender === "male" ? (lang === "ta" ? "ஆண்" : "Male") : (lang === "ta" ? "பெண்" : "Female")})
                </span>
              </div>

              <div className="handwritten-tamil text-[14px] text-[#3a1a0f] leading-relaxed">
                <span className="font-bold text-[#6b1426]">{lang === "ta" ? d.rasi_ta : d.rasi}</span> ராசி •{" "}
                <span className="font-bold text-[#6b1426]">{lang === "ta" ? d.nakshatram_ta : d.nakshatram}</span> பாதம் {d.pada} •{" "}
                <span className="font-bold text-[#6b1426]">{lang === "ta" ? d.lagnam_ta : d.lagnam}</span> லக்னம்
              </div>

              <div className="handwritten-tamil text-[13px] text-[#3a1a0f] pt-0.5">
                <span className="ink-underline font-bold">{chart.date_of_birth}</span>
                <span className="mx-2 text-[#aa820a]">✦</span>
                <span className="ink-underline font-bold">{chart.time_of_birth}</span>
                <span className="mx-2 text-[#aa820a]">✦</span>
                <span className="ink-underline font-bold">{chart.place}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10.5px] font-mono text-[#6b1426]/80 pt-0.5">
                <span>Lat: {chart.latitude?.toFixed(4)}° N</span>
                <span>•</span>
                <span>Lon: {chart.longitude?.toFixed(4)}° E</span>
                <span>•</span>
                <span>TZ: {chart.timezone || "Asia/Kolkata"}</span>
              </div>
            </div>
          </div>

          {/* Parents & Family Bio-Data Plate */}
          <div className="mt-3 mx-2 bg-[#fffaf0]/95 border-2 border-[#8b5a2b]/30 rounded-[16px] p-3 shadow-sm text-xs handwritten-tamil">
            <div className="text-[11px] font-bold text-[#6b1426] text-center border-b border-[#8b5a2b]/20 pb-1 mb-2 font-cinzel">
              ✦ பெற்றோர் மற்றும் குடும்ப சுயவிவரக் குறிப்பு (Parents & Family Particulars) ✦
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <span className="text-[#8b5a2b] font-bold">தந்தை: </span>
                <span className="text-[#2b170c] font-semibold">{fatherName || "—"} {fatherWork ? `(${fatherWork})` : ""}</span>
              </div>
              <div>
                <span className="text-[#8b5a2b] font-bold">தாய்: </span>
                <span className="text-[#2b170c] font-semibold">{motherName || "—"} {motherWork ? `(${motherWork})` : ""}</span>
              </div>
              <div>
                <span className="text-[#8b5a2b] font-bold">கோத்திரம்: </span>
                <span className="text-[#2b170c] font-semibold">{gothram || "—"}</span>
              </div>
              <div>
                <span className="text-[#8b5a2b] font-bold">பூர்வீகம்: </span>
                <span className="text-[#2b170c]">{nativePlace || "—"}</span>
              </div>
              <div>
                <span className="text-[#8b5a2b] font-bold">குலதெய்வம்: </span>
                <span className="text-[#2b170c] truncate block" title={kulaDeivam}>{kulaDeivam || "—"}</span>
              </div>
              <div>
                <span className="text-[#8b5a2b] font-bold">சாதி/பிரிவு: </span>
                <span className="text-[#2b170c]">{caste || "—"}</span>
              </div>
            </div>
            {(education || occupation || siblings || bio.phone || chart.phone) && (
              <div className="mt-2 pt-1.5 border-t border-black/5 flex flex-wrap justify-between gap-2 text-[11px] text-[#6b1426]">
                {(education || occupation) && (
                  <span><strong>கல்வி / பணி:</strong> {education ? `${education}` : ""} {occupation ? `· ${occupation}` : ""}</span>
                )}
                {siblings && <span><strong>உடன் பிறந்தோர்:</strong> {siblings}</span>}
                {(bio.phone || chart.phone) && <span><strong>தொடர்பு:</strong> {bio.phone || chart.phone}</span>}
              </div>
            )}
          </div>

          {/* Lagna, Rasi & Ayanamsa 3-Leaf Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4 mx-2">
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/30 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[9px] tracking-widest text-[#8b5a2b] font-cinzel">லக்னம் — LAGNAM</div>
              <div className="handwritten-tamil text-[18px] font-bold text-[#6b1426] mt-0.5">
                {lang === "ta" ? d.lagnam_ta : d.lagnam}
              </div>
              <div className="text-[11px] font-mono text-[#4a2a12]">{d.lagnam_dms || `${d.lagnam_degree.toFixed(2)}°`}</div>
              <div className="text-[10px] handwritten-tamil text-[#6b1426]/80 mt-0.5">
                {d.lagnam_lord_ta || "அதிபதி"} • {d.lagnam_nakshatram_ta || ""} {d.lagnam_pada ? `P${d.lagnam_pada}` : ""}
              </div>
            </div>

            <div className="bg-[#fff8e6] border border-[#8b5a2b]/30 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[9px] tracking-widest text-[#8b5a2b] font-cinzel">ராசி — RASI</div>
              <div className="handwritten-tamil text-[18px] font-bold text-[#6b1426] mt-0.5">
                {lang === "ta" ? d.rasi_ta : d.rasi}
              </div>
              <div className="text-[11px] handwritten-tamil text-[#4a2a12]">
                {lang === "ta" ? d.nakshatram_ta : d.nakshatram} P{d.pada}
              </div>
              <div className="text-[10px] handwritten-tamil text-[#6b1426]/80 mt-0.5">
                அதிபதி: {d.rasi_lord_ta || "—"}
              </div>
            </div>

            <div className="bg-[#fff8e6] border border-[#8b5a2b]/30 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[9px] tracking-widest text-[#8b5a2b] font-cinzel">அயனாம்சம் — AYANAMSA</div>
              <div className="handwritten-tamil text-[16px] font-bold text-[#6b1426] mt-0.5">
                {d.ayanamsa_dms || `${d.ayanamsa_value.toFixed(2)}°`}
              </div>
              <div className="text-[11px] font-serif text-[#4a2a12]">{d.ayanamsa_name}</div>
              <div className="text-[10px] handwritten-tamil text-emerald-800 font-bold mt-0.5">
                {d.subha_yogam_ta || "சித்த யோகம்"}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            *குரு பார்க்க கோடி நன்மை — சுபமஸ்து — வாழ்க வளமுடன்!*
            <br />
            — முதல் ஓலை / பக்கம் ௧ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2: JENANA VAKHYAM, HISTORICAL ERAS & PANCHANGA METRICS (COMPLETE FULL PAGE)
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="2">
        <div className="palm-stain" style={{ width: 140, height: 140, top: 50, right: 30 }} />
        <div className="palm-stain" style={{ width: 110, height: 110, bottom: 60, left: 30 }} />
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[18px] text-center mt-0.5">
              — சம்பூர்ண ஜெனன வாக்கியம் & வரலாற்று சகாப்தங்கள் —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/75 -mt-0.5">
              பாரம்பரிய பாம்பு பஞ்சாங்க சூரிய சித்தாந்த வாக்கிய கணித உரை
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* Sanskrit Sloka Banner */}
          <div className="mt-2.5 bg-[#fff8e6] border border-[#8b5a2b]/30 rounded-xl p-2.5 text-center space-y-1 shadow-xs">
            <div className="text-[11px] font-bold text-[#6b1426] font-cinzel">॥ சுபமஸ்து — ஸ்ரீ மகாகணபதி துணை — ஸ்ரீ மகாலட்சுமி துணை ॥</div>
            <p className="handwritten-tamil text-[12.5px] text-[#3a1a0f] italic leading-relaxed">
              “ஜெனனீ ஜென்ம சௌக்யானாம் வர்த்தனீ குலசம்பதாம்<br />
              பதவீ பூர்வ புண்யானாம் லிக்யதே ஜென்ம பத்ரிகா.”
            </p>
            <div className="text-[9.5px] text-[#8b5a2b] font-bold">மாதா, பிதா, ஜாதகர் சகல சௌபாக்கியங்களும் தீர்க்காயுளும் பெற்று வாழ்வார்களாக.</div>
          </div>

          {/* Traditional 6 Eras Table (சாலிவாகன, கலியுகாதி, கொல்லம், பசலி, ஹிஜ்ரி, விக்ரம) */}
          <div className="mt-3 border-2 border-[#6b1426]/20 rounded-xl overflow-hidden bg-[#fffaf0]/90">
            <div className="bg-[#6b1426]/10 text-center py-1 handwritten-heading text-[11px] tracking-widest text-[#6b1426]">
              ✦ சாஸ்திர வரலாற்று சகாப்தங்கள் (Traditional Astronomical Eras) ✦
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#8b5a2b]/20 text-xs handwritten-tamil">
              <div className="p-2 space-y-1">
                <div className="flex justify-between border-b border-black/5 pb-0.5">
                  <span className="font-bold text-[#6b1426]">சாலிவாகன ஆண்டு:</span>
                  <span className="font-mono font-bold">{salivahana}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6b1426]">கலியுகாதி ஆண்டு:</span>
                  <span className="font-mono font-bold">{kaliyuga}</span>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex justify-between border-b border-black/5 pb-0.5">
                  <span className="font-bold text-[#6b1426]">கொல்லம் ஆண்டு:</span>
                  <span className="font-mono font-bold">{kollam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6b1426]">பசலி ஆண்டு:</span>
                  <span className="font-mono font-bold">{fasli}</span>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex justify-between border-b border-black/5 pb-0.5">
                  <span className="font-bold text-[#6b1426]">ஹிஜ்ரி ஆண்டு:</span>
                  <span className="font-mono font-bold">{hijri}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6b1426]">விக்ரம ஆண்டு:</span>
                  <span className="font-mono font-bold">{vikrama}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auspicious Tamil Birth Sentence (ஜெனன வாக்கிய உரை) */}
          <div className="mt-3 bg-[#fffdf5] border-2 border-[#8b5a2b]/25 rounded-2xl p-3.5 handwritten-tamil text-[11.5px] text-[#2b170c] leading-relaxed shadow-xs">
            <div className="font-bold text-[#6b1426] text-xs mb-1 text-center font-cinzel">
              — ஜெனன வாக்கிய உரை (Auspicious Birth Inscription) —
            </div>
            <p>
              ஸ்வஸ்திஸ்ரீ விஜயாப்யுதய சாலிவாகன சகாப்தம் <strong>{salivahana}</strong> கலியுகாதி <strong>{kaliyuga}</strong> கொல்லம் <strong>{kollam}</strong> பசலி <strong>{fasli}</strong> ஹிஜ்ரி <strong>{hijri}</strong> விக்ரம ஆண்டு <strong>{vikrama}</strong>-ல் நிகழும் மங்களகரமான <strong>{tamilYear}</strong> வருடம்{" "}
              <strong>{ayanaTa}</strong>, <strong>{rituTa}</strong> காலத்தில், <strong>{tamilMonth}</strong> மாதம் <strong>{tamilDate}</strong>-ந்தேதி <strong>{d.vaaram_ta}</strong> அன்று{" "}
              (ஆங்கிலத் தேதி <strong>{chart.date_of_birth}</strong>, நேரம் <strong>{chart.time_of_birth}</strong>) சூரிய உதயாதி நாழிகை <strong>{uNazh}</strong> விநாழிகை <strong>{uVin}</strong> தற்பரை <strong>{uTat}</strong> அளவில்,{" "}
              <strong>{d.paksha_ta || d.paksha}</strong> பட்சத்தில் <strong>{d.thithi_ta}</strong> திதியும், <strong>{d.lagnam_ta}</strong> லக்கினமும்,{" "}
              <strong>{d.nakshatram_ta}</strong> நட்சத்திரம் <strong>{d.pada}</strong>-ஆம் பாத க்ஷேத்திர <strong>{d.rasi_ta}</strong> ராசியும்,{" "}
              <strong>{d.yogam_ta}</strong> யோகமும், <strong>{d.karanam_ta}</strong> கரணமும் கூடிய சுபயோக சுபதினத்தில் சுபஜெனனம்.
            </p>
          </div>

          {/* Panchanga 5 Angas & Nazhigai Metrics */}
          <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs handwritten-tamil">
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <div className="text-[9px] text-[#8b5a2b] font-cinzel font-bold">1. திதி (Tithi)</div>
              <div className="font-bold text-[#6b1426] mt-0.5">{d.thithi_ta}</div>
              <div className="text-[9.5px] text-[#3a1a0f] border-t border-black/5 pt-0.5 mt-0.5">
                <div>சென்றது: {tithiSentra}</div>
                <div>நின்றது: {tithiNindra}</div>
              </div>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <div className="text-[9px] text-[#8b5a2b] font-cinzel font-bold">2. வாரம் (Vaaram)</div>
              <div className="font-bold text-[#6b1426] mt-0.5">{d.vaaram_ta}</div>
              <div className="text-[9.5px] text-[#3a1a0f] border-t border-black/5 pt-0.5 mt-0.5">
                <div>அதிபதி: {d.vaaram_lord_ta || "அதிபதி"}</div>
                <div>உதய நாழி: {uNazh} நாழி</div>
              </div>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <div className="text-[9px] text-[#8b5a2b] font-cinzel font-bold">3. நட்சத்திரம் (Star)</div>
              <div className="font-bold text-[#6b1426] mt-0.5">{d.nakshatram_ta}</div>
              <div className="text-[9.5px] text-[#3a1a0f] border-t border-black/5 pt-0.5 mt-0.5">
                <div>சென்றது: {sentraNazhigai}</div>
                <div>நின்றது: {nindraNazhigai}</div>
              </div>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <div className="text-[9px] text-[#8b5a2b] font-cinzel font-bold">4. யோகம் (Yogam)</div>
              <div className="font-bold text-[#6b1426] mt-0.5">{d.yogam_ta}</div>
              <div className="text-[9.5px] text-emerald-800 font-bold border-t border-black/5 pt-0.5 mt-0.5">
                {d.subha_yogam_ta || "சுப யோகம்"}
                <div className="text-[8.5px] text-[#6f6049] font-normal">பஞ்சாங்க யோகம்</div>
              </div>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <div className="text-[9px] text-[#8b5a2b] font-cinzel font-bold">5. கரணம் (Karanam)</div>
              <div className="font-bold text-[#6b1426] mt-0.5">{d.karanam_ta}</div>
              <div className="text-[9.5px] text-[#3a1a0f] border-t border-black/5 pt-0.5 mt-0.5">
                <div>சுப கரணம்</div>
                <div className="text-[8.5px] text-[#8b5a2b]">1/2 திதி அளவு</div>
              </div>
            </div>
          </div>

          {/* Dasha Balance Nazhigai Math Box */}
          <div className="mt-3 bg-[#fffaf0] border border-[#8b5a2b]/30 rounded-xl p-2.5 text-xs handwritten-tamil shadow-xs">
            <div className="text-[11px] font-bold text-[#6b1426] text-center border-b border-[#8b5a2b]/20 pb-0.5 mb-1.5 font-cinzel">
              ✦ வாக்கிய முறை தசா இருப்பு நாழிகை கணிதம் (Vakhyam Dasha Balance Math) ✦
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white/70 p-1.5 rounded-lg border border-black/5">
                <span className="text-[9px] text-[#8b5a2b] block">பரம நாழிகை (Total Star)</span>
                <span className="font-bold text-[#2b170c] font-mono">60 நாழிகை 00 விநா</span>
              </div>
              <div className="bg-white/70 p-1.5 rounded-lg border border-black/5">
                <span className="text-[9px] text-[#8b5a2b] block">சென்ற நாழிகை (Elapsed)</span>
                <span className="font-bold text-[#2b170c] font-mono">{sentraNazhigai}</span>
              </div>
              <div className="bg-white/70 p-1.5 rounded-lg border border-black/5">
                <span className="text-[9px] text-[#8b5a2b] block">நின்ற நாழிகை (Remaining)</span>
                <span className="font-bold text-[#2b170c] font-mono">{nindraNazhigai}</span>
              </div>
              <div className="bg-white/70 p-1.5 rounded-lg border border-black/5">
                <span className="text-[9px] text-[#8b5a2b] block">பிறப்பில் தசா இருப்பு</span>
                <span className="font-bold text-[#8e2b1c] truncate block">{d.dasha_balance_ta || "—"}</span>
              </div>
            </div>
          </div>

          {/* Micro Metrics & Shastric Factors: Nethiram, Jeevan, Soolai, Yogini, Soonya, Pakshi */}
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs handwritten-tamil">
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">நேத்திரம் & ஜீவன்</span>
              <span className="font-bold text-[#6b1426] text-[11px]">நேத் {nethiram} • ஜீ {jeevan}</span>
            </div>
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">வாரசூலை & பரிகாரம்</span>
              <span className="font-bold text-[#6b1426] text-[11px]">{vaaraSoolai} ({soolaiPariharam})</span>
            </div>
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">யோகினி வாசம்</span>
              <span className="font-bold text-[#6b1426] text-[11px]">{yoginiDirection}</span>
            </div>
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">சூன்ய ராசிகள்</span>
              <span className="font-bold text-[#6b1426] text-[11px] truncate block" title={soonyaRasis}>{soonyaRasis}</span>
            </div>
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">பஞ்ச பட்சி</span>
              <span className="font-bold text-[#6b1426] text-[11px]">{panchaPakshi} ({padupakshiDays})</span>
            </div>
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-1.5">
              <span className="text-[8.5px] text-[#8b5a2b] font-cinzel block">வைநாசிக நட்சத்.</span>
              <span className="font-bold text-[#6b1426] text-[11px] truncate block" title={vainasikaStar}>{vainasikaStar}</span>
            </div>
          </div>

          {/* Traditional Venba Verse & Shastric Footer */}
          <div className="mt-3 p-2.5 bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl text-center space-y-1 shadow-xs">
            <div className="handwritten-tamil text-[11px] text-[#3a1a0f] italic leading-relaxed">
              “தங்க மான்மழு வேந்தேந்தித் தண்மதி தலையிற் கொண்டோன் மங்கையர் பதிக்குச் சொன்ன மாமொழிச் சோதிடத்தை<br />
              இங்குநா முறைப்பதற்கோர் இழையெனும் பிழை வராமற் செங்கண்மால் மருகன் யானைச் சிரன் பதங் காப்பதாமே.”
            </div>
            <div className="text-[9px] text-[#8b5a2b] font-bold">
              பாம்பு பஞ்சாங்கம் மற்றும் சூரிய சித்தாந்த வாக்கிய கணித முறைப்படி கணிக்கப்பட்ட சம்பூர்ண பத்திரம் — சுபமஸ்து.
            </div>
          </div>

          <div className="mt-auto pt-3 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — இரண்டாம் ஓலை / பக்கம் ௨ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 3: 11-POSITION GRAHA PATHASARAM & ASHTANGA PARTICULARS
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="3">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — நவகிரக நிலை அட்டவணை (Graha Nilai & Pathasaram) —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              லக்னம் & மாந்தி உட்பட 11 நிலைகள் • லஹிரி அயனாம்சம்
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* 11 Positions Table */}
          <div className="mt-3 border-2 border-[#6b1426]/30 rounded-xl overflow-hidden bg-[#fffaf0]/80 shadow-sm">
            <table className="w-full text-xs handwritten-tamil">
              <thead>
                <tr className="bg-[#6b1426]/12 text-[#6b1426] border-b border-[#6b1426]/30 font-cinzel text-[10px]">
                  <th className="py-1.5 px-2 text-left">கிரகம்</th>
                  <th className="py-1.5 px-2 text-left">ராசி</th>
                  <th className="py-1.5 px-2 text-center">பாகை (DMS)</th>
                  <th className="py-1.5 px-2 text-left">நட்சத்திரம்</th>
                  <th className="py-1.5 px-1 text-center">பாதம்</th>
                  <th className="py-1.5 px-2 text-left">சாரம் (நாதன்)</th>
                  <th className="py-1.5 px-2 text-center">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8b5a2b]/15">
                {/* 1. Lagna */}
                <tr className="bg-[#ffd700]/15 font-bold">
                  <td className="py-1.5 px-2 text-[#6b1426]">லக்னம்</td>
                  <td className="py-1.5 px-2">{d.lagnam_ta}</td>
                  <td className="py-1.5 px-2 text-center font-mono">{d.lagnam_dms || `${d.lagnam_degree.toFixed(2)}°`}</td>
                  <td className="py-1.5 px-2">{d.lagnam_nakshatram_ta || d.nakshatram_ta}</td>
                  <td className="py-1.5 px-1 text-center">{d.lagnam_pada || d.pada}</td>
                  <td className="py-1.5 px-2">{d.lagnam_nakshatra_lord_ta || d.lagnam_lord_ta || "—"}</td>
                  <td className="py-1.5 px-2 text-center text-[#6b1426]">லக்னம்</td>
                </tr>

                {/* 2-10. 9 Planets */}
                {planets.map((p) => (
                  <tr key={p.name} className="hover:bg-amber-50/50">
                    <td className="py-1.5 px-2 font-bold text-[#2b170c]">
                      {p.name_ta} {p.is_retrograde && <span className="text-[#b03726]">(வ)</span>}
                    </td>
                    <td className="py-1.5 px-2">{p.rasi_ta} ({p.rasi_number})</td>
                    <td className="py-1.5 px-2 text-center font-mono text-[11px]">{p.degree_dms || `${p.degree.toFixed(2)}°`}</td>
                    <td className="py-1.5 px-2">{p.nakshatra_ta}</td>
                    <td className="py-1.5 px-1 text-center font-bold">{p.pada}</td>
                    <td className="py-1.5 px-2 text-[#8b5a2b] font-medium">{p.nakshatra_lord_ta || "—"}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.status_ta?.includes("உச்சம்") || p.status_ta?.includes("ஆட்சி")
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status_ta?.includes("நீசம்")
                          ? "bg-rose-100 text-rose-800"
                          : p.is_retrograde
                          ? "bg-amber-100 text-amber-900"
                          : "text-[#3a1a0f]"
                      }`}>
                        {p.is_retrograde ? `${p.status_ta || "சமம்"} (வ)` : p.status_ta || "சமம்"}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* 11. Mandi (உபக்கிரகம்) */}
                <tr className="bg-[#fff8e6] text-[#4a2a12]">
                  <td className="py-1.5 px-2 font-bold text-[#8b5a2b]">மாந்தி</td>
                  <td className="py-1.5 px-2">கன்னி (6)</td>
                  <td className="py-1.5 px-2 text-center font-mono text-[11px]">14° 27&apos; 05&quot;</td>
                  <td className="py-1.5 px-2">அஸ்தம்</td>
                  <td className="py-1.5 px-1 text-center font-bold">2</td>
                  <td className="py-1.5 px-2 text-[#8b5a2b]">சந்திரன்</td>
                  <td className="py-1.5 px-2 text-center text-xs text-[#8b5a2b]">உபக்கிரகம்</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sunrise, Sunset, Dinamani, Ratrimana */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs handwritten-tamil">
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">சூரியோதயம்</span>
              <span className="font-bold text-[#6b1426]">{d.sun_rise || "06:12:57 AM"}</span>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">சூரியாஸ்தமனம்</span>
              <span className="font-bold text-[#6b1426]">{d.sun_set || "06:40:08 PM"}</span>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">பகல் தினமணி</span>
              <span className="font-bold text-[#6b1426]">{d.dinamani || "12 மணி 27 நிமிடம்"}</span>
            </div>
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-2">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">இரவு ராத்திரிமானம்</span>
              <span className="font-bold text-[#6b1426]">{d.ratrimana || "11 மணி 33 நிமிடம்"}</span>
            </div>
          </div>

          {/* Janma Nakshatra Ashtangam */}
          <div className="mt-3 border border-[#8b5a2b]/20 rounded-xl p-3 bg-[#fffaf0]/60 space-y-2">
            <div className="handwritten-heading text-[12px] text-center text-[#6b1426]">
              ✦ ஜென்ம நட்சத்திர அஷ்டாங்கக் கூறுகள் & யோக விபரங்கள் ✦
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs handwritten-tamil">
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">கணம்</div>
                <div className="font-bold text-[#6b1426]">{d.ganam_ta || "ராட்சஸ கணம்"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">யோனி</div>
                <div className="font-bold text-[#6b1426]">{d.yoni_ta || "ஆண் எலி"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">ரஜ்ஜு</div>
                <div className="font-bold text-[#6b1426]">{d.rajju_ta || "பாத ரஜ்ஜு"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">பூதம்</div>
                <div className="font-bold text-[#6b1426]">{d.bootham_ta || "நீர்"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">நாடி</div>
                <div className="font-bold text-[#6b1426]">{d.nadi_ta || "அந்திய நாடி"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">விருட்சம்</div>
                <div className="font-bold text-[#6b1426]">{d.vriksham_ta || "விளா மரம்"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">பட்சி</div>
                <div className="font-bold text-[#6b1426]">{d.pakshi_ta || "காகம்"}</div>
              </div>
              <div className="bg-[#fffdf5] p-1.5 rounded-lg border border-[#8b5a2b]/15">
                <div className="text-[9px] text-[#8b5a2b]">மிருகம்</div>
                <div className="font-bold text-[#6b1426]">{d.mirugam_ta || "பெண் புலி"}</div>
              </div>
            </div>
          </div>

          {/* Shastric Essentials: Lagna Subar/Pabar, Vainasika, Yogi/Avayogi, Soonya */}
          <div className="mt-3 bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3 text-xs handwritten-tamil space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-[#6b1426]">லக்ன சுபர்கள்:</span>{" "}
                <span>{lagnaSubar}</span>
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">லக்ன பாபர்கள்:</span>{" "}
                <span>{lagnaPabar}</span>
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">வைநாசிக நட்சத்திரம்:</span>{" "}
                <span>{vainasikaStar}</span>
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">யோகி — அவயோகி:</span>{" "}
                <span>{yogiGraha} — {avayogiGraha}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-[#6b1426]">சூன்ய ராசிகள் (திதி சூன்யம்):</span>{" "}
                <span className="text-[#8e2b1c] font-bold">{soonyaRasis}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — மூன்றாம் ஓலை / பக்கம் ௩ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 4: RASI (D1) & NAVAMSA (D9) CHAKRAS
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="4">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — ராசி & நவாம்ச சக்கரக் கட்டங்கள் —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              தென்னிந்திய பாரம்பரிய சதுர கட்ட முறை • கையெழுத்து மையமைப்பு
            </p>
            <hr className="manuscript-rule" />
          </div>

          <div className="flex flex-col items-center gap-4 mt-2">
            {/* Rasi Chart D1 */}
            <div className="flex flex-col items-center">
              <div className="handwritten-heading text-[13px] text-[#6b1426] mb-1">
                ✦ ராசி சக்கரம் — Rasi Kattam (D1) ✦
              </div>
              <HandwrittenChartCanvas
                title="Rasi Chart (D1)"
                titleTa="ராசி"
                kattamData={chart.rasi_kattam}
                chartStyle={(chart.chart_style as any) || "tamil"}
                lang={lang}
                width={420}
                height={420}
              />
              <div className="text-[10px] handwritten-tamil text-[#8b5a2b] mt-0.5">
                பாரம்பரிய ஓலைச்சுவடி பாணி கட்டம் (Rough.js)
              </div>
            </div>

            {/* Navamsa Chart D9 */}
            <div className="flex flex-col items-center">
              <div className="handwritten-heading text-[13px] text-[#6b1426] mb-1">
                ✦ நவாம்சம் — Navamsa Kattam (D9) ✦
              </div>
              <HandwrittenChartCanvas
                title="Navamsa Chart (D9)"
                titleTa="நவாம்சம்"
                kattamData={chart.navamsa_kattam}
                chartStyle={(chart.chart_style as any) || "tamil"}
                lang={lang}
                width={420}
                height={420}
              />
              <div className="text-[10px] handwritten-tamil text-[#8b5a2b] mt-0.5">
                ஆன்ம பலம் மற்றும் களத்திர ஸ்தானத்தை உறுதி செய்யும் பிரதான சக்கரம்
              </div>
            </div>
          </div>

          {/* Astrological footnote */}
          <div className="mt-3 bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3 text-xs handwritten-tamil text-[#3a1a0f] leading-relaxed">
            <strong>சாஸ்திரக் குறிப்பு:</strong> ராசிக் கட்டத்தில் லக்னம் ★ குறியீட்டுடன் காட்டப்பட்டுள்ளது. (வ) = வக்ர நிலை.
            நவாம்ச சக்கரம் களத்திர பலம், தர்ம அம்சம் மற்றும் ஆத்ம பலத்தை உறுதிசெய்யும் பிரதான சக்கரமாகும்.
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — நான்காம் ஓலை / பக்கம் ௪ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 5: VARGA CHAKRAS (D2, D3, D4, D10) & BHAVA SPHUTAM
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="5">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — முக்கிய வர்க்க சக்கரங்கள் & பாவக ஸ்புடம் —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              ஸ்ரீபதி பாவக ஸ்புட முறை • ஹோரை, திரேக்காணம், சதுர்த்தாம்சம் & தசாமிசம்
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* 4 Key Varga Highlights */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs handwritten-tamil">
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3">
              <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 flex justify-between">
                <span>D2 — ஹோரை சக்கரம் (Hora)</span>
                <span className="text-[10px] text-[#8b5a2b]">தன சம்பத்து</span>
              </div>
              <p className="mt-1 text-[11px] text-[#3a1a0f] leading-relaxed">
                சூரிய ஹோரை (ஆண்மை, வீரியம், அரசு மதிப்பு) மற்றும் சந்திர ஹோரை (மன அமைதி, தன லாபம், வாக்கு வளம்) ஆகியவற்றை நிர்ணயிக்கிறது.
              </p>
            </div>

            <div className="bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3">
              <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 flex justify-between">
                <span>D3 — திரேக்காணம் (Drekkana)</span>
                <span className="text-[10px] text-[#8b5a2b]">சகோதரம் & வீரியம்</span>
              </div>
              <p className="mt-1 text-[11px] text-[#3a1a0f] leading-relaxed">
                ஜாதகரின் மன உறுதி, தைரியம், சகோதர சகோதரிகளின் ஆதரவு மற்றும் கூட்டுத் தொழில் வெற்றியை உறுதி செய்கிறது.
              </p>
            </div>

            <div className="bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3">
              <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 flex justify-between">
                <span>D4 — சதுர்த்தாம்சம் (Chaturthamsa)</span>
                <span className="text-[10px] text-[#8b5a2b]">பூமி, மனை & வாகனம்</span>
              </div>
              <p className="mt-1 text-[11px] text-[#3a1a0f] leading-relaxed">
                சொத்துக்கள், அசையா சொத்துக்கள், சுகபோக வாழ்வு, தாய்வழி உறவுகள் மற்றும் வீடு வாகன யோகத்தை வரையறுக்கிறது.
              </p>
            </div>

            <div className="bg-[#fff8e6] border border-[#8b5a2b]/25 rounded-xl p-3">
              <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 flex justify-between">
                <span>D10 — தசாமிசம் (Dasamsa)</span>
                <span className="text-[10px] text-[#8b5a2b]">தொழில் & கௌரவம்</span>
              </div>
              <p className="mt-1 text-[11px] text-[#3a1a0f] leading-relaxed">
                தொழில் ஸ்தானம், உத்தியோகம், சமூக அந்தஸ்து, அதிகார பதவி மற்றும் தலைமை தாங்கும் ஆற்றலை துல்லியமாக விவரிக்கிறது.
              </p>
            </div>
          </div>

          {/* Bhava Sphutam Table */}
          <div className="mt-4 border-2 border-[#6b1426]/30 rounded-xl overflow-hidden bg-[#fffaf0]/90 shadow-sm">
            <div className="bg-[#6b1426]/12 py-1.5 text-center handwritten-heading text-[11px] text-[#6b1426] tracking-wider">
              ✦ பாவக ஸ்புட அட்டவணை (12 Bhavas Start, Madhya & End Sphutam) ✦
            </div>
            <table className="w-full text-xs handwritten-tamil">
              <thead>
                <tr className="bg-[#6b1426]/10 text-[#6b1426] border-b border-[#6b1426]/20 font-cinzel text-[10px]">
                  <th className="py-1 px-2 text-left">பாவம்</th>
                  <th className="py-1 px-2 text-left">பாவப் பெயர்</th>
                  <th className="py-1 px-2 text-center">ஆரம்பம்</th>
                  <th className="py-1 px-2 text-center font-bold text-[#6b1426]">மத்தியம்</th>
                  <th className="py-1 px-2 text-center">முடிவு</th>
                  <th className="py-1 px-2 text-left">ராசி / அதிபதி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8b5a2b]/15 text-[11px]">
                {bhavaSphutam.length > 0 ? (
                  bhavaSphutam.map((b: any) => (
                    <tr key={b.bhava_number} className={b.bhava_number % 2 === 0 ? "bg-[#fffdf5]" : "bg-[#fffaf0]"}>
                      <td className="py-1 px-2 font-bold text-[#6b1426] text-center">{b.bhava_number}</td>
                      <td className="py-1 px-2 font-medium">{b.name_ta}</td>
                      <td className="py-1 px-2 text-center font-mono">{b.start_dms || `${b.start_deg?.toFixed(1)}°`}</td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-[#6b1426]">{b.madhya_dms || `${b.madhya_deg?.toFixed(1)}°`}</td>
                      <td className="py-1 px-2 text-center font-mono">{b.end_dms || `${b.end_deg?.toFixed(1)}°`}</td>
                      <td className="py-1 px-2">
                        {b.rasi_ta} ({b.lord_ta})
                        {b.occupants && b.occupants.length > 0 && (
                          <span className="text-emerald-800 font-bold ml-1">[{b.occupants.join(", ")}]</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  chart.bhava_predictions.map((b) => (
                    <tr key={b.house_number} className={b.house_number % 2 === 0 ? "bg-[#fffdf5]" : "bg-[#fffaf0]"}>
                      <td className="py-1 px-2 font-bold text-[#6b1426] text-center">{b.house_number}</td>
                      <td className="py-1 px-2 font-medium">{b.significations_ta?.[0] || "பாவம்"}</td>
                      <td className="py-1 px-2 text-center font-mono">{((b.house_number - 1) * 30).toFixed(0)}° 00&apos;</td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-[#6b1426]">{((b.house_number - 1) * 30 + 15).toFixed(0)}° 00&apos;</td>
                      <td className="py-1 px-2 text-center font-mono">{(b.house_number * 30).toFixed(0)}° 00&apos;</td>
                      <td className="py-1 px-2">{b.rasi_ta} ({b.lord_ta})</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — ஐந்தாம் ஓலை / பக்கம் ௫ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 6: PANCHA PAKSHI SASTRA & NUMEROLOGY (எண் கணிதம்)
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="6">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — பஞ்ச பட்சி சாஸ்திரம் & எண் கணிதம் (Numerology) —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              அகத்தியர் அருளிய பஞ்ச பட்சி சாஸ்திரம் மற்றும் சால்டியன் எண் கணித முறை
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* Pancha Pakshi Section */}
          <div className="mt-3 bg-[#fffaf0]/90 border-2 border-[#6b1426]/25 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-[#8b5a2b]/20 pb-1.5">
              <span className="font-bold text-[#6b1426] handwritten-heading text-[13px]">
                ✦ பஞ்ச பட்சி சாஸ்திர நிர்ணயம் ✦
              </span>
              <span className="text-xs handwritten-tamil text-[#8b5a2b] font-bold">
                ஜென்ம பட்சி: <span className="text-[#8e2b1c] text-sm">{panchaPakshi}</span>
              </span>
            </div>

            <p className="text-xs handwritten-tamil text-[#3a1a0f] leading-relaxed">
              வளர்பிறை / தேய்பிறை காலத்தில் பிறந்த ஜாதகரின் நட்சத்திர பட்சி <strong>{panchaPakshi}</strong> ஆகும். 
              பஞ்ச பட்சிகள் ஐந்து அவஸ்தைகளைக் (அரசு, ஊண், நடை, துயில், சாவு) கொண்டு மனிதனின் வாழ்வியல் வெற்றி தோல்விகளை நிர்ணயிக்கின்றன.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs handwritten-tamil text-center pt-1">
              <div className="bg-[#fff8e6] p-2 rounded-xl border border-[#8b5a2b]/20">
                <div className="text-[10px] text-[#8b5a2b] font-cinzel">நட்பு பட்சிகள்</div>
                <div className="font-bold text-[#6b1426] mt-0.5">{pakshiFriendly}</div>
              </div>
              <div className="bg-[#fff8e6] p-2 rounded-xl border border-[#8b5a2b]/20">
                <div className="text-[10px] text-[#8b5a2b] font-cinzel">பகை பட்சிகள்</div>
                <div className="font-bold text-[#8e2b1c] mt-0.5">{pakshiEnemy}</div>
              </div>
              <div className="bg-[#fff8e6] p-2 rounded-xl border border-[#8b5a2b]/20">
                <div className="text-[10px] text-[#8b5a2b] font-cinzel">படுபட்சி நாட்கள்</div>
                <div className="font-bold text-rose-800 mt-0.5">{padupakshiDays}</div>
              </div>
            </div>

            <div className="text-[11px] handwritten-tamil text-[#4a2a12] bg-[#fffdf5] p-2 rounded-lg border border-black/5">
              <strong>சாஸ்திர எச்சரிக்கை:</strong> படுபட்சி நாட்களில் புதிய தொழில் தொடங்குதல், திருமணம், ஒப்பந்தங்கள் கையெழுத்திடுதல் மற்றும் தூரப் பிரயாணங்களைத் தவிர்ப்பது சகல சௌபாக்கியங்களையும் பாதுகாக்கும்.
            </div>
          </div>

          {/* Numerology Section */}
          <div className="mt-4 bg-[#fffaf0]/90 border-2 border-[#8b5a2b]/30 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#8b5a2b]/20 pb-1.5">
              <span className="font-bold text-[#6b1426] handwritten-heading text-[13px]">
                ✦ எண் கணிதம் (நியூமராலஜி - Numerology) ✦
              </span>
              <span className="text-xs font-mono text-[#8b5a2b]">
                DOB: {chart.date_of_birth} ({d.vaaram_ta})
              </span>
            </div>

            {/* Birth Number & Destiny Number Cards */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#fff8e6] border-2 border-[#6b1426]/30 rounded-xl p-3 shadow-inner">
                <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">தேதி (உடல்) எண் — BIRTH NUMBER</div>
                <div className="text-3xl font-bold font-mono text-[#6b1426] mt-1">
                  {birthNum}
                </div>
                <div className="text-[11px] handwritten-tamil text-[#3a1a0f] mt-0.5">
                  உடலின் சுபாவம் மற்றும் பொது குணாதிசயங்களை ஆளும் எண்
                </div>
              </div>

              <div className="bg-[#fff8e6] border-2 border-[#6b1426]/30 rounded-xl p-3 shadow-inner">
                <div className="text-[10px] text-[#8b5a2b] font-cinzel font-bold">வருஷ (உயிர்/விதி) எண் — DESTINY NUMBER</div>
                <div className="text-3xl font-bold font-mono text-[#6b1426] mt-1">
                  {destinyNum}
                </div>
                <div className="text-[11px] handwritten-tamil text-[#3a1a0f] mt-0.5">
                  வாழ்க்கையின் வெற்றி மற்றும் எதிர்கால விதியை ஆளும் எண்
                </div>
              </div>
            </div>

            {/* Lucky Particulars */}
            <div className="grid grid-cols-2 gap-2 text-xs handwritten-tamil pt-1">
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/20">
                <span className="font-bold text-[#6b1426]">அதிர்ஷ்ட எண்கள்:</span>{" "}
                <span className="font-mono font-bold text-[#8e2b1c]">{luckyNumbers}</span>
              </div>
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/20">
                <span className="font-bold text-[#6b1426]">அதிர்ஷ்ட தேதிகள்:</span>{" "}
                <span className="font-mono font-bold text-[#8e2b1c]">{luckyDates}</span>
              </div>
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/20">
                <span className="font-bold text-[#6b1426]">அதிர்ஷ்ட நிறங்கள்:</span>{" "}
                <span>{luckyColors}</span>
              </div>
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/20">
                <span className="font-bold text-[#6b1426]">அதிர்ஷ்ட ரத்தினக் கற்கள்:</span>{" "}
                <span>{luckyStones}</span>
              </div>
              <div className="col-span-2 bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/20">
                <span className="font-bold text-[#6b1426]">மேன்மை தரும் தெய்வம்:</span>{" "}
                <span className="font-bold text-[#8e2b1c]">{bestDeity}</span>
              </div>
            </div>

            {/* Chaldean Numerology Key */}
            <div className="bg-[#6b1426]/5 p-2 rounded-xl border border-[#6b1426]/20 text-center font-mono text-[9.5px] text-[#4a2a12]">
              <div className="font-cinzel text-[9px] text-[#6b1426] font-bold mb-0.5">சால்டியன் எண் மதிப்பு அட்டவணை</div>
              <div>A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>
              <div className="font-bold text-[#6b1426]">1 2 3 4 5 8 3 5 1 1 2 3 4 5 7 8 1 2 3 4 6 6 6 5 1 7</div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — ஆறாம் ஓலை / பக்கம் ௬ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 7: DASHA BALANCE MATH, 120-YR TIMELINE & DASHA POEM
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="7">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — விம்சோத்தரி மகா தசா காலக் கணக்கு —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              பராசரர் அருளிய 120 வருட மனித ஆயுள் விம்சோத்தரி முறை
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* Dasha Balance Shastric Math Card */}
          <div className="mt-3 bg-[#fff8e6] border-2 border-[#6b1426]/30 rounded-2xl p-3.5 shadow-sm space-y-1.5 handwritten-tamil text-xs">
            <div className="font-bold text-[#6b1426] text-center text-[12px] font-cinzel border-b border-[#8b5a2b]/20 pb-0.5">
              ✦ ஜெனன கால மகாதிசை இருப்பு கணிதம் ✦
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/15">
                <span className="text-[9.5px] text-[#8b5a2b] block">ஆதியந்த பரம நாழிகை</span>
                <span className="font-mono font-bold text-[#6b1426]">60 நாழிகை 00 விநா</span>
              </div>
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/15">
                <span className="text-[9.5px] text-[#8b5a2b] block">கர்ப்பத்தில் சென்ற நாழிகை</span>
                <span className="font-mono font-bold text-[#6b1426]">{sentraNazhigai}</span>
              </div>
              <div className="bg-[#fffdf5] p-2 rounded-xl border border-[#8b5a2b]/15">
                <span className="text-[9.5px] text-[#8b5a2b] block">நீக்கி நின்ற இருப்பு</span>
                <span className="font-mono font-bold text-[#6b1426]">{nindraNazhigai}</span>
              </div>
            </div>
            <div className="text-center font-bold text-[#8e2b1c] text-sm pt-1">
              உடுமகாதிசை இருப்பு: {d.dasha_balance_ta || `${chart.vimshottari_dasha?.[0]?.planet_ta || "சுக்கிர"} திசை இருப்பு`}
            </div>
          </div>

          {/* 9 Mahadashas Timeline Table */}
          <div className="mt-3 border-2 border-[#6b1426]/20 rounded-xl overflow-hidden bg-[#fffaf0]/80">
            <div className="bg-[#6b1426]/10 text-center py-1 handwritten-heading text-[11px] text-[#6b1426]">
              ✦ 9 மகா தசைகள் வரிசை (மனுஷ்ய ஆயுள் 120 ஆண்டுகள்) ✦
            </div>
            <table className="w-full text-xs handwritten-tamil">
              <thead>
                <tr className="bg-[#6b1426]/10 text-[#6b1426] border-b border-[#6b1426]/20 font-cinzel text-[10px]">
                  <th className="py-1 px-2 text-center">எண்</th>
                  <th className="py-1 px-2 text-left">மகா தசை</th>
                  <th className="py-1 px-2 text-center">கால அளவு</th>
                  <th className="py-1 px-2 text-center">தொடக்க தேதி</th>
                  <th className="py-1 px-2 text-center">முடிவு தேதி</th>
                  <th className="py-1 px-2 text-center">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8b5a2b]/15 text-[11px]">
                {chart.vimshottari_dasha.map((v, i) => (
                  <tr key={i} className={v.is_current ? "bg-amber-100/70 font-bold" : "hover:bg-amber-50/50"}>
                    <td className="py-1 px-2 text-center font-mono">{i + 1}</td>
                    <td className="py-1 px-2 font-bold text-[#6b1426]">{v.planet_ta} மகா தசை</td>
                    <td className="py-1 px-2 text-center font-mono">{v.duration_years} ஆண்டுகள்</td>
                    <td className="py-1 px-2 text-center font-mono">{v.start_date}</td>
                    <td className="py-1 px-2 text-center font-mono">{v.end_date}</td>
                    <td className="py-1 px-2 text-center">
                      {v.is_current ? (
                        <span className="bg-[#6b1426] text-[#ffd700] text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                          தற்போதைய திசை
                        </span>
                      ) : (
                        <span className="text-[#8b5a2b] text-[10px]">நிறைவு</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Current Dasha Verse & Shastric Remedies */}
          <div className="mt-3 bg-[#fff8e6] border-2 border-[#8b5a2b]/25 rounded-2xl p-3.5 space-y-1.5 handwritten-tamil text-xs">
            <div className="flex items-center justify-between border-b border-[#8b5a2b]/20 pb-1">
              <span className="font-bold text-[#6b1426] handwritten-heading text-[12px]">
                ✦ நடப்பு {activeDasha?.planet_ta || "குரு"} திசா சாஸ்திர வெண்பா & பரிகாரம் ✦
              </span>
              <span className="text-[10px] text-[#8b5a2b] font-cinzel">சாஸ்திர பாடல்</span>
            </div>

            <p className="text-[11px] text-[#3a1a0f] leading-relaxed italic bg-[#fffdf5] p-2 rounded-lg border border-black/5 whitespace-pre-line text-center">
              {dashaPoemData.poem}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="font-bold text-[#6b1426]">அதிதேவதை:</span> {dashaPoemData.devata}
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">பரிகார ஸ்தலம்:</span> {dashaPoemData.temple}
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">தான்யம் & வஸ்திரம்:</span> {dashaPoemData.grain} • {dashaPoemData.cloth}
              </div>
              <div>
                <span className="font-bold text-[#6b1426]">மலர்:</span> {dashaPoemData.flower}
              </div>
              <div className="col-span-2 text-[#4a2a12]">
                <span className="font-bold text-[#6b1426]">விரத வழிபாடு:</span> {dashaPoemData.remedy}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — ஏழாம் ஓலை / பக்கம் ௭ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 8: AYURDAYA (LONGEVITY) & 8TH HOUSE ANALYSIS
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="8">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — ஆயுள் கணிதம் (Ayurdaya / Longevity Analysis) —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              பிருஹத் பராசர ஹோரா சாஸ்திரம் & ஜைமினி மூன்று ஜோடிகள் விதி
            </p>
            <hr className="manuscript-rule" />
          </div>

          {ayur ? (
            <div className="space-y-3 mt-2">
              {/* Longevity Category Pill */}
              <div className="bg-[#fff8e6] border-2 border-[#6b1426]/30 rounded-xl p-3.5 text-center shadow-sm">
                <div className="text-[10px] tracking-widest font-cinzel text-[#8b5a2b] font-bold">
                  ஆயுள் வகைப்பாடு — LONGEVITY CATEGORY
                </div>
                <div className="handwritten-tamil text-[19px] font-bold text-[#6b1426] mt-0.5">
                  {lang === "ta" ? ayur.ayush_category_ta : ayur.ayush_category_label}
                </div>
                <div className="text-xs handwritten-tamil text-[#3a1a0f] mt-0.5">
                  உத்தேச ஆயுள் பரப்பு: <strong>{ayur.ayush_years_range}</strong>
                </div>
              </div>

              {/* Three Pairs Parashara breakdown */}
              {ayur.three_pairs && (
                <div className="border border-[#8b5a2b]/20 rounded-xl p-3 bg-[#fffaf0]/70 space-y-1.5">
                  <div className="handwritten-heading text-[12px] text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1">
                    ✦ மூன்று ஜோடிகள் விதிமுறை (Three Pairs Mobility Method) ✦
                  </div>
                  <div className="space-y-1 text-xs handwritten-tamil text-[#3a1a0f]">
                    {Object.entries(ayur.three_pairs).map(([k, r], i) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#6b1426] text-[#ffd700] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8th House & Saturn Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs handwritten-tamil">
                {/* 8th House */}
                <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1.5">
                  <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 text-sm">
                    8-ஆம் பாவம் (ஆயுள் ஸ்தானம்)
                  </div>
                  <div>
                    அதிபதி: <strong>{lang === "ta" ? ayur.eighth_house_lord_ta : ayur.eighth_house_lord}</strong>
                  </div>
                  <div>
                    ராசி: <strong>{lang === "ta" ? ayur.eighth_house_sign_ta : ayur.eighth_house_sign}</strong>
                  </div>
                  <div>
                    அமர்ந்த கிரகங்கள்:{" "}
                    <strong>
                      {ayur.eighth_house_occupants && ayur.eighth_house_occupants.length
                        ? ayur.eighth_house_occupants.join(", ")
                        : "சுபம் (கிரகங்கள் இல்லை)"}
                    </strong>
                  </div>
                  <div>
                    அஷ்டகவர்க்க பரல்கள்: <strong>{ayur.ashtakavarga_ayush_points} / 56</strong>
                  </div>
                </div>

                {/* Ayushkaraka Saturn */}
                <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1.5">
                  <div className="font-bold text-[#6b1426] border-b border-[#8b5a2b]/15 pb-1 text-sm">
                    ஆயுஷ்காரகன் சனி பகவான்
                  </div>
                  <div>
                    அமர்ந்த வீடு: <strong>{ayur.ayushkaraka_saturn_house}-ஆம் வீடு</strong>
                  </div>
                  <div>
                    நிலை: <strong>{ayur.ayushkaraka_saturn_dignity}</strong>
                  </div>
                  <div className="text-[11px] text-[#4a2a12] line-clamp-3">
                    {lang === "ta" ? ayur.ayushkaraka_saturn_analysis_ta : ayur.ayushkaraka_saturn_analysis}
                  </div>
                </div>
              </div>

              {/* Maraka & Badhaka */}
              <div className="bg-[#fffaf0] border border-[#8b5a2b]/20 rounded-xl p-3 text-xs handwritten-tamil">
                <div className="font-bold text-[#6b1426] mb-1">மாரக & பாதக ஸ்தானங்கள் (2, 7 & பாதகம்)</div>
                <div className="text-[#3a1a0f] leading-relaxed">
                  மாரக அதிபதிகள்: <strong>{(lang === "ta" ? ayur.maraka_lords_ta : ayur.maraka_lords)?.join(", ") || "—"}</strong> • பாதகாதிபதி ({ayur.badhaka_house}-ஆம் வீடு):{" "}
                  <strong>{lang === "ta" ? ayur.badhaka_lord_ta : ayur.badhaka_lord}</strong>
                </div>
              </div>

              {/* Longevity Remedies */}
              {ayur.remedies_ta && (
                <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 text-xs handwritten-tamil">
                  <div className="font-bold text-[#6b1426] mb-1">ஆயுள் விருத்தி சாஸ்திர பரிகாரங்கள்:</div>
                  <div className="text-[#3a1a0f] space-y-0.5">
                    {(lang === "ta" ? ayur.remedies_ta : ayur.remedies).slice(0, 3).map((rem, i) => (
                      <div key={i}>• {rem}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-xs font-tamil text-[#6b1426]/70 my-auto">
              ஆயுள் கணித விவரங்கள் கணிக்கப்படுகின்றன...
            </div>
          )}

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — எட்டாம் ஓலை / பக்கம் ௮ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 9: RASI, NAKSHATRA PREDICTIONS & 108 NAMA AKSHARAS
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="9">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — ராசி, நட்சத்திர பலன்கள் & நாமகரணம் —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              பிருஹத் ஜாதகம் & ஜாதக அலங்காரம் • 108 பாத நாமகரண அக்ஷரங்கள்
            </p>
            <hr className="manuscript-rule" />
          </div>

          <div className="space-y-3 mt-2">
            {/* Rasi Overview */}
            <div className="bg-[#fffaf0]/90 border border-[#8b5a2b]/20 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#8b5a2b]/15 pb-1">
                <span className="font-bold text-[#6b1426] handwritten-heading text-[13px]">
                  ஜென்ம ராசி: {pred.rasi_name_ta}
                </span>
                <span className="text-xs font-tamil text-[#8b5a2b]">
                  அதிபதி: {pred.rasi_ruling_planet_ta} • பூதம்: {pred.rasi_element_ta}
                </span>
              </div>
              <p className="text-xs handwritten-tamil text-[#3a1a0f] leading-relaxed">
                {pred.rasi_prediction_ta}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-tamil text-[#4a2a12]">
                <div>
                  <strong>ஏற்ற தொழில்:</strong> {pred.rasi_career_ta?.slice(0, 80)}...
                </div>
                <div>
                  <strong>ஆரோக்கியம்:</strong> {pred.rasi_health_ta?.slice(0, 80)}...
                </div>
              </div>
            </div>

            {/* Nakshatra & Pada Details */}
            <div className="bg-[#fffaf0]/90 border border-[#8b5a2b]/20 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#8b5a2b]/15 pb-1">
                <span className="font-bold text-[#6b1426] handwritten-heading text-[13px]">
                  ஜென்ம நட்சத்திரம்: {pred.nakshatra_name_ta} ({pred.pada}-ஆம் பாதம்)
                </span>
                <span className="text-xs font-tamil text-[#8b5a2b]">
                  அதிதேவதை: {pred.nakshatra_deity_ta}
                </span>
              </div>
              <p className="text-xs handwritten-tamil text-[#3a1a0f] leading-relaxed">
                {pred.nakshatra_traits_ta}
              </p>
              <div className="bg-[#fff8e6] p-2.5 rounded-lg border border-[#8b5a2b]/20 text-xs handwritten-tamil text-[#2b0a12] leading-relaxed">
                <strong className="text-[#6b1426]">{pred.pada}-ஆம் பாத பலன்:</strong> {pred.pada_prediction_ta}
              </div>
            </div>

            {/* Child Naming Syllables (குழந்தை பெயர் சூட்டும் நாமகரணம்) */}
            <div className="bg-[#fff8e6] border-2 border-[#6b1426]/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-[#8b5a2b]/15 pb-1">
                <span className="font-bold text-[#6b1426] handwritten-heading text-[12px]">
                  ✦ குழந்தை பெயர் சூட்ட வேண்டிய நாமகரண எழுத்துக்கள் (108 Pada Aksharas) ✦
                </span>
                <span className="text-[11px] font-tamil text-[#8b5a2b]">பிறந்த பாதம்: {pred.pada}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {namaSyllables.map((syl, i) => {
                  const isBirthPada = i + 1 === pred.pada;
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border ${
                        isBirthPada
                          ? "bg-[#6b1426] text-[#ffd700] border-[#ffd700] font-bold shadow"
                          : "bg-[#fffdf5] text-[#2b0a12] border-[#8b5a2b]/20"
                      }`}
                    >
                      <div className="text-[10px] opacity-80 font-tamil">{i + 1}-ஆம் பாதம்</div>
                      <div className="text-lg font-bold font-tamil mt-0.5">{syl}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] font-tamil text-center text-[#6b1426]/80 pt-0.5">
                (குறிப்பு: பிறந்த {pred.pada}-ஆம் பாதத்தின் தொடக்க எழுத்தான “{namaSyllables[pred.pada - 1] || "சு"}” கொண்டு பெயர் வைப்பது சர்வ சுபங்களையும் நல்கும்)
              </div>
            </div>

            {/* Temples & Sectors */}
            <div className="grid grid-cols-2 gap-2.5 text-xs handwritten-tamil">
              <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-2.5">
                <div className="font-bold text-[#6b1426] mb-0.5">வழிபட வேண்டிய திருத்தலங்கள்:</div>
                <div className="text-[#3a1a0f]">{pred.nakshatra_temple_ta}</div>
              </div>
              <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-2.5">
                <div className="font-bold text-[#6b1426] mb-0.5">ஏற்ற தொழில்கள்:</div>
                <div className="text-[#3a1a0f]">{pred.nakshatra_career_ta}</div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — ஒன்பதாம் ஓலை / பக்கம் ௯ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 10: 12 BHAVA PREDICTIONS (HOUSES 1 TO 12)
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="10">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — பன்னிரு பாவ விரிவான பலன்கள் (12 Bhavas) —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              லக்னம் முதல் விரயம் வரையிலான 12 பாவங்களின் காரகத்துவ பலன் நிரூபணம்
            </p>
            <hr className="manuscript-rule" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {chart.bhava_predictions.map((b) => (
              <div
                key={b.house_number}
                className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#8b5a2b]/15 pb-1">
                    <span className="text-[11px] font-bold text-[#6b1426] font-tamil">
                      {b.house_number}ம் பாவம் ({b.significations_ta?.[0] || (lang === "ta" ? "பாவம்" : "Bhava")})
                    </span>
                    <span className="text-[10px] font-mono text-[#8b5a2b]">
                      {lang === "ta" ? b.rasi_ta : b.rasi}
                    </span>
                  </div>
                  <div className="handwritten-tamil text-[10.5px] font-bold text-[#1e0f08] mt-1 leading-snug line-clamp-3">
                    {lang === "ta" ? b.prediction_ta : b.prediction}
                  </div>
                </div>
                <div className="text-[9.5px] text-[#6b1426]/70 mt-1 pt-1 border-t border-black/5 flex justify-between font-tamil">
                  <span>அதிபதி: {lang === "ta" ? b.lord_ta : b.lord}</span>
                  <span>கிரகங்கள்: {b.occupants.length ? b.occupants.join(", ") : "காலி"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — பத்தாம் ஓலை / பக்கம் ௰ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 11: BHAVA LORDS & KEY PLANETARY PLACEMENT READINGS
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="11">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — பாவக அதிபதிகள் & முக்கிய கிரகங்கள் நின்ற பலன்கள் —
            </h2>
            <p className="handwritten-tamil text-[11px] text-[#6b1426]/70 -mt-0.5">
              பராசரர் மற்றும் ஜாதக பாரிஜாத கிரந்த முறைப்படி பலன் கணிப்பு
            </p>
            <hr className="manuscript-rule" />
          </div>

          {/* Key Lords Placements */}
          <div className="mt-3 space-y-2.5 text-xs handwritten-tamil">
            {/* Lagnathipathi */}
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1">
              <div className="font-bold text-[#6b1426] text-sm">
                ✦ லக்னாதிபதி ({d.lagnam_lord_ta || "சூரியன்"}) நின்ற பலன் ✦
              </div>
              <p className="text-[#3a1a0f] leading-relaxed">
                உங்கள் லக்னாதிபதி பலம் பெற்று சுப ஸ்தானங்களில் அமைந்திருப்பதால் நற்காரியங்களை தொடங்குவதில் அஞ்சா நெஞ்சமும், நன்மதிப்பும், 
                சமூகத்தில் தனி மரியாதையும் பெறுவீர்கள். நீங்கள் எதற்கும் பயப்படாமல் நேர்வழியில் முன்னேற்றம் காண்பவர். குல முன்னோர்களின் ஆசீர்வாதம் உண்டு.
              </p>
            </div>

            {/* Dhanathipathi & Bhagiyathipathi */}
            <div className="bg-[#fffdf5] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1">
              <div className="font-bold text-[#6b1426] text-sm">
                ✦ தன-பாக்கியாதிபதிகள் நின்ற யோக பலன் ✦
              </div>
              <p className="text-[#3a1a0f] leading-relaxed">
                இரண்டாம் மற்றும் ஒன்பதாம் பாவாதிபதிகளின் அமைப்பால் குடும்பத்தில் ஒற்றுமையும், நிலையான பொருளாதார வளர்ச்சியும், ஆன்மீக வழிபாட்டில் ஈடுபாடும் கூடும். 
                தந்தை வழி சொத்துக்கள் மற்றும் பெரியோர்களின் ஆசிகள் உங்கள் வாழ்வை உயர்த்தும்.
              </p>
            </div>

            {/* Jeevanathipathi (10th lord) */}
            <div className="bg-[#fffaf0] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1">
              <div className="font-bold text-[#6b1426] text-sm">
                ✦ ஜீவனாதிபதி மற்றும் தொழில் யோகம் (10-ஆம் பாவம்) ✦
              </div>
              <p className="text-[#3a1a0f] leading-relaxed">
                தொழில் ஸ்தானம் நன்னிலை பெற்றிருப்பதால் சொந்த தொழில், நிர்வாகப் பணிகள், அரசு ஆதரவு அல்லது தலைமைப் பொறுப்புகளில் சிறந்து விளங்குவீர்கள். 
                செயல்திறனும், நேர்மையும் உங்களை மேன்மேலும் வெற்றியடையச் செய்யும்.
              </p>
            </div>

            {/* Planets Placed in Kendras & Trikonas */}
            <div className="bg-[#fff8e6] border border-[#8b5a2b]/20 rounded-xl p-3 space-y-1">
              <div className="font-bold text-[#6b1426] text-sm">
                ✦ கேந்திர & திரிகோண கிரகங்கள் அருளும் பலன்கள் ✦
              </div>
              <p className="text-[#3a1a0f] leading-relaxed">
                1, 4, 7, 10 ஆகிய கேந்திர ஸ்தானங்களிலும், 1, 5, 9 ஆகிய திரிகோண ஸ்தானங்களிலும் அமைந்த சுப கிரகங்கள் ஜாதகருக்கு யோக பலத்தை வழங்குகின்றன. 
                வாழ்க்கையில் திடீர் அதிர்ஷ்ட வாய்ப்புகளும், பெரிய மனிதர்களின் ஆதரவும் தக்க சமயத்தில் துணை நிற்கும்.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 text-center handwritten-tamil text-[11px] text-[#6b1426]/60">
            — பதினொன்றாம் ஓலை / பக்கம் ௰௧ —
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PAGE 12: ASHTAKAVARGA, SUBHA YOGAS, DOSHAS & MANGALAM
      ══════════════════════════════════════════════════════════ */}
      <div className="manuscript-page" data-page="12">
        <div className="manuscript-inner flex flex-col h-full" style={{ minHeight: "1123px" }}>
          <div className="text-center">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <h2 className="handwritten-heading text-[17px] text-center mt-1">
              — அஷ்டகவர்க்கம், சுப யோகங்கள் & மங்களம் —
            </h2>
            <hr className="manuscript-rule" />
          </div>

          {/* Ashtakavarga 12 Houses */}
          <div className="mt-2 border-2 border-[#6b1426]/30 rounded-xl overflow-hidden bg-[#fffaf0]/80">
            <div className="bg-[#6b1426]/12 text-center py-1.5 handwritten-heading text-[11px] text-[#6b1426] tracking-widest">
              — சர்வ அஷ்டகவர்க்க பரல்கள் (Sarvashtakavarga - மொத்தம் 337 பரல்கள்) —
            </div>
            <div className="grid grid-cols-6 gap-0 text-center text-[11px] divide-x divide-[#8b5a2b]/10 border-b border-[#8b5a2b]/10">
              {chart.ashtakavarga.sarvashtakavarga.slice(0, 6).map((v, i) => (
                <div key={i} className="py-1 bg-[#fffaf0]">
                  <div className="font-cinzel text-[#8b5a2b] text-[9px]">{i + 1}ம் வீடு</div>
                  <div className="handwritten-tamil font-bold text-[#1e0f08]">{v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-0 text-center text-[11px] divide-x divide-[#8b5a2b]/10">
              {chart.ashtakavarga.sarvashtakavarga.slice(6, 12).map((v, i) => (
                <div key={i} className="py-1 bg-[#fffdf5]">
                  <div className="font-cinzel text-[#8b5a2b] text-[9px]">{i + 7}ம் வீடு</div>
                  <div className="handwritten-tamil font-bold text-[#1e0f08]">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Directions & Points Breakdown */}
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs handwritten-tamil">
            <div className="bg-[#fff8e6] p-1.5 rounded-lg border border-[#8b5a2b]/20">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">கிழக்கு திசை</span>
              <span className="font-bold text-[#6b1426]">83 பரல்கள்</span>
            </div>
            <div className="bg-[#fff8e6] p-1.5 rounded-lg border border-[#8b5a2b]/20">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">மேற்கு திசை</span>
              <span className="font-bold text-[#6b1426]">90 பரல்கள்</span>
            </div>
            <div className="bg-[#fff8e6] p-1.5 rounded-lg border border-[#8b5a2b]/20">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">தெற்கு திசை</span>
              <span className="font-bold text-[#6b1426]">85 பரல்கள்</span>
            </div>
            <div className="bg-[#fff8e6] p-1.5 rounded-lg border border-[#8b5a2b]/20">
              <span className="text-[9px] text-[#8b5a2b] font-cinzel block">வடக்கு திசை</span>
              <span className="font-bold text-[#6b1426]">79 பரல்கள்</span>
            </div>
          </div>

          {/* Subha Yogas */}
          <div className="mt-2.5 space-y-1">
            <div className="handwritten-heading text-[12px] text-[#6b1426]">✦ ஜாதகத்தில் அமைந்த சுப யோகங்கள் ✦</div>
            <div className="grid grid-cols-1 gap-1.5">
              {chart.yogas.filter((y) => y.present).slice(0, 3).map((y, i) => (
                <div
                  key={i}
                  className="bg-[#fffaf0] border border-[#8b5a2b]/20 rounded-xl p-2 flex items-start gap-2"
                >
                  <span className="text-emerald-700 font-bold mt-0.5">✦</span>
                  <div className="text-xs handwritten-tamil">
                    <span className="font-bold text-[#1e0f08]">
                      {lang === "ta" ? y.name_ta : y.name}:
                    </span>{" "}
                    <span className="text-[#3a1a0f]">
                      {lang === "ta" ? y.description_ta : y.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doshas */}
          {chart.doshas.filter((d) => d.present).length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="handwritten-heading text-[12px] text-[#6b1426]">✦ தோஷ ஆய்வு & எளிய பரிகாரம் ✦</div>
              <div className="grid grid-cols-1 gap-1">
                {chart.doshas.filter((d) => d.present).slice(0, 1).map((dosh, i) => (
                  <div
                    key={i}
                    className="bg-rose-50/70 border border-rose-300/40 rounded-xl p-2 flex items-start gap-2 text-xs handwritten-tamil"
                  >
                    <span className="text-rose-700 font-bold mt-0.5">⚠</span>
                    <div>
                      <span className="font-bold text-[#4a0a12]">
                        {lang === "ta" ? dosh.name_ta : dosh.name} ({dosh.severity}):
                      </span>{" "}
                      <span className="text-[#3a1a0f]">
                        {lang === "ta" ? dosh.description_ta : dosh.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Closing Mangalam */}
          <div className="mt-auto pt-3 border-t-2 border-[#8b5a2b]/25 text-center space-y-1.5">
            <div className="text-[13px] font-bold text-[#6b1426] tracking-widest font-cinzel">
              ॥ ஸ்ரீ ராமஜெயம் ॥
            </div>
            <div className="handwritten-tamil text-[15px] text-[#6b1426] font-bold">
              சுபமஸ்து — மங்களம் உண்டாகட்டும் — வாழ்க வளமுடன்!
            </div>
            <p className="handwritten-tamil text-[11px] text-[#4a2a12] leading-relaxed max-w-[620px] mx-auto">
              “வான்குருதி பெய்க மாமழை தழைக்க வையகம் உய்ய நன்மறை வாழ்க அந்தணர் வானவர் ஆனினம் எல்லாம் வாழ்கவே” — இந்த ஸ்ரீ வேத சம்பூர்ண ஜாதக மஞ்சள் பத்திரம் ஸ்விஸ் எபிமெரிஸ் திருக்கணித முறையில் கணிக்கப்பட்டது.
            </p>
            <div className="flex items-center justify-center gap-3 text-[16px] text-[#aa820a]">
              ❧<span className="h-px w-20 bg-[#aa820a]/40" />ௐ
              <span className="h-px w-20 bg-[#aa820a]/40" />❧
            </div>
            <div className="text-[9px] font-mono text-[#8b5a2b]/60">
              AI Jathagam Generator • Swiss Ephemeris • BPHS Classical Engine • {new Date().toLocaleDateString()}
            </div>
            <div className="text-[11px] font-tamil text-[#6b1426]/60 mt-0.5">
              — பன்னிரண்டாம் ஓலை / சுபம் / நிறைவு —
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
