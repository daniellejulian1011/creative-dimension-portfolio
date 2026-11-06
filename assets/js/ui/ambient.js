/**
 * Lightweight 2D atmosphere for content pages: drifting blossom petals + soft motes.
 * Quality profile sets the particle count; reduced motion renders nothing; the loop
 * pauses whenever the tab is hidden (no unnecessary rendering).
 */
import * as settings from '../core/settings.js';

const COUNTS = { lite: 10, balanced: 26, high: 48 };

export function initAmbient() {
  const canvas = document.querySelector('[data-ambient]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, petals = [], raf = 0, last = 0;

  const spawn = (initial) => ({
    x: Math.random() * w,
    y: initial ? Math.random() * h : -20,
    s: 5 + Math.random() * 7,
    vx: 8 + Math.random() * 16,
    vy: 18 + Math.random() * 22,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 1.6,
    sway: Math.random() * Math.PI * 2,
    hue: Math.random(),
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, settings.get('quality') === 'high' ? 2 : 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function populate() {
    const n = settings.reducedMotion() ? 0 : COUNTS[settings.get('quality')];
    petals = Array.from({ length: n }, () => spawn(true));
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.sway)));
    const g = ctx.createLinearGradient(-p.s, -p.s, p.s, p.s);
    g.addColorStop(0, p.hue > 0.5 ? 'rgba(255,214,232,0.85)' : 'rgba(247,180,212,0.8)');
    g.addColorStop(1, 'rgba(234,71,139,0.75)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s, -p.s * 0.6, p.s * 0.8, p.s * 0.7, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.7, -p.s, -p.s * 0.6, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (const p of petals) {
      p.sway += dt * 1.4;
      p.x += (p.vx + Math.sin(p.sway) * 18) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > h + 20 || p.x > w + 30) Object.assign(p, spawn(false), { x: Math.random() * w * 0.9 - 30 });
      draw(p);
    }
    raf = requestAnimationFrame(frame);
  }

  function run() {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, w, h);
    if (!petals.length || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  resize(); populate(); run();
  window.addEventListener('resize', () => { resize(); run(); });
  document.addEventListener('visibilitychange', run);
  settings.onChange((key) => {
    if (['quality', 'motion', '*'].includes(key)) { resize(); populate(); run(); }
  });
}
