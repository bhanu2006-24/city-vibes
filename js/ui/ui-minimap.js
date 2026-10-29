// ============================================================
// CITY VIBES - GTA CIRCULAR RADAR & FULL ISLAND MAP
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
    ctx.fillStyle = '#0a3d62';
    // North-South river
    const riverX = center + (0 - playerPos.x) * scale;
    ctx.fillRect(riverX - 24 * scale, 0, 48 * scale, size);
    // East-West river
    const riverZ = center + (0 - playerPos.z) * scale;
    ctx.fillRect(0, riverZ - 24 * scale, size, 48 * scale);

    // 2. City Roads Grid
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 7;

    const avenues = [-240, -120, 0, 120, 240, 360, -360];
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
    const mapScale = (size * 0.82) / 1200; // fits 1200m island cleanly inside full screen

    ctx.clearRect(0, 0, size, size);

    // Deep Ocean Background
    ctx.fillStyle = '#09253d';
    ctx.fillRect(0, 0, size, size);

    // Main Island Landmass
    const landSize = 1160 * mapScale;
    ctx.fillStyle = '#1b281f';
    ctx.fillRect(center - landSize / 2, center - landSize / 2, landSize, landSize);
    ctx.strokeStyle = '#f5cd79'; // sand border
    ctx.lineWidth = 4;
    ctx.strokeRect(center - landSize / 2, center - landSize / 2, landSize, landSize);

    // River Canals
    ctx.fillStyle = '#0e5a8a';
    ctx.fillRect(center - 18 * mapScale, center - landSize / 2, 36 * mapScale, landSize);
    ctx.fillRect(center - landSize / 2, center - 18 * mapScale, landSize, 36 * mapScale);

    // Expressways & Bridges
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 5;
    const avenues = [-240, 0, 240];
    avenues.forEach(av => {
      const rx = center + av * mapScale;
      ctx.beginPath();
      ctx.moveTo(rx, center - landSize / 2);
      ctx.lineTo(rx, center + landSize / 2);
      ctx.stroke();

      const rz = center + av * mapScale;
      ctx.beginPath();
      ctx.moveTo(center - landSize / 2, rz);
      ctx.lineTo(center + landSize / 2, rz);
      ctx.stroke();
    });

    // Districts
    const districts = window.WorldMapData.districts;
    const playerPos = ui.game.player.position;

    districts.forEach(d => {
      const dx = center + d.center.x * mapScale;
      const dz = center + d.center.z * mapScale;
      const isCurrent = (ui.game.world.currentDistrictId === d.id);

      ctx.fillStyle = isCurrent ? 'rgba(0, 240, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = '#' + d.color.toString(16).padStart(6, '0');
      ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(dx, dz, 45 * mapScale * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCurrent ? '#00f0ff' : '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(d.name, dx, dz - 8);
      ctx.shadowBlur = 0;

      const dist = Math.round(playerPos.distanceTo(d.center));
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${dist}m • Taxi ($200)`, dx, dz + 12);
    });

    // Interactive Landmarks on Full Map
    if (ui.game.world && ui.game.world.interactiveSpots) {
      ui.game.world.interactiveSpots.forEach(spot => {
        const sx = center + spot.position.x * mapScale;
        const sz = center + spot.position.z * mapScale;

        ctx.fillStyle = '#' + (spot.color ? spot.color.toString(16).padStart(6, '0') : '00f0ff');
        ctx.beginPath();
        ctx.arc(sx, sz, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Player Pin
    const px = center + playerPos.x * mapScale;
    const pz = center + playerPos.z * mapScale;

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(px, pz, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', px, pz - 12);

    // Legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(16, size - 48, 220, 36);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, size - 48, 220, 36);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('GTA ISLAND STATE: 1200m × 1200m', 24, size - 30);
    ctx.fillText('CLICK ANY DISTRICT FOR TAXI ($200)', 24, size - 16);
  },

  handleMaximizedMapClick(ui, e) {
    const canvas = ui.minimapCanvas;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const size = canvas.width;
    const center = size / 2;
    const mapScale = (size * 0.82) / 1200;

    const worldX = (clickX - center) / mapScale;
    const worldZ = (clickY - center) / mapScale;
    const clickPos = new THREE.Vector3(worldX, 0, worldZ);

    const districts = window.WorldMapData.districts;
    let closestDistrict = null;
    let minDist = 180;

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
