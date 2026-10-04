"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

type CelebrationType = "topic" | "module" | "course";
type CelebrationDetail = {
  topicSlug?: string;
  completionType?: CelebrationType;
  courseTitle?: string;
  moduleTitle?: string;
  nextHref?: string;
  pointsEarned?: number;
};

function CelebrationArt({ type }: { type: CelebrationType }) {
  const label = type === "course" ? "Course completion" : type === "module" ? "Module completion" : "Lesson completion";
  return <svg viewBox="0 0 220 150" role="img" aria-label={`${label} animation`} className="h-36 w-52 overflow-visible">
    <defs>
      <linearGradient id="completion-card" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#eef4ff"/></linearGradient>
      <linearGradient id="completion-check" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4f7cff"/><stop offset="1" stopColor="#15b8a6"/></linearGradient>
      <filter id="completion-shadow" x="-30%" y="-25%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#284779" floodOpacity=".14"/></filter>
    </defs>
    <circle cx="110" cy="72" r="62" fill="#f1f6ff"/>
    <circle cx="110" cy="72" r="52" fill="none" stroke="#dbe7fb" strokeWidth="1.5" strokeDasharray="3 7" />
    <circle cx="110" cy="10" r="7" fill="#35b6c4" opacity=".14" className="motion-safe:animate-pulse" />
    <circle cx="110" cy="10" r="4" fill="#35b6c4" />
    <g className="motion-safe:animate-[completion-float_3.8s_ease-in-out_infinite] motion-reduce:animate-none" filter="url(#completion-shadow)">
      <rect x="76" y="23" width="68" height="96" rx="20" fill="url(#completion-card)" stroke="#d8e3f4" strokeWidth="1.5" />
      {type === "course" ? <g fill="none" stroke="#536fbd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M98 49h24v15a12 12 0 0 1-24 0V49Z"/><path d="M98 54h-8v5a10 10 0 0 0 9 10m23-15h8v5a10 10 0 0 1-9 10m-11 7v9m-9 0h18"/><path d="m106 58 4 4 7-8" stroke="#11a996"/></g> : type === "module" ? <g fill="none" stroke="#536fbd" strokeWidth="3" strokeLinecap="round"><path d="M95 49h30M95 61h30M95 73h21M95 85h18"/><path d="m119 83 5 5 9-11" stroke="#11a996"/></g> : <g fill="none" stroke="#536fbd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M92 47h36v43H92z"/><path d="M99 57h22M99 65h22M99 73h15"/><path d="m101 82 5 5 10-11" stroke="#11a996"/></g>}
      <circle cx="139" cy="106" r="17" fill="url(#completion-check)" stroke="#fff" strokeWidth="4" />
      <path d="m131 106 5 5 10-11" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <circle cx="48" cy="54" r="3.5" fill="#859fe0" className="motion-safe:animate-pulse" />
    <circle cx="171" cy="87" r="4" fill="#74c9c1" className="motion-safe:animate-pulse" />
  </svg>;
}

export function ChallengeCelebration({ topicSlug }: { topicSlug: string }) {
  const [celebration, setCelebration] = useState<CelebrationDetail | null>(null);

  useEffect(() => {
    function onCelebrate(event: Event) {
      const detail = (event as CustomEvent<CelebrationDetail>).detail;
      if (detail?.topicSlug === topicSlug && detail.completionType) setCelebration(detail);
    }
    window.addEventListener("myloginn:challenge-celebrated", onCelebrate);
    return () => window.removeEventListener("myloginn:challenge-celebrated", onCelebrate);
  }, [topicSlug]);

  if (!celebration) return null;
  const type = celebration.completionType ?? "topic";
  const title = type === "course" ? "Course completed!" : type === "module" ? "Module completed!" : "Lesson completed!";
  const message = type === "course"
    ? `You completed every topic in ${celebration.courseTitle ?? "the course"}. That is a fantastic achievement!`
    : type === "module"
      ? `You finished ${celebration.moduleTitle ?? "this module"}. Keep your momentum going!`
      : "Your challenge passed and this lesson is now complete. Ready for the next one?";
  const href = celebration.nextHref ?? "/courses";
  const buttonText = type === "course" ? "View course" : "Continue to next lesson";

  return <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="challenge-celebration-title" className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white px-6 pb-6 pt-5 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <button type="button" onClick={() => setCelebration(null)} aria-label="Close completion message" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface-2"><X className="h-4 w-4" /></button>
      <div className="mx-auto flex h-36 items-center justify-center"><CelebrationArt type={type} /></div>
      <div className="mx-auto mt-1 flex items-center justify-center gap-1.5 opacity-65"><Image src="/myloginn-logo.png" alt="" width={18} height={18} className="h-4 w-4 object-contain"/><span className="text-[10px] font-bold">MyLoginn Learning</span></div>
      <h2 id="challenge-celebration-title" className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
      {(celebration.pointsEarned ?? 0) > 0 && <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">+{celebration.pointsEarned} points earned</p>}
      <Link href={href} onClick={() => setCelebration(null)} className="mt-5 inline-flex items-center gap-2 rounded-full brand-gradient-bg px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)]">{buttonText}<ArrowRight className="h-4 w-4" /></Link>
    </section>
  </div>;
}
