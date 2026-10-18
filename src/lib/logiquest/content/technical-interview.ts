import type { RawQ, RawSubject } from "../types";
import { qa, topic } from "./build";

const c: RawQ[] = [
  qa("What is the difference between a compiler and an interpreter?", "A compiler translates the whole program into machine code before it runs (e.g. C), producing an executable. An interpreter translates and executes the program line by line at run time (e.g. Python). Compiled programs usually run faster; interpreted programs are easier to test interactively."),
  qa("What is a pointer in C?", "A pointer is a variable that stores the memory address of another variable. `int *p = &x;` makes p point to x, and `*p` reads or writes x. Pointers enable dynamic memory, arrays, strings and efficient parameter passing."),
  qa("What is the difference between malloc() and calloc()?", "Both allocate memory on the heap. malloc(size) allocates one block and leaves it uninitialised; calloc(n, size) allocates n elements and sets all bytes to zero. Both return NULL on failure and memory must be released with free()."),
  qa("What is the difference between call by value and call by reference?", "In call by value the function receives a copy, so changes do not affect the caller. In call by reference the function receives the address (in C, via a pointer), so it can modify the caller's variable."),
  qa("What is a static variable?", "A static local variable keeps its value between function calls and is initialised only once. A static global variable or function is visible only within its source file."),
  qa("What is the difference between a structure and a union?", "In a structure each member has its own storage, so the size is (at least) the sum of the members. In a union all members share the same memory, so the size equals the largest member and only one member holds a valid value at a time."),
  qa("What is a dangling pointer?", "A pointer that still points to memory that has been freed or gone out of scope. Using it is undefined behaviour. Set pointers to NULL after free() to avoid it."),
  qa("What does the volatile keyword do?", "It tells the compiler that a variable can change outside the program's control (hardware registers, interrupts, other threads), so every access must read from memory instead of a cached register."),
];

const oops: RawQ[] = [
  qa("What are the four pillars of OOP?", "Encapsulation (bundling data with methods and hiding internal details), Abstraction (exposing only essential features), Inheritance (a class reusing another class's properties) and Polymorphism (one interface with many implementations, via overloading or overriding)."),
  qa("What is the difference between overloading and overriding?", "Overloading: methods with the same name but different parameter lists in the same class, resolved at compile time. Overriding: a subclass provides its own implementation of a method inherited from the parent, with the same signature, resolved at run time."),
  qa("What is the difference between an abstract class and an interface?", "An abstract class can have state (fields), constructors and both abstract and concrete methods; a class can extend only one. An interface defines a contract (and in Java 8+ may have default methods), has no instance state, and a class can implement many."),
  qa("What is a constructor?", "A special method called when an object is created, used to initialise its state. It has the class's name (in Java/C++) and no return type. Constructors can be overloaded."),
  qa("What is the difference between a class and an object?", "A class is a blueprint that defines attributes and behaviour. An object is an instance of a class created at run time with its own state."),
  qa("What is composition and why is it often preferred over inheritance?", "Composition builds a class from other objects it holds ('has-a'), while inheritance creates an 'is-a' relationship. Composition is more flexible: behaviour can change at run time and classes are less tightly coupled."),
];

const java: RawQ[] = [
  qa("What is the difference between JDK, JRE and JVM?", "The JVM runs Java bytecode. The JRE is the JVM plus standard libraries needed to run programs. The JDK is the JRE plus development tools such as the compiler (javac) and debugger."),
  qa("Why is String immutable in Java?", "Immutability allows strings to be safely shared and cached in the string pool, makes them thread-safe, keeps hash codes stable for use as map keys, and prevents security issues when strings are used for things like file paths or class names."),
  qa("What is the difference between == and equals()?", "== compares references (whether two variables point to the same object) for objects, and values for primitives. equals() compares logical contents and can be overridden (String overrides it to compare characters)."),
  qa("What is the difference between ArrayList and LinkedList?", "ArrayList is backed by a resizable array: fast random access (O(1)), slower inserts in the middle. LinkedList is a doubly linked list: fast insertion and removal at the ends, slow random access (O(n))."),
  qa("What is the difference between checked and unchecked exceptions?", "Checked exceptions (e.g. IOException) must be caught or declared with throws and are checked at compile time. Unchecked exceptions (RuntimeException subclasses such as NullPointerException) do not need to be declared."),
  qa("How does HashMap work internally?", "It stores entries in an array of buckets. The key's hashCode() selects a bucket; collisions are stored in a linked list (converted to a balanced tree when large). equals() finds the right key in a bucket. The table resizes when the load factor (default 0.75) is exceeded."),
  qa("What is the final keyword?", "A final variable cannot be reassigned, a final method cannot be overridden and a final class cannot be extended."),
];

