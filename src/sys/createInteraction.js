import * as THREE from "three";
import { createKitchenItem, createPlateGroup } from "../world/createKitchen.js";

export function createInteraction({ scene, player, playerMovement, interactables = new Set(), config }) {
  let heldItem = null;
  let heldKind = "item";
  const cookingItems = new Map(); // item -> frying counter
  const raycaster = new THREE.Raycaster();
  const rayCount = 5;
  const spreadAngle = Math.PI / 4;
  const worldUp = new THREE.Vector3(0, 1, 0);
  const rayHeights = [0.45, 0.85, 1.25];

  const platePanel = document.createElement("div");
  Object.assign(platePanel.style, {
    position: "fixed", left: "18px", top: "18px", zIndex: "20",
    minWidth: "190px", maxWidth: "260px", padding: "12px 16px",
    color: "#fff", background: "rgba(15,20,30,.88)",
    border: "1px solid rgba(255,255,255,.3)", borderRadius: "10px",
    font: "14px/1.5 system-ui, sans-serif", pointerEvents: "none",
    display: "none", whiteSpace: "pre-line",
  });
  document.body.appendChild(platePanel);

  function isTyping(target) {
    return target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  }

  function findTarget() {
    const origin = player.group.position.clone();
    origin.y = 0;
    const forward = playerMovement.getFacingDirection().clone().setY(0).normalize();
    let best = null;
    let bestDistance = Infinity;
    for (const height of rayHeights) {
      const rayOrigin = origin.clone();
      rayOrigin.y = height;
      for (let i = 0; i < rayCount; i++) {
        const t = i / (rayCount - 1);
        const direction = forward.clone().applyAxisAngle(worldUp, (t - 0.5) * spreadAngle);
        raycaster.set(rayOrigin, direction);
        raycaster.near = 0;
        raycaster.far = config.pickUpRange;
        const hits = raycaster.intersectObjects([...interactables], false);
        if (!hits.length || hits[0].distance >= bestDistance) continue;
        const hit = hits[0].object;
        if (hit.userData.counter) {
          best = { kind: "counter", counter: hit.userData.counter };
          bestDistance = hits[0].distance;
        } else if (hit.userData.itemRoot) {
          best = { kind: "item", item: hit.userData.itemRoot };
          bestDistance = hits[0].distance;
        }
      }
    }
    return best;
  }

  // Remove the floating label once an item becomes part of a plate.
  // The item remains the same object; only its label resources are removed.
  function removeItemLabel(item) {
    const label = item.userData.label;
    if (!label) return;

    item.remove(label);

    if (label.material?.map) {
      label.material.map.dispose();
    }
    label.material?.dispose();

    item.userData.label = null;
  }

  function setItemLabel(item) {
    const text = item.userData.displayName;
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(15,20,30,.9)";
    ctx.roundRect(4, 4, 504, 120, 18); ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "bold 46px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64, 470);
    const texture = new THREE.CanvasTexture(canvas);
    const old = item.userData.label.material.map;
    item.userData.label.material.map = texture;
    item.userData.label.material.needsUpdate = true;
    if (old) old.dispose();
  }

  function pickUp(item, kind = "item") {
    heldItem = item;
    heldKind = kind;
    scene.attach(item);
    item.rotation.set(0, 0, 0);
  }

  function removeInteractables(root) {
    root.traverse((child) => {
      if (child.isMesh) interactables.delete(child);
    });
  }

  function addInteractables(root) {
    root.traverse((child) => {
      if (child.isMesh && child.userData.itemRoot) interactables.add(child);
    });
  }

  function discardHeldItem() {
    if (!heldItem) return;
    removeInteractables(heldItem);
    scene.remove(heldItem);
    heldItem = null;
    heldKind = "item";
  }

  function canPlace(item, counterType) {
    if (counterType === "trash") return true;
    if (heldKind === "plate") return false;
    const type = item.userData.itemType;
    if (counterType === "chopping") return ["tomato", "onion"].includes(type) && !item.userData.chopped;
    if (counterType === "frying") return type === "burger" && !item.userData.cooked && !item.userData.cooking;
    if (counterType === "plate") {
      if (type === "burger") return item.userData.cooked;
      return ["tomato", "onion", "cheese", "bread"].includes(type);
    }
    return false;
  }

  function updatePlatePanel(counter) {
    const items = counter.userData.plateItems;
    platePanel.style.display = items.length ? "block" : "none";
    platePanel.textContent = items.length
      ? `PLATE CONTENTS\n${items.map((item) => `• ${item.userData.displayName}`).join("\n")}`
      : "";
  }

  function interactWithCounter(counter) {
    const type = counter.userData.type;

    if (!heldItem) {
      if (type === "spawner") {
        const forward = playerMovement.getFacingDirection().clone().setY(0).normalize();
        const position = player.group.position.clone().addScaledVector(forward, 1.1);
        position.y = 0;
        pickUp(createKitchenItem(scene, interactables, counter.userData.item, position));
      } else if (type === "plate" && counter.userData.plateItems.length) {
        for (const platedItem of counter.userData.plateItems) removeInteractables(platedItem);
        pickUp(counter.userData.plateGroup, "plate");
        updatePlatePanel(counter);
        counter.userData.plateItems = [];
        // The old plate (with its contents) is now being carried.
        // Create a complete replacement plate, not just an empty Group.
        counter.userData.plateGroup = createPlateGroup();
        counter.userData.plateGroup.position.set(0, 2.06, 0);
        counter.add(counter.userData.plateGroup);
        platePanel.style.display = "none";
      }
      return;
    }

    if (!canPlace(heldItem, type)) return;

    if (type === "trash") {
      discardHeldItem();
      return;
    }

    if (type === "chopping") {
      heldItem.userData.chopped = true;
      heldItem.userData.tags.push("chopped");
      heldItem.userData.displayName = `Chopped ${heldItem.userData.itemType}`;
      setItemLabel(heldItem);
      return;
    }

    if (type === "frying") {
      const item = heldItem;
      item.userData.cooking = true;
      item.userData.cookRemaining = config.cookDuration;
      item.userData.cookDuration = config.cookDuration;
      item.userData.displayName = "Cooking burger";
      setItemLabel(item);

      // Put the burger on the pan and make it unavailable until cooking ends.
      removeInteractables(item);
      counter.attach(item);
      item.position.set(0, 2.2, 0);
      item.rotation.set(0, 0, 0);
      cookingItems.set(item, counter);

      heldItem = null;
      heldKind = "item";
      drawProgress(counter, item);
      return;
    }

    if (type === "plate") {
      const plateGroup = counter.userData.plateGroup;

      // Only remove the label after the item has passed the plate's
      // acceptance rules and is actually being placed.
      removeItemLabel(heldItem);
      removeInteractables(heldItem);
      plateGroup.attach(heldItem);
      heldItem.position.set(0, 0.25 + counter.userData.plateItems.length * 0.18, 0);
      heldItem.rotation.set(0, 0, 0);
      heldItem.userData.tags.push("plated");
      counter.userData.plateItems.push(heldItem);
      heldItem = null;
      updatePlatePanel(counter);
    }
  }

  function onKeyDown(event) {
    if (event.code !== "KeyE" || event.repeat || isTyping(event.target)) return;
    event.preventDefault();
    const target = findTarget();

    if (heldItem) {
      // No counter in front, or an incompatible counter: keep holding the item.
      if (target?.kind === "counter") interactWithCounter(target.counter);
      return;
    }

    if (target?.kind === "counter") interactWithCounter(target.counter);
    else if (target?.kind === "item") pickUp(target.item);
  }

  window.addEventListener("keydown", onKeyDown);

  function drawProgress(counter, item) {
    const progress = counter.userData.cookProgress;
    if (!progress) return;
    const { canvas, texture, sprite } = progress;
    const ctx = canvas.getContext("2d");
    const ratio = Math.max(0, Math.min(1, 1 - item.userData.cookRemaining / item.userData.cookDuration));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15,20,30,.92)";
    ctx.roundRect(4, 4, 504, 92, 18); ctx.fill();
    ctx.fillStyle = "#555";
    ctx.roundRect(20, 30, 472, 38, 12); ctx.fill();
    ctx.fillStyle = item.userData.cooked ? "#48d597" : "#ffb347";
    ctx.roundRect(20, 30, 472 * ratio, 38, 12); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 27px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(item.userData.cooked ? "READY!" : "FRYING", 256, 17);
    texture.needsUpdate = true;
    sprite.visible = true;
  }

  function update(delta) {
    if (heldItem) {
      const direction = playerMovement.getFacingDirection().clone().setY(0).normalize();
      heldItem.position.copy(player.group.position).addScaledVector(direction, config.holdDistance);
      heldItem.position.y = heldKind === "plate" ? config.holdHeight + 0.25 : config.holdHeight;
    }

    // Update each burger on its own frying counter.
    for (const [item, fryingCounter] of cookingItems) {
      item.userData.cookRemaining = Math.max(0, item.userData.cookRemaining - delta);
      drawProgress(fryingCounter, item);

      if (item.userData.cookRemaining <= 0) {
        item.userData.cooking = false;
        item.userData.cooked = true;
        if (!item.userData.tags.includes("cooked")) {
          item.userData.tags.push("cooked");
        }
        item.userData.displayName = "Fried burger";
        setItemLabel(item);

        // It can now be picked up from the frying counter.
        addInteractables(item);
        drawProgress(fryingCounter, item);
        cookingItems.delete(item);
      }
    }
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    platePanel.remove();
  }

  return { update, dispose, getHeldObject: () => heldItem };
}
