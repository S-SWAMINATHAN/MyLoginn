import { extraCourses } from "@/lib/extra-courses";

export type CourseModule = { title: string; topics: string[] };

const pythonModules: CourseModule[] = [
  { title: "Python Foundations", topics: ["What is Python?", "Why Python?", "Python use cases", "Python advantages", "Python installation", "Python environment", "Getting started", "First Python program"] },
  { title: "Python Syntax", topics: ["Python syntax overview", "Python statements", "Python indentation", "Python comments", "Python keywords", "Python identifiers", "Python expressions", "Python code blocks", "Python whitespace", "Python capitalization rules", "Python delimiters", "Python parentheses and brackets", "Python syntax errors", "Common syntax mistakes", "Debugging syntax errors"] },
  { title: "Python Variables", topics: ["What is a variable?", "Creating variables", "Assigning values", "Calling variables", "Using variables in expressions", "Variable names", "Variable naming rules", "Valid variable names", "Invalid variable names", "Assigning strings to variables", "Assigning numbers to variables", "Assigning booleans to variables", "Multiple variables", "One value to multiple variables", "Multiple values to multiple variables", "Output variables", "Reassigning variables", "Variable types", "Variable scope", "Local variables", "Global variables", "The global keyword", "Constants and naming conventions", "Real-world variable usage", "Common variable mistakes", "Variable best practices", "Variable challenge"] },
  { title: "Python Data Types", topics: ["What are data types?", "Getting the data type", "Integers", "Floating-point numbers", "Complex numbers", "Strings", "Booleans", "Lists", "Tuples", "Sets", "Dictionaries", "None", "Type conversion", "Type checking"] },
  { title: "Python Numbers & Casting", topics: ["Integers", "Floating-point numbers", "Complex numbers", "Number operations", "Type conversion", "Casting with int()", "Casting with float()", "Casting with complex()"] },
  { title: "Python String Workshop", topics: ["Creating strings", "Single and double quotes", "Multiline strings", "String indexing", "String slicing", "Negative indexing", "String length", "String methods", "Uppercase and lowercase", "Removing whitespace", "Replacing and splitting strings", "Concatenating strings", "String formatting", "f-strings", "Escape characters"] },
  { title: "Python Booleans & Operators", topics: ["Boolean values", "True and False", "Comparison operators", "Arithmetic operators", "Assignment operators", "Logical operators", "Identity operators", "Membership operators", "Operator precedence"] },
  { title: "Python Lists", topics: ["Creating lists", "Accessing list items", "List indexing", "Negative list indexing", "List slicing", "Changing list values", "Adding list items", "Removing list items", "List methods", "Sorting lists", "Copying lists", "Joining lists", "List comprehensions"] },
  { title: "Python Tuples", topics: ["Creating tuples", "Accessing tuple items", "Tuple indexing", "Tuple slicing", "Updating tuple data", "Tuple unpacking", "Tuple methods"] },
  { title: "Python Sets", topics: ["Creating sets", "Adding set elements", "Removing set elements", "Set operations", "Set union", "Set intersection", "Set difference", "Symmetric difference"] },
  { title: "Python Dictionaries", topics: ["Creating dictionaries", "Key and value pairs", "Accessing dictionary values", "Adding dictionary values", "Updating dictionaries", "Removing dictionary values", "Dictionary methods", "Looping through dictionaries", "Nested dictionaries"] },
  { title: "Python Logic & Decision Making", topics: ["if statements", "elif statements", "else statements", "Nested if statements", "Comparison conditions", "Logical conditions", "Shorthand if", "Ternary expressions"] },
  { title: "Python Loop Mastery", topics: ["while loops", "for loops", "range() with loops", "Nested loops", "break statements", "continue statements", "pass statements", "Looping through lists", "Looping through strings", "Looping through dictionaries", "Looping through sets"] },
  { title: "Python Functions Lab", topics: ["What is a function?", "Creating functions", "Calling functions", "Parameters", "Arguments", "Default arguments", "Keyword arguments", "Arbitrary arguments", "*args", "**kwargs", "Return values", "Multiple return values", "Function scope", "Local variables", "Global variables", "Recursion", "Lambda functions"] },
  { title: "Python Ranges & Iterators", topics: ["The range() function", "What is an iterable?", "What is an iterator?", "iter()", "next()", "Looping through iterables", "Iterator behavior"] },
  { title: "Python Arrays & NumPy", topics: ["The array concept", "Python lists versus arrays", "The array module", "NumPy array introduction", "Choosing a list or array"] },
  { title: "Python Modules & Packages", topics: ["What is a module?", "Creating modules", "The import statement", "from imports", "Import aliases", "Built-in modules", "Packages", "__name__", "__main__"] },
  { title: "Python Dates & Time", topics: ["The datetime module", "date values", "time values", "timedelta", "Formatting dates", "Parsing dates"] },
  { title: "Python Math & Random", topics: ["The math module", "Mathematical functions", "Math constants", "Rounding numbers", "Random basics"] },
  { title: "Python JSON & Data", topics: ["What is JSON?", "JSON structure", "JSON objects", "JSON arrays", "json.loads()", "json.dumps()", "Reading JSON", "Writing JSON", "API-style JSON"] },
  { title: "Python Regex Lab", topics: ["What is regex?", "Regex patterns", "The re module", "re.search()", "re.match()", "re.findall()", "re.split()", "re.sub()", "Special characters", "Character classes", "Quantifiers", "Practical validation"] },
  { title: "Python Packages & Environments", topics: ["What is pip?", "Installing packages", "Updating packages", "Removing packages", "requirements.txt", "Package versions", "Virtual environments", "venv", "Activating environments", "Deactivating environments"] },
  { title: "Python Error Handling", topics: ["Errors and exceptions", "try and except", "else and finally", "Raising exceptions", "Custom exceptions"] },
  { title: "Python User Input", topics: ["input()", "Converting input", "Validating input", "Handling invalid input", "Building interactive programs"] },
  { title: "Python OOP Mastery", topics: ["What is object-oriented programming?", "Classes", "Objects", "__init__", "self", "Properties", "Instance methods", "Class variables", "Instance variables", "Class methods", "Static methods", "Inheritance", "Multiple inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Method overriding", "super()", "Magic methods", "__str__ and __repr__", "__len__", "Operator overloading", "Nested classes"] },
  { title: "Python File & Data Handling", topics: ["Opening files", "Reading files", "Reading a complete file", "Reading lines", "Writing files", "Appending to files", "Creating files", "Deleting files", "File modes", "The with statement", "File paths", "Handling file exceptions"] },
  { title: "Advanced Python Toolkit", topics: ["Comprehensions", "Generators", "yield", "Decorators", "Closures", "Context managers", "Type hints", "Dataclasses", "enumerate()", "zip()", "map()", "filter()", "functools.reduce()", "Unpacking", "Advanced function patterns"] },
  { title: "Python Data & Web Libraries", topics: ["NumPy introduction", "Pandas introduction", "Matplotlib introduction", "SciPy introduction", "Requests introduction", "Flask introduction", "Django introduction"] },
  { title: "Python Algorithms & Sorting", topics: ["Merge sort visual walkthrough", "Tracing a recursive merge sort"] },
  { title: "Python Project Studio", topics: ["Calculator project", "Number guessing game", "To-do list project", "Student marks calculator", "Password generator", "Contact manager", "Expense tracker", "Quiz application", "File organizer", "Simple API client", "JSON data manager", "Basic data analysis project"] },
];

