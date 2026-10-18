/** Helpers for authoring coding problems compactly. Random test inputs are seeded, so they never change between builds. */
import { rng, type Rng } from "../../content/build";
import type { IoProblemDef } from "../types";

export const P = (p: Omit<IoProblemDef, "kind">): IoProblemDef => ({ kind: "io", samples: 2, ...p });

/** `count` deterministic random inputs built by `make`. */
export function rand(seed: string, count: number, make: (r: Rng, i: number) => string): string[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => make(r, i));
}

/** n random integers in [lo, hi]. */
export const ints = (r: Rng, n: number, lo: number, hi: number) => Array.from({ length: n }, () => r.int(lo, hi));
/** "n\na1 a2 … an" — the most common array input. */
export const arrIn = (a: (number | string)[]) => `${a.length}\n${a.join(" ")}`;
/** A random lowercase word of length n from the first k letters. */
export const word = (r: Rng, n: number, k = 26) => Array.from({ length: n }, () => String.fromCharCode(97 + r.int(0, k - 1))).join("");
