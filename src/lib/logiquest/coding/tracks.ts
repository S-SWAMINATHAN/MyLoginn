/** HackerRank-style "Practice Skills" tracks. Every problem belongs to one or more tracks. */
export type Track = { slug: string; title: string; desc: string; icon: string };

export const TRACKS: Track[] = [
  { slug: "algorithms", title: "Algorithms", desc: "Sorting, searching, greedy, recursion, dynamic programming and more.", icon: "algorithm" },
  { slug: "data-structures", title: "Data Structures", desc: "Arrays, strings, stacks, queues, hash maps, trees and graphs.", icon: "structure" },
  { slug: "mathematics", title: "Mathematics", desc: "Number theory, combinatorics, geometry and arithmetic puzzles.", icon: "math" },
  { slug: "python", title: "Python", desc: "Idiomatic Python: strings, lists, dictionaries, comprehensions.", icon: "python" },
  { slug: "javascript", title: "JavaScript", desc: "Problem solving with modern JavaScript.", icon: "javascript" },
  { slug: "sql", title: "SQL", desc: "Write queries: filtering, joins, grouping, subqueries and window functions.", icon: "sql" },
  { slug: "strings", title: "Strings", desc: "Parsing, palindromes, anagrams and text processing.", icon: "strings" },
  { slug: "problem-solving", title: "Problem Solving", desc: "Interview-style challenges that combine several ideas.", icon: "puzzle" },
  { slug: "arrays", title: "Arrays", desc: "Traversal, prefix sums, two pointers and sliding windows.", icon: "structure" },
  { slug: "sorting-and-searching", title: "Sorting & Searching", desc: "Sorting by keys, binary search and searching answers.", icon: "algorithm" },
  { slug: "hashing", title: "Hashing", desc: "Counting, grouping and fast lookups with maps and sets.", icon: "structure" },
  { slug: "stacks-and-queues", title: "Stacks & Queues", desc: "Brackets, monotonic stacks, queues and deques.", icon: "structure" },
  { slug: "recursion-and-backtracking", title: "Recursion & Backtracking", desc: "Subsets, permutations, puzzles and divide and conquer.", icon: "algorithm" },
  { slug: "dynamic-programming", title: "Dynamic Programming", desc: "Knapsack, paths, sequences, partitions and counting.", icon: "algorithm" },
  { slug: "greedy", title: "Greedy", desc: "Locally optimal choices: intervals, scheduling and exchange.", icon: "algorithm" },
  { slug: "graphs-and-trees", title: "Graphs & Trees", desc: "BFS, DFS, shortest paths, components and tree queries.", icon: "structure" },
  { slug: "matrices", title: "Matrices", desc: "Grids, rotations, spirals and 2-D prefix sums.", icon: "math" },
  { slug: "bit-manipulation", title: "Bit Manipulation", desc: "Binary tricks with AND, OR, XOR and shifts.", icon: "math" },
  { slug: "number-theory", title: "Number Theory", desc: "Primes, divisors, GCD, modular arithmetic and bases.", icon: "math" },
  { slug: "implementation", title: "Implementation", desc: "Simulations and everyday programs, done carefully.", icon: "puzzle" },
];

export const TRACK_BY_SLUG = new Map(TRACKS.map((t) => [t.slug, t]));

export const CODE_XP = { Easy: 20, Medium: 40, Hard: 60 } as const;
