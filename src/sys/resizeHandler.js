export function setupResizeHandler(camera, renderer, maxPixelRatio) {
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onResize);

  // Return a cleanup function
  return () => {
    window.removeEventListener("resize", onResize);
  };
}
