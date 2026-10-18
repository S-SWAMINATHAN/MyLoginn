/** Generated Logical Reasoning items: number series, letter & symbol series, comparison-chain logical problems. */
import type { RawQ } from "../../types";
import { cycle, gen, numOptions, textOptions, type Rng } from "../build";

const L = (n: number) => String.fromCharCode(65 + ((((n % 26) + 26) % 26)));

// ───────────── Number Series ─────────────
type Pattern = { seq: number[]; next: number; rule: string };
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const numberPatterns: ((r: Rng) => Pattern | null)[] = [
  (r) => { const a = r.int(2, 60), d = r.int(3, 19); const s = Array.from({ length: 7 }, (_, k) => a + d * k); return { seq: s.slice(0, 6), next: s[6], rule: `This is an addition series: each number is ${d} more than the previous one.` }; },
  (r) => { const a = r.int(80, 160), d = r.int(3, 12); const s = Array.from({ length: 7 }, (_, k) => a - d * k); return { seq: s.slice(0, 6), next: s[6], rule: `This is a subtraction series: ${d} is subtracted each time.` }; },
  (r) => { const a = r.int(1, 5), q = r.int(2, 3); const s = Array.from({ length: 7 }, (_, k) => a * q ** k); return { seq: s.slice(0, 6), next: s[6], rule: `Each number is multiplied by ${q}.` }; },
  (r) => { const a = r.int(2, 10), d0 = r.int(1, 4), dd = r.int(1, 3); const s = [a]; for (let k = 0; k < 6; k++) s.push(s[k] + d0 + dd * k); return { seq: s.slice(0, 6), next: s[6], rule: `The differences are ${d0}, ${d0 + dd}, ${d0 + 2 * dd}, … — they increase by ${dd} each time, so the next difference is ${d0 + 5 * dd}.` }; },
  (r) => { const o = r.int(1, 6); const s = Array.from({ length: 7 }, (_, k) => (k + o) ** 2); return { seq: s.slice(0, 6), next: s[6], rule: `The numbers are perfect squares: ${o}², ${o + 1}², … so the next is ${o + 6}².` }; },
  (r) => { const o = r.int(1, 3); const s = Array.from({ length: 7 }, (_, k) => (k + o) ** 3); return { seq: s.slice(0, 6), next: s[6], rule: `The numbers are cubes: ${o}³, ${o + 1}³, … so the next is ${o + 6}³.` }; },
  (r) => { const o = r.int(0, 14); const s = PRIMES.slice(o, o + 7); return { seq: s.slice(0, 6), next: s[6], rule: "The numbers are consecutive prime numbers." }; },
  (r) => { const a = r.int(1, 3); const s = [a]; for (let k = 1; k <= 6; k++) s.push(s[k - 1] * k + k); return { seq: s.slice(0, 6), next: s[6], rule: "The pattern is ×1 + 1, ×2 + 2, ×3 + 3, ×4 + 4, … — the next step is ×6 + 6." }; },
  (r) => { const a = r.int(1, 5), b = r.int(1, 5); const s = [a, b]; for (let k = 2; k < 7; k++) s.push(s[k - 1] + s[k - 2]); return { seq: s.slice(0, 6), next: s[6], rule: "Each number is the sum of the two numbers before it." }; },
  (r) => { const a = r.int(2, 20), b = r.int(40, 90), d1 = r.int(2, 6), d2 = r.int(2, 6); const s = Array.from({ length: 7 }, (_, k) => (k % 2 === 0 ? a + d1 * (k / 2) : b - d2 * ((k - 1) / 2))); return { seq: s.slice(0, 6), next: s[6], rule: `Two series alternate: ${a}, ${a + d1}, ${a + 2 * d1}, … (adding ${d1}) and ${b}, ${b - d2}, ${b - 2 * d2}, … (subtracting ${d2}).` }; },
  (r) => { const a = r.int(2, 9), m = r.int(2, 3), c = r.pick([1, -1, 2]); const s = [a]; for (let k = 0; k < 6; k++) s.push(s[k] * m + c); return { seq: s.slice(0, 6), next: s[6], rule: `Each number = previous × ${m} ${c >= 0 ? "+" : "−"} ${Math.abs(c)}.` }; },
  (r) => { const o = r.int(1, 6); const s = Array.from({ length: 7 }, (_, k) => (k + o) * (k + o + 1)); return { seq: s.slice(0, 6), next: s[6], rule: `The numbers are n(n + 1): ${o}×${o + 1}, ${o + 1}×${o + 2}, … so the next is ${o + 6}×${o + 7}.` }; },
];
export const numberSeries: RawQ[] = gen("lr-number-series", 90, (r, i) => {
  const p = numberPatterns[i % numberPatterns.length](r);
  if (!p) return null;
  const { seq, next, rule } = p;
  if (i % 3 === 2) {
    const pos = r.int(1, 5), shown = [...seq, next], bad = shown[pos] + r.pick([1, -1, 2, -2, 3]);
    if (shown.includes(bad)) return null;
    const right = shown[pos];
    shown[pos] = bad;
    return { q: `Look at this series and find the number that does not belong:\n${shown.join(", ")}`, ...textOptions(r, String(bad), shown.filter((x) => x !== bad).map(String)), e: `${rule}\nThe term ${bad} should be ${right}, so **${bad}** is the wrong number.`, d: 2 };
  }
  return { q: `Look at this series: ${seq.join(", ")}, … What number should come next?`, ...numOptions(r, next, { wrong: [next + (seq[5] - seq[4]), next - 1, next + 2], step: Math.max(1, Math.round(Math.abs(next - seq[5]) / 3)), min: -1e9 }), e: `${rule}\nSo the next number is **${next}**.`, d: i % 4 === 3 ? 2 : 1 };
});

