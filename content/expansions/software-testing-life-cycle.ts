import { q, topics, type Topic } from "../courses/_helpers";

const analysis: Topic[] = [
  ["STLC phases overview", "The STLC has six phases: requirement analysis, test planning, test case development, environment setup, test execution and test closure. Each has entry criteria, activities, deliverables and exit criteria.", ["Six phases in order", "Entry and exit criteria", "Deliverables per phase"], "Planning produces the test plan; closure produces the closure report.", "Skipping phases under time pressure."],
  ["STLC versus SDLC", "The SDLC covers building the software, while the STLC covers the testing activities inside it. They run in parallel, with testing starting at requirements.", ["Testing starts early", "STLC is part of the SDLC", "Phases map to development phases"], "Requirement analysis for testing runs while design is happening.", "Starting testing only after coding."],
  ["Requirement analysis for testers", "Testers study requirements for testability, ambiguity and missing rules, and note the types of testing needed. Questions raised here prevent later rework.", ["Check testability", "Raise questions", "Identify test types"], "A tester asks what 'fast' means in numbers.", "Waiting for a finished build before reading requirements."],
  ["Testability of requirements", "A testable requirement is specific, measurable and complete so a test can show it is met. Untestable wording should be clarified.", ["Measurable targets", "No vague adjectives", "Clear acceptance criteria"], "Response time under 2 seconds at 500 users.", "Accepting 'user-friendly' as a requirement."],
  ["Entry and exit criteria for analysis", "Entry for analysis is available, baselined requirements; exit is a reviewed list of testable conditions and resolved questions. Criteria keep phases honest.", ["Baselined requirements to start", "Questions resolved to finish", "Record the decision"], "Exit: all open questions answered and RTM drafted.", "Starting analysis on drafts that keep changing."],
  ["Automation feasibility", "During analysis teams judge which areas suit automation, considering stability, repetition and tool support. Not everything should be automated.", ["Stable and repeated areas", "Tool compatibility", "Cost versus benefit"], "Login and checkout regression are good candidates.", "Automating unstable features."],
  ["Requirement traceability matrix", "The RTM links requirements to test cases and defects to show coverage. It starts in analysis and grows through execution.", ["Requirement to tests", "Shows gaps", "Updated continuously"], "REQ-12 -> TC-31, TC-32.", "Building the matrix only at the end."],
  ["Identifying test conditions", "Test conditions are the checkable items derived from requirements, such as boundaries and rules. They feed test design.", ["Derive from requirements", "Cover rules and limits", "Prioritise by risk"], "Condition: a coupon expires after 30 days.", "Missing implicit conditions."],
  ["Requirement review techniques", "Testers use reviews, checklists and questioning to find gaps and conflicts in requirements. Each defect found here is very cheap to fix.", ["Checklists", "Walkthroughs", "Peer review"], "A checklist question: is every rule measurable?", "Treating requirement review as someone else's job."],
  ["Risk analysis in the early phase", "Early risk analysis rates features by likelihood and impact so planning can focus testing where it matters. Risks are revisited as the project evolves.", ["Likelihood and impact", "Involve stakeholders", "Update regularly"], "Payments rated high risk.", "Ignoring risk until the end."],
];

