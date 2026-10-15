"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, LoaderCircle, PenLine, ShieldCheck, TriangleAlert, X } from "lucide-react";
import type { IssuedCertificate } from "@/types/certificate";
import { NAME_MAX, normalizeOfficialName, validateOfficialName } from "@/lib/certificate/config";
import { fonts } from "./templates/fonts";

type Props = {
  open: boolean;
  courseSlug: string;
  courseTitle: string;
  /** Prefill: the name already on the certificate, else the profile name. */
  initialName: string;
  onClose: () => void;
  onConfirmed: (certificate: IssuedCertificate) => void;
};

/**
 * Two-step official-name capture: type the name, then review it in print form and confirm.
 * The server stores and locks the name, so a nickname or handle never reaches the credential.
 */
export function NameConfirmationModal({ open, courseSlug, courseTitle, initialName, onClose, onConfirmed }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initialName);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const normalized = normalizeOfficialName(name);
  const invalid = validateOfficialName(normalized);

  function review(e: FormEvent) {
    e.preventDefault();
    if (invalid) { setError(invalid); return; }
    setName(normalized);
    setError(null); setAgreed(false); setStep("confirm");
  }

  async function confirm() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/lms/courses/${encodeURIComponent(courseSlug)}/certificate/confirm`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: normalized }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error ?? "Could not confirm your name. Please try again."); return; }
      onConfirmed(json.certificate as IssuedCertificate);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="name-modal-title"
      onCancel={(e) => { if (busy) e.preventDefault(); else onClose(); }}
      className="m-auto w-[min(94vw,560px)] rounded-3xl border border-border-soft bg-surface p-0 text-foreground shadow-2xl backdrop:bg-story-navy/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-story-royal">
              {step === "enter" ? <PenLine className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
              Step {step === "enter" ? "1" : "2"} of 2
            </span>
            <h2 id="name-modal-title" className="mt-1 text-xl font-bold tracking-tight text-story-navy">
              {step === "enter" ? "Your official full name" : "Confirm the spelling"}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-1.5 text-muted transition hover:bg-story-mist hover:text-story-navy disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {step === "enter" ? (
          <form onSubmit={review} className="mt-4" noValidate>
            <p className="text-sm text-muted">Enter your name exactly as it appears on your government ID or academic records, not a nickname or username.</p>
            <label htmlFor="official-name" className="mt-4 block text-sm font-semibold">Full name</label>
            <input
              id="official-name" value={name} onChange={(e) => { setName(e.target.value); setError(null); }}
              maxLength={NAME_MAX + 10} autoComplete="name" autoFocus spellCheck={false} placeholder="e.g. Swaminathan S"
              aria-invalid={!!error} aria-describedby={error ? "name-error" : "name-hint"}
              className="mt-1.5 w-full rounded-xl border border-border-soft bg-background px-4 py-3 text-base outline-none transition focus:border-story-royal focus:ring-2 focus:ring-story-royal/20"
            />
            {error ? (
              <p id="name-error" role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-danger"><TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />{error}</p>
            ) : (
              <p id="name-hint" className="mt-2 text-xs text-muted">English letters only. Initials, dots, hyphens and apostrophes are fine.</p>
            )}
            <div className="mt-5 rounded-2xl bg-story-mist px-4 py-5 text-center" aria-live="polite">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Live preview</p>
              <p className="mt-1 truncate text-4xl leading-tight text-story-navy" style={{ fontFamily: fonts.greatVibes }}>{normalized || "Your Name"}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-story-navy transition hover:bg-story-mist">Cancel</button>
              <button type="submit" disabled={!normalized} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Review name</button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <div role="note" className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p><strong>This name will be permanently printed on your credential. Please confirm spelling.</strong> It cannot be changed later without contacting support.</p>
            </div>
            <div className="mt-4 rounded-2xl border border-border-soft p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Presented to</p>
              <p className="mt-1 break-words text-4xl leading-tight text-story-navy" style={{ fontFamily: fonts.greatVibes }}>{normalized}</p>
              <p className="mt-3 font-mono text-lg font-semibold tracking-wide text-story-navy">{normalized}</p>
              <p className="mt-2 text-xs text-muted">for {courseTitle}</p>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-story-royal" />
              <span>I confirm this is my official name and it is spelled correctly.</span>
            </label>
            {error && <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-danger"><TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />{error}</p>}
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button type="button" onClick={() => { setStep("enter"); setError(null); }} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-story-navy transition hover:bg-story-mist disabled:opacity-50"><ArrowLeft className="h-4 w-4" aria-hidden />Edit name</button>
              <button type="button" onClick={confirm} disabled={!agreed || busy} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}{busy ? "Confirming…" : "Confirm & continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
