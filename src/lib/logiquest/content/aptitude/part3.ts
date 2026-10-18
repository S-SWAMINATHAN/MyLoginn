/** Arithmetic Aptitude, part 3: chain rule, pipes, boats, alligation, logarithms, races, stocks, probability, discounts, series. */
import type { RawQ, RawSubject } from "../../types";
import { cycle, fmt, frac, fracOptions, gcd, gen, mixed, numOptions, textOptions, topic, type Rng } from "../build";

const N = 60;
const comb = (n: number, k: number) => { let v = 1; for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i; return Math.round(v); };

// ───────────────────────── Chain Rule ─────────────────────────
const chainRule = gen("chain-rule", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const m1 = r.int(5, 30), d1 = r.int(5, 30), h1 = r.int(4, 10), m2 = r.int(5, 30), h2 = r.int(4, 10), d2 = (m1 * d1 * h1) / (m2 * h2);
      if (!Number.isInteger(d2) || m1 === m2) return null;
      return { q: `${m1} men working ${h1} hours a day can complete a work in ${d1} days. In how many days can ${m2} men working ${h2} hours a day complete the same work?`, ...numOptions(r, d2, { unit: "days", wrong: [(m2 * d1 * h1) / (m1 * h2), (m1 * d1) / m2], step: 2 }), e: `M₁D₁H₁ = M₂D₂H₂ ⇒ ${m1} × ${d1} × ${h1} = ${m2} × D₂ × ${h2}.\nD₂ = ${m1 * d1 * h1}/${m2 * h2} = **${d2} days**.`, d: 2 };
    },
    (r) => {
      const n = r.int(3, 20), c = 5 * r.int(5, 60), k = r.int(3, 30);
      return { q: `If ${n} pens cost Rs. ${n * c}, how much do ${k} pens cost?`, ...numOptions(r, k * c, { prefix: "Rs. ", wrong: [(n * c) / k, (k * c) / 2, n * k], step: c }), e: `Cost of one pen = ${n * c}/${n} = Rs. ${c}.\nCost of ${k} pens = ${k} × ${c} = **Rs. ${k * c}**.`, d: 1 };
    },
    (r) => {
      const m1 = r.int(4, 20), w1 = r.int(20, 200), d = r.int(4, 12), w2 = r.int(20, 200), m2 = (m1 * w2) / w1;
      if (!Number.isInteger(m2) || w1 === w2) return null;
      return { q: `${m1} workers can make ${w1} toys in ${d} days. How many workers are needed to make ${w2} toys in ${d} days?`, ...numOptions(r, m2, { wrong: [(m1 * w1) / w2, m2 + d, m1 + (w2 - w1) / 10], step: 1 }), e: `Workers are proportional to work for the same number of days: ${m1} × ${w2}/${w1} = **${m2}** workers.`, d: 1 };
    },
    (r) => {
      const days = r.int(10, 40), men = r.int(20, 120), left = r.int(2, days - 5), extra = r.int(5, 60), remaining = (men * (days - left)) / (men + extra);
      if (!Number.isInteger(remaining)) return null;
      return { q: `A camp of ${men} soldiers has food for ${days} days. After ${left} days, ${extra} more soldiers join. How long will the remaining food last?`, ...numOptions(r, remaining, { unit: "days", wrong: [days - left, (men * days) / (men + extra), remaining + 2], step: 1 }), e: `After ${left} days, food is left for ${men} men for ${days - left} days = ${men * (days - left)} man-days.\nFor ${men + extra} men it lasts ${men * (days - left)}/${men + extra} = **${remaining} days**.`, d: 2 };
    },
    (r) => {
      const km = r.int(100, 600), l = r.int(8, 30), dist = r.int(100, 900), need = (dist * l) / km;
      if (!Number.isInteger(need * 2)) return null;
      return { q: `A car uses ${l} litres of petrol to travel ${km} km. How much petrol is needed for ${dist} km?`, ...numOptions(r, need, { unit: "litres", wrong: [(km * l) / dist, need * 2, need / 2], step: 1 }), e: `Petrol is proportional to distance: ${l} × ${dist}/${km} = **${fmt(need)} litres**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Pipes and Cistern ─────────────────────────
const pipes = gen("pipes", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(4, 30), b = r.int(4, 30);
      if (a === b) return null;
      return { q: `Two pipes A and B can fill a tank in ${a} hours and ${b} hours respectively. If both are opened together, how long will they take to fill the tank?`, ...fracOptions(r, a * b, a + b, [[a + b, 2], [Math.abs(a - b), 1]], "hours"), e: `Part filled in 1 hour = 1/${a} + 1/${b} = ${a + b}/${a * b}.\nTime = ${a * b}/${a + b} = **${mixed(a * b, a + b)} hours**.`, d: 1 };
    },
    (r) => {
      const a = r.int(3, 20), b = r.int(a + 1, 40), n = a * b, d = b - a;
      return { q: `A pipe can fill a tank in ${a} hours and another pipe can empty it in ${b} hours. If both are opened together, in how much time will the tank be filled?`, ...fracOptions(r, n, d, [[a * b, a + b], [b - a, 1]], "hours"), e: `Net part filled per hour = 1/${a} − 1/${b} = ${d}/${n}.\nTime = ${n}/${d} = **${mixed(n, d)} hours**.`, d: 1 };
    },
    (r) => {
      const a = r.int(3, 15), b = a + r.int(1, 6), n = a * b, d = b - a;
      return { q: `A pipe fills a tank in ${a} hours. Because of a leak at the bottom it takes ${b} hours. If the tank is full, in how much time will the leak empty it?`, ...fracOptions(r, n, d, [[a + b, 1], [n, a + b]], "hours"), e: `Leak's rate = 1/${a} − 1/${b} = ${d}/${n} of the tank per hour.\nThe leak empties the full tank in ${n}/${d} = **${mixed(n, d)} hours**.`, d: 2 };
    },
    (r) => {
      for (let t = 0; t < 30; t++) {
        const a = r.int(5, 30), b = r.int(5, 30), c = r.int(5, 40);
        const rate = { n: b * c + a * c - a * b, d: a * b * c };
        if (rate.n <= 0 || a === b) continue;
        const g = gcd(rate.d, rate.n);
        return { q: `Pipes A and B can fill a tank in ${a} and ${b} minutes, and pipe C can empty it in ${c} minutes. If all three are opened together, how long will it take to fill the tank?`, ...fracOptions(r, rate.d / g, rate.n / g, [[a * b, a + b]], "minutes"), e: `Net rate = 1/${a} + 1/${b} − 1/${c} = ${rate.n / g}/${rate.d / g} per minute.\nTime = **${mixed(rate.d / g, rate.n / g)} minutes**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      const a = r.int(6, 24), b = r.int(6, 24), k = r.int(2, 5), L = a * b, done = k * (a + b);
      if (done >= L || a === b) return null;
      const remN = L - done, t = remN / a; // B alone: (remN/L) × b = remN/a
      if (!Number.isInteger(t * 2)) return null;
      return { q: `Pipes A and B can fill a tank in ${a} and ${b} hours. Both are opened for ${k} hours and then A is closed. How much more time will B take to fill the tank?`, ...numOptions(r, t, { unit: "hours", wrong: [b - k, (remN / L) * a, t + k], step: 1 }), e: `In ${k} hours both fill ${k}(1/${a} + 1/${b}) = ${done}/${L}.\nRemaining = ${remN}/${L}, which B fills in (${remN}/${L}) × ${b} = **${fmt(t)} hours**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Boats and Streams ─────────────────────────
const boats = gen("boats", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const u = r.int(6, 30), v = r.int(1, u - 2);
      return { q: `A boat goes ${u + v} km/hr downstream and ${u - v} km/hr upstream. What is the speed of the boat in still water?`, ...numOptions(r, u, { unit: "km/hr", wrong: [v, u + v, 2 * u], step: 1 }), e: `Speed in still water = (downstream + upstream)/2 = (${u + v} + ${u - v})/2 = **${u} km/hr**.`, d: 1 };
    },
    (r) => {
      const u = r.int(6, 30), v = r.int(1, u - 2);
      return { q: `A man can row downstream at ${u + v} km/hr and upstream at ${u - v} km/hr. What is the speed of the stream?`, ...numOptions(r, v, { unit: "km/hr", wrong: [u, 2 * v, u - v], step: 1 }), e: `Speed of stream = (downstream − upstream)/2 = (${u + v} − ${u - v})/2 = **${v} km/hr**.`, d: 1 };
    },
    (r) => {
      const u = r.int(8, 25), v = r.int(1, 5), t = r.int(1, 5), D = (u + v) * t;
      return { q: `A boat whose speed in still water is ${u} km/hr goes ${D} km downstream. If the stream flows at ${v} km/hr, how long does it take?`, ...numOptions(r, t, { unit: "hours", wrong: [D / u, D / (u - v)].map((x) => Number(x.toFixed(2))), step: 1, dp: 2 }), e: `Downstream speed = ${u} + ${v} = ${u + v} km/hr.\nTime = ${D}/${u + v} = **${t} hours**.`, d: 1 };
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const u = r.int(5, 20), v = r.int(1, u - 1), D = r.int(4, 60), T = D / (u + v) + D / (u - v);
        if (!Number.isInteger(T * 4)) continue;
        return { q: `A man rows at ${u} km/hr in still water. The river flows at ${v} km/hr. How long will he take to row ${D} km upstream and come back?`, ...numOptions(r, T, { unit: "hours", wrong: [(2 * D) / u, D / (u - v), D / (u + v)], step: 0.5, dp: 2 }), e: `Upstream speed = ${u - v} km/hr, downstream = ${u + v} km/hr.\nTime = ${D}/${u - v} + ${D}/${u + v} = ${fmt(D / (u - v))} + ${fmt(D / (u + v))} = **${fmt(T)} hours**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const u = r.int(4, 20), v = r.int(1, u - 1), k = (u + v) / (u - v);
        if (!Number.isInteger(k) || k < 2) continue;
        return { q: `A man takes ${k} times as long to row a distance upstream as to row the same distance downstream. If the speed of the boat in still water is ${u} km/hr, what is the speed of the stream?`, ...numOptions(r, v, { unit: "km/hr", wrong: [u / k, u / (k + 1), v + 1], step: 1, dp: 2 }), e: `Time ratio = ${k} : 1, so speed ratio downstream : upstream = ${k} : 1.\n(${u} + s)/(${u} − s) = ${k} ⇒ s = ${u}(${k} − 1)/(${k} + 1) = **${v} km/hr**.`, d: 3 };
      }
      return null;
    },
  ])
);

// ───────────────────────── Alligation or Mixture ─────────────────────────
const alligation = gen("alligation", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(20, 60), b = a + r.int(10, 50), m = r.int(a + 1, b - 1), x = b - m, y = m - a, g = gcd(x, y);
      return { q: `In what ratio must rice at Rs. ${a} per kg be mixed with rice at Rs. ${b} per kg so that the mixture costs Rs. ${m} per kg?`, ...textOptions(r, `${x / g} : ${y / g}`, [`${y / g} : ${x / g}`, `${a} : ${b}`, `${(b - a) / gcd(b - a, m)} : ${m / gcd(b - a, m)}`, `${x / g + 1} : ${y / g}`]), e: `By alligation: cheaper : dearer = (dearer − mean) : (mean − cheaper) = (${b} − ${m}) : (${m} − ${a}) = ${x} : ${y} = **${x / g} : ${y / g}**.`, d: 2 };
    },
    (r) => {
      const V = r.pick([40, 50, 60, 80, 100, 120]), x = r.pick([4, 5, 8, 10, 12, 20].filter((k) => k < V / 2)), n = r.int(2, 3), milk = V * (1 - x / V) ** n;
      return { q: `A container has ${V} litres of milk. ${x} litres are taken out and replaced with water. This is done ${n} times in all. How much milk is left in the container?`, ...numOptions(r, milk, { unit: "litres", wrong: [V - n * x, V * (1 - x / V) ** (n - 1)], step: 2, dp: 2 }), e: `Milk left = V(1 − x/V)ⁿ = ${V}(1 − ${x}/${V})^${n}^ = ${V} × (${frac(V - x, V)})^${n}^ = **${fmt(milk)} litres**.`, check: `${V}*(1-${x}/${V})**${n}`, d: 3 };
    },
    (r) => {
      const [p, q] = [r.int(1, 6), r.int(1, 6)], k = r.int(2, 12), V = (p + q) * k, add = r.int(2, 20), g = gcd(p * k, q * k + add);
      return { q: `A mixture of ${V} litres contains milk and water in the ratio ${p} : ${q}. If ${add} litres of water is added, what is the new ratio of milk to water?`, ...textOptions(r, `${(p * k) / g} : ${(q * k + add) / g}`, [`${p} : ${q + add}`, `${(p * k + add) / gcd(p * k + add, q * k)} : ${(q * k) / gcd(p * k + add, q * k)}`, `${p} : ${q}`, `${(q * k + add) / g} : ${(p * k) / g}`]), e: `Milk = ${V} × ${p}/${p + q} = ${p * k} L; water = ${q * k} L.\nAfter adding ${add} L water: ${p * k} : ${q * k + add} = **${(p * k) / g} : ${(q * k + add) / g}**.`, d: 2 };
    },
    (r) => {
      const a = r.int(10, 30), b = a + r.int(10, 40), m = r.int(a + 1, b - 1), qty = r.int(5, 40), other = (qty * (m - a)) / (b - m);
      if (!Number.isInteger(other)) return null;
      return { q: `How many kg of tea at Rs. ${b} per kg must be mixed with ${qty} kg of tea at Rs. ${a} per kg so that the mixture is worth Rs. ${m} per kg?`, ...numOptions(r, other, { unit: "kg", wrong: [qty, (qty * (b - m)) / (m - a)].map((v) => Math.round(v)), step: 2 }), e: `Cheaper : dearer = (${b} − ${m}) : (${m} − ${a}) = ${b - m} : ${m - a}.\nIf cheaper = ${qty} kg, dearer = ${qty} × ${m - a}/${b - m} = **${other} kg**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Logarithm ─────────────────────────
const LOG2 = 0.301, LOG3 = 0.4771;
const logarithm = gen("logarithm", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const b = r.pick([2, 3, 4, 5, 6, 7, 10]), k = r.int(2, b === 2 ? 9 : 4);
      return { q: `What is the value of log_{${b}} ${b ** k}?`, ...numOptions(r, k, { wrong: [b ** k / b, k + 1, k - 1], step: 1, min: -1 }), e: `${b ** k} = ${b}^${k}^, so log_{${b}} ${b ** k} = **${k}**.`, d: 1 };
    },
    (r) => {
      const k = r.int(1, 4), neg = r.chance(0.5);
      const val = neg ? `0.${"0".repeat(k - 1)}1` : `1${"0".repeat(k)}`;
      return { q: `What is the value of log₁₀ ${val}?`, ...numOptions(r, neg ? -k : k, { wrong: neg ? [k, -(k + 1), -(k - 1) || 1] : [-k, k + 1, k - 1], step: 1, min: -10 }), e: `${val} = 10^${neg ? -k : k}^, so log₁₀ ${val} = **${neg ? -k : k}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(0, 6), b = r.int(0, 3);
      if (a + b < 2) return null;
      const n = 2 ** a * 3 ** b, v = a * LOG2 + b * LOG3;
      return { q: `If log 2 = ${LOG2} and log 3 = ${LOG3}, what is the value of log ${n}?`, ...textOptions(r, v.toFixed(4), [(v + LOG2).toFixed(4), (a * LOG3 + b * LOG2).toFixed(4), (v - 0.1).toFixed(4)]), e: `${n} = ${[a ? `2^${a}^` : "", b ? `3^${b}^` : ""].filter(Boolean).join(" × ")}.\nlog ${n} = ${[a ? `${a} log 2` : "", b ? `${b} log 3` : ""].filter(Boolean).join(" + ")} = ${[a ? `${a} × ${LOG2}` : "", b ? `${b} × ${LOG3}` : ""].filter(Boolean).join(" + ")} = **${v.toFixed(4)}**.`, d: 2 };
    },
    (r) => {
      const a = r.pick([2, 3, 5]), m = r.int(2, 5), n = r.int(2, 4);
      return { q: `Simplify: log (${a}^${m}^) / log (${a}^${n}^)`, ...textOptions(r, frac(m, n), [frac(n, m), String(m - n), String(m * n), frac(m + 1, n)]), e: `log aᵐ = m log a, so the ratio is (${m} log ${a})/(${n} log ${a}) = **${frac(m, n)}**.`, d: 2 };
    },
    (r) => {
      const x = r.int(2, 9), b = r.pick([2, 3, 5]);
      return { q: `If log_{${b}} x = ${x}, what is x?`, ...numOptions(r, b ** x, { wrong: [b * x, x ** b, b ** (x - 1)], step: Math.max(1, Math.round(b ** x / 6)) }), e: `log_{${b}} x = ${x} ⇔ x = ${b}^${x}^ = **${b ** x}**.`, d: 1 };
    },
    (r) => {
      const [a, b] = r.pick([[2, 5], [4, 25], [8, 125], [20, 5], [50, 2], [25, 40]] as [number, number][]), v = Math.log10(a * b);
      return { q: `What is the value of log ${a} + log ${b}?`, ...numOptions(r, Math.round(v), { wrong: [Math.round(v) + 1, Math.round(v) - 1 || 4, a + b > 100 ? 5 : 7], step: 1, min: -1 }), e: `log a + log b = log (ab) = log ${a * b} = **${Math.round(v)}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Races and Games ─────────────────────────
const races = gen("races", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const L = r.pick([100, 200, 400, 500, 1000]), x = r.pick([10, 20, 25, 40, 50, 100].filter((v) => v < L / 2)), y = r.pick([10, 20, 25, 40, 50, 100].filter((v) => v < L / 2));
      const ans = L - ((L - x) * (L - y)) / L;
      if (!Number.isInteger(ans * 2)) return null;
      return { q: `In a ${L} m race, A beats B by ${x} m and B beats C by ${y} m. By how many metres does A beat C?`, ...numOptions(r, ans, { unit: "m", wrong: [x + y, Math.abs(x - y) || x + 5, ans + 5], step: 2 }), e: `When A runs ${L}, B runs ${L - x}. When B runs ${L}, C runs ${L - y}, so when B runs ${L - x}, C runs ${L - y} × ${L - x}/${L} = ${fmt(((L - x) * (L - y)) / L)}.\nA beats C by ${L} − ${fmt(((L - x) * (L - y)) / L)} = **${fmt(ans)} m**.`, d: 2 };
    },
    (r) => {
      const L = r.pick([100, 200, 500, 1000]), ta = r.int(10, 60), extra = r.int(2, 10), tb = ta + extra, beat = (L * extra) / tb;
      if (!Number.isInteger(beat * 2)) return null;
      return { q: `A can run ${L} m in ${ta} seconds and B in ${tb} seconds. By how many metres does A beat B?`, ...numOptions(r, beat, { unit: "m", wrong: [(L * extra) / ta, extra * 10], step: 2 }), e: `A finishes ${extra} s earlier. In those ${extra} s, B runs ${L}/${tb} × ${extra} = **${fmt(beat)} m**.`, d: 2 };
    },
    (r) => {
      const [a, b] = r.pick([[5, 4], [4, 3], [3, 2], [6, 5], [7, 5], [5, 3], [8, 7], [10, 9]] as [number, number][]), L = r.pick([100, 200, 300, 500, 1000]), start = (L * (a - b)) / a;
      if (!Number.isInteger(start * 2)) return null;
      return { q: `A runs ${mixed(a, b)} times as fast as B. If A gives B a start of x metres so that the race of ${L} m ends in a dead heat, what is x?`, ...numOptions(r, start, { unit: "m", wrong: [(L * (a - b)) / b, L / a], step: 5 }), e: `Speeds A : B = ${a} : ${b}. While A runs ${L} m, B runs ${L} × ${b}/${a} = ${fmt((L * b) / a)} m.\nStart = ${L} − ${fmt((L * b) / a)} = **${fmt(start)} m**.`, d: 2 };
    },
    (r) => {
      const pts = r.pick([100, 60, 50, 80, 90]), a = r.pick([10, 20, 15, 25].filter((v) => v < pts / 2)), b = r.pick([10, 20, 15, 25].filter((v) => v < pts / 2));
      const ans = pts - ((pts - a) * (pts - b)) / pts;
      if (!Number.isInteger(ans * 2)) return null;
      return { q: `In a game of ${pts} points, A can give B ${a} points and B can give C ${b} points. How many points can A give C?`, ...numOptions(r, ans, { wrong: [a + b, ans - 3, ans + 4], step: 2 }), e: `A : B = ${pts} : ${pts - a} and B : C = ${pts} : ${pts - b}, so A : C = ${pts} : ${fmt(((pts - a) * (pts - b)) / pts)}.\nA can give C ${pts} − ${fmt(((pts - a) * (pts - b)) / pts)} = **${fmt(ans)} points**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Stocks and Shares ─────────────────────────
const stocks = gen("stocks", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const rate = r.pick([4, 5, 6, 8, 9, 10, 12]), price = r.pick([80, 90, 96, 100, 104, 108, 112, 120, 125]), invest = price * 10 * r.int(5, 50), income = (invest * rate) / price;
      return { q: `Find the annual income from investing Rs. ${fmt(invest)} in ${rate}% stock at ${price}.`, ...numOptions(r, income, { prefix: "Rs. ", wrong: [(invest * rate) / 100, (invest * price) / (rate * 100)], step: income / 10 }), e: `For Rs. ${price} invested, income = Rs. ${rate}.\nIncome on Rs. ${fmt(invest)} = ${rate}/${price} × ${fmt(invest)} = **Rs. ${fmt(income)}**.`, d: 2 };
    },
    (r) => {
      const rate = r.pick([5, 6, 8, 9, 10, 12, 15]), price = r.pick([75, 80, 90, 96, 100, 108, 120, 125, 150]), y = (rate * 100) / price;
      return { q: `What is the rate of return (yield) on ${rate}% stock bought at ${price}?`, ...numOptions(r, y, { unit: "%", wrong: [rate, (price * rate) / 100], step: 1, dp: 2 }), e: `Rs. ${price} earns Rs. ${rate} per year, so the yield = ${rate}/${price} × 100 = **${fmt(y)}%**.`, d: 1 };
    },
    (r) => {
      const fv = r.pick([10, 100]), n = 10 * r.int(5, 100), div = r.pick([5, 8, 10, 12, 15, 20]), inc = (n * fv * div) / 100;
      return { q: `A company declares a ${div}% dividend. What is the annual dividend on ${n} shares of face value Rs. ${fv} each?`, ...numOptions(r, inc, { prefix: "Rs. ", wrong: [(n * div) / 100, inc * 2], step: inc / 10 }), e: `Dividend is paid on the face value: ${n} × ${fv} × ${div}/100 = **Rs. ${fmt(inc)}**.`, d: 1 };
    },
    (r) => {
      const rate = r.pick([5, 6, 8, 10, 12]), income = 20 * r.int(5, 50), price = r.pick([90, 95, 100, 105, 110, 120]), invest = (income * price) / rate;
      if (!Number.isInteger(invest)) return null;
      return { q: `How much must be invested in ${rate}% stock at ${price} to obtain an annual income of Rs. ${income}?`, ...numOptions(r, invest, { prefix: "Rs. ", wrong: [(income * 100) / rate, (income * rate * 100) / price], step: invest / 10 }), e: `To earn Rs. ${rate} you invest Rs. ${price}.\nTo earn Rs. ${income}: ${price}/${rate} × ${income} = **Rs. ${fmt(invest)}**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Probability ─────────────────────────
const probability = gen("probability", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const n = r.int(2, 5);
      return { q: `${n} unbiased coins are tossed together. What is the probability of getting at least one head?`, ...textOptions(r, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, 2 ** n), frac(1, 2), frac(2 ** n - 2, 2 ** n)]), e: `Total outcomes = 2^${n}^ = ${2 ** n}. Only one outcome has no head (all tails).\nP(at least one head) = 1 − 1/${2 ** n} = **${frac(2 ** n - 1, 2 ** n)}**.`, d: 1 };
    },
    (r) => {
      const s = r.int(2, 12), ways = 6 - Math.abs(7 - s);
      return { q: `Two dice are thrown together. What is the probability that the sum of the numbers is ${s}?`, ...textOptions(r, frac(ways, 36), [frac(ways + 1, 36), frac(1, 6), frac(Math.max(1, ways - 1), 36), frac(s, 36)].filter((x) => x !== frac(ways, 36))), e: `There are 36 equally likely outcomes. Sum ${s} occurs in ${ways} way(s): ${Array.from({ length: 6 }, (_, a) => a + 1).flatMap((a) => (s - a >= 1 && s - a <= 6 ? [`(${a},${s - a})`] : [])).join(", ")}.\nProbability = ${ways}/36 = **${frac(ways, 36)}**.`, d: 1 };
    },
    (r) => {
      const red = r.int(2, 8), blue = r.int(2, 8), green = r.int(0, 5), total = red + blue + green, num = comb(red, 2), den = comb(total, 2);
      return { q: `A bag contains ${red} red, ${blue} blue${green ? ` and ${green} green` : ""} ball${green === 1 ? "" : "s"}. Two balls are drawn at random. What is the probability that both are red?`, ...textOptions(r, frac(num, den), [frac(red, total), frac(red * red, total * total), frac(red * (red - 1), total * total), frac(comb(red, 2) + 1, den)].filter((x) => x !== frac(num, den))), e: `Ways to choose 2 red = ${red}C2 = ${num}; ways to choose any 2 = ${total}C2 = ${den}.\nProbability = ${num}/${den} = **${frac(num, den)}**.`, check: `Fraction(${num},${den})`, d: 2 };
    },
    (r) => {
      const [ask, n] = r.pick([["a king", 4], ["a heart", 13], ["a red card", 26], ["a face card", 12], ["an ace or a king", 8], ["a black queen", 2], ["a spade or an ace", 16], ["a red face card", 6], ["a number card (2 to 10)", 36]] as [string, number][]);
      return { q: `One card is drawn at random from a well-shuffled pack of 52 cards. What is the probability that it is ${ask}?`, ...textOptions(r, frac(n, 52), [frac(n + 4, 52), frac(Math.max(1, n - 1), 52), frac(1, 4), frac(1, 13), frac(3, 13), frac(1, 2)].filter((x) => x !== frac(n, 52))), e: `Favourable cards for ${ask} = ${n}.\nProbability = ${n}/52 = **${frac(n, 52)}**.`, d: 1 };
    },
    (r) => {
      const n = r.pick([10, 20, 25, 30, 40, 50, 100]), k = r.pick([2, 3, 4, 5, 6, 7]), m = Math.floor(n / k);
      return { q: `A number is chosen at random from 1 to ${n}. What is the probability that it is a multiple of ${k}?`, ...textOptions(r, frac(m, n), [frac(m + 1, n), frac(1, k + 1), frac(Math.max(1, m - 1), n), frac(k, n)].filter((x) => x !== frac(m, n))), e: `Multiples of ${k} up to ${n}: ${k}, ${2 * k}, …, ${m * k}, i.e. ${m} numbers.\nProbability = ${m}/${n} = **${frac(m, n)}**.`, d: 1 };
    },
    (r) => {
      const w = r.pick(["APPLE", "LOGIC", "ORANGE", "PUZZLE", "EQUATION", "TRIANGLE", "SCIENCE", "MONDAY"]), v = [...w].filter((c) => "AEIOU".includes(c)).length;
      return { q: `A letter is chosen at random from the word '${w}'. What is the probability that it is a vowel?`, ...textOptions(r, frac(v, w.length), [frac(w.length - v, w.length), frac(5, 26), frac(v, 26), frac(v + 1, w.length)].filter((x) => x !== frac(v, w.length))), e: `'${w}' has ${w.length} letters, of which ${v} are vowels.\nProbability = ${v}/${w.length} = **${frac(v, w.length)}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── True Discount ─────────────────────────
const trueDiscount = gen("true-discount", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const R = r.pick([4, 5, 6, 8, 10, 12]), T = r.int(1, 4), PW = 100 * r.int(5, 60), A = PW * (1 + (R * T) / 100), TD = A - PW;
      return { q: `What is the present worth of Rs. ${fmt(A)} due in ${T} year(s) at ${R}% per annum simple interest?`, ...numOptions(r, PW, { prefix: "Rs. ", wrong: [A - (A * R * T) / 100, A - TD / 2], step: PW / 20 }), e: `PW = (100 × A)/(100 + RT) = (100 × ${fmt(A)})/(100 + ${R * T}) = **Rs. ${fmt(PW)}**.`, d: 2 };
    },
    (r) => {
      const R = r.pick([4, 5, 6, 8, 10, 12]), T = r.int(1, 4), PW = 100 * r.int(5, 60), A = PW * (1 + (R * T) / 100), TD = A - PW;
      return { q: `Find the true discount on Rs. ${fmt(A)} due ${T} year(s) hence at ${R}% per annum.`, ...numOptions(r, TD, { prefix: "Rs. ", wrong: [(A * R * T) / 100, TD / 2], step: TD / 8 }), e: `TD = (A × R × T)/(100 + RT) = (${fmt(A)} × ${R} × ${T})/(100 + ${R * T}) = **Rs. ${fmt(TD)}**.\n(Equivalently TD = A − PW.)`, d: 2 };
    },
    (r) => {
      const R = r.pick([5, 8, 10, 12, 15]), T = r.int(1, 3), PW = 100 * r.int(5, 60), TD = (PW * R * T) / 100;
      return { q: `The true discount on a bill due ${T} year(s) hence at ${R}% per annum is Rs. ${fmt(TD)}. What is the amount of the bill?`, ...numOptions(r, PW + TD, { prefix: "Rs. ", wrong: [PW, (TD * 100) / R], step: PW / 20 }), e: `TD is the simple interest on the present worth: PW = (100 × TD)/(RT) = Rs. ${fmt(PW)}.\nAmount = PW + TD = ${fmt(PW)} + ${fmt(TD)} = **Rs. ${fmt(PW + TD)}**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Banker's Discount ─────────────────────────
const bankersDiscount = gen("bankers-discount", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const R = r.pick([4, 5, 6, 8, 10, 12]), months = r.pick([3, 4, 6, 8, 9, 12]), A = 100 * r.int(10, 200), BD = (A * R * months) / 1200;
      return { q: `What is the banker's discount on a bill of Rs. ${fmt(A)} due ${months} months hence at ${R}% per annum?`, ...numOptions(r, BD, { prefix: "Rs. ", wrong: [(A * R * months) / 100, (A * R) / 100], step: BD / 8 }), e: `BD = simple interest on the face value for the unexpired time = ${fmt(A)} × ${R}/100 × ${months}/12 = **Rs. ${fmt(BD)}**.`, d: 2 };
    },
    (r) => {
      const R = r.pick([5, 8, 10, 12, 15]), T = r.int(1, 3), PW = 100 * r.int(5, 60), TD = (PW * R * T) / 100, BG = (TD * R * T) / 100;
      return { q: `The true discount on a bill due ${T} year(s) hence at ${R}% per annum is Rs. ${fmt(TD)}. What is the banker's gain?`, ...numOptions(r, BG, { prefix: "Rs. ", wrong: [TD - BG, BG * 2, (TD * R) / 100 / 2], step: Math.max(0.5, BG / 6), dp: 2 }), e: `Banker's gain = SI on TD = ${fmt(TD)} × ${R} × ${T}/100 = **Rs. ${fmt(BG)}**.\n(Also BG = BD − TD = TD²/PW.)`, d: 2 };
    },
    (r) => {
      const R = r.pick([5, 8, 10, 12]), T = r.int(1, 3), PW = 100 * r.int(5, 40), TD = (PW * R * T) / 100, A = PW + TD, BD = (A * R * T) / 100;
      return { q: `The banker's discount on a sum is Rs. ${fmt(BD)} and the true discount is Rs. ${fmt(TD)}. What is the sum due?`, ...numOptions(r, A, { prefix: "Rs. ", wrong: [PW, BD + TD], step: A / 20 }), e: `Sum = (BD × TD)/(BD − TD) = (${fmt(BD)} × ${fmt(TD)})/${fmt(BD - TD)} = **Rs. ${fmt(A)}**.`, check: `${BD}*${TD}/(${BD}-${TD})`, d: 3 };
    },
  ])
);

// ───────────────────────── Odd Man Out and Series ─────────────────────────
function series(r: Rng): { seq: number[]; next: number; rule: string } {
  const kind = r.int(0, 7);
  const a = r.int(1, 20);
  switch (kind) {
    case 0: { const d = r.int(2, 15); const s = Array.from({ length: 6 }, (_, k) => a + d * k); return { seq: s.slice(0, 5), next: s[5], rule: `Each term increases by ${d}.` }; }
    case 1: { const q = r.int(2, 4), b = r.int(1, 6); const s = Array.from({ length: 6 }, (_, k) => b * q ** k); return { seq: s.slice(0, 5), next: s[5], rule: `Each term is multiplied by ${q}.` }; }
    case 2: { const o = r.int(1, 8); const s = Array.from({ length: 6 }, (_, k) => (k + o) ** 2); return { seq: s.slice(0, 5), next: s[5], rule: `The terms are squares: ${o}², ${o + 1}², … so the next is ${o + 5}².` }; }
    case 3: { const o = r.int(1, 5); const s = Array.from({ length: 6 }, (_, k) => (k + o) ** 3); return { seq: s.slice(0, 5), next: s[5], rule: `The terms are cubes: ${o}³, ${o + 1}³, … so the next is ${o + 5}³.` }; }
    case 4: { const d0 = r.int(1, 5), dd = r.int(1, 4); const s = [a]; for (let k = 0; k < 5; k++) s.push(s[k] + d0 + dd * k); return { seq: s.slice(0, 5), next: s[5], rule: `The differences are ${d0}, ${d0 + dd}, ${d0 + 2 * dd}, … increasing by ${dd} each time.` }; }
    case 5: { const m = r.int(2, 3), c = r.int(1, 5); const s = [r.int(1, 6)]; for (let k = 0; k < 5; k++) s.push(s[k] * m + c); return { seq: s.slice(0, 5), next: s[5], rule: `Each term = previous × ${m} + ${c}.` }; }
    case 6: { const o = r.int(1, 6), c = r.pick([1, -1]); const s = Array.from({ length: 6 }, (_, k) => (k + o) ** 2 + c); return { seq: s.slice(0, 5), next: s[5], rule: `The terms are n² ${c > 0 ? "+" : "−"} 1 for n = ${o}, ${o + 1}, …` }; }
    default: { const d1 = r.int(2, 9), d2 = r.int(2, 9), b = r.int(1, 10); if (d1 === d2) return series(r); const s = [b]; for (let k = 1; k < 6; k++) s.push(s[k - 1] + (k % 2 ? d1 : d2)); return { seq: s.slice(0, 5), next: s[5], rule: `The steps alternate: +${d1}, +${d2}, +${d1}, +${d2}, …` }; }
  }
}
const oddMan = gen("odd-man", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const { seq, next, rule } = series(r);
      return { q: `What number comes next in the series?\n${seq.join(", ")}, ?`, ...numOptions(r, next, { wrong: [next + seq[4] - seq[3], next - 1, next + 2], step: Math.max(1, Math.round(Math.abs(next - seq[4]) / 3)), min: -1e9 }), e: `${rule}\nNext term = **${next}**.`, d: 1 };
    },
    (r) => {
      const { seq, next, rule } = series(r), wrongPos = r.int(1, 4), shown = [...seq, next];
      const bad = shown[wrongPos] + r.pick([1, 2, -1, 3, -2]);
      if (shown.includes(bad)) return null;
      shown[wrongPos] = bad;
      return { q: `Find the wrong number in the series.\n${shown.join(", ")}`, ...textOptions(r, String(bad), shown.filter((x) => x !== bad).map(String)), e: `${rule}\nThe term ${bad} breaks the pattern; it should be ${[...seq, next][wrongPos]}. So the wrong number is **${bad}**.`, d: 2 };
    },
    (r) => {
      const primes = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
      const comps = [9, 15, 21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93];
      const opts = r.shuffle(primes).slice(0, 3), odd = r.pick(comps);
      const f = (n: number) => { for (let k = 3; k * k <= n; k += 2) if (n % k === 0) return `${k} × ${n / k}`; return ""; };
      return { q: "Find the odd man out.", ...textOptions(r, String(odd), opts.map(String)), e: `${opts.join(", ")} are prime numbers, but ${odd} = ${f(odd)} is not prime. The odd one out is **${odd}**.`, d: 1 };
    },
    (r) => {
      const base = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).slice(0, 3).map((x) => x * x), odd = r.pick([18, 24, 35, 48, 50, 63, 80, 99, 120, 143, 168]);
      return { q: "Find the odd man out.", ...textOptions(r, String(odd), base.map(String)), e: `${base.join(", ")} are perfect squares (${base.map((b) => `${Math.sqrt(b)}²`).join(", ")}); ${odd} is not. The odd one out is **${odd}**.`, d: 1 };
    },
    (r) => {
      const k = r.pick([3, 4, 6, 7, 8, 9, 11, 13]), mults = r.shuffle(Array.from({ length: 12 }, (_, j) => k * (j + 2))).slice(0, 3), odd = k * r.int(3, 12) + r.int(1, k - 1);
      return { q: "Find the odd man out.", ...textOptions(r, String(odd), mults.map(String)), e: `${mults.join(", ")} are all multiples of ${k}; ${odd} leaves remainder ${odd % k} when divided by ${k}. The odd one out is **${odd}**.`, d: 1 };
    },
  ])
);

export const part3: RawSubject = {
  "chain-rule": topic(chainRule, {
    intro: "Chain rule problems compare two situations where quantities vary directly or inversely. Decide for each quantity whether it increases or decreases the result, then multiply the ratios.",
    formulas: [
      { h: "Variation", points: ["Direct proportion: more cost for more items, more work for more men (same time)", "Inverse proportion: more men ⇒ fewer days; more hours per day ⇒ fewer days"] },
      { h: "Working formula", points: ["(M₁ × D₁ × H₁)/W₁ = (M₂ × D₂ × H₂)/W₂"] },
    ],
  }),
  "pipes-and-cistern": topic(pipes, {
    intro: "Pipes are Time and Work in disguise: an inlet does positive work, an outlet (or leak) does negative work.",
    formulas: [
      { h: "Rates", points: ["Inlet fills in x hours ⇒ fills 1/x per hour; outlet empties in y hours ⇒ −1/y per hour", "Both open (x < y): tank fills in xy/(y − x) hours", "Two inlets: xy/(x + y) hours"] },
      { h: "Leaks", points: ["A pipe fills in a hours but with a leak in b hours ⇒ the leak alone empties it in ab/(b − a) hours"] },
    ],
  }),
  "boats-and-streams": topic(boats, {
    intro: "Downstream means with the current, upstream means against it. If u is the boat's speed in still water and v is the stream's speed:",
    formulas: [
      { h: "Speeds", points: ["Downstream speed = u + v; upstream speed = u − v", "u = (downstream + upstream)/2; v = (downstream − upstream)/2"] },
      { h: "Time ratios", points: ["If going upstream takes k times as long as downstream, (u + v)/(u − v) = k"] },
    ],
  }),
  "alligation-or-mixture": topic(alligation, {
    intro: "Alligation finds the ratio in which two ingredients at different prices (or concentrations) must be mixed to get a mixture at a given mean price.",
    formulas: [
      { h: "Rule of alligation", points: ["Cheaper quantity : dearer quantity = (dearer price − mean price) : (mean price − cheaper price)"] },
      { h: "Repeated replacement", points: ["A container holds x units of liquid; y units are removed and replaced with water n times. Liquid left = x(1 − y/x)ⁿ"] },
    ],
  }),
  logarithm: topic(logarithm, {
    intro: "If aˣ = N, then x = logₐ N. Logarithms turn multiplication into addition and powers into multiplication.",
    formulas: [
      { h: "Laws", points: ["logₐ (xy) = logₐ x + logₐ y", "logₐ (x/y) = logₐ x − logₐ y", "logₐ (xⁿ) = n logₐ x", "logₐ a = 1, logₐ 1 = 0", "Change of base: logₐ x = log x / log a"] },
      { h: "Common values", points: ["log 2 ≈ 0.3010, log 3 ≈ 0.4771, log 5 = 1 − log 2 ≈ 0.6990", "Characteristic of log of a number with n digits before the decimal point = n − 1"] },
    ],
  }),
  "races-and-games": topic(races, {
    intro: "In a race of L metres, 'A beats B by x m' means B has run L − x m when A finishes. 'A gives B a start of x m' means B starts x m ahead.",
    formulas: [
      { h: "Comparing runners", points: ["If A beats B by x m in L m, their speeds are in the ratio L : (L − x)", "A beats B by x m and B beats C by y m in an L m race ⇒ A beats C by L − (L − x)(L − y)/L metres", "Dead heat: both reach the finishing post at the same time"] },
    ],
  }),
  "stocks-and-shares": topic(stocks, {
    intro: "A share's face value is fixed by the company; its market value changes. Dividend is always paid on the face value.",
    formulas: [
      { h: "Terms", points: ["At par: market value = face value; at premium: above; at discount: below", "'x% stock at p' means Rs. 100 of stock (face value) costs Rs. p and pays Rs. x a year"] },
      { h: "Formulas", points: ["Income = (investment × x)/p", "Yield (rate of return) = (x/p) × 100%", "Dividend on shares = number of shares × face value × dividend %"] },
    ],
  }),
  probability: topic(probability, {
    intro: "Probability measures how likely an event is: P(E) = number of favourable outcomes ÷ total number of equally likely outcomes.",
    formulas: [
      { h: "Rules", points: ["0 ≤ P(E) ≤ 1; P(not E) = 1 − P(E)", "P(A or B) = P(A) + P(B) − P(A and B)", "Independent events: P(A and B) = P(A) × P(B)"] },
      { h: "Standard sample spaces", points: ["n coins: 2ⁿ outcomes; two dice: 36 outcomes", "A pack of 52 cards has 4 suits of 13; 12 face cards (J, Q, K); 26 red and 26 black cards", "Drawing r items from n: ⁿCᵣ outcomes"] },
    ],
  }),
  "true-discount": topic(trueDiscount, {
    intro: "A sum A due T years later is worth less today. Its present worth (PW) is the amount which, with interest at R% for T years, becomes A. True discount (TD) is the difference.",
    formulas: [
      { h: "Formulas", points: ["PW = 100A/(100 + RT)", "TD = A − PW = ART/(100 + RT) = (PW × R × T)/100", "A = PW + TD"] },
    ],
  }),
  "bankers-discount": topic(bankersDiscount, {
    intro: "When a bill is cashed before its due date, the banker deducts simple interest on the full face value. That deduction is the banker's discount (BD); it is slightly more than the true discount.",
    formulas: [
      { h: "Formulas", points: ["BD = SI on the face value A for the unexpired time = ART/100", "Banker's gain BG = BD − TD = SI on TD = TD²/PW", "Sum due A = (BD × TD)/(BD − TD)", "TD = √(PW × BG)"] },
    ],
  }),
  "odd-man-out-and-series": topic(oddMan, {
    intro: "Find the rule that links the terms: a constant difference, a constant ratio, squares or cubes, growing differences, or two interleaved patterns. The odd man out is the term that breaks the rule.",
    formulas: [
      { h: "Checklist", points: ["Check differences between consecutive terms, then the differences of the differences", "Check ratios for geometric growth", "Compare terms with squares (1, 4, 9, 16, …) and cubes (1, 8, 27, 64, …) and with n² ± 1", "Look at alternate terms separately", "For odd man out, test primes, squares, cubes, multiples and digit sums"] },
    ],
  }),
};

