/**
 * Atmosphere: dusk sky dome (gradient, clouds, twinkling stars), layered misty
 * mountain ridges, a distant floating island, volumetric-style light shafts and
 * drifting light motes. All shader-based and cheap.
 */
import * as THREE from 'three';
import { glowSprite } from './textures.js';

const NOISE_GLSL = /* glsl */`
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=.5; } return v; }
`;

export function buildSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: { value: 0 }, uIntro: { value: 1 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uIntro; varying vec3 vDir;
      ${NOISE_GLSL}
      void main(){
        float h = vDir.y;
        vec3 zenith = vec3(0.045, 0.018, 0.07);
        vec3 mid = vec3(0.16, 0.05, 0.2);
        vec3 horizon = vec3(0.55, 0.2, 0.46);
        vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.28, h));
        col = mix(col, zenith, smoothstep(0.25, 0.85, h));
        // warm magenta glow behind the moon gate
        vec3 sunDir = normalize(vec3(-0.25, 0.08, -1.0));
        float g = max(dot(vDir, sunDir), 0.);
        col += vec3(0.95, 0.35, 0.62) * pow(g, 18.) * 0.9 + vec3(0.6, 0.2, 0.5) * pow(g, 4.) * 0.25;
        // soft cloud bands
        vec2 uv = vec2(atan(vDir.x, vDir.z) * 1.4, h * 7.);
        float c = fbm(uv * vec2(1.2, 1.8) + vec2(uTime * 0.004, 0.));
        float band = smoothstep(0.02, 0.18, h) * (1. - smoothstep(0.32, 0.55, h));
        col = mix(col, vec3(0.78, 0.48, 0.82), smoothstep(0.52, 0.78, c) * band * 0.35);
        // stars
        vec2 sp = vec2(atan(vDir.x, vDir.z), asin(clamp(h, -1., 1.))) * 160.;
        float s = hash(floor(sp));
        float star = step(0.9965, s) * smoothstep(0.12, 0.5, h);
        star *= 0.55 + 0.45 * sin(uTime * (1.5 + s * 4.) + s * 40.);
        col += vec3(1., 0.9, 0.97) * star * 0.9;
        col *= uIntro;
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(180, 48, 24), mat);
  mesh.renderOrder = -10;
  return mesh;
}

