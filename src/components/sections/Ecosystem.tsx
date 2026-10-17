"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedWordmark } from "@/components/ui/AnimatedWordmark";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";

const NODES = [
  { label: "Web Development", desc: "Sites & platforms", icon: "webdev" },
  { label: "Mobile Apps", desc: "iOS & Android", icon: "mobile" },
  { label: "Custom Software", desc: "Software shaped to fit", icon: "software" },
  { label: "Digital Marketing", desc: "Growth & visibility", icon: "marketing" },
  { label: "Automation Testing", desc: "Quality engineering", icon: "testing" },
  { label: "Mentoring", desc: "Guidance that compounds", icon: "leader" },
  { label: "Placement Support", desc: "From skills to opportunity", icon: "career" },
  { label: "AI Solutions", desc: "Agents & automation", icon: "ai" },
];

export function Ecosystem() {
  return (
    <Chapter formation="network" variant="ecosystem" id="ecosystem" title="What MyLoginn builds">
      <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">What we build</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="One ecosystem. Every layer your business needs."
          className="story-subheading mx-auto mt-4 max-w-2xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            Web, mobile, software, AI and training aren&apos;t separate vendors here &mdash; they&apos;re one connected
            team working from the same playbook.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4" stagger={0.07}>
          <RevealItem className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-2">
            <div className="story-panel flex h-full min-h-24 flex-col items-center justify-center rounded-2xl px-4 py-6 shadow-[var(--shadow-lift)]">
              <span className="sr-only">MyLoginn</span>
              <AnimatedWordmark size="h-3 sm:h-3.5" delay={0.3} />
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Core</span>
            </div>
          </RevealItem>
          {NODES.map((n) => (
            <RevealItem key={n.label}>
              <NodeChip {...n} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}

function NodeChip({ label, desc, icon, className }: { label: string; desc: string; icon: string; className?: string }) {
  const reduced = useReducedMotion();
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Touch screens have no hover: a tap opens the icon, and a tap anywhere else closes it again.
  useEffect(() => {
    if (!hovered) return;
    const close = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !ref.current?.contains(e.target as Node)) setHovered(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [hovered]);

  return (
    <motion.article
      ref={ref}
      onPointerMove={(event) => { if (event.pointerType === "mouse") { setHovered(true); onMouseMove(event); } }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") { setHovered(false); onMouseLeave(); } }}
      onPointerUp={(event) => { if (event.pointerType !== "mouse") setHovered((open) => !open); }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "group relative flex h-full min-h-24 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border-soft bg-surface/90 px-3 py-5 text-center transition-[border-color,box-shadow] duration-300 hover:border-brand-300 hover:shadow-[0_16px_34px_-18px_rgba(31,86,214,0.6)]",
        className
      )}
    >
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: spotlightBg, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.22 }} />
      <div className={cn("relative z-10 flex flex-col items-center transition-transform duration-300 ease-out", hovered && !reduced && "sm:-translate-x-5")}>
        <span className="text-sm font-semibold text-foreground sm:text-base">{label}</span>
        <span className="mt-1 text-[10.5px] text-muted sm:text-xs">{desc}</span>
      </div>

      {/* Related animated icon: springs in from the right on hover, with a soft halo and a gentle float. */}
      <AnimatePresence>
        {hovered && !reduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute right-1.5 top-1.5 z-10 grid h-10 w-10 place-items-center sm:right-3 sm:top-1/2 sm:h-12 sm:w-12 sm:-translate-y-1/2"
            initial={{ opacity: 0, scale: 0.3, x: 24, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4, x: 16, rotate: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <motion.span className="absolute inset-0 rounded-full bg-brand-100/70 dark:bg-brand-900/40" initial={{ scale: 0.6 }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
            <motion.span className="relative h-7 w-7 sm:h-9 sm:w-9" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
              <ContentIcon keyword={icon} className="h-7 w-7 sm:h-9 sm:w-9" />
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
