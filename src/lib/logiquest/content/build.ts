/**
 * Authoring helpers for LogiQuest content. Subject files describe questions compactly with these helpers;
 * `finalizeSubject` turns them into stable, shuffled, numbered questions.
 */
import type { FormulaBlock, Level, Media, Question, RawExercise, RawItem, RawQ, RawSet, RawSubject, RawTopic, SubjectContent } from "../types";

// ───────────── hashing & seeded randomness ─────────────

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export type Rng = {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  chance(p: number): boolean;
};

/** Deterministic PRNG (mulberry32), so generated questions are identical on every build and their ids never change. */
export function rng(seed: string | number): Rng {
  let s = typeof seed === "number" ? seed >>> 0 : hash(seed);
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: (items) => items[Math.floor(next() * items.length)],
    shuffle: (items) => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    chance: (p) => next() < p,
  };
}

// ───────────── authoring helpers ─────────────

type MOpts = { a?: number; d?: Level; check?: string; media?: Media; keep?: boolean };

/** Multiple choice. Option 0 is the answer unless `a` is given; options are shuffled at build time. */
export function m(q: string, o: string[], e: string, opts: MOpts = {}): RawQ {
  return { q, o, e, ...opts };
}
/** Same as `m` but at a given level. */
export const m2 = (q: string, o: string[], e: string, opts: MOpts = {}) => m(q, o, e, { d: 2, ...opts });
export const m3 = (q: string, o: string[], e: string, opts: MOpts = {}) => m(q, o, e, { d: 3, ...opts });

/** Question with a written model answer (interview, short answer, group discussion). */
export function qa(q: string, ans: string, opts: { d?: Level; e?: string } = {}): RawQ {
  return { q, ans, ...opts };
}

/** Several questions sharing one passage or data set (comprehension, data interpretation). */
export function set(context: string | { passage?: string; media?: Media }, items: RawQ[]): RawSet {
  return typeof context === "string" ? { set: true, passage: context, items } : { set: true, ...context, items };
}

/** A topic with one "General Questions" exercise, optionally with formulas and further exercises. */
export function topic(items: RawItem[], extra: { intro?: string; formulas?: FormulaBlock[]; exercises?: RawExercise[]; title?: string } = {}): RawTopic {
  const main: RawExercise[] = items.length ? [{ slug: "general", title: extra.title ?? "General Questions", items }] : [];
  return { intro: extra.intro, formulas: extra.formulas, exercises: [...main, ...(extra.exercises ?? [])] };
}

export const ex = (slug: string, title: string, items: RawItem[]): RawExercise => ({ slug, title, items });

/**
 * Builds `count` distinct generated questions. The generator receives its own seeded RNG; duplicates (same prompt)
 * are skipped, so a generator with a small parameter space simply yields fewer questions.
 */
