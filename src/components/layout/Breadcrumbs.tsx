"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { siteUrl } from "@/lib/site";

const LABELS: Record<string, string> = {
  faq: "FAQ", sql: "SQL", mysql: "MySQL", css: "CSS", html: "HTML", php: "PHP", cpp: "C++", ai: "AI", ui: "UI", ux: "UX",
  login: "Log in", signup: "Sign up", "reset-password": "Reset password", learn: "Learn", tutoring: "Tutoring",
};
// Folders that only group other pages and have no page of their own, so they must not be links.
const NOT_PAGES = new Set(["/dashboard/projects", "/locations"]);

function labelFor(segment: string) {
  const key = decodeURIComponent(segment).toLowerCase();
  if (LABELS[key]) return LABELS[key];
  return key.split("-").filter(Boolean).map((word) => LABELS[word] ?? word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/** Site-wide trail built from the URL, so every current and future page gets one without extra work. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // Home has nothing to trail back to; lesson pages render their own richer breadcrumb.
  if (!segments.length || /^\/courses\/[^/]+\/learn\/[^/]+/.test(pathname)) return null;

  const trail = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return { href, label: labelFor(segment), linkable: !NOT_PAGES.has(href) };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", href: "/" }, ...trail].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: `${siteUrl}${item.href === "/" ? "" : item.href}` })),
  };

  return <div className="border-b border-border-soft bg-background">
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-8">
      <ol className="flex h-9 min-w-0 items-center gap-1 text-xs">
        <li className="flex shrink-0 items-center">
          <Link href="/" aria-label="Home" className="grid h-6 w-6 place-items-center rounded-md text-muted transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><Home className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </li>
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return <li key={item.href} className={"flex items-center gap-1 " + (last ? "min-w-0" : "min-w-0 shrink")}>
            <svg aria-hidden="true" viewBox="0 0 6 12" className="h-3 w-1.5 shrink-0 text-border-soft" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M1 11L5 1" /></svg>
            {last
              ? <span aria-current="page" className="relative flex min-w-0 items-center gap-1.5 rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700"><span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand-600" /><span className="truncate">{item.label}</span></span>
              : item.linkable
                ? <Link href={item.href} className="min-w-0 truncate rounded-md px-1.5 py-0.5 font-medium text-muted transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{item.label}</Link>
                : <span className="min-w-0 truncate px-1.5 py-0.5 text-muted">{item.label}</span>}
          </li>;
        })}
      </ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
  </div>;
}
