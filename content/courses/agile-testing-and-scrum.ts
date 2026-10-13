import { L, mk, q } from "./_helpers";

export default mk({
  slug: "agile-testing-and-scrum", title: "Agile Testing and Scrum", category: "Software Testing", track: "software-testing", level: "Beginner", weeks: 2,
  description: "Learn how testers work inside Scrum teams: testing within sprints, the whole-team approach, the test pyramid, the testing quadrants, acceptance criteria, definition of done and continuous feedback.",
  audience: "Testers and QA engineers joining Agile teams, and developers who want to build quality into every sprint.",
  prereq: "Software Testing Fundamentals and Agile and Scrum (recommended).",
  objectives: ["Describe the tester's role in each Scrum event", "Plan testing inside a two-week sprint", "Use the testing quadrants to balance test types", "Apply the test pyramid to decide where to automate", "Write acceptance criteria that testers can verify", "Contribute to the definition of done and sprint retrospectives"],
  tags: ["Agile Testing", "Scrum", "Test Pyramid", "Testing Quadrants", "QA"], prerequisiteSlugs: ["software-testing-fundamentals", "agile-and-scrum"], relatedSlugs: ["agile-and-scrum", "manual-testing"],
  modules: [
    { title: "Testing in an Agile Team", summary: "Principles and the tester's role.", lessons: [
      L("Agile testing principles and the whole-team approach", 12,
`## How Agile changes testing

In traditional projects testing is a phase after development. In Agile, **testing is an activity that happens continuously** throughout every sprint, and **quality is the responsibility of the whole team**, not only the testers.

## Key principles

- **Continuous testing:** test as soon as a small piece is ready; do not wait for the end of the sprint.
- **Early involvement:** testers join backlog refinement and planning, ask questions and help write acceptance criteria.
- **Whole-team approach:** developers write unit tests, testers explore and automate, product owners clarify behaviour, everyone cares about quality.
- **Fast feedback:** automated checks run on every change; problems are reported within minutes or hours.
- **Collaboration over hand-offs:** talk face to face (or call) instead of throwing tickets over a wall.
- **Working software** is the measure of progress, and it must be tested working software.

## The tester's role

| Activity | Tester contribution |
|---|---|
| Backlog refinement | Ask "how will we test this?", spot ambiguity, suggest acceptance criteria |
| Sprint planning | Estimate testing effort, flag risks and dependencies |
| During the sprint | Test stories as they are completed, pair with developers, automate |
| Sprint review | Help demonstrate and confirm what is done |
| Retrospective | Share quality observations and improvement ideas |

## Shift-left and shift-right

**Shift-left** means testing earlier (reviews, unit tests, static analysis). **Shift-right** means learning from production (monitoring, feature flags, A/B tests, user feedback).

## Practice

Write three questions a tester should ask during refinement of the story "As a user I can filter products by price".`,
        [q("Who is responsible for quality in an Agile team?", ["Only testers", "The whole team", "Only the product owner", "Only managers"], 1, "Quality is a shared responsibility in Agile."), q("Shift-left means:", ["Testing later", "Testing earlier in the cycle", "Ignoring tests", "Releasing faster without tests"], 1, "Shift-left moves quality activities earlier."), q("When should testing of a story begin?", ["After the sprint", "As soon as part of it is ready, and planning starts at refinement", "Only at release", "Never"], 1, "Testing is continuous and begins with refinement.")],
        ["In Agile, testing is continuous and quality belongs to the whole team.", "Like cooking in a team kitchen: everyone tastes as they go instead of one person tasting at the end.", [["Together", "Whole-team quality", "Developers, testers, owner"], ["Early", "Refinement and planning", "Shift-left"], ["Fast", "Automated feedback", "Minutes, not weeks"]], "Agile testers collaborate from refinement to retrospective.", ["Test continuously", "Join refinement", "Fast feedback matters"], "Waiting until the last day of the sprint to start testing."]),
      L("Testing inside a sprint", 14,
`## A two-week sprint, tester's view

**Days 1 to 2: planning.** Review the sprint backlog stories, confirm acceptance criteria, plan test approach, check test data and environment needs.

**Days 2 to 8: build and test together.** As each story is completed (not at the end), the tester:

1. Reads the acceptance criteria and designs a few focused tests.
2. Tests the story on the test environment as soon as it is deployed.
3. Reports defects immediately and talks to the developer.
4. Retests the fix and runs a regression subset.
5. Adds automated checks for the new behaviour.

**Days 9 to 10: stabilise and review.** Run the regression suite, check the definition of done, demo working features, hold the retrospective.

## Avoiding the mini-waterfall

A common anti-pattern is "developers code for 8 days, testers test for 2". This leaves no time to fix bugs and stories roll over. Better practices:

- **Slice stories small** so each can be finished and tested within 1 to 3 days.
- **Developers and testers pair** or at least agree on tests before coding (acceptance test-driven development).
- **Limit work in progress** so stories are finished, not started.
- **Automate regression** so testers have time for exploration.

## Definition of done and testing

A story is Done only when its tests are done: acceptance criteria verified, defects fixed or agreed, regression passed, non-functional checks met, and documentation updated.

## Handling bugs found in the sprint

Small defects in a story under development are fixed immediately without formal tickets. Larger or unrelated defects go to the backlog with a priority from the product owner.

## Practice

Plan the testing activities by day for a sprint that includes a "search by keyword" story and a "reset password" story.`,
        [q("Why is 'developers code for 8 days, testers test for 2' an anti-pattern?", ["It is cheaper", "It leaves no time to fix defects and causes rollover", "It is faster", "It improves quality"], 1, "Late testing compresses defect fixing into too little time."), q("A story is Done when:", ["The code is written", "All acceptance criteria are verified and the definition of done is met", "The tester is on leave", "The sprint ends"], 1, "Done includes tested and verified."), q("Which practice helps avoid a mini-waterfall?", ["Slicing stories small and testing as they finish", "Testing only at the end", "Skipping refinement", "Large stories"], 0, "Small slices let testing happen continuously.")],
        ["Testing in a sprint runs alongside development, story by story.", "Like a relay: each runner hands over quickly rather than waiting for the whole team to finish.", [["Plan", "Criteria and approach", "Days 1 and 2"], ["Test as you go", "Each finished story", "Report and retest fast"], ["Stabilise", "Regression and review", "Final days"]], "Small stories and continuous testing prevent a last-minute crunch.", ["Slice stories small", "Pair and agree tests early", "Automate regression"], "Treating the sprint as development first and testing second."]),
      L("Acceptance criteria and acceptance test-driven development", 13,
`## Acceptance criteria

Acceptance criteria are the conditions a story must meet to be accepted. They should be **specific, testable and agreed** by the product owner, developers and testers.

## Given / When / Then

\`\`\`
Given I am a logged-in member with a saved card
When I place an order of ₹1,200
Then the order is confirmed and a receipt email is sent
\`\`\`

Each scenario describes a **context (Given)**, an **action (When)** and an **expected result (Then)**.

## Writing good criteria

- Use **concrete values**, not "valid" or "quickly".
- Cover **happy path, edge cases and errors**.
- Avoid describing the **implementation** ("use a dropdown"); describe the **behaviour**.
- Keep each criterion **independent** and **small**.

## The Three Amigos

Before a story is built, a business person (product owner), a developer and a tester meet briefly to discuss it: *What does it do? What could go wrong? How will we test it?* The conversation produces examples that become acceptance criteria and tests.

## ATDD and BDD

- **ATDD (Acceptance Test-Driven Development):** write acceptance tests *before* coding; the story is done when they pass.
- **BDD (Behaviour-Driven Development):** express examples in plain language (Given/When/Then) that business and technical people share. Tools such as Cucumber or SpecFlow can run them as automated tests.

## Example refinement result

Story: *As a shopper I can apply a coupon at checkout.* Examples agreed: valid coupon reduces the total; expired coupon shows "Coupon expired"; coupon applies once per order; coupon cannot be combined with another coupon.

## Practice

Write four Given/When/Then criteria for "As a user I can change my password".`,
        [q("What do the Three Amigos discuss?", ["Salaries", "What the story does, what could go wrong and how to test it", "Holiday plans", "Server prices"], 1, "They clarify behaviour and testing before development."), q("Which is a better acceptance criterion?", ["The page loads fast", "Given a cart of 3 items, the total updates within 2 seconds", "Make it nice", "It should work"], 1, "Concrete, testable values make criteria verifiable."), q("ATDD means:", ["Writing acceptance tests before coding", "Deleting tests", "Testing after release", "Designing databases"], 0, "Acceptance tests drive the development of the story.")],
        ["Acceptance criteria are agreed, testable conditions, often written as Given, When, Then.", "Like agreeing the exam questions before the lesson is taught.", [["Discuss", "Three Amigos", "Business, developer, tester"], ["Specify", "Given, When, Then", "Concrete examples"], ["Automate", "ATDD or BDD", "Examples become tests"]], "Shared examples remove ambiguity and become living tests.", ["Use concrete values", "Describe behaviour not implementation", "Agree before coding"], "Accepting vague criteria such as 'the page should be user-friendly'."]),
    ] },
    { title: "Agile Test Strategy", summary: "Pyramid, quadrants and continuous feedback.", lessons: [
      L("The test pyramid", 13,
`## The shape of a healthy test suite

The **test automation pyramid** suggests many fast, cheap tests at the bottom and few slow, expensive tests at the top.

| Layer | Tests | Speed | Cost to maintain | Share |
|---|---|---|---|---|
| **Unit** | Single functions and classes | Milliseconds | Low | Many |
| **Service / API / integration** | Components and APIs working together | Seconds | Medium | Some |
| **UI / end-to-end** | Whole user journeys through the browser | Minutes | High | Few |

## Why a pyramid

- **Fast feedback:** unit tests finish in seconds on every commit.
- **Precise failures:** a failing unit test points to a small area; a failing UI test might fail for ten reasons.
- **Stability:** UI tests are slower and more fragile because of timing, data and layout changes.

## The ice-cream cone anti-pattern

Some teams invert the pyramid: lots of manual and UI tests, few unit tests. Feedback is slow, bugs are found late and automation breaks often. The cure is to **push tests down** to the lowest layer that can detect the risk.

## Decision guide

Ask: *what is the cheapest test that would catch this bug?*

- A calculation error: a unit test.
- A wrong field in an API response: an API test.
- A broken checkout journey across pages: a small number of UI tests.

## Manual testing on top

Manual exploratory testing sits above the pyramid. It finds what automated checks do not anticipate and keeps human judgement in the process.

## Practice

For "apply a coupon at checkout", write which tests belong in the unit, API and UI layers.`,
        [q("Which layer of the pyramid should have the most tests?", ["UI", "Unit", "Manual", "Performance"], 1, "Unit tests are fast, cheap and precise, so there should be many."), q("The 'ice-cream cone' anti-pattern means:", ["Many unit tests and few UI tests", "Many UI and manual tests with few unit tests", "No tests", "Only API tests"], 1, "It is an inverted pyramid with slow and fragile tests dominating."), q("A wrong calculation in a pure function is best caught by:", ["A UI test", "A unit test", "Manual testing only", "A load test"], 1, "The lowest layer that can detect the bug is the best choice.")],
        ["Put most automated tests at the fast, cheap unit level and fewer at the slow UI level.", "Like a building: a wide strong base of small checks, a few big ones on top.", [["Unit", "Many, milliseconds", "Precise failures"], ["API", "Some, seconds", "Components together"], ["UI", "Few, minutes", "Key journeys only"]], "Push each test as low as possible while still catching the risk.", ["Unit tests give fastest feedback", "UI tests are slow and fragile", "Avoid the ice-cream cone"], "Automating everything through the browser and skipping unit tests."]),
      L("The Agile testing quadrants", 13,
`## Four quadrants

Brian Marick's **agile testing quadrants** (popularised by Lisa Crispin and Janet Gregory) classify tests by whether they **support the team or critique the product**, and whether they are **technology-facing or business-facing**.

| Quadrant | Purpose | Examples | Usually |
|---|---|---|---|
| **Q1** Technology-facing, supports the team | Guide design and give fast feedback | Unit tests, component tests | Automated |
| **Q2** Business-facing, supports the team | Confirm the product does what the business needs | Functional tests, story tests, examples, prototypes | Automated and manual |
| **Q3** Business-facing, critiques the product | Find what users and stakeholders would dislike | Exploratory testing, usability testing, user acceptance, A/B | Manual |
| **Q4** Technology-facing, critiques the product | Check qualities of the system | Performance, load, security, reliability, compatibility | Tools and specialists |

## Using the quadrants

- Check **every story and release** for coverage across the quadrants.
- Do not stop at Q1 and Q2: **Q3 and Q4** find different problems (a feature can pass its acceptance tests and still be slow or confusing).
- Decide **what is automated and what is manual**, and who does it.

## Example for a "payment" story

- Q1: unit tests for amount rounding.
- Q2: acceptance tests for each payment method.
- Q3: exploratory session on failures and interruptions; usability review of the payment page.
- Q4: performance test with peak load; security test of the payment form.

## Practice

For a "file upload" story give one test for each quadrant.`,
        [q("Which quadrant contains unit tests?", ["Q1", "Q2", "Q3", "Q4"], 0, "Unit tests are technology-facing and support the team."), q("Exploratory testing and usability testing belong to:", ["Q1", "Q2", "Q3", "Q4"], 2, "They critique the product from a business view and are mostly manual."), q("Performance and security testing belong to:", ["Q1", "Q2", "Q3", "Q4"], 3, "They critique technology qualities and often need tools and specialists.")],
        ["The quadrants sort tests into supporting the team or critiquing the product, technical or business facing.", "Like four lenses: each shows problems the others miss.", [["Q1 and Q2", "Support the team", "Unit and acceptance tests"], ["Q3", "Critique, business-facing", "Exploratory, usability"], ["Q4", "Critique, technical", "Performance, security"]], "Check every release for coverage across all four quadrants.", ["Do not stop at Q1 and Q2", "Mix automated and manual", "Plan Q4 early"], "Assuming passing acceptance tests means the product is ready."]),
      L("Continuous feedback, retrospectives and metrics", 12,
`## Continuous integration and testing

With **continuous integration (CI)**, every change is built and automatically tested within minutes. A failing build is fixed immediately. Typical pipeline stages: build, unit tests, static analysis, API tests, deploy to a test environment, smoke tests, and a nightly or scheduled regression suite.

## Definition of done as a quality gate

The team agrees what Done means, for example: code reviewed, unit tests passing, acceptance criteria verified, no open critical defects, regression green, accessibility check done. **Done is a quality gate**, not an optional list.

## Retrospectives

At the end of each sprint the team inspects how it worked. Testers contribute facts: defects that escaped and why, flaky tests, environment delays, late stories. Choose **one or two improvement actions** with owners and check them next sprint.

## Useful Agile quality metrics

- **Escaped defects** (found after the sprint or in production)
- **Cycle time** from "started" to "Done"
- **Build and test pass rate**, and **flaky test count**
- **Automation coverage of critical flows**
- **Defect age**

## Metrics to avoid

Counting **bugs per tester** or **test cases written per day** rewards the wrong behaviour and damages collaboration. Measure the **team's outcomes**, not individuals.

## Practice

Three defects escaped to production this sprint, all in code without unit tests. Propose two retrospective actions.`,
        [q("What is a quality gate in Agile?", ["An optional guideline", "The team's definition of done that work must meet", "A fence", "A bug report"], 1, "The definition of done acts as a gate before a story counts as finished."), q("Which metric is a poor way to judge individual testers?", ["Bugs found per tester", "Escaped defects by team", "Flaky test count", "Cycle time"], 0, "Counting individual bugs encourages the wrong behaviour."), q("Why run automated tests on every commit?", ["To get fast feedback on problems", "To slow the team", "To avoid reviews", "To hide bugs"], 0, "Fast feedback lets the team fix issues while the change is fresh.")],
        ["Continuous integration, a clear definition of done and honest retrospectives keep quality improving.", "Like a car's dashboard: constant signals so you correct course early.", [["Automate", "CI on every change", "Build and test fast"], ["Gate", "Definition of done", "Quality before Done"], ["Improve", "Retrospective actions", "One or two owned changes"]], "Measure team outcomes and act on lessons every sprint.", ["Fix failing builds immediately", "Treat Done as a gate", "Avoid individual bug counts"], "Using bug counts to rank people instead of improving the team's process."]),
    ] },
  ],
  final: [
    q("Quality in Agile is the responsibility of:", ["The whole team", "Only testers", "Only developers", "Only managers"], 0, "Whole-team approach."),
    q("Shift-left means:", ["Testing earlier", "Testing later", "Skipping tests", "Moving offices"], 0, "Earlier quality activities."),
    q("Which is an anti-pattern?", ["Developers code 8 days, testers test 2", "Slicing stories small", "Testing as stories finish", "Pairing"], 0, "A mini-waterfall."),
    q("A story is Done when:", ["Criteria verified and definition of done met", "Code is written", "The sprint ends", "The tester agrees informally"], 0, "Done includes tested."),
    q("What do the Three Amigos do?", ["Discuss behaviour, risks and tests before building", "Assign blame", "Plan parties", "Estimate salaries"], 0, "They clarify the story."),
    q("Which is a good acceptance criterion?", ["Given a cart of 3 items, the total updates within 2 seconds", "It should be fast", "Make it pretty", "It works"], 0, "Concrete and testable."),
    q("ATDD means:", ["Acceptance tests are written before coding", "Tests are deleted", "Testing after release", "A database design method"], 0, "Acceptance Test-Driven Development."),
    q("The biggest layer of the pyramid is:", ["Unit tests", "UI tests", "Manual tests", "Load tests"], 0, "Many fast unit tests."),
    q("The ice-cream cone anti-pattern is:", ["Many UI and manual tests, few unit tests", "Many unit tests", "No code", "Only API tests"], 0, "An inverted pyramid."),
    q("A wrong calculation is cheapest to catch with:", ["A unit test", "A UI test", "A load test", "A beta test"], 0, "Lowest layer."),
    q("Exploratory testing sits in which quadrant?", ["Q3", "Q1", "Q4", "None"], 0, "Business-facing, critiques the product."),
    q("Performance testing sits in which quadrant?", ["Q4", "Q1", "Q2", "Q3"], 0, "Technology-facing, critiques the product."),
    q("Which are good retrospective inputs from testers? (select all that apply)", ["Escaped defects and causes", "Flaky tests", "Environment delays", "Ranking developers by bug count"], [0, 1, 2], "Facts about the process, not blame."),
    q("Why is bugs-per-tester a poor metric?", ["It rewards quantity and harms collaboration", "It is too accurate", "It is secret", "It is illegal"], 0, "It encourages wrong behaviour."),
    q("Continuous integration provides:", ["Fast feedback on every change", "Slower releases", "Fewer tests", "No builds"], 0, "Automated build and test on each commit."),
  ],
  project: { title: "Capstone: a sprint test plan", brief: "Take three user stories for an app of your choice. For each, write Given/When/Then acceptance criteria, decide which tests belong in each pyramid layer and each quadrant, plan the days of a two-week sprint, and propose a definition of done with at least six items." },
});
