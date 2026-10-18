/** Generated technical questions with computed answers: networking, OS algorithms, number systems, data structures. */
import type { RawQ } from "../../types";
import { cycle, fmt, gen, numOptions, textOptions, type Rng } from "../build";

// ───────────── Networking: IP addressing and subnetting ─────────────
const ipStr = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const maskOf = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);
function randomIp(r: Rng) { return ((r.int(10, 223) << 24) | (r.int(0, 255) << 16) | (r.int(0, 255) << 8) | r.int(1, 254)) >>> 0; }

export const subnetting: RawQ[] = gen("net-subnet", 72, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const p = r.int(16, 30), ip = randomIp(r), net = (ip & maskOf(p)) >>> 0; return { q: `What is the network address of the host ${ipStr(ip)}/${p}?`, ...textOptions(r, ipStr(net), [ipStr((net + (1 << (32 - p))) >>> 0), ipStr((net | (~maskOf(p) >>> 0)) >>> 0), ipStr((ip & maskOf(p - 1 || 1)) >>> 0), ipStr((ip & maskOf(Math.min(31, p + 1))) >>> 0)]), e: `Mask /${p} = ${ipStr(maskOf(p))}. AND the address with the mask: ${ipStr(ip)} AND ${ipStr(maskOf(p))} = **${ipStr(net)}**.`, d: 2 }; },
    (r) => { const p = r.int(16, 30), ip = randomIp(r), bc = ((ip & maskOf(p)) | (~maskOf(p) >>> 0)) >>> 0; return { q: `What is the broadcast address of the subnet containing ${ipStr(ip)}/${p}?`, ...textOptions(r, ipStr(bc), [ipStr((ip & maskOf(p)) >>> 0), ipStr((bc - 1) >>> 0), ipStr(((ip & maskOf(p - 1)) | (~maskOf(p - 1) >>> 0)) >>> 0), ipStr(((ip & maskOf(Math.min(31, p + 1))) | (~maskOf(Math.min(31, p + 1)) >>> 0)) >>> 0)]), e: `The broadcast address has all host bits set to 1. Network = ${ipStr((ip & maskOf(p)) >>> 0)}; with the last ${32 - p} bits set it becomes **${ipStr(bc)}**.`, d: 2 }; },
    (r) => { const p = r.int(18, 30), hosts = 2 ** (32 - p) - 2; return { q: `How many usable host addresses are there in a /${p} subnet?`, ...numOptions(r, hosts, { wrong: [hosts + 2, hosts * 2, 2 ** (31 - p) - 2 || 1], step: Math.max(1, hosts / 4), min: -1 }), e: `Host bits = 32 − ${p} = ${32 - p}. Usable hosts = 2^${32 - p}^ − 2 = **${fmt(hosts)}** (network and broadcast addresses are excluded).`, d: 1 }; },
    (r) => { const p = r.int(8, 30); return { q: `What is the subnet mask for the prefix /${p} in dotted-decimal notation?`, ...textOptions(r, ipStr(maskOf(p)), [ipStr(maskOf(p - 1)), ipStr(maskOf(Math.min(32, p + 1))), ipStr(maskOf(p + 2 > 32 ? p - 2 : p + 2))]), e: `/${p} means the first ${p} bits are 1: **${ipStr(maskOf(p))}**.`, d: 1 }; },
    (r) => { const o = r.int(1, 254); if (o === 127) return null; const cls = o <= 126 ? "A" : o <= 191 ? "B" : o <= 223 ? "C" : o <= 239 ? "D" : "E"; const ip = `${o}.${r.int(0, 255)}.${r.int(0, 255)}.${r.int(1, 254)}`; return { q: `To which class does the IPv4 address ${ip} belong (classful addressing)?`, o: ["Class A", "Class B", "Class C", "Class D", "Class E"], a: "ABCDE".indexOf(cls), e: `First octet ${o}: A = 1–126, B = 128–191, C = 192–223, D = 224–239 (multicast), E = 240–255. So it is **Class ${cls}**.`, d: 1 }; },
    (r) => { const need = r.pick([2, 3, 5, 6, 10, 12, 20, 30, 50]), bits = Math.ceil(Math.log2(need)), base = r.pick([16, 24]); return { q: `A /${base} network must be divided into at least ${need} equal subnets. What is the new prefix length?`, ...textOptions(r, `/${base + bits}`, [`/${base + bits - 1}`, `/${base + bits + 1}`, `/${base + bits + 2}`]), e: `Borrow n bits such that 2ⁿ ≥ ${need}: n = ${bits} (2^${bits}^ = ${2 ** bits}). New prefix = ${base} + ${bits} = **/${base + bits}**.`, d: 3 }; },
  ])
);

