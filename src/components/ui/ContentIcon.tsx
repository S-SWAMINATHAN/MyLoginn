"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { getCourseIconInfo, type CourseIconKey } from "@/lib/courseIcons";

/**
 * Small animated content-category glyph — the same hand-drawn SVG icon set
 * used in the big course/internship thumbnails, sized down for badges, pills
 * and stat rows so every icon in the app is tied to what it represents.
 */
export function ContentIcon({
  keyword,
  className,
}: {
  keyword: CourseIconKey | string;
  className?: string;
}) {
  const idSeed = useId();
  const info = useMemo(() => getCourseIconInfo(keyword, idSeed), [keyword, idSeed]);

  return (
    <span
      className={cn("inline-flex shrink-0 [&>svg]:h-full [&>svg]:w-full", className)}
      // eslint-disable-next-line react/no-danger -- static, hand-authored icon markup, no user input
      dangerouslySetInnerHTML={{ __html: info.svg }}
    />
  );
}
