"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Flame, Medal, Minus, Plus, Send, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLiveData } from "@/components/admin/useLiveData";
import { useToast } from "@/components/admin/Modal";
import { LiveNumber } from "@/components/admin/charts";
import { timeAgo } from "@/components/admin/format";

type Rewards = {
  totals: { pointsEarned: number; pointsSpent: number; activeStreaks: number; longestStreak: number };
  leaderboard: { rank: number; id: string; name: string; email: string; role: string; earned: number; balance: number; streak: number; best: number }[];
  ledger: { id: string; user: string; email: string; amount: number; label: string; reason: string; at: string }[];
};

const RANK_COLORS = ["#d97706", "#94a3b8", "#b45309"];
const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-400 focus:border-story-royal focus:shadow-[0_0_0_3px_rgba(31,86,214,0.16)]";

/** Points programme: totals, the leaderboard with full details, a form to award or deduct points, and the ledger. */
export function AdminRewards() {
  const toast = useToast();
  const { data, loading, refresh } = useLiveData<Rewards>("/api/admin/rewards", { intervalMs: 30_000 });
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("50");
  const [sign, setSign] = useState<1 | -1>(1);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) return toast("error", "Enter a whole number of points");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, amount: n * sign, label }) });
      const json = await res.json();
      if (!res.ok) return toast("error", json.error ?? "Couldn't update points");
      toast("success", `${sign > 0 ? "Awarded" : "Deducted"} ${n} points ${sign > 0 ? "to" : "from"} ${json.user}`);
      setEmail("");
      setLabel("");
      void refresh();
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const t = data?.totals;
  const tiles = [
    { label: "Points earned", value: t?.pointsEarned ?? 0, Icon: Coins, color: "#d97706" },
    { label: "Points spent", value: t?.pointsSpent ?? 0, Icon: Medal, color: "#7c3aed" },
    { label: "Active streaks", value: t?.activeStreaks ?? 0, Icon: Flame, color: "#ea580c" },
    { label: "Longest streak (days)", value: t?.longestStreak ?? 0, Icon: Trophy, color: "#2563eb" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <span className="story-eyebrow">Learning programme</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Rewards &amp; leaderboard</h2>
        <p className="mt-1 text-sm text-muted">Track points and streaks, and make manual adjustments when needed. Every change is written to the ledger.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map(({ label: l, value, Icon, color }, i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-4 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <LiveNumber value={value} className="block text-xl font-bold tabular-nums text-story-navy dark:text-foreground" />
              <p className="truncate text-[11px] text-muted">{l}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        {/* leaderboard */}
        <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Leaderboard">
          <h3 className="mb-4 text-base font-bold text-story-navy dark:text-foreground">All-time leaderboard</h3>
          {data?.leaderboard.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-soft text-[10px] font-bold uppercase tracking-wider text-muted">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-3">Learner</th>
                    <th className="pb-2 pr-3 text-right">Earned</th>
                    <th className="pb-2 pr-3 text-right">Balance</th>
                    <th className="pb-2 text-right">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((r) => (
                    <tr key={r.id} className="border-b border-border-soft/60 transition-colors last:border-0 hover:bg-story-mist/60">
                      <td className="py-2.5 pr-2 font-mono text-xs font-bold" style={{ color: RANK_COLORS[r.rank - 1] ?? "var(--muted)" }}>{r.rank}</td>
                      <td className="py-2.5 pr-3"><p className="font-semibold">{r.name}</p><p className="text-xs text-muted">{r.email}</p></td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums">{r.earned.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-muted">{r.balance.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right tabular-nums"><span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" />{r.streak}<span className="text-xs text-muted">/ {r.best}</span></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted">{loading ? "Loading…" : "No points have been earned yet."}</p>
          )}
        </section>

        {/* adjust points */}
        <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Adjust points">
          <h3 className="text-base font-bold text-story-navy dark:text-foreground">Adjust points</h3>
          <p className="mb-4 text-xs text-muted">Award a bonus or deduct points by a learner&apos;s email.</p>
          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label htmlFor="rw-email" className="mb-1.5 block text-[13px] font-semibold">Learner email</label>
              <input id="rw-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="learner@example.com" className={inputCls} />
            </div>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold">Points</span>
              <div className="flex gap-2">
                <div role="radiogroup" aria-label="Award or deduct" className="flex rounded-full bg-story-mist p-1">
                  {([1, -1] as const).map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={sign === s} onClick={() => setSign(s)} aria-label={s > 0 ? "Award" : "Deduct"} className={cn("grid h-9 w-9 place-items-center rounded-full transition-colors", sign === s ? (s > 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "text-muted")}>
                      {s > 0 ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Amount" className={inputCls} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[10, 25, 50, 100, 250].map((n) => (
                  <button key={n} type="button" onClick={() => setAmount(String(n))} className="rounded-full bg-story-mist px-2.5 py-1 text-[11px] font-semibold text-story-royal transition-all hover:-translate-y-0.5 hover:bg-story-royal hover:text-white">{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="rw-label" className="mb-1.5 block text-[13px] font-semibold">Reason</label>
              <input id="rw-label" required maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Workshop attendance bonus" className={inputCls} />
            </div>
            <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.98 }} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-story-royal text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(31,86,214,0.8)] disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? "Saving…" : sign > 0 ? "Award points" : "Deduct points"}
            </motion.button>
          </form>
        </section>
      </div>

      {/* ledger */}
      <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Recent ledger">
        <h3 className="mb-3 text-base font-bold text-story-navy dark:text-foreground">Recent points activity</h3>
        {data?.ledger.length ? (
          <ul className="divide-y divide-border-soft">
            {data.ledger.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", l.amount >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>{l.amount >= 0 ? "+" : "−"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{l.label}</p>
                  <p className="truncate text-xs text-muted">{l.user} · {l.reason.replace(/_/g, " ")}</p>
                </div>
                <span className={cn("shrink-0 text-sm font-bold tabular-nums", l.amount >= 0 ? "text-emerald-600" : "text-rose-600")}>{l.amount >= 0 ? "+" : ""}{l.amount}</span>
                <span className="hidden w-16 shrink-0 text-right text-[11px] text-muted sm:block">{timeAgo(l.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted">{loading ? "Loading…" : "Nothing recorded yet."}</p>
        )}
      </section>
    </div>
  );
}
