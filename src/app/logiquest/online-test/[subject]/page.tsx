import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { PageTitle } from "@/components/logiquest/ui";
import { TestRunner } from "@/components/logiquest/TestRunner";
import { GROUP_BY_SLUG, getSubjectMeta } from "@/lib/logiquest/catalog";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ subject: string }>; searchParams: Promise<{ topic?: string }> };

export async function generateMetadata({ params, searchParams }: Props) {
  const slug = (await params).subject;
  const s = getSubjectMeta(slug);
  const { topic } = await searchParams;
  const t = s?.topics.find((x) => x.slug === topic);
  if (!s) return { title: "Online Test · LogiQuest" };
  const name = t ? t.title : s.title;
  // a single-topic test is a filtered view of the subject test: it points search engines at the subject test
  return createPageMetadata({
    title: `${name} Online Test | LogiQuest`,
    absoluteTitle: true,
    description: `Free timed ${name} online test with 20 questions, an instant score and explained answers. Practise for placement tests and interviews.`,
    path: `/logiquest/online-test/${slug}`,
    keywords: [`${name} online test`, `${name} mock test`, `${name} quiz`],
    noIndex: Boolean(t),
  });
}

export default async function TestPage({ params, searchParams }: Props) {
  const { subject } = await params;
  const s = getSubjectMeta(subject);
  if (!s || s.kind !== "mcq") notFound();
  const topicSlug = (await searchParams).topic;
  const topic = topicSlug ? s.topics.find((x) => x.slug === topicSlug) : undefined;
  if (topicSlug && !topic) notFound();
  const user = await getCurrentUser();
  const title = `${topic ? topic.title : s.title} Online Test`;
  const back = topic ? `/logiquest/${s.slug}/${topic.slug}` : `/logiquest/${s.slug}`;

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <PageTitle title={title} icon={GROUP_BY_SLUG.get(s.group)?.icon ?? "testing"} sub={topic ? `Questions from ${s.title} › ${topic.title}.` : `Questions from every ${s.title} topic.`} />
      <div className="mt-6">
        <TestRunner key={`${subject}-${topic?.slug ?? "all"}`} subject={s.slug} topic={topic?.slug ?? null} title={title} loggedIn={Boolean(user)} backHref={back} />
      </div>
    </Container>
  );
}
