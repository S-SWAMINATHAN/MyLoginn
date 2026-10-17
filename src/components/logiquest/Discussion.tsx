"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { MAX_COMMENT_LENGTH } from "@/lib/logiquest/constants";

export type CommentRow = { id: string; name: string; body: string; createdAt: string; mine: boolean };

const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Per-question discussion: read by everyone, posting needs a login. */
export function Discussion({ qid, initial, loggedIn, isAdmin, loginHref }: { qid: string; initial: CommentRow[]; loggedIn: boolean; isAdmin: boolean; loginHref: string }) {
  const [rows, setRows] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setError(null);
    const r = await fetch("/api/logiquest/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qid, body: text }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy(false);
    if (!r?.ok) { setError(j?.error ?? "Could not post."); return; }
    setRows((x) => [...x, { id: j.id, name: j.name, body: j.body, createdAt: j.createdAt, mine: true }]);
    setText("");
  }

  async function remove(id: string) {
    const r = await fetch(`/api/logiquest/comments?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
    if (r?.ok) setRows((x) => x.filter((c) => c.id !== id));
  }

  return (
    <section aria-labelledby="discussion" className="mt-8">
      <h2 id="discussion" className="text-lg font-bold">Discussion ({rows.length})</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border-soft bg-surface p-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-story-royal/15 text-xs font-bold text-story-royal">{c.name.charAt(0)}</span>
              <span className="font-semibold text-story-navy dark:text-foreground">{c.name}</span>
              <span>· {when(c.createdAt)}</span>
              {c.mine || isAdmin ? <button onClick={() => remove(c.id)} className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-rose-600" aria-label="Delete message"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-6">{c.body}</p>
          </li>
        ))}
        {!rows.length ? <li className="rounded-2xl border border-dashed border-border-soft p-5 text-center text-sm text-muted">No discussion yet. Ask a doubt or share a shortcut.</li> : null}
      </ul>
      {loggedIn ? (
        <form onSubmit={post} className="mt-4">
          <label htmlFor="comment" className="sr-only">Your message</label>
          <textarea id="comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_COMMENT_LENGTH} rows={4} placeholder="Share your method, a shortcut, or ask a doubt…" className="w-full rounded-2xl border border-border-soft bg-background p-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-story-royal" />
          {error ? <p role="alert" className="mt-1 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{text.length}/{MAX_COMMENT_LENGTH}</span>
            <button disabled={busy || !text.trim()} className="inline-flex items-center gap-2 rounded-full bg-story-royal px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Post</button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm"><Link href={loginHref} className="font-semibold text-story-royal">Log in</Link> to join the discussion.</p>
      )}
    </section>
  );
}
