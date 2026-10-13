import { q, video, type Course } from "./_helpers";

const course: Course = {
  slug: "agile-and-scrum",
  title: "Agile and Scrum",
  category: "Project Management",
  track: "essential-it-skills",
  level: "Beginner",
  description: "Understand the Agile mindset and run work the Scrum way: roles, events, artifacts, user stories, estimation and sprint planning, as used by modern software teams and asked about in IT interviews.",
  longDescription: "Most software teams plan and deliver in short cycles rather than one big plan. This course explains why, using the Agile Manifesto and Scrum Guide concepts. You will learn the three Scrum roles, the five events, the three artifacts, how to write and split user stories, how to estimate with story points and how to run a realistic sprint.",
  instructor: "MyLoginn Learning Team",
  durationWeeks: 2,
  price: 0,
  tags: ["Agile", "Scrum", "Project Management", "User Stories", "Beginner"],
  imageColor: "#7c3aed",
  audience: "Students and new IT professionals (developers, testers, analysts) who will work in Agile teams, and anyone preparing for Scrum interview questions.",
  prerequisitesText: "None. Basic familiarity with how software projects work is helpful but not required.",
  objectives: [
    "Explain the values and principles of the Agile Manifesto in your own words",
    "Describe Scrum's three roles, five events and three artifacts and how they connect",
    "Write user stories with acceptance criteria that follow the INVEST checklist",
    "Estimate work with story points and use velocity responsibly",
    "Plan a sprint with a clear sprint goal and a realistic scope",
    "Recognise common Scrum anti-patterns and how to fix them",
  ],
  relatedSlugs: ["software-testing-fundamentals", "bug-reporting-and-defect-life-cycle"],
  modules: [
    {
      title: "Agile Foundations",
      summary: "Why Agile exists and what it values.",
      lessons: [
        {
          title: "From waterfall to Agile",
          minutes: 12,
          summary: "Why long plans fail and short feedback cycles help.",
          explainer: video(
            "Waterfall plans everything up front and delivers at the end, while Agile delivers small working pieces often and learns from feedback.",
            "Waterfall is like building a whole ship before launching it once; Agile is launching a small boat early and improving it after every trip.",
            [["Waterfall", "Plan, build, test, release", "Feedback comes late"], ["Agile", "Small increments often", "Feedback comes early"], ["Result", "Less risk, faster learning", "Change is welcomed"]],
            "Agile reduces risk by delivering working software in short cycles and adapting to change.",
            ["Requirements change, so plans must adapt", "Deliver working software early and often", "Feedback is the engine of Agile"],
            "Thinking Agile means 'no planning' or 'no documentation'.",
          ),
          content: `## The problem with big up-front plans

In the **waterfall** approach a project moves through fixed phases: requirements, design, build, test, release. Each phase finishes before the next starts. This works when requirements are stable and well understood, such as building a bridge. In software, however:

- Customers often do not know exactly what they want until they see something working.
- Markets, technology and laws change during a long project.
- Testing at the end finds big problems when they are most expensive to fix.
- The first time anyone uses the product is after the budget is spent.

## What Agile changes

**Agile** is a family of approaches that deliver software in **small increments**, get **feedback early**, and **adapt the plan** as they learn. Instead of one release after twelve months, an Agile team might release something usable every two weeks.

| | Waterfall | Agile |
|---|---|---|
| Plan | Detailed, up front | Evolving, just enough |
| Delivery | One big release | Frequent small releases |
| Change | Costly, controlled | Expected and welcomed |
| Customer | Involved at start and end | Involved throughout |
| Risk | Discovered late | Discovered early |

## Agile is a mindset, Scrum is a framework

- **Agile** is a set of values and principles (the Agile Manifesto).
- **Scrum**, **Kanban** and **Extreme Programming (XP)** are specific ways of working that follow Agile ideas.

This course focuses on **Scrum**, the most widely used Agile framework.

## When Agile fits (and when it doesn't)

Agile fits when requirements are uncertain and feedback is valuable (most software and product work). A fixed-scope, regulated project may mix in more planning and documentation, and that can still be Agile if the team delivers incrementally and adapts.

## Common myths

- *"Agile means no documentation."* The Manifesto values working software **over comprehensive** documentation, not instead of it.
- *"Agile means no plan."* Teams plan constantly, in smaller steps.
- *"Agile is faster."* It makes progress visible and reduces waste; it does not magically remove work.

## Practice

Think of a project you have done (for example, a college app). Write down two things that changed after you started and how a short feedback cycle would have helped.`,
          quiz: { passPercent: 60, questions: [
            q("What is the main advantage of delivering software in small increments?", ["Documentation is never needed", "Feedback arrives early and risk is reduced", "Requirements never change", "No testing is required"], 1, "Small increments give early feedback, so problems and changing needs are found while they are cheap to handle."),
            q("Which is true about Scrum and Agile?", ["Agile is a framework and Scrum is a value", "Agile is a mindset and Scrum is one framework that follows it", "They are unrelated", "Scrum is a programming language"], 1, "Agile is the set of values and principles; Scrum is a specific framework built on them."),
            q("'Agile means no planning' is:", ["True", "A myth: Agile teams plan continuously in smaller steps", "True only for large projects", "Defined in the Scrum Guide"], 1, "Agile teams plan all the time, but in smaller iterations and adapt as they learn."),
          ] },
        },
        {
          title: "The Agile Manifesto: values and principles",
          minutes: 12,
          summary: "The four values and how to read them.",
          explainer: video(
            "The Agile Manifesto states four values: people over processes, working software over documentation, customer collaboration over contracts and responding to change over following a plan.",
            "The values are like a compass: both sides of each pair matter, but when they conflict you lean towards the left-hand side.",
            [["People", "Individuals and interactions", "Over processes and tools"], ["Software", "Working software", "Over comprehensive documentation"], ["Change", "Collaboration and responding to change", "Over contracts and plans"]],
            "The right-hand items still have value, but the left-hand items are valued more.",
            ["Both sides matter; we favour the left", "Working software is the main measure of progress", "Welcome changing requirements"],
            "Reading the Manifesto as 'ignore processes, documents, contracts and plans'.",
          ),
          content: `## Where it came from

In 2001, seventeen software practitioners wrote the **Manifesto for Agile Software Development** to describe what they found worked better than heavyweight processes of the time.

## The four values

> We are uncovering better ways of developing software by doing it and helping others do it. Through this work we have come to value:
>
> **Individuals and interactions** over processes and tools
> **Working software** over comprehensive documentation
> **Customer collaboration** over contract negotiation
> **Responding to change** over following a plan
>
> That is, while there is value in the items on the right, we value the items on the left more.

### How to read each pair

1. **Individuals and interactions over processes and tools.** A good conversation often beats a tool. Tools support people; they do not replace talking.
2. **Working software over comprehensive documentation.** Documentation that helps is welcome. The measure of progress is software that works, not pages written.
3. **Customer collaboration over contract negotiation.** Work with the customer continuously rather than only arguing over a contract.
4. **Responding to change over following a plan.** A plan is a guide. When facts change, the team adapts.

## The twelve principles (highlights)

- Satisfy the customer through **early and continuous delivery** of valuable software.
- **Welcome changing requirements**, even late in development.
- Deliver working software **frequently**, from a couple of weeks to a couple of months, with a preference for the shorter timescale.
- Business people and developers must **work together daily**.
- Build projects around **motivated individuals** and trust them.
- **Working software is the primary measure of progress.**
- Maintain a **sustainable pace** indefinitely.
- Continuous attention to **technical excellence and good design** enhances agility.
- **Simplicity**, the art of maximising the amount of work not done, is essential.
- At regular intervals the team **reflects** on how to become more effective and adjusts.

## Example in practice

A team is asked to write a 60-page design document before coding. An Agile team instead writes a short design that fits on a page, builds the first slice, shows it to the customer within two weeks and updates the design with what they learn.

## Practice

For each pair of values, write one real workplace example where you would lean towards the left-hand item and one where the right-hand item is still essential (for example, a safety-critical contract).`,
          quiz: { passPercent: 60, questions: [
            q("According to the Manifesto, working software is valued over:", ["Customers", "Comprehensive documentation", "Teamwork", "Testing"], 1, "The second value: working software over comprehensive documentation."),
            q("What does the phrase 'while there is value in the items on the right' mean?", ["Ignore the right-hand items", "The right-hand items still matter, but the left-hand ones are valued more", "Contracts are illegal", "Documentation is forbidden"], 1, "The Manifesto does not reject processes, documents, contracts or plans; it prioritises the left-hand items."),
            q("Which principle encourages shorter delivery cycles?", ["Deliver working software frequently, with a preference for the shorter timescale", "Plan everything once", "Release only at the end of the year", "Avoid customer contact"], 0, "Agile favours frequent delivery to get feedback sooner."),
          ] },
        },
      ],
    },
    {
      title: "Scrum Roles, Events and Artifacts",
      summary: "The structure of a Scrum team's work.",
      lessons: [
        {
          title: "Scrum roles and accountabilities",
          minutes: 14,
          summary: "Product Owner, Scrum Master and Developers.",
          explainer: video(
            "A Scrum Team is one small team with three accountabilities: the Product Owner, the Scrum Master and the Developers.",
            "Like a sports team: one person decides what the team is aiming for, one helps the team play well together, and the players do the work.",
            [["Product Owner", "Maximises product value", "Owns and orders the Product Backlog"], ["Scrum Master", "Helps the team use Scrum", "Removes impediments, coaches"], ["Developers", "Build the Increment", "Plan, build and test the work"]],
            "Three accountabilities, one team, one shared goal: valuable, usable increments.",
            ["The PO decides what and in what order", "The Scrum Master serves the team and organisation", "Developers decide how to do the work"],
            "Treating the Scrum Master as a project manager who assigns tasks.",
          ),
          content: `## One team, three accountabilities

The Scrum Guide describes a **Scrum Team** as a small group (typically 10 or fewer) that is **cross-functional** (it has all the skills needed to deliver) and **self-managing** (it decides internally who does what, when and how). There are no sub-teams or hierarchies. Within the team there are three accountabilities.

## Product Owner (PO)

The PO is accountable for **maximising the value** of the product. In practice:

- Develops and communicates the **Product Goal**
- Creates and clearly communicates **Product Backlog items**
- **Orders** the Product Backlog (decides priority)
- Ensures the backlog is **transparent and understood**

The PO is **one person**, not a committee. Others may propose changes, but the PO decides. Stakeholders respect the PO's decisions.

## Scrum Master (SM)

The SM is accountable for **establishing Scrum** as defined in the Scrum Guide and for the **team's effectiveness**. The SM is a **servant leader** who:

- Coaches the team in self-management and cross-functionality
- Helps the team focus on creating high-value increments that meet the Definition of Done
- **Removes impediments** to the team's progress
- Ensures all Scrum events take place and are positive, productive and time-boxed
- Helps the organisation understand and adopt Scrum

The SM is **not** a project manager, does not assign tasks and does not report on individual performance.

## Developers

Developers are the people committed to creating **any aspect of a usable Increment** each Sprint. "Developers" includes programmers, testers, designers and analysts working on the product. They are accountable for:

- Creating a plan for the Sprint (the **Sprint Backlog**)
- Instilling quality by adhering to the **Definition of Done**
- Adapting the plan each day toward the Sprint Goal
- Holding each other accountable as professionals

## How they work together

The PO says **what is most valuable**, Developers decide **how much they can do and how**, and the SM helps the team **work well**. Conflicts are resolved by talking: the PO has the final say on ordering, the Developers on the amount of work they can take in a Sprint.

## Practice

A manager asks the Scrum Master to assign tickets to specific people and report who is slowest. Explain in two sentences why that conflicts with Scrum and what the Scrum Master should do.`,
          quiz: { passPercent: 60, questions: [
            q("Who orders the Product Backlog?", ["The Scrum Master", "The Product Owner", "The Developers", "The CEO"], 1, "The Product Owner is accountable for ordering the Product Backlog to maximise value."),
            q("Which best describes the Scrum Master?", ["A project manager who assigns tasks", "A servant leader who helps the team use Scrum and removes impediments", "A senior developer who approves code", "A customer representative"], 1, "The Scrum Master serves the team and organisation; they do not assign tasks or manage individuals."),
            q("Who decides how much work can be pulled into a Sprint?", ["The Product Owner alone", "The Scrum Master", "The Developers", "Stakeholders"], 2, "Developers decide how much work they can complete in a Sprint; the PO orders what is most valuable."),
          ] },
        },
        {
          title: "The five Scrum events",
          minutes: 15,
          summary: "Sprint, Sprint Planning, Daily Scrum, Sprint Review and Retrospective.",
          explainer: video(
            "Scrum has five events, all time-boxed: the Sprint itself, Sprint Planning, the Daily Scrum, the Sprint Review and the Sprint Retrospective.",
            "Think of a sprint as a short race: plan the route, check in daily, show the result and then discuss how to run the next race better.",
            [["Plan", "Sprint Planning", "Why, what and how"], ["Inspect daily", "Daily Scrum (15 min)", "Progress toward the Sprint Goal"], ["Learn", "Review and Retrospective", "Inspect the product, then the process"]],
            "Each event is a chance to inspect and adapt, and every Sprint is one month or less.",
            ["Sprints are one month or less", "The Daily Scrum is 15 minutes for Developers", "Review inspects the product; Retrospective inspects the way of working"],
            "Turning the Daily Scrum into a status report to the manager.",
          ),
          content: `## The Sprint

A **Sprint** is a fixed-length event of **one month or less** (many teams choose two weeks) in which a "Done", usable increment is created. A new Sprint starts immediately after the previous one ends. During a Sprint:

- No changes are made that endanger the **Sprint Goal**.
- Quality does not decrease.
- The Product Backlog is refined as needed.
- Scope may be clarified and renegotiated with the Product Owner as more is learned.

Only the Product Owner can cancel a Sprint, and only if the Sprint Goal becomes obsolete.

## Sprint Planning (max 8 hours for a one-month Sprint)

The whole team plans the work and answers three topics:

1. **Why** is this Sprint valuable? The team proposes and agrees a **Sprint Goal**.
2. **What** can be Done in this Sprint? Developers select Product Backlog items.
3. **How** will the work get done? Developers plan the work, often breaking items into tasks of a day or less.

The result is the **Sprint Backlog**: the Sprint Goal, the selected items and the plan.

## Daily Scrum (15 minutes)

A short event for the **Developers** at the same time and place every day to inspect progress toward the Sprint Goal and adapt the Sprint Backlog. A common set of questions: *What helps us move toward the Sprint Goal? What is in the way?* It is **not** a status report to managers.

## Sprint Review (max 4 hours for a one-month Sprint)

The team presents the work done to **stakeholders** and gets feedback. It is a working session, not just a demo: the group discusses what was achieved, what changed in the environment and what to do next. The Product Backlog may be adjusted.

## Sprint Retrospective (max 3 hours for a one-month Sprint)

The team inspects **how the last Sprint went** regarding individuals, interactions, processes, tools and the Definition of Done, and identifies improvements it will try, ideally starting in the next Sprint.

## Time-boxes

Shorter Sprints have proportionally shorter events. Time-boxes keep meetings focused. If the event goal is reached sooner, it can end sooner.

## Summary table

| Event | Purpose | Who | Time-box (1-month Sprint) |
|---|---|---|---|
| Sprint Planning | Plan the Sprint | Whole team | 8 h |
| Daily Scrum | Inspect progress, adapt plan | Developers | 15 min |
| Sprint Review | Inspect the Increment, adapt backlog | Team and stakeholders | 4 h |
| Sprint Retrospective | Improve the way of working | Whole team | 3 h |

## Practice

Your Daily Scrum has become a 40-minute report to a manager. Write three changes that would restore its purpose.`,
          quiz: { passPercent: 60, questions: [
            q("What is the maximum length of a Sprint?", ["One week", "Two weeks", "One month", "Three months"], 2, "A Sprint is one month or less."),
            q("Who attends the Sprint Review?", ["Only the Developers", "The Scrum Team and key stakeholders", "Only the Scrum Master", "Only managers"], 1, "The Scrum Team presents the work and gets feedback from stakeholders."),
            q("What is the main purpose of the Sprint Retrospective?", ["To demonstrate the product", "To plan the next release date", "To inspect how the team worked and agree improvements", "To estimate the backlog"], 2, "The Retrospective is about improving the team's way of working, including quality and tools."),
          ] },
        },
        {
          title: "Scrum artifacts and the Definition of Done",
          minutes: 14,
          summary: "Product Backlog, Sprint Backlog, Increment and their commitments.",
          explainer: video(
            "Scrum has three artifacts, each with a commitment: the Product Backlog with the Product Goal, the Sprint Backlog with the Sprint Goal and the Increment with the Definition of Done.",
            "Like a shopping list for the whole project, a basket for this trip, and a finished meal that meets the 'ready to serve' standard.",
            [["Product Backlog", "Ordered list of everything needed", "Commitment: Product Goal"], ["Sprint Backlog", "Plan for this Sprint", "Commitment: Sprint Goal"], ["Increment", "Usable, finished work", "Commitment: Definition of Done"]],
            "Artifacts make work visible so the team can inspect and adapt with transparency.",
            ["The Product Backlog is never complete and always evolving", "The Sprint Backlog belongs to the Developers", "Done means meeting the Definition of Done, not 'almost'"],
            "Calling something Done when testing, review or documentation required by the Definition of Done is still missing.",
          ),
          content: `## Transparency through artifacts

Scrum's artifacts represent work or value and are designed to maximise **transparency**. Each contains a **commitment** that gives it focus.

## Product Backlog

An **emergent, ordered list** of what is needed to improve the product, and the single source of work for the Scrum Team. Items include features, fixes, technical work and experiments.

- **Commitment: the Product Goal**, a long-term objective for the product.
- Ordered by the Product Owner (value, risk, dependencies).
- **Refinement** is the ongoing activity of breaking down and clarifying items so they can be done within a Sprint. Items ready to be selected are typically small and clear.

## Sprint Backlog

The Sprint Goal (why), the Product Backlog items selected for the Sprint (what) and an actionable plan for delivering them (how). It is a **real-time picture** of the work the Developers plan to accomplish, updated throughout the Sprint, and it belongs to the Developers.

- **Commitment: the Sprint Goal**, the single objective for the Sprint that provides coherence and focus.

## Increment

A concrete stepping stone toward the Product Goal. Each Increment is **additive to all prior Increments** and thoroughly verified, so that all Increments work together. To provide value, an Increment must be **usable**. Multiple Increments may be created within a Sprint.

- **Commitment: the Definition of Done**, a formal description of the state of the Increment when it meets the quality measures required for the product.

## Definition of Done (DoD)

The DoD creates a shared understanding of what "done" means. Example DoD for a web feature:

1. Code reviewed by another developer
2. Unit tests written and passing
3. Acceptance criteria verified by testing
4. No open critical or high defects
5. Deployed to the test environment
6. Documentation or release notes updated

If an item does not meet the DoD, it **cannot be released or shown as part of the Increment**; it returns to the Product Backlog.

## Definition of Ready (optional practice)

Some teams add a **Definition of Ready** for backlog items (clear description, acceptance criteria, estimated, dependencies known). It is not an official Scrum artifact commitment but is a common team agreement.

## Practice

Write a Definition of Done of five items for a team that builds a mobile app, and say what happens to a story that passes four of the five items by the end of the Sprint.`,
          quiz: { passPercent: 60, questions: [
            q("Which commitment belongs to the Increment?", ["The Product Goal", "The Sprint Goal", "The Definition of Done", "The Velocity"], 2, "The Increment's commitment is the Definition of Done; the Product Backlog has the Product Goal and the Sprint Backlog has the Sprint Goal."),
            q("A story meets four of the five Definition of Done items at the end of the Sprint. What happens?", ["It is shown as Done", "It is not part of the Increment and returns to the Product Backlog", "It is deleted", "The Scrum Master marks it Done"], 1, "Work that does not meet the Definition of Done is not Done and goes back to the Product Backlog."),
            q("Who owns the Sprint Backlog?", ["The Product Owner", "The Scrum Master", "The Developers", "Stakeholders"], 2, "The Sprint Backlog is the Developers' plan for the Sprint, and they own it."),
          ] },
        },
      ],
    },
    {
      title: "Stories, Estimation and Sprint Planning",
      summary: "Turning needs into small, estimable, testable work.",
      lessons: [
        {
          title: "Writing user stories with acceptance criteria",
          minutes: 15,
          summary: "The story format, INVEST and testable criteria.",
          explainer: video(
            "A user story describes a need from the user's point of view, and acceptance criteria say how we will know it is done.",
            "A story is a short note on a sticky pad that starts a conversation; the acceptance criteria are the checklist the guest uses to say the meal is right.",
            [["Story", "As a... I want... so that...", "Who, what and why"], ["Criteria", "Given / When / Then", "Testable conditions"], ["INVEST", "Independent, Negotiable, Valuable, Estimable, Small, Testable", "Quality checklist"]],
            "Small, valuable, testable stories keep a sprint predictable.",
            ["Write from the user's view", "Add testable acceptance criteria", "Split big stories until they are small"],
            "Writing technical tasks ('create a database table') as if they were user stories.",
          ),
          content: `## The user story format

A **user story** is a short description of a need, written from the perspective of the person who wants it:

> **As a** <type of user>, **I want** <a goal> **so that** <a benefit>.

**Example:** *As a registered shopper, I want to save my delivery address so that I do not have to type it at every checkout.*

The three parts matter: **who** it is for, **what** they want, and **why** it is valuable. If you cannot state the "so that", ask whether the story is needed.

## The 3 Cs

- **Card:** the short written story.
- **Conversation:** the team and Product Owner talk about details.
- **Confirmation:** the acceptance criteria that confirm it is done.

## Acceptance criteria

Acceptance criteria list the conditions the story must satisfy. A popular format is **Given / When / Then** (Gherkin style):

- **Given** I am logged in and have a saved address
- **When** I reach the checkout page
- **Then** the saved address is pre-filled and I can change it

Good criteria are **specific, testable and from the user's point of view**. They also become the starting point for test cases.

## The INVEST checklist

| Letter | Means | Question |
|---|---|---|
| **I** | Independent | Can it be built without waiting for others? |
| **N** | Negotiable | Is the detail open to discussion? |
| **V** | Valuable | Does it deliver value to a user or customer? |
| **E** | Estimable | Does the team understand it enough to estimate? |
| **S** | Small | Does it fit comfortably within a Sprint? |
| **T** | Testable | Can we tell when it is done? |

## Splitting large stories (epics)

A very large story is an **epic**. Split it into thin vertical slices that each deliver value, for example by workflow step, by user type, by data variation or by simple-then-complex rules. Avoid splitting by technical layer ("do the database, then the screens"), because nothing usable exists until the end.

## Practice

Write a story with at least three Given/When/Then criteria for "reset password by email". Then check it against INVEST and note any letter it fails.`,
          quiz: { passPercent: 60, questions: [
            q("Which is a well-formed user story?", ["Create a users table", "As a shopper, I want to save my address so that checkout is faster", "Improve the system", "Use Java for the backend"], 1, "A good story names the user, the goal and the benefit; the others are tasks or vague statements."),
            q("In INVEST, what does the 'S' stand for?", ["Simple", "Small", "Secure", "Standard"], 1, "Small: the story should fit within a Sprint, which keeps it estimable and predictable."),
            q("What is the best way to split a large epic?", ["By technical layer: database first, then UI", "Into thin slices that each deliver user value", "Leave it large", "Give it to the Scrum Master"], 1, "Vertical slices deliver value early; layer-based splits leave nothing usable until the end."),
          ] },
        },
        {
          title: "Estimation, story points and velocity",
          minutes: 14,
          summary: "Relative estimation and how to use velocity wisely.",
          explainer: video(
            "Teams estimate relative size with story points, and velocity is the amount of work a team completes per Sprint on average, used for forecasting.",
            "Like judging how long a trip takes by comparing it to a trip you already know: 'this is about twice as far as the market', not 'exactly 37 minutes'.",
            [["Compare", "Relative sizing", "Is it bigger or smaller than a known story?"], ["Points", "Fibonacci-like scale", "1, 2, 3, 5, 8, 13"], ["Forecast", "Velocity", "Average points done per Sprint"]],
            "Use velocity to forecast, not to judge people or compare teams.",
            ["Estimate relatively, not in exact hours", "Use the whole team for estimates", "Velocity is a planning aid, not a performance score"],
            "Comparing velocity between teams or pressuring a team to raise its velocity.",
          ),
          content: `## Why relative estimation?

People are poor at predicting exact hours, but good at comparing: *"Story B is about twice as big as story A."* **Story points** capture the **relative effort, complexity and uncertainty** of an item, not a number of hours.

## The scale

Teams often use a **Fibonacci-like sequence**: 1, 2, 3, 5, 8, 13, 20. The growing gaps reflect that bigger items have more uncertainty, so false precision is avoided. Anything larger than the biggest comfortable value is split.

## Planning Poker

1. The Product Owner explains a story and answers questions.
2. Each Developer privately chooses a card.
3. Everyone reveals at the same time (so nobody anchors on another's number).
4. If numbers differ widely, the highest and lowest explain their reasoning.
5. Re-vote until the team roughly agrees.

The *discussion* reveals hidden assumptions, which is often more valuable than the number.

## Reference stories

Pick one or two completed stories as **reference points** (for example, "add a field to a form = 2 points"). New stories are compared to them.

## Velocity

**Velocity** is the sum of story points of items **completed** (meeting the Definition of Done) in a Sprint. After several Sprints the **average velocity** helps forecast: if the team averages 24 points and the backlog has 120 points of ready work, about five Sprints are needed (with uncertainty).

### Using velocity responsibly

- It is **specific to a team**: points are not comparable between teams.
- **Partially done work scores zero** that Sprint.
- Do **not** use it to evaluate individuals or to demand a higher number; teams then inflate estimates and the number loses meaning.
- Use ranges ("between 4 and 6 Sprints") rather than a single date.

## Capacity versus velocity

**Capacity** is the available time in a Sprint (people, holidays, meetings). A team with two people on leave has less capacity, so it may take fewer points even if its average velocity is higher.

## Alternatives

Some teams use **t-shirt sizes** (S, M, L), **no estimates** with small equal-sized stories, or count the number of stories (**throughput**). The aim is the same: predictable flow and honest conversation.

## Practice

A team's last four Sprints delivered 18, 22, 20 and 24 points. Calculate the average velocity, then estimate how many Sprints 150 points of ready backlog might take (give a range using the lowest and highest values).`,
          quiz: { passPercent: 60, questions: [
            q("What do story points measure?", ["Exact hours of work", "Relative effort, complexity and uncertainty", "Developer salary", "Number of lines of code"], 1, "Story points are a relative size that combine effort, complexity and uncertainty."),
            q("A story is only 90% complete at the end of the Sprint. How many points count toward velocity?", ["90% of its points", "All its points", "Zero", "Half"], 2, "Only work meeting the Definition of Done counts; unfinished work scores zero for that Sprint."),
            q("Why shouldn't velocities be compared between teams?", ["Teams estimate differently, so points are not a common unit", "It is illegal", "Velocity is secret", "Only managers can see it"], 0, "Points are relative to each team's own reference stories, so they cannot be compared across teams."),
          ] },
          challenge: {
            title: "Forecast the number of sprints",
            language: "python",
            difficulty: "easy",
            statement: "Read two lines. Line 1 has the points completed in past sprints, separated by spaces. Line 2 has the total points of backlog still to do. Print two numbers separated by a space: the average velocity rounded down to a whole number, and the number of sprints needed at that average (rounded up, using whole-number math).\n\nExample: line 1 '20 24 22', line 2 '100' prints '22 5' (average 22, 100/22 = 4.5 so 5 sprints).",
            starterCode: "velocities = list(map(int, input().split()))\nbacklog = int(input())\n# compute average velocity (floor) and sprints needed (ceiling)\n",
            tests: [
              { input: "20 24 22\n100", expected: "22 5", hidden: false },
              { input: "10 10 10 10\n40", expected: "10 4", hidden: false },
              { input: "18 22 20 24\n150", expected: "21 8", hidden: true },
            ],
            checks: [],
            hints: ["Average = sum(velocities) // len(velocities) gives a floor.", "To round up an integer division use (backlog + avg - 1) // avg.", "Print both values with a space between them."],
            solutionCode: "velocities = list(map(int, input().split()))\nbacklog = int(input())\navg = sum(velocities) // len(velocities)\nsprints = (backlog + avg - 1) // avg\nprint(avg, sprints)",
            solutionExplanation: "We take the floor of the mean velocity, then use integer arithmetic to round the number of sprints up: (backlog + avg - 1) // avg.",
            points: 20,
          },
        },
        {
          title: "Running a realistic sprint and avoiding anti-patterns",
          minutes: 14,
          summary: "A sprint goal, a sensible scope and common mistakes.",
          explainer: video(
            "A good sprint has a clear goal, a scope the team can finish, visible progress each day and a retrospective that leads to real improvements.",
            "Like a road trip with a destination: you pick a realistic distance for the day, check the map each morning and adjust the route, not the destination.",
            [["Goal", "One clear Sprint Goal", "Gives focus and flexibility"], ["Scope", "Pull what you can finish", "Leave room for surprises"], ["Improve", "Retrospective actions", "One or two changes per sprint"]],
            "Healthy sprints are focused on a goal, honest about capacity and improved by retrospectives.",
            ["Write a Sprint Goal everyone can state", "Do not overload the sprint", "Turn retrospective ideas into owned actions"],
            "Adding new work mid-sprint without removing something, so the Sprint Goal is lost.",
          ),
          content: `## A sample Sprint (two weeks)

**Day 1, Sprint Planning.** The Product Owner proposes the goal: *"Customers can check out as guests."* Developers review the top backlog items (guest checkout form, order confirmation email, payment with a saved card, address validation), compare with their velocity (about 24 points) and capacity (one person on leave for two days) and pull in 20 points of work. They break each story into tasks of a day or less and agree the Definition of Done.

**Days 2 to 9.** Each day the Developers hold a 15-minute Daily Scrum at the board, inspect progress toward the goal, spot blockers (for example, the payment sandbox is down) and re-plan. The Scrum Master removes the payment-sandbox blocker with the platform team. The Product Owner answers questions and accepts finished stories as they meet the Definition of Done.

**Day 10, Sprint Review.** The team shows guest checkout working in the test environment to stakeholders. Feedback: add a "continue as guest" link on the cart page. The Product Owner adds it to the Product Backlog.

**Day 10, Retrospective.** The team notices that stories sat waiting for code review. Action: reviews happen within four hours, and the team posts review requests in a shared channel. The action has an owner and is checked at the next Retrospective.

## Writing a good Sprint Goal

A Sprint Goal is a short statement of the **value** the Sprint will deliver. It lets the team stay flexible about *how*, and drop lower-value items if needed while still achieving the goal.

- Weak: *"Complete 12 tickets."*
- Strong: *"Customers can pay as guests without creating an account."*

## Common anti-patterns

| Anti-pattern | Why it hurts | Better approach |
|---|---|---|
| **Overcommitting** | Unfinished work, lost trust | Plan with velocity and capacity; leave slack |
| **Daily Scrum as a status report** | Manager-driven, no collaboration | Developers inspect progress toward the goal together |
| **Scrum Master as a manager** | Removes self-management | Coach, facilitate, remove impediments |
| **Product Owner by committee** | Slow decisions, unclear priorities | One accountable Product Owner |
| **Skipping Retrospectives** | The same problems repeat | Protect the event and pick 1 to 2 actions |
| **Adding work mid-Sprint freely** | Goal lost | Negotiate scope with the PO; swap, do not stack |
| **"Done" without testing** | Hidden quality debt | Enforce the Definition of Done |
| **Hardening or testing sprints** | Late discovery of bugs | Test continuously inside each Sprint |

## Measuring healthy teams

Look at **outcomes**, not just output: customer feedback, defect escape rate, cycle time (how long an item takes from start to Done), and team morale.

## Practice

Your Sprint is at day 5 and a stakeholder asks to add a large new story. Write what the Product Owner and Developers should discuss and two acceptable outcomes.`,
          quiz: { passPercent: 60, questions: [
            q("Which is the best Sprint Goal?", ["Complete 12 tickets", "Customers can pay as guests without creating an account", "Do everything in the backlog", "Work harder"], 1, "A good Sprint Goal describes the value delivered and gives the team a shared focus."),
            q("The Daily Scrum has become a report to the manager. What is the best fix?", ["Cancel it", "Return it to a 15-minute Developer event to inspect progress toward the Sprint Goal", "Make it longer", "Invite more managers"], 1, "The Daily Scrum belongs to the Developers and exists to inspect progress and adapt the plan."),
            q("Which is an anti-pattern?", ["A single accountable Product Owner", "Skipping Retrospectives when the team is busy", "A clear Definition of Done", "Planning with capacity and velocity"], 1, "Skipping Retrospectives removes the team's chance to improve its way of working."),
          ] },
        },
      ],
    },
  ],
  finalAssessment: {
    title: "Agile and Scrum: final assessment",
    timeLimitMinutes: 30,
    questionCount: 12,
    questions: [
      q("What is the main benefit of Agile delivery in short cycles?", ["No planning is required", "Early feedback and reduced risk", "Documentation is forbidden", "Fixed scope"], 1, "Short cycles give early feedback so teams can adapt and reduce risk."),
      q("Which relationship between Agile and Scrum is correct?", ["Scrum is a mindset; Agile is a framework", "Agile is a set of values and principles; Scrum is one framework that applies them", "They are the same", "Scrum replaced Agile"], 1, "Agile is the philosophy; Scrum is a specific framework."),
      q("The Agile Manifesto values working software over:", ["Customers", "Comprehensive documentation", "Teamwork", "Quality"], 1, "Working software over comprehensive documentation."),
      q("'Responding to change over following a plan' means:", ["Never plan", "Plans are a guide and the team adapts when facts change", "Change is forbidden", "Plans must never be written"], 1, "A plan guides the work but does not override new information."),
      q("Which are Scrum accountabilities? (select all that apply)", ["Product Owner", "Scrum Master", "Developers", "Project Manager"], [0, 1, 2], "A Scrum Team has a Product Owner, a Scrum Master and Developers. There is no project manager role."),
      q("Who is accountable for ordering the Product Backlog?", ["Scrum Master", "Product Owner", "Developers", "Stakeholders"], 1, "The Product Owner orders the Product Backlog."),
      q("The Scrum Master is best described as:", ["A manager who assigns tasks", "A servant leader and coach who removes impediments", "A tester", "A customer"], 1, "The Scrum Master serves the team and helps the organisation adopt Scrum."),
      q("Who decides how much work to take into a Sprint?", ["Product Owner", "Developers", "Scrum Master", "CEO"], 1, "Developers forecast how much they can do."),
      q("What is the maximum length of a Sprint?", ["2 weeks", "1 month", "6 weeks", "3 months"], 1, "A Sprint is one month or less."),
      q("The Daily Scrum is:", ["A 15-minute event for Developers to inspect progress toward the Sprint Goal", "A status report to the manager", "A 2-hour planning meeting", "Optional for the Product Owner to run"], 0, "A 15-minute Developer event."),
      q("The Sprint Review is held to:", ["Inspect the Increment with stakeholders and adapt the Product Backlog", "Decide who gets a bonus", "Discuss only team morale", "Plan holidays"], 0, "The Review inspects the outcome and gets stakeholder feedback."),
      q("The Sprint Retrospective focuses on:", ["Demonstrating the product", "How the team worked and how to improve", "Estimating the backlog", "Assigning blame"], 1, "It is about the team's own process, tools and quality."),
      q("Which commitment is associated with the Sprint Backlog?", ["Product Goal", "Sprint Goal", "Definition of Done", "Velocity"], 1, "The Sprint Goal is the commitment for the Sprint Backlog."),
      q("An Increment's commitment is:", ["The Product Goal", "The Sprint Goal", "The Definition of Done", "A release date"], 2, "The Increment must meet the Definition of Done."),
      q("A story that does not meet the Definition of Done at the end of the Sprint:", ["Is still counted as Done", "Is not part of the Increment and returns to the Product Backlog", "Is deleted", "Is released anyway"], 1, "Work not meeting the DoD is not Done."),
      q("Which is the best-formed user story?", ["Implement the database", "As a shopper, I want to save my address so that checkout is faster", "Make it better", "Use microservices"], 1, "It names the user, goal and benefit."),
      q("In INVEST the 'T' stands for:", ["Technical", "Testable", "Timely", "Trusted"], 1, "Testable: we can tell when it is done."),
      q("Which technique is commonly used for team estimation?", ["Planning Poker", "Random guess", "Manager decides", "Coin toss"], 0, "Planning Poker reveals estimates simultaneously and prompts discussion."),
      q("What do story points represent?", ["Hours", "Relative effort, complexity and uncertainty", "Money", "Priority"], 1, "They are a relative measure of size."),
      q("Velocity is best used to:", ["Rank developers", "Forecast how much a team can complete", "Compare teams", "Set salaries"], 1, "Velocity is a planning aid for one team."),
      q("A team averages 20 points and has 100 points of ready backlog. About how many Sprints are needed?", ["2", "5", "10", "20"], 1, "100 / 20 = 5 Sprints, subject to uncertainty."),
      q("Which are Scrum anti-patterns? (select all that apply)", ["Overcommitting every Sprint", "Using the Daily Scrum as a manager status report", "A clear Sprint Goal", "Skipping Retrospectives"], [0, 1, 3], "A clear Sprint Goal is good practice; the others undermine Scrum."),
      q("The Product Owner is:", ["A committee", "One person accountable for maximising product value", "The same as the Scrum Master", "Optional"], 1, "One person, not a committee, owns the backlog."),
      q("Who may cancel a Sprint?", ["Any Developer", "The Scrum Master", "The Product Owner, if the Sprint Goal becomes obsolete", "Any stakeholder"], 2, "Only the Product Owner may cancel a Sprint."),
    ],
  },
  projects: [
    {
      title: "Capstone: plan a two-week sprint",
      brief: "Choose a small product idea (for example a campus event app). Write a Product Goal, ten user stories with Given/When/Then acceptance criteria, estimate them with story points, choose a Sprint Goal and select a realistic Sprint Backlog using an assumed velocity. Add your Definition of Done and one anti-pattern you will avoid. Share a link to your document.",
      rubric: "Valid user stories, testable criteria, sensible estimates, realistic sprint scope, clear Sprint Goal and Definition of Done.",
      kind: "project",
      required: false,
    },
  ],
};

export default course;
