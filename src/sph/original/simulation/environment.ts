import { Boundary, Ghosts } from './boundary/boundary';
import { CyclicBoundary } from './boundary/cyclic-boundary';
import { SolidBoundary } from './boundary/solid-boundary';
import { GroundProfile } from './ground/ground-profile';
import { createParticles, Particle } from './particle';
import { cubic1D, dCubic1D } from './smoothing-kernel';
import { BoundaryType, Bounds, GRAVITY, ParticleDistribution, SimulationOptions } from './simulation-options';

const noGhosts: number[] = [];

/** Particles at a specific point in time, including the ghost particles of the boundary. */
export interface FluidState {
  particles: Particle[];
  ghosts: Ghosts;
  time: number;
}

/**
 * Simulation parameters and the current fluid state.
 * Fluid height and acceleration can be evaluated for any state (e.g. a prediction of an integrator).
 */
export class Environment {
  readonly bounds: Bounds;
  readonly ground: GroundProfile;
  readonly particleVolume: number;
  readonly state: FluidState;
  boundary: Boundary;
  smoothingLength: number;

  constructor(options: SimulationOptions) {
    this.bounds = options.bounds;
    this.ground = options.ground;
    this.smoothingLength = options.smoothingLength;
    this.boundary = createBoundary(options.boundaryType, options.bounds);
    const particles = createParticles(options.particleNumber);
    this.particleVolume = options.fluidVolume / particles.length;
    this.state = { particles, ghosts: { left: [], right: [] }, time: options.timeStart };
    distributeParticles(particles, options.particleDistribution, options.bounds);
    this.updateGhosts(this.state);
  }

  /** Creates a state with the same number of particles, e.g. for predictions. */
  createState(): FluidState {
    return { particles: createParticles(this.state.particles.length), ghosts: { left: [], right: [] }, time: 0 };
  }

  updateGhosts(state: FluidState) {
    state.ghosts = this.boundary.ghosts(state.particles, this.smoothingLength);
  }

  setSmoothingLength(h: number) {
    this.smoothingLength = h;
    this.updateGhosts(this.state);
  }

  setBoundaryType(type: BoundaryType) {
    this.boundary = createBoundary(type, this.bounds);
    this.updateGhosts(this.state);
  }

  groundHeight(x: number, time = this.state.time): number {
    return this.ground.height(x, time);
  }

  /**
   * Fluid height at position x (not including the ground height).
   * The ghosts of the state must match the smoothing length h.
   */
  fluidHeight(x: number, state = this.state, h = this.smoothingLength): number {
    // hot loops (N² per step): index loops are much faster than for-of in Firefox
    const particles = state.particles;
    let height = 0;
    for (let i = 0; i < particles.length; i++) {
      height += cubic1D(x - particles[i].posX, h);
    }
    const ghosts = this.boundary.isInsideLeftInnerBoundary(x, h)
      ? state.ghosts.left
      : this.boundary.isInsideRightInnerBoundary(x, h)
        ? state.ghosts.right
        : noGhosts;
    for (let i = 0; i < ghosts.length; i++) {
      height += cubic1D(x - ghosts[i], h);
    }
    return height * this.particleVolume;
  }

  /** Fluid acceleration at position x. */
  fluidAcc(x: number, state = this.state): number {
    const h = this.smoothingLength;
    const particles = state.particles;
    let acc = 0;
    for (let i = 0; i < particles.length; i++) {
      acc += dCubic1D(x - particles[i].posX, h);
    }
    const ghosts = this.boundary.isInsideLeftInnerBoundary(x, h)
      ? state.ghosts.left
      : this.boundary.isInsideRightInnerBoundary(x, h)
        ? state.ghosts.right
        : noGhosts;
    for (let i = 0; i < ghosts.length; i++) {
      acc += dCubic1D(x - ghosts[i], h);
    }
    return acc * this.particleVolume * GRAVITY - this.ground.slope(x, state.time) * GRAVITY;
  }
}

function createBoundary(type: BoundaryType, bounds: Bounds): Boundary {
  return type === 'cyclic' ? new CyclicBoundary(bounds) : new SolidBoundary(bounds);
}

function distributeParticles(particles: Particle[], distribution: ParticleDistribution, b: Bounds) {
  const n = particles.length;
  switch (distribution) {
    // same water level everywhere
    case 'uniform':
      distribute(particles, b.xMin, b.xMax, 0, n - 1);
      break;

    // dam at x = 0.5, fluid height 1 on the left and 0.5 on the right side
    case 'damBreakWet': {
      const leftSpacePercentage = (0.5 - b.xMin) / (b.xMax - b.xMin);
      // 2 left / (2 left + 1 right), see thesis
      const leftMassPercentage = (leftSpacePercentage * 2) / (1 + leftSpacePercentage);
      const lastDamBreakID = Math.floor(n * leftMassPercentage) - 1;
      distribute(particles, b.xMin, 0.5, 0, lastDamBreakID);
      distribute(particles, 0.5, b.xMax, lastDamBreakID + 1, n - 1);
      break;
    }

    // dam at x = 0.5, no fluid on the right side
    case 'damBreakDry':
      distribute(particles, b.xMin, 0.5, 0, n - 1);
      break;

    // uniform water level with an additional column of water at [0, 1]
    case 'waterDrop': {
      const numStackedParticles = Math.floor(n / 3);
      const lastWaterDropID = n - numStackedParticles - 1;
      distribute(particles, b.xMin, b.xMax, 0, lastWaterDropID);
      distribute(particles, 0, 1, lastWaterDropID + 1, n - 1);
      break;
    }
  }
}

/** Evenly distributes particles with IDs in [firstID, lastID] over [xMin, xMax] and sets their speed to 0. */
function distribute(particles: Particle[], xMin: number, xMax: number, firstID: number, lastID: number) {
  const width = xMax - xMin;
  for (let i = firstID; i <= lastID; i++) {
    particles[i].posX = xMin + (width * (i + 0.5 - firstID)) / (lastID - firstID + 1);
    particles[i].speedX = 0;
  }
}
