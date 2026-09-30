export interface SceneData {
  id: string;
  label: string;
  kicker: string;
  title: string;
  body: string;
  note: string;
  still: string;
  clip?: string;
  progress: number;
}

export interface CameraWaypoint {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ZoneLighting {
  ambientColor: string;
  ambientIntensity: number;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  pointColor?: string;
  pointIntensity?: number;
  pointPosition?: [number, number, number];
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export type RenderMode = "cinema" | "3d" | "inspector" | "fallback";

export interface FilmChapter {
  id: string;
  label: string;
  kicker: string;
  title: string;
  body: string;
  note: string;
  still: string;
  clip?: string;
  metric?: string;
}

export interface FilmDefinition {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  category: string;
  aspectRatio: string;
  fps: number;
  lensSpec: string;
  telemetrySpecs: string[];
  audioPreset: "mountain-wind" | "cleanroom-optics" | "forge-hearth";
  chapters: FilmChapter[];
  clips: string[];
}

