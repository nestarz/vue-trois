import * as THREE from "three";

export const getLocalDirection = (
  { position, quaternion },
  direction = { x: 0, y: 0, z: 1 }
) => {
  const transform = new THREE.Matrix4();
  transform.compose(
    new THREE.Vector3().copy(position),
    new THREE.Quaternion().copy(quaternion),
    new THREE.Vector3(1, 1, 1)
  );

  const directionWorld = new THREE.Vector4(
    direction.x,
    direction.y,
    direction.z,
    0
  );

  const directionObject4 = directionWorld
    .clone()
    .applyMatrix4(transform)
    .normalize();

  const directionObject = new THREE.Vector3().set(
    directionObject4.x,
    directionWorld.y,
    directionObject4.z
  );
  return directionObject;
};
