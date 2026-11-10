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
      height: 1.2,
      depth: 1.2,
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

  // Every counter in the kitchen
  counters: [
    // BACK SIDE (-Z)
    {
      id: "filler_01",
      type: "filler",
      position: { x: -5, z: -6.6 },
      interactable: false,
    },
    {
      id: "spawner_01",
      type: "spawner",
      position: { x: 0, z: -6.6 },
      interactable: true,
      interactionType: "spawn",
      item: "tomato",
    },
    {
      id: "filler_02",
      type: "filler",
      position: { x: 5, z: -6.6 },
      interactable: false,
    },

    // FRONT SIDE (+Z)
    {
      id: "filler_03",
      type: "filler",
      position: { x: -5, z: 6.6 },
      interactable: false,
    },
    {
      id: "chopping_01",
      type: "chopping",
      position: { x: 0, z: 6.6 },
      interactable: true,
      interactionType: "chop",
      requiredTool: "knife",
    },
    {
      id: "filler_04",
      type: "filler",
      position: { x: 5, z: 6.6 },
      interactable: false,
    },

    // LEFT SIDE (-X)
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
      interactionType: "place_plate",
    },
    {
      id: "filler_06",
      type: "filler",
      position: { x: -9.2, z: 3 },
      rotation: Math.PI / 2,
      interactable: false,
    },

    // RIGHT SIDE (+X)
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
