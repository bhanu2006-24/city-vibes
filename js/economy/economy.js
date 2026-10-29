// ============================================================
// CITY VIBES - UNIFIED ECONOMY & FINANCIAL SYSTEM
// ============================================================

class EconomySystem {
  constructor(game) {
    this.game = game;

    this.cash = 1500;
    this.bank = 8500;

    this.properties = window.RealEstateData ? JSON.parse(JSON.stringify(window.RealEstateData.properties)) : {};
    this.ownedVehicles = ['sedan'];
    this.storeCatalog = window.ShopsCatalog || {};
    this.robberyCooldowns = {};
    this.lastBankRobberyTime = 0;

    this.rentCycleTimer = 0;
    this.rentInterval = 45; // Rent paid every 45s

    this.pickups = [];
    this.loadState();
  }

  spawnCashPickup(pos, amount = 150) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.35;

    const stackGeo = new THREE.BoxGeometry(0.7, 0.25, 0.45);
    const stackMat = new THREE.MeshPhongMaterial({
      color: 0x27ae60,
      shininess: 40
    });
    const stack = new THREE.Mesh(stackGeo, stackMat);
    group.add(stack);

    const bandGeo = new THREE.BoxGeometry(0.72, 0.26, 0.12);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const band = new THREE.Mesh(bandGeo, bandMat);
    group.add(band);

    const glowGeo = new THREE.RingGeometry(0.3, 0.7, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x2ecc71,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -0.2;
    group.add(glow);

    this.game.scene.add(group);

    const pickup = {
      group: group,
      amount: amount,
      createdAt: Date.now()
    };
    this.pickups.push(pickup);
    return pickup;
  }

  collectPickup(pickup, idx) {
    this.cash += pickup.amount;
    this.updateBalanceUI();
    if (window.soundManager) window.soundManager.playCash();

    if (window.gameUI) {
      window.gameUI.showNotification(`💰 Picked up +$${pickup.amount} Cash!`, 'cash');
    }

    this.game.scene.remove(pickup.group);
    this.pickups.splice(idx, 1);
    this.saveState();
  }

  addCash(amount) {
    this.cash += amount;
    this.updateBalanceUI();
    this.saveState();
  }

  spendCash(amount) {
    if (this.cash >= amount) {
      this.cash -= amount;
      this.updateBalanceUI();
      this.saveState();
      return true;
    }
    return false;
  }

  updateBalanceUI() {
    if (this.game && this.game.ui) {
      this.game.ui.updateBalance(this.cash, this.bank);
    } else if (window.gameUI) {
      window.gameUI.updateBalance(this.cash, this.bank);
    }
    const cashVal = document.getElementById('atm-cash-val');
    const bankVal = document.getElementById('atm-bank-val');
    if (cashVal) cashVal.innerText = `$${this.cash.toLocaleString()}`;
    if (bankVal) bankVal.innerText = `$${this.bank.toLocaleString()}`;
  }

  locatePropertyOnMap(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop) return;

    if (this.game.jobs) {
      this.game.jobs.setBeacon(prop.position, 0x2ecc71);
    }

    if (window.soundManager) window.soundManager.playNotification(true);
    if (this.game.ui.isPhoneOpen) this.game.ui.togglePhone();

