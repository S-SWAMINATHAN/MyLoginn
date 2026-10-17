import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";
import { dsGenerated as G } from "./technical/generated";

const arrays: RawQ[] = [
  m("What is the time complexity of accessing an element of an array by index?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "The address is computed directly from the base address and index."),
  m("Inserting an element at the beginning of an array of n elements takes:", ["O(n)", "O(1)", "O(log n)", "O(n log n)"], "All existing elements must shift one place."),
  m2("For a 2D array A[10][20] stored in row-major order with base address 1000 and 4-byte elements, what is the address of A[2][5] (0-based)?", ["1180", "1100", "1160", "1220"], "Address = base + (row × columns + column) × size = 1000 + (2 × 20 + 5) × 4 = 1180.", { check: "1000+(2*20+5)*4" }),
  m("Which data structure stores elements of the same type in contiguous memory?", ["Array", "Linked list", "Tree", "Graph"], "Contiguity gives O(1) indexing."),
  m("A dynamic array (like Python's list or Java's ArrayList) achieves amortised O(1) append by:", ["Doubling its capacity when it is full", "Allocating one extra slot each time", "Using a linked list internally", "Sorting on every insert"], "Occasional O(n) resizes are spread over many cheap appends."),
  m("Which problem is efficiently solved with the two-pointer technique on a sorted array?", ["Finding a pair with a given sum", "Matrix multiplication", "Graph colouring", "Huffman coding"], "Move the left or right pointer depending on whether the sum is too small or too large."),
];

const linkedLists: RawQ[] = [
  m("Each node of a singly linked list contains:", ["Data and a pointer to the next node", "Data only", "Two pointers only", "An index"], "Doubly linked list nodes also point to the previous node."),
  m("Inserting a node at the head of a singly linked list takes:", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "Only the head pointer and the new node's next pointer change."),
  m("Accessing the k-th element of a linked list takes:", ["O(k)", "O(1)", "O(log k)", "O(1) with a tail pointer"], "Nodes must be traversed from the head."),
  m("In a circular linked list:", ["The last node points back to the first node", "There is no head", "Nodes are stored in an array", "Each node has three pointers"], "Traversal can start anywhere and loop around."),
  m("Which algorithm detects a cycle in a linked list using O(1) extra space?", ["Floyd's tortoise and hare (slow and fast pointers)", "Binary search", "Dijkstra's algorithm", "Merge sort"], "If the fast pointer meets the slow pointer, there is a cycle."),
  m2("The advantage of a doubly linked list over a singly linked list is:", ["A node can be deleted in O(1) given only a pointer to it, and traversal works both ways", "It uses less memory", "Faster random access", "It never needs a head pointer"], "Each node knows its predecessor."),
  m("Which is a disadvantage of linked lists compared with arrays?", ["No random access and extra memory for pointers", "Fixed size", "Costly insertion at the head", "They cannot store integers"], "Linked lists trade random access for flexible size and cheap insertions."),
];

const stacks: RawQ[] = [
  m("A stack follows which order?", ["LIFO (last in, first out)", "FIFO", "Random", "Priority"], "push and pop operate on the top."),
  m("Which application uses a stack?", ["Function call management and recursion", "Printer job scheduling", "Breadth-first search", "CPU round-robin scheduling"], "The call stack stores return addresses and local variables."),
  m("Checking balanced parentheses in an expression typically uses a:", ["Stack", "Queue", "Heap", "Graph"], "Push opening brackets and pop on matching closing brackets."),
  m("Popping from an empty stack causes:", ["Stack underflow", "Stack overflow", "A memory leak", "A deadlock"], "Pushing onto a full (fixed-size) stack causes overflow."),
];

const queues: RawQ[] = [
  m("A queue follows which order?", ["FIFO (first in, first out)", "LIFO", "Random", "Sorted"], "Elements are added at the rear and removed from the front."),
  m("Breadth-first search uses a:", ["Queue", "Stack", "Heap", "Hash table"], "Nodes are explored level by level."),
  m("In a circular queue of size n implemented with an array, the rear moves using:", ["rear = (rear + 1) % n", "rear = rear + 1 always", "rear = n − rear", "rear = rear × 2"], "Wrapping around reuses free slots at the front."),
  m("A deque allows insertion and deletion at:", ["Both ends", "Only the front", "Only the rear", "Only the middle"], "Double-ended queue."),
  m("Which queue serves elements in order of priority rather than arrival?", ["Priority queue", "Circular queue", "Deque", "Simple queue"], "Usually implemented with a heap."),
  m("How many stacks are needed to implement a queue?", ["2", "1", "3", "4"], "One stack for enqueuing and one for dequeuing (reversing order when it is empty)."),
];

const trees: RawQ[] = [
  m("A tree with n nodes has how many edges?", ["n − 1", "n", "n + 1", "2n"], "Every node except the root has exactly one parent edge."),
  m("Which traversal visits nodes level by level?", ["Level-order (breadth-first)", "Inorder", "Preorder", "Postorder"], "Level order uses a queue."),
  m("A complete binary tree is stored efficiently in an array because:", ["For index i, children are at 2i + 1 and 2i + 2", "It has no leaves", "All nodes have one child", "It is always balanced by rotation"], "No gaps are needed; this is how heaps are stored."),
  m("Which traversal of an expression tree gives the postfix expression?", ["Postorder", "Inorder", "Preorder", "Level order"], "Preorder gives prefix; inorder gives infix."),
];

const bst: RawQ[] = [
  m("In a binary search tree, for every node:", ["Left subtree keys < node key < right subtree keys", "Left keys > node key", "All leaves are at the same level", "Each node has two children"], "This ordering allows binary search on the tree."),
  m("The worst-case search time in an unbalanced BST with n nodes is:", ["O(n)", "O(log n)", "O(1)", "O(n log n)"], "Inserting sorted keys produces a chain."),
  m("An AVL tree keeps the height difference of each node's subtrees at most:", ["1", "2", "0", "log n"], "Rotations restore balance after insertions and deletions."),
  m("Deleting a node with two children from a BST replaces it with its:", ["Inorder successor (or predecessor)", "Left child always", "Root", "Any leaf"], "This keeps the BST property."),
  m("Which self-balancing tree is used by many standard libraries' ordered maps?", ["Red-black tree", "Trie", "Segment tree", "Heap"], "e.g. Java's TreeMap and C++'s std::map."),
];

const heaps: RawQ[] = [
  m("In a max-heap, every parent is:", ["Greater than or equal to its children", "Smaller than its children", "Equal to its children", "Larger than all leaves only"], "The maximum element is at the root."),
  m("Inserting into a binary heap takes:", ["O(log n)", "O(1)", "O(n)", "O(n log n)"], "The new element sifts up along one path."),
  m("Building a heap from an unsorted array with bottom-up heapify takes:", ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], "Most nodes are near the bottom and sift down only a little."),
  m("Heap sort has worst-case time complexity:", ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], "n extractions of O(log n) each."),
  m2("For a heap stored in an array with 0-based indexing, the parent of the node at index 9 is at index:", ["4", "5", "3", "8"], "Parent = ⌊(i − 1)/2⌋ = ⌊8/2⌋ = 4.", { check: "(9-1)//2" }),
  m("Which application commonly uses a heap?", ["Priority queues and Dijkstra's algorithm", "Undo functionality", "Balanced parentheses", "Hash tables"], "Heaps give quick access to the minimum or maximum."),
];

