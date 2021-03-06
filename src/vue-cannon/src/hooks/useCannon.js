import * as THREE from "three";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  watch,
  shallowRef,
} from "vue";

import { describeMesh } from "vue-cannon/utils/describeMesh.js";
import { PhysicsContextSymbol } from "vue-cannon/components/Physics.js";

export const useFrame = (callback) => {
  const { frameCallbacks } = inject(PhysicsContextSymbol);
  onMounted(() => frameCallbacks.add(callback));
  onUnmounted(() => frameCallbacks.delete(callback));
};

export const useBox = (fn, fwdRef) => useBody("Box", fn, fwdRef);
export const useSphere = (fn, fwdRef) => useBody("Sphere", fn, fwdRef);
export const usePlane = (fn, fwdRef) => useBody("Plane", fn, fwdRef);

export const useBody = (type, bodyFn, meshRef = shallowRef()) => {
  const { world, createBody, computeMatrix, isWorker } = inject(
    PhysicsContextSymbol
  );

  const uuid = computed(() => (meshRef.value ? meshRef.value.uuid : null));
  const bodies = shallowRef([]);
  watch(uuid, async () => {
    if (meshRef.value instanceof THREE.InstancedMesh) {
      meshRef.value.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      bodies.value = await Promise.all(
        [...Array(meshRef.value.count).keys()].map(async (i) => {
          const desc = describeMesh(meshRef.value);
          return await createBody(type, desc, bodyFn(i));
        })
        );
      } else {
      const desc = describeMesh(meshRef.value);
      bodies.value = [await createBody(type, desc, bodyFn(0))];
    }
  });

  watch(bodies, (_1, _2, onInvalidate) => {
    bodies.value.forEach((body) => world.add(body));
    onInvalidate(() => bodies.value.forEach((body) => world.remove(body)));
  });

  const getBodyMatrix = async (i) =>
    isWorker
      ? await world.getBodyById(bodies.value[i], true)
      : computeMatrix(bodies.value[i]);

  const getBody = async (i) =>
    isWorker
      ? await world.getBodyById(bodies.value[i], false)
      : bodies.value[i];

  const temp = new THREE.Matrix4();
  useFrame(async () => {
    if (!meshRef.value || !bodies.value) return;

    if (meshRef.value instanceof THREE.InstancedMesh) {
      for (let i = 0; i < meshRef.value.count; i++) {
        const matrix = await getBodyMatrix(i);
        meshRef.value.setMatrixAt(i, temp.fromArray(matrix));
        meshRef.value.instanceMatrix.needsUpdate = true;
      }
    } else {
      const { position, quaternion } = await getBody(0);
      meshRef.value.position.copy(position);
      meshRef.value.quaternion.copy(quaternion);
    }
  });

  return [meshRef, bodies];
};
