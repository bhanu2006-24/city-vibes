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
      mouseDeltaX: 0,
      mouseDeltaY: 0,
      isMouseDown: false
    };

    this.initThree();
    this.initSystems();
    this.initInputListeners();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1118);
    this.scene.fog = new THREE.FogExp2(0x0a1118, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 20);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Required for smartphone camera snapshot!
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting & Day/Night Atmosphere
    this.ambientLight = new THREE.AmbientLight(0xddeeff, 0.6);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(80, 160, 100);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    const d = 120;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Blue night hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0x224466, 0x112233, 0.4);
    this.scene.add(this.hemiLight);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initSystems() {
    // 1. City World & Buildings
    this.world = new CityWorld(this.scene);
    this.world.generate();

    // 2. Vehicles
    this.vehicleManager = new VehicleManager(this.scene, this.world);
    this.vehicleManager.initDefaultVehicles();

    // 3. Pedestrians & Assassin Targets
    this.pedestrianManager = new PedestrianManager(this.scene, this.world);
    this.pedestrianManager.init();

    // 4. Player Character
    this.player = new Player(
      this.scene,
      this.camera,
      this.world,
      this.vehicleManager,
      this.pedestrianManager
    );

    // 5. Economy & Real Estate
    this.economy = new EconomyManager(this);

    // 6. Careers & Missions
    this.jobs = new JobManager(this);

    // 7. Smartphone Camera System
    this.cameraSystem = new CameraSystem(this);

    // 8. Game UI
    this.ui = new GameUI(this);
    window.gameUI = this.ui;
    window.game = this;

    // Initial balance update
    this.ui.updateBalance(this.economy.cash, this.economy.bank);

    // Start with pleasant intro notification
    setTimeout(() => {
      this.ui.showNotification(
        '🌟 Welcome to City Vibes! Press [E] to drive or enter shops. Press [C] to open your phone & camera!',
        'info',
        8000
      );
    }, 1000);
  }

  initInputListeners() {
    let isPointerLocked = false;

    // Pointer Lock on click (if not clicking UI)
    window.addEventListener('mousedown', e => {
      // Don't capture if clicking over UI panels or modals
      if (
        e.target.closest('#smartphone-modal') ||
        e.target.closest('.game-modal') ||
        e.target.closest('#hud-container') ||
        e.target.closest('.camera-viewfinder')
      ) {
        return;
      }

      window.soundManager.ensureContext();

      if (this.cameraSystem.isActive) {
        // Snap photo with smartphone camera!
        this.cameraSystem.capturePhoto();
      } else {
        // Attack / shoot weapon
        this.player.attack();
      }
    });

    window.addEventListener('mousemove', e => {
      if (document.pointerLockElement === document.body || e.buttons === 1 || e.buttons === 2) {
        this.input.mouseDeltaX = e.movementX || 0;
        this.input.mouseDeltaY = e.movementY || 0;
      }
    });

    // Keyboard bindings
    window.addEventListener('keydown', e => {
      window.soundManager.ensureContext();
      const code = e.code;

      if (code === 'KeyW' || code === 'ArrowUp') this.input.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.input.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.input.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.input.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.input.sprint = true;
      if (code === 'Space') {
        this.input.jump = true;
        this.input.handbrake = true;
      }

      // Enter / Exit Vehicle OR Interact with Landmark ('E' or 'F')
      if (code === 'KeyE' || code === 'KeyF') {
        this.handleInteraction();
      }

      // Smartphone Camera Toggle ('KeyC')
      if (code === 'KeyC') {
        this.cameraSystem.toggleCamera();
      }

      // Smartphone Shell Toggle ('KeyP')
      if (code === 'KeyP') {
        this.ui.togglePhone();
      }

      // Vehicle Siren Toggle ('KeyJ')
      if (code === 'KeyJ') {
        this.vehicleManager.toggleActiveSiren();
      }

      // Vehicle Horn ('KeyH')
      if (code === 'KeyH') {
        window.soundManager.playHorn();
      }

      // Next Radio Station ('KeyR')
      if (code === 'KeyR') {
        const station = window.soundManager.nextRadioStation();
        this.ui.showNotification(`📻 ${station.name}`, 'radio', 3000);
      }

      // Weapon switching ('Digit1', 'Digit2', 'Digit3')
      if (code === 'Digit1') {
        this.player.currentWeaponIdx = 0;
        this.ui.showNotification('Equipped: Unarmed / Fists', 'weapon');
      } else if (code === 'Digit2') {
        this.player.currentWeaponIdx = 1;
        this.ui.showNotification('Equipped: Silenced 9mm Pistol', 'weapon');
      } else if (code === 'Digit3') {
        this.player.currentWeaponIdx = 2;
        this.ui.showNotification('Equipped: Ghost Marksman Sniper', 'weapon');
      }

      // Close open modals with Escape
      if (code === 'Escape') {
        this.ui.closeAllModals();
        if (this.cameraSystem.isActive) this.cameraSystem.toggleCamera();
        if (this.ui.isPhoneOpen) this.ui.togglePhone();
      }
    });

    window.addEventListener('keyup', e => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.input.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.input.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.input.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.input.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.input.sprint = false;
      if (code === 'Space') {
        this.input.jump = false;
        this.input.handbrake = false;
      }
    });

    // Optional PointerLock request on canvas double click
    this.renderer.domElement.addEventListener('dblclick', () => {
      document.body.requestPointerLock();
    });
  }

  handleInteraction() {
    // 1. If currently driving a vehicle -> Exit Vehicle
    if (this.vehicleManager.activeVehicle) {
      this.vehicleManager.exitVehicle(this.player);
      return;
    }

    // 2. Check if near any vehicle -> Enter Vehicle
    const nearVehicle = this.vehicleManager.getNearestVehicle(this.player.position, 3.8);
    if (nearVehicle) {
      this.vehicleManager.enterVehicle(nearVehicle, this.player);
      return;
    }

    // 3. Check if near an interactive landmark (Hospital, Pizzeria, Taxi Depot, Guild, Shops, Properties)
    const nearSpot = this.world.getNearestInteractive(this.player.position, 5.0);
    if (nearSpot) {
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
      } else if (nearSpot.action === 'interact_property') {
        // Open Real Estate app on property
        this.ui.openPhoneApp('realestate');
        if (!this.ui.isPhoneOpen) this.ui.togglePhone();
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Player Character & Camera
    this.player.update(delta, this.input);

    // 2. Update Vehicle Physics & Active Driving
    this.vehicleManager.update(delta, this.input);

    // 3. Update Pedestrians, Traffic & Assassin Targets
    this.pedestrianManager.update(delta);

    // 4. Update World Visuals
    this.world.update(delta);

    // 5. Update Career & Mission Logic
    this.jobs.update(delta);

    // 6. Update Real Estate & Economy
    this.economy.update(delta);

    // 7. Update Smartphone Camera AI Tracking
    this.cameraSystem.update(delta);

    // 8. Update UI & Minimap
    this.ui.update(delta);

    // 9. Interaction Prompt Checking
    this.checkPrompts();

    // 10. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  checkPrompts() {
    if (this.vehicleManager.activeVehicle) {
      const v = this.vehicleManager.activeVehicle;
      const sirenText = v.spec.hasSiren ? ' | [J] Siren' : '';
      this.ui.showInteractionPrompt(`[E] Exit ${v.spec.name} | [H] Horn${sirenText} | [R] Radio`);
      return;
    }

    const nearVehicle = this.vehicleManager.getNearestVehicle(this.player.position, 3.8);
    if (nearVehicle) {
      this.ui.showInteractionPrompt(`[E] Drive ${nearVehicle.spec.name}`);
      return;
    }

    const nearSpot = this.world.getNearestInteractive(this.player.position, 5.0);
    if (nearSpot) {
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

