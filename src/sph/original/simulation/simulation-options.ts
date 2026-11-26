import { GroundProfile } from './ground/ground-profile';

/** Gravitational acceleration in m/s². */
export const GRAVITY = 9.81;

export type IntegratorType = 'euler' | 'heunNaive' | 'heunStd' | 'heunFast';
export type BoundaryType = 'cyclic' | 'solid';
export type ParticleDistribution = 'uniform' | 'damBreakWet' | 'damBreakDry' | 'waterDrop';
export type TimeSteppingMode = 'fixed' | 'dynStable' | 'dynFast';

export interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface SimulationOptions {
  integratorType: IntegratorType;
  boundaryType: BoundaryType;
  bounds: Bounds;
  ground: GroundProfile;
  smoothingLength: number;
  particleNumber: number;
  particleDistribution: ParticleDistribution;
  fixedTimeStep: number;
  timeSteppingMode: TimeSteppingMode;
  /** upper limit for the time step, disabled if <= 0 */
  timeStepLimit: number;
  timeStart: number;
  /** simulation stops at this time, disabled if <= 0 */
  timeMax: number;
  fluidVolume: number;
}
