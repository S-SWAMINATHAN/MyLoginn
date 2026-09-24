"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ComponentType } from "react";
import { AnimatedHome } from "@/components/ui/icons/AnimatedHome";
import { AnimatedBook } from "@/components/ui/icons/AnimatedBook";
import { AnimatedBriefcase } from "@/components/ui/icons/AnimatedBriefcase";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { Button } from "@/components/ui/Button";
import { LogoLockup } from "@/components/ui/LogoBadge";
import { ProfileMenu, type ProfileUser } from "./ProfileMenu";

type NavUser = ProfileUser | null;
type MobileLink = { href: string; label: string; icon: ComponentType<{ className?: string; style?: CSSProperties }> };

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/internships", label: "Internships" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

const mobileLinks: MobileLink[] = [
  { href: "/", label: "Home", icon: AnimatedHome },
  { href: "/courses", label: "Courses", icon: AnimatedBook },
  { href: "/internships", label: "Internships", icon: AnimatedBriefcase },
  { href: "/projects", label: "Projects", icon: AnimatedFolder },
];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-border-soft bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="MyLoginn home"><LogoLockup /></Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className={`rounded-full px-4 py-2 text-sm ${pathname === link.href ? "text-brand-600" : "text-muted hover:text-foreground"}`}>{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-3">
          {user ? <ProfileMenu user={user} /> : <><Button href="/login" variant="ghost" size="sm">Log in</Button><Button href="/signup" size="sm">Get started</Button></>}
        </div>
      </nav>
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 lg:hidden">
        {mobileLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border-soft px-3 py-1.5 text-xs text-muted"><Icon className="h-4 w-4" />{label}</Link>)}
      </div>
    </header>
  );
}
