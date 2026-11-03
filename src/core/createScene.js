import * as THREE from "three";

export function createScene(config) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.background);
  return scene;
}
