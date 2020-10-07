import { RendererOptions } from '../../rendering/RendererOptions';
import { ConstLinearGround } from '../../simulation/ground/ConstLinearGround';
import { SimulationOptions } from '../../simulation/SimulationOptions';
import { BoundaryType, IntegratorType, ParticleDistribution, TimeSteppingMode } from '../Enums';
import { Scenario } from './Scenario';


export class ConstantSlope extends Scenario {

    getName(): string {
        return 'Constant ground slope';
    }

    getDescription(): string {
        return 'The ground has a constant linear slope.';
    }


    private static readonly SMOOTHING_LENGTH = 0.05;

    getSimulationOptions(): SimulationOptions {
        return {
            integratorType: IntegratorType.HEUN_FAST,
            boundarySize: {xMin: 0, xMax: 6, yMin: -0.4, yMax: 1.0924},
            boundaryType: BoundaryType.SOLID,
            ground: new ConstLinearGround(0.07 /*slope*/, -0.4 /*yIntercept*/),
            smoothingLength: ConstantSlope.SMOOTHING_LENGTH,
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
            smoothingLength: ConstantSlope.SMOOTHING_LENGTH,
            drawValidationUntil: -1 // do not draw
        }
    }

}
