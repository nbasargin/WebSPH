import { Environment, FluidState } from '../environment';
import { Integrator } from './integrator';

/**
 * Reduced/fast Heun's method: predicts the position for the next step and uses
 * the acceleration of the prediction for this step. No averaging with the current acceleration.
 */
export class HeunFast implements Integrator {
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

    // pos_1 = pos_0 + speed_0 * dt
    for (let i = 0; i < particles.length; i++) {
      const pred = predParticles[i];
      pred.posX = particles[i].posX + particles[i].speedX * dt;
      env.boundary.mapInside(pred);
    }
    this.pred.time = totalTime + dt;
    env.updateGhosts(this.pred);

    // acc_1 = acc(pos_1)
    for (const pred of predParticles) {
      pred.accX = env.fluidAcc(pred.posX, this.pred);
    }

    // speed_new = speed_0 + acc_1 * dt, pos_new = pos_0 + speed_new * dt
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      part.speedX += predParticles[i].accX * dt;
      part.posX = part.posX + part.speedX * dt;
      env.boundary.mapInside(part);
    }
    state.time = totalTime + dt;
    env.updateGhosts(state);
  }
}
