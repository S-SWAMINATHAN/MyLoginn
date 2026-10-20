import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postingSaveError } from "@/lib/postings";
import { effectiveStatus, jobInputSchema, slugifyJob } from "@/lib/jobs";

export const runtime = "nodejs";

/** Every opening with its application counts (admin sees drafts too). `effective` is the status the public currently sees. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [jobs, grouped] = await Promise.all([
    prisma.jobOpening.findMany({ orderBy: [{ createdAt: "desc" }] }),
    prisma.jobApplication.groupBy({ by: ["jobId", "status"], _count: { _all: true } }),
  ]);

  const counts = new Map<string, { total: number; fresh: number }>();
  for (const g of grouped) {
    if (!g.jobId) continue;
    const c = counts.get(g.jobId) ?? { total: 0, fresh: 0 };
    c.total += g._count._all;
    if (g.status === "new") c.fresh += g._count._all;
    counts.set(g.jobId, c);
  }

  return NextResponse.json({
    jobs: jobs.map((j) => ({
      ...j,
      openFrom: j.openFrom?.toISOString() ?? null,
      closeBy: j.closeBy?.toISOString() ?? null,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
      effective: effectiveStatus(j),
      applications: counts.get(j.id)?.total ?? 0,
      newApplications: counts.get(j.id)?.fresh ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = jobInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  // A readable, unique address for the role.
  const base = slugifyJob(parsed.data.title);
  let slug = base;
  for (let n = 2; await prisma.jobOpening.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;

  try {
    const job = await prisma.jobOpening.create({ data: { ...parsed.data, slug } });
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("[careers] create opening failed", error);
    return NextResponse.json({ error: postingSaveError(error) }, { status: 500 });
  }
}
