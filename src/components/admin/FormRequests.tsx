"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, Paperclip, Search, Inbox, Briefcase, Trash2, Building2, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useLiveData } from "@/components/admin/useLiveData";
import { LiveIndicator } from "@/components/admin/DataTable";
import { Modal, ConfirmDialog, useToast, type ConfirmState } from "@/components/admin/Modal";
import type { FormRequestRow } from "@/app/api/admin/requests/route";

const SECTIONS: { id: string; label: string }[] = [
  { id: "all", label: "All forms" },
  { id: "web", label: "Web projects" },
  { id: "mobile", label: "Mobile apps" },
  { id: "software", label: "Custom software" },
  { id: "marketing", label: "Digital marketing" },
  { id: "service", label: "Service enquiries" },
  { id: "contact", label: "Contact" },
  { id: "payment", label: "Course payment" },
  { id: "feedback", label: "Feedback" },
];

const LEAD_STATUSES = ["new", "contacted", "closed"];
const PROJECT_STATUSES = ["new", "contacted", "requirement_discussion", "proposal_sent", "negotiation", "approved", "in_development", "completed", "rejected", "on_hold"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const CLOSED = new Set(["closed", "completed", "rejected"]);

const label = (s: string) => s.replace(/_/g, " ");

const fieldCls =
  "w-full rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30";

function fmtDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function KindPill({ kind }: { kind: FormRequestRow["kind"] }) {
  return kind === "project" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
      <Briefcase className="h-3 w-3" /> Project
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
      <Inbox className="h-3 w-3" /> Enquiry
    </span>
  );
}

function StatTile({ title, value, tone, active, onClick }: { title: string; value: number; tone: string; active?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-surface p-4 text-left transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]",
        active ? "border-brand-400 ring-4 ring-brand-100 dark:ring-brand-900/30" : "border-border-soft"
      )}
    >
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", tone)}>{value}</p>
    </Tag>
  );
}

function ContactActions({ row }: { row: FormRequestRow }) {
  const wa = (row.whatsapp || row.phone).replace(/\D/g, "");
  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border border-border-soft bg-surface px-3 py-2 text-xs font-medium transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`mailto:${row.email}`} className={btn}><Mail className="h-3.5 w-3.5" /> Email</a>
      <a href={`tel:${row.phone}`} className={btn}><Phone className="h-3.5 w-3.5" /> Call</a>
      {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={btn}><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
    </div>
  );
}

/* ── Detail dialog ──────────────────────────────────────────────────── */

