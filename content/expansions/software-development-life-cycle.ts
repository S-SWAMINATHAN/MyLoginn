import { q, topics, type Topic } from "../courses/_helpers";

const planning: Topic[] = [
  ["Why projects follow a life cycle", "A life cycle gives a project a shared sequence of phases, outputs and checkpoints so cost, time and quality can be managed. Without it teams improvise and surprises appear late.", ["Predictable phases", "Clear outputs", "Early risk control"], "A team agrees phases from idea to release before starting.", "Starting to code with no agreed plan."],
  ["Feasibility study", "A feasibility study checks whether a project is technically possible, affordable, legal and worthwhile. It ends with a go or no-go recommendation.", ["Technical, economic, legal, operational", "Go or no-go decision", "Done before large spending"], "A bank checks if it can integrate a new payment network within budget.", "Skipping feasibility for exciting ideas."],
  ["Project scope and objectives", "Scope states what the project will and will not deliver, and objectives state the outcome it must achieve. A clear scope prevents scope creep.", ["Define in and out of scope", "Measurable objectives", "Agree with stakeholders"], "In scope: web ordering; out of scope: delivery tracking.", "Leaving scope open to every new request."],
  ["Stakeholder identification", "Stakeholders are people affected by or influencing the project, such as users, sponsors, support and regulators. Identifying them early prevents missed needs.", ["List all groups", "Understand their needs", "Plan communication"], "Canteen staff are stakeholders of a canteen app.", "Talking only to the sponsor."],
  ["Cost and effort estimation", "Estimation predicts effort, time and cost using expert judgement, analogy, work breakdown or models. Estimates are ranges that improve as knowledge grows.", ["Use ranges", "Break work down", "Review as you learn"], "A 6 to 9 week estimate with stated assumptions.", "Treating an early estimate as a promise."],
  ["Risk management", "Risk management identifies, rates, plans for and monitors uncertainties that could harm the project. Each risk has an owner and a response.", ["Likelihood and impact", "Mitigation plan", "Regular review"], "Risk: key developer leaves; mitigation: knowledge sharing.", "Writing a risk list once and forgetting it."],
  ["Roles in a software project", "Typical roles include product owner or business analyst, project manager, architect, developers, testers, designers and operations. Small teams share roles.", ["Clear responsibilities", "Roles may overlap", "Communication matters more than titles"], "A tester joins requirement reviews.", "Unclear ownership of decisions."],
  ["Project plan and schedule", "A plan sets tasks, dependencies, owners and milestones, often shown as a Gantt chart or a backlog. It is updated as reality changes.", ["Tasks and dependencies", "Milestones", "Update regularly"], "A milestone for the first working prototype.", "Ignoring dependencies."],
  ["Communication and reporting", "Regular status reports, meetings and shared boards keep everyone informed. Good communication surfaces problems early.", ["Short regular updates", "Share risks honestly", "Use one source of truth"], "A weekly one-page status with risks and decisions.", "Hiding bad news until it is large."],
  ["Project success criteria", "Success is judged by delivering the agreed value on time, within budget and at the required quality. User adoption matters as much as delivery.", ["On time and budget", "Meets quality needs", "Users actually use it"], "Success includes 80% of students using the app.", "Measuring only on-time delivery."],
];

