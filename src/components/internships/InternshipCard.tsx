"use client";

import Link from "next/link";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

export type InternshipCardData = {
  id: string;
  title: string;
  slug: string;
  company: string;
  type: string;
  paid: boolean;
  stipend: number | null;
  location: string;
  durationWeeks: number;
  applyDeadline: string;
  featured: boolean;
};

export function InternshipCard({ internship, applied }: { internship: InternshipCardData; applied: boolean; index?: number }) {
  const daysLeft = Math.ceil((new Date(internship.applyDeadline).getTime() - Date.now()) / 86400000);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1">
      <div className="brand-gradient-bg relative flex h-28 items-end p-5 text-white">
        {internship.featured && <span className="absolute left-4 top-4 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold">Featured</span>}
        <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase">{internship.type}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="font-semibold group-hover:text-brand-500">{internship.title}</h3><p className="mt-1 text-sm text-muted">{internship.company}</p></div>
          {applied && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs text-success"><AnimatedSuccess className="h-3.5 w-3.5" />Applied</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><AnimatedMapPin className="h-4 w-4" />{internship.location}</span>
          <span className="inline-flex items-center gap-1"><AnimatedClock className="h-4 w-4" />{internship.durationWeeks} weeks</span>
          <span className="inline-flex items-center gap-1"><AnimatedRupee className="h-4 w-4" />{internship.paid ? `₹${internship.stipend?.toLocaleString() ?? 0}` : "Unpaid"}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border-soft pt-4">
          <span className="text-xs text-muted">{daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}</span>
          <Link href={`/internships/${internship.slug}`} className="rounded-full brand-gradient-bg px-3.5 py-1.5 text-xs font-medium text-white">View details</Link>
        </div>
      </div>
    </article>
  );
}
