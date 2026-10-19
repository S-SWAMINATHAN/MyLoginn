import Link from "next/link";
import { Binary, Braces, CodeXml, Database, FileCode2, Puzzle, Sigma, Type, Workflow } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, PageTitle } from "@/components/logiquest/ui";
import { ProblemTable } from "@/components/logiquest/coding/ProblemTable";
import { problemRows } from "@/lib/logiquest/coding/listing";
import { TRACKS } from "@/lib/logiquest/coding/tracks";

export const metadata = {
  title: "Coding Practice - Problems with an Online IDE · LogiQuest",
  description: "Practise coding problems in Python, JavaScript and SQL with the MyLoginn IDE: algorithms, data structures, mathematics, strings and SQL, judged instantly.",
};

const ICONS: Record<string, typeof Binary> = { algorithm: Workflow, structure: Binary, math: Sigma, python: FileCode2, javascript: Braces, sql: Database, strings: Type, puzzle: Puzzle };

export default async function CodingHome() {
  const user = await getCurrentUser();
  const rows = await problemRows(user?.id ?? null);
  const solved = rows.filter((r) => r.status === "solved");
  const by = (d: string) => ({ total: rows.filter((r) => r.difficulty === d).length, solved: solved.filter((r) => r.difficulty === d).length });

  return (
    <Container className="max-w-6xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Coding" }]} />
      <PageTitle title="Coding Practice" sub="Solve problems in the MyLoginn IDE — Python, JavaScript and SQL — with instant results on sample and hidden test cases. Earn XP for every first solve." />

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border-soft bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Solved</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{solved.length}<span className="text-base text-muted"> / {rows.length}</span></p>
        </div>
        {(["Easy", "Medium", "Hard"] as const).map((d) => {
          const s = by(d);
          return (
            <div key={d} className="rounded-2xl border border-border-soft bg-surface p-4">
              <p className={`text-xs font-semibold uppercase tracking-wider ${d === "Easy" ? "text-emerald-600" : d === "Medium" ? "text-amber-600" : "text-rose-600"}`}>{d}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{s.solved}<span className="text-base text-muted"> / {s.total}</span></p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-story-mist"><div className={`h-full rounded-full ${d === "Easy" ? "bg-emerald-500" : d === "Medium" ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${s.total ? (s.solved / s.total) * 100 : 0}%` }} /></div>
            </div>
          );
        })}
      </div>
      {!user ? <p className="mt-3 text-sm text-muted"><Link href="/login?next=%2Flogiquest%2Fcoding" className="font-semibold text-story-royal">Log in</Link> to save your solutions, track solved problems and earn XP.</p> : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold">Practice Skills</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((t) => {
            const Icon = ICONS[t.icon] ?? CodeXml;
            const inTrack = rows.filter((r) => r.tracks.includes(t.slug));
            const done = inTrack.filter((r) => r.status === "solved").length;
            return (
              <li key={t.slug}>
                <Link href={`/logiquest/coding/${t.slug}`} className="group flex h-full items-center gap-3 rounded-2xl bg-story-mist p-5 transition-all hover:-translate-y-0.5 hover:bg-story-royal/10">
                  <span className="grid h-10 w-10 shrink-0 place-items-center text-story-royal"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold group-hover:text-story-royal">{t.title}</span>
                    <span className="block text-xs text-muted">{done ? `${done} / ` : ""}{inTrack.length} problems</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Problem Set</h2>
        <div className="mt-4"><ProblemTable rows={rows} tracks={TRACKS.map((t) => ({ slug: t.slug, title: t.title }))} /></div>
      </section>
    </Container>
  );
}
