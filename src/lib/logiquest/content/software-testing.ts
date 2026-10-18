import type { RawQ, RawSubject } from "../types";
import { m, m2, m3, topic } from "./build";

const basics: RawQ[] = [
  m("What is the main objective of software testing?", ["To find defects and give confidence about quality", "To prove the software has no bugs", "To write the code", "To deploy the software"], "Testing shows the presence of defects, not their absence."),
  m("A human action that produces an incorrect result is called a(n):", ["Error (mistake)", "Defect", "Failure", "Incident"], "An error leads to a defect (bug) in the code, which may cause a failure when executed."),
  m("The 'pesticide paradox' means:", ["Running the same tests repeatedly stops finding new defects", "Tests kill bugs permanently", "More testers find fewer bugs", "Automated tests are always better"], "Tests must be reviewed and updated to keep finding defects."),
  m("Defect clustering means:", ["A small number of modules usually contain most of the defects", "Defects are evenly spread", "Defects appear only in the UI", "Defects cluster in test cases"], "This resembles the Pareto (80/20) principle."),
  m("Verification asks ____, while validation asks ____.", ["'Are we building the product right?'; 'Are we building the right product?'", "'Is it fast?'; 'Is it cheap?'", "'Does it compile?'; 'Does it run?'", "'Who tests?'; 'When to test?'"], "Verification checks against specifications (reviews); validation checks against user needs."),
  m("Static testing involves:", ["Reviewing work products without executing the code", "Running the program with test data", "Load testing", "Unit testing"], "Reviews, walkthroughs, inspections and static analysis are static techniques."),
  m("Why is early testing important?", ["Defects found early are much cheaper to fix", "It replaces later testing", "It requires no planning", "It makes coding unnecessary"], "The cost of fixing a defect grows the later it is found."),
  m("Exhaustive testing is:", ["Impossible except for trivial programs", "Required for every release", "The same as regression testing", "Done by users"], "Risk and test techniques are used to choose a practical subset."),
];

const levels: RawQ[] = [
  m("Testing individual functions or classes in isolation is:", ["Unit testing", "Integration testing", "System testing", "Acceptance testing"], "Unit tests are usually written by developers."),
  m("Testing the interfaces between combined modules is:", ["Integration testing", "Unit testing", "Alpha testing", "Regression testing"], "Integration testing finds interface defects."),
  m("Testing the complete system against requirements is:", ["System testing", "Unit testing", "Component testing", "Smoke testing"], "System testing evaluates end-to-end behaviour."),
  m("Testing by users to decide whether to accept the system is:", ["User acceptance testing (UAT)", "Unit testing", "Integration testing", "White-box testing"], "UAT checks that the system meets business needs."),
  m("Alpha testing is performed:", ["At the developer's site by internal staff or selected users", "By the public after release", "Only by automated tools", "By end users at their own site"], "Beta testing is done by real users in their environment."),
  m("In top-down integration testing, missing lower-level modules are replaced by:", ["Stubs", "Drivers", "Test cases", "Logs"], "In bottom-up integration, drivers call the modules under test."),
  m2("In the V-model, which test level corresponds to requirements analysis?", ["Acceptance testing", "Unit testing", "Integration testing", "Component testing"], "Detailed design ↔ unit, architecture ↔ integration, specification ↔ system, requirements ↔ acceptance."),
];

const types: RawQ[] = [
  m("Re-running tests after a change to check nothing else broke is:", ["Regression testing", "Smoke testing", "Sanity testing", "Exploratory testing"], "Regression tests catch unintended side effects."),
  m("A quick check that the most important functions of a new build work is:", ["Smoke testing", "Regression testing", "Stress testing", "Usability testing"], "Smoke tests decide whether a build is stable enough to test further."),
  m("Testing behaviour under expected peak load is:", ["Load testing", "Stress testing", "Unit testing", "Usability testing"], "Stress testing goes beyond capacity to find the breaking point."),
  m("Which is a non-functional test type?", ["Performance testing", "Equivalence partitioning", "Unit testing of a function's output", "Boundary value analysis"], "Non-functional tests check qualities such as performance, security and usability."),
  m("Testing without scripted test cases, learning while testing, is:", ["Exploratory testing", "Regression testing", "Automated testing", "Static testing"], "It combines learning, test design and execution."),
  m("Retesting means:", ["Running failed tests again to confirm a defect has been fixed", "Running all tests on every build", "Testing a new module", "Testing documents"], "Regression testing checks that nothing else broke."),
  m("Security testing aims to:", ["Find vulnerabilities and check that data and functions are protected", "Measure response time", "Check spelling", "Test hardware"], "e.g. authentication, authorisation and injection flaws."),
];

