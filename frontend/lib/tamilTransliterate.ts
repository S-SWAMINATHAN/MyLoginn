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
//   such as "CM" is read as initials and spelled with Tamil letter names
//   (சி.எம்.).
// * This is a suggestion aid only. It never runs on a value unless the user
//   explicitly picks the suggestion.

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
const VOWEL_TOKENS: Array<[string, string]> = [
  ["aa", "aa"], ["ai", "ai"], ["au", "au"], ["ay", "ai"],
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
  ["ng", "ng"], ["nj", "nj"], ["gn", "nj"],
  ["kh", "k"], ["gh", "k"], ["ph", "p"], ["bh", "p"], ["jh", "j"],
  ["tt", "TT"], ["dd", "TT"], ["ll", "LL"], ["nn", "NN"], ["rr", "RR"],
  ["k", "k"], ["g", "k"], ["c", "k"], ["q", "k"],
  ["j", "j"], ["z", "j"],
  ["t", "T"], ["d", "D"],
  ["n", "N"], ["m", "m"],
  ["p", "p"], ["b", "p"], ["f", "p"],
  ["y", "y"], ["r", "r"], ["l", "l"], ["v", "v"], ["w", "v"],
  ["s", "s"], ["h", "h"], ["x", "x"],
];

// Unambiguous consonant key -> Tamil base letter.
const CONS_BASE: Record<string, string> = {
  k: "க", ng: "ங", ch: "ச", nj: "ஞ", j: "ஜ", th: "த", p: "ப", m: "ம",
  y: "ய", r: "ர", l: "ல", v: "வ", zh: "ழ", sh: "ஷ", s: "ச", h: "ஹ",
};

// Tamil names of Latin letters, for initials such as "CM" -> சி.எம்.
const LETTER_NAMES: Record<string, string> = {
  A: "ஏ", B: "பி", C: "சி", D: "டி", E: "இ", F: "எஃப்", G: "ஜி", H: "ஹெச்",
  I: "ஐ", J: "ஜே", K: "கே", L: "எல்", M: "எம்", N: "என்", O: "ஓ", P: "பி",
  Q: "க்யூ", R: "ஆர்", S: "எஸ்", T: "டி", U: "யு", V: "வி", W: "டபிள்யு",
  X: "எக்ஸ்", Y: "ஒய்", Z: "இசட்",
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
}

type Seg = { kind: "C"; key: string } | { kind: "V"; key: string };

function tokenizeWord(word: string): Seg[] {
  const w = word.toLowerCase();
  const segs: Seg[] = [];
  let i = 0;
  outer: while (i < w.length) {
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

function transliterateWord(word: string, o: Opts): string {
  // Initials: short ALL-CAPS token (CM, R, KV)
  if (word.length <= 3 && /^[A-Z]+$/.test(word)) {
    return word.split("").map((ch) => LETTER_NAMES[ch] || ch).join(".") + ".";
  }
  if (!hasLatin(word)) return word;

  const segs = tokenizeWord(word);
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
      case "N":
        if (!prev) base = "ந";
        else if (isC(next) && (next!.key === "th" || next!.key === "D")) base = "ந"; // nd / nth -> ந்த (Anand, Sundar)
        else if (isC(next) && (next!.key === "T" || next!.key === "TT")) base = "ண";
        else if (isV(prev) && isV(next)) base = o.medialNRetro ? "ண" : "ன";
        else base = "ன";
        break;
      case "NN": base = "ண்ண"; break;
      case "LL": base = o.llRetro ? "ள்ள" : "ல்ல"; break;
      case "RR": base = "ற்ற"; break;
      case "TT": base = "ட்ட"; break;
      case "D":
        if (prev && prev.kind === "C" && prev.key === "N") base = "த"; // nd -> ந்த
        else base = !prev ? (o.initialDDental ? "த" : "ட") : "ட";
        break;
      case "T":
        base = !prev ? (o.initialDDental ? "த" : "ட") : "ட";
        break;
      case "th":
        // r+th geminates: Karthik -> கார்த்திக், Keerthi -> கீர்த்தி
        base = prev && prev.kind === "C" && prev.key === "r" && isV(next) ? "த்த" : "த";
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
      const clusterable = ["k", "p", "T", "D", "th", "s", "sh", "v", "m"].includes(s.key);
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
  return text
    .split(/(\s+|[.,\-/()])/)
    .map((part) => (hasLatin(part) ? transliterateWord(part, o) : part))
    .join("");
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
];

function* optionCombos(): Generator<{ o: Opts; cost: number }> {
  const n = FLAGS.length;
  const choices = FLAGS.map((f) => [f.def, ...f.alt]);
  const idx = new Array(n).fill(0);
  while (true) {
    const o: any = {};
    let cost = 0;
    for (let k = 0; k < n; k++) {
      o[FLAGS[k].key] = choices[k][idx[k]];
      if (idx[k] > 0) cost += FLAGS[k].cost;
    }
    yield { o, cost };
    let k = 0;
    while (k < n) {
      idx[k]++;
      if (idx[k] < choices[k].length) break;
      idx[k] = 0;
      k++;
    }
    if (k === n) return;
  }
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
  return toTamil(primary) || englishName;
}
