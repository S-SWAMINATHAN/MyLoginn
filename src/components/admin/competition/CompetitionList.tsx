"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpenCheck, Plus, Trophy } from "lucide-react";
import { useLiveData } from "@/components/admin/useLiveData";
import { Modal } from "@/components/admin/Modal";
import type { CompetitionStatus } from "@/lib/competition/types";
import { CompetitionForm } from "./CompetitionForm";
import { Btn, Empty, fmtDate, Panel, StatusPill } from "./ui";

type Row = { id: string; slug: string; title: string; status: CompetitionStatus; startsAt: string; registrationCount: number; maxParticipants: number; timezone: string };

export function CompetitionList() {
  const router = useRouter();
  const { data, error, loading } = useLiveData<{ competitions: Row[] }>("/api/admin/coding-competition", { intervalMs: 20_000 });
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-story-royal">Learning</p>
          <h1 className="mt-1 text-2xl font-bold">Coding Competition</h1>
          <p className="mt-1 text-sm text-muted">Create competitions, manage the question bank, run the live event and publish results.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/coding-competition/questions" className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-semibold hover:border-story-royal/40"><BookOpenCheck className="h-4 w-4" /> Question bank</Link>
          <Btn onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New competition</Btn>
        </div>
      </div>

      {error && <p className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>}

      <Panel>
        {loading ? (
          <p className="p-6 text-center text-sm text-muted">Loading…</p>
        ) : !data?.competitions.length ? (
          <Empty>No competitions yet. Start with <b>New competition</b>; it is saved as a draft and nothing is public until you open registration.</Empty>
        ) : (
          <div className="divide-y divide-border-soft">
            {data.competitions.map((c) => (
              <Link key={c.id} href={`/admin/coding-competition/${c.id}`} className="flex flex-wrap items-center gap-4 px-2 py-4 transition-colors hover:bg-surface-2/70">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-story-royal"><Trophy className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.title}</span>
                  <span className="block text-xs text-muted">Starts {fmtDate(c.startsAt, c.timezone)} · {c.registrationCount.toLocaleString("en-IN")} / {c.maxParticipants.toLocaleString("en-IN")} registered</span>
                </span>
                <StatusPill status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Modal open={creating} onClose={() => setCreating(false)} title="New competition" subtitle="Saved as a draft. You can add the reward and check the question bank before opening registration." wide>
        <CompetitionForm initial={null} onSaved={(id) => { setCreating(false); router.push(`/admin/coding-competition/${id}`); }} />
      </Modal>
    </div>
  );
}
