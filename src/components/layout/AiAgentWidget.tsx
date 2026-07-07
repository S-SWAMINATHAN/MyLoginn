"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { cn } from "@/lib/cn";

/** Dispatched by the navbar button (and anywhere else) to open the agent. */
export const OPEN_AGENT_EVENT = "myloginn:open-agent";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What courses do you offer?",
  "Are there paid internships?",
  "How does tutoring work?",
  "How can I contact you?",
];

const GREETING =
  "Hi! I'm the MyLoginn AI agent. Ask me anything about our courses, internships, tutoring, or services — I'm happy to help!";

export function AiAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading) return;

      const history: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

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
        }
      } finally {
        abortRef.current = null;
        setLoading(false);
      }
    },
    [messages, loading]
  );

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
              "right-3 bottom-[calc(9.25rem+env(safe-area-inset-bottom))] left-3 h-[min(30rem,calc(100dvh-13.5rem))]",
              "sm:left-auto sm:w-[24rem]",
              "lg:right-6 lg:bottom-[5.75rem] lg:h-[min(34rem,calc(100dvh-8rem))]"
            )}
          >
            {/* ambient gradient glow */}
            <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(108,77,255,0.2),transparent_70%)]" />

            {/* Header */}
            <div className="relative flex items-center gap-3 border-b border-border-soft px-4 py-3">
              <span className="relative flex h-10 w-10 items-center justify-center">
                <span className="pointer-events-none absolute inset-0 rounded-full brand-gradient-bg opacity-20 blur-md animate-pulse" />
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
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="group cursor-pointer rounded-full p-1.5 transition-colors hover:bg-surface-2"
              >
                <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="relative flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
              <AgentBubble text={GREETING} />

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="cursor-pointer rounded-full border border-border-soft bg-surface-2/60 px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:border-brand-400 hover:text-brand-500 active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md brand-gradient-bg px-3.5 py-2.5 text-sm text-white shadow-[0_4px_14px_rgba(108,77,255,0.3)]">
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                ) : (
                  <AgentBubble
                    key={i}
                    text={m.content}
                    typing={loading && i === messages.length - 1 && m.content === ""}
                  />
                )
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="relative border-t border-border-soft p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-border-soft bg-surface-2/60 px-3 py-1.5 transition-colors focus-within:border-brand-400">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={2000}
                  placeholder="Ask about courses, internships…"
                  className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full brand-gradient-bg text-white shadow-[0_4px_14px_rgba(108,77,255,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send className="h-3.5 w-3.5 -translate-x-px" />
                </button>
              </div>
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
          "group fixed z-[70] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-border-soft bg-surface shadow-[var(--shadow-lift)] transition-colors duration-300 hover:border-brand-400",
          "right-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:right-6 lg:bottom-6"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full brand-gradient-bg blur-md transition-opacity duration-300",
            open ? "opacity-10" : "opacity-30 animate-pulse"
          )}
        />
        {!open && (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5">
            <AnimatedSparkle className="h-4 w-4" />
          </span>
        )}
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
              <AnimatedAgent className="h-9 w-9" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

function AgentBubble({ text, typing }: { text: string; typing?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <AnimatedAgent className="h-6 w-6" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-surface-2/70 px-3.5 py-2.5 text-sm">
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
        ) : (
          <p className="whitespace-pre-wrap break-words">{text}</p>
        )}
      </div>
    </div>
  );
}
