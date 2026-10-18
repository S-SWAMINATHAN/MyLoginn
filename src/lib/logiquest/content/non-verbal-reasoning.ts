/**
 * Non Verbal Reasoning: every figure is generated as data (see Figure.tsx) and every option set is checked to be
 * visually distinct, so the answer is always unambiguous.
 */
import type { Fig, RawQ, RawSubject, Shape } from "../types";
import { gen, topic, type Rng } from "./build";

// ───────────── figure toolkit ─────────────
const norm = (d: number) => ((Math.round(d) % 360) + 360) % 360;
const flipSet = (f?: Shape["flip"]) => ({ h: f === "h" || f === "hv", v: f === "v" || f === "hv" });
const toFlip = (h: boolean, v: boolean): Shape["flip"] => (h && v ? "hv" : h ? "h" : v ? "v" : undefined);

/** Rotate a whole figure clockwise about the tile centre. */
function rotate(fig: Fig, deg: number): Fig {
  const a = (deg * Math.PI) / 180;
  return fig.map((s) => {
    const x = (s.x ?? 50) - 50, y = (s.y ?? 50) - 50;
    return { ...s, x: 50 + x * Math.cos(a) - y * Math.sin(a), y: 50 + x * Math.sin(a) + y * Math.cos(a), rot: norm((s.rot ?? 0) + deg) };
  });
}
/** Mirror a whole figure: "h" = left-right (mirror image), "v" = top-bottom (water image). */
function mirror(fig: Fig, axis: "h" | "v"): Fig {
  return fig.map((s) => {
    const f = flipSet(s.flip);
    return {
      ...s,
      x: axis === "h" ? 100 - (s.x ?? 50) : s.x ?? 50,
      y: axis === "v" ? 100 - (s.y ?? 50) : s.y ?? 50,
      rot: norm(-(s.rot ?? 0)),
      flip: toFlip(axis === "h" ? !f.h : f.h, axis === "v" ? !f.v : f.v),
    };
  });
}

/** A key describing how a figure LOOKS, used to guarantee options are distinct. */
function look(fig: Fig): string {
  return fig
    .map((s) => {
      const x = Math.round(s.x ?? 50), y = Math.round(s.y ?? 50), f = flipSet(s.flip), rot = s.rot ?? 0;
      switch (s.k) {
        case "circle": case "dot": return `${s.k}@${x},${y},${s.fill ? 1 : 0},${s.r ?? 18}`;
        case "square": case "plus": case "diamond": return `${s.k}@${x},${y},${s.fill ? 1 : 0},${norm(rot) % 90}`;
        case "arrow": case "semicircle": case "triangle": return `${s.k}@${x},${y},${s.fill ? 1 : 0},${norm(rot + (f.v ? 180 : 0))}`;
        default: return `${s.k}@${x},${y},${s.fill ? 1 : 0},${norm(rot)},${s.flip ?? ""},${s.glyphFlip ? 1 : 0},${s.t ?? ""}`;
      }
    })
    .sort()
    .join("|");
}
const distinct = (figs: Fig[]) => new Set(figs.map(look)).size === figs.length;

/** Shuffle the correct figure among the distractors (all distinct) and return options + answer index. */
function figOptions(r: Rng, right: Fig, wrong: Fig[]): { o: string[]; a: number; options: Fig[] } | null {
  const pool: Fig[] = [];
  for (const w of wrong) if (pool.length < 3 && distinct([right, ...pool, w])) pool.push(w);
  if (pool.length < 3) return null;
  const all = r.shuffle([right, ...pool]);
  return { o: all.map((_, i) => `Figure ${"ABCD"[i]}`), a: all.indexOf(right), options: all };
}

const CORNERS: [number, number][] = [[24, 24], [76, 24], [76, 76], [24, 76]];
const SHAPES = ["circle", "square", "triangle", "star", "diamond", "pentagon", "hexagon"] as const;
/** Positions for n small items in a tile (n ≤ 6). */
const LAYOUT: [number, number][][] = [
  [], [[50, 50]], [[32, 50], [68, 50]], [[50, 28], [30, 70], [70, 70]], [[30, 30], [70, 30], [30, 70], [70, 70]],
  [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]], [[28, 30], [50, 30], [72, 30], [28, 70], [50, 70], [72, 70]],
];
const many = (k: Shape["k"], n: number, fill = false, r = 9): Fig => LAYOUT[n].map(([x, y]) => ({ k, x, y, r, fill }));

