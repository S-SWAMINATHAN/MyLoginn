import { q, topics, type Topic } from "../courses/_helpers";

const report: Topic[] = [
  ["What is a defect report", "A defect report records a problem so that someone else can understand, reproduce and fix it. A good report saves time for developers and testers.", ["One defect per report", "Clear and reproducible", "Includes evidence"], "BUG-210: cart total shows 0 after applying coupon SAVE10.", "Combining several problems in one report."],
  ["Writing a clear title", "The title is what people see in lists, so it should name the feature, the symptom and the condition. A specific title makes duplicates and priorities easier to spot.", ["Feature, symptom, condition", "Under about 100 characters", "No vague words like 'issue'"], "Cart total becomes 0 when coupon SAVE10 is applied (Chrome, build 2.4.1).", "Titles such as 'Bug' or 'Not working'."],
  ["Environment details", "State the build or version, browser or device, operating system, user role and test data used. Many defects only occur in one environment.", ["Build number", "Browser and OS", "User and data"], "Build 2.4.1, Chrome 126, Windows 11, user role Member.", "Leaving out the build, so nobody can reproduce it."],
  ["Preconditions", "Preconditions are the state that must exist before step one, such as being logged in or having items in the cart. They let anyone start from the same point.", ["State setup clearly", "Mention required data", "Keep it short"], "The cart contains two items totalling ₹800.", "Assuming the reader knows the starting state."],
  ["Steps to reproduce", "Steps are numbered, exact actions that lead to the failure, with one action per step. Anyone should be able to follow them without guessing.", ["One action per step", "Exact values", "Stop where the failure appears"], "1. Open /cart 2. Enter SAVE10 3. Click Apply.", "Writing 'try the coupon' instead of exact steps."],
  ["Expected versus actual result", "State what should happen according to the requirement and what actually happened. The gap between them is the defect.", ["Expected comes from the requirement", "Actual is what you observed", "Both are specific"], "Expected total ₹720; actual total ₹0.", "Describing only the actual result."],
  ["Evidence and attachments", "Attach screenshots, short screen recordings, logs and failing API requests to prove and illustrate the defect. Evidence shortens the investigation.", ["Crop and highlight the problem", "Record for timing issues", "Attach relevant logs"], "A 20-second recording shows the total flicker then drop to 0.", "Attaching a screenshot containing real passwords."],
  ["Reproducibility", "Reproducibility says how often the defect occurs: always, intermittently or once. Record the ratio and any pattern you notice.", ["Always, sometimes, once", "Give a ratio such as 3 of 10", "Note conditions"], "Fails in 3 of 10 attempts, only with products over ₹1000.", "Calling an intermittent defect 'always'."],
  ["Isolating the defect", "Isolation removes unnecessary steps and varies one condition at a time to find what triggers the failure. It turns a vague report into a precise one.", ["Remove steps until it stops", "Change one variable at a time", "Record what does not matter"], "Fails on Chrome and Edge but not Firefox.", "Reporting the first long path you found."],
  ["Checking for duplicates", "Search the defect tracker by keywords, screen name and error message before logging. If it exists, add your evidence as a comment.", ["Search first", "Check closed defects too", "Add to the existing report"], "Searching 'coupon total 0' finds BUG-198.", "Creating a second report for the same problem."],
  ["Reporting without blame", "A report describes the product behaviour, not the person who wrote the code. Neutral, factual wording keeps teams collaborating.", ["State facts", "Avoid personal comments", "Thank people for fixes"], "The total shows 0 after Apply.", "Writing 'the developer broke this again'."],
];

