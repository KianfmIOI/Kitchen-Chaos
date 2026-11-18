import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export async function loadCounterMesh(config) {
  // Load the GLB model
  const gltf = await loader.loadAsync(
    new URL("../assets/counter.glb", import.meta.url).href,
  );

  const model = gltf.scene;

  // Get original model dimensions
  const originalBox = new THREE.Box3().setFromObject(model);
  const originalSize = new THREE.Vector3();
  originalBox.getSize(originalSize);

  // Desired dimensions from settings
  const { width, height, depth } = config.geometry;

  // Scale model to desired dimensions
  model.scale.set(
    width / originalSize.x,
    height / originalSize.y,
    depth / originalSize.z,
  );

  // Recalculate bounding box after scaling
  const scaledBox = new THREE.Box3().setFromObject(model);

  // Center horizontally and place bottom at y = 0
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  model.position.x -= center.x;
  model.position.y -= scaledBox.min.y;
  model.position.z -= center.z;

  // Apply material settings and shadows
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material = child.material.clone();
      child.material.color.setHex(config.color);
      child.material.roughness = config.roughness;
      child.material.metalness = config.metalness;
    }
  });

  return model;
}
