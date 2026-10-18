/** Arithmetic Aptitude, part 2: average, area, volume, permutation & combination, numbers, HCF/LCM, decimals, simplification, roots, indices, ratio. */
import type { RawQ, RawSubject } from "../../types";
import { cycle, fmt, frac, gcd, gen, lcm, numOptions, ord, textOptions, topic } from "../build";

const N = 60;
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const nCr = (n: number, k: number) => Math.round(fact(n) / (fact(k) * fact(n - k)));
const nPr = (n: number, k: number) => Math.round(fact(n) / fact(n - k));

// ───────────────────────── Average ─────────────────────────
const average = gen("average", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const k = r.int(5, 7), nums = Array.from({ length: k }, () => r.int(10, 99));
      const sum = nums.reduce((a, b) => a + b, 0);
      if (sum % k) return null;
      return { q: `Find the average of ${nums.slice(0, -1).join(", ")} and ${nums[k - 1]}.`, ...numOptions(r, sum / k, { wrong: [sum / (k - 1), sum / (k + 1)], step: 2 }), e: `Sum = ${sum}, count = ${k}.\nAverage = ${sum}/${k} = **${sum / k}**.`, check: `(${nums.join("+")})/${k}`, d: 1 };
    },
    (r) => {
      const n = r.int(10, 80), kind = r.pick(["natural numbers", "odd numbers", "even numbers"]);
      const avg = kind === "natural numbers" ? (n + 1) / 2 : kind === "odd numbers" ? n : n + 1;
      return { q: `What is the average of the first ${n} ${kind}?`, ...numOptions(r, avg, { wrong: [n / 2, avg + 1, n * (n + 1) / 2 / (n + 1)], step: 1 }), e: kind === "natural numbers" ? `Sum of the first n natural numbers = n(n + 1)/2, so the average = (n + 1)/2 = ${n + 1}/2 = **${fmt(avg)}**.` : kind === "odd numbers" ? `Sum of the first n odd numbers = n², so the average = n = **${n}**.` : `Sum of the first n even numbers = n(n + 1), so the average = n + 1 = **${n + 1}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(5, 20), A = r.int(20, 60), B = A + r.int(1, 5), x = (n + 1) * B - n * A;
      return { q: `The average of ${n} numbers is ${A}. When one more number is added, the average becomes ${B}. What is the new number?`, ...numOptions(r, x, { wrong: [B + (B - A), x - B, n * (B - A)], step: 2 }), e: `New total − old total = ${n + 1} × ${B} − ${n} × ${A} = ${(n + 1) * B} − ${n * A} = **${x}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(5, 12), w = r.int(45, 75), d = r.pick([1, 1.5, 2, 2.5, 3]), x = w + n * d;
      if (!Number.isInteger(x * 2)) return null;
      return { q: `The average weight of ${n} persons increases by ${d} kg when a new person replaces one of them weighing ${w} kg. What is the weight of the new person?`, ...numOptions(r, x, { unit: "kg", wrong: [w + d, w + (n - 1) * d, w - n * d], step: 2 }), e: `Total weight increases by ${n} × ${d} = ${fmt(n * d)} kg.\nNew person = ${w} + ${fmt(n * d)} = **${fmt(x)} kg**.`, d: 2 };
    },
    (r) => {
      const n = r.int(8, 20), A = r.int(25, 45), s = A + n + r.int(5, 40), newA = (n * A + s) / (n + 1);
      if (!Number.isInteger(newA)) return null;
      return { q: `A batsman has a certain average after ${n} innings. In the ${ord(n + 1)} innings he scores ${s} runs and thereby increases his average by ${newA - A}. What is his average after the ${ord(n + 1)} innings?`, ...numOptions(r, newA, { wrong: [A, s - n, s / (n + 1)], step: 2 }), e: `Let the average after ${n + 1} innings be x. Then ${n}(x − ${newA - A}) + ${s} = ${n + 1}x ⇒ x = ${s} − ${n} × ${newA - A} = **${newA}**.`, d: 2 };
    },
    (r) => {
      const n1 = r.int(20, 50), a1 = r.int(40, 70), n2 = r.int(20, 50), a2 = r.int(40, 70), avg = (n1 * a1 + n2 * a2) / (n1 + n2);
      return { q: `The average marks of a class of ${n1} students is ${a1} and that of another class of ${n2} students is ${a2}. What is the average of all the students together?`, ...numOptions(r, avg, { wrong: [(a1 + a2) / 2], step: 1.5 }), e: `Combined average = (${n1} × ${a1} + ${n2} × ${a2})/(${n1} + ${n2}) = ${n1 * a1 + n2 * a2}/${n1 + n2} = **${fmt(avg)}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Area ─────────────────────────
const area = gen("area", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const l = r.int(8, 60), b = r.int(5, l - 1);
      return { q: `A rectangle is ${l} m long and ${b} m wide. What is its area?`, ...numOptions(r, l * b, { unit: "sq. m", wrong: [2 * (l + b), l * b * 2, (l + b) ** 2 / 4], step: Math.max(5, Math.round(l * b / 10)) }), e: `Area of a rectangle = length × breadth = ${l} × ${b} = **${l * b} sq. m**.`, d: 1 };
    },
    (r) => {
      const d = r.int(4, 30);
      return { q: `What is the area of a square whose diagonal is ${d} cm?`, ...numOptions(r, (d * d) / 2, { unit: "sq. cm", wrong: [d * d, d * d / 4], step: 4 }), e: `Area of a square = (diagonal)²/2 = ${d}²/2 = ${d * d}/2 = **${fmt((d * d) / 2)} sq. cm**.`, d: 1 };
    },
    (r) => {
      const rad = 7 * r.int(1, 6), A = (22 / 7) * rad * rad, C = 2 * (22 / 7) * rad;
      return r.chance(0.5)
        ? { q: `Find the area of a circle of radius ${rad} cm. (Take π = 22/7)`, ...numOptions(r, A, { unit: "sq. cm", wrong: [C, A * 2, (22 / 7) * rad], step: A / 10 }), e: `Area = πr² = 22/7 × ${rad} × ${rad} = **${fmt(A)} sq. cm**.`, d: 1 }
        : { q: `Find the circumference of a circle of radius ${rad} cm. (Take π = 22/7)`, ...numOptions(r, C, { unit: "cm", wrong: [A, C / 2, C * 2], step: 11 }), e: `Circumference = 2πr = 2 × 22/7 × ${rad} = **${fmt(C)} cm**.`, d: 1 };
    },
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [13, 14, 15], [10, 13, 13], [5, 5, 6], [5, 5, 8], [9, 10, 17]] as [number, number, number][]);
      const k = r.int(1, 4), [x, y, z] = [a * k, b * k, c * k], s = (x + y + z) / 2, A = Math.sqrt(s * (s - x) * (s - y) * (s - z));
      if (!Number.isInteger(A)) return null;
      return { q: `Find the area of a triangle whose sides are ${x} cm, ${y} cm and ${z} cm.`, ...numOptions(r, A, { unit: "sq. cm", wrong: [(x * y) / 2 === A ? x * z / 2 : (x * y) / 2, x + y + z, A * 2], step: Math.max(2, Math.round(A / 8)) }), e: `s = (${x} + ${y} + ${z})/2 = ${s}.\nArea = √[s(s − a)(s − b)(s − c)] = √[${s} × ${s - x} × ${s - y} × ${s - z}] = √${s * (s - x) * (s - y) * (s - z)} = **${A} sq. cm**.`, d: 2 };
    },
    (r) => {
      const p = r.pick([10, 20, 25, 50]), inc = 2 * p + (p * p) / 100;
      return { q: `If each side of a square is increased by ${p}%, by what percent does its area increase?`, ...numOptions(r, inc, { unit: "%", wrong: [p, 2 * p, p * p / 10], step: 5 }), e: `New side = ${(100 + p) / 100}a, so new area = ${fmt(((100 + p) / 100) ** 2)}a².\nIncrease = 2 × ${p} + ${p}²/100 = **${fmt(inc)}%**.`, d: 2 };
    },
    (r) => {
      const l = r.int(20, 80), b = r.int(10, l - 5), w = r.pick([1, 2, 2.5, 3, 3.5, 4]), A = (l + 2 * w) * (b + 2 * w) - l * b;
      return { q: `A rectangular garden ${l} m × ${b} m has a path ${w} m wide all around it on the outside. What is the area of the path?`, ...numOptions(r, A, { unit: "sq. m", wrong: [2 * w * (l + b), (l + w) * (b + w) - l * b, A + 4 * w * w], step: w * 8 }), e: `Outer dimensions = ${fmt(l + 2 * w)} m × ${fmt(b + 2 * w)} m.\nArea of path = ${fmt(l + 2 * w)} × ${fmt(b + 2 * w)} − ${l} × ${b} = ${fmt((l + 2 * w) * (b + 2 * w))} − ${l * b} = **${fmt(A)} sq. m**.\n(Shortcut: 2w(l + b + 2w).)`, d: 2 };
    },
    (r) => {
      const l = r.int(10, 50), b = r.int(5, l), P = 2 * (l + b);
      return { q: `The perimeter of a rectangle is ${P} m and its length is ${l} m. What is its area?`, ...numOptions(r, l * b, { unit: "sq. m", wrong: [l * (P / 2), l * (P - l) / 2 - l, P * l / 4], step: Math.max(5, Math.round(l * b / 12)) }), e: `Breadth = P/2 − l = ${P / 2} − ${l} = ${b} m.\nArea = ${l} × ${b} = **${l * b} sq. m**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Volume and Surface Area ─────────────────────────
const volume = gen("volume", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(2, 15);
      return r.chance(0.5)
        ? { q: `What is the volume of a cube of edge ${a} cm?`, ...numOptions(r, a ** 3, { unit: "cu. cm", wrong: [6 * a * a, a * a, 3 * a], step: Math.max(4, Math.round(a ** 3 / 10)) }), e: `Volume of a cube = a³ = ${a}³ = **${a ** 3} cu. cm**.`, d: 1 }
        : { q: `What is the total surface area of a cube of edge ${a} cm?`, ...numOptions(r, 6 * a * a, { unit: "sq. cm", wrong: [a ** 3, 4 * a * a, 12 * a], step: 6 }), e: `Total surface area of a cube = 6a² = 6 × ${a * a} = **${6 * a * a} sq. cm**.`, d: 1 };
    },
    (r) => {
      const l = r.int(4, 20), b = r.int(3, 15), h = r.int(2, 12);
      return { q: `Find the total surface area of a cuboid ${l} cm × ${b} cm × ${h} cm.`, ...numOptions(r, 2 * (l * b + b * h + h * l), { unit: "sq. cm", wrong: [l * b * h, l * b + b * h + h * l, 2 * h * (l + b)], step: 10 }), e: `TSA = 2(lb + bh + hl) = 2(${l * b} + ${b * h} + ${h * l}) = **${2 * (l * b + b * h + h * l)} sq. cm**.`, d: 1 };
    },
    (r) => {
      const rad = 7 * r.int(1, 3), h = r.int(2, 20), V = (22 / 7) * rad * rad * h;
      return { q: `Find the volume of a cylinder of radius ${rad} cm and height ${h} cm. (π = 22/7)`, ...numOptions(r, V, { unit: "cu. cm", wrong: [2 * (22 / 7) * rad * h, V / 3], step: V / 10 }), e: `Volume = πr²h = 22/7 × ${rad}² × ${h} = **${fmt(V)} cu. cm**.`, d: 1 };
    },
    (r) => {
      const rad = 7 * r.int(1, 3), h = 3 * r.int(2, 10), V = ((22 / 7) * rad * rad * h) / 3;
      return { q: `Find the volume of a cone of base radius ${rad} cm and height ${h} cm. (π = 22/7)`, ...numOptions(r, V, { unit: "cu. cm", wrong: [V * 3, V / 2], step: V / 8 }), e: `Volume = (1/3)πr²h = 1/3 × 22/7 × ${rad}² × ${h} = **${fmt(V)} cu. cm**.`, d: 1 };
    },
    (r) => {
      const rad = 7 * r.int(1, 3) / (r.chance(0.5) ? 1 : 2), V = (4 / 3) * (22 / 7) * rad ** 3, S = 4 * (22 / 7) * rad * rad;
      return r.chance(0.5)
        ? { q: `Find the surface area of a sphere of radius ${fmt(rad)} cm. (π = 22/7)`, ...numOptions(r, S, { unit: "sq. cm", wrong: [V, S / 2, 3 * (22 / 7) * rad * rad], step: S / 10 }), e: `Surface area = 4πr² = 4 × 22/7 × ${fmt(rad)}² = **${fmt(S)} sq. cm**.`, d: 1 }
        : { q: `Find the volume of a sphere of radius ${fmt(rad)} cm. (π = 22/7)`, ...numOptions(r, V, { unit: "cu. cm", wrong: [S, V * 3 / 4, V / 2], step: V / 10 }), e: `Volume = (4/3)πr³ = 4/3 × 22/7 × ${fmt(rad)}³ = **${fmt(V)} cu. cm**.`, d: 1 };
    },
    (r) => {
      const big = r.pick([6, 8, 9, 10, 12, 15, 16, 20]), small = r.pick([1, 2, 3, 4, 5].filter((s) => big % s === 0 && s < big)), n = (big / small) ** 3;
      return { q: `How many cubes of edge ${small} cm can be cut from a cube of edge ${big} cm?`, ...numOptions(r, n, { wrong: [big / small, (big / small) ** 2, n * 2], step: Math.max(2, Math.round(n / 8)) }), e: `Number = (${big}/${small})³ = ${big / small}³ = **${n}**.`, d: 1 };
    },
    (r) => {
      const R = r.pick([6, 8, 9, 10, 12]), rr = r.pick([1, 2, 3].filter((x) => R % x === 0)), n = (R / rr) ** 3;
      return { q: `A solid metal sphere of radius ${R} cm is melted and recast into small spheres of radius ${rr} cm. How many small spheres are obtained?`, ...numOptions(r, n, { wrong: [(R / rr) ** 2, R / rr, n / 2], step: Math.max(2, Math.round(n / 8)) }), e: `Volume is conserved: number = (4/3 π ${R}³)/(4/3 π ${rr}³) = (${R}/${rr})³ = **${n}**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Permutation and Combination ─────────────────────────
const WORDS = ["LEADER", "BANANA", "APPLE", "SUCCESS", "LETTER", "COFFEE", "DESIGN", "CORPORATION", "OPTICAL", "MOTHER", "BALLOON", "ARRANGE", "PENCIL", "GARDEN", "TABLE", "PRAISE", "LOGIC", "STREAM", "WINDOW", "EXCELLENT"];
const pnc = gen("pnc", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const n = r.int(5, 12), k = r.int(2, 4);
      return { q: `Evaluate ${n}P${k}.`, ...numOptions(r, nPr(n, k), { wrong: [nCr(n, k), n ** k], step: Math.max(1, Math.round(nPr(n, k) / 10)) }), e: `ⁿPᵣ = n!/(n − r)! = ${n}!/${n - k}! = ${Array.from({ length: k }, (_, j) => n - j).join(" × ")} = **${nPr(n, k)}**.`, check: `perm(${n},${k})`, d: 1 };
    },
    (r) => {
      const n = r.int(6, 15), k = r.int(2, 5);
      return { q: `Evaluate ${n}C${k}.`, ...numOptions(r, nCr(n, k), { wrong: [nPr(n, k), nCr(n, k - 1)], step: Math.max(1, Math.round(nCr(n, k) / 10)) }), e: `ⁿCᵣ = n!/(r!(n − r)!) = ${nPr(n, k)}/${fact(k)} = **${nCr(n, k)}**.`, check: `comb(${n},${k})`, d: 1 };
    },
    (r) => {
      const w = r.pick(WORDS), counts = [...w].reduce<Record<string, number>>((a, c) => ((a[c] = (a[c] ?? 0) + 1), a), {});
      const reps = Object.entries(counts).filter(([, c]) => c > 1);
      let ans = fact(w.length);
      for (const [, c] of reps) ans /= fact(c);
      if (ans > 5_000_000) return null;
      return { q: `In how many different ways can the letters of the word '${w}' be arranged?`, ...numOptions(r, ans, { wrong: [fact(w.length), ans * 2, ans / 2], step: Math.max(1, Math.round(ans / 10)) }), e: `'${w}' has ${w.length} letters${reps.length ? `, with ${reps.map(([c, k]) => `${c} repeated ${k} times`).join(", ")}` : ", all different"}.\nArrangements = ${w.length}!${reps.length ? `/(${reps.map(([, k]) => `${k}!`).join(" × ")})` : ""} = **${fmt(ans)}**.`, check: `factorial(${w.length})${reps.map(([, k]) => `//factorial(${k})`).join("")}`, d: 2 };
    },
    (r) => {
      const men = r.int(5, 9), women = r.int(4, 8), km = r.int(2, 3), kw = r.int(1, 3), ans = nCr(men, km) * nCr(women, kw);
      return { q: `From ${men} men and ${women} women, a committee of ${km + kw} is to be formed with exactly ${km} men and ${kw} ${kw === 1 ? "woman" : "women"}. In how many ways can it be done?`, ...numOptions(r, ans, { wrong: [nCr(men + women, km + kw), nCr(men, km) + nCr(women, kw), nPr(men, km) * nPr(women, kw)], step: Math.max(5, Math.round(ans / 10)) }), e: `Choose the men in ${men}C${km} = ${nCr(men, km)} ways and the women in ${women}C${kw} = ${nCr(women, kw)} ways.\nTotal = ${nCr(men, km)} × ${nCr(women, kw)} = **${ans}**.`, check: `comb(${men},${km})*comb(${women},${kw})`, d: 2 };
    },
    (r) => {
      const n = r.int(5, 30);
      return r.chance(0.5)
        ? { q: `${n} people are at a party and each person shakes hands with every other person exactly once. How many handshakes take place?`, ...numOptions(r, nCr(n, 2), { wrong: [n * (n - 1), n * n / 2], step: Math.max(2, n) }), e: `Each handshake is a pair of people: ${n}C2 = ${n} × ${n - 1}/2 = **${nCr(n, 2)}**.`, check: `comb(${n},2)`, d: 1 }
        : { q: `How many diagonals does a polygon with ${n} sides have?`, ...numOptions(r, (n * (n - 3)) / 2, { wrong: [nCr(n, 2), n * (n - 3)], step: Math.max(2, n) }), e: `Number of diagonals = nC2 − n = n(n − 3)/2 = ${n} × ${n - 3}/2 = **${(n * (n - 3)) / 2}**.`, d: 2 };
    },
    (r) => {
      const w = r.pick(["LEADING", "PENCIL", "DIRECTOR", "MOBILE", "SOFTWARE", "CAPTAIN", "SUNDAY", "ORANGE"].filter((x) => new Set(x).size === x.length));
      if (!w) return null;
      const vowels = [...w].filter((c) => "AEIOU".includes(c)).length, units = w.length - vowels + 1, ans = fact(units) * fact(vowels);
      return { q: `In how many ways can the letters of the word '${w}' be arranged so that the vowels always come together?`, ...numOptions(r, ans, { wrong: [fact(w.length), fact(units), fact(w.length) - ans], step: Math.max(10, Math.round(ans / 10)) }), e: `'${w}' has ${vowels} vowels. Treat them as one unit: ${units} units can be arranged in ${units}! = ${fact(units)} ways, and the vowels among themselves in ${vowels}! = ${fact(vowels)} ways.\nTotal = ${fact(units)} × ${fact(vowels)} = **${fmt(ans)}**.`, check: `factorial(${units})*factorial(${vowels})`, d: 3 };
    },
    (r) => {
      const n = r.int(4, 9);
      return { q: `In how many ways can ${n} people be seated around a circular table?`, ...numOptions(r, fact(n - 1), { wrong: [fact(n), fact(n - 1) / 2], step: Math.max(1, Math.round(fact(n - 1) / 10)) }), e: `In a circular arrangement one seat is fixed as reference, so the number of arrangements is (n − 1)! = ${n - 1}! = **${fmt(fact(n - 1))}**.`, check: `factorial(${n - 1})`, d: 2 };
    },
  ])
);

// ───────────────────────── Numbers ─────────────────────────
const unitDigitCycle = (b: number) => { const out: number[] = []; let x = b % 10; for (let k = 0; k < 4; k++) { out.push(x); x = (x * b) % 10; } return out; };
const numbers = gen("numbers", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const b = r.int(2, 99), e = r.int(20, 999), cyc = unitDigitCycle(b), ud = cyc[(e - 1) % 4];
      return { q: `What is the unit digit of ${b}^${e}^?`, ...textOptions(r, String(ud), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), e: `Unit digits of powers of ${b % 10} repeat in the cycle ${cyc.join(", ")} (period at most 4).\n${e} ÷ 4 leaves remainder ${e % 4}${e % 4 === 0 ? " (take it as 4)" : ""}, so the unit digit is position ${((e - 1) % 4) + 1} of the cycle = **${ud}**.`, check: `pow(${b},${e},10)`, d: 2 };
    },
    (r) => {
      const digits = Array.from({ length: 5 }, () => r.int(0, 9));
      digits[0] = r.int(1, 9);
      const pos = r.int(1, 3), sumOthers = digits.reduce((a, d, k) => (k === pos ? a : a + d), 0), x = (9 - (sumOthers % 9)) % 9;
      const shown = digits.map((d, k) => (k === pos ? "*" : String(d))).join("");
      return { q: `What is the smallest digit that can replace * so that ${shown} is divisible by 9?`, ...textOptions(r, String(x), ["0", "1", "2", "3", "4", "5", "6", "7", "8"]), e: `A number is divisible by 9 when its digit sum is divisible by 9.\nSum of the known digits = ${sumOthers}; the next multiple of 9 is ${sumOthers + x}, so * = **${x}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(10, 200);
      return { q: `What is the sum of all natural numbers from 1 to ${n}?`, ...numOptions(r, (n * (n + 1)) / 2, { wrong: [n * n / 2, n * (n - 1) / 2], step: n }), e: `1 + 2 + … + n = n(n + 1)/2 = ${n} × ${n + 1}/2 = **${fmt((n * (n + 1)) / 2)}**.`, check: `${n}*(${n}+1)//2`, d: 1 };
    },
    (r) => {
      const n = r.pick([12, 18, 24, 36, 48, 60, 72, 84, 90, 96, 100, 120, 144, 180, 200, 210, 240, 360]);
      let count = 0; for (let k = 1; k <= n; k++) if (n % k === 0) count++;
      const fac: Record<number, number> = {}; let x = n; for (let p = 2; x > 1; p++) while (x % p === 0) { fac[p] = (fac[p] ?? 0) + 1; x /= p; }
      return { q: `How many factors (divisors) does ${n} have?`, ...numOptions(r, count, { wrong: [count - 2, count + 2, Object.keys(fac).length * 2], step: 1 }), e: `${n} = ${Object.entries(fac).map(([p, e]) => (e > 1 ? `${p}^${e}^` : p)).join(" × ")}.\nNumber of factors = ${Object.values(fac).map((e) => `(${e} + 1)`).join(" × ")} = **${count}**.`, d: 2 };
    },
    (r) => {
      const d = r.int(7, 29), q = r.int(10, 99), rem = r.int(1, d - 1), n = d * q + rem;
      return { q: `What is the remainder when ${n} is divided by ${d}?`, ...textOptions(r, String(rem), Array.from({ length: d }, (_, k) => String(k)).filter((k) => k !== String(rem))), e: `${n} = ${d} × ${q} + ${rem}, so the remainder is **${rem}**.`, check: `${n}%${d}`, d: 1 };
    },
    (r) => {
      const digits = String(r.int(100000, 999999)), pos = r.int(0, 5), digit = Number(digits[pos]), place = 10 ** (5 - pos);
      if (digit === 0) return null;
      return { q: `What is the difference between the place value and the face value of ${digit} in ${Number(digits).toLocaleString("en-IN")}?`, ...numOptions(r, digit * place - digit, { wrong: [digit * place, place - digit, digit * place / 10 - digit], step: digit * place / 10 }), e: `Place value of ${digit} = ${digit} × ${place.toLocaleString("en-IN")} = ${(digit * place).toLocaleString("en-IN")}; face value = ${digit}.\nDifference = **${(digit * place - digit).toLocaleString("en-IN")}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(1000, 9999), ok = [2, 3, 4, 5, 6, 8, 9, 11].filter((k) => n % k === 0);
      if (!ok.length) return null;
      const right = r.pick(ok), wrongs = [2, 3, 4, 5, 6, 8, 9, 11].filter((k) => n % k !== 0).map(String);
      if (wrongs.length < 3) return null;
      return { q: `${n} is divisible by which of the following?`, ...textOptions(r, String(right), wrongs), e: `${n} ÷ ${right} = ${n / right}, with no remainder. ${wrongs.slice(0, 3).map((w) => `${n} ÷ ${w} leaves remainder ${n % Number(w)}`).join("; ")}.`, d: 1 };
    },
  ])
);

// ───────────────────────── Problems on Numbers ─────────────────────────
const problemsOnNumbers = gen("problems-numbers", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(10, 90), b = r.int(5, a - 1);
      return { q: `The sum of two numbers is ${a + b} and their difference is ${a - b}. What is the larger number?`, ...numOptions(r, a, { wrong: [b, (a + b) / 2, a - b], step: 2 }), e: `Larger = (sum + difference)/2 = (${a + b} + ${a - b})/2 = **${a}**.`, d: 1 };
    },
    (r) => {
      const x = r.int(2, 9), y = r.int(0, 9);
      if (x === y) return null;
      const n = 10 * x + y, rev = 10 * y + x;
      return { q: `The difference between a two-digit number and the number obtained by interchanging its digits is ${Math.abs(n - rev)}. What is the difference between the two digits?`, ...numOptions(r, Math.abs(x - y), { wrong: [Math.abs(n - rev) / 11, x + y, Math.abs(x - y) + 1], step: 1, min: 0 }), e: `(10x + y) − (10y + x) = 9(x − y).\n9 × (difference of digits) = ${Math.abs(n - rev)} ⇒ difference = **${Math.abs(x - y)}**.`, d: 1 };
    },
    (r) => {
      const x = r.int(3, 30), k = r.int(2, 5), c = r.int(2, 20);
      return { q: `When ${k} times a number is increased by ${c}, the result is ${k * x + c}. What is the number?`, ...numOptions(r, x, { wrong: [(k * x + c) / k, x + c, k * x], step: 1 }), e: `${k}x + ${c} = ${k * x + c} ⇒ ${k}x = ${k * x} ⇒ x = **${x}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(3, 25), b = r.int(3, 25);
      if (a === b) return null;
      return { q: `The sum of two numbers is ${a + b} and their product is ${a * b}. What is the sum of their squares?`, ...numOptions(r, a * a + b * b, { wrong: [(a + b) ** 2, (a + b) ** 2 + 2 * a * b, a * b * 2], step: 10 }), e: `a² + b² = (a + b)² − 2ab = ${(a + b) ** 2} − ${2 * a * b} = **${a * a + b * b}**.`, d: 2 };
    },
    (r) => {
      const x = r.int(6, 40), p = r.pick([2, 3, 4, 5]), q = r.pick([3, 4, 5, 6, 7].filter((v) => v > p));
      if (!q || (x * p) % q) return null;
      const y = (x * p) / q;
      return { q: `Two numbers are such that ${p}/${q} of the first equals the second. If the first is ${x}, what is the sum of the numbers?`, ...numOptions(r, x + y, { wrong: [x + (x * q) / p, x * 2, y * 2], step: 2 }), e: `Second = ${p}/${q} × ${x} = ${y}. Sum = ${x} + ${y} = **${x + y}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(3, 30), s = n + (n + 1) + (n + 2);
      return { q: `The sum of three consecutive integers is ${s}. What is the largest of them?`, ...numOptions(r, n + 2, { wrong: [n, n + 1, n + 3], step: 1 }), e: `Let them be x − 1, x, x + 1. Their sum is 3x = ${s}, so x = ${n + 1} and the largest is **${n + 2}**.`, d: 1 };
    },
    (r) => {
      const x = r.int(4, 30);
      return { q: `A number exceeds its one-fifth by ${(4 * x * 5) / 5}. What is the number?`, ...numOptions(r, 5 * x, { wrong: [4 * x, 6 * x, x], step: 5 }), e: `x − x/5 = ${4 * x} ⇒ 4x/5 = ${4 * x} ⇒ x = **${5 * x}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── H.C.F and L.C.M ─────────────────────────
const hcfLcm = gen("hcf-lcm", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const g = r.int(2, 30), a = g * r.int(2, 9), b = g * r.int(2, 9), c = g * r.int(2, 9), h = gcd(gcd(a, b), c);
      if (new Set([a, b, c]).size < 3) return null;
      return { q: `Find the H.C.F. of ${a}, ${b} and ${c}.`, ...numOptions(r, h, { wrong: [h * 2, h / 2, Math.min(a, b, c)].filter((x) => Number.isInteger(x)), step: Math.max(1, Math.round(h / 3)) }), e: `By prime factorisation or repeated division, the greatest number that divides ${a}, ${b} and ${c} exactly is **${h}**.`, check: `gcd(gcd(${a},${b}),${c})`, d: 1 };
    },
    (r) => {
      const a = r.int(4, 40), b = r.int(4, 40), c = r.int(2, 30), L = lcm(lcm(a, b), c);
      if (L > 5000 || new Set([a, b, c]).size < 3) return null;
      return { q: `Find the L.C.M. of ${a}, ${b} and ${c}.`, ...numOptions(r, L, { wrong: [a * b * c === L ? L * 2 : a * b * c, L / 2, L * 2].filter((x) => Number.isInteger(x)), step: Math.max(2, Math.round(L / 6)) }), e: `L.C.M. is the smallest number divisible by ${a}, ${b} and ${c}: **${L}**.`, check: `lcm(lcm(${a},${b}),${c})`, d: 1 };
    },
    (r) => {
      const g = r.int(2, 20), x = r.int(2, 12), y = r.int(2, 12);
      if (gcd(x, y) !== 1 || x === y) return null;
      const a = g * x, b = g * y, L = g * x * y;
      return { q: `The H.C.F. of two numbers is ${g} and their L.C.M. is ${L}. If one of the numbers is ${a}, what is the other?`, ...numOptions(r, b, { wrong: [L / g, L - a, (L * g) / a / 2].filter((v) => Number.isInteger(v)), step: g }), e: `Product of two numbers = H.C.F. × L.C.M.\nOther number = (${g} × ${L})/${a} = **${b}**.`, d: 2 };
    },
    (r) => {
      const h = r.int(3, 30), rs = [r.int(3, 20), r.int(3, 20), r.int(3, 20)].map((k) => h * k), base = r.int(1, h - 1);
      const nums = rs.map((v) => v + base), d = gcd(gcd(nums[1] - nums[0], nums[2] - nums[1]), nums[2] - nums[0]);
      if (new Set(nums).size < 3 || d < 2) return null;
      return { q: `Find the greatest number that divides ${nums.join(", ")} leaving the same remainder in each case.`, ...numOptions(r, Math.abs(d), { wrong: [gcd(gcd(nums[0], nums[1]), nums[2]), Math.abs(d) * 2, Math.abs(d) / 2].filter((v) => Number.isInteger(v) && v > 0), step: Math.max(1, Math.round(Math.abs(d) / 3)) }), e: `If the remainders are equal, the number divides the differences: ${Math.abs(nums[1] - nums[0])}, ${Math.abs(nums[2] - nums[1])} and ${Math.abs(nums[2] - nums[0])}.\nH.C.F. of the differences = **${Math.abs(d)}**.`, d: 3 };
    },
    (r) => {
      const ds = r.shuffle([4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20]).slice(0, 3), L = ds.reduce(lcm), rem = r.int(1, Math.min(...ds) - 1);
      return { q: `What is the least number which, when divided by ${ds.join(", ")}, leaves a remainder ${rem} in each case?`, ...numOptions(r, L + rem, { wrong: [L, L - rem, ds.reduce((a, b) => a * b) + rem], step: Math.max(2, Math.round(L / 5)) }), e: `L.C.M. of ${ds.join(", ")} = ${L}.\nRequired number = ${L} + ${rem} = **${L + rem}**.`, d: 2 };
    },
    (r) => {
      const ivs = r.shuffle([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20]).slice(0, 3), L = ivs.reduce(lcm);
      if (L > 360) return null;
      return { q: `Three bells toll at intervals of ${ivs.join(", ")} minutes. If they toll together now, after how many minutes will they next toll together?`, ...numOptions(r, L, { wrong: [ivs.reduce((a, b) => a + b), ivs.reduce((a, b) => a * b), L * 2], step: Math.max(2, Math.round(L / 5)) }), e: `They toll together after L.C.M.(${ivs.join(", ")}) = **${L} minutes**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Decimal Fraction ─────────────────────────
const decimals = gen("decimals", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const ab = r.int(1, 98), num = ab, den = 99, s = String(ab).padStart(2, "0");
      if (s[0] === s[1]) return null; // 0.11… is really 0.1 recurring
      return { q: `Express 0.${s}${s}${s}… (i.e. 0.${s} recurring) as a fraction.`, ...textOptions(r, frac(num, den), [frac(num, 100), frac(num, 90), frac(num + 1, 99), frac(num, 999)]), e: `For a pure recurring decimal, write the repeating block over as many 9s as it has digits: 0.${s}… = ${s}/99 = **${frac(num, den)}**.`, d: 2 };
    },
    (r) => {
      const a = r.int(1, 9), b = r.int(1, 99), da = r.int(1, 3), db = r.int(1, 3), p = a * b, dp = da + db;
      const val = p / 10 ** dp, A = a / 10 ** da, B = b / 10 ** db;
      return { q: `${A} × ${B} = ?`, ...textOptions(r, String(Number(val.toFixed(dp))), [String(Number((val * 10).toFixed(dp))), String(Number((val / 10).toFixed(dp + 1))), String(Number((val * 100).toFixed(dp)))]), e: `Multiply as whole numbers: ${a} × ${b} = ${p}.\nDecimal places = ${da} + ${db} = ${dp}, so the product is **${Number(val.toFixed(dp))}**.`, d: 1 };
    },
    (r) => {
      const fracs = r.shuffle([[2, 3], [3, 5], [4, 7], [5, 9], [7, 11], [5, 8], [7, 12], [3, 4], [9, 13]] as [number, number][]).slice(0, 4);
      const best = fracs.reduce((x, y) => (x[0] / x[1] > y[0] / y[1] ? x : y));
      return { q: `Which is the largest of the fractions ${fracs.map(([a, b]) => `${a}/${b}`).join(", ")}?`, o: fracs.map(([a, b]) => `${a}/${b}`), a: fracs.indexOf(best), e: `Decimal values: ${fracs.map(([a, b]) => `${a}/${b} = ${(a / b).toFixed(3)}`).join(", ")}.\nThe largest is **${best[0]}/${best[1]}**.`, d: 2 };
    },
    (r) => {
      const n = r.int(11, 99) / 100, k = r.pick([0.1, 0.01, 0.001, 0.2, 0.5, 0.25]), v = n / k;
      return { q: `${n} ÷ ${k} = ?`, ...textOptions(r, String(Number(v.toFixed(4))), [String(Number((v * 10).toFixed(4))), String(Number((v / 10).toFixed(4))), String(Number((n * k).toFixed(4)))]), e: `Multiply both by the power of 10 that clears the divisor's decimals: ${n} ÷ ${k} = **${Number(v.toFixed(4))}**.`, check: `${n}/${k}`, d: 1 };
    },
    (r) => {
      const a = r.int(1, 999), b = r.pick([1000, 100, 10000]);
      return { q: `Convert ${a}/${b} into a decimal.`, ...textOptions(r, String(a / b), [String(a / (b / 10)), String(a / (b * 10)), String((a / b) * 100)]), e: `Dividing by ${b} moves the decimal point ${String(b).length - 1} places left: **${a / b}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(1, 9) / 10, b = r.int(1, 9) / 100, c = r.int(1, 9) / 1000, s = Number((a + b + c).toFixed(3));
      return { q: `${a} + ${b} + ${c} = ?`, ...textOptions(r, String(s), [String(Number((a + b * 10 + c * 100).toFixed(3))), String(Number((a + b + c * 10).toFixed(3))), String(Number((a * 10 + b + c).toFixed(3)))]), e: `Line up the decimal points:\n${a.toFixed(3)} + ${b.toFixed(3)} + ${c.toFixed(3)} = **${s}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Simplification ─────────────────────────
const simplification = gen("simplification", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(10, 99), b = r.int(2, 12), c = r.int(2, 12), e = r.int(2, 9), d = e * r.int(2, 12), v = a + b * c - d / e;
      return { q: `Simplify: ${a} + ${b} × ${c} − ${d} ÷ ${e}`, ...numOptions(r, v, { wrong: [((a + b) * c - d) / e, (a + b) * c - d / e, a + b * c - d], step: 3 }), e: `Using BODMAS, division and multiplication come before addition and subtraction:\n${d} ÷ ${e} = ${d / e}; ${b} × ${c} = ${b * c}.\n${a} + ${b * c} − ${d / e} = **${v}**.`, check: `${a}+${b}*${c}-${d}/${e}`, d: 1 };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 20), d = r.int(2, 9), v = (a + b) * c - d * d;
      return { q: `Simplify: (${a} + ${b}) × ${c} − ${d}²`, ...numOptions(r, v, { wrong: [a + b * c - d * d, (a + b) * c - 2 * d, (a + b) * (c - d) * d], step: 3 }), e: `Brackets first: ${a} + ${b} = ${a + b}. Then ${a + b} × ${c} = ${(a + b) * c} and ${d}² = ${d * d}.\n${(a + b) * c} − ${d * d} = **${v}**.`, check: `(${a}+${b})*${c}-${d}**2`, d: 1 };
    },
    (r) => {
      const x = r.int(5, 99), a = r.int(10, 200), b = r.int(2, 9), total = a + x * b;
      return { q: `Find the missing number: ${a} + ? × ${b} = ${total}`, ...numOptions(r, x, { wrong: [(total - a) / b + 1, total / b - a, (total + a) / b].map((v) => Math.round(v)), step: 2 }), e: `? × ${b} = ${total} − ${a} = ${total - a} ⇒ ? = ${total - a}/${b} = **${x}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(11, 99), b = r.int(11, 99);
      return { q: `Simplify: ${a}² − ${b}²`, ...numOptions(r, a * a - b * b, { wrong: [(a - b) ** 2, a * a + b * b - 2 * a, (a - b) * (a - b + 2)], step: Math.max(10, Math.abs(a - b)) , min: -1e9 }), e: `a² − b² = (a + b)(a − b) = ${a + b} × ${a - b} = **${a * a - b * b}**.`, check: `${a}**2-${b}**2`, d: 1 };
    },
    (r) => {
      const p = r.pick([10, 12.5, 15, 20, 25, 30, 40, 50, 75]), x = 40 * r.int(2, 25), q = r.pick([2, 4, 5, 8, 10]), v = (p / 100) * x + x / q;
      return { q: `${p}% of ${x} + ${x} ÷ ${q} = ?`, ...numOptions(r, v, { wrong: [(p / 100) * (x + x / q), (p / 100) * x * q], step: 5 }), e: `${p}% of ${x} = ${fmt((p / 100) * x)}; ${x} ÷ ${q} = ${fmt(x / q)}.\nSum = **${fmt(v)}**.`, check: `${p}/100*${x}+${x}/${q}`, d: 1 };
    },
    (r) => {
      const [a, b, c, d] = [r.int(1, 5), r.int(2, 9), r.int(1, 5), r.int(2, 9)];
      if (a >= b || c >= d) return null;
      const n = a * d + c * b, den = b * d;
      return { q: `Simplify: ${a}/${b} + ${c}/${d}`, ...textOptions(r, frac(n, den), [frac(a + c, b + d), frac(a * c, b * d), frac(n + den, den * 2), frac(Math.abs(a * d - c * b) || 1, den)]), e: `LCD = ${den}: ${a}/${b} = ${a * d}/${den}, ${c}/${d} = ${c * b}/${den}.\nSum = ${n}/${den} = **${frac(n, den)}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Square Root and Cube Root ─────────────────────────
const roots = gen("roots", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const x = r.int(12, 99);
      return { q: `√${x * x} = ?`, ...numOptions(r, x, { wrong: [x + 1, x - 1, x + 10], step: 1 }), e: `${x} × ${x} = ${x * x}, so √${x * x} = **${x}**.`, check: `${x}`, d: 1 };
    },
    (r) => {
      const x = r.int(3, 30);
      return { q: `∛${x ** 3} = ?`, ...numOptions(r, x, { wrong: [x + 1, x - 1, x * 2], step: 1 }), e: `${x}³ = ${x ** 3}, so ∛${x ** 3} = **${x}**.`, d: 1 };
    },
    (r) => {
      const n = r.int(200, 9999), s = Math.floor(Math.sqrt(n)), sub = n - s * s;
      if (sub === 0) return null;
      return { q: `What is the least number that must be subtracted from ${n} to make it a perfect square?`, ...numOptions(r, sub, { wrong: [(s + 1) ** 2 - n, sub + 1, sub - 1].filter((v) => v > 0), step: 2 }), e: `${s}² = ${s * s} and ${s + 1}² = ${(s + 1) ** 2}, so the largest perfect square not exceeding ${n} is ${s * s}.\nSubtract ${n} − ${s * s} = **${sub}**.`, d: 2 };
    },
    (r) => {
      const n = r.int(200, 9999), s = Math.ceil(Math.sqrt(n)), add = s * s - n;
      if (add === 0) return null;
      return { q: `What is the least number that must be added to ${n} to make it a perfect square?`, ...numOptions(r, add, { wrong: [n - (s - 1) ** 2, add + 1, add + 2].filter((v) => v > 0), step: 2 }), e: `The smallest perfect square greater than ${n} is ${s}² = ${s * s}.\nAdd ${s * s} − ${n} = **${add}**.`, d: 2 };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      return { q: `√${a * a} × √${b * b} + √${(a * b) ** 2} = ?`, ...numOptions(r, 2 * a * b, { wrong: [a * b, a + b + a * b, 2 * (a + b)], step: 4 }), e: `√${a * a} = ${a}, √${b * b} = ${b}, √${(a * b) ** 2} = ${a * b}.\n${a} × ${b} + ${a * b} = **${2 * a * b}**.`, d: 1 };
    },
    (r) => {
      const x = r.int(2, 30), k = r.pick([100, 10000]), n = (x * x) / k;
      return { q: `√${n} = ?`, ...textOptions(r, String(x / Math.sqrt(k)), [String(x / Math.sqrt(k) * 10), String(x / Math.sqrt(k) / 10), String(Number((n / 2).toFixed(4)))]), e: `${n} = ${x * x}/${k}, so √${n} = ${x}/${Math.sqrt(k)} = **${x / Math.sqrt(k)}**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Surds and Indices ─────────────────────────
const indices = gen("indices", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.pick([2, 3, 5, 7]), m = r.int(2, 9), n = r.int(2, 9);
      return { q: `Simplify: ${a}^${m}^ × ${a}^${n}^`, ...textOptions(r, `${a}^${m + n}^`, [`${a}^${m * n}^`, `${a * a}^${m + n}^`, `${a}^${Math.abs(m - n) || m + 1}^`]), e: `aᵐ × aⁿ = aᵐ⁺ⁿ, so ${a}^${m}^ × ${a}^${n}^ = **${a}^${m + n}^**.`, d: 1 };
    },
    (r) => {
      const a = r.pick([2, 3, 5]), m = r.int(2, 5), n = r.int(2, 4);
      return { q: `Simplify: (${a}^${m}^)^${n}^`, ...textOptions(r, `${a}^${m * n}^`, [`${a}^${m + n}^`, `${a}^${m ** n}^`, `${a * n}^${m}^`]), e: `(aᵐ)ⁿ = aᵐⁿ, so (${a}^${m}^)^${n}^ = **${a}^${m * n}^**.`, d: 1 };
    },
    (r) => {
      const a = r.pick([2, 3, 5]), x = r.int(2, a === 2 ? 10 : 6);
      return { q: `If ${a}^x^ = ${a ** x}, what is the value of x?`, ...numOptions(r, x, { wrong: [x + 1, x - 1, a ** x / a], step: 1 }), e: `${a ** x} = ${a}^${x}^, so x = **${x}**.`, d: 1 };
    },
    (r) => {
      const [base, p, q] = r.pick([[8, 2, 3], [27, 2, 3], [16, 3, 4], [125, 2, 3], [32, 3, 5], [64, 2, 3], [81, 3, 4], [64, 5, 6], [243, 2, 5], [625, 3, 4]] as [number, number, number][]);
      const root = Math.round(base ** (1 / q)), v = root ** p;
      return { q: `What is the value of ${base}^${p}/${q}^?`, ...numOptions(r, v, { wrong: [root * p, base / q * p, root ** (p + 1)], step: Math.max(1, Math.round(v / 5)) }), e: `${base}^${p}/${q}^ = (${ord(q)} root of ${base})^${p}^ = ${root}^${p}^ = **${v}**.`, check: `${base}**(${p}/${q})`, d: 2 };
    },
    (r) => {
      const a = r.pick([2, 3, 4, 5, 10]), n = r.int(1, 3);
      return { q: `What is the value of ${a}^-${n}^?`, ...textOptions(r, `1/${a ** n}`, [`-${a ** n}`, `${a ** n}`, `-1/${a ** n}`]), e: `a⁻ⁿ = 1/aⁿ, so ${a}^-${n}^ = 1/${a}^${n}^ = **1/${a ** n}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(2, 12);
      return { q: `What is the value of ${a}^0^ + ${a}^1^?`, ...numOptions(r, 1 + a, { wrong: [a, 2 * a, 1], step: 1 }), e: `Any non-zero number raised to the power 0 is 1, so ${a}⁰ + ${a}¹ = 1 + ${a} = **${1 + a}**.`, d: 1 };
    },
    (r) => {
      const s = r.pick([2, 3, 5, 6, 7]), k1 = r.int(1, 6), k2 = r.int(1, 6);
      return { q: `Simplify: √${k1 * k1 * s} + √${k2 * k2 * s}`, ...textOptions(r, `${k1 + k2}√${s}`, [`√${(k1 * k1 + k2 * k2) * s}`, `${k1 * k2}√${s}`, `${k1 + k2 + 1}√${s}`]), e: `√${k1 * k1 * s} = ${k1}√${s} and √${k2 * k2 * s} = ${k2}√${s}.\nSum = **${k1 + k2}√${s}** (like surds add like terms).`, d: 2 };
    },
  ])
);

// ───────────────────────── Ratio and Proportion ─────────────────────────
const ratio = gen("ratio", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const [a, b] = [r.int(1, 9), r.int(1, 9)];
      if (a === b || gcd(a, b) !== 1) return null;
      const T = (a + b) * 100 * r.int(1, 20);
      return { q: `Divide Rs. ${fmt(T)} between A and B in the ratio ${a} : ${b}. What is A's share?`, ...numOptions(r, (T * a) / (a + b), { prefix: "Rs. ", wrong: [(T * b) / (a + b), T / 2, (T * a) / b], step: T / 20 }), e: `A's share = ${fmt(T)} × ${a}/${a + b} = **Rs. ${fmt((T * a) / (a + b))}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12), c = r.int(2, 12);
      if ((b * c) % a) return null;
      const d = (b * c) / a;
      return { q: `Find the fourth proportional to ${a}, ${b} and ${c}.`, ...numOptions(r, d, { wrong: [(a * c) / b, (a * b) / c, b + c - a].map((v) => Math.round(v)), step: 2 }), e: `If ${a} : ${b} :: ${c} : x, then ${a}x = ${b} × ${c} ⇒ x = ${b * c}/${a} = **${d}**.`, d: 1 };
    },
    (r) => {
      const x = r.int(2, 12), y = r.int(2, 12), m = x * y;
      return { q: `Find the mean proportional between ${x * x} and ${y * y}.`, ...numOptions(r, m, { wrong: [(x * x + y * y) / 2, x + y, m * 2], step: 2 }), e: `Mean proportional of a and b = √(ab) = √(${x * x} × ${y * y}) = ${x} × ${y} = **${m}**.`, d: 1 };
    },
    (r) => {
      const [a, b, c, d] = [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)];
      if (a === b || c === d || gcd(a, b) !== 1 || gcd(c, d) !== 1) return null;
      const A = a * c, C = b * d, g = gcd(A, C);
      return { q: `If A : B = ${a} : ${b} and B : C = ${c} : ${d}, find A : C.`, ...textOptions(r, `${A / g} : ${C / g}`, [`${a} : ${d}`, `${a * d} : ${b * c}`, `${C / g} : ${A / g}`, `${a + c} : ${b + d}`]), e: `A/C = (A/B) × (B/C) = ${a}/${b} × ${c}/${d} = ${A}/${C} = **${A / g} : ${C / g}**.`, d: 2 };
    },
    (r) => {
      const [a, b] = [r.int(1, 6), r.int(2, 7)], x = r.int(2, 12), k = r.int(2, 15);
      if (a >= b || gcd(a, b) !== 1) return null;
      const g = gcd(a * x + k, b * x + k), c = (a * x + k) / g, d = (b * x + k) / g;
      if (c === a && d === b) return null;
      return { q: `Two numbers are in the ratio ${a} : ${b}. If ${k} is added to each, the ratio becomes ${c} : ${d}. What is the smaller number?`, ...numOptions(r, a * x, { wrong: [b * x, a * x + k, x], step: Math.max(1, a) }), e: `Let the numbers be ${a}x and ${b}x. (${a}x + ${k})/(${b}x + ${k}) = ${c}/${d}.
${d}(${a}x + ${k}) = ${c}(${b}x + ${k}) ⇒ ${a * d - b * c}x = ${c * k - d * k} ⇒ x = ${x}.
Smaller number = ${a} × ${x} = **${a * x}**.`, d: 2 };
    },
    (r) => {
      const [a, b, c] = [r.int(1, 5), r.int(1, 5), r.int(1, 5)], k = r.int(5, 40), T = (a * 1 + b * 0.5 + c * 0.25) * k;
      if (!Number.isInteger(T)) return null;
      return { q: `A bag has Re. 1, 50 paise and 25 paise coins in the ratio ${a} : ${b} : ${c}. The total value is Rs. ${T}. How many 50 paise coins are there?`, ...numOptions(r, b * k, { wrong: [a * k, c * k, T / 2], step: Math.max(2, k / 2) }), e: `Let the counts be ${a}x, ${b}x, ${c}x. Value = ${a}x + ${b}x/2 + ${c}x/4 = ${fmt(a + b / 2 + c / 4)}x = ${T} ⇒ x = ${k}.\n50 paise coins = ${b} × ${k} = **${b * k}**.`, d: 2 };
    },
  ])
);

export const part2: RawSubject = {
  average: topic(average, {
    intro: "The average (arithmetic mean) of a set of observations is their sum divided by their number.",
    formulas: [
      { h: "Basics", points: ["Average = sum of observations ÷ number of observations", "Sum = average × number"] },
      { h: "Standard results", points: ["Average of the first n natural numbers = (n + 1)/2", "Average of the first n odd numbers = n; of the first n even numbers = n + 1", "Average of consecutive numbers = (first + last)/2"] },
      { h: "Adding or replacing", points: ["New number added = (new count × new average) − (old count × old average)", "If replacing one item raises the average of n items by d, the new item = old item + n × d"] },
    ],
  }),
  area: topic(area, {
    intro: "Area measures the surface enclosed by a plane figure; perimeter is the length of its boundary.",
    formulas: [
      { h: "Rectangles and squares", points: ["Rectangle: area = l × b, perimeter = 2(l + b), diagonal = √(l² + b²)", "Square: area = a² = d²/2, perimeter = 4a, diagonal = a√2"] },
      { h: "Triangles", points: ["Area = ½ × base × height", "Heron's formula: area = √[s(s − a)(s − b)(s − c)], s = (a + b + c)/2", "Equilateral: area = (√3/4)a²"] },
      { h: "Circles", points: ["Area = πr², circumference = 2πr", "Sector of angle θ: area = (θ/360) × πr², arc = (θ/360) × 2πr"] },
      { h: "Paths and changes", points: ["Path of width w outside an l × b rectangle: area = 2w(l + b + 2w)", "Sides increased by x%: area increases by (2x + x²/100)%"] },
    ],
  }),
  "volume-and-surface-area": topic(volume, {
    intro: "Volume measures the space occupied by a solid; surface area is the total area of its faces.",
    formulas: [
      { h: "Cuboid and cube", points: ["Cuboid: V = lbh, TSA = 2(lb + bh + hl), diagonal = √(l² + b² + h²)", "Cube: V = a³, TSA = 6a², diagonal = a√3"] },
      { h: "Cylinder, cone, sphere", points: ["Cylinder: V = πr²h, CSA = 2πrh, TSA = 2πr(h + r)", "Cone: V = (1/3)πr²h, slant height l = √(r² + h²), CSA = πrl", "Sphere: V = (4/3)πr³, SA = 4πr²; hemisphere: V = (2/3)πr³, TSA = 3πr²"] },
      { h: "Melting and recasting", points: ["The volume stays the same: number of small solids = big volume ÷ small volume"] },
    ],
  }),
  "permutation-and-combination": topic(pnc, {
    intro: "A permutation is an arrangement (order matters); a combination is a selection (order does not matter).",
    formulas: [
      { h: "Factorials", points: ["n! = n × (n − 1) × … × 1, and 0! = 1"] },
      { h: "Counting", points: ["ⁿPᵣ = n!/(n − r)!", "ⁿCᵣ = n!/(r!(n − r)!), and ⁿCᵣ = ⁿCₙ₋ᵣ", "Arrangements of n items with p alike of one kind, q alike of another: n!/(p! q!)", "Circular arrangements of n distinct items: (n − 1)!"] },
      { h: "Handy results", points: ["Handshakes among n people: ⁿC₂", "Diagonals of an n-sided polygon: n(n − 3)/2", "Items that must be together: treat them as one unit, then multiply by their internal arrangements"] },
    ],
  }),
  numbers: topic(numbers, {
    intro: "Number system questions test divisibility, place value, unit digits, factors and remainders.",
    formulas: [
      { h: "Divisibility rules", points: ["2: last digit even. 3: digit sum divisible by 3. 4: last two digits divisible by 4", "5: last digit 0 or 5. 8: last three digits divisible by 8. 9: digit sum divisible by 9", "11: difference between sums of alternate digits is 0 or divisible by 11"] },
      { h: "Factors", points: ["If n = pᵃ × qᵇ × rᶜ, the number of factors is (a + 1)(b + 1)(c + 1)"] },
      { h: "Unit digits", points: ["Unit digits of powers repeat in cycles of at most 4: 2 → 2, 4, 8, 6; 3 → 3, 9, 7, 1; 7 → 7, 9, 3, 1; 8 → 8, 4, 2, 6", "0, 1, 5 and 6 always end in themselves; 4 and 9 alternate"] },
      { h: "Series sums", points: ["1 + 2 + … + n = n(n + 1)/2", "1² + 2² + … + n² = n(n + 1)(2n + 1)/6", "1³ + … + n³ = [n(n + 1)/2]²"] },
    ],
  }),
  "problems-on-numbers": topic(problemsOnNumbers, {
    intro: "Translate the words into equations: 'a number' becomes x, 'exceeds' means subtraction, 'times' means multiplication.",
    formulas: [
      { h: "Useful identities", points: ["Larger = (sum + difference)/2, smaller = (sum − difference)/2", "(a + b)² = a² + b² + 2ab; (a − b)² = a² + b² − 2ab; a² − b² = (a + b)(a − b)", "A two-digit number with digits x, y is 10x + y; reversing changes it by 9(x − y)"] },
    ],
  }),
  "problems-on-hcf-and-lcm": topic(hcfLcm, {
    intro: "The H.C.F. (highest common factor) is the greatest number dividing all given numbers; the L.C.M. (least common multiple) is the smallest number divisible by all of them.",
    formulas: [
      { h: "Relations", points: ["H.C.F. × L.C.M. = product of the two numbers", "H.C.F. of fractions = H.C.F. of numerators / L.C.M. of denominators", "L.C.M. of fractions = L.C.M. of numerators / H.C.F. of denominators"] },
      { h: "Remainder problems", points: ["Greatest number dividing a, b, c leaving the same remainder = H.C.F. of (b − a), (c − b), (c − a)", "Least number which leaves remainder r when divided by x, y, z = L.C.M.(x, y, z) + r", "Events repeating every x, y, z units coincide every L.C.M.(x, y, z)"] },
    ],
  }),
  "decimal-fraction": topic(decimals, {
    intro: "Decimal fractions have denominators that are powers of 10. Recurring decimals can always be written as ordinary fractions.",
    formulas: [
      { h: "Operations", points: ["Multiplication: multiply as whole numbers, then place as many decimals as the factors have in total", "Division: shift the decimal point in both numbers until the divisor is a whole number"] },
      { h: "Recurring decimals", points: ["Pure recurring: 0.ab̄ = ab/99, 0.abc̄ = abc/999", "Mixed recurring: 0.ab̄c̄ = (abc − a)/990"] },
      { h: "Comparing fractions", points: ["Convert to decimals, or cross-multiply: a/b > c/d if ad > bc"] },
    ],
  }),
  simplification: topic(simplification, {
    intro: "Simplification questions follow the BODMAS order: Brackets, Of, Division, Multiplication, Addition, Subtraction.",
    formulas: [
      { h: "Order of operations", points: ["Remove brackets in the order (), {}, [ ]", "'Of' is multiplication done before division", "Division and multiplication, then addition and subtraction, left to right"] },
      { h: "Algebraic shortcuts", points: ["a² − b² = (a + b)(a − b)", "(a + b)² + (a − b)² = 2(a² + b²)", "a³ + b³ = (a + b)(a² − ab + b²)"] },
    ],
  }),
  "square-root-and-cube-root": topic(roots, {
    intro: "The square root of x is the number whose square is x; the cube root is the number whose cube is x.",
    formulas: [
      { h: "Rules", points: ["√(ab) = √a × √b, √(a/b) = √a/√b", "A perfect square ends in 0, 1, 4, 5, 6 or 9; it never ends in 2, 3, 7 or 8", "Square root of a decimal: make the number of decimal places even, then halve it"] },
      { h: "Nearest perfect square", points: ["Least number to subtract to make n a perfect square = n − ⌊√n⌋²", "Least number to add = ⌈√n⌉² − n"] },
    ],
  }),
  "surds-and-indices": topic(indices, {
    intro: "Indices (exponents) show repeated multiplication; a surd is an irrational root such as √2.",
    formulas: [
      { h: "Laws of indices", points: ["aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ", "(ab)ⁿ = aⁿbⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ", "a^(p/q) = (q-th root of a)ᵖ"] },
      { h: "Surds", points: ["√(a²b) = a√b", "Like surds add: m√a + n√a = (m + n)√a", "Rationalise 1/(√a + √b) by multiplying by (√a − √b)"] },
    ],
  }),
  "ratio-and-proportion": topic(ratio, {
    intro: "A ratio compares two quantities of the same kind; a proportion states that two ratios are equal.",
    formulas: [
      { h: "Ratios", points: ["a : b = a/b; multiplying both terms by the same number leaves it unchanged", "Dividing T in the ratio a : b gives aT/(a + b) and bT/(a + b)", "If A : B = a : b and B : C = c : d, then A : C = ac : bd"] },
      { h: "Proportions", points: ["a : b :: c : d ⇔ ad = bc", "Fourth proportional to a, b, c = bc/a", "Third proportional to a, b = b²/a; mean proportional = √(ab)"] },
    ],
  }),
};