// ───────────── Letter and Symbol Series ─────────────
export const letterSeries: RawQ[] = gen("lr-letter-series", 72, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const a = r.int(0, 8), k = r.int(2, 4); const s = Array.from({ length: 6 }, (_, j) => L(a + k * j)); return { q: `What comes next? ${s.slice(0, 5).join(", ")}, …`, ...textOptions(r, s[5], [L(a + 5 * k + 1), L(a + 5 * k - 1), L(a + 4 * k + 1), L(a + 6 * k)]), e: `Each letter moves ${k} places forward: ${s.slice(0, 5).map((c, j) => `${c}${j < 4 ? ` (+${k})` : ""}`).join(" → ")} → **${s[5]}**.`, d: 1 }; },
    (r) => { const a = r.int(0, 5); const pairs = Array.from({ length: 5 }, (_, j) => `${L(a + j)}${L(25 - a - j)}`); return { q: `What comes next? ${pairs.slice(0, 4).join(", ")}, …`, ...textOptions(r, pairs[4], [`${L(a + 4)}${L(25 - a - 5)}`, `${L(a + 5)}${L(25 - a - 4)}`, `${L(25 - a - 4)}${L(a + 4)}`]), e: `The first letter moves forward (${pairs.map((p) => p[0]).slice(0, 4).join(", ")}…) and the second moves backward from the end of the alphabet (${pairs.map((p) => p[1]).slice(0, 4).join(", ")}…). The pairs are opposite letters, so the next is **${pairs[4]}**.`, d: 1 }; },
    (r) => { const a = r.int(0, 4); const s = [a]; for (let j = 1; j < 6; j++) s.push(s[j - 1] + j); const ls = s.map(L); return { q: `What comes next? ${ls.slice(0, 5).join(", ")}, …`, ...textOptions(r, ls[5], [L(s[5] + 1), L(s[5] - 1), L(s[4] + 4)]), e: `The gaps grow by one each time: +1, +2, +3, +4, so the next step is +5: ${ls[4]} + 5 = **${ls[5]}**.`, d: 2 }; },
    (r) => { const a = r.int(0, 10), k = r.int(1, 3); const s = Array.from({ length: 5 }, (_, j) => `${L(a + k * j)}${2 * j + 1}`); return { q: `What comes next? ${s.slice(0, 4).join(", ")}, …`, ...textOptions(r, s[4], [`${L(a + 4 * k)}${8}`, `${L(a + 4 * k + 1)}${9}`, `${L(a + 3 * k)}${9}`]), e: `The letters move ${k} place(s) forward each time and the numbers are odd numbers 1, 3, 5, 7, … so the next term is **${s[4]}**.`, d: 1 }; },
    (r) => { const a = r.int(0, 8), len = 3; const groups = Array.from({ length: 4 }, (_, j) => Array.from({ length: len }, (_, t) => L(a + 2 * (j * len + t))).join("")); return { q: `What comes next? ${groups.slice(0, 3).join(", ")}, …`, ...textOptions(r, groups[3], [Array.from({ length: 3 }, (_, t) => L(a + 2 * (9 + t) + 1)).join(""), Array.from({ length: 3 }, (_, t) => L(a + 2 * (8 + t))).join(""), Array.from({ length: 3 }, (_, t) => L(a + 2 * 9 + t)).join("")]), e: `The letters skip one each time throughout: ${groups.slice(0, 3).join(" ")} … so the next group is **${groups[3]}**.`, d: 2 }; },
    (r) => { const a = r.int(0, 12), b = r.int(13, 22); const s = Array.from({ length: 6 }, (_, j) => (j % 2 === 0 ? L(a + j / 2) : L(b - (j - 1) / 2))); return { q: `What comes next? ${s.slice(0, 5).join(", ")}, …`, ...textOptions(r, s[5], [L(b - 3), L(b - 1), L(a + 3)]), e: `Two series alternate: ${s.filter((_, j) => j % 2 === 0).join(", ")} (forward) and ${s.filter((_, j) => j % 2 === 1).join(", ")} (backward). The next term belongs to the second series: **${s[5]}**.`, d: 2 }; },
  ])
);

