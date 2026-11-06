/**
 * Rendering profiles. Each option changes real GPU work (UI UX Pro Max threejs stack:
 * cap pixel ratio at 2, selective shadow casting, pause when hidden).
 * Bloom values are a documented fallback: the skill database had no bloom guidance.
 */
export const PROFILES = {
  lite: {
    pixelRatioCap: 1,
    shadows: false,
    shadowMapSize: 512,
    reflector: false,          // glossy env-mapped floor instead of a mirror pass
    reflectorScale: 0,
    bloom: false,
    bloomStrength: 0,
    petals: 140,
    flowers: 900,
    foliage: 0.55,
    motes: 120,
    lanternLights: false,
    lightShafts: false,
    fogDensity: 0.03,
  },
  balanced: {
    pixelRatioCap: 1.5,
    shadows: true,
    shadowMapSize: 1024,
    reflector: true,
    reflectorScale: 0.5,
    bloom: true,
    bloomStrength: 0.38,
    petals: 420,
    flowers: 2400,
    foliage: 0.85,
    motes: 320,
    lanternLights: false,
    lightShafts: true,
    fogDensity: 0.026,
  },
  high: {
    pixelRatioCap: 2,
    shadows: true,
    shadowMapSize: 2048,
    reflector: true,
    reflectorScale: 1,
    bloom: true,
    bloomStrength: 0.5,
    petals: 900,
    flowers: 5000,
    foliage: 1,
    motes: 700,
    lanternLights: true,
    lightShafts: true,
    fogDensity: 0.024,
  },
};

export const MAX = {
  petals: PROFILES.high.petals,
  flowers: PROFILES.high.flowers,
  motes: PROFILES.high.motes,
};
