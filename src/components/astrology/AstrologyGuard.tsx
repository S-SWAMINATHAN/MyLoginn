"use client";

/**
 * Copyright protection and the unlock dialog for the whole Astrology service.
 *
 *  - A fixed watermark sits over every Astrology page: heavy "PREVIEW" text
 *    until the report is paid for, a light copyright mark afterwards. The
 *    content underneath stays fully visible.
 *  - Until the report is paid for, printing, saving, copying, dragging and the
 *    right-click menu are disabled (the print stylesheet also blanks the page).
 *  - The dialog collects the one-time payment through Razorpay.
 *
 * Browser-side protection only deters casual copying: it cannot stop
 * screenshots. The print-quality PDF itself is enforced on the server.
 */
import React, { useEffect, useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
import {
  closeUnlockModal,
  markUnlocked,
  openUnlockModal,
  refreshUnlock,
  usePaywall,
} from "@/lib/astrology/paywall";
import { ASTRO_PRODUCTS, priceInPaise } from "@/lib/astrology/access";
import { ASTRO_PURCHASE_API } from "@/lib/astrology/routes";
import { usePersistentLang } from "@/lib/astrology/useLang";

const COPYRIGHT = "© MyLoginn Tech · Astrology";

const rupees = (paise: number) => (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

function UnlockDialog() {
  const { context, modalOpen, unlocked } = usePaywall();
  const [lang] = usePersistentLang();
  const ta = lang === "ta";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    setError(null);
    void refreshUnlock();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeUnlockModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  if (!modalOpen || !context) return null;
  const product = ASTRO_PRODUCTS[context.product];
  const price = priceInPaise(context.product);

  async function pay() {
    if (!context) return;
    setBusy(true);
    setError(null);
    try {
      if (!(await loadRazorpayScript())) {
        setError("Could not load the payment widget. Check your connection and try again.");
        return;
      }
      const res = await fetch(`${ASTRO_PURCHASE_API}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: context.product, reportKey: context.reportKey }),
      });
      const order = await res.json();
      if (res.status === 409) {
        await refreshUnlock();
        return;
      }
      if (!res.ok) {
        setError(order.error ?? "Could not start the payment");
        return;
      }
      const { product: paidProduct, reportKey } = context;
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "MyLoginn Astrology",
        description: order.description,
        theme: { color: "#1f56d6" },
        handler: async (response: RazorpaySuccess) => {
          const verify = await fetch(`${ASTRO_PURCHASE_API}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (!verify.ok) {
            const j = await verify.json().catch(() => ({}));
            setError(j.error ?? "Payment verification failed");
            setBusy(false);
            return;
          }
          markUnlocked(paidProduct, reportKey);
          setBusy(false);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      razorpay.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      // The Razorpay handler clears `busy` itself once the payment finishes.
      if (!window.Razorpay) setBusy(false);
    }
  }

  return (
    <div className="no-print fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Unlock report">
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-lift">
        <button type="button" onClick={closeUnlockModal} aria-label="Close" className="absolute right-4 top-4 text-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-fg">
            {unlocked ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="text-lg font-semibold leading-tight">
              {ta ? "அச்சிட / பதிவிறக்க திறக்கவும்" : "Unlock print & download"}
            </h2>
            <p className="text-sm text-muted">{ta ? product.labelTa : product.label}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted">
          {ta
            ? "ஒரு முறை கட்டணம் செலுத்தினால் இந்த ஜாதகத்தை எப்போது வேண்டுமானாலும் அச்சிடலாம், பதிவிறக்கலாம்."
            : "Pay once to print and download this report any time. Until then it can be viewed with a watermark."}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border-soft bg-surface-2 p-4 text-sm">
          <span className="text-muted">{ta ? "ஒரு முறை கட்டணம்" : "One-time payment"}</span>
          <span className="text-lg font-semibold">₹{rupees(price)}</span>
        </div>

        {error && <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        {unlocked ? (
          <button type="button" onClick={closeUnlockModal} className="btn-primary mt-5 w-full">
            {ta ? "திறக்கப்பட்டது — தொடரவும்" : "Unlocked — continue"}
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={pay} className="btn-primary mt-5 w-full">
            {busy ? (ta ? "செயல்படுகிறது…" : "Processing…") : ta ? `₹${rupees(price)} செலுத்தவும்` : `Pay ₹${rupees(price)}`}
          </button>
        )}
      </div>
    </div>
  );
}

const isEditable = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export function AstrologyGuard() {
  const { context, unlocked } = usePaywall();
  const hasReport = !!context;
  const locked = hasReport && !unlocked;

  // Mirror the state on <html> so the stylesheet can read it.
  useEffect(() => {
    const el = document.documentElement;
    if (hasReport) el.setAttribute("data-astro-report", "true");
    else el.removeAttribute("data-astro-report");
    if (unlocked) el.setAttribute("data-astro-unlocked", "true");
    else el.removeAttribute("data-astro-unlocked");
    return () => {
      el.removeAttribute("data-astro-report");
      el.removeAttribute("data-astro-unlocked");
    };
  }, [hasReport, unlocked]);

  // Deterrents while a generated report is on screen and unpaid:
  // right-click, copy, cut, drag, Ctrl+P / Ctrl+S.
  useEffect(() => {
    if (!locked) return;
    const stop = (e: Event) => {
      if (!isEditable(e.target)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "p" || k === "s") {
        e.preventDefault();
        openUnlockModal();
      }
    };
    const onBeforePrint = () => openUnlockModal();
    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("dragstart", stop);
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeprint", onBeforePrint);
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("dragstart", stop);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeprint", onBeforePrint);
    };
  }, [locked]);

  return (
    <>
      {/* Shown instead of the page when a locked report is printed. */}
      <div className="astro-print-notice" role="note">
        <strong>{COPYRIGHT}</strong>
        <p>Printing is disabled for this preview. Unlock the report on MyLoginn Astrology to print or download it.</p>
      </div>
      {locked && (
        <button type="button" onClick={openUnlockModal} className="no-print btn-primary fixed bottom-20 right-4 z-[70] shadow-lift md:bottom-6">
          <Lock className="h-4 w-4" /> Unlock print &amp; download
        </button>
      )}
      <UnlockDialog />
    </>
  );
}
