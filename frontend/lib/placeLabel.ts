import { hasTamil, tamilPlaceLabel } from "@/lib/tamilTransliterate";
import { placeKey } from "@/lib/placeNamesTa";

const STATE_TA: Record<string, string> = {
  "tamil nadu": "தமிழ்நாடு", kerala: "கேரளா", karnataka: "கர்நாடகா", "andhra pradesh": "ஆந்திரப் பிரதேசம்",
  telangana: "தெலுங்கானா", puducherry: "புதுச்சேரி", pondicherry: "புதுச்சேரி", maharashtra: "மகாராஷ்டிரா", delhi: "டெல்லி",
  "west bengal": "மேற்கு வங்காளம்", gujarat: "குஜராத்", rajasthan: "ராஜஸ்தான்", "uttar pradesh": "உத்தரப் பிரதேசம்",
  "madhya pradesh": "மத்தியப் பிரதேசம்", bihar: "பீகார்", odisha: "ஒடிசா", punjab: "பஞ்சாப்", haryana: "ஹரியானா",
  goa: "கோவா", assam: "அசாம்", jharkhand: "ஜார்க்கண்ட்", chhattisgarh: "சத்தீஸ்கர்", uttarakhand: "உத்தராகண்ட்",
  "himachal pradesh": "இமாச்சலப் பிரதேசம்", "jammu and kashmir": "ஜம்மு காஷ்மீர்",
};
const COUNTRY_TA: Record<string, string> = {
  india: "இந்தியா", "sri lanka": "இலங்கை", singapore: "சிங்கப்பூர்", malaysia: "மலேசியா", "united states": "அமெரிக்கா",
  usa: "அமெரிக்கா", "united states of america": "அமெரிக்கா", "united kingdom": "இங்கிலாந்து", uk: "இங்கிலாந்து",
  canada: "கனடா", australia: "ஆஸ்திரேலியா", "new zealand": "நியூசிலாந்து",
  "united arab emirates": "ஐக்கிய அரபு அமீரகம்", uae: "ஐக்கிய அரபு அமீரகம்", qatar: "கத்தார்", oman: "ஓமன்",
  kuwait: "குவைத்", bahrain: "பஹ்ரைன்", "saudi arabia": "சவூதி அரேபியா", germany: "ஜெர்மனி", france: "பிரான்ஸ்",
  switzerland: "சுவிட்சர்லாந்து", norway: "நார்வே", netherlands: "நெதர்லாந்து", ireland: "அயர்லாந்து", italy: "இத்தாலி",
  sweden: "சுவீடன்", denmark: "டென்மார்க்", "south africa": "தென்னாப்பிரிக்கா", mauritius: "மொரிசியஸ்",
  japan: "ஜப்பான்", myanmar: "மியான்மர்", thailand: "தாய்லாந்து",
};

/* ------------------------------------------------------------------------
 * The Tamil name the place picker SHOWED, remembered for the reports / PDFs.
 *
 * The picker keeps the English display name as the real value (geocoding and
 * every calculation use it), and shows a curated Tamil name such as பாலக்காடு.
 * The reports used to transliterate the English name again, letter by letter,
 * so the PDF could print a different word ("பாலகட்டு") from the one on screen.
 * The picker now records the Tamil it showed, and placeForLang() prints that.
 * Kept in localStorage so a reload or another feature page prints it too.
 * ---------------------------------------------------------------------- */
const STORE_KEY = "jat-place-ta";
let memo: Record<string, string> | null = null;

function store(): Record<string, string> {
  if (memo) return memo;
  memo = {};
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORE_KEY) : null;
    if (raw) memo = JSON.parse(raw) || {};
  } catch {
    memo = {};
  }
  return memo!;
}

/** "கோயம்புத்தூர் (கோவை), Tamil Nadu" → "கோயம்புத்தூர்"; "" when there is no Tamil. */
export function taTownOf(label: string | undefined | null): string {
  const first = String(label ?? "").split(",")[0].replace(/\s*\([^)]*\)\s*/g, " ").trim();
  return hasTamil(first) ? first : "";
}

/** Called by the place picker with the English value and the Tamil label it displayed. */
export function rememberPlaceTa(english: string, taLabel: string | undefined | null): void {
  const town = taTownOf(taLabel);
  if (!english || !town) return;
  const m = store();
  const town0 = String(english).split(",")[0];
  if (m[english] === town && m[placeKey(town0)] === town) return;
  m[english] = town;
  m[placeKey(town0)] = town;
  try {
    // keep the list small: newest 200 entries
    const entries = Object.entries(m);
    const kept = entries.length > 200 ? Object.fromEntries(entries.slice(-200)) : m;
    memo = kept;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(kept));
  } catch {
    /* private window / storage blocked: the in-memory copy still works this visit */
  }
}

/** Tamil town name for an English place value, as the picker showed it ("" if unknown). */
export function rememberedPlaceTa(english: string): string {
  const m = store();
  return m[english] || m[placeKey(String(english).split(",")[0])] || "";
}

/** Place as it should appear in a Tamil report: "Udumalaipettai, Tiruppur, Tamil Nadu, 642100, India"
 *  → "உடுமலைப்பேட்டை, தமிழ்நாடு, இந்தியா". English pages keep the place unchanged.
 *  Town priority: the Tamil the place picker showed → the standard spelling
 *  (lib/placeNamesTa.ts) → transliteration. */
export function placeForLang(place: string | undefined | null, lang: "ta" | "en"): string {
  const s = String(place ?? "").trim();
  if (lang !== "ta" || !s || hasTamil(s)) return s;
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  const town = rememberedPlaceTa(s) || taTownOf(tamilPlaceLabel(parts[0] ?? s)) || tamilPlaceLabel(parts[0] ?? s);
  const state = parts.slice(1).map((x) => STATE_TA[x.toLowerCase()]).find(Boolean);
  const country = parts.length > 1 ? COUNTRY_TA[parts[parts.length - 1].toLowerCase()] : undefined;
  return [town, state, country].filter(Boolean).join(", ");
}
