// ============================================================
// CITY VIBES - 3D VEHICLE PROCEDURAL MESH BUILDER
// ============================================================

window.VehicleModelBuilder = {
  createWheel(x, y, z) {
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1c1c1c });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;

    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.37, 8);
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xbdc3c7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheel.add(rim);

    return wheel;
  },

  buildCarMesh(colorHex, type = 'sedan') {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const isMuscle = type === 'muscle';
    const isSyndicate = type === 'syndicate';

    const bodyMat = new THREE.MeshPhongMaterial({
      color: colorHex,
      shininess: isMuscle ? 85 : 55
    });
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.75, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    root.add(chassis);

    const cabinMat = new THREE.MeshPhongMaterial({
      color: isSyndicate ? 0x050505 : 0x1a252f,
      shininess: 90
    });
    const cabinH = isMuscle ? 0.65 : 0.75;
    const cabinGeo = new THREE.BoxGeometry(1.7, cabinH, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    const glassMat = new THREE.MeshBasicMaterial({
      color: isSyndicate ? 0x111111 : 0x4aa3df,
      transparent: true,
      opacity: 0.6
    });
    const windshieldGeo = new THREE.BoxGeometry(1.68, 0.6, 0.1);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.25, 0.96);
    windshield.rotation.x = -0.3;
    root.add(windshield);

    const wx = 1.05;
    const wzF = 1.35;
    const wzR = -1.35;
    const wy = 0.42;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: chassis, wheels, frontWheels };
  },

  buildAmbulanceMesh() {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];
    const sirenLights = [];

    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 50 });
    const boxGeo = new THREE.BoxGeometry(2.3, 1.9, 5.0);
    const box = new THREE.Mesh(boxGeo, bodyMat);
    box.position.y = 1.35;
    box.castShadow = true;
    root.add(box);

    const crossMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
    const crossV = new THREE.BoxGeometry(0.3, 0.9, 0.05);
    const crossH = new THREE.BoxGeometry(0.9, 0.3, 0.05);

    [-1.16, 1.16].forEach(xSide => {
      const v = new THREE.Mesh(crossV, crossMat);
      v.position.set(xSide, 1.5, 0);
      root.add(v);

      const h = new THREE.Mesh(crossH, crossMat);
      h.position.set(xSide, 1.5, 0);
      root.add(h);
    });

    const barGeo = new THREE.BoxGeometry(1.4, 0.22, 0.3);
    const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 2.4, 0.8);
    root.add(bar);

    const redLightGeo = new THREE.BoxGeometry(0.4, 0.25, 0.35);
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const redLight = new THREE.Mesh(redLightGeo, redLightMat);
    redLight.position.set(-0.45, 2.4, 0.8);
    root.add(redLight);

    const blueLightGeo = new THREE.BoxGeometry(0.4, 0.25, 0.35);
    const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const blueLight = new THREE.Mesh(blueLightGeo, blueLightMat);
    blueLight.position.set(0.45, 2.4, 0.8);
    root.add(blueLight);

    sirenLights.push(redLight, blueLight);

    const wx = 1.18;
    const wy = 0.45;
    const wzF = 1.6;
    const wzR = -1.5;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: box, wheels, frontWheels, sirenLights };
  },

  buildTaxiMesh() {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const yellowMat = new THREE.MeshPhongMaterial({ color: 0xf1c40f, shininess: 70 });
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.75, 4.4);
    const body = new THREE.Mesh(bodyGeo, yellowMat);
    body.position.y = 0.65;
    body.castShadow = true;
    root.add(body);

    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const stripeGeo = new THREE.BoxGeometry(2.02, 0.12, 4.0);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.7;
    root.add(stripe);

    const cabinGeo = new THREE.BoxGeometry(1.65, 0.75, 2.3);
    const cabinMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    const signGeo = new THREE.BoxGeometry(0.8, 0.25, 0.3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.75, -0.2);
    root.add(sign);

    const wx = 1.05;
    const wy = 0.42;
    const wzF = 1.35;
    const wzR = -1.35;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: body, wheels, frontWheels };
  },

  buildScooterMesh(colorHex) {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const bodyMat = new THREE.MeshLambertMaterial({ color: colorHex });
    const deckGeo = new THREE.BoxGeometry(0.7, 0.35, 1.8);
    const deck = new THREE.Mesh(deckGeo, bodyMat);
    deck.position.y = 0.5;
    deck.castShadow = true;
    root.add(deck);

    const seatMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const seatGeo = new THREE.BoxGeometry(0.5, 0.2, 0.7);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.75, -0.2);
    root.add(seat);

    const boxMat = new THREE.MeshLambertMaterial({ color: 0xe67e22 });
    const boxGeo = new THREE.BoxGeometry(0.7, 0.65, 0.65);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.95, -0.7);
    box.castShadow = true;
    root.add(box);

    const barGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0);
    const barMat = new THREE.MeshLambertMaterial({ color: 0xbdc3c7 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.x = -0.2;
    bar.position.set(0, 0.9, 0.65);
    root.add(bar);

    const handleGeo = new THREE.BoxGeometry(0.8, 0.08, 0.08);
    const handle = new THREE.Mesh(handleGeo, barMat);
    handle.position.set(0, 1.35, 0.55);
    root.add(handle);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    const wF = new THREE.Mesh(wheelGeo, wheelMat);
    wF.rotation.z = Math.PI / 2;
    wF.position.set(0, 0.32, 0.85);
    root.add(wF);

    const wR = new THREE.Mesh(wheelGeo, wheelMat);
    wR.rotation.z = Math.PI / 2;
    wR.position.set(0, 0.32, -0.75);
    root.add(wR);

    wheels.push(wF, wR);
    frontWheels.push(wF);

    return { mesh: root, bodyMesh: deck, wheels, frontWheels };
  },

  buildSupercarMesh(colorHex) {
    const root = new THREE.Group();
    const wheels = [];
    const frontWheels = [];

    const bodyMat = new THREE.MeshPhongMaterial({
      color: colorHex,
      shininess: 100,
      specular: 0xffffff
    });

    const bodyGeo = new THREE.BoxGeometry(2.1, 0.55, 4.6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.45;
    body.castShadow = true;
    root.add(body);

    const cockpitMat = new THREE.MeshPhongMaterial({ color: 0x050505, shininess: 95 });
    const cockpitGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.85, -0.3);
    cockpit.castShadow = true;
    root.add(cockpit);

    const wingMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wingGeo = new THREE.BoxGeometry(2.0, 0.08, 0.5);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.95, -2.1);
    root.add(wing);

    const wx = 1.1;
    const wy = 0.38;
    const wzF = 1.45;
    const wzR = -1.45;

    const wFL = this.createWheel(-wx, wy, wzF);
    const wFR = this.createWheel(wx, wy, wzF);
    const wRL = this.createWheel(-wx, wy, wzR);
    const wRR = this.createWheel(wx, wy, wzR);

    root.add(wFL, wFR, wRL, wRR);
    wheels.push(wFL, wFR, wRL, wRR);
    frontWheels.push(wFL, wFR);

    return { mesh: root, bodyMesh: body, wheels, frontWheels };
  }
};
