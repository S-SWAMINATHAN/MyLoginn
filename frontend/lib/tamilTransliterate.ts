// frontend/lib/tamilTransliterate.ts
//
// Offline, deterministic "Thanglish" (Tamil typed in Latin letters) -> Tamil
// script transliteration, used to SUGGEST Tamil spellings for:
//   - the person's name (BirthDetailsForm), and
//   - place names that have no curated Tamil name (LocationPicker display).
//
// Design notes
// ------------
// * Fully offline. Nothing typed here leaves the browser. (Google Input Tools
//   would give better-ranked results, but it would send people's personal
//   names to a third party — that is a product/privacy decision, not
//   something to switch on silently. See SUMMARY_bug_fixes.md.)
// * English spellings of Tamil names are genuinely ambiguous (d = த or ட,
//   n = ந / ன / ண, e = எ / ஏ, final a = அ or ஆ ...). No single rule is
//   right for every name, so instead of pretending to be exact this returns a
//   small RANKED list of candidates and the user picks one. The first
//   candidate follows the most common Tamil name-writing conventions.
// * Case is ignored for phonetics (normal users type "Ramesh", not the
//   Azhagi/Google "capital = retroflex" convention, and treating the capital R
//   in "Ramesh" as ற would be wrong). The one exception: a short ALL-CAPS token
//   such as "CM" is read as initials, written with each letter's Tamil sound
//   (ச.ம.). A single capital letter is an initial only when written as one
//   ("C." or "C Prasath" → ச.); on its own it is the first sound of a name
//   being typed, so "C" → ச.
// * Letters follow the usual Thanglish keyboard reading: c / ch / s = ச,
//   k / g = க, sh = ஷ, f = ஃப, ng + vowel = ங்க, nj + vowel = ஞ்ச, nk = ங்க,
//   nch = ஞ்ச, a word-final s = ஸ், a final -y = இ, English silent final e
//   dropped. The less common reading (c = க, nn = ன்ன, medial d = த,
//   th = த்த …) is still offered further down the list.
// * This is a suggestion aid only. It never runs on a value unless the user
//   explicitly picks the suggestion.

import { curatedPlaceTa } from "@/lib/placeNamesTa";

const TAMIL_RANGE = /[\u0B80-\u0BFF]/;
export const hasTamil = (s: string): boolean => TAMIL_RANGE.test(s || "");
export const hasLatin = (s: string): boolean => /[A-Za-z]/.test(s || "");

const PULLI = "\u0BCD"; // ்

// Independent vowels
const VOWEL_INDEP: Record<string, string> = {
  a: "அ", aa: "ஆ", i: "இ", ii: "ஈ", u: "உ", uu: "ஊ",
  e: "எ", ee: "ஏ", ai: "ஐ", o: "ஒ", oo: "ஓ", au: "ஔ",
};

// Dependent vowel signs (after a consonant). "a" = inherent (no sign).
const VOWEL_SIGN: Record<string, string> = {
  a: "", aa: "\u0BBE", i: "\u0BBF", ii: "\u0BC0", u: "\u0BC1", uu: "\u0BC2",
  e: "\u0BC6", ee: "\u0BC7", ai: "\u0BC8", o: "\u0BCA", oo: "\u0BCB", au: "\u0BCC",
};

// Latin vowel spellings -> canonical vowel keys, longest first.
// ("ay" is NOT read as ஐ: Vijay → விஜய், Jayanthi → ஜயந்தி.)
const VOWEL_TOKENS: Array<[string, string]> = [
  ["aa", "aa"], ["ai", "ai"], ["au", "au"],
  ["ee", "ii"], ["ii", "ii"], ["ie", "ii"],
  ["oo", "uu"], ["uu", "uu"], ["ou", "uu"],
  ["oa", "oo"],
  ["a", "a"], ["i", "i"], ["u", "u"], ["e", "e"], ["o", "o"],
];

