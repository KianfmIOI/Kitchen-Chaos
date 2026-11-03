import * as THREE from "three";

export function createLights(scene, config, showHelpers = false) {
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff,
    0x334155,
    config.hemisphereIntensity,
  );

  const sun = new THREE.DirectionalLight(0xffffff, config.directionalIntensity);

  sun.position.set(-8, 15, 10);
  sun.castShadow = true;

  sun.shadow.mapSize.set(config.shadowMapSize, config.shadowMapSize);

  const extent = config.shadowExtent;
  const shadowCamera = sun.shadow.camera;

  shadowCamera.left = -extent;
  shadowCamera.right = extent;
  shadowCamera.top = extent;
  shadowCamera.bottom = -extent;
  shadowCamera.near = 0.5;
  shadowCamera.far = 50;

  shadowCamera.updateProjectionMatrix();

  scene.add(hemisphereLight, sun);

  // Optional debugging helpers
  if (showHelpers) {
    const sunHelper = new THREE.DirectionalLightHelper(sun, 3);
    const shadowHelper = new THREE.CameraHelper(shadowCamera);
    const hemisphereHelper = new THREE.HemisphereLightHelper(
      hemisphereLight,
      5,
    );

    scene.add(sunHelper, shadowHelper, hemisphereHelper);
  }

  return { hemisphereLight, sun };
}