const graphs: RawQ[] = [
  m("Which representation uses O(V²) space for a graph with V vertices?", ["Adjacency matrix", "Adjacency list", "Edge list", "Incidence list"], "An adjacency list uses O(V + E) space."),
  m("Which algorithm finds shortest paths from one source in a graph with non-negative weights?", ["Dijkstra's algorithm", "Kruskal's algorithm", "Prim's algorithm", "DFS"], "Kruskal and Prim find minimum spanning trees."),
  m("Which algorithm handles negative edge weights for single-source shortest paths?", ["Bellman–Ford", "Dijkstra", "Prim", "BFS"], "Bellman–Ford also detects negative cycles."),
  m("A minimum spanning tree of a connected graph with V vertices has how many edges?", ["V − 1", "V", "E", "V + 1"], "Every spanning tree of V vertices has V − 1 edges."),
  m("Topological sorting is possible only for a:", ["Directed acyclic graph (DAG)", "Undirected graph", "Graph with cycles", "Complete graph"], "A cycle would make an ordering impossible."),
  m2("The sum of the degrees of all vertices in an undirected graph with 12 edges is:", ["24", "12", "6", "144"], "Each edge contributes 2 to the total degree (handshaking lemma).", { check: "2*12" }),
  m("Which traversal uses a stack (or recursion)?", ["Depth-first search", "Breadth-first search", "Level order", "Dijkstra"], "BFS uses a queue."),
];

