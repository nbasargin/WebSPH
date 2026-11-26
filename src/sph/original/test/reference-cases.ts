import {
  collapsingWaterColumn,
  constantSlope,
  dryDamBreak,
  dynamicSlope,
  fluidSeparation,
  Scenario,
  wetDamBreak,
} from '../scenarios/scenarios';
import { Simulation } from '../simulation/simulation';
import { SimulationOptions } from '../simulation/simulation-options';

export const STEPS = 200;

export interface ReferenceCase {
  name: string;
  scenario: Scenario;
  overrides?: Partial<SimulationOptions>;
  /** optional action applied after half of the steps */
  midRun?: (sim: Simulation) => void;
}

export interface ReferenceResult {
  name: string;
  steps: number;
  particles: number;
  totalTime: number;
  /** base64-encoded little-endian float64 array */
  positions: string;
  /** base64-encoded little-endian float64 array */
  speeds: string;
}

export const referenceCases: ReferenceCase[] = [
  // scenario defaults
  { name: 'wet-dam-break', scenario: wetDamBreak },
  { name: 'dry-dam-break', scenario: dryDamBreak },
  { name: 'fluid-separation', scenario: fluidSeparation },
  { name: 'constant-slope', scenario: constantSlope },
  { name: 'dynamic-slope', scenario: dynamicSlope },
  { name: 'collapsing-water-column', scenario: collapsingWaterColumn },
  // integrators
  { name: 'wet-dam-break-euler', scenario: wetDamBreak, overrides: { integratorType: 'euler' } },
  { name: 'wet-dam-break-heun-naive', scenario: wetDamBreak, overrides: { integratorType: 'heunNaive' } },
  { name: 'wet-dam-break-heun-std', scenario: wetDamBreak, overrides: { integratorType: 'heunStd' } },
  // boundary, time stepping
  { name: 'constant-slope-cyclic', scenario: constantSlope, overrides: { boundaryType: 'cyclic' } },
  { name: 'wet-dam-break-fixed-dt', scenario: wetDamBreak, overrides: { timeSteppingMode: 'fixed' } },
  { name: 'wet-dam-break-dt-limit', scenario: wetDamBreak, overrides: { timeStepLimit: 0.002 } },
  // parameter change during the simulation
  { name: 'wet-dam-break-h-change', scenario: wetDamBreak, midRun: (sim) => sim.env.setSmoothingLength(0.05) },
];

export function toBase64(values: number[]): string {
  return Buffer.from(new Float64Array(values).buffer).toString('base64');
}

export function fromBase64(data: string): Float64Array {
  const bytes = Buffer.from(data, 'base64');
  return new Float64Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

export function runCase(c: ReferenceCase): ReferenceResult {
  const sim = new Simulation({ ...c.scenario.simulationOptions(), ...c.overrides });
  let executedSteps = 0;
  for (let step = 0; step < STEPS; step++) {
    if (c.midRun && step === STEPS / 2) {
      c.midRun(sim);
    }
    if (sim.nextTimeStep() > 0) executedSteps++;
    sim.update();
  }
  const particles = sim.env.state.particles;
  return {
    name: c.name,
    steps: executedSteps,
    particles: particles.length,
    totalTime: sim.totalTime,
    positions: toBase64(particles.map((p) => p.posX)),
    speeds: toBase64(particles.map((p) => p.speedX)),
  };
}
