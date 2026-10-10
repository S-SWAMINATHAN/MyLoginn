import type { LessonKind } from "@/lib/freeCourseTutorial";
import { authoredChallenges, type AuthoredChallenge } from "@/lib/challengeData";

/** `task` is the learner-facing brief; `given` lists sample input (or program stdin) shown beside the editor. */
export type FreeCourseChallenge = { code: string; output: string; task?: string; given?: string[]; stdin?: string };

const topicKey = (title: string) => title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const challenges: Record<string, Partial<Record<LessonKind, FreeCourseChallenge>>> = {
  "python-fundamentals": {
    practice: { code: 'course = "Web Design"\nlessons = 8\nprint(f"{course}: {lessons} lessons")', output: "Web Design: 8 lessons" },
    variables: { code: 'learner = "Asha"\nscore = 87\nprint(f"{learner}: {score}")', output: "Asha: 87" },
    types: { code: 'seats = 24\navailable = True\nprint(type(seats).__name__)\nprint(type(available).__name__)', output: "int\nbool" },
    numbers: { code: 'price = 18\nquantity = 4\ndiscount = 6\nprint(price * quantity - discount)', output: "66" },
    strings: { code: 'course = "web design"\nprint(course.title())\nprint(len(course))', output: "Web Design\n10" },
    operators: { code: 'credits = 12\nused = 5\nprint(credits - used)\nprint(credits >= 10)', output: "7\nTrue" },
    condition: { code: 'score = 42\nif score >= 60:\n    print("Pass")\nelse:\n    print("Review")', output: "Review" },
    loop: { code: 'for day in range(2, 5):\n    print(f"Day {day}")', output: "Day 2\nDay 3\nDay 4" },
    function: { code: 'def course_total(price, seats):\n    return price * seats\n\nprint(course_total(15, 3))', output: "45" },
    collection: { code: 'scores = [68, 91, 77, 84]\npassing = [score for score in scores if score >= 80]\nprint(passing)', output: "[91, 84]" },
    object: { code: 'course = {"title": "Web Design", "lessons": 8}\nprint(course["title"])\nprint(course["lessons"])', output: "Web Design\n8" },
    class: { code: 'class Badge:\n    def __init__(self, label):\n        self.label = label\n\nbadge = Badge("Complete")\nprint(badge.label)', output: "Complete" },
    recursion: { code: 'def sum_to(number):\n    if number <= 1:\n        return number\n    return number + sum_to(number - 1)\n\nprint(sum_to(4))', output: "10" },
    sort: { code: 'scores = [14, 3, 9, 7]\nscores.sort()\nprint(scores)', output: "[3, 7, 9, 14]" },
    array: { code: 'from array import array\nlevels = array("i", [2, 4, 6])\nlevels.append(8)\nprint(levels[1], len(levels))', output: "4 4" },
    iterator: { code: 'topics = iter(["forms", "tables", "links"])\nprint(next(topics))\nprint(next(topics))', output: "forms\ntables" },
    date: { code: 'from datetime import date, timedelta\ndue = date(2026, 11, 12) + timedelta(days=3)\nprint(due.isoformat())', output: "2026-11-15" },
    math: { code: 'import math\nprint(math.ceil(17 / 5))\nprint(math.gcd(18, 24))', output: "4\n6" },
    json: { code: 'import json\nlesson = {"title": "Forms", "required": True}\nencoded = json.dumps(lesson)\nprint(json.loads(encoded)["title"])', output: "Forms" },
    regex: { code: 'import re\ncode = "WEB-4821"\nmatch = re.search(r"\\d{4}", code)\nprint(match.group() if match else "No code")', output: "4821" },
  },
  "java-fundamentals": {
    practice: { code: 'System.out.println("Course challenge solved");', output: "Course challenge solved" },
    variables: { code: 'String learner = "Asha";\nint score = 87;\nSystem.out.println(learner + " earned " + score);', output: "Asha earned 87" },
    condition: { code: 'int score = 42;\nString result = score >= 60 ? "Pass" : "Review";\nSystem.out.println(result);', output: "Review" },
    loop: { code: 'for (int day = 2; day <= 4; day++) {\n  System.out.println("Day " + day);\n}', output: "Day 2\nDay 3\nDay 4" },
    function: { code: 'static int courseTotal(int price, int seats) {\n  return price * seats;\n}\nSystem.out.println(courseTotal(15, 3));', output: "45" },
    collection: { code: 'List<Integer> scores = List.of(68, 91, 77, 84);\nlong passing = scores.stream().filter(score -> score >= 80).count();\nSystem.out.println(passing);', output: "2" },
    class: { code: 'record Badge(String label) {}\nBadge badge = new Badge("Complete");\nSystem.out.println(badge.label());', output: "Complete" },
    error: { code: 'try {\n  int seats = Integer.parseInt("many");\n} catch (NumberFormatException error) {\n  System.out.println("Enter a seat count");\n}', output: "Enter a seat count" },
  },
  "javascript-fundamentals": {
    practice: { code: 'console.log("Course challenge solved");', output: "Course challenge solved" },
    variables: { code: 'const learner = "Asha";\nconst score = 87;\nconsole.log(`${learner} earned ${score}`);', output: "Asha earned 87" },
    condition: { code: 'const score = 42;\nconsole.log(score >= 60 ? "Pass" : "Review");', output: "Review" },
    loop: { code: 'for (let day = 2; day <= 4; day++) {\n  console.log(`Day ${day}`);\n}', output: "Day 2\nDay 3\nDay 4" },
    function: { code: 'function courseTotal(price, seats) {\n  return price * seats;\n}\nconsole.log(courseTotal(15, 3));', output: "45" },
    collection: { code: 'const scores = [68, 91, 77, 84];\nconsole.log(scores.filter((score) => score >= 80));', output: "[91, 84]" },
    object: { code: 'const course = { title: "Web Design", lessons: 8 };\nconsole.log(course.title, course.lessons);', output: "Web Design 8" },
    dom: { code: 'const card = document.createElement("article");\ncard.textContent = "Web Design";\nconsole.log(card.textContent);', output: "Web Design" },
    event: { code: 'function announceCourse() {\n  return "Course selected";\n}\nconsole.log(announceCourse());', output: "Course selected" },
  },
  "html-fundamentals": {
    practice: { code: '<article class="course-card">\n  <h2>Web Design</h2>\n  <p>Eight practical lessons</p>\n  <a href="/courses/web-design">View course</a>\n</article>', output: "A semantic course card with a heading, description, and descriptive link." },
    link: { code: '<a href="/courses/web-design" aria-label="Explore the Web Design course">Explore course</a>', output: "A descriptive link opens the Web Design course." },
    image: { code: '<img src="workshop.webp" alt="Learners building a web page" width="640" height="360">', output: "An informative image has alternative text and intrinsic dimensions." },
    form: { code: '<form action="/subscribe" method="post">\n  <label for="email">Email address</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Join workshop</button>\n</form>', output: "A labeled email form submits a required address with POST." },
    table: { code: '<table>\n  <caption>Workshop schedule</caption>\n  <tr><th scope="col">Session</th><th scope="col">Time</th></tr>\n  <tr><th scope="row">CSS</th><td>10:00</td></tr>\n</table>', output: "A captioned schedule associates row and column headers with each value." },
    semantics: { code: '<main>\n  <article><h1>Workshop notes</h1><p>Practice semantic HTML.</p></article>\n</main>', output: "The main landmark contains a standalone article with a top-level heading." },
  },
  "css-fundamentals": {
    practice: { code: '.course-card {\n  max-width: 34rem;\n  padding: 1.5rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 1rem;\n  box-shadow: 0 8px 24px rgb(15 23 42 / 10%);\n}', output: "The course card has constrained width, spacing, a rounded border, and a soft shadow." },
    selector: { code: '.course-card > a:hover {\n  color: #075985;\n  text-decoration-thickness: 2px;\n}', output: "The direct link in a course card gets a distinct hover treatment." },
    styles: { code: ':root { --workshop-accent: #0f766e; }\n.workshop-title {\n  color: var(--workshop-accent);\n  font-size: clamp(1.5rem, 3vw, 2.25rem);\n}', output: "The title uses a reusable accent color and fluid size with set minimum and maximum values." },
    box: { code: '.workshop-card {\n  box-sizing: border-box;\n  width: min(100%, 32rem);\n  padding: 1.25rem;\n  border: 2px solid #94a3b8;\n}', output: "The card stays within its parent and its declared width includes padding and border." },
    layout: { code: '.workshop-list {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1.25rem;\n}', output: "Workshop cards form as many responsive columns as fit." },
    responsive: { code: '.workshop-page {\n  width: min(100% - 2rem, 72rem);\n  margin-inline: auto;\n}\n@media (max-width: 40rem) { .workshop-page { width: min(100% - 1rem, 72rem); } }', output: "The page stays centered with fluid side spacing that narrows on small screens." },
  },
  "sql-fundamentals": {
    practice: { code: 'SELECT title, duration_minutes\nFROM workshops\nWHERE published = TRUE\nORDER BY duration_minutes ASC;', output: "Published workshops listed from shortest to longest." },
    query: { code: 'SELECT title, duration_minutes\nFROM workshops\nWHERE published = TRUE\nORDER BY duration_minutes ASC;', output: "Published workshops listed from shortest to longest." },
    filter: { code: 'SELECT title, fee\nFROM workshops\nWHERE fee BETWEEN 20 AND 60\n  AND category = \'Design\';', output: "Design workshops with fees from 20 through 60." },
    join: { code: 'SELECT learners.name, workshops.title\nFROM learners\nJOIN registrations ON registrations.learner_id = learners.id\nJOIN workshops ON workshops.id = registrations.workshop_id;', output: "Learner names paired with the titles of their registered workshops." },
    insert: { code: 'INSERT INTO workshops (title, duration_minutes, published)\nVALUES (\'CSS Layout Lab\', 45, TRUE);', output: "Adds the CSS Layout Lab workshop with a 45-minute duration." },
    update: { code: 'UPDATE workshops\nSET published = TRUE\nWHERE title = \'CSS Layout Lab\';', output: "Publishes the selected CSS Layout Lab workshop." },
    aggregate: { code: 'SELECT category, COUNT(*) AS workshop_count, AVG(fee) AS average_fee\nFROM workshops\nGROUP BY category\nORDER BY workshop_count DESC;', output: "Workshop count and average fee for each category." },
    null: { code: 'SELECT title, COALESCE(fee, 0) AS displayed_fee\nFROM workshops\nWHERE fee IS NULL;', output: "Workshops without a stored fee, displayed with a fee of zero." },
  },
  "mysql-fundamentals": {
    practice: { code: 'SELECT title, duration_minutes\nFROM workshops\nWHERE published = TRUE\nORDER BY duration_minutes ASC;', output: "Published workshops listed from shortest to longest." },
    query: { code: 'SELECT title, duration_minutes\nFROM workshops\nWHERE published = TRUE\nORDER BY duration_minutes ASC;', output: "Published workshops listed from shortest to longest." },
    filter: { code: 'SELECT title, fee\nFROM workshops\nWHERE fee BETWEEN 20 AND 60\n  AND category = \'Design\';', output: "Design workshops with fees from 20 through 60." },
    join: { code: 'SELECT learners.name, workshops.title\nFROM learners\nJOIN registrations ON registrations.learner_id = learners.id\nJOIN workshops ON workshops.id = registrations.workshop_id;', output: "Learner names paired with the titles of their registered workshops." },
    insert: { code: 'INSERT INTO workshops (title, duration_minutes, published)\nVALUES (\'CSS Layout Lab\', 45, TRUE);', output: "Adds the CSS Layout Lab workshop with a 45-minute duration." },
    update: { code: 'UPDATE workshops\nSET published = TRUE\nWHERE title = \'CSS Layout Lab\';', output: "Publishes the selected CSS Layout Lab workshop." },
    aggregate: { code: 'SELECT category, COUNT(*) AS workshop_count, AVG(fee) AS average_fee\nFROM workshops\nGROUP BY category\nORDER BY workshop_count DESC;', output: "Workshop count and average fee for each category." },
    null: { code: 'SELECT title, IFNULL(fee, 0) AS displayed_fee\nFROM workshops\nWHERE fee IS NULL;', output: "Workshops without a stored fee, displayed with a fee of zero." },
  },
  "c-fundamentals": {
    practice: { code: 'int main(void) {\n  puts("Course challenge solved");\n  return 0;\n}', output: "Course challenge solved" },
    variables: { code: 'char learner[] = "Asha";\nint score = 87;\nprintf("%s earned %d\\n", learner, score);', output: "Asha earned 87" },
    condition: { code: 'int score = 42;\nif (score >= 60) puts("Pass");\nelse puts("Review");', output: "Review" },
    loop: { code: 'for (int day = 2; day <= 4; day++) {\n  printf("Day %d\\n", day);\n}', output: "Day 2\nDay 3\nDay 4" },
    function: { code: 'int course_total(int price, int seats) {\n  return price * seats;\n}\nprintf("%d\\n", course_total(15, 3));', output: "45" },
    collection: { code: 'int scores[] = {68, 91, 77, 84};\nfor (size_t i = 0; i < 4; i++) {\n  if (scores[i] >= 80) printf("%d\\n", scores[i]);\n}', output: "91\n84" },
  },
  "cpp-fundamentals": {
    practice: { code: 'int main() {\n  std::cout << "Course challenge solved\\n";\n}', output: "Course challenge solved" },
    variables: { code: 'std::string learner = "Asha";\nint score = 87;\nstd::cout << learner << " earned " << score << \'\\n\';', output: "Asha earned 87" },
    condition: { code: 'int score = 42;\nstd::cout << (score >= 60 ? "Pass" : "Review");', output: "Review" },
    loop: { code: 'for (int day = 2; day <= 4; ++day) {\n  std::cout << "Day " << day << \'\\n\';\n}', output: "Day 2\nDay 3\nDay 4" },
    function: { code: 'int courseTotal(int price, int seats) { return price * seats; }\nstd::cout << courseTotal(15, 3);', output: "45" },
    collection: { code: 'std::vector<int> scores{68, 91, 77, 84};\nfor (int score : scores) {\n  if (score >= 80) std::cout << score << \'\\n\';\n}', output: "91\n84" },
  },
  "php-fundamentals": {
    practice: { code: '<?php\necho "Course challenge solved";', output: "Course challenge solved" },
    variables: { code: '<?php\n$learner = "Asha";\n$score = 87;\necho "$learner earned $score";', output: "Asha earned 87" },
    condition: { code: '<?php\n$score = 42;\necho $score >= 60 ? "Pass" : "Review";', output: "Review" },
    loop: { code: '<?php\nfor ($day = 2; $day <= 4; $day++) {\n  echo "Day $day" . PHP_EOL;\n}', output: "Day 2\nDay 3\nDay 4" },
    function: { code: '<?php\nfunction courseTotal(int $price, int $seats): int { return $price * $seats; }\necho courseTotal(15, 3);', output: "45" },
    collection: { code: '<?php\n$scores = [68, 91, 77, 84];\n$passing = array_filter($scores, fn($score) => $score >= 80);\necho implode(", ", $passing);', output: "91, 84" },
    form: { code: '<?php\n$email = filter_var("asha@example.com", FILTER_VALIDATE_EMAIL);\necho $email ? "Valid email" : "Invalid email";', output: "Valid email" },
  },
  "react-fundamentals": {
    practice: { code: 'function WorkshopCard() {\n  return <article><h2>Web Design</h2><p>8 practical lessons</p></article>;\n}', output: "A workshop card renders a title and lesson count." },
    function: { code: 'function WorkshopGreeting({ name }) {\n  return <p>Welcome, {name}!</p>;\n}\n<WorkshopGreeting name="Asha" />', output: "Welcome, Asha!" },
    condition: { code: 'function EnrollmentStatus({ seats }) {\n  return <p>{seats > 0 ? "Available" : "Full"}</p>;\n}', output: "The status shows Available when seats remain and Full otherwise." },
    collection: { code: 'const workshops = ["Forms", "Tables", "Links"];\nconst cards = workshops.map((title) => <li key={title}>{title}</li>);', output: "Three list items are created for Forms, Tables, and Links." },
    form: { code: 'function EmailForm() {\n  const [email, setEmail] = useState("");\n  return <label>Email <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>;\n}', output: "The email field is controlled by React state and updates as the learner types." },
    event: { code: 'function JoinButton() {\n  function handleJoin() { console.log("Joined workshop"); }\n  return <button onClick={handleJoin}>Join workshop</button>;\n}', output: "Clicking Join workshop calls its event handler." },
    object: { code: 'function SeatCounter() {\n  const [seats, setSeats] = useState(3);\n  return <button onClick={() => setSeats((value) => value - 1)}>Seats: {seats}</button>;\n}', output: "The button shows the remaining seat count and decrements it when clicked." },
  },
};

