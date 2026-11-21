import * as THREE from "three";
import { createModel } from "../obj/modelLoader.js";
import { ITEM_MODEL_SIZE } from "../config/modelSettings.js";

// Heights (in the counter's local space) where things rest. They depend on your
// counter models: if something floats or sinks, tune these numbers.
// createInteraction.js imports them, so there is a single source of truth.
export const PLATE_Y = 2.0; // plate on the plate counter
export const PAN_SURFACE_Y = 2.1; // burger on the frying counter

// Item type -> key in modelSettings.js (modelFiles).
const MODEL_FOR = {
  tomato: "tomato",
  lettuce: "lettuce",
  cheese: "cheese",
  burger: "burger",
  bread: "bread",
};

function makeLabel(text, color = "#ffffff") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const labelText = text.split(" ")[0];

  // Set font before measuring
  ctx.font = "bold 100px Arial";

  // Measure text
  const textWidth = ctx.measureText(labelText).width;

  // Add padding around the text
  const horizontalPadding = 80;

  // Calculate canvas dimensions
  canvas.width = Math.ceil(textWidth + horizontalPadding * 2);
  canvas.height = 200;

  // Setting canvas dimensions resets its context, so set font again
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Background
  ctx.fillStyle = "rgba(15, 20, 30, 0.95)";
  ctx.beginPath();
  ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 35);
  ctx.fill();

  // Border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Text
  ctx.fillStyle = color;
  ctx.fillText(labelText, canvas.width / 2, canvas.height / 2);

  // Texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Sprite
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    }),
  );

  // Maintain the canvas aspect ratio in 3D
  const worldHeight = 0.5;
  const aspectRatio = canvas.width / canvas.height;

  sprite.scale.set(worldHeight * aspectRatio, worldHeight, 1);

  return sprite;
}

function createItemModel(itemType) {
  const key = MODEL_FOR[itemType];
  if (!key) throw new Error(`No model defined for item type "${itemType}" (see MODEL_FOR in createKitchen.js)`);
  return createModel(key, { targetSize: ITEM_MODEL_SIZE });
}

export function createKitchenItem(
  scene,
  interactables,
  itemType,
  position = new THREE.Vector3(),
) {
  const group = new THREE.Group();
  group.name = `item_${itemType}`;

  // The model's bottom sits at the group's origin.
  const model = createItemModel(itemType);
  group.add(model);

  const label = makeLabel(itemType);
  label.position.y = 1.05;
  group.add(label);
  group.position.copy(position);
  group.userData = {
    isKitchenItem: true,
    itemType,
    displayName: itemType[0].toUpperCase() + itemType.slice(1),
    tags: [itemType],
    chopped: false,
    cooked: false,
    cooking: false,
    label,
    model, // createInteraction swaps this when the item changes (e.g. chopped)
  };

  // Every mesh of the model must point back to the item, so picking works.
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.userData.itemRoot = group;
    interactables.add(child);
  });

  scene.add(group);
  return group;
}

export function createPlateGroup() {
  const plateGroup = new THREE.Group();
  plateGroup.name = "plate_with_contents";
  plateGroup.add(createModel("plate", { targetSize: 1.4 }));
  return plateGroup;
}

export async function createKitchen(config) {
  const kitchen = new THREE.Group();
  kitchen.name = "Kitchen";
  const interactables = new Set();
  const counters = [];

  function createCounter(counterConfig) {
    const counter = new THREE.Group();
    counter.name = counterConfig.id;

    // Trash uses its own look; any counter can override the model in kitchenSettings.
    const isTrash = counterConfig.type === "trash";
    const visualConfig = isTrash ? config.trashCounter : config.defaultCounter;
    const modelKey = counterConfig.model ?? visualConfig.model;
    const mesh = createModel(modelKey, { targetHeight: visualConfig.geometry.height });
    counter.add(mesh);

    counter.userData = {
      id: counterConfig.id,
      type: counterConfig.type,
      interactable: counterConfig.interactable ?? false,
      interactionType: counterConfig.interactionType ?? null,
      item: counterConfig.item ?? null,
      plateItems: [],
      fryingItem: null, // the burger currently on this counter's pan
    };

    // A visible counter-type label.
    if (counterConfig.type !== "filler") {
      const counterLabel = makeLabel(
        counterConfig.type === "spawner"
          ? `${counterConfig.item} spawner`
          : `${counterConfig.type} counter`,
      );
      counterLabel.position.set(0, 2.65, 0);
      counter.add(counterLabel);
    }

    // Spawners show the item they hand out, resting on the counter top.
    if (counterConfig.type === "spawner") {
      const display = createItemModel(counterConfig.item);
      display.position.y = visualConfig.geometry.height;
      counter.add(display);
    }

    if (counterConfig.type === "plate") {
      const plateGroup = createPlateGroup();
      plateGroup.position.set(0, PLATE_Y, 0);
      counter.add(plateGroup);
      counter.userData.plateGroup = plateGroup;
    }

    // The pan is part of the frying counter model. Only the progress bar is added here.
    if (counterConfig.type === "frying") {
      const progressCanvas = document.createElement("canvas");
      progressCanvas.width = 512;
      progressCanvas.height = 100;
      const progressTexture = new THREE.CanvasTexture(progressCanvas);
      const progress = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: progressTexture,
          transparent: true,
          depthTest: false,
        }),
      );
      progress.scale.set(2.1, 0.42, 1);
      progress.position.set(0, 3.8, 0); // above the burger's label
      progress.renderOrder = 10;
      progress.visible = false;
      counter.add(progress);
      counter.userData.cookProgress = {
        canvas: progressCanvas,
        texture: progressTexture,
        sprite: progress,
      };
    }

    let trigger = null;
    if (counter.userData.interactable) {
      const t = visualConfig.trigger;
      trigger = new THREE.Mesh(
        new THREE.BoxGeometry(t.width, t.height, t.depth),
        new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: config.debug.showTriggers ? 0.18 : 0,
          depthWrite: false,
        }),
      );
      trigger.name = `${counterConfig.id}_trigger`;
      trigger.position.set(t.position.x, t.position.y, t.position.z);
      trigger.userData.counter = counter;
      counter.add(trigger);
      interactables.add(trigger);
    }
    counter.position.set(counterConfig.position.x, 0, counterConfig.position.z);
    counter.rotation.y = counterConfig.rotation ?? 0;
    kitchen.add(counter);
    counters.push({ group: counter, mesh, trigger });
  }

  for (const item of config.counters) createCounter(item);
  return { group: kitchen, counters, interactables };
}