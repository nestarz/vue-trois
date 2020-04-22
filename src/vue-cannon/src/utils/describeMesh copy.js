import * as THREE from "/web_modules/three.js";
import * as CANNON from "/web_modules/cannon-es.js";

const prepare = (options) =>
  Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      key,
      Array.isArray(value)
        ? value.length === 3
          ? new CANNON.Vec3(...value)
          : value.length === 4
          ? new CANNON.Quaternion(...value)
          : value
        : value,
    ])
  );

export const createBody = (type, description, options = {}) => {
  const { size, scale, position, quaternion, center } = prepare(description);

  const body = new CANNON.Body({
    mass: 1,
    sleepSpeedLimit: 0.5,
    sleepTimeLimit: 1,
    ...{ position, quaternion },
    ...prepare(options),
  });

  const shape = {
    Sphere: () => new CANNON.Sphere((Math.max(size.x, size.y) * scale.z) / 2),
    Plane: () => new CANNON.Plane(),
    Box: () => new CANNON.Box(size.scale(scale.x / 2)),
  };

  const shapePositon = new CANNON.Vec3(center.x, center.y * scale.y, center.z);
  body.addShape(shape[type](), shapePositon);
  return body;
};

export const describeMesh = (mesh) => {
  mesh.updateMatrixWorld();
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  return {
    scale: mesh.scale.toArray(),
    size: mesh.geometry.boundingBox.getSize(new THREE.Vector3()).toArray(),
    center: mesh.geometry.boundingSphere.center.toArray(),
    position: new THREE.Vector3()
      .setFromMatrixPosition(mesh.matrixWorld)
      .toArray(),
    quaternion: mesh.quaternion.toArray(),
  };
};

export const describeMesh1 = (mesh) => {
  mesh.updateMatrixWorld();
  const bbox = new THREE.Box3().setFromObject(mesh);
  
  return {
    scale: mesh.scale.toArray(),
    size: bbox.getSize(new THREE.Vector3()).toArray(),
    center: bbox.getCenter(new THREE.Vector3()).toArray(),
    position: new THREE.Vector3()
      .setFromMatrixPosition(mesh.matrixWorld)
      .toArray(),
    quaternion: mesh.quaternion.toArray(),
  };
};
