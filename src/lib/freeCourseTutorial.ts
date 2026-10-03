export type LessonKind =
  | "intro" | "setup" | "hello" | "structure" | "output" | "comments" | "variables" | "types"
  | "numbers" | "strings" | "operators" | "condition" | "loop" | "function" | "collection"
  | "object" | "class" | "input" | "module" | "file" | "error" | "dom" | "event" | "semantics"
  | "link" | "image" | "form" | "table" | "null"
  | "styles" | "selector" | "box" | "layout" | "responsive" | "database" | "query" | "filter"
  | "insert" | "update" | "aggregate" | "join" | "pointer" | "structure-data" | "practice";

export type TutorialLesson = {
  kind: LessonKind;
  introduction: string;
  explanation: string;
  code: string;
  output: string;
  takeaways: string[];
  mistake: string;
};

const kindMatchers: [RegExp, LessonKind][] = [
  [/practice|program|mini project|practical/i, "practice"],
  [/intro|what is/i, "intro"], [/install|setup|environment|jdk|accessing/i, "setup"],
  [/first program|first page|getting started|running python/i, "hello"],
  [/syntax|indentation|document structure|basic structure/i, "structure"],
  [/output|print\(\)|input\s*\/\s*output/i, "output"], [/comment/i, "comments"],
  [/variable|let\b|const\b|assign/i, "variables"], [/data type|type checking/i, "types"],
  [/number|arithmetic|casting|conversion/i, "numbers"], [/string/i, "strings"], [/operator/i, "operators"],
  [/condition|\bif\b|switch/i, "condition"], [/loop|\bfor\b|\bwhile\b|range\(\)/i, "loop"],
  [/function|method|parameter|argument|return/i, "function"], [/array|list|tuple|set|collection/i, "collection"],
  [/object|dictionary|map\b/i, "object"], [/class|constructor/i, "class"], [/input|scanner/i, "input"],
  [/module|import|package/i, "module"], [/file|read|write/i, "file"], [/error|exception|try|catch/i, "error"],
  [/dom/i, "dom"], [/event|button/i, "event"], [/semantic/i, "semantics"],
  [/selector/i, "selector"], [/box model|margin|padding|border|width|height/i, "box"],
  [/flex|display|position|layout/i, "layout"], [/responsive/i, "responsive"], [/adding css|style|background|color|font|text/i, "styles"],
  [/database|table|row/i, "database"], [/select|query|sql/i, "query"], [/where|filter|like|between|and\s*\/\s*or/i, "filter"],
  [/insert/i, "insert"], [/update|delete/i, "update"], [/aggregate|group by|count|sum|average/i, "aggregate"],
  [/join/i, "join"], [/pointer/i, "pointer"], [/structure/i, "structure-data"],
];