export function gen(seed: string, count: number, make: (r: Rng, i: number) => RawQ | null): RawQ[] {
  const r = rng(seed);
  const out: RawQ[] = [];
  const seen = new Set<string>();
  // A failed attempt (null or a repeated prompt) moves on to the next template index, so one exhausted template
  // cannot starve the others.
  for (let attempt = 0, misses = 0; out.length < count && attempt < count * 12; attempt++) {
    const item = make(r, out.length + misses);
    const key = item ? `${item.q}|${[...(item.o ?? [])].sort().join("|")}|${item.media ? JSON.stringify(item.media) : ""}` : "";
    if (!item || seen.has(key)) { misses++; continue; }
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Formats a number for display: integers plainly, otherwise up to 2 decimals without trailing zeros. */
export function fmt(n: number, dp = 2): string {
  if (Number.isInteger(n)) return n.toLocaleString("en-IN");
  return Number(n.toFixed(dp)).toLocaleString("en-IN", { maximumFractionDigits: dp });
}

/**
 * Four numeric options around `answer`, sorted ascending, with the answer's index.
 * Distractors come from `wrong` first (typical mistakes), then nearby values.
 */
export function numOptions(r: Rng, answer: number, opts: { wrong?: number[]; unit?: string; prefix?: string; step?: number; dp?: number; min?: number } = {}): { o: string[]; a: number } {
  const step = opts.step ?? Math.max(1, Math.round(Math.abs(answer) * 0.1));
  const min = opts.min ?? 0;
  const dp = opts.dp ?? 2;
  const key = (n: number) => Number(n.toFixed(dp));
  const values = new Set<number>([key(answer)]);
  const whole = Number.isInteger(answer);
  for (const raw of opts.wrong ?? []) {
    if (values.size >= 4) break;
    const w = whole ? Math.round(raw) : raw;
    if (Number.isFinite(w) && w > min && key(w) !== key(answer)) values.add(key(w));
  }
  const deltas = r.shuffle([-3, -2, -1, 1, 2, 3, 4, -4, 5, -5]);
  for (const d of deltas) {
    if (values.size >= 4) break;
    const v = key(answer + d * step);
    if (v > min) values.add(v);
  }
  for (let k = 6; values.size < 4; k++) values.add(key(answer + k * step));
  const sorted = [...values].sort((x, y) => x - y);
  const sep = opts.unit && /^[%°]/.test(opts.unit) ? "" : " ";
  const label = (n: number) => `${opts.prefix ?? ""}${fmt(n, dp)}${opts.unit ? `${sep}${opts.unit}` : ""}`;
  return { o: sorted.map(label), a: sorted.indexOf(key(answer)) };
}

/** Four text options from a correct value and candidate distractors (duplicates removed), shuffled with the RNG. */
export function textOptions(r: Rng, answer: string, wrong: string[]): { o: string[]; a: number } {
  const pool = [...new Set(wrong.filter((w) => w !== answer))];
  const chosen = r.shuffle(pool).slice(0, 3);
  const all = r.shuffle([answer, ...chosen]);
  return { o: all, a: all.indexOf(answer) };
}

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** "3/4" style fraction text, reduced. */
export function frac(n: number, d: number): string {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  return b === 1 ? `${a}` : `${a}/${b}`;
}

// ───────────── finalize ─────────────

const REFERS_TO_OTHERS = /\b(all of|none of|both|neither|cannot be determined|even both|either)\b|\b(only|both) (I|II|III|IV)\b|\b(I|II|III|IV) (alone|and)\b|^no error|^none\b/i;

function finalizeOptions(raw: RawQ): { o: string[]; a: number } {
  const o = raw.o ?? [];
  if (raw.a !== undefined || raw.keep || o.some((x) => REFERS_TO_OTHERS.test(x))) return { o, a: raw.a ?? 0 };
  const r = rng(`opts:${raw.q}`);
  const order = r.shuffle(o.map((_, i) => i));
  return { o: order.map((i) => o[i]), a: order.indexOf(0) };
}

/** Turns an authored subject into numbered questions with stable ids "<subject>.<topic>.<hash>". */
export function finalizeSubject(subject: string, raw: RawSubject): SubjectContent {
  const out: SubjectContent = {};
  for (const [topicSlug, t] of Object.entries(raw)) {
    const used = new Set<string>();
    out[topicSlug] = {
      intro: t.intro,
      formulas: t.formulas,
      exercises: t.exercises.map((exercise) => {
        const questions: Question[] = [];
        for (const item of exercise.items) {
          const group = "set" in item ? item.items.map((q) => ({ q, ctx: item })) : [{ q: item as RawQ, ctx: null as RawSet | null }];
          for (const { q: rq, ctx } of group) {
            const isQa = !rq.o;
            const { o, a } = isQa ? { o: [], a: -1 } : finalizeOptions(rq);
            const context = `${ctx?.passage ?? ""}|${ctx?.media ? JSON.stringify(ctx.media) : ""}|${rq.media ? JSON.stringify(rq.media) : ""}|${[...(rq.o ?? [])].sort().join("|")}`;
            let id = `${subject}.${topicSlug}.${hash(`${context}|${rq.q}`).toString(36)}`;
            for (let k = 2; used.has(id); k++) id = `${subject}.${topicSlug}.${hash(`${context}|${rq.q}#${k}`).toString(36)}`;
            used.add(id);
            questions.push({
              id, subject, topic: topicSlug, exercise: exercise.slug, n: questions.length + 1,
              kind: isQa ? "qa" : "mcq", q: rq.q, o, a, ans: rq.ans, e: rq.e ?? "", d: rq.d ?? 1,
              passage: ctx?.passage, media: rq.media ?? ctx?.media, check: rq.check,
            });
          }
        }
        return { slug: exercise.slug, title: exercise.title, questions };
      }),
    };
  }
  return out;
}

/** "7 1/7" style mixed number for n/d (reduced). */
export function mixed(n: number, d: number): string {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  if (b === 1) return `${a}`;
  const whole = Math.floor(a / b);
  return whole ? `${whole} ${a % b}/${b}` : `${a}/${b}`;
}

/** Four options from exact fractions (numerator/denominator pairs), sorted by value, shown as mixed numbers. */
export function fracOptions(r: Rng, n: number, d: number, wrong: [number, number][], unit = ""): { o: string[]; a: number } {
  const key = (x: number, y: number) => Math.round((x / y) * 1e6);
  const seen = new Map<number, [number, number]>([[key(n, d), [n, d]]]);
  for (const w of [...wrong, ...r.shuffle([[n + d, d], [n * 2, d * 3], [n * 3, d * 2], [n + 2 * d, d], [Math.max(1, n - d), d]] as [number, number][])]) {
    if (seen.size >= 4) break;
    if (w[0] > 0 && w[1] > 0 && !seen.has(key(w[0], w[1]))) seen.set(key(w[0], w[1]), w);
  }
  const list = [...seen.entries()].sort((x, y) => x[0] - y[0]);
  const label = ([x, y]: [number, number]) => `${mixed(x, y)}${unit ? ` ${unit}` : ""}`;
  return { o: list.map(([, v]) => label(v)), a: list.findIndex(([k]) => k === key(n, d)) };
}

/** Rotates through question templates so consecutive generated questions differ in kind. */
export function cycle<T>(i: number, r: Rng, makers: ((r: Rng) => T)[]): T {
  return makers[i % makers.length](r);
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ord(n: number): string {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
