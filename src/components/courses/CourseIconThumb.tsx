"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { getCourseIconInfo } from "@/lib/courseIcons";

export function CourseIconThumb({
  category,
  title,
  className,
  variant = "banner",
}: {
  category: string;
  title: string;
  className?: string;
  variant?: "banner" | "round";
}) {
  const idSeed = useId();
  const info = useMemo(() => getCourseIconInfo(`${category} ${title}`, idSeed), [category, title, idSeed]);

  if (variant === "round") {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <div
          className="icon-thumb-glow !h-[135%] !w-[135%]"
          style={{ background: `radial-gradient(circle, ${info.accent}59 0%, transparent 70%)` }}
        />
        <div className="icon-thumb-body h-full w-full !gap-0">
          {/* eslint-disable-next-line react/no-danger -- static, hand-authored icon markup, no user input */}
          <span className="h-full w-full [&>svg]:!h-full [&>svg]:!w-full" dangerouslySetInnerHTML={{ __html: info.svg }} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("icon-thumb absolute inset-0", className)} style={{ background: info.gradient }}>
      <div className="icon-thumb-shimmer" />
      <div
        className="icon-thumb-glow"
        style={{ background: `radial-gradient(circle, ${info.accent}66 0%, transparent 70%)` }}
      />
      <div className="icon-thumb-body">
        {/* eslint-disable-next-line react/no-danger -- static, hand-authored icon markup, no user input */}
        <span dangerouslySetInnerHTML={{ __html: info.svg }} />
        <span className="icon-thumb-label">{category}</span>
      </div>
    </div>
  );
}
