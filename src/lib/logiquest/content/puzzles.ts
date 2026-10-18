import type { RawQ, RawSubject } from "../types";
import { cycle, gen, m, m2, m3, numOptions, textOptions, topic } from "./build";

const L = (n: number) => String.fromCharCode(65 + ((((n % 26) + 26) % 26)));

const numberPuzzles: RawQ[] = gen("pz-number", 60, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9);
      return { q: `Find the missing number. In each figure, the centre number is related to the four outer numbers in the same way.\nFigure 1: outer ${a}, ${b}, ${c}, ${d} → centre ${a * b + c * d}\nFigure 2: outer ${b}, ${c}, ${d}, ${a} → centre ?`, ...numOptions(r, b * c + d * a, { wrong: [b + c + d + a, b * c * d * a > 999 ? b * c + d : b * c * d * a, b * c - d * a], step: 3, min: -1e9 }), e: `In Figure 1, ${a} × ${b} + ${c} × ${d} = ${a * b + c * d}. Applying the same rule: ${b} × ${c} + ${d} × ${a} = **${b * c + d * a}**.`, d: 2 };
    },
    (r) => {
      const n = r.int(3, 9), sq = [n, n + 1, n + 2].map((x) => x * x);
      return { q: `Which number replaces the question mark?\n${sq[0]}  ${sq[1]}  ?  ${(n + 3) ** 2}`, ...numOptions(r, sq[2], { wrong: [sq[2] + 1, sq[1] + n, sq[2] - 2], step: 2 }), e: `The numbers are consecutive squares: ${n}², ${n + 1}², ${n + 2}², ${n + 3}². The missing number is ${n + 2}² = **${sq[2]}**.`, d: 1 };
    },
    (r) => {
      const t = r.int(12, 40) * 3, x = t / 3 - 1, y = t / 3, z = t / 3 + 1;
      return { q: `The sum of three consecutive numbers is ${t}. What is the largest of them?`, ...numOptions(r, z, { wrong: [y, x, z + 1], step: 1 }), e: `Middle number = ${t}/3 = ${y}. The numbers are ${x}, ${y}, ${z}, so the largest is **${z}**.`, d: 1 };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(10, 30);
      return { q: `If ${a} ★ ${b} means ${a} × ${b} + ${a}, what is ${b} ★ ${c}?`, ...numOptions(r, b * c + b, { wrong: [b * c + c, b * c, (b + 1) * (c + 1)], step: 3 }), e: `The rule is x ★ y = x × y + x. So ${b} ★ ${c} = ${b} × ${c} + ${b} = **${b * c + b}**.`, d: 2 };
    },
    (r) => {
      const age = r.int(5, 15), mult = r.int(3, 5), years = r.int(4, 12);
      return { q: `A mother is ${mult} times as old as her son, who is ${age}. How old will the mother be in ${years} years?`, ...numOptions(r, mult * age + years, { wrong: [mult * (age + years), mult * age, age + years], step: 2 }), e: `Mother's age now = ${mult} × ${age} = ${mult * age}. In ${years} years she will be **${mult * age + years}**.`, d: 1 };
    },
  ])
);

const missingLetters: RawQ[] = gen("pz-letters", 60, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const a = r.int(0, 10), k = r.int(2, 4); const s = Array.from({ length: 6 }, (_, j) => L(a + k * j)); const pos = r.int(1, 4); const shown = s.map((c, j) => (j === pos ? "?" : c)); return { q: `Find the missing letter: ${shown.join("  ")}`, ...textOptions(r, s[pos], [L(a + k * pos + 1), L(a + k * pos - 1), L(a + k * pos + 2)]), e: `Each letter moves ${k} places forward, so the missing letter is **${s[pos]}**.`, d: 1 }; },
    (r) => { const a = r.int(0, 8); const pairs = [0, 1, 2, 3].map((j) => `${L(a + j)}${L(25 - a - j)}`); const pos = r.int(0, 3); return { q: `Find the missing pair: ${pairs.map((p, j) => (j === pos ? "??" : p)).join("  ")}`, ...textOptions(r, pairs[pos], [`${L(a + pos)}${L(24 - a - pos)}`, `${L(a + pos + 1)}${L(25 - a - pos)}`, pairs[pos].split("").reverse().join("")]), e: `Each pair is a letter and its opposite in the alphabet (positions add up to 27): **${pairs[pos]}**.`, d: 2 }; },
    (r) => { const w = r.pick(["APPLE", "TIGER", "PLANET", "GARDEN", "WINDOW", "SILVER", "CASTLE", "BRIDGE", "MARKET", "ORANGE"]); const pos = r.int(1, w.length - 2); const missing = w[pos]; return { q: `Fill in the missing letter to complete the word: ${w.slice(0, pos)}_${w.slice(pos + 1)}`, ...textOptions(r, missing, "ABCDEGILNORST".split("").filter((c) => c !== missing)), e: `The completed word is **${w}**.`, d: 1 }; },
    (r) => { const a = r.int(0, 15); const s = [0, 1, 3, 6, 10].map((g) => L(a + g)); const pos = 4; return { q: `Find the missing letter: ${s.slice(0, pos).join("  ")}  ?`, ...textOptions(r, s[pos], [L(a + 11), L(a + 9), L(a + 8)]), e: `The gaps grow by one: +1, +2, +3, +4. So the next letter is **${s[pos]}**.`, d: 2 }; },
  ])
);

