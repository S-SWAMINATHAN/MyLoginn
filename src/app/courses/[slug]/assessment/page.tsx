import type { Metadata } from "next";
import { LmsAssessmentView } from "@/components/lms/LmsPages";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LmsAssessmentView slug={slug} />;
}
