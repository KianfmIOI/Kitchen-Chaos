import * as THREE from "three";

export const kitchenSettings = {
  debug: {
    showTriggers: true,
  },
  // Kitchen-wide settings
  layout: {
    movementBounds: {
      min: { x: -8, z: -6 },
      max: { x: 8, z: 6 },
    },

    counterHeight: 1.2,
    counterDepth: 1.2,
    counterWidth: 2,

    // Distance from the movement boundary to counter center
    edgeOffset: 0.6,
  },

  // Default counter appearance
  defaultCounter: {
    color: 0xffa500,
    roughness: 0.7,
    metalness: 0,

    geometry: {
      width: 2,
      height: 2,
      depth: 2,
    },

    trigger: {
      width: 2,
      height: 1.5,
      depth: 1.5,
      position: { x: 0, y: 1.2, z: 0 },
    },
  },

  // Special trash counter appearance
  trashCounter: {
    color: 0x151515,
    roughness: 0.85,
    metalness: 0,

    geometry: {
      topRadius: 0.75,
      bottomRadius: 0.5,
      height: 1.4,
      segments: 32,
    },

    trigger: {
      width: 1.6,
      height: 1.6,
      depth: 1.6,
      position: { x: 0, y: 1.3, z: 0 },
    },
  },

  // Counter layout. Spawners share the back row.
  counters: [
    {
      id: "spawner_tomato",
      type: "spawner",
      item: "tomato",
      position: { x: -4.8, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
    },
    {
      id: "spawner_onion",
      type: "spawner",
      item: "onion",
      position: { x: -2.4, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
    },
    {
      id: "spawner_cheese",
      type: "spawner",
      item: "cheese",
      position: { x: 0, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
    },
    {
      id: "spawner_burger",
      type: "spawner",
      item: "burger",
      position: { x: 2.4, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
    },
    {
      id: "spawner_bread",
      type: "spawner",
      item: "bread",
      position: { x: 4.8, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
    },

    {
      id: "chopping_01",
      type: "chopping",
      position: { x: -3, z: 6.6 },
      interactable: true,
      interactionType: "chop",
    },

    {
      id: "filler_03",
      type: "filler",
      position: { x: 0, z: 6.6 },
      interactable: false,
    },
    {
      id: "frying_01",
      type: "frying",
      position: { x: 3, z: 6.6 },
      interactable: true,
      interactionType: "fry",
    },

    {
      id: "filler_05",
      type: "filler",
      position: { x: -9.2, z: -3 },
      rotation: Math.PI / 2,
      interactable: false,
    },
    {
      id: "plate_01",
      type: "plate",
      position: { x: -9.2, z: 0 },
      rotation: Math.PI / 2,
      interactable: true,
      interactionType: "plate",
    },
    {
      id: "filler_06",
      type: "filler",
      position: { x: -9.2, z: 3 },
      rotation: Math.PI / 2,
      interactable: false,
    },

    {
      id: "filler_07",
      type: "filler",
      position: { x: 9.2, z: -3 },
      rotation: -Math.PI / 2,
      interactable: false,
    },
    {
      id: "trash_01",
      type: "trash",
      position: { x: 9.2, z: 0 },
      rotation: -Math.PI / 2,
      interactable: true,
      interactionType: "trash",
    },
    {
      id: "filler_08",
      type: "filler",
      position: { x: 9.2, z: 3 },
      rotation: -Math.PI / 2,
      interactable: false,
    },
  ],
};
