"use client";

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  return (
    <div
      className="inline-flex items-center gap-[2px] h-3 px-1"
      aria-hidden="true"
    >
      {[0.4, 0.8, 1.2, 0.6, 0.9].map((delay, index) => (
        <span
          key={index}
          className={`w-[2px] rounded-full bg-emerald-400 transition-all ${
            isPlaying ? "animate-audioBar" : "h-1 opacity-40"
          }`}
          style={{
            animationDelay: `${delay * 0.15}s`,
            height: isPlaying ? undefined : "3px",
          }}
        />
      ))}
    </div>
  );
}
