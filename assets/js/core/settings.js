/**
 * Experience settings — persisted in localStorage, shared by every page.
 *
 *  quality : 'lite' | 'balanced' | 'high'   (graphics profile; auto-detected once)
 *  sound   : boolean                         (always false until the visitor opts in)
 *  motion  : 'system' | 'reduce' | 'full'    ('system' follows prefers-reduced-motion)
 *  introSeen : boolean                       (cinematic intro plays once)
 */
const KEY = 'creative-dimension:settings:v1';
const listeners = new Set();
const motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

const DEFAULTS = Object.freeze({ quality: null, sound: false, motion: 'system', introSeen: false });

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}

let state = read();

/**
 * Conservative first-visit profile. Never auto-selects "high": the visitor can opt in.
 * Weak GPUs (software renderers), phones, low memory or data-saver → lite.
 */
export function detectQuality(gpuRenderer = '') {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const saveData = nav.connection && nav.connection.saveData;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const small = typeof innerWidth === 'number' && Math.min(innerWidth, innerHeight) < 600;
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gpuRenderer);
  if (software || saveData || memory <= 2 || cores <= 2) return 'lite';
  if (coarse || small || memory < 4 || cores < 6) return 'lite';
  return 'balanced';
}

export function get(key) {
  if (key === 'quality') return state.quality || detectQuality();
  return state[key];
}

export function isQualityAuto() { return !state.quality; }

export function set(key, value) {
  if (state[key] === value) return;
  state = { ...state, [key]: value };
  write(state);
  applyToDocument();
  listeners.forEach((fn) => fn(key, value, state));
}

export function reset() {
  const introSeen = state.introSeen;
  state = { ...DEFAULTS, introSeen };
  write(state);
  applyToDocument();
  listeners.forEach((fn) => fn('*', null, state));
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function systemPrefersReducedMotion() {
  return !!(motionQuery && motionQuery.matches);
}

export function reducedMotion() {
  if (state.motion === 'reduce') return true;
  if (state.motion === 'full') return false;
  return systemPrefersReducedMotion();
}

/** Mirror settings onto <html> so CSS can react without JS logic. */
export function applyToDocument() {
  const root = document.documentElement;
  root.dataset.quality = get('quality');
  root.dataset.motion = reducedMotion() ? 'reduce' : 'full';
  root.dataset.sound = state.sound ? 'on' : 'off';
}

if (motionQuery && motionQuery.addEventListener) {
  motionQuery.addEventListener('change', () => {
    applyToDocument();
    listeners.forEach((fn) => fn('motion', state.motion, state));
  });
}

export const QUALITY_LABELS = { lite: 'Lite', balanced: 'Balanced', high: 'High' };
