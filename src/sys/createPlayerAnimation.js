
export function createPlayerAnimation({ head, config, headBaseY }) {

  let elapsedTime = 0;

  function update(delta, isMoving) {

    elapsedTime += delta;

    if (!config.bobbing) {
      head.position.y = headBaseY;
      head.rotation.z = 0;
      return;
    }

    // Select animation parameters
    const amplitude = isMoving
      ? config.moveAmplitude
      : config.idleAmplitude;

    const frequency = isMoving
      ? config.moveFrequency
      : config.idleFrequency;

    // Calculate vertical movement
    const bob = Math.sin(elapsedTime * frequency) * amplitude;

    head.position.y = headBaseY + bob;

  }

  return { update };
}
