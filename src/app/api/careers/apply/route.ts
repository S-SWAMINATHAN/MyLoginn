import { mkdir, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema, effectiveStatus } from "@/lib/jobs";
import { emailDomainAcceptsMail } from "@/lib/emailDomain";
import { MAX_RESUME_BYTES, RESUME_DIR, cleanResumeName, matchesResumeSignature, resumeExtension, resumeFilePath } from "@/lib/resumeStorage";

export const runtime = "nodejs";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Public job application (or an open application when no job is chosen). Multipart form with the CV attached.
 * The CV is validated by type, size and file signature, then stored privately; only the admin download route reads it.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const text = (key: string) => String(form.get(key) ?? "");

    // Spam traps: bots fill the hidden field or submit within moments of the form opening.
    if (text("website")) return NextResponse.json({ ok: true, reference: "ML-000000" });
    const startedAt = Number(text("startedAt"));
    if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 4000) return fail("Please take a moment to review your details, then send again.", 429);

    const parsed = jobApplicationSchema.safeParse({
      jobId: text("jobId"),
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      experienceYears: text("experienceYears"),
      currentRole: text("currentRole"),
      profileUrl: text("profileUrl"),
      coverNote: text("coverNote"),
    });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Please check your details");
    const data = parsed.data;

    // The CV is required.
    const file = form.get("resume");
    if (!(file instanceof File) || file.size === 0) return fail("Attach your CV as a PDF, DOC or DOCX file");
    const ext = resumeExtension(file.name);
    if (!ext) return fail("Upload your CV as a PDF, DOC or DOCX file");
    if (file.size > MAX_RESUME_BYTES) return fail("Your CV must be under 5MB");
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesResumeSignature(ext, buffer)) return fail("That file doesn't look like a valid PDF, DOC or DOCX");

    // The role must still be taking applications.
    let jobTitle = "Open application";
    if (data.jobId) {
      const job = await prisma.jobOpening.findUnique({ where: { id: data.jobId } });
      if (!job || effectiveStatus(job) === "draft") return fail("That role could not be found", 404);
      if (effectiveStatus(job) !== "open") return fail("This role is no longer taking applications. You can send an open application instead.", 409);
      jobTitle = job.title;
    }

    const domain = data.email.split("@")[1];
    if (!(await emailDomainAcceptsMail(domain))) return fail(`We couldn't find a mail server for ${domain}. Please check your email address.`);

    // One application per role per person, and a sensible daily limit.
    const dup = await prisma.jobApplication.findFirst({ where: { email: data.email, jobId: data.jobId }, select: { id: true } });
    if (dup) return fail(data.jobId ? `You have already applied for ${jobTitle}. We'll be in touch if your profile matches.` : "We already have an open application from this email. We'll contact you when a matching role opens.", 409);
    const today = await prisma.jobApplication.count({ where: { email: data.email, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    if (today >= 5) return fail("You have sent several applications today. Please try again tomorrow.", 429);

    const application = await prisma.jobApplication.create({
      data: {
        jobId: data.jobId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        experienceYears: data.experienceYears,
        currentRole: data.currentRole,
        profileUrl: data.profileUrl,
        coverNote: data.coverNote,
        resumeName: cleanResumeName(file.name),
      },
      select: { id: true },
    });

    try {
      await mkdir(RESUME_DIR, { recursive: true });
      await writeFile(resumeFilePath(application.id, ext), buffer, { flag: "wx" });
    } catch {
      // Never keep an application whose CV could not be stored.
      await prisma.jobApplication.delete({ where: { id: application.id } }).catch(() => {});
      await unlink(resumeFilePath(application.id, ext)).catch(() => {});
      return fail("We couldn't save your CV. Please try again.", 500);
    }

    return NextResponse.json({ ok: true, reference: `ML-${application.id.slice(-6).toUpperCase()}`, role: jobTitle });
  } catch (error) {
    console.error("Job application could not be saved:", error instanceof Error ? error.name : "unknown error");
    return fail("We couldn't send your application. Please try again in a moment.", 500);
  }
}
