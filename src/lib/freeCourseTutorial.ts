import { getFreeCourseChallenge, getFreeCourseChallengePrompt } from "@/lib/freeCourseChallenges";
export type LessonKind =
  | "intro" | "setup" | "hello" | "structure" | "output" | "comments" | "variables" | "types"
  | "numbers" | "strings" | "operators" | "condition" | "loop" | "function" | "collection"
  | "object" | "class" | "input" | "module" | "file" | "error" | "dom" | "event" | "semantics"
  | "link" | "image" | "form" | "table" | "null"
  | "styles" | "selector" | "box" | "layout" | "responsive" | "database" | "query" | "filter"
  | "insert" | "update" | "aggregate" | "join" | "pointer" | "structure-data" | "practice" | "sort"
  | "json" | "regex" | "date" | "math" | "iterator" | "array" | "packages" | "recursion";

export type LessonQuizQuestion = {
  question: string;
  options: { id: string; text: string }[];
  answer: string;
  explanation: string;
};

export type TutorialLesson = {
  kind: LessonKind;
  requiresCodeChallenge: boolean;
  visual: { caption: string; nodes: { label: string; value: string; detail?: string }[]; summary: string };
  articleSections: { title: string; paragraphs: string[]; bullets?: string[]; code?: string; links?: { label: string; href: string; detail: string }[] }[];
  overview: string;
  keyPoints: { title: string; detail: string }[];
  exampleTitle: string;
  exampleIntroduction: string;
  quiz: LessonQuizQuestion[];
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
  challengeCode: string;
  challengeOutput: string;
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
  [/why\s+python|python use cases|python advantages|intro|what is/i, "intro"], [/install|setup|environment|jdk|accessing|get started/i, "setup"],
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
  const kind = getLessonKind(title);
  if (kind !== "intro") return kind;
  // New and advanced topic names should still receive the normal lesson challenge.
  // Keep navigational/reference pages informational, as in the Python curriculum.
  if (/\b(home|tutorial|reference|quick ref|summary|syllabus|study plan|certificate|overview|interview prep)\b/i.test(normalized)) return "intro";
  if (/\b(intro|introduction|what is|why|getting started|install|installation|setup|environment|use cases|advantages|history)\b/i.test(normalized)) return "intro";
  if (/\b(quiz|exercises?|examples?|challenges?|projects?|compiler|editor|server|training)\b/i.test(normalized)) return "practice";
  return "practice";
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
    hello: { code: 'CREATE TABLE lesson_students (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  score INTEGER\n);', output: "A lesson_students table with id, name, and score columns." },
    database: { code: 'SELECT name, score\nFROM students;', output: "Returns the name and score columns for every student." },
    query: { code: 'SELECT name, score\nFROM students\nORDER BY score DESC;', output: "Returns students ordered from highest score to lowest." },
    filter: { code: 'SELECT name, score\nFROM students\nWHERE score >= 80;', output: "Only students scoring 80 or higher." },
    null: { code: 'SELECT name\nFROM students\nWHERE score IS NULL;', output: "Returns students whose score has no stored value." },
    insert: { code: 'INSERT INTO students (name, score)\nVALUES (\'MyLoginn\', 95);', output: "Adds MyLoginn with a score of 95." },
    update: { code: 'UPDATE students\nSET score = 98\nWHERE name = \'Asha Patel\';', output: "Changes Asha Patel's score to 98." },
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
  "php-fundamentals": {
    hello: { code: '<?php\necho "Hello, PHP!";', output: "Hello, PHP!" },
    variables: { code: '<?php\n$name = "MyLoginn";\n$score = 95;\necho "$name scored $score";', output: "MyLoginn scored 95" },
    types: { code: '<?php\n$age = 16;\n$price = 12.5;\n$ready = true;\nvar_dump($age, $price, $ready);', output: "int(16), float(12.5), bool(true)" },
    strings: { code: '<?php\n$name = "MyLoginn";\necho strtoupper($name);', output: "MYLOGINN" },
    condition: { code: '<?php\n$score = 82;\nif ($score >= 50) {\n  echo "Pass";\n} else {\n  echo "Try again";\n}', output: "Pass" },
    loop: { code: '<?php\nfor ($number = 1; $number <= 3; $number++) {\n  echo $number . PHP_EOL;\n}', output: "1\n2\n3" },
    function: { code: '<?php\nfunction greet(string $name): string {\n  return "Hello, $name!";\n}\necho greet("MyLoginn");', output: "Hello, MyLoginn!" },
    collection: { code: '<?php\n$scores = [80, 95, 88];\necho $scores[0] . PHP_EOL;\necho count($scores);', output: "80\n3" },
    object: { code: '<?php\n$student = ["name" => "MyLoginn", "score" => 95];\necho $student["name"];', output: "MyLoginn" },
    class: { code: '<?php\nclass Student {\n  public function __construct(public string $name) {}\n}\n$student = new Student("MyLoginn");\necho $student->name;', output: "MyLoginn" },
    query: { code: '$statement = $pdo->prepare("SELECT name FROM students WHERE id = :id");\n$statement->execute(["id" => $studentId]);', output: "A parameterized query reads one student without joining user input into SQL." },
  },
  "react-fundamentals": {
    hello: { code: 'function Welcome() {\n  return <h1>Hello, React!</h1>;\n}', output: "React renders a heading that says Hello, React!" },
    setup: { code: 'npm create vite@latest my-react-app -- --template react\ncd my-react-app\nnpm install\nnpm run dev', output: "Vite creates a React app, installs its packages, and starts the local development server." },
    function: { code: 'function Greeting({ name }) {\n  return <p>Hello, {name}!</p>;\n}\n\n<Greeting name="MyLoginn" />', output: "Hello, MyLoginn!" },
    condition: { code: 'function Status({ online }) {\n  return <p>{online ? "Online" : "Offline"}</p>;\n}', output: "The component displays Online when online is true, otherwise Offline." },
    collection: { code: 'const courses = ["HTML", "CSS", "React"];\nconst items = courses.map((course) => <li key={course}>{course}</li>);', output: "Three list items are created, each with a stable key." },
    event: { code: 'function SaveButton() {\n  function handleClick() { alert("Saved"); }\n  return <button onClick={handleClick}>Save</button>;\n}', output: "Clicking Save calls the event handler." },
    form: { code: 'function NameForm() {\n  const [name, setName] = useState("");\n  return <input value={name} onChange={(event) => setName(event.target.value)} />;\n}', output: "The input value stays in sync with React state." },
    object: { code: 'function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}', output: "The button displays the current count and increments it when clicked." },
  },
  "mysql-fundamentals": {
    hello: { code: "SELECT 'Hello, MySQL!' AS message;", output: "Hello, MySQL!" },
    database: { code: "CREATE TABLE lesson_students (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL,\n  score INT\n);", output: "A lesson_students table with an auto-incrementing key, a required name, and a score." },
    query: { code: "SELECT name, score\nFROM students\nORDER BY score DESC\nLIMIT 5;", output: "Returns up to five students, highest score first." },
    filter: { code: "SELECT name, score\nFROM students\nWHERE score >= 80 AND name IS NOT NULL;", output: "Returns named students with a score of at least 80." },
    null: { code: "SELECT name\nFROM students\nWHERE score IS NULL;", output: "Returns students whose score has no stored value." },
    insert: { code: "INSERT INTO students (name, score)\nVALUES ('MyLoginn', 95);", output: "Adds MyLoginn with a score of 95." },
    update: { code: "UPDATE students\nSET score = 98\nWHERE name = 'Asha Patel';", output: "Changes the selected student's score to 98." },
    aggregate: { code: "SELECT COUNT(*) AS student_count, AVG(score) AS average_score\nFROM students;", output: "Returns the row count and average score." },
    join: { code: "SELECT students.name, courses.title\nFROM students\nJOIN enrollments ON enrollments.student_id = students.id\nJOIN courses ON courses.id = enrollments.course_id;", output: "Combines student names with the courses they enrolled in." },
  },
};

