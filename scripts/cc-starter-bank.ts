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

export const STARTER_BANK: StarterProblem[] = [
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
      const MOD = 1000000007n;
      const row = new Array<bigint>(c).fill(0n);
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
        if (grid[i][j] === "#") row[j] = 0n;
        else if (i === 0 && j === 0) row[j] = 1n;
        else if (j > 0) row[j] = (row[j] + row[j - 1]) % MOD;
      }
      return String(row[c - 1] % MOD);
    },
    samples: ["3 3\n...\n.#.\n...\n", "2 2\n.#\n#.\n"],
    hidden: (() => {
      const r = rng(33);
      const g = (h: number, w: number, p: number) => { const rows = Array.from({ length: h }, () => Array.from({ length: w }, () => (r() < p ? "#" : ".")).join("")); rows[0] = `.${rows[0].slice(1)}`; rows[h - 1] = `${rows[h - 1].slice(0, -1)}.`; return `${h} ${w}\n${rows.join("\n")}\n`; };
      return ["1 1\n.\n", "1 1\n#\n", "1 5\n.....\n", g(10, 10, 0.1), g(60, 80, 0.05), g(300, 300, 0.02), g(700, 700, 0), g(1000, 400, 0.1)];
    })(),
  },
];
