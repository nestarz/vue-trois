import * as CANNON from "cannon-es";
import { h, onMounted, provide, watchEffect, shallowReactive } from "vue";

import cannonWorker, {
  checkSupport,
} from "cannon-worker/hooks/useCannonWorker.js";
import { createBody } from "vue-cannon/utils/computeBodyFromMesh.js";
import { computeMatrix } from "vue-cannon/utils/computeMatrix.js";

export const PhysicsContextSymbol = Symbol("PhysicsContextSymbol");

export default {
  props: {
    contextRef: Object,
    FPS: { type: Number, default: 60 },
    useWorker: { type: Boolean, default: true },
    worldOptions: {
      type: Object,
      default: () => ({
        broadphase: "SAPBroadphase",
        gravity: [0, -10, 0],
        allowSleep: true,
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
        worker.setup(props.worldOptions);
        context.world = worker.world;
        context.createBody = worker.createBody;
        context.computeMatrix = worker.computeMatrix;
        context.isWorker = true;
      });
    } else {
      if (props.useWorker && !workerSupport) {
        console.warn("Worker Module not supported.");
      }

      context.world = new CANNON.World({
        gravity: new CANNON.Vec3().set(
          ...(props.worldOptions.gravity ?? [0, -10, 0])
        ),
        allowSleep: props.worldOptions.allowSleep ?? true,
        broadphase:
          props.worldOptions.broadphase === "NaiveBroadphase"
            ? new CANNON.NaiveBroadphase()
            : new CANNON.SAPBroadphase(),
      });
      context.isWorker = false;
    }

    watchEffect(() => {
      if (props.contextRef && context.world) props.contextRef.value = context;
    });

    onMounted(function animate() {
      requestAnimationFrame(animate);
      if (context.world) {
        context.world.step(1 / props.FPS);
        context.frameCallbacks.forEach((callback) => callback());
      }
    });

    return () =>
      context.world ? h("div", slots.default && slots.default()) : null;
  },
};
