/** Generated Verbal Reasoning items with computed answers. */
import type { Fig, RawQ } from "../../types";
import { cycle, gen, numOptions, ord, textOptions, type Rng } from "../build";

const L = (n: number) => String.fromCharCode(65 + ((((n % 26) + 26) % 26)));
const pos = (c: string) => c.charCodeAt(0) - 64;
const NAMES = ["Ravi", "Anita", "Suresh", "Kavya", "Manoj", "Divya", "Arjun", "Pooja", "Kiran", "Neha", "Rahul", "Sneha", "Vikram", "Lakshmi", "Imran", "Fatima"];

// ───────────── Direction Sense Test ─────────────
const DIRS = ["North", "East", "South", "West"];
const VEC: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
function bearing(dx: number, dy: number) {
  if (!dx && !dy) return "at the starting point";
  const ns = dy > 0 ? "North" : dy < 0 ? "South" : "";
  const ew = dx > 0 ? "East" : dx < 0 ? "West" : "";
  return ns && ew ? `${ns}-${ew}` : ns || ew;
}
export const directionSense: RawQ[] = gen("vr-direction", 36, (r, i) => {
  const name = r.pick(NAMES), steps = r.int(3, 5);
  let d = r.int(0, 3), x = 0, y = 0;
  const parts: string[] = [];
  for (let k = 0; k < steps; k++) {
    if (k > 0) { const turn = r.pick(["left", "right"]); d = (d + (turn === "right" ? 1 : 3)) % 4; parts.push(`turns ${turn}`); }
    const dist = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
    parts.push(`${k === 0 ? `walks ${dist} km towards ${DIRS[d]}` : `walks ${dist} km`}`);
    x += VEC[d][0] * dist; y += VEC[d][1] * dist;
  }
  const text = `${name} ${parts.join(", ").replace(/, ([^,]*)$/, " and then $1")}.`;
  const dist2 = x * x + y * y, distance = Math.sqrt(dist2);
  if (i % 2 === 0) {
    if (!Number.isInteger(distance)) {
      if (x && y) return null;
    }
    return { q: `${text} How far is ${name} from the starting point?`, ...numOptions(r, distance, { unit: "km", wrong: [Math.abs(x) + Math.abs(y), Math.abs(x - y) || distance + 2], step: 1, min: -1 }), e: `Take the start as the origin with North as +y and East as +x. The moves give a final position of (${x}, ${y}).\nDistance = √(${x}² + ${y}²) = √${dist2} = **${distance} km**.`, d: 2 };
  }
  if (!x && !y) return null;
  const ans = bearing(x, y);
  return { q: `${text} In which direction is ${name} now from the starting point?`, ...textOptions(r, ans, ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].filter((v) => v !== ans)), e: `Track the position with North as +y and East as +x. The final position is (${x}, ${y}): ${y > 0 ? `${y} km north` : y < 0 ? `${-y} km south` : "level with the start"} and ${x > 0 ? `${x} km east` : x < 0 ? `${-x} km west` : "in line with the start"}.\nSo ${name} is to the **${ans}**.`, d: 2 };
});

