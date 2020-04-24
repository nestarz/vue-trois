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

```html
<div id="app">
  <renderer v-bind="renderer">
    <physics v-bind="physics">
      <ball v-for="ball in balls" v-bind="ball"></ball>
    </physics>
  </renderer>
<div>

<script>
import { createApp } from "vue";
import * as THREE from "three";

import Renderer from "vue-three-fiber/components/Renderer.js";
import Physics from "vue-cannon/components/Physics.js";
import Ball from "game/components/Ball.js";

const App = {
  components: { Physics, Renderer, Ball },
  setup() {
    return {
      renderer: {
        gl: { alpha: true },
      },
      physics: {
        tolerance: 0.001,
        iterations: 5,
        axisIndex: 0,
        defaultContactMaterial: {
          contactEquationStiffness: 1e6,
          contactEquationRelaxation: 5,
          contactEquationRegularizationTime: 3,
        },
      },
      balls: [
        { position: new THREE.Vector3(-1, 5, 0) },
        { position: new THREE.Vector3(1, 5, 0) },
      ],
    };
  },
};

createApp(App).mount("#app");
<script>
```