const requirements: Topic[] = [
  ["What requirements are", "Requirements describe what a system must do and the qualities it must have. They are the basis for design, testing and acceptance.", ["Describe needs, not solutions", "Testable and clear", "Agreed by stakeholders"], "Users can reset a password by email.", "Writing a solution instead of a need."],
  ["Business, user and system requirements", "Business requirements state organisational goals, user requirements state what users need to do, and system requirements detail what the software must provide. They refine one another.", ["Business goal", "User task", "System behaviour"], "Goal: reduce support calls; user: reset own password; system: send a link.", "Mixing levels in one statement."],
  ["Functional requirements", "Functional requirements describe behaviour such as calculations, workflows and data handling. They answer 'what does it do?'.", ["Behaviour and rules", "Testable", "Traceable"], "The system shall apply a 10% discount to orders over ₹1,000.", "Leaving rules vague."],
  ["Non-functional requirements", "Non-functional requirements describe qualities such as performance, security, usability, reliability and compatibility. They need measurable targets.", ["Performance and security", "Usability and reliability", "Measurable numbers"], "Pages shall load within 2 seconds for 500 users.", "Writing 'fast' or 'secure' with no measure."],
  ["Elicitation techniques", "Requirements are gathered through interviews, workshops, observation, surveys, document analysis and prototypes. Using several techniques finds more needs.", ["Interviews and workshops", "Observation", "Prototypes"], "Watching canteen staff reveals an unspoken need for offline mode.", "Relying on one interview."],
  ["Use cases and user stories", "Use cases describe goals with main, alternative and exception flows, while user stories are short statements of need with acceptance criteria. Both give testable behaviour.", ["Use case: flows", "Story: who, what, why", "Add acceptance criteria"], "As a student I want to reorder past meals so ordering is faster.", "Writing stories with no acceptance criteria."],
  ["Characteristics of good requirements", "Good requirements are clear, complete, consistent, testable, feasible and traceable. Each should have a unique identifier.", ["Unambiguous", "Testable", "Traceable"], "REQ-12 is numbered and has a measurable target.", "Using words like 'easy' or 'fast' alone."],
  ["Requirements review", "Reviewing requirements with developers, testers and users finds ambiguity, gaps and conflicts when fixing them is cheapest. Testers add value early here.", ["Review before design", "Include testers", "Use a checklist"], "A tester questions an unclear refund rule in review.", "Skipping reviews to save time."],
  ["Prioritising requirements", "Teams rank requirements with methods such as MoSCoW (must, should, could, won't) so the most valuable work is done first.", ["Must, Should, Could, Won't", "Value and risk", "Revisit as needs change"], "Payment is a Must; wishlist sharing is a Could.", "Calling everything a Must."],
  ["Requirements traceability", "Traceability links each requirement to design elements, code and tests so coverage and impact of change are visible. A traceability matrix is the common tool.", ["Link requirement to tests", "Show coverage gaps", "Support change impact"], "REQ-12 maps to TC-31 and TC-32.", "Changing a requirement with no impact check."],
  ["Managing changing requirements", "Requirements change, so teams use a change process: record, assess impact, decide and communicate. Agile teams handle change through backlog ordering.", ["Record every change", "Assess cost and risk", "Communicate decisions"], "A new tax rule is added after impact analysis.", "Accepting changes silently."],
];

const design: Topic[] = [
  ["High-level design", "High-level design defines the architecture: major components, their responsibilities and how they communicate. It guides all later detail.", ["Components and interfaces", "Technology choices", "Non-functional needs"], "A web app, an API service and a database.", "Choosing technology before understanding needs."],
  ["Low-level design", "Low-level design details modules, classes, algorithms and database tables so developers can code consistently. It follows the architecture.", ["Class and table design", "Algorithms", "Interfaces between modules"], "A class diagram for orders and payments.", "Over-designing details that will change."],
  ["Software architecture styles", "Common styles include layered, client-server, microservices and event-driven. Each trades simplicity, scalability and independence differently.", ["Layered is simple", "Microservices scale independently", "Event-driven decouples"], "A monolith for a small team; microservices for a large platform.", "Choosing microservices for a tiny project."],
  ["Database design", "Database design organises data into tables, keys and relationships with normalisation to avoid duplication. Good design supports integrity and performance.", ["Primary and foreign keys", "Normalisation", "Indexes for speed"], "Separate tables for customers, orders and items.", "Storing repeated data in many places."],
  ["User interface and UX design", "UI design shapes the screens, and UX design shapes the overall experience. Wireframes and prototypes let users give feedback before coding.", ["Wireframes and prototypes", "Consistency", "Test with users"], "A clickable prototype of the checkout.", "Designing screens without user input."],
  ["Design patterns and principles", "Design principles such as separation of concerns and DRY, and patterns such as MVC, make code easier to change and understand.", ["Separation of concerns", "Reuse common solutions", "Keep it simple"], "MVC separates data, screens and control.", "Forcing patterns where they do not fit."],
  ["API and interface design", "Interfaces define how components talk, including inputs, outputs and errors. Clear contracts let teams work in parallel.", ["Document the contract", "Version changes", "Handle errors consistently"], "A REST API documented before implementation.", "Changing an interface without notice."],
  ["Security by design", "Security should be designed in from the start: authentication, authorisation, input validation, encryption and logging. Retrofitting is costly and weak.", ["Least privilege", "Validate input", "Encrypt sensitive data"], "Roles decide who may refund an order.", "Adding security after launch."],
  ["Design reviews", "Design reviews let peers check the design against requirements, standards and risks before coding. They catch costly flaws early.", ["Review against requirements", "Check risks and standards", "Record decisions"], "An architect reviews the data flow for privacy.", "Treating reviews as a formality."],
  ["Prototyping", "A prototype is an early, partial version used to learn and get feedback. It can be throwaway or evolve into the product.", ["Learn cheaply", "Get user feedback", "Decide throwaway or evolutionary"], "A click-through mock of the booking flow.", "Shipping a throwaway prototype as the product."],
];

