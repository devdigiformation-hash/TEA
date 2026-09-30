import * as THREE from "three";

/**
 * Creates procedural textures for organic details:
 * - Bark / wood grain
 * - Woven bamboo
 * - Stonework
 * - Ceramic glaze
 */
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#3d2a1d";
  ctx.fillRect(0, 0, 512, 512);

  // Wood streaks
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 4;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(28, 18, 12, 0.4)" : "rgba(82, 58, 41, 0.35)";
    ctx.fillRect(0, y, 512, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createBambooTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#948053";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#635334";
  ctx.lineWidth = 3;
  // Weave pattern
  for (let x = 0; x < 256; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y < 256; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#4a4f4b";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 8;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(35, 40, 36, 0.3)" : "rgba(95, 102, 96, 0.25)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

export class WorldBuilder {
  public worldGroup: THREE.Group;
  public animatedEmbers: THREE.PointLight | null = null;
  public teaSurfaceMesh: THREE.Mesh | null = null;
  private textures: THREE.Texture[] = [];
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];

  constructor() {
    this.worldGroup = new THREE.Group();
    this.worldGroup.name = "ContinuousTeaWorld";
  }

  public build(): THREE.Group {
    const woodTex = createWoodTexture();
    const bambooTex = createBambooTexture();
    const stoneTex = createStoneTexture();
    this.textures.push(woodTex, bambooTex, stoneTex);

    // Shared reusable materials
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x223023,
      roughness: 0.95,
      metalness: 0.05,
      map: stoneTex,
    });
    const mountainRockMat = new THREE.MeshStandardMaterial({
      color: 0x1d241f,
      roughness: 0.9,
      metalness: 0.1,
    });
    const teaBushMat = new THREE.MeshStandardMaterial({
      color: 0x2a542b,
      roughness: 0.65,
      metalness: 0.1,
    });
    const teaTipMat = new THREE.MeshStandardMaterial({
      color: 0x5da84a,
      roughness: 0.5,
      metalness: 0.15,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e29,
      roughness: 0.75,
      metalness: 0.1,
      map: woodTex,
    });
    const darkTimberMat = new THREE.MeshStandardMaterial({
      color: 0x251a14,
      roughness: 0.85,
      metalness: 0.05,
      map: woodTex,
    });
    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0xa89260,
      roughness: 0.7,
      metalness: 0.1,
      map: bambooTex,
    });
    const witheringLeafMat = new THREE.MeshStandardMaterial({
      color: 0x486438,
      roughness: 0.8,
      metalness: 0.05,
    });
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb86338,
      roughness: 0.35,
      metalness: 0.85,
    });
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0x2c2621,
      roughness: 0.4,
      metalness: 0.15,
    });
    const teaLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x544015,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.92,
    });

    this.materials.push(
      terrainMat,
      mountainRockMat,
      teaBushMat,
      teaTipMat,
      woodMat,
      darkTimberMat,
      bambooMat,
      witheringLeafMat,
      copperMat,
      ceramicMat,
      teaLiquidMat,
    );

    // ==========================================
    // ZONE 01 & 02: MOUNTAIN ORIGIN & HARVEST
    // ==========================================
    this.buildMountainsAndTerraces(terrainMat, mountainRockMat);
    this.buildTeaBushes(teaBushMat, teaTipMat);
    this.buildHarvestArea(woodMat, bambooMat, witheringLeafMat);

    // ==========================================
    // ZONE 03: DRYING / PROCESSING HOUSE
    // ==========================================
    this.buildProcessingHouse(darkTimberMat, woodMat, bambooMat, witheringLeafMat);

    // ==========================================
    // ZONE 04: ROASTING & HEARTH CHAMBER
    // ==========================================
    this.buildRoastingChamber(darkTimberMat, copperMat);

    // ==========================================
    // ZONE 05 & 06: MOUNTAIN PASSAGE & VALLEY ROAD
    // ==========================================
    this.buildMountainRoad(terrainMat, mountainRockMat, woodMat);

    // ==========================================
    // ZONE 07 & 08: TEA PAVILION & CEREMONY ROOM
    // ==========================================
    this.buildTeaPavilion(darkTimberMat, woodMat, bambooMat);

    // ==========================================
    // ZONE 09: FINAL CUP
    // ==========================================
    this.buildFinalCup(woodMat, ceramicMat, teaLiquidMat);

    return this.worldGroup;
  }

  /**
   * Builds majestic mountain background ridges and layered stepped terraces
   */
  private buildMountainsAndTerraces(
    terrainMat: THREE.Material,
    rockMat: THREE.Material,
  ) {
    // Distant mountain ridgelines
    const mountainGeom = new THREE.ConeGeometry(90, 140, 6);
    this.geometries.push(mountainGeom);

    const peaks = [
      { x: -140, y: 35, z: -80, scale: 1.3, rotY: 0.4 },
      { x: -80, y: 40, z: -120, scale: 1.6, rotY: 0.8 },
      { x: 50, y: 45, z: -130, scale: 1.7, rotY: -0.5 },
      { x: 120, y: 30, z: -70, scale: 1.2, rotY: 1.2 },
      { x: -20, y: 55, z: -170, scale: 2.1, rotY: 0.2 },
      { x: -160, y: 30, z: 40, scale: 1.4, rotY: 0.9 },
      { x: 140, y: 35, z: 60, scale: 1.5, rotY: -0.8 },
    ];

    peaks.forEach((peak) => {
      const mesh = new THREE.Mesh(mountainGeom, rockMat);
      mesh.position.set(peak.x, peak.y, peak.z);
      mesh.scale.set(peak.scale, peak.scale, peak.scale);
      mesh.rotation.y = peak.rotY;
      this.worldGroup.add(mesh);
    });

    // Terraced stepped ground slopes in Origin/Harvest zone
    const terraceCount = 9;
    for (let i = 0; i < terraceCount; i++) {
      const w = 90 - i * 4;
      const d = 16;
      const h = 2.4;
      const geom = new THREE.CylinderGeometry(w * 0.5, w * 0.52, h, 18);
      this.geometries.push(geom);
      const terrace = new THREE.Mesh(geom, terrainMat);
      // Slope stepped down towards harvest path
      terrace.position.set(10 - i * 1.5, (terraceCount - i) * 2.2, 100 - i * 11);
      terrace.scale.set(1.2, 1, 0.65);
      terrace.receiveShadow = true;
      this.worldGroup.add(terrace);
    }

    // Ground plane extension
    const groundGeom = new THREE.PlaneGeometry(350, 450, 24, 24);
    this.geometries.push(groundGeom);
    const ground = new THREE.Mesh(groundGeom, terrainMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.5, -90);
    ground.receiveShadow = true;
    this.worldGroup.add(ground);
  }

  /**
   * Instanced tea bushes planted along curved terrace contours
   */
  private buildTeaBushes(bushMat: THREE.Material, tipMat: THREE.Material) {
    const bushGeom = new THREE.SphereGeometry(1.4, 8, 7);
    bushGeom.scale(1.3, 0.75, 1.1);
    this.geometries.push(bushGeom);

    const tipGeom = new THREE.ConeGeometry(0.25, 0.6, 5);
    tipGeom.rotateX(Math.PI / 6);
    this.geometries.push(tipGeom);

    const totalBushes = 180;
    const instancedBushes = new THREE.InstancedMesh(bushGeom, bushMat, totalBushes);
    instancedBushes.castShadow = true;
    instancedBushes.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;

    // Arrange rows on the terraces
    for (let row = 0; row < 9; row++) {
      const rowZ = 95 - row * 10;
      const rowY = (9 - row) * 2.2 + 1.2;
      const countInRow = 16;
      for (let c = 0; c < countInRow; c++) {
        if (idx >= totalBushes) break;
        const offset = (c - countInRow / 2) * 2.6;
        const curve = Math.sin(c * 0.4) * 2.2;
        const x = 12 + offset + curve;
        const z = rowZ + Math.cos(c * 0.3) * 1.5;
        const scale = 0.85 + Math.sin(idx * 7) * 0.25;

        dummy.position.set(x, rowY, z);
        dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.2), scale);
        dummy.rotation.y = Math.sin(idx) * 2;
        dummy.updateMatrix();

        instancedBushes.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    instancedBushes.instanceMatrix.needsUpdate = true;
    this.worldGroup.add(instancedBushes);

    // Foreground hero tea bush with tender tips near camera path in Harvest zone
    const heroBushGroup = new THREE.Group();
    heroBushGroup.position.set(13.5, 5.2, 18);
    const heroMesh = new THREE.Mesh(bushGeom, bushMat);
    heroBushGroup.add(heroMesh);

    // Add tender young tea leaf buds (two leaves and a bud)
    for (let i = 0; i < 18; i++) {
      const tip = new THREE.Mesh(tipGeom, tipMat);
      const angle = (i / 18) * Math.PI * 2;
      const rad = 0.9 + (i % 3) * 0.25;
      tip.position.set(
        Math.cos(angle) * rad,
        0.55 + Math.sin(i * 3) * 0.25,
        Math.sin(angle) * rad,
      );
      tip.rotation.y = angle;
      tip.rotation.z = 0.2;
      heroBushGroup.add(tip);
    }
    this.worldGroup.add(heroBushGroup);
  }

  /**
   * Harvest baskets with freshly plucked tea leaves and stone path
   */
  private buildHarvestArea(
    woodMat: THREE.Material,
    bambooMat: THREE.Material,
    leafMat: THREE.Material,
  ) {
    const harvestGroup = new THREE.Group();
    harvestGroup.position.set(15, 4.4, 8);

    // Woven bamboo baskets
    const basketGeom = new THREE.CylinderGeometry(1.2, 0.85, 1.4, 16, 1, true);
    this.geometries.push(basketGeom);

    const leafPileGeom = new THREE.SphereGeometry(1.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    this.geometries.push(leafPileGeom);

    for (let b = 0; b < 3; b++) {
      const basket = new THREE.Group();
      basket.position.set((b - 1) * 2.2, 0.7, (b % 2) * 1.1);
      basket.rotation.y = b * 1.1;

      const basketMesh = new THREE.Mesh(basketGeom, bambooMat);
      basketMesh.castShadow = true;
      basket.add(basketMesh);

      // Leaves heaped inside
      const leaves = new THREE.Mesh(leafPileGeom, leafMat);
      leaves.position.y = 0.4;
      leaves.scale.set(0.9, 0.5, 0.9);
      basket.add(leaves);

      harvestGroup.add(basket);
    }

    // Stone pathway steps
    const stepGeom = new THREE.BoxGeometry(3.5, 0.4, 1.8);
    this.geometries.push(stepGeom);
    for (let s = 0; s < 12; s++) {
      const step = new THREE.Mesh(stepGeom, woodMat);
      step.position.set(14.5 - s * 0.4, 4.2 - s * 0.12, 16 - s * 3.4);
      step.rotation.y = 0.15;
      step.receiveShadow = true;
      this.worldGroup.add(step);
    }

    this.worldGroup.add(harvestGroup);
  }

  /**
   * Processing / Withering House (Zone 03)
   * Large open-sided timber structure with open doorway and tiered bamboo withering racks
   */
  private buildProcessingHouse(
    darkTimberMat: THREE.Material,
    woodMat: THREE.Material,
    bambooMat: THREE.Material,
    leafMat: THREE.Material,
  ) {
    const house = new THREE.Group();
    house.position.set(8, 0, -42);

    // Timber floor
    const floorGeom = new THREE.BoxGeometry(22, 0.6, 36);
    this.geometries.push(floorGeom);
    const floor = new THREE.Mesh(floorGeom, woodMat);
    floor.position.set(0, 0.3, 0);
    floor.receiveShadow = true;
    house.add(floor);

    // Roof truss & posts
    const postGeom = new THREE.BoxGeometry(0.55, 6.5, 0.55);
    this.geometries.push(postGeom);

    const postCoords = [
      [-10, -17], [-10, -6], [-10, 6], [-10, 17],
      [10, -17], [10, -6], [10, 6], [10, 17],
      // Doorway posts at Z = 17
      [-2.4, 17], [2.4, 17],
    ];

    postCoords.forEach(([px, pz]) => {
      const post = new THREE.Mesh(postGeom, darkTimberMat);
      post.position.set(px, 3.5, pz);
      post.castShadow = true;
      house.add(post);
    });

    // Cross beams
    const beamLongGeom = new THREE.BoxGeometry(0.5, 0.6, 36);
    this.geometries.push(beamLongGeom);
    const beamLeft = new THREE.Mesh(beamLongGeom, darkTimberMat);
    beamLeft.position.set(-10, 6.4, 0);
    house.add(beamLeft);
    const beamRight = new THREE.Mesh(beamLongGeom, darkTimberMat);
    beamRight.position.set(10, 6.4, 0);
    house.add(beamRight);

    // Sloped wooden shingle roof
    const roofGeom = new THREE.ConeGeometry(17, 4.5, 4);
    roofGeom.rotateY(Math.PI / 4);
    roofGeom.scale(1.4, 1, 2.3);
    this.geometries.push(roofGeom);
    const roof = new THREE.Mesh(roofGeom, darkTimberMat);
    roof.position.set(0, 8.5, 0);
    roof.castShadow = true;
    house.add(roof);

    // Woven bamboo withering trays stacked in tiered shelving
    const trayGeom = new THREE.CylinderGeometry(2.2, 2.2, 0.15, 20);
    this.geometries.push(trayGeom);
    const trayLeavesGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.08, 18);
    this.geometries.push(trayLeavesGeom);

    // Shelves on left and right sides of the interior path
    const rackSides = [-6, 6];
    rackSides.forEach((sideX) => {
      for (let z = -12; z <= 12; z += 6) {
        // Scaffolding stand
        for (let tier = 0; tier < 4; tier++) {
          const trayGroup = new THREE.Group();
          trayGroup.position.set(sideX, 1.4 + tier * 1.25, z);
          trayGroup.rotation.y = (sideX + z + tier) * 0.4;

          const trayMesh = new THREE.Mesh(trayGeom, bambooMat);
          trayMesh.castShadow = true;
          trayGroup.add(trayMesh);

          const leafLayer = new THREE.Mesh(trayLeavesGeom, leafMat);
          leafLayer.position.y = 0.08;
          trayGroup.add(leafLayer);

          house.add(trayGroup);
        }
      }
    });

    // Warm hanging lanterns in drying house
    const lanternGeom = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 8);
    this.geometries.push(lanternGeom);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffdfa0,
      emissive: 0xffa834,
      emissiveIntensity: 1.8,
    });
    this.materials.push(lanternMat);

    [-8, 0, 8].forEach((lz) => {
      const lantern = new THREE.Mesh(lanternGeom, lanternMat);
      lantern.position.set(0, 5.2, lz);
      house.add(lantern);
    });

    this.worldGroup.add(house);
  }

  /**
   * Roasting & Hearth Chamber (Zone 04)
   * Deep warm interior with stone hearth, glowing charcoal bed, copper roasting wok
   */
  private buildRoastingChamber(darkTimberMat: THREE.Material, copperMat: THREE.Material) {
    const hearthGroup = new THREE.Group();
    hearthGroup.position.set(0, 0, -78);

    // Stone hearth base
    const hearthGeom = new THREE.CylinderGeometry(3.6, 4.0, 1.2, 16);
    this.geometries.push(hearthGeom);
    const hearthMat = new THREE.MeshStandardMaterial({
      color: 0x332a22,
      roughness: 0.9,
    });
    this.materials.push(hearthMat);
    const hearth = new THREE.Mesh(hearthGeom, hearthMat);
    hearth.position.set(0, 0.6, 0);
    hearth.receiveShadow = true;
    hearthGroup.add(hearth);

    // Glowing charcoal bed
    const charcoalGeom = new THREE.CylinderGeometry(2.8, 2.8, 0.3, 16);
    this.geometries.push(charcoalGeom);
    const charcoalMat = new THREE.MeshStandardMaterial({
      color: 0xff3b0a,
      emissive: 0xff3300,
      emissiveIntensity: 2.8,
      roughness: 0.7,
    });
    this.materials.push(charcoalMat);
    const charcoal = new THREE.Mesh(charcoalGeom, charcoalMat);
    charcoal.position.set(0, 1.2, 0);
    hearthGroup.add(charcoal);

    // PointLight for dynamic fire pulsation
    const fireLight = new THREE.PointLight(0xff5511, 4.5, 22, 1.2);
    fireLight.position.set(0, 2.2, 0);
    fireLight.castShadow = true;
    hearthGroup.add(fireLight);
    this.animatedEmbers = fireLight;

    // Copper Roasting Wok / Pan
    const wokGeom = new THREE.SphereGeometry(2.5, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.2);
    this.geometries.push(wokGeom);
    const wok = new THREE.Mesh(wokGeom, copperMat);
    wok.position.set(0, 1.4, 0);
    wok.rotation.x = Math.PI;
    wok.castShadow = true;
    hearthGroup.add(wok);

    // Roasted tea leaves inside wok
    const roastedLeavesGeom = new THREE.CylinderGeometry(2.0, 1.8, 0.15, 16);
    this.geometries.push(roastedLeavesGeom);
    const roastedLeafMat = new THREE.MeshStandardMaterial({
      color: 0x231a0e,
      roughness: 0.9,
    });
    this.materials.push(roastedLeafMat);
    const roastedLeaves = new THREE.Mesh(roastedLeavesGeom, roastedLeafMat);
    roastedLeaves.position.set(0, 1.6, 0);
    hearthGroup.add(roastedLeaves);

    // Surrounding wooden partition & shelving
    const wallGeom = new THREE.BoxGeometry(16, 5.5, 0.4);
    this.geometries.push(wallGeom);
    const backWall = new THREE.Mesh(wallGeom, darkTimberMat);
    backWall.position.set(0, 2.75, -6);
    hearthGroup.add(backWall);

    this.worldGroup.add(hearthGroup);
  }

  /**
   * Mountain Road & Alpine Passage (Zones 05 & 06)
   * Outside roadway along mountain cliff, cedar trees, stone bridge over stream
   */
  private buildMountainRoad(
    terrainMat: THREE.Material,
    rockMat: THREE.Material,
    woodMat: THREE.Material,
  ) {
    const roadGroup = new THREE.Group();
    roadGroup.position.set(-22, 0, -155);

    // Winding road bed (segments)
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x5a554a,
      roughness: 0.95,
    });
    this.materials.push(roadMat);

    const segGeom = new THREE.BoxGeometry(6.5, 0.5, 24);
    this.geometries.push(segGeom);

    const roadSegments = [
      { x: 5, y: 11, z: 45, rotY: -0.2 },
      { x: -1, y: 13, z: 22, rotY: -0.05 },
      { x: -4, y: 15, z: 0, rotY: 0.15 },
      { x: -2, y: 13, z: -22, rotY: 0.25 },
      { x: 6, y: 9, z: -44, rotY: -0.1 },
      { x: 14, y: 5, z: -68, rotY: -0.3 },
    ];

    roadSegments.forEach((seg) => {
      const mesh = new THREE.Mesh(segGeom, roadMat);
      mesh.position.set(seg.x, seg.y, seg.z);
      mesh.rotation.y = seg.rotY;
      mesh.receiveShadow = true;
      roadGroup.add(mesh);
    });

    // Cedar and pine trees along the valley road
    const trunkGeom = new THREE.CylinderGeometry(0.4, 0.7, 7, 7);
    const foliageGeom = new THREE.ConeGeometry(3.4, 9, 7);
    this.geometries.push(trunkGeom, foliageGeom);

    const pineMat = new THREE.MeshStandardMaterial({
      color: 0x1b3423,
      roughness: 0.8,
    });
    this.materials.push(pineMat);

    const treePositions = [
      [-12, 13, 30], [-14, 15, 10], [-13, 14, -15], [-9, 10, -40],
      [14, 12, 35], [16, 11, 8], [12, 8, -30], [22, 4, -60],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);

      const trunk = new THREE.Mesh(trunkGeom, woodMat);
      trunk.position.y = 3.5;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(foliageGeom, pineMat);
      foliage.position.y = 8.5;
      foliage.castShadow = true;
      tree.add(foliage);

      roadGroup.add(tree);
    });

    // Wooden tea transport crates & packaged tea sacks beside road
    const crateGeom = new THREE.BoxGeometry(1.4, 1.2, 1.6);
    this.geometries.push(crateGeom);
    for (let c = 0; c < 4; c++) {
      const crate = new THREE.Mesh(crateGeom, woodMat);
      crate.position.set(-6 + c * 1.5, 15.6, 2 - c * 0.4);
      crate.rotation.y = c * 0.3;
      crate.castShadow = true;
      roadGroup.add(crate);
    }

    // Mountain stream bed below
    const waterGeom = new THREE.PlaneGeometry(24, 110);
    this.geometries.push(waterGeom);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x223e3e,
      roughness: 0.15,
      metalness: 0.85,
    });
    this.materials.push(waterMat);
    const stream = new THREE.Mesh(waterGeom, waterMat);
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(24, 0.5, 0);
    roadGroup.add(stream);

    this.worldGroup.add(roadGroup);
  }

  /**
   * Tea Pavilion & Ceremony Room (Zones 07 & 08)
   * Meditative timber architecture with veranda overlooking misty peaks
   */
  private buildTeaPavilion(
    darkTimberMat: THREE.Material,
    woodMat: THREE.Material,
    bambooMat: THREE.Material,
  ) {
    const pavilion = new THREE.Group();
    pavilion.position.set(0, 0, -305);

    // Tatami / cedar timber deck
    const deckGeom = new THREE.BoxGeometry(18, 0.6, 26);
    this.geometries.push(deckGeom);
    const deck = new THREE.Mesh(deckGeom, woodMat);
    deck.position.set(0, 0.3, 0);
    deck.receiveShadow = true;
    pavilion.add(deck);

    // Columns
    const colGeom = new THREE.BoxGeometry(0.5, 5.0, 0.5);
    this.geometries.push(colGeom);
    const cols = [
      [-8, -12], [-8, 0], [-8, 12],
      [8, -12], [8, 0], [8, 12],
    ];
    cols.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeom, darkTimberMat);
      col.position.set(cx, 2.8, cz);
      col.castShadow = true;
      pavilion.add(col);
    });

    // Low wooden tea ceremony table
    const tableTopGeom = new THREE.BoxGeometry(4.8, 0.25, 3.2);
    this.geometries.push(tableTopGeom);
    const tableTop = new THREE.Mesh(tableTopGeom, darkTimberMat);
    tableTop.position.set(0, 1.15, -11.5);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    pavilion.add(tableTop);

    // Table legs
    const legGeom = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    this.geometries.push(legGeom);
    [[-2, -1.2], [-2, 1.2], [2, -1.2], [2, 1.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeom, darkTimberMat);
      leg.position.set(lx, 0.6, -11.5 + lz);
      pavilion.add(leg);
    });

    // Bamboo tea mat on table
    const matGeom = new THREE.BoxGeometry(3.6, 0.04, 2.2);
    this.geometries.push(matGeom);
    const mat = new THREE.Mesh(matGeom, bambooMat);
    mat.position.set(0, 1.29, -11.5);
    pavilion.add(mat);

    // Ceramic kyusu teapot
    const potBodyGeom = new THREE.SphereGeometry(0.42, 16, 12);
    potBodyGeom.scale(1.2, 0.8, 1.2);
    this.geometries.push(potBodyGeom);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x3d352e,
      roughness: 0.45,
    });
    this.materials.push(potMat);
    const teapot = new THREE.Mesh(potBodyGeom, potMat);
    teapot.position.set(-1.1, 1.55, -11.6);
    teapot.castShadow = true;
    pavilion.add(teapot);

    // Bamboo water ladle (hishaku)
    const ladleHandleGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    ladleHandleGeom.rotateZ(Math.PI / 2.3);
    this.geometries.push(ladleHandleGeom);
    const ladle = new THREE.Mesh(ladleHandleGeom, bambooMat);
    ladle.position.set(1.2, 1.34, -11.8);
    pavilion.add(ladle);

    this.worldGroup.add(pavilion);
  }

  /**
   * Final Cup (Zone 09)
   * The destination: handcrafted ceramic chawan filled with clear amber-green tea
   */
  private buildFinalCup(
    woodMat: THREE.Material,
    ceramicMat: THREE.Material,
    teaLiquidMat: THREE.Material,
  ) {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(0, 1.31, -316.5);

    // Ceramic Chawan bowl
    const cupPoints: THREE.Vector2[] = [];
    cupPoints.push(new THREE.Vector2(0, 0));
    cupPoints.push(new THREE.Vector2(0.32, 0));
    cupPoints.push(new THREE.Vector2(0.35, 0.06));
    cupPoints.push(new THREE.Vector2(0.55, 0.32));
    cupPoints.push(new THREE.Vector2(0.58, 0.48));
    cupPoints.push(new THREE.Vector2(0.56, 0.5));
    cupPoints.push(new THREE.Vector2(0.52, 0.47));
    cupPoints.push(new THREE.Vector2(0.38, 0.22));
    cupPoints.push(new THREE.Vector2(0.24, 0.08));
    cupPoints.push(new THREE.Vector2(0, 0.08));

    const cupGeom = new THREE.LatheGeometry(cupPoints, 48);
    this.geometries.push(cupGeom);
    const cupMesh = new THREE.Mesh(cupGeom, ceramicMat);
    cupMesh.castShadow = true;
    cupMesh.receiveShadow = true;
    cupGroup.add(cupMesh);

    // Tea Liquid disk inside cup
    const liquidGeom = new THREE.CircleGeometry(0.5, 36);
    liquidGeom.rotateX(-Math.PI / 2);
    this.geometries.push(liquidGeom);
    const liquid = new THREE.Mesh(liquidGeom, teaLiquidMat);
    liquid.position.set(0, 0.38, 0);
    cupGroup.add(liquid);
    this.teaSurfaceMesh = liquid;

    // Small wooden coaster
    const coasterGeom = new THREE.CylinderGeometry(0.48, 0.52, 0.05, 36);
    this.geometries.push(coasterGeom);
    const coaster = new THREE.Mesh(coasterGeom, woodMat);
    coaster.position.set(0, 0.025, 0);
    cupGroup.add(coaster);

    // Warm subtle underlight for the tea bowl
    const cupGlow = new THREE.PointLight(0xffe2b8, 1.8, 5.0, 1.5);
    cupGlow.position.set(0, 0.7, 0);
    cupGroup.add(cupGlow);

    this.worldGroup.add(cupGroup);
  }

  public update(time: number) {
    // Charcoal hearth fire subtle breathing flicker
    if (this.animatedEmbers) {
      const flicker = Math.sin(time * 7) * 0.4 + Math.cos(time * 11) * 0.3;
      this.animatedEmbers.intensity = 4.2 + flicker;
    }

    // Gentle shimmer on tea surface
    if (this.teaSurfaceMesh) {
      this.teaSurfaceMesh.rotation.y = time * 0.05;
    }
  }

  public dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.worldGroup.clear();
  }
}
