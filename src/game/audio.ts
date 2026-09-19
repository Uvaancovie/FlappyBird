import { SOUND_FLY_PATH, SOUND_CRASH_PATH, SOUND_SCORE_PATH } from './constants';

class AudioManager {
  private static instance: AudioManager;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private audioCache: Map<string, HTMLAudioElement[]> = new Map();
  private isUnlocked: boolean = false;

  private constructor() {
    this.soundEnabled = localStorage.getItem('flappy_sound_enabled') !== 'false';
    this.preloadSounds();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private preloadSounds() {
    if (typeof window === 'undefined') return;
    const paths = [SOUND_FLY_PATH, SOUND_CRASH_PATH, SOUND_SCORE_PATH];
    paths.forEach(path => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        pool.push(audio);
      }
      this.audioCache.set(path, pool);
    });
  }

  public unlockAudio() {
    if (this.isUnlocked) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      }
      this.isUnlocked = true;
    } catch {
      // ignore
    }
  }

  private playFromPool(path: string, synthFallback: () => void) {
    if (!this.soundEnabled) return;
    this.unlockAudio();

    const pool = this.audioCache.get(path);
    if (pool && pool.length > 0) {
      const available = pool.find(a => a.paused || a.ended) || pool[0];
      available.currentTime = 0;
      available.play().catch(() => {
        synthFallback();
      });
    } else {
      synthFallback();
    }
  }

  public playFly() {
    this.playFromPool(SOUND_FLY_PATH, () => this.synthFlap());
  }

  public playCrash() {
    this.playFromPool(SOUND_CRASH_PATH, () => this.synthCrash());
  }

  public playScore() {
    this.playFromPool(SOUND_SCORE_PATH, () => this.synthScore());
  }

  public playCashOut() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.unlockAudio();
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.3, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch {
      // ignore
    }
  }

  public playCoinChip() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.unlockAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.audioCtx.currentTime); // B5
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  public playMultiplierTick(multiplier: number) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.unlockAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      const baseFreq = 400 + Math.min(multiplier * 40, 1200);
      osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch {
      // ignore
    }
  }

  // Synthesized fallbacks using Web Audio in case wav loading is blocked
  private synthFlap() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  private synthScore() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  private synthCrash() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.15;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
      noise.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch {
      // ignore
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('flappy_sound_enabled', enabled ? 'true' : 'false');
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
}

export const audioManager = AudioManager.getInstance();
