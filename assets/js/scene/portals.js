/**
 * The three creative portals. Each arch frames a living "window" that blends a
 * real artwork from the portfolio with a shimmering nebula. Hover/focus raises the
 * light, opening floods the window — states are driven from the accessible HTML links.
 */
import * as THREE from 'three';
import { archShape, buildPortalFrame } from './architecture.js';

const portalVertex = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

const portalFragment = /* glsl */`
  uniform sampler2D uMap; uniform float uImgAspect; uniform float uPlaneAspect;
  uniform float uTime; uniform float uHover; uniform float uOpen; uniform float uReveal;
  uniform vec3 uTintA; uniform vec3 uTintB;
  varying vec2 vUv;
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
  float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.1; a*=.5; } return v; }
  void main(){
    // cover-fit the artwork into the arch, top-aligned so faces/titles stay visible
    vec2 uv = vUv;
    float r = uPlaneAspect / uImgAspect;
    vec2 cuv = uv;
    if (r > 1.) { cuv.y = (uv.y - 1.) / r + 1.; } else { cuv.x = (uv.x - .5) * r + .5; }
    vec2 swirl = vec2(fbm(uv * 3. + uTime * .05), fbm(uv * 3. - uTime * .04)) - .5;
    cuv += swirl * 0.012 * (1. - uHover);
    vec3 art = texture2D(uMap, cuv).rgb;
    float n = fbm(uv * vec2(2.5, 4.) + vec2(0., uTime * .03));
    vec3 neb = mix(uTintA, uTintB, smoothstep(.2, .9, uv.y + n * .35));
    neb += vec3(1., .55, .8) * pow(n, 3.) * .5;
    float artMix = mix(.42, .9, uHover) * uReveal;
    vec3 col = mix(neb, art * mix(.55, 1.05, uHover), artMix);
    col = mix(col, col * vec3(.92, .78, 1.), .25);           // plum grade
    float edge = smoothstep(.0, .14, uv.x) * smoothstep(1., .86, uv.x) * smoothstep(0., .1, uv.y);
    col *= mix(.55, 1., edge);
    col += vec3(1., .5, .78) * (1. - edge) * (.25 + .5 * uHover);  // inner rim light
    float sparkle = step(.996, hash(floor(uv * 90.) + floor(uTime * 2.))) * (.4 + uHover);
    col += vec3(1., .85, .95) * sparkle;
    col = mix(col, vec3(1.6, 1.05, 1.35), uOpen);              // portal flare on activation
    gl_FragColor = vec4(col, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export function buildPortals(mats, { textures, spacing = 3.7, tints }) {
  const group = new THREE.Group();
  const items = textures.map((tex, i) => {
    const frame = buildPortalFrame(mats);
    const { innerW, innerH, baseY } = frame;
    const geo = new THREE.ShapeGeometry(archShape(innerW, innerH), 48);
    // ShapeGeometry UVs are in shape units; normalise to 0..1.
    const uv = geo.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) / innerW + 0.5, uv.getY(k) / innerH);
    const img = tex.image;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: tex },
        uImgAspect: { value: img ? img.width / img.height : 1 },
        uPlaneAspect: { value: innerW / innerH },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uOpen: { value: 0 },
        uReveal: { value: 1 },
        uTintA: { value: new THREE.Color(tints[i][0]) },
        uTintB: { value: new THREE.Color(tints[i][1]) },
      },
      vertexShader: portalVertex,
      fragmentShader: portalFragment,
    });
    const surface = new THREE.Mesh(geo, material);
    surface.position.set(0, baseY, -0.02);
    frame.group.add(surface);

    const light = new THREE.PointLight('#ff8cc6', 8, 9, 2);
    light.position.set(0, baseY + 2.2, 1.4);
    frame.group.add(light);

    frame.group.position.x = (i - 1) * spacing;
    frame.group.rotation.y = (1 - i) * 0.08; // gentle fan toward the viewer
    group.add(frame.group);
    return {
      group: frame.group, surface, material, light, trim: frame.trim,
      hover: 0, targetHover: 0, open: 0,
      // corners of the doorway, for projecting the HTML hotspot
      corners: [new THREE.Vector3(-innerW / 2 - 0.3, baseY - 0.4, 0), new THREE.Vector3(innerW / 2 + 0.3, baseY + innerH + 0.35, 0)],
    };
  });

  function update(dt, t) {
    items.forEach((p) => {
      p.hover += (p.targetHover - p.hover) * Math.min(1, dt * 6);
      p.material.uniforms.uTime.value = t;
      p.material.uniforms.uHover.value = p.hover;
      p.material.uniforms.uOpen.value = p.open;
      p.light.intensity = 8 + p.hover * 22 + p.open * 40;
      p.trim.material.color.setRGB(3.2 + p.hover * 2.5, 1.0 + p.hover * 0.8, 2.0 + p.hover * 1.2);
    });
  }
  return { group, items, update };
}
