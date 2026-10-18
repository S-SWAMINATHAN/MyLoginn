import type { RawQ, RawSubject } from "../types";
import { m, m2, topic } from "./build";

const sdlc: RawQ[] = [
  m("Which SDLC model completes each phase fully before the next begins?", ["Waterfall", "Spiral", "Agile", "Incremental"], "Waterfall is linear and sequential."),
  m("Which model is risk-driven and combines iterative development with prototyping?", ["Spiral model", "Waterfall model", "V-model", "Big bang model"], "Barry Boehm's spiral model repeats planning, risk analysis, engineering and evaluation."),
  m("The V-model emphasises:", ["A test level paired with each development phase", "No testing", "Only coding", "Random iterations"], "It is the verification and validation model."),
  m("Which model is best when requirements are unclear and users need to see something early?", ["Prototyping model", "Waterfall", "V-model", "Big bang"], "A prototype helps users refine requirements."),
  m("The correct order of classic SDLC phases is:", ["Requirements → Design → Implementation → Testing → Deployment → Maintenance", "Design → Requirements → Testing → Coding", "Coding → Testing → Requirements", "Testing → Design → Deployment"], "Each phase produces inputs for the next."),
  m("Which model delivers the system in small working pieces that add functionality?", ["Incremental model", "Waterfall model", "Big bang model", "Code-and-fix"], "Each increment is a usable part of the product."),
  m("Which phase usually consumes the most effort over a product's lifetime?", ["Maintenance", "Requirements", "Design", "Deployment"], "Corrective, adaptive and perfective maintenance continue for years."),
];

const requirements: RawQ[] = [
  m("'The system shall allow users to reset their password' is a:", ["Functional requirement", "Non-functional requirement", "Design constraint", "Test case"], "It describes what the system must do."),
  m("'Pages must load within 2 seconds' is a:", ["Non-functional requirement", "Functional requirement", "Use case", "User story"], "It describes a quality attribute (performance)."),
  m("SRS stands for:", ["Software Requirements Specification", "System Release Schedule", "Software Risk Survey", "Standard Review Sheet"], "The SRS documents what the software must do."),
  m("Which technique gathers requirements by watching users at work?", ["Observation", "Unit testing", "Code review", "Refactoring"], "Other techniques: interviews, workshops, questionnaires and prototyping."),
  m("A good requirement should be:", ["Clear, testable and unambiguous", "Long and detailed in technical jargon", "Open to interpretation", "Written after coding"], "If it cannot be tested, it cannot be verified."),
  m("In MoSCoW prioritisation, 'M' stands for:", ["Must have", "Maybe", "Minimum", "Monitor"], "Must, Should, Could, Won't (this time)."),
];

const design: RawQ[] = [
  m("Good software design aims for:", ["High cohesion and low coupling", "Low cohesion and high coupling", "High coupling and high cohesion", "No modules"], "Modules should be focused and loosely connected."),
  m("Cohesion measures:", ["How closely related the responsibilities within a module are", "How many modules depend on each other", "Code length", "Execution speed"], "Coupling measures the dependence between modules."),
  m("The 'S' in SOLID stands for:", ["Single Responsibility Principle", "Simple Code Principle", "Static Typing", "Structured Design"], "A class should have one reason to change."),
  m("Which design pattern ensures a class has only one instance?", ["Singleton", "Factory", "Observer", "Adapter"], "Singleton provides a global access point to one instance."),
  m("Which pattern notifies dependent objects when an object's state changes?", ["Observer", "Singleton", "Builder", "Proxy"], "Used in event systems and UI frameworks."),
  m("MVC separates an application into:", ["Model, View and Controller", "Module, Variable and Class", "Main, View and Code", "Memory, Volume and CPU"], "It separates data, presentation and input handling."),
  m2("The Open/Closed Principle says software entities should be:", ["Open for extension but closed for modification", "Open source and closed for sale", "Closed for extension", "Always modifiable"], "Add behaviour by extending, not by editing tested code."),
];