// ───────────── OS: CPU scheduling ─────────────
type Proc = { id: string; at: number; bt: number };
function fcfs(ps: Proc[]) { let t = 0; return ps.map((p) => { t = Math.max(t, p.at); const wt = t - p.at; t += p.bt; return wt; }); }
function sjf(ps: Proc[]) {
  const done = new Map<string, number>(); let t = 0;
  while (done.size < ps.length) {
    const ready = ps.filter((p) => !done.has(p.id) && p.at <= t);
    if (!ready.length) { t = Math.min(...ps.filter((p) => !done.has(p.id)).map((p) => p.at)); continue; }
    const p = ready.sort((a, b) => a.bt - b.bt || a.at - b.at)[0];
    done.set(p.id, t - p.at); t += p.bt;
  }
  return ps.map((p) => done.get(p.id)!);
}
function rr(ps: Proc[], q: number) {
  const rem = ps.map((p) => p.bt), fin = ps.map(() => 0); let t = 0; const queue = ps.map((_, k) => k);
  while (queue.length) { const k = queue.shift()!; const run = Math.min(q, rem[k]); t += run; rem[k] -= run; if (rem[k]) queue.push(k); else fin[k] = t; }
  return ps.map((p, k) => fin[k] - p.bt);
}
const table = (ps: Proc[], arrival: boolean) => `\`\`\`\nProcess  ${arrival ? "Arrival  " : ""}Burst\n${ps.map((p) => `${p.id.padEnd(9)}${arrival ? String(p.at).padEnd(9) : ""}${p.bt}`).join("\n")}\n\`\`\``;
export const cpuScheduling: RawQ[] = gen("os-sched", 60, (r, i) => {
  const n = r.int(3, 4), arrival = i % 3 === 1;
  const ps: Proc[] = Array.from({ length: n }, (_, k) => ({ id: `P${k + 1}`, at: arrival ? k * r.int(0, 2) : 0, bt: r.int(2, 10) }));
  const alg = ["FCFS", "SJF (non-preemptive)", "Round Robin (quantum 2)"][i % 3];
  const wts = alg === "FCFS" ? fcfs(ps) : alg.startsWith("SJF") ? sjf(ps) : rr(ps, 2);
  const avg = wts.reduce((a, b) => a + b, 0) / n;
  const other = alg === "FCFS" ? sjf(ps) : fcfs(ps);
  return { q: `Using ${alg} scheduling, what is the average waiting time for these processes${arrival ? "" : " (all arrive at time 0, in order)"}?\n${table(ps, arrival)}`, ...numOptions(r, avg, { wrong: [other.reduce((a, b) => a + b, 0) / n, avg + 1, (avg * n + ps[n - 1].bt) / n], step: 1, dp: 2, min: -1 }), e: `Waiting times: ${ps.map((p, k) => `${p.id} = ${wts[k]}`).join(", ")}.\nAverage = (${wts.join(" + ")})/${n} = **${fmt(avg)}**.`, d: alg.startsWith("Round") ? 3 : 2 };
});

// ───────────── OS: page replacement ─────────────
function faults(refs: number[], frames: number, alg: "FIFO" | "LRU" | "Optimal") {
  const mem: number[] = []; let f = 0; const last = new Map<number, number>();
  refs.forEach((p, t) => {
    if (mem.includes(p)) { last.set(p, t); return; }
    f++;
    if (mem.length < frames) mem.push(p);
    else {
      let victim = 0;
      if (alg === "FIFO") victim = 0;
      else if (alg === "LRU") victim = mem.reduce((best, x, k) => ((last.get(x) ?? -1) < (last.get(mem[best]) ?? -1) ? k : best), 0);
      else victim = mem.reduce((best, x, k) => { const nx = refs.indexOf(x, t + 1), nb = refs.indexOf(mem[best], t + 1); return (nx === -1 ? 1e9 : nx) > (nb === -1 ? 1e9 : nb) ? k : best; }, 0);
      mem.splice(victim, 1);
      mem.push(p);
    }
    last.set(p, t);
  });
  return f;
}
export const pageReplacement: RawQ[] = gen("os-pages", 60, (r, i) => {
  const alg = (["FIFO", "LRU", "Optimal"] as const)[i % 3], frames = r.pick([3, 3, 4]);
  const refs = Array.from({ length: r.int(10, 14) }, () => r.int(0, 6));
  const f = faults(refs, frames, alg);
  return { q: `How many page faults occur with ${alg} page replacement and ${frames} initially empty frames for the reference string:\n${refs.join(", ")}`, ...numOptions(r, f, { wrong: [alg === "FIFO" ? faults(refs, frames, "LRU") : faults(refs, frames, "FIFO"), faults(refs, frames, "Optimal"), f + 1].filter((x) => x !== f), step: 1, dp: 0 }), e: `Simulating ${alg} with ${frames} frames, every reference to a page not in memory is a fault${alg === "FIFO" ? "; the oldest loaded page is replaced" : alg === "LRU" ? "; the least recently used page is replaced" : "; the page used furthest in the future is replaced"}. Total faults = **${f}**.`, d: 2 };
});

