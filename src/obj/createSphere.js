import * as THREE from "three";

export function createSphere(config = {}) {
  const {
    radius = 1,
    color = 0x3399ff,
    roughness = 0.35,
    metalness = 0.2,
    position = [0, radius, 0],
  } = config;

  const geometry = new THREE.SphereGeometry(radius, 48, 48);

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });

  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(...position);
  sphere.castShadow = true;
  sphere.name = "Player";

  return sphere;
}