/** A chiral composite (no rotation or mirror maps it onto itself). */
function composite(r: Rng): Fig {
  const corner = r.pick(CORNERS);
  const arrowRot = r.pick([0, 90, 180, 270]);
  const items: Fig = [
    { k: "arrow", x: 50, y: 50, r: 20, rot: arrowRot },
    { k: "dot", x: corner[0], y: corner[1], r: 16 },
    { k: r.pick(["circle", "square"] as const), x: r.pick([24, 76]), y: corner[1] === 24 ? 76 : 24, r: 7, fill: r.chance(0.5) },
  ];
  return items;
}

type Make = (r: Rng) => RawQ | null;
function figQ(q: string, e: string, problem: (Fig | null)[], opt: { o: string[]; a: number; options: Fig[] } | null, d: 1 | 2 | 3 = 2, grid?: number): RawQ | null {
  if (!opt) return null;
  return { q, o: opt.o, a: opt.a, e, d, media: { type: "figs", problem, options: opt.options, ...(grid ? { grid } : {}) } };
}

// ───────────── Series ─────────────
const seriesMakers: Make[] = [
  (r) => {
    const step = r.pick([45, 90, 135]), start = r.pick([0, 45, 90, 180, 270]), arrow = (i: number): Fig => [{ k: "arrow", r: 26, rot: norm(start + step * i) }];
    return figQ("Which figure comes next in the series?", `The arrow turns ${step}° clockwise at every step, so the next figure points ${step}° further on.`, [...[0, 1, 2, 3].map(arrow), null], figOptions(r, arrow(4), [arrow(3), arrow(5), [{ k: "arrow", r: 26, rot: norm(start + step * 4 + 180) }], [{ k: "arrow", r: 26, rot: norm(start + step * 4 - 45) }]]), 1);
  },
  (r) => {
    const s0 = r.int(0, 3), dir = r.pick([1, 3]), center = r.pick(["square", "circle", "diamond"] as const);
    const tile = (i: number): Fig => { const [x, y] = CORNERS[(s0 + dir * i) % 4]; return [{ k: center, r: 16 }, { k: "dot", x, y, r: 18 }]; };
    return figQ("Which figure continues the series?", `The dot moves one corner ${dir === 1 ? "clockwise" : "anticlockwise"} at every step while the central shape stays the same.`, [...[0, 1, 2, 3].map(tile), null], figOptions(r, tile(4), [tile(3), tile(5), tile(6)]), 1);
  },
  (r) => {
    const k = r.pick(["circle", "square", "triangle", "star"] as const), start = 1;
    const tile = (i: number) => many(k, start + i);
    return figQ("Which figure comes next?", `One more ${k} is added at every step: ${start}, ${start + 1}, ${start + 2}, ${start + 3}, so the next figure has ${start + 4}.`, [...[0, 1, 2, 3].map(tile), null], figOptions(r, tile(4), [tile(3), tile(5), many(k === "circle" ? "square" : "circle", start + 4)]), 1);
  },
  (r) => {
    const seq = ["triangle", "square", "pentagon", "hexagon"] as const, fill = r.chance(0.5);
    const tile = (i: number): Fig => [{ k: seq[i], r: 26, fill: fill ? i % 2 === 0 : false }];
    return figQ("Which figure comes next in the series?", `The number of sides increases by one each time: triangle (3), square (4), pentagon (5), so the next is a hexagon (6)${fill ? ", and the shading alternates, so it is unshaded" : ""}.`, [...[0, 1, 2].map(tile), null], figOptions(r, tile(3), [[{ k: "pentagon", r: 26 }], [{ k: "hexagon", r: 26, fill: true }], [{ k: "star", r: 26 }], [{ k: "circle", r: 26 }]]), 1);
  },
  (r) => {
    const step = r.pick([90, -90]), s0 = r.pick([0, 90, 180, 270]);
    const tile = (i: number): Fig => [{ k: "arrow", r: 20, rot: norm(s0 + step * i) }, { k: "circle", x: 80, y: 80, r: 8, fill: i % 2 === 0 }];
    return figQ("Which figure comes next?", `The arrow turns 90° ${step > 0 ? "clockwise" : "anticlockwise"} each time and the small circle is shaded in every other figure.`, [...[0, 1, 2, 3].map(tile), null], figOptions(r, tile(4), [tile(3), tile(5), [{ k: "arrow", r: 20, rot: norm(s0 + step * 4) }, { k: "circle", x: 80, y: 80, r: 8, fill: false }]]), 2);
  },
];
const nvSeries = gen("nv-series", 60, (r, i) => seriesMakers[i % seriesMakers.length](r));

