// ============================================================
// CITY VIBES - PLAYER WEAPONS, BALLISTICS & STEALTH SYSTEM
// ============================================================

window.PlayerWeaponsData = {
  fists: {
    id: 'fists',
    name: 'Unarmed / Fists',
    damage: 25,
    range: 2.8,
    fireRate: 0.35,
    isSilenced: true,
    hasScope: false,
    price: 0
  },
  pistol_silenced: {
    id: 'pistol_silenced',
    name: 'Silenced 9mm Hitman Special',
    damage: 65,
    range: 55,
    fireRate: 0.25,
    isSilenced: true,
    hasScope: false,
    price: 3500
  },
  sniper_silenced: {
    id: 'sniper_silenced',
    name: 'Ghost Marksman Silenced Sniper (With Scope)',
    damage: 220,
    range: 220,
    fireRate: 0.85,
    isSilenced: true,
    hasScope: true,
    zoomFov: 14, // 8x Scope Zoom
    price: 9000
  }
};

window.PlayerWeaponsSystem = {
  buildFpsViewModel(player) {
    while (player.fpsWeaponGroup.children.length > 0) {
      player.fpsWeaponGroup.remove(player.fpsWeaponGroup.children[0]);
    }

    const isSniper = player.currentWeaponKey === 'sniper_silenced';

    // Barrel / Body
    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, isSniper ? 0.9 : 0.45);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.28, -0.25, -0.6);
    player.fpsWeaponGroup.add(gun);

    // Silencer cylinder at the tip
    const silencerGeo = new THREE.CylinderGeometry(0.035, 0.035, isSniper ? 0.4 : 0.28, 12);
    const silencerMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const silencer = new THREE.Mesh(silencerGeo, silencerMat);
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0.28, -0.25, isSniper ? -1.15 : -0.85);
    player.fpsWeaponGroup.add(silencer);

    // Scope tube (if sniper)
    if (isSniper) {
      const scopeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
      const scopeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const scope = new THREE.Mesh(scopeGeo, scopeMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0.28, -0.16, -0.6);
      player.fpsWeaponGroup.add(scope);
    }

    player.fpsWeaponGroup.visible = false;
  },

  toggleHolster(player) {
    if (player.ownedWeapons.length <= 1 && player.ownedWeapons[0] === 'fists') {
      if (window.gameUI) {
        window.gameUI.showNotification('⚠️ You are unarmed! Buy a silenced weapon at the Underground Armory.', 'warning');
      }
      return false;
    }

    player.isWeaponDrawn = !player.isWeaponDrawn;
    player.isConcealed = !player.isWeaponDrawn;

    if (player.isWeaponDrawn) {
      if (player.currentWeaponKey === 'fists') {
        const gun = player.ownedWeapons.find(w => w !== 'fists');
        if (gun) player.currentWeaponKey = gun;
      }
      window.soundManager.playGunshot(true);
      if (window.gameUI) {
        window.gameUI.showNotification(`⚠️ WEAPON DRAWN: ${player.weapons[player.currentWeaponKey].name}! Brandishing in public causes panic & alerts police!`, 'warning', 5000);
      }
    } else {
      player.currentWeaponKey = 'fists';
      player.isAiming = false;
      this.setScopeAim(player, false);
      if (window.gameUI) {
        window.gameUI.showNotification('🛡️ WEAPON CONCEALED: Hands empty. Civilian cover restored.', 'success', 4000);
      }
    }

    player.updateWeaponVisibility();
    if (window.gameUI) window.gameUI.updateHolsterHUD(player.isWeaponDrawn);
    return player.isWeaponDrawn;
  },

  setScopeAim(player, active) {
    const weapon = player.weapons[player.currentWeaponKey];
    player.isAiming = active && player.isWeaponDrawn;

    const scopeOverlay = document.getElementById('sniper-scope-overlay');

    if (player.isAiming && weapon.hasScope) {
      player.camera.fov = weapon.zoomFov || 15;
      player.camera.updateProjectionMatrix();

      if (scopeOverlay) {
        scopeOverlay.style.display = 'block';
        this.updateScopeDistanceReadout(player);
      }
    } else {
      player.camera.fov = 60;
      player.camera.updateProjectionMatrix();
      if (scopeOverlay) scopeOverlay.style.display = 'none';
    }
  },

  updateScopeDistanceReadout(player) {
    const distanceEl = document.getElementById('scope-target-distance');
    if (!distanceEl) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), player.camera);
    raycaster.far = 300;

    const checkMeshes = [];
    if (player.pedestrianManager && player.pedestrianManager.targets) {
      player.pedestrianManager.targets.forEach(t => checkMeshes.push(t.mesh));
    }
    player.scene.children.forEach(c => {
      if (c.isMesh && c !== player.meshGroup) checkMeshes.push(c);
    });

    const hits = raycaster.intersectObjects(checkMeshes, true);
    if (hits.length > 0) {
      const dist = Math.round(hits[0].distance);
      distanceEl.innerText = `${dist}m`;
    } else {
      distanceEl.innerText = '--m';
    }
  },

  attack(player) {
    const now = performance.now() * 0.001;
    const weapon = player.weapons[player.currentWeaponKey];
    if (now - player.lastAttackTime < weapon.fireRate) return;
    player.lastAttackTime = now;

    if (weapon.id !== 'fists' && !player.isWeaponDrawn) {
      this.toggleHolster(player);
      return;
    }

    if (weapon.id === 'fists') {
      window.soundManager.playGunshot(true);
      this.performHitscan(player, weapon.range, weapon.damage, false);
      return;
    }

    window.soundManager.playGunshot(weapon.isSilenced);

    if (player.muzzleFlash && player.viewMode === 'tps') {
      player.muzzleFlash.visible = true;
      setTimeout(() => {
        if (player.muzzleFlash) player.muzzleFlash.visible = false;
      }, 45);
    }

    player.pitch += 0.02;
    this.performHitscan(player, weapon.range, weapon.damage, weapon.hasScope && player.isAiming);
  },

  performHitscan(player, range, damage, isScopedSnipe = false) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), player.camera);
    raycaster.far = range;

    const pm = player.pedestrianManager;
    if (!pm) return;

    const targetMeshes = pm.targets.map(t => t.mesh);
    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      for (let i = 0; i < pm.targets.length; i++) {
        const target = pm.targets[i];
        let found = false;
        target.mesh.traverse(child => {
          if (child === hitObj) found = true;
        });

        if (found) {
          const hitDist = player.position.distanceTo(target.mesh.position);
          pm.damageTarget(target, damage);

          if (isScopedSnipe && hitDist >= 20) {
            if (window.gameUI) {
              window.gameUI.showNotification(
                `🎯 STEALTH ELIMINATION VERIFIED! Clean sniper takedown from ${Math.round(hitDist)}m! Zero witnesses. Now snap photo proof (C)!`,
                'success',
                7000
              );
            }
          } else {
            this.addPoliceHeat(player, 2);
            if (window.gameUI) {
              window.gameUI.showNotification(
                '🚨 SHOTS FIRED IN PUBLIC! Witnesses alerted police! Cops are in pursuit!',
                'error',
                6000
              );
            }
          }
          return;
        }
      }
    }

    // Check ambient pedestrians
    const pedMeshes = pm.pedestrians.map(p => p.mesh);
    const pedHits = raycaster.intersectObjects(pedMeshes, true);
    if (pedHits.length > 0) {
      const hitObj = pedHits[0].object;
      for (let i = 0; i < pm.pedestrians.length; i++) {
        const ped = pm.pedestrians[i];
        if (ped.isDead) continue;

        let found = false;
        ped.mesh.traverse(child => {
          if (child === hitObj) found = true;
        });

        if (found) {
          ped.isDead = true;
          ped.mesh.rotation.x = Math.PI / 2;
          ped.mesh.position.y = 0.25;

          const droppedCash = Math.floor(100 + Math.random() * 250);
          if (player.world && window.game.economy) {
            window.game.economy.spawnCashPickup(ped.mesh.position, droppedCash);
          }

          this.addPoliceHeat(player, 1);
          if (window.gameUI) {
            window.gameUI.showNotification(`💥 Civilian down! Dropped +$${droppedCash} cash! Police heat rising.`, 'error', 4000);
          }
          return;
        }
      }
    }
  },

  addPoliceHeat(player, stars) {
    player.wantedStars = Math.min(5, player.wantedStars + stars);
    player.heatCooldownTimer = 25;

    window.soundManager.toggleSiren(true);
    setTimeout(() => {
      if (player.wantedStars === 0) window.soundManager.toggleSiren(false);
    }, 8000);

    if (window.gameUI) {
      window.gameUI.updateWantedHUD(player.wantedStars);
    }
  },

  coolDownHeat(player, delta) {
    if (player.wantedStars <= 0) return;

    if (player.isConcealed) {
      player.heatCooldownTimer -= delta;
      if (player.heatCooldownTimer <= 0) {
        player.wantedStars = Math.max(0, player.wantedStars - 1);
        player.heatCooldownTimer = 20;

        if (player.wantedStars === 0) {
          window.soundManager.toggleSiren(false);
          if (window.gameUI) {
            window.gameUI.showNotification('🛡️ Police search called off. Heat cleared!', 'success');
          }
        }
        if (window.gameUI) window.gameUI.updateWantedHUD(player.wantedStars);
      }
    } else {
      player.heatCooldownTimer = 25;
    }
  }
};
