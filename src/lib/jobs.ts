import { z } from "zod";
import { contactEmailSchema, personNameSchema, phoneSchema } from "@/lib/validation";
import { WORK_MODES } from "@/lib/postings";

export const JOB_TEAMS = ["Engineering", "Design", "AI", "Marketing", "Operations", "Sales", "Support"] as const;
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
export const JOB_STATUSES = ["open", "upcoming", "closed", "draft"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABEL: Record<JobStatus, string> = { open: "Open now", upcoming: "Opening soon", closed: "Closed", draft: "Draft" };

/** Internships have no end date: they are open, closed or a draft until an administrator changes it. */
export const INTERNSHIP_POST_STATUSES = ["open", "closed", "draft"] as const;
export type InternshipPostStatus = (typeof INTERNSHIP_POST_STATUSES)[number];

/** The review pipeline for job applications. Internship applications keep their older status names (see INTERNSHIP_STATUSES). */
export const APPLICATION_STATUSES = [
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview", label: "Interview" },
  { id: "offered", label: "Offered" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
] as const;

export const INTERNSHIP_STATUSES = [
  { id: "submitted", label: "New" },
  { id: "under_review", label: "Reviewing" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
] as const;

export type ApplicationSource = "job" | "internship";

export function statusesFor(source: ApplicationSource) {
  return source === "job" ? APPLICATION_STATUSES : INTERNSHIP_STATUSES;
}

/** Whether a status means the application has not been looked at yet. */
export const isUnreviewed = (status: string) => status === "new" || status === "submitted";

const DAY = 24 * 60 * 60 * 1000;

/**
 * The status the public sees. The stored status is what an administrator chose; dates then move it along on their own:
 * an "upcoming" role opens when its opening date arrives, and an "open" or "upcoming" role closes after its last
 * application day (inclusive). Draft and closed are always honoured as stored.
 */
export function effectiveStatus(job: { status: string; openFrom: Date | null; closeBy: Date | null }, now = new Date()): JobStatus {
  if (job.status === "draft") return "draft";
  if (job.status === "closed") return "closed";
  const closed = job.closeBy ? job.closeBy.getTime() + DAY <= now.getTime() : false;
  if (job.status === "upcoming" && job.openFrom && job.openFrom.getTime() > now.getTime()) return "upcoming";
  return closed ? "closed" : "open";
}

export function slugifyJob(text: string) {
  return text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "role";
}

/* ── Validation ─────────────────────────────────────────────────────── */

const lines = (min: number, max: number, label: string) =>
  z.array(z.string().trim().min(3, `Each ${label} needs at least 3 characters`).max(220, `Keep each ${label} under 220 characters`)).min(min, `Add at least ${min} ${label}`).max(max, `Add at most ${max} ${label}s`);

const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`).optional().or(z.literal("")).transform((v) => v || null);

const dateInput = z.string().trim().optional().or(z.literal("")).nullable().transform((v, ctx) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    ctx.addIssue({ code: "custom", message: "Enter a valid date" });
    return z.NEVER;
  }
  return d;
});

const optionalLines = (max: number, label: string) => lines(0, max, label).default([]);

/** An optional apply link (https://…) or email address. */
const applyUrlInput = z
  .string()
  .trim()
  .max(200, "That link is too long")
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^(https?:\/\/)?[^\s]+\.[^\s]+$/i.test(v), { message: "Enter a link (https://…) or an email address" })
  .transform((v) => v || null);

/** Shared posting sections: header details and the About / Responsibilities / Requirements / … body. */
const postingFields = {
  title: z.string().trim().min(3, "Enter the role title").max(100, "Keep the title under 100 characters"),
  company: z.string().trim().min(2, "Enter the company").max(100),
  workMode: z.enum(WORK_MODES, { message: "Choose a work mode" }),
  location: z.string().trim().max(80, "Keep the location under 80 characters").optional().default(""),
  responsibilities: lines(1, 15, "responsibility"),
  requirements: lines(1, 15, "requirement"),
  goodToHave: optionalLines(12, "good-to-have point"),
  benefits: optionalLines(12, "benefit"),
  idealCandidate: optionalText(1200),
  applyUrl: applyUrlInput,
};

/** "Full-time / Internship": one or more employment types joined with " / ". */
const jobTypeInput = z
  .string()
  .trim()
  .refine((v) => {
    const parts = v.split("/").map((p) => p.trim()).filter(Boolean);
    return parts.length > 0 && parts.every((p) => (JOB_TYPES as readonly string[]).includes(p));
  }, { message: "Choose at least one job type" });

export const jobInputSchema = z
  .object({
    ...postingFields,
    team: z.string().trim().min(2, "Choose a team").max(40),
    type: jobTypeInput,
    experience: optionalText(60),
    salaryRange: optionalText(60),
    positions: z.coerce.number().int().min(1, "At least one position").max(99),
    summary: z.string().trim().min(20, "Describe the role in at least 20 characters").max(2000, "Keep About the role under 2000 characters"),
    status: z.enum(JOB_STATUSES),
    openFrom: dateInput,
    // Roles have no end date any more; saving a role clears an old one so only the status decides.
    closeBy: z.any().optional().transform(() => null),
  })
  .superRefine((v, ctx) => {
    if (v.status === "upcoming" && !v.openFrom) ctx.addIssue({ code: "custom", path: ["openFrom"], message: "An upcoming role needs an opening date" });
  });

export type JobInput = z.infer<typeof jobInputSchema>;

/** An internship posting. Lists are stored one item per line; there is no end date (see INTERNSHIP_POST_STATUSES). */
export const internshipInputSchema = z
  .object({
    ...postingFields,
    description: z.string().trim().min(20, "Describe the role in at least 20 characters").max(2000, "Keep About the role under 2000 characters"),
    durationWeeks: z.coerce.number().int().min(1, "At least 1 week").max(52, "At most 52 weeks"),
    paid: z.boolean(),
    stipend: z.coerce.number().int().min(0).max(500000).nullable().optional().transform((v) => v || null),
    mentorName: z.string().trim().max(80).optional().default(""),
    mentorEmail: z.string().trim().max(120).optional().or(z.literal("")).refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Enter a valid mentor email" }).transform((v) => v ?? ""),
    featured: z.boolean().default(false),
    status: z.enum(INTERNSHIP_POST_STATUSES),
  })
  .transform(({ workMode, responsibilities, requirements, goodToHave, benefits, paid, stipend, ...rest }) => ({
    ...rest,
    // The internship's `type` column holds its work mode (On-site / Hybrid / Remote).
    type: workMode,
    paid,
    stipend: paid ? stipend : null,
    responsibilities: responsibilities.join("\n"),
    requirements: requirements.join("\n"),
    goodToHave: goodToHave.join("\n"),
    benefits: benefits.join("\n"),
  }));

export const jobApplicationSchema = z.object({
  jobId: z.string().trim().max(40).optional().or(z.literal("")).transform((v) => v || null),
  name: personNameSchema,
  email: contactEmailSchema,
  phone: phoneSchema,
  experienceYears: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v, ctx) => {
      if (!v) return null;
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 50) {
        ctx.addIssue({ code: "custom", message: "Enter your experience in whole years (0 for a fresher)" });
        return z.NEVER;
      }
      return n;
    }),
  currentRole: optionalText(80),
  profileUrl: z
    .string()
    .trim()
    .max(200, "That link is too long")
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v), { message: "Enter a full link starting with https://" })
    .transform((v) => v || null),
  coverNote: z
    .string()
    .trim()
    .max(1500, "Keep your note under 1500 characters")
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.length >= 10, { message: "Add a few more words to your note (at least 10 characters)" })
    .transform((v) => v || null),
});

export const reviewSchema = z.object({
  status: z.string().trim().min(2).max(30).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  notes: z.string().trim().max(3000, "Keep notes under 3000 characters").optional(),
});
