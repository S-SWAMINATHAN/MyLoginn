import { ArrowLink } from "@/components/ui/ArrowLink";
import { CalendarClock, Send, UserCheck } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { localKeywords } from "@/lib/localSeo";
import { prisma } from "@/lib/prisma";
import { CAREERS_EMAIL } from "@/lib/careers";
import { effectiveStatus } from "@/lib/jobs";
import { siteUrl } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { CareersBoard, type PublicInternship, type PublicJob } from "@/components/careers/CareersBoard";

export const metadata = createPageMetadata({
  title: "Careers",
  description: "Careers at MyLoginn: current job openings, upcoming roles, internship opportunities and how to apply to join our web, app, AI and digital marketing team.",
  path: "/careers",
  keywords: [
    ...localKeywords(["IT jobs", "software developer jobs", "digital marketing jobs"]),
    "MyLoginn careers", "MyLoginn jobs", "MyLoginn hiring", "web developer jobs", "AI developer jobs", "internships",
  ],
});

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Send, title: "Apply", text: "Send your CV and a short note about the role or the work you want to do." },
  { icon: UserCheck, title: "Review", text: "Our team reviews every application and contacts shortlisted candidates." },
  { icon: CalendarClock, title: "Conversation", text: "A conversation about your skills, the role and how we work." },
];

export default async function CareersPage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Keep the page useful when the database is temporarily unavailable.
  const [rows, internshipRows] = await Promise.all([
    prisma.jobOpening.findMany({ where: { status: { not: "draft" } }, orderBy: { createdAt: "desc" }, take: 60 }).catch(() => []),
    prisma.internship.findMany({ where: { applyDeadline: { gte: yesterday } }, orderBy: { applyDeadline: "asc" }, take: 6 }).catch(() => []),
  ]);

  const jobs: PublicJob[] = [];
  let closedShown = 0;
  for (const j of rows) {
    const status = effectiveStatus(j);
    if (status === "draft") continue;
    if (status === "closed" && ++closedShown > 12) continue;
    jobs.push({
      id: j.id, title: j.title, team: j.team, type: j.type, location: j.location, experience: j.experience, salaryRange: j.salaryRange,
      positions: j.positions, summary: j.summary, responsibilities: j.responsibilities, requirements: j.requirements,
      status, openFrom: j.openFrom?.toISOString() ?? null, closeBy: j.closeBy?.toISOString() ?? null, postedAt: j.createdAt.toISOString(),
    });
  }
  const internships: PublicInternship[] = internshipRows.map((i) => ({
    id: i.id, slug: i.slug, title: i.title, type: i.type, location: i.location, durationWeeks: i.durationWeeks, applyDeadline: i.applyDeadline.toISOString(), open: true,
  }));

  // Structured data only for roles that are actually taking applications.
  const jsonLd = rows
    .filter((j) => effectiveStatus(j) === "open")
    .map((j) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: j.title,
      description: `${j.summary}\n\nResponsibilities: ${j.responsibilities.join("; ")}\n\nRequirements: ${j.requirements.join("; ")}`,
      datePosted: j.createdAt.toISOString().slice(0, 10),
      ...(j.closeBy ? { validThrough: j.closeBy.toISOString().slice(0, 10) } : {}),
      employmentType: j.type === "Full-time" ? "FULL_TIME" : j.type === "Part-time" ? "PART_TIME" : "CONTRACTOR",
      hiringOrganization: { "@type": "Organization", name: "MyLoginn", sameAs: siteUrl },
      jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, addressCountry: "IN" } },
      directApply: true,
    }));

  return (
    <div className="relative overflow-x-clip">
      <section className="px-5 pb-6 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal><span className="story-eyebrow">Careers</span></Reveal>
          <SplitHeadline as="h1" text="Build what businesses run on." className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-story-navy sm:text-6xl dark:text-foreground" />
          <Reveal direction="up" delay={0.12}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Join the MyLoginn team building web applications, mobile apps, AI agents and digital marketing for real businesses.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.2} className="mt-7 flex justify-center">
            <ArrowLink href="#openings">See job openings</ArrowLink>
          </Reveal>
        </div>
      </section>

      <CareersBoard jobs={jobs} internships={internships} email={CAREERS_EMAIL} />

      <section aria-label="How to apply" className="px-5 pb-20 pt-14 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">How to apply</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-2xl border border-border-soft bg-surface p-5">
                  <span className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center text-story-royal"><Icon className="h-[18px] w-[18px]" /></span>
                    <span className="font-mono text-xs font-semibold text-story-royal">0{i + 1}</span>
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-story-navy dark:text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    </div>
  );
}
