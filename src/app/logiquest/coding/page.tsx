import Link from "next/link";
import { ArrowUpRight, Bookmark, CheckCircle2, Clock, Lock, Search, Target, Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { DifficultyBadge, EmptyState } from "@/components/logiquest/ui";
import { LANGUAGES } from "@/lib/logiquest/constants";
import { listChallenges, listTopics } from "@/lib/logiquest/queries";

export const metadata = { title: "Coding Challenges · LogiQuest", description: "Practice real-world and interview-style coding challenges in Python, Java, JavaScript, C++ and more." };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const DIFF_BAR: Record<string, string> = { EASY: "#059669", MEDIUM: "#d97706", HARD: "#e11d48" };

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
  const field = "w-full rounded-full border border-border-soft bg-background px-4 py-2.5 text-sm outline-none transition-colors hover:border-story-royal focus-visible:border-story-royal";
  const filtered = Boolean(filters.q || filters.difficulty || filters.topic || filters.language || filters.state);

  return (
    <Section className="overflow-hidden pt-6 sm:pt-10">
      <Container className="max-w-5xl">
        <div className="text-center">
          <Reveal><Link href="/logiquest" className="story-eyebrow justify-center">LogiQuest</Link></Reveal>
          <SplitHeadline as="h1" text="Coding challenges" className="mt-4 text-4xl font-bold tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-4 text-sm text-muted sm:text-base">
              <span className="font-bold text-story-royal">{total.toLocaleString("en-IN")}</span> challenge{total === 1 ? "" : "s"}{filtered ? " match your filters" : " available"}. Real-world and interview-style problems in a built-in IDE.
            </p>
            <p className="mt-2 text-sm text-muted">
              Prefer something quicker? Try the <Link href="/logiquest/coding/quiz" className="font-semibold text-story-royal underline-offset-2 hover:underline">coding quiz</Link>: output prediction, debugging, data structures and complexity.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.2} className="mt-8">
          <form action="/logiquest/coding" className="grid gap-3 rounded-3xl border border-border-soft bg-surface p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-6" role="search">
            <div className="relative sm:col-span-2">
              <label htmlFor="q" className="sr-only">Search challenges</label>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-muted" />
              <input id="q" name="q" defaultValue={filters.q} placeholder="Search title, topic or tag" className={`${field} pl-10`} />
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
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-6">
              <button className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95">Apply filters</button>
              {filtered && <Link href="/logiquest/coding" className="text-sm font-semibold text-muted hover:text-story-royal">Clear filters</Link>}
            </div>
          </form>
        </Reveal>

        {items.length ? (
          <RevealGroup className="mt-6 space-y-3" stagger={0.06}>
            {items.map((c) => (
              <RevealItem key={c.id}>
                <Link href={`/logiquest/challenges/${c.slug}`} className="group relative block overflow-hidden rounded-3xl border border-border-soft bg-surface p-5 pl-6 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]">
                  <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: DIFF_BAR[c.difficulty] ?? "var(--story-royal)" }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={c.difficulty} />
                        <h2 className="text-base font-bold text-story-navy dark:text-foreground">{c.title}</h2>
                        {c.status === "solved" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Solved</span> : c.status === "attempted" ? <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">Attempted</span> : null}
                        {c.bookmarked ? <Bookmark aria-label="Bookmarked" className="h-4 w-4 fill-story-royal text-story-royal" /> : null}
                        {c.access === "PREMIUM" ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700"><Lock className="h-3 w-3" />Premium</span> : null}
                      </div>
                      <p className="mt-1.5 text-xs text-muted">{c.topic}{c.subtopic ? ` · ${c.subtopic}` : ""}{c.style ? ` · ${c.style}` : ""}</p>
                    </div>
                    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-colors duration-300 group-hover:bg-story-royal group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.estimatedMinutes} min</span>
                    <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" />{c.xp} XP</span>
                    <span>{c.attemptCount} attempts</span>
                    <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" />{c.successRate === null ? "No solves yet" : `${c.successRate}% success`}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.languages.map((l) => <span key={l} className="rounded-full bg-story-mist px-2.5 py-0.5 text-[11px] font-semibold text-story-navy dark:text-foreground">{LANGUAGES[l]?.label ?? l}</span>)}
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="mt-6"><EmptyState title="No challenges match" body="Try removing a filter or searching for a different topic." cta={<Link href="/logiquest/coding" className="font-semibold text-story-royal">Clear filters</Link>} /></div>
        )}

        {pages > 1 ? (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={href({ page: page - 1 })} className="rounded-full border border-border-soft px-5 py-2 font-semibold transition-all hover:border-story-royal hover:text-story-royal">← Previous</Link> : <span />}
            <span className="text-muted">Page {page} of {pages}</span>
            {page < pages ? <Link href={href({ page: page + 1 })} className="rounded-full bg-story-royal px-5 py-2 font-semibold text-white transition-transform hover:-translate-y-0.5">Next →</Link> : <span />}
          </nav>
        ) : null}
      </Container>
    </Section>
  );
}
