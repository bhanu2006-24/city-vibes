// ============================================================
// CITY VIBES - SMARTPHONE ("VIBEPHONE 16 PRO") & APPS
// ============================================================

window.PhoneSystem = {
  renderHome(bodyEl) {
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
  },

  renderMap(game, bodyEl) {
    const districts = window.WorldMapData.districts;
    const playerPos = game.player.position;
    let html = '';

    districts.forEach(d => {
      const dist = Math.round(playerPos.distanceTo(d.center));
      const isCurrent = (game.world.currentDistrictId === d.id);
      html += `
        <div class="phone-card" style="border-left: 4px solid #${d.color.toString(16).padStart(6, '0')}; margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h4 style="margin:0; font-size:13px; color:#fff;">${d.name}</h4>
              <p style="font-size:11px; color:#94a3b8; margin:2px 0;">${d.tagline}</p>
              <span style="font-size:11px; color:#00f0ff;">📍 Dist: ${dist}m ${isCurrent ? '<strong style="color:#2ecc71;">(HERE)</strong>' : ''}</span>
            </div>
            ${isCurrent ? '<span style="color:#2ecc71; font-size:11px; font-weight:bold;">CURRENT</span>' : `
              <button class="btn btn-sm btn-primary" onclick="window.game.economy.fastTravelTaxi('${d.id}')">
                🚖 Taxi ($200)
              </button>
            `}
          </div>
        </div>
      `;
    });

    bodyEl.innerHTML = `
      <div class="phone-app-header"><h3>🗺️ CityMaps GPS (GTA State)</h3></div>
      <p style="font-size:11px; color:#94a3b8; margin: 4px 12px 10px;">Select any district across the territory to call a fast-travel taxi ($200)!</p>
      <div class="phone-list">${html}</div>
    `;
  },

  renderJobs(game, bodyEl) {
    bodyEl.innerHTML = `
      <div class="phone-app-header"><h3>💼 City Careers</h3></div>
      <div class="phone-list">
        <div class="phone-card">
          <h4>🚑 St. Jude Paramedic</h4>
          <p>Rush injured citizens to the hospital ER with your siren blazing.</p>
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
          game.jobs.currentJob
            ? `<button class="btn btn-danger" style="margin-top:10px;" onclick="window.game.jobs.cancelCurrentJob()">Quit Current Shift</button>`
            : ''
        }
      </div>
    `;
  },

  renderRealEstate(game, bodyEl) {
    const props = Object.values(game.economy.properties);
    let html = `
      <div class="phone-app-header"><h3>🏢 Real Estate Empire</h3></div>
      <p style="font-size:11px; color:#94a3b8; margin: 4px 12px 10px;">
        📍 Properties must be purchased on-site by signing physical title deeds. Renovations must be contracted at Apex Construction Co.
      </p>
      <div class="phone-list">
    `;

    props.forEach(p => {
      html += `
        <div class="phone-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${p.name}</strong>
            <span class="badge ${p.owned ? 'badge-owned' : ''}">${p.owned ? 'OWNED' : '$' + p.price.toLocaleString()}</span>
          </div>
          <div style="font-size:11px; color:#00f0ff; margin-top:2px;">📍 Location: ${p.locationName || 'Downtown'}</div>
          <p style="font-size:12px; margin:4px 0;">${p.desc}</p>
          <p style="font-size:12px; color:#2ecc71;">Rent Yield: <strong>+$${p.rentIncome}/cycle</strong> (Lv. ${p.level})</p>
          ${
            p.owned
              ? `
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
              <button class="btn btn-sm ${p.isRented ? 'btn-success' : 'btn-secondary'}" onclick="window.game.economy.togglePropertyRent('${p.id}'); window.gameUI.openPhoneApp('realestate');">
                ${p.isRented ? '✅ Leased (Generating Rent)' : '🛌 Safehouse (Private - Heals HP)'}
              </button>
              <button class="btn btn-sm btn-info" onclick="window.game.economy.locateConstructionCompany();">
                🏗️ Route to Apex Construction Co. (Renovate)
              </button>
            </div>`
              : `
            <div style="margin-top:6px;">
              <button class="btn btn-sm btn-primary" style="width:100%;" onclick="window.game.economy.locatePropertyOnMap('${p.id}');">
                📍 Locate on GPS (Travel to Buy On-Site)
              </button>
            </div>`
          }
        </div>
      `;
    });
    html += `</div>`;
    bodyEl.innerHTML = html;
  },

  renderGuild(game, bodyEl) {
    const contracts = game.jobs.assassinContracts;
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
  },

  renderGarage(game, bodyEl) {
    const owned = game.economy.ownedVehicles;
    const specs = game.vehicleManager.specs;
    let html = `<div class="phone-app-header"><h3>🚗 Personal Garage</h3></div><div class="phone-list">`;
    owned.forEach(key => {
      const spec = specs[key] || {};
      html += `
        <div class="phone-card">
          <div style="display:flex; justify-content:space-between;">
            <strong>${spec.name}</strong>
            <span style="font-size:12px; color:#00f0ff;">Top: ${Math.floor((spec.maxSpeed || 35) * 2.3)} MPH</span>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick="window.game.economy.summonVehicle('${key}'); window.gameUI.togglePhone();">Summon Vehicle Here</button>
        </div>
      `;
    });
    html += `</div>`;
    bodyEl.innerHTML = html;
  },

  renderRadio(bodyEl) {
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
  },

  renderGallery(game, bodyEl) {
    const photos = game.cameraSystem.capturedPhotos;
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
  },

  renderBank(game, bodyEl) {
    bodyEl.innerHTML = `
      <div class="phone-app-header"><h3>🏦 First National Mobile Banking</h3></div>
      <div class="phone-list">
        <div class="phone-card">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">ACCOUNT HOLDER: CITIZEN #08492</div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>💵 Cash in Wallet:</span>
            <strong style="color:#2ecc71;">$${game.economy.cash.toLocaleString()}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>💳 Bank Balance:</span>
            <strong style="color:#00f0ff;">$${game.economy.bank.toLocaleString()}</strong>
          </div>
        </div>
        <div class="phone-card" style="border-left: 3px solid #f1c40f;">
          <h4 style="margin:0 0 4px; font-size:12px; color:#f1c40f;">⚠️ PHYSICAL CASH RESTRICTION</h4>
          <p style="font-size:11px; color:#cbd5e1; margin:0;">
            Under state banking laws, physical currency deposits and withdrawals cannot be processed electronically via smartphone. Please visit <strong>First National Bank</strong> or any physical <strong>ATM Kiosk</strong> in the city.
          </p>
        </div>
        <button class="btn btn-primary" style="margin-top:8px; width:100%; padding:10px;" onclick="window.game.economy.locateBank();">
          📍 GPS Route to First National Bank / ATM
        </button>
      </div>
    `;
  },

  renderAvatar(game, bodyEl) {
    bodyEl.innerHTML = `
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
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'cap'});">Baseball Cap</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({headwear:'beanie'});">Beanie</button>
          </div>
        </div>

        <div class="phone-card">
          <h4>Eyewear</h4>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'none'});">None</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'sunglasses'});">Aviators</button>
            <button class="btn btn-sm btn-secondary" onclick="window.game.player.setCustomization({eyewear:'cyber_visor'});">Cyber Visor</button>
          </div>
        </div>
      </div>
    `;
  }
};

