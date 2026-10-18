"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Search, X, Zap } from "lucide-react";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import { GROUP_COLOR, SUBJECT_ICON_KEY } from "./subjectStyle";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionGlyph } from "./SectionGlyph";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

const SAMPLES = [
  { q: "A train 120 m long passes a pole in 6 seconds. What is its speed?", o: ["10 m/s", "20 m/s", "30 m/s", "40 m/s"], wrong: 0, right: 1, why: "Speed = distance ÷ time = 120 ÷ 6 = 20 m/s.", tag: "Aptitude · Medium", xp: 10 },
  { q: "Find the odd one out: Python, Java, Cobra, C++", o: ["Python", "Java", "Cobra", "C++"], wrong: 1, right: 2, why: "Cobra is an animal; the others are programming languages.", tag: "Reasoning · Easy", xp: 5 },
  { q: "Which SQL clause filters groups after GROUP BY?", o: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], wrong: 0, right: 1, why: "HAVING filters aggregated groups; WHERE filters rows first.", tag: "Database · Medium", xp: 10 },
];

/**
 * A fixed-size mock of a LogiQuest question. On its own it loops (picks a wrong answer, shows the right one, the
 * explanation and the XP); click an answer to try it yourself, which pauses the loop until you press Next. The card never
 * changes size, so nothing around it moves.
 */
