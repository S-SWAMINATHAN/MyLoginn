import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { PageTitle } from "@/components/logiquest/ui";
import { TestRunner } from "@/components/logiquest/TestRunner";
import { GROUP_BY_SLUG, getSubjectMeta } from "@/lib/logiquest/catalog";

type Props = { params: Promise<{ subject: string }>; searchParams: Promise<{ topic?: string }> };

export async function generateMetadata({ params, searchParams }: Props) {
  const s = getSubjectMeta((await params).subject);
  const { topic } = await searchParams;
  const t = s?.topics.find((x) => x.slug === topic);
  return { title: s ? `${t ? t.title : s.title} Online Test · LogiQuest` : "Online Test · LogiQuest", robots: { index: !t, follow: true } };
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
