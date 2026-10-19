"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Camera, Check, Download, Heart, MapPin, MessageCircle, Navigation, RefreshCw, Send, ShoppingBag, Star, Wrench, Zap } from "lucide-react";
import { ChatThread } from "./BusinessTours";
import { Bars, CountUp, EASE, GREEN, ROYAL, Spinner, fmt, useLive, useSteps } from "./kit";
import { Headphones, ProductThumb, STUDIO, SmartWatch } from "./products";

/* Pages for the hero devices that the product tours don't already cover. Phone pages are laid out at 200px wide,
   tablet pages at 400px; the hero scales them to its screens. */

/** AI: the customer chatting with the store's assistant on their phone. */
export function PhoneAiChat() {
  return (
    <div className="flex h-full flex-col bg-[#f8fafc]">
      <ChatThread />
      <div className="mx-3 mb-3 flex items-center gap-1.5 rounded-full border border-[#e6ebf3] bg-white px-3 py-1.5 text-[10px] text-[#94a3b8]">Message…<Send className="ml-auto h-3.5 w-3.5" style={{ color: ROYAL }} /></div>
    </div>
  );
}

/** Marketing: the sponsored post as it appears in the customer's feed. */
export function PhoneAdFeed() {
  const step = useSteps(4, 700);
  const liked = step >= 2;
  const likes = useLive(2140, 9, 700);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2"><span className="text-[14px] font-black italic text-[#0b1f4d]">Feed</span><span className="flex gap-2.5 text-[#0b1f4d]"><Heart className="h-4 w-4" /><MessageCircle className="h-4 w-4" /></span></div>
      <div className="flex gap-2 overflow-hidden px-3 pb-2">
        {["You", "Deals", "Audio", "New", "Tech"].map((n, k) => (
          <span key={n} className="flex flex-col items-center gap-0.5">
            <span className="rounded-full p-[2px]" style={{ background: k === 0 ? "#cbd5e1" : "#e11d48" }}><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-white" style={{ background: STUDIO }}>{k % 2 ? <SmartWatch className="h-7 w-auto" /> : <Headphones finish={k ? "sky" : "midnight"} className="h-6 w-auto" />}</span></span>
            <span className="text-[8px] text-[#64748b]">{n}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t border-[#eef2f7] px-3 py-1.5"><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: ROYAL }}><Zap className="h-3 w-3" /></span><span className="text-[10px] font-bold">yourbrand</span><span className="text-[9px] text-[#64748b]">Sponsored</span></div>
      <div className="relative h-[150px] overflow-hidden" style={{ background: STUDIO }}>
        <motion.span className="absolute inset-0 grid place-items-center" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}><Headphones finish="sky" className="h-[82%] w-auto" /></motion.span>
        <span className="absolute left-2 top-2 rounded bg-[#0b1f4d] px-1.5 py-0.5 text-[9px] font-bold text-white">20% off this week</span>
        <AnimatePresence>{step === 2 && <motion.span key="pop" className="absolute inset-0 grid place-items-center" initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.8 }}><Heart className="h-14 w-14 fill-white text-white" /></motion.span>}</AnimatePresence>
      </div>
      <motion.div animate={{ backgroundColor: step === 4 ? "#0b1f4d" : ROYAL }} className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-white">Shop now<span>›</span></motion.div>
      <div className="flex items-center gap-3 px-3 pt-2 text-[#0b1f4d]">
        <motion.span animate={liked ? { scale: [1, 1.35, 1] } : undefined}><Heart className={`h-4 w-4 ${liked ? "fill-[#ef4444] text-[#ef4444]" : ""}`} /></motion.span>
        <MessageCircle className="h-4 w-4" /><Send className="h-4 w-4" /><Bookmark className="ml-auto h-4 w-4" />
      </div>
      <p className="px-3 pt-1 text-[10px] font-bold tabular-nums">{fmt(likes + (liked ? 1 : 0))} likes</p>
      <p className="px-3 text-[10px] leading-4 text-[#334155]"><b>yourbrand</b> Studio sound, 40h battery. Free delivery across India.</p>
    </div>
  );
}

const JOBS = [
  { t: "Speaker installation", where: "RS Puram", time: "10:30" },
  { t: "Headphone repair pickup", where: "Gandhipuram", time: "13:00" },
  { t: "Smart watch setup", where: "Saibaba Colony", time: "16:30" },
];

/** Custom software: the field team's mobile app, synced with the office system. */
export function PhoneFieldApp() {
  const step = useSteps(5, 800);
  const done = Math.min(2, step);
  const syncing = step === 3;
  const synced = step >= 4;
  return (
    <div className="flex h-full flex-col">
      <div className="bg-[#0b1f4d] px-3 pb-3 pt-2 text-white">
        <p className="text-[9px] text-white/70">Thursday · 3 jobs</p>
        <p className="text-[14px] font-bold">Good morning, Arun</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"><motion.div className="h-full rounded-full bg-[#22d3ee]" animate={{ width: `${(done / 3) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} /></div>
        <p className="mt-1 text-[9px] text-white/70">{done} of 3 completed</p>
      </div>
      <div className="relative mx-3 mt-2 h-[70px] overflow-hidden rounded-xl bg-[#eef3ff]">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#dbe4f3 1px, transparent 1px), linear-gradient(90deg, #dbe4f3 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <MapPin className="absolute left-[30%] top-[25%] h-5 w-5 fill-[#1f56d6] text-white" />
        <MapPin className="absolute left-[62%] top-[40%] h-5 w-5 fill-[#e11d48] text-white" />
        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[8px] font-semibold shadow"><Navigation className="h-2.5 w-2.5" style={{ color: ROYAL }} />Next stop · 12 min</span>
      </div>
      <div className="flex flex-col gap-1.5 px-3 pt-2">
        {JOBS.map((j, k) => {
          const ok = k < done;
          return (
            <div key={j.t} className={`flex items-center gap-2 rounded-xl border p-2 ${k === done && !synced ? "border-[#1f56d6]" : "border-[#eef2f7]"}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#eef3ff]"><Wrench className="h-3.5 w-3.5" style={{ color: ROYAL }} /></span>
              <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[10px] font-semibold">{j.t}</span><span className="text-[8px] text-[#64748b]">{j.where} · {j.time}</span></span>
              {ok ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-4 w-4 place-items-center rounded-full text-white" style={{ background: GREEN }}><Check className="h-2.5 w-2.5" strokeWidth={3} /></motion.span> : <span className="h-4 w-4 rounded-full border-2 border-[#e6ebf3]" />}
            </div>
          );
        })}
      </div>
      <div className="mx-3 mt-2 flex items-center gap-1.5 rounded-xl bg-[#f8fafc] px-2 py-1.5 text-[9px] text-[#64748b]"><Camera className="h-3.5 w-3.5" style={{ color: ROYAL }} />2 photos · customer signature saved</div>
      <motion.div animate={{ backgroundColor: synced ? GREEN : ROYAL }} className="mx-3 mb-4 mt-auto flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-bold text-white">
        {syncing ? <><Spinner className="h-3 w-3" />Syncing…</> : synced ? <><Check className="h-3.5 w-3.5" strokeWidth={3} />Synced to office</> : <><RefreshCw className="h-3.5 w-3.5" />Sync to office</>}
      </motion.div>
    </div>
  );
}

/** App development: the app's store listing on a tablet, installing. */
export function TabletAppStore() {
  const step = useSteps(4, 650);
  const installing = step >= 1 && step < 3;
  const installed = step >= 3;
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-[1.1rem] bg-[#0b1f4d] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_8px_16px_-8px_rgba(11,31,77,0.7)]"><ShoppingBag className="h-7 w-7" strokeWidth={1.8} /></span>
        <span className="flex-1 leading-tight">
          <span className="block text-[15px] font-bold">Your Store</span>
          <span className="block text-[10px] text-[#64748b]">Shopping · Audio & wearables</span>
          <span className="mt-0.5 flex items-center gap-0.5 text-[10px]">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />)}<span className="ml-1 text-[#64748b]">4.8 · 12k ratings</span></span>
        </span>
        <motion.span layout className="grid h-8 min-w-20 place-items-center rounded-full px-4 text-[11px] font-bold text-white" animate={{ backgroundColor: installed ? GREEN : ROYAL }}>
          {installing ? (
            <svg viewBox="0 0 20 20" className="h-5 w-5 -rotate-90"><circle cx="10" cy="10" r="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" /><motion.circle cx="10" cy="10" r="7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} /></svg>
          ) : installed ? "Open" : <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />Get</span>}
        </motion.span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-y border-[#eef2f7] py-2 text-center">
        {[["4.8", "Rating"], ["#3", "Shopping"], ["50k+", "Downloads"]].map(([v, l]) => <span key={l}><span className="block text-[13px] font-bold">{v}</span><span className="text-[9px] text-[#64748b]">{l}</span></span>)}
      </div>
      {/* screenshots */}
      <div className="flex flex-1 gap-2">
        {(["headphones", "watch", "speaker"] as const).map((k, i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: EASE }} className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#e6ebf3]">
            <span className="px-2 pt-1.5 text-[8px] font-bold" style={{ color: ROYAL }}>{["Shop", "Track", "Deals"][i]}</span>
            <ProductThumb kind={k} finish={(["midnight", "sky", "sand"] as const)[i]} className="mx-1.5 mt-1 flex-1 rounded-lg" fit="h-[70%]" />
            <span className="m-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? ROYAL : "#e6ebf3" }} />
          </motion.div>
        ))}
      </div>
      <div className="flex items-end gap-3">
        <span className="leading-tight"><span className="block text-[9px] text-[#64748b]">Downloads this week</span><span className="text-[14px] font-bold">+<CountUp to={2340} /></span></span>
        <Bars values={[30, 42, 38, 55, 64, 78, 92]} className="h-8 flex-1" />
      </div>
    </div>
  );
}
