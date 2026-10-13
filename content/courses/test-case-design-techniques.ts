import { L, mk, q, pyChallenge } from "./_helpers";

export default mk({
  slug: "test-case-design-techniques", title: "Test Case Design Techniques", category: "Software Testing", track: "software-testing", level: "Intermediate", weeks: 3,
  description: "Master black-box test design: equivalence partitioning, boundary value analysis, decision tables, state transition testing, use case testing and pairwise ideas, plus experience-based and white-box coverage.",
  audience: "Testers who know the basics and want to design fewer, stronger tests; QA candidates preparing for interviews that ask for worked examples.",
  prereq: "Software Testing Fundamentals and some manual testing practice.",
  objectives: ["Apply equivalence partitioning and boundary value analysis to numeric and text inputs", "Build and reduce a decision table from business rules", "Draw a state transition diagram and derive test cases", "Derive tests from use cases and user stories", "Calculate statement and branch coverage for a small program", "Choose the right technique for a given situation"],
  tags: ["Test Design", "Boundary Value Analysis", "Decision Table", "State Transition", "ISTQB"], prerequisiteSlugs: ["software-testing-fundamentals"], relatedSlugs: ["manual-testing", "bug-reporting-and-defect-life-cycle"],
  modules: [
    { title: "Input-Based Techniques", summary: "Partitions, boundaries and rule combinations.", lessons: [
      L("Equivalence partitioning in depth", 14,
`## The idea

An **equivalence partition** is a set of inputs that the system should treat the same way. Testing one value from a partition is expected to represent them all, so tests drop from hundreds to a handful.

## Steps

1. List each **input** and its rule.
2. Split the input domain into **valid and invalid partitions**.
3. Choose **one representative value** per partition.
4. Cover **valid partitions together where possible** but test **each invalid partition separately** so one failure cannot hide another.

## Worked example: delivery charge

Rule: orders under ₹500 pay ₹50 delivery; ₹500 to ₹1,999 pay ₹20; ₹2,000 and above are free; the order value must be a positive amount.

| Partition | Range | Valid? | Representative | Expected |
|---|---|---|---|---|
| Invalid low | 0 or negative | No | -10 | Error message |
| Small | 1 to 499 | Yes | 250 | ₹50 |
| Medium | 500 to 1,999 | Yes | 1,200 | ₹20 |
| Large | 2,000 and up | Yes | 3,500 | ₹0 |
| Invalid type | letters | No | "abc" | Error message |
| Empty | blank | No | (empty) | Error message |

## Non-numeric partitions

Partitions are not only numbers: user roles (admin, member, guest), file types (JPG, PNG, PDF, EXE), countries, date ranges and states of an object are all partitionable.

## Common mistakes

- Forgetting **invalid** and **empty** partitions
- Putting two ideas into one partition
- Choosing values at the edges only (that is boundary analysis, next lesson)

## Practice

A coupon code field accepts 6 to 10 uppercase letters or digits. List at least six partitions with one value each.`,
        [q("How should invalid partitions be tested?", ["All in one test", "Each invalid partition in its own test", "Not at all", "Only the largest"], 1, "Separate tests prevent one failure from masking another."), q("A delivery rule has three valid ranges plus negative and non-numeric input. How many partitions are there to test?", ["2", "3", "5", "10"], 2, "Three valid ranges plus invalid-low and invalid-type partitions give at least five."), q("A good representative value from a partition is:", ["Any value inside it", "Only the boundary", "A value outside it", "Always zero"], 0, "Any value in the partition should behave the same, so one is enough.")],
        ["Group inputs that behave the same and test one from each group.", "Like sampling one spoonful from a well-mixed soup instead of drinking the pot.", [["Partition", "Valid and invalid groups", "Same behaviour inside"], ["Pick", "One value per group", "Invalid ones separately"], ["Expect", "Result for each group", "From the requirement"]], "Equivalence partitioning gives wide coverage with few tests.", ["Include invalid and empty partitions", "Test invalid partitions separately", "One representative is enough"], "Testing only valid inputs and never the invalid partitions."]),
      L("Boundary value analysis in depth", 15,
`## Why boundaries

Programmers often make off-by-one mistakes: \`>\` instead of \`>=\`, or counting from zero. Tests at the **edges** of partitions catch these.

## Two-value and three-value BVA

For an ordered range with minimum **min** and maximum **max**:

- **Two-value:** min-1, min, max, max+1 (for each boundary: one on, one just outside)
- **Three-value:** min-1, min, min+1, max-1, max, max+1

## Example

A password length must be 8 to 16 characters.

| Test value | Length | Expected |
|---|---|---|
| 7 characters | min - 1 | Rejected |
| 8 characters | min | Accepted |
| 9 characters | min + 1 | Accepted |
| 15 characters | max - 1 | Accepted |
| 16 characters | max | Accepted |
| 17 characters | max + 1 | Rejected |

## Boundaries are not only numeric

- **Dates:** the last day of a month, 29 February, year end, daylight saving changes.
- **Text length:** empty, one character, maximum, maximum plus one.
- **Counts:** zero items, one item, the maximum allowed in a cart.
- **Sizes:** a file exactly at the limit (2 MB) and one byte over.
- **Time:** a session expiring exactly at 30 minutes.

## Combine with partitions

Use equivalence partitioning to find the groups, then boundary analysis to pick the edge values of each group.

## Practice

A scholarship needs a score between 60 and 90 inclusive. List the six three-value boundary tests and the expected result of each.`,
        [q("For a range 1 to 100, the two-value boundary tests are:", ["0, 1, 100, 101", "1, 50, 100", "2, 99", "0, 50, 101"], 0, "Just outside and on each edge: 0 and 1, 100 and 101."), q("Which bug does BVA mainly catch?", ["Colour mistakes", "Off-by-one errors in conditions", "Network outages", "Slow servers"], 1, "BVA targets comparison and counting mistakes at edges."), q("A file limit is 2 MB. Which test is a boundary?", ["A 1 MB file", "A file exactly 2 MB and one 2 MB + 1 byte", "A 10 GB file only", "No file"], 1, "Test exactly at the limit and just over.")],
        ["Test at the edges of each partition, where off-by-one errors live.", "Like testing a weight limit sign: check the limit itself and one step either side.", [["Edges", "Min and max", "On and just outside"], ["Three-value", "Add the inside neighbours", "min+1 and max-1"], ["Beyond numbers", "Dates, sizes, counts", "Last day, limit, zero"]], "Edge values find the bugs that middle values miss.", ["Test on and around each boundary", "Apply to dates, sizes and counts", "Pair with partitions"], "Testing only the middle of a range."]),
      L("Decision table testing", 16,
`## When to use it

When the outcome depends on a **combination of conditions**, a decision table lists every combination and its result, so no rule is forgotten.

## Building a table

1. List the **conditions** (inputs, true or false).
2. List the possible **actions** (outputs).
3. Enumerate **combinations**: with *n* binary conditions there are 2^n rules.
4. Fill in the **action** for each rule from the requirement.
5. **Merge** rules where a condition does not matter ("-").

## Example: loan discount

Requirement: *A customer gets a 10% discount if they are a member AND the order is above ₹1,000. A coupon gives an extra 5% but only to members.*

| Rule | Member | Order > ₹1,000 | Coupon | Discount |
|---|---|---|---|---|
| 1 | Yes | Yes | Yes | 15% |
| 2 | Yes | Yes | No | 10% |
| 3 | Yes | No | Yes | 5% |
| 4 | Yes | No | No | 0% |
| 5 | No | Yes | Yes | 0% (coupon rejected) |
| 6 | No | Yes | No | 0% |
| 7 | No | No | Yes | 0% |
| 8 | No | No | No | 0% |

Rules 5 to 8 can be merged as **Member = No** with any order and coupon: discount 0%. That reduces eight rules to five, and each remaining rule becomes at least one test.

## Strengths

- Reveals **missing or contradictory** rules while you build it.
- Gives **complete combination coverage** for the stated rules.
- Easy for business analysts to review.

## Limits

The table grows fast (10 conditions means 1,024 rules). Use merging, risk and pairwise techniques for big combinations.

## Practice

Rule: free shipping if (total over ₹500) OR (member). Build the four-rule table and the expected shipping for each.`,
        [q("With 3 binary conditions, how many rule combinations exist before merging?", ["3", "6", "8", "9"], 2, "2^3 = 8 combinations."), q("Why merge rules in a decision table?", ["To hide rules", "When a condition does not affect the outcome, rules can be combined", "To add defects", "To reduce readability"], 1, "A don't-care condition lets several rules collapse into one."), q("Decision tables are best when:", ["Outcomes depend on combinations of conditions", "Only the colour matters", "Only one input exists", "Performance is measured"], 0, "They make combinations of conditions explicit.")],
        ["A decision table lists combinations of conditions and the expected action for each.", "Like a flow chart in table form, where every row is one situation to test.", [["Conditions", "True or false inputs", "2 to the power n rules"], ["Actions", "Outputs per rule", "From the requirement"], ["Merge", "Remove don't-care", "Fewer, clearer rules"]], "Decision tables expose missing or conflicting business rules and give full combination coverage.", ["Enumerate all combinations", "Merge don't-care conditions", "Each rule becomes a test"], "Writing tests for only the obvious combinations and missing the rest."]),
      L("Decision table practice", 12,
`## Turning a table into code

Programmers implement decision tables as nested conditions. Testers check each rule: input the combination and confirm the output.

## Example rule set

A ticket price depends on age and whether it is a weekend:

| Age | Weekend | Price |
|---|---|---|
| under 12 | any | ₹100 |
| 12 to 59 | no | ₹200 |
| 12 to 59 | yes | ₹250 |
| 60 and above | any | ₹120 |

Tests (one per rule, with boundary ages added): ages 11, 12, 59 and 60, weekday and weekend.

## Build your own

Take the requirement, mark the conditions, write the combinations, then cross-check with the product owner. The act of building the table often finds a gap such as *"what is the price for exactly age 12?"*.

## Try it in code

Write a function that implements the table, then check it with your tests. If your tests are well designed, a deliberate mistake in the code (for example \`age > 12\` instead of \`age >= 12\`) is caught by the boundary tests.`,
        [q("In the ticket table, a 60-year-old on a weekend pays:", ["₹100", "₹120", "₹200", "₹250"], 1, "Age 60 and above pays ₹120 regardless of the day."), q("Why add boundary ages to the table tests?", ["To add colour", "To catch off-by-one errors such as > instead of >=", "To test network speed", "To remove rules"], 1, "Ages 11, 12, 59 and 60 sit on rule boundaries."), q("A table often finds a gap such as 'what about exactly age 12?'. This shows tables help find:", ["Hardware faults", "Missing or ambiguous rules", "Browser bugs", "Slow code"], 1, "Building the table forces precise rules.")],
        ["Each row of a decision table is one test, and boundary ages catch off-by-one errors.", "Like a price board: check each row by buying one ticket of each kind.", [["Rule", "One row = one test", "Input and expected price"], ["Boundary", "Ages 11, 12, 59, 60", "Edges between rules"], ["Gap", "Ambiguity found", "Ask the product owner"]], "Combine rule coverage with boundary values for strong tests.", ["One test per rule", "Add boundary values", "Resolve gaps with the owner"], "Assuming the exact boundary value belongs to a rule without checking."]),
      { ...L("Challenge: ticket price calculator", 12,
`## Your task

Implement the ticket pricing table from the previous lesson as a small program. This practises turning a decision table into logic and reading expected output.

## Rules recap

- Age under 12: ₹100 any day.
- Age 12 to 59: ₹200 on a weekday, ₹250 on a weekend.
- Age 60 or more: ₹120 any day.

## Input format

One line: the age, a space, then the word \`weekday\` or \`weekend\`. Print only the price as a number.

Write the code, run it against the sample tests, then submit. Think of your own boundary ages (11, 12, 59, 60) while you test.`,
        [q("Age 12 on a weekend pays:", ["₹100", "₹200", "₹250", "₹120"], 2, "Age 12 to 59 on a weekend pays ₹250."), q("Which ages are the boundaries in this table?", ["11, 12, 59, 60", "1, 2, 3", "100, 200", "0 and 1000"], 0, "These are the values on and next to the rule edges."), q("A decision table rule maps to:", ["One or more tests", "No tests", "A bug", "A release"], 0, "Every rule must be covered by at least one test.")],
        ["Implementing the table in code shows how each rule becomes a condition.", "Like writing the price board as instructions for the ticket machine.", [["Read", "Age and day", "Parse the input"], ["Decide", "Match a rule", "Check boundaries"], ["Print", "The price", "Only the number"]], "Test the boundary ages to confirm the code matches the table.", ["Parse input carefully", "Cover each rule", "Check the boundaries"], "Writing conditions that miss exactly age 12 or age 60."]),
        challenge: pyChallenge("Ticket price calculator", "Read one line with an age and the word weekday or weekend. Print the ticket price: under 12 pays 100; 12 to 59 pays 200 on a weekday and 250 on a weekend; 60 or more pays 120.", "age_text, day = input().split()\nage = int(age_text)\n# print the price\n",
          [{ input: "10 weekday", expected: "100" }, { input: "30 weekend", expected: "250" }, { input: "60 weekday", expected: "120" }, { input: "12 weekday", expected: "200", hidden: true }, { input: "11 weekend", expected: "100", hidden: true }],
          ["Compare age with 12 and 60 using < and >=.", "Use an if / elif / else chain.", "Only the 12 to 59 group depends on the day."],
          "age_text, day = input().split()\nage = int(age_text)\nif age < 12:\n    print(100)\nelif age >= 60:\n    print(120)\nelif day == 'weekend':\n    print(250)\nelse:\n    print(200)",
          "Check the two special age groups first, then the weekday and weekend prices for ages 12 to 59.") },
    ] },
    { title: "Behaviour and Coverage Techniques", summary: "States, scenarios and code coverage.", lessons: [
      L("State transition testing", 15,
`## When to use it

Some systems behave differently depending on their **current state** and the **event** that occurs: an order, a login session, an ATM, a traffic light. **State transition testing** checks the states, events and transitions.

## The model

- **States:** conditions the system can be in (Placed, Paid, Shipped, Delivered, Cancelled).
- **Events:** things that happen (pay, ship, cancel).
- **Transitions:** a state plus an event leads to a new state (Placed + pay = Paid).
- **Guards and actions:** conditions and outputs (cancel allowed only before shipping; refund issued).

## Example: order life

| From state | Event | To state |
|---|---|---|
| Placed | pay | Paid |
| Placed | cancel | Cancelled |
| Paid | ship | Shipped |
| Paid | cancel | Cancelled (refund) |
| Shipped | deliver | Delivered |
| Shipped | cancel | Not allowed |

## Coverage levels

- **All states:** visit every state at least once.
- **All transitions (0-switch):** exercise every valid transition.
- **Invalid transitions:** try events that should be **rejected** (cancel a shipped order).
- **N-switch:** sequences of N+1 transitions to find sequence-related bugs.

## Test cases from the table

1. Placed to pay to Paid: expect status Paid.
2. Paid to ship to Shipped: expect status Shipped.
3. Shipped to cancel: expect an error and no state change.
4. Paid to cancel: expect Cancelled and a refund.

## Practice

Draw states for a login with 3 failed attempts causing a lock. List valid and invalid transitions you would test.`,
        [q("Which element describes what happens when an event occurs in a state?", ["Transition", "Partition", "Boundary", "Charter"], 0, "A transition moves from one state to another because of an event."), q("Trying to cancel a shipped order tests:", ["A valid transition", "An invalid transition that should be rejected", "A boundary", "A partition"], 1, "Invalid transitions should be blocked, and testing proves it."), q("State transition testing suits:", ["Behaviour that depends on current state", "Colour themes", "Static text", "Spelling"], 0, "Use it when the same event gives different results in different states.")],
        ["The system's response depends on its current state and the event that occurs.", "Like a traffic light: the same timer does different things in red, green and amber.", [["States", "Placed, Paid, Shipped", "Where the system is"], ["Events", "Pay, ship, cancel", "What happens"], ["Transitions", "Allowed or rejected", "Test valid and invalid"]], "Cover every state and transition, and also the transitions that must be blocked.", ["Test valid transitions", "Test invalid transitions", "Check actions like refunds"], "Testing only the happy path through the states."]),
      L("Use case and scenario testing", 13,
`## Use cases

A **use case** describes how an actor achieves a goal with the system: a **main (basic) flow** plus **alternative and exception flows**. Tests derived from use cases mirror real user journeys and are good for system and acceptance testing.

## Example: place an order

**Actor:** registered customer. **Goal:** buy items.

- **Main flow:** log in, add item, open cart, enter address, choose payment, pay, see confirmation.
- **Alternative flow A:** guest checks out without an account.
- **Alternative flow B:** customer applies a coupon.
- **Exception flow X:** payment fails and the customer retries.
- **Exception flow Y:** item goes out of stock during checkout.

## Deriving tests

Create at least one test for the main flow and one for each alternative and exception flow. Add data variations where the rules need them.

## User stories and acceptance criteria

For user stories, each **Given / When / Then** criterion becomes a test, and one extra test per "what if" the team can think of.

## Scenario testing tips

- Make scenarios **realistic and end to end**.
- Include **interruptions and recovery**.
- Check **data across steps**: the cart total equals the payment amount equals the order amount.
- Keep scenarios **independent** where possible.

## Practice

Write five scenarios (one main, two alternative, two exception) for "withdraw cash from an ATM".`,
        [q("Tests derived from a use case should cover:", ["Only the main flow", "Main, alternative and exception flows", "Only exceptions", "Only screenshots"], 1, "All flows describe real user paths and failures."), q("Which is an exception flow in checkout?", ["Applying a coupon", "Payment fails and the user retries", "Guest checkout", "Viewing the cart"], 1, "A failure and recovery is an exception flow."), q("Each Given/When/Then acceptance criterion should become:", ["A test", "A bug", "A requirement ID", "A release note"], 0, "Criteria are directly testable.")],
        ["Use cases describe goals with main, alternative and exception flows, and each flow becomes a test.", "Like planning for every way a trip can go: the normal route, detours and breakdowns.", [["Main", "Basic flow", "The happy path"], ["Alternative", "Other valid paths", "Guest, coupon"], ["Exception", "Failures and recovery", "Payment fails, stock out"]], "Scenario tests mirror real use and catch integration problems across steps.", ["Cover all flows", "Check data across steps", "Include failure and recovery"], "Testing only the ideal checkout and skipping failures."]),
      L("White-box coverage and choosing techniques", 14,
`## Statement and branch coverage

White-box techniques measure how much of the **code structure** your tests execute.

\`\`\`python
def discount(total, member):
    if member:               # decision 1
        total = total * 0.9
    if total > 1000:         # decision 2
        total = total - 50
    return total
\`\`\`

- **Statement coverage** = executed statements / total statements.
- **Branch (decision) coverage** = decision outcomes executed / total outcomes. Here there are 4 outcomes (each decision true and false).

Test A: \`discount(2000, True)\` runs both decisions as true. Statement coverage is 100%, but branch coverage is only 2 of 4 outcomes (50%).
Add Test B: \`discount(500, False)\` makes both decisions false, reaching **4 of 4 outcomes (100% branch coverage)**.

100% branch coverage implies 100% statement coverage, but not the other way round. High coverage does not prove correctness: it shows what was **not** executed.

## Experience-based techniques

**Error guessing**, **exploratory testing** and **checklists** use skill to find what formal techniques miss.

## Choosing a technique

| Situation | Good choice |
|---|---|
| Input ranges | Equivalence partitioning and BVA |
| Combinations of rules | Decision tables |
| Behaviour depends on history | State transition |
| User journeys | Use case and scenarios |
| Need code coverage evidence | Statement and branch coverage |
| Little documentation, tight time | Exploratory testing |

Combine techniques: partitions and boundaries for inputs, a decision table for rules, a scenario for the journey, exploratory time for surprises.

## Practice

For the \`discount\` function, list the three tests that give full branch coverage and say what each expects.`,
        [q("Test A runs both decisions as true. Branch coverage of the function above is:", ["0%", "50%", "75%", "100%"], 1, "Only 2 of the 4 decision outcomes were executed."), q("Which statement is true?", ["100% statement coverage implies 100% branch coverage", "100% branch coverage implies 100% statement coverage", "They are unrelated", "Coverage proves there are no bugs"], 1, "Covering every branch executes every statement; the reverse is not guaranteed."), q("Which technique suits combinations of business rules?", ["Boundary value analysis", "Decision table testing", "Error guessing only", "Statement coverage only"], 1, "Decision tables enumerate combinations of conditions.")],
        ["Coverage measures how much code your tests executed; other techniques choose which tests to write.", "Like a map highlighter showing which streets you have driven.", [["Statement", "Lines executed", "Weaker measure"], ["Branch", "Decision outcomes", "Stronger measure"], ["Choose", "Match technique to risk", "Combine several"]], "Use coverage to find untested code, and techniques to design meaningful tests.", ["Branch coverage is stronger than statement", "Coverage shows what is not tested", "Combine techniques"], "Chasing 100% coverage as proof that the software is correct."]),
    ] },
  ],
  final: [
    q("Equivalence partitioning assumes values in a partition:", ["Behave the same way", "Always fail", "Are boundaries", "Are random"], 0, "Values in a partition are expected to behave alike."),
    q("Invalid partitions should be tested:", ["Each separately", "All in one test", "Never", "Only with valid ones"], 0, "Separate tests avoid masking failures."),
    q("Boundary values for range 18 to 60 (two-value) are:", ["17, 18, 60, 61", "18, 39, 60", "0, 100", "19, 59"], 0, "Just outside and on each edge."),
    q("Which defect type does BVA mostly catch?", ["Off-by-one errors", "Typos in labels", "Slow servers", "Wrong colours"], 0, "Boundary errors in comparisons."),
    q("With 4 binary conditions how many rules exist before merging?", ["4", "8", "16", "32"], 2, "2^4 = 16."),
    q("A decision table is best for:", ["Combinations of conditions", "Network speed", "Colour contrast", "Spelling"], 0, "It captures condition combinations."),
    q("State transition testing is useful when:", ["Behaviour depends on current state and events", "There are no inputs", "Only text is shown", "Only styles matter"], 0, "The same event may behave differently by state."),
    q("Trying to cancel a shipped order checks:", ["An invalid transition", "A valid transition", "A partition", "A boundary"], 0, "It should be rejected."),
    q("Use case testing should include:", ["Main, alternative and exception flows", "Only the main flow", "Only error pages", "Only logos"], 0, "All flows."),
    q("In `if member: ...; if total>1000: ...` there are how many decision outcomes?", ["2", "3", "4", "8"], 2, "Two decisions, each true and false."),
    q("One test running both decisions true gives branch coverage of:", ["25%", "50%", "75%", "100%"], 1, "Two of four outcomes."),
    q("100% branch coverage implies:", ["100% statement coverage", "Zero defects", "No need for review", "Perfect performance"], 0, "Branch coverage implies statement coverage."),
    q("Which are experience-based techniques? (select all that apply)", ["Error guessing", "Exploratory testing", "Checklist-based testing", "Branch coverage"], [0, 1, 2], "Branch coverage is white-box."),
    q("A file limit is 2 MB. Which pair is a good boundary test?", ["Exactly 2 MB and 2 MB + 1 byte", "1 MB and 3 MB", "Zero bytes only", "Any random file"], 0, "Test on and just over the limit."),
    q("Which technique should be chosen to test combinations of discount rules?", ["Decision table", "Statement coverage", "Smoke test", "Load test"], 0, "Decision tables enumerate the rules."),
  ],
  project: { title: "Capstone: design tests for a booking form", brief: "Take a booking form with date, number of guests (1 to 10), membership status and coupon. Design tests using partitions, boundaries, a decision table for the discount rules and a state diagram for the booking status. Deliver the tables and at least 20 concrete test cases with expected results." },
});
