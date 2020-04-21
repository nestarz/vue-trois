import { ref } from "vue";
import { useEventListener } from "game/hooks/useEventListener.js";

import * as THREE from "three";

const computeMousePosUnit = ({ clientX, clientY, currentTarget }) =>
  new THREE.Vector2(
    clientX / currentTarget.offsetHeight,
    clientY / currentTarget.offsetWidth
  );

export const useMouse = () => {
  const delta = ref(new THREE.Vector2());
  const drag = ref(0);
  const wheel = ref(0);
  const x = ref(0);
  const y = ref(0);

  const prevMousePosUnit = new THREE.Vector2();
  const on = {
    move: (event) => {
      const mousePosUnit = computeMousePosUnit(event);
      x.value = mousePosUnit.x;
      y.value = mousePosUnit.y;

      if (drag.value) {
        delta.value = mousePosUnit.clone().sub(prevMousePosUnit);
        prevMousePosUnit.copy(mousePosUnit);
      }
    },
    down: (event) => {
      drag.value = true;
      prevMousePosUnit.copy(computeMousePosUnit(event));
    },
    up: () => {
      drag.value = false;
    },
    wheel: () => {
      wheel.value = event.deltaY;
    },
  };

  useEventListener("touchstart", ({ touches }) => on.down(touches[0]));
  useEventListener("touchmove", ({ touches }) => on.move(touches[0]));
  useEventListener("touchend", ({ touches }) => on.up(touches[0]));
  useEventListener("touchcancel", ({ touches }) => on.up(touches[0]));

  useEventListener("mousedown", on.down);
  useEventListener("mousemove", on.move);
  useEventListener("mouseup", on.up);

  useEventListener("wheel", on.wheel);

  return { drag, delta, wheel, x, y };
};
