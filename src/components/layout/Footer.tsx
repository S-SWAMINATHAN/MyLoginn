"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";

const PILLARS = ["Intelligence", "Innovation", "Integrity", "Impact"];

/* ── Link data ──────────────────────────────────────────────────────── */

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/#ecosystem", label: "What we build" },
      { href: "/projects", label: "Projects" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Technology",
    links: [
      { href: "/#ai", label: "AI & AI agents" },
      { href: "/courses", label: "Courses" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services/app-web-development", label: "App & web development" },
      { href: "/services/digital-marketing", label: "Digital marketing" },
      { href: "/tutoring", label: "Tutoring" },
      { href: "/internships", label: "Internships" },
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

const contactLinks = [
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, Icon: AnimatedMail },
  { label: `+91 ${CONTACT_PHONES[0].display}`, href: `tel:${CONTACT_PHONES[0].tel}`, Icon: AnimatedPhone },
  {
    label: "WhatsApp us",
    href: toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team!") ?? "/contact",
    Icon: AnimatedChat,
    external: true,
  },
];

/* ── Footer ─────────────────────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Gradient hairline */}
      <div className="h-px w-full brand-gradient-bg opacity-70" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,86,214,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* CTA band */}
        <Reveal scale className="pt-14">
          <div className="card-shine relative overflow-hidden rounded-3xl brand-gradient-bg px-6 py-8 text-white shadow-[0_16px_48px_rgba(31,86,214,0.32)] sm:px-10">
            <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <AnimatedRocket className="h-11 w-11 shrink-0" />
                <div>
                  <p className="text-lg font-semibold sm:text-xl">What will you build next?</p>
                  <p className="mt-1 text-sm text-white/80">Have an idea or a business challenge? Let&apos;s talk.</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  Start a project
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>

        {/* Brand strip */}
        <Reveal direction="up" className="mt-12">
          <div className="flex w-fit max-w-full items-center gap-3">
            <Link href="/" className="inline-flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.03]">
              <LogoBadge className="h-9 w-auto" />
            </Link>
            <div className="w-[205px] max-w-full min-w-0">
              <p className="whitespace-nowrap text-sm font-medium text-muted">MyLoginn Tech Private Limited</p>
              <div className="mt-1 flex w-full justify-between">
                {PILLARS.map((p, i) => (
                  <span key={p} className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.08em] text-brand-500">
                    {p}
                    {i < PILLARS.length - 1 && <span className="text-border-soft">&middot;</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Main grid */}
        <div className="grid gap-12 py-12 lg:grid-cols-[1.1fr_2fr]">
          {/* Contact details */}
          <Reveal direction="up">
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Web, mobile, software, AI and training &mdash; one connected team, built for the way businesses
              move forward.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {contactLinks.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex items-center gap-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand-500"
                  >
                    <c.Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                    <span>{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>

          </Reveal>

          {/* Link columns */}
          <RevealGroup className="grid grid-cols-2 gap-8 sm:grid-cols-4" stagger={0.1}>
            {columns.map((col) => (
              <RevealItem key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] brand-gradient-text">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-0 text-sm text-muted transition-colors duration-200 hover:text-foreground"
                      >
                        <span className="h-1.5 w-0 rounded-full brand-gradient-bg opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-1.5 group-hover:opacity-100" />
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Bottom bar */}
        <Reveal direction="none" duration={0.9}>
          <div className="flex flex-col items-center gap-3 border-t border-border-soft py-7 text-xs text-muted sm:flex-row sm:justify-between">
            <p>&copy; {new Date().getFullYear()} MyLoginn Tech Private Limited. All rights reserved.</p>
            <p className="inline-flex items-center gap-1.5">
              Made with
              <motion.span
                aria-hidden
                className="inline-flex text-rose-500"
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                &hearts;
              </motion.span>
              in India
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
