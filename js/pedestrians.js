// ============================================================
// CITY VIBES - PEDESTRIANS, TRAFFIC & ASSASSINATION TARGETS
// ============================================================

class PedestrianManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.pedestrians = [];
    this.trafficCars = [];
    this.targets = []; // Active assassin guild targets
    this.nextTargetId = 1;
  }

  init() {
    this.spawnAmbientPedestrians(24);
    this.spawnAmbientTraffic(10);
  }

  // ------------------------------------------------------------
  // AMBIENT PEDESTRIANS
  // ------------------------------------------------------------

  spawnAmbientPedestrians(count = 20) {
    const totalStep = this.world.blockSize + this.world.roadWidth;
    const colors = [0x34495e, 0x16a085, 0x8e44ad, 0xd35400, 0x2c3e50, 0x7f8c8d];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 450;
      const rz = (Math.random() - 0.5) * 450;
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
        isDead: false,
        isTarget: false
      });
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

    // Red Tie / Scarf for targets
    if (isTarget) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.19);
      root.add(tie);

      // Gold Watch / Briefcase
      const caseGeo = new THREE.BoxGeometry(0.5, 0.35, 0.12);
      const caseMat = new THREE.MeshLambertMaterial({ color: 0x4a2311 });
      const briefcase = new THREE.Mesh(caseGeo, caseMat);
      briefcase.position.set(0.48, 0.75, 0);
      root.add(briefcase);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf5cba7 }); // skin tone
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    root.add(head);

    // Hair / Sunglasses
    const hairGeo = new THREE.BoxGeometry(0.42, 0.16, 0.42);
    const hairMat = new THREE.MeshLambertMaterial({ color: isTarget ? 0x222222 : 0x4a2e1b });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.05;
    root.add(hair);

    if (isTarget) {
      // Sleek Dark Sunglasses
      const glassesGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const glasses = new THREE.Mesh(glassesGeo, glassesMat);
      glasses.position.set(0, 1.9, 0.21);
      root.add(glasses);

      // Target overhead indicator ring (red holographic reticle)
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
    // Clear any previous target of the same contract
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

    // Blood / Spark hit effect
    if (window.soundManager) window.soundManager.playGunshot(true);

    if (target.health <= 0) {
      this.killTarget(target);
    }
  }

  killTarget(target) {
    target.isDead = true;
    target.health = 0;

    // Knock target over onto the ground (dead ragdoll posture)
    target.mesh.rotation.x = Math.PI / 2;
    target.mesh.position.y = 0.25;

    // Hide glowing reticle
    if (target.mesh.reticle) {
      target.mesh.reticle.visible = false;
    }

    if (window.gameUI) {
      window.gameUI.showNotification(
        `🎯 TARGET DOWN: ${target.name}! Pull out camera (C) and take a photo to claim $${target.bounty.toLocaleString()}!`,
        'target_kill',
        7000
      );
    }
  }

  // ------------------------------------------------------------
  // AMBIENT TRAFFIC SIMULATION
  // ------------------------------------------------------------

  spawnAmbientTraffic(count = 10) {
    const totalStep = this.world.blockSize + this.world.roadWidth;
    const colors = [0x95a5a6, 0x34495e, 0x27ae60, 0x2980b9, 0xc0392b, 0xd35400];

    for (let i = 0; i < count; i++) {
      // Pick a road lane
      const isVertical = Math.random() > 0.5;
      const roadCoord = (Math.floor(Math.random() * 5) - 2) * totalStep;
      const laneOffset = (Math.random() > 0.5 ? 1 : -1) * 4.5;

      const group = new THREE.Group();
      const col = colors[Math.floor(Math.random() * colors.length)];

      // Simple traffic car mesh
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
    // 1. Update Ambient Pedestrians
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.isDead) continue;

      p.changeTimer -= delta;
      if (p.changeTimer <= 0) {
        p.changeTimer = 4 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        p.direction.set(Math.cos(angle), 0, Math.sin(angle));
      }

      // Move pedestrian
      const move = p.direction.clone().multiplyScalar(p.speed * delta);
      const nextPos = p.mesh.position.clone().add(move);

      // Simple boundary containment
      if (Math.abs(nextPos.x) > 280 || Math.abs(nextPos.z) > 280) {
        p.direction.negate();
      } else {
        p.mesh.position.copy(nextPos);
      }

      // Orient mesh towards direction
      p.mesh.rotation.y = Math.atan2(p.direction.x, p.direction.z);

      // Animate walking limbs
      const u = p.mesh.userData;
      u.animTime += delta * p.speed * 4;
      const legAngle = Math.sin(u.animTime) * 0.45;
      u.legL.rotation.x = legAngle;
      u.legR.rotation.x = -legAngle;
      u.armL.rotation.x = -legAngle;
      u.armR.rotation.x = legAngle;
    }

    // 2. Update Guild Targets
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (t.isDead) continue;

      // Patrol between waypoints
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

        // Animate walk
        const u = t.mesh.userData;
        u.animTime += delta * t.speed * 4;
        const legAngle = Math.sin(u.animTime) * 0.45;
        u.legL.rotation.x = legAngle;
        u.legR.rotation.x = -legAngle;
        u.armL.rotation.x = -legAngle;
        u.armR.rotation.x = legAngle;
      }

      // Rotate target holographic ring
      if (t.mesh.reticle) {
        t.mesh.reticle.rotation.z += delta * 2;
      }
    }

    // 3. Update Ambient Traffic
    for (let i = 0; i < this.trafficCars.length; i++) {
      const c = this.trafficCars[i];
      c.group.position.addScaledVector(c.dir, c.speed * delta);

      // Wrap around city boundaries
      if (c.group.position.x > 320) c.group.position.x = -320;
      if (c.group.position.x < -320) c.group.position.x = 320;
      if (c.group.position.z > 320) c.group.position.z = -320;
      if (c.group.position.z < -320) c.group.position.z = 320;
    }
  }
}

window.PedestrianManager = PedestrianManager;

