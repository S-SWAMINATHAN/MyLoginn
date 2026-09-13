"use client";

import Link from "next/link";
import { useId } from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, WHATSAPP_PHONE } from "@/lib/contactInfo";

/* ── Gradient social glyphs ─────────────────────────────────────────── */

function InstagramIcon({ className }: { className?: string }) {
  const id = "igf" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="45%" stopColor="#e1306c" />
          <stop offset="100%" stopColor="#833ab4" />
        </linearGradient>
      </defs>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" fill={`url(#${id})`} />
      <circle cx="12" cy="12" r="4.1" stroke="#fff" strokeWidth="1.9" />
      <circle cx="17.25" cy="6.75" r="1.25" fill="#fff" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  const id = "lif" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0a66c2" />
        </linearGradient>
      </defs>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5" fill={`url(#${id})`} />
      <path
        d="M8.3 10.1v7H5.9v-7Zm-1.2-3.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm3.4 3.6h2.3v1c.35-.6 1.2-1.25 2.5-1.25 2 0 3 1.3 3 3.5v3.75h-2.4v-3.4c0-1-.4-1.7-1.3-1.7-.75 0-1.2.5-1.4 1-.07.18-.1.42-.1.67v3.43h-2.4v-7Z"
        fill="#fff"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  const id = "twf" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5" fill={`url(#${id})`} />
      <path
        d="M15.5 6.5h1.9l-4.15 4.75L18.15 17.5h-3.83l-3-3.92-3.43 3.92H6l4.44-5.07L5.75 6.5h3.93l2.71 3.58Zm-.67 9.86h1.05L9.11 7.58H7.98Z"
        fill="#fff"
      />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedinIcon },
  { label: "X (Twitter)", href: "#", Icon: TwitterIcon },
];

const PILLARS = ["Intelligence", "Innovation", "Integrity", "Impact"];

/* ── Link data ──────────────────────────────────────────────────────── */

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/#about", label: "About" },
      { href: "/#ecosystem", label: "What we build" },
      { href: "/projects", label: "Projects" },
    ],
  },
  {
    title: "Technology",
    links: [
      { href: "/#ai", label: "AI & AI agents" },
      { href: "/#solutions", label: "Solutions" },
      { href: "/#training", label: "Training" },
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
      { href: "/contact", label: "Contact us" },
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
          <Link href="/" className="inline-flex items-center transition-transform duration-300 hover:scale-[1.03]">
            <LogoBadge className="h-9 w-auto" />
          </Link>
          <p className="mt-3 text-sm font-medium text-muted">MyLoginn Tech Private Limited</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {PILLARS.map((p, i) => (
              <span key={p} className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-500">
                {p}
                {i < PILLARS.length - 1 && <span className="text-border-soft">&middot;</span>}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Main grid */}
        <div className="grid gap-12 py-12 lg:grid-cols-[1.1fr_2fr]">
          {/* Contact + socials */}
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
                    <span className="underline-offset-4 group-hover:underline">{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, Icon }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  whileHover={{ scale: 1.18, rotate: 8, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className="inline-flex"
                >
                  <Icon className="h-8 w-8 drop-shadow-sm" />
                </motion.a>
              ))}
            </div>
          </Reveal>

          {/* Link columns */}
          <RevealGroup className="grid grid-cols-2 gap-8 sm:grid-cols-4" stagger={0.1}>
            {columns.map((col) => (
              <RevealItem key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] brand-gradient-text">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
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
