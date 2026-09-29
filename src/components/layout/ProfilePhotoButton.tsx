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
        className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
      >
        <Camera className="h-4 w-4" />
        Update photo
      </button>
      <AvatarUploadModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
