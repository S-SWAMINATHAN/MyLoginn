import "server-only";
import { z } from "zod";
import type { CcQuestion, CcTestCase, Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALGORITHM_VERSION, analyzeBank, assignOne, assignmentSeed, newEngineState, type EngineState, type PoolQuestion } from "../assignment";
import { COMPETITION_LANGUAGES, LANGUAGE_KEYS, toLanguageList, type CompetitionLanguage } from "../languages";
import { parseBlueprint, type Difficulty } from "../types";
import { audit } from "./audit";
import { ApiError } from "./http";

const text = (max: number) => z.string().max(max);
export const questionInputSchema = z.object({
  family: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{1,60}$/, "Family: lowercase letters, digits and hyphens"),
  title: z.string().trim().min(3).max(140),
  statement: z.string().trim().min(20).max(20_000),
  inputFormat: text(4000).default(""),
  outputFormat: text(4000).default(""),
  constraints: text(4000).default(""),
  examples: z.array(z.object({ input: text(4000), output: text(4000), explanation: text(2000).optional() })).max(5).default([]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  topic: z.string().trim().min(2).max(60),
  expectedMinutes: z.number().int().min(2).max(240),
  timeLimitMs: z.number().int().min(200).max(10_000).default(2000),
  memoryLimitMb: z.number().int().min(32).max(1024).default(256),
  languages: z.array(z.enum(LANGUAGE_KEYS as [CompetitionLanguage, ...CompetitionLanguage[]])).min(1),
  starterCode: z.record(z.string(), text(20_000)).default({}),
  referenceSolution: z.string().min(1).max(64_000),
  referenceLanguage: z.enum(LANGUAGE_KEYS as [CompetitionLanguage, ...CompetitionLanguage[]]),
  comparator: z.string().regex(/^(exact|trim|float:\d+(\.\d+)?(e-?\d+)?)$/).default("trim"),
  active: z.boolean().default(true),
  tests: z
    .array(z.object({ input: text(200_000), expected: text(200_000), isSample: z.boolean().default(false), weight: z.number().int().min(0).max(100).default(1) }))
    .min(1)
    .max(60)
    .refine((ts) => ts.some((t) => t.weight > 0 && !t.isSample), "Add at least one hidden, scored test case."),
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

/** Fields a candidate may see. Tests, reference solution and comparator internals stay on the server. */
export function candidateQuestion(q: CcQuestion, item: { position: number; marks: number }, languages: CompetitionLanguage[]) {
  const starter = (q.starterCode ?? {}) as Record<string, string>;
  return {
    id: q.id,
    position: item.position,
    marks: item.marks,
    title: q.title,
    statement: q.statement,
    inputFormat: q.inputFormat,
    outputFormat: q.outputFormat,
    constraints: q.constraints,
    examples: q.examples as { input: string; output: string; explanation?: string }[],
    difficulty: q.difficulty,
    timeLimitMs: q.timeLimitMs,
    memoryLimitMb: q.memoryLimitMb,
    starterCode: Object.fromEntries(languages.map((l) => [l, starter[l] || COMPETITION_LANGUAGES[l].starter])),
  };
}
export type CandidateQuestion = ReturnType<typeof candidateQuestion>;

function questionData(input: QuestionInput): Omit<Prisma.CcQuestionCreateInput, "family" | "version"> {
  return {
    title: input.title,
    statement: input.statement,
    inputFormat: input.inputFormat,
    outputFormat: input.outputFormat,
    constraints: input.constraints,
    examples: input.examples,
    difficulty: input.difficulty,
    topic: input.topic,
    expectedMinutes: input.expectedMinutes,
    timeLimitMs: input.timeLimitMs,
    memoryLimitMb: input.memoryLimitMb,
    languages: input.languages,
    starterCode: input.starterCode,
    referenceSolution: input.referenceSolution,
    referenceLanguage: input.referenceLanguage,
    comparator: input.comparator,
    active: input.active,
  };
}
const testRows = (input: QuestionInput) => input.tests.map((t, position) => ({ ...t, position }));

export async function createQuestion(input: QuestionInput, actorId: string) {
  return prisma.$transaction(async (tx) => {
    if (await tx.ccQuestion.findFirst({ where: { family: input.family } })) throw new ApiError(409, "That family already exists. Add a variant with a different family, or edit the existing question.");
    const q = await tx.ccQuestion.create({ data: { ...questionData(input), family: input.family, version: 1, tests: { create: testRows(input) } } });
    await audit(tx, { actorId, action: "question.create", entity: "CcQuestion", entityId: q.id, meta: { family: q.family } });
    return q;
  });
}

/**
 * Edits a question. A question already locked into a competition is never changed: the edit becomes a new version
 * (same family) and the old row is retired from future pools, while existing assignments keep the exact version.
 */
export async function updateQuestion(id: string, input: QuestionInput, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.ccQuestion.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Question not found.");
    if (input.family !== current.family) throw new ApiError(400, "The family of an existing question cannot change.");
    if (current.lockedAt) {
      const latest = await tx.ccQuestion.findFirst({ where: { family: current.family }, orderBy: { version: "desc" } });
      const q = await tx.ccQuestion.create({ data: { ...questionData(input), family: current.family, version: (latest?.version ?? current.version) + 1, tests: { create: testRows(input) } } });
      await tx.ccQuestion.update({ where: { id }, data: { active: false } });
      await audit(tx, { actorId, action: "question.version", entity: "CcQuestion", entityId: q.id, meta: { from: id, version: q.version } });
      return q;
    }
    await tx.ccTestCase.deleteMany({ where: { questionId: id } });
    const q = await tx.ccQuestion.update({ where: { id }, data: { ...questionData(input), tests: { create: testRows(input) } } });
    await audit(tx, { actorId, action: "question.update", entity: "CcQuestion", entityId: id });
    return q;
  });
}

