import { L, mk, q } from "./_helpers";

export default mk({
  slug: "software-development-life-cycle", title: "Software Development Life Cycle (SDLC)", category: "Software Engineering", track: "essential-it-skills", level: "Beginner", weeks: 2,
  description: "Understand the phases of the software development life cycle and compare Waterfall, V-model, Iterative, Spiral and Agile models, including where testing fits into each and how teams choose a model.",
  audience: "Students and early-career IT professionals, testers, analysts and developers who need to understand how software projects are organised.",
  objectives: ["Describe each SDLC phase and its main outputs", "Compare Waterfall, V-model, Iterative, Spiral and Agile", "Explain how testing activities map to development phases", "Choose a suitable model for a given project", "Explain the role of requirements, design, build, test, deploy and maintain", "Identify risks of skipping a phase"],
  tags: ["SDLC", "Waterfall", "Agile", "V-Model", "Software Engineering"], relatedSlugs: ["software-testing-life-cycle", "agile-and-scrum"],
  modules: [
    { title: "The SDLC Phases", summary: "From idea to maintenance.", lessons: [
      L("What is the SDLC and why it exists", 11,
`## The idea

The **Software Development Life Cycle (SDLC)** is the structured sequence of activities that turns an idea into working software and keeps it running. It gives a team a shared map: what to do, in what order, who is responsible and what to produce at each step.

## Why use an SDLC

- **Predictability:** clear steps make cost, time and quality easier to plan.
- **Quality:** reviews and tests happen at planned points.
- **Communication:** everyone knows the current phase and the expected outputs.
- **Risk control:** problems are found earlier, when they are cheaper.

## The classic phases

1. **Planning and feasibility:** is the project worthwhile and possible (cost, time, technology)?
2. **Requirements analysis:** what must the system do? Output: requirements document or user stories.
3. **Design:** how will it work? Architecture, database, screens, interfaces.
4. **Implementation (coding):** developers build the design.
5. **Testing:** verify the software against the requirements.
6. **Deployment:** release to users.
7. **Maintenance:** fix defects, add features and keep the system running.

## Outputs, not just activities

Each phase produces something that the next phase uses, such as a requirements specification, a design document, source code, test reports and release notes. If an output is weak, the next phase suffers.

## The cost of late changes

A mistake in requirements that is discovered in production may cost many times more to fix than if it had been found in review. This is the basic economic reason for early testing and reviews.

## Practice

Choose a simple app idea (a canteen ordering app). Write one sentence for what happens in each of the seven phases.`,
        [q("What is the main purpose of an SDLC?", ["To replace programmers", "To give a structured way to plan, build, test and maintain software", "To sell software", "To remove testing"], 1, "The SDLC organises activities, outputs and responsibilities."), q("Which phase produces the requirements specification?", ["Maintenance", "Requirements analysis", "Deployment", "Coding"], 1, "Requirements analysis defines what the system must do."), q("Why are late changes costly?", ["They are not", "Mistakes found late affect more work already done", "Developers charge extra", "Computers slow down"], 1, "The later a defect is found, the more work depends on it.")],
        ["The SDLC is the sequence of phases that takes software from an idea to a maintained product.", "Like building a house: plan, draw, build, inspect, hand over and maintain.", [["Plan", "Feasibility and requirements", "Decide what to build"], ["Build", "Design and implement", "Turn needs into software"], ["Verify and run", "Test, deploy, maintain", "Keep it working"]], "Clear phases and outputs make projects predictable and defects cheaper.", ["Each phase has an output", "Test and review early", "Maintenance is part of the life cycle"], "Skipping requirements and design to start coding quickly."]),
      L("Requirements, design and implementation", 14,
`## Requirements analysis

The team gathers and documents what stakeholders need. Techniques include interviews, workshops, observation, surveys and studying existing systems. The output is a set of **requirements**:

- **Functional:** what the system does (a user can reset a password).
- **Non-functional:** how well it does it (the page loads in under two seconds).

Good requirements are **clear, testable, complete, consistent and traceable**.

## Design

Design converts requirements into a plan for building.

- **High-level design (architecture):** major components, technology choices, how they communicate.
- **Low-level (detailed) design:** classes, database tables, algorithms and screens.
- **UI/UX design:** wireframes and prototypes that users can review.

A design review catches problems before any code is written.

## Implementation

Developers write code following the design and coding standards. Good practice includes:

- **Version control** (such as Git) with small, reviewable changes
- **Code reviews** by another developer
- **Unit tests** written alongside the code
- **Continuous integration** that builds and tests every change

## How the phases connect

A requirement says *"users can reset their password by email"*. The design chooses an email service and a token table. The code implements the endpoint and screens. Tests later verify each part against the original requirement, so the requirement ID links all four.

## Common problems

- Vague requirements lead to rework.
- Designing without involving users produces unusable screens.
- Skipping code review lets defects accumulate.

## Practice

For the requirement "Users can book a table online", write one functional and one non-functional requirement, and one design decision.`,
        [q("Which is a non-functional requirement?", ["Users can reset a password", "Pages load within two seconds", "Admins can add a product", "A user can log out"], 1, "Performance targets describe how well the system works."), q("What does a design review achieve?", ["Finds problems before coding starts", "Replaces testing", "Speeds up the computer", "Removes requirements"], 0, "Reviewing the design catches flaws when they are cheap to fix."), q("Which practice improves code quality during implementation?", ["Skipping reviews", "Code reviews and unit tests", "Large untested changes", "No version control"], 1, "Reviews and unit tests catch defects early.")],
        ["Requirements say what, design says how, and implementation builds it.", "Like an architect's brief, the blueprint and then the construction.", [["Requirements", "What the system must do", "Functional and non-functional"], ["Design", "How it will be built", "Architecture, data, screens"], ["Implementation", "Writing the code", "Reviews and unit tests"]], "Each phase's output is the next phase's input, linked by traceability.", ["Requirements must be testable", "Review designs early", "Use version control and reviews"], "Starting to code before requirements are clear."]),
      L("Testing, deployment and maintenance", 13,
`## Testing in the SDLC

Testing verifies that the software meets requirements and finds defects before users do. It is not only a late phase: unit tests happen while coding, integration tests as parts join, system tests when the product is assembled and acceptance tests before release.

## Deployment

**Deployment (release)** puts the software into the environment where users use it. Modern teams automate it:

- **Build and package** the software
- **Deploy to staging** and run final checks
- **Release to production**, sometimes gradually (to 5% of users first) so problems affect few people
- **Roll back** quickly if something goes wrong

Release notes tell users and support staff what changed.

## Maintenance

Most of a system's life is maintenance. Types:

| Type | Purpose | Example |
|---|---|---|
| **Corrective** | Fix defects found in production | Fix a wrong tax total |
| **Adaptive** | Keep working as the environment changes | Support a new browser or OS version |
| **Perfective** | Improve or add features | Add UPI payment |
| **Preventive** | Reduce future problems | Refactor fragile code, upgrade libraries |

## Feedback loop

Production monitoring, support tickets and user feedback feed new requirements back to the start. The life cycle is therefore a loop, not a straight line.

## Retirement

Eventually a system is replaced or retired, with data migrated and users informed.

## Practice

Classify each as corrective, adaptive, perfective or preventive: (a) support a new Android version, (b) fix a crash on checkout, (c) add dark mode, (d) upgrade an outdated library to remove a security risk.`,
        [q("Releasing a change to 5% of users first is mainly done to:", ["Hide the release", "Limit the impact if there is a problem", "Skip testing", "Save disk space"], 1, "Gradual rollout reduces risk and allows quick rollback."), q("Adding UPI payment to an existing app is:", ["Corrective maintenance", "Perfective maintenance", "Retirement", "Requirements freeze"], 1, "Adding or improving features is perfective maintenance."), q("Why is the SDLC described as a loop?", ["Feedback and new needs return to requirements", "It never ends by law", "Testing repeats forever", "Developers prefer circles"], 0, "Production feedback creates new requirements.")],
        ["After testing, software is deployed and then maintained, with feedback starting the next cycle.", "Like opening a restaurant: serve, collect feedback and keep improving the menu.", [["Test", "Verify before release", "Unit to acceptance"], ["Deploy", "Release safely", "Staging, gradual rollout, rollback"], ["Maintain", "Fix, adapt, improve", "Feedback starts the loop"]], "Releasing safely and maintaining well is most of a system's life.", ["Deploy gradually", "Know the four maintenance types", "Feedback feeds requirements"], "Treating deployment as the end of the project."]),
    ] },
    { title: "SDLC Models", summary: "Waterfall, V-model, iterative, spiral and Agile.", lessons: [
      L("Waterfall and the V-model", 14,
`## Waterfall

**Waterfall** is a sequential model: requirements, design, implementation, testing, deployment, maintenance. Each phase is completed and approved before the next starts, like water flowing down steps.

**Strengths:** simple, clear milestones, strong documentation, easy to manage fixed contracts.
**Weaknesses:** late testing, changes are expensive, the customer sees the product only at the end.
**Best when:** requirements are stable and well understood, such as regulated or small, well-defined projects.

## The V-model

The **V-model** extends Waterfall by pairing every development phase with a **testing phase** that is planned at the same time.

| Development (left side) | Matching test level (right side) |
|---|---|
| Business requirements | Acceptance testing |
| System requirements | System testing |
| Architecture / high-level design | Integration testing |
| Detailed / module design | Unit testing |

Test planning for each level starts when its matching document is written, so test cases exist early and requirements are reviewed for testability. The base of the V is coding.

**Strengths:** early test planning, clear traceability, good for safety-critical systems.
**Weaknesses:** still rigid, working software appears late.

## Verification and validation in the V

The left side focuses on **verification** (reviews and static checks of documents), and the right side on **validation** (running the software and checking it meets needs).

## Practice

Draw the V-model for a hospital billing system and write which test level checks each document: user needs, system specification, architecture, class design.`,
        [q("In the V-model, which test level matches business requirements?", ["Unit testing", "Integration testing", "Acceptance testing", "Performance testing only"], 2, "Business requirements are validated by acceptance testing."), q("Waterfall is most suitable when:", ["Requirements are unclear and changing", "Requirements are stable and well understood", "Customers want daily releases", "No documentation is allowed"], 1, "Waterfall fits stable, well-defined requirements."), q("A key advantage of the V-model over plain Waterfall is:", ["No testing", "Test planning begins early alongside each phase", "Faster coding", "No documents"], 1, "Each development phase has a test level planned at the same time.")],
        ["Waterfall runs phases in order; the V-model pairs each phase with a test level planned early.", "Waterfall is a one-way staircase; the V-model adds a matching inspection for each step.", [["Waterfall", "Sequential phases", "Stable requirements"], ["V-model", "Paired test levels", "Early test planning"], ["Trade-off", "Rigid but traceable", "Late working software"]], "Both favour planning and documentation over rapid change.", ["Waterfall suits stable needs", "V-model plans tests early", "Both are rigid when requirements change"], "Using Waterfall for a product whose requirements are expected to change often."]),
      L("Iterative, Spiral and Agile models", 15,
`## Iterative and incremental

An **iterative** model builds the product in repeated cycles, each refining the previous one. An **incremental** model delivers it in pieces, each adding functionality. Most real projects are both: release a small working version, gather feedback, improve and add more.

## Spiral model

The **Spiral** model repeats four steps in each loop: **plan, risk analysis, engineer, evaluate**. Its distinctive feature is explicit **risk analysis** and prototyping at every turn, so it suits large, expensive, high-risk projects. The cost is complexity and the need for strong risk-management skills.

## Agile

**Agile** delivers working software in short cycles (often 1 to 4 weeks), with continuous customer collaboration and the freedom to change plans. Frameworks include **Scrum**, **Kanban** and **Extreme Programming (XP)**.

## Comparison

| Model | Planning | Change | Feedback | Typical fit |
|---|---|---|---|---|
| Waterfall | All up front | Hard | At the end | Stable, regulated |
| V-model | All up front, tests planned early | Hard | At the end | Safety-critical |
| Iterative / incremental | Per iteration | Moderate | After each increment | Medium projects |
| Spiral | Risk-driven per loop | Moderate | Each loop | Large, high-risk |
| Agile | Continuous, just enough | Welcomed | Every sprint | Uncertain, fast-changing needs |

## Choosing a model

Ask:

1. **How stable** are the requirements?
2. **How risky or safety-critical** is the product?
3. **How involved** can the customer be?
4. **How big** is the team and project?
5. **What does the contract or regulator require?**

Many organisations **blend** models: for example an Agile team working inside a regulated process that requires traceability documents.

## Practice

Recommend and justify a model for: (a) a start-up mobile app with unclear features, (b) software for a medical device, (c) a government tax system rewrite with fixed legislation.`,
        [q("Which model puts explicit risk analysis in every loop?", ["Waterfall", "Spiral", "Kanban", "V-model"], 1, "The Spiral model's defining feature is risk analysis and prototyping in each loop."), q("A start-up with unclear, changing requirements will usually choose:", ["Waterfall", "Agile", "V-model", "No process"], 1, "Agile welcomes change and delivers feedback every cycle."), q("Which factor should influence the choice of SDLC model?", ["The weather", "How stable the requirements are", "The colour of the logo", "The tester's age"], 1, "Requirement stability, risk, customer involvement and regulation guide the choice.")],
        ["Iterative, spiral and Agile models build in cycles and use feedback to reduce risk.", "Instead of building the whole bridge before opening it, you open a small bridge, learn from traffic and extend it.", [["Iterative", "Repeat and refine", "Feedback each cycle"], ["Spiral", "Risk analysis each loop", "Large high-risk projects"], ["Agile", "Short sprints", "Welcomes change"]], "Choose by requirement stability, risk and customer involvement, and blend if needed.", ["Cycles reduce risk", "Spiral is risk-driven", "Agile suits changing needs"], "Picking a model because it is popular rather than because it fits the project."]),
    ] },
  ],
  final: [
    q("What is the main purpose of the SDLC?", ["To structure planning, building, testing and maintaining software", "To avoid customers", "To remove testers", "To write documents only"], 0, "The SDLC organises the work and its outputs."),
    q("Which phase defines what the system must do?", ["Requirements analysis", "Deployment", "Maintenance", "Coding"], 0, "Requirements analysis."),
    q("A page must load within two seconds. This is a:", ["Functional requirement", "Non-functional requirement", "Design", "Defect"], 1, "Performance is non-functional."),
    q("Which activity catches design problems before coding?", ["Design review", "Production monitoring", "Release notes", "Load testing"], 0, "Design reviews."),
    q("Gradual rollout to a small group of users helps to:", ["Limit impact of problems", "Skip testing", "Avoid support", "Hide the release"], 0, "It reduces risk."),
    q("Fixing a crash found in production is:", ["Corrective maintenance", "Adaptive maintenance", "Perfective maintenance", "Preventive maintenance"], 0, "Corrective."),
    q("Supporting a new operating system version is:", ["Adaptive maintenance", "Corrective maintenance", "Retirement", "Requirements"], 0, "Adapting to a new OS is adaptive maintenance."),
    q("In Waterfall, testing generally happens:", ["Throughout, in tiny cycles", "After implementation is complete", "Before requirements", "Never"], 1, "After implementation."),
    q("The V-model pairs business requirements with:", ["Unit tests", "Acceptance tests", "Code review only", "Deployment"], 1, "Acceptance testing."),
    q("The V-model pairs detailed design with:", ["Unit testing", "System testing", "Acceptance testing", "Maintenance"], 0, "Unit testing."),
    q("Which model is driven by explicit risk analysis in every loop?", ["Spiral", "Waterfall", "V-model", "Big bang"], 0, "The Spiral model analyses risk in each loop."),
    q("Agile is best suited to:", ["Stable fixed requirements only", "Changing requirements and frequent feedback", "No customer involvement", "No testing"], 1, "Agile welcomes change."),
    q("Which are factors in choosing a model? (select all that apply)", ["Requirement stability", "Risk level", "Customer involvement", "Tester's shoe size"], [0, 1, 2], "Stability, risk and involvement matter."),
    q("Why is the SDLC called a loop?", ["Feedback from production starts new requirements", "Phases never end by law", "Developers like loops", "Testing repeats forever"], 0, "Feedback drives new cycles."),
    q("Which statement is true about Waterfall?", ["Changes are cheap late in the project", "It has clear milestones but is rigid", "Customers see the product weekly", "It needs no documents"], 1, "Clear milestones, rigid."),
  ],
  project: { title: "Capstone: choose and justify a model", brief: "Pick three different projects (for example a campus app, a bank core system and a research prototype). For each, recommend an SDLC model, list the phases with their outputs, and justify the choice using requirement stability, risk and customer involvement. Present it as a one-page comparison table." },
});
