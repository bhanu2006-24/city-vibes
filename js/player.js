// ============================================================
// CITY VIBES - PLAYER CHARACTER, FPS/TPS MODES & STEALTH WEAPONS
// ============================================================

class Player {
  constructor(scene, camera, world, vehicleManager, pedestrianManager) {
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.vehicleManager = vehicleManager;
    this.pedestrianManager = pedestrianManager;

    // Spawn on open sidewalk near central plaza
    this.position = new THREE.Vector3(0, 1.0, 10);
    this.velocity = new THREE.Vector3();
    this.heading = 0; // camera yaw
    this.pitch = 0.15; // camera pitch
    this.cameraDistance = 5.5;

    // View Mode: 'tps' (Third-Person Shooter) or 'fps' (First-Person Shooter)
    this.viewMode = 'tps';

    // Movement attributes
    this.walkSpeed = 6.0;
    this.runSpeed = 11.5;
    this.jumpForce = 7.5;
    this.isGrounded = true;
    this.animTime = 0;

    // Health & Stats
    this.maxHealth = 100;
    this.health = 100;
    this.armor = 0;

    // Police Heat / Wanted Level (0 to 5 Stars)
    this.wantedStars = 0;
    this.heatCooldownTimer = 0;
    this.isConcealed = true; // True when weapon is holstered

    // Weapon Holster & Inventory
    // Player starts UNARMED / FISTS (No guns outside in public!)
    this.isWeaponDrawn = false; // Must press 'G' to draw weapon
    this.isAiming = false;
    this.ownedWeapons = ['fists']; // Must buy guns from Armory!

    this.weapons = {
      fists: {
        id: 'fists',
        name: 'Unarmed / Fists',
        damage: 25,
        range: 2.8,
        fireRate: 0.35,
        isSilenced: true,
        hasScope: false,
        price: 0
      },
      pistol_silenced: {
        id: 'pistol_silenced',
        name: 'Silenced 9mm Hitman Special',
        damage: 65,
        range: 55,
        fireRate: 0.25,
        isSilenced: true,
        hasScope: false,
        price: 3500
      },
      sniper_silenced: {
        id: 'sniper_silenced',
        name: 'Ghost Marksman Silenced Sniper (With Scope)',
        damage: 220,
        range: 220,
        fireRate: 0.85,
        isSilenced: true,
        hasScope: true,
        zoomFov: 14, // 8x Scope Zoom
        price: 9000
      }
    };
    this.currentWeaponKey = 'fists';
    this.lastAttackTime = 0;

    // Character Customization
    this.custom = {
      skinTone: 0xf5cba7,
      hairColor: 0x222222,
      hairStyle: 'crew',
      headwear: 'none',
      eyewear: 'none',
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

    // Third-person character model group
    this.meshGroup = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.meshGroup);

    // First-person viewmodel group (attached to camera)
    this.fpsWeaponGroup = new THREE.Group();
    this.buildFpsViewModel();
    this.camera.add(this.fpsWeaponGroup);
    this.scene.add(this.camera);

    this.setPosition(this.position);
    this.createMuzzleFlash();
    this.updateWeaponVisibility();
  }

  // ------------------------------------------------------------
  // VIEW MODE TOGGLE (TPS <-> FPS)
  // ------------------------------------------------------------

  toggleViewMode() {
    this.viewMode = this.viewMode === 'tps' ? 'fps' : 'tps';
    if (this.viewMode === 'fps') {
      // Hide 3rd person body, show FPS viewmodel
      this.meshGroup.visible = false;
      this.fpsWeaponGroup.visible = this.isWeaponDrawn && this.currentWeaponKey !== 'fists';
      if (window.gameUI) {
        window.gameUI.showNotification('🎥 View Mode: FIRST-PERSON SHOOTER (FPS)', 'info', 3000);
      }
    } else {
      // TPS mode
      this.meshGroup.visible = true;
      this.fpsWeaponGroup.visible = false;
      if (window.gameUI) {
        window.gameUI.showNotification('🎥 View Mode: THIRD-PERSON SHOOTER (TPS)', 'info', 3000);
      }
    }
    if (window.gameUI) window.gameUI.updateViewModeHUD(this.viewMode);
    return this.viewMode;
  }