const build: Topic[] = [
  ["Coding standards", "Coding standards define naming, formatting and structure so code is consistent and readable. Linters enforce them automatically.", ["Consistent naming", "Automated linting", "Readable structure"], "A rule that functions use camelCase.", "Arguing over style instead of automating it."],
  ["Version control", "Version control tracks changes to code, supports branching and teamwork and lets you return to earlier versions. Git is the most common system.", ["Commit small changes", "Use branches", "Write clear messages"], "A feature branch merged by pull request.", "Committing huge unrelated changes."],
  ["Code reviews", "Code reviews have another developer examine changes for correctness, clarity and risks before merging. They spread knowledge and catch defects.", ["Small reviewable changes", "Constructive comments", "Check tests"], "A reviewer spots a missing null check.", "Approving without reading."],
  ["Unit testing during implementation", "Developers write unit tests alongside code to check small parts and enable safe change. Fast tests run on every commit.", ["Fast and isolated", "Run on every change", "Cover important logic"], "A unit test checks the tax calculation.", "Writing tests only after bugs appear."],
  ["Continuous integration", "CI builds and tests every change automatically so problems appear within minutes. A broken build is fixed first.", ["Automated build", "Automated tests", "Fast feedback"], "A pipeline runs tests on every push.", "Leaving the build red."],
  ["Refactoring and technical debt", "Refactoring improves code structure without changing behaviour, paying down technical debt. Tests make it safe.", ["Small steps", "Keep behaviour same", "Rely on tests"], "Splitting a 300-line function into small ones.", "Refactoring without tests."],
  ["Debugging and logging", "Debugging finds and fixes the cause of a failure, helped by logs, breakpoints and reproducible steps. Good logs explain what happened without exposing secrets.", ["Reproduce first", "Read the logs", "Never log passwords"], "A log line shows which request failed.", "Guessing instead of reproducing."],
  ["Configuration and environments", "Applications run in development, test, staging and production environments with separate configuration. Secrets belong in a secure store, not in code.", ["Separate environments", "Externalise configuration", "Protect secrets"], "The database URL comes from an environment variable.", "Committing passwords to the repository."],
  ["Documentation for developers", "Useful documentation includes a README, architecture notes, API docs and decision records. Keep it near the code and up to date.", ["README first", "Document decisions", "Keep it current"], "A README explains how to run the project.", "Writing documents that nobody updates."],
  ["Secure coding basics", "Secure coding means validating input, using parameterised queries, handling errors safely, managing secrets and updating dependencies. Many attacks exploit simple mistakes.", ["Validate and sanitise input", "Parameterised queries", "Update dependencies"], "A query uses parameters rather than string concatenation.", "Trusting user input."],
];

