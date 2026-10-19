"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, Bookmark, Briefcase, Calendar, Camera, Check, CheckCircle2, Clock, Flame, Footprints, Heart, Images, MapPin,
  Megaphone, MessageCircle, Navigation, Phone, Search, Send, Sparkles, Star, Stethoscope, Truck, UserPlus, Video, Wrench,
} from "lucide-react";
import { ChatThread, type ChatLine } from "@/components/sections/home/showcase/BusinessTours";
import { Card, CountUp, EASE, GREEN, Kpi, Line, Pill, ROYAL, Spinner, fmt, useLive, useSteps } from "@/components/sections/home/showcase/kit";

/*
 * Screens for the hero devices. Every screen shows a different kind of business, so the five services read as
 * real, varied client work: desktop pages are laid out at 540px wide, tablet pages at 400px, phone pages at 200px.
 */

const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };
const stag = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

/* ================================ photos ================================ */

/** A photograph from /public/hero, cropped to fill its box, with a slow cinematic push-in. */
export function Photo({ src, className = "", zoom = true, position = "center" }: { src: string; className?: string; zoom?: boolean; position?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <motion.span className="absolute inset-0" initial={zoom ? { scale: 1.12 } : false} animate={{ scale: 1 }} transition={{ duration: 6, ease: "easeOut" }}>
        <Image src={`/hero/${src}`} alt="" fill sizes="600px" loading="eager" className="object-cover" style={{ objectPosition: position }} />
      </motion.span>
    </span>
  );
}

/* ============================== drawn scenes ============================== */

/* ================================ WEB ================================ */

