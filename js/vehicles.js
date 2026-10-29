// ============================================================
// CITY VIBES - 3D VEHICLES, MECHANIC TUNING & DRIVING SIMULATION
// ============================================================

class VehicleManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.vehicles = [];
    this.activeVehicle = null;

    // Vehicle specifications
    this.specs = {
      ambulance: {
        name: 'Rescue Ambulance',
        type: 'ambulance',
        maxSpeed: 38,
        accel: 20,
        brake: 32,
        steerSpeed: 2.2,
        color: 0xffffff,
        price: 12000,
        hasSiren: true
      },
      taxi: {
        name: 'Metro City Cab',
        type: 'taxi',
        maxSpeed: 35,
        accel: 21,
        brake: 34,
        steerSpeed: 2.4,
        color: 0xf1c40f,
        price: 8000,
        hasSiren: false
      },
      delivery_bike: {
        name: 'Express Delivery Scooter',
        type: 'scooter',
        maxSpeed: 28,
        accel: 25,
        brake: 36,
        steerSpeed: 3.2,
        color: 0xe74c3c,
        price: 1500,
        hasSiren: false
      },
      sedan: {
        name: 'Urban Commuter Sedan',
        type: 'sedan',
        maxSpeed: 34,
        accel: 18,
        brake: 30,
        steerSpeed: 2.3,
        color: 0x3498db,
        price: 5000,
        hasSiren: false
      },
      muscle: {
        name: 'Viper 69 Muscle Car',
        type: 'muscle',
        maxSpeed: 46,
        accel: 28,
        brake: 35,
        steerSpeed: 2.2,
        color: 0x922b21,
        price: 25000,
        hasSiren: false
      },
      supercar: {
        name: 'Apex GT Hypercar',
        type: 'supercar',
        maxSpeed: 56,
        accel: 38,
        brake: 46,
        steerSpeed: 2.8,
        color: 0x00f0ff,
        price: 95000,
        hasSiren: false
      },
      syndicate: {
        name: 'Lotus Armored Enforcer',
        type: 'syndicate',
        maxSpeed: 40,
        accel: 22,
        brake: 38,
        steerSpeed: 2.0,
        color: 0x111111,
        price: 60000,
        hasSiren: false
      }
    };
  }

  initDefaultVehicles() {
    // 1. Starter Sedan parked right next to player spawn (x=0, z=10)
    this.createVehicle('sedan', new THREE.Vector3(4, 0.4, 10), 0);

    // 2. Ambulance parked in hospital bay (-16, 30)
    this.createVehicle('ambulance', new THREE.Vector3(-16, 0.4, 30), 0);

    // 3. Delivery Scooter outside Luigi's Pizzeria (94, 30)
    this.createVehicle('delivery_bike', new THREE.Vector3(94, 0.4, 30), 0);

    // 4. Taxi parked outside Metro Cab Depot (30, 94)
    this.createVehicle('taxi', new THREE.Vector3(30, 0.4, 94), Math.PI / 2);

    // 5. Muscle car parked outside City Customs Garage (-30, 94)
    this.createVehicle('muscle', new THREE.Vector3(-30, 0.4, 94), 0);

    // 6. Supercar at Apex Motors (94, 110)
    this.createVehicle('supercar', new THREE.Vector3(94, 0.4, 110), -Math.PI / 2);

    // 7. Syndicate Enforcer near Assassin Guild (-94, -110)
    this.createVehicle('syndicate', new THREE.Vector3(-94, 0.4, -110), 0);
  }

  createVehicle(typeKey, position, rotationY = 0) {
    const spec = this.specs[typeKey] || this.specs.sedan;
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotationY;

    let bodyMesh, wheels = [], frontWheels = [], sirenLights = [];

    if (spec.type === 'scooter') {
      const parts = this.buildScooterMesh(spec.color);
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else if (spec.type === 'ambulance') {
      const parts = this.buildAmbulanceMesh();
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
      sirenLights = parts.sirenLights;
    } else if (spec.type === 'taxi') {
      const parts = this.buildTaxiMesh();
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else if (spec.type === 'supercar') {
      const parts = this.buildSupercarMesh(spec.color);
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else {
      const parts = this.buildCarMesh(spec.color, spec.type);
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    }

    // Headlights
    const lightL = new THREE.SpotLight(0xfffaed, 1.8, 40, Math.PI / 6, 0.4);
    lightL.position.set(-0.8, 0.7, 2.2);
    lightL.target.position.set(-0.8, 0.2, 10);
    group.add(lightL);
    group.add(lightL.target);

    const lightR = new THREE.SpotLight(0xfffaed, 1.8, 40, Math.PI / 6, 0.4);
    lightR.position.set(0.8, 0.7, 2.2);
    lightR.target.position.set(0.8, 0.2, 10);
    group.add(lightR);
    group.add(lightR.target);

    // Nitro exhaust flame particle
    const flameGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const nitroFlame = new THREE.Mesh(flameGeo, flameMat);
    nitroFlame.rotation.x = -Math.PI / 2;
    nitroFlame.position.set(0, 0.4, -2.4);
    nitroFlame.visible = false;
    group.add(nitroFlame);

    this.scene.add(group);

    const vehicle = {
      spec: { ...spec },
      typeKey: typeKey,
      group: group,
      bodyMesh: bodyMesh,
      speed: 0,
      steering: 0,
      wheels: wheels,
      frontWheels: frontWheels,
      sirenLights: sirenLights,
      sirenActive: false,
      sirenTimer: 0,
      isPlayerDriving: false,

      // Mechanic Tuning & Condition
      tuningLevel: 0,
      hasNitro: false,
      nitroFuel: 100,
      nitroActive: false,
      nitroFlame: nitroFlame,
      driftSuspension: false,
      condition: 100
    };

    this.vehicles.push(vehicle);
    return vehicle;
  }

  // ------------------------------------------------------------
  // CAR MECHANIC & CUSTOMS WORKSHOP
  // ------------------------------------------------------------

  repairVehicle(vehicle) {
    if (!vehicle) return false;
    vehicle.condition = 100;
    if (vehicle.hasNitro) vehicle.nitroFuel = 100;
    window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification(`🔧 ${vehicle.spec.name} fully repaired & serviced!`, 'success');
    }
    return true;
  }

  tuneEngine(vehicle, level, cost) {
    if (!vehicle) return false;
    vehicle.tuningLevel = level;
    const multipliers = [1.0, 1.15, 1.3, 1.5];
    const mult = multipliers[level] || 1.0;
    vehicle.spec.maxSpeed = this.specs[vehicle.typeKey].maxSpeed * mult;
    vehicle.spec.accel = this.specs[vehicle.typeKey].accel * mult;

    window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification(`🚀 Engine tuned to Stage ${level}! Top Speed: ${Math.floor(vehicle.spec.maxSpeed * 2.3)} MPH`, 'success');
    }
    return true;
  }

  installNitro(vehicle) {
    if (!vehicle) return false;
    vehicle.hasNitro = true;
    vehicle.nitroFuel = 100;
    window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification('🔥 Nitro Boost (NOS) Installed! Hold SHIFT while driving to trigger!', 'success');
    }
    return true;
  }

  repaintVehicle(vehicle, colorHex) {
    if (!vehicle || !vehicle.bodyMesh) return false;
    vehicle.spec.color = colorHex;
    vehicle.bodyMesh.material.color.setHex(colorHex);
    window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification('🎨 Custom paint job applied!', 'success');
    }
    return true;
  }

  installDriftSuspension(vehicle) {
    if (!vehicle) return false;
    vehicle.driftSuspension = true;
    vehicle.spec.steerSpeed *= 1.3;
    window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification('🏎️ Sport Drift Suspension Installed!', 'success');
    }
    return true;
  }

  // ------------------------------------------------------------
  // 3D VEHICLE MESH BUILDERS
  // ------------------------------------------------------------

  createWheel(x, y, z) {
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1c1c1c });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;

    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.37, 8);
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xbdc3c7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheel.add(rim);

    return wheel;
  }

  buildCarMesh(colorHex, type = 'sedan') {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const isMuscle = type === 'muscle';
    const isSyndicate = type === 'syndicate';

    const bodyMat = new THREE.MeshPhongMaterial({
      color: colorHex,
      shininess: isMuscle ? 85 : 55
    });
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.75, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    root.add(chassis);

    const cabinMat = new THREE.MeshPhongMaterial({
      color: isSyndicate ? 0x050505 : 0x1a252f,
      shininess: 90
    });
    const cabinH = isMuscle ? 0.65 : 0.75;
    const cabinGeo = new THREE.BoxGeometry(1.7, cabinH, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    const glassMat = new THREE.MeshBasicMaterial({
      color: isSyndicate ? 0x111111 : 0x4aa3df,
      transparent: true,
      opacity: 0.6
    });
    const windshieldGeo = new THREE.BoxGeometry(1.68, 0.6, 0.1);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.25, 0.96);
    windshield.rotation.x = -0.3;
    root.add(windshield);

    const wx = 1.05;
    const wzF = 1.35;
    const wzR = -1.35;
    const wy = 0.42;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: chassis, wheels, frontWheels };
  }

  buildAmbulanceMesh() {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];
    const sirenLights = [];

    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 50 });
    const boxGeo = new THREE.BoxGeometry(2.3, 1.9, 5.0);
    const box = new THREE.Mesh(boxGeo, bodyMat);
    box.position.y = 1.35;
    box.castShadow = true;
    root.add(box);

    const crossMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
    const crossV = new THREE.BoxGeometry(0.3, 0.9, 0.05);
    const crossH = new THREE.BoxGeometry(0.9, 0.3, 0.05);

    [-1.16, 1.16].forEach(xSide => {
      const v = new THREE.Mesh(crossV, crossMat);
      v.position.set(xSide, 1.5, 0);
      root.add(v);

      const h = new THREE.Mesh(crossH, crossMat);
      h.position.set(xSide, 1.5, 0);
      root.add(h);
    });

    const barGeo = new THREE.BoxGeometry(1.4, 0.22, 0.3);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 2.4, 0.8);
    root.add(bar);

    const redLightGeo = new THREE.BoxGeometry(0.4, 0.25, 0.35);
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const redLight = new THREE.Mesh(redLightGeo, redLightMat);
    redLight.position.set(-0.45, 2.4, 0.8);
    root.add(redLight);

    const blueLightGeo = new THREE.BoxGeometry(0.4, 0.25, 0.35);
    const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const blueLight = new THREE.Mesh(blueLightGeo, blueLightMat);
    blueLight.position.set(0.45, 2.4, 0.8);
    root.add(blueLight);

    sirenLights.push(redLight, blueLight);

    const wx = 1.18;
    const wy = 0.45;
    const wzF = 1.6;
    const wzR = -1.5;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: box, wheels, frontWheels, sirenLights };
  }

  buildTaxiMesh() {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const yellowMat = new THREE.MeshPhongMaterial({ color: 0xf1c40f, shininess: 70 });
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.75, 4.4);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.position.y = 0.65;
    body.castShadow = true;
    root.add(body);

    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const stripeGeo = new THREE.BoxGeometry(2.02, 0.12, 4.0);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.7;
    root.add(stripe);

    const cabinGeo = new THREE.BoxGeometry(1.65, 0.75, 2.3);
    const cabinMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    const signGeo = new THREE.BoxGeometry(0.8, 0.25, 0.3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.75, -0.2);
    root.add(sign);

    const wx = 1.05;
    const wy = 0.42;
    const wzF = 1.35;
    const wzR = -1.35;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: body, wheels, frontWheels };
  }

  buildScooterMesh(colorHex) {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex });
    const deckGeo = new THREE.BoxGeometry(0.7, 0.35, 1.8);
    const deck = new THREE.Mesh(deckGeo, bodyMat);
    deck.position.y = 0.5;
    deck.castShadow = true;
    root.add(deck);

    const seatMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const seatGeo = new THREE.BoxGeometry(0.5, 0.2, 0.7);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.75, -0.2);
    root.add(seat);

    const boxMat = new THREE.MeshLambertMaterial({ color: 0xe67e22 });
    const boxGeo = new THREE.BoxGeometry(0.7, 0.65, 0.65);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.95, -0.7);
    box.castShadow = true;
    root.add(box);

    const barGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
    const barMat = new THREE.MeshLambertMaterial({ color: 0xbdc3c7 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.x = -0.2;
    bar.position.set(0, 0.9, 0.65);
    root.add(bar);

    const handleGeo = new THREE.BoxGeometry(0.8, 0.08, 0.08);
    const handle = new THREE.Mesh(handleGeo, barMat);
    handle.position.set(0, 1.35, 0.55);
    root.add(handle);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    const wF = new THREE.Mesh(wheelGeo, wheelMat);
    wF.rotation.z = Math.PI / 2;
    wF.position.set(0, 0.32, 0.85);
    root.add(wF);

    const wR = new THREE.Mesh(wheelGeo, wheelMat);
    wR.rotation.z = Math.PI / 2;
    wR.position.set(0, 0.32, -0.75);
    root.add(wR);

    wheels.push(wF, wR);
    frontWheels.push(wF);

    return { mesh: root, bodyMesh: deck, wheels, frontWheels };
  }

  buildSupercarMesh(colorHex) {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const bodyMat = new THREE.MeshPhongMaterial({
      color: colorHex,
      shininess: 100,
      specular: 0xffffff
    });

    const bodyGeo = new THREE.BoxGeometry(2.1, 0.55, 4.6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.45;
    body.castShadow = true;
    root.add(body);

    const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x050505, shininess: 95 });
    const cockpitGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.85, -0.3);
    cockpit.castShadow = true;
    root.add(cockpit);

    const wingMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wingGeo = new THREE.BoxGeometry(2.0, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.95, -2.1);
    root.add(wing);

    const wx = 1.1;
    const wy = 0.38;
    const wzF = 1.45;
    const wzR = -1.45;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: body, wheels, frontWheels };
  }

  // ------------------------------------------------------------
  // VEHICLE INTERACTION & SIMULATION LOOP
  // ------------------------------------------------------------

  getNearestVehicle(pos, maxDist = 4.2) {
    let nearest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (v === this.activeVehicle) continue;
      const d = pos.distanceTo(v.group.position);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }
    return nearest;
  }

  enterVehicle(vehicle, player) {
    this.activeVehicle = vehicle;
    vehicle.isPlayerDriving = true;
    vehicle.speed = 0;
    vehicle.steering = 0;
    window.soundManager.startEngine();

    if (window.gameUI) {
      window.gameUI.showNotification(`Entered ${vehicle.spec.name}`, 'vehicle');
      window.gameUI.updateVehicleHUD(vehicle);
    }
  }

  exitVehicle(player) {
    if (!this.activeVehicle) return;
    const v = this.activeVehicle;
    v.isPlayerDriving = false;
    v.speed = 0;
    if (v.nitroFlame) v.nitroFlame.visible = false;
    if (v.sirenActive) {
      v.sirenActive = false;
      window.soundManager.toggleSiren(false);
    }
    window.soundManager.stopEngine();

    // Place player beside vehicle cleanly
    const exitPos = v.group.position.clone();
    exitPos.x += Math.cos(v.group.rotation.y) * 2.2;
    exitPos.z += -Math.sin(v.group.rotation.y) * 2.2;
    exitPos.y = 1.0;
    player.setPosition(exitPos);

    this.activeVehicle = null;
    if (window.gameUI) {
      window.gameUI.hideVehicleHUD();
    }
  }

  toggleActiveSiren() {
    if (!this.activeVehicle || !this.activeVehicle.spec.hasSiren) return false;
    const v = this.activeVehicle;
    v.sirenActive = !v.sirenActive;
    window.soundManager.toggleSiren(v.sirenActive);
    if (window.gameUI) {
      window.gameUI.showNotification(
        v.sirenActive ? '🚨 SIREN ACTIVATED' : 'Siren Deactivated',
        v.sirenActive ? 'siren_on' : 'siren_off'
      );
    }
    return v.sirenActive;
  }

  update(delta, input) {
    if (!this.activeVehicle) return;
    const v = this.activeVehicle;
    const spec = v.spec;

    // Nitro Boost Trigger (Shift while driving)
    const wantsNitro = input.sprint && v.hasNitro && v.nitroFuel > 0;
    if (wantsNitro) {
      v.nitroActive = true;
      v.nitroFuel = Math.max(0, v.nitroFuel - delta * 25);
      if (v.nitroFlame) v.nitroFlame.visible = true;
    } else {
      v.nitroActive = false;
      if (v.nitroFlame) v.nitroFlame.visible = false;
      // Passive nitro refill
      if (v.hasNitro && v.nitroFuel < 100) {
        v.nitroFuel = Math.min(100, v.nitroFuel + delta * 5);
      }
    }

    const nitroMultiplier = v.nitroActive ? 1.6 : 1.0;
    const maxSpeed = spec.maxSpeed * nitroMultiplier;
    const accelRate = spec.accel * nitroMultiplier;

    // Acceleration & Braking
    const isAccelerating = input.forward || input.backward;
    if (input.forward) {
      v.speed += accelRate * delta;
      if (v.speed > maxSpeed) v.speed = maxSpeed;
    } else if (input.backward) {
      v.speed -= spec.brake * 0.75 * delta;
      if (v.speed < -maxSpeed * 0.4) v.speed = -maxSpeed * 0.4;
    } else {
      v.speed *= Math.pow(0.88, delta * 10);
      if (Math.abs(v.speed) < 0.1) v.speed = 0;
    }

    // Handbrake / Drift
    if (input.handbrake) {
      v.speed *= Math.pow(0.55, delta * 12);
    }

    // Steering
    const steerTarget = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    const steerSpeed = spec.steerSpeed * (v.driftSuspension ? 1.4 : 1.0);
    v.steering += (steerTarget - v.steering) * steerSpeed * delta * 5;

    // Apply vehicle turning
    if (Math.abs(v.speed) > 0.05) {
      const reverseMult = v.speed < 0 ? -1 : 1;
      const turnAmount = v.steering * (Math.abs(v.speed) / spec.maxSpeed) * 2.4 * delta * reverseMult;
      v.group.rotation.y += turnAmount;
    }

    // Forward step
    const forwardVec = new THREE.Vector3(
      Math.sin(v.group.rotation.y),
      0,
      Math.cos(v.group.rotation.y)
    );

    const moveStep = forwardVec.multiplyScalar(v.speed * delta);
    const targetX = v.group.position.x + moveStep.x;
    const targetZ = v.group.position.z + moveStep.z;
    const carRadius = 1.3;

    // Sliding collision check for vehicle
    if (!this.world.checkCollision(targetX, targetZ, carRadius)) {
      v.group.position.x = targetX;
      v.group.position.z = targetZ;
    } else {
      if (!this.world.checkCollision(targetX, v.group.position.z, carRadius)) {
        v.group.position.x = targetX;
        v.speed *= 0.85;
      } else if (!this.world.checkCollision(v.group.position.x, targetZ, carRadius)) {
        v.group.position.z = targetZ;
        v.speed *= 0.85;
      } else {
        // Direct crash
        v.speed = -v.speed * 0.25;
        window.soundManager.playGunshot(true);
      }
    }

    // Wheel rotation
    const wheelRotDelta = (v.speed * delta) / 0.42;
    v.wheels.forEach(w => {
      w.rotation.x += wheelRotDelta;
    });

    // Front wheels turning
    v.frontWheels.forEach(w => {
      w.rotation.y = v.steering * 0.45;
    });

    // Engine Audio Pitch
    const speedRatio = Math.abs(v.speed) / spec.maxSpeed;
    window.soundManager.updateEngine(speedRatio, isAccelerating || v.nitroActive);

    // Siren Lights
    if (v.sirenActive && v.sirenLights.length >= 2) {
      v.sirenTimer += delta * 14;
      const flash = Math.sin(v.sirenTimer) > 0;
      v.sirenLights[0].material.color.setHex(flash ? 0xff0022 : 0x220000);
      v.sirenLights[1].material.color.setHex(!flash ? 0x0066ff : 0x000033);
    }
  }
}

window.VehicleManager = VehicleManager;
