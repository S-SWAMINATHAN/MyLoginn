import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

/** Internships with their application counts and whether they are still taking applications (decided by the deadline). */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [list, grouped] = await Promise.all([
    prisma.internship.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.internshipApplication.groupBy({ by: ["internshipId", "status"], _count: { _all: true } }),
  ]);
  const counts = new Map<string, { total: number; fresh: number }>();
  for (const g of grouped) {
    const c = counts.get(g.internshipId) ?? { total: 0, fresh: 0 };
    c.total += g._count._all;
    if (g.status === "submitted") c.fresh += g._count._all;
    counts.set(g.internshipId, c);
  }

  const now = Date.now();
  return NextResponse.json({
    internships: list.map((i) => ({
      id: i.id,
      slug: i.slug,
      title: i.title,
      company: i.company,
      type: i.type,
      location: i.location,
      durationWeeks: i.durationWeeks,
      paid: i.paid,
      featured: i.featured,
      applyDeadline: i.applyDeadline.toISOString(),
      open: i.applyDeadline.getTime() + DAY > now,
      applications: counts.get(i.id)?.total ?? 0,
      newApplications: counts.get(i.id)?.fresh ?? 0,
    })),
  });
}
