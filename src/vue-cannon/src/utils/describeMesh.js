import * as THREE from "/web_modules/three.js";
import * as CANNON from "/web_modules/cannon-es.js";

const convert = (value) =>
  Array.isArray(value)
    ? value.length === 3
      ? new CANNON.Vec3(...value)
      : value.length === 4
      ? new CANNON.Quaternion(...value)
      : value
    : value;

const prepare = (options) =>
  Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, convert(value)])
  );

export const createBody = (type, description, options = {}) => {
  const { size, scale, position, quaternion } = prepare(description);

  const { args, ...bodyOptions } = prepare(options);
  const body = new CANNON.Body({
    mass: 1,
    sleepSpeedLimit: 0.5,
    sleepTimeLimit: 1,
    ...{ position, quaternion },
    ...bodyOptions,
  });
  
  const shape = {
    Sphere: () =>
      new CANNON.Sphere(args ?? (Math.max(size.x, size.y) * scale.z) / 2),
    Plane: () => new CANNON.Plane(args ?? null),
    Box: () => new CANNON.Box(args ?? size.scale(scale.x / 2)),
  };

  // const shapePositon = new CANNON.Vec3(center.x, center.y * scale.y, center.z);
  body.addShape(shape[type]());
  return body;
};

export const describeMesh = (mesh) => {
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