// ───────────── Coding Decoding ─────────────
const WORDS = ["CAT", "DOG", "MILK", "BOOK", "PEN", "LAMP", "TREE", "FISH", "GOLD", "RAIN", "STAR", "CODE", "DATA", "LOGIC", "TABLE", "MOUSE", "PLANE", "WATER", "LIGHT", "SMART", "BRAIN", "CLOUD", "HOUSE", "PAPER"];
const shiftWord = (w: string, k: number) => [...w].map((c) => L(pos(c) - 1 + k)).join("");
export const codingDecoding: RawQ[] = gen("vr-coding", 40, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const [a, b] = r.shuffle(WORDS).slice(0, 2), k = r.pick([1, 2, 3, -1, -2]);
      return { q: `In a certain code, ${a} is written as ${shiftWord(a, k)}. How is ${b} written in that code?`, ...textOptions(r, shiftWord(b, k), [shiftWord(b, k + 1), shiftWord(b, -k), shiftWord(b, k).split("").reverse().join(""), shiftWord(b, k - 1)]), e: `Each letter is moved ${Math.abs(k)} place(s) ${k > 0 ? "forward" : "backward"} in the alphabet: ${[...a].map((c, j) => `${c}→${shiftWord(a, k)[j]}`).join(", ")}.\nApplying the same to ${b}: **${shiftWord(b, k)}**.`, d: 1 };
    },
    (r) => {
      const [a, b] = r.shuffle(WORDS).slice(0, 2), rev = (w: string) => [...w].reverse().join("");
      return { q: `If ${a} is coded as ${rev(a)}, how is ${b} coded?`, ...textOptions(r, rev(b), [b, shiftWord(rev(b), 1), rev(b).slice(1) + rev(b)[0]]), e: `The letters are written in reverse order. ${b} reversed is **${rev(b)}**.`, d: 1 };
    },
    (r) => {
      const [a, b] = r.shuffle(WORDS).slice(0, 2), opp = (w: string) => [...w].map((c) => L(26 - pos(c))).join("");
      return { q: `In a code language, ${a} is written as ${opp(a)}. How will ${b} be written?`, ...textOptions(r, opp(b), [shiftWord(b, 1), opp(b).split("").reverse().join(""), shiftWord(opp(b), 1)]), e: `Each letter is replaced by its opposite letter (A↔Z, B↔Y, …; positions add up to 27): ${[...a].map((c, j) => `${c}→${opp(a)[j]}`).join(", ")}.\nSo ${b} becomes **${opp(b)}**.`, d: 2 };
    },
    (r) => {
      const [a, b] = r.shuffle(WORDS).slice(0, 2), num = (w: string) => [...w].map(pos).join(" ");
      return { q: `If ${a} is coded as ${num(a)}, what is the code for ${b}?`, ...textOptions(r, num(b), [[...b].map((c) => pos(c) + 1).join(" "), [...b].map((c) => 27 - pos(c)).join(" "), [...b].reverse().map(pos).join(" ")]), e: `Each letter is replaced by its position in the alphabet (A = 1, …, Z = 26).\n${b} → **${num(b)}**.`, d: 1 };
    },
    (r) => {
      const [a, b] = r.shuffle(WORDS).slice(0, 2), sum = (w: string) => [...w].reduce((t, c) => t + pos(c), 0);
      return { q: `If ${a} is coded as ${sum(a)}, how will ${b} be coded?`, ...numOptions(r, sum(b), { wrong: [sum(b) + b.length, sum(b) - 1, sum(a) + sum(b) - sum(a) + 3], step: 3 }), e: `The code is the sum of the letter positions: ${[...a].map(pos).join(" + ")} = ${sum(a)}.\nFor ${b}: ${[...b].map(pos).join(" + ")} = **${sum(b)}**.`, d: 2 };
    },
  ])
);

