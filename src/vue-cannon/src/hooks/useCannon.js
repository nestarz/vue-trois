import * as THREE from "three";
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  watch,
  shallowRef,
} from "vue";

import { describeMesh } from "vue-cannon/utils/computeBodyFromMesh.js";
import { PhysicsContextSymbol } from "vue-cannon/components/Physics.js";

export const useFrame = (callback) => {
  const { frameCallbacks } = inject(PhysicsContextSymbol);
  onMounted(() => frameCallbacks.add(callback));
  onUnmounted(() => frameCallbacks.delete(callback));
};

export const useBox = (fn, fwdRef) => useBody("Box", fn, fwdRef);
export const useSphere = (fn, fwdRef) => useBody("Sphere", fn, fwdRef);
export const usePlane = (fn, fwdRef) => useBody("Plane", fn, fwdRef);

export const useBody = (type, bodyFn, meshRef) => {
  const { world, createBody } = inject(PhysicsContextSymbol);
  const uuid = computed(() => (meshRef.value ? meshRef.value.uuid : null));

  const bodies = shallowRef(null);
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

  const getBody = async (i, ...args) =>
    bodies.value[i].id !== undefined
      ? bodies.value[i]
      : await world.getBodyById(bodies.value[i], ...args);

  const temp = new THREE.Matrix4();
  useFrame(async () => {
    if (!meshRef.value || !bodies.value) return;

    if (meshRef.value instanceof THREE.InstancedMesh) {
      for (let i = 0; i < meshRef.value.count; i++) {
        const body = await getBody(i, true);
        meshRef.value.setMatrixAt(i, temp.fromArray(body.matrix));
        meshRef.value.instanceMatrix.needsUpdate = true;
      }
    } else {
      const body = await getBody(0);
      meshRef.value.position.copy(body.position);
      meshRef.value.quaternion.copy(body.quaternion);
    }
  });

  return bodies;
};
