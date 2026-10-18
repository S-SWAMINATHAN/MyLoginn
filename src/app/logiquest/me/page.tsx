import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Timer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { ActivityHeatmap, StatCard } from "@/components/logiquest/LogiQuestVisuals";
import { Breadcrumbs, EmptyState, PageTitle } from "@/components/logiquest/ui";
import { SUBJECTS, SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
import { getQuestions, topicCounts } from "@/lib/logiquest/bank";
import { dayKey, topicProgress } from "@/lib/logiquest/progress";

export const metadata = { title: "My progress · LogiQuest", robots: { index: false } };

const DAY = 24 * 3600_000;
/** Start of the activity window (the request time is read here, not during render). */
function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY);
}

export default async function MyProgress() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Flogiquest%2Fme");

  const weeks = 17;
  const from = daysAgo(weeks * 7);
  const [stat, progress, saved, tests, recent] = await Promise.all([
    prisma.lqUserStat.findUnique({ where: { userId: user.id } }),
    topicProgress(user.id),
    prisma.lqSaved.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.lqTestAttempt.findMany({ where: { userId: user.id }, orderBy: { submittedAt: "desc" }, take: 10 }),
    prisma.lqAnswer.findMany({ where: { userId: user.id, createdAt: { gte: from } }, select: { createdAt: true } }),
  ]);
  const savedQs = await getQuestions(saved.map((s) => s.qid));

  const totals = Object.values(progress).reduce((a, p) => ({ answered: a.answered + p.answered, correct: a.correct + p.correct }), { answered: 0, correct: 0 });
  const bySubject = new Map<string, { answered: number; correct: number }>();
  for (const [k, v] of Object.entries(progress)) {
    const s = k.split("/")[0];
    const cur = bySubject.get(s) ?? { answered: 0, correct: 0 };
    bySubject.set(s, { answered: cur.answered + v.answered, correct: cur.correct + v.correct });
  }
  const subjects = SUBJECTS.filter((s) => bySubject.has(s.slug));
  const counts = Object.fromEntries(await Promise.all(subjects.map(async (s) => [s.slug, Object.values(await topicCounts(s.slug)).reduce((a, b) => a + b, 0)] as const)));

  const activity: Record<string, number> = {};
  for (const r of recent) activity[dayKey(r.createdAt)] = (activity[dayKey(r.createdAt)] ?? 0) + 1;
  const start = daysAgo(weeks * 7 - 1);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => { const key = dayKey(new Date(start.getTime() + i * DAY)); return { key, n: activity[key] ?? 0 }; });

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "My progress" }]} />
      <PageTitle title={`Hi ${user.name.split(/\s+/)[0]}, here is your progress`} />
      <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="XP earned" value={stat?.xp ?? 0} icon="xp" color="#2563eb" />
        <StatCard label="Questions answered" value={totals.answered} icon="solved" color="#059669" />
        <StatCard label="First-try accuracy" value={0} text={totals.answered ? `${Math.round((totals.correct / totals.answered) * 100)}%` : "—"} icon="accuracy" color="#7c3aed" />
        <StatCard label="Day streak" value={stat?.currentStreak ?? 0} hint={`Longest ${stat?.longestStreak ?? 0} days`} icon="streak" color="#ea580c" />
      </div>
      <ActivityHeatmap cells={cells} weeks={weeks} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Subjects</h2>
          {subjects.length ? (
            <ul className="space-y-2">
              {subjects.map((s) => {
                const p = bySubject.get(s.slug)!;
                const pct = Math.round((p.answered / Math.max(1, counts[s.slug])) * 100);
                return (
                  <li key={s.slug}>
                    <Link href={`/logiquest/${s.slug}`} className="block rounded-2xl border border-border-soft bg-surface p-4 transition-colors hover:border-story-royal/50">
                      <div className="flex items-center justify-between text-sm"><span className="font-semibold">{s.title}</span><span className="text-xs text-muted">{p.answered}/{counts[s.slug]} · {Math.round((p.correct / Math.max(1, p.answered)) * 100)}% correct</span></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-story-mist"><div className="h-full rounded-full bg-story-royal" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState title="Nothing answered yet" body="Pick any topic and answer a question to start tracking progress." cta={<Link href="/logiquest" className="font-semibold text-story-royal">Browse subjects</Link>} />}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Timer className="h-5 w-5 text-story-royal" />Test history</h2>
          {tests.length ? (
            <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
              {tests.map((t) => {
                const [s, tp] = t.test.split("/");
                const meta = SUBJECT_BY_SLUG.get(s);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span><span className="font-semibold">{meta?.title}{tp ? ` › ${meta?.topics.find((x) => x.slug === tp)?.title}` : ""}</span><span className="block text-xs text-muted">{t.submittedAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></span>
                    <span className="font-bold tabular-nums text-story-royal">{t.correct}/{t.total}</span>
                  </li>
                );
              })}
            </ul>
          ) : <EmptyState title="No tests yet" body="Timed tests show how ready you are." cta={<Link href="/logiquest/online-test" className="font-semibold text-story-royal">Take a test</Link>} />}

          <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-bold"><Bookmark className="h-5 w-5 text-story-royal" />Saved questions</h2>
          {saved.length ? (
            <ul className="space-y-2">
              {saved.map((s) => {
                const q = savedQs.get(s.qid);
                if (!q) return null;
                const meta = SUBJECT_BY_SLUG.get(q.subject);
                return (
                  <li key={s.id}>
                    <Link href={`/logiquest/q/${q.id}`} className="block rounded-2xl border border-border-soft bg-surface p-3 text-sm hover:border-story-royal/50">
                      <p className="line-clamp-2 font-medium">{q.q.replace(/```[a-z]*\n?/g, "")}</p>
                      <p className="mt-1 text-xs text-muted">{meta?.title} › {meta?.topics.find((x) => x.slug === q.topic)?.title}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <p className="rounded-2xl border border-dashed border-border-soft p-5 text-sm text-muted">Press “Save” on any question to keep it here for revision.</p>}
        </section>
      </div>
    </Container>
  );
}
