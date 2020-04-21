import * as THREE from "three";
import { createApp, h, ref, watch } from "vue";

import Renderer from "vue-three-fiber/components/Renderer.js";

import CannonDebugger from "vue-cannon/utils/CannonDebugger.js";
import Physics from "vue-cannon/components/Physics.js";

import Player from "game/components/Player.js";
import Cubes from "game/components/Cubes.js";
import Box from "game/components/Box.js";
import Plane from "game/components/Plane.js";

const debug = false;

const App = {
  setup() {
    const renderContextRef = ref({});
    watch(renderContextRef, () => {
      const { camera } = renderContextRef.value;

      camera.position.set(0, 0.5, 4);
      camera.lookAt(0, 0, 0);
    });

    const physicsContextRef = ref({});
    watch([renderContextRef, physicsContextRef], () => {
      const { scene } = renderContextRef.value;
      const { world, frameCallbacks, isWorker } = physicsContextRef.value;

      if (world) {
        world.solver.tolerance = 0.001;
        world.solver.iterations = 5;
        world.broadphase.axisIndex = 0;
        world.defaultContactMaterial.contactEquationStiffness = 1e6;
        world.defaultContactMaterial.contactEquationRelaxation = 5;
        world.defaultContactMaterial.contactEquationRegularizationTime = 3;
      }

      if (world && !isWorker && debug) {
        const cannonDebugger = new CannonDebugger(scene, world);
        frameCallbacks.add(() => cannonDebugger.update());
      }
    });

    return () =>
      h(Renderer, { contextRef: renderContextRef, gl: { alpha: true } }, () =>
        h(Physics, { contextRef: physicsContextRef, useWorker: false }, () => [
          h(Box, { position: new THREE.Vector3(-1, 5, 0) }),
          h(Box, { position: new THREE.Vector3(1, 1, 0) }),
          h(Cubes, { number: 2 }),
          h(Player, {
            position: new THREE.Vector3(0, 1, 0),
          }),
          h(Plane, {
            position: new THREE.Vector3(0, -2, 0),
            rotation: new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"),
          }),
        ])
      );
  },
};

createApp(App).mount("#app");
