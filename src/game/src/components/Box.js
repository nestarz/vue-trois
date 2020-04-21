import { h, ref, shallowRef, watch, computed } from "vue";

import * as THREE from "three";

import useFrame from "vue-three-fiber/hooks/useFrame.js";
import Mesh from "vue-three-fiber/components/Mesh.js";

import { useBox } from "vue-cannon/hooks/useCannon.js";

export default {
  props: {
    position: {
      type: THREE.Vector3,
      default: new THREE.Vector3(0, 0, 0),
    },
  },
  setup(props) {
    const boxRef = shallowRef(null);

    useFrame(() => (boxRef.value.rotation.x = boxRef.value.rotation.y += 0.01));
    useBox(() => ({ mass: 1 }), boxRef);

    const hovered = ref(false);
    const active = ref(false);
    const scale = computed(() =>
      hovered.value
        ? new THREE.Vector3(1.5, 1.5, 1.5)
        : new THREE.Vector3(1, 1, 1)
    );

    watch([active, boxRef], () => {
      boxRef.value.material.color = active.value
        ? new THREE.Color("hotpink")
        : new THREE.Color("orange");
    });

    return () =>
      h(Mesh, {
        meshRef: boxRef,
        onClick: () => (active.value = !active.value),
        onPointerOver: () => (hovered.value = true),
        onPointerOut: () => (hovered.value = false),
        position: props.position,
        scale: scale.value,
      });
  },
};
