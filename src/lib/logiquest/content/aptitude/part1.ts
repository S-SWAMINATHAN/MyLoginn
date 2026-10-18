/** Arithmetic Aptitude, part 1: trains, distance, heights, work, interest, profit, partnership, percentage, ages, calendar, clock. */
import type { RawQ, RawSubject } from "../../types";
import { cycle, fmt, fracOptions, gcd, gen, mixed, numOptions, textOptions, topic } from "../build";

const N = 60;
const kmh = (ms: number) => (ms * 18) / 5;

// ───────────────────────── Problems on Trains ─────────────────────────
const trains = gen("trains", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const k = r.int(2, 6), t = r.int(6, 20), v = 18 * k, L = 5 * k * t;
      return { q: `A train running at ${v} km/hr crosses a pole in ${t} seconds. What is the length of the train?`, ...numOptions(r, L, { unit: "m", wrong: [v * t, L * 2, L / 2], step: 5 * k }), e: `Speed = ${v} × 5/18 = ${5 * k} m/s.\nLength of the train = speed × time = ${5 * k} × ${t} = **${L} m**.`, d: 1 };
    },
    (r) => {
      const s = 5 * r.int(2, 6), t = r.int(15, 40), total = s * t, L = 10 * r.int(5, Math.floor(total / 20)), P = total - L;
      if (P <= 0) return null;
      return { q: `A train ${L} m long crosses a platform ${P} m long in ${t} seconds. What is the speed of the train?`, ...numOptions(r, kmh(s), { unit: "km/hr", wrong: [s, kmh(L / t), kmh(P / t)], step: 9 }), e: `Distance covered = length of train + length of platform = ${L} + ${P} = ${total} m.\nSpeed = ${total}/${t} = ${s} m/s = ${s} × 18/5 = **${kmh(s)} km/hr**.`, d: 1 };
    },
    (r) => {
      const k = r.int(4, 10), rel = 5 * k, t = r.int(6, 15), total = rel * t, L1 = 10 * r.int(4, Math.floor(total / 20)), L2 = total - L1, v1 = r.int(2, 18 * k / 9 - 2) * 9;
      const v2 = 18 * k - v1;
      if (L2 <= 0 || v2 <= 0) return null;
      return { q: `Two trains ${L1} m and ${L2} m long are running in opposite directions on parallel tracks at ${v1} km/hr and ${v2} km/hr. In how much time will they cross each other completely?`, ...numOptions(r, t, { unit: "sec", wrong: [total / (5 * Math.abs(v1 - v2) / 18) || t + 4], step: 1 }), e: `Relative speed (opposite directions) = ${v1} + ${v2} = ${18 * k} km/hr = ${18 * k} × 5/18 = ${rel} m/s.\nDistance = ${L1} + ${L2} = ${total} m.\nTime = ${total}/${rel} = **${t} seconds**.`, d: 2 };
    },
    (r) => {
      const j = r.int(1, 4), rel = 5 * j, t = r.int(10, 30), L = rel * t, u = r.int(2, 8), v = u + 18 * j;
      return { q: `A train ${L} m long passes a man running at ${u} km/hr in the same direction in ${t} seconds. What is the speed of the train?`, ...numOptions(r, v, { unit: "km/hr", wrong: [18 * j, v + 2 * u, 18 * j - u], step: 3 }), e: `Speed of the train relative to the man = ${L}/${t} = ${rel} m/s = ${rel} × 18/5 = ${18 * j} km/hr.\nSince both move in the same direction, train speed − ${u} = ${18 * j}, so the speed of the train = **${v} km/hr**.`, d: 2 };
    },
    (r) => {
      const s = r.int(10, 25), t1 = r.int(8, 20), gap = r.int(10, 30), P = s * gap, L = s * t1;
      return { q: `A train passes a station platform in ${t1 + gap} seconds and a man standing on the platform in ${t1} seconds. If the speed of the train is ${fmt(kmh(s))} km/hr, what is the length of the platform?`, ...numOptions(r, P, { unit: "m", wrong: [L, P + L, s * (t1 + gap)], step: 10 }), e: `Speed = ${fmt(kmh(s))} × 5/18 = ${s} m/s.\nLength of train = ${s} × ${t1} = ${L} m.\nTrain + platform = ${s} × ${t1 + gap} = ${s * (t1 + gap)} m.\nLength of platform = ${s * (t1 + gap)} − ${L} = **${P} m**.`, d: 2 };
    },
    (r) => {
      const v1 = 9 * r.int(6, 12), v2 = 9 * r.int(2, 5), rel = ((v1 - v2) * 5) / 18, t = r.int(20, 50), total = rel * t;
      if (!Number.isInteger(total)) return null;
      const L1 = 10 * r.int(5, Math.max(6, Math.floor(total / 20)));
      const L2 = total - L1;
      if (L2 <= 0) return null;
      return { q: `Two trains of lengths ${L1} m and ${L2} m run on parallel lines in the same direction at ${v1} km/hr and ${v2} km/hr. How long does the faster train take to pass the slower one completely?`, ...numOptions(r, t, { unit: "sec", wrong: [Math.round(total / (((v1 + v2) * 5) / 18))], step: 2 }), e: `Relative speed (same direction) = ${v1} − ${v2} = ${v1 - v2} km/hr = ${fmt(rel)} m/s.\nDistance = ${L1} + ${L2} = ${total} m.\nTime = ${total}/${fmt(rel)} = **${t} seconds**.`, d: 2 };
    },
    (r) => {
      const k = r.int(2, 5), s = 5 * k, L = 10 * r.int(10, 30), B = 10 * r.int(10, 40), t = (L + B) / s;
      if (!Number.isInteger(t)) return null;
      return { q: `How many seconds will a train ${L} m long running at ${18 * k} km/hr take to cross a bridge ${B} m long?`, ...numOptions(r, t, { unit: "sec", wrong: [B / s, L / s, (L + B) / (18 * k)].map((x) => Math.round(x)), step: 2 }), e: `Speed = ${18 * k} × 5/18 = ${s} m/s.\nDistance = train + bridge = ${L} + ${B} = ${L + B} m.\nTime = ${L + B}/${s} = **${t} seconds**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Time and Distance ─────────────────────────
const AVG_PAIRS: [number, number][] = [[30, 60], [40, 60], [20, 30], [45, 90], [36, 45], [60, 90], [30, 45], [12, 24], [10, 15], [42, 56], [20, 80], [24, 40], [15, 30], [60, 40], [35, 140]];
const timeDistance = gen("time-distance", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const k = r.int(2, 20), v = 18 * k;
      return r.chance(0.5)
        ? { q: `Express a speed of ${v} km/hr in metres per second.`, ...numOptions(r, 5 * k, { unit: "m/s", wrong: [v / 5, (v * 18) / 5, v / 3.6 + 2], step: 2 }), e: `To convert km/hr to m/s multiply by 5/18.\n${v} × 5/18 = **${5 * k} m/s**.`, d: 1 }
        : { q: `Express a speed of ${5 * k} m/s in km/hr.`, ...numOptions(r, v, { unit: "km/hr", wrong: [(5 * k * 5) / 18, v / 2, v + 18], step: 6 }), e: `To convert m/s to km/hr multiply by 18/5.\n${5 * k} × 18/5 = **${v} km/hr**.`, d: 1 };
    },
    (r) => {
      const [a, b] = r.pick(AVG_PAIRS);
      const avg = (2 * a * b) / (a + b);
      return { q: `A car travels from A to B at ${a} km/hr and returns from B to A at ${b} km/hr. What is the average speed for the whole journey?`, ...numOptions(r, avg, { unit: "km/hr", wrong: [(a + b) / 2, Math.sqrt(a * b)], step: 2 }), e: `For equal distances at speeds x and y, average speed = 2xy/(x + y).\n= (2 × ${a} × ${b})/(${a} + ${b}) = ${2 * a * b}/${a + b} = **${fmt(avg)} km/hr**.\n(The simple average ${fmt((a + b) / 2)} is wrong because more time is spent at the lower speed.)`, d: 2 };
    },
    (r) => {
      for (let tries = 0; tries < 30; tries++) {
        const s1 = r.int(3, 8), s2 = s1 + r.int(1, 3), D = r.int(2, 30);
        const M = (60 * D * (s2 - s1)) / (s1 * s2);
        if (!Number.isInteger(M) || M < 6 || M > 60) continue;
        const m1 = r.int(1, M - 1), m2 = M - m1;
        return { q: `If a boy walks from his house to school at ${s1} km/hr, he is ${m1} minutes late. If he walks at ${s2} km/hr, he is ${m2} minutes early. What is the distance from his house to school?`, ...numOptions(r, D, { unit: "km", wrong: [D * 2, (s1 + s2) / 2, M / 10], step: 1 }), e: `Let the distance be d km. The difference between the two times is ${m1} + ${m2} = ${M} minutes = ${M}/60 hr.\nd/${s1} − d/${s2} = ${M}/60 ⇒ d × ${s2 - s1}/${s1 * s2} = ${M}/60 ⇒ d = **${D} km**.`, d: 3 };
      }
      return null;
    },
    (r) => {
      const [p, q] = r.pick([[3, 4], [4, 5], [2, 3], [5, 6], [6, 7], [7, 8]] as [number, number][]);
      const t = p * r.int(2, 8) * (q - p);
      const mlate = (t * (q - p)) / p;
      return { q: `Walking at ${p}/${q} of his usual speed, a man is ${mlate} minutes late. What is his usual time to cover the distance?`, ...numOptions(r, t, { unit: "minutes", wrong: [mlate * q, mlate * p + 5, t + mlate], step: 5 }), e: `At ${p}/${q} of the speed, time becomes ${q}/${p} of the usual time t.\n(${q}/${p})t − t = ${mlate} ⇒ t × ${q - p}/${p} = ${mlate} ⇒ t = **${t} minutes**.`, d: 2 };
    },
    (r) => {
      const v = r.pick([30, 40, 45, 48, 50, 54, 60, 72, 75, 90]), mins = r.pick([12, 15, 20, 24, 30, 36, 40, 45, 48]), D = (v * mins) / 60;
      if (!Number.isInteger(D * 10)) return null;
      return { q: `How far does a cyclist travel in ${mins} minutes at a speed of ${v} km/hr?`, ...numOptions(r, D, { unit: "km", wrong: [v * mins / 100, D * 2], step: 2 }), e: `Time = ${mins}/60 hr.\nDistance = speed × time = ${v} × ${mins}/60 = **${fmt(D)} km**.`, d: 1 };
    },
    (r) => {
      const D = r.pick([120, 150, 180, 240, 300, 360, 420, 480, 600]), t1 = r.pick([3, 4, 5, 6]), t2 = r.pick([2, 3, 4].filter((x) => x < t1));
      const v2 = D / t2;
      if (!Number.isInteger(v2)) return null;
      return { q: `A car covers ${D} km in ${t1} hours. At what speed must it travel to cover the same distance in ${t2} hours?`, ...numOptions(r, v2, { unit: "km/hr", wrong: [D / t1, (D / t1) * (t1 / t2) + 10], step: 5 }), e: `Required speed = distance/time = ${D}/${t2} = **${fmt(v2)} km/hr**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Height and Distance ─────────────────────────
const root3 = (k: number) => (k === 1 ? "√3" : `${k}√3`);
const heightDistance = gen("height-distance", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const d = 10 * r.int(2, 12);
      const ans = `${root3(d)} m`;
      return { q: `The angle of elevation of the top of a tower from a point ${d} m away from its foot is 60°. What is the height of the tower?`, ...textOptions(r, ans, [`${d} m`, `${root3(d / 10 * 5)} m`, `${(2 * d)} m`, `${d / 2}√3 m`]), e: `tan 60° = height/distance ⇒ height = ${d} × tan 60° = ${d} × √3 = **${root3(d)} m**.`, d: 1 };
    },
    (r) => {
      const d = 3 * r.int(3, 20);
      return { q: `From a point on the ground ${d} m away from the foot of a pole, the angle of elevation of the top is 30°. What is the height of the pole?`, ...textOptions(r, `${root3(d / 3)} m`, [`${root3(d)} m`, `${d / 3} m`, `${root3(d / 3 * 2)} m`, `${d} m`]), e: `tan 30° = h/${d} ⇒ h = ${d} × 1/√3 = ${d}/√3 = ${d}√3/3 = **${root3(d / 3)} m**.`, d: 1 };
    },
    (r) => {
      const h = 5 * r.int(4, 30);
      return { q: `The angle of elevation of the sun is 45°. What is the length of the shadow of a ${h} m tall tree?`, ...numOptions(r, h, { unit: "m", wrong: [h * 2, h / 2], step: 5 }), e: `tan 45° = height/shadow = 1, so the shadow equals the height: **${h} m**.`, d: 1 };
    },
    (r) => {
      const x = r.int(2, 12);
      return { q: `A ladder leaning against a wall makes an angle of 60° with the ground. The foot of the ladder is ${x} m from the wall. What is the length of the ladder?`, ...numOptions(r, 2 * x, { unit: "m", wrong: [x, x * 1.5, 3 * x], step: 1 }), e: `cos 60° = base/ladder ⇒ 1/2 = ${x}/L ⇒ L = **${2 * x} m**.`, d: 1 };
    },
    (r) => {
      const k = r.int(2, 20), h = k * 3;
      return { q: `From the top of a ${root3(k)} m high cliff, the angle of depression of a boat is 30°. How far is the boat from the foot of the cliff?`, ...numOptions(r, h, { unit: "m", wrong: [k, 2 * k, h * 2], step: 2 }), e: `The angle of depression equals the angle of elevation from the boat (30°).\ntan 30° = ${root3(k)}/d ⇒ d = ${root3(k)} × √3 = **${h} m**.`, d: 2 };
    },
    (r) => {
      const k = r.int(5, 30);
      return { q: `The angles of elevation of the top of a ${root3(k)} m tower from two points on the same side of it, in line with its foot, are 30° and 60°. What is the distance between the two points?`, ...numOptions(r, 2 * k, { unit: "m", wrong: [k, 3 * k, 4 * k], step: 2 }), e: `Let the height be h = ${root3(k)} m.\nFrom 60°: d₁ = h/√3 = ${k} m. From 30°: d₂ = h√3 = ${3 * k} m.\nDistance between the points = ${3 * k} − ${k} = **${2 * k} m**.`, d: 3 };
    },
  ])
);

