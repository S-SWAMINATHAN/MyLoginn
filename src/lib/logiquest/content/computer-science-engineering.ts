import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const T = (intro: string, items: RawQ[]) => topic(items, { intro });

const subject: RawSubject = {
  "theory-of-computation": T("Theory of computation studies automata, formal languages and what can be computed.", [
    m("Regular languages are recognised by:", ["Finite automata", "Pushdown automata only", "Turing machines only", "Linear bounded automata only"], "Every regular language has a DFA."),
    m("Context-free languages are recognised by:", ["Pushdown automata", "Finite automata", "Mealy machines", "Moore machines"], "A PDA has a stack."),
    m("The language {aⁿbⁿ | n ≥ 0} is:", ["Context-free but not regular", "Regular", "Not context-free", "Finite"], "A finite automaton cannot count unbounded a's."),
    m("The halting problem is:", ["Undecidable", "Decidable in polynomial time", "Regular", "Solvable by a DFA"], "Turing proved no algorithm can decide it for all programs."),
    m("Every NFA can be converted into an equivalent:", ["DFA", "PDA only", "Turing machine only", "Regular grammar only"], "By the subset construction (possibly with exponentially many states)."),
    m2("A DFA with n states over alphabet Σ has how many transitions?", ["n × |Σ|", "n²", "n + |Σ|", "2ⁿ"], "Exactly one transition per state per symbol."),
  ]),
  "compiler-design": T("A compiler translates source code through phases: lexical, syntax and semantic analysis, intermediate code, optimisation and code generation.", [
    m("The lexical analyser produces:", ["Tokens", "Parse trees", "Machine code", "Object files"], "Lex/Flex generate lexical analysers."),
    m("Syntax analysis is also called:", ["Parsing", "Scanning", "Linking", "Loading"], "Parsers build parse trees from tokens."),
    m("Which parser is the most powerful among these?", ["Canonical LR (CLR)", "LR(0)", "SLR", "LL(1)"], "Power: LR(0) < SLR < LALR < CLR."),
    m("Yacc generates:", ["LALR parsers", "Lexical analysers", "Assemblers", "Linkers"], "Yet Another Compiler-Compiler."),
    m("Three-address code is a form of:", ["Intermediate representation", "Machine code", "Source code", "Tokens"], "Each instruction has at most three operands."),
    m("Left recursion must be removed for:", ["Top-down (LL) parsers", "Bottom-up parsers", "Lexers", "Linkers"], "It causes infinite recursion in recursive descent."),
  ]),
  "computer-organization-and-architecture": T("Computer organisation and architecture covers CPU design, instruction sets, pipelining, memory hierarchy and I/O.", [
    m("Pipelining improves:", ["Instruction throughput", "The latency of a single instruction", "Memory size", "Clock voltage"], "Multiple instructions overlap in different stages."),
    m("A data hazard in a pipeline occurs when:", ["An instruction depends on the result of a previous instruction still in the pipeline", "Two instructions use different registers", "Memory is full", "The clock stops"], "Forwarding and stalls resolve it."),
    m("RISC processors typically have:", ["Simple, fixed-length instructions and many registers", "Complex variable-length instructions", "No registers", "Microcode for every instruction"], "CISC has complex instructions."),
    m("Cache hit ratio is:", ["Hits / total memory accesses", "Misses / hits", "Cache size / RAM size", "Access time / cycle time"], "Higher hit ratio means faster average access."),
    m("In the von Neumann architecture:", ["Instructions and data share the same memory", "Instructions and data have separate memories", "There is no memory", "Only data is stored"], "Harvard architecture separates them."),
    m2("A cache has a hit time of 2 ns, a miss penalty of 50 ns and a hit ratio of 0.9. The average memory access time is:", ["7 ns", "5 ns", "52 ns", "45 ns"], "AMAT = hit time + miss rate × miss penalty = 2 + 0.1 × 50 = 7 ns.", { check: "2+0.1*50" }),
  ]),
  "design-and-analysis-of-algorithms": T("Algorithm design techniques include divide and conquer, greedy, dynamic programming, backtracking and branch and bound.", [
    m("Merge sort uses which design technique?", ["Divide and conquer", "Greedy", "Dynamic programming", "Backtracking"], "Divide, solve recursively, combine."),
    m("Dijkstra's algorithm is an example of a:", ["Greedy algorithm", "Divide and conquer algorithm", "Backtracking algorithm", "Brute force algorithm"], "It picks the nearest unvisited vertex each step."),
    m("The 0/1 knapsack problem is solved optimally by:", ["Dynamic programming", "A greedy algorithm", "Binary search", "Sorting only"], "The fractional knapsack can be solved greedily."),
    m("The N-Queens problem is typically solved with:", ["Backtracking", "Greedy choice", "Divide and conquer", "Hashing"], "Place queens and undo when a conflict arises."),
    m("P vs NP asks whether:", ["Every problem whose solution can be verified quickly can also be solved quickly", "All problems are solvable", "Polynomials are NP", "Sorting is hard"], "It is one of the biggest open problems in computer science."),
    m("Floyd–Warshall computes:", ["All-pairs shortest paths", "Minimum spanning trees", "Single-source shortest paths only", "Topological order"], "It runs in O(V³)."),
  ]),
  "discrete-mathematics": T("Discrete mathematics covers logic, sets, relations, functions, combinatorics and graph theory.", [
    m("The contrapositive of 'If P then Q' is:", ["If not Q then not P", "If Q then P", "If not P then not Q", "P and not Q"], "A statement and its contrapositive are logically equivalent."),
    m2("How many subsets does a set with 5 elements have?", ["32", "25", "10", "5"], "2⁵ = 32 subsets (including the empty set).", { check: "2**5" }),
    m("A relation that is reflexive, symmetric and transitive is an:", ["Equivalence relation", "Partial order", "Function", "Total order"], "A partial order is reflexive, antisymmetric and transitive."),
    m("A function that is both one-to-one and onto is:", ["Bijective", "Injective only", "Surjective only", "Constant"], "Bijections have inverses."),
    m("A tautology is a statement that is:", ["Always true", "Always false", "Sometimes true", "Undefined"], "A contradiction is always false."),
    m("A graph with an Euler circuit has all vertices of:", ["Even degree (and is connected)", "Odd degree", "Degree 1", "Degree 0"], "Euler's theorem."),
  ]),
  "computer-graphics": T("Computer graphics covers drawing algorithms, transformations, clipping, projections and rendering.", [
    m("Bresenham's algorithm is used to draw:", ["Lines (and circles) using integer arithmetic", "3D models", "Textures", "Shadows"], "It avoids floating-point calculations."),
    m("A 2D rotation transformation preserves:", ["Shape and size", "Only position", "Only colour", "Nothing"], "Rotation, translation and reflection are rigid transformations."),
    m("Homogeneous coordinates allow translation to be represented as:", ["Matrix multiplication", "Addition only", "A table lookup", "Division"], "A 2D point (x, y) becomes (x, y, 1)."),
    m("The Cohen–Sutherland algorithm is used for:", ["Line clipping", "Polygon filling", "Shading", "Hidden-surface removal"], "It uses region outcodes."),
    m("The z-buffer algorithm is used for:", ["Hidden-surface removal", "Line drawing", "Clipping", "Colour mixing"], "It keeps the nearest depth per pixel."),
  ]),
};
export default subject;
