import { Environment } from '../environment';
import { Integrator } from './integrator';

/** Explicit (semi-implicit) Euler: speed is updated first, the position uses the new speed. */
export class Euler implements Integrator {
  constructor(private readonly env: Environment) {}

  integrate(dt: number) {
    const env = this.env;
    const state = env.state;

    // acc_0 = acc(pos_0)
    for (const p of state.particles) {
      p.accX = env.fluidAcc(p.posX);
    }

    // speed_1 = speed_0 + acc_0 * dt, pos_1 = pos_0 + speed_1 * dt
    for (const p of state.particles) {
      p.speedX += p.accX * dt;
      p.posX = p.posX + p.speedX * dt;
      env.boundary.mapInside(p);
    }
    state.time = state.time + dt;
    env.updateGhosts(state);
  }
}
