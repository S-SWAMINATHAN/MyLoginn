"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLiveData } from "@/components/admin/useLiveData";
import { AreaChart, Delta, Funnel, Sparkline } from "@/components/admin/AdminCharts";
import { BarList, Donut, LiveNumber, type Datum } from "@/components/admin/charts";
import { shortDay } from "@/components/admin/format";

type Metric = { key: string; label: string; series: number[]; total: number; previous: number; change: number | null };
type Analytics = {
  days: number;
  keys: string[];
  metrics: Metric[];
  coursePerformance: { id: string; title: string; category: string; enrollments: number; avgProgress: number; revenue: number }[];
  funnel: { label: string; value: number }[];
  leadsByService: Datum[];
  applicationsByStatus: Datum[];
  usersByRole: Datum[];
};

const RANGES = [7, 14, 30, 90] as const;
const COLORS: Record<string, string> = { signups: "#2563eb", enrollments: "#7c3aed", revenue: "#059669", leads: "#d97706", applications: "#e11d48", active: "#0891b2" };

function Card({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-border-soft bg-surface p-5 sm:p-6", className)}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-story-navy dark:text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** Deeper analytics: trends with period comparison, learner funnel, course performance and enquiry breakdowns. */
export function AdminAnalytics() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [metric, setMetric] = useState("revenue");
  const { data, loading, error } = useLiveData<Analytics>(`/api/admin/analytics?days=${days}`, { intervalMs: 60_000 });
  const metrics = data?.metrics ?? [];
  const current = metrics.find((m) => m.key === metric) ?? metrics[0];
  const labels = useMemo(() => (data?.keys ?? []).map(shortDay), [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="story-eyebrow">Insights</span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Analytics</h2>
          <p className="mt-1 text-sm text-muted">How learners, revenue and enquiries are trending, compared with the previous {days} days.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/admin/export?type=users" className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal">
            <Download className="h-3.5 w-3.5" /> Export users
          </a>
          <div role="radiogroup" aria-label="Date range" className="flex rounded-full bg-story-mist p-1">
            {RANGES.map((r) => (
              <button key={r} type="button" role="radio" aria-checked={days === r} onClick={() => setDays(r)} className={cn("relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors", days === r ? "text-white" : "text-muted hover:text-story-royal")}>
                {days === r && <motion.span layoutId="an-range" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{r}d</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      {/* metric comparison */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(metrics.length ? metrics : Array.from({ length: 6 }, (_, i) => ({ key: `s${i}`, label: "", series: [], total: 0, previous: 0, change: 0 }))).map((m, i) => (
          <motion.button
            key={m.key}
            type="button"
            onClick={() => setMetric(m.key)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            aria-pressed={m.key === metric}
            className={cn("rounded-2xl border bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]", m.key === metric ? "border-story-royal/50" : "border-border-soft")}
          >
            {m.label ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted">{m.label}</p>
                  <Delta value={m.change} />
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <LiveNumber value={m.total} prefix={m.key === "revenue" ? "₹" : ""} className="block text-2xl font-bold tabular-nums text-story-navy dark:text-foreground" />
                    {m.key !== "active" && <p className="mt-0.5 text-[11px] text-muted">vs {m.key === "revenue" ? "₹" : ""}{m.previous.toLocaleString("en-IN")} before</p>}
                  </div>
                  <Sparkline values={m.series} color={COLORS[m.key]} />
                </div>
              </>
            ) : (
              <div className="h-16 animate-pulse rounded-xl bg-story-mist" />
            )}
          </motion.button>
        ))}
      </div>

      <Card title={current?.label ?? "Trend"} hint={`Daily, last ${days} days. Hover the chart to read a day.`}>
        {current ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${current.key}-${days}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AreaChart values={current.series} labels={labels} color={COLORS[current.key]} height={220} format={(n) => `${current.key === "revenue" ? "₹" : ""}${n.toLocaleString("en-IN")}`} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-56 animate-pulse rounded-2xl bg-story-mist" />
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Learner funnel" hint="From sign-up to a paid course, across all time.">
          {data ? <Funnel steps={data.funnel} /> : <div className="h-40 animate-pulse rounded-2xl bg-story-mist" />}
        </Card>
        <Card title="Enquiries by service" hint="What visitors ask about most.">
          <BarList data={data?.leadsByService ?? []} />
        </Card>
      </div>

      <Card title="Course performance" hint="Top courses by enrolments, with average learner progress and revenue.">
        {data?.coursePerformance.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border-soft text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="pb-2 pr-3">Course</th>
                  <th className="pb-2 pr-3 text-right">Enrolments</th>
                  <th className="pb-2 pr-3">Avg. progress</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.coursePerformance.map((c) => (
                  <tr key={c.id} className="border-b border-border-soft/60 last:border-0">
                    <td className="py-3 pr-3"><p className="font-semibold">{c.title}</p><p className="text-xs text-muted">{c.category}</p></td>
                    <td className="py-3 pr-3 text-right font-bold tabular-nums">{c.enrollments}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-story-mist"><motion.div className="h-full rounded-full bg-story-royal" initial={{ width: 0 }} whileInView={{ width: `${c.avgProgress}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} /></div><span className="text-xs tabular-nums text-muted">{c.avgProgress}%</span></div>
                    </td>
                    <td className="py-3 text-right font-bold tabular-nums">{c.revenue ? `₹${c.revenue.toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">{loading ? "Loading…" : "Course data will appear as learners enrol."}</p>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Internship applications" hint="By review status.">
          <Donut data={data?.applicationsByStatus ?? []} unit="applications" />
        </Card>
        <Card title="Accounts by role">
          <Donut data={data?.usersByRole ?? []} unit="accounts" />
        </Card>
      </div>
    </div>
  );
}
