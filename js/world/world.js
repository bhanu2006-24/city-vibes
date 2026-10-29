// ============================================================
// CITY VIBES - GTA OPEN WORLD CONTROLLER
// Collisions, lighting, interactive zones, ocean boundary
// ============================================================

class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactiveSpots = [];
    this.currentDistrictId = 'downtown';
    this.districts = window.WorldMapData.districts;
    this.oceanRadius = window.WorldMapData.oceanRadius || 580;

    // Day/Night and atmospheric lighting
    this.initLighting();

    // Generate Island Map
    this.generate();
  }

  initLighting() {
    // Hemispheric Ambient Light (Soft sky and ground bounce)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x223344, 0.75);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    // Warm Sun Directional Light with Shadows
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.25);
    sunLight.position.set(120, 180, 90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);
    this.sunLight = sunLight;
  }

  generate() {
    window.WorldBuilder.buildIsland(this);
  }

  addCollider(x, z, width, depth) {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  addInteractiveZone(config) {
    // Beacon Visual (Pulsing holographic cylinder)
    const beaconGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.4, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: config.color || 0x00f0ff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.copy(config.position);
    beacon.position.y = 1.2;
    this.scene.add(beacon);

    const groundRing = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.8, 24),
      new THREE.MeshBasicMaterial({ color: config.color || 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.copy(config.position);
    groundRing.position.y = 0.15;
    this.scene.add(groundRing);

    this.interactiveSpots.push({
      ...config,
      mesh: beacon,
      groundRing: groundRing
    });
  }

  checkCollision(x, z, radius = 0.5) {
    // 1. Check ocean boundary
    const distFromCenter = Math.hypot(x, z);
    if (distFromCenter > this.oceanRadius - 10) {
      return true;
    }

    // 2. Check building colliders
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  getNearestInteractive(pos, maxDist = 4.5) {
    let nearest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.interactiveSpots.length; i++) {
      const spot = this.interactiveSpots[i];
      const dist = pos.distanceTo(spot.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = spot;
      }
    }
    return nearest;
  }

  checkSeaBoundary(pos) {
    const dist = Math.hypot(pos.x, pos.z);
    if (dist > this.oceanRadius - 30) {
      if (window.gameUI) {
        window.gameUI.showSeaWarning();
      }
      // Nudge player/vehicle back toward the island
      const angle = Math.atan2(pos.z, pos.x);
      pos.x = Math.cos(angle) * (this.oceanRadius - 35);
      pos.z = Math.sin(angle) * (this.oceanRadius - 35);
    }
  }

  update(delta, playerPos) {
    // Animate interactive beacon rings
    const time = Date.now() * 0.003;
    this.interactiveSpots.forEach(spot => {
      if (spot.mesh) {
        spot.mesh.rotation.y += delta * 1.5;
        spot.mesh.material.opacity = 0.4 + Math.sin(time) * 0.25;
      }
    });

    // Check ocean perimeter
    if (playerPos) {
      this.checkSeaBoundary(playerPos);

      // Check active district arrival
      for (let i = 0; i < this.districts.length; i++) {
        const d = this.districts[i];
        const b = d.bounds;
        if (
          playerPos.x >= b.minX && playerPos.x <= b.maxX &&
          playerPos.z >= b.minZ && playerPos.z <= b.maxZ
        ) {
          if (this.currentDistrictId !== d.id) {
            this.currentDistrictId = d.id;
            if (window.gameUI) {
              window.gameUI.showCityWelcome(d.name, d.tagline);
            }
          }
          break;
        }
      }
    }
  }
}

window.World = World;
