import Link from "next/link";
import { ArrowRight, Award, Bell, BadgeCheck, Brain, CalendarClock, CheckCircle2, Code2, Eye, FileCheck2, Gauge, GraduationCap, Layers, ListChecks, Lock, MonitorUp, Scale, ShieldCheck, Shuffle, Timer, Trophy, UserPlus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { cn } from "@/lib/cn";
import type { PublicCompetition } from "@/lib/competition/server/competitions";
import { formatInZone, STATUS_LABEL } from "@/lib/competition/types";
import { ArenaPreview } from "./ArenaPreview";
import { BannerJourney, SpotlightBanner } from "./BannerJourney";
import { Countdown } from "./Countdown";
import { FormatCards } from "./FormatCards";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { GOLD_BUTTON, GOLD_SHINE } from "./styles";

type Me = { signedIn: boolean; registered: boolean; candidateId: string | null; attemptStatus: string | null };

const money = (amount: number, currency: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

/** The next moment that matters to a visitor, for the hero countdown. */
function milestone(c: PublicCompetition, now: number) {
  const t = (s: string) => new Date(s).getTime();
  if (now < t(c.registrationOpensAt)) return { label: "Registration opens in", at: c.registrationOpensAt };
  if (c.registrationOpen) return { label: "Registration closes in", at: c.registrationClosesAt };
  if (now < t(c.startsAt)) return { label: "Competition starts in", at: c.startsAt };
  if (now < t(c.endsAt)) return { label: "Competition window closes in", at: c.endsAt };
  if (!c.resultsPublished) return { label: "Results scheduled in", at: c.resultsPublishAt };
  return null;
}

function Primary({ c, me, now }: { c: PublicCompetition; me: Me; now: number }) {
  const base = "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[box-shadow,background-color,color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2";
  const ghost = cn(base, "border border-border-soft bg-surface text-foreground hover:border-story-royal/40");
  const arrow = <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />;
  const shine = <span aria-hidden="true" className={GOLD_SHINE} />;
  if (me.registered)
    return (
      <div className="flex flex-wrap gap-3">
        <Link href="/coding-competition/dashboard" className={GOLD_BUTTON}>{shine}Go to my dashboard {arrow}</Link>
        {c.status === "LIVE" && me.attemptStatus !== "FINALIZED" && <Link href="/coding-competition/instructions" className={ghost}>Start the competition</Link>}
      </div>
    );
  const opensLater = new Date(c.registrationOpensAt).getTime() > now;
  return (
    <div className="flex flex-wrap gap-3">
      {c.registrationOpen ? (
        <Link href="/coding-competition/register" className={GOLD_BUTTON}>{shine}Register now {arrow}</Link>
      ) : (
        <span aria-disabled="true" className={cn(GOLD_BUTTON, "cursor-default", !opensLater && "grayscale")}>
          {shine}
          <Bell className="h-4 w-4" />
          {opensLater ? `Registration opens ${formatInZone(c.registrationOpensAt, c.timezone, { year: undefined, timeZoneName: undefined })}` : "Registration closed"}
        </span>
      )}
      {!me.signedIn && <Link href="/coding-competition/login" className={ghost}>Student login</Link>}
    </div>
  );
}

function Fact({ icon: Icon, label, value, className }: { icon: typeof Timer; label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-border-soft bg-surface px-3.5 py-3", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-story-royal dark:bg-brand-900/30"><Icon className="h-4 w-4" /></span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</span>
        <span className="block truncate text-sm font-semibold">{value}</span>
      </span>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-story-royal">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{sub}</p>}
    </div>
  );
}

export function CompetitionLanding({ c, me, serverNow }: { c: PublicCompetition; me: Me; serverNow: string }) {
  const tz = c.timezone;
  const next = milestone(c, new Date(serverNow).getTime());
  const steps = [
    { icon: UserPlus, title: "Register in a minute", body: "Name, mobile, email and a password. Your student account and candidate ID are created instantly — no OTP." },
    { icon: Shuffle, title: "Get your own question set", body: `Every candidate receives a different, difficulty-balanced set of ${c.questionCount} questions, fixed before the start.` },
    { icon: MonitorUp, title: "Compete in the arena", body: `${c.durationMinutes} minutes in a browser IDE with server-side execution, full-screen and screen-share monitoring.` },
    { icon: Trophy, title: "Results & rewards", body: "Scores are published after evaluation and review. Certificates for participants, awards for the Top 3, a paid internship for first place." },
  ];
  const faqs = [
    { question: "Do I need an OTP or email verification to register?", answer: "No. Registration creates your MyLoginn student account immediately. Keep your password safe; if you forget it, use “Forgot password” on the login page." },
    { question: "Will everyone get the same questions?", answer: `No. Each candidate gets a different set built from a calibrated question bank: the same number of questions per difficulty, the same marks per slot (${c.maxScore} in total), and comparable expected solving time. Your set is fixed before the competition and does not change if you refresh or log in again.` },
    { question: "Which languages can I use?", answer: `${c.languages.map((l) => l.label).join(", ")}. You can switch language per question. Code runs on isolated judge servers, never in your browser.` },
    { question: "What happens if my internet drops or my browser closes?", answer: `Your code autosaves continuously. Reopen the arena to resume — the timer keeps running on the server and never resets. When time is up your latest saved answers are submitted automatically${c.autosaveCountsAsSubmission ? ", including autosaved code you did not explicitly submit" : ""}.` },
    { question: "How is my score calculated?", answer: `Each question is scored by hidden test cases on the server: you earn the question's marks in proportion to the tests passed.${c.negativeMarkPerWrong ? ` ${c.negativeMarkPerWrong} mark(s) are deducted for each answered question that scores zero.` : " There is no negative marking."} “Run” is for practice and never awards marks.` },
    { question: "Does the AI decide if I cheated?", answer: "No. Automated similarity analysis and monitoring only flag attempts for human review, and common algorithms or standard library use are not treated as evidence. Penalties are applied only by an authorised reviewer with a recorded reason, and you can appeal from your dashboard." },
    { question: "Is the internship a job offer?", answer: c.reward ? `It is an internship offer with a stipend (${money(c.reward.stipendAmount, c.reward.stipendCurrency)} ${c.reward.stipendPeriod}, ${c.reward.durationText}), not a permanent job. It is made to the first-place candidate after final results, integrity review and verification of the published eligibility criteria.` : "The internship terms will be published before registration opens." },
    { question: "Can I use my phone?", answer: "Registration and results work on any device. The competition itself needs a desktop or laptop browser that supports full-screen screen sharing (recent Chrome, Edge or Firefox)." },
  ];

  return (
    <div className="overflow-x-clip [&_li]:text-left [&_li]:hyphens-manual">
      {/* ───────── Hero ───────── */}
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(47,111,237,0.14),transparent_60%),radial-gradient(40rem_24rem_at_0%_10%,rgba(34,211,238,0.10),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-start gap-8 px-4 pb-10 pt-6 sm:px-8 sm:pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-story-royal dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
              <span className="relative flex h-2 w-2">
                {c.status === "LIVE" || c.registrationOpen ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" /> : null}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", c.status === "LIVE" || c.registrationOpen ? "bg-emerald-500" : "bg-brand-400")} />
              </span>
              MyLoginn Learn · {c.registrationOpen ? "Registration open" : c.status === "REGISTRATION_OPEN" && new Date(serverNow) < new Date(c.registrationOpensAt) ? "Registration opens soon" : STATUS_LABEL[c.status]}
            </span>
            <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-5xl">
              {c.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">{c.description || "A live, monitored coding competition with a unique question set for every candidate, server-side judging and published, reviewable results."}</p>

            <div className="mt-6 grid gap-2.5 min-[460px]:grid-cols-2">
              <Fact icon={CalendarClock} label="Starts" value={formatInZone(c.startsAt, tz, { year: undefined })} />
              <Fact icon={Timer} label="Duration" value={`${c.durationMinutes} minutes · ${c.questionCount} questions`} />
              <Fact className="min-[460px]:col-span-2" icon={Code2} label="Languages" value={c.languages.map((l) => l.label.replace(/ \(.*\)/, "")).join(", ")} />
            </div>

            <div className="mt-7"><Primary c={c} me={me} now={new Date(serverNow).getTime()} /></div>
            {me.registered && me.candidateId && <p className="mt-3 text-sm text-muted">You are registered as <b className="text-foreground">{me.candidateId}</b>.</p>}

          </div>
          <div className="relative">
            {next && (
              <div className="mb-4 flex flex-col items-start sm:items-end">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted">{next.label}</p>
                <Countdown compact target={next.at} serverNow={serverNow} done={<p className="text-sm font-semibold text-story-royal">Updating… refresh the page.</p>} />
              </div>
            )}
            <ArenaPreview />
            <p className="mt-2 text-center text-xs text-muted">Preview of the competition arena</p>
          </div>
        </div>
      </section>

      {/* ───────── Timeline ───────── */}
      <section className="border-y border-border-soft bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="How it works" title="From registration to results" />
          <div role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div role="listitem" className="group relative h-full rounded-3xl border border-border-soft bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-story-royal text-white transition-transform duration-300 group-hover:scale-105"><s.icon className="h-5 w-5" /></span>
                    <span className="text-3xl font-black text-brand-100 dark:text-brand-900">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <ScheduleTimeline
              tz={tz}
              nowMs={new Date(serverNow).getTime()}
              items={[
                { key: "registration", label: "Registration", when: `${formatInZone(c.registrationOpensAt, tz)} – ${formatInZone(c.registrationClosesAt, tz)}`, startMs: new Date(c.registrationOpensAt).getTime(), endMs: new Date(c.registrationClosesAt).getTime() },
                { key: "window", label: "Competition window", when: `${formatInZone(c.startsAt, tz)} – ${formatInZone(c.endsAt, tz)}`, note: `Join within ${c.lateJoinMinutes} min of the start`, startMs: new Date(c.startsAt).getTime(), endMs: new Date(c.endsAt).getTime() },
                { key: "results", label: "Results", when: formatInZone(c.resultsPublishAt, tz), note: "After evaluation and review", startMs: new Date(c.resultsPublishAt).getTime(), endMs: new Date(c.resultsPublishAt).getTime() },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ───────── Format ───────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="Format" title={`${c.questionCount} questions · ${c.maxScore} marks`} sub="Marks belong to the difficulty slot, not the question, so every candidate's set is worth exactly the same." />
          <FormatCards slots={c.blueprint.map((x) => ({ difficulty: x.difficulty, count: x.count, marks: x.marks }))} maxScore={c.maxScore} languages={c.languages.map((l) => ({ key: l.key, label: l.label }))} />
        </div>
      </section>

      {/* ───────── Rewards ───────── */}
      <section className="border-y border-border-soft bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="Rewards" title="Certificates for participants. A paid internship for the winner." />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <div className="relative h-full overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-6 dark:border-amber-900/60 dark:from-amber-950/30 dark:via-surface dark:to-surface">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-amber-950"><GraduationCap className="h-6 w-6" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">First place</p>
                    <p className="text-lg font-bold">Internship offer with stipend</p>
                  </div>
                </div>
                {c.reward ? (
                  <>
                    <dl className="mt-5 grid gap-3 text-sm min-[460px]:grid-cols-2">
                      {[
                        ["Role", c.reward.role],
                        ["Stipend", `${money(c.reward.stipendAmount, c.reward.stipendCurrency)} ${c.reward.stipendPeriod}`],
                        ["Duration", c.reward.durationText],
                        ["Work mode", `${c.reward.workMode}${c.reward.location ? ` · ${c.reward.location}` : ""}`],
                        ...(c.reward.expectedStartDate ? [["Expected start", formatInZone(c.reward.expectedStartDate, tz, { hour: undefined, minute: undefined, timeZoneName: undefined })]] : []),
                        ["Offer valid for", `${c.reward.offerValidDays} days after it is sent`],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-100 dark:bg-white/5 dark:ring-amber-900/40">
                          <dt className="text-xs text-muted">{k}</dt>
                          <dd className="mt-0.5 font-semibold">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-sm leading-6"><b>Eligibility:</b> {c.reward.eligibility}</p>
                    {c.reward.requiredDocuments && <p className="mt-1 text-sm leading-6"><b>Documents:</b> {c.reward.requiredDocuments}</p>}
                    <p className="mt-4 rounded-2xl bg-white/70 p-3 text-xs leading-5 text-muted ring-1 ring-amber-100 dark:bg-white/5 dark:ring-amber-900/40">
                      An internship with a stipend, not a permanent job. The offer is made after final results and integrity review, subject to verifying the eligibility criteria above, and is approved by MyLoginn Tech before it is sent.
                    </p>
                  </>
                ) : (
                  <p className="mt-5 text-sm text-muted">The internship terms will be published here before registration opens.</p>
                )}
              </div>
            </Reveal>
            <div className="grid gap-4">
              {[
                { icon: Award, title: "Winner, Runner-up & Second Runner-up", body: "Distinct award certificates for ranks 1–3 of the final, approved ranking.", tone: "text-amber-600" },
                { icon: FileCheck2, title: "Participation certificate", body: `For every candidate who completes the competition with at least one answer${c.certificateMinPercent ? ` and ${c.certificateMinPercent}% of the marks` : ""}, unless disqualified after review.`, tone: "text-story-royal" },
                { icon: BadgeCheck, title: "Verifiable online", body: "Each certificate carries a unique ID and QR code that anyone can verify on myloginn.com.", tone: "text-emerald-600" },
              ].map((x, i) => (
                <Reveal key={x.title} delay={i * 0.06}>
                  <div className="flex gap-4 rounded-3xl border border-border-soft bg-surface p-5">
                    <x.icon className={cn("mt-0.5 h-6 w-6 shrink-0", x.tone)} />
                    <div>
                      <p className="font-semibold">{x.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{x.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Fairness ───────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="Evaluation & fairness" title="Scored by tests. Reviewed by people." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ListChecks, title: "Hidden test cases", body: "Your final answers run against hidden tests on isolated judge servers. Marks scale with the tests you pass." },
              { icon: Layers, title: "Balanced unique sets", body: "Different questions per candidate, matched on difficulty, marks and calibrated solving time." },
              { icon: Brain, title: "AI-assisted review", body: "Similarity and monitoring analysis flag attempts for human review. It never assigns or deducts marks." },
              { icon: Scale, title: "Transparent ties", body: c.tieBreak.join(" ") },
            ].map((x, i) => (
              <Reveal key={x.title} delay={i * 0.05}>
                <div className="group h-full rounded-3xl border border-border-soft bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]">
                  <x.icon className="h-6 w-6 text-story-royal" />
                  <p className="mt-3 font-semibold">{x.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{x.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-6 grid gap-6 rounded-3xl border border-border-soft bg-surface p-6 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <div className="flex items-center gap-2 text-story-royal"><ShieldCheck className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-wider">Anti-cheating policy</p></div>
                <p className="mt-2 text-lg font-bold">Clear rules, published in advance</p>
                <p className="mt-2 text-sm leading-6 text-muted">The arena records browser events with server timestamps. These are signals, not proof: they lead to human review, never to automatic penalties.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  {c.screenShareRequired && <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5"><MonitorUp className="h-3.5 w-3.5" /> Entire-screen sharing</span>}
                  {c.fullscreenRequired && <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5"><Gauge className="h-3.5 w-3.5" /> Full screen</span>}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5"><Eye className="h-3.5 w-3.5" /> No recording of your screen</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5"><Lock className="h-3.5 w-3.5" /> No webcam or microphone</span>
                </div>
                <Link href="/coding-competition/rules" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal hover:underline">Read the full rules and privacy notice <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <ul className="space-y-2.5">
                {c.monitoringRules.map((r) => (
                  <li key={r} className="flex gap-2.5 text-sm leading-6"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{r}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Eligibility + FAQ ───────── */}
      <section className="border-t border-border-soft bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-story-royal">Eligibility</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Who can take part</h2>
            <ul className="mt-4 space-y-2.5 [&_:is(p,li)]:text-left [&_:is(p,li)]:hyphens-manual">
              {(c.eligibility || "Open to students and recent graduates with a valid email address and mobile number. One registration per person.")
                .split(/\n+|(?<=[.!?])\s+/)
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => (
                  <li key={t} className="flex items-start gap-3 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm leading-6 transition-colors duration-300 hover:border-story-royal/40">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-story-royal" />
                    <span>{t}</span>
                  </li>
                ))}
            </ul>
            <div className="mt-6 rounded-3xl border border-story-royal/20 bg-surface p-5">
              <p className="font-semibold">Ready to compete?</p>
              <p className="mt-1 text-sm text-muted">{c.seatsLeft > 0 ? "Register to reserve your place." : "All seats are taken."}</p>
              <div className="mt-4"><Primary c={c} me={me} now={new Date(serverNow).getTime()} /></div>
            </div>
          </div>
          <div>
            <h2 className="mb-5 text-2xl font-bold tracking-tight">Frequently asked questions</h2>
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Shown before a competition is configured. A full registration banner with the interactive journey, but nothing
 * invented: no dates, stipend amounts or counters until an administrator publishes them.
 */
export function NoCompetition({ signedIn = false }: { signedIn?: boolean }) {
  const steps = [
    { icon: UserPlus, title: "Register in a minute", body: "Name, mobile, email and a password. Your student account and candidate ID are created instantly — no OTP." },
    { icon: Shuffle, title: "Get your own question set", body: "Every candidate receives a different, difficulty-balanced set, fixed before the start." },
    { icon: MonitorUp, title: "Compete in the arena", body: "A browser IDE with server-side execution, full-screen and screen-share monitoring." },
    { icon: Trophy, title: "Results & rewards", body: "Published after evaluation and human review, with certificates and a paid internship for first place." },
  ];
  const solid = GOLD_BUTTON;
  const ghost = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10";
  return (
    <div className="overflow-x-clip [&_li]:text-left [&_li]:hyphens-manual">
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-8 sm:pt-10">
        <SpotlightBanner className="rounded-[2rem] bg-gradient-to-br from-[#0b1f4d] via-[#16337e] to-[#1f56d6] p-6 text-white shadow-[var(--shadow-lift)] sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-px opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="[&_p]:text-left [&_p]:hyphens-manual">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Trophy className="h-3.5 w-3.5" /> MyLoginn Learn</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-200/30">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" /></span>
                  Registration opens soon
                </span>
              </div>
              <h1 className="mt-5 text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">MyLoginn Coding Competition</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">Solve real problems live, ranked fairly on hidden tests. Earn verifiable certificates — and a paid internship for the winner.</p>

              <div className="mt-6 grid gap-2.5 min-[460px]:grid-cols-2">
                {[
                  { icon: Shuffle, t: "Unique balanced question set" },
                  { icon: Code2, t: "Python, Java, C++ & JavaScript" },
                  { icon: ShieldCheck, t: "Server-side judging" },
                  { icon: GraduationCap, t: "Paid internship for first place" },
                ].map(({ icon: Icon, t }) => (
                  <span key={t} className="flex items-center gap-2.5 rounded-2xl bg-white/[0.07] px-3.5 py-3 text-sm ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10"><Icon className="h-4 w-4 text-cyan-200" /></span>
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {signedIn ? (
                  <Link href="/logiquest" className={solid}><span aria-hidden="true" className={GOLD_SHINE} />Practise coding now <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
                ) : (
                  <Link href="/signup" className={solid}><span aria-hidden="true" className={GOLD_SHINE} />Create your free account <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
                )}
                <Link href={signedIn ? "/courses" : "/logiquest"} className={ghost}>{signedIn ? "Browse courses" : "Practise on LogiQuest"}</Link>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-white/60"><CalendarClock className="h-3.5 w-3.5 shrink-0" /> Dates, seats and the internship stipend are published here before registration opens.</p>
            </div>
            <div className="lg:pl-4">
              <BannerJourney reward={null} />
            </div>
          </div>
        </SpotlightBanner>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="How it works" title="From registration to results" />
          <div role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div role="listitem" className="group relative h-full rounded-3xl border border-border-soft bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-story-royal text-white transition-transform duration-300 group-hover:scale-105"><s.icon className="h-5 w-5" /></span>
                    <span className="text-3xl font-black text-brand-100 dark:text-brand-900">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border-soft bg-surface-2/60 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionHead eyebrow="Rewards" title="What you can win" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Paid internship", body: "An internship offer with a stipend for the first-place candidate, after final results and eligibility checks. Role, stipend and duration are published before registration opens.", tone: "text-amber-600" },
              { icon: Award, title: "Top 3 award certificates", body: "Winner, Runner-up and Second Runner-up certificates from the approved final ranking.", tone: "text-story-royal" },
              { icon: BadgeCheck, title: "Verifiable participation", body: "Every eligible participant gets a certificate with a unique ID and QR code anyone can verify.", tone: "text-emerald-600" },
            ].map((x, i) => (
              <Reveal key={x.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-border-soft bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]">
                  <x.icon className={cn("h-7 w-7", x.tone)} />
                  <p className="mt-3 text-lg font-semibold">{x.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{x.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
