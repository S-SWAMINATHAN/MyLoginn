import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, EmptyState, PageTitle, Pagination } from "@/components/logiquest/ui";
import { QuestionCard, type CardState } from "@/components/logiquest/QuestionCard";
import { TopicTabs } from "@/components/logiquest/TopicTabs";
import { GROUP_BY_SLUG, getTopicMeta } from "@/lib/logiquest/catalog";
import { getTopic } from "@/lib/logiquest/bank";
import { PAGE_SIZE } from "@/lib/logiquest/constants";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ subject: string; topic: string }>; searchParams: Promise<{ ex?: string; page?: string }> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { subject, topic } = await params;
  const { page } = await searchParams;
  const m = getTopicMeta(subject, topic);
  if (!m) return { title: "LogiQuest" };
  const p = Number(page) > 1 ? ` - Page ${Number(page)}` : "";
  return {
    title: `${m.topic.title} - ${m.subject.title} Questions and Answers${p} · LogiQuest`,
    description: `${m.topic.title} questions and answers with detailed explanations, for placement tests, interviews and competitive exams.`,
  };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { subject, topic } = await params;
  const sp = await searchParams;
  const meta = getTopicMeta(subject, topic);
  if (!meta) notFound();
  const content = await getTopic(subject, topic);
  if (!content) notFound();

  const hasExplanation = Boolean(content.intro || content.formulas?.length);
  const exercise = content.exercises.find((e) => e.slug === (sp.ex ?? "general")) ?? content.exercises[0];
  if (!exercise && hasExplanation) redirect(`/logiquest/${subject}/${topic}/formulas`);

  const pages = Math.max(1, Math.ceil((exercise?.questions.length ?? 0) / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(sp.page)) || 1));
  const questions = (exercise?.questions ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const ids = questions.map((q) => q.id);

  const user = await getCurrentUser();
  const [answers, saved, comments] = await Promise.all([
    user ? prisma.lqAnswer.findMany({ where: { userId: user.id, qid: { in: ids } }, select: { qid: true, firstCorrect: true } }) : [],
    user ? prisma.lqSaved.findMany({ where: { userId: user.id, qid: { in: ids } }, select: { qid: true } }) : [],
    // Discussion counts are decoration: never let them take the practice page down.
    Promise.resolve().then(() => prisma.lqComment.groupBy({ by: ["qid"], where: { qid: { in: ids }, hidden: false }, _count: { _all: true } })).catch(() => []),
  ]);
  const state = (id: string): CardState => {
    const a = answers.find((x) => x.qid === id);
    return { answered: Boolean(a), correct: a?.firstCorrect, saved: saved.some((x) => x.qid === id), comments: comments.find((c) => c.qid === id)?._count._all };
  };

  const base = `/logiquest/${subject}/${topic}`;
  const href = (p: number) => {
    const q = new URLSearchParams();
    if (exercise && exercise.slug !== "general") q.set("ex", exercise.slug);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const group = GROUP_BY_SLUG.get(meta.subject.group);
  const idx = meta.subject.topics.findIndex((t) => t.slug === topic);
  const nextTopic = meta.subject.topics[idx + 1];

  return (
    <Container className="max-w-7xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: group?.title ?? "" }, { label: meta.subject.title, href: `/logiquest/${subject}` }, { label: meta.topic.title, href: base }, ...(exercise ? [{ label: exercise.title }] : []), { label: `Page ${page} of ${pages}` }]} />
      <PageTitle title={`${meta.topic.title}${exercise ? ` - ${exercise.title}` : ""}`} />
      <TopicTabs subject={meta.subject} topic={topic} active={exercise?.slug ?? ""} hasExplanation={hasExplanation} exercises={content.exercises.map((e) => ({ slug: e.slug, title: e.title, count: e.questions.length }))} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-4">
          {questions.length ? (
            questions.map((q, i) => {
              const prev = questions[i - 1];
              const showContext = !prev || prev.passage !== q.passage || JSON.stringify(prev.media) !== JSON.stringify(q.media) || q.media?.type === "figs";
              const { check: _check, ...clientQ } = q;
              void _check;
              return <QuestionCard key={q.id} q={clientQ} loggedIn={Boolean(user)} state={state(q.id)} showContext={showContext} />;
            })
          ) : (
            <EmptyState title="Questions are being prepared" body="This topic's questions are under review and will appear here soon." cta={hasExplanation ? <Link href={`${base}/formulas`} className="font-semibold text-story-royal">Read the explanation</Link> : undefined} />
          )}
          <Pagination page={page} pages={pages} href={href} action={base} hidden={exercise && exercise.slug !== "general" ? { ex: exercise.slug } : undefined} />
          {page === pages && nextTopic ? (
            <Link href={`/logiquest/${subject}/${nextTopic.slug}`} className="mt-2 flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-4 text-sm font-semibold transition-colors hover:border-story-royal hover:text-story-royal">
              <span><span className="block text-xs font-normal text-muted">Next topic</span>{nextTopic.title}</span><ChevronRight className="h-5 w-5" />
            </Link>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-border-soft bg-surface p-3 text-sm">
            <p className="mb-2 px-2 font-bold text-story-royal">{meta.subject.title}</p>
            <ul>
              {meta.subject.topics.map((t) => (
                <li key={t.slug}>
                  <Link href={`/logiquest/${subject}/${t.slug}`} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] transition-colors hover:bg-story-mist hover:text-story-royal", t.slug === topic ? "bg-story-mist font-semibold text-story-royal" : "text-muted")}>
                    <ChevronRight className="h-3 w-3 shrink-0" />{t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