const courseModules: Record<string, CourseModule[]> = {
  "java-fundamentals": [
    { title: "Java Foundations", topics: ["Introduction to Java", "Java history and ecosystem", "JDK, JRE, and JVM", "Install a JDK and verify Java", "Your first Java program", "Compile and run from a terminal", "Java syntax and code structure", "Comments and readable code"] },
    { title: "Values and Expressions", topics: ["Variables and assignment", "Primitive data types", "Reference types and String", "Constants with final", "Type conversion and casting", "Arithmetic operators", "Comparison and logical operators", "String concatenation and methods", "Reading input with Scanner"] },
    { title: "Control Flow", topics: ["Boolean conditions", "if, else if, and else", "switch statements", "for loops", "while loops", "do-while loops", "break and continue", "Nested decisions and loops"] },
    { title: "Arrays and Methods", topics: ["Creating and indexing arrays", "Updating and traversing arrays", "Two-dimensional arrays", "Defining and calling methods", "Parameters and arguments", "Return values", "Method overloading", "Variable scope"] },
    { title: "Object-Oriented Java", topics: ["Classes and objects", "Fields and constructors", "this and instance state", "Encapsulation and access modifiers", "Static fields and methods", "Inheritance and super", "Method overriding and polymorphism", "Abstract classes and interfaces"] },
    { title: "Reliable Programs", topics: ["Exception fundamentals", "try and catch", "finally and resource cleanup", "ArrayList and collections", "Packages and imports", "Build a small grade tracker"] },
  ],
  "javascript-fundamentals": [
    { title: "JavaScript Foundations", topics: ["Introduction to JavaScript", "JavaScript history and ECMAScript", "Browser JavaScript and Node.js", "Set up a browser and editor", "Your first JavaScript program", "Statements, expressions, and syntax", "Comments and debugging with the console"] },
    { title: "Values and Variables", topics: ["Variables with let and const", "Primitive data types", "Dynamic typing and typeof", "Numbers and numeric conversion", "Strings and template literals", "Boolean values and truthiness", "Equality and comparison", "Arithmetic and logical operators", "Null and undefined"] },
    { title: "Decisions and Repetition", topics: ["if, else if, and else", "switch statements", "for loops", "while loops", "break and continue", "Looping through an array"] },
    { title: "Functions and Data", topics: ["Function declarations", "Parameters, arguments, and return", "Arrow functions", "Scope and block bindings", "Arrays and indexing", "Array methods: map and filter", "Objects and properties", "Destructuring basics", "JSON data"] },
    { title: "Browser Interaction", topics: ["The document object model", "Selecting page elements", "Changing text and attributes", "Handling click events", "Reading form values", "Update a page from user input"] },
    { title: "Asynchronous Basics and Practice", topics: ["What asynchronous code means", "Promises at a high level", "Fetch a JSON resource", "Handle a failed request", "Build an interactive task list"] },
  ],
  "html-fundamentals": [
    { title: "Web and HTML Foundations", topics: ["Introduction to HTML", "How browsers render a page", "Document structure", "Doctype, head, and body", "Character encoding and page language", "Headings and paragraphs", "HTML comments and whitespace"] },
    { title: "Content and Navigation", topics: ["Text emphasis and inline elements", "Links and URL paths", "Images and alternative text", "Ordered and unordered lists", "Grouping content with div and span", "Special characters and entities"] },
    { title: "Structured Information", topics: ["Semantic page landmarks", "Tables, rows, and cells", "Accessible table headers", "Audio and video basics"] },
    { title: "Forms and Accessibility", topics: ["Form purpose and submission", "Labels and input controls", "Input types and validation", "Buttons and button types", "Select menus and text areas", "Keyboard and accessible names"] },
    { title: "Build and Review", topics: ["Connect HTML with CSS and JavaScript", "Inspect a page in browser tools", "Build a semantic profile page", "HTML validation and common mistakes"] },
  ],
  "css-fundamentals": [
    { title: "CSS Foundations", topics: ["Introduction to CSS", "How the browser applies styles", "Adding CSS to a page", "CSS rules and declarations", "Element, class, and ID selectors", "Combining selectors", "Cascade and specificity"] },
    { title: "Color and Type", topics: ["Color formats and contrast", "Backgrounds and gradients", "Font families and fallbacks", "Text size, weight, and line height", "Web font basics"] },
    { title: "The Box Model", topics: ["Width and height", "Margin and padding", "Borders and outlines", "Box sizing", "Display values", "Positioning elements"] },
    { title: "Page Layout", topics: ["Normal document flow", "Flexbox container and axes", "Flexbox alignment and spacing", "CSS Grid fundamentals", "Reusable spacing and CSS variables"] },
    { title: "Responsive Design", topics: ["Viewport and responsive goals", "Media queries", "Fluid widths and max-width", "Responsive images", "Focus states and reduced motion", "Style a responsive card layout"] },
  ],
  "sql-fundamentals": [
    { title: "Relational Data Foundations", topics: ["Introduction to SQL and databases", "Tables, rows, and columns", "Primary keys and relationships", "SQL statements and conventions"] },
    { title: "Read Data with SELECT", topics: ["SELECT specific columns", "Column aliases and expressions", "WHERE and comparison operators", "AND, OR, and NOT", "IN, BETWEEN, and LIKE", "NULL and IS NULL", "ORDER BY", "LIMIT and result size"] },
    { title: "Change Data Safely", topics: ["INSERT a row", "UPDATE selected rows", "DELETE selected rows", "Why WHERE matters", "Transactions and rollback basics"] },
    { title: "Summaries and Relationships", topics: ["COUNT, SUM, AVG, MIN, and MAX", "GROUP BY", "Filter groups with HAVING", "INNER JOIN", "LEFT JOIN", "Join keys and duplicate rows"] },
    { title: "Query Practice", topics: ["Subqueries at a high level", "Query order of operations", "Design a small course database", "Write and review practical queries"] },
  ],
  "c-fundamentals": [
    { title: "C Foundations", topics: ["Introduction to C", "C history and compiled programs", "Install a C compiler", "Your first C program", "Compile and run from a terminal", "C syntax and blocks", "Comments and header files"] },
    { title: "Values and Input", topics: ["Variables and assignment", "Integer and floating-point types", "Characters and strings", "Constants with const", "Arithmetic and comparison operators", "printf format specifiers", "Read input with scanf", "Type conversion basics"] },
    { title: "Control Flow", topics: ["if, else if, and else", "switch statements", "for loops", "while loops", "do-while loops", "break and continue"] },
    { title: "Arrays and Functions", topics: ["Create and index arrays", "Traverse arrays with loops", "C strings and character arrays", "Define and call functions", "Parameters and return values", "Scope and header declarations"] },
    { title: "Memory and Structured Data", topics: ["Addresses and the address operator", "Pointer basics and dereferencing", "Pointers and arrays", "Null pointers and safe checks", "Structures and fields", "Build a small score summary"] },
  ],
  "cpp-fundamentals": [
    { title: "C++ Foundations", topics: ["Introduction to C++", "C++ history and compiled programs", "Install a C++ compiler", "Your first C++ program", "Compile and run from a terminal", "C++ syntax and code blocks", "Headers, namespaces, and comments"] },
    { title: "Values and Input", topics: ["Variables and assignment", "Built-in data types", "const and constexpr basics", "Type conversion", "Arithmetic and comparison operators", "Strings with std::string", "Output with std::cout", "Input with std::cin"] },
    { title: "Control Flow", topics: ["if, else if, and else", "switch statements", "for loops", "while loops", "Range-based for loops", "break and continue"] },
    { title: "Functions and Collections", topics: ["Define and call functions", "Parameters and return values", "Function overloading", "Arrays and indexing", "Vectors and dynamic lists", "String operations", "References basics"] },
    { title: "Classes and Practice", topics: ["Classes and objects", "Access control and encapsulation", "Constructors", "Member functions and state", "Inheritance basics", "Build a small inventory tracker"] },
  ],
};

