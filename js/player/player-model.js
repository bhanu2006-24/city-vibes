// ============================================================
// CITY VIBES - PLAYER 3D PROCEDURAL CHARACTER & OUTFIT MODEL
// ============================================================

window.PlayerOutfitColors = {
  casual: { shirt: 0x3498db, pants: 0x2c3e50 },
  assassin: { shirt: 0x111111, pants: 0x0a0a0a, tie: 0xdd0033 },
  paramedic: { shirt: 0x16a085, pants: 0x117a65 },
  taxi: { shirt: 0xf39c12, pants: 0x2c3e50 },
  delivery: { shirt: 0xe74c3c, pants: 0x1c2833 },
  cyber: { shirt: 0x00f0ff, pants: 0xff0055 },
  luxury_gold: { shirt: 0xd4ac0d, pants: 0x1b2631 }
};

window.PlayerModelBuilder = {
  buildCharacterMesh(player) {
    while (player.meshGroup.children.length > 0) {
      player.meshGroup.remove(player.meshGroup.children[0]);
    }

    const col = player.outfitColors[player.custom.outfit] || player.outfitColors.casual;

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.4);
    player.torsoMat = new THREE.MeshLambertMaterial({ color: col.shirt });
    player.torso = new THREE.Mesh(torsoGeo, player.torsoMat);
    player.torso.position.y = 1.25;
    player.torso.castShadow = true;
    player.meshGroup.add(player.torso);

    if (col.tie) {
      const tieGeo = new THREE.BoxGeometry(0.12, 0.5, 0.05);
      const tieMat = new THREE.MeshBasicMaterial({ color: col.tie });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.position.set(0, 1.25, 0.22);
      player.meshGroup.add(tie);
    }

    // Head
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    player.headMat = new THREE.MeshLambertMaterial({ color: player.custom.skinTone });
    player.head = new THREE.Mesh(headGeo, player.headMat);
    player.head.position.y = 1.88;
    player.head.castShadow = true;
    player.meshGroup.add(player.head);

    // Hair
    const hairMat = new THREE.MeshLambertMaterial({ color: player.custom.hairColor });
    if (player.custom.hairStyle === 'afro') {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), hairMat);
      hair.position.set(0, 2.1, 0);
      player.meshGroup.add(hair);
    } else if (player.custom.hairStyle === 'punk') {
      const mohawk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.45), hairMat);
      mohawk.position.set(0, 2.22, 0);
      player.meshGroup.add(mohawk);
    } else {
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.44), hairMat);
      hair.position.y = 2.08;
      player.meshGroup.add(hair);
    }

    // Headwear
    if (player.custom.headwear === 'fedora') {
      const brimMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16), brimMat);
      brim.position.set(0, 2.15, 0);
      player.meshGroup.add(brim);

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.25, 16), brimMat);
      crown.position.set(0, 2.3, 0);
      player.meshGroup.add(crown);
    } else if (player.custom.headwear === 'cap') {
      const capMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      cap.position.set(0, 2.08, 0);
      player.meshGroup.add(cap);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.25), capMat);
      visor.position.set(0, 2.06, 0.26);
      player.meshGroup.add(visor);
    } else if (player.custom.headwear === 'beanie') {
      const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshLambertMaterial({ color: 0x2c3e50 }));
      beanie.position.set(0, 2.12, 0);
      player.meshGroup.add(beanie);
    }

    // Eyewear
    if (player.custom.eyewear === 'sunglasses') {
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      glasses.position.set(0, 1.9, 0.22);
      player.meshGroup.add(glasses);
    } else if (player.custom.eyewear === 'cyber_visor') {
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      visor.position.set(0, 1.9, 0.22);
      player.meshGroup.add(visor);
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.82, 0.28);
    player.pantsMat = new THREE.MeshLambertMaterial({ color: col.pants });

    player.legL = new THREE.Mesh(legGeo, player.pantsMat);
    player.legL.position.set(-0.2, 0.41, 0);
    player.legL.castShadow = true;
    player.meshGroup.add(player.legL);

    player.legR = new THREE.Mesh(legGeo, player.pantsMat);
    player.legR.position.set(0.2, 0.41, 0);
    player.legR.castShadow = true;
    player.meshGroup.add(player.legR);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.22, 0.78, 0.24);
    player.armL = new THREE.Mesh(armGeo, player.torsoMat);
    player.armL.position.set(-0.48, 1.25, 0);
    player.armL.castShadow = true;
    player.meshGroup.add(player.armL);

    player.armR = new THREE.Mesh(armGeo, player.torsoMat);
    player.armR.position.set(0.48, 1.25, 0);
    player.armR.castShadow = true;
    player.meshGroup.add(player.armR);

    // Handheld Weapon mesh
    player.weaponMesh = new THREE.Group();
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.5), new THREE.MeshLambertMaterial({ color: 0x1c1c1c }));
    barrel.position.set(0, 0, 0.2);
    player.weaponMesh.add(barrel);

    const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    silencer.rotation.x = Math.PI / 2;
    silencer.position.set(0, 0, 0.5);
    player.weaponMesh.add(silencer);

    player.weaponMesh.position.set(0.48, 1.05, 0.35);
    player.weaponMesh.visible = false;
    player.meshGroup.add(player.weaponMesh);
  },

  createMuzzleFlash(player) {
    if (!player.weaponMesh) return;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    flash.visible = false;
    flash.position.set(0, 0, 0.65);
    player.muzzleFlash = flash;
    player.weaponMesh.add(flash);
  }
};
