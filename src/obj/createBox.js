
import * as THREE from "three";

const DEFAULT_CONFIG = {
  width: 1,
  height: 1,
  depth: 1,
  color: 0xffa500,
  position: { x: 2, y: 0.5, z: 0 },
};

export function createBox(config = {}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config,
    position: {
      ...DEFAULT_CONFIG.position,
      ...config.position,
    },
  };

  const { width, height, depth, color, position } = settings;

  const geometry = new THREE.BoxGeometry(width, height, depth);

  const material = new THREE.MeshStandardMaterial({
    color,
  });

  const box = new THREE.Mesh(geometry, material);

  box.position.set(position.x, position.y, position.z);

  return box;
}
