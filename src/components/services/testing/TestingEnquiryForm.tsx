"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { cn } from "@/lib/cn";
import { suggestEmail } from "@/lib/emailCheck";

const BLUE = "#2563eb";
const VIOLET = "#7c3aed";
const GREEN = "#059669";
const AMBER = "#d97706";
const ROSE = "#e11d48";

const STEPS = [
  { title: "About you", color: BLUE },
  { title: "Testing needs", color: VIOLET },
  { title: "Details", color: GREEN },
];

export type NeedOption = { label: string; color: string };

const NEEDS: NeedOption[] = [
  { label: "Web app testing", color: BLUE },
  { label: "Mobile app testing", color: VIOLET },
  { label: "API testing", color: GREEN },
  { label: "Test automation", color: AMBER },
  { label: "Regression suite", color: ROSE },
  { label: "CI/CD integration", color: BLUE },
  { label: "AI feature testing", color: VIOLET },
  { label: "Not sure yet", color: GREEN },
];

const TIMELINES = [
  { label: "Urgent", hint: "Within 2 weeks", color: ROSE },
  { label: "This month", hint: "Next 4 weeks", color: AMBER },
  { label: "Just exploring", hint: "No deadline", color: GREEN },
];

/** Light, colourful form chrome. The wrapper pins the light palette so the form stays bright even if the site theme is dark. */
const LIGHT_VARS = {
  "--background": "#ffffff",
  "--foreground": "#0f172a",
  "--surface": "#ffffff",
  "--surface-2": "#f8fafc",
  "--border-soft": "#e2e8f0",
  "--muted": "#64748b",
  colorScheme: "light",
} as CSSProperties;

function StatusIcon({ state }: { state: "ok" | "bad" }) {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {state === "ok" ? (
          <><circle cx="9" cy="9" r="9" fill={GREEN} /><path d="M5.2 9.3l2.4 2.3 5.2-5.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>
        ) : (
          <><circle cx="9" cy="9" r="9" fill={ROSE} /><path d="M9 5v5M9 12.4v.1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></>
        )}
      </svg>
    </motion.span>
  );
}

function Field({ label, color, valid, checking, error, hint, icon = true, children }: { label: string; color: string; valid?: boolean; checking?: boolean; error?: string; hint?: ReactNode; icon?: boolean; children: ReactNode }) {
  return (
    <label className={cn("block", error && "[&_input]:!border-rose-500 [&_textarea]:!border-rose-500")} style={{ "--c": color } as CSSProperties}>
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-800">{label}</span>
      <span className="relative block">
        {children}
        {icon && (error ? <StatusIcon state="bad" /> : checking ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-label="Checking email domain" role="status">
            <svg width="18" height="18" viewBox="0 0 18 18" className="animate-spin" aria-hidden>
              <circle cx="9" cy="9" r="7" fill="none" stroke="#cbd5e1" strokeWidth="2" />
              <path d="M9 2a7 7 0 0 1 7 7" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        ) : valid ? <StatusIcon state="ok" /> : null)}
      </span>
      <AnimatePresence initial={false}>
        {(error || hint) && (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("mt-1.5 block overflow-hidden text-xs", error ? "font-medium" : "text-slate-500")} style={error ? { color: ROSE } : undefined}>
            {error ?? hint}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 hover:border-slate-400 focus:border-[var(--c)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--c)_16%,transparent)]";

