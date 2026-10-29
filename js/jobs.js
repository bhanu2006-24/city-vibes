// ============================================================
// CITY VIBES - JOBS & MISSIONS SYSTEM
// Ambulance Paramedic, Pizza Delivery, Taxi Driver & Assassin Guild
// ============================================================

class JobManager {
  constructor(game) {
    this.game = game;
    this.currentJob = null; // 'ambulance', 'delivery', 'taxi', or null
    this.activeMission = null;

    // Hospital / Patient locations
    this.hospitalPos = new THREE.Vector3(-1 * (60 + 18), 1, 0 + 26);
    this.pizzeriaPos = new THREE.Vector3(1 * (60 + 18), 1, 0 + 22);
    this.taxiDepotPos = new THREE.Vector3(0, 1, 1 * (60 + 18) + 22);
    this.guildPos = new THREE.Vector3(-2 * (60 + 18), 1, -2 * (60 + 18) + 25);

    // 3D Visual Mission Waypoint Marker Beacon
    this.beaconGroup = new THREE.Group();
    this.createMissionBeacon();
    this.game.scene.add(this.beaconGroup);
    this.beaconGroup.visible = false;

    // Available Assassin Contracts
    this.assassinContracts = [
      {
        id: 'contract_1',
        targetName: "Viktor 'The Fixer' Vance",
        title: 'Corrupt Syndicate Banker',
        desc: 'Vance laundered millions from the Black Lotus family and is preparing to flee the city on a private yacht.',
        bounty: 15000,
        completed: false,
        spawnLocation: new THREE.Vector3(120, 1, -180),
        status: 'available'
      },
      {
        id: 'contract_2',
        targetName: 'Councilman Sterling',
        title: 'Bribed City Politician',
        desc: 'Sterling is pushing bills to seize our safehouses under the guise of urban redevelopment. Terminate him.',
        bounty: 22000,
        completed: false,
        spawnLocation: new THREE.Vector3(-80, 1, 140),
        status: 'available'
      },
      {
        id: 'contract_3',
        targetName: "Dante 'Ghost' Moretti",
        title: 'Rival Hitman',
        desc: 'A rogue assassin taking contracts on our members. Spotted scouting Downtown high-rises.',
        bounty: 28000,
        completed: false,
        spawnLocation: new THREE.Vector3(-15, 1, -120),
        status: 'available'
      },
      {
        id: 'contract_4',
        targetName: 'Helena Cross',
        title: 'Underground Tech Smuggler',
        desc: 'Intercepted encrypted guild comms. Eliminate her before she sells the access codes to authorities.',
        bounty: 35000,
        completed: false,
        spawnLocation: new THREE.Vector3(180, 1, 60),
        status: 'available'
      }
    ];

    this.activeContract = null;
  }

