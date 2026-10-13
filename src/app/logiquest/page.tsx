import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { DifficultyBadge, EmptyState, StatTile } from "@/components/logiquest/ui";
import { LQ_CATEGORIES } from "@/lib/logiquest/constants";
import { dayKey } from "@/lib/logiquest/progress";
import { getDailyChallenge, getRecommendations, getUserOverview } from "@/lib/logiquest/queries";
import { getLogiQuestLeaderboard } from "@/lib/logiquest/leaderboard";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "LogiQuest — Practice Coding, Logic & IT Skills",
  description: "Practice real-world coding problems in a built-in IDE, earn XP, build a streak and climb the LogiQuest leaderboard.",
};

export default async function LogiQuestHome() {
  const user = await getCurrentUser();
  const [daily, board, overview, recs] = await Promise.all([
    getDailyChallenge(),
    getLogiQuestLeaderboard(user?.id ?? null, "week", 5),
    user ? getUserOverview(user.id) : null,
    user ? getRecommendations(user.id) : null,
  ]);

  return (
    <>
      <Section className="pb-8 pt-10 sm:pt-16">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">LogiQuest</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">Master the skills. Solve real problems. Build your future.</h1>
          <p className="mt-3 text-lg font-medium brand-gradient-text">Think. Code. Solve. Communicate. Grow.</p>
          <p className="mt-3 max-w-2xl text-muted">Practice real-world problems in a built-in IDE, earn XP for every first solve, keep a daily streak and see where you stand.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/logiquest/coding" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700">Start practicing <ArrowRight className="h-4 w-4" /></Link>
            {daily ? <Link href={`/logiquest/challenges/${daily.slug}`} className="rounded-xl border border-border-soft bg-surface px-5 py-3 font-semibold hover:bg-surface-2">Daily challenge</Link> : null}
          </div>
        </Container>
      </Section>

      <Section className="py-6">
        <Container className="space-y-10">
          {overview ? (
            <div>
              <h2 className="mb-3 text-lg font-bold">Your progress</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile label="XP" value={overview.xp.toLocaleString("en-IN")} />
                <StatTile label="Solved" value={overview.solved} />
                <StatTile label="Accuracy" value={overview.accuracy === null ? "—" : `${overview.accuracy}%`} hint={`${overview.submissions} submissions`} />
                <StatTile label="Streak" value={overview.streak ? `🔥 ${overview.streak}` : "0"} hint={`Longest ${overview.longestStreak} days`} />
              </div>
              <Heatmap activity={overview.activity} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border-soft bg-surface p-5 text-sm"><Link href="/login?next=%2Flogiquest" className="font-semibold text-brand-600">Log in</Link> to track XP, streaks and submissions.</div>
          )}

          <div>
            <h2 className="mb-3 text-lg font-bold">Categories</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LQ_CATEGORIES.map((c) => {
                const body = (<><p className="font-semibold">{c.label}</p><p className="mt-1 text-sm text-muted">{c.desc}</p>{!c.live ? <p className="mt-3 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">In development</p> : <p className="mt-3 text-sm font-semibold text-brand-600">Practice now →</p>}</>);
                return c.live
                  ? <Link key={c.id} href={`/logiquest/${c.slug}`} className="rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-brand-300">{body}</Link>
                  : <div key={c.id} aria-disabled className="rounded-2xl border border-border-soft bg-surface p-5 opacity-70">{body}</div>;
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-lg font-bold">Daily challenge <span className="text-xs font-normal text-muted">· {dayKey()}</span></h2>
              {daily ? (
                <Link href={`/logiquest/challenges/${daily.slug}`} className="block rounded-2xl border border-brand-200 bg-brand-50/60 p-5 transition hover:border-brand-400 dark:bg-brand-900/10">
                  <div className="flex items-center gap-2"><DifficultyBadge difficulty={daily.difficulty} /><span className="text-xs text-muted">{daily.topic} · {daily.estimatedMinutes} min · {daily.xp} XP</span></div>
                  <p className="mt-2 text-lg font-semibold">{daily.title}</p>
                </Link>
              ) : <EmptyState title="No challenges published yet" body="Challenges appear here once an administrator publishes them." />}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold">{overview?.inProgress.length ? "Continue practicing" : "Recommended for you"}</h2>
              {overview?.inProgress.length ? (
                <div className="space-y-2">{overview.inProgress.map((p) => (
                  <Link key={p.challenge.id} href={`/logiquest/challenges/${p.challenge.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface p-4 hover:border-brand-300">
                    <span><span className="font-semibold">{p.challenge.title}</span><span className="block text-xs text-muted">{p.attempts} attempt{p.attempts === 1 ? "" : "s"} · best {p.bestPassed} tests passed</span></span>
                    <DifficultyBadge difficulty={p.challenge.difficulty} />
                  </Link>))}</div>
              ) : recs?.length ? (
                <div className="space-y-2">{recs.map((r) => (
                  <Link key={r.id} href={`/logiquest/challenges/${r.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface p-4 hover:border-brand-300">
                    <span><span className="font-semibold">{r.title}</span><span className="block text-xs text-muted">{r.reason} · {r.topic} · ~{r.estimatedMinutes} min</span></span>
                    <DifficultyBadge difficulty={r.difficulty} />
                  </Link>))}</div>
              ) : <EmptyState title="No challenges completed yet" body="Pick a challenge and write your first solution." cta={<Link href="/logiquest/coding" className="font-semibold text-brand-600">Start your first challenge</Link>} />}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Top learners this week</h2><Link href="/logiquest/leaderboard" className="text-sm font-semibold text-brand-600">Full leaderboard</Link></div>
            {board.top.length ? (
              <ol className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-surface">
                {board.top.map((e) => (
                  <li key={e.userId} className={cn("flex items-center gap-4 px-4 py-3", e.isYou && "bg-brand-50/60 dark:bg-brand-900/10")}>
                    <span className="w-6 font-bold tabular-nums">{e.rank}</span>
                    <span className="flex-1 truncate font-semibold">{e.name}</span>
                    {e.streak > 0 ? <span className="inline-flex items-center gap-1 text-xs text-muted"><Flame className="h-3.5 w-3.5 text-orange-500" />{e.streak}</span> : null}
                    <span className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-200">{e.score} pts</span>
                  </li>))}
              </ol>
            ) : <EmptyState title="Nobody has ranked this week" body="Solve a challenge to take the first spot." />}
          </div>
        </Container>
      </Section>
    </>
  );
}

/** GitHub-style activity grid for the last 17 weeks, from real submissions. */
function Heatmap({ activity }: { activity: Record<string, number> }) {
  const weeks = 17;
  const end = new Date();
  const start = new Date(end.getTime() - (weeks * 7 - 1) * 24 * 3600_000);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const key = dayKey(new Date(start.getTime() + i * 24 * 3600_000));
    return { key, n: activity[key] ?? 0 };
  });
  const shade = (n: number) => (n === 0 ? "bg-surface-2" : n < 3 ? "bg-brand-200" : n < 6 ? "bg-brand-400" : "bg-brand-600");
  return (
    <div className="mt-4 rounded-2xl border border-border-soft bg-surface p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Activity · last {weeks} weeks</p>
      <div className="overflow-x-auto">
        <div role="img" aria-label="Submission activity heatmap" className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {cells.map((c) => <span key={c.key} title={`${c.key}: ${c.n} submission${c.n === 1 ? "" : "s"}`} className={cn("h-3 w-3 rounded-sm", shade(c.n))} />)}
        </div>
      </div>
    </div>
  );
}