  // ------------------------------------------------------------
  // WEAPON CONCEALMENT & HOLSTERING
  // ------------------------------------------------------------

  toggleHolster() {
    if (this.ownedWeapons.length <= 1 && this.ownedWeapons[0] === 'fists') {
      if (window.gameUI) {
        window.gameUI.showNotification('⚠️ You are unarmed! Buy a silenced weapon at the Underground Armory.', 'warning');
      }
      return false;
    }

    this.isWeaponDrawn = !this.isWeaponDrawn;
    this.isConcealed = !this.isWeaponDrawn;

    if (this.isWeaponDrawn) {
      // Pick first available gun if currently on fists
      if (this.currentWeaponKey === 'fists') {
        const gun = this.ownedWeapons.find(w => w !== 'fists');
        if (gun) this.currentWeaponKey = gun;
      }
      window.soundManager.playGunshot(true);
      if (window.gameUI) {
        window.gameUI.showNotification(`⚠️ WEAPON DRAWN: ${this.weapons[this.currentWeaponKey].name}! Brandishing in public causes panic & alerts police!`, 'warning', 5000);
      }
    } else {
      // Holstered / Concealed
      this.currentWeaponKey = 'fists';
      this.isAiming = false;
      this.setScopeAim(false);
      if (window.gameUI) {
        window.gameUI.showNotification('🛡️ WEAPON CONCEALED: Hands empty. Civilian cover restored.', 'success', 4000);
      }
    }

    this.updateWeaponVisibility();
    if (window.gameUI) window.gameUI.updateHolsterHUD(this.isWeaponDrawn);
    return this.isWeaponDrawn;
  }

  updateWeaponVisibility() {
    const showGun = this.isWeaponDrawn && this.currentWeaponKey !== 'fists';

    if (this.weaponMesh) {
      this.weaponMesh.visible = showGun;
    }

    if (this.fpsWeaponGroup) {
      this.fpsWeaponGroup.visible = this.viewMode === 'fps' && showGun;
    }
  }

  // ------------------------------------------------------------
  // FIRST-PERSON VIEWMODEL
  // ------------------------------------------------------------

