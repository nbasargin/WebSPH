import { RendererOptions } from '../rendering/renderer-options';
import { DynamicDoubleSineGround } from '../simulation/ground/dynamic-double-sine-ground';
import { SimulationOptions } from '../simulation/simulation-options';
import { BoundaryType, IntegratorType, ParticleDistribution, TimeSteppingMode } from '../util/enums';
import { Scenario } from './scenario';

export class FluidSeparation extends Scenario {


    getName(): string {
        return 'Fluid separation';
    }

    getDescription(): string {
        return 'Fluid volume gets separated and merged again. Different smoothing lengths are used for simulation and visualization.';
    }

    getSimulationOptions(): SimulationOptions {
        return {
            integratorType: IntegratorType.HEUN_FAST,
            boundarySize: {xMin: 0, xMax: 6, yMin: -0.1, yMax: 1.3924},
            boundaryType: BoundaryType.SOLID,
            ground: new DynamicDoubleSineGround(),
            smoothingLength: 0.025,
            particleNumber: 500,
            particleDistribution: ParticleDistribution.UNIFORM,
            fixedTimeStep: 0.001,
            timeSteppingMode: TimeSteppingMode.FAST,
            timeStepLimit: 0.0080,
            timeStart: 0,
            timeMax: -1,
            fluidVolume: 2.5,
            gravity: 9.81
        };
    }

    getRenderOptions(): RendererOptions {
        return {
            particleSize: 1,
            smoothingLength: 0.085,
            drawValidationUntil: -1 // do not draw
        };
    }


}
