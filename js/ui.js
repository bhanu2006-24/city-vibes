// ============================================================
// CITY VIBES - COMPLETE UI CONTROLLER
// Minimap, HUD, In-Game Smartphone, Modals & Tuning Workshop
// ============================================================

class GameUI {
  constructor(game) {
    this.game = game;

    // Minimap
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.minimapWrapper = document.getElementById('minimap-container');
    this.isMinimapMaximized = false;

    // HUD Elements
    this.cashEl = document.getElementById('hud-cash');
    this.bankEl = document.getElementById('hud-bank');
    this.healthBarEl = document.getElementById('hud-health-fill');
    this.armorBarEl = document.getElementById('hud-armor-fill');
    this.speedoEl = document.getElementById('hud-speedometer');
    this.speedValueEl = document.getElementById('speed-value');
    this.nitroBarEl = document.getElementById('hud-nitro-fill');
    this.interactPromptEl = document.getElementById('hud-interact-prompt');
    this.notificationContainer = document.getElementById('notification-container');
    this.jobHudEl = document.getElementById('hud-job-card');
    this.jobTitleEl = document.getElementById('job-card-title');
    this.jobDescEl = document.getElementById('job-card-desc');
    this.jobTimerEl = document.getElementById('job-card-timer');

    // Smartphone
    this.phoneModal = document.getElementById('smartphone-modal');
    this.isPhoneOpen = false;
    this.currentApp = 'home';

    // Modals
    this.activeModal = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Smartphone toggle button
    const phoneBtn = document.getElementById('phone-toggle-btn');
    if (phoneBtn) {
      phoneBtn.addEventListener('click', () => this.togglePhone());
    }

    // Phone Home Bar / Back button
    const homeBtn = document.getElementById('phone-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.openPhoneApp('home'));
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Minimap Toggle & Maximize Events
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
          this.handleMaximizedMapClick(e);
        }
      });
    }
  }

  // ------------------------------------------------------------
  // NOTIFICATIONS & HUD
  // ------------------------------------------------------------

  showNotification(text, type = 'info', duration = 4000) {
    if (!this.notificationContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = text;
    this.notificationContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  updateBalance(cash, bank) {
    if (this.cashEl) this.cashEl.innerText = `$${cash.toLocaleString()}`;
    if (this.bankEl) this.bankEl.innerText = `$${bank.toLocaleString()}`;
  }

  updatePlayerHUD(player) {
    if (this.healthBarEl) {
      const hpPercent = Math.max(0, (player.health / player.maxHealth) * 100);
      this.healthBarEl.style.width = `${hpPercent}%`;
    }
    if (this.armorBarEl) {
      this.armorBarEl.style.width = `${player.armor || 0}%`;
    }
  }

  updateHUD() {
    this.updatePlayerHUD(this.game.player);
    this.updateBalance(this.game.economy.cash, this.game.economy.bank);
  }

  updateVehicleHUD(vehicle) {
    if (!this.speedoEl) return;
    this.speedoEl.style.display = 'flex';
    const mph = Math.floor(Math.abs(vehicle.speed) * 2.3);
    if (this.speedValueEl) this.speedValueEl.innerText = mph;

    if (this.nitroBarEl) {
      const nitroContainer = this.nitroBarEl.parentElement;
      if (vehicle.hasNitro) {
        nitroContainer.style.display = 'block';
        this.nitroBarEl.style.width = `${Math.floor(vehicle.nitroFuel)}%`;
      } else {
        nitroContainer.style.display = 'none';
      }
    }
  }

  hideVehicleHUD() {
    if (this.speedoEl) this.speedoEl.style.display = 'none';
  }

  showInteractionPrompt(text) {
    if (this.interactPromptEl) {
      this.interactPromptEl.innerHTML = text;
      this.interactPromptEl.style.display = 'block';
    }
  }

  hideInteractionPrompt() {
    if (this.interactPromptEl) {
      this.interactPromptEl.style.display = 'none';
    }
  }

  updateJobHUD(mission) {
    if (!this.jobHudEl) return;
    this.jobHudEl.style.display = 'block';

    if (mission.type === 'ambulance') {
      this.jobTitleEl.innerHTML = '🚑 AMBULANCE EMERGENCY';
      this.jobDescEl.innerHTML =
        mission.stage === 'pickup'
          ? `Proceed to: <span style="color:#00f0ff;">${mission.locationName}</span>`
          : `Rush patient to: <span style="color:#2ecc71;">St. Jude Hospital ER</span>`;
      if (this.jobTimerEl) {
        this.jobTimerEl.innerHTML = `⏱️ TIME: ${Math.ceil(mission.timeLeft)}s`;
      }
    } else if (mission.type === 'delivery') {
      this.jobTitleEl.innerHTML = '🍕 PIZZA EXPRESS DELIVERY';
      this.jobDescEl.innerHTML =
        mission.stage === 'pickup_order'
          ? `Collect order at: <span style="color:#f39c12;">Luigi's Pizzeria</span>`
          : `Deliver to customer: <span style="color:#00f0ff;">${mission.customerName}</span>`;
      if (this.jobTimerEl) {
        this.jobTimerEl.innerHTML = `🔥 FRESHNESS: ${Math.ceil(mission.timeLeft)}s`;
      }
    } else if (mission.type === 'taxi') {
      this.jobTitleEl.innerHTML = '🚖 METRO CAB FARE';
      this.jobDescEl.innerHTML =
        mission.stage === 'pickup_passenger'
          ? `Pick up rider at: <span style="color:#f1c40f;">${mission.pickupName}</span>`
          : `Drop rider off at: <span style="color:#2ecc71;">${mission.dropoffName}</span>`;
      if (this.jobTimerEl) {
        this.jobTimerEl.innerHTML = `💰 FARE: $${mission.fare}`;
      }
    }
  }

  hideJobHUD() {
    if (this.jobHudEl) this.jobHudEl.style.display = 'none';
  }

  // ------------------------------------------------------------
  // IN-GAME SMARTPHONE ("VIBEPHONE 16 PRO")
  // ------------------------------------------------------------

  togglePhone() {
    this.isPhoneOpen = !this.isPhoneOpen;
    if (this.phoneModal) {
      this.phoneModal.classList.toggle('active', this.isPhoneOpen);
    }
    if (this.isPhoneOpen) {
      this.openPhoneApp(this.currentApp || 'home');
      window.soundManager.playNotification(true);
    }
    return this.isPhoneOpen;
  }

  openPhoneApp(appName) {
    this.currentApp = appName;
    const bodyEl = document.getElementById('phone-screen-content');
    if (!bodyEl) return;

    if (appName === 'home') {
      bodyEl.innerHTML = `
        <div class="phone-home-grid">
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('camera')">
            <div class="icon-box icon-cam">📸</div>
            <span>Camera</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('jobs')">
            <div class="icon-box icon-jobs">💼</div>
            <span>Careers</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('realestate')">
            <div class="icon-box icon-prop">🏢</div>
            <span>Properties</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('guild')">
            <div class="icon-box icon-guild">🕷️</div>
            <span>Dark Web</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('avatar')">
            <div class="icon-box icon-avatar">👤</div>
            <span>Creator</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('garage')">
            <div class="icon-box icon-garage">🚗</div>
            <span>Garage</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('radio')">
            <div class="icon-box icon-radio">🎵</div>
            <span>City Radio</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('gallery')">
            <div class="icon-box icon-gallery">🖼️</div>
            <span>Gallery</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('map')">
            <div class="icon-box" style="background: linear-gradient(135deg, #0984e3, #00cec9);">🗺️</div>
            <span>CityMaps</span>
          </div>
          <div class="phone-app-icon" onclick="window.gameUI.openPhoneApp('bank')">
            <div class="icon-box icon-bank">🏦</div>
            <span>Bank</span>
          </div>
        </div>
      `;
    } else if (appName === 'map') {
      const world = this.game.world;
      const playerPos = this.game.player.position;
      let citiesHtml = '';
      if (world && world.cities) {
        Object.values(world.cities).forEach(c => {
          const dist = Math.round(playerPos.distanceTo(c.center));
          const isCurrent = (world.currentCityId === c.id);
          citiesHtml += `
            <div class="phone-card" style="border-left: 4px solid #${c.color.toString(16).padStart(6, '0')}; margin-bottom: 8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:13px; color:#fff;">${c.name}</h4>
                  <p style="font-size:11px; color:#94a3b8; margin:2px 0;">${c.tagline}</p>
                  <span style="font-size:11px; color:#00f0ff;">📍 Dist: ${dist}m ${isCurrent ? '<strong style="color:#2ecc71;">(HERE)</strong>' : ''}</span>
                </div>
                ${isCurrent ? '<span style="color:#2ecc71; font-size:11px; font-weight:bold;">CURRENT</span>' : `
                  <button class="btn btn-sm btn-primary" onclick="window.game.economy.fastTravelTaxi('${c.id}')">
                    🚖 Taxi ($200)
                  </button>
                `}
              </div>
            </div>
          `;
        });
      }
      bodyEl.innerHTML = `
        <div class="phone-app-header"><h3>🗺️ CityMaps GPS (30K x 30K)</h3></div>
        <p style="font-size:11px; color:#94a3b8; margin: 4px 12px 10px;">Select any city across the territory to call a fast-travel taxi ($200)!</p>
        <div class="phone-list">
          ${citiesHtml}
        </div>
      `;
    } else if (appName === 'camera') {
      this.togglePhone();
      this.game.cameraSystem.toggleCamera();
    } else if (appName === 'avatar') {
      this.renderCharacterCreatorInPhone(bodyEl);
    } else if (appName === 'jobs') {
      bodyEl.innerHTML = `
        <div class="phone-app-header"><h3>💼 City Careers</h3></div>
        <div class="phone-list">
          <div class="phone-card">
            <h4>🚑 St. Jude Paramedic</h4>
            <p>Rush injured citizens to the ER with your siren blazing.</p>
            <button class="btn btn-primary" onclick="window.game.jobs.startAmbulanceShift(); window.gameUI.togglePhone();">Start Shift</button>
          </div>
          <div class="phone-card">
            <h4>🍕 Luigi's Delivery Boy</h4>
            <p>Pick up hot pizzas and parcels, deliver for fast tips.</p>
            <button class="btn btn-warning" onclick="window.game.jobs.startDeliveryShift(); window.gameUI.togglePhone();">Start Shift</button>
          </div>
          <div class="phone-card">
            <h4>🚖 Metro Cab Driver</h4>
            <p>Hailing passengers need rides to downtown hotspots.</p>
            <button class="btn btn-warning" onclick="window.game.jobs.startTaxiShift(); window.gameUI.togglePhone();">Start Shift</button>
          </div>
          ${
            this.game.jobs.currentJob
              ? `<button class="btn btn-danger" style="margin-top:10px;" onclick="window.game.jobs.cancelCurrentJob()">Quit Current Shift</button>`
              : ''
          }
        </div>
      `;
    } else if (appName === 'realestate') {
      const props = Object.values(this.game.economy.properties);
      let html = `<div class="phone-app-header"><h3>🏢 Real Estate Empire</h3></div><div class="phone-list">`;
      props.forEach(p => {
        html += `
          <div class="phone-card">
            <div style="display:flex; justify-content:space-between;">
              <strong>${p.name}</strong>
              <span class="badge ${p.owned ? 'badge-owned' : ''}">${p.owned ? 'OWNED' : '$' + p.price.toLocaleString()}</span>
            </div>
            <p style="font-size:12px; margin:4px 0;">${p.desc}</p>
            <p style="font-size:12px; color:#2ecc71;">Rent Yield: <strong>+$${p.rentIncome}/cycle</strong> (Lv. ${p.level})</p>
            ${
              p.owned
                ? `
              <div style="display:flex; gap:6px; margin-top:6px;">
                <button class="btn btn-sm ${p.isRented ? 'btn-success' : 'btn-secondary'}" onclick="window.game.economy.togglePropertyRent('${p.id}'); window.gameUI.openPhoneApp('realestate');">
                  ${p.isRented ? 'Leased (Rented Out)' : 'Safehouse (Private)'}
                </button>
                <button class="btn btn-sm btn-info" onclick="window.game.economy.upgradeProperty('${p.id}'); window.gameUI.openPhoneApp('realestate');">
                  Renovate ($${p.renovationCost.toLocaleString()})
                </button>
              </div>`
                : `<button class="btn btn-sm btn-primary" onclick="window.game.economy.buyProperty('${p.id}'); window.gameUI.openPhoneApp('realestate');">Buy Property</button>`
            }
          </div>
        `;
      });
      html += `</div>`;
      bodyEl.innerHTML = html;
    } else if (appName === 'guild') {
      const contracts = this.game.jobs.assassinContracts;
      let html = `
        <div class="phone-app-header dark-header"><h3>🕷️ The Black Lotus (Dark Web)</h3></div>
        <div class="phone-list">
          <p style="font-size:11px; color:#aaa; margin-bottom:8px;">Eliminate target. Snap photo of fallen body with Camera (C) to claim bounty.</p>
      `;
      contracts.forEach(c => {
        html += `
          <div class="phone-card guild-card ${c.completed ? 'completed' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:#ff3355;">${c.targetName}</strong>
              <span class="bounty-tag">$${c.bounty.toLocaleString()}</span>
            </div>
            <div style="font-size:11px; color:#aaa;">${c.title}</div>
            <p style="font-size:12px; margin:5px 0;">${c.desc}</p>
            ${
              c.completed
                ? `<span style="color:#2ecc71; font-weight:bold;">✅ ELIMINATED & BOUNTY CLAIMED</span>`
                : c.status === 'active'
                ? `<span style="color:#f1c40f; font-weight:bold;">⚡ CONTRACT ACTIVE - IN PURSUIT</span>`
                : `<button class="btn btn-danger btn-sm" onclick="window.game.jobs.acceptAssassinContract('${c.id}'); window.gameUI.openPhoneApp('guild');">Accept Hit</button>`
            }
          </div>
        `;
      });
      html += `</div>`;
      bodyEl.innerHTML = html;
    } else if (appName === 'garage') {
      const owned = this.game.economy.ownedVehicles;
      const specs = this.game.vehicleManager.specs;
      let html = `<div class="phone-app-header"><h3>🚗 Personal Garage</h3></div><div class="phone-list">`;
      owned.forEach(key => {
        const spec = specs[key] || {};
        html += `
          <div class="phone-card">
            <div style="display:flex; justify-content:space-between;">
              <strong>${spec.name}</strong>
              <span style="font-size:12px; color:#00f0ff;">Top: ${Math.floor(spec.maxSpeed * 2.3)} MPH</span>
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick="window.game.economy.summonVehicle('${key}'); window.gameUI.togglePhone();">Summon Vehicle Here</button>
          </div>
        `;
      });
      html += `</div>`;
      bodyEl.innerHTML = html;
    } else if (appName === 'radio') {
      const radio = window.soundManager;
      bodyEl.innerHTML = `
        <div class="phone-app-header"><h3>🎵 City Radio Stations</h3></div>
        <div class="phone-list">
          <div class="phone-card radio-card" onclick="window.soundManager.setRadioStation(1); window.gameUI.openPhoneApp('radio');">
            <h4>📻 98.5 NEON NIGHTS</h4>
            <p>80s Synthwave, arpeggiated basslines & retro sunset chords.</p>
            ${radio.currentStation === 1 ? '<span class="now-playing">▶ NOW PLAYING</span>' : ''}
          </div>
          <div class="phone-card radio-card" onclick="window.soundManager.setRadioStation(2); window.gameUI.openPhoneApp('radio');">
            <h4>☕ 104.2 LO-FI VIBES</h4>
            <p>Chill jazz 7th chords, relaxed street vibes & mellow beats.</p>
            ${radio.currentStation === 2 ? '<span class="now-playing">▶ NOW PLAYING</span>' : ''}
          </div>
          <div class="phone-card radio-card" onclick="window.soundManager.setRadioStation(3); window.gameUI.openPhoneApp('radio');">
            <h4>⚡ 107.9 CYBER PULSE</h4>
            <p>Hard-hitting driving techno, acid synths & club energy.</p>
            ${radio.currentStation === 3 ? '<span class="now-playing">▶ NOW PLAYING</span>' : ''}
          </div>
          <div class="phone-card radio-card" onclick="window.soundManager.setRadioStation(0); window.gameUI.openPhoneApp('radio');">
            <h4>🔇 Turn Radio Off</h4>
            ${radio.currentStation === 0 ? '<span class="now-playing">▶ OFF</span>' : ''}
          </div>
        </div>
      `;
    } else if (appName === 'gallery') {
      const photos = this.game.cameraSystem.capturedPhotos;
      let html = `<div class="phone-app-header"><h3>🖼️ Photo Gallery</h3></div><div class="phone-list">`;
      if (photos.length === 0) {
        html += `<p style="text-align:center; color:#888; margin-top:20px;">No photos taken yet. Press C to open camera!</p>`;
      } else {
        photos.forEach(p => {
          html += `
            <div class="phone-photo-item">
              <img src="${p.image}" class="photo-thumb" />
              <div style="font-size:11px; margin-top:4px;">
                ${p.targetName ? `<strong style="color:#2ecc71;">Target: ${p.targetName}</strong>` : 'City Snapshot'}
                <br><span style="color:#888;">${p.timestamp}</span>
              </div>
            </div>
          `;
        });
      }
      html += `</div>`;
      bodyEl.innerHTML = html;
    } else if (appName === 'bank') {
      bodyEl.innerHTML = `
        <div class="phone-app-header"><h3>🏦 First City Bank</h3></div>
        <div class="phone-list">
          <div class="phone-card">
            <div>Wallet Cash: <strong style="color:#2ecc71;">$${this.game.economy.cash.toLocaleString()}</strong></div>
            <div>Bank Balance: <strong style="color:#3498db;">$${this.game.economy.bank.toLocaleString()}</strong></div>
          </div>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="btn btn-primary" onclick="window.game.economy.cash += 100000 ; window.game.economy.bank -= 100000; window.gameUI.updateBalance(window.game.economy.cash, window.game.economy.bank); window.gameUI.openPhoneApp('bank');">Withdraw $100K</button>
            <button class="btn btn-success" onclick="if(window.game.economy.cash>=100000){window.game.economy.cash-=100000; window.game.economy.bank+=100000; window.gameUI.updateBalance(window.game.economy.cash, window.game.economy.bank); window.gameUI.openPhoneApp('bank');}">Deposit $100K</button>
          </div>
        </div>
      `;
    }
  }

  // ------------------------------------------------------------
  // CHARACTER BUILDER & CUSTOMIZER
  // ------------------------------------------------------------

  renderCharacterCreatorInPhone(container) {
    const p = this.game.player;
    container.innerHTML = `
      <div class="phone-app-header"><h3>👤 Character Studio</h3></div>
      <div class="phone-list">
        <div class="phone-card">
          <h4>Skin Tone</h4>
          <div class="swatch-row">
            <button class="swatch" style="background:#f5cba7;" onclick="window.game.player.setCustomization({skinTone: 0xf5cba7});"></button>
            <button class="swatch" style="background:#e0ac69;" onclick="window.game.player.setCustomization({skinTone: 0xe0ac69});"></button>
            <button class="swatch" style="background:#c68642;" onclick="window.game.player.setCustomization({skinTone: 0xc68642});"></button>
            <button class="swatch" style="background:#8d5524;" onclick="window.game.player.setCustomization({skinTone: 0x8d5524});"></button>
            <button class="swatch" style="background:#4a2b11;" onclick="window.game.player.setCustomization({skinTone: 0x4a2b11});"></button>
          </div>
        </div>

        <div class="phone-card">
          <h4>Hair Style & Color</h4>
          <div style="display:flex; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({hairStyle:'crew'});">Crew Cut</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({hairStyle:'slick'});">Slick</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({hairStyle:'afro'});">Afro</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({hairStyle:'punk'});">Punk</button>
          </div>
          <div class="swatch-row">
            <button class="swatch" style="background:#111111;" onclick="window.game.player.setCustomization({hairColor: 0x111111});"></button>
            <button class="swatch" style="background:#5a3825;" onclick="window.game.player.setCustomization({hairColor: 0x5a3825});"></button>
            <button class="swatch" style="background:#d4ac0d;" onclick="window.game.player.setCustomization({hairColor: 0xd4ac0d});"></button>
            <button class="swatch" style="background:#bdc3c7;" onclick="window.game.player.setCustomization({hairColor: 0xbdc3c7});"></button>
            <button class="swatch" style="background:#ff0077;" onclick="window.game.player.setCustomization({hairColor: 0xff0077});"></button>
          </div>
        </div>

        <div class="phone-card">
          <h4>Headwear</h4>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'none'});">None</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'fedora'});">Fedora</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'cap'});">Cap</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'beanie'});">Beanie</button>
          </div>
        </div>

        <div class="phone-card">
          <h4>Eyewear</h4>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'none'});">None</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'sunglasses'});">Aviator Sunglasses</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'cyber_visor'});">Cyber Visor</button>
          </div>
        </div>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // CAR MECHANIC & TUNING WORKSHOP MODAL
  // ------------------------------------------------------------

  openMechanicModal() {
    const modal = document.getElementById('mechanic-modal');
    if (!modal) return;

    // Detect vehicle to tune: either currently driving or nearest vehicle
    const targetVeh = this.game.vehicleManager.activeVehicle || this.game.vehicleManager.getNearestVehicle(this.game.player.position, 8.0);
    const contentEl = document.getElementById('mechanic-content');

    if (!targetVeh) {
      contentEl.innerHTML = `
        <div style="text-align:center; padding:30px;">
          <h3 style="color:#e74c3c;">No Vehicle In Bay</h3>
          <p style="color:#aaa; margin-top:8px;">Drive or park a vehicle near City Customs to repair, tune, or paint it!</p>
        </div>
      `;
    } else {
      contentEl.innerHTML = `
        <div class="mechanic-grid">
          <div class="shop-item-card">
            <h4>${targetVeh.spec.name}</h4>
            <p style="font-size:12px; color:#aaa;">Condition: <strong style="color:#2ecc71;">${targetVeh.condition}%</strong></p>
            <button class="btn btn-success btn-sm" style="margin-top:8px;" onclick="if(window.game.economy.spendCash(200)){ window.game.vehicleManager.repairVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0)); window.gameUI.openMechanicModal(); }">Full Service & Repair ($200)</button>
          </div>

          <div class="shop-item-card">
            <h4>🔥 Nitro Boost System (NOS)</h4>
            <p style="font-size:12px; color:#aaa;">Hold [SHIFT] while driving for extreme acceleration boost!</p>
            <div style="margin-top:8px;">
              ${
                targetVeh.hasNitro
                  ? `<span class="badge badge-owned">NOS INSTALLED (${Math.floor(targetVeh.nitroFuel)}%)</span>`
                  : `<button class="btn btn-primary btn-sm" onclick="if(window.game.economy.spendCash(3500)){ (window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0)).hasNitro = true; window.game.vehicleManager.installNitro(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0)); window.gameUI.openMechanicModal(); }">Install Nitro ($3,500)</button>`
              }
            </div>
          </div>

          <div class="shop-item-card">
            <h4>🚀 Engine Performance Tuning</h4>
            <p style="font-size:12px; color:#aaa;">Current: <strong>Stage ${targetVeh.tuningLevel || 0}</strong></p>
            <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-info" onclick="if(window.game.economy.spendCash(2500)){ window.game.vehicleManager.tuneEngine(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 1); window.gameUI.openMechanicModal(); }">Stage 1 ($2.5K)</button>
              <button class="btn btn-sm btn-warning" onclick="if(window.game.economy.spendCash(6500)){ window.game.vehicleManager.tuneEngine(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 2); window.gameUI.openMechanicModal(); }">Stage 2 ($6.5K)</button>
              <button class="btn btn-sm btn-danger" onclick="if(window.game.economy.spendCash(14000)){ window.game.vehicleManager.tuneEngine(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 3); window.gameUI.openMechanicModal(); }">Twin Turbo ($14K)</button>
            </div>
          </div>

          <div class="shop-item-card">
            <h4>🎨 Custom Paint Workshop</h4>
            <p style="font-size:12px; color:#aaa;">Apply premium gloss paint ($500):</p>
            <div class="swatch-row" style="margin-top:8px;">
              <button class="swatch" style="background:#111111;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0x111111);"></button>
              <button class="swatch" style="background:#00f0ff;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0x00f0ff);"></button>
              <button class="swatch" style="background:#e74c3c;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0xe74c3c);"></button>
              <button class="swatch" style="background:#f1c40f;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0xf1c40f);"></button>
              <button class="swatch" style="background:#8e44ad;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0x8e44ad);"></button>
              <button class="swatch" style="background:#ffffff;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0xffffff);"></button>
              <button class="swatch" style="background:#27ae60;" onclick="if(window.game.economy.spendCash(500)) window.game.vehicleManager.repaintVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0), 0x27ae60);"></button>
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
    this.activeModal = modal;
  }

  // ------------------------------------------------------------
  // IN-WORLD SHOP MODALS
  // ------------------------------------------------------------

  openCarDealerModal() {
    const modal = document.getElementById('cardealer-modal');
    if (!modal) return;
    const listEl = document.getElementById('cardealer-list');
    listEl.innerHTML = '';

    const specs = this.game.vehicleManager.specs;
    Object.keys(specs).forEach(key => {
      const spec = specs[key];
      const isOwned = this.game.economy.ownedVehicles.includes(key);

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <h4>${spec.name}</h4>
        <p style="font-size:12px; color:#aaa;">Speed: ${Math.floor(spec.maxSpeed * 2.3)} MPH | Accel: ${spec.accel}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-weight:bold; color:#2ecc71;">$${spec.price.toLocaleString()}</span>
          ${
            isOwned
              ? `<button class="btn btn-secondary btn-sm" disabled>OWNED</button>`
              : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyVehicle('${key}'); window.gameUI.openCarDealerModal();">Purchase</button>`
          }
        </div>
      `;
      listEl.appendChild(card);
    });

    modal.classList.add('active');
    this.activeModal = modal;
  }

  openClothesModal() {
    const modal = document.getElementById('clothes-modal');
    if (!modal) return;
    const listEl = document.getElementById('clothes-list');
    listEl.innerHTML = '';

    const outfits = [
      { id: 'casual', name: 'Street Casual Hoodie', price: 0 },
      { id: 'paramedic', name: 'St. Jude Medic Scrubs', price: 600 },
      { id: 'delivery', name: "Luigi's Delivery Cap & Vest", price: 400 },
      { id: 'taxi', name: 'Metro Cab Driver Suit', price: 500 },
      { id: 'assassin', name: 'Hitman Tailored Black Suit & Tie', price: 2500 },
      { id: 'cyber', name: 'Cyberpunk Neon Jacket', price: 4500 },
      { id: 'luxury_gold', name: 'Golden King Tuxedo', price: 15000 }
    ];

    outfits.forEach(outfit => {
      const isOwned = this.game.economy.ownedOutfits.includes(outfit.id);
      const isEquipped = this.game.player.custom.outfit === outfit.id;

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <h4>${outfit.name}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="color:#2ecc71; font-weight:bold;">${outfit.price === 0 ? 'FREE' : '$' + outfit.price.toLocaleString()}</span>
          ${
            isEquipped
              ? `<button class="btn btn-success btn-sm" disabled>EQUIPPED</button>`
              : isOwned
              ? `<button class="btn btn-info btn-sm" onclick="window.game.player.setOutfit('${outfit.id}'); window.gameUI.openClothesModal();">Equip</button>`
              : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyOutfit('${outfit.id}', ${outfit.price}); window.gameUI.openClothesModal();">Buy & Equip</button>`
          }
        </div>
      `;
      listEl.appendChild(card);
    });

    modal.classList.add('active');
    this.activeModal = modal;
  }

  openArmoryModal() {
    const modal = document.getElementById('armory-modal');
    if (!modal) return;
    const bodyEl = modal.querySelector('.modal-body');
    if (bodyEl) {
      const owned = this.game.player.ownedWeapons;
      const current = this.game.player.currentWeaponKey;

      bodyEl.innerHTML = `
        <div class="shop-item-card">
          <h4>🛡️ Heavy Kevlar Body Armor</h4>
          <p style="font-size:12px; color:#aaa;">Absorbs 100 ballistic damage hits.</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="color:#2ecc71; font-weight:bold;">$1,000</span>
            <button class="btn btn-primary btn-sm" onclick="window.game.economy.buyArmoryItem('armor', 1000); window.gameUI.openArmoryModal();">Equip Armor</button>
          </div>
        </div>

        <div class="shop-item-card">
          <h4>🔫 Silenced 9mm Hitman Special</h4>
          <p style="font-size:12px; color:#aaa;">Integrated titanium suppressor. Silent close/mid-range takedowns.</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="color:#2ecc71; font-weight:bold;">$3,500</span>
            ${
              owned.includes('pistol_silenced')
                ? `<button class="btn btn-secondary btn-sm" onclick="window.game.economy.buyArmoryItem('pistol_silenced', 0); window.gameUI.openArmoryModal();">${current === 'pistol_silenced' ? 'EQUIPPED' : 'EQUIP'}</button>`
                : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyArmoryItem('pistol_silenced', 3500); window.gameUI.openArmoryModal();">Purchase & Equip</button>`
            }
          </div>
        </div>

        <div class="shop-item-card">
          <h4>🎯 Ghost Marksman Silenced Sniper</h4>
          <p style="font-size:12px; color:#aaa;">High-caliber suppressed rifle with 8x Military Mil-Dot Scope. Essential for discreet long-range bounties!</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="color:#2ecc71; font-weight:bold;">$9,000</span>
            ${
              owned.includes('sniper_silenced')
                ? `<button class="btn btn-secondary btn-sm" onclick="window.game.economy.buyArmoryItem('sniper_silenced', 0); window.gameUI.openArmoryModal();">${current === 'sniper_silenced' ? 'EQUIPPED' : 'EQUIP'}</button>`
                : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyArmoryItem('sniper_silenced', 9000); window.gameUI.openArmoryModal();">Purchase & Equip</button>`
            }
          </div>
        </div>
      `;
    }
    modal.classList.add('active');
    this.activeModal = modal;
  }

  updateWantedHUD(stars) {
    const starsEl = document.getElementById('hud-wanted-stars');
    if (!starsEl) return;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      starsHtml += `<span class="star-icon ${i < stars ? 'star-active' : ''}">★</span>`;
    }
    starsEl.innerHTML = starsHtml;
    starsEl.style.display = stars > 0 ? 'flex' : 'none';
  }

  updateViewModeHUD(mode) {
    const pill = document.getElementById('hud-viewmode-pill');
    if (pill) {
      pill.innerHTML = `🎥 ${mode.toUpperCase()}`;
    }
  }

  updateHolsterHUD(isDrawn) {
    const pill = document.getElementById('hud-holster-pill');
    if (pill) {
      if (isDrawn) {
        pill.className = 'status-pill pill-danger';
        pill.innerHTML = '⚠️ WEAPON DRAWN';
      } else {
        pill.className = 'status-pill pill-safe';
        pill.innerHTML = '🛡️ CONCEALED (CIVILIAN)';
      }
    }
  }

  openGuildModal() {
    this.openPhoneApp('guild');
    this.togglePhone();
  }

  closeAllModals() {
    document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
    this.activeModal = null;
  }

  showBountyRewardModal(target) {
    const modal = document.getElementById('bounty-reward-modal');
    if (!modal) return;

    document.getElementById('bounty-target-name').innerText = target.name;
    document.getElementById('bounty-amount-text').innerText = `+$${target.bounty.toLocaleString()}`;
    modal.classList.add('active');

    setTimeout(() => {
      modal.classList.remove('active');
    }, 4500);
  }

  openSuperMartModal() {
    this.closeAllModals();
    const modal = document.getElementById('supermart-modal');
    if (!modal) return;
    this.activeModal = modal;
    modal.classList.add('active');

    if (window.soundManager) window.soundManager.playDoorChime();

    // Populate catalog items
    const listEl = document.getElementById('supermart-items-list');
    if (listEl && this.game.economy && this.game.economy.storeCatalog) {
      let html = '';
      Object.values(this.game.economy.storeCatalog).forEach(item => {
        html += `
          <div class="store-item-card">
            <div class="store-item-info">
              <span class="store-item-icon">${item.icon}</span>
              <div>
                <strong style="color:#ecf0f1; font-size:13px;">${item.name}</strong>
                <p style="color:#94a3b8; font-size:11px; margin:2px 0;">${item.desc}</p>
                <span style="color:#2ecc71; font-weight:bold; font-size:12px;">$${item.price}</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.game.economy.buyStoreItem('${item.id}');">
              Buy Item
            </button>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    // Rob Cashier Button
    const robBtn = document.getElementById('rob-register-btn');
    if (robBtn) {
      robBtn.onclick = () => {
        const cityId = this.game.world ? this.game.world.currentCityId : 'metropolis';
        this.game.economy.robStoreRegister(cityId);
        this.closeAllModals();
      };
    }
  }

  showCityWelcome(name, tagline) {
    const card = document.getElementById('city-welcome-card');
    const nameEl = document.getElementById('city-welcome-name');
    const tagEl = document.getElementById('city-welcome-tagline');
    if (!card || !nameEl || !tagEl) return;

    nameEl.innerText = `🏙️ ${name.toUpperCase()}`;
    tagEl.innerText = tagline;
    card.classList.add('active');

    if (this.welcomeTimer) clearTimeout(this.welcomeTimer);
    this.welcomeTimer = setTimeout(() => {
      card.classList.remove('active');
    }, 3800);

    const locPill = document.getElementById('hud-location-pill');
    if (locPill) {
      locPill.innerText = `📍 ${name}`;
    }
  }

  showSeaWarning() {
    const banner = document.getElementById('sea-boundary-banner');
    if (!banner) return;
    banner.style.display = 'block';
    if (this.seaTimer) clearTimeout(this.seaTimer);
    this.seaTimer = setTimeout(() => {
      banner.style.display = 'none';
    }, 2500);
  }

  showBustedScreen() {
    const screen = document.getElementById('busted-screen');
    if (screen) screen.classList.add('active');
  }

  hideBustedScreen() {
    const screen = document.getElementById('busted-screen');
    if (screen) screen.classList.remove('active');
  }

  showWastedScreen() {
    const screen = document.getElementById('wasted-screen');
    if (screen) screen.classList.add('active');
  }

  hideWastedScreen() {
    const screen = document.getElementById('wasted-screen');
    if (screen) screen.classList.remove('active');
  }

  toggleMinimapMaximized(forceState = null) {
    this.isMinimapMaximized = (forceState !== null) ? forceState : !this.isMinimapMaximized;

    if (this.minimapWrapper) {
      this.minimapWrapper.classList.toggle('maximized', this.isMinimapMaximized);
    }

    const header = document.getElementById('minimap-max-header');
    if (header) {
      header.style.display = this.isMinimapMaximized ? 'flex' : 'none';
    }

    const btn = document.getElementById('minimap-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isMinimapMaximized ? '✕' : '⤢';
      btn.title = this.isMinimapMaximized ? 'Close Full Map (M)' : 'Maximize Full World Map (M)';
    }

    // Resize canvas resolution for crisp rendering
    if (this.minimapCanvas) {
      if (this.isMinimapMaximized) {
        this.minimapCanvas.width = 720;
        this.minimapCanvas.height = 720;
      } else {
        this.minimapCanvas.width = 170;
        this.minimapCanvas.height = 170;
      }
    }

    if (window.soundManager) window.soundManager.playNotification(true);
  }

  handleMaximizedMapClick(e) {
    if (!this.minimapCanvas) return;
    const rect = this.minimapCanvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * this.minimapCanvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * this.minimapCanvas.height;

    const size = this.minimapCanvas.width;
    const center = size / 2;
    const maxWorldRadius = 15000;
    const mapScale = (size * 0.44) / maxWorldRadius;

    // Convert click coordinates to world coordinates
    const worldX = (clickX - center) / mapScale;
    const worldZ = (clickY - center) / mapScale;

    // Check if clicked near any city
    const world = this.game.world;
    if (world && world.cities) {
      for (const [key, city] of Object.entries(world.cities)) {
        const dx = worldX - city.center.x;
        const dz = worldZ - city.center.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Click within city region
        if (dist < 1500) {
          if (world.currentCityId === city.id) {
            this.showNotification(`📍 You are currently in ${city.name}!`, 'info');
          } else {
            this.game.economy.fastTravelTaxi(city.id);
            this.toggleMinimapMaximized(false);
          }
          return;
        }
      }
    }
  }

  drawMaximizedWorldMap(ctx, size) {
    const center = size / 2;
    // 30,000m x 30,000m world mapped into canvas
    const maxWorldRadius = 15000;
    const mapScale = (size * 0.44) / maxWorldRadius;

    // 1. Deep Ocean Background
    ctx.fillStyle = '#061626';
    ctx.fillRect(0, 0, size, size);

    // 2. Sea Boundary Danger Ring (14,500m)
    const seaPixelRadius = 14500 * mapScale;
    ctx.strokeStyle = 'rgba(255, 59, 48, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(center, center, seaPixelRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 59, 48, 0.75)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌊 COAST GUARD OCEAN BOUNDARY (14,500m)', center, center - seaPixelRadius + 18);

    // 3. Central Mainland Landmass
    const landPixelRadius = 8500 * mapScale;
    ctx.fillStyle = '#142318';
    ctx.beginPath();
    ctx.arc(center, center, landPixelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e3825';
    ctx.lineWidth = 2;
    ctx.stroke();

    const world = this.game.world;
    if (!world || !world.cities) return;

    // 4. Draw Trans-Archipelago Expressways
    const metro = world.cities.metropolis.center;
    const metroX = center + metro.x * mapScale;
    const metroZ = center + metro.z * mapScale;

    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 4;
    Object.values(world.cities).forEach(city => {
      if (city.id === 'metropolis') return;
      const cx = center + city.center.x * mapScale;
      const cz = center + city.center.z * mapScale;
      ctx.beginPath();
      ctx.moveTo(metroX, metroZ);
      ctx.lineTo(cx, cz);
      ctx.stroke();
    });

    ctx.strokeStyle = '#e8b82a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    Object.values(world.cities).forEach(city => {
      if (city.id === 'metropolis') return;
      const cx = center + city.center.x * mapScale;
      const cz = center + city.center.z * mapScale;
      ctx.beginPath();
      ctx.moveTo(metroX, metroZ);
      ctx.lineTo(cx, cz);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 5. Draw 8 Cities with Glowing Halos, Pins & Labels
    const playerPos = this.game.player.position;

    Object.values(world.cities).forEach(city => {
      const cx = center + city.center.x * mapScale;
      const cz = center + city.center.z * mapScale;
      const isCurrent = (world.currentCityId === city.id);

      // City boundary circle
      ctx.fillStyle = isCurrent ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = '#' + city.color.toString(16).padStart(6, '0');
      ctx.lineWidth = isCurrent ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cz, city.radius * mapScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // City Center Pin
      ctx.fillStyle = '#' + city.color.toString(16).padStart(6, '0');
      ctx.beginPath();
      ctx.arc(cx, cz, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // City Title Label
      ctx.fillStyle = isCurrent ? '#00f0ff' : '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(city.name, cx, cz - 12);
      ctx.shadowBlur = 0;

      // Distance & taxi hint
      const dist = Math.round(playerPos.distanceTo(city.center));
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${dist}m • Click for Taxi ($200)`, cx, cz + 18);
    });

    // 6. Mission Waypoint Marker
    if (this.game.jobs && this.game.jobs.activeMission) {
      const dest =
        this.game.jobs.activeMission.stage === 'deliver' || this.game.jobs.activeMission.stage === 'dropoff'
          ? this.game.jobs.activeMission.dropoffPos
          : this.game.jobs.activeMission.pickupPos;

      if (dest) {
        const mx = center + dest.x * mapScale;
        const mz = center + dest.z * mapScale;

        const pulse = 8 + Math.sin(Date.now() * 0.008) * 3;
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(mx, mz - pulse);
        ctx.lineTo(mx + pulse, mz);
        ctx.lineTo(mx, mz + pulse);
        ctx.lineTo(mx - pulse, mz);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ MISSION OBJECTIVE', mx, mz - pulse - 4);
      }
    }

    // 7. Player Indicator (Bright Cyan Pulsing Ring & Heading Arrow)
    const px = center + playerPos.x * mapScale;
    const pz = center + playerPos.z * mapScale;

    const pRipple = 10 + (Date.now() % 1200) / 120;
    ctx.strokeStyle = 'rgba(0, 240, 255, ' + (1 - pRipple / 20) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, pz, pRipple, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(px, pz);
    const headingAngle = this.game.vehicleManager.activeVehicle
      ? -this.game.vehicleManager.activeVehicle.group.rotation.y
      : -this.game.player.heading;
    ctx.rotate(headingAngle);

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 3.5);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', px, pz - 14);

    // 8. Scale Legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(16, size - 44, 180, 32);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, size - 44, 180, 32);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MAP: 30,000m × 30,000m', 24, size - 28);
    ctx.fillText('SCALE: 1cm ≈ 700m', 24, size - 16);
  }

  // ------------------------------------------------------------
  // MINIMAP RENDERER
  // ------------------------------------------------------------

  drawMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const canvas = this.minimapCanvas;
    const size = canvas.width;
    const center = size / 2;

    // If maximized, render the full 30,000 x 30,000 world map!
    if (this.isMinimapMaximized) {
      this.drawMaximizedWorldMap(ctx, size);
      return;
    }

    const scale = 0.28;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#11171d';
    ctx.fillRect(0, 0, size, size);

    const playerPos = this.game.player.position;

    // Roads
    const totalStep = 78;
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 5;

    for (let i = -3; i <= 3; i++) {
      const rx = center + (i * totalStep - playerPos.x) * scale;
      const rz = center + (i * totalStep - playerPos.z) * scale;

      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, rz);
      ctx.lineTo(size, rz);
      ctx.stroke();
    }

    // Interactive Landmarks
    this.game.world.interactiveSpots.forEach(spot => {
      const sx = center + (spot.position.x - playerPos.x) * scale;
      const sz = center + (spot.position.z - playerPos.z) * scale;

      ctx.fillStyle = '#' + spot.color.toString(16).padStart(6, '0');
      ctx.beginPath();
      ctx.arc(sx, sz, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mission Objective
    if (this.game.jobs.activeMission) {
      const dest =
        this.game.jobs.activeMission.stage === 'deliver' || this.game.jobs.activeMission.stage === 'dropoff'
          ? this.game.jobs.activeMission.dropoffPos
          : this.game.jobs.activeMission.pickupPos;

      if (dest) {
        const mx = center + (dest.x - playerPos.x) * scale;
        const mz = center + (dest.z - playerPos.z) * scale;

        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(mx, mz, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Assassin Targets
    this.game.pedestrianManager.targets.forEach(t => {
      const tx = center + (t.mesh.position.x - playerPos.x) * scale;
      const tz = center + (t.mesh.position.z - playerPos.z) * scale;

      ctx.fillStyle = t.isDead ? '#00ff88' : '#ff0044';
      ctx.beginPath();
      ctx.arc(tx, tz, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player Direction Arrow
    ctx.save();
    ctx.translate(center, center);
    const angle = this.game.vehicleManager.activeVehicle
      ? -this.game.vehicleManager.activeVehicle.group.rotation.y
      : -this.game.player.heading;
    ctx.rotate(angle);

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // Radar border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();
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
