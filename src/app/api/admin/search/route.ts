import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Hit = { id: string; group: string; label: string; sub?: string; href: string };

/** Global admin search across people, courses, internships and enquiries (used by the command palette). */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ hits: [] });
  const has = { contains: q, mode: "insensitive" as const };

  const [users, courses, internships, leads, requests] = await Promise.all([
    prisma.user.findMany({ where: { OR: [{ name: has }, { email: has }] }, take: 5, select: { id: true, name: true, email: true, role: true } }),
    prisma.course.findMany({ where: { OR: [{ title: has }, { category: has }] }, take: 5, select: { id: true, title: true, category: true } }),
    prisma.internship.findMany({ where: { OR: [{ title: has }, { company: has }] }, take: 4, select: { id: true, title: true, company: true } }),
    prisma.lead.findMany({ where: { OR: [{ name: has }, { email: has }, { service: has }] }, take: 4, select: { id: true, name: true, service: true } }),
    prisma.projectRequest.findMany({ where: { OR: [{ name: has }, { email: has }, { projectName: has }, { requestId: has }] }, take: 4, select: { id: true, name: true, service: true, requestId: true } }),
  ]);

  const hits: Hit[] = [
    ...users.map((u): Hit => ({ id: `u-${u.id}`, group: "People", label: u.name, sub: `${u.email} · ${u.role.toLowerCase()}`, href: u.role === "MENTOR" ? "/admin/mentors" : "/admin/users" })),
    ...courses.map((c): Hit => ({ id: `c-${c.id}`, group: "Courses", label: c.title, sub: c.category, href: "/admin/courses" })),
    ...internships.map((i): Hit => ({ id: `i-${i.id}`, group: "Internships", label: i.title, sub: i.company, href: "/admin/careers?tab=internships" })),
    ...leads.map((l): Hit => ({ id: `l-${l.id}`, group: "Enquiries", label: l.name, sub: l.service, href: "/admin/requests" })),
    ...requests.map((r): Hit => ({ id: `r-${r.id}`, group: "Project requests", label: r.name, sub: `${r.service} · ${r.requestId}`, href: "/admin/requests" })),
  ];
  return NextResponse.json({ hits });
}
