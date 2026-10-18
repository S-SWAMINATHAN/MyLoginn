import "server-only";
import { prisma } from "@/lib/prisma";
import { SUBJECT_BY_SLUG } from "@/lib/logiquest/catalog";
import { mean } from "./report";

/**
 * Practice dashboard data. Every query selects only the columns it needs (never report JSON) and they all run in
 * parallel, so the dashboard costs one round of small queries. Recommendations are rule-based, not an AI call, so
 * the page renders instantly.
 */

export type Area = "interview" | "communication" | "fluency" | "technical" | "gd";

export const AREA_LABEL: Record<Area, string> = {
  interview: "Interview", communication: "Communication", fluency: "Fluency", technical: "Technical", gd: "Group Discussion",
};
const READINESS_WEIGHTS: Record<Area, number> = { interview: 0.32, communication: 0.24, technical: 0.18, fluency: 0.14, gd: 0.12 };

const TECH_GROUPS = new Set(["programming", "technical"]);
const FLUENCY_MODES = new Set(["fluency", "twister", "pronounce", "repeat"]);
const MIN_ANSWERS = 20;

type SessionRow = { id: string; module: string; mode: string; title: string; score: number | null; scores: unknown; startedAt: Date };

function areaOf(s: SessionRow): Area {
  if (s.module === "INTERVIEW") return "interview";
  if (s.module === "GD") return "gd";
  return FLUENCY_MODES.has(s.mode) ? "fluency" : "communication";
}

/** Monday-based week label in IST, e.g. "13 Oct". */
function weekStart(d: Date) {
  const ist = new Date(d.getTime() + 5.5 * 3600_000);
  const day = (ist.getUTCDay() + 6) % 7;
  ist.setUTCDate(ist.getUTCDate() - day);
  return ist.toISOString().slice(0, 10);
}

/** Maps a weak scoring dimension to the module that trains it. */
const DIM_ADVICE: Record<string, { label: string; href: string; module: string }> = {
  grammar: { label: "spoken grammar", href: "/practice/speaking?kind=grammar", module: "Grammar Speaking" },
  pronunciation: { label: "pronunciation", href: "/practice/speaking?kind=pronounce", module: "Pronunciation Practice" },
  fluency: { label: "fluency", href: "/practice/speaking?kind=fluency", module: "Fluency Training" },
  vocabulary: { label: "vocabulary", href: "/practice/speaking?kind=describe", module: "Image Description" },
  structure: { label: "answer structure", href: "/practice/interview", module: "AI Mock Interview" },
  content: { label: "answer content", href: "/practice/interview", module: "AI Mock Interview" },
  technical: { label: "technical knowledge", href: "/logiquest/technical-interview", module: "Technical Interview Q&A" },
  comprehension: { label: "listening", href: "/practice/speaking?kind=comprehension", module: "Listen & Comprehend" },
  accuracy: { label: "word accuracy", href: "/practice/speaking?kind=repeat", module: "Listen & Repeat" },
  clarity: { label: "clarity", href: "/practice/speaking?kind=twister", module: "Tongue Twisters" },
  confidence: { label: "confidence", href: "/practice/speaking?kind=fluency", module: "Fluency Training" },
  listening: { label: "listening in discussions", href: "/practice/gd", module: "Group Discussion" },
  leadership: { label: "leadership", href: "/practice/gd", module: "Group Discussion" },
  teamwork: { label: "teamwork", href: "/practice/gd", module: "Group Discussion" },
};
const AREA_ADVICE: Record<Area, { href: string; module: string }> = {
  interview: { href: "/practice/interview", module: "AI Mock Interview" },
  communication: { href: "/practice/speaking", module: "Speaking Lab" },
  fluency: { href: "/practice/speaking?kind=fluency", module: "Fluency Training" },
  technical: { href: "/logiquest/technical-interview", module: "Technical Q&A" },
  gd: { href: "/practice/gd", module: "Group Discussion" },
};