export function toTopicSlug(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getLessonKind(title: string): LessonKind {
  return kindMatchers.find(([pattern]) => pattern.test(title))?.[1] ?? "structure";
}

function lessonKindForCourse(courseSlug: string, title: string): LessonKind {
  const normalized = title.toLowerCase();
  if (courseSlug === "html-fundamentals") {
    if (/\blink\b/.test(normalized)) return "link";
    if (/image/.test(normalized)) return "image";
    if (/form|input element/.test(normalized)) return "form";
    if (/table/.test(normalized)) return "table";
  }
  if (courseSlug === "sql-fundamentals" && /\bnull\b/.test(normalized)) return "null";
  return getLessonKind(title);
}

const codeSamples: Record<string, Partial<Record<LessonKind, { code: string; output: string }>>> = {
  "python-fundamentals": {
    hello: { code: 'print("Hello, Python!")', output: "Hello, Python!" },
    structure: { code: 'name = "Maya"\nprint(f"Hello, {name}!")', output: "Hello, Maya!" },
    output: { code: 'print("Score:", 95)', output: "Score: 95" },
    comments: { code: '# A comment explains why code is here\nprint("Ready")', output: "Ready" },
    variables: { code: 'student = "Maya"\nage = 16\nprint(student, age)', output: "Maya 16" },
    types: { code: 'age = 16\nname = "Maya"\nprint(type(age).__name__)\nprint(type(name).__name__)', output: "int\nstr" },
    numbers: { code: 'price = 12\nquantity = 3\nprint(price * quantity)', output: "36" },
    strings: { code: 'name = "Maya"\nprint(name.upper())', output: "MAYA" },
    operators: { code: 'print(7 + 3)\nprint(7 > 3)\nprint(True and False)', output: "10\nTrue\nFalse" },
    condition: { code: 'score = 82\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")', output: "Pass" },
    loop: { code: 'for number in range(1, 4):\n    print(number)', output: "1\n2\n3" },
    function: { code: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Maya"))', output: "Hello, Maya!" },
    collection: { code: 'scores = [80, 95, 88]\nprint(scores[0])\nprint(len(scores))', output: "80\n3" },
    input: { code: 'name = input("Your name: ")\nprint("Hello,", name)', output: "Your name: Maya\nHello, Maya" },
    module: { code: 'import math\nprint(math.sqrt(25))', output: "5.0" },
    file: { code: 'with open("notes.txt", "w") as file:\n    file.write("Learn Python")', output: "Creates notes.txt containing Learn Python" },
    error: { code: 'try:\n    number = int("hello")\nexcept ValueError:\n    print("Enter a whole number")', output: "Enter a whole number" },
  },
  "java-fundamentals": {
    hello: { code: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}', output: "Hello, Java!" },
    structure: { code: 'class Main {\n  public static void main(String[] args) {\n    String name = "Maya";\n    System.out.println("Hello, " + name);\n  }\n}', output: "Hello, Maya" },
    output: { code: 'System.out.println("Score: " + 95);', output: "Score: 95" },
    comments: { code: '// A comment explains this statement\nSystem.out.println("Ready");', output: "Ready" },
    variables: { code: 'String student = "Maya";\nint age = 16;\nSystem.out.println(student + " " + age);', output: "Maya 16" },
    types: { code: 'int age = 16;\ndouble price = 12.5;\nboolean ready = true;', output: "age stores a whole number; price a decimal; ready true or false" },
    numbers: { code: 'int price = 12;\nint quantity = 3;\nSystem.out.println(price * quantity);', output: "36" },
    strings: { code: 'String name = "Maya";\nSystem.out.println(name.toUpperCase());', output: "MAYA" },
    operators: { code: 'System.out.println(7 + 3);\nSystem.out.println(7 > 3);', output: "10\ntrue" },
    condition: { code: 'int score = 82;\nif (score >= 50) {\n  System.out.println("Pass");\n} else {\n  System.out.println("Try again");\n}', output: "Pass" },
    loop: { code: 'for (int number = 1; number <= 3; number++) {\n  System.out.println(number);\n}', output: "1\n2\n3" },
    function: { code: 'static String greet(String name) {\n  return "Hello, " + name + "!";\n}', output: 'Calling greet("Maya") returns Hello, Maya!' },
    collection: { code: 'int[] scores = {80, 95, 88};\nSystem.out.println(scores[0]);\nSystem.out.println(scores.length);', output: "80\n3" },
    input: { code: 'Scanner input = new Scanner(System.in);\nString name = input.nextLine();\nSystem.out.println("Hello, " + name);', output: "Input Maya → Hello, Maya" },
    class: { code: 'class Dog {\n  String name;\n  Dog(String name) { this.name = name; }\n}', output: "A Dog object can be created with its own name." },
    error: { code: 'try {\n  int number = Integer.parseInt("hello");\n} catch (NumberFormatException error) {\n  System.out.println("Enter a whole number");\n}', output: "Enter a whole number" },
  },
  "javascript-fundamentals": {
    hello: { code: 'console.log("Hello, JavaScript!");', output: "Hello, JavaScript!" },
    structure: { code: 'const name = "Maya";\nconsole.log(`Hello, ${name}!`);', output: "Hello, Maya!" },
    output: { code: 'console.log("Score:", 95);', output: "Score: 95" },
    comments: { code: '// A comment explains this statement\nconsole.log("Ready");', output: "Ready" },
    variables: { code: 'let score = 80;\nscore = 95;\nconst student = "Maya";\nconsole.log(student, score);', output: "Maya 95" },
    types: { code: 'const age = 16;\nconst name = "Maya";\nconsole.log(typeof age, typeof name);', output: "number string" },
    numbers: { code: 'const price = 12;\nconst quantity = 3;\nconsole.log(price * quantity);', output: "36" },
    strings: { code: 'const name = "Maya";\nconsole.log(name.toUpperCase());', output: "MAYA" },
    operators: { code: 'console.log(7 + 3);\nconsole.log(7 > 3);\nconsole.log(true && false);', output: "10\ntrue\nfalse" },
    condition: { code: 'const score = 82;\nif (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}', output: "Pass" },
    loop: { code: 'for (let number = 1; number <= 3; number++) {\n  console.log(number);\n}', output: "1\n2\n3" },
    function: { code: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet("Maya"));', output: "Hello, Maya!" },
    collection: { code: 'const scores = [80, 95, 88];\nconsole.log(scores[0]);\nconsole.log(scores.length);', output: "80\n3" },
    object: { code: 'const student = { name: "Maya", score: 95 };\nconsole.log(student.name);', output: "Maya" },
    dom: { code: 'const title = document.querySelector("h1");\ntitle.textContent = "Welcome!";', output: "The page heading changes to Welcome!" },
    event: { code: 'button.addEventListener("click", () => {\n  console.log("Button clicked");\n});', output: "Button clicked when the user clicks the button" },
  },
  "html-fundamentals": {
    hello: { code: '<!doctype html>\n<html>\n  <body>\n    <h1>Hello, web!</h1>\n  </body>\n</html>', output: "A webpage with the heading: Hello, web!" },
    structure: { code: '<!doctype html>\n<html lang="en">\n<head><title>My page</title></head>\n<body><h1>Welcome</h1></body>\n</html>', output: "The browser shows a page titled My page with a Welcome heading." },
    output: { code: '<h1>My first page</h1>\n<p>This is a paragraph.</p>', output: "A large heading followed by a paragraph." },
    semantics: { code: '<header><h1>My site</h1></header>\n<main><p>Main content goes here.</p></main>\n<footer>Contact</footer>', output: "A page organized into header, main content, and footer regions." },
    collection: { code: '<ul>\n  <li>Python</li>\n  <li>Java</li>\n</ul>', output: "• Python\n• Java" },
    "structure-data": { code: '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Maya</td><td>95</td></tr>\n</table>', output: "A two-column table with one student row." },
    link: { code: '<a href="https://example.com">Visit the example site</a>', output: "A clickable link opens the destination." },
    image: { code: '<img src="flower.jpg" alt="A yellow flower">', output: "The browser displays the image and exposes its description to assistive technology." },
    form: { code: '<form>\n  <label for="email">Email</label>\n  <input id="email" type="email">\n  <button>Join</button>\n</form>', output: "A labeled email field and a Join button." },
    table: { code: '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>Maya</td><td>95</td></tr>\n</table>', output: "A two-column table with one student row." },
    input: { code: '<label for="age">Age</label>\n<input id="age" type="number" min="1">', output: "A labeled field accepts a numeric value." },
  },
  "css-fundamentals": {
    hello: { code: '<h1 class="welcome">Hello, web!</h1>\n<style>\n.welcome { color: royalblue; }\n</style>', output: "The heading appears in royal blue." },
    selector: { code: 'p {\n  color: #334155;\n}\n.notice {\n  background: #eff6ff;\n}', output: "Paragraph text becomes slate; elements with class notice get a pale blue background." },
    styles: { code: 'body {\n  font-family: Arial, sans-serif;\n  background: #f8fafc;\n}\nh1 { color: #2563eb; }', output: "The page gets a light background and a blue heading." },
    box: { code: '.card {\n  width: 240px;\n  padding: 16px;\n  border: 2px solid #bfdbfe;\n  margin: 12px;\n}', output: "Content sits inside padding, border, and outside margin." },
    layout: { code: '.row {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n}', output: "Children line up in a row with space between them." },
    responsive: { code: '.cards { display: grid; grid-template-columns: 1fr 1fr; }\n@media (max-width: 600px) {\n  .cards { grid-template-columns: 1fr; }\n}', output: "Two columns on wider screens, one column on narrow screens." },
  },
  "sql-fundamentals": {
    hello: { code: 'CREATE TABLE students (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  score INTEGER\n);', output: "A students table with id, name, and score columns." },
    database: { code: 'SELECT name, score\nFROM students;', output: "Returns the name and score columns for every student." },
    query: { code: 'SELECT name, score\nFROM students\nORDER BY score DESC;', output: "Returns students ordered from highest score to lowest." },
    filter: { code: 'SELECT name, score\nFROM students\nWHERE score >= 80;', output: "Only students scoring 80 or higher." },
    null: { code: 'SELECT name\nFROM students\nWHERE score IS NULL;', output: "Returns students whose score has no stored value." },
    insert: { code: 'INSERT INTO students (name, score)\nVALUES (\'Maya\', 95);', output: "Adds Maya with a score of 95." },
    update: { code: 'UPDATE students\nSET score = 98\nWHERE name = \'Maya\';', output: "Changes Maya’s score to 98." },
    aggregate: { code: 'SELECT COUNT(*) AS student_count, AVG(score) AS average_score\nFROM students;', output: "Returns the number of students and their average score." },
    join: { code: 'SELECT students.name, courses.title\nFROM students\nJOIN enrollments ON enrollments.student_id = students.id\nJOIN courses ON courses.id = enrollments.course_id;', output: "Combines student names with the courses they enrolled in." },
  },
  "c-fundamentals": {
    hello: { code: '#include <stdio.h>\nint main(void) {\n  printf("Hello, C!\\n");\n  return 0;\n}', output: "Hello, C!" },
    output: { code: 'printf("Score: %d\\n", 95);', output: "Score: 95" },
    variables: { code: 'int age = 16;\nfloat price = 12.5f;\nprintf("%d %.1f\\n", age, price);', output: "16 12.5" },
    types: { code: 'int count = 3;\nchar grade = \'A\';\nfloat average = 87.5f;', output: "count is a whole number, grade one character, average a decimal number." },
    condition: { code: 'int score = 82;\nif (score >= 50) {\n  printf("Pass\\n");\n} else {\n  printf("Try again\\n");\n}', output: "Pass" },
    loop: { code: 'for (int number = 1; number <= 3; number++) {\n  printf("%d\\n", number);\n}', output: "1\n2\n3" },
    function: { code: 'int add(int a, int b) {\n  return a + b;\n}', output: "add(2, 3) returns 5" },
    collection: { code: 'int scores[] = {80, 95, 88};\nprintf("%d\\n", scores[0]);', output: "80" },
    pointer: { code: 'int score = 95;\nint *score_address = &score;\nprintf("%d\\n", *score_address);', output: "95 — dereferencing the pointer reads the value it points to." },
    "structure-data": { code: 'struct Student {\n  char name[20];\n  int score;\n};', output: "A Student value can group a name and score together." },
  },
  "cpp-fundamentals": {
    hello: { code: '#include <iostream>\nint main() {\n  std::cout << "Hello, C++!\\n";\n  return 0;\n}', output: "Hello, C++!" },
    output: { code: 'std::cout << "Score: " << 95 << "\\n";', output: "Score: 95" },
    variables: { code: 'int age = 16;\ndouble price = 12.5;\nstd::cout << age << " " << price;', output: "16 12.5" },
    types: { code: 'int count = 3;\nchar grade = \'A\';\nbool ready = true;', output: "count is whole, grade is one character, and ready stores true or false." },
    condition: { code: 'int score = 82;\nif (score >= 50) {\n  std::cout << "Pass\\n";\n} else {\n  std::cout << "Try again\\n";\n}', output: "Pass" },
    loop: { code: 'for (int number = 1; number <= 3; number++) {\n  std::cout << number << "\\n";\n}', output: "1\n2\n3" },
    function: { code: 'int add(int a, int b) {\n  return a + b;\n}', output: "add(2, 3) returns 5" },
    collection: { code: 'int scores[] = {80, 95, 88};\nstd::cout << scores[0];', output: "80" },
    object: { code: 'struct Student {\n  std::string name;\n  int score;\n};', output: "A Student value can group a name and score together." },
    class: { code: 'class Counter {\n public:\n  int value = 0;\n  void addOne() { value++; }\n};', output: "A Counter object stores a value and can update it with addOne()." },
  },
};

const explanations: Record<LessonKind, string> = {
  intro: "This course starts with the core ideas and builds toward small programs. Focus on understanding each example before moving to the next topic.",
  setup: "Choose a compiler, interpreter, or browser environment for this language. Run a tiny example first so you know your tools are working before adding more code.",
  hello: "A first program connects the language's basic structure to something visible. Read the example from top to bottom and notice which statement produces the result.",
  structure: "Every language has rules for arranging instructions. Following those rules lets the compiler, interpreter, or browser understand where each part begins and ends.",
  output: "Output makes a program's result visible. Use it while learning to check values and understand what your instructions are doing.",
  comments: "Comments are notes for people reading the source. They help explain intent, but the language ignores them when it runs the program.",
  variables: "A variable is a named place or reference for a value. Give names that describe the information they hold, and choose a declaration that matches whether the value should change.",
  types: "A data type describes what kind of value is stored and which operations make sense for it. Whole numbers, decimal values, text, and true/false values are common fundamentals.",
  numbers: "Numbers support arithmetic such as addition, subtraction, multiplication, and division. Pay attention to whether a language treats division as integer or decimal division.",
  strings: "A string is text. Strings can often be joined, inspected, formatted, or transformed, but individual operations differ across languages.",
  operators: "Operators combine or compare values. Arithmetic produces numbers; comparison and logical operators produce decisions that conditions can use.",
  condition: "A condition chooses which path a program follows. The program checks a true-or-false expression and runs the matching branch.",
  loop: "A loop repeats instructions. Decide what changes on each pass and what condition ends the repetition so the loop makes progress.",
  function: "A function gives a reusable name to a set of instructions. Parameters provide input and a return value can send a result back to the caller.",
  collection: "A collection groups related values so they can be handled together. Index-based collections commonly start at position zero; check the language's indexing rules.",
  object: "An object groups related data under meaningful properties or keys. Read and update a property through the syntax used by this language.",
  class: "A class describes a kind of object. It can define the data an object stores and the operations that object can perform.",
  input: "Input lets a program respond to information supplied by a person or another source. Validate input before relying on its type or contents.",
  module: "A module or library packages reusable code. Import only what the example needs and use the documented name to access it.",
  file: "File operations let a program keep information beyond one run. Always choose the correct mode and close the file, preferably with the language's safe resource pattern.",
  error: "Errors are expected when input or operations do not match assumptions. Handle the specific error you can recover from and keep a useful fallback message.",
  dom: "The DOM is the browser's object model of an HTML document. JavaScript can find an element and change its content or attributes after the page loads.",
  event: "An event represents something that happened, such as a click. An event handler runs the code you attach when that event occurs.",
  link: "A link connects one document or location to another. Use a descriptive label so people know where the link will take them.",
  image: "An image embeds visual content in a page. Alternative text communicates the image's useful meaning when it cannot be seen or loaded.",
  form: "A form groups controls used to collect information. Pair each control with a label and use an input type that fits the data.",
  table: "A table presents data in rows and columns. Use header cells to identify what each column represents.",
  null: "NULL represents a missing or unknown value in SQL. It is not equal to zero or an empty string, so test it with IS NULL or IS NOT NULL.",
  semantics: "Semantic elements describe the role of content, not just its appearance. Clear structure helps browsers, assistive technologies, and maintainers understand a page.",
  styles: "Styles control how page elements look. Start with a small set of readable rules, then adjust colors, type, and spacing consistently.",
  selector: "A selector chooses which elements a style rule affects. Element, class, and ID selectors have different reach; prefer reusable classes for page styling.",
  box: "The box model describes an element's content, padding, border, and margin. These layers explain why an element takes up more space than its content alone.",
  layout: "Layout rules position elements and manage available space. Flexbox is a useful first tool for arranging items in a row or column.",
  responsive: "Responsive styles adapt a page to the space available. A small-screen layout should remain readable without horizontal scrolling.",
  database: "A relational database stores related facts in tables. Columns describe fields, rows hold records, and keys help connect records across tables.",
  query: "A SELECT query reads columns from a table. Begin with the table and fields you need, then add sorting or filtering when required.",
  filter: "A WHERE clause keeps only rows that match a condition. Use comparisons carefully and combine conditions with parentheses when precedence could be unclear.",
  insert: "INSERT adds a row to a table. Name the target columns so the values map clearly and remain correct if the table changes.",
  update: "UPDATE changes existing rows. Use a WHERE clause when you intend to change only selected records; without one, every row may be affected.",
  aggregate: "Aggregate functions summarize many rows into a value, such as a count or average. GROUP BY computes those summaries separately for each category.",
  join: "A JOIN combines related rows from tables using a matching key. Choose the join type based on whether unmatched rows should remain in the result.",
  pointer: "A pointer stores an address that refers to another value. Learn the difference between the address and the value at that address, and only dereference valid pointers.",
  "structure-data": "A structure groups fields with different meanings into one record. It keeps related values together while still letting each field keep its own type.",
  practice: "Use this small task to connect the topics you have covered. Change one input, predict the result, and then trace the statements to check your prediction.",
};

const takeaways: Partial<Record<LessonKind, string[]>> = {
  intro: ["Start with the smallest working example.", "Change one thing at a time and observe the result."],
  variables: ["Choose clear names.", "Keep track of the current value after every assignment."],
  types: ["Check the type before applying an operation.", "Convert input explicitly when a number is expected."],
  condition: ["Conditions evaluate to true or false.", "Order branches from specific cases to general cases."],
  loop: ["Track the loop variable on every iteration.", "Make sure the stopping condition can eventually become true."],
  function: ["Use parameters for changing inputs.", "Return a value when the caller needs a result."],
  collection: ["Check valid positions and the collection length.", "Use a loop when you need to process every item."],
  query: ["Select only the fields you need.", "Add ORDER BY when result order matters."],
  filter: ["Use comparison operators that match the field type.", "Test the condition against both matching and nonmatching rows."],
  selector: ["Classes can be reused across elements.", "Keep selector scope narrow and predictable."],
  box: ["Content size is only one part of the full box.", "Use consistent spacing values to keep layouts clear."],
};

export function buildTutorialLesson(courseSlug: string, title: string, index: number): TutorialLesson {
  const kind = lessonKindForCourse(courseSlug, title);
  const sample = codeSamples[courseSlug]?.[kind];
  const commentPrefix: Record<string, string> = {
    "python-fundamentals": "#", "java-fundamentals": "//", "javascript-fundamentals": "//",
    "html-fundamentals": "<!--", "css-fundamentals": "/*", "sql-fundamentals": "--",
    "c-fundamentals": "//", "cpp-fundamentals": "//",
  };
  const closingComment: Record<string, string> = { "html-fundamentals": " -->", "css-fundamentals": " */" };
  const languageName = title.split(/\s+/)[0] || "This language";
  return {
    kind,
    introduction: `${title} is part of the ${languageName} fundamentals path. This lesson explains the idea, then shows it in a small example you can trace.`,
    explanation: explanations[kind],
    code: sample?.code ?? `${commentPrefix[courseSlug] ?? "//"} ${title}${closingComment[courseSlug] ?? ""}\n${commentPrefix[courseSlug] ?? "//"} Explore the key idea, then build a small example of your own.${closingComment[courseSlug] ?? ""}`,
    output: sample?.output ?? `The example demonstrates the main idea in ${title.toLowerCase()}.`,
    takeaways: takeaways[kind] ?? [`Understand what ${title.toLowerCase()} is used for.`, "Read the example carefully before changing it."],
    mistake: kind === "loop" ? "Changing the wrong variable or forgetting to update it can make a loop repeat forever." :
      kind === "condition" ? "A comparison such as >= is different from assignment. Check the exact operator in the condition." :
      kind === "collection" ? "Using an index beyond the last item can cause an error. Remember that many languages begin indexing at zero." :
      kind === "update" ? "An UPDATE without a WHERE clause may change every row in the table." :
      kind === "file" ? "Forgetting to close a file can leave resources in use or data unwritten." :
      kind === "pointer" ? "Do not use a pointer before it refers to a valid object." :
      `Connect lesson ${index + 1} to the example and the ideas from earlier lessons.`,
  };
}
