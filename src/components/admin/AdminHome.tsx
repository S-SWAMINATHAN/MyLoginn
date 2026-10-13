"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, BookOpen, CircleDollarSign, Download, GraduationCap, Inbox, Mail, Megaphone, MessageSquare, Trophy, UserPlus, Users, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useLiveData } from "@/components/admin/useLiveData";
import { AreaChart, Delta, Sparkline } from "@/components/admin/AdminCharts";
import { BarList, Donut, LiveNumber, type Datum } from "@/components/admin/charts";
import { greeting, shortDay, timeAgo } from "@/components/admin/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type Metric = { key: string; label: string; series: number[]; total: number; previous: number; change: number | null };
type Analytics = { days: number; keys: string[]; metrics: Metric[] };
type Overview = {
  stats: { totalUsers: number; mentors: number; activeCourses: number; enrollments: number; totalRevenue: number; pendingPayments: number };
  revenueByCourse: Datum[];
  enrollmentsByCategory: Datum[];
  recent: { id: string; user: string; email: string; course: string; amount: number; payment: string; status: string; date: string }[];
};
type Pulse = { queue: { key: string; label: string; count: number; href: string }[]; total: number; activity: { id: string; kind: string; text: string; sub?: string; at: string; href: string }[] };

const RANGES = [7, 14, 30, 90] as const;
const METRIC_STYLE: Record<string, { color: string; prefix?: string }> = {
  signups: { color: "#2563eb" },
  enrollments: { color: "#7c3aed" },
  revenue: { color: "#059669", prefix: "₹" },
  leads: { color: "#d97706" },
  applications: { color: "#e11d48" },
  active: { color: "#0891b2" },
};
const KIND_ICON: Record<string, { Icon: LucideIcon; color: string }> = {
  signup: { Icon: UserPlus, color: "#2563eb" },
  enrollment: { Icon: BookOpen, color: "#7c3aed" },
  payment: { Icon: CircleDollarSign, color: "#059669" },
  lead: { Icon: MessageSquare, color: "#d97706" },
  request: { Icon: Inbox, color: "#e11d48" },
  application: { Icon: Mail, color: "#0891b2" },
};
const QUICK: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin/courses", label: "Add a course", Icon: GraduationCap },
  { href: "/admin/rewards", label: "Award points", Icon: Award },
  { href: "/admin/requests", label: "Review requests", Icon: Megaphone },
  { href: "/api/admin/export?type=users", label: "Export users", Icon: Download },
];