const release: Topic[] = [
  ["Testing in the life cycle", "Testing runs throughout the life cycle: reviews of requirements and design, unit tests during coding and system and acceptance tests before release. Early testing reduces cost.", ["Test early and often", "Several levels", "Both static and dynamic"], "A tester reviews the requirement before design starts.", "Treating testing as a final phase only."],
  ["Test levels and the V-model", "The V-model pairs each development phase with a matching test level, such as acceptance testing for business requirements. Test planning begins alongside each phase.", ["Requirements to acceptance", "Design to integration", "Detailed design to unit"], "System requirements are checked by system tests.", "Planning tests only at the end."],
  ["Deployment strategies", "Deployment can be big-bang, rolling, blue-green or canary. Safer strategies release to few users first and allow quick rollback.", ["Blue-green swaps environments", "Canary releases to a few users", "Rollback plan"], "5% of users get the new version first.", "Releasing to everyone with no rollback."],
  ["Release management", "Release management plans, schedules and coordinates releases, including approvals, notes and communication. It reduces surprises for users and support.", ["Release notes", "Go or no-go decision", "Communication plan"], "A checklist signed before go-live.", "Releasing on a Friday evening with no support."],
  ["DevOps and continuous delivery", "DevOps joins development and operations with automation, and continuous delivery keeps software ready to release at any time. Frequent small releases lower risk.", ["Automate build, test, deploy", "Small frequent releases", "Shared ownership"], "A pipeline deploys to staging automatically.", "Automating a broken process."],
  ["Monitoring and operations", "After release, monitoring tracks errors, performance and usage, and alerts the team to problems. Logs and dashboards guide fixes.", ["Metrics and logs", "Alerts", "On-call support"], "An alert fires when errors spike.", "Releasing with no monitoring."],
  ["Maintenance types", "Maintenance is corrective (fix defects), adaptive (keep up with change), perfective (improve) and preventive (reduce future problems). It is most of a system's life.", ["Corrective", "Adaptive and perfective", "Preventive"], "Supporting a new browser version is adaptive.", "Underestimating maintenance cost."],
  ["Change and incident management", "Change management controls modifications to production, and incident management restores service quickly when something fails. Both reduce risk and downtime.", ["Approve and record changes", "Restore service first", "Review incidents"], "A post-incident review lists three actions.", "Making unrecorded production changes."],
  ["Retirement and migration", "Systems are eventually replaced or retired, requiring data migration, user communication and archiving. Plan this early.", ["Migrate data safely", "Inform users", "Archive as required"], "Old records move to the new system with checks.", "Switching off a system without a migration plan."],
  ["Documentation and knowledge transfer", "Handover documents, runbooks and training let support teams run the system. Knowledge should not live only in one person's head.", ["Runbooks", "Training", "Shared knowledge"], "A runbook explains how to restart the service.", "Depending on one expert."],
];

