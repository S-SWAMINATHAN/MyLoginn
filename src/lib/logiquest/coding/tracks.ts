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
];

export const TRACK_BY_SLUG = new Map(TRACKS.map((t) => [t.slug, t]));

export const CODE_XP = { Easy: 20, Medium: 40, Hard: 60 } as const;
