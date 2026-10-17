/** Data Interpretation: every question set carries its own generated table or chart; answers are computed from the data. */
import type { Media, RawQ, RawSet, RawSubject } from "../types";
import { fmt, gcd, numOptions, rng, textOptions, topic, type Rng } from "./build";

const SETS = 8;
const YEARS = (r: Rng) => { const start = r.int(2014, 2019); return Array.from({ length: 5 }, (_, k) => String(start + k)); };
const pct = (a: number, b: number) => ((b - a) / a) * 100;
const ratio = (a: number, b: number) => { const g = gcd(a, b); return `${a / g} : ${b / g}`; };
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function sets(seed: string, make: (r: Rng, k: number) => RawSet): RawSet[] {
  const r = rng(seed);
  return Array.from({ length: SETS }, (_, k) => make(r, k));
}

/** Picks `n` distinct question makers and runs them; a maker may return null if the data does not suit it. */
function pickQs(r: Rng, makers: (() => RawQ | null)[], n = 5): RawQ[] {
  const out: RawQ[] = [];
  for (const mk of r.shuffle(makers)) {
    if (out.length >= n) break;
    const q = mk();
    if (q && !out.some((x) => x.q === q.q)) out.push(q);
  }
  return out;
}

// ───────────────────────── Table Charts ─────────────────────────
const TABLE_THEMES = [
  { what: "Production of cars (in thousands) by five companies over the years", cols: ["Company P", "Company Q", "Company R", "Company S", "Company T"], unit: "thousand cars", noun: "production", plural: "companies" },
  { what: "Number of candidates (in hundreds) who appeared in an exam from five states", cols: ["State A", "State B", "State C", "State D", "State E"], unit: "hundred candidates", noun: "number of candidates", plural: "states" },
  { what: "Sales (in Rs. crore) of five products of a company over the years", cols: ["Product V", "Product W", "Product X", "Product Y", "Product Z"], unit: "Rs. crore", noun: "sales", plural: "products" },
  { what: "Number of laptops (in thousands) sold by five brands over the years", cols: ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E"], unit: "thousand laptops", noun: "sales", plural: "brands" },
];
const tableCharts = sets("di-table", (r) => {
  const theme = r.pick(TABLE_THEMES), years = YEARS(r), cols = theme.cols.slice(0, 4);
  const data = years.map(() => cols.map(() => 5 * r.int(6, 40)));
  const media: Media = { type: "table", caption: theme.what, head: ["Year", ...cols], rows: years.map((y, i) => [y, ...data[i]]) };
  const col = (c: number) => data.map((row) => row[c]);
  const totals = data.map((row) => sum(row));
  const qs = pickQs(r, [
    () => { const c = r.int(0, 3), t = sum(col(c)); return { q: `What is the total ${theme.noun} of ${cols[c]} over all the years shown (in ${theme.unit})?`, ...numOptions(r, t, { wrong: [t + col(c)[0], t - col(c)[4], sum(totals) / 4], step: 10 }), e: `${col(c).join(" + ")} = **${t}**.`, check: col(c).join("+"), d: 1 }; },
    () => { const c = r.int(0, 3), a = r.int(0, 3), b = r.int(a + 1, 4); const v1 = data[a][c], v2 = data[b][c]; if (v2 <= v1) return null; const p = pct(v1, v2); return { q: `What is the percentage increase in the ${theme.noun} of ${cols[c]} from ${years[a]} to ${years[b]}?`, ...numOptions(r, p, { unit: "%", wrong: [((v2 - v1) / v2) * 100, v2 - v1], step: 5, dp: 2 }), e: `Increase = ${v2} − ${v1} = ${v2 - v1}.\n% increase = (${v2 - v1}/${v1}) × 100 = **${fmt(p)}%**.`, check: `(${v2}-${v1})/${v1}*100`, d: 2 }; },
    () => { const c = r.int(0, 3), avg = sum(col(c)) / 5; return { q: `What is the average annual ${theme.noun} of ${cols[c]} (in ${theme.unit})?`, ...numOptions(r, avg, { wrong: [sum(col(c)) / 4, avg + 5], step: 3 }), e: `Average = (${col(c).join(" + ")})/5 = ${sum(col(c))}/5 = **${fmt(avg)}**.`, check: `(${col(c).join("+")})/5`, d: 1 }; },
    () => { const max = Math.max(...totals); if (totals.filter((t) => t === max).length > 1) return null; const yi = totals.indexOf(max); return { q: `In which year was the total ${theme.noun} of all the ${theme.plural} taken together the highest?`, ...textOptions(r, years[yi], years), e: `Yearly totals: ${years.map((y, i) => `${y}: ${totals[i]}`).join(", ")}.\nThe highest is **${years[yi]}** (${max}).`, d: 1 }; },
    () => { const a = r.int(0, 4), c1 = r.int(0, 3), c2 = (c1 + r.int(1, 3)) % 4; return { q: `What is the ratio of the ${theme.noun} of ${cols[c1]} to that of ${cols[c2]} in ${years[a]}?`, ...textOptions(r, ratio(data[a][c1], data[a][c2]), [ratio(data[a][c2], data[a][c1]), ratio(data[a][c1] + 5, data[a][c2]), ratio(data[(a + 1) % 5][c1], data[(a + 1) % 5][c2])]), e: `${data[a][c1]} : ${data[a][c2]} = **${ratio(data[a][c1], data[a][c2])}**.`, d: 1 }; },
    () => { const a = r.int(0, 4), c = r.int(0, 3), p = (data[a][c] / totals[a]) * 100; return { q: `In ${years[a]}, the ${theme.noun} of ${cols[c]} is approximately what percent of the total ${theme.noun} of that year?`, ...numOptions(r, p, { unit: "%", wrong: [p + 5, (data[a][c] / Math.max(...data[a])) * 100], step: 3, dp: 2 }), e: `Total in ${years[a]} = ${data[a].join(" + ")} = ${totals[a]}.\n(${data[a][c]}/${totals[a]}) × 100 = **${fmt(p)}%**.`, check: `${data[a][c]}/${totals[a]}*100`, d: 2 }; },
    () => { const [a, b] = r.shuffle([0, 1, 2, 3, 4]).slice(0, 2).sort(); const diff = Math.abs(totals[b] - totals[a]); if (!diff) return null; return { q: `What is the difference between the total ${theme.noun} in ${years[a]} and in ${years[b]} (in ${theme.unit})?`, ...numOptions(r, diff, { wrong: [diff + 10, Math.abs(data[b][0] - data[a][0])], step: 5 }), e: `Total ${years[a]} = ${totals[a]}, total ${years[b]} = ${totals[b]}.\nDifference = **${diff}**.`, d: 1 }; },
  ]);
  return { set: true, media, items: qs };
});

// ───────────────────────── Bar Charts ─────────────────────────
const BAR_THEMES = [
  { cap: "Exports and imports of a company (in Rs. crore)", s: ["Exports", "Imports"], unit: "Rs. crore" },
  { cap: "Number of students admitted to two colleges (in hundreds)", s: ["College A", "College B"], unit: "hundred students" },
  { cap: "Production and sales of a fertiliser (in lakh tonnes)", s: ["Production", "Sales"], unit: "lakh tonnes" },
  { cap: "Income and expenditure of a company (in Rs. lakh)", s: ["Income", "Expenditure"], unit: "Rs. lakh" },
];
const barCharts = sets("di-bar", (r) => {
  const theme = r.pick(BAR_THEMES), years = YEARS(r);
  const A = years.map(() => 10 * r.int(10, 60)), B = years.map(() => 10 * r.int(10, 60));
  const media: Media = { type: "bar", caption: theme.cap, unit: theme.unit, labels: years, series: [{ name: theme.s[0], values: A }, { name: theme.s[1], values: B }] };
  const qs = pickQs(r, [
    () => { const avg = sum(A) / 5; return { q: `What is the average ${theme.s[0].toLowerCase()} per year over the given period (in ${theme.unit})?`, ...numOptions(r, avg, { wrong: [sum(B) / 5, avg + 10], step: 6 }), e: `(${A.join(" + ")})/5 = ${sum(A)}/5 = **${fmt(avg)}**.`, check: `(${A.join("+")})/5`, d: 1 }; },
    () => { const y = r.int(0, 4); return { q: `In ${years[y]}, what is the ratio of ${theme.s[0]} to ${theme.s[1]}?`, ...textOptions(r, ratio(A[y], B[y]), [ratio(B[y], A[y]), ratio(A[(y + 1) % 5], B[(y + 1) % 5]), ratio(A[y] + 10, B[y])]), e: `${A[y]} : ${B[y]} = **${ratio(A[y], B[y])}**.`, d: 1 }; },
    () => { const gaps = A.map((a, i) => Math.abs(a - B[i])), max = Math.max(...gaps); if (gaps.filter((g) => g === max).length > 1) return null; const y = gaps.indexOf(max); return { q: `In which year was the difference between ${theme.s[0]} and ${theme.s[1]} the maximum?`, ...textOptions(r, years[y], years), e: `Differences: ${years.map((yy, i) => `${yy}: ${gaps[i]}`).join(", ")}.\nMaximum in **${years[y]}**.`, d: 1 }; },
    () => { const y = r.int(1, 4); if (B[y] <= B[y - 1]) return null; const p = pct(B[y - 1], B[y]); return { q: `What is the percentage increase in ${theme.s[1]} from ${years[y - 1]} to ${years[y]}?`, ...numOptions(r, p, { unit: "%", wrong: [((B[y] - B[y - 1]) / B[y]) * 100, B[y] - B[y - 1]], step: 5, dp: 2 }), e: `(${B[y]} − ${B[y - 1]})/${B[y - 1]} × 100 = **${fmt(p)}%**.`, check: `(${B[y]}-${B[y - 1]})/${B[y - 1]}*100`, d: 2 }; },
    () => { const t = sum(A) + sum(B); return { q: `What is the combined total of ${theme.s[0]} and ${theme.s[1]} over all the years (in ${theme.unit})?`, ...numOptions(r, t, { wrong: [t - A[0], sum(A) * 2], step: 50 }), e: `${theme.s[0]}: ${sum(A)}; ${theme.s[1]}: ${sum(B)}.\nTotal = **${t}**.`, check: `${sum(A)}+${sum(B)}`, d: 1 }; },
    () => { const above = years.filter((_, i) => A[i] > B[i]).length; return { q: `In how many years was ${theme.s[0]} more than ${theme.s[1]}?`, ...textOptions(r, String(above), ["0", "1", "2", "3", "4", "5"]), e: `Comparing year by year: ${years.map((y, i) => `${y}: ${A[i]} vs ${B[i]}`).join("; ")}.\n${theme.s[0]} was higher in **${above}** year(s).`, d: 1 }; },
    () => { const y = r.int(0, 4), p = (A[y] / sum(A)) * 100; return { q: `${theme.s[0]} in ${years[y]} is what percent of the total ${theme.s[0].toLowerCase()} over all the years?`, ...numOptions(r, p, { unit: "%", wrong: [(B[y] / sum(B)) * 100, 20], step: 3, dp: 2 }), e: `(${A[y]}/${sum(A)}) × 100 = **${fmt(p)}%**.`, check: `${A[y]}/${sum(A)}*100`, d: 2 }; },
  ]);
  return { set: true, media, items: qs };
});

// ───────────────────────── Pie Charts ─────────────────────────
const PIE_THEMES = [
  { cap: "Percentage distribution of the expenditure of a family", cats: ["Food", "Rent", "Education", "Transport", "Savings", "Others"], whole: "monthly income", money: true },
  { cap: "Percentage of the cost of publishing a book", cats: ["Paper", "Printing", "Binding", "Royalty", "Promotion", "Transport"], whole: "total cost", money: true },
  { cap: "Percentage of students in different streams of a university", cats: ["Science", "Commerce", "Arts", "Engineering", "Medicine", "Law"], whole: "total number of students", money: false },
  { cap: "Percentage of a company's budget spent on departments", cats: ["Salaries", "R&D", "Marketing", "Operations", "IT", "Training"], whole: "total budget", money: true },
];
const pieCharts = sets("di-pie", (r) => {
  const theme = r.pick(PIE_THEMES), cats = theme.cats.slice(0, r.int(5, 6));
  let vals: number[];
  do {
    vals = cats.map(() => 5 * r.int(1, 8));
    const s = sum(vals);
    vals[vals.length - 1] += 100 - s;
  } while (vals.some((v) => v <= 0) || new Set(vals).size < vals.length - 1);
  const total = (theme.money ? 1000 : 100) * r.pick([40, 50, 60, 80, 120, 150, 200]);
  const amt = (k: number) => (vals[k] * total) / 100;
  const media: Media = { type: "pie", caption: theme.cap, slices: cats.map((c, k) => ({ label: `${c} (%)`, value: vals[k] })), note: `${theme.whole[0].toUpperCase()}${theme.whole.slice(1)} = ${theme.money ? "Rs. " : ""}${total.toLocaleString("en-IN")}` };
  const unit = theme.money ? "Rs. " : "";
  const qs = pickQs(r, [
    () => { const k = r.int(0, cats.length - 1); return { q: `What is the ${theme.money ? "amount" : "number"} for ${cats[k]}?`, ...numOptions(r, amt(k), { prefix: unit, wrong: [amt(k) * 2, (vals[k] * 3.6 * total) / 1000], step: total / 50 }), e: `${vals[k]}% of ${unit}${total.toLocaleString("en-IN")} = **${unit}${fmt(amt(k))}**.`, check: `${vals[k]}*${total}/100`, d: 1 }; },
    () => { const k = r.int(0, cats.length - 1); return { q: `What is the central angle of the sector for ${cats[k]}?`, ...numOptions(r, vals[k] * 3.6, { unit: "°", wrong: [vals[k] * 3, vals[k] * 4], step: 9 }), e: `Central angle = (percentage/100) × 360° = ${vals[k]} × 3.6 = **${fmt(vals[k] * 3.6)}°**.`, check: `${vals[k]}*3.6`, d: 1 }; },
    () => { const [a, b] = r.shuffle(cats.map((_, k) => k)).slice(0, 2); if (vals[a] <= vals[b]) return null; const p = ((vals[a] - vals[b]) / vals[b]) * 100; return { q: `By what percent is the share of ${cats[a]} more than that of ${cats[b]}?`, ...numOptions(r, p, { unit: "%", wrong: [vals[a] - vals[b], ((vals[a] - vals[b]) / vals[a]) * 100], step: 10, dp: 2 }), e: `(${vals[a]} − ${vals[b]})/${vals[b]} × 100 = **${fmt(p)}%**.`, check: `(${vals[a]}-${vals[b]})/${vals[b]}*100`, d: 2 }; },
    () => { const [a, b] = r.shuffle(cats.map((_, k) => k)).slice(0, 2); return { q: `What is the ratio of the share of ${cats[a]} to that of ${cats[b]}?`, ...textOptions(r, ratio(vals[a], vals[b]), [ratio(vals[b], vals[a]), ratio(vals[a] + 5, vals[b]), ratio(vals[a], vals[b] + 5)]), e: `${vals[a]} : ${vals[b]} = **${ratio(vals[a], vals[b])}**.`, d: 1 }; },
    () => { const [a, b] = r.shuffle(cats.map((_, k) => k)).slice(0, 2); const v = amt(a) + amt(b); return { q: `What is the combined ${theme.money ? "amount" : "number"} for ${cats[a]} and ${cats[b]}?`, ...numOptions(r, v, { prefix: unit, wrong: [v + amt(0), Math.abs(amt(a) - amt(b))], step: total / 40 }), e: `(${vals[a]} + ${vals[b]})% of ${total.toLocaleString("en-IN")} = ${vals[a] + vals[b]}% = **${unit}${fmt(v)}**.`, d: 1 }; },
    () => { const k = r.int(0, cats.length - 1), rest = 100 - vals[k]; return { q: `What percentage of the ${theme.whole} is NOT accounted for by ${cats[k]}?`, ...numOptions(r, rest, { unit: "%", wrong: [vals[k], rest - 5], step: 5 }), e: `100 − ${vals[k]} = **${rest}%**.`, d: 1 }; },
  ]);
  return { set: true, media, items: qs };
});

// ───────────────────────── Line Charts ─────────────────────────
const LINE_THEMES = [
  { cap: "Profit (in Rs. crore) of two companies over the years", s: ["Company A", "Company B"], unit: "Rs. crore", noun: "profit" },
  { cap: "Rainfall (in cm) in two cities over the years", s: ["City X", "City Y"], unit: "cm", noun: "rainfall" },
  { cap: "Number of visitors (in thousands) to two museums", s: ["Museum P", "Museum Q"], unit: "thousand visitors", noun: "visitors" },
];
const lineCharts = sets("di-line", (r) => {
  const theme = r.pick(LINE_THEMES), years = YEARS(r);
  const A = years.map(() => 5 * r.int(6, 30)), B = years.map(() => 5 * r.int(6, 30));
  const media: Media = { type: "line", caption: theme.cap, unit: theme.unit, labels: years, series: [{ name: theme.s[0], values: A }, { name: theme.s[1], values: B }] };
  const changes = A.slice(1).map((v, i) => v - A[i]);
  const qs = pickQs(r, [
    () => { const max = Math.max(...changes); if (max <= 0 || changes.filter((c) => c === max).length > 1) return null; const y = changes.indexOf(max) + 1; return { q: `In which year did ${theme.s[0]} show the maximum increase in ${theme.noun} over the previous year?`, ...textOptions(r, years[y], years.slice(1)), e: `Year-on-year changes for ${theme.s[0]}: ${years.slice(1).map((yy, i) => `${yy}: ${changes[i] >= 0 ? "+" : ""}${changes[i]}`).join(", ")}.\nMaximum increase in **${years[y]}**.`, d: 2 }; },
    () => { const avg = sum(B) / 5; return { q: `What is the average ${theme.noun} of ${theme.s[1]} over the period (in ${theme.unit})?`, ...numOptions(r, avg, { wrong: [sum(A) / 5, avg + 5], step: 3 }), e: `(${B.join(" + ")})/5 = ${sum(B)}/5 = **${fmt(avg)}**.`, check: `(${B.join("+")})/5`, d: 1 }; },
    () => { const y = r.int(0, 4), d = Math.abs(A[y] - B[y]); if (!d) return null; return { q: `What is the difference between the ${theme.noun} of the two in ${years[y]} (in ${theme.unit})?`, ...numOptions(r, d, { wrong: [d + 5, A[y] + B[y]], step: 5 }), e: `|${A[y]} − ${B[y]}| = **${d}**.`, d: 1 }; },
    () => { const a = r.int(0, 3), b = r.int(a + 1, 4); if (A[a] === A[b]) return null; const p = pct(A[a], A[b]); return { q: `What is the percentage change in the ${theme.noun} of ${theme.s[0]} from ${years[a]} to ${years[b]}?`, ...textOptions(r, `${fmt(Math.abs(p))}% ${p > 0 ? "increase" : "decrease"}`, [`${fmt(Math.abs(p))}% ${p > 0 ? "decrease" : "increase"}`, `${fmt(Math.abs(((A[b] - A[a]) / A[b]) * 100))}% ${p > 0 ? "increase" : "decrease"}`, `${Math.abs(A[b] - A[a])}% ${p > 0 ? "increase" : "decrease"}`]), e: `(${A[b]} − ${A[a]})/${A[a]} × 100 = ${fmt(p)}%, i.e. **${fmt(Math.abs(p))}% ${p > 0 ? "increase" : "decrease"}**.`, d: 2 }; },
    () => { const t = sum(A) + sum(B); return { q: `What is the total ${theme.noun} of both together over all the years (in ${theme.unit})?`, ...numOptions(r, t, { wrong: [sum(A) * 2, t - B[4]], step: 20 }), e: `${theme.s[0]}: ${sum(A)}, ${theme.s[1]}: ${sum(B)}. Total = **${t}**.`, check: `${sum(A)}+${sum(B)}`, d: 1 }; },
    () => { const y = r.int(0, 4); return { q: `In ${years[y]}, the ${theme.noun} of ${theme.s[1]} was what percent of that of ${theme.s[0]}?`, ...numOptions(r, (B[y] / A[y]) * 100, { unit: "%", wrong: [(A[y] / B[y]) * 100, (B[y] / (A[y] + B[y])) * 100], step: 5, dp: 2 }), e: `(${B[y]}/${A[y]}) × 100 = **${fmt((B[y] / A[y]) * 100)}%**.`, check: `${B[y]}/${A[y]}*100`, d: 2 }; },
  ]);
  return { set: true, media, items: qs };
});

const subject: RawSubject = {
  "table-charts": topic(tableCharts, {
    intro: "A table chart arranges data in rows and columns. Read the heading and units first, then locate only the cells a question needs.",
    formulas: [
      { h: "Approach", points: ["Note the unit (thousands, lakhs, crores) before computing", "Row totals and column totals answer most 'highest/lowest' questions", "Percentage change = (new − old)/old × 100; 'X is what % of Y' = X/Y × 100"] },
      { h: "Speed tips", points: ["Approximate when options are far apart", "Compare ratios by cross-multiplying instead of dividing", "Average = total ÷ count; you rarely need every value"] },
    ],
  }),
  "bar-charts": topic(barCharts, {
    intro: "Bar charts show quantities as bar lengths; grouped bars compare two or more series for the same category.",
    formulas: [
      { h: "Approach", points: ["Read the value at the top of each bar (and the axis unit)", "Gaps between paired bars show differences; tallest pair shows the highest total", "Percentage change between years uses the earlier year as the base"] },
    ],
  }),
  "pie-charts": topic(pieCharts, {
    intro: "A pie chart divides a whole into sectors. Values are given either in percentages (summing to 100) or in degrees (summing to 360°).",
    formulas: [
      { h: "Conversions", points: ["Central angle = percentage × 3.6°", "Percentage = central angle ÷ 3.6", "Amount for a sector = percentage × total ÷ 100"] },
      { h: "Comparisons", points: ["Ratios between sectors are ratios of their percentages; the total is not needed", "'A is x% more than B' ⇒ x = (A − B)/B × 100"] },
    ],
  }),
  "line-charts": topic(lineCharts, {
    intro: "Line charts show how values change over time. The slope between two points shows the rate of change.",
    formulas: [
      { h: "Approach", points: ["The steepest upward segment marks the largest absolute increase", "Percentage change = (later − earlier)/earlier × 100", "Where two lines cross, the two series are equal"] },
    ],
  }),
};
export default subject;
