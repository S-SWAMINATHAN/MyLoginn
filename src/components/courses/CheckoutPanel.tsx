"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedShield } from "@/components/ui/icons/AnimatedShield";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";

type CheckoutCourse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Amount to charge now, decided on the server (renewal price for renewals). */
  price: number;
  originalPrice: number | null;
  kind?: "purchase" | "renewal";
  /** Access days this payment grants; null/undefined = lifetime. */
  validityDays?: number | null;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

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

export function CheckoutPanel({ course }: { course: CheckoutCourse }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const renewal = course.kind === "renewal";
  const validityLabel = course.validityDays ? `${course.validityDays} days of access from payment (stacks on any time you have left)` : "Lifetime access";

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load the payment widget. Check your connection and try again.");
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderJson.error ?? "Could not start checkout");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency,
        order_id: orderJson.orderId,
        name: "MyLoginn",
        description: course.title,
        theme: { color: "#6c4dff" },
        handler: async (response: RazorpaySuccessResponse) => {
          setLoading(true);
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyJson = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok) {
            setError(verifyJson.error ?? "Payment verification failed");
            setLoading(false);
            return;
          }
          // 202 / "pending": money is not confirmed yet, so nothing is unlocked.
          if (verifyJson.status !== "paid") {
            setPending(true);
            setLoading(false);
            return;
          }
          setDone(true);
          setTimeout(() => {
            router.push(`/courses/${course.slug}?enrolled=1`);
            router.refresh();
          }, 1400);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // Tell the server the untouched order was abandoned; a later webhook can still settle it if money did move.
            void fetch("/api/payments/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: orderJson.orderId }) }).catch(() => undefined);
          },
        },
      });
      razorpay.open();
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-lg font-semibold">Payment is being confirmed</p>
        <p className="text-sm text-muted">Your bank has not confirmed the payment yet. Your course unlocks automatically once it is verified; this can take a few minutes. You will not be charged twice.</p>
        <Button onClick={() => router.push(`/courses/${course.slug}`)}>Back to the course</Button>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <AnimatedSuccess once className="h-14.5 w-14.5" />
        <p className="text-lg font-semibold">Payment successful!</p>
        <p className="text-sm text-muted">Redirecting you to your course…</p>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="p-6 sm:p-8">
        <h1 className="text-lg font-semibold">Checkout</h1>
        <div className="mt-6 flex items-center gap-4 border-b border-border-soft pb-6">
          <CourseIconThumb category={course.category} title={course.title} variant="round" className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{course.category}</p>
            <p className="font-medium leading-snug">{course.title}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted">Type</dt><dd className="font-medium">{renewal ? "Access renewal" : "One-time purchase"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Validity</dt><dd className="text-right font-medium">{validityLabel}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted">Renewal</dt><dd className="text-right font-medium">Manual: no automatic charges. You choose whether to renew.</dd></div>
        </dl>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted">{renewal ? "Renewal price" : "Course price"}</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{course.price.toLocaleString("en-IN")}</span>
            {course.originalPrice && (
              <span className="text-xs text-muted line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button className="mt-8 w-full" size="lg" onClick={handlePay} disabled={loading}>
          {loading ? "Opening payment…" : `${renewal ? "Renew for" : "Pay"} ₹${course.price.toLocaleString("en-IN")} with Razorpay`}
        </Button>

        <p className="group mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <AnimatedShield className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125" /> Secured by Razorpay
        </p>
      </Card>
    </motion.div>
  );
}
