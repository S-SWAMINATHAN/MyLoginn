import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";

type Meta = { color: string; text: string; icon: string };

const META: Record<string, Meta> = {
  "/services/app-web-development": { color: "#2563eb", text: "Websites, apps and software built for you.", icon: "webdev" },
  "/services/ai-development": { color: "#7c3aed", text: "Chatbots, agents and AI workflows.", icon: "ai" },
  "/services/testing-automation": { color: "#d97706", text: "Manual and automated QA for web apps.", icon: "testing" },
  "/services/digital-marketing": { color: "#e11d48", text: "SEO, paid campaigns and social media.", icon: "marketing" },
  "/projects": { color: "#7c3aed", text: "Websites and products we have built and launched.", icon: "business" },
  "/internships": { color: "#059669", text: "Real work with mentor guidance.", icon: "career" },
  "/courses": { color: "#059669", text: "Learn technology skills with mentors.", icon: "student" },
  "/contact": { color: "#e11d48", text: "Talk to the team about your project.", icon: "comm" },
};
const FALLBACK: Meta[] = [
  { color: "#2563eb", text: "Learn more.", icon: "webdev" },
  { color: "#d97706", text: "Learn more.", icon: "business" },
];

function metaFor(href: string, i: number): Meta {
  if (META[href]) return META[href];
  if (href.startsWith("/courses/")) return META["/courses"];
  return FALLBACK[i % FALLBACK.length];
}

/** Colour-coded link cards to related pages: animated topic icon, short description and a sliding arrow. */
export function RelatedLinks({ related, wide }: { related: { href: string; label: string }[]; wide?: boolean }) {
  return (
    <nav aria-label="Related MyLoginn services" className="mt-14">
      <Reveal><span className="story-eyebrow">Explore more</span></Reveal>
      <h2 className="story-subheading mt-3 text-story-navy dark:text-foreground">Related services</h2>
      <RevealGroup className={`mt-6 grid gap-3 sm:grid-cols-2 ${wide ? "lg:grid-cols-4" : ""}`} stagger={0.06}>
        {related.map((r, i) => {
          const m = metaFor(r.href, i);
          return (
            <RevealItem key={r.href} className="h-full min-w-0">
              <Link
                href={r.href}
                style={{ "--c": m.color } as CSSProperties}
                className="group relative flex h-full items-center gap-3.5 overflow-hidden rounded-2xl border border-border-soft bg-surface p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--c)] hover:shadow-[0_16px_32px_-22px_var(--c)] active:scale-[0.98]"
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-[var(--c)] transition-transform duration-300 group-hover:scale-y-100" />
                <IconBadge size="sm" delay={i * 0.05} className="!h-12 !w-12 shrink-0"><ContentIcon keyword={m.icon} className="h-9 w-9" /></IconBadge>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-story-navy dark:text-foreground">{r.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{m.text}</span>
                </span>
                <span aria-hidden className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] transition-colors duration-300 group-hover:bg-[var(--c)] group-hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[180%]"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -translate-x-[180%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </nav>
  );
}
