import { prisma } from "@/lib/prisma";
import { LogiQuestManager } from "@/components/admin/LogiQuestManager";
import { StatTile } from "@/components/logiquest/ui";
import { SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
import { getQuestions, subjectTotals } from "@/lib/logiquest/bank";

export const metadata = { title: "LogiQuest — MyLoginn Admin" };

const since = (days: number) => new Date(Date.now() - days * 24 * 3600_000);
const date = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminLogiQuest() {
  const [totals, learners, answers, tests, dau, wau, mau, reports, hidden, comments, openReports] = await Promise.all([
    subjectTotals(),
    prisma.lqUserStat.count(),
    prisma.lqAnswer.count(),
    prisma.lqTestAttempt.count(),
    prisma.lqAnswer.findMany({ where: { updatedAt: { gte: since(1) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqAnswer.findMany({ where: { updatedAt: { gte: since(7) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqAnswer.findMany({ where: { updatedAt: { gte: since(30) } }, distinct: ["userId"], select: { userId: true } }),
    prisma.lqReport.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100, include: { user: { select: { name: true, email: true } } } }),
    prisma.lqHidden.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lqComment.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    prisma.lqReport.count({ where: { status: "OPEN" } }),
  ]);
  const qs = await getQuestions([...reports.map((r) => r.qid), ...hidden.map((h) => h.qid)]);
  const hiddenSet = new Set(hidden.map((h) => h.qid));
  const label = (qid: string) => {
    const q = qs.get(qid);
    return q ? q.q.replace(/```[a-z]*\n?/g, "").replace(/\s+/g, " ").slice(0, 120) : "(question no longer exists)";
  };
  const where = (qid: string) => {
    const [s, t] = qid.split(".");
    const meta = SUBJECT_BY_SLUG.get(s);
    return `${meta?.title ?? s} › ${meta?.topics.find((x) => x.slug === t)?.title ?? t}`;
  };
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LogiQuest</h1>
        <p className="mt-1 text-sm text-muted">Questions are authored in code (<code>src/lib/logiquest/content</code>) and checked with <code>npm run lq:validate</code>. Use this page to act on learner reports, hide a faulty question immediately, and moderate discussions.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Questions" value={total.toLocaleString("en-IN")} hint={`${Object.keys(totals).length} subjects · ${hidden.length} hidden`} />
        <StatTile label="Learners" value={learners} hint={`${answers.toLocaleString("en-IN")} answers · ${tests} tests`} />
        <StatTile label="Active learners" value={`${dau.length} / ${wau.length} / ${mau.length}`} hint="Today / 7 days / 30 days" />
        <StatTile label="Open reports" value={openReports} />
      </div>
      <LogiQuestManager
        reports={reports.map((r) => ({ id: r.id, qid: r.qid, question: label(r.qid), where: where(r.qid), reason: r.reason, details: r.details, status: r.status, by: r.user ? `${r.user.name} (${r.user.email})` : "Anonymous", createdAt: date(r.createdAt), hidden: hiddenSet.has(r.qid) }))}
        hidden={hidden.map((h) => ({ qid: h.qid, question: label(h.qid), where: where(h.qid), note: h.note }))}
        comments={comments.map((c) => ({ id: c.id, qid: c.qid, body: c.body.slice(0, 300), by: c.user.name, hidden: c.hidden, createdAt: date(c.createdAt) }))}
      />
    </div>
  );
}
