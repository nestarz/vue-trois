import { h, shallowRef, watch, inject } from "vue";

import * as THREE from "three";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";

import Mesh from "vue-three-fiber/components/Mesh.js";
import { useBox } from "vue-cannon/hooks/useCannon.js";
import { useControls } from "game/hooks/useControls.js";
import { useThirdPersonControl } from "game/hooks/useThirdPersonControl.js";

export default {
  props: {
    position: {
      type: THREE.Vector3,
      default: new THREE.Vector3(0, 0, 0),
    },
  },
  setup(props) {
    const player = shallowRef(null);
    useThirdPersonControl({
      camera: inject(CanvasContextSymbol).camera,
      target: player,
      radius: 10,
      phi: Math.PI / 2,
      theta: Math.PI / 3,
      min: 5,
      max: 100,
    });

    const bodies = useBox(() => ({ mass: 1, fixedRotation: true }), player);
    const direction = useControls();
    const speed = 20;
    watch(
      () => direction,
      () =>
        bodies.value.forEach((body) => {
          const { x, y, z } = direction;
          body.velocity.set(x * speed, y * 2, -z * speed);
          body.wakeUp();
        }),
      { deep: true }
    );

    return () =>
      h(Mesh, {
        meshRef: player,
        position: props.position,
      });
  },
};
