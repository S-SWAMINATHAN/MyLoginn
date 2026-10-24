"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  return <Suspense fallback={<AuthShell mode="login"><p className="text-sm text-muted">Loading password reset…</p></AuthShell>}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const token = searchParams.get("token") ?? "";
  const [resetComplete, setResetComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function readResponse(response: Response) {
    const text = await response.text();
    try { return text ? JSON.parse(text) as { error?: string; devLink?: string } : {}; }
    catch { throw new Error("The server returned an invalid response. Check that the application server and database are running."); }
  }

  async function requestLink(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage(""); setDevLink(null);
    try {
      const response = await fetch("/api/auth/otp/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: email.trim().toLowerCase(), purpose: "reset", channel: "email" }) });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Could not request a reset link.");
      setDevLink(result.devLink ?? null);
      setMessage("If an account exists for this email, a password reset link has been sent.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not request a reset link."); }
    finally { setBusy(false); }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Could not reset password.");
      setMessage("Password updated. You can now sign in with your new password.");
      setResetComplete(true); setPassword("");
      router.replace("/reset-password");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not reset password."); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell mode="login">
      <div className="mb-5">
        <span className="mb-3 flex h-10 w-10 items-center justify-center text-brand-600"><KeyRound className="h-5 w-5" /></span>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand-600">MyLoginn account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Reset your password</h1>
        <p className="mt-1.5 text-sm leading-5 text-muted">{token && !resetComplete ? "Choose a new password for your account." : "We’ll email you a secure link to choose a new password."}</p>
      </div>

      {token && !resetComplete ? <form onSubmit={updatePassword} className="flex flex-col gap-4">
        <PasswordInput label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <p className="-mt-2 text-xs text-muted">Use at least 8 characters, including one uppercase letter and one number.</p>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Updating password…" : "Set new password"}</Button>
      </form> : <form onSubmit={requestLink} className="flex flex-col gap-4">
        <Input label="Account email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Sending link…" : "Email reset link"}</Button>
        {devLink && <p className="break-all rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">Email provider is not configured. Local reset link: <a className="font-semibold underline" href={devLink}>Continue to reset password</a></p>}
      </form>}

      {error && <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{message}</p>}
      <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Back to log in</Link>
    </AuthShell>
  );
}
