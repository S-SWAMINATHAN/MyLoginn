import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type Meta = { color: string; text: string; icon: ReactNode };

const META: Record<string, Meta> = {
  "/services/app-web-development": { color: "#2563eb", text: "Websites, apps and software built around your business.", icon: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></> },
  "/services/ai-development": { color: "#7c3aed", text: "Chatbots, agents and AI-assisted workflows.", icon: <><rect x="5" y="7" width="14" height="11" rx="3" /><path d="M12 7V4M9.5 12v1.5M14.5 12v1.5" /></> },
  "/services/testing-automation": { color: "#d97706", text: "Manual and automated QA for web applications.", icon: <><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" /></> },
  "/services/digital-marketing": { color: "#e11d48", text: "SEO, paid campaigns and social media.", icon: <><path d="M3 11v3l12 5V6z" /><path d="M15 9a3 3 0 0 1 0 6" /></> },
  "/courses": { color: "#059669", text: "Learn testing and technology skills with MyLoginn.", icon: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></> },
  "/contact": { color: "#e11d48", text: "Talk to the team about your project.", icon: <path d="M4 5h16v11H8l-4 4z" /> },
};
const FALLBACK: Meta[] = [
  { color: "#2563eb", text: "Learn more.", icon: <path d="M5 12h14M13 6l6 6-6 6" /> },
  { color: "#d97706", text: "Learn more.", icon: <path d="M5 12h14M13 6l6 6-6 6" /> },
];

function metaFor(href: string, i: number): Meta {
  if (META[href]) return META[href];
  if (href.startsWith("/courses/")) return META["/courses"];
  return FALLBACK[i % FALLBACK.length];
}

/** Compact, colour-coded tiles linking to related pages. Shared by every redesigned service page. */
export function RelatedLinks({ related }: { related: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Related MyLoginn services" className="mt-14">
      <Reveal><span className="story-eyebrow">Explore more</span></Reveal>
      <h2 className="story-subheading mt-3 text-story-navy dark:text-foreground">Related services</h2>
      <RevealGroup className="mt-5 grid gap-2.5 sm:grid-cols-2" stagger={0.06}>
        {related.map((r, i) => {
          const m = metaFor(r.href, i);
          return (
            <RevealItem key={r.href}>
              <Link
                href={r.href}
                title={m.text}
                style={{ "--c": m.color } as CSSProperties}
                className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border-soft bg-surface py-2 pl-2 pr-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--c)] hover:shadow-[0_8px_20px_-12px_var(--c)] active:scale-[0.98]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] transition-colors duration-200 group-hover:bg-[var(--c)] group-hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{m.icon}</svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{r.label}</span>
                <span aria-hidden className="text-sm text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--c)]">→</span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </nav>
  );
}
