import * as THREE from "three";

export function createInteraction({ player, playerMovement, intersectables = new Set(),config}) 
{
  let isHoldingItem = false;
 let selectedObject = null;

 const raycaster = new THREE.Raycaster();

 const rayCount = 5;
const spreadAngle = Math.PI / 4; // 30 degrees
const up = new THREE.Vector3(0, 1, 0);

  function onKeyDown(e) {
  if (e.code !== "KeyE" || e.repeat) return;

  if (isHoldingItem) {
    dropItem();
  } else {
    tryPickUp();
  }
    }

window.addEventListener("keydown", onKeyDown);
    function dispose() {
  window.removeEventListener("keydown", onKeyDown);
}
  function tryPickUp() {
  const origin = player.group.position.clone();
  origin.y += 1;

  const forward = playerMovement
    .getFacingDirection()
    .clone()
    .setY(0)
    .normalize();

  let closestObject = null;
  let closestDistance = Infinity;

  for (let i = 0; i < rayCount; i++) {

    // Calculate angle for each ray
    const t = i / (rayCount - 1);
    const angle = (t - 0.5) * spreadAngle;

    // Rotate forward direction horizontally
    const direction = forward.clone()
      .applyAxisAngle(up, angle);

    raycaster.set(origin, direction);
    raycaster.far = config.pickUpRange;

    const hits = raycaster.intersectObjects(
      [...intersectables],
      true
    );

    if (hits.length === 0) continue;

    // Find the registered interactable object
    let obj = hits[0].object;

    while (obj && !intersectables.has(obj)) {
      obj = obj.parent;
    }

    if (!obj) continue;

    // Keep the closest hit across all five rays
    if (hits[0].distance < closestDistance) {
      closestDistance = hits[0].distance;
      closestObject = obj;
    }
  }

  if (!closestObject) return;

  pickUp(closestObject);
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
    .addScaledVector(dir, config.holdDistance);

  // Sit it on the floor: y = half its height (assuming ground is y = 0)
  const bbox = new THREE.Box3().setFromObject(obj);
  dropPos.y = (bbox.max.y - bbox.min.y) / 2;

  obj.position.copy(dropPos);
  obj.rotation.set(0, 0, 0);

  selectedObject = null;
  isHoldingItem = false;
}
function getHeldObject() {
    return selectedObject;
  }
// item carrying
function update() 
{
  if (isHoldingItem && selectedObject) {
    const dir = playerMovement.getFacingDirection().clone().setY(0).normalize();
    selectedObject.position
      .copy(player.group.position)
      .addScaledVector(dir, config.holdDistance);
    selectedObject.position.y = config.holdHeight;
  }
}
return {
  update,
  dispose,
  getHeldObject,
};
};


