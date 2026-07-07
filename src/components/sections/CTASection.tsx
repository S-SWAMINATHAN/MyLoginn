"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";

export function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* extra glow ring so the card pops off a near-black dark background */}
          <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(60%_80%_at_50%_50%,var(--brand-500),transparent_70%)] opacity-0 blur-2xl dark:opacity-45" />

          <div className="relative overflow-hidden rounded-3xl brand-gradient-bg bg-size-200 px-8 py-16 text-center text-white shadow-[var(--shadow-lift)] ring-1 ring-white/10 sm:px-16 dark:ring-accent-400/25">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
              <AnimatedRocket className="h-10.5 w-10.5" />
            </div>

            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to build your future with AI?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/85">
              Join thousands of learners, interns and businesses already growing
              with MyLoginn.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href="/signup"
                size="lg"
                className="!bg-white !text-brand-600 hover:!brightness-95"
                icon={<AnimatedArrow className="h-5.5 w-5.5" />}
              >
                Create your free account
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
