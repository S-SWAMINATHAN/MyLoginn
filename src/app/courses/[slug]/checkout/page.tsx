import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { CheckoutPanel } from "@/components/courses/CheckoutPanel";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/courses/${slug}/checkout`);

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (enrollment) redirect(`/courses/${slug}`);

  return (
    <Section className="pt-14">
      <Container>
        <div className="mx-auto max-w-xl">
          <CheckoutPanel
            course={{
              id: course.id,
              slug: course.slug,
              title: course.title,
              category: course.category,
              price: course.price,
              originalPrice: course.originalPrice,
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
