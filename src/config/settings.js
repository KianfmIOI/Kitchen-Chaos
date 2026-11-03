export const settings = {
  scene: {
    background: 0x0b0628,
  },

  camera: {
    fov: 30,
    near: 0.1,
    far: 1000,
    position: [0, 30, 30],
    target: [0, 1, 0],
  },

  renderer: {
    antialias: true,
    maxPixelRatio: 2,
    shadows: true,
  },

  ground: {
    size: 200,
    divisions: 50,
    color: 0x182235,
  },

  player: {
    radius: 1,
    color: 0x3399ff,
    roughness: 0.35,
    metalness: 0.2,
    speed: 20,
    position: [0, 1, 0],
  },

  lighting: {
    hemisphereIntensity: 1.2,
    directionalIntensity: 2.5,
    shadowMapSize: 2048,
    shadowExtent: 20,
  },
};
