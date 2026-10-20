"use client";

import { usePathname } from "next/navigation";

/**
 * The admin panel brings its own shell, so suppress the site chrome there. The competition arena is a locked-down
 * exam screen: no navigation, footer or AI assistant while it is open.
 */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/coding-competition/arena")) return null;
  return <>{children}</>;
}