const hashing: RawQ[] = [
  m("The average time to search in a well-designed hash table is:", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "With a good hash function and low load factor, lookups are constant time on average."),
  m("When two keys hash to the same index, it is called a:", ["Collision", "Overflow", "Underflow", "Rehash"], "Collisions are handled by chaining or open addressing."),
  m("Separate chaining handles collisions by:", ["Storing colliding keys in a list at that index", "Probing the next free slot", "Rehashing the whole table", "Discarding the key"], "Open addressing (linear/quadratic probing, double hashing) is the alternative."),
  m("The load factor of a hash table is:", ["Number of stored elements ÷ table size", "Table size ÷ number of elements", "Number of collisions", "Hash function cost"], "Tables are usually resized when the load factor exceeds a threshold."),
  m("Primary clustering is a problem of:", ["Linear probing", "Separate chaining", "Double hashing", "Perfect hashing"], "Runs of occupied slots grow and slow down probes."),
];

const searching: RawQ[] = [
  m("Binary search requires the data to be:", ["Sorted", "Unsorted", "In a linked list", "Unique"], "Each comparison halves the search range."),
  m("The worst-case time complexity of linear search is:", ["O(n)", "O(log n)", "O(1)", "O(n²)"], "The element may be last or absent."),
  m2("At most how many comparisons does binary search need on a sorted array of 1000 elements?", ["10", "500", "100", "1000"], "⌈log₂(1000 + 1)⌉ = 10 comparisons.", { check: "10" }),
  m("Interpolation search performs best when the data is:", ["Sorted and uniformly distributed", "Unsorted", "In a stack", "Very small"], "It estimates the position from the key's value."),
];

const sorting: RawQ[] = [
  m("Which sorting algorithm has the best worst-case time complexity among these?", ["Merge sort — O(n log n)", "Quick sort — O(n²)", "Bubble sort — O(n²)", "Insertion sort — O(n²)"], "Merge sort is always O(n log n)."),
  m("Which sort is stable and works well on nearly sorted data?", ["Insertion sort", "Selection sort", "Heap sort", "Quick sort"], "Insertion sort runs in close to O(n) on nearly sorted input."),
  m("Quick sort's worst case O(n²) happens when:", ["The pivot is always the smallest or largest element", "The array has duplicates", "The array is small", "The pivot is the median"], "Randomised or median-of-three pivots avoid it in practice."),
  m("Which sorting algorithm is not comparison-based?", ["Counting sort", "Merge sort", "Heap sort", "Quick sort"], "Counting, radix and bucket sort use key values directly."),
  m("Which sort makes the minimum number of swaps?", ["Selection sort", "Bubble sort", "Insertion sort", "Quick sort"], "Selection sort performs at most n − 1 swaps."),
  m("The extra space required by standard merge sort on arrays is:", ["O(n)", "O(1)", "O(log n)", "O(n²)"], "Merging needs a temporary array."),
  m2("After the first pass of bubble sort (ascending) on [5, 1, 4, 2, 8], the array is:", ["[1, 4, 2, 5, 8]", "[1, 2, 4, 5, 8]", "[1, 5, 4, 2, 8]", "[5, 1, 4, 2, 8]"], "Adjacent swaps move the largest element (8) to the end: 5↔1, 5↔4, 5↔2, 5 and 8 stay → [1, 4, 2, 5, 8].", { check: "py:a=[5,1,4,2,8]\nfor j in range(4):\n    if a[j]>a[j+1]: a[j],a[j+1]=a[j+1],a[j]\nprint(a)" }),
];

