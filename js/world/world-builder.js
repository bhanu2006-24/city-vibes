// ============================================================
// CITY VIBES - GTA ISLAND 3D PROCEDURAL WORLD BUILDER
// Builds terrain, districts, buildings, bridges, water & props
// ============================================================

window.WorldBuilder = {
  buildIsland(world) {
    const scene = world.scene;
    const map = window.WorldMapData;

    // 1. Surrounding Ocean (Deep blue sea boundary)
    const oceanGeo = new THREE.PlaneGeometry(3500, 3500);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x0a3d62,
      shininess: 90,
      specular: 0x4aa3df
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.5;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // 2. Main Island Landmass (Paved terrain with coastal sand beach edges)
    const landGeo = new THREE.BoxGeometry(1160, 2.0, 1160);
    const landMat = new THREE.MeshLambertMaterial({ color: 0x1b281f }); // lush turf
    const land = new THREE.Mesh(landGeo, landMat);
    land.position.y = -1.0;
    land.receiveShadow = true;
    scene.add(land);

    // Golden Sand Beach Coastline along East & South
    const sandGeo = new THREE.PlaneGeometry(1200, 1200);
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xf5cd79 });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.15;
    sand.receiveShadow = true;
    scene.add(sand);

    // 3. Central Ocean River / Canal cutting through the city
    this.createWaterCanal(scene, 0, 0, 48, 1160, false); // North-South waterway
    this.createWaterCanal(scene, 0, 0, 1160, 48, true);  // East-West waterway

    // 4. City Asphalt Road Grid & Bridges
    this.buildRoadNetwork(world);

    // 5. Build Each Distinct GTA District
    this.buildDowntownDistrict(world);
    this.buildViceBeachDistrict(world);
    this.buildPortDistrict(world);
    this.buildChinatownDistrict(world);
    this.buildCasinoDistrict(world);
    this.buildRedRockDistrict(world);

    // 6. Overhead Highway Direction Signboards
    this.buildHighwayDirectionBoards(world);
  },

  createWaterCanal(scene, x, z, width, length, isHorizontal) {
    const waterGeo = new THREE.PlaneGeometry(width, length);
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x0e5a8a,
      shininess: 85,
      specular: 0x54a0ff
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.05, z);
    scene.add(water);
  },

  buildRoadNetwork(world) {
    const scene = world.scene;
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1c2127 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // yellow centerline
    const whiteDashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const curbMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });

    const createAvenue = (x, z, width, length, isHorizontal) => {
      // Asphalt pavement
      const roadGeo = new THREE.PlaneGeometry(isHorizontal ? length : width, isHorizontal ? width : length);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.1, z);
      road.receiveShadow = true;
      scene.add(road);

      // Center double yellow line
      const lineGeo = new THREE.PlaneGeometry(isHorizontal ? length : 0.45, isHorizontal ? 0.45 : length);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.12, z);
      scene.add(line);

      // Concrete curbs & sidewalks
      const curbThickness = 2.4;
      if (isHorizontal) {
        [-width / 2 - curbThickness / 2, width / 2 + curbThickness / 2].forEach(offsetZ => {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.22, curbThickness), curbMat);
          curb.position.set(x, 0.15, z + offsetZ);
          scene.add(curb);
        });
      } else {
        [-width / 2 - curbThickness / 2, width / 2 + curbThickness / 2].forEach(offsetX => {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(curbThickness, 0.22, length), curbMat);
          curb.position.set(x + offsetX, 0.15, z);
          scene.add(curb);
        });
      }
    };

    // Main Arterials & Expressways
    createAvenue(0, 180, 24, 760, true);   // Downtown East-West Expressway
    createAvenue(0, -220, 24, 760, true);  // South Industrial-Casino Expressway
    createAvenue(0, 360, 24, 820, true);   // North Outer Loop
    createAvenue(0, -420, 24, 820, true);  // South Outer Loop

    createAvenue(0, 0, 24, 900, false);    // Grand Central Avenue (North-South)
    createAvenue(240, 0, 20, 900, false);  // East Bay Highway (Beach & Port)
    createAvenue(-240, 0, 20, 900, false); // West Coast Highway (Chinatown & Casino)
    createAvenue(440, 0, 22, 900, false);  // Ocean Coast Drive
    createAvenue(-420, 0, 22, 900, false); // Badlands Mountain Pass

    // Massive Concrete Bridges over the waterways
    this.createBridge(scene, 0, 0, 28, 70, false);   // Central Crossing Bridge
    this.createBridge(scene, 0, 0, 70, 28, true);    // Central Crossing Bridge (East-West)
    this.createBridge(scene, 240, 0, 24, 70, false); // Beach-Port Bridge
    this.createBridge(scene, -240, 0, 24, 70, false);// Chinatown-Casino Bridge
  },

  createBridge(scene, x, z, width, length, isHorizontal) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(x, 0, z);

    const deckMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(isHorizontal ? length : width, 1.2, isHorizontal ? width : length), deckMat);
    deck.position.y = 0.6;
    bridgeGroup.add(deck);

    // Steel Arch Pillars & Guardrails
    const railMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
    if (isHorizontal) {
      [-width / 2, width / 2].forEach(offsetZ => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 1.4, 0.4), railMat);
        rail.position.set(0, 1.6, offsetZ);
        bridgeGroup.add(rail);
      });
    } else {
      [-width / 2, width / 2].forEach(offsetX => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, length), railMat);
        rail.position.set(offsetX, 1.6, 0);
        bridgeGroup.add(rail);
      });
    }

    scene.add(bridgeGroup);
  },

  // ------------------------------------------------------------
  // 1. DOWNTOWN METROPOLIS (Skyscrapers, Citadel, Bank, Hospital)
  // ------------------------------------------------------------
  buildDowntownDistrict(world) {
    const scene = world.scene;

    // Citadel 138-meter Skyscraper
    this.buildCitadelTower(world, 0, 250);

    // First National Bank & Vault
    this.buildBankBuilding(world, 12, 195);

    // St. Jude Hospital ER
    this.buildHospital(world, -39, 120);

    // Luigi's Pizzeria
    this.buildPizzeria(world, 80, 140);

    // Metro Cab HQ
    this.buildTaxiDepot(world, 30, 70);

    // Apex Exotic Dealership
    this.buildCarDealership(world, 110, 240);

    // Apex Construction Co. Landmark
    this.buildConstructionOffice(world, -100, 140);

    // 24/7 SuperMart Downtown
    this.buildSuperMart(world, -70, 200, '24/7 SuperMart Downtown');

    // Downtown Loft Real Estate
    this.buildPropertyBeacon(world, 60, 220, 'downtown_loft', 'Downtown Loft ($55,000)');

    // Surrounding Downtown High-Rise Skyscrapers
    const towers = [
      { x: -50, z: 270, w: 26, d: 26, h: 85, c: 0x1e272e },
      { x: 50, z: 270, w: 28, d: 24, h: 95, c: 0x2f3640 },
      { x: -90, z: 230, w: 24, d: 24, h: 70, c: 0x353b48 },
      { x: 90, z: 190, w: 24, d: 24, h: 78, c: 0x1e3799 },
      { x: -40, z: 170, w: 22, d: 22, h: 65, c: 0x0c2461 },
      { x: 50, z: 100, w: 26, d: 24, h: 60, c: 0x1e272e },
      { x: -80, z: 90, w: 24, d: 24, h: 55, c: 0x34495e }
    ];

    towers.forEach(t => {
      this.createBuilding(world, t.x, t.z, t.w, t.d, t.h, t.c);
    });
  },

  // ------------------------------------------------------------
  // 2. VICE BEACH & MARINA (Villas, Palms, Sand, Motel)
  // ------------------------------------------------------------
  buildViceBeachDistrict(world) {
    // Urban Threads Clothes Boutique
    this.buildClothesBoutique(world, 320, 150);

    // 24/7 SuperMart Beachside
    this.buildSuperMart(world, 380, 210, '24/7 SuperMart Beachside');

    // ATM Kiosk Beach
    world.addInteractiveZone({
      id: 'atm_beach',
      name: 'Beachfront Boardwalk ATM',
      position: new THREE.Vector3(340, 0.5, 160),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });

    // Sunset Motel Real Estate
    this.buildPropertyBeacon(world, 280, 260, 'motel_studio', 'Sunset Motel Studio #4 ($3,500)');

    // Luxury Beachfront Villa Real Estate
    this.buildPropertyBeacon(world, 420, 280, 'beachfront_villa', 'Vice Beachfront Villa ($320,000)');

    // Beachside Villas & Apartments
    const villas = [
      { x: 280, z: 190, w: 22, d: 18, h: 18, c: 0xf8f9fa },
      { x: 340, z: 240, w: 24, d: 20, h: 22, c: 0xffffff },
      { x: 380, z: 270, w: 26, d: 22, h: 24, c: 0xf1f2f6 },
      { x: 440, z: 230, w: 28, d: 22, h: 16, c: 0xffeaa7 }
    ];
    villas.forEach(v => {
      this.createBuilding(world, v.x, v.z, v.w, v.d, v.h, v.c);
    });

    // Palm Tree Boulevard along Ocean Drive
    for (let pz = 50; pz <= 350; pz += 30) {
      this.createPalmTree(world.scene, 425, pz);
      this.createPalmTree(world.scene, 455, pz);
    }
  },

  // ------------------------------------------------------------
  // 3. LIBERTY INDUSTRIAL PORT (Cranes, Containers, Armory, Customs)
  // ------------------------------------------------------------
  buildPortDistrict(world) {
    const scene = world.scene;

    // City Customs Mechanic Workshop
    this.buildCustomsShop(world, 260, -210);

    // Underground Armory
    this.buildArmoryShop(world, 330, -240);

    // Port Warehouse Real Estate
    this.buildPropertyBeacon(world, 390, -350, 'port_warehouse', 'Liberty Port Container Warehouse ($180,000)');

    // ATM Kiosk Port
    world.addInteractiveZone({
      id: 'atm_port',
      name: 'Port Marine ATM Kiosk',
      position: new THREE.Vector3(280, 0.5, -200),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });

    // Warehouses
    const warehouses = [
      { x: 220, z: -270, w: 34, d: 26, h: 16, c: 0x7f8c8d },
      { x: 310, z: -320, w: 38, d: 28, h: 18, c: 0x95a5a6 },
      { x: 370, z: -280, w: 36, d: 26, h: 18, c: 0xbdc3c7 }
    ];
    warehouses.forEach(wh => {
      this.createBuilding(world, wh.x, wh.z, wh.w, wh.d, wh.h, wh.c);
    });

    // Stacks of Shipping Containers
    const containerColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71];
    const spots = [
      { x: 300, z: -380 }, { x: 340, z: -380 }, { x: 380, z: -380 },
      { x: 420, z: -320 }, { x: 420, z: -350 }
    ];
    spots.forEach(pt => {
      for (let level = 0; level < 3; level++) {
        const c = containerColors[(level + pt.x) % containerColors.length];
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(12, 3.2, 5),
          new THREE.MeshLambertMaterial({ color: c })
        );
        box.position.set(pt.x, 1.6 + level * 3.2, pt.z);
        scene.add(box);
      }
      world.addCollider(pt.x, pt.z, 14, 7);
    });

    // Giant 32-meter Industrial Cargo Cranes
    this.createCargoCrane(scene, 420, -260);
    this.createCargoCrane(scene, 420, -380);
  },

  // ------------------------------------------------------------
  // 4. NEO-CHINATOWN DISTRICT (Pagoda Gate, Lanterns, Guild)
  // ------------------------------------------------------------
  buildChinatownDistrict(world) {
    const scene = world.scene;

    // The Black Lotus Guild Safehouse (Dark Web Assassins)
    this.buildAssassinGuild(world, -240, 150);

    // Traditional Pagoda Entrance Arch
    this.createPagodaGate(scene, -240, 260);

    // Chinatown Bazaars & Tenements
    const buildings = [
      { x: -200, z: 190, w: 22, d: 20, h: 26, c: 0xc0392b },
      { x: -280, z: 190, w: 22, d: 20, h: 28, c: 0x962d22 },
      { x: -200, z: 110, w: 24, d: 22, h: 24, c: 0xd35400 },
      { x: -280, z: 110, w: 24, d: 22, h: 26, c: 0xb03a2e }
    ];
    buildings.forEach(b => {
      this.createBuilding(world, b.x, b.z, b.w, b.d, b.h, b.c);
    });

    // Hanging Red Glowing Lanterns
    for (let lx = -270; lx <= -210; lx += 20) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0033 })
      );
      lantern.position.set(lx, 6.5, 150);
      scene.add(lantern);
    }
  },

  // ------------------------------------------------------------
  // 5. LAS PALMAS CASINO STRIP (Neon Strip, Pyramid, Penthouses)
  // ------------------------------------------------------------
  buildCasinoDistrict(world) {
    const scene = world.scene;

    // Golden Luxor-Style Casino Pyramid
    const pyrGeo = new THREE.ConeGeometry(38, 48, 4);
    const pyrMat = new THREE.MeshPhongMaterial({ color: 0xd4ac0d, shininess: 95 });
    const pyramid = new THREE.Mesh(pyrGeo, pyrMat);
    pyramid.position.set(-270, 24, -270);
    pyramid.rotation.y = Math.PI / 4;
    scene.add(pyramid);
    world.addCollider(-270, -270, 56, 56);

    // Casino High-Roller Penthouse Real Estate
    this.buildPropertyBeacon(world, -260, -290, 'casino_penthouse', 'Casino High-Roller Penthouse ($750,000)');

    // 24/7 SuperMart Casino Strip
    this.buildSuperMart(world, -220, -240, '24/7 SuperMart Casino Strip');

    // ATM Kiosk Casino
    world.addInteractiveZone({
      id: 'atm_casino',
      name: 'Golden Pyramid ATM Kiosk',
      position: new THREE.Vector3(-270, 0.5, -220),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });

    // Neon Casino Hotel Towers
    const casinos = [
      { x: -200, z: -270, w: 26, d: 24, h: 65, c: 0x8e44ad },
      { x: -340, z: -270, w: 28, d: 24, h: 72, c: 0x2c3e50 },
      { x: -270, z: -350, w: 32, d: 26, h: 58, c: 0x16a085 }
    ];
    casinos.forEach(c => {
      this.createBuilding(world, c.x, c.z, c.w, c.d, c.h, c.c);
    });
  },

  // ------------------------------------------------------------
  // 6. RED ROCK BADLANDS & MOUNT CHILIAD (Sandstone Mesas, Trails)
  // ------------------------------------------------------------
  buildRedRockDistrict(world) {
    const scene = world.scene;

    // Sandstone Canyon Mesas
    const mesaMat = new THREE.MeshLambertMaterial({ color: 0xa0522d });
    const mesas = [
      { x: -330, z: 410, w: 60, d: 55, h: 32 },
      { x: -420, z: 460, w: 75, d: 65, h: 44 },
      { x: -260, z: 460, w: 55, d: 50, h: 28 }
    ];
    mesas.forEach(m => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(m.w, m.h, m.d), mesaMat);
      b.position.set(m.x, m.h / 2, m.z);
      scene.add(b);
      world.addCollider(m.x, m.z, m.w + 2, m.d + 2);
    });

    // Desert Safehouse Real Estate
    this.buildPropertyBeacon(world, -380, 420, 'desert_safehouse', 'Red Rock Badlands Compound ($28,000)');

    // Lookout Fire Tower
    const towerMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 24, 8), towerMat);
    tower.position.set(-330, 44, 410);
    scene.add(tower);
  },

  // ------------------------------------------------------------
  // BUILDING TEMPLATES & INTERACTIVE HUBS
  // ------------------------------------------------------------
  createBuilding(world, x, z, w, d, h, colorHex) {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ color: colorHex })
    );
    b.position.set(x, h / 2, z);
    b.castShadow = true;
    b.receiveShadow = true;
    world.scene.add(b);
    world.addCollider(x, z, w + 2, d + 2);
    return b;
  },

  buildCitadelTower(world, x, z) {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(36, 138, 36),
      new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 95 })
    );
    tower.position.set(x, 69, z);
    tower.castShadow = true;
    world.scene.add(tower);
    world.addCollider(x, z, 38, 38);

    // Elevator Ground Pad -> Rooftop Sniper Deck
    world.addInteractiveZone({
      id: 'citadel_elevator_up',
      name: 'Citadel Express Elevator (Roof Deck 138m)',
      position: new THREE.Vector3(x, 0.5, z - 19),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 139, z)
    });

    // Rooftop Elevator Pad -> Ground Street
    world.addInteractiveZone({
      id: 'citadel_elevator_down',
      name: 'Citadel Elevator (Down to Street Level)',
      position: new THREE.Vector3(x, 139, z - 14),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 1.0, z - 24)
    });

    // Penthouse Safehouse (Heals HP)
    world.addInteractiveZone({
      id: 'citadel_safehouse_entry',
      name: 'Citadel Luxury Penthouse Safehouse (Full HP Heal)',
      position: new THREE.Vector3(x + 19, 0.5, z),
      color: 0xf1c40f,
      action: 'teleport_heal',
      targetPos: new THREE.Vector3(x, 72, z)
    });
  },

  buildBankBuilding(world, x, z) {
    this.createBuilding(world, x, z, 32, 28, 22, 0x1e3799);

    // Bank Vault Heist Zone
    world.addInteractiveZone({
      id: 'bank_vault',
      name: 'First National Bank & Vault Heist',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0x0984e3,
      action: 'open_bank'
    });

    // Physical ATM Kiosk
    world.addInteractiveZone({
      id: 'bank_atm_downtown',
      name: 'First National ATM Kiosk (Deposit / Withdraw)',
      position: new THREE.Vector3(x + 12, 0.5, z - 16),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });
  },

  buildHospital(world, x, z) {
    this.createBuilding(world, x, z, 34, 28, 20, 0xffffff);
    world.addInteractiveZone({
      id: 'hospital_ambulance_job',
      name: 'St. Jude Paramedic Depot (Start Shift)',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0xe74c3c,
      action: 'ambulance_job'
    });
  },

  buildPizzeria(world, x, z) {
    this.createBuilding(world, x, z, 26, 22, 14, 0xd35400);
    world.addInteractiveZone({
      id: 'pizzeria_delivery_job',
      name: "Luigi's Pizza Delivery (Start Shift)",
      position: new THREE.Vector3(x, 0.5, z - 13),
      color: 0xf39c12,
      action: 'delivery_job'
    });
  },

  buildTaxiDepot(world, x, z) {
    this.createBuilding(world, x, z, 28, 24, 14, 0xf1c40f);
    world.addInteractiveZone({
      id: 'taxi_job_zone',
      name: 'Metro Cab HQ (Start Driving Shift)',
      position: new THREE.Vector3(x, 0.5, z - 14),
      color: 0xf1c40f,
      action: 'taxi_job'
    });
  },

  buildCarDealership(world, x, z) {
    this.createBuilding(world, x, z, 34, 28, 14, 0x00cec9);
    world.addInteractiveZone({
      id: 'cardealer_zone',
      name: 'Apex Exotic Motors (Vehicle Showroom)',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0x00f0ff,
      action: 'open_cardealer'
    });
  },

  buildConstructionOffice(world, x, z) {
    this.createBuilding(world, x, z, 32, 26, 16, 0x00cec9);
    world.addInteractiveZone({
      id: 'construction_co',
      name: 'Apex Construction Co. (Property Renovations)',
      position: new THREE.Vector3(x, 0.5, z - 15),
      color: 0x00cec9,
      action: 'open_construction'
    });
  },

  buildCustomsShop(world, x, z) {
    this.createBuilding(world, x, z, 34, 28, 16, 0x8e44ad);
    world.addInteractiveZone({
      id: 'mechanic_zone',
      name: 'City Customs Mechanic (Tune, Repair & NOS)',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0x9b59b6,
      action: 'open_mechanic'
    });
  },

  buildArmoryShop(world, x, z) {
    this.createBuilding(world, x, z, 28, 24, 14, 0x2c3e50);
    world.addInteractiveZone({
      id: 'armory_zone',
      name: 'Underground Armory (Silenced Weapons & Scope)',
      position: new THREE.Vector3(x, 0.5, z - 14),
      color: 0x2c3e50,
      action: 'open_armory'
    });
  },

  buildClothesBoutique(world, x, z) {
    this.createBuilding(world, x, z, 28, 22, 14, 0xe91e63);
    world.addInteractiveZone({
      id: 'clothes_zone',
      name: 'Urban Threads Boutique (Outfits & Tailoring)',
      position: new THREE.Vector3(x, 0.5, z - 13),
      color: 0xe91e63,
      action: 'open_clothes'
    });
  },

  buildAssassinGuild(world, x, z) {
    this.createBuilding(world, x, z, 26, 22, 16, 0x111111);
    world.addInteractiveZone({
      id: 'guild_zone',
      name: 'The Black Lotus Guild (Dark Web Contracts)',
      position: new THREE.Vector3(x, 0.5, z - 13),
      color: 0xff0055,
      action: 'open_guild'
    });
  },

  buildSuperMart(world, x, z, name) {
    this.createBuilding(world, x, z, 28, 24, 12, 0x27ae60);
    world.addInteractiveZone({
      id: `supermart_${Math.round(x)}`,
      name: `${name} (Shop / Rob Register [F])`,
      position: new THREE.Vector3(x, 0.5, z - 14),
      color: 0x2ecc71,
      action: 'open_supermart'
    });
  },

  buildPropertyBeacon(world, x, z, propertyId, title) {
    this.createBuilding(world, x, z, 24, 20, 16, 0x34495e);
    world.addInteractiveZone({
      id: `prop_${propertyId}`,
      name: title,
      position: new THREE.Vector3(x, 0.5, z - 12),
      color: 0x2ecc71,
      action: 'buy_property_onsite',
      propertyId: propertyId
    });
  },

  // Props: Palm Trees, Cranes, Gates
  createPalmTree(scene, x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.38, 9, 8),
      new THREE.MeshLambertMaterial({ color: 0x795548 })
    );
    trunk.position.set(x, 4.5, z);
    scene.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x27ae60 })
    );
    leaves.position.set(x, 9.2, z);
    scene.add(leaves);
  },

  createCargoCrane(scene, x, z) {
    const craneGroup = new THREE.Group();
    craneGroup.position.set(x, 0, z);

    const steelMat = new THREE.MeshLambertMaterial({ color: 0xf39c12 });
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4, 34, 4), steelMat);
    tower.position.y = 17;
    craneGroup.add(tower);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(38, 3, 3), steelMat);
    arm.position.set(12, 34, 0);
    craneGroup.add(arm);

    scene.add(craneGroup);
  },

  createPagodaGate(scene, x, z) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, 0, z);

    const redMat = new THREE.MeshLambertMaterial({ color: 0xc0392b });
    [-10, 10].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 10, 8), redMat);
      pillar.position.set(px, 5, 0);
      gateGroup.add(pillar);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(26, 1.8, 5), new THREE.MeshLambertMaterial({ color: 0x2c3e50 }));
    roof.position.y = 10.5;
    gateGroup.add(roof);

    scene.add(gateGroup);
  },

  buildHighwayDirectionBoards(world) {
    const boards = [
      { x: 0, z: 290, dir: 'VICE BEACH 1.2 KM ➔', speed: 'MAX 120 MPH' },
      { x: 180, z: 180, dir: '⬆ DOWNTOWN CORE 0.8 KM', speed: 'MAX 100 MPH' },
      { x: 240, z: -100, dir: '⬇ LIBERTY INDUSTRIAL PORT', speed: 'TRUCK ROUTE' },
      { x: -140, z: 180, dir: '⬆ NEO-CHINATOWN BAZAAR', speed: 'MAX 60 MPH' },
      { x: -240, z: -100, dir: '⬇ LAS PALMAS CASINO STRIP', speed: 'MAX 120 MPH' },
      { x: -240, z: 300, dir: '⬆ RED ROCK BADLANDS & HILLS', speed: 'STEEP TRAIL' }
    ];

    boards.forEach(b => {
      const gantry = new THREE.Group();
      gantry.position.set(b.x, 0, b.z);

      const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      [-12, 12].forEach(px => {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 8, 0.8), poleMat);
        pole.position.set(px, 4, 0);
        gantry.add(pole);
      });

      const beam = new THREE.Mesh(new THREE.BoxGeometry(25, 0.8, 0.8), poleMat);
      beam.position.set(0, 7.8, 0);
      gantry.add(beam);

      // Canvas signboard
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#006837';
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 116);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(b.dir, 24, 55);

      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(b.speed, 24, 98);

      const texture = new THREE.CanvasTexture(canvas);
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 3.2),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      );
      signMesh.position.set(0, 7.8, 0.42);
      gantry.add(signMesh);

      world.scene.add(gantry);
    });
  }
};
