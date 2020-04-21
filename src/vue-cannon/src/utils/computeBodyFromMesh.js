import * as THREE from "/web_modules/three.js";
import * as CANNON from "/web_modules/cannon-es.js";

export const createBody = (
  type = CANNON.Box,
  { size, scale, position, quaternion, center },
  options = {}
) => {
  const box =
    type === CANNON.Sphere
      ? new CANNON.Sphere((Math.max(size[0], size[1]) * scale[0]) / 2)
      : type === CANNON.Plane
      ? new CANNON.Plane()
      : new CANNON.Box(new CANNON.Vec3().set(...size).scale(scale[0] / 2));

  const body = new CANNON.Body({
    mass: 1,
    ...options,
    quaternion: new CANNON.Quaternion().set(
      ...(options.quaternion ?? quaternion)
    ),
    position: new CANNON.Vec3().set(...(options.position ?? position)),
  });

  body.sleepSpeedLimit = options.sleepSpeedLimit ?? 0.5;
  body.sleepTimeLimit = options.sleepSpeedLimit ?? 1;
  
  body.addShape(
    box,
    new CANNON.Vec3(center[0], center[1] * scale[1], center[2])
  );
  return body;
};

export const describeMesh = (mesh) => {
  mesh.updateMatrixWorld();
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  return {
    scale: mesh.scale.toArray(),
    size: mesh.geometry.boundingBox.getSize(new THREE.Vector3()).toArray(),
    position: new THREE.Vector3()
      .setFromMatrixPosition(mesh.matrixWorld)
      .toArray(),
    quaternion: mesh.quaternion.toArray(),
    center: mesh.geometry.boundingSphere.center.toArray(),
  };
};
