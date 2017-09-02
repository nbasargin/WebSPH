import {Scenario} from "./Scenario";

import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";

export class DryDamBreak extends Scenario {

	getName(): string {
		return "Dry dam break";
	}

	getDescriptions(): string {
		return "Dry dam break description here";
	}

	getSimulationOptions(): SimulationOptions {
		let options = new SimulationOptions();

		// todo more settings here
		options.gravity = 9.81;
		options.smoothingLength = 1;


		return options;
	}

	getRenderOptions(): RendererOptions {
		let options = new RendererOptions();

		// todo more settings here
		options.particleSize = 2;

		return options;
	}

}
