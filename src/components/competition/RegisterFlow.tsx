"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isValidPhoneNumber } from "libphonenumber-js";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, CheckCircle2, Copy, Loader2, Lock, Mail, MonitorUp, ShieldCheck, Shuffle, Timer, Trophy, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { api, ApiFailure } from "./client";
import { BannerJourney, CountUp, SpotlightBanner } from "./BannerJourney";
import { Countdown } from "./Countdown";
import { GOLD_BUTTON, GOLD_SHINE } from "./styles";

export type RegisterCompetition = {
  title: string;
  timezone: string;
  startsAt: string;
  endsAt: string;
  registrationClosesAt: string;
  resultsPublishAt: string;
  durationMinutes: number;
  questionCount: number;
  maxScore: number;
  registrationCount: number;
  maxParticipants: number;
  registrationOpen: boolean;
  screenShareRequired: boolean;
  reward: { role: string; stipendAmount: number; stipendCurrency: string; stipendPeriod: string; durationText: string } | null;
};

type Fields = { name: string; email: string; phone: string; password: string; confirmPassword: string; acceptRules: boolean };
type Errors = Partial<Record<keyof Fields | "form", string>>;

const NAME_RE = /^\p{L}[\p{L}\p{M}\s.'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (iso: string, tz: string) => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: tz, timeZoneName: "short" }).format(new Date(iso));
const money = (n: number, c: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

function passwordChecks(p: string) {
  return [
    { label: "8+ characters", ok: p.length >= 8 },
    { label: "An uppercase letter", ok: /[A-Z]/.test(p) },
    { label: "A number", ok: /[0-9]/.test(p) },
    { label: "A symbol (stronger)", ok: /[^A-Za-z0-9]/.test(p) },
  ];
}

function validate(step: number, f: Fields, existing: boolean): Errors {
  const e: Errors = {};
  if (!existing && step === 0) {
    if (f.name.trim().length < 2) e.name = "Enter your full name";
    else if (!NAME_RE.test(f.name.trim())) e.name = "Use letters only (spaces, dots and hyphens are fine)";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address";
  }
  if (step === 0 && !(f.phone && isValidPhoneNumber(f.phone))) e.phone = "Enter a valid mobile number with country code";
  if (!existing && step === 1) {
    const c = passwordChecks(f.password);
    if (!c[0].ok || !c[1].ok || !c[2].ok) e.password = "Use 8+ characters with an uppercase letter and a number";
    if (!f.confirmPassword) e.confirmPassword = "Confirm your password";
    else if (f.password !== f.confirmPassword) e.confirmPassword = "Passwords do not match";
  }
  if (step === (existing ? 1 : 2) && !f.acceptRules) e.acceptRules = "Accept the rules and privacy notice to register";
  return e;
}

const FIELD_STEP: Record<string, number> = { name: 0, email: 0, phone: 0, password: 1, confirmPassword: 1, acceptRules: 2 };

function icsFile(c: RegisterCompetition) {
  const z = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyLoginn Tech//Coding Competition//EN",
    "BEGIN:VEVENT",
    `UID:${z(c.startsAt)}-coding-competition@myloginn.com`,
    `DTSTAMP:${z(new Date().toISOString())}`,
    `DTSTART:${z(c.startsAt)}`,
    `DTEND:${z(c.endsAt)}`,
    `SUMMARY:${c.title}`,
    "DESCRIPTION:Join from a desktop or laptop: https://www.myloginn.com/coding-competition/instructions",
    "URL:https://www.myloginn.com/coding-competition/dashboard",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Coding competition starts in 30 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Registration progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span className={cn("relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300", done ? "bg-story-royal text-white" : active ? "bg-story-royal/10 text-story-royal ring-2 ring-story-royal" : "bg-surface-2 text-muted")}>
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span key="d" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.2 }}><Check className="h-4 w-4" /></motion.span>
                ) : (
                  <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{i + 1}</motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className={cn("hidden truncate text-xs font-semibold sm:block", active ? "text-foreground" : "text-muted")}>{label}</span>
            {i < steps.length - 1 && (
              <span className="relative h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-border-soft">
                <motion.span className="absolute inset-y-0 left-0 bg-story-royal" initial={false} animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.45, ease: EASE }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const checks = passwordChecks(password);
  const score = password ? checks.filter((c) => c.ok).length : 0;
  const colors = ["bg-border-soft", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.span className={cn("block h-full rounded-full", colors[score])} initial={false} animate={{ width: i < score ? "100%" : "0%" }} transition={{ duration: 0.3, delay: i * 0.04 }} />
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <li key={c.label} className={cn("flex items-center gap-1 text-xs transition-colors", c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted")}>
              <motion.span initial={false} animate={{ scale: c.ok ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.25 }}>
                {c.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="block h-3.5 w-3.5 rounded-full border border-current" />}
              </motion.span>
              {c.label}
            </li>
          ))}
        </ul>
        {score > 0 && <span className="text-xs font-semibold" aria-live="polite">{labels[score]}</span>}
      </div>
    </div>
  );
}

