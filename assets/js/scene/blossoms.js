/**
 * Procedural cherry-blossom trees (tapered branch skeleton + blossom clusters +
 * thousands of instanced five-petal flowers) and wind-driven falling petals.
 * Everything is generated in code — no third-party models required.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { blossomCard } from './textures.js';

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function taperedTube(curve, r0, r1, tubular = 14, radial = 7) {
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    const center = curve.getPointAt(t);
    const r = r0 + (r1 - r0) * t;
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(center).multiplyScalar(r).add(center);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

function petalShape(len = 1, wid = 0.55) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(wid, len * 0.25, wid * 0.9, len * 0.85, wid * 0.18, len);
  s.lineTo(0, len * 0.9); // the cherry-blossom notch
  s.lineTo(-wid * 0.18, len);
  s.bezierCurveTo(-wid * 0.9, len * 0.85, -wid, len * 0.25, 0, 0);
  return s;
}

/** Five-petal blossom with a soft white→pink gradient baked into vertex colours. */
function flowerGeometry() {
  const parts = [];
  const inner = new THREE.Color('#fff2f7');
  const outer = new THREE.Color('#ff7fb5');
  for (let k = 0; k < 5; k++) {
    const g = new THREE.ShapeGeometry(petalShape(1, 0.62), 6);
    g.rotateX(-0.35); // cup the petals
    g.rotateZ((k / 5) * Math.PI * 2);
    parts.push(g);
  }
  const geo = mergeGeometries(parts);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const r = Math.min(1, Math.hypot(pos.getX(i), pos.getY(i)));
    c.copy(inner).lerp(outer, r ** 1.4);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Build one tree. Returns its branch geometry and blossom cluster anchors.
 * @param {object} o seed, height, lean (Vector3), depth
 */
function growTree({ seed = 1, height = 5, lean = new THREE.Vector3(0.3, 1, 0), depth = 4, trunkRadius = 0.32 }) {
  const r = rng(seed);
  const geos = [];
  const clusters = [];
  const up = new THREE.Vector3(0, 1, 0);

  function branch(start, dir, length, radius, level) {
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    const bend = side.clone().multiplyScalar((r() - 0.5) * length * 0.35);
    const p1 = start.clone().addScaledVector(dir, length * 0.33).add(bend);
    const p2 = start.clone().addScaledVector(dir, length * 0.66).addScaledVector(bend, -0.4).add(new THREE.Vector3(0, length * 0.05, 0));
    const end = start.clone().addScaledVector(dir, length);
    const curve = new THREE.CatmullRomCurve3([start, p1, p2, end]);
    const endRadius = radius * (level === depth ? 0.25 : 0.62);
    geos.push(taperedTube(curve, radius, endRadius, level < 2 ? 16 : 8, level < 2 ? 9 : 6));
    if (level >= depth - 1) {
      clusters.push({ pos: end.clone(), size: 0.75 + r() * 0.5 });
      if (level === depth) clusters.push({ pos: curve.getPointAt(0.55), size: 0.5 + r() * 0.35 });
    }
    if (level >= depth) return;
    const kids = level === 0 ? 3 : 2 + (r() > 0.55 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const t = 0.55 + r() * 0.4;
      const origin = curve.getPointAt(t);
      const axis = new THREE.Vector3(r() - 0.5, r() * 0.3, r() - 0.5).normalize();
      const angle = 0.45 + r() * 0.5;
      const childDir = dir.clone().applyAxisAngle(axis, angle).addScaledVector(lean, 0.25);
      childDir.y = Math.max(childDir.y, level > 1 ? -0.25 : 0.1);
      childDir.normalize();
      branch(origin, childDir, length * (0.62 + r() * 0.16), radius * 0.62 * (1 - t * 0.3), level + 1);
    }
  }
  branch(new THREE.Vector3(0, -0.2, 0), lean.clone().normalize(), height * 0.48, trunkRadius, 0);
  return { geometry: mergeGeometries(geos), clusters };
}

export function buildBlossoms({ trees, maxFlowers }) {
  const group = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: '#3a2030', roughness: 0.92, metalness: 0 });
  const puffMat = new THREE.MeshStandardMaterial({
    color: '#ffffff', roughness: 0.9, metalness: 0, emissive: '#3a0b24', emissiveIntensity: 0.5, flatShading: true,
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide, roughness: 0.65, emissive: '#5c1236', emissiveIntensity: 0.55,
  });
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  const allPuffs = [];
  const allCards = [];
  const r = rng(99);
  // Puffs are the shaded interior of each clump; the flowers carry the bright colour.
  const palette = ['#7a2c55', '#6b2449', '#8a3763', '#5e1f40', '#94426d'].map((c) => new THREE.Color(c));

  trees.forEach((spec) => {
    const { geometry, clusters } = growTree(spec);
    const trunk = new THREE.Mesh(geometry, bark);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    const holder = new THREE.Group();
    holder.position.copy(spec.position);
    holder.scale.setScalar(spec.scale || 1);
    holder.add(trunk);
    const puffs = [];
    clusters.forEach((c) => {
      const n = 3 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const offset = new THREE.Vector3(r() - 0.5, (r() - 0.3) * 0.6, r() - 0.5).multiplyScalar(c.size * 0.9);
        puffs.push({ pos: c.pos.clone().add(offset), s: c.size * (0.2 + r() * 0.2) });
      }
    });
    const inst = new THREE.InstancedMesh(puffGeo, puffMat, puffs.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    puffs.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
      m.compose(p.pos, q, new THREE.Vector3(p.s, p.s * 0.78, p.s));
      inst.setMatrixAt(i, m);
      inst.setColorAt(i, palette[Math.floor(r() * palette.length)]);
      allPuffs.push({ holder, ...p });
    });
    inst.castShadow = true;
    holder.add(inst);
    group.add(holder);
    clusters.forEach((c) => allCards.push({ holder, pos: c.pos, s: c.size }));
  });

  // Foliage cards: 3 crossed blossom quads per clump give the canopy its flowery silhouette.
  const cardTex = blossomCard();
  const cardMat = new THREE.MeshStandardMaterial({
    map: cardTex, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.75,
    emissive: '#ff7ab5', emissiveMap: cardTex, emissiveIntensity: 0.07,
  });
  group.updateMatrixWorld(true);
  const PER = 4;
  const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), cardMat, allCards.length * PER);
  {
    // Shuffled so that lowering the instance count (Lite) thins every tree evenly.
    const order = [...Array(cards.count).keys()].sort(() => r() - 0.5);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let k = 0;
    allCards.forEach((p) => {
      for (let j = 0; j < PER; j++) {
        q.setFromEuler(new THREE.Euler((r() - 0.5) * 1.1, (j / PER) * Math.PI + r() * 0.4, (r() - 0.5) * 0.7));
        const world = p.pos.clone().add(new THREE.Vector3((r() - 0.5) * p.s, (r() - 0.3) * p.s * 0.6, (r() - 0.5) * p.s)).applyMatrix4(p.holder.matrixWorld);
        const s = p.s * (1.9 + r() * 0.8) * p.holder.scale.x;
        m.compose(world, q, new THREE.Vector3(s, s, s));
        cards.setMatrixAt(order[k++], m);
      }
    });
  }
  cards.castShadow = true;
  group.add(cards);

  // Flowers scattered over every puff surface (count set per quality profile).
  group.updateMatrixWorld(true);
  const flowers = new THREE.InstancedMesh(flowerGeometry(), flowerMat, maxFlowers);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < maxFlowers; i++) {
    const p = allPuffs[Math.floor(r() * allPuffs.length)];
    const dir = new THREE.Vector3(r() - 0.5, r() - 0.3, r() - 0.5).normalize();
    const local = p.pos.clone().addScaledVector(dir, p.s * (0.85 + r() * 0.4));
    const world = local.applyMatrix4(p.holder.matrixWorld);
    q.setFromUnitVectors(zAxis, dir);
    const s = (0.1 + r() * 0.09) * (p.holder.scale.x);
    m.compose(world, q, new THREE.Vector3(s, s, s));
    flowers.setMatrixAt(i, m);
  }
  group.add(flowers);
  return { group, flowers, cards, maxCards: cards.count };
}

