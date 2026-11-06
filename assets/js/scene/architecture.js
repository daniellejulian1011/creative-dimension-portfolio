/**
 * Architecture: arched portal frames, the moon-gate entrance, stepped plinths,
 * a curved colonnade with a lit architrave, lanterns, and the reflective court.
 */
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { marbleTiles, stone, flutingNormal } from './textures.js';

const ROSE_GOLD = new THREE.Color('#e6a98d');

export function makeMaterials(quality) {
  const metal = new THREE.MeshPhysicalMaterial({
    color: ROSE_GOLD, metalness: 1, roughness: 0.32, clearcoat: 0.25, clearcoatRoughness: 0.35, envMapIntensity: 0.85,
  });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#7d4a5a', metalness: 0.9, roughness: 0.38 });
  const stoneTex = stone({ size: quality === 'lite' ? 256 : 512 });
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.62, metalness: 0.02, color: '#d9c4d6' });
  const columnTex = stone({ size: 256, seed: 11, tint: [0.4, 0.31, 0.4] });
  columnTex.repeat.set(2, 3);
  const columnMat = new THREE.MeshStandardMaterial({
    map: columnTex, normalMap: flutingNormal(), normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.55, color: '#cdb6cc',
  });
  const glowPink = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.0, 2.0), toneMapped: true });
  const glowWarm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 1.9, 1.25) });
  return { metal, darkMetal, stoneMat, columnMat, glowPink, glowWarm };
}

/** Arch outline: rectangle body + semicircular head. Origin at bottom-centre. */
export function archShape(width, height, segments = 48) {
  const r = width / 2;
  const straight = height - r;
  const s = new THREE.Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, straight);
  s.absarc(0, straight, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.lineTo(-r, 0);
  return s;
}

export function archCurve(width, height, y0 = 0) {
  const r = width / 2;
  const straight = height - r;
  const path = new THREE.CurvePath();
  path.add(new THREE.LineCurve3(new THREE.Vector3(-r, y0, 0), new THREE.Vector3(-r, y0 + straight, 0)));
  const arc = new THREE.EllipseCurve(0, y0 + straight, r, r, Math.PI, 0, true);
  path.add(new THREE.CatmullRomCurve3(arc.getPoints(40).map((p) => new THREE.Vector3(p.x, p.y, 0))));
  path.add(new THREE.LineCurve3(new THREE.Vector3(r, y0 + straight, 0), new THREE.Vector3(r, y0, 0)));
  return path;
}

/** One portal frame: extruded metal arch, glowing inner trim, warm bulbs, stepped plinth. */
export function buildPortalFrame(mats, { innerW = 2.3, innerH = 3.9, frame = 0.32, depth = 0.42 } = {}) {
  const group = new THREE.Group();
  const outer = archShape(innerW + frame * 2, innerH + frame);
  outer.holes.push(archShape(innerW, innerH));
  const frameGeo = new THREE.ExtrudeGeometry(outer, {
    depth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 40,
  });
  frameGeo.translate(0, 0, -depth / 2);
  const frameMesh = new THREE.Mesh(frameGeo, mats.metal);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  // Glowing inner trim (blooms on Balanced/High).
  const trim = new THREE.Mesh(new THREE.TubeGeometry(archCurve(innerW - 0.02, innerH - 0.01), 160, 0.03, 8, false), mats.glowPink.clone());
  trim.position.z = depth / 2 + 0.02;
  group.add(trim);

  // Bulbs along the outer edge.
  const bulbCurve = archCurve(innerW + frame * 2 + 0.06, innerH + frame + 0.03);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 10, 8), mats.glowWarm, 34);
  const m = new THREE.Matrix4();
  for (let i = 0; i < bulbs.count; i++) {
    const p = bulbCurve.getPointAt(0.02 + (i / (bulbs.count - 1)) * 0.96);
    m.makeTranslation(p.x, p.y, depth / 2 + 0.02);
    bulbs.setMatrixAt(i, m);
  }
  group.add(bulbs);

  // Stepped plinth.
  const steps = new THREE.Group();
  [[innerW + 1.3, 1.9], [innerW + 0.95, 1.5], [innerW + 0.62, 1.1]].forEach(([w, d], i) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, d), mats.stoneMat);
    step.position.set(0, 0.09 + i * 0.18, 0.1 - i * 0.1);
    step.castShadow = true; step.receiveShadow = true;
    steps.add(step);
  });
  group.add(steps);
  frameMesh.position.y = 0.54;
  trim.position.y = 0.54;
  bulbs.position.y = 0.54;

  return { group, trim, frameMesh, bulbs, baseY: 0.54, innerW, innerH };
}

/** Grand circular moon gate seen in the intro. */
export function buildMoonGate(mats, { radius = 4, tube = 0.34 } = {}) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 28, 160), mats.stoneMat);
  ring.castShadow = true;
  group.add(ring);
  const band = new THREE.Mesh(new THREE.TorusGeometry(radius - tube * 0.9, 0.09, 16, 200), mats.metal);
  band.position.z = 0.12;
  group.add(band);
  const outerBand = new THREE.Mesh(new THREE.TorusGeometry(radius + tube * 0.95, 0.07, 12, 200), mats.metal);
  group.add(outerBand);
  const glow = new THREE.Mesh(new THREE.TorusGeometry(radius - tube * 1.15, 0.022, 8, 220), mats.glowPink);
  glow.position.z = 0.16;
  group.add(glow);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), mats.glowWarm, 60);
  const m = new THREE.Matrix4();
  for (let i = 0; i < bulbs.count; i++) {
    const a = (i / bulbs.count) * Math.PI * 2;
    m.makeTranslation(Math.cos(a) * (radius + tube * 0.95), Math.sin(a) * (radius + tube * 0.95), 0.12);
    bulbs.setMatrixAt(i, m);
  }
  group.add(bulbs);
  // Plinth the ring sits in.
  const base = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.3, 0.5, 1.6), mats.stoneMat);
  base.position.y = -radius + 0.25;
  base.receiveShadow = true;
  group.add(base);
  return group; // origin = ring centre
}

