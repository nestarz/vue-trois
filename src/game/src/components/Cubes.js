import { h, shallowRef } from "vue";

import * as THREE from "three";
import niceColors from "nice-color-palettes";

import Mesh from "vue-three-fiber/components/Mesh.js";
import useFrame from "vue-three-fiber/hooks/useFrame.js";

import { useBox } from "vue-cannon/hooks/useCannon.js";

export default {
  props: {
    number: {
      type: Number,
      default: 100,
    },
    position: {
      type: THREE.Vector3,
      default: new THREE.Vector3(0, 1, -50),
    },
  },
  setup(props) {
    const newPos = () => [
      props.position.x + Math.random() - 0.5,
      props.position.y + Math.random() * 2,
      props.position.z + Math.random() - 0.5,
    ];

    const bodyConfigFn = () => ({
      mass: 1,
      position: newPos(),
    });
    const cubesRef = shallowRef(null);
    const bodies = useBox(bodyConfigFn, cubesRef);

    let t = Date.now();
    useFrame(() => {
      if (
        bodies.value &&
        bodies.value.length &&
        Date.now() - t > 1000 / bodies.value.length
      ) {
        const pos = newPos();
        const body =
          bodies.value[Math.floor(Math.random() * bodies.value.length)];
        body.position.set(pos[0], Math.random() * pos[1], pos[2]);
        body.velocity.set(0, 0, 0);
        body.wakeUp();
        t = Date.now();
      }
    });

    const colors = new Float32Array(props.number * 3);
    const color = new THREE.Color();
    for (let i = 0; i < props.number; i++)
      color
        .set(niceColors[17][Math.floor(Math.random() * 5)])
        .convertSRGBToLinear()
        .toArray(colors, i * 3);
    const geometry = new THREE.InstancedBufferGeometry()
      .copy(new THREE.BoxBufferGeometry(0.5, 0.5, 0.5))
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
