/**
 * Original generative ambience (Web Audio API — no audio files, no licensing).
 * A soft detuned pad + slow filter breathing + sparse pentatonic chimes.
 * Off by default. Audio can only start after a user gesture, so turning sound on
 * never autoplays unexpectedly; a saved "on" preference resumes on the next interaction.
 */
import * as settings from '../core/settings.js';

let ctx = null;
let master = null;
let chimeTimer = null;
let nodes = [];

const ROOT_HZ = 146.83; // D3
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16];

function semis(n) { return ROOT_HZ * 2 ** (n / 12); }

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.4;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 380;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // Gentle stereo delay for space.
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  delay.connect(feedback).connect(delay);

  filter.connect(master);
  delay.connect(master);
  master.connect(ctx.destination);

  [0, 7, 12, 16].forEach((n, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = i % 2 ? 'sine' : 'triangle';
    osc.frequency.value = semis(n - 12);
    osc.detune.value = (i - 1.5) * 6;
    g.gain.value = 0.05 / (i + 1);
    osc.connect(g).connect(filter);
    osc.start();
    nodes.push(osc);
  });

  const chime = () => {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = semis(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] + 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    osc.connect(g);
    g.connect(master);
    g.connect(delay);
    osc.start(t);
    osc.stop(t + 3.3);
  };
  chimeTimer = setInterval(() => { if (Math.random() < 0.55) chime(); }, 2600);
}

function fadeTo(value, seconds = 1.2) {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(value, t + seconds);
}

async function start() {
  if (!ctx) build();
  if (ctx.state === 'suspended') await ctx.resume();
  fadeTo(0.55);
}

function stop() {
  if (!ctx) return;
  fadeTo(0, 0.6);
  setTimeout(() => { if (!settings.get('sound') && ctx) ctx.suspend(); }, 700);
}

/** Short soft swell for portal activation (only when sound is on). */
export function portalCue() {
  if (!ctx || !settings.get('sound') || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  [12, 16, 19].forEach((n, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = semis(n + 12);
    g.gain.setValueAtTime(0.0001, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.03, t + i * 0.08 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc.connect(g).connect(master);
    osc.start(t + i * 0.08);
    osc.stop(t + 1.7);
  });
}

export function initSound() {
  const buttons = document.querySelectorAll('[data-sound-toggle]');
  const sync = () => {
    const on = !!settings.get('sound');
    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Sound on — turn off ambient sound' : 'Sound off — turn on ambient sound');
      b.querySelector('[data-icon-on]')?.toggleAttribute('hidden', !on);
      b.querySelector('[data-icon-off]')?.toggleAttribute('hidden', on);
    });
  };
  buttons.forEach((b) => b.addEventListener('click', () => settings.set('sound', !settings.get('sound'))));
  settings.onChange((key) => {
    if (key !== 'sound' && key !== '*') return;
    sync();
    if (settings.get('sound')) start(); else stop();
  });
  sync();
  if (settings.get('sound')) {
    // Saved preference: resume on the first deliberate interaction (browser autoplay policy).
    const resume = () => { if (settings.get('sound')) start(); };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (settings.get('sound')) ctx.resume();
  });
}

export function disposeSound() {
  clearInterval(chimeTimer);
  nodes.forEach((n) => n.stop());
  nodes = [];
  ctx?.close();
  ctx = null;
}
