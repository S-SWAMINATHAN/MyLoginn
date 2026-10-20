"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Trophy } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { api } from "./client";
import { GOLD_BUTTON, GOLD_SHINE } from "./styles";
import { cn } from "@/lib/cn";

/** Only same-site paths under /coding-competition are accepted as a post-login destination. */
const safeNext = (next: string | null) => (next && /^\/coding-competition(\/[\w/-]*)?$/.test(next) ? next : "/coding-competition/dashboard");

export function LoginForm({ next, title }: { next: string | null; title: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError(null);
    try {
      await api("/api/coding-competition/login", { body: { email: email.trim(), password } });
      // Full navigation so the server-rendered header and pages pick up the new session.
      window.location.assign(safeNext(next));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="rounded-[1.75rem] border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-story-royal text-white"><Trophy className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-bold">Student login</h1>
        <p className="mt-1.5 text-sm text-muted">{title ? `Sign in to your ${title} dashboard.` : "Sign in with your MyLoginn account."}</p>
        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Input id="cc-login-email" label="Email address" type="email" autoComplete="email" inputMode="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput id="cc-login-password" label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex justify-end">
            <Link href="/reset-password" className="text-xs font-semibold text-story-royal hover:underline">Forgot password?</Link>
          </div>
          <AnimatePresence>
            {error && <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</motion.p>}
          </AnimatePresence>
          <button type="submit" disabled={busy} className={cn(GOLD_BUTTON, "w-full")}>
            <span aria-hidden="true" className={GOLD_SHINE} />
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Log in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">New here? <Link href="/coding-competition/register" className="font-semibold text-story-royal hover:underline">Register for the competition</Link></p>
      </motion.div>
    </div>
  );
}
