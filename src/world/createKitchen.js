import * as THREE from "three";
import { createCounterMesh } from "../obj/createCounterMesh.js";
import { loadCounterMesh } from "../obj/loadCounterMesh.js";

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
  const verticalPadding = 50;

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
const ITEM_COLORS = {
  tomato: 0xe53935,
  onion: 0xd8c5a2,
  cheese: 0xffd43b,
  burger: 0x79502b,
  bread: 0xd99a45,
};

export function createKitchenItem(
  scene,
  interactables,
  itemType,
  position = new THREE.Vector3(),
) {
  const group = new THREE.Group();
  group.name = `item_${itemType}`;
  const color = ITEM_COLORS[itemType] ?? 0xaaaaaa;
  const geometry =
    itemType === "tomato"
      ? new THREE.SphereGeometry(0.38, 20, 16)
      : new THREE.BoxGeometry(0.65, 0.55, 0.65);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
  );
  mesh.castShadow = true;
  mesh.position.y = 0.32;
  group.add(mesh);
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
  };
  mesh.userData.itemRoot = group;
  scene.add(group);
  interactables.add(mesh);
  return group;
}

export function createPlateGroup() {
  const plateGroup = new THREE.Group();
  plateGroup.name = "plate_with_contents";

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.62, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.35 }),
  );
  plate.receiveShadow = true;
  plateGroup.add(plate);

  return plateGroup;
}

export async function createKitchen(config) {
  const kitchen = new THREE.Group();
  kitchen.name = "Kitchen";
  const interactables = new Set();
  const counters = [];

  async function createCounter(counterConfig) {
    const counter = new THREE.Group();
    counter.name = counterConfig.id;
    const isTrash = counterConfig.type === "trash";
    const visualConfig = isTrash ? config.trashCounter : config.defaultCounter;
    const mesh = isTrash
      ? createCounterMesh(visualConfig)
      : await loadCounterMesh(visualConfig);
    counter.add(mesh);
    counter.userData = {
      id: counterConfig.id,
      type: counterConfig.type,
      interactable: counterConfig.interactable ?? false,
      interactionType: counterConfig.interactionType ?? null,
      item: counterConfig.item ?? null,
      plateItems: [],
    };

    // A visible counter-type label and a simple item placeholder on spawners.
    if (counterConfig.type !== "filler") {
      const counterLabel = makeLabel(
        counterConfig.type === "spawner"
          ? `${counterConfig.item} spawner`
          : `${counterConfig.type} counter`,
      );
      counterLabel.position.set(0, 2.65, 0);
      counter.add(counterLabel);
    }
    if (counterConfig.type === "spawner") {
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.65, 0.65),
        new THREE.MeshStandardMaterial({
          color: ITEM_COLORS[counterConfig.item] ?? 0xffffff,
        }),
      );
      placeholder.position.set(0, 2.0, 0);
      placeholder.castShadow = true;
      counter.add(placeholder);
    }
    if (counterConfig.type === "plate") {
      const plateGroup = createPlateGroup();
      plateGroup.position.set(0, 2.06, 0);
      counter.add(plateGroup);
      counter.userData.plateGroup = plateGroup;
    }
    if (counterConfig.type === "frying") {
      const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.62, 0.12, 32),
        new THREE.MeshStandardMaterial({
          color: 0x292929,
          metalness: 0.45,
          roughness: 0.35,
        }),
      );
      pan.position.y = 2.08;
      counter.add(pan);

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
      progress.position.set(0, 2.85, 0);
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

  for (const item of config.counters) await createCounter(item);
  return { group: kitchen, counters, interactables };
}