/** Desktop: a resort's booking website. */
export function ResortSite() {
  const nights = useSteps(3, 900);
  return (
    <div className="h-full bg-white">
      <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-2">
        <span className="text-[12px] font-black tracking-tight text-[#0b1f4d]">Your<span className="text-[#16a34a]">Resort</span></span>
        <span className="flex gap-3 text-[10px] text-[#64748b]"><span className="font-semibold text-[#0b1f4d]">Stay</span><span>Dining</span><span>Spa</span><span>Gallery</span></span>
        <span className="rounded-full bg-[#0b1f4d] px-3 py-1 text-[9px] font-bold text-white">Book now</span>
      </div>
      <div className="relative h-[120px] overflow-hidden">
        <Photo src="resort.jpg" className="absolute inset-0 h-full w-full" />
        <span className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="absolute left-4 top-4 text-white [text-shadow:0_2px_10px_rgba(11,31,77,0.5)]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">Kerala · India</p>
          <p className="text-[20px] font-bold leading-tight">Your private escape<br />in the palms.</p>
        </motion.div>
      </div>
      {/* booking bar */}
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: EASE }} className="relative z-10 mx-4 -mt-5 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 rounded-xl border border-[#eef2f7] bg-white p-2 shadow-[0_12px_24px_-14px_rgba(11,31,77,0.5)]">
        {[["Check-in", "Fri, 24 Oct"], ["Check-out", `Mon, ${24 + Math.max(1, nights)} Oct`], ["Guests", "2 adults"]].map(([k, v]) => (
          <span key={k} className="leading-tight"><span className="block text-[8px] text-[#94a3b8]">{k}</span><span className="text-[10px] font-semibold text-[#0b1f4d]">{v}</span></span>
        ))}
        <span className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[10px] font-bold text-white">Search</span>
      </motion.div>
      <motion.div className="grid grid-cols-3 gap-2 px-4 pt-3" variants={stag} initial="hidden" animate="show">
        {[["Pool Villa", "₹12,500", "resort-2.jpg"], ["Garden Suite", "₹8,400", "resort.jpg"], ["Fine dining", "Included", "dining.jpg"]].map(([n, p, img]) => (
          <motion.div key={n} variants={up} className="overflow-hidden rounded-lg border border-[#eef2f7]">
            <Photo src={img} className="h-10" zoom={false} />
            <div className="p-1.5"><p className="text-[9px] font-semibold">{n}</p><p className="text-[9px] text-[#64748b]"><b className="text-[#0b1f4d]">{p}</b> / night</p></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

const DOCTORS = [["Dr. Kavya R.", "Dentist", "#dbeafe"], ["Dr. Arjun M.", "Physician", "#dcfce7"], ["Dr. Nisha P.", "Dermatologist", "#fde68a"]];

/** Tablet: a clinic website with online appointments. */
export function ClinicSite() {
  const step = useSteps(4, 700);
  const doc = step >= 1 ? 0 : -1;
  const slot = step >= 2 ? 2 : -1;
  const booked = step >= 3;
  return (
    <div className="relative h-full bg-[#f8fafc]">
      <div className="flex items-center gap-2 bg-white px-3 py-2"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#0ea5e9] text-white"><Stethoscope className="h-3.5 w-3.5" /></span><span className="text-[12px] font-bold">Your Clinic</span><span className="ml-auto flex items-center gap-1 text-[9px] text-[#64748b]"><Phone className="h-3 w-3" />Emergency 24/7</span></div>
      <div className="px-3 pt-2">
        <div className="relative h-12 overflow-hidden rounded-xl"><Photo src="clinic.jpg" className="absolute inset-0" /><span className="absolute inset-0 bg-gradient-to-r from-[#0b1f4d]/80 to-transparent" /><p className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-white">Book an appointment</p></div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {DOCTORS.map(([n, sp, c], k) => (
            <motion.div key={n} animate={{ borderColor: k === doc ? "#0ea5e9" : "#eef2f7", y: k === doc ? -2 : 0 }} className="rounded-xl border-2 bg-white p-2 text-center">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold text-[#0b1f4d]" style={{ background: c }}>{n.split(" ")[1][0]}{n.split(" ")[2][0]}</span>
              <p className="mt-1 text-[9px] font-semibold">{n}</p><p className="text-[8px] text-[#64748b]">{sp}</p>
              <p className="flex items-center justify-center gap-0.5 text-[8px] text-[#64748b]"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />4.9</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-2.5 text-[10px] font-semibold">Today · available slots</p>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {["09:30", "10:15", "11:00", "12:30", "15:00", "16:15", "17:30", "18:00"].map((t, k) => (
            <motion.span key={t} animate={{ backgroundColor: k === slot ? "#0ea5e9" : "#ffffff", color: k === slot ? "#ffffff" : k === 5 ? "#cbd5e1" : "#0b1f4d" }} className="rounded-lg border border-[#eef2f7] py-1.5 text-center text-[10px] font-semibold">{t}</motion.span>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {booked && (
          <motion.div key="ok" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[#14532d] shadow-[0_8px_20px_-10px_rgba(22,163,74,0.5)]">
            <CheckCircle2 className="h-5 w-5 text-[#16a34a]" /><span className="text-[10px] leading-tight"><b className="block">Appointment confirmed</b>Dr. Kavya R. · Today, 11:00 AM</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Phone: a real-estate listings site on mobile. */
export function RealEstateMobile() {
  const saved = useSteps(2, 900) >= 2;
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-1.5 px-3 py-2"><span className="text-[12px] font-black text-[#0b1f4d]">your<span className="text-[#f97316]">homes</span></span><span className="ml-auto flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2 py-1 text-[8px] text-[#64748b]"><Search className="h-2.5 w-2.5" />Coimbatore</span></div>
      <div className="flex gap-1.5 px-3 pb-2">{["Buy", "Rent", "Plots"].map((t, k) => <span key={t} className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${k === 0 ? "bg-[#1f56d6] text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}>{t}</span>)}</div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-3 overflow-hidden rounded-xl border border-[#eef2f7]">
        <div className="relative h-[92px]">
          <Photo src="villa.jpg" className="absolute inset-0 h-full w-full" />
          <span className="absolute left-2 top-2 rounded bg-[#f97316] px-1.5 py-0.5 text-[8px] font-bold text-white">New launch</span>
          <motion.span animate={saved ? { scale: [1, 1.4, 1] } : undefined} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white"><Heart className={`h-3.5 w-3.5 ${saved ? "fill-[#ef4444] text-[#ef4444]" : "text-[#64748b]"}`} /></motion.span>
        </div>
        <div className="p-2">
          <p className="text-[13px] font-black text-[#0b1f4d]">₹78 L</p>
          <p className="text-[10px] font-semibold">3 BHK Villa · 1,850 sq.ft</p>
          <p className="flex items-center gap-0.5 text-[9px] text-[#64748b]"><MapPin className="h-2.5 w-2.5" />Saravanampatti, Coimbatore</p>
          <div className="mt-1.5 flex gap-1">{["3 Beds", "3 Baths", "Parking"].map((t) => <span key={t} className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[8px] text-[#475569]">{t}</span>)}</div>
        </div>
      </motion.div>
      <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl border border-[#eef2f7] p-1.5">
        <Photo src="villa-2.jpg" className="h-10 w-12 shrink-0 rounded-lg" zoom={false} />
        <span className="leading-tight"><span className="block text-[10px] font-black">₹52 L</span><span className="text-[9px] text-[#64748b]">2 BHK Apartment · RS Puram</span></span>
      </div>
      <div className="mx-3 mb-3 mt-auto rounded-xl bg-[#f97316] py-2 text-center text-[10px] font-bold text-white">Schedule a site visit</div>
    </div>
  );
}

/* ================================ APP ================================ */

/** Desktop: the analytics console behind an iOS and Android app. */
export function AppAnalytics() {
  const live = useLive(1240, 16, 900);
  return (
    <div className="flex h-full flex-col gap-2 bg-[#f8fafc] p-3">
      <div className="flex items-center justify-between"><p className="text-[12px] font-bold text-[#0b1f4d]">App analytics · Your fitness app</p><span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: GREEN }}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />{fmt(live)} users online</span></div>
      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Daily users" to={18420} />
        <Kpi label="Day-7 retention" to={46} format={(n) => `${Math.round(n)}%`} delay={0.25} />
        <Kpi label="Crash-free" to={99.8} format={(n) => `${n.toFixed(1)}%`} delay={0.35} tint={GREEN} />
        <Kpi label="App rating" to={4.8} format={(n) => `${n.toFixed(1)}★`} delay={0.45} />
      </div>
      <div className="grid flex-1 grid-cols-[1.6fr_1fr] gap-2">
        <Card className="flex flex-col p-2"><p className="text-[10px] font-semibold">Daily active users · 30 days</p><Line points={[30, 34, 33, 40, 44, 42, 50, 55, 53, 60, 66, 70, 74]} className="mt-1 flex-1" /></Card>
        <Card className="flex flex-col items-center justify-center gap-1 p-2">
          <p className="text-[10px] font-semibold">Platforms</p>
          <svg viewBox="0 0 42 42" className="h-16 w-16 -rotate-90" aria-hidden>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e6ebf3" strokeWidth="6" />
            <motion.circle cx="21" cy="21" r="15.9" fill="none" stroke={ROYAL} strokeWidth="6" strokeDasharray="56 44" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "56 44" }} transition={{ duration: 1.2, ease: EASE }} />
            <motion.circle cx="21" cy="21" r="15.9" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="44 56" strokeDashoffset="-56" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
          </svg>
          <p className="flex gap-2 text-[9px]"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: ROYAL }} />iOS 56%</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />Android 44%</span></p>
        </Card>
      </div>
    </div>
  );
}

const TABLES = [
  { n: 1, s: "free" }, { n: 2, s: "busy" }, { n: 3, s: "busy" }, { n: 4, s: "ready" },
  { n: 5, s: "free" }, { n: 6, s: "busy" }, { n: 7, s: "free" }, { n: 8, s: "busy" },
];
const TABLE_TONE: Record<string, string> = { free: "#e6f4ea", busy: "#fde7c7", ready: "#dbeafe" };

/** Tablet: a restaurant's point-of-sale app — table map and the order being taken. */
export function RestaurantPos() {
  const items = useSteps(3, 650);
  const lines = [["Paneer tikka", 280], ["Veg biryani", 240], ["Fresh lime soda × 2", 160]] as const;
  const total = lines.slice(0, items).reduce((a, [, p]) => a + p, 0);
  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] bg-[#f8fafc]">
      <div className="p-3">
        <p className="flex items-center justify-between text-[12px] font-bold">Floor · Main hall<span className="flex gap-1.5 text-[8px] font-normal text-[#64748b]"><span>● Free</span><span className="text-[#d97706]">● Busy</span></span></p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {TABLES.map((t) => (
            <motion.span key={t.n} animate={{ backgroundColor: t.n === 5 ? "#1f56d6" : TABLE_TONE[t.s], color: t.n === 5 ? "#ffffff" : "#0b1f4d" }} className="grid aspect-square place-items-center rounded-xl text-[11px] font-bold">
              <span className="text-center leading-tight">T{t.n}<span className="block text-[7px] font-medium opacity-70">{t.n === 5 ? "ordering" : t.s}</span></span>
            </motion.span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">{["Starters", "Mains", "Drinks"].map((c, k) => <span key={c} className={`rounded-lg py-1.5 text-center text-[9px] font-semibold ${k === 1 ? "bg-[#1f56d6] text-white" : "bg-white text-[#475569] shadow-[inset_0_0_0_1px_#e6ebf3]"}`}>{c}</span>)}</div>
      </div>
      <div className="flex flex-col border-l border-[#eef2f7] bg-white p-3">
        <p className="text-[11px] font-bold">Order · Table 5</p>
        <div className="mt-2 flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {lines.slice(0, items).map(([n, p]) => (
              <motion.div key={n} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-[9px]"><Photo src={n.startsWith("Fresh") ? "coffee.jpg" : n.startsWith("Veg") ? "food.jpg" : "dining.jpg"} className="h-6 w-6 shrink-0 rounded-md" zoom={false} /><span className="flex-1">{n}</span><span className="font-semibold">₹{p}</span></motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-auto flex justify-between border-t border-[#eef2f7] pt-2 text-[11px] font-bold"><span>Total</span><span>₹{total}</span></div>
        <motion.span animate={{ backgroundColor: items >= 3 ? GREEN : ROYAL }} className="mt-2 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-bold text-white">{items >= 3 ? <><Check className="h-3 w-3" strokeWidth={3} />Sent to kitchen</> : "Add items"}</motion.span>
      </div>
    </div>
  );
}

function Ring({ r, color, pct, delay }: { r: number; color: string; pct: number; delay: number }) {
  return (
    <>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="9" />
      <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: pct }} transition={{ delay, duration: 1.4, ease: EASE }} />
    </>
  );
}

/** Phone: a fitness app — activity rings, steps and live heart rate. */
export function FitnessApp() {
  const bpm = useLive(118, 4, 700);
  return (
    <div className="flex h-full flex-col bg-white px-3 pt-2 text-[#0b1f4d]">
      <p className="text-[9px] text-[#94a3b8]">Thursday</p>
      <p className="text-[14px] font-bold">Today&apos;s activity</p>
      <div className="relative mx-auto mt-2 h-[110px] w-[110px]">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <Ring r={42} color="#fb7185" pct={0.82} delay={0.2} />
          <Ring r={31} color="#65a30d" pct={0.64} delay={0.4} />
          <Ring r={20} color="#0891b2" pct={0.9} delay={0.6} />
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        {[{ I: Flame, v: 486, u: "kcal", c: "#fb7185" }, { I: Footprints, v: 8240, u: "steps", c: "#65a30d" }, { I: Clock, v: 42, u: "min", c: "#0891b2" }].map(({ I, v, u, c }) => (
          <span key={u} className="rounded-xl bg-[#f8fafc] py-1.5 shadow-[inset_0_0_0_1px_#eef2f7]"><I className="mx-auto h-3.5 w-3.5" style={{ color: c }} /><span className="block text-[11px] font-bold"><CountUp to={v} /></span><span className="text-[8px] text-[#94a3b8]">{u}</span></span>
        ))}
      </div>
      <div className="mt-2 rounded-xl bg-[#f8fafc] p-2 shadow-[inset_0_0_0_1px_#eef2f7]">
        <p className="flex items-center justify-between text-[9px] text-[#64748b]"><span className="flex items-center gap-1"><Activity className="h-3 w-3 text-[#fb7185]" />Heart rate</span><span className="text-[12px] font-bold tabular-nums text-[#0b1f4d]">{bpm} <span className="text-[8px] font-normal text-[#94a3b8]">bpm</span></span></p>
        <svg viewBox="0 0 100 20" className="mt-1 h-5 w-full" aria-hidden>
          <motion.path d="M0 12 L18 12 L22 4 L27 18 L31 12 L50 12 L54 6 L58 16 L62 12 L100 12" fill="none" stroke="#fb7185" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
        </svg>
      </div>
      <div className="relative mb-3 mt-auto h-14 overflow-hidden rounded-xl">
        <Photo src="fitness.jpg" className="absolute inset-0" position="center 30%" />
        <span className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 leading-tight text-white"><span className="block text-[8px] text-white/70">Next up</span><span className="text-[11px] font-bold">Core · 20 min</span></span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#a3e635] px-2.5 py-1 text-[9px] font-bold text-[#0b1220]">Start</span>
      </div>
    </div>
  );
}

/* ================================= AI ================================= */

const FIELDS = [["Vendor", "Your supplier"], ["Invoice no.", "INV-2291"], ["Date", "16 Oct 2026"], ["GSTIN", "33ABCDE1234F1Z5"], ["Total", "₹48,260"]];

/** Tablet: an AI agent reading a supplier invoice and pulling out the fields. */
export function InvoiceExtract() {
  const n = useSteps(FIELDS.length + 1, 550);
  return (
    <div className="grid h-full grid-cols-[1fr_1.1fr] gap-3 bg-[#f8fafc] p-3">
      {/* the scanned document, with the agent's scan line */}
      <div className="relative overflow-hidden rounded-lg border border-[#e6ebf3] bg-white p-3 shadow-sm">
        <p className="text-[11px] font-black text-[#0b1f4d]">TAX INVOICE</p>
        <p className="text-[7px] text-[#94a3b8]">Supplier · Coimbatore</p>
        {[70, 55, 80, 60, 75, 50, 65].map((w, k) => <span key={k} className="mt-1.5 block h-1.5 rounded bg-[#eef2f7]" style={{ width: `${w}%` }} />)}
        <div className="mt-2 flex justify-between border-t border-[#eef2f7] pt-1.5 text-[9px] font-bold"><span>Total</span><span>₹48,260</span></div>
        {n <= FIELDS.length && <motion.span aria-hidden className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-[#1f56d6]/20 to-transparent" animate={{ top: ["0%", "90%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />}
      </div>
      <div className="flex flex-col">
        <p className="flex items-center gap-1 text-[11px] font-bold"><Sparkles className="h-3.5 w-3.5" style={{ color: ROYAL }} />Extracted by AI</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {FIELDS.map(([k, v], i) => (
            <div key={k} className="rounded-lg border border-[#e6ebf3] bg-white px-2 py-1">
              <p className="text-[8px] text-[#94a3b8]">{k}</p>
              {i < n ? <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-semibold">{v}</motion.p> : <span className="mt-0.5 block h-2 w-2/3 animate-pulse rounded bg-[#eef2f7]" />}
            </div>
          ))}
        </div>
        <motion.span animate={{ backgroundColor: n > FIELDS.length ? GREEN : ROYAL }} className="mt-auto flex items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-bold text-white">
          {n > FIELDS.length ? <><Check className="h-3 w-3" strokeWidth={3} />Posted to accounts</> : <><Spinner className="h-3 w-3" />Reading…</>}
        </motion.span>
      </div>
    </div>
  );
}

const CLINIC_CHAT: ChatLine[] = [
  { me: true, t: "Can I see a dentist tomorrow morning?" },
  { me: false, t: "Yes — Dr. Kavya has 10:15 and 11:00 free. Which suits you?", src: "Clinic calendar" },
  { me: true, t: "11:00 please" },
  { me: false, t: "Booked ✓ Fri, 11:00 AM. I'll send a reminder an hour before.", src: "Appointments" },
];

/** Phone: a clinic's AI assistant booking an appointment on WhatsApp-style chat. */
export function ClinicAssistant() {
  return (
    <div className="flex h-full flex-col bg-[#f0fdf4]">
      <ChatThread messages={CLINIC_CHAT} title="Clinic assistant" />
      <div className="mx-3 mb-3 flex items-center gap-1.5 rounded-full border border-[#e6ebf3] bg-white px-3 py-1.5 text-[10px] text-[#94a3b8]">Message…<Send className="ml-auto h-3.5 w-3.5 text-[#16a34a]" /></div>
    </div>
  );
}

/* ============================== MARKETING ============================== */

const POSTS: { d: string; c: string; img: string; I: typeof Video; t: string }[] = [
  { d: "Mon", img: "villa.jpg", c: "#fce7f3", I: Video, t: "Reel · site tour" },
  { d: "Tue", img: "checkout.jpg", c: "#dbeafe", I: Briefcase, t: "Client story" },
  { d: "Wed", img: "food.jpg", c: "#fef3c7", I: Megaphone, t: "Offer post" },
  { d: "Thu", img: "resort-2.jpg", c: "#dcfce7", I: Images, t: "Carousel" },
  { d: "Fri", img: "cafe.jpg", c: "#ede9fe", I: UserPlus, t: "Hiring" },
];

/** Tablet: the social media content calendar for the week. */
export function ContentCalendar() {
  const posted = useSteps(POSTS.length, 600);
  return (
    <div className="flex h-full flex-col bg-[#f8fafc] p-3">
      <p className="flex items-center justify-between text-[12px] font-bold">Content calendar<span className="flex items-center gap-1 text-[9px] font-normal text-[#64748b]"><Calendar className="h-3 w-3" />20–24 Oct</span></p>
      <div className="mt-2 grid flex-1 grid-cols-5 gap-1.5">
        {POSTS.map((p, k) => {
          const done = k < posted;
          return (
            <div key={p.d} className="flex flex-col gap-1">
              <span className="text-center text-[9px] font-semibold text-[#64748b]">{p.d}</span>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.08 }} className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e6ebf3] bg-white">
                <span className="relative flex-1"><Photo src={p.img} className="absolute inset-0" zoom={false} /><span className="absolute left-1 top-1 grid h-4 w-4 place-items-center rounded bg-white/90"><p.I className="h-2.5 w-2.5 text-[#0b1f4d]" /></span></span>
                <span className="p-1 text-[7.5px] font-semibold leading-tight">{p.t}</span>
                <span className={`mx-1 mb-1 rounded px-1 py-0.5 text-center text-[7px] font-bold ${done ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#f1f5f9] text-[#64748b]"}`}>{done ? "Published" : "Scheduled"}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[["Reach", 48200], ["Engagement", 6.8], ["New followers", 1240]].map(([k, v]) => (
          <span key={k as string} className="rounded-lg bg-white px-2 py-1 shadow-[inset_0_0_0_1px_#e6ebf3]"><span className="block text-[8px] text-[#94a3b8]">{k as string}</span><span className="text-[11px] font-bold"><CountUp to={v as number} format={(n) => (k === "Engagement" ? `${n.toFixed(1)}%` : fmt(n))} /></span></span>
        ))}
      </div>
    </div>
  );
}

/** Phone: a real-estate developer's sponsored post in the feed. */
export function PropertyAd() {
  const step = useSteps(4, 700);
  const liked = step >= 2;
  const likes = useLive(1860, 7, 800);
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-1.5 px-3 py-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f97316] text-[9px] font-black text-white">N</span><span className="text-[10px] font-bold">yourhomes</span><span className="text-[9px] text-[#64748b]">Sponsored</span></div>
      <div className="relative h-[130px]">
        <Photo src="villa-2.jpg" className="absolute inset-0 h-full w-full" />
        <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 leading-tight shadow"><span className="block text-[8px] text-[#64748b]">3 BHK Villas from</span><span className="text-[12px] font-black text-[#0b1f4d]">₹78 L</span></motion.span>
        <AnimatePresence>{step === 2 && <motion.span key="h" className="absolute inset-0 grid place-items-center" initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.8 }}><Heart className="h-12 w-12 fill-white text-white" /></motion.span>}</AnimatePresence>
      </div>
      <motion.div animate={{ backgroundColor: step >= 4 ? "#0b1f4d" : "#f97316" }} className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-white">Book a site visit<span>›</span></motion.div>
      <div className="flex items-center gap-3 px-3 pt-2 text-[#0b1f4d]"><Heart className={`h-4 w-4 ${liked ? "fill-[#ef4444] text-[#ef4444]" : ""}`} /><MessageCircle className="h-4 w-4" /><Send className="h-4 w-4" /><Bookmark className="ml-auto h-4 w-4" /></div>
      <p className="px-3 pt-1 text-[10px] font-bold tabular-nums">{fmt(likes + (liked ? 1 : 0))} likes</p>
      <p className="px-3 text-[10px] leading-4 text-[#334155]"><b>yourhomes</b> Gated villas near the IT corridor. Site visits open this weekend.</p>
    </div>
  );
}

/* =============================== SOFTWARE =============================== */

/** Cities placed roughly where they sit on a map of south India (viewBox 360 × 220). */
const CITY: Record<string, [number, number]> = {
  Bengaluru: [168, 44], Chennai: [298, 62], Coimbatore: [72, 152], Tiruppur: [104, 134], Erode: [134, 110], Madurai: [206, 182],
};
/** One route per shipment: from, to, a gentle road-like curve, colour, and whether the truck is still moving. */
const ROUTES: { from: string; to: string; via: [number, number]; color: string; moving: boolean; dur: number }[] = [
  { from: "Coimbatore", to: "Chennai", via: [190, 150], color: ROYAL, moving: true, dur: 9 },
  { from: "Tiruppur", to: "Bengaluru", via: [112, 72], color: "#d97706", moving: true, dur: 7 },
  { from: "Erode", to: "Madurai", via: [196, 118], color: GREEN, moving: false, dur: 0 },
];
const routePath = (r: (typeof ROUTES)[number]) => `M${CITY[r.from].join(" ")} Q${r.via.join(" ")} ${CITY[r.to].join(" ")}`;

/** The live route map: each truck drives its route while the distance covered fills in behind it. */
function FleetMap() {
  return (
    <svg viewBox="0 0 360 220" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs><pattern id="fleet-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e3eaf6" /></pattern></defs>
      <rect width="360" height="220" fill="url(#fleet-grid)" />
      {/* a faint outline of the region */}
      <path d="M24 18 L336 18 L330 96 L262 150 L214 210 L150 212 L58 196 L22 128 Z" fill="#ffffff" fillOpacity="0.7" stroke="#d5e0f2" strokeWidth="1.5" strokeLinejoin="round" />
      {ROUTES.map((r) => {
        const d = routePath(r);
        return (
          <g key={r.from}>
            {/* the road */}
            <path d={d} fill="none" stroke="#dbe4f3" strokeWidth="6" strokeLinecap="round" />
            {r.moving ? (
              <>
                {/* distance covered, in step with the truck */}
                <path d={d} pathLength={1} fill="none" stroke={r.color} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 1">
                  <animate attributeName="stroke-dashoffset" values="1;0" dur={`${r.dur}s`} repeatCount="indefinite" />
                </path>
                <g>
                  <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" path={d} />
                  <circle r="10" fill={r.color} opacity="0.18"><animate attributeName="r" values="7;12;7" dur="1.4s" repeatCount="indefinite" /></circle>
                  <circle r="5.5" fill="#fff" stroke={r.color} strokeWidth="3" />
                </g>
              </>
            ) : (
              <path d={d} fill="none" stroke={r.color} strokeWidth="3" strokeLinecap="round" />
            )}
          </g>
        );
      })}
      {/* city points */}
      {Object.entries(CITY).map(([name, [x, y]]) => {
        const dest = ROUTES.some((r) => r.to === name);
        return (
          <g key={name}>
            {dest && <circle cx={x} cy={y} r="6" fill="#e11d48" opacity="0.2"><animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" /></circle>}
            <circle cx={x} cy={y} r="4" fill={dest ? "#e11d48" : "#0b1f4d"} stroke="#fff" strokeWidth="1.5" />
            <text x={x + (x > 260 ? -7 : 7)} y={y - 7} textAnchor={x > 260 ? "end" : "start"} fontSize="9" fontWeight="600" fill="#334155" fontFamily="system-ui, sans-serif">{name}</text>
          </g>
        );
      })}
    </svg>
  );
}

const SHIPMENTS: [string, string, string, string][] = [
  ["TN-38-4521", "Coimbatore → Chennai", "On route", ROYAL],
  ["TN-66-1180", "Tiruppur → Bengaluru", "Loading", "#d97706"],
  ["TN-37-9034", "Erode → Madurai", "Delivered", GREEN],
];

/** Desktop: a fleet and logistics dashboard with trucks moving on the map. */
export function FleetDashboard() {
  return (
    <div className="grid h-full grid-cols-[1.35fr_1fr] gap-2 bg-[#f8fafc] p-3">
      <div className="relative overflow-hidden rounded-lg border border-[#e6ebf3] bg-[#f4f7fc]">
        <FleetMap />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-semibold shadow"><Navigation className="h-3 w-3" style={{ color: ROYAL }} />Live fleet · 24 trucks</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2"><Kpi label="On time" to={96} format={(n) => `${Math.round(n)}%`} tint={GREEN} /><Kpi label="Deliveries today" to={142} delay={0.25} /></div>
        <Card className="flex-1 overflow-hidden">
          <p className="border-b border-[#eef2f7] px-2 py-1.5 text-[10px] font-semibold">Shipments</p>
          {SHIPMENTS.map(([id, r, st, c], k) => (
            <motion.div key={id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.12 }} className="flex items-center gap-2 border-b border-[#eef2f7] px-2 py-1.5 last:border-0">
              <Truck className="h-3.5 w-3.5 shrink-0" style={{ color: c }} />
              <span className="min-w-0 flex-1 leading-tight"><span className="block text-[9px] font-semibold">{id}</span><span className="block truncate text-[8px] text-[#64748b]">{r}</span></span>
              <Pill color={c}>{st}</Pill>
            </motion.div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const JOBS = [
  { t: "AC servicing", where: "RS Puram", time: "10:30" },
  { t: "Solar panel inspection", where: "Peelamedu", time: "13:00" },
  { t: "Water purifier install", where: "Saibaba Colony", time: "16:30" },
];

/** Phone: the field team's app, synced with the office software. */
export function FieldServiceApp() {
  const step = useSteps(5, 800);
  const done = Math.min(2, step);
  const syncing = step === 3;
  const synced = step >= 4;
  return (
    <div className="flex h-full flex-col">
      <div className="bg-[#eef3ff] px-3 pb-3 pt-2 text-[#0b1f4d]">
        <p className="text-[9px] text-[#64748b]">Thursday · 3 jobs</p>
        <p className="text-[14px] font-bold">Good morning, Arun</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><motion.div className="h-full rounded-full bg-[#22d3ee]" animate={{ width: `${(done / 3) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} /></div>
        <p className="mt-1 text-[9px] text-[#64748b]">{done} of 3 completed</p>
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
        {syncing ? <><Spinner className="h-3 w-3" />Syncing…</> : synced ? <><Check className="h-3.5 w-3.5" strokeWidth={3} />Synced to office</> : "Sync to office"}
      </motion.div>
    </div>
  );
}