export function QuizPreview() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const [step, setStep] = useState(0); // autoplay: 0 idle, 1 wrong picked, 2 answer revealed
  const [manual, setManual] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const s = SAMPLES[n % SAMPLES.length];

  useEffect(() => {
    if (reduced || manual) return;
    const waits = [1500, 1300, 3600];
    const id = window.setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else { setStep(0); setN((x) => x + 1); }
    }, waits[step]);
    return () => window.clearTimeout(id);
  }, [step, n, reduced, manual]);

  const pick = manual ? choice : reduced ? s.wrong : step >= 1 ? s.wrong : null;
  const revealed = manual ? choice !== null : reduced || step >= 2;
  const correct = manual ? choice === s.right : true;
  const next = () => { setManual(false); setChoice(null); setStep(0); setN((x) => x + 1); };

  return (
    <div className="mx-auto w-full">
      <div className="flex h-[26rem] flex-col rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-lift)] sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="rounded-full bg-story-royal/10 px-3 py-1 font-bold text-story-royal">{s.tag}</span>
          <span className="flex gap-1" aria-hidden>
            {SAMPLES.map((_, i) => <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors duration-500", i === n % SAMPLES.length ? "bg-story-royal" : "bg-story-mist")} />)}
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={n} className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: EASE }}>
            <p className="mt-4 h-[4.5rem] overflow-hidden text-[15px] font-semibold leading-6 text-story-navy dark:text-foreground">{s.q}</p>
            <ul className="mt-3 grid gap-2">
              {s.o.map((opt, i) => {
                const isRight = revealed && i === s.right;
                const isWrong = pick === i && i !== s.right && (revealed || !manual);
                return (
                  <motion.li key={opt} animate={isWrong && !revealed && !reduced ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
                    <button type="button" disabled={manual && choice !== null} onClick={() => { setManual(true); setChoice(i); }} aria-label={`Answer ${"ABCD"[i]}: ${opt}`} className={cn("flex h-11 w-full items-center gap-3 rounded-2xl border-2 px-3 text-left text-sm transition-colors duration-300", isRight ? "border-emerald-500 bg-emerald-500/10" : isWrong ? "border-rose-500/70 bg-rose-500/10" : "border-border-soft hover:border-story-royal/50 enabled:cursor-pointer")}>
                      <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-300", isRight ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-story-mist text-story-royal")}>{"ABCD"[i]}</span>
                      <span className="flex-1 truncate font-medium">{opt}</span>
                      {isRight ? <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} /> : isWrong ? <X className="h-4 w-4 shrink-0 text-rose-600" strokeWidth={3} /> : null}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            {/* explanation area: always reserved, so the card never changes size */}
            <div className="relative mt-auto h-[4.75rem]">
              <AnimatePresence initial={false}>
                {revealed ? (
                  <motion.div key="why" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 flex items-start justify-between gap-3 rounded-2xl bg-story-mist p-3 text-xs leading-5">
                    <span className="min-w-0"><strong className="text-story-navy dark:text-foreground">{manual ? (correct ? "Correct! " : "Not quite. ") : "Explanation: "}</strong>{s.why}</span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      {correct ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.2 }} className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-300"><Zap className="h-3 w-3" />+{s.xp}</motion.span> : null}
                      {manual ? <button type="button" onClick={next} className="rounded-full bg-story-royal px-2.5 py-1 text-[11px] font-bold text-white">Next →</button> : null}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center rounded-2xl border border-dashed border-border-soft text-xs font-medium text-muted">Pick an answer to see the explanation</motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold leading-tight text-muted" aria-hidden>
        {[
          { Icon: AnimatedFlame, k: "Daily streak" },
          { Icon: AnimatedStar, k: "XP per answer" },
          { Icon: AnimatedClock, k: "Timed tests" },
        ].map(({ Icon, k }) => (
          <li key={k} className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-border-soft bg-surface px-2"><Icon className="h-7 w-7" />{k}</li>
        ))}
      </ul>
    </div>
  );
}

export type ExplorerGroup = {
  slug: string;
  title: string;
  nav: string;
  desc: string;
  icon: string;
  subjects: { slug: string; title: string; desc: string; topics: { slug: string; title: string }[]; questions: number; kind: string }[];
};

type CardData = { g: ExplorerGroup; s: ExplorerGroup["subjects"][number]; match?: string };

const SMOOTH = [0.22, 1, 0.36, 1] as const;

/**
 * Small subject tile: animated icon, title and a count. Hovering (or tapping, on touch screens) slides a panel up over the
 * tile with the description, topic links and an Open button; the panel's contents appear one after another. A short hover
 * delay stops it flickering as the pointer crosses tiles. A tap elsewhere, or Escape, closes it again.
 */
function SubjectCard({ g, s, match, i }: CardData & { i: number }) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const color = GROUP_COLOR[g.slug] ?? "#2563eb";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const timer = useRef<number | null>(null);
  const shown = s.topics.slice(0, 2);
  const more = s.topics.length - shown.length;

  const schedule = (next: boolean, delay: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (e.pointerType !== "mouse" && !ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const item = (n: number) => ({
    initial: false as const,
    animate: reduced ? { opacity: open ? 1 : 0 } : { opacity: open ? 1 : 0, y: open ? 0 : 10 },
    transition: { duration: 0.32, ease: SMOOTH, delay: open ? 0.1 + n * 0.055 : 0 },
  });

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45, delay: Math.min(i, 10) * 0.035, ease: SMOOTH }}
      style={{ "--c": color } as React.CSSProperties}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") schedule(true, 70); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") schedule(false, 90); }}
      onFocus={() => { if (timer.current) window.clearTimeout(timer.current); setOpen(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <div className={cn("relative h-48 overflow-hidden rounded-3xl border bg-surface transition-[border-color,box-shadow] duration-500", open ? "border-[color-mix(in_srgb,var(--c)_55%,transparent)] shadow-[0_18px_36px_-22px_var(--c)]" : "border-border-soft")}>
        {/* front */}
        <button type="button" onClick={(e) => { const pt = (e.nativeEvent as PointerEvent).pointerType; if (pt === "touch" || pt === "pen") setOpen(true); else router.push(`/logiquest/${s.slug}`); }} className="flex h-full w-full flex-col items-center px-3 pb-3 pt-4 text-center outline-none" aria-expanded={open} aria-label={`${s.title}: open`}>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--c)]">{g.nav}</span>
          <motion.span animate={reduced ? undefined : { scale: open ? 0.88 : 1, y: open ? -3 : 0, opacity: open ? 0.35 : 1 }} transition={{ duration: 0.45, ease: SMOOTH }} className="mt-2 grid h-[3.75rem] w-[3.75rem] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_11%,transparent)]">
            <ContentIcon keyword={SUBJECT_ICON_KEY[s.slug] ?? "default"} className="h-11 w-11" />
          </motion.span>
          <span className="mt-2.5 line-clamp-2 text-[14px] font-bold leading-tight text-story-navy dark:text-foreground">{s.title}</span>
          <span className="mt-auto pt-1 text-[11px] font-semibold text-muted"><span className="tabular-nums">{s.topics.length}</span> topics · <span className="tabular-nums">{s.questions.toLocaleString("en-IN")}</span> {s.kind === "qa" ? "answers" : "Qs"}</span>
        </button>

        {/* back: eases up, then its contents follow one by one */}
        <motion.div
          initial={false}
          animate={{ y: open ? "0%" : "104%" }}
          transition={reduced ? { duration: 0 } : { duration: 0.46, ease: SMOOTH }}
          aria-hidden={!open}
          className={cn("absolute inset-0 flex flex-col gap-2 bg-[var(--c)] p-3.5 text-white", !open && "pointer-events-none")}
        >
          <motion.p {...item(0)} className="line-clamp-1 text-[13.5px] font-bold leading-tight">{s.title}</motion.p>
          <motion.p {...item(1)} className="line-clamp-2 text-[11.5px] leading-[1.4] text-white/85">{match ? <>Topic match: <strong>{match}</strong></> : s.desc}</motion.p>
          <motion.ul {...item(2)} className="flex flex-nowrap items-center gap-1 overflow-hidden">
            {shown.map((tp) => (
              <li key={tp.slug} className="min-w-0">
                <Link tabIndex={open ? 0 : -1} href={`/logiquest/${s.slug}/${tp.slug}`} className="block max-w-[5.6rem] truncate rounded-full bg-white/18 px-2 py-0.5 text-[10px] font-semibold transition-colors duration-200 hover:bg-white hover:text-[var(--c)]">{tp.title}</Link>
              </li>
            ))}
            {more > 0 ? <li className="shrink-0 px-1 text-[10px] font-bold text-white/80">+{more}</li> : null}
          </motion.ul>
          <motion.div {...item(3)} className="mt-auto">
            <Link tabIndex={open ? 0 : -1} href={`/logiquest/${s.slug}`} className="group flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--c)]">
              Open subject<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.li>
  );
}