const complexity: RawQ[] = [
  m("What is the time complexity of the following code?\n```\nfor i in range(n):\n    for j in range(n):\n        total += 1\n```", ["O(n²)", "O(n)", "O(log n)", "O(2n)"], "Two nested loops of n iterations each."),
  m("What is the time complexity of this loop?\n```\ni = 1\nwhile i < n:\n    i *= 2\n```", ["O(log n)", "O(n)", "O(n²)", "O(1)"], "i doubles each time, reaching n after about log₂ n steps."),
  m("Which grows fastest as n increases?", ["O(2ⁿ)", "O(n³)", "O(n log n)", "O(n²)"], "Exponential growth outpaces any polynomial."),
  m("Big-O notation describes:", ["An upper bound on growth rate", "The exact running time", "A lower bound only", "Memory in bytes"], "Ω gives a lower bound and Θ a tight bound."),
  m3("What is the time complexity of the recurrence T(n) = 2T(n/2) + n?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], "By the Master theorem (case 2), as in merge sort."),
  m2("What is the complexity of this code?\n```\nfor i in range(n):\n    j = 1\n    while j < n:\n        j *= 2\n```", ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], "The outer loop runs n times and the inner loop log n times."),
  m("The space complexity of an algorithm measures:", ["The extra memory it needs as a function of input size", "The size of the source code", "Disk usage", "The number of variables declared"], "Recursive algorithms also use stack space."),
];

const subject: RawSubject = {
  arrays: topic(arrays, { intro: "An array stores elements of one type in contiguous memory, giving O(1) indexed access but O(n) insertion and deletion in the middle.", formulas: [{ h: "Address calculation", points: ["1D: address(A[i]) = base + i × size", "Row-major 2D: base + (i × columns + j) × size", "Column-major 2D: base + (j × rows + i) × size"] }] }),
  "linked-lists": topic(linkedLists, { intro: "A linked list stores elements in nodes connected by pointers. Variants: singly, doubly and circular linked lists." }),
  stacks: topic([...G.stacks, ...G.postfixEval, ...stacks], { intro: "A stack is a LIFO structure with push, pop and peek in O(1). Uses: function calls, undo, expression evaluation, infix-to-postfix conversion, backtracking.", formulas: [{ h: "Infix to postfix", points: ["Operands go directly to the output", "Push '('; on ')' pop until '('", "Pop operators of higher (or equal, for left-associative) precedence before pushing a new one", "Precedence: ^ > * / > + −; ^ is right-associative"] }] }),
  queues: topic([...G.queues, ...queues], { intro: "A queue is a FIFO structure with enqueue at the rear and dequeue at the front. Variants: circular queue, deque, priority queue." }),
  trees: topic([...G.trees, ...trees], { intro: "A tree is a hierarchical structure with a root and child subtrees. Binary trees have at most two children per node.", formulas: [{ h: "Properties", points: ["Max nodes at level l (root level 0) = 2^l", "Max nodes in a tree of height h = 2^h − 1", "A full binary tree with i internal nodes has i + 1 leaves", "Minimum height for n nodes = ⌈log₂(n + 1)⌉"] }] }),
  "binary-search-trees": topic([...G.bst, ...bst], { intro: "In a BST each node's left subtree has smaller keys and its right subtree larger keys. Inorder traversal gives sorted output; balanced trees (AVL, red-black) keep operations O(log n)." }),
  heaps: topic(heaps, { intro: "A binary heap is a complete binary tree with the heap property (max-heap or min-heap), stored in an array. It supports insert and extract in O(log n)." }),
  graphs: topic(graphs, { intro: "A graph is a set of vertices connected by edges (directed or undirected, weighted or unweighted), stored as an adjacency matrix or list. Key algorithms: BFS, DFS, Dijkstra, Bellman–Ford, Prim, Kruskal, topological sort." }),
  hashing: topic([...G.hashing, ...hashing], { intro: "Hashing maps keys to table indexes with a hash function for average O(1) access. Collisions are resolved by chaining or open addressing." }),
  searching: topic([...G.binarySearch, ...searching], { intro: "Linear search checks elements one by one (O(n)); binary search halves a sorted range each step (O(log n))." }),
  sorting: topic(sorting, { intro: "Sorting algorithms differ in time, space and stability.", formulas: [{ h: "Complexities (best / average / worst)", points: ["Bubble, insertion: n / n² / n²", "Selection: n² / n² / n²", "Merge: n log n (all cases), O(n) extra space", "Quick: n log n / n log n / n²", "Heap: n log n (all cases), in place", "Counting: n + k"] }] }),
  "complexity-analysis": topic(complexity, { intro: "Complexity analysis estimates how running time and memory grow with input size, using asymptotic notation (O, Ω, Θ).", formulas: [{ h: "Common orders", points: ["O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)"] }] }),
};
export default subject;
