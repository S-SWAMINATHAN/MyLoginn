"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PASS = "#16a34a";
const FAIL = "#dc2626";
const CURVE = "M5,8 C55,-5 95,50 145,20";

export function useTicker(length: number, ms: number, reduced: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms, reduced]);
  return reduced ? length - 1 : tick;
}

export function Check({ color = PASS, size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
      <motion.path
        d="M4.5 8.3l2.4 2.3 4.6-4.8"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35 }}
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="animate-spin">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--story-line)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="var(--story-royal)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Dot() {
  return <span aria-hidden className="m-[3px] block h-[10px] w-[10px] rounded-full border-2 border-border-soft" />;
}

export function StateIcon({ state }: { state: "pass" | "run" | "wait" }) {
  return <span className="grid h-4 w-4 shrink-0 place-items-center">{state === "pass" ? <Check /> : state === "run" ? <Spinner /> : <Dot />}</span>;
}

/** The curved line with a travelling cyan dot, plus the pill underneath, shared by every device frame. */
export function Caption({ label, pill, reduced, curve = true }: { label: string; pill: string; reduced: boolean; curve?: boolean }) {
  return (
    <>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <svg width="150" height="46" viewBox="0 0 150 46" className={cn("mt-1 hidden", curve && "sm:block")} aria-hidden>
        <path d={CURVE} fill="none" stroke="var(--story-line)" strokeWidth="2" />
        {!reduced && (
          <circle r="4" fill="var(--story-cyan)">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={CURVE} />
          </circle>
        )}
      </svg>
      <span className="story-panel rounded-full px-4 py-1.5 text-xs font-semibold text-story-navy">{pill}</span>
    </>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
        active ? "border-story-royal bg-story-royal text-white" : "border-border-soft bg-surface text-foreground hover:border-story-royal hover:text-story-royal"
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Device frames (same look as the home page stories) ---------- */

export function MonitorFrame({ children, label, pill, title, ariaLabel, controls, interactive, tall }: { children: ReactNode; label: string; pill: string; title: string; ariaLabel: string; controls?: ReactNode; interactive?: boolean; tall?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center sm:max-w-md">
      <div role={interactive ? "group" : "img"} aria-label={ariaLabel} className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lift)] dark:bg-surface" style={{ border: "6px solid var(--story-navy)" }}>
        <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "var(--story-mist)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-cyan)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-royal)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-navy)" }} />
          <span className="ml-2 flex-1 truncate rounded-full px-3 py-0.5 font-mono text-[10px] text-muted" style={{ background: "var(--story-mist)" }}>{title}</span>
        </div>
        <div className={cn("w-full p-4", tall ? "h-[300px] sm:h-[320px]" : "h-[230px] sm:h-[250px]")}>{children}</div>
      </div>
      {controls && <div className="mt-4 flex flex-wrap justify-center gap-2">{controls}</div>}
      <div className="mt-3 h-4 w-16" style={{ background: "var(--story-navy)", clipPath: "polygon(30% 0, 70% 0, 90% 100%, 10% 100%)" }} />
      <div className="h-1.5 w-28 rounded-full" style={{ background: "var(--story-navy)" }} />
      <Caption label={label} pill={pill} reduced={reduced} />
    </div>
  );
}

/* ---------- 1. Web automation: live test run ---------- */

const RUN = [
  { name: "Login with valid credentials", ms: "1.2s" },
  { name: "Add item to cart", ms: "0.9s" },
  { name: "Checkout and payment", ms: "2.4s" },
  { name: "Form validation errors", ms: "0.7s" },
  { name: "Responsive layout at 375px", ms: "1.1s" },
];

const BUG_INDEX = 2;

