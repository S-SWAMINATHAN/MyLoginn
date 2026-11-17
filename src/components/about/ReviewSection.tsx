"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedProfileIcon } from "@/components/about/AnimatedProfileIcon";

export type PublicReview = { id: string; name: string; company: string | null; rating: number; content: string; submittedAt: string | Date };

function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>{[1,2,3,4,5].map((n) => n <= rating
    ? <AnimatedStar key={n} className="h-4 w-4 transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110" delay={(n - 1) * 0.12} />
    : <Star key={n} className="h-4 w-4 text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:text-amber-300" />)}</span>;
}

export function ReviewCard({ review }: { review: PublicReview }) {
  const reducedMotion = useReducedMotion();
  return <article className="relative flex h-full min-h-60 flex-col overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-[0_12px_32px_-24px_rgba(29,66,116,.34)] sm:p-5">
    <div className="flex items-center gap-2.5">
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#edf5ff,#dce8fa)]"><AnimatedProfileIcon className="h-7 w-7" animate={!reducedMotion} /></span>
      <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-story-navy">{review.name}</p>{review.company && <p className="mt-0.5 truncate text-[11px] text-muted">{review.company}</p>}</div>
      <Stars rating={review.rating} />
    </div>
    <p className="relative z-10 mt-5 line-clamp-5 flex-1 text-xs leading-5 text-foreground/75">{review.content}</p>
    <span aria-hidden="true" className="pointer-events-none absolute -bottom-5 right-3 font-serif text-[6rem] font-bold leading-none text-slate-100">”</span>
    <time className="relative z-10 mt-3 text-[10px] text-muted" dateTime={new Date(review.submittedAt).toISOString()}>{new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(review.submittedAt))}</time>
  </article>;
}

export function ReviewSection({ reviews, compact = false }: { reviews: PublicReview[]; compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
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
      <div className="mt-5 flex justify-center">
        <button onClick={() => { setOpen(true); setSent(false); setError(""); }} className="rounded-full bg-story-royal px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700">Write a review</button>
      </div>
    </div>
    <div className="relative mt-8 rounded-[2rem] bg-[#eef4fb] p-4 sm:p-6 lg:p-8">
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 font-serif text-[8rem] font-bold leading-none text-white/80">“</span>
      {reviews.length ? compact ? (
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
          className={`relative ${reducedMotion ? "overflow-x-auto snap-x snap-mandatory" : "overflow-hidden"}`}
        >
          <div
            className={reducedMotion ? "flex w-max gap-3 pb-2 sm:gap-4" : "flex w-max"}
            style={!reducedMotion && reviews.length > 1 ? { animation: `public-review-loop ${Math.max(24, reviews.length * 5)}s linear infinite`, animationPlayState: paused ? "paused" : "running" } : undefined}
          >
            {[0, ...(reducedMotion || reviews.length < 2 ? [] : [1])].map((copy) => (
              <div key={copy} aria-hidden={copy === 1 || undefined} inert={copy === 1 || undefined} className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
                {reviews.map((review) => <div key={review.id} className="w-[min(78vw,15rem)] snap-start"><ReviewCard review={review} /></div>)}
              </div>
            ))}
          </div>
          {!reducedMotion && reviews.length > 1 && <style>{`@keyframes public-review-loop { to { transform: translateX(-50%); } }`}</style>}
        </div>
      ) : <div className="relative grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div> : <div className="relative rounded-2xl border border-dashed border-border-soft bg-white/70 p-8 text-center text-sm text-muted">Client feedback will appear here after it has been reviewed.</div>}
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
