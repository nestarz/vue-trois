import { watch } from "vue";
import * as THREE from "three";

import useFrame from "vue-three-fiber/hooks/useFrame.js";

import { useMouse } from "game/hooks/useMouse.js";
import { useControls } from "game/hooks/useControls.js";

const preventGimbleLock = (phi, EPS = 1e-6) =>
  Math.max(EPS, Math.min(Math.PI - EPS, phi));

const Spherical = ({ radius = 1, phi = 0, theta = 0 } = {}) => ({
  get phi() {
    return phi;
  },
  set phi(value) {
    phi = preventGimbleLock(value);
  },
  theta,
  radius,
});

const Orbit = ({
  radius = 1,
  phi = 0,
  theta = 0,
  min = 0,
  max = +Infinity,
} = {}) => {
  const sphere = Spherical({ radius, phi, theta });
  const xyz = new THREE.Vector3();

  return Object.freeze({
    sphere,
    zoom: (zoom) => {
      sphere.radius = Math.min(Math.max(sphere.radius + zoom, min), max);
    },
    rotate: (delta) => {
      sphere.theta = (sphere.theta - delta.x * Math.PI) % (2 * Math.PI);
      sphere.phi = (sphere.phi - delta.y * Math.PI) % (2 * Math.PI);
    },
    toCartesianCoordinates: () =>
      xyz.set(
        sphere.radius * Math.sin(sphere.phi) * Math.sin(sphere.theta),
        sphere.radius * Math.cos(sphere.phi),
        sphere.radius * Math.sin(sphere.phi) * Math.cos(sphere.theta)
      ),
  });
};

export const useThirdPersonControl = ({
  camera,
  target,
  radius = 10,
  phi = Math.PI / 2,
  theta = Math.PI / 3,
  min = 5,
  max = 100,
} = {}) => {
  const orbit = Orbit({ radius, phi, theta, min, max });
  const { drag, delta, wheel } = useMouse();
  watch(delta, () => orbit.rotate(delta.value));
  watch(wheel, () => orbit.zoom(wheel.value * 0.01));

  const controls = useControls();
  const spherical = new THREE.Spherical();
  const targetDirection = new THREE.Vector3();
  watch(
    [() => controls, drag, target],
    (_, _2, invalidateCallback) => {
      if (drag.value) return;
      let id = requestAnimationFrame(function frame() {
        target.value.getWorldDirection(targetDirection).multiplyScalar(-1);
        spherical.setFromVector3(targetDirection);
        orbit.sphere.theta = spherical.theta;
        id = requestAnimationFrame(frame);
      });
      invalidateCallback(() => cancelAnimationFrame(id));
    },
    { deep: true }
  );

  const direction = new THREE.Vector3();
  useFrame(() => {
    camera.getWorldDirection(direction);
    direction.multiplyScalar(-1);
    const position = orbit.toCartesianCoordinates().add(target.value.position);
    camera.position.copy(position);
    camera.lookAt(target.value.position);
  });
};
