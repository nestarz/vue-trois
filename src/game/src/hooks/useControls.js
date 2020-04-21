import { reactive } from "vue";
import { useEventListener } from "game/hooks/useEventListener.js";

export const useControls = () => {
  const direction = reactive({ x: 0, y: 0, z: 0 });
  const actions = {
    KeyW: (x) => (direction.z = x),
    KeyS: (x) => (direction.z = -x),
    KeyA: (x) => (direction.x = -x),
    KeyD: (x) => (direction.x = x),
    Space: (x) => (direction.y = x),
  };

  useEventListener("keydown", (event) => {
    const fn = actions[event.code];
    if (fn) fn(1);
  });
  useEventListener("keyup", (event) => {
    const fn = actions[event.code];
    if (fn) fn(0);
  });

  return direction;
};
