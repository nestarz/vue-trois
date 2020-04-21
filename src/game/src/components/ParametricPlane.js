import { h, watch, ref, computed } from "vue";

import * as CANNON from "cannon-es";
import * as THREE from "three";
import nurbs from "nurbs";

import useFrame from "hooks/useFrame.js";
import { useBody } from "hooks/useCannon.js";
import Mesh from "components/Mesh.js";

const nurbsInitial = {
  points: [
    [
      [-2, -2, 1],
      [-2, -1, -2],
      [-2, 1, 2.5],
      [-2, 2, -1],
    ],
    [
      [0, -2, 0],
      [0, -1, -1],
      [0, 1, 1.5],
      [0, 2, 0],
    ],
    [
      [2, -2, -1],
      [2, -1, 2],
      [2, 1, -2.5],
      [2, 2, 1],
    ],
  ],
  weights: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ],
  knots: [
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
  ],
  boundary: ["closed", "clamped"],
  degree: [2, 3],
};

export default {
  props: {
    position: {
      type: THREE.Vector3,
      required: true,
    },
  },
  setup(props) {
    const plane = ref(null);
    const active = ref(false);

    useBody(CANNON.Plane, () => ({ mass: 0 }), plane);

    watch([active, plane], () => {
      plane.value.material.color = active.value
        ? new THREE.Color("hotpink")
        : new THREE.Color("orange");
    });

    // const params = ref(nurbsInitial);
    // const curve = computed(() => nurbs(params.value));
    const geometry = computed(() => {
      const getSurfacePoint = (u, v, target) => {
        // target.set(...curve.value.evaluate([], u, v));
        target.set(u, v, 0);
      };
      return new THREE.PlaneGeometry(1, 1);
    });

    return () =>
      h(Mesh, {
        meshRef: plane,
        position: props.position,
        geometry: geometry.value,
        material: new THREE.MeshNormalMaterial({
          side: THREE.DoubleSide,
        }),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0, "XYZ"),
        onClick: () => (active.value = !active.value),
      });
  },
};
