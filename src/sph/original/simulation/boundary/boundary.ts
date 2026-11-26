import { Particle } from '../particle';
import { Bounds, BoundaryType } from '../simulation-options';

/** Positions of ghost particles outside the left and right domain bounds. */
export interface Ghosts {
  left: number[];
  right: number[];
}

export abstract class Boundary {
  abstract readonly type: BoundaryType;

  constructor(readonly bounds: Bounds) {}

  /**
   * Creates ghost particles for all particles near the boundary (within 2h).
   * Needed each time the particle positions change.
   */
  abstract ghosts(particles: Particle[], smoothingLength: number): Ghosts;

  /**
   * Maps the particle into the domain if it is outside the bounds.
   * Can affect position and speed of the particle (depends on boundary type).
   *
   * Note: may produce invalid results if the distance to the bounds
   * is greater than the domain width.
   */
  abstract mapInside(p: Particle): void;

  isInsideLeftInnerBoundary(xPos: number, smoothingLength: number) {
    return xPos < this.bounds.xMin + 2 * smoothingLength;
  }

  isInsideRightInnerBoundary(xPos: number, smoothingLength: number) {
    return xPos > this.bounds.xMax - 2 * smoothingLength;
  }
}
