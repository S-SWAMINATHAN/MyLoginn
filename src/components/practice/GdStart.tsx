"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, Plus, Shuffle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { GD_CATEGORIES, GD_LIMITS, isRoomCode, normalizeRoomCode } from "@/lib/practice/gd/config";
import { Card, postJson } from "./ui";

export function GdStart({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState(GD_CATEGORIES[0].id);
  const [topic, setTopic] = useState(GD_CATEGORIES[0].topics[0]);
  const [custom, setCustom] = useState("");
  const [max, setMax] = useState(GD_LIMITS.defaultParticipants);
  const [minutes, setMinutes] = useState(GD_LIMITS.discussS.default / 60);
  const [prep, setPrep] = useState(GD_LIMITS.prepS.default / 60);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cat = GD_CATEGORIES.find((c) => c.id === category)!;

  const needLogin = () => { router.push("/login?next=%2Fpractice%2Fgd"); };

  const create = async () => {
    if (busy) return;
    if (!loggedIn) return needLogin();
    setBusy("create");
    setError(null);
    const res = await postJson<{ code: string }>("/api/gd/rooms", { category, topic: custom.trim() || topic, maxParticipants: max, discussS: minutes * 60, prepS: Math.round(prep * 60) });
    if (res.ok) router.push(`/practice/gd/${res.data.code}`);
    else { setError(res.error); setBusy(null); }
  };

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedIn) return needLogin();
    const c = normalizeRoomCode(code);
    if (!isRoomCode(c)) { setError("Enter a room code like ML-GD-7K29."); return; }
    setBusy("join");
    router.push(`/practice/gd/${c}`);
  };

  const shuffle = () => { const pick = cat.topics[Math.floor(Math.random() * cat.topics.length)]; setTopic(pick); setCustom(""); };
  const select = "mt-2 w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm outline-none focus:border-story-royal";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card className="space-y-5">
        <p className="flex items-center gap-2 text-base font-bold"><Plus className="h-5 w-5 text-story-royal" />Create a room</p>
        <div>
          <p className="text-sm font-semibold">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GD_CATEGORIES.map((c) => <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => { setCategory(c.id); setTopic(c.topics[0]); }} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", category === c.id ? "border-story-royal bg-story-royal/10 text-story-royal" : "border-border-soft hover:border-story-royal/40")}>{c.label}</button>)}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between"><p className="text-sm font-semibold">Topic</p><button type="button" onClick={shuffle} className="inline-flex items-center gap-1 text-xs font-semibold text-story-royal hover:underline"><Shuffle className="h-3.5 w-3.5" />Random</button></div>
          <ul className="mt-2 grid gap-1.5">
            {cat.topics.map((t) => <li key={t}><button type="button" aria-pressed={!custom && topic === t} onClick={() => { setTopic(t); setCustom(""); }} className={cn("w-full rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors", !custom && topic === t ? "border-story-royal bg-story-royal/10 font-semibold text-story-royal" : "border-border-soft hover:border-story-royal/40")}>{t}</button></li>)}
          </ul>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">Or write your own topic</span>
            <input value={custom} onChange={(e) => setCustom(e.target.value.slice(0, 160))} placeholder="e.g. Should startups hire freshers?" className={select} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold">Participants (max)
            <select value={max} onChange={(e) => setMax(Number(e.target.value))} className={select}>{Array.from({ length: GD_LIMITS.maxParticipants - GD_LIMITS.minParticipants + 1 }, (_, i) => i + GD_LIMITS.minParticipants).map((n) => <option key={n} value={n}>{n}{n === GD_LIMITS.defaultParticipants ? " (recommended)" : ""}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">Discussion
            <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={select}>{[5, 10, 15, 20, 25, 30, 35, 40].map((m) => <option key={m} value={m}>{m} minutes{m === 30 ? " (recommended)" : ""}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">Preparation
            <select value={prep} onChange={(e) => setPrep(Number(e.target.value))} className={select}>{[0, 1, 2, 3, 5].map((m) => <option key={m} value={m}>{m ? `${m} minute${m > 1 ? "s" : ""}` : "None"}</option>)}</select>
          </label>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={() => void create()} disabled={busy !== null} icon={<ArrowRight className="h-5 w-5" />}>{busy === "create" ? "Creating room…" : loggedIn ? "Create room" : "Log in to create"}</Button>
      </Card>

      <div className="space-y-5">
        <Card>
          <form onSubmit={join} className="space-y-3">
            <p className="flex items-center gap-2 text-base font-bold"><LogIn className="h-5 w-5 text-story-royal" />Join with a code</p>
            <label className="block">
              <span className="sr-only">Room code</span>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))} placeholder="ML-GD-7K29" autoCapitalize="characters" autoComplete="off" className="w-full rounded-2xl border border-border-soft bg-background px-4 py-3 text-center font-mono text-xl tracking-widest outline-none focus:border-story-royal" />
            </label>
            <Button type="submit" className="w-full" disabled={busy !== null || !code.trim()}>{busy === "join" ? "Opening…" : "Join room"}</Button>
          </form>
        </Card>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <Card className="text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">How it works</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Create a room and share the code with 1-5 friends.</li>
            <li>The host starts; everyone gets preparation time.</li>
            <li>Discuss by voice — audio goes directly between your browsers.</li>
            <li>The AI judge evaluates the complete discussion and gives each person a report.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
