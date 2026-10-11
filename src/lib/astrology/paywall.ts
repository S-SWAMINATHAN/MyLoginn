"use client";

/**
 * Client-side state for the Astrology pay-to-unlock flow.
 *
 * The page that shows a report registers it with `setReportContext`. Every
 * print / download entry point then calls `requireUnlock()`, which returns true
 * only when the buyer has paid for THAT report (no login is needed; the purchase belongs to the browser), and otherwise opens the
 * unlock dialog. This is the user-facing gate; the real enforcement for the
 * print-quality PDF is on the server (src/app/api/astrology/[...path]/route.ts).
 */
import { useSyncExternalStore } from "react";
import type { AstroProduct, ReportAccess } from "@/lib/astrology/access";
import { ASTRO_PURCHASE_API } from "@/lib/astrology/routes";

export type ReportContext = ReportAccess & { title?: string };

type State = {
  context: ReportContext | null;
  unlocked: boolean;
  checking: boolean;
  modalOpen: boolean;
};

let state: State = { context: null, unlocked: false, checking: false, modalOpen: false };
const listeners = new Set<() => void>();
let checkSeq = 0;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getPaywallState(): State {
  return state;
}

export function subscribePaywall(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePaywall(): State {
  return useSyncExternalStore(subscribePaywall, getPaywallState, getPaywallState);
}

/** Re-asks the server whether the current report is paid for. */
export async function refreshUnlock(): Promise<boolean> {
  const ctx = state.context;
  if (!ctx) {
    set({ unlocked: false, checking: false });
    return false;
  }
  const seq = ++checkSeq;
  set({ checking: true });
  try {
    const res = await fetch(`${ASTRO_PURCHASE_API}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: ctx.product, reportKey: ctx.reportKey }),
    });
    const data = (await res.json()) as { unlocked?: boolean };
    if (seq === checkSeq) set({ unlocked: !!data.unlocked, checking: false });
    return !!data.unlocked;
  } catch {
    if (seq === checkSeq) set({ unlocked: false, checking: false });
    return false;
  }
}

/** Call when a report has been generated (or replaced). Pass null when it is cleared. */
export function setReportContext(ctx: ReportContext | null) {
  const same = state.context?.product === ctx?.product && state.context?.reportKey === ctx?.reportKey;
  if (same) return;
  set({ context: ctx, unlocked: false });
  void refreshUnlock();
}

export function openUnlockModal() {
  set({ modalOpen: true });
}

export function closeUnlockModal() {
  set({ modalOpen: false });
}

/** Gate for every print / download. Opens the unlock dialog and returns false when the report is not paid for. */
export function requireUnlock(): boolean {
  // Nothing is registered on pages that show no generated report (e.g. the A-Z name browser).
  if (!state.context || state.unlocked) return true;
  openUnlockModal();
  return false;
}

/** `window.print()` that only runs for an unlocked report. */
export function guardedPrint() {
  if (requireUnlock()) window.print();
}

export function markUnlocked(product: AstroProduct, reportKey: string) {
  if (state.context && state.context.product === product && state.context.reportKey === reportKey) {
    set({ unlocked: true, modalOpen: false });
  }
  // A full-horoscope purchase also covers the single-page sheet; re-ask the server to be exact.
  void refreshUnlock();
}