// ───────────── OS: disk scheduling ─────────────
export const diskScheduling: RawQ[] = gen("os-disk", 48, (r, i) => {
  const head = r.int(30, 150), reqs = Array.from({ length: r.int(5, 7) }, () => r.int(0, 199));
  if (new Set(reqs).size < reqs.length || reqs.includes(head)) return null;
  const alg = i % 2 ? "SSTF" : "FCFS";
  let pos = head, total = 0; const order: number[] = [];
  if (alg === "FCFS") for (const q of reqs) { total += Math.abs(q - pos); pos = q; order.push(q); }
  else { const left = [...reqs]; while (left.length) { left.sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos) || a - b); const q = left.shift()!; total += Math.abs(q - pos); pos = q; order.push(q); } }
  let fpos = head, ftotal = 0; for (const q of reqs) { ftotal += Math.abs(q - fpos); fpos = q; }
  return { q: `The disk head is at cylinder ${head}. Requests arrive in the order ${reqs.join(", ")}. What is the total head movement (in cylinders) using ${alg}?`, ...numOptions(r, total, { wrong: [alg === "FCFS" ? total - 20 : ftotal, total + 10, Math.max(...reqs) - Math.min(...reqs)], step: 10 }), e: `Service order: ${head} → ${order.join(" → ")}.\nTotal movement = ${[head, ...order].slice(1).map((q, k) => `|${q} − ${[head, ...order][k]}|`).join(" + ")} = **${total}**.`, d: 2 };
});

// ───────────── Number systems ─────────────
export const numberSystems: RawQ[] = gen("num-systems", 80, (r, i) =>
  cycle<RawQ | null>(i, r, [
    (r) => { const n = r.int(10, 255); return { q: `Convert the decimal number ${n} to binary.`, ...textOptions(r, n.toString(2), [(n + 1).toString(2), (n - 1).toString(2), (n ^ 4).toString(2), n.toString(2).split("").reverse().join("")]), e: `Divide by 2 repeatedly and read the remainders upwards: ${n}₁₀ = **${n.toString(2)}₂**.`, d: 1 }; },
    (r) => { const n = r.int(16, 1023); const b = n.toString(2); return { q: `Convert the binary number ${b} to decimal.`, ...numOptions(r, n, { wrong: [n + 2 ** r.int(0, 3), n - 1, parseInt(b.split("").reverse().join(""), 2)], step: 4 }), e: `Add the place values of the 1-bits: ${b.split("").map((c, k) => (c === "1" ? `2^${b.length - 1 - k}^` : "")).filter(Boolean).join(" + ")} = **${n}**.`, d: 1 }; },
    (r) => { const n = r.int(16, 4095); return { q: `Convert the decimal number ${n} to hexadecimal.`, ...textOptions(r, n.toString(16).toUpperCase(), [(n + 1).toString(16).toUpperCase(), (n + 16).toString(16).toUpperCase(), n.toString(8)]), e: `Divide by 16 repeatedly: ${n}₁₀ = **${n.toString(16).toUpperCase()}₁₆**.`, d: 1 }; },
    (r) => { const n = r.int(8, 511); return { q: `Convert the decimal number ${n} to octal.`, ...textOptions(r, n.toString(8), [(n + 1).toString(8), n.toString(16), (n - 8).toString(8)]), e: `Divide by 8 repeatedly: ${n}₁₀ = **${n.toString(8)}₈**.`, d: 1 }; },
    (r) => { const n = r.int(16, 255), b = n.toString(2).padStart(8, "0"); return { q: `Convert the binary number ${b} to hexadecimal.`, ...textOptions(r, n.toString(16).toUpperCase().padStart(2, "0"), [(n ^ 1).toString(16).toUpperCase().padStart(2, "0"), n.toString(8), (n >> 1).toString(16).toUpperCase().padStart(2, "0")]), e: `Group the bits in fours from the right: ${b.slice(0, 4)} ${b.slice(4)} = ${parseInt(b.slice(0, 4), 2).toString(16).toUpperCase()} ${parseInt(b.slice(4), 2).toString(16).toUpperCase()} → **${n.toString(16).toUpperCase().padStart(2, "0")}**.`, d: 1 }; },
    (r) => { const a = r.int(5, 120), b = r.int(5, 120); return { q: `Add the binary numbers ${a.toString(2)} and ${b.toString(2)}.`, ...textOptions(r, (a + b).toString(2), [(a + b + 1).toString(2), (a ^ b).toString(2), (a | b).toString(2)]), e: `${a.toString(2)} (${a}) + ${b.toString(2)} (${b}) = ${a + b} = **${(a + b).toString(2)}₂**.`, d: 2 }; },
    (r) => { const n = r.int(1, 127), tc = ((256 - n) & 255).toString(2).padStart(8, "0"); return { q: `What is the 8-bit two's complement representation of −${n}?`, ...textOptions(r, tc, [n.toString(2).padStart(8, "0"), ((255 - n) & 255).toString(2).padStart(8, "0"), ("1" + n.toString(2).padStart(7, "0"))]), e: `Write +${n} in 8 bits (${n.toString(2).padStart(8, "0")}), invert all bits (${((255 - n) & 255).toString(2).padStart(8, "0")}), then add 1: **${tc}**.`, d: 2 }; },
  ])
);

