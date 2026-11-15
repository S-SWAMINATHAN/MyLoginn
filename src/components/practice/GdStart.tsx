"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, Plus, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
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
  const inputClass = "mt-2 w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm outline-none focus:border-story-royal";

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] 2xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.6fr)]">
      <Card className="min-w-0 space-y-6 p-5 sm:p-7 lg:p-8">
        <p className="flex items-center gap-2 text-base font-bold"><Plus className="h-5 w-5 text-story-royal" />Create a room</p>
        <Select
          label="Category"
          value={category}
          options={GD_CATEGORIES.map((c) => ({ label: c.label, value: c.id }))}
          className="rounded-2xl"
          onChange={(e) => {
            const next = GD_CATEGORIES.find((c) => c.id === e.target.value)!;
            setCategory(next.id);
            setTopic(next.topics[0]);
            setCustom("");
          }}
        />
        <div>
          <div className="flex items-center justify-between gap-3"><label htmlFor="gd-topic" className="text-sm font-semibold">Topic</label><button type="button" onClick={shuffle} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-story-royal hover:underline"><Shuffle className="h-3.5 w-3.5" />Random</button></div>
          <Select
            id="gd-topic"
            value={topic}
            options={cat.topics.map((t) => ({ label: t, value: t }))}
            className="mt-2 rounded-2xl"
            onChange={(e) => { setTopic(e.target.value); setCustom(""); }}
          />
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">Or write your own topic</span>
            <input value={custom} onChange={(e) => setCustom(e.target.value.slice(0, 160))} placeholder="e.g. Should startups hire freshers?" className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Select
            label="Participants (max)"
            value={String(max)}
            options={Array.from({ length: GD_LIMITS.maxParticipants - GD_LIMITS.minParticipants + 1 }, (_, i) => i + GD_LIMITS.minParticipants).map((n) => ({
              label: `${n}${n === GD_LIMITS.defaultParticipants ? " (recommended)" : ""}`,
              value: String(n),
            }))}
            className="rounded-2xl"
            onChange={(e) => setMax(Number(e.target.value))}
          />
          <Select
            label="Discussion"
            value={String(minutes)}
            options={[5, 10, 15, 20, 25, 30, 35, 40].map((m) => ({
              label: `${m} minutes${m === 30 ? " (recommended)" : ""}`,
              value: String(m),
            }))}
            className="rounded-2xl"
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
          <Select
            label="Preparation"
            value={String(prep)}
            options={[0, 1, 2, 3, 5].map((m) => ({
              label: m ? `${m} minute${m > 1 ? "s" : ""}` : "None",
              value: String(m),
            }))}
            className="rounded-2xl"
            onChange={(e) => setPrep(Number(e.target.value))}
          />
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={() => void create()} disabled={busy !== null} icon={<ArrowRight className="h-5 w-5" />}>{busy === "create" ? "Creating room…" : loggedIn ? "Create discussion room" : "Log in to create"}</Button>
      </Card>

      <div className="min-w-0 space-y-5 xl:sticky xl:top-32 xl:self-start">
        <Card className="space-y-4 p-5 sm:p-6">
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
        <Card className="border-l-4 border-l-story-royal text-sm leading-6 text-muted">
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