  createMissionBeacon() {
    const ringGeo = new THREE.RingGeometry(1.8, 2.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconRing.rotation.x = Math.PI / 2;
    this.beaconRing.position.y = 0.2;
    this.beaconGroup.add(this.beaconRing);

    // Vertical Light Column
    const beamGeo = new THREE.CylinderGeometry(0.5, 1.2, 18, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    this.beaconBeam = new THREE.Mesh(beamGeo, beamMat);
    this.beaconBeam.position.y = 9;
    this.beaconGroup.add(this.beaconBeam);
  }

  setBeacon(position, colorHex = 0x00ff88) {
    if (!position) {
      this.beaconGroup.visible = false;
      return;
    }
    this.beaconGroup.position.copy(position);
    this.beaconRing.material.color.setHex(colorHex);
    this.beaconBeam.material.color.setHex(colorHex);
    this.beaconGroup.visible = true;
  }

  // ------------------------------------------------------------
  // 1. AMBULANCE PARAMEDIC CAREER
  // ------------------------------------------------------------

  startAmbulanceShift() {
    this.currentJob = 'ambulance';
    this.nextAmbulanceCall();
  }

  nextAmbulanceCall() {
    const locations = [
      { name: 'Downtown Crosswalk', pos: new THREE.Vector3(30, 1, -40) },
      { name: 'Maple Grove Suburb', pos: new THREE.Vector3(140, 1, 150) },
      { name: 'Industrial Pier 9', pos: new THREE.Vector3(-120, 1, -160) },
      { name: 'Sunset Motel Parking', pos: new THREE.Vector3(-150, 1, 90) }
    ];
    const pick = locations[Math.floor(Math.random() * locations.length)];

    this.activeMission = {
      type: 'ambulance',
      stage: 'pickup', // pickup -> deliver
      targetName: 'Critically Injured Patient',
      locationName: pick.name,
      pickupPos: pick.pos,
      dropoffPos: this.hospitalPos,
      timeLeft: 75, // 75 seconds to reach patient
      maxTime: 75,
      payout: 2500 + Math.floor(Math.random() * 1500)
    };

    this.setBeacon(this.activeMission.pickupPos, 0xff2222);

    window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(
        `🚨 911 DISPATCH: Medical Emergency at ${pick.name}! Rush to the patient immediately!`,
        'job_ambulance',
        7000
      );
      window.gameUI.updateJobHUD(this.activeMission);
    }
  }

  // ------------------------------------------------------------
  // 2. PIZZA & PARCEL DELIVERY BOY CAREER
  // ------------------------------------------------------------

  startDeliveryShift() {
    this.currentJob = 'delivery';
    this.nextDeliveryOrder();
  }

  nextDeliveryOrder() {
    const customers = [
      { name: 'Apartment 12B', pos: new THREE.Vector3(-70, 1, 60) },
      { name: 'The Citadel Penthouse Lobby', pos: new THREE.Vector3(15, 1, 20) },
      { name: 'Harbor Crest Mansion', pos: new THREE.Vector3(160, 1, -150) },
      { name: 'Tech District Office', pos: new THREE.Vector3(80, 1, -70) }
    ];
    const pick = customers[Math.floor(Math.random() * customers.length)];

    this.activeMission = {
      type: 'delivery',
      stage: 'pickup_order', // pickup at pizzeria -> deliver to customer
      targetName: 'Hot Pizza & Wings Order',
      customerName: pick.name,
      pickupPos: this.pizzeriaPos,
      dropoffPos: pick.pos,
      timeLeft: 60,
      maxTime: 60,
      basePayout: 800 + Math.floor(Math.random() * 600)
    };

    // First go to Pizzeria to pick up order
    this.setBeacon(this.pizzeriaPos, 0xf39c12);

    window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(
        `🍕 NEW ORDER: Pick up hot delivery at Luigi's Express!`,
        'job_delivery',
        6000
      );
      window.gameUI.updateJobHUD(this.activeMission);
    }
  }

  // ------------------------------------------------------------
  // 3. CAB / TAXI DRIVER CAREER
  // ------------------------------------------------------------

  startTaxiShift() {
    this.currentJob = 'taxi';
    this.nextTaxiFare();
  }