const uml: RawQ[] = [
  m("Which UML diagram shows the system's functionality from the user's point of view?", ["Use case diagram", "Class diagram", "Sequence diagram", "Deployment diagram"], "Actors and use cases describe what users can do."),
  m("Which UML diagram shows classes, attributes, methods and relationships?", ["Class diagram", "Activity diagram", "Use case diagram", "State diagram"], "Class diagrams are structural."),
  m("Which UML diagram shows messages exchanged between objects over time?", ["Sequence diagram", "Class diagram", "Component diagram", "Package diagram"], "Lifelines run vertically; messages are arrows."),
  m("In a class diagram, a filled diamond represents:", ["Composition", "Aggregation", "Inheritance", "Dependency"], "A hollow diamond is aggregation; a hollow triangle arrow is inheritance."),
  m("Which diagram models workflows, similar to a flowchart?", ["Activity diagram", "Class diagram", "Object diagram", "Deployment diagram"], "Activity diagrams show actions and control flow."),
  m("Which diagram shows how software is deployed on hardware nodes?", ["Deployment diagram", "Use case diagram", "Sequence diagram", "State machine diagram"], "Nodes represent servers and devices."),
];

const projectMgmt: RawQ[] = [
  m("COCOMO is used to estimate:", ["Software development effort and cost", "Test coverage", "Network speed", "Code quality"], "The Constructive Cost Model estimates effort from size (KLOC)."),
  m("Function point analysis measures software size by:", ["Functionality delivered to the user", "Lines of code", "Number of developers", "Execution time"], "Inputs, outputs, inquiries, files and interfaces are counted."),
  m("In a PERT/CPM network, the critical path is:", ["The longest path, which determines the minimum project duration", "The shortest path", "The cheapest path", "A path with no tasks"], "Any delay on the critical path delays the project."),
  m("A Gantt chart shows:", ["Tasks against a timeline", "Class relationships", "Network topology", "Code complexity"], "Bars show task start, duration and progress."),
  m("Which is a project risk?", ["A key developer may leave during the project", "The product will be successful", "Tests pass", "The code compiles"], "Risks are uncertain events that could harm the project."),
  m("The 'triple constraint' of project management is:", ["Scope, time and cost", "People, process and tools", "Design, code and test", "Speed, size and colour"], "Changing one affects the others and quality."),
];

const quality: RawQ[] = [
  m("ISO 9001 is a standard for:", ["Quality management systems", "Network cabling", "Programming languages", "Encryption"], "It defines requirements for quality management."),
  m("CMMI level 5 is called:", ["Optimizing", "Initial", "Managed", "Defined"], "Levels: 1 Initial, 2 Managed, 3 Defined, 4 Quantitatively Managed, 5 Optimizing."),
  m("Quality assurance (QA) focuses on ____, while quality control (QC) focuses on ____.", ["processes to prevent defects; finding defects in products", "finding defects; processes", "coding; testing", "users; developers"], "QA is preventive; QC is detective."),
  m("Refactoring means:", ["Improving code structure without changing its external behaviour", "Adding new features", "Fixing user requirements", "Rewriting in another language"], "Tests should pass before and after refactoring."),
  m("A code review is a form of:", ["Static testing", "Dynamic testing", "Load testing", "Acceptance testing"], "Code is examined without running it."),
  m("Technical debt is:", ["The future cost of choosing quick, limited solutions now", "Money owed to vendors", "Unpaid salaries", "Hardware depreciation"], "It must be repaid by refactoring."),
];