export function getAuthoredChallenge(courseSlug: string, title: string): AuthoredChallenge | undefined {
  return authoredChallenges[courseSlug]?.[topicKey(title)];
}

export function getFreeCourseChallenge(courseSlug: string, kind: LessonKind, title = ""): FreeCourseChallenge {
  const authored = title ? getAuthoredChallenge(courseSlug, title) : undefined;
  if (authored) return authored;
  const courseChallenges = challenges[courseSlug];
  return courseChallenges?.[kind] ?? courseChallenges?.practice ?? {
    code: "// Create a small example for this topic and show its result.",
    output: "Create a small example that demonstrates the lesson topic.",
  };
}

export function getFreeCourseChallengePrompt(courseSlug: string, title: string, kind: LessonKind, languageName: string) {
  const prompts: Partial<Record<LessonKind, string>> = {
    variables: "Create a new learner record with a name and score, then display both values in one clear line.",
    types: "Store a whole-number seat count and a true-or-false availability value, then show their types.",
    numbers: "Calculate the total for four seats at 18 credits each, then subtract a 6-credit discount.",
    strings: "Format the text web design as a title and report its character count.",
    operators: "A learner has 12 credits and spends 5. Show the remaining credits and whether at least 10 were available initially.",
    condition: "A score of 42 is passing at 60. Display Pass or Review using a conditional.",
    loop: "Use a loop to display Day 2, Day 3, and Day 4 on separate lines.",
    function: "Write a reusable courseTotal operation that multiplies a 15-credit price by 3 seats.",
    collection: "Given scores 68, 91, 77, and 84, collect and display only the scores at least 80.",
    object: "Represent a Web Design course with 8 lessons and display its title and lesson count.",
    class: "Create a Badge with the label Complete and display that label from an instance.",
    query: "Query published workshops and list their titles from the shortest duration to the longest.",
    filter: "Find Design workshops whose fee is between 20 and 60, including both endpoints.",
    join: "Pair each learner's name with the title of every workshop they registered for.",
    insert: "Add a published CSS Layout Lab workshop with a duration of 45 minutes.",
    update: "Publish the CSS Layout Lab workshop by matching its title in the update condition.",
    aggregate: "Group workshops by category and report each category's count and average fee.",
    null: "Find workshops with no stored fee and display a zero as the fallback fee.",
    link: "Create a descriptive link to the Web Design workshop page.",
    image: "Add an informative workshop image with alternative text and intrinsic dimensions.",
    form: "Build a required email signup form that submits to /subscribe with POST.",
    table: "Create a workshop schedule table with a caption and associated row and column headers.",
    semantics: "Mark up workshop notes as an article inside the page's main landmark.",
    selector: "Style only a hovered link that is a direct child of a course card.",
    styles: "Define a reusable teal accent and apply a fluid, bounded heading size.",
    box: "Make a card fit its parent while including padding and border in its declared width.",
    layout: "Lay out workshop cards in as many columns as fit, with a 14rem minimum card width.",
    responsive: "Center a fluid workshop page and reduce its side spacing on narrow screens.",
    dom: "Create a workshop card in the document and display its text content.",
    event: "Make a Join workshop button call a handler that announces the action.",
    practice: `Build a fresh ${title.toLowerCase()} example around a workshop catalog. Use the challenge data and produce the result shown in the challenge solution.`
  };
  if (!challenges[courseSlug]?.[kind]) {
    return `Write a separate ${languageName} challenge for ${title.toLowerCase()} using new data and a result different from the lesson example. Use the challenge solution only to check your work.`;
  }
  const task = prompts[kind] ?? `Create a new example that demonstrates ${title.toLowerCase()} using different data from the lesson example.`;
  return `Topic challenge — ${title}: ${task} Keep the solution focused on ${title.toLowerCase()}, use fresh values rather than copying the worked example, and submit the result shown by your program in ${languageName}.`;
}
