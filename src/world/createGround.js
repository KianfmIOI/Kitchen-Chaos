import * as THREE from "three";

export function createGround(config) {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: 0.85,
    metalness: 0.03,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(config.size, config.size),
    mat,
  );

  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const grid = new THREE.GridHelper(config.size, config.divisions);

  grid.position.y = 0.02;

  group.add(floor, grid);

  return { group, mat };
}
