import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Section";
import { PageTitle, EmptyState } from "@/components/logiquest/ui";
import { Button } from "@/components/ui/Button";
import { MODULE_LABEL } from "@/lib/practice/report";
import { band, bandColor } from "@/lib/practice/speech";

export const metadata = { title: "My Practice Reports", robots: { index: false } };

const PAGE = 20;
const FILTERS = [{ id: "", label: "All" }, { id: "INTERVIEW", label: "Interviews" }, { id: "GD", label: "Group discussions" }, { id: "SPEAKING", label: "Speaking" }];

type Props = { searchParams: Promise<{ module?: string; page?: string }> };

export default async function ReportsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fpractice%2Freports");
  const sp = await searchParams;
  const moduleFilter = FILTERS.some((f) => f.id === sp.module) ? sp.module ?? "" : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = { userId: user.id, status: "COMPLETED", ...(moduleFilter ? { module: moduleFilter } : {}) };
  // Only list columns: report JSON is loaded on the report page alone.
  const [rows, total] = await Promise.all([
    prisma.practiceSession.findMany({ where, orderBy: { startedAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, select: { id: true, module: true, title: true, score: true, startedAt: true, reportNo: true, durationS: true } }),
    prisma.practiceSession.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (p: number, m = moduleFilter) => `/practice/reports?${new URLSearchParams({ ...(m ? { module: m } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  return (
    <Container className="max-w-5xl space-y-6 py-6 sm:py-10">
      <PageTitle title="My reports" sub="Every completed interview, group discussion and speaking session. Open one to view it, compare with your previous attempt, or download the PDF." />
      <nav aria-label="Filter reports" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => <Link key={f.id} href={href(1, f.id)} aria-current={moduleFilter === f.id ? "page" : undefined} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold", moduleFilter === f.id ? "bg-story-royal text-white" : "bg-surface text-muted hover:text-story-royal")}>{f.label}</Link>)}
      </nav>
      {rows.length ? (
        <ul className="divide-y divide-border-soft overflow-hidden rounded-3xl border border-border-soft bg-surface">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/practice/reports/${r.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-story-mist/60 dark:hover:bg-surface-2">
                <FileText className="h-5 w-5 shrink-0 text-story-royal" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.title}</span>
                  <span className="text-xs text-muted">{r.startedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })} · {MODULE_LABEL[r.module]}{r.durationS ? ` · ${Math.max(1, Math.round(r.durationS / 60))} min` : ""} · {r.reportNo}</span>
                </span>
                <span className="text-right">
                  <span className="block text-xl font-bold tabular-nums" style={{ color: r.score !== null ? bandColor(r.score) : undefined }}>{r.score ?? "—"}</span>
                  {r.score !== null ? <span className="hidden text-xs text-muted sm:block">{band(r.score)}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No reports yet" body="Finish an AI mock interview, a speaking exercise or a group discussion to get your first report." cta={<Button href="/practice/interview">Start a mock interview</Button>} />
      )}
      {pages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? <Link href={href(page - 1)} className="inline-flex items-center gap-1 font-semibold text-story-royal"><ChevronLeft className="h-4 w-4" />Newer</Link> : null}
          <span className="text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link href={href(page + 1)} className="inline-flex items-center gap-1 font-semibold text-story-royal">Older<ChevronRight className="h-4 w-4" /></Link> : null}
        </div>
      ) : null}
    </Container>
  );
}
