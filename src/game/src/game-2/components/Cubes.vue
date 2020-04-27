<template>
  <object3-d :ref="setref" :value="value"></object3-d>
</template>

<script>
import { h, shallowRef, computed, watchEffect } from "vue";

import * as THREE from "three";

import Object3D from "vue-three-fiber/components/Object3D.js";
import useFrame from "vue-three-fiber/hooks/useFrame.js";

import { useBox } from "vue-cannon/hooks/useCannon.js";

export default {
  components: { Object3D },
  props: {
    number: {
      type: Number,
      default: 100,
    },
    position: {
      type: Array,
      default: [0, 0, -10],
    },
  },
  setup(props) {
    const position = computed(() => new THREE.Vector3(...props.position));

    const getPosition = () =>
      new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() * 2,
        Math.random() - 0.5
      ).add(position.value);

    const [box, bodies] = useBox(() => ({
      mass: 1,
      position: getPosition(),
    }));

    useFrame(() => {
      if (bodies.value && bodies.value.length) {
        const body =
          bodies.value[Math.floor(Math.random() * bodies.value.length)];
        body.position.copy(getPosition());
        body.velocity.set(0, 0, 0);
        body.wakeUp();
      }
    });

    return {
      setref: (el) => (box.value = el && el.value),
      value: new THREE.InstancedMesh(
        new THREE.InstancedBufferGeometry().copy(
          new THREE.BoxBufferGeometry(0.5, 0.5, 0.5)
        ),
        new THREE.MeshLambertMaterial({
          vertexColors: THREE.VertexColors,
        }),
        props.number
      ),
      dispose: true,
    };
  },
};
</script>
