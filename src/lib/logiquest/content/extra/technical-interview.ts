/** More Technical Interview questions with short model answers. */
import { qa } from "../build";
import type { ExtraSubject } from "./merge";

const extra: ExtraSubject = {
  "c-language-basics": [
    qa("What is the difference between a declaration and a definition?", "A declaration introduces a name and its type (e.g. `extern int x;`), telling the compiler it exists. A definition also allocates storage or provides the body (e.g. `int x = 5;`). A variable can be declared many times but defined only once."),
    qa("What are storage classes in C?", "auto (default for locals, automatic lifetime), register (hint to keep in a CPU register), static (lifetime of the whole program; file scope when used globally) and extern (declares a variable defined elsewhere)."),
    qa("What is the difference between ++i and i++?", "++i increments first and then yields the new value; i++ yields the old value and then increments. Used alone as a statement they have the same effect."),
    qa("What is a NULL pointer and how is it different from a void pointer?", "A NULL pointer points to nothing (it has the value NULL). A void pointer (`void *`) is a generic pointer type that can hold the address of any object but must be cast before dereferencing. A void pointer may or may not be NULL."),
    qa("What is a memory leak and how do you avoid it?", "Memory that was allocated with malloc/calloc but never freed and is no longer reachable. Avoid it by freeing every allocation exactly once, freeing on every error path, and using tools like Valgrind or AddressSanitizer."),
    qa("What is the difference between #define and const?", "#define is a preprocessor text substitution with no type or scope. const creates a typed, scoped variable checked by the compiler and visible to debuggers. Prefer const (or enum) for typed constants."),
    qa("What is recursion and what are its risks?", "Recursion is a function calling itself, with a base case that stops it. Each call uses stack space, so very deep recursion can overflow the stack; some problems are faster with iteration."),
    qa("What is the difference between an array and a pointer?", "An array is a fixed block of elements; its name decays to a pointer to the first element in most expressions. A pointer is a variable holding an address and can be reassigned. sizeof(array) gives the whole array's size, sizeof(pointer) gives the pointer's size."),
  ],

  "oops-concepts": [
    qa("What is encapsulation?", "Bundling data with the methods that operate on it and restricting direct access to the data (e.g. private fields with public methods). It protects an object's state and lets the implementation change without affecting users."),
    qa("What is abstraction?", "Showing only the essential features of an object and hiding implementation details. Abstract classes and interfaces define what an object does, not how."),
    qa("What is polymorphism?", "The ability of one interface to work with different types. Compile-time polymorphism uses overloading; run-time polymorphism uses overriding with virtual methods, so a base reference calls the derived class's method."),
    qa("What is inheritance and what types exist?", "Inheritance lets a class reuse and extend another class. Types include single, multilevel, hierarchical, multiple (via interfaces in Java/C#) and hybrid."),
    qa("What is the diamond problem?", "With multiple inheritance, a class inheriting from two classes that share a base gets two copies of the base and ambiguous members. C++ solves it with virtual inheritance; Java and C# avoid it by allowing multiple inheritance only of interfaces."),
    qa("What is a virtual function?", "A member function that can be overridden in derived classes and is dispatched at run time based on the object's actual type, usually via a vtable."),
    qa("What is the difference between aggregation and composition?", "Both are 'has-a' relationships. In composition the part cannot exist without the whole (a house and its rooms). In aggregation the part can exist independently (a team and its players)."),
    qa("What are access specifiers?", "Keywords that control visibility: public (accessible everywhere), private (only inside the class), protected (the class and its subclasses) and, in some languages, package/internal access."),
  ],

  java: [
    qa("What is the difference between String, StringBuilder and StringBuffer?", "String is immutable. StringBuilder is mutable and fast but not thread-safe. StringBuffer is mutable and synchronised (thread-safe) but slower. Use StringBuilder for building strings in a single thread."),
    qa("What is the difference between HashMap and Hashtable?", "HashMap is not synchronised, allows one null key and null values, and is faster. Hashtable is synchronised, allows no null keys or values, and is legacy. ConcurrentHashMap is the modern thread-safe choice."),
    qa("What is the Java Memory Model's heap versus stack?", "Objects live on the heap, shared by all threads and managed by the garbage collector. Each thread has its own stack holding method frames, local primitives and references."),
    qa("What is method overloading versus method hiding with static methods?", "Overloading means same name, different parameters, resolved at compile time. A static method with the same signature in a subclass hides the parent's method; the call depends on the reference type, not the object."),
    qa("What are the main features of Java 8?", "Lambda expressions, functional interfaces, the Stream API, default and static methods in interfaces, Optional, method references and the java.time date/time API."),
    qa("What is the difference between Comparable and Comparator?", "Comparable defines a class's natural ordering via compareTo inside the class. Comparator defines external, alternative orderings via compare and can be passed to sort methods."),
    qa("What is synchronisation in Java?", "A mechanism (synchronized methods or blocks, locks) that lets only one thread at a time execute a critical section on a given monitor, preventing race conditions and ensuring visibility of changes."),
    qa("What is the difference between throw and throws?", "throw raises an exception object inside a method. throws in a method signature declares the checked exceptions the method may pass to its caller."),
  ],

  python: [
    qa("What is the difference between is and ==?", "== compares values (equality); is compares identity (whether both names refer to the same object). Use is for None checks."),
    qa("What are mutable and immutable types in Python?", "Mutable objects can change in place: list, dict, set, bytearray. Immutable objects cannot: int, float, str, tuple, frozenset, bytes. Only immutable (hashable) objects can be dict keys or set elements."),
    qa("What is a lambda function?", "A small anonymous function defined with lambda, containing a single expression, e.g. `lambda x: x * 2`. Often used with sorted, map and filter."),
    qa("What is list comprehension?", "A concise way to build a list from an iterable, optionally filtering: `[x * x for x in nums if x > 0]`. It is usually faster and clearer than an equivalent loop."),
    qa("What are Python's namespaces and the LEGB rule?", "Names are looked up in Local, Enclosing, Global and Built-in scopes, in that order. global and nonlocal let a function rebind names in outer scopes."),
    qa("What is the difference between @staticmethod and @classmethod?", "A static method receives no implicit first argument and behaves like a plain function in the class namespace. A class method receives the class (cls) and is often used for alternative constructors."),
    qa("How is memory managed in Python?", "CPython uses reference counting plus a cyclic garbage collector for reference cycles. Objects live on a private heap; small objects use an internal allocator."),
    qa("What are virtual environments and why use them?", "Isolated Python environments (created with venv) that have their own installed packages, so different projects can use different package versions without conflict."),
  ],

  "data-structures": [
    qa("What is a hash collision and how is it handled?", "When two keys map to the same bucket. Handled by separate chaining (a list per bucket) or open addressing (probing for another slot: linear, quadratic or double hashing)."),
    qa("What is a heap and where is it used?", "A complete binary tree with the heap property (each parent ≤ or ≥ its children). Used for priority queues, heap sort, Dijkstra's algorithm and finding the top k elements."),
    qa("What is the difference between a tree and a graph?", "A tree is a connected acyclic graph with n − 1 edges and a hierarchical parent–child structure. A graph can have cycles, be disconnected and have any number of edges."),
    qa("What is dynamic programming?", "Solving problems by breaking them into overlapping subproblems and storing their results (memoisation or tabulation) to avoid repeated work. Examples: Fibonacci, knapsack, longest common subsequence."),
    qa("What is the difference between a greedy algorithm and dynamic programming?", "A greedy algorithm makes the locally best choice at each step and never reconsiders it; it is correct only for problems with the greedy-choice property. Dynamic programming considers all subproblem results and finds the optimum when subproblems overlap."),
    qa("How do you detect a cycle in a linked list?", "Use Floyd's tortoise and hare: move one pointer by one step and another by two. If they meet, there is a cycle; if the fast pointer reaches null, there is none. O(n) time, O(1) space."),
    qa("What is a trie?", "A tree where each edge represents a character and paths from the root spell keys. It supports prefix searches in O(length of key) and is used for autocomplete and dictionaries."),
    qa("What is a balanced binary search tree and why is it useful?", "A BST that keeps its height O(log n) through rotations (AVL, red-black). It guarantees O(log n) search, insert and delete, unlike a plain BST that can degrade to O(n)."),
  ],

  dbms: [
    qa("What is a foreign key?", "A column (or set of columns) that refers to the primary key of another table, enforcing referential integrity between related rows."),
    qa("What is denormalization and when is it used?", "Deliberately adding redundancy (e.g. duplicating columns or storing totals) to speed up reads, often in reporting or high-traffic systems, at the cost of more complex updates."),
    qa("What is the difference between a clustered and a non-clustered index?", "A clustered index defines the physical order of rows (only one per table). A non-clustered index is a separate structure with pointers to rows; a table can have many."),
    qa("What are isolation levels?", "Read Uncommitted, Read Committed, Repeatable Read and Serializable. Higher levels prevent more anomalies (dirty reads, non-repeatable reads, phantoms) at the cost of concurrency."),
    qa("What is a view?", "A stored query that acts as a virtual table. It simplifies complex queries and can restrict which columns or rows users see."),
    qa("What is the difference between DBMS and RDBMS?", "A DBMS manages data in any model (files, hierarchies). An RDBMS stores data in related tables with keys, supports SQL and enforces relational integrity constraints."),
    qa("What is a transaction log?", "A record of all changes made by transactions, written before data pages (write-ahead logging). It allows rollback and recovery after a crash."),
    qa("What is sharding?", "Splitting a large database horizontally across several servers by a shard key, so each server holds a subset of rows. It improves scalability but complicates cross-shard queries."),
  ],

  sql: [
    qa("How do you find the nth highest salary?", "Using a window function: `SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS r FROM emp) t WHERE r = n;` Or with LIMIT/OFFSET on distinct salaries: `SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET n - 1;`"),
    qa("What is the difference between RANK, DENSE_RANK and ROW_NUMBER?", "ROW_NUMBER gives unique consecutive numbers. RANK gives ties the same rank and leaves gaps (1, 1, 3). DENSE_RANK gives ties the same rank without gaps (1, 1, 2)."),
    qa("What is a self join? Give an example.", "A join of a table with itself using aliases, e.g. listing employees with their managers: `SELECT e.name, m.name FROM emp e LEFT JOIN emp m ON e.manager_id = m.id;`"),
    qa("What is the difference between a subquery and a join?", "A join combines columns from several tables in one result. A subquery is a query nested inside another, used for filtering or computing values. Many subqueries can be rewritten as joins, which are often faster."),
    qa("What does COALESCE do?", "Returns the first non-NULL value in its list of arguments, e.g. `COALESCE(phone, 'N/A')` shows 'N/A' when phone is NULL."),
    qa("What is a CTE?", "A Common Table Expression defined with WITH, a named temporary result used in the following query. It makes complex queries readable and supports recursion."),
    qa("How do you delete duplicate rows but keep one?", "Use a window function to number duplicates and delete those with a number above 1, e.g. `DELETE FROM t WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn FROM t) x WHERE rn > 1);`"),
    qa("What is the difference between CHAR and VARCHAR?", "CHAR(n) is fixed-length and pads with spaces; VARCHAR(n) is variable-length and stores only the actual characters (plus length). Use CHAR for fixed codes and VARCHAR for most text."),
  ],

  "operating-systems": [
    qa("What is a context switch?", "Saving the state (registers, program counter) of the running process or thread and loading the state of the next one. It is pure overhead, so frequent switches reduce throughput."),
    qa("What is the difference between pre-emptive and non-pre-emptive scheduling?", "In pre-emptive scheduling the OS can take the CPU away from a running process (e.g. Round Robin). In non-pre-emptive scheduling a process keeps the CPU until it finishes or blocks (e.g. FCFS)."),
    qa("What is a race condition?", "When the result depends on the timing of concurrent threads accessing shared data without proper synchronisation. Fixed with locks, atomic operations or avoiding shared mutable state."),
    qa("What is a page fault?", "An interrupt raised when a program accesses a page not currently in physical memory. The OS loads the page from disk, updates the page table and resumes the program."),
    qa("What is the difference between a mutex and a semaphore?", "A mutex is a lock owned by one thread at a time for mutual exclusion. A semaphore is a counter that allows up to N concurrent accesses and can be used for signalling between threads."),
    qa("What is starvation and how is it prevented?", "A process waits indefinitely because others are always preferred. Ageing (gradually raising the priority of waiting processes) prevents it."),
    qa("What is the difference between a kernel thread and a user thread?", "Kernel threads are managed and scheduled by the OS. User threads are managed by a library in user space; they are cheap but a blocking call may block all threads of the process unless mapped to kernel threads."),
    qa("What is a system call? Give examples.", "A controlled entry into the kernel to request a service, e.g. read, write, open, fork, exec and exit. It switches the CPU from user mode to kernel mode."),
  ],

  networking: [
    qa("What is an IP address and a MAC address?", "An IP address is a logical address used to route packets between networks (layer 3) and can change. A MAC address is a 48-bit hardware address used for delivery on the local network (layer 2)."),
    qa("What is ARP?", "Address Resolution Protocol finds the MAC address for an IP address on the local network by broadcasting a request; the owner replies, and the result is cached."),
    qa("What is NAT?", "Network Address Translation lets many devices with private IP addresses share one public IP address by rewriting addresses and ports at the router."),
    qa("What is a firewall?", "A system that filters network traffic according to rules (addresses, ports, protocols, connection state) to block unauthorised access."),
    qa("What is the three-way handshake?", "TCP connection set-up: the client sends SYN, the server replies SYN-ACK, and the client sends ACK. Both sides then agree on initial sequence numbers."),
    qa("What is a VPN?", "A Virtual Private Network creates an encrypted tunnel over a public network, so traffic is private and the user appears to be on the remote network."),
    qa("What is the difference between IPv4 and IPv6?", "IPv4 uses 32-bit addresses (about 4.3 billion), written in dotted decimal. IPv6 uses 128-bit addresses written in hexadecimal, has a simpler header, built-in autoconfiguration and removes the need for NAT."),
    qa("What is latency versus bandwidth?", "Latency is the delay for data to travel from source to destination. Bandwidth is the maximum amount of data that can be sent per second. A link can have high bandwidth and still high latency."),
  ],

  "software-testing": [
    qa("What is the difference between black-box and white-box testing?", "Black-box testing checks behaviour against requirements without looking at the code. White-box testing designs tests from the internal structure, aiming for statement, branch or path coverage."),
    qa("What is equivalence partitioning?", "Dividing inputs into groups that the system should treat the same way and testing one value from each group, which reduces the number of tests."),
    qa("What is a test case?", "A set of preconditions, inputs, steps and expected results used to check one aspect of a system, with an ID and a pass/fail status."),
    qa("What is the defect life cycle?", "The states a bug passes through: New, Assigned, Open, Fixed, Retest, Verified/Closed, with possible Reopened, Deferred, Rejected or Duplicate states."),
    qa("What is the difference between retesting and regression testing?", "Retesting checks that a specific fixed defect is now fixed. Regression testing checks that the change has not broken anything else."),
    qa("What is exploratory testing?", "Simultaneous learning, test design and execution without detailed scripts, guided by the tester's skill and a charter. Good for finding unexpected issues."),
    qa("What is test coverage?", "A measure of how much of the requirements or code is exercised by tests, e.g. the percentage of statements, branches or requirements covered."),
    qa("What is UAT?", "User Acceptance Testing: the final testing by end users or clients to confirm the system meets their needs before it goes live."),
  ],

  "web-development": [
    qa("What is the DOM?", "The Document Object Model is a tree representation of an HTML page that JavaScript can read and modify to change content, structure and styles dynamically."),
    qa("What is the difference between let, const and var in JavaScript?", "var is function-scoped and hoisted. let and const are block-scoped; const cannot be reassigned (though objects it refers to can still be mutated)."),
    qa("What is the difference between == and === in JavaScript?", "== compares after type coercion ('5' == 5 is true). === compares value and type without coercion ('5' === 5 is false). Prefer ===."),
    qa("What is an HTTP status code? Name a few.", "A three-digit code in a response: 200 OK, 201 Created, 301 Moved Permanently, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found and 500 Internal Server Error."),
    qa("What is the box model in CSS?", "Every element is a box made of content, padding, border and margin. box-sizing: border-box makes width include padding and border."),
    qa("What is a single-page application (SPA)?", "A web app that loads one HTML page and updates content dynamically with JavaScript instead of loading new pages, e.g. apps built with React or Angular."),
    qa("What is the difference between authentication and authorisation?", "Authentication verifies who the user is (login). Authorisation decides what the authenticated user is allowed to do (permissions)."),
    qa("What is a promise in JavaScript?", "An object representing the eventual result of an asynchronous operation, in one of three states: pending, fulfilled or rejected. async/await is syntax built on promises."),
  ],

  "cloud-computing": [
    qa("What is cloud computing?", "On-demand delivery of computing resources (servers, storage, databases, software) over the internet with pay-as-you-go pricing, instead of owning physical infrastructure."),
    qa("What are regions and availability zones?", "A region is a geographic area containing several isolated data-centre groups called availability zones. Deploying across zones gives high availability; across regions gives disaster recovery."),
    qa("What is a load balancer in the cloud?", "A managed service that distributes incoming traffic across several instances, checks their health and helps scale and keep applications available."),
    qa("What is object storage?", "Storage that keeps data as objects with metadata in flat buckets (e.g. Amazon S3), ideal for files, backups and static website content, accessed over HTTP."),
    qa("What is horizontal versus vertical scaling?", "Vertical scaling adds more power (CPU, RAM) to one machine. Horizontal scaling adds more machines and spreads the load, which is more resilient and is the cloud's usual approach."),
    qa("What is a CDN?", "A Content Delivery Network caches content on servers close to users around the world, reducing latency and load on the origin server."),
    qa("What is Infrastructure as Code?", "Managing and provisioning infrastructure with machine-readable definition files (e.g. Terraform, CloudFormation) so environments are reproducible and version-controlled."),
    qa("What is multi-tenancy?", "A single instance of software or infrastructure serving several customers (tenants), with their data logically isolated. Common in SaaS products."),
  ],
};

export default extra;
