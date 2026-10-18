import "server-only";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, getTopicMeta } from "./catalog";
import { LOADERS } from "./content";
import { finalizeSubject } from "./content/build";
import type { Question, SubjectContent, TopicContent } from "./types";
import COUNTS from "./content/counts.generated.json";

const PRECOMPUTED = COUNTS as Record<string, Record<string, number>>;

const cache = new Map<string, Promise<SubjectContent>>();

/** All authored content for a subject (finalized once per server instance). Unknown subjects resolve to {}. */
export function loadSubject(slug: string): Promise<SubjectContent> {
  let p = cache.get(slug);
  if (!p) {
    const loader = LOADERS[slug];
    p = loader ? loader().then((m) => finalizeSubject(slug, m.default)) : Promise.resolve({});
    cache.set(slug, p);
  }
  return p;
}

let hiddenCache: { at: number; ids: Set<string> } | null = null;

/** Question ids hidden by an admin (refreshed every 60 s per instance). */
export async function hiddenIds(): Promise<Set<string>> {
  if (hiddenCache && Date.now() - hiddenCache.at < 60_000) return hiddenCache.ids;
  let rows: { qid: string }[] = [];
  try {
    rows = await prisma.lqHidden.findMany({ select: { qid: true } });
  } catch {
    // Never let moderation data take practice pages down; show everything instead.
  }
  hiddenCache = { at: Date.now(), ids: new Set(rows.map((r) => r.qid)) };
  return hiddenCache.ids;
}
export function invalidateHidden() {
  hiddenCache = null;
}

/** A topic's content with admin-hidden questions removed. */
export async function getTopic(subject: string, topic: string): Promise<TopicContent | null> {
  if (!getTopicMeta(subject, topic)) return null;
  const [content, hidden] = await Promise.all([loadSubject(subject), hiddenIds()]);
  const t = content[topic];
  if (!t) return { exercises: [] };
  if (!hidden.size) return t;
  return { ...t, exercises: t.exercises.map((e) => ({ ...e, questions: e.questions.filter((q) => !hidden.has(q.id)) })) };
}

/** Questions per topic. Read from the build-time counts file, so listing pages never load a subject just to count it. */
export async function topicCounts(subject: string): Promise<Record<string, number>> {
  // Development counts live, so content being edited is never shown with stale totals; the build regenerates the file.
  const known = process.env.NODE_ENV === "production" ? PRECOMPUTED[subject] : undefined;
  if (known) return known;
  const content = await loadSubject(subject);
  return Object.fromEntries(Object.entries(content).map(([slug, t]) => [slug, t.exercises.reduce((n, e) => n + e.questions.length, 0)]));
}

/** Looks a question up by id ("<subject>.<topic>.<hash>"). Hidden questions are not returned unless `includeHidden`. */
export async function getQuestion(qid: string, includeHidden = false): Promise<Question | null> {
  const [subject, topic] = qid.split(".");
  if (!subject || !topic || !LOADERS[subject]) return null;
  const content = await loadSubject(subject);
  for (const e of content[topic]?.exercises ?? []) {
    const q = e.questions.find((x) => x.id === qid);
    if (q) return includeHidden || !(await hiddenIds()).has(qid) ? q : null;
  }
  return null;
}

export async function getQuestions(qids: string[]): Promise<Map<string, Question>> {
  const out = new Map<string, Question>();
  const subjects = [...new Set(qids.map((id) => id.split(".")[0]))].filter((s) => LOADERS[s]);
  const loaded = new Map(await Promise.all(subjects.map(async (s) => [s, await loadSubject(s)] as const)));
  const want = new Set(qids);
  for (const [, content] of loaded) for (const t of Object.values(content)) for (const e of t.exercises) for (const q of e.questions) if (want.has(q.id)) out.set(q.id, q);
  return out;
}

/** Every question of every subject (search, validation, home-page totals). */
export async function allQuestions(): Promise<Question[]> {
  const subjects = await Promise.all(SUBJECTS.map((s) => loadSubject(s.slug)));
  return subjects.flatMap((c) => Object.values(c).flatMap((t) => t.exercises.flatMap((e) => e.questions)));
}

/** Question totals per subject. */
export async function subjectTotals(): Promise<Record<string, number>> {
  const entries = await Promise.all(SUBJECTS.map(async (s) => [s.slug, Object.values(await topicCounts(s.slug)).reduce((a, b) => a + b, 0)] as const));
  return Object.fromEntries(entries);
}

/** Strip the fields a learner must not see before answering (used only by online tests). */
export function forTest(q: Question) {
  return { id: q.id, subject: q.subject, topic: q.topic, q: q.q, o: q.o, passage: q.passage, media: q.media };
}
export type TestQuestion = ReturnType<typeof forTest>;