function Confetti() {
  const colors = [BLUE, VIOLET, GREEN, AMBER, ROSE];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 90 + (i % 4) * 28;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-[88px] h-2 w-2 rounded-sm"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 30, opacity: 0, rotate: 240 }}
            transition={{ duration: 1.1 + (i % 3) * 0.2, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

type EnquiryCopy = {
  needs?: NeedOption[];
  needsQuestion?: string;
  goalsPrefix?: string;
  submitLabel?: string;
  messagePlaceholder?: string;
  heading?: string;
};

export function TestingEnquiryForm({
  service,
  needs: needOptions = NEEDS,
  needsQuestion = "What do you need tested?",
  goalsPrefix = "Testing needs",
  submitLabel = "Request test scope",
  messagePlaceholder = "Tell us about your application, tech stack, or release schedule…",
  heading = "Tell us about your project",
}: { service: string } & EnquiryCopy) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [needs, setNeeds] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string>("");
  const [needsError, setNeedsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const { register, handleSubmit, control, trigger, setValue, formState: { errors } } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onTouched",
    defaultValues: { service },
  });
  const values = useWatch({ control });
  const emailReg = register("email");
  const ok = (k: "name" | "email" | "phone") => Boolean(values[k]) && !errors[k] && leadSchema.shape[k].safeParse(values[k]).success;

  const emailOk = ok("email");
  const [verified, setVerified] = useState<{ email: string; ok: boolean; reason?: string } | null>(null);
  const email = values.email ?? "";
  const emailChecked = emailOk && verified?.email === email ? verified : null;
  const emailChecking = emailOk && !emailChecked;

  useEffect(() => {
    if (!emailOk || !email) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }), signal: ctrl.signal });
        const json = await res.json();
        setVerified({ email, ok: Boolean(json.valid), reason: json.reason });
      } catch {
        if (!ctrl.signal.aborted) setVerified({ email, ok: true }); // network trouble: the server re-checks on submit
      }
    }, 450);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [email, emailOk]);
  const emailFix = emailOk && values.email ? suggestEmail(values.email) : null;

  const color = STEPS[step].color;
  const message = values.message ?? "";

  async function next() {
    if (step === 0) {
      if (!(await trigger(["name", "email", "phone"]))) return;
      let result = emailChecked;
      if (!result) {
        try {
          const res = await fetch("/api/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
          const json = await res.json();
          result = { email, ok: Boolean(json.valid), reason: json.reason };
          setVerified(result);
        } catch {
          result = { email, ok: true };
        }
      }
      if (!result.ok) return;
    }
    if (step === 1) {
      if (needs.length === 0) { setNeedsError(true); return; }
      if (!(await trigger(["company"]))) return;
    }
    setDir(1);
    setStep((s) => Math.min(2, s + 1));
  }
  function back() {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(data: LeadInput) {
    setLoading(true);
    setServerError(null);
    const goals = `${goalsPrefix}: ${needs.join(", ")}.${timeline ? ` Timeline: ${timeline}.` : ""}`;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, goals, startedAt: openedAt }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Something went wrong"); return; }
      setWhatsappLink(json.whatsappLink);
      setSubmitted(true);
    } catch {
      setServerError("We couldn't send your enquiry. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const toggleNeed = (n: string) => {
    setNeedsError(false);
    setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));
  };

  return (
    <div style={LIGHT_VARS} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)]">
      <span aria-hidden className="flex h-1 w-full">
        {[BLUE, VIOLET, GREEN, AMBER, ROSE].map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
      </span>

      {submitted ? (
        <div className="relative px-7 py-10 text-center sm:px-8">
          <Confetti />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl text-white" style={{ background: GREEN }}>✓</motion.div>
          <h3 className="mt-5 text-xl font-semibold">Thanks, we&apos;ll be in touch!</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">The MyLoginn team will review your enquiry and follow up using the contact details provided.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {needs.map((n) => <span key={n} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "color-mix(in srgb, #2563eb 12%, white)", color: BLUE }}>{n}</span>)}
          </div>
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: GREEN }}>
              Continue on WhatsApp
            </a>
          )}
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => { e.preventDefault(); if (step < 2) void next(); else void handleSubmit(onSubmit)(e); }}
          className="relative p-6 sm:p-8"
        >
          <input type="hidden" {...register("service")} />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this field empty<input type="text" tabIndex={-1} autoComplete="off" {...register("website")} /></label></div>

          <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{heading}</h3>
          <p className="mt-1 text-sm text-slate-500">Three quick steps, about a minute.</p>

          {/* Step indicator */}
          <ol className="mt-6 flex items-center" aria-label="Form progress">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.title} className="flex min-w-0 flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => { setDir(i < step ? -1 : 1); setStep(i); }}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    className="flex shrink-0 items-center gap-2 disabled:cursor-default"
                  >
                    <motion.span
                      animate={{ scale: active ? 1.1 : 1 }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold"
                      style={{ borderColor: done || active ? s.color : "#cbd5e1", background: done ? s.color : active ? `color-mix(in srgb, ${s.color} 14%, white)` : "#fff", color: done ? "#fff" : active ? s.color : "#94a3b8" }}
                    >
                      {done ? "✓" : i + 1}
                    </motion.span>
                    {active && <span className="whitespace-nowrap text-xs font-semibold text-slate-900">{s.title}</span>}
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: s.color }} initial={false} animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="relative mt-6 min-h-[19rem]">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                initial={{ opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -24 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <Field label="Full name" color={BLUE} valid={ok("name")} error={errors.name?.message}>
                      <input className={inputCls} placeholder="Your name" autoComplete="name" maxLength={80} {...register("name")} />
                    </Field>
                    <Field
                      label="Work email"
                      color={BLUE}
                      valid={emailOk && emailChecked?.ok === true}
                      checking={emailChecking}
                      error={errors.email?.message ?? (emailChecked && !emailChecked.ok ? emailChecked.reason : undefined)}
                      hint={emailFix ? <>Did you mean <button type="button" onClick={() => setValue("email", emailFix, { shouldValidate: true })} className="font-semibold text-blue-700 underline underline-offset-2">{emailFix}</button>?</> : undefined}
                    >
                      <input
                        className={inputCls}
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        {...emailReg}
                        onChange={(e) => {
                          e.target.value = e.target.value.toLowerCase().replace(/\s/g, "");
                          return emailReg.onChange(e);
                        }}
                      />
                    </Field>
                    <Controller
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <PhoneInput label="Phone (WhatsApp)" hint="We can continue the enquiry on WhatsApp if you like." valid={ok("phone")} error={errors.phone?.message} value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} />
                      )}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div>
                      <p className="mb-2 text-[13px] font-semibold text-slate-800">{needsQuestion}</p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label={needsQuestion}>
                        {needOptions.map((n) => {
                          const on = needs.includes(n.label);
                          return (
                            <motion.button
                              key={n.label}
                              type="button"
                              aria-pressed={on}
                              whileTap={{ scale: 0.93 }}
                              onClick={() => toggleNeed(n.label)}
                              className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                              style={on ? { background: `color-mix(in srgb, ${n.color} 12%, white)`, borderColor: n.color, color: n.color } : { background: "#fff", borderColor: "#cbd5e1", color: "#475569" }}
                            >
                              {on && <span aria-hidden>✓ </span>}{n.label}
                            </motion.button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {needsError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-xs font-medium" style={{ color: ROSE }}>Pick at least one so we can scope it properly.</motion.p>}
                      </AnimatePresence>
                    </div>

                    <div>
                      <p className="mb-2 text-[13px] font-semibold text-slate-800">When do you need it?</p>
                      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Timeline">
                        {TIMELINES.map((t) => {
                          const on = timeline === t.label;
                          return (
                            <motion.button
                              key={t.label}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setTimeline(on ? "" : t.label)}
                              className="rounded-lg border px-2 py-2 text-center transition-colors"
                              style={on ? { background: `color-mix(in srgb, ${t.color} 10%, white)`, borderColor: t.color } : { borderColor: "#cbd5e1", background: "#fff" }}
                            >
                              <span className="block text-xs font-bold" style={{ color: on ? t.color : "#334155" }}>{t.label}</span>
                              <span className="block text-[10px] text-slate-500">{t.hint}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <Field label="Company (optional)" color={VIOLET} error={errors.company?.message}>
                      <input className={inputCls} placeholder="Company name" autoComplete="organization" maxLength={100} {...register("company")} />
                    </Field>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Field label="Anything else we should know? (optional)" color={GREEN} icon={false} error={errors.message?.message}>
                      <textarea className={cn(inputCls, "resize-none")} rows={5} maxLength={1000} placeholder={messagePlaceholder} {...register("message")} />
                      <span className="mt-1 block text-right font-mono text-[10px] text-slate-400">{message.length}/1000</span>
                    </Field>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">Your request</p>
                      <p className="mt-1">{values.name || "—"} · {values.email || "—"}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {needs.map((n) => <span key={n} className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-slate-200">{n}</span>)}
                        {timeline && <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: TIMELINES.find((t) => t.label === timeline)?.color }}>{timeline}</span>}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {serverError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm" style={{ color: ROSE }}>{serverError}</p>}

          <div className="mt-6 flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={back} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95">
                Back
              </button>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-md disabled:opacity-60"
              style={{ background: color }}
            >
              {loading ? "Sending…" : step < 2 ? "Continue →" : submitLabel}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}
