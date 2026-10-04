"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, ShieldAlert } from "lucide-react";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";

export function EmailVerificationNotice({ email }: { email: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function requestCode() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Couldn't send the verification email.");
      setSent(true);
      setDevCode(result.devCode ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Couldn't send the verification email.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value = code) {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "That code didn't work. Check it and try again.");
      setVerified(true);
      router.refresh();
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "Verification failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (verified) {
    return <div role="status" className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-800 dark:text-emerald-300">
      <CheckCircle2 className="h-6 w-6 shrink-0" /> Your email is verified. Certificates are now unlocked.
    </div>;
  }

  return <div className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-300">
    <div className="flex flex-wrap items-center gap-3">
      <ShieldAlert className="h-6 w-6 shrink-0" />
      <p className="min-w-52 flex-1">Your email isn&apos;t verified yet. Verify it to unlock certificates.</p>
      {!sent && <Button size="sm" variant="outline" onClick={requestCode} disabled={busy}>
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {busy ? "Sending code…" : "Verify email"}
      </Button>}
    </div>

    {sent && <div className="mt-5 max-w-md space-y-3">
      <p className="text-sm">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
      {devCode && <p className="rounded-lg bg-amber-100 px-3 py-2 font-mono text-sm font-semibold text-amber-950">Development email code: {devCode}</p>}
      <OtpInput value={code} onChange={setCode} onComplete={verifyCode} error={error ?? undefined} disabled={busy} />
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => verifyCode()} disabled={code.length !== 6 || busy}>
          {busy ? "Verifying…" : "Verify code"}
        </Button>
        <button type="button" onClick={requestCode} disabled={busy} className="text-xs font-semibold underline underline-offset-4 disabled:opacity-50">Send another code</button>
      </div>
    </div>}
    {error && !sent && <p role="alert" className="mt-3 text-xs font-medium text-danger">{error}</p>}
  </div>;
}
