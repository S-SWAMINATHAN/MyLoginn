# Course coverage tracker

Source of truth: `content/courses/*.ts` (validated by `npm run lms:seed -- --dry-run`).
Every course listed as DONE has: full lessons, a narrated-explainer script per lesson, lesson quizzes,
a 15-question final assessment (60% pass mark, 10 drawn per attempt), a capstone, and passes all publish rules.

## DONE (17), Module 1 and 2 starters plus the AI and security foundations
| Module | Course | Lessons | Level / access |
|---|---|---|---|
| 1 | Computer Fundamentals | 6 | Beginner, free |
| 1 | Operating Systems Fundamentals | 6 | Beginner, free |
| 1 / 8 | Networking Fundamentals | 6 | Beginner, free |
| 1 | HTTP, HTTPS, DNS and APIs | 6 | Beginner, free |
| 1 | Command Line and Shell Basics | 6 | Beginner, free |
| 1 / 10 | Agile and Scrum | 8 | Beginner, free |
| 1 / 2 | Software Development Life Cycle (SDLC) | 5 | Beginner, free |
| 1 / 7 | Prompt Engineering Fundamentals | 6 | Beginner, free |
| 1 / 9 | Cybersecurity Fundamentals | 6 | Beginner, free |
| 1 / 8 | Cloud Computing Fundamentals | 5 | Beginner, free |
| 2 | Software Testing Fundamentals | 10 | Beginner, free |
| 2 | Manual Testing | 6 | Beginner, free |
| 2 | Software Testing Life Cycle (STLC) | 6 | Beginner, free |
| 2 | Test Case Design Techniques | 8 | Intermediate, free |
| 2 | Bug Reporting and Defect Life Cycle | 5 | Beginner, free |
| 2 | Agile Testing and Scrum | 6 | Beginner, free |
| 2 | API Testing with Postman | 9 | Beginner, free |

## NOT YET WRITTEN
Everything else in the specification, roughly 200 courses: the rest of Modules 1 and 2 (Windows and Linux, Technical
Documentation, Problem-Solving, AI literacy, Selenium, Playwright, Cypress, Appium, JMeter, Jenkins, Docker for QA and so on),
all of Modules 3 to 10, and every Advanced (paid) course.

Courses that duplicate existing platform courses are intentionally skipped, not re-created: Python, Java, JavaScript,
TypeScript, C, C++, HTML, CSS, React, SQL, MySQL, PostgreSQL, MongoDB, Node.js, Django, PHP, Excel, Git, NumPy, Pandas, DSA, XML,
Bootstrap, jQuery, AngularJS, ASP.NET.

## Advanced (paid) courses
They are authored like any other course and default to a placeholder price of Rs 10,000 (`ADVANCED_DEFAULT_PRICE` in
`content/courses/_helpers.ts`), which the administrator changes per course. The publish rules still reject an Advanced
course whose price is 0.

## Adding a course
Create `content/courses/<slug>.ts` using `mk(...)` and `L(...)` from `_helpers.ts`, run
`npm run lms:seed -- --dry-run` to see the validation result, then `npm run lms:seed -- --publish --yes`.
