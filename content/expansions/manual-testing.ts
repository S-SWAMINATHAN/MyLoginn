import { q, topics, type Topic } from "../courses/_helpers";

const basics: Topic[] = [
  ["What manual testing is", "Manual testing is executing tests by hand as a user would and comparing results with expectations. It relies on human observation and judgement.", ["No scripts drive the test", "Strong at usability and exploration", "Needs clear expected results"], "A tester registers on the site and checks every message.", "Clicking randomly without a plan."],
  ["Manual versus automated testing", "Manual testing is best for exploration, usability and changing features, while automation suits stable, repetitive checks. Mature teams use both.", ["Automate repeatable regression", "Keep exploration manual", "Choose by risk and cost"], "Nightly regression automated; new feature tested manually.", "Automating unstable features."],
  ["A tester's day", "A tester reads stories, designs tests, tests builds, reports defects and retests fixes. Communication fills much of the day.", ["Review requirements", "Execute and report", "Retest and regression"], "A morning triage then testing the new wishlist story.", "Working alone without talking to developers."],
  ["Test levels in manual work", "Manual testers mostly work at integration, system and acceptance levels, often through the user interface. Understanding unit tests helps them target risks.", ["Mostly system level", "Know what developers cover", "Avoid duplicating unit tests"], "Check the full order flow, not individual functions.", "Re-testing what unit tests already cover heavily."],
  ["Black-box thinking", "Black-box testing uses requirements and behaviour without looking at the code. It mirrors how users see the product.", ["Based on specification", "No code needed", "Uses partitions and boundaries"], "Enter ages around 18 and 60 to test eligibility.", "Assuming black-box means unplanned."],
  ["Positive and negative testing", "Positive tests use valid input and expect success; negative tests use invalid input and expect safe rejection. Both are needed.", ["Valid input accepted", "Invalid input rejected clearly", "Errors do not crash the app"], "Submit a form with and without the required email.", "Only testing the happy path."],
  ["Understanding requirements", "Read requirements for what, who, inputs, outputs, limits and failures, and raise questions about gaps. Questions are part of testing.", ["Read three times", "List test conditions", "Clarify ambiguity"], "A vague 'fast' becomes 'under 2 seconds'.", "Starting to test with unclear requirements."],
  ["Test scenarios and test cases", "A scenario is a high-level thing to test and a test case is the detailed version with steps and expected results. One scenario produces several cases.", ["Scenario first", "Cases second", "Trace to requirements"], "Scenario: reset password; cases: valid email, unknown email, expired link.", "Writing cases with no scenario thinking."],
  ["Test data preparation", "Prepare valid, invalid and boundary data, and accounts for each role. Use masked or generated data.", ["Plan data in advance", "Different roles and states", "Never use real customer data"], "Create a member, a guest and an admin account.", "Using production data."],
  ["Test environments for manual testers", "Know which environment you are testing, its build number and its limits. Report environment problems separately from product defects.", ["Record the build", "Know integrations used", "Avoid mid-test redeploys"], "QA environment with a payment sandbox.", "Testing on the wrong environment."],
];

