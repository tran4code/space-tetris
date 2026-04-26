// Lightweight SFX synthesized via Web Audio API.
// No assets, no bundle bloat — every effect is a few oscillators with envelopes.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let unlocked = false;

const STORAGE_KEY = 'artemis-tetris-sound';

export function loadSoundEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v !== '0';
  } catch {
    return true;
  }
}

export function saveSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    // ignore
  }
}

let soundOn = loadSoundEnabled();
export function setSoundEnabled(on: boolean) {
  soundOn = on;
  saveSoundEnabled(on);
}

function getCtx(): AudioContext | null {
  if (!soundOn) return null;
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
  }
  // Browsers suspend AudioContext until a user gesture; resume opportunistically.
  if (ctx.state === 'suspended' && unlocked) {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call from any user-gesture handler so subsequent SFX play immediately. */
export function unlockAudio() {
  unlocked = true;
  const c = getCtx();
  if (c?.state === 'suspended') c.resume().catch(() => {});
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  attack?: number;
  hold?: number;
  release?: number;
  peak?: number;
  delay?: number;
  glide?: number; // target frequency to glide to over (attack+hold+release)
}

function tone(opts: ToneOpts) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const { freq, type = 'sine', attack = 0.005, hold = 0.04, release = 0.08, peak = 0.25, delay = 0, glide } = opts;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glide !== undefined) {
    osc.frequency.linearRampToValueAtTime(glide, start + attack + hold + release);
  }
  osc.connect(g).connect(masterGain);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + attack);
  g.gain.setValueAtTime(peak, start + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
  osc.start(start);
  osc.stop(start + attack + hold + release + 0.02);
}

function noiseBurst(duration: number, peak: number, filterFreq: number) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, sr * duration, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 1.5;
  const g = c.createGain();
  g.gain.value = peak;
  src.connect(filter).connect(g).connect(masterGain);
  src.start();
}

export function playPickup() {
  tone({ freq: 520, type: 'square', attack: 0.005, hold: 0.02, release: 0.06, peak: 0.12 });
}

export function playInvalid() {
  tone({ freq: 180, type: 'sawtooth', attack: 0.005, hold: 0.05, release: 0.1, peak: 0.15, glide: 100 });
}

export function playSnap() {
  tone({ freq: 660, type: 'triangle', attack: 0.003, hold: 0.02, release: 0.06, peak: 0.18 });
  tone({ freq: 880, type: 'triangle', attack: 0.003, hold: 0.02, release: 0.06, peak: 0.1, delay: 0.02 });
}

export function playLineClear(combo: number) {
  // Rising arpeggio scaled by combo. Combo 1 = C5 E5 G5; combo 2 = D5 F#5 A5; etc.
  const semitoneShift = (combo - 1) * 2;
  const base = 523.25 * Math.pow(2, semitoneShift / 12);
  const ratios = [1, 1.26, 1.5];
  ratios.forEach((r, i) => {
    tone({
      freq: base * r,
      type: 'sine',
      attack: 0.005,
      hold: 0.05,
      release: 0.18,
      peak: 0.18,
      delay: i * 0.06,
    });
  });
  noiseBurst(0.18, 0.06, 1800);
}

export function playCombo(combo: number) {
  // Higher and brighter as combo grows.
  const freq = 880 + Math.min(combo, 6) * 80;
  tone({ freq, type: 'square', attack: 0.005, hold: 0.05, release: 0.15, peak: 0.18 });
  tone({ freq: freq * 1.5, type: 'square', attack: 0.005, hold: 0.05, release: 0.15, peak: 0.1, delay: 0.04 });
}

export function playBonusUnlock() {
  // "Treasure" arpeggio.
  const notes = [659.25, 783.99, 987.77, 1318.51];
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'triangle', attack: 0.005, hold: 0.04, release: 0.18, peak: 0.18, delay: i * 0.07 });
  });
}

export function playPerfectClear() {
  // Major arpeggio + sweep.
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'triangle', attack: 0.005, hold: 0.06, release: 0.45, peak: 0.22, delay: i * 0.08 });
  });
  noiseBurst(0.6, 0.05, 3000);
}

export function playGameOver() {
  tone({ freq: 440, type: 'sawtooth', attack: 0.01, hold: 0.1, release: 0.4, peak: 0.2, glide: 110 });
}
