import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bucketCount, bucketSum, dayKeys, pctChange, startOfDayIst, sum } from "@/lib/adminAnalytics";

export const runtime = "nodejs";

type Metric = { key: string; label: string; series: number[]; total: number; previous: number; change: number | null };

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requested = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 14, 30, 90].includes(requested) ? requested : 30;
  const keys = dayKeys(days);
  const start = startOfDayIst(keys[0]);
  const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);

  const [users, enrollments, payments, leads, requests, applications, activity] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: prevStart } }, select: { createdAt: true } }),
    prisma.enrollment.findMany({ where: { enrolledAt: { gte: prevStart } }, select: { enrolledAt: true } }),
    prisma.payment.findMany({ where: { status: "paid", createdAt: { gte: prevStart } }, select: { createdAt: true, amount: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: prevStart } }, select: { createdAt: true } }),
    prisma.projectRequest.findMany({ where: { createdAt: { gte: prevStart } }, select: { createdAt: true } }),
    prisma.internshipApplication.findMany({ where: { appliedAt: { gte: prevStart } }, select: { appliedAt: true } }),
    prisma.dailyActivity.groupBy({ by: ["dateKey"], where: { dateKey: { gte: keys[0] } }, _count: { _all: true } }),
  ]);

  const inCurrent = (d: Date) => d >= start;
  const split = <T,>(rows: T[], get: (r: T) => Date) => ({ cur: rows.filter((r) => inCurrent(get(r))), prev: rows.filter((r) => !inCurrent(get(r))) });

  const mk = (key: string, label: string, series: number[], prevTotal: number): Metric => {
    const total = sum(series);
    return { key, label, series, total, previous: prevTotal, change: pctChange(total, prevTotal) };
  };

  const u = split(users, (r) => r.createdAt);
  const e = split(enrollments, (r) => r.enrolledAt);
  const p = split(payments, (r) => r.createdAt);
  const l = split(leads, (r) => r.createdAt);
  const rq = split(requests, (r) => r.createdAt);
  const a = split(applications, (r) => r.appliedAt);

  const activeMap = new Map(activity.map((x) => [x.dateKey, x._count._all]));
  const activeSeries = keys.map((k) => activeMap.get(k) ?? 0);

  const metrics: Metric[] = [
    mk("signups", "New users", bucketCount(u.cur.map((r) => r.createdAt), keys), u.prev.length),
    mk("enrollments", "Enrolments", bucketCount(e.cur.map((r) => r.enrolledAt), keys), e.prev.length),
    mk("revenue", "Revenue (₹)", bucketSum(p.cur.map((r) => ({ date: r.createdAt, value: Math.round(r.amount / 100) })), keys), Math.round(sum(p.prev.map((r) => r.amount)) / 100)),
    mk("leads", "Enquiries", bucketCount([...l.cur, ...rq.cur].map((r) => r.createdAt), keys), l.prev.length + rq.prev.length),
    mk("applications", "Applications", bucketCount(a.cur.map((r) => r.appliedAt), keys), a.prev.length),
    mk("active", "Active learners", activeSeries, 0),
  ];
  metrics[5].change = null;

  // Course performance, learner funnel and breakdowns.
  const [courses, progress, paidByCourse, totalUsers, enrolledUsers, completedUsers, paidUsers, leadsByService, applicationsByStatus, usersByRole] = await Promise.all([
    prisma.course.findMany({ select: { id: true, title: true, category: true, price: true, _count: { select: { enrollments: true } } } }),
    prisma.enrollment.groupBy({ by: ["courseId"], _avg: { progress: true } }),
    prisma.payment.groupBy({ by: ["courseId"], where: { status: "paid" }, _sum: { amount: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.findMany({ distinct: ["userId"], select: { userId: true } }),
    prisma.enrollment.findMany({ where: { progress: { gte: 100 } }, distinct: ["userId"], select: { userId: true } }),
    prisma.payment.findMany({ where: { status: "paid" }, distinct: ["userId"], select: { userId: true } }),
    prisma.lead.groupBy({ by: ["service"], _count: { _all: true }, orderBy: { _count: { service: "desc" } }, take: 6 }),
    prisma.internshipApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const avgProgress = new Map(progress.map((x) => [x.courseId, Math.round(x._avg.progress ?? 0)]));
  const revenueBy = new Map(paidByCourse.map((x) => [x.courseId, Math.round((x._sum.amount ?? 0) / 100)]));
  const coursePerformance = courses
    .map((c) => ({ id: c.id, title: c.title, category: c.category, enrollments: c._count.enrollments, avgProgress: avgProgress.get(c.id) ?? 0, revenue: revenueBy.get(c.id) ?? 0 }))
    .sort((x, y) => y.enrollments - x.enrollments)
    .slice(0, 8);

  return NextResponse.json({
    days,
    keys,
    metrics,
    coursePerformance,
    funnel: [
      { label: "Learners signed up", value: totalUsers },
      { label: "Enrolled in a course", value: enrolledUsers.length },
      { label: "Completed a course", value: completedUsers.length },
      { label: "Made a payment", value: paidUsers.length },
    ],
    leadsByService: leadsByService.map((x) => ({ label: x.service, value: x._count._all })),
    applicationsByStatus: applicationsByStatus.map((x) => ({ label: x.status, value: x._count._all })),
    usersByRole: usersByRole.map((x) => ({ label: x.role, value: x._count._all })),
    fetchedAt: new Date().toISOString(),
  });
}
