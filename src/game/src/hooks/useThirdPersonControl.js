import { watch } from "vue";
import * as THREE from "three";

import useFrame from "vue-three-fiber/hooks/useFrame.js";

import { useMouse } from "game/hooks/useMouse.js";

const preventGimbleLock = (phi) => {
  const EPS = 0.000001;
  return Math.max(EPS, Math.min(Math.PI - EPS, phi));
};

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
  const { delta, wheel } = useMouse();
  watch(delta, () => orbit.rotate(delta.value));
  watch(wheel, () => orbit.zoom(wheel.value * 0.01));

  const direction = new THREE.Vector3();
  useFrame(() => {
    camera.getWorldDirection(direction);
    direction.multiplyScalar(-1);
    const position = orbit.toCartesianCoordinates().add(target.value.position);
    camera.position.copy(position);
    camera.lookAt(target.value.position);
  });
};
