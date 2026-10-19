import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resumeExtension } from "@/lib/resumeStorage";
import { isUnreviewed } from "@/lib/jobs";
import type { ApplicationRow, ApplicationsResponse } from "@/lib/careerTypes";

export const runtime = "nodejs";


const resumeType = (name: string | null) => {
  const ext = name ? resumeExtension(name) : null;
  return ext ? (ext.slice(1) as "pdf" | "doc" | "docx") : null;
};

/**
 * One inbox for every application: job applications (including open applications) and internship applications.
 * Filters: ?kind=all|job|internship, ?status=, ?jobId=, ?q= (name, email or role). Newest first, capped at 300.
 */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "all";
  const status = url.searchParams.get("status") ?? "";
  const jobId = url.searchParams.get("jobId") ?? "";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 80);

  const [jobApps, internApps] = await Promise.all([
    kind === "internship" ? [] : prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { job: { select: { title: true } } } }),
    kind === "job" || jobId ? [] : prisma.internshipApplication.findMany({ orderBy: { appliedAt: "desc" }, take: 300, include: { user: { select: { name: true, email: true, phone: true } }, internship: { select: { title: true } } } }),
  ]);

  let rows: ApplicationRow[] = [
    ...jobApps.map((a): ApplicationRow => ({
      source: "job",
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      role: a.job?.title ?? "Open application",
      jobId: a.jobId,
      status: a.status,
      rating: a.rating,
      notes: a.notes,
      coverNote: a.coverNote,
      experienceYears: a.experienceYears,
      currentRole: a.currentRole,
      profileUrl: a.profileUrl,
      resumeName: a.resumeName,
      resumeType: resumeType(a.resumeName),
      appliedAt: a.createdAt.toISOString(),
      reviewedAt: a.reviewedAt?.toISOString() ?? null,
      unreviewed: isUnreviewed(a.status),
    })),
    ...internApps.map((a): ApplicationRow => ({
      source: "internship",
      id: a.id,
      name: a.user.name,
      email: a.user.email,
      phone: a.user.phone,
      role: `${a.internship.title} (internship)`,
      jobId: null,
      status: a.status,
      rating: a.rating,
      notes: a.notes,
      coverNote: a.coverNote,
      experienceYears: null,
      currentRole: null,
      profileUrl: null,
      resumeName: a.resumeName,
      resumeType: resumeType(a.resumeName),
      appliedAt: a.appliedAt.toISOString(),
      reviewedAt: a.reviewedAt?.toISOString() ?? null,
      unreviewed: isUnreviewed(a.status),
    })),
  ];

  // Counts come from the unfiltered set, so the filter chips always show real totals.
  const counts = { all: rows.length, job: rows.filter((r) => r.source === "job").length, internship: rows.filter((r) => r.source === "internship").length, unreviewed: rows.filter((r) => r.unreviewed).length };

  if (jobId) rows = rows.filter((r) => r.jobId === jobId);
  if (status) rows = rows.filter((r) => r.status === status);
  if (q) rows = rows.filter((r) => `${r.name} ${r.email} ${r.role}`.toLowerCase().includes(q));
  rows.sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));

  const body: ApplicationsResponse = { rows: rows.slice(0, 300), counts };
  return NextResponse.json(body);
}