const models: Topic[] = [
  ["Waterfall strengths and weaknesses", "Waterfall suits stable, well-understood requirements with clear milestones and documentation. It struggles with change and delays testing and feedback.", ["Clear phases", "Heavy documentation", "Late feedback"], "Building a regulated system with fixed rules.", "Using it when requirements will change."],
  ["V-model in practice", "The V-model adds early test planning to a sequential process and suits safety-critical work where traceability is vital. It remains rigid when requirements shift.", ["Test planning with each phase", "Strong traceability", "Rigid under change"], "A medical device follows a V-model.", "Ignoring change requests."],
  ["Iterative and incremental models", "Iterative models refine the product through cycles and incremental models deliver it in pieces. Together they give early working software and feedback.", ["Repeat and refine", "Deliver in pieces", "Learn from each cycle"], "Release core booking first, add payments later.", "Skipping design in early iterations."],
  ["Spiral model", "The Spiral model repeats planning, risk analysis, engineering and evaluation in each loop, using prototypes to reduce risk. It suits large, risky projects.", ["Risk analysis each loop", "Prototypes", "Needs risk expertise"], "A new air-traffic system is built in risk-driven loops.", "Using it for small simple projects."],
  ["Agile models", "Agile delivers working software in short cycles with continuous collaboration and change. Scrum and Kanban are common frameworks.", ["Short cycles", "Customer collaboration", "Adapt to change"], "A start-up ships every two weeks.", "Calling a chaotic process Agile."],
  ["Rapid application development and prototyping", "RAD builds working prototypes quickly with user feedback and reusable components. It works for smaller systems with active users.", ["Fast prototypes", "Constant user feedback", "Reusable components"], "A low-code tool builds an internal dashboard.", "Skipping architecture for large systems."],
  ["Big bang and code-and-fix", "Big bang and code-and-fix skip planning and design, which works only for tiny throwaway programs. They become costly as size grows.", ["No planning", "High risk", "Fine only for tiny work"], "A weekend hack to test an idea.", "Scaling a hack into a product unchanged."],
  ["Hybrid and tailored approaches", "Many organisations blend models, for example Agile delivery inside a regulated governance process. Choose practices that fit the context.", ["Mix practices", "Meet regulation", "Keep feedback loops"], "Agile sprints with formal sign-off documents.", "Combining the worst of both."],
  ["Choosing an SDLC model", "Choose by requirement stability, risk, customer involvement, team size and regulation. There is no single best model.", ["Stability and risk", "Customer involvement", "Regulation and team size"], "Uncertain needs and a close customer favour Agile.", "Picking a model for fashion."],
  ["SDLC in interviews", "Interviews ask for phases, outputs, model comparisons and where testing fits. Give examples and justify choices.", ["Know phases and outputs", "Compare models", "Explain testing's place"], "Compare Waterfall and Agile for a changing project.", "Reciting definitions without reasoning."],
];

