// ============================================================
// CITY VIBES - ECONOMY, REAL ESTATE, CARS & SHOPS
// ============================================================

class EconomyManager {
  constructor(game) {
    this.game = game;

    // Player Financials
    this.cash = 3500;
    this.bank = 5000;

    // Real Estate Properties
    this.properties = {
      motel_studio: {
        id: 'motel_studio',
        name: 'Sunset Motel Studio #4',
        type: 'Studio Apartment',
        desc: 'Cozy starter safehouse with kitchenette. Low maintenance.',
        price: 3500,
        rentIncome: 250,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 1500
      },
      suburban_villa: {
        id: 'suburban_villa',
        name: 'Maple Grove Family Bungalow',
        type: 'Suburban House',
        desc: 'Charming 3-bedroom house with driveway and garden.',
        price: 24000,
        rentIncome: 1200,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 8000
      },
      downtown_loft: {
        id: 'downtown_loft',
        name: 'Neo-Tokyo Brick Loft',
        type: 'Luxury Loft',
        desc: 'Stylish exposed-brick loft right in the entertainment district.',
        price: 55000,
        rentIncome: 2800,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 18000
      },
      docks_warehouse: {
        id: 'docks_warehouse',
        name: 'Pier 9 Commercial Hub',
        type: 'Industrial Warehouse',
        desc: 'Spacious distribution depot with high leasing yields.',
        price: 90000,
        rentIncome: 5000,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 30000
      },
      penthouse: {
        id: 'penthouse',
        name: 'Citadel Skyline Penthouse',
        type: 'Sky Penthouse',
        desc: 'Top floor of the downtown Citadel tower. The pinnacle of power.',
        price: 150000,
        rentIncome: 7500,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 50000
      },
      ocean_mansion: {
        id: 'ocean_mansion',
        name: 'Harbor Crest Seaside Mansion',
        type: 'Ultra Luxury Estate',
        desc: 'Private oceanfront villa with infinity pool and private yacht dock.',
        price: 280000,
        rentIncome: 16000,
        owned: false,
        isRented: false,
        level: 1,
        renovationCost: 90000
      }
    };

    // Owned Vehicles
    this.ownedVehicles = ['sedan'];

    // 24/7 SuperMart & Convenience Store Catalog
    this.storeCatalog = {
      medkit: {
        id: 'medkit',
        name: 'Military Field Medkit',
        icon: '💊',
        price: 150,
        desc: 'Instantly restores +60 HP health.',
        apply: () => {
          this.game.player.heal(60);
          if (window.soundManager) window.soundManager.playCash();
          this.game.ui.showNotification('💊 Used Field Medkit: +60 HP restored!', 'success');
        }
      },
      body_armor: {
        id: 'body_armor',
        name: 'Kevlar Tactical Vest',
        icon: '🛡️',
        price: 350,
        desc: 'Equips 100 Armor shielding to absorb gunfire & damage.',
        apply: () => {
          this.game.player.addArmor(100);
          if (window.soundManager) window.soundManager.playCash();
          this.game.ui.showNotification('🛡️ Equipped Kevlar Vest: +100 Armor active!', 'success');
        }
      },
      energy_drink: {
        id: 'energy_drink',
        name: 'Hyper Nitro Energy Can',
        icon: '⚡',
        price: 40,
        desc: 'Max stamina boost: Run at top sprint speed.',
        apply: () => {
          this.game.player.runSpeed = 14.5;
          setTimeout(() => { if (this.game.player) this.game.player.runSpeed = 11.5; }, 20000);
          if (window.soundManager) window.soundManager.playCash();
          this.game.ui.showNotification('⚡ Drank Nitro Energy: Hyper Speed boost active for 20s!', 'info');
        }
      },
      repair_kit: {
        id: 'repair_kit',
        name: 'Roadside Repair Toolkit',
        icon: '🔧',
        price: 250,
        desc: 'Instantly fixes your current car condition to 100%.',
        apply: () => {
          const v = this.game.vehicleManager.activeVehicle;
          if (v) {
            v.condition = 100;
            this.game.ui.showNotification('🔧 Vehicle repaired to 100% condition!', 'success');
          } else {
            this.game.ui.showNotification('🔧 Repair kit saved in inventory.', 'info');
          }
        }
      },
      smoke_grenade: {
        id: 'smoke_grenade',
        name: 'Tactical Smoke Canister',
        icon: '🧨',
        price: 500,
        desc: 'Deploys dense smoke screen to evade and break police line-of-sight.',
        apply: () => {
          if (this.game.player.wantedStars > 0) {
            this.game.player.wantedStars = Math.max(0, this.game.player.wantedStars - 1);
            this.game.ui.updateWantedHUD(this.game.player.wantedStars);
            this.game.ui.showNotification('💨 Smoke Canister deployed! Police lost track of you (-1 Star)!', 'success');
          } else {
            this.game.ui.showNotification('💨 Smoke deployed!', 'info');
          }
        }
      }
    };

    this.robberyCooldowns = {};

    // Owned Outfits
    this.ownedOutfits = ['casual'];

    // Passive Rent Timer (every 45 seconds)
    this.rentCycleDuration = 45;
    this.rentTimer = this.rentCycleDuration;

    // Floating Cash Pickups in 3D world
    this.cashPickups = [];

    // Load saved game from LocalStorage
    this.loadState();
  }

