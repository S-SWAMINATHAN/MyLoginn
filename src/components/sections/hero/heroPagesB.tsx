"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bike, Calendar, Car, Check, ChevronRight, Clock, Coffee, CreditCard, Fuel, Gauge, Heart, MapPin, Minus, Plane, Plus,
  Search, Send, ShoppingBag, Sparkles, Star, Users,
} from "lucide-react";
import { ChatThread, type ChatLine } from "@/components/sections/home/showcase/BusinessTours";
import { Card, CountUp, EASE, GREEN, Kpi, Line, ROYAL, Spinner, fmt, useLive, useSteps } from "@/components/sections/home/showcase/kit";
import { Photo } from "@/components/sections/hero/heroPages";

/* Second sample set for the hero devices: a café, a car showroom, a spa, a food-delivery app, a payments
   terminal, a hotel concierge, a travel ad and more — so each service shows varied, real client work. */

const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };
const stag = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };

/* ================================ WEB ================================ */

const MENU: [string, string, string][] = [["Cappuccino", "₹220", "coffee.jpg"], ["Breakfast plate", "₹380", "food.jpg"], ["Chef's special", "₹460", "dining.jpg"]];

/** Desktop: a café's online ordering website. */
export function CafeSite() {
  const added = useSteps(3, 900);
  return (
    <div className="h-full bg-[#faf7f2]">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="flex items-center gap-1.5 text-[12px] font-black text-[#3b2417]"><Coffee className="h-3.5 w-3.5" />Your Café</span>
        <span className="flex gap-3 text-[10px] text-[#7c6a5c]"><span className="font-semibold text-[#3b2417]">Menu</span><span>Order online</span><span>Locations</span></span>
        <span className="relative flex items-center gap-1 rounded-full bg-[#3b2417] px-3 py-1 text-[9px] font-bold text-white"><ShoppingBag className="h-3 w-3" />Cart
          <AnimatePresence>{added > 0 && <motion.span key={added} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#f97316] text-[8px]">{added}</motion.span>}</AnimatePresence>
        </span>
      </div>
      <div className="relative mx-4 h-[96px] overflow-hidden rounded-xl">
        <Photo src="cafe.jpg" className="absolute inset-0" />
        <span className="absolute inset-0 bg-gradient-to-r from-[#1c120c]/80 via-[#1c120c]/30 to-transparent" />
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#fcd34d]">Freshly roasted</p>
          <p className="text-[18px] font-bold leading-tight">Coffee, delivered warm.</p>
        </motion.div>
      </div>
      <motion.div className="grid grid-cols-3 gap-2 px-4 pt-3" variants={stag} initial="hidden" animate="show">
        {MENU.map(([n, p, img], k) => (
          <motion.div key={n} variants={up} className="overflow-hidden rounded-xl bg-white shadow-[0_6px_16px_-10px_rgba(59,36,23,0.5)]">
            <Photo src={img} className="h-14" zoom={false} />
            <div className="flex items-center justify-between p-1.5">
              <span className="leading-tight"><span className="block text-[9px] font-semibold text-[#3b2417]">{n}</span><span className="text-[9px] text-[#7c6a5c]">{p}</span></span>
              <motion.span animate={{ backgroundColor: k < added ? "#16a34a" : "#3b2417" }} className="grid h-5 w-5 place-items-center rounded-full text-white">{k < added ? <Check className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" />}</motion.span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/** Tablet: a car showroom's website — the model, its specs and an EMI calculator. */
export function CarShowroom() {
  const months = useSteps(4, 600);
  const emi = 48900 - months * 3100;
  return (
    <div className="flex h-full flex-col bg-white text-[#0b1f4d]">
      <div className="flex items-center justify-between px-3 py-2"><span className="flex items-center gap-1 text-[12px] font-black tracking-wide"><Car className="h-4 w-4 text-[#ef4444]" />YOUR MOTORS</span><span className="text-[9px] text-[#64748b]">Models · Offers · Test drive</span></div>
      <div className="relative h-[86px]">
        <Photo src="car.jpg" className="absolute inset-0" position="center 60%" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute bottom-1.5 left-3 text-[14px] font-bold text-white">GT Sport Sedan</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-3 pt-2">
        {[{ I: Gauge, k: "0–100", v: "4.2 s" }, { I: Fuel, k: "Mileage", v: "14 km/l" }, { I: Users, k: "Seats", v: "5" }].map(({ I, k, v }) => (
          <span key={k} className="rounded-lg bg-[#f8fafc] px-2 py-1.5 shadow-[inset_0_0_0_1px_#eef2f7]"><I className="h-3 w-3 text-[#ef4444]" /><span className="mt-0.5 block text-[8px] text-[#94a3b8]">{k}</span><span className="text-[11px] font-bold">{v}</span></span>
        ))}
      </div>
      <div className="mx-3 mt-2 rounded-xl bg-[#f8fafc] p-2 shadow-[inset_0_0_0_1px_#eef2f7]">
        <p className="flex items-center justify-between text-[9px] text-[#64748b]">EMI calculator<span className="font-semibold text-[#0b1f4d]">{36 + months * 12} months</span></p>
        <div className="relative mt-1.5 h-1 rounded-full bg-[#e6ebf3]"><motion.div className="absolute inset-y-0 left-0 rounded-full bg-[#ef4444]" animate={{ width: `${20 + months * 18}%` }} transition={{ duration: 0.5, ease: EASE }} /></div>
        <p className="mt-1.5 text-[15px] font-black tabular-nums">₹{fmt(emi)}<span className="text-[9px] font-normal text-[#94a3b8]"> / month</span></p>
      </div>
      <div className="mx-3 mb-3 mt-auto rounded-lg bg-[#ef4444] py-1.5 text-center text-[10px] font-bold text-white">Book a test drive</div>
    </div>
  );
}

const SPA: [string, string, string][] = [["Swedish massage", "60 min", "₹2,400"], ["Aroma facial", "45 min", "₹1,800"], ["Couples retreat", "90 min", "₹5,200"]];

/** Phone: a spa's mobile booking page. */
export function SpaMobile() {
  const pick = useSteps(2, 900);
  return (
    <div className="flex h-full flex-col bg-[#fdf8f6]">
      <div className="relative h-[96px]">
        <Photo src="spa.jpg" className="absolute inset-0" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-2 left-3 text-white"><span className="block text-[13px] font-bold">Your Spa</span><span className="flex items-center gap-0.5 text-[9px]"><Star className="h-2.5 w-2.5 fill-[#fcd34d] text-[#fcd34d]" />4.9 · Anna Nagar</span></span>
      </div>
      <p className="px-3 pt-2 text-[11px] font-bold text-[#4a2a2a]">Treatments</p>
      <div className="flex flex-col gap-1.5 px-3 pt-1">
        {SPA.map(([n, t, p], k) => (
          <motion.div key={n} animate={{ borderColor: k === pick ? "#be185d" : "#f3e8e4", backgroundColor: k === pick ? "#fdf2f8" : "#ffffff" }} className="flex items-center gap-2 rounded-xl border p-2">
            <span className="min-w-0 flex-1 leading-tight"><span className="block text-[10px] font-semibold text-[#4a2a2a]">{n}</span><span className="flex items-center gap-0.5 text-[8px] text-[#9a7b74]"><Clock className="h-2.5 w-2.5" />{t}</span></span>
            <span className="text-[10px] font-bold text-[#4a2a2a]">{p}</span>
          </motion.div>
        ))}
      </div>
      <div className="mx-3 mb-3 mt-auto rounded-xl bg-[#be185d] py-2 text-center text-[10px] font-bold text-white">Book · Sat 4:00 PM</div>
    </div>
  );
}

/* ================================ APP ================================ */

/** Desktop: the restaurant partner dashboard behind a food-delivery app. */
export function DeliveryConsole() {
  const live = useLive(86, 3, 1000);
  return (
    <div className="flex h-full flex-col gap-2 bg-[#fff7ed] p-3">
      <div className="flex items-center justify-between"><p className="text-[12px] font-bold text-[#7c2d12]">Food delivery · Partner dashboard</p><span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: GREEN }}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />{live} live orders</span></div>
      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Orders today" to={1284} />
        <Kpi label="Revenue" to={312400} format={(n) => `₹${(n / 100000).toFixed(2)}L`} delay={0.25} />
        <Kpi label="Avg. delivery" to={24} format={(n) => `${Math.round(n)} min`} delay={0.35} />
        <Kpi label="Rating" to={4.6} format={(n) => `${n.toFixed(1)}★`} delay={0.45} tint={GREEN} />
      </div>
      <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-2">
        <Card className="flex flex-col p-2"><p className="text-[10px] font-semibold">Orders by hour</p><Line points={[12, 18, 44, 62, 40, 30, 36, 58, 80, 72, 50]} color="#ea580c" className="mt-1 flex-1" /></Card>
        <Card className="overflow-hidden">
          <p className="border-b border-[#eef2f7] px-2 py-1.5 text-[10px] font-semibold">Top dishes</p>
          {[["Chicken biryani", "food.jpg", 312], ["Paneer tikka", "dining.jpg", 248], ["Filter coffee", "coffee.jpg", 196]].map(([n, img, v], k) => (
            <motion.div key={n as string} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + k * 0.12 }} className="flex items-center gap-2 border-b border-[#eef2f7] px-2 py-1 last:border-0">
              <Photo src={img as string} className="h-6 w-6 shrink-0 rounded-md" zoom={false} />
              <span className="flex-1 text-[9px] font-semibold">{n as string}</span><span className="text-[9px] text-[#64748b]">{v as number}</span>
            </motion.div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/** Tablet: a store's payment terminal app taking a UPI payment. */
export function PaymentsTerminal() {
  const step = useSteps(3, 900);
  const paid = step >= 2;
  return (
    <div className="grid h-full grid-cols-[1fr_1.1fr] bg-[#f8fafc]">
      <div className="relative">
        <Photo src="checkout.jpg" className="absolute inset-0" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#0b1f4d]">Counter 2 · Your Café</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 p-3 text-center">
        <p className="text-[10px] text-[#64748b]">Amount due</p>
        <p className="text-[22px] font-black text-[#0b1f4d]">₹<CountUp to={1240} /></p>
        <AnimatePresence mode="wait">
          {paid ? (
            <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid h-20 w-20 place-items-center rounded-full bg-[#16a34a] text-white"><Check className="h-10 w-10" strokeWidth={3} /></motion.span>
          ) : (
            <motion.span key="qr" exit={{ scale: 0.8, opacity: 0 }} className="relative grid h-20 w-20 grid-cols-6 gap-0.5 rounded-lg bg-white p-1.5 shadow-[inset_0_0_0_1px_#e6ebf3]">
              {Array.from({ length: 36 }, (_, k) => <span key={k} className="rounded-[1px]" style={{ background: (k * 7) % 3 ? "#0b1f4d" : "transparent" }} />)}
              <motion.span className="absolute inset-x-1 h-0.5 bg-[#1f56d6]" animate={{ top: ["10%", "90%", "10%"] }} transition={{ duration: 1.6, repeat: Infinity }} />
            </motion.span>
          )}
        </AnimatePresence>
        <p className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: paid ? GREEN : ROYAL }}>{paid ? "Payment received" : <><Spinner className="h-3 w-3 border-[#1f56d6]/30" />Waiting for UPI</>}</p>
        <span className="flex items-center gap-1 text-[8px] text-[#94a3b8]"><CreditCard className="h-3 w-3" />UPI · Card · Wallet</span>
      </div>
    </div>
  );
}

/** Phone: a food-delivery app — dish, quantity and a rider on the way. */
export function FoodDeliveryApp() {
  const step = useSteps(4, 800);
  const qty = Math.min(2, 1 + step);
  const ordered = step >= 3;
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-1.5 px-3 py-2"><span className="text-[12px] font-black text-[#ea580c]">yourfood</span><span className="ml-auto flex items-center gap-0.5 text-[8px] text-[#64748b]"><MapPin className="h-2.5 w-2.5" />Home</span></div>
      <div className="relative mx-3 h-[110px] overflow-hidden rounded-2xl">
        <Photo src="food.jpg" className="absolute inset-0" />
        <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[8px] font-bold text-[#ea580c]">Bestseller</span>
        <Heart className="absolute right-2 top-2 h-4 w-4 fill-[#ef4444] text-[#ef4444]" />
      </div>
      <div className="px-3 pt-2">
        <p className="text-[12px] font-bold">Grilled chicken platter</p>
        <p className="flex items-center gap-1 text-[9px] text-[#64748b]"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />4.7 · 25 min · Free delivery</p>
        <div className="mt-2 flex items-center justify-between"><span className="text-[14px] font-black">₹{fmt(349 * qty)}</span><span className="flex items-center gap-2 rounded-full border border-[#fed7aa] px-2 py-0.5 text-[11px] font-bold text-[#ea580c]"><Minus className="h-3 w-3" />{qty}<Plus className="h-3 w-3" /></span></div>
      </div>
      <AnimatePresence mode="wait">
        {ordered ? (
          <motion.div key="track" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-3 mb-3 mt-auto rounded-xl bg-[#fff7ed] p-2">
            <p className="flex items-center gap-1 text-[10px] font-bold text-[#7c2d12]"><Bike className="h-3.5 w-3.5" />Rider is on the way · 18 min</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#fed7aa]"><motion.div className="h-full rounded-full bg-[#ea580c]" initial={{ width: "10%" }} animate={{ width: "55%" }} transition={{ duration: 1.5, ease: EASE }} /></div>
          </motion.div>
        ) : (
          <motion.div key="cta" exit={{ opacity: 0 }} className="mx-3 mb-3 mt-auto rounded-xl bg-[#ea580c] py-2 text-center text-[10px] font-bold text-white">Place order</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================= AI ================================= */

const CONCIERGE: ChatLine[] = [
  { me: true, t: "Can we get a sea-view room for this weekend?" },
  { me: false, t: "Yes! A Pool Villa is free Sat–Mon at ₹12,500/night. Shall I hold it?", src: "Room availability" },
  { me: true, t: "Yes, and a candle-light dinner on Saturday" },
  { me: false, t: "Done ✓ Villa held and dinner booked for 8 PM.", src: "Reservations" },
];

/** Phone: a resort's AI concierge handling a booking. */
export function ConciergeChat() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="relative h-12 shrink-0"><Photo src="resort-2.jpg" className="absolute inset-0" /><span className="absolute inset-0 bg-gradient-to-r from-[#0b1f4d]/80 to-transparent" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white">Resort concierge</span></div>
      <ChatThread messages={CONCIERGE} title="AI concierge" />
      <div className="mx-3 mb-3 flex items-center gap-1.5 rounded-full border border-[#e6ebf3] px-3 py-1.5 text-[10px] text-[#94a3b8]">Message…<Send className="ml-auto h-3.5 w-3.5" style={{ color: ROYAL }} /></div>
    </div>
  );
}

const REVIEWS: [string, string, "pos" | "neg"][] = [
  ["Loved the latte art and quick service!", "Google", "pos"],
  ["Order arrived cold, not happy.", "Zomato", "neg"],
  ["Best breakfast in town ☕", "Instagram", "pos"],
];

/** Tablet: an AI agent reading customer reviews, tagging sentiment and drafting replies. */
export function ReviewAgent() {
  const n = useSteps(REVIEWS.length + 1, 800);
  return (
    <div className="flex h-full flex-col gap-2 bg-[#f8fafc] p-3">
      <p className="flex items-center gap-1 text-[12px] font-bold"><Sparkles className="h-3.5 w-3.5" style={{ color: ROYAL }} />Review agent · Your Café</p>
      {REVIEWS.map(([t, src, mood], k) => (
        <motion.div key={t} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.15 }} className="rounded-lg border border-[#e6ebf3] bg-white p-2">
          <p className="flex items-center justify-between text-[8px] text-[#94a3b8]">{src}{k < n && <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${mood === "pos" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>{mood === "pos" ? "Positive" : "Needs attention"}</span>}</p>
          <p className="text-[9px] text-[#0b1f4d]">“{t}”</p>
          {k < n && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 rounded bg-[#eef3ff] px-1.5 py-1 text-[8px] text-[#1f56d6]"><b>Draft reply:</b> {mood === "pos" ? "Thank you so much — see you again soon!" : "We're sorry! A fresh order is on us — we've messaged you."}</motion.p>}
        </motion.div>
      ))}
    </div>
  );
}

/* ============================== MARKETING ============================== */

/** Phone: a travel company's sponsored story. */
export function TravelAd() {
  const step = useSteps(3, 900);
  return (
    <div className="relative h-full overflow-hidden bg-black text-white">
      <Photo src="beach.jpg" className="absolute inset-0" />
      <span className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      <div className="absolute inset-x-2 top-2 flex gap-1">{[0, 1, 2].map((k) => <span key={k} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"><motion.span className="block h-full bg-white" initial={{ width: "0%" }} animate={{ width: k < step ? "100%" : k === step ? "60%" : "0%" }} transition={{ duration: 0.9 }} /></span>)}</div>
      <div className="absolute left-3 top-5 flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#0ea5e9]"><Plane className="h-3 w-3" /></span><span className="text-[10px] font-bold">yourtravel</span><span className="text-[9px] text-white/70">Sponsored</span></div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6, ease: EASE }} className="absolute inset-x-3 bottom-14">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7dd3fc]">Maldives · 4N / 5D</p>
        <p className="text-[18px] font-black leading-tight">Sunsets on<br />the sea.</p>
        <p className="mt-1 text-[10px]">from <b className="text-[14px]">₹54,999</b> per person</p>
      </motion.div>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute inset-x-3 bottom-4 flex items-center justify-center gap-1 rounded-full bg-white py-2 text-[10px] font-bold text-[#0b1f4d]">Book now<ChevronRight className="h-3 w-3" /></motion.div>
    </div>
  );
}

/** Tablet: a Google search result page with the café's ad and map listing on top. */
export function LocalSearch() {
  return (
    <div className="flex h-full flex-col gap-2 bg-white p-3">
      <div className="flex items-center gap-1.5 rounded-full border border-[#e6ebf3] px-3 py-1.5 text-[10px] text-[#475569] shadow-sm"><Search className="h-3 w-3" />cafe near me</div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-[8px] text-[#0b1f4d]"><b>Sponsored</b> · yourcafe.com</p>
        <p className="text-[12px] font-semibold text-[#1a0dab]">Your Café — Specialty Coffee &amp; Breakfast</p>
        <p className="text-[9px] text-[#4d5156]">Freshly roasted coffee, all-day breakfast. Order online in minutes.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-2 overflow-hidden rounded-xl border border-[#e6ebf3] p-1.5">
        <Photo src="cafe.jpg" className="h-16 w-20 shrink-0 rounded-lg" zoom={false} />
        <span className="flex-1 leading-tight">
          <span className="block text-[11px] font-bold">Your Café</span>
          <span className="flex items-center gap-0.5 text-[9px] text-[#64748b]">4.8<Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />(1,240) · Café</span>
          <span className="block text-[9px] text-[#16a34a]">Open · Closes 11 PM</span>
          <span className="mt-1 flex gap-1">{["Directions", "Call", "Order"].map((t) => <span key={t} className="rounded-full border border-[#e6ebf3] px-1.5 py-0.5 text-[8px] font-semibold text-[#1a73e8]">{t}</span>)}</span>
        </span>
      </motion.div>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        {[["Calls", 312], ["Directions", 864], ["Orders", 1120]].map(([k, v]) => <span key={k as string} className="rounded-lg bg-[#f8fafc] px-2 py-1"><span className="block text-[8px] text-[#94a3b8]">{k as string} · this month</span><span className="text-[12px] font-bold"><CountUp to={v as number} /></span></span>)}
      </div>
    </div>
  );
}

/* =============================== SOFTWARE =============================== */

const SLOTS: [string, string, string, number][] = [["Asha", "Facial", "#fce7f3", 0], ["Ravi", "Massage", "#dbeafe", 1], ["Meena", "Hair spa", "#fef3c7", 2], ["Divya", "Manicure", "#dcfce7", 0]];

/** Desktop: a salon & spa management system — staff schedule for the day. */
export function SalonScheduler() {
  const n = useSteps(SLOTS.length, 500);
  return (
    <div className="flex h-full bg-[#fdf8f6]">
      <div className="w-[22%] border-r border-[#f3e8e4] bg-white p-2 text-[#4a2a2a]">
        <p className="text-[11px] font-bold">Salon · Admin</p>
        {[["Schedule", Calendar], ["Clients", Users], ["Billing", CreditCard]].map(([t, I], k) => { const Icon = I as typeof Calendar; return <span key={t as string} className={`mt-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] ${k === 0 ? "bg-[#fdf2f8] font-semibold text-[#be185d]" : "text-[#9a7b74]"}`}><Icon className="h-3 w-3" />{t as string}</span>; })}
        <div className="relative mt-3 h-16 overflow-hidden rounded-lg"><Photo src="spa.jpg" className="absolute inset-0" zoom={false} /></div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[12px] font-bold text-[#4a2a2a]">Today · 23 bookings</p>
        <div className="mt-2 grid grid-cols-[50px_1fr_1fr_1fr] text-[8px] text-[#9a7b74]"><span />{["10 AM", "12 PM", "2 PM"].map((h) => <span key={h}>{h}</span>)}</div>
        <div className="mt-1 flex flex-col gap-1.5">
          {SLOTS.map(([who, svc, c, col], k) => (
            <div key={who} className="grid grid-cols-[50px_1fr_1fr_1fr] items-center gap-1">
              <span className="text-[9px] font-semibold text-[#4a2a2a]">{who}</span>
              {[0, 1, 2].map((ci) => (
                <span key={ci} className="h-6 rounded-md border border-dashed border-[#f3e8e4]">
                  {ci === col && k < n && <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-full items-center rounded-md px-1.5 text-[8px] font-semibold text-[#4a2a2a]" style={{ background: c }}>{svc}</motion.span>}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2">
          <Kpi label="Revenue today" to={42600} format={(n) => `₹${fmt(n)}`} />
          <Kpi label="Utilisation" to={86} format={(n) => `${Math.round(n)}%`} delay={0.25} />
          <Kpi label="Repeat clients" to={64} format={(n) => `${Math.round(n)}%`} delay={0.35} tint={GREEN} />
        </div>
      </div>
    </div>
  );
}

/** Tablet: a café's stock & recipe costing screen. */
export function CafeInventory() {
  const live = useLive(18, 1, 1200);
  return (
    <div className="flex h-full flex-col gap-2 bg-[#faf7f2] p-3">
      <p className="text-[12px] font-bold text-[#3b2417]">Kitchen stock · Your Café</p>
      {[["Coffee beans", live, 25, "kg"], ["Milk", 42, 60, "L"], ["Croissants", 6, 40, "pcs"]].map(([n, v, max, u], k) => {
        const pct = ((v as number) / (max as number)) * 100;
        return (
          <div key={n as string} className="rounded-lg bg-white p-2 shadow-[inset_0_0_0_1px_#efe6dc]">
            <p className="flex justify-between text-[9px]"><span className="font-semibold text-[#3b2417]">{n as string}</span><span className="text-[#7c6a5c]">{v as number} {u as string}</span></p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#efe6dc]"><motion.div className="h-full rounded-full" style={{ background: pct < 25 ? "#dc2626" : "#3b2417" }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: k * 0.15, duration: 0.8, ease: EASE }} /></div>
            {pct < 25 && <p className="mt-1 text-[8px] font-semibold text-[#dc2626]">Low — auto-reorder sent to supplier</p>}
          </div>
        );
      })}
      <div className="mt-auto flex items-center gap-2 rounded-lg bg-white p-2 shadow-[inset_0_0_0_1px_#efe6dc]">
        <Photo src="coffee.jpg" className="h-10 w-10 shrink-0 rounded-md" zoom={false} />
        <span className="flex-1 leading-tight"><span className="block text-[10px] font-semibold">Cappuccino · recipe cost</span><span className="text-[9px] text-[#7c6a5c]">₹58 cost · ₹220 price · 74% margin</span></span>
      </div>
    </div>
  );
}

/** Phone: the salon's staff app — today's clients and check-in. */
export function SalonStaffApp() {
  const step = useSteps(3, 900);
  return (
    <div className="flex h-full flex-col bg-[#fdf8f6]">
      <div className="bg-[#fdf2f8] px-3 pb-3 pt-2 text-[#4a2a2a]"><p className="text-[9px] text-[#9a7b74]">Thursday</p><p className="text-[13px] font-bold">Hi Asha · 6 clients today</p></div>
      <div className="flex flex-col gap-1.5 px-3 pt-2">
        {[["Priya", "Facial · 10:00", 0], ["Kavya", "Hair spa · 12:30", 1], ["Nisha", "Manicure · 3:00", 2]].map(([n, t, k]) => {
          const done = (k as number) < step;
          return (
            <div key={n as string} className={`flex items-center gap-2 rounded-xl border p-2 ${k === step ? "border-[#be185d]" : "border-[#f3e8e4]"} bg-white`}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fce7f3] text-[10px] font-bold text-[#be185d]">{(n as string)[0]}</span>
              <span className="flex-1 leading-tight"><span className="block text-[10px] font-semibold">{n as string}</span><span className="text-[8px] text-[#9a7b74]">{t as string}</span></span>
              {done ? <span className="rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[7px] font-bold text-[#15803d]">Done</span> : <span className="rounded-full bg-[#fdf2f8] px-1.5 py-0.5 text-[7px] font-bold text-[#be185d]">{k === step ? "In chair" : "Upcoming"}</span>}
            </div>
          );
        })}
      </div>
      <div className="relative mx-3 mb-3 mt-auto h-12 overflow-hidden rounded-xl"><Photo src="spa.jpg" className="absolute inset-0" zoom={false} /><span className="absolute inset-0 bg-[#be185d]/45" /><span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-white">Tips this week · ₹2,350</span></div>
    </div>
  );
}
