import { CameraWaypoint, SceneData, ZoneLighting } from "./types";

export const SCENES: SceneData[] = [
  {
    id: "origin",
    label: "Origin",
    kicker: "01 · The leaf begins",
    title: "Before it becomes tea.",
    body: "High in the mountains, mist settles slowly on the youngest leaves. Flavour begins with water, stone and the quiet of morning.",
    note: "Elevation · 1,400 m",
    still: "/media/stills/01-valley.webp",
    clip: "/media/video/01-valley-to-harvest.mp4",
    progress: 0.0,
  },
  {
    id: "harvest",
    label: "Harvest",
    kicker: "02 · The first touch",
    title: "Gathered only at dawn.",
    body: "Hands choose the tender tips — two leaves and a bud. Everything else is left to grow until the mist returns.",
    note: "Hand-picked",
    still: "/media/stills/02-harvest.webp",
    clip: "/media/video/02-harvest-to-drying-house.mp4",
    progress: 0.2,
  },
  {
    id: "air",
    label: "Air",
    kicker: "03 · The house of warm air",
    title: "Time becomes fragrance.",
    body: "Across woven bamboo trays, each leaf releases moisture, softens and reveals the first trace of its future character.",
    note: "Slow withering",
    still: "/media/stills/03-drying-house.webp",
    clip: "/media/video/03-drying-to-roasting.mp4",
    progress: 0.4,
  },
  {
    id: "fire",
    label: "Fire",
    kicker: "04 · Fire and form",
    title: "Fire remembers the hands.",
    body: "Copper, charcoal and the steady movement of the maker stop oxidation, folding aroma into every leaf.",
    note: "Hand-roasted",
    still: "/media/stills/04-fire-and-form.webp",
    clip: "/media/video/04-roasting-to-road.mp4",
    progress: 0.6,
  },
  {
    id: "passage",
    label: "Passage",
    kicker: "05 · Across the mountains",
    title: "A quiet road to water.",
    body: "Tea leaves the workshop by the same path that carries rain, cedar and mountain air into the valley.",
    note: "Stone · forest · water",
    still: "/media/stills/05-mountain-road.webp",
    clip: "/media/video/05-road-to-ceremony.mp4",
    progress: 0.8,
  },
  {
    id: "cup",
    label: "Cup",
    kicker: "06 · The quiet ceremony",
    title: "The whole valley, in one cup.",
    body: "The mountains return in the steam above dark water. The journey ends where it began: in mist and stillness.",
    note: "Water · 82 °C",
    still: "/media/stills/06-tea-ceremony.webp",
    progress: 1.0,
  },
];

export const VIDEO_CLIPS = [
  "/media/video/01-valley-to-harvest.mp4",
  "/media/video/02-harvest-to-drying-house.mp4",
  "/media/video/03-drying-to-roasting.mp4",
  "/media/video/04-roasting-to-road.mp4",
  "/media/video/05-road-to-ceremony.mp4",
];

/**
 * 3D Drone Camera Spline Waypoints across the continuous world
 * World coordinates roughly flow along the Z-axis and X-axis:
 * Zone 01 (Origin): High mountain valley [0, 52, 120] -> [0, 24, 75]
 * Zone 02 (Harvest): Low over terraced bushes and path [12, 9, 35] -> [18, 5, 2]
 * Zone 03 (Drying House): Approaching and entering wooden doorway [15, 4.2, -18] -> [8, 3.4, -42]
 * Zone 04 (Roasting & Fire): Hearth chamber, copper pan [4, 2.8, -65] -> [0, 2.4, -78]
 * Zone 05 (Exit & Road): Emerges onto alpine pass [-12, 14, -105] -> [-25, 22, -145]
 * Zone 06 (Valley & River): Aerial glide through cedar valley [-35, 18, -190] -> [-20, 10, -235]
 * Zone 07 (Tea Sanctuary): Descending to pavilion veranda [-8, 4.8, -270] -> [0, 3.2, -295]
 * Zone 08 (Final Cup): Tabletop intimate dolly in [0, 2.1, -310] -> [0, 1.45, -316]
 */
