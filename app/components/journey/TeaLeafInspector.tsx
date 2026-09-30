"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Rotate3d, Layers, ZoomIn, ZoomOut, Info, X } from "lucide-react";

interface Hotspot {
  id: string;
  name: string;
  pos: [number, number, number];
  title: string;
  desc: string;
  stat: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "trichomes",
    name: "Leaf Tip · Trichomes",
    pos: [0, 2.2, 0.15],
    title: "Mountain Mist Trichomes",
    desc: "Microscopic silver hairs that trap dawn moisture and shield fragile catechins from high-altitude UV radiation.",
    stat: "Density: 140 / mm²",
  },
  {
    id: "midrib",
    name: "Midrib · Vein Network",
    pos: [0, 0, 0.18],
    title: "Mineral Vascular Core",
    desc: "Transports quartz and granite mineral wash from roots directly to the leaf blade during the spring flush.",
    stat: "Silica: 4.8 mg/g",
  },
  {
    id: "blade",
    name: "Margin · Chlorophyll",
    pos: [0.85, -0.6, 0.12],
    title: "Shade-Grown Theanine",
    desc: "Restricted alpine sunlight boosts L-theanine amino acid production, yielding the signature savory umami finish.",
    stat: "L-Theanine: 28.4 mg/g",
  },
];

interface TeaLeafInspectorProps {
  onClose?: () => void;
}

