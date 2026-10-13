import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { ChallengeWorkspace } from "@/components/logiquest/ChallengeWorkspace";
import { LANGUAGES, SOLUTION_UNLOCK_ATTEMPTS } from "@/lib/logiquest/constants";
import { getChallengeForPage } from "@/lib/logiquest/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const c = await prisma.lqChallenge.findFirst({ where: { slug, status: "PUBLISHED" }, select: { title: true, topic: true } });
  return { title: c ? `${c.title} · LogiQuest` : "LogiQuest", description: c ? `Practice ${c.topic} on LogiQuest.` : undefined, robots: { index: false, follow: true } };
}

export default async function ChallengePage({ params }: Params) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/logiquest/challenges/${slug}`)}`);
  const data = await getChallengeForPage(slug, user.id);
  if (!data) notFound();
  const { challenge: c } = data;

  const examples = Array.isArray(c.examples) ? (c.examples as { input: string; output: string; explanation?: string }[]) : [];
  const starter = (c.starterCode && typeof c.starterCode === "object" ? c.starterCode : {}) as Record<string, string>;
  const languages = c.languages.filter((l) => LANGUAGES[l]).map((l) => ({ id: l, label: LANGUAGES[l].label }));

  return (
    <Section className="py-6 sm:py-10">
      <Container>
        <Link href="/logiquest/coding" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground"><ChevronLeft className="h-4 w-4" />All coding challenges</Link>
        <ChallengeWorkspace
          slug={c.slug} title={c.title} difficulty={c.difficulty} topic={c.topic} subtopic={c.subtopic} style={c.style}
          statement={c.statement} scenario={c.scenario} constraints={c.constraints} inputFormat={c.inputFormat} outputFormat={c.outputFormat}
          notes={c.notes} examples={examples} estimatedMinutes={c.estimatedMinutes} xp={c.xp} languages={languages}
          starterCode={starter} drafts={data.drafts} hintTotal={data.hintTotal} openedHints={data.openedHints}
          hasSolution={data.hasSolution} solved={data.solved} attempts={data.attempts} note={data.note}
          bookmarked={data.bookmarks.includes("SAVED")} attemptCount={c.attemptCount}
          successRate={c.attemptCount ? Math.round((c.solvedCount / c.attemptCount) * 100) : null}
          unlockAttempts={SOLUTION_UNLOCK_ATTEMPTS}
          history={data.history.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() }))}
        />
      </Container>
    </Section>
  );
}
