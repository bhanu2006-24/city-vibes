// ============================================================
// CITY VIBES - GAME MODAL DIALOGS & OVERLAYS
// ============================================================

window.ModalsSystem = {
  closeAll(ui) {
    document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
    ui.activeModal = null;
  },

  openBankATM(ui) {
    this.closeAll(ui);
    const modal = document.getElementById('bank-atm-modal');
    if (!modal) return;

    const cashVal = document.getElementById('atm-cash-val');
    const bankVal = document.getElementById('atm-bank-val');
    if (cashVal) cashVal.innerText = `$${ui.game.economy.cash.toLocaleString()}`;
    if (bankVal) bankVal.innerText = `$${ui.game.economy.bank.toLocaleString()}`;

    if (window.soundManager) window.soundManager.playDoorChime();
    modal.classList.add('active');
    ui.activeModal = modal;
  },

  openConstruction(ui) {
    this.closeAll(ui);
    const modal = document.getElementById('construction-modal');
    if (!modal) return;
    const listEl = document.getElementById('construction-properties-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const props = Object.values(ui.game.economy.properties);
    const ownedProps = props.filter(p => p.owned);

    if (ownedProps.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:30px; grid-column: 1 / -1;">
          <h3 style="color:#00cec9;">No Owned Properties on File</h3>
          <p style="color:#aaa; margin-top:8px;">You don't own any real estate yet! Travel to physical properties around the island and purchase title deeds on-site before ordering renovations.</p>
        </div>
      `;
    } else {
      let html = `
        <div style="grid-column: 1 / -1; margin-bottom:12px; font-size:12px; color:#cbd5e1; background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:8px;">
          Apex General Contractors will upgrade your building structures, interior fittings, and high-yield leases to maximize passive rental income.
        </div>
      `;
      ownedProps.forEach(p => {
        html += `
          <div class="shop-item-card" style="border: 1px solid rgba(0, 206, 201, 0.3);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; color:#00cec9;">${p.name}</h4>
              <span class="badge badge-owned">Lv. ${p.level}</span>
            </div>
            <p style="font-size:11px; color:#94a3b8; margin:4px 0;">📍 Location: ${p.locationName || 'Downtown'}</p>
            <p style="font-size:12px; margin:4px 0;">${p.desc}</p>
            <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; margin:8px 0; font-size:12px;">
              <div>Current Rent: <strong style="color:#2ecc71;">+$${p.rentIncome.toLocaleString()}/cycle</strong></div>
              <div>Upgraded Rent: <strong style="color:#00f0ff;">+$${Math.round(p.rentIncome * 1.55).toLocaleString()}/cycle</strong></div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="window.game.economy.renovatePropertyAtCompany('${p.id}'); window.gameUI.openConstructionModal();">
              🔨 Sign Renovation Contract ($${p.renovationCost.toLocaleString()})
            </button>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    if (window.soundManager) window.soundManager.playDoorChime();
    modal.classList.add('active');
    ui.activeModal = modal;
  },

  openMechanic(ui) {
    const modal = document.getElementById('mechanic-modal');
    if (!modal) return;

    const targetVeh = ui.game.vehicleManager.activeVehicle || ui.game.vehicleManager.getNearestVehicle(ui.game.player.position, 8.0);
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
            <p style="font-size:12px; color:#aaa;">Condition: <strong style="color:#2ecc71;">${targetVeh.condition || 100}%</strong></p>
            <button class="btn btn-success btn-sm" style="margin-top:8px;" onclick="if(window.game.economy.spendCash(200)){ window.game.vehicleManager.repairVehicle(window.game.vehicleManager.activeVehicle || window.game.vehicleManager.getNearestVehicle(window.game.player.position, 8.0)); window.gameUI.openMechanicModal(); }">Full Service & Repair ($200)</button>
          </div>

          <div class="shop-item-card">
            <h4>🔥 Nitro Boost System (NOS)</h4>
            <p style="font-size:12px; color:#aaa;">Hold [SHIFT] while driving for extreme acceleration boost!</p>
            <div style="margin-top:8px;">
              ${
                targetVeh.hasNitro
                  ? `<span class="badge badge-owned">NOS INSTALLED (${Math.floor(targetVeh.nitroFuel || 100)}%)</span>`
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
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
    ui.activeModal = modal;
  },

  openCarDealer(ui) {
    const modal = document.getElementById('cardealer-modal');
    if (!modal) return;
    const listEl = document.getElementById('cardealer-list');
    listEl.innerHTML = '';

    const specs = ui.game.vehicleManager.specs;
    Object.keys(specs).forEach(key => {
      const spec = specs[key];
      const isOwned = ui.game.economy.ownedVehicles.includes(key);

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
    ui.activeModal = modal;
  },

  openClothes(ui) {
    const modal = document.getElementById('clothes-modal');
    if (!modal) return;
    const listEl = document.getElementById('clothes-list');
    listEl.innerHTML = '';

    const catalog = [
      { id: 'casual', name: 'Downtown Commuter', price: 0 },
      { id: 'assassin', name: 'Agent 47 Hitman Tuxedo', price: 1500 },
      { id: 'paramedic', name: 'Paramedic Responder Uniform', price: 600 },
      { id: 'taxi', name: 'Yellow Cab Driver Attire', price: 400 },
      { id: 'delivery', name: 'Pizza Express Courier Jacket', price: 250 },
      { id: 'cyber', name: 'Cyberpunk Neon Streetwear', price: 3200 },
      { id: 'luxury_gold', name: 'High-Roller Gold Silk Suit', price: 8500 }
    ];

    catalog.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <h4>${item.name}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-weight:bold; color:#2ecc71;">${item.price === 0 ? 'FREE' : '$' + item.price.toLocaleString()}</span>
          <button class="btn btn-primary btn-sm" onclick="window.game.economy.buyOutfit('${item.id}', ${item.price});">Wear</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    modal.classList.add('active');
    ui.activeModal = modal;
  },

  openArmory(ui) {
    const modal = document.getElementById('armory-modal');
    if (!modal) return;
    const bodyEl = modal.querySelector('.modal-body');
    bodyEl.innerHTML = `
      <div style="grid-column: 1 / -1; margin-bottom:10px;">
        <p style="font-size:12px; color:#aaa; margin:0;">
          All firearms sold here are equipped with precision suppressors. Drawing firearms in public alerts police.
        </p>
      </div>

      <div class="shop-item-card">
        <h4>Silenced 9mm Hitman Special</h4>
        <p style="font-size:12px; color:#aaa;">Compact stealth pistol. Subsonic ammo.</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-weight:bold; color:#2ecc71;">$3,500</span>
          ${
            ui.game.player.ownedWeapons.includes('pistol_silenced')
              ? `<button class="btn btn-secondary btn-sm" disabled>OWNED</button>`
              : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyArmoryItem('pistol_silenced', 3500); window.gameUI.openArmoryModal();">Purchase</button>`
          }
        </div>
      </div>

      <div class="shop-item-card">
        <h4>Ghost Marksman Silenced Sniper (With 8x Scope)</h4>
        <p style="font-size:12px; color:#aaa;">High-caliber sniper rifle with 8x mil-dot optical scope & laser rangefinder.</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-weight:bold; color:#2ecc71;">$9,000</span>
          ${
            ui.game.player.ownedWeapons.includes('sniper_silenced')
              ? `<button class="btn btn-secondary btn-sm" disabled>OWNED</button>`
              : `<button class="btn btn-primary btn-sm" onclick="window.game.economy.buyArmoryItem('sniper_silenced', 9000); window.gameUI.openArmoryModal();">Purchase</button>`
          }
        </div>
      </div>
    `;

    modal.classList.add('active');
    ui.activeModal = modal;
  },

  openSuperMart(ui) {
    this.closeAll(ui);
    const modal = document.getElementById('supermart-modal');
    if (!modal) return;
    ui.activeModal = modal;
    modal.classList.add('active');

    if (window.soundManager) window.soundManager.playDoorChime();

    const listEl = document.getElementById('supermart-items-list');
    if (listEl && ui.game.economy && ui.game.economy.storeCatalog) {
      let html = '';
      Object.values(ui.game.economy.storeCatalog).forEach(item => {
        html += `
          <div class="store-item-card">
            <div class="store-item-info">
              <span class="store-item-icon">${item.icon}</span>
              <div>
                <strong style="color:#ecf0f1; font-size:13px;">${item.name}</strong>
                <p style="font-size:11px; color:#95a5a6; margin:2px 0;">${item.desc}</p>
                <span class="store-item-price">$${item.price}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.game.economy.buyStoreItem('${item.id}')">Buy</button>
          </div>
        `;
      });
      listEl.innerHTML = html;
    }

    const robBtn = document.getElementById('rob-register-btn');
    if (robBtn) {
      robBtn.onclick = () => {
        ui.game.economy.robStoreRegister('supermart');
        this.closeAll(ui);
      };
    }
  },

  showBountyReward(ui, target) {
    const modal = document.getElementById('bounty-reward-modal');
    if (!modal) return;

    document.getElementById('bounty-target-name').innerText = target.name;
    document.getElementById('bounty-amount-text').innerText = `+$${target.bounty.toLocaleString()}`;
    modal.classList.add('active');

    setTimeout(() => {
      modal.classList.remove('active');
    }, 4500);
  },

  showBusted(ui) {
    const el = document.getElementById('busted-screen');
    if (el) el.classList.add('active');
  },

  hideBusted(ui) {
    const el = document.getElementById('busted-screen');
    if (el) el.classList.remove('active');
  },

  showWasted(ui) {
    const el = document.getElementById('wasted-screen');
    if (el) el.classList.add('active');
  },

  hideWasted(ui) {
    const el = document.getElementById('wasted-screen');
    if (el) el.classList.remove('active');
  }
};