  nextTaxiFare() {
    const fares = [
      {
        pickupName: 'Financial Center',
        pickupPos: new THREE.Vector3(10, 1, -60),
        dropoffName: 'Luxury Yacht Harbor',
        dropoffPos: new THREE.Vector3(140, 1, -160)
      },
      {
        pickupName: 'Metro Nightclub',
        pickupPos: new THREE.Vector3(-60, 1, 80),
        dropoffName: 'St. Jude Hospital',
        dropoffPos: this.hospitalPos
      },
      {
        pickupName: 'Maple Suburbs',
        pickupPos: new THREE.Vector3(130, 1, 140),
        dropoffName: 'Downtown Citadel',
        dropoffPos: new THREE.Vector3(10, 1, 10)
      }
    ];
    const pick = fares[Math.floor(Math.random() * fares.length)];

    this.activeMission = {
      type: 'taxi',
      stage: 'pickup_passenger', // pickup -> dropoff
      passengerName: 'Hailing Passenger',
      pickupName: pick.pickupName,
      dropoffName: pick.dropoffName,
      pickupPos: pick.pickupPos,
      dropoffPos: pick.dropoffPos,
      fare: 1200 + Math.floor(Math.random() * 1000)
    };

    this.setBeacon(pick.pickupPos, 0xf1c40f);

    window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification(
        `🚖 FARE CALL: Passenger waiting at ${pick.pickupName}! Pull over to pick them up.`,
        'job_taxi',
        6000
      );
      window.gameUI.updateJobHUD(this.activeMission);
    }
  }

  // ------------------------------------------------------------
  // 4. THE BLACK LOTUS ASSASSIN'S GUILD
  // ------------------------------------------------------------

  acceptAssassinContract(contractId) {
    const contract = this.assassinContracts.find(c => c.id === contractId);
    if (!contract || contract.completed) return;

    this.activeContract = contract;
    contract.status = 'active';

    // Spawn the 3D Target in the city
    this.game.pedestrianManager.spawnContractTarget(contract);

    // Set beacon to target's general area
    this.setBeacon(contract.spawnLocation, 0xff0044);

    window.soundManager.playNotification(false);
    if (window.gameUI) {
      window.gameUI.showNotification(
        `🎯 CONTRACT ACCEPTED: Hunt down ${contract.targetName}! Eliminate them and snap a photo with your Camera (C) to claim the $${contract.bounty.toLocaleString()} bounty!`,
        'guild',
        8000
      );
    }
  }

  completeAssassinContract(contractId) {
    const contract = this.assassinContracts.find(c => c.id === contractId);
    if (!contract) return;

    contract.completed = true;
    contract.status = 'completed';
    this.setBeacon(null);
    this.activeContract = null;

    // Check if all contracts complete, if so generate fresh ones
    const remaining = this.assassinContracts.filter(c => !c.completed);
    if (remaining.length === 0) {
      this.generateFreshGuildContracts();
    }
  }

  generateFreshGuildContracts() {
    const newTargets = [
      { name: "Sergei 'The Bear' Volkov", title: 'Arms Smuggler', bounty: 42000, pos: new THREE.Vector3(-140, 1, 80) },
      { name: 'Dr. Evelyn Ward', title: 'Rogue Scientist', bounty: 38000, pos: new THREE.Vector3(70, 1, 150) },
      { name: 'Klaus Mendoza', title: 'Cartel Underboss', bounty: 50000, pos: new THREE.Vector3(-100, 1, -120) }
    ];

    newTargets.forEach((t, i) => {
      this.assassinContracts.push({
        id: `contract_fresh_${Date.now()}_${i}`,
        targetName: t.name,
        title: t.title,
        desc: `High priority syndicate target spotted. Eliminate and deliver photographic evidence.`,
        bounty: t.bounty,
        completed: false,
        spawnLocation: t.pos,
        status: 'available'
      });
    });
  }

  cancelCurrentJob() {
    this.currentJob = null;
    this.activeMission = null;
    this.setBeacon(null);
    if (window.gameUI) {
      window.gameUI.hideJobHUD();
      window.gameUI.showNotification('Shift ended.', 'info');
    }
  }

  // ------------------------------------------------------------
  // UPDATE LOOP (DISTANCE CHECKS & MISSION PROGRESSION)
  // ------------------------------------------------------------

  update(delta) {
    // Spin and pulse active beacon
    if (this.beaconGroup.visible) {
      this.beaconRing.rotation.z += delta * 1.5;
      const pulse = 1.0 + Math.sin(performance.now() * 0.005) * 0.15;
      this.beaconRing.scale.set(pulse, pulse, pulse);
    }

    if (!this.activeMission) return;

    const playerPos = this.game.player.position;
    const mission = this.activeMission;

    // Countdown timer for time-sensitive missions
    if (mission.timeLeft !== undefined) {
      mission.timeLeft -= delta;
      if (mission.timeLeft <= 0) {
        // Mission Failed
        window.soundManager.playNotification(false);
        if (window.gameUI) {
          window.gameUI.showNotification('❌ MISSION FAILED: Time expired!', 'error');
        }
        this.cancelCurrentJob();
        return;
      }
    }

    // ----------------- AMBULANCE LOGIC -----------------
    if (mission.type === 'ambulance') {
      if (mission.stage === 'pickup') {
        const dist = playerPos.distanceTo(mission.pickupPos);
        if (dist < 6.0) {
          // Patient loaded
          mission.stage = 'deliver';
          mission.timeLeft = 85; // new timer to reach hospital
          this.setBeacon(this.hospitalPos, 0x00f0ff);
          window.soundManager.playNotification(true);
          if (window.gameUI) {
            window.gameUI.showNotification(
              '🚑 PATIENT SECURED! Turn on your siren (J) and rush to St. Jude Hospital ER!',
              'ambulance'
            );
          }
        }
      } else if (mission.stage === 'deliver') {
        const dist = playerPos.distanceTo(this.hospitalPos);
        if (dist < 7.0) {
          // Mission Success!
          window.soundManager.playCash();
          window.soundManager.playMissionSuccess();
          this.game.economy.addCash(mission.payout);

          if (window.gameUI) {
            window.gameUI.showNotification(
              `✅ PATIENT DELIVERED SAFELY! Earned +$${mission.payout.toLocaleString()} Paramedic Fee!`,
              'success',
              6000
            );
          }

          // Offer next emergency call
          setTimeout(() => {
            if (this.currentJob === 'ambulance') this.nextAmbulanceCall();
          }, 4000);
          this.activeMission = null;
        }
      }
    }

    // ----------------- DELIVERY BOY LOGIC -----------------
    else if (mission.type === 'delivery') {
      if (mission.stage === 'pickup_order') {
        const dist = playerPos.distanceTo(this.pizzeriaPos);
        if (dist < 6.0) {
          mission.stage = 'deliver';
          mission.timeLeft = 70;
          this.setBeacon(mission.dropoffPos, 0x2ecc71);
          window.soundManager.playNotification(true);
          if (window.gameUI) {
            window.gameUI.showNotification(
              `🍕 ORDER COLLECTED! Rush to ${mission.customerName} before it gets cold!`,
              'delivery'
            );
          }
        }
      } else if (mission.stage === 'deliver') {
        const dist = playerPos.distanceTo(mission.dropoffPos);
        if (dist < 6.0) {
          // Tip bonus based on remaining time
          const tipBonus = Math.floor((mission.timeLeft / mission.maxTime) * 800);
          const totalPay = mission.basePayout + tipBonus;

          window.soundManager.playCash();
          this.game.economy.addCash(totalPay);

          if (window.gameUI) {
            window.gameUI.showNotification(
              `🍕 DELIVERY COMPLETE! Base: $${mission.basePayout} + Hot & Fresh Tip: $${tipBonus} = Total: +$${totalPay}!`,
              'success',
              6000
            );
          }

          setTimeout(() => {
            if (this.currentJob === 'delivery') this.nextDeliveryOrder();
          }, 3500);
          this.activeMission = null;
        }
      }
    }

    // ----------------- TAXI CAB LOGIC -----------------
    else if (mission.type === 'taxi') {
      if (mission.stage === 'pickup_passenger') {
        const dist = playerPos.distanceTo(mission.pickupPos);
        if (dist < 6.0) {
          mission.stage = 'dropoff';
          this.setBeacon(mission.dropoffPos, 0x00ff88);
          window.soundManager.playNotification(true);
          if (window.gameUI) {
            window.gameUI.showNotification(
              `🚖 PASSENGER ABOARD: "Please take me to ${mission.dropoffName}!"`,
              'taxi'
            );
          }
        }
      } else if (mission.stage === 'dropoff') {
        const dist = playerPos.distanceTo(mission.dropoffPos);
        if (dist < 6.0) {
          window.soundManager.playCash();
          this.game.economy.addCash(mission.fare);

          if (window.gameUI) {
            window.gameUI.showNotification(
              `🚖 FARE COMPLETE! Passenger paid +$${mission.fare.toLocaleString()} with tip!`,
              'success',
              6000
            );
          }

          setTimeout(() => {
            if (this.currentJob === 'taxi') this.nextTaxiFare();
          }, 3500);
          this.activeMission = null;
        }
      }
    }

    if (window.gameUI && this.activeMission) {
      window.gameUI.updateJobHUD(this.activeMission);
    }
  }
}

window.JobManager = JobManager;