function Success({ candidateId, c, name }: { candidateId: string; c: RegisterCompetition; name: string }) {
  const [copied, setCopied] = useState(false);
  const ics = useMemo(() => `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFile(c))}`, [c]);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="text-center">
      <svg viewBox="0 0 64 64" className="mx-auto h-20 w-20" aria-hidden="true">
        <motion.circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-500" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE }} />
        <motion.path d="M20 33 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease: EASE }} />
      </svg>
      <h2 className="mt-4 text-2xl font-bold">You&apos;re registered, {name.split(" ")[0]}!</h2>
      <p className="mt-2 text-sm text-muted">Your student account is ready and you are signed in.</p>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, duration: 0.45, ease: EASE }} className="relative mx-auto mt-6 max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1f4d] via-[#1a44ab] to-[#1f56d6] p-5 text-left text-white shadow-[var(--shadow-lift)]">
        <div aria-hidden="true" className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-cyan-300/15" />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Candidate ID</p>
        <div className="relative mt-1 flex items-center justify-between gap-3">
          <p className="font-mono text-2xl font-bold tracking-wide">{candidateId}</p>
          <button type="button" onClick={() => navigator.clipboard?.writeText(candidateId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })} className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25" aria-label="Copy candidate ID">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="relative mt-4 border-t border-dashed border-white/25 pt-3 text-sm">
          <p className="font-semibold">{c.title}</p>
          <p className="mt-0.5 text-white/75">{fmt(c.startsAt, c.timezone)} · {c.durationMinutes} min</p>
        </div>
      </motion.div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/coding-competition/dashboard" className={GOLD_BUTTON}>
          <span aria-hidden="true" className={GOLD_SHINE} />
          Go to my dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <a href={ics} download="myloginn-coding-competition.ics" className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-5 py-3 text-sm font-semibold hover:border-story-royal/40">
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </a>
      </div>
      <p className="mt-5 text-xs text-muted">Before the start, run the <Link href="/coding-competition/instructions" className="font-semibold text-story-royal hover:underline">system check</Link> on the laptop you will use.</p>
    </motion.div>
  );
}

