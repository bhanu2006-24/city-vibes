// ============================================================
// CITY VIBES - ASSASSIN CONTRACT TARGETS SYSTEM
// ============================================================

window.TargetsSystem = {
  spawnTarget(pm, contract) {
    this.removeTarget(pm, contract.id);

    const mesh = window.PedestrianHelper.createHumanoidMesh(0x111111, true, contract);
    mesh.position.copy(contract.spawnLocation);
    pm.scene.add(mesh);

    const target = {
      id: contract.id,
      name: contract.targetName,
      bounty: contract.bounty,
      mesh: mesh,
      health: 100,
      isDead: false,
      photoTaken: false,
      speed: 2.2,
      direction: new THREE.Vector3(1, 0, 0),
      patrolPoints: contract.patrolPoints || [
        contract.spawnLocation.clone(),
        contract.spawnLocation.clone().add(new THREE.Vector3(20, 0, 0)),
        contract.spawnLocation.clone().add(new THREE.Vector3(20, 0, 20)),
        contract.spawnLocation.clone().add(new THREE.Vector3(0, 0, 20))
      ],
      currentPatrolIdx: 0
    };

    pm.targets.push(target);
    return target;
  },

  removeTarget(pm, contractId) {
    const idx = pm.targets.findIndex(t => t.id === contractId);
    if (idx !== -1) {
      pm.scene.remove(pm.targets[idx].mesh);
      pm.targets.splice(idx, 1);
    }
  },

  damageTarget(pm, target, damage) {
    if (target.isDead) return;
    target.health -= damage;

    if (target.health <= 0) {
      this.killTarget(pm, target);
    }
  },

  killTarget(pm, target) {
    target.isDead = true;
    target.health = 0;

    target.mesh.rotation.x = Math.PI / 2;
    target.mesh.position.y = 0.25;

    if (target.mesh.reticle) {
      target.mesh.reticle.visible = false;
    }

    // Drop cash bundle from target
    if (window.game && window.game.economy) {
      window.game.economy.spawnCashPickup(target.mesh.position, 800);
    }

    if (window.gameUI) {
      window.gameUI.showNotification(
        `🎯 TARGET DOWN: ${target.name}! Dropped $800 cash. Open Camera (C) and snap photo of the body to claim $${target.bounty.toLocaleString()} bounty!`,
        'target_kill',
        7000
      );
    }
  }
};
