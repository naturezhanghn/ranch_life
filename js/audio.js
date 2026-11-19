export class FarmAudio {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.context = null;
    this.master = null;
    this.ambientTimer = null;
    this.ambientStep = 0;
    this.sceneId = "farm";
    this.melodies = {
      farm: [261.63, 293.66, 329.63, 392.0, 329.63, 293.66, 261.63, 220.0],
      city: [293.66, 349.23, 392.0, 440.0, 392.0, 349.23, 293.66, 261.63],
      port: [220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 220.0, 196.0],
      council: [246.94, 293.66, 369.99, 440.0, 369.99, 329.63, 293.66, 246.94],
      workshop: [329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 349.23, 329.63],
      island: [261.63, 311.13, 369.99, 466.16, 369.99, 311.13, 261.63, 233.08],
    };
    this.melody = this.melodies.farm;
  }

  async unlock() {
    if (!this.enabled) return;
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.context.destination);
      this.startAmbient();
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.context || !this.master) return;
    this.master.gain.setTargetAtTime(enabled ? 0.16 : 0, this.context.currentTime, 0.05);
    if (enabled) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  setScene(sceneId = "farm") {
    const nextScene = this.melodies[sceneId] ? sceneId : "farm";
    if (nextScene === this.sceneId) return;
    this.sceneId = nextScene;
    this.melody = this.melodies[nextScene];
    this.ambientStep = 0;
  }

  tone(frequency, duration, options = {}) {
    if (!this.enabled || !this.context || !this.master) return;
    const {
      type = "sine",
      gain = 0.12,
      delay = 0,
      slideTo = null,
      attack = 0.01,
      release = 0.14,
    } = options;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
    }
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(gain, now + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    oscillator.connect(envelope);
    envelope.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + release + 0.02);
  }

  noise(duration = 0.12, gain = 0.04) {
    if (!this.enabled || !this.context || !this.master) return;
    const frames = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frames, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frames; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
    }
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 850;
    envelope.gain.value = gain;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.master);
    source.start();
  }

  startAmbient() {
    if (!this.enabled || !this.context || this.ambientTimer) return;
    this.ambientTimer = window.setInterval(() => {
      if (!this.enabled || !this.context) return;
      const note = this.melody[this.ambientStep % this.melody.length];
      const harmony = this.ambientStep % 4 === 0 ? note / 2 : note * 1.25;
      this.tone(note, 2.4, { type: "sine", gain: 0.014, release: 1.8 });
      this.tone(harmony, 2.4, {
        type: "triangle",
        gain: 0.006,
        release: 2.0,
        delay: 0.18,
      });
      this.ambientStep += 1;
    }, 4200);
  }

  stopAmbient() {
    if (this.ambientTimer) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  play(name) {
    if (!this.enabled || !this.context) return;
    switch (name) {
      case "hoe":
        this.tone(105, 0.16, { type: "sine", gain: 0.13, slideTo: 64 });
        this.noise(0.13, 0.045);
        break;
      case "seed":
        this.tone(520, 0.08, { type: "triangle", gain: 0.045 });
        this.tone(660, 0.09, { type: "triangle", gain: 0.04, delay: 0.06 });
        break;
      case "water":
        this.noise(0.23, 0.035);
        this.tone(740, 0.12, { type: "sine", gain: 0.025, slideTo: 420 });
        break;
      case "harvest":
        this.tone(523.25, 0.12, { type: "sine", gain: 0.055 });
        this.tone(659.25, 0.12, { type: "sine", gain: 0.05, delay: 0.08 });
        this.tone(783.99, 0.2, { type: "sine", gain: 0.045, delay: 0.16 });
        break;
      case "ui":
        this.tone(490, 0.06, { type: "sine", gain: 0.028 });
        break;
      case "success":
        this.tone(523.25, 0.16, { type: "sine", gain: 0.05 });
        this.tone(783.99, 0.24, { type: "sine", gain: 0.04, delay: 0.11 });
        break;
      case "error":
        this.tone(170, 0.14, { type: "triangle", gain: 0.04, slideTo: 125 });
        break;
      case "sleep":
        this.tone(392, 0.4, { type: "sine", gain: 0.035 });
        this.tone(261.63, 0.6, { type: "sine", gain: 0.03, delay: 0.22 });
        break;
      case "memory":
        this.tone(880, 0.08, { type: "sine", gain: 0.02 });
        this.tone(1174.66, 0.12, { type: "sine", gain: 0.015, delay: 0.08 });
        break;
      default:
        break;
    }
  }
}