const python: RawQ[] = [
  qa("What is the difference between a list and a tuple?", "Lists are mutable (can be changed) and use square brackets; tuples are immutable and use parentheses. Tuples are hashable (if their items are), so they can be dictionary keys, and they are slightly faster."),
  qa("What are *args and **kwargs?", "*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dictionary. They let functions accept a variable number of arguments."),
  qa("What is a decorator?", "A function that takes another function and returns a modified version, used to add behaviour (logging, timing, access checks) without changing the original code. Applied with @decorator above the function."),
  qa("What is the difference between deep copy and shallow copy?", "A shallow copy creates a new container but shares the inner objects; a deep copy (copy.deepcopy) recursively copies inner objects too, so changes to nested items do not affect the original."),
  qa("What is a generator?", "A function that uses yield to produce values one at a time, keeping its state between calls. Generators are memory-efficient for large or infinite sequences."),
  qa("What is the GIL?", "The Global Interpreter Lock in CPython allows only one thread to execute Python bytecode at a time. CPU-bound work therefore uses multiprocessing for parallelism, while threads still help with I/O-bound tasks."),
];

const ds: RawQ[] = [
  qa("What is the difference between an array and a linked list?", "An array stores elements contiguously with O(1) indexed access but costly insertion/deletion in the middle. A linked list stores nodes with pointers, allowing O(1) insertion/deletion at known positions but O(n) access."),
  qa("What is the difference between a stack and a queue?", "A stack is LIFO (last in, first out) with push and pop at the top. A queue is FIFO (first in, first out) with enqueue at the rear and dequeue at the front."),
  qa("What is a binary search tree?", "A binary tree where every node's left subtree contains smaller keys and its right subtree larger keys. Search, insert and delete take O(h) time — O(log n) when balanced."),
  qa("What is hashing?", "Mapping keys to array indexes with a hash function so that lookups take O(1) on average. Collisions are handled by chaining or open addressing."),
  qa("What is the time complexity of quick sort and merge sort?", "Both average O(n log n). Quick sort's worst case is O(n²) (bad pivots) but it is in-place and fast in practice. Merge sort is always O(n log n) and stable but needs O(n) extra space."),
  qa("What is the difference between BFS and DFS?", "BFS explores level by level using a queue and finds shortest paths in unweighted graphs. DFS goes as deep as possible using a stack or recursion and is used for cycle detection and topological sorting."),
];

const dbms: RawQ[] = [
  qa("What is normalization?", "Organising tables to reduce redundancy and avoid insertion, update and deletion anomalies, using normal forms: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency) and BCNF."),
  qa("What are ACID properties?", "Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere) and Durability (committed changes survive failures)."),
  qa("What is the difference between a primary key and a unique key?", "Both enforce uniqueness. A table has only one primary key, which cannot be NULL; it can have several unique keys, which (in most databases) allow NULLs."),
  qa("What is an index and when should you avoid it?", "An index (usually a B+ tree) speeds up searches on columns. Avoid excessive indexes on tables with heavy writes, small tables and low-selectivity columns, because indexes slow inserts and updates and use storage."),
  qa("What is the difference between DELETE, TRUNCATE and DROP?", "DELETE removes selected rows (can use WHERE, is logged, can be rolled back). TRUNCATE removes all rows quickly while keeping the table. DROP removes the table and its structure entirely."),
  qa("What is a deadlock in a database?", "Two or more transactions each hold a lock the other needs, so none can proceed. The DBMS detects it and aborts one transaction; consistent lock ordering reduces it."),
];

