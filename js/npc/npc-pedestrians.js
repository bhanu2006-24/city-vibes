// ============================================================
// CITY VIBES - NPC CITIZENS & PROCEDURAL HUMANOID MODELS
// ============================================================

window.PedestrianHelper = {
  createHumanoidMesh(shirtColor, isTarget = false, targetDetails = null) {
    const root = new THREE.Group();

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.85, 0.35);
    const torsoMat = new THREE.MeshLambertMaterial({
      color: isTarget ? 0x111111 : shirtColor
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    root.add(torso);

    if (isTarget) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.19);
      root.add(tie);

      const caseGeo = new THREE.BoxGeometry(0.5, 0.35, 0.12);
      const caseMat = new THREE.MeshLambertMaterial({ color: 0x4a2311 });
      const briefcase = new THREE.Mesh(caseGeo, caseMat);
      briefcase.position.set(0.48, 0.75, 0);
      root.add(briefcase);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf5cba7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    root.add(head);

    const hairGeo = new THREE.BoxGeometry(0.42, 0.16, 0.42);
    const hairMat = new THREE.MeshLambertMaterial({ color: isTarget ? 0x222222 : 0x4a2e1b });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.05;
    root.add(hair);

    if (isTarget) {
      const glassesGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const glasses = new THREE.Mesh(glassesGeo, glassesMat);
      glasses.position.set(0, 1.9, 0.21);
      root.add(glasses);

      const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const reticle = new THREE.Mesh(ringGeo, ringMat);
      reticle.rotation.x = Math.PI / 2;
      reticle.position.y = 2.45;
      root.add(reticle);
      root.reticle = reticle;
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.28);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.18, 0.4, 0);
    legL.castShadow = true;
    root.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.18, 0.4, 0);
    legR.castShadow = true;
    root.add(legR);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.22);
    const armMat = torsoMat;

    const armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-0.45, 1.25, 0);
    armL.castShadow = true;
    root.add(armL);

    const armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(0.45, 1.25, 0);
    armR.castShadow = true;
    root.add(armR);

    root.userData = {
      legL: legL,
      legR: legR,
      armL: armL,
      armR: armR,
      animTime: Math.random() * 10
    };

    return root;
  }
};