const agile: RawQ[] = [
  m("Which document describes the values of Agile development?", ["The Agile Manifesto", "ISO 9001", "The SRS", "The CMMI model"], "Published in 2001 with four values and twelve principles."),
  m("The Agile Manifesto values 'working software' over:", ["Comprehensive documentation", "Customer collaboration", "Responding to change", "Individuals"], "The other values: individuals and interactions over processes and tools, customer collaboration over contract negotiation, responding to change over following a plan."),
  m("In Scrum, a fixed time-box of work (usually 1–4 weeks) is a:", ["Sprint", "Epic", "Release", "Backlog"], "Each sprint produces a potentially releasable increment."),
  m("Who owns and prioritises the product backlog?", ["Product Owner", "Scrum Master", "Development team", "Project manager"], "The Scrum Master facilitates and removes impediments."),
  m("The short daily Scrum meeting is time-boxed to:", ["15 minutes", "1 hour", "30 minutes", "2 hours"], "The team inspects progress towards the sprint goal."),
  m("A user story is commonly written as:", ["As a <user>, I want <goal> so that <benefit>", "Given–When–Then only", "IF … THEN …", "A UML class"], "Acceptance criteria accompany each story."),
  m("Kanban limits:", ["Work in progress (WIP)", "Team size", "Sprint length", "Number of releases"], "WIP limits expose bottlenecks and improve flow."),
];

const devops: RawQ[] = [
  m("Git is a:", ["Distributed version control system", "Programming language", "Database", "Web server"], "Every clone has the full history."),
  m("Which Git command records staged changes in the repository?", ["git commit", "git push", "git add", "git clone"], "git add stages; git commit records; git push uploads."),
  m("Which command creates a copy of a remote repository?", ["git clone", "git init", "git fetch", "git merge"], "git init creates a new empty repository."),
  m("CI/CD stands for:", ["Continuous Integration / Continuous Delivery (or Deployment)", "Code Inspection / Code Design", "Central Integration / Central Database", "Compile Install / Compile Deploy"], "Changes are built, tested and delivered automatically."),
  m("Docker packages applications as:", ["Containers", "Virtual machines", "Libraries", "Databases"], "Containers share the host kernel and are lightweight."),
  m("Infrastructure as Code means:", ["Managing infrastructure through version-controlled configuration files", "Writing code on servers", "Hardware design", "Coding without infrastructure"], "Tools include Terraform and Ansible."),
  m("A merge conflict happens when:", ["Two branches change the same lines differently", "A repository is cloned", "A commit message is empty", "The internet is slow"], "Git asks the developer to resolve the conflicting changes."),
];

const subject: RawSubject = {
  "sdlc-models": topic(sdlc, { intro: "The Software Development Life Cycle organises building software into phases. Models include Waterfall, V-model, Incremental, Iterative, Spiral, Prototyping and Agile." }),
  "requirements-engineering": topic(requirements, { intro: "Requirements engineering elicits, analyses, documents (SRS), validates and manages what the system must do (functional) and how well (non-functional)." }),
  "software-design": topic(design, { intro: "Design turns requirements into architecture and module structure. Aim for high cohesion, low coupling, SOLID principles and proven design patterns." }),
  uml: topic(uml, { intro: "UML diagrams are structural (class, object, component, deployment, package) or behavioural (use case, activity, sequence, state machine)." }),
  "software-project-management": topic(projectMgmt, { intro: "Project management plans and controls scope, time, cost, quality and risk using estimation (COCOMO, function points), scheduling (PERT/CPM, Gantt) and risk management." }),
  "software-quality": topic(quality, { intro: "Software quality is achieved by process (QA, ISO 9001, CMMI) and product checks (QC, reviews, testing, metrics, refactoring)." }),
  "agile-and-scrum": topic(agile, { intro: "Agile methods deliver in short iterations with close customer collaboration. Scrum uses roles (Product Owner, Scrum Master, Developers), events (sprint, planning, daily scrum, review, retrospective) and artifacts (backlogs, increment)." }),
  "devops-and-version-control": topic(devops, { intro: "DevOps joins development and operations through automation: version control (Git), CI/CD pipelines, containers and infrastructure as code." }),
};
export default subject;
