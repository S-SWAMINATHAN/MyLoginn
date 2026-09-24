"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The admin shell positions fixed overlays (drawer, modals, toasts); the
  // animated wrapper's transform/filter would turn into their containing
  // block and pin them to the page instead of the viewport — skip it there.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }

  // With App Router server components, `mode="wait"` can unmount the old
  // page before the new route payload has arrived. Keeping a single wrapper
  // lets the incoming route render immediately during client navigation.
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.992, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
