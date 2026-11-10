import * as THREE from "three";
import heartTextureURL from "../assets/heart.png";

export function createHeartEffect({ scene, player, config }) {
  // Load the heart image once
  const texture = new THREE.TextureLoader().load(heartTextureURL);

  const activeHearts = [];

  // Create a new heart
  function spawnHeart() {
    if (!config.enabled) return;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });

    const heart = new THREE.Sprite(material);

    heart.scale.set(config.width, config.height, 1);

    // Get the player's world position
    const position = new THREE.Vector3();
    player.getWorldPosition(position);

    heart.position.set(position.x, position.y + config.spawnHeight, position.z);

    scene.add(heart);

    activeHearts.push({
      sprite: heart,
      startY: heart.position.y,
      elapsed: 0,
    });
  }

  // Listen for the L key
  function onKeyDown(event) {
    if (event.code !== config.key) return;
    if (event.repeat) return;

    if (
      event.target instanceof HTMLElement &&
      (event.target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
    )
      return;

    spawnHeart();
  }

  window.addEventListener("keydown", onKeyDown);

  // Animate active hearts
  function update(delta) {
    for (let i = activeHearts.length - 1; i >= 0; i--) {
      const item = activeHearts[i];

      item.elapsed += delta;

      const progress = Math.min(item.elapsed / config.duration, 1);

      // Float upward
      item.sprite.position.y = item.startY + config.riseHeight * progress;

      // Fade out
      item.sprite.material.opacity = 1 - progress;

      // Remove when animation finishes
      if (progress >= 1) {
        scene.remove(item.sprite);
        item.sprite.material.dispose();

        activeHearts.splice(i, 1);
      }
    }
  }

  // Cleanup
  function dispose() {
    window.removeEventListener("keydown", onKeyDown);

    for (const item of activeHearts) {
      scene.remove(item.sprite);
      item.sprite.material.dispose();
    }

    activeHearts.length = 0;
    texture.dispose();
  }

  return { update, dispose };
}