// ───────────── Analogy ─────────────
const TRANSFORMS: { name: string; f: (x: Fig) => Fig }[] = [
  { name: "rotated 90° clockwise", f: (x) => rotate(x, 90) },
  { name: "rotated 180°", f: (x) => rotate(x, 180) },
  { name: "rotated 90° anticlockwise", f: (x) => rotate(x, 270) },
  { name: "mirrored left to right", f: (x) => mirror(x, "h") },
  { name: "flipped upside down (water image)", f: (x) => mirror(x, "v") },
];
const nvAnalogy = gen("nv-analogy", 60, (r) => {
  const t = r.pick(TRANSFORMS), A = composite(r), C = composite(r);
  if (look(A) === look(C)) return null;
  const B = t.f(A), D = t.f(C);
  const others = TRANSFORMS.filter((x) => x !== t).map((x) => x.f(C));
  return figQ("Figure 1 is related to Figure 2 in a certain way. Figure 3 is related to which option in the same way?", `Figure 2 is Figure 1 ${t.name}. Applying the same change to Figure 3 gives the answer.`, [A, B, C, null], figOptions(r, D, r.shuffle([...others, C])), 2);
});

// ───────────── Classification (odd figure out) ─────────────
const nvClassification = gen("nv-classification", 60, (r, i) => {
  if (i % 2 === 0) {
    const base = composite(r), oddPos = r.int(0, 3), turns = r.shuffle([0, 90, 180, 270]);
    const figs = turns.map((d, j) => (j === oddPos ? rotate(mirror(base, "h"), d) : rotate(base, d)));
    if (!distinct(figs)) return null;
    return { q: "Three of the four figures are the same figure in different orientations. Which figure is different?", o: figs.map((_, j) => `Figure ${"ABCD"[j]}`), a: oddPos, e: `Figures other than ${"ABCD"[oddPos]} can be turned into one another by rotation. Figure ${"ABCD"[oddPos]} is a mirror image, which no rotation can produce.`, d: 3, media: { type: "figs", problem: [], options: figs } };
  }
  const n = r.int(2, 5), oddPos = r.int(0, 3), oddN = r.pick([n - 1, n + 1].filter((x) => x >= 1 && x <= 6));
  const shapes = r.shuffle(["circle", "square", "triangle", "star", "diamond"] as const).slice(0, 4);
  const figs = shapes.map((s, j) => many(s, j === oddPos ? oddN : n));
  return { q: "Choose the figure which is different from the others.", o: figs.map((_, j) => `Figure ${"ABCD"[j]}`), a: oddPos, e: `Every figure except ${"ABCD"[oddPos]} contains ${n} shapes; Figure ${"ABCD"[oddPos]} contains ${oddN}.`, d: 1, media: { type: "figs", problem: [], options: figs } };
});