// ───────────── Ranking and Order ─────────────
export const rankingOrder: RawQ[] = gen("vr-ranking", 32, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const left = r.int(5, 25), right = r.int(5, 25), n = r.pick(NAMES); return { q: `${n} is ${ord(left)} from the left end and ${ord(right)} from the right end of a row of students. How many students are there in the row?`, ...numOptions(r, left + right - 1, { wrong: [left + right, left + right - 2, left + right + 1], step: 1 }), e: `Total = (position from left) + (position from right) − 1 = ${left} + ${right} − 1 = **${left + right - 1}**.\n(${n} is counted in both positions, so subtract 1.)`, d: 1 }; },
    (r) => { const total = r.int(20, 60), top = r.int(3, total - 3), n = r.pick(NAMES); return { q: `In a class of ${total} students, ${n} ranks ${ord(top)} from the top. What is ${n}'s rank from the bottom?`, ...numOptions(r, total - top + 1, { wrong: [total - top, total - top + 2], step: 1 }), e: `Rank from bottom = total − rank from top + 1 = ${total} − ${top} + 1 = **${total - top + 1}**.`, d: 1 }; },
    (r) => { const [a, b] = r.shuffle(NAMES).slice(0, 2), la = r.int(5, 15), rb = r.int(5, 15), between = r.int(2, 8), total = la + between + rb; return { q: `In a row, ${a} is ${ord(la)} from the left and ${b} is ${ord(rb)} from the right. There are ${between} people between them, and ${a} is to the left of ${b}. How many people are in the row?`, ...numOptions(r, total, { wrong: [total - 1, total + 1, la + rb], step: 1 }), e: `People = ${la} (up to and including ${a}) + ${between} (between) + ${rb} (from ${b} to the right end) = **${total}**.`, d: 2 }; },
    (r) => { const total = r.int(30, 60), a = r.int(5, 15), b = r.int(5, 15), mid = total - a - b; if (mid < 1) return null; return { q: `In a row of ${total} children, Meena is ${ord(a)} from the left end and Sunil is ${ord(b)} from the right end. How many children are there between Meena and Sunil?`, ...numOptions(r, mid, { wrong: [mid + 1, mid - 1, mid + 2], step: 1, min: -1 }), e: `Children between them = total − (left position) − (right position) = ${total} − ${a} − ${b} = **${mid}**.`, d: 2 }; },
    (r) => { const [p, q, s, t, u] = r.shuffle(NAMES).slice(0, 5); return { q: `${p} is taller than ${q} but shorter than ${s}. ${t} is the tallest. ${u} is shorter than ${q}. Who is the shortest?`, ...textOptions(r, u, [p, q, s, t]), e: `From the statements: ${t} > ${s} > ${p} > ${q} > ${u}.\nThe shortest is **${u}**.`, d: 2 }; },
  ])
);

// ───────────── Cube and Cuboid ─────────────
export const cubeCuboid: RawQ[] = gen("vr-cube", 30, (r, i) => {
  const n = r.int(3, 8), kind = i % 5;
  const total = n ** 3, three = 8, two = 12 * (n - 2), one = 6 * (n - 2) ** 2, none = (n - 2) ** 3;
  const intro = `A cube of side ${n} cm is painted on all its faces and then cut into small cubes of side 1 cm.`;
  const map = [
    { q: "How many small cubes have exactly three faces painted?", a: three, e: `Only the 8 corner cubes have three painted faces, whatever the size: **8**.` },
    { q: "How many small cubes have exactly two faces painted?", a: two, e: `Cubes with two painted faces lie on the 12 edges, excluding corners: 12 × (${n} − 2) = **${two}**.` },
    { q: "How many small cubes have exactly one face painted?", a: one, e: `Cubes with one painted face lie in the middle of each of the 6 faces: 6 × (${n} − 2)² = **${one}**.` },
    { q: "How many small cubes have no face painted?", a: none, e: `Unpainted cubes form the inner core: (${n} − 2)³ = **${none}**.` },
    { q: "How many small cubes are obtained in all?", a: total, e: `Total = ${n}³ = **${total}**.` },
  ][kind];
  return { q: `${intro} ${map.q}`, ...numOptions(r, map.a, { wrong: [map.a + 6, Math.max(0, map.a - 4), (n - 1) ** 3, 6 * n].filter((v) => v !== map.a), step: Math.max(1, Math.round(map.a / 6)), min: -1 }), e: map.e, d: kind === 0 || kind === 4 ? 1 : 2 };
});