const severity: Topic[] = [
  ["Severity explained", "Severity describes how badly a defect affects the system or the user, such as a crash, data loss or a cosmetic flaw. Testers usually propose it.", ["Measures impact", "Based on evidence", "Independent of urgency"], "A crash on payment is high severity.", "Raising severity to get attention."],
  ["Priority explained", "Priority describes how soon a defect should be fixed, based on business value, deadlines and risk. It is normally decided by the product owner.", ["Measures urgency", "Set by the business", "Can change over time"], "A misspelt brand name before launch is urgent.", "Assuming priority always equals severity."],
  ["Typical severity levels", "Common levels are Critical or Blocker, High, Medium, Low and Trivial, defined in the project's guidelines. Clear definitions avoid arguments.", ["Critical: system unusable or data loss", "High: main feature fails", "Low: minor or cosmetic"], "Payments charged without orders is critical.", "Using levels without shared definitions."],
  ["Typical priority levels", "Priority is often P1 (fix immediately) to P4 (fix when possible). Teams map it to release and sprint plans.", ["P1 stops a release", "P2 fixed this sprint", "P3 and P4 scheduled later"], "A P1 login failure stops deployment.", "Marking everything P1."],
  ["High severity, low priority", "Some defects are serious but rare or in unused areas, so they can wait. Record them honestly with the reasoning.", ["Impact is severe when it occurs", "Likelihood is very low", "Document the decision"], "A crash only when a 2 GB file is uploaded on an old admin page.", "Ignoring such defects completely."],
  ["Low severity, high priority", "Some cosmetic defects are very visible and damage trust, so they are fixed quickly. Visibility and business context drive priority.", ["Little technical impact", "High visibility", "Brand and legal reasons"], "A wrong company name on the home page before a launch.", "Dismissing a defect because it is only cosmetic."],
  ["Assessing impact with evidence", "Support severity with facts: how many users, whether a workaround exists, whether data or money is at risk and how often it occurs. Evidence keeps discussions calm.", ["Number of users affected", "Workaround available", "Data, money or safety risk"], "Affects all mobile users with no workaround.", "Guessing impact without checking."],
  ["Regression and blocker defects", "A regression is a defect in functionality that worked before, and a blocker stops testing or release. Both usually deserve fast attention.", ["Say if it worked before", "Blockers stop progress", "Link to the change if known"], "Login worked in 2.3 and fails in 2.4.", "Not mentioning the last working build."],
  ["Disagreeing about severity", "When people disagree, return to the definitions and the evidence, and let the product owner decide priority. Keep notes of the decision.", ["Use agreed definitions", "Show evidence", "Respect the decision-maker"], "The tester shares a video and the count of affected users.", "Arguing in comments."],
  ["Customer-found defects", "Defects reported by customers carry extra weight because they show real impact. Capture the customer's steps and environment and respond quickly.", ["Reproduce in your environment", "Ask clarifying questions", "Keep the customer informed"], "A support ticket becomes BUG-320 with the customer's browser noted.", "Asking customers to do the debugging."],
];

const lifecycle: Topic[] = [
  ["The defect life cycle", "The defect life cycle is the set of states a defect passes through from discovery to closure. It makes ownership and next steps clear.", ["Every state has an owner", "States vary by team", "Fixed is not Closed"], "New, Assigned, In Progress, Fixed, Retest, Closed.", "Closing a defect without verification."],
  ["New and Assigned states", "A defect is New when it is first logged and Assigned when it has an owner after triage. Quick triage prevents defects from waiting unseen.", ["New: logged", "Assigned: owner decided", "Triage confirms validity"], "The lead assigns BUG-210 to a developer.", "Leaving defects unassigned."],
  ["In Progress and Fixed states", "In Progress means a developer is working on it, and Fixed means the change is made and merged. Fixed does not yet mean verified.", ["Developer owns it", "Link the code change", "Note the build with the fix"], "Fixed in build 2.4.2, pull request #88.", "Assuming Fixed means done."],
  ["Retest and Closed states", "After the fix is deployed the tester retests with the original steps. If it passes the defect is Closed, otherwise it is Reopened.", ["Use the original steps", "Check nearby behaviour", "Close only after verification"], "The coupon test passes on 2.4.2, so BUG-210 is closed.", "Retesting only the exact click and nothing nearby."],
  ["Reopened defects", "A defect is Reopened when the retest fails or the problem returns. Add new evidence and, if needed, notes about differences in the environment.", ["Attach new evidence", "State the build retested", "A high reopen rate signals weak fixes"], "Fails again on build 2.4.2 with the same error.", "Reopening without saying what changed."],
  ["Rejected and Not a defect", "A defect is rejected when the behaviour is expected, a duplicate or caused by misuse. Rejections should include a clear reason.", ["Explain the reason", "Check the requirement", "Learn from rejections"], "Rejected: the requirement says coupons do not combine.", "Taking a rejection personally."],
  ["Duplicate defects", "A duplicate is a defect already reported. Link it to the original and merge evidence so nothing is lost.", ["Link to the original", "Add useful details", "Close the duplicate"], "BUG-212 is a duplicate of BUG-210.", "Deleting duplicates and losing evidence."],
  ["Deferred and Won't fix", "Deferred means valid but scheduled for a later release, and Won't fix means the team decided not to fix it. Both need an owner's approval and a recorded reason.", ["Record who decided", "Record the reason", "Review deferred items regularly"], "Deferred to release 3.0 by the product owner.", "Letting deferred defects disappear."],
  ["Cannot reproduce", "A developer may mark a defect Cannot reproduce when the steps do not work for them. Provide more environment detail, data, logs or a recording.", ["Add environment details", "Share data and logs", "Offer to reproduce together"], "A screen share shows the failure on the QA environment.", "Arguing instead of helping to reproduce."],
  ["Triage meetings", "A triage meeting reviews new defects to confirm validity, severity, priority and owner. Regular short meetings keep the backlog clean.", ["Short and regular", "Decide owner and release", "Close duplicates and invalid items"], "A 20-minute daily triage during test cycles.", "Letting the new queue grow for weeks."],
];

