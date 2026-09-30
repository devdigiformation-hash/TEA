"use client";

interface JourneyLoaderProps {
  ready: boolean;
}

export function JourneyLoader({ ready }: JourneyLoaderProps) {
  return (
    <div
      className={`journey-loader ${ready ? "is-ready" : ""}`}
      aria-hidden={ready}
    >
      <div className="journey-loader-inner">
        <div className="journey-loader-leaf" aria-hidden="true" />
        <span className="journey-loader-text">Preparing the journey…</span>
        <div className="journey-loader-bar" aria-hidden="true">
          <div className="journey-loader-fill" />
        </div>
      </div>
    </div>
  );
}
