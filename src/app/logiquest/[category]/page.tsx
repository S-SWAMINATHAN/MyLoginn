import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { EmptyState } from "@/components/logiquest/ui";
import { PracticeSession } from "@/components/logiquest/PracticeSession";
import { LQ_CATEGORIES } from "@/lib/logiquest/constants";
import { shuffle } from "@/lib/logiquest/queries";
import type { LqDifficulty } from "@prisma/client";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ size?: string; difficulty?: string }> };

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const c = LQ_CATEGORIES.find((x) => x.slug === category);
  return { title: c ? `${c.label} Practice · LogiQuest` : "LogiQuest", robots: { index: false, follow: true } };
}

const SIZES = [5, 10, 20];
const DIFFS = ["EASY", "MEDIUM", "HARD"];

/** Practice sessions for every non-coding category. The user picks a size and difficulty; unseen questions come first. */
export default async function CategoryPractice({ params, searchParams }: Props) {
  const { category } = await params;
  const cat = LQ_CATEGORIES.find((c) => c.slug === category);
  if (!cat || cat.slug === "coding") notFound();
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/logiquest/${category}`)}`);

  const size = SIZES.includes(Number(sp.size)) ? Number(sp.size) : 5;
  const difficulty = DIFFS.includes(sp.difficulty ?? "") ? (sp.difficulty as LqDifficulty) : undefined;
  const where = { status: "PUBLISHED" as const, category: cat.id, ...(difficulty ? { difficulty } : {}) };

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
    const q = new URLSearchParams({ size: String(size), ...(difficulty ? { difficulty } : {}), ...over });
    if (!q.get("difficulty")) q.delete("difficulty");
    return `/logiquest/${category}?${q}`;
  };
  const chip = (active: boolean) => `rounded-full border px-3 py-1 text-sm font-semibold ${active ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "border-border-soft text-muted hover:text-foreground"}`;

  return (
    <Section className="py-8 sm:py-12">
      <Container className="max-w-3xl">
        <Link href="/logiquest" className="text-sm font-semibold text-brand-600">LogiQuest</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{cat.label} practice</h1>
        <p className="mt-1 text-sm text-muted">{cat.desc}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Session options">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Questions</span>
          {SIZES.map((n) => <Link key={n} href={link({ size: String(n) })} className={chip(n === size)}>{n}</Link>)}
          <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-muted">Level</span>
          <Link href={link({ difficulty: "" })} className={chip(!difficulty)}>Any</Link>
          {DIFFS.map((d) => <Link key={d} href={link({ difficulty: d })} className={chip(d === difficulty)}>{d.charAt(0) + d.slice(1).toLowerCase()}</Link>)}
        </div>
        <div className="mt-6">
          {picked.length ? (
            <PracticeSession key={`${size}-${difficulty ?? "any"}`} categoryLabel={cat.label} questions={picked.map((q) => ({ ...q, answered: seen.has(q.id) }))} />
          ) : (
            <EmptyState title="No questions here yet" body={difficulty ? "There are no published questions at this level yet. Try another level." : "Questions for this category are being reviewed and will appear here once published."} cta={<Link href="/logiquest" className="font-semibold text-brand-600">Back to LogiQuest</Link>} />
          )}
        </div>
      </Container>
    </Section>
  );
}
