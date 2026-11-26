import { Environment, FluidState } from '../environment';
import { Integrator } from './integrator';

/**
 * Naive Heun's method: does two Euler steps and takes the
 * average between the result of the second step and the current state.
 */
export class HeunNaive implements Integrator {
  private readonly pred: FluidState;

  constructor(private readonly env: Environment) {
    this.pred = env.createState();
  }

  integrate(dt: number) {
    const env = this.env;
    const state = env.state;
    const particles = state.particles;
    const predParticles = this.pred.particles;
    const totalTime = state.time;

    // Euler step 1: pos_1 = pos_0 + speed_0 * dt, speed_1 = speed_0 + acc_0 * dt
    // (no mapping into the domain, it could create problems for averaging)
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      const pred = predParticles[i];
      part.accX = env.fluidAcc(part.posX);
      pred.posX = part.posX + part.speedX * dt;
      pred.speedX = part.speedX + part.accX * dt;
    }
    this.pred.time = totalTime + dt;
    env.updateGhosts(this.pred);

    // Euler step 2: pos_2 = pos_1 + speed_1 * dt, speed_2 = speed_1 + acc_1 * dt
    // averaging: pos_new = (pos_0 + pos_2) / 2, speed_new = (speed_0 + speed_2) / 2
    // (all accelerations are computed before the first particle is updated)
    for (const pred of predParticles) {
      pred.accX = env.fluidAcc(pred.posX, this.pred);
    }
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      const pred = predParticles[i];
      const pos2 = pred.posX + pred.speedX * dt;
      const speed2 = pred.speedX + pred.accX * dt;
      part.posX = (part.posX + pos2) / 2;
      part.speedX = (part.speedX + speed2) / 2;
      env.boundary.mapInside(part);
    }
    state.time = totalTime + dt;
    env.updateGhosts(state);
  }
}
