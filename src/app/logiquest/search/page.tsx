import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/ui/Section";
import { Breadcrumbs, FolderIcon, PageTitle } from "@/components/logiquest/ui";
import { SUBJECTS, SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
import { allQuestions, hiddenIds } from "@/lib/logiquest/bank";

export const metadata = { title: "Search questions · LogiQuest", robots: { index: false, follow: true } };

const MAX = 40;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const raw = ((await searchParams).q ?? "").trim().slice(0, 100);
  const words = raw.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  const topics = words.length
    ? SUBJECTS.flatMap((s) => s.topics.map((t) => ({ s, t }))).filter(({ s, t }) => words.every((w) => `${t.title} ${s.title}`.toLowerCase().includes(w))).slice(0, 12)
    : [];
  let results: { id: string; text: string; where: string }[] = [];
  let total = 0;
  if (words.length) {
    const [all, hidden] = await Promise.all([allQuestions(), hiddenIds()]);
    for (const q of all) {
      if (hidden.has(q.id)) continue;
      const hay = `${q.q} ${q.o.join(" ")} ${q.passage ?? ""}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) continue;
      total++;
      if (results.length < MAX) {
        const s = SUBJECT_BY_SLUG.get(q.subject);
        results.push({ id: q.id, text: q.q.replace(/```[a-z]*\n?/g, "").replace(/\s+/g, " ").slice(0, 220), where: `${s?.title} › ${s?.topics.find((t) => t.slug === q.topic)?.title}` });
      }
    }
  } else results = [];

  return (
    <Container className="max-w-4xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <PageTitle title="Search questions" />
      <form action="/logiquest/search" role="search" className="mt-4 flex items-center gap-2 rounded-2xl border border-border-soft bg-surface px-4 focus-within:border-story-royal">
        <Search className="h-5 w-5 text-muted" aria-hidden />
        <input name="q" defaultValue={raw} autoFocus placeholder="e.g. trains, syllogism, pointer, normalization" aria-label="Search questions" className="w-full bg-transparent py-3.5 text-base outline-none" />
        <button className="rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white">Search</button>
      </form>

      {words.length ? (
        <>
          {topics.length ? (
            <section className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Topics</h2>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {topics.map(({ s, t }) => (
                  <li key={`${s.slug}/${t.slug}`}><Link href={`/logiquest/${s.slug}/${t.slug}`} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-story-mist"><FolderIcon /><span className="font-medium">{t.title}</span><span className="text-xs text-muted">· {s.title}</span></Link></li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">{total ? `${total.toLocaleString("en-IN")} question${total === 1 ? "" : "s"}${total > MAX ? ` (showing ${MAX})` : ""}` : "No questions found"}</h2>
            <ul className="mt-2 space-y-2">
              {results.map((r) => (
                <li key={r.id}>
                  <Link href={`/logiquest/q/${r.id}`} className="block rounded-2xl border border-border-soft bg-surface p-4 transition-colors hover:border-story-royal/50">
                    <p className="text-sm font-medium">{r.text}</p>
                    <p className="mt-1 text-xs text-muted">{r.where}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : <p className="mt-6 text-sm text-muted">Search every question across all subjects by keyword.</p>}
    </Container>
  );
}
