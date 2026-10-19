"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple, BadgeCheck, Bell, Calendar, Check, ChevronDown, ChevronLeft, Clock, CreditCard, Heart, Home, Info, LayoutDashboard, Leaf,
  Mail, MapPin, Navigation, Package, Phone, Search, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal,
  Sparkles, Star, Truck, User, Users, Watch, Laptop, Camera,
  Headphones as HeadphonesIcon, Speaker as SpeakerIcon,
} from "lucide-react";
import { FINISHES, Headphones, ProductThumb, SmartWatch, STUDIO, type Finish, type ProductKind } from "./products";
import {
  Bars, BrowserFrame, Card, Caret, CountUp, EASE, GREEN, Kpi, PhoneFrame, Pill, ROYAL, Spinner, Stage, Toast, Tour,
  fmt, useSteps, useTyped, type TourPage,
} from "./kit";

const stag = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };

function SiteNav({ active }: { active: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eef2f7] px-4 py-2">
      <span className="text-[12px] font-black text-[#0b1f4d]">your<span style={{ color: ROYAL }}>business</span></span>
      <span className="hidden gap-3 text-[10px] text-[#64748b] sm:flex">
        {["Home", "Services", "About", "Contact"].map((l) => <span key={l} className={l === active ? "font-semibold text-[#0b1f4d]" : ""}>{l}</span>)}
      </span>
      <span className="rounded-full px-2.5 py-1 text-[9px] font-bold text-white" style={{ background: ROYAL }}>Get a quote</span>
    </div>
  );
}

/* ========================================== WEB ========================================== */

const BEST: { kind: ProductKind; finish: Finish; name: string; price: string }[] = [
  { kind: "headphones", finish: "midnight", name: "Wireless Headphones", price: "₹3,499" },
  { kind: "watch", finish: "sky", name: "Smart Watch", price: "₹4,999" },
  { kind: "speaker", finish: "sand", name: "Portable Speaker", price: "₹2,299" },
];