const sql: RawQ[] = [
  qa("How do you find the second highest salary?", "`SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);` or with window functions: `SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) r FROM emp) t WHERE r = 2;`"),
  qa("What is the difference between WHERE and HAVING?", "WHERE filters rows before grouping and cannot use aggregate functions; HAVING filters groups after GROUP BY and can use aggregates such as COUNT or SUM."),
  qa("Explain the types of JOINs.", "INNER JOIN returns matching rows; LEFT JOIN returns all left rows plus matches; RIGHT JOIN the reverse; FULL OUTER JOIN all rows from both; CROSS JOIN the Cartesian product; a self join joins a table to itself."),
  qa("How do you find duplicate records in a table?", "`SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;`"),
  qa("What is the difference between UNION and UNION ALL?", "UNION combines result sets and removes duplicates (requiring extra sorting work); UNION ALL keeps all rows, including duplicates, and is faster."),
  qa("What is a stored procedure?", "A named set of SQL statements stored in the database and executed as a unit. It can take parameters, reduce network round trips and centralise business logic."),
];

const os: RawQ[] = [
  qa("What is the difference between a process and a thread?", "A process is an independent program in execution with its own memory space. Threads are units of execution within a process that share its memory and resources, so they are lighter to create and switch, but need synchronisation."),
  qa("What is virtual memory?", "A technique that gives each process a large logical address space, keeping only needed pages in RAM and the rest on disk. It enables programs larger than physical memory and process isolation."),
  qa("What is a deadlock and what are its necessary conditions?", "A state where processes wait forever for resources held by each other. Conditions: mutual exclusion, hold and wait, no preemption and circular wait — all four must hold."),
  qa("What is the difference between paging and segmentation?", "Paging divides memory into fixed-size pages and frames (no external fragmentation). Segmentation divides it into variable-size logical segments such as code, data and stack."),
  qa("What is thrashing?", "When a system spends more time swapping pages in and out than executing, because processes do not have enough frames for their working sets. Fix it by reducing multiprogramming or adding memory."),
  qa("What is a semaphore?", "A synchronisation variable with atomic wait (P) and signal (V) operations. A counting semaphore limits access to a pool of resources; a binary semaphore acts like a lock."),
];

const networking: RawQ[] = [
  qa("What happens when you type a URL in the browser?", "The browser resolves the domain to an IP address with DNS, opens a TCP connection (and TLS handshake for HTTPS), sends an HTTP request, receives the response, then parses HTML and fetches CSS, JavaScript and images to render the page."),
  qa("What is the difference between TCP and UDP?", "TCP is connection-oriented, reliable and ordered, with flow and congestion control (used by HTTP, email). UDP is connectionless and faster with no delivery guarantee (used by DNS, video streaming, gaming)."),
  qa("What is the difference between a hub, a switch and a router?", "A hub broadcasts to all ports (layer 1). A switch forwards frames to the right port using MAC addresses (layer 2). A router forwards packets between networks using IP addresses (layer 3)."),
  qa("What is DNS?", "The Domain Name System translates human-readable names like example.com into IP addresses, using a hierarchy of root, TLD and authoritative servers with caching."),
  qa("What is the difference between HTTP and HTTPS?", "HTTPS is HTTP over TLS: traffic is encrypted and the server's identity is verified with a certificate, protecting against eavesdropping and tampering."),
  qa("What is subnetting?", "Dividing an IP network into smaller networks by borrowing host bits for the network part. It improves address utilisation, security and performance by limiting broadcast domains."),
];

const testing: RawQ[] = [
  qa("What is the difference between verification and validation?", "Verification checks that the product is built correctly according to specifications (reviews, inspections). Validation checks that the right product is built for the user's needs (testing the working software)."),
  qa("What is regression testing?", "Re-running tests after changes to make sure existing functionality still works. It is the main candidate for automation."),
  qa("What is the difference between severity and priority?", "Severity is the impact of a defect on the system; priority is how urgently it should be fixed. A crash in a rarely used feature may be high severity but low priority."),
  qa("What is boundary value analysis?", "A black-box technique that tests values at and just outside the edges of valid ranges, where defects are common. For a range 1–100, test 0, 1, 100 and 101."),
  qa("What is the difference between smoke and sanity testing?", "Smoke testing is a broad, shallow check that a new build's critical functions work. Sanity testing is a narrow, focused check that a specific fix or change works as expected."),
  qa("What should a good bug report contain?", "A clear title, steps to reproduce, expected and actual results, environment details, severity, priority and attachments such as screenshots or logs."),
];