const setupSamples: Record<string, { code: string; output: string }> = {
  "java-fundamentals": { code: "java --version\njavac --version\n\njavac Main.java\njava Main", output: "The version checks confirm the runtime and compiler. javac compiles Main.java; java runs the compiled Main class." },
  "javascript-fundamentals": { code: "node --version\nnpm --version\n\nnode app.js", output: "The version checks confirm Node.js and npm. Node runs the app.js script." },
  "html-fundamentals": { code: "my-page/\n  index.html", output: "Save index.html, then open the file in a browser. No compiler is required." },
  "css-fundamentals": { code: "my-page/\n  index.html\n  styles.css", output: "Link styles.css from index.html, then refresh the browser to see style changes." },
  "sql-fundamentals": { code: "SELECT 'SQL practice database ready' AS status;", output: "The practice database is ready." },
  "c-fundamentals": { code: "gcc --version\n\ngcc main.c -o main\n./main", output: "The compiler builds main.c into an executable named main, which you can run from the terminal." },
  "cpp-fundamentals": { code: "g++ --version\n\ng++ main.cpp -o main\n./main", output: "The compiler builds main.cpp into an executable named main, which you can run from the terminal." },
  "php-fundamentals": { code: "php --version\n\nphp index.php", output: "The version check confirms PHP CLI is available; the php command runs index.php." },
  "react-fundamentals": { code: "npm create vite@latest my-react-app -- --template react\ncd my-react-app\nnpm install\nnpm run dev", output: "Vite creates and runs a local React development project." },
  "mysql-fundamentals": { code: "SELECT 'MySQL practice database ready' AS status;", output: "The practice database is ready." },
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

type TopicSpecificLesson = {
  definition: string;
  overview: string;
  explanation: string;
  code: string;
  output: string;
  exampleTitle: string;
  takeaways: string[];
  challenge: string;
};

// HTML lessons need distinct, runnable markup instead of falling back to the
// same generic "intro" sample for every unclassified title.
const htmlTopicLessons: Record<string, TopicSpecificLesson> = {
  "html-home": {
    definition: "HTML is the markup language browsers use to organize the content and structure of a web page.",
    overview: "A browser reads HTML elements and builds a document tree. That tree gives text, links, images, forms, and page regions their meaning.",
    explanation: "An HTML page is a hierarchy of elements. Start with a doctype, set the document language, place page metadata in head, and put visible content in body. CSS controls presentation and JavaScript adds behavior, while HTML describes the content itself.",
    code: '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Course Notes</title>\n  </head>\n  <body>\n    <main>\n      <h1>Course Notes</h1>\n      <p>Start with meaningful page structure.</p>\n    </main>\n  </body>\n</html>',
    output: "A browser displays a page titled Course Notes with a main heading and paragraph.",
    exampleTitle: "A complete first HTML page",
    takeaways: ["HTML describes document structure and meaning.", "The head stores metadata; the body contains page content.", "Use one clear main heading and meaningful elements."],
    challenge: "Create a complete HTML page with a language, character encoding, page title, main region, heading, and paragraph.",
  },
  "html-introduction": {
    definition: "HTML (HyperText Markup Language) uses elements and attributes to describe the structure and meaning of web content.",
    overview: "Browsers parse HTML into a document tree, then use that structure to display content and expose it to assistive technologies.",
    explanation: "Most HTML elements use an opening tag, content, and a closing tag. Tags nest to show which content belongs together. Some elements, such as img and input, are void elements and do not wrap content.",
    code: '<article>\n  <h1>Learning HTML</h1>\n  <p>Elements give content structure.</p>\n  <a href="/courses">Browse courses</a>\n</article>',
    output: "A semantic article containing a heading, paragraph, and working link.",
    exampleTitle: "HTML elements describe content",
    takeaways: ["HTML is markup, not a programming language.", "Elements describe content roles.", "Nesting expresses document relationships."],
    challenge: "Write an article containing a heading, a paragraph, and a link to /courses.",
  },
  "html-basic": {
    definition: "Basic HTML is the minimum document scaffold that lets a browser identify and render a web page reliably.",
    overview: "A valid starter page contains a doctype, an html root, a head for metadata, and a body for visible content.",
    explanation: "The doctype selects standards mode. The lang attribute declares the page language. UTF-8 metadata covers common characters, title names the browser tab, and body holds the page's content. Keep document metadata out of the visible body.",
    code: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>',
    output: "The browser renders a Welcome heading and paragraph, and names the tab My First Page.",
    exampleTitle: "The HTML document skeleton",
    takeaways: ["Start with <!doctype html>.", "Keep title and metadata in head.", "Put user-facing content in body."],
    challenge: "Build the full HTML document skeleton and change its title and body content to describe your own learning page.",
  },
  "html-elements": {
    definition: "An HTML element is a node in a document, commonly written as an opening tag, content, and a matching closing tag.",
    overview: "Elements label headings, paragraphs, links, lists, sections, and other content so browsers can render and interpret it.",
    explanation: "The tag name identifies the element. Nest child elements inside their parent and close tags in reverse order. Void elements such as img and br have no closing tag; do not add a slash-dependent closing tag to them.",
    code: '<section>\n  <h2>Upcoming lessons</h2>\n  <p>Practice each concept as you go.</p>\n</section>',
    output: "A section containing a level-two heading and a paragraph.",
    exampleTitle: "Nest elements in document order",
    takeaways: ["Tags identify an element's role.", "Nest related content under a meaningful parent.", "Close non-void elements in the reverse order they opened."],
    challenge: "Create a section with a level-two heading and a paragraph nested inside it.",
  },
  "html-attributes": {
    definition: "An HTML attribute provides extra information or configuration for an element and is written in its opening tag.",
    overview: "Attributes connect elements to resources, set identifiers, add descriptive text, and configure native browser controls.",
    explanation: "Write an attribute as a name and value, usually in quotes. Global attributes such as id and class work on many elements; other attributes are element-specific, such as href on a and alt on img. Use an attribute only where its meaning applies.",
    code: '<a href="/courses/html-fundamentals" class="course-link" aria-label="Open the HTML course">HTML course</a>',
    output: "A link to the HTML course with a reusable class and an accessible name.",
    exampleTitle: "Configure a link with attributes",
    takeaways: ["Place attributes in the opening tag.", "Quote attribute values.", "Choose attributes that match the element's purpose."],
    challenge: "Create a link with an href, a class named course-link, and descriptive link text.",
  },
  "html-headings": {
    definition: "HTML headings h1 through h6 label sections in a page, with h1 as the highest and h6 as the lowest level.",
    overview: "A logical heading outline helps readers scan a page and helps assistive technology navigate its sections.",
    explanation: "Choose heading levels by document structure, not by the visual size you want. Start the page's main content with an h1, use h2 for major sections, and h3 for subsections within an h2. CSS can change appearance without changing the outline.",
    code: '<main>\n  <h1>HTML Course</h1>\n  <section>\n    <h2>Forms</h2>\n    <h3>Labels and inputs</h3>\n  </section>\n</main>',
    output: "A page outline with HTML Course as the main heading, Forms as a section, and Labels and inputs as its subsection.",
    exampleTitle: "Create a meaningful heading outline",
    takeaways: ["Use h1 to h6 to express nesting levels.", "Do not skip levels just to change font size.", "Use CSS to style headings."],
    challenge: "Write a page with an h1, a section h2, and a nested h3 in the correct order.",
  },
  "html-paragraphs": {
    definition: "The p element marks a paragraph of text as a distinct block of prose.",
    overview: "Paragraph elements let browsers and assistive technologies identify and navigate blocks of related text.",
    explanation: "Use a separate p for each paragraph. Browsers add default spacing around paragraphs, but that spacing is presentation and can be changed with CSS. Do not use repeated br elements to create paragraph spacing.",
    code: '<p>HTML gives this text a paragraph boundary.</p>\n<p>A second idea belongs in a separate paragraph.</p>',
    output: "Two separate paragraphs, each displayed as its own block.",
    exampleTitle: "Separate ideas into paragraphs",
    takeaways: ["Use p for prose paragraphs.", "Use headings to name sections.", "Use CSS for paragraph spacing."],
    challenge: "Write two separate paragraphs about a topic you are learning; do not use br tags as layout spacing.",
  },
  "html-links": {
    definition: "The a element creates a hyperlink; its href attribute specifies the destination.",
    overview: "Links connect pages and resources and should use text that tells people where the link goes.",
    explanation: "Use a relative URL for a page in the same site and an absolute URL for another site. Link text becomes the link's accessible name, so avoid vague labels such as 'click here' when the destination can be named.",
    code: '<nav aria-label="Course navigation">\n  <a href="/courses">All courses</a>\n  <a href="/courses/html-fundamentals">HTML course</a>\n</nav>',
    output: "A navigation region with links to the course catalogue and HTML course.",
    exampleTitle: "Link to pages with descriptive text",
    takeaways: ["href holds the destination URL.", "Use descriptive link text.", "Use relative paths for local pages when appropriate."],
    challenge: "Create a navigation region with two links and labels that clearly name their destinations.",
  },
  "html-images": {
    definition: "The img element embeds an image resource; src selects the file and alt provides its text alternative.",
    overview: "Alternative text communicates the image's purpose when it cannot be seen or loaded.",
    explanation: "Write concise alt text for informative images. Give decorative images an empty alt value so assistive technology can skip them. Include intrinsic width and height when known to reserve layout space, and use responsive CSS to fit the image to its container.",
    code: '<img src="images/course-map.png" alt="A map showing the five modules in the course" width="640" height="360">',
    output: "The browser displays the course map and exposes its description as alternative text.",
    exampleTitle: "Add an image with useful alternative text",
    takeaways: ["src identifies the image resource.", "Describe informative images with alt text.", "Use empty alt text for purely decorative images."],
    challenge: "Add an informative course image with an accurate alt description and intrinsic dimensions.",
  },
  "html-lists": {
    definition: "HTML lists group related items; ul is unordered, ol is ordered, and li marks each item.",
    overview: "Use list elements when the items form a meaningful sequence or collection, rather than styling unrelated text to look like bullets.",
    explanation: "Choose ol when order or numbering matters and ul when it does not. Place li elements directly inside the list. Lists can contain nested lists when a child item has its own sub-items.",
    code: '<ol>\n  <li>Read the lesson</li>\n  <li>Try the example</li>\n  <li>Complete the challenge</li>\n</ol>',
    output: "A numbered three-step learning sequence.",
    exampleTitle: "Choose the right list type",
    takeaways: ["Use ol when sequence matters.", "Use ul for an unordered group.", "Put each item in an li element."],
    challenge: "Write an ordered three-step process using ol and li elements.",
  },
  "html-tables": {
    definition: "An HTML table represents data with rows and columns using table, tr, th, and td elements.",
    overview: "Tables are for relationships between row and column data, not for positioning page layout.",
    explanation: "Use th for header cells and td for data cells. A caption summarizes the table. Use scope on simple row or column headers so assistive technology can associate each value with its heading.",
    code: '<table>\n  <caption>Course progress</caption>\n  <thead><tr><th scope="col">Topic</th><th scope="col">Status</th></tr></thead>\n  <tbody><tr><td>HTML Basics</td><td>Complete</td></tr></tbody>\n</table>',
    output: "A data table with labeled Topic and Status columns and one course-progress row.",
    exampleTitle: "Mark up a small data table",
    takeaways: ["Use tables for tabular data, not layout.", "Use th for header cells and td for values.", "Caption and scope clarify table relationships."],
    challenge: "Create a table with a caption, two column headers, and one data row about a course.",
  },
  "html-forms": {
    definition: "The form element groups controls that collect user values for submission or processing.",
    overview: "An accessible form gives each control a label, an appropriate input type, and a clear submit action.",
    explanation: "The action attribute names the endpoint and method describes how data is sent. Each control needs a name to be included in submitted form data. Associate label and input using matching for and id values.",
    code: '<form action="/subscribe" method="post">\n  <label for="email">Email address</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Subscribe</button>\n</form>',
    output: "A labeled required email field that submits using POST to /subscribe.",
    exampleTitle: "Build a labeled form",
    takeaways: ["Associate every control with a label.", "Give submitted controls a name.", "Use the input type that matches the expected data."],
    challenge: "Build a POST form with a required name field, a required email field, and a submit button; connect both labels to their controls.",
  },
  "html-semantics": {
    definition: "Semantic HTML elements describe the role of page content, such as navigation, main content, articles, and footers.",
    overview: "Landmarks and meaningful elements give browsers, search tools, and assistive technology a useful document structure.",
    explanation: "Prefer an element whose meaning matches the content. Use header, nav, main, article, section, and footer where appropriate. A div is a generic container and is useful when no semantic element fits; it does not create meaning by itself.",
    code: '<header><a href="/">MyLoginn</a></header>\n<nav aria-label="Main"><a href="/courses">Courses</a></nav>\n<main><article><h1>HTML Semantics</h1><p>Structure communicates meaning.</p></article></main>\n<footer>Course materials</footer>',
    output: "A page divided into header, navigation, main article, and footer landmarks.",
    exampleTitle: "Use semantic page landmarks",
    takeaways: ["Choose elements by content role.", "Keep one primary main landmark on a page.", "Use div only when a generic container is appropriate."],
    challenge: "Structure a page with header, nav, main, article, and footer elements and give the article a heading.",
  },
  "html-accessibility": {
    definition: "HTML accessibility means using native elements and labels so people can perceive, understand, and operate page content with different abilities and tools.",
    overview: "Semantic elements, keyboard-operable controls, clear labels, and text alternatives provide accessible foundations before extra scripting is added.",
    explanation: "Prefer native HTML controls because browsers already provide keyboard interaction and accessibility semantics. Label form controls, provide text alternatives for meaningful images, preserve heading order, and ensure link purpose is clear from its text.",
    code: '<label for="search">Search courses</label>\n<input id="search" name="q" type="search">\n<button type="submit">Search</button>\n<img src="course.png" alt="Course overview diagram">',
    output: "A labeled search control, a native button, and an image with a text alternative.",
    exampleTitle: "Build accessible native controls",
    takeaways: ["Prefer native HTML controls.", "Provide labels and meaningful text alternatives.", "Check the page using only a keyboard."],
    challenge: "Create a labeled search field and a meaningful image with alternative text; verify every control can be reached by keyboard.",
  },
};

function getTopicSpecificLesson(courseSlug: string, title: string): TopicSpecificLesson | undefined {
  if (courseSlug !== "html-fundamentals") return undefined;
  const slug = toTopicSlug(title);
  const direct = htmlTopicLessons[slug];
  if (direct) return direct;
  if (/html-(?:classes|ids?|div|block-inline)$/.test(slug)) return {
    definition: "The class and id attributes identify HTML elements so CSS and scripts can target them; div is a generic block container.",
    overview: "Use class for reusable groups and id for one unique element. Choose a semantic element instead of div when the content has a meaningful role.",
    explanation: "An element may have several space-separated class names but only one id value, and an id should be unique in the document. These attributes do not change meaning by themselves. Block and inline describe common layout behavior; CSS can change display without changing semantic role.",
    code: '<main id="course-content" class="page">\n  <section class="lesson-card featured">\n    <h2 class="lesson-title">HTML Basics</h2>\n    <span class="lesson-status">New</span>\n  </section>\n</main>',
    output: "A main region with one unique id and reusable classes on the section, heading, and inline status.",
    exampleTitle: "Target elements with class and id",
    takeaways: ["Use classes for reusable styling and grouping.", "Keep each id unique within the page.", "Use div only when no semantic element fits."],
    challenge: "Create a section with a reusable class and a unique id, then place a heading and inline status inside it.",
  };
  if (/html-(?:styles|colors|css)$/.test(slug)) return {
    definition: "CSS rules control visual presentation; HTML can connect a page to an external stylesheet or contain a small style block.",
    overview: "Keeping most styling in CSS separates the page's meaning from its visual design and makes styles reusable.",
    explanation: "Use a link element in head to load a stylesheet. Select elements with classes and define declarations inside a rule. Prefer external CSS for site-wide or multi-rule styling; reserve inline style for cases that genuinely need a one-off value.",
    code: '<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1 class="page-title">Learning HTML</h1>\n</body>\n\n/* styles.css */\n.page-title { color: #4338ca; }',
    output: "The browser loads styles.css and displays the page heading in indigo.",
    exampleTitle: "Connect HTML to a stylesheet",
    takeaways: ["HTML structures content; CSS presents it.", "Link an external stylesheet from head.", "Use reusable classes for repeated visual rules."],
    challenge: "Link styles.css from an HTML document and style a heading through the page-title class.",
  };
  if (/html-(?:comments|quotations|formatting)$/.test(slug)) return {
    definition: "HTML text elements and comments mark how text is structured or quoted; they do not replace CSS visual styling.",
    overview: "Use semantic text markup for emphasis and quotations, and HTML comments only for source notes that readers do not need on the rendered page.",
    explanation: "Use strong and em when content deserves importance or emphasis, q for a short inline quotation, and blockquote for a longer quotation from another source. A comment begins with <!-- and ends with --> and is not shown as page content.",
    code: '<p><strong>Important:</strong> submit work by Friday.</p>\n<p>The guide says, <q>practice one concept at a time</q>.</p>\n<blockquote cite="https://example.com/guide">\n  <p>Clear structure helps readers navigate.</p>\n</blockquote>\n<!-- Review the quotation source before publishing. -->',
    output: "Important text, an inline quotation, a cited block quotation, and a source-only comment.",
    exampleTitle: "Mark up emphasis and quotations",
    takeaways: ["Choose text elements by meaning.", "Use blockquote for an extended quotation.", "HTML comments are source notes, not hidden content or security controls."],
    challenge: "Mark one important phrase with strong, add an inline quotation, and leave a source comment that does not appear in the page.",
  };
  if (/html-(?:page-title|head|favicon|file-paths|doctype)$/.test(slug)) return {
    definition: "The document head stores page metadata and resource links, while the title element names the page in browser and history interfaces.",
    overview: "Correct metadata helps browsers decode, identify, scale, and connect the document to its resources.",
    explanation: "Use a doctype at the top, set lang on html, declare UTF-8, set a descriptive title, and add the viewport metadata for mobile layouts. A favicon link points to the site's small identifying image. Relative file paths resolve from the current document location.",
    code: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>HTML Study Notes</title>\n  <link rel="icon" href="images/favicon.png">\n</head>\n<body><h1>Study Notes</h1></body>\n</html>',
    output: "A standards-mode page with English language metadata, UTF-8 encoding, a mobile viewport, a browser-tab title, and a favicon.",
    exampleTitle: "Set useful document metadata",
    takeaways: ["Put metadata and resource links in head.", "Write a clear title and declare the page language.", "Resolve relative file paths from the document's location."],
    challenge: "Create a document head with doctype, lang, encoding, viewport, descriptive title, and a relative favicon path.",
  };
  if (/html-(?:buttons|forms)$/.test(slug)) return htmlTopicLessons["html-forms"];
  if (/html-javascript$/.test(slug)) return {
    definition: "The script element connects JavaScript to an HTML page so the program can respond to events and update the interface.",
    overview: "JavaScript adds behavior to a document; defer or module scripts can run after parsing without blocking the initial HTML parse.",
    explanation: "Use an external script file for reusable code and debugging. A deferred classic script runs after the document is parsed; module scripts use module scope and are deferred by default. Select elements after they exist and keep behavior separate from markup where possible.",
    code: '<button id="show-message" type="button">Show message</button>\n<p id="message" aria-live="polite"></p>\n<script src="app.js" defer></script>\n\n// app.js\ndocument.querySelector("#show-message").addEventListener("click", () => {\n  document.querySelector("#message").textContent = "Hello from JavaScript";\n});',
    output: "Clicking the button writes Hello from JavaScript into the live message region.",
    exampleTitle: "Connect an HTML page to JavaScript",
    takeaways: ["Use script src to load an external file.", "Use defer or modules to avoid blocking HTML parsing.", "Update text safely with textContent."],
    challenge: "Add a button and live message region, then load a deferred script that updates the message after a click.",
  };
  if (/html-(?:form|input)/.test(slug)) return htmlTopicLessons["html-forms"];
  if (/html-(?:video|audio|media|youtube|plug-ins)/.test(slug)) return {
    definition: "HTML media elements embed audio and video resources using browser-native playback controls.",
    overview: "The video and audio elements let a page offer media without requiring a third-party plug-in.",
    explanation: "Provide source files in formats supported by target browsers, include controls, and add fallback text. Captions make spoken content available to people who cannot hear the audio; do not autoplay sound unexpectedly.",
    code: '<video controls width="640" poster="lesson-preview.jpg">\n  <source src="lesson.mp4" type="video/mp4">\n  <track kind="captions" src="lesson-en.vtt" srclang="en" label="English">\n  Your browser does not support this video.\n</video>',
    output: "A video player with native controls, a preview image, English captions, and fallback text.",
    exampleTitle: "Embed video with captions",
    takeaways: ["Use controls so people can operate playback.", "Provide captions for video speech and meaningful audio.", "Include fallback content."],
    challenge: "Embed a short course video with controls, a captions track, and fallback text.",
  };
  if (/html-(?:canvas|svg|graphics)/.test(slug)) return {
    definition: "Canvas and SVG are browser graphics technologies: canvas draws pixels with a script, while SVG describes scalable shapes as markup.",
    overview: "Choose SVG for resolution-independent diagrams and icons, and canvas for frequently updated pixel graphics such as simulations.",
    explanation: "SVG elements form a scalable vector image in the document. Canvas exposes a drawing surface whose pixels are painted with JavaScript; provide fallback content inside canvas and an accessible name for meaningful graphics.",
    code: '<svg viewBox="0 0 120 60" role="img" aria-labelledby="chart-title">\n  <title id="chart-title">Three lessons completed</title>\n  <rect x="10" y="10" width="100" height="40" rx="8" fill="#6c4dff" />\n  <text x="60" y="36" text-anchor="middle" fill="white">3 complete</text>\n</svg>',
    output: "A scalable purple status card labeled 3 complete.",
    exampleTitle: "Create an accessible SVG graphic",
    takeaways: ["SVG shapes scale without pixelation.", "Canvas is a script-controlled bitmap surface.", "Give informative graphics an accessible name or equivalent text."],
    challenge: "Draw an SVG progress badge with a title element and text that communicates its progress value.",
  };
  if (/html-(?:responsive|layout)/.test(slug)) return {
    definition: "Responsive HTML is content structured so CSS can adapt it to different viewport sizes and input devices.",
    overview: "HTML supplies the content and viewport metadata; responsive behavior is primarily implemented with CSS layout and media queries.",
    explanation: "Set the viewport width to the device width so CSS pixels map as expected. Use flexible layout rules and images that can shrink within their containers instead of fixed page widths. Test at narrow and wide viewport sizes.",
    code: '<meta name="viewport" content="width=device-width, initial-scale=1">\n<main class="page">\n  <h1>Learning paths</h1>\n  <ul class="course-grid"><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>\n</main>',
    output: "A page structure ready for CSS Grid or Flexbox to reflow at narrow widths.",
    exampleTitle: "Prepare page structure for responsive CSS",
    takeaways: ["Set the viewport metadata.", "Let CSS reflow content instead of fixing page width.", "Test at multiple viewport sizes."],
    challenge: "Add viewport metadata and mark up a course list that can become a responsive grid with CSS.",
  };
  if (/html-(?:entities|symbols|emojis|charsets|url-encode)/.test(slug)) return {
    definition: "HTML character references represent characters that have special meaning in markup or are awkward to type directly.",
    overview: "Character encoding and references help browsers decode text and distinguish content from HTML syntax.",
    explanation: "Declare UTF-8 in the document head. Write reserved characters such as < as references like &amp;lt; when displaying them as text. URL encoding is different: it percent-encodes bytes in URL components and should be handled by URL APIs rather than hand-built replacements.",
    code: '<meta charset="utf-8">\n<p>Use &lt; to display &amp;lt; as text.</p>\n<p>Copyright &amp;copy; MyLoginn</p>',
    output: "The page displays the literal less-than sign and a copyright symbol.",
    exampleTitle: "Display reserved and named characters",
    takeaways: ["Declare UTF-8 near the start of head.", "Escape reserved markup characters in text.", "URL encoding and HTML character references solve different problems."],
    challenge: "Write a paragraph that displays <section> as text and includes a copyright symbol using character references.",
  };
  return undefined;
}

type LessonExample = { code: string; output: string };

// Topic-specific examples keep different lessons in a course from collapsing
// to one sample merely because they share a broad kind such as "loop" or "class".
const topicExamples: Record<string, [RegExp, LessonExample][]> = {
  "java-fundamentals": [
    [/casting|type conversion/, { code: "double price = 19.95;\nint wholeDollars = (int) price;\nSystem.out.println(wholeDollars);", output: "19 (the fractional part is discarded by this narrowing cast)" }],
    [/break|continue/, { code: "for (int number = 1; number <= 5; number++) {\n  if (number == 2) continue;\n  if (number == 5) break;\n  System.out.println(number);\n}", output: "1\n3\n4" }],
    [/arraylist|linkedlist|\blist\b|collections/, { code: "List<String> topics = new ArrayList<>(List.of(\"HTML\", \"Java\", \"CSS\"));\ntopics.sort(String::compareTo);\nSystem.out.println(topics);", output: "[CSS, HTML, Java]" }],
    [/hashset|treeset|linkedhashset|\bset\b/, { code: "Set<String> tags = new LinkedHashSet<>();\ntags.add(\"beginner\");\ntags.add(\"java\");\ntags.add(\"beginner\");\nSystem.out.println(tags);", output: "[beginner, java] (the duplicate is ignored)" }],
    [/hashmap|treemap|linkedhashmap|\bmap\b/, { code: "Map<String, Integer> scores = new HashMap<>();\nscores.put(\"Asha\", 92);\nscores.put(\"Ravi\", 85);\nSystem.out.println(scores.get(\"Asha\"));", output: "92" }],
    [/iterator/, { code: "List<String> names = List.of(\"Asha\", \"Ravi\");\nIterator<String> iterator = names.iterator();\nwhile (iterator.hasNext()) {\n  System.out.println(iterator.next());\n}", output: "Asha\nRavi" }],
    [/method overloading/, { code: "static int add(int left, int right) { return left + right; }\nstatic double add(double left, double right) { return left + right; }\nSystem.out.println(add(2, 3));\nSystem.out.println(add(2.5, 3.0));", output: "5\n5.5" }],
    [/method parameters|parameters/, { code: "static double total(double price, int quantity) {\n  return price * quantity;\n}\nSystem.out.println(total(12.5, 3));", output: "37.5" }],
    [/recursion/, { code: "static int factorial(int number) {\n  if (number <= 1) return 1;\n  return number * factorial(number - 1);\n}\nSystem.out.println(factorial(5));", output: "120" }],
    [/inheritance|super keyword|polymorphism/, { code: "class Animal { String sound() { return \"sound\"; } }\nclass Dog extends Animal { @Override String sound() { return \"bark\"; } }\nAnimal pet = new Dog();\nSystem.out.println(pet.sound());", output: "bark" }],
    [/interface|abstraction/, { code: "interface Payable { double total(); }\nclass Invoice implements Payable {\n  public double total() { return 125.0; }\n}\nPayable invoice = new Invoice();\nSystem.out.println(invoice.total());", output: "125.0" }],
    [/exception|try-with-resources|errors/, { code: "try {\n  int seats = Integer.parseInt(\"many\");\n  System.out.println(seats);\n} catch (NumberFormatException error) {\n  System.out.println(\"Enter a whole number\");\n}", output: "Enter a whole number" }],
    [/fileinputstream|fileoutputstream|bufferedreader|bufferedwriter|java files|read files|write files/, { code: "try (BufferedWriter writer = Files.newBufferedWriter(Path.of(\"notes.txt\"))) {\n  writer.write(\"Study Java\");\n}", output: "Writes Study Java to notes.txt and closes the writer automatically." }],
    [/generics|wrapper classes/, { code: "List<Integer> scores = new ArrayList<>();\nscores.add(95);\nint firstScore = scores.get(0);\nSystem.out.println(firstScore);", output: "95 (the generic type keeps the list values as Integer values)" }],
    [/lambda|streams/, { code: "List<Integer> scores = List.of(65, 92, 78);\nlong passes = scores.stream().filter(score -> score >= 70).count();\nSystem.out.println(passes);", output: "2" }],
    [/date/, { code: "LocalDate dueDate = LocalDate.of(2026, 10, 4);\nSystem.out.println(dueDate.plusDays(7));", output: "2026-10-11" }],
    [/enum/, { code: "enum Level { BEGINNER, INTERMEDIATE, ADVANCED }\nLevel courseLevel = Level.BEGINNER;\nSystem.out.println(courseLevel);", output: "BEGINNER" }],
    [/annotations?/, { code: "@Override\npublic String toString() {\n  return \"Course: \" + title;\n}", output: "The annotation asks the compiler to check that this method overrides a parent method." }],
    [/threads?/, { code: "Thread worker = new Thread(() -> System.out.println(\"Background task\"));\nworker.start();\nworker.join();", output: "The worker thread runs its task; join waits for it to finish." }],
    [/optional/, { code: "Optional<String> title = Optional.ofNullable(\"Java\");\nSystem.out.println(title.orElse(\"Untitled\"));", output: "Java (or Untitled when the value is absent)" }],
    [/record/, { code: "record Course(String title, int lessons) {}\nCourse course = new Course(\"Java\", 12);\nSystem.out.println(course.title() + \": \" + course.lessons());", output: "Java: 12" }],
    [/http client|networking/, { code: "HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder(URI.create(\"https://example.com\")).GET().build();\nSystem.out.println(request.method());", output: "GET" }],
    [/jdbc|database transaction/, { code: "connection.setAutoCommit(false);\ntry {\n  statement.executeUpdate(\"UPDATE accounts SET balance = balance - 10 WHERE id = 1\");\n  connection.commit();\n} catch (SQLException error) {\n  connection.rollback();\n}", output: "Commits the update on success and rolls it back if a database error occurs." }],
    [/maven/, { code: "<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>learn.example</groupId>\n  <artifactId>java-course</artifactId>\n  <version>1.0.0</version>\n</project>", output: "Maven identifies the project and its artifact coordinates from pom.xml." }],
    [/unit testing/, { code: "@Test\nvoid addsTwoNumbers() {\n  assertEquals(5, Calculator.add(2, 3));\n}", output: "The test passes when Calculator.add(2, 3) returns 5." }],
    [/executorservice|synchronization/, { code: "try (ExecutorService pool = Executors.newSingleThreadExecutor()) {\n  Future<Integer> result = pool.submit(() -> 6 * 7);\n  System.out.println(result.get());\n}", output: "42 (the executor runs the task and is shut down when the resource scope ends)" }],
  ],
  "javascript-fundamentals": [
    [/timers?/, { code: "const timerId = setTimeout(() => {\n  console.log(\"Reminder\");\n}, 1000);\nclearTimeout(timerId);", output: "The timeout is cancelled before the callback runs." }],
    [/arrays?/, { code: "const scores = [72, 91, 84];\nconst passing = scores.filter((score) => score >= 80);\nconsole.log(passing);", output: "[91, 84]" }],
    [/sets?/, { code: "const visitedPages = new Set([\"home\", \"courses\", \"home\"]);\nconsole.log(visitedPages.size);", output: "2 (Set stores each value once)" }],
    [/maps?/, { code: "const credits = new Map([[\"HTML\", 3], [\"CSS\", 4]]);\nconsole.log(credits.get(\"CSS\"));", output: "4" }],
    [/iteration|iterators?/, { code: "const colors = [\"blue\", \"green\"];\nfor (const [index, color] of colors.entries()) {\n  console.log(index, color);\n}", output: "0 blue\n1 green" }],
    [/dates?/, { code: "const dueDate = new Date(\"2026-10-04T00:00:00Z\");\ndueDate.setUTCDate(dueDate.getUTCDate() + 7);\nconsole.log(dueDate.toISOString().slice(0, 10));", output: "2026-10-11" }],
    [/math/, { code: "const radius = 3;\nconst area = Math.PI * radius ** 2;\nconsole.log(area.toFixed(2));", output: "28.27" }],
    [/regexp|regular expression/, { code: "const message = \"Order 42 is ready\";\nconst orderNumber = message.match(/\\d+/)?.[0];\nconsole.log(orderNumber);", output: "42" }],
    [/fetch|web api/, { code: "async function loadCourse() {\n  const response = await fetch(\"/api/courses\");\n  if (!response.ok) throw new Error(\"Request failed\");\n  return response.json();\n}", output: "Returns parsed JSON after a successful response; non-2xx responses are treated as errors." }],
    [/json/, { code: "const course = { title: \"HTML Basics\", lessons: 12 };\nconst text = JSON.stringify(course);\nconst restored = JSON.parse(text);\nconsole.log(restored.title);", output: "HTML Basics" }],
    [/asynchronous|promises|async|await/, { code: "const result = await Promise.resolve(\"ready\");\nconsole.log(result);", output: "ready" }],
    [/dom navigation|selecting|queryselector/, { code: "const heading = document.querySelector(\"h1\");\nconst lessonCount = document.querySelectorAll(\".lesson\").length;\nconsole.log(heading?.textContent, lessonCount);", output: "Reads the first heading and counts elements with the lesson class." }],
    [/scope/, { code: "const course = \"JavaScript\";\nfunction describeLesson() {\n  const topic = \"Scope\";\n  return `${course}: ${topic}`;\n}\nconsole.log(describeLesson());", output: "JavaScript: Scope" }],
    [/modules?/, { code: "// courses.js\nexport const courses = [\"HTML\", \"CSS\"];\n\n// app.js\nimport { courses } from \"./courses.js\";\nconsole.log(courses.length);", output: "2" }],
    [/web storage|localstorage|sessionstorage/, { code: "localStorage.setItem(\"theme\", \"dark\");\nconst theme = localStorage.getItem(\"theme\");\nconsole.log(theme);", output: "dark" }],
    [/web workers?/, { code: "// main.js\nconst worker = new Worker(\"worker.js\");\nworker.postMessage(5);\nworker.onmessage = (event) => console.log(event.data);\n\n// worker.js\nonmessage = (event) => postMessage(event.data * event.data);", output: "25 (the worker computes the square away from the main UI thread)" }],
    [/closures?/, { code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next());", output: "1 2 (the returned function keeps access to count)" }],
    [/prototype|this keyword/, { code: "const course = { title: \"JavaScript\", label() { return this.title; } };\nconsole.log(course.label());", output: "JavaScript" }],
    [/abortcontroller|fetch retry/, { code: "const controller = new AbortController();\nfetch(\"/api/courses\", { signal: controller.signal });\ncontroller.abort();", output: "The request is cancelled when the controller is aborted." }],
    [/intersection observer/, { code: "const observer = new IntersectionObserver(([entry]) => {\n  if (entry.isIntersecting) console.log(\"Section visible\");\n});\nobserver.observe(document.querySelector(\"#section\"));", output: "Logs a message when the observed section enters the viewport." }],
    [/web components/, { code: "class CourseBadge extends HTMLElement {\n  connectedCallback() { this.textContent = \"Free course\"; }\n}\ncustomElements.define(\"course-badge\", CourseBadge);", output: "The browser registers a custom element that displays Free course when connected." }],
    [/unit testing/, { code: "import { test, expect } from \"node:test\";\nimport { add } from \"./math.js\";\ntest(\"adds values\", () => { expect(add(2, 3)).toBe(5); });", output: "The assertion passes when add(2, 3) returns 5." }],
  ],
  "html-fundamentals": [
    [/picture|source set|srcset/, { code: "<picture>\n  <source srcset=\"course-wide.webp\" media=\"(min-width: 800px)\">\n  <img src=\"course-small.webp\" alt=\"Learners studying together\" width=\"640\" height=\"480\">\n</picture>", output: "The browser chooses a suitable image source and keeps meaningful alternative text on the img element." }],
    [/lazy.loaded|lazy loaded|loading images/, { code: "<img src=\"lesson.webp\" alt=\"HTML lesson preview\" width=\"640\" height=\"360\" loading=\"lazy\">", output: "The browser can defer loading the off-screen image while its dimensions reserve space." }],
    [/details|summary/, { code: "<details>\n  <summary>What will I learn?</summary>\n  <p>Build accessible web pages with HTML.</p>\n</details>", output: "The browser provides a disclosure control that reveals the answer when opened." }],
    [/dialog/, { code: "<dialog open aria-labelledby=\"notice-title\">\n  <h2 id=\"notice-title\">Saved</h2>\n  <p>Your changes are stored.</p>\n</dialog>", output: "An open dialog is displayed with a programmatically associated heading." }],
    [/metadata|social card/, { code: "<meta name=\"description\" content=\"Learn HTML step by step\">\n<meta property=\"og:title\" content=\"HTML Course\">\n<meta property=\"og:description\" content=\"Practice accessible web pages\">", output: "Search and link previews can use the page description and Open Graph title and description." }],
    [/autocomplete/, { code: "<label for=\"email\">Email</label>\n<input id=\"email\" name=\"email\" type=\"email\" autocomplete=\"email\" required>", output: "The labeled required email control can use the browser's email autofill data." }],
    [/native validation|form validation/, { code: "<label for=\"seats\">Seats</label>\n<input id=\"seats\" name=\"seats\" type=\"number\" min=\"1\" max=\"8\" required>", output: "The browser requires a value and checks that it is between 1 and 8." }],
    [/accessible navigation|navigation/, { code: "<nav aria-label=\"Course sections\">\n  <a href=\"#lessons\">Lessons</a>\n  <a href=\"#projects\">Projects</a>\n</nav>", output: "A named navigation landmark contains links to page sections." }],
    [/language and direction/, { code: "<html lang=\"ar\" dir=\"rtl\">\n  <body><p>مرحبا</p></body>\n</html>", output: "The document declares Arabic as its language and right-to-left text direction." }],
    [/print-friendly|print styles/, { code: "<link rel=\"stylesheet\" href=\"print.css\" media=\"print\">\n\n/* print.css */\nnav, button { display: none; }\nmain { max-width: none; color: #000; }", output: "Print output hides interactive navigation and uses a simple high-contrast content layout." }],
    [/structured data/, { code: "<script type=\"application/ld+json\">\n{\"@context\":\"https://schema.org\",\"@type\":\"Course\",\"name\":\"HTML Basics\"}\n</script>", output: "The page supplies machine-readable Course metadata as JSON-LD." }],
  ],
  "css-fundamentals": [
    [/selectors?|combinators|pseudo|attribute selector/, { code: "nav a[aria-current=\"page\"]:hover {\n  color: #4338ca;\n  text-decoration: underline;\n}", output: "Styles only the current-page navigation link while it is hovered." }],
    [/colors?/, { code: ".notice {\n  color: #172554;\n  background-color: rgb(219 234 254);\n  border: 1px solid hsl(217 91% 60%);\n}", output: "A high-contrast notice uses hex, RGB, and HSL color formats." }],
    [/background/, { code: ".hero {\n  background: linear-gradient(135deg, #312e81, #0e7490);\n  color: white;\n}", output: "The hero receives a diagonal indigo-to-teal gradient." }],
    [/box model|margin|padding|border|width|height|box sizing/, { code: "* { box-sizing: border-box; }\n.card {\n  width: 280px;\n  padding: 20px;\n  border: 2px solid #cbd5e1;\n  margin: 16px;\n}", output: "The declared 280px width includes the card's padding and border." }],
    [/position|z-index|overflow|float/, { code: ".badge {\n  position: absolute;\n  inset: 12px 12px auto auto;\n  z-index: 1;\n}\n.card { position: relative; overflow: hidden; }", output: "The badge sits at the card's upper-right corner and stays inside its clipping boundary." }],
    [/flex/, { code: ".toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}", output: "Toolbar items share one row, align vertically, and keep space between them." }],
    [/grid|12-column/, { code: ".course-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));\n  gap: 1rem;\n}", output: "Course cards form as many columns as fit and move to fewer columns when space narrows." }],
    [/responsive|media quer|viewport/, { code: ".sidebar { width: 18rem; }\n@media (max-width: 48rem) {\n  .sidebar { width: 100%; }\n  .layout { grid-template-columns: 1fr; }\n}", output: "The sidebar and layout become single-column below 48rem." }],
    [/variables|custom properties|@property/, { code: ":root { --brand: #6c4dff; --space: 1rem; }\n.button {\n  background: var(--brand);\n  padding: var(--space);\n}", output: "The button uses shared color and spacing values defined on the root element." }],
    [/transitions?/, { code: ".button { background: #4338ca; transition: background-color 160ms ease; }\n.button:hover { background: #312e81; }", output: "The background color changes smoothly over 160 milliseconds on hover." }],
    [/animations?/, { code: "@keyframes appear { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n.card { animation: appear 240ms ease-out both; }", output: "The card fades in while moving upward by eight pixels." }],
    [/specificity|inheritance|!important|cascade order/, { code: "p { color: #334155; }\n.notice p { color: #1d4ed8; }\n.notice .muted { color: #64748b; }", output: "The most specific matching rule sets the paragraph color, unless a later cascade rule with equal specificity overrides it." }],
    [/opacity|filter|image styling/, { code: ".thumbnail {\n  width: 12rem;\n  aspect-ratio: 4 / 3;\n  object-fit: cover;\n  filter: saturate(1.1);\n  border-radius: 0.75rem;\n}", output: "The image fills a 4:3 thumbnail without distortion and has rounded corners." }],
    [/columns?/, { code: ".article {\n  columns: 2 18rem;\n  column-gap: 2rem;\n}", output: "The article flows into columns when enough width is available." }],
    [/container quer|container units/, { code: ".course-card { container-type: inline-size; }\n@container (min-width: 32rem) {\n  .course-card h2 { font-size: 1.5rem; }\n}", output: "The heading grows when its card container reaches 32rem, regardless of viewport width." }],
    [/clamp\(\)|fluid sizing/, { code: ".page-title { font-size: clamp(1.5rem, 4vw, 3rem); }", output: "The title scales with the viewport while staying between 1.5rem and 3rem." }],
    [/logical propert/, { code: ".card { padding-inline: 1.25rem; margin-block: 1rem; }", output: "Spacing follows the writing direction and block flow instead of assuming left, right, top, and bottom." }],
    [/cascade layer/, { code: "@layer reset, components, utilities;\n@layer components { .button { color: navy; } }\n@layer utilities { .text-white { color: white; } }", output: "Declared layer order lets the utility layer override the component layer at equal importance." }],
  ],
  "sql-fundamentals": [
    [/select distinct/, { code: "SELECT DISTINCT category\nFROM courses\nORDER BY category;", output: "One row for each different course category." }],
    [/where|filter|like|between|wildcard|in\b/, { code: "SELECT name, score\nFROM students\nWHERE score BETWEEN 80 AND 100\n  AND name LIKE 'A%';", output: "Students whose score is 80–100 and whose name begins with A." }],
    [/order by|select top|limit/, { code: "SELECT name, score\nFROM students\nORDER BY score DESC, name ASC\nLIMIT 3;", output: "The three highest-scoring students, with ties ordered by name." }],
    [/inner join|left join|right join|full join|self join|joins?/, { code: "SELECT students.name, enrollments.course_id\nFROM students\nLEFT JOIN enrollments\n  ON enrollments.student_id = students.id;", output: "Every student is returned; students without enrollments have a NULL course_id." }],
    [/union/, { code: "SELECT email FROM students\nUNION\nSELECT email FROM mentors;", output: "A combined list of distinct emails from both result sets." }],
    [/group by|having|aggregate|count\(|sum\(|avg\(|min\(|max\(/, { code: "SELECT course_id, COUNT(*) AS learner_count, AVG(score) AS average_score\nFROM enrollments\nGROUP BY course_id\nHAVING COUNT(*) >= 2;", output: "One row per course with at least two enrollments, including count and average score." }],
    [/exists|subquer|any|all/, { code: "SELECT name\nFROM students AS s\nWHERE EXISTS (\n  SELECT 1 FROM enrollments AS e WHERE e.student_id = s.id\n);", output: "Names only of students who have at least one enrollment." }],
    [/insert into select|select into/, { code: "INSERT INTO passed_students (name, score)\nSELECT name, score FROM students WHERE score >= 70;", output: "Copies passing student rows into passed_students." }],
    [/insert/, { code: "INSERT INTO students (name, score)\nVALUES ('Asha', 92);", output: "Adds one student row with a score of 92." }],
    [/update/, { code: "UPDATE students\nSET score = score + 5\nWHERE id = 12;", output: "Adds five points to the score for student 12 only." }],
    [/delete/, { code: "DELETE FROM students\nWHERE id = 12;", output: "Removes the selected student row; the WHERE clause prevents deleting every row." }],
    [/case/, { code: "SELECT name, CASE WHEN score >= 50 THEN 'Pass' ELSE 'Review' END AS result\nFROM students;", output: "Each student is labeled Pass or Review based on the score." }],
    [/null/, { code: "SELECT name, COALESCE(score, 0) AS display_score\nFROM students;", output: "Displays zero when score is NULL while leaving the stored value unchanged." }],
    [/create table|constraints|primary key|foreign key|not null|unique|default|check/, { code: "CREATE TABLE lesson_enrollments (\n  student_id INTEGER NOT NULL,\n  course_id INTEGER NOT NULL,\n  enrolled_at DATE DEFAULT CURRENT_DATE,\n  PRIMARY KEY (student_id, course_id),\n  FOREIGN KEY (student_id) REFERENCES students(id)\n);", output: "Creates enrollment rows with a composite primary key, a default date, and a student relationship." }],
    [/index/, { code: "CREATE INDEX idx_students_email\nON students(email);", output: "Creates an index the database can use to find students by email more efficiently." }],
    [/transaction|commit|rollback/, { code: "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;", output: "Both balance changes are committed together; use ROLLBACK if either step fails." }],
    [/prepared|parameter/, { code: "SELECT name FROM students WHERE email = ?;\n-- Bind the email value separately as a parameter.", output: "The database treats the supplied email as data, not as SQL syntax." }],
    [/view/, { code: "CREATE VIEW passing_students AS\nSELECT id, name, score FROM students WHERE score >= 50;", output: "Creates a reusable named query for passing students." }],
    [/date/, { code: "SELECT name, enrolled_at\nFROM enrollments\nWHERE enrolled_at >= DATE '2026-01-01';", output: "Returns enrollments made on or after January 1, 2026." }],
    [/common table expression|\bcte\b/, { code: "WITH passing AS (\n  SELECT name, score FROM students WHERE score >= 70\n)\nSELECT name FROM passing ORDER BY score DESC;", output: "Names of passing students ordered from the highest score." }],
    [/window|row_number|rank\(/, { code: "SELECT name, score,\n  ROW_NUMBER() OVER (ORDER BY score DESC) AS position\nFROM students;", output: "Each student is returned with a position based on descending score." }],
    [/explain|query plan|composite index/, { code: "EXPLAIN\nSELECT name FROM students WHERE course_id = 4 AND score >= 70;", output: "Shows the database query plan so access paths and scan costs can be inspected." }],
    [/isolation|locks?|concurrency/, { code: "BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nCOMMIT;", output: "Locks the selected account row during the transaction and commits the change." }],
  ],
  "mysql-fundamentals": [
    [/select distinct/, { code: "SELECT DISTINCT category\nFROM courses\nORDER BY category;", output: "One row for each different course category." }],
    [/where|filter|like|between|wildcard|in\b/, { code: "SELECT name, score\nFROM students\nWHERE score BETWEEN 80 AND 100\n  AND name LIKE 'A%';", output: "Students whose score is 80–100 and whose name begins with A." }],
    [/order by|limit/, { code: "SELECT name, score\nFROM students\nORDER BY score DESC, name ASC\nLIMIT 3;", output: "The three highest-scoring students, with ties ordered by name." }],
    [/cross join/, { code: "SELECT colors.name AS color, sizes.name AS size\nFROM colors CROSS JOIN sizes;", output: "Every color-size combination (the Cartesian product)." }],
    [/inner join|left join|right join|self join|joins?/, { code: "SELECT students.name, courses.title\nFROM students\nJOIN enrollments ON enrollments.student_id = students.id\nJOIN courses ON courses.id = enrollments.course_id;", output: "Student names paired with the titles of their enrolled courses." }],
    [/union/, { code: "SELECT email FROM students\nUNION ALL\nSELECT email FROM mentors;", output: "Emails from both queries, retaining duplicates." }],
    [/group by|having|aggregate|count\(|sum\(|avg\(|min\(|max\(/, { code: "SELECT course_id, COUNT(*) AS learner_count, AVG(score) AS average_score\nFROM enrollments\nGROUP BY course_id\nHAVING COUNT(*) >= 2;", output: "One row per course with at least two enrollments, including count and average score." }],
    [/exists|subquer|any|all/, { code: "SELECT name\nFROM students AS s\nWHERE EXISTS (\n  SELECT 1 FROM enrollments AS e WHERE e.student_id = s.id\n);", output: "Names only of students who have at least one enrollment." }],
    [/insert select/, { code: "INSERT INTO passed_students (name, score)\nSELECT name, score FROM students WHERE score >= 70;", output: "Copies passing student rows into passed_students." }],
    [/insert/, { code: "INSERT INTO students (name, score)\nVALUES ('Asha', 92);", output: "Adds one student row with a score of 92." }],
    [/update/, { code: "UPDATE students\nSET score = score + 5\nWHERE id = 12;", output: "Adds five points to the score for student 12 only." }],
    [/delete/, { code: "DELETE FROM students\nWHERE id = 12;", output: "Removes the selected student row; the WHERE clause prevents deleting every row." }],
    [/case/, { code: "SELECT name, CASE WHEN score >= 50 THEN 'Pass' ELSE 'Review' END AS result\nFROM students;", output: "Each student is labeled Pass or Review based on the score." }],
    [/null/, { code: "SELECT name, IFNULL(score, 0) AS display_score\nFROM students;", output: "Displays zero when score is NULL while leaving the stored value unchanged." }],
    [/create table|constraints|primary key|foreign key|not null|unique|default|check/, { code: "CREATE TABLE lesson_enrollments (\n  student_id INT NOT NULL,\n  course_id INT NOT NULL,\n  enrolled_at DATE DEFAULT (CURRENT_DATE),\n  PRIMARY KEY (student_id, course_id),\n  FOREIGN KEY (student_id) REFERENCES students(id)\n) ENGINE=InnoDB;", output: "Creates enrollment rows with a composite key, default date, and enforced student relationship." }],
    [/index/, { code: "CREATE INDEX idx_students_email\nON students(email);", output: "Creates an index the server can use to find students by email more efficiently." }],
    [/transaction|commit|rollback/, { code: "START TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;", output: "Both balance changes commit together; use ROLLBACK if either step fails." }],
    [/prepared|parameter/, { code: "PREPARE find_student FROM 'SELECT name FROM students WHERE email = ?';\nSET @email = 'asha@example.com';\nEXECUTE find_student USING @email;", output: "The email is bound as a value instead of being concatenated into SQL." }],
    [/view/, { code: "CREATE VIEW passing_students AS\nSELECT id, name, score FROM students WHERE score >= 50;", output: "Creates a reusable named query for passing students." }],
    [/date/, { code: "SELECT name, enrolled_at\nFROM enrollments\nWHERE enrolled_at >= '2026-01-01';", output: "Returns enrollments made on or after January 1, 2026." }],
    [/common table expression|\bcte\b/, { code: "WITH passing AS (\n  SELECT name, score FROM students WHERE score >= 70\n)\nSELECT name, score FROM passing ORDER BY score DESC;", output: "Names and scores of passing students ordered from the highest score." }],
    [/window|row_number|rank\(/, { code: "SELECT name, score,\n  ROW_NUMBER() OVER (ORDER BY score DESC) AS position\nFROM students;", output: "Each student is returned with a position based on descending score." }],
    [/json/, { code: "SELECT JSON_OBJECT('title', title, 'free', is_free) AS course_json\nFROM courses\nWHERE id = 1;", output: "Returns the selected course fields as a JSON object." }],
    [/explain|query plan|composite index|optimization/, { code: "EXPLAIN\nSELECT name FROM students WHERE course_id = 4 AND score >= 70;", output: "Shows the MySQL query plan so table access and index use can be reviewed." }],
    [/isolation|locks?|concurrency/, { code: "START TRANSACTION;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nCOMMIT;", output: "Locks the selected account row during the transaction and commits the change." }],
    [/savepoint/, { code: "START TRANSACTION;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nSAVEPOINT before_transfer;\nROLLBACK TO SAVEPOINT before_transfer;\nCOMMIT;", output: "Reverts work after the savepoint while leaving the transaction active for commit." }],
  ],
  "c-fundamentals": [
    [/pointer|memory address/, { code: "int score = 95;\nint *scorePtr = &score;\nprintf(\"%d is stored at %p\\n\", *scorePtr, (void *)scorePtr);", output: "Dereferencing scorePtr reads 95; the pointer also holds score's address." }],
    [/arrays?/, { code: "int scores[] = {72, 91, 84};\nsize_t count = sizeof scores / sizeof scores[0];\nfor (size_t i = 0; i < count; i++) {\n  printf(\"%d\\n\", scores[i]);\n}", output: "72\n91\n84" }],
    [/strings?/, { code: "char name[] = \"Asha\";\nprintf(\"%zu characters\\n\", strlen(name));", output: "4 characters" }],
    [/structures|structs|unions|typedef/, { code: "typedef struct {\n  char name[32];\n  int score;\n} Student;\nStudent learner = {\"Asha\", 92};\nprintf(\"%s: %d\\n\", learner.name, learner.score);", output: "Asha: 92" }],
    [/memory management|dynamic memory/, { code: "int *scores = malloc(3 * sizeof *scores);\nif (scores != NULL) {\n  scores[0] = 92;\n  printf(\"%d\\n\", scores[0]);\n  free(scores);\n}", output: "92; allocated memory is released with free." }],
    [/create files|write to files|read files|files/, { code: "FILE *file = fopen(\"notes.txt\", \"w\");\nif (file != NULL) {\n  fputs(\"Study C\\n\", file);\n  fclose(file);\n}", output: "Creates notes.txt, writes Study C, then closes the file." }],
    [/user input|input validation/, { code: "int age;\nprintf(\"Age: \" );\nif (scanf(\"%d\", &age) == 1) {\n  printf(\"Next year: %d\\n\", age + 1);\n} else {\n  puts(\"Enter a whole number\");\n}", output: "A valid integer is incremented; invalid input gets an error message." }],
    [/function pointers?/, { code: "int square(int value) { return value * value; }\nint (*operation)(int) = square;\nprintf(\"%d\\n\", operation(5));", output: "25" }],
    [/header guards?/, { code: "#ifndef COURSE_H\n#define COURSE_H\n\nint course_count(void);\n\n#endif", output: "The guard prevents the header declarations from being processed more than once per translation unit." }],
    [/command.?line|argument parsing/, { code: "int main(int argc, char *argv[]) {\n  if (argc < 2) { puts(\"Usage: app <name>\"); return 1; }\n  printf(\"Hello, %s\\n\", argv[1]);\n}", output: "The program checks for a name argument and prints a usage message when it is missing." }],
    [/realloc/, { code: "int *values = malloc(2 * sizeof *values);\nif (values != NULL) {\n  int *larger = realloc(values, 4 * sizeof *values);\n  if (larger != NULL) values = larger;\n  free(values);\n}", output: "Expands the allocation safely and releases the final pointer." }],
    [/undefined behavior|sanitizer/, { code: "int values[3] = {2, 4, 6};\nfor (size_t i = 0; i < 3; i++) {\n  printf(\"%d\\n\", values[i]);\n}", output: "2\n4\n6 (every access stays inside the array bounds)" }],
    [/safe string/, { code: "char name[32];\nint written = snprintf(name, sizeof name, \"%s\", \"Asha\");\nif (written >= 0 && (size_t)written < sizeof name) puts(name);", output: "Asha (snprintf limits the write to the destination buffer size)" }],
    [/linked lists?/, { code: "typedef struct Node { int value; struct Node *next; } Node;\nNode second = {20, NULL};\nNode first = {10, &second};\nprintf(\"%d %d\\n\", first.value, first.next->value);", output: "10 20 (each node links to the next node)" }],
    [/makefile|unit testing/, { code: "test: app\n\t./app --self-test\n\napp: main.c\n\t$(CC) -Wall -Wextra -std=c17 main.c -o app", output: "The make target compiles the program with warnings enabled, then runs its self-test." }],
  ],
  "cpp-fundamentals": [
    [/vectors?/, { code: "std::vector<int> scores{72, 91, 84};\nscores.push_back(95);\nstd::cout << scores.size() << \" scores\\n\";", output: "4 scores" }],
    [/references?/, { code: "int score = 80;\nint& scoreRef = score;\nscoreRef += 5;\nstd::cout << score;", output: "85 (the reference aliases score)" }],
    [/pointers?|memory management|smart pointers/, { code: "auto score = std::make_unique<int>(95);\nstd::cout << *score << '\\n';", output: "95; unique_ptr releases its owned integer automatically." }],
    [/templates?/, { code: "template <typename T>\nT larger(T left, T right) { return left < right ? right : left; }\nstd::cout << larger(4, 9);", output: "9" }],
    [/class|constructor|encapsulation/, { code: "class Counter {\n public:\n  explicit Counter(int start) : value(start) {}\n  void increment() { ++value; }\n  int get() const { return value; }\n private:\n  int value;\n};\nCounter counter(2);\ncounter.increment();\nstd::cout << counter.get();", output: "3" }],
    [/stacks?|queues?|deque|list/, { code: "std::queue<std::string> jobs;\njobs.push(\"email\");\njobs.push(\"report\");\nstd::cout << jobs.front();", output: "email (a queue removes items in first-in, first-out order)" }],
    [/maps?|sets?/, { code: "std::map<std::string, int> scores{{\"Asha\", 92}, {\"Ravi\", 85}};\nstd::cout << scores.at(\"Asha\");", output: "92" }],
    [/algorithms|sorting/, { code: "std::vector<int> values{8, 3, 6};\nstd::sort(values.begin(), values.end());\nfor (int value : values) std::cout << value << ' ';", output: "3 6 8" }],
    [/exceptions?|errors/, { code: "try {\n  throw std::runtime_error(\"invalid score\");\n} catch (const std::exception& error) {\n  std::cout << error.what();\n}", output: "invalid score" }],
    [/raii|rule of zero/, { code: "{\n  std::vector<int> scores{80, 95};\n  std::cout << scores.size() << '\\n';\n} // the vector releases its storage automatically", output: "2 (the vector owns and releases its memory through its lifetime)" }],
    [/optional|variant/, { code: "std::optional<int> score = 95;\nif (score) std::cout << *score;", output: "95 (optional contains a value)" }],
    [/concepts?/, { code: "template <typename T>\nconcept Printable = requires(T value) { std::cout << value; };\ntemplate <Printable T> void show(const T& value) { std::cout << value; }\nshow(42);", output: "42 (the constrained function accepts a type that can be written to the output stream)" }],
    [/chrono/, { code: "using namespace std::chrono;\nauto deadline = sys_days{year{2026}/October/4} + days{7};\nstd::cout << year_month_day{floor<days>(deadline)};", output: "2026/Oct/11" }],
    [/mutex|thread safety|lock guard/, { code: "std::mutex mutex;\nint total = 0;\n{\n  std::lock_guard<std::mutex> lock(mutex);\n  ++total;\n}\nstd::cout << total;", output: "1 (the lock guard releases the mutex when its scope ends)" }],
    [/cmake/, { code: "cmake_minimum_required(VERSION 3.20)\nproject(CourseApp LANGUAGES CXX)\nadd_executable(course_app main.cpp)\ntarget_compile_features(course_app PRIVATE cxx_std_20)", output: "CMake configures a C++20 executable target named course_app from main.cpp." }],
    [/unit testing/, { code: "TEST(CalculatorTest, AddsValues) {\n  EXPECT_EQ(add(2, 3), 5);\n}", output: "The unit test passes when add(2, 3) returns 5." }],
  ],
  "php-fundamentals": [
    [/echo|print/, { code: '<?php\n$name = "Asha";\necho "Welcome, " . $name . "!";', output: "Welcome, Asha!" }],
    [/numbers?|casting|math/, { code: '<?php\n$price = "12.50";\n$quantity = 3;\n$total = (float) $price * $quantity;\necho number_format($total, 2);', output: "37.50" }],
    [/arrays?/, { code: '<?php\n$scores = [72, 91, 84];\n$passing = array_filter($scores, fn($score) => $score >= 80);\nprint_r(array_values($passing));', output: "[91, 84]" }],
    [/forms?|form validation|superglobals/, { code: '<?php\n$email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);\nif ($email === false || $email === null) {\n  echo "Enter a valid email address";\n} else {\n  echo "Thanks, " . htmlspecialchars($email, ENT_QUOTES, "UTF-8");\n}', output: "Validates submitted email and escapes it before placing it in HTML." }],
    [/sessions?/, { code: '<?php\nsession_start();\n$_SESSION["course"] = "PHP";\necho $_SESSION["course"];', output: "PHP (the value is stored in the current session)" }],
    [/cookies?/, { code: '<?php\nsetcookie("theme", "dark", ["expires" => time() + 3600, "secure" => true, "httponly" => true, "samesite" => "Lax"]);', output: "Asks the browser to store a secure, HTTP-only theme cookie for one hour." }],
    [/mysql|pdo|prepared/, { code: '<?php\n$stmt = $pdo->prepare("SELECT name FROM students WHERE id = :id");\n$stmt->execute(["id" => $studentId]);\n$name = $stmt->fetchColumn();', output: "Reads the matching student name with a parameterized query." }],
    [/json/, { code: '<?php\n$course = ["title" => "PHP", "free" => true];\necho json_encode($course, JSON_THROW_ON_ERROR);', output: '{"title":"PHP","free":true}' }],
    [/file|upload/, { code: '<?php\n$contents = file_get_contents("notes.txt");\nif ($contents === false) {\n  throw new RuntimeException("Could not read notes");\n}\necho $contents;', output: "Reads notes.txt or raises an explicit error if reading fails." }],
    [/regex/, { code: '<?php\n$matched = preg_match("/^[A-Z]{2}[0-9]{4}$/", "CS2026");\necho $matched === 1 ? "Valid code" : "Invalid code";', output: "Valid code" }],
    [/date|time/, { code: '<?php\n$dueDate = new DateTimeImmutable("2026-10-04");\necho $dueDate->modify("+7 days")->format("Y-m-d");', output: "2026-10-11" }],
    [/exceptions?|errors?/, { code: '<?php\ntry {\n  $value = json_decode("{bad json}", flags: JSON_THROW_ON_ERROR);\n} catch (JsonException $error) {\n  echo "Invalid JSON";\n}', output: "Invalid JSON" }],
    [/classes|objects|constructor|inheritance|interface|traits?/, { code: '<?php\nclass Course {\n  public function __construct(public string $title) {}\n  public function label(): string { return "Course: " . $this->title; }\n}\necho (new Course("PHP"))->label();', output: "Course: PHP" }],
    [/strict types/, { code: "<?php\ndeclare(strict_types=1);\nfunction addPoints(int $score, int $bonus): int { return $score + $bonus; }\necho addPoints(80, 5);", output: "85 (strict typing rejects incompatible argument types instead of coercing them)" }],
    [/csrf/, { code: '<?php\n$token = bin2hex(random_bytes(32));\n$_SESSION["csrf_token"] = $token;\n// Include the token in the form and compare it on submission.', output: "Creates a cryptographically random token that a form can send back for request verification." }],
    [/password hashing/, { code: '<?php\n$hash = password_hash($password, PASSWORD_DEFAULT);\nif (password_verify($submittedPassword, $hash)) {\n  echo "Signed in";\n}', output: "Stores a password hash and verifies a submitted password without storing the original password." }],
    [/output escaping/, { code: '<?php\necho htmlspecialchars($userInput, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");', output: "Escapes HTML-sensitive characters before inserting untrusted text into a page." }],
    [/routing|request and response/, { code: '<?php\n$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);\nif ($path === "/courses") {\n  http_response_code(200);\n  echo "Course list";\n}', output: "Reads the request path, selects the matching route, and sends a successful response." }],
    [/environment configuration/, { code: '<?php\n$databaseUrl = getenv("DATABASE_URL");\nif ($databaseUrl === false) {\n  throw new RuntimeException("DATABASE_URL is not configured");\n}', output: "Reads configuration from the process environment and reports a missing required value." }],
    [/phpunit|unit testing/, { code: '<?php\nuse PHPUnit\\Framework\\TestCase;\nfinal class ScoreTest extends TestCase {\n  public function testPassingScore(): void {\n    self::assertGreaterThanOrEqual(50, 82);\n  }\n}', output: "The assertion passes because 82 is at least 50." }],
  ],
  "react-fundamentals": [
    [/usestate|state|hooks?/, { code: 'function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount((value) => value + 1)}>Count: {count}</button>;\n}', output: "React renders Count: 0; each click updates state and renders the new count." }],
    [/useeffect|data fetching|fetch/, { code: 'function CourseList() {\n  const [courses, setCourses] = useState([]);\n  useEffect(() => {\n    fetch("/api/courses").then((response) => response.json()).then(setCourses);\n  }, []);\n  return <p>{courses.length} courses</p>;\n}', output: "Loads the course list after mount and displays the number of results." }],
    [/props|destructuring|children/, { code: 'function CourseCard({ title, children }) {\n  return <article><h2>{title}</h2><div>{children}</div></article>;\n}\n<CourseCard title="HTML">Beginner course</CourseCard>', output: "A card titled HTML with Beginner course content." }],
    [/forms?|textarea|select|checkbox|radio/, { code: 'function SearchForm() {\n  const [query, setQuery] = useState("");\n  function submit(event) { event.preventDefault(); console.log(query); }\n  return <form onSubmit={submit}><label>Course <input value={query} onChange={(event) => setQuery(event.target.value)} /></label><button>Search</button></form>;\n}', output: "Typing updates controlled state; submitting prevents page navigation and uses the current query." }],
    [/lists?|conditionals?/, { code: 'const courses = ["HTML", "CSS"];\nreturn <ul>{courses.map((course) => <li key={course}>{course}</li>)}</ul>;', output: "React renders one list item per course and uses each course name as its stable key." }],
    [/usecontext|context patterns/, { code: 'const ThemeContext = createContext("light");\nfunction SaveButton() {\n  const theme = useContext(ThemeContext);\n  return <button className={theme}>Save</button>;\n}', output: "The button reads the nearest ThemeContext value without passing it through every intermediate component." }],
    [/useref|focus/, { code: 'function SearchBox() {\n  const inputRef = useRef(null);\n  return <><input ref={inputRef} /><button onClick={() => inputRef.current?.focus()}>Focus search</button></>;\n}', output: "Clicking the button moves keyboard focus to the input." }],
    [/usememo|usecallback|performance/, { code: 'const visibleCourses = useMemo(\n  () => courses.filter((course) => course.title.includes(query)),\n  [courses, query]\n);', output: "Recomputes the filtered list only when courses or query changes." }],
    [/router|navigation/, { code: '<Routes>\n  <Route path="/courses" element={<CourseList />} />\n  <Route path="/courses/:slug" element={<CourseDetails />} />\n</Routes>', output: "The router renders the list or detail view based on the current path." }],
    [/usereducer/, { code: 'function reducer(count, action) {\n  if (action.type === "increment") return count + 1;\n  return count;\n}\nconst [count, dispatch] = useReducer(reducer, 0);\ndispatch({ type: "increment" });', output: "The reducer receives the current value and action, then returns the next value." }],
    [/custom hooks?/, { code: 'function useCourseCount(courses) {\n  return useMemo(() => courses.length, [courses]);\n}\nconst count = useCourseCount(courses);', output: "The reusable hook returns the course count and updates it when courses changes." }],
    [/suspense|lazy/, { code: 'const CourseDetails = lazy(() => import("./CourseDetails.jsx"));\nreturn <Suspense fallback={<p>Loading course…</p>}><CourseDetails /></Suspense>;', output: "React shows a loading fallback while the lazily imported page is being loaded." }],
    [/portals?/, { code: 'function Dialog({ children }) {\n  return createPortal(<div role="dialog">{children}</div>, document.body);\n}', output: "The dialog is rendered under document.body while remaining part of the React component tree." }],
    [/transitions?/, { code: 'const [isPending, startTransition] = useTransition();\nfunction selectCourse(course) {\n  startTransition(() => setSelectedCourse(course));\n}', output: "React marks the update as non-urgent so the interface can keep responding during rendering." }],
    [/error boundaries?/, { code: 'class CourseBoundary extends React.Component {\n  state = { failed: false };\n  static getDerivedStateFromError() { return { failed: true }; }\n  render() { return this.state.failed ? <p>Could not load course.</p> : this.props.children; }\n}', output: "A rendering error replaces the course subtree with a fallback message." }],
    [/effect cleanup/, { code: 'useEffect(() => {\n  const timer = setInterval(() => setSeconds((value) => value + 1), 1000);\n  return () => clearInterval(timer);\n}, []);', output: "Starts one timer when the component mounts and clears it when the component unmounts." }],
    [/lifting state|state shape|functional state/, { code: 'const [count, setCount] = useState(0);\nfunction addTwo() {\n  setCount((value) => value + 1);\n  setCount((value) => value + 1);\n}', output: "Functional updates apply in order, increasing the count by two." }],
    [/server and client boundaries/, { code: 'export default function CoursePage() {\n  return <main><h1>Courses</h1><CourseSearch /></main>;\n}\n\n"use client";\nexport function CourseSearch() { return <input aria-label="Search courses" />; }', output: "The page can render on the server while the interactive search control is a client component." }],
    [/testing user events|testing/, { code: 'render(<button onClick={() => setSaved(true)}>Save</button>);\nawait user.click(screen.getByRole("button", { name: "Save" }));\nexpect(screen.getByText("Saved")).toBeInTheDocument();', output: "The test clicks the accessible button and checks the visible saved state." }],
    [/keyboard accessibility|accessibility/, { code: 'function CourseLink() {\n  return <a href="/courses" className="course-link">Browse courses</a>;\n}', output: "A native link can be reached and activated with the keyboard and exposes its purpose to assistive technology." }],
    [/app project structure/, { code: 'src/\n  components/\n  pages/\n  hooks/\n  services/\n  styles/\n  App.jsx', output: "Related UI, reusable hooks, data services, and styles live in clearly named areas." }],
  ],
};

function getTopicExample(courseSlug: string, title: string): LessonExample | undefined {
  const rules = topicExamples[courseSlug];
  if (!rules) return undefined;
  const topic = title.replace(/^(?:javascript|java|html|css|sql|mysql|c\+\+|c|php|react|js)\s+/i, "").toLowerCase();
  return rules.find(([pattern]) => pattern.test(topic))?.[1];
}

function getTopicConcept(title: string, languageName: string): { definition: string; explanation: string } | undefined {
  const topic = title.replace(/^(?:JavaScript|Java|HTML|CSS|SQL|MySQL|C\+\+|C|PHP|React|JS)\s+/i, "").toLowerCase();
  const concepts: [RegExp, string, string][] = [
    [/^(?:home|tutorial|examples?|reference|quick ref|summary|syllabus|study plan|certificate|quiz|exercises?)$/, "A course overview or reference page organizes the material and provides a place to review the named subject.", "Use this section to find the scope of ${topic}, review its syntax, and identify which earlier lesson explains any prerequisite. Reference pages summarize available forms; exercises and quizzes check whether you can apply them."],
    [/^(?:intro|introduction|what is .+|.+ basics?)$/, "An introduction establishes the purpose and vocabulary of ${topic} before detailed rules are introduced.", "Start by identifying what ${topic} does in ${languageName}, then connect it to a small example. Later lessons can build on the vocabulary and behavior introduced here."],
    [/^(?:get started|install|editors?|where to|compiler)$/, "A development setup is the set of tools and files needed to write, run, preview, or inspect ${languageName} work.", "Choose a tool suited to ${topic}, create the smallest runnable or previewable file, and verify the result. Keep source files separate from generated output so errors are easier to locate."],
    [/head|page title|doctype|favicon|charset|metadata/, "Document metadata describes a page to the browser and other software without becoming the main visible content.", "For ${topic}, place metadata in the document head and keep the page's visible content in its body. A clear title, language, and character encoding make pages easier to identify, decode, and share."],
    [/element|tag|markup|block|inline|div|semantic/, "An HTML element describes a piece of content or a structural region in the document tree.", "For ${topic}, select an element whose native meaning matches the content. Nest elements correctly and use generic containers only when a more meaningful element does not fit."],
    [/attribute/, "An HTML attribute configures an element or supplies extra information in its start tag.", "For ${topic}, put the attribute on the element that supports it, quote text values, and use valid values. Global attributes such as id and class differ from element-specific attributes such as href or alt."],
    [/heading|paragraph|quotation|formatting/, "Text elements describe how a piece of content fits into a document, such as a section heading, paragraph, or quotation.", "For ${topic}, choose markup by the role of the text rather than the appearance you want. Keep the document outline logical, then use CSS for visual styling."],
    [/image|favicon|icon/, "An image resource adds visual information to a page; its markup and text alternative determine how browsers and assistive technologies present it.", "For ${topic}, use a valid resource path, describe informative imagery with alternative text, and avoid repeating nearby text in the description. Decorative images should not add redundant announcements."],
    [/link|url|file path|path/, "A link or resource path identifies a destination relative to the current page or by an absolute URL.", "For ${topic}, check how the browser resolves the path from the document URL and use descriptive link text. Avoid assembling untrusted URLs by hand; encode URL components with the platform URL utilities."],
    [/table/, "A data table organizes related values into rows and columns with header cells that name each field.", "For ${topic}, use table markup only for genuinely tabular relationships. Add a caption and headers, and keep row and column associations understandable when navigating with assistive technology."],
    [/list/, "A list groups related items and conveys whether their order is meaningful.", "For ${topic}, use an ordered list for a sequence and an unordered list for a set without a required order. Nest list items when sub-items belong to a parent item."],
    [/button|form|input|textarea|select|checkbox|radio/, "A form control is an interactive element that accepts a value or action from the user.", "For ${topic}, choose the native control whose behavior matches the data, associate it with a visible label, and define how invalid or missing values are handled."],
    [/iframe|embed|plugin/, "An embedded browsing context or media element places another resource inside the current page.", "For ${topic}, provide an informative title or fallback, size the content responsively, and embed only trusted sources. Consider whether the external content can receive focus or expose cross-origin data."],
    [/canvas|svg|graphics/, "Browser graphics can be described as scalable vector shapes or drawn onto a pixel-based canvas.", "For ${topic}, choose SVG for scalable diagrams and icons or canvas for scripted pixel updates. Provide equivalent text or an accessible name when the graphic communicates information."],
    [/media|video|audio|youtube/, "Web media elements let a page present audio and video using browser playback features.", "For ${topic}, include controls, compatible sources, and captions or transcripts where speech conveys information. Avoid starting audible media without a user action."],
    [/style|color|background|font|text effect/, "A presentation rule changes how content looks while leaving its underlying structure intact.", "For ${topic}, keep content meaning in markup and presentation in CSS. Check contrast, inheritance, and responsive behavior at the sizes where people will use the page."],
    [/syntax|basic|document structure|first app|first program/, "Syntax is the set of structural rules that lets a browser, compiler, interpreter, or database understand a ${languageName} document or program.", "Follow the expected outer structure for ${topic}, then add one meaningful instruction or element at a time. A parser error often points near the first unmatched delimiter, misspelled keyword, or incorrectly nested block."],
    [/comment/, "A comment is source text intended for maintainers; it is ignored as executable behavior by the ${languageName} processor.", "Use the comment form supported by ${languageName} to explain intent, a constraint, or a non-obvious choice. Prefer clear names and structure for facts that the code itself can communicate."],
    [/output|print|echo|render html/, "Output is information a program, query, or page makes available to a person or another system.", "For ${topic}, identify where the result is sent: a terminal, browser DOM, HTTP response, or query result set. Encode or escape untrusted values when producing HTML, and keep diagnostic output separate from user-facing messages."],
    [/user input|scanner|stdin|readline/, "Input is data received from a user, file, request, or another program before it is used by the current operation.", "For ${topic}, read the value using the language's input mechanism, validate its type and allowed range, and handle missing or malformed data explicitly before using it."],
    [/date|time|temporal/, "Date and time APIs represent points on a calendar or timeline and provide operations for comparison, formatting, and arithmetic.", "For ${topic}, distinguish a date from a time zone-aware instant, use an explicit format at boundaries, and avoid assuming every day has the same duration during daylight-saving changes."],
    [/package|module|library|import|include/, "A package or module groups reusable code and exposes selected names to other parts of a program.", "For ${topic}, import only the code needed, use the package manager or runtime's standard resolution rules, and keep dependencies explicit so another developer can reproduce the project."],
    [/variable|scope|constant/, "A variable or constant is a named binding used to refer to a value; scope determines where that name can be accessed.", "For ${topic}, track when the binding is created, what value it holds, and which block or function can see it. Use constants for values that should not be reassigned and keep names close to their smallest useful scope."],
    [/data type|type conversion|type casting|casting|wrapper/, "A data type defines which values can be represented and which operations are valid for them.", "For ${topic}, inspect the value before converting it and choose a target type that can represent the result. Explicit conversion can lose precision or fail for invalid input, so validate values at system boundaries."],
    [/operator|math|boolean|comparison/, "An operator combines or transforms values to produce a result, while precedence determines the order in which operators are evaluated.", "For ${topic}, identify each operand and the result type, then evaluate sub-expressions using the language's precedence rules. Add parentheses when they make the intended order easier to read."],
    [/if|condition|switch|case/, "A conditional selects which block runs based on whether a test expression is true or matches a case.", "For ${topic}, make the conditions cover the intended cases without accidental overlap. Include a fallback branch when unmatched values need an explicit response, and test boundary values as well as typical inputs."],
    [/loop|iteration|for each|while/, "A loop repeats a block over a sequence or until a condition changes.", "For ${topic}, identify the loop's starting state, stop condition, and update step. Confirm that each pass makes progress toward termination; for collection loops, avoid mutating the collection in ways that invalidate iteration."],
    [/array|list|tuple|set|map|collection|vector|queue|stack|tree|linked/, "A collection stores multiple related values and provides operations for access, insertion, removal, and traversal.", "For ${topic}, choose the structure by its required ordering, uniqueness, lookup cost, and mutability. Check index or key validity before access, and use the collection's standard traversal tools where available."],
    [/string|character|regex|regular expression/, "Text is represented as a sequence of characters or code units, and text operations can inspect, transform, match, or format that sequence.", "For ${topic}, distinguish the original text from a transformed result and account for empty values, escaping, and user-provided content. Use a regular expression only when a pattern is clearer than ordinary string operations."],
    [/function|method|parameter|argument|recursion|lambda|callback/, "A function or method packages a named operation; parameters provide inputs and a return value communicates its result.", "For ${topic}, trace arguments into the function, follow local state, and track the returned value separately from side effects. Keep one clear responsibility per function and define a base case when calls are recursive."],
    [/class|object|constructor|inheritance|polymorphism|interface|encapsulation|component|props|hook|state/, "An object-oriented or component-based structure groups related data and behavior behind a defined interface.", "For ${topic}, identify the state owned by the structure, the inputs it receives, and the behavior it exposes. Keep invariants in one place and avoid copying state that can be derived from existing values."],
    [/form|input|validation|superglobal/, "A form or input control collects data from a person or external system and passes it into application logic.", "For ${topic}, associate controls with labels, validate values on the server or trusted processing layer, and treat every submitted value as untrusted. Give errors clear messages and preserve valid input when correcting mistakes."],
    [/dom|event|button|listener/, "An event-driven interface responds to user or browser events and updates the relevant part of the document or application state.", "For ${topic}, register behavior on the correct element, read the event data, and update state or the DOM through the framework's supported mechanism. Remove long-lived listeners when their owner is disposed."],
    [/selector|pseudo|combinator|attribute selector/, "A CSS selector identifies which document elements a rule should style.", "For ${topic}, choose the least specific selector that clearly identifies the intended elements. Prefer classes for reusable styling, reserve IDs for unique targets, and check how the cascade resolves competing rules."],
    [/box model|margin|padding|border|width|height|overflow/, "The CSS box model calculates an element's content area, padding, border, and outer spacing.", "For ${topic}, distinguish the inner content size from the rendered outer size. Apply box-sizing consistently and inspect overflow when content is larger than its available area."],
    [/flex|grid|layout|position|align|display|responsive|media quer/, "CSS layout rules arrange elements in available space and can adapt the arrangement to the viewport.", "For ${topic}, define the container's layout behavior first, then control item sizing, alignment, and gaps. Test narrow and wide viewports and avoid fixed dimensions that force content off-screen."],
    [/select|where|filter|like|between|wildcard|distinct|order by|limit|query/, "A database query declares which rows or columns should be returned and how the result should be filtered or ordered.", "For ${topic}, specify only the fields needed, make filtering conditions explicit, and test the query against boundary and missing values. Add a stable ordering when the application depends on row order."],
    [/join|union|relationship|foreign key/, "A relational operation combines rows from tables using a defined relationship or combines compatible result sets.", "For ${topic}, identify the key that relates records and decide whether unmatched rows should remain. Check for duplicate results when a relationship is one-to-many and qualify column names that appear in multiple tables."],
    [/insert|update|delete|create|drop|alter|constraint|index|transaction|prepared/, "A data definition or data change statement alters database structure or stored records.", "For ${topic}, confirm the target table and affected rows before applying the statement. Use constraints to protect data integrity, parameterized statements for user values, and transactions when several changes must succeed together."],
    [/file|stream|reader|writer/, "File and stream APIs move data between a program and persistent storage or another input/output source.", "For ${topic}, choose the correct read or write mode, handle encoding and errors, and close resources reliably. Avoid overwriting existing data unless replacement is intended."],
    [/error|exception|debug|validation|null/, "Error handling makes unexpected or invalid states visible and gives the program a controlled recovery path.", "For ${topic}, identify the operation that can fail, catch only errors the code can meaningfully handle, and preserve diagnostic detail for debugging. Validate external input before it reaches state-changing operations."],
    [/api|fetch|ajax|json|web storage|geolocation|workers|server-sent/, "A web API exposes browser or server capabilities through a defined set of methods, events, and data formats.", "For ${topic}, check the API's permissions and support requirements, handle asynchronous success and failure, and validate returned data before using it. Do not assume a request or capability is always available."],
    [/project|challenge|practice|real-life example/, "A project combines smaller language concepts into a complete task with inputs, behavior, and an observable result.", "For ${topic}, write down the expected behavior first, break the work into small steps, and check each step with representative and edge-case inputs. Keep the final implementation small enough to review."],
  ];
  const match = concepts.find(([pattern]) => pattern.test(topic));
  if (!match) return undefined;
  return {
    definition: match[1].replace(/\$\{topic\}/g, topic).replace(/\$\{languageName\}/g, languageName),
    explanation: match[2].replace(/\$\{topic\}/g, topic).replace(/\$\{languageName\}/g, languageName),
  };
}

const courseIntroCopy: Record<string, { definition: string; overview: string; history: string; focus: string }> = {
  "java-fundamentals": { definition: "Java is a statically typed, general-purpose programming language. Java source is compiled to bytecode that runs on a Java Virtual Machine (JVM).", overview: "Java is used for server applications, business software, Android development, and tools. Its explicit types and class-based structure help organize larger programs.", history: "Java was developed at Sun Microsystems under James Gosling and introduced publicly in 1995. Its JVM-based design made it possible to run compiled bytecode on different systems with compatible Java runtimes. Java is now stewarded through the OpenJDK project and the Java community.", focus: "classes, static types, and the JVM" },
  "javascript-fundamentals": { definition: "JavaScript is a high-level, dynamically typed programming language standardized as ECMAScript. Browsers use it to respond to user actions and update pages; server runtimes can use it outside the browser.", overview: "JavaScript connects page content to behavior. Learners can start in a browser console, then use the same core language for interactive interfaces, server programs, and automation.", history: "JavaScript was created by Brendan Eich at Netscape in 1995. The language was standardized as ECMAScript, allowing multiple browser and server implementations to share a common specification while continuing to evolve.", focus: "values, functions, and browser APIs" },
  "html-fundamentals": { definition: "HTML (HyperText Markup Language) is a markup language that gives web content structure and meaning through elements and attributes.", overview: "Browsers interpret HTML to build a document structure. Good markup helps people and assistive technology understand headings, links, images, forms, and page regions.", history: "HTML was created by Tim Berners-Lee for sharing linked documents on the early Web. It has evolved through standards work into the semantic, multimedia-capable HTML used by modern browsers.", focus: "elements, attributes, and semantic structure" },
  "css-fundamentals": { definition: "CSS (Cascading Style Sheets) is a stylesheet language that describes how selected document elements should look and how they should be arranged.", overview: "CSS separates presentation from document structure. Rules match elements with selectors, then the cascade resolves which declarations apply when rules overlap.", history: "CSS was proposed by Håkon Wium Lie in 1994 to give web authors more control over presentation. The first CSS recommendation followed in 1996, and the language has since grown to support responsive layouts, animation, and modern design systems.", focus: "selectors, the cascade, and layout" },
  "sql-fundamentals": { definition: "SQL (Structured Query Language) is a declarative language for defining, reading, and changing data in relational database systems.", overview: "SQL describes the data result or change you want. A database evaluates the statement against tables and relationships, making SQL useful for applications, reporting, and data analysis.", history: "SQL grew from IBM research on relational databases in the 1970s and was standardized internationally beginning in the 1980s. Database products implement the standard with their own additional features and syntax variations.", focus: "tables, queries, and relationships" },
  "c-fundamentals": { definition: "C is a general-purpose, compiled programming language that gives programmers direct control over data representation and memory while supporting structured programming.", overview: "C is used in operating systems, embedded devices, compilers, and performance-sensitive software. Its small core makes it useful for learning how programs work close to the machine.", history: "C was developed by Dennis Ritchie at Bell Labs in the early 1970s, building on earlier systems languages. It became widely used for systems software and was standardized so programs could be written more portably across implementations.", focus: "types, functions, arrays, and memory" },
  "cpp-fundamentals": { definition: "C++ is a compiled, general-purpose language that supports procedural, object-oriented, and generic programming, with control over performance and resources.", overview: "C++ is used in game engines, desktop software, embedded systems, and performance-sensitive applications. It offers high-level abstractions while allowing close control of memory and execution.", history: "C++ began as Bjarne Stroustrup's work at Bell Labs in 1979, extending C with class features. It later became an international standard and continues to evolve through the ISO C++ standardization process.", focus: "types, functions, collections, and classes" },
  "php-fundamentals": { definition: "PHP is a server-side scripting language commonly used to generate dynamic web pages and build web applications.", overview: "PHP code runs on a server and can generate HTML, process form submissions, work with files, and communicate with databases.", history: "PHP began as a set of web tools by Rasmus Lerdorf in 1994 and grew into a widely used server-side language with modern object-oriented features and a large ecosystem.", focus: "web requests, functions, data, and database access" },
  "react-fundamentals": { definition: "React is a JavaScript library for building user interfaces from reusable components.", overview: "React describes what the interface should show for the current application state. Components compose into pages, while props and state carry the data that drives updates.", history: "React was created at Facebook and released publicly in 2013. Its component model and declarative rendering have shaped many modern frontend development workflows.", focus: "components, JSX, props, state, and hooks" },
  "mysql-fundamentals": { definition: "MySQL is a relational database management system that stores structured data in tables and supports SQL queries.", overview: "MySQL applications define tables and relationships, then use SQL to read, add, update, and summarize records. It is commonly used for web application data.", history: "MySQL began in the 1990s as an open-source relational database and became widely adopted in web hosting and application stacks. It is now developed by Oracle with community and commercial editions.", focus: "relational tables, SQL queries, keys, and safe data changes" },
};

function getTopicCopy(courseSlug: string, title: string, kind: LessonKind, languageName: string, code: string, output: string): TopicCopy {
  const normalized = title.toLowerCase().replace(/[?!]/g, "").trim();
  const normalizedTopic = normalized.replace(/^(?:javascript|java|html|css|sql|mysql|c\+\+|c|php|react|js)\s+/i, "");
  const specific = getTopicSpecificLesson(courseSlug, title);
  if (specific) return {
    overview: specific.overview,
    definition: specific.definition,
    explanation: specific.explanation,
    keyPoints: specific.takeaways.map((detail, index) => ({ title: ["Key idea", "How it works", "Use it well"][index] ?? "Remember", detail })),
    visual: { caption: `${title.toUpperCase()} · CONCEPT AND EXAMPLE`, nodes: [
      { label: "CONCEPT", value: specific.definition },
      { label: "RULE", value: specific.explanation },
      { label: "RESULT", value: specific.output },
    ], summary: `${specific.overview} The example shows the result in a browser.` },
  };
  const courseIntro = courseIntroCopy[courseSlug];
  if (courseIntro && /history/.test(normalized)) return {
    overview: courseIntro.history,
    definition: `${languageName} history explains how the language's design and ecosystem developed over time.`,
    explanation: courseIntro.history,
    keyPoints: [{ title: "Origins", detail: courseIntro.history }, { title: "Why the history matters", detail: `The original goals help explain today's ${courseIntro.focus}.` }, { title: "Modern use", detail: courseIntro.overview }],
    visual: { caption: `${languageName.toUpperCase()} · FROM ORIGIN TO MODERN USE`, nodes: [{ label: "ORIGIN", value: "Language design begins" }, { label: "EVOLUTION", value: "Standards and ecosystem grow" }, { label: "TODAY", value: courseIntro.focus }], summary: `The history of ${languageName} helps explain how the language is used today.` },
  };
  if (courseIntro && /^(introduction|intro|what is|what are)/.test(normalizedTopic)) return {
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
      "php-fundamentals": { overview: "Install PHP from a trusted package source or use a supported local development stack. The PHP command-line interpreter can run examples without a web server.", commands: "php --version\n\nphp hello.php", workflow: "The version check confirms PHP CLI is available. Save a script as hello.php and run it with php; a web server is only needed for browser-based PHP pages." },
      "react-fundamentals": { overview: "React is a JavaScript UI library. Start with a supported Node.js installation and a development tool such as Vite, then run the local development server.", commands: "node --version\nnpm --version\n\nnpm create vite@latest my-react-app -- --template react\ncd my-react-app\nnpm install\nnpm run dev", workflow: "Node.js runs the development tools and npm installs the project packages. The dev command starts a local server that refreshes as you edit React components." },
      "mysql-fundamentals": { overview: "MySQL examples need a MySQL server and a client or graphical database tool. Install a current supported server distribution and create a practice database with a least-privilege learner account.", commands: "mysql --version\nmysql -u learner -p\n\nCREATE DATABASE practice;\nUSE practice;", workflow: "The version check confirms the client is available. Sign in to a running MySQL server, then select or create a practice database before running course queries." },
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

  const concept = getTopicConcept(title, languageName);
  const definition = concept?.definition ?? definitions[kind] ?? explanations[kind];
  const explanation = concept?.explanation ?? explanations[kind];
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
    "php-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "react-fundamentals": `// Challenge: ${title}\n// Write your solution below`,
    "mysql-fundamentals": `-- Challenge: ${title}\n-- Write your solution below`,
    "html-fundamentals": `<!-- Challenge: ${title} -->\n<!-- Write your solution below -->`,
    "css-fundamentals": `/* Challenge: ${title} */\n/* Write your solution below */`,
    "sql-fundamentals": `-- Challenge: ${title}\n-- Write your solution below`,
  } as Record<string, string>)[courseSlug];
  return comment ?? `// Challenge: ${title}\n// Write your solution below`;
}

export function buildTutorialLesson(courseSlug: string, title: string, index: number): TutorialLesson {
  const kind = lessonKindForCourse(courseSlug, title);
  const isWhyPython = courseSlug === "python-fundamentals" && /^why python\??$/i.test(title.trim());
  const specific = getTopicSpecificLesson(courseSlug, title);
  const sample = isWhyPython
    ? { code: 'numbers = [1, 2, 3]\ndoubled = [number * 2 for number in numbers]\nprint(doubled)', output: "[2, 4, 6]" }
    : specific ? { code: specific.code, output: specific.output }
    : getTopicExample(courseSlug, title) ?? (
      courseSlug === "python-fundamentals" && /variable/i.test(title)
        ? pythonVariableExamples[toTopicSlug(title)] ?? codeSamples[courseSlug]?.[kind]
        : courseSlug === "python-fundamentals" && /python syntax|indentation|statements|keywords|identifiers|expressions|code blocks|whitespace|capitalization rules|delimiters|parentheses|syntax errors|syntax mistakes|debugging syntax errors/i.test(title)
          ? pythonSyntaxExamples[toTopicSlug(title)] ?? codeSamples[courseSlug]?.[kind]
          : kind === "setup" ? setupSamples[courseSlug] ?? codeSamples[courseSlug]?.setup
          : codeSamples[courseSlug]?.[kind] ?? (kind === "intro" ? codeSamples[courseSlug]?.hello : undefined)
    );
  const commentPrefix: Record<string, string> = {
    "python-fundamentals": "#", "java-fundamentals": "//", "javascript-fundamentals": "//",
    "html-fundamentals": "<!--", "css-fundamentals": "/*", "sql-fundamentals": "--",
    "c-fundamentals": "//", "cpp-fundamentals": "//", "php-fundamentals": "//",
    "react-fundamentals": "//", "mysql-fundamentals": "--",
  };
  const closingComment: Record<string, string> = { "html-fundamentals": " -->", "css-fundamentals": " */" };
  const languageName = ({ "python-fundamentals": "Python", "java-fundamentals": "Java", "javascript-fundamentals": "JavaScript", "html-fundamentals": "HTML", "css-fundamentals": "CSS", "sql-fundamentals": "SQL", "c-fundamentals": "C", "cpp-fundamentals": "C++", "php-fundamentals": "PHP", "react-fundamentals": "React", "mysql-fundamentals": "MySQL" } as Record<string, string>)[courseSlug] ?? courseSlug.replace(/-fundamentals$/, "").replace(/-/g, " ");
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
  const lessonMistake = pythonInstallation ? "Installing an editor or its Python extension does not install the Python interpreter. Install Python separately, then select that interpreter in your editor." : pythonIntro ? "Python uses indentation to define code blocks. Inconsistent indentation inside a function or loop can cause an IndentationError." : kind === "loop" ? "Changing the wrong variable or forgetting to update it can make a loop repeat forever." :
    kind === "condition" ? "A comparison such as >= is different from assignment. Check the exact operator in the condition." :
    kind === "collection" ? "Using an index beyond the last item can cause an error. Remember that many languages begin indexing at zero." :
    kind === "update" ? "An UPDATE without a WHERE clause may change every row in the table." :
    kind === "file" ? "Forgetting to close a file can leave resources in use or data unwritten." :
    kind === "pointer" ? "Do not use a pointer before it refers to a valid object." :
    `Connect lesson ${index + 1} to the example and the ideas from earlier lessons.`;
  const primaryQuiz: LessonQuizQuestion = pythonInstallation ? {
    question: "Which command checks the installed Python 3 version on macOS or Linux?",
    options: [{ id: "correct", text: "python3 --version" }, { id: "d1", text: "install python" }, { id: "d2", text: "python3 --remove" }, { id: "d3", text: "pip --python" }],
    answer: "correct",
    explanation: "python3 --version prints the Python 3 interpreter version available in the terminal. On Windows, the Python Install Manager can be checked with py --version.",
  } : pythonIntro ? {
    question: "Which of the following is not a typical feature of Python?",
    options: [{ id: "d1", text: "Dynamic typing" }, { id: "d2", text: "Readable syntax" }, { id: "d3", text: "Automatic memory management" }, { id: "correct", text: "Direct low-level memory operations as its main programming model" }],
    answer: "correct",
    explanation: "Python is a high-level language that manages memory for you. Direct low-level memory operations are not its main programming model.",
  } : {
    question: `In this ${languageName} lesson on ${title.toLowerCase()}, what result does the example produce?`,
    options: [{ id: "correct", text: output }, { id: "d1", text: "The example produces no change or result" }, { id: "d2", text: "The example reports a syntax error" }, { id: "d3", text: "The example repeats its first step indefinitely" }],
    answer: "correct",
    explanation: `Trace the ${title.toLowerCase()} example from its inputs through each instruction. Its expected result is: ${output}`,
  };
  const otherDefinitions = [...new Set(Object.entries(definitions)
    .filter(([otherKind, detail]) => otherKind !== kind && detail)
    .map(([, detail]) => detail!))];
  const makeQuizQuestion = (question: string, correct: string, distractors: string[], explanation: string): LessonQuizQuestion => ({
    question,
    options: [{ id: "correct", text: correct }, ...distractors.slice(0, 3).map((text, optionIndex) => ({ id: `d${optionIndex + 1}`, text }))],
    answer: "correct",
    explanation,
  });
  const topicDefinition = pythonInstallation
    ? "Installing Python means adding the Python interpreter to your computer so it can run .py programs and create isolated project environments."
    : pythonIntro
      ? "Python is a high-level, general-purpose programming language whose interpreter runs readable source code across major operating systems."
      : topicCopy.definition;
  const quiz: LessonQuizQuestion[] = [
    primaryQuiz,
    makeQuizQuestion(
      `Which statement best describes ${title.toLowerCase()}?`,
      topicDefinition,
      otherDefinitions,
      `This is the central rule for ${title.toLowerCase()}: ${topicDefinition}`,
    ),
    makeQuizQuestion(
      `Which related idea is also important when applying ${title.toLowerCase()}?`,
      topicCopy.keyPoints[1]?.detail ?? topicCopy.explanation,
      otherDefinitions.slice(3, 6),
      topicCopy.keyPoints[1]?.detail ?? topicCopy.explanation,
    ),
    makeQuizQuestion(
      `A change to the ${title.toLowerCase()} example gives an unexpected result. What is the strongest way to check the change?`,
      "Test a typical case and relevant boundary cases, then compare the observed behavior with the expected behavior.",
      ["Repeat only the original example and assume every other input behaves the same.", "Change several unrelated lines at once and judge the result by appearance.", "Remove the relevant condition or structure so the example has fewer lines."],
      "A useful check covers more than the one happy-path example and isolates the change that affected behavior.",
    ),
    makeQuizQuestion(
      `Which issue is the most relevant risk to watch for in ${title.toLowerCase()}?`,
      lessonMistake,
      ["A comment changes the program's runtime behavior.", "Renaming a file automatically changes the values stored in a database.", "Adding whitespace always makes the program run forever."],
      lessonMistake,
    ),
  ];
  const challengeSolution = getFreeCourseChallenge(courseSlug, kind);
  const challenge = getFreeCourseChallengePrompt(courseSlug, title, kind, languageName);
  return {
    kind,
    requiresCodeChallenge,
    visual: topicCopy.visual,
    articleSections,
    overview,
    keyPoints,
    exampleTitle: specific?.exampleTitle ?? (pythonIntro ? "Hello World Program" : `${title} Example`),
    exampleIntroduction: specific ? `${specific.explanation} Read the markup, then match it to the browser result.` : pythonIntro ? "The Hello World program demonstrates the basic structure of a Python program and shows how to display text." : `This small example demonstrates ${title.toLowerCase()} in ${languageName}. Read the code, predict its result, then compare your prediction with the output.`,
    quiz,
    definition: pythonIntro ? "Python is a high-level, general-purpose programming language with readable syntax. A Python interpreter executes Python code, and the language provides features for procedural, object-oriented, and functional programming." : topicCopy.definition,
    introduction: pythonInstallation ? "Choose an installation route for Windows, macOS, or Linux. Follow its steps, verify that Python 3 runs, and optionally set up an editor and isolated project environment." : pythonIntro ? "Learn where Python came from, what it is used for, and how its readable syntax works." : isWhyPython ? "Explore the qualities that make Python a useful choice for many kinds of software." : `Learn how ${title.toLowerCase()} works in ${languageName}, then trace the example to its result.`,
    explanation: pythonInstallation ? "An installer or package manager places the Python interpreter on your system. A terminal version check confirms it is available; a virtual environment then isolates packages for a project. Editors such as VS Code are installed separately." : pythonIntro ? "Python reads the source file and executes its instructions through the Python interpreter. In this first example, print() writes a string to the output. A comment beginning with # is ignored by the interpreter." : topicCopy.explanation,
    code,
    output,
    takeaways: specific?.takeaways ?? (pythonInstallation ? ["Choose one install route that matches your operating system.", "Verify the interpreter from a newly opened terminal.", "Use a virtual environment to isolate project packages.", "An editor and its Python extension are separate from the interpreter."] : pythonIntro ? ["print() displays text in the output.", "Put strings inside matching quotation marks.", "Python ignores comments that begin with #."] : takeaways[kind] ?? [`Understand what ${title.toLowerCase()} is used for.`, "Read the example carefully before changing it."]),
    mistake: lessonMistake,
    syntax: syntaxByKind[kind] ?? (code.split("\n").find((line) => line.trim() && !/^(#|\/\/|--|<!--)/.test(line.trim()))?.trim() ?? "Follow the example structure shown above."),
    realWorld: specific ? specific.overview : pythonInstallation ? "A working Python interpreter lets you run course examples, build scripts and applications, and install project libraries. Virtual environments help different projects use different package versions safely." : pythonIntro ? "Python is used to build web services, automate repetitive work, analyze data, create scientific software, and develop AI applications." : kind === "variables" ? "Variables let a program keep, update, and reuse information without repeating literal values. A learner name, score, or account balance can be read in many instructions and changed in one place." :
      kind === "condition" ? "Programs use decisions to validate forms, apply rules, and choose the next action." :
      kind === "loop" ? "Programs repeat loops to process records, files, and collections without copying the same instruction." :
      kind === "collection" || kind === "object" ? "Collections organize related information such as scores, products, or user profiles." :
      kind === "function" ? "Functions package steps that an application needs to reuse with different inputs." :
      `The ${title.toLowerCase()} concept appears in everyday ${languageName} programs to make code clearer and easier to maintain.`,
    bestPractice: specific ? specific.takeaways[0] : pythonInstallation ? "Use the official installer or your operating system's trusted package manager. Keep the system-provided Python intact and create a virtual environment for each project." : pythonIntro ? "Use Python 3, choose descriptive names, and keep indentation consistent so the structure is clear." : takeaways[kind]?.[0] ?? "Use names and structure that make the purpose clear to another person reading your code.",
    practice: specific ? `Modify the ${title.toLowerCase()} example: ${specific.challenge}` : pythonInstallation ? "Follow the steps for your system, run its version command, then create and activate a .venv in a practice project folder." : pythonIntro ? "Change the text inside print(), predict what will appear, then run the code to check your prediction." : `Change one part of the ${title.toLowerCase()} example, predict the result, then compare your prediction with the displayed output.`,
    challenge,
    challengeStarter: starterForLanguage(courseSlug, title),
    challengeCode: challengeSolution.code,
    challengeOutput: challengeSolution.output,
    challengeHints: [
      `This challenge uses a new ${languageName} scenario for ${title.toLowerCase()}, with values that differ from the worked example.`,
      `Apply the topic syntax to the challenge scenario instead of copying the lesson example.`,
      `Run your solution and compare its result with the challenge target before submitting.`,
    ],
    keywords: specific ? [title.toLowerCase(), "HTML", "element", "attribute", "browser"] : pythonIntro ? ["high-level", "interpreter", "syntax", "indentation"] : keywordsByKind[kind] ?? [title.toLowerCase(), "syntax", "example"],
    steps: code.split("\n").filter((line) => line.trim()).map((line) => ({ code: line, explanation: explainCodeLine(line) })),
  };
}
