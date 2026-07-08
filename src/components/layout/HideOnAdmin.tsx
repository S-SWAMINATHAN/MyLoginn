"use client";

import { usePathname } from "next/navigation";

/** The admin panel brings its own shell — suppress the site chrome there. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