function defineModules(groups: [string, string][]): CourseModule[] {
  return groups.map(([title, topics]) => ({ title, topics: topics.split("|").map((topic) => topic.trim()).filter(Boolean) }));
}

// Complete beginner-to-reference paths for every free programming course.
// Each topic is also a lesson in the shared course tutorial and progress flow.
const expandedCourseModules: Record<string, CourseModule[]> = {
  "java-fundamentals": defineModules([
    ["Java Foundations", "Java HOME|Java Intro|Java Get Started|Java Syntax|Java Output|Java Comments|Java Variables|Java Data Types|Java Type Casting|Java Operators|Java Strings|Java Math|Java Booleans|Java If...Else|Java Switch|Java While Loop|Java For Loop|Java Break/Continue|Java Arrays"],
    ["Java Methods", "Java Methods|Java Method Challenge|Java Method Parameters|Java Method Overloading|Java Scope|Java Recursion"],
    ["Java Classes and OOP", "Java OOP|Java Classes/Objects|Java Class Attributes|Java Class Methods|Java Class Challenge|Java Constructors|Java this Keyword|Java Modifiers|Java Encapsulation|Java Packages / API|Java Inheritance|Java Polymorphism|Java super Keyword|Java Inner Classes|Java Abstraction|Java Interface|Java Anonymous Classes|Java Enum|Java User Input|Java Date"],
    ["Java Errors and Files", "Java Errors|Java Debugging|Java Exceptions|Java Multiple Exceptions|Java try-with-resources|Java Files|Java Create Files|Java Write Files|Java Read Files|Java Delete Files|Java I/O Streams|Java FileInputStream|Java FileOutputStream|Java BufferedReader|Java BufferedWriter"],
    ["Java Data Structures", "Java Data Structures|Java Collections|Java List|Java ArrayList|Java LinkedList|Java List Sorting|Java Set|Java HashSet|Java TreeSet|Java LinkedHashSet|Java Map|Java HashMap|Java TreeMap|Java LinkedHashMap|Java Iterator|Java Algorithms"],
    ["Java Advanced", "Java Wrapper Classes|Java Generics|Java Annotations|Java RegEx|Java Threads|Java Lambda|Java Advanced Sorting|Java Networking|Java JDBC|Java Date and Time API|Java Streams|Java Records|Java Modules"],
    ["Java Application Development", "Java Optional Values|Java Stream Pipelines|Java Functional Interfaces|Java Switch Expressions|Java Text Blocks|Java HTTP Client|Java JDBC Transactions|Java Maven Basics|Java Unit Testing|Java ExecutorService|Java Synchronization|Java Secure Input Handling"],
    ["Java Projects and Practice", "Java Projects|Java Certificate|Java How Tos|Java Examples|Java Videos|Java Compiler|Java Exercises|Java Quiz|Java Code Challenges|Java Practice Problems|Java Server|Java Syllabus|Java Study Plan|Java Interview Q&A"],
    ["Java References", "Java Reference|Java Keywords|Java String Methods|Java Math Methods|Java Output Methods|Java Arrays Methods|Java ArrayList Methods|Java LinkedList Methods|Java HashMap Methods|Java Scanner Methods|Java File Methods|Java Iterator Methods|Java Collections Methods|Java System Methods|Java Errors & Exceptions"],
  ]),
  "html-fundamentals": defineModules([
    ["HTML Foundations", "HTML HOME|HTML Introduction|HTML Editors|HTML Basic|HTML Elements|HTML Attributes|HTML Headings|HTML Paragraphs|HTML Styles|HTML Formatting|HTML Quotations|HTML Comments|HTML Colors|HTML CSS|HTML Links|HTML Images|HTML Project|HTML Favicon|HTML Page Title|HTML Tables|HTML Lists|HTML Block & Inline|HTML Div|HTML Classes|HTML Id|HTML Buttons|HTML Iframes|HTML JavaScript|HTML File Paths|HTML Head|HTML Layout|HTML Responsive|HTML Computercode|HTML Semantics|HTML Style Guide|HTML Entities|HTML Symbols|HTML Emojis|HTML Charsets|HTML URL Encode|HTML vs. XHTML"],
    ["HTML Forms and Graphics", "HTML Forms|HTML Form Attributes|HTML Form Elements|HTML Input Types|HTML Input Attributes|Input Form Attributes|HTML Canvas|HTML SVG"],
    ["HTML Media and Web APIs", "HTML Media|HTML Video|HTML Audio|HTML Plug-ins|HTML YouTube|Web APIs|Geolocation API|Drag and Drop API|Popover API|Web Storage API|Web Workers API|Server-Sent Events API"],
    ["HTML Modern Patterns", "HTML Picture and Source Sets|HTML Lazy-Loaded Images|HTML Details and Summary|HTML Dialog Element|HTML Data Attributes|HTML Metadata and Social Cards|HTML Language and Direction|HTML Accessible Navigation|HTML Form Autocomplete|HTML Native Validation|HTML Print-Friendly Pages|HTML Structured Data Basics"],
    ["HTML Projects and Practice", "HTML Certificate|HTML Examples|HTML Editor|HTML Quiz|HTML Exercises|HTML Challenges|HTML Website|HTML Syllabus|HTML Study Plan|HTML Interview Prep|HTML Summary|HTML Accessibility|HTML SEO Basics|HTML Validation|HTML Forms Project|HTML Portfolio Project"],
    ["HTML References", "HTML Tag List|HTML Attributes Reference|HTML Global Attributes|HTML Browser Support|HTML Events|HTML Colors Reference|HTML Canvas Reference|HTML Audio/Video Reference|HTML Doctypes|HTML Character Sets|HTML URL Encode Reference|HTML Lang Codes|HTTP Messages|HTTP Methods|PX to EM Converter|Keyboard Shortcuts"],
  ]),
  "css-fundamentals": defineModules([
    ["CSS Foundations", "CSS HOME|CSS Introduction|CSS Syntax|CSS Selectors|CSS How To|CSS Comments|CSS Errors|CSS Colors|CSS Backgrounds|CSS Borders|CSS Margins|CSS Padding|CSS Height / Width|CSS Box Model|CSS Outline|CSS Text|CSS Fonts|CSS Icons|CSS Links|CSS Lists|CSS Tables|CSS Display|CSS Max-width|CSS Position|CSS Position Offsets|CSS Z-index|CSS Overflow|CSS Float|CSS Inline-block|CSS Align|CSS Combinators|CSS Pseudo-classes|CSS Pseudo-elements|CSS Opacity|CSS Navigation Bars|CSS Dropdowns|CSS Image Gallery|CSS Image Sprites|CSS Attribute Selectors|CSS Forms|CSS Counters|CSS Units|CSS Inheritance|CSS Specificity|CSS !important|CSS Math Functions|CSS Optimization|CSS Accessibility|CSS Website Layout"],
    ["Advanced CSS", "CSS Rounded Corners|CSS Border Images|CSS Background Techniques|CSS Color Systems|CSS Gradients|CSS Shadows|CSS Text Effects|CSS Custom Fonts|CSS 2D Transforms|CSS 3D Transforms|CSS Transitions|CSS Animations|CSS Tooltips|CSS Image Styling|CSS Image Modal|CSS Image Centering|CSS Image Filters|CSS Image Shapes|CSS object-fit|CSS object-position|CSS Masking|CSS Buttons|CSS Pagination|CSS Multiple Columns|CSS User Interface|CSS Variables|CSS @property|CSS Box Sizing|CSS Functions|CSS Media Queries"],
    ["Flexbox and Grid", "Flexbox Intro|Flex Container|Flex Items|Flex Responsive|Grid Intro|Grid Container|Grid Items|Grid 12-column Layout|CSS @supports"],
    ["Responsive CSS", "RWD Intro|RWD Viewport|RWD Grid View|RWD Media Queries|RWD Images|RWD Videos|RWD Frameworks|RWD Templates"],
    ["CSS Modern Layout and Systems", "CSS Container Queries|CSS Container Units|CSS clamp() Fluid Sizing|CSS Logical Properties|CSS Aspect Ratio|CSS Cascade Layers|CSS Nesting|CSS Dark Color Schemes|CSS Focus-visible States|CSS Reduced Motion|CSS Print Styles|CSS Component Architecture"],
    ["CSS Projects and Practice", "CSS Certificate|SASS Tutorial|CSS Templates|CSS Examples|CSS Editor|CSS Snippets|CSS Quiz|CSS Exercises|CSS Code Challenges|CSS Website|CSS Syllabus|CSS Study Plan|CSS Interview Prep|CSS Component Project|CSS Portfolio Project"],
    ["CSS References", "CSS Reference|CSS Selectors Reference|CSS Combinators Reference|CSS Pseudo-classes Reference|CSS Pseudo-elements Reference|CSS At-rules|CSS Functions Reference|CSS Reference Aural|CSS Web Safe Fonts|CSS Animatable|CSS Units Reference|CSS PX-EM Converter|CSS Colors Reference|CSS Color Values|CSS Default Values|CSS Browser Support"],
  ]),
  "javascript-fundamentals": defineModules([
    ["JavaScript Foundations", "JS Home|JS Introduction|JS Where To|JS Output|JS Syntax|JS Operators|JS If Conditions|JS Loops|JS Strings|JS Numbers|JS Functions|JS Timers|JS Objects|JS Scope|JS Dates|JS Arrays|JS Sets|JS Maps|JS Iterations|JS Math|JS RegExp|JS Data Types|JS Errors|JS Debugging|JS Style Guide|JS HTML First"],
    ["Browser and Web APIs", "JS HTML DOM|JS HTML Events|JS Web API|JS Window API|JS Fetch API|JS JSON|JS Web Storage|JS Geolocation|JS Web Workers|JS Canvas and Graphics|JS Modules|JS Promises|JS Async/Await|JS Event Loop|JS Form Validation"],
    ["Advanced JavaScript", "JS Temporal|JS Functions Advanced|JS Objects Advanced|JS Classes|JS Asynchronous|JS Meta & Proxy|JS Typed Arrays|JS DOM Navigation|JS Iterators and Generators|JS Regular Expressions|JS Internationalization|JS Memory Management|JS Performance"],
    ["JavaScript Application Skills", "JS Closures|JS Prototypes|JS this Keyword|JS Error Handling|JS Promise Combinators|JS AbortController|JS Fetch Retry Patterns|JS Local Storage|JS Session Storage|JS Intersection Observer|JS Web Components|JS Accessibility Patterns|JS Security Basics|JS Unit Testing"],
    ["Legacy Technologies", "JS AJAX|JS jQuery|JS JSONP"],
    ["JavaScript Projects and Practice", "JS Projects|JS Versions|JS Examples|JS Editor|JS Quiz|JS Exercises|JS Code Challenges|JS Practice Problems|JS Syllabus|JS Study Plan|JS Interview Prep|JS Todo App Project|JS Weather App Project|JS API Dashboard Project"],
    ["JavaScript References", "JS Reference|JS Array Methods|JS String Methods|JS Number Methods|JS Math Methods|JS Date Methods|JS Object Methods|JS Promise Reference|JS DOM Reference|JS Events Reference|JS Operators Reference|JS Keywords Reference"],
  ]),
  "sql-fundamentals": defineModules([
    ["SQL Foundations and Queries", "SQL Tutorial|SQL HOME|SQL Intro|SQL Syntax|SQL Select|SQL Select Distinct|SQL Where|SQL Order By|SQL And|SQL Or|SQL Not|SQL Insert Into|SQL Null Values|SQL Update|SQL Delete|SQL Select Top|SQL Limit|SQL Aggregate Functions|SQL Min()|SQL Max()|SQL Count()|SQL Sum()|SQL Avg()|SQL Like|SQL Wildcards|SQL In|SQL Between|SQL Aliases|SQL Joins|SQL Inner Join|SQL Left Join|SQL Right Join|SQL Full Join|SQL Self Join|SQL Union|SQL Union All|SQL Group By|SQL Having|SQL Exists|SQL Any|SQL All|SQL Select Into|SQL Insert Into Select|SQL Case|SQL Null Functions|SQL Stored Procedures|SQL Comments|SQL Operators"],
    ["SQL Database Design and Safety", "SQL Create DB|SQL Drop DB|SQL Backup DB|SQL Create Table|SQL Drop Table|SQL Alter Table|SQL Constraints|SQL Not Null|SQL Unique|SQL Primary Key|SQL Foreign Key|SQL Check|SQL Default|SQL Create Index|SQL Auto Increment|SQL Dates|SQL Views|SQL Injection|SQL Parameters|SQL Prepared Statements|SQL Transactions|SQL Normalization|SQL Data Modeling"],
    ["SQL Advanced Queries and Operations", "SQL Common Table Expressions|SQL Recursive CTEs|SQL Window Functions|SQL ROW_NUMBER()|SQL RANK() and DENSE_RANK()|SQL Partitioning Results|SQL Correlated Subqueries|SQL Conditional Aggregation|SQL Composite Indexes|SQL EXPLAIN Query Plans|SQL Transaction Isolation|SQL Locks and Concurrency|SQL Pagination Strategies|SQL Safe Schema Migrations"],
    ["SQL Projects and Practice", "SQL Hosting|SQL Certificate|SQL Examples|SQL Editor|SQL Quiz|SQL Exercises|SQL Server|SQL Syllabus|SQL Study Plan|SQL Training|SQL Reporting Project|SQL Database Project"],
    ["SQL References", "SQL Data Types|SQL Keywords|MySQL Functions|SQL Server Functions|MS Access Functions|SQL Quick Ref|SQL Window Functions|SQL Date Functions|SQL String Functions"],
  ]),
  "c-fundamentals": defineModules([
    ["C Foundations", "C Tutorial|C HOME|C Intro|C Get Started|C Syntax|C Output|C Comments|C Variables|C Data Types|C Type Conversion|C Constants|C Operators|C Booleans|C If...Else|C Switch|C While Loop|C For Loop|C Break/Continue|C Arrays|C Strings|C User Input|C Memory Address|C Pointers"],
    ["C Functions", "C Functions|C Function Parameters|C Scope|C Function Declaration|C Functions Challenge|C Math Functions|C Inline Functions|C Recursion|C Function Pointers"],
    ["C Files and Data Structures", "C Create Files|C Write To Files|C Read Files|C Structures|C Structs Challenge|C Nested Structures|C Structs & Pointers|C Unions|C typedef|C Struct Padding|C Enums|C Memory Management"],
    ["C Errors and Systems", "C Errors|C Error Challenge|C Debugging|C NULL|C Error Handling|C Input Validation|C Date|C Random Numbers|C Macros|C Organize Code|C Storage Classes|C Bitwise Operators|C Fixed-width Integers|C Preprocessor|C Command Line Arguments|C Dynamic Memory"],
    ["C Systems Programming", "C Header Guards|C const Pointers|C Pointer Arithmetic|C Function Pointers and Callbacks|C malloc and calloc|C realloc and free|C Safe String Handling|C Linked Lists|C Binary File I/O|C Command-line Argument Parsing|C Makefile Basics|C Unit Testing in C|C Undefined Behavior|C Sanitizer Basics"],
    ["C Projects and Practice", "C Projects|C Certificate|C Examples|C Real-Life Examples|C Exercises|C Quiz|C Code Challenges|C Practice Problems|C Compiler|C Syllabus|C Study Plan|C Interview Q&A"],
    ["C References", "C Reference|C Keywords|C <stdio.h>|C <stdlib.h>|C <string.h>|C <math.h>|C <ctype.h>|C <time.h>|C <stdint.h>|C <stdbool.h>"],
  ]),
  "cpp-fundamentals": defineModules([
    ["C++ Foundations", "C++ Tutorial|C++ HOME|C++ Intro|C++ Get Started|C++ Syntax|C++ Output|C++ Comments|C++ Variables|C++ User Input|C++ Data Types|C++ Operators|C++ Strings|C++ Math|C++ Booleans|C++ If...Else|C++ Switch|C++ While Loop|C++ For Loop|C++ Break/Continue|C++ Arrays|C++ Structures|C++ Enums|C++ References|C++ Pointers|C++ Memory Management"],
    ["C++ Functions and Classes", "C++ Functions|C++ Function Parameters|C++ Function Overloading|C++ Scope|C++ Recursion|C++ Lambda|C++ OOP|C++ Classes/Objects|C++ Class Methods|C++ Constructors|C++ Access Specifiers|C++ Encapsulation|C++ Friend Functions|C++ Inheritance|C++ Polymorphism|C++ Templates"],
    ["C++ Data and Reliability", "C++ Files|C++ Date|C++ Errors|C++ Debugging|C++ Exceptions|C++ Input Validation|C++ Data Structures & STL|C++ Vectors|C++ List|C++ Stacks|C++ Queues|C++ Deque|C++ Sets|C++ Maps|C++ Iterators|C++ Algorithms|C++ Namespaces|C++ Smart Pointers|C++ Move Semantics|C++ Concurrency Basics"],
    ["Modern C++ Practices", "C++ RAII|C++ unique_ptr and shared_ptr|C++ optional and variant|C++ Structured Bindings|C++ Range-based Algorithms|C++ Lambda Captures|C++ Rule of Zero|C++ Copy and Move Constructors|C++ Templates and Concepts|C++ Chrono Basics|C++ Mutex and Lock Guard|C++ Thread Safety|C++ CMake Basics|C++ Unit Testing"],
    ["C++ Projects and Practice", "C++ Projects|C++ Certificate|C++ Add Two Numbers|C++ Random Numbers|C++ Examples|C++ Real-Life Examples|C++ Compiler|C++ Exercises|C++ Quiz|C++ Code Challenges|C++ Practice Problems|C++ Syllabus|C++ Study Plan"],
    ["C++ References", "C++ Reference|C++ Keywords|C++ <iostream>|C++ <fstream>|C++ <cmath>|C++ <string>|C++ <cstring>|C++ <ctime>|C++ <vector>|C++ <algorithm>|C++ <memory>|C++ <utility>"],
  ]),
  "php-fundamentals": defineModules([
    ["PHP Foundations", "PHP Tutorial|PHP HOME|PHP Intro|PHP Install|PHP Syntax|PHP Comments|PHP Variables|PHP Echo / Print|PHP Data Types|PHP Strings|PHP Numbers|PHP Casting|PHP Math|PHP Constants|PHP Magic Constants|PHP Operators|PHP If...Else...Elseif|PHP Switch|PHP Match|PHP Loops|PHP Functions|PHP Arrays|PHP Superglobals|PHP RegEx|PHP RegEx Functions"],
    ["PHP Forms and Web Requests", "PHP Form Handling|PHP Form Validation|PHP Form Required|PHP Form URL/E-mail|PHP Form Complete|PHP Cookies|PHP Sessions|PHP Filters|PHP Filters Advanced|PHP JSON|PHP AJAX Intro|PHP AJAX|AJAX PHP|AJAX Database|AJAX XML|AJAX Live Search|AJAX Poll"],
    ["Advanced PHP and OOP", "PHP Date and Time|PHP Include|PHP File Handling|PHP File Open/Read|PHP File Create/Write|PHP File Upload|PHP Callback Functions|PHP Exceptions|PHP What is OOP|PHP Classes/Objects|PHP Constructor|PHP Destructor|PHP Access Modifiers|PHP Inheritance|PHP Class Constants|PHP Abstract Classes|PHP Interfaces|PHP Traits|PHP Static Methods|PHP Static Properties|PHP Namespaces|PHP Iterables|PHP Generators|PHP Attributes|PHP Composer Basics|PHP Security Basics"],
    ["PHP Web Application Skills", "PHP Strict Types|PHP Composer Autoloading|PHP Routing Basics|PHP Request and Response|PHP Middleware Concepts|PHP Output Escaping|PHP CSRF Protection|PHP Password Hashing|PHP Secure File Uploads|PHP Environment Configuration|PHP REST API Basics|PHP API Error Responses|PHP PHPUnit Basics|PHP Logging and Diagnostics"],
    ["PHP and MySQL", "MySQL Database|MySQL Connect|MySQL Create DB|MySQL Create Table|MySQL Insert Data|MySQL Get Last ID|MySQL Insert Multiple|MySQL Prepared|MySQL Select Data|MySQL Where|MySQL Order By|MySQL Delete Data|MySQL Update Data|MySQL Limit Data|PHP PDO|PHP Database Transactions"],
    ["PHP XML and Practice", "PHP XML Parsers|PHP SimpleXML Parser|PHP SimpleXML - Get|PHP XML Expat Parser|PHP DOM Parser|PHP Certificate|PHP Examples|PHP Compiler|PHP Quiz|PHP Exercises|PHP Practice Problems|PHP Server|PHP Syllabus|PHP Study Plan|PHP File Upload Project|PHP CRUD Project"],
    ["PHP References", "PHP Overview|PHP Array|PHP Calendar|PHP Date|PHP Directory|PHP Error|PHP Exception|PHP Filesystem|PHP Filter|PHP FTP|PHP JSON Reference|PHP Keywords|PHP Libxml|PHP Mail|PHP Math Reference|PHP Misc|PHP MySQLi|PHP Network|PHP Output Control|PHP RegEx Reference|PHP SimpleXML Reference|PHP Stream|PHP String|PHP Variable Handling|PHP XML Parser|PHP Zip|PHP Timezones"],
  ]),
  "react-fundamentals": defineModules([
    ["React Foundations", "React Tutorial|React Home|React Intro|React Get Started|React First App|React Render HTML|React Upgrade|React ES6|React JSX Intro|React JSX Expressions|React JSX Attributes|React JSX If Statements|React Components|React Class|React Props|React Props Destructuring|React Props Children|React Events|React Conditionals|React Lists|React Forms|React Forms Submit|React Textarea|React Select|React Multiple Inputs|React Checkbox|React Radio|React CSS Styling|React CSS Modules|React CSS-in-JS"],
    ["React Hooks and App Patterns", "What is Hooks?|React useState|React useEffect|React useContext|React useRef|React useReducer|React useCallback|React useMemo|React Custom Hooks|React Router|React Portals|React Suspense|React Transitions|React Forward Ref|React HOC|React Sass|React Error Boundaries|React Context Patterns|React Data Fetching|React Accessibility|React Testing Basics|React Performance"],
    ["React State and Production Patterns", "React Lifting State Up|React State Shape|React Effect Cleanup|React Functional State Updates|React Reducer Patterns|React Context Performance|React Controlled Components|React Form Validation|React Lazy Loading|React Code Splitting|React Optimistic Updates|React Server and Client Boundaries|React Testing User Events|React Keyboard Accessibility|React App Project Structure"],
    ["React Projects and Practice", "React Certificate|React Exercises|React Compiler|React Quiz|React Syllabus|React Study Plan|React Server Components|React Interview Prep|React Todo App Project|React Weather App Project|React Portfolio Project"],
  ]),
  "mysql-fundamentals": defineModules([
    ["MySQL Foundations and Queries", "MySQL Tutorial|MySQL HOME|MySQL Intro|MySQL RDBMS|MySQL SQL|MySQL SELECT|MySQL SELECT DISTINCT|MySQL WHERE|MySQL ORDER BY|MySQL AND|MySQL OR|MySQL NOT|MySQL INSERT INTO|MySQL NULL Values|MySQL UPDATE|MySQL DELETE|MySQL LIMIT|MySQL Aggregate Functions|MySQL MIN()|MySQL MAX()|MySQL COUNT()|MySQL SUM()|MySQL AVG()|MySQL LIKE|MySQL Wildcards|MySQL IN|MySQL BETWEEN|MySQL Aliases|MySQL Joins|MySQL INNER JOIN|MySQL LEFT JOIN|MySQL RIGHT JOIN|MySQL CROSS JOIN|MySQL Self Join|MySQL UNION|MySQL UNION ALL|MySQL GROUP BY|MySQL HAVING|MySQL EXISTS|MySQL ANY|MySQL ALL|MySQL INSERT SELECT|MySQL CASE|MySQL Null Functions|MySQL Stored Procedures|MySQL Comments|MySQL Operators"],
    ["MySQL Database Design", "MySQL Create DB|MySQL Drop DB|MySQL Create Table|MySQL Drop Table|MySQL Alter Table|MySQL Constraints|MySQL Not Null|MySQL Unique|MySQL Primary Key|MySQL Foreign Key|MySQL Check|MySQL Default|MySQL Create Index|MySQL Auto Increment|MySQL Dates|MySQL Views|MySQL Injection|MySQL Prepared Statements|MySQL Transactions|MySQL Normalization|MySQL Database Design|MySQL Users and Privileges|MySQL Backup and Restore"],
    ["MySQL Advanced Queries and Operations", "MySQL Common Table Expressions|MySQL Recursive CTEs|MySQL Window Functions|MySQL ROW_NUMBER()|MySQL RANK()|MySQL JSON Data|MySQL JSON Functions|MySQL Composite Indexes|MySQL EXPLAIN Plans|MySQL Query Optimization|MySQL Transaction Isolation|MySQL Locks|MySQL Savepoints|MySQL Generated Columns|MySQL Views and Updatable Views|MySQL Safe Schema Changes|MySQL Replication Basics|MySQL Import and Export"],
    ["MySQL Projects and Practice", "MySQL Certificate|MySQL Examples|MySQL Editor|MySQL Quiz|MySQL Exercises|MySQL Syllabus|MySQL Study Plan|MySQL CRUD Project|MySQL Reporting Project"],
    ["MySQL References", "MySQL Data Types|MySQL Functions|MySQL String Functions|MySQL Date Functions|MySQL Numeric Functions|MySQL JSON Functions|MySQL Window Functions|MySQL Keywords|MySQL Quick Reference"],
  ]),
};

