// ============================================================
// CITY VIBES - NPC & TRAFFIC MANAGER
// ============================================================

class PedestrianManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    this.pedestrians = [];
    this.targets = [];
    this.trafficCars = [];

    // Police Cruiser & Armed Officer on foot
    this.policeCruiser = null;
    this.policeOfficer = null;
    this.policeSirenTimer = 0;
    this.brandishAlertTimer = 0;

    this.init();
  }

  init() {
    this.spawnAmbientPedestrians(28);
    window.TrafficSystem.spawnTraffic(this, 12);
  }

  spawnAmbientPedestrians(count = 28) {
    const colors = [0x34495e, 0x16a085, 0x8e44ad, 0xd35400, 0x2c3e50, 0x7f8c8d];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 440;
      const rz = (Math.random() - 0.5) * 440;
      const col = colors[Math.floor(Math.random() * colors.length)];

      const pedMesh = window.PedestrianHelper.createHumanoidMesh(col, false);
      pedMesh.position.set(rx, 0, rz);
      this.scene.add(pedMesh);

      const angle = Math.random() * Math.PI * 2;
      this.pedestrians.push({
        mesh: pedMesh,
        speed: 1.8 + Math.random() * 1.2,
        direction: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
        changeTimer: 3 + Math.random() * 5,
        isPanicked: false,
        panicTimer: 0,
        isDead: false,
        isTarget: false
      });
    }
  }

  triggerPublicBrandishPanic(playerPos) {
    let witnessCount = 0;

    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.isDead) continue;

      const dist = p.mesh.position.distanceTo(playerPos);
      if (dist < 22) {
        witnessCount++;
        p.isPanicked = true;
        p.panicTimer = 6.0;
        p.speed = 8.5;

        const awayDir = p.mesh.position.clone().sub(playerPos);
        awayDir.y = 0;
        awayDir.normalize();
        p.direction.copy(awayDir);

        const u = p.mesh.userData;
        u.armL.rotation.z = 2.4;
        u.armR.rotation.z = -2.4;
      }
    }

    if (witnessCount > 0) {
      this.brandishAlertTimer += 0.016;
      if (this.brandishAlertTimer > 2.5) {
        this.brandishAlertTimer = 0;
        if (window.game && window.game.player.wantedStars < 2) {
          window.game.player.addPoliceHeat(1);
          if (window.gameUI) {
            window.gameUI.showNotification('🚨 911 CALL: "Citizen reported a gunman on the street!" Police dispatched!', 'error', 5000);
          }
        }
      }
    } else {
      this.brandishAlertTimer = Math.max(0, this.brandishAlertTimer - 0.01);
    }
  }

  spawnContractTarget(contract) {
    return window.TargetsSystem.spawnTarget(this, contract);
  }

  removeTarget(contractId) {
    window.TargetsSystem.removeTarget(this, contractId);
  }

  damageTarget(target, damage) {
    window.TargetsSystem.damageTarget(this, target, damage);
  }

  killTarget(target) {
    window.TargetsSystem.killTarget(this, target);
  }

  spawnPoliceCruiser(nearPos) {
    window.PoliceSystem.spawnCruiser(this, nearPos);
  }

  removePoliceCruiser() {
    window.PoliceSystem.removeCruiser(this);
  }

  spawnPoliceOfficer(nearPos) {
    window.PoliceSystem.spawnOfficer(this, nearPos);
  }

  removePoliceOfficer() {
    window.PoliceSystem.removeOfficer(this);
  }

  spawnBulletTracer(from, to, didHit) {
    window.PoliceSystem.spawnBulletTracer(this.scene, from, to);
  }

  update(delta) {
    // 1. Pedestrians
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (p.isDead) continue;

      if (p.isPanicked) {
        p.panicTimer -= delta;
        if (p.panicTimer <= 0) {
          p.isPanicked = false;
          p.speed = 1.8 + Math.random() * 1.2;
          const u = p.mesh.userData;
          u.armL.rotation.z = 0;
          u.armR.rotation.z = 0;
        }
      } else {
        p.changeTimer -= delta;
        if (p.changeTimer <= 0) {
          p.changeTimer = 4 + Math.random() * 6;
          const angle = Math.random() * Math.PI * 2;
          p.direction.set(Math.cos(angle), 0, Math.sin(angle));
        }
      }

      const move = p.direction.clone().multiplyScalar(p.speed * delta);
      const nextPos = p.mesh.position.clone().add(move);

      if (Math.abs(nextPos.x) > 440 || Math.abs(nextPos.z) > 440) {
        p.direction.negate();
      } else {
        p.mesh.position.copy(nextPos);
      }

      p.mesh.rotation.y = Math.atan2(p.direction.x, p.direction.z);

      const u = p.mesh.userData;
      u.animTime += delta * p.speed * 4;
      const legAngle = Math.sin(u.animTime) * 0.45;
      u.legL.rotation.x = legAngle;
      u.legR.rotation.x = -legAngle;
      if (!p.isPanicked) {
        u.armL.rotation.x = -legAngle;
        u.armR.rotation.x = legAngle;
      }
    }

    // 2. Guild Targets
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (t.isDead) continue;

      const dest = t.patrolPoints[t.currentPatrolIdx];
      const diff = dest.clone().sub(t.mesh.position);
      diff.y = 0;
      const dist = diff.length();

      if (dist < 1.5) {
        t.currentPatrolIdx = (t.currentPatrolIdx + 1) % t.patrolPoints.length;
      } else {
        diff.normalize();
        t.mesh.position.addScaledVector(diff, t.speed * delta);
        t.mesh.rotation.y = Math.atan2(diff.x, diff.z);

        const u = t.mesh.userData;
        u.animTime += delta * t.speed * 4;
        const legAngle = Math.sin(u.animTime) * 0.45;
        u.legL.rotation.x = legAngle;
        u.legR.rotation.x = -legAngle;
        u.armL.rotation.x = -legAngle;
        u.armR.rotation.x = legAngle;
      }

      if (t.mesh.reticle) {
        t.mesh.reticle.rotation.z += delta * 2;
      }
    }

    // 3. Police Pursuits
    if (window.game && window.game.player.wantedStars >= 1) {
      const player = window.game.player;
      const isDriving = !!(window.game.vehicleManager && window.game.vehicleManager.activeVehicle);
      const playerPos = player.position;

      if (!this.policeCruiser) {
        this.spawnPoliceCruiser(playerPos);
      }

      if (this.policeCruiser) {
        const diff = playerPos.clone().sub(this.policeCruiser.group.position);
        diff.y = 0;
        const dist = diff.length();

        if (isDriving) {
          if (dist > 5.0) {
            diff.normalize();
            this.policeCruiser.group.position.addScaledVector(diff, this.policeCruiser.speed * delta);
            this.policeCruiser.group.rotation.y = Math.atan2(diff.x, diff.z);
          } else {
            const v = window.game.vehicleManager.activeVehicle;
            v.speed *= 0.88;
            v.condition = Math.max(10, (v.condition || 100) - 5 * delta);
          }

          if (this.policeOfficer) {
            this.removePoliceOfficer();
          }
        } else {
          if (dist > 18.0) {
            diff.normalize();
            this.policeCruiser.group.position.addScaledVector(diff, this.policeCruiser.speed * delta);
            this.policeCruiser.group.rotation.y = Math.atan2(diff.x, diff.z);
          }

          if (!this.policeOfficer) {
            this.spawnPoliceOfficer(this.policeCruiser.group.position);
          }
        }

        this.policeSirenTimer += delta * 15;
        const flash = Math.sin(this.policeSirenTimer) > 0;
        this.policeCruiser.redLight.material.color.setHex(flash ? 0xff0022 : 0x220000);
        this.policeCruiser.blueLight.material.color.setHex(!flash ? 0x0066ff : 0x000033);
      }

      if (this.policeOfficer && !isDriving) {
        const cop = this.policeOfficer;
        const diff = playerPos.clone().sub(cop.group.position);
        diff.y = 0;
        const dist = diff.length();

        if (dist > 2.2) {
          diff.normalize();
          cop.group.position.addScaledVector(diff, cop.speed * delta);
          cop.group.rotation.y = Math.atan2(diff.x, diff.z);

          cop.animTime += delta * 12;
          const legAngle = Math.sin(cop.animTime) * 0.6;
          cop.legL.rotation.x = legAngle;
          cop.legR.rotation.x = -legAngle;
          cop.armL.rotation.x = -legAngle * 0.7;
        }

        cop.shootTimer += delta;
        if (cop.shootTimer > 1.6 && dist < 38.0 && dist > 3.0) {
          cop.shootTimer = 0;
          if (window.soundManager) window.soundManager.playGunshot(false);

          const fromPos = cop.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
          const targetPos = playerPos.clone().add(new THREE.Vector3(0, 1.2, 0));

          const isPlayerMoving = window.game.input && (window.game.input.forward || window.game.input.sprint);
          const hitChance = isPlayerMoving ? 0.35 : 0.55;
          const didHit = Math.random() < hitChance;

          if (!didHit) {
            targetPos.x += (Math.random() - 0.5) * 3.5;
            targetPos.z += (Math.random() - 0.5) * 3.5;
          }

          this.spawnBulletTracer(fromPos, targetPos, didHit);

          if (didHit && !player.isBusted) {
            player.takeDamage(12, 'police');
          } else {
            if (window.gameUI && Math.random() < 0.4) {
              window.gameUI.showNotification('👮 POLICE: "Stop right there! Drop your weapon!"', 'warning', 2500);
            }
          }
        }

        if (dist <= 2.5 && !player.isBusted) {
          if (player.health <= 10) {
            window.game.triggerBustedSequence();
          } else {
            cop.pinTimer += delta;
            if (cop.pinTimer > 2.0 && player.isConcealed) {
              window.game.triggerBustedSequence();
            }
          }
        } else {
          cop.pinTimer = 0;
        }
      }
    } else {
      if (this.policeCruiser) this.removePoliceCruiser();
      if (this.policeOfficer) this.removePoliceOfficer();
    }

    // 4. Traffic Cars
    window.TrafficSystem.updateTraffic(this, delta);
  }
}

window.PedestrianManager = PedestrianManager;
