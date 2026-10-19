import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/logiquest/ui";
import { CodingWorkspace, type SqlPreview } from "@/components/logiquest/coding/CodingWorkspace";
import { getProblemDef, problemSummaries, publicProblem } from "@/lib/logiquest/coding/catalog";
import { runSql } from "@/lib/logiquest/coding/sqlJudge";
import { TRACK_BY_SLUG } from "@/lib/logiquest/coding/tracks";
import type { CodeLang } from "@/lib/logiquest/coding/types";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug;
  const p = publicProblem(slug);
  if (!p) return { title: "Coding · LogiQuest" };
  const text = p.statement.replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim();
  return createPageMetadata({
    title: `${p.title} - Coding Problem | LogiQuest`,
    absoluteTitle: true,
    // short statements get a line on how to solve it, so the description is useful in search results
    description: text.length < 110 ? `${text} ${p.difficulty} problem: solve it online in Python, JavaScript or SQL and check it instantly.` : text,
    path: `/logiquest/coding/problems/${slug}`,
    keywords: [p.title, `${p.title} solution`, "coding problem", "coding interview practice"],
  });
}

/** Sample rows of every table in a SQL problem's dataset, shown with the statement. */
async function previewTables(schema: string): Promise<SqlPreview[]> {
  const names = [...schema.matchAll(/CREATE TABLE (\w+)/gi)].map((m) => m[1]);
  const out: SqlPreview[] = [];
  for (const name of names) {
    const r = await runSql(schema, `SELECT * FROM ${name}`);
    if (!("error" in r)) out.push({ name, ...r });
  }
  return out;
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;
  const problem = publicProblem(slug);
  const def = getProblemDef(slug);
  if (!problem || !def) notFound();
  const user = await getCurrentUser();
  const [progress, tables] = await Promise.all([
    user ? prisma.lqCodeProgress.findUnique({ where: { userId_slug: { userId: user.id, slug } } }).catch(() => null) : null,
    def.kind === "sql" ? previewTables(def.schema) : Promise.resolve(undefined),
  ]);
  const list = problemSummaries();
  const idx = list.findIndex((p) => p.slug === slug);
  const prev = list[idx - 1], next = list[idx + 1];
  const track = TRACK_BY_SLUG.get(problem.tracks[0]);

  return (
    <Container className="max-w-[90rem] py-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Breadcrumbs items={[{ label: "Coding", href: "/logiquest/coding" }, ...(track ? [{ label: track.title, href: `/logiquest/coding/${track.slug}` }] : []), { label: problem.title }]} />
        <div className="ml-auto flex gap-1">
          {prev ? <Link href={`/logiquest/coding/problems/${prev.slug}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:bg-story-mist hover:text-story-royal"><ChevronLeft className="h-4 w-4" />Prev</Link> : null}
          {next ? <Link href={`/logiquest/coding/problems/${next.slug}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:bg-story-mist hover:text-story-royal">Next<ChevronRight className="h-4 w-4" /></Link> : null}
        </div>
      </div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">{idx + 1}. {problem.title}</h1>
      <CodingWorkspace
        problem={problem}
        loggedIn={Boolean(user)}
        solved={Boolean(progress?.solved)}
        attempts={progress?.attempts ?? 0}
        drafts={(progress?.drafts as Partial<Record<CodeLang, string>> | undefined) ?? {}}
        tables={tables}
      />
    </Container>
  );
}
