/**
 * Original LogiQuest coding challenges. Every challenge carries a Python reference solution; the seed script
 * runs it on every test input to produce the expected output, so test data can never disagree with the official
 * solution. Add a challenge by appending to `challenges` — no schema or code change required.
 */
export type Seed = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: string;
  subtopic: string;
  style: string;
  tags: string[];
  minutes: number;
  statement: string;
  scenario: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  notes: string;
  /** Public examples (shown to learners). */
  examples: { input: string; explanation: string }[];
  /** Hidden tests; `edge: true` marks boundary cases. */
  hidden: { input: string; edge?: boolean; label?: string }[];
  hints: [string, string, string];
  ref: string;
  solution: {
    explanation: string; approach: string; algorithm: string; timeComplexity: string; spaceComplexity: string;
    alternative: string; edgeCases: string; lineByLine: string[];
  };
};

// Deterministic pseudo-random numbers so large hidden tests are reproducible.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}
const range = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i));

const bigPairs = (() => {
  const r = rng(7);
  const n = 100000;
  return `${n} 1000\n${range(n, () => String(Math.floor(r() * 900) + 1)).join(" ")}`;
})();
const bigWindow = (() => {
  const r = rng(11);
  return range(50000, () => String.fromCharCode(97 + Math.floor(r() * 26))).join("");
})();
const bigGrid = (() => {
  const r = rng(5);
  const n = 400;
  const rows = range(n, (i) => range(n, (j) => (i === 0 && j === 0 ? "S" : i === n - 1 && j === n - 1 ? "D" : r() < 0.18 ? "#" : ".")).join(""));
  return `${n} ${n}\n${rows.join("\n")}`;
})();
const bigShip = (() => {
  const r = rng(3);
  const n = 50000;
  return `${n} 1000\n${range(n, () => String(Math.floor(r() * 500) + 1)).join(" ")}`;
})();
const bigCoin = `4 9999\n1 5 10 25`;
const bigEdit = (() => {
  const r = rng(9);
  const s = () => range(1200, () => String.fromCharCode(97 + Math.floor(r() * 4))).join("");
  return `${s()}\n${s()}`;
})();
const bigDag = (() => {
  const n = 20000;
  const edges: string[] = [];
  for (let v = 1; v < n; v++) edges.push(`${v + 1} ${v}`);
  return `${n} ${edges.length}\n${edges.join("\n")}`;
})();
const bigTrades = (() => {
  const r = rng(13);
  const n = 2000;
  return `50 ${n}\n${range(n, () => String(Math.floor(r() * 1000) + 1)).join(" ")}`;
})();

