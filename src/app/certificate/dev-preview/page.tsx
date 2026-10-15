"use client";
// TEMPORARY visual harness — delete before commit.
import { useEffect, useState } from "react";
import { TEMPLATES } from "@/components/certificate/templates";
import { SIGNATORIES } from "@/lib/certificate/config";
import type { CertificateData } from "@/types/certificate";

export default function DevPreview() {
  const [long, setLong] = useState<boolean | null>(null);
  useEffect(() => setLong(new URLSearchParams(window.location.search).get("long") === "1"), []);
  if (long === null) return null;
  const data: CertificateData = {
    candidateName: long ? "Venkatasubramanian Ramachandran Krishnamoorthy" : "Swaminathan S",
    courseTitle: long ? "Full-Stack Web Development & AI with Next.js, TypeScript, PostgreSQL and Cloud Deployment" : "Full-Stack Web Development & AI",
    completionDate: "2026-10-15T09:00:00.000Z", credentialId: "MLG-2026-ABCD2345", signatories: SIGNATORIES,
  };
  return <div>{TEMPLATES.map((t) => <div key={t.id} data-tpl={t.id} style={{ width: 1123, height: 794, marginBottom: 20 }}><t.component data={data} /></div>)}</div>;
}
