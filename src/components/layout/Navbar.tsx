"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  Rocket,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import { AnimatedHome } from "@/components/ui/icons/AnimatedHome";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedMegaphone } from "@/components/ui/icons/AnimatedMegaphone";
import { AnimatedCode } from "@/components/ui/icons/AnimatedCode";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AiAssistantButton } from "./AiAssistantButton";
import { ProfileMenu, type ProfileUser } from "./ProfileMenu";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import logo from "@/images/Logos/Logo-trimmed.png";

type NavUser = ProfileUser | null;

const primaryLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/internships", label: "Internships" },
  { href: "/projects", label: "Projects" },
];

const serviceLinks = [
  { href: "/tutoring", label: "Tutoring", desc: "1:1 mentor sessions, live classes" },
  { href: "/services/digital-marketing", label: "Digital Marketing", desc: "AI-driven growth campaigns" },
  { href: "/services/app-web-development", label: "App & Web Development", desc: "Full-stack builds, premium UX" },
];

type MobileLink = {
  href: string;
  label: string;
  desc?: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
};

const mobileMainLinks: MobileLink[] = [
  { href: "/", label: "Home", desc: "Back to the start", icon: AnimatedHome },
  { href: "/courses", label: "Courses", desc: "Learn job-ready skills", icon: AnimatedBook },
  { href: "/internships", label: "Internships", desc: "Real-world experience", icon: AnimatedBriefcase },
  { href: "/projects", label: "Projects", desc: "Build your portfolio", icon: AnimatedFolder },
];

const mobileServiceLinks: MobileLink[] = [
  { href: "/tutoring", label: "Tutoring", desc: "1:1 mentor sessions, live classes", icon: AnimatedGraduation },
  {
    href: "/services/digital-marketing",
    label: "Digital Marketing",
    desc: "AI-driven growth campaigns",
    icon: AnimatedMegaphone,
  },
  {
    href: "/services/app-web-development",
    label: "App & Web Development",
    desc: "Full-stack builds, premium UX",
    icon: AnimatedCode,
  },
];

const mobileContactLink: MobileLink = {
  href: "/contact",
  label: "Contact",
  desc: "We reply fast",
  icon: AnimatedMail,
};

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen ? "glass shadow-[var(--shadow-soft)]" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center transition-transform duration-300 ease-out hover:scale-[1.04] active:scale-[0.97]">
          <Image
            src={logo}
            alt="MyLoginn"
            preload
            className="h-9 w-auto select-none object-contain sm:h-10"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <NavHeaderLink href="/" active={pathname === "/"}>
            Home
          </NavHeaderLink>

          {primaryLinks.map((link) => (
            <NavHeaderLink key={link.href} href={link.href} active={pathname === link.href}>
              {link.label}
            </NavHeaderLink>
          ))}

          <div
            className="group relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground cursor-pointer"
              onClick={() => setServicesOpen((s) => !s)}
            >
              Services
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", servicesOpen && "rotate-180")} />
              <span
                className={cn(
                  "pointer-events-none absolute inset-x-3.5 -bottom-0.5 h-[3px] origin-center rounded-full brand-gradient-bg transition-transform duration-300 ease-out",
                  servicesOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
              />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-border-soft bg-surface p-2 shadow-[var(--shadow-lift)]"
                >
                  {serviceLinks.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block rounded-xl px-3.5 py-2.5 transition-colors duration-150 hover:bg-surface-2"
                    >
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted">{s.desc}</p>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavHeaderLink href="/contact" active={pathname === "/contact"}>
            Contact
          </NavHeaderLink>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <AiAssistantButton />
          {user ? (
            <ProfileMenu user={user} />
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/signup" variant="primary" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5 lg:hidden">
          {user ? (
            <ProfileMenu user={user} onOpen={() => setMobileOpen(false)} />
          ) : (
            <Link
              href="/login"
              aria-label="Log in"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-surface transition-all duration-300 hover:border-brand-400 hover:shadow-[0_4px_16px_rgba(108,77,255,0.25)] active:scale-95"
            >
              <AnimatedUser className="h-6 w-6" />
            </Link>
          )}
          <HamburgerButton open={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
        </div>
      </nav>

      <MobileMenu open={mobileOpen} pathname={pathname} user={user} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

/* ── Morphing hamburger button ──────────────────────────────────────── */

function HamburgerButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const barTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <motion.button
      aria-label="Toggle menu"
      aria-expanded={open}
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-2xl cursor-pointer transition-all duration-300",
        open
          ? "brand-gradient-bg text-white shadow-[0_8px_24px_rgba(108,77,255,0.45)]"
          : "border border-border-soft bg-surface text-foreground hover:border-brand-400 hover:shadow-[0_4px_16px_rgba(108,77,255,0.25)]"
      )}
    >
      <span className="relative block h-3.5 w-5">
        <motion.span
          className="absolute left-0 top-0 block h-[2.5px] w-full rounded-full bg-current"
          animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
          transition={barTransition}
        />
        <motion.span
          className="absolute left-0 top-1.5 block h-[2.5px] w-full rounded-full bg-current"
          animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.18 }}
        />
        <motion.span
          className="absolute left-0 bottom-0 block h-[2.5px] w-[70%] rounded-full bg-current"
          animate={open ? { y: -6, rotate: -45, width: "100%" } : { y: 0, rotate: 0, width: "70%" }}
          transition={barTransition}
        />
      </span>
    </motion.button>
  );
}