// ───────────── Character Puzzles (missing number) ─────────────
type Rule = { f: (a: number, b: number) => number; text: string };
const RULES: Rule[] = [
  { f: (a, b) => a * b, text: "third = first × second" },
  { f: (a, b) => a + b, text: "third = first + second" },
  { f: (a, b) => a * a + b, text: "third = first² + second" },
  { f: (a, b) => (a + b) * 2, text: "third = 2 × (first + second)" },
  { f: (a, b) => a * b + a, text: "third = first × second + first" },
  { f: (a, b) => a * a - b * b, text: "third = first² − second²" },
];
export const characterPuzzles: RawQ[] = gen("vr-char", 30, (r) => {
  const rule = r.pick(RULES), rows = Array.from({ length: 3 }, () => { const a = r.int(2, 9), b = r.int(1, a - 1); return [a, b, rule.f(a, b)]; });
  if (new Set(rows.map((x) => `${x[0]},${x[1]}`)).size < 3) return null;
  // Reject puzzles where another rule also fits the first two rows but gives a different answer.
  if (RULES.some((o) => o !== rule && rows.slice(0, 2).every(([a, b, c]) => o.f(a, b) === c) && o.f(rows[2][0], rows[2][1]) !== rows[2][2])) return null;
  const ans = rows[2][2];
  const grid = rows.map((row, k) => (k === 2 ? `${row[0]}   ${row[1]}   ?` : row.join("   "))).join("\n");
  return { q: `Find the missing number:\n\`\`\`\n${grid}\n\`\`\``, ...numOptions(r, ans, { wrong: [rows[2][0] + rows[2][1], rows[2][0] * rows[2][1], ans + rows[2][0]].filter((v) => v !== ans), step: 2, min: -1e9 }), e: `In each row, ${rule.text}: ${rows.slice(0, 2).map(([a, b, c]) => `${c} from ${a} and ${b}`).join("; ")}.\nThird row: **${ans}**.`, d: 2 };
});

// ───────────── Classification (letters and numbers) ─────────────
export const classification: RawQ[] = gen("vr-classification", 30, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const k = r.int(1, 3), starts = r.shuffle([0, 3, 6, 9, 12, 15, 18]).slice(0, 4);
      const groups = starts.map((s) => [0, 1, 2].map((j) => L(s + j * k)).join(""));
      const oddIdx = r.int(0, 3), s = starts[oddIdx];
      groups[oddIdx] = [L(s), L(s + k), L(s + 2 * k + 1)].join("");
      return { q: "Choose the group of letters which is different from the others.", ...textOptions(r, groups[oddIdx], groups.filter((_, j) => j !== oddIdx)), e: `In every other group the letters are ${k === 1 ? "consecutive" : `${k} places apart`} (for example ${groups[(oddIdx + 1) % 4]}). In ${groups[oddIdx]} the last gap is ${k + 1}, so **${groups[oddIdx]}** is different.`, d: 2 };
    },
    (r) => {
      const cubes = r.shuffle([8, 27, 64, 125, 216, 343, 512, 729]).slice(0, 3), odd = r.pick([36, 100, 81, 144, 200, 300, 400]);
      return { q: "Choose the number which is different from the others.", ...textOptions(r, String(odd), cubes.map(String)), e: `${cubes.join(", ")} are perfect cubes (${cubes.map((c) => `${Math.round(Math.cbrt(c))}³`).join(", ")}); ${odd} is not a cube.`, d: 1 };
    },
    (r) => {
      const evens = r.shuffle([12, 18, 24, 36, 42, 48, 54, 66, 72, 84, 96]).slice(0, 3), odd = r.pick([15, 21, 33, 45, 57, 63, 75, 87]);
      return { q: "Choose the number which is different from the others.", ...textOptions(r, String(odd), evens.map(String)), e: `${evens.join(", ")} are all divisible by 6; ${odd} is odd, so it is not.`, d: 1 };
    },
    (r) => {
      const pairs = r.shuffle([..."AEIOU"]).slice(0, 3).map((v) => `${v}${L(pos(v))}`);
      const odd = `${r.pick(["B", "C", "D", "F", "G", "H"])}${r.pick(["K", "M", "P"])}`;
      return { q: "Choose the letter pair which is different from the others.", ...textOptions(r, odd, pairs), e: `In ${pairs.join(", ")} the first letter is a vowel and the second letter is the one that follows it. ${odd} does not fit this pattern.`, d: 2 };
    },
  ])
);

