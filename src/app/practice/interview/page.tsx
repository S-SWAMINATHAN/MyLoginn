import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { PageTitle } from "@/components/logiquest/ui";
import { InterviewSetup } from "@/components/practice/InterviewSetup";
import { Card } from "@/components/practice/ui";

export const metadata = {
  title: "AI Mock Interview — HR, Technical, Testing & MNC Interview Practice",
  description: "A spoken AI mock interview that adapts to your answers: HR, technical, Java, Python, SQL, Selenium, Playwright, API testing and MNC placement interviews with a detailed feedback report.",
};

export default async function InterviewPage() {
  const user = await getCurrentUser();
  const active = user ? await prisma.practiceSession.findMany({ where: { userId: user.id, module: "INTERVIEW", status: "ACTIVE" }, orderBy: { startedAt: "desc" }, take: 3, select: { id: true, title: true, startedAt: true } }) : [];

  return (
    <Container className="max-w-7xl space-y-6 py-6 sm:py-10">
      <PageTitle eyebrow="AI Mock Interview" title="Practise a real interview, out loud." sub="The interviewer speaks, listens to your full answer, and asks follow-ups based on what you actually said — just like a company interview. You get a detailed report at the end." />
      {active.length ? (
        <Card className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Unfinished interviews:</span>
          {active.map((a) => <Link key={a.id} href={`/practice/interview/${a.id}`} className="rounded-full border border-border-soft px-3 py-1 font-medium hover:border-story-royal hover:text-story-royal">{a.title} · {a.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}</Link>)}
        </Card>
      ) : null}
      <InterviewSetup loggedIn={Boolean(user)} />
    </Container>
  );
}