const planning: Topic[] = [
  ["Purpose of a test plan", "A test plan communicates scope, approach, resources, schedule and risks so stakeholders agree before testing begins. It is a living document.", ["Agree before starting", "Updated as things change", "Short enough to be read"], "A two-page plan for a small release.", "A long plan nobody reads."],
  ["Scope and out-of-scope", "The plan states what will be tested and what will not be, with reasons. Explicit exclusions prevent false assumptions.", ["List inclusions", "List exclusions", "Give reasons"], "Mobile web is out of scope for this release.", "Leaving exclusions unspoken."],
  ["Test approach and levels", "The approach describes levels, types, techniques and the balance of manual and automated testing for the project. It follows the organisation's test strategy.", ["Levels and types", "Manual versus automated", "Techniques"], "Unit by developers, API automated, UI exploratory.", "Copying the previous project's approach blindly."],
  ["Resources and roles", "The plan lists people, skills, tools, environments and budget needed. Missing skills become risks with actions.", ["People and skills", "Tools", "Environments"], "Two testers and one automation engineer.", "Planning with imaginary capacity."],
  ["Test schedule and milestones", "Testing tasks are scheduled with dependencies on builds, environments and fixes. Buffers cover retesting and delays.", ["Dependencies on builds", "Buffer for retests", "Milestones"], "Execution starts two days after environment readiness.", "Assuming all tests pass the first time."],
  ["Entry and exit criteria in the plan", "The plan defines when each test phase starts and when testing can stop, such as 95% executed and no open critical defects. Unmet criteria become reported risks.", ["Measurable criteria", "Agreed by stakeholders", "Report unmet ones"], "Exit: no critical defects and regression green.", "Stopping because the date arrived."],
  ["Test estimation techniques", "Common techniques are work breakdown, three-point estimation and use of historical data. Estimates should include contingency.", ["Break down tasks", "(O + 4M + P) / 6", "Use history"], "Optimistic 4, likely 6, pessimistic 14 gives 7 days.", "Giving a single optimistic number."],
  ["Risk-based test planning", "Plans allocate more testing to high-risk areas and less to low-risk ones, and say so openly. It makes trade-offs explicit.", ["Prioritise by risk", "Document trade-offs", "Revisit as needed"], "Deep payment testing, light help-page testing.", "Equal effort for everything."],
  ["Test deliverables and metrics", "The plan lists deliverables such as test cases, daily reports and the closure report, and the metrics to be collected. Choose metrics that support decisions.", ["List deliverables", "Select useful metrics", "Avoid vanity metrics"], "Daily status with executed, passed, failed and blocked counts.", "Measuring things nobody uses."],
  ["Defect management in the plan", "The plan defines the defect tool, severity and priority scales, workflow and triage cadence. Clear rules avoid disputes later.", ["Tool and workflow", "Severity and priority definitions", "Triage schedule"], "Daily triage at 10:00.", "Starting without shared definitions."],
];

const design: Topic[] = [
  ["Designing test cases from requirements", "Each requirement is turned into test conditions and then concrete test cases with steps, data and expected results. Techniques help choose a small, strong set.", ["Condition to case", "Apply techniques", "Review"], "Boundary tests for an age range.", "Writing tests without techniques."],
  ["Test case structure", "A test case has an id, title, requirement link, preconditions, data, steps, expected result and priority. Consistent structure makes tests reviewable and reusable.", ["Id and title", "Steps and data", "Expected result"], "TC-34: expired coupon shows a clear message.", "Missing expected results."],
  ["Positive and negative test cases", "Positive cases confirm the system works with valid input, while negative cases confirm it rejects invalid input safely. A good set has both.", ["Valid input accepted", "Invalid input rejected", "Clear messages"], "Valid and invalid emails on a form.", "Writing only happy-path cases."],
  ["Test data design", "Test data covers valid, invalid, boundary and large cases and is anonymised and repeatable. Plan data for each role and state.", ["Cover categories", "Mask personal data", "Automate setup where possible"], "A set of ten users with different roles.", "Using production data unmasked."],
  ["Test case prioritisation", "Prioritise tests by risk, business value and likelihood of failure so the most important ones run first. Priorities guide smoke and regression suites.", ["High priority first", "Link to risk", "Review each cycle"], "Payment tests are P1.", "Treating all tests as equal."],
  ["Peer review of test cases", "Reviewers check that expected results come from requirements, steps are clear and negative and boundary cases exist. Different viewpoints reveal gaps.", ["Developer and analyst input", "Use a checklist", "Fix before execution"], "A developer notices a missing timeout case.", "Skipping review to start earlier."],
  ["Test suites and test sets", "Tests are grouped into suites such as smoke, regression or feature sets, and ordered for execution. Good grouping saves time.", ["Smoke suite", "Regression suite", "Feature suites"], "A 20-test smoke suite for each build.", "One giant unordered list."],
  ["Reusing and maintaining test cases", "Test cases are reused across releases and updated when requirements change. Retire obsolete tests and keep the matrix current.", ["Update on change", "Retire obsolete tests", "Avoid duplicates"], "Remove tests for a deleted feature.", "Letting old tests rot."],
  ["Test scripts for automation", "Automation candidates are turned into scripts with stable locators or API calls and independent data. Keep scripts maintainable and readable.", ["Stable and independent", "Readable", "Version controlled"], "A script logs in and checks the dashboard.", "Recording scripts that break with every change."],
  ["Exploratory test charters", "Charters are short missions for exploratory sessions that complement scripted tests. They target risks not covered by cases.", ["Mission and time box", "Notes and debrief", "Target risks"], "Explore refunds with unusual orders.", "Exploring with no goal."],
];

