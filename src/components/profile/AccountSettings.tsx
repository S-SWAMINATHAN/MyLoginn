"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Check, LoaderCircle, Mail, Pencil, Phone, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "@/components/ui/OtpInput";

type ContactField = "email" | "phone";

type Props = {
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
};

export function AccountSettings({ email: initialEmail, emailVerified: initialEmailVerified, phone: initialPhone, phoneVerified: initialPhoneVerified }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [emailVerified, setEmailVerified] = useState(initialEmailVerified);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [phoneVerified, setPhoneVerified] = useState(initialPhoneVerified);
  const [editing, setEditing] = useState<ContactField | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ field: ContactField; value: string; devCode?: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function currentValue(field: ContactField) {
    return field === "email" ? email : phone;
  }

  function isVerified(field: ContactField) {
    return field === "email" ? emailVerified : phoneVerified;
  }

  function beginEdit(field: ContactField) {
    setEditing(field);
    setDraft(currentValue(field));
    setError(null);
  }

  async function requestCode(field: ContactField, value: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/contact-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", field, value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Couldn't send a verification code.");
      setPending({ field, value, devCode: result.devCode ?? undefined });
      setCode("");
      setEditing(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Couldn't send a verification code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value = code) {
    if (!pending || value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/contact-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", field: pending.field, value: pending.value, code: value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "That code didn't work. Check it and try again.");
      if (pending.field === "email") {
        setEmail(result.value);
        setEmailVerified(true);
      } else {
        setPhone(result.value);
        setPhoneVerified(true);
      }
      setPending(null);
      setCode("");
      router.refresh();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function cancelPending() {
    setPending(null);
    setCode("");
    setError(null);
  }

  function contactCard(field: ContactField) {
    const emailField = field === "email";
    const value = currentValue(field);
    const verified = isVerified(field);
    const Icon = emailField ? Mail : Phone;
    const title = emailField ? "Email address" : "Phone number";
    const inputType = emailField ? "email" : "tel";
    const activeEdit = editing === field;
    const activePending = pending?.field === field;

    return <div key={field} className="rounded-3xl border border-border-soft bg-surface p-5 transition-all duration-300 hover:border-story-royal/30 hover:shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-xs text-muted">{title}</p>
            <p className="mt-1 break-all text-sm font-semibold">{value || "Not added"}</p>
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${verified ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
              {verified ? <><BadgeCheck className="h-3.5 w-3.5" /> Verified</> : "Not verified"}
            </span>
          </div>
        </div>
        {!activeEdit && !activePending && <div className="flex shrink-0 flex-wrap gap-2">
          {!verified && value && <Button size="sm" variant="secondary" onClick={() => requestCode(field, value)} disabled={busy}>Verify</Button>}
          <Button size="sm" variant="outline" onClick={() => beginEdit(field)} disabled={busy}>
            <Pencil className="h-3.5 w-3.5" /> {value ? "Edit" : "Add"}
          </Button>
        </div>}
      </div>

      {activeEdit && <div className="mt-5 space-y-3">
        <Input id={`profile-${field}`} label={title} type={inputType} autoComplete={emailField ? "email" : "tel"} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={emailField ? "you@example.com" : "+1 555 123 4567"} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => requestCode(field, draft.trim())} disabled={busy || !draft.trim()}>
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Sending code…" : "Save and verify"}
          </Button>
          <Button size="sm" variant="cancel" onClick={() => { setEditing(null); setError(null); }} disabled={busy}><X className="h-4 w-4" /> Cancel</Button>
        </div>
        {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
      </div>}

      {activePending && pending && <div className="mt-5 space-y-3">
        <p className="text-sm text-muted">Enter the 6-digit code sent to <strong className="break-all text-foreground">{pending.value}</strong>.</p>
        {pending.devCode && <p className="rounded-lg bg-amber-500/10 px-3 py-2 font-mono text-sm font-semibold">Development code: {pending.devCode}</p>}
        <OtpInput value={code} onChange={setCode} onComplete={verifyCode} error={error ?? undefined} disabled={busy} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => verifyCode()} disabled={code.length !== 6 || busy}>
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {busy ? "Verifying…" : "Verify code"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => requestCode(field, pending.value)} disabled={busy}>Send another code</Button>
          <Button size="sm" variant="cancel" onClick={cancelPending} disabled={busy}><X className="h-4 w-4" /> Cancel</Button>
        </div>
      </div>}

      {error && !activePending && !activeEdit && <p role="alert" className="mt-3 text-xs font-medium text-danger">{error}</p>}
    </div>;
  }

  return <section className="mt-2" aria-labelledby="account-settings-title">
    <div className="mb-4">
      <span className="story-eyebrow">Security</span>
      <h2 id="account-settings-title" className="mt-2 text-xl font-bold text-story-navy dark:text-foreground">Account settings</h2>
      <p className="mt-1 text-sm text-muted">Edit your email or phone. New contact details take effect after OTP verification.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{contactCard("email")}{contactCard("phone")}</div>
  </section>;
}
