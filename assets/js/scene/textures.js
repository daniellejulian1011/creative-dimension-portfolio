/**
 * Procedural textures generated on a canvas at load time — original, licence-free,
 * resolution-appropriate (no low-res image stretched across large surfaces).
 */
import * as THREE from 'three';

function rand(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Value-noise helper on a small lattice, smooth-interpolated. */
function makeNoise(seed, size = 64) {
  const r = rand(seed);
  const grid = Float32Array.from({ length: size * size }, r);
  const at = (x, y) => grid[((y % size + size) % size) * size + ((x % size + size) % size)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(noise, x, y, oct = 5) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * noise(x * f, y * f); f *= 2; amp *= 0.5; }
  return v;
}

/**
 * Plum-veined marble tiles. Returns { map, roughnessMap } as CanvasTextures.
 * poolMask(u,v) → 0..1 makes tiles transparent where the reflecting pool shows through.
 */
export function marbleTiles({ size = 1024, tiles = 4, seed = 7, poolMask = null } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const rc = document.createElement('canvas');
  rc.width = rc.height = size / 2;
  const rctx = rc.getContext('2d');
  const rimg = rctx.createImageData(size / 2, size / 2);
  const noise = makeNoise(seed);
  const tile = size / tiles;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 6, ny = y / size * 6;
      const turb = fbm(noise, nx, ny, 5);
      const vein = Math.abs(Math.sin((nx * 1.3 + ny * 0.7 + turb * 4.2) * Math.PI));
      const veinLine = Math.pow(1 - vein, 14);
      const tx = x % tile, ty = y % tile;
      const grout = (tx < 2 || ty < 2) ? 1 : 0;
      const base = 0.17 + turb * 0.12;
      let r = base * 0.95 + veinLine * 0.55, g = base * 0.72 + veinLine * 0.32, b = base * 1.05 + veinLine * 0.5;
      if (grout) { r *= 0.45; g *= 0.4; b *= 0.5; }
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, r * 255);
      img.data[i + 1] = Math.min(255, g * 255);
      img.data[i + 2] = Math.min(255, b * 255);
      let a = 255;
      if (poolMask) a = Math.round(255 * (1 - poolMask(x / size, y / size)));
      img.data[i + 3] = a;
      if ((x & 1) === 0 && (y & 1) === 0) {
        const j = ((y >> 1) * (size >> 1) + (x >> 1)) * 4;
        const rough = grout ? 230 : 70 + turb * 70 - veinLine * 30;
        rimg.data[j] = rimg.data[j + 1] = rimg.data[j + 2] = rough;
        rimg.data[j + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  rctx.putImageData(rimg, 0, 0);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(rc);
  [map, roughnessMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  return { map, roughnessMap };
}

/** Smaller stone texture for steps, columns and the moon gate. */
export function stone({ size = 512, seed = 3, tint = [0.36, 0.27, 0.36] } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const noise = makeNoise(seed);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(noise, x / size * 8, y / size * 8, 5);
      const vein = Math.pow(1 - Math.abs(Math.sin((x / size * 3 + n * 3) * Math.PI)), 18) * 0.3;
      const v = 0.75 + n * 0.45 + vein;
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, tint[0] * v * 255);
      img.data[i + 1] = Math.min(255, tint[1] * v * 255);
      img.data[i + 2] = Math.min(255, tint[2] * v * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Vertical fluting normal map for columns. */
export function flutingNormal({ flutes = 16, size = 256 } = {}) {
  const c = document.createElement('canvas');
  c.width = size; c.height = 4;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, 4);
  for (let x = 0; x < size; x++) {
    const p = (x / size) * flutes * Math.PI * 2;
    const nx = Math.sin(p) * 0.55;
    for (let y = 0; y < 4; y++) {
      const i = (y * size + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = 128;
      img.data[i + 2] = Math.sqrt(1 - nx * nx) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Soft radial sprite used by motes and glints. */
export function glowSprite(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,220,236,0.65)');
  g.addColorStop(1, 'rgba(255,200,230,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Blossom “foliage card” texture: dozens of hand-drawn five-petal cherry blossoms
 * and buds on a transparent canvas. Used on crossed quads — the classic game
 * technique for lush canopies at low geometric cost.
 */
export function blossomCard(size = 512, seed = 21) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const flower = (x, y, rad, rot, tone) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let k = 0; k < 5; k++) {
      ctx.save();
      ctx.rotate((k / 5) * Math.PI * 2);
      const g = ctx.createLinearGradient(0, 0, 0, -rad);
      g.addColorStop(0, `hsl(${335 + tone * 10}, 85%, 94%)`);
      g.addColorStop(0.55, `hsl(${332 + tone * 8}, 80%, ${80 - tone * 12}%)`);
      g.addColorStop(1, `hsl(${330 + tone * 6}, 75%, ${66 - tone * 14}%)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(rad * 0.62, -rad * 0.25, rad * 0.58, -rad * 0.86, rad * 0.14, -rad);
      ctx.lineTo(0, -rad * 0.88);
      ctx.lineTo(-rad * 0.14, -rad);
      ctx.bezierCurveTo(-rad * 0.58, -rad * 0.86, -rad * 0.62, -rad * 0.25, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#c2185b';
    ctx.beginPath(); ctx.arc(0, 0, rad * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe0a3';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * rad * 0.24, Math.sin(a) * rad * 0.24, rad * 0.05, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };
  // Dense centre, thinning edges → soft silhouette.
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * size * 0.42;
    const x = size / 2 + Math.cos(a) * d, y = size / 2 + Math.sin(a) * d * 0.9;
    const rad = size * (0.045 + r() * 0.04) * (1 - (d / (size * 0.42)) * 0.35);
    flower(x, y, rad, r() * 6, r());
  }
  for (let i = 0; i < 26; i++) { // buds
    const a = r() * Math.PI * 2, d = (0.3 + r() * 0.15) * size;
    ctx.fillStyle = `hsl(${330 + r() * 10}, 70%, ${55 + r() * 15}%)`;
    ctx.beginPath(); ctx.ellipse(size / 2 + Math.cos(a) * d, size / 2 + Math.sin(a) * d, size * 0.012, size * 0.018, a, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  return t;
}