export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  // 0.00: Mountain Origin - High altitude aerial
  { pos: [0, 48, 115], target: [0, 12, 30], fov: 48 },
  // 0.10: Descending through dawn mountain mist
  { pos: [8, 26, 75], target: [12, 8, 25], fov: 45 },
  // 0.20: Harvest - Beside tea bushes and harvest baskets
  { pos: [14, 7, 30], target: [16, 4.5, 5], fov: 42 },
  // 0.30: Tracking harvested leaves toward the workshop
  { pos: [16, 5.2, 2], target: [14, 4.8, -25], fov: 40 },
  // 0.40: Air - Inside drying house between bamboo trays
  { pos: [9, 3.8, -35], target: [5, 3.2, -55], fov: 44 },
  // 0.50: Gliding past withering leaves toward hearth glow
  { pos: [5, 3.2, -55], target: [2, 2.7, -72], fov: 42 },
  // 0.60: Fire - Hearth chamber, copper pan & charcoal embers
  { pos: [2, 2.5, -72], target: [0, 2.2, -80], fov: 38 },
  // 0.70: Exiting hearth through open mountain doorway
  { pos: [-4, 6.5, -92], target: [-15, 12, -125], fov: 48 },
  // 0.80: Passage - Mountain road & stone bridge through forest
  { pos: [-24, 19, -145], target: [-22, 10, -195], fov: 46 },
  // 0.90: Descending toward secluded tea ceremony pavilion
  { pos: [-12, 7.5, -245], target: [0, 4, -285], fov: 42 },
  // 0.96: Entering tea room veranda
  { pos: [0, 3.0, -298], target: [0, 1.6, -316], fov: 36 },
  // 1.00: Final Cup - Intimate macro view of dark tea & rising steam
  { pos: [0, 1.7, -314.2], target: [0, 1.25, -316.5], fov: 30 },
];

export const ZONE_LIGHTINGS: { progress: number; lighting: ZoneLighting }[] = [
  {
    progress: 0.0,
    lighting: {
      ambientColor: "#6c827c",
      ambientIntensity: 0.9,
      sunColor: "#cfdfd6",
      sunIntensity: 1.4,
      sunPosition: [30, 60, 40],
      fogColor: "#17231c",
      fogNear: 25,
      fogFar: 140,
    },
  },
  {
    progress: 0.2,
    lighting: {
      ambientColor: "#82977f",
      ambientIntensity: 1.1,
      sunColor: "#f3e8cf",
      sunIntensity: 2.0,
      sunPosition: [40, 50, 20],
      fogColor: "#1d2a20",
      fogNear: 20,
      fogFar: 120,
    },
  },
  {
    progress: 0.4,
    lighting: {
      ambientColor: "#554b38",
      ambientIntensity: 1.0,
      sunColor: "#e6c38a",
      sunIntensity: 1.5,
      sunPosition: [15, 20, -30],
      pointColor: "#ffbd70",
      pointIntensity: 3.5,
      pointPosition: [7, 4.5, -45],
      fogColor: "#1b1914",
      fogNear: 15,
      fogFar: 70,
    },
  },
  {
    progress: 0.6,
    lighting: {
      ambientColor: "#4a3224",
      ambientIntensity: 0.8,
      sunColor: "#d87b3b",
      sunIntensity: 1.0,
      sunPosition: [5, 10, -70],
      pointColor: "#ff7426",
      pointIntensity: 6.0,
      pointPosition: [0, 2.5, -78],
      fogColor: "#18110b",
      fogNear: 12,
      fogFar: 55,
    },
  },
  {
    progress: 0.8,
    lighting: {
      ambientColor: "#576d65",
      ambientIntensity: 1.1,
      sunColor: "#ebe0ca",
      sunIntensity: 2.2,
      sunPosition: [-40, 65, -160],
      fogColor: "#17221d",
      fogNear: 30,
      fogFar: 160,
    },
  },
  {
    progress: 1.0,
    lighting: {
      ambientColor: "#403d36",
      ambientIntensity: 0.9,
      sunColor: "#f4ede0",
      sunIntensity: 1.2,
      sunPosition: [-10, 25, -310],
      pointColor: "#ffe5b8",
      pointIntensity: 2.8,
      pointPosition: [0, 3.2, -315],
      fogColor: "#131613",
      fogNear: 8,
      fogFar: 45,
    },
  },
];
