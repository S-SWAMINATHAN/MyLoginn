import Link from "next/link";
import { ArrowUpRight, Clock, History, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PageTitle, StatChips } from "@/components/logiquest/ui";
import { GROUP_BY_SLUG, SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
import { TEST_MINUTES, TEST_SIZE } from "@/lib/logiquest/constants";
import { TEST_GROUPS, testableSubjects } from "@/lib/logiquest/tests";
import { cn } from "@/lib/cn";

export const metadata = { title: "Online Tests - Aptitude, Reasoning, Programming & Technical · LogiQuest", description: "Free timed online tests with instant score and explained answers." };

const testName = (test: string) => {
  const [s, t] = test.split("/");
  const meta = SUBJECT_BY_SLUG.get(s);
  return `${meta?.title ?? s}${t ? ` › ${meta?.topics.find((x) => x.slug === t)?.title ?? t}` : ""}`;
};

export default async function OnlineTests({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  const active = TEST_GROUPS.find((g) => g.id === group)?.id ?? "all";
  const user = await getCurrentUser();
  const history = user ? await prisma.lqTestAttempt.findMany({ where: { userId: user.id }, orderBy: { submittedAt: "desc" }, take: 8 }) : [];
  const subjects = testableSubjects();

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <PageTitle title="Online Tests" icon="testing" sub="Timed tests of random questions. Submit to see your score, the correct answers and a full explanation for every question. Every topic page also has its own topic test." />
      <StatChips items={[{ label: "subjects", value: String(subjects.length) }, { label: "questions per test", value: `up to ${TEST_SIZE}` }, { label: "minutes", value: String(TEST_MINUTES) }]} />

      <nav aria-label="Test categories" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
        {[{ id: "all", title: "All Topics" }, ...TEST_GROUPS].map((g) => (
          <Link key={g.id} href={g.id === "all" ? "/logiquest/online-test" : `/logiquest/online-test?group=${g.id}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors", active === g.id ? "bg-story-royal text-white" : "text-muted hover:text-story-royal")}>{g.title}</Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_19rem]">
        <div className="space-y-9">
          {TEST_GROUPS.filter((g) => active === "all" || g.id === active).map((g) => (
            <section key={g.id}>
              <Reveal><h2 className="mb-3 text-lg font-bold text-story-navy dark:text-foreground">{g.title}</h2></Reveal>
              <RevealGroup className="grid gap-3 sm:grid-cols-2" stagger={0.05}>
                {subjects.filter((s) => g.groups.includes(s.group)).map((s) => (
                  <RevealItem key={s.slug}>
                    <Link href={`/logiquest/online-test/${s.slug}`} className="group flex h-full items-center gap-3.5 rounded-3xl border border-border-soft bg-surface p-4 transition-colors duration-300 hover:border-story-royal/40">
                      <span className="grid h-12 w-12 shrink-0 place-items-center"><ContentIcon keyword={GROUP_BY_SLUG.get(s.group)?.icon ?? "testing"} className="h-full w-full" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-story-navy transition-colors group-hover:text-story-royal dark:text-foreground">{s.short} Test</span>
                        <span className="mt-0.5 flex items-center gap-3 text-xs text-muted"><span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" />{TEST_SIZE} Qs</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{TEST_MINUTES} min</span></span>
                      </span>
                      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-colors duration-300 group-hover:bg-story-royal group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
                    </Link>
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          ))}
        </div>

        <aside className="h-max rounded-3xl border border-border-soft bg-surface p-5 lg:sticky lg:top-32">
          <h2 className="flex items-center gap-2 font-bold"><History className="h-4 w-4 text-story-royal" />Your recent tests</h2>
          {user ? (
            history.length ? (
              <ul className="mt-3 divide-y divide-border-soft text-sm">
                {history.map((h) => {
                  const pct = Math.round((h.correct / Math.max(1, h.total)) * 100);
                  return (
                    <li key={h.id} className="flex items-center gap-3 py-2.5">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums", pct >= 70 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : pct >= 40 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300")}>{pct}%</span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{testName(h.test)}</span>
                        <span className="block text-xs text-muted">{h.correct}/{h.total} correct · {h.submittedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">No tests taken yet. Pick one to begin.</p>
          ) : <p className="mt-2 text-sm text-muted"><Link href="/login?next=%2Flogiquest%2Fonline-test" className="font-semibold text-story-royal">Log in</Link> to keep a history of your scores.</p>}
        </aside>
      </div>
    </Container>
  );
}
