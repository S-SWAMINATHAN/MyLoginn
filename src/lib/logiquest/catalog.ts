/**
 * The LogiQuest map: groups -> subjects -> topics. Light metadata only (safe to import anywhere);
 * the questions themselves are loaded per subject from ./content.
 */

export type TopicMeta = { slug: string; title: string };
export type SubjectKind = "mcq" | "qa";
export type SubjectMeta = {
  slug: string;
  title: string;
  /** Page heading, e.g. "Logical Reasoning Questions and Answers". */
  heading: string;
  short: string;
  desc: string;
  group: string;
  kind: SubjectKind;
  topics: TopicMeta[];
};
export type GroupMeta = { slug: string; title: string; nav: string; desc: string; icon: string };

export const GROUPS: GroupMeta[] = [
  { slug: "aptitude", nav: "Aptitude", title: "Quantitative Aptitude", desc: "Arithmetic and data interpretation for placement and competitive exams.", icon: "math" },
  { slug: "verbal", nav: "Verbal", title: "Verbal Ability", desc: "Grammar, vocabulary, comprehension and sentence skills.", icon: "comm" },
  { slug: "reasoning", nav: "Reasoning", title: "Reasoning", desc: "Logical, verbal and non-verbal reasoning.", icon: "ai" },
  { slug: "programming", nav: "Programming", title: "Programming", desc: "C, C++, C#, Java and Python questions with explained outputs.", icon: "code" },
  { slug: "technical", nav: "Technical", title: "Technical MCQs", desc: "Databases, networking, operating systems and core computer science.", icon: "cloud" },
  { slug: "interview", nav: "Interview", title: "Interview", desc: "HR, technical short answers and group discussion preparation.", icon: "business" },
  { slug: "gk", nav: "GK", title: "General Knowledge", desc: "General knowledge and general science.", icon: "business" },
  { slug: "engineering", nav: "Engineering", title: "Engineering", desc: "Mechanical, civil, electronics, electrical, chemical and computer science.", icon: "testing" },
  { slug: "puzzles", nav: "Puzzles", title: "Puzzles", desc: "Number, letter, clock and logic puzzles, plus Sudoku.", icon: "ai" },
];

const t = (...titles: string[]): TopicMeta[] => titles.map((title) => ({ title, slug: slugify(title) }));

