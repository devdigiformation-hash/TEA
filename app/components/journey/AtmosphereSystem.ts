import * as THREE from "three";

function createSoftParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.75)");
  grad.addColorStop(0.65, "rgba(255, 255, 255, 0.18)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export class AtmosphereSystem {
  public group: THREE.Group;
  private mistParticles: THREE.Points | null = null;
  private emberParticles: THREE.Points | null = null;
  private steamParticles: THREE.Points | null = null;
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];
  private particleTexture: THREE.CanvasTexture | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "AtmosphereSystem";
    this.initSystems();
  }

  private initSystems() {
    this.particleTexture = createSoftParticleTexture();

    // 1. Mountain mist & floating tea pollen particles
    const mistCount = 340;
    const mistGeom = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistCount * 3);

    for (let i = 0; i < mistCount; i++) {
      // Spread across origin terraces and harvest path
      mistPositions[i * 3 + 0] = (Math.random() - 0.5) * 85;
      mistPositions[i * 3 + 1] = 2 + Math.random() * 30;
      mistPositions[i * 3 + 2] = -40 + Math.random() * 165;
    }
    mistGeom.setAttribute("position", new THREE.BufferAttribute(mistPositions, 3));
    this.geometries.push(mistGeom);

    const mistMat = new THREE.PointsMaterial({
      color: 0xbed2c7,
      size: 2.2,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.materials.push(mistMat);

    this.mistParticles = new THREE.Points(mistGeom, mistMat);
    this.group.add(this.mistParticles);

    // 2. Roasting fire embers / sparks rising from hearth
    const emberCount = 120;
    const emberGeom = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3 + 0] = (Math.random() - 0.5) * 3.5;
      emberPositions[i * 3 + 1] = 1.2 + Math.random() * 4.0;
      emberPositions[i * 3 + 2] = -78 + (Math.random() - 0.5) * 3.5;

      emberVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.015;
      emberVelocities[i * 3 + 1] = 0.02 + Math.random() * 0.035;
      emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    emberGeom.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
    emberGeom.setAttribute("velocity", new THREE.BufferAttribute(emberVelocities, 3));
    this.geometries.push(emberGeom);

    const emberMat = new THREE.PointsMaterial({
      color: 0xff6a14,
      size: 0.85,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.materials.push(emberMat);

    this.emberParticles = new THREE.Points(emberGeom, emberMat);
    this.group.add(this.emberParticles);

    // 3. Final Cup Steam: Rising delicate vapor mirroring mountain mist
    const steamCount = 90;
    const steamGeom = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);

    for (let i = 0; i < steamCount; i++) {
      const height = (i / steamCount) * 1.8;
      const angle = i * 0.45;
      const radius = 0.08 + height * 0.16;
      steamPositions[i * 3 + 0] = Math.cos(angle) * radius;
      steamPositions[i * 3 + 1] = 1.7 + height;
      steamPositions[i * 3 + 2] = -316.5 + Math.sin(angle) * radius;
    }
    steamGeom.setAttribute("position", new THREE.BufferAttribute(steamPositions, 3));
    this.geometries.push(steamGeom);

    const steamMat = new THREE.PointsMaterial({
      color: 0xedebe4,
      size: 0.95,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.materials.push(steamMat);

    this.steamParticles = new THREE.Points(steamGeom, steamMat);
    this.group.add(this.steamParticles);
  }

  public update(time: number, journeyProgress: number) {
    // 1. Drift mist with mountain wind
    if (this.mistParticles) {
      const pos = this.mistParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        x += Math.sin(time * 0.4 + i) * 0.018;
        y += Math.cos(time * 0.3 + i) * 0.008;

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // 2. Animate embers rising near fire scene
    if (this.emberParticles) {
      // Boost ember visibility when near fire scene (progress ~0.55 - 0.70)
      const fireDist = Math.abs(journeyProgress - 0.6);
      const emberAlpha = Math.max(0, 1 - fireDist * 5);
      (this.emberParticles.material as THREE.PointsMaterial).opacity = 0.85 * emberAlpha;

      const pos = this.emberParticles.geometry.attributes.position as THREE.BufferAttribute;
      const vel = this.emberParticles.geometry.attributes.velocity as THREE.BufferAttribute;

      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + vel.getY(i);
        let x = pos.getX(i) + vel.getX(i) + Math.sin(time * 3 + i) * 0.006;
        let z = pos.getZ(i) + vel.getZ(i);

        // Reset if too high
        if (y > 5.5) {
          y = 1.3 + Math.random() * 0.3;
          x = (Math.random() - 0.5) * 3.0;
          z = -78 + (Math.random() - 0.5) * 3.0;
        }

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // 3. Animate rising steam curling from final cup
    if (this.steamParticles) {
      // Only active when approaching the cup (progress > 0.88)
      const cupFactor = Math.max(0, (journeyProgress - 0.85) / 0.15);
      (this.steamParticles.material as THREE.PointsMaterial).opacity = 0.42 * cupFactor;

      const pos = this.steamParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const initialY = 1.7 + (i / pos.count) * 1.8;
        // Travel upward
        const y = 1.7 + ((initialY - 1.7 + time * 0.25) % 1.8);
        const relY = y - 1.7;
        const angle = i * 0.45 + time * 1.2;
        const radius = 0.06 + relY * 0.14 + Math.sin(time * 2 + i) * 0.02;

        const x = Math.cos(angle) * radius;
        const z = -316.5 + Math.sin(angle) * radius;

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }
  }

  public dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.group.clear();
  }
}
