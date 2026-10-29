// ============================================================
// CITY VIBES - VEHICLE MANAGER & DRIVING SIMULATION
// ============================================================

class VehicleManager {
  constructor(scene, world, game = null) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.vehicles = [];
    this.activeVehicle = null;

    // Load specs from database
    this.specs = window.VehicleSpecs || {};
  }

  initDefaultVehicles() {
    // 1. Starter Sedan parked right next to player spawn (x=4, z=10)
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
    const mb = window.VehicleModelBuilder;

    if (spec.type === 'scooter') {
      const parts = mb.buildScooterMesh(spec.color);
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else if (spec.type === 'ambulance') {
      const parts = mb.buildAmbulanceMesh();
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
      sirenLights = parts.sirenLights;
    } else if (spec.type === 'taxi') {
      const parts = mb.buildTaxiMesh();
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else if (spec.type === 'supercar') {
      const parts = mb.buildSupercarMesh(spec.color);
      group.add(parts.mesh);
      bodyMesh = parts.bodyMesh;
      wheels = parts.wheels;
      frontWheels = parts.frontWheels;
    } else {
      const parts = mb.buildCarMesh(spec.color, spec.type);
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
  // VEHICLE INTERACTION & SIMULATION LOOP
  // ------------------------------------------------------------

  getNearestVehicle(pos, maxDist = 4.5) {
    let nearest = null;
    let minDist = maxDist;

    // 1. Check all standard spawned / owned vehicles
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (v === this.activeVehicle) continue;
      const d = pos.distanceTo(v.group.position);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }

    // 2. Also check all ambient traffic cars on roads!
    const game = this.game || window.game;
    if (game && game.pedestrianManager && game.pedestrianManager.trafficCars) {
      const traffic = game.pedestrianManager.trafficCars;
      for (let i = 0; i < traffic.length; i++) {
        const tc = traffic[i];
        if (tc.isHijacked) continue;
        const d = pos.distanceTo(tc.group.position);
        if (d < minDist) {
          minDist = d;
          nearest = {
            isTrafficCar: true,
            trafficCarRef: tc,
            group: tc.group,
            spec: {
              id: 'traffic_sedan',
              name: tc.name || 'City Traffic Car',
              type: 'sedan',
              maxSpeed: 44,
              accel: 24,
              brake: 36,
              steerSpeed: 2.4,
              color: 0x34495e,
              hasSiren: false
            }
          };
        }
      }
    }

    return nearest;
  }

  enterVehicle(vehicle, player) {
    // Check if commandeering an ambient traffic car
    if (vehicle.isTrafficCar) {
      const tc = vehicle.trafficCarRef;
      const game = this.game || window.game;
      if (game && game.pedestrianManager) {
        const idx = game.pedestrianManager.trafficCars.indexOf(tc);
        if (idx !== -1) game.pedestrianManager.trafficCars.splice(idx, 1);
      }

      const newVeh = {
        spec: vehicle.spec,
        group: vehicle.group,
        isPlayerDriving: true,
        speed: 0,
        steering: 0,
        condition: 100,
        hasNitro: true,
        nitroFuel: 100,
        nitroActive: false,
        nitroFlame: null,
        tuningStage: 0,
        sirenActive: false
      };

      // Nitro exhaust flame
      const flameGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.x = Math.PI / 2;
      flame.position.set(0, 0.4, -2.4);
      flame.visible = false;
      newVeh.group.add(flame);
      newVeh.nitroFlame = flame;

      this.vehicles.push(newVeh);
      this.activeVehicle = newVeh;

      // Driver drops wallet & police alerted!
      if (game && game.economy) {
        const dropPos = vehicle.group.position.clone().add(new THREE.Vector3(2, 0.5, 0));
        game.economy.spawnCashPickup(dropPos, 180 + Math.floor(Math.random() * 240));
      }
      if (player && player.addPoliceHeat) {
        player.addPoliceHeat(1);
      }

      window.soundManager.playHorn();
      window.soundManager.startEngine();

      if (window.gameUI) {
        window.gameUI.showNotification(`🚗 Commandeered ${vehicle.spec.name}! (Driver dropped cash)`, 'warning', 5000);
        window.gameUI.updateVehicleHUD(newVeh);
      }
      return;
    }

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

    // Sliding collision check for vehicle with world buildings
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
        v.speed = -v.speed * 0.3;
        window.soundManager.playGunshot(true);
      }
    }

    // ------------------------------------------------------------
    // PHYSICAL VEHICLE COLLISIONS (TRAFFIC & PEDESTRIANS)
    // ------------------------------------------------------------
    if (window.game && window.game.pedestrianManager) {
      const pm = window.game.pedestrianManager;

      // 1. Collide with Traffic Cars: Crash, shove, stop & steal!
      for (let i = 0; i < pm.trafficCars.length; i++) {
        const traffic = pm.trafficCars[i];
        const dist = v.group.position.distanceTo(traffic.group.position);

        if (dist < 3.2) {
          // Dynamic vehicle-to-vehicle collision
          const pushDir = traffic.group.position.clone().sub(v.group.position);
          pushDir.y = 0;
          pushDir.normalize();

          traffic.group.position.addScaledVector(pushDir, 1.8);
          traffic.speed = 0; // stop their car!
          v.speed = -v.speed * 0.4; // rebound player car

          window.soundManager.playHorn();
          window.soundManager.playGunshot(true);

          if (window.gameUI) {
            window.gameUI.showNotification('💥 CAR CRASH! Traffic stopped. You can hijack their vehicle with [E]!', 'warning', 3500);
          }
        }
      }

      // 2. Vehicular Impact with Pedestrians (Run over & drop money!)
      if (Math.abs(v.speed) > 4.5) {
        // Check ambient pedestrians
        for (let i = 0; i < pm.pedestrians.length; i++) {
          const ped = pm.pedestrians[i];
          if (ped.isDead) continue;

          const pDist = v.group.position.distanceTo(ped.mesh.position);

          // Near miss: scare and dodge!
          if (pDist < 10.0 && pDist > 2.2) {
            ped.isPanicked = true;
            ped.panicTimer = 4.0;
            ped.speed = 9.0;
          }

          // Direct Hit / Run Over!
          if (pDist <= 2.2) {
            ped.isDead = true;
            ped.mesh.rotation.x = Math.PI / 2;
            ped.mesh.position.y = 0.25;

            window.soundManager.playGunshot(true);

            // Drop cash on the street!
            const droppedCash = Math.floor(80 + Math.random() * 220);
            if (window.game.economy) {
              window.game.economy.spawnCashPickup(ped.mesh.position, droppedCash);
            }

            // Alert police
            if (window.game.player) {
              window.game.player.addPoliceHeat(1);
            }

            if (window.gameUI) {
              window.gameUI.showNotification(`💥 VEHICULAR HIT! Pedestrian down! Dropped +$${droppedCash} cash. Police alerted!`, 'error', 4500);
            }
          }
        }

        // Check guild targets
        for (let i = 0; i < pm.targets.length; i++) {
          const target = pm.targets[i];
          if (target.isDead) continue;

          const tDist = v.group.position.distanceTo(target.mesh.position);
          if (tDist <= 2.4) {
            pm.killTarget(target);
            if (window.game.economy) {
              window.game.economy.spawnCashPickup(target.mesh.position, 1000);
            }
          }
        }
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
