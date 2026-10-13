import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { EmptyState } from "@/components/logiquest/ui";
import { PracticeSession } from "@/components/logiquest/PracticeSession";
import { LQ_CATEGORIES } from "@/lib/logiquest/constants";
import { shuffle } from "@/lib/logiquest/queries";
import type { LqDifficulty } from "@prisma/client";

export type PracticeParams = { size?: string; difficulty?: string; topic?: string };

const SIZES = [5, 10, 20];
const DIFFS = ["EASY", "MEDIUM", "HARD"];
const ICONS: Record<string, string> = { coding: "code", "problem-solving": "testing", logic: "ai", math: "math", communication: "comm", knowledge: "business" };

/**
 * Multiple-choice practice for one category (shared by /logiquest/[category] and /logiquest/coding/quiz).
 * The learner picks a size, level and topic; questions they have not seen come first.
 */
export async function PracticeView({ category, basePath, sp }: { category: string; basePath: string; sp: PracticeParams }) {
  const cat = LQ_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(basePath)}`);

  const size = SIZES.includes(Number(sp.size)) ? Number(sp.size) : 5;
  const difficulty = DIFFS.includes(sp.difficulty ?? "") ? (sp.difficulty as LqDifficulty) : undefined;
  const topics = await prisma.lqQuestion.groupBy({
    by: ["topic"],
    where: { status: "PUBLISHED", category: cat.id, ...(difficulty ? { difficulty } : {}) },
    _count: { _all: true },
    orderBy: { topic: "asc" },
  });
  const topic = topics.some((t) => t.topic === sp.topic) ? sp.topic : undefined;
  const where = { status: "PUBLISHED" as const, category: cat.id, ...(difficulty ? { difficulty } : {}), ...(topic ? { topic } : {}) };

  const [available, answered] = await Promise.all([
    prisma.lqQuestion.count({ where }),
    prisma.lqQuestionProgress.findMany({ where: { userId: user.id, question: where }, select: { questionId: true } }),
  ]);
  const seen = new Set(answered.map((a) => a.questionId));
  // Unseen questions first (random order), then ones already attempted.
  const rows = available
    ? await prisma.lqQuestion.findMany({ where, select: { id: true, difficulty: true, topic: true, prompt: true, options: true, xp: true } })
    : [];
  const shuffled = shuffle(rows);
  const picked = [...shuffled.filter((r) => !seen.has(r.id)), ...shuffled.filter((r) => seen.has(r.id))].slice(0, size);

  const link = (over: Record<string, string>) => {
    const q = new URLSearchParams({ size: String(size), ...(difficulty ? { difficulty } : {}), ...(topic ? { topic } : {}), ...over });
    for (const k of ["difficulty", "topic"]) if (!q.get(k)) q.delete(k);
    return `${basePath}?${q}`;
  };
  const chip = (active: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${active ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal"}`;
  const label = "text-[11px] font-bold uppercase tracking-wider text-muted";

  return (
    <Section className="overflow-hidden pt-6 sm:pt-10">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <Reveal><span className="grid h-20 w-20 place-items-center"><ContentIcon keyword={ICONS[cat.slug] ?? "default"} className="h-full w-full" /></span></Reveal>
          <Reveal delay={0.05}><Link href="/logiquest" className="story-eyebrow mt-3 justify-center">LogiQuest</Link></Reveal>
          <SplitHeadline as="h1" text={category === "coding" ? "Coding quiz" : `${cat.label} practice`} className="mt-4 text-4xl font-bold tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}><p className="mt-3 text-sm text-muted sm:text-base">{cat.desc}</p></Reveal>
        </div>

        <Reveal direction="up" delay={0.2} className="mt-7">
          <div className="grid gap-4 rounded-3xl border border-border-soft bg-surface p-4 sm:grid-cols-2 sm:p-5" aria-label="Session options">
            <div>
              <p className={label}>Questions</p>
              <div className="mt-2 flex flex-wrap gap-2">{SIZES.map((n) => <Link key={n} href={link({ size: String(n) })} className={chip(n === size)}>{n}</Link>)}</div>
            </div>
            <div>
              <p className={label}>Level</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={link({ difficulty: "" })} className={chip(!difficulty)}>Any</Link>
                {DIFFS.map((d) => <Link key={d} href={link({ difficulty: d })} className={chip(d === difficulty)}>{d.charAt(0) + d.slice(1).toLowerCase()}</Link>)}
              </div>
            </div>
            <form action={basePath} className="sm:col-span-2">
              <input type="hidden" name="size" value={size} />
              {difficulty ? <input type="hidden" name="difficulty" value={difficulty} /> : null}
              <label htmlFor="topic" className={label}>Topic</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <select id="topic" name="topic" defaultValue={topic ?? ""} className="min-w-0 flex-1 rounded-full border border-border-soft bg-background px-4 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-story-royal">
                  <option value="">All topics ({topics.reduce((n, t) => n + t._count._all, 0)} questions)</option>
                  {topics.map((t) => <option key={t.topic} value={t.topic}>{t.topic} ({t._count._all})</option>)}
                </select>
                <button className={chip(false)}>Apply</button>
              </div>
            </form>
          </div>
        </Reveal>

        <div className="mt-6">
          {picked.length ? (
            <PracticeSession key={`${size}-${difficulty ?? "any"}-${topic ?? "all"}`} categoryLabel={cat.label} questions={picked.map((q) => ({ ...q, answered: seen.has(q.id) }))} />
          ) : (
            <EmptyState title="No questions here yet" body={difficulty || topic ? "There are no published questions for this filter yet. Try another level or topic." : "Questions for this category are being reviewed and will appear here once published."} cta={<Link href="/logiquest" className="font-semibold text-story-royal">Back to LogiQuest</Link>} />
          )}
        </div>
      </Container>
    </Section>
  );
}
