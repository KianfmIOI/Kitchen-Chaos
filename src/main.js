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
import { createBoundingBox } from "./obj/createBoundingBox.js";
// Objects
import { createPlayer } from "./obj/createPlayer.js";
import { createBox } from "./obj/createBox.js";

// Systems
import { createPlayerMovement } from "./sys/createPlayerMovement.js";
import { createMovementCheck } from "./sys/createMovementCheck.js";
import { createPlayerAnimation } from "./sys/createPlayerAnimation.js";
import { createInteraction } from "./sys/createInteraction.js";
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
  settings.renderer,
);

// -------------------------
// 2. CAMERA CONTROLS
// -------------------------

const controls = createOrbitControls(
  camera,
  renderer.domElement,
  settings.camera,
);
controls.enabled = false;

// -------------------------
// 3. WORLD
// -------------------------

const ground = createGround(settings.ground);

scene.add(ground);
const bbox = createBoundingBox(scene, settings.movementArea)
createLights(scene, settings.lighting);

// -------------------------
// 4. PLAYER
// -------------------------

const player = createPlayer(settings.player);

scene.add(player.group);

// -------------------------
// 5. PLAYER SYSTEMS
// -------------------------
const movementCheck = createMovementCheck({
    bounds: settings.movementArea
});

const playerMovement = createPlayerMovement({
  object: player.group,
  camera,
  config: settings.player,
  movementCheck,
  movementCircle: player.movementCircle
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
  bbox
});

// -------------------------
// 7. RESIZE HANDLER
// -------------------------

const removeResizeHandler = setupResizeHandler(
  camera,
  renderer,
  settings.renderer.maxPixelRatio,
);

// -------------------------
// 8. Interaction System test
// -------------------------
const interactables = new Set();

const box = createBox({
  position: { x: 0, y: 1, z: 3 },
});

scene.add(box);
interactables.add(box);
const box1 = createBox({
  position: { x: 3, y: 1, z: 1 },
  color: 0x00ff00,
});

scene.add(box1);
interactables.add(box1);
const interaction = createInteraction({
  player: player,
  playerMovement: playerMovement,
  intersectables: interactables,
  config: settings.interaction,
});




// -------------------------
// 8. TIMER
// -------------------------

const timer = new THREE.Timer();

timer.connect(document);

// -------------------------
// 10. CLEANUP
// -------------------------

window.addEventListener(
  "beforeunload",
  () => {
    renderer.setAnimationLoop(null);

    timer.dispose();

    playerMovement.dispose();

    interaction.dispose();

    controls.dispose();

    gui.destroy();

    renderer.dispose();

    removeResizeHandler();
  },
  { once: true },
);


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
  //controls.update();

  interaction.update();

  // Rendering
  renderer.render(scene, camera);
});
