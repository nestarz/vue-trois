# Vue Trois

- [x] vue-three-fiber
- [x] vue-cannon
- [x] cannon-worker
- [x] game

## Usage Example

Define a component

```js
import { h, watch, shallowRef } from "vue";

import * as THREE from "three";

import Object3D from "vue-three-fiber/components/Object3D.js";
import { useLoader } from "vue-three-fiber/hooks/useLoader.js";

import { useSphere, useBox, usePlane } from "vue-cannon/hooks/useCannon.js";

const Ball = {
  setup() {
    const ball = shallowRef();
    useSphere(() => ({ mass: 1, position: [0, 5, 0] }), ball);

    const { results: map } = useLoader(THREE.TextureLoader, earthImg);
    watch(map, () => {
      if (ball.value.material.map) ball.value.material.map.dispose();
      ball.value.material.map = map.value;
      ball.value.material.needsUpdate = true;
    });

    return () =>
      h(Object3D, {
        objectRef: ball,
        value: new THREE.Mesh(
          new THREE.SphereBufferGeometry(0.5, 64, 64),
          new THREE.MeshStandardMaterial()
        ),
      });
  },
};
```

Wrap it in a scene

```js
import * as THREE from "three";
import { createApp, h, ref, watch } from "vue";

import Renderer from "vue-three-fiber/components/Renderer.js";
import Physics from "vue-cannon/components/Physics.js";
import Box from "game/components/Box.js";

const App = {
  setup() {
    const physicsContextRef = ref({});
    watch(physicsContextRef, () => {
      const { world } = physicsContextRef.value;

      if (world) {
        world.solver.tolerance = 0.001;
        world.solver.iterations = 5;
        world.broadphase.axisIndex = 0;
        world.defaultContactMaterial.contactEquationStiffness = 1e6;
        world.defaultContactMaterial.contactEquationRelaxation = 5;
        world.defaultContactMaterial.contactEquationRegularizationTime = 3;
      }
    });

    return () =>
      h(Renderer, { contextRef: renderContextRef, gl: { alpha: true } }, () =>
        h(Physics, { contextRef: physicsContextRef, useWorker: false }, () => [
          h(Ball),
        ])
      );
  },
};

createApp(App).mount("#app");
```