// ───────────── Boolean algebra evaluation ─────────────
export const booleanEval: RawQ[] = gen("bool-eval", 48, (r) => {
  const A = r.int(0, 1), B = r.int(0, 1), C = r.int(0, 1);
  const exprs: [string, (a: number, b: number, c: number) => number][] = [
    ["A·B + C", (a, b, c) => (a & b) | c],
    ["(A + B)·C̅", (a, b, c) => (a | b) & (1 - c)],
    ["A ⊕ B ⊕ C", (a, b, c) => a ^ b ^ c],
    ["(A·B)̅ + C", (a, b, c) => (1 - (a & b)) | c],
    ["A̅·B + A·C", (a, b, c) => ((1 - a) & b) | (a & c)],
    ["(A + B̅)·(B + C)", (a, b, c) => (a | (1 - b)) & (b | c)],
  ];
  const [text, f] = r.pick(exprs);
  const v = f(A, B, C);
  return { q: `Evaluate the Boolean expression ${text} for A = ${A}, B = ${B}, C = ${C}.`, o: ["0", "1"], a: v, e: `Substitute the values (· is AND, + is OR, ⊕ is XOR, a bar means NOT) and evaluate inside-out. The result is **${v}**.`, d: 1 };
});

// ───────────── Data structures ─────────────
function toPostfix(tokens: string[]) {
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const out: string[] = [], st: string[] = [];
  for (const t of tokens) {
    if (/^[A-Z]$/.test(t)) out.push(t);
    else if (t === "(") st.push(t);
    else if (t === ")") { while (st.length && st[st.length - 1] !== "(") out.push(st.pop()!); st.pop(); }
    else { while (st.length && st[st.length - 1] !== "(" && (prec[st[st.length - 1]] > prec[t] || (prec[st[st.length - 1]] === prec[t] && t !== "^"))) out.push(st.pop()!); st.push(t); }
  }
  while (st.length) out.push(st.pop()!);
  return out.join("");
}
const INFIX = ["A+B*C", "(A+B)*C", "A*B+C*D", "A+B-C", "(A-B)*(C+D)", "A*(B+C)/D", "A+B*C-D/E", "(A+B)*(C-D)/E", "A^B^C", "A*B^C+D", "(A+B*C)*D", "A-B/C+D*E"];
const BST_KEYS = (r: Rng) => r.shuffle([10, 20, 30, 40, 50, 60, 70, 80, 15, 25, 35, 45, 55, 65, 75]).slice(0, 7);
type Node = { k: number; l?: Node; rt?: Node };
function insert(n: Node | undefined, k: number): Node { if (!n) return { k }; if (k < n.k) n.l = insert(n.l, k); else n.rt = insert(n.rt, k); return n; }
const pre = (n?: Node): number[] => (n ? [n.k, ...pre(n.l), ...pre(n.rt)] : []);
const post = (n?: Node): number[] => (n ? [...post(n.l), ...post(n.rt), n.k] : []);
const ino = (n?: Node): number[] => (n ? [...ino(n.l), n.k, ...ino(n.rt)] : []);
const height = (n?: Node): number => (n ? 1 + Math.max(height(n.l), height(n.rt)) : 0);

