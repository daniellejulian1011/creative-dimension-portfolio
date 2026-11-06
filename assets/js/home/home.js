/**
 * Home page orchestration: cinematic intro (with genuine load progress), WebGL
 * detection + graceful CSS fallback, accessible portal hotspots synced to the 3D
 * arches, portal opening transitions, and render-loop pausing.
 */
import * as settings from '../core/settings.js';
import { portalCue } from '../ui/sound.js';

const root = document.documentElement;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch { return false; }
}

function gpuName() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
  } catch { return ''; }
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export async function initHome() {
  const base = root.dataset.root || '';
  const intro = document.querySelector('[data-intro-overlay]');
  const bar = intro?.querySelector('.progress');
  const status = intro?.querySelector('[data-intro-status]');
  const enterBtn = intro?.querySelector('[data-intro-enter]');
  const skipBtn = intro?.querySelector('[data-intro-skip]');
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('.stage__canvas');
  const hero = document.querySelector('.hero');
  const portalLinks = [...document.querySelectorAll('.portal[data-portal-index]')];
  const hints = document.querySelector('.control-hints');
  const inertTargets = [document.querySelector('.site-header'), document.getElementById('main'), document.querySelector('.site-footer')].filter(Boolean);
  const playIntro = root.dataset.intro === 'play' && !!intro;

  // First visit: pick a conservative quality from the actual GPU (never "high").
  if (settings.isQualityAuto()) {
    const detected = settings.detectQuality(gpuName());
    if (detected !== settings.get('quality')) settings.set('quality', detected);
  }

  // ---- Intro UI helpers -------------------------------------------------------------
  let world = null;
  let introClosed = !playIntro;
  const setProgress = (done, total, label) => {
    if (!bar) return;
    const p = total ? done / total : 0;
    bar.style.setProperty('--p', p.toFixed(3));
    bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    status.textContent = p >= 1 ? 'The Creative Dimension is ready' : `Loading experience… ${Math.round(p * 100)}%${label ? ` — ${label}` : ''}`;
  };
  if (playIntro) {
    inertTargets.forEach((el) => { el.inert = true; });
    hero?.classList.add('is-waiting');
    requestAnimationFrame(() => intro.classList.add('is-revealed'));
    skipBtn?.focus({ preventScroll: true });
  }

  function closeIntro({ animated = true } = {}) {
    if (introClosed) return;
    introClosed = true;
    settings.set('introSeen', true);
    inertTargets.forEach((el) => { el.inert = false; });
    intro.classList.add('is-done');
    const finish = () => {
      root.dataset.intro = 'skip';
      hero?.classList.remove('is-waiting');
      document.getElementById('main')?.focus({ preventScroll: true });
    };
    if (animated && !settings.reducedMotion()) setTimeout(finish, 900); else finish();
  }

  // ---- Loading: count real work (fonts, scene module, env map, artworks) --------------
  const steps = { done: 0, total: 2, scene: { done: 0, total: 0 } };
  const report = (label) => setProgress(steps.done + steps.scene.done, steps.total + steps.scene.total, label);
  report('fonts');
  const fontsReady = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { steps.done += 1; report('typography'); });

  const portalImages = portalLinks.map((a) => a.dataset.portalImage);
  const useWebGL = webglAvailable();

  if (useWebGL) {
    root.classList.add('is-webgl');
    try {
      const { createWorld } = await import('../scene/world.js');
      steps.done += 1; report('3D engine');
      world = await createWorld(canvas, {
        quality: settings.get('quality'),
        reducedMotion: settings.reducedMotion(),
        assetBase: base,
        portalImages: portalImages.map((src) => base + src),
        onProgress(done, total, label) { steps.scene = { done, total }; report(label); },
      });
      if (!playIntro) world.skipToHome();
      await Promise.all([world.ready(), fontsReady]);
      canvas.classList.add('is-ready');
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); toFallback('WebGL context lost'); }, { once: true });
    } catch (err) {
      console.warn('[home] WebGL scene unavailable, using the designed fallback.', err);
      toFallback(err);
      await Promise.all(portalImages.map((src) => preloadImage(base + src)));
    }
  } else {
    toFallback('WebGL not supported');
    steps.total += portalImages.length;
    await Promise.all([fontsReady, ...portalImages.map((src) => preloadImage(base + src).then(() => { steps.done += 1; report('artwork'); }))]);
  }
  setProgress(1, 1);

  function toFallback(reason) {
    if (world) { world.dispose(); world = null; }
    root.classList.remove('is-webgl', 'has-3d-portals');
    root.classList.add('is-fallback');
    if (reason) root.dataset.fallbackReason = String(reason.message || reason);
  }

  // ---- 3D portal hotspots ------------------------------------------------------------------
  const wide = matchMedia('(min-width: 1100px) and (min-aspect-ratio: 5/4)');
  function updateHotspotMode() {
    const on = !!world && wide.matches;
    root.classList.toggle('has-3d-portals', on);
    if (!on) portalLinks.forEach((a) => a.style.removeProperty('transform'));
  }
  wide.addEventListener('change', updateHotspotMode);
  updateHotspotMode();
  const portalsWrap = document.querySelector('.portals');
  if (world) {
    world.onFrame = () => {
      if (!root.classList.contains('has-3d-portals')) return;
      const rects = world.portalRects();
      rects.forEach((r, i) => {
        const a = portalLinks[i];
        if (!a) return;
        a.style.setProperty('--x', `${r.x.toFixed(1)}px`);
        a.style.setProperty('--y', `${r.y.toFixed(1)}px`);
        a.style.setProperty('--w', `${r.w.toFixed(1)}px`);
        a.style.setProperty('--h', `${r.h.toFixed(1)}px`);
      });
    };
  }

  // Hover / focus → light the matching 3D portal (preview card is CSS).
  portalLinks.forEach((a, i) => {
    const on = () => { a.classList.add('is-active'); world?.setHover(i, true); };
    const off = () => { a.classList.remove('is-active'); world?.setHover(i, false); };
    a.addEventListener('pointerenter', on);
    a.addEventListener('pointerleave', off);
    a.addEventListener('focus', on);
    a.addEventListener('blur', off);
    a.addEventListener('click', async (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      portalCue();
      if (world && !settings.reducedMotion()) {
        portalsWrap?.classList.add('is-hidden');
        await world.openPortal(i);
        stage.classList.add('is-leaving');
        await new Promise((r) => setTimeout(r, 420));
      } else if (!settings.reducedMotion()) {
        a.animate([{ transform: getComputedStyle(a).transform }, { transform: `${getComputedStyle(a).transform === 'none' ? '' : getComputedStyle(a).transform} scale(1.04)`, opacity: 0.6 }], { duration: 260, easing: 'ease-out' });
        await new Promise((r) => setTimeout(r, 240));
      }
      window.location.href = a.href;
    });
  });

  // "Enter Experience": guide attention to the portals.
  document.querySelector('[data-enter-experience]')?.addEventListener('click', (e) => {
    e.preventDefault();
    world?.resetExplore();
    const first = portalLinks[0];
    if (!root.classList.contains('has-3d-portals')) document.getElementById('portals')?.scrollIntoView({ behavior: settings.reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    first?.focus({ preventScroll: root.classList.contains('has-3d-portals') });
    if (world && !settings.reducedMotion()) {
      portalLinks.forEach((_, i) => setTimeout(() => { world.setHover(i, true); setTimeout(() => world.setHover(i, document.activeElement === portalLinks[i]), 500); }, i * 260));
    }
  });

  // ---- Intro: reveal button once everything is really loaded ---------------------------------
  if (playIntro && !introClosed) {
    enterBtn.hidden = false;
    requestAnimationFrame(() => enterBtn.classList.add('is-visible'));
    enterBtn.focus({ preventScroll: true });
    enterBtn.addEventListener('click', async () => {
      if (world) {
        world.start();
        const flight = world.reveal();
        closeIntro();
        await flight;
      } else closeIntro();
    }, { once: true });
  }
  skipBtn?.addEventListener('click', () => {
    world?.skipToHome();
    closeIntro({ animated: false });
  });
  intro?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { world?.skipToHome(); closeIntro({ animated: false }); } });

  // ---- Settings → live scene changes ------------------------------------------------------------
  settings.onChange((key) => {
    if (!world) return;
    if (key === 'quality' || key === '*') world.setQuality(settings.get('quality'));
    if (key === 'motion' || key === '*') world.setReducedMotion(settings.reducedMotion());
  });

  // ---- Render only while visible (hero on screen + tab visible) -----------------------------------
  if (world) {
    let heroVisible = true;
    const sync = () => {
      const on = heroVisible && !document.hidden;
      if (on) world.start(); else world.stop();
      hints?.classList.toggle('is-hidden', !heroVisible);
    };
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; sync(); }, { threshold: 0.05 }).observe(hero);
    document.addEventListener('visibilitychange', sync);
    // Free GPU memory when the page is really discarded (keep it for back/forward cache).
    window.addEventListener('pagehide', (e) => { if (!e.persisted) world?.dispose(); });
    sync();
  }
}
