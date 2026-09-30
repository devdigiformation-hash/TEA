"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AtmosphereSystem } from "./AtmosphereSystem";
import { CameraController } from "./CameraController";
import { WorldBuilder } from "./WorldBuilder";

interface JourneyCanvasProps {
  progress: number;
  onReady?: () => void;
  onWebGLUnavailable?: () => void;
}

export function JourneyCanvas({
  progress,
  onReady,
  onWebGLUnavailable,
}: JourneyCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetProgressRef = useRef(progress);
  const currentProgressRef = useRef(progress);

  // Keep target progress ref in sync without causing re-renders
  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. WebGL capability check
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl2") ||
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) {
        onWebGLUnavailable?.();
        return;
      }
    } catch {
      onWebGLUnavailable?.();
      return;
    }

    let isDisposed = false;
    let rafId = 0;

    // 2. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      600,
    );

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        alpha: false,
        stencil: false,
        depth: true,
      });
    } catch {
      onWebGLUnavailable?.();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Environmental Lighting & Fog
    const ambientLight = new THREE.AmbientLight(0x6c827c, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xcfdfd6, 1.4);
    sunLight.position.set(30, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0xffbd70, 0, 30);
    scene.add(pointLight);

    const fog = new THREE.Fog(0x17231c, 25, 140);
    scene.fog = fog;
    scene.background = new THREE.Color(0x17231c);

    // 4. Instantiate 3D World & Camera Controller
    const worldBuilder = new WorldBuilder();
    const worldGroup = worldBuilder.build();
    scene.add(worldGroup);

    const atmosphere = new AtmosphereSystem();
    scene.add(atmosphere.group);

    const cameraController = new CameraController();

    // 5. Interactive Mouse Parallax
    const mouseParallax = { x: 0, y: 0 };
    const targetParallax = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;
      targetParallax.x = x * 0.5;
      targetParallax.y = y * 0.35;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // 6. Responsive resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Notify ready
    onReady?.();

    // 7. Cinematic Animation Loop with Spring Damping
    const clock = new THREE.Clock();
    let isHidden = false;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const animate = () => {
      if (isDisposed) return;
      rafId = requestAnimationFrame(animate);

      if (isHidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Smooth camera journey progress lerp
      const target = targetProgressRef.current;
      currentProgressRef.current +=
        (target - currentProgressRef.current) * (0.09 + delta * 0.4);

      const prog = currentProgressRef.current;

      // Mouse parallax lerp
      mouseParallax.x += (targetParallax.x - mouseParallax.x) * 0.06;
      mouseParallax.y += (targetParallax.y - mouseParallax.y) * 0.06;

      // Update camera along 3D Catmull-Rom spline
      cameraController.update(camera, prog, mouseParallax);

      // Interpolate lighting and fog across zones
      const lighting = cameraController.getInterpolatedLighting(prog);
      ambientLight.color.set(lighting.ambientColor);
      ambientLight.intensity = lighting.ambientIntensity;

      sunLight.color.set(lighting.sunColor);
      sunLight.intensity = lighting.sunIntensity;
      sunLight.position.set(...lighting.sunPosition);

      if (lighting.pointColor && lighting.pointPosition) {
        pointLight.color.set(lighting.pointColor);
        pointLight.intensity = lighting.pointIntensity || 0;
        pointLight.position.set(...lighting.pointPosition);
      } else {
        pointLight.intensity = 0;
      }

      fog.color.set(lighting.fogColor);
      fog.near = lighting.fogNear;
      fog.far = lighting.fogFar;
      (scene.background as THREE.Color).set(lighting.fogColor);

      // Update world animations and atmosphere particles
      worldBuilder.update(time);
      atmosphere.update(time, prog);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      worldBuilder.dispose();
      atmosphere.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onReady, onWebGLUnavailable]);

  return (
    <div
      ref={containerRef}
      className="journey-3d-canvas"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
