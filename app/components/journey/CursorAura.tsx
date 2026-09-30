"use client";

import { useEffect, useRef } from "react";

export function CursorAura() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let rafId = 0;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      isHovering = !!target?.closest("button, a, input, [role='button'], .clickable");
    };

    const loop = () => {
      // Snappy lerp for center dot
      dotX += (mouseX - dotX) * 0.45;
      dotY += (mouseY - dotY) * 0.45;

      // Silky spring damping for luxury outer aura (Kimi / Astra style)
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) scale(${isHovering ? 1.8 : 1})`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) scale(${isHovering ? 1.4 : 1})`;
        glowRef.current.style.opacity = isHovering ? "0.6" : "0.35";
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="cursor-aura-root pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Outer ambient luminescence halo */}
      <div
        ref={glowRef}
        className="cursor-aura-glow will-change-transform"
        style={{
          position: "fixed",
          top: -120,
          left: -120,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%)",
          filter: "blur(28px)",
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        }}
      />
      {/* Precision inner center dot */}
      <div
        ref={dotRef}
        className="cursor-aura-dot will-change-transform"
        style={{
          position: "fixed",
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#F5EFEB",
          boxShadow: "0 0 10px rgba(52, 211, 153, 0.8), 0 0 20px rgba(217, 119, 6, 0.4)",
          pointerEvents: "none",
          transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
