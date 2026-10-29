// ============================================================
// CITY VIBES - PLAYER CHARACTER & CONTROLLER
// ============================================================

class Player {
  constructor(scene, camera, world, vehicleManager, pedestrianManager) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.vehicleManager = vehicleManager;
    this.pedestrianManager = pedestrianManager;

    this.position = new THREE.Vector3(0, 1.0, 15);
    this.velocity = new THREE.Vector3();
    this.heading = 0; // rotation around Y axis
    this.pitch = 0.2; // camera elevation angle
    this.cameraDistance = 5.5;

    // Movement attributes
    this.walkSpeed = 5.5;
    this.runSpeed = 10.5;
    this.jumpForce = 7.5;
    this.isGrounded = true;
    this.animTime = 0;

    // Stats
    this.maxHealth = 100;
    this.health = 100;
    this.armor = 0;

    // Outfits & Customization
    this.currentOutfit = 'casual';
    this.outfitColors = {
      casual: { shirt: 0x3498db, pants: 0x2c3e50 },
      assassin: { shirt: 0x111111, pants: 0x050505, tie: 0xaa0022 },
      paramedic: { shirt: 0x16a085, pants: 0x117a65 },
      taxi: { shirt: 0xf39c12, pants: 0x2c3e50 },
      delivery: { shirt: 0xe74c3c, pants: 0x1c2833 },
      cyber: { shirt: 0x00f0ff, pants: 0xff0055 },
      luxury_gold: { shirt: 0xd4ac0d, pants: 0x1b2631 }
    };

    // Weapons
    this.weapons = [
      { id: 'fists', name: 'Unarmed / Fists', damage: 25, range: 2.5, fireRate: 0.4 },
      { id: 'pistol', name: 'Silenced 9mm', damage: 60, range: 45, fireRate: 0.25, silenced: true },
      { id: 'sniper', name: 'Ghost Marksman Sniper', damage: 150, range: 120, fireRate: 0.8, silenced: true }
    ];
    this.currentWeaponIdx = 1; // Start with Silenced Pistol for assassin gameplay!
    this.lastAttackTime = 0;

    // 3D Humanoid Model
    this.meshGroup = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.meshGroup);

    // Muzzle flash particle
    this.createMuzzleFlash();
  }

  buildCharacterMesh() {
    // Clear existing
    while (this.meshGroup.children.length > 0) {
      this.meshGroup.remove(this.meshGroup.children[0]);
    }

    const col = this.outfitColors[this.currentOutfit] || this.outfitColors.casual;

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.4);
    this.torsoMat = new THREE.MeshLambertMaterial({ color: col.shirt });
    this.torso = new THREE.Mesh(torsoGeo, this.torsoMat);
    this.torso.position.y = 1.25;
    this.torso.castShadow = true;
    this.meshGroup.add(this.torso);

    // Tie if assassin
    if (col.tie) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: col.tie });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.22);
      this.meshGroup.add(tie);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf5cba7 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 1.88;
    this.head.castShadow = true;
    this.meshGroup.add(this.head);

    // Hair / Cap
    const hairGeo = new THREE.BoxGeometry(0.44, 0.16, 0.44);
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.08;
    this.meshGroup.add(hair);

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

    // Silencer cylinder
    const silencerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
    const silencerMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const silencer = new THREE.Mesh(silencerGeo, silencerMat);
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0, 0, 0.45);
    this.weaponMesh.add(silencer);

    this.weaponMesh.position.set(0.48, 1.05, 0.35);
    this.meshGroup.add(this.weaponMesh);
  }

  setOutfit(outfitId) {
    if (!this.outfitColors[outfitId]) return;
    this.currentOutfit = outfitId;
    this.buildCharacterMesh();
    if (window.gameUI) {
      window.gameUI.showNotification(`Changed outfit to: ${outfitId.toUpperCase()}`, 'outfit');
    }
  }

  createMuzzleFlash() {
    const flashGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlash.visible = false;
    this.weaponMesh.add(this.muzzleFlash);
    this.muzzleFlash.position.set(0, 0, 0.6);
  }

  setPosition(pos) {
    this.position.copy(pos);
    this.meshGroup.position.copy(pos);
  }

  // ------------------------------------------------------------
  // ATTACK / SHOOTING MECHANIC
  // ------------------------------------------------------------

  attack() {
    const now = performance.now() * 0.001;
    const weapon = this.weapons[this.currentWeaponIdx];
    if (now - this.lastAttackTime < weapon.fireRate) return;
    this.lastAttackTime = now;

    if (weapon.id === 'fists') {
      window.soundManager.playPunch ? window.soundManager.playPunch() : window.soundManager.playGunshot(true);
      this.performHitscan(weapon.range, weapon.damage);
    } else {
      // Gunshot
      window.soundManager.playGunshot(weapon.silenced);

      // Show muzzle flash briefly
      this.muzzleFlash.visible = true;
      setTimeout(() => {
        this.muzzleFlash.visible = false;
      }, 50);

      this.performHitscan(weapon.range, weapon.damage);
    }
  }

  performHitscan(range, damage) {
    // Cast ray forward from camera center
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    raycaster.far = range;

    // Check hit on active assassin guild targets
    const targetMeshes = this.pedestrianManager.targets.map(t => t.mesh);
    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      // Find which target was hit
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

    // Also check ambient pedestrians
    const pedMeshes = this.pedestrianManager.pedestrians.map(p => p.mesh);
    const pedHits = raycaster.intersectObjects(pedMeshes, true);
    if (pedHits.length > 0) {
      window.soundManager.playGunshot(true);
    }
  }

  // ------------------------------------------------------------
  // UPDATE LOOP & CAMERA ORBIT
  // ------------------------------------------------------------

  update(delta, input) {
    // If inside a vehicle, follow the vehicle
    if (this.vehicleManager.activeVehicle) {
      this.meshGroup.visible = false;
      const v = this.vehicleManager.activeVehicle;

      // Camera follows behind vehicle smoothly
      const forward = new THREE.Vector3(
        Math.sin(v.group.rotation.y),
        0,
        Math.cos(v.group.rotation.y)
      );
      const camTargetPos = v.group.position
        .clone()
        .sub(forward.clone().multiplyScalar(7.5))
        .add(new THREE.Vector3(0, 3.8, 0));

      this.camera.position.lerp(camTargetPos, delta * 7);
      this.camera.lookAt(v.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
      return;
    }

    // On-foot mode
    this.meshGroup.visible = true;

    // Camera rotation from mouse delta
    if (input.mouseDeltaX !== 0 || input.mouseDeltaY !== 0) {
      this.heading -= input.mouseDeltaX * 0.003;
      this.pitch -= input.mouseDeltaY * 0.003;
      this.pitch = Math.max(-0.4, Math.min(1.2, this.pitch));
      input.mouseDeltaX = 0;
      input.mouseDeltaY = 0;
    }

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

      const nextPos = this.position.clone().addScaledVector(moveDir, currentSpeed * delta);

      // Check collision with city buildings
      if (!this.world.checkCollision(nextPos.x, nextPos.z, 0.6)) {
        this.position.copy(nextPos);
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
      // Idle return
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      this.armL.rotation.x = 0;
      this.armR.rotation.x = 0;
    }

    // Jump / Gravity
    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= 22 * delta; // gravity
      this.position.y += this.velocity.y * delta;
      if (this.position.y <= 1.0) {
        this.position.y = 1.0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.meshGroup.position.copy(this.position);

    // Update 3rd Person Follow Camera
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

