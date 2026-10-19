import Link from "next/link";
import { BookOpenCheck, Timer, Trophy } from "lucide-react";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedBulb } from "@/components/ui/icons/AnimatedBulb";
import { AnimatedLayers } from "@/components/ui/icons/AnimatedLayers";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { BoardList, StatCard } from "@/components/logiquest/LogiQuestVisuals";
import { QuizPreview, SubjectExplorer, TestsPanel } from "@/components/logiquest/HomeSections";
import { GROUP_COLOR } from "@/components/logiquest/subjectStyle";
import { GROUPS, SUBJECT_BY_SLUG, subjectsInGroup } from "@/lib/logiquest/catalog";
import { subjectTotals } from "@/lib/logiquest/bank";
import { getLogiQuestLeaderboard } from "@/lib/logiquest/leaderboard";

export const metadata = {
  title: "LogiQuest — Aptitude, Reasoning, Programming & Interview Questions with Answers",
  description: "Practice aptitude, verbal ability, logical and verbal reasoning, programming, technical MCQs, interview questions and general knowledge with answers, explanations and timed online tests.",
};

const QUICK = [
  { href: "/logiquest/online-test", label: "Online tests", note: "20 questions, 30 minutes", Icon: AnimatedClock, color: "#2563eb" },
  { href: "/logiquest/leaderboard", label: "Leaderboard", note: "See who is on top", Icon: AnimatedCrown, color: "#d97706" },
  { href: "/logiquest/sudoku", label: "Sudoku", note: "Play in your browser", Icon: AnimatedBulb, color: "#059669" },
  { href: "/logiquest/me", label: "My progress", note: "XP, streak and history", Icon: AnimatedUser, color: "#7c3aed" },
];