export function WebHome() {
  return (
    <div className="h-full bg-white">
      <SiteNav active="Home" />
      <div className="grid grid-cols-[1fr_1.05fr] items-center gap-3 px-4 pt-3">
        <motion.div variants={stag} initial="hidden" animate="show">
          <motion.span variants={up} className="inline-block rounded-full bg-[#eef3ff] px-2 py-0.5 text-[9px] font-semibold" style={{ color: ROYAL }}>New season · Free delivery</motion.span>
          <motion.p variants={up} className="mt-2 text-[19px] font-bold leading-[1.1] text-[#0b1f4d]">Premium sound, delivered fast.</motion.p>
          <motion.p variants={up} className="mt-1.5 text-[10px] leading-4 text-[#64748b]">Headphones, watches and speakers with next-day delivery across the city.</motion.p>
          <motion.div variants={up} className="mt-3 flex gap-1.5">
            <span className="rounded-full px-3 py-1.5 text-[10px] font-bold text-white" style={{ background: ROYAL }}>Shop now</span>
            <span className="rounded-full border border-[#e6ebf3] px-3 py-1.5 text-[10px] font-semibold text-[#0b1f4d]">Explore</span>
          </motion.div>
        </motion.div>
        {/* hero product shot */}
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: EASE }} className="relative h-[124px] overflow-hidden rounded-xl" style={{ background: STUDIO }}>
          <motion.span className="absolute inset-0 grid place-items-center" initial={{ y: 14, rotate: -4 }} animate={{ y: 0, rotate: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: EASE }}>
            <Headphones finish="midnight" className="h-[88%] w-auto" />
          </motion.span>
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute left-2 top-2 rounded-md bg-white px-1.5 py-1 text-[8px] font-bold text-[#0b1f4d] shadow-sm">₹3,499 <s className="font-normal text-[#94a3b8]">₹4,399</s></motion.span>
          <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-md bg-white px-1.5 py-1 text-[8px] font-bold text-[#0b1f4d] shadow-sm"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />4.8 · 320 reviews</motion.span>
        </motion.div>
      </div>
      <div className="flex items-center justify-between px-4 pt-3"><p className="text-[11px] font-bold text-[#0b1f4d]">Best sellers</p><span className="text-[9px] font-semibold" style={{ color: ROYAL }}>View all</span></div>
      <motion.div className="grid grid-cols-3 gap-2 px-4 pt-1.5" variants={stag} initial="hidden" animate="show">
        {BEST.map((b) => (
          <motion.div key={b.name} variants={up} className="rounded-lg border border-[#eef2f7] p-1 transition-colors hover:border-[#1f56d6]/40">
            <ProductThumb kind={b.kind} finish={b.finish} className="h-14 rounded-md" />
            <p className="mt-1 truncate text-[9px] font-semibold text-[#0b1f4d]">{b.name}</p>
            <p className="text-[9px] font-bold">{b.price}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Field({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div>
      <p className="text-[9px] text-[#64748b]">{label}</p>
      <div className={`mt-0.5 rounded-md border px-2 py-1 text-[10px] text-[#0b1f4d] ${active ? "border-[#1f56d6] shadow-[0_0_0_3px_rgba(31,86,214,0.12)]" : "border-[#e6ebf3]"}`}>{value}{active && <Caret />}&nbsp;</div>
    </div>
  );
}

export function WebCheckout() {
  const name = useTyped("Priya Raman", 50, 200);
  const email = useTyped("priya@email.com", 45, 900);
  const card = useTyped("4242 4242 4242 4242", 40, 1700);
  const step = useSteps(4, 700);
  const paying = step === 3 && card.length === 19;
  const paid = step >= 4 && card.length === 19;
  return (
    <div className="h-full bg-[#f8fafc]">
      <SiteNav active="" />
      <div className="grid grid-cols-[1.2fr_1fr] gap-3 p-3">
        <Card className="space-y-2 p-3">
          <p className="text-[12px] font-bold text-[#0b1f4d]">Checkout</p>
          <Field label="Full name" value={name} active={name.length < 11} />
          <Field label="Email" value={email} active={name.length === 11 && email.length < 15} />
          <Field label="Card number" value={card} active={email.length === 15 && card.length < 19} />
          <div className="flex items-center gap-1 text-[9px] text-[#64748b]"><ShieldCheck className="h-3 w-3 text-[#16a34a]" />Payments are encrypted</div>
        </Card>
        <Card className="flex flex-col p-3">
          <p className="text-[11px] font-bold text-[#0b1f4d]">Order summary</p>
          {([["headphones", "Wireless Headphones", "₹3,499"], ["watch", "Smart Watch", "₹4,999"]] as const).map(([k, n, p]) => (
            <div key={n} className="mt-2 flex items-center gap-2 text-[10px]"><ProductThumb kind={k} className="h-8 w-8 rounded-md" /><span className="flex-1 font-medium">{n}</span><span>{p}</span></div>
          ))}
          <div className="mt-2 flex justify-between border-t border-[#eef2f7] pt-2 text-[10px] text-[#64748b]"><span>Delivery</span><span style={{ color: GREEN }}>Free</span></div>
          <div className="flex justify-between text-[12px] font-bold text-[#0b1f4d]"><span>Total</span><span>₹<CountUp to={8498} /></span></div>
          <motion.div animate={{ backgroundColor: paid ? GREEN : ROYAL }} className="mt-auto flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-white">
            {paying ? <><Spinner className="h-3 w-3" />Processing…</> : paid ? <><Check className="h-3.5 w-3.5" strokeWidth={3} />Payment successful</> : <><CreditCard className="h-3.5 w-3.5" />Pay ₹8,498</>}
          </motion.div>
        </Card>
      </div>
    </div>
  );
}

const ORDERS = [
  ["#2041", "Priya R.", "₹2,398", "Paid", GREEN],
  ["#2042", "Arun K.", "₹899", "Packed", ROYAL],
  ["#2043", "Meena S.", "₹4,120", "Shipped", "#7c3aed"],
  ["#2044", "Ravi T.", "₹1,499", "New", "#d97706"],
] as const;

export function WebAdmin() {
  return (
    <div className="flex h-full bg-[#f8fafc]">
      <div className="flex w-[18%] flex-col gap-1 bg-[#0b1f4d] p-2 text-[9px] text-white/80">
        <span className="mb-1 text-[10px] font-bold text-white">Admin</span>
        {[{ I: LayoutDashboard, t: "Overview" }, { I: ShoppingBag, t: "Orders" }, { I: Package, t: "Products" }, { I: Users, t: "Customers" }].map(({ I, t }, i) => (
          <span key={t} className={`flex items-center gap-1 rounded px-1.5 py-1 ${i === 0 ? "bg-white/15 text-white" : ""}`}><I className="h-3 w-3" />{t}</span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Revenue today" to={48250} format={(n) => `₹${fmt(n)}`} />
          <Kpi label="Orders" to={126} delay={0.25} />
          <Kpi label="Visitors" to={3420} delay={0.35} />
        </div>
        <div className="grid flex-1 grid-cols-[1.3fr_1fr] gap-2">
          <Card className="flex flex-col p-2"><p className="text-[10px] font-semibold text-[#0b1f4d]">Sales this week</p><Bars values={[35, 52, 44, 68, 60, 82, 94]} className="mt-2 flex-1" /></Card>
          <Card className="overflow-hidden">
            {ORDERS.map(([id, who, amt, st, c], i) => (
              <motion.div key={id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="flex items-center justify-between border-b border-[#eef2f7] px-2 py-1.5 text-[9px] last:border-0">
                <span className="font-semibold">{id}</span><span className="text-[#64748b]">{who}</span><span>{amt}</span><Pill color={c}>{st}</Pill>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

const TEAM = [["AR", "#1f56d6"], ["MS", "#7c3aed"], ["KV", "#16a34a"], ["DP", "#d97706"], ["SN", "#e11d48"]];

function WebAbout() {
  return (
    <div className="h-full bg-white">
      <SiteNav active="About" />
      <div className="px-4 pt-4">
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[18px] font-bold text-[#0b1f4d]">About us</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-1 max-w-sm text-[10px] leading-4 text-[#64748b]">A family business serving our city since 2015 — now online, with the same personal service.</motion.p>
        <p className="mt-3 text-[10px] font-semibold text-[#0b1f4d]">Our team</p>
        <div className="mt-1.5 flex -space-x-2">
          {TEAM.map(([i, c], k) => (
            <motion.span key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + k * 0.08, type: "spring", stiffness: 300 }} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-white" style={{ background: c }}>{i}</motion.span>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-semibold text-[#0b1f4d]">Our journey</p>
        <div className="relative mt-2">
          <div className="absolute left-0 right-0 top-[5px] h-0.5 bg-[#eef2f7]" />
          <motion.div className="absolute left-0 top-[5px] h-0.5" style={{ background: ROYAL }} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 1.4, ease: EASE }} />
          <div className="relative flex justify-between">
            {[["2015", "First store"], ["2019", "Second branch"], ["2023", "Online shop"], ["2026", "Mobile app"]].map(([y, t], k) => (
              <motion.div key={y} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + k * 0.3 }} className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full border-2 border-white" style={{ background: ROYAL }} />
                <span className="mt-1 text-[10px] font-bold text-[#0b1f4d]">{y}</span>
                <span className="text-[9px] text-[#64748b]">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WebContact() {
  const msg = useTyped("Hi, I'd like a quote for a new website.", 40, 500);
  const sent = msg.length === 40;
  return (
    <div className="relative h-full bg-white">
      <SiteNav active="Contact" />
      <div className="grid grid-cols-2 gap-3 p-3">
        <div className="relative h-[170px] overflow-hidden rounded-xl bg-[#eef3ff]">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#dbe4f3 1px, transparent 1px), linear-gradient(90deg, #dbe4f3 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden><path d="M0 70 Q30 55 50 60 T100 40" stroke="#c7d6ee" strokeWidth="5" fill="none" /></svg>
          <motion.span initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 12 }} className="absolute left-1/2 top-[38%] -translate-x-1/2"><MapPin className="h-7 w-7 fill-[#1f56d6] text-white" /></motion.span>
          <span className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-[9px] font-semibold shadow">Open today · 9am–8pm</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] font-bold text-[#0b1f4d]">Get in touch</p>
          <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]"><Phone className="h-3 w-3" style={{ color: ROYAL }} />+91 98765 43210</div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]"><Mail className="h-3 w-3" style={{ color: ROYAL }} />hello@yourbusiness.com</div>
          <div className="min-h-[54px] rounded-md border border-[#1f56d6] px-2 py-1 text-[10px] text-[#0b1f4d] shadow-[0_0_0_3px_rgba(31,86,214,0.12)]">{msg}{!sent && <Caret />}</div>
          <motion.div animate={{ backgroundColor: sent ? GREEN : ROYAL }} className="flex items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-bold text-white">{sent ? <><Check className="h-3 w-3" strokeWidth={3} />Message sent</> : "Send message"}</motion.div>
        </div>
      </div>
      <Toast show={sent}><span className="grid h-4 w-4 place-items-center rounded-full text-white" style={{ background: GREEN }}><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>New enquiry received</Toast>
    </div>
  );
}

const WEB_PAGES: TourPage[] = [
  { label: "Homepage", icon: Home, url: "yourbusiness.com", Page: WebHome },
  { label: "Checkout", icon: ShoppingCart, url: "yourbusiness.com/checkout", Page: WebCheckout },
  { label: "Admin", icon: LayoutDashboard, url: "yourbusiness.com/admin", Page: WebAdmin },
  { label: "About us", icon: Info, url: "yourbusiness.com/about", Page: WebAbout },
  { label: "Contact", icon: Mail, url: "yourbusiness.com/contact", Page: WebContact },
];

export function WebTour({ play }: { play: boolean }) {
  return (
    <Stage className="aspect-[5/4]">
      <Tour pages={WEB_PAGES} play={play} frame={(p, content) => <BrowserFrame url={p.url!} title={p.label}>{content}</BrowserFrame>} />
    </Stage>
  );
}

/* ========================================== APP ========================================== */

const pad = (n: number) => String(n).padStart(2, "0");

function AppLogin() {
  const phone = useTyped("98765 43210", 55, 300);
  const otp = useTyped("4827", 280, 1400);
  const verified = otp.length === 4;
  const left = useSteps(6, 1000);
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <div className="flex items-center gap-1.5">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#0b1f4d] text-white"><ShoppingBag className="h-3.5 w-3.5" /></span>
        <span className="text-[13px] font-bold tracking-tight text-[#0b1f4d]">your<span style={{ color: ROYAL }}>store</span></span>
      </div>

      <h4 className="mt-5 text-[19px] font-bold leading-tight tracking-tight text-[#0b1f4d]">Sign in</h4>
      <p className="mt-1 text-[10px] leading-snug text-[#64748b]">Use your mobile number to track orders and save addresses.</p>

      <p className="mt-4 text-[9px] font-semibold text-[#475569]">Mobile number</p>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#1f56d6] px-2.5 py-2 text-[11px] shadow-[0_0_0_3px_rgba(31,86,214,0.1)]">
        <span className="border-r border-[#e6ebf3] pr-2 text-[11px] font-medium text-[#0b1f4d]">+91</span>
        <span className="font-medium text-[#0b1f4d]">{phone}{phone.length < 11 && <Caret />}</span>
      </div>

      <p className="mt-3.5 text-[9px] font-semibold text-[#475569]">Verification code</p>
      <div className="mt-1 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((k) => {
          const filled = k < otp.length;
          const active = k === otp.length && phone.length === 11;
          return (
            <motion.span
              key={k}
              animate={{ borderColor: filled || active ? "#1f56d6" : "#dfe5ee", backgroundColor: "#ffffff" }}
              className="grid h-9 place-items-center rounded-lg border text-[14px] font-semibold text-[#0b1f4d]"
            >
              {filled ? otp[k] : active ? <Caret /> : ""}
            </motion.span>
          );
        })}
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[9px] text-[#64748b]">{verified ? <><Check className="h-3 w-3" style={{ color: GREEN }} strokeWidth={3} /><span style={{ color: GREEN }} className="font-semibold">Number verified</span></> : <>Resend code in <b className="text-[#1f56d6]">0:{pad(30 - left)}</b></>}</p>

      <motion.div animate={{ backgroundColor: verified ? GREEN : ROYAL }} className="mt-4 flex items-center justify-center gap-1 rounded-lg py-2.5 text-[11px] font-semibold text-white">
        {verified ? <><Check className="h-3.5 w-3.5" strokeWidth={3} />Continue</> : "Verify and continue"}
      </motion.div>

      <div className="my-3.5 flex items-center gap-2 text-[8px] text-[#94a3b8]"><span className="h-px flex-1 bg-[#eef2f7]" />or<span className="h-px flex-1 bg-[#eef2f7]" /></div>
      <div className="grid gap-2 pb-6">
        <span className="flex items-center justify-center gap-1.5 rounded-lg border border-[#dfe5ee] py-2 text-[10px] font-semibold text-[#0b1f4d]"><span className="text-[11px] font-black text-[#ea4335]">G</span>Continue with Google</span>
        <span className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0b1220] py-2 text-[10px] font-semibold text-white"><Apple className="h-3 w-3" />Continue with Apple</span>
      </div>
    </div>
  );
}

const CATS = [{ I: HeadphonesIcon, l: "Audio" }, { I: Watch, l: "Watches" }, { I: SpeakerIcon, l: "Speakers" }, { I: Laptop, l: "Laptops" }, { I: Camera, l: "Cameras" }];

export function AppHome() {
  const s = useSteps(59, 1000);
  return (
    <div className="flex h-full flex-col gap-2 px-3 pt-1">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0b1f4d] text-[9px] font-bold text-white">PR</span>
        <span className="flex-1 leading-tight"><span className="block text-[8px] text-[#94a3b8]">Deliver to</span><span className="flex items-center gap-0.5 text-[10px] font-bold text-[#0b1f4d]">Home · Coimbatore<ChevronDown className="h-3 w-3" /></span></span>
        <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[#f1f5f9]"><Bell className="h-3.5 w-3.5 text-[#0b1f4d]" /><motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.8 }} className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#e11d48]" /></span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="flex flex-1 items-center gap-1.5 rounded-xl bg-[#f1f5f9] px-2.5 py-2 text-[10px] text-[#94a3b8]"><Search className="h-3 w-3" />Search products</span>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0b1f4d] text-white"><SlidersHorizontal className="h-3.5 w-3.5" /></span>
      </div>
      <motion.div className="flex justify-between" initial="hidden" animate="show" variants={stag}>
        {CATS.map(({ I, l }, k) => (
          <motion.span key={l} variants={up} className="flex flex-col items-center gap-0.5">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${k === 0 ? "bg-[#1f56d6] text-white ring-2 ring-[#1f56d6]/25" : "bg-[#f1f5f9] text-[#475569]"}`}><I className="h-4 w-4" /></span>
            <span className={`text-[8px] ${k === 0 ? "font-bold text-[#0b1f4d]" : "text-[#64748b]"}`}>{l}</span>
          </motion.span>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative overflow-hidden rounded-2xl bg-[#1f56d6] p-3 text-white">
        <span aria-hidden className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/10" />
        <p className="text-[8px] font-semibold uppercase tracking-wider text-white/80">Flash sale</p>
        <p className="text-[14px] font-black leading-tight">Up to 40% off</p>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold tabular-nums"><Clock className="h-2.5 w-2.5" />02:14:{pad(59 - s)}</span>
        <motion.span className="absolute -bottom-1 right-2 h-[88%]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: EASE }}><SmartWatch finish="sand" className="h-full w-auto" /></motion.span>
      </motion.div>
      <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-[#0b1f4d]">Popular</p><span className="text-[9px] font-semibold text-[#1f56d6]">See all</span></div>
      <div className="grid grid-cols-2 gap-2">
        {([["headphones", "Headphones", "₹3,499", "4.8"], ["watch", "Smart watch", "₹4,999", "4.7"]] as const).map(([kind, n, p, r], i) => (
          <motion.div key={n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.1 }} className="rounded-2xl border border-[#eef2f7] p-1.5">
            <div className="relative grid h-14 place-items-center overflow-hidden rounded-xl" style={{ background: STUDIO }}>
              {kind === "headphones" ? <Headphones finish="sky" className="h-[88%] w-auto" /> : <SmartWatch finish="midnight" className="h-[92%] w-auto" />}
              <Heart className="absolute right-1.5 top-1.5 h-3 w-3 text-[#94a3b8]" />
            </div>
            <p className="mt-1 truncate text-[9px] font-semibold">{n}</p>
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold">{p}</span><span className="flex items-center text-[8px] text-[#64748b]"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />{r}</span></div>
          </motion.div>
        ))}
      </div>
      <TabBar active={0} cart={2} />
    </div>
  );
}

function TabBar({ active, cart = 0 }: { active: number; cart?: number }) {
  const tabs = [{ I: Home, l: "Home" }, { I: Search, l: "Explore" }, { I: ShoppingBag, l: "Cart" }, { I: User, l: "Profile" }];
  return (
    <div className="mt-auto flex justify-around border-t border-[#eef2f7] pb-4 pt-1.5">
      {tabs.map(({ I, l }, i) => (
        <span key={l} className="relative flex flex-col items-center gap-0.5">
          <I className="h-4 w-4" style={{ color: i === active ? ROYAL : "#94a3b8" }} />
          <span className="text-[7px] font-semibold" style={{ color: i === active ? ROYAL : "#94a3b8" }}>{l}</span>
          {l === "Cart" && cart > 0 && <span className="absolute -right-1.5 -top-1 grid h-3 w-3 place-items-center rounded-full bg-[#e11d48] text-[7px] font-bold text-white">{cart}</span>}
        </span>
      ))}
    </div>
  );
}

const COLOURS: Finish[] = ["midnight", "sky", "sand"];

export function AppProduct() {
  const step = useSteps(6, 650);
  const colour = step >= 2 ? 1 : 0;
  const size = step >= 3 ? 1 : -1;
  const flying = step === 4;
  const added = step >= 5;
  return (
    <div className="relative flex h-full flex-col px-3 pt-1">
      <div className="flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f1f5f9]"><ChevronLeft className="h-3.5 w-3.5" /></span>
        <span className="text-[10px] font-bold">Details</span>
        <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[#f1f5f9]">
          <ShoppingBag className="h-3.5 w-3.5" />
          <AnimatePresence>{added && <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center rounded-full bg-[#e11d48] text-[7px] font-bold text-white">1</motion.span>}</AnimatePresence>
        </span>
      </div>
      <div className="relative mt-2 grid h-[34%] place-items-center overflow-hidden rounded-3xl" style={{ background: STUDIO }}>
        <AnimatePresence mode="wait">
          <motion.span key={colour} initial={{ opacity: 0, x: 40, rotate: -6 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -40, rotate: 6 }} transition={{ duration: 0.4, ease: EASE }} className="h-[86%]">
            <Headphones finish={COLOURS[colour]} className="h-full w-auto" />
          </motion.span>
        </AnimatePresence>
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-1.5 py-0.5 text-[7px] font-bold text-[#0b1f4d] shadow-sm">NEW</span>
        <Heart className="absolute right-3 top-3 h-4 w-4 fill-[#e11d48] text-[#e11d48]" />
        <span className="absolute bottom-2 flex gap-1">{COLOURS.map((c, k) => <span key={c} className={`h-1.5 rounded-full transition-all ${k === colour ? "w-4 bg-[#0b1f4d]" : "w-1.5 bg-[#cbd5e1]"}`} />)}</span>
      </div>
      <div className="mt-2 flex items-start justify-between">
        <div><p className="text-[12px] font-bold text-[#0b1f4d]">Wireless Headphones</p><p className="flex items-center gap-1 text-[9px] text-[#64748b]"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />4.8 · 320 reviews</p></div>
        <div className="text-right"><p className="text-[13px] font-black text-[#0b1f4d]">₹3,499</p><p className="text-[8px] text-[#94a3b8]"><s>₹4,399</s> <b className="text-[#16a34a]">-20%</b></p></div>
      </div>
      <p className="mt-2 text-[9px] font-semibold">Colour · <span className="text-[#64748b]">{FINISHES[COLOURS[colour]].name}</span></p>
      <div className="mt-1 flex gap-2">{COLOURS.map((c, k) => <motion.span key={c} animate={{ boxShadow: k === colour ? `0 0 0 2px #fff, 0 0 0 3.5px ${FINISHES[c].dark}` : "0 0 0 0 #fff" }} className="h-5 w-5 rounded-full" style={{ background: FINISHES[c].swatch }} />)}</div>
      <p className="mt-2 text-[9px] font-semibold">Highlights</p>
      <div className="mt-1 flex gap-1.5">{["40h battery", "Noise cancelling", "Bluetooth 5.3"].map((t, k) => <motion.span key={t} animate={{ backgroundColor: k === size ? "#0b1f4d" : "#f1f5f9", color: k === size ? "#ffffff" : "#64748b" }} className="rounded-lg px-1.5 py-1 text-[8px] font-semibold">{t}</motion.span>)}</div>
      <div className="mb-5 mt-auto flex items-center gap-2 rounded-2xl bg-[#f8fafc] p-1.5">
        <span className="pl-1.5 leading-tight"><span className="block text-[8px] text-[#94a3b8]">Total</span><span className="text-[12px] font-black">₹3,499</span></span>
        <motion.span animate={{ backgroundColor: added ? GREEN : ROYAL, scale: flying ? [1, 0.94, 1] : 1 }} className="flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-bold text-white">
          {added ? <><Check className="h-3 w-3" strokeWidth={3} />Added</> : <><ShoppingCart className="h-3 w-3" />Add to cart</>}
        </motion.span>
      </div>
      {/* the item flies into the bag */}
      <AnimatePresence>
        {flying && <motion.span key="fly" className="absolute z-20 h-3 w-3 rounded-full bg-[#1f56d6]" initial={{ right: "30%", bottom: "8%", opacity: 1, scale: 1 }} animate={{ right: "6%", bottom: "92%", opacity: [1, 1, 0], scale: [1, 1.2, 0.4] }} transition={{ duration: 0.6, ease: "easeIn" }} />}
      </AnimatePresence>
    </div>
  );
}

const DAYS = [["Mon", 16], ["Tue", 17], ["Wed", 18], ["Thu", 19], ["Fri", 20]];

export function AppBooking() {
  const step = useSteps(5, 650);
  const day = step >= 1 ? 3 : 1;
  const slot = step >= 2 ? 1 : -1;
  const eco = step >= 3;
  const confirmed = step >= 4;
  return (
    <div className="relative flex h-full flex-col px-3 pt-1">
      <div className="flex items-center gap-2 rounded-2xl bg-[#f8fafc] p-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1f56d6] text-white"><Sparkles className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[11px] font-bold">Home deep cleaning</span><span className="flex items-center gap-1 text-[8px] text-[#64748b]"><Star className="h-2.5 w-2.5 fill-[#f59e0b] text-[#f59e0b]" />4.9 · 2.5 hrs · ₹1,299</span></span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[9px]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#0b1f4d] text-[7px] font-bold text-white">LK</span><b>Lakshmi</b><BadgeCheck className="h-3 w-3 text-[#1f56d6]" /><span className="text-[#64748b]">Verified pro</span></div>
      <p className="mt-2.5 text-[10px] font-bold">Select date</p>
      <div className="mt-1 grid grid-cols-5 gap-1">
        {DAYS.map(([d, n], k) => (
          <span key={d} className="relative grid place-items-center rounded-xl py-1.5 text-center">
            {k === day && <motion.span layoutId="book-day" className="absolute inset-0 rounded-xl bg-[#1f56d6]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className={`relative text-[7px] ${k === day ? "text-white/80" : "text-[#94a3b8]"}`}>{d}</span>
            <span className={`relative text-[11px] font-bold ${k === day ? "text-white" : "text-[#0b1f4d]"}`}>{n}</span>
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[10px] font-bold">Select time</p>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"].map((t, k) => (
          <motion.span key={t} animate={{ backgroundColor: k === slot ? "#0b1f4d" : "#f1f5f9", color: k === slot ? "#fff" : k === 4 ? "#cbd5e1" : "#475569" }} className="rounded-lg py-1.5 text-center text-[8.5px] font-semibold">{t}</motion.span>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-[#eef2f7] px-2 py-1.5 text-[9px]">
        <Leaf className="h-3 w-3 text-[#16a34a]" /><span className="flex-1 font-semibold">Eco-friendly products</span><span className="text-[#64748b]">+₹99</span>
        <motion.span className="flex h-4 w-7 items-center rounded-full p-0.5" animate={{ backgroundColor: eco ? "#16a34a" : "#cbd5e1" }}><motion.span className="h-3 w-3 rounded-full bg-white shadow" animate={{ x: eco ? 12 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} /></motion.span>
      </div>
      <div className="mb-5 mt-auto flex items-center justify-center rounded-xl bg-[#1f56d6] py-2.5 text-[10px] font-bold text-white">Confirm · ₹{eco ? "1,398" : "1,299"}</div>

      {/* confirmation sheet */}
      <AnimatePresence>
        {confirmed && (
          <motion.div key="sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 240, damping: 28 }} className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center rounded-t-3xl bg-white px-4 pb-6 pt-2 shadow-[0_-12px_30px_-12px_rgba(11,31,77,0.35)]">
            <span className="h-1 w-8 rounded-full bg-[#cbd5e1]" />
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 14 }} className="mt-3 grid h-12 w-12 place-items-center rounded-full bg-[#16a34a] text-white"><Check className="h-6 w-6" strokeWidth={3} /></motion.span>
            <p className="mt-2 text-[13px] font-bold text-[#0b1f4d]">Booking confirmed</p>
            <p className="text-[9px] text-[#64748b]">Thu 19 Oct · 11:30 AM · with Lakshmi</p>
            <span className="mt-2 flex items-center gap-1 rounded-full bg-[#eef3ff] px-2.5 py-1 text-[9px] font-semibold text-[#1f56d6]"><Calendar className="h-3 w-3" />Added to calendar</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROUTE = "M30 160 L30 118 Q30 110 38 110 L84 110 Q92 110 92 102 L92 66 Q92 58 100 58 L144 58 Q152 58 152 50 L152 42";
const TRACK_STEPS = ["Placed", "Packed", "On the way", "Delivered"];

function AppTracking() {
  return (
    <div className="flex h-full flex-col">
      {/* the map keeps its proportions, so the courier stays round and exactly on the route */}
      <div className="relative h-[54%] overflow-hidden bg-[#eef0f2]">
        <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* base map: neutral land, city blocks, a park and the river */}
          <rect width="180" height="180" fill="#eef0f2" />
          <path d="M-5 30 Q40 40 70 22 T130 -5 L190 -5 L190 8 Q150 12 120 28 T60 52 Q20 58 -5 48 Z" fill="#c5dcf3" />
          <rect x="102" y="70" width="38" height="30" rx="5" fill="#d3e9d0" />
          <rect x="38" y="120" width="42" height="26" rx="3" fill="#e4e7ea" />
          <rect x="100" y="114" width="42" height="30" rx="3" fill="#e4e7ea" />
          <rect x="38" y="68" width="46" height="36" rx="3" fill="#e4e7ea" />
          <rect x="100" y="20" width="44" height="30" rx="3" fill="#e4e7ea" />
          <rect x="160" y="70" width="24" height="40" rx="3" fill="#e4e7ea" />
          {/* streets: grey casing, white road, with the main avenues wider */}
          {["M30 -5 V190", "M92 -5 V190", "M152 -5 V190", "M-5 110 H190", "M-5 58 H190", "M-5 160 H190", "M60 58 V160", "M122 58 V160", "M-5 84 H92", "M92 134 H190"].map((d, i) => {
            const major = i < 5;
            return (
              <g key={d}>
                <path d={d} fill="none" stroke="#d7dbe0" strokeWidth={major ? 8.5 : 5.5} />
                <path d={d} fill="none" stroke="#ffffff" strokeWidth={major ? 6.5 : 4} />
              </g>
            );
          })}
          <text x="34" y="150" fontSize="5" fill="#7b8794" fontWeight="600" transform="rotate(-90 34 150)">Avinashi Road</text>
          <text x="96" y="107" fontSize="5" fill="#7b8794" fontWeight="600">Race Course Rd</text>
          <text x="98" y="86" fontSize="4.5" fill="#5f8a5a" fontWeight="600">Park</text>
          <text x="6" y="30" fontSize="4.5" fill="#6b9bc7" fontWeight="600">Noyyal River</text>
          {/* the whole route, then the distance already covered */}
          <path d={ROUTE} fill="none" stroke="#a9c0ec" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <motion.path d={ROUTE} fill="none" stroke={ROYAL} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
          <circle cx="30" cy="160" r="4" fill="#fff" stroke="#0b1f4d" strokeWidth="2" />
          {/* destination pin */}
          <g transform="translate(152 42)">
            <circle r="9" fill="rgba(225,29,72,0.15)"><animate attributeName="r" values="6;11;6" dur="2s" repeatCount="indefinite" /></circle>
            <path d="M0 -13 C -6 -13 -9 -8.5 -9 -4.5 C -9 1 0 9 0 9 C 0 9 9 1 9 -4.5 C 9 -8.5 6 -13 0 -13 Z" fill="#e11d48" transform="translate(0 -4)" />
            <circle r="3" cy="-8.5" fill="#fff" />
          </g>
          {/* the courier, moving along the same route in step with the line */}
          <g>
            <animateMotion dur="5s" repeatCount="indefinite" path={ROUTE} rotate="0" calcMode="linear" />
            <circle r="10" fill="rgba(31,86,214,0.18)"><animate attributeName="r" values="7;12;7" dur="1.4s" repeatCount="indefinite" /></circle>
            <circle r="6" fill="#ffffff" stroke={ROYAL} strokeWidth="3" />
          </g>
        </svg>
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-semibold shadow"><Navigation className="h-3 w-3" style={{ color: ROYAL }} />Live</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-2.5">
        <p className="text-[13px] font-bold text-[#0b1f4d]">Arriving in <CountUp from={12} to={8} duration={3} /> min</p>
        <div className="flex items-center gap-2 rounded-xl border border-[#eef2f7] p-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0b1f4d] text-[10px] font-bold text-white">RK</span>
          <span className="min-w-0 flex-1 text-[10px] leading-tight"><b className="block truncate">Ravi Kumar</b><span className="flex items-center gap-1 truncate text-[#64748b]"><Star className="h-2.5 w-2.5 shrink-0 fill-[#f59e0b] text-[#f59e0b]" />4.9 · TN 38 AB 2041</span></span>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e6ebf3]"><Phone className="h-3.5 w-3.5" style={{ color: ROYAL }} /></span>
        </div>
        {/* four clean steps: dot, label, and the line between them filling in */}
        <div className="relative mt-1 grid grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-[5px] h-0.5 rounded-full bg-[#eef2f7]" />
          <motion.div className="absolute left-[12.5%] top-[5px] h-0.5 rounded-full" style={{ background: ROYAL }} initial={{ width: 0 }} animate={{ width: "50%" }} transition={{ duration: 1.4, ease: EASE, delay: 0.3 }} />
          {TRACK_STEPS.map((s, k) => {
            const done = k <= 2;
            return (
              <div key={s} className="relative flex flex-col items-center gap-1">
                <motion.span className="h-3 w-3 rounded-full border-2 border-white" initial={{ scale: 0.6, backgroundColor: "#cbd5e1" }} animate={{ scale: 1, backgroundColor: done ? ROYAL : "#cbd5e1" }} transition={{ delay: 0.3 + k * 0.45 }} style={{ boxShadow: k === 2 ? "0 0 0 3px rgba(31,86,214,0.2)" : undefined }} />
                <span className={`text-center text-[8px] leading-tight ${done ? "font-semibold text-[#0b1f4d]" : "text-[#94a3b8]"}`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const APP_PAGES: TourPage[] = [
  { label: "Login", icon: User, Page: AppLogin },
  { label: "Home", icon: Home, Page: AppHome },
  { label: "Product", icon: ShoppingBag, Page: AppProduct },
  { label: "Booking", icon: Calendar, Page: AppBooking },
  { label: "Tracking", icon: Truck, Page: AppTracking },
];

/** The same app on an iPhone and an Android phone, side by side. */
/** One phone running the app, centred. */
function SinglePhone({ content }: { content: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 24, rotateX: 8 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ transformPerspective: 1000 }}
      >
        <PhoneFrame>{content}</PhoneFrame>
      </motion.div>
    </div>
  );
}

export function AppTour({ play }: { play: boolean }) {
  return (
    <Stage className="aspect-[5/4]">
      <Tour pages={APP_PAGES} play={play} frame={(_, content) => <SinglePhone content={content} />} />
    </Stage>
  );
}

/** A compact version for previews: the two phones running the app, without the stage. */
export function AppPhonesPreview({ className = "h-[440px]" }: { className?: string }) {
  return (
    <div className={className}>
      <Tour pages={APP_PAGES} play frame={(_, content) => <SinglePhone content={content} />} />
    </div>
  );
}

