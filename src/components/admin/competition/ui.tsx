"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { STATUS_LABEL, type CompetitionStatus } from "@/lib/competition/types";

export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-400 focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16)] disabled:bg-slate-50 disabled:text-slate-500";

/** POST/PUT to an admin endpoint. Resolves with the JSON body or throws an Error carrying the server message. */
export async function adminCall<T = Record<string, unknown>>(url: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const res = await fetch(url, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error((json as { error?: string }).error ?? `Request failed (${res.status})`), { code: (json as { code?: string }).code });
  return json as T;
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-4 text-slate-500">{hint}</span>}
    </label>
  );
}

export function Panel({ title, sub, actions, children, className }: { title?: string; sub?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)]", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_TONE: Record<CompetitionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  REGISTRATION_OPEN: "bg-emerald-50 text-emerald-700",
  REGISTRATION_CLOSED: "bg-amber-50 text-amber-700",
  SCHEDULED: "bg-sky-50 text-sky-700",
  LIVE: "bg-red-50 text-red-700",
  SUBMISSION_CLOSED: "bg-violet-50 text-violet-700",
  EVALUATION: "bg-violet-50 text-violet-700",
  UNDER_REVIEW: "bg-orange-50 text-orange-700",
  RESULTS_PUBLISHED: "bg-brand-50 text-story-royal",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export function StatusPill({ status }: { status: CompetitionStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_TONE[status])}>
      {status === "LIVE" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" | "red" | "blue" }) {
  const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700", blue: "bg-brand-50 text-story-royal" };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

export function Btn({ children, onClick, busy, tone = "primary", disabled, type = "button", small }: { children: ReactNode; onClick?: () => void; busy?: boolean; tone?: "primary" | "ghost" | "danger"; disabled?: boolean; type?: "button" | "submit"; small?: boolean }) {
  const tones = {
    primary: "bg-story-royal text-white hover:brightness-110",
    ghost: "border border-border-soft bg-surface text-foreground hover:border-story-royal/40",
    danger: "bg-danger text-white hover:brightness-110",
  };
  return (
    <button type={type} onClick={onClick} disabled={busy || disabled} className={cn("inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-[filter,border-color,opacity] disabled:opacity-50", small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm", tones[tone])}>
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border-soft p-6 text-center text-sm text-muted">{children}</p>;
}

export const fmtDate = (iso: string | Date | null | undefined, tz = "Asia/Kolkata") =>
  iso ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: tz }).format(new Date(iso)) : "—";

/** `datetime-local` value (browser local time) ⇄ ISO string with offset. */
export const toLocalInput = (iso: string | Date | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");
