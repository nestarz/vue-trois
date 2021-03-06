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
    scale: {
      type: THREE.Vector2,
      default: () => new THREE.Vector2(20, 20),
    },
    rotation: {
      type: THREE.Euler,
      required: true,
    },
  },
  setup(props) {
    const [plane] = usePlane(() => ({ mass: 0 }));

    const geometry = new THREE.PlaneGeometry(props.scale.x, props.scale.y);
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
