// ============================================================
// CITY VIBES - AMBIENT VEHICULAR TRAFFIC SYSTEM
// ============================================================

window.TrafficSystem = {
  spawnTraffic(pm, count = 12) {
    const colors = [0x95a5a6, 0x34495e, 0x27ae60, 0x2980b9, 0xc0392b, 0xd35400, 0xf39c12];
    const avenues = [-240, 0, 240];

    for (let i = 0; i < count; i++) {
      const isVertical = Math.random() > 0.5;
      const roadCoord = avenues[Math.floor(Math.random() * avenues.length)];
      const laneOffset = (Math.random() > 0.5 ? 1 : -1) * 4.5;

      const group = new THREE.Group();
      const col = colors[Math.floor(Math.random() * colors.length)];

      const bodyGeo = new THREE.BoxGeometry(2.0, 0.75, 4.2);
      const bodyMat = new THREE.MeshLambertMaterial({ color: col });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.65;
      group.add(body);

      const cabinGeo = new THREE.BoxGeometry(1.65, 0.75, 2.2);
      const cabinMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 1.25, -0.2);
      group.add(cabin);

      let px, pz, rotY, dir;
      if (isVertical) {
        px = roadCoord + laneOffset;
        pz = (Math.random() - 0.5) * 480;
        rotY = laneOffset > 0 ? 0 : Math.PI;
        dir = new THREE.Vector3(0, 0, laneOffset > 0 ? 1 : -1);
      } else {
        px = (Math.random() - 0.5) * 480;
        pz = roadCoord + laneOffset;
        rotY = laneOffset > 0 ? -Math.PI / 2 : Math.PI / 2;
        dir = new THREE.Vector3(laneOffset > 0 ? -1 : 1, 0, 0);
      }

      group.position.set(px, 0, pz);
      group.rotation.y = rotY;
      pm.scene.add(group);

      pm.trafficCars.push({
        group: group,
        speed: 12 + Math.random() * 8,
        dir: dir,
        isVertical: isVertical
      });
    }
  },

  updateTraffic(pm, delta) {
    for (let i = 0; i < pm.trafficCars.length; i++) {
      const c = pm.trafficCars[i];
      c.group.position.addScaledVector(c.dir, c.speed * delta);

      // Loop around the island borders
      if (c.group.position.x > 380) c.group.position.x = -380;
      if (c.group.position.x < -380) c.group.position.x = 380;
      if (c.group.position.z > 380) c.group.position.z = -380;
      if (c.group.position.z < -380) c.group.position.z = 380;
    }
  }
};