// ───────────── Mirror Images and Water Images ─────────────
const ASYM = "BCDEFGJKLNPQRSZ234567".split("");
const ASYM_V = "AFGJLMNPQRTUVWYZ2457".split("");
function word(r: Rng, chars: string[]) { return r.shuffle(chars).slice(0, r.int(4, 5)).join(""); }
const txt = (t: string, flip?: Shape["flip"], glyphFlip?: boolean): Fig => [{ k: "text", t, r: 18, flip, glyphFlip }];
const nvMirror = gen("nv-mirror", 60, (r, i) => {
  if (i % 3 === 2) {
    const base = composite(r);
    return figQ("Choose the correct mirror image of the given figure when the mirror is placed vertically to its right.", "A vertical mirror swaps left and right but keeps top and bottom: every element moves to the opposite side horizontally.", [base], figOptions(r, mirror(base, "h"), [mirror(base, "v"), rotate(base, 180), rotate(base, 90), base]), 2);
  }
  const w = word(r, ASYM);
  return figQ(`Choose the correct mirror image of the given combination when a mirror is placed vertically to its right.`, `In a mirror image the order of the characters is reversed and each character is laterally inverted, while top and bottom stay the same. The correct image is the whole of “${w}” flipped left to right.`, [txt(w)], figOptions(r, txt(w, "h"), [txt(w, "v"), txt(w, "hv"), txt(w, undefined, true)]), 2);
});
const nvWater = gen("nv-water", 60, (r, i) => {
  if (i % 3 === 2) {
    const base = composite(r);
    return figQ("Choose the correct water image of the given figure.", "A water image is the reflection in a horizontal surface: top and bottom are swapped while left and right stay the same.", [base], figOptions(r, mirror(base, "v"), [mirror(base, "h"), rotate(base, 180), rotate(base, 270), base]), 2);
  }
  const w = word(r, ASYM_V);
  return figQ("Choose the correct water image of the given combination.", `In a water image each character is turned upside down (as seen in still water) but the left-to-right order of “${w}” is unchanged.`, [txt(w)], figOptions(r, txt(w, "v"), [txt(w, "h"), txt(w, "hv"), txt(w, undefined, true)]), 2);
});

// ───────────── Figure Matrix (3 × 3) ─────────────
const nvMatrix = gen("nv-matrix", 60, (r, i) => {
  const rowShapes = r.shuffle([...SHAPES]).slice(0, 3) as Shape["k"][];
  if (i % 2 === 0) {
    const start = r.int(1, 3), fill = r.chance(0.5);
    const cell = (row: number, col: number) => many(rowShapes[row], start + col, fill, 8);
    const grid: (Fig | null)[] = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) grid.push(row === 2 && col === 2 ? null : cell(row, col));
    return figQ("Which figure completes the matrix?", `Each row uses one kind of shape, and the number of shapes increases by one from left to right (${start}, ${start + 1}, ${start + 2}). The missing figure has ${start + 2} ${rowShapes[2]}s.`, grid, figOptions(r, cell(2, 2), [cell(2, 1), many(rowShapes[1], start + 2, fill, 8), many(rowShapes[2], start + 2, !fill, 8), many(rowShapes[0], start + 2, fill, 8)]), 2, 3);
  }
  const s0 = r.pick([0, 90, 180, 270]), step = r.pick([45, 90]);
  const cell = (row: number, col: number): Fig => [{ k: "arrow", r: 22, rot: norm(s0 + step * (row + col)) }, { k: rowShapes[row], x: 80, y: 20, r: 8, fill: true }];
  const grid: (Fig | null)[] = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) grid.push(row === 2 && col === 2 ? null : cell(row, col));
  return figQ("Which figure completes the matrix?", `The arrow turns ${step}° clockwise from each cell to the next one on its right (and from row to row), and each row keeps its own small shape. The missing cell follows both rules.`, grid, figOptions(r, cell(2, 2), [cell(2, 1), cell(1, 2), [{ k: "arrow", r: 22, rot: norm(s0 + step * 4 + 180) }, { k: rowShapes[2], x: 80, y: 20, r: 8, fill: true }], [{ k: "arrow", r: 22, rot: norm(s0 + step * 5) }, { k: rowShapes[2], x: 80, y: 20, r: 8, fill: true }]]), 3, 3);
});

// ───────────── Pattern Completion (2 × 2 symmetry) ─────────────
const nvPattern = gen("nv-pattern", 60, (r) => {
  const tl = composite(r);
  const tr = mirror(tl, "h"), bl = mirror(tl, "v"), br = rotate(tl, 180);
  if (!distinct([tl, tr, bl, br])) return null;
  return figQ("The figure is symmetric about both its middle lines. Which option completes the missing quarter?", "The top-right quarter is the mirror image of the top-left, and the bottom-left is the water image of the top-left. So the bottom-right quarter must be both mirrored and flipped, which is the top-left quarter turned through 180°.", [tl, tr, bl, null], figOptions(r, br, [tl, tr, bl, rotate(tl, 90)]), 3, 2);
});