// Latin consonant spellings -> a symbolic consonant key, longest first.
// Keys that are ambiguous (N, T, D, L, R) are resolved per-position below.
const CONS_TOKENS: Array<[string, string]> = [
  ["ksh", "ksh"], ["sri", "SRI"], ["shr", "sh"],
  ["zh", "zh"], ["sh", "sh"], ["ch", "ch"], ["th", "th"], ["dh", "th"],
  ["ng", "ng"], ["nj", "nj"], ["ck", "k"],
  ["kh", "k"], ["gh", "k"], ["ph", "p"], ["bh", "p"], ["jh", "j"],
  ["tt", "TT"], ["dd", "TT"], ["ll", "LL"], ["nn", "NN"], ["rr", "RR"],
  // Thanglish: "c" is ச (c = ச, ch = ச, k = க) — "Celvi" → செல்வி.
  ["k", "k"], ["g", "k"], ["c", "c"], ["q", "k"],
  ["j", "j"], ["z", "j"],
  ["t", "T"], ["d", "D"],
  ["n", "N"], ["m", "m"],
  ["p", "p"], ["b", "p"], ["f", "f"],
  ["y", "y"], ["r", "r"], ["l", "l"], ["v", "v"], ["w", "v"],
  ["s", "s"], ["h", "h"], ["x", "x"],
];

// Unambiguous consonant key -> Tamil base letter.
const CONS_BASE: Record<string, string> = {
  k: "க", ng: "ங", ch: "ச", nj: "ஞ", j: "ஜ", th: "த", p: "ப", m: "ம",
  y: "ய", r: "ர", l: "ல", v: "வ", zh: "ழ", sh: "ஷ", s: "ச", h: "ஹ", f: "ஃப",
};

// Initials are written with the letter's Tamil SOUND, the same reading as the
// rest of the Thanglish rules (c = ச): "C.M." -> ச.ம., "R.K." -> ர.க., "S." -> ச.
// (Not the English letter names சி / எம் / ஆர்.) Keep in sync with
// backend/app/services/pdf/ta_text.py LETTER_TA.
const LETTER_NAMES: Record<string, string> = {
  A: "அ", B: "ப", C: "ச", D: "த", E: "எ", F: "ஃப", G: "க", H: "ஹ",
  I: "இ", J: "ஜ", K: "க", L: "ல", M: "ம", N: "ந", O: "ஒ", P: "ப",
  Q: "க", R: "ர", S: "ச", T: "த", U: "உ", V: "வ", W: "வ",
  X: "க்ஸ", Y: "ய", Z: "ஜ",
};

interface Opts {
  finalALong: boolean;      // word-final "a" -> ஆ (Priya -> பிரியா)
  vowelLen: "auto" | "long" | "short"; // e/o length: auto = short before a consonant cluster, else long
  initialDDental: boolean;  // word-initial d/t -> த (Deepa -> தீபா) vs ட
  splitCluster: boolean;    // Pr/Kr/Tr -> பிர (பிரியா) vs ப்ர
  medialNRetro: boolean;    // intervocalic n -> ண (Ganesh -> கணேஷ்) vs ன (Dinesh -> தினேஷ்)
  closedFinalALong: boolean;// a in a closed final syllable -> ஆ (Kumar -> குமார்) vs அ (Shankar)
  aLongBeforeRCluster: boolean; // "ar"+consonant -> ஆர் (Karthik -> கார்த்திக்)
  llRetro: boolean;         // ll -> ள்ள (Pollachi) vs ல்ல (Nalla)
  initialALong: boolean;    // word-initial a -> ஆ (Anand -> ஆனந்த்) vs அ (Arun)
  chGeminate: boolean;      // intervocalic ch -> ச்ச (Pollachi, Sachin)
  cHard: boolean;           // c -> க (Coimbatore) vs ச (Celvi; the Thanglish default)
  nnRetro: boolean;         // nn -> ண்ண (Kannan) vs ன்ன (Chennai, Ponnu)
  medialDDental: boolean;   // d between vowels -> த (Madurai) vs ட (Vadivel)
  thGeminate: boolean;      // th between vowels -> த்த (Muthu) vs த (Kavitha)
  silentFinalE: boolean;    // English silent final e (Grace -> கிரேஸ், Mysore -> மைசூர்)
  loneConsBare: boolean;    // a lone consonant being typed: "c" -> ச (vs ச்)
}

type Seg = { kind: "C"; key: string } | { kind: "V"; key: string };

