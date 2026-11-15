import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { InterviewSetup } from "@/components/practice/InterviewSetup";
import { PracticeHero } from "@/components/practice/PracticeHero";
import { Card } from "@/components/practice/ui";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI Mock Interview — HR, Technical, Testing & MNC Interview Practice",
  absoluteTitle: true,
  description: "A spoken AI mock interview that adapts to your answers: HR, technical, Java, Python, SQL, Selenium, Playwright, API testing and MNC placement interviews with a detailed feedback report.",
  path: "/practice/interview",
  keywords: ["AI mock interview", "technical interview practice", "HR interview practice"],
});

export default async function InterviewPage() {
  const user = await getCurrentUser();
  const active = user ? await prisma.practiceSession.findMany({ where: { userId: user.id, module: "INTERVIEW", status: "ACTIVE" }, orderBy: { startedAt: "desc" }, take: 3, select: { id: true, title: true, startedAt: true } }) : [];

  return (
    <Container className="max-w-screen-2xl space-y-7 py-6 sm:py-10">
      <PracticeHero
        eyebrow="AI interview studio"
        title="Build confidence for the interview room."
        description="Answer out loud, get thoughtful follow-up questions, and review a clear report when you finish. Choose a role and interview style to make each session yours."
        facts={[
          { value: "8–16", label: "questions per session" },
          { value: "8", label: "interview stages" },
          { value: "Live", label: "spoken follow-ups" },
        ]}
      />
      {active.length ? (
        <Card className="flex flex-wrap items-center gap-3 border-l-4 border-l-story-royal text-sm">
          <span className="font-semibold">Continue an interview</span>
          {active.map((a) => <Link key={a.id} href={`/practice/interview/${a.id}`} className="rounded-xl border border-border-soft bg-background px-3.5 py-2 font-medium hover:border-story-royal hover:text-story-royal">{a.title} · {a.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}</Link>)}
        </Card>
      ) : null}
      <InterviewSetup loggedIn={Boolean(user)} />
    </Container>
  );
}
