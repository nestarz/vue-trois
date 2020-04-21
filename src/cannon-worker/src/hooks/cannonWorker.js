import * as THREE from "/web_modules/three.js";
import * as CANNON from "/web_modules/cannon-es.js";
import { createBody as _createBody } from "/src/vue-cannon/src/utils/computeBodyFromMesh.js";

const bodies = {};
let _world = null;

export function createBody(...args) {
  const body = _createBody(...args);
  bodies[body.id] = body;
  return body.id;
}

export function setup(worldOptions) {
  _world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0),
    broadphase: new CANNON.SAPBroadphase(),
    allowSleep: true,
    // ...worldOptions,
  });

  _world.broadphase.axisIndex = 0;
  _world.defaultContactMaterial.contactEquationStiffness = 1e6;
  _world.defaultContactMaterial.contactEquationRelaxation = 5;
  _world.solver.tolerance = 0.001;
  _world.solver.iterations = 5;
}

const temp = new THREE.Object3D();
const computeMatrix = ({ position, quaternion }) => {
  temp.position.copy(position);
  temp.quaternion.copy(quaternion);
  temp.updateMatrix();
  return temp.matrix.toArray();
};
export const world = {
  add(id) {
    return _world.add(bodies[id]);
  },
  remove(id) {
    return _world.remove(bodies[id]);
  },
  step(...args) {
    return _world.step(...args);
  },
  getBodyById(id, withMatrix = false) {
    return {
      position: bodies[id].position,
      quaternion: bodies[id].quaternion,
      matrix: withMatrix ? computeMatrix(bodies[id]) : null,
    };
  },
};