/** Curved colonnade behind the portals with an architrave of lights. */
export function buildColonnade(mats, { center = new THREE.Vector3(2.4, 0, -6), radius = 12, from = 1.18 * Math.PI, to = 1.82 * Math.PI, count = 9, height = 7 } = {}) {
  const group = new THREE.Group();
  const profile = [
    [0.62, 0], [0.62, 0.22], [0.52, 0.3], [0.5, 0.45], [0.42, 0.55], [0.38, 0.62],
    [0.36, height - 0.9], [0.42, height - 0.75], [0.5, height - 0.6], [0.62, height - 0.45], [0.66, height - 0.25], [0.66, height],
    [0, height],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const colGeo = new THREE.LatheGeometry(profile, 32);
  const columns = new THREE.InstancedMesh(colGeo, mats.columnMat, count);
  columns.castShadow = true;
  columns.receiveShadow = true;
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const a = from + (i / (count - 1)) * (to - from);
    m.makeTranslation(center.x + Math.cos(a) * radius, 0, center.z + Math.sin(a) * radius * 0.62);
    columns.setMatrixAt(i, m);
  }
  group.add(columns);
  // Architrave: an elliptical arc band with bulbs.
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const a = from - 0.05 + (i / 80) * (to - from + 0.1);
    pts.push(new THREE.Vector3(center.x + Math.cos(a) * radius, height + 0.25, center.z + Math.sin(a) * radius * 0.62));
  }
  const arcCurve = new THREE.CatmullRomCurve3(pts);
  const beam = new THREE.Mesh(new THREE.TubeGeometry(arcCurve, 120, 0.32, 10, false), mats.stoneMat);
  beam.castShadow = true;
  group.add(beam);
  const gold = new THREE.Mesh(new THREE.TubeGeometry(arcCurve, 120, 0.06, 6, false), mats.metal);
  gold.position.y = -0.36;
  group.add(gold);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), mats.glowWarm, 70);
  for (let i = 0; i < bulbs.count; i++) {
    const p = arcCurve.getPointAt(i / (bulbs.count - 1));
    m.makeTranslation(p.x, p.y - 0.42, p.z);
    bulbs.setMatrixAt(i, m);
  }
  group.add(bulbs);
  return group;
}

/** Glass lantern with a warm emissive core; optional real point light (High only). */
export function buildLantern(mats) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 0.95, 0.55) }));
  glass.position.y = 0.36;
  group.add(glass);
  const post = new THREE.BoxGeometry(0.04, 0.5, 0.04);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
    const p = new THREE.Mesh(post, mats.darkMetal);
    p.position.set(x * 0.16, 0.36, z * 0.16);
    group.add(p);
  });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.2, 4), mats.metal);
  cap.rotation.y = Math.PI / 4;
  cap.position.y = 0.72;
  group.add(cap);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.4), mats.darkMetal);
  foot.position.y = 0.08;
  group.add(foot);
  const light = new THREE.PointLight('#ffb27a', 3.2, 5, 2);
  light.position.y = 0.4;
  group.add(light);
  return { group, light };
}

/**
 * Courtyard floor: mirror pass (Balanced/High) under translucent marble tiles with a
 * pool cut-out; Lite swaps in an env-mapped glossy floor with no extra render pass.
 */
export function buildFloor(quality, pool = { cx: 1.2, cz: -0.6, rx: 6.2, rz: 2.8 }) {
  const size = 60;
  const group = new THREE.Group();
  const poolMask = (u, v) => {
    const x = (u - 0.5) * size, z = (v - 0.5) * size;
    const d = ((x - pool.cx) / pool.rx) ** 2 + ((z - pool.cz) / pool.rz) ** 2;
    return d < 1 ? 1 : Math.max(0, 1 - (d - 1) * 6) * 0.6;
  };
  const { map, roughnessMap } = marbleTiles({ size: quality === 'lite' ? 512 : 1024, poolMask });
  map.repeat.set(1, 1);
  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({
    map, roughnessMap, roughness: 1, metalness: 0.05, transparent: true, depthWrite: false, envMapIntensity: 0.9,
  }));
  tiles.rotation.x = -Math.PI / 2;
  tiles.position.y = 0.004;
  tiles.receiveShadow = true;
  tiles.renderOrder = 1;
  group.add(tiles);

  const mirror = new Reflector(new THREE.PlaneGeometry(size, size), {
    clipBias: 0.003,
    textureWidth: 1024,
    textureHeight: 1024,
    color: new THREE.Color('#4f3a5c'),
  });
  mirror.rotation.x = -Math.PI / 2;
  group.add(mirror);

  const gloss = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshPhysicalMaterial({
    color: '#26102f', roughness: 0.2, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.7,
  }));
  gloss.rotation.x = -Math.PI / 2;
  gloss.position.y = -0.002;
  group.add(gloss);

  function setQuality(profile, renderSize) {
    mirror.visible = profile.reflector;
    gloss.visible = !profile.reflector;
    if (profile.reflector && renderSize) {
      const w = Math.max(256, Math.round(renderSize.x * profile.reflectorScale));
      const h = Math.max(256, Math.round(renderSize.y * profile.reflectorScale));
      mirror.getRenderTarget().setSize(w, h);
    }
  }
  return { group, tiles, mirror, gloss, setQuality, pool };
}
