import { h, shallowRef } from "vue";

import * as THREE from "three";
import niceColors from "nice-color-palettes";

import useFrame from "vue-three-fiber/hooks/useFrame.js";
import Mesh from "vue-three-fiber/components/Mesh.js";

import { useBox } from "vue-cannon/hooks/useCannon.js";

export default {
  props: {
    number: {
      type: Number,
      default: 100,
    },
  },
  setup(props) {
    const colors = new Float32Array(props.number * 3);
    const color = new THREE.Color();
    for (let i = 0; i < props.number; i++)
      color
        .set(niceColors[17][Math.floor(Math.random() * 5)])
        .convertSRGBToLinear()
        .toArray(colors, i * 3);

    const cubesRef = shallowRef(null);
    useBox(
      () => ({
        mass: 1,
        position: [Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5],
      }),
      cubesRef
    );

    const geometry = new THREE.InstancedBufferGeometry()
      .copy(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1))
      .setAttribute("color", new THREE.InstancedBufferAttribute(colors, 3));
    const material = new THREE.MeshLambertMaterial({
      vertexColors: THREE.VertexColors,
    });

    return () =>
      h(Mesh, {
        meshRef: cubesRef,
        count: props.number,
        geometry,
        material,
      });
  },
};
