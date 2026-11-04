import GUI from "lil-gui";

export function createDebugGUI({ settings, camera, controls, player }) {
  // Create the GUI
  const gui = new GUI({
    title: "Kitchen Chaos",
  });

  // -------------------------
  // PLAYER FOLDER
  // -------------------------

  const playerFolder = gui.addFolder("Player");

  playerFolder.add(settings.player, "speed", 0, 50, 1).name("Movement Speed");

  playerFolder
    .add(settings.player, "rotationSpeed", 1, 20, 0.5)
    .name("Rotation Speed");

  playerFolder
    .addColor(settings.player, "bodyColor")
    .name("Body Color")
    .onChange((value) => {
      player.body.material.color.set(value);
    });

  playerFolder
    .addColor(settings.player, "headColor")
    .name("Head Color")
    .onChange((value) => {
      player.head.material.color.set(value);
    });

  // -------------------------
  // ANIMATION FOLDER
  // -------------------------

  const animationFolder = playerFolder.addFolder("Animation");

  animationFolder
    .add(settings.player.animation, "bobbing")
    .name("Enable Bobbing");

  animationFolder
    .add(settings.player.animation, "idleAmplitude", 0, 0.2, 0.05)
    .name("Idle Amplitude");

  animationFolder
    .add(settings.player.animation, "idleFrequency", 0, 10, 0.1)
    .name("Idle Frequency");

  animationFolder
    .add(settings.player.animation, "moveAmplitude", 0, 0.5, 0.05)
    .name("Walking Amplitude");

  animationFolder
    .add(settings.player.animation, "moveFrequency", 0, 20, 0.1)
    .name("Walking Frequency");

  // -------------------------
  // CAMERA FOLDER
  // -------------------------

  const cameraFolder = gui.addFolder("Camera");

  cameraFolder
    .add(camera, "fov", 0, 100, 1)
    .name("Field of View")
    .onChange(() => {
      camera.updateProjectionMatrix();
    });

  const positionFolder = cameraFolder.addFolder("Position");

  positionFolder
    .add(camera.position, "x", -50, 50, 0.1)
    .name("X")
    .onChange(() => controls.update());

  positionFolder
    .add(camera.position, "y", 0, 60, 0.1)
    .name("Y")
    .onChange(() => controls.update());

  positionFolder
    .add(camera.position, "z", -50, 50, 0.1)
    .name("Z")
    .onChange(() => controls.update());

  // -------------------------
  // CAMERA TARGET FOLDER
  // -------------------------

  const targetFolder = cameraFolder.addFolder("Target");

  targetFolder.add(controls.target, "x", -20, 20, 1).name("X");

  targetFolder.add(controls.target, "y", 0, 20, 1).name("Y");

  targetFolder.add(controls.target, "z", -20, 20, 1).name("Z");

  // Return GUI instance
  return gui;
}
