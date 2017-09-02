import {Scenario} from "./Scenario";
import {RendererOptions} from "../../rendering/RendererOptions";
import {SimulationOptions} from "../../simulation/SimulationOptions";

export class WetDamBreak extends Scenario {


	getName(): string {
		return "Wet dam break";
	}

	getDescriptions(): string {
		return "Wet dam break description here";
	}

	getSimulationOptions(): SimulationOptions {
		let options = new SimulationOptions();

		// todo more settings here
		options.gravity = 9.81;
		options.smoothingLength = 0.01;


		return options;
	}

	getRenderOptions(): RendererOptions {
		let options = new RendererOptions();

		// todo more settings here
		options.particleSize = 2;

		return options;
	}

}