// ───────────── Series Completion ─────────────
export const seriesCompletion: RawQ[] = gen("vr-series", 30, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const a = r.int(0, 10); const terms = Array.from({ length: 4 }, (_, j) => `${L(a + 2 * j)}${L(a + 2 * j + 1)}${L(a + 2 * j)}`); return { q: `Complete the series: ${terms.slice(0, 3).join(", ")}, ?`, ...textOptions(r, terms[3], [`${L(a + 6)}${L(a + 6)}${L(a + 7)}`, `${L(a + 7)}${L(a + 8)}${L(a + 7)}`, `${L(a + 6)}${L(a + 8)}${L(a + 6)}`]), e: `Each term is X Y X where X moves 2 letters and Y is the letter after X: ${terms.slice(0, 3).join(", ")} → **${terms[3]}**.`, d: 1 }; },
    (r) => { const a = r.int(1, 9), k = r.int(2, 5); const t = Array.from({ length: 5 }, (_, j) => `${L(a + j)}${a + k * j}`); return { q: `Complete the series: ${t.slice(0, 4).join(", ")}, ?`, ...textOptions(r, t[4], [`${L(a + 4)}${a + k * 4 + 1}`, `${L(a + 5)}${a + k * 4}`, `${L(a + 4)}${a + k * 5}`]), e: `The letters advance by one and the numbers increase by ${k}: so the next term is **${t[4]}**.`, d: 1 }; },
    (r) => { const n = r.int(2, 6); const t = Array.from({ length: 5 }, (_, j) => (n + j) ** 2 + (j % 2 ? 1 : -1)); return { q: `Complete the series: ${t.slice(0, 4).join(", ")}, ?`, ...numOptions(r, t[4], { wrong: [(n + 4) ** 2, (n + 4) ** 2 + 1, t[4] + 2], step: 2 }), e: `The terms are n² − 1 and n² + 1 alternately for n = ${n}, ${n + 1}, …: ${t.slice(0, 4).join(", ")} → ${n + 4}² − 1 = **${t[4]}**.`, d: 2 }; },
    (r) => { const a = r.int(0, 12); const t = Array.from({ length: 4 }, (_, j) => `${L(a + j)}${L(a + j + 13)}`); return { q: `Complete the series: ${t.slice(0, 3).join(", ")}, ?`, ...textOptions(r, t[3], [`${L(a + 3)}${L(a + 15)}`, `${L(a + 4)}${L(a + 16)}`, `${L(a + 16)}${L(a + 3)}`]), e: `Each pair is a letter and the letter 13 places after it: ${t.slice(0, 3).join(", ")} → **${t[3]}**.`, d: 2 }; },
  ])
);

// ───────────── Arithmetic Reasoning ─────────────
export const arithmeticReasoning: RawQ[] = gen("vr-arith", 30, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const hens = r.int(5, 40), cows = r.int(3, 30), heads = hens + cows, legs = 2 * hens + 4 * cows; return { q: `In a farm there are hens and cows. If the heads number ${heads} and the legs number ${legs}, how many hens are there?`, ...numOptions(r, hens, { wrong: [cows, heads / 2, legs / 4], step: 2 }), e: `If all ${heads} were hens there would be ${2 * heads} legs. Each cow adds 2 extra legs: (${legs} − ${2 * heads})/2 = ${cows} cows.\nHens = ${heads} − ${cows} = **${hens}**.`, d: 2 }; },
    (r) => { const n = r.int(10, 40), each = r.int(5, 20), extra = r.int(1, 9), total = n * each - extra; return { q: `A teacher has ${total} chocolates. If she gives ${each} chocolates to each student, she is ${extra} short. How many students are there?`, ...numOptions(r, n, { wrong: [n - 1, Math.floor(total / each), n + 1], step: 1 }), e: `${n} students × ${each} = ${n * each}, which is ${extra} more than ${total}. So there are **${n}** students.`, d: 1 }; },
    (r) => { const k = r.int(5, 30), gap = r.int(2, 8), total = (k - 1) * gap; return { q: `${k} poles are fixed in a straight line, ${gap} m apart. What is the distance between the first and the last pole?`, ...numOptions(r, total, { wrong: [k * gap, (k + 1) * gap], step: gap }), e: `${k} poles have ${k - 1} gaps: ${k - 1} × ${gap} = **${total} m**.`, d: 1 }; },
    (r) => { const strikes = r.int(4, 12), gapSec = r.int(2, 6), t = (strikes - 1) * gapSec, s2 = r.int(strikes + 1, 16); return { q: `A clock takes ${t} seconds to strike ${strikes}. How long will it take to strike ${s2}?`, ...numOptions(r, (s2 - 1) * gapSec, { wrong: [(t / strikes) * s2, s2 * gapSec], step: gapSec }), e: `${strikes} strikes have ${strikes - 1} intervals, so each interval is ${t}/${strikes - 1} = ${gapSec} s.\n${s2} strikes have ${s2 - 1} intervals: ${s2 - 1} × ${gapSec} = **${(s2 - 1) * gapSec} seconds**.`, d: 2 }; },
    (r) => { const price = r.int(5, 20), qty = r.int(3, 12), paid = Math.ceil((price * qty) / 100) * 100, change = paid - price * qty; return { q: `A boy buys ${qty} notebooks at Rs. ${price} each and pays with Rs. ${paid}. How much change does he get?`, ...numOptions(r, change, { prefix: "Rs. ", wrong: [paid - price, change + price], step: 5, min: -1 }), e: `Cost = ${qty} × ${price} = Rs. ${qty * price}.\nChange = ${paid} − ${qty * price} = **Rs. ${change}**.`, d: 1 }; },
  ])
);

