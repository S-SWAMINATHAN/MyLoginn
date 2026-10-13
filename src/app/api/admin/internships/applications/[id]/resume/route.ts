import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { RESUME_TYPES, cleanResumeName, resumeExtension, resumeFilePath } from "@/lib/resumeStorage";

export const runtime = "nodejs";

/** Admin-only download of the resume an applicant uploaded. Files are never exposed under /public. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const application = await prisma.internshipApplication.findUnique({ where: { id }, select: { resumeName: true } });
  const ext = application?.resumeName ? resumeExtension(application.resumeName) : null;
  if (!application || !ext) return NextResponse.json({ error: "No resume on file" }, { status: 404 });

  try {
    const data = await readFile(resumeFilePath(id, ext));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": RESUME_TYPES[ext].mime,
        "Content-Disposition": `attachment; filename="${cleanResumeName(application.resumeName!)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume file not found" }, { status: 404 });
  }
}
