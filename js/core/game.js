// ============================================================
// CITY VIBES - MAIN GAME ENGINE LOOP & ORCHESTRATION
// ============================================================

class CityGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
      handbrake: false,
      turnLeft: false,
      turnRight: false,
      mouseDeltaX: 0,
      mouseDeltaY: 0,
      isMouseDown: false
    };

    this.isPointerLocked = false;
    this.initThree();
    this.initSystems();
    this.initInputListeners();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1118);
    this.scene.fog = new THREE.FogExp2(0x0a1118, 0.002);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
    this.camera.position.set(0, 5, 20);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initSystems() {
    // 1. GTA Island Open World & Buildings
    this.world = new World(this.scene);

    // 2. Vehicles
    this.vehicleManager = new VehicleManager(this.scene, this.world, this);
    this.vehicleManager.initDefaultVehicles();

    // 3. Pedestrians & Assassin Targets
    this.pedestrianManager = new PedestrianManager(this.scene, this.world);
    this.pedestrianManager.game = this;

    // 4. Player Character
    this.player = new Player(
      this.scene,
      this.camera,
      this.world,
      this.vehicleManager,
      this.pedestrianManager
    );

    // 5. Economy & Real Estate
    this.economy = new EconomySystem(this);

    // 6. Careers & Missions
    this.jobs = new JobManager(this);

    // 7. Smartphone Camera System
    this.cameraSystem = new CameraSystem(this);

    // 8. Game UI
    this.ui = new GameUI(this);
    window.gameUI = this.ui;
    window.game = this;

    this.ui.updateBalance(this.economy.cash, this.economy.bank);

    setTimeout(() => {
      this.ui.showNotification(
        '🌟 Welcome to City Vibes! Use WASD to walk, [E] to drive or enter shops. Press [P] or [C] for phone & camera!',
        'info',
        8000
      );
    }, 800);
  }

  initInputListeners() {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isDragging = false;

    window.addEventListener('contextmenu', e => e.preventDefault());

    this.renderer.domElement.addEventListener('mousedown', e => {
      if (window.soundManager) window.soundManager.ensureContext();
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      if (e.target.closest('#smartphone-modal') || e.target.closest('.game-modal') || (this.ui && this.ui.isMinimapMaximized)) {
        return;
      }

      // Right Click = Aim Scope / Iron Sights
      if (e.button === 2) {
        this.player.setScopeAim(true);
        return;
      }

      // Left Click = Fire / Snap Photo
      if (this.cameraSystem && this.cameraSystem.isActive) {
        this.cameraSystem.capturePhoto();
      } else {
        if (!this.vehicleManager.activeVehicle) {
          this.player.attack();
        }
      }

      if (!this.isPointerLocked && !this.ui.isPhoneOpen && !this.ui.activeModal && !this.ui.isMinimapMaximized) {
        try {
          this.renderer.domElement.requestPointerLock();
        } catch (err) {}
      }
    });

    window.addEventListener('mouseup', e => {
      isDragging = false;
      if (e.button === 2) {
        this.player.setScopeAim(false);
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    });

    window.addEventListener('mousemove', e => {
      if (this.isPointerLocked) {
        this.input.mouseDeltaX = e.movementX || 0;
        this.input.mouseDeltaY = e.movementY || 0;
      } else if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        this.input.mouseDeltaX = dx;
        this.input.mouseDeltaY = dy;
      }
    });

    window.addEventListener('keydown', e => {
      if (window.soundManager) window.soundManager.ensureContext();
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') this.input.forward = true;
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown') this.input.backward = true;
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') this.input.left = true;
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') this.input.right = true;

      if (code === 'KeyQ' || key === 'q') this.input.turnLeft = true;

      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.input.sprint = true;
      if (code === 'Space' || key === ' ') {
        this.input.jump = true;
        this.input.handbrake = true;
      }

      if (code === 'KeyF' || key === 'f') {
        const nearSpot = this.world.getNearestInteractive(this.player.position, 6.0);
        if (nearSpot && nearSpot.action === 'open_supermart') {
          this.economy.robStoreRegister('supermart');
          return;
        } else if (nearSpot && nearSpot.action === 'open_bank') {
          this.economy.robBankVault();
          return;
        }
        this.handleInteraction();
      } else if (code === 'KeyE' || key === 'e') {
        this.handleInteraction();
      }

      if (code === 'KeyV' || key === 'v') {
        this.player.toggleViewMode();
      }

      if (code === 'KeyG' || key === 'g') {
        this.player.toggleHolster();
      }

      if (code === 'KeyC' || key === 'c') {
        this.cameraSystem.toggleCamera();
      }

      if (code === 'KeyP' || key === 'p') {
        this.ui.togglePhone();
      }

      if (code === 'KeyJ' || key === 'j') {
        this.vehicleManager.toggleActiveSiren();
      }

      if (code === 'KeyH' || key === 'h') {
        window.soundManager.playHorn();
      }

      if (code === 'KeyR' || key === 'r') {
        const nextStation = (window.soundManager.currentStation + 1) % window.soundManager.stationNames.length;
        window.soundManager.setRadioStation(nextStation);
        this.ui.showNotification(`🎵 ${window.soundManager.stationNames[nextStation]}`, 'radio');
      }

      if (code === 'KeyM' || key === 'm') {
        this.ui.toggleMinimapMaximized();
      }

      if (code === 'Digit1') {
        this.player.currentWeaponKey = 'fists';
        this.player.isWeaponDrawn = false;
        this.player.isConcealed = true;
        this.player.updateWeaponVisibility();
        this.ui.updateHolsterHUD(false);
      } else if (code === 'Digit2' && this.player.ownedWeapons.includes('pistol_silenced')) {
        this.player.currentWeaponKey = 'pistol_silenced';
        this.player.isWeaponDrawn = true;
        this.player.isConcealed = false;
        this.player.buildFpsViewModel();
        this.player.updateWeaponVisibility();
        this.ui.updateHolsterHUD(true);
      } else if (code === 'Digit3' && this.player.ownedWeapons.includes('sniper_silenced')) {
        this.player.currentWeaponKey = 'sniper_silenced';
        this.player.isWeaponDrawn = true;
        this.player.isConcealed = false;
        this.player.buildFpsViewModel();
        this.player.updateWeaponVisibility();
        this.ui.updateHolsterHUD(true);
      }

      if (code === 'Escape') {
        this.ui.closeAllModals();
        if (this.ui.isPhoneOpen) this.ui.togglePhone();
        if (this.ui.isMinimapMaximized) this.ui.toggleMinimapMaximized(false);
        if (this.cameraSystem && this.cameraSystem.isActive) this.cameraSystem.toggleCamera();
        if (document.pointerLockElement) document.exitPointerLock();
      }
    });

    window.addEventListener('keyup', e => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') this.input.forward = false;
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown') this.input.backward = false;
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') this.input.left = false;
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') this.input.right = false;
      if (code === 'KeyQ' || key === 'q') this.input.turnLeft = false;

      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.input.sprint = false;
      if (code === 'Space' || key === ' ') {
        this.input.jump = false;
        this.input.handbrake = false;
      }
    });
  }

  handleInteraction() {
    if (this.vehicleManager.activeVehicle) {
      this.vehicleManager.exitVehicle(this.player);
      return;
    }

    const nearVehicle = this.vehicleManager.getNearestVehicle(this.player.position, 4.2);
    if (nearVehicle) {
      this.vehicleManager.enterVehicle(nearVehicle, this.player);
      return;
    }

    const nearSpot = this.world.getNearestInteractive(this.player.position, 5.2);
    if (nearSpot) {
      if (nearSpot.action === 'teleport' || nearSpot.action === 'teleport_heal') {
        if (nearSpot.targetPos) {
          this.player.setPosition(nearSpot.targetPos);
          this.player.velocity.set(0, 0, 0);
          if (nearSpot.action === 'teleport_heal') {
            this.player.health = this.player.maxHealth;
            if (window.soundManager) window.soundManager.playCashSound();
            this.ui.showNotification('🛌 Rested in Luxury Penthouse Safehouse: 100% HP Restored!', 'success', 5000);
          } else {
            if (window.soundManager) window.soundManager.playNotification(true);
            this.ui.showNotification(`🛗 ${nearSpot.name}`, 'info', 4000);
          }
        }
        return;
      }
      if (nearSpot.action === 'ambulance_job') {
        this.jobs.startAmbulanceShift();
      } else if (nearSpot.action === 'delivery_job') {
        this.jobs.startDeliveryShift();
      } else if (nearSpot.action === 'taxi_job') {
        this.jobs.startTaxiShift();
      } else if (nearSpot.action === 'open_guild') {
        this.ui.openGuildModal();
      } else if (nearSpot.action === 'open_cardealer') {
        this.ui.openCarDealerModal();
      } else if (nearSpot.action === 'open_clothes') {
        this.ui.openClothesModal();
      } else if (nearSpot.action === 'open_armory') {
        this.ui.openArmoryModal();
      } else if (nearSpot.action === 'open_mechanic') {
        this.ui.openMechanicModal();
      } else if (nearSpot.action === 'open_supermart') {
        this.ui.openSuperMartModal();
      } else if (nearSpot.action === 'open_bank') {
        this.economy.robBankVault();
      } else if (nearSpot.action === 'open_bank_atm') {
        this.ui.openBankATMModal();
      } else if (nearSpot.action === 'open_construction') {
        this.ui.openConstructionModal();
      } else if (nearSpot.action === 'buy_property_onsite') {
        this.economy.buyPropertyOnSite(nearSpot.propertyId);
      } else if (nearSpot.action === 'interact_property') {
        this.ui.openPhoneApp('realestate');
        if (!this.ui.isPhoneOpen) this.ui.togglePhone();
      }
    }
  }

  triggerBustedSequence() {
    if (this.player.isBusted) return;
    this.player.isBusted = true;

    if (this.vehicleManager.activeVehicle) {
      this.vehicleManager.exitVehicle(this.player);
    }

    if (window.soundManager) {
      window.soundManager.playHandcuffsSound();
      window.soundManager.playBustedJingle();
    }

    const fine = Math.min(this.economy.cash, 1200);
    this.economy.cash -= fine;
    this.economy.updateBalanceUI();

    this.ui.showBustedScreen();

    if (this.pedestrianManager) {
      this.pedestrianManager.removePoliceCruiser();
      this.pedestrianManager.removePoliceOfficer();
    }

    setTimeout(() => {
      this.ui.hideBustedScreen();
      const respawnPos = new THREE.Vector3(0, 1.2, 100);
      this.player.respawnAt(respawnPos);
      this.ui.showNotification('⚖️ Released from Central Police Precinct. Weapons confiscated. Civilian cover restored.', 'info', 6000);
    }, 4000);
  }

  triggerWastedSequence() {
    if (this.player.isBusted) return;
    this.player.isBusted = true;

    if (this.vehicleManager.activeVehicle) {
      this.vehicleManager.exitVehicle(this.player);
    }

    if (window.soundManager) {
      window.soundManager.playNotification(false);
    }

    const hospitalBill = Math.min(this.economy.cash, 500);
    this.economy.cash -= hospitalBill;
    this.economy.updateBalanceUI();

    this.ui.showWastedScreen();

    if (this.pedestrianManager) {
      this.pedestrianManager.removePoliceCruiser();
      this.pedestrianManager.removePoliceOfficer();
    }

    setTimeout(() => {
      this.ui.hideWastedScreen();
      const hospPos = new THREE.Vector3(-39, 1.2, 100);
      this.player.respawnAt(hospPos);
      this.ui.showNotification('🏥 Discharged from St. Jude Hospital ER with full health (-$500).', 'info', 6000);
    }, 4000);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.08);

    // 1. Update Player Character & Movement
    this.player.update(delta, this.input);

    // 2. Update Vehicle Physics & Driving
    this.vehicleManager.update(delta, this.input);

    // 3. Update Pedestrians, Traffic & Assassin Targets
    this.pedestrianManager.update(delta);

    // 4. Update World Visuals & Beacons
    const playerPos = this.vehicleManager.activeVehicle
      ? this.vehicleManager.activeVehicle.group.position
      : this.player.position;
    this.world.update(delta, playerPos);

    // 5. Update Career & Mission Logic
    this.jobs.update(delta);

    // 6. Update Real Estate & Economy
    this.economy.update(delta);

    // 7. Update Smartphone Camera AI
    if (this.cameraSystem) {
      this.cameraSystem.update(delta);
    }

    // 8. Update UI & Minimap
    this.ui.update(delta);

    // 9. Prompt Checking
    this.checkPrompts();

    // 10. Render
    this.renderer.render(this.scene, this.camera);
  }

  checkPrompts() {
    if (this.vehicleManager.activeVehicle) {
      const v = this.vehicleManager.activeVehicle;
      const sirenText = v.spec.hasSiren ? ' | [J] Siren' : '';
      const nitroText = v.hasNitro ? ` | [Shift] NOS (${Math.floor(v.nitroFuel)}%)` : '';
      this.ui.showInteractionPrompt(`[E] Exit ${v.spec.name} | [H] Horn${sirenText}${nitroText} | [R] Radio`);
      return;
    }

    const nearVehicle = this.vehicleManager.getNearestVehicle(this.player.position, 4.2);
    if (nearVehicle) {
      const actionText = nearVehicle.isTrafficCar ? `[E] Commandeer / Hijack ${nearVehicle.spec.name}` : `[E] Drive ${nearVehicle.spec.name}`;
      this.ui.showInteractionPrompt(actionText);
      return;
    }

    const nearSpot = this.world.getNearestInteractive(this.player.position, 5.2);
    if (nearSpot) {
      if (nearSpot.action === 'teleport' || nearSpot.action === 'teleport_heal') {
        this.ui.showInteractionPrompt(`[E] ${nearSpot.name}`);
        return;
      }
      if (nearSpot.action === 'open_supermart') {
        this.ui.showInteractionPrompt(`[E] Enter Store | [F] Rob Cashier`);
        return;
      }
      if (nearSpot.action === 'open_bank') {
        this.ui.showInteractionPrompt(`[E] or [F] Crack Bank Vault Heist`);
        return;
      }
      if (nearSpot.action === 'open_bank_atm') {
        this.ui.showInteractionPrompt(`[E] Use First National ATM / Teller`);
        return;
      }
      if (nearSpot.action === 'open_construction') {
        this.ui.showInteractionPrompt(`[E] Enter Apex Construction Co. (Property Renovations)`);
        return;
      }
      if (nearSpot.action === 'buy_property_onsite') {
        const prop = this.economy.properties[nearSpot.propertyId];
        if (prop && prop.owned) {
          this.ui.showInteractionPrompt(`🏢 ${prop.name} (OWNED - Lv. ${prop.level})`);
        } else {
          this.ui.showInteractionPrompt(`[E] Purchase Deed: ${nearSpot.name}`);
        }
        return;
      }
      this.ui.showInteractionPrompt(`[E] Enter ${nearSpot.name}`);
      return;
    }

    this.ui.hideInteractionPrompt();
  }
}

// Boot up game once DOM loads
window.addEventListener('DOMContentLoaded', () => {
  new CityGame();
});

