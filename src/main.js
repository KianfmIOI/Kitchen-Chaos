import "./style.css";
import * as THREE from "three";

import { settings } from "./config/settings.js";

import { createScene } from "./core/createScene.js";
import { createCamera } from "./core/createCamera.js";
import { createRenderer } from "./core/createRenderer.js";
import { createOrbitControls } from "./core/createOrbitControls.js";

import { createGround } from "./world/createGround.js";
import { createLights } from "./world/createLights.js";

import { createSphere } from "./obj/createSphere.js";

import { createPlayerMovement } from "./sys/createPlayerMovement.js";
import { setupResizeHandler } from "./sys/resizeHandler.js";

// 1. Create the fundamental components
const scene = createScene(settings.scene);
const camera = createCamera(settings.camera);

const renderer = createRenderer(
  document.querySelector("#bg"),
  settings.renderer,
);

// 2. Create camera controls
const controls = createOrbitControls(
  camera,
  renderer.domElement,
  settings.camera,
);

// 3. Create the world
const ground = createGround(settings.ground);
scene.add(ground);

createLights(scene, settings.lighting);

// 4. Create the player
const player = createSphere(settings.player);
scene.add(player);

// 5. Create independent movement system
const playerMovement = createPlayerMovement({
  object: player,
  camera,
  config: settings.player,
});

// 6. Handle resizing
const removeResizeHandler = setupResizeHandler(
  camera,
  renderer,
  settings.renderer.maxPixelRatio,
);

// 7. Timer
const timer = new THREE.Timer();
timer.connect(document);

// 8. Main animation loop
renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);

  const delta = Math.min(timer.getDelta(), 0.05);

  // Update independent systems
  playerMovement.update(delta);

  controls.update();
  console.log("Scene:", scene);
  console.log("Camera:", camera);
  console.log("Is valid camera:", camera?.isCamera);
  // Render
  renderer.render(scene, camera);
});

// 9. Cleanup
window.addEventListener(
  "beforeunload",
  () => {
    renderer.setAnimationLoop(null);

    timer.dispose();
    playerMovement.dispose();
    controls.dispose();
    renderer.dispose();

    removeResizeHandler();
  },
  { once: true },
);
