import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { CheckoutPanel } from "@/components/courses/CheckoutPanel";
import { getEntitlement } from "@/lib/lms/entitlements";
import { decidePurchase } from "@/lib/lms/payments";
import { ONLINE_CHECKOUT_ENABLED, paidCourseHref } from "@/lib/lms/paidLink";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.status !== "published") notFound();
  // New LMS courses use the temporary hard-coded payment link until online checkout is switched on.
  if (course.engine === "lms" && !ONLINE_CHECKOUT_ENABLED) redirect(paidCourseHref(slug));

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/courses/${slug}/checkout`);

  // The server decides what may be charged: purchase, renewal, or nothing (already owned / free).
  const entitlement = await getEntitlement(user.id, course.id);
  const decision = decidePurchase({ price: course.price, renewalPrice: course.renewalPrice, validityDays: course.validityDays }, entitlement);
  if (decision.action === "free" || decision.action === "already_owned") redirect(`/courses/${slug}`);

  return (
    <Section className="mobile-page-glow pt-14">
      <Container>
        <div className="mx-auto max-w-xl">
          <CheckoutPanel
            course={{
              id: course.id,
              slug: course.slug,
              title: course.title,
              category: course.category,
              price: decision.amount,
              originalPrice: decision.kind === "purchase" ? course.originalPrice : null,
              kind: decision.kind,
              validityDays: decision.validityDays,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
