// ============================================================
// CITY VIBES - GTA CIRCULAR RADAR & AUTHENTIC SAN ANDREAS FULL MAP
// ============================================================

window.MinimapSystem = {
  drawMinimap(ui) {
    if (!ui.minimapCtx) return;
    const ctx = ui.minimapCtx;
    const canvas = ui.minimapCanvas;
    const size = canvas.width;
    const center = size / 2;

    if (ui.isMinimapMaximized) {
      this.drawFullMap(ui, ctx, size);
      return;
    }

    const scale = 0.32;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.clip();

    // Turf base
    ctx.fillStyle = '#11171d';
    ctx.fillRect(0, 0, size, size);

    const playerPos = ui.game.player.position;

    // 1. Water Canals on Radar
    ctx.fillStyle = '#0a4b78';
    // East-West Grand River
    const riverZ = center + (0 - playerPos.z) * scale;
    ctx.fillRect(0, riverZ - 24 * scale, size, 48 * scale);
    // North-South Bay River (North of Z=0)
    const riverX = center + (0 - playerPos.x) * scale;
    ctx.fillRect(riverX - 24 * scale, 0, 48 * scale, size);

    // 2. City Roads Grid
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 7;

    const avenues = [-300, -180, 0, 180, 300, 450, -450];
    avenues.forEach(av => {
      // Vertical Avenues
      const rx = center + (av - playerPos.x) * scale;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, size);
      ctx.stroke();

      // Horizontal Avenues
      const rz = center + (av - playerPos.z) * scale;
      ctx.beginPath();
      ctx.moveTo(0, rz);
      ctx.lineTo(size, rz);
      ctx.stroke();
    });

    // Dashed road centerlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    avenues.forEach(av => {
      const rx = center + (av - playerPos.x) * scale;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, size);
      ctx.stroke();

      const rz = center + (av - playerPos.z) * scale;
      ctx.beginPath();
      ctx.moveTo(0, rz);
      ctx.lineTo(size, rz);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Interactive Landmarks
    if (ui.game.world && ui.game.world.interactiveSpots) {
      ui.game.world.interactiveSpots.forEach(spot => {
        const sx = center + (spot.position.x - playerPos.x) * scale;
        const sz = center + (spot.position.z - playerPos.z) * scale;

        ctx.fillStyle = '#' + (spot.color ? spot.color.toString(16).padStart(6, '0') : '00f0ff');
        ctx.beginPath();
        ctx.arc(sx, sz, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 4. Police Cruiser & Officer
    if (ui.game.pedestrianManager) {
      if (ui.game.pedestrianManager.policeCruiser) {
        const pc = ui.game.pedestrianManager.policeCruiser.group.position;
        const pcx = center + (pc.x - playerPos.x) * scale;
        const pcz = center + (pc.z - playerPos.z) * scale;
        ctx.fillStyle = '#0984e3';
        ctx.beginPath();
        ctx.arc(pcx, pcz, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      if (ui.game.pedestrianManager.policeOfficer) {
        const po = ui.game.pedestrianManager.policeOfficer.group.position;
        const pox = center + (po.x - playerPos.x) * scale;
        const poz = center + (po.z - playerPos.z) * scale;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(pox, poz, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 5. Assassin Targets
    if (ui.game.pedestrianManager && ui.game.pedestrianManager.targets) {
      ui.game.pedestrianManager.targets.forEach(t => {
        const tx = center + (t.mesh.position.x - playerPos.x) * scale;
        const tz = center + (t.mesh.position.z - playerPos.z) * scale;

        ctx.fillStyle = t.isDead ? '#00ff88' : '#ff0044';
        ctx.beginPath();
        ctx.arc(tx, tz, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 6. Mission Objective / Waypoint Navigation
    let targetPos = null;
    let targetLabel = '';
    let targetColor = '#ffea00';

    if (ui.game.jobs && ui.game.jobs.activeMission) {
      const mission = ui.game.jobs.activeMission;
      targetPos = (mission.stage === 'deliver' || mission.stage === 'dropoff')
        ? mission.dropoffPos
        : mission.pickupPos;

      if (mission.type === 'ambulance') {
        targetLabel = mission.stage === 'pickup' ? '🚑 Patient' : '🏥 Hospital ER';
        targetColor = '#e74c3c';
      } else if (mission.type === 'taxi') {
        targetLabel = mission.stage === 'pickup_passenger' ? '🚖 Fare' : '📍 Dropoff';
        targetColor = '#f1c40f';
      } else if (mission.type === 'delivery') {
        targetLabel = mission.stage === 'pickup_order' ? '🍕 Pizzeria' : '📦 Customer';
        targetColor = '#f39c12';
      }
    } else if (ui.game.jobs && ui.game.jobs.beaconPos) {
      targetPos = ui.game.jobs.beaconPos;
      targetLabel = '📍 Target';
      targetColor = '#00f0ff';
    }

    if (targetPos) {
      const dx = targetPos.x - playerPos.x;
      const dz = targetPos.z - playerPos.z;
      const dist = Math.hypot(dx, dz);
      const screenDx = dx * scale;
      const screenDz = dz * scale;
      const screenDist = Math.hypot(screenDx, screenDz);
      const maxRadarDist = center - 14;

      if (screenDist <= maxRadarDist) {
        const mx = center + screenDx;
        const mz = center + screenDz;

        ctx.fillStyle = targetColor;
        ctx.beginPath();
        ctx.arc(mx, mz, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = targetColor;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(dist)}m`, mx, mz - 8);
      } else {
        const angle = Math.atan2(screenDz, screenDx);
        const rimX = center + Math.cos(angle) * (center - 12);
        const rimY = center + Math.sin(angle) * (center - 12);

        ctx.save();
        ctx.translate(rimX, rimY);
        ctx.rotate(angle);

        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.25;
        ctx.fillStyle = targetColor;
        ctx.beginPath();
        ctx.moveTo(7 * pulse, 0);
        ctx.lineTo(-6 * pulse, -5 * pulse);
        ctx.lineTo(-3 * pulse, 0);
        ctx.lineTo(-6 * pulse, 5 * pulse);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        const textDistX = center + Math.cos(angle) * (center - 25);
        const textDistY = center + Math.sin(angle) * (center - 25);
        ctx.fillStyle = targetColor;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(`${targetLabel} ${Math.round(dist)}m`, textDistX, textDistY);
        ctx.shadowBlur = 0;
      }
    }

    // 7. Player Direction Arrow
    ctx.save();
    ctx.translate(center, center);
    const angle = ui.game.vehicleManager.activeVehicle
      ? -ui.game.vehicleManager.activeVehicle.group.rotation.y
      : -ui.game.player.heading;
    ctx.rotate(angle);

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Radar border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();
  },

  drawFullMap(ui, ctx, size) {
    const center = size / 2;
    const mapScale = (size * 0.84) / 1200;

    ctx.clearRect(0, 0, size, size);

    // Deep Ocean Background (San Andreas Ocean)
    ctx.fillStyle = '#071a2c';
    ctx.fillRect(0, 0, size, size);

    // ------------------------------------------------------------
    // 1. SAN ANDREAS 3 DISTINCT REGIONS & LANDMASSES
    // ------------------------------------------------------------
    const toScreen = (x, z) => ({
      x: center + x * mapScale,
      y: center + z * mapScale
    });

    // 1A. South-East Island: LOS SANTOS & SANTA MARIA BEACH
    ctx.fillStyle = '#1b3222';
    const lsP1 = toScreen(-100, 20);
    const lsW = 620 * mapScale;
    const lsH = 500 * mapScale;
    ctx.fillRect(lsP1.x, lsP1.y, lsW, lsH);

    // Sandy Beach along East & South coast
    ctx.fillStyle = '#f5cd79';
    ctx.fillRect(lsP1.x + lsW - 35 * mapScale, lsP1.y, 35 * mapScale, lsH);
    ctx.fillRect(lsP1.x, lsP1.y + lsH - 25 * mapScale, lsW, 25 * mapScale);

    // 1B. South-West Island: MOUNT CHILIAD & FLINT COUNTY
    ctx.fillStyle = '#1a2e1d';
    const mcP1 = toScreen(-520, 20);
    const mcW = 400 * mapScale;
    const mcH = 500 * mapScale;
    ctx.fillRect(mcP1.x, mcP1.y, mcW, mcH);

    // Mount Chiliad Topographic Contours
    const mcCenter = toScreen(-340, 380);
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(mcCenter.x, mcCenter.y, 65 * mapScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.arc(mcCenter.x, mcCenter.y, 45 * mapScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(mcCenter.x, mcCenter.y, 25 * mapScale, 0, Math.PI * 2);
    ctx.fill();

    // 1C. North-West Island: SAN FIERRO & CHINATOWN
    ctx.fillStyle = '#22303c';
    const sfP1 = toScreen(-520, -520);
    const sfW = 420 * mapScale;
    const sfH = 500 * mapScale;
    ctx.fillRect(sfP1.x, sfP1.y, sfW, sfH);

    // 1D. North-East Island: LAS VENTURAS & BONE COUNTY DESERT
    ctx.fillStyle = '#8d6e40'; // desert sand
    const lvP1 = toScreen(80, -520);
    const lvW = 440 * mapScale;
    const lvH = 500 * mapScale;
    ctx.fillRect(lvP1.x, lvP1.y, lvW, lvH);

    // Bone County Center (Mesas)
    ctx.fillStyle = '#a0522d';
    const bcP1 = toScreen(-100, -520);
    ctx.fillRect(bcP1.x, bcP1.y, 180 * mapScale, 400 * mapScale);

    // ------------------------------------------------------------
    // 2. SAN ANDREAS WATERWAY CANALS & BAY
    // ------------------------------------------------------------
    ctx.fillStyle = '#0a4b78';
    // Grand East-West River (separating North from South)
    const ewRiverY = toScreen(0, -10).y;
    ctx.fillRect(0, ewRiverY, size, 32 * mapScale);

    // North-South Bay (separating San Fierro from Las Venturas)
    const nsBayX = toScreen(-40, 0).x;
    ctx.fillRect(nsBayX, 0, 48 * mapScale, ewRiverY + 32 * mapScale);

    // ------------------------------------------------------------
    // 3. HIGHWAY NETWORK & BRIDGES
    // ------------------------------------------------------------
    // Julius Thruway ring (Las Venturas)
    ctx.strokeStyle = '#f1c40f'; // Gold highway
    ctx.lineWidth = 4 * mapScale;
    const jtP1 = toScreen(100, -450);
    const jtP2 = toScreen(450, -100);
    ctx.strokeRect(jtP1.x, jtP1.y, jtP2.x - jtP1.x, jtP2.y - jtP1.y);

    // Gant Red Suspension Bridge (San Fierro crossing north)
    ctx.strokeStyle = '#e74c3c'; // Iconic Red Bridge
    ctx.lineWidth = 6 * mapScale;
    const gbStart = toScreen(-300, -450);
    const gbEnd = toScreen(-300, -310);
    ctx.beginPath();
    ctx.moveTo(gbStart.x, gbStart.y);
    ctx.lineTo(gbEnd.x, gbEnd.y);
    ctx.stroke();

    // Central Crossing Bridges over the Grand River
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5 * mapScale;
    const bridges = [
      { x: -300, z1: -30, z2: 40 },
      { x: 0, z1: -30, z2: 40 },
      { x: 300, z1: -30, z2: 40 }
    ];
    bridges.forEach(b => {
      const p1 = toScreen(b.x, b.z1);
      const p2 = toScreen(b.x, b.z2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Los Santos Urban Grid
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 3 * mapScale;
    [-20, 80, 180, 280, 380].forEach(gx => {
      const p1 = toScreen(gx, 60);
      const p2 = toScreen(gx, 440);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    [80, 180, 280, 380].forEach(gz => {
      const p1 = toScreen(-20, gz);
      const p2 = toScreen(440, gz);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // LSX Airport Runway (white stripes)
    const r1 = toScreen(220, 370);
    const r2 = toScreen(220, 470);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5 * mapScale;
    ctx.beginPath();
    ctx.moveTo(r1.x, r1.y);
    ctx.lineTo(r2.x, r2.y);
    ctx.stroke();

    // ------------------------------------------------------------
    // 4. DISTRICT LABELS & TAXI HUBS
    // ------------------------------------------------------------
    const districts = window.WorldMapData.districts;
    const playerPos = ui.game.player.position;

    districts.forEach(d => {
      const pos = toScreen(d.center.x, d.center.z);
      const isCurrent = (ui.game.world.currentDistrictId === d.id);

      ctx.fillStyle = isCurrent ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 0, 0, 0.45)';
      ctx.strokeStyle = '#' + d.color.toString(16).padStart(6, '0');
      ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 48 * mapScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCurrent ? '#00f0ff' : '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(d.name, pos.x, pos.y - 8);
      ctx.shadowBlur = 0;

      const dist = Math.round(playerPos.distanceTo(d.center));
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(`${dist}m • Taxi ($200)`, pos.x, pos.y + 12);
    });

    // ------------------------------------------------------------
    // 5. ICONIC GTA SAN ANDREAS LANDMARK BLIPS
    // ------------------------------------------------------------
    if (ui.game.world && ui.game.world.interactiveSpots) {
      ui.game.world.interactiveSpots.forEach(spot => {
        const p = toScreen(spot.position.x, spot.position.z);
        ctx.fillStyle = '#' + (spot.color ? spot.color.toString(16).padStart(6, '0') : '00f0ff');
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // ------------------------------------------------------------
    // 6. PLAYER PIN & HEADING
    // ------------------------------------------------------------
    const pp = toScreen(playerPos.x, playerPos.z);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(pp.x, pp.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 3;
    ctx.fillText('YOU', pp.x, pp.y - 12);
    ctx.shadowBlur = 0;

    // ------------------------------------------------------------
    // 7. MAP BANNER & LEGEND
    // ------------------------------------------------------------
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(16, 16, 320, 52);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, 320, 52);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STATE OF SAN ANDREAS', 26, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Los Santos • San Fierro • Las Venturas • Mt. Chiliad', 26, 56);

    // Fast travel instruction footer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(16, size - 46, 260, 32);
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, size - 46, 260, 32);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('🚖 CLICK ANY DISTRICT FOR TAXI ($200)', 24, size - 26);
  },

  handleMaximizedMapClick(ui, e) {
    const canvas = ui.minimapCanvas;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const size = canvas.width;
    const center = size / 2;
    const mapScale = (size * 0.84) / 1200;

    const worldX = (clickX - center) / mapScale;
    const worldZ = (clickY - center) / mapScale;
    const clickPos = new THREE.Vector3(worldX, 0, worldZ);

    const districts = window.WorldMapData.districts;
    let closestDistrict = null;
    let minDist = 220;

    districts.forEach(d => {
      const dist = clickPos.distanceTo(new THREE.Vector3(d.center.x, 0, d.center.z));
      if (dist < minDist) {
        minDist = dist;
        closestDistrict = d;
      }
    });

    if (closestDistrict) {
      ui.game.economy.fastTravelTaxi(closestDistrict.id);
    }
  }
};
