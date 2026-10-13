import { q, video, type Course } from "./_helpers";

const course: Course = {
  slug: "bug-reporting-and-defect-life-cycle",
  title: "Bug Reporting and Defect Life Cycle",
  category: "Software Testing",
  track: "software-testing",
  level: "Beginner",
  description: "Learn to write defect reports that developers can act on the first time, and understand how a defect moves from discovery to closure, including severity, priority, triage and common tools.",
  longDescription: "A defect is only useful if someone can understand, reproduce and fix it. In this course you practise writing precise titles, steps, expected and actual results, choosing severity and priority, attaching evidence and following a defect through its life cycle. You also learn how to work with developers respectfully and how to avoid duplicates and rejected reports.",
  instructor: "MyLoginn Learning Team",
  durationWeeks: 2,
  price: 0,
  tags: ["Bug Reporting", "Defect Life Cycle", "QA", "Jira", "Beginner"],
  imageColor: "#0ea5e9",
  audience: "Beginners and junior testers who will report defects in a team, and developers who receive them.",
  prerequisitesText: "Software Testing Fundamentals (recommended). No tools required.",
  objectives: [
    "Write a defect report with a clear title, environment, steps, expected and actual results",
    "Reproduce a defect reliably and isolate the minimal steps",
    "Choose severity and priority and explain why they are different",
    "Follow a defect through the standard life cycle states",
    "Avoid duplicate and rejected reports through search and evidence",
    "Communicate about defects constructively with developers and product owners",
  ],
  prerequisiteSlugs: ["software-testing-fundamentals"],
  relatedSlugs: ["software-testing-fundamentals", "agile-and-scrum"],
  modules: [
    {
      title: "Writing a Great Bug Report",
      summary: "The parts of a report that make a defect easy to fix.",
      lessons: [
        {
          title: "Anatomy of a defect report",
          minutes: 14,
          summary: "Every field in a good report and why it is there.",
          explainer: video(
            "A defect report is a short document that lets someone else see, understand and reproduce a problem without asking you questions.",
            "A good report is like a map with directions: a stranger can follow your steps and arrive at the same spot.",
            [["Identify", "Title and ID", "One clear sentence of the problem"], ["Reproduce", "Environment and steps", "Exact, numbered and minimal"], ["Prove", "Expected vs actual and evidence", "Screenshot, log or video"]],
            "A report succeeds when a developer reproduces the defect from it on the first try.",
            ["Specific titles save time", "Steps must be reproducible", "Always state expected and actual results"],
            "Writing 'Login is broken' with no steps, environment or evidence.",
          ),
          content: `## Why the report matters

A defect that cannot be understood will not be fixed, and one that cannot be reproduced will be sent back. A well-written report can save a developer an hour and often prevents a long chat thread.

## The fields of a defect report

| Field | What to write | Example |
|---|---|---|
| **ID** | Assigned by the tracker | BUG-1042 |
| **Title (summary)** | One specific sentence: *what* fails and *where* | "Order total shows ₹0 after applying coupon SAVE10 on cart page" |
| **Environment** | Build/version, browser, OS, device, test data | Build 2.4.1, Chrome 126, Windows 11, user asha@example.com |
| **Preconditions** | Setup needed before step 1 | Cart contains 2 items totalling ₹800 |
| **Steps to reproduce** | Numbered, exact, minimal | 1. Open /cart 2. Enter code SAVE10 3. Click Apply |
| **Expected result** | What should happen, per requirement | Total becomes ₹720 |
| **Actual result** | What really happened | Total becomes ₹0 |
| **Severity / Priority** | Impact and urgency (next lessons) | Severity: High, Priority: High |
| **Evidence** | Screenshot, screen recording, log, network trace | Attached: cart.png, console.log |
| **Reproducibility** | Always / sometimes / once | 5 of 5 attempts |

## Writing a strong title

The title is what people see in lists and search. Compare:

- Weak: *Coupon problem*
- Strong: *Cart total becomes ₹0 when valid coupon SAVE10 is applied (Chrome, build 2.4.1)*

A good title names the **feature, the symptom and the condition**.

## Steps that anyone can follow

1. Start from a known state (state preconditions).
2. Use exact data, not "enter a valid code".
3. One action per step.
4. Stop at the point where the failure appears.
5. Re-run your own steps once from scratch to be sure they work.

## Expected versus actual

State both. The expected result comes from the requirement, a user story or the design, not from your personal taste. If you are unsure, say so and ask: a report that is really a question helps the team clarify a requirement.

## Evidence

Attach what makes the problem obvious: a cropped screenshot with the problem highlighted, a short screen recording for timing or animation issues, console errors, server log lines and the request and response of failing API calls. **Never include passwords, tokens or real customer data** in attachments.

## Practice

Rewrite this bad report as a good one: "App crashes sometimes when I pay." Decide which facts you would need to find out first.`,
          quiz: { passPercent: 60, questions: [
            q("Which title is best for a defect report?", ["Payment bug", "Checkout fails", "Payment page shows error 500 when paying with saved card on build 3.1 (Chrome)", "App is bad"], 2, "A strong title names the feature, the symptom and the condition so it can be found and understood from a list."),
            q("Where should the expected result come from?", ["The tester's preference", "The requirement, user story or design", "The developer's memory", "A competitor's website"], 1, "Expected results are based on agreed requirements; if unclear, raise it as a question."),
            q("Which should NOT be attached to a defect report?", ["A screenshot of the error", "Console log lines", "A file containing real customer passwords", "A short screen recording"], 2, "Sensitive data such as passwords and real customer information must never be attached."),
          ] },
        },
        {
          title: "Reproducing and isolating a defect",
          minutes: 13,
          summary: "Find the minimal, reliable steps before you report.",
          explainer: video(
            "Reproducing a defect means making it happen again on purpose, and isolating it means removing every step that is not needed.",
            "Like finding which switch in a house trips the fuse: you turn things off one at a time until only the cause remains.",
            [["Repeat", "Try again from a clean state", "Is it always, sometimes or once?"], ["Reduce", "Remove unneeded steps", "Shortest path to the failure"], ["Vary", "Change one thing at a time", "Browser, data, user, build"]],
            "A reliable, minimal reproduction is the most valuable part of a report.",
            ["Retry from a clean state", "Cut steps until the bug disappears, then put the last one back", "Change one variable at a time"],
            "Reporting a failure seen once without trying to reproduce it or noting how often it happens.",
          ),
          content: `## Reproduce first

Before reporting, try to make the failure happen again. Start from a **clean state**: log out, clear the cart, use a fresh browser session or reset the test data. If it only happens after a long chain of actions, note the whole chain.

### How often does it happen?

- **Always:** the same steps cause it every time.
- **Intermittent:** it happens sometimes. Record the ratio ("3 of 10 attempts") and any pattern (slow network, specific time, second attempt only).
- **Once:** you saw it but cannot repeat it. Report it carefully as *not reproducible*, with the exact time, user and logs, so a developer can search the logs.

## Isolate the minimal steps

Your first working steps are often longer than needed. Shorten them:

1. Remove one step at a time and test again.
2. If the bug still appears, that step was unnecessary; leave it out.
3. If the bug disappears, put the step back, because it is part of the cause.

## Change one variable at a time

To find the conditions, vary a single thing per attempt:

| Variable | Try |
|---|---|
| Browser | Chrome, Firefox, Edge |
| Device | Desktop, mobile |
| Data | Different user, different product, empty values |
| Build/version | Previous release |
| Network | Fast, slow, offline |

Record the results in the report, for example: *"Happens in Chrome and Edge, not Firefox; only with products priced above ₹1000."* These clues can point straight at the code.

## Is it really a defect?

Check before reporting:

- Does the requirement or design say this is the expected behaviour?
- Is it a test data or configuration problem?
- Is the environment correct (right build, right URL)?
- Has it already been reported? Search the tracker (next module).

## Regression question

Ask, "Did this work in the previous version?" If yes, it is a **regression**, which is usually higher priority and helps developers find the change that caused it.

## Practice

A checkout failure appears 2 out of 5 times. List four variables you would change one at a time to find the pattern.`,
          quiz: { passPercent: 60, questions: [
            q("A failure happens only 3 times in 10 attempts. What should the report say?", ["Nothing, it is not reproducible", "It is intermittent, 3 of 10 attempts, with conditions you noticed", "That it always happens", "Mark it as a duplicate"], 1, "Report the frequency honestly and add any pattern you observed, so developers can investigate."),
            q("What is the purpose of isolating a defect?", ["To make the report longer", "To find the minimal steps and conditions that cause it", "To assign it to a different developer", "To increase its severity"], 1, "Isolation removes unnecessary steps and identifies the conditions, which speeds up the fix."),
            q("A feature worked in the previous release and fails now. This is called a:", ["Duplicate", "Regression", "Enhancement", "Won't fix"], 1, "A regression is a defect that appears in functionality that previously worked."),
          ] },
        },
        {
          title: "Severity and priority",
          minutes: 14,
          summary: "Impact versus urgency, and why they are not the same.",
          explainer: video(
            "Severity measures how badly a defect affects the system; priority measures how soon it should be fixed.",
            "A spelling mistake in the company name on the home page is low severity but high priority; a rare crash in an old feature may be high severity but low priority.",
            [["Severity", "Technical impact", "Crash, data loss, wrong output, cosmetic"], ["Priority", "Business urgency", "Fix now, next release, later"], ["Decide", "Together with the team", "Testers suggest, product owner decides priority"]],
            "Severity describes the damage; priority describes the order of fixing, and they can differ.",
            ["Severity = impact", "Priority = urgency", "Priority is usually set by the product owner"],
            "Marking every defect as 'critical and urgent' so the real emergencies are lost in the noise.",
          ),
          content: `## Two different questions

| | **Severity** | **Priority** |
|---|---|---|
| Question | *How serious is the effect on the system or user?* | *How soon should we fix it?* |
| Who usually decides | Tester proposes, team agrees | Product owner or manager decides |
| Based on | Technical and user impact | Business value, risk, deadlines, effort |

## Typical severity levels

| Level | Meaning | Example |
|---|---|---|
| **Critical / Blocker** | System unusable, data loss or security breach, no workaround | Payments charge the card but orders are not created |
| **High / Major** | Main feature fails, workaround is hard | Cannot add items to cart on mobile |
| **Medium** | Feature partly works or has a workaround | Filter returns results in the wrong order |
| **Low / Minor** | Small issue, little user impact | Button label is misaligned by 2 pixels |
| **Trivial / Cosmetic** | Appearance only | A typo in a help tooltip |

## Typical priority levels

- **P1 / Urgent:** fix immediately, may stop a release
- **P2 / High:** fix in the current sprint or release
- **P3 / Medium:** fix when capacity allows
- **P4 / Low:** fix someday or may never be fixed

## When severity and priority differ

- **High severity, low priority:** the app crashes when a user uploads a 2 GB file, but only an internal tool uses that path once a year.
- **Low severity, high priority:** the company logo is misspelt on the home page before a major launch. It does no technical harm but is very visible.
- **High severity, high priority:** login fails for all users after a release.
- **Low severity, low priority:** a typo on a rarely visited admin page.

## Good habits

1. Base severity on *evidence of impact* (how many users, is there a workaround, is data at risk).
2. Do not inflate severity to get attention; it damages trust.
3. If you disagree with a priority, explain the risk with facts and let the product owner decide.
4. Revisit both when you learn more (for example, more users are affected than first thought).

## Practice

Give a severity and a priority (with one reason each) for: (a) the Pay button does nothing on iPhones, (b) a footer link text has the wrong capitalisation, (c) the weekly report email is sent twice to administrators.`,
          quiz: { passPercent: 60, questions: [
            q("A misspelt company name on the landing page the day before a launch is best described as:", ["High severity, low priority", "Low severity, high priority", "Low severity, low priority", "Critical severity, critical priority"], 1, "It does no technical damage (low severity) but is very visible and must be fixed quickly (high priority)."),
            q("Who usually decides the priority of a defect?", ["Only the tester", "The product owner or manager with input from the team", "The customer's lawyer", "The newest developer"], 1, "Priority is a business decision based on value, risk and deadlines; testers advise with impact information."),
            q("Which is the best example of a critical defect?", ["A tooltip typo", "Payments are charged but orders are not created", "A slightly misaligned icon", "A slow animation on one page"], 1, "Charging customers without creating orders is data and money loss with no workaround, which is critical."),
          ] },
        },
      ],
    },
    {
      title: "The Defect Life Cycle",
      summary: "How a defect moves from discovery to closure.",
      lessons: [
        {
          title: "States of the defect life cycle",
          minutes: 14,
          summary: "New, assigned, open, fixed, retest, closed and the other states.",
          explainer: video(
            "A defect moves through states such as New, Assigned, In Progress, Fixed, Retest and Closed, and can also be Rejected, Deferred or Reopened.",
            "Like a parcel being tracked: each status tells you who has it now and what happens next.",
            [["Found", "New, Assigned", "Reported and given an owner"], ["Fixed", "In Progress, Fixed, Ready for retest", "Developer changes the code"], ["Verified", "Closed or Reopened", "Tester confirms or sends it back"]],
            "The life cycle makes ownership and next steps clear for every defect.",
            ["Every state has an owner", "Fixed does not mean closed", "A failed retest reopens the defect"],
            "Closing a defect because the developer said it is fixed, without retesting.",
          ),
          content: `## The idea

A **defect life cycle (bug life cycle)** is the set of states a defect passes through from the moment it is reported until it is closed. Each organisation names the states a little differently, but the flow is similar.

## The main flow

1. **New:** the tester reports the defect.
2. **Assigned (Open):** a lead or triage meeting accepts it and assigns it to a developer.
3. **In Progress:** the developer is working on it.
4. **Fixed (Resolved):** the developer has changed the code and merged the fix.
5. **Ready for Retest:** the fix is deployed to a test environment.
6. **Retest:** the tester repeats the original steps.
7. **Closed:** the defect is verified as fixed.

If the retest fails, the defect is **Reopened** and goes back to the developer.

## Other common states

| State | Meaning | Who sets it |
|---|---|---|
| **Rejected / Not a defect** | Behaviour is expected or by design | Developer or triage |
| **Duplicate** | Same problem already reported | Triage |
| **Deferred / Postponed** | Valid, but will be fixed in a later release | Product owner |
| **Cannot reproduce** | Developer cannot see it with the given steps | Developer |
| **Won't fix** | Valid but not worth fixing | Product owner |

## Why tracking states matters

- Everyone knows **who has the ball**.
- Managers can see **how many defects are open** by severity, which feeds release decisions.
- Teams can measure **how long defects wait** at each state and find bottlenecks (for example, many sit in "Ready for Retest").

## The tester's responsibilities

- Provide enough detail so the defect is not "Cannot reproduce".
- Respond quickly when asked for more information.
- **Retest every fix** with the original steps, and also check nearby behaviour for side effects.
- Close only after verification, and reopen with new evidence if it still fails.

## Practice

Draw the life cycle of a defect that is first rejected as "cannot reproduce", then reproduced with better steps, fixed, fails the first retest and is finally closed. Write the sequence of states.`,
          quiz: { passPercent: 60, questions: [
            q("After a developer marks a defect Fixed, what should the tester do?", ["Close it immediately", "Retest it using the original steps", "Delete it", "Change its severity to low"], 1, "Fixed does not mean verified: the tester retests and only then closes or reopens."),
            q("A defect fails the retest. What state does it normally return to?", ["Closed", "Deferred", "Reopened", "New duplicate"], 2, "A failed retest reopens the defect and returns it to the developer."),
            q("Which state means the problem is valid but will be fixed in a later release?", ["Rejected", "Duplicate", "Deferred", "Closed"], 2, "Deferred (postponed) defects are accepted but scheduled for a later release."),
          ] },
        },
        {
          title: "Triage, duplicates and working with developers",
          minutes: 14,
          summary: "How teams decide what to fix and how to collaborate.",
          explainer: video(
            "Defect triage is a short meeting where the team reviews new defects, confirms severity and priority and assigns owners.",
            "Like a hospital emergency desk: patients are sorted by how urgent they are so the most serious cases are treated first.",
            [["Review", "Read new defects", "Is it clear and reproducible?"], ["Decide", "Severity, priority, owner", "Fix now, later or reject"], ["Follow up", "Track to closure", "Retest and communicate"]],
            "Triage keeps the defect list clean and the team aligned on what matters most.",
            ["Search before you report", "Be factual and kind in comments", "Defects are about the product, not people"],
            "Writing blaming comments such as 'developer broke it again' instead of stating the facts.",
          ),
          content: `## Defect triage

A **triage meeting** (often 15 to 30 minutes, daily or weekly) reviews newly reported defects. Typical attendees: a tester, a developer lead, and the product owner or manager.

For each defect the group decides:

1. Is it **valid** and **reproducible**?
2. What are the **severity** and **priority**?
3. Who is the **owner**, and in which release or sprint will it be fixed?
4. Does it need **more information** from the reporter?

Defects that are duplicates, expected behaviour or unreproducible are closed with a clear note.

## Avoiding duplicates

Before reporting:

- **Search the tracker** by keywords from your title, the screen name and the error message.
- Check **recently closed** defects: a fix may already exist in a newer build.
- If you find the same defect, **add your evidence as a comment** (new browser, new data, new frequency) instead of creating another report.

## Working well with developers

A defect report is feedback on the product, never on a person. Good habits:

- **State facts:** "The total shows ₹0" instead of "the code is wrong".
- **Be specific and complete** so nobody has to ask the same question twice.
- **Offer help:** show your steps live if asked, and share test data.
- **Give credit:** a thank-you on a good fix builds a team that fixes things faster.
- **Disagree with evidence**, not emotion: if a defect was rejected, add data or ask the product owner to clarify the expected behaviour.

## Tools you may see

Defect trackers such as Jira, Azure DevOps, GitHub Issues, Bugzilla and YouTrack store reports, states, comments, attachments and history. Whatever the tool, the same fields and life cycle apply.

## Useful metrics

- **Open defects by severity** at release time
- **Defect age** (how long they have been open)
- **Reopen rate** (a high rate may signal weak fixes or weak reports)
- **Defect density** (defects per module or size)

Metrics help teams improve; they should not be used to rank individual testers or developers.

## Practice

You find that the Pay button is disabled on small screens. Before reporting, write the three searches you would run in the tracker and what you would do if you find a similar open report.`,
          quiz: { passPercent: 60, questions: [
            q("What should you do if you find an existing open report of the same defect?", ["Create a second report anyway", "Add your new evidence as a comment on the existing report", "Close the existing report", "Ignore the problem"], 1, "Adding evidence to the existing report avoids duplicates and strengthens the case."),
            q("Which comment is the most constructive?", ["The developer broke login again", "Login fails with a 500 error after entering a valid password; steps and logs attached", "This team never tests anything", "Fix it ASAP!!!"], 1, "State facts and evidence about the product, not blame about people."),
            q("What is the main goal of defect triage?", ["To assign blame", "To review new defects and agree on validity, severity, priority and owner", "To delete old defects", "To write test cases"], 1, "Triage aligns the team on which defects to fix, in what order, and by whom."),
          ] },
          challenge: {
            title: "Sort defects by priority",
            language: "python",
            difficulty: "easy",
            statement: "You receive one line per defect in the form 'ID:PRIORITY' (for example 'B1:P2'), separated by spaces on a single input line. Priorities are P1 (most urgent) to P4. Print the defect IDs sorted by priority from most urgent (P1) to least urgent (P4). If two defects have the same priority keep them in the order they were given. Print the IDs separated by single spaces.\n\nExample: input 'B1:P3 B2:P1 B3:P2' prints 'B2 B3 B1'.",
            starterCode: "line = input()\nitems = line.split()\n# build a list of (priority_number, id) and sort it\n",
            tests: [
              { input: "B1:P3 B2:P1 B3:P2", expected: "B2 B3 B1", hidden: false },
              { input: "A:P2 B:P2 C:P1", expected: "C A B", hidden: false },
              { input: "X1:P4 X2:P3 X3:P4 X4:P1", expected: "X4 X2 X1 X3", hidden: true },
            ],
            checks: [],
            hints: ["Split each item on ':' to get the ID and the priority text.", "Convert 'P2' to the number 2 with int(text[1:]).", "Python's sorted() is stable, so equal priorities keep their original order."],
            solutionCode: "line = input()\nitems = []\nfor item in line.split():\n    defect_id, priority = item.split(':')\n    items.append((int(priority[1:]), defect_id))\nitems.sort(key=lambda pair: pair[0])\nprint(' '.join(defect_id for _, defect_id in items))",
            solutionExplanation: "We turn each priority into a number, then sort by that number only. Python's sort is stable, so defects with the same priority keep the order in which they were reported.",
            points: 20,
          },
        },
      ],
    },
  ],
  finalAssessment: {
    title: "Bug Reporting and Defect Life Cycle: final assessment",
    timeLimitMinutes: 25,
    questionCount: 12,
    questions: [
      q("Which part of a defect report tells the developer how to see the problem?", ["Severity", "Steps to reproduce", "Attachment name", "Reporter name"], 1, "Numbered, specific steps to reproduce let the developer see the failure for themselves."),
      q("Which title is the strongest?", ["Bug", "Login issue", "Login button does nothing on Safari 17 after entering a valid password (build 2.4.1)", "Please fix"], 2, "A strong title names the feature, the symptom and the condition."),
      q("The expected result in a report should be based on:", ["The tester's opinion", "The requirement, story or design", "How another app behaves", "The developer's guess"], 1, "Expected results come from agreed requirements or design."),
      q("A failure appears in 2 of 10 attempts. The best action is to:", ["Skip reporting", "Report it as intermittent with the ratio and any observed pattern", "Say it always happens", "Wait a month"], 1, "Honest reporting of frequency and conditions helps developers investigate intermittent defects."),
      q("Removing unnecessary steps until only the failing ones remain is called:", ["Triage", "Isolation", "Deferral", "Regression"], 1, "Isolating the defect finds the minimal steps and conditions."),
      q("A feature worked in the last release and now fails. This is a:", ["Regression", "Duplicate", "Enhancement", "Cosmetic issue"], 0, "A defect in previously working functionality is a regression."),
      q("Which statement about severity and priority is correct?", ["They are always the same", "Severity is impact and priority is urgency of fixing", "Priority is decided only by testers", "Severity is decided only by users"], 1, "They are related but different: severity measures impact, priority measures how soon to fix."),
      q("A typo in the company name on the home page just before launch is typically:", ["High severity, low priority", "Low severity, high priority", "Critical severity", "Low severity, low priority"], 1, "Little technical impact but very visible, so it is urgent for the business."),
      q("The app crashes only when a rarely used admin tool uploads a 2 GB file once a year. Likely classification?", ["High severity, low priority", "Low severity, high priority", "Cosmetic", "Not a defect"], 0, "The impact is severe when it happens, but it is so rare that the fix can wait."),
      q("Who normally sets the priority of a defect?", ["The product owner or manager with team input", "The tester alone", "The customer support agent", "Nobody"], 0, "Priority is a business decision about value, risk and time."),
      q("Which are typical defect life cycle states? (select all that apply)", ["New", "Assigned", "Retest", "Compiled"], [0, 1, 2], "New, Assigned and Retest are common states; 'Compiled' is not a defect state."),
      q("After a fix is deployed to the test environment the tester should:", ["Close the defect without checking", "Retest with the original steps and check nearby behaviour", "Assign it to another tester", "Reduce its severity"], 1, "Only after verification should a defect be closed."),
      q("A defect is valid but the team decides to fix it next quarter. The state is:", ["Rejected", "Deferred", "Closed", "Duplicate"], 1, "Deferred defects are accepted but scheduled later."),
      q("A retest fails. The defect should be:", ["Closed", "Reopened", "Marked duplicate", "Deleted"], 1, "A failed retest reopens the defect."),
      q("What should you do before creating a new defect?", ["Create it immediately", "Search the tracker for an existing report", "Ask the product owner for permission", "Wait for a release"], 1, "Searching first prevents duplicates and lets you add evidence to an existing report."),
      q("Which is NOT appropriate to attach to a report?", ["A cropped screenshot", "A console log", "A file with real customer passwords", "A short screen recording"], 2, "Sensitive data must never be attached."),
      q("Which comment is constructive? (select all that apply)", ["Total shows ₹0 after coupon SAVE10; steps attached", "Thanks, fix confirmed on build 2.4.2", "You broke this again", "Happens on Chrome and Edge but not Firefox"], [0, 1, 3], "Factual, evidence-based and appreciative comments help; blame does not."),
      q("What is the purpose of a triage meeting?", ["To write code", "To review new defects and agree on validity, severity, priority and owner", "To plan holidays", "To close all defects"], 1, "Triage aligns the team on what to fix and in what order."),
      q("Which metric might mislead if used to rank individual testers?", ["Number of defects reported", "Defect age", "Reopen rate by module", "Open defects by severity at release"], 0, "Counting defects per person encourages quantity over quality and unhealthy competition."),
      q("A report says 'cannot reproduce'. The best response from the tester is to:", ["Close it", "Add environment details, exact data, logs and a recording, and try to reproduce again", "Argue in the comments", "Raise severity"], 1, "Provide more information so the developer can reproduce it."),
    ],
  },
  projects: [
    {
      title: "Capstone: report five real defects",
      brief: "Choose a website or app you can test legally (for example a practice site such as a public demo shop). Find and report five defects as a document or tracker issues. Each must have a specific title, environment, preconditions, numbered steps, expected and actual results, severity, priority and an attachment. Add one paragraph on how you checked for duplicates.",
      rubric: "Reproducible steps, accurate severity and priority with reasons, good evidence, professional tone.",
      kind: "project",
      required: false,
    },
  ],
};

export default course;
