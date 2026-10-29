// ============================================================
// CITY VIBES - APEX CONSTRUCTION CO. RENOVATION SYSTEM
// ============================================================

window.ConstructionSystem = {
  renovatePropertyAtCompany(economy, propertyId) {
    const prop = economy.properties[propertyId];
    if (!prop || !prop.owned) return false;

    if (economy.spendCash(prop.renovationCost)) {
      prop.level += 1;
      prop.rentIncome = Math.round(prop.rentIncome * 1.55);
      prop.renovationCost = Math.round(prop.renovationCost * 1.8);

      if (window.soundManager) {
        window.soundManager.playCash();
        window.soundManager.playMissionSuccess();
      }

      if (window.gameUI) {
        window.gameUI.showNotification(
          `🔨 RENOVATION COMPLETE! ${prop.name} upgraded to Level ${prop.level}! New rent yield: +$${prop.rentIncome.toLocaleString()}/cycle!`,
          'property',
          7000
        );
      }
      economy.saveState();
      return true;
    } else {
      if (window.soundManager) window.soundManager.playNotification(false);
      if (window.gameUI) {
        window.gameUI.showNotification(`❌ Insufficient cash for renovation contract! Need $${prop.renovationCost.toLocaleString()}`, 'error');
      }
      return false;
    }
  }
};

