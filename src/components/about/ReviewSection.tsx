"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";

export type PublicReview = { id: string; name: string; company: string | null; rating: number; content: string; submittedAt: string | Date };

function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>{[1,2,3,4,5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= rating ? "fill-current" : "text-slate-200"}`} />)}</span>;
}

export function ReviewCard({ review }: { review: PublicReview }) {
  const initials = review.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <article className="relative flex h-full min-h-60 flex-col overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-[0_12px_32px_-24px_rgba(29,66,116,.34)] sm:p-5">
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8eef8] text-xs font-bold text-story-navy">{initials}</span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-story-navy">{review.name}</p>{review.company && <p className="mt-0.5 truncate text-[11px] text-muted">{review.company}</p>}</div>
      <Stars rating={review.rating} />
    </div>
    <p className="relative z-10 mt-5 line-clamp-5 flex-1 text-xs leading-5 text-foreground/75">{review.content}</p>
    <span aria-hidden="true" className="pointer-events-none absolute -bottom-5 right-3 font-serif text-[6rem] font-bold leading-none text-slate-100">”</span>
    <time className="relative z-10 mt-3 text-[10px] text-muted" dateTime={new Date(review.submittedAt).toISOString()}>{new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(review.submittedAt))}</time>
  </article>;
}

export function ReviewSection({ reviews, compact = false }: { reviews: PublicReview[]; compact?: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(form: HTMLFormElement) {
    setBusy(true); setError("");
    const fd = new FormData(form);
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), company: fd.get("company"), rating: fd.get("rating"), content: fd.get("content"), website: fd.get("website") }) }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setBusy(false);
    if (!response?.ok) { setError(result?.error ?? "Something went wrong. Please try again."); return; }
    setSent(true); form.reset();
  }
  return <section className="mx-auto w-full max-w-7xl px-5 sm:px-8" aria-labelledby={compact ? "home-reviews-title" : "about-reviews-title"}>
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 id={compact ? "home-reviews-title" : "about-reviews-title"} className="text-2xl font-bold tracking-tight text-story-navy dark:text-foreground sm:text-3xl">What our clients say!</h2>
      <span aria-hidden="true" className="mt-3 h-0.5 w-12 rounded-full bg-[#ef8c7c]" />
      <p className="mt-3 text-sm leading-6 text-muted">Feedback shared by clients and partners after collaborating with MyLoginn Tech.</p>
      <div className="mt-5 flex items-center gap-2">
        {compact && <><button onClick={() => rail.current?.scrollBy({ left: -300, behavior: "smooth" })} aria-label="Previous reviews" className="grid h-9 w-9 place-items-center rounded-full border border-border-soft bg-surface text-foreground transition hover:border-brand-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /></button><button onClick={() => rail.current?.scrollBy({ left: 300, behavior: "smooth" })} aria-label="Next reviews" className="grid h-9 w-9 place-items-center rounded-full border border-border-soft bg-surface text-foreground transition hover:border-brand-500 hover:text-brand-600"><ArrowRight className="h-4 w-4" /></button></>}
        <button onClick={() => { setOpen(true); setSent(false); setError(""); }} className="rounded-full bg-story-royal px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700">Write a review</button>
      </div>
    </div>
    <div className="relative mt-8 rounded-[2rem] bg-[#eef4fb] p-4 sm:p-6 lg:p-8">
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 font-serif text-[8rem] font-bold leading-none text-white/80">“</span>
      {reviews.length ? <div ref={rail} className={compact ? "relative grid auto-cols-max grid-flow-col gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4" : "relative grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"}>{reviews.map((review) => compact ? <div key={review.id} className="w-[min(78vw,15rem)] snap-start"><ReviewCard review={review} /></div> : <ReviewCard key={review.id} review={review} />)}</div> : <div className="relative rounded-2xl border border-dashed border-border-soft bg-white/70 p-8 text-center text-sm text-muted">Client feedback will appear here after it has been reviewed.</div>}
    </div>
    {open && <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="review-dialog-title" className="relative my-auto w-full max-w-lg rounded-3xl border border-border-soft bg-surface p-6 shadow-2xl sm:p-8">
        <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2"><X className="h-4 w-4" /></button>
        <span className="story-eyebrow">Client feedback</span><h3 id="review-dialog-title" className="mt-2 text-2xl font-bold">Share Your Experience</h3>
        {sent ? <p role="status" className="mt-6 rounded-2xl bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-800">Thank you for sharing your feedback! Your review has been submitted successfully and will be published after approval.</p> : <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget); }}>
          <label className="block text-sm font-semibold">Your Name<input className="field-control mt-1.5" name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label className="block text-sm font-semibold">Your Email Address<input className="field-control mt-1.5" name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label className="block text-sm font-semibold">Company Name <span className="font-normal text-muted">(Optional)</span><input className="field-control mt-1.5" name="company" maxLength={120} /></label>
          <label className="block text-sm font-semibold">Rating<select className="field-control mt-1.5" name="rating" defaultValue="5">{[5,4,3,2,1].map((n) => <option value={n} key={n}>{n} star{n === 1 ? "" : "s"}</option>)}</select></label>
          <label className="block text-sm font-semibold">Your Review<textarea className="field-control mt-1.5" name="content" required minLength={10} maxLength={2000} placeholder="Type your review here and share your experience with MyLoginn Tech..." /></label>
          <label className="absolute -left-[10000px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-story-royal px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Submitting…" : "Submit Review"}</button>
        </form>}
      </div>
    </div>}
  </section>;
}
