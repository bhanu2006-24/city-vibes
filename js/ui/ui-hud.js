// ============================================================
// CITY VIBES - GTA HEADS-UP DISPLAY (HUD)
// ============================================================

window.GameHUD = {
  init(ui) {
    ui.healthBarEl = document.getElementById('hud-health-fill');
    ui.armorBarEl = document.getElementById('hud-armor-fill');
    ui.cashEl = document.getElementById('hud-cash-value');
    ui.bankEl = document.getElementById('hud-bank-value');
    ui.speedoEl = document.getElementById('hud-speedometer');
    ui.speedValueEl = document.getElementById('speed-value');
    ui.nitroBarEl = document.getElementById('hud-nitro-fill');
    ui.interactPromptEl = document.getElementById('hud-interact-prompt');
    ui.notificationContainer = document.getElementById('notification-container');
    ui.jobHudEl = document.getElementById('hud-job-card');
    ui.jobTitleEl = document.getElementById('job-card-title');
    ui.jobDescEl = document.getElementById('job-card-desc');
    ui.jobTimerEl = document.getElementById('job-card-timer');
  },

  showNotification(ui, text, type = 'info', duration = 4000) {
    if (!ui.notificationContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = text;
    ui.notificationContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  updateBalance(ui, cash, bank) {
    if (ui.cashEl) ui.cashEl.innerText = `$${cash.toLocaleString()}`;
    if (ui.bankEl) ui.bankEl.innerText = `$${bank.toLocaleString()}`;
  },

  updatePlayerHUD(ui, player) {
    if (ui.healthBarEl) {
      const hpPercent = Math.max(0, (player.health / player.maxHealth) * 100);
      ui.healthBarEl.style.width = `${hpPercent}%`;
    }
    if (ui.armorBarEl) {
      ui.armorBarEl.style.width = `${player.armor || 0}%`;
    }
  },

  updateVehicleHUD(ui, vehicle) {
    if (!ui.speedoEl) return;
    ui.speedoEl.style.display = 'flex';
    const mph = Math.floor(Math.abs(vehicle.speed) * 2.3);
    if (ui.speedValueEl) ui.speedValueEl.innerText = mph;

    if (ui.nitroBarEl) {
      const nitroContainer = ui.nitroBarEl.parentElement;
      if (vehicle.hasNitro) {
        nitroContainer.style.display = 'block';
        ui.nitroBarEl.style.width = `${Math.floor(vehicle.nitroFuel)}%`;
      } else {
        nitroContainer.style.display = 'none';
      }
    }
  },

  hideVehicleHUD(ui) {
    if (ui.speedoEl) ui.speedoEl.style.display = 'none';
  },

  showInteractionPrompt(ui, text) {
    if (ui.interactPromptEl) {
      ui.interactPromptEl.innerHTML = text;
      ui.interactPromptEl.style.display = 'block';
    }
  },

  hideInteractionPrompt(ui) {
    if (ui.interactPromptEl) {
      ui.interactPromptEl.style.display = 'none';
    }
  },

  updateJobHUD(ui, mission) {
    if (!ui.jobHudEl) return;
    ui.jobHudEl.style.display = 'block';

    if (mission.type === 'ambulance') {
      ui.jobTitleEl.innerHTML = '🚑 AMBULANCE EMERGENCY';
      ui.jobDescEl.innerHTML =
        mission.stage === 'pickup'
          ? `Proceed to: <span style="color:#00f0ff;">${mission.locationName}</span>`
          : `Rush patient to: <span style="color:#2ecc71;">St. Jude Hospital ER</span>`;
      if (ui.jobTimerEl) {
        ui.jobTimerEl.innerHTML = `⏱️ TIME: ${Math.ceil(mission.timeLeft)}s`;
      }
    } else if (mission.type === 'delivery') {
      ui.jobTitleEl.innerHTML = '🍕 PIZZA EXPRESS DELIVERY';
      ui.jobDescEl.innerHTML =
        mission.stage === 'pickup_order'
          ? `Collect order at: <span style="color:#f39c12;">Luigi's Pizzeria</span>`
          : `Deliver to customer: <span style="color:#00f0ff;">${mission.customerName}</span>`;
      if (ui.jobTimerEl) {
        ui.jobTimerEl.innerHTML = `🔥 FRESHNESS: ${Math.ceil(mission.timeLeft)}s`;
      }
    } else if (mission.type === 'taxi') {
      ui.jobTitleEl.innerHTML = '🚖 METRO CAB FARE';
      ui.jobDescEl.innerHTML =
        mission.stage === 'pickup_passenger'
          ? `Pick up rider at: <span style="color:#f1c40f;">${mission.pickupName}</span>`
          : `Drop rider off at: <span style="color:#2ecc71;">${mission.dropoffName}</span>`;
      if (ui.jobTimerEl) {
        ui.jobTimerEl.innerHTML = `💰 FARE: $${mission.fare}`;
      }
    }
  },

  hideJobHUD(ui) {
    if (ui.jobHudEl) ui.jobHudEl.style.display = 'none';
  },

  updateWantedHUD(stars) {
    for (let i = 1; i <= 5; i++) {
      const starEl = document.getElementById(`wanted-star-${i}`);
      if (starEl) {
        starEl.classList.toggle('active', i <= stars);
      }
    }
  },

  updateViewModeHUD(mode) {
    const pill = document.getElementById('hud-view-pill');
    if (pill) {
      pill.innerText = `🎥 ${mode.toUpperCase()}`;
    }
  },

  updateHolsterHUD(isDrawn) {
    const pill = document.getElementById('hud-weapon-pill');
    if (pill) {
      pill.innerText = isDrawn ? '🔫 DRAWN (PUBLIC HEAT)' : '🛡️ CONCEALED (CIVILIAN)';
      pill.style.color = isDrawn ? '#ff3355' : '#2ecc71';
      pill.style.borderColor = isDrawn ? '#ff3355' : '#2ecc71';
    }
  },

  showCityWelcome(ui, name, tagline) {
    const card = document.getElementById('city-welcome-card');
    const nameEl = document.getElementById('city-welcome-name');
    const tagEl = document.getElementById('city-welcome-tagline');
    if (!card || !nameEl || !tagEl) return;

    nameEl.innerText = `🏙️ ${name.toUpperCase()}`;
    tagEl.innerText = tagline;
    card.classList.add('active');

    if (ui.welcomeTimer) clearTimeout(ui.welcomeTimer);
    ui.welcomeTimer = setTimeout(() => {
      card.classList.remove('active');
    }, 3800);

    const locPill = document.getElementById('hud-location-pill');
    if (locPill) {
      locPill.innerText = `📍 ${name}`;
    }
  },

  showSeaWarning(ui) {
    const banner = document.getElementById('sea-boundary-banner');
    if (!banner) return;
    banner.style.display = 'block';
    if (ui.seaTimer) clearTimeout(ui.seaTimer);
    ui.seaTimer = setTimeout(() => {
      banner.style.display = 'none';
    }, 2500);
  }
};
