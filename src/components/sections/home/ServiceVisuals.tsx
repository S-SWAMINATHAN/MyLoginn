"use client";

import type { CoreServiceId } from "@/lib/coreServices";
import { AppTour, WebTour } from "@/components/sections/home/showcase/WebAppTours";
import { AiTour, MarketingTour, SoftwareTour } from "@/components/sections/home/showcase/BusinessTours";

/**
 * Each core service as a multi-page product tour in a realistic frame — a browser for the web, iOS and Android
 * phones for apps, and desktop applications for AI, marketing and custom software.
 */
const TOURS: Record<CoreServiceId, (p: { play: boolean }) => React.ReactNode> = {
  web: WebTour,
  mobile: AppTour,
  ai: AiTour,
  marketing: MarketingTour,
  software: SoftwareTour,
};

export function ServiceVisual({ id, play }: { id: CoreServiceId; play: boolean }) {
  const T = TOURS[id];
  return <T play={play} />;
}
