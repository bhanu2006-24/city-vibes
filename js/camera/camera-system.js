// ============================================================
// CITY VIBES - SMARTPHONE CAMERA & BOUNTY PHOTO PROOF SYSTEM
// ============================================================

class CameraSystem {
  constructor(game) {
    this.game = game;
    this.isActive = false;
    this.zoomLevel = 1.0;
    this.capturedPhotos = []; // Gallery storage
    this.targetInFocus = null;

    // Viewfinder DOM elements
    this.viewfinderEl = document.getElementById('camera-viewfinder');
    this.targetBoxEl = document.getElementById('camera-target-box');
    this.targetStatusEl = document.getElementById('camera-target-status');
    this.flashEl = document.getElementById('camera-flash');
  }

  toggleCamera() {
    this.isActive = !this.isActive;
    if (this.viewfinderEl) {
      this.viewfinderEl.classList.toggle('active', this.isActive);
    }

    if (this.isActive) {
      // Switch player camera FOV for realistic photo lens
      this.game.camera.fov = 45;
      this.game.camera.updateProjectionMatrix();
      if (window.gameUI) {
        window.gameUI.showNotification('📷 Camera Active: Frame your target and click to snap!', 'camera');
      }
    } else {
      this.game.camera.fov = 60;
      this.game.camera.updateProjectionMatrix();
      if (this.targetBoxEl) this.targetBoxEl.style.display = 'none';
    }

    return this.isActive;
  }

  capturePhoto() {
    if (!this.isActive) return;

    // Play camera shutter sound
    window.soundManager.playCameraShutter();

    // Trigger visual screen flash
    if (this.flashEl) {
      this.flashEl.classList.add('flash');
      setTimeout(() => {
        this.flashEl.classList.remove('flash');
      }, 150);
    }

    // Capture WebGL Canvas image
    let dataUrl = '';
    try {
      dataUrl = this.game.renderer.domElement.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.warn('Canvas export error', e);
    }

    // Target Recognition Verification
    const detectedTarget = this.checkTargetInView();

    const photoRecord = {
      id: Date.now(),
      image: dataUrl,
      timestamp: new Date().toLocaleTimeString(),
      targetName: detectedTarget ? detectedTarget.name : null,
      bountyVerified: false
    };

    if (detectedTarget) {
      if (detectedTarget.isDead) {
        if (!detectedTarget.photoTaken) {
          detectedTarget.photoTaken = true;
          photoRecord.bountyVerified = true;

          // Process Guild Bounty Reward
          this.processGuildBounty(detectedTarget);
        } else {
          window.gameUI.showNotification('⚠️ Photo already submitted for this contract!', 'warning');
        }
      } else {
        window.gameUI.showNotification(
          '❌ Guild Handler: Target is still alive! Eliminate target before sending photo proof.',
          'error',
          5000
        );
      }
    } else {
      window.gameUI.showNotification('📷 Photo saved to Gallery', 'camera');
    }

    this.capturedPhotos.unshift(photoRecord);
    if (this.capturedPhotos.length > 12) this.capturedPhotos.pop();
  }

  processGuildBounty(target) {
    // Play cash chime & mission success fanfare
    window.soundManager.playCash();
    setTimeout(() => {
      window.soundManager.playMissionSuccess();
    }, 250);

    // Award money
    this.game.economy.addCash(target.bounty);

    // Complete contract in Guild
    this.game.jobs.completeAssassinContract(target.id);

    // Rich Notification Banner
    if (window.gameUI) {
      window.gameUI.showBountyRewardModal(target);
    }
  }

  checkTargetInView() {
    const targets = this.game.pedestrianManager.targets;
    const camera = this.game.camera;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const targetPos = t.mesh.position.clone();
      targetPos.y += t.isDead ? 0.3 : 1.2;

      // Distance check
      const dist = camera.position.distanceTo(targetPos);
      if (dist > 35) continue;

      // Screen projection
      const screenPos = targetPos.project(camera);

      // Check if inside camera viewport frustum
      if (
        screenPos.z > 0 &&
        screenPos.z < 1 &&
        screenPos.x >= -0.65 &&
        screenPos.x <= 0.65 &&
        screenPos.y >= -0.65 &&
        screenPos.y <= 0.65
      ) {
        // Line-of-sight raycast check (make sure not occluded by a wall)
        const dir = targetPos.clone().sub(camera.position).normalize();
        const raycaster = new THREE.Raycaster(camera.position, dir, 0.5, dist + 1);
        const colliders = this.game.world.colliders;

        // If unobstructed, return target
        return t;
      }
    }
    return null;
  }

  update(delta) {
    if (!this.isActive) return;

    // Real-time Target AI Detection Box
    const detected = this.checkTargetInView();
    this.targetInFocus = detected;

    if (detected && this.targetBoxEl && this.targetStatusEl) {
      const targetPos = detected.mesh.position.clone();
      targetPos.y += detected.isDead ? 0.3 : 1.2;
      const screenPos = targetPos.project(this.game.camera);

      const x = ((screenPos.x + 1) * window.innerWidth) / 2;
      const y = ((-screenPos.y + 1) * window.innerHeight) / 2;

      this.targetBoxEl.style.display = 'block';
      this.targetBoxEl.style.left = `${x - 65}px`;
      this.targetBoxEl.style.top = `${y - 65}px`;

      if (detected.isDead) {
        this.targetBoxEl.className = 'camera-box box-dead';
        this.targetStatusEl.innerHTML = `TARGET: ${detected.name}<br><span style="color:#2ecc71;">STATUS: ELIMINATED - READY FOR PROOF</span><br>BOUNTY: $${detected.bounty.toLocaleString()}`;
      } else {
        this.targetBoxEl.className = 'camera-box box-alive';
        this.targetStatusEl.innerHTML = `TARGET: ${detected.name}<br><span style="color:#e74c3c;">STATUS: ALIVE (ELIMINATE FIRST)</span><br>BOUNTY: $${detected.bounty.toLocaleString()}`;
      }
    } else if (this.targetBoxEl) {
      this.targetBoxEl.style.display = 'none';
    }
  }
}

window.CameraSystem = CameraSystem;

