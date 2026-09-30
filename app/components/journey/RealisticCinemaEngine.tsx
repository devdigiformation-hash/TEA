"use client";

import { useEffect, useRef, useState } from "react";
import { SCENES, VIDEO_CLIPS } from "./constants";
import { FilmDefinition } from "./types";
import { TEA_FILM } from "../../data/films/tea";

import { Volume2, VolumeX, Eye, EyeOff, Disc3 } from "lucide-react";

interface RealisticCinemaEngineProps {
  progress: number;
  active: number;
  onReady?: () => void;
  film?: FilmDefinition;
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function RealisticCinemaEngine({
  progress,
  active,
  onReady,
  film,
}: RealisticCinemaEngineProps) {
  const activeFilm = film || TEA_FILM;
  const clips = activeFilm.clips;
  const chapters = activeFilm.chapters;

  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const currentTimes = useRef<number[]>(clips.map(() => 0));
  const targetTimes = useRef<number[]>(clips.map(() => 0));
  const [hudVisible, setHudVisible] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Initialize videos and signal ready
  useEffect(() => {
    let loadedCount = 0;
    const checkReady = () => {
      loadedCount++;
      if (loadedCount >= 1) {
        onReady?.();
      }
    };

    videoRefs.current.forEach((video) => {
      if (!video) return;
      if (video.readyState >= 2) {
        checkReady();
      } else {
        video.addEventListener("loadeddata", checkReady, { once: true });
      }
    });

    const timer = setTimeout(() => onReady?.(), 400);
    return () => clearTimeout(timer);
  }, [onReady]);

  // Video Scrubbing and Smooth Cross-fade loop
  useEffect(() => {
    let disposed = false;
    let rafId = 0;

    // Calculate segment progress (transitions across scenes)
    const exact = progress * clips.length;
    const segment = Math.min(clips.length - 1, Math.floor(exact));
    const local =
      segment === clips.length - 1 ? clamp(exact - segment) : exact - segment;

    targetTimes.current = targetTimes.current.map((_, index) => {
      if (index < segment) return 1;
      if (index === segment) return local;
      return 0;
    });

    // Smooth sigmoid cross-dissolve between consecutive movie clips
    // Fade starts at local 0.85 and finishes at 1.0 for seamless camera continuity
    const fade = clamp((local - 0.85) / 0.15);
    const smoothFade = fade * fade * (3 - 2 * fade); // Smoothstep

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      let opacity = 0;
      if (index === segment) opacity = 1 - smoothFade;
      if (index === segment + 1) opacity = smoothFade;
      video.style.opacity = String(opacity);
    });

    const animate = () => {
      if (disposed) return;

      videoRefs.current.forEach((video, index) => {
        if (!video || !Number.isFinite(video.duration) || video.seeking) return;
        const target = targetTimes.current[index];
        // Spring damping lerp for authentic camera crane inertia
        currentTimes.current[index] +=
          (target - currentTimes.current[index]) * 0.18;

        const time = clamp(currentTimes.current[index], 0, 0.996) * video.duration;
        if (Math.abs(video.currentTime - time) > 0.015) {
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
  }, [progress, clips.length]);

  // Audio ambience synthesis (mountain wind, cleanroom, forge embers)
  const toggleSound = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Soft noise buffer for realistic atmospheric sound
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      if (activeFilm.audioPreset === "cleanroom-optics") {
        filter.frequency.value = 650;
      } else if (activeFilm.audioPreset === "forge-hearth") {
        filter.frequency.value = 220;
      } else {
        filter.frequency.value = 420;
      }

      const gain = ctx.createGain();
      gain.gain.value = 0.06;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      noiseNodeRef.current = gain;
      setSoundEnabled(true);
    } else {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
        setSoundEnabled(true);
      } else {
        audioCtxRef.current.suspend();
        setSoundEnabled(false);
      }
    }
  };

  // Format real-time movie timecode (e.g. 00:01:24:18)
  const totalFrames = Math.floor(progress * 1920);
  const seconds = Math.floor(totalFrames / 24);
  const frames = totalFrames % 24;
  const minutes = Math.floor(seconds / 60);
  const timecode = `00:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;

  return (
    <div className="realistic-cinema-engine" aria-label="Real camera documentary film">
      {/* 1. Underlying 1080p Still Layer for Instant Crisp Fidelity */}
      <img
        className="cinema-still-poster"
        src={chapters[active]?.still || chapters[0]?.still}
        alt=""
        aria-hidden="true"
      />

      {/* 2. Cinema Video Film Streams (Continuous Camera Transitions) */}
      <div className="cinema-film-strip" aria-hidden="true">
        {clips.map((clip, index) => (
          <video
            key={clip}
            ref={(node) => {
              videoRefs.current[index] = node;
            }}
            className="cinema-film-video"
            muted
            playsInline
            src={clip}
            preload={index < 2 ? "auto" : "metadata"}
            poster={chapters[index]?.still}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* 3. Authentic 35mm Film Grain Overlay & Anamorphic Vignette */}
      <div className="cinema-film-grain" aria-hidden="true" />
      <div className="cinema-anamorphic-vignette" aria-hidden="true" />

      {/* 4. Cinematic Telemetry / Film Monitor HUD */}
      {hudVisible && (
        <aside className="cinema-hud" aria-label="Cinema Camera Information">
          <div className="cinema-hud-top-left">
            <span className="cinema-rec-dot" aria-hidden="true" />
            <span className="cinema-rec-label">REC</span>
            <span className="cinema-timecode">{timecode}</span>
          </div>

          <div className="cinema-hud-top-right">
            {activeFilm.telemetrySpecs.map((spec, i) => (
              <span key={i} className="cinema-hud-spec">{spec}</span>
            ))}
            <span className="cinema-hud-spec">{activeFilm.fps}.000 FPS</span>
          </div>

          <div className="cinema-hud-bottom-right">
            <button
              type="button"
              className="cinema-audio-btn"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute ambient mountain audio" : "Play ambient mountain audio"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={13} className="inline mr-1 text-emerald-400" />
                  <span>Ambience Active</span>
                </>
              ) : (
                <>
                  <VolumeX size={13} className="inline mr-1 opacity-60" />
                  <span>Ambience Off</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="cinema-hud-toggle"
              onClick={() => setHudVisible(false)}
              aria-label="Hide Cinema HUD overlay"
            >
              <EyeOff size={12} className="inline mr-1 opacity-70" />
              <span>Hide HUD</span>
            </button>
          </div>
        </aside>
      )}

      {!hudVisible && (
        <button
          type="button"
          className="cinema-hud-restore-btn"
          onClick={() => setHudVisible(true)}
          aria-label="Show Cinema HUD"
        >
          <Eye size={12} className="inline mr-1" />
          <span>HUD</span>
        </button>
      )}
    </div>
  );
}
