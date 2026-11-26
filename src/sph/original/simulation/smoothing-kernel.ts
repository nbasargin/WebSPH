// The kernels are evaluated N² times per step and are written for speed:
// abs and sign via comparisons (no global Math lookups, which are very slow in Node vm contexts used by Jest).

/** Cubic B-spline kernel in 1D, support radius 2h. */
export function cubic1D(xDist: number, smoothingLength: number) {
  let R = (xDist < 0 ? -xDist : xDist) / smoothingLength;
  if (R < 1) return (1 / smoothingLength) * (2 / 3 - R * R + (1 / 2) * R * R * R);
  if (R < 2) return (1 / smoothingLength) * ((1 / 6) * (2 - R) * (2 - R) * (2 - R));
  return 0;
}

/** Derivative of the cubic B-spline kernel in 1D. */
export function dCubic1D(xDist: number, smoothingLength: number) {
  let a = (xDist < 0 ? -xDist : xDist) / smoothingLength;
  let sgn = (xDist > 0 ? 1 : xDist < 0 ? -1 : xDist) / smoothingLength;
  if (a < 1) return (2 * sgn * a - (3 / 2) * sgn * a * a) / smoothingLength;
  if (a < 2) return ((1 / 2) * sgn * (2 - a) * (2 - a)) / smoothingLength;
  return 0;
}
