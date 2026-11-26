import { Particle } from '../particle';
import { Boundary, Ghosts } from './boundary';

/**
 * Solid wall at the boundary. Force acting on the wall is returned to the particles next to the wall.
 * This is done by mirroring next-to-wall particles at the wall.
 */
export class SolidBoundary extends Boundary {
  readonly type = 'solid';

  ghosts(particles: Particle[], h: number): Ghosts {
    const { xMin, xMax } = this.bounds;
    const ghosts: Ghosts = { left: [], right: [] };
    for (const p of particles) {
      if (this.isInsideRightInnerBoundary(p.posX, h)) {
        ghosts.right.push(xMax + (xMax - p.posX));
      }
      if (this.isInsideLeftInnerBoundary(p.posX, h)) {
        ghosts.left.push(xMin - (p.posX - xMin));
      }
    }
    return ghosts;
  }

  /** Particles outside the domain are reflected, flipping speed (with damping) and acceleration. */
  mapInside(p: Particle) {
    const { xMin, xMax } = this.bounds;
    const dampingFactor = 0.95;
    if (p.posX > xMax) {
      p.posX = xMax - (p.posX - xMax);
      p.speedX = -p.speedX * dampingFactor;
      p.accX = -p.accX;
    } else if (p.posX < xMin) {
      p.posX = xMin + (xMin - p.posX);
      p.speedX = -p.speedX * dampingFactor;
      p.accX = -p.accX;
    }
  }
}