  spawnCashPickup(pos, amount = 150) {
    const group = new THREE.Group();
    group.position.set(pos.x, 0.4, pos.z);

    // Cash stack bundle mesh
    const stackGeo = new THREE.BoxGeometry(0.8, 0.35, 0.5);
    const stackMat = new THREE.MeshPhongMaterial({ color: 0x27ae60, shininess: 80 });
    const stack = new THREE.Mesh(stackGeo, stackMat);
    group.add(stack);

    // White paper band wrap
    const bandGeo = new THREE.BoxGeometry(0.82, 0.36, 0.16);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xf4f6f6 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    group.add(band);

    // Glowing green aura
    const glowGeo = new THREE.SphereGeometry(0.65, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x2ecc71,
      transparent: true,
      opacity: 0.35
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    this.game.scene.add(group);

    const pickup = {
      group: group,
      amount: amount,
      initialY: 0.4,
      animTimer: Math.random() * 5
    };

    this.cashPickups.push(pickup);
    return pickup;
  }

  collectPickup(pickup, idx) {
    this.addCash(pickup.amount);
    window.soundManager.playCash();

    if (window.gameUI) {
      window.gameUI.showNotification(`💵 +$${pickup.amount.toLocaleString()} Cash Picked Up!`, 'success', 3000);
    }

    this.game.scene.remove(pickup.group);
    this.cashPickups.splice(idx, 1);
  }

  addCash(amount) {
    this.cash += amount;
    if (window.gameUI) {
      window.gameUI.updateBalance(this.cash, this.bank);
    }
    this.saveState();
  }

  spendCash(amount) {
    if (this.cash >= amount) {
      this.cash -= amount;
      if (window.gameUI) {
        window.gameUI.updateBalance(this.cash, this.bank);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------
  // REAL ESTATE BUYING & RENTING
  // ------------------------------------------------------------

  buyProperty(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop) return false;
    if (prop.owned) {
      window.gameUI.showNotification('You already own this property!', 'info');
      return false;
    }

    if (this.spendCash(prop.price)) {
      prop.owned = true;
      prop.isRented = true; // Auto-rent for passive income!
      window.soundManager.playCash();
      window.soundManager.playMissionSuccess();

      if (window.gameUI) {
        window.gameUI.showNotification(
          `🏢 CONGRATULATIONS! You bought ${prop.name}! Now earning $${prop.rentIncome}/cycle in rent!`,
          'property',
          7000
        );
      }
      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient cash! Need $${prop.price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  togglePropertyRent(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop || !prop.owned) return;

    prop.isRented = !prop.isRented;
    window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(
        prop.isRented
          ? `🏢 ${prop.name} is now LEASED OUT to tenants! (+$${prop.rentIncome}/cycle)`
          : `🏠 ${prop.name} is now reserved as your PRIVATE SAFEHOUSE!`,
        'property'
      );
    }
    this.saveState();
  }

  upgradeProperty(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop || !prop.owned) return false;

    if (this.spendCash(prop.renovationCost)) {
      prop.level++;
      prop.rentIncome = Math.floor(prop.rentIncome * 1.5);
      prop.renovationCost = Math.floor(prop.renovationCost * 1.7);
      window.soundManager.playCash();

      if (window.gameUI) {
        window.gameUI.showNotification(
          `✨ Renovated ${prop.name} to Level ${prop.level}! New Rent Yield: $${prop.rentIncome}/cycle!`,
          'success'
        );
      }
      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Need $${prop.renovationCost.toLocaleString()} to renovate!`, 'error');
      }
      return false;
    }
  }

  collectRentCycle() {
    let totalRent = 0;
    const rentedProps = [];

    Object.values(this.properties).forEach(prop => {
      if (prop.owned && prop.isRented) {
        totalRent += prop.rentIncome;
        rentedProps.push(prop.name);
      }
    });

    if (totalRent > 0) {
      this.bank += totalRent;
      window.soundManager.playCash();
      if (window.gameUI) {
        window.gameUI.updateBalance(this.cash, this.bank);
        window.gameUI.showNotification(
          `📈 REAL ESTATE YIELD: Collected +$${totalRent.toLocaleString()} rent from ${rentedProps.length} properties! Deposited to Bank.`,
          'rent',
          6000
        );
      }
      this.saveState();
    }
  }

  // ------------------------------------------------------------
  // CAR DEALERSHIP & GARAGE SUMMONING
  // ------------------------------------------------------------

  buyVehicle(typeKey) {
    const spec = this.game.vehicleManager.specs[typeKey];
    if (!spec) return false;

    if (this.ownedVehicles.includes(typeKey)) {
      window.gameUI.showNotification(`You already own the ${spec.name}!`, 'info');
      return false;
    }

    if (this.spendCash(spec.price)) {
      this.ownedVehicles.push(typeKey);
      window.soundManager.playCash();
      window.soundManager.playMissionSuccess();

      if (window.gameUI) {
        window.gameUI.showNotification(
          `🏎️ VEHICLE DELIVERED! Purchased ${spec.name}! Summon anytime via your phone's Garage App!`,
          'vehicle',
          7000
        );
      }

      // Spawn it in front of dealership
      this.game.vehicleManager.createVehicle(typeKey, this.game.player.position.clone().add(new THREE.Vector3(5, 0, 5)), 0);

      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient funds! Need $${spec.price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  summonVehicle(typeKey) {
    if (!this.ownedVehicles.includes(typeKey)) return false;

    const playerPos = this.game.player.position;
    const spawnPos = playerPos.clone().add(new THREE.Vector3(4, 0.4, 4));

    // Create the vehicle near player
    const v = this.game.vehicleManager.createVehicle(typeKey, spawnPos, this.game.player.heading);

    window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(`🚗 Valet: Your ${v.spec.name} has been delivered right next to you!`, 'vehicle');
    }
    return true;
  }

  // ------------------------------------------------------------
  // CLOTHES & ARMORY SHOPS
  // ------------------------------------------------------------

  buyOutfit(outfitId, price) {
    if (this.ownedOutfits.includes(outfitId)) {
      this.game.player.setOutfit(outfitId);
      return true;
    }

    if (this.spendCash(price)) {
      this.ownedOutfits.push(outfitId);
      window.soundManager.playCash();
      this.game.player.setOutfit(outfitId);
      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient funds! Need $${price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  buyArmoryItem(itemId, price) {
    if (this.game.player.ownedWeapons.includes(itemId) && itemId !== 'armor') {
      this.game.player.currentWeaponKey = itemId;
      this.game.player.isWeaponDrawn = true;
      this.game.player.updateWeaponVisibility();
      window.gameUI.showNotification(`Equipped: ${this.game.player.weapons[itemId].name}!`, 'info');
      return true;
    }

    if (this.spendCash(price)) {
      window.soundManager.playCash();
      if (itemId === 'armor') {
        this.game.player.armor = 100;
        window.gameUI.showNotification('🛡️ Heavy Kevlar Body Armor Equipped (+100 Armor)', 'success');
      } else if (itemId === 'pistol_silenced') {
        if (!this.game.player.ownedWeapons.includes('pistol_silenced')) {
          this.game.player.ownedWeapons.push('pistol_silenced');
        }
        this.game.player.currentWeaponKey = 'pistol_silenced';
        this.game.player.isWeaponDrawn = false; // Holstered by default for safety!
        this.game.player.buildFpsViewModel();
        this.game.player.updateWeaponVisibility();
        window.gameUI.showNotification('🔫 Silenced 9mm Acquired & Holstered! Press [G] to draw when ready.', 'success', 6000);
      } else if (itemId === 'sniper_silenced') {
        if (!this.game.player.ownedWeapons.includes('sniper_silenced')) {
          this.game.player.ownedWeapons.push('sniper_silenced');
        }
        this.game.player.currentWeaponKey = 'sniper_silenced';
        this.game.player.isWeaponDrawn = false;
        this.game.player.buildFpsViewModel();
        this.game.player.updateWeaponVisibility();
        window.gameUI.showNotification('🎯 Ghost Marksman Silenced Sniper Acquired! Press [G] to draw, Right Click to Aim Scope!', 'success', 7000);
      }
      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient funds! Need $${price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  // ------------------------------------------------------------
  // CONVENIENCE STORE & HEIST SYSTEM
  // ------------------------------------------------------------

  buyStoreItem(itemId) {
    const item = this.storeCatalog[itemId];
    if (!item) return false;

    if (this.cash >= item.price) {
      this.cash -= item.price;
      this.updateBalanceUI();
      item.apply();
      this.saveState();
      return true;
    } else {
      window.soundManager.playNotification(false);
      this.game.ui.showNotification(`❌ Insufficient cash! Need $${item.price}`, 'error');
      return false;
    }
  }

  robStoreRegister(storeId = 'general') {
    const now = Date.now();
    const lastRobbed = this.robberyCooldowns[storeId] || 0;
    if (now - lastRobbed < 45000) {
      const waitSec = Math.ceil((45000 - (now - lastRobbed)) / 1000);
      this.game.ui.showNotification(`⚠️ Register is empty! Cleaned out recently. Wait ${waitSec}s.`, 'warning');
      return;
    }

    this.robberyCooldowns[storeId] = now;
    const loot = 850 + Math.floor(Math.random() * 1650);
    this.cash += loot;
    this.updateBalanceUI();

    // Trigger alarms & Police alert!
    if (window.soundManager) {
      window.soundManager.playAlarmSound();
      window.soundManager.playCash();
    }
    this.game.player.addPoliceHeat(2); // 2 Stars

    this.game.ui.showNotification(
      `🚨 STORE ROBBERY! Grabbed +$${loot.toLocaleString()} cash from register! Clerk called 911! Escape the Police!`,
      'error',
      7000
    );
    this.saveState();
  }

  robBankVault() {
    const now = Date.now();
    const lastHeist = this.robberyCooldowns['bank_vault'] || 0;
    if (now - lastHeist < 120000) {
      this.game.ui.showNotification('⚠️ Bank vault is locked on emergency high-security lockdown!', 'warning');
      return;
    }

    this.robberyCooldowns['bank_vault'] = now;
    const loot = 15000 + Math.floor(Math.random() * 15000);
    this.cash += loot;
    this.updateBalanceUI();

    if (window.soundManager) {
      window.soundManager.playAlarmSound();
      window.soundManager.playCash();
    }
    this.game.player.addPoliceHeat(4); // 4 Stars manhunt!

    this.game.ui.showNotification(
      `🏦 MAJOR HEIST: Cracked First National Bank Vault! Scored +$${loot.toLocaleString()} cash! 4-STAR POLICE MANHUNT!`,
      'error',
      8000
    );
    this.saveState();
  }

  fastTravelTaxi(targetCityKey) {
    const world = this.game.world;
    if (!world || !world.cities || !world.cities[targetCityKey]) return;

    const fee = 200;
    if (this.cash < fee) {
      this.game.ui.showNotification('❌ Need $200 for Taxi cab fare!', 'error');
      return;
    }

    this.cash -= fee;
    this.updateBalanceUI();

    const city = world.cities[targetCityKey];
    const spawnPos = city.center.clone().add(new THREE.Vector3(0, 1.2, 12));

    if (this.game.vehicleManager.activeVehicle) {
      this.game.vehicleManager.activeVehicle.group.position.copy(spawnPos);
      this.game.vehicleManager.activeVehicle.speed = 0;
    } else {
      this.game.player.setPosition(spawnPos);
    }

    window.soundManager.playNotification(true);
    this.game.ui.closeAllModals();
    if (this.game.ui.isPhoneOpen) this.game.ui.togglePhone();

    this.game.ui.showCityWelcome(city.name, city.tagline);
    this.game.ui.showNotification(`🚖 Cab ride completed: Arrived at ${city.name} (-$${fee})`, 'info', 5000);
  }

  // ------------------------------------------------------------
  // PERSISTENCE (LOCAL STORAGE)
  // ------------------------------------------------------------

  saveState() {
    try {
      const data = {
        cash: this.cash,
        bank: this.bank,
        properties: this.properties,
        ownedVehicles: this.ownedVehicles,
        ownedOutfits: this.ownedOutfits,
        currentOutfit: this.game.player ? this.game.player.currentOutfit : 'casual'
      };
      localStorage.setItem('city_vibes_save', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  loadState() {
    try {
      const raw = localStorage.getItem('city_vibes_save');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.cash !== undefined) this.cash = data.cash;
        if (data.bank !== undefined) this.bank = data.bank;
        if (data.properties) {
          Object.keys(data.properties).forEach(k => {
            if (this.properties[k]) {
              Object.assign(this.properties[k], data.properties[k]);
            }
          });
        }
        if (data.ownedVehicles) this.ownedVehicles = data.ownedVehicles;
        if (data.ownedOutfits) this.ownedOutfits = data.ownedOutfits;
      }
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
  }

  update(delta) {
    // Passive rent cycle ticker
    this.rentTimer -= delta;
    if (this.rentTimer <= 0) {
      this.rentTimer = this.rentCycleDuration;
      this.collectRentCycle();
    }

    // Animate & collect cash pickups
    const playerPos = this.game.vehicleManager.activeVehicle
      ? this.game.vehicleManager.activeVehicle.group.position
      : this.game.player.position;

    for (let i = this.cashPickups.length - 1; i >= 0; i--) {
      const p = this.cashPickups[i];
      p.animTimer += delta * 3.5;
      p.group.rotation.y += delta * 2.2;
      p.group.position.y = p.initialY + Math.sin(p.animTimer) * 0.15;

      const dist = p.group.position.distanceTo(playerPos);
      if (dist < 3.2) {
        this.collectPickup(p, i);
      }
    }
  }
}

window.EconomyManager = EconomyManager;

