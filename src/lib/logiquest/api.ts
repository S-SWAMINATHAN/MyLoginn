import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LANGUAGES, MAX_SOURCE_BYTES } from "./constants";
import { availableLanguages, executorConfigured } from "./executor";
import type { JudgeReport } from "./judge";

export const err = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function readBody<T>(request: Request, maxBytes = 80_000): Promise<T | null> {
  const text = await request.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try { return JSON.parse(text) as T; } catch { return null; }
}

/** Authenticated learner + a PUBLISHED challenge. Unpublished challenges are invisible to learners. */
export async function loadChallengeForUser(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: err("Log in to continue.", 401) } as const;
  const challenge = await prisma.lqChallenge.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!challenge) return { error: err("Challenge not found.", 404) } as const;
  return { user, challenge } as const;
}

export function validateCode(challenge: { languages: string[] }, body: { language?: unknown; source?: unknown } | null) {
  if (!body || typeof body.language !== "string" || typeof body.source !== "string") return err("Send a language and your code.", 400);
  if (!LANGUAGES[body.language] || !challenge.languages.includes(body.language) || !availableLanguages().includes(body.language)) return err("That language is not available for this challenge.", 400);
  if (!body.source.trim()) return err("Write some code first.", 400);
  if (Buffer.byteLength(body.source) > MAX_SOURCE_BYTES) return err("Your code is too long.", 413);
  if (!executorConfigured()) return err("Code execution is not available right now. Please try again later.", 503);
  return null;
}

/** Strips everything a learner must not see: hidden inputs/outputs are never included, only pass/fail. */
export function publicReport(report: JudgeReport) {
  let hiddenIndex = 0;
  return {
    verdict: report.verdict,
    passed: report.passed,
    total: report.total,
    timeMs: report.timeMs,
    message: report.message,
    firstFailure: report.firstFailure,
    cases: report.outcomes.map((o, i) => (o.isPublic
      ? { label: o.label ?? `Example ${i + 1}`, passed: o.passed, hidden: false, verdict: o.verdict, timeMs: o.timeMs }
      : { label: o.isEdge ? `Hidden edge case ${++hiddenIndex}` : `Hidden test ${++hiddenIndex}`, passed: o.passed, hidden: true, verdict: o.passed ? "ACCEPTED" : "FAILED", timeMs: o.timeMs })),
  };
}
