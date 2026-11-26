import { Environment, FluidState } from '../environment';
import { Integrator } from './integrator';

/** Standard Heun's method: averages the accelerations of the current and the predicted state. */
export class HeunOriginal implements Integrator {
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

    // acc_0 = acc(pos_0), pos_1 = pos_0 + speed_0 * dt
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      const pred = predParticles[i];
      part.accX = env.fluidAcc(part.posX);
      pred.posX = part.posX + part.speedX * dt;
      env.boundary.mapInside(pred);
    }
    this.pred.time = totalTime + dt;
    env.updateGhosts(this.pred);

    // acc_1 = acc(pos_1)
    for (const pred of predParticles) {
      pred.accX = env.fluidAcc(pred.posX, this.pred);
    }

    // speed_new = speed_0 + 1/2 * (acc_0 + acc_1) * dt, pos_new = pos_0 + speed_new * dt
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      part.speedX += 0.5 * (part.accX + predParticles[i].accX) * dt;
      part.posX = part.posX + part.speedX * dt;
      env.boundary.mapInside(part);
    }
    state.time = totalTime + dt;
    env.updateGhosts(state);
  }
}
