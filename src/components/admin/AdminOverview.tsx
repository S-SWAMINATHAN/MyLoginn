"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLiveData } from "@/components/admin/useLiveData";
import { StatCard } from "@/components/admin/StatCard";
import { BarList, Donut, type Datum } from "@/components/admin/charts";
import { DataTable, LiveIndicator, type Column, type Row } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";

type Overview = {
  stats: {
    totalUsers: number;
    newUsersMonth: number;
    mentors: number;
    activeCourses: number;
    enrollments: number;
    enrollmentsMonth: number;
    totalRevenue: number;
    revenueMonth: number;
    pendingPayments: number;
    openLeads: number;
    pendingApplications: number;
    activeProjects: number;
    pendingBookings: number;
  };
  revenueByCourse: Datum[];
  enrollmentsByCategory: Datum[];
  recent: (Row & { user: string; email: string; course: string; amount: number; payment: string; status: string; date: string })[];
};

const nfIN = new Intl.NumberFormat("en-IN");

const recentColumns: Column[] = [
  {
    key: "user",
    label: "User",
    render: (r) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{String(r.user)}</p>
        <p className="truncate text-xs text-muted">{String(r.email)}</p>
      </div>
    ),
  },
  { key: "course", label: "Course" },
  { key: "amount", label: "Amount", align: "right", render: (r) => <span className="font-semibold tabular-nums">₹{nfIN.format(Number(r.amount))}</span> },
  { key: "payment", label: "Payment", hideBelow: "sm", render: (r) => <StatusBadge status={String(r.payment)} /> },
  { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
  {
    key: "date",
    label: "Date",
    hideBelow: "md",
    render: (r) => (
      <span className="text-muted">
        {new Date(String(r.date)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
  },
];

function ChartCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

export function AdminOverview() {
  const { data, error, loading, updatedAt } = useLiveData<Overview>("/api/admin/overview", { intervalMs: 8_000 });
  const s = data?.stats;

  const cards = useMemo(
    () => [
      { label: "Total Users", value: s?.totalUsers ?? 0, sub: s?.newUsersMonth ? `+${s.newUsersMonth} this month` : undefined, href: "/admin/users", icon: <AnimatedUsers className="h-6 w-6" />, accent: "brand" as const },
      { label: "Mentors", value: s?.mentors ?? 0, href: "/admin/mentors", icon: <AnimatedUser className="h-6 w-6" />, accent: "green" as const },
      { label: "Active Courses", value: s?.activeCourses ?? 0, href: "/admin/courses", icon: <AnimatedGraduation className="h-6 w-6" />, accent: "cyan" as const },
      { label: "Enrollments", value: s?.enrollments ?? 0, sub: s?.enrollmentsMonth ? `+${s.enrollmentsMonth} this month` : undefined, href: "/admin/enrollments", icon: <AnimatedBook className="h-6 w-6" />, accent: "amber" as const },
      { label: "Total Revenue", value: s?.totalRevenue ?? 0, prefix: "₹", href: "/admin/payments", icon: <AnimatedRupee className="h-6 w-6" />, accent: "brand" as const },
      { label: "Revenue This Month", value: s?.revenueMonth ?? 0, prefix: "₹", href: "/admin/payments", icon: <AnimatedCalendar className="h-6 w-6" />, accent: "green" as const },
      { label: "Pending Payments", value: s?.pendingPayments ?? 0, href: "/admin/payments", icon: <AnimatedClock className="h-6 w-6" />, accent: "rose" as const },
      { label: "Open Inquiries", value: s?.openLeads ?? 0, href: "/admin/leads", icon: <AnimatedChat className="h-6 w-6" />, accent: "cyan" as const },
    ],
    [s]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 basis-56 text-sm text-muted">
          Everything across MyLoginn, refreshed live every few seconds.
        </p>
        <LiveIndicator updatedAt={updatedAt} error={error} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} index={i} loading={loading && !data} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue by Course" delay={0.1}>
          <BarList data={data?.revenueByCourse ?? []} prefix="₹" />
        </ChartCard>
        <ChartCard title="Enrollments by Category" delay={0.16}>
          <Donut data={data?.enrollmentsByCategory ?? []} />
        </ChartCard>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="mb-3 text-sm font-semibold">Recent Enrollments</h2>
        <DataTable
          columns={recentColumns}
          rows={data?.recent ?? []}
          loading={loading && !data}
          emptyMessage="No enrollments yet."
        />
      </motion.section>
    </div>
  );
}