export default async function LogiQuestHome() {
  const user = await getCurrentUser();
  const [totals, board, stat, answered] = await Promise.all([
    subjectTotals(),
    getLogiQuestLeaderboard(user?.id ?? null, "week", 5),
    user ? prisma.lqUserStat.findUnique({ where: { userId: user.id } }) : null,
    user ? prisma.lqAnswer.groupBy({ by: ["firstCorrect"], where: { userId: user.id }, _count: { _all: true } }) : [],
  ]);
  const totalQuestions = Object.values(totals).reduce((a, b) => a + b, 0);
  const subjectCount = GROUPS.reduce((n, g) => n + subjectsInGroup(g.slug).length, 0);
  const done = answered.reduce((a, r) => a + r._count._all, 0);
  const right = answered.find((r) => r.firstCorrect)?._count._all ?? 0;

  const explorerGroups = GROUPS.map((g) => ({
    slug: g.slug,
    title: g.title,
    nav: g.nav,
    desc: g.desc,
    icon: g.icon,
    subjects: subjectsInGroup(g.slug).map((s) => ({ slug: s.slug, title: s.title, desc: s.desc, topics: s.topics.map((t) => ({ slug: t.slug, title: t.title })), questions: totals[s.slug] ?? 0, kind: s.kind })),
  }));

  return (
    <Container className="max-w-7xl py-6 sm:py-10">
      <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <SplitHeadline as="h1" text="Aptitude, Reasoning, Programming & Interview Questions with Answers" className="text-3xl font-bold leading-[1.1] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
              {totalQuestions.toLocaleString("en-IN")}+ questions across {GROUPS.length} sections and {subjectCount} subjects, each with the answer, a worked explanation and a discussion. Learn the formulas, practise topic by topic, then take a timed online test.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ArrowLink href="/logiquest/arithmetic-aptitude" className="w-full justify-between sm:w-auto sm:justify-start">Start with Aptitude</ArrowLink>
            <Link href="/logiquest/online-test" className="btn-sweep inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-soft bg-surface px-6 text-sm font-semibold active:scale-95 sm:h-auto sm:w-auto sm:py-2.5"><Timer className="h-4 w-4" />Online tests</Link>
          </Reveal>
          <Reveal direction="up" delay={0.35}>
            <dl className="mt-8 grid w-full grid-cols-3 gap-3 text-center">
              {[
                { v: <>{totalQuestions.toLocaleString("en-IN")}</>, k: "Questions", Icon: AnimatedBook },
                { v: <>{subjectCount}</>, k: "Subjects", Icon: AnimatedLayers },
                { v: <><span className="sm:hidden">100%</span><span className="hidden sm:inline">Every one</span></>, k: "Explained", Icon: AnimatedBulb },
              ].map(({ v, k, Icon }) => (
                <div key={k} className="flex flex-col items-center justify-center rounded-2xl border border-border-soft bg-surface px-2 py-3 sm:h-16 sm:px-3">
                  <Icon className="mb-1 h-6 w-6 sm:hidden" />
                  <dt className="sr-only">{k}</dt>
                  <dd className="whitespace-nowrap text-lg font-bold tabular-nums leading-tight text-story-navy dark:text-foreground">{v}</dd>
                  <p className="text-[11px] font-semibold text-muted" aria-hidden>{k}</p>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0"><QuizPreview /></Reveal>
      </section>

      {user && stat ? (
        <RevealGroup className="mt-10 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
          <RevealItem><StatCard label="XP earned" value={stat.xp} icon="xp" color="#2563eb" /></RevealItem>
          <RevealItem><StatCard label="Questions answered" value={done} icon="solved" color="#059669" /></RevealItem>
          <RevealItem><StatCard label="First-try accuracy" value={done ? Math.round((right / done) * 100) : 0} text={done ? `${Math.round((right / done) * 100)}%` : "—"} icon="accuracy" color="#7c3aed" /></RevealItem>
          <RevealItem><StatCard label="Day streak" value={stat.currentStreak} hint={`Longest ${stat.longestStreak} days`} icon="streak" color="#ea580c" /></RevealItem>
        </RevealGroup>
      ) : !user ? (
        <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border-soft bg-story-mist p-4 text-sm sm:p-5">
          <span>Everything is free to read. <strong>Log in</strong> to track progress, earn XP, bookmark questions and save test results.</span>
          <Link href="/login?next=%2Flogiquest" className="rounded-full bg-story-royal px-6 py-2 font-semibold text-white">Log in</Link>
        </Reveal>
      ) : null}

      <section className="mt-12" aria-labelledby="explore">
        <Reveal><h2 id="explore" className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Choose what to practise</h2></Reveal>
        <Reveal delay={0.08}><p className="mt-1.5 text-sm text-muted">Pick a section, or search for any subject or topic.</p></Reveal>
        <div className="mt-5"><SubjectExplorer groups={explorerGroups} /></div>
      </section>

      <RevealGroup className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4" stagger={0.07}>
        {QUICK.map(({ href, label, note, Icon, color }) => (
          <RevealItem key={href}>
            <Link href={href} className="group flex h-full items-center gap-3 rounded-3xl border border-border-soft bg-surface p-4 transition-colors duration-300 hover:border-story-royal/40">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}><Icon className="h-7 w-7" /></span>
              <span className="min-w-0"><span className="block text-sm font-bold text-story-navy group-hover:text-story-royal dark:text-foreground">{label}</span><span className="block truncate text-[11px] text-muted">{note}</span></span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal className="min-w-0">
          <TestsPanel
            tests={["arithmetic-aptitude", "verbal-ability", "logical-reasoning", "verbal-reasoning", "c-programming", "java-programming", "python-programming", "database", "networking", "general-knowledge"].map((slug) => {
              const m = SUBJECT_BY_SLUG.get(slug);
              return { slug, title: m?.short ?? m?.title ?? slug, color: GROUP_COLOR[m?.group ?? ""] ?? "#2563eb" };
            })}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-amber-500" />Top learners this week</h2>
              <Link href="/logiquest/leaderboard" className="text-sm font-semibold text-story-royal hover:underline">Leaderboard →</Link>
            </div>
            {board.top.length ? <BoardList rows={board.top} /> : (
              <p className="flex items-center gap-2 rounded-3xl border border-dashed border-border-soft p-6 text-sm text-muted"><BookOpenCheck className="h-5 w-5" />Answer a question correctly to take the first spot.</p>
            )}
          </section>
        </Reveal>
      </div>
    </Container>
  );
}
