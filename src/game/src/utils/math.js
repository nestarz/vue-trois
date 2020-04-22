export const lerp = (v0, v1, t) => v0 * (1 - t) + v1 * t;
export const clamp = (value, min, max) =>
  min < max
    ? value < min
      ? min
      : value > max
      ? max
      : value
    : value < max
    ? max
    : value > min
    ? min
    : value;