export async function setQuestionActive(id: string, active: boolean, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const q = await tx.ccQuestion.update({ where: { id }, data: { active } });
    await audit(tx, { actorId, action: active ? "question.activate" : "question.deactivate", entity: "CcQuestion", entityId: id });
    return q;
  });
}

/** Active questions usable by this competition: every enabled language supported and at least one scored test. */
export async function poolFor(c: Pick<Competition, "languages" | "blueprint">): Promise<(CcQuestion & { tests: CcTestCase[] })[]> {
  const langs = toLanguageList(c.languages);
  const diffs = [...new Set(parseBlueprint(c.blueprint).map((s) => s.difficulty))];
  const rows = await prisma.ccQuestion.findMany({ where: { active: true, difficulty: { in: diffs } }, include: { tests: true } });
  return rows.filter((q) => {
    const supported = toLanguageList(q.languages);
    return langs.every((l) => supported.includes(l)) && q.tests.some((t) => t.weight > 0 && !t.isSample);
  });
}

const toPool = (qs: CcQuestion[]): PoolQuestion[] => qs.map((q) => ({ id: q.id, family: q.family, difficulty: q.difficulty as Difficulty, topic: q.topic, expectedMinutes: q.expectedMinutes }));

export async function analyzeCompetitionBank(c: Competition) {
  const pool = await poolFor(c);
  const participants = Math.max(c.registrationCount, c.status === "DRAFT" || c.status === "REGISTRATION_OPEN" ? c.maxParticipants : 0, 1);
  return { ...analyzeBank(parseBlueprint(c.blueprint), toPool(pool), participants, c.timeBalanceTolerance), poolSize: pool.length, participants };
}

/**
 * Generates and persists every candidate's question set in candidate-ID order (deterministic and auditable).
 * Allowed until the first attempt starts; regenerating replaces all sets.
 */
export async function generateAssignments(competitionId: string, actorId: string, acknowledgeWarnings: boolean) {
  const c = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!c) throw new ApiError(404, "Competition not found.");
  if (!["REGISTRATION_CLOSED", "SCHEDULED"].includes(c.status)) throw new ApiError(409, "Generate assignments after registration closes and before the competition goes live.");
  if (await prisma.ccAttempt.count({ where: { competitionId } })) throw new ApiError(409, "Attempts have started; assignments can no longer change.");
  const analysis = await analyzeCompetitionBank(c);
  if (!analysis.ok) throw new ApiError(409, analysis.errors.join(" "));
  if (analysis.warnings.length && !acknowledgeWarnings) throw new ApiError(409, `Review the question-bank warnings first: ${analysis.warnings.join(" ")}`, "NEEDS_ACK");

  const blueprint = parseBlueprint(c.blueprint);
  const pool = toPool(await poolFor(c));
  const registrations = await prisma.ccRegistration.findMany({ where: { competitionId }, orderBy: { candidateId: "asc" }, select: { id: true } });
  const state = newEngineState();
  const plans = registrations.map((r) => {
    const seed = assignmentSeed(c.id, r.id, c.assignmentSalt);
    return { registrationId: r.id, seed, ...assignOne(blueprint, pool, seed, c.timeBalanceTolerance, state) };
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.ccAssignment.deleteMany({ where: { competitionId } });
      for (let i = 0; i < plans.length; i += 250) {
        const chunk = plans.slice(i, i + 250).map((p) => ({ ...p, id: crypto.randomUUID() }));
        await tx.ccAssignment.createMany({
          data: chunk.map((p) => ({ id: p.id, competitionId, registrationId: p.registrationId, seed: p.seed, setHash: p.setHash, expectedMinutes: p.expectedMinutes, algorithmVersion: ALGORITHM_VERSION })),
        });
        await tx.ccAssignmentItem.createMany({ data: chunk.flatMap((p) => p.picks.map((x) => ({ assignmentId: p.id, questionId: x.questionId, position: x.position, difficulty: x.difficulty, marks: x.marks }))) });
      }
      const used = [...state.exposure.keys()];
      await tx.ccQuestion.updateMany({ where: { id: { in: used }, lockedAt: null }, data: { lockedAt: new Date() } });
      await tx.competition.update({ where: { id: competitionId }, data: { assignmentsGeneratedAt: new Date() } });
      await audit(tx, {
        competitionId,
        actorId,
        action: "assignments.generate",
        entity: "Competition",
        entityId: competitionId,
        meta: {
          algorithmVersion: ALGORITHM_VERSION,
          candidates: plans.length,
          distinctSets: new Set(plans.map((p) => p.setHash)).size,
          unbalanced: plans.filter((p) => !p.balanced).length,
          poolIds: pool.map((q) => q.id).sort(),
          warningsAcknowledged: analysis.warnings,
        },
      });
    },
    { timeout: 120_000, maxWait: 20_000 }
  );
  return { candidates: plans.length, distinctSets: new Set(plans.map((p) => p.setHash)).size, unbalanced: plans.filter((p) => !p.balanced).length };
}

