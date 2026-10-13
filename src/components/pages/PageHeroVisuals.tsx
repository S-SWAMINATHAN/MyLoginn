"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { Mail, MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Chip, MonitorFrame } from "@/components/services/testing/TestingVisuals";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const stagger = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 14, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } } };

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

/* ---------------- Courses ---------------- */

const TRACKS = [
  { name: "AI & Data", items: [{ icon: "ai", t: "Generative AI" }, { icon: "data", t: "Data Analytics" }, { icon: "ml", t: "Prompt Engineering" }] },
  { name: "Web & Cloud", items: [{ icon: "webdev", t: "Full-Stack Development" }, { icon: "python", t: "Python" }, { icon: "cloud", t: "Cloud Engineering" }] },
  { name: "Quality & Growth", items: [{ icon: "testing", t: "Automation Testing" }, { icon: "ai", t: "Testing with AI" }, { icon: "marketing", t: "Digital Marketing" }] },
];

export function CoursesHeroVisual({ accent }: { accent?: StaticImageData }) {
  const { index, pick } = useAutoIndex(TRACKS.length, 4200);
  const track = TRACKS[index];
  return (
    <MonitorFrame
      interactive
      accent={accent}
      title="myloginn.com/courses · learning tracks"
      label={track.name}
      pill="Mentor-Led Courses"
      ariaLabel="Preview of course learning tracks. Choose a track to see example topics."
      controls={TRACKS.map((t, i) => <Chip key={t.name} active={i === index} onClick={() => pick(i)}>{t.name}</Chip>)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={track.name} className="relative h-full" exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
          <motion.ol variants={stagger} initial="hidden" animate="show" className="relative flex h-full flex-col justify-center gap-2.5">
            <span aria-hidden className="absolute bottom-[18%] left-[1.4rem] top-[18%] w-px bg-border-soft" />
            {track.items.map((it) => (
              <motion.li key={it.t} variants={rise} className="relative flex items-center gap-3 rounded-2xl border border-border-soft bg-surface px-3 py-2.5">
                <ContentIcon keyword={it.icon} className="h-9 w-9 shrink-0" />
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{it.t}</p>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </AnimatePresence>
    </MonitorFrame>
  );
}

/* ---------------- Projects ---------------- */

export function Counter({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduced]);
  return <>{n}</>;
}

const SHOTS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48", "#0891b2"];

export function ProjectsHeroVisual({ projectCount, liveCount, industryCount, accent }: { projectCount: number; liveCount: number; industryCount: number; accent?: StaticImageData }) {
  const SCREENS = ["Overview", "Showcase"] as const;
  const { index, pick } = useAutoIndex(SCREENS.length, 5200);
  const screen = SCREENS[index];
  const stats = [
    { v: projectCount, l: "Projects delivered", icon: "webdev" },
    { v: liveCount, l: "Live products", icon: "cloud" },
    { v: industryCount, l: "Industries served", icon: "business" },
  ];
  return (
    <MonitorFrame
      interactive
      accent={accent}
      title="myloginn.com/projects · portfolio"
      label={screen}
      pill="Real Projects. Real Impact."
      ariaLabel="Portfolio preview showing project totals and a showcase of work."
      controls={SCREENS.map((s, i) => <Chip key={s} active={i === index} onClick={() => pick(i)}>{s}</Chip>)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={screen} className="h-full" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {screen === "Overview" ? (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid h-full grid-cols-3 gap-2.5">
              {stats.map((s) => (
                <motion.div key={s.l} variants={rise} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border-soft p-2 text-center">
                  <ContentIcon keyword={s.icon} className="h-9 w-9" />
                  <p className="text-2xl font-bold tabular-nums text-story-navy dark:text-foreground"><Counter value={s.v} /></p>
                  <p className="text-[10px] leading-tight text-muted">{s.l}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid h-full grid-cols-3 grid-rows-2 gap-2.5">
              {SHOTS.map((c, i) => (
                <motion.div key={c} variants={rise} whileHover={{ y: -3 }} className="flex flex-col overflow-hidden rounded-xl border border-border-soft bg-surface">
                  <div className="flex items-center gap-0.5 border-b border-border-soft px-1.5 py-1"><span className="h-1 w-1 rounded-full bg-border-soft" /><span className="h-1 w-1 rounded-full bg-border-soft" /><span className="h-1 w-1 rounded-full bg-border-soft" /></div>
                  <div className="flex flex-1 flex-col gap-1 p-1.5">
                    <div className="h-2 w-2/3 rounded-full" style={{ background: c }} />
                    <div className="h-1.5 w-full rounded-full bg-story-mist" />
                    <div className="mt-auto flex gap-1">{[0, 1].map((n) => <div key={n} className="h-4 flex-1 rounded" style={{ background: `color-mix(in srgb, ${c} ${n ? 14 : 28}%, transparent)` }} />)}</div>
                  </div>
                  <span className="sr-only">Sample project {i + 1}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </MonitorFrame>
  );
}

/* ---------------- Contact ---------------- */

type Channel = { key: string; label: string; Icon: LucideIcon; color: string };
const CHANNELS: Channel[] = [
  { key: "email", label: "Email", Icon: Mail, color: "#2563eb" },
  { key: "call", label: "Call", Icon: Phone, color: "#059669" },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle, color: "#16a34a" },
  { key: "form", label: "Enquiry form", Icon: Send, color: "#7c3aed" },
];

export function ContactHeroVisual({ email, phones, whatsappHref, hours, accent }: { email: string; phones: { display: string; tel: string }[]; whatsappHref: string; hours: string; accent?: StaticImageData }) {
  const { index, pick } = useAutoIndex(CHANNELS.length, 4200);
  const ch = CHANNELS[index];
  const link = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95";
  return (
    <div className="relative mx-auto w-full max-w-md rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
      {accent && (
        <motion.div aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 w-14 -translate-y-1/3 translate-x-[12%] select-none min-[420px]:w-[4.5rem] sm:w-24 sm:translate-x-1/2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }} transition={{ opacity: { duration: 0.5, delay: 0.4 }, scale: { duration: 0.5, delay: 0.4 }, y: { duration: 4.5, delay: 1, repeat: Infinity, ease: "easeInOut" } }}>
          <Image src={accent} alt="" sizes="96px" className="h-auto w-full object-contain drop-shadow-[0_10px_16px_rgba(11,31,77,0.22)]" />
        </motion.div>
      )}
      <p className="px-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">How would you like to reach us?</p>

      <div role="radiogroup" aria-label="Contact channel" className="mt-4 grid grid-cols-4">
        {CHANNELS.map((c, i) => {
          const on = i === index;
          return (
            <button key={c.key} type="button" role="radio" aria-checked={on} onClick={() => pick(i)} className="group flex flex-col items-center gap-1.5 outline-none">
              <motion.span className="grid h-12 w-12 place-items-center rounded-full" animate={{ backgroundColor: on ? c.color : "#f1f5fb", color: on ? "#ffffff" : c.color }} transition={{ duration: 0.25 }}>
                <c.Icon className="h-5 w-5" />
              </motion.span>
              <span className={cn("text-[11px] font-semibold transition-colors", on ? "text-foreground" : "text-muted")}>{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-5 min-h-[7.5rem] rounded-2xl bg-story-mist p-4 text-center" aria-live="polite">
        <motion.span aria-hidden className="absolute -top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-story-mist" initial={false} animate={{ left: `${((index + 0.5) / CHANNELS.length) * 100}%` }} transition={{ type: "spring", stiffness: 260, damping: 26 }} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={ch.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-2.5">
            {ch.key === "email" && (<><p className="break-all text-sm font-semibold">{email}</p><a href={`mailto:${email}`} className={link} style={{ background: ch.color }}>Write an email</a></>)}
            {ch.key === "call" && (<><div className="flex flex-wrap justify-center gap-x-4 gap-y-1">{phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`} className="text-sm font-semibold hover:underline">{p.display}</a>)}</div><p className="text-xs text-muted">{hours}</p><a href={`tel:${phones[0]?.tel}`} className={link} style={{ background: ch.color }}>Call now</a></>)}
            {ch.key === "whatsapp" && (<><p className="text-sm font-semibold">Chat with the team</p><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={link} style={{ background: ch.color }}>Start a chat</a></>)}
            {ch.key === "form" && (<><p className="text-sm font-semibold">Tell us what you need</p><a href="#contact-form" className={link} style={{ background: ch.color }}>Open the form</a></>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