function tokenizeWord(word: string): Seg[] {
  const w = word.toLowerCase();
  const segs: Seg[] = [];
  let i = 0;
  outer: while (i < w.length) {
    // "oi" inside a word is ஒ + ய் (Coimbatore -> கோயம்...), not ஒ + இ
    if (i > 0 && w.startsWith("oi", i)) {
      segs.push({ kind: "V", key: "o" }, { kind: "C", key: "y" });
      i += 2;
      continue;
    }
    // y after a consonant is a vowel: final -y = இ (Shanthy -> சாந்தி),
    // before another consonant = ஐ (Mysore -> மைசூர்)
    if (w[i] === "y" && segs.length && segs[segs.length - 1].kind === "C" && !/[aeiou]/.test(w[i + 1] || "")) {
      segs.push({ kind: "V", key: i + 1 >= w.length ? "i" : "ai" });
      i += 1;
      continue;
    }
    for (const [lat, key] of VOWEL_TOKENS) {
      if (w.startsWith(lat, i)) {
        segs.push({ kind: "V", key });
        i += lat.length;
        continue outer;
      }
    }
    for (const [lat, key] of CONS_TOKENS) {
      if (w.startsWith(lat, i)) {
        segs.push({ kind: "C", key });
        i += lat.length;
        continue outer;
      }
    }
    i += 1; // unknown char (digit, symbol) — skip
  }
  return segs;
}

const isC = (s?: Seg) => !!s && s.kind === "C";
const isV = (s?: Seg) => !!s && s.kind === "V";
const DOUBLE_KEYS = new Set(["TT", "LL", "NN", "RR"]);