/**
 * Assigns one candidate who has no set yet (e.g. registered after generation by an admin). Continues from the
 * competition's existing exposure counts under a per-competition lock, so concurrent starts cannot collide.
 */
export async function ensureAssignment(tx: Prisma.TransactionClient, c: Competition, registrationId: string) {
  const existing = await tx.ccAssignment.findUnique({ where: { registrationId }, include: { items: { orderBy: { position: "asc" } } } });
  if (existing) return existing;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"cc_assign:" + c.id}))`;
  const again = await tx.ccAssignment.findUnique({ where: { registrationId }, include: { items: { orderBy: { position: "asc" } } } });
  if (again) return again;
  const pool = toPool(await poolFor(c));
  const state: EngineState = newEngineState();
  const exposure = await tx.ccAssignmentItem.groupBy({ by: ["questionId"], where: { assignment: { competitionId: c.id } }, _count: { _all: true } });
  for (const e of exposure) state.exposure.set(e.questionId, e._count._all);
  for (const a of await tx.ccAssignment.findMany({ where: { competitionId: c.id }, select: { setHash: true } })) state.usedSets.add(a.setHash);
  const seed = assignmentSeed(c.id, registrationId, c.assignmentSalt);
  const plan = assignOne(parseBlueprint(c.blueprint), pool, seed, c.timeBalanceTolerance, state);
  const created = await tx.ccAssignment.create({
    data: {
      competitionId: c.id,
      registrationId,
      seed,
      setHash: plan.setHash,
      expectedMinutes: plan.expectedMinutes,
      algorithmVersion: ALGORITHM_VERSION,
      items: { create: plan.picks.map((x) => ({ questionId: x.questionId, position: x.position, difficulty: x.difficulty, marks: x.marks })) },
    },
    include: { items: { orderBy: { position: "asc" } } },
  });
  await tx.ccQuestion.updateMany({ where: { id: { in: plan.picks.map((p) => p.questionId) }, lockedAt: null }, data: { lockedAt: new Date() } });
  return created;
}

/** Per-question exposure for the admin fairness view. */
export async function exposureReport(competitionId: string) {
  const [items, sets] = await Promise.all([
    prisma.ccAssignmentItem.groupBy({ by: ["questionId", "difficulty"], where: { assignment: { competitionId } }, _count: { _all: true } }),
    prisma.ccAssignment.groupBy({ by: ["setHash"], where: { competitionId }, _count: { _all: true } }),
  ]);
  const questions = await prisma.ccQuestion.findMany({ where: { id: { in: items.map((i) => i.questionId) } }, select: { id: true, title: true, family: true, version: true, topic: true, expectedMinutes: true } });
  const byId = new Map(questions.map((q) => [q.id, q]));
  return {
    questions: items.map((i) => ({ ...byId.get(i.questionId), difficulty: i.difficulty, candidates: i._count._all })).sort((a, b) => b.candidates - a.candidates),
    distinctSets: sets.length,
    largestSharedSet: Math.max(0, ...sets.map((s) => s._count._all)),
    assignments: sets.reduce((n, s) => n + s._count._all, 0),
  };
}
