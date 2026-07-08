"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { AnimatedClose } from "@/components/ui/icons/AnimatedClose";
import { AnimatedWarning } from "@/components/ui/icons/AnimatedWarning";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

/* ── Modal ──────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative m-0 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)] sm:m-4 sm:rounded-3xl",
              wide ? "sm:max-w-2xl" : "sm:max-w-lg"
            )}
          >
            <div className="flex items-start gap-3 border-b border-border-soft px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto shrink-0 cursor-pointer rounded-full p-1.5 transition-transform duration-200 hover:scale-110 hover:bg-surface-2 active:scale-90"
              >
                <AnimatedClose className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Confirmation dialog (every add / modify / delete goes through it) ─ */

export type ConfirmState = {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
} | null;

export function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!state) return;
    setBusy(true);
    try {
      await state.onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {state && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={busy ? undefined : onClose}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative w-full max-w-sm rounded-3xl border border-border-soft bg-surface p-6 text-center shadow-[var(--shadow-lift)]"
          >
            <span
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
                state.tone === "danger" ? "bg-danger/10" : "bg-brand-50 dark:bg-brand-900/25"
              )}
            >
              {state.tone === "danger" ? (
                <AnimatedWarning className="h-8 w-8" />
              ) : (
                <AnimatedSuccess className="h-8 w-8" />
              )}
            </span>
            <h3 className="mt-4 text-base font-semibold">{state.title}</h3>
            <div className="mt-1.5 text-sm text-muted">{state.message}</div>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="sm" variant="secondary" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button size="sm" variant={state.tone === "danger" ? "danger" : "primary"} onClick={run} disabled={busy}>
                {busy ? "Working…" : state.confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Toasts ─────────────────────────────────────────────────────────── */

type Toast = { id: number; kind: "success" | "error"; message: string };

const ToastContext = createContext<(kind: Toast["kind"], message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[var(--shadow-lift)] backdrop-blur-xl",
                t.kind === "success"
                  ? "border-success/25 bg-surface text-foreground"
                  : "border-danger/30 bg-surface text-danger"
              )}
            >
              {t.kind === "success" ? (
                <AnimatedSuccess className="h-5 w-5 shrink-0" once />
              ) : (
                <AnimatedWarning className="h-5 w-5 shrink-0" />
              )}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
