import * as CANNON from "cannon-es";
import { h, onMounted, provide, watchEffect, shallowReactive } from "vue";

import cannonWorker from "cannon-worker/hooks/useCannonWorker.js";
import { createBody } from "vue-cannon/utils/computeBodyFromMesh.js";

export const PhysicsContextSymbol = Symbol("PhysicsContextSymbol");

export default {
  props: {
    contextRef: Object,
    FPS: { type: Number, default: 60 },
    useWorker: { type: Boolean, default: true },
    worldOptions: {
      type: Object,
      default: () => ({
        broadphase: new CANNON.NaiveBroadphase(),
        gravity: new CANNON.Vec3(0, -9.82, 0),
        allowSleep: true,
      }),
    },
  },
  setup(props, { slots }) {
    const context = shallowReactive({
      world: null,
      isWorker: false,
      frameCallbacks: new Set(),
    });
    provide(PhysicsContextSymbol, context);

    if (props.useWorker) {
      cannonWorker().then((worker) => {
        worker.setup({
          allowSleep: props.worldOptions.allowSleep,
          gravity: props.worldOptions.gravity,
        });
        context.world = worker.world;
        context.createBody = worker.createBody;
        context.isWorker = true;
      });
    } else {
      context.world = new CANNON.World(props.worldOptions);
      context.createBody = createBody;
    }

    watchEffect(() => {
      if (props.contextRef) props.contextRef.value = context;
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
