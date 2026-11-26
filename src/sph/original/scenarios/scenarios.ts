import { RendererOptions } from '../rendering/renderer-options';
import { ConstLinearGround } from '../simulation/ground/const-linear-ground';
import { DynamicDoubleSineGround } from '../simulation/ground/dynamic-double-sine-ground';
import { DynamicLinearGround } from '../simulation/ground/dynamic-linear-ground';
import { SimulationOptions } from '../simulation/simulation-options';

/** Predefined setup; option factories return fresh objects that can be modified. */
export interface Scenario {
  name: string;
  description: string;
  simulationOptions(): SimulationOptions;
  rendererOptions(): RendererOptions;
}

export const wetDamBreak: Scenario = {
  name: 'Wet dam break',
  description: 'Simulation of a dam break with some fluid behind the dam (standard dam break scenario).',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: -2.5, xMax: 3.5, yMin: -0.3, yMax: 1.1924 },
    boundaryType: 'solid',
    ground: new ConstLinearGround(0, 0),
    smoothingLength: 0.03,
    particleNumber: 750,
    particleDistribution: 'damBreakWet',
    fixedTimeStep: 0.001,
    timeSteppingMode: 'dynStable',
    timeStepLimit: -1,
    timeStart: 0,
    timeMax: -1,
    fluidVolume: 4.5,
  }),
  rendererOptions: () => ({ particleSize: 2, smoothingLength: 0.03, drawValidationUntil: 1 }),
};

export const dryDamBreak: Scenario = {
  name: 'Dry dam break',
  // afterwards, particles become too fast
  description:
    'Simulation of a dam break with no fluid behind the dam (dry ground). ' +
    'Simulation time is initially limited to 0.5 seconds.',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: -3, xMax: 3, yMin: -0.3, yMax: 1.1924 },
    boundaryType: 'solid',
    ground: new ConstLinearGround(0, 0),
    smoothingLength: 0.1,
    particleNumber: 750,
    particleDistribution: 'damBreakDry',
    fixedTimeStep: 0.001,
    timeSteppingMode: 'dynStable',
    timeStepLimit: -1,
    timeStart: 0,
    timeMax: 0.5,
    fluidVolume: 3.5,
  }),
  rendererOptions: () => ({ particleSize: 4, smoothingLength: 0.1, drawValidationUntil: -1 }),
};

export const fluidSeparation: Scenario = {
  name: 'Fluid separation',
  description:
    'Fluid volume gets separated and merged again. Different smoothing lengths are used for simulation and visualization.',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: 0, xMax: 6, yMin: -0.1, yMax: 1.3924 },
    boundaryType: 'solid',
    ground: new DynamicDoubleSineGround(),
    smoothingLength: 0.025,
    particleNumber: 500,
    particleDistribution: 'uniform',
    fixedTimeStep: 0.001,
    timeSteppingMode: 'dynFast',
    timeStepLimit: 0.008,
    timeStart: 0,
    timeMax: -1,
    fluidVolume: 2.5,
  }),
  rendererOptions: () => ({ particleSize: 1, smoothingLength: 0.085, drawValidationUntil: -1 }),
};

export const constantSlope: Scenario = {
  name: 'Constant ground slope',
  description: 'The ground has a constant linear slope.',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: 0, xMax: 6, yMin: -0.4, yMax: 1.0924 },
    boundaryType: 'solid',
    ground: new ConstLinearGround(0.07, -0.4),
    smoothingLength: 0.05,
    particleNumber: 500,
    particleDistribution: 'uniform',
    fixedTimeStep: 0.001,
    timeSteppingMode: 'dynFast',
    timeStepLimit: -1,
    timeStart: 0,
    timeMax: -1,
    fluidVolume: 3,
  }),
  rendererOptions: () => ({ particleSize: 2, smoothingLength: 0.05, drawValidationUntil: -1 }),
};

export const dynamicSlope: Scenario = {
  name: 'Dynamic ground slope',
  description: 'The ground slope is changed over time.',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: -3, xMax: 3, yMin: -0.4, yMax: 1.0924 },
    boundaryType: 'solid',
    ground: new DynamicLinearGround(0, 0.15, 3),
    smoothingLength: 0.025,
    particleNumber: 500,
    particleDistribution: 'uniform',
    fixedTimeStep: 0.001,
    timeSteppingMode: 'dynFast',
    timeStepLimit: -1,
    timeStart: 0,
    timeMax: -1,
    fluidVolume: 3,
  }),
  rendererOptions: () => ({ particleSize: 2, smoothingLength: 0.025, drawValidationUntil: -1 }),
};

export const collapsingWaterColumn: Scenario = {
  name: 'Collapsing water column',
  description: 'A column of water collapses and creates symmetric waves. Cyclic boundary and fixed time step are used.',
  simulationOptions: () => ({
    integratorType: 'heunFast',
    bounds: { xMin: -1, xMax: 5, yMin: -0.3, yMax: 1.1924 },
    boundaryType: 'cyclic',
    ground: new ConstLinearGround(0, 0),
    smoothingLength: 0.025,
    particleNumber: 750,
    particleDistribution: 'waterDrop',
    fixedTimeStep: 0.0065,
    timeSteppingMode: 'fixed',
    timeStepLimit: -1,
    timeStart: 0,
    timeMax: -1,
    fluidVolume: 2,
  }),
  rendererOptions: () => ({ particleSize: 2, smoothingLength: 0.025, drawValidationUntil: -1 }),
};

/** All scenarios in the order shown in the UI; the first one is the default. */
export const scenarios: Scenario[] = [
  wetDamBreak,
  dryDamBreak,
  fluidSeparation,
  constantSlope,
  dynamicSlope,
  collapsingWaterColumn,
];