/** Falling petals with a gentle swirling wind, plus petals floating on the pool. */
export function buildPetals({ max, bounds, pool }) {
  const geo = new THREE.ShapeGeometry(petalShape(1, 0.6), 5);
  geo.translate(0, -0.5, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: '#ffb3d3', side: THREE.DoubleSide, roughness: 0.6, emissive: '#6d1640', emissiveIntensity: 0.7,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, max);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const r = rng(5);
  const P = Array.from({ length: max }, () => ({
    p: new THREE.Vector3(
      bounds.min.x + r() * (bounds.max.x - bounds.min.x),
      bounds.min.y + r() * (bounds.max.y - bounds.min.y),
      bounds.min.z + r() * (bounds.max.z - bounds.min.z)),
    v: new THREE.Vector3(0.25 + r() * 0.35, -(0.35 + r() * 0.45), (r() - 0.5) * 0.2),
    e: new THREE.Euler(r() * 6, r() * 6, r() * 6),
    w: new THREE.Vector3((r() - 0.5) * 2.4, (r() - 0.5) * 2.4, (r() - 0.5) * 2.4),
    s: 0.06 + r() * 0.06,
    phase: r() * 10,
  }));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const scl = new THREE.Vector3();

  // Resting petals on the pool surface.
  const floatCount = 70;
  const floating = new THREE.InstancedMesh(geo, mat, floatCount);
  const F = [];
  for (let i = 0; i < floatCount; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.92;
    F.push({ x: pool.cx + Math.cos(a) * pool.rx * d, z: pool.cz + Math.sin(a) * pool.rz * d, rot: r() * 6, s: 0.08 + r() * 0.05, ph: r() * 6 });
  }

  function update(dt, t, gust = 0) {
    const n = mesh.count;
    for (let i = 0; i < n; i++) {
      const it = P[i];
      const swirl = Math.sin(t * 0.7 + it.phase) * 0.35;
      it.p.x += (it.v.x + swirl + gust) * dt;
      it.p.y += it.v.y * dt;
      it.p.z += (it.v.z + Math.cos(t * 0.5 + it.phase) * 0.18) * dt;
      it.e.x += it.w.x * dt; it.e.y += it.w.y * dt; it.e.z += it.w.z * dt;
      if (it.p.y < 0.02 || it.p.x > bounds.max.x) {
        it.p.set(bounds.min.x + r() * (bounds.max.x - bounds.min.x) * 0.85, bounds.max.y, bounds.min.z + r() * (bounds.max.z - bounds.min.z));
      }
      q.setFromEuler(it.e);
      m.compose(it.p, q, scl.setScalar(it.s));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < floatCount; i++) {
      const f = F[i];
      q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, f.rot + Math.sin(t * 0.3 + f.ph) * 0.2));
      m.compose(scl.set(f.x + Math.sin(t * 0.2 + f.ph) * 0.05, 0.012, f.z), q, new THREE.Vector3(f.s, f.s, f.s));
      floating.setMatrixAt(i, m);
    }
    floating.instanceMatrix.needsUpdate = true;
  }
  update(0, 0);
  return { mesh, floating, update };
}
