import * as THREE from "three";

const MOVEMENT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

export function createPlayerMovement({ object, camera, config, movementCheck, movementCircle  }) {
  const keys = new Set();

  // Reusable vectors
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

  // Remember the direction the player should face
  let targetAngle = object.rotation.y;

  // vector for movement check
  const nextPosition = new THREE.Vector3();

  function update(delta) {
    const forwardInput = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));

    const rightInput = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));

    // Track whether the player is actually moving
    let isMoving = false;

    // --------------------------------
    // 1. MOVEMENT
    // --------------------------------

    if (forwardInput !== 0 || rightInput !== 0) {
      camera.getWorldDirection(forward);
      forward.y = 0;

      if (forward.lengthSq() > 0.000001) {
        forward.normalize();

        right.crossVectors(forward, worldUp).normalize();

        direction.set(0, 0, 0);

        direction.addScaledVector(forward, forwardInput);
        direction.addScaledVector(right, rightInput);

        if (direction.lengthSq() > 0) {
          direction.normalize();

          // Remember the direction we want to face
          targetAngle = Math.atan2(direction.x, direction.z);

          // Move the player
          //object.position.addScaledVector(direction, config.speed * delta);
          nextPosition.copy(object.position)
          nextPosition.addScaledVector(direction,config.speed*delta)
          const canMoveResults = movementCheck.canMove({
            playerPos: nextPosition,
            movementCircle
          })
          if(canMoveResults.x){
            object.position.x = nextPosition.x
          }
          if(canMoveResults.z){
            object.position.z = nextPosition.z
          }
          isMoving = canMoveResults.x || canMoveResults.z
        }
      }
    }

    // --------------------------------
    // 2. ROTATION
    // --------------------------------

    // This runs EVERY frame, even without movement input.

    const difference = Math.atan2(
      Math.sin(targetAngle - object.rotation.y),
      Math.cos(targetAngle - object.rotation.y),
    );

    object.rotation.y +=
      difference * (1 - Math.exp(-config.rotationSpeed * delta));

    // --------------------------------
    // 3. RETURN MOVEMENT STATE
    // --------------------------------

    return isMoving;
  }
  function getFacingDirection() {
    return new THREE.Vector3(
      Math.sin(object.rotation.y),
      0,
      Math.cos(object.rotation.y),
    );
  }
  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);

    keys.clear();
  }

  return { update, dispose, getFacingDirection };
}
