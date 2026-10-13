import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PillTicker } from "@/components/ui/PillTicker";
import { DifficultyBadge, EmptyState } from "@/components/logiquest/ui";
import { ActivityHeatmap, BoardList, CategoryGrid, LogiQuestHeroVisual, StatCard } from "@/components/logiquest/LogiQuestVisuals";
import { LQ_CATEGORIES } from "@/lib/logiquest/constants";
import { dayKey } from "@/lib/logiquest/progress";
import { getDailyChallenge, getRecommendations, getUserOverview } from "@/lib/logiquest/queries";
import { getLogiQuestLeaderboard } from "@/lib/logiquest/leaderboard";

export const metadata = {
  title: "LogiQuest — Practice Coding, Logic & IT Skills",
  description: "Practice real-world coding problems in a built-in IDE, earn XP, build a streak and climb the LogiQuest leaderboard.",
};

const rowCls = "group flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]";

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <span className="story-eyebrow">{eyebrow}</span>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-story-navy sm:text-2xl dark:text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default async function LogiQuestHome() {
  const user = await getCurrentUser();
  const [daily, board, overview, recs] = await Promise.all([
    getDailyChallenge(),
    getLogiQuestLeaderboard(user?.id ?? null, "week", 5),
    user ? getUserOverview(user.id) : null,
    user ? getRecommendations(user.id) : null,
  ]);

  const weeks = 17;
  const end = new Date();
  const start = new Date(end.getTime() - (weeks * 7 - 1) * 24 * 3600_000);
  const cells = overview
    ? Array.from({ length: weeks * 7 }, (_, i) => {
        const key = dayKey(new Date(start.getTime() + i * 24 * 3600_000));
        return { key, n: overview.activity[key] ?? 0 };
      })
    : [];

  return (
    <>
      <Section className="overflow-hidden pb-6 pt-6 sm:pt-10">
        <Container>
          <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <Reveal><span className="story-eyebrow">LogiQuest</span></Reveal>
              <SplitHeadline as="h1" text="Master the skills. Solve real problems." className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
              <Reveal direction="up" delay={0.15}>
                <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">Practice real-world problems in a built-in IDE, earn XP for every first solve, keep a daily streak and see where you stand.</p>
              </Reveal>
              <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center gap-3">
                <ArrowLink href="/logiquest/coding">Start practicing</ArrowLink>
                {daily && <Link href={`/logiquest/challenges/${daily.slug}`} className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">Daily challenge</Link>}
              </Reveal>
              <Reveal direction="up" delay={0.35} className="mt-8"><PillTicker items={["Think", "Code", "Solve", "Communicate", "Grow"]} /></Reveal>
            </div>
            <Reveal direction="left" delay={0.15} className="min-w-0 px-3 pb-4"><LogiQuestHeroVisual /></Reveal>
          </div>
        </Container>
      </Section>

      <Section className="py-8 sm:py-10">
        <Container className="max-w-6xl space-y-14">
          {overview ? (
            <div>
              <SectionTitle eyebrow="Your progress" title="Keep the momentum going" />
              <RevealGroup className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                <RevealItem><StatCard label="XP earned" value={overview.xp} icon="xp" color="#2563eb" /></RevealItem>
                <RevealItem><StatCard label="Solved" value={overview.solved} icon="solved" color="#059669" /></RevealItem>
                <RevealItem><StatCard label="Accuracy" value={overview.accuracy ?? 0} text={overview.accuracy === null ? "—" : `${overview.accuracy}%`} hint={`${overview.submissions} submissions`} icon="accuracy" color="#7c3aed" /></RevealItem>
                <RevealItem><StatCard label="Day streak" value={overview.streak} hint={`Longest ${overview.longestStreak} days`} icon="streak" color="#ea580c" /></RevealItem>
              </RevealGroup>
              <ActivityHeatmap cells={cells} weeks={weeks} />
            </div>
          ) : (
            <Reveal className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border-soft bg-story-mist p-5 text-sm">
              <span className="font-medium">Log in to track XP, streaks and submissions.</span>
              <Link href="/login?next=%2Flogiquest" className="rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Log in</Link>
            </Reveal>
          )}

          <div>
            <SectionTitle eyebrow="Choose your path" title="Practice categories" />
            <CategoryGrid items={LQ_CATEGORIES.map((c) => ({ id: c.id, slug: c.slug, label: c.label, desc: c.desc, live: c.live }))} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal>
              <SectionTitle eyebrow={dayKey()} title="Daily challenge" />
              {daily ? (
                <Link href={`/logiquest/challenges/${daily.slug}`} className="group block rounded-3xl bg-story-royal p-6 text-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><CalendarCheck className="h-5 w-5" /></span>
                    <DifficultyBadge difficulty={daily.difficulty} className="border-white/30 bg-white/15 text-white dark:border-white/30 dark:bg-white/15 dark:text-white" />
                  </div>
                  <p className="mt-5 text-xl font-bold">{daily.title}</p>
                  <p className="mt-1 text-sm text-white/80">{daily.topic} · {daily.estimatedMinutes} min · {daily.xp} XP</p>
                  <span className="mt-5 inline-block text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">Solve it now →</span>
                </Link>
              ) : <EmptyState title="No challenges published yet" body="Challenges appear here once an administrator publishes them." />}
            </Reveal>

            <Reveal delay={0.1}>
              <SectionTitle eyebrow="For you" title={overview?.inProgress.length ? "Continue practicing" : "Recommended for you"} />
              {overview?.inProgress.length ? (
                <div className="space-y-3">{overview.inProgress.map((p) => (
                  <Link key={p.challenge.id} href={`/logiquest/challenges/${p.challenge.slug}`} className={rowCls}>
                    <span><span className="font-semibold">{p.challenge.title}</span><span className="block text-xs text-muted">{p.attempts} attempt{p.attempts === 1 ? "" : "s"} · best {p.bestPassed} tests passed</span></span>
                    <DifficultyBadge difficulty={p.challenge.difficulty} />
                  </Link>))}</div>
              ) : recs?.length ? (
                <div className="space-y-3">{recs.map((r) => (
                  <Link key={r.id} href={`/logiquest/challenges/${r.slug}`} className={rowCls}>
                    <span><span className="font-semibold">{r.title}</span><span className="block text-xs text-muted">{r.reason} · {r.topic} · ~{r.estimatedMinutes} min</span></span>
                    <DifficultyBadge difficulty={r.difficulty} />
                  </Link>))}</div>
              ) : <EmptyState title="No challenges completed yet" body="Pick a challenge and write your first solution." cta={<Link href="/logiquest/coding" className="font-semibold text-story-royal">Start your first challenge</Link>} />}
            </Reveal>
          </div>

          <Reveal>
            <SectionTitle eyebrow="This week" title="Top learners" action={<Link href="/logiquest/leaderboard" className="text-sm font-semibold text-story-royal hover:underline">Full leaderboard →</Link>} />
            {board.top.length ? (
              <BoardList rows={board.top} />
            ) : <EmptyState title="Nobody has ranked this week" body="Solve a challenge to take the first spot." />}
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