// ───────────────────────── Time and Work ─────────────────────────
const timeWork = gen("time-work", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(4, 30), b = r.int(4, 30);
      if (a === b) return null;
      const n = a * b, d = a + b;
      return { q: `A can do a piece of work in ${a} days and B can do it in ${b} days. In how many days will they finish it working together?`, ...fracOptions(r, n, d, [[a + b, 2], [Math.abs(a - b) || 1, 1]], "days"), e: `In one day A does 1/${a} and B does 1/${b} of the work.\nTogether: 1/${a} + 1/${b} = ${d}/${n} of the work per day.\nTime = ${n}/${d} = **${mixed(n, d)} days**.`, d: 1 };
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const x = r.int(4, 20), a = r.int(x + 2, 3 * x);
        const bN = a * x, bD = a - x;
        if (bN % bD) continue;
        return { q: `A and B together can complete a work in ${x} days. A alone can complete it in ${a} days. In how many days can B alone complete the work?`, ...numOptions(r, bN / bD, { unit: "days", wrong: [a - x, a + x], step: 2 }), e: `B's one day's work = 1/${x} − 1/${a} = ${a - x}/${a * x}.\nSo B alone takes ${a * x}/${a - x} = **${bN / bD} days**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      const x = r.int(2, 12);
      return { q: `A is twice as efficient as B. Together they finish a job in ${x} days. How long would A take to do it alone?`, ...fracOptions(r, 3 * x, 2, [[3 * x, 1], [2 * x, 1]], "days"), e: `Let B's rate be b per day; A's rate is 2b. Together 3b = 1/${x}, so b = 1/${3 * x} and A = 2/${3 * x}.\nA alone takes ${3 * x}/2 = **${mixed(3 * x, 2)} days**.`, d: 2 };
    },
    (r) => {
      const m1 = r.int(4, 30), d1 = r.int(6, 40), m2 = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30].filter((v) => (m1 * d1) % v === 0 && v !== m1));
      if (!m2) return null;
      return { q: `${m1} men can complete a work in ${d1} days. In how many days will ${m2} men complete the same work?`, ...numOptions(r, (m1 * d1) / m2, { unit: "days", wrong: [(m2 * d1) / m1, d1 + m1 - m2], step: 2 }), e: `Total work = ${m1} × ${d1} = ${m1 * d1} man-days.\nDays for ${m2} men = ${m1 * d1}/${m2} = **${(m1 * d1) / m2} days**.`, d: 1 };
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const a = r.int(6, 30), b = r.int(6, 30), k = r.int(2, 6);
        const doneN = k * (a + b), L = a * b; // work done together in k days = k(a+b)/(ab)
        if (doneN >= L) continue;
        const remN = L - doneN; // remaining fraction remN/L, B alone at 1/b
        const days = remN / a; // (remN/L) / (1/b) = remN*b/L = remN/a
        if (!Number.isInteger(days)) continue;
        return { q: `A can finish a work in ${a} days and B in ${b} days. They work together for ${k} days and then A leaves. In how many more days will B finish the remaining work?`, ...numOptions(r, days, { unit: "days", wrong: [b - k, Math.round(remN / b) || days + 3], step: 1 }), e: `Work done in ${k} days together = ${k}(1/${a} + 1/${b}) = ${doneN}/${L}.\nRemaining = 1 − ${doneN}/${L} = ${remN}/${L}.\nB does 1/${b} per day, so B needs (${remN}/${L}) × ${b} = **${days} days**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const a = r.int(6, 24), b = r.int(6, 24), c = r.int(6, 24);
        const n = a * b * c, d = b * c + a * c + a * b;
        if (new Set([a, b, c]).size < 3 || n % d) continue;
        return { q: `A, B and C can do a piece of work in ${a}, ${b} and ${c} days respectively. Working together, how long will they take to finish it?`, ...numOptions(r, n / d, { unit: "days", wrong: [(a + b + c) / 3, Math.min(a, b, c) - 1], step: 1 }), e: `One day's work = 1/${a} + 1/${b} + 1/${c} = ${d / gcd(d, n)}/${n / gcd(d, n)}.\nTime = **${n / d} days**.`, d: 2 };
      }
      return null;
    },
  ])
);