const env: Topic[] = [
  ["Test environment purpose", "The test environment gives a controlled place to run tests that resembles production. Differences from production must be known and documented.", ["Production-like", "Controlled", "Documented differences"], "A staging database with masked data.", "Testing on a developer laptop."],
  ["Environment types", "Typical environments are development, QA or test, staging or pre-production and production. Each has a defined purpose and access rules.", ["Development", "QA and staging", "Production"], "Staging mirrors production for final checks.", "Mixing environments."],
  ["Test data setup", "Data for the environment is loaded or generated, masked and reset between cycles where needed. Missing data causes false failures.", ["Load masked data", "Reset when needed", "Version datasets"], "A script resets orders before each run.", "Relying on leftover data."],
  ["Third-party integrations in test", "Payment gateways, email and SMS providers offer sandboxes, or are replaced by mocks. Never charge real cards or message real customers in tests.", ["Use sandboxes", "Mock when needed", "Protect real users"], "A payment sandbox with test cards.", "Using live payment details."],
  ["Configuration and build control", "Know which build and configuration is deployed and who can change it. Record the build in every result.", ["Record build number", "Control deployments", "Track configuration"], "Build 2.4.1 deployed at 09:00.", "Testing an unknown build."],
  ["Environment smoke test", "A quick check that the application and its dependencies are available before execution starts. If it fails, fix the environment first.", ["Login and key pages", "Database reachable", "Integrations responding"], "Log in, open a product, reach the database.", "Starting execution without a check."],
  ["Browsers, devices and OS matrix", "A compatibility matrix lists target browsers, devices and operating systems based on real usage. It guides what the environment must provide.", ["Use analytics", "Prioritise popular combinations", "Include mobile"], "Chrome and Safari on desktop and iOS.", "Choosing combinations by guess."],
  ["Virtualisation and containers for test", "Virtual machines and containers create repeatable, disposable environments quickly. They reduce 'works on my machine' problems.", ["Repeatable setups", "Quick reset", "Isolated runs"], "A container with the app and database for each run.", "Hand-built, unrepeatable environments."],
  ["Environment issues versus product defects", "Failures caused by the environment should be tracked separately so product defect metrics stay accurate. Record and fix them with the environment owners.", ["Separate categories", "Notify owners", "Do not hide them"], "A timeout caused by a down service is an environment issue.", "Logging environment faults as product bugs."],
  ["Access and security in test environments", "Test systems still need access control and masked data. Remove accounts and keys when no longer needed.", ["Least privilege", "Masked data", "Rotate and remove credentials"], "Only the team can open the QA database.", "Leaving test systems open to the Internet."],
];

