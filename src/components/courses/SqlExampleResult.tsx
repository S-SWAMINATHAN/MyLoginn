"use client";

import { useEffect, useState } from "react";

export function SqlExampleResult({ query, fallback }: { query: string; fallback: string }) {
  const [output, setOutput] = useState("Loading example query…");

  useEffect(() => {
    let active = true;
    fetch("/api/courses/sql-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not run this example query.");
      if (active) setOutput(payload.output);
    }).catch((error: unknown) => {
      if (active) setOutput(`${error instanceof Error ? error.message : "Could not run this example query."}\n\n${fallback}`);
    });
    return () => { active = false; };
  }, [query, fallback]);

  return <pre className="mt-2 whitespace-pre-wrap font-mono text-sm leading-6 text-emerald-300">{output}</pre>;
}
