import * as THREE from "three";

export function createCamera(config) {
  const camera = new THREE.PerspectiveCamera(
    config.fov,
    window.innerWidth / window.innerHeight,
    config.near,
    config.far,
  );
  camera.position.set(...config.position);
  camera.lookAt(0, 0, 0);
  return camera;
}
