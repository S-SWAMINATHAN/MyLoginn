import Link from "next/link";
import { CheckCircle2, Clock, Bookmark, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { DifficultyBadge, EmptyState } from "@/components/logiquest/ui";
import { LANGUAGES } from "@/lib/logiquest/constants";
import { listChallenges, listTopics } from "@/lib/logiquest/queries";

export const metadata = { title: "Coding Challenges · LogiQuest", description: "Practice real-world and interview-style coding challenges in Python, Java, JavaScript, C++ and more." };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CodingList({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const filters = { q: one(sp.q), difficulty: one(sp.difficulty), topic: one(sp.topic), language: one(sp.language), state: one(sp.state), page: Number(one(sp.page)) || 1 };
  const [{ items, total, page, pages }, topics] = await Promise.all([listChallenges(filters, user?.id ?? null), listTopics()]);

  const href = (over: Record<string, string | number>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, ...over })) if (v && !(k === "page" && v === 1)) q.set(k, String(v));
    const s = q.toString();
    return `/logiquest/coding${s ? `?${s}` : ""}`;
  };
  const field = "w-full rounded-lg border border-border-soft bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500";

  return (
    <Section className="py-8 sm:py-12">
      <Container>
        <Link href="/logiquest" className="text-sm font-semibold text-brand-600">LogiQuest</Link>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Coding challenges</h1>
        <p className="mt-1 text-sm text-muted">{total.toLocaleString("en-IN")} challenge{total === 1 ? "" : "s"}{filters.q || filters.difficulty || filters.topic || filters.language || filters.state ? " match your filters" : " available"}.</p>

        <form action="/logiquest/coding" className="mt-5 grid gap-3 rounded-2xl border border-border-soft bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6" role="search">
          <div className="relative sm:col-span-2">
            <label htmlFor="q" className="sr-only">Search challenges</label>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input id="q" name="q" defaultValue={filters.q} placeholder="Search title, topic or tag" className={`${field} pl-9`} />
          </div>
          <label className="sr-only" htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" defaultValue={filters.difficulty} className={field}>
            <option value="">All difficulties</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
          </select>
          <label className="sr-only" htmlFor="topic">Topic</label>
          <select id="topic" name="topic" defaultValue={filters.topic} className={field}>
            <option value="">All topics</option>{topics.map((t) => <option key={t.topic} value={t.topic}>{t.topic} ({t.count})</option>)}
          </select>
          <label className="sr-only" htmlFor="language">Language</label>
          <select id="language" name="language" defaultValue={filters.language} className={field}>
            <option value="">Any language</option>{Object.entries(LANGUAGES).map(([id, l]) => <option key={id} value={id}>{l.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="state">Status</label>
          <select id="state" name="state" defaultValue={filters.state} className={field} disabled={!user}>
            <option value="">All statuses</option><option value="unsolved">Unsolved</option><option value="solved">Solved</option><option value="attempted">Attempted</option><option value="new">Not attempted</option><option value="bookmarked">Bookmarked</option>
          </select>
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:col-span-2 lg:col-span-6 lg:justify-self-start">Apply filters</button>
        </form>

        <div className="mt-5 space-y-3">
          {items.length ? items.map((c) => (
            <Link key={c.id} href={`/logiquest/challenges/${c.slug}`} className="block rounded-2xl border border-border-soft bg-surface p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={c.difficulty} />
                <h2 className="font-semibold">{c.title}</h2>
                {c.status === "solved" ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" />Solved</span> : c.status === "attempted" ? <span className="text-xs font-semibold text-amber-600">Attempted</span> : null}
                {c.bookmarked ? <Bookmark aria-label="Bookmarked" className="h-4 w-4 fill-brand-600 text-brand-600" /> : null}
                {c.access === "PREMIUM" ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">🔒 Premium</span> : null}
              </div>
              <p className="mt-1.5 text-xs text-muted">{c.topic}{c.subtopic ? ` · ${c.subtopic}` : ""}{c.style ? ` · ${c.style}` : ""}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.estimatedMinutes} min</span>
                <span>{c.xp} XP</span>
                <span>{c.attemptCount} attempts</span>
                <span>{c.successRate === null ? "No solves yet" : `${c.successRate}% success`}</span>
                <span>{c.languages.map((l) => LANGUAGES[l]?.label ?? l).join(", ")}</span>
              </div>
            </Link>
          )) : (
            <EmptyState title="No challenges match" body="Try removing a filter or searching for a different topic." cta={<Link href="/logiquest/coding" className="font-semibold text-brand-600">Clear filters</Link>} />
          )}
        </div>

        {pages > 1 ? (
          <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={href({ page: page - 1 })} className="font-semibold text-brand-600">← Previous</Link> : <span />}
            <span className="text-muted">Page {page} of {pages}</span>
            {page < pages ? <Link href={href({ page: page + 1 })} className="font-semibold text-brand-600">Next →</Link> : <span />}
          </nav>
        ) : null}
      </Container>
    </Section>
  );
}