/* ── Mobile menu sheet ──────────────────────────────────────────────── */

const listVariants: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  closed: { opacity: 0, x: 32, filter: "blur(4px)" },
  open: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

function MobileMenu({
  open,
  pathname,
  user,
  onClose,
}: {
  open: boolean;
  pathname: string;
  user: NavUser;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 top-16 z-40 bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 top-[4.75rem] z-50 origin-top overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)]"
          >
            {/* ambient gradient glow inside the sheet */}
            <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(108,77,255,0.22),transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_70%)]" />

            <motion.div
              variants={listVariants}
              initial="closed"
              animate="open"
              className="relative max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain px-4 pb-5 pt-4"
            >
              <motion.p variants={itemVariants} className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                Explore
              </motion.p>

              <div className="flex flex-col gap-1">
                {mobileMainLinks.map((link) => (
                  <MobileNavItem key={link.href} link={link} active={pathname === link.href} />
                ))}
              </div>

              <motion.div variants={itemVariants} className="my-3 flex items-center gap-3 px-2">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border-soft to-transparent" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] brand-gradient-text">Services</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border-soft to-transparent" />
              </motion.div>

              <div className="flex flex-col gap-1">
                {mobileServiceLinks.map((link) => (
                  <MobileNavItem key={link.href} link={link} active={pathname === link.href} />
                ))}
                <MobileNavItem link={mobileContactLink} active={pathname === mobileContactLink.href} />
              </div>

              <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-4">
                {user ? (
                  <MobileUserActions user={user} />
                ) : (
                  <>
                    <Button href="/signup" variant="primary" icon={<Rocket className="h-4 w-4" />}>
                      Get started — it&apos;s free
                    </Button>
                    <Button href="/login" variant="secondary" icon={<LogIn className="h-4 w-4" />}>
                      Log in
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MobileNavItem({ link, active }: { link: MobileLink; active: boolean }) {
  const Icon = link.icon;
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={link.href}
        className={cn(
          "group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-all duration-200 active:scale-[0.98]",
          active
            ? "bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-900/25 dark:ring-brand-700/50"
            : "hover:bg-surface-2"
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon className="h-8 w-8" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-semibold", active && "text-brand-500")}>{link.label}</span>
          {link.desc && <span className="block truncate text-xs text-muted">{link.desc}</span>}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-all duration-300",
            active ? "text-brand-500" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
          )}
        />
      </Link>
    </motion.div>
  );
}

function NavHeaderLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
        active ? "text-brand-500" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-3.5 -bottom-0.5 h-[3px] origin-center rounded-full brand-gradient-bg transition-transform duration-300 ease-out",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
      />
    </Link>
  );
}

function MobileUserActions({ user }: { user: ProfileUser }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      <Button href="/dashboard" variant="primary" icon={<LayoutDashboard className="h-4 w-4" />}>
        Dashboard
      </Button>
      {user.role === "ADMIN" && (
        <Button href="/admin" variant="secondary" icon={<ShieldCheck className="h-4 w-4" />}>
          Admin
        </Button>
      )}
      <Button variant="ghost" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />} className="text-danger hover:bg-danger/10">
        Log out
      </Button>
    </>
  );
}
