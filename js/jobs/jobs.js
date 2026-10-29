// ============================================================
// CITY VIBES - CAREERS & JOBS MANAGER
// ============================================================

class JobManager {
  constructor(game) {
    this.game = game;

    this.currentJob = null; // 'ambulance', 'delivery', 'taxi'
    this.activeMission = null;
    this.completedJobCount = 0;

    // Assassin Guild Contracts
    this.assassinContracts = window.AssassinGuildContracts || [];

    // Sky Waypoint Beacon Visual
    this.beaconGroup = null;
    this.beaconPos = null;
    this.createMissionBeacon();
  }

  createMissionBeacon() {
    this.beaconGroup = new THREE.Group();

    // 80m Tall Pulsing Holographic Light Beam
    const beamGeo = new THREE.CylinderGeometry(1.6, 2.4, 80, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    this.beaconCylinder = new THREE.Mesh(beamGeo, beamMat);
    this.beaconCylinder.position.y = 40;
    this.beaconGroup.add(this.beaconCylinder);

    const ringGeo = new THREE.RingGeometry(1.2, 3.8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconRing.rotation.x = -Math.PI / 2;
    this.beaconRing.position.y = 0.2;
    this.beaconGroup.add(this.beaconRing);

    this.beaconGroup.visible = false;
    this.game.scene.add(this.beaconGroup);
  }

  setBeacon(position, colorHex = 0x00ff88) {
    if (!this.beaconGroup) return;
    this.beaconPos = position.clone();
    this.beaconGroup.position.copy(position);
    this.beaconCylinder.material.color.setHex(colorHex);
    this.beaconRing.material.color.setHex(colorHex);
    this.beaconGroup.visible = true;
  }

  hideBeacon() {
    if (this.beaconGroup) {
      this.beaconGroup.visible = false;
      this.beaconPos = null;
    }
  }

  startAmbulanceShift() {
    window.AmbulanceJobSystem.startShift(this);
  }

  nextAmbulanceCall() {
    window.AmbulanceJobSystem.nextCall(this);
  }

  startDeliveryShift() {
    window.DeliveryJobSystem.startShift(this);
  }

  nextDeliveryOrder() {
    window.DeliveryJobSystem.nextOrder(this);
  }

  startTaxiShift() {
    window.TaxiJobSystem.startShift(this);
  }

  nextTaxiFare() {
    window.TaxiJobSystem.nextFare(this);
  }

  acceptAssassinContract(contractId) {
    const contract = this.assassinContracts.find(c => c.id === contractId);
    if (!contract || contract.completed) return false;

    contract.status = 'active';
    this.game.pedestrianManager.spawnContractTarget(contract);
    this.setBeacon(contract.spawnLocation, 0xff0044);

    if (window.soundManager) window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(`🕷️ CONTRACT ACCEPTED: Target ${contract.targetName}. Follow red waypoint beacon!`, 'assassin', 7000);
      window.gameUI.openPhoneApp('guild');
    }
    return true;
  }

  completeAssassinContract(contractId) {
    const contract = this.assassinContracts.find(c => c.id === contractId);
    if (!contract) return;

    contract.completed = true;
    contract.status = 'completed';
    this.game.economy.addCash(contract.bounty);

    if (window.soundManager) {
      window.soundManager.playMissionSuccess();
      window.soundManager.playCash();
    }

    if (window.gameUI) {
      window.gameUI.showBountyRewardModal(contract);
    }

    this.hideBeacon();
  }

  cancelCurrentJob() {
    this.currentJob = null;
    this.activeMission = null;
    this.hideBeacon();
    if (window.gameUI) {
      window.gameUI.hideJobHUD();
      window.gameUI.showNotification('Shift ended.', 'info');
    }
  }

  update(delta) {
    // Animate beacon cylinder & rings
    if (this.beaconGroup && this.beaconGroup.visible) {
      this.beaconCylinder.rotation.y += delta * 2;
      this.beaconRing.rotation.z += delta * 1.5;
      const pulse = 1.0 + Math.sin(Date.now() * 0.005) * 0.15;
      this.beaconRing.scale.set(pulse, pulse, 1);
    }

    if (!this.activeMission) return;
    const m = this.activeMission;

    // Countdown timers
    if (m.timeLeft !== undefined) {
      m.timeLeft -= delta;
      if (m.timeLeft <= 0) {
        if (window.soundManager) window.soundManager.playNotification(false);
        if (window.gameUI) {
          window.gameUI.showNotification('❌ MISSION FAILED: Ran out of time!', 'error', 5000);
          window.gameUI.hideJobHUD();
        }
        this.activeMission = null;
        this.hideBeacon();
        return;
      }
    }

    // Check Player Proximity
    const playerPos = this.game.player.position;

    // 1. Ambulance
    if (m.type === 'ambulance') {
      if (m.stage === 'pickup') {
        const d = playerPos.distanceTo(m.pickupPos);
        if (d < 5.0) {
          m.stage = 'dropoff';
          m.timeLeft = 80;
          this.setBeacon(m.dropoffPos, 0x2ecc71);
          if (window.soundManager) window.soundManager.playCash();
          if (window.gameUI) {
            window.gameUI.showNotification('🚑 Patient aboard! Rush to St. Jude Hospital ER!', 'ambulance');
            window.gameUI.updateJobHUD(m);
          }
        }
      } else if (m.stage === 'dropoff') {
        const d = playerPos.distanceTo(m.dropoffPos);
        if (d < 6.0) {
          this.game.economy.addCash(m.reward);
          this.completedJobCount++;
          if (window.soundManager) window.soundManager.playMissionSuccess();
          if (window.gameUI) {
            window.gameUI.showNotification(`🏥 Patient safely admitted! +$${m.reward} reward earned!`, 'success', 6000);
          }
          this.nextAmbulanceCall();
        }
      }
    }

    // 2. Delivery
    if (m.type === 'delivery') {
      if (m.stage === 'pickup_order') {
        const d = playerPos.distanceTo(m.pickupPos);
        if (d < 5.0) {
          m.stage = 'deliver';
          m.timeLeft = 65;
          this.setBeacon(m.dropoffPos, 0x00f0ff);
          if (window.soundManager) window.soundManager.playCash();
          if (window.gameUI) {
            window.gameUI.showNotification(`🍕 Fresh pizza collected! Deliver to ${m.customerName}!`, 'delivery');
            window.gameUI.updateJobHUD(m);
          }
        }
      } else if (m.stage === 'deliver') {
        const d = playerPos.distanceTo(m.dropoffPos);
        if (d < 5.0) {
          this.game.economy.addCash(m.reward);
          this.completedJobCount++;
          if (window.soundManager) window.soundManager.playMissionSuccess();
          if (window.gameUI) {
            window.gameUI.showNotification(`🍕 Pizza delivered piping hot! +$${m.reward} tips earned!`, 'success', 6000);
          }
          this.nextDeliveryOrder();
        }
      }
    }

    // 3. Taxi
    if (m.type === 'taxi') {
      if (m.stage === 'pickup_passenger') {
        const d = playerPos.distanceTo(m.pickupPos);
        if (d < 5.5) {
          m.stage = 'dropoff';
          this.setBeacon(m.dropoffPos, 0x2ecc71);
          if (window.soundManager) window.soundManager.playHorn();
          if (window.gameUI) {
            window.gameUI.showNotification(`🚖 Passenger in cab: "Take me to ${m.dropoffName}!"`, 'taxi');
            window.gameUI.updateJobHUD(m);
          }
        }
      } else if (m.stage === 'dropoff') {
        const d = playerPos.distanceTo(m.dropoffPos);
        if (d < 6.0) {
          this.game.economy.addCash(m.fare);
          this.completedJobCount++;
          if (window.soundManager) window.soundManager.playMissionSuccess();
          if (window.gameUI) {
            window.gameUI.showNotification(`🚖 Fare complete! Passenger paid +$${m.fare}!`, 'success', 6000);
          }
          this.nextTaxiFare();
        }
      }
    }
  }
}

window.JobManager = JobManager;

