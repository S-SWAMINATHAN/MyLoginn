"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  BookOpen,
  Bot,
  Briefcase,
  Code2,
  Check,
  Copy,
  Headset,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  Square,
  Megaphone,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { cn } from "@/lib/cn";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";

/** Dispatched by the navbar button (and anywhere else) to open the agent. */
export const OPEN_AGENT_EVENT = "myloginn:open-agent";

type ChatMessage = { role: "user" | "assistant"; content: string };

/** The first four are shown on the welcome screen; the rest are offered as follow-ups. */
const SUGGESTIONS: { text: string; icon: LucideIcon }[] = [
  { text: "What development services do you offer?", icon: Code2 },
  { text: "How can digital marketing grow my business?", icon: Megaphone },
  { text: "Can you build an AI chatbot for my business?", icon: Bot },
  { text: "How do I get a quote?", icon: Headset },
  { text: "Do you offer software testing and automation?", icon: ShieldCheck },
  { text: "Can you improve my existing website or app?", icon: Briefcase },
  { text: "Can you build a desktop application for us?", icon: MessageCircle },
  { text: "What is MyLoginn Learn?", icon: BookOpen },
];

const INITIAL_COUNT = 4;

const GREETING =
  "Hi! I'm the MyLoginn AI agent. Ask me about our web, app, desktop, AI and marketing solutions, starting a project, or MyLoginn Learn — I'm happy to help!";

const MAX_CHARS = 2000;

/* ------------------------------------------------------------------ */
/* Lightweight rich-text: bold, links, emails, phones, site paths, lists */
/* ------------------------------------------------------------------ */

const TOKEN =
  /(\*\*[^*\n]+\*\*)|([\w.+-]+@[\w-]+\.[\w.]*\w)|(https?:\/\/[^\s)]+)|(\+?\d[\d\s-]{8,13}\d)|(\/(?:courses|internships|projects|tutoring|contact|signup|login|services(?:\/[\w-]+)?)(?![\w/-]))/g;

