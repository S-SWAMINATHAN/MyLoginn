"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT_EMAIL, CONTACT_PHONES, SOCIAL_LINKS, WHATSAPP_PHONE } from "@/lib/contactInfo";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";

const PILLARS = ["Intelligence", "Innovation", "Integrity", "Impact"];

/* ── Link data ──────────────────────────────────────────────────────── */

const columns = [
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About MyLoginn" },
      { href: "/projects", label: "Projects" },
      { href: "/internships", label: "Internships" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services", label: "All services" },
      { href: "/services/app-web-development", label: "App & web development" },
      { href: "/services/ai-development", label: "AI development & agents" },
      { href: "/services/testing-automation", label: "Software testing & automation" },
      { href: "/services/digital-marketing", label: "Digital marketing" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "Courses" },
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


/** Routes that already end in their own page-specific CTA banner —
 * showing the generic one again here would just duplicate it. */
const ROUTES_WITH_OWN_CTA = ["/", "/projects", "/internships"];

const contactLinks = [
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, Icon: AnimatedMail },
  ...CONTACT_PHONES.map((p) => ({ label: `+91 ${p.display}`, href: `tel:${p.tel}`, Icon: AnimatedPhone })),
  {
    label: "WhatsApp us",
    href: toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team!") ?? "/contact",
    Icon: AnimatedChat,
    external: true,
  },
];

/* ── Footer ─────────────────────────────────────────────────────────── */

export function Footer() {
  const pathname = usePathname();
  const showCta = !ROUTES_WITH_OWN_CTA.includes(pathname);

  return (
    <footer className="relative mt-8 overflow-hidden sm:mt-20">
      {/* Gradient hairline */}
      <div className="h-px w-full brand-gradient-bg opacity-70" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,86,214,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* CTA band — skipped on pages that already end in their own CTA */}
        {showCta && (
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
                <motion.div whileTap={{ scale: 0.97 }} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => openProjectRequest("software")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Start a project
                  </button>
                </motion.div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Brand strip */}
        <Reveal direction="up" className={showCta ? "mt-12" : "mt-14"}>
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

            <ul className="mt-5 flex items-center gap-3" aria-label="MyLoginn on social media">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={s.label}
                    className="btn-sweep grid h-9 w-9 place-items-center rounded-full border border-border-soft bg-surface text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={SOCIAL_ICONS[s.id]} /></svg>
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
            <p className="inline-flex items-center gap-4"><Link href="/locations/tamil-nadu" className="hover:text-brand-700">Tamil Nadu</Link><Link href="/privacy" className="hover:text-brand-700">Privacy Policy</Link><Link href="/terms" className="hover:text-brand-700">Terms of Use</Link></p>
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