const web: RawQ[] = [
  qa("What is the difference between HTML, CSS and JavaScript?", "HTML structures the content of a page, CSS controls its presentation and layout, and JavaScript adds behaviour and interactivity."),
  qa("What is the difference between GET and POST?", "GET requests data, sends parameters in the URL, is cacheable and should not change server state. POST sends data in the request body to create or process something and is not cached by default."),
  qa("What is a REST API?", "An architectural style for web services where resources are identified by URLs and manipulated with HTTP methods (GET, POST, PUT, PATCH, DELETE), using stateless requests and usually JSON."),
  qa("What is CORS?", "Cross-Origin Resource Sharing is a browser mechanism that lets a server allow, through response headers, web pages from other origins to access its resources."),
  qa("What is the difference between cookies, localStorage and sessionStorage?", "Cookies are small, sent to the server with every request and can expire or be HTTP-only. localStorage stores larger data in the browser with no expiry; sessionStorage lasts only for the browser tab."),
  qa("What is responsive design?", "Designing pages that adapt to different screen sizes using flexible layouts, relative units and CSS media queries."),
];

const cloud: RawQ[] = [
  qa("What are IaaS, PaaS and SaaS?", "IaaS provides virtual machines, storage and networks (e.g. AWS EC2). PaaS provides a managed platform to run applications without managing servers (e.g. Heroku, App Engine). SaaS provides complete applications over the internet (e.g. Gmail)."),
  qa("What is the difference between public, private and hybrid cloud?", "Public cloud is shared infrastructure from a provider; private cloud is dedicated to one organisation; hybrid cloud combines both with workloads moving between them."),
  qa("What is auto-scaling?", "Automatically adding or removing compute instances based on load metrics such as CPU or requests, so applications handle peaks while saving cost at quiet times."),
  qa("What is a container and how is it different from a virtual machine?", "A container packages an application with its dependencies and shares the host OS kernel, so it is lightweight and starts in seconds. A VM includes a full guest OS on a hypervisor, giving stronger isolation but using more resources."),
  qa("What is serverless computing?", "Running code as functions triggered by events, where the provider manages servers and scaling and you pay only for execution time (e.g. AWS Lambda)."),
  qa("What is the shared responsibility model?", "The cloud provider secures the underlying infrastructure (security of the cloud); the customer secures their data, identities, configurations and applications (security in the cloud)."),
];

const T = "Questions & Answers";
const subject: RawSubject = {
  "c-language-basics": topic(c, { title: T, intro: "Short-answer questions on C fundamentals asked in campus and technical interviews." }),
  "oops-concepts": topic(oops, { title: T, intro: "Core object-oriented programming concepts that interviewers expect every developer to explain clearly." }),
  java: topic(java, { title: T, intro: "Frequently asked Java interview questions with concise answers." }),
  python: topic(python, { title: T, intro: "Frequently asked Python interview questions with concise answers." }),
  "data-structures": topic(ds, { title: T, intro: "Data structure and algorithm concepts asked in technical rounds." }),
  dbms: topic(dbms, { title: T, intro: "Database concepts: normalization, transactions, keys and indexes." }),
  sql: topic(sql, { title: T, intro: "Common SQL interview questions, including query patterns you should be able to write on a whiteboard." }),
  "operating-systems": topic(os, { title: T, intro: "Operating system concepts: processes, memory, scheduling and synchronisation." }),
  networking: topic(networking, { title: T, intro: "Networking fundamentals every software engineer is expected to know." }),
  "software-testing": topic(testing, { title: T, intro: "Software testing short answers for QA and developer interviews." }),
  "web-development": topic(web, { title: T, intro: "Web development basics: HTML, CSS, JavaScript, HTTP and APIs." }),
  "cloud-computing": topic(cloud, { title: T, intro: "Cloud computing concepts: service models, deployment models, containers and serverless." }),
};
export default subject;
