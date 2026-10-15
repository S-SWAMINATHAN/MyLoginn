"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, PenLine } from "lucide-react";
import type { AssessmentResult, CertificateData, IssuedCertificate, TemplateId, UserData } from "@/types/certificate";
import { SIGNATORIES, formatCertificateDate } from "@/lib/certificate/config";
import { AssessmentGuard } from "./AssessmentGuard";
import { NameConfirmationModal } from "./NameConfirmationModal";
import { TemplateSelector } from "./TemplateSelector";
import { CertificateRenderer } from "./CertificateRenderer";
import { DEFAULT_TEMPLATE, isTemplateId } from "./templates";

const TEMPLATE_KEY = "myloginn.certificate.template";

type Props = {
  user: UserData;
  assessment: AssessmentResult;
  certificate: IssuedCertificate | null;
  /** Administrator preview: sample data, nothing is issued or recorded. */
  preview: boolean;
};

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Score check", "Confirm name", "Choose design & download"];
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Certificate steps">
      {steps.map((label, i) => {
        const n = i + 1, done = n < current, active = n === current;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-success text-white" : active ? "bg-story-royal text-white" : "bg-story-mist text-muted"}`}>{done ? <Check className="h-4 w-4" aria-hidden /> : n}</span>
            <span className={active ? "font-semibold text-story-navy" : "text-muted"}>{label}</span>
            {n < steps.length && <span aria-hidden className="mx-1 hidden h-px w-8 bg-border-soft sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

/** [Score check] → [Official name] → [Choose from the templates] → [Preview & download]. */
export function CertificateStudio({ user, assessment, certificate: initial, preview }: Props) {
  const [certificate, setCertificate] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateId, setTemplateId] = useState<TemplateId>(DEFAULT_TEMPLATE);

  const nameLocked = preview || !!certificate?.nameConfirmed;

  // Restore the learner's last design choice (a per-browser convenience only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_KEY);
      if (isTemplateId(saved)) setTemplateId(saved);
    } catch { /* storage unavailable: keep the default */ }
  }, []);
  // Open the name step straight away for eligible learners who have not confirmed yet.
  useEffect(() => {
    if (assessment.certificateEligible && !nameLocked) setModalOpen(true);
  }, [assessment.certificateEligible, nameLocked]);

  function chooseTemplate(id: TemplateId) {
    setTemplateId(id);
    try { localStorage.setItem(TEMPLATE_KEY, id); } catch { /* ignore */ }
  }

  const data = useMemo<CertificateData | null>(() => {
    if (preview) {
      return { candidateName: user.displayName || "Sample Learner", courseTitle: assessment.courseTitle, completionDate: new Date().toISOString(), credentialId: "MLG-SAMPLE-PREVIEW", signatories: SIGNATORIES, sample: true };
    }
    if (!certificate?.nameConfirmed) return null;
    return { candidateName: certificate.learnerName, courseTitle: assessment.courseTitle, completionDate: certificate.issuedAt, credentialId: certificate.credentialId, signatories: SIGNATORIES };
  }, [preview, certificate, user.displayName, assessment.courseTitle]);

  return (
    <AssessmentGuard assessment={assessment}>
      <div className="space-y-6">
        <Steps current={data ? 3 : 2} />

        {preview && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Administrator preview: designs are shown with sample data and a SAMPLE watermark. No certificate is issued.</p>}

        {!data ? (
          <section className="rounded-3xl border border-border-soft bg-surface p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success"><Check className="h-3.5 w-3.5" aria-hidden />Passed with {assessment.bestPercent}%</span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-story-navy sm:text-2xl">Confirm the name for your certificate</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">Your certificate prints your official full name. Confirm it once and it is locked, so it is always identical on every download.</p>
            <button type="button" onClick={() => setModalOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"><PenLine className="h-4 w-4" aria-hidden />Enter official name</button>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Printed name</p>
                <p className="truncate text-lg font-bold text-story-navy">{data.candidateName}</p>
              </div>
              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div><dt className="text-xs text-muted">Credential ID</dt><dd className="font-mono font-semibold text-story-navy">{data.credentialId}</dd></div>
                <div><dt className="text-xs text-muted">Completed</dt><dd className="font-semibold text-story-navy">{formatCertificateDate(data.completionDate)}</dd></div>
                {!preview && <div className="flex items-end"><span className="inline-flex items-center gap-1 text-xs text-muted"><Lock className="h-3.5 w-3.5" aria-hidden />Name locked</span></div>}
              </dl>
            </section>

            <section aria-labelledby="design-heading">
              <h2 id="design-heading" className="mb-3 text-lg font-bold text-story-navy">Choose a design</h2>
              <TemplateSelector data={data} value={templateId} onChange={chooseTemplate} />
            </section>

            <section aria-labelledby="preview-heading">
              <h2 id="preview-heading" className="mb-3 text-lg font-bold text-story-navy">Preview &amp; download</h2>
              <CertificateRenderer data={data} templateId={templateId} />
            </section>
          </>
        )}
      </div>

      {!preview && (
        <NameConfirmationModal
          open={modalOpen}
          courseSlug={assessment.courseSlug}
          courseTitle={assessment.courseTitle}
          initialName={certificate?.learnerName || user.displayName}
          onClose={() => setModalOpen(false)}
          onConfirmed={(c) => { setCertificate(c); setModalOpen(false); }}
        />
      )}
    </AssessmentGuard>
  );
}
