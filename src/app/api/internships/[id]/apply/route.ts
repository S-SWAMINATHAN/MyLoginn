import { mkdir, writeFile, unlink } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { awardPoints } from "@/lib/streak";
import { internshipApplicationSchema } from "@/lib/validation";
import { MAX_RESUME_BYTES, RESUME_DIR, cleanResumeName, matchesResumeSignature, resumeExtension, resumeFilePath } from "@/lib/resumeStorage";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to apply" }, { status: 401 });
  }

  const { id } = await params;

  // Accepts multipart form data (with an optional resume file) or the older JSON body.
  let coverNote = "";
  let resumeFile: File | null = null;
  let legacyResumeName = "";
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    coverNote = String(form.get("coverNote") ?? "");
    const file = form.get("resume");
    if (file instanceof File && file.size > 0) resumeFile = file;
  } else {
    const body = await req.json();
    coverNote = String(body.coverNote ?? "");
    legacyResumeName = String(body.resumeName ?? "");
  }

  const parsed = internshipApplicationSchema.safeParse({ coverNote, resumeName: legacyResumeName, internshipId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  // Validate the upload before touching the database.
  let resumeBuffer: Buffer | null = null;
  let resumeExt: string | null = null;
  if (resumeFile) {
    resumeExt = resumeExtension(resumeFile.name);
    if (!resumeExt) return NextResponse.json({ error: "Upload your resume as a PDF, DOC or DOCX file" }, { status: 400 });
    if (resumeFile.size > MAX_RESUME_BYTES) return NextResponse.json({ error: "Your resume must be under 5MB" }, { status: 400 });
    resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    if (!matchesResumeSignature(resumeExt, resumeBuffer)) {
      return NextResponse.json({ error: "That file doesn't look like a valid PDF, DOC or DOCX" }, { status: 400 });
    }
  }

  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship || internship.status === "draft") {
    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  }
  if (internship.status !== "open") {
    return NextResponse.json({ error: "Applications are closed for this internship" }, { status: 409 });
  }

  const existing = await prisma.internshipApplication.findUnique({
    where: { userId_internshipId: { userId: user.id, internshipId: id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already applied to this internship" }, { status: 409 });
  }

  const application = await prisma.internshipApplication.create({
    data: {
      userId: user.id,
      internshipId: id,
      coverNote: parsed.data.coverNote || null,
      resumeName: resumeFile ? cleanResumeName(resumeFile.name) : parsed.data.resumeName || null,
    },
  });

  if (resumeBuffer && resumeExt) {
    try {
      await mkdir(RESUME_DIR, { recursive: true });
      await writeFile(resumeFilePath(application.id, resumeExt), resumeBuffer, { flag: "wx" });
    } catch {
      // Don't keep an application whose resume could not be stored.
      await prisma.internshipApplication.delete({ where: { id: application.id } }).catch(() => {});
      await unlink(resumeFilePath(application.id, resumeExt)).catch(() => {});
      return NextResponse.json({ error: "We couldn't save your resume. Please try again." }, { status: 500 });
    }
  }

  await awardPoints(user.id, { amount: 25, reason: "internship_applied", label: "Internship application bonus" });

  return NextResponse.json({ application });
}
