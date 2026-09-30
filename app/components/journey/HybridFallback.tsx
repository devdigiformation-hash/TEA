"use client";

import { useEffect, useRef } from "react";
import { SCENES, VIDEO_CLIPS } from "./constants";

interface HybridFallbackProps {
  progress: number;
  active: number;
  isFallbackActive: boolean;
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function HybridFallback({
  progress,
  active,
  isFallbackActive,
}: HybridFallbackProps) {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const current = useRef(VIDEO_CLIPS.map(() => 0));
  const targets = useRef(VIDEO_CLIPS.map(() => 0));

  useEffect(() => {
    if (!isFallbackActive) return;

    let disposed = false;
    let rafId = 0;

    const exact = progress * VIDEO_CLIPS.length;
    const segment = Math.min(VIDEO_CLIPS.length - 1, Math.floor(exact));
    const local =
      segment === VIDEO_CLIPS.length - 1 ? clamp(exact - segment) : exact - segment;

    targets.current = targets.current.map((_, index) => {
      if (index < segment) return 1;
      if (index === segment) return local;
      return 0;
    });

    const fade = clamp((local - 0.9) / 0.1);
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      let opacity = 0;
      if (index === segment) opacity = 1 - fade;
      if (index === segment + 1) opacity = fade;
      video.style.opacity = String(opacity);
    });

    const animate = () => {
      if (disposed) return;
      videoRefs.current.forEach((video, index) => {
        if (!video || !Number.isFinite(video.duration) || video.seeking) return;
        const desired = targets.current[index];
        current.current[index] += (desired - current.current[index]) * 0.16;
        const time = clamp(current.current[index], 0, 0.998) * video.duration;
        if (Math.abs(video.currentTime - time) > 0.012) {
          try {
            video.currentTime = time;
          } catch {
            // Handled gracefully
          }
        }
      });
      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
    };
  }, [progress, isFallbackActive]);

  if (!isFallbackActive) {
    return null;
  }

  return (
    <div className="journey-stage journey-fallback-stage" aria-hidden="true">
      <img
        className="journey-poster"
        src={SCENES[active]?.still || SCENES[0].still}
        alt=""
      />
      {VIDEO_CLIPS.map((clip, index) => (
        <video
          key={clip}
          ref={(node) => {
            videoRefs.current[index] = node;
          }}
          className="journey-film"
          muted
          playsInline
          src={clip}
          preload={index < 2 ? "auto" : "metadata"}
          poster={SCENES[index]?.still}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