const clockPuzzles: RawQ[] = gen("pz-clock", 48, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const h = r.int(1, 12), mm = r.pick([0, 10, 15, 20, 30, 40, 45, 50]), raw = Math.abs(30 * (h % 12) - 5.5 * mm), ang = Math.min(raw, 360 - raw); return { q: `What angle do the hands of a clock make at ${h}:${String(mm).padStart(2, "0")}?`, media: { type: "clock", h, m: mm }, ...numOptions(r, ang, { unit: "°", wrong: [Math.abs(30 * h - 6 * mm) % 360, ang + 15, 360 - ang], step: 5, min: -1 }), e: `Angle = |30H − 5.5M| = |${30 * (h % 12)} − ${5.5 * mm}| = ${raw}°${raw > 180 ? `, so the smaller angle is ${ang}°` : ""}. Answer: **${ang}°**.`, d: 1 }; },
    (r) => { const g = r.int(1, 5), hrs = r.pick([6, 8, 10, 12, 24]); return { q: `A clock gains ${g} minutes every hour. It is set right at 12 noon. What time will it show after ${hrs} hours of actual time?`, ...textOptions(r, (() => { const tot = 12 * 60 + hrs * (60 + g); const hh = Math.floor(tot / 60) % 12 || 12, mi = tot % 60; return `${hh}:${String(mi).padStart(2, "0")}`; })(), (() => { const out: string[] = []; for (const extra of [0, g * hrs * 2, -g]) { const tot = 12 * 60 + hrs * 60 + extra; out.push(`${Math.floor(tot / 60) % 12 || 12}:${String(((tot % 60) + 60) % 60).padStart(2, "0")}`); } return out; })()), e: `In ${hrs} hours it gains ${g} × ${hrs} = ${g * hrs} minutes, so it is ${g * hrs} minutes ahead of the true time ${((12 + hrs - 1) % 12) + 1}:00.`, d: 2 }; },
    (r) => { const strikes = r.int(3, 12); return { q: `A clock strikes once at 1 o'clock, twice at 2 o'clock, and so on. How many times does it strike from 1 o'clock to ${strikes} o'clock (inclusive)?`, ...numOptions(r, (strikes * (strikes + 1)) / 2, { wrong: [strikes * strikes, strikes * 2, (strikes * (strikes - 1)) / 2], step: 3 }), e: `1 + 2 + … + ${strikes} = ${strikes} × ${strikes + 1}/2 = **${(strikes * (strikes + 1)) / 2}**.`, d: 1 }; },
  ])
);

