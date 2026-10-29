// ============================================================
// CITY VIBES - 3D PROCEDURAL CITY WORLD BUILDER
// ============================================================

class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Bounding boxes for collision detection
    this.interactiveSpots = []; // Jobs, shops, properties, guild entrance
    this.streetLights = [];
    this.dayNightCycle = 0.3; // 0 to 1 (0.25=day, 0.5=sunset, 0.75=night, 0.0=dawn)
    this.citySize = 700; // -350 to +350
    this.blockSize = 60;
    this.roadWidth = 18;
    this.sidewalkWidth = 3;
    this.gridBlocks = 7; // -3 to +3 blocks in X and Z
  }

  generate() {
    this.createGround();
    this.createRoadsAndIntersections();
    this.createDistrictsAndBuildings();
    this.createStreetFurniture();
    this.createKeyLandmarks();
    this.createVegetation();
  }

  createGround() {
    // City Base Terrain
    const groundGeo = new THREE.PlaneGeometry(this.citySize * 1.5, this.citySize * 1.5);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a2618 }); // Deep grassy base
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Ocean / Bay along Z = -350
    const waterGeo = new THREE.PlaneGeometry(this.citySize * 2, 400);
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x0f3b57,
      transparent: true,
      opacity: 0.85,
      shininess: 90
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.2, -450);
    this.scene.add(water);
  }

  createRoadsAndIntersections() {
    const totalStep = this.blockSize + this.roadWidth;
    const halfSpan = Math.floor(this.gridBlocks / 2) * totalStep;

    const roadMat = new THREE.MeshLambertMaterial({ color: 0x222225 }); // Dark asphalt
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x7c8082 }); // Concrete curb
    const markingMat = new THREE.MeshBasicMaterial({ color: 0xe5e8e8 }); // White stripes
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xe8b82a }); // Yellow double line

    for (let i = -Math.floor(this.gridBlocks / 2); i <= Math.floor(this.gridBlocks / 2); i++) {
      const coord = i * totalStep;

      // Vertical Roads (North-South, along Z axis)
      const roadVGeo = new THREE.PlaneGeometry(this.roadWidth, this.citySize);
      const roadV = new THREE.Mesh(roadVGeo, roadMat);
      roadV.rotation.x = -Math.PI / 2;
      roadV.position.set(coord, 0.01, 0);
      roadV.receiveShadow = true;
      this.scene.add(roadV);

      // Horizontal Roads (East-West, along X axis)
      const roadHGeo = new THREE.PlaneGeometry(this.citySize, this.roadWidth);
      const roadH = new THREE.Mesh(roadHGeo, roadMat);
      roadH.rotation.x = -Math.PI / 2;
      roadH.position.set(0, 0.01, coord);
      roadH.receiveShadow = true;
      this.scene.add(roadH);

      // Yellow double center markings
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

    // Sidewalk slabs under blocks
    for (let x = -Math.floor(this.gridBlocks / 2); x <= Math.floor(this.gridBlocks / 2) - 1; x++) {
      for (let z = -Math.floor(this.gridBlocks / 2); z <= Math.floor(this.gridBlocks / 2) - 1; z++) {
        const cx = (x + 0.5) * totalStep;
        const cz = (z + 0.5) * totalStep;

        const sidewalkGeo = new THREE.BoxGeometry(this.blockSize + 2, 0.4, this.blockSize + 2);
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(cx, 0.2, cz);
        sidewalk.receiveShadow = true;
        this.scene.add(sidewalk);
      }
    }
  }

  createDistrictsAndBuildings() {
    const totalStep = this.blockSize + this.roadWidth;
    const bColors = [0x2c3e50, 0x34495e, 0x243342, 0x1f2421, 0x3d3d3d, 0x566573, 0x1b2631];
    const windowMatLit = new THREE.MeshBasicMaterial({ color: 0xffea88 });
    const windowMatDark = new THREE.MeshLambertMaterial({ color: 0x111c24 });

    for (let x = -Math.floor(this.gridBlocks / 2); x <= Math.floor(this.gridBlocks / 2) - 1; x++) {
      for (let z = -Math.floor(this.gridBlocks / 2); z <= Math.floor(this.gridBlocks / 2) - 1; z++) {
        const cx = (x + 0.5) * totalStep;
        const cz = (z + 0.5) * totalStep;

        // Reserve specific blocks for special landmarks:
        // (0, 0) Downtown Center / Citadel
        // (-1, 0) Hospital
        // (1, 0) Pizzeria / Delivery
        // (0, 1) Taxi Depot
        // (-2, -2) Assassin Guild / Docks
        // (1, 1) Car Dealership
        // (0, -1) Clothes Store & Armory
        if (
          (x === 0 && z === 0) ||
          (x === -1 && z === 0) ||
          (x === 1 && z === 0) ||
          (x === 0 && z === 1) ||
          (x === -2 && z === -2) ||
          (x === 1 && z === 1) ||
          (x === 0 && z === -1)
        ) {
          continue; // Handled in createKeyLandmarks
        }

        // Zone 1: Downtown Highrises (around center)
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) {
          this.buildSkyscraperCluster(cx, cz);
        }
        // Zone 2: Industrial & Docks (Z <= -2)
        else if (z <= -2) {
          this.buildIndustrialWarehouses(cx, cz);
        }
        // Zone 3: Residential Suburbs (Z >= 1, X != 0)
        else if (z >= 1) {
          this.buildSuburbanHouses(cx, cz);
        }
        // Zone 4: Commercial Mid-rise & Offices
        else {
          this.buildCommercialMidrises(cx, cz);
        }
      }
    }
  }

  buildSkyscraperCluster(cx, cz) {
    const heights = [70, 95, 120, 85];
    const offsets = [
      [-13, -13],
      [13, -13],
      [-13, 13],
      [13, 13]
    ];

    offsets.forEach((off, idx) => {
      const h = heights[idx] + Math.random() * 20;
      const w = 20;
      const d = 20;
      const bColor = [0x1e272c, 0x22313f, 0x1f3a52, 0x2b3e50][idx % 4];

      const bGeo = new THREE.BoxGeometry(w, h, d);
      const bMat = new THREE.MeshLambertMaterial({ color: bColor });
      const tower = new THREE.Mesh(bGeo, bMat);
      tower.position.set(cx + off[0], h / 2 + 0.4, cz + off[1]);
      tower.castShadow = true;
      tower.receiveShadow = true;
      this.scene.add(tower);

      this.addCollider(cx + off[0], cz + off[1], w + 1, d + 1);

      // Glowing Neon Accent Strips on Corners
      const stripGeo = new THREE.BoxGeometry(0.3, h - 4, 0.3);
      const stripMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0xff0077
      });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(cx + off[0] + w / 2, h / 2, cz + off[1] + d / 2);
      this.scene.add(strip);

      // Rooftop Helipad or Antenna
      if (idx === 2) {
        const antennaGeo = new THREE.CylinderGeometry(0.2, 0.4, 22, 6);
        const antennaMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(cx + off[0], h + 11, cz + off[1]);
        this.scene.add(antenna);
      }
    });
  }

  buildCommercialMidrises(cx, cz) {
    const bGeo = new THREE.BoxGeometry(45, 38, 45);
    const bMat = new THREE.MeshLambertMaterial({ color: 0x394b59 });
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(cx, 19 + 0.4, cz);
    building.castShadow = true;
    building.receiveShadow = true;
    this.scene.add(building);
    this.addCollider(cx, cz, 47, 47);

    // Glass curtain facade bands
    for (let f = 4; f < 35; f += 6) {
      const bandGeo = new THREE.BoxGeometry(45.4, 3, 45.4);
      const bandMat = new THREE.MeshBasicMaterial({ color: 0x1f5470 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(cx, f, cz);
      this.scene.add(band);
    }
  }

  buildSuburbanHouses(cx, cz) {
    const houseCoords = [
      [-14, -14],
      [14, -14],
      [-14, 14],
      [14, 14]
    ];
    const roofColors = [0x8b2500, 0x4a5d4e, 0x334455, 0x78553d];

    houseCoords.forEach((off, idx) => {
      const hx = cx + off[0];
      const hz = cz + off[1];

      // House Body
      const bodyGeo = new THREE.BoxGeometry(16, 9, 16);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdedede });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(hx, 4.5 + 0.4, hz);
      body.castShadow = true;
      body.receiveShadow = true;
      this.scene.add(body);

      // Pitched Roof (Cone/Pyramid)
      const roofGeo = new THREE.ConeGeometry(13.5, 6, 4);
      const roofMat = new THREE.MeshLambertMaterial({ color: roofColors[idx % 4] });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(hx, 9 + 3 + 0.4, hz);
      roof.castShadow = true;
      this.scene.add(roof);

      this.addCollider(hx, hz, 17, 17);
    });
  }

  buildIndustrialWarehouses(cx, cz) {
    // Metal warehouse
    const whGeo = new THREE.BoxGeometry(48, 16, 32);
    const whMat = new THREE.MeshLambertMaterial({ color: 0x4d5656 });
    const wh = new THREE.Mesh(whGeo, whMat);
    wh.position.set(cx, 8 + 0.4, cz - 6);
    wh.castShadow = true;
    wh.receiveShadow = true;
    this.scene.add(wh);
    this.addCollider(cx, cz - 6, 50, 34);

    // Stacks of Shipping Containers
    const colors = [0xb03a2e, 0x1f618d, 0x229954, 0xd4ac0d];
    for (let c = 0; c < 5; c++) {
      const cGeo = new THREE.BoxGeometry(12, 5, 5);
      const cMat = new THREE.MeshLambertMaterial({ color: colors[c % colors.length] });
      const container = new THREE.Mesh(cGeo, cMat);
      container.position.set(cx - 15 + c * 7, 2.5 + (c % 2) * 5 + 0.4, cz + 18);
      container.castShadow = true;
      this.scene.add(container);
      this.addCollider(cx - 15 + c * 7, cz + 18, 12, 5);
    }
  }

  // ------------------------------------------------------------
  // KEY LANDMARKS & INTERACTIVE JOB/SHOP/PROPERTY HUBS
  // ------------------------------------------------------------

  createKeyLandmarks() {
    const totalStep = this.blockSize + this.roadWidth;

    // 1. ST. JUDE CITY HOSPITAL (Ambulance HQ) at (-1, 0)
    const hospX = -1 * totalStep;
    const hospZ = 0 * totalStep;
    this.buildHospital(hospX, hospZ);

    // 2. LUIGI'S PIZZERIA & EXPRESS (Delivery Boy HQ) at (1, 0)
    const pizzaX = 1 * totalStep;
    const pizzaZ = 0 * totalStep;
    this.buildPizzeria(pizzaX, pizzaZ);

    // 3. METRO CAB CO. TAXI DEPOT (Cab Driver HQ) at (0, 1)
    const taxiX = 0 * totalStep;
    const taxiZ = 1 * totalStep;
    this.buildTaxiDepot(taxiX, taxiZ);

    // 4. THE BLACK LOTUS ASSASSIN GUILD (Secret Underground Lair) at (-2, -2)
    const guildX = -2 * totalStep;
    const guildZ = -2 * totalStep;
    this.buildAssassinGuild(guildX, guildZ);

    // 5. APEX LUXURY CAR DEALERSHIP at (1, 1)
    const dealerX = 1 * totalStep;
    const dealerZ = 1 * totalStep;
    this.buildCarDealership(dealerX, dealerZ);

    // 6. URBAN THREADS BOUTIQUE & ARMORY at (0, -1)
    const shopX = 0 * totalStep;
    const shopZ = -1 * totalStep;
    this.buildClothesAndArmoryShop(shopX, shopZ);

    // 7. CITADEL DOWNTOWN TOWER & PENTHOUSE at (0, 0)
    const citadelX = 0;
    const citadelZ = 0;
    this.buildCitadelTower(citadelX, citadelZ);

    // 8. REAL ESTATE PROPERTIES across the city
    this.buildRealEstateProperties(totalStep);
  }

  buildHospital(x, z) {
    // Hospital Main Building
    const hGeo = new THREE.BoxGeometry(46, 26, 42);
    const hMat = new THREE.MeshLambertMaterial({ color: 0xecf0f1 });
    const hospital = new THREE.Mesh(hGeo, hMat);
    hospital.position.set(x, 13 + 0.4, z);
    hospital.castShadow = true;
    hospital.receiveShadow = true;
    this.scene.add(hospital);
    this.addCollider(x, z, 48, 44);

    // Red Cross Sign
    const crossVGeo = new THREE.BoxGeometry(3, 10, 0.6);
    const crossHGeo = new THREE.BoxGeometry(10, 3, 0.6);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xee1111 });

    const cV = new THREE.Mesh(crossVGeo, crossMat);
    cV.position.set(x, 20, z + 21.4);
    this.scene.add(cV);

    const cH = new THREE.Mesh(crossHGeo, crossMat);
    cH.position.set(x, 20, z + 21.4);
    this.scene.add(cH);

    // Hospital ER Drive-in Bay Beacon
    this.addInteractiveZone({
      id: 'job_ambulance',
      type: 'job',
      name: 'St. Jude Hospital (Ambulance Job)',
      desc: 'Work as an Emergency Paramedic. Rush injured citizens to the ER!',
      position: new THREE.Vector3(x, 1, z + 26),
      color: 0xff2222,
      action: 'ambulance_job'
    });
  }

  buildPizzeria(x, z) {
    const pGeo = new THREE.BoxGeometry(36, 14, 30);
    const pMat = new THREE.MeshLambertMaterial({ color: 0xcd6155 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(x, 7 + 0.4, z);
    pMesh.castShadow = true;
    this.scene.add(pMesh);
    this.addCollider(x, z, 38, 32);

    // Neon Pizza Sign Roof
    const signGeo = new THREE.ConeGeometry(5, 8, 3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // yellow cheese slice
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.rotation.z = Math.PI / 2;
    sign.position.set(x, 18, z + 12);
    this.scene.add(sign);

    this.addInteractiveZone({
      id: 'job_delivery',
      type: 'job',
      name: "Luigi's Express (Delivery Boy Job)",
      desc: 'Deliver hot pizzas and parcels across the city before time runs out!',
      position: new THREE.Vector3(x, 1, z + 22),
      color: 0xf39c12,
      action: 'delivery_job'
    });
  }

  buildTaxiDepot(x, z) {
    const tGeo = new THREE.BoxGeometry(38, 12, 32);
    const tMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const depot = new THREE.Mesh(tGeo, tMat);
    depot.position.set(x, 6 + 0.4, z);
    depot.castShadow = true;
    this.scene.add(depot);
    this.addCollider(x, z, 40, 34);

    // Yellow Roof Cab Sign
    const signGeo = new THREE.BoxGeometry(14, 3, 2);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, 14, z + 12);
    this.scene.add(sign);

    this.addInteractiveZone({
      id: 'job_taxi',
      type: 'job',
      name: 'Metro Cab Depot (Cab Driver Job)',
      desc: 'Drive a city taxi. Pick up passengers and drop them off for generous fares!',
      position: new THREE.Vector3(x, 1, z + 22),
      color: 0xffcc00,
      action: 'taxi_job'
    });
  }

  buildAssassinGuild(x, z) {
    // Shady industrial warehouse hideout
    const gGeo = new THREE.BoxGeometry(44, 18, 44);
    const gMat = new THREE.MeshLambertMaterial({ color: 0x17202a });
    const hideout = new THREE.Mesh(gGeo, gMat);
    hideout.position.set(x, 9 + 0.4, z);
    hideout.castShadow = true;
    this.scene.add(hideout);
    this.addCollider(x, z, 46, 46);

    // Glowing Crimson Neon Dragon/Lotus Emblem
    const ringGeo = new THREE.TorusGeometry(4.5, 0.4, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, 12, z + 22.3);
    this.scene.add(ring);

    // Dim ominous red light
    const redLight = new THREE.PointLight(0xff0033, 2, 25);
    redLight.position.set(x, 7, z + 24);
    this.scene.add(redLight);

    this.addInteractiveZone({
      id: 'guild_entrance',
      type: 'guild',
      name: "The Black Lotus (Assassin's Guild)",
      desc: 'Underground contract board. Hunt targets, photograph their bodies, collect bounties!',
      position: new THREE.Vector3(x, 1, z + 25),
      color: 0xff0044,
      action: 'open_guild'
    });
  }

  buildCarDealership(x, z) {
    const dGeo = new THREE.BoxGeometry(44, 14, 40);
    const dMat = new THREE.MeshPhongMaterial({
      color: 0x1a252f,
      shininess: 70
    });
    const dealer = new THREE.Mesh(dGeo, dMat);
    dealer.position.set(x, 7 + 0.4, z);
    this.scene.add(dealer);
    this.addCollider(x, z, 46, 42);

    // Big Glass Showroom Windows
    const glassGeo = new THREE.BoxGeometry(40, 8, 0.5);
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.6
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(x, 6, z + 20.3);
    this.scene.add(glass);

    this.addInteractiveZone({
      id: 'shop_cars',
      type: 'shop',
      name: 'Apex Exotic Motors (Car Dealership)',
      desc: 'Purchase supercars, muscle cars, delivery bikes, taxis, and ambulances!',
      position: new THREE.Vector3(x, 1, z + 25),
      color: 0x00f5d4,
      action: 'open_cardealer'
    });
  }

  buildClothesAndArmoryShop(x, z) {
    // Clothes Store
    const cGeo = new THREE.BoxGeometry(22, 14, 34);
    const cMat = new THREE.MeshLambertMaterial({ color: 0x5b2c6f });
    const shop = new THREE.Mesh(cGeo, cMat);
    shop.position.set(x - 12, 7 + 0.4, z);
    this.scene.add(shop);
    this.addCollider(x - 12, z, 24, 36);

    // Armory Store
    const aGeo = new THREE.BoxGeometry(20, 14, 34);
    const aMat = new THREE.MeshLambertMaterial({ color: 0x2e4053 });
    const armory = new THREE.Mesh(aGeo, aMat);
    armory.position.set(x + 12, 7 + 0.4, z);
    this.scene.add(armory);
    this.addCollider(x + 12, z, 22, 36);

    this.addInteractiveZone({
      id: 'shop_clothes',
      type: 'shop',
      name: 'Urban Threads (Clothes Store)',
      desc: 'Customize your style: Assassin Tuxedo, Medic Scrubs, Delivery Vest, Cyber Streetwear!',
      position: new THREE.Vector3(x - 12, 1, z + 22),
      color: 0x9b59b6,
      action: 'open_clothes'
    });

    this.addInteractiveZone({
      id: 'shop_armory',
      type: 'shop',
      name: 'Underground Armory & Optics',
      desc: 'Purchase silenced pistols, sniper rifles, high-res camera lenses, and body armor!',
      position: new THREE.Vector3(x + 12, 1, z + 22),
      color: 0xe67e22,
      action: 'open_armory'
    });
  }

  buildCitadelTower(x, z) {
    // Massive Iconic Central Tower
    const baseGeo = new THREE.BoxGeometry(40, 50, 40);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1a1e24 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 25 + 0.4, z);
    this.scene.add(base);

    const midGeo = new THREE.BoxGeometry(32, 60, 32);
    const midMat = new THREE.MeshLambertMaterial({ color: 0x11161d });
    const mid = new THREE.Mesh(midGeo, midMat);
    mid.position.set(x, 50 + 30 + 0.4, z);
    this.scene.add(mid);

    const topGeo = new THREE.BoxGeometry(24, 45, 24);
    const topMat = new THREE.MeshPhongMaterial({ color: 0x0a0d12, shininess: 80 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x, 110 + 22.5 + 0.4, z);
    this.scene.add(top);

    // Spire
    const spireGeo = new THREE.CylinderGeometry(0.3, 1.5, 30, 8);
    const spireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.set(x, 155 + 15, z);
    this.scene.add(spire);

    this.addCollider(x, z, 42, 42);

    // Citadel Penthouse Property entrance
    this.addInteractiveZone({
      id: 'prop_penthouse',
      type: 'property',
      propertyId: 'penthouse',
      name: 'The Citadel Skyline Penthouse',
      desc: 'Ultimate luxury penthouse atop the city skyline. Panoramic view, massive rent income!',
      price: 150000,
      rentIncome: 7500,
      position: new THREE.Vector3(x, 1, z + 24),
      color: 0x00f0ff,
      action: 'interact_property'
    });
  }

  buildRealEstateProperties(step) {
    const properties = [
      {
        id: 'motel_studio',
        name: 'Sunset Motel Studio #4',
        desc: 'Modest starter pad. Great place to hide out, rest up, and collect steady starter rent.',
        price: 3500,
        rentIncome: 250,
        pos: new THREE.Vector3(-2 * step + 15, 1, 1 * step + 15),
        color: 0x27ae60
      },
      {
        id: 'suburban_villa',
        name: 'Maple Grove Family Bungalow',
        desc: 'Charming 3-bedroom house with driveway and garden. High tenant demand!',
        price: 24000,
        rentIncome: 1200,
        pos: new THREE.Vector3(2 * step + 15, 1, 2 * step + 15),
        color: 0x27ae60
      },
      {
        id: 'downtown_loft',
        name: 'Neo-Tokyo Brick Loft',
        desc: 'Stylish midtown brick loft close to clubs and dining. Great rental yields.',
        price: 55000,
        rentIncome: 2800,
        pos: new THREE.Vector3(-1 * step + 15, 1, -1 * step + 15),
        color: 0x27ae60
      },
      {
        id: 'ocean_mansion',
        name: 'Harbor Crest Seaside Mansion',
        desc: 'Exclusive beachfront residence overlooking the bay with luxury pool and dock.',
        price: 280000,
        rentIncome: 16000,
        pos: new THREE.Vector3(2 * step, 1, -2 * step - 10),
        color: 0x27ae60
      },
      {
        id: 'docks_warehouse',
        name: 'Pier 9 Commercial Logistics Hub',
        desc: 'Sprawling commercial warehouse space leased out to overseas freight operators.',
        price: 90000,
        rentIncome: 5000,
        pos: new THREE.Vector3(-1 * step, 1, -2 * step + 15),
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

  // ------------------------------------------------------------
  // STREET FURNITURE, LIGHTS & TREES
  // ------------------------------------------------------------

  createStreetFurniture() {
    const totalStep = this.blockSize + this.roadWidth;
    const halfSpan = Math.floor(this.gridBlocks / 2) * totalStep;

    const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 8, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const lampHeadGeo = new THREE.BoxGeometry(0.8, 0.3, 1.4);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });

    // Place streetlamps along roads
    for (let x = -halfSpan + 10; x <= halfSpan - 10; x += 40) {
      for (let z = -halfSpan + 10; z <= halfSpan - 10; z += 40) {
        // Skip building interiors
        if (Math.abs(x % totalStep) < this.blockSize / 2 && Math.abs(z % totalStep) < this.blockSize / 2) {
          continue;
        }

        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(x, 4, z);
        this.scene.add(pole);

        const head = new THREE.Mesh(lampHeadGeo, lampHeadMat);
        head.position.set(x, 8, z);
        this.scene.add(head);

        this.streetLights.push(head);
      }
    }
  }

  createVegetation() {
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28 });
    const leavesGeo = new THREE.DodecahedronGeometry(2.8, 1);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f });

    // Add trees along avenues
    const totalStep = this.blockSize + this.roadWidth;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const tx = i * totalStep + (this.blockSize / 2 + 3);
        const tz = j * totalStep + 20;

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(tx, 2.5, tz);
        trunk.castShadow = true;
        this.scene.add(trunk);

        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(tx, 6, tz);
        leaves.castShadow = true;
        this.scene.add(leaves);

        this.addCollider(tx, tz, 1.5, 1.5);
      }
    }
  }

  // ------------------------------------------------------------
  // COLLIDERS & INTERACTIVE BEACONS
  // ------------------------------------------------------------

  addCollider(x, z, width, depth) {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2
    });
  }

  checkCollision(x, z, radius = 1) {
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
    // Out of city boundaries
    const maxBound = this.citySize / 2 - 10;
    if (Math.abs(x) > maxBound || Math.abs(z) > maxBound) {
      return true;
    }
    return false;
  }

  addInteractiveZone(config) {
    // 3D visual beacon: rotating glowing cylinder + marker ring
    const group = new THREE.Group();
    group.position.copy(config.position);

    const cylinderGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 24);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.55
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.y = 0.2;
    group.add(cylinder);

    // Glowing column of light
    const beamGeo = new THREE.CylinderGeometry(0.8, 1.4, 8, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 4.2;
    group.add(beam);

    this.scene.add(group);

    this.interactiveSpots.push({
      ...config,
      meshGroup: group,
      radius: 3.5
    });
  }

  getNearestInteractive(pos, maxDist = 4.0) {
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
    // Animate glowing interactive beacons (gentle hover and pulse)
    const time = performance.now() * 0.003;
    for (let i = 0; i < this.interactiveSpots.length; i++) {
      const spot = this.interactiveSpots[i];
      if (spot.meshGroup) {
        spot.meshGroup.rotation.y += delta * 0.8;
      }
    }
  }
}

window.CityWorld = CityWorld;