export function WebAutomationMonitor() {
  const reduced = useReducedMotion();
  const [bug, setBug] = useState(false);
  const [tick, setTick] = useState(0);
  const total = RUN.length + 2;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % total), 1100);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  const shown = reduced ? RUN.length : Math.min(tick, RUN.length);
  const done = shown >= RUN.length;
  const failed = bug && shown > BUG_INDEX ? 1 : 0;
  const passed = Math.max(0, shown - failed);

  return (
    <MonitorFrame
      title="playwright test --project=chromium"
      label={done ? (failed ? "Defect caught" : "Suite passed") : "Running suite"}
      pill="Web Automation"
      ariaLabel="Animated automated browser test run where each test case passes in turn"
      controls={
        <>
          <Chip onClick={() => setTick(0)}>Run again</Chip>
          <Chip active={bug} onClick={() => { setBug((b) => !b); setTick(0); }}>{bug ? "Bug injected" : "Inject a bug"}</Chip>
        </>
      }
    >
      <div className="flex h-full flex-col">
        <ul className="flex-1 space-y-0.5">
          {RUN.map((t, i) => {
            const isBug = bug && i === BUG_INDEX;
            const state = i < shown ? "pass" : i === shown ? "run" : "wait";
            const showFail = isBug && state === "pass";
            return (
              <li key={t.name} className={cn("flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors", state === "run" && "bg-story-mist", showFail && "bg-red-50 dark:bg-red-950/30")}>
                {showFail ? <span className="grid h-4 w-4 shrink-0 place-items-center"><Check color={FAIL} /></span> : <StateIcon state={state} />}
                <span className={cn("flex-1 truncate font-medium", state === "wait" ? "text-muted" : "text-foreground")}>{t.name}</span>
                <span className="font-mono text-[10px] tabular-nums text-muted" style={showFail ? { color: FAIL } : undefined}>{state === "pass" ? (showFail ? "failed" : t.ms) : ""}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
          <span style={done ? { color: failed ? FAIL : PASS } : undefined} className={done ? "" : "text-muted"}>
            {done ? `${passed} passed · ${failed} failed` : "Running…"}
          </span>
          <span className="font-mono tabular-nums text-muted">{shown}/{RUN.length}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-story-mist">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(shown / RUN.length) * 100}%`, background: done ? (failed ? FAIL : PASS) : "var(--story-royal)" }} />
        </div>
      </div>
    </MonitorFrame>
  );
}

/* ---------- 2. API testing ---------- */

const API_ROWS = [
  { method: "GET", path: "/api/users", status: 200, ms: 48 },
  { method: "POST", path: "/api/login", status: 200, ms: 112 },
  { method: "POST", path: "/api/login (wrong password)", status: 401, ms: 64 },
  { method: "GET", path: "/api/orders/42", status: 200, ms: 71 },
  { method: "DELETE", path: "/api/orders/42 (no token)", status: 403, ms: 39 },
];

export function ApiMonitor() {
  const reduced = useReducedMotion();
  const tick = useTicker(API_ROWS.length + 2, 900, reduced);
  return (
    <MonitorFrame title="POST /api/login" label="Contract checks" pill="API & Backend" ariaLabel="Animated API test results showing requests, status codes and response times">
      <div className="flex h-full flex-col justify-center font-mono text-[11px]">
        {API_ROWS.map((r, i) => {
          const shown = i < tick;
          return (
            <motion.div key={r.path} initial={false} animate={{ opacity: shown ? 1 : 0.25, x: shown ? 0 : -6 }} className="flex items-center gap-2 border-b py-2 last:border-0" style={{ borderColor: "var(--story-mist)" }}>
              <span className="w-12 font-bold" style={{ color: r.method === "GET" ? "var(--story-royal)" : "var(--story-navy)" }}>{r.method}</span>
              <span className="flex-1 truncate text-foreground">{r.path}</span>
              <span className="font-bold" style={{ color: r.status < 400 ? PASS : FAIL }}>{shown ? r.status : "…"}</span>
              <span className="w-4">{shown && <Check size={14} />}</span>
            </motion.div>
          );
        })}
        <p className="mt-2 text-[10px] text-muted">401 and 403 are the expected results for those cases, so they pass.</p>
      </div>
    </MonitorFrame>
  );
}

/* ---------- 3. Mobile testing ---------- */

type MobileScreen = "launch" | "login" | "checkout" | "offline";
const MOBILE_STEPS: { key: MobileScreen; label: string; check: string }[] = [
  { key: "launch", label: "Install & launch", check: "Launches in under 3s" },
  { key: "login", label: "Login", check: "Valid login accepted" },
  { key: "checkout", label: "Checkout", check: "Payment screen verified" },
  { key: "offline", label: "Offline mode", check: "Offline message shown" },
];

const TINT = "color-mix(in srgb, var(--story-royal) 14%, transparent)";
const TINT_STRONG = "color-mix(in srgb, var(--story-royal) 28%, transparent)";

function Line({ w = "100%", h = 8, strong }: { w?: string; h?: number; strong?: boolean }) {
  return <div style={{ width: w, height: h, borderRadius: 999, background: strong ? TINT_STRONG : TINT }} />;
}

function MobileScreenContent({ screen }: { screen: MobileScreen }) {
  switch (screen) {
    case "launch":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <motion.div
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: "var(--story-royal)" }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <div className="h-5 w-5 rounded-md bg-white" />
          </motion.div>
          <p className="text-sm font-bold text-story-navy dark:text-foreground">Your App</p>
          <div className="h-1 w-20 overflow-hidden rounded-full" style={{ background: TINT }}>
            <motion.div className="h-full" style={{ background: "var(--story-royal)" }} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.6 }} />
          </div>
        </div>
      );
    case "login":
      return (
        <div className="flex h-full flex-col justify-center gap-2 px-4">
          <p className="text-sm font-bold text-story-navy dark:text-foreground">Sign in</p>
          <div className="rounded-lg border px-2.5 py-2 text-[10px] text-muted" style={{ borderColor: TINT_STRONG }}>name@email.com</div>
          <div className="rounded-lg border px-2.5 py-2 text-[10px] text-muted" style={{ borderColor: TINT_STRONG }}>••••••••</div>
          <motion.div
            className="rounded-lg py-2 text-center text-[11px] font-semibold text-white"
            style={{ background: "var(--story-royal)" }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.94, 1] }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Continue
          </motion.div>
        </div>
      );
    case "checkout":
      return (
        <div className="flex h-full flex-col justify-center gap-2.5 px-4">
          <p className="text-sm font-bold text-story-navy dark:text-foreground">Checkout</p>
          <div className="rounded-xl p-3" style={{ background: "var(--story-navy)" }}>
            <div className="h-2.5 w-7 rounded-sm bg-white/70" />
            <p className="mt-4 font-mono text-[10px] text-white/80">•••• •••• 4242</p>
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-foreground"><span>Total</span><span>₹1,499</span></div>
          <div className="rounded-lg py-2 text-center text-[11px] font-semibold text-white" style={{ background: "var(--story-royal)" }}>Pay now</div>
        </div>
      );
    case "offline":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2.5 px-5 text-center">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--story-royal)" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
            <path d="M3 3l18 18" />
          </svg>
          <p className="text-sm font-bold text-story-navy dark:text-foreground">You are offline</p>
          <p className="text-[10px] leading-snug text-muted">Changes are saved and will sync when you reconnect.</p>
          <Line w="60%" h={6} />
        </div>
      );
  }
}

