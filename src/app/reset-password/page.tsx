"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function readResponse(response: Response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) as { error?: string; devCode?: string } : {}; }
    catch { throw new Error("The server returned an invalid response. Check that the application server and database are running."); }
  }

  async function requestCode(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: email.trim().toLowerCase(), purpose: "reset", channel: "email" }) });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Could not request a code.");
      setDevCode(result.devCode ?? null); setStep("reset");
      setMessage("If an account exists for this email, a reset code has been sent.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not request a code."); }
    finally { setBusy(false); }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: email.trim().toLowerCase(), channel: "email", code, password }) });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Could not reset password.");
      setMessage("Password updated. You can now sign in with your new password.");
      setStep("email"); setCode(""); setPassword(""); setDevCode(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not reset password."); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell mode="login">
      <div className="mb-5">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"><KeyRound className="h-5 w-5" /></span>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand-600">MyLoginn account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Reset your password</h1>
        <p className="mt-1.5 text-sm leading-5 text-muted">Verify your account with a reset code, then choose a new password.</p>
      </div>

      {step === "email" ? <form onSubmit={requestCode} className="flex flex-col gap-4">
        <Input label="Account email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Requesting code…" : "Send reset code"}</Button>
      </form> : <form onSubmit={updatePassword} className="flex flex-col gap-4">
        <p className="text-sm text-muted">Enter the six-digit reset code for <strong>{email}</strong>.</p>
        {devCode && <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">Local development mode: email delivery is not configured. Use the code shown here: <strong className="tracking-widest">{devCode}</strong></p>}
        <OtpInput value={code} onChange={setCode} disabled={busy} />
        <PasswordInput label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <p className="-mt-2 text-xs text-muted">Use at least 8 characters, including one uppercase letter and one number.</p>
        <Button type="submit" size="lg" className="w-full" disabled={busy || code.length !== 6}>{busy ? "Updating password…" : "Reset password"}</Button>
        <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} className="text-sm font-medium text-brand-600 hover:underline">Use a different email</button>
      </form>}

      {error && <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}
      <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back to log in</Link>
    </AuthShell>
  );
}
