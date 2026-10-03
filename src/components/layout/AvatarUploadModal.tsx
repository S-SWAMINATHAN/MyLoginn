"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [cameraReady, setCameraReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    setCameraReady(false);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setMode("choose");
    setPreview(null);
    setFile(null);
    setError(null);
  }, [preview, stopCamera]);

  useEffect(() => () => {
    stopCamera();
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview, stopCamera]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
      if (event.key !== "Tab") return;
      const items = dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled):not([type='file'])");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus());
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, handleClose]);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraReady(false);
      setMode("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => setError("Couldn't start the camera preview. Please try again."));
        }
      });
    } catch {
      setError("Couldn't access your camera. Check your browser permissions.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    if (!video.videoWidth || !video.videoHeight) {
      setError("The camera is still starting. Try again in a moment.");
      return;
    }
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Couldn't capture the photo. Please try again.");
          return;
        }
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
      e.currentTarget.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Image must be under 4MB.");
      e.currentTarget.value = "";
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function retake() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
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
    } catch {
      setError("Couldn't update your photo. Check your connection and try again.");
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
            ref={dialogRef}
            className="glass-panel w-full max-w-sm rounded-2xl p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-dialog-title"
          >
            <div className="flex items-center justify-between">
              <h2 id="avatar-dialog-title" className="text-lg font-semibold">Update profile photo</h2>
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
                  <video ref={videoRef} autoPlay playsInline muted onLoadedData={() => setCameraReady(true)} className="h-56 w-full scale-x-[-1] rounded-xl bg-black object-cover" />
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <div className="flex w-full gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        stopCamera();
                        setCameraReady(false);
                        setMode("choose");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={capture} disabled={!cameraReady} icon={<Camera className="h-4.5 w-4.5" />}>
                      Capture
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border-soft px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    aria-label="Choose a profile photo from your files"
                  >
                    <Upload className="h-5.5 w-5.5 text-brand-500 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" /> Upload a photo
                  </button>
                  <button
                    onClick={startCamera}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border-soft px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    aria-label="Take a profile photo with your camera"
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
