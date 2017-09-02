import {Scenario} from "./Scenario";
import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";
import {IntegratorType, BoundaryType, GroundPreset, ParticleDistribution, TimeSteppingMode} from "../Enums";

export class WetDamBreak extends Scenario {


	getName(): string {
		return "Wet dam break";
	}

	getDescription(): string {
		return "Simulation of a dam break with some fluid behind the dam (standard dam break scenario)";
	}

	private static readonly SMOOTHING_LENGTH = 0.03;

	getSimulationOptions(): SimulationOptions {
		let options = new SimulationOptions();

		options.integratorType = IntegratorType.HEUN_STD;
		options.boundarySize = { xMin : -3, xMax : 3, yMin : -0.3, yMax : 1.1924 };
		options.boundaryType = BoundaryType.SOLID;
		options.groundPreset = GroundPreset.CONST_ZERO;
		options.smoothingLength = WetDamBreak.SMOOTHING_LENGTH;
		options.particleNumber = 750;
		options.particleDistribution =  ParticleDistribution.DAM_BREAK_WET;
		options.fixedTimeStep = 0.001;
		options.timeSteppingMode = TimeSteppingMode.STABLE;
		options.timeStepLimit = -1;
		options.timeStart = 0;
		options.timeMax = -1;
		options.fluidVolume = 4.75;
		options.gravity = 9.81;


		return options;
	}

	getRenderOptions(): RendererOptions {
		let options = new RendererOptions();

		options.particleSize = 2;
		options.smoothingLength = WetDamBreak.SMOOTHING_LENGTH;

		return options;
	}

}
