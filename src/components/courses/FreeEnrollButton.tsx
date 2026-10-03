"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function FreeEnrollButton({ slug, loggedIn, enrolled }: { slug: string; loggedIn: boolean; enrolled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function enroll() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(slug)}/enroll`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not enroll. Please try again.");
      router.push(`/courses/${slug}/learn`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not enroll. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {enrolled ? <Button href={`/courses/${slug}/learn`} variant="secondary" className="w-full">Continue learning</Button> : (
        <Button type="button" onClick={enroll} disabled={busy} className="w-full" size="lg">{busy ? "Enrolling…" : "Enroll free"}</Button>
      )}
      {error && <p role="alert" className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
