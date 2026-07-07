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
  price: number;
  originalPrice: number | null;
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
          if (!verifyRes.ok) {
            const verifyJson = await verifyRes.json();
            setError(verifyJson.error ?? "Payment verification failed");
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
          ondismiss: () => setLoading(false),
        },
      });
      razorpay.open();
    } finally {
      setLoading(false);
    }
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

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted">Course price</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">₹{course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <span className="text-xs text-muted line-through">₹{course.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button className="mt-8 w-full" size="lg" onClick={handlePay} disabled={loading}>
          {loading ? "Opening payment…" : `Pay ₹${course.price.toLocaleString()} with Razorpay`}
        </Button>

        <p className="group mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <AnimatedShield className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125" /> Secured by Razorpay
        </p>
      </Card>
    </motion.div>
  );
}
