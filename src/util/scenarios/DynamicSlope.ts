import { RendererOptions } from '../../rendering/RendererOptions';
import { DynamicLinearGround } from '../../simulation/ground/DynamicLinearGround';
import { SimulationOptions } from '../../simulation/SimulationOptions';
import { BoundaryType, IntegratorType, ParticleDistribution, TimeSteppingMode } from '../Enums';
import { Scenario } from './Scenario';

export class DynamicSlope extends Scenario {

    getName(): string {
        return 'Dynamic ground slope';
    }

    getDescription(): string {
        return 'The ground slope is changed over time.';
    }

    private static readonly SMOOTHING_LENGTH = 0.025;

    getSimulationOptions(): SimulationOptions {
        return {
            integratorType: IntegratorType.HEUN_FAST,
            boundarySize: {xMin: -3, xMax: 3, yMin: -0.4, yMax: 1.0924},
            boundaryType: BoundaryType.SOLID,
            ground: new DynamicLinearGround(0 /*yIntercept*/, 0.15 /*maxSlope*/, 3 /*slopeChangeSpeed*/),
            smoothingLength: DynamicSlope.SMOOTHING_LENGTH,
            particleNumber: 500,
            particleDistribution: ParticleDistribution.UNIFORM,
            fixedTimeStep: 0.001,
            timeSteppingMode: TimeSteppingMode.FAST,
            timeStepLimit: -1,
            timeStart: 0,
            timeMax: -1,
            fluidVolume: 3,
            gravity: 9.81
        };
    }

    getRenderOptions(): RendererOptions {
        return {
            particleSize: 2,
            smoothingLength: DynamicSlope.SMOOTHING_LENGTH,
            drawValidationUntil: -1 // do not draw
        }
    }


}