/** Every subject, one section at a time: a solid colour intro panel beside the section's subjects. Filter by section or search any subject or topic. */
export function SubjectExplorer({ groups }: { groups: ExplorerGroup[] }) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const sections = useMemo(() => {
    const out: { g: ExplorerGroup; cards: CardData[] }[] = [];
    for (const g of groups) {
      if (group !== "all" && g.slug !== group) continue;
      const cards: CardData[] = [];
      for (const s of g.subjects) {
        if (!q) { cards.push({ g, s }); continue; }
        const hitTopic = s.topics.find((tp) => tp.title.toLowerCase().includes(q))?.title;
        const hitTitle = s.title.toLowerCase().includes(q);
        if (hitTitle || hitTopic) cards.push({ g, s, match: hitTitle ? undefined : hitTopic });
      }
      if (cards.length) out.push({ g, cards });
    }
    return out;
  }, [groups, group, q]);

  const total = sections.reduce((n, sec) => n + sec.cards.length, 0);
  const chip = (on: boolean) => cn("relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors", on ? "text-white" : "text-muted hover:text-story-royal");

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div role="tablist" aria-label="Sections" className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
          {[{ slug: "all", nav: "All sections" }, ...groups].map((g) => (
            <button key={g.slug} role="tab" aria-selected={group === g.slug} onClick={() => setGroup(g.slug)} className={chip(group === g.slug)}>
              {group === g.slug && <motion.span layoutId="lq-explorer-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{g.nav}</span>
            </button>
          ))}
        </div>
        <label className="relative flex items-center lg:w-80">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden />
          <span className="sr-only">Search subjects and topics</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a subject or topic" className="w-full rounded-full border border-border-soft bg-surface py-2.5 pl-11 pr-10 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-story-royal focus:shadow-[0_0_0_4px_rgba(31,86,214,0.12)]" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-story-mist hover:text-story-royal"><X className="h-3.5 w-3.5" /></button> : null}
        </label>
      </div>

      <div className="mt-8 space-y-12">
        <AnimatePresence initial={false} mode="popLayout">
          {sections.map(({ g, cards }) => {
            const color = GROUP_COLOR[g.slug] ?? "#2563eb";
            const qs = cards.reduce((n, c) => n + c.s.questions, 0);
            return (
              <motion.section key={g.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} aria-labelledby={`sec-${g.slug}`}>
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border-soft pb-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: color }}><SectionGlyph name={g.slug} color={color} solid animate className="h-7 w-7" /></span>
                    <div className="min-w-0">
                      <h3 id={`sec-${g.slug}`} className="text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">{g.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{g.desc}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted"><span style={{ color }}>{cards.length} {cards.length === 1 ? "subject" : "subjects"}</span> · {qs.toLocaleString("en-IN")} questions</p>
                </div>
                <motion.ul layout className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 min-[560px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  <AnimatePresence initial={false} mode="popLayout">
                    {cards.map((c, i) => <SubjectCard key={c.s.slug} {...c} i={i} />)}
                  </AnimatePresence>
                </motion.ul>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>
      {!total ? <p className="py-12 text-center text-sm text-muted">Nothing matches “{query}”. Try a shorter word, such as “time” or “java”.</p> : null}
    </div>
  );
}

export type TestTile = { slug: string; title: string; color: string };

/** Online tests panel: what a test is, then one tile per subject with its animated icon. Tiles tint and slide an arrow in on hover. */
export function TestsPanel({ tests }: { tests: TestTile[] }) {
  return (
    <section className="h-full rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-labelledby="lq-tests">
      <div className="flex items-center justify-between gap-3">
        <h2 id="lq-tests" className="flex items-center gap-2.5 text-lg font-bold text-story-navy dark:text-foreground">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-story-mist"><AnimatedClock className="h-7 w-7" /></span>
          Online tests
        </h2>
        <Link href="/logiquest/online-test" className="group inline-flex items-center gap-1 text-sm font-semibold text-story-royal">All tests<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-muted">
        {[{ Icon: AnimatedBook, k: "20 questions" }, { Icon: AnimatedClock, k: "30 minutes" }, { Icon: AnimatedTrending, k: "Instant score" }].map(({ Icon, k }) => (
          <li key={k} className="flex items-center justify-center gap-1.5 rounded-xl bg-story-mist px-2 py-2"><Icon className="h-5 w-5 shrink-0" /><span className="truncate">{k}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">Random questions from every topic, then a full answer review. Pick a subject to begin.</p>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3">
        {tests.map((x, i) => (
          <motion.li key={x.slug} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.04, ease: SMOOTH }} style={{ "--c": x.color } as React.CSSProperties}>
            <Link href={`/logiquest/online-test/${x.slug}`} className="group flex h-full items-center gap-2.5 rounded-2xl border border-border-soft bg-surface p-2.5 transition-[border-color,background-color] duration-300 hover:border-[color-mix(in_srgb,var(--c)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--c)_7%,transparent)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_11%,transparent)]"><ContentIcon keyword={SUBJECT_ICON_KEY[x.slug] ?? "default"} className="h-7 w-7" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold leading-tight text-story-navy dark:text-foreground">{x.title}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--c)]">Take test<ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" /></span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