function Phone({ platform, step }: { platform: "android" | "ios"; step: (typeof MOBILE_STEPS)[number] }) {
  const ios = platform === "ios";
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        role="img"
        aria-label={`${ios ? "iPhone" : "Android phone"} running the ${step.label} test`}
        className={cn(
          "relative h-[330px] w-[150px] overflow-hidden bg-white shadow-[var(--shadow-lift)] dark:bg-surface sm:h-[370px] sm:w-[172px]",
          ios ? "rounded-[2.1rem]" : "rounded-[1.5rem]"
        )}
        style={{ border: "6px solid var(--story-navy)" }}
      >
        {ios ? (
          <div className="absolute left-1/2 top-2 z-10 h-2 w-14 -translate-x-1/2 rounded-full bg-story-navy" />
        ) : (
          <div className="absolute left-1/2 top-2.5 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-story-navy" />
        )}
        <div className="absolute inset-0 pb-16 pt-6">
          <AnimatePresence initial={false}>
            <motion.div key={step.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="absolute inset-x-0 bottom-16 top-6">
              <MobileScreenContent screen={step.key} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute inset-x-2.5 bottom-6 h-8">
          <AnimatePresence initial={false}>
            <motion.div key={step.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="absolute inset-0 flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface px-2 shadow-sm">
              <span className="shrink-0"><Check size={12} /></span>
              <span className="min-w-0 truncate text-[9px] font-semibold leading-tight text-foreground">{step.check}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        {ios ? (
          <div className="absolute bottom-1.5 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-story-navy/70" />
        ) : (
          <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-5">
            <span className="h-2 w-2 rounded-full border border-story-navy/60" />
            <span className="h-2 w-2 rounded-full border border-story-navy/60" />
            <span className="h-2 w-2 rounded-sm border border-story-navy/60" />
          </div>
        )}
      </div>
      <span className="text-xs font-semibold text-story-navy dark:text-foreground">{ios ? "iOS" : "Android"}</span>
    </div>
  );
}

export function MobileTestingPhone() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MOBILE_STEPS.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, auto]);

  const step = MOBILE_STEPS[index];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-start justify-center gap-4 sm:gap-6">
        <Phone platform="android" step={step} />
        <Phone platform="ios" step={step} />
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Test scenario">
        {MOBILE_STEPS.map((x, i) => (
          <Chip key={x.key} active={index === i} onClick={() => { setAuto(false); setIndex(i); }}>{x.label}</Chip>
        ))}
        {!auto && <Chip onClick={() => setAuto(true)}>Autoplay</Chip>}
      </div>
    </div>
  );
}

