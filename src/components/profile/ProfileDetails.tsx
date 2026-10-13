"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CalendarDays, Check, GraduationCap, LoaderCircle, MapPin, Pencil, ShieldCheck, UserRound, X } from "lucide-react";
import { CountrySelect } from "@/components/ui/CountrySelect";

type Values = { name: string; country: string; grade: string; board: string };

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (code: string) => (code ? regionNames?.of(code.toUpperCase()) ?? code : "");

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:translate-x-1 hover:border-story-royal/30">
      <span className="mt-0.5 text-story-royal transition-transform duration-200 group-hover:scale-110">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}

const Empty = () => <span className="font-normal italic text-muted">Not added</span>;

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">{label}</label>
      {children}
    </div>
  );
}

type CardKey = "personal" | "learning";

/** Personal and learning details with inline editing. Each card saves on its own and shows a brief "Saved" confirmation. */
export function ProfileDetails({ initial, role, joinedOn }: { initial: Values; role: string; joinedOn: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Values>(initial);
  const [draft, setDraft] = useState<Values>(initial);
  const [editing, setEditing] = useState<CardKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<CardKey | null>(null);

  function startEdit(card: CardKey) {
    setDraft(saved);
    setError(null);
    setEditing(card);
  }

  async function save(card: CardKey) {
    setBusy(true);
    setError(null);
    const payload = card === "personal" ? { name: draft.name, country: draft.country } : { grade: draft.grade, board: draft.board };
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "We couldn't save your changes");
        return;
      }
      setSaved({ name: json.user.name, country: json.user.country ?? "", grade: json.user.grade ?? "", board: json.user.board ?? "" });
      setEditing(null);
      setFlash(card);
      window.setTimeout(() => setFlash(null), 2200);
      router.refresh();
    } catch {
      setError("We couldn't save your changes. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const header = (card: CardKey, title: string, icon: ReactNode, id: string) => (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 id={id} className="flex items-center gap-2 text-base font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-story-mist text-story-royal">{icon}</span> {title}
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        {flash === card ? (
          <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3 w-3" /> Saved
          </motion.span>
        ) : editing !== card ? (
          <motion.button key="edit" type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => startEdit(card)} className="group inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1 text-xs font-semibold text-muted transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal active:scale-95">
            <Pencil className="h-3 w-3 transition-transform group-hover:-rotate-12" /> Edit
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );

  const actions = (card: CardKey) => (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" disabled={busy} onClick={() => save(card)} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60">
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
      </button>
      <button type="button" disabled={busy} onClick={() => { setEditing(null); setError(null); }} className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-muted transition-all hover:border-red-300 hover:text-red-600 active:scale-95">
        <X className="h-4 w-4" /> Cancel
      </button>
      {error && <p role="alert" className="w-full text-xs font-medium text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.section layout aria-labelledby="personal-details-title" className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
        {header("personal", "Personal details", <UserRound className="h-4 w-4" />, "personal-details-title")}
        <AnimatePresence mode="wait" initial={false}>
          {editing === "personal" ? (
            <motion.form key="edit" onSubmit={(e) => { e.preventDefault(); void save("personal"); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <Field id="pf-name" label="Full name">
                <input id="pf-name" value={draft.name} maxLength={80} autoComplete="name" onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
              </Field>
              <Field id="pf-country" label="Country">
                <CountrySelect id="pf-country" value={draft.country} onChange={(code) => setDraft({ ...draft, country: code })} />
              </Field>
              {actions("personal")}
            </motion.form>
          ) : (
            <motion.dl key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <Row icon={<UserRound className="h-4 w-4" />} label="Full name">{saved.name}</Row>
              <Row icon={<MapPin className="h-4 w-4" />} label="Country">{saved.country ? countryName(saved.country) : <Empty />}</Row>
            </motion.dl>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section layout aria-labelledby="learning-profile-title" className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
        {header("learning", "Learning profile", <GraduationCap className="h-4 w-4" />, "learning-profile-title")}
        <AnimatePresence mode="wait" initial={false}>
          {editing === "learning" ? (
            <motion.form key="edit" onSubmit={(e) => { e.preventDefault(); void save("learning"); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <Field id="pf-grade" label="Grade or year">
                <input id="pf-grade" value={draft.grade} maxLength={40} placeholder="e.g. Class 10 or B.Tech 2nd year" onChange={(e) => setDraft({ ...draft, grade: e.target.value })} className={inputCls} />
              </Field>
              <Field id="pf-board" label="Board or university">
                <input id="pf-board" value={draft.board} maxLength={60} placeholder="e.g. CBSE, State Board or your university" onChange={(e) => setDraft({ ...draft, board: e.target.value })} className={inputCls} />
              </Field>
              {actions("learning")}
            </motion.form>
          ) : (
            <motion.dl key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <Row icon={<GraduationCap className="h-4 w-4" />} label="Grade">{saved.grade || <Empty />}</Row>
              <Row icon={<ShieldCheck className="h-4 w-4" />} label="Board">{saved.board || <Empty />}</Row>
              <Row icon={<BadgeCheck className="h-4 w-4" />} label="Account type">{role}</Row>
              <Row icon={<CalendarDays className="h-4 w-4" />} label="Member since">{joinedOn}</Row>
            </motion.dl>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