const execution: Topic[] = [
  ["Test execution flow", "Confirm entry criteria, run tests in priority order, record results and log defects with evidence. Retest fixes and update progress.", ["Priority order", "Record results", "Log defects"], "Run P1 tests first each morning.", "Leaving results unrecorded."],
  ["Recording test results", "Each result records status, build, tester, date, defect id and evidence. Accurate records support reports and audits.", ["Status and build", "Evidence", "Defect link"], "Fail with BUG-210 and a screenshot.", "Marking tests passed without running them."],
  ["Test statuses", "Common statuses are Pass, Fail, Blocked and Not run. Use them consistently so reports are trusted.", ["Pass and Fail", "Blocked has a blocker", "Not run is not a pass"], "Blocked: login is down.", "Using Blocked for tests you simply skipped."],
  ["Defect logging during execution", "Log defects as soon as they are confirmed with steps, expected and actual results and evidence. Check for duplicates first.", ["Log promptly", "Complete reports", "Check duplicates"], "A defect with a recording is logged within minutes.", "Collecting defects to log later."],
  ["Confirmation testing", "After a fix is deployed, re-run the failed test with the same steps and data. Close the defect only if it passes.", ["Same steps", "Same data", "Close after verification"], "TC-34 passes on build 13.", "Closing on a developer's word."],
  ["Regression testing in execution", "Regression runs existing tests to check nothing else broke after changes. Prioritise by risk and automate stable checks.", ["Risk-based selection", "Near the change", "Automate repetition"], "Re-run checkout after a tax change.", "Skipping regression near release."],
  ["Handling blocked tests", "Record the blocker, owner and expected resolution, and report the impact on the schedule. Do not mark blocked tests as failed.", ["Record the blocker", "Escalate", "Retest after resolution"], "Blocked by an unavailable payment sandbox.", "Hiding blocked tests."],
  ["Intermittent and flaky failures", "Repeat several times, capture logs and conditions and report the frequency. Intermittent defects still deserve fixes.", ["Record frequency", "Capture logs", "Look for patterns"], "Fails 2 of 10 attempts under slow network.", "Dismissing it as 'cannot reproduce'."],
  ["Daily status reporting", "A short daily report shows executed, passed, failed, blocked, open defects by severity and risks. Frequent honest updates enable timely decisions.", ["Short and factual", "Include blockers", "Show risks"], "80 of 100 executed, 3 high defects open.", "Reporting only percentages."],
  ["Exit criteria check", "Before ending execution compare results with exit criteria such as executed share, open high defects and regression status. If not met, report the risk.", ["Compare with criteria", "Report gaps", "Decision belongs to stakeholders"], "Two high defects are open, so release is at risk.", "Declaring completion without checking."],
];

const closure: Topic[] = [
  ["Test closure activities", "Closure verifies deliverables, confirms defect status, archives test assets and holds a retrospective. It turns the project into knowledge.", ["Verify deliverables", "Archive assets", "Retrospective"], "Test cases and scripts are stored for the next release.", "Skipping closure after release."],
  ["The test closure report", "The closure report summarises scope, execution results, defects, coverage, metrics, risks and recommendations. It is the final record for stakeholders.", ["Summarise results", "List open risks", "Give a recommendation"], "420 planned, 410 executed, 4 deferred defects.", "Reporting only the pass rate."],
  ["Defect metrics at closure", "Useful metrics include defects by severity, defect density, defect leakage and removal efficiency. Use them to improve processes.", ["Density per module", "Leakage after release", "Removal efficiency"], "DRE is 90% when 90 of 100 defects were found before release.", "Using metrics to blame people."],
  ["Coverage analysis", "Compare tests with requirements and risks to show what was and was not covered. Gaps become recommendations.", ["Requirement coverage", "Risk coverage", "Document gaps"], "Two requirements have no executed tests.", "Claiming full coverage without evidence."],
  ["Lessons learned", "A retrospective asks what went well, what slowed the team and what to change. Turn answers into one to three owned actions.", ["Be specific", "Assign owners", "Follow up next cycle"], "Early environment checks become standard.", "Listing problems without actions."],
  ["Archiving test assets", "Store test cases, data, scripts, environment notes and reports in a controlled place for reuse and audit. Version them.", ["Version control", "Reusable assets", "Audit trail"], "Tests are tagged with the release number.", "Losing test artefacts after the project."],
  ["Release decision support", "Testers provide facts and risks, but the business makes the release decision. A clear recommendation helps.", ["Facts and risks", "Clear recommendation", "Decision by stakeholders"], "Recommend release with two known low risks.", "Hiding concerns to please everyone."],
  ["Post-release monitoring", "After release, watch error rates, support tickets and performance, and feed escaped defects back into tests. This closes the loop.", ["Watch errors", "Analyse escaped defects", "Add regression tests"], "A production bug gets a new regression test.", "Forgetting the product after release."],
  ["Process improvement", "Use metrics and retrospectives to improve planning, design, environments and automation over time. Small steady improvements compound.", ["Measure outcomes", "Try small changes", "Share learning"], "Estimates improve after tracking variance.", "Changing everything at once."],
  ["STLC interview questions", "Interviews ask for phases, deliverables, entry and exit criteria, estimation and closure content. Prepare with a real or sample project.", ["Know each phase", "Give examples", "Explain criteria"], "Describe the deliverables of test planning.", "Reciting phases without examples."],
];

