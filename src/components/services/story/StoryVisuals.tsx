"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PlanButton } from "@/components/ui/PlanButton";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { Caption, Chip, MonitorFrame, StateIcon } from "@/components/services/testing/TestingVisuals";

const BLUE = "#2563eb";
const VIOLET = "#7c3aed";
const GREEN = "#059669";
const AMBER = "#d97706";

const TINT = "color-mix(in srgb, var(--story-royal) 14%, transparent)";
const TINT_STRONG = "color-mix(in srgb, var(--story-royal) 28%, transparent)";

export function PlanCta({ label, service }: { label: string; service: "web" | "mobile" | "software" | "marketing" }) {
  return <PlanButton label={label} onClick={() => openProjectRequest(service)} />;
}

/** Cycles an index on a timer until the user takes over by clicking. */
function useAutoIndex(length: number, ms: number) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [reduced, auto, length, ms]);
  return { index, pick: (i: number) => { setAuto(false); setIndex(i); }, reduced };
}

function Line({ w = "100%", h = 8, strong }: { w?: string | number; h?: number; strong?: boolean }) {
  return <div style={{ width: w, height: h, borderRadius: 999, background: strong ? TINT_STRONG : TINT }} />;
}

function Pop({ i, className, style, children }: { i: number; className?: string; style?: React.CSSProperties; children?: ReactNode }) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, delay: i * 0.07 }}>
      {children}
    </motion.div>
  );
}

/* =====================  APP & WEB DEVELOPMENT  ===================== */

const BUILDS = ["Website", "Web app", "Admin tool"] as const;

