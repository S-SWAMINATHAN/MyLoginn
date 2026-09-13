import type { Formation } from "./scrollStore";

export type FormationData = {
  points: Float32Array; // length count * 3
  edges: Array<[number, number]>; // index pairs into points, for connecting lines
};

/** Deterministic pseudo-random in [0, 1) — stable across renders, no seeded-RNG dependency. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Vec3 = [number, number, number];

/** Map a small canonical point set onto exactly `count` points, jittering duplicates. */
function resample(base: Vec3[], count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const src = base[i % base.length];
    let [x, y, z] = src;
    if (i >= base.length) {
      const j = i - base.length;
      const jitter = 0.09;
      x += (hash(j * 3 + 1) - 0.5) * jitter;
      y += (hash(j * 3 + 2) - 0.5) * jitter;
      z += (hash(j * 3 + 3) - 0.5) * jitter;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/* ── Icosahedron (12 vertices / 30 edges) — the recurring "ML crystal" ── */
const PHI = (1 + Math.sqrt(5)) / 2;
const ICOSA_RADIUS = 1.28;
function icosahedronVertices(radius: number): Vec3[] {
  const raw: Vec3[] = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ];
  return raw.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [(x / len) * radius, (y / len) * radius, (z / len) * radius] as Vec3;
  });
}
const ICOSA_FACES: Array<[number, number, number]> = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];
function icosahedronEdges(): Array<[number, number]> {
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];
  for (const face of ICOSA_FACES) {
    for (let i = 0; i < 3; i++) {
      const a = face[i];
      const b = face[(i + 1) % 3];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push(a < b ? [a, b] : [b, a]);
      }
    }
  }
  return edges;
}

function nearestNeighborEdges(points: Vec3[], k: number): Array<[number, number]> {
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < points.length; i++) {
    const dists: Array<{ j: number; d: number }> = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let n = 0; n < Math.min(k, dists.length); n++) {
      const j = dists[n].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push(i < j ? [i, j] : [j, i]);
      }
    }
  }
  return edges;
}

/* ── Formation generators ────────────────────────────────────────────── */

function seedFormation(count: number): FormationData {
  return { points: resample([[0, 0, 0]], count), edges: [] };
}

function crystalFormation(count: number): FormationData {
  const verts = icosahedronVertices(ICOSA_RADIUS);
  const points = resample(verts, count);
  const edges = count >= 12 ? icosahedronEdges() : [];
  return { points, edges };
}

function networkFormation(count: number): FormationData {
  const radius = 2.4;
  const pts: Vec3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    pts.push([Math.cos(theta) * r * radius, y * radius * 0.85, Math.sin(theta) * r * radius]);
  }
  const points = new Float32Array(count * 3);
  pts.forEach((p, i) => points.set(p, i * 3));
  return { points, edges: nearestNeighborEdges(pts, 2) };
}

function gridFormation(count: number): FormationData {
  const cols = Math.max(1, Math.round(Math.sqrt(count * (16 / 9))));
  const rows = Math.max(1, Math.ceil(count / cols));
  const spacingX = 4.2 / Math.max(cols - 1, 1);
  const spacingY = 2.4 / Math.max(rows - 1, 1);
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = (c - (cols - 1) / 2) * spacingX;
    const y = ((rows - 1) / 2 - r) * spacingY;
    const z = (hash(i * 7.7) - 0.5) * 0.3;
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return { points, edges: [] };
}

function orbitHubFormation(count: number): FormationData {
  const ringDefs = [
    { r: 1.7, tilt: 0.08, share: 0.32 },
    { r: 2.35, tilt: -0.16, share: 0.36 },
    { r: 3.0, tilt: 0.22, share: 0.32 },
  ];
  const points = new Float32Array(count * 3);
  let idx = 0;
  for (let ring = 0; ring < ringDefs.length; ring++) {
    const { r, tilt } = ringDefs[ring];
    const ringCount = ring === ringDefs.length - 1 ? count - idx : Math.round(count * ringDefs[ring].share);
    for (let i = 0; i < ringCount && idx < count; i++, idx++) {
      const angle = (i / Math.max(ringCount, 1)) * Math.PI * 2 + ring * 0.6;
      const x = Math.cos(angle) * r;
      const zBase = Math.sin(angle) * r;
      const y = zBase * Math.sin(tilt) + (hash(idx * 3.1) - 0.5) * 0.15;
      const z = zBase * Math.cos(tilt);
      points[idx * 3] = x;
      points[idx * 3 + 1] = y;
      points[idx * 3 + 2] = z;
    }
  }
  return { points, edges: [] };
}

function streamFormation(count: number): FormationData {
  const lanes = 4;
  const perLane = Math.ceil(count / lanes);
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const lane = i % lanes;
    const idxInLane = Math.floor(i / lanes);
    const x = perLane > 1 ? (idxInLane / (perLane - 1) - 0.5) * 5.2 : 0;
    const y = (lane - (lanes - 1) / 2) * 0.72;
    const z = (hash(i * 4.3) - 0.5) * 0.18;
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return { points, edges: [] };
}

function treeFormation(count: number): FormationData {
  const branches = 8;
  const points: Vec3[] = [[0, 0, 0]];
  const edges: Array<[number, number]> = [];
  const remaining = count - 1;
  const perBranch = Math.max(1, Math.floor(remaining / branches));

  for (let b = 0; b < branches && points.length < count; b++) {
    const angle = (b / branches) * Math.PI * 2;
    const tilt = (hash(b * 2.7) - 0.5) * 0.7;
    let prevIndex = 0;
    for (let i = 1; i <= perBranch && points.length < count; i++) {
      const t = i / perBranch;
      const r = t * 2.7;
      const wobble = Math.sin(t * Math.PI * 1.4 + b) * 0.12;
      const x = Math.cos(angle) * r + wobble;
      const y = tilt * r + Math.sin(t * Math.PI) * 0.25;
      const z = Math.sin(angle) * r + wobble;
      points.push([x, y, z]);
      const newIndex = points.length - 1;
      edges.push([prevIndex, newIndex]);
      prevIndex = newIndex;
    }
  }
  // Pad any remainder (count not evenly divisible) as small jittered twigs off the root.
  while (points.length < count) {
    const j = points.length;
    points.push([(hash(j) - 0.5) * 0.4, (hash(j * 1.7) - 0.5) * 0.4, (hash(j * 2.3) - 0.5) * 0.4]);
    edges.push([0, j]);
  }

  const out = new Float32Array(count * 3);
  points.forEach((p, i) => out.set(p, i * 3));
  return { points: out, edges };
}

export function buildFormation(type: Formation, count: number): FormationData {
  switch (type) {
    case "seed":
      return seedFormation(count);
    case "crystal":
      return crystalFormation(count);
    case "network":
      return networkFormation(count);
    case "grid":
      return gridFormation(count);
    case "orbitHub":
      return orbitHubFormation(count);
    case "stream":
      return streamFormation(count);
    case "tree":
      return treeFormation(count);
    default:
      return crystalFormation(count);
  }
}
