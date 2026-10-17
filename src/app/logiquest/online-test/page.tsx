import Link from "next/link";
import { Timer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
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
      <Breadcrumbs items={[{ label: "Online Tests" }]} />
      <PageTitle title="Online Tests" sub="Timed tests of 20 random questions. Submit to see your score, the correct answers and a full explanation for every question. Every topic page also has its own topic test." />

      <nav aria-label="Test categories" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {[{ id: "all", title: "All Topics" }, ...TEST_GROUPS].map((g) => (
          <Link key={g.id} href={g.id === "all" ? "/logiquest/online-test" : `/logiquest/online-test?group=${g.id}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", active === g.id ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal")}>{g.title}</Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-8">
          {TEST_GROUPS.filter((g) => active === "all" || g.id === active).map((g) => (
            <section key={g.id}>
              <h2 className="mb-3 text-lg font-bold">{g.title}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {subjects.filter((s) => g.groups.includes(s.group)).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/logiquest/online-test/${s.slug}`} className="group flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-story-royal/50 hover:shadow-[var(--shadow-soft)]">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-story-royal/10 text-story-royal"><Timer className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold group-hover:text-story-royal">{s.short} Test</span>
                        <span className="block text-xs text-muted">20 questions · 30 minutes · {s.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="h-max rounded-2xl border border-border-soft bg-surface p-4">
          <h2 className="font-bold">Your recent tests</h2>
          {user ? (
            history.length ? (
              <ul className="mt-3 divide-y divide-border-soft text-sm">
                {history.map((h) => (
                  <li key={h.id} className="py-2">
                    <p className="font-semibold">{testName(h.test)}</p>
                    <p className="text-xs text-muted">{h.correct}/{h.total} · {Math.round((h.correct / Math.max(1, h.total)) * 100)}% · {h.submittedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-muted">No tests taken yet.</p>
          ) : <p className="mt-2 text-sm text-muted"><Link href="/login?next=%2Flogiquest%2Fonline-test" className="font-semibold text-story-royal">Log in</Link> to keep a history of your scores.</p>}
        </aside>
      </div>
    </Container>
  );
}
