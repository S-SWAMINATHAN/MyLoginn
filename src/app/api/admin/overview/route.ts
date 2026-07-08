import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Start of the current calendar month in Asia/Kolkata, as a UTC Date. */
function monthStartIst() {
  const nowIst = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), 1) - IST_OFFSET_MS);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const monthStart = monthStartIst();

  const [
    totalUsers,
    newUsersMonth,
    mentors,
    activeCourses,
    enrollments,
    enrollmentsMonth,
    revenueAll,
    revenueMonth,
    pendingPayments,
    openLeads,
    pendingApplications,
    activeProjects,
    pendingBookings,
    revenueByCourseRaw,
    coursesWithEnrollments,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.tutor.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { enrolledAt: { gte: monthStart } } }),
    prisma.payment.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "paid", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: "created" } }),
    prisma.lead.count({ where: { status: { not: "closed" } } }),
    prisma.internshipApplication.count({ where: { status: "submitted" } }),
    prisma.project.count({ where: { status: "in_progress" } }),
    prisma.tutoringBooking.count({ where: { status: "pending" } }),
    prisma.payment.groupBy({
      by: ["courseId"],
      where: { status: "paid" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 7,
    }),
    prisma.course.findMany({
      select: { category: true, _count: { select: { enrollments: true } } },
    }),
    prisma.enrollment.findMany({
      take: 8,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, price: true } },
      },
    }),
  ]);

  const courseTitles = await prisma.course.findMany({
    where: { id: { in: revenueByCourseRaw.map((r) => r.courseId) } },
    select: { id: true, title: true },
  });
  const titleById = new Map(courseTitles.map((c) => [c.id, c.title]));
  const revenueByCourse = revenueByCourseRaw.map((r) => ({
    label: titleById.get(r.courseId) ?? "Unknown course",
    value: Math.round((r._sum.amount ?? 0) / 100),
  }));

  const byCategory = new Map<string, number>();
  for (const c of coursesWithEnrollments) {
    byCategory.set(c.category, (byCategory.get(c.category) ?? 0) + c._count.enrollments);
  }
  const sortedCats = [...byCategory.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const topCats = sortedCats.slice(0, 5).map(([label, value]) => ({ label, value }));
  const otherTotal = sortedCats.slice(5).reduce((sum, [, n]) => sum + n, 0);
  const enrollmentsByCategory = otherTotal > 0 ? [...topCats, { label: "Other", value: otherTotal }] : topCats;

  // Latest payment per (user, course) for the recent-enrollments table.
  const payments = await prisma.payment.findMany({
    where: {
      OR: recentEnrollments.map((e) => ({ userId: e.user.id, courseId: e.course.id })),
    },
    orderBy: { createdAt: "desc" },
  });
  const paymentKey = (userId: string, courseId: string) => `${userId}:${courseId}`;
  const paymentByKey = new Map<string, (typeof payments)[number]>();
  for (const p of payments) {
    const key = paymentKey(p.userId, p.courseId);
    if (!paymentByKey.has(key)) paymentByKey.set(key, p);
  }

  const recent = recentEnrollments.map((e) => {
    const payment = paymentByKey.get(paymentKey(e.user.id, e.course.id));
    return {
      id: e.id,
      user: e.user.name,
      email: e.user.email,
      course: e.course.title,
      amount: payment ? payment.amount / 100 : e.course.price,
      payment: payment?.status ?? "manual",
      status: e.status,
      date: e.enrolledAt.toISOString(),
    };
  });

  return NextResponse.json({
    stats: {
      totalUsers,
      newUsersMonth,
      mentors,
      activeCourses,
      enrollments,
      enrollmentsMonth,
      totalRevenue: Math.round((revenueAll._sum.amount ?? 0) / 100),
      revenueMonth: Math.round((revenueMonth._sum.amount ?? 0) / 100),
      pendingPayments,
      openLeads,
      pendingApplications,
      activeProjects,
      pendingBookings,
    },
    revenueByCourse,
    enrollmentsByCategory,
    recent,
    fetchedAt: new Date().toISOString(),
  });
}
