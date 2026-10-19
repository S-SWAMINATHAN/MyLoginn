"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp, BarChart3, BookOpen, Bot, Boxes, Calendar, Check, CheckCircle2, Clock, Database, FileText, Filter, Globe, Heart,
  KanbanSquare, LayoutDashboard, Mail, Megaphone, MessageCircle, MessageSquare, Receipt, Search, Send, ShieldCheck, Sparkles,
  Target, ThumbsUp, TrendingUp, UserCheck, Users, Workflow, X,
} from "lucide-react";
import {
  AppFrame, Bars, Card, CountUp, EASE, FlowGraph, GREEN, Kpi, Line, Pill, ROYAL, Stage, Toast, Tour, fmt, useLive, useSteps, useTyped, type FlowNode, type TourPage,
} from "./kit";
import { Headphones, STUDIO } from "./products";

/* ===================================================================================================== */
/* AI AGENT STUDIO                                                                                       */
/* ===================================================================================================== */

function StudioSide({ active }: { active: string }) {
  const items = [{ I: Workflow, t: "Workflows" }, { I: MessageSquare, t: "Chat" }, { I: BookOpen, t: "Knowledge" }, { I: UserCheck, t: "Approvals" }, { I: BarChart3, t: "Analytics" }];
  return (
    <div className="flex w-[19%] flex-col gap-1 border-r border-[#eef2f7] bg-[#f8fafc] p-2">
      {items.map(({ I, t }) => (
        <span key={t} className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium ${t === active ? "bg-white text-[#0b1f4d] shadow-[0_2px_8px_-4px_rgba(11,31,77,0.3)]" : "text-[#64748b]"}`}>
          <I className="h-3 w-3" style={{ color: t === active ? ROYAL : undefined }} />{t}
        </span>
      ))}
    </div>
  );
}

const NODES: FlowNode[] = [
  { id: "email", x: 40, y: 55, label: "Email", icon: Mail },
  { id: "wa", x: 40, y: 125, label: "WhatsApp", icon: MessageCircle },
  { id: "agent", x: 150, y: 90, label: "Agent", icon: Bot, core: true },
  { id: "crm", x: 262, y: 35, label: "CRM", icon: Database },
  { id: "reply", x: 262, y: 90, label: "Reply", icon: Send },
  { id: "book", x: 262, y: 145, label: "Booking", icon: Calendar },
];
const LINKS: [number, number][] = [[0, 2], [1, 2], [2, 3], [2, 4], [2, 5]];

export function AiWorkflow() {
  return (
    <div className="flex h-full">
      <StudioSide active="Workflows" />
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between"><p className="text-[12px] font-bold text-[#0b1f4d]">Lead handling workflow</p><span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: GREEN }}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />Running</span></div>
        <div className="mt-2 min-h-0 flex-1 rounded-lg py-2" style={{ backgroundImage: "radial-gradient(#e6ebf3 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
          <FlowGraph w={300} h={180} nodes={NODES} links={LINKS} />
        </div>
      </div>
    </div>
  );
}

const CHAT = [
  { me: true, t: "Are the Sky headphones in stock?" },
  { me: false, t: "Yes — 4 left in Coimbatore. Want me to reserve one?", src: "Inventory" },
  { me: true, t: "Yes please, deliver Saturday" },
  { me: false, t: "Reserved ✓ Delivery booked for Saturday, 11am.", src: "Orders" },
];

/** The assistant conversation on its own, so it can also run on a phone. */
export type ChatLine = { me: boolean; t: string; src?: string };

export function ChatThread({ messages = CHAT, title = "Sales assistant" }: { messages?: ChatLine[]; title?: string }) {
  const step = useSteps(messages.length * 2, 650);
  const shown = Math.min(messages.length, Math.floor((step + 1) / 2));
  const typing = step % 2 === 1 && shown < messages.length && !messages[shown].me;
  return (
    <div className="flex h-full flex-1 flex-col p-3">
      <div className="flex items-center gap-1.5 border-b border-[#eef2f7] pb-2"><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: ROYAL }}><Bot className="h-3.5 w-3.5" /></span><span className="text-[11px] font-bold">{title}</span><Pill color={GREEN}>Online</Pill></div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden pt-2">
        <AnimatePresence initial={false}>
          {messages.slice(0, shown).map((m) => (
            <motion.div key={m.t} layout initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={m.me ? "max-w-[78%] self-end rounded-xl rounded-br-sm px-2.5 py-1.5 text-[10px] text-white" : "max-w-[85%] self-start rounded-xl rounded-bl-sm border border-[#e6ebf3] bg-white px-2.5 py-1.5 text-[10px]"} style={m.me ? { background: ROYAL } : undefined}>
              {m.t}
              {m.src && <span className="mt-1 flex items-center gap-1 text-[9px] text-[#64748b]"><Database className="h-2.5 w-2.5" />Checked {m.src}</span>}
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1 self-start rounded-xl border border-[#e6ebf3] bg-white px-2.5 py-2">
              {[0, 1, 2].map((k) => <motion.span key={k} className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: k * 0.15 }} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AiChat() {
  return (
    <div className="flex h-full">
      <StudioSide active="Chat" />
      <ChatThread />
    </div>
  );
}

function AiKnowledge() {
  const q = useTyped("What is our return policy?", 45, 1500);
  const answered = q.length === 26;
  return (
    <div className="flex h-full">
      <StudioSide active="Knowledge" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[12px] font-bold text-[#0b1f4d]">Knowledge base</p>
        {[["Product catalogue.pdf", 100], ["Return policy.docx", 100], ["Price list.xlsx", 100]].map(([n, p], k) => (
          <div key={n as string} className="flex items-center gap-2 rounded-lg border border-[#e6ebf3] px-2 py-1.5 text-[10px]">
            <FileText className="h-3.5 w-3.5" style={{ color: ROYAL }} /><span className="flex-1 font-medium">{n}</span>
            <div className="h-1 w-16 overflow-hidden rounded-full bg-[#eef2f7]"><motion.div className="h-full rounded-full" style={{ background: GREEN }} initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ delay: k * 0.3, duration: 0.8 }} /></div>
            <span className="text-[9px] font-semibold" style={{ color: GREEN }}>Indexed</span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-[#1f56d6] px-2 py-1.5 text-[10px]"><Search className="h-3 w-3" style={{ color: ROYAL }} />{q}</div>
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-[#eef3ff] p-2 text-[10px] leading-4 text-[#0b1f4d]">
              <span className="flex items-center gap-1 font-semibold" style={{ color: ROYAL }}><Sparkles className="h-3 w-3" />Answer</span>
              Items can be returned within <mark className="rounded bg-[#fde68a] px-0.5">14 days</mark> with the original bill.
              <span className="mt-1 block text-[9px] text-[#64748b]">Source: Return policy.docx</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AiApprovals() {
  const step = useSteps(3, 900);
  return (
    <div className="flex h-full">
      <StudioSide active="Approvals" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[12px] font-bold text-[#0b1f4d]">Waiting for your approval</p>
        {[["Refund ₹2,400", "Order #2031 arrived with a cracked case — photos attached.", ShieldCheck], ["Send quote", "Bulk order of 40 headphones for an office, 8% discount suggested.", Receipt], ["Book pickup", "Speaker repair pickup on Saturday morning.", Calendar]].map(([t, d, I], k) => {
          const Icon = I as typeof Receipt;
          const done = step > k;
          return (
            <motion.div key={t as string} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.12 }} className="rounded-lg border border-[#e6ebf3] p-2">
              <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" style={{ color: ROYAL }} /><span className="text-[10px] font-semibold">{t as string}</span><span className="ml-auto flex items-center gap-1 text-[9px] text-[#64748b]"><Sparkles className="h-2.5 w-2.5" />Agent suggests</span></div>
              <p className="mt-0.5 text-[9px] text-[#64748b]">{d as string}</p>
              <div className="mt-1.5 flex gap-1.5">
                {done ? <Pill color={GREEN}>Approved</Pill> : <><span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: ROYAL }}><Check className="h-2.5 w-2.5" />Approve</span><span className="flex items-center gap-1 rounded-md border border-[#e6ebf3] px-2 py-0.5 text-[9px] font-semibold text-[#64748b]"><X className="h-2.5 w-2.5" />Reject</span></>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function AiAnalytics() {
  return (
    <div className="flex h-full">
      <StudioSide active="Analytics" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Tasks automated" to={1284} />
          <Kpi label="Hours saved" to={96} delay={0.25} />
          <Kpi label="Avg. reply" to={38} format={(n) => `${Math.round(n)}s`} delay={0.35} />
        </div>
        <Card className="flex flex-1 flex-col p-2"><p className="text-[10px] font-semibold">Conversations handled</p><Line points={[20, 28, 26, 40, 38, 52, 60, 58, 72, 80]} className="mt-1 h-full w-full flex-1" /></Card>
        <Card className="p-2">
          {[["Order status", 82], ["Bookings", 64], ["Product questions", 48]].map(([t, v], k) => (
            <div key={t as string} className="mt-1 first:mt-0"><div className="flex justify-between text-[9px]"><span>{t as string}</span><span className="text-[#64748b]">{v as number}%</span></div><div className="h-1 overflow-hidden rounded-full bg-[#eef2f7]"><motion.div className="h-full rounded-full" style={{ background: ROYAL }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 0.3 + k * 0.15, duration: 0.8 }} /></div></div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const AI_PAGES: TourPage[] = [
  { label: "Workflow", icon: Workflow, Page: AiWorkflow },
  { label: "Chat", icon: MessageSquare, Page: AiChat },
  { label: "Knowledge", icon: BookOpen, Page: AiKnowledge },
  { label: "Approvals", icon: UserCheck, Page: AiApprovals },
  { label: "Analytics", icon: BarChart3, Page: AiAnalytics },
];

export function AiTour({ play }: { play: boolean }) {
  return <Stage className="aspect-[5/4]"><Tour pages={AI_PAGES} play={play} frame={(_, c) => <AppFrame app="AI Agent Studio">{c}</AppFrame>} /></Stage>;
}

/* ===================================================================================================== */
/* GROWTH HUB (digital marketing)                                                                        */
/* ===================================================================================================== */

function HubTop({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eef2f7] px-3 py-2">
      <p className="text-[12px] font-bold text-[#0b1f4d]">{title}</p>
      <span className="flex items-center gap-1.5 text-[9px] text-[#64748b]"><Calendar className="h-3 w-3" />Last 30 days<span className="ml-1 flex items-center gap-1 font-semibold" style={{ color: GREEN }}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />Live</span></span>
    </div>
  );
}

export function MkOverview() {
  return (
    <div className="flex h-full flex-col">
      <HubTop title="Campaign overview" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="grid grid-cols-4 gap-2">
          <Kpi label="Ad spend" to={84000} format={(n) => `₹${Math.round(n / 1000)}k`} />
          <Kpi label="Leads" to={1140} delay={0.25} />
          <Kpi label="Cost / lead" to={74} format={(n) => `₹${Math.round(n)}`} delay={0.35} />
          <Kpi label="ROAS" to={4.6} format={(n) => `${n.toFixed(1)}×`} delay={0.45} tint={GREEN} />
        </div>
        <Card className="flex flex-1 flex-col p-2">
          <div className="flex gap-3 text-[9px]"><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full" style={{ background: ROYAL }} />Leads</span><span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-[#22d3ee]" />Customers</span></div>
          <div className="relative mt-1 flex-1">
            <Line points={[18, 26, 24, 38, 44, 52, 50, 64, 70, 82]} className="absolute inset-0 h-full w-full" />
            <Line points={[8, 12, 12, 18, 22, 26, 28, 34, 38, 46]} color="#22d3ee" fill={false} delay={0.5} className="absolute inset-0 h-full w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MkMeta() {
  const budget = useSteps(10, 140);
  return (
    <div className="flex h-full flex-col">
      <HubTop title="Meta Ads · Instagram & Facebook" />
      <div className="grid flex-1 grid-cols-[1fr_1.1fr] gap-3 p-3">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-1.5 p-2"><span className="h-5 w-5 rounded-full p-[1.5px]" style={{ background: "linear-gradient(135deg,#f59e0b,#e11d48,#7c3aed)" }}><span className="block h-full w-full rounded-full border-2 border-white" style={{ background: ROYAL }} /></span><span className="text-[10px] font-bold">yourbrand</span><span className="text-[9px] text-[#64748b]">Sponsored</span></div>
          <div className="relative h-24 overflow-hidden" style={{ background: STUDIO }}>
            <motion.span className="absolute inset-0 grid place-items-center" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: EASE }}><Headphones finish="sky" className="h-[90%] w-auto" /></motion.span>
            <span className="absolute bottom-1.5 left-1.5 rounded bg-[#0b1f4d] px-1.5 py-0.5 text-[8px] font-bold text-white">20% off this week</span>
          </div>
          <div className="flex items-center gap-2 p-2 text-[9px] text-[#64748b]"><Heart className="h-3.5 w-3.5 fill-[#ef4444] text-[#ef4444]" /><CountUp to={2140} />  <MessageCircle className="h-3.5 w-3.5" />186<span className="ml-auto rounded px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: ROYAL }}>Shop now</span></div>
        </Card>
        <div className="space-y-2">
          <p className="text-[10px] font-semibold">Audience</p>
          <div className="flex flex-wrap gap-1">{["Coimbatore +25 km", "Age 24–45", "Audio lovers", "Online shoppers"].map((c, k) => <motion.span key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + k * 0.1 }} className="rounded-full bg-[#eef3ff] px-2 py-0.5 text-[9px] font-semibold" style={{ color: ROYAL }}>{c}</motion.span>)}</div>
          <p className="text-[10px] font-semibold">Daily budget</p>
          <div className="relative h-1.5 rounded-full bg-[#eef2f7]"><motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: ROYAL }} animate={{ width: `${budget * 6}%` }} /><motion.span className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ background: ROYAL }} animate={{ left: `calc(${budget * 6}% - 6px)` }} /></div>
          <p className="text-[10px] font-bold text-[#0b1f4d]">₹{fmt(500 + budget * 100)} / day · est. {fmt(4000 + budget * 900)} reach</p>
        </div>
      </div>
    </div>
  );
}

export function MkGoogle() {
  return (
    <div className="flex h-full flex-col">
      <HubTop title="Google Ads · Search" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Card className="p-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-[#e6ebf3] px-2.5 py-1 text-[10px] text-[#64748b]"><Search className="h-3 w-3" />headphones near me</div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2">
            <p className="text-[9px] text-[#0b1f4d]"><b>Sponsored</b> · yourbusiness.com</p>
            <p className="text-[12px] font-semibold text-[#1a0dab]">Wireless Headphones in Coimbatore | Free Delivery</p>
            <p className="text-[9px] text-[#4d5156]">Shop online or visit our store. 20% off this week.</p>
          </motion.div>
        </Card>
        <Card className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-[#f8fafc] px-2 py-1 text-[9px] font-semibold uppercase text-[#64748b]"><span>Keyword</span><span>Clicks</span><span>CTR</span><span>Conv.</span></div>
          {[["headphones near me", 820, 6.4, 42], ["smart watch coimbatore", 640, 5.1, 31], ["bluetooth speaker", 410, 4.7, 18], ["noise cancelling headphones", 290, 3.9, 12]].map(([k, c, r, v], i) => (
            <motion.div key={k as string} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-t border-[#eef2f7] px-2 py-1 text-[10px]">
              <span className="truncate font-medium">{k as string}</span><span><CountUp to={c as number} delay={0.3} /></span><span>{(r as number).toFixed(1)}%</span><span style={{ color: GREEN }}><CountUp to={v as number} delay={0.4} /></span>
            </motion.div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const KEYWORDS: [string, number, number][] = [["best headphones under 5000", 18, 3], ["smart watch coimbatore", 24, 5], ["bluetooth speaker price", 12, 2], ["buy earbuds online", 31, 8]];

export function MkSeo() {
  const step = useSteps(1, 900);
  return (
    <div className="flex h-full flex-col">
      <HubTop title="SEO · Search rankings" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Organic visits" to={12600} />
          <Kpi label="Keywords in top 10" to={46} delay={0.25} />
          <Kpi label="Site health" to={96} format={(n) => `${Math.round(n)}/100`} delay={0.35} tint={GREEN} />
        </div>
        <Card className="flex-1 overflow-hidden">
          {KEYWORDS.map(([k, from, to], i) => (
            <div key={k} className="flex items-center gap-2 border-b border-[#eef2f7] px-2 py-1.5 text-[10px] last:border-0">
              <Globe className="h-3 w-3 text-[#94a3b8]" /><span className="flex-1 truncate font-medium">{k}</span>
              <motion.span key={step} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12 }} className="w-8 text-right font-bold text-[#0b1f4d]">#{step ? to : from}</motion.span>
              {step > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }} className="flex items-center text-[9px] font-bold" style={{ color: GREEN }}><ArrowUp className="h-3 w-3" />{from - to}</motion.span>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const LEADS = [
  ["Kavya M.", "Meta Ads", "#1877f2"], ["Suresh P.", "Google Ads", "#ea4335"], ["Anitha R.", "SEO", GREEN], ["Vikram S.", "WhatsApp", "#25d366"], ["Divya K.", "Meta Ads", "#1877f2"],
];

function MkLeads() {
  const n = useSteps(LEADS.length, 600);
  return (
    <div className="relative flex h-full flex-col">
      <HubTop title="Leads & funnel" />
      <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-3 p-3">
        <div className="flex flex-col justify-center gap-1.5">
          {[["Visitors", 100], ["Engaged", 72], ["Leads", 46], ["Customers", 24]].map(([l, w], k) => (
            <div key={l as string} className="flex flex-col items-center">
              <motion.div className="flex h-6 items-center justify-center rounded-md text-[9px] font-bold text-white" style={{ background: k === 3 ? "#22d3ee" : ROYAL, opacity: 1 - k * 0.12 }} initial={{ width: "20%" }} animate={{ width: `${w}%` }} transition={{ delay: k * 0.15, duration: 0.6, ease: EASE }}>{l as string}</motion.div>
            </div>
          ))}
        </div>
        <Card className="overflow-hidden">
          <p className="border-b border-[#eef2f7] px-2 py-1.5 text-[10px] font-semibold">New leads</p>
          <AnimatePresence initial={false}>
            {LEADS.slice(0, n).reverse().map(([who, src, c]) => (
              <motion.div key={who} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-1.5 border-b border-[#eef2f7] px-2 py-1 text-[10px] last:border-0">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#eef3ff] text-[8px] font-bold" style={{ color: ROYAL }}>{who[0]}</span>
                <span className="flex-1 font-medium">{who}</span><Pill color={c}>{src}</Pill>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      </div>
      <Toast show={n >= 2 && n < LEADS.length}><Target className="h-3.5 w-3.5" style={{ color: ROYAL }} />New lead from {LEADS[Math.max(0, n - 1)][1]}</Toast>
    </div>
  );
}

const MK_PAGES: TourPage[] = [
  { label: "Overview", icon: TrendingUp, Page: MkOverview },
  { label: "Meta Ads", icon: ThumbsUp, Page: MkMeta },
  { label: "Google Ads", icon: Search, Page: MkGoogle },
  { label: "SEO", icon: Globe, Page: MkSeo },
  { label: "Leads", icon: Filter, Page: MkLeads },
];

export function MarketingTour({ play }: { play: boolean }) {
  return <Stage className="aspect-[5/4]"><Tour pages={MK_PAGES} play={play} frame={(_, c) => <AppFrame app="Growth Hub">{c}</AppFrame>} /></Stage>;
}

/* ===================================================================================================== */
/* BUSINESS SUITE (custom software & desktop apps)                                                       */
/* ===================================================================================================== */

function SuiteSide({ active }: { active: string }) {
  const items = [{ I: LayoutDashboard, t: "Dashboard" }, { I: Boxes, t: "Inventory" }, { I: KanbanSquare, t: "Orders" }, { I: Receipt, t: "Billing" }, { I: Users, t: "HR" }];
  return (
    <div className="flex w-[19%] flex-col gap-1 bg-[#0b1f4d] p-2 text-white">
      {items.map(({ I, t }) => (
        <span key={t} className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px]">
          {t === active && <motion.span layoutId="suite-tour-active" className="absolute inset-0 rounded-md bg-white/15" />}
          <I className="relative h-3 w-3" /><span className="relative">{t}</span>
        </span>
      ))}
      <span className="mt-auto flex items-center gap-1 text-[9px] text-white/60"><CheckCircle2 className="h-3 w-3" />Synced</span>
    </div>
  );
}

export function SwDashboard() {
  return (
    <div className="flex h-full">
      <SuiteSide active="Dashboard" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Kpi label="Sales today" to={186400} format={(n) => `₹${fmt(n)}`} />
          <Kpi label="Open orders" to={42} delay={0.25} />
          <Kpi label="Stock value" to={9.8} format={(n) => `₹${n.toFixed(1)}L`} delay={0.35} />
        </div>
        <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-2">
          <Card className="flex flex-col p-2"><p className="text-[10px] font-semibold">Monthly sales</p><Bars values={[40, 55, 48, 62, 70, 66, 78, 84, 80, 92]} className="mt-1 flex-1" /></Card>
          <Card className="p-2">
            <p className="text-[10px] font-semibold">Branches</p>
            {[["Main store", 64], ["Branch 2", 22], ["Online", 14]].map(([b, v], k) => (
              <div key={b as string} className="mt-1.5"><div className="flex justify-between text-[9px]"><span>{b as string}</span><span className="text-[#64748b]">{v as number}%</span></div><div className="h-1 overflow-hidden rounded-full bg-[#eef2f7]"><motion.div className="h-full rounded-full" style={{ background: [ROYAL, "#7c3aed", "#22d3ee"][k] }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 0.3 + k * 0.15, duration: 0.8 }} /></div></div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function SwInventory() {
  const live = useLive(420, 6, 800);
  const step = useSteps(2, 1200);
  return (
    <div className="relative flex h-full">
      <SuiteSide active="Inventory" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between"><p className="text-[12px] font-bold text-[#0b1f4d]">Inventory</p><span className="flex items-center gap-1 rounded-full border border-[#e6ebf3] px-2 py-0.5 text-[9px] text-[#64748b]"><Search className="h-2.5 w-2.5" />Search items</span></div>
        <Card className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-[#f8fafc] px-2 py-1 text-[9px] font-semibold uppercase text-[#64748b]"><span>Item</span><span>SKU</span><span>Stock</span><span>Status</span></div>
          {[["Wireless headphones", "HP-101", live, "In stock", GREEN], ["Smart watches", "SW-204", 38, "Low", "#d97706"], ["Bluetooth speakers", "BS-330", 156, "In stock", GREEN], ["USB-C chargers", "UC-012", step >= 2 ? 120 : 0, step >= 2 ? "Restocked" : "Reorder", step >= 2 ? ROYAL : "#e11d48"], ["Phone cases", "PC-077", 64, "In stock", GREEN]].map(([n, sku, q, st, c], i) => (
            <motion.div key={n as string} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-t border-[#eef2f7] px-2 py-1 text-[10px] hover:bg-[#f8fafc]">
              <span className="font-medium">{n as string}</span><span className="text-[#64748b]">{sku as string}</span><span className="tabular-nums">{q as number}</span><Pill color={c as string}>{st as string}</Pill>
            </motion.div>
          ))}
        </Card>
      </div>
      <Toast show={step === 1}><Boxes className="h-3.5 w-3.5 text-[#e11d48]" />USB-C chargers out of stock — reorder sent</Toast>
    </div>
  );
}

const COLS = ["New", "Packing", "Shipped"];
const CARDS = [["#2043", "5 items"], ["#2044", "2 items"], ["#2045", "1 item"]];

export function SwOrders() {
  const step = useSteps(3, 900);
  // each step moves one order one column to the right
  const col = (k: number) => Math.min(2, Math.max(0, step - k));
  return (
    <div className="flex h-full">
      <SuiteSide active="Orders" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[12px] font-bold text-[#0b1f4d]">Orders board</p>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {COLS.map((c, ci) => (
            <div key={c} className="flex flex-col gap-1.5 rounded-lg bg-[#f1f5f9] p-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#64748b]">{c}</span>
              {CARDS.map(([id, items], k) => col(k) === ci && (
                <motion.div key={id} layoutId={`order-${id}`} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="rounded-md border border-[#e6ebf3] bg-white p-1.5 shadow-sm">
                  <p className="text-[10px] font-bold">{id}</p><p className="text-[9px] text-[#64748b]">{items}</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#eef2f7]"><div className="h-full rounded-full" style={{ width: `${(ci + 1) * 33}%`, background: ci === 2 ? GREEN : ROYAL }} /></div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SwBilling() {
  const step = useSteps(5, 450);
  const lines = [["Wireless headphones × 20", 69980], ["Smart watches × 5", 24995], ["Delivery", 0]] as const;
  const done = step >= 5;
  return (
    <div className="relative flex h-full">
      <SuiteSide active="Billing" />
      <div className="flex flex-1 items-start justify-center bg-[#f8fafc] p-3">
        <Card className="w-[86%] p-3 shadow-[0_12px_30px_-16px_rgba(11,31,77,0.4)]">
          <div className="flex items-start justify-between"><div><p className="text-[13px] font-black text-[#0b1f4d]">INVOICE</p><p className="text-[9px] text-[#64748b]">INV-1043 · 19 Oct 2026</p></div><span className="grid h-7 w-7 place-items-center rounded-md bg-[#0b1f4d]"><span className="h-3 w-3 rounded-sm bg-[#22d3ee]" /></span></div>
          <p className="mt-2 text-[9px] text-[#64748b]">Bill to: Corporate order · Coimbatore</p>
          <div className="mt-2 space-y-1 border-t border-[#eef2f7] pt-2">
            {lines.slice(0, Math.min(step, lines.length)).map(([d, a]) => (
              <motion.div key={d} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-[10px]"><span>{d}</span><span>{a ? `₹${fmt(a)}` : "Free"}</span></motion.div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-[#eef2f7] pt-2 text-[10px] text-[#64748b]"><span>GST 18%</span><span>{step >= 4 ? "₹17,096" : "—"}</span></div>
          <div className="flex justify-between text-[12px] font-bold text-[#0b1f4d]"><span>Total</span><span>{step >= 4 ? <>₹<CountUp to={112071} delay={0} /></> : "—"}</span></div>
          <motion.div animate={{ backgroundColor: done ? GREEN : ROYAL }} className="mt-2 flex items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-bold text-white">{done ? <><Check className="h-3 w-3" strokeWidth={3} />PDF sent to customer</> : <><FileText className="h-3 w-3" />Generate PDF</>}</motion.div>
        </Card>
      </div>
    </div>
  );
}

const STAFF = [["Arun", "09:02", GREEN], ["Meena", "09:10", GREEN], ["Karthik", "09:24", "#d97706"], ["Divya", "—", "#94a3b8"], ["Suresh", "08:58", GREEN]] as const;

export function SwHr() {
  const n = useSteps(STAFF.length, 450);
  const present = STAFF.slice(0, n).filter((s) => s[1] !== "—").length;
  return (
    <div className="flex h-full">
      <SuiteSide active="HR" />
      <div className="flex flex-1 gap-3 p-3">
        <Card className="flex-1 overflow-hidden">
          <p className="border-b border-[#eef2f7] px-2 py-1.5 text-[10px] font-semibold">Attendance · today</p>
          {STAFF.map(([who, t, c], k) => (
            <div key={who} className="flex items-center gap-2 border-b border-[#eef2f7] px-2 py-1.5 text-[10px] last:border-0">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#eef3ff] text-[8px] font-bold" style={{ color: ROYAL }}>{who[0]}</span>
              <span className="flex-1 font-medium">{who}</span>
              {k < n ? <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: c }}><Clock className="h-2.5 w-2.5" />{t === "—" ? "On leave" : t}</motion.span> : <span className="text-[9px] text-[#cbd5e1]">…</span>}
            </div>
          ))}
        </Card>
        <div className="flex w-[34%] flex-col items-center justify-center gap-1">
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15" fill="none" stroke="#eef2f7" strokeWidth="4" />
              <motion.circle cx="18" cy="18" r="15" fill="none" stroke={GREEN} strokeWidth="4" strokeLinecap="round" animate={{ pathLength: present / STAFF.length }} transition={{ duration: 0.4 }} />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[14px] font-black text-[#0b1f4d]">{present}/{STAFF.length}</span>
          </div>
          <p className="text-[10px] font-semibold">Present today</p>
          <span className="mt-1 flex items-center gap-1 rounded-full bg-[#eef3ff] px-2 py-0.5 text-[9px] font-semibold" style={{ color: ROYAL }}><Megaphone className="h-2.5 w-2.5" />Payroll ready</span>
        </div>
      </div>
    </div>
  );
}

const SW_PAGES: TourPage[] = [
  { label: "Dashboard", icon: LayoutDashboard, Page: SwDashboard },
  { label: "Inventory", icon: Boxes, Page: SwInventory },
  { label: "Orders", icon: KanbanSquare, Page: SwOrders },
  { label: "Billing", icon: Receipt, Page: SwBilling },
  { label: "HR", icon: Users, Page: SwHr },
];

export function SoftwareTour({ play }: { play: boolean }) {
  return <Stage className="aspect-[5/4]"><Tour pages={SW_PAGES} play={play} frame={(_, c) => <AppFrame app="Business Suite">{c}</AppFrame>} /></Stage>;
}
