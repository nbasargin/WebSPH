import {Scenario} from "./Scenario";

import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {IntegratorType, BoundaryType, ParticleDistribution, TimeSteppingMode} from "../Enums";
import {ConstLinearGround} from "../../simulation/ground/ConstLinearGround";

export class DryDamBreak extends Scenario {

	getName(): string {
		return "Dry dam break";
	}

	getDescription(): string {
		return "Simulation of a dam break with no fluid behind the dam (dry ground). " +
			"Simulation time is initially limited to 0.5 seconds."; // Afterwards, particles become too fast.
	}


	private static readonly SMOOTHING_LENGTH = 0.1;

	getSimulationOptions() : SimulationOptions {
		return {
			integratorType : IntegratorType.HEUN_FAST,
			boundarySize : { xMin : -3, xMax : 3, yMin : -0.3, yMax : 1.1924 },
			boundaryType : BoundaryType.SOLID,
			ground : new ConstLinearGround(0 /*slope*/, 0 /*yIntercept*/),
			smoothingLength : DryDamBreak.SMOOTHING_LENGTH,
			particleNumber : 750,
			particleDistribution : ParticleDistribution.DAM_BREAK_DRY,
			fixedTimeStep : 0.001,
			timeSteppingMode : TimeSteppingMode.STABLE,
			timeStepLimit : -1,
			timeStart : 0,
			timeMax : 0.5,
			fluidVolume : 3.5,
			gravity : 9.81
		};
	}

	getRenderOptions(): RendererOptions {
		return {
			particleSize : 4,
			smoothingLength : DryDamBreak.SMOOTHING_LENGTH,
			drawValidationUntil: -1 // do not draw
		};
	}

}
