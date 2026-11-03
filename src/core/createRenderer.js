import * as THREE from "three";

export function createRenderer(canvas, config) {
  if (!canvas) {
    throw new Error("Canvas element #bg was not found");
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: config.antialias,
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, config.maxPixelRatio),
  );

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  renderer.shadowMap.enabled = config.shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  return renderer;
}