const tools: Topic[] = [
  ["Defect tracking tools", "Tools such as Jira, Azure DevOps, Bugzilla and GitHub Issues store defects, states, comments and history. The ideas are the same in every tool.", ["Customise fields sensibly", "Use workflows for states", "Search and filter"], "A Jira board with columns for each defect state.", "Creating too many custom fields nobody fills in."],
  ["Jira basics for defects", "In Jira a defect is an issue of type Bug with fields such as summary, description, priority, assignee, labels and attachments. Workflows move it through states.", ["Issue type Bug", "Summary and description", "Workflow transitions"], "Create a Bug with steps in the description and a screenshot.", "Putting everything in one long description paragraph."],
  ["Labels, components and versions", "Labels, components and affected or fix versions help group and filter defects by area and release. They also feed reports.", ["Component = area of the product", "Affects version", "Fix version"], "Component: Checkout; Affects: 2.4.1; Fix: 2.4.2.", "Leaving versions empty."],
  ["Linking defects to requirements and tests", "Links connect a defect to the requirement it breaks and the test that found it. This supports impact analysis and traceability.", ["Link to the failing test", "Link to the requirement", "Link duplicates"], "BUG-210 is linked to TC-34 and REQ-12.", "Logging defects with no links."],
  ["Defect reports and dashboards", "Reports show open defects by severity, age and module, plus trends over time. They help release decisions.", ["Open by severity", "Defect age", "Trend over time"], "A dashboard shows 3 open high defects before release.", "Looking only at the total count."],
  ["Useful defect metrics", "Defect density, defect leakage, defect removal efficiency and reopen rate show quality and process health. They support improvement, not blame.", ["Defect density: per size or module", "Leakage: found after release", "Reopen rate: quality of fixes"], "DRE is 90% when 90 of 100 defects were found before release.", "Using counts to rank individuals."],
  ["Root cause analysis", "Root cause analysis asks why a defect occurred, often with the five whys, to prevent similar defects. Fixing the cause is better than only fixing the symptom.", ["Ask why repeatedly", "Find the process cause", "Create preventive actions"], "Defects arose from unclear requirements, so reviews were added.", "Stopping at the first, shallow cause."],
  ["Security and privacy in defect data", "Defect reports can contain sensitive data, so mask personal information and restrict access to security defects. Never paste secrets into tickets.", ["Mask personal data", "Restrict security defects", "No passwords or tokens"], "A security defect is marked confidential.", "Pasting customer data into a ticket."],
  ["Communicating with developers", "Good communication means being clear, prompt and respectful, and offering to demonstrate the defect. Pairing on a hard defect often resolves it fastest.", ["Be factual and kind", "Respond quickly to questions", "Demonstrate if asked"], "A five-minute screen share fixes a misunderstanding.", "Long arguments in comments."],
  ["Your defect reporting checklist", "Before submitting, check the title, environment, preconditions, steps, expected and actual results, evidence, severity and duplicates. A checklist improves every report.", ["Run through it each time", "Re-run your own steps", "Review the wording"], "You follow your steps once from scratch and they reproduce the issue.", "Submitting without re-running your steps."],
];

