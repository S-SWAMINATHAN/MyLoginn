"use client";

import { Rich } from "@/components/careers/Rich";
import { DEFAULT_COMPANY, type Posting } from "@/lib/postings";
import { cn } from "@/lib/cn";

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {text.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line"><Rich text={p.trim()} /></p>)}
    </div>
  );
}

const Heading = ({ children }: { children: React.ReactNode }) => <h3 className="mt-6 text-[15px] font-bold text-story-navy dark:text-foreground">{children}</h3>;

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-story-royal" />
          <span><Rich text={item} /></span>
        </li>
      ))}
    </ul>
  );
}

/** Ghost line shown where a section has not been written yet, so the admin sees the full shape of the posting. */
const Empty = ({ children }: { children: React.ReactNode }) => <p className="mt-2 rounded-xl border border-dashed border-border-soft px-3 py-2 text-xs italic text-muted/80">{children}</p>;

/**
 * How the posting reads, laid out like a standard job description: the header facts, then each section in order.
 * Empty optional sections are left out; empty required ones show a placeholder.
 */
export function PostingPreview({ posting, extras }: { posting: Posting; extras: string[] }) {
  const p = posting;
  const facts: [string, string][] = [
    ["Company", p.company || DEFAULT_COMPANY],
    ["Role", p.title || "—"],
    ["Job Type", p.jobType || "—"],
    ["Work Mode", p.workMode],
    ...(p.location.trim() ? ([["Location", p.location.trim()]] as [string, string][]) : []),
  ];

  return (
    <article className="text-sm leading-6 text-foreground/85">
      <h2 className={cn("text-2xl font-bold tracking-tight", p.title ? "text-story-navy dark:text-foreground" : "text-muted/60")}>{p.title || "Role title"}</h2>

      <dl className="mt-3 space-y-0.5">
        {facts.map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <dt className="font-semibold text-story-navy dark:text-foreground">{k}:</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {extras.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {extras.map((e) => <span key={e} className="rounded-full bg-story-mist px-2.5 py-0.5 text-[11px] font-semibold text-story-royal">{e}</span>)}
        </div>
      )}

      <Heading>About the Role</Heading>
      {p.about.trim() ? <Paragraphs text={p.about.trim()} className="mt-2" /> : <Empty>Describe the role in two or three short paragraphs.</Empty>}

      <Heading>Key Responsibilities</Heading>
      {p.responsibilities.length ? <Bullets items={p.responsibilities} /> : <Empty>Add at least one responsibility.</Empty>}

      <Heading>Requirements</Heading>
      {p.requirements.length ? <Bullets items={p.requirements} /> : <Empty>Add at least one requirement.</Empty>}

      {p.goodToHave.length > 0 && (<><Heading>Good to Have</Heading><Bullets items={p.goodToHave} /></>)}
      {p.benefits.length > 0 && (<><Heading>What You&apos;ll Gain</Heading><Bullets items={p.benefits} /></>)}
      {p.idealCandidate.trim() && (<><Heading>Who We&apos;re Looking For</Heading><Paragraphs text={p.idealCandidate.trim()} className="mt-2" /></>)}

      <p className="mt-6 border-t border-border-soft pt-4">
        <span className="font-semibold text-story-navy dark:text-foreground">Apply Now:</span>{" "}
        {p.applyUrl.trim() ? <span className="break-all text-story-royal">{p.applyUrl.trim()}</span> : <span className="text-muted">On the MyLoginn careers page</span>}
      </p>
    </article>
  );
}
