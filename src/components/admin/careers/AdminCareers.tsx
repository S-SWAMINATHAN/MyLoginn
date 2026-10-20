"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLiveData } from "@/components/admin/useLiveData";
import { OpeningsPanel } from "@/components/admin/careers/OpeningsPanel";
import { InternshipsPanel } from "@/components/admin/careers/InternshipsPanel";
import { ApplicationsPanel } from "@/components/admin/careers/ApplicationsPanel";
import type { ApplicationsResponse, InternshipRow, JobRow } from "@/lib/careerTypes";

export type CareersTab = "openings" | "internships" | "applications";
type Tab = CareersTab;

/** Careers control room: manage roles (current, upcoming, closed, drafts), internships, and review every candidate. */
export function AdminCareers({ initialTab = "openings" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [jobFilter, setJobFilter] = useState<string | null>(null);
  const [kindPreset, setKindPreset] = useState<"all" | "job" | "internship">("all");

  const jobs = useLiveData<{ jobs: JobRow[] }>("/api/admin/jobs", { intervalMs: 30_000 });
  const interns = useLiveData<{ internships: InternshipRow[] }>("/api/admin/careers/internships", { intervalMs: 30_000 });
  const apps = useLiveData<ApplicationsResponse>("/api/admin/careers/applications?kind=all", { intervalMs: 30_000 });

  const jobList = jobs.data?.jobs ?? [];
  const internList = interns.data?.internships ?? [];
  const liveRoles = jobList.filter((j) => j.effective === "open").length;
  const openInterns = internList.filter((i) => i.open).length;
  const fresh = apps.data?.counts.unreviewed ?? 0;
  const total = apps.data?.counts.all ?? 0;

  const refreshAll = () => { jobs.refresh(); interns.refresh(); apps.refresh(); };
  const jobTitle = jobList.find((j) => j.id === jobFilter)?.title;

  const tabs: { id: Tab; label: string; icon: typeof Briefcase; badge?: number }[] = [
    { id: "openings", label: "Job openings", icon: Briefcase, badge: jobList.length },
    { id: "internships", label: "Internships", icon: GraduationCap, badge: internList.length },
    { id: "applications", label: "Applications", icon: Inbox, badge: fresh || undefined },
  ];

  const stats = [
    { label: "Roles open now", value: liveRoles },
    { label: "Opening soon", value: jobList.filter((j) => j.effective === "upcoming").length },
    { label: "Internships open", value: openInterns },
    { label: "Applications", value: total, sub: fresh ? `${fresh} not reviewed` : "All reviewed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Careers</h1>
        <p className="mt-1 text-sm text-muted">Write job openings and internships as structured postings, open or close them (there are no end dates), and review every CV in one place. Changes show on the public site straight away.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border-soft bg-surface p-4">
            <p className="text-xs font-semibold text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-story-navy dark:text-foreground">{s.value}</p>
            {s.sub && <p className={cn("mt-0.5 text-xs", fresh ? "font-semibold text-rose-600" : "text-muted")}>{s.sub}</p>}
          </div>
        ))}
      </div>

      <div role="tablist" aria-label="Careers sections" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-story-mist p-1">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); if (t.id === "applications" && tab !== "applications") { setJobFilter(null); setKindPreset("all"); } }} className={cn("relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === t.id ? "text-white" : "text-muted hover:text-story-royal")}>
            {tab === t.id && <motion.span layoutId="careers-tab-pill" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <t.icon className="relative h-4 w-4" />
            <span className="relative">{t.label}</span>
            {t.badge ? <span className={cn("relative rounded-full px-1.5 text-[11px] tabular-nums", tab === t.id ? "bg-white/20" : t.id === "applications" ? "bg-rose-500 text-white" : "bg-surface text-muted")}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === "openings" && (
        <OpeningsPanel jobs={jobList} loading={jobs.loading} refresh={refreshAll} onViewApplications={(id) => { setJobFilter(id); setKindPreset("job"); setTab("applications"); }} />
      )}
      {tab === "internships" && (
        <InternshipsPanel internships={internList} loading={interns.loading} refresh={refreshAll} onViewApplications={() => { setJobFilter(null); setKindPreset("internship"); setTab("applications"); }} />
      )}
      {tab === "applications" && (
        <ApplicationsPanel key={`${jobFilter ?? "any"}-${kindPreset}`} presetJobId={jobFilter ?? undefined} presetKind={kindPreset} jobTitle={jobTitle} clearJob={() => { setJobFilter(null); setKindPreset("all"); }} />
      )}
    </div>
  );
}
