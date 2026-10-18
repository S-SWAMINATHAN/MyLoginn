import { prisma } from "@/lib/prisma";
import { applyActivity } from "../progress";
import { CODE_XP } from "./tracks";
import type { CodeDifficulty } from "./types";

export type SubmitInput = {
  userId: string; slug: string; difficulty: CodeDifficulty; language: string; source: string;
  verdict: string; passed: number; total: number; verified: boolean;
};

/** Stores a submission, keeps the learner's latest code, and awards XP once on the first accepted solution. */
export async function recordCodeSubmission(s: SubmitInput) {
  const accepted = s.verdict === "ACCEPTED";
  return prisma.$transaction(async (tx) => {
    const prev = await tx.lqCodeProgress.findUnique({ where: { userId_slug: { userId: s.userId, slug: s.slug } } });
    const drafts = { ...((prev?.drafts as Record<string, string> | null) ?? {}), [s.language]: s.source };
    const firstSolve = accepted && !prev?.solved;
    await tx.lqCodeProgress.upsert({
      where: { userId_slug: { userId: s.userId, slug: s.slug } },
      create: { userId: s.userId, slug: s.slug, attempts: 1, solved: accepted, bestPassed: s.passed, drafts, solvedAt: accepted ? new Date() : null },
      update: { attempts: { increment: 1 }, bestPassed: Math.max(prev?.bestPassed ?? 0, s.passed), drafts, ...(firstSolve ? { solved: true, solvedAt: new Date() } : {}) },
    });
    await tx.lqCodeSubmission.create({ data: { userId: s.userId, slug: s.slug, language: s.language, source: s.source, verdict: s.verdict, passed: s.passed, total: s.total, verified: s.verified } });
    const credit = await applyActivity(tx, {
      userId: s.userId, success: accepted, xp: firstSolve ? CODE_XP[s.difficulty] : 0,
      eventKey: `code:${s.userId}:${s.slug}`, reason: "CODE_SOLVE", ref: s.slug, solved: 1,
    });
    return { firstSolve: firstSolve && credit.xpGranted > 0, xpAwarded: credit.xpGranted, streak: credit.streak };
  });
}

export async function codeProgressFor(userId: string) {
  const rows = await prisma.lqCodeProgress.findMany({ where: { userId }, select: { slug: true, solved: true, attempts: true } });
  return new Map(rows.map((r) => [r.slug, r]));
}
