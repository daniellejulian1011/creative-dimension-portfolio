/**
 * The Creative Dimension — WebGL world controller.
 * Assembles the scene, owns the renderer/composer and camera rig, applies quality
 * profiles live, reports real loading progress, and pauses rendering whenever the
 * scene is hidden or scrolled away.
 */
import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PROFILES, MAX } from './quality.js';
import { makeMaterials, buildMoonGate, buildColonnade, buildLantern, buildFloor } from './architecture.js';
import { buildBlossoms, buildPetals } from './blossoms.js';
import { buildSky, buildMountains, buildFloatingIsland, buildLightShaft, buildMotes } from './atmosphere.js';
import { buildPortals } from './portals.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;

const PORTAL_X = 2.4;
const PORTAL_Z = -6;
const GATE = new THREE.Vector3(-5.6, 4, -11.5); // centre of the ring

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ quality: string, reducedMotion: boolean, assetBase: string, portalImages: string[],
 *           onProgress?: (done:number,total:number,label:string)=>void }} opts
 */
export async function createWorld(canvas, opts) {
  const profileName = opts.quality;
  let profile = PROFILES[profileName];
  let reducedMotion = opts.reducedMotion;

  // ---- Renderer (antialias decided at construction; UUPM threejs guidance) ----------
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: profileName !== 'lite', powerPreference: 'high-performance', alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = profile.shadows;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Animated 3D courtyard: a moon gate, cherry-blossom trees, and three glowing arched portals over a reflecting pool.');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#2a1236', profile.fogDensity);
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 400);

  // ---- Loading (genuine progress: env map + portal artworks) ----------------------
  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, loaded, total) => opts.onProgress?.(loaded, total, url.split('/').pop());
  const texLoader = new THREE.TextureLoader(manager);
  const exrLoader = new EXRLoader(manager);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envPromise = new Promise((resolve) => {
    exrLoader.load(`${opts.assetBase}assets/env/sunset-512.exr`, (tex) => {
      const env = pmrem.fromEquirectangular(tex).texture;
      tex.dispose();
      resolve(env);
    }, undefined, () => {
      // Network failure: fall back to a procedural studio environment.
      resolve(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    });
  });
  const portalTextures = opts.portalImages.map((src) => {
    const t = texLoader.load(src, undefined, undefined, () => console.warn('[world] artwork failed to load', src));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });

  // ---- Build the world ---------------------------------------------------------------
  const mats = makeMaterials(profileName);
  const sky = buildSky();
  scene.add(sky);
  scene.add(buildMountains());
  const island = buildFloatingIsland(mats);
  island.position.set(-7.5, 9, -58);
  island.scale.setScalar(1.3);
  scene.add(island);

  const floor = buildFloor(profileName);
  scene.add(floor.group);

  const gate = buildMoonGate(mats);
  gate.position.copy(GATE);
  gate.rotation.y = 0.12;
  scene.add(gate);

  const colonnade = buildColonnade(mats, { center: new THREE.Vector3(PORTAL_X, 0, PORTAL_Z), from: 1.42 * Math.PI, to: 1.95 * Math.PI, count: 8 });
  scene.add(colonnade);

  const portals = buildPortals(mats, {
    textures: portalTextures,
    tints: [['#3a1648', '#b83a7d'], ['#2b103a', '#7b5ad6'], ['#3a1648', '#e06aa0']],
  });
  portals.group.position.set(PORTAL_X, 0, PORTAL_Z);
  scene.add(portals.group);

  const lanterns = [];
  // Between and beside the portal plinths, then flanking the moon gate.
  [[PORTAL_X - 1.85, -4.5], [PORTAL_X + 1.85, -4.5], [PORTAL_X - 5.55, -4.5], [PORTAL_X + 5.55, -4.5], [GATE.x - 3.4, GATE.z + 1.6], [GATE.x + 3.4, GATE.z + 1.6]].forEach(([x, z]) => {
    const l = buildLantern(mats);
    l.group.position.set(x, 0, z);
    l.group.scale.setScalar(1.1);
    scene.add(l.group);
    lanterns.push(l);
  });

  const blossoms = buildBlossoms({
    maxFlowers: MAX.flowers,
    trees: [
      // Frames the moon gate (intro shot) and the left edge of the courtyard.
      { seed: 11, height: 7.5, lean: new THREE.Vector3(0.22, 1, 0.05), depth: 4, trunkRadius: 0.38, position: new THREE.Vector3(-13.2, 0, -11.5), scale: 1.15 },
      { seed: 37, height: 6, lean: new THREE.Vector3(-0.1, 1, 0.1), depth: 4, trunkRadius: 0.3, position: new THREE.Vector3(1.8, 0, -14.2), scale: 1 },
      // Courtyard: right side and foreground left (frames the hero copy).
      { seed: 23, height: 6.5, lean: new THREE.Vector3(-0.5, 1, 0.2), depth: 4, trunkRadius: 0.34, position: new THREE.Vector3(10.6, 0, -8.5), scale: 1.1 },
      { seed: 51, height: 6.8, lean: new THREE.Vector3(0.6, 1, -0.3), depth: 4, trunkRadius: 0.34, position: new THREE.Vector3(-8.2, 0, 1.5), scale: 1.05 },
      { seed: 64, height: 4.4, lean: new THREE.Vector3(-0.4, 1, 0.1), depth: 3, trunkRadius: 0.22, position: new THREE.Vector3(8, 0, -3.8), scale: 0.8 },
    ],
  });
  scene.add(blossoms.group);

  const bounds = new THREE.Box3(new THREE.Vector3(-14, 0, -16), new THREE.Vector3(16, 11, 7));
  const petals = buildPetals({ max: MAX.petals, bounds, pool: floor.pool });
  scene.add(petals.mesh, petals.floating);
  const motes = buildMotes(MAX.motes, bounds);
  scene.add(motes);

  const shafts = [];
  [[PORTAL_X - 3.7, PORTAL_Z], [PORTAL_X, PORTAL_Z], [PORTAL_X + 3.7, PORTAL_Z], [GATE.x, GATE.z + 0.5]].forEach(([x, z], i) => {
    const s = buildLightShaft({ top: i === 3 ? 13 : 10, radiusBottom: i === 3 ? 4.2 : 1.9, strength: i === 3 ? 0.1 : 0.14, color: i === 1 ? '#c7a6ff' : '#ff9fcf' });
    s.position.set(x, 0, z - 0.4);
    scene.add(s);
    shafts.push(s);
  });

  // ---- Lighting (selective shadows: key light only) -------------------------------------
  const hemi = new THREE.HemisphereLight('#a56fc2', '#1a0a22', 0.9);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight('#d8c2ff', 1.6);
  moon.position.set(-12, 16, 8);
  moon.target.position.set(1, 0, -6);
  moon.castShadow = profile.shadows;
  moon.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
  Object.assign(moon.shadow.camera, { left: -16, right: 16, top: 14, bottom: -10, near: 1, far: 50 });
  moon.shadow.bias = -0.0006;
  moon.shadow.normalBias = 0.03;
  scene.add(moon, moon.target);
  const gateLight = new THREE.PointLight('#ff7ab8', 26, 14, 2);
  gateLight.position.set(GATE.x, GATE.y, GATE.z + 2.5);
  scene.add(gateLight);
  const rim = new THREE.SpotLight('#ffb38a', 18, 30, 0.6, 0.6, 1.6);
  rim.position.set(8, 9, 4);
  rim.target.position.set(PORTAL_X, 2, PORTAL_Z);
  scene.add(rim, rim.target);

  // ---- Post-processing: bloom only on glowing details (Balanced/High) -----------------------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), profile.bloomStrength, 0.45, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Camera rig -------------------------------------------------------------------------------
  const INTRO_POS = new THREE.Vector3(GATE.x, GATE.y, GATE.z + 8.6);
  const INTRO_LOOK = new THREE.Vector3(GATE.x, GATE.y, GATE.z);
  const home = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  function computeHome() {
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    if (aspect >= 1.25) {
      // Portals sit in the right half; the left half stays calm for the hero copy.
      home.pos.set(PORTAL_X - 6.8, 2.3, 7.2);
      home.look.set(PORTAL_X - 4.4, 2.6, PORTAL_Z);
      camera.fov = 48;
    } else {
      home.pos.set(PORTAL_X - 0.4, 2.6, 10.5 + (1.25 - aspect) * 6);
      home.look.set(PORTAL_X, 2.6, PORTAL_Z);
      camera.fov = 56;
    }
    camera.updateProjectionMatrix();
  }
  computeHome();
  const rig = {
    pos: INTRO_POS.clone(), look: INTRO_LOOK.clone(),
    from: null, to: null, t: 1, duration: 1, mode: 'intro',
    parallax: new THREE.Vector2(), parallaxTarget: new THREE.Vector2(),
    explore: new THREE.Vector3(), exploreVel: new THREE.Vector3(), keys: new Set(),
    openTarget: null,
  };
  camera.position.copy(rig.pos);
  camera.lookAt(rig.look);
  let introLight = 0.35; // lights + sky dimmed during the intro, raised on reveal

  function flyTo(pos, look, duration, mode) {
    rig.from = { pos: rig.pos.clone(), look: rig.look.clone() };
    rig.to = { pos: pos.clone(), look: look.clone() };
    rig.t = 0;
    rig.start = performance.now();
    rig.duration = duration;
    rig.mode = mode;
  }

  // ---- Quality ---------------------------------------------------------------------------------
  const size = new THREE.Vector2();
  function applyQuality(name) {
    profile = PROFILES[name];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap));
    renderer.getDrawingBufferSize(size);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(canvas.clientWidth, canvas.clientHeight);
    if (renderer.shadowMap.enabled !== profile.shadows) {
      renderer.shadowMap.enabled = profile.shadows;
      scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });
    }
    moon.castShadow = profile.shadows;
    if (moon.shadow.map && moon.shadow.mapSize.x !== profile.shadowMapSize) {
      moon.shadow.map.dispose();
      moon.shadow.map = null;
    }
    moon.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize);
    floor.setQuality(profile, size);
    bloom.enabled = profile.bloom;
    bloom.strength = profile.bloomStrength;
    petals.mesh.count = profile.petals;
    blossoms.flowers.count = profile.flowers;
    blossoms.cards.count = Math.round(blossoms.maxCards * profile.foliage);
    motes.geometry.setDrawRange(0, profile.motes);
    motes.material.uniforms.uPixel.value = renderer.getPixelRatio();
    lanterns.forEach((l, i) => { l.light.visible = profile.lanternLights || i < 2; });
    shafts.forEach((s) => { s.visible = profile.lightShafts; });
    scene.fog.density = profile.fogDensity;
  }
  applyQuality(profileName);

  // ---- Interaction ---------------------------------------------------------------------------
  const onPointer = (e) => {
    rig.parallaxTarget.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  const EXPLORE_KEYS = new Set(['w', 'a', 's', 'd']);
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.querySelector('dialog[open]')) return;
    const k = e.key.toLowerCase();
    if (EXPLORE_KEYS.has(k) && rig.mode === 'home') rig.keys.add(k);
  };
  const onKeyUp = (e) => rig.keys.delete(e.key.toLowerCase());
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => rig.keys.clear());

  // ---- Resize -----------------------------------------------------------------------------------
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    computeHome();
    if (rig.mode === 'home' && rig.t >= 1) { rig.pos.copy(home.pos); rig.look.copy(home.look); }
    renderer.getDrawingBufferSize(size);
    floor.setQuality(profile, size);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---- Frame loop (setAnimationLoop; paused when hidden/off-screen) --------------------------------
  const clock = new THREE.Clock();
  let running = false;
  let elapsed = 0;
  const tmpLook = new THREE.Vector3();
  const projected = [];

  function step() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const motionScale = reducedMotion ? 0 : 1;
    elapsed += dt * (reducedMotion ? 0.15 : 1);

    // camera flight
    if (rig.t < 1) {
      rig.t = Math.min(1, (performance.now() - rig.start) / (rig.duration * 1000)); // wall-clock: slow GPUs still arrive on time
      const k = easeInOut(rig.t);
      rig.pos.lerpVectors(rig.from.pos, rig.to.pos, k);
      rig.look.lerpVectors(rig.from.look, rig.to.look, k);
      if (rig.t >= 1 && rig.mode === 'reveal') rig.mode = 'home';
    }
    // intro → full lighting
    const lightTarget = rig.mode === 'intro' ? 0.45 : 1;
    introLight = lerp(introLight, lightTarget, Math.min(1, dt * 1.2));
    sky.material.uniforms.uIntro.value = 0.55 + introLight * 0.45;
    hemi.intensity = 0.35 + introLight * 0.55;
    rim.intensity = 18 * introLight;
    portals.items.forEach((p) => { p.material.uniforms.uReveal.value = Math.max(0.15, introLight); });

    // explore (WASD) with damping, clamped to the courtyard
    if (rig.mode === 'home') {
      const ax = (rig.keys.has('d') ? 1 : 0) - (rig.keys.has('a') ? 1 : 0);
      const az = (rig.keys.has('s') ? 1 : 0) - (rig.keys.has('w') ? 1 : 0);
      rig.exploreVel.x = lerp(rig.exploreVel.x, ax * 3, Math.min(1, dt * 5));
      rig.exploreVel.z = lerp(rig.exploreVel.z, az * 3, Math.min(1, dt * 5));
      rig.explore.addScaledVector(rig.exploreVel, dt);
      rig.explore.x = THREE.MathUtils.clamp(rig.explore.x, -3.2, 3.2);
      rig.explore.z = THREE.MathUtils.clamp(rig.explore.z, -3.5, 2.5);
    }
    rig.parallax.lerp(rig.parallaxTarget, Math.min(1, dt * 2.5));
    const px = rig.parallax.x * 0.45 * motionScale, py = rig.parallax.y * 0.22 * motionScale;
    camera.position.set(rig.pos.x + rig.explore.x + px, rig.pos.y - py, rig.pos.z + rig.explore.z);
    tmpLook.set(rig.look.x + rig.explore.x * 0.6 + px * 2.2, rig.look.y - py * 1.5, rig.look.z);
    camera.lookAt(tmpLook);

    // animated systems
    portals.update(dt, elapsed);
    if (!reducedMotion) petals.update(dt, elapsed, 0);
    motes.material.uniforms.uTime.value = elapsed;
    sky.material.uniforms.uTime.value = elapsed;
    shafts.forEach((s) => { s.material.uniforms.uTime.value = elapsed; });
    island.position.y = 9 + Math.sin(elapsed * 0.25) * 0.4 * motionScale;
    blossoms.group.children.forEach((tree, i) => { tree.rotation.z = Math.sin(elapsed * 0.6 + i) * 0.006 * motionScale; });

    if (profile.bloom) composer.render(); else renderer.render(scene, camera);
    api.onFrame?.();
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { clock.getDelta(); renderer.setAnimationLoop(step); } else renderer.setAnimationLoop(null);
  }

  // ---- Public API -------------------------------------------------------------------------------
  const api = {
    renderer, scene, camera,
    onFrame: null,
    async ready() {
      scene.environment = await envPromise;
      await new Promise((resolve) => {
        if (manager.itemsLoaded >= manager.itemsTotal && manager.itemsTotal > 0) resolve();
        else { const prev = manager.onLoad; manager.onLoad = () => { prev?.(); resolve(); }; }
      });
      portals.items.forEach((p, i) => {
        const img = portalTextures[i].image;
        if (img) p.material.uniforms.uImgAspect.value = img.width / img.height;
      });
      // Pre-compile shaders so the first visible frame does not hitch.
      if (renderer.compileAsync) await renderer.compileAsync(scene, camera); else renderer.compile(scene, camera);
      step();
    },
    start() { setRunning(true); },
    stop() { setRunning(false); },
    get running() { return running; },
    /** Cinematic reveal: from the moon gate to the courtyard of portals. */
    reveal({ instant = false } = {}) {
      computeHome();
      if (instant || reducedMotion) {
        rig.pos.copy(home.pos); rig.look.copy(home.look); rig.t = 1; rig.mode = 'home'; introLight = 1;
        return Promise.resolve();
      }
      flyTo(home.pos, home.look, 3.6, 'reveal');
      return new Promise((r) => setTimeout(r, 3600));
    },
    skipToHome() { return api.reveal({ instant: true }); },
    setHover(index, on) { portals.items.forEach((p, i) => { p.targetHover = on && i === index ? 1 : (i === index ? 0 : p.targetHover); }); },
    clearHover() { portals.items.forEach((p) => { p.targetHover = 0; }); },
    /** Portal activation: camera glides into the chosen doorway as it floods with light. */
    openPortal(index) {
      const p = portals.items[index];
      const target = new THREE.Vector3();
      p.group.getWorldPosition(target);
      const look = target.clone().setY(2.6);
      const pos = target.clone().add(new THREE.Vector3(0, 2.4, 2.2));
      p.targetHover = 1;
      if (reducedMotion) return Promise.resolve();
      flyTo(pos, look, 1.1, 'open');
      const startT = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - startT) / 1000);
        p.open = k * k;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return new Promise((r) => setTimeout(r, 1050));
    },
    /** Screen-space rectangles of each portal doorway (for accessible HTML hotspots). */
    portalRects() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      projected.length = 0;
      portals.items.forEach((p) => {
        const a = p.corners[0].clone(); const b = p.corners[1].clone();
        p.group.localToWorld(a); p.group.localToWorld(b);
        a.project(camera); b.project(camera);
        const x1 = (Math.min(a.x, b.x) * 0.5 + 0.5) * w, x2 = (Math.max(a.x, b.x) * 0.5 + 0.5) * w;
        const y1 = (1 - (Math.max(a.y, b.y) * 0.5 + 0.5)) * h, y2 = (1 - (Math.min(a.y, b.y) * 0.5 + 0.5)) * h;
        projected.push({ x: x1, y: y1, w: x2 - x1, h: y2 - y1, visible: a.z < 1 && b.z < 1 });
      });
      return projected;
    },
    setQuality: applyQuality,
    setReducedMotion(v) { reducedMotion = v; },
    resetExplore() { rig.explore.set(0, 0, 0); rig.exploreVel.set(0, 0, 0); },
    dispose() {
      setRunning(false);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material || []).forEach((m) => {
          Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
          if (m.uniforms) Object.values(m.uniforms).forEach((u) => { if (u.value && u.value.isTexture) u.value.dispose(); });
          m.dispose();
        });
      });
      scene.environment?.dispose();
      pmrem.dispose();
      composer.dispose?.();
      renderer.dispose();
    },
  };
  return api;
}
