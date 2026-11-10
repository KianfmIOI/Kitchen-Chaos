import GUI from "lil-gui";

export function createDebugGUI({
  settings,
  camera,
  controls,
  ground,
  player,
  bbox,
  kitchen,
  kitchenSettings,
}) {
  // Create the GUI
  const gui = new GUI({
    title: "Kitchen Chaos",
  });

  // -------------------------
  // Ground FOLDER
  // -------------------------
  const groundFoler = gui.addFolder("Ground");
  groundFoler
    .addColor(settings.ground, "color")
    .name("ground Color")
    .onChange((v) => {
      ground.mat.color.set(v);
    });
  // -------------------------
  // KITCHEN FOLDER
  // -------------------------

  const kitchenFolder = gui.addFolder("Kitchen");

  const debugFolder = kitchenFolder.addFolder("Debug");

  debugFolder
    .add(kitchenSettings.debug, "showTriggers")
    .name("Show Interaction Triggers")
    .onChange((value) => {
      kitchen.interactables.forEach((trigger) => {
        trigger.material.opacity = value ? 0.25 : 0;
      });
    });

  gui.close();
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

  playerFolder.close();
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

  animationFolder.close();
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

  cameraFolder.close();
  // -------------------------
  // BOUNDING BOXES FOLDER
  // -------------------------

  const BBF = gui.addFolder("BBOX");

  const config = settings.movementArea;
  // VISIBILITY
  BBF.add(config, "visible")
    .name("Show Bounding Box")
    .onChange((value) => (bbox.helper.visible = value));

  // Color
  BBF.addColor(config, "color")
    .name("Color")
    .onChange((value) => bbox.helper.material.color.set(value));
  // MIN
  const minFolder = BBF.addFolder("Min");

  minFolder
    .add(config.min, "x", -10, 10, 0.1)
    .onChange((value) => (bbox.box.min.x = value));

  minFolder
    .add(config.min, "y", -10, 10, 0.1)
    .onChange((value) => (bbox.box.min.y = value));

  minFolder
    .add(config.min, "z", -10, 10, 0.1)
    .onChange((value) => (bbox.box.min.z = value));

  // MAX
  const maxFolder = BBF.addFolder("Max");

  maxFolder
    .add(config.max, "x", -10, 10, 0.1)
    .onChange((value) => (bbox.box.max.x = value));

  maxFolder
    .add(config.max, "y", -10, 10, 0.1)
    .onChange((value) => (bbox.box.max.y = value));

  maxFolder
    .add(config.max, "z", -10, 10, 0.1)
    .onChange((value) => (bbox.box.max.z = value));

  BBF.close();
  // -------------------------
  // SAVE / LOAD SETTINGS
  // -------------------------

  const savedSettings = gui.save();

  const presetFolder = gui.addFolder("Presets");

  presetFolder
    .add(
      {
        save: () => {
          localStorage.setItem(
            "kitchenChaosSettings",
            JSON.stringify(gui.save()),
          );

          console.log("Settings saved!");
        },
      },
      "save",
    )
    .name("Save Settings");

  presetFolder
    .add(
      {
        load: () => {
          const saved = localStorage.getItem("kitchenChaosSettings");

          if (saved) {
            gui.load(JSON.parse(saved));
            console.log("Settings loaded!");
          }
        },
      },
      "load",
    )
    .name("Load Settings");
  // Return GUI instance
  return gui;
}
