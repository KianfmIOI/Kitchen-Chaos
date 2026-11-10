import * as THREE from "three";

import { createCounterMesh } from "../obj/createCounterMesh.js";

export function createKitchen(config, movementBounds) {
  const kitchen = new THREE.Group();
  kitchen.name = "Kitchen";

  const interactables = new Set();
  const counters = [];

  // --------------------------------
  // CREATE ONE COUNTER
  // --------------------------------

  function createCounter(counterConfig) {
    const counter = new THREE.Group();

    counter.name = counterConfig.id;

    const isTrash = counterConfig.type === "trash";

    // Choose the appropriate visual settings
    const visualConfig = isTrash ? config.trashCounter : config.defaultCounter;

    // Visual mesh
    const mesh = createCounterMesh(visualConfig);

    counter.add(mesh);

    // --------------------------------
    // COUNTER DATA
    // --------------------------------

    counter.userData = {
      id: counterConfig.id,
      type: counterConfig.type,

      interactable: counterConfig.interactable ?? false,

      interactionType: counterConfig.interactionType ?? null,

      item: counterConfig.item ?? null,

      requiredTool: counterConfig.requiredTool ?? null,
    };

    // --------------------------------
    // INTERACTION TRIGGER
    // --------------------------------

    let trigger = null;

    if (counter.userData.interactable) {
      const triggerConfig = visualConfig.trigger;

      const triggerGeometry = new THREE.BoxGeometry(
        triggerConfig.width,
        triggerConfig.height,
        triggerConfig.depth,
      );

      const triggerMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: config.debug.showTriggers ? 0.25 : 0,
        depthWrite: false,
      });

      trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);

      trigger.name = `${counterConfig.id}_trigger`;

      trigger.position.set(
        triggerConfig.position.x,
        triggerConfig.position.y,
        triggerConfig.position.z,
      );

      // Reference the actual counter
      trigger.userData.counter = counter;

      counter.add(trigger);

      interactables.add(trigger);
    }

    // --------------------------------
    // POSITION AND ROTATION
    // --------------------------------

    counter.position.set(counterConfig.position.x, 0, counterConfig.position.z);

    counter.rotation.y = counterConfig.rotation ?? 0;

    kitchen.add(counter);

    counters.push({
      group: counter,
      mesh,
      trigger,
    });

    return counter;
  }

  // --------------------------------
  // CREATE ALL COUNTERS
  // --------------------------------

  for (const counterConfig of config.counters) {
    createCounter(counterConfig);
  }

  return {
    group: kitchen,
    counters,
    interactables,
  };
}