// ───────────── Logical Problems (comparison chains) ─────────────
const NAMES = ["Asha", "Bala", "Chitra", "Dev", "Esha", "Farhan", "Gita", "Hari", "Isha", "Joseph", "Kavya", "Lokesh", "Meera", "Naveen", "Om", "Priya", "Ravi", "Sana", "Tarun", "Usha"];
const RELS: { more: string; less: string }[] = [
  { more: "is taller than", less: "is shorter than" },
  { more: "is older than", less: "is younger than" },
  { more: "runs faster than", less: "runs slower than" },
  { more: "earns more than", less: "earns less than" },
  { more: "is heavier than", less: "is lighter than" },
];
const ITEMS: { more: string; less: string; things: string[] }[] = [
  { more: "costs more than", less: "costs less than", things: ["A mango", "An apple", "An orange", "A banana", "A guava"] },
  { more: "is longer than", less: "is shorter than", things: ["The red rope", "The blue rope", "The green rope", "The white rope"] },
  { more: "has more pages than", less: "has fewer pages than", things: ["The novel", "The atlas", "The dictionary", "The diary"] },
];
const TFU = ["true", "false", "uncertain"];
export const logicalProblems: RawQ[] = gen("lr-logical-problems", 72, (r, i) => {
  const useItems = r.chance(0.3);
  const pool = useItems ? r.pick(ITEMS) : null;
  const rel = pool ?? r.pick(RELS);
  const [x, y, z] = r.shuffle(pool ? pool.things : NAMES).slice(0, 3);
  // phrase "a > b" either way round
  const low = (s: string) => (pool ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const gt = (a: string, b: string) => (r.chance(0.5) ? `${a} ${rel.more} ${low(b)}` : `${b} ${rel.less} ${low(a)}`);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const says = (a: string, b: string) => `${low(a)} ${rel.more} ${low(b)}`;
  let s1: string, s2: string, s3: string, ans: number, why: string;
  switch (i % 3) {
    case 0: { // chain x > y > z, ask about x vs z (true) or z vs x (false)
      s1 = gt(x, y); s2 = gt(y, z);
      const truth = r.chance(0.5);
      s3 = truth ? gt(x, z) : gt(z, x);
      ans = truth ? 0 : 1;
      why = `From the first two statements, ${says(x, y)} and ${says(y, z)}. So ${says(x, z)}, which makes the third statement ${truth ? "**true**" : "**false**"}.`;
      break;
    }
    case 1: { // fork: x > y, x > z ⇒ y vs z uncertain
      s1 = gt(x, y); s2 = gt(x, z); s3 = gt(y, z); ans = 2;
      why = `We only know that ${says(x, y)} and ${says(x, z)}. Nothing compares ${low(y)} with ${low(z)}, so the third statement is **uncertain**.`;
      break;
    }
    default: { // join: y > x, z > x ⇒ y vs z uncertain; or y > x, x > z ⇒ (true chain reversed)
      if (r.chance(0.5)) { s1 = gt(y, x); s2 = gt(z, x); s3 = gt(y, z); ans = 2; why = `We know ${says(y, x)} and ${says(z, x)}, but ${low(y)} and ${low(z)} are never compared with each other, so the third statement is **uncertain**.`; }
      else { s1 = gt(y, x); s2 = gt(x, z); const truth = r.chance(0.5); s3 = truth ? gt(y, z) : gt(z, y); ans = truth ? 0 : 1; why = `From the statements, ${says(y, x)} and ${says(x, z)}, so ${says(y, z)}. The third statement is ${truth ? "**true**" : "**false**"}.`; }
    }
  }
  return { q: `${cap(s1)}. ${cap(s2)}. ${cap(s3)}.\nIf the first two statements are true, the third statement is`, o: TFU, a: ans, e: why, d: i % 3 === 0 ? 1 : 2 };
});

