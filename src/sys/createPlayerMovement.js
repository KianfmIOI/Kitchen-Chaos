import * as THREE from "three";

const MOVEMENT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

export function createPlayerMovement({ object, camera, config }) {
  // Private keyboard state
  const keys = new Set();

  // Reusable vectors (avoid creating them every frame)
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();

  function isTyping(target) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
    );
  }

  function onKeyDown(event) {
    if (isTyping(event.target)) return;

    if (MOVEMENT_KEYS.has(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  function onBlur() {
    keys.clear();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  // Called once per animation frame
  
function update(delta) {
  const forwardInput =
    Number(keys.has("KeyW")) - Number(keys.has("KeyS"));

  const rightInput =
    Number(keys.has("KeyD")) - Number(keys.has("KeyA"));

  // No movement input
  if (forwardInput === 0 && rightInput === 0) {
    return false;
  }

  // Camera-relative horizontal direction
  camera.getWorldDirection(forward);
  forward.y = 0;

  if (forward.lengthSq() < 0.000001) {
    return false;
  }

  forward.normalize();

  right.crossVectors(forward, worldUp).normalize();

  direction.set(0, 0, 0);

  direction.addScaledVector(forward, forwardInput);
  direction.addScaledVector(right, rightInput);

  // Prevent diagonal movement being faster
  if (direction.lengthSq() > 1) {
    direction.normalize();
  }

  object.position.addScaledVector(
    direction,
    config.speed * delta
  );

  return true;
}


  // Clean up event listeners when no longer needed
  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);

    keys.clear();
  }

  return { update, dispose };
}