/* ---------- 4. Regression and CI/CD ---------- */

const BUILDS = ["1.4.0", "1.4.1", "1.4.2", "1.5.0", "1.5.1", "1.5.2"];
const CI_STAGES = ["Commit", "Build", "Unit", "E2E", "Report"];

export function RegressionMonitor() {
  const reduced = useReducedMotion();
  const tick = useTicker(BUILDS.length + 2, 800, reduced);
  const ci = Math.min(tick, CI_STAGES.length);
  return (
    <MonitorFrame title="github.com/actions · e2e.yml" label="Every build, same suite" pill="Regression & CI/CD" ariaLabel="Animated CI pipeline stages and regression results across builds">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center">
          {CI_STAGES.map((s, i) => {
            const state = i < ci ? "pass" : i === ci ? "run" : "wait";
            return (
              <div key={s} className="relative flex flex-1 flex-col items-center gap-1">
                {i > 0 && <span aria-hidden className="absolute right-1/2 top-2 h-0.5 w-full -translate-y-1/2" style={{ background: i <= ci ? PASS : "var(--story-line)" }} />}
                <span className="relative z-10 bg-white dark:bg-surface"><StateIcon state={state} /></span>
                <span className={cn("text-[10px] font-semibold", state === "wait" ? "text-muted" : "text-foreground")}>{s}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div className="flex items-end gap-2" style={{ height: 90 }}>
            {BUILDS.map((b, i) => {
              const shown = i < tick;
              return (
                <motion.div key={b} initial={false} animate={{ height: shown ? "100%" : "10%" }} transition={{ duration: 0.5 }} className="flex-1 rounded-t-md" style={{ background: shown ? "var(--story-royal)" : "var(--story-mist)" }} />
              );
            })}
          </div>
          <div className="mt-1 flex gap-2">
            {BUILDS.map((b) => <span key={b} className="flex-1 text-center font-mono text-[9px] text-muted">{b}</span>)}
          </div>
        </div>
      </div>
    </MonitorFrame>
  );
}

/* ---------- Hero step tracker (replaces the sliding train) ---------- */

const TRACK = [
  { title: "Requirements", text: "Review the application and its key user flows." },
  { title: "Test plan", text: "Agree scope, priorities and test environments." },
  { title: "Manual QA", text: "Run test cases and log clear, reproducible defect reports." },
  { title: "API tests", text: "Verify endpoints, authentication and error handling." },
  { title: "Automation", text: "Automate stable flows with Playwright or Selenium." },
  { title: "Regression", text: "Re-run suites each release to catch breakage early." },
  { title: "CI/CD", text: "Run tests automatically on every change in your pipeline." },
  { title: "Report", text: "Share results, coverage and recommended next steps." },
];

export function StepTracker({ steps = TRACK }: { steps?: { title: string; text: string }[] }) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % steps.length), 2800);
    return () => window.clearInterval(id);
  }, [reduced, auto, steps.length]);

  const cur = steps[index];
  return (
    <div className="flex items-center gap-3 rounded-full border border-border-soft bg-surface py-2 pl-2 pr-3 sm:gap-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-white" style={{ background: "var(--story-royal)" }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative h-5 w-24 shrink-0 sm:w-28" title={cur.text}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={cur.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="absolute inset-0 truncate text-sm font-semibold text-story-navy dark:text-foreground">
            {cur.title}
          </motion.span>
        </AnimatePresence>
      </div>

      <div role="tablist" aria-label="Testing process steps" className="flex min-w-0 flex-1 gap-1">
        {steps.map((t, i) => (
          <button
            key={t.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Step ${i + 1}: ${t.title}. ${t.text}`}
            title={t.title}
            onClick={() => { setAuto(false); setIndex(i); }}
            className="group relative h-5 flex-1 cursor-pointer"
          >
            <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full transition-transform group-hover:scale-y-150" style={{ background: TINT }}>
              <motion.span className="block h-full origin-left rounded-full" style={{ background: "var(--story-royal)" }} initial={false} animate={{ scaleX: i <= index ? 1 : 0 }} transition={{ duration: 0.4 }} />
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAuto((a) => !a)}
        aria-label={auto ? "Pause steps" : "Play steps"}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-soft text-muted transition-colors hover:border-story-royal hover:text-story-royal"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
          {auto ? <path d="M2 1h2v8H2zM6 1h2v8H6z" /> : <path d="M2 1l7 4-7 4z" />}
        </svg>
      </button>
    </div>
  );
}
