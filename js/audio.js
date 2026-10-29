// ============================================================
// CITY VIBES - PROCEDURAL WEB AUDIO SYNTHESIZER
// 100% Procedural Audio - No external audio files required!
// ============================================================

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    // Vehicle Engine Audio Nodes
    this.engineOsc = null;
    this.engineSub = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Siren Audio Nodes
    this.sirenOsc = null;
    this.sirenGain = null;
    this.isSirenOn = false;
    this.sirenTimer = null;

    // Radio
    this.currentStation = 0; // 0 = off, 1 = Synthwave, 2 = Lo-Fi, 3 = Cyber
    this.radioInterval = null;
    this.stationNames = ['Radio: OFF', '98.5 NEON NIGHTS', '104.2 LO-FI VIBES', '107.9 CYBER PULSE'];
    this.radioStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // ------------------------------------------------------------
  // SOUND EFFECTS
  // ------------------------------------------------------------

  playCash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Chime chime: E6 (1318Hz) then B6 (1975Hz)
    osc1.frequency.setValueAtTime(1318, t);
    osc1.frequency.setValueAtTime(1975, t + 0.08);

    osc2.frequency.setValueAtTime(1318 * 1.5, t);
    osc2.frequency.setValueAtTime(1975 * 1.5, t + 0.08);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  playGunshot(silenced = false) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * (silenced ? 0.04 : 0.08)));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = silenced ? 'bandpass' : 'lowpass';
    filter.frequency.setValueAtTime(silenced ? 800 : 2500, t);
    filter.frequency.exponentialRampToValueAtTime(silenced ? 200 : 80, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(silenced ? 0.25 : 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (silenced ? 0.15 : 0.3));

    // Low end kick
    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kick.frequency.setValueAtTime(silenced ? 90 : 180, t);
    kick.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    kickGain.gain.setValueAtTime(silenced ? 0.15 : 0.45, t);
    kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    kick.connect(kickGain);
    kickGain.connect(this.sfxGain);

    noise.start(t);
    kick.start(t);
    kick.stop(t + 0.2);
  }

  playCameraShutter() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    
    // Click 1 (shutter open)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2400, t);
    osc1.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.05);

    // Click 2 (shutter close + motor wind)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1800, t + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(600, t + 0.14);
    gain2.gain.setValueAtTime(0.25, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.16);

    // Flash chirp
    const flash = this.ctx.createOscillator();
    const flashGain = this.ctx.createGain();
    flash.type = 'sine';
    flash.frequency.setValueAtTime(1200, t + 0.02);
    flash.frequency.exponentialRampToValueAtTime(4000, t + 0.18);
    flashGain.gain.setValueAtTime(0.12, t + 0.02);
    flashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    flash.connect(flashGain);
    flashGain.connect(this.sfxGain);
    flash.start(t + 0.02);
    flash.stop(t + 0.26);
  }

  playHorn() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(349, t); // F4
    osc2.frequency.setValueAtTime(440, t); // A4

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  playNotification(positive = true) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    if (positive) {
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
    } else {
      osc.frequency.setValueAtTime(392, t); // G4
      osc.frequency.setValueAtTime(349, t + 0.1); // F4
      osc.frequency.setValueAtTime(311, t + 0.2); // Eb4
    }

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playMissionSuccess() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.4);
    });
  }

  // ------------------------------------------------------------
  // VEHICLE ENGINE SIMULATOR
  // ------------------------------------------------------------

  startEngine() {
    this.ensureContext();
    if (!this.ctx || this.isEngineRunning) return;

    const t = this.ctx.currentTime;
    this.engineOsc = this.ctx.createOscillator();
    this.engineSub = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineFilter = this.ctx.createBiquadFilter();

    this.engineOsc.type = 'sawtooth';
    this.engineSub.type = 'triangle';

    this.engineOsc.frequency.setValueAtTime(45, t);
    this.engineSub.frequency.setValueAtTime(22.5, t);

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(250, t);

    this.engineGain.gain.setValueAtTime(0.12, t);

    this.engineOsc.connect(this.engineFilter);
    this.engineSub.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc.start(t);
    this.engineSub.start(t);
    this.isEngineRunning = true;
  }

  updateEngine(speedRatio, isAccelerating) {
    if (!this.isEngineRunning || !this.ctx) return;
    const t = this.ctx.currentTime;
    // Map speed (0 to 1) to frequency
    const targetFreq = 40 + speedRatio * 110 + (isAccelerating ? 25 : 0);
    const targetCutoff = 220 + speedRatio * 650 + (isAccelerating ? 150 : 0);
    const targetVolume = 0.08 + speedRatio * 0.12 + (isAccelerating ? 0.05 : 0);

    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
    this.engineSub.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetCutoff, t, 0.1);
    this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : targetVolume, t, 0.1);
  }

  stopEngine() {
    if (!this.isEngineRunning || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.engineGain.gain.setTargetAtTime(0.001, t, 0.1);
    setTimeout(() => {
      try {
        if (this.engineOsc) this.engineOsc.stop();
        if (this.engineSub) this.engineSub.stop();
      } catch (e) {}
      this.isEngineRunning = false;
    }, 150);
  }

  // ------------------------------------------------------------
  // AMBULANCE / POLICE SIREN
  // ------------------------------------------------------------

  toggleSiren(forceState = null) {
    this.ensureContext();
    const target = forceState !== null ? forceState : !this.isSirenOn;
    if (target === this.isSirenOn) return this.isSirenOn;

    this.isSirenOn = target;
    if (this.isSirenOn) {
      const t = this.ctx.currentTime;
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = 'sawtooth';
      this.sirenGain.gain.setValueAtTime(0.18, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      this.sirenOsc.connect(filter);
      filter.connect(this.sirenGain);
      this.sirenGain.connect(this.sfxGain);

      this.sirenOsc.start(t);

      // Wailing LFO frequency cycle
      let high = false;
      this.sirenTimer = setInterval(() => {
        if (!this.sirenOsc || !this.ctx) return;
        const now = this.ctx.currentTime;
        const targetFreq = high ? 650 : 950;
        this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.35);
        high = !high;
      }, 400);
    } else {
      if (this.sirenTimer) clearInterval(this.sirenTimer);
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.1);
      }
      setTimeout(() => {
        try {
          if (this.sirenOsc) this.sirenOsc.stop();
        } catch (e) {}
      }, 120);
    }
    return this.isSirenOn;
  }

  // ------------------------------------------------------------
  // PROCEDURAL RADIO STATIONS
  // ------------------------------------------------------------

  nextRadioStation() {
    this.ensureContext();
    this.currentStation = (this.currentStation + 1) % this.stationNames.length;
    this.restartRadio();
    return { id: this.currentStation, name: this.stationNames[this.currentStation] };
  }

  setRadioStation(id) {
    this.ensureContext();
    this.currentStation = id % this.stationNames.length;
    this.restartRadio();
    return { id: this.currentStation, name: this.stationNames[this.currentStation] };
  }

  restartRadio() {
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
    if (this.currentStation === 0 || !this.ctx) return;

    this.radioStep = 0;
    const tempo = this.currentStation === 1 ? 115 : this.currentStation === 2 ? 80 : 128;
    const stepDuration = (60 / tempo) / 2; // eighth notes

    this.radioInterval = setInterval(() => {
      this.tickRadio();
      this.radioStep = (this.radioStep + 1) % 16;
    }, stepDuration * 1000);
  }

  tickRadio() {
    if (this.isMuted || !this.ctx || this.currentStation === 0) return;
    const t = this.ctx.currentTime;
    const step = this.radioStep;

    // Station 1: Synthwave (A minor / F / C / G)
    if (this.currentStation === 1) {
      const chords = [
        [220, 261.63, 329.63], // Am
        [174.61, 220, 261.63], // F
        [130.81, 164.81, 196], // C
        [196, 246.94, 293.66]  // G
      ];
      const chord = chords[Math.floor(step / 4)];
      
      // Rolling bassline
      const bassNote = chord[0] * 0.5;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNote, t);
      bassGain.gain.setValueAtTime(0.12, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.2);

      // Synth arp on 8th notes
      const arpNote = chord[step % 3] * 2;
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpNote, t);
      arpGain.gain.setValueAtTime(0.06, t);
      arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      arpOsc.connect(arpGain);
      arpGain.connect(this.musicGain);
      arpOsc.start(t);
      arpOsc.stop(t + 0.25);
    }
    // Station 2: Lo-Fi Chill (Dm7, G7, Cmaj7)
    else if (this.currentStation === 2) {
      if (step % 4 === 0) {
        const jazzChords = [
          [146.83, 220, 261.63, 349.23], // Dm7
          [196.00, 246.94, 293.66, 349.23], // G7
          [130.81, 196.00, 246.94, 329.63]  // Cmaj7
        ];
        const chord = jazzChords[Math.floor(step / 4) % 3];
        chord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);
          osc.start(t);
          osc.stop(t + 0.95);
        });
      }
    }
    // Station 3: Cyber Pulse (Techno beat / kick + acid blip)
    else if (this.currentStation === 3) {
      // 4-on-the-floor kick
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(140, t);
        kick.frequency.exponentialRampToValueAtTime(35, t + 0.12);
        kickGain.gain.setValueAtTime(0.25, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        kick.connect(kickGain);
        kickGain.connect(this.musicGain);
        kick.start(t);
        kick.stop(t + 0.2);
      }
      // Acid resonance synth on offbeats
      if (step % 2 === 1) {
        const acid = this.ctx.createOscillator();
        const acidGain = this.ctx.createGain();
        const acidFilter = this.ctx.createBiquadFilter();
        acid.type = 'sawtooth';
        acid.frequency.setValueAtTime((step % 4 === 1 ? 110 : 164.81), t);
        acidFilter.type = 'bandpass';
        acidFilter.Q.value = 6;
        acidFilter.frequency.setValueAtTime(1200, t);
        acidFilter.frequency.exponentialRampToValueAtTime(250, t + 0.15);
        acidGain.gain.setValueAtTime(0.09, t);
        acidGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        acid.connect(acidFilter);
        acidFilter.connect(acidGain);
        acidGain.connect(this.musicGain);
        acid.start(t);
        acid.stop(t + 0.18);
      }
    }
  }
}

// Global sound manager instance
window.soundManager = new SoundManager();

