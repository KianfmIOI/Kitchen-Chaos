export function createMovementCheck({bounds})
{
    function canMove({playerPos, movementCircle})
    {
    const radius = movementCircle.userData.radius;
    const canX = playerPos.x - radius >= bounds.min.x &&
      playerPos.x + radius <= bounds.max.x 
    const canZ = playerPos.z - radius >= bounds.min.z &&
      playerPos.z + radius <= bounds.max.z
    return {x:canX,z:canZ};
    }
    return {canMove};
}