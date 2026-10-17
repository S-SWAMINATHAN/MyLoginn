import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { RichText } from "@/components/logiquest/RichText";
import { TopicTabs } from "@/components/logiquest/TopicTabs";
import { GROUP_BY_SLUG, getTopicMeta } from "@/lib/logiquest/catalog";
import { getTopic } from "@/lib/logiquest/bank";

type Props = { params: Promise<{ subject: string; topic: string }> };

export async function generateMetadata({ params }: Props) {
  const { subject, topic } = await params;
  const m = getTopicMeta(subject, topic);
  return m ? { title: `${m.topic.title} - Explanation and Formulas · LogiQuest`, description: `Concepts, formulas and shortcuts for ${m.topic.title} with solved examples.` } : { title: "LogiQuest" };
}

export default async function FormulasPage({ params }: Props) {
  const { subject, topic } = await params;
  const meta = getTopicMeta(subject, topic);
  if (!meta) notFound();
  const content = await getTopic(subject, topic);
  if (!content || !(content.intro || content.formulas?.length)) notFound();
  const group = GROUP_BY_SLUG.get(meta.subject.group);
  const first = content.exercises.find((e) => e.questions.length);

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: group?.title ?? "" }, { label: meta.subject.title, href: `/logiquest/${subject}` }, { label: meta.topic.title, href: `/logiquest/${subject}/${topic}` }, { label: meta.subject.kind === "qa" ? "Introduction" : "Explanation & Formulas" }]} />
      <PageTitle title={`${meta.topic.title} - ${meta.subject.kind === "qa" ? "Introduction" : "Explanation & Formulas"}`} />
      <TopicTabs subject={meta.subject} topic={topic} active="formulas" hasExplanation exercises={content.exercises.map((e) => ({ slug: e.slug, title: e.title, count: e.questions.length }))} />

      <article className="mt-6 rounded-2xl border border-border-soft bg-surface p-5 sm:p-8">
        {content.intro ? <RichText text={content.intro} className="text-[15px] text-story-navy dark:text-foreground" /> : null}
        {content.formulas?.map((f, i) => (
          <section key={i} className={i || content.intro ? "mt-7" : ""}>
            {f.h ? <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-story-navy dark:text-foreground"><span className="grid h-7 w-7 place-items-center rounded-full bg-story-royal text-xs text-white">{i + 1}</span>{f.h}</h2> : null}
            {f.p ? <RichText text={f.p} className="text-[15px]" /> : null}
            {f.points?.length ? (
              <ol className="mt-2 space-y-2 pl-1">
                {f.points.map((pt, j) => (
                  <li key={j} className="flex gap-2 text-[15px]">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-story-royal" aria-hidden />
                    <RichText text={pt} />
                  </li>
                ))}
              </ol>
            ) : null}
            {f.example ? (
              <div className="mt-3 rounded-xl border-l-4 border-story-royal bg-story-mist p-4 text-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-story-royal">Example</p>
                <RichText text={f.example} />
              </div>
            ) : null}
          </section>
        ))}
      </article>

      {first ? (
        <Link href={first.slug === "general" ? `/logiquest/${subject}/${topic}` : `/logiquest/${subject}/${topic}?ex=${first.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
          Practise {meta.topic.title} questions <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </Container>
  );
}
