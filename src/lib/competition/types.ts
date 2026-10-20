/** Shared competition types and labels. Client-safe. */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export type CompetitionStatus =
  | "DRAFT"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "SCHEDULED"
  | "LIVE"
  | "SUBMISSION_CLOSED"
  | "EVALUATION"
  | "UNDER_REVIEW"
  | "RESULTS_PUBLISHED"
  | "ARCHIVED";

export const STATUS_ORDER: CompetitionStatus[] = [
  "DRAFT",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "SCHEDULED",
  "LIVE",
  "SUBMISSION_CLOSED",
  "EVALUATION",
  "UNDER_REVIEW",
  "RESULTS_PUBLISHED",
  "ARCHIVED",
];

export const STATUS_LABEL: Record<CompetitionStatus, string> = {
  DRAFT: "Draft",
  REGISTRATION_OPEN: "Registration open",
  REGISTRATION_CLOSED: "Registration closed",
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  SUBMISSION_CLOSED: "Submissions closed",
  EVALUATION: "Evaluation in progress",
  UNDER_REVIEW: "Under review",
  RESULTS_PUBLISHED: "Results published",
  ARCHIVED: "Archived",
};

/** One question slot of a competition: every candidate gets `count` questions of `difficulty`, each worth `marks`. */
export type BlueprintSlot = { difficulty: Difficulty; count: number; marks: number };

export function parseBlueprint(value: unknown): BlueprintSlot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((slot) => {
    const s = slot as Partial<BlueprintSlot>;
    if (!s || !DIFFICULTIES.includes(s.difficulty as Difficulty)) return [];
    const count = Number(s.count);
    const marks = Number(s.marks);
    if (!Number.isInteger(count) || count < 1 || count > 10 || !(marks > 0) || marks > 1000) return [];
    return [{ difficulty: s.difficulty as Difficulty, count, marks }];
  });
}

export const blueprintMaxScore = (bp: BlueprintSlot[]) => bp.reduce((sum, s) => sum + s.count * s.marks, 0);
export const blueprintQuestionCount = (bp: BlueprintSlot[]) => bp.reduce((sum, s) => sum + s.count, 0);

export type CertificateKind = "PARTICIPATION" | "WINNER" | "RUNNER_UP" | "SECOND_RUNNER_UP";
export const CERTIFICATE_LABEL: Record<CertificateKind, string> = {
  PARTICIPATION: "Certificate of Participation",
  WINNER: "Winner — First Place",
  RUNNER_UP: "Runner-up — Second Place",
  SECOND_RUNNER_UP: "Second Runner-up — Third Place",
};
export const AWARD_FOR_RANK: Record<number, CertificateKind> = { 1: "WINNER", 2: "RUNNER_UP", 3: "SECOND_RUNNER_UP" };

export type LeaderboardEntry = {
  rank: number;
  candidateId: string;
  displayName: string;
  finalScore: number;
  maxScore: number;
  award: CertificateKind | null;
};

/** Formats an instant in the competition's time zone, e.g. "12 Nov 2026, 10:00 am IST". */
export function formatInZone(date: Date | string, timeZone: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
    ...opts,
  }).format(typeof date === "string" ? new Date(date) : date);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
