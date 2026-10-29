// ============================================================
// CITY VIBES - 30,000 x 30,000 MULTI-CITY WORLD WITH STREAMING
// 8 Distinct Major Cities, High-Speed Highways, Ocean Boundary,
// Rooftop Sniper Perches, Safehouse Interiors & Enterable Shops!
// ============================================================

class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.worldExtent = 30000; // -15000 to +15000
    this.seaBoundary = 14500; // Ocean edge boundary
    this.colliders = []; // Active colliders (dynamically streamed)
    this.interactiveSpots = []; // Active interactive spots
    this.streetLights = [];
    this.currentCityId = 'metropolis';
    this.streamingRadius = 2200; // Load city within 2.2km

    // 8 Major Cities / Regions across the 30,000x30,000 territory
    this.cities = {
      metropolis: {
        id: 'metropolis',
        name: 'Downtown Metropolis',
        tagline: 'Skyscraper Core & Citadel Tower',
        center: new THREE.Vector3(0, 0, 0),
        radius: 1100,
        color: 0x00f0ff,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      vice_beach: {
        id: 'vice_beach',
        name: 'Vice Beach & Marina',
        tagline: 'Tropical Sands, Luxury Villas & Palms',
        center: new THREE.Vector3(3400, 0, 600),
        radius: 1100,
        color: 0xff00bb,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      liberty_port: {
        id: 'liberty_port',
        name: 'Liberty Industrial Port',
        tagline: 'Shipping Containers, Cargo Cranes & Warehouses',
        center: new THREE.Vector3(-3200, 0, -3200),
        radius: 1100,
        color: 0xe67e22,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      maple_suburbs: {
        id: 'maple_suburbs',
        name: 'Maple Valley Suburbs',
        tagline: 'Peaceful Cul-de-sacs, Lawns & Family Homes',
        center: new THREE.Vector3(3200, 0, 3400),
        radius: 1100,
        color: 0x2ecc71,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      badlands: {
        id: 'badlands',
        name: 'Red Rock Badlands',
        tagline: 'Arid Sandstone Mesas & Outlaw Scrapyards',
        center: new THREE.Vector3(-3600, 0, 3600),
        radius: 1100,
        color: 0xd35400,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      chinatown: {
        id: 'chinatown',
        name: 'Neo-Chinatown District',
        tagline: 'Red Lanterns, Pagodas & Night Markets',
        center: new THREE.Vector3(600, 0, -3600),
        radius: 1100,
        color: 0xe74c3c,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      las_palmas: {
        id: 'las_palmas',
        name: 'Las Palmas Casino Strip',
        tagline: 'Golden Towers, Neon Resorts & Fountains',
        center: new THREE.Vector3(-4200, 0, 1000),
        radius: 1100,
        color: 0xf1c40f,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      },
      alpine_pines: {
        id: 'alpine_pines',
        name: 'Alpine Pines Peak',
        tagline: 'Snowy Forests, Chalets & Mountain Vistas',
        center: new THREE.Vector3(1200, 0, 5000),
        radius: 1100,
        color: 0x1abc9c,
        group: new THREE.Group(),
        colliders: [],
        interactives: [],
        loaded: false
      }
    };
  }

  generate() {
    this.createGlobalOceanAndTerrain();
    this.createTransArchipelagoHighways();

    // Attach city groups to scene
    Object.values(this.cities).forEach(city => {
      this.scene.add(city.group);
    });

    // Generate each city's procedural architecture
    this.buildMetropolisCity();
    this.buildViceBeachCity();
    this.buildLibertyPortCity();
    this.buildMapleSuburbsCity();
    this.buildBadlandsCity();
    this.buildChinatownCity();
    this.buildLasPalmasCity();
    this.buildAlpinePinesCity();

    // Initial streaming update around player spawn (0, 0)
    this.updateStreaming(new THREE.Vector3(0, 1, 10));
  }

  // ------------------------------------------------------------
  // GLOBAL OCEAN & TERRAIN (30,000 x 30,000)
  // ------------------------------------------------------------

  createGlobalOceanAndTerrain() {
    // 1. Massive Surrounding Ocean Plane (32,000 x 32,000)
    const oceanGeo = new THREE.PlaneGeometry(32000, 32000);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x092b45,
      transparent: true,
      opacity: 0.92,
      shininess: 90
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.oceanMesh.position.y = -0.2;
    this.scene.add(this.oceanMesh);

    // 2. Central Mainland Grass Foundation Plane (18,000 x 18,000)
    const landGeo = new THREE.PlaneGeometry(18000, 18000);
    const landMat = new THREE.MeshLambertMaterial({ color: 0x162215 });
    const land = new THREE.Mesh(landGeo, landMat);
    land.rotation.x = -Math.PI / 2;
    land.position.y = -0.05;
    land.receiveShadow = true;
    this.scene.add(land);

    // Coastline Boundary Warning Buoys along the ocean edge
    const buoyMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const buoyGeo = new THREE.CylinderGeometry(4, 4, 12, 12);
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const bx = Math.cos(angle) * this.seaBoundary;
      const bz = Math.sin(angle) * this.seaBoundary;
      const buoy = new THREE.Mesh(buoyGeo, buoyMat);
      buoy.position.set(bx, 5, bz);
      this.scene.add(buoy);
    }
  }

  // ------------------------------------------------------------
  // TRANS-ARCHIPELAGO HIGHWAYS CONNECTING ALL 8 CITIES
  // ------------------------------------------------------------

  createTransArchipelagoHighways() {
    const highwayMat = new THREE.MeshLambertMaterial({ color: 0x1c1e21 });
    const yellowStripe = new THREE.MeshBasicMaterial({ color: 0xe8b82a });
    const metro = this.cities.metropolis.center;

    // Connect Downtown Metropolis to all 7 outer cities with broad 4-lane expressways
    const outerCities = ['vice_beach', 'liberty_port', 'maple_suburbs', 'badlands', 'chinatown', 'las_palmas', 'alpine_pines'];

    outerCities.forEach(cityKey => {
      const target = this.cities[cityKey].center;
      const dir = target.clone().sub(metro);
      const dist = dir.length();
      const mid = metro.clone().add(dir.clone().multiplyScalar(0.5));
      const angle = Math.atan2(dir.x, dir.z);

      // Highway surface (24m wide)
      const roadGeo = new THREE.PlaneGeometry(24, dist);
      const road = new THREE.Mesh(roadGeo, highwayMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = -angle;
      road.position.set(mid.x, 0.02, mid.z);
      road.receiveShadow = true;
      this.scene.add(road);

      // Double yellow center median line
      const stripeGeo = new THREE.PlaneGeometry(0.5, dist);
      const stripe = new THREE.Mesh(stripeGeo, yellowStripe);
      stripe.rotation.x = -Math.PI / 2;
      stripe.rotation.z = -angle;
      stripe.position.set(mid.x, 0.03, mid.z);
      this.scene.add(stripe);
    });
  }

  // ------------------------------------------------------------
  // DYNAMIC CITY STREAMING (ZERO LAG OPTIMIZATION)
  // ------------------------------------------------------------

  updateStreaming(playerPos) {
    let closestCity = null;
    let minDistance = Infinity;

    // 1. Identify which city the player is inside or closest to
    Object.values(this.cities).forEach(city => {
      const d = playerPos.distanceTo(city.center);
      if (d < minDistance) {
        minDistance = d;
        closestCity = city;
      }
    });

    // 2. Stream in only cities within streamingRadius (2200m)
    this.colliders = [];
    this.interactiveSpots = [];

    Object.values(this.cities).forEach(city => {
      const d = playerPos.distanceTo(city.center);
      const isNear = d <= this.streamingRadius;

      city.group.visible = isNear;

      if (isNear) {
        // Feed colliders and interactive spots for physics & raycasts
        this.colliders.push(...city.colliders);
        this.interactiveSpots.push(...city.interactives);
      }
    });

    // 3. Detect city crossing & show Welcome Title Card
    if (closestCity && closestCity.id !== this.currentCityId && minDistance < closestCity.radius) {
      this.currentCityId = closestCity.id;
      if (window.gameUI) {
        window.gameUI.showCityWelcome(closestCity.name, closestCity.tagline);
      }
    }

    return closestCity;
  }

  // Check sea boundary limit to prevent falling off the world
  checkSeaBoundary(pos) {
    let hitBoundary = false;
    if (Math.abs(pos.x) > this.seaBoundary) {
      pos.x = Math.sign(pos.x) * (this.seaBoundary - 5);
      hitBoundary = true;
    }
    if (Math.abs(pos.z) > this.seaBoundary) {
      pos.z = Math.sign(pos.z) * (this.seaBoundary - 5);
      hitBoundary = true;
    }
    if (hitBoundary && window.gameUI) {
      window.gameUI.showSeaWarning();
    }
    return hitBoundary;
  }

  // ------------------------------------------------------------
  // CITY 1: DOWNTOWN METROPOLIS (Citadel, Hospital, Armory, SuperMart)
  // ------------------------------------------------------------

  buildMetropolisCity() {
    const city = this.cities.metropolis;
    const g = city.group;
    const c = city.center;
    const blockSize = 60;
    const roadWidth = 18;
    const totalStep = blockSize + roadWidth; // 78

    // Internal City Street Grid (5x5 blocks)
    this.createLocalGrid(g, c, 5, blockSize, roadWidth, 0x1f2428);

    // 1. Citadel Skyscraper at center (0, 0)
    this.buildCitadelTower(city, c.x + 39, c.z + 39);

    // 2. St. Jude Hospital at (-1, 0)
    this.buildHospital(city, c.x - 39, c.z + 39);

    // 3. Luigi's Express Pizzeria at (1, 0)
    this.buildPizzeria(city, c.x + 117, c.z + 39);

    // 4. Metro Cab Depot at (0, 1)
    this.buildTaxiDepot(city, c.x + 39, c.z + 117);

    // 5. City Customs Garage at (-1, 1)
    this.buildCustomsMechanicShop(city, c.x - 39, c.z + 117);

    // 6. The Black Lotus Guild at (-2, -2)
    this.buildAssassinGuild(city, c.x - 117, c.z - 117);

    // 7. Apex Car Dealership at (1, 1)
    this.buildCarDealership(city, c.x + 117, c.z + 117);

    // 8. Urban Threads & Armory at (0, -1)
    this.buildClothesAndArmoryShop(city, c.x + 39, c.z - 39);

    // 9. NEW: 24/7 SuperMart & Convenience Store at (0, 0) plaza corner
    this.buildSuperMart(city, c.x + 22, c.z + 20, 'Downtown 24/7 SuperMart');

    // 10. NEW: First National Bank & Vault at (1, -1)
    this.buildBankBuilding(city, c.x + 117, c.z - 39);

    // Surrounding Downtown Skyscraper Towers
    const towerHeights = [85, 110, 95, 130, 75, 100];
    const towerCoords = [
      [-117, 39], [117, -117], [-39, -117], [39, -117], [-117, -39]
    ];
    towerCoords.forEach((coord, idx) => {
      const h = towerHeights[idx % towerHeights.length];
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(38, h, 38),
        new THREE.MeshLambertMaterial({ color: 0x1a2634 })
      );
      tower.position.set(c.x + coord[0], h / 2 + 0.3, c.z + coord[1]);
      g.add(tower);
      this.addCityCollider(city, c.x + coord[0], c.z + coord[1], 38, 38);

      // Neon accent
      const neon = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, h - 4, 0.4),
        new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x00f0ff : 0xff00bb })
      );
      neon.position.set(c.x + coord[0] + 19, h / 2, c.z + coord[1] + 19);
      g.add(neon);
    });
  }

  // ------------------------------------------------------------
  // CITY 2: VICE BEACH & MARINA (Luxury Villas, Palms, Boardwalk)
  // ------------------------------------------------------------

  buildViceBeachCity() {
    const city = this.cities.vice_beach;
    const g = city.group;
    const c = city.center;

    // Sandy beach terrain pad (800 x 800)
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0xecd599 })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(c.x, 0.05, c.z);
    g.add(sand);

    // Ocean bay water
    const bayWater = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 900),
      new THREE.MeshPhongMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.85, shininess: 100 })
    );
    bayWater.rotation.x = -Math.PI / 2;
    bayWater.position.set(c.x + 350, 0.1, c.z);
    g.add(bayWater);

    // Luxury Modern Beach Villas with swimming pools
    const villaOffsets = [[-180, -180], [-180, 0], [-180, 180], [0, -180], [0, 180]];
    villaOffsets.forEach(off => {
      const vx = c.x + off[0];
      const vz = c.z + off[1];
      const villa = new THREE.Mesh(
        new THREE.BoxGeometry(45, 14, 40),
        new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 85 })
      );
      villa.position.set(vx, 7.3, vz);
      g.add(villa);
      this.addCityCollider(city, vx, vz, 45, 40);

      // Turquoise Pool
      const pool = new THREE.Mesh(
        new THREE.BoxGeometry(20, 0.4, 25),
        new THREE.MeshBasicMaterial({ color: 0x00f5d4 })
      );
      pool.position.set(vx + 26, 0.25, vz);
      g.add(pool);
    });

    // Vice Beach 24/7 SuperMart
    this.buildSuperMart(city, c.x - 60, c.z, 'Vice Beach MiniMart');

    // Palm Trees along coastal boulevard
    for (let p = -300; p <= 300; p += 60) {
      this.createPalmTree(g, c.x + 120, c.z + p);
    }
  }

  // ------------------------------------------------------------
  // CITY 3: LIBERTY INDUSTRIAL PORT (Cargo Cranes & Containers)
  // ------------------------------------------------------------

  buildLibertyPortCity() {
    const city = this.cities.liberty_port;
    const g = city.group;
    const c = city.center;

    // Concrete industrial dock surface
    const dockGround = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0x2b2e33 })
    );
    dockGround.rotation.x = -Math.PI / 2;
    dockGround.position.set(c.x, 0.05, c.z);
    g.add(dockGround);

    // Giant Industrial Shipping Cranes (3 Cranes)
    [-180, 0, 180].forEach(pz => {
      const craneX = c.x + 160;
      const craneZ = c.z + pz;

      // Crane Mast
      const mast = new THREE.Mesh(
        new THREE.BoxGeometry(6, 48, 6),
        new THREE.MeshLambertMaterial({ color: 0xf39c12 })
      );
      mast.position.set(craneX, 24, craneZ);
      g.add(mast);
      this.addCityCollider(city, craneX, craneZ, 6, 6);

      // Crane Boom / Arm
      const boom = new THREE.Mesh(
        new THREE.BoxGeometry(45, 4, 5),
        new THREE.MeshLambertMaterial({ color: 0xf39c12 })
      );
      boom.position.set(craneX - 15, 46, craneZ);
      g.add(boom);
    });

    // Stacks of Shipping Containers (Red, Blue, Green, Yellow)
    const containerColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf1c40f];
    for (let row = -2; row <= 2; row++) {
      for (let stack = 0; stack < 3; stack++) {
        const cx = c.x - 120 + stack * 35;
        const cz = c.z + row * 60;
        const container = new THREE.Mesh(
          new THREE.BoxGeometry(24, 7, 10),
          new THREE.MeshLambertMaterial({ color: containerColors[(row + stack + 4) % 4] })
        );
        container.position.set(cx, 3.8, cz);
        g.add(container);
        this.addCityCollider(city, cx, cz, 24, 10);
      }
    }

    // Heavy Freight Warehouse
    const wh = new THREE.Mesh(
      new THREE.BoxGeometry(70, 20, 100),
      new THREE.MeshLambertMaterial({ color: 0x3d4451 })
    );
    wh.position.set(c.x - 220, 10, c.z);
    g.add(wh);
    this.addCityCollider(city, c.x - 220, c.z, 70, 100);
  }

  // ------------------------------------------------------------
  // CITY 4: MAPLE VALLEY SUBURBS (Homes, Lawns & Chimneys)
  // ------------------------------------------------------------

  buildMapleSuburbsCity() {
    const city = this.cities.maple_suburbs;
    const g = city.group;
    const c = city.center;

    // Green lawn ground
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0x27ae60 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(c.x, 0.05, c.z);
    g.add(grass);

    // Charming Suburban Houses with roofs & brick chimneys
    const houseOffsets = [
      [-150, -150], [-150, 0], [-150, 150],
      [0, -150], [0, 150],
      [150, -150], [150, 0], [150, 150]
    ];
    houseOffsets.forEach((off, idx) => {
      const hx = c.x + off[0];
      const hz = c.z + off[1];

      // House main body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(26, 9, 24),
        new THREE.MeshLambertMaterial({ color: 0xf5f6fa })
      );
      body.position.set(hx, 4.8, hz);
      g.add(body);
      this.addCityCollider(city, hx, hz, 26, 24);

      // Pitched roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(18, 6.5, 4),
        new THREE.MeshLambertMaterial({ color: [0x8b2500, 0x34495e, 0x78553d][idx % 3] })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.set(hx, 12, hz);
      g.add(roof);

      // Brick Chimney
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(2, 6, 2),
        new THREE.MeshLambertMaterial({ color: 0x962d2d })
      );
      chimney.position.set(hx + 7, 13, hz + 5);
      g.add(chimney);
    });

    // Suburb 24/7 SuperMart
    this.buildSuperMart(city, c.x, c.z, 'Maple Suburbs Grocery');
  }

  // ------------------------------------------------------------
  // CITY 5: RED ROCK BADLANDS (Desert Mesas & Outlaw Scrapyard)
  // ------------------------------------------------------------

  buildBadlandsCity() {
    const city = this.cities.badlands;
    const g = city.group;
    const c = city.center;

    // Red desert sand terrain
    const desert = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0xb5651d })
    );
    desert.rotation.x = -Math.PI / 2;
    desert.position.set(c.x, 0.05, c.z);
    g.add(desert);

    // Towering Red Sandstone Canyon Rock Mesas
    for (let r = 0; r < 8; r++) {
      const angle = (r / 8) * Math.PI * 2;
      const rx = c.x + Math.cos(angle) * 240;
      const rz = c.z + Math.sin(angle) * 240;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(18 + Math.random() * 10, 1),
        new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      );
      rock.position.set(rx, 14, rz);
      rock.scale.set(1.5, 1.2, 1.5);
      g.add(rock);
      this.addCityCollider(city, rx, rz, 26, 26);
    }

    // Outlaw Scrapyard Garage & Diner
    const diner = new THREE.Mesh(
      new THREE.BoxGeometry(45, 10, 30),
      new THREE.MeshLambertMaterial({ color: 0x7f8c8d })
    );
    diner.position.set(c.x, 5.3, c.z);
    g.add(diner);
    this.addCityCollider(city, c.x, c.z, 45, 30);

    // Route 66 Desert Mart
    this.buildSuperMart(city, c.x + 60, c.z, 'Route 66 Desert Outpost');
  }

  // ------------------------------------------------------------
  // CITY 6: NEO-CHINATOWN (Pagodas, Lanterns & Night Bazaar)
  // ------------------------------------------------------------

  buildChinatownCity() {
    const city = this.cities.chinatown;
    const g = city.group;
    const c = city.center;

    // Dark slate cobblestone ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(c.x, 0.05, c.z);
    g.add(ground);

    // Traditional Pagoda Gate Archway
    const archPillarL = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), new THREE.MeshLambertMaterial({ color: 0xc0392b }));
    archPillarL.position.set(c.x - 14, 8, c.z - 80);
    g.add(archPillarL);

    const archPillarR = new THREE.Mesh(new THREE.BoxGeometry(3, 16, 3), new THREE.MeshLambertMaterial({ color: 0xc0392b }));
    archPillarR.position.set(c.x + 14, 8, c.z - 80);
    g.add(archPillarR);

    const archRoof = new THREE.Mesh(new THREE.ConeGeometry(22, 6, 4), new THREE.MeshLambertMaterial({ color: 0xe67e22 }));
    archRoof.rotation.y = Math.PI / 4;
    archRoof.position.set(c.x, 18, c.z - 80);
    g.add(archRoof);

    // Chinatown Dim Sum & Tea Pavilions
    [-120, 120].forEach(px => {
      const pav = new THREE.Mesh(new THREE.BoxGeometry(40, 18, 40), new THREE.MeshLambertMaterial({ color: 0x962d2d }));
      pav.position.set(c.x + px, 9.3, c.z);
      g.add(pav);
      this.addCityCollider(city, c.x + px, c.z, 40, 40);

      // Glowing red paper lanterns
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
      lantern.position.set(c.x + px, 21, c.z);
      g.add(lantern);
    });

    this.buildSuperMart(city, c.x, c.z, 'Golden Dragon Convenience');
  }

  // ------------------------------------------------------------
  // CITY 7: LAS PALMAS CASINO STRIP (Golden Towers & Fountains)
  // ------------------------------------------------------------

  buildLasPalmasCity() {
    const city = this.cities.las_palmas;
    const g = city.group;
    const c = city.center;

    // Polished dark marble strip
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0x11161b })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(c.x, 0.05, c.z);
    g.add(strip);

    // Giant Golden Casino Pyramid
    const pyramid = new THREE.Mesh(
      new THREE.ConeGeometry(55, 60, 4),
      new THREE.MeshPhongMaterial({ color: 0xf1c40f, shininess: 100 })
    );
    pyramid.rotation.y = Math.PI / 4;
    pyramid.position.set(c.x, 30, c.z);
    g.add(pyramid);
    this.addCityCollider(city, c.x, c.z, 60, 60);

    // Grand Illuminated Water Fountain
    const fountain = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 20, 2, 24),
      new THREE.MeshBasicMaterial({ color: 0x00d2d3 })
    );
    fountain.position.set(c.x, 1, c.z + 120);
    g.add(fountain);
    this.addCityCollider(city, c.x, c.z + 120, 20, 20);

    // Casino Strip 24/7 Mart
    this.buildSuperMart(city, c.x - 140, c.z, 'Palmas Casino Mart');
  }

  // ------------------------------------------------------------
  // CITY 8: ALPINE PINES PEAK (Snowy Forest & Log Chalets)
  // ------------------------------------------------------------

  buildAlpinePinesCity() {
    const city = this.cities.alpine_pines;
    const g = city.group;
    const c = city.center;

    // Snowy white terrain ground
    const snow = new THREE.Mesh(
      new THREE.PlaneGeometry(900, 900),
      new THREE.MeshLambertMaterial({ color: 0xf8f9fa })
    );
    snow.rotation.x = -Math.PI / 2;
    snow.position.set(c.x, 0.05, c.z);
    g.add(snow);

    // Pine Trees Forest
    for (let i = 0; i < 28; i++) {
      const px = c.x + (Math.random() - 0.5) * 600;
      const pz = c.z + (Math.random() - 0.5) * 600;
      this.createPineTree(g, px, pz);
    }

    // Wooden Timber Ski Chalet
    const chalet = new THREE.Mesh(
      new THREE.BoxGeometry(35, 12, 30),
      new THREE.MeshLambertMaterial({ color: 0x5d4037 })
    );
    chalet.position.set(c.x, 6.3, c.z);
    g.add(chalet);
    this.addCityCollider(city, c.x, c.z, 35, 30);

    // Alpine Fire Lookout Tower (High Vantage Point)
    const towerPillar = new THREE.Mesh(new THREE.BoxGeometry(4, 38, 4), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
    towerPillar.position.set(c.x + 80, 19, c.z + 80);
    g.add(towerPillar);
    this.addCityCollider(city, c.x + 80, c.z + 80, 5, 5);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
    deck.position.set(c.x + 80, 38, c.z + 80);
    g.add(deck);

    this.addCityInteractiveZone(city, {
      id: 'alpine_lookout',
      type: 'teleport',
      name: 'Alpine Lookout Tower',
      position: new THREE.Vector3(c.x + 80, 0.5, c.z + 74),
      color: 0x1abc9c,
      action: 'teleport',
      targetPos: new THREE.Vector3(c.x + 80, 39.5, c.z + 80)
    });
  }

  // ------------------------------------------------------------
  // PROCEDURAL BUILDING & SHOP HELPERS
  // ------------------------------------------------------------

  createLocalGrid(group, center, blockCount, blockSize, roadWidth, groundHex = 0x222225) {
    const totalStep = blockSize + roadWidth;
    const span = blockCount * totalStep;

    const roadMat = new THREE.MeshLambertMaterial({ color: groundHex });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x636e72 });

    // Paved roadways
    for (let i = -Math.floor(blockCount / 2); i <= Math.floor(blockCount / 2); i++) {
      const pos = i * totalStep;

      // Vertical road
      const rV = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, span), roadMat);
      rV.rotation.x = -Math.PI / 2;
      rV.position.set(center.x + pos, 0.01, center.y);
      group.add(rV);

      // Horizontal road
      const rH = new THREE.Mesh(new THREE.PlaneGeometry(span, roadWidth), roadMat);
      rH.rotation.x = -Math.PI / 2;
      rH.position.set(center.x, 0.01, center.z + pos);
      group.add(rH);
    }

    // Sidewalk slabs
    for (let x = -Math.floor(blockCount / 2); x < Math.floor(blockCount / 2); x++) {
      for (let z = -Math.floor(blockCount / 2); z < Math.floor(blockCount / 2); z++) {
        const cx = center.x + (x + 0.5) * totalStep;
        const cz = center.z + (z + 0.5) * totalStep;
        const sw = new THREE.Mesh(new THREE.BoxGeometry(blockSize, 0.25, blockSize), sidewalkMat);
        sw.position.set(cx, 0.12, cz);
        group.add(sw);
      }
    }
  }

  // 24/7 SuperMart & Convenience Store with Organised Interior
  buildSuperMart(city, x, z, martName = '24/7 SuperMart') {
    const g = city.group;

    // Building structure (Glass front with bright neon logo)
    const mart = new THREE.Mesh(
      new THREE.BoxGeometry(26, 7.5, 22),
      new THREE.MeshLambertMaterial({ color: 0x27ae60 })
    );
    mart.position.set(x, 4.0, z);
    g.add(mart);
    this.addCityCollider(city, x, z, 26, 22);

    // Mart Illuminated Signboard
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.2, 0.6),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    sign.position.set(x, 8.2, z - 11.2);
    g.add(sign);

    // Interactive Shop & Loot Entrance Zone
    this.addCityInteractiveZone(city, {
      id: `supermart_${city.id}`,
      type: 'shop_interior',
      name: `${martName} (Buy / Loot Register)`,
      desc: 'Buy Medkits, Armor, Energy Drinks, or Press [F] to Rob Register!',
      position: new THREE.Vector3(x, 0.5, z - 12.5),
      color: 0x00ff88,
      action: 'open_supermart'
    });
  }

  // First National Bank & Heist Vault
  buildBankBuilding(city, x, z) {
    const g = city.group;

    const bank = new THREE.Mesh(
      new THREE.BoxGeometry(36, 18, 32),
      new THREE.MeshLambertMaterial({ color: 0xdfe6e9 })
    );
    bank.position.set(x, 9.3, z);
    g.add(bank);
    this.addCityCollider(city, x, z, 36, 32);

    // Columns
    [-14, -7, 7, 14].forEach(px => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 16, 16), new THREE.MeshLambertMaterial({ color: 0xb2bec3 }));
      col.position.set(x + px, 8.5, z - 16.5);
      g.add(col);
    });

    this.addCityInteractiveZone(city, {
      id: `bank_${city.id}`,
      type: 'bank_heist',
      name: 'First National Bank & Vault',
      desc: 'Crack vault for $15K-$30K heist payout (Triggers 4-Star police manhunt)!',
      position: new THREE.Vector3(x, 0.5, z - 18),
      color: 0xf1c40f,
      action: 'open_bank'
    });
  }

  buildCitadelTower(city, x, z) {
    const g = city.group;

    // 138-meter Citadel Tower
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(40, 138, 40),
      new THREE.MeshPhongMaterial({ color: 0x0b1726, shininess: 95 })
    );
    tower.position.set(x, 69.3, z);
    g.add(tower);
    this.addCityCollider(city, x, z, 40, 40);

    // Rooftop Helipad & Sniper Deck at Y=138.5
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(46, 2.5, 46),
      new THREE.MeshLambertMaterial({ color: 0x1f2428 })
    );
    deck.position.set(x, 138.5, z);
    g.add(deck);

    // High-Speed Express Elevator Entrance (Ground)
    this.addCityInteractiveZone(city, {
      id: 'citadel_elevator_up',
      type: 'teleport',
      name: 'Citadel Rooftop Sniper Elevator',
      desc: 'Express elevator up to the 138m Rooftop Helipad & Sniper Vantage Point!',
      position: new THREE.Vector3(x, 0.5, z - 21),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 140, z - 10)
    });

    // Rooftop Return Elevator
    this.addCityInteractiveZone(city, {
      id: 'citadel_elevator_down',
      type: 'teleport',
      name: 'Rooftop Elevator to Street Level',
      desc: 'Return to ground central metropolis plaza.',
      position: new THREE.Vector3(x, 140, z - 11),
      color: 0x00f0ff,
      action: 'teleport',
      targetPos: new THREE.Vector3(x, 1.0, z - 19)
    });

    // Luxury Penthouse Safehouse (Rest to heal 100% HP)
    this.addCityInteractiveZone(city, {
      id: 'penthouse_enter',
      type: 'teleport_heal',
      name: 'Citadel Penthouse Suite (Safehouse)',
      desc: 'Rest in master suite to heal 100% HP & browse contracts.',
      position: new THREE.Vector3(x + 14, 0.5, z - 21),
      color: 0x9b59b6,
      action: 'teleport_heal',
      targetPos: new THREE.Vector3(x, 140, z + 8)
    });
  }

  buildHospital(city, x, z) {
    const g = city.group;
    const h = new THREE.Mesh(new THREE.BoxGeometry(44, 26, 40), new THREE.MeshLambertMaterial({ color: 0xecf0f1 }));
    h.position.set(x, 13.3, z);
    g.add(h);
    this.addCityCollider(city, x, z, 44, 40);

    // Red Cross Sign
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    cross1.position.set(x, 22, z - 20.3);
    g.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 10, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    cross2.position.set(x, 22, z - 20.3);
    g.add(cross2);

    this.addCityInteractiveZone(city, {
      id: 'hospital_ambulance_job',
      type: 'job',
      name: 'St. Jude Hospital ER (Ambulance Shift)',
      position: new THREE.Vector3(x, 0.5, z - 22),
      color: 0xff2222,
      action: 'ambulance_job'
    });
  }

  buildPizzeria(city, x, z) {
    const g = city.group;
    const p = new THREE.Mesh(new THREE.BoxGeometry(38, 14, 34), new THREE.MeshLambertMaterial({ color: 0xd35400 }));
    p.position.set(x, 7.3, z);
    g.add(p);
    this.addCityCollider(city, x, z, 38, 34);

    this.addCityInteractiveZone(city, {
      id: 'luigis_pizza_job',
      type: 'job',
      name: "Luigi's Express (Pizza Delivery Shift)",
      position: new THREE.Vector3(x, 0.5, z - 19),
      color: 0xf39c12,
      action: 'delivery_job'
    });
  }

  buildTaxiDepot(city, x, z) {
    const g = city.group;
    const d = new THREE.Mesh(new THREE.BoxGeometry(40, 14, 38), new THREE.MeshLambertMaterial({ color: 0xf1c40f }));
    d.position.set(x, 7.3, z);
    g.add(d);
    this.addCityCollider(city, x, z, 40, 38);

    this.addCityInteractiveZone(city, {
      id: 'metro_cab_job',
      type: 'job',
      name: 'Metro City Cab Depot (Taxi Shift)',
      position: new THREE.Vector3(x, 0.5, z - 21),
      color: 0xf1c40f,
      action: 'taxi_job'
    });
  }

  buildCustomsMechanicShop(city, x, z) {
    const g = city.group;
    const m = new THREE.Mesh(new THREE.BoxGeometry(42, 16, 38), new THREE.MeshLambertMaterial({ color: 0x2c3e50 }));
    m.position.set(x, 8.3, z);
    g.add(m);
    this.addCityCollider(city, x, z, 42, 38);

    this.addCityInteractiveZone(city, {
      id: 'city_customs_shop',
      type: 'shop',
      name: 'City Customs (Mechanic Tuning & Nitro)',
      position: new THREE.Vector3(x, 0.5, z - 21),
      color: 0x3498db,
      action: 'open_mechanic'
    });
  }

  buildAssassinGuild(city, x, z) {
    const g = city.group;
    const guild = new THREE.Mesh(new THREE.BoxGeometry(36, 15, 36), new THREE.MeshLambertMaterial({ color: 0x050505 }));
    guild.position.set(x, 7.8, z);
    g.add(guild);
    this.addCityCollider(city, x, z, 36, 36);

    this.addCityInteractiveZone(city, {
      id: 'assassin_guild_entrance',
      type: 'guild',
      name: "The Black Lotus (Assassin's Guild)",
      position: new THREE.Vector3(x, 0.5, z - 20),
      color: 0x8e44ad,
      action: 'open_guild'
    });
  }

  buildCarDealership(city, x, z) {
    const g = city.group;
    const dealer = new THREE.Mesh(new THREE.BoxGeometry(46, 15, 42), new THREE.MeshPhongMaterial({ color: 0x1a1a24, shininess: 90 }));
    dealer.position.set(x, 7.8, z);
    g.add(dealer);
    this.addCityCollider(city, x, z, 46, 42);

    this.addCityInteractiveZone(city, {
      id: 'apex_dealership',
      type: 'shop',
      name: 'Apex Exotic Motors Showroom',
      position: new THREE.Vector3(x, 0.5, z - 23),
      color: 0xe74c3c,
      action: 'open_cardealer'
    });
  }

  buildClothesAndArmoryShop(city, x, z) {
    const g = city.group;
    const b = new THREE.Mesh(new THREE.BoxGeometry(36, 14, 34), new THREE.MeshLambertMaterial({ color: 0x34495e }));
    b.position.set(x, 7.3, z);
    g.add(b);
    this.addCityCollider(city, x, z, 36, 34);

    this.addCityInteractiveZone(city, {
      id: 'clothes_shop',
      type: 'shop',
      name: 'Urban Threads Boutique',
      position: new THREE.Vector3(x - 7, 0.5, z - 19),
      color: 0x1abc9c,
      action: 'open_clothes'
    });

    this.addCityInteractiveZone(city, {
      id: 'armory_shop',
      type: 'shop',
      name: 'Underground Armory (Silenced Weapons)',
      position: new THREE.Vector3(x + 7, 0.5, z - 19),
      color: 0x95a5a6,
      action: 'open_armory'
    });
  }

  // ------------------------------------------------------------
  // VEGETATION & PROPS
  // ------------------------------------------------------------

  createPalmTree(group, x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 11, 8), new THREE.MeshLambertMaterial({ color: 0x8b5a2b }));
    trunk.position.set(x, 5.5, z);
    group.add(trunk);

    const leaves = new THREE.Mesh(new THREE.ConeGeometry(5, 2.5, 6), new THREE.MeshLambertMaterial({ color: 0x27ae60 }));
    leaves.position.set(x, 11.2, z);
    group.add(leaves);
  }

  createPineTree(group, x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 12, 8), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
    trunk.position.set(x, 6, z);
    group.add(trunk);

    const foliage = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 8), new THREE.MeshLambertMaterial({ color: 0x1b4332 }));
    foliage.position.set(x, 14, z);
    group.add(foliage);
  }

  // ------------------------------------------------------------
  // COLLIDERS & INTERACTIVE QUERIES
  // ------------------------------------------------------------

  addCityCollider(city, x, z, width, depth) {
    city.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  addCityInteractiveZone(city, config) {
    const group = new THREE.Group();
    group.position.copy(config.position);

    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 0.35, 24),
      new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.65 })
    );
    group.add(cylinder);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1.2, 7.5, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: config.color, transparent: true, opacity: 0.35 })
    );
    beam.position.y = 3.6;
    group.add(beam);

    city.group.add(group);

    city.interactives.push({
      ...config,
      meshGroup: group,
      radius: 4.2
    });
  }

  checkCollision(x, z, radius = 0.5) {
    // 1. Check streamed active city colliders
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

    // 2. Global Sea Boundary check
    if (Math.abs(x) > this.seaBoundary || Math.abs(z) > this.seaBoundary) {
      return true;
    }

    return false;
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

  update(delta, playerPos) {
    // Dynamic city streaming
    if (playerPos) {
      this.updateStreaming(playerPos);
      this.checkSeaBoundary(playerPos);
    }

    // Animate active interactive beacons
    for (let i = 0; i < this.interactiveSpots.length; i++) {
      const spot = this.interactiveSpots[i];
      if (spot.meshGroup) {
        spot.meshGroup.rotation.y += delta * 0.8;
      }
    }
  }
}

window.CityWorld = CityWorld;
