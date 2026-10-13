import Link from "next/link";
import type { LmsContext } from "@/lib/lms/context";
import { LmsEnrollButton } from "./SmallForms";
import { paidCourseHref } from "@/lib/lms/paidLink";

/** Explains exactly why a course is closed and offers the one action that opens it. Never shows paid content. */
export function LockedPanel({ ctx }: { ctx: LmsContext }) {
  const { access, structure, purchase, user } = ctx;
  const slug = structure.course.slug;
  const price = purchase && "amount" in purchase ? purchase.amount : structure.course.price;
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border-soft bg-surface p-6 text-center sm:p-8">
      <p className="text-3xl" aria-hidden="true">🔒</p>
      <h1 className="mt-2 text-xl font-bold">{structure.course.title}</h1>
      <p className="mt-2 text-sm text-muted" role="status">{access.message}</p>
      <div className="mt-5">
        {!user && <Link href={`/login?next=/courses/${slug}`} className="inline-block rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white">Log in to continue</Link>}
        {user && access.reason === "not_enrolled" && <LmsEnrollButton slug={slug} />}
        {user && (access.reason === "needs_purchase" || access.reason === "expired") && (
          <Link href={paidCourseHref(slug)} className="inline-block rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white">
            {access.reason === "expired" ? "Renew" : "Buy"} for ₹{price.toLocaleString("en-IN")}
          </Link>
        )}
        {user && access.reason === "revoked" && <Link href="/contact" className="inline-block rounded-full border border-border-soft px-6 py-2.5 text-sm font-semibold">Contact support</Link>}
      </div>
      <p className="mt-4 text-xs text-muted"><Link href={`/courses/${slug}`} className="underline underline-offset-2">Back to course details</Link></p>
    </div>
  );
}
