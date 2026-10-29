// ============================================================
// CITY VIBES - GTA SAN ANDREAS 3D PROCEDURAL WORLD BUILDER
// Builds authentic San Andreas territories:
// Los Santos (Downtown, Grove St, Vinewood, Santa Maria Beach, LSX)
// San Fierro (Chinatown, Easter Basin, Gant Red Suspension Bridge)
// Las Venturas (The Strip, Golden Luxor Pyramid, Neon Casinos)
// Mount Chiliad (Climbable mountain summit & lookout deck)
// Bone County Desert & San Andreas Waterways
// ============================================================

window.WorldBuilder = {
  buildIsland(world) {
    const scene = world.scene;

    // 1. Deep Blue Ocean
    const oceanGeo = new THREE.PlaneGeometry(3500, 3500);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x082032,
      shininess: 90,
      specular: 0x338ba8
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.5;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // 2. Main Landmass Terrain
    const landGeo = new THREE.BoxGeometry(1160, 2.0, 1160);
    const landMat = new THREE.MeshLambertMaterial({ color: 0x1e3323 }); // rich green turf
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

    // 3. San Andreas Waterway Canals (Dividing the State into 3 Regions)
    // East-West Grand River (divides North SF/LV from South LS/Chiliad)
    this.createWaterCanal(scene, 0, 0, 1160, 48, true);
    // North-South Bay River (divides San Fierro from Las Venturas)
    this.createWaterCanal(scene, 0, -280, 48, 560, false);

    // 4. City Asphalt Road Grid & Bridges
    this.buildRoadNetwork(world);

    // 5. Authentic GTA San Andreas Territories
    // Los Santos
    this.buildDowntownLosSantos(world);
    this.buildGroveStreet(world, 160, 330);
    this.buildVinewoodSign(world, 50, 460);
    this.buildSantaMariaBeach(world);
    this.buildAirportLSX(world, 220, 450);

    // San Fierro & Gant Bridge
    this.buildSanFierroDistrict(world);
    this.buildGantSuspensionBridge(world, -300, -380);

    // Las Venturas & Casino Strip
    this.buildLasVenturasDistrict(world);

    // Mount Chiliad & Badlands
    this.buildMountChiliad(world, -340, 380);
    this.buildBoneCountyDesert(world);

    // 6. Overhead Highway Direction Signboards
    this.buildHighwayDirectionBoards(world);
  },

  createWaterCanal(scene, x, z, width, length, isHorizontal) {
    const waterGeo = new THREE.PlaneGeometry(width, length);
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x0a4b78,
      shininess: 90,
      specular: 0x4aa3df
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.05, z);
    scene.add(water);
  },

  buildRoadNetwork(world) {
    const scene = world.scene;
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1b2028 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // yellow double-line
    const curbMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });

    const createAvenue = (x, z, width, length, isHorizontal) => {
      const roadGeo = new THREE.PlaneGeometry(isHorizontal ? length : width, isHorizontal ? width : length);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.1, z);
      road.receiveShadow = true;
      scene.add(road);

      const lineGeo = new THREE.PlaneGeometry(isHorizontal ? length : 0.45, isHorizontal ? 0.45 : length);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.12, z);
      scene.add(line);

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

    // Major Arterials & Highways
    createAvenue(0, 180, 24, 760, true);   // Los Santos Central Avenue
    createAvenue(0, -240, 24, 760, true);  // Las Venturas / SF Expressway
    createAvenue(0, 360, 24, 820, true);   // South Coast Ring Road
    createAvenue(0, -450, 24, 820, true);  // Julius Thruway North Loop

    createAvenue(0, 0, 24, 900, false);    // State Central Expressway
    createAvenue(300, 0, 22, 900, false);  // East Highway (LV to Santa Maria Beach)
    createAvenue(-300, 0, 22, 900, false); // West Highway (San Fierro to Mt. Chiliad)
    createAvenue(450, 0, 20, 900, false);  // Ocean Coastline Promenade
    createAvenue(-450, 0, 20, 900, false); // Badlands Foothills Pass

    // Concrete Crossing Bridges over the Grand Waterway
    this.createBridge(scene, 0, 0, 28, 70, false);   // Central State Bridge
    this.createBridge(scene, 300, 0, 24, 70, false); // Las Venturas - Los Santos Highway Bridge
    this.createBridge(scene, -300, 0, 24, 70, false);// San Fierro - Flint County Bridge
    this.createBridge(scene, 0, -280, 70, 24, true); // East-West Bay Crossing Bridge
  },

  createBridge(scene, x, z, width, length, isHorizontal) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(x, 0, z);

    const deckMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(isHorizontal ? length : width, 1.2, isHorizontal ? width : length), deckMat);
    deck.position.y = 0.6;
    bridgeGroup.add(deck);

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
  // 1. LOS SANTOS DOWNTOWN (Citadel/Maze Tower, Bank, Hospital)
  // ------------------------------------------------------------
  buildDowntownLosSantos(world) {
    const scene = world.scene;

    // Citadel / Maze Bank 138-meter Skyscraper
    this.buildCitadelTower(world, 0, 250);

    // Maze Bank & Vault
    this.buildBankBuilding(world, 12, 195);

    // All Saints Hospital ER
    this.buildHospital(world, -39, 120);

    // Well Stacked Pizzeria
    this.buildPizzeria(world, 80, 140);

    // Metro Cab HQ
    this.buildTaxiDepot(world, 30, 70);

    // Apex Exotic Motors Dealership
    this.buildCarDealership(world, 110, 240);

    // Apex Construction Co. (Property Renovations)
    this.buildConstructionOffice(world, -100, 140);

    // 24/7 SuperMart Downtown
    this.buildSuperMart(world, -70, 200, '24/7 SuperMart Downtown');

    // Downtown Loft Real Estate
    this.buildPropertyBeacon(world, 60, 220, 'downtown_loft', 'Downtown Los Santos Loft ($55,000)');

    // Surrounding Downtown Los Santos Skyscrapers
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
  // GROVE STREET CUL-DE-SAC (CJ'S HOUSE, BASKETBALL HOOP)
  // ------------------------------------------------------------
  buildGroveStreet(world, x, z) {
    const scene = world.scene;
    const gGroup = new THREE.Group();
    gGroup.position.set(x, 0, z);

    // Circular asphalt cul-de-sac
    const culDeSacAsphalt = new THREE.Mesh(
      new THREE.CircleGeometry(26, 32),
      new THREE.MeshLambertMaterial({ color: 0x22272e })
    );
    culDeSacAsphalt.rotation.x = -Math.PI / 2;
    culDeSacAsphalt.position.y = 0.11;
    gGroup.add(culDeSacAsphalt);

    // Center circular grass island
    const centerGrass = new THREE.Mesh(
      new THREE.CircleGeometry(7.5, 24),
      new THREE.MeshLambertMaterial({ color: 0x27ae60 })
    );
    centerGrass.rotation.x = -Math.PI / 2;
    centerGrass.position.y = 0.14;
    gGroup.add(centerGrass);

    // Center palm tree
    this.createPalmTree(scene, x, z);

    // CJ's Iconic House (Johnson House)
    const cjHouseMat = new THREE.MeshLambertMaterial({ color: 0xf5f6fa });
    const cjRoofMat = new THREE.MeshLambertMaterial({ color: 0x2ecc71 }); // Green roof
    const cjHouse = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 14), cjHouseMat);
    cjHouse.position.set(0, 3.75, 28);
    gGroup.add(cjHouse);

    const cjRoof = new THREE.Mesh(new THREE.ConeGeometry(13, 4, 4), cjRoofMat);
    cjRoof.position.set(0, 9.5, 28);
    cjRoof.rotation.y = Math.PI / 4;
    gGroup.add(cjRoof);

    // Front porch
    const porch = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), new THREE.MeshLambertMaterial({ color: 0x8c7ae6 }));
    porch.position.set(0, 0.2, 19);
    gGroup.add(porch);

    // Neighboring houses on the ring
    const houseAngles = [Math.PI * 0.4, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.6];
    houseAngles.forEach(ang => {
      const hx = Math.cos(ang) * 32;
      const hz = Math.sin(ang) * 32;
      const house = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 12), new THREE.MeshLambertMaterial({ color: 0xdcdde1 }));
      house.position.set(hx, 3.5, hz);
      house.rotation.y = -ang + Math.PI / 2;
      gGroup.add(house);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 3.5, 4), new THREE.MeshLambertMaterial({ color: 0x718093 }));
      roof.position.set(hx, 8.75, hz);
      roof.rotation.y = -ang + Math.PI / 2 + Math.PI / 4;
      gGroup.add(roof);

      world.addCollider(x + hx, z + hz, 16, 14);
    });

    world.addCollider(x, z + 28, 18, 16);

    // Basketball Hoop & Half Court
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 8), new THREE.MeshLambertMaterial({ color: 0x2f3640 }));
    pole.position.set(-16, 2.5, 0);
    gGroup.add(pole);

    const backboard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 3.0), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    backboard.position.set(-15.8, 4.4, 0);
    gGroup.add(backboard);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 16), new THREE.MeshBasicMaterial({ color: 0xe67e22 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(-15.1, 3.8, 0);
    gGroup.add(rim);

    // Grove Street Interactive Zone
    world.addInteractiveZone({
      id: 'grove_street_hub',
      name: "Grove Street Cul-de-Sac (CJ's House)",
      position: new THREE.Vector3(x, 0.5, z + 12),
      color: 0x2ecc71
    });

    scene.add(gGroup);
  },

  // ------------------------------------------------------------
  // VINEWOOD GIANT 3D SIGN
  // ------------------------------------------------------------
  buildVinewoodSign(world, x, z) {
    const scene = world.scene;
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x2e4a2e });
    const hill = new THREE.Mesh(new THREE.ConeGeometry(80, 24, 8), hillMat);
    hill.position.set(x, 12, z);
    scene.add(hill);

    // 8 White 3D Block Letters: V I N E W O O D
    const letters = ['V', 'I', 'N', 'E', 'W', 'O', 'O', 'D'];
    const letterGroup = new THREE.Group();
    letterGroup.position.set(x - 35, 23, z - 8);

    const letterMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const postMat = new THREE.MeshLambertMaterial({ color: 0x475569 });

    letters.forEach((char, idx) => {
      const lx = idx * 10;
      // Support frame posts
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.3), postMat);
      postL.position.set(lx - 2, 3.5, -0.6);
      letterGroup.add(postL);

      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.3), postMat);
      postR.position.set(lx + 2, 3.5, -0.6);
      letterGroup.add(postR);

      // Letter mesh
      const block = new THREE.Mesh(new THREE.BoxGeometry(6.5, 7.5, 0.6), letterMat);
      block.position.set(lx, 6.5, 0);
      letterGroup.add(block);
    });

    scene.add(letterGroup);
    world.addCollider(x, z, 90, 30);

    world.addInteractiveZone({
      id: 'vinewood_lookout',
      name: 'Vinewood Giant Sign Lookout',
      position: new THREE.Vector3(x, 24, z - 20),
      color: 0xffffff
    });
  },

  // ------------------------------------------------------------
  // 2. SANTA MARIA BEACH & MARINA (Villas, Palms, Sand, Motel)
  // ------------------------------------------------------------
  buildSantaMariaBeach(world) {
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
    this.buildPropertyBeacon(world, 420, 280, 'beachfront_villa', 'Santa Maria Beachfront Villa ($320,000)');

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
  // LOS SANTOS INTERNATIONAL AIRPORT (LSX)
  // ------------------------------------------------------------
  buildAirportLSX(world, x, z) {
    const scene = world.scene;
    const airportGroup = new THREE.Group();
    airportGroup.position.set(x, 0, z);

    // Main Runway Tarmac
    const runway = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 180),
      new THREE.MeshLambertMaterial({ color: 0x181a1f })
    );
    runway.rotation.x = -Math.PI / 2;
    runway.position.y = 0.12;
    airportGroup.add(runway);

    // Dashed Runway Centerline
    for (let rz = -80; rz <= 80; rz += 16) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.14, rz);
      airportGroup.add(dash);
    }

    // Octagonal Flight Control Tower
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 6.0, 38, 8),
      new THREE.MeshLambertMaterial({ color: 0xdcdde1 })
    );
    tower.position.set(-32, 19, 0);
    airportGroup.add(tower);

    const cabGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 7.0, 6, 8),
      new THREE.MeshPhongMaterial({ color: 0x00cec9, transparent: true, opacity: 0.75 })
    );
    cabGlass.position.set(-32, 38, 0);
    airportGroup.add(cabGlass);
    world.addCollider(x - 32, z, 16, 16);

    // Aircraft Hangar
    const hangarMat = new THREE.MeshLambertMaterial({ color: 0x718093 });
    const hangar = new THREE.Mesh(new THREE.BoxGeometry(45, 16, 35), hangarMat);
    hangar.position.set(-45, 8, -50);
    airportGroup.add(hangar);
    world.addCollider(x - 45, z - 50, 48, 38);

    // Executive Twin-Prop Airplane on Tarmac
    const planeGroup = new THREE.Group();
    planeGroup.position.set(0, 2.2, -40);

    const fuseMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 18, 12), fuseMat);
    fuselage.rotation.x = Math.PI / 2;
    planeGroup.add(fuselage);

    const wings = new THREE.Mesh(new THREE.BoxGeometry(22, 0.25, 3.2), fuseMat);
    wings.position.set(0, 0.2, -2);
    planeGroup.add(wings);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 2.4), new THREE.MeshLambertMaterial({ color: 0x0984e3 }));
    tail.position.set(0, 2.2, 7.5);
    planeGroup.add(tail);

    airportGroup.add(planeGroup);

    world.addInteractiveZone({
      id: 'airport_lsx',
      name: 'Los Santos International Airport (LSX)',
      position: new THREE.Vector3(x, 0.5, z - 20),
      color: 0x00f0ff
    });

    scene.add(airportGroup);
  },

  // ------------------------------------------------------------
  // 3. SAN FIERRO (Chinatown, Easter Basin Docks, Customs)
  // ------------------------------------------------------------
  buildSanFierroDistrict(world) {
    const scene = world.scene;

    // The Black Lotus Guild Safehouse (Dark Web Assassins)
    this.buildAssassinGuild(world, -240, -150);

    // Traditional Pagoda Entrance Arch
    this.createPagodaGate(scene, -240, -110);

    // TransFender Customs & Tuning Workshop
    this.buildCustomsShop(world, -200, -210);

    // San Fierro Port ATM
    world.addInteractiveZone({
      id: 'atm_sf_port',
      name: 'San Fierro Port ATM Kiosk',
      position: new THREE.Vector3(-240, 0.5, -190),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });

    // San Fierro Container Warehouse Real Estate
    this.buildPropertyBeacon(world, -360, -300, 'port_warehouse', 'San Fierro Port Container Warehouse ($180,000)');

    // Chinatown Bazaars & Tenements
    const buildings = [
      { x: -200, z: -160, w: 22, d: 20, h: 26, c: 0xc0392b },
      { x: -280, z: -160, w: 22, d: 20, h: 28, c: 0x962d22 },
      { x: -200, z: -250, w: 24, d: 22, h: 32, c: 0x2c3e50 },
      { x: -280, z: -250, w: 24, d: 22, h: 36, c: 0x34495e },
      { x: -340, z: -200, w: 26, d: 24, h: 42, c: 0x1e272e }
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
      lantern.position.set(lx, 6.5, -150);
      scene.add(lantern);
    }

    // Easter Basin Docks: Shipping Containers & Cranes
    const containerColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x2ecc71];
    const spots = [
      { x: -320, z: -320 }, { x: -360, z: -320 }, { x: -400, z: -320 },
      { x: -400, z: -260 }, { x: -400, z: -200 }
    ];
    spots.forEach(pt => {
      for (let level = 0; level < 3; level++) {
        const c = containerColors[(level + Math.abs(pt.x)) % containerColors.length];
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
    this.createCargoCrane(scene, -420, -280);
    this.createCargoCrane(scene, -420, -360);
  },

  // ------------------------------------------------------------
  // GANT RED SUSPENSION BRIDGE (SAN FIERRO TO BONE COUNTY)
  // ------------------------------------------------------------
  buildGantSuspensionBridge(world, x, z) {
    const scene = world.scene;
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(x, 0, z);

    const redSteelMat = new THREE.MeshLambertMaterial({ color: 0xd63031 }); // Golden Gate red
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xff7675 });
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x2d3436 });

    // Roadway Deck spanning 120m across the bay
    const deck = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 120), deckMat);
    deck.position.y = 1.0;
    bridgeGroup.add(deck);

    // Two 42-meter Red Steel Suspension Towers
    [-35, 35].forEach(tz => {
      [-9, 9].forEach(tx => {
        const towerPillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 42, 2.4), redSteelMat);
        towerPillar.position.set(tx, 21, tz);
        bridgeGroup.add(towerPillar);
      });

      // Arch Crossbeams
      [15, 28, 40].forEach(cy => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(18, 1.6, 2.2), redSteelMat);
        beam.position.set(0, cy, tz);
        bridgeGroup.add(beam);
      });
    });

    // Sweeping Suspension Cables
    [-8.5, 8.5].forEach(cx => {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 120, 8), cableMat);
      cable.position.set(cx, 28, 0);
      cable.rotation.x = Math.PI / 2;
      bridgeGroup.add(cable);

      // Vertical hanger stays
      for (let hy = -50; hy <= 50; hy += 10) {
        const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 26, 6), cableMat);
        stay.position.set(cx, 14, hy);
        bridgeGroup.add(stay);
      }
    });

    world.addInteractiveZone({
      id: 'gant_bridge_zone',
      name: 'Gant Red Suspension Bridge',
      position: new THREE.Vector3(x, 1.5, z),
      color: 0xe74c3c
    });

    scene.add(bridgeGroup);
  },

  // ------------------------------------------------------------
  // 4. LAS VENTURAS & CASINO STRIP (The Strip, Pyramid, Armory)
  // ------------------------------------------------------------
  buildLasVenturasDistrict(world) {
    const scene = world.scene;

    // Golden Luxor-Style Casino Pyramid ("The Camel's Toe")
    const pyrGeo = new THREE.ConeGeometry(42, 52, 4);
    const pyrMat = new THREE.MeshPhongMaterial({ color: 0xd4ac0d, shininess: 95 });
    const pyramid = new THREE.Mesh(pyrGeo, pyrMat);
    pyramid.position.set(300, 26, -260);
    pyramid.rotation.y = Math.PI / 4;
    scene.add(pyramid);
    world.addCollider(300, -260, 60, 60);

    // Bright Vertical Sky Beam Shooting Up into the Sky
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 12, 180, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    beam.position.set(300, 90, -260);
    scene.add(beam);

    // Ammu-Nation Las Venturas Armory
    this.buildArmoryShop(world, 240, -200);

    // The Strip 24/7 SuperMart
    this.buildSuperMart(world, 260, -240, 'The Strip 24/7 Mart');

    // Golden Pyramid ATM Kiosk
    world.addInteractiveZone({
      id: 'atm_casino',
      name: 'Golden Pyramid ATM Kiosk',
      position: new THREE.Vector3(310, 0.5, -250),
      color: 0x00f0ff,
      action: 'open_bank_atm'
    });

    // Casino High-Roller Penthouse Real Estate
    this.buildPropertyBeacon(world, 320, -320, 'casino_penthouse', 'Las Venturas High-Roller Penthouse ($750,000)');

    // Neon Casino Hotel Towers (The Visage, Caligula's, Pirates)
    const casinos = [
      { x: 230, z: -270, w: 26, d: 24, h: 68, c: 0x8e44ad },
      { x: 370, z: -270, w: 28, d: 24, h: 76, c: 0x2c3e50 },
      { x: 300, z: -350, w: 32, d: 26, h: 62, c: 0x16a085 }
    ];
    casinos.forEach(c => {
      this.createBuilding(world, c.x, c.z, c.w, c.d, c.h, c.c);
    });

    // Palm trees lining the Strip
    for (let pz = -350; pz <= -160; pz += 30) {
      this.createPalmTree(scene, 285, pz);
      this.createPalmTree(scene, 315, pz);
    }
  },

  // ------------------------------------------------------------
  // 5. MOUNT CHILIAD (Climbable Summit Lookout & Pine Forest)
  // ------------------------------------------------------------
  buildMountChiliad(world, x, z) {
    const scene = world.scene;
    const mountainMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 }); // rugged brown mountain rock
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x2e4a2e });

    // Multi-tiered stepped mountain peak
    // Base tier (140x140, h:12)
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(140, 12, 140), greenMat);
    tier1.position.set(x, 6, z);
    scene.add(tier1);
    world.addCollider(x, z, 142, 142);

    // Tier 2 (100x100, h:24)
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(100, 24, 100), mountainMat);
    tier2.position.set(x, 12, z);
    scene.add(tier2);

    // Tier 3 (65x65, h:36)
    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(65, 36, 65), mountainMat);
    tier3.position.set(x, 18, z);
    scene.add(tier3);

    // Summit Tier (32x32, h:48)
    const summit = new THREE.Mesh(new THREE.BoxGeometry(32, 48, 32), mountainMat);
    summit.position.set(x, 24, z);
    scene.add(summit);

    // Wooden Summit Lookout Observation Platform on top
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(26, 1.0, 26), deckMat);
    deck.position.set(x, 48.5, z);
    scene.add(deck);

    // Timber Guardrails
    const railMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
    [-12, 12].forEach(rz => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(24, 1.4, 0.4), railMat);
      rail.position.set(x, 49.5, z + rz);
      scene.add(rail);
    });
    [-12, 12].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 24), railMat);
      rail.position.set(x + rx, 49.5, z);
      scene.add(rail);
    });

    // Summit Teleport / Fast Travel Beacon (Walk onto to stand on top of San Andreas!)
    world.addInteractiveZone({
      id: 'mount_chiliad_base_lift',
      name: 'Mount Chiliad Summit Trail (Climb to 48m Lookout)',
      position: new THREE.Vector3(x, 0.5, z - 75),
      color: 0x27ae60,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 49.2, z)
    });

    // Summit Deck Down to Trail Base
    world.addInteractiveZone({
      id: 'mount_chiliad_summit_deck',
      name: 'Mount Chiliad Summit Lookout Deck (Down to Base)',
      position: new THREE.Vector3(x, 49.0, z - 8),
      color: 0x27ae60,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 1.0, z - 80)
    });

    // Mount Chiliad Country Compound Real Estate
    this.buildPropertyBeacon(world, -380, 420, 'desert_safehouse', 'Mount Chiliad Country Compound ($28,000)');

    // Pine Trees on slopes
    const pineMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2810 });
    const treeOffsets = [
      [-60, -50], [60, -50], [-60, 50], [60, 50],
      [-40, -60], [40, -60], [-40, 60], [40, 60]
    ];
    treeOffsets.forEach(([dx, dz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 6, 8), trunkMat);
      trunk.position.set(x + dx, 3, z + dz);
      scene.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(3.5, 9, 8), pineMat);
      foliage.position.set(x + dx, 9, z + dz);
      scene.add(foliage);
    });
  },

  // ------------------------------------------------------------
  // 6. BONE COUNTY & RED ROCK DESERT (Mesas, Cacti)
  // ------------------------------------------------------------
  buildBoneCountyDesert(world) {
    const scene = world.scene;
    const mesaMat = new THREE.MeshLambertMaterial({ color: 0xa0522d });

    const mesas = [
      { x: 0, z: -380, w: 70, d: 55, h: 32 },
      { x: -80, z: -440, w: 65, d: 50, h: 28 },
      { x: 80, z: -440, w: 65, d: 50, h: 28 }
    ];
    mesas.forEach(m => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(m.w, m.h, m.d), mesaMat);
      b.position.set(m.x, m.h / 2, m.z);
      scene.add(b);
      world.addCollider(m.x, m.z, m.w + 2, m.d + 2);
    });

    // Saguaro Cacti
    const cactusMat = new THREE.MeshLambertMaterial({ color: 0x27ae60 });
    const cacti = [
      { x: -30, z: -340 }, { x: 30, z: -340 }, { x: -40, z: -410 }, { x: 40, z: -410 }
    ];
    cacti.forEach(c => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 8, 8), cactusMat);
      trunk.position.set(c.x, 4, c.z);
      scene.add(trunk);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.8), cactusMat);
      arm.position.set(c.x + 1.2, 5, c.z);
      scene.add(arm);
    });
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

    world.addInteractiveZone({
      id: 'bank_vault',
      name: 'First National Bank & Vault Heist',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0x0984e3,
      action: 'open_bank'
    });

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
      name: 'Los Saints Hospital ER (Start Paramedic Shift)',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0xe74c3c,
      action: 'ambulance_job'
    });
  },

  buildPizzeria(world, x, z) {
    this.createBuilding(world, x, z, 26, 22, 14, 0xd35400);
    world.addInteractiveZone({
      id: 'pizzeria_delivery_job',
      name: "Well Stacked Pizza Delivery (Start Shift)",
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
      name: 'TransFender Customs (Tune, Repair & NOS)',
      position: new THREE.Vector3(x, 0.5, z - 16),
      color: 0x9b59b6,
      action: 'open_mechanic'
    });
  },

  buildArmoryShop(world, x, z) {
    this.createBuilding(world, x, z, 28, 24, 14, 0x2c3e50);
    world.addInteractiveZone({
      id: 'armory_zone',
      name: 'Ammu-Nation Armory (Silenced Weapons & Sniper)',
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
      name: 'The Black Lotus Guild (San Fierro Safehouse)',
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
      { x: 0, z: 290, dir: '⬆ LOS SANTOS / VINEWOOD', speed: 'FREEWAY 120 MPH' },
      { x: 180, z: 180, dir: '➔ SANTA MARIA BEACH & AIRPORT', speed: 'MAX 80 MPH' },
      { x: 300, z: -120, dir: '⬆ LAS VENTURAS / CASINO STRIP', speed: 'JULIUS THRUWAY' },
      { x: -180, z: 180, dir: '➔ MOUNT CHILIAD LOOKOUT (48m)', speed: 'STEEP PASS' },
      { x: -300, z: -120, dir: '⬆ SAN FIERRO / GANT BRIDGE', speed: 'MAX 100 MPH' },
      { x: 0, z: -240, dir: '⬆ BONE COUNTY RED DESERT', speed: 'ROUTE 66' }
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
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(b.dir, 20, 55);

      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(b.speed, 20, 98);

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
