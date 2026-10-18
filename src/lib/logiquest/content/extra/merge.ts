import type { RawItem, RawSubject } from "../../types";

/** Additional questions for a subject, keyed by topic slug. They are appended to the topic's "General Questions" exercise. */
export type ExtraSubject = Record<string, RawItem[]>;

export function mergeExtra(base: RawSubject, extra: ExtraSubject): RawSubject {
  const out: RawSubject = { ...base };
  for (const [slug, items] of Object.entries(extra)) {
    const t = out[slug];
    if (!t) throw new Error(`Extra questions for unknown topic "${slug}"`);
    const general = t.exercises.find((e) => e.slug === "general");
    out[slug] = {
      ...t,
      exercises: general
        ? t.exercises.map((e) => (e === general ? { ...e, items: [...e.items, ...items] } : e))
        : [{ slug: "general", title: "General Questions", items }, ...t.exercises],
    };
  }
  return out;
}
