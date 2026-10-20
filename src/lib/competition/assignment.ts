/**
 * Question assignment engine (algorithm version 1). Pure: the database layer feeds it the question pool and the
 * candidates in a fixed order and persists what it returns, so any assignment can be re-derived for a dispute.
 *
 * Fairness rules, in priority order:
 *  1. Every set follows the blueprint exactly: same number of questions per difficulty, same marks per slot.
 *  2. No two questions from the same family (variants of one problem) in a set.
 *  3. The set's calibrated solving time stays within ±tolerance of the blueprint target.
 *  4. Least-exposed questions are preferred, so usage spreads evenly across the bank.
 *  5. Topics are not repeated inside a set when the pool allows.
 *  6. Identical sets are avoided while unused balanced combinations remain.
 * Randomness only breaks ties, and comes from a per-candidate seed (sha256 of competition, registration and salt).
 */
import { createHash } from "node:crypto";
import type { BlueprintSlot, Difficulty } from "./types";

export const ALGORITHM_VERSION = 1;

export type PoolQuestion = { id: string; family: string; difficulty: Difficulty; topic: string; expectedMinutes: number };
export type Pick = { questionId: string; position: number; difficulty: Difficulty; marks: number };
export type AssignmentResult = { picks: Pick[]; setHash: string; expectedMinutes: number; balanced: boolean; unique: boolean };

export function assignmentSeed(competitionId: string, registrationId: string, salt: string) {
  return createHash("sha256").update(`${competitionId}:${registrationId}:${salt}`).digest("hex");
}

export function setHashOf(questionIds: string[]) {
  return createHash("sha256").update([...questionIds].sort().join(",")).digest("hex").slice(0, 32);
}

/** sfc32 seeded from a hex string: small, fast, and identical on every platform. */
export function rngFromSeed(seedHex: string) {
  const w = (i: number) => parseInt(seedHex.slice(i * 8, i * 8 + 8).padEnd(8, "0"), 16) >>> 0;
  let a = w(0), b = w(1), c = w(2), d = w(3);
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) next();
  return next;
}

const bySlot = (pool: PoolQuestion[], d: Difficulty) => pool.filter((q) => q.difficulty === d).sort((x, y) => (x.id < y.id ? -1 : 1));
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/** Target solving time of a set: the blueprint applied to the average calibrated time of each difficulty pool. */
export function targetMinutes(blueprint: BlueprintSlot[], pool: PoolQuestion[]) {
  return blueprint.reduce((sum, s) => sum + s.count * mean(bySlot(pool, s.difficulty).map((q) => q.expectedMinutes)), 0);
}

export type EngineState = { exposure: Map<string, number>; usedSets: Set<string> };
export const newEngineState = (): EngineState => ({ exposure: new Map(), usedSets: new Set() });

const MAX_TRIES = 60;

/** Assigns one candidate. Mutates `state` (exposure counts and used set hashes) so the next candidate sees it. */
export function assignOne(blueprint: BlueprintSlot[], pool: PoolQuestion[], seedHex: string, tolerance: number, state: EngineState): AssignmentResult {
  const rng = rngFromSeed(seedHex);
  const target = targetMinutes(blueprint, pool);
  const slots = blueprint.map((s) => ({ ...s, pool: bySlot(pool, s.difficulty) }));
  for (const s of slots) if (s.pool.length < s.count) throw new Error(`Not enough active ${s.difficulty} questions (${s.pool.length} for ${s.count} per candidate).`);

  let best: { picks: Pick[]; minutes: number; hash: string; balanced: boolean; unique: boolean; cost: number } | null = null;
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const families = new Set<string>();
    const topics = new Set<string>();
    const picks: Pick[] = [];
    let minutes = 0;
    let failed = false;
    // Later tries widen the random spread so the search explores beyond the least-exposed questions.
    const spread = 1 + attempt * 0.75;
    for (const slot of slots) {
      for (let k = 0; k < slot.count; k++) {
        let chosen: PoolQuestion | null = null;
        let chosenCost = Infinity;
        for (const q of slot.pool) {
          if (families.has(q.family)) continue;
          const cost = (state.exposure.get(q.id) ?? 0) + (topics.has(q.topic) ? 0.75 : 0) + rng() * spread;
          if (cost < chosenCost) {
            chosen = q;
            chosenCost = cost;
          }
        }
        if (!chosen) {
          failed = true;
          break;
        }
        families.add(chosen.family);
        topics.add(chosen.topic);
        minutes += chosen.expectedMinutes;
        picks.push({ questionId: chosen.id, position: picks.length, difficulty: slot.difficulty, marks: slot.marks });
      }
      if (failed) break;
    }
    if (failed) continue;
    const hash = setHashOf(picks.map((p) => p.questionId));
    const balanced = target === 0 || Math.abs(minutes - target) <= tolerance * target;
    const unique = !state.usedSets.has(hash);
    // Balance outranks uniqueness: an identical-but-fair set beats a unique-but-unfair one.
    const cost = (balanced ? 0 : 1000 + Math.abs(minutes - target)) + (unique ? 0 : 100);
    if (!best || cost < best.cost) best = { picks, minutes, hash, balanced, unique, cost };
    if (balanced && unique) break;
  }
  if (!best) throw new Error("No valid set: too few question families to fill the blueprint without repeating a family.");

  for (const p of best.picks) state.exposure.set(p.questionId, (state.exposure.get(p.questionId) ?? 0) + 1);
  state.usedSets.add(best.hash);
  return { picks: best.picks, setHash: best.hash, expectedMinutes: Math.round(best.minutes), balanced: best.balanced, unique: best.unique };
}