export default {
  slug: "software-testing-life-cycle", weeks: 5, finalDraw: 15,
  objectives: ["Describe each STLC phase with its activities, deliverables and entry and exit criteria", "Write a practical test plan, prepare an environment and produce a closure report"],
  modules: [
    topics("Requirement Analysis Phase", "Understanding what to test.", analysis, [
      q("The STLC runs:", ["In parallel with the SDLC from requirements", "After release", "Only in Agile", "Never"], 0, "Testing starts early."),
      q("A testable requirement is:", ["Specific and measurable", "Vague", "Verbal", "Hidden"], 0, "Measurable."),
      q("The RTM links:", ["Requirements to tests", "Staff to tasks", "Bugs to salaries", "Builds to tools"], 0, "Coverage."),
      q("Automation feasibility asks:", ["Which areas suit automation", "Who is the manager", "Where is the office", "How big is the logo"], 0, "Stable and repeated."),
      q("Questions raised on requirements are:", ["Valuable early testing work", "A waste", "Rude", "Forbidden"], 0, "Cheap fixes."),
    ]),
    topics("Test Planning Phase", "Approach, resources and criteria.", planning, [
      q("A test plan should state:", ["Scope, approach, resources, risks", "Only dates", "Only names", "Only tools"], 0, "Complete plan."),
      q("Exit criteria are:", ["Conditions for completing testing", "Start conditions", "Bug lists", "Test data"], 0, "Completion."),
      q("Three-point estimate O=4, M=6, P=14 gives:", ["7", "6", "8", "9"], 0, "(4+24+14)/6 = 7."),
      q("Risk-based planning allocates:", ["More testing to high-risk areas", "Equal testing", "None to risky areas", "Random testing"], 0, "Prioritise."),
      q("Defect management in the plan defines:", ["Tool, scales, workflow and triage", "Salaries", "Holidays", "Colours"], 0, "Shared rules."),
    ]),
    topics("Test Case Development Phase", "Designing and reviewing tests.", design, [
      q("A test case has an expected result because:", ["It decides pass or fail", "It looks nice", "It is optional", "It is a log"], 0, "Needed."),
      q("Test data should be:", ["Masked or generated and repeatable", "Real and unmasked", "Random each time", "Hidden"], 0, "Safe."),
      q("Prioritise tests by:", ["Risk and business value", "Length", "Alphabet", "Tester age"], 0, "Importance."),
      q("Peer review of tests finds:", ["Gaps and weak expected results", "Hardware faults", "Typos only", "Nothing"], 0, "Quality."),
      q("A charter is for:", ["Exploratory sessions", "Release notes", "Budget", "Hiring"], 0, "Mission."),
    ]),
    topics("Test Environment Setup Phase", "Preparing a reliable place to test.", env, [
      q("A smoke test of the environment checks:", ["Login, key pages, database and integrations", "Only colours", "Only logos", "Only email"], 0, "Readiness."),
      q("Third-party payments in test use:", ["Sandboxes", "Real cards", "Customer accounts", "Cash"], 0, "No live charges."),
      q("Environment faults should be:", ["Tracked separately from product defects", "Logged as bugs", "Ignored", "Hidden"], 0, "Accurate metrics."),
      q("Containers help by:", ["Giving repeatable disposable environments", "Slowing tests", "Removing data", "Deleting code"], 0, "Repeatability."),
      q("A compatibility matrix is based on:", ["Real usage data", "Guesses", "Favourite browser", "Price"], 0, "Analytics."),
    ]),
    topics("Test Execution Phase", "Running tests and tracking results.", execution, [
      q("Blocked means:", ["Cannot run due to another problem", "Failed", "Passed", "Deleted"], 0, "Blocked."),
      q("After a fix you perform:", ["Confirmation then regression", "Nothing", "A new plan", "A demo only"], 0, "Verify."),
      q("An intermittent defect report should include:", ["Frequency and conditions", "Only 'sometimes'", "Nothing", "Blame"], 0, "Data."),
      q("Daily status should show:", ["Executed, passed, failed, blocked and risks", "Only passes", "Only names", "Only dates"], 0, "Honest."),
      q("If exit criteria are unmet:", ["Report the risk", "Hide it", "Mark all passed", "Cancel testing"], 0, "Let stakeholders decide."),
    ]),
    topics("Test Closure Phase", "Reporting, learning and improving.", closure, [
      q("DRE of 45 before and 5 after release is:", ["90%", "80%", "95%", "50%"], 0, "45/50."),
      q("A closure report includes:", ["Results, defects, coverage, risks and recommendation", "Only a thank you", "Passwords", "Source code"], 0, "Final record."),
      q("Lessons learned should become:", ["Owned actions", "Gossip", "Nothing", "Blame lists"], 0, "Improve."),
      q("Who makes the release decision?", ["The business with testers' facts", "The tester alone", "Nobody", "The compiler"], 0, "Business decision."),
      q("Escaped production defects should lead to:", ["New regression tests", "Hiding them", "Less testing", "No action"], 0, "Close the loop."),
    ]),
  ],
  finalQuestions: [
    q("Entry criteria for execution typically include:", ["A ready environment and a smoke-tested build", "A closure report", "Release notes", "Lessons learned"], 0, "Ready to run."),
    q("Which are STLC deliverables? (select all that apply)", ["Test plan", "Test cases", "Closure report", "Marketing brochure"], [0, 1, 2], "Brochure is unrelated."),
    q("A good test plan states what is out of scope because:", ["It prevents false assumptions", "It is required by law", "It shortens the plan", "It hides risk"], 0, "Explicit exclusions."),
    q("The pesticide paradox suggests:", ["Refreshing tests", "Reusing tests forever", "Testing less", "Never reviewing"], 0, "Vary tests."),
    q("Which metric measures defects that reached users?", ["Defect leakage", "Pass rate", "Velocity", "Cycle time"], 0, "Leakage."),
    q("Environment smoke tests should happen:", ["Before execution starts", "After closure", "Never", "Only in production"], 0, "Avoid false failures."),
    q("Configuration management in testing means:", ["Recording and controlling the build and environment", "Choosing colours", "Writing code", "Hiring staff"], 0, "Reproducibility."),
    q("Confirmation testing verifies:", ["A specific fix", "All features", "Performance", "Usability"], 0, "Retest."),
    q("In which phase is the lessons-learned retrospective held?", ["Closure", "Analysis", "Planning", "Environment setup"], 0, "Lessons learned."),
    q("Traceability is built:", ["Starting in analysis and updated through execution", "Only at closure", "Only in planning", "Never"], 0, "Continuous."),
  ],
};
