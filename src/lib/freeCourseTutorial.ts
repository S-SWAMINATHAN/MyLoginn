export type LessonKind =
  | "intro" | "setup" | "hello" | "structure" | "output" | "comments" | "variables" | "types"
  | "numbers" | "strings" | "operators" | "condition" | "loop" | "function" | "collection"
  | "object" | "class" | "input" | "module" | "file" | "error" | "dom" | "event" | "semantics"
  | "link" | "image" | "form" | "table" | "null"
  | "styles" | "selector" | "box" | "layout" | "responsive" | "database" | "query" | "filter"
  | "insert" | "update" | "aggregate" | "join" | "pointer" | "structure-data" | "practice" | "sort"
  | "json" | "regex" | "date" | "math" | "iterator" | "array" | "packages" | "recursion";

export type TutorialLesson = {
  kind: LessonKind;
  requiresCodeChallenge: boolean;
  visual: { caption: string; nodes: { label: string; value: string; detail?: string }[]; summary: string };
  articleSections: { title: string; paragraphs: string[]; bullets?: string[]; code?: string; links?: { label: string; href: string; detail: string }[] }[];
  overview: string;
  keyPoints: { title: string; detail: string }[];
  exampleTitle: string;
  exampleIntroduction: string;
  quiz: { question: string; options: { id: string; text: string }[]; answer: string; explanation: string };
  definition: string;
  introduction: string;
  explanation: string;
  code: string;
  output: string;
  takeaways: string[];
  mistake: string;
  syntax: string;
  realWorld: string;
  bestPractice: string;
  practice: string;
  challenge: string;
  challengeStarter: string;
  challengeHints: string[];
  keywords: string[];
  steps: { code: string; explanation: string }[];
};

function explainCodeLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return "This blank line separates related instructions for readability.";
  if (/^(#|\/\/|<!--|\/\*|--)/.test(trimmed)) return "This is a comment for people reading the code; the language ignores it when running the program.";
  if (/^(if\b|elif\b|else\b|while\b|for\b|try\b|except\b|catch\b)/.test(trimmed)) return "This line controls which instructions run next. Check its condition or branch before tracing the following lines.";
  if (/^(def\b|function\b|class\b|import\b|from\b|#include|SELECT\b|INSERT\b|UPDATE\b)/i.test(trimmed)) return "This line declares, imports, or starts a reusable structure or operation. The indented or following statements provide its details.";
  if (/\b(print|console\.log|printf|println|cout|System\.out)\b/i.test(trimmed)) return "This line sends the current value to the program's output, which lets you inspect the result.";
  if (/^[\w.]+\s*\(/.test(trimmed)) return "This line calls a function with the values in parentheses. Follow those arguments into the function, then use its result or side effect.";
  if (/=/.test(trimmed)) return "This line assigns or updates a value. Evaluate the expression on the right, then associate the result with the name on the left.";
  if (/^<[^/!]/.test(trimmed)) return "This markup opens an element. Its tag describes the content or control that the browser will render.";
  if (/^[.#\w-]+\s*\{/.test(trimmed)) return "This rule selects elements; the declarations inside its block set their presentation.";
  return "Read this instruction from left to right, then trace its effect before moving to the next line.";
}

const kindMatchers: [RegExp, LessonKind][] = [
  [/merge.?sort|sorting algorithm/i, "sort"],
  [/json/i, "json"], [/regular expression|regex|re\.(?:search|match|findall|split|sub)/i, "regex"],
  [/datetime|date|time|timedelta|strftime|strptime/i, "date"], [/\bmath\b|random|rounding/i, "math"],
  [/iterable|iterator|iter\(\)|next\(\)/i, "iterator"], [/array|numpy/i, "array"],
  [/pip|requirements\.txt|virtual environment|\bvenv\b|package versions/i, "packages"],
  [/recursion/i, "recursion"],
  [/practice|program|mini project|practical/i, "practice"],
  [/why\s+python|python use cases|python advantages|intro|what is/i, "intro"], [/install|setup|environment|jdk|accessing/i, "setup"],
  [/first program|first page|getting started|running python/i, "hello"],
  [/syntax|indentation|document structure|basic structure/i, "structure"],
  [/output|print\(\)|input\s*\/\s*output/i, "output"], [/comment/i, "comments"],
  [/variable|let\b|const\b|assign/i, "variables"], [/data type|type checking/i, "types"],
  [/number|arithmetic|casting|conversion/i, "numbers"], [/string/i, "strings"], [/operator/i, "operators"],
  [/condition|\bif\b|switch/i, "condition"], [/loop|\bfor\b|\bwhile\b|range\(\)/i, "loop"],
  [/function|method|parameter|argument|return|recursion/i, "function"], [/array|list|tuple|set|collection/i, "collection"],
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
  return kindMatchers.find(([pattern]) => pattern.test(title))?.[1] ?? "intro";
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
    intro: { code: '# This is a comment. It will not be executed.\nprint("Hello, World!")', output: "Hello, World!" },
    hello: { code: 'print("Hello, Python!")', output: "Hello, Python!" },
    structure: { code: 'name = "MyLoginn"\nprint(f"Hello, {name}!")', output: "Hello, MyLoginn!" },
    output: { code: 'print("Score:", 95)', output: "Score: 95" },
    comments: { code: '# A comment explains why code is here\nprint("Ready")', output: "Ready" },
    variables: { code: 'student = "MyLoginn"\nage = 16\nprint(student, age)', output: "MyLoginn 16" },
    types: { code: 'age = 16\nname = "MyLoginn"\nprint(type(age).__name__)\nprint(type(name).__name__)', output: "int\nstr" },
    numbers: { code: 'price = 12\nquantity = 3\nprint(price * quantity)', output: "36" },
    strings: { code: 'name = "MyLoginn"\nprint(name.upper())', output: "MYLOGINN" },
    operators: { code: 'print(7 + 3)\nprint(7 > 3)\nprint(True and False)', output: "10\nTrue\nFalse" },
    condition: { code: 'score = 82\nif score >= 50:\n    print("Pass")\nelse:\n    print("Try again")', output: "Pass" },
    loop: { code: 'for number in range(1, 4):\n    print(number)', output: "1\n2\n3" },
    function: { code: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("MyLoginn"))', output: "Hello, MyLoginn!" },
    collection: { code: 'scores = [80, 95, 88]\nprint(scores[0])\nprint(len(scores))', output: "80\n3" },
    input: { code: 'name = input("Your name: ")\nprint("Hello,", name)', output: "Your name: MyLoginn\nHello, MyLoginn" },
    module: { code: 'import math\nprint(math.sqrt(25))', output: "5.0" },
    file: { code: 'with open("notes.txt", "w") as file:\n    file.write("Learn Python")', output: "Creates notes.txt containing Learn Python" },
    error: { code: 'try:\n    number = int("hello")\nexcept ValueError:\n    print("Enter a whole number")', output: "Enter a whole number" },
    sort: { code: 'def merge(left, right):\n    result = []\n    while left and right:\n        if left[0] <= right[0]:\n            result.append(left.pop(0))\n        else:\n            result.append(right.pop(0))\n    return result + left + right\n\ndef merge_sort(values):\n    if len(values) <= 1:\n        return values\n\n    middle = len(values) // 2\n    left = merge_sort(values[:middle])\n    right = merge_sort(values[middle:])\n    return merge(left, right)\n\nprint(merge_sort([6, 8, 1, 4]))', output: "[1, 4, 6, 8]" },
    recursion: { code: 'def countdown(number):\n    if number == 0:\n        print("Lift off!")\n        return\n\n    print(number)\n    countdown(number - 1)\n\ncountdown(3)', output: "3\n2\n1\nLift off!" },
    array: { code: 'from array import array\n\nscores = array("i", [80, 95, 88])\nscores.append(91)\nprint(scores[0])\nprint(len(scores))', output: "80\n4" },
    iterator: { code: 'colors = ["blue", "green"]\ncolor_iterator = iter(colors)\nprint(next(color_iterator))\nprint(next(color_iterator))', output: "blue\ngreen" },
    date: { code: 'from datetime import date, timedelta\n\ntoday = date(2026, 10, 4)\ntomorrow = today + timedelta(days=1)\nprint(tomorrow.isoformat())', output: "2026-10-05" },
    math: { code: 'import math\n\nradius = 3\narea = math.pi * radius ** 2\nprint(round(area, 2))', output: "28.27" },
    json: { code: 'import json\n\nstudent = {"name": "MyLoginn", "score": 95}\ntext = json.dumps(student)\nrestored = json.loads(text)\nprint(restored["name"])', output: "MyLoginn" },
    regex: { code: 'import re\n\nmessage = "Order 42 is ready"\nmatch = re.search(r"\\d+", message)\nprint(match.group() if match else "No order number")', output: "42" },
    packages: { code: '# Create an isolated environment\npython -m venv .venv\n\n# Install a package inside the active environment\npython -m pip install requests', output: "Shell commands: create a virtual environment, then install requests into it." },
  },
  "java-fundamentals": {
    hello: { code: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}', output: "Hello, Java!" },
    structure: { code: 'class Main {\n  public static void main(String[] args) {\n    String name = "MyLoginn";\n    System.out.println("Hello, " + name);\n  }\n}', output: "Hello, MyLoginn" },
    output: { code: 'System.out.println("Score: " + 95);', output: "Score: 95" },
    comments: { code: '// A comment explains this statement\nSystem.out.println("Ready");', output: "Ready" },
    variables: { code: 'String student = "MyLoginn";\nint age = 16;\nSystem.out.println(student + " " + age);', output: "MyLoginn 16" },
    types: { code: 'int age = 16;\ndouble price = 12.5;\nboolean ready = true;', output: "age stores a whole number; price a decimal; ready true or false" },
    numbers: { code: 'int price = 12;\nint quantity = 3;\nSystem.out.println(price * quantity);', output: "36" },
    strings: { code: 'String name = "MyLoginn";\nSystem.out.println(name.toUpperCase());', output: "MYLOGINN" },
    operators: { code: 'System.out.println(7 + 3);\nSystem.out.println(7 > 3);', output: "10\ntrue" },
    condition: { code: 'int score = 82;\nif (score >= 50) {\n  System.out.println("Pass");\n} else {\n  System.out.println("Try again");\n}', output: "Pass" },
    loop: { code: 'for (int number = 1; number <= 3; number++) {\n  System.out.println(number);\n}', output: "1\n2\n3" },
    function: { code: 'static String greet(String name) {\n  return "Hello, " + name + "!";\n}', output: 'Calling greet("MyLoginn") returns Hello, MyLoginn!' },
    collection: { code: 'int[] scores = {80, 95, 88};\nSystem.out.println(scores[0]);\nSystem.out.println(scores.length);', output: "80\n3" },
    input: { code: 'Scanner input = new Scanner(System.in);\nString name = input.nextLine();\nSystem.out.println("Hello, " + name);', output: "Input MyLoginn → Hello, MyLoginn" },
    class: { code: 'class Dog {\n  String name;\n  Dog(String name) { this.name = name; }\n}', output: "A Dog object can be created with its own name." },
    error: { code: 'try {\n  int number = Integer.parseInt("hello");\n} catch (NumberFormatException error) {\n  System.out.println("Enter a whole number");\n}', output: "Enter a whole number" },
  },
  "javascript-fundamentals": {
    hello: { code: 'console.log("Hello, JavaScript!");', output: "Hello, JavaScript!" },
    structure: { code: 'const name = "MyLoginn";\nconsole.log(`Hello, ${name}!`);', output: "Hello, MyLoginn!" },
    output: { code: 'console.log("Score:", 95);', output: "Score: 95" },
    comments: { code: '// A comment explains this statement\nconsole.log("Ready");', output: "Ready" },
    variables: { code: 'let score = 80;\nscore = 95;\nconst student = "MyLoginn";\nconsole.log(student, score);', output: "MyLoginn 95" },
    types: { code: 'const age = 16;\nconst name = "MyLoginn";\nconsole.log(typeof age, typeof name);', output: "number string" },
    numbers: { code: 'const price = 12;\nconst quantity = 3;\nconsole.log(price * quantity);', output: "36" },
    strings: { code: 'const name = "MyLoginn";\nconsole.log(name.toUpperCase());', output: "MYLOGINN" },
    operators: { code: 'console.log(7 + 3);\nconsole.log(7 > 3);\nconsole.log(true && false);', output: "10\ntrue\nfalse" },
    condition: { code: 'const score = 82;\nif (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}', output: "Pass" },
    loop: { code: 'for (let number = 1; number <= 3; number++) {\n  console.log(number);\n}', output: "1\n2\n3" },
    function: { code: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet("MyLoginn"));', output: "Hello, MyLoginn!" },
    collection: { code: 'const scores = [80, 95, 88];\nconsole.log(scores[0]);\nconsole.log(scores.length);', output: "80\n3" },
    object: { code: 'const student = { name: "MyLoginn", score: 95 };\nconsole.log(student.name);', output: "MyLoginn" },
    dom: { code: 'const title = document.querySelector("h1");\ntitle.textContent = "Welcome!";', output: "The page heading changes to Welcome!" },
    event: { code: 'button.addEventListener("click", () => {\n  console.log("Button clicked");\n});', output: "Button clicked when the user clicks the button" },
  },
  "html-fundamentals": {
    hello: { code: '<!doctype html>\n<html>\n  <body>\n    <h1>Hello, web!</h1>\n  </body>\n</html>', output: "A webpage with the heading: Hello, web!" },
    structure: { code: '<!doctype html>\n<html lang="en">\n<head><title>My page</title></head>\n<body><h1>Welcome</h1></body>\n</html>', output: "The browser shows a page titled My page with a Welcome heading." },
    output: { code: '<h1>My first page</h1>\n<p>This is a paragraph.</p>', output: "A large heading followed by a paragraph." },
    semantics: { code: '<header><h1>My site</h1></header>\n<main><p>Main content goes here.</p></main>\n<footer>Contact</footer>', output: "A page organized into header, main content, and footer regions." },
    collection: { code: '<ul>\n  <li>Python</li>\n  <li>Java</li>\n</ul>', output: "• Python\n• Java" },
    "structure-data": { code: '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>MyLoginn</td><td>95</td></tr>\n</table>', output: "A two-column table with one student row." },
    link: { code: '<a href="https://example.com">Visit the example site</a>', output: "A clickable link opens the destination." },
    image: { code: '<img src="flower.jpg" alt="A yellow flower">', output: "The browser displays the image and exposes its description to assistive technology." },
    form: { code: '<form>\n  <label for="email">Email</label>\n  <input id="email" type="email">\n  <button>Join</button>\n</form>', output: "A labeled email field and a Join button." },
    table: { code: '<table>\n  <tr><th>Name</th><th>Score</th></tr>\n  <tr><td>MyLoginn</td><td>95</td></tr>\n</table>', output: "A two-column table with one student row." },
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
    insert: { code: 'INSERT INTO students (name, score)\nVALUES (\'MyLoginn\', 95);', output: "Adds MyLoginn with a score of 95." },
    update: { code: 'UPDATE students\nSET score = 98\nWHERE name = \'MyLoginn\';', output: "Changes MyLoginn’s score to 98." },
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

const setupSamples: Record<string, { code: string; output: string }> = {
  "java-fundamentals": { code: "java --version\njavac --version\n\njavac Main.java\njava Main", output: "The version checks confirm the runtime and compiler. javac compiles Main.java; java runs the compiled Main class." },
  "javascript-fundamentals": { code: "node --version\nnpm --version\n\nnode app.js", output: "The version checks confirm Node.js and npm. Node runs the app.js script." },
  "html-fundamentals": { code: "my-page/\n  index.html", output: "Save index.html, then open the file in a browser. No compiler is required." },
  "css-fundamentals": { code: "my-page/\n  index.html\n  styles.css", output: "Link styles.css from index.html, then refresh the browser to see style changes." },
  "sql-fundamentals": { code: "sqlite3 --version\nsqlite3 practice.db\n\nSELECT 'SQL is ready';", output: "The version check confirms SQLite. The query returns SQL is ready." },
  "c-fundamentals": { code: "gcc --version\n\ngcc main.c -o main\n./main", output: "The compiler builds main.c into an executable named main, which you can run from the terminal." },
  "cpp-fundamentals": { code: "g++ --version\n\ng++ main.cpp -o main\n./main", output: "The compiler builds main.cpp into an executable named main, which you can run from the terminal." },
};

const pythonVariableExamples: Record<string, { code: string; output: string }> = {
  "what-is-a-variable": { code: 'student_name = "MyLoginn"\nprint(student_name)', output: "MyLoginn" },
  "creating-variables": { code: 'course = "Python"\nlessons = 27\nprint(course, lessons)', output: "Python 27" },
  "assigning-values": { code: 'score = 80\nscore = score + 5\nprint(score)', output: "85" },
  "calling-variables": { code: 'name = "MyLoginn"\nprint(name)', output: "MyLoginn" },
  "using-variables-in-expressions": { code: 'price = 50\nquantity = 3\ntotal = price * quantity\nprint(total)', output: "150" },
  "variable-names": { code: 'student_name = "MyLoginn"\nprint(student_name)', output: "MyLoginn" },
  "variable-naming-rules": { code: 'course2 = "Python"\n_private_note = "review lists"\nprint(course2, _private_note)', output: "Python review lists" },
  "valid-variable-names": { code: 'user_name = "MyLoginn"\nlesson_count = 4\nprint(user_name, lesson_count)', output: "MyLoginn 4" },
  "invalid-variable-names": { code: 'student_name = "MyLoginn"\nscore_2 = 95\nprint(student_name, score_2)', output: "MyLoginn 95" },
  "assigning-strings-to-variables": { code: 'product_name = "Notebook"\nprint(product_name)', output: "Notebook" },
  "assigning-numbers-to-variables": { code: 'price = 500\nquantity = 2\nprint(price * quantity)', output: "1000" },
  "assigning-booleans-to-variables": { code: 'is_active = True\nprint(is_active)', output: "True" },
  "multiple-variables": { code: 'name = "MyLoginn"\nage = 20\ncity = "Coimbatore"\nprint(name, age, city)', output: "MyLoginn 20 Coimbatore" },
  "one-value-to-multiple-variables": { code: 'x = y = z = 0\nprint(x, y, z)', output: "0 0 0" },
  "multiple-values-to-multiple-variables": { code: 'x, y, z = 10, 20, 30\nprint(x, y, z)', output: "10 20 30" },
  "output-variables": { code: 'first_name = "MyLoginn"\nscore = 95\nprint(first_name)\nprint("Score:", score)', output: "MyLoginn\nScore: 95" },
  "reassigning-variables": { code: 'status = "draft"\nstatus = "published"\nprint(status)', output: "published" },
  "variable-types": { code: 'age = 20\nname = "MyLoginn"\nprint(type(age).__name__)\nprint(type(name).__name__)', output: "int\nstr" },
  "variable-scope": { code: 'course = "Python"\n\ndef show_course():\n    lesson = "Variables"\n    print(course, lesson)\n\nshow_course()', output: "Python Variables" },
  "local-variables": { code: 'def show_message():\n    message = "Inside the function"\n    print(message)\n\nshow_message()', output: "Inside the function" },
  "global-variables": { code: 'course = "Python"\n\ndef show_course():\n    print(course)\n\nshow_course()', output: "Python" },
  "the-global-keyword": { code: 'visits = 0\n\ndef record_visit():\n    global visits\n    visits += 1\n\nrecord_visit()\nprint(visits)', output: "1" },
  "constants-and-naming-conventions": { code: 'TAX_RATE = 0.08\nprice = 100\nprint(price * TAX_RATE)', output: "8.0" },
  "real-world-variable-usage": { code: 'student_name = "MyLoginn"\nstudent_age = 20\ncourse = "Python"\nprint(f"{student_name}, age {student_age}, studies {course}")', output: "MyLoginn, age 20, studies Python" },
  "common-variable-mistakes": { code: 'score = 80\nscore = score + 10\nprint(score)', output: "90" },
  "variable-best-practices": { code: 'cart_item_count = 2\nitem_price = 25\ncart_total = cart_item_count * item_price\nprint(cart_total)', output: "50" },
  "variable-challenge": { code: 'student_name = "MyLoginn"\nprint(student_name)', output: "MyLoginn" },
};

const pythonSyntaxExamples: Record<string, { code: string; output: string }> = {
  "python-syntax-overview": { code: 'message = "Syntax gives code its structure"\nprint(message)', output: "Syntax gives code its structure" },
  "python-statements": { code: 'course = "Python"\nprint(course)\nprint("Ready to learn")', output: "Python\nReady to learn" },
  "python-indentation": { code: 'age = 20\nif age >= 18:\n    print("Adult")', output: "Adult" },
  "python-comments": { code: '# Explain the purpose of this value\nlesson_count = 15\nprint(lesson_count)', output: "15" },
  "python-keywords": { code: 'for lesson in ["variables", "loops"]:\n    print(lesson)', output: "variables\nloops" },
  "python-identifiers": { code: 'student_name = "MyLoginn"\nlesson_2 = "Variables"\nprint(student_name, lesson_2)', output: "MyLoginn Variables" },
  "python-expressions": { code: 'price = 12\nquantity = 3\ntotal = price * quantity\nprint(total)', output: "36" },
  "python-code-blocks": { code: 'score = 82\nif score >= 50:\n    print("Pass")\n    print("Keep practicing")', output: "Pass\nKeep practicing" },
  "python-whitespace": { code: 'first = 4\nsecond = 6\nprint(first + second)', output: "10" },
  "python-capitalization-rules": { code: 'score = 95\nScore = 70\nprint(score)\nprint(Score)', output: "95\n70" },
  "python-delimiters": { code: 'colors = ["blue", "green"]\nprint(colors[0])', output: "blue" },
  "python-parentheses-and-brackets": { code: 'message = "hello"\nprint(message.upper())\ncolors = ["blue", "green"]\nprint(colors[1])', output: "HELLO\ngreen" },
  "python-syntax-errors": { code: 'print("Hello")', output: "Hello" },
  "common-syntax-mistakes": { code: 'if True:\n    print("The block is indented")', output: "The block is indented" },
  "debugging-syntax-errors": { code: 'total = (4 + 6)\nprint(total)', output: "10" },
};

const explanations: Record<LessonKind, string> = {
  intro: "This course starts with the core ideas and builds toward small programs. Focus on understanding each example before moving to the next topic.",
  setup: "Choose a compiler, interpreter, or browser environment for this language. Run a tiny example first so you know your tools are working before adding more code.",
  hello: "A first program connects the language's basic structure to something visible. Read the example from top to bottom and notice which statement produces the result.",
  structure: "Every language has rules for arranging instructions. Following those rules lets the compiler, interpreter, or browser understand where each part begins and ends.",
  output: "Output makes a program's result visible. Use it while learning to check values and understand what your instructions are doing.",
  comments: "Comments are notes for people reading the source. They help explain intent, but the language ignores them when it runs the program.",
  variables: "A variable is a name that lets a program refer to a value and use it later. In Python, assignment binds the name to the value; it does not declare a typed storage box. In Java, C, and similar languages, the declaration also states the variable's type.",
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
  sort: "Merge sort repeatedly divides a list until each part has one item, then merges neighboring parts in sorted order. The recursive calls handle the smaller lists; the merge step compares their front items and takes the smaller one next.",
  array: "The array module stores values of one declared primitive type compactly. A Python list is more flexible and can hold mixed types; arrays are useful when a typed sequence is appropriate.",
  iterator: "An iterable can produce an iterator. The iterator remembers its current position; each next() call yields one item, and iteration ends when there are no items left.",
  date: "The datetime module represents dates and times as structured values. Use date arithmetic such as timedelta instead of manually adjusting calendar strings.",
  math: "The math module provides numeric operations and constants such as pi. Keep full precision during calculations and round only when presenting a result.",
  json: "JSON is a text format for exchanging structured data. dumps() converts Python values to JSON text; loads() parses JSON text back into Python values.",
  regex: "Regular expressions describe text patterns. Compile or reuse clear patterns, use raw strings for regex literals, and validate the complete input when the whole value must match.",
  packages: "pip installs packages into a Python environment. A virtual environment keeps project dependencies separate, while requirements.txt records packages for repeatable setup.",
  recursion: "A recursive function calls itself with a smaller or simpler input. Every recursive path needs a base case that stops making recursive calls; otherwise the calls continue until Python raises RecursionError.",
};

const takeaways: Partial<Record<LessonKind, string[]>> = {
  intro: ["Use print() to show a message in the console.", "Put text inside matching single or double quotes."],
  variables: ["Choose clear names.", "Keep track of the current value after every assignment."],
  types: ["Check the type before applying an operation.", "Convert input explicitly when a number is expected."],
  condition: ["Conditions evaluate to true or false.", "Order branches from specific cases to general cases."],
  loop: ["Track the loop variable on every iteration.", "Make sure the stopping condition can eventually become true."],
  function: ["Use parameters for changing inputs.", "Return a value when the caller needs a result."],
  collection: ["Check valid positions and the collection length.", "Use a loop when you need to process every item."],
  sort: ["The split step reduces the problem size.", "The merge step must preserve sorted order and include every value."],
  array: ["Use lists for general-purpose mixed collections.", "Choose typed arrays when their memory and type behavior suits the task."],
  iterator: ["Each next() call advances the iterator.", "Exhausted iterators do not restart automatically."],
  date: ["Keep date values as date/time objects while calculating.", "Format them as text only when displaying or exporting."],
  math: ["Use the standard library for common numeric operations.", "Round for display rather than too early in a calculation."],
  json: ["JSON object keys are strings.", "Handle invalid JSON and unexpected field shapes at input boundaries."],
  regex: ["Keep patterns readable and specific.", "Test valid, invalid, and boundary inputs."],
  packages: ["Use python -m pip so installation targets the selected interpreter.", "Pin project dependencies in a requirements file when sharing work."],
  recursion: ["Identify the base case before tracing the recursive call.", "Each call should move its input toward that base case."],
  query: ["Select only the fields you need.", "Add ORDER BY when result order matters."],
  filter: ["Use comparison operators that match the field type.", "Test the condition against both matching and nonmatching rows."],
  selector: ["Classes can be reused across elements.", "Keep selector scope narrow and predictable."],
  box: ["Content size is only one part of the full box.", "Use consistent spacing values to keep layouts clear."],
};

const definitions: Partial<Record<LessonKind, string>> = {
  intro: "Programming is writing precise instructions that a computer can follow to solve a problem.",
  setup: "A development environment is the set of tools used to write, run, and inspect a program.",
  hello: "A first program is a small working example that shows how a language is written and run.",
  structure: "Syntax is the set of rules that determines how valid instructions are arranged in a language.",
  output: "Output is information a running program sends back, such as text printed in a terminal.",
  comments: "A comment is a note in source code that the language ignores while executing the program.",
  variables: "A variable is a name that lets a program refer to a value and use it later.",
  types: "A data type identifies the kind of value an expression represents and which operations apply to it.",
  numbers: "A number is a numeric value used for counting, measuring, or arithmetic.",
  strings: "A string is a sequence of text characters that a program can store and process.",
  operators: "An operator is a symbol or keyword that performs an operation on one or more values.",
  condition: "A condition is an expression evaluated as true or false to choose which code runs.",
  loop: "A loop repeats a block of code while iterating over items or while a condition remains true.",
  function: "A function is a named, reusable block of code that can accept inputs and return a result.",
  collection: "A collection stores multiple related values in one structure, such as a list or tuple.",
  object: "An object groups related data and, in many languages, the operations that work on that data.",
  class: "A class defines the data and behavior that objects created from it can have.",
  input: "Input is data a program receives from a user, file, or another system.",
  module: "A module is a file or package of reusable code that another program can import.",
  file: "File handling is the process of reading or writing data stored outside the running program.",
  error: "Exception handling lets a program respond to a runtime problem without abruptly stopping.",
  sort: "Merge sort orders values by splitting them into smaller groups, then merging those groups in order.",
  recursion: "Recursion is a technique where a function solves a problem by calling itself on a smaller case.",
  array: "An array stores an ordered sequence of values that can be accessed by position.",
  iterator: "An iterator is an object that yields items one at a time and remembers where it is in a sequence.",
  json: "JSON is a text format for representing structured data such as objects, arrays, strings, and numbers.",
  regex: "A regular expression is a pattern used to find or validate text.",
  date: "A date value represents a calendar day in a form a program can compare and calculate with.",
  math: "A math library provides ready-made constants and functions for common numeric calculations.",
  packages: "A package manager installs and tracks reusable software libraries for a project.",
  database: "A database is an organized system for storing and retrieving related information.",
  query: "A query is an instruction that asks a database to retrieve or change data.",
  pointer: "A pointer is a value that refers to a memory address where another value is stored.",
  dom: "The Document Object Model (DOM) is the browser's tree-like representation of a web page that JavaScript can inspect and update.",
  event: "An event is a signal that something happened, such as a click, that a program can respond to.",
  semantics: "Semantic HTML uses elements that describe the role and meaning of page content.",
  link: "A hyperlink is a clickable reference that navigates to another page, file, or location.",
  image: "An image element displays a visual file in a page; alternative text describes its meaning to people who cannot see it.",
  form: "A form is a group of controls that collects and submits information.",
  table: "An HTML table organizes related information into rows and columns with meaningful headers.",
  null: "SQL NULL marks a value that is missing or unknown; it must be checked with IS NULL rather than equals.",
  styles: "A CSS style rule matches page elements and applies visual declarations such as color, spacing, and type.",
  selector: "A CSS selector describes which HTML elements a style rule should match.",
  box: "The CSS box model describes an element's content area, padding, border, and outer margin.",
  layout: "A layout system arranges elements within the available page space.",
  responsive: "Responsive design adapts a page's layout and sizing to the user's screen and viewport.",
  insert: "An SQL INSERT statement adds a new row of values to a table.",
  update: "An SQL UPDATE statement changes selected values in existing table rows.",
  aggregate: "An aggregate function summarizes values from multiple database rows into a result such as a count or average.",
  join: "An SQL JOIN combines related rows from multiple tables using a matching condition.",
  "structure-data": "A data structure defines how a program organizes values so they can be accessed or changed.",
  practice: "A programming exercise asks you to apply a concept to a specific input and produce a verifiable result.",
};

const keywordsByKind: Partial<Record<LessonKind, string[]>> = {
  intro: ["program", "instruction", "execution"], setup: ["runtime", "compiler", "interpreter"],
  hello: ["entry point", "statement", "output"], structure: ["syntax", "statement", "block"],
  output: ["print", "console", "result"], comments: ["comment", "source code", "documentation"],
  variables: ["name", "assignment", "value"], types: ["type", "value", "conversion"],
  numbers: ["integer", "float", "arithmetic"], strings: ["string", "character", "method"],
  operators: ["operand", "operator", "expression"], condition: ["condition", "branch", "Boolean"],
  loop: ["iteration", "sequence", "termination"], function: ["function", "parameter", "return value"],
  collection: ["item", "index", "length"], object: ["key", "value", "property"],
  class: ["class", "object", "method"], input: ["input", "validation", "conversion"],
  module: ["module", "import", "namespace"], file: ["path", "mode", "resource"],
  error: ["exception", "handler", "fallback"], recursion: ["recursive call", "base case", "call stack"],
  sort: ["divide", "compare", "merge"], array: ["element", "index", "fixed type"],
  iterator: ["iterable", "iterator", "next"], json: ["JSON", "serialization", "parse"],
  regex: ["pattern", "match", "character class"], date: ["date", "timedelta", "format"],
  math: ["function", "constant", "precision"], packages: ["package", "dependency", "environment"],
  database: ["table", "row", "column"], query: ["SELECT", "FROM", "result set"],
  filter: ["WHERE", "predicate", "row"], join: ["JOIN", "key", "related row"],
  pointer: ["address", "dereference", "value"], styles: ["selector", "declaration", "cascade"],
  selector: ["selector", "specificity", "match"], box: ["content", "padding", "border", "margin"],
  layout: ["container", "alignment", "flow"], responsive: ["viewport", "breakpoint", "fluid layout"],
  dom: ["document", "element", "node"], event: ["event", "listener", "handler"],
  link: ["anchor", "href", "destination"], image: ["source", "alt text", "accessibility"],
  form: ["control", "label", "submission"], table: ["row", "column", "header"],
  null: ["NULL", "unknown", "IS NULL"], semantics: ["element", "meaning", "accessibility"],
  insert: ["INSERT", "VALUES", "row"], update: ["UPDATE", "SET", "WHERE"],
  aggregate: ["aggregate", "GROUP BY", "summary"], "structure-data": ["field", "record", "type"],
  practice: ["input", "process", "result"],
};

type TopicCopy = {
  overview: string;
  definition: string;
  explanation: string;
  keyPoints: { title: string; detail: string }[];
  visual: TutorialLesson["visual"];
};

const courseIntroCopy: Record<string, { definition: string; overview: string; history: string; focus: string }> = {
  "java-fundamentals": { definition: "Java is a statically typed, general-purpose programming language. Java source is compiled to bytecode that runs on a Java Virtual Machine (JVM).", overview: "Java is used for server applications, business software, Android development, and tools. Its explicit types and class-based structure help organize larger programs.", history: "Java was developed at Sun Microsystems under James Gosling and introduced publicly in 1995. Its JVM-based design made it possible to run compiled bytecode on different systems with compatible Java runtimes. Java is now stewarded through the OpenJDK project and the Java community.", focus: "classes, static types, and the JVM" },
  "javascript-fundamentals": { definition: "JavaScript is a high-level, dynamically typed programming language standardized as ECMAScript. Browsers use it to respond to user actions and update pages; server runtimes can use it outside the browser.", overview: "JavaScript connects page content to behavior. Learners can start in a browser console, then use the same core language for interactive interfaces, server programs, and automation.", history: "JavaScript was created by Brendan Eich at Netscape in 1995. The language was standardized as ECMAScript, allowing multiple browser and server implementations to share a common specification while continuing to evolve.", focus: "values, functions, and browser APIs" },
  "html-fundamentals": { definition: "HTML (HyperText Markup Language) is a markup language that gives web content structure and meaning through elements and attributes.", overview: "Browsers interpret HTML to build a document structure. Good markup helps people and assistive technology understand headings, links, images, forms, and page regions.", history: "HTML was created by Tim Berners-Lee for sharing linked documents on the early Web. It has evolved through standards work into the semantic, multimedia-capable HTML used by modern browsers.", focus: "elements, attributes, and semantic structure" },
  "css-fundamentals": { definition: "CSS (Cascading Style Sheets) is a stylesheet language that describes how selected document elements should look and how they should be arranged.", overview: "CSS separates presentation from document structure. Rules match elements with selectors, then the cascade resolves which declarations apply when rules overlap.", history: "CSS was proposed by Håkon Wium Lie in 1994 to give web authors more control over presentation. The first CSS recommendation followed in 1996, and the language has since grown to support responsive layouts, animation, and modern design systems.", focus: "selectors, the cascade, and layout" },
  "sql-fundamentals": { definition: "SQL (Structured Query Language) is a declarative language for defining, reading, and changing data in relational database systems.", overview: "SQL describes the data result or change you want. A database evaluates the statement against tables and relationships, making SQL useful for applications, reporting, and data analysis.", history: "SQL grew from IBM research on relational databases in the 1970s and was standardized internationally beginning in the 1980s. Database products implement the standard with their own additional features and syntax variations.", focus: "tables, queries, and relationships" },
  "c-fundamentals": { definition: "C is a general-purpose, compiled programming language that gives programmers direct control over data representation and memory while supporting structured programming.", overview: "C is used in operating systems, embedded devices, compilers, and performance-sensitive software. Its small core makes it useful for learning how programs work close to the machine.", history: "C was developed by Dennis Ritchie at Bell Labs in the early 1970s, building on earlier systems languages. It became widely used for systems software and was standardized so programs could be written more portably across implementations.", focus: "types, functions, arrays, and memory" },
  "cpp-fundamentals": { definition: "C++ is a compiled, general-purpose language that supports procedural, object-oriented, and generic programming, with control over performance and resources.", overview: "C++ is used in game engines, desktop software, embedded systems, and performance-sensitive applications. It offers high-level abstractions while allowing close control of memory and execution.", history: "C++ began as Bjarne Stroustrup's work at Bell Labs in 1979, extending C with class features. It later became an international standard and continues to evolve through the ISO C++ standardization process.", focus: "types, functions, collections, and classes" },
};

function getTopicCopy(courseSlug: string, title: string, kind: LessonKind, languageName: string, code: string, output: string): TopicCopy {
  const normalized = title.toLowerCase().replace(/[?!]/g, "").trim();
  const courseIntro = courseIntroCopy[courseSlug];
  if (courseIntro && /history/.test(normalized)) return {
    overview: courseIntro.history,
    definition: `${languageName} history explains how the language's design and ecosystem developed over time.`,
    explanation: courseIntro.history,
    keyPoints: [{ title: "Origins", detail: courseIntro.history }, { title: "Why the history matters", detail: `The original goals help explain today's ${courseIntro.focus}.` }, { title: "Modern use", detail: courseIntro.overview }],
    visual: { caption: `${languageName.toUpperCase()} · FROM ORIGIN TO MODERN USE`, nodes: [{ label: "ORIGIN", value: "Language design begins" }, { label: "EVOLUTION", value: "Standards and ecosystem grow" }, { label: "TODAY", value: courseIntro.focus }], summary: `The history of ${languageName} helps explain how the language is used today.` },
  };
  if (courseIntro && /^(introduction|what is|what are)/.test(normalized)) return {
    overview: courseIntro.overview,
    definition: courseIntro.definition,
    explanation: `${courseIntro.definition} This course builds the foundation through ${courseIntro.focus}, then applies those ideas in small programs and practical exercises.`,
    keyPoints: [{ title: "Language role", detail: courseIntro.definition }, { title: "How it is used", detail: courseIntro.overview }, { title: "Course focus", detail: `The first lessons introduce ${courseIntro.focus}.` }],
    visual: { caption: `${languageName.toUpperCase()} · LANGUAGE TO APPLICATION`, nodes: [{ label: "IDEA", value: courseIntro.focus }, { label: "WRITE", value: "Express a small instruction" }, { label: "APPLY", value: "Build useful software" }], summary: courseIntro.overview },
  };
  if (courseIntro && kind === "setup") {
    const guides: Record<string, { overview: string; commands: string; workflow: string }> = {
      "java-fundamentals": { overview: "Install a JDK, which includes both the Java runtime and compiler. Choose a trusted OpenJDK distribution or your platform's supported installer, then open a new terminal.", commands: "java --version\njavac --version\n\njavac Main.java\njava Main", workflow: "The version checks confirm the runtime and compiler are available. Compile a source file with javac, then run its class with java." },
      "javascript-fundamentals": { overview: "JavaScript can run in a browser without a separate compiler. Install Node.js when you want to run scripts from a terminal, or use the browser developer console for the first examples.", commands: "node --version\nnpm --version\n\nnode app.js", workflow: "The version checks confirm Node.js and its package manager are available. Save a script as app.js and run it with node; browser-only examples can be tried in the developer console." },
      "html-fundamentals": { overview: "HTML needs only a text editor and a browser. Create an index.html file, save it, then open it in a browser; refresh after each change.", commands: "my-page/\n  index.html", workflow: "The browser reads the saved HTML file and renders its document structure. No compiler or package installation is required for the lessons in this course." },
      "css-fundamentals": { overview: "CSS needs a text editor and a browser. Create a stylesheet and link it from an HTML file so you can see style changes as you edit.", commands: "my-page/\n  index.html\n  styles.css", workflow: "Keep page structure in HTML and presentation rules in styles.css. Refresh the browser to check how selectors and declarations affect the page." },
      "sql-fundamentals": { overview: "SQL is run by a database system. Use the database tool required by your course or install SQLite for a lightweight local practice database.", commands: "sqlite3 --version\nsqlite3 practice.db\n\nSELECT 'SQL is ready';", workflow: "The version check confirms the SQLite command is available. Opening a database starts an SQL prompt where you can run queries; graphical database tools provide the same core learning workflow." },
      "c-fundamentals": { overview: "C source code must be compiled. Install a compiler toolchain appropriate for your operating system, then use a new terminal to check that the compiler is on your PATH.", commands: "gcc --version\n\ngcc main.c -o main\n./main", workflow: "The compiler turns main.c into an executable named main. Run that executable from the terminal; compiler names and run commands differ on Windows toolchains." },
      "cpp-fundamentals": { overview: "C++ source code must be compiled. Install a compiler toolchain such as GCC, Clang, or MSVC, then open a new terminal and confirm the compiler is available.", commands: "g++ --version\n\ng++ main.cpp -o main\n./main", workflow: "The compiler turns main.cpp into an executable named main. Run that executable from the terminal; compiler names and run commands differ on Windows toolchains." },
    };
    const guide = guides[courseSlug];
    if (guide) return {
      overview: guide.overview,
      definition: `A ${languageName} development setup is the editor and runtime, compiler, browser, or database tool needed to write and run ${languageName} examples.`,
      explanation: guide.workflow,
      keyPoints: [{ title: "Choose the right tool", detail: guide.overview }, { title: "Verify it", detail: "Open a new terminal or browser session after installation and check that the chosen tool is available." }, { title: "Run a small example", detail: guide.workflow }, { title: "Keep the workflow simple", detail: "Use the same editor and run process while learning; add project tooling when a lesson needs it." }],
      visual: { caption: `${languageName.toUpperCase()} SETUP · PREPARE, VERIFY, RUN`, nodes: [{ label: "PREPARE", value: "Install or open the required tool" }, { label: "VERIFY", value: "Check it is available" }, { label: "RUN", value: "Try a small lesson example" }], summary: "A verified development setup gives you a reliable way to try each lesson." },
    };
  }
  if (courseSlug === "python-fundamentals" && normalized === "python installation") return {
    overview: "Install a supported Python 3 interpreter for your operating system, then verify it from a terminal. An editor such as VS Code is a separate tool; it does not install Python by itself.",
    definition: "Installing Python means adding the Python interpreter to your computer so it can run .py programs and create isolated project environments.",
    explanation: "Choose one installation route for your system: Python Install Manager or Microsoft Store on Windows, the official universal macOS package or Homebrew on macOS, or your Linux distribution's package manager. For data science, Anaconda or Miniconda are alternatives that include conda environments. After installation, open a new terminal, check the version, and create a virtual environment for each project. The detailed steps below cover these choices.",
    keyPoints: [{ title: "Choose the right installer", detail: "Use the instructions for Windows, macOS, or your Linux distribution; avoid downloading installers from untrusted sites." }, { title: "Verify Python", detail: "A version command confirms the terminal can find the interpreter." }, { title: "Keep projects isolated", detail: "A virtual environment keeps one project's packages separate from another's." }, { title: "Editor is separate", detail: "VS Code and its Python extension provide editing tools; the interpreter still needs to be installed separately." }],
    visual: { caption: "PYTHON INSTALLATION · CHOOSE, INSTALL, VERIFY", nodes: [{ label: "1 · CHOOSE", value: "Windows · macOS · Linux" }, { label: "2 · INSTALL", value: "Official installer or package manager" }, { label: "3 · VERIFY", value: "Check Python 3 in Terminal" }], summary: "Use the route for your operating system, verify the interpreter, then create a virtual environment for your project." },
  };
  if (courseSlug === "python-fundamentals" && normalized === "why python") return {
    overview: "Python is designed to make code readable and quick to develop. Its concise syntax and broad ecosystem make it useful for automation, web services, data analysis, and scientific computing.",
    definition: "Python is a high-level, general-purpose programming language whose interpreter runs readable source code across major operating systems.",
    explanation: "Python is useful when a task benefits from readable code and a large ecosystem of tools. Developers can test ideas quickly in the interpreter, then use the same language for scripts, web backends, data analysis, and many other applications. The best language still depends on the project's performance, platform, and deployment needs.",
    keyPoints: [
      { title: "Readable code", detail: "Indentation and concise syntax make program structure visible." },
      { title: "Quick feedback", detail: "The interpreter supports a short write, run, and refine cycle." },
      { title: "Broad ecosystem", detail: "The standard library and third-party packages support many common tasks." },
      { title: "Project fit", detail: "Python is widely used, though performance and deployment needs still guide language choice." },
    ],
    visual: { caption: "WHY PYTHON? · FROM LANGUAGE DESIGN TO PRACTICAL WORK", nodes: [{ label: "DESIGN", value: "Readable syntax" }, { label: "WORKFLOW", value: "Write · run · refine" }, { label: "APPLICATIONS", value: "Automation · web · data" }], summary: "Readable code and quick feedback help people build many kinds of software." },
  };
  if (courseSlug === "python-fundamentals" && normalized === "python use cases") return {
    overview: "Python is applied to practical work across software, automation, data, and science. Libraries and frameworks provide specialized tools for each area.",
    definition: "A use case is a practical task that a language or tool is applied to solve.",
    explanation: "Python scripts automate repeated file and system tasks. Web frameworks use it to build server applications, while data and scientific libraries help process datasets and perform calculations. Teams also use it for testing, prototypes, and machine learning workflows.",
    keyPoints: [{ title: "Automation", detail: "Scripts can process files, reports, and routine workflows." }, { title: "Web applications", detail: "Server frameworks handle routes, requests, and application logic." }, { title: "Data and science", detail: "Libraries support analysis, visualization, and numerical computing." }, { title: "Tooling", detail: "Python is also used for tests, prototypes, and developer utilities." }],
    visual: { caption: "PYTHON USE CASES · ONE LANGUAGE, DIFFERENT TOOLKITS", nodes: [{ label: "SCRIPT", value: "Automate a task" }, { label: "APPLICATION", value: "Serve a web request" }, { label: "ANALYSIS", value: "Transform data" }], summary: "The language stays the same while libraries provide tools for each kind of work." },
  };
  if (courseSlug === "python-fundamentals" && normalized === "python advantages") return {
    overview: "Python's readable syntax, fast development workflow, and extensive package ecosystem are useful strengths for many projects.",
    definition: "A programming-language advantage is a quality that makes the language useful for a particular project or workflow.",
    explanation: "Python code is often concise and straightforward to review. Its interpreter supports quick experimentation, and its package ecosystem provides established tools for common tasks. These strengths come with tradeoffs: Python may not suit every real-time, resource-constrained, or low-level application.",
    keyPoints: [{ title: "Readability", detail: "Consistent syntax helps people understand and maintain code." }, { title: "Development speed", detail: "The edit-and-run workflow makes experimentation straightforward." }, { title: "Reusable packages", detail: "Libraries provide solutions for common tasks." }, { title: "Consider tradeoffs", detail: "Performance, runtime, and deployment requirements still matter." }],
    visual: { caption: "PYTHON ADVANTAGES · STRENGTHS AND PROJECT FIT", nodes: [{ label: "READ", value: "Understand the code" }, { label: "BUILD", value: "Iterate quickly" }, { label: "CHOOSE", value: "Match project needs" }], summary: "Python's strengths are useful when they align with the project's requirements." },
  };

  const special: [RegExp, Omit<TopicCopy, "keyPoints">][] = [
    [/indentation/, { overview: "Indentation marks the body of a Python function, loop, class, or conditional. Consistent indentation is part of the program's structure.", definition: "Indentation is the leading whitespace that groups statements into a code block.", explanation: "After a Python line ending in a colon, indent the statements that belong to its block by the same amount. When the block ends, return to the earlier indentation level. Mixing indentation widths can trigger an IndentationError or put code in the wrong block.", visual: { caption: "INDENTATION · BLOCK SCOPE", nodes: [{ label: "HEADER", value: "if score >= 50:" }, { label: "INDENTED BODY", value: "print('Pass')" }, { label: "DEDENT", value: "Continue outside if" }], summary: "Indentation determines which statements belong to a block." } }],
    [/comments?/, { overview: "Comments document intent for people reading the program. Python ignores comment text when it executes the code.", definition: "A comment is explanatory source text that the Python interpreter does not execute.", explanation: "A # character begins a Python comment that continues to the end of that line. Use comments to explain a reason or a non-obvious decision; clear names and small functions should carry the basic meaning of the code.", visual: { caption: "PYTHON COMMENTS · SOURCE TO EXECUTION", nodes: [{ label: "SOURCE", value: "# explain intent" }, { label: "INTERPRETER", value: "Skips comment text" }, { label: "PROGRAM", value: "Runs code statements" }], summary: "Comments help readers; executable statements produce the program's behavior." } }],
    [/keyword/, { overview: "Python keywords are reserved words with defined roles in the language grammar, such as starting a condition or defining a function.", definition: "A keyword is a reserved Python word that cannot be used as an ordinary identifier.", explanation: "Words such as if, for, and def have special meaning to Python. Use them in their language-defined positions, and choose another name for variables and functions. The keyword module can list the reserved words for the Python version you are running.", visual: { caption: "KEYWORDS · RESERVED MEANING", nodes: [{ label: "WORD", value: "if" }, { label: "PARSER", value: "Recognizes a condition" }, { label: "BLOCK", value: "Selects statements" }], summary: "Reserved words contribute to Python syntax and cannot be reused as ordinary names." } }],
    [/identifier|variable name|naming rule/, { overview: "An identifier is a name used for a variable, function, class, or other object. Valid names follow Python's naming rules and should communicate purpose.", definition: "An identifier is a programmer-chosen name that refers to an object or definition in code.", explanation: "Python identifiers can contain letters, underscores, and digits, but cannot start with a digit or contain spaces. Names are case-sensitive and cannot be reserved keywords. Descriptive snake_case names are conventional for variables and functions.", visual: { caption: "IDENTIFIERS · VALID NAME CHECK", nodes: [{ label: "CHOOSE", value: "student_score" }, { label: "CHECK", value: "Letters · digits · _" }, { label: "USE", value: "Refer to its value" }], summary: "A valid, descriptive identifier is easy to refer to and understand." } }],
    [/expression/, { overview: "An expression combines literals, names, operators, or calls to produce a value.", definition: "An expression is a piece of code that Python evaluates to a value.", explanation: "Python evaluates each part of an expression according to operator precedence, then produces a result. For example, 3 + 4 * 2 evaluates to 11 because multiplication happens before addition. Parentheses make the intended order explicit.", visual: { caption: "EXPRESSIONS · INPUTS TO VALUE", nodes: [{ label: "VALUES", value: "3 · 4 · 2" }, { label: "OPERATORS", value: "+ and *" }, { label: "RESULT", value: "11" }], summary: "Python evaluates operands and operators to produce a value." } }],
    [/creating|assigning|reassign|multiple variables|one value to multiple|variable challenge/, { overview: "Assignment binds a name to an object. Reassignment makes the name refer to a new value, and multiple names can refer to the same value.", definition: "Assignment evaluates an expression and binds one or more names to its result.", explanation: "Python evaluates the expression to the right of = and binds the left-side name to its result. A later assignment can bind that name to a different object. Chained assignment binds several names to the same object, so use it when sharing that value is intended.", visual: { caption: "VARIABLE ASSIGNMENT · NAME TO VALUE", nodes: [{ label: "EXPRESSION", value: '"MyLoginn"' }, { label: "ASSIGN", value: "name = value" }, { label: "REFERENCE", value: "name → text" }], summary: "Assignment evaluates the right side, then binds the name on the left." } }],
    [/list|tuple|set|dictionary|dict|collection/, { overview: `${title} focuses on a Python collection. Built-in collection types differ in order, mutability, uniqueness, and lookup behavior.`, definition: `${title} describes how Python stores, accesses, or changes related values in a collection.`, explanation: "Choose a collection by how the data will be used: lists are ordered and mutable, tuples are ordered and immutable, sets hold unique values, and dictionaries map keys to values. The operation in this lesson follows the selected type's rules.", visual: { caption: "PYTHON COLLECTIONS · STRUCTURE TO ACCESS", nodes: [{ label: "VALUES", value: "Related data" }, { label: "STRUCTURE", value: "List · tuple · set · dict" }, { label: "OPERATION", value: "Access or update" }], summary: "The collection type determines how values are stored and which operations are appropriate." } }],
  ];
  const match = courseSlug === "python-fundamentals" ? special.find(([pattern]) => pattern.test(normalized)) : undefined;
  if (match) return { ...match[1], keyPoints: [{ title: "Definition", detail: match[1].definition }, { title: "How it works", detail: match[1].explanation }, { title: "In this lesson", detail: `Trace how ${title.toLowerCase()} is used in the example.` }, { title: "Check your understanding", detail: "Explain how the code's result follows from this topic's rule." }] };

  const definition = definitions[kind] ?? explanations[kind];
  const explanation = explanations[kind];
  return {
    overview: `${definition} In this topic, the example applies that idea in ${languageName} and shows the resulting behavior.`,
    definition,
    explanation: `${explanation} For ${title.toLowerCase()}, trace the sample's input, follow the relevant operation, and compare the result with the expected output.`,
    keyPoints: [{ title: "Core idea", detail: definition }, { title: "How it works", detail: explanation }, { title: "Syntax in context", detail: `The example demonstrates ${title.toLowerCase()} using ${languageName} syntax.` }, { title: "Check the result", detail: "Trace the values through the example and compare them with the expected output." }],
    visual: { caption: `${title.toUpperCase()} · TOPIC MAP`, nodes: [
      { label: "CORE IDEA", value: "What this topic means", detail: definition },
      { label: "HOW IT WORKS", value: "The rule or process", detail: explanation },
      { label: "USE IT", value: "Apply it in the example", detail: `Use ${title.toLowerCase()} in ${languageName}, then check the result.` },
    ], summary: `This chart maps ${title.toLowerCase()} from its meaning, through the way it works, to applying it in a real example.` },
  };
}

function starterForLanguage(courseSlug: string, title: string) {
  const comment = ({
    "python-fundamentals": `# Challenge: ${title}\n# Write your solution below`,
    "java-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "javascript-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "c-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "cpp-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "html-fundamentals": `<!-- Challenge: ${title} -->\n<!-- Write your solution below -->`,
    "css-fundamentals": `/* Challenge: ${title} */\n/* Write your solution below */`,
    "sql-fundamentals": `-- Challenge: ${title}\n-- Write your solution below`,
  } as Record<string, string>)[courseSlug];
  return comment ?? `// Challenge: ${title}\n// Write your solution below`;
}

export function buildTutorialLesson(courseSlug: string, title: string, index: number): TutorialLesson {
  const kind = lessonKindForCourse(courseSlug, title);
  const isWhyPython = courseSlug === "python-fundamentals" && /^why python\??$/i.test(title.trim());
  const sample = isWhyPython
    ? { code: 'numbers = [1, 2, 3]\ndoubled = [number * 2 for number in numbers]\nprint(doubled)', output: "[2, 4, 6]" }
    : courseSlug === "python-fundamentals" && /variable/i.test(title)
    ? pythonVariableExamples[toTopicSlug(title)] ?? codeSamples[courseSlug]?.[kind]
    : courseSlug === "python-fundamentals" && /python syntax|indentation|statements|keywords|identifiers|expressions|code blocks|whitespace|capitalization rules|delimiters|parentheses|syntax errors|syntax mistakes|debugging syntax errors/i.test(title)
      ? pythonSyntaxExamples[toTopicSlug(title)] ?? codeSamples[courseSlug]?.[kind]
      : kind === "setup" ? setupSamples[courseSlug] ?? codeSamples[courseSlug]?.setup
      : codeSamples[courseSlug]?.[kind] ?? (kind === "intro" ? codeSamples[courseSlug]?.hello : undefined);
  const commentPrefix: Record<string, string> = {
    "python-fundamentals": "#", "java-fundamentals": "//", "javascript-fundamentals": "//",
    "html-fundamentals": "<!--", "css-fundamentals": "/*", "sql-fundamentals": "--",
    "c-fundamentals": "//", "cpp-fundamentals": "//",
  };
  const closingComment: Record<string, string> = { "html-fundamentals": " -->", "css-fundamentals": " */" };
  const languageName = ({ "python-fundamentals": "Python", "java-fundamentals": "Java", "javascript-fundamentals": "JavaScript", "html-fundamentals": "HTML", "css-fundamentals": "CSS", "sql-fundamentals": "SQL", "c-fundamentals": "C", "cpp-fundamentals": "C++" } as Record<string, string>)[courseSlug] ?? courseSlug.replace(/-fundamentals$/, "").replace(/-/g, " ");
  const code = sample?.code ?? `${commentPrefix[courseSlug] ?? "//"} ${title}${closingComment[courseSlug] ?? ""}\n${commentPrefix[courseSlug] ?? "//"} Explore the key idea, then build a small example of your own.${closingComment[courseSlug] ?? ""}`;
  const syntaxByKind: Partial<Record<LessonKind, string>> = {
    variables: courseSlug === "python-fundamentals" ? "name = value  ·  example: student = \"MyLoginn\"" : "type name = value;  ·  syntax varies by language",
    output: courseSlug === "python-fundamentals" ? "print(value)" : "output_function(value)",
    comments: courseSlug === "python-fundamentals" ? "# comment for the reader" : "comment marker + note",
    condition: "if condition: run this block; otherwise: run the alternative",
    loop: "for item in sequence: run this block once per item",
    function: "def function_name(parameter): return result",
    collection: "items = [value_1, value_2, ...]",
    strings: 'text = "Hello"  ·  text.upper() → "HELLO"',
    numbers: "result = number × number",
    sort: "sorted_values = merge_sort(values)",
    recursion: "function(base_case) → return; otherwise call function(smaller_case)",
  };
  const output = sample?.output ?? `The example demonstrates the main idea in ${title.toLowerCase()}.`;
  const pythonIntro = courseSlug === "python-fundamentals" && kind === "intro" && !/why python|python use cases|python advantages/i.test(title);
  const pythonInstallation = courseSlug === "python-fundamentals" && /^python installation$/i.test(title.trim());
  const requiresCodeChallenge = !["intro", "setup"].includes(kind) && !/^(what is|what are|why\b|introduction\b|intro to\b|.*\b(use cases|advantages|benefits|installation|environment|getting started|overview|history|choosing|versus|vs\.?|concepts?)\b)/i.test(title.trim());
  const topicCopy = getTopicCopy(courseSlug, title, kind, languageName, code, output);
  const articleSections = pythonInstallation ? [
    { title: "Before you begin", paragraphs: ["You need a Python 3 interpreter to run Python programs. Choose the instructions for your operating system below. You do not need to install every option. Use a current stable Python 3 release unless your course or project asks for a specific version."], bullets: ["Download software only from the official Python site, your operating-system store, or your distribution's trusted package manager.", "A code editor is optional. Python includes IDLE on some installers; VS Code is a separate editor and requires an interpreter."] },
    { title: "Windows: Python Install Manager", paragraphs: ["For a new Windows setup, install the Python Install Manager from the Microsoft Store or from python.org. The Store and python.org manager provide the same installation manager. Open a new Command Prompt or PowerShell after installation. If no Python runtime is installed yet, starting Python from the manager can install the current runtime; you can also explicitly install the latest Python 3 runtime."], code: "py install 3\npy --version\npython --version", bullets: ["If `py` is not recognized, close and reopen the terminal first. If it still fails, follow the Python Install Manager troubleshooting guide.", "The manager may offer to add command aliases to your user PATH. This is optional when using the `py` launcher.", "Windows Subsystem for Linux (WSL) is another option if you specifically want a Linux development environment on Windows; install Python inside the Linux distribution as well."], links: [{ label: "Python downloads for Windows", href: "https://www.python.org/downloads/windows/", detail: "Official Python Install Manager and Windows release downloads." }, { label: "Python on Windows guide", href: "https://docs.python.org/3/using/windows.html", detail: "Official instructions, command setup, and troubleshooting." }, { label: "Microsoft Store", href: "https://apps.microsoft.com/detail/9ncvdn91xzqp", detail: "Install Python Install Manager from Microsoft's store." }] },
    { title: "macOS: official installer or Homebrew", paragraphs: ["Pick one route. The python.org universal2 package supports Apple Silicon and Intel Macs that meet its macOS requirements. Open the downloaded .pkg file, follow the installer prompts, then open the installed Python folder in Applications and run Install Certificates.command once. Or, if Homebrew is already installed, use it to install Python 3."], code: "# Homebrew route\nbrew install python3\n\n# Verify either installation\npython3 --version", bullets: ["Do not remove or replace Apple's `/usr/bin/python3`; macOS tools may depend on it.", "If `brew` is not found, install Homebrew by following its official installation guide, or use the python.org package instead."], links: [{ label: "Python releases for macOS", href: "https://www.python.org/downloads/macos/", detail: "Official macOS installer packages." }, { label: "Python on macOS guide", href: "https://docs.python.org/3/using/mac.html", detail: "Official installation steps and notes about Apple's system Python." }, { label: "Homebrew Python guidance", href: "https://docs.brew.sh/Homebrew-and-Python", detail: "Homebrew's current guidance for installing and using Python." }, { label: "Install Homebrew", href: "https://docs.brew.sh/Installation", detail: "Official Homebrew installation instructions." }] },
    { title: "Linux: use your distribution's package manager", paragraphs: ["Most Linux distributions include Python 3 or provide it in their official repositories. Use the package manager for your distribution so system updates can manage the installation. On Ubuntu or Debian, install the interpreter, venv support, and pip together."], code: "# Ubuntu / Debian\nsudo apt update\nsudo apt install python3 python3-venv python3-pip\n\n# Fedora (alternative)\nsudo dnf install python3 python3-pip\n\n# Arch Linux (alternative)\nsudo pacman -S python python-pip\n\n# Verify\npython3 --version", bullets: ["Package names and available Python versions vary by distribution and release. Check your distribution's documentation if these commands do not match your system.", "Do not uninstall or replace the Python version used by your Linux system tools.", "Building CPython from source is an advanced option for contributors or when you need a custom build; most learners should use the distribution package or a version manager instead."], links: [{ label: "Python on Unix and Linux", href: "https://docs.python.org/3/using/unix.html", detail: "Official Python notes for Linux and other Unix platforms." }, { label: "Ubuntu Python setup", href: "https://ubuntu.com/developers/docs/howto/python-setup/", detail: "Ubuntu's interpreter, pip, and virtual environment guidance." }] },
    { title: "Data science option: Anaconda or Miniconda", paragraphs: ["Anaconda Distribution includes Python, conda, notebooks, and many data-science packages. Miniconda is a smaller installer that includes conda and Python, then lets you add packages as needed. Choose this route when your course or team uses conda; it is not required for ordinary Python learning."], links: [{ label: "Download Anaconda or Miniconda", href: "https://www.anaconda.com/download", detail: "Official Anaconda Distribution and Miniconda download options." }, { label: "Conda installation guide", href: "https://docs.conda.io/projects/conda/en/stable/user-guide/install/", detail: "Official setup guidance for Windows, macOS, and Linux." }] },
    { title: "Verify the installation", paragraphs: ["Open a new terminal window and run the command that matches your system. A version beginning with Python 3 means the terminal can find the interpreter. If the command is not found, reopen the terminal; then check the operating-system-specific setup notes linked above."], code: "# Windows\npy --version\n\n# macOS / Linux\npython3 --version" },
    { title: "Optional: install an editor and make a project environment", paragraphs: ["VS Code is a popular editor, but install the Python interpreter first, then install Microsoft's Python extension in VS Code and select that interpreter. For each project, create a virtual environment before adding packages."], code: "# Create a virtual environment in your project folder\npython -m venv .venv\n\n# Windows PowerShell\n.venv\\Scripts\\Activate.ps1\n\n# macOS / Linux\nsource .venv/bin/activate", links: [{ label: "Python in VS Code", href: "https://code.visualstudio.com/docs/languages/python", detail: "Microsoft's guide explains that the editor extension and interpreter are separate installs." }] },
  ] : pythonIntro ? [
    { title: "What is Python?", paragraphs: ["Python is a popular, high-level programming language created by Guido van Rossum and first released in 1991. Its readable syntax makes it approachable for beginners while remaining useful for professional software development."] },
    { title: "What can Python do?", paragraphs: [], bullets: ["Create server-side web applications.", "Automate software and everyday workflows.", "Connect to databases and read or modify files.", "Process data and perform scientific calculations.", "Build prototypes and production applications."] },
    { title: "Why Python?", paragraphs: [], bullets: ["It runs on common platforms, including Windows, macOS, and Linux.", "Its syntax is designed to be readable and concise.", "An interpreter runs Python programs, which makes trying ideas quick.", "It supports procedural, object-oriented, and functional programming styles."] },
    { title: "Good to know", paragraphs: ["This course uses Python 3. Python code can be written in a text editor or in an integrated development environment (IDE); an IDE is useful when a project contains many files."] },
    { title: "Python syntax compared to other languages", paragraphs: [], bullets: ["A newline usually ends a Python statement; semicolons are not normally required.", "Indentation defines the scope of functions, loops, and classes.", "Other languages, such as C, C++, and Java, commonly use curly braces to mark code blocks."] },
  ] : [
    { title: "The idea and why it matters", paragraphs: [topicCopy.overview, topicCopy.definition, topicCopy.explanation] },
    { title: "Key ideas", paragraphs: [], bullets: topicCopy.keyPoints.map((point) => `${point.title}: ${point.detail}`) },
    { title: "Read the example", paragraphs: [`This ${languageName} example demonstrates ${title.toLowerCase()}. Trace each instruction in order and note how the relevant values or page elements change.`], code },
    { title: "Follow the result", paragraphs: ["Compare the final state with the expected result. This check connects the syntax to the behavior you can observe."], code: output },
    { title: "Apply it", paragraphs: [`The concept is useful in practical code because ${topicCopy.definition.charAt(0).toLowerCase()}${topicCopy.definition.slice(1)}`], bullets: ["Change one input or value and predict what will happen before running the example.", "Keep the language's syntax and conventions consistent when adapting the example."] },
    { title: "Check your understanding", paragraphs: [`Explain why this example produces the shown result, then describe one change that would produce a different result.`], bullets: ["Common mistake: copying the syntax without checking what its values or conditions mean.", "Best practice: use meaningful names and verify behavior with a small example before expanding it."] },
  ];
  const overview = pythonIntro
    ? "Python is a high-level, general-purpose programming language known for readable syntax. It helps beginners write useful programs quickly and is also used in web development, automation, data analysis, and artificial intelligence."
    : topicCopy.overview;
  const keyPoints = pythonIntro ? [
    { title: "Readable syntax", detail: "Python uses clear words, whitespace, and indentation so code is easier to read." },
    { title: "More than one style", detail: "You can write procedural, object-oriented, and functional Python code." },
    { title: "Wide range of uses", detail: "Python is used for websites, automation, data analysis, scientific work, and AI." },
    { title: "Dynamic typing", detail: "You can assign a value without declaring its type first; Python tracks the type at runtime and manages memory automatically." },
  ] : topicCopy.keyPoints;
  const quiz = pythonInstallation ? {
    question: "Which command checks the installed Python 3 version on macOS or Linux?",
    options: [{ id: "A", text: "python3 --version" }, { id: "B", text: "install python" }, { id: "C", text: "python3 --remove" }, { id: "D", text: "pip --python" }],
    answer: "A",
    explanation: "python3 --version prints the Python 3 interpreter version available in the terminal. On Windows, the Python Install Manager can be checked with py --version.",
  } : pythonIntro ? {
    question: "Which of the following is not a typical feature of Python?",
    options: [{ id: "A", text: "Dynamic typing" }, { id: "B", text: "Readable syntax" }, { id: "C", text: "Automatic memory management" }, { id: "D", text: "Direct low-level memory operations as its main programming model" }],
    answer: "D",
    explanation: "Python is a high-level language that manages memory for you. Direct low-level memory operations are not its main programming model.",
  } : {
    question: `In this ${languageName} lesson on ${title.toLowerCase()}, what result does the example produce?`,
    options: [{ id: "A", text: output }, { id: "B", text: "The example produces no change or result" }, { id: "C", text: "The example reports a syntax error" }, { id: "D", text: "The example repeats its first step indefinitely" }],
    answer: "A",
    explanation: `Trace the ${title.toLowerCase()} example from its inputs through each instruction. Its expected result is: ${output}`,
  };
  const challengeByKind: Partial<Record<LessonKind, string>> = {
    intro: "Write a comment explaining the program, then use print() to display exactly: Hello, World!",
    variables: "Create one text variable and one whole-number variable, then print both values. Use clear names and match the worked example's expected result.",
    condition: "Create a score, test it with an if/else condition, and print the correct result for the score shown in the example.",
    loop: "Use a loop to produce each value in the worked example in order. Do not copy the output as a string; generate it with iteration.",
    function: "Write a reusable function with a parameter, return its result, and display the result as shown in the example.",
    collection: "Create a collection with the example values. Access its first item and report its length.",
    object: "Create a record with the example's named fields, then read one field and display its value.",
    class: "Define a class with one meaningful field, create an instance, and show the stored value.",
    recursion: "Write a recursive function with a base case. Trace the input down to that case and produce the same output as the example.",
    sort: "Sort the example values using the divide-and-merge approach and produce the ordered result.",
    array: "Create an array with the example values, access an item by index, and report the item count.",
    json: "Create the example data, serialize it to JSON, parse it back, and print the requested field.",
    regex: "Search the example text for the requested pattern and print the matched value.",
  };
  const challengeHintsByKind: Partial<Record<LessonKind, string[]>> = {
    intro: ["Start with a # comment line.", "Call print(...) on the next line.", "Put Hello, World! inside matching quotes."],
    variables: ["Use = to assign each value to a name.", "Keep the text in quotes; the age is a number.", "Print both variable names in one statement."],
    condition: ["Compare the score using >=.", "Indent the statements inside if and else.", "Print one result for each branch."],
    loop: ["Use range(1, 4) to produce 1, 2, and 3.", "Indent print(number) inside the loop.", "The stop value in range is excluded."],
    function: ["Define the function with def and a parameter.", "Return the greeting from the function.", "Call the function and print its returned value."],
    collection: ["Store the values in square brackets.", "The first list index is 0.", "Use len(...) to count the values."],
    recursion: ["Write the base case before the recursive call.", "Make each call move toward the base case.", "Return immediately when the base case is reached."],
    sort: ["Split the input into smaller halves.", "Merge by comparing the first item in each half.", "Preserve every item in the sorted result."],
  };
  const genericChallenge = `Build a ${languageName} example for “${title}” from the blank editor. Use the key terms above and reproduce the worked example's result.`;
  const challenge = courseSlug === "python-fundamentals" ? challengeByKind[kind] ?? genericChallenge : genericChallenge;
  return {
    kind,
    requiresCodeChallenge,
    visual: topicCopy.visual,
    articleSections,
    overview,
    keyPoints,
    exampleTitle: pythonIntro ? "Hello World Program" : `${title} Example`,
    exampleIntroduction: pythonIntro ? "The Hello World program demonstrates the basic structure of a Python program and shows how to display text." : `This small example demonstrates ${title.toLowerCase()} in ${languageName}. Read the code, predict its result, then compare your prediction with the output.`,
    quiz,
    definition: pythonIntro ? "Python is a high-level, general-purpose programming language with readable syntax. A Python interpreter executes Python code, and the language provides features for procedural, object-oriented, and functional programming." : topicCopy.definition,
    introduction: pythonInstallation ? "Choose an installation route for Windows, macOS, or Linux. Follow its steps, verify that Python 3 runs, and optionally set up an editor and isolated project environment." : pythonIntro ? "Learn where Python came from, what it is used for, and how its readable syntax works." : isWhyPython ? "Explore the qualities that make Python a useful choice for many kinds of software." : `Learn how ${title.toLowerCase()} works in ${languageName}, then trace the example to its result.`,
    explanation: pythonInstallation ? "An installer or package manager places the Python interpreter on your system. A terminal version check confirms it is available; a virtual environment then isolates packages for a project. Editors such as VS Code are installed separately." : pythonIntro ? "Python reads the source file and executes its instructions through the Python interpreter. In this first example, print() writes a string to the output. A comment beginning with # is ignored by the interpreter." : topicCopy.explanation,
    code,
    output,
    takeaways: pythonInstallation ? ["Choose one install route that matches your operating system.", "Verify the interpreter from a newly opened terminal.", "Use a virtual environment to isolate project packages.", "An editor and its Python extension are separate from the interpreter."] : pythonIntro ? ["print() displays text in the output.", "Put strings inside matching quotation marks.", "Python ignores comments that begin with #."] : takeaways[kind] ?? [`Understand what ${title.toLowerCase()} is used for.`, "Read the example carefully before changing it."],
    mistake: pythonInstallation ? "Installing an editor or its Python extension does not install the Python interpreter. Install Python separately, then select that interpreter in your editor." : pythonIntro ? "Python uses indentation to define code blocks. Inconsistent indentation inside a function or loop can cause an IndentationError." : kind === "loop" ? "Changing the wrong variable or forgetting to update it can make a loop repeat forever." :
      kind === "condition" ? "A comparison such as >= is different from assignment. Check the exact operator in the condition." :
      kind === "collection" ? "Using an index beyond the last item can cause an error. Remember that many languages begin indexing at zero." :
      kind === "update" ? "An UPDATE without a WHERE clause may change every row in the table." :
      kind === "file" ? "Forgetting to close a file can leave resources in use or data unwritten." :
      kind === "pointer" ? "Do not use a pointer before it refers to a valid object." :
      `Connect lesson ${index + 1} to the example and the ideas from earlier lessons.`,
    syntax: syntaxByKind[kind] ?? (code.split("\n").find((line) => line.trim() && !/^(#|\/\/|--|<!--)/.test(line.trim()))?.trim() ?? "Follow the example structure shown above."),
    realWorld: pythonInstallation ? "A working Python interpreter lets you run course examples, build scripts and applications, and install project libraries. Virtual environments help different projects use different package versions safely." : pythonIntro ? "Python is used to build web services, automate repetitive work, analyze data, create scientific software, and develop AI applications." : kind === "variables" ? "Variables let a program keep, update, and reuse information without repeating literal values. A learner name, score, or account balance can be read in many instructions and changed in one place." :
      kind === "condition" ? "Programs use decisions to validate forms, apply rules, and choose the next action." :
      kind === "loop" ? "Programs repeat loops to process records, files, and collections without copying the same instruction." :
      kind === "collection" || kind === "object" ? "Collections organize related information such as scores, products, or user profiles." :
      kind === "function" ? "Functions package steps that an application needs to reuse with different inputs." :
      `The ${title.toLowerCase()} concept appears in everyday ${languageName} programs to make code clearer and easier to maintain.`,
    bestPractice: pythonInstallation ? "Use the official installer or your operating system's trusted package manager. Keep the system-provided Python intact and create a virtual environment for each project." : pythonIntro ? "Use Python 3, choose descriptive names, and keep indentation consistent so the structure is clear." : takeaways[kind]?.[0] ?? "Use names and structure that make the purpose clear to another person reading your code.",
    practice: pythonInstallation ? "Follow the steps for your system, run its version command, then create and activate a .venv in a practice project folder." : pythonIntro ? "Change the text inside print(), predict what will appear, then run the code to check your prediction." : `Change one part of the ${title.toLowerCase()} example, predict the result, then compare your prediction with the displayed output.`,
    challenge,
    challengeStarter: starterForLanguage(courseSlug, title),
    challengeHints: courseSlug === "python-fundamentals"
      ? challengeHintsByKind[kind] ?? takeaways[kind] ?? ["Read the worked example above.", "Keep the keyword list beside you while writing.", "Check your output against the expected result."]
      : [`Use the ${languageName} syntax shown in the worked example.`, `Apply ${title.toLowerCase()} to the sample values rather than copying the displayed result as text.`, "Compare your result with the expected output before submitting."],
    keywords: pythonIntro ? ["high-level", "interpreter", "syntax", "indentation"] : keywordsByKind[kind] ?? [title.toLowerCase(), "syntax", "example"],
    steps: code.split("\n").filter((line) => line.trim()).map((line) => ({ code: line, explanation: explainCodeLine(line) })),
  };
}
