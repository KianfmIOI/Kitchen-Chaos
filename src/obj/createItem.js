import * as THREE from "three";
import { itemSettings } from "../config/itemSettings.js";

// Temporary name tag above the item. Replace with a real mesh later.
function createLabel(text, y) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false }),
  );
  sprite.scale.set(1.2, 0.3, 1);
  sprite.position.y = y;
  sprite.renderOrder = 10;

  return sprite;
}

export function createItem(type) {
  const def = itemSettings[type];
  if (!def) throw new Error(`Unknown item type: ${type}`);

  const item = new THREE.Group();
  item.name = type;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(def.size, def.size, def.size),
    new THREE.MeshStandardMaterial({ color: def.color }),
  );
  mesh.castShadow = true;

  item.add(mesh);
  item.add(createLabel(def.label, def.size / 2 + 0.3));

  item.userData = {
    type,
    height: def.size,
    tags: { ...def.tags }, // copy, so changing one item never changes the config
  };

  return item;
}

export function hasTag(item, tag) {
  return item.userData.tags?.[tag] === true;
}
