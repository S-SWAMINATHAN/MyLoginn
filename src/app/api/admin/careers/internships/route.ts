import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { internshipInputSchema, slugifyJob } from "@/lib/jobs";
import { postingSaveError, splitLines } from "@/lib/postings";

export const runtime = "nodejs";

/** Internships with every posting field (for the editor), their application counts and their status. */
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

  return NextResponse.json({
    internships: list.map((i) => ({
      id: i.id,
      slug: i.slug,
      title: i.title,
      company: i.company,
      workMode: i.type,
      location: i.location,
      durationWeeks: i.durationWeeks,
      durationUnit: i.durationUnit,
      paid: i.paid,
      stipend: i.stipend,
      featured: i.featured,
      status: i.status,
      open: i.status === "open",
      description: i.description,
      responsibilities: splitLines(i.responsibilities),
      requirements: splitLines(i.requirements),
      goodToHave: splitLines(i.goodToHave),
      benefits: splitLines(i.benefits),
      idealCandidate: i.idealCandidate,
      applyUrl: i.applyUrl,
      mentorName: i.mentorName,
      mentorEmail: i.mentorEmail,
      createdAt: i.createdAt.toISOString(),
      applications: counts.get(i.id)?.total ?? 0,
      newApplications: counts.get(i.id)?.fresh ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = internshipInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const base = slugifyJob(parsed.data.title);
  let slug = base;
  for (let n = 2; await prisma.internship.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;

  try {
    const internship = await prisma.internship.create({ data: { ...parsed.data, slug, applyDeadline: null }, select: { id: true } });
    return NextResponse.json({ internship }, { status: 201 });
  } catch (error) {
    console.error("[careers] create internship failed", error);
    return NextResponse.json({ error: postingSaveError(error) }, { status: 500 });
  }
}
