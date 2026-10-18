/** AI mock interview options. Shared by the setup page and the server, which validates every choice against these lists. */

export type Stage = "intro" | "hr" | "resume" | "technical" | "scenario" | "problem" | "behavioral" | "coding" | "closing";

export const STAGE_LABEL: Record<Stage, string> = {
  intro: "Introduction",
  hr: "HR",
  resume: "Resume & experience",
  technical: "Technical",
  scenario: "Scenario",
  problem: "Problem solving",
  behavioral: "Behavioural",
  coding: "Coding approach",
  closing: "Closing",
};

export type InterviewType = {
  id: string;
  label: string;
  desc: string;
  /** What the technical questions should cover. */
  focus: string;
  /** Stage pattern; it is stretched or trimmed to the chosen length, always starting with intro and ending with closing. */
  stages: Stage[];
  /** Dimensions shown on the report for this type. */
  technical: boolean;
};

export const INTERVIEW_TYPES: InterviewType[] = [
  { id: "hr", label: "HR Interview", desc: "Self-introduction, strengths, goals, teamwork and salary questions.", focus: "career goals, strengths and weaknesses, teamwork, conflict, motivation, company fit, relocation and salary expectations", stages: ["intro", "hr", "behavioral", "hr", "scenario", "behavioral", "hr", "closing"], technical: false },
  { id: "technical", label: "Technical Interview", desc: "Core CS fundamentals for software roles: OOP, DBMS, OS, networks.", focus: "OOP, data structures, DBMS and SQL, operating systems, networking basics, and the candidate's main programming language", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "problem", "closing"], technical: true },
  { id: "automation-testing", label: "Automation Testing", desc: "Frameworks, locators, waits, CI and test design for automation roles.", focus: "test automation frameworks, Selenium/Playwright, locator strategy, waits and synchronisation, page object model, CI integration, flaky tests, reporting", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "behavioral", "closing"], technical: true },
  { id: "manual-testing", label: "Manual Testing", desc: "SDLC/STLC, test cases, bug life cycle, test techniques.", focus: "SDLC and STLC, test case design, boundary value and equivalence partitioning, bug life cycle, severity vs priority, regression and smoke testing", stages: ["intro", "resume", "technical", "scenario", "technical", "technical", "behavioral", "closing"], technical: true },
  { id: "java", label: "Java Interview", desc: "OOP in Java, collections, exceptions, multithreading, Java 8+.", focus: "Java OOP, String handling, collections, exceptions, multithreading, JVM memory, Java 8 streams and lambdas", stages: ["intro", "resume", "technical", "technical", "problem", "technical", "scenario", "closing"], technical: true },
  { id: "python", label: "Python Interview", desc: "Data types, functions, OOP, comprehensions, error handling.", focus: "Python data types, mutability, functions and decorators, OOP, comprehensions and generators, exceptions, common libraries", stages: ["intro", "resume", "technical", "technical", "problem", "technical", "scenario", "closing"], technical: true },
  { id: "sql", label: "SQL Interview", desc: "Joins, grouping, subqueries, indexes, normalisation.", focus: "joins, GROUP BY and HAVING, subqueries, window functions, indexes, normalisation, transactions", stages: ["intro", "resume", "technical", "problem", "technical", "scenario", "technical", "closing"], technical: true },
  { id: "selenium", label: "Selenium Interview", desc: "WebDriver, locators, waits, frames, exceptions, POM, TestNG.", focus: "Selenium WebDriver architecture, locators and XPath, implicit/explicit/fluent waits, frames and windows, stale element and other exceptions, page object model, TestNG", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "problem", "closing"], technical: true },
  { id: "playwright", label: "Playwright Interview", desc: "Auto-waiting, locators, fixtures, tracing, API testing in Playwright.", focus: "Playwright auto-waiting, locators, fixtures, browser contexts, parallel runs, tracing and debugging, network interception, API testing with Playwright", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "problem", "closing"], technical: true },
  { id: "api-testing", label: "API Testing", desc: "HTTP, REST, status codes, Postman, auth, contract and negative tests.", focus: "HTTP methods and status codes, REST principles, Postman collections and scripts, authentication (tokens, OAuth), JSON validation, negative and boundary tests, API automation", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "problem", "closing"], technical: true },
  { id: "devops", label: "DevOps Basics", desc: "Git, CI/CD, Docker, Linux basics, cloud fundamentals.", focus: "Git workflows, CI/CD pipelines, Docker images and containers, basic Linux commands, cloud fundamentals, monitoring", stages: ["intro", "resume", "technical", "technical", "scenario", "technical", "behavioral", "closing"], technical: true },
  { id: "coding", label: "Coding Round (explain aloud)", desc: "Talk through a coding problem: approach, complexity, edge cases.", focus: "problem-solving approach, choice of data structures, time and space complexity, edge cases, optimisation and testing of the solution", stages: ["intro", "coding", "coding", "coding", "coding", "coding", "problem", "closing"], technical: true },
  { id: "mnc", label: "MNC Placement Interview", desc: "Campus-style mix of HR, aptitude-style reasoning and technical basics.", focus: "fresher campus placement: self-introduction, academic projects, programming basics, OOP, DBMS, puzzles and reasoning, HR questions about relocation, shifts and bond", stages: ["intro", "resume", "technical", "problem", "hr", "technical", "behavioral", "closing"], technical: true },
  { id: "full", label: "Full Mock Interview", desc: "Complete recruitment loop: HR, resume, technical, scenario, behavioural.", focus: "a complete IT recruitment loop covering HR, resume deep-dive, technical fundamentals of the candidate's stated skills, scenarios and behaviour", stages: ["intro", "hr", "resume", "technical", "technical", "scenario", "problem", "behavioral", "hr", "closing"], technical: true },
];