const choose = (n: number, k: number) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
};

export type BankAnalysis = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  targetMinutes: number;
  /** Upper bound on distinct sets (ignores family and time constraints). */
  combinations: number;
  /** Estimated distinct sets that also satisfy the family and time-balance rules. */
  balancedCombinations: number;
  slots: { difficulty: Difficulty; available: number; perCandidate: number; expectedExposure: number; minutesMin: number; minutesMax: number }[];
};

/**
 * Checks whether the bank can give `participants` candidates fair, distinct sets. Run before registration opens and
 * again before assignments are generated; errors block, warnings need an explicit acknowledgement.
 */
export function analyzeBank(blueprint: BlueprintSlot[], pool: PoolQuestion[], participants: number, tolerance: number): BankAnalysis {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!blueprint.length) errors.push("The blueprint has no question slots.");
  const slots = blueprint.map((s) => {
    const qs = bySlot(pool, s.difficulty);
    const families = new Set(qs.map((q) => q.family)).size;
    if (qs.length < s.count) errors.push(`${s.difficulty}: ${qs.length} active question(s), ${s.count} needed per candidate.`);
    else if (families < s.count) errors.push(`${s.difficulty}: only ${families} question families for ${s.count} questions per candidate.`);
    const mins = qs.map((q) => q.expectedMinutes);
    const m = mean(mins);
    const sd = Math.sqrt(mean(mins.map((x) => (x - m) ** 2)));
    if (qs.length > 1 && m > 0 && sd / m > 0.35)
      warnings.push(`${s.difficulty}: calibrated solving times vary widely (${Math.min(...mins)}–${Math.max(...mins)} min). Recalibrate or split the slot so sets stay comparable.`);
    return {
      difficulty: s.difficulty,
      available: qs.length,
      perCandidate: s.count,
      expectedExposure: qs.length ? Math.ceil((participants * s.count) / qs.length) : 0,
      minutesMin: mins.length ? Math.min(...mins) : 0,
      minutesMax: mins.length ? Math.max(...mins) : 0,
    };
  });
  const combinations = blueprint.reduce((prod, s) => prod * choose(bySlot(pool, s.difficulty).length, s.count), blueprint.length ? 1 : 0);
  const target = targetMinutes(blueprint, pool);

  // Estimate the balanced fraction by sampling random sets with a fixed seed (deterministic report).
  let balancedFraction = 0;
  if (!errors.length && combinations > 0) {
    const rng = rngFromSeed("a11ce5ed".repeat(4));
    let good = 0;
    const samples = 3000;
    for (let i = 0; i < samples; i++) {
      const fam = new Set<string>();
      let minutes = 0;
      let ok = true;
      for (const s of blueprint) {
        const qs = bySlot(pool, s.difficulty);
        const idx = new Set<number>();
        while (idx.size < s.count) idx.add(Math.floor(rng() * qs.length));
        for (const j of idx) {
          if (fam.has(qs[j].family)) ok = false;
          fam.add(qs[j].family);
          minutes += qs[j].expectedMinutes;
        }
      }
      if (ok && (target === 0 || Math.abs(minutes - target) <= tolerance * target)) good++;
    }
    balancedFraction = good / samples;
  }
  const balancedCombinations = Math.floor(combinations * balancedFraction);
  if (!errors.length) {
    if (balancedCombinations === 0) errors.push("No set satisfies the time-balance tolerance. Widen the tolerance or recalibrate question times.");
    else if (balancedCombinations < participants)
      warnings.push(`About ${balancedCombinations.toLocaleString("en-IN")} distinct balanced sets for ${participants.toLocaleString("en-IN")} candidates: some candidates will receive an identical set. Add questions to make every set unique.`);
    for (const s of slots)
      if (s.expectedExposure > Math.max(50, participants * 0.2))
        warnings.push(`${s.difficulty}: each question will be seen by about ${s.expectedExposure} candidates. Add more ${s.difficulty.toLowerCase()} questions to reduce answer sharing.`);
  }
  return { ok: errors.length === 0, errors, warnings, targetMinutes: Math.round(target), combinations, balancedCombinations, slots };
}
