// ============================================================
// CITY VIBES - PLAYER CONTROLLER & MOVEMENT PHYSICS
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
    this.maxArmor = 100;
    this.isBusted = false;

    // Police Heat / Wanted Level (0 to 5 Stars)
    this.wantedStars = 0;
    this.heatCooldownTimer = 0;
    this.isConcealed = true; // True when weapon is holstered

    // Weapon Holster & Inventory
    this.isWeaponDrawn = false;
    this.isAiming = false;
    this.ownedWeapons = ['fists'];
    this.weapons = window.PlayerWeaponsData || {};
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

    this.outfitColors = window.PlayerOutfitColors || {};

    // Third-person character model group
    this.meshGroup = new THREE.Group();
    window.PlayerModelBuilder.buildCharacterMesh(this);
    this.scene.add(this.meshGroup);

    // First-person viewmodel group (attached to camera)
    this.fpsWeaponGroup = new THREE.Group();
    window.PlayerWeaponsSystem.buildFpsViewModel(this);
    this.camera.add(this.fpsWeaponGroup);
    this.scene.add(this.camera);

    this.setPosition(this.position);
    window.PlayerModelBuilder.createMuzzleFlash(this);
    this.updateWeaponVisibility();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'tps' ? 'fps' : 'tps';
    if (this.viewMode === 'fps') {
      this.meshGroup.visible = false;
      this.fpsWeaponGroup.visible = this.isWeaponDrawn && this.currentWeaponKey !== 'fists';
      if (window.gameUI) {
        window.gameUI.showNotification('🎥 View Mode: FIRST-PERSON SHOOTER (FPS)', 'info', 3000);
      }
    } else {
      this.meshGroup.visible = true;
      this.fpsWeaponGroup.visible = false;
      if (window.gameUI) {
        window.gameUI.showNotification('🎥 View Mode: THIRD-PERSON SHOOTER (TPS)', 'info', 3000);
      }
    }
    if (window.gameUI) window.gameUI.updateViewModeHUD(this.viewMode);
    return this.viewMode;
  }

  toggleHolster() {
    return window.PlayerWeaponsSystem.toggleHolster(this);
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

  buildFpsViewModel() {
    window.PlayerWeaponsSystem.buildFpsViewModel(this);
  }

  setScopeAim(active) {
    window.PlayerWeaponsSystem.setScopeAim(this, active);
  }

  updateScopeDistanceReadout() {
    window.PlayerWeaponsSystem.updateScopeDistanceReadout(this);
  }

  attack() {
    window.PlayerWeaponsSystem.attack(this);
  }

  performHitscan(range, damage, isScopedSnipe = false) {
    window.PlayerWeaponsSystem.performHitscan(this, range, damage, isScopedSnipe);
  }

  addPoliceHeat(stars) {
    window.PlayerWeaponsSystem.addPoliceHeat(this, stars);
  }

  coolDownHeat(delta) {
    window.PlayerWeaponsSystem.coolDownHeat(this, delta);
  }

  buildCharacterMesh() {
    window.PlayerModelBuilder.buildCharacterMesh(this);
  }

  setCustomization(options) {
    Object.assign(this.custom, options);
    window.PlayerModelBuilder.buildCharacterMesh(this);
    window.PlayerModelBuilder.createMuzzleFlash(this);
    this.updateWeaponVisibility();
  }

  setOutfit(outfitId) {
    if (!this.outfitColors[outfitId]) return;
    this.custom.outfit = outfitId;
    window.PlayerModelBuilder.buildCharacterMesh(this);
    window.PlayerModelBuilder.createMuzzleFlash(this);
    this.updateWeaponVisibility();
    if (window.gameUI) {
      window.gameUI.showNotification(`Outfit equipped: ${outfitId.toUpperCase()}`, 'outfit');
    }
  }

  createMuzzleFlash() {
    window.PlayerModelBuilder.createMuzzleFlash(this);
  }

  setPosition(pos) {
    this.position.copy(pos);
    this.meshGroup.position.copy(pos);
  }

  takeDamage(amount, source = 'generic') {
    if (this.isBusted) return;

    let dmg = amount;
    if (this.armor > 0) {
      if (this.armor >= dmg) {
        this.armor -= dmg;
        dmg = 0;
      } else {
        dmg -= this.armor;
        this.armor = 0;
      }
    }

    this.health = Math.max(0, this.health - dmg);
    if (window.soundManager) window.soundManager.playTaserSound();
    if (window.gameUI) window.gameUI.updateHUD();

    if (this.wantedStars >= 1 && this.health <= 10) {
      this.health = 10;
      if (window.game && !this.isBusted) {
        window.game.triggerBustedSequence();
      }
    } else if (this.health <= 0) {
      if (window.game && !this.isBusted) {
        window.game.triggerWastedSequence();
      }
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    if (window.gameUI) window.gameUI.updateHUD();
  }

  addArmor(amount) {
    this.armor = Math.min(this.maxArmor, (this.armor || 0) + amount);
    if (window.gameUI) window.gameUI.updateHUD();
  }

  respawnAt(pos) {
    this.health = this.maxHealth;
    this.armor = 0;
    this.wantedStars = 0;
    this.isBusted = false;
    this.isWeaponDrawn = false;
    this.isConcealed = true;
    this.currentWeaponKey = 'fists';
    this.velocity.set(0, 0, 0);
    this.setPosition(pos);
    this.buildFpsViewModel();
    this.updateWeaponVisibility();
    if (window.gameUI) {
      window.gameUI.updateHUD();
      window.gameUI.updateHolsterHUD(false);
    }
  }

  update(delta, input) {
    // 1. Vehicle Driving Follow
    if (this.vehicleManager.activeVehicle) {
      this.meshGroup.visible = false;
      this.fpsWeaponGroup.visible = false;
      const v = this.vehicleManager.activeVehicle;

      this.position.copy(v.group.position);
      this.meshGroup.position.copy(v.group.position);
      this.heading = v.group.rotation.y;

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

      const headPos = this.position.clone().add(new THREE.Vector3(0, 1.75, 0));
      this.camera.position.copy(headPos);

      const lookDir = new THREE.Vector3(
        -Math.sin(this.heading) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        -Math.cos(this.heading) * Math.cos(this.pitch)
      );
      this.camera.lookAt(headPos.clone().add(lookDir));

      if (isMoving) {
        this.fpsWeaponGroup.position.x = Math.sin(this.animTime * 0.8) * 0.015;
        this.fpsWeaponGroup.position.y = Math.cos(this.animTime * 1.6) * 0.012;
      } else {
        this.fpsWeaponGroup.position.set(0, 0, 0);
      }
    } else {
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

    if (this.isAiming && this.weapons[this.currentWeaponKey].hasScope) {
      this.updateScopeDistanceReadout();
    }

    this.coolDownHeat(delta);

    if (this.isWeaponDrawn && this.pedestrianManager) {
      this.pedestrianManager.triggerPublicBrandishPanic(this.position);
    }
  }
}

window.Player = Player;
