import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PageTitle, StatChips, SubjectSidebar } from "@/components/logiquest/ui";
import { TopicGrid } from "@/components/logiquest/TopicGrid";
import { GROUP_BY_SLUG, getSubjectMeta } from "@/lib/logiquest/catalog";
import { GROUP_COLOR } from "@/components/logiquest/subjectStyle";
import { topicCounts } from "@/lib/logiquest/bank";
import { topicProgress } from "@/lib/logiquest/progress";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props) {
  const slug = (await params).subject;
  const s = getSubjectMeta(slug);
  if (!s) return { title: "LogiQuest" };
  const full = `${s.desc} Topics: ${s.topics.map((t) => t.title).join(", ")}.`;
  return createPageMetadata({
    title: `${s.heading} | LogiQuest`,
    absoluteTitle: true,
    description: full,
    path: `/logiquest/${slug}`,
    keywords: [`${s.title} questions and answers`, `${s.title} MCQ`, `${s.title} practice`],
  });
}

export default async function SubjectPage({ params }: Props) {
  const { subject } = await params;
  const s = getSubjectMeta(subject);
  if (!s) notFound();
  const user = await getCurrentUser();
  const [counts, progress] = await Promise.all([topicCounts(subject), user ? topicProgress(user.id, subject) : ({} as Awaited<ReturnType<typeof topicProgress>>)]);
  const group = GROUP_BY_SLUG.get(s.group);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const answered = s.topics.reduce((n, t) => n + (progress[`${s.slug}/${t.slug}`]?.answered ?? 0), 0);

  return (
    <Container className="max-w-7xl py-6 sm:py-8">
      <PageTitle title={s.heading} sub={s.desc} icon={group?.icon}>
        {s.kind === "mcq" ? <ArrowLink href={`/logiquest/online-test/${s.slug}`}><Timer className="mr-1 inline h-4 w-4" />Take {s.short} Test</ArrowLink> : null}
      </PageTitle>
      <StatChips
        items={[
          { label: "topics", value: String(s.topics.length) },
          { label: s.kind === "qa" ? "answers" : "questions", value: total.toLocaleString("en-IN") },
          ...(user ? [{ label: "answered by you", value: answered.toLocaleString("en-IN") }] : []),
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <TopicGrid
          subject={s.slug}
          color={GROUP_COLOR[s.group]}
          showTest={s.kind === "mcq"}
          topics={s.topics.map((t) => ({ slug: t.slug, title: t.title, count: counts[t.slug] ?? 0, answered: progress[`${s.slug}/${t.slug}`]?.answered, correct: progress[`${s.slug}/${t.slug}`]?.correct }))}
          extra={s.slug === "puzzles" ? [{ href: "/logiquest/sudoku", title: "Sudoku", note: "Interactive" }] : undefined}
        />
        <div className="hidden lg:block"><SubjectSidebar current={s.slug} /></div>
      </div>
    </Container>
  );
}
