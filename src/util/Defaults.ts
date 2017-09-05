import {SimulationOptions} from "../simulation/SimulationOptions";
import {WetDamBreak} from "./scenarios/WetDamBreak";
import {RendererOptions} from "../rendering/RendererOptions";

export class Defaults {

	public static readonly VERSION : string = require('../../package.json').version;

	public static getDefaultSimulationOptions() : SimulationOptions {
		return new WetDamBreak().getSimulationOptions();
	}

	public static getDefaultRendererOptions() : RendererOptions {
		return new WetDamBreak().getRenderOptions();
	}

}
