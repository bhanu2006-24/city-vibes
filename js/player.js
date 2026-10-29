// ============================================================
// CITY VIBES - PLAYER CHARACTER & CUSTOMIZATION
// ============================================================

class Player {
  constructor(scene, camera, world, vehicleManager, pedestrianManager) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.vehicleManager = vehicleManager;
    this.pedestrianManager = pedestrianManager;

    // Spawn on open sidewalk near central plaza (0 colliders)
    this.position = new THREE.Vector3(0, 1.0, 10);
    this.velocity = new THREE.Vector3();
    this.heading = 0; // camera yaw
    this.pitch = 0.2; // camera pitch
    this.cameraDistance = 5.5;

    // Movement attributes
    this.walkSpeed = 6.0;
    this.runSpeed = 11.5;
    this.jumpForce = 7.5;
    this.isGrounded = true;
    this.animTime = 0;

    // Stats
    this.maxHealth = 100;
    this.health = 100;
    this.armor = 0;

    // Character Building & Customization
    this.custom = {
      skinTone: 0xf5cba7, // fair
      hairColor: 0x222222,
      hairStyle: 'crew', // 'crew', 'slick', 'afro', 'punk'
      headwear: 'none', // 'none', 'fedora', 'cap', 'beanie'
      eyewear: 'none', // 'none', 'sunglasses', 'cyber_visor'
      outfit: 'casual'
    };

    this.outfitColors = {
      casual: { shirt: 0x3498db, pants: 0x2c3e50 },
      assassin: { shirt: 0x111111, pants: 0x0a0a0a, tie: 0xdd0033 },
      paramedic: { shirt: 0x16a085, pants: 0x117a65 },
      taxi: { shirt: 0xf39c12, pants: 0x2c3e50 },
      delivery: { shirt: 0xe74c3c, pants: 0x1c2833 },
      cyber: { shirt: 0x00f0ff, pants: 0xff0055 },
      luxury_gold: { shirt: 0xd4ac0d, pants: 0x1b2631 }
    };

    // Weapons
    this.weapons = [
      { id: 'fists', name: 'Unarmed / Fists', damage: 25, range: 2.8, fireRate: 0.35 },
      { id: 'pistol', name: 'Silenced 9mm', damage: 60, range: 50, fireRate: 0.25, silenced: true },
      { id: 'sniper', name: 'Ghost Marksman Sniper', damage: 150, range: 130, fireRate: 0.8, silenced: true }
    ];
    this.currentWeaponIdx = 1;
    this.lastAttackTime = 0;

