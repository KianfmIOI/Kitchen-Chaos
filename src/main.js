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
  settings.renderer.maxPixelRatio,
);

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

    controls.dispose();

    gui.destroy();

    renderer.dispose();

    removeResizeHandler();
  },
  { once: true },
);
// -------------------------
// 11. object interaction
// -------------------------
let selectedObject = null;
let isHoldingItem = false;
let intersectables = [];

const PICKUP_RANGE = 2;
const HOLD_DISTANCE = 2; // how far in front the item floats
const HOLD_HEIGHT = 1.0;

const boxGeo = new THREE.BoxGeometry();
const boxMat = new THREE.MeshStandardMaterial({
  color: 0xffa500,
});
const box = new THREE.Mesh(boxGeo, boxMat);
box.position.set(2, 0.5, 0);
scene.add(box);
intersectables.push(box);

const raycaster = new THREE.Raycaster();
window.addEventListener("keydown", (e) => {
  if (e.code !== "KeyE" || e.repeat) return; // ignore auto-repeat

  if (isHoldingItem) dropItem();
  else tryPickUp();
});
function tryPickUp() {
  const origin = player.group.position.clone();
  origin.y += 1;

  const direction = playerMovement.getFacingDirection().clone().normalize();
  raycaster.set(origin, direction);
  raycaster.far = PICKUP_RANGE;

  const hits = raycaster.intersectObjects(intersectables, true);

  if (hits.length === 0) return;

  // hits[0].object may be a child mesh -> walk up to the root we track
  let obj = hits[0].object;
  while (obj && !intersectables.includes(obj)) obj = obj.parent;
  if (!obj) return;

  pickUp(obj);
}
function pickUp(obj) {
  selectedObject = obj;
  isHoldingItem = true;

  // Kill any tilt so it looks like it's being "carried"
  obj.rotation.set(0, 0, 0);
  // Position is updated every frame in your animate loop (see below)
}
function dropItem() {
  const obj = selectedObject;
  if (!obj) {
    isHoldingItem = false;
    return;
  }

  const dir = playerMovement.getFacingDirection().clone().setY(0).normalize();
  const dropPos = player.group.position
    .clone()
    .addScaledVector(dir, HOLD_DISTANCE);

  // Sit it on the floor: y = half its height (assuming ground is y = 0)
  const bbox = new THREE.Box3().setFromObject(obj);
  dropPos.y = (bbox.max.y - bbox.min.y) / 2;

  obj.position.copy(dropPos);
  obj.rotation.set(0, 0, 0);

  selectedObject = null;
  isHoldingItem = false;
}

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
  // item carrying
  if (isHoldingItem && selectedObject) {
    const dir = playerMovement.getFacingDirection().clone().setY(0).normalize();
    selectedObject.position
      .copy(player.group.position)
      .addScaledVector(dir, HOLD_DISTANCE);
    selectedObject.position.y = HOLD_HEIGHT;
  }

  // Rendering
  renderer.render(scene, camera);
});
