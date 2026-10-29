// ============================================================
// CITY VIBES - BANKING & ATM TRANSACTIONS
// ============================================================

window.BankingSystem = {
  depositCashAtATM(economy, amount) {
    if (amount === 'all') amount = economy.cash;
    amount = Math.min(economy.cash, Math.max(0, parseInt(amount) || 0));
    if (amount <= 0) {
      if (window.gameUI) window.gameUI.showNotification('❌ No cash in wallet to deposit!', 'warning');
      return;
    }

    economy.cash -= amount;
    economy.bank += amount;
    economy.updateBalanceUI();
    if (window.soundManager) window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification(`🏦 ATM Deposit Successful: +$${amount.toLocaleString()} deposited into bank account.`, 'success');
    }
    economy.saveState();
  },

  withdrawCashAtATM(economy, amount) {
    if (amount === 'all') amount = economy.bank;
    amount = Math.min(economy.bank, Math.max(0, parseInt(amount) || 0));
    if (amount <= 0) {
      if (window.gameUI) window.gameUI.showNotification('❌ Insufficient funds in bank account!', 'warning');
      return;
    }

    economy.bank -= amount;
    economy.cash += amount;
    economy.updateBalanceUI();
    if (window.soundManager) window.soundManager.playCash();
    if (window.gameUI) {
      window.gameUI.showNotification(`💵 ATM Withdrawal Successful: -$${amount.toLocaleString()} withdrawn from bank into wallet.`, 'success');
    }
    economy.saveState();
  },

  robBankVault(economy) {
    const now = Date.now();
    if (now - (economy.lastBankRobberyTime || 0) < 90000) {
      const waitSec = Math.ceil((90000 - (now - economy.lastBankRobberyTime)) / 1000);
      if (window.gameUI) {
        window.gameUI.showNotification(`⚠️ Central Vault is on high-security lockdown! Police are patrolling. Wait ${waitSec}s.`, 'warning');
      }
      return;
    }

    economy.lastBankRobberyTime = now;
    const heistLoot = 15000 + Math.floor(Math.random() * 15000);
    economy.cash += heistLoot;
    economy.updateBalanceUI();

    if (window.soundManager) {
      window.soundManager.playAlarmSound();
      window.soundManager.playMissionSuccess();
    }

    if (window.game && window.game.player) {
      window.game.player.addPoliceHeat(4); // 4-Star Heist Manhunt!
    }

    if (window.gameUI) {
      window.gameUI.showNotification(
        `🚨 BANK VAULT CRACKED! Stole +$${heistLoot.toLocaleString()} cash! 4-STAR POLICE PURSUIT ACTIVE! ESCAPE IMMEDIATELY!`,
        'error',
        8000
      );
    }
    economy.saveState();
  }
};

