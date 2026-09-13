"use client";

import { Chapter } from "@/components/experience/Chapter";
import { CrystalScrim } from "@/components/experience/CrystalScrim";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { MagneticButton } from "@/components/experience/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { WHATSAPP_PHONE } from "@/lib/contactInfo";

export function FinalCta() {
  const whatsapp = toWhatsAppLink(WHATSAPP_PHONE, "Hi MyLoginn team! I'd like to talk about a project.") ?? "/contact";

  return (
    <Chapter formation="crystal" variant="final" title="What will you build next?">
      <div className="relative mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        <CrystalScrim />

        <Reveal>
          <span className="story-eyebrow justify-center">Let&apos;s build it</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="What will you build next?"
          className="story-heading mx-auto mt-4 text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-5 max-w-md text-sm text-muted sm:text-base">
            Have an idea, a business challenge, or a product you want to bring to life? Let&apos;s build it.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3} className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <MagneticButton>
              <Button href="/contact" size="lg">
                Start a project
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button href={whatsapp} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
                Talk to us
              </Button>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </Chapter>
  );
}