export function slugify(text: string) {
  return text.toLowerCase().replace(/&/g, " and ").replace(/['.]/g, "").replace(/\+\+/g, "pp").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const S = (slug: string, title: string, group: string, short: string, desc: string, topics: TopicMeta[], kind: SubjectKind = "mcq", heading?: string): SubjectMeta =>
  ({ slug, title, group, short, desc, topics, kind, heading: heading ?? `${title} Questions and Answers` });

export const SUBJECTS: SubjectMeta[] = [
  // ───────── Quantitative Aptitude ─────────
  S("arithmetic-aptitude", "Arithmetic Aptitude", "aptitude", "Aptitude", "Every arithmetic topic asked in placement tests, bank exams and campus drives, each with formulas, worked explanations and an online test.", t(
    "Problems on Trains", "Time and Distance", "Height and Distance", "Time and Work", "Simple Interest", "Compound Interest", "Profit and Loss", "Partnership", "Percentage", "Problems on Ages",
    "Calendar", "Clock", "Average", "Area", "Volume and Surface Area", "Permutation and Combination", "Numbers", "Problems on Numbers", "Problems on H.C.F and L.C.M", "Decimal Fraction",
    "Simplification", "Square Root and Cube Root", "Surds and Indices", "Ratio and Proportion", "Chain Rule", "Pipes and Cistern", "Boats and Streams", "Alligation or Mixture", "Logarithm", "Races and Games",
    "Stocks and Shares", "Probability", "True Discount", "Banker's Discount", "Odd Man Out and Series")),
  S("data-interpretation", "Data Interpretation", "aptitude", "Data Interpretation", "Read tables and charts quickly and accurately: every question set comes with its own data.", t("Table Charts", "Bar Charts", "Pie Charts", "Line Charts")),

  // ───────── Verbal Ability ─────────
  S("verbal-ability", "Verbal Ability", "verbal", "Verbal Ability", "English usage for aptitude tests: error spotting, vocabulary, sentence and paragraph skills, and comprehension.", t(
    "Spotting Errors", "Antonyms", "Synonyms", "Selecting Words", "Spellings", "Sentence Formation", "Ordering of Words", "Sentence Correction", "Sentence Improvement", "Completing Statements",
    "Ordering of Sentences", "Paragraph Formation", "Cloze Test", "Comprehension", "One Word Substitutes", "Idioms and Phrases", "Change of Voice", "Change of Speech", "Verbal Analogies")),

  // ───────── Reasoning ─────────
  S("logical-reasoning", "Logical Reasoning", "reasoning", "Logical Reasoning", "Series, classification, analogies, arguments, assumptions, conclusions and deductions.", t(
    "Number Series", "Letter and Symbol Series", "Verbal Classification", "Essential Part", "Analogies", "Artificial Language", "Matching Definitions", "Making Judgments", "Verbal Reasoning", "Logical Problems",
    "Logical Games", "Analyzing Arguments", "Statement and Assumption", "Course of Action", "Statement and Conclusion", "Theme Detection", "Cause and Effect", "Statement and Argument", "Logical Deduction")),
  S("verbal-reasoning", "Verbal Reasoning", "reasoning", "Verbal Reasoning", "Blood relations, syllogisms, directions, coding, seating, cubes, dice and data sufficiency.", t(
    "Logical Sequence of Words", "Blood Relation Test", "Syllogism", "Series Completion", "Cube and Cuboid", "Dice", "Venn Diagrams", "Character Puzzles", "Direction Sense Test", "Classification",
    "Data Sufficiency", "Arithmetic Reasoning", "Verification of Truth", "Coding Decoding", "Seating Arrangement", "Ranking and Order")),
  S("non-verbal-reasoning", "Non Verbal Reasoning", "reasoning", "Non Verbal Reasoning", "Figure series, analogies, odd figure out, mirror and water images, matrices and pattern completion.", t(
    "Series", "Analogy", "Classification", "Mirror Images", "Water Images", "Figure Matrix", "Pattern Completion", "Rotation")),

  // ───────── Programming ─────────
  S("c-programming", "C Programming", "programming", "C", "Output prediction and concepts for every part of the C language.", t(
    "Declarations and Initializations", "Control Instructions", "Expressions", "Floating Point Issues", "Functions", "C Preprocessor", "Pointers", "Arrays", "Strings", "Structures, Unions, Enums",
    "Input / Output", "Command Line Arguments", "Bitwise Operators", "Typedef", "Const", "Memory Allocation", "Variable Number of Arguments", "Complicated Declarations", "Library Functions")),
  S("cpp-programming", "C++ Programming", "programming", "C++", "Object-oriented C++: classes, references, constructors, inheritance, polymorphism, templates and the STL.", t(
    "OOPS Concepts", "References", "Constructors and Destructors", "Functions", "Objects and Classes", "Inheritance", "Polymorphism and Virtual Functions", "Operator Overloading", "Templates", "Exception Handling", "STL")),
  S("csharp-programming", "C# Programming", "programming", "C#", "C# and .NET: types, classes, inheritance, interfaces, delegates, generics and exceptions.", t(
    "Introduction", ".NET Framework", "Datatypes", "Operators", "Control Instructions", "Arrays", "Strings", "Classes and Objects", "Constructors", "Inheritance", "Polymorphism", "Interfaces",
    "Properties and Indexers", "Structures and Enumerations", "Delegates and Events", "Generics", "Exception Handling", "Namespaces")),
  S("java-programming", "Java Programming", "programming", "Java", "Java SE: fundamentals, operators, flow control, OOP, exceptions, threads, strings, collections and Java 8.", t(
    "Language Fundamentals", "Operators and Assignments", "Flow Control", "Declarations and Access Control", "Objects and Classes", "Inheritance and Polymorphism", "Interfaces and Abstract Classes", "Inner Classes",
    "Exceptions", "Strings", "Java.lang Class", "Objects and Collections", "Generics", "Threads", "Garbage Collections", "Assertions", "Java 8 Features")),
  S("python-programming", "Python Programming", "programming", "Python", "Python 3: types, strings, collections, functions, OOP, exceptions and idioms - every output verified by running it.", t(
    "Basics", "Data Types", "Operators", "Strings", "Lists", "Tuples", "Dictionaries", "Sets", "Control Flow", "Functions", "Lambda and Functional Tools", "Comprehensions and Generators",
    "Object Oriented Programming", "Exceptions", "Modules and Packages", "File Handling", "Built-in Functions")),

  // ───────── Technical MCQs ─────────
  S("database", "Database", "technical", "Database", "DBMS concepts, ER modelling, SQL, normalization, transactions, indexing and NoSQL.", t(
    "Database Basics", "Data Models and ER Diagrams", "Relational Model and Keys", "SQL Basics", "Advanced SQL", "Joins", "Normalization", "Transactions and Concurrency", "Indexing and Hashing", "NoSQL Databases")),
  S("networking", "Networking", "technical", "Networking", "Network models, addressing, subnetting, devices, routing, switching, protocols and security.", t(
    "Networking Basics", "OSI Model", "TCP/IP Model", "IP Addressing", "Subnetting", "Network Devices", "Routing", "Switching and VLANs", "Application Layer Protocols", "Transport Layer", "Wireless Networks", "Network Security")),
  S("operating-systems", "Operating Systems", "technical", "Operating Systems", "Processes, CPU scheduling, synchronization, deadlocks, memory, virtual memory, file systems and disks.", t(
    "OS Basics", "Process Management", "CPU Scheduling", "Process Synchronization", "Deadlocks", "Memory Management", "Virtual Memory", "File Systems", "Disk Scheduling", "Linux Basics")),
  S("computer-fundamentals", "Computer Fundamentals", "technical", "Computer Fundamentals", "Computer basics for every exam: hardware, software, number systems, memory, devices, internet and abbreviations.", t(
    "Computer Basics", "Generations of Computers", "Computer Hardware", "Computer Software", "Number Systems", "Memory and Storage", "Input and Output Devices", "Internet and Email", "MS Office", "Computer Abbreviations")),
  S("data-structures", "Data Structures", "technical", "Data Structures", "Arrays, lists, stacks, queues, trees, heaps, graphs, hashing, searching, sorting and complexity.", t(
    "Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Binary Search Trees", "Heaps", "Graphs", "Hashing", "Searching", "Sorting", "Complexity Analysis")),
  S("software-testing", "Software Testing", "technical", "Software Testing", "Testing fundamentals, levels, types, design techniques, defect management, automation and agile testing.", t(
    "Testing Basics", "Testing Levels", "Testing Types", "Black Box Techniques", "White Box Techniques", "Test Management", "Defect Management", "Automation Testing", "Agile Testing")),
  S("software-engineering", "Software Engineering", "technical", "Software Engineering", "SDLC models, requirements, design, UML, estimation, quality, Agile and DevOps.", t(
    "SDLC Models", "Requirements Engineering", "Software Design", "UML", "Software Project Management", "Software Quality", "Agile and Scrum", "DevOps and Version Control")),
  S("digital-electronics", "Digital Electronics", "technical", "Digital Electronics", "Number codes, gates, Boolean algebra, combinational and sequential circuits, memories and converters.", t(
    "Number Systems and Codes", "Logic Gates", "Boolean Algebra", "Combinational Logic Circuits", "Flip-Flops", "Counters", "Shift Registers", "Memories", "A/D and D/A Converters", "Logic Families")),

  // ───────── Interview ─────────
  S("hr-interview", "HR Interview", "interview", "HR Interview", "Common HR questions with what the interviewer is checking and a model answer you can adapt.", t(
    "Introduction and Background", "Strengths and Weaknesses", "Career Goals", "Company and Role", "Behavioural Questions", "Situational Questions", "Teamwork and Leadership", "Salary and Closing"), "qa", "HR Interview Questions and Answers"),
  S("technical-interview", "Technical Interview", "interview", "Technical Interview", "Short-answer technical questions asked in fresher and experienced interviews.", t(
    "C Language Basics", "OOPs Concepts", "Java", "Python", "Data Structures", "DBMS", "SQL", "Operating Systems", "Networking", "Software Testing", "Web Development", "Cloud Computing"), "qa", "Technical Interview Questions and Answers"),
  S("group-discussion", "Group Discussion", "interview", "Group Discussion", "GD topics with points for and against, and how to perform well in a group discussion.", t(
    "GD Tips", "Technology Topics", "Social Topics", "Business and Economy", "Education and Career", "Abstract Topics"), "qa", "Group Discussion Topics and Points"),

  // ───────── General Knowledge ─────────
  S("general-knowledge", "General Knowledge", "gk", "General Knowledge", "Static GK for competitive exams: history, geography, polity, economy, culture, sports, awards and more.", t(
    "Basic General Knowledge", "Indian History", "Indian Geography", "Indian Politics", "Indian Economy", "Indian Culture", "World Geography", "World Organisations", "Inventions", "Famous Personalities",
    "Books and Authors", "Sports", "Awards and Honours", "Days and Dates", "First in India", "Famous Places in India")),
  S("general-science", "General Science", "gk", "General Science", "Physics, chemistry, biology, the human body, instruments, units, space and environment.", t(
    "Physics", "Chemistry", "Biology", "Human Body", "Scientific Instruments", "Units and Measurements", "Space Science", "Environment and Ecology")),

  // ───────── Engineering ─────────
  S("mechanical-engineering", "Mechanical Engineering", "engineering", "Mechanical", "Core mechanical engineering for GATE, ESE, PSU and placement tests.", t(
    "Engineering Mechanics", "Strength of Materials", "Thermodynamics", "Fluid Mechanics", "Hydraulic Machines", "Theory of Machines", "Machine Design", "Heat Transfer", "IC Engines", "Refrigeration and Air Conditioning", "Production Engineering", "Engineering Materials")),
  S("civil-engineering", "Civil Engineering", "engineering", "Civil", "Core civil engineering for GATE, ESE, PSU and state AE/JE exams.", t(
    "Building Materials", "Surveying", "Soil Mechanics and Foundation", "Concrete Technology", "RCC Structures Design", "Steel Structure Design", "Theory of Structures", "Hydraulics",
    "Irrigation", "Highway Engineering", "Railway Engineering", "Water Supply Engineering", "Waste Water Engineering", "Estimating and Costing")),
  S("electronics-and-communication", "Electronics and Communication", "engineering", "ECE", "Devices, analog circuits, networks, signals, communication, microprocessors, control and electromagnetics.", t(
    "Electronic Devices and Circuits", "Analog Electronics", "Network Analysis", "Signals and Systems", "Analog Communication", "Digital Communication", "Microprocessors", "Control Systems", "Electromagnetic Fields", "Measurements and Instrumentation")),
  S("electrical-engineering", "Electrical Engineering", "engineering", "EEE", "Circuits, machines, power systems, power electronics, measurements and protection.", t(
    "DC Circuits", "AC Fundamentals", "Magnetism and Electromagnetism", "Transformers", "DC Machines", "Induction Motors", "Synchronous Machines", "Power Systems", "Power Electronics", "Measurements and Instruments", "Switchgear and Protection", "Utilization of Electrical Energy")),
  S("chemical-engineering", "Chemical Engineering", "engineering", "Chemical", "Process calculations, transport phenomena, thermodynamics, reaction engineering and process control.", t(
    "Process Calculations", "Fluid Mechanics", "Heat Transfer", "Mass Transfer", "Chemical Engineering Thermodynamics", "Chemical Reaction Engineering", "Mechanical Operations", "Process Control", "Petroleum Refining", "Plant Economics")),
  S("computer-science-engineering", "Computer Science Engineering", "engineering", "CSE", "Theory of computation, compilers, computer organization, algorithms and discrete mathematics.", t(
    "Theory of Computation", "Compiler Design", "Computer Organization and Architecture", "Design and Analysis of Algorithms", "Discrete Mathematics", "Computer Graphics")),

  // ───────── Puzzles ─────────
  S("puzzles", "Puzzles", "puzzles", "Puzzles", "Brain teasers: number and letter puzzles, clock puzzles and classic logic puzzles. Try Sudoku too.", t(
    "Number Puzzles", "Missing Letters Puzzles", "Clock Puzzles", "Logical Puzzles", "Riddles")),
];

export const SUBJECT_BY_SLUG = new Map(SUBJECTS.map((s) => [s.slug, s]));
export const GROUP_BY_SLUG = new Map(GROUPS.map((g) => [g.slug, g]));

export function getSubjectMeta(slug: string) {
  return SUBJECT_BY_SLUG.get(slug) ?? null;
}
export function getTopicMeta(subject: string, topic: string) {
  const s = SUBJECT_BY_SLUG.get(subject);
  const tm = s?.topics.find((x) => x.slug === topic);
  return s && tm ? { subject: s, topic: tm } : null;
}
export function subjectsInGroup(group: string) {
  return SUBJECTS.filter((s) => s.group === group);
}
