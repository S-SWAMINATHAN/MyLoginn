import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Minus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { ReportView } from "@/components/practice/ReportView";
import { ReportActions } from "@/components/practice/ReportActions";
import { Card } from "@/components/practice/ui";
import { MODULE_LABEL, type PracticeReport } from "@/lib/practice/report";

export const metadata = { title: "Practice Report", robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/practice/reports/${id}`)}`);
  const session = await prisma.practiceSession.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } } } });
  // Ownership is enforced here: someone else's report id is indistinguishable from a missing one.
  if (!session || (session.userId !== user.id && user.role !== "ADMIN")) notFound();
  if (session.status !== "COMPLETED" || !session.report) redirect(session.module === "INTERVIEW" ? `/practice/interview/${id}` : session.module === "SPEAKING" ? `/practice/speaking/${id}` : "/practice");

  const report = session.report as unknown as PracticeReport;
  const previous = await prisma.practiceSession.findFirst({
    where: { userId: session.userId, module: session.module, mode: session.mode, status: "COMPLETED", startedAt: { lt: session.startedAt }, score: { not: null } },
    orderBy: { startedAt: "desc" },
    select: { id: true, score: true, scores: true, startedAt: true },
  });
  const prevScores = (previous?.scores as Record<string, number> | null) ?? null;
  const date = session.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const participants = session.module === "GD" ? ((session.config as { participants?: string[] })?.participants ?? []) : undefined;

  return (
    <Container className="max-w-screen-2xl space-y-6 py-6 sm:py-10">
      <Link href="/practice/reports" className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-sm font-semibold text-muted transition-colors hover:border-story-royal/40 hover:text-story-royal"><ArrowLeft className="h-4 w-4" />My reports</Link>
      <div className="grid min-w-0 gap-5 rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-story-mist px-3 py-1 text-xs font-semibold text-story-royal dark:bg-surface-2">{MODULE_LABEL[session.module]}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-story-navy sm:text-4xl dark:text-foreground">{report.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{report.subtitle}</p>
          <p className="mt-3 text-xs text-muted">{date} · Report {session.reportNo}</p>
        </div>
        <div className="min-w-0 xl:max-w-sm">
          <ReportActions report={report} canDelete={session.userId === user.id} meta={{ studentName: session.user.name, studentEmail: session.user.email, reportNo: session.reportNo ?? session.id, sessionId: session.id, date, moduleLabel: MODULE_LABEL[session.module], participants }} />
        </div>
      </div>

      {previous && prevScores && session.score !== null ? (
        <Card className="border-l-4 border-l-story-royal">
          <p className="text-sm font-semibold">Compared with your previous attempt <span className="font-normal text-muted">({previous.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })})</span></p>
          <ul className="mt-3 flex flex-wrap gap-2">
            <Delta label="Overall" now={session.score} before={previous.score ?? 0} />
            {report.dimensions.filter((d) => typeof prevScores[d.key] === "number").map((d) => <Delta key={d.key} label={d.label} now={d.score} before={prevScores[d.key]} />)}
          </ul>
        </Card>
      ) : null}

      <ReportView report={report} />
    </Container>
  );
}

function Delta({ label, now, before }: { label: string; now: number; before: number }) {
  const d = now - before;
  const Icon = d > 0 ? ArrowUpRight : d < 0 ? ArrowDownRight : Minus;
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular-nums">{now}</span>
      <span className={d > 0 ? "inline-flex items-center text-success" : d < 0 ? "inline-flex items-center text-danger" : "inline-flex items-center text-muted"}><Icon className="h-3.5 w-3.5" />{d > 0 ? `+${d}` : d}</span>
    </li>
  );
}
