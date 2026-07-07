"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AnimatedAi } from "@/components/ui/icons/AnimatedAi";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";

export function AiAssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI Assistant"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-surface-2/60 cursor-pointer transition-colors duration-200 hover:border-brand-400"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full brand-gradient-bg opacity-25 blur-md animate-pulse" />
        <span className="pointer-events-none absolute -right-1 -top-1">
          <AnimatedSparkle className="h-3.5 w-3.5" />
        </span>
        <AnimatedAi className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AnimatedAi className="h-5.5 w-5.5" />
                <p className="text-sm font-semibold">AI Assistant</p>
              </div>
              <button onClick={() => setOpen(false)} className="group cursor-pointer rounded-full p-1 hover:bg-surface-2" aria-label="Close">
                <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">Your AI agent will connect here soon.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