function transliterateWord(word: string, o: Opts, asInitials = false, dotFollows = false): string {
  // Initials (CM, KVS, or a capital written as an initial: "C." / "C Prasath")
  // are written with each letter's Tamil sound: ச.ம. A capital letter on its own —
  // the first key of a name being typed — is a sound, not an initial: "C" → ச.
  if (asInitials) {
    // the text's own "." after an initial is kept as typed (no "ச..")
    return word.split("").map((ch) => LETTER_NAMES[ch] || ch).join(".") + (dotFollows ? "" : ".");
  }
  if (!hasLatin(word)) return word;

  let segs = tokenizeWord(word);
  // English silent final e after vowel + consonant: Grace, Mysore, Vellore
  if (o.silentFinalE && segs.length >= 3 && /e$/i.test(word)) {
    const n = segs.length;
    if (isV(segs[n - 1]) && segs[n - 1].key === "e" && isC(segs[n - 2]) && isV(segs[n - 3])) segs = segs.slice(0, n - 1);
  }
  // A single consonant being typed ("c", "k", "s") is shown as the bare letter
  if (o.loneConsBare && segs.length === 1 && segs[0].kind === "C") {
    const k = segs[0].key;
    const bare =
      k === "c" ? (o.cHard ? "க" : "ச")
      : k === "N" ? "ந"
      : k === "T" || k === "D" ? (o.initialDDental ? "த" : "ட")
      : CONS_BASE[k];
    if (bare) return bare;
  }
  const vowelCount = segs.filter((s) => s.kind === "V").length;
  const lastVowelIdx = (() => { for (let k = segs.length - 1; k >= 0; k--) if (segs[k].kind === "V") return k; return -1; })();
  let out = "";

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const prev = segs[i - 1];
    const next = segs[i + 1];
    const next2 = segs[i + 2];
    const isLast = i === segs.length - 1;

    if (s.kind === "V") {
      let vk = s.key;
      // How many consonant segments follow this vowel before the next vowel/end?
      let consAfter = 0;
      // A geminate ட்ட does not shorten the vowel before it (பேட்டை, கோட்டை,
      // மேட்டூர்), but ல்ல / ண்ண / ற்ற do (செல்லம், பொன்னு) — so TT counts as one.
      for (let k = i + 1; k < segs.length && segs[k].kind === "C"; k++) {
        const key = segs[k].key;
        consAfter += key === "TT" ? 1 : DOUBLE_KEYS.has(key) ? 2 : 1;
      }
      const beforeCluster = consAfter >= 2 && i + consAfter < segs.length; // cluster followed by a vowel

      if (vk === "e" || vk === "o") {
        const long = o.vowelLen === "long" || (o.vowelLen === "auto" && !beforeCluster);
        if (long) vk = vk === "e" ? "ee" : "oo";
      }
      if (vk === "a") {
        if (isLast && o.finalALong && isC(prev)) vk = "aa";
        else if (!prev && o.initialALong) vk = "aa";
        else if (vowelCount === 1 && i === lastVowelIdx && consAfter >= 1) vk = "aa"; // monosyllable: Ram -> ராம்
        else if (i === lastVowelIdx && consAfter === 1 && vowelCount > 1 && (next?.key === "sh" || next?.key === "s")) vk = "aa"; // Prakash -> பிரகாஷ், Akash -> ஆகாஷ்
        else if (i === lastVowelIdx && consAfter >= 1 && o.closedFinalALong && vowelCount > 1) vk = "aa";
        else if (o.aLongBeforeRCluster && next?.kind === "C" && next.key === "r" && isC(next2)) vk = "aa";
      }
      if (vk === "u" && i === lastVowelIdx && next?.kind === "C" && next.key === "r" && i + 2 === segs.length) vk = "uu"; // -ur -> ஊர் (Tiruppur)

      out += !prev || prev.kind === "V" ? (VOWEL_INDEP[vk] || "") : (VOWEL_SIGN[vk] ?? "");
      continue;
    }

    // Consonant
    let base: string;
    switch (s.key) {
      case "SRI":
        out += "ஸ்ரீ";
        continue;
      case "ksh": base = "க்ஷ"; break;
      case "x": base = "க்ஸ"; break;
      case "c":
        base = o.cHard ? "க" : "ச";
        break;
      case "s":
        // a word-final s is ஸ் (Vikas -> விகாஸ், Thomas -> தோமஸ்); elsewhere ச (Suresh -> சுரேஷ்)
        base = isLast && isV(prev) ? "ஸ" : "ச";
        break;
      case "ng":
        // ng before a vowel is ங்க (Mangalam -> மங்கலம், Ranga -> ரங்கா)
        base = isV(next) ? "ங்க" : "ங";
        break;
      case "nj":
        // nj before a vowel is ஞ்ச (Thanjavur -> தஞ்சாவூர், Anjali -> அஞ்சலி)
        base = isV(next) ? "ஞ்ச" : "ஞ";
        break;
      case "N":
        if (!prev) base = "ந";
        else if (isC(next) && (next!.key === "k" || (next!.key === "c" && o.cHard))) base = "ங"; // nk -> ங்க (Shankar)
        else if (isC(next) && (next!.key === "ch" || next!.key === "j")) base = "ஞ"; // nch -> ஞ்ச (Panchami)
        else if (isC(next) && (next!.key === "th" || next!.key === "D")) base = "ந"; // nd / nth -> ந்த (Anand, Sundar)
        else if (isC(next) && (next!.key === "T" || next!.key === "TT")) base = "ண";
        else if (isV(prev) && isV(next)) base = o.medialNRetro ? "ண" : "ன";
        else base = "ன";
        break;
      case "NN": base = o.nnRetro ? "ண்ண" : "ன்ன"; break;
      case "LL": base = o.llRetro ? "ள்ள" : "ல்ல"; break;
      case "RR": base = "ற்ற"; break;
      case "TT": base = "ட்ட"; break;
      case "D":
        if (prev && prev.kind === "C" && prev.key === "N") base = "த"; // nd -> ந்த
        else if (!prev) base = o.initialDDental ? "த" : "ட";
        else base = o.medialDDental && isV(prev) && isV(next) ? "த" : "ட";
        break;
      case "T":
        base = !prev ? (o.initialDDental ? "த" : "ட") : "ட";
        break;
      case "th":
        // r+th geminates: Karthik -> கார்த்திக், Keerthi -> கீர்த்தி
        base = (prev && prev.kind === "C" && prev.key === "r" && isV(next)) || (o.thGeminate && isV(prev) && isV(next)) ? "த்த" : "த";
        break;
      case "ch":
        base = o.chGeminate && isV(prev) && isV(next) ? "ச்ச" : "ச";
        break;
      default:
        base = CONS_BASE[s.key] || "";
    }
    out += base;

    if (!isV(next)) {
      // Consonant + r/l cluster (initial or medial): split with a short i
      // (பிரியா, குருபிரசாத்) instead of a pulli, per standard Tamil orthography.
      const clusterable = ["k", "c", "p", "f", "T", "D", "th", "s", "sh", "v", "m"].includes(s.key);
      if (o.splitCluster && clusterable && isC(next) && next!.key === "r" && (!prev || isV(prev))) {
        out += VOWEL_SIGN.i;
      } else {
        out += PULLI;
      }
    }
  }
  return out;
}

function transliterateText(text: string, o: Opts): string {
  // Preserve separators (spaces, dots, commas) and any Tamil already typed.
  const parts = text.split(/(\s+|[.,\-/()])/);
  return parts
    .map((part, i) => {
      if (!hasLatin(part)) return part;
      const rest = parts.slice(i + 1).join("");
      return transliterateWord(part, o, isInitials(part, rest), rest.startsWith("."));
    })
    .join("");
}

