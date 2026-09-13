"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useReducedMotion";

type ScreenKey = "login" | "home" | "product" | "payment" | "notifications";
const SCREENS: ScreenKey[] = ["login", "home", "product", "payment", "notifications"];
const LABELS: Record<ScreenKey, string> = {
  login: "Login",
  home: "Home",
  product: "Product",
  payment: "Payment",
  notifications: "Notifications",
};

function Bar({ w = "100%", h = "0.6rem", tone = "light" }: { w?: string; h?: string; tone?: "light" | "brand" | "dark" }) {
  const bg = tone === "brand" ? "var(--story-royal)" : tone === "dark" ? "var(--story-navy)" : "var(--story-mist)";
  return <div style={{ width: w, height: h, background: bg, borderRadius: 999 }} />;
}

function ScreenContent({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case "login":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
          <div className="h-12 w-12 rounded-2xl" style={{ background: "linear-gradient(135deg,var(--story-royal),var(--story-cyan))" }} />
          <div className="mt-2 w-full space-y-2">
            <Bar h="2rem" />
            <Bar h="2rem" />
          </div>
          <div className="mt-2 w-full">
            <Bar h="2.2rem" tone="brand" />
          </div>
        </div>
      );
    case "home":
      return (
        <div className="flex h-full flex-col gap-3 px-4 pt-6">
          <Bar w="60%" h="1rem" tone="dark" />
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-xl" style={{ background: "var(--story-mist)" }} />
            ))}
          </div>
        </div>
      );
    case "product":
      return (
        <div className="flex h-full flex-col gap-2.5 px-4 pt-4">
          <div className="h-28 w-full rounded-xl" style={{ background: "linear-gradient(160deg,var(--brand-100),var(--story-mist))" }} />
          <Bar w="70%" h="0.9rem" tone="dark" />
          <Bar w="35%" h="0.75rem" />
          <div className="mt-auto mb-4">
            <Bar h="2.2rem" tone="brand" />
          </div>
        </div>
      );
    case "payment":
      return (
        <div className="flex h-full flex-col justify-center gap-3 px-5">
          <div className="h-20 rounded-xl p-3" style={{ background: "linear-gradient(135deg,var(--story-navy),var(--story-royal))" }}>
            <div className="h-3 w-8 rounded-sm bg-white/70" />
            <div className="mt-6 h-2 w-24 rounded-full bg-white/60" />
          </div>
          <Bar h="2.2rem" tone="brand" />
        </div>
      );
    case "notifications":
      return (
        <div className="flex h-full flex-col gap-3 px-4 pt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-full" style={{ background: "var(--brand-100)" }} />
              <div className="flex-1 space-y-1.5">
                <Bar w="80%" h="0.55rem" />
                <Bar w="55%" h="0.5rem" />
              </div>
            </div>
          ))}
        </div>
      );
  }
}

function PhoneMockup() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 2400);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const screen = SCREENS[reducedMotion ? 0 : index];

  return (
    <div className="relative mx-auto flex flex-col items-center">
      <div
        className="relative h-[420px] w-[210px] overflow-hidden rounded-[2.1rem] bg-white shadow-[var(--shadow-lift)]"
        style={{ border: "6px solid var(--story-navy)" }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-story-navy/80" />
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full pt-5"
          >
            <ScreenContent screen={screen} />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{LABELS[screen]}</p>

      <svg width="150" height="46" viewBox="0 0 150 46" className="mt-1 hidden sm:block" aria-hidden>
        <path d="M5,8 C55,-5 95,50 145,20" fill="none" stroke="var(--story-line)" strokeWidth="2" />
        {!reducedMotion && (
          <circle r="4" fill="var(--story-cyan)">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M5,8 C55,-5 95,50 145,20" />
          </circle>
        )}
      </svg>
      <span className="story-panel rounded-full px-4 py-1.5 text-xs font-semibold text-story-navy">Backend &amp; API</span>
    </div>
  );
}

export function MobileStory() {
  return (
    <Chapter formation="grid" variant="mobile" title="Mobile app development">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="order-2 lg:order-1">
          <PhoneMockup />
        </div>

        <div className="order-1 text-center lg:order-2 lg:text-left">
          <Reveal>
            <span className="story-eyebrow justify-center lg:justify-start">Mobile app development</span>
          </Reveal>

          <SplitHeadline
            as="h2"
            text="Apps people actually keep."
            className="story-subheading mx-auto mt-4 max-w-lg text-story-navy lg:mx-0"
          />

          <Reveal direction="up" delay={0.15}>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base lg:mx-0">
              Native-feel iOS and Android apps, built on the same backend as your website &mdash; one login,
              one source of truth, no duplicated work.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <p className="mx-auto mt-3 max-w-md text-xs uppercase tracking-[0.18em] text-muted lg:mx-0">
              Idea &rarr; UI &rarr; App &rarr; API &rarr; Data &rarr; User
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.4} className="mt-8 flex justify-center lg:justify-start">
            <Button href="/services/app-web-development" variant="outline">
              Plan a mobile app
            </Button>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