type DetailProps = {
  onClose: () => void;
  onSave: (row: FormRequestRow, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (row: FormRequestRow) => void;
};

function RequestDetail({ row, ...rest }: { row: FormRequestRow | null } & DetailProps) {
  // Keep the last row rendered while the closing animation plays.
  const [shown, setShown] = useState<FormRequestRow | null>(row);
  if (row && row !== shown) setShown(row);
  const r = shown;
  return (
    <Modal open={!!row} onClose={rest.onClose} wide title={r?.name ?? ""} subtitle={r ? `${r.ref} · ${fmtDate(r.createdAt, true)}` : undefined}>
      {r && <DetailBody key={r.id} r={r} {...rest} />}
    </Modal>
  );
}

function DetailBody({ r, onClose, onSave, onDelete }: { r: FormRequestRow } & DetailProps) {
  const [status, setStatus] = useState(r.status);
  const [priority, setPriority] = useState(r.priority ?? "normal");
  const [assignedTo, setAssignedTo] = useState(r.assignedTo ?? "");
  const [notes, setNotes] = useState(r.internalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const isProject = r.kind === "project";
  const dirty =
    status !== r.status ||
    (isProject && (priority !== (r.priority ?? "normal") || assignedTo !== (r.assignedTo ?? "") || notes !== (r.internalNotes ?? "")));

  async function save() {
    setSaving(true);
    try {
      await onSave(r, isProject ? { status, priority, assignedTo: assignedTo || null, internalNotes: notes || null } : { status });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <KindPill kind={r.kind} />
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium capitalize">{label(r.service)}</span>
        <StatusBadge status={r.status} />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-soft bg-surface-2/50 p-4 text-sm sm:grid-cols-2">
        <p className="min-w-0 break-words"><span className="block text-[11px] uppercase tracking-wide text-muted">Email</span>{r.email}</p>
        <p><span className="block text-[11px] uppercase tracking-wide text-muted">Phone</span>{r.phone}</p>
        {r.company && <p className="min-w-0 break-words"><span className="block text-[11px] uppercase tracking-wide text-muted">Company</span>{r.company}</p>}
        {r.whatsapp && <p><span className="block text-[11px] uppercase tracking-wide text-muted">WhatsApp</span>{r.whatsapp}</p>}
      </div>
      <ContactActions row={r} />

      {r.details.length > 0 && (
        <dl className="space-y-3">
          {r.details.map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{d.label}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {r.attachments.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Attachments</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {r.attachments.map((a, i) => (
              <a key={`${a.url}-${i}`} href={a.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:underline dark:bg-brand-900/25">
                <Paperclip className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{a.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 border-t border-border-soft pt-5 sm:grid-cols-2">
        <label className="text-xs font-medium">
          Status
          <select className={cn(fieldCls, "mt-1 capitalize")} value={status} onChange={(e) => setStatus(e.target.value)}>
            {(isProject ? PROJECT_STATUSES : LEAD_STATUSES).map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </label>
        {isProject && (
          <>
            <label className="text-xs font-medium">
              Priority
              <select className={cn(fieldCls, "mt-1 capitalize")} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium sm:col-span-2">
              Assigned team member
              <input className={cn(fieldCls, "mt-1")} value={assignedTo} maxLength={100} onChange={(e) => setAssignedTo(e.target.value)} />
            </label>
            <label className="text-xs font-medium sm:col-span-2">
              Internal notes
              <textarea className={cn(fieldCls, "mt-1")} rows={3} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {r.kind === "lead" ? (
          <Button size="sm" variant="danger" onClick={() => onDelete(r)}><Trash2 className="mr-1.5 inline h-3.5 w-3.5" />Delete</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button size="sm" variant="cancel" onClick={onClose}>Close</Button>
          <Button size="sm" variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Screen ─────────────────────────────────────────────────────────── */

export function FormRequests() {
  const toast = useToast();
  const { data, error, loading, updatedAt, refresh } = useLiveData<{ rows: FormRequestRow[] }>("/api/admin/requests");
  const [section, setSection] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const keyOf = (r: FormRequestRow) => `${r.kind}:${r.id}`;
  const open = rows.find((r) => keyOf(r) === openKey) ?? null;

  const counts = useMemo(
    () => ({
      total: rows.length,
      fresh: rows.filter((r) => r.status === "new").length,
      active: rows.filter((r) => r.status !== "new" && !CLOSED.has(r.status)).length,
      done: rows.filter((r) => CLOSED.has(r.status)).length,
    }),
    [rows]
  );

  const statusOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.status))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (section !== "all" && r.section !== section) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.phone, r.company, r.service, r.ref, r.summary].some((v) => v?.toLowerCase().includes(q));
    });
  }, [rows, section, statusFilter, query]);

  async function save(row: FormRequestRow, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/requests/${row.kind}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast("error", (await res.json().catch(() => ({}))).error ?? "Could not save changes");
      return;
    }
    toast("success", "Request updated");
    await refresh();
  }

  function remove(row: FormRequestRow) {
    setConfirm({
      title: "Delete this submission?",
      message: <>The enquiry from <b>{row.name}</b> will be permanently removed.</>,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/requests/${row.kind}/${row.id}`, { method: "DELETE" });
        if (!res.ok) {
          toast("error", "Could not delete the submission");
          return;
        }
        toast("success", "Submission deleted");
        setOpenKey(null);
        await refresh();
      },
    });
  }

  const tabs = SECTIONS.map((t) => ({ ...t, count: t.id === "all" ? rows.length : rows.filter((r) => r.section === t.id).length }));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold sm:text-2xl">Form Requests</h2>
          <p className="mt-1 text-sm text-muted">Every enquiry and project request submitted through the website forms, in one inbox.</p>
        </div>
        <LiveIndicator updatedAt={updatedAt} error={error} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile title="Total requests" value={counts.total} tone="" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        <StatTile title="New" value={counts.fresh} tone="text-brand-600" active={statusFilter === "new"} onClick={() => setStatusFilter("new")} />
        <StatTile title="In progress" value={counts.active} tone="text-amber-600" />
        <StatTile title="Closed / done" value={counts.done} tone="text-success" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border-soft bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={cn(
                "shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                section === t.id ? "bg-story-royal text-white shadow" : "text-foreground/70 hover:bg-surface-2"
              )}
            >
              {t.label} <span className="ml-1 text-xs opacity-80">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/30">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone, service, ID…"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <select className={cn(fieldCls, "capitalize sm:w-52")} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-soft bg-surface px-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 font-semibold">{rows.length === 0 ? "No requests yet" : "No requests match your filters"}</p>
          <p className="mt-1 text-sm text-muted">{rows.length === 0 ? "New form submissions will appear here automatically." : "Try a different search, tab or status."}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border-soft bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border-soft bg-surface-2/60 text-left text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Requester</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="hidden px-4 py-3 font-semibold xl:table-cell">Details</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={keyOf(r)} onClick={() => setOpenKey(keyOf(r))} className="cursor-pointer border-b border-border-soft/70 last:border-0 transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-900/10">
                    <td className="max-w-60 px-4 py-3">
                      <p className="truncate font-medium">{r.name}</p>
                      <p className="truncate text-xs text-muted">{r.email}</p>
                    </td>
                    <td className="px-4 py-3"><KindPill kind={r.kind} /></td>
                    <td className="px-4 py-3 capitalize">{label(r.service)}</td>
                    <td className="hidden max-w-xs px-4 py-3 xl:table-cell"><span className="block truncate text-muted" title={r.summary}>{r.summary || "—"}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">{fmtDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((r, i) => (
              <motion.li key={keyOf(r)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}>
                <button onClick={() => setOpenKey(keyOf(r))} className="w-full cursor-pointer rounded-2xl border border-border-soft bg-surface p-4 text-left transition-all active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.name}</p>
                      <p className="truncate text-xs text-muted">{r.email}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    <KindPill kind={r.kind} />
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium capitalize">{label(r.service)}</span>
                    {r.company && <span className="inline-flex items-center gap-1 text-muted"><Building2 className="h-3 w-3" />{r.company}</span>}
                  </div>
                  {r.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{r.summary}</p>}
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted"><Clock className="h-3 w-3" />{fmtDate(r.createdAt, true)}</p>
                </button>
              </motion.li>
            ))}
          </ul>
        </>
      )}

      <RequestDetail row={open} onClose={() => setOpenKey(null)} onSave={save} onDelete={remove} />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
