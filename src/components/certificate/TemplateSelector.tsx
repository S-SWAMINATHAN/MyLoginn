"use client";

import { Check } from "lucide-react";
import type { CertificateData, TemplateId } from "@/types/certificate";
import { TEMPLATES } from "./templates";
import { ScaledCertificate } from "./ScaledCertificate";

/**
 * Template picker. Each card is a live, scaled render of the learner's own certificate, so what
 * they pick is exactly what they download. Native radios give keyboard (arrow-key) support for free.
 */
export function TemplateSelector({ data, value, onChange }: { data: CertificateData; value: TemplateId; onChange: (id: TemplateId) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Certificate design</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TEMPLATES.map((t) => {
          const selected = t.id === value;
          const Template = t.component;
          return (
            <label key={t.id} className={`group relative cursor-pointer rounded-2xl border-2 bg-surface p-2 transition focus-within:ring-2 focus-within:ring-story-royal/40 ${selected ? "border-story-royal shadow-lg shadow-story-royal/15" : "border-border-soft hover:border-story-royal/40"}`}>
              <input type="radio" name="certificate-template" value={t.id} checked={selected} onChange={() => onChange(t.id)} className="sr-only" />
              <div aria-hidden className="pointer-events-none overflow-hidden rounded-lg ring-1 ring-black/5">
                <ScaledCertificate><Template data={data} /></ScaledCertificate>
              </div>
              <div className="mt-2 flex items-start justify-between gap-2 px-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-story-navy">{t.name}</p>
                  <p className="truncate text-xs text-muted">{t.tagline}</p>
                </div>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${selected ? "bg-story-royal text-white" : "border border-border-soft"}`}>{selected && <Check className="h-3.5 w-3.5" aria-hidden />}</span>
              </div>
              <div className="mt-2 flex gap-1 px-1" aria-hidden>
                {t.palette.map((c) => <span key={c} className="h-2 w-5 rounded-full ring-1 ring-black/10" style={{ background: c }} />)}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
