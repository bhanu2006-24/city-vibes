// ============================================================
// CITY VIBES - COMMERCE, SHOPS & CONVENIENCE STORES
// ============================================================

window.ShopsCatalog = {
  medkit: {
    id: 'medkit',
    name: 'Military Field Medkit',
    icon: '💊',
    price: 150,
    desc: 'Immediately restores +60 Health Points.',
    apply(player) {
      player.heal(60);
      if (window.soundManager) window.soundManager.playCash();
      if (window.gameUI) window.gameUI.showNotification('💊 Applied Field Medkit (+60 HP)', 'success');
    }
  },
  kevlar_armor: {
    id: 'kevlar_armor',
    name: 'Kevlar Tactical Armor Vest',
    icon: '🛡️',
    price: 350,
    desc: 'Equips +100 Armor shielding that absorbs damage before health.',
    apply(player) {
      player.addArmor(100);
      if (window.soundManager) window.soundManager.playCash();
      if (window.gameUI) window.gameUI.showNotification('🛡️ Equipped Kevlar Tactical Vest (100% Armor)', 'success');
    }
  },
  energy_drink: {
    id: 'energy_drink',
    name: 'Hyper Nitro Energy Can',
    icon: '⚡',
    price: 40,
    desc: 'Gives maximum sprint stamina & temporary speed boost.',
    apply(player) {
      player.runSpeed = 16.0;
      setTimeout(() => {
        player.runSpeed = 11.5;
      }, 20000);
      if (window.soundManager) window.soundManager.playCash();
      if (window.gameUI) window.gameUI.showNotification('⚡ Drank Hyper Nitro! Sprint speed boosted for 20s!', 'info');
    }
  },
  repair_kit: {
    id: 'repair_kit',
    name: 'Roadside Vehicle Repair Kit',
    icon: '🔧',
    price: 250,
    desc: 'Instantly restores vehicle condition to 100%.',
    apply(player) {
      if (window.game && window.game.vehicleManager && window.game.vehicleManager.activeVehicle) {
        window.game.vehicleManager.repairVehicle(window.game.vehicleManager.activeVehicle);
      } else {
        if (window.gameUI) window.gameUI.showNotification('🔧 Repair kit stashed in glovebox.', 'info');
      }
    }
  },
  smoke_grenade: {
    id: 'smoke_grenade',
    name: 'Tactical Smoke Canister',
    icon: '🧨',
    price: 500,
    desc: 'Deploys an instant smokescreen that loses police pursuit (-1 Star).',
    apply(player) {
      player.wantedStars = Math.max(0, player.wantedStars - 1);
      if (window.gameUI) {
        window.gameUI.updateWantedHUD(player.wantedStars);
        window.gameUI.showNotification('🧨 Smokescreen deployed! Lost police tail (-1 Star)', 'success');
      }
    }
  }
};

