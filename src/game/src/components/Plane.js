import { h, shallowRef } from "vue";

import * as THREE from "three";

import { usePlane } from "vue-cannon/hooks/useCannon.js";
import Mesh from "vue-three-fiber/components/Mesh.js";

export default {
  props: {
    position: {
      type: THREE.Vector3,
      required: true,
    },
    rotation: {
      type: THREE.Euler,
      required: true,
    },
  },
  setup(props) {
    const plane = shallowRef(null);

    usePlane(() => ({ mass: 0 }), plane);

    const geometry = new THREE.PlaneGeometry(20, 4);
    const material = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
    });

    return () =>
      h(Mesh, {
        meshRef: plane,
        position: props.position,
        rotation: props.rotation,
        geometry,
        material,
      });
  },
};
