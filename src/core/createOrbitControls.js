import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createOrbitControls(camera, canvas, config) {
  const controls = new OrbitControls(camera, canvas);

  controls.enableDamping = true;
  controls.target.set(...config.target);
  controls.update();

  return controls;
}
