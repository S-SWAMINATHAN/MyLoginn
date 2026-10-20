/**
 * Code-similarity evidence for integrity review (heuristic v1). Pure.
 *
 * Code is normalised (comments removed, identifiers/numbers/strings replaced by placeholders, keywords and operators
 * kept), cut into 5-token fingerprints and winnowed. Two safeguards keep legitimate solutions from being flagged:
 *  - fingerprints that also occur in the starter code or the reference solution, or in a large share of all
 *    submissions for the question (the standard algorithm, common library calls, I/O boilerplate) are ignored;
 *  - a pair is only reported when its similarity is both high in absolute terms and a statistical outlier against
 *    every other pair on the same question.
 * The output is evidence for a human reviewer. It never changes a score.
 */

const KEYWORDS = new Set(
  (
    "and as assert async await break case catch char class const continue def default del do double elif else enum except extends false final finally float for from function global if import in instanceof int interface is lambda let long new None nonlocal not null or pass private protected public raise return self short static struct super switch this throw throws true True False try typeof unsigned var void volatile while with yield yield " +
    "auto bool namespace using template typename std vector string map set include define cout cin endl printf scanf print input range len sys stdin readline split strip System out println Scanner String Integer List ArrayList HashMap require console log"
  ).split(" ")
);

export function stripComments(source: string, language: string) {
  if (language === "python")
    return source
      .replace(/("""|''')[\s\S]*?\1/g, " ")
      .replace(/#[^\n]*/g, " ");
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

const TOKEN = /[A-Za-z_]\w*|\d+(?:\.\d+)?|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`|==|!=|<=|>=|&&|\|\||\+\+|--|<<|>>|->|::|\S/g;

/** Normalised token stream: identifiers → v, numbers → 0, strings → s. */
export function normalizedTokens(source: string, language: string) {
  const raw = stripComments(source, language).match(TOKEN) ?? [];
  return raw.map((t) => {
    if (/^[A-Za-z_]/.test(t)) return KEYWORDS.has(t) ? t : "v";
    if (/^\d/.test(t)) return "0";
    if (/^["'`]/.test(t)) return "s";
    return t;
  });
}

/** Same text apart from comments and whitespace: a much stronger signal than structural similarity. */
export function verbatimKey(source: string, language: string) {
  return (stripComments(source, language).match(TOKEN) ?? []).join(" ");
}

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Winnowed k-gram fingerprints (k = 5 tokens, window 4). */
export function fingerprints(tokens: string[], k = 5, w = 4) {
  const grams: number[] = [];
  for (let i = 0; i + k <= tokens.length; i++) grams.push(fnv(tokens.slice(i, i + k).join(" ")));
  const out = new Set<number>();
  if (grams.length <= w) {
    grams.forEach((g) => out.add(g));
    return out;
  }
  for (let i = 0; i + w <= grams.length; i++) {
    let min = grams[i];
    for (let j = 1; j < w; j++) if (grams[i + j] < min) min = grams[i + j];
    out.add(min);
  }
  return out;
}

export type SubmissionForAnalysis = { attemptId: string; language: string; source: string };
export type SimilarityFinding = {
  a: string;
  b: string;
  language: string;
  similarity: number;
  verbatim: boolean;
  zScore: number;
  baselineMean: number;
  sharedFingerprints: number;
  tokens: [number, number];
  matchingLines: string[];
  riskScore: number;
};

/** Minimum normalised tokens before a submission is compared at all: tiny programs are similar by necessity. */
export const MIN_TOKENS = 40;
/** Distinctive fingerprints each side needs (after ignoring template and common ones) before a pair is compared. */
const MIN_USEFUL_PRINTS = 8;
const STRONG_SIMILARITY = 0.9;

export function analyzeQuestion(subs: SubmissionForAnalysis[], template: { language: string; source: string }[] = [], opts = { minSimilarity: 0.8, minZ: 3 }) {
  const findings: SimilarityFinding[] = [];
  const byLang = new Map<string, SubmissionForAnalysis[]>();
  for (const s of subs) byLang.set(s.language, [...(byLang.get(s.language) ?? []), s]);

  for (const [language, group] of byLang) {
    const prepared = group
      .map((s) => ({ s, tokens: normalizedTokens(s.source, language), verbatim: verbatimKey(s.source, language) }))
      .filter((p) => p.tokens.length >= MIN_TOKENS);
    if (prepared.length < 2) continue;

    const ignore = new Set<number>();
    const templateText = new Set<string>();
    for (const t of template.filter((x) => x.language === language || !x.language)) {
      for (const f of fingerprints(normalizedTokens(t.source, t.language || language))) ignore.add(f);
      templateText.add(verbatimKey(t.source, t.language || language));
    }
    const prints = prepared.map((p) => fingerprints(p.tokens));
    const df = new Map<number, number>();
    for (const set of prints) for (const f of set) df.set(f, (df.get(f) ?? 0) + 1);
    // A fingerprint present in at least 30% of submissions (and at least 3) is common knowledge, not evidence.
    const commonAt = Math.max(3, Math.ceil(prepared.length * 0.3));
    for (const [f, n] of df) if (n >= commonAt) ignore.add(f);
    const useful = prints.map((set) => new Set([...set].filter((f) => !ignore.has(f))));

    // Inverted index: only pairs sharing a useful fingerprint get a non-zero similarity.
    const index = new Map<number, number[]>();
    useful.forEach((set, i) => set.forEach((f) => index.set(f, [...(index.get(f) ?? []), i])));
    const shared = new Map<string, number>();
    for (const list of index.values()) {
      for (let x = 0; x < list.length; x++)
        for (let y = x + 1; y < list.length; y++) {
          const key = `${list[x]}:${list[y]}`;
          shared.set(key, (shared.get(key) ?? 0) + 1);
        }
    }
    const sims = new Map<string, number>();
    for (const [key, n] of shared) {
      const [i, j] = key.split(":").map(Number);
      const union = useful[i].size + useful[j].size - n;
      sims.set(key, union ? n / union : 0);
    }
    // Same verbatim text always pairs, even when the shared fingerprints were all "common".
    const verbatimGroups = new Map<string, number[]>();
    prepared.forEach((p, i) => verbatimGroups.set(p.verbatim, [...(verbatimGroups.get(p.verbatim) ?? []), i]));

    const totalPairs = (prepared.length * (prepared.length - 1)) / 2;
    let sum = 0;
    let sumSq = 0;
    for (const v of sims.values()) {
      sum += v;
      sumSq += v * v;
    }
    const meanSim = sum / totalPairs;
    const sd = Math.sqrt(Math.max(0, sumSq / totalPairs - meanSim * meanSim)) || 0.05;

    const reported = new Set<string>();
    const report = (i: number, j: number, verbatim: boolean) => {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (reported.has(key)) return;
      reported.add(key);
      const sim = verbatim ? 1 : sims.get(key) ?? 0;
      const z = (sim - meanSim) / sd;
      findings.push({
        a: prepared[i].s.attemptId,
        b: prepared[j].s.attemptId,
        language,
        similarity: Math.round(sim * 1000) / 1000,
        verbatim,
        zScore: Math.round(z * 10) / 10,
        baselineMean: Math.round(meanSim * 1000) / 1000,
        sharedFingerprints: shared.get(key) ?? 0,
        tokens: [prepared[i].tokens.length, prepared[j].tokens.length],
        matchingLines: matchingLines(prepared[i].s.source, prepared[j].s.source, language),
        riskScore: Math.round(Math.min(100, verbatim ? 95 : sim * 70 + Math.min(30, Math.max(0, z) * 5))),
      });
    };
    for (const [text, list] of verbatimGroups) {
      if (templateText.has(text)) continue;
      for (let x = 0; x < list.length; x++) for (let y = x + 1; y < list.length; y++) report(list[x], list[y], true);
    }
    for (const [key, sim] of sims) {
      const [i, j] = key.split(":").map(Number);
      // Too little distinctive code left after removing template and common fingerprints to say anything.
      if (Math.min(useful[i].size, useful[j].size) < MIN_USEFUL_PRINTS) continue;
      const z = (sim - meanSim) / sd;
      // Very high similarity is reported on its own; high similarity needs to be an outlier for the question too.
      // (Small groups have no reliable baseline, so they only use the first rule.)
      if (sim >= STRONG_SIMILARITY || (sim >= opts.minSimilarity && prepared.length >= 6 && z >= opts.minZ)) report(i, j, false);
    }
  }
  return findings.sort((x, y) => y.riskScore - x.riskScore);
}

/** Up to 8 non-trivial lines that are identical after whitespace normalisation, for the reviewer's side-by-side. */
export function matchingLines(a: string, b: string, language: string) {
  const norm = (s: string) =>
    stripComments(s, language)
      .split("\n")
      .map((l) => l.trim().replace(/\s+/g, " "))
      .filter((l) => l.length >= 18);
  const setB = new Set(norm(b));
  return [...new Set(norm(a).filter((l) => setB.has(l)))].slice(0, 8);
}