// ───────────── Rotation ─────────────
const ROT_ASK = [
  { deg: 90, text: "90° clockwise" },
  { deg: 270, text: "90° anticlockwise" },
  { deg: 180, text: "180°" },
];
const nvRotation = gen("nv-rotation", 60, (r) => {
  const base = composite(r), ask = r.pick(ROT_ASK);
  const others = ROT_ASK.filter((x) => x !== ask).map((x) => rotate(base, x.deg));
  return figQ(`Which option shows the given figure rotated ${ask.text}?`, `Rotate every part of the figure together by ${ask.text}: the arrow turns by that angle and the dot and the small shape move to the corresponding positions. A mirror image is never a rotation.`, [base], figOptions(r, rotate(base, ask.deg), [...others, mirror(base, "h"), mirror(base, "v")]), 2);
});

const subject: RawSubject = {
  series: topic(nvSeries, {
    intro: "A series of figures changes step by step. Find what changes from one figure to the next — rotation, movement, number of elements, shading or shape — and continue it.",
    formulas: [{ h: "Common changes", points: ["Rotation by 45°, 90° or 135° (clockwise or anticlockwise)", "An element moving around the corners or sides", "Elements being added or removed one at a time", "Number of sides increasing (triangle → square → pentagon …)", "Shading alternating between figures", "Two independent changes happening together"] }],
  }),
  analogy: topic(nvAnalogy, {
    intro: "Figure 1 changes into Figure 2 by some rule. Apply exactly the same rule to Figure 3.",
    formulas: [{ h: "Typical rules", points: ["Rotation (90°, 180°, 270°)", "Mirror image (left–right) or water image (top–bottom)", "Shading changes", "Elements added, removed or swapped"] }],
  }),
  classification: topic(nvClassification, {
    intro: "All figures but one share a property. Look for rotation versus reflection, the number of elements, shading, or the type of shapes.",
    formulas: [{ h: "Tip", points: ["If three figures are rotations of one figure, the fourth is often its mirror image — no rotation can turn a figure into its mirror image"] }],
  }),
  "mirror-images": topic(nvMirror, {
    intro: "A mirror placed vertically (to the right or left of an object) swaps left and right. Top and bottom are unchanged.",
    formulas: [{ h: "Rules", points: ["The order of characters is reversed and each character is laterally inverted", "Symmetric letters such as A, H, I, M, O, T, U, V, W, X and Y look the same in a vertical mirror", "Mirror image twice = original figure"] }],
  }),
  "water-images": topic(nvWater, {
    intro: "A water image is the reflection seen in still water: top and bottom are swapped, left and right are unchanged.",
    formulas: [{ h: "Rules", points: ["Each character is turned upside down but keeps its left-right position", "Letters symmetric about a horizontal axis (B, C, D, E, H, I, K, O, X) look the same in water", "Water image followed by mirror image = rotation through 180°"] }],
  }),
  "figure-matrix": topic(nvMatrix, {
    intro: "A 3 × 3 matrix follows rules along its rows and columns. Work out each rule from the complete rows and apply them to the last row.",
  }),
  "pattern-completion": topic(nvPattern, {
    intro: "The complete pattern is symmetric, so the missing part is a reflection of the parts you can see.",
    formulas: [{ h: "Symmetry in a square pattern", points: ["Quarter to the right of a quarter: its mirror image", "Quarter below a quarter: its water image", "Diagonally opposite quarter: rotated through 180°"] }],
  }),
  rotation: topic(nvRotation, {
    intro: "Rotation turns the whole figure about its centre. Every part moves together and keeps its shape; nothing is flipped.",
    formulas: [{ h: "Quick checks", points: ["90° clockwise: top goes to right, right to bottom, bottom to left, left to top", "180°: every element moves to the diagonally opposite position", "If a candidate needs a flip to match, it is a mirror image, not a rotation"] }],
  }),
};
export default subject;
