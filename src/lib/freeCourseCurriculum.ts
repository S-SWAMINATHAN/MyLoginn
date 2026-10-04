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
