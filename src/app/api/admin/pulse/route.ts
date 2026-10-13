import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Activity = { id: string; kind: string; text: string; sub?: string; at: string; href: string };

/** Live "needs attention" counts plus a merged feed of the latest events across the platform. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [pendingPayments, newLeads, newRequests, pendingApplications, pendingBookings, users, enrollments, payments, leads, requests, applications] = await Promise.all([
    prisma.payment.count({ where: { status: "created" } }),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.projectRequest.count({ where: { status: "new" } }),
    prisma.internshipApplication.count({ where: { status: "submitted" } }),
    prisma.tutoringBooking.count({ where: { status: "pending" } }),
    prisma.user.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, name: true, role: true, createdAt: true } }),
    prisma.enrollment.findMany({ take: 6, orderBy: { enrolledAt: "desc" }, include: { user: { select: { name: true } }, course: { select: { title: true } } } }),
    prisma.payment.findMany({ take: 6, where: { status: "paid" }, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, course: { select: { title: true } } } }),
    prisma.lead.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, name: true, service: true, createdAt: true } }),
    prisma.projectRequest.findMany({ take: 6, orderBy: { createdAt: "desc" }, select: { id: true, name: true, service: true, createdAt: true } }),
    prisma.internshipApplication.findMany({ take: 6, orderBy: { appliedAt: "desc" }, include: { user: { select: { name: true } }, internship: { select: { title: true } } } }),
  ]);

  const activity: Activity[] = [
    ...users.map((x): Activity => ({ id: `u-${x.id}`, kind: "signup", text: `${x.name} joined as ${x.role.toLowerCase()}`, at: x.createdAt.toISOString(), href: "/admin/users" })),
    ...enrollments.map((x): Activity => ({ id: `e-${x.id}`, kind: "enrollment", text: `${x.user.name} enrolled`, sub: x.course.title, at: x.enrolledAt.toISOString(), href: "/admin/enrollments" })),
    ...payments.map((x): Activity => ({ id: `p-${x.id}`, kind: "payment", text: `${x.user.name} paid ₹${Math.round(x.amount / 100).toLocaleString("en-IN")}`, sub: x.course.title, at: x.createdAt.toISOString(), href: "/admin/payments" })),
    ...leads.map((x): Activity => ({ id: `l-${x.id}`, kind: "lead", text: `${x.name} sent an enquiry`, sub: x.service, at: x.createdAt.toISOString(), href: "/admin/requests" })),
    ...requests.map((x): Activity => ({ id: `r-${x.id}`, kind: "request", text: `${x.name} requested a ${x.service} project`, at: x.createdAt.toISOString(), href: "/admin/requests" })),
    ...applications.map((x): Activity => ({ id: `a-${x.id}`, kind: "application", text: `${x.user.name} applied`, sub: x.internship.title, at: x.appliedAt.toISOString(), href: "/admin/applications" })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 16);

  const queue = [
    { key: "requests", label: "New project requests", count: newRequests, href: "/admin/requests" },
    { key: "leads", label: "New enquiries", count: newLeads, href: "/admin/requests" },
    { key: "applications", label: "Applications to review", count: pendingApplications, href: "/admin/applications" },
    { key: "bookings", label: "Tutoring bookings pending", count: pendingBookings, href: "/admin/tutoring" },
    { key: "payments", label: "Unpaid payment orders", count: pendingPayments, href: "/admin/payments" },
  ];

  return NextResponse.json({ queue, total: queue.reduce((s, q) => s + q.count, 0), activity, fetchedAt: new Date().toISOString() });
}
