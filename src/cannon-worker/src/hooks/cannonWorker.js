import * as CANNON from "../../../../web_modules/cannon-es.js";

import { createBody as _createBody } from "vue-cannon/src/utils/describeMesh.js";
import { computeMatrix } from "vue-cannon/src/utils/computeMatrix.js";

const bodies = {};
let _world = null;

export { computeMatrix };

export function createBody(...args) {
  const body = _createBody(...args);
  bodies[body.id] = body;
  return body.id;
}

export function setup(worldOptions) {
  _world = new CANNON.World({
    gravity: new CANNON.Vec3().set(
      ...(worldOptions.gravity ?? [0, -10, 0])
    ),
    broadphase:
      worldOptions.broadphase === "NaiveBroadphase"
        ? new CANNON.NaiveBroadphase()
        : new CANNON.SAPBroadphase(),
    allowSleep: worldOptions.allowSleep ?? true,
  });
}

export const world = {
  broadphase: {
    set axisIndex(value) {
      _world.broadphase.axisIndex = value;
    },
  },
  defaultContactMaterial: {
    set contactEquationStiffness(value) {
      _world.defaultContactMaterial.contactEquationStiffness = value;
    },
    set contactEquationRelaxation(value) {
      _world.defaultContactMaterial.contactEquationRelaxation = value;
    },
    set contactEquationRegularizationTime(value) {
      _world.defaultContactMaterial.contactEquationRegularizationTime = value;
    }
  },
  solver: {
    set tolerance(value) {
      _world.solver.tolerance = value;
    },
    set iterations(value) {
      _world.solver.iterations = value;
    },
  },
  add(id) {
    return _world.add(bodies[id]);
  },
  remove(id) {
    return _world.remove(bodies[id]);
  },
  step(...args) {
    return _world.step(...args);
  },
  getBodyById(id, matrix = false) {
    return matrix
      ? computeMatrix(bodies[id])
      : {
          position: bodies[id].position,
          quaternion: bodies[id].quaternion,
        };
  },
};