export const dsGenerated = {
  stacks: gen("ds-stack", 40, (r, i) => {
    if (i % 2) {
      const t = r.pick(INFIX), pf = toPostfix([...t]);
      const wrong = [toPostfix([...t.replace(/\(|\)/g, "")]), pf.split("").reverse().join(""), t.replace(/[()]/g, "")];
      return { q: `Convert the infix expression ${t} to postfix.`, ...textOptions(r, pf, wrong), e: `Using a stack for operators (precedence ^ > * / > + −, ^ is right-associative), operands go straight to the output: **${pf}**.`, d: 2 };
    }
    const ops: string[] = [], st: number[] = []; let popped: number[] = [];
    for (let k = 0; k < 7; k++) { if (st.length && r.chance(0.4)) { popped.push(st.pop()!); ops.push("pop()"); } else { const v = r.int(1, 9); st.push(v); ops.push(`push(${v})`); } }
    popped = popped.slice();
    const top = st.length ? String(st[st.length - 1]) : "Stack is empty";
    return { q: `Starting with an empty stack, these operations are performed: ${ops.join(", ")}. What is at the top of the stack now?`, ...textOptions(r, top, ["Stack is empty", ...st.slice(0, -1).map(String), ...popped.map(String), "0"].filter((x) => x !== top)), e: `Tracing the stack (last in, first out), its contents from bottom to top are [${st.join(", ")}]. The top is **${top}**.`, d: 1 };
  }),
  queues: gen("ds-queue", 32, (r) => {
    const ops: string[] = [], q: number[] = [];
    for (let k = 0; k < 7; k++) { if (q.length && r.chance(0.4)) { q.shift(); ops.push("dequeue()"); } else { const v = r.int(1, 9); q.push(v); ops.push(`enqueue(${v})`); } }
    const front = q.length ? String(q[0]) : "Queue is empty";
    return { q: `Starting with an empty queue: ${ops.join(", ")}. Which element is at the front?`, ...textOptions(r, front, ["Queue is empty", ...q.slice(1).map(String), "0", "9"].filter((x) => x !== front)), e: `A queue is first in, first out. The remaining elements from front to rear are [${q.join(", ")}], so the front is **${front}**.`, d: 1 };
  }),
  bst: gen("ds-bst", 48, (r, i) => {
    const keys = BST_KEYS(r); let root: Node | undefined; for (const k of keys) root = insert(root, k);
    const kind = ["preorder", "postorder", "inorder", "height"][i % 4];
    if (kind === "height") return { q: `The keys ${keys.join(", ")} are inserted in this order into an empty binary search tree. What is the height of the tree (number of levels)?`, ...numOptions(r, height(root), { wrong: [Math.ceil(Math.log2(keys.length + 1)), keys.length, height(root) + 1], step: 1, dp: 0 }), e: `Building the tree level by level gives ${height(root)} levels (root at level 1).`, d: 2 };
    const seq = (kind === "preorder" ? pre(root) : kind === "postorder" ? post(root) : ino(root)).join(", ");
    return { q: `The keys ${keys.join(", ")} are inserted in this order into an empty binary search tree. What is its ${kind} traversal?`, ...textOptions(r, seq, [pre(root).join(", "), post(root).join(", "), ino(root).join(", "), keys.join(", ")].filter((x) => x !== seq)), e: `${kind === "inorder" ? "An inorder traversal of a BST always gives the keys in sorted order." : kind === "preorder" ? "Preorder visits root, left subtree, right subtree." : "Postorder visits left subtree, right subtree, root."} Result: **${seq}**.`, d: kind === "inorder" ? 1 : 2 };
  }),
  postfixEval: gen("ds-postfix", 32, (r) => {
    const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(1, 5);
    const forms: [string, number, string][] = [
      [`${a} ${b} + ${c} *`, (a + b) * c, `(${a} + ${b}) × ${c}`],
      [`${a} ${b} ${c} * +`, a + b * c, `${a} + ${b} × ${c}`],
      [`${a} ${b} * ${c} ${d} * -`, a * b - c * d, `${a} × ${b} − ${c} × ${d}`],
      [`${a} ${b} - ${c} +`, a - b + c, `${a} − ${b} + ${c}`],
    ];
    const [expr, v, inf] = r.pick(forms);
    return { q: `Evaluate the postfix expression: ${expr}`, ...numOptions(r, v, { wrong: [v + c, v - 1, a * b * c], step: 2, min: -1e9 }), e: `Push operands; on each operator pop two values, apply it and push the result. The expression equals ${inf} = **${v}**.`, d: 2 };
  }),
  trees: gen("ds-tree-props", 32, (r, i) =>
    cycle<RawQ | null>(i, r, [
      (r) => { const l = r.int(2, 8); return { q: `What is the maximum number of nodes at level ${l} of a binary tree (root at level 0)?`, ...numOptions(r, 2 ** l, { wrong: [2 ** (l + 1) - 1, 2 * l, 2 ** (l - 1)], step: 2 }), e: `Each level can have twice as many nodes as the previous one: 2^${l}^ = **${2 ** l}**.`, d: 1 }; },
      (r) => { const h = r.int(3, 10); return { q: `What is the maximum number of nodes in a binary tree of height ${h} (a single node has height 1)?`, ...numOptions(r, 2 ** h - 1, { wrong: [2 ** h, 2 ** (h - 1), 2 * h], step: 4 }), e: `Maximum nodes = 2^h^ − 1 = 2^${h}^ − 1 = **${2 ** h - 1}**.`, d: 1 }; },
      (r) => { const n = r.int(5, 60); return { q: `A full binary tree (every node has 0 or 2 children) has ${n} internal nodes. How many leaves does it have?`, ...numOptions(r, n + 1, { wrong: [n, 2 * n, n - 1], step: 1 }), e: `In a full binary tree, leaves = internal nodes + 1 = **${n + 1}**.`, d: 2 }; },
      (r) => { const n = r.int(10, 100); return { q: `What is the minimum possible height of a binary tree with ${n} nodes (a single node has height 1)?`, ...numOptions(r, Math.ceil(Math.log2(n + 1)), { wrong: [Math.floor(Math.log2(n)), n, Math.ceil(n / 2)], step: 1, dp: 0 }), e: `Height h holds at most 2^h^ − 1 nodes, so the minimum height is ⌈log₂(${n} + 1)⌉ = **${Math.ceil(Math.log2(n + 1))}**.`, d: 2 }; },
    ])
  ),
  hashing: gen("ds-hash", 32, (r) => {
    const size = r.pick([7, 10, 11, 13]), keys = Array.from({ length: 5 }, () => r.int(10, 99));
    if (new Set(keys).size < 5) return null;
    const slots: (number | null)[] = Array(size).fill(null);
    for (const k of keys) { let p = k % size; while (slots[p] !== null) p = (p + 1) % size; slots[p] = k; }
    const last = keys[4], pos = slots.indexOf(last);
    return { q: `The keys ${keys.join(", ")} are inserted in this order into a hash table of size ${size} using h(k) = k mod ${size} and linear probing. At which index is ${last} stored?`, ...numOptions(r, pos, { wrong: [last % size, (last % size + 1) % size, (pos + 1) % size], step: 1, dp: 0, min: -1 }), e: `h(${last}) = ${last} mod ${size} = ${last % size}. ${pos === last % size ? "That slot is free" : `Probing forward past occupied slots, the first free slot is ${pos}`}, so ${last} is stored at index **${pos}**.`, d: 2 };
  }),
  binarySearch: gen("ds-bsearch", 24, (r) => {
    const n = r.int(8, 20), arr = Array.from({ length: n }, (_, k) => (k + 1) * r.int(2, 3) + k), target = arr[r.int(0, n - 1)];
    const sorted = [...new Set(arr)].sort((a, b) => a - b);
    let lo = 0, hi = sorted.length - 1, c = 0;
    while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); c++; if (sorted[mid] === target) break; if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1; }
    return { q: `Using binary search (mid = ⌊(low + high)/2⌋) on the sorted array [${sorted.join(", ")}], how many comparisons with array elements are needed to find ${target}?`, ...numOptions(r, c, { wrong: [c + 1, Math.ceil(Math.log2(sorted.length)), sorted.indexOf(target) + 1].filter((x) => x !== c), step: 1, dp: 0 }), e: `Each step compares the target with the middle element and halves the range. ${target} is found after **${c}** comparison(s).`, d: 2 };
  }),
};