export default {
  slug: "bug-reporting-and-defect-life-cycle", weeks: 4, finalDraw: 15,
  objectives: ["Apply a defect reporting checklist covering title, environment, steps, evidence and duplicates", "Use trackers, triage, links and metrics to manage defects from discovery to closure"],
  modules: [
    topics("Anatomy of a Defect Report", "Every field of a high-quality report.", report, [
      q("Which title is best?", ["Cart total becomes 0 when coupon SAVE10 is applied (Chrome, build 2.4.1)", "Bug", "Coupon issue", "Not working"], 0, "Specific title."),
      q("Expected results come from:", ["The requirement", "Opinion", "Another site", "Chance"], 0, "Requirements."),
      q("What is isolation?", ["Removing unneeded steps and varying one condition at a time", "Hiding a bug", "Assigning blame", "Closing a bug"], 0, "Find the minimum."),
      q("Before logging a defect you should:", ["Search for duplicates", "Wait a week", "Ask the CEO", "Skip steps"], 0, "Avoid duplicates."),
      q("Which is unsafe to attach?", ["Real customer passwords", "A cropped screenshot", "A log excerpt", "A short video"], 0, "Sensitive data."),
    ]),
    topics("Severity and Priority", "Impact versus urgency.", severity, [
      q("Priority is usually set by:", ["Product owner or manager", "The tester alone", "The user", "The compiler"], 0, "Business decision."),
      q("A misspelt brand name before launch is:", ["Low severity, high priority", "High severity, low priority", "Critical severity", "Not a defect"], 0, "Visible but harmless."),
      q("Severity measures:", ["Impact", "Urgency", "Cost", "Age"], 0, "How serious it is."),
      q("Which supports a severity claim best?", ["Number of users affected and workaround status", "Personal feeling", "The tester's mood", "Random choice"], 0, "Evidence."),
      q("A defect in something that worked before is a:", ["Regression", "Duplicate", "Enhancement", "Spike"], 0, "Regression."),
    ]),
    topics("The Defect Life Cycle in Detail", "States, decisions and ownership.", lifecycle, [
      q("After Fixed the tester should:", ["Retest", "Close immediately", "Delete", "Ignore"], 0, "Verify first."),
      q("A failed retest leads to:", ["Reopened", "Closed", "Duplicate", "Deferred"], 0, "Reopen."),
      q("Deferred means:", ["Valid but scheduled for later", "Invalid", "Duplicate", "Fixed"], 0, "Later release."),
      q("Cannot reproduce is best answered with:", ["More environment details, data and a recording", "An argument", "Closing it", "Raising severity"], 0, "Help reproduce."),
      q("Triage meetings decide:", ["Validity, severity, priority and owner", "Salaries", "Holidays", "Code style"], 0, "Triage."),
    ]),
    topics("Tools, Metrics and Collaboration", "Working with trackers and teams.", tools, [
      q("Which tool is a defect tracker?", ["Jira", "Photoshop", "Excel only", "Notepad"], 0, "Jira."),
      q("DRE is:", ["Defects found before release divided by total defects", "Defects after release only", "Test cases written", "Hours worked"], 0, "Removal efficiency."),
      q("Root cause analysis asks:", ["Why did the defect occur", "Who is to blame", "How many tests", "What colour"], 0, "Why."),
      q("Security defects should be:", ["Restricted to authorised people", "Public", "Emailed to all", "Posted on social media"], 0, "Limit access."),
      q("Best way to resolve a tricky defect with a developer:", ["Demonstrate it together", "Argue in comments", "Close it", "Ignore it"], 0, "Pair up."),
    ]),
  ],
  finalQuestions: [
    q("Which field tells the developer how to see the problem?", ["Steps to reproduce", "Assignee", "Label", "Component"], 0, "Steps."),
    q("A defect that cannot be reproduced should be reported as:", ["Not reproducible with exact time, user and logs", "Always happening", "Invalid", "Fixed"], 0, "Give data to search logs."),
    q("A duplicate should be:", ["Linked to the original", "Deleted silently", "Kept separate", "Prioritised"], 0, "Link and close."),
    q("Which statements about severity are true? (select all that apply)", ["It measures impact", "It should be supported by evidence", "It always equals priority", "It can be debated using definitions"], [0, 1, 3], "Priority differs."),
    q("A deferred defect needs:", ["An owner's approval and a recorded reason", "Nothing", "Deletion", "A new title"], 0, "Document it."),
    q("The reopen rate indicates:", ["Quality of fixes and reports", "Number of testers", "Server speed", "Team size"], 0, "A signal."),
    q("A good defect checklist includes:", ["Title, environment, steps, expected and actual, evidence", "Only a title", "Only a screenshot", "Only severity"], 0, "Complete reports."),
    q("Which comment is constructive?", ["Total shows 0 after Apply; steps and log attached", "You broke this again", "Fix it ASAP!!!", "Whatever"], 0, "Factual."),
    q("Root cause analysis helps to:", ["Prevent similar defects", "Rank people", "Close defects faster by hiding them", "Skip testing"], 0, "Process improvement."),
    q("Linking a defect to a test and requirement supports:", ["Traceability", "Hiding data", "Slower fixes", "Random reports"], 0, "Impact analysis."),
  ],
};