/** Layered ridgelines: each a large plane with a procedural silhouette, fogged by depth. */
export function buildMountains() {
  const group = new THREE.Group();
  const layers = [
    { z: -70, y: 0, w: 260, h: 34, color: '#5a2a66', seed: 1.3, alpha: 0.85, scale: 2.2 },
    { z: -95, y: 0, w: 320, h: 48, color: '#3e1a4c', seed: 4.1, alpha: 0.9, scale: 1.6 },
    { z: -125, y: 0, w: 380, h: 62, color: '#2a1036', seed: 7.7, alpha: 0.95, scale: 1.2 },
  ];
  layers.forEach((L) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: false,
      uniforms: { uColor: { value: new THREE.Color(L.color) }, uSeed: { value: L.seed }, uAlpha: { value: L.alpha }, uScale: { value: L.scale } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uSeed; uniform float uAlpha; uniform float uScale; varying vec2 vUv;
        ${NOISE_GLSL}
        void main(){
          float ridge = 0.18 + fbm(vec2(vUv.x * 6. * uScale + uSeed, uSeed)) * 0.55;
          ridge += pow(abs(sin(vUv.x * 9. + uSeed)), 6.) * 0.12;
          float a = smoothstep(ridge + 0.004, ridge - 0.004, vUv.y);
          vec3 col = mix(uColor * 1.35, uColor * 0.7, smoothstep(0., ridge, vUv.y));
          float haze = smoothstep(0.0, 0.35, vUv.y);
          col = mix(col, vec3(0.42, 0.17, 0.4), (1. - haze) * 0.4);
          gl_FragColor = vec4(col, a * uAlpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(L.w, L.h), mat);
    mesh.position.set(0, L.y + L.h / 2 - 3, L.z);
    mesh.renderOrder = -9;
    group.add(mesh);
  });
  return group;
}

/** Distant floating island with tiny glowing towers (seen through the moon gate). */
export function buildFloatingIsland(mats) {
  const group = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: '#4a2a58', roughness: 0.95, flatShading: true, emissive: '#2c1238', emissiveIntensity: 0.6 });
  const cone = new THREE.ConeGeometry(5, 7, 9, 4);
  const pos = cone.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = 1 + Math.sin(i * 12.9898) * 0.12;
    pos.setX(i, pos.getX(i) * k);
    pos.setZ(i, pos.getZ(i) * k);
    if (y < -3) pos.setY(i, y - Math.abs(Math.sin(i)) * 0.8);
  }
  cone.computeVertexNormals();
  const base = new THREE.Mesh(cone, rock);
  base.rotation.x = Math.PI;
  group.add(base);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 4.8, 0.8, 12), rock);
  top.position.y = 3.8;
  group.add(top);
  const tower = new THREE.MeshStandardMaterial({ color: '#4a2a58', roughness: 0.7 });
  [[0, 2.6, 0.8], [-1.6, 1.8, 0.6], [1.7, 2, 0.55], [0.6, 1.4, 0.45]].forEach(([x, h, r]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, h * 2, 8), tower);
    t.position.set(x, 4.2 + h, (x * 0.3));
    group.add(t);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.05, h * 0.9, 8), tower);
    roof.position.set(x, 4.2 + h * 2 + h * 0.45, x * 0.3);
    group.add(roof);
    const win = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.glowWarm);
    win.position.set(x, 4.2 + h * 1.4, x * 0.3 + r * 0.85);
    group.add(win);
  });
  return group;
}

/** Additive light cones — read as soft volumetric shafts in the fog. */
export function buildLightShaft({ top = 9, radiusTop = 0.4, radiusBottom = 2.2, color = '#ff9fcf', strength = 0.16 } = {}) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, top, 32, 1, true);
  geo.translate(0, top / 2, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength }, uTop: { value: top }, uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying float vY; varying vec3 vN; varying vec3 vView;
      void main(){ vY = position.y; vec4 wp = modelMatrix * vec4(position,1.);
        vN = normalize(normalMatrix * normal); vView = normalize((viewMatrix * wp).xyz);
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uStrength; uniform float uTop; uniform float uTime;
      varying float vY; varying vec3 vN; varying vec3 vView;
      void main(){
        float fres = pow(1. - abs(dot(vN, -vView)), 1.5);
        float edge = 1. - fres;
        float fade = smoothstep(0., 0.25, vY / uTop) * (1. - smoothstep(0.55, 1., vY / uTop));
        float flicker = 0.85 + 0.15 * sin(uTime * 0.8 + vY);
        gl_FragColor = vec4(uColor * edge * fade * uStrength * flicker, 1.);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 5;
  return mesh;
}

/** Drifting motes of light (Points). Count follows the quality profile via drawRange. */
export function buildMotes(max, bounds) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3);
  const seed = new Float32Array(max);
  for (let i = 0; i < max; i++) {
    pos[i * 3] = bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x);
    pos[i * 3 + 1] = bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y);
    pos[i * 3 + 2] = bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z);
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uMap: { value: glowSprite() }, uPixel: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float aSeed; uniform float uTime; uniform float uPixel; varying float vA;
      void main(){
        vec3 p = position;
        p.y += mod(uTime * (0.12 + aSeed * 0.18) + aSeed * 9., 9.) - 1.;
        p.x += sin(uTime * 0.3 + aSeed * 20.) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_PointSize = (6. + aSeed * 10.) * uPixel * (8. / -mv.z);
        vA = 0.35 + 0.65 * abs(sin(uTime * (0.6 + aSeed) + aSeed * 30.));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; varying float vA;
      void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(1.,0.72,0.86) * t.rgb * 1.6, t.a * vA); }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}
