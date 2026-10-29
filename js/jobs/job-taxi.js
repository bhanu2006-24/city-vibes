// ============================================================
// CITY VIBES - METRO CAB DRIVER CAREER
// ============================================================

window.TaxiJobSystem = {
  destinations: [
    { name: 'Vice Beachfront Marina', pos: new THREE.Vector3(380, 0, 240) },
    { name: 'Golden Pyramid Casino Strip', pos: new THREE.Vector3(-270, 0, -260) },
    { name: 'Citadel Tower Skyscraper Plaza', pos: new THREE.Vector3(0, 0, 240) },
    { name: 'Liberty Port Shipping Docks', pos: new THREE.Vector3(320, 0, -280) },
    { name: 'Chinatown Dim Sum Market', pos: new THREE.Vector3(-240, 0, 180) },
    { name: 'Red Rock Canyon Lookout', pos: new THREE.Vector3(-330, 0, 410) }
  ],

  startShift(jobs) {
    jobs.currentJob = 'taxi';
    jobs.completedJobCount = 0;
    if (window.soundManager) window.soundManager.playHorn();
    if (window.gameUI) {
      window.gameUI.showNotification('🚖 METRO CAB SHIFT STARTED! Finding hailed passengers...', 'job');
    }
    this.nextFare(jobs);
  },

  nextFare(jobs) {
    const pickupLoc = this.destinations[Math.floor(Math.random() * this.destinations.length)];
    let dropoffLoc = this.destinations[Math.floor(Math.random() * this.destinations.length)];
    while (dropoffLoc.name === pickupLoc.name) {
      dropoffLoc = this.destinations[Math.floor(Math.random() * this.destinations.length)];
    }

    jobs.activeMission = {
      type: 'taxi',
      stage: 'pickup_passenger',
      pickupName: pickupLoc.name,
      pickupPos: pickupLoc.pos.clone(),
      dropoffName: dropoffLoc.name,
      dropoffPos: dropoffLoc.pos.clone(),
      fare: 250 + Math.floor(Math.random() * 350) + jobs.completedJobCount * 60
    };

    jobs.setBeacon(pickupLoc.pos, 0xf1c40f);

    if (window.gameUI) {
      window.gameUI.updateJobHUD(jobs.activeMission);
      window.gameUI.showNotification(`🚖 RIDER HAILING: Customer waiting at ${pickupLoc.name}!`, 'taxi');
    }
  }
};
