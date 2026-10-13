import { L, mk, q } from "./_helpers";

export default mk({
  slug: "manual-testing", title: "Manual Testing", category: "Software Testing", track: "software-testing", level: "Beginner", weeks: 3,
  description: "Learn hands-on manual testing: how to read requirements, run functional, regression, smoke and exploratory tests, record results and work like a real QA engineer without any automation tools.",
  audience: "Freshers and career changers preparing for manual QA roles, and developers who want to test like testers.",
  prereq: "Software Testing Fundamentals is recommended.",
  objectives: ["Analyse a requirement and derive testable conditions", "Execute functional, smoke, sanity and regression tests", "Run a time-boxed exploratory testing session with a charter", "Test web forms, search, login and checkout flows thoroughly", "Record execution results and evidence accurately", "Explain what manual testing is best at compared with automation"],
  tags: ["Manual Testing", "QA", "Functional Testing", "Exploratory Testing"], prerequisiteSlugs: ["software-testing-fundamentals"], relatedSlugs: ["bug-reporting-and-defect-life-cycle", "test-case-design-techniques"],
  modules: [
    { title: "Manual Testing in Practice", summary: "What a manual tester does day to day.", lessons: [
      L("What manual testing is and when it fits", 12,
`## Manual testing defined

**Manual testing** means a person executes tests by hand, using the application the way a user would, and compares what happens with what should happen. No scripts drive the application: the tester's eyes, judgement and curiosity do.

## What manual testing is best at

- **Usability and look-and-feel:** is a screen confusing, ugly or hard to use? Humans notice this instantly; scripts do not.
- **Exploratory testing:** discovering unexpected problems by learning the product while testing it.
- **New or changing features:** automating a feature that changes every week wastes effort.
- **One-off checks:** a test you will run only once or twice is cheaper by hand.
- **Complex human judgement:** checking whether a report is understandable or a message sounds right.

## Where manual testing is weak

- **Repetitive regression:** running 500 checks every release by hand is slow, tiring and error-prone. That is where automation helps.
- **Speed and scale:** a person cannot simulate 5,000 users.
- **Consistency:** people skip steps when bored.

## A tester's typical day

1. Read the user story and acceptance criteria for the feature in the current sprint.
2. Write or update test cases for it.
3. Test the new build in the test environment.
4. Report defects with evidence and retest fixes.
5. Run a regression pack before release and update the test report.

## Manual and automation work together

Mature teams automate stable, repetitive, high-value checks and keep manual effort for exploration, usability and new features. A good tester understands both, and manual skills such as test design and risk thinking are what make automation worthwhile.

## Practice

List five checks on a shopping app and mark each as best done manually or best automated, with a reason.`,
        [q("Which task is best suited to manual testing?", ["Running 500 identical regression checks every night", "Judging whether a new screen is easy to understand", "Simulating 5,000 simultaneous users", "Checking an API response format thousands of times"], 1, "Usability judgement needs a human. Repetitive checks and load simulation suit automation."), q("Why is automating a feature that changes weekly often wasteful?", ["Scripts cannot test web pages", "Tests need constant rewriting as the feature changes", "Automation is illegal for new features", "Manual testers refuse"], 1, "Frequent change breaks scripts, so the maintenance cost exceeds the benefit."), q("Manual testing is weakest at:", ["Exploration", "Repetitive large-scale regression", "Usability review", "One-off checks"], 1, "Repeating hundreds of checks by hand is slow and error-prone.")],
        ["Manual testing is a person using the application and judging whether it behaves correctly.", "It is like a food critic: a machine can measure ingredients, but a person judges taste.", [["Human", "Judgement and curiosity", "Usability, exploration"], ["Strength", "New and changing features", "Cheap for one-off checks"], ["Limit", "Repetition at scale", "Automate stable regression"]], "Use people where judgement matters and tools where repetition dominates.", ["Manual testing finds what scripts do not expect", "Automation suits stable repetitive checks", "Good testers use both"], "Thinking manual testing is just clicking randomly without a plan."]),
      L("Analysing requirements to find testable conditions", 14,
`## Start from the requirement

Every test begins with a requirement, user story or design. Before writing a test you must understand what the product should do. Read it three times: once for the big picture, once for details, and once looking for gaps.

## Turning text into test conditions

A **test condition** is something that can be checked. Take this requirement:

> *A user can reset their password by entering their registered email. The system sends a reset link valid for 30 minutes. A link can be used only once.*

Test conditions you can derive:

1. A registered email receives a reset email.
2. An unregistered email shows a safe message and sends nothing.
3. The link works within 30 minutes.
4. The link fails after 30 minutes.
5. The link works once, and a second use is rejected.
6. A new password must meet the password rules.
7. The old password stops working after the reset.

## Questions to ask about every requirement

- **Who** uses it and with what permissions?
- **What are the inputs** and their allowed ranges?
- **What are the outputs** and error messages?
- **What happens on failure**, such as no network or a timeout?
- **What are the limits**, such as length, size, count and time?
- **What is not stated?** Missing rules are often where defects hide.

## Ambiguity is a finding

If a requirement says "fast" or "user-friendly" with no numbers, raise a question. Reviewing requirements is testing: a defect found here costs almost nothing.

## Traceability

Link each test condition back to the requirement ID. Then you can show that every requirement is covered and know which tests to rerun when one changes.

## Practice

Write five test conditions for: "Users can upload a profile photo up to 2 MB in JPG or PNG format."`,
        [q("What is a test condition?", ["A defect report", "Something that can be checked, derived from a requirement", "A tool setting", "A release note"], 1, "Test conditions are checkable items derived from requirements."), q("A requirement says the page must be 'fast'. What should a tester do?", ["Assume one second", "Ask for a measurable target", "Skip it", "Mark it as passed"], 1, "Vague requirements should be clarified with measurable targets."), q("Which is a good question to ask about a requirement?", ["What happens when it fails?", "Who designed the logo?", "Which colour is the manager's car?", "How many tabs are open?"], 0, "Failure behaviour, limits and unstated rules are where defects hide.")],
        ["Analysis means reading a requirement and listing every thing that can be checked.", "Like proofreading a contract: you look for what is stated, what is vague and what is missing.", [["Read", "Understand the requirement", "Three passes"], ["Derive", "List test conditions", "Inputs, outputs, limits, failures"], ["Question", "Clarify gaps", "Ambiguity is a finding"]], "Good tests start from a well-understood, questioned requirement.", ["Derive many conditions from one sentence", "Ask about failures and limits", "Link tests to requirements"], "Writing tests before understanding what the requirement really says."]),
      L("Smoke, sanity and regression testing", 13,
`## Three quick checks with different purposes

| Type | Question it answers | Depth | When |
|---|---|---|---|
| **Smoke** | Is this build stable enough to test at all? | Shallow and wide | Right after each new build |
| **Sanity** | Does this specific change or fix work? | Narrow and focused | After a small change or bug fix |
| **Regression** | Did the change break anything that used to work? | Wide and deeper | Before release and after significant changes |

## Smoke testing

A smoke test checks the **critical functions** only: the app opens, a user can log in, the main page loads, the key transaction starts. If the smoke test fails, the build is rejected and sent back without wasting time on detailed testing. Typical smoke suites are 10 to 30 checks that take minutes.

## Sanity testing

After a developer fixes a bug in the discount calculation, a sanity test checks that **the fix works and nearby behaviour is sensible**: apply the coupon, check the total, and check one or two related paths. It is a narrow, quick check, usually unscripted.

## Regression testing

Changes can break old behaviour in surprising places. Regression testing re-runs **existing tests** to confirm earlier functionality still works. Because regression packs grow, teams prioritise:

1. Tests for the **most important business flows**
2. Tests for **areas near the change**
3. Tests that **failed recently** or are known to be fragile

Regression is the best candidate for automation because it repeats every release.

## Confirmation testing versus regression

After a fix, **confirmation testing (re-test)** runs the failed test again to verify the fix. **Regression testing** checks everything else. Both are needed.

## Example flow for one build

1. A new build is deployed. Run the **smoke** tests (15 minutes).
2. If smoke passes, test the new feature in depth.
3. A bug is fixed: **re-test** it and do a quick **sanity** check around it.
4. Before release, run the **regression** pack.

## Practice

For an online store, list five smoke checks and three regression areas you would prioritise after a change to the tax calculation.`,
        [q("Which test decides whether a new build is stable enough for further testing?", ["Regression", "Smoke", "Usability", "Acceptance"], 1, "Smoke testing is a quick, wide check of critical functions on a new build."), q("A bug fix is verified with a narrow, focused check of that change. This is closest to:", ["Sanity testing", "Load testing", "Smoke testing", "Beta testing"], 0, "Sanity testing narrowly checks a specific change or fix."), q("Re-running existing tests to ensure a change did not break old features is:", ["Confirmation testing", "Regression testing", "Exploratory testing", "Static analysis"], 1, "Regression testing guards against unintended side effects.")],
        ["Smoke checks the build is alive, sanity checks one change, and regression checks nothing else broke.", "Smoke is turning on a TV to see if it powers on; regression is checking all channels still work after an update.", [["Smoke", "Is the build testable?", "Critical paths only"], ["Sanity", "Does this fix work?", "Narrow and quick"], ["Regression", "Did anything break?", "Wide and repeated"]], "Run them in that order on every build to save time and catch problems early.", ["Smoke first", "Sanity after a fix", "Regression before release"], "Skipping the smoke test and wasting hours testing an unusable build."]),
    ] },
    { title: "Exploratory Testing and Real Scenarios", summary: "Testing without a script and testing common features well.", lessons: [
      L("Exploratory testing with charters", 14,
`## Learning and testing at the same time

**Exploratory testing** is simultaneous learning, test design and execution. The tester does not follow a fixed script; instead they explore the application, use what they learn to decide the next test, and record what they find. It is structured, not random.

## Session-based testing

Teams organise exploration into **time-boxed sessions** (usually 45 to 90 minutes) with:

- A **charter**: a one-sentence mission, such as *"Explore the checkout with different payment methods to find ways the order total can become wrong."*
- **Notes** taken while testing (what was tried, what was seen, questions)
- A short **debrief** to share findings and decide next sessions

## Writing a good charter

A charter has a target, a resource or approach, and a purpose: **Explore** <area> **with** <tools or data> **to discover** <risk>.

Example: *Explore the file upload with unusual file types and sizes to discover validation gaps.*

## Heuristics that give ideas

- **CRUD:** create, read, update and delete each type of data.
- **Boundaries:** minimum, maximum, just outside and empty values.
- **Interruptions:** refresh, back button, close the tab, lose the network, log in from two devices.
- **Sequence:** do steps out of order, repeat steps, skip steps.
- **Configuration:** other browsers, screen sizes, languages, time zones.
- **Data:** very long text, special characters, emojis, right-to-left text, spaces only.

## Recording what you do

Keep short notes: *"10:12 uploaded 5 MB PNG: ok. 10:15 uploaded renamed .exe as .png: accepted! (bug)."* Notes make your defects reproducible and show coverage.

## When exploratory testing shines

It is best when requirements are thin, time is short, a feature is new, or scripted tests keep passing but you suspect something is wrong.

## Practice

Write a charter and ten test ideas for the "Forgot password" feature, using at least four of the heuristics above.`,
        [q("What is a charter in exploratory testing?", ["A defect report", "A short mission statement that guides a time-boxed session", "A test script with exact steps", "A release plan"], 1, "A charter gives focus to an exploratory session without prescribing every step."), q("Which is an example of an interruption heuristic?", ["Testing the maximum length of a field", "Pressing the back button during payment", "Reading the requirement", "Checking the colour palette"], 1, "Interruptions such as back, refresh and losing the network reveal state-handling bugs."), q("How long is a typical exploratory session?", ["5 minutes", "45 to 90 minutes", "A full week", "Exactly 8 hours"], 1, "Sessions are time-boxed, commonly 45 to 90 minutes.")],
        ["Exploratory testing means learning the product while testing it, guided by a charter.", "Like exploring a new city with a goal and a notebook, not with a fixed route.", [["Charter", "A mission for the session", "Explore, with, to discover"], ["Test", "Try ideas, follow clues", "Heuristics give ideas"], ["Record", "Notes and debrief", "Make findings reproducible"]], "Exploration is structured: mission, time box, notes and debrief.", ["Write a clear charter", "Take notes as you go", "Use heuristics for ideas"], "Treating exploratory testing as random clicking with no notes."]),
      L("Testing forms, login and search", 15,
`## Forms

Forms are everywhere and full of bugs. For each field consider:

- **Required vs optional:** submit with it empty.
- **Length:** minimum, maximum, one over the maximum.
- **Format:** email, phone, dates, numbers, letters only.
- **Special characters:** quotes, angle brackets, emoji, leading and trailing spaces.
- **Messages:** clear, near the field, helpful, and the entered data is kept.
- **Keyboard and accessibility:** Tab order, Enter to submit, labels readable by screen readers.
- **Double submit:** clicking Submit twice must not create two records.

## Login

| Test | Expected |
|---|---|
| Valid email and password | Logged in, correct landing page |
| Wrong password | Generic error ("Invalid email or password"), no hint about which is wrong |
| Unknown email | Same generic error |
| Empty fields | Validation messages |
| Password masked | Characters hidden; copy disabled or limited as designed |
| Many failed attempts | Account lockout or rate limit as specified |
| Session | Stays logged in per design, logout really ends the session, back button after logout does not show private pages |
| Case and spaces | Email case handling and trimming as specified |

## Search

- **Exact, partial, misspelt and empty** queries
- **Special characters** and very long queries
- **No results:** a helpful message, not an error
- **Sorting and filters:** results change correctly, count matches
- **Pagination:** first, middle, last page, page size, no duplicates across pages
- **Performance:** results appear within the specified time

## Example finding

Searching for "o'brien" returns an error page because the apostrophe is not handled. That is a failure to report with the query, the page and the error message.

## Think like a user and an attacker

Besides normal use, try what a careless or curious person might do: paste a long text, submit twice, use the back button. (Security testing in depth is a separate course.)

## Practice

Write 12 test ideas for a registration form that asks for name, email, password and phone number.`,
        [q("A login attempt with a wrong password should show:", ["The password that was correct", "A generic message such as 'Invalid email or password'", "Which character was wrong", "A blank page"], 1, "A generic message avoids revealing whether the email exists."), q("Why test double-clicking the Submit button?", ["To check the mouse", "To ensure two records or charges are not created", "To test the colour", "It is not useful"], 1, "Duplicate submission is a common defect that can create duplicate orders or payments."), q("When a search has no results the system should:", ["Crash", "Show a helpful 'no results' message", "Show random items", "Log the user out"], 1, "No-result handling should be clear and friendly.")],
        ["Forms, login and search look simple but hide many boundary, error and state problems.", "Like testing a door: try the right key, the wrong key, no key and two people at once.", [["Forms", "Required, length, format", "Messages and double submit"], ["Login", "Valid, invalid, locked", "Session and logout"], ["Search", "Exact, partial, empty", "Filters and pagination"]], "Systematically vary inputs, states and sequences for each common feature.", ["Test invalid as well as valid input", "Check messages and state", "Try odd sequences like double submit"], "Testing only the happy path where the user enters perfect data."]),
      L("Recording results and test evidence", 12,
`## Why records matter

Testing that is not recorded cannot be repeated, audited or trusted. Good records answer: *what did you test, on which build, with what result, and can you prove it?*

## What to record for each test

| Item | Example |
|---|---|
| **Test case ID and title** | TC-CHK-014: Apply valid coupon |
| **Build / version / environment** | Build 2.4.1, QA environment, Chrome 126 |
| **Tester and date** | Asha, 13 Oct |
| **Result** | Pass, Fail, Blocked, Not run |
| **Defect ID** (if failed) | BUG-1042 |
| **Evidence** | Screenshot, recording, log file |
| **Comments** | "Passed after clearing cart; slow response (6 s)" |

## Evidence tips

- Capture **the whole screen** with URL, time and the error visible.
- Use a **short screen recording** for timing, animation or multi-step issues.
- Keep **logs** and the **request and response** of failing API calls.
- **Never store real customer data or passwords** in evidence. Use test data.
- Name files clearly: \`BUG-1042-coupon-total-0.png\`.

## Test execution report

At the end of a cycle, summarise:

- Tests planned, executed, passed, failed, blocked, not run
- Defects found by severity and how many remain open
- **What was not tested and why**
- Risks and your recommendation

## Honest reporting

Never mark a test **Pass** because you ran out of time, and never hide a **Blocked** test. Stakeholders decide using your report, so accuracy matters more than a good-looking number.

## Practice

You executed 40 tests: 32 passed, 5 failed, 2 were blocked and 1 was not run. Write the summary line and two sentences of recommendation.`,
        [q("Which should NOT appear in test evidence?", ["A screenshot with the error", "Test account data", "Real customer passwords", "A log extract"], 2, "Real customer data and passwords must never be stored in evidence."), q("A test cannot run because the login is broken. Its status is:", ["Pass", "Fail", "Blocked", "Skipped silently"], 2, "Blocked means it cannot be executed because of another problem."), q("A good execution report should include:", ["Only passed tests", "What was not tested and the remaining risks", "The tester's lunch time", "Source code"], 1, "Honest reports include gaps and risks so stakeholders can decide.")],
        ["Record what you tested, on which build, the result and the proof, so others can trust it.", "Like a lab notebook: results only count if someone else can repeat them.", [["Record", "ID, build, result", "Every test run"], ["Prove", "Evidence", "Screenshot, video, logs"], ["Report", "Summary and risks", "Including what was not tested"]], "Clear records make testing repeatable and credible.", ["Record build and environment", "Attach safe evidence", "Report gaps honestly"], "Marking tests as passed without really executing them to look finished."]),
    ] },
  ],
  final: [
    q("Which is best suited to manual testing?", ["Nightly regression of 800 checks", "Judging the usability of a new screen", "Simulating thousands of users", "Repeated API validation"], 1, "Usability judgement needs a human."),
    q("A requirement says the system must respond 'quickly'. Best action?", ["Ignore it", "Ask for a measurable target", "Mark it passed", "Assume 10 seconds"], 1, "Clarify vague requirements with numbers."),
    q("What is a test condition?", ["A bug report", "A checkable item derived from a requirement", "A server setting", "A build number"], 1, "It is something that can be tested."),
    q("Which check decides if a build is stable enough to test further?", ["Regression", "Smoke", "Acceptance", "Performance"], 1, "Smoke testing."),
    q("A narrow quick check after a bug fix is called:", ["Sanity testing", "Load testing", "Alpha testing", "Static testing"], 0, "Sanity testing."),
    q("Re-running the failed test to confirm the fix is:", ["Confirmation testing", "Regression testing", "Exploratory testing", "Smoke testing"], 0, "Confirmation (re-testing)."),
    q("What guides an exploratory testing session?", ["A charter", "A 200-step script", "A random number", "The release date"], 0, "A charter states the mission."),
    q("Which are good exploratory heuristics? (select all that apply)", ["Boundaries", "Interruptions", "Sequence changes", "Ignoring notes"], [0, 1, 2], "Boundaries, interruptions and sequence changes reveal defects; ignoring notes does not."),
    q("Wrong password at login should show:", ["Which part was wrong", "A generic invalid credentials message", "The correct password", "Nothing"], 1, "Generic messages avoid leaking information."),
    q("Why test double submit?", ["To check the mouse", "To ensure duplicates are not created", "To test the colour", "No reason"], 1, "Double submission can duplicate orders."),
    q("A search with no results should:", ["Show a helpful message", "Crash", "Log out the user", "Show unrelated data"], 0, "Handle empty results gracefully."),
    q("Which should be recorded for each executed test? (select all that apply)", ["Build and environment", "Result", "Evidence for failures", "The tester's favourite colour"], [0, 1, 2], "Build, result and evidence make testing repeatable."),
    q("A test cannot run due to another broken feature. Status?", ["Pass", "Blocked", "Fail", "Deleted"], 1, "A test that cannot run is Blocked."),
    q("Which belongs in an execution report?", ["What was not tested", "Only good news", "Passwords", "Nothing"], 0, "Gaps and risks."),
    q("Why does manual testing struggle with large regression packs?", ["It is repetitive, slow and error-prone", "It is illegal", "Testers cannot read", "Browsers block it"], 0, "Repetition by hand is costly and unreliable."),
  ],
  project: { title: "Capstone: manual test a live signup flow", brief: "Pick a public website with a signup or contact form. Write 15 test cases (positive, negative, boundary) with expected results, execute them, record results with screenshots, and write a one-page execution report listing what you did not test." },
});
