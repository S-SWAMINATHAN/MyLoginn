import { Fragment } from "react";
import { boldSegments } from "@/lib/postings";

/** Posting text with **bold** spans rendered as <strong>. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {boldSegments(text).map((s, i) => (s.bold ? <strong key={i} className="font-semibold text-story-navy dark:text-foreground">{s.text}</strong> : <Fragment key={i}>{s.text}</Fragment>))}
    </>
  );
}
