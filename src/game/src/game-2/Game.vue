<template>
  <renderer v-bind="renderer">
    <physics v-bind="physics">
      <scene></scene>
    </physics>
  </renderer>
</template>

<script>
import Renderer from "vue-three-fiber/components/Renderer.js";
import Physics from "vue-cannon/components/Physics.js";

import Scene from "./components/Scene.vue";
import Cubes from "./components/Cubes.vue";

export default {
  components: { Physics, Renderer, Scene, Cubes },
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
    };
  },
};
</script>
