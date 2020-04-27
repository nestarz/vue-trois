<template>
  <object3-d :ref="setref" :value="value" v-if="value"></object3-d>
</template>

<script>
import { h, shallowRef, computed, watchEffect, inject } from "vue";

import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";
import Object3D from "vue-three-fiber/components/Object3D.js";
import useFrame from "vue-three-fiber/hooks/useFrame.js";
import { useLoader } from "vue-three-fiber/hooks/useLoader.js";

import { useBox } from "vue-cannon/hooks/useCannon.js";
import { useThirdPersonControl } from "game/hooks/useThirdPersonControl.js";

export default {
  components: { Object3D },
  props: {
    number: {
      type: Number,
      default: 25,
    },
    position: {
      type: Array,
      default: [0, -10, 0],
    },
  },
  setup(props) {
    const model = "/src/game/assets/models/amelie.stl";
    const { results: geometry } = useLoader(STLLoader, model);
    const position = computed(() => new THREE.Vector3(...props.position));

    const [box, bodies] = useBox((i) => ({
      mass: 0,
      position: new THREE.Vector3((props.number / 2 - i) * 3, 0, 0).add(
        position.value
      ),
    }));

    useFrame((t) => {
      let i = 0;
      for (const body of bodies.value) {
        const sin = Math.sin(t / 1000 - i * 100) / 100;
        const cos = Math.cos(t / 10000 + i * 200) / 100;
        body.position = body.position.vadd(new THREE.Vector3(sin, -sin, cos));
        i++;
      }
    });

    const scene = inject(CanvasContextSymbol).scene;
    const color = "black";
    const density = 0.01;
    scene.fog = new THREE.FogExp2(color, density);
    scene.background = new THREE.Color(color);

    useThirdPersonControl({
      camera: inject(CanvasContextSymbol).camera,
      target: box,
      radius: 200,
      phi: Math.PI / 2,
      theta: 0,
      min: 100,
      max: 300,
    });

    const mesh = computed(() => {
      if (geometry.value) {
        const mesh = new THREE.InstancedMesh(
          new THREE.InstancedBufferGeometry().copy(geometry.value),
          new THREE.MeshBasicMaterial({
            // vertexColors: THREE.VertexColors,
            color: "white",
          }),
          props.number
        );
        mesh.scale.set(10, 10, 10);
        mesh.rotateX(-Math.PI / 4);
        return mesh;
      }
    });

    return {
      setref: (el) => (box.value = el && el.value),
      value: mesh,
      dispose: true,
    };
  },
};
</script>
