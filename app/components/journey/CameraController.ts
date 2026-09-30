import * as THREE from "three";
import { CAMERA_WAYPOINTS, ZONE_LIGHTINGS } from "./constants";
import { ZoneLighting } from "./types";

export class CameraController {
  private positionCurve: THREE.CatmullRomCurve3;
  private targetCurve: THREE.CatmullRomCurve3;
  private fovValues: number[];
  private currentTarget = new THREE.Vector3();
  private currentUp = new THREE.Vector3(0, 1, 0);

  constructor() {
    const posPoints = CAMERA_WAYPOINTS.map((w) => new THREE.Vector3(...w.pos));
    const targetPoints = CAMERA_WAYPOINTS.map(
      (w) => new THREE.Vector3(...w.target),
    );

    // Centripetal Catmull-Rom prevents looping/cusps in smooth camera paths
    this.positionCurve = new THREE.CatmullRomCurve3(
      posPoints,
      false,
      "centripetal",
      0.5,
    );
    this.targetCurve = new THREE.CatmullRomCurve3(
      targetPoints,
      false,
      "centripetal",
      0.5,
    );
    this.fovValues = CAMERA_WAYPOINTS.map((w) => w.fov);
  }

  public update(
    camera: THREE.PerspectiveCamera,
    progress: number,
    parallax: { x: number; y: number } = { x: 0, y: 0 },
  ) {
    const clamped = Math.max(0, Math.min(1, progress));

    // Sample camera position along the 3D spline
    const pos = this.positionCurve.getPointAt(clamped);
    const target = this.targetCurve.getPointAt(clamped);

    // Subtle drone roll / banking into turns based on path tangent
    const tangent = this.positionCurve.getTangentAt(clamped).normalize();
    // Bank angle proportional to lateral turning
    const bankAmount = -tangent.x * 0.08;
    this.currentUp.set(Math.sin(bankAmount), Math.cos(bankAmount), 0).normalize();

    // Subtle mouse parallax added to target for depth parallax
    const parallaxTarget = target.clone();
    parallaxTarget.x += parallax.x * 1.8;
    parallaxTarget.y += parallax.y * 1.2;

    camera.position.copy(pos);
    camera.up.copy(this.currentUp);
    camera.lookAt(parallaxTarget);
    this.currentTarget.copy(parallaxTarget);

    // Interpolate FOV smoothly across waypoints
    const totalWaypoints = CAMERA_WAYPOINTS.length;
    const segment = Math.min(
      totalWaypoints - 2,
      Math.floor(clamped * (totalWaypoints - 1)),
    );
    const local = clamped * (totalWaypoints - 1) - segment;
    const targetFov =
      this.fovValues[segment] +
      (this.fovValues[segment + 1] - this.fovValues[segment]) * local;

    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  }

  /**
   * Smoothly interpolates environmental lighting & fog between zones
   */
  public getInterpolatedLighting(progress: number): ZoneLighting {
    const zones = ZONE_LIGHTINGS;
    let lower = zones[0];
    let upper = zones[zones.length - 1];

    for (let i = 0; i < zones.length - 1; i++) {
      if (progress >= zones[i].progress && progress <= zones[i + 1].progress) {
        lower = zones[i];
        upper = zones[i + 1];
        break;
      }
    }

    const span = upper.progress - lower.progress;
    const t = span > 0 ? (progress - lower.progress) / span : 0;

    const ambientCol = new THREE.Color(lower.lighting.ambientColor).lerp(
      new THREE.Color(upper.lighting.ambientColor),
      t,
    );
    const sunCol = new THREE.Color(lower.lighting.sunColor).lerp(
      new THREE.Color(upper.lighting.sunColor),
      t,
    );
    const fogCol = new THREE.Color(lower.lighting.fogColor).lerp(
      new THREE.Color(upper.lighting.fogColor),
      t,
    );

    const sunIntensity =
      lower.lighting.sunIntensity +
      (upper.lighting.sunIntensity - lower.lighting.sunIntensity) * t;

    const sunPos: [number, number, number] = [
      lower.lighting.sunPosition[0] +
        (upper.lighting.sunPosition[0] - lower.lighting.sunPosition[0]) * t,
      lower.lighting.sunPosition[1] +
        (upper.lighting.sunPosition[1] - lower.lighting.sunPosition[1]) * t,
      lower.lighting.sunPosition[2] +
        (upper.lighting.sunPosition[2] - lower.lighting.sunPosition[2]) * t,
    ];

    const fogNear =
      lower.lighting.fogNear +
      (upper.lighting.fogNear - lower.lighting.fogNear) * t;
    const fogFar =
      lower.lighting.fogFar +
      (upper.lighting.fogFar - lower.lighting.fogFar) * t;

    return {
      ambientColor: `#${ambientCol.getHexString()}`,
      ambientIntensity:
        lower.lighting.ambientIntensity +
        (upper.lighting.ambientIntensity - lower.lighting.ambientIntensity) * t,
      sunColor: `#${sunCol.getHexString()}`,
      sunIntensity,
      sunPosition: sunPos,
      pointColor: lower.lighting.pointColor || upper.lighting.pointColor,
      pointIntensity:
        (lower.lighting.pointIntensity || 0) * (1 - t) +
        (upper.lighting.pointIntensity || 0) * t,
      pointPosition: lower.lighting.pointPosition || upper.lighting.pointPosition,
      fogColor: `#${fogCol.getHexString()}`,
      fogNear,
      fogFar,
    };
  }

  public getCurrentTarget(): THREE.Vector3 {
    return this.currentTarget.clone();
  }
}