const features: Topic[] = [
  ["Testing text fields", "For each field test empty, minimum, maximum and one over the maximum length, plus special characters, spaces and emoji. Check the message and whether the entered data is kept.", ["Length boundaries", "Special characters", "Spaces only"], "Enter 50 and 51 characters in a 50-character field.", "Skipping whitespace-only input."],
  ["Testing numeric fields", "Test zero, negative values, decimals, very large numbers, letters and boundaries of allowed ranges. Check rounding and formatting.", ["Boundaries and zero", "Negative and decimal", "Non-numeric input"], "Quantity field with 0, 1, 99, 100.", "Forgetting decimal and negative input."],
  ["Testing dropdowns and checkboxes", "Verify default values, that all options appear, only allowed selections are possible and selections persist after errors. Test multiple selections where allowed.", ["Defaults", "All options present", "Selections persist"], "Choose a country, submit with an error, and confirm it stays selected.", "Not testing the empty default."],
  ["Testing date fields", "Test valid dates, invalid dates, leap years, month ends, past and future limits and different formats and time zones. Date logic hides many defects.", ["29 February", "Month and year ends", "Past and future limits"], "Book a hotel on 29 February 2028.", "Testing only today's date."],
  ["Testing file upload", "Test allowed and disallowed types, size limits, empty files, renamed extensions, long names and cancelled uploads. Check clear error messages.", ["Type and size limits", "Renamed or corrupt files", "Cancel and retry"], "Upload a 2 MB PNG and a 2 MB + 1 byte PNG.", "Only uploading one friendly file."],
  ["Testing login and logout", "Test valid and invalid credentials, empty fields, lockout rules, session timeout and that logout really ends the session. The back button after logout must not reveal private pages.", ["Generic error messages", "Session handling", "Lockout behaviour"], "Log out and press Back; the page must ask to log in.", "Only testing a valid login."],
  ["Testing registration forms", "Check required fields, duplicate emails, password rules, email verification and terms checkboxes. Confirm that the account works after registration.", ["Duplicate email handling", "Password rules", "Verification flow"], "Register twice with the same email.", "Not testing the verification link."],
  ["Testing search and filters", "Test exact, partial, misspelt and empty queries, special characters, no results, sorting, filters and pagination. Counts and results must match.", ["No-result message", "Filters combine correctly", "Pagination has no duplicates"], "Search 'o'brien' to test an apostrophe.", "Ignoring pagination."],
  ["Testing shopping carts and checkout", "Test adding, changing and removing items, totals, taxes, coupons, stock limits, payment failures and order confirmation. Totals across steps must match.", ["Totals are consistent", "Stock limits", "Failure and retry"], "Apply a coupon, change quantity, and check the total again.", "Not testing payment failure."],
  ["Testing emails and notifications", "Check that emails are sent once, have correct content, links work and expire as designed. Use a test mailbox, never real customers.", ["Sent once", "Links work and expire", "Content is correct"], "Reset email arrives within a minute with a working link.", "Using real email addresses."],
  ["Testing messages and error handling", "Error messages should be clear, polite, specific and free of technical details. The app should recover without losing the user's work.", ["Helpful wording", "No stack traces", "Keep user input"], "Show 'Enter a valid email' next to the field.", "Showing raw database errors."],
];

const quality: Topic[] = [
  ["Usability checks", "Check whether users can complete tasks easily: clear labels, logical flow, consistent design and helpful feedback. Observe real users when possible.", ["Clear labels", "Consistent design", "Helpful feedback"], "A new user finds the return policy in under 30 seconds.", "Judging usability only as a developer."],
  ["Compatibility checks", "Test the target browsers, devices, operating systems and screen sizes from real usage data. Check layout and function.", ["Use analytics to choose", "Check mobile", "Check older versions"], "Run the checkout on Chrome, Safari and a small Android phone.", "Testing only the newest browser."],
  ["Cross-browser basics", "Different browsers can render and behave differently, so test the key flows on each supported one. Differences often appear in forms, fonts and date pickers.", ["Test key flows everywhere", "Compare layout", "Note browser-specific bugs"], "A date picker works in Chrome but not in Safari.", "Assuming all browsers behave alike."],
  ["Responsive layout checks", "Resize the window and test phone, tablet and desktop widths. Menus, tables and forms must remain usable.", ["Common breakpoints", "Touch targets", "No horizontal scrolling"], "The menu collapses correctly at 375 pixels.", "Testing only at one screen width."],
  ["Accessibility basics", "Check keyboard-only use, visible focus, colour contrast, text alternatives and form labels. Accessibility helps everyone.", ["Keyboard navigation", "Contrast and labels", "Alt text for images"], "Complete the form using only Tab and Enter.", "Leaving accessibility to the end."],
  ["Performance observations", "Manual testers can notice slow pages, long waits and spinners, and report timings with the conditions. Detailed measurement needs tools.", ["Note response times", "State the network", "Report with evidence"], "The order page takes 8 seconds on a slow network.", "Saying 'it feels slow' without data."],
  ["Basic security observations", "Without being a security specialist a tester can notice sensitive data in URLs, missing HTTPS, weak password rules and pages that are open without login. Report them privately.", ["No secrets in URLs", "HTTPS everywhere", "Protected pages need login"], "An order id in the URL opens another user's order.", "Testing systems without permission."],
  ["Localisation checks", "For multi-language products check translated text, date, time and currency formats, text length and right-to-left layouts. Tamil and other scripts need correct fonts.", ["Check translations", "Formats and currency", "Fonts and text overflow"], "Tamil text displays without broken characters.", "Testing only in English."],
  ["Interruption and recovery testing", "Test what happens when the network drops, the app is closed, the device is rotated or a call arrives. Data should not be lost or duplicated.", ["Lose the network", "Refresh and back", "Restart the app"], "Disable Wi-Fi during payment and check the order state.", "Ignoring failure paths."],
  ["Mobile app manual testing", "Test installation, permissions, gestures, orientation, notifications, battery and storage use and different screen sizes. Real devices reveal issues emulators miss.", ["Real devices", "Permissions and notifications", "Orientation and gestures"], "Deny camera permission and check the message.", "Using only an emulator."],
];