export const DIFFICULTIES = [
  { id: "beginner", label: "Beginner", desc: "Fresher-friendly basics, gentle follow-ups." },
  { id: "intermediate", label: "Intermediate", desc: "1-3 years level, practical depth." },
  { id: "advanced", label: "Advanced", desc: "Deeper reasoning and trade-offs." },
  { id: "mnc", label: "MNC", desc: "Campus/MNC bar: crisp, structured answers expected." },
  { id: "expert", label: "Expert", desc: "Senior-level depth, probing follow-ups." },
] as const;

/** Each persona has its own voice; all stay professional. Voices must be in the /api/tts allow-list. */
export const PERSONAS = [
  { id: "professional", label: "Professional", name: "Ava", voice: "en-US-AvaMultilingualNeural", style: "calm, neutral and professional; brief acknowledgements; no small talk" },
  { id: "friendly", label: "Friendly", name: "Emma", voice: "en-US-EmmaMultilingualNeural", style: "warm and encouraging but still evaluative; puts the candidate at ease" },
  { id: "strict", label: "Strict", name: "Daniel", voice: "en-US-GuyNeural", style: "direct and demanding; probes vague answers immediately; no praise" },
  { id: "mnc", label: "MNC Interviewer", name: "Rahul", voice: "en-IN-PrabhatNeural", style: "typical Indian MNC campus interviewer: polite, structured, checks fundamentals and clarity" },
  { id: "technical", label: "Technical Lead", name: "Arjun", voice: "en-IN-PrabhatNeural", style: "hands-on technical lead: asks why and how, cares about real project experience" },
  { id: "hr", label: "HR Manager", name: "Priya", voice: "en-IN-NeerjaNeural", style: "experienced HR manager: attentive to attitude, communication and culture fit" },
] as const;

export const LENGTHS = [
  { id: "quick", label: "Quick", questions: 5, note: "≈ 8 min" },
  { id: "standard", label: "Standard", questions: 8, note: "≈ 15 min" },
  { id: "long", label: "Long", questions: 12, note: "≈ 25 min" },
] as const;

/** Longest single answer. Keeps uploads under the serverless body limit. */
export const MAX_ANSWER_SECONDS = 120;
export const MAX_RESUME_CHARS = 4000;

export type InterviewConfig = {
  type: string;
  difficulty: string;
  persona: string;
  length: string;
  resume?: string;
  role?: string;
  coding?: { slug: string; title: string; statement: string };
};

export const typeById = (id: string) => INTERVIEW_TYPES.find((t) => t.id === id);
export const personaById = (id: string) => PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];

/** Stage for every question number: intro first, closing last, the type's pattern in between. */
export function stagePlan(type: InterviewType, total: number): Stage[] {
  const middle = type.stages.filter((s) => s !== "intro" && s !== "closing");
  const plan: Stage[] = ["intro"];
  for (let i = 0; plan.length < total - 1; i++) plan.push(middle[i % middle.length]);
  plan.push("closing");
  return plan.slice(0, total);
}

/** Dimensions scored per answer, in report order. */
export const INTERVIEW_DIMENSIONS = [
  { key: "communication", label: "Communication" },
  { key: "content", label: "Content & Relevance" },
  { key: "technical", label: "Technical Knowledge" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "structure", label: "Answer Structure" },
  { key: "confidence", label: "Confidence" },
  { key: "fluency", label: "Fluency" },
  { key: "grammar", label: "Grammar" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "pronunciation", label: "Pronunciation" },
  { key: "professionalism", label: "Professionalism" },
] as const;
export type InterviewDimension = (typeof INTERVIEW_DIMENSIONS)[number]["key"];
