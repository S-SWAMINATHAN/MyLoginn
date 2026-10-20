/**
 * Starter question bank for the coding competition: nine original problems (three per difficulty) with Python
 * reference solutions. Expected outputs are computed by independent JavaScript implementations (`solve`), and
 * scripts/cc-seed-dev.ts checks every Python reference against them on the judge before anything is saved.
 *
 * Import into a database with:  npx tsx scripts/cc-import-bank.ts   (admin can then edit, version or deactivate)
 */

export type StarterProblem = {
  family: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: string;
  expectedMinutes: number;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  reference: string;
  solve: (input: string) => string;
  samples: string[];
  hidden: string[];
};

/** Deterministic generator so the bank is identical on every run. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const ints = (r: () => number, n: number, lo: number, hi: number) => Array.from({ length: n }, () => lo + Math.floor(r() * (hi - lo + 1)));
const arrInput = (a: number[]) => `${a.length}\n${a.join(" ")}\n`;
const nums = (input: string) => input.trim().split(/\s+/).map(Number);

const BASE_BANK: StarterProblem[] = [
  {
    family: "sum-of-evens",
    title: "Sum of Even Numbers",
    difficulty: "EASY",
    topic: "arrays",
    expectedMinutes: 10,
    statement: "You are given a list of integers. Print the sum of the numbers that are even. If there are no even numbers, print 0.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "A single integer: the sum of the even numbers.",
    constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nprint(sum(x for x in map(int, data[1:1 + n]) if x % 2 == 0))\n",
    solve: (input) => {
      const [n, ...a] = nums(input);
      return String(a.slice(0, n).filter((x) => x % 2 === 0).reduce((s, x) => s + x, 0));
    },
    samples: ["5\n1 2 3 4 5\n", "3\n1 3 5\n"],
    hidden: (() => { const r = rng(11); return ["1\n0\n", "4\n-2 -4 7 9\n", arrInput(ints(r, 50, -100, 100)), arrInput(ints(r, 1000, -1e6, 1e6)), arrInput(ints(r, 5000, -1e9, 1e9)), "6\n2 2 2 2 2 2\n", "2\n-7 -9\n", arrInput(ints(r, 20000, 0, 1000))]; })(),
  },
  {
    family: "count-vowels",
    title: "Count the Vowels",
    difficulty: "EASY",
    topic: "strings",
    expectedMinutes: 11,
    statement: "Given a line of text, print how many vowels it contains. Vowels are a, e, i, o and u, in either upper or lower case.",
    inputFormat: "A single line of text (it may contain spaces and punctuation).",
    outputFormat: "A single integer: the number of vowels.",
    constraints: "1 ≤ length ≤ 100000",
    reference: "import sys\ntext = sys.stdin.readline().rstrip('\\n')\nprint(sum(1 for ch in text if ch.lower() in 'aeiou'))\n",
    solve: (input) => String([...input.split("\n")[0]].filter((ch) => "aeiou".includes(ch.toLowerCase())).length),
    samples: ["Hello World\n", "Rhythm\n"],
    hidden: (() => { const r = rng(12); const words = ["code", "MyLoginn", "QUEUE", "sky", "Algorithm", "Data", "rhythm", "AEIOU", "xyz", "Education"]; const line = (k: number) => Array.from({ length: k }, () => words[Math.floor(r() * words.length)]).join(" "); return ["a\n", "BCDFG\n", "AeIoU aEiOu\n", `${line(30)}!\n`, `${line(800)}\n`, `${line(5000)}\n`, "1234 !? ,.\n", "Programming, problem-solving & persistence.\n"]; })(),
  },
  {
    family: "second-largest",
    title: "Second Largest Distinct Value",
    difficulty: "EASY",
    topic: "arrays",
    expectedMinutes: 12,
    statement: "Given a list of integers, print the second largest distinct value. If all values are equal, print -1.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "A single integer.",
    constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nvalues = sorted(set(map(int, data[1:1 + n])), reverse=True)\nprint(values[1] if len(values) > 1 else -1)\n",
    solve: (input) => {
      const [n, ...a] = nums(input);
      const d = [...new Set(a.slice(0, n))].sort((x, y) => y - x);
      return String(d.length > 1 ? d[1] : -1);
    },
    samples: ["5\n4 1 7 7 3\n", "3\n2 2 2\n"],
    hidden: (() => { const r = rng(13); return ["1\n5\n", "2\n-1 -2\n", "4\n9 9 8 8\n", arrInput(ints(r, 60, -50, 50)), arrInput(ints(r, 2000, -1e9, 1e9)), arrInput(ints(r, 30000, 1, 3)), "5\n-5 -5 -5 -5 -4\n", arrInput(ints(r, 10, 7, 7))]; })(),
  },
  {
    family: "max-subarray",
    title: "Maximum Subarray Sum",
    difficulty: "MEDIUM",
    topic: "dynamic programming",
    expectedMinutes: 22,
    statement: "Given n integers, print the largest possible sum of a non-empty contiguous subarray.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "A single integer: the maximum subarray sum.",
    constraints: "1 ≤ n ≤ 200000\n-10^4 ≤ a[i] ≤ 10^4",
    reference: "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\na = list(map(int, data[1:1 + n]))\nbest = cur = a[0]\nfor x in a[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)\n",
    solve: (input) => {
      const [n, ...a] = nums(input);
      let best = a[0], cur = a[0];
      for (let i = 1; i < n; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); }
      return String(best);
    },
    samples: ["5\n-2 1 -3 4 -1\n", "4\n-3 -1 -4 -2\n"],
    hidden: (() => { const r = rng(21); return ["1\n-7\n", "6\n1 2 3 4 5 6\n", "8\n5 -9 6 -2 3 -1 8 -20\n", arrInput(ints(r, 100, -50, 50)), arrInput(ints(r, 5000, -10000, 10000)), arrInput(ints(r, 50000, -100, 99)), arrInput(ints(r, 2000, -10000, -1)), arrInput(ints(r, 40000, -10000, 10000))]; })(),
  },
  {
    family: "balanced-brackets",
    title: "Balanced Brackets",
    difficulty: "MEDIUM",
    topic: "stacks",
    expectedMinutes: 20,
    statement: "A string contains only the characters ()[]{}. Print YES if every bracket is closed by the same type of bracket in the correct order, otherwise print NO.",
    inputFormat: "A single line containing the bracket string.",
    outputFormat: "YES or NO.",
    constraints: "1 ≤ length ≤ 200000",
    reference: "import sys\ns = sys.stdin.readline().strip()\npairs = {')': '(', ']': '[', '}': '{'}\nstack = []\nok = True\nfor ch in s:\n    if ch in '([{':\n        stack.append(ch)\n    elif not stack or stack.pop() != pairs[ch]:\n        ok = False\n        break\nprint('YES' if ok and not stack else 'NO')\n",
    solve: (input) => {
      const s = input.trim();
      const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
      const st: string[] = [];
      for (const ch of s) {
        if ("([{".includes(ch)) st.push(ch);
        else if (!st.length || st.pop() !== pairs[ch]) return "NO";
      }
      return st.length ? "NO" : "YES";
    },
    samples: ["{[()]}\n", "([)]\n"],
    hidden: (() => {
      const r = rng(22);
      const balanced = (n: number): string => { let out = ""; const st: string[] = []; const open = "([{", close = ")]}"; for (let i = 0; i < n; i++) { if (st.length && (r() < 0.5 || st.length > 50)) out += close[open.indexOf(st.pop()!)]; else { const k = Math.floor(r() * 3); st.push(open[k]); out += open[k]; } } while (st.length) out += close[open.indexOf(st.pop()!)]; return out; };
      const big = balanced(60000);
      return ["(\n", ")(\n", "()[]{}\n", `${balanced(40)}\n`, `${big}\n`, `${big.slice(0, -1)}]\n`, `${"(".repeat(30000)}${")".repeat(30000)}\n`, `${balanced(1000)}}\n`];
    })(),
  },
  {
    family: "longest-unique-substring",
    title: "Longest Substring Without Repeats",
    difficulty: "MEDIUM",
    topic: "sliding window",
    expectedMinutes: 24,
    statement: "Given a string of lowercase letters, print the length of the longest substring in which no character repeats.",
    inputFormat: "A single line containing the string.",
    outputFormat: "A single integer.",
    constraints: "1 ≤ length ≤ 200000",
    reference: "import sys\ns = sys.stdin.readline().strip()\nlast = {}\nstart = best = 0\nfor i, ch in enumerate(s):\n    if ch in last and last[ch] >= start:\n        start = last[ch] + 1\n    last[ch] = i\n    best = max(best, i - start + 1)\nprint(best)\n",
    solve: (input) => {
      const s = input.trim();
      const last = new Map<string, number>();
      let start = 0, best = 0;
      for (let i = 0; i < s.length; i++) { const p = last.get(s[i]); if (p !== undefined && p >= start) start = p + 1; last.set(s[i], i); best = Math.max(best, i - start + 1); }
      return String(best);
    },
    samples: ["abcabcbb\n", "bbbbb\n"],
    hidden: (() => { const r = rng(23); const str = (n: number, k: number) => Array.from({ length: n }, () => String.fromCharCode(97 + Math.floor(r() * k))).join(""); return ["a\n", "abcdefghijklmnopqrstuvwxyz\n", "pwwkew\n", `${str(100, 5)}\n`, `${str(5000, 26)}\n`, `${str(100000, 3)}\n`, `${"ab".repeat(20000)}\n`, `${str(150000, 26)}\n`]; })(),
  },
  {
    family: "lis-length",
    title: "Longest Increasing Subsequence",
    difficulty: "HARD",
    topic: "binary search",
    expectedMinutes: 38,
    statement: "Given n integers, print the length of the longest strictly increasing subsequence (not necessarily contiguous). An O(n²) solution will not pass the largest tests.",
    inputFormat: "The first line contains n. The second line contains n space-separated integers.",
    outputFormat: "A single integer.",
    constraints: "1 ≤ n ≤ 200000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nfrom bisect import bisect_left\ndata = sys.stdin.read().split()\nn = int(data[0])\ntails = []\nfor x in map(int, data[1:1 + n]):\n    i = bisect_left(tails, x)\n    if i == len(tails):\n        tails.append(x)\n    else:\n        tails[i] = x\nprint(len(tails))\n",
    solve: (input) => {
      const [n, ...a] = nums(input);
      const tails: number[] = [];
      for (const x of a.slice(0, n)) { let lo = 0, hi = tails.length; while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < x) lo = m + 1; else hi = m; } tails[lo] = x; }
      return String(tails.length);
    },
    samples: ["8\n10 9 2 5 3 7 101 18\n", "5\n5 4 3 2 1\n"],
    hidden: (() => { const r = rng(31); return ["1\n42\n", "6\n1 1 1 1 1 1\n", arrInput(Array.from({ length: 1000 }, (_, i) => i)), arrInput(ints(r, 200, -100, 100)), arrInput(ints(r, 5000, -1e9, 1e9)), arrInput(ints(r, 100000, -1e9, 1e9)), arrInput(Array.from({ length: 60000 }, (_, i) => (i % 2 ? i : -i))), arrInput(ints(r, 80000, 1, 50))]; })(),
  },
  {
    family: "min-coins",
    title: "Minimum Coins",
    difficulty: "HARD",
    topic: "dynamic programming",
    expectedMinutes: 36,
    statement: "You have unlimited coins of k denominations. Print the minimum number of coins whose values add up to exactly the amount, or -1 if it cannot be made. An amount of 0 needs 0 coins.",
    inputFormat: "The first line contains k and amount. The second line contains k space-separated denominations.",
    outputFormat: "A single integer.",
    constraints: "1 ≤ k ≤ 100\n0 ≤ amount ≤ 100000\n1 ≤ coin ≤ 100000",
    reference: "import sys\ndata = sys.stdin.read().split()\nk, amount = int(data[0]), int(data[1])\ncoins = list(map(int, data[2:2 + k]))\nINF = amount + 1\ndp = [0] + [INF] * amount\nfor c in coins:\n    for v in range(c, amount + 1):\n        if dp[v - c] + 1 < dp[v]:\n            dp[v] = dp[v - c] + 1\nprint(dp[amount] if dp[amount] <= amount else -1)\n",
    solve: (input) => {
      const [k, amount, ...coins] = nums(input);
      const INF = amount + 1;
      const dp = new Array(amount + 1).fill(INF);
      dp[0] = 0;
      for (const c of coins.slice(0, k)) for (let v = c; v <= amount; v++) if (dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1;
      return String(dp[amount] <= amount ? dp[amount] : -1);
    },
    samples: ["3 11\n1 2 5\n", "1 3\n2\n"],
    hidden: (() => { const r = rng(32); const c = (k: number, lo: number, hi: number, amount: number) => `${k} ${amount}\n${ints(r, k, lo, hi).join(" ")}\n`; return ["1 0\n7\n", "2 7\n2 4\n", "3 100\n1 7 10\n", c(5, 2, 40, 997), c(10, 3, 300, 20000), c(20, 50, 5000, 99999), "4 63\n1 5 10 21\n", c(8, 1000, 100000, 1)]; })(),
  },
  {
    family: "grid-paths-obstacles",
    title: "Grid Paths With Obstacles",
    difficulty: "HARD",
    topic: "dynamic programming",
    expectedMinutes: 40,
    statement: "A robot starts at the top-left cell of an r × c grid and must reach the bottom-right cell, moving only right or down. Cells marked # are blocked. Print the number of distinct paths modulo 1000000007 (print 0 if the start or end is blocked).",
    inputFormat: "The first line contains r and c. The next r lines each contain c characters, '.' for open and '#' for blocked.",
    outputFormat: "A single integer.",
    constraints: "1 ≤ r, c ≤ 1000",
    reference: "import sys\ndata = sys.stdin.read().split()\nr, c = int(data[0]), int(data[1])\ngrid = data[2:2 + r]\nMOD = 10**9 + 7\nrow = [0] * c\nfor i in range(r):\n    line = grid[i]\n    for j in range(c):\n        if line[j] == '#':\n            row[j] = 0\n        elif i == 0 and j == 0:\n            row[j] = 1\n        elif j > 0:\n            row[j] = (row[j] + row[j - 1]) % MOD\nprint(row[c - 1] % MOD)\n",
    solve: (input) => {
      const t = input.trim().split(/\s+/);
      const r = Number(t[0]), c = Number(t[1]);
      const grid = t.slice(2, 2 + r);
      const P = 1000000007;
      const row = new Array<number>(c).fill(0);
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
        if (grid[i][j] === "#") row[j] = 0;
        else if (i === 0 && j === 0) row[j] = 1;
        else if (j > 0) row[j] = (row[j] + row[j - 1]) % P;
      }
      return String(row[c - 1] % P);
    },
    samples: ["3 3\n...\n.#.\n...\n", "2 2\n.#\n#.\n"],
    hidden: (() => {
      const r = rng(33);
      const g = (h: number, w: number, p: number) => { const rows = Array.from({ length: h }, () => Array.from({ length: w }, () => (r() < p ? "#" : ".")).join("")); rows[0] = `.${rows[0].slice(1)}`; rows[h - 1] = `${rows[h - 1].slice(0, -1)}.`; return `${h} ${w}\n${rows.join("\n")}\n`; };
      return ["1 1\n.\n", "1 1\n#\n", "1 5\n.....\n", g(10, 10, 0.1), g(60, 80, 0.05), g(300, 300, 0.02), g(700, 700, 0), g(1000, 400, 0.1)];
    })(),
  },
];

// ───────────────────────────── Extra bank (51 problems) ─────────────────────────────

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const word = (r: () => number, min: number, max: number, k = 26) => Array.from({ length: min + Math.floor(r() * (max - min + 1)) }, () => LETTERS[Math.floor(r() * k)]).join("");
const words = (r: () => number, n: number, min = 1, max = 8, k = 26) => Array.from({ length: n }, () => word(r, min, max, k));
const shuffle = <T,>(r: () => number, a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const tok = (input: string) => input.trim().split(/\s+/);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const matrixInput = (rows: number[][]) => `${rows.length} ${rows[0].length}\n${rows.map((r) => r.join(" ")).join("\n")}\n`;
const squareInput = (rows: number[][]) => `${rows.length}\n${rows.map((r) => r.join(" ")).join("\n")}\n`;
const gridInput = (rows: string[]) => `${rows.length} ${rows[0].length}\n${rows.join("\n")}\n`;
const MOD = 1_000_000_007;
const randGraph = (r: () => number, n: number, m: number, weighted: boolean, maxW = 1000) => {
  const edges: number[][] = [];
  for (let i = 0; i < m; i++) { const u = 1 + Math.floor(r() * n), v = 1 + Math.floor(r() * n); edges.push(weighted ? [u, v, 1 + Math.floor(r() * maxW)] : [u, v]); }
  return edges;
};
const graphInput = (n: number, edges: number[][]) => `${n} ${edges.length}\n${edges.map((e) => e.join(" ")).join("\n")}${edges.length ? "\n" : ""}`;

const EXTRA_BANK: StarterProblem[] = [
  // ───────── EASY ─────────
  {
    family: "reverse-words", title: "Reverse the Words", difficulty: "EASY", topic: "strings", expectedMinutes: 10,
    statement: "A line contains words separated by single spaces. Print the words in reverse order, separated by single spaces.",
    inputFormat: "A single line of words.", outputFormat: "The words in reverse order.", constraints: "1 ≤ number of words ≤ 50000\nEach word has 1–10 lowercase letters",
    reference: "import sys\nwords = sys.stdin.readline().split()\nprint(' '.join(reversed(words)))\n",
    solve: (i) => tok(i).reverse().join(" "),
    samples: ["coding is fun\n", "hello\n"],
    hidden: (() => { const r = rng(101); return ["a b\n", "one two three four\n", ...[5, 40, 300, 2000, 20000, 50000].map((n) => `${words(r, n).join(" ")}\n`)]; })(),
  },
  {
    family: "palindrome-string", title: "Palindrome Check", difficulty: "EASY", topic: "strings", expectedMinutes: 9,
    statement: "Given a string of lowercase letters, print YES if it reads the same forwards and backwards, otherwise print NO.",
    inputFormat: "A single string.", outputFormat: "YES or NO.", constraints: "1 ≤ length ≤ 200000",
    reference: "import sys\ns = sys.stdin.readline().strip()\nprint('YES' if s == s[::-1] else 'NO')\n",
    solve: (i) => { const s = i.trim(); return s === [...s].reverse().join("") ? "YES" : "NO"; },
    samples: ["racecar\n", "coding\n"],
    hidden: (() => { const r = rng(102); const pal = (n: number) => { const h = word(r, n, n); return h + [...h].reverse().join(""); }; return ["a\n", "ab\n", "aa\n", `${pal(50)}\n`, `${pal(50)}x\n`, `${pal(40000)}\n`, `${word(r, 80000, 80000, 2)}\n`, `${pal(30000)}q${[...pal(30000)].join("")}\n`]; })(),
  },
  {
    family: "digit-sum", title: "Sum of Digits", difficulty: "EASY", topic: "strings", expectedMinutes: 9,
    statement: "You are given a non-negative integer that may have up to 100000 digits. Print the sum of its digits.",
    inputFormat: "A single non-negative integer.", outputFormat: "A single integer.", constraints: "1 ≤ number of digits ≤ 100000",
    reference: "import sys\nprint(sum(int(c) for c in sys.stdin.readline().strip()))\n",
    solve: (i) => String([...i.trim()].reduce((s, c) => s + Number(c), 0)),
    samples: ["12345\n", "0\n"],
    hidden: (() => { const r = rng(103); const num = (n: number) => String(1 + Math.floor(r() * 9)) + Array.from({ length: n - 1 }, () => Math.floor(r() * 10)).join(""); return ["9\n", "1000000\n", `${num(20)}\n`, `${num(500)}\n`, `${num(10000)}\n`, `${"9".repeat(100000)}\n`, `${num(99999)}\n`, "10101010101\n"]; })(),
  },
  {
    family: "multiples-three-five", title: "Multiples of 3 or 5", difficulty: "EASY", topic: "math", expectedMinutes: 11,
    statement: "Print how many integers from 1 to n (inclusive) are divisible by 3 or by 5. A loop up to n is too slow for the largest tests.",
    inputFormat: "A single integer n.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 10^12",
    reference: "n = int(input())\nprint(n // 3 + n // 5 - n // 15)\n",
    solve: (i) => { const n = Number(i.trim()); return String(Math.floor(n / 3) + Math.floor(n / 5) - Math.floor(n / 15)); },
    samples: ["10\n", "2\n"],
    hidden: ["1\n", "3\n", "15\n", "100\n", "999999\n", "123456789\n", "999999999999\n", "1000000000000\n"],
  },
  {
    family: "range-of-values", title: "Range of the Values", difficulty: "EASY", topic: "arrays", expectedMinutes: 9,
    statement: "Given n integers, print the difference between the largest and the smallest value.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nprint(max(a) - min(a))\n",
    solve: (i) => { const [n, ...a] = nums(i); const b = a.slice(0, n); return String(Math.max(...b) - Math.min(...b)); },
    samples: ["5\n3 9 -2 7 4\n", "1\n42\n"],
    hidden: (() => { const r = rng(105); return ["2\n5 5\n", "3\n-1000000000 0 1000000000\n", arrInput(ints(r, 10, -50, 50)), arrInput(ints(r, 1000, -1e9, 1e9)), arrInput(ints(r, 50000, 0, 9)), arrInput(ints(r, 90000, -1e6, 1e6)), arrInput(ints(r, 7, -3, -1)), arrInput(ints(r, 300, 1e8, 1e9))]; })(),
  },
  {
    family: "count-target", title: "Count the Target", difficulty: "EASY", topic: "arrays", expectedMinutes: 9,
    statement: "Given n integers and a target x, print how many of the integers are equal to x.",
    inputFormat: "The first line contains n and x. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i], x ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn, x = int(d[0]), int(d[1])\nprint(sum(1 for v in d[2:2 + n] if int(v) == x))\n",
    solve: (i) => { const [n, x, ...a] = nums(i); return String(a.slice(0, n).filter((v) => v === x).length); },
    samples: ["6 2\n1 2 3 2 2 5\n", "3 7\n1 2 3\n"],
    hidden: (() => { const r = rng(106); const c = (n: number, lo: number, hi: number) => { const a = ints(r, n, lo, hi); return `${n} ${a[Math.floor(r() * n)]}\n${a.join(" ")}\n`; }; return ["1 5\n5\n", "4 -1\n-1 -1 -1 -1\n", c(20, 0, 5), c(1000, -10, 10), c(50000, 1, 3), c(80000, -1e9, 1e9), "5 0\n1 2 3 4 5\n", c(30000, 0, 0)]; })(),
  },
  {
    family: "prefix-sums", title: "Running Totals", difficulty: "EASY", topic: "arrays", expectedMinutes: 10,
    statement: "Given n integers, print the running total after each element: the i-th output is the sum of the first i elements.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "n space-separated integers.", constraints: "1 ≤ n ≤ 20000\n-10^5 ≤ a[i] ≤ 10^5",
    reference: "import sys\nfrom itertools import accumulate\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(' '.join(map(str, accumulate(map(int, d[1:1 + n])))))\n",
    solve: (i) => { const [n, ...a] = nums(i); let s = 0; return a.slice(0, n).map((x) => (s += x)).join(" "); },
    samples: ["4\n1 2 3 4\n", "3\n5 -5 5\n"],
    hidden: (() => { const r = rng(107); return ["1\n-7\n", "2\n0 0\n", arrInput(ints(r, 30, -10, 10)), arrInput(ints(r, 1000, -1e5, 1e5)), arrInput(ints(r, 20000, -1e5, 1e5)), arrInput(ints(r, 15000, 0, 1e5)), arrInput(ints(r, 500, -3, 3)), arrInput(ints(r, 8000, -1e5, -1))]; })(),
  },
  {
    family: "capitalize-words", title: "Capitalise Each Word", difficulty: "EASY", topic: "strings", expectedMinutes: 9,
    statement: "A line contains lowercase words separated by single spaces. Print the line with the first letter of every word in upper case.",
    inputFormat: "A single line.", outputFormat: "The capitalised line.", constraints: "1 ≤ number of words ≤ 50000",
    reference: "import sys\nprint(' '.join(w[0].upper() + w[1:] for w in sys.stdin.readline().split()))\n",
    solve: (i) => tok(i).map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
    samples: ["hello world\n", "a quick test\n"],
    hidden: (() => { const r = rng(108); return ["x\n", "already done here\n", ...[6, 50, 400, 3000, 25000, 50000].map((n) => `${words(r, n).join(" ")}\n`)]; })(),
  },
  {
    family: "leap-years", title: "Leap Years in a Range", difficulty: "EASY", topic: "math", expectedMinutes: 12,
    statement: "A year is a leap year if it is divisible by 4, except years divisible by 100 that are not divisible by 400. Print how many leap years lie between a and b inclusive. A loop is too slow for the largest tests.",
    inputFormat: "Two integers a and b.", outputFormat: "A single integer.", constraints: "1 ≤ a ≤ b ≤ 10^9",
    reference: "a, b = map(int, input().split())\nf = lambda y: y // 4 - y // 100 + y // 400\nprint(f(b) - f(a - 1))\n",
    solve: (i) => { const [a, b] = nums(i); const f = (y: number) => Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400); return String(f(b) - f(a - 1)); },
    samples: ["2000 2024\n", "2001 2003\n"],
    hidden: ["1 1\n", "4 4\n", "1900 1900\n", "2000 2000\n", "1 400\n", "1 1000000000\n", "123456 987654321\n", "999999000 1000000000\n"],
  },
  {
    family: "gcd-of-array", title: "Greatest Common Divisor", difficulty: "EASY", topic: "math", expectedMinutes: 11,
    statement: "Given n positive integers, print their greatest common divisor.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n1 ≤ a[i] ≤ 10^9",
    reference: "import sys\nfrom math import gcd\nfrom functools import reduce\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(reduce(gcd, map(int, d[1:1 + n])))\n",
    solve: (i) => { const [n, ...a] = nums(i); return String(a.slice(0, n).reduce((g, x) => gcd(g, x))); },
    samples: ["3\n12 18 24\n", "2\n7 13\n"],
    hidden: (() => { const r = rng(109); const mult = (n: number, g: number, hi: number) => arrInput(ints(r, n, 1, hi).map((x) => x * g)); return ["1\n999999937\n", "2\n1000000000 500000000\n", mult(10, 6, 1000), mult(1000, 37, 20000), mult(50000, 1, 1e9), mult(80000, 1024, 900000), mult(5, 999983, 1000), arrInput(ints(r, 60000, 2, 2))]; })(),
  },
  {
    family: "distinct-values", title: "Count Distinct Values", difficulty: "EASY", topic: "hashing", expectedMinutes: 10,
    statement: "Given n integers, print how many different values appear.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(len(set(d[1:1 + n])))\n",
    solve: (i) => { const [n, ...a] = nums(i); return String(new Set(a.slice(0, n)).size); },
    samples: ["6\n1 2 2 3 3 3\n", "3\n5 5 5\n"],
    hidden: (() => { const r = rng(110); return ["1\n0\n", "4\n-1 1 -1 1\n", arrInput(ints(r, 50, 1, 10)), arrInput(ints(r, 2000, -1e9, 1e9)), arrInput(ints(r, 80000, 1, 1000)), arrInput(ints(r, 100000, -1e9, 1e9)), arrInput(Array.from({ length: 30000 }, (_, k) => k)), arrInput(ints(r, 9, 4, 4))]; })(),
  },
  {
    family: "alternating-sum", title: "Alternating Sum", difficulty: "EASY", topic: "arrays", expectedMinutes: 10,
    statement: "Given n integers, add the numbers in odd positions (1st, 3rd, 5th, …) and subtract the numbers in even positions (2nd, 4th, …). Print the result.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^6 ≤ a[i] ≤ 10^6",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nprint(sum(a[0::2]) - sum(a[1::2]))\n",
    solve: (i) => { const [n, ...a] = nums(i); return String(a.slice(0, n).reduce((s, x, k) => s + (k % 2 ? -x : x), 0)); },
    samples: ["5\n1 2 3 4 5\n", "2\n10 30\n"],
    hidden: (() => { const r = rng(111); return ["1\n-4\n", "4\n1 1 1 1\n", arrInput(ints(r, 25, -100, 100)), arrInput(ints(r, 3000, -1e6, 1e6)), arrInput(ints(r, 90000, -1e6, 1e6)), arrInput(ints(r, 40001, 0, 1e6)), arrInput(ints(r, 12, -1e6, -1e6)), arrInput(ints(r, 777, -5, 5))]; })(),
  },
  {
    family: "anagram-check", title: "Anagram Check", difficulty: "EASY", topic: "strings", expectedMinutes: 11,
    statement: "Two words are anagrams if one is a rearrangement of the other's letters. Given two lowercase words, print YES if they are anagrams, otherwise NO.",
    inputFormat: "Two lines, one word each.", outputFormat: "YES or NO.", constraints: "1 ≤ length ≤ 100000",
    reference: "import sys\na = sys.stdin.readline().strip()\nb = sys.stdin.readline().strip()\nprint('YES' if sorted(a) == sorted(b) else 'NO')\n",
    solve: (i) => { const [a, b] = i.split("\n").map((s) => s.trim()); return [...a].sort().join("") === [...b].sort().join("") ? "YES" : "NO"; },
    samples: ["listen\nsilent\n", "apple\npaple\n"],
    hidden: (() => { const r = rng(112); const pair = (n: number, same: boolean) => { const a = word(r, n, n); let b = shuffle(r, [...a]).join(""); if (!same) b = (b[0] === "z" ? "y" : "z") + b.slice(1); return `${a}\n${b}\n`; }; return ["a\na\n", "ab\nabc\n", pair(10, true), pair(10, false), pair(5000, true), pair(60000, false), pair(100000, true), "aab\nabb\n"]; })(),
  },
  {
    family: "count-set-bits", title: "Count the 1 Bits", difficulty: "EASY", topic: "bit manipulation", expectedMinutes: 10,
    statement: "Print how many 1s appear in the binary representation of n.",
    inputFormat: "A single integer n.", outputFormat: "A single integer.", constraints: "0 ≤ n ≤ 10^18",
    reference: "print(bin(int(input())).count('1'))\n",
    solve: (i) => String([...BigInt(i.trim()).toString(2)].filter((c) => c === "1").length),
    samples: ["13\n", "0\n"],
    hidden: ["1\n", "255\n", "1024\n", "1000000007\n", "4294967295\n", "123456789012345678\n", "1000000000000000000\n", "576460752303423487\n"],
  },
  {
    family: "diagonal-sum", title: "Diagonal Sum", difficulty: "EASY", topic: "matrices", expectedMinutes: 12,
    statement: "Given an n × n matrix, print the sum of the numbers on both diagonals. When n is odd, the centre cell is counted once.",
    inputFormat: "The first line contains n. Each of the next n lines contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 300\n-1000 ≤ value ≤ 1000",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nm = list(map(int, d[1:1 + n * n]))\ns = 0\nfor i in range(n):\n    s += m[i * n + i]\n    if n - 1 - i != i:\n        s += m[i * n + n - 1 - i]\nprint(s)\n",
    solve: (i) => { const [n, ...m] = nums(i); let s = 0; for (let k = 0; k < n; k++) { s += m[k * n + k]; if (n - 1 - k !== k) s += m[k * n + n - 1 - k]; } return String(s); },
    samples: ["3\n1 2 3\n4 5 6\n7 8 9\n", "2\n1 2\n3 4\n"],
    hidden: (() => { const r = rng(113); const sq = (n: number) => squareInput(Array.from({ length: n }, () => ints(r, n, -1000, 1000))); return ["1\n-5\n", sq(4), sq(5), sq(31), sq(100), sq(299), sq(300), squareInput(Array.from({ length: 7 }, () => ints(r, 7, 1000, 1000)))]; })(),
  },
  {
    family: "longest-word-length", title: "Longest Word", difficulty: "EASY", topic: "strings", expectedMinutes: 9,
    statement: "A line contains words separated by spaces. Print the length of the longest word.",
    inputFormat: "A single line.", outputFormat: "A single integer.", constraints: "1 ≤ number of words ≤ 50000\n1 ≤ word length ≤ 30",
    reference: "import sys\nprint(max(len(w) for w in sys.stdin.readline().split()))\n",
    solve: (i) => String(Math.max(...tok(i).map((w) => w.length))),
    samples: ["the quick brown fox\n", "a\n"],
    hidden: (() => { const r = rng(114); return ["ab cd ef\n", "programming is great\n", ...[5, 80, 700, 5000, 30000, 50000].map((n) => `${words(r, n, 1, 30).join(" ")}\n`)]; })(),
  },
  {
    family: "majority-element", title: "Majority Element", difficulty: "EASY", topic: "arrays", expectedMinutes: 13,
    statement: "In a list of n integers one value appears more than n/2 times. Print that value.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9\nA majority value always exists",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\ncand, count = None, 0\nfor x in d[1:1 + n]:\n    if count == 0:\n        cand = x\n    count += 1 if x == cand else -1\nprint(cand)\n",
    solve: (i) => { const [n, ...a] = nums(i); const c = new Map<number, number>(); for (const x of a.slice(0, n)) c.set(x, (c.get(x) ?? 0) + 1); for (const [v, k] of c) if (k * 2 > n) return String(v); return ""; },
    samples: ["5\n3 1 3 3 2\n", "1\n9\n"],
    hidden: (() => { const r = rng(115); const maj = (n: number) => { const v = Math.floor(r() * 2e9) - 1e9; const k = Math.floor(n / 2) + 1; return arrInput(shuffle(r, [...Array(k).fill(v), ...ints(r, n - k, -1e9, 1e9).map((x) => (x === v ? x + 1 : x))])); }; return ["2\n4 4\n", "3\n-1 5 -1\n", maj(9), maj(100), maj(5001), maj(60000), maj(99999), maj(100000)]; })(),
  },

  // ───────── MEDIUM ─────────
  {
    family: "two-sum-pair", title: "Pair With Target Sum", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 20,
    statement: "Find positions i < j (1-based) with a[i] + a[j] = t. If several pairs exist, choose the one with the smallest j, and for that j the smallest i. Print i and j, or -1 if there is no such pair.",
    inputFormat: "The first line contains n and t. The second line contains n integers.", outputFormat: "Two integers i j, or -1.", constraints: "2 ≤ n ≤ 100000\n-10^9 ≤ a[i], t ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn, t = int(d[0]), int(d[1])\nfirst = {}\nfor j in range(n):\n    x = int(d[2 + j])\n    if t - x in first:\n        print(first[t - x] + 1, j + 1)\n        break\n    if x not in first:\n        first[x] = j\nelse:\n    print(-1)\n",
    solve: (i) => { const [n, t, ...a] = nums(i); const first = new Map<number, number>(); for (let j = 0; j < n; j++) { const x = a[j]; if (first.has(t - x)) return `${first.get(t - x)! + 1} ${j + 1}`; if (!first.has(x)) first.set(x, j); } return "-1"; },
    samples: ["5 9\n2 7 11 15 1\n", "3 100\n1 2 3\n"],
    hidden: (() => { const r = rng(201); const c = (n: number, lo: number, hi: number, tgt?: number) => { const a = ints(r, n, lo, hi); return `${n} ${tgt ?? a[Math.floor(r() * n)] + a[Math.floor(r() * n)]}\n${a.join(" ")}\n`; }; return ["2 0\n0 0\n", "4 6\n3 3 3 3\n", c(30, -20, 20), c(2000, -1e6, 1e6), c(100000, 1, 1e9, 1), c(100000, -1e9, 1e9), c(50000, 0, 100), "6 -3\n-1 -2 5 -1 0 -3\n"]; })(),
  },
  {
    family: "rotate-right", title: "Rotate the Array", difficulty: "MEDIUM", topic: "arrays", expectedMinutes: 18,
    statement: "Rotate an array of n integers to the right by k positions and print it. k can be larger than n.",
    inputFormat: "The first line contains n and k. The second line contains n integers.", outputFormat: "n space-separated integers.", constraints: "1 ≤ n ≤ 100000\n0 ≤ k ≤ 10^18",
    reference: "import sys\nd = sys.stdin.read().split()\nn, k = int(d[0]), int(d[1])\na = d[2:2 + n]\nk %= n\nprint(' '.join(a[n - k:] + a[:n - k]))\n",
    solve: (i) => { const t = tok(i); const n = Number(t[0]); const k = Number(BigInt(t[1]) % BigInt(n)); const a = t.slice(2, 2 + n); return [...a.slice(n - k), ...a.slice(0, n - k)].join(" "); },
    samples: ["5 2\n1 2 3 4 5\n", "3 3\n7 8 9\n"],
    hidden: (() => { const r = rng(202); const c = (n: number, k: string) => `${n} ${k}\n${ints(r, n, -1e9, 1e9).join(" ")}\n`; return ["1 1000000000000000000\n5\n", c(4, "0"), c(10, "13"), c(1000, "999"), c(50000, "123456789012"), c(100000, "1000000000000000000"), c(77777, "77776"), c(2, "1")]; })(),
  },
  {
    family: "merge-intervals", title: "Merge Intervals", difficulty: "MEDIUM", topic: "sorting", expectedMinutes: 24,
    statement: "Given n closed intervals [l, r], merge every group of intervals that overlap or touch (an interval starting at or before another's end joins it). Print the number of merged intervals, then each one as \"l r\" in increasing order.",
    inputFormat: "The first line contains n. Each of the next n lines contains l and r.", outputFormat: "The count, then one interval per line.", constraints: "1 ≤ n ≤ 50000\n0 ≤ l ≤ r ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\niv = sorted((int(d[1 + 2 * i]), int(d[2 + 2 * i])) for i in range(n))\nout = []\nfor l, r in iv:\n    if out and l <= out[-1][1]:\n        out[-1][1] = max(out[-1][1], r)\n    else:\n        out.append([l, r])\nprint(len(out))\nprint('\\n'.join(str(l) + ' ' + str(r) for l, r in out))\n",
    solve: (i) => { const [n, ...v] = nums(i); const iv = Array.from({ length: n }, (_, k) => [v[2 * k], v[2 * k + 1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const out: number[][] = []; for (const [l, r] of iv) { if (out.length && l <= out[out.length - 1][1]) out[out.length - 1][1] = Math.max(out[out.length - 1][1], r); else out.push([l, r]); } return `${out.length}\n${out.map(([l, r]) => `${l} ${r}`).join("\n")}`; },
    samples: ["4\n1 3\n2 6\n8 10\n10 12\n", "2\n5 5\n1 2\n"],
    hidden: (() => { const r = rng(203); const c = (n: number, span: number, len: number) => `${n}\n${Array.from({ length: n }, () => { const l = Math.floor(r() * span); return `${l} ${l + Math.floor(r() * len)}`; }).join("\n")}\n`; return ["1\n0 0\n", "3\n1 2\n3 4\n5 6\n", c(10, 50, 5), c(500, 10000, 30), c(5000, 1e9, 1e5), c(50000, 1e6, 40), c(50000, 1e9, 1e3), c(2000, 100, 100)]; })(),
  },
  {
    family: "top-k-frequent", title: "Top K Frequent Values", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 22,
    statement: "Print the k distinct values that occur most often, ordered by frequency (highest first); values with equal frequency are ordered from smallest to largest.",
    inputFormat: "The first line contains n and k. The second line contains n integers.", outputFormat: "k space-separated integers.", constraints: "1 ≤ n ≤ 100000\n1 ≤ k ≤ number of distinct values\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nfrom collections import Counter\nd = sys.stdin.read().split()\nn, k = int(d[0]), int(d[1])\nc = Counter(map(int, d[2:2 + n]))\nres = sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))[:k]\nprint(' '.join(str(v) for v, _ in res))\n",
    solve: (i) => { const [n, k, ...a] = nums(i); const c = new Map<number, number>(); for (const x of a.slice(0, n)) c.set(x, (c.get(x) ?? 0) + 1); return [...c].sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, k).map(([v]) => v).join(" "); },
    samples: ["7 2\n1 1 1 2 2 3 3\n", "3 3\n9 8 7\n"],
    hidden: (() => { const r = rng(204); const c = (n: number, lo: number, hi: number, kk: number) => { const a = ints(r, n, lo, hi); return `${n} ${Math.min(kk, new Set(a).size)}\n${a.join(" ")}\n`; }; return ["1 1\n-5\n", "4 1\n2 1 2 1\n", c(30, 1, 6, 3), c(2000, -50, 50, 10), c(100000, 1, 1000, 25), c(100000, -1e9, 1e9, 5), c(60000, 0, 3, 4), c(500, 1, 500, 100)]; })(),
  },
  {
    family: "count-primes", title: "Count the Primes", difficulty: "MEDIUM", topic: "math", expectedMinutes: 21,
    statement: "Print how many prime numbers are less than or equal to n. Testing each number one by one is too slow for the largest tests.",
    inputFormat: "A single integer n.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 2000000",
    reference: "n = int(input())\nif n < 2:\n    print(0)\nelse:\n    s = bytearray([1]) * (n + 1)\n    s[0] = s[1] = 0\n    for i in range(2, int(n ** 0.5) + 1):\n        if s[i]:\n            s[i * i::i] = bytearray(len(range(i * i, n + 1, i)))\n    print(sum(s))\n",
    solve: (i) => { const n = Number(i.trim()); if (n < 2) return "0"; const s = new Uint8Array(n + 1).fill(1); s[0] = s[1] = 0; for (let p = 2; p * p <= n; p++) if (s[p]) for (let q = p * p; q <= n; q += p) s[q] = 0; let c = 0; for (let k = 0; k <= n; k++) c += s[k]; return String(c); },
    samples: ["10\n", "1\n"],
    hidden: ["2\n", "3\n", "100\n", "1000\n", "65536\n", "999983\n", "1000000\n", "2000000\n"],
  },
  {
    family: "max-nesting-depth", title: "Maximum Nesting Depth", difficulty: "MEDIUM", topic: "stacks", expectedMinutes: 18,
    statement: "A balanced string of parentheses is given. Print the maximum nesting depth, i.e. the largest number of brackets open at the same time.",
    inputFormat: "A single line of ( and ) characters.", outputFormat: "A single integer.", constraints: "2 ≤ length ≤ 200000\nThe string is balanced",
    reference: "import sys\ns = sys.stdin.readline().strip()\nd = best = 0\nfor ch in s:\n    d += 1 if ch == '(' else -1\n    best = max(best, d)\nprint(best)\n",
    solve: (i) => { let d = 0, b = 0; for (const ch of i.trim()) { d += ch === "(" ? 1 : -1; b = Math.max(b, d); } return String(b); },
    samples: ["(()(()))\n", "()()\n"],
    hidden: (() => { const r = rng(206); const bal = (n: number) => { let out = "", open = 0; for (let k = 0; k < n; k++) { if (open && r() < 0.5) { out += ")"; open--; } else { out += "("; open++; } } return out + ")".repeat(open); }; return ["()\n", `${"(".repeat(100000)}${")".repeat(100000)}\n`, `${bal(20)}\n`, `${bal(500)}\n`, `${bal(50000)}\n`, `${"()".repeat(60000)}\n`, `${bal(150000)}\n`, `(${"()".repeat(500)})\n`]; })(),
  },
  {
    family: "first-occurrence", title: "First Occurrence Queries", difficulty: "MEDIUM", topic: "binary search", expectedMinutes: 22,
    statement: "A non-decreasing array of n integers is followed by q queries. For each query x, print the 1-based position of the first occurrence of x, or -1 if x is absent.",
    inputFormat: "n, then n sorted integers, then q, then q integers.", outputFormat: "q lines.", constraints: "1 ≤ n, q ≤ 100000\n-10^9 ≤ values ≤ 10^9",
    reference: "import sys\nfrom bisect import bisect_left\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nq = int(d[1 + n])\nout = []\nfor x in map(int, d[2 + n:2 + n + q]):\n    i = bisect_left(a, x)\n    out.append(str(i + 1) if i < n and a[i] == x else '-1')\nprint('\\n'.join(out))\n",
    solve: (i) => { const v = nums(i); const n = v[0]; const a = v.slice(1, 1 + n); const q = v[1 + n]; const out: string[] = []; for (const x of v.slice(2 + n, 2 + n + q)) { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; } out.push(lo < n && a[lo] === x ? String(lo + 1) : "-1"); } return out.join("\n"); },
    samples: ["6\n1 2 2 2 5 9\n3\n2 5 3\n", "1\n7\n2\n7 8\n"],
    hidden: (() => { const r = rng(207); const c = (n: number, lo: number, hi: number, q: number) => { const a = ints(r, n, lo, hi).sort((x, y) => x - y); return `${n}\n${a.join(" ")}\n${q}\n${ints(r, q, lo - 2, hi + 2).join(" ")}\n`; }; return ["3\n4 4 4\n2\n4 3\n", c(10, 0, 20, 10), c(1000, -100, 100, 1000), c(100000, -1e9, 1e9, 100000), c(100000, 1, 50, 50000), c(5000, 0, 5000, 20000), c(2, 1, 2, 5), c(60000, -1000, 1000, 80000)]; })(),
  },
  {
    family: "spiral-order", title: "Spiral Order", difficulty: "MEDIUM", topic: "matrices", expectedMinutes: 24,
    statement: "Print the elements of an r × c matrix in clockwise spiral order, starting from the top-left corner.",
    inputFormat: "The first line contains r and c. Each of the next r lines contains c integers.", outputFormat: "r·c space-separated integers.", constraints: "1 ≤ r, c ≤ 300",
    reference: "import sys\nd = sys.stdin.read().split()\nr, c = int(d[0]), int(d[1])\nm = [d[2 + i * c:2 + (i + 1) * c] for i in range(r)]\ntop, bottom, left, right = 0, r - 1, 0, c - 1\nout = []\nwhile top <= bottom and left <= right:\n    for j in range(left, right + 1):\n        out.append(m[top][j])\n    for i in range(top + 1, bottom + 1):\n        out.append(m[i][right])\n    if top < bottom:\n        for j in range(right - 1, left - 1, -1):\n            out.append(m[bottom][j])\n    if left < right:\n        for i in range(bottom - 1, top, -1):\n            out.append(m[i][left])\n    top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1\nprint(' '.join(out))\n",
    solve: (i) => { const t = tok(i); const r = Number(t[0]), c = Number(t[1]); const m = Array.from({ length: r }, (_, k) => t.slice(2 + k * c, 2 + (k + 1) * c)); let top = 0, bottom = r - 1, left = 0, right = c - 1; const out: string[] = []; while (top <= bottom && left <= right) { for (let j = left; j <= right; j++) out.push(m[top][j]); for (let k = top + 1; k <= bottom; k++) out.push(m[k][right]); if (top < bottom) for (let j = right - 1; j >= left; j--) out.push(m[bottom][j]); if (left < right) for (let k = bottom - 1; k > top; k--) out.push(m[k][left]); top++; bottom--; left++; right--; } return out.join(" "); },
    samples: ["3 3\n1 2 3\n4 5 6\n7 8 9\n", "2 4\n1 2 3 4\n5 6 7 8\n"],
    hidden: (() => { const r = rng(208); const mx = (a: number, b: number) => matrixInput(Array.from({ length: a }, () => ints(r, b, -99, 99))); return ["1 1\n5\n", mx(1, 6), mx(6, 1), mx(4, 5), mx(37, 23), mx(300, 300), mx(2, 299), mx(150, 7)]; })(),
  },
  {
    family: "anagram-groups", title: "Anagram Groups", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 19,
    statement: "Given n lowercase words, words that are anagrams of each other form one group. Print the number of groups.",
    inputFormat: "The first line contains n. The next line contains n words separated by spaces.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 50000\n1 ≤ word length ≤ 10",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nprint(len(set(''.join(sorted(w)) for w in d[1:1 + n])))\n",
    solve: (i) => { const t = tok(i); const n = Number(t[0]); return String(new Set(t.slice(1, 1 + n).map((w) => [...w].sort().join(""))).size); },
    samples: ["6\neat tea tan ate nat bat\n", "2\nab ba\n"],
    hidden: (() => { const r = rng(209); const c = (n: number, k: number, max: number) => `${n}\n${words(r, n, 1, max, k).join(" ")}\n`; return ["1\nz\n", "3\nabc bca cab\n", c(20, 3, 3), c(1000, 4, 4), c(50000, 26, 10), c(50000, 2, 6), c(30000, 5, 3), c(800, 26, 1)]; })(),
  },
  {
    family: "subarray-sum-k", title: "Subarrays With Sum K", difficulty: "MEDIUM", topic: "prefix sums", expectedMinutes: 26,
    statement: "Print the number of contiguous subarrays whose elements add up to exactly k. An O(n²) solution will not pass the largest tests.",
    inputFormat: "The first line contains n and k. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-1000 ≤ a[i] ≤ 1000\n-10^9 ≤ k ≤ 10^9",
    reference: "import sys\nfrom collections import defaultdict\nd = sys.stdin.read().split()\nn, k = int(d[0]), int(d[1])\nseen = defaultdict(int)\nseen[0] = 1\ns = total = 0\nfor x in map(int, d[2:2 + n]):\n    s += x\n    total += seen[s - k]\n    seen[s] += 1\nprint(total)\n",
    solve: (i) => { const [n, k, ...a] = nums(i); const seen = new Map<number, number>([[0, 1]]); let s = 0, total = 0; for (const x of a.slice(0, n)) { s += x; total += seen.get(s - k) ?? 0; seen.set(s, (seen.get(s) ?? 0) + 1); } return String(total); },
    samples: ["5 3\n1 2 1 2 1\n", "3 0\n0 0 0\n"],
    hidden: (() => { const r = rng(210); const c = (n: number, lo: number, hi: number, k: number) => `${n} ${k}\n${ints(r, n, lo, hi).join(" ")}\n`; return ["1 5\n5\n", "4 100\n1 2 3 4\n", c(50, -3, 3, 0), c(2000, -10, 10, 5), c(100000, -1000, 1000, 77), c(100000, 0, 0, 0), c(60000, 1, 3, 30), c(90000, -1, 1, -2)]; })(),
  },
  {
    family: "stock-profit", title: "Best Time to Buy and Sell", difficulty: "MEDIUM", topic: "greedy", expectedMinutes: 19,
    statement: "prices[i] is a share price on day i. Buy on one day and sell on a later day to make the largest profit. Print that profit, or 0 if no profit is possible.",
    inputFormat: "The first line contains n. The second line contains n prices.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n1 ≤ price ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nlow = None\nbest = 0\nfor p in map(int, d[1:1 + n]):\n    if low is None or p < low:\n        low = p\n    best = max(best, p - low)\nprint(best)\n",
    solve: (i) => { const [n, ...a] = nums(i); let low = Infinity, best = 0; for (const p of a.slice(0, n)) { low = Math.min(low, p); best = Math.max(best, p - low); } return String(best); },
    samples: ["6\n7 1 5 3 6 4\n", "4\n9 7 4 1\n"],
    hidden: (() => { const r = rng(211); return ["1\n5\n", "2\n1 1000000000\n", arrInput(ints(r, 20, 1, 50)), arrInput(ints(r, 3000, 1, 1e9)), arrInput(ints(r, 100000, 1, 1e9)), arrInput(Array.from({ length: 80000 }, (_, k) => 100000 - k)), arrInput(Array.from({ length: 80000 }, (_, k) => k + 1)), arrInput(ints(r, 50000, 1, 10))]; })(),
  },
  {
    family: "most-frequent-word", title: "Most Frequent Word", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 20,
    statement: "A line contains lowercase words separated by spaces. Print the word that appears most often and its count. If several words tie, print the alphabetically smallest.",
    inputFormat: "A single line of words.", outputFormat: "The word and its count, separated by a space.", constraints: "1 ≤ number of words ≤ 100000",
    reference: "import sys\nfrom collections import Counter\nc = Counter(sys.stdin.readline().split())\nw = min(c, key=lambda x: (-c[x], x))\nprint(w, c[w])\n",
    solve: (i) => { const c = new Map<string, number>(); for (const w of tok(i)) c.set(w, (c.get(w) ?? 0) + 1); let best = "", n = -1; for (const [w, k] of c) if (k > n || (k === n && w < best)) { best = w; n = k; } return `${best} ${n}`; },
    samples: ["to be or not to be\n", "b a\n"],
    hidden: (() => { const r = rng(212); return ["solo\n", "x y x y\n", ...[30, 500, 8000, 50000, 100000].map((n) => `${words(r, n, 1, 3, 4).join(" ")}\n`), `${words(r, 20000, 5, 8).join(" ")}\n`]; })(),
  },
  {
    family: "rotate-matrix", title: "Rotate a Matrix", difficulty: "MEDIUM", topic: "matrices", expectedMinutes: 21,
    statement: "Rotate an n × n matrix 90 degrees clockwise and print it, one row per line.",
    inputFormat: "The first line contains n. Each of the next n lines contains n integers.", outputFormat: "n lines of n integers.", constraints: "1 ≤ n ≤ 300",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nm = [d[1 + i * n:1 + (i + 1) * n] for i in range(n)]\nprint('\\n'.join(' '.join(m[n - 1 - j][i] for j in range(n)) for i in range(n)))\n",
    solve: (i) => { const t = tok(i); const n = Number(t[0]); const m = Array.from({ length: n }, (_, k) => t.slice(1 + k * n, 1 + (k + 1) * n)); return Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, j) => m[n - 1 - j][a]).join(" ")).join("\n"); },
    samples: ["3\n1 2 3\n4 5 6\n7 8 9\n", "1\n4\n"],
    hidden: (() => { const r = rng(213); const sq = (n: number) => squareInput(Array.from({ length: n }, () => ints(r, n, -999, 999))); return ["2\n1 2\n3 4\n", sq(3), sq(4), sq(10), sq(57), sq(200), sq(300), sq(99)]; })(),
  },
  {
    family: "longest-consecutive", title: "Longest Consecutive Run", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 23,
    statement: "Given an unsorted list of integers, print the length of the longest set of values that form consecutive integers (for example 4, 5, 6, 7). Duplicates count once. Sorting is allowed but an O(n) approach exists.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\ns = set(map(int, d[1:1 + n]))\nbest = 0\nfor x in s:\n    if x - 1 not in s:\n        y = x\n        while y + 1 in s:\n            y += 1\n        best = max(best, y - x + 1)\nprint(best)\n",
    solve: (i) => { const [n, ...a] = nums(i); const s = new Set(a.slice(0, n)); let best = 0; for (const x of s) if (!s.has(x - 1)) { let y = x; while (s.has(y + 1)) y++; best = Math.max(best, y - x + 1); } return String(best); },
    samples: ["6\n100 4 200 1 3 2\n", "3\n5 5 5\n"],
    hidden: (() => { const r = rng(214); return ["1\n-3\n", "4\n1 3 5 7\n", arrInput(ints(r, 40, 0, 60)), arrInput(ints(r, 5000, -3000, 3000)), arrInput(shuffle(r, Array.from({ length: 100000 }, (_, k) => k - 50000))), arrInput(ints(r, 100000, -1e9, 1e9)), arrInput(ints(r, 70000, 1, 100000)), arrInput([...shuffle(r, Array.from({ length: 1000 }, (_, k) => k * 2)), 1])]; })(),
  },
  {
    family: "run-length-encoding", title: "Run-Length Encoding", difficulty: "MEDIUM", topic: "strings", expectedMinutes: 18,
    statement: "Compress a string of lowercase letters by replacing each run of equal letters with the letter followed by the run length. For example, aaabcc becomes a3b1c2.",
    inputFormat: "A single string.", outputFormat: "The encoded string.", constraints: "1 ≤ length ≤ 200000",
    reference: "import sys\nfrom itertools import groupby\ns = sys.stdin.readline().strip()\nprint(''.join(ch + str(len(list(g))) for ch, g in groupby(s)))\n",
    solve: (i) => { const s = i.trim(); let out = ""; for (let k = 0; k < s.length; ) { let j = k; while (j < s.length && s[j] === s[k]) j++; out += s[k] + (j - k); k = j; } return out; },
    samples: ["aaabcc\n", "abc\n"],
    hidden: (() => { const r = rng(215); return ["z\n", `${"q".repeat(150000)}\n`, `${word(r, 30, 30, 2)}\n`, `${word(r, 1000, 1000, 3)}\n`, `${word(r, 200000, 200000, 2)}\n`, `${word(r, 100000, 100000, 26)}\n`, "aabbaabb\n", `${"ab".repeat(50000)}\n`]; })(),
  },
  {
    family: "pairs-with-difference", title: "Pairs With a Given Difference", difficulty: "MEDIUM", topic: "hashing", expectedMinutes: 22,
    statement: "Count the pairs of positions i < j whose values differ by exactly k (|a[i] − a[j]| = k).",
    inputFormat: "The first line contains n and k. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n1 ≤ k ≤ 10^9\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nfrom collections import Counter\nd = sys.stdin.read().split()\nn, k = int(d[0]), int(d[1])\nc = Counter(map(int, d[2:2 + n]))\nprint(sum(v * c[x + k] for x, v in c.items() if x + k in c))\n",
    solve: (i) => { const [n, k, ...a] = nums(i); const c = new Map<number, number>(); for (const x of a.slice(0, n)) c.set(x, (c.get(x) ?? 0) + 1); let t = 0; for (const [x, v] of c) t += v * (c.get(x + k) ?? 0); return String(t); },
    samples: ["5 2\n1 5 3 4 2\n", "4 1\n1 1 2 2\n"],
    hidden: (() => { const r = rng(216); const c = (n: number, lo: number, hi: number, k: number) => `${n} ${k}\n${ints(r, n, lo, hi).join(" ")}\n`; return ["1 1\n5\n", "3 10\n1 2 3\n", c(40, 0, 20, 3), c(3000, -500, 500, 7), c(100000, 1, 100, 1), c(100000, -1e9, 1e9, 999), c(60000, 0, 1, 1), c(20000, 0, 1e6, 500000)]; })(),
  },
  {
    family: "next-greater", title: "Next Greater Element", difficulty: "MEDIUM", topic: "stacks", expectedMinutes: 25,
    statement: "For every element, print the first element to its right that is strictly greater, or -1 if there is none. An O(n²) solution will not pass the largest tests.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "n space-separated integers.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nres = [-1] * n\nstack = []\nfor i, x in enumerate(a):\n    while stack and a[stack[-1]] < x:\n        res[stack.pop()] = x\n    stack.append(i)\nprint(' '.join(map(str, res)))\n",
    solve: (i) => { const [n, ...v] = nums(i); const a = v.slice(0, n); const res = new Array(n).fill(-1); const st: number[] = []; a.forEach((x, k) => { while (st.length && a[st[st.length - 1]] < x) res[st.pop()!] = x; st.push(k); }); return res.join(" "); },
    samples: ["5\n4 5 2 25 10\n", "3\n3 2 1\n"],
    hidden: (() => { const r = rng(217); return ["1\n7\n", "4\n1 1 1 2\n", arrInput(ints(r, 30, 1, 20)), arrInput(ints(r, 4000, -1e9, 1e9)), arrInput(ints(r, 100000, -1e9, 1e9)), arrInput(Array.from({ length: 100000 }, (_, k) => 100000 - k)), arrInput(Array.from({ length: 100000 }, (_, k) => k)), arrInput(ints(r, 70000, 1, 3))]; })(),
  },

  // ───────── HARD ─────────
  {
    family: "edit-distance", title: "Edit Distance", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 38,
    statement: "Print the minimum number of single-character insertions, deletions and replacements needed to turn the first string into the second.",
    inputFormat: "Two lines, one lowercase string each.", outputFormat: "A single integer.", constraints: "1 ≤ length of each string ≤ 1000",
    reference: "import sys\na = sys.stdin.readline().strip()\nb = sys.stdin.readline().strip()\nprev = list(range(len(b) + 1))\nfor i, ca in enumerate(a, 1):\n    cur = [i] + [0] * len(b)\n    for j, cb in enumerate(b, 1):\n        cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb))\n    prev = cur\nprint(prev[-1])\n",
    solve: (i) => { const [a, b] = i.split("\n").map((s) => s.trim()); let prev = Array.from({ length: b.length + 1 }, (_, k) => k); for (let x = 1; x <= a.length; x++) { const cur = [x]; for (let y = 1; y <= b.length; y++) cur[y] = Math.min(prev[y] + 1, cur[y - 1] + 1, prev[y - 1] + (a[x - 1] !== b[y - 1] ? 1 : 0)); prev = cur; } return String(prev[b.length]); },
    samples: ["kitten\nsitting\n", "abc\nabc\n"],
    hidden: (() => { const r = rng(301); const p = (n: number, m: number, k: number) => `${word(r, n, n, k)}\n${word(r, m, m, k)}\n`; return ["a\nb\n", "a\naaaa\n", p(10, 12, 4), p(100, 80, 26), p(1000, 1000, 4), p(1000, 300, 26), p(800, 1000, 2), "intention\nexecution\n"]; })(),
  },
  {
    family: "lcs-length", title: "Longest Common Subsequence", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 36,
    statement: "Print the length of the longest sequence of characters that appears in both strings in the same order (not necessarily contiguously).",
    inputFormat: "Two lines, one lowercase string each.", outputFormat: "A single integer.", constraints: "1 ≤ length of each string ≤ 1000",
    reference: "import sys\na = sys.stdin.readline().strip()\nb = sys.stdin.readline().strip()\nprev = [0] * (len(b) + 1)\nfor ca in a:\n    cur = [0] * (len(b) + 1)\n    for j, cb in enumerate(b, 1):\n        cur[j] = prev[j - 1] + 1 if ca == cb else max(prev[j], cur[j - 1])\n    prev = cur\nprint(prev[-1])\n",
    solve: (i) => { const [a, b] = i.split("\n").map((s) => s.trim()); let prev = new Array(b.length + 1).fill(0); for (const ca of a) { const cur = new Array(b.length + 1).fill(0); for (let j = 1; j <= b.length; j++) cur[j] = ca === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); prev = cur; } return String(prev[b.length]); },
    samples: ["abcde\nace\n", "abc\ndef\n"],
    hidden: (() => { const r = rng(302); const p = (n: number, m: number, k: number) => `${word(r, n, n, k)}\n${word(r, m, m, k)}\n`; return ["a\na\n", "ab\nba\n", p(15, 15, 3), p(200, 150, 26), p(1000, 1000, 4), p(1000, 1000, 26), p(500, 1000, 2), "programming\ngaming\n"]; })(),
  },
  {
    family: "knapsack-01", title: "0/1 Knapsack", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 37,
    statement: "There are n items with weights w and values v, and a bag of capacity W. Each item can be taken at most once. Print the largest total value that fits in the bag.",
    inputFormat: "The first line contains n and W. Each of the next n lines contains w and v.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100\n1 ≤ W ≤ 10000\n1 ≤ w ≤ 10000, 1 ≤ v ≤ 10^6",
    reference: "import sys\nd = sys.stdin.read().split()\nn, W = int(d[0]), int(d[1])\ndp = [0] * (W + 1)\nfor i in range(n):\n    w, v = int(d[2 + 2 * i]), int(d[3 + 2 * i])\n    for c in range(W, w - 1, -1):\n        if dp[c - w] + v > dp[c]:\n            dp[c] = dp[c - w] + v\nprint(dp[W])\n",
    solve: (i) => { const [n, W, ...x] = nums(i); const dp = new Array(W + 1).fill(0); for (let k = 0; k < n; k++) { const w = x[2 * k], v = x[2 * k + 1]; for (let c = W; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v); } return String(dp[W]); },
    samples: ["3 50\n10 60\n20 100\n30 120\n", "1 5\n6 100\n"],
    hidden: (() => { const r = rng(303); const c = (n: number, W: number, wmax: number) => `${n} ${W}\n${Array.from({ length: n }, () => `${1 + Math.floor(r() * wmax)} ${1 + Math.floor(r() * 1e6)}`).join("\n")}\n`; return ["1 10\n10 7\n", "4 7\n1 1\n3 4\n4 5\n5 7\n", c(10, 50, 20), c(50, 1000, 200), c(100, 10000, 1000), c(100, 10000, 10000), c(100, 5000, 50), c(30, 9999, 9999)]; })(),
  },
  {
    family: "grid-shortest-path", title: "Shortest Path in a Maze", difficulty: "HARD", topic: "graphs", expectedMinutes: 35,
    statement: "A maze has open cells '.', walls '#', a start 'S' and an exit 'E'. Moving up, down, left or right costs one step. Print the minimum number of steps from S to E, or -1 if E cannot be reached.",
    inputFormat: "The first line contains r and c. The next r lines contain the maze.", outputFormat: "A single integer.", constraints: "1 ≤ r, c ≤ 400\nExactly one S and one E",
    reference: "import sys\nfrom collections import deque\nd = sys.stdin.read().split()\nr, c = int(d[0]), int(d[1])\ng = d[2:2 + r]\nfor i in range(r):\n    j = g[i].find('S')\n    if j >= 0:\n        s = (i, j)\ndist = [[-1] * c for _ in range(r)]\ndist[s[0]][s[1]] = 0\nq = deque([s])\nans = -1\nwhile q:\n    x, y = q.popleft()\n    if g[x][y] == 'E':\n        ans = dist[x][y]\n        break\n    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n        if 0 <= nx < r and 0 <= ny < c and dist[nx][ny] < 0 and g[nx][ny] != '#':\n            dist[nx][ny] = dist[x][y] + 1\n            q.append((nx, ny))\nprint(ans)\n",
    solve: (i) => { const t = tok(i); const r = Number(t[0]), c = Number(t[1]); const g = t.slice(2, 2 + r); let s = 0; g.forEach((row, x) => { const y = row.indexOf("S"); if (y >= 0) s = x * c + y; }); const dist = new Int32Array(r * c).fill(-1); dist[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) { const cur = q[h]; const x = Math.floor(cur / c), y = cur % c; if (g[x][y] === "E") return String(dist[cur]); for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { if (nx >= 0 && nx < r && ny >= 0 && ny < c && dist[nx * c + ny] < 0 && g[nx][ny] !== "#") { dist[nx * c + ny] = dist[cur] + 1; q.push(nx * c + ny); } } } return "-1"; },
    samples: ["3 4\nS..#\n.#..\n...E\n", "2 3\nS#E\n.#.\n"],
    hidden: (() => { const r = rng(304); const maze = (h: number, w: number, p: number) => { const rows: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => (r() < p ? "#" : "."))); rows[0][0] = "S"; rows[h - 1][w - 1] = "E"; return gridInput(rows.map((x) => x.join(""))); }; return ["1 2\nSE\n", "1 3\nS#E\n", maze(8, 8, 0.2), maze(50, 60, 0.3), maze(400, 400, 0.25), maze(400, 400, 0), maze(300, 400, 0.45), maze(200, 5, 0.1)]; })(),
  },
  {
    family: "dijkstra-shortest", title: "Cheapest Route", difficulty: "HARD", topic: "graphs", expectedMinutes: 40,
    statement: "A directed graph has n cities and m one-way roads, each with a positive cost. Print the cheapest total cost to travel from city 1 to city n, or -1 if city n cannot be reached.",
    inputFormat: "The first line contains n and m. Each of the next m lines contains u, v and w (a road from u to v costing w).", outputFormat: "A single integer.", constraints: "2 ≤ n ≤ 20000\n0 ≤ m ≤ 60000\n1 ≤ w ≤ 1000",
    reference: "import sys, heapq\nd = sys.stdin.read().split()\nn, m = int(d[0]), int(d[1])\nadj = [[] for _ in range(n + 1)]\nfor i in range(m):\n    u, v, w = int(d[2 + 3 * i]), int(d[3 + 3 * i]), int(d[4 + 3 * i])\n    adj[u].append((v, w))\nINF = float('inf')\ndist = [INF] * (n + 1)\ndist[1] = 0\npq = [(0, 1)]\nwhile pq:\n    du, u = heapq.heappop(pq)\n    if du > dist[u]:\n        continue\n    for v, w in adj[u]:\n        if du + w < dist[v]:\n            dist[v] = du + w\n            heapq.heappush(pq, (dist[v], v))\nprint(dist[n] if dist[n] < INF else -1)\n",
    solve: (i) => { const [n, m, ...x] = nums(i); const adj: number[][][] = Array.from({ length: n + 1 }, () => []); for (let k = 0; k < m; k++) adj[x[3 * k]].push([x[3 * k + 1], x[3 * k + 2]]); const dist = new Array(n + 1).fill(Infinity); dist[1] = 0; const heap: number[][] = [[0, 1]]; const push = (e: number[]) => { heap.push(e); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } }; const pop = () => { const top = heap[0]; const last = heap.pop()!; if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, rr = l + 1; let s = k; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (rr < heap.length && heap[rr][0] < heap[s][0]) s = rr; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; }; while (heap.length) { const [du, u] = pop(); if (du > dist[u]) continue; for (const [v, w] of adj[u]) if (du + w < dist[v]) { dist[v] = du + w; push([dist[v], v]); } } return String(dist[n] < Infinity ? dist[n] : -1); },
    samples: ["4 5\n1 2 4\n1 3 1\n3 2 2\n2 4 5\n3 4 9\n", "3 1\n1 2 5\n"],
    hidden: (() => { const r = rng(305); const c = (n: number, m: number) => graphInput(n, randGraph(r, n, m, true)); return ["2 0\n", "2 1\n1 2 7\n", c(10, 30), c(200, 1000), c(20000, 60000), c(20000, 25000), c(5000, 60000), graphInput(1000, Array.from({ length: 999 }, (_, k) => [k + 1, k + 2, 1000]))]; })(),
  },
  {
    family: "count-islands", title: "Count the Islands", difficulty: "HARD", topic: "graphs", expectedMinutes: 34,
    statement: "A map is a grid of '1' (land) and '0' (water). Land cells connected up, down, left or right form one island. Print the number of islands.",
    inputFormat: "The first line contains r and c. The next r lines contain the grid.", outputFormat: "A single integer.", constraints: "1 ≤ r, c ≤ 500",
    reference: "import sys\nd = sys.stdin.read().split()\nr, c = int(d[0]), int(d[1])\ng = [list(row) for row in d[2:2 + r]]\ncount = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == '1':\n            count += 1\n            g[i][j] = '0'\n            stack = [(i, j)]\n            while stack:\n                x, y = stack.pop()\n                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n                    if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == '1':\n                        g[nx][ny] = '0'\n                        stack.append((nx, ny))\nprint(count)\n",
    solve: (i) => { const t = tok(i); const r = Number(t[0]), c = Number(t[1]); const g = t.slice(2, 2 + r).map((row) => [...row]); let count = 0; for (let x0 = 0; x0 < r; x0++) for (let y0 = 0; y0 < c; y0++) if (g[x0][y0] === "1") { count++; g[x0][y0] = "0"; const st = [[x0, y0]]; while (st.length) { const [x, y] = st.pop()!; for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (nx >= 0 && nx < r && ny >= 0 && ny < c && g[nx][ny] === "1") { g[nx][ny] = "0"; st.push([nx, ny]); } } } return String(count); },
    samples: ["4 5\n11000\n11000\n00100\n00011\n", "1 3\n000\n"],
    hidden: (() => { const r = rng(306); const g = (h: number, w: number, p: number) => gridInput(Array.from({ length: h }, () => Array.from({ length: w }, () => (r() < p ? "1" : "0")).join(""))); return ["1 1\n1\n", "2 2\n10\n01\n", g(10, 10, 0.4), g(80, 60, 0.5), g(500, 500, 0.45), g(500, 500, 0.6), g(500, 500, 0.1), g(300, 500, 1)]; })(),
  },
  {
    family: "smallest-topological-order", title: "Task Order", difficulty: "HARD", topic: "graphs", expectedMinutes: 39,
    statement: "There are n tasks and m rules \"u must come before v\". Print an order of all tasks that obeys every rule, choosing the alphabetically (numerically) smallest such order. Print -1 if no valid order exists.",
    inputFormat: "The first line contains n and m. Each of the next m lines contains u and v.", outputFormat: "n space-separated task numbers, or -1.", constraints: "1 ≤ n ≤ 20000\n0 ≤ m ≤ 60000",
    reference: "import sys, heapq\nd = sys.stdin.read().split()\nn, m = int(d[0]), int(d[1])\nadj = [[] for _ in range(n + 1)]\nindeg = [0] * (n + 1)\nfor i in range(m):\n    u, v = int(d[2 + 2 * i]), int(d[3 + 2 * i])\n    adj[u].append(v)\n    indeg[v] += 1\npq = [i for i in range(1, n + 1) if indeg[i] == 0]\nheapq.heapify(pq)\norder = []\nwhile pq:\n    u = heapq.heappop(pq)\n    order.append(u)\n    for v in adj[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            heapq.heappush(pq, v)\nprint(' '.join(map(str, order)) if len(order) == n else -1)\n",
    solve: (i) => { const [n, m, ...x] = nums(i); const adj: number[][] = Array.from({ length: n + 1 }, () => []); const indeg = new Array(n + 1).fill(0); for (let k = 0; k < m; k++) { adj[x[2 * k]].push(x[2 * k + 1]); indeg[x[2 * k + 1]]++; } const heap: number[] = []; const push = (v: number) => { heap.push(v); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p] <= heap[k]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } }; const pop = () => { const top = heap[0]; const last = heap.pop()!; if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, rr = l + 1; let s = k; if (l < heap.length && heap[l] < heap[s]) s = l; if (rr < heap.length && heap[rr] < heap[s]) s = rr; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; }; for (let v = 1; v <= n; v++) if (!indeg[v]) push(v); const order: number[] = []; while (heap.length) { const u = pop(); order.push(u); for (const v of adj[u]) if (--indeg[v] === 0) push(v); } return order.length === n ? order.join(" ") : "-1"; },
    samples: ["4 3\n2 1\n3 1\n4 2\n", "2 2\n1 2\n2 1\n"],
    hidden: (() => { const r = rng(307); const dag = (n: number, m: number) => { const perm = shuffle(r, Array.from({ length: n }, (_, k) => k + 1)); const e: number[][] = []; for (let k = 0; k < m; k++) { const a = Math.floor(r() * n), b = Math.floor(r() * n); if (a !== b) e.push(a < b ? [perm[a], perm[b]] : [perm[b], perm[a]]); } return graphInput(n, e); }; return ["1 0\n", "3 0\n", dag(10, 15), dag(500, 2000), dag(20000, 60000), dag(20000, 5000), graphInput(5, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 2]]), dag(3000, 60000)]; })(),
  },
  {
    family: "word-break-ways", title: "Word Break Count", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 38,
    statement: "Count the ways to split a string into a sequence of dictionary words (each word may be reused). Print the count modulo 1000000007.",
    inputFormat: "The first line contains the string. The second line contains k. The third line contains k distinct dictionary words.", outputFormat: "A single integer.", constraints: "1 ≤ string length ≤ 3000\n1 ≤ k ≤ 200\n1 ≤ word length ≤ 10",
    reference: "import sys\nd = sys.stdin.read().split()\ns = d[0]\nk = int(d[1])\nwords = set(d[2:2 + k])\nMOD = 10 ** 9 + 7\nn = len(s)\ndp = [0] * (n + 1)\ndp[0] = 1\nfor i in range(1, n + 1):\n    total = 0\n    for l in range(1, min(10, i) + 1):\n        if dp[i - l] and s[i - l:i] in words:\n            total += dp[i - l]\n    dp[i] = total % MOD\nprint(dp[n])\n",
    solve: (i) => { const t = tok(i); const s = t[0]; const k = Number(t[1]); const words = new Set(t.slice(2, 2 + k)); const dp = new Array(s.length + 1).fill(0); dp[0] = 1; for (let x = 1; x <= s.length; x++) { let total = 0; for (let l = 1; l <= Math.min(10, x); l++) if (dp[x - l] && words.has(s.slice(x - l, x))) total += dp[x - l]; dp[x] = total % MOD; } return String(dp[s.length]); },
    samples: ["catsanddog\n5\ncat cats and sand dog\n", "abcd\n2\nab cd\n"],
    hidden: (() => { const r = rng(308); const dict = (k: number, alpha: number, max: number) => [...new Set(words(r, k, 1, max, alpha))]; const build = (n: number, d: string[]) => { let s = ""; while (s.length < n) s += d[Math.floor(r() * d.length)]; return s.slice(0, n); }; const c = (n: number, k: number, alpha: number, max: number) => { const d = dict(k, alpha, max); return `${build(n, d)}\n${d.length}\n${d.join(" ")}\n`; }; return ["a\n1\nb\n", `${"a".repeat(3000)}\n3\na aa aaa\n`, c(20, 6, 3, 3), c(300, 30, 3, 4), c(3000, 200, 2, 10), c(3000, 50, 4, 5), c(2000, 150, 26, 6), `${"ab".repeat(1500)}\n4\na b ab ba\n`]; })(),
  },
  {
    family: "min-path-sum", title: "Minimum Path Sum", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 34,
    statement: "Move from the top-left to the bottom-right cell of a grid, stepping only right or down. Print the smallest possible sum of the numbers on the cells you visit (both ends included).",
    inputFormat: "The first line contains r and c. Each of the next r lines contains c integers.", outputFormat: "A single integer.", constraints: "1 ≤ r, c ≤ 400\n0 ≤ value ≤ 1000",
    reference: "import sys\nd = sys.stdin.read().split()\nr, c = int(d[0]), int(d[1])\nrow = [0] * c\nfor i in range(r):\n    vals = d[2 + i * c:2 + (i + 1) * c]\n    for j in range(c):\n        v = int(vals[j])\n        if i == 0 and j == 0:\n            row[j] = v\n        elif i == 0:\n            row[j] = row[j - 1] + v\n        elif j == 0:\n            row[j] = row[j] + v\n        else:\n            row[j] = min(row[j], row[j - 1]) + v\nprint(row[-1])\n",
    solve: (i) => { const [r, c, ...v] = nums(i); const row = new Array(c).fill(0); for (let x = 0; x < r; x++) for (let y = 0; y < c; y++) { const val = v[x * c + y]; row[y] = x === 0 && y === 0 ? val : x === 0 ? row[y - 1] + val : y === 0 ? row[y] + val : Math.min(row[y], row[y - 1]) + val; } return String(row[c - 1]); },
    samples: ["3 3\n1 3 1\n1 5 1\n4 2 1\n", "1 1\n7\n"],
    hidden: (() => { const r = rng(309); const mx = (a: number, b: number, hi = 1000) => matrixInput(Array.from({ length: a }, () => ints(r, b, 0, hi))); return ["1 4\n1 2 3 4\n", "4 1\n1\n2\n3\n4\n", mx(5, 5, 9), mx(60, 40), mx(400, 400), mx(400, 400, 1), mx(200, 400, 0), mx(399, 17)]; })(),
  },
  {
    family: "count-inversions", title: "Count Inversions", difficulty: "HARD", topic: "sorting", expectedMinutes: 40,
    statement: "An inversion is a pair of positions i < j with a[i] > a[j]. Print the number of inversions. An O(n²) solution will not pass the largest tests.",
    inputFormat: "The first line contains n. The second line contains n integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nrank = {v: i + 1 for i, v in enumerate(sorted(set(a)))}\nm = len(rank)\ntree = [0] * (m + 1)\ninv = 0\nseen = 0\nfor x in a:\n    k = rank[x]\n    s = 0\n    i = k\n    while i > 0:\n        s += tree[i]\n        i -= i & -i\n    inv += seen - s\n    seen += 1\n    i = k\n    while i <= m:\n        tree[i] += 1\n        i += i & -i\nprint(inv)\n",
    solve: (i) => { const [n, ...v] = nums(i); const a = v.slice(0, n); const sorted = [...new Set(a)].sort((x, y) => x - y); const rank = new Map(sorted.map((x, k) => [x, k + 1])); const m = sorted.length; const tree = new Array(m + 1).fill(0); let inv = 0; a.forEach((x, seen) => { const k = rank.get(x)!; let s = 0; for (let p = k; p > 0; p -= p & -p) s += tree[p]; inv += seen - s; for (let p = k; p <= m; p += p & -p) tree[p]++; }); return String(inv); },
    samples: ["5\n2 4 1 3 5\n", "3\n1 2 3\n"],
    hidden: (() => { const r = rng(310); return ["1\n5\n", "4\n4 3 2 1\n", arrInput(ints(r, 30, 1, 10)), arrInput(ints(r, 5000, -1e9, 1e9)), arrInput(ints(r, 100000, -1e9, 1e9)), arrInput(Array.from({ length: 100000 }, (_, k) => 100000 - k)), arrInput(ints(r, 100000, 1, 5)), arrInput(Array.from({ length: 80000 }, (_, k) => k))]; })(),
  },
  {
    family: "longest-palindrome-substring", title: "Longest Palindromic Substring", difficulty: "HARD", topic: "strings", expectedMinutes: 36,
    statement: "Print the length of the longest contiguous substring that reads the same forwards and backwards.",
    inputFormat: "A single lowercase string.", outputFormat: "A single integer.", constraints: "1 ≤ length ≤ 2000",
    reference: "import sys\ns = sys.stdin.readline().strip()\nn = len(s)\nbest = 1\nfor c in range(n):\n    for l, r in ((c, c), (c, c + 1)):\n        while l >= 0 and r < n and s[l] == s[r]:\n            l -= 1\n            r += 1\n        best = max(best, r - l - 1)\nprint(best)\n",
    solve: (i) => { const s = i.trim(); const n = s.length; let best = 1; for (let c = 0; c < n; c++) for (const [l0, r0] of [[c, c], [c, c + 1]]) { let l = l0, r = r0; while (l >= 0 && r < n && s[l] === s[r]) { l--; r++; } best = Math.max(best, r - l - 1); } return String(best); },
    samples: ["babad\n", "cbbd\n"],
    hidden: (() => { const r = rng(311); const pal = (h: number, k: number) => { const a = word(r, h, h, k); return a + [...a].reverse().join(""); }; return ["a\n", "ab\n", `${word(r, 50, 50, 2)}\n`, `${word(r, 2000, 2000, 26)}\n`, `${"a".repeat(2000)}\n`, `${word(r, 600, 600, 3)}${pal(400, 3)}${word(r, 600, 600, 3)}\n`, `${word(r, 2000, 2000, 2)}\n`, "forgeeksskeegfor\n"]; })(),
  },
  {
    family: "coin-change-ways", title: "Coin Change Combinations", difficulty: "HARD", topic: "dynamic programming", expectedMinutes: 35,
    statement: "Count the different combinations of coins (unlimited supply of each of k distinct denominations) that add up to the amount. The order of coins does not matter. Print the count modulo 1000000007.",
    inputFormat: "The first line contains k and amount. The second line contains k distinct denominations.", outputFormat: "A single integer.", constraints: "1 ≤ k ≤ 30\n0 ≤ amount ≤ 20000\n1 ≤ coin ≤ 20000",
    reference: "import sys\nd = sys.stdin.read().split()\nk, amount = int(d[0]), int(d[1])\nMOD = 10 ** 9 + 7\ndp = [0] * (amount + 1)\ndp[0] = 1\nfor c in map(int, d[2:2 + k]):\n    for v in range(c, amount + 1):\n        dp[v] = (dp[v] + dp[v - c]) % MOD\nprint(dp[amount])\n",
    solve: (i) => { const [k, amount, ...coins] = nums(i); const dp = new Array(amount + 1).fill(0); dp[0] = 1; for (const c of coins.slice(0, k)) for (let v = c; v <= amount; v++) dp[v] = (dp[v] + dp[v - c]) % MOD; return String(dp[amount]); },
    samples: ["3 5\n1 2 5\n", "1 3\n2\n"],
    hidden: (() => { const r = rng(312); const c = (k: number, amount: number, hi: number) => { const coins = [...new Set(ints(r, k * 2, 1, hi))].slice(0, k); return `${coins.length} ${amount}\n${coins.join(" ")}\n`; }; return ["1 0\n9\n", "2 10\n3 7\n", c(5, 100, 30), c(10, 1000, 200), c(30, 20000, 500), c(30, 20000, 20000), "4 20000\n1 2 5 10\n", c(20, 15000, 50)]; })(),
  },
  {
    family: "union-components", title: "Network Components", difficulty: "HARD", topic: "union-find", expectedMinutes: 33,
    statement: "A network has n computers and m cables, each joining two computers. Print the number of separate groups of connected computers and the size of the largest group.",
    inputFormat: "The first line contains n and m. Each of the next m lines contains u and v.", outputFormat: "Two integers: the number of groups and the largest group size.", constraints: "1 ≤ n ≤ 100000\n0 ≤ m ≤ 100000",
    reference: "import sys\nd = sys.stdin.read().split()\nn, m = int(d[0]), int(d[1])\nparent = list(range(n + 1))\nsize = [1] * (n + 1)\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]\n        x = parent[x]\n    return x\ngroups = n\nfor i in range(m):\n    a, b = find(int(d[2 + 2 * i])), find(int(d[3 + 2 * i]))\n    if a != b:\n        if size[a] < size[b]:\n            a, b = b, a\n        parent[b] = a\n        size[a] += size[b]\n        groups -= 1\nprint(groups, max(size[find(i)] for i in range(1, n + 1)))\n",
    solve: (i) => { const [n, m, ...x] = nums(i); const parent = Array.from({ length: n + 1 }, (_, k) => k); const size = new Array(n + 1).fill(1); const find = (v: number) => { while (parent[v] !== v) { parent[v] = parent[parent[v]]; v = parent[v]; } return v; }; let groups = n; for (let k = 0; k < m; k++) { let a = find(x[2 * k]), b = find(x[2 * k + 1]); if (a !== b) { if (size[a] < size[b]) [a, b] = [b, a]; parent[b] = a; size[a] += size[b]; groups--; } } let big = 0; for (let v = 1; v <= n; v++) big = Math.max(big, size[find(v)]); return `${groups} ${big}`; },
    samples: ["5 3\n1 2\n2 3\n4 5\n", "3 0\n"],
    hidden: (() => { const r = rng(313); const c = (n: number, m: number) => graphInput(n, randGraph(r, n, m, false)); return ["1 0\n", "2 1\n1 1\n", c(10, 6), c(1000, 800), c(100000, 100000), c(100000, 30000), c(50000, 100000), graphInput(1000, Array.from({ length: 999 }, (_, k) => [k + 1, k + 2]))]; })(),
  },
  {
    family: "sliding-window-max", title: "Sliding Window Maximum", difficulty: "HARD", topic: "deque", expectedMinutes: 38,
    statement: "For every window of k consecutive elements, print the largest element in that window, from left to right. An O(n·k) solution will not pass the largest tests.",
    inputFormat: "The first line contains n and k. The second line contains n integers.", outputFormat: "n − k + 1 space-separated integers.", constraints: "1 ≤ k ≤ n ≤ 50000\n-10^9 ≤ a[i] ≤ 10^9",
    reference: "import sys\nfrom collections import deque\nd = sys.stdin.read().split()\nn, k = int(d[0]), int(d[1])\na = list(map(int, d[2:2 + n]))\nq = deque()\nout = []\nfor i, x in enumerate(a):\n    while q and a[q[-1]] <= x:\n        q.pop()\n    q.append(i)\n    if q[0] <= i - k:\n        q.popleft()\n    if i >= k - 1:\n        out.append(a[q[0]])\nprint(' '.join(map(str, out)))\n",
    solve: (i) => { const [n, k, ...v] = nums(i); const a = v.slice(0, n); const q: number[] = []; let head = 0; const out: number[] = []; a.forEach((x, idx) => { while (q.length > head && a[q[q.length - 1]] <= x) q.pop(); q.push(idx); if (q[head] <= idx - k) head++; if (idx >= k - 1) out.push(a[q[head]]); }); return out.join(" "); },
    samples: ["8 3\n1 3 -1 -3 5 3 6 7\n", "3 3\n4 2 9\n"],
    hidden: (() => { const r = rng(314); const c = (n: number, k: number, lo: number, hi: number) => `${n} ${k}\n${ints(r, n, lo, hi).join(" ")}\n`; return ["1 1\n5\n", "5 1\n5 4 3 2 1\n", c(20, 4, 0, 9), c(3000, 100, -1e9, 1e9), c(50000, 1000, -1e9, 1e9), c(50000, 2, 1, 3), c(50000, 50000, -5, 5), `50000 300\n${Array.from({ length: 50000 }, (_, k) => 50000 - k).join(" ")}\n`]; })(),
  },
  {
    family: "min-jumps", title: "Minimum Jumps", difficulty: "HARD", topic: "greedy", expectedMinutes: 36,
    statement: "You start at index 0 of an array; a[i] is the longest jump allowed from index i. Print the minimum number of jumps to reach the last index, or -1 if it cannot be reached.",
    inputFormat: "The first line contains n. The second line contains n non-negative integers.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 200000\n0 ≤ a[i] ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\na = list(map(int, d[1:1 + n]))\nif n == 1:\n    print(0)\nelse:\n    jumps = end = far = 0\n    ok = False\n    for i in range(n - 1):\n        far = max(far, i + a[i])\n        if i == end:\n            if far <= i:\n                break\n            jumps += 1\n            end = far\n            if end >= n - 1:\n                ok = True\n                break\n    print(jumps if ok else -1)\n",
    solve: (i) => { const [n, ...v] = nums(i); const a = v.slice(0, n); if (n === 1) return "0"; let jumps = 0, end = 0, far = 0; for (let k = 0; k < n - 1; k++) { far = Math.max(far, k + a[k]); if (k === end) { if (far <= k) return "-1"; jumps++; end = far; if (end >= n - 1) return String(jumps); } } return "-1"; },
    samples: ["5\n2 3 1 1 4\n", "5\n3 2 1 0 4\n"],
    hidden: (() => { const r = rng(315); return ["1\n0\n", "2\n0 5\n", arrInput(ints(r, 20, 0, 3)), arrInput(ints(r, 5000, 1, 4)), arrInput(ints(r, 200000, 1, 3)), arrInput([...ints(r, 100000, 1, 3), 0, 0, 0, 0, 0, ...ints(r, 1000, 1, 3)]), arrInput(Array(200000).fill(1)), arrInput([1000000000, ...ints(r, 199999, 0, 2)])]; })(),
  },
  {
    family: "bipartite-check", title: "Two-Team Split", difficulty: "HARD", topic: "graphs", expectedMinutes: 37,
    statement: "n people and m rivalries are given; each rivalry joins two people who must be in different teams. Print YES if everyone can be split into two teams obeying every rivalry, otherwise NO.",
    inputFormat: "The first line contains n and m. Each of the next m lines contains u and v (u ≠ v).", outputFormat: "YES or NO.", constraints: "1 ≤ n ≤ 50000\n0 ≤ m ≤ 100000",
    reference: "import sys\nfrom collections import deque\nd = sys.stdin.read().split()\nn, m = int(d[0]), int(d[1])\nadj = [[] for _ in range(n + 1)]\nfor i in range(m):\n    u, v = int(d[2 + 2 * i]), int(d[3 + 2 * i])\n    adj[u].append(v)\n    adj[v].append(u)\ncolor = [-1] * (n + 1)\nok = True\nfor s in range(1, n + 1):\n    if color[s] >= 0 or not ok:\n        continue\n    color[s] = 0\n    q = deque([s])\n    while q and ok:\n        u = q.popleft()\n        for v in adj[u]:\n            if color[v] < 0:\n                color[v] = 1 - color[u]\n                q.append(v)\n            elif color[v] == color[u]:\n                ok = False\n                break\nprint('YES' if ok else 'NO')\n",
    solve: (i) => { const [n, m, ...x] = nums(i); const adj: number[][] = Array.from({ length: n + 1 }, () => []); for (let k = 0; k < m; k++) { adj[x[2 * k]].push(x[2 * k + 1]); adj[x[2 * k + 1]].push(x[2 * k]); } const color = new Array(n + 1).fill(-1); for (let s = 1; s <= n; s++) { if (color[s] >= 0) continue; color[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) { const u = q[h]; for (const v of adj[u]) { if (color[v] < 0) { color[v] = 1 - color[u]; q.push(v); } else if (color[v] === color[u]) return "NO"; } } } return "YES"; },
    samples: ["4 4\n1 2\n2 3\n3 4\n4 1\n", "3 3\n1 2\n2 3\n3 1\n"],
    hidden: (() => { const r = rng(316); const bip = (n: number, m: number) => { const side = Array.from({ length: n + 1 }, () => r() < 0.5); const e: number[][] = []; while (e.length < m) { const u = 1 + Math.floor(r() * n), v = 1 + Math.floor(r() * n); if (u !== v && side[u] !== side[v]) e.push([u, v]); } return graphInput(n, e); }; const any = (n: number, m: number) => graphInput(n, randGraph(r, n, m, false).filter(([u, v]) => u !== v)); return ["1 0\n", "2 1\n1 2\n", bip(10, 12), any(10, 12), bip(50000, 100000), any(50000, 60000), bip(2000, 50000), graphInput(5, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]])]; })(),
  },
  {
    family: "largest-rectangle-histogram", title: "Largest Rectangle in a Histogram", difficulty: "HARD", topic: "stacks", expectedMinutes: 42,
    statement: "A histogram has n bars of width 1 and the given heights. Print the area of the largest rectangle that fits entirely inside the histogram. An O(n²) solution will not pass the largest tests.",
    inputFormat: "The first line contains n. The second line contains n heights.", outputFormat: "A single integer.", constraints: "1 ≤ n ≤ 100000\n0 ≤ height ≤ 10^9",
    reference: "import sys\nd = sys.stdin.read().split()\nn = int(d[0])\nh = list(map(int, d[1:1 + n])) + [0]\nstack = []\nbest = 0\nfor i, x in enumerate(h):\n    start = i\n    while stack and stack[-1][1] >= x:\n        j, y = stack.pop()\n        best = max(best, y * (i - j))\n        start = j\n    stack.append((start, x))\nprint(best)\n",
    solve: (i) => { const [n, ...v] = nums(i); const h = [...v.slice(0, n), 0]; const st: number[][] = []; let best = 0; h.forEach((x, k) => { let start = k; while (st.length && st[st.length - 1][1] >= x) { const [j, y] = st.pop()!; best = Math.max(best, y * (k - j)); start = j; } st.push([start, x]); }); return String(best); },
    samples: ["6\n2 1 5 6 2 3\n", "2\n0 0\n"],
    hidden: (() => { const r = rng(317); return ["1\n7\n", "5\n1 2 3 4 5\n", arrInput(ints(r, 30, 0, 20)), arrInput(ints(r, 5000, 0, 1e9)), arrInput(ints(r, 100000, 0, 1e9)), arrInput(Array(100000).fill(1000000000)), arrInput(Array.from({ length: 100000 }, (_, k) => k)), arrInput(ints(r, 80000, 0, 3))]; })(),
  },
];

export const STARTER_BANK: StarterProblem[] = [...BASE_BANK, ...EXTRA_BANK];