// ───────────────────────── Simple Interest ─────────────────────────
const simpleInterest = gen("simple-interest", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const P = 500 * r.int(2, 40), R = r.pick([4, 5, 6, 8, 10, 12, 12.5, 15]), T = r.int(2, 6), SI = (P * R * T) / 100;
      return { q: `What is the simple interest on Rs. ${fmt(P)} at ${R}% per annum for ${T} years?`, ...numOptions(r, SI, { prefix: "Rs. ", wrong: [(P * R) / 100, SI + (P * R) / 100, P + SI], step: (P * R) / 200 }), e: `SI = (P × R × T)/100 = (${fmt(P)} × ${R} × ${T})/100 = **Rs. ${fmt(SI)}**.`, check: `${P}*${R}*${T}/100`, d: 1 };
    },
    (r) => {
      const P = 1000 * r.int(2, 20), R = r.pick([4, 5, 6, 8, 10, 12, 15]), T = r.int(2, 6), SI = (P * R * T) / 100;
      return { q: `A sum of Rs. ${fmt(P)} earns a simple interest of Rs. ${fmt(SI)} in ${T} years. What is the rate of interest per annum?`, ...numOptions(r, R, { unit: "%", wrong: [R + T, SI / P * 10], step: 1 }), e: `R = (SI × 100)/(P × T) = (${fmt(SI)} × 100)/(${fmt(P)} × ${T}) = **${R}%**.`, d: 1 };
    },
    (r) => {
      const P = 100 * r.int(10, 90), I = P * r.pick([4, 5, 6, 8, 10]) / 100, t1 = r.int(2, 4), t2 = t1 + r.int(1, 4);
      const A1 = P + I * t1, A2 = P + I * t2;
      return { q: `A sum of money amounts to Rs. ${fmt(A1)} in ${t1} years and to Rs. ${fmt(A2)} in ${t2} years at simple interest. What is the sum?`, ...numOptions(r, P, { prefix: "Rs. ", wrong: [A1 - I, A1 - (A2 - A1), P + I], step: 100 }), e: `SI for ${t2 - t1} year(s) = ${fmt(A2)} − ${fmt(A1)} = Rs. ${fmt(A2 - A1)}, so SI per year = Rs. ${fmt(I)}.\nSI for ${t1} years = Rs. ${fmt(I * t1)}.\nPrincipal = ${fmt(A1)} − ${fmt(I * t1)} = **Rs. ${fmt(P)}**.`, d: 2 };
    },
    (r) => {
      const R = r.pick([4, 5, 8, 10, 12.5, 20, 25]), T = 100 / R;
      return { q: `In how many years will a sum of money double itself at ${R}% per annum simple interest?`, ...numOptions(r, T, { unit: "years", wrong: [200 / R, 50 / R], step: 2 }), e: `To double, SI must equal P: P × ${R} × T/100 = P ⇒ T = 100/${R} = **${fmt(T)} years**.`, d: 1 };
    },
    (r) => {
      const R = r.pick([5, 6, 8, 10, 12]), T = r.int(2, 5), P = 1000 * r.int(2, 15), SI = (P * R * T) / 100;
      return { q: `At ${R}% per annum simple interest, what principal yields Rs. ${fmt(SI)} as interest in ${T} years?`, ...numOptions(r, P, { prefix: "Rs. ", wrong: [SI * R, (SI * 100) / R], step: 1000 }), e: `P = (SI × 100)/(R × T) = (${fmt(SI)} × 100)/(${R} × ${T}) = **Rs. ${fmt(P)}**.`, d: 1 };
    },
    (r) => {
      const P = 1000 * r.int(2, 12), k = r.pick([2, 3, 4]), T = r.pick([4, 5, 8, 10]);
      const R = ((k - 1) * 100) / T;
      if (!Number.isInteger(R * 2)) return null;
      return { q: `A sum of Rs. ${fmt(P)} becomes ${k} times itself in ${T} years at simple interest. What is the rate of interest?`, ...numOptions(r, R, { unit: "%", wrong: [(k * 100) / T, R / 2], step: 2.5 }), e: `Amount = ${k}P, so SI = ${k - 1}P.\n${k - 1}P = P × R × ${T}/100 ⇒ R = ${(k - 1) * 100}/${T} = **${fmt(R)}%**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Compound Interest ─────────────────────────
const compoundInterest = gen("compound-interest", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const R = r.pick([5, 10, 20, 4, 8, 15]), P = (R % 10 === 0 ? 100 : 400) * r.int(10, 60), CI = P * ((1 + R / 100) ** 2 - 1);
      return { q: `What is the compound interest on Rs. ${fmt(P)} at ${R}% per annum for 2 years, compounded annually?`, ...numOptions(r, CI, { prefix: "Rs. ", wrong: [(2 * P * R) / 100, P * (R / 100) ** 2, CI + P], step: P / 100 }), e: `Amount = P(1 + R/100)² = ${fmt(P)} × (${fmt(1 + R / 100)})² = Rs. ${fmt(P + CI)}.\nCI = ${fmt(P + CI)} − ${fmt(P)} = **Rs. ${fmt(CI)}**.`, check: `${P}*((1+${R}/100)**2-1)`, d: 1 };
    },
    (r) => {
      const R = r.pick([4, 5, 8, 10, 12, 15, 20]), P = 100 * r.int(5, 120), D = P * (R / 100) ** 2;
      return { q: `The difference between compound interest and simple interest on a certain sum at ${R}% per annum for 2 years is Rs. ${fmt(D)}. What is the sum?`, ...numOptions(r, P, { prefix: "Rs. ", wrong: [(D * 100) / R, P * 2, P / 2], step: P / 10 }), e: `For 2 years, CI − SI = P(R/100)².\n${fmt(D)} = P × (${R}/100)² ⇒ P = ${fmt(D)} × ${10000 / R ** 2 === Math.round(10000 / R ** 2) ? 10000 / R ** 2 : `10000/${R ** 2}`} = **Rs. ${fmt(P)}**.`, d: 2 };
    },
    (r) => {
      const R = r.pick([10, 20]), P = 1000 * r.int(1, 20), A = P * (1 + R / 100) ** 3;
      return { q: `Find the amount on Rs. ${fmt(P)} for 3 years at ${R}% per annum compounded annually.`, ...numOptions(r, A, { prefix: "Rs. ", wrong: [P + (3 * P * R) / 100, P * (1 + R / 100) ** 2], step: P / 20 }), e: `A = P(1 + R/100)³ = ${fmt(P)} × (${fmt(1 + R / 100)})³ = **Rs. ${fmt(A)}**.`, check: `${P}*(1+${R}/100)**3`, d: 2 };
    },
    (r) => {
      const R = r.pick([10, 20, 8, 4]), P = 1600 * r.int(1, 10), A = P * (1 + R / 200) ** 2;
      return { q: `Find the compound interest on Rs. ${fmt(P)} at ${R}% per annum for 1 year, compounded half-yearly.`, ...numOptions(r, A - P, { prefix: "Rs. ", wrong: [(P * R) / 100, (A - P) * 2], step: P / 100 }), e: `Half-yearly: rate per half-year = ${R / 2}%, number of periods = 2.\nA = ${fmt(P)} × (1 + ${R / 2}/100)² = Rs. ${fmt(A)}.\nCI = ${fmt(A)} − ${fmt(P)} = **Rs. ${fmt(A - P)}**.`, check: `${P}*(1+${R}/200)**2-${P}`, d: 2 };
    },
    (r) => {
      const n = r.int(2, 8), k = r.pick([2, 3]);
      return { q: `A sum of money doubles itself at compound interest in ${n} years. In how many years will it become ${2 ** k === 4 ? "four" : "eight"} times?`, ...numOptions(r, n * k, { unit: "years", wrong: [n * 2 ** (k - 1) * 2, n * (2 ** k - 1)], step: n }), e: `Under compound interest the sum multiplies by 2 every ${n} years.\n${2 ** k} = 2^${k}, so it takes ${k} × ${n} = **${n * k} years**.`, d: 2 };
    },
    (r) => {
      const A1 = 100 * r.int(20, 80), R = r.pick([5, 10, 20, 25]), A2 = A1 * (1 + R / 100);
      if (!Number.isInteger(A2)) return null;
      return { q: `A sum amounts to Rs. ${fmt(A1)} in 2 years and to Rs. ${fmt(A2)} in 3 years at compound interest. What is the rate of interest?`, ...numOptions(r, R, { unit: "%", wrong: [R / 2, R + 5], step: 5 }), e: `Interest on Rs. ${fmt(A1)} for 1 year = ${fmt(A2)} − ${fmt(A1)} = Rs. ${fmt(A2 - A1)}.\nRate = (${fmt(A2 - A1)}/${fmt(A1)}) × 100 = **${R}%**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Profit and Loss ─────────────────────────
const profitLoss = gen("profit-loss", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const CP = 20 * r.int(10, 100), p = r.pick([5, 10, 12.5, 15, 20, 25, 30, 40]), SP = CP * (1 + p / 100);
      return { q: `An article bought for Rs. ${fmt(CP)} is sold for Rs. ${fmt(SP)}. What is the gain percent?`, ...numOptions(r, p, { unit: "%", wrong: [((SP - CP) / SP) * 100, p + 5], step: 2.5 }), e: `Gain = ${fmt(SP)} − ${fmt(CP)} = Rs. ${fmt(SP - CP)}.\nGain % = (Gain/CP) × 100 = (${fmt(SP - CP)}/${fmt(CP)}) × 100 = **${fmt(p)}%**.`, d: 1 };
    },
    (r) => {
      const CP = 20 * r.int(10, 100), l = r.pick([5, 10, 15, 20, 25]), SP = CP * (1 - l / 100);
      return { q: `A man sold an article for Rs. ${fmt(SP)} at a loss of ${l}%. What was the cost price?`, ...numOptions(r, CP, { prefix: "Rs. ", wrong: [SP * (1 + l / 100), SP + l], step: CP / 20 }), e: `SP = CP × (100 − ${l})/100 ⇒ CP = ${fmt(SP)} × 100/${100 - l} = **Rs. ${fmt(CP)}**.\n(Adding ${l}% to the SP is a common mistake: the loss is a percentage of the CP.)`, d: 1 };
    },
    (r) => {
      const CP = 100 * r.int(5, 50), m = r.pick([20, 25, 30, 40, 50]), d = r.pick([10, 15, 20, 25]), MP = CP * (1 + m / 100), SP = MP * (1 - d / 100), g = ((SP - CP) / CP) * 100;
      return { q: `A shopkeeper marks his goods ${m}% above the cost price and allows a discount of ${d}%. What is his gain percent?`, ...numOptions(r, g, { unit: "%", wrong: [m - d, m + d], step: 2 }), e: `Take CP = 100. Marked price = ${100 + m}. SP = ${100 + m} × ${(100 - d) / 100} = ${fmt(((100 + m) * (100 - d)) / 100)}.\nGain = ${fmt(g)}% (net effect = ${m} − ${d} − ${m}×${d}/100 = **${fmt(g)}%**).`, d: 2 };
    },
    (r) => {
      const y = r.int(10, 25), x = y + r.int(1, 8), g = ((x - y) / y) * 100;
      return { q: `The cost price of ${x} articles is equal to the selling price of ${y} articles. What is the gain percent?`, ...numOptions(r, g, { unit: "%", wrong: [((x - y) / x) * 100, x - y], step: 2 }), e: `Let the CP of one article be Re. 1. Then SP of ${y} articles = Rs. ${x}, so CP of ${y} articles = Rs. ${y}.\nGain % = (${x} − ${y})/${y} × 100 = **${fmt(g)}%**.`, d: 2 };
    },
    (r) => {
      const x = r.pick([5, 10, 12, 15, 20, 25]), loss = (x * x) / 100;
      return { q: `A man sells two articles at the same price. On one he gains ${x}% and on the other he loses ${x}%. What is his overall gain or loss percent?`, ...textOptions(r, `${fmt(loss)}% loss`, [`${fmt(loss)}% gain`, "No gain, no loss", `${x}% loss`, `${fmt(loss * 2)}% loss`]), e: `When two items are sold at the same price with x% gain and x% loss, there is always a loss of x²/100 %.\n= ${x}²/100 = **${fmt(loss)}% loss**.`, d: 2 };
    },
    (r) => {
      const w = r.pick([800, 900, 950, 960, 920, 850, 875]), g = ((1000 - w) / w) * 100;
      return { q: `A dishonest dealer professes to sell his goods at cost price but uses a weight of ${w} g for a kilogram. What is his gain percent?`, ...numOptions(r, g, { unit: "%", wrong: [(1000 - w) / 10, g + 1], step: 1, dp: 2 }), e: `He gives ${w} g but charges for 1000 g. Gain = ${1000 - w} g on ${w} g.\nGain % = (${1000 - w}/${w}) × 100 = **${fmt(g)}%**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Partnership ─────────────────────────
const partnership = gen("partnership", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = 1000 * r.int(2, 15), b = 1000 * r.int(2, 15), P = (a + b) / 1000 * 100 * r.int(2, 30), sb = (P * b) / (a + b);
      if (a === b) return null;
      return { q: `A and B start a business with Rs. ${fmt(a)} and Rs. ${fmt(b)}. At the end of the year the profit is Rs. ${fmt(P)}. What is B's share?`, ...numOptions(r, sb, { prefix: "Rs. ", wrong: [P - sb, P / 2], step: P / 20 }), e: `Profit is shared in the ratio of capitals ${fmt(a)} : ${fmt(b)} = ${a / gcd(a, b)} : ${b / gcd(a, b)}.\nB's share = ${fmt(P)} × ${b / gcd(a, b)}/${(a + b) / gcd(a, b)} = **Rs. ${fmt(sb)}**.`, d: 1 };
    },
    (r) => {
      const a = 1000 * r.int(2, 10), b = 1000 * r.int(2, 10), m = r.int(2, 9), ca = a * 12, cb = b * (12 - m), g = gcd(ca, cb), P = ((ca + cb) / g) * 100 * r.int(1, 8), sa = (P * ca) / (ca + cb);
      return { q: `A starts a business with Rs. ${fmt(a)}. After ${m} months B joins with Rs. ${fmt(b)}. Out of a total annual profit of Rs. ${fmt(P)}, what is A's share?`, ...numOptions(r, sa, { prefix: "Rs. ", wrong: [(P * a) / (a + b), P - sa], step: P / 25 }), e: `A's capital-months = ${fmt(a)} × 12 = ${fmt(ca)}; B's = ${fmt(b)} × ${12 - m} = ${fmt(cb)}.\nRatio = ${ca / g} : ${cb / g}.\nA's share = ${fmt(P)} × ${ca / g}/${(ca + cb) / g} = **Rs. ${fmt(sa)}**.`, d: 2 };
    },
    (r) => {
      const [x, y, z] = [r.int(1, 6), r.int(1, 6), r.int(1, 6)], P = (x + y + z) * 100 * r.int(5, 40), sc = (P * z) / (x + y + z);
      return { q: `A, B and C invest in the ratio ${x} : ${y} : ${z} for the same period. If the total profit is Rs. ${fmt(P)}, what is C's share?`, ...numOptions(r, sc, { prefix: "Rs. ", wrong: [P / 3, (P * x) / (x + y + z), (P * y) / (x + y + z)], step: P / 30 }), e: `C's share = ${fmt(P)} × ${z}/${x + y + z} = **Rs. ${fmt(sc)}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), ta = r.int(3, 12), tb = r.int(3, 12);
      const ra = a * ta, rb = b * tb, g = gcd(ra, rb);
      return { q: `A invests Rs. ${a},000 for ${ta} months and B invests Rs. ${b},000 for ${tb} months. In what ratio should they share the profit?`, ...textOptions(r, `${ra / g} : ${rb / g}`, [`${a} : ${b}`, `${ta} : ${tb}`, `${rb / g} : ${ra / g}`, `${a * tb} : ${b * ta}`]), e: `Profit ratio = capital × time.\nA : B = ${a} × ${ta} : ${b} × ${tb} = ${ra} : ${rb} = **${ra / g} : ${rb / g}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Percentage ─────────────────────────
const percentage = gen("percentage", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const x = r.pick([5, 8, 12, 15, 16, 18, 24, 25, 35, 45, 60, 75]), y = 20 * r.int(5, 60), v = (x * y) / 100;
      return { q: `What is ${x}% of ${y}?`, ...numOptions(r, v, { wrong: [(y * 100) / x, v * 10], step: Math.max(1, v / 10) }), e: `${x}% of ${y} = (${x}/100) × ${y} = **${fmt(v)}**.`, check: `${x}*${y}/100`, d: 1 };
    },
    (r) => {
      const a = 20 * r.int(3, 40), p = r.pick([5, 10, 12.5, 15, 20, 25, 30, 40, 60, 75, 80]), b = (a * p) / 100;
      return { q: `${fmt(b)} is what percent of ${a}?`, ...numOptions(r, p, { unit: "%", wrong: [(a / b) * 10, p * 2], step: 5 }), e: `Required % = (${fmt(b)}/${a}) × 100 = **${fmt(p)}%**.`, d: 1 };
    },
    (r) => {
      const a = r.pick([10, 20, 25, 30, 40, 50]), b = r.pick([10, 20, 25, 30, 40, 50]), net = a - b - (a * b) / 100;
      const txt = net === 0 ? "No change" : `${fmt(Math.abs(net))}% ${net > 0 ? "increase" : "decrease"}`;
      return { q: `The price of an item is first increased by ${a}% and then decreased by ${b}%. What is the net change in price?`, ...textOptions(r, txt, [`${fmt(Math.abs(a - b))}% ${a - b >= 0 ? "increase" : "decrease"}`, `${fmt(Math.abs(net) + 2)}% ${net >= 0 ? "increase" : "decrease"}`, `${fmt(Math.abs(net))}% ${net > 0 ? "decrease" : "increase"}`, "No change", `${a + b}% increase`]), e: `Net change = a + b + ab/100 with a = +${a}, b = −${b}:\n${a} − ${b} − (${a} × ${b})/100 = ${fmt(net)}%, i.e. **${txt}**.`, d: 2 };
    },
    (r) => {
      const x = r.pick([10, 20, 25, 30, 40, 50, 60]), red = (x / (100 + x)) * 100;
      return { q: `The price of sugar rises by ${x}%. By how much percent must a household reduce its consumption so that its expenditure does not change?`, ...numOptions(r, red, { unit: "%", wrong: [x, x / 2, (x / (100 - x)) * 100], step: 2, dp: 2 }), e: `Reduction % = x/(100 + x) × 100 = ${x}/${100 + x} × 100 = **${fmt(red)}%**.`, d: 2 };
    },
    (r) => {
      const x = r.pick([10, 20, 25, 50, 60, 100]), less = (x / (100 + x)) * 100;
      return { q: `A's salary is ${x}% more than B's. By what percent is B's salary less than A's?`, ...numOptions(r, less, { unit: "%", wrong: [x, (x / (100 - x || 1)) * 100], step: 2, dp: 2 }), e: `If B = 100, A = ${100 + x}. B is less than A by ${x} on ${100 + x}.\n= ${x}/${100 + x} × 100 = **${fmt(less)}%**.`, d: 2 };
    },
    (r) => {
      const P = 1000 * r.int(5, 50), g = r.pick([5, 10, 20]), after = P * (1 + g / 100) ** 2;
      return { q: `The population of a town is ${fmt(P)}. It increases by ${g}% every year. What will the population be after 2 years?`, ...numOptions(r, after, { wrong: [P * (1 + (2 * g) / 100)], step: P / 50 }), e: `Population after n years = P(1 + r/100)ⁿ.\n= ${fmt(P)} × (${fmt(1 + g / 100)})² = **${fmt(after)}**.`, check: `${P}*(1+${g}/100)**2`, d: 2 };
    },
    (r) => {
      const pass = r.pick([30, 33, 35, 36, 40, 45]), total = 100 * r.int(2, 9), need = (pass * total) / 100, f = r.int(5, 30), got = need - f;
      if (!Number.isInteger(need)) return null;
      return { q: `A student must get ${pass}% marks to pass. He gets ${got} marks and fails by ${f} marks. What are the maximum marks?`, ...numOptions(r, total, { wrong: [(got * 100) / pass, total + 100], step: 50 }), e: `Pass marks = ${got} + ${f} = ${need}.\n${pass}% of maximum = ${need} ⇒ maximum = ${need} × 100/${pass} = **${total}**.`, d: 2 };
    },
  ])
);

// ───────────────────────── Problems on Ages ─────────────────────────
const ages = gen("ages", 56, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      for (let t = 0; t < 40; t++) {
        const a = r.int(2, 7), b = r.int(2, 7), x = r.int(2, 9), n = r.int(3, 15);
        if (a === b || gcd(a, b) !== 1) continue;
        const A = a * x, B = b * x, g = gcd(A + n, B + n);
        if ((A + n) / g === a) continue;
        return { q: `The ratio of the present ages of A and B is ${a} : ${b}. After ${n} years the ratio will be ${(A + n) / g} : ${(B + n) / g}. What is A's present age?`, ...numOptions(r, A, { unit: "years", wrong: [B, A + n, x * (a + b)], step: 2 }), e: `Let the ages be ${a}x and ${b}x. Then (${a}x + ${n})/(${b}x + ${n}) = ${(A + n) / g}/${(B + n) / g}.\nCross-multiplying gives x = ${x}, so A = ${a} × ${x} = **${A} years**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const s = r.int(4, 15), k = r.int(3, 5), F = k * s, n = r.int(3, 20), m = (F + n) / (s + n);
        if (!Number.isInteger(m) || m < 2) continue;
        return { q: `A father is ${k} times as old as his son. After ${n} years he will be ${m} times as old as his son. What is the father's present age?`, ...numOptions(r, F, { unit: "years", wrong: [s, F + n, F - n], step: 3 }), e: `Let the son's age be s. Father = ${k}s.\n${k}s + ${n} = ${m}(s + ${n}) ⇒ ${k - m}s = ${m * n - n} ⇒ s = ${s}.\nFather's age = ${k} × ${s} = **${F} years**.`, d: 2 };
      }
      return null;
    },
    (r) => {
      const B = r.int(5, 30), d = r.int(2, 15), A = B + d, sum = A + B;
      return { q: `The sum of the ages of two brothers is ${sum} years and the elder is ${d} years older than the younger. What is the age of the elder brother?`, ...numOptions(r, A, { unit: "years", wrong: [B, sum / 2, A + d], step: 1 }), e: `Elder = (sum + difference)/2 = (${sum} + ${d})/2 = **${A} years**.`, d: 1 };
    },
    (r) => {
      const n = r.int(3, 6), avg = r.int(10, 40), extra = r.int(25, 60), newAvg = (n * avg + extra) / (n + 1);
      if (!Number.isInteger(newAvg)) return null;
      return { q: `The average age of ${n} children is ${avg} years. When their teacher's age is included, the average becomes ${newAvg} years. What is the teacher's age?`, ...numOptions(r, extra, { unit: "years", wrong: [newAvg * n - avg, extra + newAvg - avg], step: 2 }), e: `Total of ${n} children = ${n} × ${avg} = ${n * avg}. Total with teacher = ${n + 1} × ${newAvg} = ${(n + 1) * newAvg}.\nTeacher = ${(n + 1) * newAvg} − ${n * avg} = **${extra} years**.`, d: 1 };
    },
    (r) => {
      for (let t = 0; t < 40; t++) {
        const B = r.int(5, 25), n = r.int(2, 10), k = r.int(2, 4), A = k * (B - n) + n, Dnow = A - B;
        if (B - n <= 0 || A > 90) continue;
        return { q: `${n} years ago, A was ${k} times as old as B. A is now ${Dnow} years older than B. What is B's present age?`, ...numOptions(r, B, { unit: "years", wrong: [A, B - n, Dnow], step: 1 }), e: `Let B's age ${n} years ago be b; then A's was ${k}b. The age difference never changes: ${k}b − b = ${Dnow} ⇒ b = ${B - n}.\nB's present age = ${B - n} + ${n} = **${B} years**.`, d: 2 };
      }
      return null;
    },
  ])
);