for (const course of extraCourses) expandedCourseModules[course.slug] = defineModules(course.modules);

function inferModuleTitle(courseSlug: string, topic: string) {
  const language = courseSlug.replace(/-fundamentals$/, "").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (/variable|syntax|introduction|first|setup|getting started|output|comment/i.test(topic)) return `${language} Foundations`;
  if (/data type|number|string|operator|boolean/i.test(topic)) return `${language} Core Concepts`;
  if (/list|array|tuple|set|dictionary|object|collection/i.test(topic)) return `${language} Collections & Data`;
  if (/condition|switch|loop|while|for|decision/i.test(topic)) return `${language} Logic & Control Flow`;
  if (/function|method|class|object|exception|error|pointer|reference/i.test(topic)) return `${language} Functions & Problem Solving`;
  if (/dom|event|semantic|form|table|link|image|page/i.test(topic)) return `${language} Practical Web Skills`;
  if (/database|select|where|query|insert|update|join|aggregate|sql/i.test(topic)) return `${language} Data & Queries`;
  return `${language} Applied Practice`;
}

export function getCourseModules(courseSlug: string, storedTopics: string[]): CourseModule[] {
  if (courseSlug === "python-fundamentals") return removeDuplicateTopics(pythonModules);
  if (expandedCourseModules[courseSlug]) return removeDuplicateTopics(expandedCourseModules[courseSlug]);
  if (courseModules[courseSlug]) return removeDuplicateTopics(courseModules[courseSlug]);
  const modules: CourseModule[] = [];
  for (const topic of storedTopics) {
    const title = inferModuleTitle(courseSlug, topic);
    const currentModule = modules[modules.length - 1];
    if (!currentModule || currentModule.title !== title) {
      modules.push({ title, topics: [topic] });
    } else {
      currentModule.topics.push(topic);
    }
  }
  return removeDuplicateTopics(modules);
}

function removeDuplicateTopics(modules: CourseModule[]): CourseModule[] {
  const seen = new Set<string>();
  return modules.map((module) => ({
    ...module,
    topics: module.topics.filter((topic) => {
      const key = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  })).filter((module) => module.topics.length > 0);
}

export function flattenCourseModules(modules: CourseModule[]) {
  return modules.flatMap((module) => module.topics);
}
