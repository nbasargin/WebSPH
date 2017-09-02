import {Scenario} from "./Scenario";

import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {IntegratorType, BoundaryType, GroundPreset, ParticleDistribution, TimeSteppingMode} from "../Enums";

export class DryDamBreak extends Scenario {

	getName(): string {
		return "Dry dam break";
	}

	getDescriptions(): string {
		return "Dry dam break description here";
	}


	private static readonly SMOOTHING_LENGTH = 0.1;

	getSimulationOptions(): SimulationOptions {
		let options = new SimulationOptions();

		//options.integratorType = IntegratorType.HEUN_STD;
		options.integratorType = IntegratorType.HEUN_FAST;
		//options.boundarySize = { xMin : -3, xMax : 3, yMin : -0.3, yMax : 1.1924 };
		options.boundarySize = { xMin : -3, xMax : 3, yMin : -0.2, yMax : 1.1924 };
		//options.boundaryType = BoundaryType.SOLID;
		options.boundaryType = BoundaryType.CYCLIC;
		options.groundPreset = GroundPreset.CONST_ZERO;
		options.smoothingLength = DryDamBreak.SMOOTHING_LENGTH;
		options.particleNumber = 750;
		options.particleDistribution = ParticleDistribution.DAM_BREAK_DRY;
		//options.fixedTimeStep = 0.001;
		options.fixedTimeStep = 0.002;
		//options.timeSteppingMode = TimeSteppingMode.STABLE;
		options.timeSteppingMode = TimeSteppingMode.FAST;
		//options.timeStepLimit = -1;
		options.timeStepLimit = 0.003;
		//options.timeStart = 0;
		options.timeStart = 0.001;
		options.timeMax = 0.5;
		options.fluidVolume = 3.5;
		options.gravity = 9.81;

		return options;
	}

	getRenderOptions(): RendererOptions {
		let options = new RendererOptions();

		options.particleSize = 10;
		options.smoothingLength = DryDamBreak.SMOOTHING_LENGTH / 2;

		return options;
	}

}
