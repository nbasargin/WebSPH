import { Bounds } from '../util/bounds';
import { BoundaryType, IntegratorType, ParticleDistribution, TimeSteppingMode } from '../util/enums';
import { GroundProfile } from './ground/ground-profile';

export interface SimulationOptions {

    integratorType: IntegratorType;
    boundaryType: BoundaryType;
    boundarySize: Bounds;
    //groundPreset : GroundPreset;
    ground: GroundProfile;
    smoothingLength: number;
    particleNumber: number;
    particleDistribution: ParticleDistribution;
    fixedTimeStep: number;
    timeSteppingMode: TimeSteppingMode;
    timeStepLimit: number;
    timeStart: number;
    timeMax: number;
    fluidVolume: number;
    gravity: number;

}