const process: Topic[] = [
  ["Test execution workflow", "Execute tests in priority order, record each result and log defects with evidence. Update the traceability matrix and share progress.", ["Priority first", "Record every result", "Update traceability"], "Run high-priority checkout tests before low-priority ones.", "Leaving results unrecorded."],
  ["Test case statuses", "Common statuses are Pass, Fail, Blocked and Not run. Each status has a clear meaning and should be used honestly.", ["Blocked means cannot run", "Fail needs a defect", "Not run is not Pass"], "A test is Blocked because login is down.", "Marking unrun tests as Pass."],
  ["Smoke testing a build", "Run a short, wide check of critical functions on every new build before detailed testing. If it fails, return the build.", ["10 to 30 quick checks", "Critical paths only", "Reject unstable builds"], "Open the app, log in, search, add to cart.", "Testing deeply on a broken build."],
  ["Sanity testing a fix", "After a fix, check that the specific problem is resolved and nearby behaviour is sensible. It is narrow and quick.", ["Narrow focus", "Quick check", "Around the change"], "After a coupon fix, test two coupons and the total.", "Treating it as full regression."],
  ["Regression testing strategy", "Regression testing checks that changes did not break existing behaviour. Prioritise key flows, areas near the change and fragile or recently failed tests.", ["Prioritise by risk", "Cover near the change", "Automate stable checks"], "After a tax change re-run checkout, invoices and reports.", "Running everything every time with no priorities."],
  ["Exploratory testing sessions", "Time-boxed sessions guided by a charter find problems scripted tests miss. Keep notes and debrief afterwards.", ["Charter and time box", "Take notes", "Debrief"], "Charter: explore refunds with unusual orders.", "No notes, so nothing is reproducible."],
  ["Error guessing", "Error guessing uses experience to predict likely defects such as empty values, long text, special characters and double clicks. A defect history helps.", ["Use past defects", "Think like a careless user", "Try odd inputs"], "Paste 5,000 characters into a name field.", "Relying only on formal techniques."],
  ["Ad hoc testing", "Ad hoc testing is informal and unscripted, done without documentation to find problems quickly. It is useful but hard to repeat.", ["Quick and informal", "Not repeatable", "Better with notes"], "Click around a new screen for ten minutes.", "Using it instead of planned tests."],
  ["Test reporting", "Report progress and results with executed, passed, failed and blocked counts, open defects by severity, risks and what was not tested. Honest reports guide release decisions.", ["Include what was not tested", "Show open defects by severity", "State risks"], "85% executed, 3 high defects open, mobile not tested.", "Reporting only good news."],
  ["Working with developers and analysts", "Clear, respectful collaboration speeds up fixes and removes ambiguity. Ask questions early and share findings kindly.", ["Early questions", "Share evidence", "Celebrate fixes"], "A tester pairs with a developer to reproduce a defect.", "Blaming instead of collaborating."],
  ["Building a testing career", "Practise test design, learn SQL and API testing, add one automation tool and keep a portfolio of test cases and reports. Domain knowledge adds value.", ["Master the fundamentals", "Learn SQL and APIs", "Build a portfolio"], "A tester adds Postman and Selenium to their skills.", "Chasing tools before understanding testing."],
];

