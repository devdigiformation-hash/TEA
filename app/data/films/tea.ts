import { FilmDefinition } from "../../components/journey/types";
import { SCENES, VIDEO_CLIPS } from "../../components/journey/constants";

export const TEA_FILM: FilmDefinition = {
  id: "tea",
  title: "The Way of the Leaf",
  subtitle: "From Mountain Mist to Cup",
  meta: "Mountain tea · one harvest",
  category: "Artisanal Agriculture",
  aspectRatio: "2.39:1 Anamorphic",
  fps: 24,
  lensSpec: "35mm Anamorphic · T1.5",
  telemetrySpecs: ["35mm Anamorphic · T1.5", "24.000 FPS"],
  audioPreset: "mountain-wind",
  clips: [...VIDEO_CLIPS],
  chapters: SCENES.map((s) => ({
    id: s.id,
    label: s.label,
    kicker: s.kicker,
    title: s.title,
    body: s.body,
    note: s.note,
    still: s.still,
    clip: s.clip,
    metric: s.id === "origin" ? "ELEVATION · 1,400 M" : undefined,
  })),
};