const blackBox: RawQ[] = [
  m("Black-box techniques are based on:", ["Specifications and requirements, not the code", "The internal code structure", "The database schema only", "Developer opinions"], "The tester treats the system as a black box."),
  m2("A field accepts ages 18 to 60 inclusive. Using two-value boundary value analysis, which values should be tested?", ["17, 18, 60, 61", "18, 39, 60", "0, 18, 60, 100", "17 and 61 only"], "Test each boundary and the value just outside it."),
  m2("A field accepts integers 1 to 100. How many equivalence partitions are there (valid and invalid)?", ["3", "2", "1", "100"], "Below 1 (invalid), 1–100 (valid) and above 100 (invalid)."),
  m("Which technique best tests combinations of conditions and their actions?", ["Decision table testing", "Boundary value analysis", "Statement coverage", "Error guessing"], "Decision tables list condition combinations and expected actions."),
  m("State transition testing is most useful for:", ["Systems whose behaviour depends on their current state, such as an ATM", "Pure calculations", "Spelling checks", "Database indexes"], "It covers valid and invalid transitions between states."),
  m3("A decision table has 3 independent true/false conditions. How many rules does the full table have?", ["8", "6", "3", "9"], "2³ = 8 combinations.", { check: "2**3" }),
];

const whiteBox: RawQ[] = [
  m("White-box testing is based on:", ["The internal structure of the code", "Only the requirements", "The user interface", "User feedback"], "It is also called structural or glass-box testing."),
  m("100% statement coverage means:", ["Every executable statement has run at least once", "Every path has been tested", "Every decision outcome has been tested", "Every requirement has been tested"], "Statement coverage is weaker than decision (branch) coverage."),
  m("Which coverage is stronger?", ["Decision (branch) coverage", "Statement coverage", "They are always equal", "Neither can be measured"], "100% branch coverage guarantees 100% statement coverage, not the reverse."),
  m2("For `if (a > 5) { x = 1; }` with no else, what is the minimum number of tests for 100% decision coverage?", ["2", "1", "3", "4"], "One test must make the condition true and another false.", { check: "2" }),
  m3("A control-flow graph has 9 edges and 7 nodes (one component). What is its cyclomatic complexity?", ["4", "2", "16", "3"], "V(G) = E − N + 2 = 9 − 7 + 2 = 4.", { check: "9-7+2" }),
  m("Cyclomatic complexity gives:", ["The number of independent paths through the code", "Lines of code", "The number of defects", "Execution time"], "It is also the minimum number of tests for basis path coverage."),
];

const management: RawQ[] = [
  m("Which document describes the scope, approach, resources and schedule of testing?", ["Test plan", "Test case", "Bug report", "Requirements specification"], "The test plan is the master planning document for testing."),
  m("A test case typically contains:", ["Preconditions, input data, steps and expected result", "Only the defect description", "Only code", "The project budget"], "Expected results decide pass or fail."),
  m("Entry criteria define:", ["Conditions that must be met before testing starts", "When testing ends", "The test results", "Team members"], "Exit criteria define when testing is complete."),
  m("A traceability matrix maps:", ["Requirements to test cases", "Defects to developers", "Testers to modules", "Builds to releases"], "It shows that every requirement is covered."),
  m("Risk-based testing means:", ["Prioritising tests by likelihood and impact of failure", "Testing only risky users", "Avoiding risky features", "Testing at random"], "High-risk areas are tested first and most thoroughly."),
  m("Which is a typical exit criterion?", ["High-priority defects fixed and agreed coverage achieved", "Testers are tired", "The deadline has passed", "The code has no comments"], "Exit criteria are agreed in the test plan."),
];

const defects: RawQ[] = [
  m("Which is a typical defect life cycle?", ["New → Assigned → Open → Fixed → Retest → Closed", "Closed → Open → New", "Fixed → New → Closed", "Open → Closed → New"], "A defect may also be Rejected, Deferred or Reopened."),
  m("Severity describes ____, while priority describes ____.", ["the defect's impact on the system; how urgently it should be fixed", "how urgently to fix it; its impact", "who found it; who fixes it", "the module; the tester"], "A typo in the company name on the home page may be low severity but high priority."),
  m("Which is high severity but low priority?", ["A crash in a rarely used report that is about to be retired", "A misspelt company name on the home page", "A wrong colour in the footer", "A slow-loading image"], "The impact is serious, but it is not urgent for the business."),
  m("A good defect report should include:", ["Steps to reproduce, expected and actual results, environment and severity", "Only the tester's opinion", "Only a screenshot", "The developer's name"], "Reproducible reports get fixed faster."),
  m("A fixed defect that appears again is marked:", ["Reopened", "Deferred", "Rejected", "Duplicate"], "Deferred means postponed to a later release."),
  m("Defect leakage refers to:", ["Defects that escaped testing and were found after release", "Leaked source code", "Memory leaks only", "Defects found in unit tests"], "Low leakage indicates effective testing."),
];

