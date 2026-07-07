"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Upload, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MAX_SIZE = 4 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function AvatarUploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "camera">("choose");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    stopCamera();
    setMode("choose");
    setPreview(null);
    setFile(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setMode("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError("Couldn't access your camera. Check your browser permissions.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setFile(blob);
        setPreview(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("Use a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Image must be under 4MB.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function retake() {
    setPreview(null);
    setFile(null);
    setMode("choose");
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file, file instanceof File ? file.name : "capture.jpg");
      const res = await fetch("/api/account/avatar", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't update your photo");
        return;
      }
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-sm rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Update profile photo</h2>
              <button onClick={handleClose} className="group cursor-pointer rounded-full p-1.5 hover:bg-surface-2" aria-label="Close">
                <X className="h-5.5 w-5.5 transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            <div className="mt-5">
              {preview ? (
                <div className="flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- transient blob preview, not a static asset */}
                  <img src={preview} alt="Preview" className="h-36 w-36 rounded-full object-cover shadow-[var(--shadow-lift)]" />
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <div className="flex w-full gap-3">
                    <Button variant="secondary" className="flex-1" onClick={retake} icon={<RotateCcw className="h-4.5 w-4.5" />}>
                      Retake
                    </Button>
                    <Button className="flex-1" onClick={handleSave} disabled={saving} icon={<Check className="h-4.5 w-4.5" />}>
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
              ) : mode === "camera" ? (
                <div className="flex flex-col items-center gap-4">
                  <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full scale-x-[-1] rounded-xl bg-black object-cover" />
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <div className="flex w-full gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        stopCamera();
                        setMode("choose");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={capture} icon={<Camera className="h-4.5 w-4.5" />}>
                      Capture
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border-soft px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-surface-2"
                  >
                    <Upload className="h-5.5 w-5.5 text-brand-500 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" /> Upload a photo
                  </button>
                  <button
                    onClick={startCamera}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border-soft px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-surface-2"
                  >
                    <Camera className="h-5.5 w-5.5 text-brand-500 transition-transform duration-300 group-hover:scale-110" /> Use camera
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFilePick}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
