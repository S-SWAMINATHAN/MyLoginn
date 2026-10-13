import { L, mk, q } from "./_helpers";

export default mk({
  slug: "software-testing-life-cycle", title: "Software Testing Life Cycle (STLC)", category: "Software Testing", track: "software-testing", level: "Beginner", weeks: 2,
  description: "Learn the phases of the Software Testing Life Cycle: requirement analysis, test planning, test case development, environment setup, execution and closure, with entry and exit criteria and the deliverables of each phase.",
  audience: "Aspiring testers, QA analysts and developers who want to understand how professional testing is organised from start to finish.",
  prereq: "Software Testing Fundamentals is recommended.",
  objectives: ["Name the six STLC phases and their deliverables", "Define entry and exit criteria for each phase", "Write the key sections of a test plan", "Prepare a test environment and test data checklist", "Explain how the STLC relates to the SDLC", "Produce a test closure report with metrics"],
  tags: ["STLC", "Test Planning", "Test Process", "QA"], prerequisiteSlugs: ["software-testing-fundamentals"], relatedSlugs: ["software-development-life-cycle", "test-case-design-techniques"],
  modules: [
    { title: "Planning and Preparing Tests", summary: "Phases 1 to 3.", lessons: [
      L("The STLC at a glance", 11,
`## What the STLC is

The **Software Testing Life Cycle (STLC)** is the sequence of testing activities performed during a project. It runs **alongside the SDLC**: testing activities begin as soon as requirements exist, not when coding ends.

## The six phases

| # | Phase | Main question | Key deliverables |
|---|---|---|---|
| 1 | **Requirement analysis** | What can we test? | Testable requirements list, automation feasibility, questions raised |
| 2 | **Test planning** | How, who, when? | Test plan, effort estimate, tools, risks |
| 3 | **Test case development** | What exactly will we run? | Test cases, test data, traceability matrix |
| 4 | **Test environment setup** | Where will we run it? | Ready environment, smoke test result |
| 5 | **Test execution** | What happened? | Executed tests, defect reports, updated matrix |
| 6 | **Test closure** | What did we learn? | Closure report, metrics, lessons learned |

## Entry and exit criteria

Every phase has **entry criteria** (what must exist before it can start) and **exit criteria** (what must be true before it is complete). For example, execution cannot start until the environment is ready and the build passed a smoke test, and it cannot end until the agreed share of tests has run and no critical defects are open.

## Relationship with the SDLC

In Waterfall the STLC phases follow development phases. In Agile the cycle is compressed and repeated every sprint, with planning, design, execution and a short retrospective inside each iteration.

## Practice

For a one-week sprint, write one activity per STLC phase for testing a new "wishlist" feature.`,
        [q("How many main phases does the STLC commonly have?", ["Three", "Six", "Twelve", "One"], 1, "The usual STLC has six phases from requirement analysis to closure."), q("Which are entry criteria for test execution?", ["A ready environment and a build that passed smoke", "A closure report", "Release notes", "Lessons learned"], 0, "Execution needs a ready environment and a stable build."), q("In Agile, the STLC is:", ["Skipped", "Compressed and repeated in every sprint", "Done once at the end", "Done by customers"], 1, "Agile teams run a compact version of each phase every iteration.")],
        ["The STLC is the set of testing phases from analysing requirements to closing the test effort.", "Like a hospital process: assess, plan treatment, prepare, treat, and review the outcome.", [["Prepare", "Analyse and plan", "Requirements, plan, estimate"], ["Build", "Cases, data, environment", "Ready to run"], ["Run and close", "Execute and report", "Defects, metrics, lessons"]], "Each phase has entry and exit criteria and clear deliverables.", ["Testing starts with requirements", "Phases have entry and exit criteria", "Agile repeats it every sprint"], "Starting test execution before the environment and build are ready."]),
      L("Requirement analysis and test planning", 15,
`## Phase 1: requirement analysis

The test team studies the requirements from a **testing point of view**: which are testable, which are unclear, and which need special tools or data.

Typical activities:

- Review requirements, user stories and acceptance criteria
- Identify **types of testing** needed (functional, performance, security, compatibility)
- Raise **questions and defects in the requirements**
- Check **automation feasibility** for repetitive areas
- Create a **Requirement Traceability Matrix (RTM)** skeleton

## Phase 2: test planning

The **test plan** describes the approach and is agreed with stakeholders. Typical sections:

| Section | Content |
|---|---|
| **Scope** | What is tested and what is explicitly out of scope |
| **Objectives** | What the testing must achieve |
| **Approach** | Levels, types, techniques, manual vs automated |
| **Resources** | Roles, people, tools, environments |
| **Schedule and estimates** | Milestones and effort |
| **Entry and exit criteria** | When to start and stop |
| **Risks and mitigation** | What could go wrong and the response |
| **Deliverables** | Plans, cases, reports |
| **Defect process** | Tools, severity and priority definitions |

## Estimation

Common techniques: **work breakdown** (estimate each task and sum), **three-point estimate** (optimistic, most likely, pessimistic: (O + 4M + P) / 6), and **historical data** from similar projects. Always add contingency for retests and blocked time.

## Risk-based planning

Rate each feature by **likelihood of failure** and **impact if it fails**. Test high-risk areas first and deepest, and decide consciously what will receive less testing.

## Practice

Write the scope (in and out) and three risks with mitigations for testing an online grocery app's checkout.`,
        [q("What is the purpose of a Requirement Traceability Matrix?", ["To store passwords", "To link requirements to the tests that cover them", "To estimate salaries", "To list bugs only"], 1, "The RTM shows coverage and helps assess the impact of changes."), q("A three-point estimate with O=4, M=6, P=14 days gives:", ["6", "7", "8", "9"], 1, "(4 + 4*6 + 14) / 6 = 42 / 6 = 7 days."), q("Risk-based testing prioritises features by:", ["Alphabetical order", "Likelihood of failure and impact", "Length of the name", "Developer preference"], 1, "High likelihood and high impact areas get the most testing.")],
        ["Analysis finds what is testable; the plan says how, with whom and by when.", "Like planning a trip: study the map, pick the route, estimate time and prepare for delays.", [["Analyse", "Testable requirements", "Questions and RTM"], ["Plan", "Scope, approach, resources", "Entry and exit criteria"], ["Estimate", "Effort and risks", "Three-point and risk-based"]], "A good plan makes scope, risk and effort visible before any test runs.", ["Out-of-scope items must be stated", "Estimate with ranges", "Test high-risk areas first"], "Writing a test plan that only lists dates and skips scope and risks."]),
      L("Test case development and the RTM", 14,
`## Phase 3: developing test cases

Using the requirements and the plan, the team designs the tests:

1. **Design test conditions** from each requirement.
2. **Apply techniques** such as equivalence partitioning and boundary value analysis.
3. **Write test cases** with ID, preconditions, steps, data, expected results and priority.
4. **Prepare test data**: valid, invalid, boundary and large sets.
5. **Review test cases** with a peer, a developer and a business analyst.
6. **Update the traceability matrix** so every requirement has at least one test.
7. **Select candidates for automation.**

## Test data

Good test data is **realistic, safe and repeatable**. Never copy real customer data into test environments; use masked, anonymised or generated data. Plan data for: normal cases, boundaries, invalid input, large volumes and special characters.

## Traceability matrix example

| Requirement | Description | Test cases | Status |
|---|---|---|---|
| REQ-12 | Reset password by email | TC-31, TC-32, TC-33 | 2 passed, 1 not run |
| REQ-13 | Reset link valid 30 min | TC-34, TC-35 | Not run |

A requirement with no test is a **coverage gap**; a test with no requirement may be unnecessary.

## Peer review checklist

- Does the expected result come from the requirement?
- Are steps clear to a new tester?
- Are negative and boundary cases included?
- Is the data available?
- Is the priority sensible?

## Practice

Write three test cases (ID, steps, data, expected result) for REQ: "An order can be cancelled within 10 minutes of placing it."`,
        [q("Which data should never be copied into a test environment unmasked?", ["Generated names", "Real customer personal data", "Boundary values", "Invalid inputs"], 1, "Real personal data must be masked or replaced by generated data."), q("A requirement with no linked test case shows:", ["Full coverage", "A coverage gap", "A duplicate", "A passed test"], 1, "The RTM highlights untested requirements."), q("Who should review test cases?", ["Nobody", "Peers, developers and analysts", "Only the customer", "Only the manager"], 1, "Reviews with different viewpoints find weak or missing tests.")],
        ["Test cases are designed from requirements with data and reviewed, and traceability shows coverage.", "Like writing exam questions that map to every chapter of the syllabus.", [["Design", "Conditions and cases", "Techniques give coverage"], ["Data", "Safe, realistic", "Masked, boundary, invalid"], ["Trace", "RTM", "Every requirement has tests"]], "Reviewed cases plus a matrix prove nothing important was missed.", ["Use safe test data", "Review cases", "Keep the RTM updated"], "Copying production customer data into the test environment."]),
    ] },
    { title: "Running and Closing Testing", summary: "Phases 4 to 6.", lessons: [
      L("Test environment setup", 12,
`## Phase 4: the test environment

The **test environment** is the hardware, software, network, data and configuration on which tests run. If it differs from production, results may mislead.

## What to prepare

- **Application build** deployed from a known version
- **Database** with the right schema and test data
- **Integrations**: sandbox payment gateways, email catchers, mock services
- **Accounts and roles** for each user type
- **Browsers, devices and operating systems** from the compatibility list
- **Tools**: defect tracker, test management, automation runners, log access
- **Network and security settings** similar to production

## Environment types

| Environment | Purpose |
|---|---|
| **Development** | Developers build and unit test |
| **QA / Test** | Testers execute planned tests |
| **Staging / Pre-production** | Final checks in a production-like copy |
| **Production** | Real users |

## Smoke test the environment

Before execution starts, run a **smoke test**: can you log in, open key pages and reach the database? If not, fix the environment first. A broken environment wastes the team's time and produces false failures.

## Controlling the environment

- Record the **build number** in every test result.
- Control who may redeploy so testers are not surprised mid-run.
- Reset data between runs where needed.
- Keep environment problems separate from product defects in reports.

## Practice

Write an environment readiness checklist of ten items for testing a mobile banking app.`,
        [q("Why smoke test the environment before execution?", ["To avoid wasting time on false failures caused by a broken environment", "To write test cases", "To deploy to production", "To close defects"], 0, "A quick check confirms the environment is usable before real testing starts."), q("Which environment is closest to production and used for final checks?", ["Development", "Staging", "Local laptop", "Backup"], 1, "Staging mirrors production for final verification."), q("Environment problems should be:", ["Reported as product defects", "Tracked separately from product defects", "Ignored", "Hidden"], 1, "Separating them keeps defect metrics accurate.")],
        ["The test environment is where tests run, so it must be stable and production-like.", "Like preparing a kitchen before cooking: ingredients, tools and a working stove.", [["Prepare", "Build, data, accounts", "Integrations and tools"], ["Check", "Smoke test it", "Before executing"], ["Control", "Record build, limit changes", "Separate environment issues"]], "A reliable environment is a precondition for trustworthy results.", ["Match production where it matters", "Smoke test first", "Record the build in results"], "Testing on an environment nobody verified and reporting its problems as product bugs."]),
      L("Test execution and defect management", 13,
`## Phase 5: execution

Testers run the planned tests, compare actual and expected results and record outcomes.

## Typical execution flow

1. Confirm **entry criteria** (environment ready, build deployed, smoke passed).
2. Execute tests in **priority order**.
3. Record each result: **Pass, Fail, Blocked, Not run**.
4. For failures, **log a defect** with steps, data, evidence and severity.
5. **Retest** fixed defects (confirmation testing).
6. Run **regression** to check for side effects.
7. Update the **traceability matrix** and progress report.

## Daily status

Track: tests planned vs executed, pass rate, open defects by severity, blocked tests with reasons, and risks. Share a short daily report so decisions are timely.

## Defect triage

Regularly review new defects with developers and the product owner: confirm validity, severity and priority, and assign owners. Reject duplicates and non-defects with a clear note.

## Handling blocked and flaky tests

- **Blocked:** record the blocker and who is resolving it; do not mark Fail.
- **Flaky (intermittent):** repeat to find the pattern; capture logs; report as intermittent with frequency.

## Exit criteria for execution

Examples: all high-priority tests executed, 95% of planned tests executed, no open critical or high defects, regression passed. If a criterion is not met, report the risk and let stakeholders decide.

## Practice

You have 100 planned tests, 80 executed (70 pass, 8 fail, 2 blocked), 20 not run, and 3 open high defects. Write a three-line status update.`,
        [q("A test cannot run because a dependency is broken. Status?", ["Pass", "Fail", "Blocked", "Deleted"], 2, "Blocked tests cannot run due to another issue."), q("What follows when a defect is marked Fixed?", ["Close immediately", "Confirmation testing and regression", "Delete it", "Ignore"], 1, "Retest the fix, then check for side effects."), q("If an exit criterion is not met, the tester should:", ["Hide it", "Report the risk and let stakeholders decide", "Mark all tests passed", "Stop testing forever"], 1, "Transparent reporting enables informed decisions.")],
        ["Execution runs tests, logs defects, retests fixes and reports progress.", "Like a flight check run: follow the list, record every result and flag anything wrong.", [["Run", "Execute by priority", "Record every result"], ["Report", "Defects and status", "Daily summary"], ["Verify", "Retest and regression", "Check exit criteria"]], "Honest status reporting lets the team decide when the product is ready.", ["Record results accurately", "Retest fixes", "Report unmet exit criteria"], "Marking blocked tests as failed or passed instead of recording the blocker."]),
      L("Test closure and lessons learned", 12,
`## Phase 6: closure

When exit criteria are met (or the release date arrives), the team formally closes testing, records what happened and captures lessons.

## Closure activities

- **Verify deliverables**: all tests, results and defect reports are stored.
- **Confirm defect status**: closed, deferred with agreement, or open with known risk.
- **Archive test assets** (test cases, data, scripts, environment notes) for reuse and regression.
- **Prepare the test closure report.**
- **Hold a retrospective** to learn what to improve.

## Test closure report contents

| Section | Example |
|---|---|
| Scope tested | Checkout, login, search; mobile excluded |
| Execution summary | 420 planned, 410 executed, 392 passed, 14 failed (fixed), 4 deferred |
| Defect summary | 63 found: 2 critical, 9 high; 3 high deferred with approval |
| Coverage | 100% of requirements traced to at least one test |
| Metrics | Defect density, pass rate, defect leakage, effort variance |
| Risks and recommendation | Release with known low-risk issues; monitor payments for 1 week |

## Useful metrics

- **Defect leakage:** defects found after release divided by total defects (lower is better).
- **Defect removal efficiency (DRE):** defects found before release divided by total defects found.
- **Test execution rate and pass rate**
- **Effort variance:** actual versus planned effort.

## Retrospective questions

What went well? What slowed us down? Which defects escaped and why? What should we change next time? Turn answers into 1 to 3 owned actions.

## Practice

Compute DRE if testing found 90 defects before release and 10 more were reported by users in the first month.`,
        [q("Defect leakage measures defects:", ["Found before release", "Found after release relative to the total", "Fixed by developers", "Closed by testers"], 1, "Leakage is the share of defects that escaped to production."), q("Which belongs in a closure report?", ["Execution and defect summaries with risks", "Only a thank-you note", "Passwords", "Source code"], 0, "Closure reports summarise results, coverage and risk."), q("If 90 defects were found before release and 10 after, DRE is:", ["80%", "90%", "10%", "100%"], 1, "DRE = 90 / (90 + 10) = 90%.")],
        ["Closure wraps up testing, archives assets, reports results and captures lessons learned.", "Like finishing a project: hand over deliverables and write down what to do better next time.", [["Wrap", "Verify and archive", "Results, data, scripts"], ["Report", "Summary and risks", "Coverage, defects, metrics"], ["Learn", "Retrospective", "Owned improvement actions"]], "Closure turns one project's experience into the next project's advantage.", ["Archive for reuse", "Report honestly with metrics", "Act on lessons"], "Skipping closure and repeating the same mistakes next release."]),
    ] },
  ],
  final: [
    q("The STLC runs:", ["Only after coding ends", "Alongside the SDLC from requirements onward", "Only in production", "Only in Agile"], 1, "Testing activities begin when requirements exist."),
    q("Which phase produces the test plan?", ["Test planning", "Test closure", "Execution", "Environment setup"], 0, "The plan comes from the planning phase."),
    q("Entry criteria define:", ["When a phase may start", "When it must end", "Who gets a bonus", "Bug severity"], 0, "Entry criteria are the conditions to start."),
    q("Exit criteria define:", ["When a phase may be considered complete", "Which tool to buy", "Who is on leave", "Release notes"], 0, "Exit criteria say when to stop."),
    q("A three-point estimate with O=2, M=5, P=14 is:", ["5", "6", "7", "8"], 1, "(2 + 20 + 14) / 6 = 6."),
    q("The RTM links:", ["Requirements to test cases", "Developers to managers", "Bugs to salaries", "Builds to tools"], 0, "It shows coverage."),
    q("Which test data practice is correct?", ["Use masked or generated data", "Copy raw customer data", "Use only valid data", "Share real passwords"], 0, "Use safe data."),
    q("Before test execution starts the team should:", ["Smoke test the environment", "Write the closure report", "Close all defects", "Archive scripts"], 0, "Check the environment first."),
    q("A test that cannot run because another feature is broken is:", ["Blocked", "Failed", "Passed", "Closed"], 0, "Blocked."),
    q("After a fix is deployed, the tester performs:", ["Confirmation testing then regression", "Nothing", "Only a demo", "A new plan"], 0, "Retest and check side effects."),
    q("Which phase includes a retrospective?", ["Closure", "Planning", "Environment setup", "Analysis"], 0, "Closure captures lessons learned."),
    q("Defect removal efficiency of 45 found before and 5 after release is:", ["80%", "90%", "95%", "50%"], 1, "45 / 50 = 90%."),
    q("Which are STLC phases? (select all that apply)", ["Requirement analysis", "Test planning", "Test closure", "Marketing launch"], [0, 1, 2], "Analysis, planning and closure are STLC phases."),
    q("In Agile, STLC activities are:", ["Compressed and repeated each sprint", "Skipped", "Done once", "Outsourced always"], 0, "Short cycles repeat the phases."),
    q("A good test plan includes:", ["Scope, approach, resources, risks", "Only dates", "Only tool names", "Only a bug list"], 0, "A plan covers scope, approach, resources and risk."),
  ],
  project: { title: "Capstone: STLC pack for a small app", brief: "Choose a small web app. Produce a mini test plan (scope, approach, risks, entry and exit criteria), a traceability matrix for five requirements, ten test cases, an environment checklist and a closure report template with sample numbers." },
});
