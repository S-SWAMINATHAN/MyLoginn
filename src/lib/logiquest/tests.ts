import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequiredServerEnv } from "@/lib/env";
import { SUBJECTS, getSubjectMeta } from "./catalog";
import { forTest, getQuestions, hiddenIds, loadSubject } from "./bank";
import { TEST_GRACE_SECONDS, TEST_MINUTES, TEST_SIZE, TEST_XP_PER_CORRECT } from "./constants";
import { applyActivity, dayKey } from "./progress";
import type { Question } from "./types";

/** How subjects are grouped on the Online Tests page. */
export const TEST_GROUPS: { id: string; title: string; groups: string[] }[] = [
  { id: "general", title: "General", groups: ["aptitude", "verbal", "reasoning", "gk", "puzzles"] },
  { id: "programming", title: "Programming", groups: ["programming"] },
  { id: "technical", title: "Technical", groups: ["technical"] },
  { id: "engineering", title: "Engineering", groups: ["engineering"] },
  { id: "medical", title: "Medical Science", groups: ["medical"] },
];

export function testableSubjects() {
  return SUBJECTS.filter((s) => s.kind === "mcq");
}

type Claims = { jti: string; t: string; tp: string | null; q: string[]; s: number; m: number };

function secret() {
  return `${getRequiredServerEnv("JWT_SECRET")}:logiquest-test`;
}

/** Picks a random test. Questions are spread across topics; answers are never sent until submission. */
export async function startTest(subject: string, topic: string | null, size = TEST_SIZE) {
  const meta = getSubjectMeta(subject);
  if (!meta || meta.kind !== "mcq") return null;
  if (topic && !meta.topics.some((x) => x.slug === topic)) return null;
  const [content, hidden] = await Promise.all([loadSubject(subject), hiddenIds()]);
  const byTopic = Object.entries(content)
    .filter(([slug]) => !topic || slug === topic)
    .map(([, t]) => t.exercises.flatMap((e) => e.questions).filter((q) => q.kind === "mcq" && !hidden.has(q.id)))
    .filter((list) => list.length);
  if (!byTopic.length) return null;

  // Shuffle each topic, then deal round-robin so a subject test covers many topics.
  for (const list of byTopic) for (let i = list.length - 1; i > 0; i--) { const j = randomInt(i + 1); [list[i], list[j]] = [list[j], list[i]]; }
  for (let i = byTopic.length - 1; i > 0; i--) { const j = randomInt(i + 1); [byTopic[i], byTopic[j]] = [byTopic[j], byTopic[i]]; }
  const picked: Question[] = [];
  for (let round = 0; picked.length < size && byTopic.some((l) => l.length > round); round++) {
    for (const list of byTopic) if (list[round] && picked.length < size) picked.push(list[round]);
  }

  const minutes = Math.max(5, Math.round((TEST_MINUTES * picked.length) / TEST_SIZE));
  const claims: Claims = { jti: randomBytes(12).toString("hex"), t: subject, tp: topic, q: picked.map((q) => q.id), s: Date.now(), m: minutes };
  const token = jwt.sign(claims, secret(), { expiresIn: `${minutes + 120}m` });
  return { token, minutes, startedAt: claims.s, questions: picked.map(forTest) };
}

export type GradedItem = { id: string; subject: string; topic: string; q: string; o: string[]; a: number; e: string; selected: number; correct: boolean; passage?: string; media?: Question["media"] };

/** Grades a submitted test on the server, stores it for logged-in learners and awards XP once per test per day. */
export async function submitTest(token: string, answers: unknown, userId: string | null) {
  let claims: Claims;
  try {
    claims = jwt.verify(token, secret()) as Claims;
  } catch {
    return { error: "This test has expired. Please start a new one." } as const;
  }
  if (!Array.isArray(answers) || answers.length !== claims.q.length || !answers.every((x) => Number.isInteger(x) && x >= -1 && x < 8)) return { error: "Invalid answers." } as const;

  const elapsed = Math.round((Date.now() - claims.s) / 1000);
  const late = elapsed > claims.m * 60 + TEST_GRACE_SECONDS;
  const questions = await getQuestions(claims.q);
  const items: GradedItem[] = [];
  claims.q.forEach((id, i) => {
    const q = questions.get(id);
    if (!q) return; // removed from the bank since the test started
    // Answers given after the deadline are not counted.
    const selected = late ? -1 : (answers[i] as number);
    items.push({ id, subject: q.subject, topic: q.topic, q: q.q, o: q.o, a: q.a, e: q.e, selected, correct: selected === q.a, passage: q.passage, media: q.media });
  });
  const correct = items.filter((x) => x.correct).length;
  const wrong = items.filter((x) => x.selected >= 0 && !x.correct).length;
  const result = { test: claims.t, topic: claims.tp, total: items.length, correct, wrong, unanswered: items.length - correct - wrong, timeTakenS: Math.min(elapsed, claims.m * 60), late, items, xpAwarded: 0, saved: false };

  if (userId) {
    try {
      await prisma.lqTestAttempt.create({
        data: {
          id: claims.jti, userId, test: claims.tp ? `${claims.t}/${claims.tp}` : claims.t, qids: items.map((x) => x.id), answers: items.map((x) => x.selected),
          correct, wrong, total: items.length, timeTakenS: result.timeTakenS, startedAt: new Date(claims.s),
        },
      });
      result.saved = true;
      if (correct > 0) {
        const credit = await prisma.$transaction((tx) =>
          applyActivity(tx, { userId, success: true, xp: correct * TEST_XP_PER_CORRECT, reason: "ONLINE_TEST", ref: claims.t, eventKey: `test:${userId}:${claims.t}:${claims.tp ?? "all"}:${dayKey()}` }));
        result.xpAwarded = credit.xpGranted;
      }
    } catch (e) {
      // Same token submitted twice: keep the first result.
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
      result.saved = true;
    }
  }
  return result;
}
export type TestResult = Exclude<Awaited<ReturnType<typeof submitTest>>, { error: string }>;
