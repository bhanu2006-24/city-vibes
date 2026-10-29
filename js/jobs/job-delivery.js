// ============================================================
// CITY VIBES - PIZZA EXPRESS DELIVERY BOY CAREER
// ============================================================

window.DeliveryJobSystem = {
  customerDropoffs: [
    { name: 'Vice Beachfront Villa #12', pos: new THREE.Vector3(420, 0, 270) },
    { name: 'Sunset Motel Room 4', pos: new THREE.Vector3(280, 0, 260) },
    { name: 'Downtown Penthouse Suites', pos: new THREE.Vector3(60, 0, 210) },
    { name: 'Casino Strip Grand Hotel', pos: new THREE.Vector3(-260, 0, -280) },
    { name: 'Chinatown Herbalist Residence', pos: new THREE.Vector3(-210, 0, 140) },
    { name: 'Port Marine Guardpost', pos: new THREE.Vector3(290, 0, -230) }
  ],

  startShift(jobs) {
    jobs.currentJob = 'delivery';
    jobs.completedJobCount = 0;
    if (window.soundManager) window.soundManager.playNotification(true);
    if (window.gameUI) {
      window.gameUI.showNotification("🍕 PIZZA EXPRESS SHIFT STARTED! Head to Luigi's for pickup!", 'job');
    }
    this.nextOrder(jobs);
  },

  nextOrder(jobs) {
    const pizzeriaPos = new THREE.Vector3(80, 0, 140);
    const cust = this.customerDropoffs[Math.floor(Math.random() * this.customerDropoffs.length)];

    jobs.activeMission = {
      type: 'delivery',
      stage: 'pickup_order',
      customerName: cust.name,
      pickupPos: pizzeriaPos,
      dropoffPos: cust.pos.clone(),
      timeLeft: 60,
      reward: 350 + jobs.completedJobCount * 80
    };

    jobs.setBeacon(pizzeriaPos, 0xf39c12);

    if (window.gameUI) {
      window.gameUI.updateJobHUD(jobs.activeMission);
      window.gameUI.showNotification("🍕 NEW ORDER: Pick up hot pizza at Luigi's Pizzeria!", 'delivery');
    }
  }
};