function Wireframe({ kind }: { kind: (typeof BUILDS)[number] }) {
  if (kind === "Website") {
    return (
      <div className="flex h-full flex-col gap-2.5">
        <Pop i={0} className="flex items-center justify-between"><Line w="22%" h={9} strong /><div className="flex gap-2"><Line w={26} /><Line w={26} /><Line w={26} /></div></Pop>
        <Pop i={1} className="rounded-xl p-4" style={{ background: TINT }}>
          <Line w="55%" h={12} strong />
          <div className="mt-2"><Line w="75%" /></div>
          <div className="mt-3 inline-block rounded-md px-3 py-1.5 text-[10px] font-semibold text-white" style={{ background: "var(--story-royal)" }}>Get started</div>
        </Pop>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {[0, 1, 2].map((n) => <Pop key={n} i={2 + n} className="rounded-lg border border-border-soft p-2"><div className="h-6 w-6 rounded-md" style={{ background: TINT_STRONG }} /><div className="mt-2"><Line w="70%" /></div></Pop>)}
        </div>
      </div>
    );
  }
  if (kind === "Web app") {
    return (
      <div className="flex h-full gap-2.5">
        <Pop i={0} className="flex w-1/5 flex-col gap-2 rounded-lg p-2" style={{ background: "var(--story-navy)" }}>
          {[0, 1, 2, 3].map((n) => <div key={n} className="h-2 rounded-full bg-white/50" style={{ width: n === 0 ? "90%" : "65%" }} />)}
        </Pop>
        <div className="flex flex-1 flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((n) => <Pop key={n} i={1 + n} className="rounded-lg border border-border-soft p-2"><Line w="50%" h={6} /><div className="mt-2"><Line w="75%" h={11} strong /></div></Pop>)}</div>
          <Pop i={4} className="flex flex-1 items-end gap-1.5 rounded-lg border border-border-soft p-2">
            {[40, 62, 48, 80, 66, 92, 74].map((h, n) => <div key={n} className="flex-1 rounded-t" style={{ height: `${h}%`, background: n % 2 ? BLUE : "var(--story-royal)" }} />)}
          </Pop>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col gap-2">
      <Pop i={0} className="flex items-center justify-between"><Line w="30%" h={10} strong /><div className="rounded-md px-3 py-1 text-[10px] font-semibold text-white" style={{ background: GREEN }}>+ New</div></Pop>
      <div className="grid grid-cols-4 gap-2 rounded-md px-2 py-1.5" style={{ background: "var(--story-navy)" }}>{[0, 1, 2, 3].map((n) => <div key={n} className="h-1.5 rounded-full bg-white/60" />)}</div>
      {[0, 1, 2, 3, 4].map((r) => (
        <Pop key={r} i={1 + r} className="grid grid-cols-4 items-center gap-2 border-b border-border-soft px-2 pb-1.5">
          <Line h={6} /><Line h={6} w="70%" /><Line h={6} w="85%" />
          <span className="w-fit rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{ background: r % 3 === 0 ? AMBER : GREEN }}>{r % 3 === 0 ? "Pending" : "Active"}</span>
        </Pop>
      ))}
    </div>
  );
}

export function SiteBuilderMonitor() {
  const { index, pick, reduced } = useAutoIndex(BUILDS.length, 3400);
  const kind = BUILDS[reduced ? 0 : index];
  return (
    <MonitorFrame
      interactive
      title={`yourproduct.com · ${kind.toLowerCase()}`}
      label={`${kind} build`}
      pill="Full-Stack Engineering"
      ariaLabel="Animated wireframe of a website, web app or admin tool being assembled. Choose a type to preview it."
      controls={BUILDS.map((b, i) => <Chip key={b} active={kind === b} onClick={() => pick(i)}>{b}</Chip>)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={kind} className="h-full" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <Wireframe kind={kind} />
        </motion.div>
      </AnimatePresence>
    </MonitorFrame>
  );
}

const LAYERS = [
  { name: "Frontend", color: BLUE, tech: ["Next.js", "React Native", "Tailwind CSS", "Three.js"] },
  { name: "Backend & APIs", color: VIOLET, tech: ["Node.js", "REST APIs", "Integrations"] },
  { name: "Database", color: GREEN, tech: ["PostgreSQL", "Prisma", "Authentication"] },
  { name: "Cloud & release", color: AMBER, tech: ["AWS / Vercel", "CI/CD", "Monitoring"] },
];

export function StackLayersMonitor() {
  const { index, pick } = useAutoIndex(LAYERS.length, 3000);
  return (
    <MonitorFrame interactive title="architecture · overview" label={LAYERS[index].name} pill="Technology Stack" ariaLabel="Interactive stack diagram. Select a layer to see its technologies.">
      <div className="flex h-full flex-col gap-1.5">
        {LAYERS.map((l, i) => {
          const on = i === index;
          return (
            <button key={l.name} type="button" onClick={() => pick(i)} aria-pressed={on} className="rounded-lg border px-3 py-2 text-left transition-colors" style={{ borderColor: on ? l.color : "var(--border-soft)", background: on ? `color-mix(in srgb, ${l.color} 9%, transparent)` : "transparent" }}>
              <span className="flex items-center gap-2 text-[12px] font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                {l.name}
                <span className="ml-auto text-[10px] text-muted">{l.tech.length} tools</span>
              </span>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap gap-1.5 overflow-hidden pt-1.5">
                    {l.tech.map((t) => <span key={t} className="rounded-md px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: l.color }}>{t}</span>)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </MonitorFrame>
  );
}

const APP_SCREENS = ["Home", "Product", "Checkout"] as const;

function AppScreen({ kind }: { kind: (typeof APP_SCREENS)[number] }) {
  if (kind === "Home") {
    return (
      <div className="flex h-full flex-col gap-2.5 px-4 pt-7">
        <p className="text-sm font-bold text-story-navy dark:text-foreground">Good morning</p>
        <Line w="55%" h={6} />
        <div className="grid grid-cols-2 gap-2">{[0, 1, 2, 3].map((n) => <Pop key={n} i={n} className="aspect-square rounded-xl" style={{ background: n % 2 ? TINT : TINT_STRONG }} />)}</div>
      </div>
    );
  }
  if (kind === "Product") {
    return (
      <div className="flex h-full flex-col gap-2 px-4 pt-7">
        <Pop i={0} className="h-24 rounded-xl" style={{ background: TINT_STRONG }} />
        <p className="text-sm font-bold text-story-navy dark:text-foreground">Product name</p>
        <Line w="45%" h={6} />
        <div className="mt-auto rounded-lg py-2 text-center text-[11px] font-semibold text-white" style={{ background: "var(--story-royal)" }}>Add to cart</div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-4">
      <p className="text-sm font-bold text-story-navy dark:text-foreground">Checkout</p>
      <Pop i={0} className="rounded-xl p-3" style={{ background: "var(--story-navy)" }}><div className="h-2.5 w-7 rounded-sm bg-white/70" /><p className="mt-4 font-mono text-[10px] text-white/80">•••• •••• 4242</p></Pop>
      <div className="flex justify-between text-[10px] font-semibold"><span>Total</span><span>₹1,499</span></div>
      <div className="rounded-lg py-2 text-center text-[11px] font-semibold text-white" style={{ background: "var(--story-royal)" }}>Pay now</div>
    </div>
  );
}

export function AppPhone() {
  const { index, pick, reduced } = useAutoIndex(APP_SCREENS.length, 2800);
  const kind = APP_SCREENS[index];
  return (
    <div className="flex flex-col items-center gap-5">
      <div role="img" aria-label="Animated phone showing app home, product and checkout screens" className="relative h-[360px] w-[190px] overflow-hidden rounded-[2.1rem] bg-white shadow-[var(--shadow-lift)] dark:bg-surface sm:h-[400px] sm:w-[210px]" style={{ border: "6px solid var(--story-navy)" }}>
        <div className="absolute left-1/2 top-2 z-10 h-2 w-14 -translate-x-1/2 rounded-full bg-story-navy" />
        <AnimatePresence initial={false}>
          <motion.div key={kind} className="absolute inset-0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }}>
            <AppScreen kind={kind} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="App screen">
        {APP_SCREENS.map((s, i) => <Chip key={s} active={kind === s} onClick={() => pick(i)}>{s}</Chip>)}
      </div>
      <div className="flex flex-col items-center"><Caption label={`${kind} screen`} pill="Android & iOS Apps" reduced={reduced} curve={false} /></div>
    </div>
  );
}

const DEPLOY = [
  { name: "Commit", log: "Change pushed to the repository" },
  { name: "Build", log: "Compiling the application" },
  { name: "Test", log: "Running automated checks" },
  { name: "Deploy", log: "Releasing to production" },
  { name: "Live", log: "New version is serving users" },
];

export function DeployMonitor() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (DEPLOY.length + 3)), 1000);
    return () => window.clearInterval(id);
  }, [reduced]);
  const at = reduced ? DEPLOY.length : Math.min(tick, DEPLOY.length);
  return (
    <MonitorFrame
      interactive
      title="release-pipeline"
      label={at >= DEPLOY.length ? "Released" : DEPLOY[at].name}
      pill="Cloud & Release"
      ariaLabel="Animated release pipeline from commit to live."
      controls={<Chip onClick={() => setTick(0)}>Deploy release</Chip>}
    >
      <div className="flex h-full flex-col justify-center">
        <ol>
          {DEPLOY.map((s, i) => {
            const state = i < at ? "pass" : i === at ? "run" : "wait";
            return (
              <li key={s.name} className="relative flex items-center gap-3 pb-3 last:pb-0">
                {i < DEPLOY.length - 1 && <span aria-hidden className="absolute left-[7px] top-5 h-full w-0.5" style={{ background: i < at ? GREEN : "var(--story-line)" }} />}
                <span className="relative z-10 bg-white dark:bg-surface"><StateIcon state={state} /></span>
                <span className={cn("w-14 text-[12px] font-semibold", state === "wait" ? "text-muted" : "text-foreground")}>{s.name}</span>
                <span className="truncate font-mono text-[10px] text-muted">{state !== "wait" ? s.log : ""}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </MonitorFrame>
  );
}

/* =====================  AI DEVELOPMENT  ===================== */

export function AgentRunMonitor() {
  const reduced = useReducedMotion();
  const [review, setReview] = useState(true);
  const [tick, setTick] = useState(0);
  const steps = [
    { name: "Understand the request", tool: "LLM" },
    { name: "Search your documents", tool: "RAG" },
    { name: "Look up the customer", tool: "CRM API" },
    { name: "Draft a reply", tool: "LLM" },
    ...(review ? [{ name: "Wait for human approval", tool: "Person" }] : []),
    { name: "Send the reply", tool: "Email API" },
  ];
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (steps.length + 3)), 1100);
    return () => window.clearInterval(id);
  }, [reduced, steps.length]);
  const at = reduced ? steps.length : Math.min(tick, steps.length);
  return (
    <MonitorFrame
      interactive
      title="agent-run · pricing-enquiry"
      label={at >= steps.length ? "Task complete" : steps[at].name}
      pill="AI Agents"
      ariaLabel="Animated AI agent completing a multi-step task. Toggle human approval to see the extra step."
      controls={
        <>
          <Chip onClick={() => setTick(0)}>Run again</Chip>
          <Chip active={review} onClick={() => { setReview((r) => !r); setTick(0); }}>Human approval {review ? "on" : "off"}</Chip>
        </>
      }
    >
      <div className="flex h-full flex-col">
        <div className="rounded-lg px-3 py-2 text-[11px] font-medium" style={{ background: TINT }}>Task: reply to a new pricing enquiry</div>
        <ul className="mt-2 flex-1 space-y-0.5">
          {steps.map((s, i) => {
            const state = i < at ? "pass" : i === at ? "run" : "wait";
            const human = s.tool === "Person";
            return (
              <li key={s.name} className="flex items-center gap-2.5 rounded-md px-2 py-1 text-[12px]">
                {human && state === "run" ? <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: AMBER }}>!</span> : <StateIcon state={state} />}
                <span className={cn("flex-1 truncate", state === "wait" ? "text-muted" : "font-medium text-foreground")}>{s.name}</span>
                <span className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold" style={{ background: human ? `color-mix(in srgb, ${AMBER} 15%, transparent)` : TINT, color: human ? AMBER : "var(--story-royal)" }}>{s.tool}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </MonitorFrame>
  );
}

const QA = [
  { q: "What is the refund policy?", a: "Refunds are available within 7 days of purchase, and are returned to the original payment method.", src: "Policy.pdf · p.2" },
  { q: "Do you offer onboarding?", a: "Yes. New customers get a guided setup session and written documentation.", src: "Onboarding.docx · p.1" },
  { q: "Which plans include support?", a: "All paid plans include email support. Priority support is part of the higher tier.", src: "Plans.pdf · p.4" },
];

function Typed({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setN((x) => Math.min(text.length, x + 2)), 28);
    return () => window.clearInterval(id);
  }, [reduced, text]);
  const shown = reduced ? text.length : n;
  return <>{text.slice(0, shown)}{shown < text.length && <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-foreground align-middle" />}</>;
}

export function DocQaMonitor() {
  const { index, pick } = useAutoIndex(QA.length, 6500);
  const item = QA[index];
  return (
    <MonitorFrame
      interactive
      title="assistant · answers from your documents"
      label="Sample answer with source"
      pill="LLM Apps & RAG"
      ariaLabel="Sample assistant answering from documents with a cited source. Choose a question."
      controls={QA.map((x, i) => <Chip key={x.q} active={i === index} onClick={() => pick(i)}>{x.q}</Chip>)}
    >
      <div className="flex h-full flex-col justify-center gap-3">
        <div className="self-end rounded-xl rounded-br-sm px-3 py-2 text-[12px] font-medium text-white" style={{ background: BLUE }}>{item.q}</div>
        <div key={item.q} className="self-start rounded-xl rounded-bl-sm border border-border-soft bg-surface px-3 py-2 text-[12px] leading-relaxed">
          <Typed text={item.a} />
          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="mt-2 flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[9px] font-bold" style={{ background: `color-mix(in srgb, ${GREEN} 14%, transparent)`, color: GREEN }}>
            <span aria-hidden>▤</span> Source: {item.src}
          </motion.span>
        </div>
      </div>
    </MonitorFrame>
  );
}

const FLOW = [
  { name: "New enquiry", text: "A form, email or chat message arrives.", color: BLUE },
  { name: "AI triage", text: "The model classifies it and extracts the key details.", color: VIOLET },
  { name: "CRM update", text: "The record is created or updated through your API.", color: GREEN },
  { name: "Team alert", text: "The right person is notified, with a summary.", color: AMBER },
];

export function WorkflowMonitor() {
  const { index, pick } = useAutoIndex(FLOW.length, 2600);
  return (
    <MonitorFrame interactive title="workflow · enquiry-triage" label={FLOW[index].name} pill="Workflow Automation" ariaLabel="Interactive workflow from enquiry to team alert. Select a step to read what happens.">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center">
          {FLOW.map((n, i) => (
            <div key={n.name} className="flex flex-1 items-center last:flex-none">
              <button type="button" onClick={() => pick(i)} aria-pressed={i === index} aria-label={n.name} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white transition-transform hover:scale-105" style={{ background: n.color, opacity: i <= index ? 1 : 0.35, transform: i === index ? "scale(1.12)" : undefined }}>
                {i + 1}
              </button>
              {i < FLOW.length - 1 && (
                <span className="relative mx-1.5 h-0.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--story-line)" }}>
                  <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: n.color }} initial={false} animate={{ width: i < index ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                </span>
              )}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="rounded-xl border p-3" style={{ borderColor: FLOW[index].color }}>
            <p className="text-sm font-bold" style={{ color: FLOW[index].color }}>{FLOW[index].name}</p>
            <p className="mt-1 text-[12px] leading-5 text-muted">{FLOW[index].text}</p>
          </motion.div>
        </AnimatePresence>
        <p className="text-[10px] text-muted">Repetitive work handled automatically; people stay in control of important actions.</p>
      </div>
    </MonitorFrame>
  );
}

type ChatLine = { from: "user" | "bot"; text: string };
const SUPPORT_CHAT: ChatLine[] = [
  { from: "user", text: "Where is my order?" },
  { from: "bot", text: "Let me check. Your order shipped yesterday and arrives Friday." },
  { from: "user", text: "Can I change the address?" },
  { from: "bot", text: "I will pass this to our team so they can help you." },
];

export function SupportChatPhone() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? SUPPORT_CHAT.length : 0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setN((x) => (x >= SUPPORT_CHAT.length + 2 ? 0 : x + 1)), 1500);
    return () => window.clearInterval(id);
  }, [reduced]);
  const shown = Math.min(n, SUPPORT_CHAT.length);
  const handover = n >= SUPPORT_CHAT.length;
  return (
    <div className="flex flex-col items-center gap-5">
      <div role="img" aria-label="Animated support assistant conversation that hands over to a person" className="relative h-[360px] w-[190px] overflow-hidden rounded-[2.1rem] bg-white shadow-[var(--shadow-lift)] dark:bg-surface sm:h-[400px] sm:w-[210px]" style={{ border: "6px solid var(--story-navy)" }}>
        <div className="flex items-center gap-2 px-3 pb-2 pt-6 text-white" style={{ background: VIOLET }}>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-[10px] font-bold">AI</span>
          <div className="leading-tight"><p className="text-[11px] font-semibold">Support assistant</p><p className="text-[9px] opacity-80">answers from approved content</p></div>
        </div>
        <div className="flex h-[calc(100%-4.2rem)] flex-col justify-end gap-1.5 p-2.5 pb-3">
          {SUPPORT_CHAT.slice(0, shown).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }} className={cn("max-w-[88%] rounded-xl px-2.5 py-1.5 text-[10px] leading-snug shadow-sm", m.from === "user" ? "self-end rounded-br-sm text-white" : "self-start rounded-bl-sm border border-border-soft bg-surface text-foreground")} style={m.from === "user" ? { background: BLUE } : undefined}>
              {m.text}
            </motion.div>
          ))}
          <AnimatePresence>
            {handover && (
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-1 rounded-lg px-2 py-1.5 text-center text-[10px] font-bold text-white" style={{ background: AMBER }}>
                Handed over to a person
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Chip onClick={() => setN(0)}>Replay conversation</Chip>
      <div className="flex flex-col items-center"><Caption label="Support assistant" pill="Chatbots & Assistants" reduced={reduced} curve={false} /></div>
    </div>
  );
}