export function TeaLeafInspector({ onClose }: TeaLeafInspectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(HOTSPOTS[0]);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const leafMeshRef = useRef<THREE.Mesh | null>(null);
  const wireMeshRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDisposed = false;
    let rafId = 0;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting Rig (Astra caliber)
    const ambientLight = new THREE.AmbientLight(0x0a140f, 1.2);
    scene.add(ambientLight);

    // Key Light: Warm golden tea tone
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Fill Light: Soft alpine sky blue
    const fillLight = new THREE.DirectionalLight(0x90c5dc, 1.4);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Rim / Backlight: Ethereal emerald edge glow
    const rimLight = new THREE.PointLight(0x34d399, 4.5, 12, 1.8);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    // 3. Procedural 3D Tea Leaf Geometry with organic curves
    const leafGroup = new THREE.Group();
    scene.add(leafGroup);

    // Generate parametric leaf surface
    const uSegments = 48;
    const vSegments = 48;
    const leafGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments; // 0 (stem) to 1 (tip)
      const length = (v - 0.5) * 4.2; // -2.1 to 2.1
      // Width profile: parabolic taper towards tip and petiole
      const widthFactor = Math.sin(v * Math.PI) * (1 - 0.15 * Math.cos(v * Math.PI));
      const arch = Math.sin(v * Math.PI) * 0.45; // Organic longitudinal curvature

      for (let i = 0; i <= uSegments; i++) {
        const u = i / uSegments; // 0 to 1 across width
        const x = (u - 0.5) * 2.2 * widthFactor;
        const cupFold = Math.abs(u - 0.5) * 0.22; // Cross-sectional V-shape
        const z = -arch + cupFold + Math.sin(x * 3.5) * 0.05;

        // Serrated edge ripple
        const serration =
          Math.abs(u - 0.5) > 0.42
            ? Math.sin(v * 48) * 0.04 * Math.sin(v * Math.PI)
            : 0;

        positions.push(x + serration, length, z);
        uvs.push(u, v);
      }
    }

    for (let j = 0; j < vSegments; j++) {
      for (let i = 0; i < uSegments; i++) {
        const a = j * (uSegments + 1) + i;
        const b = (j + 1) * (uSegments + 1) + i;
        const c = (j + 1) * (uSegments + 1) + (i + 1);
        const d = j * (uSegments + 1) + (i + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    leafGeo.setIndex(indices);
    leafGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    leafGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    leafGeo.computeVertexNormals();

    // 4. Luxury Physical Material with Subsurface Translucency
    const leafMat = new THREE.MeshPhysicalMaterial({
      color: 0x224a2c,
      roughness: 0.24,
      metalness: 0.05,
      clearcoat: 0.75,
      clearcoatRoughness: 0.18,
      transmission: 0.25, // Translucent mountain leaf feel
      thickness: 0.8,
      sheen: 0.9,
      sheenColor: new THREE.Color(0x84cc16),
      side: THREE.DoubleSide,
    });

    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMeshRef.current = leafMesh;
    leafGroup.add(leafMesh);

    // Wireframe overlay for technical inspection mode
    const wireGeo = new THREE.WireframeGeometry(leafGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    wireMesh.visible = false;
    wireMeshRef.current = wireMesh;
    leafGroup.add(wireMesh);

    // Dewdrop on leaf (Glass Sphere)
    const dropGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const dropMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.05,
      ior: 1.33,
      thickness: 0.4,
      clearcoat: 1.0,
    });
    const dewdrop = new THREE.Mesh(dropGeo, dropMat);
    dewdrop.position.set(0.2, 0.8, 0.16);
    dewdrop.scale.set(1.2, 1.2, 0.65);
    leafGroup.add(dewdrop);

    // Floating micro-particles around the leaf
    const partCount = 180;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for (let p = 0; p < partCount * 3; p += 3) {
      partPos[p] = (Math.random() - 0.5) * 5;
      partPos[p + 1] = (Math.random() - 0.5) * 5;
      partPos[p + 2] = (Math.random() - 0.5) * 4;
    }
    partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // 5. Interactive Mouse Orbit & Gyro Drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.25;
    let rotY = 0.4;
    let targetRotX = rotX;
    let targetRotY = rotY;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotY += deltaX * 0.008;
      targetRotX += deltaY * 0.008;
      setAutoRotate(false);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      const elapsed = clock.getElapsedTime();

      if (autoRotate) {
        targetRotY += 0.0035;
      }

      // Smooth inertia lerp
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      leafGroup.rotation.x = rotX;
      leafGroup.rotation.y = rotY;

      // Subtle organic breathing float
      leafGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;

      // Swirl micro-particles
      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      domEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      dropGeo.dispose();
      dropMat.dispose();
      partGeo.dispose();
      partMat.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [autoRotate]);

  // Handle wireframe toggle
  useEffect(() => {
    if (wireMeshRef.current) {
      wireMeshRef.current.visible = wireframe;
    }
  }, [wireframe]);

  return (
    <div className="tea-leaf-inspector-overlay animate-fadeIn">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="tea-leaf-inspector-canvas"
      />

      {/* Top Header Bar */}
      <header className="tea-leaf-inspector-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "8px", borderRadius: "12px", background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.25)", color: "#34d399", display: "flex", alignItems: "center" }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div className="tea-leaf-inspector-meta">
              ASTRA SPATIAL LABS · MOLECULAR VIEW
            </div>
            <h2 className="tea-leaf-inspector-title">
              Camellia Sinensis var. Sinensis
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="tea-leaf-inspector-close"
            aria-label="Exit leaf inspector"
          >
            <X size={18} />
          </button>
        )}
      </header>

      {/* Floating Controls Dock (Astra caliber glass pill) */}
      <nav className="tea-leaf-inspector-dock">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`tea-leaf-dock-btn ${autoRotate ? "is-active" : ""}`}
        >
          <Rotate3d size={13} />
          <span>{autoRotate ? "Orbiting" : "Paused"}</span>
        </button>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          className={`tea-leaf-dock-btn ${wireframe ? "is-active" : ""}`}
        >
          <Layers size={13} />
          <span>Topology</span>
        </button>

        <div style={{ height: "16px", width: "1px", background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />

        <div style={{ fontSize: "0.68rem", fontFamily: "monospace", color: "var(--ink-soft)", padding: "0 6px" }}>
          Drag to inspect 360°
        </div>
      </nav>

      {/* Interactive Hotspot Inspector Card (Claude / Kimi style) */}
      <aside className="tea-leaf-hotspots">
        {HOTSPOTS.map((spot) => {
          const isSelected = activeHotspot?.id === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => setActiveHotspot(spot)}
              className={`tea-hotspot-card ${isSelected ? "is-active" : ""}`}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.65rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", color: "#34d399" }}>
                  {spot.name}
                </span>
                <span style={{ fontSize: "0.65rem", fontFamily: "monospace", padding: "2px 8px", borderRadius: "999px", background: "rgba(52, 211, 153, 0.12)", color: "#a7f3d0", border: "1px solid rgba(52, 211, 153, 0.25)" }}>
                  {spot.stat}
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: "0.92rem", fontFamily: "Georgia, serif", color: "#f5efeb", fontWeight: 400 }}>
                {spot.title}
              </h4>
              {isSelected && (
                <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "rgba(243, 239, 229, 0.78)", lineHeight: 1.55 }}>
                  {spot.desc}
                </p>
              )}
            </div>
          );
        })}
      </aside>
    </div>
  );
}
