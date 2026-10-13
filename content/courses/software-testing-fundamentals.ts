import { q, video, type Course } from "./_helpers";

const course: Course = {
  slug: "software-testing-fundamentals",
  title: "Software Testing Fundamentals",
  category: "Software Testing",
  track: "software-testing",
  level: "Beginner",
  description: "Learn what software testing is, why it matters and how testers find defects early. Cover the testing principles, levels, types, test design and the test process that every QA role builds on.",
  longDescription: "This course gives you the vocabulary and the habits of a professional tester. You will learn how errors become failures, how the seven testing principles guide real decisions, how testing is organised into levels and types, and how to design and report tests that a team can trust. It is tool-independent: everything here applies to manual testing, automation and any QA interview.",
  instructor: "MyLoginn Learning Team",
  durationWeeks: 3,
  price: 0,
  tags: ["Software Testing", "QA", "Manual Testing", "Test Design", "Beginner"],
  imageColor: "#2563eb",
  audience: "Students, career changers and junior professionals who want to start a career in software testing or QA, and developers who want to test their own work better.",
  prerequisitesText: "None. You only need basic computer skills and curiosity about how software can fail.",
  objectives: [
    "Explain the difference between an error, a defect and a failure",
    "Apply the seven testing principles to everyday testing decisions",
    "Distinguish test levels and test types and choose the right one for a risk",
    "Write clear test cases with preconditions, steps and expected results",
    "Use equivalence partitioning and boundary value analysis to design efficient tests",
    "Describe the test process and decide when testing can stop",
  ],
  relatedSlugs: ["bug-reporting-and-defect-life-cycle", "agile-and-scrum"],
  modules: [
    {
      title: "Why Software Testing Matters",
      summary: "What testing is, what it is not, and the principles behind it.",
      lessons: [
        {
          title: "What is software testing?",
          minutes: 12,
          summary: "Testing is evaluating software to find defects and judge its quality.",
          explainer: video(
            "Software testing is the activity of checking a product to learn about its quality and to find problems before users do.",
            "A tester is like a building inspector: the inspector does not build the house, but checks it against the plan and the safety rules before anyone moves in.",
            [["Check", "Compare behaviour to expectations", "Does the software do what was agreed?"], ["Find", "Reveal defects early", "Cheaper to fix before release"], ["Inform", "Report quality risks", "Help the team decide"]],
            "Testing finds problems and gives the team information to decide whether the product is ready.",
            ["Testing is more than running the program", "Its goal is information and risk reduction", "It cannot prove there are no bugs"],
            "Believing that testing means 'clicking around until something breaks' instead of planned, repeatable checks.",
          ),
          content: `## Testing in one sentence

**Software testing is the process of evaluating a product to find defects and to provide information about its quality.** A tester asks a simple question again and again: *"What could go wrong here, and how would we know?"*

## What testing includes

Testing is more than running the program and watching the screen. A complete view of testing includes:

- **Planning** what to check and why
- **Designing** test cases from requirements, user stories and risks
- **Executing** those tests and comparing actual results with expected results
- **Reporting** defects and quality information clearly
- **Reviewing** documents and code *without* running them (called static testing)

## Why we test

- **To find defects early.** A mistake found in a requirement costs minutes to fix; the same mistake found by customers after release can cost days, money and trust.
- **To reduce risk.** Payment, health and travel apps can hurt people when they fail.
- **To build confidence.** Evidence from good tests helps managers decide to release.
- **To prevent defects.** Reviewing requirements before coding stops bugs from being written at all.

## What testing is not

> Testing can show that defects are present, but it can never prove that there are none.

Testing is also **not** the same as debugging. A tester finds and reports the failure; a developer finds the cause in the code and fixes it (debugging). Finally, quality is not owned by the testing team alone: developers, analysts and product owners all build quality in.

## A first example

Imagine a form that asks for your age and must accept values from 18 to 60. A tester does not only type 25. They also try 17, 18, 60, 61, an empty field, the letters "abc" and a negative number. Every one of those inputs is a *test* because it has an input and an expected result.

## Practice

Pick any app on your phone. Write down three things that could go wrong and, for each, what you would do to check it. You have just designed your first tests.`,
          quiz: { passPercent: 60, questions: [
            q("Which statement best describes the goal of software testing?", ["To prove the software has no defects", "To find defects and provide information about quality", "To write the code faster", "To replace the requirements document"], 1, "Testing evaluates a product to find defects and to give stakeholders information about its quality. It can never prove the absence of defects."),
            q("Who normally finds the cause of a failure in the code and fixes it?", ["The tester, by testing", "The developer, by debugging", "The customer", "The project sponsor"], 1, "Testers find and report failures; developers debug to locate the cause and fix it. These are different activities."),
            q("Reviewing a requirements document for mistakes before any code exists is an example of:", ["Dynamic testing", "Static testing", "Regression testing", "Load testing"], 1, "Static testing examines work products such as requirements and code without executing the software."),
          ] },
        },
        {
          title: "Errors, defects and failures",
          minutes: 12,
          summary: "How a human mistake turns into a visible failure.",
          explainer: video(
            "A person makes an error, the error puts a defect in the work product, and when that defect is executed it may cause a failure the user can see.",
            "A typo in a recipe is the error; the wrong ingredient written down is the defect; the dish tasting wrong is the failure.",
            [["Error", "Human mistake", "A misunderstanding or slip"], ["Defect", "Fault in the product", "A bug in code or a document"], ["Failure", "Wrong behaviour seen", "Happens when the defect runs"]],
            "Error leads to defect, and a defect leads to failure only when it is executed.",
            ["Errors cause defects", "Not every defect causes a failure", "Failures are what users experience"],
            "Using 'bug', 'error' and 'failure' as if they meant the same thing in a defect report.",
          ),
          content: `## Three words testers use precisely

| Term | Meaning | Example |
|---|---|---|
| **Error (mistake)** | A human action that produces an incorrect result | A developer misreads "greater than" as "greater than or equal to" |
| **Defect (bug, fault)** | An imperfection in a work product that does not meet its requirements | The code uses \`>=\` where \`>\` was specified |
| **Failure** | The software behaving incorrectly when it runs | A discount is applied to an order that should not get it |

The chain is: **error → defect → failure**.

## Not every defect becomes a failure

A defect only causes a failure when the faulty part is executed with the right conditions. A bug in code that nobody ever runs stays hidden. A bug that only appears on the last day of a leap year may sit unseen for years. This is why testers vary their inputs and conditions.

## Where defects come from

Defects can be introduced anywhere in the life of a project, not only in code:

- **Requirements:** an unclear or missing requirement
- **Design:** a flaw in how screens or modules are meant to work together
- **Code:** wrong logic, missing validation, typing mistakes
- **Environment:** a wrong configuration or an unsupported browser version
- **Data:** corrupted or unexpected test data

## False positives and false negatives

A **false positive** is a reported failure that is not really a defect (for example, a test was written wrongly). A **false negative** is a defect that exists but the tests did not detect. Good test design tries to reduce both.

## Root cause

When a failure is analysed, the **root cause** is the earliest action or condition that led to it. If many defects share one root cause (such as vague requirements), fixing the cause prevents a whole family of future defects.

## Practice

A shopping app shows a total of ₹1,000 for two items priced ₹400 and ₹500. Identify the failure, suggest one possible defect, and one possible error that could have produced it.`,
          quiz: { passPercent: 60, questions: [
            q("A developer misunderstands a requirement and writes the wrong condition. What is the misunderstanding called?", ["Failure", "Error", "Defect report", "Test case"], 1, "The human mistake is the error. It leads to a defect in the code, which may later cause a failure."),
            q("A defect exists in code that is never executed. Which statement is true?", ["It will always cause a failure", "It exists but may never cause a failure", "It is not a defect", "It is a false positive"], 1, "A defect only causes a failure when the faulty code runs under suitable conditions."),
            q("A test reports a failure, but the test itself was written incorrectly and the software is fine. This is a:", ["True positive", "False positive", "False negative", "Root cause"], 1, "A false positive is a reported problem that is not a real defect in the software."),
          ] },
        },
        {
          title: "The seven testing principles",
          minutes: 15,
          summary: "Seven ideas that guide good testing decisions.",
          explainer: video(
            "Seven widely accepted principles describe what testing can and cannot do, and they help you plan where to spend your effort.",
            "Like a doctor's rules of thumb: you cannot test everything, so you focus on the most likely and most harmful problems first.",
            [["Limits", "Testing shows presence, not absence", "Exhaustive testing is impossible"], ["Focus", "Early testing and defect clustering", "Most bugs hide in a few places"], ["Context", "Tests wear out and depend on context", "Update tests, choose by risk"]],
            "Use the principles to choose what to test, when to start and how to keep tests useful.",
            ["Start testing early", "Test by risk, not everything", "Refresh tests so they keep finding bugs"],
            "Assuming that because all tests passed, the product has no defects.",
          ),
          content: `## The seven principles

These principles are widely taught in the testing profession (for example in the ISTQB syllabus). They describe how to think, not a process to follow blindly.

### 1. Testing shows the presence of defects, not their absence
Passing tests lower the probability of hidden defects, but they are never proof that the software is correct.

### 2. Exhaustive testing is impossible
Even a simple form with a few fields has billions of input combinations. Instead of testing everything, we use **risk analysis and priorities** to decide what to test and how deeply.

### 3. Early testing saves time and money
Testing activities should start as early as possible, including reviewing requirements. This is often called **"shift left"**. A defect found in requirements is far cheaper than one found in production.

### 4. Defects cluster together
A small number of modules usually contain most of the defects (the Pareto idea: roughly 80% of problems come from 20% of the parts). When you find one bug, look nearby.

### 5. Beware of the pesticide paradox
If you run the same tests again and again, they stop finding new defects, just as insects become resistant to the same pesticide. Review and update tests regularly and add new ones.

### 6. Testing is context dependent
Testing a bank's payment system is different from testing a children's game. Safety-critical software needs more rigour than a marketing page.

### 7. Absence-of-defects fallacy
A product with no known defects can still fail its users if it does not meet their needs. Verifying the software against the specification is not enough if the specification is wrong.

## Using the principles

When a deadline is tight you cannot test everything (principle 2). So you ask: *which features would hurt most if they failed?* (risk), *where have we found bugs before?* (clustering), and *are our tests still catching things?* (pesticide paradox).

## Practice

For an online food-ordering app, list the three areas you would test first and write one sentence on which principle supports each choice.`,
          quiz: { passPercent: 60, questions: [
            q("Why is exhaustive testing considered impossible for most software?", ["Testers are not skilled enough", "There are too many combinations of inputs and conditions", "Developers do not allow it", "Testing tools are expensive"], 1, "The number of input combinations, paths and environments is practically unlimited, so risk and priorities decide what to test."),
            q("Running the same regression tests for years and finding no new defects illustrates:", ["Defect clustering", "The pesticide paradox", "Early testing", "Context dependence"], 1, "Repeating identical tests makes them less effective at finding new defects; tests need regular review and variation."),
            q("Most defects are found in a small number of modules. Which principle is this?", ["Defect clustering", "Absence-of-defects fallacy", "Early testing", "Exhaustive testing"], 0, "Defect clustering says defects concentrate in a few areas, so find those areas and test them more."),
          ] },
        },
        {
          title: "Verification and validation",
          minutes: 10,
          summary: "Building the product right versus building the right product.",
          explainer: video(
            "Verification asks whether we built the product right; validation asks whether we built the right product.",
            "Verification is checking a cake against the recipe; validation is asking the guest whether this is the cake they wanted.",
            [["Verify", "Does it match the spec?", "Reviews, inspections, static checks"], ["Validate", "Does it meet the need?", "Demos, user acceptance"], ["Both", "Needed together", "A correct spec can still be the wrong product"]],
            "Verification checks conformance to specifications; validation checks fitness for the user's real need.",
            ["Verification: built right", "Validation: right product", "You need both"],
            "Treating a passed specification check as proof that users will be satisfied.",
          ),
          content: `## Two different questions

| | **Verification** | **Validation** |
|---|---|---|
| Question | *Are we building the product right?* | *Are we building the right product?* |
| Checks | Work products against their specifications | The product against the users' real needs |
| Typical activities | Reviews, walkthroughs, inspections, static analysis, unit tests | Demonstrations, user acceptance testing, trials with real users |
| When | Throughout development | Often towards the end, and continuously in agile |

## An example

A requirement states: *"The app shall let a user pick a delivery date up to 30 days ahead."* The developers build exactly that.

- **Verification** confirms the app picks dates up to 30 days ahead. It matches the specification.
- **Validation** reveals that customers actually need to order for *specific weekdays every week*. The product conforms to the spec but does not meet the need.

This is why the seventh principle (absence-of-defects fallacy) matters. Both activities are needed.

## Static versus dynamic

- **Static** techniques examine documents and code without running them (reviews, static analysis). They mostly support *verification*.
- **Dynamic** techniques run the software with test inputs (functional tests, performance tests). They support both verification and validation.

## Who does what

Everyone verifies and validates: business analysts review requirements, developers peer-review code, testers run tests, and real users join acceptance trials.

## Practice

Classify each as verification or validation: (a) a team reviews the design document for contradictions, (b) a customer tries a beta version and gives feedback, (c) a tool checks code for unused variables.`,
          quiz: { passPercent: 60, questions: [
            q("Which question does validation answer?", ["Did we follow the coding standard?", "Are we building the right product for the user's need?", "Does the code compile?", "Is the document spelled correctly?"], 1, "Validation checks whether the product meets the real needs of users and stakeholders."),
            q("A team inspects a requirements document for ambiguity. This is mainly:", ["Validation", "Verification", "Load testing", "Acceptance testing"], 1, "Reviewing a work product against quality criteria is verification (and it is static testing)."),
            q("A product matches its specification perfectly but users do not want it. What was missed?", ["Verification", "Validation", "Debugging", "Compilation"], 1, "Verification passed, but validation against real needs failed. The specification itself was wrong."),
          ] },
        },
      ],
    },
    {
      title: "Test Levels and Test Types",
      summary: "Where in the system we test and what quality aspect we test.",
      lessons: [
        {
          title: "Test levels: unit, integration, system, acceptance",
          minutes: 14,
          summary: "Four levels that grow from a single function to the whole product.",
          explainer: video(
            "Test levels group testing by scope, from the smallest piece of code to the finished product in the hands of the customer.",
            "Like testing a car: check each part on a bench, then check how the parts fit together, then drive the whole car, then let the owner test drive it.",
            [["Unit", "One small piece", "Usually done by developers"], ["Integration", "Pieces working together", "Interfaces and data flow"], ["System / Acceptance", "Whole product", "System by testers, acceptance by users"]],
            "Each level has a different scope, owner and goal; together they build confidence from the bottom up.",
            ["Unit tests are small and fast", "Integration tests check interfaces", "Acceptance tests confirm business readiness"],
            "Doing only end-to-end testing and skipping unit and integration tests, so bugs are found late and are hard to locate.",
          ),
          content: `## Levels by scope

Test levels organise testing by **how much of the system is under test**.

### 1. Component (unit) testing
Tests individual functions, classes or modules **in isolation**. Usually written by developers and run automatically in seconds. Failures point directly to a small area of code.

### 2. Integration testing
Tests how components or systems **work together**: do they pass the right data, call each other correctly and handle errors at their interfaces? Two common approaches are testing in small groups step by step (incremental) or putting everything together at once ("big bang", which makes failures hard to locate).

### 3. System testing
Tests the **complete, integrated system** against its requirements in an environment like production. It covers end-to-end behaviour and non-functional aspects such as performance and security. Usually performed by an independent test team.

### 4. Acceptance testing
Confirms the system meets business needs and is ready for use. Forms include:

- **User acceptance testing (UAT)** by real users or customers
- **Operational acceptance** (backup, recovery, maintenance) by operations staff
- **Alpha/Beta testing** with internal or external early users

## The test pyramid idea

Many teams aim for **many fast unit tests, fewer integration tests, and the fewest slow end-to-end tests**. Fast tests give quick feedback; slow, broad tests catch what small tests cannot.

## Example: an online store

- *Unit:* a function that calculates tax returns the right amount.
- *Integration:* the cart module correctly calls the payment module.
- *System:* a tester buys a product from login to order confirmation email.
- *Acceptance:* the business owner confirms the checkout flow matches how customers shop.

## Practice

For a library app, write one example test for each of the four levels.`,
          quiz: { passPercent: 60, questions: [
            q("Which test level checks how modules interact through their interfaces?", ["Unit", "Integration", "Acceptance", "Exploratory"], 1, "Integration testing focuses on the interfaces and interactions between components or systems."),
            q("Who typically performs unit testing?", ["End users", "Developers", "The marketing team", "Auditors"], 1, "Unit tests are usually written and run by the developers who write the code."),
            q("A customer confirms that the delivered system supports their business process. This is:", ["Unit testing", "Integration testing", "Acceptance testing", "Static analysis"], 2, "Acceptance testing confirms the system is ready for business use and meets stakeholder needs."),
          ] },
        },
        {
          title: "Functional and non-functional testing",
          minutes: 14,
          summary: "Testing what the system does and how well it does it.",
          explainer: video(
            "Functional tests check what the system does; non-functional tests check how well it does it, such as speed, security and usability.",
            "A restaurant can serve the dish you ordered (functional) but if it takes two hours or the room is unsafe, the experience still fails (non-functional).",
            [["Functional", "What it does", "Features and business rules"], ["Non-functional", "How well it does it", "Performance, security, usability"], ["Change-related", "Is it still OK?", "Confirmation and regression"]],
            "A good test plan covers features, quality characteristics and the effect of change.",
            ["Functional = behaviour", "Non-functional = quality attributes", "Regression protects against side effects"],
            "Treating performance and security as 'something for later' instead of planning them from the start.",
          ),
          content: `## Test types

A **test type** is a group of tests aimed at a particular quality aspect. The main groups are below.

### Functional testing
Checks **what the system does**: the features and business rules in the requirements. *Example: when a valid coupon is applied, the total drops by the right amount.*

### Non-functional testing
Checks **how well the system behaves**. Common characteristics (from ISO 25010):

- **Performance efficiency** - response time and capacity under load
- **Usability** - ease of learning and use, accessibility
- **Security** - protection from unauthorised access and data leaks
- **Reliability** - stable behaviour over time and recovery from failure
- **Compatibility** - works across browsers, devices and operating systems
- **Maintainability and portability** - how easy it is to change and move

### Change-related testing
- **Confirmation testing (re-testing):** after a defect is fixed, re-run the failed test to confirm it now passes.
- **Regression testing:** re-run existing tests to confirm a change did not break something that worked before.

### White-box testing
Uses the internal structure of the code (for example, making sure every branch of an \`if\` is executed).

## Maintenance testing
Testing done on a system already in production after it is modified, migrated or retired.

## Putting types together

For a login page you might check: valid login works (functional), the page loads in under two seconds with 500 users (performance), passwords are never shown in plain text (security), and it works on a small phone screen (compatibility and usability).

## Practice

Choose a ticket-booking website. Write one functional test and one non-functional test, and say which quality characteristic the second one targets.`,
          quiz: { passPercent: 60, questions: [
            q("Re-running a test to confirm a fixed defect no longer fails is called:", ["Regression testing", "Confirmation testing", "Load testing", "Usability testing"], 1, "Confirmation testing (re-testing) checks that a specific fixed defect is really resolved."),
            q("Which is a non-functional characteristic?", ["Calculating a discount correctly", "Responding within two seconds under load", "Sending an email after signup", "Showing a product list"], 1, "Response time under load is a performance characteristic; the others describe functional behaviour."),
            q("After adding a new payment option, the team re-runs old tests to be sure nothing else broke. This is:", ["Confirmation testing", "Regression testing", "Acceptance testing", "Smoke testing only"], 1, "Regression testing checks that changes have not introduced new defects in existing behaviour."),
          ] },
        },
        {
          title: "Black-box, white-box and experience-based techniques",
          minutes: 14,
          summary: "Three families of test design techniques.",
          explainer: video(
            "Test design techniques fall into three families: black-box uses only the specification, white-box uses the code structure, and experience-based uses the tester's knowledge.",
            "Black-box is testing a vending machine by pressing buttons; white-box is opening it up to check every wire; experience-based is a repair person who knows where these machines usually jam.",
            [["Black-box", "Based on requirements", "Equivalence, boundaries, decision tables"], ["White-box", "Based on code structure", "Statement and branch coverage"], ["Experience", "Based on knowledge", "Error guessing, exploratory"]],
            "Use black-box for behaviour, white-box for code coverage and experience to find what the others miss.",
            ["Black-box needs no code knowledge", "White-box measures coverage", "Exploratory testing combines learning and testing"],
            "Relying on a single technique and assuming it covers everything.",
          ),
          content: `## Why techniques matter

Because exhaustive testing is impossible, we use **test design techniques** to choose a small number of tests that still find many defects.

## 1. Black-box techniques
The tester uses the **specification and behaviour**, not the code. Common techniques:

- **Equivalence partitioning:** group inputs that the system should treat the same and test one from each group
- **Boundary value analysis:** test at the edges of each group, where defects often hide
- **Decision tables:** test combinations of conditions and the resulting actions
- **State transition testing:** test how the system moves between states (for example, an order: placed, paid, shipped, delivered)
- **Use case testing:** test typical user scenarios end to end

## 2. White-box techniques
The tester uses the **internal structure**. Common measures:

- **Statement coverage:** the percentage of code statements executed by tests
- **Branch (decision) coverage:** the percentage of decision outcomes (true and false) executed

100% statement coverage does not guarantee that all decisions were tested, and 100% coverage still does not guarantee correct behaviour.

## 3. Experience-based techniques
These use the tester's skill and intuition:

- **Error guessing:** predict likely mistakes (empty fields, special characters, very long text)
- **Exploratory testing:** simultaneous learning, test design and execution, often time-boxed (a "session") with a goal called a **charter**
- **Checklist-based testing:** use a list of common checks built from experience

## Grey-box testing
Mixes both views: the tester knows some internals (such as the database structure) while testing from the user's side.

## Choosing techniques

There is no single best technique. Start with black-box techniques from the requirements, check coverage with white-box measures where code is available, and finish with exploratory sessions to find what scripted tests missed.

## Practice

For a field that accepts a promo code of 6 to 10 letters, give two error-guessing tests you would try that no specification mentions.`,
          quiz: { passPercent: 60, questions: [
            q("Which technique derives tests from the specification without looking at the code?", ["Statement coverage", "Black-box testing", "Branch coverage", "Code review"], 1, "Black-box techniques work from requirements and behaviour, independent of internal code."),
            q("Testing where learning, design and execution happen together, guided by a charter, is:", ["Boundary value analysis", "Exploratory testing", "Decision table testing", "Unit testing"], 1, "Exploratory testing combines test design and execution with continuous learning, often in time-boxed sessions."),
            q("What does branch coverage measure?", ["The number of defects found", "The share of decision outcomes executed by tests", "The number of testers", "The speed of the application"], 1, "Branch coverage reports how many decision outcomes (true and false) were exercised by the tests."),
          ] },
        },
      ],
    },
    {
      title: "Designing and Running Tests",
      summary: "From test conditions to test cases, the test process and knowing when to stop.",
      lessons: [
        {
          title: "Writing a test case",
          minutes: 14,
          summary: "The anatomy of a clear, repeatable test case.",
          explainer: video(
            "A test case is a set of inputs, conditions and expected results that checks one specific thing in a repeatable way.",
            "A test case is like a recipe card: anyone who follows the same steps with the same ingredients should get the same result.",
            [["Set up", "Preconditions and data", "What must be true before you start"], ["Do", "Steps and inputs", "Exact, numbered, repeatable"], ["Expect", "Expected result", "Decided before you run it"]],
            "Write the expected result before executing so the test is a real check and not a guess.",
            ["One test case checks one idea", "Steps must be repeatable by anyone", "Expected results come from the requirement"],
            "Writing vague steps like 'check login' with no input data and no expected result.",
          ),
          content: `## What makes a good test case

A **test case** contains the information needed to run a test and decide if it passed. A good one is **clear, repeatable, independent and traceable** to a requirement.

## Anatomy of a test case

| Field | Purpose | Example |
|---|---|---|
| **ID** | Unique reference | TC-LOGIN-001 |
| **Title** | What is being checked | Login succeeds with valid credentials |
| **Requirement** | Traceability | REQ-AUTH-01 |
| **Preconditions** | State before the test | User "asha@example.com" exists and is active |
| **Test data** | Inputs to use | Email: asha@example.com, Password: Secret#123 |
| **Steps** | Numbered actions | 1. Open the login page 2. Enter email 3. Enter password 4. Click Log in |
| **Expected result** | What should happen | Dashboard opens and shows "Welcome, Asha" |
| **Actual result / Status** | Filled in when executed | Pass / Fail |

## Rules of thumb

1. **One idea per test case.** If it fails, you know exactly why.
2. **Decide the expected result in advance**, from the requirement, not from what the software happens to do.
3. **Use precise data.** "Enter a valid email" is vague; "asha@example.com" is testable.
4. **Include negative tests**, such as a wrong password and an empty field, not only the happy path.
5. **Keep tests independent** so one failure does not block the rest.

## Positive and negative tests

- *Positive:* valid input should be accepted and produce the correct outcome.
- *Negative:* invalid input should be rejected safely, with a helpful message and without crashing.

## Test condition, test case, test procedure

A **test condition** is something worth testing ("password length limits"). A **test case** turns it into concrete inputs and expected results. A **test procedure** orders several test cases for execution.

## Practice

Write a complete test case (all fields above) for a "Forgot password" link that emails a reset link.`,
          quiz: { passPercent: 60, questions: [
            q("When should the expected result of a test case be decided?", ["After running the test, by observing the software", "Before execution, from the requirement", "Only if the test fails", "By the developer after release"], 1, "Expected results must come from the requirement and be defined before execution; otherwise the test just confirms whatever the software does."),
            q("Which is the best test step wording?", ["Check that login works", "Enter email asha@example.com and password Secret#123, then click Log in", "Try some users", "Test the page"], 1, "Good steps are specific and repeatable, with exact data and actions."),
            q("Entering an empty password and expecting a clear error message is a:", ["Positive test", "Negative test", "Regression suite", "Performance test"], 1, "A negative test checks how the system handles invalid or unexpected input."),
          ] },
        },
        {
          title: "Equivalence partitioning and boundary value analysis",
          minutes: 18,
          summary: "Two techniques that give the most defects for the fewest tests.",
          explainer: video(
            "Equivalence partitioning splits inputs into groups that behave the same, and boundary value analysis tests the edges of those groups, where bugs are most likely.",
            "To check a bridge's weight limit you do not test every weight: you test one typical weight in each zone and then the exact limit and just above and below it.",
            [["Partition", "Group similar inputs", "Valid and invalid ranges"], ["Pick", "One value per group", "Representative test"], ["Boundaries", "Edges of each group", "Min, max and just outside"]],
            "Partition the input range, pick one value from each partition, then add values at and around every boundary.",
            ["Test one value per partition", "Boundaries hide most defects", "Include values just inside and just outside"],
            "Testing only values in the middle of a range and never at the edges.",
            [{ code: "valid range: 18 to 60", explanation: "The requirement says ages from 18 to 60 are accepted." }, { code: "partitions: <18 | 18-60 | >60", explanation: "Three groups: too young (invalid), valid, too old (invalid)." }, { code: "boundary tests: 17, 18, 19, 59, 60, 61", explanation: "Test just below, on and just above each edge." }],
            "17 18 19 59 60 61",
          ),
          content: `## Equivalence partitioning (EP)

Inputs that the system should handle **in the same way** belong to one **equivalence partition**. If one value in a partition works, the others in it are expected to work too, so we test **one representative per partition**.

**Example:** a form accepts ages from **18 to 60**.

| Partition | Range | Valid? | Example value |
|---|---|---|---|
| Too young | 17 or less | Invalid | 10 |
| Eligible | 18 to 60 | Valid | 35 |
| Too old | 61 or more | Invalid | 75 |

Three tests (10, 35, 75) cover all three partitions instead of testing every age. Also consider non-numeric partitions such as an empty value or text.

## Boundary value analysis (BVA)

Defects often appear **at the edges** of partitions, for example when a developer writes \`age > 18\` instead of \`age >= 18\`. BVA tests the **boundary values** and their neighbours.

For the range 18 to 60 the common two-value-per-boundary set is:

- Lower boundary: **17** (invalid) and **18** (valid)
- Upper boundary: **60** (valid) and **61** (invalid)

The three-value approach also adds the value just inside: **17, 18, 19** and **59, 60, 61**.

## Combining both

1. Identify the requirement and the input ranges.
2. Draw the partitions (valid and invalid).
3. Choose one value per partition (EP).
4. Add boundary values for each edge (BVA).
5. Write the expected result for every value.

## Worked result

Using three-value BVA for 18 to 60 gives six tests: **17, 18, 19, 59, 60, 61** with expected results: reject, accept, accept, accept, accept, reject.

## Common mistakes

- Forgetting invalid partitions
- Using only the middle value of a range
- Not testing both ends of the range
- Mixing partitions so one test covers two ideas

## Practice

A discount applies to orders from ₹500 to ₹2,000 inclusive. List the partitions and the six boundary values you would test.`,
          quiz: { passPercent: 60, questions: [
            q("A field accepts values from 1 to 100. Which set contains the boundary values (two per boundary)?", ["0, 1, 100, 101", "1, 50, 100", "10, 20, 30", "0, 50, 101"], 0, "The boundaries are 1 and 100: test just outside (0 and 101) and on the edge (1 and 100)."),
            q("Equivalence partitioning reduces the number of tests because:", ["Only invalid values are tested", "Values in a partition are expected to behave alike, so one represents the group", "Boundaries are skipped", "Tests are randomly selected"], 1, "All values in a partition should be handled the same, so one representative value per partition is enough."),
            q("A discount applies to orders from ₹500 to ₹2,000 inclusive. Which value is on the upper boundary?", ["1,999", "2,000", "2,500", "500"], 1, "2,000 is the highest valid value, so it is the upper boundary; 2,001 is the first invalid value."),
          ] },
          challenge: {
            title: "List the boundary values",
            language: "python",
            difficulty: "easy",
            statement: "A field accepts whole numbers from a minimum to a maximum (inclusive). Read one line containing the minimum and maximum separated by a space, and print the six three-value boundary test values in this order, separated by single spaces: min-1, min, min+1, max-1, max, max+1.\n\nExample: for input '18 60' print '17 18 19 59 60 61'.",
            starterCode: "line = input()\nlow, high = map(int, line.split())\n# print the six boundary values separated by spaces\n",
            tests: [
              { input: "18 60", expected: "17 18 19 59 60 61", hidden: false },
              { input: "1 100", expected: "0 1 2 99 100 101", hidden: false },
              { input: "500 2000", expected: "499 500 501 1999 2000 2001", hidden: true },
            ],
            checks: [],
            hints: ["Use int() on both values so you can do arithmetic.", "Build a list with low - 1, low, low + 1, high - 1, high, high + 1.", "Join the list with spaces using ' '.join(map(str, values))."],
            solutionCode: "line = input()\nlow, high = map(int, line.split())\nvalues = [low - 1, low, low + 1, high - 1, high, high + 1]\nprint(' '.join(map(str, values)))",
            solutionExplanation: "Boundary value analysis picks the value just outside, on, and just inside each edge. We compute the six values from the minimum and maximum and print them separated by spaces.",
            points: 20,
          },
        },
        {
          title: "The test process and reporting results",
          minutes: 14,
          summary: "Planning, designing, executing and reporting, and knowing when to stop.",
          explainer: video(
            "The test process has planning, analysis, design, implementation, execution and completion activities, and results are reported so stakeholders can decide.",
            "Like a flight check: plan what to inspect, run the checklist, record what you found and only then declare the plane ready.",
            [["Plan", "Scope and approach", "What, how, who, when"], ["Execute", "Run and record", "Compare actual with expected"], ["Report", "Share the facts", "Coverage, defects, risks"]],
            "Testing ends when exit criteria are met, and the report gives decision makers the facts.",
            ["Plan, design, execute, report", "Exit criteria say when to stop", "Reports must be factual and clear"],
            "Stopping because time ran out without telling anyone what was not tested.",
          ),
          content: `## The test process

Testing is a set of activities, not a single step. Names vary by organisation, but the main activities are:

1. **Test planning** - define objectives, scope, approach, resources, schedule and risks
2. **Test monitoring and control** - compare progress with the plan and take corrective action
3. **Test analysis** - decide *what* to test from requirements and risks (test conditions)
4. **Test design** - decide *how* to test: create test cases and test data
5. **Test implementation** - prepare the environment, organise tests into suites and sequences
6. **Test execution** - run tests, compare actual with expected results and log incidents
7. **Test completion** - archive test assets, review lessons learned, report results

## Entry and exit criteria

- **Entry criteria** say when testing may *start* (for example: build deployed, test environment ready, test cases reviewed).
- **Exit criteria** say when testing may *stop* (for example: all high-priority tests executed, no open critical defects, 95% of planned tests passed).

Without agreed exit criteria, testing either never ends or ends arbitrarily.

## Test execution statuses

Typical statuses: **Pass**, **Fail**, **Blocked** (cannot run because of another problem) and **Not run**.

## Test summary report

A good summary report lets managers decide, and typically contains:

- Scope tested and what was **not** tested
- Number of tests planned, executed, passed, failed and blocked
- Defects found by severity, and how many remain open
- Risks and recommendations (for example, "release with known minor issues" or "do not release")

## Metrics that help (and ones that mislead)

Useful: test progress, defect density by module, defect trend. Misleading: counting the *number* of tests or defects as a measure of a tester's performance.

## Traceability

Link each requirement to the tests that cover it. This shows coverage and tells you which tests to rerun when a requirement changes.

## Practice

Write three exit criteria you would propose for a small website release, and one sentence on what you would say in the report if one criterion was not met.`,
          quiz: { passPercent: 60, questions: [
            q("What do exit criteria define?", ["When testing may begin", "When testing may stop", "Who writes the code", "How many testers are required"], 1, "Exit criteria are the agreed conditions that must be met before testing is considered complete."),
            q("A test cannot be run because the login feature it depends on is broken. Its status is:", ["Pass", "Fail", "Blocked", "Skipped by design"], 2, "A blocked test cannot be executed because of an unresolved problem elsewhere."),
            q("Which item belongs in a good test summary report?", ["Only the tests that passed", "What was not tested, defects by severity and remaining risks", "The tester's personal opinion about developers", "The source code"], 1, "A report should show scope, results, open defects and risks, including what was not covered, so stakeholders can decide."),
          ] },
        },
      ],
    },
  ],
  finalAssessment: {
    title: "Software Testing Fundamentals: final assessment",
    timeLimitMinutes: 30,
    questionCount: 12,
    cooldownMinutes: 0,
    questions: [
      q("Which best defines software testing?", ["Writing production code", "Evaluating a product to find defects and provide quality information", "Fixing defects in code", "Designing the database"], 1, "Testing evaluates the product to find defects and to inform stakeholders about quality."),
      q("A developer misreads a requirement and writes wrong logic, which later makes the app show the wrong total. Which is the failure?", ["The developer's misunderstanding", "The wrong condition in the code", "The wrong total shown to the user", "The requirement document"], 2, "The failure is the incorrect behaviour observed when the software runs. The misunderstanding is the error and the wrong condition is the defect."),
      q("Which statement about testing is true?", ["Passing tests prove that no defects exist", "Testing can show the presence of defects but not their absence", "Testing can be exhaustive for simple programs", "Testing is the same as debugging"], 1, "The first testing principle: testing shows the presence of defects, never their absence."),
      q("Starting test activities during requirements review, long before coding ends, is an example of:", ["The pesticide paradox", "Early testing (shift left)", "Defect clustering", "Absence-of-defects fallacy"], 1, "Early testing finds defects when they are cheapest to fix."),
      q("The team finds many defects in the payment module and decides to test it more. Which principle supports this?", ["Defect clustering", "Exhaustive testing", "Context dependence", "Absence-of-defects fallacy"], 0, "Defects tend to cluster in a small number of modules, so focus extra attention there."),
      q("A requirements review checks documents against standards without running software. This is:", ["Dynamic testing", "Static testing", "Load testing", "Acceptance testing"], 1, "Static testing examines work products without executing code."),
      q("Which statement distinguishes verification from validation?", ["Verification checks the right product; validation checks the product right", "Verification checks conformance to specifications; validation checks it meets real user needs", "They are identical", "Validation is only done by developers"], 1, "Verification: building the product right. Validation: building the right product."),
      q("Which test level typically uses stubs and drivers to test a module in isolation?", ["Acceptance", "Unit (component)", "System", "Operational"], 1, "Component (unit) testing isolates a module, often replacing dependencies with stubs and drivers."),
      q("An end-user group confirms the delivered system supports their daily work. Which level is this?", ["Unit testing", "Integration testing", "Acceptance testing", "Static analysis"], 2, "Acceptance testing confirms readiness for business use."),
      q("Which are non-functional test types? (select all that apply)", ["Performance testing", "Usability testing", "Checking a discount calculation", "Security testing"], [0, 1, 3], "Performance, usability and security are quality characteristics. Checking a calculation is functional testing."),
      q("After a defect fix, the team re-runs all tests of related features to ensure nothing else broke. This is:", ["Confirmation testing", "Regression testing", "Smoke testing only", "Exploratory testing"], 1, "Regression testing checks for unintended side effects of changes."),
      q("Which technique is white-box?", ["Equivalence partitioning", "Boundary value analysis", "Branch coverage measurement", "Decision table testing"], 2, "Branch coverage uses the internal structure of the code, so it is a white-box measure."),
      q("A tester explores the app for 60 minutes with a goal written in advance, taking notes as they learn. This is:", ["Scripted regression testing", "Exploratory testing with a charter", "Static analysis", "Unit testing"], 1, "Exploratory testing is time-boxed learning, design and execution, guided by a charter."),
      q("Which is the best expected result for a login test?", ["It should work", "Dashboard opens and shows the user's name", "No errors anywhere", "Looks good"], 1, "A good expected result is specific and observable."),
      q("A field accepts whole numbers 10 to 50. Which set contains the two-value boundary values?", ["9, 10, 50, 51", "10, 30, 50", "1, 25, 100", "9, 30, 51"], 0, "Test just outside and on each edge: 9 and 10, 50 and 51."),
      q("With equivalence partitioning for the same field (10 to 50), how many partitions are there including invalid ones?", ["1", "2", "3", "5"], 2, "Below 10 (invalid), 10 to 50 (valid) and above 50 (invalid)."),
      q("Which are good practices when writing test cases? (select all that apply)", ["One main idea per test", "Expected result decided in advance", "Vague steps so testers can improvise", "Include negative tests"], [0, 1, 3], "Clear, focused, repeatable tests with predefined results and negative cases are good practice; vague steps are not."),
      q("What do exit criteria describe?", ["The conditions that must be met to consider testing complete", "The team's lunch schedule", "The programming language", "The number of bugs developers may create"], 0, "Exit criteria define when it is acceptable to stop testing."),
      q("A test is marked Blocked. What does that mean?", ["It passed", "It failed because of a defect in the tested feature", "It cannot be executed because of another problem", "It was deleted"], 2, "Blocked means execution is prevented by an unresolved issue, such as a broken dependency."),
      q("Running the same unchanged tests for years finds no new bugs although defects may remain. Which principle?", ["Pesticide paradox", "Early testing", "Defect clustering", "Context dependence"], 0, "The pesticide paradox: repeated identical tests stop finding new defects."),
    ],
  },
  projects: [
    {
      title: "Capstone: test a real website",
      brief: "Choose a public website or app (for example an online store). Write 10 test cases (with preconditions, data, steps and expected results) covering at least two partitions and two boundaries, run them, and write a short test summary report listing what you did not test. Share a link to your document or repository.",
      rubric: "Clear test cases, boundary and partition coverage, honest report of results and untested areas.",
      kind: "project",
      required: false,
    },
  ],
};

export default course;
