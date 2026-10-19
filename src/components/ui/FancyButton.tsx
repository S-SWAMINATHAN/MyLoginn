"use client";

import type { ReactNode } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";

type Variant = "primary" | "dark" | "ghost";

/**
 * The site's call-to-action link. Every variant now shares one look (a solid pill with a soft arrow track that glides
 * on hover, never changing colour): "primary" and "dark" are the same royal-blue pill, "ghost" is the white outlined pill for quiet secondary actions.
 */
export function FancyLink({ href, children, variant = "primary", className, onClick, block }: { href: string; children: ReactNode; variant?: Variant; arrow?: "up-right" | "right" | "none"; className?: string; onClick?: () => void; block?: boolean }) {
  return <ArrowLink block={block} href={href} tone={variant === "ghost" ? "outline" : "royal"} className={className} onClick={onClick}>{children}</ArrowLink>;
}