// ───────────────────────── Calendar ─────────────────────────
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const dow = (y: number, mo: number, d: number) => new Date(Date.UTC(y, mo, d)).getUTCDay();
const calendar = gen("calendar", N, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const y = r.int(1901, 2099), mo = r.int(0, 11), dmax = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(), d = r.int(1, dmax), w = dow(y, mo, d);
      const prev = y - 1, centuries = Math.floor(prev / 100) * 100, rest = prev - centuries, leaps = Math.floor(rest / 4);
      const cOdd = [0, 5, 3, 1][(centuries / 100) % 4];
      const restOdd = (rest + leaps) % 7;
      const dayOfYear = Math.round((Date.UTC(y, mo, d) - Date.UTC(y, 0, 0)) / 86400000);
      return { q: `What was/will be the day of the week on ${d} ${MONTHS[mo]} ${y}?`, ...textOptions(r, DAYS[w], DAYS), e: `Count odd days (days beyond complete weeks) from 1 Jan 0001; 0 odd days = Sunday, 1 = Monday, and so on.\n• ${centuries} years give ${cOdd} odd day(s) (100 yrs = 5, 200 = 3, 300 = 1, 400 = 0).\n• The next ${rest} years have ${leaps} leap and ${rest - leaps} ordinary years: ${rest} + ${leaps} = ${rest + leaps} ⇒ ${restOdd} odd day(s).\n• From 1 Jan to ${d} ${MONTHS[mo]} ${y}: ${dayOfYear} days ⇒ ${dayOfYear % 7} odd day(s).\nTotal = ${cOdd} + ${restOdd} + ${dayOfYear % 7} = ${cOdd + restOdd + (dayOfYear % 7)} ⇒ ${(cOdd + restOdd + (dayOfYear % 7)) % 7} odd day(s) ⇒ **${DAYS[w]}**.`, d: 3 };
    },
    (r) => {
      const y = r.pick([1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, r.int(1901, 2099), r.int(1901, 2099), r.int(1901, 2099)]);
      const days = isLeap(y) ? 366 : 365;
      const why = y % 100 === 0 ? `${y} is a century year, so it is a leap year only if divisible by 400: ${y} ÷ 400 ${y % 400 ? "leaves a remainder" : "has no remainder"}.` : `${y} ${y % 4 ? "is not" : "is"} divisible by 4.`;
      return { q: `How many days are there in the year ${y}?`, o: ["364", "365", "366", "367"], a: days === 366 ? 2 : 1, e: `${why} So ${y} is ${isLeap(y) ? "a leap year with **366 days**" : "an ordinary year with **365 days**"}.`, d: 1 };
    },
    (r) => {
      const start = r.int(0, 6), n = r.int(15, 400), end = (start + n) % 7;
      return { q: `Today is ${DAYS[start]}. What day of the week will it be after ${n} days?`, ...textOptions(r, DAYS[end], DAYS), e: `${n} days = ${Math.floor(n / 7)} weeks + ${n % 7} day(s). Only the ${n % 7} odd day(s) shift the weekday.\n${DAYS[start]} + ${n % 7} = **${DAYS[end]}**.`, d: 1 };
    },
    (r) => {
      const y = r.int(1990, 2060);
      let k = y + 1;
      while (!(isLeap(k) === isLeap(y) && dow(k, 0, 1) === dow(y, 0, 1))) k++;
      return { q: `The calendar of the year ${y} can be used again in the year:`, ...numOptions(r, k, { wrong: [y + 6, y + 11, y + 28, y + 5, y + 4].filter((v) => v !== k), step: 1, dp: 0 }), e: `A calendar repeats when the new year starts on the same weekday and has the same number of days (${isLeap(y) ? "a leap year" : "an ordinary year"}).\nAdding the odd days year by year (1 for an ordinary year, 2 for a leap year) from ${y}, the total first becomes a multiple of 7 with a matching year type at **${k}**.`, d: 2 };
    },
    (r) => {
      const n = r.pick([100, 200, 300, 400, 500, 600, 700, 800]), odd = [0, 5, 3, 1][(n / 100) % 4];
      return { q: `How many odd days are there in ${n} years?`, ...numOptions(r, odd, { wrong: [n % 7, (n / 100) * 5 % 7 + 1, 2, 4, 6].filter((v) => v !== odd), step: 1, dp: 0, min: -1 }), e: `100 years = 5 odd days, 200 years = 10 ⇒ 3, 300 years = 15 ⇒ 1, 400 years = 0 (the cycle repeats every 400 years).\n${n} years ⇒ **${odd}** odd day(s).`, d: 2 };
    },
    (r) => {
      const y = r.int(2001, 2099), w = dow(y, 0, 1), last = dow(y, 11, 31);
      return { q: `If 1 January ${y} is a ${DAYS[w]}, what day of the week is 31 December ${y}?`, ...textOptions(r, DAYS[last], DAYS), e: `${y} is ${isLeap(y) ? "a leap year (366 days = 52 weeks + 2 days)" : "an ordinary year (365 days = 52 weeks + 1 day)"}, so the last day of the year is ${isLeap(y) ? "one day after" : "the same weekday as"} the first.\n31 December ${y} is a **${DAYS[last]}**.`, d: 1 };
    },
  ])
);

