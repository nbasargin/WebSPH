import {Scenario} from "./Scenario";
import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {IntegratorType, BoundaryType, ParticleDistribution, TimeSteppingMode} from "../Enums";
import {ConstLinearGround} from "../../simulation/ground/ConstLinearGround";

export class WetDamBreak extends Scenario {

	getName(): string {
		return "Wet dam break";
	}

	getDescription(): string {
		return "Simulation of a dam break with some fluid behind the dam (standard dam break scenario).";
	}

	private static readonly SMOOTHING_LENGTH = 0.03;

	getSimulationOptions(): SimulationOptions {
		return {
			integratorType : IntegratorType.HEUN_FAST,
			boundarySize : { xMin : -2.5, xMax : 3.5, yMin : -0.3, yMax : 1.1924 },
			boundaryType : BoundaryType.SOLID,
			ground : new ConstLinearGround(0 /*slope*/, 0 /*yIntercept*/),
			smoothingLength : WetDamBreak.SMOOTHING_LENGTH,
			particleNumber : 750,
			particleDistribution : ParticleDistribution.DAM_BREAK_WET,
			fixedTimeStep : 0.001,
			timeSteppingMode : TimeSteppingMode.STABLE,
			timeStepLimit : -1,
			timeStart : 0,
			timeMax : -1,
			fluidVolume : 4.5,
			gravity : 9.81
		};
	}

	getRenderOptions(): RendererOptions {
		return {
			particleSize : 2,
			smoothingLength : WetDamBreak.SMOOTHING_LENGTH,
			drawValidationUntil: 1 // second
		};
	}

}
