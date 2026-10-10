import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { flattenCourseModules, getCourseModules } from "@/lib/freeCourseCurriculum";
import { toTopicSlug } from "@/lib/freeCourseTutorial";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";
import { createCertificateId, createCourseCertificatePdf, type CertificateStyle } from "@/lib/createCourseCertificatePdf";

type RouteContext = { params: Promise<{ slug: string }> };

function safeFilename(value: string) {
  return value.normalize("NFKD").replace(/[^\w\s.-]/g, "").trim().replace(/[\s.]+/g, "_").slice(0, 100) || "Learner";
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to download your certificate." }, { status: 401 });
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.price !== 0) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  let body: { firstName?: unknown; lastName?: unknown; style?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter your first and last name." }, { status: 400 }); }
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const certificateStyles: CertificateStyle[] = ["classic-seal", "navy-ribbon", "lavender-modern"];
  const style = body.style === undefined ? "classic-seal" : body.style;
  if (typeof style !== "string" || !certificateStyles.includes(style as CertificateStyle)) return NextResponse.json({ error: "Choose a valid certificate design." }, { status: 400 });
  if (!firstName || !lastName || firstName.length > 60 || lastName.length > 60) return NextResponse.json({ error: "Enter a first and last name, up to 60 characters each." }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
  if (!enrollment) return NextResponse.json({ error: "Enroll in this course to earn a certificate." }, { status: 403 });
  const topics = flattenCourseModules(getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]));
  const topicSlugs = topics.map(toTopicSlug);
  const completedCount = await prisma.courseTopicProgress.count({ where: { userId: user.id, courseId: course.id, challengePassed: true, topicSlug: { in: topicSlugs } } });
  if (!topics.length || completedCount < topics.length) return NextResponse.json({ error: "Complete every course topic before downloading your certificate." }, { status: 403 });

  const latestTopic = await prisma.courseTopicProgress.findFirst({ where: { userId: user.id, courseId: course.id, challengePassed: true, topicSlug: { in: topicSlugs } }, orderBy: { completedAt: "desc" }, select: { completedAt: true } });
  const completedAt = enrollment.completedAt ?? latestTopic?.completedAt ?? enrollment.enrolledAt;
  let logoData: string | undefined;
  let wordmarkData: string | undefined;
  try {
    const logo = await readFile(path.join(process.cwd(), "public", "myloginn-logo.png"));
    logoData = `data:image/png;base64,${logo.toString("base64")}`;
  } catch { /* The certificate remains readable if the optional logo asset is unavailable. */ }
  try {
    const wordmark = await readFile(path.join(process.cwd(), "public", "myloginn-wordmark.png"));
    wordmarkData = `data:image/png;base64,${wordmark.toString("base64")}`;
  } catch { /* Fall back to the compact logo and text if the wordmark is unavailable. */ }

  const filename = `${safeFilename(getCourseDisplayTitle(course.slug, course.title))}_${safeFilename(`${firstName}_${lastName}`)}.pdf`;
  const buffer = await createCourseCertificatePdf({
    learnerName: `${firstName} ${lastName}`, courseTitle: getCourseDisplayTitle(course.slug, course.title),
    completedAt, enrolledAt: enrollment.enrolledAt, issuedAt: new Date(), credits: topics.length,
    certificateId: createCertificateId(user.id, course.id, completedAt), logoData, wordmarkData, style: style as CertificateStyle,
  });
  return new Response(buffer, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store", "Content-Length": String(buffer.byteLength) } });
}