const linkCls = "font-medium text-brand-500 underline decoration-brand-400/40 underline-offset-2 hover:decoration-brand-500";

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of line.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    const tok = m[0];
    const key = `${keyPrefix}-${n++}`;
    let node: ReactNode = null;
    if (m[1]) node = <strong key={key}>{tok.slice(2, -2)}</strong>;
    else if (m[2])
      node = (
        <a key={key} href={`mailto:${tok}`} className={linkCls}>
          {tok}
        </a>
      );
    else if (m[3])
      node = (
        <a key={key} href={tok} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {tok}
        </a>
      );
    else if (m[4]) {
      const digits = tok.replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 13)
        node = (
          <a key={key} href={`tel:${tok.trim().startsWith("+") ? "+" : ""}${digits}`} className={linkCls}>
            {tok}
          </a>
        );
    } else if (m[5])
      node = (
        <Link key={key} href={tok} className={linkCls}>
          {tok}
        </Link>
      );
    if (!node) continue;
    if (idx > last) out.push(line.slice(last, idx));
    out.push(node);
    last = idx + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = (i: number) => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${i}`} className="my-1 space-y-1">
        {list.map((item, j) => (
          <li key={j} className="flex gap-2">
            <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full brand-gradient-bg" />
            <span className="min-w-0">{renderInline(item, `li-${i}-${j}`)}</span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };
  lines.forEach((raw, i) => {
    const bullet = raw.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flush(i);
    if (raw.trim() === "") return;
    blocks.push(
      <p key={`p-${i}`} className="break-words">
        {renderInline(raw, `p-${i}`)}
      </p>
    );
  });
  flush(lines.length);
  return <div className="space-y-2 leading-relaxed">{blocks}</div>;
}

/* ------------------------------------------------------------------ */

export function AiAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_AGENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_AGENT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep pinned to the newest text while streaming, unless the user scrolled up to read.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottom) el.scrollTo({ top: el.scrollHeight });
  }, [messages, open, atBottom]);

  // Auto-grow the composer up to ~4 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
  };

  const stop = () => abortRef.current?.abort();

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setLoading(false);
    inputRef.current?.focus();
  };

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading) return;

      const history: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);
      setAtBottom(true);

      const appendToReply = (updater: (prev: string) => string) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: updater(last.content) };
          return next;
        });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          appendToReply(() => data?.error ?? "Something went wrong on our side. Please try again in a moment.");
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) appendToReply((prev) => prev + chunk);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          appendToReply((prev) =>
            prev ? prev : "I couldn't reach the server. Please check your connection and try again."
          );
        } else {
          appendToReply((prev) => prev || "Stopped.");
        }
      } finally {
        abortRef.current = null;
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const lastIdx = messages.length - 1;
  const lastReply = messages[lastIdx];
  const replyDone = !loading && lastReply?.role === "assistant" && lastReply.content !== "";
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const followUps = SUGGESTIONS.filter((s) => !asked.has(s.text)).slice(0, 3);
  const showContactActions = replyDone && /contact|call|email|whatsapp|phone|reach|quote|proposal|enquiry/i.test(lastReply.content);

  return (
    <>
      {/* Chat panel — anchored to the bottom-right corner on every breakpoint */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            role="dialog"
            aria-label="MyLoginn AI agent chat"
            className={cn(
              "fixed z-[70] flex origin-bottom-right flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)]",
              // Phones / tablets: a sheet docked just above the bottom tab bar (the launcher hides while it is open).
              "inset-x-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] h-[min(40rem,calc(100dvh-6.5rem-env(safe-area-inset-bottom)))]",
              "sm:inset-x-auto sm:right-4 sm:w-[26rem]",
              // Desktop: floats above the launcher, bottom-right.
              "lg:right-6 lg:bottom-[5.75rem] lg:h-[min(40rem,calc(100dvh-8rem))] xl:w-[28rem]"
            )}
          >
            {/* ambient gradient glow */}
            <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(31,86,214,0.2),transparent_70%)]" />

            {/* Header */}
            <div className="relative flex items-center gap-3 border-b border-border-soft px-4 py-3">
              <span className="relative flex h-10 w-10 items-center justify-center">
                <AnimatedAgent className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">MyLoginn AI Agent</p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Online — ask anything about MyLoginn
                </p>
              </div>
              <button
                onClick={reset}
                disabled={messages.length === 0}
                aria-label="Start a new chat"
                title="New chat"
                className="group cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <RotateCcw className="h-4 w-4 transition-transform duration-300 group-enabled:group-hover:-rotate-180" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="group cursor-pointer rounded-full p-1.5 text-danger transition-colors hover:bg-danger/10"
              >
                <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Messages */}
            <div className="relative min-h-0 flex-1">
              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="h-full space-y-3 overflow-y-auto overscroll-contain bg-surface-2/30 px-4 py-4"
                aria-live="polite"
              >
                <AgentBubble text={GREETING} plain />

                {messages.length === 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-1 pl-9">
                    {SUGGESTIONS.slice(0, INITIAL_COUNT).map(({ text, icon: Icon }, i) => (
                      <motion.button
                        key={text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        onClick={() => send(text)}
                        className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-3 py-1.5 text-left text-xs font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md active:scale-[0.98]"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {text}
                      </motion.button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[85%] rounded-2xl rounded-br-md brand-gradient-bg px-3.5 py-2.5 text-sm text-white shadow-[0_4px_14px_rgba(31,86,214,0.3)]">
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <AgentBubble
                      key={i}
                      text={m.content}
                      typing={loading && i === lastIdx && m.content === ""}
                      copyable={!(loading && i === lastIdx)}
                    />
                  )
                )}

                {showContactActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pl-9"
                  >
                    <ActionLink href={`tel:${CONTACT_PHONES[0].tel}`} icon={Phone} label="Call" />
                    <ActionLink
                      href={`https://wa.me/${WHATSAPP_PHONE.replace(/\D/g, "")}`}
                      icon={MessageCircle}
                      label="WhatsApp"
                      external
                    />
                    <ActionLink href={`mailto:${CONTACT_EMAIL}`} icon={Mail} label="Email" />
                  </motion.div>
                )}

                {replyDone && followUps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pl-9"
                  >
                    {followUps.map(({ text }) => (
                      <button
                        key={text}
                        onClick={() => send(text)}
                        className="cursor-pointer rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:border-brand-400 hover:text-brand-500 active:scale-95"
                      >
                        {text}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {!atBottom && messages.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    aria-label="Scroll to latest message"
                    className="absolute bottom-3 left-1/2 flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface shadow-lg transition-transform hover:scale-110"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border-soft bg-surface p-3 pb-2"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-border-soft bg-surface-2/60 py-1.5 pr-1.5 pl-3.5 transition-all focus-within:border-brand-400 focus-within:shadow-[0_0_0_3px_rgba(31,86,214,0.12)]">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask about our services, a project…"
                  aria-label="Message"
                  className="max-h-24 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm leading-5 outline-none placeholder:text-muted"
                />
                {loading ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop generating"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-foreground text-surface transition-transform hover:scale-105 active:scale-95"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl brand-gradient-bg text-white shadow-[0_4px_14px_rgba(31,86,214,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    <Send className="h-4 w-4 -translate-x-px" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted">
                <span>Enter to send · Shift+Enter for new line</span>
                {input.length > MAX_CHARS * 0.8 && (
                  <span className={input.length >= MAX_CHARS ? "text-danger" : undefined}>
                    {input.length}/{MAX_CHARS}
                  </span>
                )}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher — bottom-right end corner; lifted above the mobile bottom nav */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI agent chat" : "Open AI agent chat"}
        aria-expanded={open}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "group fixed z-[70] flex h-14 w-14 cursor-pointer items-center justify-center bg-transparent transition-transform duration-300",
          "right-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:right-6 lg:bottom-6",
          open && "max-lg:hidden"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="agent"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative transition-transform duration-300 group-hover:scale-110"
            >
              <AnimatedAgent className="h-11 w-11" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-1.5 rounded-full brand-gradient-bg px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(31,86,214,0.3)] transition-all hover:scale-105 active:scale-95"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function AgentBubble({
  text,
  typing,
  plain,
  copyable,
}: {
  text: string;
  typing?: boolean;
  plain?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group/msg flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <AnimatedAgent className="h-6 w-6" />
      </span>
      <div className="relative max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-surface px-3.5 py-2.5 text-sm shadow-sm">
        {typing ? (
          <span className="flex items-center gap-1 py-1" aria-label="Agent is typing">
            {[0, 0.15, 0.3].map((d) => (
              <motion.span
                key={d}
                className="h-1.5 w-1.5 rounded-full brand-gradient-bg"
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: d }}
              />
            ))}
          </span>
        ) : plain ? (
          <p className="leading-relaxed">{text}</p>
        ) : (
          <Fragment>
            <RichText text={text} />
            {copyable && text && (
              <button
                onClick={copy}
                aria-label="Copy reply"
                className="absolute -right-2 -bottom-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface text-muted opacity-0 shadow-sm transition-all hover:text-brand-500 focus-visible:opacity-100 group-hover/msg:opacity-100"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </Fragment>
        )}
      </div>
    </motion.div>
  );
}
