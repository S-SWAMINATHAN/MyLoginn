"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

const SCENE_PHOTOS: Record<string, string> = {
  "office-standup": "/speaking/scenes/team-meeting.jpg",
  "railway-platform": "/speaking/scenes/city-skyline.jpg",
  "park-morning": "/hero/beach.jpg",
  "help-desk": "/hero/checkout.jpg",
  "library-study": "/speaking/scenes/study-desk.jpg",
  "market-morning": "/speaking/scenes/produce-market.jpg",
  "classroom-project": "/speaking/scenes/classroom-lesson.jpg",
  "bus-stop-rain": "/about/team-collaboration.jpg",
  "science-fair": "/hero/coffee.jpg",
  "beach-cleanup": "/speaking/scenes/community-donation.jpg",
  "clinic-interior": "/hero/clinic.jpg",
  "dining-room": "/hero/dining.jpg",
};

export function Scene({ id, title, className }: { id: string; title: string; className?: string }) {
  const src = SCENE_PHOTOS[id];
  if (!src) return null;

  return (
    <div className={cn("relative aspect-[3/2] w-full overflow-hidden", className)}>
      <Image src={src} alt={title} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
    </div>
  );
}