export async function getPracticeOverview(userId: string) {
  const since = new Date(Date.now() - 120 * 24 * 3600_000);
  const [sessions, active, answers] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { userId, status: "COMPLETED", startedAt: { gte: since } },
      orderBy: { startedAt: "desc" },
      take: 200,
      select: { id: true, module: true, mode: true, title: true, score: true, scores: true, startedAt: true },
    }),
    prisma.practiceSession.findMany({ where: { userId, status: "ACTIVE", module: { in: ["INTERVIEW", "SPEAKING"] } }, orderBy: { startedAt: "desc" }, take: 3, select: { id: true, module: true, title: true, startedAt: true } }),
    prisma.lqAnswer.groupBy({ by: ["subject", "firstCorrect"], where: { userId }, _count: { _all: true } }),
  ]);

  const byArea = new Map<Area, SessionRow[]>();
  for (const s of sessions) { const a = areaOf(s); byArea.set(a, [...(byArea.get(a) ?? []), s]); }
  // Sessions without a score (e.g. a GD where the learner barely spoke) are not counted as zero.
  const recentMean = (list: SessionRow[] = []) => { const scored = list.filter((s) => s.score !== null).slice(0, 5); return scored.length ? mean(scored.map((s) => s.score!)) : null; };

  // Technical knowledge also counts LogiQuest programming/technical answers.
  const tally = (pred: (group: string) => boolean) => {
    let total = 0, right = 0;
    for (const r of answers) {
      const group = SUBJECT_BY_SLUG.get(r.subject)?.group ?? "";
      if (!pred(group)) continue;
      total += r._count._all;
      if (r.firstCorrect) right += r._count._all;
    }
    return { total, right };
  };
  const tech = tally((g) => TECH_GROUPS.has(g));
  const techAnswerPct = tech.total >= MIN_ANSWERS ? Math.round((tech.right / tech.total) * 100) : null;
  const interviewTech = mean((byArea.get("interview") ?? []).slice(0, 5).map((s) => Number((s.scores as Record<string, number> | null)?.technical ?? NaN)).filter(Number.isFinite));
  const technical = techAnswerPct !== null && interviewTech ? Math.round(techAnswerPct * 0.6 + interviewTech * 0.4) : techAnswerPct ?? (interviewTech || null);

  const scores: Record<Area, number | null> = {
    interview: recentMean(byArea.get("interview")),
    communication: recentMean(byArea.get("communication")),
    fluency: recentMean(byArea.get("fluency")),
    gd: recentMean(byArea.get("gd")),
    technical,
  };
  const known = (Object.entries(READINESS_WEIGHTS) as [Area, number][]).filter(([a]) => scores[a] !== null);
  const readiness = known.length >= 3 ? Math.round(known.reduce((n, [a, w]) => n + (scores[a] as number) * w, 0) / known.reduce((n, [, w]) => n + w, 0)) : null;

  // Weekly trend (last 8 weeks) for the AI modules.
  const weeks: string[] = [];
  for (let i = 7; i >= 0; i--) weeks.push(weekStart(new Date(Date.now() - i * 7 * 24 * 3600_000)));
  const trendAreas: Area[] = ["interview", "communication", "fluency", "gd"];
  const trend = trendAreas
    .map((area) => ({
      area,
      label: AREA_LABEL[area],
      points: weeks.map((w) => { const list = (byArea.get(area) ?? []).filter((s) => weekStart(s.startedAt) === w); const scored = list.filter((s) => s.score !== null); return scored.length ? mean(scored.map((s) => s.score!)) : null; }),
    }))
    .filter((t) => t.points.some((p) => p !== null));

  // Weak dimensions across recent AI sessions.
  const dimTotals = new Map<string, number[]>();
  for (const s of sessions.slice(0, 15)) for (const [k, v] of Object.entries((s.scores as Record<string, number> | null) ?? {})) if (typeof v === "number") dimTotals.set(k, [...(dimTotals.get(k) ?? []), v]);
  const dims = [...dimTotals.entries()].filter(([k]) => DIM_ADVICE[k]).map(([k, v]) => ({ key: k, score: mean(v) })).sort((a, b) => a.score - b.score);
  const areasKnown = (Object.keys(scores) as Area[]).filter((a) => scores[a] !== null).sort((a, b) => (scores[a] as number) - (scores[b] as number));

  const recommendations: { title: string; reason: string; href: string; minutes: number }[] = [];
  for (const d of dims.filter((x) => x.score < 75).slice(0, 2)) {
    const adv = DIM_ADVICE[d.key];
    recommendations.push({ title: adv.module, reason: `Your ${adv.label} averages ${d.score}/100 in recent sessions.`, href: adv.href, minutes: 10 });
  }
  for (const a of areasKnown.filter((x) => (scores[x] as number) < 70)) {
    if (recommendations.length >= 3) break;
    const adv = AREA_ADVICE[a];
    if (!recommendations.some((r) => r.href === adv.href)) recommendations.push({ title: adv.module, reason: `${AREA_LABEL[a]} is at ${scores[a]}/100 — your weakest area.`, href: adv.href, minutes: 15 });
  }
  for (const a of ["interview", "communication", "fluency", "gd"] as Area[]) {
    if (recommendations.length >= 3) break;
    if (scores[a] === null) recommendations.push({ title: AREA_ADVICE[a].module, reason: `Not measured yet — one session adds ${AREA_LABEL[a]} to your readiness score.`, href: AREA_ADVICE[a].href, minutes: 15 });
  }

  return {
    scores,
    readiness,
    areasNeeded: Math.max(0, 3 - known.length),
    strongest: areasKnown.length ? areasKnown[areasKnown.length - 1] : null,
    weakest: areasKnown.length > 1 ? areasKnown[0] : null,
    trend: { weeks, series: trend },
    recommendations,
    recent: sessions.slice(0, 6).map((s) => ({ id: s.id, module: s.module, title: s.title, score: s.score, startedAt: s.startedAt })),
    active,
    totals: { sessions: sessions.length, answered: tech.total },
  };
}
export type PracticeOverview = Awaited<ReturnType<typeof getPracticeOverview>>;