export default {
  slug: "software-development-life-cycle", weeks: 5, finalDraw: 15,
  objectives: ["Describe planning, requirements, design, build, release and maintenance activities in detail", "Compare SDLC models and justify a choice for a given project"],
  modules: [
    topics("Planning and Feasibility", "Starting a project well.", planning, [
      q("A feasibility study ends with:", ["A go or no-go recommendation", "Release notes", "A test report", "A design document"], 0, "Decision."),
      q("Scope defines:", ["What is and is not delivered", "Only the budget", "Only the staff", "Only the dates"], 0, "In and out."),
      q("Estimates should be:", ["Ranges reviewed as knowledge grows", "Fixed promises", "Secret", "Skipped"], 0, "Improve with knowledge."),
      q("A risk entry should include:", ["Likelihood, impact, owner and response", "Only a name", "Only a date", "Only cost"], 0, "Manage it."),
      q("Stakeholders are:", ["Anyone affected by or influencing the project", "Only developers", "Only managers", "Only users"], 0, "Broad group."),
    ]),
    topics("Requirements Engineering", "Capturing and managing needs.", requirements, [
      q("A non-functional requirement is:", ["Pages load within 2 seconds", "User can log in", "Admin adds product", "User logs out"], 0, "Quality."),
      q("MoSCoW stands for:", ["Must, Should, Could, Won't", "Make, Ship, Check, Wait", "Plan, Do, Check, Act", "Fast, Cheap, Good"], 0, "Prioritisation."),
      q("Traceability links requirements to:", ["Tests and design", "Salaries", "Holidays", "Colours"], 0, "Coverage."),
      q("A good requirement is:", ["Testable and unambiguous", "Vague", "Long", "Verbal only"], 0, "Quality criteria."),
      q("Who should review requirements?", ["Developers, testers and users", "Only the sponsor", "Nobody", "Only testers"], 0, "Many viewpoints."),
    ]),
    topics("Design", "Architecture, data and interfaces.", design, [
      q("High-level design defines:", ["Architecture and components", "Variable names", "Test cases", "Release notes"], 0, "Big picture."),
      q("Normalisation helps to:", ["Avoid duplicated data", "Speed up the network", "Hide tables", "Delete keys"], 0, "Integrity."),
      q("Security by design means:", ["Planning security from the start", "Adding it after launch", "Hiding the app", "Skipping reviews"], 0, "Early."),
      q("A prototype is:", ["An early partial version for feedback", "A final release", "A bug", "A server"], 0, "Learn."),
      q("Design reviews catch:", ["Flaws before coding", "Typing mistakes only", "Hardware faults", "Nothing"], 0, "Cheap to fix."),
    ]),
    topics("Implementation and Build Practices", "Coding with quality.", build, [
      q("Code reviews help by:", ["Catching defects and sharing knowledge", "Slowing teams", "Replacing tests", "Hiding code"], 0, "Quality."),
      q("Continuous integration:", ["Builds and tests every change", "Runs once a year", "Replaces developers", "Deploys manually"], 0, "Fast feedback."),
      q("Refactoring changes:", ["Structure but not behaviour", "Behaviour but not structure", "Both always", "Neither"], 0, "Cleaner code."),
      q("Secrets should be stored:", ["In a secure store, not in code", "In the repository", "In comments", "In emails"], 0, "Protect."),
      q("Parameterised queries prevent:", ["SQL injection", "Slow loading", "Typos", "Colour issues"], 0, "Security."),
    ]),
    topics("Testing, Release and Maintenance", "From verification to retirement.", release, [
      q("The V-model pairs requirements with:", ["Acceptance testing", "Unit testing", "Deployment", "Retirement"], 0, "Validation."),
      q("A canary release sends the new version to:", ["A small share of users first", "Everyone", "Nobody", "Only testers"], 0, "Reduces risk."),
      q("Adaptive maintenance is:", ["Keeping up with environment change", "Fixing crashes", "Adding features", "Refactoring only"], 0, "Adapt."),
      q("Incident management aims to:", ["Restore service quickly", "Assign blame", "Delay fixes", "Hide failures"], 0, "Restore."),
      q("Monitoring gives:", ["Alerts and metrics after release", "Requirements", "Designs", "Contracts"], 0, "Operations."),
    ]),
    topics("SDLC Models Compared", "Choosing the right approach.", models, [
      q("Waterfall suits:", ["Stable requirements", "Constant change", "No planning", "Tiny hacks"], 0, "Stable needs."),
      q("The Spiral model stresses:", ["Risk analysis", "No documents", "Daily meetings", "Pair programming"], 0, "Risk."),
      q("Agile suits:", ["Changing requirements", "Fixed contracts only", "No customer", "No testing"], 0, "Change."),
      q("Choosing a model depends on:", ["Stability, risk and involvement", "Fashion", "Office colour", "Tester age"], 0, "Context."),
      q("Code-and-fix is suitable for:", ["Tiny throwaway programs", "Banks", "Hospitals", "Large teams"], 0, "Only tiny."),
    ]),
  ],
  finalQuestions: [
    q("Which phase asks 'is this project possible and worthwhile'?", ["Feasibility", "Maintenance", "Deployment", "Testing"], 0, "Feasibility study."),
    q("Which are functional requirements? (select all that apply)", ["Calculate tax on an order", "Send a reset email", "Pages load in 2 seconds", "Apply a coupon"], [0, 1, 3], "Performance is non-functional."),
    q("Technical debt arises from:", ["Shortcuts in design or code", "Bank loans", "Servers", "Tests"], 0, "Pay it down."),
    q("Blue-green deployment:", ["Switches traffic between two environments", "Uses two languages", "Uses two teams", "Is a test type"], 0, "Fast rollback."),
    q("Preventive maintenance:", ["Reduces future problems", "Fixes crashes", "Adds features", "Retires software"], 0, "Refactor, upgrade."),
    q("The V-model is best for:", ["Traceable, safety-critical work", "Fast changing apps", "Weekend hacks", "No testing"], 0, "Traceability."),
    q("Which model uses prototypes and risk analysis in each loop?", ["Spiral", "Waterfall", "Kanban", "Code-and-fix"], 0, "Spiral."),
    q("A runbook is:", ["Instructions to operate the system", "A marketing plan", "A test", "A contract"], 0, "Operations aid."),
    q("Traceability supports:", ["Impact analysis of change", "Hiding bugs", "Longer meetings", "Random coding"], 0, "Link to tests."),
    q("A Definition of Done-like quality gate in release is called:", ["A release checklist", "A bonus", "A holiday", "A style guide"], 0, "Go or no-go."),
  ],
};
