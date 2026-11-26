import { Environment } from './environment';
import { Euler } from './integrator/euler';
import { HeunFast } from './integrator/heun-fast';
import { HeunNaive } from './integrator/heun-naive';
import { HeunOriginal } from './integrator/heun-original';
import { Integrator } from './integrator/integrator';
import { GRAVITY, IntegratorType, SimulationOptions, TimeSteppingMode } from './simulation-options';
import { maxTimeStepFast, maxTimeStepStable } from './time-stepping';

/** Main simulation class: environment, integrator and time stepping. */
export class Simulation {
  readonly env: Environment;
  private integrator: Integrator;

  timeSteppingMode: TimeSteppingMode;
  fixedTimeStep: number;
  /** upper limit for the time step, disabled if <= 0 */
  timeStepLimit: number;
  /** simulation stops at this time, disabled if <= 0 */
  maxTime: number;

  constructor(options: SimulationOptions) {
    this.env = new Environment(options);
    this.integrator = createIntegrator(options.integratorType, this.env);
    this.timeSteppingMode = options.timeSteppingMode;
    this.fixedTimeStep = options.fixedTimeStep;
    this.timeStepLimit = options.timeStepLimit;
    this.maxTime = options.timeMax;
  }

  get totalTime(): number {
    return this.env.state.time;
  }

  /** Advances the simulation by one time step (if max time is not reached yet). */
  update() {
    const dt = this.nextTimeStep();
    if (dt > 0) {
      this.integrator.integrate(dt);
    }
  }

  setIntegratorType(type: IntegratorType) {
    this.integrator = createIntegrator(type, this.env);
  }

  /** Next time step based on mode, limit and max time; 0 if max time is reached. */
  nextTimeStep(): number {
    let dtNext = this.timeStepForMode(this.timeSteppingMode);
    if (this.timeStepLimit > 0) {
      dtNext = Math.min(dtNext, this.timeStepLimit);
    }
    if (this.maxTime > 0 && this.totalTime + dtNext > this.maxTime) {
      dtNext = this.maxTime - this.totalTime;
    }
    return Math.max(0, dtNext);
  }

  /** Time step for the given mode, without limits. */
  timeStepForMode(mode: TimeSteppingMode): number {
    const { particles } = this.env.state;
    const h = this.env.smoothingLength;
    switch (mode) {
      case 'fixed':
        return this.fixedTimeStep;
      case 'dynFast':
        return maxTimeStepFast(particles, h, GRAVITY);
      case 'dynStable':
        return maxTimeStepStable(particles, h, GRAVITY);
    }
  }
}

function createIntegrator(type: IntegratorType, env: Environment): Integrator {
  switch (type) {
    case 'euler':
      return new Euler(env);
    case 'heunStd':
      return new HeunOriginal(env);
    case 'heunNaive':
      return new HeunNaive(env);
    case 'heunFast':
      return new HeunFast(env);
  }
}
