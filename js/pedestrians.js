// ============================================================
// CITY VIBES - PEDESTRIANS, TRAFFIC, GUILD TARGETS & POLICE AI
// ============================================================

class PedestrianManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.pedestrians = [];
    this.trafficCars = [];
    this.targets = [];
    this.policeCruiser = null;
    this.policeOfficer = null;
    this.policeSirenTimer = 0;
    this.brandishAlertTimer = 0;
    this.copAttackTimer = 0;
  }

  init() {
    this.spawnAmbientPedestrians(26);
    this.spawnAmbientTraffic(10);
  }

  // ------------------------------------------------------------
  // AMBIENT PEDESTRIANS & PANIC REACTION
  // ------------------------------------------------------------

  spawnAmbientPedestrians(count = 26) {
    const totalStep = this.world.blockSize + this.world.roadWidth;
    const colors = [0x34495e, 0x16a085, 0x8e44ad, 0xd35400, 0x2c3e50, 0x7f8c8d];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 440;
      const rz = (Math.random() - 0.5) * 440;
      const col = colors[Math.floor(Math.random() * colors.length)];

      const pedMesh = this.createHumanoidMesh(col, false);
      pedMesh.position.set(rx, 0, rz);
      this.scene.add(pedMesh);

      const angle = Math.random() * Math.PI * 2;
      this.pedestrians.push({
        mesh: pedMesh,
        speed: 1.8 + Math.random() * 1.2,
        direction: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
        changeTimer: 3 + Math.random() * 5,
        isPanicked: false,
        panicTimer: 0,
        isDead: false,
        isTarget: false
      });
    }
  }

  triggerPublicBrandishPanic(playerPos) {
    let witnessCount = 0;

    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.isDead) continue;

      const dist = p.mesh.position.distanceTo(playerPos);
      if (dist < 22) {
        witnessCount++;
        p.isPanicked = true;
        p.panicTimer = 6.0;
        p.speed = 8.5; // sprint in terror!

        // Run directly away from player
        const awayDir = p.mesh.position.clone().sub(playerPos);
        awayDir.y = 0;
        awayDir.normalize();
        p.direction.copy(awayDir);

        // Raise arms in surrender / panic
        const u = p.mesh.userData;
        u.armL.rotation.z = 2.4;
        u.armR.rotation.z = -2.4;
      }
    }

    // If citizens witness weapon in public -> dispatch police!
    if (witnessCount > 0) {
      this.brandishAlertTimer += 0.016;
      if (this.brandishAlertTimer > 2.5) {
        this.brandishAlertTimer = 0;
        if (window.game && window.game.player.wantedStars < 2) {
          window.game.player.addPoliceHeat(1);
          if (window.gameUI) {
            window.gameUI.showNotification('🚨 911 CALL: "Citizen reported a gunman on the street!" Police dispatched!', 'error', 5000);
          }
        }
      }
    } else {
      this.brandishAlertTimer = Math.max(0, this.brandishAlertTimer - 0.01);
    }
  }

  createHumanoidMesh(shirtColor, isTarget = false, targetDetails = null) {
    const root = new THREE.Group();

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.85, 0.35);
    const torsoMat = new THREE.MeshLambertMaterial({
      color: isTarget ? 0x111111 : shirtColor
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    root.add(torso);

    if (isTarget) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.19);
      root.add(tie);

      const caseGeo = new THREE.BoxGeometry(0.5, 0.35, 0.12);
      const caseMat = new THREE.MeshLambertMaterial({ color: 0x4a2311 });
      const briefcase = new THREE.Mesh(caseGeo, caseMat);
      briefcase.position.set(0.48, 0.75, 0);
      root.add(briefcase);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf5cba7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    root.add(head);

    const hairGeo = new THREE.BoxGeometry(0.42, 0.16, 0.42);
    const hairMat = new THREE.MeshLambertMaterial({ color: isTarget ? 0x222222 : 0x4a2e1b });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.05;
    root.add(hair);

    if (isTarget) {
      const glassesGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const glasses = new THREE.Mesh(glassesGeo, glassesMat);
      glasses.position.set(0, 1.9, 0.21);
      root.add(glasses);

      const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const reticle = new THREE.Mesh(ringGeo, ringMat);
      reticle.rotation.x = Math.PI / 2;
      reticle.position.y = 2.45;
      root.add(reticle);
      root.reticle = reticle;
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.28);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.18, 0.4, 0);
    legL.castShadow = true;
    root.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.18, 0.4, 0);
    legR.castShadow = true;
    root.add(legR);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.22);
    const armMat = torsoMat;

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-0.45, 1.25, 0);
    armL.castShadow = true;
    root.add(armL);

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(0.45, 1.25, 0);
    armR.castShadow = true;
    root.add(armR);

    root.userData = {
      legL: legL,
      legR: legR,
      armL: armL,
      armR: armR,
      animTime: Math.random() * 10
    };

    return root;
  }

  // ------------------------------------------------------------
  // ASSASSIN GUILD TARGETS
  // ------------------------------------------------------------

  spawnContractTarget(contract) {
    this.removeTarget(contract.id);

    const mesh = this.createHumanoidMesh(0x111111, true, contract);
    mesh.position.copy(contract.spawnLocation);
    this.scene.add(mesh);

    const target = {
      id: contract.id,
      name: contract.targetName,
      bounty: contract.bounty,
      mesh: mesh,
      health: 100,
      isDead: false,
      photoTaken: false,
      speed: 2.2,
      direction: new THREE.Vector3(1, 0, 0),
      patrolPoints: contract.patrolPoints || [
        contract.spawnLocation.clone(),
        contract.spawnLocation.clone().add(new THREE.Vector3(25, 0, 0)),
        contract.spawnLocation.clone().add(new THREE.Vector3(25, 0, 25)),
        contract.spawnLocation.clone().add(new THREE.Vector3(0, 0, 25))
      ],
      currentPatrolIdx: 0
    };

    this.targets.push(target);
    return target;
  }

  removeTarget(contractId) {
    const idx = this.targets.findIndex(t => t.id === contractId);
    if (idx !== -1) {
      this.scene.remove(this.targets[idx].mesh);
      this.targets.splice(idx, 1);
    }
  }

  damageTarget(target, damage) {
    if (target.isDead) return;
    target.health -= damage;

    if (target.health <= 0) {
      this.killTarget(target);
    }
  }

  killTarget(target) {
    target.isDead = true;
    target.health = 0;

    target.mesh.rotation.x = Math.PI / 2;
    target.mesh.position.y = 0.25;

    if (target.mesh.reticle) {
      target.mesh.reticle.visible = false;
    }

    // Drop fat cash bundle from target!
    if (window.game && window.game.economy) {
      window.game.economy.spawnCashPickup(target.mesh.position, 800);
    }

    if (window.gameUI) {
      window.gameUI.showNotification(
        `🎯 TARGET DOWN: ${target.name}! Dropped $800 cash. Open Camera (C) and snap photo of the body to claim $${target.bounty.toLocaleString()} bounty!`,
        'target_kill',
        7000
      );
    }
  }

  // ------------------------------------------------------------
  // POLICE PATROL & PURSUIT CRUISER
  // ------------------------------------------------------------

  spawnPoliceCruiser(nearPos) {
    if (this.policeCruiser) return;

    const group = new THREE.Group();
    group.position.copy(nearPos).add(new THREE.Vector3(30, 0.4, 30));

    // Black & white police interceptor
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.4);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 70 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    group.add(body);

    // White door panels
    const doorGeo = new THREE.BoxGeometry(2.14, 0.5, 1.8);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const doors = new THREE.Mesh(doorGeo, doorMat);
    doors.position.set(0, 0.7, -0.1);
    group.add(doors);

    // Flashing Strobe Lightbar on roof
    const barGeo = new THREE.BoxGeometry(1.4, 0.2, 0.3);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.7, -0.2);
    group.add(bar);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    redLight.position.set(-0.45, 1.7, -0.2);
    group.add(redLight);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    blueLight.position.set(0.45, 1.7, -0.2);
    group.add(blueLight);

    this.scene.add(group);

    this.policeCruiser = {
      group: group,
      speed: 28,
      redLight: redLight,
      blueLight: blueLight
    };
  }

  removePoliceCruiser() {
    if (!this.policeCruiser) return;
    this.scene.remove(this.policeCruiser.group);
    this.policeCruiser = null;
  }

  // ------------------------------------------------------------
  // ARMED POLICE OFFICER (ON FOOT PURSUIT & SHOOTING)
  // ------------------------------------------------------------

  spawnPoliceOfficer(nearPos) {
    if (this.policeOfficer) return;

    const group = new THREE.Group();
    group.position.copy(nearPos).add(new THREE.Vector3(2.5, 0, 2.5));

    // Police officer in dark blue uniform
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x1b263b })
    );
    torso.position.y = 1.25;
    group.add(torso);

    // Police gold badge
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.15, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xf1c40f })
    );
    badge.position.set(0.18, 1.45, 0.22);
    group.add(badge);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0xf5d0b5 })
    );
    head.position.y = 1.95;
    group.add(head);

    // Police peaked cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.16, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x0d1b2a })
    );
    cap.position.set(0, 2.18, 0.03);
    group.add(cap);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.8, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x111625 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.18, 0.4, 0);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.18, 0.4, 0);
    group.add(legR);

    // Arms & Drawn Service Weapon
    const armGeo = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const armL = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x1b263b }));
    armL.position.set(-0.46, 1.2, 0);
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x1b263b }));
    armR.position.set(0.46, 1.2, 0.2);
    armR.rotation.x = -Math.PI / 2.5;
    group.add(armR);

    const gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.14, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    gun.position.set(0.46, 1.35, 0.55);
    group.add(gun);

    this.scene.add(group);

    this.policeOfficer = {
      group: group,
      speed: 8.5,
      legL: legL,
      legR: legR,
      armL: armL,
      armR: armR,
      gun: gun,
      animTime: 0,
      shootTimer: 0,
      pinTimer: 0
    };
  }

  removePoliceOfficer() {
    if (!this.policeOfficer) return;
    this.scene.remove(this.policeOfficer.group);
    this.policeOfficer = null;
  }

  spawnBulletTracer(from, to, didHit) {
    const dist = from.distanceTo(to);
    const geo = new THREE.CylinderGeometry(0.04, 0.04, Math.max(1, dist), 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.85 });
    const tracer = new THREE.Mesh(geo, mat);

    const mid = from.clone().add(to).multiplyScalar(0.5);
    tracer.position.copy(mid);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    this.scene.add(tracer);

    setTimeout(() => {
      this.scene.remove(tracer);
    }, 120);
  }

  // ------------------------------------------------------------
  // AMBIENT TRAFFIC
  // ------------------------------------------------------------

  spawnAmbientTraffic(count = 10) {
    const totalStep = this.world.blockSize + this.world.roadWidth;
    const colors = [0x95a5a6, 0x34495e, 0x27ae60, 0x2980b9, 0xc0392b, 0xd35400];

    for (let i = 0; i < count; i++) {
      const isVertical = Math.random() > 0.5;
      const roadCoord = (Math.floor(Math.random() * 5) - 2) * totalStep;
      const laneOffset = (Math.random() > 0.5 ? 1 : -1) * 4.5;

      const group = new THREE.Group();
      const col = colors[Math.floor(Math.random() * colors.length)];

      const bodyGeo = new THREE.BoxGeometry(2.0, 0.75, 4.2);
      const bodyMat = new THREE.MeshLambertMaterial({ color: col });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.65;
      group.add(body);

      const cabinGeo = new THREE.BoxGeometry(1.65, 0.75, 2.2);
      const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 1.25, -0.2);
      group.add(cabin);

      let px, pz, rotY, dir;
      if (isVertical) {
        px = roadCoord + laneOffset;
        pz = (Math.random() - 0.5) * 400;
        rotY = laneOffset > 0 ? 0 : Math.PI;
        dir = new THREE.Vector3(0, 0, laneOffset > 0 ? 1 : -1);
      } else {
        px = (Math.random() - 0.5) * 400;
        pz = roadCoord + laneOffset;
        rotY = laneOffset > 0 ? -Math.PI / 2 : Math.PI / 2;
        dir = new THREE.Vector3(laneOffset > 0 ? -1 : 1, 0, 0);
      }

      group.position.set(px, 0, pz);
      group.rotation.y = rotY;
      this.scene.add(group);

      this.trafficCars.push({
        group: group,
        speed: 12 + Math.random() * 8,
        dir: dir,
        isVertical: isVertical
      });
    }
  }

  // ------------------------------------------------------------
  // UPDATE LOOP
  // ------------------------------------------------------------

  update(delta) {
    // 1. Pedestrians
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.isDead) continue;

      if (p.isPanicked) {
        p.panicTimer -= delta;
        if (p.panicTimer <= 0) {
          p.isPanicked = false;
          p.speed = 1.8 + Math.random() * 1.2;
          const u = p.mesh.userData;
          u.armL.rotation.z = 0;
          u.armR.rotation.z = 0;
        }
      } else {
        p.changeTimer -= delta;
        if (p.changeTimer <= 0) {
          p.changeTimer = 4 + Math.random() * 6;
          const angle = Math.random() * Math.PI * 2;
          p.direction.set(Math.cos(angle), 0, Math.sin(angle));
        }
      }

      const move = p.direction.clone().multiplyScalar(p.speed * delta);
      const nextPos = p.mesh.position.clone().add(move);

      if (Math.abs(nextPos.x) > 280 || Math.abs(nextPos.z) > 280) {
        p.direction.negate();
      } else {
        p.mesh.position.copy(nextPos);
      }

      p.mesh.rotation.y = Math.atan2(p.direction.x, p.direction.z);

      const u = p.mesh.userData;
      u.animTime += delta * p.speed * 4;
      const legAngle = Math.sin(u.animTime) * 0.45;
      u.legL.rotation.x = legAngle;
      u.legR.rotation.x = -legAngle;
      if (!p.isPanicked) {
        u.armL.rotation.x = -legAngle;
        u.armR.rotation.x = legAngle;
      }
    }

    // 2. Guild Targets
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (t.isDead) continue;

      const dest = t.patrolPoints[t.currentPatrolIdx];
      const diff = dest.clone().sub(t.mesh.position);
      diff.y = 0;
      const dist = diff.length();

      if (dist < 1.5) {
        t.currentPatrolIdx = (t.currentPatrolIdx + 1) % t.patrolPoints.length;
      } else {
        diff.normalize();
        t.mesh.position.addScaledVector(diff, t.speed * delta);
        t.mesh.rotation.y = Math.atan2(diff.x, diff.z);

        const u = t.mesh.userData;
        u.animTime += delta * t.speed * 4;
        const legAngle = Math.sin(u.animTime) * 0.45;
        u.legL.rotation.x = legAngle;
        u.legR.rotation.x = -legAngle;
        u.armL.rotation.x = -legAngle;
        u.armR.rotation.x = legAngle;
      }

      if (t.mesh.reticle) {
        t.mesh.reticle.rotation.z += delta * 2;
      }
    }

    // 3. Police Pursuit AI (Realistic Chase & Armed Officers On Foot)
    if (window.game && window.game.player.wantedStars >= 1) {
      const player = window.game.player;
      const isDriving = !!(window.game.vehicleManager && window.game.vehicleManager.activeVehicle);
      const playerPos = player.position;

      // Spawn police cruiser if not present
      if (!this.policeCruiser) {
        this.spawnPoliceCruiser(playerPos);
      }

      // Vehicular Chase Behavior
      if (this.policeCruiser) {
        const diff = playerPos.clone().sub(this.policeCruiser.group.position);
        diff.y = 0;
        const dist = diff.length();

        if (isDriving) {
          // Player is driving -> Cruiser pursues vehicle
          if (dist > 5.0) {
            diff.normalize();
            this.policeCruiser.group.position.addScaledVector(diff, this.policeCruiser.speed * delta);
            this.policeCruiser.group.rotation.y = Math.atan2(diff.x, diff.z);
          } else {
            // Ram player car!
            const v = window.game.vehicleManager.activeVehicle;
            v.speed *= 0.88;
            v.condition = Math.max(10, (v.condition || 100) - 5 * delta);
          }

          // If cop on foot was out, put him away while driving
          if (this.policeOfficer) {
            this.removePoliceOfficer();
          }
        } else {
          // Player is on foot!
          // Cruiser stops nearby
          if (dist > 18.0) {
            diff.normalize();
            this.policeCruiser.group.position.addScaledVector(diff, this.policeCruiser.speed * delta);
            this.policeCruiser.group.rotation.y = Math.atan2(diff.x, diff.z);
          }

          // Armed Police Officer exits cruiser and pursues on foot!
          if (!this.policeOfficer) {
            this.spawnPoliceOfficer(this.policeCruiser.group.position);
          }
        }

        // Flashing police strobe
        this.policeSirenTimer += delta * 15;
        const flash = Math.sin(this.policeSirenTimer) > 0;
        this.policeCruiser.redLight.material.color.setHex(flash ? 0xff0022 : 0x220000);
        this.policeCruiser.blueLight.material.color.setHex(!flash ? 0x0066ff : 0x000033);
      }

      // Armed Police Officer On Foot Pursuit & Aimed Shooting (NO AUTO-AIM!)
      if (this.policeOfficer && !isDriving) {
        const cop = this.policeOfficer;
        const diff = playerPos.clone().sub(cop.group.position);
        diff.y = 0;
        const dist = diff.length();

        // Run towards player
        if (dist > 2.2) {
          diff.normalize();
          cop.group.position.addScaledVector(diff, cop.speed * delta);
          cop.group.rotation.y = Math.atan2(diff.x, diff.z);

          // Running animation
          cop.animTime += delta * 12;
          const legAngle = Math.sin(cop.animTime) * 0.6;
          cop.legL.rotation.x = legAngle;
          cop.legR.rotation.x = -legAngle;
          cop.armL.rotation.x = -legAngle * 0.7;
        }

        // Aim & Shoot at player (Visible bullet with spread - NO AUTO-AIM!)
        cop.shootTimer += delta;
        if (cop.shootTimer > 1.6 && dist < 38.0 && dist > 3.0) {
          cop.shootTimer = 0;
          if (window.soundManager) window.soundManager.playGunshot(false);

          const fromPos = cop.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
          const targetPos = playerPos.clone().add(new THREE.Vector3(0, 1.2, 0));

          // Spread based on player movement & distance (45% hit chance)
          const isPlayerMoving = window.game.input && (window.game.input.forward || window.game.input.sprint);
          const hitChance = isPlayerMoving ? 0.35 : 0.55;
          const didHit = Math.random() < hitChance;

          if (!didHit) {
            targetPos.x += (Math.random() - 0.5) * 3.5;
            targetPos.z += (Math.random() - 0.5) * 3.5;
          }

          this.spawnBulletTracer(fromPos, targetPos, didHit);

          if (didHit && !player.isBusted) {
            player.takeDamage(12, 'police');
          } else {
            if (window.gameUI && Math.random() < 0.4) {
              window.gameUI.showNotification('👮 POLICE: "Stop right there! Drop your weapon!"', 'warning', 2500);
            }
          }
        }

        // Close-range physical arrest (ONLY when cornered at < 2.5m and health <= 10 or player pinned)
        if (dist <= 2.5 && !player.isBusted) {
          if (player.health <= 10) {
            window.game.triggerBustedSequence();
          } else {
            cop.pinTimer += delta;
            if (cop.pinTimer > 2.0 && player.isConcealed) {
              window.game.triggerBustedSequence();
            }
          }
        } else {
          cop.pinTimer = 0;
        }
      }
    } else {
      if (this.policeCruiser) this.removePoliceCruiser();
      if (this.policeOfficer) this.removePoliceOfficer();
    }

    // 4. Traffic Cars
    for (let i = 0; i < this.trafficCars.length; i++) {
      const c = this.trafficCars[i];
      c.group.position.addScaledVector(c.dir, c.speed * delta);

      if (c.group.position.x > 320) c.group.position.x = -320;
      if (c.group.position.x < -320) c.group.position.x = 320;
      if (c.group.position.z > 320) c.group.position.z = -320;
      if (c.group.position.z < -320) c.group.position.z = 320;
    }
  }
}

window.PedestrianManager = PedestrianManager;
