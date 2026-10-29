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
    this.hospitalPos = new THREE.Vector3(-39, 1, 15);
    this.pizzeriaPos = new THREE.Vector3(117, 1, 19);
    this.taxiDepotPos = new THREE.Vector3(39, 1, 97);
    this.guildPos = new THREE.Vector3(-117, 1, -93);

    // 3D Visual Mission Waypoint Marker Beacon
    this.beaconGroup = new THREE.Group();
    this.createMissionBeacon();
    this.game.scene.add(this.beaconGroup);
    this.beaconGroup.visible = false;

    // Available Assassin Contracts across all 8 Cities
    this.assassinContracts = [
      {
        id: 'contract_1',
        targetName: "Viktor 'The Fixer' Vance",
        title: 'Corrupt Syndicate Banker',
        desc: 'Vance laundered millions from the Black Lotus family and is preparing to flee the city on a private yacht at Vice Beach Marina.',
        bounty: 15000,
        completed: false,
        spawnLocation: new THREE.Vector3(3400, 1, 600),
        status: 'available'
      },
      {
        id: 'contract_2',
        targetName: 'Councilman Sterling',
        title: 'Bribed City Politician',
        desc: 'Sterling is pushing bills to seize our safehouses under the guise of urban redevelopment. Terminate him at his Maple Valley Suburbs estate.',
        bounty: 22000,
        completed: false,
        spawnLocation: new THREE.Vector3(3200, 1, 3400),
        status: 'available'
      },
      {
        id: 'contract_3',
        targetName: "Dante 'Ghost' Moretti",
        title: 'Rival Hitman',
        desc: 'A rogue assassin taking contracts on our members. Spotted lurking beneath the red lanterns of the Neo-Chinatown District.',
        bounty: 28000,
        completed: false,
        spawnLocation: new THREE.Vector3(600, 1, -3600),
        status: 'available'
      },
      {
        id: 'contract_4',
        targetName: 'Helena Cross',
        title: 'Underground Tech Smuggler',
        desc: 'Intercepted encrypted guild comms. Eliminate her at Liberty Industrial Port Container Terminal before she sells access codes.',
        bounty: 35000,
        completed: false,
        spawnLocation: new THREE.Vector3(-3200, 1, -3200),
        status: 'available'
      },
      {
        id: 'contract_5',
        targetName: "'Mad Dog' Callahan",
        title: 'Desert Outlaw Kingpin',
        desc: 'Running illegal arms shipments through Red Rock Badlands. Neutralize him at his desert outpost hideout.',
        bounty: 42000,
        completed: false,
        spawnLocation: new THREE.Vector3(-3600, 1, 3600),
        status: 'available'
      },
      {
        id: 'contract_6',
        targetName: 'Baroness Von Brandt',
        title: 'Downtown Syndicate Oligarch',
        desc: 'High-value target walking in Downtown Citadel Plaza. Tip: Ride Citadel Express Elevator to the 138m Rooftop for a clean sniper elimination!',
        bounty: 50000,
        completed: false,
        spawnLocation: new THREE.Vector3(39, 1, 10),
        status: 'available'
      },
      {
        id: 'contract_7',
        targetName: "Don 'Goldfinger' Salvatore",
        title: 'Casino Kingpin',
        desc: 'Controlling the underground gambling rackets on the Las Palmas Casino Strip. Eliminate him outside the golden pyramid.',
        bounty: 60000,
        completed: false,
        spawnLocation: new THREE.Vector3(-4200, 1, 1000),
        status: 'available'
      },
      {
        id: 'contract_8',
        targetName: "'Ghost Wolf' Nikolai",
        title: 'Ex-Special Forces Mercenary',
        desc: 'Hiding out at the Alpine Pines Mountain Peak. Eliminate him from high elevation and snap photo proof.',
        bounty: 75000,
        completed: false,
        spawnLocation: new THREE.Vector3(1200, 1, 5000),
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
      { name: 'Downtown Metropolis Plaza', pos: new THREE.Vector3(39, 1, 10) },
      { name: 'Vice Beach Boardwalk', pos: new THREE.Vector3(340, 1, 20) },
      { name: 'Maple Valley Suburbs Park', pos: new THREE.Vector3(270, 1, 270) },
      { name: 'Industrial Shipping Port Gate 3', pos: new THREE.Vector3(-270, 1, -250) },
      { name: 'Badlands Desert Highway Diner', pos: new THREE.Vector3(-280, 1, 260) },
      { name: 'Chinatown Lantern Crossing', pos: new THREE.Vector3(39, 1, -270) }
    ];
    const pick = locations[Math.floor(Math.random() * locations.length)];

    this.activeMission = {
      type: 'ambulance',
      stage: 'pickup', // pickup -> deliver
      targetName: 'Critically Injured Patient',
      locationName: pick.name,
      pickupPos: pick.pos,
      dropoffPos: this.hospitalPos,
      timeLeft: 90, // 90 seconds to reach patient across large city
      maxTime: 90,
      payout: 3500 + Math.floor(Math.random() * 2000)
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
      { name: 'Vice Beach Ocean Villa 8', pos: new THREE.Vector3(330, 1, -90) },
      { name: 'The Citadel Penthouse Lobby', pos: new THREE.Vector3(39, 1, 15) },
      { name: 'Maple Valley Suburb Residence', pos: new THREE.Vector3(250, 1, 310) },
      { name: 'Industrial Port Crane Control Office', pos: new THREE.Vector3(-260, 1, -230) },
      { name: 'Chinatown Dim Sum House', pos: new THREE.Vector3(45, 1, -250) },
      { name: 'Badlands Outpost Workshop', pos: new THREE.Vector3(-270, 1, 250) }
    ];
    const pick = customers[Math.floor(Math.random() * customers.length)];

    this.activeMission = {
      type: 'delivery',
      stage: 'pickup_order', // pickup at pizzeria -> deliver to customer
      targetName: 'Hot Pizza & Wings Order',
      customerName: pick.name,
      pickupPos: this.pizzeriaPos,
      dropoffPos: pick.pos,
      timeLeft: 80,
      maxTime: 80,
      basePayout: 1200 + Math.floor(Math.random() * 800)
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
        pickupName: 'Downtown Financial Center',
        pickupPos: new THREE.Vector3(39, 1, -40),
        dropoffName: 'Vice Beach Marina Club',
        dropoffPos: new THREE.Vector3(330, 1, -80)
      },
      {
        pickupName: 'Chinatown Neon Plaza',
        pickupPos: new THREE.Vector3(39, 1, -250),
        dropoffName: 'St. Jude General Hospital',
        dropoffPos: this.hospitalPos
      },
      {
        pickupName: 'Maple Valley Estates',
        pickupPos: new THREE.Vector3(260, 1, 280),
        dropoffName: 'Downtown Citadel Skyscraper',
        dropoffPos: new THREE.Vector3(39, 1, 10)
      },
      {
        pickupName: 'Industrial Port Gate 4',
        pickupPos: new THREE.Vector3(-250, 1, -240),
        dropoffName: 'Vice Coast Luxury Strip',
        dropoffPos: new THREE.Vector3(320, 1, 40)
      },
      {
        pickupName: 'Badlands Desert Truck Stop',
        pickupPos: new THREE.Vector3(-270, 1, 270),
        dropoffName: 'Downtown Central Station',
        dropoffPos: new THREE.Vector3(39, 1, 80)
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
      fare: 1800 + Math.floor(Math.random() * 1200)
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

