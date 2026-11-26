/**
 * Generates reference simulation results (reference.json) used to verify that refactorings
 * of the simulation core do not change its results.
 *
 * Run from the repository root: npx tsx src/sph/original/test/generate-reference.ts
 *
 * Each case starts from a scenario (optionally with overridden options), runs a fixed number of steps
 * and stores final positions and speeds as base64-encoded little-endian float64 arrays.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Simulation } from '../simulation/simulation';
import { SimulationOptions } from '../simulation/simulation-options';
import { BoundaryType, IntegratorType, TimeSteppingMode } from '../util/enums';
import { CollapsingWaterColumn } from '../scenarios/collapsing-water-column';
import { ConstantSlope } from '../scenarios/constant-slope';
import { DryDamBreak } from '../scenarios/dry-dam-break';
import { DynamicSlope } from '../scenarios/dynamic-slope';
import { FluidSeparation } from '../scenarios/fluid-separation';
import { Scenario } from '../scenarios/scenario';
import { WetDamBreak } from '../scenarios/wet-dam-break';

const STEPS = 200;

interface ReferenceCase {
    name: string;
    scenario: Scenario;
    overrides?: Partial<SimulationOptions>;
    /** optional action applied after half of the steps */
    midRun?: (sim: Simulation) => void;
}

const cases: ReferenceCase[] = [
    // scenario defaults
    { name: 'wet-dam-break', scenario: new WetDamBreak() },
    { name: 'dry-dam-break', scenario: new DryDamBreak() },
    { name: 'fluid-separation', scenario: new FluidSeparation() },
    { name: 'constant-slope', scenario: new ConstantSlope() },
    { name: 'dynamic-slope', scenario: new DynamicSlope() },
    { name: 'collapsing-water-column', scenario: new CollapsingWaterColumn() },
    // integrators
    { name: 'wet-dam-break-euler', scenario: new WetDamBreak(), overrides: { integratorType: IntegratorType.EULER } },
    { name: 'wet-dam-break-heun-naive', scenario: new WetDamBreak(), overrides: { integratorType: IntegratorType.HEUN_NAIVE } },
    { name: 'wet-dam-break-heun-std', scenario: new WetDamBreak(), overrides: { integratorType: IntegratorType.HEUN_STD } },
    // boundary, time stepping
    { name: 'constant-slope-cyclic', scenario: new ConstantSlope(), overrides: { boundaryType: BoundaryType.CYCLIC } },
    { name: 'wet-dam-break-fixed-dt', scenario: new WetDamBreak(), overrides: { timeSteppingMode: TimeSteppingMode.FIXED } },
    { name: 'wet-dam-break-dt-limit', scenario: new WetDamBreak(), overrides: { timeStepLimit: 0.002 } },
    // parameter change during the simulation
    { name: 'wet-dam-break-h-change', scenario: new WetDamBreak(), midRun: (sim) => sim.setSmoothingLength(0.05) },
];

function toBase64(values: number[]): string {
    return Buffer.from(new Float64Array(values).buffer).toString('base64');
}

const results = cases.map((c) => {
    const options = { ...c.scenario.getSimulationOptions(), ...c.overrides };
    const sim = new Simulation(options);
    let executedSteps = 0;
    for (let step = 0; step < STEPS; step++) {
        if (c.midRun && step === STEPS / 2) {
            c.midRun(sim);
        }
        if (sim.getNextTimeStep() > 0) executedSteps++;
        sim.update();
    }
    const particles = sim.getEnvironment().getParticles();
    return {
        name: c.name,
        steps: executedSteps,
        particles: particles.length,
        totalTime: sim.getTotalTime(),
        positions: toBase64(particles.map((p) => p.posX)),
        speeds: toBase64(particles.map((p) => p.speedX)),
    };
});

const file = join(__dirname, 'reference.json');
writeFileSync(file, JSON.stringify({ cases: results }, null, 2) + '\n');
console.log(`Wrote ${results.length} cases to ${file}`);
for (const r of results) {
    console.log(`  ${r.name.padEnd(26)} n=${r.particles} steps=${r.steps} t=${r.totalTime}`);
}