/** "CM", "KVS", "C." and "C Prasath" are initials; a lone "C" (being typed) and "SRI" are not. */
function isInitials(word: string, rest: string): boolean {
  if (!/^[A-Z]+$/.test(word) || word.length > 3) return false;
  if (word.length === 1) return /^\s*\./.test(rest) || /^\s+\S/.test(rest);
  return word !== "SRI";
}

// Each ambiguity flag with its default and a "cost" for flipping it. Lower
// total cost = more conventional spelling = shown first.
const FLAGS: Array<{ key: keyof Opts; def: any; alt: any[]; cost: number }> = [
  { key: "vowelLen", def: "auto", alt: ["long", "short"], cost: 2 },
  { key: "finalALong", def: true, alt: [false], cost: 3 },
  { key: "medialNRetro", def: false, alt: [true], cost: 1 },
  { key: "closedFinalALong", def: false, alt: [true], cost: 1 },
  { key: "aLongBeforeRCluster", def: false, alt: [true], cost: 1 },
  { key: "initialALong", def: false, alt: [true], cost: 1 },
  { key: "llRetro", def: false, alt: [true], cost: 1 },
  { key: "chGeminate", def: true, alt: [false], cost: 2 },
  { key: "splitCluster", def: true, alt: [false], cost: 2 },
  { key: "initialDDental", def: true, alt: [false], cost: 3 },
  { key: "cHard", def: false, alt: [true], cost: 2 },
  { key: "nnRetro", def: true, alt: [false], cost: 1 },
  { key: "medialDDental", def: false, alt: [true], cost: 1 },
  { key: "thGeminate", def: false, alt: [true], cost: 1 },
  { key: "silentFinalE", def: true, alt: [false], cost: 2 },
  { key: "loneConsBare", def: true, alt: [false], cost: 1 },
];

// Only spellings within MAX_COST of the most conventional one are tried: the
// full product of every flag (~98,000 combinations) is far too slow to run on
// each keystroke, and spellings that far from the convention are never wanted.
const MAX_COST = 5;

function* optionCombos(): Generator<{ o: Opts; cost: number }> {
  const n = FLAGS.length;
  const pick: any[] = FLAGS.map((f) => f.def);
  function* walk(k: number, cost: number): Generator<{ o: Opts; cost: number }> {
    if (k === n) {
      const o: any = {};
      for (let j = 0; j < n; j++) o[FLAGS[j].key] = pick[j];
      yield { o, cost };
      return;
    }
    pick[k] = FLAGS[k].def;
    yield* walk(k + 1, cost);
    if (cost + FLAGS[k].cost <= MAX_COST) {
      for (const alt of FLAGS[k].alt) {
        pick[k] = alt;
        yield* walk(k + 1, cost + FLAGS[k].cost);
      }
      pick[k] = FLAGS[k].def;
    }
  }
  yield* walk(0, 0);
}

/**
 * Returns up to `max` distinct Tamil spellings for a Thanglish string,
 * most conventional first. Returns [] if the input has no Latin letters.
 */
export function tamilSuggestions(text: string, max = 5): string[] {
  const t = (text || "").trim();
  if (!hasLatin(t)) return [];
  const best = new Map<string, number>();
  for (const { o, cost } of optionCombos()) {
    const s = transliterateText(t, o).trim();
    if (!s || !hasTamil(s)) continue;
    const prevCost = best.get(s);
    if (prevCost === undefined || cost < prevCost) best.set(s, cost);
  }
  return Array.from(best.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, max)
    .map(([s]) => s);
}

/** Single best-guess Tamil spelling ("" if nothing to transliterate). */
export function toTamil(text: string): string {
  return tamilSuggestions(text, 1)[0] || "";
}

/**
 * Tamil label for a place, for DISPLAY ONLY. Prefers a curated Tamil name
 * (anything already in Tamil script); otherwise transliterates the first
 * component of the English name ("Udumalaippettai, Tiruppur, ..." ->
 * transliterated "Udumalaippettai"). The caller keeps the original English
 * string as the real value sent to the backend.
 */
export function tamilPlaceLabel(englishName: string, curatedTa?: string | null): string {
  if (curatedTa && hasTamil(curatedTa)) return curatedTa;
  const primary = (englishName || "").split(",")[0].trim();
  // Standard Tamil spelling first (Palakkad → பாலக்காடு); a letter-by-letter
  // guess only for places that are not in lib/placeNamesTa.ts.
  return curatedPlaceTa(primary) || toTamil(primary) || englishName;
}