export const challenges: Seed[] = [
  {
    slug: "shopping-cart-total", title: "Shopping Cart Total", difficulty: "EASY", topic: "Programming Fundamentals", subtopic: "Variables and Arithmetic",
    style: "Service Company Style", tags: ["arithmetic", "loops", "e-commerce"], minutes: 10,
    statement: "An online store applies one percentage discount to the whole cart. Given the items in a cart and the discount, print the amount the customer pays.\n\nPrint the amount in rupees with exactly two decimal places.",
    scenario: "A checkout service receives the cart as a list of (unit price, quantity) pairs and a coupon percentage, and must show the payable amount on the payment screen.",
    inputFormat: "Line 1: integer N, the number of cart lines.\nNext N lines: two integers P and Q, the unit price in whole rupees and the quantity.\nLast line: integer D, the discount percentage.",
    outputFormat: "One line: the payable amount with exactly two digits after the decimal point.",
    constraints: "1 ≤ N ≤ 1000\n1 ≤ P ≤ 100000\n1 ≤ Q ≤ 100\n0 ≤ D ≤ 100",
    notes: "Floating-point arithmetic can print amounts like 1124.9999. Think about doing the maths in whole numbers (paise) and only formatting at the end.",
    examples: [
      { input: "2\n500 2\n250 1\n10", explanation: "Cart value is 500×2 + 250×1 = 1250. After a 10% discount the customer pays 1125.00." },
      { input: "1\n999 1\n0", explanation: "No discount, so the amount is just 999.00." },
      { input: "3\n100 1\n100 1\n100 1\n100", explanation: "A 100% coupon makes the cart free: 0.00." },
    ],
    hidden: [
      { input: "1\n1 1\n33", edge: true, label: "tiny amount" },
      { input: "1\n1999 1\n5", label: "fractional paise" },
      { input: "5\n100000 100\n99999 100\n1 1\n2 2\n3 3\n17", edge: true, label: "maximum values" },
      { input: "4\n12 7\n45 3\n8 12\n300 2\n12" },
      { input: "2\n250 4\n125 8\n100", edge: true },
    ],
    hints: ["Total the cart first: add price × quantity for every line.", "The payable amount is total × (100 − D) / 100. Avoid decimals by keeping everything in paise (total × (100 − D) is already in paise).", "Split the paise value into rupees (integer division by 100) and the remaining paise (remainder), then pad the paise to two digits."],
    ref: `n = int(input())
total = 0
for _ in range(n):
    price, qty = map(int, input().split())
    total += price * qty
d = int(input())
paise = total * (100 - d)
print(f"{paise // 100}.{paise % 100:02d}")`,
    solution: {
      explanation: "Add up price × quantity for every cart line, then apply the discount using whole-number arithmetic so rounding errors never appear.",
      approach: "Multiply the cart total by (100 − D). That number is the payable amount in paise (1/100 of a rupee), because total × (100 − D) / 100 rupees = total × (100 − D) paise. Integer division and remainder by 100 give rupees and paise.",
      algorithm: "1. Read N. 2. Loop N times, adding price × quantity to total. 3. Read D. 4. paise = total × (100 − D). 5. Print paise // 100, a dot, and paise % 100 padded to 2 digits.",
      timeComplexity: "O(N)", spaceComplexity: "O(1)",
      alternative: "Python's Decimal type or Java's BigDecimal can do exact decimal maths, but integer paise is simpler and works in every language.",
      edgeCases: "D = 0 (no change), D = 100 (prints 0.00), amounts whose paise part is below 10 (must print 05, not 5).",
      lineByLine: [
        "Line 1: read how many cart lines there are.",
        "Line 2: start the running cart total at zero.",
        "Line 3: repeat once for each cart line.",
        "Line 4: read the unit price and the quantity from one line.",
        "Line 5: add this line's value (price × quantity) to the total.",
        "Line 6: read the discount percentage.",
        "Line 7: compute the payable amount in paise: total × (100 − D).",
        "Line 8: print rupees (integer division by 100), a dot, then paise (remainder) padded with a leading zero to 2 digits.",
      ],
    },
  },
  {
    slug: "account-balance-after-transactions", title: "Account Balance After Transactions", difficulty: "EASY", topic: "Programming Fundamentals", subtopic: "Conditions and Loops",
    style: "Product Company Style", tags: ["conditions", "loops", "banking"], minutes: 10,
    statement: "A savings account starts with some balance. You are given a list of transactions in order. A deposit (D) always succeeds. A withdrawal (W) succeeds only if the balance is at least the withdrawn amount; otherwise it is rejected and the balance does not change.\n\nPrint the final balance and the number of rejected withdrawals.",
    scenario: "A banking back-end replays a day's transactions to reconcile an account and flag declined withdrawals.",
    inputFormat: "Line 1: integer B, the opening balance.\nLine 2: integer N, the number of transactions.\nNext N lines: a letter (D or W) and an integer amount.",
    outputFormat: "Line 1: the final balance.\nLine 2: the number of rejected withdrawals.",
    constraints: "0 ≤ B ≤ 10^9\n0 ≤ N ≤ 10^5\n1 ≤ amount ≤ 10^9",
    notes: "A withdrawal for exactly the balance is allowed and leaves the account at zero. A rejected withdrawal does not stop later transactions.",
    examples: [
      { input: "1000\n3\nD 500\nW 200\nW 2000", explanation: "1000 + 500 = 1500, then 1500 − 200 = 1300. The last withdrawal of 2000 is rejected. Final balance 1300, one rejection." },
      { input: "100\n2\nW 100\nW 1", explanation: "The first withdrawal empties the account. The second is rejected because the balance is 0." },
      { input: "0\n0", explanation: "No transactions: balance stays 0 and nothing is rejected." },
    ],
    hidden: [
      { input: "50\n1\nW 51", edge: true, label: "overdraw by one" },
      { input: "0\n3\nD 1000000000\nD 1000000000\nW 1500000000", edge: true, label: "large values" },
      { input: "10\n5\nW 5\nW 5\nW 5\nD 3\nW 3", label: "mixed" },
      { input: "500\n4\nD 1\nD 2\nD 3\nD 4" },
    ],
    hints: ["Keep a running balance and a counter for rejected withdrawals.", "For each transaction, handle a deposit first; for a withdrawal compare the amount with the current balance before subtracting.", "Check `amount <= balance` (not `<`) so a withdrawal of the whole balance succeeds."],
    ref: `balance = int(input())
n = int(input())
rejected = 0
for _ in range(n):
    kind, amount = input().split()
    amount = int(amount)
    if kind == "D":
        balance += amount
    elif amount <= balance:
        balance -= amount
    else:
        rejected += 1
print(balance)
print(rejected)`,
    solution: {
      explanation: "Simulate the transactions in order, updating the balance and counting withdrawals that would overdraw the account.",
      approach: "A single pass is enough: each transaction depends only on the current balance.",
      algorithm: "For each transaction: if it is a deposit add it; else if amount ≤ balance subtract it; else increment the rejected counter.",
      timeComplexity: "O(N)", spaceComplexity: "O(1)",
      alternative: "None needed — any correct solution must examine every transaction once.",
      edgeCases: "N = 0, a withdrawal equal to the balance, balance 0, values near 10^9 (use 64-bit integers in C, C++, Java, C#, Go and Kotlin).",
      lineByLine: [
        "Line 1: read the opening balance.", "Line 2: read the number of transactions.", "Line 3: no withdrawals have been rejected yet.",
        "Line 4: process each transaction in order.", "Line 5: read the transaction type and amount as text.", "Line 6: convert the amount to a number.",
        "Lines 7-8: a deposit always increases the balance.", "Lines 9-10: a withdrawal that the balance can cover reduces it.",
        "Lines 11-12: otherwise the withdrawal is declined, so count it.", "Lines 13-14: print the final balance, then the number of rejections.",
      ],
    },
  },
  {
    slug: "attendance-eligibility", title: "Attendance Eligibility", difficulty: "EASY", topic: "Programming Fundamentals", subtopic: "Strings",
    style: "Service Company Style", tags: ["strings", "counting", "hr"], minutes: 8,
    statement: "An employee's attendance for a month is written as a string of characters: P for present and A for absent. The employee is eligible for the attendance bonus if the attendance percentage (rounded down to a whole number) is at least 75.\n\nPrint the percentage and either ELIGIBLE or SHORTAGE.",
    scenario: "An HR payroll tool reads each employee's attendance string from the biometric export and decides whether to attach the bonus.",
    inputFormat: "One line: a string of P and A characters.",
    outputFormat: "Line 1: attendance percentage rounded down.\nLine 2: ELIGIBLE if the percentage is at least 75, otherwise SHORTAGE.",
    constraints: "1 ≤ length ≤ 366",
    notes: "Round down: 74.9% counts as 74 and is a SHORTAGE.",
    examples: [
      { input: "PPPAPPPPPPPPPPPPPPPP", explanation: "19 present out of 20 days is 95%." },
      { input: "PPPA", explanation: "3 of 4 days is exactly 75%, which is eligible." },
      { input: "PAAP", explanation: "2 of 4 days is 50%: shortage." },
    ],
    hidden: [
      { input: "P", edge: true, label: "single day present" },
      { input: "A", edge: true, label: "single day absent" },
      { input: "PPPAPPPAPPPAPPPA", label: "exactly 75" },
      { input: "PPPAPPPAPPPAPPPAA", label: "just under 75" },
      { input: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP" },
    ],
    hints: ["Count how many characters are P.", "Percentage = present × 100 ÷ total days.", "Use integer division so the percentage rounds down, then compare with 75."],
    ref: `days = input().strip()
present = days.count("P")
percent = present * 100 // len(days)
print(percent)
print("ELIGIBLE" if percent >= 75 else "SHORTAGE")`,
    solution: {
      explanation: "Count the present days, convert to a rounded-down percentage using integer arithmetic and compare with the 75% threshold.",
      approach: "Multiply before dividing: present × 100 // total keeps everything in integers and floors the result.",
      algorithm: "present = number of P; percent = present × 100 // length; compare.",
      timeComplexity: "O(L)", spaceComplexity: "O(1)",
      alternative: "Floating-point division with floor works but is easier to get wrong at boundaries such as exactly 75%.",
      edgeCases: "A single character, exactly 75%, a value just below 75%.",
      lineByLine: [
        "Line 1: read the attendance string and remove stray whitespace.", "Line 2: count the P characters — the days present.",
        "Line 3: integer percentage = present × 100 divided (rounded down) by the number of days.", "Line 4: print the percentage.",
        "Line 5: print ELIGIBLE when the percentage is at least 75, otherwise SHORTAGE.",
      ],
    },
  },
  {
    slug: "order-id-palindrome-check", title: "Palindromic Reference Code", difficulty: "EASY", topic: "Programming Fundamentals", subtopic: "Strings",
    style: "Startup Style", tags: ["strings", "two-pointer", "validation"], minutes: 10,
    statement: "A reference code reads the same forwards and backwards when you ignore everything except letters and digits, and ignore the difference between uppercase and lowercase.\n\nPrint YES if the given text is such a code, otherwise NO. A text with no letters or digits counts as YES.",
    scenario: "A support tool highlights 'mirror' reference codes that agents often confuse when read aloud on calls.",
    inputFormat: "One line of text (may contain spaces and punctuation).",
    outputFormat: "YES or NO.",
    constraints: "0 ≤ length ≤ 10^5, printable ASCII characters only",
    notes: "Only the characters A–Z, a–z and 0–9 matter.",
    examples: [
      { input: "A man, a plan, a canal: Panama", explanation: "Ignoring punctuation and case this is amanaplanacanalpanama, which is a palindrome." },
      { input: "AB-12-BA", explanation: "ab12ba reversed is ab21ba, which is different, so the answer is NO." },
      { input: "...", explanation: "Nothing to compare, so the answer is YES." },
    ],
    hidden: [
      { input: "", edge: true, label: "empty line" },
      { input: "x", edge: true },
      { input: "Was it a car or a cat I saw?" },
      { input: "0P", edge: true, label: "digit versus letter" },
      { input: "ab" + "c".repeat(60000) + "ba" },
      { input: "ab" + "c".repeat(60000) + "bb" },
    ],
    hints: ["Build a cleaned-up version of the text first.", "Keep only letters and digits and convert them to the same case.", "Compare the cleaned text with its reverse — or walk two pointers inward from both ends."],
    ref: `text = input()
cleaned = [ch.lower() for ch in text if ch.isalnum()]
print("YES" if cleaned == cleaned[::-1] else "NO")`,
    solution: {
      explanation: "Filter and normalise the text, then check whether it equals its reverse.",
      approach: "Cleaning first makes the comparison trivial and keeps the logic readable.",
      algorithm: "Keep alphanumeric characters lower-cased in a list; compare the list with its reversed copy.",
      timeComplexity: "O(L)", spaceComplexity: "O(L)",
      alternative: "Two pointers moving inward, skipping non-alphanumeric characters, uses O(1) extra space.",
      edgeCases: "Empty line, one character, digits mixed with letters, only punctuation.",
      lineByLine: [
        "Line 1: read the whole line (it may be empty).", "Line 2: keep only letters and digits, converted to lowercase, in a list.",
        "Line 3: the list equals its reverse exactly when the code is a palindrome — print YES or NO.",
      ],
    },
  },
  {
    slug: "log-level-summary", title: "Log Level Summary", difficulty: "MEDIUM", topic: "Data Structures", subtopic: "HashMap",
    style: "Backend Developer Style", tags: ["hashmap", "sorting", "logs"], minutes: 15,
    statement: "A service writes one log line per event. Each line starts with an upper-case level (INFO, WARN, ERROR, …) followed by a space and a free-text message.\n\nCount how many lines each level has and print the levels from the most frequent to the least frequent. If two levels have the same count, print them in alphabetical order.",
    scenario: "An on-call engineer wants a one-glance summary of a log excerpt to see whether errors dominate.",
    inputFormat: "Line 1: integer N, the number of log lines.\nNext N lines: LEVEL followed by a space and a message.",
    outputFormat: "One line per distinct level: the level, a space, and its count.",
    constraints: "1 ≤ N ≤ 10^5\nLevel is 1–10 upper-case letters.\nMessage is 0–200 printable characters.",
    notes: "Only the first word of each line is the level. The message may contain any words, including other level names.",
    examples: [
      { input: "5\nINFO started\nERROR disk full\nINFO user login\nWARN slow query\nINFO user logout", explanation: "INFO appears 3 times, ERROR and WARN once each; the tie is broken alphabetically (ERROR before WARN)." },
      { input: "2\nERROR ERROR happened\nERROR again", explanation: "Only the first word counts, so both lines are ERROR lines: ERROR 2." },
      { input: "1\nDEBUG", explanation: "A line may consist of just the level." },
    ],
    hidden: [
      { input: "4\nB x\nA y\nB z\nA w", edge: true, label: "all ties" },
      { input: "6\nINFO a\nINFO ERROR b\nWARN INFO\nERROR\nERROR\nWARN" },
      { input: `100000\n${range(100000, (i) => (["INFO", "WARN", "ERROR", "DEBUG", "TRACE"][i % 5] + " message " + i)).join("\n")}`, edge: true, label: "maximum size" },
    ],
    hints: ["You need a count for each distinct level — a map from level to count.", "Read each line, take its first word, and increase that level's count.", "Sort the (level, count) pairs by count descending, then by level ascending."],
    ref: `n = int(input())
counts = {}
for _ in range(n):
    level = input().split()[0]
    counts[level] = counts.get(level, 0) + 1
for level, c in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(level, c)`,
    solution: {
      explanation: "A hash map gives O(1) counting per line; one final sort orders the summary.",
      approach: "Count with a dictionary, then sort by a two-part key: negative count (so larger counts first) and level name.",
      algorithm: "For each line take the first token, increment its counter, then sort entries by (−count, name) and print.",
      timeComplexity: "O(N + K log K) for K distinct levels", spaceComplexity: "O(K)",
      alternative: "Sort first and count runs of equal levels; this uses O(N log N) time.",
      edgeCases: "Lines with only a level, messages that contain other level names, every level tied.",
      lineByLine: [
        "Line 1: read the number of log lines.", "Line 2: an empty dictionary will hold level → count.", "Line 3: process every log line.",
        "Line 4: split the line into words and keep the first — the level.", "Line 5: add one to that level's count (starting from 0 if unseen).",
        "Lines 6-7: sort the entries by most frequent first, then alphabetically, and print each as 'level count'.",
      ],
    },
  },
  {
    slug: "count-pairs-with-target-sum", title: "Matching Payment Pairs", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Hashing and Two Sum",
    style: "Product Company Style", tags: ["hashmap", "counting", "optimization"], minutes: 20,
    statement: "Given a list of N payment amounts and a target T, count the pairs of positions (i, j) with i < j whose amounts add up to exactly T.\n\nTwo different positions with the same amount are different pairs.",
    scenario: "A reconciliation job looks for two partial payments that together settle an invoice of exactly T rupees.",
    inputFormat: "Line 1: integers N and T.\nLine 2: N integers, the payment amounts.",
    outputFormat: "One integer: the number of matching pairs.",
    constraints: "1 ≤ N ≤ 2·10^5\n1 ≤ amount ≤ 10^9\n1 ≤ T ≤ 2·10^9",
    notes: "The answer can exceed 32 bits when many amounts are equal. A solution that checks every pair is too slow for the largest inputs.",
    examples: [
      { input: "5 10\n3 7 5 5 5", explanation: "Pairs: (3,7), and three pairs of two 5s among the three 5s — (5,5) at positions 3-4, 3-5, 4-5. Total 1 + 3 = 4." },
      { input: "4 6\n1 2 3 4", explanation: "Only 2 + 4 = 6." },
      { input: "3 100\n1 2 3", explanation: "No pair reaches 100: the answer is 0." },
    ],
    hidden: [
      { input: "1 2\n1", edge: true, label: "single element" },
      { input: "6 4\n2 2 2 2 2 2", edge: true, label: "all equal (15 pairs)" },
      { input: "5 2000000000\n1000000000 1000000000 1 2 1000000000", edge: true, label: "large values" },
      { input: bigPairs, edge: true, label: "100000 numbers (needs O(N))" },
    ],
    hints: ["For each number x, the partner you need is T − x.", "Walk through the list once, remembering how many times each value has appeared so far.", "At every position add the number of earlier occurrences of T − x, then record x. Use 64-bit integers for the answer."],
    ref: `n, target = map(int, input().split())
nums = list(map(int, input().split()))
seen = {}
pairs = 0
for x in nums:
    pairs += seen.get(target - x, 0)
    seen[x] = seen.get(x, 0) + 1
print(pairs)`,
    solution: {
      explanation: "Count, for each number, how many earlier numbers complete it to T. Because we record numbers only after counting, every pair is counted exactly once.",
      approach: "A hash map from value to number of occurrences so far turns the O(N²) pair scan into one pass.",
      algorithm: "For x in the list: pairs += seen[T − x]; then seen[x] += 1.",
      timeComplexity: "O(N)", spaceComplexity: "O(N)",
      alternative: "Sort and use two pointers (O(N log N)); counting equal-value runs needs extra care.",
      edgeCases: "All equal values (answer N(N−1)/2), N = 1, sums close to 2·10^9.",
      lineByLine: [
        "Line 1: read the number of payments and the target.", "Line 2: read the payment amounts.", "Line 3: 'seen' counts how many times each amount appeared before the current position.",
        "Line 4: the number of matching pairs found so far.", "Line 5: look at each amount x in order.", "Line 6: every earlier amount equal to T − x forms a pair with x — add that count.",
        "Line 7: now record x itself for future positions.", "Line 8: print the total.",
      ],
    },
  },
  {
    slug: "longest-unique-session-window", title: "Longest Unique Activity Window", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Sliding Window",
    style: "Backend Developer Style", tags: ["sliding-window", "strings", "hashmap"], minutes: 20,
    statement: "A user's activity is recorded as a string where each character is one action type. Find the length of the longest contiguous stretch in which no action type repeats.",
    scenario: "An analytics team measures the longest run of varied behaviour in a session, ignoring runs where the user repeats the same action.",
    inputFormat: "One line: a string of lowercase letters (it may be empty).",
    outputFormat: "One integer: the length of the longest substring with all distinct characters.",
    constraints: "0 ≤ length ≤ 10^5",
    notes: "The substring must be contiguous. For 'abcabcbb' the answer is 3 ('abc').",
    examples: [
      { input: "abcabcbb", explanation: "'abc' has length 3 and no longer window is repeat-free." },
      { input: "bbbbb", explanation: "Every window longer than 1 repeats a letter: answer 1." },
      { input: "pwwkew", explanation: "'wke' has length 3 (note 'pwke' is not contiguous)." },
    ],
    hidden: [
      { input: "", edge: true, label: "empty input" },
      { input: "a", edge: true },
      { input: "abba", label: "window start must never move backwards" },
      { input: "abcdefghijklmnopqrstuvwxyz", edge: true },
      { input: bigWindow, edge: true, label: "50000 characters" },
    ],
    hints: ["Think of a window [start, i] that always contains distinct characters.", "Remember the last index at which each character was seen.", "When the current character was last seen inside the window, move start just past that index — but never move start backwards."],
    ref: `s = input()
last = {}
start = best = 0
for i, ch in enumerate(s):
    if ch in last and last[ch] >= start:
        start = last[ch] + 1
    last[ch] = i
    best = max(best, i - start + 1)
print(best)`,
    solution: {
      explanation: "Slide a window across the string; when a repeat appears, shrink the window from the left just enough to remove it.",
      approach: "Store each character's last position. A repeat only matters if its previous position lies inside the current window.",
      algorithm: "For each i: if s[i] was last seen at index ≥ start, set start = last + 1. Record last[s[i]] = i and update the best length i − start + 1.",
      timeComplexity: "O(L)", spaceComplexity: "O(alphabet)",
      alternative: "A set plus a left pointer that advances one step at a time is also O(L) but removes characters one by one.",
      edgeCases: "Empty input, a single character, 'abba' (the second 'a' is outside the window and must not move start back).",
      lineByLine: [
        "Line 1: read the activity string.", "Line 2: 'last' remembers the most recent index of each character.", "Line 3: 'start' is the left edge of the current window; 'best' the longest window so far.",
        "Line 4: visit every position i with its character.", "Lines 5-6: if this character already appears inside the window, move the left edge just past its previous position.",
        "Line 7: remember this position.", "Line 8: the window now spans start..i; keep the longest length seen.", "Line 9: print the answer.",
      ],
    },
  },
  {
    slug: "delivery-shortest-route", title: "Delivery Shortest Route", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Graph BFS",
    style: "Product Company Style", tags: ["bfs", "grid", "graphs", "logistics"], minutes: 25,
    statement: "A delivery robot moves on a city grid. S is the start, D is the destination, # is a blocked cell and . is a free cell. The robot moves one step up, down, left or right per move and cannot enter blocked cells or leave the grid.\n\nPrint the minimum number of moves from S to D, or -1 if D cannot be reached.",
    scenario: "A logistics planner wants the quickest route for an autonomous delivery bot through streets with closed roads.",
    inputFormat: "Line 1: integers R and C, the grid size.\nNext R lines: a string of C characters.",
    outputFormat: "One integer: the fewest moves, or -1.",
    constraints: "1 ≤ R, C ≤ 500\nThe grid contains exactly one S and exactly one D.",
    notes: "Every move costs 1, so breadth-first search finds the shortest path.",
    examples: [
      { input: "3 4\nS..#\n.#..\n...D", explanation: "One shortest route is down, down, right, right, right: 5 moves." },
      { input: "2 3\nS#D\n.#.", explanation: "The wall of # separates S from D: -1." },
      { input: "1 2\nSD", explanation: "D is adjacent to S: 1 move." },
    ],
    hidden: [
      { input: "1 3\nS.D", edge: true },
      { input: "3 3\nS##\n###\n##D", edge: true, label: "fully blocked" },
      { input: "4 4\nS...\n.##.\n.#D.\n....", label: "detour around obstacles" },
      { input: bigGrid, edge: true, label: "400×400 grid" },
    ],
    hints: ["Treat each free cell as a node connected to its four neighbours.", "All edges have equal cost, so use breadth-first search from S and record each cell's distance.", "Use a queue; when you pop D, its recorded distance is the answer. If the queue empties first, print -1."],
    ref: `from collections import deque
r, c = map(int, input().split())
grid = [input() for _ in range(r)]
for i in range(r):
    for j in range(c):
        if grid[i][j] == "S":
            start = (i, j)
dist = {start: 0}
queue = deque([start])
answer = -1
while queue:
    i, j = queue.popleft()
    if grid[i][j] == "D":
        answer = dist[(i, j)]
        break
    for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ni, nj = i + di, j + dj
        if 0 <= ni < r and 0 <= nj < c and grid[ni][nj] != "#" and (ni, nj) not in dist:
            dist[(ni, nj)] = dist[(i, j)] + 1
            queue.append((ni, nj))
print(answer)`,
    solution: {
      explanation: "Breadth-first search explores cells in order of distance from S, so the first time it reaches D is by a shortest path.",
      approach: "Queue of cells plus a distance table that doubles as the visited set.",
      algorithm: "Push S with distance 0. Repeatedly pop a cell; if it is D stop; otherwise push each unvisited, in-bounds, unblocked neighbour with distance + 1.",
      timeComplexity: "O(R·C)", spaceComplexity: "O(R·C)",
      alternative: "Bidirectional BFS or A* with the Manhattan heuristic can explore fewer cells on big open grids.",
      edgeCases: "S next to D, D walled off (-1), a one-row grid.",
      lineByLine: [
        "Line 1: import a double-ended queue — pop from the front in O(1).", "Line 2: read the grid size.", "Line 3: read the grid rows.",
        "Lines 4-7: scan the grid to find the start cell S.", "Line 8: the start has distance 0 (and is marked visited by being in the table).", "Line 9: the queue holds cells waiting to be explored.",
        "Line 10: answer defaults to -1 (unreachable).", "Lines 11-12: take the oldest cell from the queue.", "Lines 13-15: reaching D means its distance is the shortest — stop.",
        "Line 16: try the four directions.", "Lines 17-19: neighbour must be inside the grid, not a wall, and not yet visited.", "Lines 20-21: record its distance and queue it.", "Line 22: print the result.",
      ],
    },
  },
  {
    slug: "minimum-shipping-capacity", title: "Minimum Shipping Capacity", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Binary Search on Answer",
    style: "Product Company Style", tags: ["binary-search", "greedy", "optimization"], minutes: 25,
    statement: "Packages must be shipped in the given order. Each day the truck loads consecutive packages without exceeding its weight capacity, and anything left waits for the next day. Find the smallest capacity that lets all packages be shipped within D days.",
    scenario: "A courier company chooses the smallest truck class that still meets its delivery deadline.",
    inputFormat: "Line 1: integers N and D.\nLine 2: N integers, the package weights in order.",
    outputFormat: "One integer: the minimum truck capacity.",
    constraints: "1 ≤ D ≤ N ≤ 5·10^4\n1 ≤ weight ≤ 500",
    notes: "The capacity must be at least the heaviest package. Packages cannot be reordered or split.",
    examples: [
      { input: "10 5\n1 2 3 4 5 6 7 8 9 10", explanation: "Capacity 15 works: [1 2 3 4 5] [6 7] [8] [9] [10]. Anything smaller needs a sixth day." },
      { input: "3 3\n3 2 2", explanation: "One package per day, so capacity is the heaviest package: 3." },
      { input: "3 1\n5 5 5", explanation: "Everything in one day: capacity 15." },
    ],
    hidden: [
      { input: "1 1\n7", edge: true },
      { input: "5 2\n1 1 1 1 10", edge: true, label: "heaviest package dominates" },
      { input: "6 3\n7 2 5 10 8 1" },
      { input: bigShip, edge: true, label: "50000 packages" },
    ],
    hints: ["If capacity C works, any larger capacity also works — that monotonic behaviour suggests binary search.", "The answer lies between the heaviest single package and the total weight.", "To test a capacity, greedily load packages and count days; accept it if days ≤ D."],
    ref: `n, days = map(int, input().split())
w = list(map(int, input().split()))
lo, hi = max(w), sum(w)
while lo < hi:
    mid = (lo + hi) // 2
    used, load = 1, 0
    for x in w:
        if load + x > mid:
            used += 1
            load = 0
        load += x
    if used <= days:
        hi = mid
    else:
        lo = mid + 1
print(lo)`,
    solution: {
      explanation: "Binary search the capacity; for each candidate, greedily simulate the loading to count days.",
      approach: "Feasibility is monotonic in capacity, and greedy loading (fill the day as much as possible) minimises days for a fixed capacity.",
      algorithm: "lo = max weight, hi = total. While lo < hi: test mid; if feasible hi = mid, else lo = mid + 1.",
      timeComplexity: "O(N log(sum of weights))", spaceComplexity: "O(1)",
      alternative: "Dynamic programming over (package, day) gives the same answer in O(N²·D), far too slow here.",
      edgeCases: "One package, D = 1, D = N, one very heavy package.",
      lineByLine: [
        "Line 1: read package count and day limit.", "Line 2: read the weights.", "Line 3: smallest possible capacity is the heaviest package; the largest needed is everything at once.",
        "Line 4: keep searching while the range has more than one value.", "Line 5: try the middle capacity.", "Line 6: we start on day 1 with an empty truck.", "Lines 7-10: if the next package does not fit, start a new day; then load it.",
        "Lines 11-12: this capacity works in time, so a smaller one might too.", "Lines 13-14: too many days — we need more capacity.", "Line 15: the range has closed on the minimum capacity.",
      ],
    },
  },
  {
    slug: "fewest-notes-for-amount", title: "Fewest Notes for an Amount", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Dynamic Programming",
    style: "Service Company Style", tags: ["dynamic-programming", "coin-change", "banking"], minutes: 25,
    statement: "An ATM has unlimited notes of several denominations. Given the denominations and an amount, find the smallest number of notes that add up to exactly that amount, or -1 if it is impossible.",
    scenario: "A cash-dispensing machine wants to hand out as few notes as possible. A greedy 'largest note first' strategy fails for some denomination sets, so the dispenser needs the true minimum.",
    inputFormat: "Line 1: integers K and A — the number of denominations and the amount.\nLine 2: K distinct positive integers, the denominations.",
    outputFormat: "One integer: the minimum number of notes, or -1.",
    constraints: "1 ≤ K ≤ 20\n1 ≤ denomination ≤ 10^4\n0 ≤ A ≤ 10^4",
    notes: "For A = 0 the answer is 0. With denominations 1, 3, 4 and amount 6 the best is 3 + 3 (2 notes), not 4 + 1 + 1.",
    examples: [
      { input: "3 6\n1 3 4", explanation: "3 + 3 = 6 uses two notes; the greedy 4 + 1 + 1 would use three." },
      { input: "2 7\n2 4", explanation: "Only even amounts can be made: -1." },
      { input: "1 0\n5", explanation: "Zero rupees needs zero notes." },
    ],
    hidden: [
      { input: "1 1\n2", edge: true, label: "impossible" },
      { input: "3 11\n1 2 5" },
      { input: "3 63\n1 5 21", label: "greedy fails" },
      { input: bigCoin, edge: true, label: "large amount" },
    ],
    hints: ["Let best[a] be the fewest notes for amount a. What is best[0]?", "To make amount a, the last note is one of the denominations d ≤ a, so best[a] = 1 + min(best[a − d]).", "Use a large sentinel for 'impossible' and convert it to -1 at the end."],
    ref: `n, amount = map(int, input().split())
notes = list(map(int, input().split()))
INF = amount + 1
best = [0] + [INF] * amount
for a in range(1, amount + 1):
    for note in notes:
        if note <= a and best[a - note] + 1 < best[a]:
            best[a] = best[a - note] + 1
print(best[amount] if best[amount] != INF else -1)`,
    solution: {
      explanation: "Build the answer for every amount from 0 up to A, reusing smaller answers.",
      approach: "Classic unbounded coin-change DP: the best way to make a is one note plus the best way to make the remainder.",
      algorithm: "best[0] = 0; for a in 1..A, best[a] = min over notes d ≤ a of best[a − d] + 1.",
      timeComplexity: "O(A·K)", spaceComplexity: "O(A)",
      alternative: "Breadth-first search over amounts also works and stops early, but is harder to explain.",
      edgeCases: "A = 0, unreachable amounts, denominations larger than A, sets where greedy is wrong.",
      lineByLine: [
        "Line 1: read the number of denominations and the target amount.", "Line 2: read the denominations.", "Line 3: INF is any value larger than the true answer could be (each note is at least 1).",
        "Line 4: best[a] is the fewest notes for amount a; amount 0 needs 0 notes, the rest start as 'impossible'.", "Line 5: fill in amounts from small to large.", "Line 6: try each note as the last note used.",
        "Lines 7-8: if it fits and improves the best count, record 1 + best[a − note].", "Line 9: print the answer, or -1 if still impossible.",
      ],
    },
  },
  {
    slug: "merge-meeting-slots", title: "Merge Overlapping Meeting Slots", difficulty: "MEDIUM", topic: "Algorithms", subtopic: "Sorting and Intervals",
    style: "Startup Style", tags: ["sorting", "intervals", "scheduling"], minutes: 20,
    statement: "A calendar app receives booked slots as [start, end] pairs in any order. Merge slots that overlap or touch (a slot that starts exactly when another ends is merged) and print the merged, non-overlapping slots in increasing order of start time.",
    scenario: "A scheduling assistant collapses a busy person's meetings into continuous 'busy blocks' to show free time.",
    inputFormat: "Line 1: integer N.\nNext N lines: two integers S and E (S ≤ E), the start and end times.",
    outputFormat: "One line per merged slot: start and end separated by a space.",
    constraints: "1 ≤ N ≤ 10^5\n0 ≤ S ≤ E ≤ 10^9",
    notes: "Slots are not given in sorted order. Touching slots such as [1,3] and [3,5] merge into [1,5].",
    examples: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", explanation: "[1,3] and [2,6] overlap and merge to [1,6]; the others stand alone." },
      { input: "2\n1 4\n4 5", explanation: "They touch at 4, so they merge to [1,5]." },
      { input: "3\n9 10\n1 2\n5 6", explanation: "Unsorted input, no overlaps — print sorted." },
    ],
    hidden: [
      { input: "1\n5 5", edge: true, label: "zero-length slot" },
      { input: "3\n1 10\n2 3\n4 5", edge: true, label: "one slot contains the others" },
      { input: "5\n6 8\n1 9\n2 4\n4 7\n10 12" },
      { input: `100000\n${range(100000, (i) => `${(i * 7) % 99991} ${((i * 7) % 99991) + (i % 3)}`).join("\n")}`, edge: true, label: "100000 slots" },
    ],
    hints: ["Order matters: first sort the slots by start time.", "Walk through the sorted slots keeping the last merged slot.", "If the next slot starts at or before the last merged end, extend the end with max(); otherwise begin a new merged slot."],
    ref: `n = int(input())
slots = sorted(tuple(map(int, input().split())) for _ in range(n))
merged = [list(slots[0])]
for s, e in slots[1:]:
    if s <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], e)
    else:
        merged.append([s, e])
for s, e in merged:
    print(s, e)`,
    solution: {
      explanation: "After sorting by start, overlapping slots are neighbours, so one left-to-right pass can merge them.",
      approach: "Maintain the current merged slot; absorb the next slot if it starts no later than the current end.",
      algorithm: "Sort by start. For each slot: if start ≤ lastEnd then lastEnd = max(lastEnd, end) else append a new slot.",
      timeComplexity: "O(N log N)", spaceComplexity: "O(N)",
      alternative: "A difference array works only when times are small; here they reach 10^9.",
      edgeCases: "Zero-length slots, a slot that contains many others, touching slots.",
      lineByLine: [
        "Line 1: read the number of slots.", "Line 2: read all slots and sort them by start time.", "Line 3: begin with the first slot as the current merged slot.",
        "Line 4: examine the remaining slots in order.", "Line 5: if it starts before or exactly when the current slot ends, they overlap or touch.", "Line 6: extend the current slot's end if this slot reaches further.",
        "Lines 7-8: otherwise it is a separate busy block — start a new one.", "Lines 9-10: print each merged block.",
      ],
    },
  },
  {
    slug: "search-typo-edit-distance", title: "Search Suggestion Typo Cost", difficulty: "HARD", topic: "Algorithms", subtopic: "Dynamic Programming on Strings",
    style: "AI/ML Style", tags: ["dynamic-programming", "strings", "search"], minutes: 35,
    statement: "A search box suggests corrections by measuring how different the typed word is from a dictionary word. The typo cost is the minimum number of single-character operations needed to turn the first word into the second: insert a character, delete a character, or replace a character.\n\nPrint the minimum cost.",
    scenario: "A search engine ranks 'did you mean…' suggestions by typo cost so that 'recieve' ranks 'receive' first.",
    inputFormat: "Line 1: the typed word.\nLine 2: the dictionary word.\nEither line may be empty.",
    outputFormat: "One integer: the minimum number of operations.",
    constraints: "0 ≤ length of each word ≤ 1500, lowercase letters",
    notes: "Insert, delete and replace each cost 1. Swapping two neighbouring letters therefore costs 2.",
    examples: [
      { input: "kitten\nsitting", explanation: "kitten → sitten (replace k) → sittin (replace e) → sitting (insert g): 3 operations." },
      { input: "abc\nabc", explanation: "Identical words need no operations." },
      { input: "abc\n", explanation: "Deleting three characters turns 'abc' into the empty word: 3." },
    ],
    hidden: [
      { input: "\n", edge: true, label: "both empty" },
      { input: "\nabcd", edge: true },
      { input: "intention\nexecution" },
      { input: "recieve\nreceive" },
      { input: bigEdit, edge: true, label: "1200 × 1200 characters" },
    ],
    hints: ["Define dp[i][j] as the cost of turning the first i characters of A into the first j characters of B.", "If the last characters match, dp[i][j] = dp[i−1][j−1]; otherwise take 1 + the cheapest of replace, delete or insert.", "Each row only needs the previous row, so you can keep two rows of length |B|+1 for O(|B|) memory."],
    ref: `a = input()
b = input()
prev = list(range(len(b) + 1))
for i in range(1, len(a) + 1):
    cur = [i] + [0] * len(b)
    for j in range(1, len(b) + 1):
        cost = 0 if a[i - 1] == b[j - 1] else 1
        cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    prev = cur
print(prev[len(b)])`,
    solution: {
      explanation: "A table of prefix-to-prefix costs; each cell is built from its three neighbours.",
      approach: "dp[i][j] = min(delete: dp[i−1][j] + 1, insert: dp[i][j−1] + 1, replace/match: dp[i−1][j−1] + (a[i] ≠ b[j])).",
      algorithm: "Initialise row 0 as 0..|B| (all insertions). For each i compute a new row from the previous one. The answer is the last cell.",
      timeComplexity: "O(|A|·|B|)", spaceComplexity: "O(|B|)",
      alternative: "Hirschberg's algorithm also recovers the actual edit script in linear space; bit-parallel Myers' algorithm is faster for long words.",
      edgeCases: "Empty words (cost = length of the other word), identical words, completely different words.",
      lineByLine: [
        "Lines 1-2: read the typed word and the dictionary word.", "Line 3: with 0 characters of A, turning it into j characters of B needs j insertions.",
        "Line 4: go through the characters of A one at a time.", "Line 5: the first cell of the new row is i — i deletions to reach the empty prefix of B.",
        "Line 6: fill the rest of the row for each prefix of B.", "Line 7: replacing costs 0 when the characters already match, 1 otherwise.",
        "Line 8: take the cheapest of delete, insert or replace/match.", "Line 9: the new row becomes the previous row for the next character.", "Line 10: the last cell is the answer.",
      ],
    },
  },
  {
    slug: "build-pipeline-order", title: "Build Pipeline Order", difficulty: "HARD", topic: "Algorithms", subtopic: "Topological Sort",
    style: "Backend Developer Style", tags: ["graphs", "topological-sort", "heap", "devops"], minutes: 35,
    statement: "A CI system must build N modules, numbered 1..N. Some modules depend on others: a line 'A B' means module A must be built before module B. Print a valid build order. If several orders are valid, print the lexicographically smallest one (compare as sequences of numbers). If the dependencies contain a cycle, print CYCLE.",
    scenario: "A monorepo build tool schedules module builds deterministically so that every run on every machine uses the same order.",
    inputFormat: "Line 1: integers N and M.\nNext M lines: integers A and B meaning A must come before B.",
    outputFormat: "N space-separated module numbers, or CYCLE.",
    constraints: "1 ≤ N ≤ 2·10^4\n0 ≤ M ≤ 10^5\nA module that depends on itself counts as a cycle.",
    notes: "'Lexicographically smallest' means: at every step, among all modules that are ready to build, pick the smallest number.",
    examples: [
      { input: "4 3\n1 2\n1 3\n3 4", explanation: "Start with 1; then 2 and 3 are ready — take 2, then 3, then 4. Order: 1 2 3 4." },
      { input: "3 2\n3 1\n2 1", explanation: "1 needs both 2 and 3 first; 2 comes before 3. Order: 2 3 1." },
      { input: "2 2\n1 2\n2 1", explanation: "Each needs the other: CYCLE." },
    ],
    hidden: [
      { input: "1 0", edge: true, label: "single module" },
      { input: "3 1\n2 2", edge: true, label: "self dependency" },
      { input: "5 0", edge: true, label: "no dependencies" },
      { input: "6 6\n6 5\n5 4\n4 3\n3 2\n2 1\n1 6", label: "cycle of length 6" },
      { input: bigDag, edge: true, label: "chain of 20000 modules" },
    ],
    hints: ["Count, for every module, how many unbuilt modules it still waits for (its in-degree).", "Modules with in-degree 0 are ready. Building one lowers the in-degree of the modules that depend on it.", "Keep the ready modules in a min-heap so you always pick the smallest. If you finish without placing all N modules, there is a cycle."],
    ref: `import heapq
n, m = map(int, input().split())
adj = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for _ in range(m):
    a, b = map(int, input().split())
    adj[a].append(b)
    indeg[b] += 1
heap = [v for v in range(1, n + 1) if indeg[v] == 0]
heapq.heapify(heap)
order = []
while heap:
    v = heapq.heappop(heap)
    order.append(v)
    for w in adj[v]:
        indeg[w] -= 1
        if indeg[w] == 0:
            heapq.heappush(heap, w)
print(" ".join(map(str, order)) if len(order) == n else "CYCLE")`,
    solution: {
      explanation: "Kahn's topological sort with a min-heap instead of a plain queue, which gives the smallest valid order and detects cycles.",
      approach: "A module is ready once all its prerequisites are built. Repeatedly build the smallest ready module and release the ones that were waiting on it.",
      algorithm: "Compute in-degrees; push all in-degree-0 modules into a min-heap; pop the smallest, append it, decrement its dependants and push any that reach 0. If fewer than N modules were output, a cycle exists.",
      timeComplexity: "O((N + M) log N)", spaceComplexity: "O(N + M)",
      alternative: "DFS-based topological sort detects cycles too, but producing the lexicographically smallest order is much easier with Kahn's algorithm and a heap.",
      edgeCases: "No edges, a self-dependency, a long chain, multiple valid orders, cycles that do not include every module.",
      lineByLine: [
        "Line 1: import the heap (priority queue) module.", "Line 2: read the number of modules and dependencies.", "Line 3: adj[a] lists the modules that wait for a.", "Line 4: indeg[b] counts how many prerequisites b still waits for.",
        "Lines 5-8: read each 'A before B' rule, record the edge and bump B's waiting count.", "Line 9: modules waiting for nothing are ready.", "Line 10: turn the ready list into a min-heap.", "Line 11: the final order starts empty.",
        "Lines 12-14: always build the smallest ready module.", "Lines 15-17: tell its dependants one prerequisite is done; if they now wait for nothing, they are ready.", "Line 18: if every module was placed print the order, otherwise a cycle blocked some modules.",
      ],
    },
  },
  {
    slug: "max-profit-k-trades", title: "Maximum Profit with K Trades", difficulty: "HARD", topic: "Algorithms", subtopic: "Dynamic Programming (State Machine)",
    style: "Product Company Style", tags: ["dynamic-programming", "finance", "optimization"], minutes: 40,
    statement: "You know the price of a stock for N consecutive days. You may complete at most K trades, where one trade is buying one share on some day and selling it on a later day. You must sell before you buy again, and you can hold at most one share at a time.\n\nPrint the maximum profit you can make (0 if no profitable trade exists).",
    scenario: "A back-testing tool measures the best-case profit of a strategy that is limited to K round trips because each trade carries a fixed brokerage fee.",
    inputFormat: "Line 1: integers K and N.\nLine 2: N integers, the daily prices.",
    outputFormat: "One integer: the maximum profit.",
    constraints: "0 ≤ K ≤ 100\n1 ≤ N ≤ 2000\n1 ≤ price ≤ 10^4",
    notes: "If K is large enough (at least N/2) the limit does not matter and you can simply collect every upward move.",
    examples: [
      { input: "2 6\n3 2 6 5 0 3", explanation: "Buy at 2, sell at 6 (profit 4); buy at 0, sell at 3 (profit 3). Total 7." },
      { input: "1 5\n7 1 5 3 6", explanation: "With one trade: buy at 1, sell at 6 for profit 5." },
      { input: "2 4\n7 6 4 3", explanation: "Prices only fall: no profitable trade, profit 0." },
    ],
    hidden: [
      { input: "0 3\n1 2 3", edge: true, label: "K = 0" },
      { input: "5 1\n10", edge: true, label: "single day" },
      { input: "100 6\n1 2 3 4 5 6", edge: true, label: "K larger than needed" },
      { input: "3 9\n5 11 3 50 60 90 1 20 4" },
      { input: bigTrades, edge: true, label: "2000 days, K = 50" },
    ],
    hints: ["Think of each trade count t as having two states: holding a share, or not holding one.", "hold[t] = best money while holding after starting the t-th trade; free[t] = best money after finishing t trades.", "For each price p and each t: hold[t] = max(hold[t], free[t−1] − p) and free[t] = max(free[t], hold[t] + p). Handle huge K separately by summing all increases."],
    ref: `k, n = map(int, input().split())
prices = list(map(int, input().split()))
if k >= n // 2:
    print(sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n)))
else:
    hold = [float("-inf")] * (k + 1)
    free = [0] * (k + 1)
    for p in prices:
        for t in range(1, k + 1):
            hold[t] = max(hold[t], free[t - 1] - p)
            free[t] = max(free[t], hold[t] + p)
    print(free[k])`,
    solution: {
      explanation: "A small state machine per trade count: 'holding' and 'not holding'. Each day updates both states.",
      approach: "hold[t] is the best cash balance while holding a share bought as the t-th trade; free[t] is the best balance with t trades completed. When K ≥ N/2 the limit never binds, so collect every rise.",
      algorithm: "For each price, for each t in 1..K: hold[t] = max(hold[t], free[t−1] − p); free[t] = max(free[t], hold[t] + p). Answer free[K].",
      timeComplexity: "O(N·K)", spaceComplexity: "O(K)",
      alternative: "A table dp[t][day] is easier to read but uses O(N·K) memory; the rolling version here is the same recurrence with the day dimension removed.",
      edgeCases: "K = 0, N = 1, strictly falling prices, K much larger than N.",
      lineByLine: [
        "Line 1: read the trade limit and number of days.", "Line 2: read the daily prices.", "Lines 3-4: if K ≥ N/2, trades are effectively unlimited — add up every day-to-day rise.",
        "Line 6: hold[t] starts impossible (−∞): we own nothing yet.", "Line 7: free[t] starts at 0 profit.", "Line 8: process the days in order.", "Line 9: for each trade count t.",
        "Line 10: either keep what we hold, or buy today using the profit from t−1 finished trades.", "Line 11: either keep our profit, or sell today what we hold.", "Line 12: after all days, free[K] is the best profit with at most K trades.",
      ],
    },
  },
];