export function RegisterFlow({ c, signedIn, serverNow }: { c: RegisterCompetition; signedIn: { name: string; email: string; phone: string | null } | null; serverNow: string }) {
  const existing = !!signedIn;
  const steps = existing ? ["Mobile number", "Rules & consent"] : ["Your details", "Secure account", "Rules & consent"];
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  // PhoneInput owns its display state and does not render a prefilled value, so the number is always typed here.
  const [f, setF] = useState<Fields>({ name: signedIn?.name ?? "", email: signedIn?.email ?? "", phone: "", password: "", confirmPassword: "", acceptRules: false });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const reduced = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    // While typing, a field shows no live error; it is re-checked on blur or on Continue.
    if (touched[k] && k !== "acceptRules") setTouched((t) => ({ ...t, [k]: false }));
  };
  const live = validate(step, f, existing);
  const fieldError = (k: keyof Fields) => errors[k] ?? (touched[k] ? live[k] : undefined);
  const lastStep = steps.length - 1;
  const registered = c.registrationCount + (done ? 1 : 0);
  const seatsPct = Math.min(100, Math.round((registered / Math.max(1, c.maxParticipants)) * 100));

  function go(to: number) {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setErrors({});
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("input:not([type=hidden]),button[data-primary]")?.focus({ preventScroll: true }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(step, f, existing);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(errs).map((k) => [k, true])) }));
      return;
    }
    if (step < lastStep) return go(step + 1);
    setBusy(true);
    setErrors({});
    setAccountExists(false);
    try {
      const body = existing ? { phone: f.phone, acceptRules: f.acceptRules } : { ...f, name: f.name.trim(), email: f.email.trim() };
      const r = await api<{ candidateId: string }>("/api/coding-competition/register", { body });
      setDone(r.candidateId);
      if (!reduced) import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 140, spread: 75, origin: { y: 0.35 }, colors: ["#1f56d6", "#22d3ee", "#f59e0b", "#16a34a"] }));
    } catch (err) {
      const fail = err instanceof ApiFailure ? err : new ApiFailure("Registration failed. Please try again.", 0);
      if (fail.code === "ACCOUNT_EXISTS") {
        setAccountExists(true);
        go(0);
        setErrors({ email: fail.message });
      } else if (fail.code === "DUPLICATE_PHONE") {
        go(0);
        setErrors({ phone: fail.message });
      } else if (fail.code?.startsWith("FIELD:")) {
        const field = fail.code.slice(6) as keyof Fields;
        go(existing ? 0 : FIELD_STEP[field] ?? 0);
        setErrors({ [field]: fail.message });
      } else setErrors({ form: fail.message });
    } finally {
      setBusy(false);
    }
  }

  const slide = {
    enter: (d: number) => (reduced ? { opacity: 0 } : { x: d * 36, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => (reduced ? { opacity: 0 } : { x: d * -36, opacity: 0 }),
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 [&_:is(p,li)]:text-left [&_:is(p,li)]:hyphens-manual">
      {/* Summary panel */}
      <SpotlightBanner className="rounded-[1.75rem] bg-gradient-to-br from-[#0b1f4d] via-[#16337e] to-[#1f56d6] p-6 text-white shadow-[var(--shadow-lift)] sm:p-8 lg:sticky lg:top-32 lg:self-start">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-px opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_75%)]" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Trophy className="h-3.5 w-3.5" /> MyLoginn Learn</span>
            {c.registrationOpen && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span>
                Registration open
              </span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">{c.title}</h1>
          <p className="mt-1.5 text-sm text-white/75">{fmt(c.startsAt, c.timezone)}</p>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span><b className="text-lg tabular-nums"><CountUp value={registered} /></b> <span className="text-white/75">registered</span></span>
                <span className="text-xs text-white/65"><CountUp value={Math.max(0, c.maxParticipants - registered)} /> seats left</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                <motion.div className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 to-white" initial={{ width: 0 }} animate={{ width: `${Math.max(2, seatsPct)}%` }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }} />
              </div>
            </div>
          </div>

          {c.registrationOpen && !done && (
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/60">Registration closes in</p>
              <Countdown target={c.registrationClosesAt} serverNow={serverNow} compact tone="dark" />
            </div>
          )}

          <div className="mt-6"><BannerJourney reward={c.reward ? `${money(c.reward.stipendAmount, c.reward.stipendCurrency)} ${c.reward.stipendPeriod}` : null} /></div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            {[
              { icon: Timer, t: `${c.durationMinutes} min · ${c.questionCount} questions` },
              { icon: Shuffle, t: "Unique balanced set" },
              { icon: MonitorUp, t: c.screenShareRequired ? "Laptop + screen share" : "Desktop or laptop" },
              { icon: ShieldCheck, t: "Human-reviewed results" },
            ].map(({ icon: Icon, t }) => (
              <span key={t} className="flex items-center gap-2 rounded-xl bg-white/[0.07] px-2.5 py-2 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"><Icon className="h-3.5 w-3.5 shrink-0 text-cyan-200" /><span className="text-white/90">{t}</span></span>
            ))}
          </div>

          {c.reward && (
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-300/20 to-white/5 p-4 ring-1 ring-amber-200/30">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200">First-place reward</p>
              <p className="mt-1 font-semibold">{c.reward.role}</p>
              <p className="text-sm text-white/80">{money(c.reward.stipendAmount, c.reward.stipendCurrency)} {c.reward.stipendPeriod} · {c.reward.durationText}</p>
              <p className="mt-1.5 text-xs text-white/60">Internship offer subject to the published eligibility criteria.</p>
            </div>
          )}
        </div>
      </SpotlightBanner>

      {/* Form */}
      <div className="rounded-[1.75rem] border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-8">
        {done ? (
          <Success candidateId={done} c={c} name={f.name || signedIn?.name || ""} />
        ) : !c.registrationOpen ? (
          <div className="py-10 text-center">
            <Lock className="mx-auto h-10 w-10 text-muted" />
            <h2 className="mt-4 text-xl font-bold">Registration is not open</h2>
            <p className="mt-2 text-sm text-muted">{c.registrationCount >= c.maxParticipants ? "All seats have been taken." : "Check the competition page for the registration dates."}</p>
            <Link href="/coding-competition" className="mt-6 inline-flex rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold">Back to the competition</Link>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-story-royal">Step {step + 1} of {steps.length}</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">{steps[step]}</h2>
              </div>
              {!existing && <p className="hidden text-right text-xs text-muted sm:block">Already have an account?<br /><Link href="/coding-competition/login?next=%2Fcoding-competition%2Fregister" className="font-semibold text-story-royal hover:underline">Log in to register</Link></p>}
            </div>
            <div className="mt-5"><Stepper steps={steps} current={step} /></div>

            <form ref={formRef} onSubmit={submit} noValidate className="mt-7">
              <div className="relative min-h-[18rem] overflow-hidden px-0.5 pb-1">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: EASE }} className="space-y-5">
                    {step === 0 && (
                      <>
                        {existing ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-2 p-4">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-story-royal text-sm font-bold text-white">{signedIn!.name.slice(0, 1).toUpperCase()}</span>
                            <div className="min-w-0"><p className="truncate font-semibold">{signedIn!.name}</p><p className="truncate text-sm text-muted">{signedIn!.email}</p></div>
                            <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Signed in</span>
                          </div>
                        ) : (
                          <>
                            <Input id="cc-name" label="Full name" autoComplete="name" icon={<User className="h-4 w-4" />} value={f.name} onChange={(e) => set("name", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} error={fieldError("name")} valid={touched.name && !live.name} hint="As it should appear on your certificate" maxLength={80} />
                            <Input id="cc-email" label="Email address" type="email" autoComplete="email" inputMode="email" icon={<Mail className="h-4 w-4" />} value={f.email} onChange={(e) => { set("email", e.target.value); setAccountExists(false); }} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={fieldError("email")} valid={touched.email && !live.email} />
                            <AnimatePresence>
                              {accountExists && (
                                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="-mt-2 text-sm">
                                  <Link href="/coding-competition/login?next=%2Fcoding-competition%2Fregister" className="font-semibold text-story-royal hover:underline">Log in with this email</Link> to register using your existing MyLoginn account.
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                        <PhoneInput label="Mobile number" value={f.phone} onChange={(v) => set("phone", v)} onBlur={() => setTouched((t) => ({ ...t, phone: true }))} error={fieldError("phone")} valid={touched.phone && !live.phone} hint="Used only for competition communication. Never shown publicly." />
                      </>
                    )}

                    {step === 1 && !existing && (
                      <>
                        <div>
                          <PasswordInput id="cc-password" label="Create a password" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={fieldError("password")} />
                          <StrengthMeter password={f.password} />
                        </div>
                        <div>
                          <PasswordInput id="cc-confirm" label="Confirm password" autoComplete="new-password" value={f.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))} error={fieldError("confirmPassword")} />
                          <AnimatePresence>
                            {f.confirmPassword && f.confirmPassword === f.password && (
                              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="flex gap-2 rounded-2xl bg-surface-2 p-3.5 text-xs leading-5 text-muted"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />This creates a MyLoginn student account. Your password is stored only as a secure hash. No OTP or email verification is needed.</p>
                      </>
                    )}

                    {step === lastStep && (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            { icon: Shuffle, t: "Your own question set", d: "Fixed before the start; refreshing never changes it." },
                            { icon: Timer, t: "Server-timed, auto-submitted", d: "The timer runs on the server. Your saved code is submitted when time is up." },
                            { icon: MonitorUp, t: "Monitored attempt", d: "Tab switches, full-screen exits and screen-share stops are recorded and may lead to review." },
                            { icon: Trophy, t: "Results after review", d: `Published ${fmt(c.resultsPublishAt, c.timezone)}, not immediately.` },
                          ].map(({ icon: Icon, t, d }, i) => (
                            <motion.div key={t} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.3 }} className="rounded-2xl border border-border-soft p-3.5">
                              <Icon className="h-4 w-4 text-story-royal" />
                              <p className="mt-2 text-sm font-semibold">{t}</p>
                              <p className="mt-0.5 text-xs leading-5 text-muted">{d}</p>
                            </motion.div>
                          ))}
                        </div>
                        <label className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors", f.acceptRules ? "border-story-royal/50 bg-story-royal/5" : fieldError("acceptRules") ? "border-danger/50" : "border-border-soft hover:border-story-royal/30")}>
                          <input type="checkbox" checked={f.acceptRules} onChange={(e) => set("acceptRules", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--story-royal)]" />
                          <span className="text-sm leading-6">
                            I have read and accept the <Link href="/coding-competition/rules" target="_blank" className="font-semibold text-story-royal hover:underline">competition rules</Link> and the <Link href="/coding-competition/rules#privacy" target="_blank" className="font-semibold text-story-royal hover:underline">monitoring &amp; privacy notice</Link>, and I will compete on my own.
                          </span>
                        </label>
                        {fieldError("acceptRules") && <p role="alert" className="-mt-3 text-xs font-medium text-danger">{fieldError("acceptRules")}</p>}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {errors.form && <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{errors.form}</motion.p>}
              </AnimatePresence>

              <div className="mt-6 flex items-center gap-3">
                {step > 0 && (
                  <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
                <button data-primary type="submit" disabled={busy} className={cn(GOLD_BUTTON, "ml-auto min-w-40")}>
                  <span aria-hidden="true" className={GOLD_SHINE} />
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</> : step < lastStep ? <>Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></> : <>Complete registration <Check className="h-4 w-4" /></>}
                </button>
              </div>
              {!existing && <p className="mt-5 text-center text-xs text-muted sm:hidden">Already have an account? <Link href="/coding-competition/login?next=%2Fcoding-competition%2Fregister" className="font-semibold text-story-royal">Log in</Link></p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
