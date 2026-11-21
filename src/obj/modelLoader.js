
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { modelFiles } from "../config/modelSettings.js";

const loader = new GLTFLoader();

const cache = new Map();

let loadingPromise = null;

// Load the entire asset library once.
export async function preloadModels() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const url = new URL(
      "../assets/models.glb",
      import.meta.url
    ).href;

    const gltf = await loader.loadAsync(url);

    const scene = gltf.scene;

    scene.updateMatrixWorld(true);

    for (const [key, objectName] of Object.entries(modelFiles)) {
      const source = scene.getObjectByName(objectName);

      if (!source) {
        throw new Error(
          `Model "${objectName}" not found in models.glb.`
        );
      }

      cache.set(key, source);

      console.log(`Registered model: ${key} (${objectName})`);
    }

    console.log("All models registered!");
  })();

  try {
    await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
}

// Create an independent instance of a cached model.
export function createModel(
  key,
  { targetHeight, targetSize } = {}
) {
  const source = cache.get(key);

  if (!source) {
    throw new Error(
      `Model "${key}" is not loaded. Await preloadModels() first.`
    );
  }

  const model = source.clone(true);

  // Preserve the object's world transform from the GLB hierarchy.
  source.updateWorldMatrix(true, false);

  model.matrix.copy(source.matrixWorld);
  model.matrix.decompose(
    model.position,
    model.quaternion,
    model.scale
  );
  model.matrixAutoUpdate = true;

  // Calculate original dimensions.
  const originalBox = new THREE.Box3().setFromObject(model);
  const size = originalBox.getSize(new THREE.Vector3());

  // Uniform scaling.
  if (targetHeight) {
    model.scale.multiplyScalar(targetHeight / size.y);
  } else if (targetSize) {
    const largest = Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(targetSize / largest);
  }

  // Center horizontally and place bottom at y = 0.
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());

  model.position.x -= center.x;
  model.position.y -= box.min.y;
  model.position.z -= center.z;

  // Shadows.
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const wrapper = new THREE.Group();
  wrapper.add(model);

  return wrapper;
}