// ───────────────────────── Clock ─────────────────────────
function elevenths(total11: number) {
  // total11 = minutes × 11, returns "a b/11"
  const whole = Math.floor(total11 / 11), rem = total11 % 11;
  return rem ? `${whole} ${rem}/11` : `${whole}`;
}
const clock = gen("clock", 56, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const h = r.int(1, 12), mi = 5 * r.int(0, 11) + (r.chance(0.3) ? r.pick([2, 4, 6]) : 0), raw = Math.abs(30 * (h % 12) - 5.5 * mi), ang = Math.min(raw, 360 - raw);
      const time = `${h}:${String(mi).padStart(2, "0")}`;
      return { q: `What is the angle between the hour hand and the minute hand of a clock at ${time}?`, media: { type: "clock", h, m: mi }, ...numOptions(r, ang, { unit: "°", wrong: [Math.abs(30 * h - 6 * mi) % 360, 360 - ang], step: 5, min: -1 }), e: `Angle = |30H − 11M/2| = |30 × ${h % 12} − 11 × ${mi}/2| = |${30 * (h % 12)} − ${fmt(5.5 * mi)}| = ${fmt(raw)}°${raw > 180 ? `; the smaller angle is 360 − ${fmt(raw)} = ${fmt(ang)}°` : ""}.\nAnswer: **${fmt(ang)}°**.`, d: 1 };
    },
    (r) => {
      const h = r.int(1, 10), t11 = 60 * h; // minutes past h = 60h/11 (between 11 and 12 they meet only at 12:00)
      return { q: `At what time between ${h} and ${h + 1} o'clock will the hands of a clock be together?`, ...textOptions(r, `${elevenths(t11)} min past ${h}`, [`${elevenths(t11 + 11)} min past ${h}`, `${5 * h} min past ${h}`, `${elevenths(Math.max(11, t11 - 22))} min past ${h}`, `${elevenths(60 * h + 30)} min past ${h}`]), e: `At ${h} o'clock the minute hand is ${5 * h} minute-spaces behind the hour hand. It gains 55 spaces in 60 minutes, so it gains ${5 * h} spaces in ${5 * h} × 60/55 = ${60 * h}/11 minutes.\nThe hands coincide at **${elevenths(t11)} min past ${h}**.`, d: 2 };
    },
    (r) => {
      const h = r.pick([1, 2, 4, 5, 6, 7, 8, 10, 11]); // at 3 and 9 o'clock the hands already are at right angles
      // The minute hand starts 5h spaces behind; right angles occur whenever it leads by 15 or 45 (mod 60).
      const spaces = (15 + 5 * h) % 30;
      const t11 = spaces * 12; // minutes = spaces × 60/55 = spaces × 12/11
      const second = (spaces + 30) * 12;
      return { q: `At what time between ${h} and ${h + 1} o'clock will the hands of a clock be at right angles for the first time?`, ...textOptions(r, `${elevenths(t11)} min past ${h}`, [`${elevenths(second)} min past ${h}`, `${spaces} min past ${h}`, `${elevenths(60 * h <= 660 ? 60 * h : t11 + 11)} min past ${h}`, `${elevenths(t11 + 22)} min past ${h}`]), e: `At ${h} o'clock the minute hand is ${5 * h} minute-spaces behind the hour hand. The hands are at right angles whenever they are 15 spaces apart, on either side.
The first such position needs the minute hand to gain ${spaces} spaces. It gains 55 spaces in 60 min, so time = ${spaces} × 60/55 = **${elevenths(t11)} min past ${h}**.`, d: 3 };
    },
    (r) => {
      const h = r.int(1, 11), mi = r.int(1, 59);
      let mh = 11 - h, mm = 60 - mi;
      if (mm === 60) { mm = 0; mh += 1; }
      if (mh <= 0) mh += 12;
      const fmtT = (a: number, b: number) => `${a}:${String(b).padStart(2, "0")}`;
      return { q: `A clock shows ${fmtT(h, mi)}. What time does its mirror image show?`, media: { type: "clock", h, m: mi }, ...textOptions(r, fmtT(mh, mm), [fmtT(h, 60 - mi), fmtT(12 - h, mi), fmtT(mh + 1 > 12 ? 1 : mh + 1, mm), fmtT(mi % 12 || 12, h)]), e: `For a mirror image, subtract the time from 11:60 (i.e. 12:00).\n11:60 − ${fmtT(h, mi)} = **${fmtT(mh, mm)}**.`, d: 2 };
    },
    (r) => {
      const days = r.int(1, 3);
      return r.chance(0.5)
        ? { q: `How many times do the hands of a clock coincide in ${days === 1 ? "a day" : `${days} days`}?`, ...numOptions(r, 22 * days, { wrong: [24 * days, 12 * days, 11 * days], step: 2 }), e: `The hands coincide 11 times in every 12 hours (only once between 11 and 1, at 12 o'clock), so 22 times a day.\nIn ${days} day(s): **${22 * days}** times.`, d: 1 }
        : { q: `How many times are the hands of a clock at right angles in ${days === 1 ? "a day" : `${days} days`}?`, ...numOptions(r, 44 * days, { wrong: [48 * days, 22 * days, 24 * days], step: 2 }), e: `The hands are at right angles 22 times in 12 hours (twice every hour except around 3 and 9, where the two instances are shared), so 44 times a day.\nIn ${days} day(s): **${44 * days}** times.`, d: 2 };
    },
  ])
);

