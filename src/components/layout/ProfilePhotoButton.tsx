"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { AvatarUploadModal } from "./AvatarUploadModal";

export function ProfilePhotoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal active:scale-95"
      >
        <Camera className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        Update photo
      </button>
      <AvatarUploadModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
