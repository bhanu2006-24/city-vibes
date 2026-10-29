// ============================================================
// CITY VIBES - GTA POLICE PURSUIT, FOOT CHASE & COMBAT AI
// ============================================================

window.PoliceSystem = {
  spawnCruiser(pm, nearPos) {
    if (pm.policeCruiser) return;

    const group = new THREE.Group();
    group.position.copy(nearPos).add(new THREE.Vector3(25, 0.4, 25));

    // Black & white police interceptor
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.75, 4.4);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 70 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    group.add(body);

    const doorGeo = new THREE.BoxGeometry(2.14, 0.5, 1.8);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const doors = new THREE.Mesh(doorGeo, doorMat);
    doors.position.set(0, 0.7, -0.1);
    group.add(doors);

    // Strobe Lightbar
    const barGeo = new THREE.BoxGeometry(1.4, 0.2, 0.3);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.7, -0.2);
    group.add(bar);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xff0022 }));
    redLight.position.set(-0.45, 1.7, -0.2);
    group.add(redLight);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
    blueLight.position.set(0.45, 1.7, -0.2);
    group.add(blueLight);

    pm.scene.add(group);

    pm.policeCruiser = {
      group: group,
      speed: 28,
      redLight: redLight,
      blueLight: blueLight
    };
  },

  removeCruiser(pm) {
    if (!pm.policeCruiser) return;
    pm.scene.remove(pm.policeCruiser.group);
    pm.policeCruiser = null;
  },

  spawnOfficer(pm, nearPos) {
    if (pm.policeOfficer) return;

    const group = new THREE.Group();
    group.position.copy(nearPos).add(new THREE.Vector3(2.5, 0, 2.5));

    // Police officer in dark blue uniform
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x1b263b })
    );
    torso.position.y = 1.25;
    group.add(torso);

    // Police gold badge
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.15, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xf1c40f })
    );
    badge.position.set(0.18, 1.45, 0.22);
    group.add(badge);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0xf5d0b5 })
    );
    head.position.y = 1.95;
    group.add(head);

    // Police peaked cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.16, 0.5),
      new THREE.MeshLambertMaterial({ color: 0x0d1b2a })
    );
    cap.position.set(0, 2.18, 0.03);
    group.add(cap);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.8, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x111625 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.18, 0.4, 0);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.18, 0.4, 0);
    group.add(legR);

    // Arms & Drawn Service Weapon
    const armGeo = new THREE.BoxGeometry(0.22, 0.7, 0.22);
    const armL = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x1b263b }));
    armL.position.set(-0.46, 1.2, 0);
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x1b263b }));
    armR.position.set(0.46, 1.2, 0.2);
    armR.rotation.x = -Math.PI / 2.5;
    group.add(armR);

    const gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.14, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    gun.position.set(0.46, 1.35, 0.55);
    group.add(gun);

    pm.scene.add(group);

    pm.policeOfficer = {
      group: group,
      speed: 8.5,
      legL: legL,
      legR: legR,
      armL: armL,
      armR: armR,
      gun: gun,
      animTime: 0,
      shootTimer: 0,
      pinTimer: 0
    };
  },

  removeOfficer(pm) {
    if (!pm.policeOfficer) return;
    pm.scene.remove(pm.policeOfficer.group);
    pm.policeOfficer = null;
  },

  spawnBulletTracer(scene, from, to) {
    const dist = from.distanceTo(to);
    const geo = new THREE.CylinderGeometry(0.04, 0.04, Math.max(1, dist), 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.85 });
    const tracer = new THREE.Mesh(geo, mat);

    const mid = from.clone().add(to).multiplyScalar(0.5);
    tracer.position.copy(mid);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    scene.add(tracer);

    setTimeout(() => {
      scene.remove(tracer);
    }, 120);
  }
};

