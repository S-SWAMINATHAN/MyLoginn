import Image from "next/image";
import logoIcon from "@/images/MyLoginn Logo Icon.png";
import logoText from "@/images/MyLoginn Logo Wordmark.png";
import { cn } from "@/lib/cn";

/**
 * The MyLoginn crystal mark, used on its own (nav rail, footer brand strip)
 * — the source PNG rendered as-is, never re-cropped or recolored.
 */
export function LogoBadge({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <Image
      src={logoIcon}
      alt="MyLoginn"
      preload
      unoptimized
      className={cn("h-full w-auto select-none object-contain", className, imgClassName)}
    />
  );
}

/**
 * The "MYLOGINN" wordmark raster (tagline removed), used beside the icon in the
 * header lockup — cropped from the original logo text PNG, not redrawn.
 */
export function LogoWordmark({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <Image
      src={logoText}
      alt=""
      preload
      unoptimized
      className={cn("h-full w-auto select-none object-contain", className, imgClassName)}
    />
  );
}

/**
 * Full header lockup: the crystal mark icon beside the wordmark
 * raster — two separate source images placed side by side, neither one
 * modified, cropped, or redrawn as live text.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 sm:gap-1.5", className)} aria-label="MyLoginn">
      <LogoBadge className="h-5 w-auto sm:h-7" />
      <LogoWordmark className="h-3 w-auto sm:h-[14px]" />
    </span>
  );
}