  buildFpsViewModel() {
    while (this.fpsWeaponGroup.children.length > 0) {
      this.fpsWeaponGroup.remove(this.fpsWeaponGroup.children[0]);
    }

    const isSniper = this.currentWeaponKey === 'sniper_silenced';

    // Barrel / Body
    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, isSniper ? 0.9 : 0.45);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.28, -0.25, -0.6);
    this.fpsWeaponGroup.add(gun);

    // Silencer cylinder at the tip
    const silencerGeo = new THREE.CylinderGeometry(0.035, 0.035, isSniper ? 0.4 : 0.28, 12);
    const silencerMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const silencer = new THREE.Mesh(silencerGeo, silencerMat);
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0.28, -0.25, isSniper ? -1.15 : -0.85);
    this.fpsWeaponGroup.add(silencer);

    // Scope tube (if sniper)
    if (isSniper) {
      const scopeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
      const scopeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const scope = new THREE.Mesh(scopeGeo, scopeMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0.28, -0.16, -0.6);
      this.fpsWeaponGroup.add(scope);
    }

    this.fpsWeaponGroup.visible = false;
  }

  // ------------------------------------------------------------
  // SNIPER SCOPE AIMING MECHANIC
  // ------------------------------------------------------------

  setScopeAim(active) {
    const weapon = this.weapons[this.currentWeaponKey];
    this.isAiming = active && this.isWeaponDrawn;

    const scopeOverlay = document.getElementById('sniper-scope-overlay');

    if (this.isAiming && weapon.hasScope) {
      // Enter Full Military Sniper Scope Mode
      this.camera.fov = weapon.zoomFov || 15;
      this.camera.updateProjectionMatrix();

      if (scopeOverlay) {
        scopeOverlay.style.display = 'block';
        this.updateScopeDistanceReadout();
      }
    } else {
      // Standard FOV
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
      if (scopeOverlay) scopeOverlay.style.display = 'none';
    }
  }

  updateScopeDistanceReadout() {
    const distanceEl = document.getElementById('scope-target-distance');
    if (!distanceEl) return;

    // Raycast forward from center
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    raycaster.far = 300;

    // Check hit distance to world buildings or targets
    const checkMeshes = [];
    this.pedestrianManager.targets.forEach(t => checkMeshes.push(t.mesh));
    this.scene.children.forEach(c => {
      if (c.isMesh && c !== this.meshGroup) checkMeshes.push(c);
    });

    const hits = raycaster.intersectObjects(checkMeshes, true);
    if (hits.length > 0) {
      const dist = Math.round(hits[0].distance);
      distanceEl.innerText = `${dist}m`;
    } else {
      distanceEl.innerText = '--m';
    }
  }

  // ------------------------------------------------------------
  // ATTACK / WEAPON FIRING & STEALTH EVALUATION
  // ------------------------------------------------------------

  attack() {
    const now = performance.now() * 0.001;
    const weapon = this.weapons[this.currentWeaponKey];
    if (now - this.lastAttackTime < weapon.fireRate) return;
    this.lastAttackTime = now;

    // Must draw weapon to fire guns
    if (weapon.id !== 'fists' && !this.isWeaponDrawn) {
      this.toggleHolster();
      return;
    }

    if (weapon.id === 'fists') {
      window.soundManager.playGunshot(true);
      this.performHitscan(weapon.range, weapon.damage, false);
      return;
    }

    // Play silenced gunshot sound
    window.soundManager.playGunshot(weapon.isSilenced);

    // Muzzle flash
    if (this.muzzleFlash && this.viewMode === 'tps') {
      this.muzzleFlash.visible = true;
      setTimeout(() => {
        if (this.muzzleFlash) this.muzzleFlash.visible = false;
      }, 45);
    }

    // Camera recoil punch
    this.pitch += 0.02;

    this.performHitscan(weapon.range, weapon.damage, weapon.hasScope && this.isAiming);
  }

  performHitscan(range, damage, isScopedSnipe = false) {
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
          const hitDist = this.position.distanceTo(target.mesh.position);
          this.pedestrianManager.damageTarget(target, damage);

          // Stealth check: Was this a discreet scoped sniper kill from distance (>25m)?
          if (isScopedSnipe && hitDist >= 20) {
            if (window.gameUI) {
              window.gameUI.showNotification(
                `🎯 STEALTH ELIMINATION VERIFIED! Clean sniper takedown from ${Math.round(hitDist)}m! Zero witnesses. Now snap photo proof (C)!`,
                'success',
                7000
              );
            }
          } else {
            // Public close-range assassination -> Police alerted!
            this.addPoliceHeat(2);
            if (window.gameUI) {
              window.gameUI.showNotification(
                '🚨 SHOTS FIRED IN PUBLIC! Witnesses alerted police! Cops are in pursuit!',
                'error',
                6000
              );
            }
          }
          return;
        }
      }
    }
  }

  // ------------------------------------------------------------
  // POLICE WANTED HEAT SYSTEM
  // ------------------------------------------------------------

  addPoliceHeat(stars) {
    this.wantedStars = Math.min(5, this.wantedStars + stars);
    this.heatCooldownTimer = 25; // 25s to cool down

    window.soundManager.toggleSiren(true);
    setTimeout(() => {
      if (this.wantedStars === 0) window.soundManager.toggleSiren(false);
    }, 8000);

    if (window.gameUI) {
      window.gameUI.updateWantedHUD(this.wantedStars);
    }
  }

  coolDownHeat(delta) {
    if (this.wantedStars <= 0) return;

    // Heat only cools down if weapon is holstered / concealed
    if (this.isConcealed) {
      this.heatCooldownTimer -= delta;
      if (this.heatCooldownTimer <= 0) {
        this.wantedStars = Math.max(0, this.wantedStars - 1);
        this.heatCooldownTimer = 20;

        if (this.wantedStars === 0) {
          window.soundManager.toggleSiren(false);
          if (window.gameUI) {
            window.gameUI.showNotification('🛡️ Police search called off. Heat cleared!', 'success');
          }
        }
        if (window.gameUI) window.gameUI.updateWantedHUD(this.wantedStars);
      }
    } else {
      // Reset cooldown if weapon is visibly drawn
      this.heatCooldownTimer = 25;
    }
  }

  // ------------------------------------------------------------
  // THIRD-PERSON CHARACTER MODEL BUILDER
  // ------------------------------------------------------------

  buildCharacterMesh() {
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

    if (col.tie) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: col.tie });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.22);
      this.meshGroup.add(tie);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    this.headMat = new THREE.MeshLambertMaterial({ color: this.custom.skinTone });
    this.head = new THREE.Mesh(headGeo, this.headMat);
    this.head.position.y = 1.88;
    this.head.castShadow = true;
    this.meshGroup.add(this.head);

    // Hair
    const hairMat = new THREE.MeshLambertMaterial({ color: this.custom.hairColor });
    if (this.custom.hairStyle === 'afro') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), hairMat);
      hair.position.set(0, 2.1, 0);
      this.meshGroup.add(hair);
    } else if (this.custom.hairStyle === 'punk') {
      const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.45), hairMat);
      mohawk.position.set(0, 2.22, 0);
      this.meshGroup.add(mohawk);
    } else {
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.44), hairMat);
      hair.position.y = 2.08;
      this.meshGroup.add(hair);
    }

    // Headwear
    if (this.custom.headwear === 'fedora') {
      const brimMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16), brimMat);
      brim.position.set(0, 2.15, 0);
      this.meshGroup.add(brim);

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.25, 16), brimMat);
      crown.position.set(0, 2.3, 0);
      this.meshGroup.add(crown);
    } else if (this.custom.headwear === 'cap') {
      const capMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      cap.position.set(0, 2.08, 0);
      this.meshGroup.add(cap);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.25), capMat);
      visor.position.set(0, 2.06, 0.26);
      this.meshGroup.add(visor);
    } else if (this.custom.headwear === 'beanie') {
      const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshLambertMaterial({ color: 0x2c3e50 }));
      beanie.position.set(0, 2.12, 0);
      this.meshGroup.add(beanie);
    }

    // Eyewear
    if (this.custom.eyewear === 'sunglasses') {
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      glasses.position.set(0, 1.9, 0.22);
      this.meshGroup.add(glasses);
    } else if (this.custom.eyewear === 'cyber_visor') {
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
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
    this.armL = new THREE.Mesh(armGeo, this.torsoMat);
    this.armL.position.set(-0.48, 1.25, 0);
    this.armL.castShadow = true;
    this.meshGroup.add(this.armL);

    this.armR = new THREE.Mesh(armGeo, this.torsoMat);
    this.armR.position.set(0.48, 1.25, 0);
    this.armR.castShadow = true;
    this.meshGroup.add(this.armR);

    // Handheld Weapon
    this.weaponMesh = new THREE.Group();
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.5), new THREE.MeshLambertMaterial({ color: 0x1c1c1c }));
    barrel.position.set(0, 0, 0.2);
    this.weaponMesh.add(barrel);

    const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0, 0, 0.5);
    this.weaponMesh.add(silencer);

    this.weaponMesh.position.set(0.48, 1.05, 0.35);
    this.weaponMesh.visible = false;
    this.meshGroup.add(this.weaponMesh);
  }

  setCustomization(options) {
    Object.assign(this.custom, options);
    this.buildCharacterMesh();
    this.createMuzzleFlash();
    this.updateWeaponVisibility();
  }

  setOutfit(outfitId) {
    if (!this.outfitColors[outfitId]) return;
    this.custom.outfit = outfitId;
    this.buildCharacterMesh();
    this.createMuzzleFlash();
    this.updateWeaponVisibility();
    if (window.gameUI) {
      window.gameUI.showNotification(`Outfit equipped: ${outfitId.toUpperCase()}`, 'outfit');
    }
  }

  createMuzzleFlash() {
    if (!this.weaponMesh) return;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    flash.visible = false;
    flash.position.set(0, 0, 0.65);
    this.muzzleFlash = flash;
    this.weaponMesh.add(flash);
  }

  setPosition(pos) {
    this.position.copy(pos);
    this.meshGroup.position.copy(pos);
  }

  // ------------------------------------------------------------
  // UPDATE LOOP & FPS/TPS CAMERA
  // ------------------------------------------------------------

  update(delta, input) {
    // 1. Vehicle Driving Follow
    if (this.vehicleManager.activeVehicle) {
      this.meshGroup.visible = false;
      this.fpsWeaponGroup.visible = false;
      const v = this.vehicleManager.activeVehicle;

      const forward = new THREE.Vector3(Math.sin(v.group.rotation.y), 0, Math.cos(v.group.rotation.y));
      const camTargetPos = v.group.position.clone().sub(forward.multiplyScalar(7.2)).add(new THREE.Vector3(0, 3.6, 0));

      this.camera.position.lerp(camTargetPos, delta * 8);
      this.camera.lookAt(v.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
      return;
    }

    // 2. Mouse Look & Pitch
    if (input.mouseDeltaX !== 0 || input.mouseDeltaY !== 0) {
      this.heading -= input.mouseDeltaX * 0.003;
      this.pitch -= input.mouseDeltaY * 0.003;
      this.pitch = Math.max(-0.45, Math.min(1.2, this.pitch));
      input.mouseDeltaX = 0;
      input.mouseDeltaY = 0;
    }

    if (input.turnLeft) this.heading += 2.0 * delta;
    if (input.turnRight) this.heading -= 2.0 * delta;

    // Movement Vectors
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

      const targetX = this.position.x + moveStep.x;
      const targetZ = this.position.z + moveStep.z;
      const radius = 0.45;

      if (!this.world.checkCollision(targetX, targetZ, radius)) {
        this.position.x = targetX;
        this.position.z = targetZ;
      } else {
        if (!this.world.checkCollision(targetX, this.position.z, radius)) {
          this.position.x = targetX;
        }
        if (!this.world.checkCollision(this.position.x, targetZ, radius)) {
          this.position.z = targetZ;
        }
      }

      this.meshGroup.rotation.y = Math.atan2(-moveDir.x, -moveDir.z);

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

    // Jump / Gravity
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

    // 3. Camera Positioning: FPS vs TPS
    if (this.viewMode === 'fps') {
      this.meshGroup.visible = false;
      this.fpsWeaponGroup.visible = this.isWeaponDrawn && this.currentWeaponKey !== 'fists';

      // Head position
      const headPos = this.position.clone().add(new THREE.Vector3(0, 1.75, 0));
      this.camera.position.copy(headPos);

      // Look direction
      const lookDir = new THREE.Vector3(
        -Math.sin(this.heading) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        -Math.cos(this.heading) * Math.cos(this.pitch)
      );
      this.camera.lookAt(headPos.clone().add(lookDir));

      // Gun bobbing in FPS
      if (isMoving) {
        this.fpsWeaponGroup.position.x = Math.sin(this.animTime * 0.8) * 0.015;
        this.fpsWeaponGroup.position.y = Math.cos(this.animTime * 1.6) * 0.012;
      } else {
        this.fpsWeaponGroup.position.set(0, 0, 0);
      }
    } else {
      // TPS Mode
      this.meshGroup.visible = true;
      this.fpsWeaponGroup.visible = false;

      const camOffset = new THREE.Vector3(
        Math.sin(this.heading) * Math.cos(this.pitch) * this.cameraDistance,
        Math.sin(this.pitch) * this.cameraDistance + 1.8,
        Math.cos(this.heading) * Math.cos(this.pitch) * this.cameraDistance
      );

      const desiredCamPos = this.position.clone().add(camOffset);
      this.camera.position.lerp(desiredCamPos, 0.25);
      this.camera.lookAt(this.position.clone().add(new THREE.Vector3(0, 1.4, 0)));
    }

    // 4. Update Scope Readout if Aiming
    if (this.isAiming && this.weapons[this.currentWeaponKey].hasScope) {
      this.updateScopeDistanceReadout();
    }

    // 5. Police Heat Cooldown
    this.coolDownHeat(delta);

    // 6. Public Gun Chaos Check: If weapon is drawn, panic nearby pedestrians!
    if (this.isWeaponDrawn) {
      this.pedestrianManager.triggerPublicBrandishPanic(this.position);
    }
  }
}

window.Player = Player;
