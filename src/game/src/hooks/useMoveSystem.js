import { watch, unref } from "vue";
import * as CANNON from "cannon-es";

import { useFrame } from "vue-cannon/hooks/useCannon.js";
import { getLocalDirection } from "game/utils/getLocalDirection.js";

export const useMoveSystem = ({
  bodies,
  direction,
  speed = new CANNON.Quaternion(1, 1, 1, 1),
} = {}) => {
  const quaternion = new CANNON.Quaternion();
  useFrame(() => {
    if (direction.x || direction.z)
      unref(bodies).forEach((body) => {
        body.wakeUp();
        if (direction.x) {
          // Rotation
          const { x: rx } = direction;
          quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rx * speed.w);
          body.quaternion = body.quaternion.mult(quaternion);
        }
        if (direction.z) {
          // Translate
          const { x, z } = getLocalDirection(body, { ...direction, x: 0 });
          body.velocity.set(x * speed.x, body.velocity.y, z * speed.z);
        }
      });
  });
  watch(
    () => direction.y,
    () => {
      unref(bodies).forEach((body) => {
        body.velocity.set(
          body.velocity.x,
          direction.y * speed.y,
          body.velocity.z
        );
      });
    }
  );
};