const automation: RawQ[] = [
  m("Which tool is widely used to automate web browser testing?", ["Selenium", "JIRA", "Git", "Photoshop"], "Selenium WebDriver drives real browsers; Playwright and Cypress are alternatives."),
  m("Which tests are the best candidates for automation?", ["Repetitive regression tests that run often", "One-off exploratory tests", "Usability tests", "Features that change daily"], "Automation pays off for stable, frequently repeated checks."),
  m("Which tools are typical for API testing and load testing respectively?", ["Postman and JMeter", "Selenium and Excel", "Git and Docker", "JIRA and Word"], "Postman tests APIs; JMeter, k6 or Gatling simulate load."),
  m("In the test automation pyramid, which tests should be most numerous?", ["Unit tests", "UI tests", "Manual tests", "Acceptance tests"], "Unit tests are fast and cheap; UI tests are slow and brittle."),
  m("The Page Object Model:", ["Separates page structure and locators from test logic", "Stores pages in a database", "Generates test data", "Replaces assertions"], "It makes UI tests easier to maintain."),
  m("A disadvantage of test automation is:", ["Initial effort and ongoing script maintenance", "Tests run too consistently", "It never finds defects", "It cannot be repeated"], "Scripts break when the application changes."),
];

const agile: RawQ[] = [
  m("In Agile teams, testing is done:", ["Continuously throughout each iteration", "Only at the end of the project", "Only by another company", "Before requirements are written"], "Testers work alongside developers in each sprint."),
  m("TDD (test-driven development) means:", ["Write a failing test, write code to pass it, then refactor", "Testing after deployment", "Documenting all tests before coding", "Testing only the database"], "Red → green → refactor."),
  m("BDD scenarios are usually written as:", ["Given–When–Then", "If–Else–End", "Input–Output–Done", "Start–Stop–Pause"], "Gherkin syntax is used by tools such as Cucumber."),
  m("The Definition of Done in Scrum typically includes:", ["Code reviewed, tests passed and acceptance criteria met", "Code written only", "Developer approval only", "Production deployment at any cost"], "It is the team's shared quality standard."),
  m("Shift-left testing means:", ["Starting testing activities earlier in the life cycle", "Moving testers to another team", "Testing only the left side of the screen", "Delaying testing"], "Earlier testing finds defects when they are cheaper to fix."),
];

const subject: RawSubject = {
  "testing-basics": topic(basics, { intro: "Software testing evaluates a product to find defects and reduce the risk of failure.", formulas: [{ h: "Seven testing principles", points: ["Testing shows the presence of defects, not their absence", "Exhaustive testing is impossible", "Early testing saves time and money", "Defects cluster together", "Beware of the pesticide paradox", "Testing is context dependent", "Absence-of-errors is a fallacy"] }] }),
  "testing-levels": topic(levels, { intro: "Test levels: unit (component), integration, system and acceptance (UAT, alpha, beta). The V-model pairs each development phase with a test level." }),
  "testing-types": topic(types, { intro: "Test types: functional, non-functional (performance, load, stress, security, usability), structural (white-box) and change-related (retesting, regression, smoke, sanity)." }),
  "black-box-techniques": topic(blackBox, { intro: "Black-box techniques derive tests from specifications: equivalence partitioning, boundary value analysis, decision tables, state transition and use-case testing." }),
  "white-box-techniques": topic(whiteBox, { intro: "White-box techniques use the code's structure: statement, decision/branch, condition and path coverage.", formulas: [{ h: "Cyclomatic complexity", points: ["V(G) = E − N + 2P", "V(G) = number of decisions + 1"] }] }),
  "test-management": topic(management, { intro: "Test management covers planning, estimation, monitoring and control: test plans, test cases, entry/exit criteria, traceability and risk-based prioritisation." }),
  "defect-management": topic(defects, { intro: "Defects are logged, triaged by severity and priority, fixed, retested and closed through a defined life cycle." }),
  "automation-testing": topic(automation, { intro: "Test automation uses tools (Selenium, Playwright, Cypress, JUnit, pytest, Postman, JMeter) to run repeatable checks, usually inside a CI pipeline." }),
  "agile-testing": topic(agile, { intro: "Agile testing is continuous and collaborative, using practices such as TDD, BDD and automated regression suites." }),
};
export default subject;
