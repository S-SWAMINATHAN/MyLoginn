/** One report shape for every Practice module, so a single report page and a single PDF generator serve them all. */

export type Pair = { said: string; better: string; why?: string };
export type QaItem = { q: string; a: string; feedback?: string; score?: number; better?: string; stage?: string };

export type ReportSection =
  | { kind: "list"; title: string; items: string[]; tone?: "good" | "warn" | "plan" }
  | { kind: "text"; title: string; text: string }
  | { kind: "pairs"; title: string; pairs: Pair[] }
  | { kind: "qa"; title: string; items: QaItem[] }
  | { kind: "table"; title: string; columns: string[]; rows: (string | number)[][] };

export type PracticeReport = {
  version: 1;
  module: "INTERVIEW" | "SPEAKING" | "GD";
  title: string;
  subtitle: string;
  overall: number;
  level: string;
  dimensions: { key: string; label: string; score: number }[];
  stats: { label: string; value: string }[];
  summary: string;
  sections: ReportSection[];
  /** False when the AI summary failed and the report was assembled from per-answer results only. */
  aiSummary: boolean;
  /** No score could be given (e.g. a GD where the learner's speech could not be evaluated). */
  unscored?: boolean;
};

export const MODULE_LABEL: Record<string, string> = { INTERVIEW: "AI Mock Interview", SPEAKING: "Speaking Lab", GD: "Group Discussion" };

export function readinessLevel(score: number) {
  if (score >= 85) return "Interview Ready";
  if (score >= 75) return "Good — Interview Ready with Improvement Areas";
  if (score >= 65) return "Developing — Practise Weak Areas Before Interviews";
  return "Not Yet Ready — Build the Fundamentals First";
}

/** Weighted mean that ignores missing dimensions and renormalises the weights. */
export function weightedScore(scores: Record<string, number | undefined>, weights: Record<string, number>) {
  let sum = 0, total = 0;
  for (const [k, w] of Object.entries(weights)) {
    const v = scores[k];
    if (typeof v === "number" && Number.isFinite(v)) { sum += v * w; total += w; }
  }
  return total ? Math.round(sum / total) : 0;
}

export const mean = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0);

export const formatDuration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ""}`.trim() : `${s} s`);
