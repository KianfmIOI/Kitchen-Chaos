// to maintain variables easier
export const settings = {
  scene: {
    background: 0x0b0628,
  },

  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [0, 15, 10],
    target: [0, 1, 0],
  },

  renderer: {
    antialias: true,
    maxPixelRatio: 2,
    shadows: true,
  },

  ground: {
    size: 50,
    divisions: 50,
    color: 0x8292b0,
  },

  player: {
    position: [0, 0, 0],

    speed: 15,
    rotationSpeed: 15,

    bodyRadius: 1,
    headRadius: 0.55,
    movementRadius: 0.8,

    bodyColor: "#3399ff",
    headColor: "#8fcaff",

    roughness: 0.35,
    metalness: 0.2,

    animation: {
      bobbing: true,

      idleAmplitude: 0.1,
      idleFrequency: 2.5,

      moveAmplitude: 0.15,
      moveFrequency: 15,
    },
  },

  lighting: {
    hemisphereIntensity: 1.2,
    directionalIntensity: 2.5,
    shadowMapSize: 2048,
    shadowExtent: 20,
  },

  // testing modular interaction system
  interaction: {
    pickUpRange: 2,
    holdDistance: 1.5,
    holdHeight: 2,
  },

  //movement area
  movementArea: {
    min: { x: -8, y: 1, z: -6 },
    max: { x: 8, y: 3, z: 6 },
    color: 0x00ff00,
    visible: true,
  },
  heartEffect: {
    key: "KeyL",

    width: 3,
    height: 3,

    spawnHeight: 6,

    riseHeight: 2,
    duration: 1.2,

    enabled: true,
  },
};
