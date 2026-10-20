/**
 * The shared structure of a careers posting (job opening or internship), shaped like a standard job description:
 * a header (company, role, job type, work mode, location) followed by About the role, Key responsibilities,
 * Requirements, Good to have, What you'll gain, Who we're looking for and Apply now.
 *
 * Client-safe: used by the admin editor (live preview, paste import, copy as text) and the public pages.
 */

export const DEFAULT_COMPANY = "MyLoginn Tech";
export const WORK_MODES = ["On-site", "Hybrid", "Remote"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export type PostingKind = "job" | "internship";

export type Posting = {
  title: string;
  company: string;
  /** "Full-time / Internship" for a job; always "Internship" for an internship. */
  jobType: string;
  workMode: string;
  location: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  goodToHave: string[];
  benefits: string[];
  idealCandidate: string;
  applyUrl: string;
};

/** The sections an administrator fills in, in posting order. */
export const POSTING_SECTIONS = [
  { key: "about", heading: "About the Role", hint: "Two or three short paragraphs: what the team does and what this person will work on." },
  { key: "responsibilities", heading: "Key Responsibilities", hint: "What they will do day to day. One point per line." },
  { key: "requirements", heading: "Requirements", hint: "What they need to have. One point per line." },
  { key: "goodToHave", heading: "Good to Have", hint: "Optional extras that help but are not required." },
  { key: "benefits", heading: "What You'll Gain", hint: "Experience, mentorship, certificates, perks." },
  { key: "idealCandidate", heading: "Who We're Looking For", hint: "A short closing paragraph about the kind of person who will do well." },
] as const;

/** Splits stored multi-line text into list items, dropping bullets and blank lines. */
export function splitLines(text: string | null | undefined) {
  return (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

/** A mailto: link for an email, otherwise the link itself (with https:// added when missing). */
export function applyHref(value: string) {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Renders **bold** spans in posting text as React-free segments: [text, bold][]. */
export function boldSegments(text: string): { text: string; bold: boolean }[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => (part.startsWith("**") && part.endsWith("**") ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }));
}

/* ── Paste import ───────────────────────────────────────────────────── */

const isPlaceholder = (v: string) => /^\[.*\]$/.test(v.trim()) || !v.trim();
const clean = (v: string) => v.replace(/\s{2,}$/, "").trim();

const SECTION_MATCHERS: { key: keyof Posting; test: RegExp }[] = [
  { key: "about", test: /about|overview|summary/i },
  { key: "responsibilities", test: /responsib|what you('|’)?ll do|duties/i },
  { key: "goodToHave", test: /good to have|nice to have|bonus|preferred/i },
  { key: "requirements", test: /requirement|qualification|skills|must have|what we('|’)?re looking for in you/i },
  { key: "benefits", test: /gain|benefit|perks|we offer|what you get/i },
  { key: "idealCandidate", test: /who we('|’)?re looking for|ideal candidate|who you are/i },
];

/** Section headings recognised without a leading "#", for postings pasted as plain text. */
const PLAIN_HEADING = /^\s*(about( the role| us| this role)?|(key )?responsibilities|requirements|qualifications|good to have|nice to have|what you('|’)?ll (gain|get|do)|benefits|perks|who we('|’)?re looking for|ideal candidate)\s*:?\s*$/i;

/**
 * Reads a posting written in the usual format (Markdown headings, **Label:** lines and bullet lists, or the same
 * thing as plain text) and returns the fields it found. Bracketed placeholders like "[Location]" are ignored.
 */
export function parsePosting(input: string): Partial<Posting> {
  const out: Partial<Posting> = {};
  let section: keyof Posting | null = null;
  const buffers: Partial<Record<keyof Posting, string[]>> = {};
  /** Whether a non-empty line has been read; a plain first line is taken as the title. */
  let first = false;

  for (const raw of input.replace(/\r/g, "").split("\n")) {
    const line = clean(raw);
    if (!line) { if (section) (buffers[section] ??= []).push(""); continue; }
    const isFirst = !first;
    first = true;

    const label = line.match(/^\**\s*([A-Za-z' ’/]+?)\s*:\s*\**\s*(.*)$/);
    if (label && !/^[-*•]\s/.test(line)) {
      const name = label[1].toLowerCase();
      const value = clean(label[2].replace(/\*\*/g, ""));
      if (/^apply/.test(name)) { if (!isPlaceholder(value)) out.applyUrl = value; section = null; continue; }
      if (name === "company" && !isPlaceholder(value)) { out.company = value; continue; }
      if ((name === "role" || name === "title" || name === "position") && !isPlaceholder(value)) { out.title ??= value; continue; }
      if ((name === "job type" || name === "employment type" || name === "type") && !isPlaceholder(value)) { out.jobType = value; continue; }
      if ((name === "work mode" || name === "workplace") && !isPlaceholder(value)) { out.workMode = WORK_MODES.find((m) => value.toLowerCase().includes(m.toLowerCase())) ?? value; continue; }
      if (name === "location" && !isPlaceholder(value)) { out.location = value; continue; }
    }

    const heading = line.match(/^#{1,6}\s*(.+)$/) ?? (PLAIN_HEADING.test(line.replace(/\*\*/g, "")) ? [line, line] : null);
    if (heading) {
      const text = heading[1].replace(/\*\*/g, "").trim();
      const match = SECTION_MATCHERS.find((m) => m.test.test(text));
      if (match) { section = match.key; continue; }
      if (/^#\s/.test(line) && !out.title) { out.title = text; section = null; continue; }
      section = null;
      continue;
    }

    if (section) (buffers[section] ??= []).push(line);
    else if (!out.title && isFirst) out.title = line.replace(/\*\*/g, "");
  }

  for (const [key, lines] of Object.entries(buffers) as [keyof Posting, string[]][]) {
    if (key === "about" || key === "idealCandidate") {
      const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
      if (text) out[key] = text as never;
    } else {
      const items = splitLines(lines.join("\n"));
      if (items.length) out[key] = items as never;
    }
  }
  return out;
}

/* ── Copy as text ───────────────────────────────────────────────────── */

/** The posting as Markdown, ready to paste into LinkedIn, job boards or email. */
export function postingToMarkdown(p: Posting) {
  const head = [
    `# ${p.title || "Untitled role"}`,
    "",
    `**Company:** ${p.company || DEFAULT_COMPANY}  `,
    `**Role:** ${p.title}  `,
    `**Job Type:** ${p.jobType}  `,
    `**Work Mode:** ${p.workMode}  `,
    ...(p.location ? [`**Location:** ${p.location}  `] : []),
  ];
  const body: string[] = [];
  const list = (heading: string, items: string[]) => items.length && body.push("", `### ${heading}`, ...items.map((i) => `- ${i}`));
  if (p.about.trim()) body.push("", "### About the Role", p.about.trim());
  list("Key Responsibilities", p.responsibilities);
  list("Requirements", p.requirements);
  list("Good to Have", p.goodToHave);
  list("What You'll Gain", p.benefits);
  if (p.idealCandidate.trim()) body.push("", "### Who We're Looking For", p.idealCandidate.trim());
  if (p.applyUrl.trim()) body.push("", `**Apply Now:** ${p.applyUrl.trim()}`);
  return [...head, ...body].join("\n").trim() + "\n";
}

/* ── Starter templates ──────────────────────────────────────────────── */

export const POSTING_TEMPLATES: { id: string; label: string; kind: PostingKind; posting: Omit<Posting, "workMode" | "location" | "applyUrl"> }[] = [
  {
    id: "app-intern",
    label: "App Development Intern",
    kind: "internship",
    posting: {
      title: "App Development Intern",
      company: DEFAULT_COMPANY,
      jobType: "Internship",
      about:
        "MyLoginn is looking for a motivated **App Development Intern** to join our development team and gain hands-on experience building real-world mobile applications.\n\nYou'll work closely with our team on application development, UI implementation, API integration, testing, debugging, and improving existing features.",
      responsibilities: [
        "Develop and maintain mobile application features.",
        "Convert UI designs into responsive, user-friendly interfaces.",
        "Integrate REST APIs and work with backend services.",
        "Debug issues and improve application performance.",
        "Test features across different devices and screen sizes.",
        "Work with Git/GitHub for version control.",
        "Collaborate with developers and other team members on real projects.",
        "Learn and follow clean, maintainable coding practices.",
      ],
      requirements: [
        "Basic knowledge of **Flutter / React Native / Android development**.",
        "Understanding of programming fundamentals and OOP concepts.",
        "Basic knowledge of APIs, JSON, and database concepts.",
        "Familiarity with Git/GitHub.",
        "Good problem-solving and logical-thinking skills.",
        "Willingness to learn new technologies and take ownership of tasks.",
        "Students, freshers, and recent graduates with relevant skills are welcome.",
      ],
      goodToHave: [
        "Experience building academic or personal mobile applications.",
        "Knowledge of Firebase or similar backend services.",
        "Basic understanding of UI/UX principles.",
        "Familiarity with REST API tools such as Postman.",
      ],
      benefits: [
        "Hands-on experience working on real-world applications.",
        "Practical exposure to the complete app development lifecycle.",
        "Experience with modern development tools and workflows.",
        "Mentorship and guidance from the development team.",
        "Opportunity to strengthen your portfolio with practical projects.",
        "Internship certificate upon successful completion.",
      ],
      idealCandidate:
        "Someone who is **curious, responsible, willing to learn, and excited about building technology**. You don't need to know everything — we value strong fundamentals, problem-solving ability, and the willingness to improve.",
    },
  },
  {
    id: "ai-web-builder",
    label: "AI Web Builder",
    kind: "job",
    posting: {
      title: "AI Web Builder",
      company: DEFAULT_COMPANY,
      jobType: "Full-time / Internship",
      about:
        "MyLoginn is looking for a creative and technically strong **AI Web Builder** to build modern, responsive, and high-quality websites using AI-powered development tools and modern web technologies.\n\nYou'll work on real-world websites, landing pages, business platforms, and web experiences while combining **AI, design, development, and problem-solving**.",
      responsibilities: [
        "Build responsive and modern websites using AI-assisted development tools.",
        "Convert ideas, requirements, and designs into functional web experiences.",
        "Create clean, responsive, and user-friendly UI components.",
        "Integrate APIs, forms, databases, and third-party services.",
        "Use AI tools effectively for development, debugging, optimization, and productivity.",
        "Test websites across browsers, devices, and screen sizes.",
        "Identify and fix UI, functionality, and performance issues.",
        "Work with Git/GitHub and follow proper development workflows.",
        "Collaborate with the team to deliver projects on time.",
      ],
      requirements: [
        "Basic understanding of **HTML, CSS, JavaScript** and modern web development.",
        "Familiarity with **React / Next.js** or similar frameworks is an advantage.",
        "Comfortable using AI coding and website-building tools.",
        "Understanding of responsive design and basic UI/UX principles.",
        "Basic knowledge of APIs, JSON, and Git/GitHub.",
        "Good problem-solving and logical-thinking skills.",
        "Ability to learn quickly and work independently when required.",
      ],
      goodToHave: [
        "Experience with **React, Next.js, Tailwind CSS, TypeScript**, or similar technologies.",
        "Knowledge of Firebase, Supabase, or other backend services.",
        "Experience with AI tools such as ChatGPT, Claude, Cursor, Lovable, Bolt, or similar platforms.",
        "Basic understanding of SEO and website performance.",
        "Experience building personal, academic, freelance, or client projects.",
      ],
      benefits: [
        "Hands-on experience building real-world websites and digital products.",
        "Practical experience with AI-assisted software development.",
        "Exposure to modern web technologies and development workflows.",
        "Experience working on client-focused projects.",
        "Mentorship and guidance from the development team.",
        "Opportunity to build a strong professional portfolio.",
        "Internship certificate / experience certificate based on the role and successful completion.",
      ],
      idealCandidate:
        "We're looking for someone who **enjoys building things, experiments with AI tools, solves problems independently, and continuously learns**. Strong curiosity and practical skills matter more than knowing every technology.",
    },
  },
];

/** Quick-add suggestions for "What You'll Gain". */
export const BENEFIT_SUGGESTIONS = [
  "Hands-on experience working on real-world projects.",
  "Mentorship and guidance from the development team.",
  "Opportunity to build a strong professional portfolio.",
  "Internship certificate upon successful completion.",
  "Experience certificate based on the role and successful completion.",
  "Flexible working hours.",
];

/* ── Pay ────────────────────────────────────────────────────────────── */

/** Salary choices for job openings (stored as text in `salaryRange`; blank hides the salary). */
export const SALARY_OPTIONS = [
  "To be discussed",
  "Up to 2 LPA",
  "2 - 3 LPA",
  "3 LPA",
  "3 - 4 LPA",
  "4 LPA",
  "4 - 6 LPA",
  "5 LPA",
  "6 LPA",
  "6 - 8 LPA",
  "8 LPA",
  "8 - 10 LPA",
  "10 LPA",
  "10 - 12 LPA",
  "12 - 15 LPA",
  "15 - 20 LPA",
  "20 LPA+",
] as const;

/** Monthly stipend choices for internships, in rupees. "To be discussed" is a paid internship without an amount. */
export const STIPEND_OPTIONS = [2000, 3000, 5000, 7500, 10000, 12000, 15000, 20000, 25000, 30000] as const;

/* ── Internship duration ────────────────────────────────────────────── */

export const DURATION_UNITS = ["weeks", "months"] as const;
export type DurationUnit = (typeof DURATION_UNITS)[number];

/** "8 weeks", "3 months", "1 month"; null when no duration is set. */
export function formatDuration(amount: number | null | undefined, unit: string | null | undefined) {
  if (!amount) return null;
  const u = unit === "months" ? "month" : "week";
  return `${amount} ${u}${amount === 1 ? "" : "s"}`;
}

/** The duration in weeks (a month counts as 4⅓ weeks), for averages; null when no duration is set. */
export function durationInWeeks(amount: number | null | undefined, unit: string | null | undefined) {
  if (!amount) return null;
  return unit === "months" ? Math.round(amount * 4.33) : amount;
}

/* ── Save errors ────────────────────────────────────────────────────── */

/** A readable message for a failed posting save, so the admin sees the cause instead of a generic error. */
export function postingSaveError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  if (code === "P2022" || code === "P2021") return "The database is missing the latest posting fields. Run `npx prisma db push` (or redeploy), then save again.";
  if (code === "P2025") return "This posting no longer exists. Close the editor and refresh.";
  return "Could not save the posting. Please try again.";
}
