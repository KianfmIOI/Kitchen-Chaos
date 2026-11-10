import * as THREE from "three";

export function createCounterMesh(config) {
  let geometry;

  if (config.geometry.topRadius !== undefined) {
    // Trash counter: wider at the top
    geometry = new THREE.CylinderGeometry(
      config.geometry.topRadius,
      config.geometry.bottomRadius,
      config.geometry.height,
      config.geometry.segments,
    );
  } else {
    // Default rectangular counter
    geometry = new THREE.BoxGeometry(
      config.geometry.width,
      config.geometry.height,
      config.geometry.depth,
    );
  }

  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: config.roughness,
    metalness: config.metalness,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.y = config.geometry.height / 2;

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}
