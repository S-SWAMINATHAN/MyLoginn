"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Database, Inbox, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Chip, MonitorFrame } from "@/components/services/testing/TestingVisuals";

type Need = "Website" | "Web app" | "Mobile app";
type Status = "New" | "In progress" | "Done";
type Row = { id: number; name: string; need: Need; note: string; status: Status; fresh?: boolean };

const NEEDS: Need[] = ["Website", "Web app", "Mobile app"];
const STEPS = ["Request form", "Database", "Admin panel"] as const;
const SEEDS: Row[] = [
  { id: 1041, name: "Rahul K.", need: "Website", note: "Company website with enquiry form", status: "Done" },
  { id: 1042, name: "Meena S.", need: "Mobile app", note: "Booking app for salons", status: "In progress" },
  { id: 1043, name: "Arjun P.", need: "Web app", note: "Inventory dashboard", status: "In progress" },
];
const DEFAULT = { name: "Priya R.", need: "Web app" as Need, note: "Booking portal for my clinic" };
const STATUS_TONE: Record<Status, string> = { New: "bg-rose-500/10 text-rose-600", "In progress": "bg-amber-500/10 text-amber-600", Done: "bg-emerald-500/10 text-emerald-600" };
const NEXT: Record<Status, Status> = { New: "In progress", "In progress": "Done", Done: "New" };

/**
 * A client's request travelling through a real build: the form they fill in, the database row it becomes, and the admin
 * panel where the team picks it up. It plays by itself and stops the moment someone touches it; every step is usable.
 */
export function ClientRequestMonitor() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [form, setForm] = useState(DEFAULT);
  const [rows, setRows] = useState<Row[]>(SEEDS);
  const [sent, setSent] = useState(false);

  const submit = (manual: boolean) => {
    if (manual) setAuto(false);
    if (!sent) setRows((r) => [{ id: 1044, name: form.name.trim() || "New client", need: form.need, note: form.note.trim() || "No details yet", status: "New", fresh: true }, ...r]);
    setSent(true);
    setStep(1);
  };
  const reset = () => { setRows(SEEDS); setSent(false); setForm(DEFAULT); setStep(0); };
  const go = (s: number) => { setAuto(false); setStep(s); };

  // the demo walks itself through: send the request, show the row, show the admin panel, start again
  useEffect(() => {
    if (!auto || reduced) return;
    const t = window.setTimeout(() => {
      if (step === 0) submit(false);
      else if (step === 1) setStep(2);
      else reset();
    }, step === 0 ? 3200 : step === 1 ? 2800 : 4600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, reduced, step]);

  const cycle = (id: number) => { setAuto(false); setRows((r) => r.map((x) => (x.id === id ? { ...x, status: NEXT[x.status], fresh: false } : x))); };
  const field = "w-full rounded-md border border-border-soft bg-white px-2 py-1.5 text-[11px] text-story-navy outline-none transition-colors focus:border-story-royal dark:bg-surface dark:text-foreground";

  return (
    <MonitorFrame
      interactive
      tall
      title="yourproduct.com"
      label=""
      pill="Form, database and admin panel"
      ariaLabel="Interactive demo: a client sends a request through a form, it is saved to the database and appears in the admin panel."
      controls={STEPS.map((s, i) => (
        <Chip key={s} active={step === i} onClick={() => go(i)}>{i + 1}. {s}</Chip>
      ))}
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.form key="form" className="flex h-full flex-col gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} onSubmit={(e) => { e.preventDefault(); submit(true); }}>
            <p className="text-[11px] font-bold text-story-navy dark:text-foreground">Tell us what you need</p>
            <label className="text-[10px] font-semibold text-muted">Your name
              <input className={cn(field, "mt-0.5")} value={form.name} maxLength={40} onChange={(e) => { setAuto(false); setForm({ ...form, name: e.target.value }); }} />
            </label>
            <div>
              <span className="text-[10px] font-semibold text-muted">I need a</span>
              <div className="mt-0.5 flex gap-1">
                {NEEDS.map((n) => (
                  <button key={n} type="button" aria-pressed={form.need === n} onClick={() => { setAuto(false); setForm({ ...form, need: n }); }} className={cn("flex-1 rounded-md border px-1 py-1.5 text-[10px] font-semibold transition-colors", form.need === n ? "border-story-royal bg-story-royal text-white" : "border-border-soft text-muted hover:border-story-royal")}>{n}</button>
                ))}
              </div>
            </div>
            <label className="flex flex-1 flex-col text-[10px] font-semibold text-muted">Project details
              <textarea className={cn(field, "mt-0.5 min-h-0 flex-1 resize-none")} value={form.note} maxLength={90} onChange={(e) => { setAuto(false); setForm({ ...form, note: e.target.value }); }} />
            </label>
            <button type="submit" className="flex items-center justify-center gap-1.5 rounded-md bg-story-royal py-2 text-[11px] font-bold text-white"><Send className="h-3 w-3" />Send request</button>
          </motion.form>
        )}

        {step === 1 && (
          <motion.div key="db" className="flex h-full flex-col" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-muted"><Database className="h-3.5 w-3.5 text-story-royal" />requests</p>
            <div className="mt-2 grid grid-cols-[2.6rem_1fr_3.4rem_4.4rem] gap-x-2 border-b border-border-soft pb-1 font-mono text-[9px] font-semibold uppercase text-muted"><span>id</span><span>name</span><span>need</span><span>status</span></div>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <motion.div key={r.id} layout initial={{ opacity: 0, x: -20, backgroundColor: "rgba(31,86,214,0.14)" }} animate={{ opacity: 1, x: 0, backgroundColor: r.fresh ? "rgba(31,86,214,0.1)" : "rgba(31,86,214,0)" }} transition={{ duration: 0.4 }} className="grid grid-cols-[2.6rem_1fr_3.4rem_4.4rem] items-center gap-x-2 border-b border-border-soft px-0.5 py-1.5 font-mono text-[10px] text-story-navy dark:text-foreground">
                    <span className="text-muted">{r.id}</span><span className="truncate">{r.name}</span><span className="truncate">{r.need.split(" ")[0]}</span><span className="truncate text-muted">{r.status.toLowerCase()}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p className={cn("mt-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold", sent ? "text-emerald-600" : "text-muted")}>{sent ? <><Check className="h-3 w-3" strokeWidth={3} />INSERT 1 row. Saved.</> : "Waiting for a request"}</p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="admin" className="flex h-full flex-col" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-story-navy dark:text-foreground"><Inbox className="h-3.5 w-3.5 text-story-royal" />Admin · Requests</p>
              <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{rows.filter((r) => r.status === "New").length} new</span>
            </div>
            <div className="mt-2 flex flex-1 flex-col gap-1.5 overflow-hidden">
              {rows.slice(0, 4).map((r) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", r.fresh ? "border-story-royal/50 bg-story-royal/5" : "border-border-soft")}>
                  <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[11px] font-semibold text-story-navy dark:text-foreground">{r.name} · {r.need}</span><span className="block truncate text-[10px] text-muted">{r.note}</span></span>
                  <button type="button" onClick={() => cycle(r.id)} aria-label={`${r.name}: ${r.status}. Change status`} className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors", STATUS_TONE[r.status])}>{r.status}</button>
                </motion.div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-muted">Tap a status to move a request along.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </MonitorFrame>
  );
}
