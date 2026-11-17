"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const videoUrl = "https://cdnl.iconscout.com/lottie/premium/preview-watermark/profile-animation-gif-download-13904545.mp4";
const localFallbackUrl = "/animations/profile-animation.mp4";
const canvases = new Map<HTMLCanvasElement, boolean>();
let sharedVideo: HTMLVideoElement | null = null;
let frameRequest = 0;

function drawFrame() {
  const video = sharedVideo;
  if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

  for (const canvas of canvases.keys()) {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext("2d");
    if (!context) continue;
    context.clearRect(0, 0, width, height);
    // Fill the portrait window so the profile mark stays prominent at card size.
    const fit = Math.max(width / video.videoWidth, height / video.videoHeight);
    const drawWidth = video.videoWidth * fit;
    const drawHeight = video.videoHeight * fit;
    context.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  if ([...canvases.values()].some(Boolean)) frameRequest = requestAnimationFrame(drawFrame);
  else frameRequest = 0;
}

function startFrameLoop() {
  if (!frameRequest && [...canvases.values()].some(Boolean)) frameRequest = requestAnimationFrame(drawFrame);
}

function subscribe(canvas: HTMLCanvasElement, animate: boolean) {
  canvases.set(canvas, animate);
  if (!sharedVideo) {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-hidden", "true");
    Object.assign(video.style, { position: "fixed", width: "1px", height: "1px", left: "-2px", bottom: "0", opacity: "0", pointerEvents: "none" });
    video.addEventListener("error", () => {
      if (!video.src.endsWith(localFallbackUrl)) {
        video.src = localFallbackUrl;
        void video.play().then(startFrameLoop).catch(() => {});
      }
    });
    video.addEventListener("loadeddata", drawFrame);
    document.body.appendChild(video);
    sharedVideo = video;
    video.src = videoUrl;
  }

  if (animate) {
    void sharedVideo.play().then(startFrameLoop).catch(() => {});
  } else if (![...canvases.values()].some(Boolean)) {
    sharedVideo.pause();
    drawFrame();
  }

  return () => {
    canvases.delete(canvas);
    if (canvases.size) return;
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    sharedVideo?.pause();
    sharedVideo?.removeAttribute("src");
    sharedVideo?.load();
    sharedVideo?.remove();
    sharedVideo = null;
  };
}

export function AnimatedProfileIcon({ className, animate = true }: { className?: string; animate?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return subscribe(canvas, animate);
  }, [animate]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("block shrink-0", className)} />;
}
