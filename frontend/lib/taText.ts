// frontend/lib/taText.ts
//
// Tamil wording for values the engines give in English (same rules as the
// backend's services/pdf/ta_text.py). Numbers are never changed — only the
// words around them: "06:13:01 AM" -> "காலை 06:13:01", "10:34 N" -> "10:34 வடக்கு".
import { hasLatin, hasTamil, toTamil } from "@/lib/tamilTransliterate";
import { curatedPlaceTa } from "@/lib/placeNamesTa";

function dayPart(h24: number): string {
  if (h24 >= 4 && h24 < 6) return "அதிகாலை";
  if (h24 >= 6 && h24 < 12) return "காலை";
  if (h24 >= 12 && h24 < 16) return "மதியம்";
  if (h24 >= 16 && h24 < 19) return "மாலை";
  return "இரவு";
}

/** "12:32:00 AM" -> "இரவு 12:32:00" (also inside a longer string). */
export function timeTa(text?: string | null): string {
  const s = String(text ?? "");
  return s.replace(/\b(\d{1,2})([:.])(\d{2})(?:\2(\d{2}))?\s*(AM|PM|am|pm)\b/g, (_m, h, sep, mi, se, ap) => {
    const hh = Number(h);
    const h24 = (hh % 12) + (String(ap).toUpperCase() === "PM" ? 12 : 0);
    const clock = `${String(hh % 12 || 12).padStart(2, "0")}${sep}${mi}${se ? sep + se : ""}`;
    return `${dayPart(h24)} ${clock}`;
  });
}

/** "10:34 N" -> "10:34 வடக்கு", "077:15 E" -> "077:15 கிழக்கு". */
export function dmsTa(text?: string | null): string {
  const m: Record<string, string> = { N: "வடக்கு", S: "தெற்கு", E: "கிழக்கு", W: "மேற்கு" };
  return String(text ?? "").replace(/\s([NSEW])\b/g, (_x, d) => " " + m[d]);
}

/** "Asia/Kolkata" -> "இந்திய திட்ட நேரம் (+05:30)". */
export function tzTa(tz?: string | null): string {
  const t = String(tz ?? "");
  if (t === "Asia/Kolkata" || t === "Asia/Calcutta") return "இந்திய திட்ட நேரம் (+05:30)";
  if (/^UTC/i.test(t)) return "கிரீன்விச் நேரம் " + (t.slice(3) || "+00:00");
  return t;
}

export const TIME_CORRECTION_TA = "திட்ட நேரம் (திருத்தம் இல்லை)";

/** "Lahiri (Chitrapaksha)" -> "லஹரி (சித்ரபக்ஷம்)". */
export function ayanamsaTa(text?: string | null): string {
  return String(text ?? "")
    .replace("Lahiri (Chitrapaksha)", "லஹரி (சித்ரபக்ஷம்)")
    .replace("K.P New Comb", "கே.பி புதிய முறை")
    .replace("KP-Old", "கே.பி பழைய முறை")
    .replace(/\bLahiri\b/, "லஹரி");
}

/** A person / place name typed in English, shown in Tamil on Tamil pages. */
export function nameTa(text?: string | null): string {
  const s = String(text ?? "");
  if (!s || hasTamil(s) || !hasLatin(s)) return s;
  return toTamil(s);
}

/** A town typed in English: the standard Tamil spelling when known (Palakkad → பாலக்காடு). */
export function placeTa(text?: string | null): string {
  const s = String(text ?? "");
  if (!s || hasTamil(s) || !hasLatin(s)) return s;
  return s.split(",").map((part) => {
    const t = part.trim();
    return t ? curatedPlaceTa(t) || toTamil(t) : t;
  }).filter(Boolean).join(", ");
}

const PLACE_FIELDS = new Set(["kula_deivam_place", "native_place"]);
const fieldTa = (k: string, v: string) => (PLACE_FIELDS.has(k) ? placeTa(v) : nameTa(v));

// Bio-data fields that are names or places (transliterated on Tamil pages).
// Phone numbers, e-mail, address and free text such as education stay as typed.
const NAME_FIELDS = ["father_name", "mother_name", "parent_name", "gothram", "kula_deivam", "kula_deivam_place",
  "native_place", "caste_subcaste"];

/** Copy of the birth request for a Tamil PDF: parents' names and family names in Tamil. */
export function birthForLang<T extends Record<string, unknown>>(birth: T, lang: "ta" | "en"): T {
  if (lang !== "ta" || !birth) return birth;
  const out: Record<string, unknown> = { ...birth };
  for (const k of NAME_FIELDS) if (typeof out[k] === "string") out[k] = fieldTa(k, out[k] as string);
  const bio = out.bio_data as Record<string, unknown> | undefined;
  if (bio && typeof bio === "object") {
    const b: Record<string, unknown> = { ...bio };
    for (const k of NAME_FIELDS) if (typeof b[k] === "string") b[k] = fieldTa(k, b[k] as string);
    out.bio_data = b;
  }
  return out as T;
}
