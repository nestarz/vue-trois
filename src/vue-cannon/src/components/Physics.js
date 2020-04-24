import * as CANNON from "cannon-es";
import { h, onMounted, provide, watchEffect, shallowReactive } from "vue";

import cannonWorker, {
  checkSupport,
} from "cannon-worker/hooks/useCannonWorker.js";
import { createBody } from "vue-cannon/utils/describeMesh.js";
import { computeMatrix } from "vue-cannon/utils/computeMatrix.js";

export const PhysicsContextSymbol = Symbol("PhysicsContextSymbol");

const init = ({
  gravity,
  tolerance,
  step,
  iterations,
  broadphase,
  allowSleep,
  axisIndex,
  defaultContactMaterial,
}) => {
  const world = new CANNON.World();
  const broadphases = {
    Naive: CANNON.NaiveBroadphase,
    SAP: CANNON.SAPBroadphase,
  };
  world.allowSleep = allowSleep;
  world.gravity.set(gravity[0], gravity[1], gravity[2]);
  world.solver.tolerance = tolerance;
  world.solver.iterations = iterations;
  world.broadphase = new (broadphases[broadphase] || broadphases.Naive)(world);
  world.broadphase.axisIndex = axisIndex ?? 0;
  Object.assign(world.defaultContactMaterial, defaultContactMaterial);
  // config.step = step;
  return world;
};

export default {
  props: {
    contextRef: Object,
    FPS: { type: Number, default: 60 },
    useWorker: { type: Boolean, default: false },
    step: { type: Number, default: 1 / 60 },
    tolerance: { type: Number, default: 0.001 },
    iterations: { type: Number, default: 5 },
    allowSleep: { type: Boolean, default: true },
    axisIndex: { type: Number, default: 0 },
    size: { type: Number, default: 1000 },
    gravity: {
      type: Array,
      default: [0, -10, 0],
      validator: (arr) => arr.length === 3 && arr.every((n) => !isNaN(n)),
    },
    broadphase: {
      type: String,
      default: "Naive",
      validator: (str) => ["Naive", "SAP"].includes(str),
    },
    defaultContactMaterial: {
      type: Object,
      default: {
        contactEquationStiffness: 1e6,
      },
      validator: (object) =>
        Object.entries(object).every(([key, value]) => {
          const validKey = [
            "friction",
            "restitution",
            "contactEquationStiffness",
            "contactEquationRelaxation",
            "contactEquationRegularizationTime",
            "frictionEquationStiffness",
            "frictionEquationRelaxation",
          ].includes(key);
          const validValue = !isNaN(value);
          if (!validKey) console.warn(key);
          if (!validValue) console.warn(value);
          return validKey && validValue;
        }),
    },
  },
  setup(props, { slots }) {
    const context = shallowReactive({
      world: null,
      isWorker: null,
      frameCallbacks: new Set(),
      createBody,
      computeMatrix,
    });
    provide(PhysicsContextSymbol, context);

    const workerSupport = checkSupport();
    if (props.useWorker && workerSupport) {
      cannonWorker().then((worker) => {
        worker.setup(props);
        context.world = worker.world;
        context.createBody = worker.createBody;
        context.computeMatrix = worker.computeMatrix;
        context.isWorker = true;
      });
    } else {
      if (props.useWorker && !workerSupport) {
        console.warn("Worker Module not supported.");
      }

      context.world = init(props);
      context.isWorker = false;
    }

    watchEffect(() => {
      if (props.contextRef && context.world) props.contextRef.value = context;
    });

    onMounted(function animate() {
      requestAnimationFrame(animate);
      if (context.world) {
        context.world.step(props.step);
        context.frameCallbacks.forEach((callback) => callback());
      }
    });

    return () =>
      context.world ? h("div", slots.default && slots.default()) : null;
  },
};
