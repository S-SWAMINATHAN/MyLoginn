import Link from "next/link";
import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle, SubjectSidebar } from "@/components/logiquest/ui";
import { TopicGrid } from "@/components/logiquest/TopicGrid";
import { GROUP_BY_SLUG, getSubjectMeta } from "@/lib/logiquest/catalog";
import { topicCounts } from "@/lib/logiquest/bank";
import { topicProgress } from "@/lib/logiquest/progress";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props) {
  const s = getSubjectMeta((await params).subject);
  if (!s) return { title: "LogiQuest" };
  return { title: `${s.heading} · LogiQuest`, description: `${s.desc} Topics: ${s.topics.map((t) => t.title).join(", ")}.` };
}

export default async function SubjectPage({ params }: Props) {
  const { subject } = await params;
  const s = getSubjectMeta(subject);
  if (!s) notFound();
  const user = await getCurrentUser();
  const [counts, progress] = await Promise.all([topicCounts(subject), user ? topicProgress(user.id, subject) : ({} as Awaited<ReturnType<typeof topicProgress>>)]);
  const group = GROUP_BY_SLUG.get(s.group);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <Container className="max-w-7xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: group?.title ?? "" }, { label: s.title }]} />
      <PageTitle title={s.heading} sub={s.desc}>
        {s.kind === "mcq" ? (
          <Link href={`/logiquest/online-test/${s.slug}`} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"><Timer className="h-4 w-4" />Take {s.short} Test</Link>
        ) : null}
      </PageTitle>
      <p className="mt-2 text-xs text-muted">{s.topics.length} topics · {total.toLocaleString("en-IN")} questions with answers and explanations</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <TopicGrid
          subject={s.slug}
          topics={s.topics.map((t) => ({ slug: t.slug, title: t.title, count: counts[t.slug] ?? 0, answered: progress[`${s.slug}/${t.slug}`]?.answered, correct: progress[`${s.slug}/${t.slug}`]?.correct }))}
          extra={s.slug === "puzzles" ? [{ href: "/logiquest/sudoku", title: "Sudoku", note: "Interactive" }] : undefined}
        />
        <div className="hidden lg:block"><SubjectSidebar current={s.slug} /></div>
      </div>
    </Container>
  );
}
