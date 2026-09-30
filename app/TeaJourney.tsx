"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { RotateCcw } from "lucide-react";
import { FILMS, FILM_LIST, TEA_FILM } from "./data/films";
import { JourneyLoader } from "./components/journey/JourneyLoader";
import { RealisticCinemaEngine } from "./components/journey/RealisticCinemaEngine";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function TeaJourney() {
  const [currentFilmId, setCurrentFilmId] = useState<string>("tea");
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const activeRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  const activeFilm = FILMS[currentFilmId] || TEA_FILM;
  const chapters = activeFilm.chapters;

  // Read URL query parameter on mount if present (?film=camera or ?film=katana)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const filmParam = params.get("film");
      if (filmParam && FILMS[filmParam]) {
        setCurrentFilmId(filmParam);
      }
    } catch {}
  }, []);

  // Jump to specific chapter with smooth scroll
  const jumpTo = useCallback((index: number) => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetProgress = index / (chapters.length - 1);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetProgress * maxScroll, { duration: 1.4 });
    } else {
      window.scrollTo({
        top: targetProgress * maxScroll,
        behavior: "smooth",
      });
    }
  }, [chapters.length]);

  useEffect(() => {
    // Initialize Lenis smooth momentum scroll for buttery cinema scrub
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const raw = maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0;
      setProgress(raw);

      const segmentIndex = Math.min(
        chapters.length - 1,
        Math.round(raw * (chapters.length - 1)),
      );

      if (segmentIndex !== activeRef.current) {
        activeRef.current = segmentIndex;
        setActive(segmentIndex);
      }

      document.documentElement.style.setProperty(
        "--journey-progress",
        raw.toFixed(4),
      );
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        jumpTo(Math.min(chapters.length - 1, activeRef.current + 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        jumpTo(Math.max(0, activeRef.current - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        jumpTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        jumpTo(chapters.length - 1);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      setReady(true);
    }, 450);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [jumpTo, chapters.length]);

  return (
    <main className="journey-track" aria-label="The journey of a tea leaf">
      <JourneyLoader ready={ready} />

      <section className="journey-shell">
        {/* 100% Untouched Photorealistic Cinema Engine (Real Camera Documentary Film) */}
        <RealisticCinemaEngine
          progress={progress}
          active={active}
          onReady={() => setReady(true)}
          film={activeFilm}
        />

        {/* Vignette & Cinematic Atmospheric Shading */}
        <div className="journey-shade" aria-hidden="true" />

        {/* Pure Topbar Header with Reel Selector */}
        <header className="journey-topbar">
          <div className="journey-brand">
            <span className="journey-brand-mark" aria-hidden="true" />
            <span>{activeFilm.title}</span>
          </div>

          {/* Discreet luxury film reel switcher */}
          <div className="journey-reel-select" role="group" aria-label="Select cinema documentary film">
            <select
              value={currentFilmId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCurrentFilmId(nextId);
                jumpTo(0);
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("film", nextId);
                  window.history.replaceState({}, "", url.toString());
                } catch {}
              }}
              className="reel-dropdown"
              aria-label="Cinema film reel"
            >
              {FILM_LIST.map((f) => (
                <option key={f.id} value={f.id}>
                  Reel: {f.title} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div className="journey-meta">
            <span>{activeFilm.meta}</span>
            <span>{ready ? "Scroll to scrub movie" : "Preparing film reels…"}</span>
          </div>
        </header>

        {/* Narrative Chapter Typography Layer */}
        <div className="journey-copy-layer">
          {chapters.map((scene, index) => (
            <article
              className={`journey-copy ${active === index ? "is-active" : ""}`}
              key={scene.id}
              aria-hidden={active !== index}
            >
              <div className="journey-kicker">{scene.kicker}</div>
              <h1 className="journey-title">{scene.title}</h1>
              <p className="journey-body">{scene.body}</p>
              <span className="journey-note">{scene.note}</span>
              {scene.metric && (
                <div style={{ marginTop: "14px" }}>
                  <span style={{ fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.15em", padding: "4px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "var(--ink)" }}>
                    {scene.metric}
                  </span>
                </div>
              )}
              {index === chapters.length - 1 && (
                <button
                  className="journey-restart"
                  type="button"
                  onClick={() => jumpTo(0)}
                  aria-label="Restart journey from the beginning"
                >
                  <RotateCcw size={13} className="inline mr-1.5 opacity-80" />
                  <span>Begin again</span>
                </button>
              )}
            </article>
          ))}
        </div>

        {/* Interactive Vertical Navigation Rail */}
        <nav className="journey-rail" aria-label="Journey chapters">
          {chapters.map((scene, index) => (
            <button
              className={`journey-dot ${active === index ? "is-active" : ""}`}
              type="button"
              key={scene.id}
              onClick={() => jumpTo(index)}
              aria-label={`Go to chapter: ${scene.label}`}
              aria-current={active === index ? "step" : undefined}
            >
              <span className="journey-dot-label">{scene.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer with Scroll Prompt and Progress */}
        <footer className="journey-footer">
          <div className="journey-scroll">
            <i aria-hidden="true" />
            <span>Scroll controls the camera</span>
          </div>
          <div className="journey-progress" aria-hidden="true" />
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(chapters.length).padStart(2, "0")}
          </span>
        </footer>
      </section>
    </main>
  );
}
