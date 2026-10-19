import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/logiquest/ui";
import { QuestionCard } from "@/components/logiquest/QuestionCard";
import { Discussion } from "@/components/logiquest/Discussion";
import { GROUP_BY_SLUG, getTopicMeta } from "@/lib/logiquest/catalog";
import { getQuestion } from "@/lib/logiquest/bank";
import { PAGE_SIZE } from "@/lib/logiquest/constants";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ qid: string }> };

export async function generateMetadata({ params }: Props) {
  const q = await getQuestion(decodeURIComponent((await params).qid));
  const m = q && getTopicMeta(q.subject, q.topic);
  if (!q || !m) return { title: "LogiQuest" };
  return createPageMetadata({
    title: `${q.q.split("\n")[0].slice(0, 50).replace(/\s+\S*$/, "")}… | LogiQuest`,
    absoluteTitle: true,
    description: `${m.subject.title} › ${m.topic.title}: question with answer, explanation and discussion.`,
    path: `/logiquest/q/${encodeURIComponent(decodeURIComponent((await params).qid))}`,
  });
}

export default async function QuestionPage({ params }: Props) {
  const qid = decodeURIComponent((await params).qid);
  const q = await getQuestion(qid);
  const meta = q && getTopicMeta(q.subject, q.topic);
  if (!q || !meta) notFound();
  const user = await getCurrentUser();
  const [answer, saved, comments] = await Promise.all([
    user ? prisma.lqAnswer.findUnique({ where: { userId_qid: { userId: user.id, qid } }, select: { firstCorrect: true } }) : null,
    user ? prisma.lqSaved.findUnique({ where: { userId_qid: { userId: user.id, qid } }, select: { id: true } }) : null,
    prisma.lqComment.findMany({ where: { qid, hidden: false }, orderBy: { createdAt: "asc" }, take: 200, include: { user: { select: { name: true } } } }),
  ]);
  const page = Math.ceil(q.n / PAGE_SIZE);
  const back = `/logiquest/${q.subject}/${q.topic}?${new URLSearchParams({ ...(q.exercise !== "general" ? { ex: q.exercise } : {}), ...(page > 1 ? { page: String(page) } : {}) })}`;
  const { check: _check, ...clientQ } = q;
  void _check;

  return (
    <Container className="max-w-4xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: GROUP_BY_SLUG.get(meta.subject.group)?.title ?? "" }, { label: meta.subject.title, href: `/logiquest/${q.subject}` }, { label: meta.topic.title, href: `/logiquest/${q.subject}/${q.topic}` }, { label: `Question ${q.n}` }]} />
      <Link href={back} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal hover:underline"><ArrowLeft className="h-4 w-4" />Back to {meta.topic.title}</Link>
      <div className="mt-4">
        <QuestionCard q={clientQ} loggedIn={Boolean(user)} state={{ answered: Boolean(answer), correct: answer?.firstCorrect, saved: Boolean(saved) }} discussLink={false} />
      </div>
      <Discussion
        qid={qid}
        loggedIn={Boolean(user)}
        isAdmin={user?.role === "ADMIN"}
        loginHref={`/login?next=${encodeURIComponent(`/logiquest/q/${qid}`)}`}
        initial={comments.map((c) => ({ id: c.id, name: c.user.name.split(/\s+/)[0] ?? "Learner", body: c.body, createdAt: c.createdAt.toISOString(), mine: c.userId === user?.id }))}
      />
    </Container>
  );
}
