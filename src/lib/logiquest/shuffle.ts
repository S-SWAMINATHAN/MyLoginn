import "server-only";
import { randomBytes } from "node:crypto";
import { REFERS_TO_OTHERS, rng } from "./content/build";
import type { Question } from "./types";

/**
 * Practice pages show questions and options in a fresh random order on every visit. The order comes from a short
 * seed kept in the page links, so moving between pages of one visit neither repeats nor skips questions.
 */
export function practiceSeed(given?: string): string {
  return given && /^[0-9a-f]{8}$/.test(given) ? given : randomBytes(4).toString("hex");
}

/** Options that point at their neighbours ("Both A and B", "None of these") or name a part ("A", "II") keep their order. */
const LABEL = /^\(?([A-E]|I{1,3}|IV|V)\)?$/;
const PAIR = /\b[A-E] and [A-E]\b/;

export function shuffleOptions(q: Question, seed: string): Question {
  if (q.kind !== "mcq" || q.o.length < 2 || q.media?.type === "figs") return q;
  if (q.o.some((x) => REFERS_TO_OTHERS.test(x) || PAIR.test(x)) || q.o.every((x) => LABEL.test(x.trim()))) return q;
  const order = rng(`${seed}:${q.id}`).shuffle(q.o.map((_, i) => i));
  return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a), order };
}

const context = (q: Question) => (q.passage || q.media ? `${q.passage ?? ""}|${JSON.stringify(q.media ?? null)}` : null);

/** Shuffles an exercise's questions (keeping passage / data sets together), shuffles each one's options and renumbers. */
export function shuffleQuestions(questions: Question[], seed: string): Question[] {
  const blocks: Question[][] = [];
  for (const q of questions) {
    const last = blocks.at(-1);
    const c = context(q);
    if (last && c && context(last[0]) === c && q.media?.type !== "figs") last.push(q);
    else blocks.push([q]);
  }
  return rng(`${seed}:order`).shuffle(blocks).flat().map((q, i) => ({ ...shuffleOptions(q, seed), n: i + 1 }));
}