    // 3D Humanoid Model
    this.meshGroup = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.meshGroup);

    // Initial position
    this.setPosition(this.position);
    this.createMuzzleFlash();
  }

  buildCharacterMesh() {
    // Clear existing children
    while (this.meshGroup.children.length > 0) {
      this.meshGroup.remove(this.meshGroup.children[0]);
    }

    const col = this.outfitColors[this.custom.outfit] || this.outfitColors.casual;

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.4);
    this.torsoMat = new THREE.MeshLambertMaterial({ color: col.shirt });
    this.torso = new THREE.Mesh(torsoGeo, this.torsoMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.meshGroup.add(this.torso);

    // Tie (if assassin)
    if (col.tie) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: col.tie });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.22);
      this.meshGroup.add(tie);
    }

    // Head (Skin Tone)
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    this.headMat = new THREE.MeshLambertMaterial({ color: this.custom.skinTone });
    this.head = new THREE.Mesh(headGeo, this.headMat);
    this.head.position.y = 1.88;
    this.head.castShadow = true;
    this.meshGroup.add(this.head);

    // Hair Style & Color
    const hairColor = this.custom.hairColor;
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });

    if (this.custom.hairStyle === 'afro') {
      const hairGeo = new THREE.SphereGeometry(0.32, 10, 10);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 2.1, 0);
      this.meshGroup.add(hair);
    } else if (this.custom.hairStyle === 'punk') {
      const mohawkGeo = new THREE.BoxGeometry(0.12, 0.35, 0.45);
      const mohawk = new THREE.Mesh(mohawkGeo, hairMat);
      mohawk.position.set(0, 2.22, 0);
      this.meshGroup.add(mohawk);
    } else {
      // Default crew / slick
      const hairGeo = new THREE.BoxGeometry(0.44, 0.16, 0.44);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 2.08;
      this.meshGroup.add(hair);
    }

    // Headwear (Hats)
    if (this.custom.headwear === 'fedora') {
      const brimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16);
      const brimMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const brim = new THREE.Mesh(brimGeo, brimMat);
      brim.position.set(0, 2.15, 0);
      this.meshGroup.add(brim);

      const crownGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.25, 16);
      const crown = new THREE.Mesh(crownGeo, brimMat);
      crown.position.set(0, 2.3, 0);
      this.meshGroup.add(crown);
    } else if (this.custom.headwear === 'cap') {
      const capGeo = new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 2.08, 0);
      this.meshGroup.add(cap);

      const visorGeo = new THREE.BoxGeometry(0.35, 0.04, 0.25);
      const visor = new THREE.Mesh(visorGeo, capMat);
      visor.position.set(0, 2.06, 0.26);
      this.meshGroup.add(visor);
    } else if (this.custom.headwear === 'beanie') {
      const bGeo = new THREE.SphereGeometry(0.26, 12, 10);
      const bMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
      const beanie = new THREE.Mesh(bGeo, bMat);
      beanie.position.set(0, 2.12, 0);
      this.meshGroup.add(beanie);
    }

    // Eyewear
    if (this.custom.eyewear === 'sunglasses') {
      const glassesGeo = new THREE.BoxGeometry(0.38, 0.08, 0.08);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const glasses = new THREE.Mesh(glassesGeo, glassesMat);
      glasses.position.set(0, 1.9, 0.22);
      this.meshGroup.add(glasses);
    } else if (this.custom.eyewear === 'cyber_visor') {
      const visorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.12);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 1.9, 0.22);
      this.meshGroup.add(visor);
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.82, 0.28);
    this.pantsMat = new THREE.MeshLambertMaterial({ color: col.pants });

    this.legL = new THREE.Mesh(legGeo, this.pantsMat);
    this.legL.position.set(-0.2, 0.41, 0);
    this.legL.castShadow = true;
    this.meshGroup.add(this.legL);

    this.legR = new THREE.Mesh(legGeo, this.pantsMat);
    this.legR.position.set(0.2, 0.41, 0);
    this.legR.castShadow = true;
    this.meshGroup.add(this.legR);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.22, 0.78, 0.24);
    this.armMat = this.torsoMat;

    this.armL = new THREE.Mesh(armGeo, this.armMat);
    this.armL.position.set(-0.48, 1.25, 0);
    this.armL.castShadow = true;
    this.meshGroup.add(this.armL);

    this.armR = new THREE.Mesh(armGeo, this.armMat);
    this.armR.position.set(0.48, 1.25, 0);
    this.armR.castShadow = true;
    this.meshGroup.add(this.armR);

    // Handheld Weapon Model
    this.weaponMesh = new THREE.Group();
    const barrelGeo = new THREE.BoxGeometry(0.1, 0.14, 0.45);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x1c1c1c });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 0, 0.2);
    this.weaponMesh.add(barrel);

    const silencerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
    const silencerMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const silencer = new THREE.Mesh(silencerGeo, silencerMat);
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0, 0, 0.45);
    this.weaponMesh.add(silencer);

    this.weaponMesh.position.set(0.48, 1.05, 0.35);
    this.meshGroup.add(this.weaponMesh);
  }

  setCustomization(options) {
    Object.assign(this.custom, options);
    this.buildCharacterMesh();
    this.createMuzzleFlash();
  }

  setOutfit(outfitId) {
    if (!this.outfitColors[outfitId]) return;
    this.custom.outfit = outfitId;
    this.buildCharacterMesh();
    this.createMuzzleFlash();
    if (window.gameUI) {
      window.gameUI.showNotification(`Outfit equipped: ${outfitId.toUpperCase()}`, 'outfit');
    }
  }

  createMuzzleFlash() {
    if (!this.weaponMesh) return;
    const flashGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.visible = false;
    this.muzzleFlash.position.set(0, 0, 0.6);
    this.weaponMesh.add(this.muzzleFlash);
  }

  setPosition(pos) {
    this.position.copy(pos);
    this.meshGroup.position.copy(pos);
  }

  // ------------------------------------------------------------
  // ATTACK / WEAPON FIRING
  // ------------------------------------------------------------

  attack() {
    const now = performance.now() * 0.001;
    const weapon = this.weapons[this.currentWeaponIdx];
    if (now - this.lastAttackTime < weapon.fireRate) return;
    this.lastAttackTime = now;

    if (weapon.id === 'fists') {
      window.soundManager.playGunshot(true);
      this.performHitscan(weapon.range, weapon.damage);
    } else {
      window.soundManager.playGunshot(weapon.silenced);

      if (this.muzzleFlash) {
        this.muzzleFlash.visible = true;
        setTimeout(() => {
          if (this.muzzleFlash) this.muzzleFlash.visible = false;
        }, 50);
      }

      this.performHitscan(weapon.range, weapon.damage);
    }
  }

  performHitscan(range, damage) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    raycaster.far = range;

    const targetMeshes = this.pedestrianManager.targets.map(t => t.mesh);
    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      for (let i = 0; i < this.pedestrianManager.targets.length; i++) {
        const target = this.pedestrianManager.targets[i];
        let found = false;
        target.mesh.traverse(child => {
          if (child === hitObj) found = true;
        });

        if (found) {
          this.pedestrianManager.damageTarget(target, damage);
          return;
        }
      }
    }
  }

  // ------------------------------------------------------------
  // UPDATE LOOP & MOVEMENT WITH SLIDING COLLISION
  // ------------------------------------------------------------

  update(delta, input) {
    // 1. Vehicle Driving Follow Camera
    if (this.vehicleManager.activeVehicle) {
      this.meshGroup.visible = false;
      const v = this.vehicleManager.activeVehicle;

      const forward = new THREE.Vector3(
        Math.sin(v.group.rotation.y),
        0,
        Math.cos(v.group.rotation.y)
      );

      const camTargetPos = v.group.position
        .clone()
        .sub(forward.clone().multiplyScalar(7.2))
        .add(new THREE.Vector3(0, 3.6, 0));

      this.camera.position.lerp(camTargetPos, delta * 8);
      this.camera.lookAt(v.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
      return;
    }

    // 2. On-Foot Mode
    this.meshGroup.visible = true;

    // Mouse camera rotation
    if (input.mouseDeltaX !== 0 || input.mouseDeltaY !== 0) {
      this.heading -= input.mouseDeltaX * 0.003;
      this.pitch -= input.mouseDeltaY * 0.003;
      this.pitch = Math.max(-0.4, Math.min(1.2, this.pitch));
      input.mouseDeltaX = 0;
      input.mouseDeltaY = 0;
    }

    // Camera rotation keys (Q/E or Arrow keys if on foot)
    if (input.turnLeft) this.heading += 2.0 * delta;
    if (input.turnRight) this.heading -= 2.0 * delta;

    // Direction vectors relative to camera heading
    const forward = new THREE.Vector3(-Math.sin(this.heading), 0, -Math.cos(this.heading));
    const right = new THREE.Vector3(Math.cos(this.heading), 0, -Math.sin(this.heading));

    const moveDir = new THREE.Vector3();
    if (input.forward) moveDir.add(forward);
    if (input.backward) moveDir.sub(forward);
    if (input.left) moveDir.sub(right);
    if (input.right) moveDir.add(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) {
      moveDir.normalize();
      const currentSpeed = input.sprint ? this.runSpeed : this.walkSpeed;
      const moveStep = moveDir.clone().multiplyScalar(currentSpeed * delta);

      // Smooth Axis-Separated Sliding Collision Check:
      const targetX = this.position.x + moveStep.x;
      const targetZ = this.position.z + moveStep.z;
      const playerRadius = 0.45;

      // 1. Try full diagonal step
      if (!this.world.checkCollision(targetX, targetZ, playerRadius)) {
        this.position.x = targetX;
        this.position.z = targetZ;
      } else {
        // 2. Slide along X alone if unobstructed
        if (!this.world.checkCollision(targetX, this.position.z, playerRadius)) {
          this.position.x = targetX;
        }
        // 3. Slide along Z alone if unobstructed
        if (!this.world.checkCollision(this.position.x, targetZ, playerRadius)) {
          this.position.z = targetZ;
        }
      }

      // Orient character towards movement direction
      const targetAngle = Math.atan2(-moveDir.x, -moveDir.z);
      this.meshGroup.rotation.y = targetAngle;

      // Walk cycle animation
      this.animTime += delta * (input.sprint ? 14 : 9);
      const swing = Math.sin(this.animTime) * 0.5;
      this.legL.rotation.x = swing;
      this.legR.rotation.x = -swing;
      this.armL.rotation.x = -swing;
      this.armR.rotation.x = swing;
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      this.armL.rotation.x = 0;
      this.armR.rotation.x = 0;
    }

    // Jump & Gravity
    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= 22 * delta;
      this.position.y += this.velocity.y * delta;
      if (this.position.y <= 1.0) {
        this.position.y = 1.0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.meshGroup.position.copy(this.position);

    // Third-person camera follow
    const camOffset = new THREE.Vector3(
      Math.sin(this.heading) * Math.cos(this.pitch) * this.cameraDistance,
      Math.sin(this.pitch) * this.cameraDistance + 1.8,
      Math.cos(this.heading) * Math.cos(this.pitch) * this.cameraDistance
    );

    const desiredCamPos = this.position.clone().add(camOffset);
    this.camera.position.lerp(desiredCamPos, 0.25);
    this.camera.lookAt(this.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
  }
}

window.Player = Player;
