"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, SOCIAL_LINKS, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { CORE_SERVICES } from "@/lib/coreServices";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Link data ──────────────────────────────────────────────────────── */

const columns = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Services",
    links: [
      ...CORE_SERVICES.map((s) => ({ href: s.href, label: s.name.replace(" & Desktop Apps", "") })),
      { href: "/services/testing-automation", label: "Testing & Automation" },
    ],
  },
  {
    title: "MyLoginn Learn",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/practice", label: "Practice" },
      { href: "/logiquest", label: "LogiQuest" },
      { href: "/logiquest/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
  facebook: "M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7H17V3.8C16.6 3.7 15.6 3.6 14.5 3.6c-2.6 0-4.3 1.6-4.3 4.4v2.5H7.5v3.3h2.7V22h3.3Z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452Z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z",
};


const contactLinks = [
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, Icon: AnimatedMail },
  ...CONTACT_PHONES.map((p) => ({ label: `+91 ${p.display}`, href: `tel:${p.tel}`, Icon: AnimatedPhone })),
  { label: "WhatsApp us", href: toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team!") ?? "/contact", Icon: AnimatedChat, external: true },
];

/* ── Footer ─────────────────────────────────────────────────────────── */

/**
 * Site footer in the new homepage style: white, solid brand colours and compact spacing. The brand block and the
 * contact chips sit beside four link columns on large screens and stack on small ones.
 */
export function Footer() {

  return (
    <footer className="relative border-t border-border-soft bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 py-10 lg:grid-cols-[1.1fr_2fr] lg:gap-14 lg:py-12">
          {/* brand + contact */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, ease: EASE }}>
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoBadge className="h-9 w-auto" />
              <span>
                <span className="block text-sm font-semibold text-story-navy">MyLoginn Tech Private Limited</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-story-royal">Build · Automate · Grow</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Web, app, AI agents, digital marketing and custom software — one connected team for businesses in India and worldwide.
            </p>

            <ul className="mt-5 flex flex-col gap-3">
              {contactLinks.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex items-center gap-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:text-story-royal"
                  >
                    <c.Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                    <span>{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <ul className="mt-4 flex items-center gap-2" aria-label="MyLoginn on social media">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={s.label}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-muted transition-colors duration-200 hover:border-story-royal hover:bg-story-royal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d={SOCIAL_ICONS[s.id]} /></svg>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {columns.map((col, ci) => (
              <motion.div key={col.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: ci * 0.08, ease: EASE }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-story-royal">{col.title}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link href={link.href} className="group relative inline-block rounded text-sm text-muted outline-none transition-colors duration-200 hover:text-story-royal focus-visible:text-story-royal focus-visible:ring-2 focus-visible:ring-story-royal/40">
                        <ArrowRight aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-3 -translate-y-1/2 text-story-royal opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
                        <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-5 group-focus-visible:translate-x-5">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center gap-3 border-t border-border-soft py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} MyLoginn Tech Private Limited</p>
          <p className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/locations/tamil-nadu" className="rounded outline-none transition-colors duration-200 hover:text-story-royal focus-visible:ring-2 focus-visible:ring-story-royal/40">Tamil Nadu</Link>
            <Link href="/privacy" className="rounded outline-none transition-colors duration-200 hover:text-story-royal focus-visible:ring-2 focus-visible:ring-story-royal/40">Privacy</Link>
            <Link href="/terms" className="rounded outline-none transition-colors duration-200 hover:text-story-royal focus-visible:ring-2 focus-visible:ring-story-royal/40">Terms</Link>
          </p>
          <p className="inline-flex items-center gap-1.5">
            Made with
            <motion.span aria-hidden className="inline-flex text-rose-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>&hearts;</motion.span>
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}