/** Admin home: live KPIs with trends, an interactive chart, the work queue, an activity feed and recent enrolments. */
export function AdminHome({ name }: { name: string }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [metric, setMetric] = useState("signups");
  const analytics = useLiveData<Analytics>(`/api/admin/analytics?days=${days}`, { intervalMs: 60_000 });
  const overview = useLiveData<Overview>("/api/admin/overview", { intervalMs: 30_000 });
  const pulse = useLiveData<Pulse>("/api/admin/pulse", { intervalMs: 20_000 });

  const metrics = analytics.data?.metrics ?? [];
  const current = metrics.find((m) => m.key === metric) ?? metrics[0];
  const labels = useMemo(() => (analytics.data?.keys ?? []).map(shortDay), [analytics.data]);
  const first = name.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="story-eyebrow">Admin overview</span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">{greeting()}, {first}</h2>
          <p className="mt-1 text-sm text-muted">Here is what is happening across MyLoginn.</p>
        </div>
        <div role="radiogroup" aria-label="Date range" className="relative flex rounded-full bg-story-mist p-1">
          {RANGES.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={days === r} onClick={() => setDays(r)} className={cn("relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors", days === r ? "text-white" : "text-muted hover:text-story-royal")}>
              {days === r && <motion.span layoutId="home-range" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{r}d</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {(metrics.length ? metrics : Array.from({ length: 6 }, (_, i) => ({ key: `s${i}`, label: "", series: [], total: 0, previous: 0, change: 0 }))).map((m, i) => {
          const style = METRIC_STYLE[m.key] ?? { color: "#2563eb" };
          const on = m.key === metric;
          return (
            <motion.button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              aria-pressed={on}
              className={cn("group relative overflow-hidden rounded-2xl border bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]", on ? "border-story-royal/50 shadow-[var(--shadow-soft)]" : "border-border-soft")}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: style.color, transform: on ? "scaleX(1)" : undefined }} />
              {m.label ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-muted">{m.label}</p>
                    <Delta value={m.change} />
                  </div>
                  <LiveNumber value={m.total} prefix={style.prefix} className="mt-2 block text-2xl font-bold tabular-nums text-story-navy dark:text-foreground" />
                  <Sparkline values={m.series} color={style.color} className="mt-2 w-full" />
                </>
              ) : (
                <div className="space-y-3"><span className="block h-3 w-16 animate-pulse rounded-full bg-story-mist" /><span className="block h-7 w-20 animate-pulse rounded-full bg-story-mist" /><span className="block h-8 w-full animate-pulse rounded-lg bg-story-mist" /></div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* trend chart */}
          <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Trend">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-story-navy dark:text-foreground">{current?.label ?? "Trend"}</h3>
                <p className="text-xs text-muted">Last {days} days, updated live</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {metrics.map((m) => (
                  <button key={m.key} type="button" onClick={() => setMetric(m.key)} className={cn("rounded-full px-3 py-1 text-[11px] font-semibold transition-colors", metric === m.key ? "bg-story-royal text-white" : "bg-story-mist text-muted hover:text-story-royal")}>
                    {m.label.replace(" (₹)", "")}
                  </button>
                ))}
              </div>
            </div>
            {current ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${current.key}-${days}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <AreaChart values={current.series} labels={labels} color={METRIC_STYLE[current.key]?.color} format={(n) => `${METRIC_STYLE[current.key]?.prefix ?? ""}${n.toLocaleString("en-IN")}`} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="h-44 animate-pulse rounded-2xl bg-story-mist" />
            )}
          </section>

          {/* recent enrolments */}
          <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Recent enrolments">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-story-navy dark:text-foreground">Recent enrolments</h3>
              <Link href="/admin/enrollments" className="text-xs font-semibold text-story-royal hover:underline">View all →</Link>
            </div>
            {overview.data?.recent.length ? (
              <ul className="divide-y divide-border-soft">
                {overview.data.recent.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-story-mist text-xs font-bold text-story-royal">{r.user.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.user}</p>
                      <p className="truncate text-xs text-muted">{r.course}</p>
                    </div>
                    <span className="hidden sm:block"><StatusBadge status={r.payment} /></span>
                    <span className="shrink-0 text-sm font-bold tabular-nums">₹{r.amount.toLocaleString("en-IN")}</span>
                    <span className="hidden w-16 shrink-0 text-right text-[11px] text-muted md:block">{timeAgo(r.date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted">{overview.loading ? "Loading…" : "No enrolments yet."}</p>
            )}
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Revenue by course">
              <h3 className="mb-4 text-base font-bold text-story-navy dark:text-foreground">Revenue by course</h3>
              <BarList data={overview.data?.revenueByCourse ?? []} prefix="₹" />
            </section>
            <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Enrolments by category">
              <h3 className="mb-4 text-base font-bold text-story-navy dark:text-foreground">Enrolments by category</h3>
              <Donut data={overview.data?.enrollmentsByCategory ?? []} />
            </section>
          </div>
        </div>

        {/* side column */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl border border-border-soft bg-surface p-5" aria-label="Needs attention">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-story-navy dark:text-foreground">Needs attention</h3>
              {pulse.data && <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums", pulse.data.total ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600")}>{pulse.data.total ? `${pulse.data.total} open` : "All clear"}</span>}
            </div>
            <ul className="space-y-1.5">
              {(pulse.data?.queue ?? []).map((q) => (
                <li key={q.key}>
                  <Link href={q.href} className="group flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition-all hover:translate-x-1 hover:border-story-royal/30">
                    <span className="font-medium">{q.label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", q.count ? "bg-rose-500/10 text-rose-600" : "bg-story-mist text-muted")}>{q.count}</span>
                  </Link>
                </li>
              ))}
              {!pulse.data && <li className="py-4 text-center text-sm text-muted">Loading…</li>}
            </ul>
          </section>

          <section className="rounded-3xl border border-border-soft bg-surface p-5" aria-label="Quick actions">
            <h3 className="mb-3 text-base font-bold text-story-navy dark:text-foreground">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK.map(({ href, label, Icon }) => {
                const Tag = href.startsWith("/api/") ? "a" : Link;
                return (
                <Tag key={label} href={href} className="group flex flex-col items-start gap-2 rounded-2xl border border-border-soft p-3 text-sm font-semibold transition-all hover:-translate-y-1 hover:border-story-royal hover:text-story-royal hover:shadow-[var(--shadow-soft)]">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-story-mist text-story-royal transition-colors group-hover:bg-story-royal group-hover:text-white"><Icon className="h-4 w-4" /></span>
                  {label}
                </Tag>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border-soft bg-surface p-5" aria-label="Activity">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-story-navy dark:text-foreground">Live activity</h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600"><span className="relative grid h-2 w-2 place-items-center"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>Live</span>
            </div>
            <ul className="space-y-1">
              {(pulse.data?.activity ?? []).map((a) => {
                const k = KIND_ICON[a.kind] ?? KIND_ICON.signup;
                return (
                  <li key={a.id}>
                    <Link href={a.href} className="group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-story-mist">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${k.color} 14%, transparent)`, color: k.color }}><k.Icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{a.text}</span>
                        {a.sub && <span className="block truncate text-[11px] text-muted">{a.sub}</span>}
                      </span>
                      <span className="shrink-0 pt-0.5 text-[10px] text-muted">{timeAgo(a.at)}</span>
                    </Link>
                  </li>
                );
              })}
              {!pulse.data && <li className="py-4 text-center text-sm text-muted">Loading…</li>}
            </ul>
          </section>

          <section className="grid grid-cols-3 gap-2 rounded-3xl border border-border-soft bg-surface p-4 text-center" aria-label="Totals">
            {[
              { label: "Users", value: overview.data?.stats.totalUsers ?? 0, Icon: Users },
              { label: "Mentors", value: overview.data?.stats.mentors ?? 0, Icon: Trophy },
              { label: "Courses", value: overview.data?.stats.activeCourses ?? 0, Icon: GraduationCap },
            ].map(({ label, value, Icon }) => (
              <div key={label}>
                <Icon className="mx-auto h-4 w-4 text-story-royal" />
                <LiveNumber value={value} className="mt-1 block text-lg font-bold tabular-nums" />
                <p className="text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
