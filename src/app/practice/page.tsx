import Link from "next/link";
import { ArrowRight, AudioLines, FileText, Mic2, PlayCircle, Sparkles, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
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
  { href: "/practice/interview", title: "AI Mock Interview", desc: "Answer out loud. Get follow-up questions based on what you actually said.", detail: "A realistic interview, at your pace", Icon: Mic2, color: "#9EC5FF", surface: "bg-[#18345F]", action: "Start an interview", featured: true },
  { href: "/practice/gd", title: "Group Discussion", desc: "Join a voice room, share the topic and practise making your point.", detail: "Practise together", Icon: Users, color: "#7357DB", surface: "bg-[#F2EEFF]", action: "Open discussion practice" },
  { href: "/practice/speaking", title: "Verbal Communication", desc: "Build listening and speaking skills through stories, pictures and spoken grammar.", detail: "Listen and respond", Icon: AudioLines, color: "#087F69", surface: "bg-[#E8F6F1]", action: "Explore speaking practice" },
  { href: "/practice/speaking?group=fluency", title: "Fluency & Pronunciation", desc: "Work on pace, filler words and pronunciation with focused speaking exercises.", detail: "Find your speaking rhythm", Icon: Sparkles, color: "#C05A2B", surface: "bg-[#FFF1E9]", action: "Practise fluency" },
];

const AREAS: Area[] = ["interview", "communication", "fluency", "technical", "gd"];
const date = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function PracticeHome() {
  const user = await getCurrentUser();
  const overview = user ? await getPracticeOverview(user.id) : null;

  return (
    <Container className="max-w-7xl space-y-8 py-6 sm:py-10">
      <header className="relative isolate overflow-hidden rounded-[2rem] bg-[#10264A] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#1F56D6]/30 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#B9D2FF]">Practice room</p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Get comfortable before the real conversation.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7">
              Practise interviews, discussions and spoken English. Get clear feedback and know what to work on next.
            </p>
            <Link href="/practice/interview" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#10264A] transition-colors hover:bg-[#E9F1FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10264A]">
              Start with an interview <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold text-[#B9D2FF]">A question to get started</p>
            <p className="mt-3 text-lg font-semibold leading-7 sm:text-xl">“Tell me about a project you’re proud of.”</p>
            <div className="mt-6 flex h-10 items-center gap-1.5" aria-hidden="true">
              {[12, 20, 28, 16, 34, 24, 14, 30, 20, 36, 16, 26, 12, 22, 32, 18, 27, 13, 30, 20, 11, 24, 16, 31, 19, 12, 28, 18].map((height, index) => (
                <span key={index} className="w-1.5 rounded-full bg-[#8DE4CE]" style={{ height }} />
              ))}
            </div>
            <p className="mt-2 text-xs text-blue-100/65">Take a moment. Then answer in your own words.</p>
          </div>
        </div>
      </header>

      {overview?.active.length ? (
        <Card className="flex flex-wrap items-center gap-3 border-story-royal/30 bg-story-royal/5">
          <PlayCircle className="h-5 w-5 text-story-royal" />
          <p className="text-sm font-semibold">Continue where you left off:</p>
          {overview.active.map((a) => <Link key={a.id} href={`/practice/${a.module === "INTERVIEW" ? "interview" : "speaking"}/${a.id}`} className="rounded-full border border-story-royal/30 bg-surface px-3 py-1 text-sm font-medium hover:border-story-royal">{a.title}</Link>)}
        </Card>
      ) : null}

      <section aria-labelledby="practice-options-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="practice-options-title" className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl">Choose what to practise</h2>
            <p className="mt-1.5 text-sm text-muted">Pick one skill and start where you are.</p>
          </div>
          {user ? <Link href="/practice/reports" className="text-sm font-semibold text-story-royal hover:underline">View your reports</Link> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODULES.map(({ href, title, desc, detail, Icon, color, surface, action, featured }) => (
            <Link
              key={href}
              href={href}
              className={`group flex min-h-56 flex-col rounded-3xl p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:p-6 ${featured ? "bg-[#18345F] text-white" : `border border-border-soft ${surface} text-story-navy`}`}
            >
              <span className="flex items-start justify-between gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${featured ? "bg-white/10" : "bg-white/80"}`} style={{ color }}>
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${featured ? "bg-white/10 text-blue-100" : "bg-white/75 text-muted"}`}>{detail}</span>
              </span>
              <span className="mt-5 block text-lg font-bold">{title}</span>
              <span className={`mt-2 block max-w-md text-sm leading-6 ${featured ? "text-blue-100/80" : "text-muted"}`}>{desc}</span>
              <span className={`mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold ${featured ? "text-white" : "text-story-royal"}`}>
                {action}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
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