export default {
  slug: "manual-testing", weeks: 5, finalDraw: 15,
  objectives: ["Test common features such as forms, login, search, uploads and checkout systematically", "Run a full manual test cycle from smoke tests to a honest test report"],
  modules: [
    topics("Manual Testing Foundations", "Core ideas and preparation.", basics, [
      q("Manual testing is best for:", ["Exploration and usability", "Nightly regression of 800 checks", "Load tests", "Repeated API checks"], 0, "Human judgement."),
      q("A scenario is:", ["A high-level thing to test", "A defect", "A tool", "A build"], 0, "Scenario then cases."),
      q("Negative testing uses:", ["Invalid input expecting safe rejection", "Only valid input", "No input", "Random data only"], 0, "Invalid input."),
      q("Test data should be:", ["Masked or generated", "Real customer data", "Never planned", "Shared publicly"], 0, "Safe data."),
      q("Which should you record with test results?", ["The build number", "Your lunch", "Weather", "Nothing"], 0, "Build and environment."),
    ]),
    topics("Testing Common Features", "Forms, login, search, upload and checkout.", features, [
      q("Which tests a 50-character field?", ["50 and 51 characters", "Only 10", "Only 0", "Only 500"], 0, "Boundaries."),
      q("After logout, pressing Back should:", ["Not show private pages", "Show the dashboard", "Crash", "Reopen the session"], 0, "Session ends."),
      q("Login errors should be:", ["Generic", "Specific about which field is wrong", "Hidden", "Technical"], 0, "Avoid leaking."),
      q("A date test should include:", ["Leap years and month ends", "Only today", "Only past", "Nothing"], 0, "Date logic."),
      q("Checkout totals must:", ["Match across all steps", "Differ by step", "Be hidden", "Be rounded randomly"], 0, "Consistency."),
    ]),
    topics("Quality Attributes in Manual Testing", "Usability, compatibility, accessibility and more.", quality, [
      q("Compatibility targets should come from:", ["Usage data", "Guessing", "The newest only", "One browser"], 0, "Analytics."),
      q("Keyboard-only testing checks:", ["Accessibility", "Load", "Security keys", "Disk"], 0, "Accessibility."),
      q("Interruption testing includes:", ["Losing network during payment", "Reading requirements", "Writing a plan", "Reviewing a contract"], 0, "Recovery."),
      q("An order id in the URL opens another user's order. This is:", ["A security concern to report", "Normal", "A style choice", "A browser feature"], 0, "Access control issue."),
      q("Real devices matter for mobile because:", ["Emulators miss issues", "They are cheaper", "Emulators are illegal", "Phones are slower always"], 0, "Real behaviour."),
    ]),
    topics("Running and Reporting a Test Cycle", "Execution, regression and reporting.", process, [
      q("A test that cannot run is:", ["Blocked", "Passed", "Failed", "Deleted"], 0, "Blocked."),
      q("Smoke tests are:", ["Short wide checks of a new build", "Deep tests", "Load tests", "Closure reports"], 0, "Build stability."),
      q("Regression strategy should prioritise:", ["Key flows and areas near the change", "Alphabetical order", "Random tests", "Smallest tests"], 0, "Risk."),
      q("Exploratory sessions need:", ["A charter and notes", "A 200-step script", "No time limit", "No debrief"], 0, "Structured exploration."),
      q("A good test report includes:", ["What was not tested", "Only passes", "Passwords", "Nothing"], 0, "Honesty."),
    ]),
  ],
  finalQuestions: [
    q("Which is a negative test?", ["Submit an empty required field", "Enter valid data", "Open the home page", "Read requirements"], 0, "Invalid input."),
    q("Why record the build number?", ["Results can be reproduced and traced", "For decoration", "To slow testing", "It is required by law"], 0, "Traceability."),
    q("Whitespace-only input in a name field should be:", ["Rejected or trimmed as designed", "Always accepted", "Crash the app", "Ignored in testing"], 0, "Validation."),
    q("Which are good checks for file upload? (select all that apply)", ["Size limit", "Disallowed type", "Renamed extension", "Only a perfect file"], [0, 1, 2], "Negative cases matter."),
    q("Ad hoc testing is:", ["Informal and unscripted", "Formal and documented", "Automated", "Load testing"], 0, "Hard to repeat."),
    q("Error guessing uses:", ["Experience to predict likely defects", "A random generator", "Only requirements", "Only code coverage"], 0, "Experience."),
    q("Sanity testing is:", ["Narrow check of a fix", "A full regression", "A performance test", "A review"], 0, "Narrow."),
    q("Responsive testing checks:", ["Different screen sizes", "Disk speed", "Server logs", "Compiler options"], 0, "Layout across widths."),
    q("Interruption testing examples include: (select all that apply)", ["Network loss", "App restart", "Refresh during a step", "Reading the manual"], [0, 1, 2], "Recovery behaviour."),
    q("A test report should mention:", ["Open defects by severity and risks", "Only the pass rate", "Names to blame", "Nothing"], 0, "Decision information."),
  ],
};
