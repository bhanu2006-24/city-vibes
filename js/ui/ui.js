// ============================================================
// CITY VIBES - UNIFIED GAME USER INTERFACE (GameUI)
// ============================================================

class GameUI {
  constructor(game) {
    this.game = game;

    // Minimap Radar Canvas
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.minimapWrapper = document.getElementById('hud-minimap-wrapper');
    this.isMinimapMaximized = false;

    // Smartphone
    this.isPhoneOpen = false;
    this.phoneModal = document.getElementById('smartphone-modal');
    this.currentApp = 'home';

    this.activeModal = null;
    this.welcomeTimer = null;
    this.seaTimer = null;

    // Initialize HUD elements
    window.GameHUD.init(this);
    this.initEventListeners();
  }

  initEventListeners() {
    const phoneToggleBtn = document.getElementById('phone-toggle-btn');
    if (phoneToggleBtn) {
      phoneToggleBtn.addEventListener('click', () => this.togglePhone());
    }

    const homeBtn = document.getElementById('phone-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.openPhoneApp('home'));
    }

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    const mapToggleBtn = document.getElementById('minimap-toggle-btn');
    if (mapToggleBtn) {
      mapToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMinimapMaximized();
      });
    }

    if (this.minimapWrapper) {
      this.minimapWrapper.addEventListener('click', (e) => {
        if (!this.isMinimapMaximized) {
          this.toggleMinimapMaximized(true);
        }
      });
    }

    if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('click', (e) => {
        if (this.isMinimapMaximized) {
          e.stopPropagation();
          window.MinimapSystem.handleMaximizedMapClick(this, e);
        }
      });
    }
  }

  showNotification(text, type = 'info', duration = 4000) {
    window.GameHUD.showNotification(this, text, type, duration);
  }

  updateBalance(cash, bank) {
    window.GameHUD.updateBalance(this, cash, bank);
  }

  updatePlayerHUD(player) {
    window.GameHUD.updatePlayerHUD(this, player);
  }

  updateHUD() {
    this.updatePlayerHUD(this.game.player);
    this.updateBalance(this.game.economy.cash, this.game.economy.bank);
  }

  updateVehicleHUD(vehicle) {
    window.GameHUD.updateVehicleHUD(this, vehicle);
  }

  hideVehicleHUD() {
    window.GameHUD.hideVehicleHUD(this);
  }

  showInteractionPrompt(text) {
    window.GameHUD.showInteractionPrompt(this, text);
  }

  hideInteractionPrompt() {
    window.GameHUD.hideInteractionPrompt(this);
  }

  updateJobHUD(mission) {
    window.GameHUD.updateJobHUD(this, mission);
  }

  hideJobHUD() {
    window.GameHUD.hideJobHUD(this);
  }

  updateWantedHUD(stars) {
    window.GameHUD.updateWantedHUD(stars);
  }

  updateViewModeHUD(mode) {
    window.GameHUD.updateViewModeHUD(mode);
  }

  updateHolsterHUD(isDrawn) {
    window.GameHUD.updateHolsterHUD(isDrawn);
  }

  showCityWelcome(name, tagline) {
    window.GameHUD.showCityWelcome(this, name, tagline);
  }

  showSeaWarning() {
    window.GameHUD.showSeaWarning(this);
  }

  // Smartphone
  togglePhone() {
    this.isPhoneOpen = !this.isPhoneOpen;
    if (this.phoneModal) {
      this.phoneModal.classList.toggle('active', this.isPhoneOpen);
    }
    if (this.isPhoneOpen) {
      this.openPhoneApp(this.currentApp || 'home');
      if (window.soundManager) window.soundManager.playNotification(true);
    }
    return this.isPhoneOpen;
  }

  openPhoneApp(appName) {
    this.currentApp = appName;
    const bodyEl = document.getElementById('phone-screen-content');
    if (!bodyEl) return;

    if (appName === 'home') {
      window.PhoneSystem.renderHome(bodyEl);
    } else if (appName === 'map') {
      window.PhoneSystem.renderMap(this.game, bodyEl);
    } else if (appName === 'jobs') {
      window.PhoneSystem.renderJobs(this.game, bodyEl);
    } else if (appName === 'realestate') {
      window.PhoneSystem.renderRealEstate(this.game, bodyEl);
    } else if (appName === 'guild') {
      window.PhoneSystem.renderGuild(this.game, bodyEl);
    } else if (appName === 'garage') {
      window.PhoneSystem.renderGarage(this.game, bodyEl);
    } else if (appName === 'radio') {
      window.PhoneSystem.renderRadio(bodyEl);
    } else if (appName === 'gallery') {
      window.PhoneSystem.renderGallery(this.game, bodyEl);
    } else if (appName === 'bank') {
      window.PhoneSystem.renderBank(this.game, bodyEl);
    } else if (appName === 'avatar') {
      window.PhoneSystem.renderAvatar(this.game, bodyEl);
    } else if (appName === 'camera') {
      this.togglePhone();
      this.game.cameraSystem.toggleCamera();
    }
  }

  // Modals
  closeAllModals() {
    window.ModalsSystem.closeAll(this);
  }

  openBankATMModal() {
    window.ModalsSystem.openBankATM(this);
  }

  openConstructionModal() {
    window.ModalsSystem.openConstruction(this);
  }

  openMechanicModal() {
    window.ModalsSystem.openMechanic(this);
  }

  openCarDealerModal() {
    window.ModalsSystem.openCarDealer(this);
  }

  openClothesModal() {
    window.ModalsSystem.openClothes(this);
  }

  openArmoryModal() {
    window.ModalsSystem.openArmory(this);
  }

  openGuildModal() {
    this.openPhoneApp('guild');
    if (!this.isPhoneOpen) this.togglePhone();
  }

  openSuperMartModal() {
    window.ModalsSystem.openSuperMart(this);
  }

  showBountyRewardModal(target) {
    window.ModalsSystem.showBountyReward(this, target);
  }

  showBustedScreen() {
    window.ModalsSystem.showBusted(this);
  }

  hideBustedScreen() {
    window.ModalsSystem.hideBusted(this);
  }

  showWastedScreen() {
    window.ModalsSystem.showWasted(this);
  }

  hideWastedScreen() {
    window.ModalsSystem.hideWasted(this);
  }

  // Minimap
  toggleMinimapMaximized(forceState = null) {
    if (forceState !== null) {
      this.isMinimapMaximized = forceState;
    } else {
      this.isMinimapMaximized = !this.isMinimapMaximized;
    }

    if (this.minimapWrapper) {
      this.minimapWrapper.classList.toggle('maximized', this.isMinimapMaximized);
    }

    const toggleBtn = document.getElementById('minimap-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerText = this.isMinimapMaximized ? '🗗' : '⤢';
      toggleBtn.title = this.isMinimapMaximized ? 'Minimize Map (Press M)' : 'Maximize Map (Press M)';
    }

    if (this.minimapCanvas) {
      if (this.isMinimapMaximized) {
        const fullSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 720);
        this.minimapCanvas.width = fullSize;
        this.minimapCanvas.height = fullSize;
      } else {
        this.minimapCanvas.width = 190;
        this.minimapCanvas.height = 190;
      }
    }

    if (window.soundManager) window.soundManager.playNotification(true);
  }

  drawMinimap() {
    window.MinimapSystem.drawMinimap(this);
  }

  update(delta) {
    this.updatePlayerHUD(this.game.player);
    if (this.game.vehicleManager.activeVehicle) {
      this.updateVehicleHUD(this.game.vehicleManager.activeVehicle);
    }
    this.drawMinimap();
  }
}

window.GameUI = GameUI;
