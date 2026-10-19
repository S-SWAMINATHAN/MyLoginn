import type { ReactNode } from "react";
import { notFound } from "next/navigation";

// Developer-only certificate preview: never served in production, never indexed.
export const metadata = { robots: { index: false, follow: false } };

export default function DevPreviewLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
