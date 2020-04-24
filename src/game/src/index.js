import { createApp } from "vue";
import * as THREE from "three";

import Renderer from "vue-three-fiber/components/Renderer.js";

import Physics from "vue-cannon/components/Physics.js";

import Player from "game/components/Player.js";
import Cubes from "game/components/Cubes.js";
import Box from "game/components/Box.js";
import Plane from "game/components/Plane.js";
import PingPong from "game/components/PingPong.js";

const App = {
  components: { Physics, Renderer, Player, Plane, Cubes, Box, PingPong },
  template: `<renderer v-bind="renderer">
    <physics v-bind="physics">
      <cubes v-bind="cubes"></cubes>
      <box v-for="box in boxes" v-bind="box"></box>
      <player v-bind="player"></player>
      <ping-pong></ping-pong>
      <plane v-bind="plane"></plane>
    </physics>
  </renderer>`,
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
      player: { position: new THREE.Vector3(0, 10, 0) },
      boxes: [
        { position: new THREE.Vector3(-1, 5, 0) },
        { position: new THREE.Vector3(1, 5, 0) },
      ],
      cubes: {
        number: 3,
      },
      plane: {
        position: new THREE.Vector3(0, -2, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"),
        scale: new THREE.Vector2(10, 10),
      },
    };
  },
};

createApp(App).mount("#app");
