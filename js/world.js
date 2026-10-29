// ============================================================
// CITY VIBES - 3D PROCEDURAL EXPANDED WORLD (6 CITIES/DISTRICTS)
// Metropolis, Vice Beach, Industrial Docks, Suburbs, Badlands & Chinatown
// With Rooftop Sniper Vantage Points & Safehouse Interiors!
// ============================================================

class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Bounding boxes for collision detection
    this.interactiveSpots = []; // Landmarks, elevators, interiors, shops
    this.streetLights = [];
    this.dayNightCycle = 0.3;
    this.citySize = 1400; // -700 to +700
    this.blockSize = 60;
    this.roadWidth = 18;
    this.gridBlocks = 11; // -5 to +5 blocks in X and Z
  }

  generate() {
    this.createGroundAndRegions();
    this.createRoadsAndIntersections();
    this.createDistrictsAndBuildings();
    this.createStreetFurniture();
    this.createKeyLandmarks();
    this.createRooftopSniperVantagePoints();
    this.createPenthouseInterior();
    this.createVegetation();
  }

  createGroundAndRegions() {
    // 1. Central Metropolis Grass Terrain
    const groundGeo = new THREE.PlaneGeometry(this.citySize, this.citySize);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x162215 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Vice Coast Beach & Ocean Bay (East: X > 150)
    const oceanGeo = new THREE.PlaneGeometry(600, this.citySize);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x0b3c5d,
      transparent: true,
      opacity: 0.88,
      shininess: 95
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(550, -0.15, 0);
    this.scene.add(ocean);

    // Sandy Shore strip
    const sandGeo = new THREE.PlaneGeometry(120, this.citySize);
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xdfc27d });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(240, 0.05, 0);
    this.scene.add(sand);

    // 3. Badlands Desert Outskirts (North-West: X < -180, Z > 180)
    const desertGeo = new THREE.PlaneGeometry(500, 500);
    const desertMat = new THREE.MeshLambertMaterial({ color: 0xb5651d }); // reddish desert sand
    const desert = new THREE.Mesh(desertGeo, desertMat);
    desert.rotation.x = -Math.PI / 2;
    desert.position.set(-350, 0.02, 350);
    this.scene.add(desert);

    // Canyon rocks in Desert
    for (let r = 0; r < 14; r++) {
      const rockGeo = new THREE.DodecahedronGeometry(8 + Math.random() * 12, 1);
      const rockMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = -250 - Math.random() * 200;
      const rz = 220 + Math.random() * 240;
      rock.position.set(rx, 4, rz);
      rock.scale.set(1.4, 0.9, 1.4);
      this.scene.add(rock);
      this.addCollider(rx, rz, 14, 14);
    }
  }

  createRoadsAndIntersections() {
    const totalStep = this.blockSize + this.roadWidth; // 78
    const halfSpan = Math.floor(this.gridBlocks / 2) * totalStep;

    const roadMat = new THREE.MeshLambertMaterial({ color: 0x222225 });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x757a7d });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xe8b82a });

    for (let i = -Math.floor(this.gridBlocks / 2); i <= Math.floor(this.gridBlocks / 2); i++) {
      const coord = i * totalStep;

      // Vertical Roads (North-South)
      const roadVGeo = new THREE.PlaneGeometry(this.roadWidth, this.citySize);
      const roadV = new THREE.Mesh(roadVGeo, roadMat);
      roadV.rotation.x = -Math.PI / 2;
      roadV.position.set(coord, 0.01, 0);
      roadV.receiveShadow = true;
      this.scene.add(roadV);

      // Horizontal Roads (East-West)
      const roadHGeo = new THREE.PlaneGeometry(this.citySize, this.roadWidth);
      const roadH = new THREE.Mesh(roadHGeo, roadMat);
      roadH.rotation.x = -Math.PI / 2;
      roadH.position.set(0, 0.01, coord);
      roadH.receiveShadow = true;
      this.scene.add(roadH);

      // Double yellow center stripes
      const markVGeo = new THREE.PlaneGeometry(0.3, this.citySize);
      const markV1 = new THREE.Mesh(markVGeo, yellowMat);
      markV1.rotation.x = -Math.PI / 2;
      markV1.position.set(coord - 0.25, 0.02, 0);
      this.scene.add(markV1);

      const markV2 = new THREE.Mesh(markVGeo, yellowMat);
      markV2.rotation.x = -Math.PI / 2;
      markV2.position.set(coord + 0.25, 0.02, 0);
      this.scene.add(markV2);

      const markHGeo = new THREE.PlaneGeometry(this.citySize, 0.3);
      const markH1 = new THREE.Mesh(markHGeo, yellowMat);
      markH1.rotation.x = -Math.PI / 2;
      markH1.position.set(0, 0.02, coord - 0.25);
      this.scene.add(markH1);

      const markH2 = new THREE.Mesh(markHGeo, yellowMat);
      markH2.rotation.x = -Math.PI / 2;
      markH2.position.set(0, 0.02, coord + 0.25);
      this.scene.add(markH2);
    }

    // Sidewalk slabs
    for (let x = -Math.floor(this.gridBlocks / 2); x <= Math.floor(this.gridBlocks / 2) - 1; x++) {
      for (let z = -Math.floor(this.gridBlocks / 2); z <= Math.floor(this.gridBlocks / 2) - 1; z++) {
        const cx = (x + 0.5) * totalStep;
        const cz = (z + 0.5) * totalStep;

        const sidewalkGeo = new THREE.BoxGeometry(this.blockSize, 0.3, this.blockSize);
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(cx, 0.15, cz);
        sidewalk.receiveShadow = true;
        this.scene.add(sidewalk);
      }
    }
  }

  createDistrictsAndBuildings() {
    const totalStep = this.blockSize + this.roadWidth;

    for (let x = -Math.floor(this.gridBlocks / 2); x <= Math.floor(this.gridBlocks / 2) - 1; x++) {
      for (let z = -Math.floor(this.gridBlocks / 2); z <= Math.floor(this.gridBlocks / 2) - 1; z++) {
        const cx = (x + 0.5) * totalStep;
        const cz = (z + 0.5) * totalStep;

        // Skip dedicated landmark blocks:
        if (
          (x === 0 && z === 0) || // Citadel
          (x === -1 && z === 0) || // Hospital
          (x === 1 && z === 0) || // Pizzeria
          (x === 0 && z === 1) || // Taxi Depot
          (x === -1 && z === 1) || // Mechanic Garage
          (x === -2 && z === -2) || // Assassin Guild
          (x === 1 && z === 1) || // Car Dealership
          (x === 0 && z === -1) // Clothes & Armory
        ) {
          continue;
        }

        // REGION 1: Downtown Metropolis Skyscraper District (center: |x|<=1, |z|<=1)
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) {
          this.buildSkyscraperCluster(cx, cz);
        }
        // REGION 2: Vice Coast / Beach Mansions (East: x >= 2, z <= 1)
        else if (x >= 2 && z <= 1) {
          this.buildBeachfrontVillas(cx, cz);
        }
        // REGION 3: Industrial Port & Docks (South-West: x <= -2, z <= -2)
        else if (x <= -2 && z <= -2) {
          this.buildIndustrialWarehouses(cx, cz);
        }
        // REGION 4: Maple Valley Suburbs (North-East: x >= 2, z >= 2)
        else if (x >= 2 && z >= 2) {
          this.buildSuburbanHouses(cx, cz);
        }
        // REGION 5: Badlands Desert Outskirts (North-West: x <= -2, z >= 2)
        else if (x <= -2 && z >= 2) {
          this.buildDesertOutpost(cx, cz);
        }
        // REGION 6: Chinatown / Neo District (South-East: |x| <= 1, z <= -2)
        else if (Math.abs(x) <= 1 && z <= -2) {
          this.buildChinatownDistrict(cx, cz);
        }
        // Commercial Mid-rises everywhere else
        else {
          this.buildCommercialMidrises(cx, cz);
        }
      }
    }
  }

  buildSkyscraperCluster(cx, cz) {
    const heights = [70, 95, 120, 80];
    const offsets = [
      [-14, -14],
      [14, -14],
      [-14, 14],
      [14, 14]
    ];

    offsets.forEach((off, idx) => {
      const h = heights[idx] + Math.random() * 15;
      const w = 18;
      const d = 18;
      const bColor = [0x1e272c, 0x22313f, 0x1f3a52, 0x2b3e50][idx % 4];

      const bGeo = new THREE.BoxGeometry(w, h, d);
      const bMat = new THREE.MeshLambertMaterial({ color: bColor });
      const tower = new THREE.Mesh(bGeo, bMat);
      tower.position.set(cx + off[0], h / 2 + 0.3, cz + off[1]);
      tower.castShadow = true;
      tower.receiveShadow = true;
      this.scene.add(tower);

      this.addCollider(cx + off[0], cz + off[1], w, d);

      // Glowing Neon Accent Strips
      const stripGeo = new THREE.BoxGeometry(0.3, h - 4, 0.3);
      const stripMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0xff0077
      });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(cx + off[0] + w / 2, h / 2, cz + off[1] + d / 2);
      this.scene.add(strip);
    });
  }

  buildBeachfrontVillas(cx, cz) {
    // Luxury seaside villas with white stucco and glass balconies
    const villaGeo = new THREE.BoxGeometry(42, 14, 38);
    const villaMat = new THREE.MeshPhongMaterial({ color: 0xfdfefe, shininess: 80 });
    const villa = new THREE.Mesh(villaGeo, villaMat);
    villa.position.set(cx, 7 + 0.3, cz);
    this.scene.add(villa);
    this.addCollider(cx, cz, 42, 38);

    // Blue Swimming Pool
    const poolGeo = new THREE.BoxGeometry(16, 0.4, 24);
    const poolMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(cx + 22, 0.25, cz);
    this.scene.add(pool);
  }

  buildCommercialMidrises(cx, cz) {
    const bGeo = new THREE.BoxGeometry(40, 32, 40);
    const bMat = new THREE.MeshLambertMaterial({ color: 0x394b59 });
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(cx, 16 + 0.3, cz);
    building.castShadow = true;
    building.receiveShadow = true;
    this.scene.add(building);
    this.addCollider(cx, cz, 40, 40);

    for (let f = 4; f < 30; f += 6) {
      const bandGeo = new THREE.BoxGeometry(40.4, 2.5, 40.4);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0x1f5470 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(cx, f, cz);
      this.scene.add(band);
    }
  }

  buildSuburbanHouses(cx, cz) {
    const houseCoords = [
      [-13, -13],
      [13, -13],
      [-13, 13],
      [13, 13]
    ];
    const roofColors = [0x8b2500, 0x4a5d4e, 0x334455, 0x78553d];

    houseCoords.forEach((off, idx) => {
      const hx = cx + off[0];
      const hz = cz + off[1];

      const bodyGeo = new THREE.BoxGeometry(15, 8, 15);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(hx, 4 + 0.3, hz);
      body.castShadow = true;
      body.receiveShadow = true;
      this.scene.add(body);

      const roofGeo = new THREE.ConeGeometry(12.5, 5.5, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: roofColors[idx % 4] });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(hx, 8 + 2.75 + 0.3, hz);
      roof.castShadow = true;
      this.scene.add(roof);

      this.addCollider(hx, hz, 15, 15);
    });
  }

  buildDesertOutpost(cx, cz) {
    // Route 66 Motel & Diner
    const motelGeo = new THREE.BoxGeometry(44, 9, 32);
    const motelMat = new THREE.MeshLambertMaterial({ color: 0x935116 });
    const motel = new THREE.Mesh(motelGeo, motelMat);
    motel.position.set(cx, 4.5 + 0.3, cz);
    this.scene.add(motel);
    this.addCollider(cx, cz, 44, 32);

    // Neon Route 66 Cactus Sign
    const signGeo = new THREE.BoxGeometry(8, 3, 0.5);
    const signMat = new THREE.MeshBasicMaterial({ color: 0x27ae60 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(cx, 12, cz - 16.3);
    this.scene.add(sign);
  }

  buildChinatownDistrict(cx, cz) {
    // Pagoda style commercial building
    const baseGeo = new THREE.BoxGeometry(38, 22, 38);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x7b241c });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(cx, 11 + 0.3, cz);
    this.scene.add(base);
    this.addCollider(cx, cz, 38, 38);

    // Flared Pagoda Roof tiers
    [12, 18, 24].forEach((h, i) => {
      const roofGeo = new THREE.ConeGeometry(24 - i * 4, 3, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0xd4ac0d }); // Golden yellow tiles
      const r = new THREE.Mesh(roofGeo, roofMat);
      r.rotation.y = Math.PI / 4;
      r.position.set(cx, h, cz);
      this.scene.add(r);
    });

    // Glowing Red Paper Lanterns
    for (let l = 0; l < 4; l++) {
      const lanGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const lanMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const lan = new THREE.Mesh(lanGeo, lanMat);
      lan.position.set(cx - 15 + l * 10, 6, cz - 20);
      this.scene.add(lan);
    }
  }

  buildIndustrialWarehouses(cx, cz) {
    const whGeo = new THREE.BoxGeometry(44, 15, 30);
    const whMat = new THREE.MeshLambertMaterial({ color: 0x4d5656 });
    const wh = new THREE.Mesh(whGeo, whMat);
    wh.position.set(cx, 7.5 + 0.3, cz - 6);
    wh.castShadow = true;
    wh.receiveShadow = true;
    this.scene.add(wh);
    this.addCollider(cx, cz - 6, 44, 30);

    const colors = [0xb03a2e, 0x1f618d, 0x229954, 0xd4ac0d];
    for (let c = 0; c < 4; c++) {
      const cGeo = new THREE.BoxGeometry(11, 4.5, 4.5);
      const cMat = new THREE.MeshLambertMaterial({ color: colors[c % colors.length] });
      const container = new THREE.Mesh(cGeo, cMat);
      container.position.set(cx - 12 + c * 7, 2.25 + (c % 2) * 4.5 + 0.3, cz + 16);
      container.castShadow = true;
      this.scene.add(container);
      this.addCollider(cx - 12 + c * 7, cz + 16, 11, 4.5);
    }
  }

  // ------------------------------------------------------------
  // ROOFTOP SNIPER VANTAGE POINTS & ELEVATORS
  // ------------------------------------------------------------

  createRooftopSniperVantagePoints() {
    const totalStep = this.blockSize + this.roadWidth;
    const citadelPos = { x: 0.5 * totalStep, z: 0.5 * totalStep }; // (39, 39)

    // 1. CITADEL ROOFTOP HELIPAD & SNIPER PLATFORM (Y = 138m)
    const roofPlatformGeo = new THREE.BoxGeometry(26, 1.5, 26);
    const roofPlatformMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const roof = new THREE.Mesh(roofPlatformGeo, roofPlatformMat);
    roof.position.set(citadelPos.x, 137.5, citadelPos.z);
    this.scene.add(roof);

    // Safety perimeter railings & sandbag cover
    const railMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const railNorth = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.4), railMat);
    railNorth.position.set(citadelPos.x, 139, citadelPos.z - 12.8);
    this.scene.add(railNorth);

    const railSouth = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.4), railMat);
    railSouth.position.set(citadelPos.x, 139, citadelPos.z + 12.8);
    this.scene.add(railSouth);

    // Helipad Yellow 'H'
    const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 10), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    hBar1.position.set(citadelPos.x - 3.5, 138.3, citadelPos.z);
    this.scene.add(hBar1);

    const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 10), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    hBar2.position.set(citadelPos.x + 3.5, 138.3, citadelPos.z);
    this.scene.add(hBar2);

    const hMid = new THREE.Mesh(new THREE.BoxGeometry(7, 0.1, 1.2), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    hMid.position.set(citadelPos.x, 138.3, citadelPos.z);
    this.scene.add(hMid);

    // Ground Elevator Entrance to Rooftop
    this.addInteractiveZone({
      id: 'citadel_elevator_up',
      type: 'teleport',
      name: 'Citadel High-Speed Elevator to Rooftop',
      desc: 'Ride express elevator up to the 138-meter Citadel Rooftop (Prime Sniper Vantage Point)!',
      position: new THREE.Vector3(citadelPos.x, 0.5, citadelPos.z - 19),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(citadelPos.x, 138.5, citadelPos.z - 8)
    });

    // Rooftop Elevator Return to Ground
    this.addInteractiveZone({
      id: 'citadel_elevator_down',
      type: 'teleport',
      name: 'Rooftop Elevator Down to Street Level',
      desc: 'Return to ground-level central metropolis plaza.',
      position: new THREE.Vector3(citadelPos.x, 138.5, citadelPos.z - 9),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(citadelPos.x, 1.0, citadelPos.z - 17)
    });
  }

  createPenthouseInterior() {
    // Luxury Penthouse Interior Suite (Hovering at Y = 75m inside central tower)
    const totalStep = this.blockSize + this.roadWidth;
    const px = 0.5 * totalStep;
    const pz = 0.5 * totalStep;
    const py = 75;

    // Floor & Walls
    const floorGeo = new THREE.BoxGeometry(22, 0.5, 22);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x1f2421 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(px, py, pz);
    this.scene.add(floor);

    // Leather Couch
    const couchGeo = new THREE.BoxGeometry(7, 1.5, 2.5);
    const couchMat = new THREE.MeshLambertMaterial({ color: 0x4a2311 });
    const couch = new THREE.Mesh(couchGeo, couchMat);
    couch.position.set(px, py + 1.0, pz - 6);
    this.scene.add(couch);

    // Master Bed (Rest & Heal to 100% HP)
    const bedGeo = new THREE.BoxGeometry(5, 1.2, 6);
    const bedMat = new THREE.MeshLambertMaterial({ color: 0x7f1d1d });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(px + 7, py + 0.8, pz + 5);
    this.scene.add(bed);

    // Dark Web Contract Laptop Desk
    const deskGeo = new THREE.BoxGeometry(4, 1.4, 2);
    const deskMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(px - 7, py + 0.9, pz + 5);
    this.scene.add(desk);

    const screenGeo = new THREE.BoxGeometry(1.4, 1.0, 0.1);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const laptop = new THREE.Mesh(screenGeo, screenMat);
    laptop.position.set(px - 7, py + 2.0, pz + 5);
    this.scene.add(laptop);

    // Penthouse Interior Entrance Beacon (Ground)
    this.addInteractiveZone({
      id: 'penthouse_enter',
      type: 'teleport',
      name: 'Penthouse Private Elevator (Safehouse Suite)',
      desc: 'Enter your luxury high-rise safehouse. Rest in master bed to heal 100% HP & browse contracts.',
      position: new THREE.Vector3(px + 12, 0.5, pz - 19),
      color: 0x9b59b6,
      action: 'teleport_heal',
      targetPos: new THREE.Vector3(px, py + 1.2, pz)
    });

    // Penthouse Interior Exit Beacon
    this.addInteractiveZone({
      id: 'penthouse_exit',
      type: 'teleport',
      name: 'Penthouse Exit to Street',
      desc: 'Take private elevator back down to city streets.',
      position: new THREE.Vector3(px, py + 1.0, pz - 9),
      color: 0x9b59b6,
      action: 'teleport',
      targetPos: new THREE.Vector3(px + 12, 1.0, pz - 17)
    });
  }

  // ------------------------------------------------------------
  // KEY LANDMARKS
  // ------------------------------------------------------------

  createKeyLandmarks() {
    const totalStep = this.blockSize + this.roadWidth;
    const blockCenter = (bx, bz) => ({ x: (bx + 0.5) * totalStep, z: (bz + 0.5) * totalStep });

    // 1. ST. JUDE CITY HOSPITAL at (-1, 0)
    const hosp = blockCenter(-1, 0);
    this.buildHospital(hosp.x, hosp.z);

    // 2. LUIGI'S PIZZERIA at (1, 0)
    const pizza = blockCenter(1, 0);
    this.buildPizzeria(pizza.x, pizza.z);

    // 3. METRO CAB DEPOT at (0, 1)
    const taxi = blockCenter(0, 1);
    this.buildTaxiDepot(taxi.x, taxi.z);

    // 4. CITY CUSTOMS MECHANIC & TUNING at (-1, 1)
    const mechanic = blockCenter(-1, 1);
    this.buildCustomsMechanicShop(mechanic.x, mechanic.z);

    // 5. THE BLACK LOTUS ASSASSIN GUILD at (-2, -2)
    const guild = blockCenter(-2, -2);
    this.buildAssassinGuild(guild.x, guild.z);

    // 6. APEX CAR DEALERSHIP at (1, 1)
    const dealer = blockCenter(1, 1);
    this.buildCarDealership(dealer.x, dealer.z);

    // 7. URBAN THREADS & ARMORY at (0, -1)
    const shop = blockCenter(0, -1);
    this.buildClothesAndArmoryShop(shop.x, shop.z);

    // 8. CITADEL DOWNTOWN TOWER at (0, 0)
    const citadel = blockCenter(0, 0);
    this.buildCitadelTower(citadel.x, citadel.z);

    // 9. REAL ESTATE PROPERTIES across all districts
    this.buildRealEstateProperties(totalStep);
  }

  buildHospital(x, z) {
    const hGeo = new THREE.BoxGeometry(42, 24, 38);
    const hMat = new THREE.MeshLambertMaterial({ color: 0xecf0f1 });
    const hospital = new THREE.Mesh(hGeo, hMat);
    hospital.position.set(x, 12 + 0.3, z);
    hospital.castShadow = true;
    hospital.receiveShadow = true;
    this.scene.add(hospital);
    this.addCollider(x, z, 42, 38);

    const cV = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 0.6), new THREE.MeshBasicMaterial({ color: 0xee1111 }));
    cV.position.set(x, 18, z + 19.3);
    this.scene.add(cV);

    const cH = new THREE.Mesh(new THREE.BoxGeometry(9, 2.5, 0.6), new THREE.MeshBasicMaterial({ color: 0xee1111 }));
    cH.position.set(x, 18, z + 19.3);
    this.scene.add(cH);

    this.addInteractiveZone({
      id: 'job_ambulance',
      type: 'job',
      name: 'St. Jude Hospital (Ambulance Job)',
      desc: 'Work as an Emergency Paramedic. Rush injured citizens to the ER!',
      position: new THREE.Vector3(x, 0.5, z - 24),
      color: 0xff2222,
      action: 'ambulance_job'
    });
  }

  buildPizzeria(x, z) {
    const pGeo = new THREE.BoxGeometry(34, 14, 28);
    const pMat = new THREE.MeshLambertMaterial({ color: 0xcd6155 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(x, 7 + 0.3, z);
    this.scene.add(pMesh);
    this.addCollider(x, z, 34, 28);

    const sign = new THREE.Mesh(new THREE.ConeGeometry(5, 7, 3), new THREE.MeshBasicMaterial({ color: 0xf1c40f }));
    sign.rotation.z = Math.PI / 2;
    sign.position.set(x, 17, z - 10);
    this.scene.add(sign);

    this.addInteractiveZone({
      id: 'job_delivery',
      type: 'job',
      name: "Luigi's Express (Delivery Boy Job)",
      desc: 'Deliver hot pizzas and parcels across the city before time runs out!',
      position: new THREE.Vector3(x, 0.5, z - 20),
      color: 0xf39c12,
      action: 'delivery_job'
    });
  }

  buildTaxiDepot(x, z) {
    const tGeo = new THREE.BoxGeometry(36, 12, 30);
    const tMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const depot = new THREE.Mesh(tGeo, tMat);
    depot.position.set(x, 6 + 0.3, z);
    this.scene.add(depot);
    this.addCollider(x, z, 36, 30);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 2.8, 1.8), new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
    sign.position.set(x, 13.5, z - 10);
    this.scene.add(sign);

    this.addInteractiveZone({
      id: 'job_taxi',
      type: 'job',
      name: 'Metro Cab Depot (Cab Driver Job)',
      desc: 'Drive a city taxi. Pick up passengers and drop them off for generous fares!',
      position: new THREE.Vector3(x, 0.5, z - 20),
      color: 0xffcc00,
      action: 'taxi_job'
    });
  }

  buildCustomsMechanicShop(x, z) {
    const mGeo = new THREE.BoxGeometry(38, 13, 32);
    const mMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const shop = new THREE.Mesh(mGeo, mMat);
    shop.position.set(x, 6.5 + 0.3, z);
    this.scene.add(shop);
    this.addCollider(x, z, 38, 32);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 0.8), new THREE.MeshBasicMaterial({ color: 0xff7043 }));
    sign.position.set(x, 12, z - 16.2);
    this.scene.add(sign);

    this.addInteractiveZone({
      id: 'shop_mechanic',
      type: 'shop',
      name: 'City Customs (Mechanic & Tuning Shop)',
      desc: 'Repair vehicle, install Nitro Boost (NOS), engine performance tuning, drift suspension, and custom paint!',
      position: new THREE.Vector3(x, 0.5, z - 22),
      color: 0xff7043,
      action: 'open_mechanic'
    });
  }

  buildAssassinGuild(x, z) {
    const gGeo = new THREE.BoxGeometry(40, 16, 40);
    const gMat = new THREE.MeshLambertMaterial({ color: 0x11161d });
    const hideout = new THREE.Mesh(gGeo, gMat);
    hideout.position.set(x, 8 + 0.3, z);
    this.scene.add(hideout);
    this.addCollider(x, z, 40, 40);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.35, 8, 24), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
    ring.position.set(x, 11, z + 20.2);
    this.scene.add(ring);

    this.addInteractiveZone({
      id: 'guild_entrance',
      type: 'guild',
      name: "The Black Lotus (Assassin's Guild)",
      desc: 'Underground contract board. Hunt targets, photograph their bodies, collect bounties!',
      position: new THREE.Vector3(x, 0.5, z + 24),
      color: 0xff0044,
      action: 'open_guild'
    });
  }

  buildCarDealership(x, z) {
    const dGeo = new THREE.BoxGeometry(40, 14, 38);
    const dMat = new THREE.MeshPhongMaterial({ color: 0x1a252f, shininess: 70 });
    const dealer = new THREE.Mesh(dGeo, dMat);
    dealer.position.set(x, 7 + 0.3, z);
    this.scene.add(dealer);
    this.addCollider(x, z, 40, 38);

    const glass = new THREE.Mesh(new THREE.BoxGeometry(36, 7.5, 0.4), new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.6 }));
    glass.position.set(x, 5.5, z - 19.2);
    this.scene.add(glass);

    this.addInteractiveZone({
      id: 'shop_cars',
      type: 'shop',
      name: 'Apex Exotic Motors (Car Dealership)',
      desc: 'Purchase supercars, muscle cars, delivery bikes, taxis, and ambulances!',
      position: new THREE.Vector3(x, 0.5, z - 24),
      color: 0x00f5d4,
      action: 'open_cardealer'
    });
  }

  buildClothesAndArmoryShop(x, z) {
    const shop = new THREE.Mesh(new THREE.BoxGeometry(20, 13, 30), new THREE.MeshLambertMaterial({ color: 0x5b2c6f }));
    shop.position.set(x - 10, 6.5 + 0.3, z);
    this.scene.add(shop);
    this.addCollider(x - 10, z, 20, 30);

    const armory = new THREE.Mesh(new THREE.BoxGeometry(18, 13, 30), new THREE.MeshLambertMaterial({ color: 0x2e4053 }));
    armory.position.set(x + 11, 6.5 + 0.3, z);
    this.scene.add(armory);
    this.addCollider(x + 11, z, 18, 30);

    this.addInteractiveZone({
      id: 'shop_clothes',
      type: 'shop',
      name: 'Urban Threads & Character Studio',
      desc: 'Customize your style, skin tone, hair, sunglasses, and outfits!',
      position: new THREE.Vector3(x - 10, 0.5, z - 18),
      color: 0x9b59b6,
      action: 'open_clothes'
    });

    this.addInteractiveZone({
      id: 'shop_armory',
      type: 'shop',
      name: 'Underground Armory & Optics',
      desc: 'Purchase silenced pistols, sniper rifles with tactical scopes, and body armor!',
      position: new THREE.Vector3(x + 11, 0.5, z - 18),
      color: 0xe67e22,
      action: 'open_armory'
    });
  }

  buildCitadelTower(x, z) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(36, 45, 36), new THREE.MeshLambertMaterial({ color: 0x1a1e24 }));
    base.position.set(x, 22.5 + 0.3, z);
    this.scene.add(base);

    const mid = new THREE.Mesh(new THREE.BoxGeometry(28, 55, 28), new THREE.MeshLambertMaterial({ color: 0x11161d }));
    mid.position.set(x, 45 + 27.5 + 0.3, z);
    this.scene.add(mid);

    const top = new THREE.Mesh(new THREE.BoxGeometry(20, 40, 20), new THREE.MeshPhongMaterial({ color: 0x0a0d12, shininess: 80 }));
    top.position.set(x, 100 + 20 + 0.3, z);
    this.scene.add(top);

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.2, 28, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    spire.position.set(x, 140 + 14, z);
    this.scene.add(spire);

    this.addCollider(x, z, 36, 36);

    this.addInteractiveZone({
      id: 'prop_penthouse',
      type: 'property',
      propertyId: 'penthouse',
      name: 'The Citadel Skyline Penthouse',
      desc: 'Ultimate luxury penthouse atop the skyline. Massive rental income!',
      price: 150000,
      rentIncome: 7500,
      position: new THREE.Vector3(x, 0.5, z - 22),
      color: 0x00f0ff,
      action: 'interact_property'
    });
  }

  buildRealEstateProperties(step) {
    const blockCenter = (bx, bz) => ({ x: (bx + 0.5) * step, z: (bz + 0.5) * step });

    const properties = [
      {
        id: 'motel_studio',
        name: 'Sunset Motel Studio #4 (Badlands)',
        desc: 'Modest starter pad in the desert outskirts.',
        price: 3500,
        rentIncome: 250,
        pos: new THREE.Vector3(blockCenter(-3, 2).x, 0.5, blockCenter(-3, 2).z - 20),
        color: 0x27ae60
      },
      {
        id: 'suburban_villa',
        name: 'Maple Grove Family Bungalow (Suburbs)',
        desc: 'Charming 3-bedroom house in Maple Valley.',
        price: 24000,
        rentIncome: 1200,
        pos: new THREE.Vector3(blockCenter(3, 3).x, 0.5, blockCenter(3, 3).z - 20),
        color: 0x27ae60
      },
      {
        id: 'downtown_loft',
        name: 'Neo-Tokyo Brick Loft (Chinatown)',
        desc: 'Stylish brick loft in the neon district.',
        price: 55000,
        rentIncome: 2800,
        pos: new THREE.Vector3(blockCenter(0, -3).x, 0.5, blockCenter(0, -3).z - 20),
        color: 0x27ae60
      },
      {
        id: 'ocean_mansion',
        name: 'Harbor Crest Seaside Mansion (Vice Beach)',
        desc: 'Exclusive beachfront villa with private dock overlooking the ocean.',
        price: 280000,
        rentIncome: 16000,
        pos: new THREE.Vector3(blockCenter(3, -1).x, 0.5, blockCenter(3, -1).z - 20),
        color: 0x27ae60
      },
      {
        id: 'docks_warehouse',
        name: 'Pier 9 Commercial Hub (Industrial Port)',
        desc: 'Sprawling commercial logistics warehouse.',
        price: 90000,
        rentIncome: 5000,
        pos: new THREE.Vector3(blockCenter(-3, -3).x, 0.5, blockCenter(-3, -3).z - 20),
        color: 0x27ae60
      }
    ];

    properties.forEach(p => {
      this.addInteractiveZone({
        id: 'prop_' + p.id,
        type: 'property',
        propertyId: p.id,
        name: p.name,
        desc: p.desc,
        price: p.price,
        rentIncome: p.rentIncome,
        position: p.pos,
        color: p.color,
        action: 'interact_property'
      });
    });
  }

  createStreetFurniture() {
    const totalStep = this.blockSize + this.roadWidth;
    const halfSpan = Math.floor(this.gridBlocks / 2) * totalStep;

    const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 7.5, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const lampHeadGeo = new THREE.BoxGeometry(0.8, 0.3, 1.4);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });

    for (let x = -halfSpan + 10; x <= halfSpan - 10; x += 55) {
      for (let z = -halfSpan + 10; z <= halfSpan - 10; z += 55) {
        const onVerticalEdge = Math.abs(x % totalStep) < 10 && Math.abs(x % totalStep) > 7;
        const onHorizontalEdge = Math.abs(z % totalStep) < 10 && Math.abs(z % totalStep) > 7;

        if (onVerticalEdge || onHorizontalEdge) {
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.set(x, 3.75, z);
          this.scene.add(pole);

          const head = new THREE.Mesh(lampHeadGeo, lampHeadMat);
          head.position.set(x, 7.5, z);
          this.scene.add(head);

          this.streetLights.push(head);
        }
      }
    }
  }

  createVegetation() {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28 });
    const leavesGeo = new THREE.DodecahedronGeometry(2.5, 1);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f });

    // Place trees in parks and sidewalks
    const totalStep = this.blockSize + this.roadWidth;
    for (let i = -4; i <= 4; i += 2) {
      for (let j = -4; j <= 4; j += 2) {
        const tx = (i + 0.5) * totalStep + 24;
        const tz = (j + 0.5) * totalStep + 24;

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(tx, 2.25, tz);
        this.scene.add(trunk);

        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(tx, 5.5, tz);
        this.scene.add(leaves);

        this.addCollider(tx, tz, 1.2, 1.2);
      }
    }
  }

  addCollider(x, z, width, depth) {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  checkCollision(x, z, radius = 0.5) {
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
    const maxBound = this.citySize / 2 - 15;
    if (Math.abs(x) > maxBound || Math.abs(z) > maxBound) {
      return true;
    }
    return false;
  }

  addInteractiveZone(config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const cylinderGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.35, 24);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.65
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.y = 0.18;
    group.add(cylinder);

    const beamGeo = new THREE.CylinderGeometry(0.7, 1.3, 7, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 3.6;
    group.add(beam);

    this.scene.add(group);

    this.interactiveSpots.push({
      ...config,
      meshGroup: group,
      radius: 4.0
    });
  }

  getNearestInteractive(pos, maxDist = 4.5) {
    for (let i = 0; i < this.interactiveSpots.length; i++) {
      const spot = this.interactiveSpots[i];
      const dist = pos.distanceTo(spot.position);
      if (dist <= (spot.radius || maxDist)) {
        return spot;
      }
    }
    return null;
  }

  update(delta) {
    for (let i = 0; i < this.interactiveSpots.length; i++) {
      const spot = this.interactiveSpots[i];
      if (spot.meshGroup) {
        spot.meshGroup.rotation.y += delta * 0.8;
      }
    }
  }
}

window.CityWorld = CityWorld;
