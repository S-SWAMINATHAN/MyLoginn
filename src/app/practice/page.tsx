import Link from "next/link";
import { ArrowRight, AudioLines, FileText, Mic2, PlayCircle, Sparkles, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/logiquest/ui";
import { Card, Chip, ScoreRing } from "@/components/practice/ui";
import { TrendChart } from "@/components/practice/TrendChart";
import { AREA_LABEL, getPracticeOverview, type Area } from "@/lib/practice/progress";
import { MODULE_LABEL } from "@/lib/practice/report";
import { bandColor } from "@/lib/practice/speech";

export const metadata = {
  title: "Practice — AI Mock Interview, Group Discussion & Speaking Practice",
  description: "Practise like a real placement drive: AI mock interviews that adapt to your answers, live group discussions judged by AI, spoken English, fluency and pronunciation training — with detailed PDF reports.",
};

const MODULES = [
  { href: "/practice/interview", title: "AI Mock Interview", desc: "A voice interviewer that listens, follows up on what you say, and scores every answer.", Icon: Mic2, color: "#1f56d6" },
  { href: "/practice/gd", title: "Group Discussion", desc: "Create a room, share the code, discuss live by voice — an AI judge evaluates everyone.", Icon: Users, color: "#7c3aed" },
  { href: "/practice/speaking", title: "Verbal Communication", desc: "Listen & repeat, describe pictures, storytelling, listening comprehension, spoken grammar.", Icon: AudioLines, color: "#059669" },
  { href: "/practice/speaking?group=fluency", title: "Fluency & Pronunciation", desc: "Timed speaking, pace and filler analysis, IPA-guided words and tongue-twister games.", Icon: Sparkles, color: "#ea580c" },
];

const AREAS: Area[] = ["interview", "communication", "fluency", "technical", "gd"];
const date = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function PracticeHome() {
  const user = await getCurrentUser();
  const overview = user ? await getPracticeOverview(user.id) : null;

  return (
    <Container className="max-w-7xl space-y-8 py-6 sm:py-10">
      <PageTitle eyebrow="Practice" title="Improve the skills you need to get hired." sub="Speak, solve, discuss and interview — then get specific, measurable feedback after every session." />

      {overview?.active.length ? (
        <Card className="flex flex-wrap items-center gap-3 border-story-royal/30 bg-story-royal/5">
          <PlayCircle className="h-5 w-5 text-story-royal" />
          <p className="text-sm font-semibold">Continue where you left off:</p>
          {overview.active.map((a) => <Link key={a.id} href={`/practice/${a.module === "INTERVIEW" ? "interview" : "speaking"}/${a.id}`} className="rounded-full border border-story-royal/30 bg-surface px-3 py-1 text-sm font-medium hover:border-story-royal">{a.title}</Link>)}
        </Card>
      ) : null}

      <section aria-label="Practice modules" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map(({ href, title, desc, Icon, color }) => (
          <Link key={href} href={href} className="group flex gap-4 rounded-3xl border border-border-soft bg-surface p-5 transition-[border-color,box-shadow] hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${color}14`, color }}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold">{title}<ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" /></span>
              <span className="mt-1 block text-sm leading-6 text-muted">{desc}</span>
            </span>
          </Link>
        ))}
      </section>

      {!user ? (
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Track your career readiness</p>
            <p className="mt-1 text-sm text-muted">Log in to save sessions, download PDF reports and see your progress week by week.</p>
          </div>
          <Button href="/login?next=%2Fpractice">Log in</Button>
        </Card>
      ) : overview ? (
        <>
          <section className="grid gap-5 lg:grid-cols-[20rem_1fr]">
            <Card className="flex flex-col items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">AI Career Readiness</p>
              {overview.readiness !== null ? (
                <div className="mt-3"><ScoreRing score={overview.readiness} size={140} label="Career readiness" /></div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted">Complete practice in {overview.areasNeeded} more area{overview.areasNeeded === 1 ? "" : "s"} to see your readiness score.</p>
              )}
              <p className="mt-4 text-xs leading-5 text-muted">A practice indicator built from your interview, communication, fluency, technical and group discussion results — not a guarantee of selection or employment.</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold">Your progress</p>
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {AREAS.map((a) => {
                  const v = overview.scores[a];
                  return (
                    <li key={a} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                      <span className="text-muted">{AREA_LABEL[a]}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-story-mist dark:bg-surface-2">{v !== null ? <span className="block h-full rounded-full" style={{ width: `${v}%`, background: bandColor(v) }} /> : null}</span>
                      <span className="text-right font-semibold tabular-nums">{v ?? "—"}</span>
                    </li>
                  );
                })}
              </ul>
              {overview.strongest || overview.weakest ? (
                <p className="mt-5 text-sm text-muted">
                  {overview.strongest ? <>Strongest area: <span className="font-semibold text-foreground">{AREA_LABEL[overview.strongest]}</span>. </> : null}
                  {overview.weakest ? <>Needs improvement: <span className="font-semibold text-foreground">{AREA_LABEL[overview.weakest]}</span>.</> : null}
                </p>
              ) : null}
            </Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <Card>
              <p className="text-sm font-semibold">Scores by week</p>
              {overview.trend.series.length ? <div className="mt-3"><TrendChart weeks={overview.trend.weeks} series={overview.trend.series} /></div> : <p className="mt-3 text-sm text-muted">Your weekly trend appears after your first interview, speaking or GD session.</p>}
            </Card>
            <Card>
              <p className="text-sm font-semibold">Recommended for you</p>
              <ul className="mt-3 space-y-3">
                {overview.recommendations.map((r) => (
                  <li key={r.href + r.title}>
                    <Link href={r.href} className="group block rounded-2xl border border-border-soft p-3 transition-colors hover:border-story-royal/40">
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold">{r.title}<Chip>{r.minutes} min/day</Chip></span>
                      <span className="mt-1 block text-xs leading-5 text-muted">{r.reason}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Recent reports</h2>
              <Link href="/practice/reports" className="text-sm font-semibold text-story-royal hover:underline">All reports</Link>
            </div>
            {overview.recent.length ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {overview.recent.map((r) => (
                  <li key={r.id}>
                    <Link href={`/practice/reports/${r.id}`} className="flex items-center gap-3 rounded-3xl border border-border-soft bg-surface p-4 hover:border-story-royal/40">
                      <FileText className="h-5 w-5 shrink-0 text-story-royal" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{r.title}</span><span className="text-xs text-muted">{MODULE_LABEL[r.module]} · {date(r.startedAt)}</span></span>
                      <span className="text-lg font-bold tabular-nums" style={{ color: r.score !== null ? bandColor(r.score) : undefined }}>{r.score ?? "—"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-muted">No reports yet. Start with an AI mock interview — it takes about 15 minutes.</p>}
          </section>
        </>
      ) : null}
    </Container>
  );
}