const logical: RawQ[] = [
  m2("A farmer has 17 sheep. All but 9 run away. How many are left?", ["9", "8", "17", "0"], "'All but 9' means 9 remain."),
  m2("You have two coins that add up to Rs. 15. One of them is not a Rs. 10 coin. What are the two coins?", ["A Rs. 10 coin and a Rs. 5 coin", "Two Rs. 5 coins and a Re. 1", "Three Rs. 5 coins", "It is impossible"], "Only one of them is not a Rs. 10 coin — the other one is."),
  m2("A man is looking at a photograph. He says, 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the photograph?", ["His son", "Himself", "His father", "His brother"], "'My father's son' with no brothers is the speaker himself, so the man in the photo is the speaker's son."),
  m3("You have a 3-litre jug and a 5-litre jug and unlimited water. What is the minimum number of pourings (fill, empty or transfer) to measure exactly 4 litres?", ["6", "4", "5", "8"], "Fill 5, pour into 3 (5 has 2), empty 3, pour 2 into 3, fill 5, pour into 3 until full (5 now has 4): 6 steps."),
  m2("If it takes 5 machines 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?", ["5 minutes", "100 minutes", "20 minutes", "1 minute"], "Each machine makes one widget in 5 minutes, so 100 machines make 100 widgets in 5 minutes."),
  m2("A bat and a ball cost Rs. 110 in total. The bat costs Rs. 100 more than the ball. How much does the ball cost?", ["Rs. 5", "Rs. 10", "Rs. 1", "Rs. 15"], "Ball = x, bat = x + 100; 2x + 100 = 110, so x = 5.", { check: "(110-100)/2" }),
  m3("There are three boxes labelled 'Apples', 'Oranges' and 'Mixed', and every label is wrong. You may take one fruit from one box. From which box should you pick to relabel all boxes correctly?", ["The box labelled 'Mixed'", "The box labelled 'Apples'", "The box labelled 'Oranges'", "It cannot be done"], "The 'Mixed' box must contain only one kind; the fruit you draw tells you which, and the other labels follow."),
  m2("In a race, you overtake the person in second place. What position are you in now?", ["Second", "First", "Third", "Last"], "You take the place of the person you passed."),
  m2("A snail climbs 3 m up a 10 m wall each day and slips back 2 m each night. On which day does it reach the top?", ["8th day", "10th day", "7th day", "9th day"], "After 7 days it is at 7 m; on day 8 it climbs 3 m and reaches 10 m before slipping."),
  m3("A lily pad doubles in size every day and covers a pond in 30 days. On which day was the pond half covered?", ["29th day", "15th day", "20th day", "28th day"], "It doubles on the last day, so it was half covered the day before."),
];

const riddles: RawQ[] = [
  m("What has keys but cannot open locks?", ["A piano (or a keyboard)", "A door", "A safe", "A map"], "A piano or keyboard has keys but no locks."),
  m("What gets wetter the more it dries?", ["A towel", "Water", "The sun", "A sponge left in rain"], "A towel becomes wet as it dries things."),
  m("What has a neck but no head?", ["A bottle", "A shirt", "A giraffe", "A guitar case"], "Bottles have necks."),
  m("The more you take, the more you leave behind. What are they?", ["Footsteps", "Coins", "Photos", "Books"], "Each step leaves a footprint."),
  m("What can travel around the world while staying in a corner?", ["A postage stamp", "A clock", "A globe", "A spider"], "A stamp stays in the corner of an envelope."),
  m("What has many teeth but cannot bite?", ["A comb", "A dog", "A shark", "A zip"], "A comb has teeth."),
  m("What comes once in a minute, twice in a moment, but never in a thousand years?", ["The letter M", "Time", "A second", "Luck"], "Count the letter M in each phrase."),
  m("I am an odd number. Take away one letter and I become even. What number am I?", ["Seven", "Three", "Nine", "Five"], "Remove the 'S' from SEVEN to get EVEN."),
  m("What has hands but cannot clap?", ["A clock", "A robot", "A statue", "A glove"], "A clock has hands."),
  m("What goes up but never comes down?", ["Your age", "A balloon", "Rain", "A ball"], "Age only increases."),
];

const subject: RawSubject = {
  "number-puzzles": topic(numberPuzzles, { intro: "Number puzzles hide a rule linking numbers in a figure or statement. Try sums, products, squares and position-based patterns." }),
  "missing-letters-puzzles": topic(missingLetters, { intro: "Missing-letter puzzles follow alphabet patterns: fixed skips, growing gaps, opposite letters or familiar words." }),
  "clock-puzzles": topic(clockPuzzles, { intro: "Clock puzzles test hand angles, gaining or losing clocks and striking clocks.", formulas: [{ h: "Useful facts", points: ["Angle = |30H − 5.5M|", "A clock striking 1 to n strikes n(n + 1)/2 times"] }] }),
  "logical-puzzles": topic(logical, { intro: "Classic logical puzzles reward reading carefully and avoiding the obvious-but-wrong answer." }),
  riddles: topic(riddles, { intro: "Riddles use wordplay and double meanings. Think about other meanings of each word." }),
};
export default subject;