// ───────────────────────── Formulas ─────────────────────────
export const part1: RawSubject = {
  "problems-on-trains": topic(trains, {
    intro: "Train problems are time-speed-distance problems where the train's own length must be covered. Convert speeds carefully between km/hr and m/s, and use relative speed when two bodies move.",
    formulas: [
      { h: "Unit conversion", points: ["a km/hr = a × 5/18 m/s", "a m/s = a × 18/5 km/hr"] },
      { h: "Crossing objects", points: ["Time to pass a pole, a man standing still or a signal post = length of train ÷ speed", "Time to pass a platform, bridge or tunnel of length b = (length of train + b) ÷ speed"], example: "A 150 m train at 54 km/hr passes a pole in 150 ÷ 15 = 10 s and a 300 m platform in 450 ÷ 15 = 30 s." },
      { h: "Relative speed", points: ["Same direction: relative speed = u − v", "Opposite directions: relative speed = u + v", "Two trains of lengths a and b cross each other in (a + b) ÷ relative speed"] },
      { h: "Meeting after crossing", points: ["If two trains start at the same time from A and B towards each other and take a and b seconds to reach the other end after meeting, then (speed of A) : (speed of B) = √b : √a"] },
    ],
  }),
  "time-and-distance": topic(timeDistance, {
    intro: "Speed, time and distance are linked by Distance = Speed × Time. Most problems are solved by setting up this relation for two situations and comparing them.",
    formulas: [
      { h: "Basic relations", points: ["Speed = Distance ÷ Time, Time = Distance ÷ Speed, Distance = Speed × Time", "x km/hr = x × 5/18 m/s; x m/s = x × 18/5 km/hr"] },
      { h: "Average speed", points: ["Average speed = total distance ÷ total time", "Equal distances at x and y km/hr: average speed = 2xy/(x + y)"], example: "Going at 40 and returning at 60 gives 2·40·60/100 = 48 km/hr, not 50." },
      { h: "Ratios", points: ["If the speed ratio is a : b, the time ratio for the same distance is b : a", "Moving at a/b of the usual speed makes the time b/a of the usual time"] },
    ],
  }),
  "height-and-distance": topic(heightDistance, {
    intro: "Height and distance problems use right-angled triangles. The line of sight, the horizontal ground and the vertical object form a triangle, and trigonometric ratios link the sides.",
    formulas: [
      { h: "Angles", points: ["Angle of elevation: measured upwards from the horizontal to the line of sight", "Angle of depression: measured downwards from the horizontal; it equals the angle of elevation from the other point"] },
      { h: "Ratios", points: ["tan θ = perpendicular/base, sin θ = perpendicular/hypotenuse, cos θ = base/hypotenuse", "tan 30° = 1/√3, tan 45° = 1, tan 60° = √3", "sin 30° = cos 60° = 1/2, sin 60° = cos 30° = √3/2, sin 45° = cos 45° = 1/√2"] },
    ],
  }),
  "time-and-work": topic(timeWork, {
    intro: "Treat the whole job as 1 unit. A person who finishes the job in n days does 1/n of it each day; rates of people working together add up.",
    formulas: [
      { h: "Rates", points: ["If A can do a work in n days, A's 1 day's work = 1/n", "If A's 1 day's work = 1/n, A finishes the work in n days", "A and B together: 1/a + 1/b per day, so they take ab/(a + b) days"] },
      { h: "Efficiency", points: ["If A is k times as efficient as B, A takes 1/k of B's time", "Ratio of work done = ratio of efficiencies (for equal time)"] },
      { h: "Man-days", points: ["M₁ × D₁ × H₁ / W₁ = M₂ × D₂ × H₂ / W₂ (men, days, hours per day, work)"] },
    ],
  }),
  "simple-interest": topic(simpleInterest, {
    intro: "Simple interest is calculated on the original principal only, so it is the same every year.",
    formulas: [
      { h: "Formulas", points: ["SI = (P × R × T)/100", "P = (100 × SI)/(R × T), R = (100 × SI)/(P × T), T = (100 × SI)/(P × R)", "Amount A = P + SI"] },
      { h: "Useful results", points: ["A sum doubles in 100/R years", "If a sum amounts to A₁ in t₁ years and A₂ in t₂ years, SI per year = (A₂ − A₁)/(t₂ − t₁)"] },
    ],
  }),
  "compound-interest": topic(compoundInterest, {
    intro: "Under compound interest, interest is added to the principal at the end of each period and earns interest in later periods.",
    formulas: [
      { h: "Amount", points: ["Annually: A = P(1 + R/100)ⁿ", "Half-yearly: A = P(1 + R/200)²ⁿ", "Quarterly: A = P(1 + R/400)⁴ⁿ", "Different rates each year: A = P(1 + R₁/100)(1 + R₂/100)(1 + R₃/100)", "CI = A − P"] },
      { h: "CI vs SI", points: ["For 2 years: CI − SI = P(R/100)²", "For 3 years: CI − SI = P(R/100)²(3 + R/100)"] },
      { h: "Multiplying sums", points: ["If a sum becomes k times in n years, it becomes kᵐ times in m × n years"] },
    ],
  }),
  "profit-and-loss": topic(profitLoss, {
    intro: "Cost price (CP) is what you pay, selling price (SP) is what you receive. Gain and loss percentages are always calculated on the CP unless stated otherwise.",
    formulas: [
      { h: "Basics", points: ["Gain = SP − CP, Loss = CP − SP", "Gain % = (Gain × 100)/CP, Loss % = (Loss × 100)/CP", "SP = CP × (100 + Gain%)/100, SP = CP × (100 − Loss%)/100", "CP = SP × 100/(100 + Gain%), CP = SP × 100/(100 − Loss%)"] },
      { h: "Discounts and tricks", points: ["Marked up m% and discounted d%: net gain % = m − d − md/100", "Two articles sold at the same price, one at x% gain and one at x% loss: loss of x²/100 %", "False weight: gain % = (error/(true value − error)) × 100"] },
    ],
  }),
  partnership: topic(partnership, {
    intro: "In a partnership, profit (or loss) is divided in the ratio of each partner's capital multiplied by the time it was invested.",
    formulas: [
      { h: "Sharing profit", points: ["Same period: profit ratio = ratio of investments", "Different periods: profit ratio = (capital × months) for each partner", "A working partner may receive a salary first; the remainder is divided in the capital ratio"] },
    ],
  }),
  percentage: topic(percentage, {
    intro: "Per cent means 'per hundred'. x% of a quantity is x/100 of it.",
    formulas: [
      { h: "Basics", points: ["x% of y = xy/100", "a is (a/b × 100)% of b", "x% = x/100 as a fraction, e.g. 12.5% = 1/8"] },
      { h: "Successive changes", points: ["An increase of a% followed by b%: net = a + b + ab/100 (use negative values for decreases)", "Price up by r%: to keep spending the same, reduce consumption by r/(100 + r) × 100%", "If A is r% more than B, B is r/(100 + r) × 100% less than A"] },
      { h: "Population and depreciation", points: ["After n years at r% growth: P(1 + r/100)ⁿ", "After n years at r% depreciation: P(1 − r/100)ⁿ"] },
    ],
  }),
  "problems-on-ages": topic(ages, {
    intro: "Write each age as a variable (or as a multiple of x when a ratio is given), translate each statement into an equation, and remember that the difference between two people's ages never changes.",
    formulas: [
      { h: "Translating statements", points: ["Present age x ⇒ n years ago: x − n, after n years: x + n", "Ratio a : b ⇒ ages ax and bx", "'A is k times as old as B' ⇒ A = kB"] },
    ],
  }),
  calendar: topic(calendar, {
    intro: "Calendar questions are solved with odd days: the number of days left over after complete weeks.",
    formulas: [
      { h: "Odd days", points: ["Ordinary year = 365 days = 1 odd day; leap year = 366 days = 2 odd days", "100 years = 5 odd days, 200 years = 3, 300 years = 1, 400 years = 0", "Odd days → weekday: 0 Sunday, 1 Monday, 2 Tuesday, 3 Wednesday, 4 Thursday, 5 Friday, 6 Saturday"] },
      { h: "Leap years", points: ["Divisible by 4 but not by 100, or divisible by 400 (2000 was a leap year; 1900 was not)"] },
      { h: "Months", points: ["Odd days: Jan 3, Feb 0 (1 in a leap year), Mar 3, Apr 2, May 3, Jun 2, Jul 3, Aug 3, Sep 2, Oct 3, Nov 2, Dec 3"] },
    ],
  }),
  clock: topic(clock, {
    intro: "The clock face has 60 minute-spaces. The minute hand moves 6° per minute and the hour hand 0.5° per minute, so the minute hand gains 5.5° (55 minute-spaces per 60 minutes) on the hour hand.",
    formulas: [
      { h: "Angles", points: ["Angle between hands at H:M = |30H − 11M/2|; if more than 180°, subtract from 360°"] },
      { h: "Positions", points: ["Hands coincide 11 times in 12 hours (22 times a day)", "Hands are at right angles 22 times in 12 hours (44 a day) and opposite 11 times in 12 hours (22 a day)", "Between H and H+1 the hands coincide at 60H/11 minutes past H"] },
      { h: "Mirror image", points: ["Mirror time = 11:60 − actual time (12:00 − time)"] },
    ],
  }),
};

