// ============================================================
// CITY VIBES - PARAMEDIC & AMBULANCE EMERGENCY CAREER
// ============================================================

window.AmbulanceJobSystem = {
  emergencyLocations: [
    { name: 'Downtown Central Crosswalk', pos: new THREE.Vector3(20, 0, 160) },
    { name: 'Vice Beach Boardwalk', pos: new THREE.Vector3(340, 0, 180) },
    { name: 'Industrial Port Container Yard', pos: new THREE.Vector3(280, 0, -260) },
    { name: 'Chinatown Pagoda Square', pos: new THREE.Vector3(-220, 0, 160) },
    { name: 'Casino Strip Grand Entrance', pos: new THREE.Vector3(-250, 0, -220) },
    { name: 'Red Rock Badlands Highway', pos: new THREE.Vector3(-310, 0, 360) }
  ],

  startShift(jobs) {
    jobs.currentJob = 'ambulance';
    jobs.completedJobCount = 0;
    if (window.soundManager) window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification('🚑 PARAMEDIC SHIFT STARTED! Emergency 911 dispatch incoming...', 'job');
    }
    this.nextCall(jobs);
  },

  nextCall(jobs) {
    const loc = this.emergencyLocations[Math.floor(Math.random() * this.emergencyLocations.length)];
    const hospitalPos = new THREE.Vector3(-39, 0, 120);

    jobs.activeMission = {
      type: 'ambulance',
      stage: 'pickup',
      locationName: loc.name,
      pickupPos: loc.pos.clone(),
      dropoffPos: hospitalPos,
      timeLeft: 75,
      reward: 850 + jobs.completedJobCount * 250
    };

    jobs.setBeacon(loc.pos, 0xe74c3c);

    if (window.gameUI) {
      window.gameUI.updateJobHUD(jobs.activeMission);
      window.gameUI.showNotification(`🚨 911 CALL: Patient down at ${loc.name}! Siren on (J)!`, 'ambulance');
    }
  }
};
