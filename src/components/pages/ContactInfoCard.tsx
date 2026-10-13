"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";

type Phone = { display: string; tel: string };

function Row({ Icon, color, label, children }: { Icon: LucideIcon; color: string; label: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group flex items-start gap-3.5 rounded-2xl border border-border-soft bg-surface p-3.5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--c)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--c)_5%,var(--surface))]"
      style={{ "--c": color } as React.CSSProperties}
    >
      <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_14%,transparent)] text-[var(--c)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--c)_14%,transparent)]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        {children}
      </div>
    </motion.div>
  );
}

/** Contact details as interactive rows: copy the email with one click, tap a number to call, open WhatsApp. */
export function ContactInfoCard({ email, phones, whatsappHref, hours }: { email: string; phones: Phone[]; whatsappHref: string; hours: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable: the address is still a mailto link
    }
  }

  return (
    <section aria-labelledby="contact-information" className="rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <span className="story-eyebrow">Reach us directly</span>
      <h2 id="contact-information" className="mt-2 text-xl font-semibold tracking-tight text-story-navy">Contact information</h2>
      <div className="mt-4 grid gap-3">
        <Row Icon={Mail} color="#2563eb" label="Email">
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={`mailto:${email}`} className="break-all text-sm font-semibold text-story-royal hover:underline">{email}</a>
            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? "Email address copied" : "Copy email address"}
              title={copied ? "Copied" : "Copy email"}
              className={`grid h-7 w-7 place-items-center rounded-full border border-border-soft text-muted transition-all duration-200 hover:border-story-royal hover:text-story-royal focus-visible:opacity-100 pointer-coarse:opacity-100 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={copied ? "done" : "copy"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }} className="grid place-items-center">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </Row>
        <Row Icon={Phone} color="#059669" label="Call us">
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`} className="text-sm font-semibold text-story-royal hover:underline">{p.display}</a>)}
          </div>
          <p className="mt-1 text-xs text-muted">{hours}</p>
        </Row>
        <Row Icon={MessageCircle} color="#16a34a" label="WhatsApp">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal hover:underline">
            Start a chat <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Row>
      </div>
    </section>
  );
}
