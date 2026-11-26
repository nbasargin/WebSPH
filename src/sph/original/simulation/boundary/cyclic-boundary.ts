import { Particle } from '../particle';
import { Boundary, Ghosts } from './boundary';

/**
 * Cyclic domain: particles near the right bound affect particles near the left bound and vice versa.
 */
export class CyclicBoundary extends Boundary {
  readonly type = 'cyclic';

  /** Copies particles from the left inner to the right outer boundary and from the right inner to the left outer. */
  ghosts(particles: Particle[], h: number): Ghosts {
    const width = this.bounds.xMax - this.bounds.xMin;
    const ghosts: Ghosts = { left: [], right: [] };
    for (const p of particles) {
      if (this.isInsideRightInnerBoundary(p.posX, h)) {
        ghosts.left.push(p.posX - width);
      }
      if (this.isInsideLeftInnerBoundary(p.posX, h)) {
        ghosts.right.push(p.posX + width);
      }
    }
    return ghosts;
  }

  mapInside(p: Particle) {
    const { xMin, xMax } = this.bounds;
    if (p.posX > xMax) {
      p.posX -= xMax - xMin;
    } else if (p.posX < xMin) {
      p.posX += xMax - xMin;
    }
  }
}