    this.game.ui.showNotification(
      `📍 GPS Route Set to ${prop.name}! Follow green beacon to purchase on-site ($${prop.price.toLocaleString()}).`,
      'info',
      7000
    );
  }

  locateConstructionCompany() {
    const pos = new THREE.Vector3(-100, 1.0, 140);
    if (this.game.jobs) {
      this.game.jobs.setBeacon(pos, 0x00cec9);
    }
    if (window.soundManager) window.soundManager.playNotification(true);
    if (this.game.ui.isPhoneOpen) this.game.ui.togglePhone();
    this.game.ui.showNotification(
      '📍 GPS Route Set to Apex Construction Co. (Downtown Metropolis)! Follow cyan sky beacon to hire renovation contractors.',
      'info',
      7000
    );
  }

  locateBank() {
    const pos = new THREE.Vector3(12, 1.0, 195);
    if (this.game.jobs) {
      this.game.jobs.setBeacon(pos, 0x0984e3);
    }
    if (window.soundManager) window.soundManager.playNotification(true);
    if (this.game.ui.isPhoneOpen) this.game.ui.togglePhone();
    this.game.ui.showNotification(
      '📍 GPS Route Set to First National Bank & ATM! Follow blue sky beacon to deposit or withdraw cash.',
      'info',
      7000
    );
  }

  buyProperty(propertyId) {
    return this.buyPropertyOnSite(propertyId);
  }

  buyPropertyOnSite(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop) return false;
    if (prop.owned) {
      if (window.gameUI) window.gameUI.showNotification('You already own this property!', 'info');
      return false;
    }

    if (this.spendCash(prop.price)) {
      prop.owned = true;
      prop.isRented = true;
      if (window.soundManager) {
        window.soundManager.playCash();
        window.soundManager.playMissionSuccess();
      }

      if (window.gameUI) {
        window.gameUI.showNotification(
          `🏢 TITLE DEED PURCHASED ON-SITE! You now own ${prop.name}! Earning +$${prop.rentIncome.toLocaleString()}/cycle!`,
          'property',
          7000
        );
      }
      this.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient cash to purchase title deed! Need $${prop.price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  renovatePropertyAtCompany(propertyId) {
    return window.ConstructionSystem.renovatePropertyAtCompany(this, propertyId);
  }

  depositCashAtATM(amount) {
    window.BankingSystem.depositCashAtATM(this, amount);
  }

  withdrawCashAtATM(amount) {
    window.BankingSystem.withdrawCashAtATM(this, amount);
  }

  robBankVault() {
    window.BankingSystem.robBankVault(this);
  }

  togglePropertyRent(propertyId) {
    const prop = this.properties[propertyId];
    if (!prop || !prop.owned) return;
    prop.isRented = !prop.isRented;
    if (window.soundManager) window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(
        prop.isRented ? `🏢 ${prop.name} is now LEASED (Generating rent)` : `🛌 ${prop.name} is now a PRIVATE SAFEHOUSE (Heals HP)`,
        'info'
      );
    }
    this.saveState();
  }

  collectRentCycle() {
    let totalRent = 0;
    Object.values(this.properties).forEach(p => {
      if (p.owned && p.isRented) {
        totalRent += p.rentIncome;
      }
    });

    if (totalRent > 0) {
      this.bank += totalRent;
      this.updateBalanceUI();
      if (window.soundManager) window.soundManager.playCash();
      if (window.gameUI) {
        window.gameUI.showNotification(`💼 PASSIVE INCOME: +$${totalRent.toLocaleString()} direct deposited to your bank account!`, 'rent', 5000);
      }
      this.saveState();
    }
  }

  buyVehicle(typeKey) {
    const specs = this.game.vehicleManager.specs;
    const spec = specs[typeKey];
    if (!spec) return false;

    if (this.ownedVehicles.includes(typeKey)) {
      if (window.gameUI) window.gameUI.showNotification('Vehicle already in your garage!', 'info');
      return false;
    }

    if (this.spendCash(spec.price)) {
      this.ownedVehicles.push(typeKey);
      if (window.soundManager) {
        window.soundManager.playCash();
        window.soundManager.playMissionSuccess();
      }
      if (window.gameUI) {
        window.gameUI.showNotification(`🏎️ Purchased ${spec.name}! Delivered to personal garage.`, 'vehicle');
      }
      this.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient funds! Need $${spec.price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  summonVehicle(typeKey) {
    if (!this.ownedVehicles.includes(typeKey)) return;
    const playerPos = this.game.player.position;
    const spawnPos = playerPos.clone().add(new THREE.Vector3(4, 0.4, 2));

    this.game.vehicleManager.createVehicle(typeKey, spawnPos, this.game.player.heading);
    if (window.soundManager) window.soundManager.playHorn();
    if (window.gameUI) {
      window.gameUI.showNotification(`🚗 Valet delivered your ${this.game.vehicleManager.specs[typeKey].name} to your side!`, 'vehicle');
    }
  }

  buyOutfit(outfitId, price) {
    if (this.spendCash(price)) {
      this.game.player.setOutfit(outfitId);
      if (window.soundManager) window.soundManager.playCash();
      this.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient cash for this outfit! Need $${price}`, 'error');
      }
      return false;
    }
  }

  buyArmoryItem(itemId, price) {
    if (this.game.player.ownedWeapons.includes(itemId)) {
      if (window.gameUI) window.gameUI.showNotification('Weapon already owned in inventory!', 'info');
      return false;
    }

    if (this.spendCash(price)) {
      this.game.player.ownedWeapons.push(itemId);
      this.game.player.currentWeaponKey = itemId;
      this.game.player.isWeaponDrawn = true;
      this.game.player.isConcealed = false;
      this.game.player.buildFpsViewModel();
      this.game.player.updateWeaponVisibility();

      if (window.soundManager) {
        window.soundManager.playCash();
        window.soundManager.playGunshot(true);
      }
      if (window.gameUI) {
        window.gameUI.showNotification(
          `🔫 Purchased ${this.game.player.weapons[itemId].name}! Equipped in hand. Holster [G] in public to avoid police!`,
          'success',
          6000
        );
        window.gameUI.updateHolsterHUD(true);
      }
      this.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient cash for firearm! Need $${price.toLocaleString()}`, 'error');
      }
      return false;
    }
  }

  buyStoreItem(itemId) {
    const item = this.storeCatalog[itemId];
    if (!item) return false;

    if (this.cash >= item.price) {
      this.cash -= item.price;
      this.updateBalanceUI();
      item.apply(this.game.player);
      this.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (this.game.ui) {
        this.game.ui.showNotification(`❌ Insufficient cash! Need $${item.price}`, 'error');
      }
      return false;
    }
  }

  robStoreRegister(storeId = 'general') {
    const now = Date.now();
    const lastRobbed = this.robberyCooldowns[storeId] || 0;
    if (now - lastRobbed < 45000) {
      const waitSec = Math.ceil((45000 - (now - lastRobbed)) / 1000);
      if (this.game.ui) {
        this.game.ui.showNotification(`⚠️ Register is empty! Cleaned out recently. Wait ${waitSec}s.`, 'warning');
      }
      return;
    }

    this.robberyCooldowns[storeId] = now;
    const loot = 850 + Math.floor(Math.random() * 1650);
    this.cash += loot;
    this.updateBalanceUI();

    if (window.soundManager) {
      window.soundManager.playAlarmSound();
      window.soundManager.playCash();
    }
    this.game.player.addPoliceHeat(2); // 2 Stars

    if (this.game.ui) {
      this.game.ui.showNotification(
        `🔫 REGISTER ROBBED! Snatched +$${loot.toLocaleString()} cash! 2-STAR ALARM TRIGGERED! FLEE THE STORE!`,
        'error',
        6000
      );
    }
    this.saveState();
  }

  fastTravelTaxi(districtId) {
    if (!this.spendCash(200)) {
      if (window.gameUI) window.gameUI.showNotification('❌ Need $200 cash for taxi fare!', 'error');
      return;
    }

    const d = window.WorldMapData.districts.find(item => item.id === districtId);
    if (!d) return;

    const targetPos = new THREE.Vector3(d.center.x, 1.2, d.center.z);
    this.game.player.setPosition(targetPos);
    this.game.player.velocity.set(0, 0, 0);

    if (this.game.vehicleManager.activeVehicle) {
      this.game.vehicleManager.activeVehicle.group.position.copy(targetPos);
      this.game.vehicleManager.activeVehicle.speed = 0;
    }

    if (window.soundManager) {
      window.soundManager.playHorn();
      window.soundManager.playCash();
    }

    if (this.game.ui && this.game.ui.isPhoneOpen) {
      this.game.ui.togglePhone();
    }

    if (this.game.ui && this.game.ui.isMinimapMaximized) {
      this.game.ui.toggleMinimapMaximized(false);
    }

    if (window.gameUI) {
      window.gameUI.showNotification(`🚖 Taxi dropped you off at ${d.name} (-$200 fare).`, 'success', 5000);
    }
  }

  saveState() {
    try {
      const state = {
        cash: this.cash,
        bank: this.bank,
        properties: this.properties,
        ownedVehicles: this.ownedVehicles,
        ownedWeapons: this.game.player ? this.game.player.ownedWeapons : ['fists']
      };
      localStorage.setItem('city_vibes_save', JSON.stringify(state));
    } catch (e) {}
  }

  loadState() {
    try {
      const saved = localStorage.getItem('city_vibes_save');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.cash !== undefined) this.cash = data.cash;
        if (data.bank !== undefined) this.bank = data.bank;
        if (data.properties) Object.assign(this.properties, data.properties);
        if (data.ownedVehicles) this.ownedVehicles = data.ownedVehicles;
        if (data.ownedWeapons && this.game && this.game.player) {
          this.game.player.ownedWeapons = data.ownedWeapons;
        }
      }
    } catch (e) {}
  }

  update(delta) {
    this.rentCycleTimer += delta;
    if (this.rentCycleTimer >= this.rentInterval) {
      this.rentCycleTimer = 0;
      this.collectRentCycle();
    }

    const playerPos = this.game.player.position;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.group.rotation.y += delta * 2;
      const dist = playerPos.distanceTo(p.group.position);
      if (dist < 2.0) {
        this.collectPickup(p, i);
      }
    }
  }
}

window.EconomySystem = EconomySystem;

