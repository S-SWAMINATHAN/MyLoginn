import Link from "next/link";
import { ArrowRight, BookOpenCheck, Timer, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Reveal } from "@/components/ui/Reveal";
import { BoardList, StatCard } from "@/components/logiquest/LogiQuestVisuals";
import { FolderIcon } from "@/components/logiquest/ui";
import { GROUPS, SUBJECT_BY_SLUG, subjectsInGroup } from "@/lib/logiquest/catalog";
import { subjectTotals } from "@/lib/logiquest/bank";
import { getLogiQuestLeaderboard } from "@/lib/logiquest/leaderboard";

export const metadata = {
  title: "LogiQuest — Aptitude, Reasoning, Programming & Interview Questions with Answers",
  description: "Practice aptitude, verbal ability, logical and verbal reasoning, programming, technical MCQs, interview questions and general knowledge with answers, explanations and timed online tests.",
};

export default async function LogiQuestHome() {
  const user = await getCurrentUser();
  const [totals, board, stat, answered] = await Promise.all([
    subjectTotals(),
    getLogiQuestLeaderboard(user?.id ?? null, "week", 5),
    user ? prisma.lqUserStat.findUnique({ where: { userId: user.id } }) : null,
    user ? prisma.lqAnswer.groupBy({ by: ["firstCorrect"], where: { userId: user.id }, _count: { _all: true } }) : [],
  ]);
  const totalQuestions = Object.values(totals).reduce((a, b) => a + b, 0);
  const done = answered.reduce((a, r) => a + r._count._all, 0);
  const right = answered.find((r) => r.firstCorrect)?._count._all ?? 0;

  return (
    <Container className="max-w-7xl py-8 sm:py-10">
      <section className="grid items-center gap-6 rounded-3xl bg-story-royal px-6 py-8 text-white sm:px-10 sm:py-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">LogiQuest</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Aptitude, Reasoning, Programming &amp; Interview Questions with Answers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            {totalQuestions.toLocaleString("en-IN")}+ questions across {GROUPS.length} sections, each with the answer, a worked explanation and a discussion. Learn the formulas, practise topic by topic, then take a timed online test.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/logiquest/arithmetic-aptitude" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-story-royal transition-transform hover:-translate-y-0.5">Start with Aptitude <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/logiquest/online-test" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"><Timer className="h-4 w-4" />Online Tests</Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Questions", totalQuestions.toLocaleString("en-IN")],
            ["Subjects", String(GROUPS.reduce((n, g) => n + subjectsInGroup(g.slug).length, 0))],
            ["Explained answers", "Every one"],
            ["Online tests", "Timed, scored"],
          ].map(([k, v]) => (
            <li key={k} className="rounded-2xl bg-white/10 p-4">
              <p className="text-xl font-bold">{v}</p>
              <p className="text-white/75">{k}</p>
            </li>
          ))}
        </ul>
      </section>

      {user && stat ? (
        <section className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          <StatCard label="XP earned" value={stat.xp} icon="xp" color="#2563eb" />
          <StatCard label="Questions answered" value={done} icon="solved" color="#059669" />
          <StatCard label="First-try accuracy" value={done ? Math.round((right / done) * 100) : 0} text={done ? `${Math.round((right / done) * 100)}%` : "—"} icon="accuracy" color="#7c3aed" />
          <StatCard label="Day streak" value={stat.currentStreak} hint={`Longest ${stat.longestStreak} days`} icon="streak" color="#ea580c" />
        </section>
      ) : !user ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-story-mist p-4 text-sm">
          <span>Everything is free to read. <strong>Log in</strong> to track progress, earn XP, bookmark questions and save test results.</span>
          <Link href="/login?next=%2Flogiquest" className="rounded-full bg-story-royal px-5 py-2 font-semibold text-white">Log in</Link>
        </div>
      ) : null}

      <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((g, gi) => (
          <Reveal key={g.slug} delay={Math.min(gi, 5) * 0.04}>
            <section aria-labelledby={`g-${g.slug}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center"><ContentIcon keyword={g.icon} className="h-full w-full" /></span>
                <div>
                  <h2 id={`g-${g.slug}`} className="text-lg font-bold text-story-navy dark:text-foreground">{g.title}</h2>
                  <p className="text-xs text-muted">{g.desc}</p>
                </div>
              </div>
              <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
                {subjectsInGroup(g.slug).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/logiquest/${s.slug}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-story-mist">
                      <FolderIcon />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold group-hover:text-story-royal">{s.title}</span>
                        <span className="block truncate text-xs text-muted">{s.topics.slice(0, 4).map((t) => t.title).join(" · ")}{s.topics.length > 4 ? " …" : ""}</span>
                      </span>
                      <span className="shrink-0 text-right text-[11px] leading-4 text-muted">{s.topics.length} topics<br />{(totals[s.slug] ?? 0).toLocaleString("en-IN")} Qs</span>
                    </Link>
                  </li>
                ))}
                {g.slug === "puzzles" ? (
                  <li>
                    <Link href="/logiquest/sudoku" className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-story-mist">
                      <FolderIcon />
                      <span className="flex-1 font-semibold group-hover:text-story-royal">Sudoku</span>
                      <span className="text-[11px] text-muted">Interactive</span>
                    </Link>
                  </li>
                ) : null}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border-soft bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Timer className="h-5 w-5 text-story-royal" />Online Tests</h2>
            <Link href="/logiquest/online-test" className="text-sm font-semibold text-story-royal hover:underline">All tests →</Link>
          </div>
          <p className="text-sm text-muted">20 random questions, 30 minutes, instant score and a full answer review.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["arithmetic-aptitude", "verbal-ability", "logical-reasoning", "verbal-reasoning", "c-programming", "java-programming", "python-programming", "database", "networking", "general-knowledge"].map((slug) => (
              <Link key={slug} href={`/logiquest/online-test/${slug}`} className="rounded-full bg-story-mist px-3.5 py-1.5 text-sm font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white">
                {SUBJECT_BY_SLUG.get(slug)?.title}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-amber-500" />Top learners this week</h2>
            <Link href="/logiquest/leaderboard" className="text-sm font-semibold text-story-royal hover:underline">Leaderboard →</Link>
          </div>
          {board.top.length ? <BoardList rows={board.top} /> : (
            <p className="flex items-center gap-2 rounded-2xl border border-dashed border-border-soft p-6 text-sm text-muted"><BookOpenCheck className="h-5 w-5" />Answer a question correctly to take the first spot.</p>
          )}
        </section>
      </div>
    </Container>
  );
}
