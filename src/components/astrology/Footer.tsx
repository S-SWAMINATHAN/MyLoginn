import React from "react";

interface FooterProps {
  lang: "ta" | "en";
  /** Optional per-page line, e.g. "திருமணப் பொருத்த வழிகாட்டி". */
  note?: string;
}

/** Per-page note under the report. The site footer comes from the main MyLoginn layout. */
export const Footer: React.FC<FooterProps> = ({ note }) =>
  note ? <p className="no-print mx-auto mt-8 max-w-7xl px-4 text-center text-xs text-muted">{note}</p> : null;
