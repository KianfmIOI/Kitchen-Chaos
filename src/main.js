
import "./style.css";
import * as THREE from "three";

import { settings } from "./config/settings.js";

// Core
import { createScene } from "./core/createScene.js";
import { createCamera } from "./core/createCamera.js";
import { createRenderer } from "./core/createRenderer.js";
import { createOrbitControls } from "./core/createOrbitControls.js";

// World
import { createGround } from "./world/createGround.js";
import { createLights } from "./world/createLights.js";

// Objects
import { createPlayer } from "./obj/createPlayer.js";

// Systems
import { createPlayerMovement } from "./sys/createPlayerMovement.js";
import { createPlayerAnimation } from "./sys/createPlayerAnimation.js";
import { setupResizeHandler } from "./sys/resizeHandler.js";

// UI
import { createDebugGUI } from "./ui/createDebugGUI.js";


// -------------------------
// 1. CORE
// -------------------------

// scene, camera, renderer
const scene = createScene(settings.scene);

const camera = createCamera(settings.camera);

const renderer = createRenderer(
  document.querySelector("#bg"),
  settings.renderer
);


// -------------------------
// 2. CAMERA CONTROLS
// -------------------------

const controls = createOrbitControls(
  camera,
  renderer.domElement,
  settings.camera
);
controls.enabled=false


// -------------------------
// 3. WORLD
// -------------------------

const ground = createGround(settings.ground);

scene.add(ground);

createLights(scene, settings.lighting);


// -------------------------
// 4. PLAYER
// -------------------------

const player = createPlayer(settings.player);

scene.add(player.group);


// -------------------------
// 5. PLAYER SYSTEMS
// -------------------------

const playerMovement = createPlayerMovement({
  object: player.group,
  camera,
  config: settings.player,
});

const playerAnimation = createPlayerAnimation({
  head: player.head,
  config: settings.player.animation,
  headBaseY: player.headBaseY,
});


// -------------------------
// 6. DEVELOPER GUI
// -------------------------

const gui = createDebugGUI({
  settings,
  camera,
  controls,
  player,
});


// -------------------------
// 7. RESIZE HANDLER
// -------------------------

const removeResizeHandler = setupResizeHandler(
  camera,
  renderer,
  settings.renderer.maxPixelRatio
);


// -------------------------
// 8. TIMER
// -------------------------

const timer = new THREE.Timer();

timer.connect(document);


// -------------------------
// 9. ANIMATION LOOP
// -------------------------

renderer.setAnimationLoop((timestamp) => {

  timer.update(timestamp);

  const delta = Math.min(timer.getDelta(), 0.05);

  // Movement
  const isMoving = playerMovement.update(delta);

  // Character animation
  playerAnimation.update(delta, isMoving);

  // Camera
  controls.update();

  // Rendering
  renderer.render(scene, camera);

});


// -------------------------
// 10. CLEANUP
// -------------------------

window.addEventListener(
  "beforeunload",
  () => {

    renderer.setAnimationLoop(null);

    timer.dispose();

    playerMovement.dispose();

    controls.dispose();

    gui.destroy();

    renderer.dispose();

    removeResizeHandler();

  },
  { once: true }
);
