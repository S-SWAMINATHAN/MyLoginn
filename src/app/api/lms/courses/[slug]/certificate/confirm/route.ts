import { NextResponse } from "next/server";
import { readJson, requireCourseLearner } from "@/lib/lms/guard";
import { confirmCertificateName } from "@/lib/certificate/server";

/**
 * Confirms the learner's official name and returns the certificate data the studio renders.
 * Eligibility (final assessment >= pass mark and every other requirement) is re-checked here, so the
 * client-side gate is only a convenience.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guard = await requireCourseLearner(slug, { write: true });
  if (!guard.ok) return guard.response;

  const body = await readJson<{ fullName?: unknown }>(request, 2000);
  if (typeof body?.fullName !== "string") return NextResponse.json({ error: "Enter your full name." }, { status: 400 });

  const result = await confirmCertificateName(guard.ctx.user, guard.ctx.structure, body.fullName);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ certificate: result.certificate }, { headers: { "Cache-Control": "private, no-store" } });
}