// ───────────── Venn Diagrams (figure options) ─────────────
const C = (x: number, y: number, r: number): Fig[number] => ({ k: "circle", x, y, r });
const VENN: Record<string, Fig> = {
  separate: [C(22, 50, 14), C(50, 50, 14), C(78, 50, 14)],
  nested: [C(50, 50, 40), C(50, 52, 26), C(50, 54, 12)],
  twoInside: [C(50, 50, 42), C(34, 54, 13), C(66, 54, 13)],
  threeOverlap: [C(40, 40, 22), C(60, 40, 22), C(50, 60, 22)],
  oneInsideOneOut: [C(34, 50, 26), C(34, 54, 12), C(80, 50, 14)],
  overlapInside: [C(50, 50, 42), C(38, 54, 18), C(62, 54, 18)],
};
const vennQ = (items: string, right: keyof typeof VENN, why: string): RawQ => {
  const keys = Object.keys(VENN) as (keyof typeof VENN)[];
  const others = keys.filter((k) => k !== right).slice(0, 3);
  const order = [right, ...others].sort();
  return { q: `Which diagram best represents the relationship between:\n**${items}**`, o: order.map((_, j) => `Diagram ${"ABCD"[j]}`), a: order.indexOf(right), media: { type: "figs", problem: [], options: order.map((k) => VENN[k]) }, e: why, d: 2 };
};
export const vennDiagrams: RawQ[] = [
  vennQ("Animals, Dogs, Cats", "twoInside", "Dogs and cats are both animals, but no dog is a cat: two separate circles inside one large circle."),
  vennQ("India, Tamil Nadu, Chennai", "nested", "Chennai is in Tamil Nadu, which is in India: three circles one inside another."),
  vennQ("Pens, Rivers, Mountains", "separate", "The three have nothing in common: three separate circles."),
  vennQ("Doctors, Singers, Women", "threeOverlap", "Some women are doctors, some are singers, and some doctors are singers: three mutually overlapping circles."),
  vennQ("Vehicles, Cars, Trees", "oneInsideOneOut", "All cars are vehicles; trees are unrelated to both: one circle inside another, with a separate circle."),
  vennQ("Sports persons, Cricketers, Footballers", "overlapInside", "Cricketers and footballers are sports persons, and some people play both games: two overlapping circles inside a larger one."),
  vennQ("Fruits, Mangoes, Bananas", "twoInside", "Mangoes and bananas are both fruits and no mango is a banana: two separate circles inside one."),
  vennQ("Universe, Solar System, Earth", "nested", "Earth is in the Solar System, which is in the Universe: nested circles."),
  vennQ("Engineers, Graduates, Women", "threeOverlap", "Each pair can overlap: some engineers are women, some women are graduates, most engineers are graduates but not all graduates are engineers. Three overlapping circles best fit."),
  vennQ("Metals, Iron, Plastic", "oneInsideOneOut", "Iron is a metal; plastic is not a metal: iron's circle lies inside metals, plastic is separate."),
];
