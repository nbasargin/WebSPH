import {Scenario} from "./Scenario";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {RendererOptions} from "../../rendering/RendererOptions";
import {IntegratorType, BoundaryType, ParticleDistribution, TimeSteppingMode} from "../Enums";
import {ConstLinearGround} from "../../simulation/ground/ConstLinearGround";

export class CollapsingWaterColumn extends Scenario {
	getName(): string {
		return "Collapsing water column";
	}

	getDescription(): string {
		return "A column of water collapses and creates symmetric waves. Cyclic boundary and fixed time step are used.";
	}

	private static readonly SMOOTHING_LENGTH = 0.025;

	getSimulationOptions(): SimulationOptions {
		return {
			integratorType : IntegratorType.HEUN_FAST,
			boundarySize : { xMin : -1, xMax : 5, yMin : -0.3, yMax : 1.1924 },
			boundaryType : BoundaryType.CYCLIC,
			ground : new ConstLinearGround(0 /*slope*/, 0 /*yIntercept*/),
			smoothingLength : CollapsingWaterColumn.SMOOTHING_LENGTH,
			particleNumber : 750,
			particleDistribution : ParticleDistribution.WATER_DROP,
			fixedTimeStep : 0.0065,
			timeSteppingMode : TimeSteppingMode.FIXED,
			timeStepLimit : -1,
			timeStart : 0,
			timeMax : -1,
			fluidVolume : 2,
			gravity : 9.81
		};
	}

	getRenderOptions(): RendererOptions {
		return {
			particleSize : 2,
			smoothingLength : CollapsingWaterColumn.SMOOTHING_LENGTH,
			drawValidationUntil: -1 // do not draw
		};
	}

}
