
import * as THREE from "three";

export function createPlayer(config) {

  // Main container
  const group = new THREE.Group();

  group.name = "Player";

  group.position.set(...config.position);

  // Body
  const bodyGeometry = new THREE.SphereGeometry(
    config.bodyRadius,
    48,
    48
  );

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: config.bodyColor,
    roughness: config.roughness,
    metalness: config.metalness,
  });

  const body = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial
  );

  body.position.y = config.bodyRadius;
  body.castShadow = true;
  body.receiveShadow = true;

  // Head
  const headGeometry = new THREE.SphereGeometry(
    config.headRadius,
    48,
    48
  );

  const headMaterial = new THREE.MeshStandardMaterial({
    color: config.headColor,
    roughness: config.roughness,
    metalness: config.metalness,
  });

  const head = new THREE.Mesh(
    headGeometry,
    headMaterial
  );

  const headBaseY =
    config.bodyRadius * 2 +
    config.headRadius * 0.65;

  head.position.y = headBaseY;

  head.castShadow = true;

  // two eyes 

  // Eyes material
const eyeMaterial = new THREE.MeshStandardMaterial({
  color: 0x080808,
  roughness: 0,
});

// Eye geometry
const eyeGeometry = new THREE.SphereGeometry(
  0.09,  // radius
  24,
  24
);

// Left eye
const leftEye = new THREE.Mesh(
  eyeGeometry,
  eyeMaterial
);

// Right eye
const rightEye = new THREE.Mesh(
  eyeGeometry,
  eyeMaterial
);

// Stretch the eyes vertically
leftEye.scale.set(0.65, 1.5, 1.5);
rightEye.scale.set(0.65, 1.5, 1.5);

// Position the eyes on the front of the head
leftEye.position.set(-0.2, 0.18, 0.48);
rightEye.position.set(0.2, 0.18, 0.48);

// Attach eyes to head
head.add(leftEye);
head.add(rightEye);
  // Add children to the Group
  group.add(body);
  group.add(head);

  // Return everything we might need
  return {
    group,
    body,
    head,
    headBaseY,
  };
}
