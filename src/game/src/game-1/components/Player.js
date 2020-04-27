import { h, shallowRef, inject } from "vue";

import * as THREE from "three";

import { CanvasContextSymbol } from "vue-three-fiber/components/Renderer.js";

import Mesh from "vue-three-fiber/components/Mesh.js";
import { useSphere } from "vue-cannon/hooks/useCannon.js";
import { useControls } from "game/hooks/useControls.js";
import { useMoveSystem } from "game/hooks/useMoveSystem.js";
import { useThirdPersonControl } from "game/hooks/useThirdPersonControl.js";

export default {
  props: {
    position: {
      type: THREE.Vector3,
      default: new THREE.Vector3(0, 0, 0),
    },
  },
  setup(props) {
    const [player, bodies] = useSphere(() => ({
      mass: 1,
      fixedRotation: true,
    }));
    
    useThirdPersonControl({
      camera: inject(CanvasContextSymbol).camera,
      target: player,
      radius: 10,
      phi: Math.PI / 2,
      theta: Math.PI / 3,
      min: 5,
      max: 100,
    });

    const direction = useControls();
    useMoveSystem({
      bodies,
      direction,
      speed: new THREE.Vector4(10, 10, 10, 0.1),
    });

    return () =>
      h(Mesh, {
        meshRef: player,
        position: props.position,
        geometry: new THREE.SphereGeometry(1, 10, 10),
      });
  },
};
