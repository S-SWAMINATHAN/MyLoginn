import { prisma } from "@/lib/prisma";
import { LogiQuestManager, type AdminRow } from "@/components/admin/LogiQuestManager";
import { StatTile } from "@/components/logiquest/ui";

export const metadata = { title: "LogiQuest — MyLoginn Admin" };

const since = (days: number) => new Date(Date.now() - days * 24 * 3600_000);

export default async function AdminLogiQuest() {
  const [challenges, questions, learners, subs, accepted, dau, wau, mau, byLang] = await Promise.all([
    prisma.lqChallenge.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 }),
    prisma.lqQuestion.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 }),
    prisma.lqUserStat.count(),
    prisma.lqSubmission.count(),
    prisma.lqSubmission.count({ where: { verdict: "ACCEPTED" } }),
    prisma.lqSubmission.findMany({ where: { createdAt: { gte: since(1) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqSubmission.findMany({ where: { createdAt: { gte: since(7) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqSubmission.findMany({ where: { createdAt: { gte: since(30) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqSubmission.groupBy({ by: ["language"], _count: { _all: true }, orderBy: { _count: { language: "desc" } }, take: 5 }),
  ]);

  const rows: AdminRow[] = [
    ...challenges.map((c) => ({ id: c.id, kind: "challenge" as const, title: c.title, category: c.category, difficulty: c.difficulty, attempts: c.attemptCount, solved: c.solvedCount, status: c.status, access: c.access })),
    ...questions.map((q) => ({ id: q.id, kind: "question" as const, title: q.prompt.split("\n")[0].slice(0, 80), category: q.category, difficulty: q.difficulty, attempts: q.attemptCount, solved: q.solvedCount, status: q.status, access: q.access })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LogiQuest</h1>
        <p className="mt-1 text-sm text-muted">Publish, unpublish, archive and price practice content. A challenge can be published only when it has 3 public examples, hidden tests, 3 hints and an official solution.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Learners" value={learners} />
        <StatTile label="Submissions" value={subs} hint={subs ? `${Math.round((accepted / subs) * 100)}% accepted` : undefined} />
        <StatTile label="Active learners" value={`${dau.length} / ${wau.length} / ${mau.length}`} hint="Today / 7 days / 30 days" />
        <StatTile label="Top languages" value={byLang[0]?.language ?? "—"} hint={byLang.map((l) => `${l.language} ${l._count._all}`).join(" · ") || undefined} />
      </div>
      <LogiQuestManager rows={rows} />
      <p className="text-xs text-muted">Creating and editing challenge content (statement, test cases, solutions) is currently done with the seed content files; a form-based editor is the next admin milestone.</p>
    </div>
  );
}
