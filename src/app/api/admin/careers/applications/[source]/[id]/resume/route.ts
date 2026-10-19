import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { RESUME_TYPES, cleanResumeName, resumeExtension, resumeFilePath } from "@/lib/resumeStorage";

export const runtime = "nodejs";

/**
 * Admin-only CV viewer for job and internship applications. PDFs open inline (for the in-page viewer); Word files are
 * always a download. `?download=1` forces a download. Files live outside /public and are never served by URL.
 */
export async function GET(req: Request, { params }: { params: Promise<{ source: string; id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { source, id } = await params;
  const row =
    source === "job" ? await prisma.jobApplication.findUnique({ where: { id }, select: { resumeName: true } })
    : source === "internship" ? await prisma.internshipApplication.findUnique({ where: { id }, select: { resumeName: true } })
    : null;
  const ext = row?.resumeName ? resumeExtension(row.resumeName) : null;
  if (!row || !ext) return NextResponse.json({ error: "No CV on file" }, { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(resumeFilePath(id, ext));
  } catch {
    return NextResponse.json({ error: "The CV file could not be found" }, { status: 404 });
  }

  const inline = ext === ".pdf" && new URL(req.url).searchParams.get("download") !== "1";
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": RESUME_TYPES[ext].mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${cleanResumeName(row.resumeName!)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
