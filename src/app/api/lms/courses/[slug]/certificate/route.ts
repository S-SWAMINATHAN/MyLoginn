import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { readJson, requireCourseLearner } from "@/lib/lms/guard";
import { issueCertificateIfEligible } from "@/lib/lms/certificates";
import { createCourseCertificatePdf, type CertificateStyle } from "@/lib/createCourseCertificatePdf";

const STYLES: CertificateStyle[] = ["classic-seal", "navy-ribbon", "lavender-modern"];

const safeFilename = (value: string) => value.normalize("NFKD").replace(/[^\w\s.-]/g, "").trim().replace(/[\s.]+/g, "_").slice(0, 100) || "Learner";

async function asset(file: string) {
  try {
    return `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", file))).toString("base64")}`;
  } catch {
    return undefined; // optional branding; the certificate stays readable without it
  }
}

/**
 * Downloads the certificate PDF. It is rendered only if a Certificate row exists, and the row is
 * only ever created by the server after every requirement (including the final assessment pass mark) is met.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guard = await requireCourseLearner(slug, { write: true });
  if (!guard.ok) return guard.response;
  const { user, structure } = guard.ctx;

  const body = await readJson<{ firstName?: unknown; lastName?: unknown; style?: unknown }>(request, 2000);
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const style = body?.style === undefined ? "classic-seal" : body.style;
  if (typeof style !== "string" || !STYLES.includes(style as CertificateStyle)) return NextResponse.json({ error: "Choose a valid certificate design." }, { status: 400 });
  if (!firstName || !lastName || firstName.length > 60 || lastName.length > 60) return NextResponse.json({ error: "Enter a first and last name, up to 60 characters each." }, { status: 400 });

  const issued = await issueCertificateIfEligible(user, structure);
  if (!issued.ok) return NextResponse.json({ error: issued.reason }, { status: 403 });

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: structure.course.id } }, select: { enrolledAt: true } });
  const credits = structure.lessons.filter((l) => l.required).length;
  const [logoData, wordmarkData] = await Promise.all([asset("myloginn-logo.png"), asset("myloginn-wordmark.png")]);
  const learnerName = `${firstName} ${lastName}`;
  const buffer = await createCourseCertificatePdf({
    learnerName, courseTitle: structure.course.title, completedAt: issued.certificate.issuedAt, enrolledAt: enrollment?.enrolledAt ?? issued.certificate.issuedAt,
    issuedAt: issued.certificate.issuedAt, credits, certificateId: issued.certificate.serial, logoData, wordmarkData, style: style as CertificateStyle,
  });
  const filename = `${safeFilename(structure.course.title)}_${safeFilename(`${firstName}_${lastName}`)}.pdf`;
  return new Response(buffer, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store", "Content-Length": String(buffer.byteLength), "X-Certificate-Serial": issued.certificate.serial },
  });
}
